/**
 * Waghamba Sports Hub - Service Worker
 * Mandatory for PWA Installability on Android/Chrome.
 */

const CACHE_NAME = 'wgb-sports-v3';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Required fetch listener for PWA compliance
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
