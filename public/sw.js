/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Implements a "Network-First" strategy for JS/CSS chunks to prevent 404s.
 * Ensures the app is installable on Android.
 */

const CACHE_NAME = 'wgb-hub-v3.1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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
  const url = new URL(event.request.url);

  // Network-First for code chunks and style files to avoid 404s during deployments
  if (url.pathname.includes('/_next/static/') || url.pathname.includes('.js') || url.pathname.includes('.css')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First for internal images and logos
  if (url.pathname.includes('/images/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        });
      })
    );
    return;
  }

  // Default: Network-First with Offline fallback for the main page
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request) || caches.match('/'))
  );
});
