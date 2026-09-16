import { v4 as uuid } from 'uuid';
import { categoriesRepo, expensesRepo } from '@/database/repositories';
import type { CategoryRecord } from '@/types';
import { DEFAULT_CATEGORY_SEEDS } from '@/models/defaultCategories';

// Guards against ensureDefaults() running concurrently (e.g. React
// StrictMode double-invoking effects), which previously could create
// duplicate "Food", "Food" rows in a single session.
let seedingPromise: Promise<void> | null = null;

export const categoryService = {
  /** Idempotently seeds the default category list. Zero transactions attached. */
  async ensureDefaults(): Promise<void> {
    if (!seedingPromise) {
      seedingPromise = (async () => {
        const existing = await categoriesRepo.getAll();
        if (existing.length === 0) {
          const now = new Date().toISOString();
          for (const seed of DEFAULT_CATEGORY_SEEDS) {
            await categoriesRepo.put({
              id: uuid(),
              name: seed.name,
              icon: seed.icon,
              color: seed.color,
              isDefault: true,
              createdAt: now,
            });
          }
        } else {
          // Repairs data from any earlier duplicate-seeding run.
          await this.dedupeCategories(existing);
        }
      })();
    }
    return seedingPromise;
  },

  /**
   * Merges categories that share the same name (case-insensitive), keeping
   * the oldest record and moving any expenses on the duplicates over to it
   * before deleting them.
   */
  async dedupeCategories(existing: CategoryRecord[]): Promise<void> {
    const groups = new Map<string, CategoryRecord[]>();
    for (const c of existing) {
      const key = c.name.trim().toLowerCase();
      const group = groups.get(key) ?? [];
      group.push(c);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      if (group.length <= 1) continue;
      group.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const [keep, ...duplicates] = group;
      for (const dup of duplicates) {
        const dupExpenses = await expensesRepo.getByCategory(dup.id);
        for (const e of dupExpenses) {
          await expensesRepo.put({ ...e, categoryId: keep.id, updatedAt: new Date().toISOString() });
        }
        await categoriesRepo.delete(dup.id);
      }
    }
  },

  async getAll(): Promise<CategoryRecord[]> {
    return categoriesRepo.getAll();
  },

  async create(name: string, icon: string, color?: string): Promise<CategoryRecord> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name is required.');
    const record: CategoryRecord = {
      id: uuid(),
      name: trimmed,
      icon,
      color,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    await categoriesRepo.put(record);
    return record;
  },

  async update(id: string, patch: Partial<Pick<CategoryRecord, 'name' | 'icon' | 'color'>>): Promise<CategoryRecord> {
    const existing = await categoriesRepo.getById(id);
    if (!existing) throw new Error('Category not found.');
    const updated: CategoryRecord = { ...existing, ...patch };
    await categoriesRepo.put(updated);
    return updated;
  },

  /** Returns the count of expenses attached to a category, so the UI can warn before deletion. */
  async usageCount(id: string): Promise<number> {
    const expenses = await expensesRepo.getByCategory(id);
    return expenses.length;
  },

  /**
   * Deletes a category. If reassignCategoryId is provided, all of its
   * expenses are moved there first; otherwise deletion is blocked when
   * expenses exist (the caller/UI is responsible for confirming intent).
   */
  async delete(id: string, reassignCategoryId?: string): Promise<void> {
    const usage = await this.usageCount(id);
    if (usage > 0) {
      if (!reassignCategoryId) {
        throw new Error('Reassign or confirm deletion for expenses in this category first.');
      }
      const expenses = await expensesRepo.getByCategory(id);
      for (const e of expenses) {
        await expensesRepo.put({ ...e, categoryId: reassignCategoryId, updatedAt: new Date().toISOString() });
      }
    }
    await categoriesRepo.delete(id);
  },
};
