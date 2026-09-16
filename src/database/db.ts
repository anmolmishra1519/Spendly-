import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { MonthRecord, CategoryRecord, ExpenseRecord, SettingsRecord } from '@/types';

/**
 * Local, offline-first persistence layer.
 *
 * We use IndexedDB in the browser/Electron renderer today. The schema below
 * intentionally mirrors the relational SQLite schema described in the spec
 * (months / categories / expenses / settings, related by id) so that this
 * layer can be swapped for a real SQLite implementation (e.g. better-sqlite3
 * running in the Electron main process, bridged over IPC) without touching
 * any service or UI code — only this file and database/repositories.ts
 * would need to change.
 */

export const DB_NAME = 'spendly-db';
export const DB_VERSION = 1;

interface SpendlyDBSchema extends DBSchema {
  months: {
    key: string;
    value: MonthRecord;
    indexes: { 'by-year-month': [number, number] };
  };
  categories: {
    key: string;
    value: CategoryRecord;
  };
  expenses: {
    key: string;
    value: ExpenseRecord;
    indexes: { 'by-month': string; 'by-category': string; 'by-date': string };
  };
  settings: {
    key: string;
    value: SettingsRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<SpendlyDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<SpendlyDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<SpendlyDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('months')) {
          const store = db.createObjectStore('months', { keyPath: 'id' });
          store.createIndex('by-year-month', ['year', 'month']);
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id' });
          store.createIndex('by-month', 'monthId');
          store.createIndex('by-category', 'categoryId');
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}
