/**
 * WGB Sports Hub - High-Availability Service Worker
 * Strategy: Network First, falling back to cache.
 * Purpose: Ensures the latest code chunks are used, preventing 404 ChunkLoadErrors.
 */

const CACHE_NAME = 'wgb-institutional-v3.2';

// 1. Immediate Activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
                  .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// 2. Network-First Fetching
self.addEventListener('fetch', (event) => {
  // Skip cross-origin or chrome-extension requests (like Firebase background auth)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('firebasestorage')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid successful responses
        if (response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(event.request);
      })
  );
});
