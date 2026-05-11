/**
 * Waghamba Sports Hub - Service Worker
 * Required for PWA installation and offline chunk stability.
 */

const CACHE_NAME = 'wgb-hub-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch listener to satisfy PWA requirements
  // Bypasses cache for API/Firestore requests while allowing static assets
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});
