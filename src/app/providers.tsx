'use client';

import { useEffect, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { initDB } from '@/lib/offline/db';

export function Providers({ children }: { children: ReactNode }) {
  // Initialize IndexedDB on mount
  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      initDB().catch(console.error);
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}