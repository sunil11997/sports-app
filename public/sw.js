/**
 * Waghamba Institutional Service Worker - Network-First V3.2
 * Optimized for high-availability sports management on Android.
 */

const CACHE_NAME = 'wgb-institutional-cache-v3.2';

// 1. Force update lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 2. Network-First Strategy for Next.js 15 Chunks
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for internal resources
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid response, clone and cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request);
      })
  );
});
