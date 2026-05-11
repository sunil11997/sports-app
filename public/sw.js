/**
 * Waghamba Sports Hub - Service Worker v3.0
 * Provides mandatory offline fetch handling for Android PWA installation.
 */

const CACHE_NAME = 'wgb-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/**
 * Mandatory fetch listener for PWA status.
 * Ensures the app is recognized as offline-capable.
 */
self.addEventListener('fetch', (event) => {
  // Check if request is for Firebase/Cloud functions or static assets
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
