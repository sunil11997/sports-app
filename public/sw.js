
/**
 * Waghamba Sports Hub - High-Resilience Service Worker
 * Strategy: Network-First with Aggressive Cache Clearing
 * Purpose: Fixes 404 ChunkLoadErrors and "Old App" content issues on Android.
 */

const CACHE_NAME = 'wgb-sports-v3.2';

// 1. Install Event - Force Activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('WGB SW: Installing & Skipping Waiting');
});

// 2. Activate Event - Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('WGB SW: Deleting Old Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Network-First Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and store in cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (Offline), try the cache
        return caches.match(event.request);
      })
  );
});
