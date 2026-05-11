/**
 * Institutional Service Worker - Waghamba Hub
 * Implements a high-reliability Network-First strategy to avoid 404 chunk errors
 * while enabling offline availability and Android PWA installation.
 */

const CACHE_NAME = 'wgb-hub-v3.1';

// Mandatory fetch listener for PWA "Add to Home Screen"
self.addEventListener('fetch', (event) => {
  // Use Network-First strategy for application chunks and logic
  // This prevents 404 ChunkLoadErrors during hot-reloads and updates.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.status === 200 && (
          event.request.url.includes('.js') || 
          event.request.url.includes('.css') || 
          event.request.url.includes('.png') ||
          event.request.url.includes('.json')
        )) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
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

self.addEventListener('install', (event) => {
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
});
