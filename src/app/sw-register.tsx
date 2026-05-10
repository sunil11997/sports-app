"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker in the browser.
 * The sw.js file must be located in the /public folder.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("WGB: Service Worker Registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("WGB: Service Worker Registration Failed:", error);
          });
      });
    }
  }, []);

  return null;
}
