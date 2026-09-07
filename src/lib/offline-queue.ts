/**
 * IndexedDB Offline Mutation Queue for Waghamba Sports Health Hub.
 * Replaces insecure, quota-limited localStorage with an atomic, transactional, retry-resilient offline store.
 */

import { doc, setDoc, updateDoc, deleteDoc, type Firestore } from 'firebase/firestore';

export interface OfflineMutation {
  id: string;
  collectionName: string;
  docId: string;
  action: 'set' | 'update' | 'delete';
  payload?: any;
  options?: { merge?: boolean };
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  schoolId: string;
  academicYear?: string;
}

export interface SyncStatusEvent {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime?: number;
  error?: string;
}

const DB_NAME = 'WGB_Offline_Store';
const DB_VERSION = 2;
const MUTATION_STORE = 'mutation_queue';
const LEGACY_STORAGE_ATTENDANCE_KEY = 'wgb_offline_attendance_queue';

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MUTATION_STORE)) {
        const store = db.createObjectStore(MUTATION_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('schoolId', 'schoolId', { unique: false });
      }
    };
  });
}

function broadcastSyncStatus(detail: SyncStatusEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wgb-offline-sync-status', { detail }));
  }
}

/**
 * Adds an idempotent mutation to the persistent IndexedDB queue.
 */
export async function enqueueMutation(
  mutation: Omit<OfflineMutation, 'id' | 'timestamp' | 'status' | 'retryCount'>
): Promise<string> {
  try {
    const db = await openOfflineDB();
    const id = `${mutation.collectionName}_${mutation.docId}_${Date.now()}`;
    const item: OfflineMutation = {
      ...mutation,
      id,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MUTATION_STORE, 'readwrite');
      const store = tx.objectStore(MUTATION_STORE);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const pending = await getPendingMutationsCount();
    broadcastSyncStatus({ isSyncing: false, pendingCount: pending });
    return id;
  } catch (err) {
    console.error('WGB Offline: Failed to enqueue mutation:', err);
    throw err;
  }
}

/**
 * Returns all pending mutations sorted chronologically.
 */
export async function getPendingMutations(): Promise<OfflineMutation[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(MUTATION_STORE, 'readonly');
      const store = tx.objectStore(MUTATION_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as OfflineMutation[];
        list.sort((a, b) => a.timestamp - b.timestamp);
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Returns the count of pending mutations in the queue.
 */
export async function getPendingMutationsCount(): Promise<number> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(MUTATION_STORE, 'readonly');
      const store = tx.objectStore(MUTATION_STORE);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * Deletes a processed mutation from IndexedDB.
 */
export async function removeMutation(id: string): Promise<void> {
  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MUTATION_STORE, 'readwrite');
      const store = tx.objectStore(MUTATION_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('WGB Offline: Failed to remove mutation:', id, err);
  }
}

/**
 * Migrates any legacy attendance mutations from localStorage into IndexedDB.
 */
export async function migrateLegacyLocalStorageQueue(schoolId: string, academicYear: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_ATTENDANCE_KEY);
    if (!raw) return;

    const legacyMap: Record<string, string> = JSON.parse(raw);
    const keys = Object.keys(legacyMap);
    if (keys.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_ATTENDANCE_KEY);
      return;
    }

    for (const key of keys) {
      const status = legacyMap[key];
      const parts = key.split('_');
      if (parts.length < 3) continue;
      const session = parts.pop()!;
      const date = parts.pop()!;
      const playerId = parts.join('_');
      const docId = `${playerId}_${date}_${session}`;

      if (!status) {
        await enqueueMutation({
          collectionName: 'attendance_registry',
          docId,
          action: 'delete',
          schoolId,
          academicYear,
        });
      } else {
        await enqueueMutation({
          collectionName: 'attendance_registry',
          docId,
          action: 'set',
          payload: {
            status,
            playerId,
            date,
            session,
            schoolId,
            academicYear,
          },
          options: { merge: true },
          schoolId,
          academicYear,
        });
      }
    }

    localStorage.removeItem(LEGACY_STORAGE_ATTENDANCE_KEY);
  } catch (err) {
    console.warn('WGB Offline: Legacy migration skipped:', err);
  }
}

let isSyncInProgress = false;

/**
 * Processes all pending mutations against Firestore with retry handling.
 */
export async function processOfflineQueue(
  firestoreInstance: Firestore,
  onProgress?: (pendingCount: number) => void
): Promise<{ processed: number; failed: number }> {
  if (isSyncInProgress || !navigator.onLine || !firestoreInstance) {
    return { processed: 0, failed: 0 };
  }

  isSyncInProgress = true;
  let processed = 0;
  let failed = 0;

  try {
    const pending = await getPendingMutations();
    broadcastSyncStatus({ isSyncing: true, pendingCount: pending.length });

    for (const item of pending) {
      try {
        const docRef = doc(firestoreInstance, item.collectionName, item.docId);

        if (item.action === 'set') {
          await setDoc(docRef, item.payload, item.options || { merge: true });
        } else if (item.action === 'update') {
          await updateDoc(docRef, item.payload);
        } else if (item.action === 'delete') {
          await deleteDoc(docRef);
        }

        await removeMutation(item.id);
        processed++;
        const remaining = await getPendingMutationsCount();
        if (onProgress) onProgress(remaining);
        broadcastSyncStatus({ isSyncing: true, pendingCount: remaining });
      } catch (mutationErr: any) {
        console.warn('WGB Offline: Mutation sync failed, will retry:', item.id, mutationErr?.message);
        failed++;
        // If permanent client error or max retries exceeded
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount > 10) {
          // Drop corrupted record to unblock queue after 10 failed network sessions
          await removeMutation(item.id);
        }
      }
    }

    const remainingCount = await getPendingMutationsCount();
    broadcastSyncStatus({
      isSyncing: false,
      pendingCount: remainingCount,
      lastSyncTime: Date.now(),
    });

    return { processed, failed };
  } finally {
    isSyncInProgress = false;
  }
}
