
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

/**
 * initializeFirebase - Institutional Registry Engine
 * Optimized for high-resilience persistence and Native Android environments.
 * v5.1 Update: Enabled experimentalAutoDetectLongPolling for proxied environments.
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

const initializedFirestoreApps = new Set<string>();

export function getSdks(firebaseApp: FirebaseApp) {
  const isClient = typeof window !== 'undefined';
  const auth = getAuth(firebaseApp);
  
  if (isClient) {
    try {
      setPersistence(auth, indexedDBLocalPersistence);
    } catch (e) {
      console.warn('WGB: Auth persistence restricted', e);
    }

    let firestore: Firestore;
    const appKey = firebaseApp.name || '[default]';

    if (!initializedFirestoreApps.has(appKey)) {
      try {
        firestore = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
            cacheSizeBytes: 100 * 1024 * 1024 
          }),
          experimentalAutoDetectLongPolling: true
        });
        initializedFirestoreApps.add(appKey);
        console.log("WGB: Firestore Registry initialized with 100MB persistent cache and Long-Polling.");
      } catch (e: any) {
        firestore = getFirestore(firebaseApp);
        if (e.code === 'failed-precondition') {
          initializedFirestoreApps.add(appKey);
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
