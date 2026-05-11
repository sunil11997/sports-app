/**
 * Waghamba Sports Hub - PWA Service Worker
 * Required for modern "Add to Home Screen" eligibility.
 */

const CACHE_NAME = 'wgb-hub-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// The fetch event is MANDATORY for Chrome/Android to recognize the app as a PWA
self.addEventListener('fetch', (event) => {
  // Pass-through strategy - Required to satisfy the "offline-capable" audit
  event.respondWith(
    fetch(event.request).catch(() => {
      // In a real offline scenario, you could return a cached page here
      return caches.match(event.request);
    })
  );
});
