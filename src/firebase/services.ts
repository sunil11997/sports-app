'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

/**
 * initializeFirebase - Institutional Registry Engine
 * Optimized for high-resilience persistence and Native Android environments.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      firebaseApp = initializeApp();
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

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
    // Forcing Long Polling to resolve the 10-second backend timeout in workstation/mobile environments.
    let firestore: Firestore;
    try {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        }),
        experimentalForceLongPolling: true
      });
    } catch (e: any) {
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
