const CACHE_NAME = "sports-app-v1";
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  OFFLINE_URL,
  "/icon-192.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
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
});

self.addEventListener("fetch", (event) => {
  // We only want to handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;
        if (event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
        return null;
      });
    })
  );
});