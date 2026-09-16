import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-ink dark:text-ink-dark">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-muted dark:text-muted-dark">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
