const CACHE_NAME = 'wgb-cache-v3.1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

/**
 * Institutional Service Worker - Optimized for Resilience
 * Uses a Network-First strategy with Cache Fallback to ensure latest chunks
 * are always loaded when online, avoiding common 404 errors in production.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore external API calls and analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
