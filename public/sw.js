/**
 * Waghamba Sports Hub - Service Worker
 * Required for Android PWA Installability and offline resilience.
 */

const CACHE_NAME = 'wgb-sports-hub-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Allow Firebase and AI Hub requests to pass through without interception
  if (
    event.request.url.includes('googleapis') || 
    event.request.url.includes('firebase') ||
    event.request.url.includes('cloudworkstations.dev')
  ) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
