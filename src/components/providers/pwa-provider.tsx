
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  installApp: () => void;
}

const PWAContext = createContext<PWAContextType>({ 
  isOnline: true, 
  isInstallable: false, 
  installApp: () => {} 
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Robust Connectivity Check with Heartbeat
  const checkConnectivity = async () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    try {
      // Tiny fetch to verify actual internet access, bypassing cache with timestamp
      const response = await fetch(`/manifest.json?h=${Date.now()}`, { 
        method: 'HEAD', 
        cache: 'no-store',
        mode: 'no-cors' 
      });
      setIsOnline(true);
    } catch (e) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Browser event listeners
    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Heartbeat: Check every 30 seconds for state changes
    const interval = setInterval(checkConnectivity, 30000);

    // Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('WGB: Institutional Service Worker Registered');
          checkConnectivity();
        })
        .catch((err) => console.error('WGB: SW Registration Failed', err));
    }

    // PWA Installation Prompt Logic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, []);

  const installApp = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    });
  };

  return (
    <PWAContext.Provider value={{ isOnline, isInstallable, installApp }}>
      {children}
    </PWAContext.Provider>
  );
}
