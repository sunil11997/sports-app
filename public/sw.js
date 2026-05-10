/**
 * Waghamba Sports Hub - Service Worker
 * Enabling offline-first experience and PWA installability.
 */

const CACHE_NAME = 'wgb-hub-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/icon-512.png',
];

// 1. Installation: Cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation: Cleanup old caches
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

// 3. Fetch: Essential for PWA "Offline Ready" check
self.addEventListener('fetch', (event) => {
  // We prefer network, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
