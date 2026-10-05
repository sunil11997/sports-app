
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

/**
 * Completely purges local Firestore IndexedDB databases to repair corrupted local caches.
 */
export async function clearFirestoreIndexedDb(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.indexedDB) return false;
  
  try {
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name && db.name.toLowerCase().includes('firestore')) {
          try {
            indexedDB.deleteDatabase(db.name);
            console.log(`WGB: Purged Firestore IndexedDB cache: ${db.name}`);
          } catch (e) {
            console.warn(`WGB: Error deleting DB ${db.name}`, e);
          }
        }
      }
    }
  } catch (err) {
    console.warn('WGB: Error listing indexedDB databases', err);
  }

  const projectId = firebaseConfig?.projectId || 'studio-7167909516-12009';
  const knownNames = [
    `firestore/[DEFAULT]/${projectId}/main`,
    `firestore/[DEFAULT]/${projectId}/sequence`,
    `firestore/[DEFAULT]/${projectId}`,
    `firestore/[DEFAULT]`,
    `firestore`,
  ];

  for (const name of knownNames) {
    try {
      indexedDB.deleteDatabase(name);
    } catch (_) {}
  }

  return true;
}

// Auto-heal corrupted IndexedDB cache ('prefixPath' null pointer in IndexedDB query/mutation execution)
if (typeof window !== 'undefined') {
  const handleCorruptedCacheError = (errorLike: any) => {
    const message = errorLike?.message || (typeof errorLike === 'string' ? errorLike : errorLike?.reason?.message || '');
    if (
      message.includes('prefixPath') ||
      (message.includes('IndexedDbTransactionError') && message.includes('Uncaught exception in event handler'))
    ) {
      console.error('WGB: Detected corrupted Firestore IndexedDB cache (prefixPath). Auto-healing...');
      const recoveryKey = 'wgb_firestore_cache_auto_healed';
      const lastHealed = sessionStorage.getItem(recoveryKey);
      if (!lastHealed) {
        sessionStorage.setItem(recoveryKey, Date.now().toString());
        clearFirestoreIndexedDb().then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 300);
        });
      }
    }
  };

  window.addEventListener('error', (event) => handleCorruptedCacheError(event.error || event));
  window.addEventListener('unhandledrejection', (event) => handleCorruptedCacheError(event.reason));

  setTimeout(() => {
    sessionStorage.removeItem('wgb_firestore_cache_auto_healed');
  }, 15000);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const isClient = typeof window !== 'undefined';
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);
  
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
      firestore,
      storage
    };
  }

  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp),
    storage
  };
}

