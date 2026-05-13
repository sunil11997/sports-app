/**
 * Waghamba Sports Hub - Network-First Service Worker
 * Critical for Native Android stability and PWA Installability.
 */

const CACHE_NAME = 'wgb-registry-v3.2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
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
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('WGB: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Use Network-First strategy for Next.js app chunks
  // This prevents the "old app" issue by checking the network for updates first.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone it and update cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If offline, serve from cache
        return caches.match(event.request);
      })
  );
});
