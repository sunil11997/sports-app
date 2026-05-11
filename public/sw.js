/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Strategy: Network-First for dynamic chunks, Cache-First for assets.
 * Resolves 404 ChunkLoadErrors and enables PWA installation.
 */

const CACHE_NAME = 'wgb-hub-v3.1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('WGB: Pre-caching core shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Network-First for code chunks to avoid 404/sync errors
  if (url.pathname.includes('/_next/static/chunks/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Strategy: Cache-First for static images and common assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // Cache successful responses for next time
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline Fallback
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
