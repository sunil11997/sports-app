/**
 * Waghamba Sports Hub - Network-First Service Worker (v3.2)
 * 
 * STRATEGY: Network First (Falling back to Cache)
 * This is the standard fix for Next.js 404 ChunkLoadErrors and "reading 'call'" bundle crashes.
 * It ensures the browser always tries to get the latest code from the server first.
 */

const CACHE_NAME = 'wgb-hub-v3.2';

// Force immediate activation to solve the "old app showing" problem
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('WGB: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network request is successful, clone it to the cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // If network fails (Offline), serve from cache
        return caches.match(event.request);
      })
  );
});
