/**
 * Waghamba Sports Hub - Service Worker
 * Implements basic fetch handling to satisfy PWA installability requirements.
 */

const CACHE_NAME = 'wgb-sports-v3';
const ASSETS = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Required fetch handler for PWA installability
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback logic if needed
    })
  );
});
