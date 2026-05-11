/**
 * Waghamba Sports Hub - Service Worker
 * Enables offline capability and satisfies PWA installability requirements.
 */

const CACHE_NAME = 'wgb-sports-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * MANDATORY: Fetch handler for PWA installability.
 * Even a simple network-first or cache-falling-back-to-network strategy
 * is sufficient for the browser to recognize the app as offline-capable.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback for offline if fetching fails and not in cache
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
