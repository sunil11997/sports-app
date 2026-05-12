/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Strategy: Network First, falling back to cache.
 * This ensures users always get the latest registry updates while online,
 * but can still access the hub during power cuts or offline field sessions.
 */

const CACHE_NAME = 'wgb-hub-v3-cache';
const OFFLINE_URL = '/';

// Core assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
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
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Avoid caching Firebase Auth and Next.js internal calls
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/auth') || url.hostname.includes('firebase')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone to cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request).then((match) => {
          return match || caches.match(OFFLINE_URL);
        });
      })
  );
});
