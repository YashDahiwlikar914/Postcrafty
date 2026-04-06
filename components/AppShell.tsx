'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/AppSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen p-4 lg:p-8">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AppSidebar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
