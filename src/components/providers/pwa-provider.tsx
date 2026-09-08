"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  installApp: () => Promise<boolean>;
  triggerInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({ 
  isOnline: true, 
  isInstallable: false, 
  isStandalone: false,
  isIOS: false,
  isInstallModalOpen: false,
  setIsInstallModalOpen: () => {},
  installApp: async () => false,
  triggerInstall: async () => {}
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      // Detect iOS Safari / WebKit
      const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isAppleDevice);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check if already running in standalone PWA window
      const checkStandalone = () => {
        const isStandaloneMode = 
          window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://');
        setIsStandalone(isStandaloneMode);
      };

      checkStandalone();

      // Capture native beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
        console.log("WGB: Native PWA Install Prompt Captured!");
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

      // Track successful app installation
      window.addEventListener('appinstalled', () => {
        setIsInstallable(false);
        setIsStandalone(true);
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
        console.log('WGB: App successfully installed to device!');
      });

      // Auto-recover from chunk loading errors (e.g. after deployments or cache mismatch)
      const handleChunkError = (err: any) => {
        const message = err?.message || err?.reason?.message || String(err?.reason || err || '');
        const isChunkError = 
          message.includes('Loading chunk') || 
          message.includes('ChunkLoadError') || 
          message.includes('Failed to fetch dynamically imported module') ||
          message.includes('loading CSS chunk');

        if (isChunkError) {
          const lastReload = sessionStorage.getItem('wgb_chunk_reload_time');
          const now = Date.now();
          if (!lastReload || now - parseInt(lastReload) > 8000) {
            sessionStorage.setItem('wgb_chunk_reload_time', now.toString());
            console.warn('WGB: ChunkLoadError intercepted. Refreshing to load latest bundle...');
            // Unregister old service worker if needed, then reload
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => r.update());
              });
            }
            window.location.reload();
          }
        }
      };

      const onErrorListener = (e: ErrorEvent) => handleChunkError(e.error || e.message);
      const onRejectionListener = (e: PromiseRejectionEvent) => handleChunkError(e.reason);

      window.addEventListener('error', onErrorListener);
      window.addEventListener('unhandledrejection', onRejectionListener);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
        window.removeEventListener('error', onErrorListener);
        window.removeEventListener('unhandledrejection', onRejectionListener);
      };
    }
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      // Show native Google Play / Chrome OS install prompt
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted native PWA install prompt');
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    } catch (err) {
      console.warn("PWA install prompt error:", err);
      return false;
    }
  };

  const triggerInstall = async (): Promise<void> => {
    if (deferredPrompt) {
      const success = await installApp();
      if (!success) {
        setIsInstallModalOpen(true);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  return (
    <PWAContext.Provider value={{
      isOnline,
      isInstallable,
      isStandalone,
      isIOS,
      isInstallModalOpen,
      setIsInstallModalOpen,
      installApp,
      triggerInstall
    }}>
      {children}
    </PWAContext.Provider>
  );
}
