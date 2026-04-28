'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

/**
 * initializeFirebase - Institutional Registry Engine
 * Optimized for server-safety and robust offline persistence.
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
    // 1. Set Auth Persistence (Client-only)
    try {
      setPersistence(auth, browserLocalPersistence);
    } catch (e) {
      console.warn('WGB: Auth persistence suppressed', e);
    }

    // 2. Initialize Firestore with Multi-Tab Offline Persistence
    let firestore: Firestore;
    try {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
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
