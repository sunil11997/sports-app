/**
 * Waghamba Sports Hub - Service Worker
 * Required for PWA Installability and Offline Capabilities.
 */

const CACHE_NAME = 'wgb-sports-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

// Install Event - Caching basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch Event - Mandatory for PWA "Add to Home Screen" support
self.addEventListener('fetch', (event) => {
  // Simple network-first or cache-fallback strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback for offline if resource not in cache
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
