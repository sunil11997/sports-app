/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Strategy: Network-First (Attempt server, fallback to cache)
 * Prevents Next.js 404 ChunkLoadErrors and enables Android installation.
 */

const CACHE_NAME = 'wgb-sports-v3.1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-512.png',
  '/manifest.webmanifest'
];

// Install Event - Pre-cache basic institutional assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('WGB: Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('WGB: Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for standard resources
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network is successful, clone to cache and return
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // If offline or network fails, fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // If neither network nor cache works (rare)
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});