/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Strategy: Network-First for JS chunks, Cache-First for static assets.
 * Satisfies all Android Chrome PWA installation requirements.
 */

const CACHE_NAME = 'wgb-hub-v3.1';
const STATIC_ASSETS = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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

  // 1. Network-First for Next.js Data and Static Chunks
  // This prevents the 404 ChunkLoadError during updates.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.includes('monospaceUid')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Cache-First for Images and Icons
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          return response;
        });
      })
    );
    return;
  }

  // 3. Stale-While-Revalidate for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
