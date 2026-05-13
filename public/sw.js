
/**
 * Waghamba Sports Hub - High-Availability Service Worker
 * Strategy: Network-First with Immediate Activation
 * Ensures Next.js chunks are always fresh on Android native devices.
 */

const CACHE_NAME = 'wgb-sports-v3.2';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
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
  self.clients.claim(); // Take control of all open clients
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Strategy: Network First, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone it to cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // If even cache fails for a navigation, show home
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
