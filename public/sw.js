/**
 * Waghamba Sports Hub - High Resilience Service Worker
 * Optimizes chunk loading speed and enables Android PWA installation.
 */

const CACHE_NAME = 'wgb-hub-v3.0.0';
const STATIC_ASSETS = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('WGB: Pre-caching institutional assets');
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

/**
 * Cache-First Strategy for speed
 * Network-First fallback for data sync
 */
self.addEventListener('fetch', (event) => {
  // We only cache static assets and chunks, not Firestore calls or dynamic API routes
  if (
    event.request.url.includes('/_next/static/') ||
    event.request.url.includes('/images/') ||
    event.request.url.endsWith('.png') ||
    event.request.url.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
  } else {
    // Default network-only/network-first for everything else
    event.respondWith(fetch(event.request));
  }
});
