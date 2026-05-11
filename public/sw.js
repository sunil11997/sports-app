/**
 * Waghamba Sports Hub - High-Performance Service Worker
 * Implements Cache-First strategy for static assets to ensure near-instant loading.
 */

const CACHE_NAME = 'wgb-static-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
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
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first for static chunks and styles
  if (url.origin === self.location.origin && (
    url.pathname.includes('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.css')
  )) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-only for Firebase/Auth API calls
  if (url.origin.includes('firebase') || url.pathname.includes('/api/')) {
    return;
  }

  // Default: Network with fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
