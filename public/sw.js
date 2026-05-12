/**
 * Waghamba Sports Hub - Network-First Service Worker
 * Optimizes for high-availability while ensuring latest institutional data.
 * Resolves 404 ChunkLoadErrors by prioritizing network for script/style chunks.
 */

const CACHE_NAME = 'wgb-institutional-v3.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network First, Fallback to Cache
  // This prevents 'ChunkLoadError' when the browser has old JS chunks cached
  
  const isStaticAsset = 
    event.request.destination === 'script' || 
    event.request.destination === 'style' ||
    event.request.url.includes('/_next/static/');

  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If network is successful, cache the response for later
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  }
});
