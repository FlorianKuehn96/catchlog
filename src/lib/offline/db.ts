// IndexedDB für Offline-Speicherung

const DB_NAME = 'CatchLogDB';
const DB_VERSION = 1;

export interface OfflineCatch {
  id: string;
  userId: string;
  spotId: string;
  species: string;
  length?: number;
  weight?: number;
  bait: string;
  technique?: string;
  timestamp: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  catchLat?: number;
  catchLng?: number;
  weather?: {
    temp: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    conditions: string;
  };
  sunPosition?: {
    hoursFromSunrise: number;
    hoursFromSunset: number;
    phase: 'dawn' | 'day' | 'dusk' | 'night';
  };
  notes?: string;
  photoUrl?: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OfflineSpot {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  type: 'lake' | 'river' | 'pond' | 'canal' | 'sea';
  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'catch' | 'spot' | 'delete_catch' | 'delete_spot' | 'update_catch' | 'update_spot';
  data: unknown;
  timestamp: number;
  retries: number;
  error?: string;
}

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Catches store
      if (!db.objectStoreNames.contains('catches')) {
        const catchStore = db.createObjectStore('catches', { keyPath: 'id' });
        catchStore.createIndex('userId', 'userId', { unique: false });
        catchStore.createIndex('synced', 'synced', { unique: false });
        catchStore.createIndex('spotId', 'spotId', { unique: false });
      }

      // Spots store
      if (!db.objectStoreNames.contains('spots')) {
        const spotStore = db.createObjectStore('spots', { keyPath: 'id' });
        spotStore.createIndex('userId', 'userId', { unique: false });
        spotStore.createIndex('synced', 'synced', { unique: false });
      }

      // Sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
}

export async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

// Catches
export async function saveCatchLocally(catchData: Omit<OfflineCatch, 'synced' | 'createdAt' | 'updatedAt'>): Promise<OfflineCatch> {
  const db = await getDB();
  const now = Date.now();
  const offlineCatch: OfflineCatch = {
    ...catchData,
    synced: false,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readwrite');
    const store = transaction.objectStore('catches');
    const request = store.put(offlineCatch);

    request.onsuccess = () => resolve(offlineCatch);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalCatches(userId: string): Promise<OfflineCatch[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readonly');
    const store = transaction.objectStore('catches');
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const catches = request.result as OfflineCatch[];
      // Sort by timestamp desc
      catches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(catches);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateLocalCatch(id: string, updates: Partial<OfflineCatch>): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readwrite');
    const store = transaction.objectStore('catches');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as OfflineCatch | undefined;
      if (!existing) {
        reject(new Error('Catch not found'));
        return;
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
        synced: false,
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteLocalCatch(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readwrite');
    const store = transaction.objectStore('catches');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function markCatchSynced(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readwrite');
    const store = transaction.objectStore('catches');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as OfflineCatch | undefined;
      if (!existing) {
        resolve();
        return;
      }

      existing.synced = true;
      existing.updatedAt = Date.now();

      const putRequest = store.put(existing);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Spots
export async function saveSpotLocally(spotData: Omit<OfflineSpot, 'synced'>): Promise<OfflineSpot> {
  const db = await getDB();
  const offlineSpot: OfflineSpot = {
    ...spotData,
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readwrite');
    const store = transaction.objectStore('spots');
    const request = store.put(offlineSpot);

    request.onsuccess = () => resolve(offlineSpot);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalSpots(userId: string): Promise<OfflineSpot[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readonly');
    const store = transaction.objectStore('spots');
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => resolve(request.result as OfflineSpot[]);
    request.onerror = () => reject(request.error);
  });
}

export async function updateLocalSpot(id: string, updates: Partial<OfflineSpot>): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readwrite');
    const store = transaction.objectStore('spots');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as OfflineSpot | undefined;
      if (!existing) {
        reject(new Error('Spot not found'));
        return;
      }

      const updated = {
        ...existing,
        ...updates,
        synced: false,
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteLocalSpot(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readwrite');
    const store = transaction.objectStore('spots');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function markSpotSynced(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readwrite');
    const store = transaction.objectStore('spots');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as OfflineSpot | undefined;
      if (!existing) {
        resolve();
        return;
      }

      existing.synced = true;

      const putRequest = store.put(existing);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Sync Queue
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const db = await getDB();

  const queueItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.put(queueItem);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function incrementRetryCount(id: string, error?: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as SyncQueueItem | undefined;
      if (!existing) {
        resolve();
        return;
      }

      existing.retries++;
      if (error) existing.error = error;

      const putRequest = store.put(existing);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Metadata
export async function setMetadata(key: string, value: unknown): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata'], 'readwrite');
    const store = transaction.objectStore('metadata');
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getMetadata(key: string): Promise<unknown | undefined> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata'], 'readonly');
    const store = transaction.objectStore('metadata');
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result as { value: unknown } | undefined;
      resolve(result?.value);
    };
    request.onerror = () => reject(request.error);
  });
}

// Clear all data (for logout)
export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches', 'spots', 'syncQueue'], 'readwrite');
    
    transaction.objectStore('catches').clear();
    transaction.objectStore('spots').clear();
    transaction.objectStore('syncQueue').clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Migration from server data
export async function syncCatchesFromServer(catches: OfflineCatch[], userId: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches'], 'readwrite');
    const store = transaction.objectStore('catches');

    // Get existing local catches that are not synced
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const existing = request.result as OfflineCatch[];
      const unsynced = existing.filter(c => !c.synced);

      // Clear and re-add with synced flag
      catches.forEach(c => {
        const syncedCatch: OfflineCatch = {
          ...c,
          userId,
          synced: true,
          createdAt: c.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        store.put(syncedCatch);
      });

      // Re-add unsynced catches
      unsynced.forEach(c => {
        store.put(c);
      });
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function syncSpotsFromServer(spots: OfflineSpot[], userId: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['spots'], 'readwrite');
    const store = transaction.objectStore('spots');

    // Get existing local spots that are not synced
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const existing = request.result as OfflineSpot[];
      const unsynced = existing.filter(s => !s.synced);

      // Clear and re-add with synced flag
      spots.forEach(s => {
        const syncedSpot: OfflineSpot = {
          ...s,
          userId,
          synced: true,
        };
        store.put(syncedSpot);
      });

      // Re-add unsynced spots
      unsynced.forEach(s => {
        store.put(s);
      });
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}