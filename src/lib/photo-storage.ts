export interface GeoPhoto {
  id: string;
  date: string;
  url: string;
  caption: string;
  sport: string;
  drill?: string;
  lat?: number | null;
  lng?: number | null;
  locationName?: string;
  timestamp?: string;
}

const DB_NAME = 'WGB_ReportPhotos_DB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

export async function savePhotoToIDB(photo: GeoPhoto): Promise<void> {
  // Always save to localStorage immediately for instant synchronous persistence
  try {
    const key = `wgb_photos_${photo.date}`;
    const saved = localStorage.getItem(key);
    const existing: GeoPhoto[] = saved ? JSON.parse(saved) : [];
    const updated = [photo, ...existing.filter(p => p.id !== photo.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage save failed:', e);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save photo to IndexedDB:', err);
  }
}

export async function getPhotosByDateFromIDB(date: string): Promise<GeoPhoto[]> {
  const photosMap = new Map<string, GeoPhoto>();

  // 1. Get from localStorage
  try {
    const key = `wgb_photos_${date}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const lsPhotos: GeoPhoto[] = JSON.parse(saved);
      lsPhotos.forEach(p => photosMap.set(p.id, p));
    }
  } catch (e) {}

  // 2. Get from IndexedDB & merge
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('date');
      const req = index.getAll(date);
      req.onsuccess = () => {
        const idbPhotos = (req.result || []) as GeoPhoto[];
        idbPhotos.forEach(p => photosMap.set(p.id, p));
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to load photos from IndexedDB:', err);
  }

  const result = Array.from(photosMap.values());
  result.sort((a, b) => b.id.localeCompare(a.id));
  return result;
}

export async function deletePhotoFromIDB(id: string, date: string): Promise<void> {
  // Always clean up localStorage
  try {
    const key = `wgb_photos_${date}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const filtered = JSON.parse(saved).filter((p: GeoPhoto) => p.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (e) {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete photo from IndexedDB:', err);
  }
}
