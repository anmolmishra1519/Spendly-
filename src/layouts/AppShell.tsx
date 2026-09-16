import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { ToastHost } from '@/components/Toast';
import { AddExpenseModal } from '@/components/AddExpenseModal';

export function AppShell({ subtitle }: { subtitle?: string }) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-bg dark:bg-bg-dark">
      <Sidebar />
      <div className="flex min-h-[100dvh] flex-1 flex-col pb-20 md:pb-0">
        <Header subtitle={subtitle} />
        <main className="flex-1 px-4 py-5 md:px-8 md:py-7">
          <Outlet context={{ openAddExpense: () => setAddOpen(true) }} />
        </main>
      </div>
      <BottomNav onAddExpense={() => setAddOpen(true)} />
      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ToastHost />
    </div>
  );
}
