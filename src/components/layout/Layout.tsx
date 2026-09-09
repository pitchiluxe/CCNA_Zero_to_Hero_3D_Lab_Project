import { ReactNode } from 'react';
import { Header } from './Header';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
