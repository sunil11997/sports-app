/**
 * Waghamba Sports Hub - PWA Service Worker
 * Enables offline handling and meets criteria for browser installation.
 */

const CACHE_NAME = 'wgb-sports-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through for high-resilience Firebase operations.
  // Standard PWA fetch handler required for "Add to Home Screen" eligibility.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
  }
});
