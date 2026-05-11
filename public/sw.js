/**
 * Waghamba Sports Hub - Service Worker
 * Required for PWA Installability on Android and Chrome.
 */

const CACHE_NAME = 'wgb-hub-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// A functional fetch listener is mandatory for "Add to Home Screen"
self.addEventListener('fetch', (event) => {
  // Standard pass-through for now to ensure online-first behavior
  // but satisfies the PWA install criteria.
  return;
});
