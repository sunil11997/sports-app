const CACHE_NAME = 'wgb-sports-hub-v3.2';

// Network-First Strategy for mandatory Next.js assets and standard registry data
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Firebase or Google Analytics
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the network request is successful, clone it and save to cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If the network fails (offline), fall back to the cache
        return caches.match(event.request);
      })
  );
});

// Immediately update the app when a new Service Worker is found
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('WGB: Clearing Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
