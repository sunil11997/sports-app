/**
 * Waghamba Sports Hub - Mandatory Service Worker
 * Required for PWA installation on Android and Chrome.
 * Provides basic offline capability handshake.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Required listener for PWA "Add to Home Screen" eligibility.
  // Standard requests pass through while maintaining browser trust.
});
