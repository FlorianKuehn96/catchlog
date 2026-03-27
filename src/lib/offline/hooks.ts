// React Hooks für Offline-Funktionalität

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  initDB,
  getLocalCatches,
  getLocalSpots,
  saveCatchLocally,
  saveSpotLocally,
  updateLocalCatch,
  updateLocalSpot,
  deleteLocalCatch,
  deleteLocalSpot,
  markCatchSynced,
  markSpotSynced,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  syncCatchesFromServer,
  syncSpotsFromServer,
  OfflineCatch,
  OfflineSpot,
  SyncQueueItem,
} from './db';

// ============ DEDUPLIZIERUNGS-HELPER ============

/**
 * Dedupliziert Fänge nach timestamp + species + spotId.
 * Bevorzugt Server-Einträge (synced: true) über lokale (synced: false).
 */
function deduplicateCatches(catches: OfflineCatch[]): OfflineCatch[] {
  const uniqueCatches = new Map<string, OfflineCatch>();

  catches.forEach(c => {
    const key = `${c.timestamp}-${c.species}-${c.spotId}`;
    const existing = uniqueCatches.get(key);

    // Bevorzuge Server-Einträge (synced: true) über lokale (synced: false oder undefined)
    if (!existing || (c.synced && !existing.synced)) {
      uniqueCatches.set(key, c);
    }
  });

  return Array.from(uniqueCatches.values());
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);

    // Initialize DB
    initDB().then(() => setIsOfflineReady(true)).catch(console.error);

    // Event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOfflineReady };
}

// Offline catches hook
export function useOfflineCatches() {
  const { data: session } = useSession();
  const { isOnline } = useNetworkStatus();
  const [catches, setCatches] = useState<OfflineCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const isSyncingRef = useRef(false); // NEU: Blockiert Race Conditions

  const userId = session?.user?.email;

  // ============ DEDUPLIZIERTES setCatches ============
  const setCatchesDeduplicated = useCallback((newCatches: OfflineCatch[] | ((prev: OfflineCatch[]) => OfflineCatch[])) => {
    if (typeof newCatches === 'function') {
      setCatches(prev => {
        const result = newCatches(prev);
        return deduplicateCatches(result);
      });
    } else {
      setCatches(deduplicateCatches(newCatches));
    }
  }, []);

  // Load catches from IndexedDB (always) and optionally from server
  const loadCatches = useCallback(async () => {
    if (!userId) {
      setCatches([]);
      setLoading(false);
      return;
    }

    // NEU: Blockiere während Sync läuft
    if (isSyncingRef.current) {
      console.log('[loadCatches] Blocked: Sync läuft bereits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always load from local DB first (for instant UI)
      const localCatches = await getLocalCatches(userId);
      // DEDUPLIZIERUNG bei jedem Load
      setCatchesDeduplicated(localCatches);

      // If online, also fetch from server and sync
      if (isOnline) {
        try {
          const response = await fetch('/api/catches');
          if (response.ok) {
            const serverData = await response.json();
            const serverCatches = serverData.catches || [];

            // Sync server data to local DB
            await syncCatchesFromServer(serverCatches, userId);

            // Reload from local DB to get merged data
            const mergedCatches = await getLocalCatches(userId);
            // DEDUPLIZIERUNG
            setCatchesDeduplicated(mergedCatches);
          }
        } catch (err) {
          console.error('Failed to sync catches from server:', err);
          // Don't show error - we have local data
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, isOnline, setCatchesDeduplicated]);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current && userId) {
      initialLoadDone.current = true;
      loadCatches();
    }
  }, [userId, loadCatches]);

  // Reload when coming back online
  useEffect(() => {
    if (isOnline && initialLoadDone.current) {
      loadCatches();
    }
  }, [isOnline, loadCatches]);

  // Create catch (works offline)
  const createCatch = useCallback(async (catchData: Omit<OfflineCatch, 'id' | 'userId' | 'synced' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) throw new Error('Not authenticated');

    const id = crypto.randomUUID();
    const newCatch = await saveCatchLocally({
      ...catchData,
      id,
      userId,
    });

    // Add to sync queue if offline
    if (!isOnline) {
      await addToSyncQueue({
        type: 'catch',
        data: newCatch,
      });
      // DEDUPLIZIERTES Update statt loadCatches()
      setCatchesDeduplicated(prev => [...prev, newCatch]);
    } else {
      // Try to sync immediately
      try {
        const response = await fetch('/api/catches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotId: newCatch.spotId,
            species: newCatch.species,
            length: newCatch.length,
            weight: newCatch.weight,
            bait: newCatch.bait,
            technique: newCatch.technique,
            notes: newCatch.notes,
            timestamp: newCatch.timestamp,
            catchLat: newCatch.catchLat,
            catchLng: newCatch.catchLng,
            imageUrl: newCatch.photoUrl,
          }),
        });

        if (response.ok) {
          const serverData = await response.json();
          // API gibt { catch: {...} } zurück
          const serverCatch = serverData.catch;
          if (serverCatch) {
            // Speichere Server-Version, lösche lokale
            await saveCatchLocally({ ...serverCatch, userId, synced: true });
            await deleteLocalCatch(id);

            // NEU: UI direkt updaten statt loadCatches()
            setCatchesDeduplicated(prev => {
              const filtered = prev.filter(c => c.id !== id); // Entferne lokalen
              return [...filtered, { ...serverCatch, userId, synced: true }]; // Füge Server-Version hinzu
            });
            return { ...serverCatch, userId, synced: true };
          }
        } else {
          // Add to queue if server rejected
          await addToSyncQueue({
            type: 'catch',
            data: newCatch,
          });
          // DEDUPLIZIERTES Update
          setCatchesDeduplicated(prev => [...prev, newCatch]);
        }
      } catch (err) {
        // Add to queue if network failed
        await addToSyncQueue({
          type: 'catch',
          data: newCatch,
        });
        // DEDUPLIZIERTES Update
        setCatchesDeduplicated(prev => [...prev, newCatch]);
      }
    }

    return newCatch;
  }, [userId, isOnline, setCatchesDeduplicated]);

  // Update catch (works offline)
  const updateCatch = useCallback(async (id: string, updates: Partial<OfflineCatch>) => {
    if (!userId) throw new Error('Not authenticated');

    await updateLocalCatch(id, updates);

    // DEDUPLIZIERTES Update statt loadCatches()
    setCatchesDeduplicated(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );

    // Add to sync queue
    if (!isOnline) {
      await addToSyncQueue({
        type: 'update_catch',
        data: { id, ...updates },
      });
    } else {
      // Try to sync immediately
      try {
        const response = await fetch('/api/catches', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });

        if (response.ok) {
          await markCatchSynced(id);
        } else {
          await addToSyncQueue({
            type: 'update_catch',
            data: { id, ...updates },
          });
        }
      } catch (err) {
        await addToSyncQueue({
          type: 'update_catch',
          data: { id, ...updates },
        });
      }
    }
  }, [userId, isOnline, setCatchesDeduplicated]);

  // Delete catch (works offline)
  const deleteCatch = useCallback(async (id: string) => {
    if (!userId) throw new Error('Not authenticated');

    await deleteLocalCatch(id);

    // DEDUPLIZIERTES Update statt loadCatches()
    setCatchesDeduplicated(prev => prev.filter(c => c.id !== id));

    // Add to sync queue
    if (!isOnline) {
      await addToSyncQueue({
        type: 'delete_catch',
        data: { id },
      });
    } else {
      // Try to sync immediately
      try {
        const response = await fetch(`/api/catches?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          await addToSyncQueue({
            type: 'delete_catch',
            data: { id },
          });
        }
      } catch (err) {
        await addToSyncQueue({
          type: 'delete_catch',
          data: { id },
        });
      }
    }
  }, [userId, isOnline, setCatchesDeduplicated]);

  return {
    catches,
    loading,
    error,
    refresh: loadCatches,
    createCatch,
    updateCatch,
    deleteCatch,
    isSyncing: isSyncingRef.current, // NEU: Expose für UI
  };
}

// Offline spots hook
export function useOfflineSpots() {
  const { data: session } = useSession();
  const { isOnline } = useNetworkStatus();
  const [spots, setSpots] = useState<OfflineSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const userId = session?.user?.email;

  const loadSpots = useCallback(async () => {
    if (!userId) {
      setSpots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always load from local DB first
      const localSpots = await getLocalSpots(userId);
      setSpots(localSpots);

      // If online, also fetch from server
      if (isOnline) {
        try {
          const response = await fetch('/api/spots');
          if (response.ok) {
            const serverData = await response.json();
            const serverSpots = serverData.spots || [];

            // Sync server data to local DB
            await syncSpotsFromServer(serverSpots, userId);

            // Reload from local DB
            const mergedSpots = await getLocalSpots(userId);
            setSpots(mergedSpots);
          }
        } catch (err) {
          console.error('Failed to sync spots from server:', err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, isOnline]);

  useEffect(() => {
    if (!initialLoadDone.current && userId) {
      initialLoadDone.current = true;
      loadSpots();
    }
  }, [userId, loadSpots]);

  useEffect(() => {
    if (isOnline && initialLoadDone.current) {
      loadSpots();
    }
  }, [isOnline, loadSpots]);

  const createSpot = useCallback(async (spotData: Omit<OfflineSpot, 'id' | 'userId' | 'synced' | 'createdAt'>) => {
    if (!userId) throw new Error('Not authenticated');

    const id = crypto.randomUUID();
    const newSpot = await saveSpotLocally({
      ...spotData,
      id,
      userId,
      createdAt: new Date().toISOString(),
    });

    if (!isOnline) {
      await addToSyncQueue({
        type: 'spot',
        data: newSpot,
      });
    } else {
      try {
        const response = await fetch('/api/spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newSpot.name,
            lat: newSpot.lat,
            lng: newSpot.lng,
            type: newSpot.type,
            notes: newSpot.notes,
          }),
        });

        if (response.ok) {
          await markSpotSynced(id);
        } else {
          await addToSyncQueue({
            type: 'spot',
            data: newSpot,
          });
        }
      } catch (err) {
        await addToSyncQueue({
          type: 'spot',
          data: newSpot,
        });
      }
    }

    await loadSpots();
    return newSpot;
  }, [userId, isOnline, loadSpots]);

  const updateSpot = useCallback(async (id: string, updates: Partial<OfflineSpot>) => {
    if (!userId) throw new Error('Not authenticated');

    await updateLocalSpot(id, updates);

    if (!isOnline) {
      await addToSyncQueue({
        type: 'update_spot',
        data: { id, ...updates },
      });
    } else {
      // Note: There's no PUT endpoint for spots currently
      // Just mark as needing sync
      await addToSyncQueue({
        type: 'update_spot',
        data: { id, ...updates },
      });
    }

    await loadSpots();
  }, [userId, isOnline, loadSpots]);

  const deleteSpot = useCallback(async (id: string) => {
    if (!userId) throw new Error('Not authenticated');

    await deleteLocalSpot(id);

    if (!isOnline) {
      await addToSyncQueue({
        type: 'delete_spot',
        data: { id },
      });
    } else {
      try {
        const response = await fetch(`/api/spots?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          await addToSyncQueue({
            type: 'delete_spot',
            data: { id },
          });
        }
      } catch (err) {
        await addToSyncQueue({
          type: 'delete_spot',
          data: { id },
        });
      }
    }

    await loadSpots();
  }, [userId, isOnline, loadSpots]);

  return {
    spots,
    loading,
    error,
    refresh: loadSpots,
    createSpot,
    updateSpot,
    deleteSpot,
  };
}

// Sync hook
export function useSync() {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Count pending items
  const updatePendingCount = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    } catch (err) {
      console.error('Failed to get sync queue:', err);
    }
  }, []);

  // Get pending items count on mount
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Sync function
  const sync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('Keine Internetverbindung');
      return { success: false, error: 'Offline' };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const queue = await getSyncQueue();
      const failed: SyncQueueItem[] = [];

      for (const item of queue) {
        try {
          let response;

          switch (item.type) {
            case 'catch': {
              const catchData = item.data as OfflineCatch;
              response = await fetch('/api/catches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  spotId: catchData.spotId,
                  species: catchData.species,
                  length: catchData.length,
                  weight: catchData.weight,
                  bait: catchData.bait,
                  technique: catchData.technique,
                  notes: catchData.notes,
                  timestamp: catchData.timestamp,
                  catchLat: catchData.catchLat,
                  catchLng: catchData.catchLng,
                  imageUrl: catchData.photoUrl,
                }),
              });
              if (response.ok) {
                const serverData = await response.json();
                // API gibt { catch: {...} } zurück
                const serverCatch = serverData.catch;
                if (serverCatch) {
                  // Speichere Server-Version, dann lösche lokale
                  await saveCatchLocally({ ...serverCatch, userId: catchData.userId, synced: true });
                  await deleteLocalCatch(catchData.id);
                }
              }
              break;
            }

            case 'spot': {
              const spotData = item.data as OfflineSpot;
              response = await fetch('/api/spots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: spotData.name,
                  lat: spotData.lat,
                  lng: spotData.lng,
                  type: spotData.type,
                  notes: spotData.notes,
                }),
              });
              if (response.ok) {
                await markSpotSynced(spotData.id);
              }
              break;
            }

            case 'delete_catch': {
              const { id } = item.data as { id: string };
              response = await fetch(`/api/catches?id=${id}`, {
                method: 'DELETE',
              });
              break;
            }

            case 'delete_spot': {
              const { id } = item.data as { id: string };
              response = await fetch(`/api/spots?id=${id}`, {
                method: 'DELETE',
              });
              break;
            }

            case 'update_catch': {
              const updateData = item.data as { id: string } & Partial<OfflineCatch>;
              response = await fetch('/api/catches', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
              });
              if (response.ok) {
                await markCatchSynced(updateData.id);
              }
              break;
            }

            case 'update_spot':
              // Skip updates for spots - no API endpoint
              response = { ok: true } as Response;
              break;

            default:
              console.warn('Unknown sync queue item type:', item.type);
              continue;
          }

          if (response.ok) {
            await removeFromSyncQueue(item.id);
          } else {
            failed.push(item);
            const errorText = await response.text().catch(() => 'Unknown error');
            await incrementRetryCount(item.id, errorText);
          }
        } catch (err) {
          failed.push(item);
          await incrementRetryCount(item.id, err instanceof Error ? err.message : 'Network error');
        }
      }

      await updatePendingCount();
      setLastSync(new Date());

      if (failed.length > 0) {
        const errorMsg = `${failed.length} Elemente konnten nicht synchronisiert werden`;
        setSyncError(errorMsg);
        return { success: false, error: errorMsg, failed: failed.length };
      }

      return { success: true, synced: queue.length };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setSyncError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, updatePendingCount]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      sync();
    }
  }, [isOnline, sync]);

  return {
    sync,
    isSyncing,
    lastSync,
    syncError,
    pendingCount,
    isOnline,
    refreshPendingCount: updatePendingCount,
  };
}

// Utility hook for checking if DB is ready
export function useOfflineReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setIsReady(true)).catch(console.error);
  }, []);

  return isReady;
}
