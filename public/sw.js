/**
 * Waghamba Sports Hub - Official PWA Service Worker (v6.0)
 * Handles app shell caching, static assets, and local notification clicks.
 * Private Firestore/Auth traffic is passed through directly to allow IndexedDB offline persistence.
 */

const CACHE_NAME = 'wgb-sports-v6.0';

// Essential Static Assets to pre-cache
const STATIC_PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/app-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/adivasi_vikas_logo.png',
  '/amrit_mahotsav_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('WGB SW: Precache partial error (ignored):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Mobile Push / Local Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Network-First for dynamic app routes, Cache-First for static assets, Bypass for Firebase/APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Bypass Google / Firebase / Firestore / AI APIs completely from SW cache
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Handle Static Assets & Pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML navigation failed while offline, serve offline fallback
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
