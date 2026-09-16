# Spendly — Student Expense Tracker

A local-first, offline personal expense tracker for college students.
Spendly never ships with sample data — every rupee shown in the app was
typed in by the person using it. No login, no accounts, no cloud — your
data stays on your device.

## Core rule

> **The user enters all data.** Fresh installs are empty: no months, no
> budgets, no expenses, no fake charts, no fake reports. Everything on
> screen is calculated live from what's actually stored in the local
> database.

`Available Money = Monthly Budget − Total Expenses`, recalculated instantly
on every add, edit, or delete.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. On first launch you'll see the onboarding
screen — tell it your name, create a month, and enter a budget to start
tracking.

```bash
npm run build      # production web build -> dist/
npm run preview    # preview the production build locally
```

See [PACKAGING.md](./PACKAGING.md) for Electron (`.exe`/`.dmg`) and
Capacitor (Android/iOS) packaging instructions.

## Architecture

```
src/
  components/   Reusable UI (cards, modals, nav, charts, icons)
  pages/        Route-level screens (Dashboard, Expenses, Calendar, …)
  layouts/      AppShell (sidebar + bottom nav + header + modals)
  hooks/        Derived-data hooks (summary, category breakdown)
  services/     Business logic — monthService, expenseService, etc.
  database/     IndexedDB layer + typed repositories
  models/       Default category presets (names/icons only — zero transactions)
  utils/        Calculations, currency formatting, date helpers
  types/        Shared TypeScript domain types
  stores/       zustand app store — the single source of UI state
  reports/      PDF report generation (jsPDF)
electron/       Electron main + preload (desktop shell)
capacitor.config.ts   Mobile shell config (Android/iOS)
```

UI components never touch the database directly — they call `services/*`,
which call the repositories in `database/repositories.ts`.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · zustand · React Router ·
Recharts · jsPDF · IndexedDB (via `idb`) · Electron · Capacitor

There is **no authentication, no backend, no Supabase, no admin panel** in
this app. If a build of this project ever shows a login screen, that's not
this source — a different project got mixed in during extraction.
