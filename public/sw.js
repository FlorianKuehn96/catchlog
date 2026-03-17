const CACHE_NAME = 'catchlog-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
];

// Install: Cache statische Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-First Strategie
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // API Requests nicht cachen
  if (request.url.includes('/api/')) {
    return;
  }
  
  // Auth nicht cachen
  if (request.url.includes('/api/auth')) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Im Hintergrund aktualisieren (Stale-While-Revalidate)
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {
          // Offline - Cached Version behalten
        });
        return cached;
      }
      
      // Nicht im Cache - vom Netzwerk holen
      return fetch(request).then((response) => {
        // Nur erfolgreiche Responses cachen
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Offline und nicht im Cache
      if (request.mode === 'navigate') {
        return caches.match('/dashboard');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});
