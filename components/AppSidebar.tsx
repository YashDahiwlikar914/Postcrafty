'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  {
    href: '/',
    label: 'Generate Post',
    icon: (
      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'History',
    icon: (
      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/style-setup',
    label: 'Style Setup',
    icon: (
      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full lg:w-72 glass-card p-4 lg:p-6 m-2 lg:m-4 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start">
      <div className="mb-0 lg:mb-8 w-full flex items-center justify-between">
        <div>
        <h1 className="text-2xl lg:text-3xl font-medium gradient-text mb-1 lg:mb-2">Postcraft</h1>
        <p className="text-xs lg:text-sm text-muted hidden lg:block">AI-powered content creation</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex lg:flex-col lg:space-y-2 gap-2 lg:gap-0 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald text-void border border-border'
                  : 'hover:bg-panel/50 text-muted'
              }`}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:block pt-6 border-t border-border/50 w-full relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-panel/50 transition-all"
        >
          {session?.user?.image ? (
            <Image src={session.user.image} alt="User avatar" width={40} height={40} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-panel/70 border border-border/40 flex items-center justify-center text-frost font-bold">
              {(session?.user?.name || 'U').charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-frost">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted/70">{session?.user?.email || ''}</p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute bottom-16 left-0 w-full glass-card p-2 z-20">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-3 py-2 rounded-lg bg-emerald text-void hover:bg-emerald/90 transition-all"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
