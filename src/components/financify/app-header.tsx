
'use client';

import { useAuth } from '@/context/auth-provider';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';

export default function AppHeader() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b glassmorphic px-2 sm:px-4 print:hidden">
      <div className="flex items-center gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
        >
          <path
            d="M32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33334 32 5.33334C17.2724 5.33334 5.33334 17.2724 5.33334 32C5.33334 46.7276 17.2724 58.6667 32 58.6667Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M21.3333 42.6667C21.3333 42.6667 24 34.6667 32 34.6667C40 34.6667 42.6667 42.6667 42.6667 42.6667"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40 26.6667C40 28.8758 38.2091 30.6667 36 30.6667C33.7909 30.6667 32 28.8758 32 26.6667C32 24.4576 33.7909 22.6667 36 22.6667C38.2091 22.6667 40 24.4576 40 26.6667Z"
            fill="currentColor"
          />
          <path
            d="M28 26.6667C28 28.8758 26.2091 30.6667 24 30.6667C21.7909 30.6667 20 28.8758 20 26.6667C20 24.4576 21.7909 22.6667 24 22.6667C26.2091 22.6667 28 24.4576 28 26.6667Z"
            fill="currentColor"
          />
        </svg>
        <div>
          <h1 className="text-lg font-bold">EmpowerMint</h1>
        </div>
      </div>
      <Link href="/profile">
         <Avatar className="h-9 w-9 border-2 border-primary/50">
            <AvatarFallback className="text-sm bg-muted">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
      </Link>
    </header>
  );
}
