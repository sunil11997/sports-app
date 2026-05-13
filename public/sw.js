/**
 * Waghamba Sports Hub - Network-First Service Worker
 * Resolves Next.js 404 Chunk Errors and ensuring "Fresh App" state.
 */

const CACHE_NAME = 'wgb-hub-v3.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Network-First Strategy for HTML/JS/CSS
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline or 404
        return caches.match(event.request);
      })
  );
});
