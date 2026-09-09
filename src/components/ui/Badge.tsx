interface Props {
  children: React.ReactNode;
  status?: 'up' | 'down' | 'error' | 'neutral';
}

export function Badge({ children, status = 'neutral' }: Props) {
  const map = {
    up: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    down: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    error: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-net-700 dark:text-slate-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {children}
    </span>
  );
}
