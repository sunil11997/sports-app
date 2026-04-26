
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

/**
 * initializeFirebase - Institutional Registry Engine
 * Optimized for SSR safety and offline persistence.
 */
export function initializeFirebase() {
  let firebaseApp;
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      // Fallback for environment-specific init failures
      firebaseApp = initializeApp();
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Server-safe check
  const isClient = typeof window !== 'undefined';

  // Initialize Services
  const auth = getAuth(firebaseApp);
  
  if (isClient) {
    // 1. Set Auth Persistence (Client-only)
    try {
      setPersistence(auth, browserLocalPersistence);
    } catch (e) {
      console.warn('WGB: Auth persistence suppressed', e);
    }

    // 2. Initialize Firestore with Multi-Tab Offline Persistence
    let firestore;
    try {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (e: any) {
      // Fallback if indexedDB is locked or unavailable
      firestore = getFirestore(firebaseApp);
    }

    return {
      firebaseApp,
      auth,
      firestore
    };
  }

  // Server-side fallback (SSR/Build-time)
  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
