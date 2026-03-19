'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm font-medium">Offline-Modus</span>
      </div>
    </div>
  );
}
