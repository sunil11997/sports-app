/**
 * Waghamba Sports Hub - Service Worker
 * Strategy: Network First (Full-Resilience)
 * Required for Android PWA installation and offline mode.
 */

const CACHE_NAME = 'wgb-v3.2';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('WGB: Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Use Network First strategy to ensure the latest code chunks are loaded when online.
  // This prevents ChunkLoadErrors during active development/updates.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful network responses for static assets
        if (event.request.url.includes('/_next/static/') || STATIC_ASSETS.includes(new URL(event.request.url).pathname)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails (Offline mode)
        return caches.match(event.request);
      })
  );
});
