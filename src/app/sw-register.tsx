
"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker in the browser.
 * Fixed version: Registers 'sw.js' from the root public folder.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        // Register the sw.js located in the /public folder
        navigator.serviceWorker
          .register("/sw.js", { scope: '/' })
          .then((registration) => {
            console.log("WGB: Service Worker Registered:", registration.scope);
            
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('WGB: New content is available; please refresh.');
                    } else {
                      console.log('WGB: Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("WGB: Service Worker Registration Failed:", error);
          });
      });
    }
  }, []);

  return null;
}
