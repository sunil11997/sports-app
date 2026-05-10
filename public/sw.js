/**
 * Waghamba Sports Hub - Service Worker
 * Implements mandatory fetch listener for PWA installability.
 */

const CACHE_NAME = 'wgb-sports-v3';
const ASSETS = [
  '/',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Required listener for PWA "Add to Home Screen" eligibility
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
