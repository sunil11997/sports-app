
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

  useEffect(() => {
    // Online/Offline status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture the installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('Capture beforeinstallprompt event');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detection for already installed apps
    window.addEventListener('appinstalled', (evt) => {
      console.log('App successfully installed');
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    // iOS/Safari detection for installation
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      // On iOS, we can't trigger a prompt, but we can show instructions
      // For this app, we'll mark it as installable if it's not standalone
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install on iOS: Tap the Share button in Safari (square with arrow) and select 'Add to Home Screen'.");
      } else {
        console.warn('Installation prompt not available. Check browser compatibility and HTTPS.');
      }
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    });
  };

  return (
    <PWAContext.Provider value={{ isOnline, isInstallable, installApp }}>
      {children}
    </PWAContext.Provider>
  );
}
