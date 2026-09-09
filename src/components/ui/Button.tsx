import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cisco-500 focus:ring-offset-2 disabled:opacity-50';
  const variants = {
    primary: 'bg-cisco-600 text-white hover:bg-cisco-700 dark:bg-cisco-600 dark:hover:bg-cisco-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-net-700 dark:text-slate-100 dark:hover:bg-net-600',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-net-800',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
