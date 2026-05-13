/**
 * Waghamba Sports Hub - Network-First Service Worker
 * 
 * STRATEGY: Network First (Falling back to Cache)
 * This ensures the user always sees the latest institutional data and code chunks,
 * while maintaining offline availability for remote areas.
 */

const CACHE_NAME = 'wgb-institutional-cache-v3.2';

// 1. Install Event - Force Activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and cache it
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      })
  );
});