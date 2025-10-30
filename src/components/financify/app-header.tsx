
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
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M12 7C9.24 7 7 9.24 7 12H9C9 10.34 10.34 9 12 9V7Z"
            fill="currentColor"
          />
          <path
            d="M12 11C10.9 11 10 11.9 10 13H14C14 11.9 13.1 11 12 11Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M12 15C10.34 15 9 16.34 9 18H15C15 16.34 13.66 15 12 15Z"
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
