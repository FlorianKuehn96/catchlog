'use client';

import { useState, useEffect } from 'react';
import { useSync, useNetworkStatus } from '@/lib/offline';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const { sync, isSyncing, pendingCount, lastSync, syncError } = useSync();
  const [showDetails, setShowDetails] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSync) return 'Nie synchronisiert';
    const diff = Date.now() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `Vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Vor ${hours} Std.`;
    return lastSync.toLocaleDateString('de-DE');
  };

  if (isOnline && pendingCount === 0 && !syncError) return null;

  return (
    <>
      {/* Main indicator */}
      <div
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showDetails ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {!isOnline ? (
          <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">Offline-Modus</span>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount} ausstehend
              </span>
            )}
          </div>
        ) : pendingCount > 0 ? (
          <button
            onClick={() => setShowDetails(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">{pendingCount} zum Sync</span>
          </button>
        ) : syncError ? (
          <button
            onClick={() => setShowDetails(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Sync-Fehler</span>
          </button>
        ) : null}
      </div>

      {/* Detail modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {!isOnline ? 'Offline-Modus' : syncError ? 'Synchronisation' : 'Synchronisation'}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {!isOnline ? (
                <div className="text-center py-4">
                  <div className="text-amber-500 text-4xl mb-2">📴</div>
                  <p className="text-gray-600">
                    Du bist offline. Deine Änderungen werden lokal gespeichert und synchronisiert, sobald die Verbindung wiederhergestellt ist.
                  </p>
                  {pendingCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      {pendingCount} {pendingCount === 1 ? 'Änderung' : 'Änderungen'} ausstehend
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={syncError ? 'text-red-600' : 'text-green-600'}>
                        {syncError ? 'Fehler' : 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Letzter Sync:</span>
                      <span className="text-gray-900">{formatLastSync()}</span>
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ausstehend:</span>
                        <span className="text-amber-600 font-medium">{pendingCount} Elemente</span>
                      </div>
                    )}
                  </div>

                  {syncError && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                      {syncError}
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      await sync();
                    }}
                    disabled={isSyncing || !isOnline}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Synchronisiere...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Jetzt synchronisieren</span>
                      </>
                    )}
                  </button>

                  {isIOS && pendingCount > 0 && (
                    <p className="text-xs text-gray-500 text-center">
                      💡 Tipp: Auf iOS bleibt die App im Hintergrund aktiv, während der Sync läuft.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}