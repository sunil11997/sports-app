'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

/**
 * initializeFirebase - Institutional Registry Engine
 * Optimized for high-resilience persistence and Native Android environments.
 * Forcing Long Polling to resolve the 10-second backend timeout in workstation/mobile environments.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  const apps = getApps();
  if (!apps.length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      firebaseApp = initializeApp();
    }
  } else {
    firebaseApp = apps[0];
  }

  return getSdks(firebaseApp);
}

// Singleton tracker to prevent "failed-precondition" during multiple initialization attempts
const initializedFirestoreApps = new Set<string>();

export function getSdks(firebaseApp: FirebaseApp) {
  const isClient = typeof window !== 'undefined';
  const auth = getAuth(firebaseApp);
  
  if (isClient) {
    // 1. Set Robust Auth Persistence (IndexedDB is best for native-like PWAs)
    try {
      setPersistence(auth, indexedDBLocalPersistence);
    } catch (e) {
      console.warn('WGB: Auth persistence restricted', e);
    }

    // 2. Initialize Firestore with Multi-Tab Offline Persistence
    let firestore: Firestore;
    const appKey = firebaseApp.name || '[default]';

    if (!initializedFirestoreApps.has(appKey)) {
      try {
        firestore = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
            // Configured for 100MB cache budget as requested for local athlete data
            cacheSizeBytes: 100 * 1024 * 1024 
          }),
          experimentalForceLongPolling: true // CRITICAL: Resolve 10s connection timeouts
        });
        initializedFirestoreApps.add(appKey);
        console.log("WGB: Firestore Registry initialized with 100MB persistent cache.");
      } catch (e: any) {
        firestore = getFirestore(firebaseApp);
        // If already initialized (common during HMR), we just use the existing instance
        if (e.code === 'failed-precondition') {
          initializedFirestoreApps.add(appKey);
          console.log("WGB: Firestore persistence already active.");
        } else {
          console.warn('WGB: Firestore initialization fallback.', e.code, e.message);
        }
      }
    } else {
      firestore = getFirestore(firebaseApp);
    }

    return {
      firebaseApp,
      auth,
      firestore
    };
  }

  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}
