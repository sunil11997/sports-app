/**
 * Waghamba Sports Hub - Mandatory Service Worker
 * Required for stable PWA functionality and chunk loading.
 */

const CACHE_NAME = 'wgb-hub-v3.0';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/icon-512.png',
        '/manifest.webmanifest'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for reliability in cloud workstations
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
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
