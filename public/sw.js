
/**
 * Waghamba Sports Hub - Service Worker
 * Strategy: Network First (Ensures latest institutional data while allowing offline access)
 */

const CACHE_NAME = 'wgb-sports-v3.1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache static assets and chunks for faster subsequent loads
        if (response.status === 200 && (
          event.request.url.includes('_next/static') || 
          event.request.url.includes('.png') ||
          event.request.url.includes('.js')
        )) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (Offline mode)
        return caches.match(event.request);
      })
  );
});
