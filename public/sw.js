/**
 * Waghamba Sports Hub - Service Worker
 * Ensures the app is recognized as "Offline Capable" for PWA Installation.
 */

const CACHE_NAME = 'wgb-sports-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-512.png',
  '/favicon.ico'
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

// Activate Event - Clean up old caches
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

/**
 * MANDATORY FETCH HANDLER
 * This is the critical requirement for PWA installability.
 * Browsers check if a fetch event is handled to confirm offline support.
 */
self.addEventListener('fetch', (event) => {
  // We handle network-first for most requests to ensure fresh data
  // but fall back to cache for the shell if offline.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
