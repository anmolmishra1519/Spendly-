import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { categoryService } from '@/services/categoryService';
import { backupService } from '@/services/backupService';
import type { ThemeMode, CategoryRecord } from '@/types';
import { CategoryIcon, Pencil, Trash2, Plus, Download, Upload } from '@/components/icons';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted dark:text-muted-dark">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Settings() {
  const settings = useAppStore((s) => s.settings);
  const setTheme = useAppStore((s) => s.setTheme);
  const setUserName = useAppStore((s) => s.setUserName);
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const showToast = useAppStore((s) => s.showToast);

  const [nameInput, setNameInput] = useState(settings.userName);
  const [savingName, setSavingName] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<CategoryRecord | null>(null);
  const [deleteUsage, setDeleteUsage] = useState(0);
  const [reassignTo, setReassignTo] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await setUserName(trimmed);
      showToast('Name updated.', 'success');
    } finally {
      setSavingName(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory(newCategoryName.trim(), 'more-horizontal');
      setNewCategoryName('');
      showToast('Category added.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not add category.', 'error');
    }
  }

  async function openDelete(category: CategoryRecord) {
    const usage = await categoryService.usageCount(category.id);
    setDeleteUsage(usage);
    setDeletingCategory(category);
    setReassignTo(categories.find((c) => c.id !== category.id)?.id ?? '');
  }

  async function confirmDelete() {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id, deleteUsage > 0 ? reassignTo : undefined);
      showToast('Category deleted.', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete category.', 'error');
    } finally {
      setDeletingCategory(null);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      await backupService.importBackup(file);
      showToast('Backup imported successfully.', 'success');
      window.location.reload();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Unable to import this backup.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark">Settings</h2>
        <p className="text-sm text-muted dark:text-muted-dark">Manage your app preferences and data.</p>
      </div>

      <Section title="Profile">
        <form onSubmit={handleSaveName} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="flex-1 rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            disabled={savingName || !nameInput.trim()}
            className="rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            Save
          </button>
        </form>
      </Section>

      <Section title="Appearance">
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`flex-1 rounded-control border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                settings.theme === mode
                  ? 'border-brand bg-brand-light text-brand'
                  : 'border-border dark:border-border-dark text-ink dark:text-ink-dark hover:border-brand/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Currency">
        <div className="flex items-center justify-between rounded-control border border-border dark:border-border-dark px-3.5 py-2.5">
          <span className="text-sm text-ink dark:text-ink-dark">Indian Rupee</span>
          <span className="text-sm font-semibold text-brand">INR ₹</span>
        </div>
      </Section>

      <Section title="Categories" description="Add, rename, or remove spending categories.">
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-control border border-border dark:border-border-dark px-3.5 py-2.5">
              <CategoryIcon icon={c.icon} className="h-4 w-4" style={{ color: c.color }} />
              {editingCategory?.id === c.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-[8px] border border-brand bg-transparent px-2 py-1 text-sm text-ink dark:text-ink-dark"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && editName.trim()) {
                      await updateCategory(c.id, { name: editName.trim() });
                      setEditingCategory(null);
                    }
                  }}
                />
              ) : (
                <span className="flex-1 text-sm text-ink dark:text-ink-dark">{c.name}</span>
              )}
              {editingCategory?.id === c.id ? (
                <button
                  onClick={async () => {
                    if (editName.trim()) await updateCategory(c.id, { name: editName.trim() });
                    setEditingCategory(null);
                  }}
                  className="text-xs font-semibold text-brand"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingCategory(c);
                      setEditName(c.name);
                    }}
                    aria-label={`Edit ${c.name}`}
                    className="rounded-[8px] p-1.5 text-muted hover:bg-bg dark:hover:bg-white/10 hover:text-brand"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDelete(c)}
                    aria-label={`Delete ${c.name}`}
                    className="rounded-[8px] p-1.5 text-muted hover:bg-bg dark:hover:bg-white/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddCategory} className="mt-3 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
          />
          <button type="submit" className="flex items-center gap-1.5 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </Section>

      <Section title="Data Management" description="Your data stays on this device.">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => backupService.exportBackup()}
            className="flex items-center gap-2 rounded-control border border-border dark:border-border-dark px-4 py-2.5 text-sm font-semibold text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5"
          >
            <Download className="h-4 w-4" /> Export Backup
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-control border border-border dark:border-border-dark px-4 py-2.5 text-sm font-semibold text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5">
            <Upload className="h-4 w-4" /> Import Backup
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="flex items-center gap-2 rounded-control border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5"
          >
            <Trash2 className="h-4 w-4" /> Clear All Data
          </button>
        </div>
        {importError && <p className="mt-2.5 text-sm font-medium text-danger">{importError}</p>}
      </Section>

      <Section title="About">
        <p className="text-sm text-muted dark:text-muted-dark">
          Spendly — Student Expense Tracker. Your financial data is stored locally on this device and is never sent to
          a server. Version 1.0.0.
        </p>
      </Section>

      <ConfirmDialog
        open={!!deletingCategory}
        title={`Delete "${deletingCategory?.name}"?`}
        description={
          deleteUsage > 0
            ? `${deleteUsage} expense${deleteUsage === 1 ? '' : 's'} use this category. Choose where to move ${deleteUsage === 1 ? 'it' : 'them'} below, then confirm.`
            : 'This category has no expenses and can be safely removed.'
        }
        onCancel={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
      >
        {deletingCategory && deleteUsage > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Reassign expenses to</label>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="w-full rounded-control border border-border dark:border-border-dark bg-transparent px-3 py-2 text-sm text-ink dark:text-ink-dark"
            >
              {categories
                .filter((c) => c.id !== deletingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear all data?"
        description="This permanently deletes every month, expense, and category on this device. This cannot be undone."
        confirmLabel="Clear Data"
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={async () => {
          const { clearAllData } = useAppStore.getState();
          await clearAllData();
          setClearConfirmOpen(false);
          showToast('All data cleared.', 'info');
        }}
      />
    </div>
  );
}
