/**
 * Waghamba Sports Hub - Network-First Service Worker
 * 
 * Strategy:
 * 1. Network First for JS Chunks and HTML Navigation to prevent 404 ChunkLoadErrors.
 * 2. Stale-while-revalidate for static images and assets.
 * 
 * This resolves the "Cannot read properties of undefined (reading 'call')" error
 * by ensuring the latest bundle is always used.
 */

const CACHE_NAME = 'wgb-registry-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network First for Next.js internal chunks and Page Navigation
  if (
    request.mode === 'navigate' || 
    url.pathname.includes('/_next/static/') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Stale-while-revalidate for everything else (images, etc)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
