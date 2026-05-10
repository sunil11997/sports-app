"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker in the browser.
 * This is required for the browser to trigger the PWA Installation Prompt.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        // Register the sw.js located in the /public folder
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("WGB: Service Worker Registered:", registration.scope);
          })
          .catch((error) => {
            console.error("WGB: Service Worker Registration Failed:", error);
          });
      });
    }
  }, []);

  return null;
}
