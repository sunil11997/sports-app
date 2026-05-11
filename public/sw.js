/**
 * Waghamba Sports Hub - Service Worker
 * Required for PWA installability.
 */

const CACHE_NAME = 'wgb-sports-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png'
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
  event.waitUntil(self.clients.claim());
});

/**
 * Functional fetch listener is mandatory for Chrome/Android PWA installability.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
