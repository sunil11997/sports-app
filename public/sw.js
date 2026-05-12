/**
 * Institutional Service Worker - Native Android Optimization
 * Version: 3.2.1
 * 
 * Strategically configured to handle local asset serving for Capacitor
 * while ensuring that cloud-synced data is always prioritized.
 */

const CACHE_NAME = 'wgb-institutional-v3.2.1';

// 1. Force immediate update logic to resolve "old app" issues
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('WGB SW: Installing new version and forcing immediate takeover...');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('WGB SW: Deleting obsolete cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('WGB SW: Cache cleared. App updated.');
      return self.clients.claim();
    })
  );
});

// 2. Network-First Strategy for App Stability
self.addEventListener('fetch', (event) => {
  // Bypass for Firebase internal calls and Chrome extensions
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebaseinstallations.googleapis.com') ||
    event.request.url.includes('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network request is successful, clone it into cache
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
        return caches.match(event.request);
      })
  );
});
