// Offline-Modul Index

export {
  initDB,
  getDB,
  saveCatchLocally,
  getLocalCatches,
  updateLocalCatch,
  deleteLocalCatch,
  markCatchSynced,
  saveSpotLocally,
  getLocalSpots,
  updateLocalSpot,
  deleteLocalSpot,
  markSpotSynced,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  setMetadata,
  getMetadata,
  clearAllLocalData,
  syncCatchesFromServer,
  syncSpotsFromServer,
} from './db';

export type {
  OfflineCatch,
  OfflineSpot,
  SyncQueueItem,
} from './db';

export {
  useNetworkStatus,
  useOfflineCatches,
  useOfflineSpots,
  useSync,
  useOfflineReady,
} from './hooks';