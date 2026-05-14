/**
 * Waghamba Sports Hub - Network-First Service Worker
 * Resolves: ChunkLoadErrors, Offline Stability, and Institutional Continuity.
 */

const CACHE_NAME = 'wgb-institutional-v3.1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for internal resources
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If fresh network response, clone it to cache
        if (response && response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request).then(response => {
          return response || caches.match(OFFLINE_URL);
        });
      })
  );
});
