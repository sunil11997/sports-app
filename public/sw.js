/**
 * Waghamba Sports Hub - Service Worker
 * Required for PWA Installability on Android and iOS.
 * Implements a simple fetch handler to satisfy the browser's offline requirement.
 */

const CACHE_NAME = 'wgb-sports-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Respond with the network request.
  // This satisfies the Android "Add to Home Screen" requirement for a fetch handler.
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback can be added here if needed.
    })
  );
});
