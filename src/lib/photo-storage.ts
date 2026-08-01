export interface GeoPhoto {
  id: string;
  date: string;
  url: string;
  caption: string;
  sport: string;
  drill: string;
  lat: number;
  lng: number;
  locationName: string;
  timestamp: string;
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
    // Fallback to localStorage
    try {
      const key = `wgb_photos_${photo.date}`;
      const saved = localStorage.getItem(key);
      const existing: GeoPhoto[] = saved ? JSON.parse(saved) : [];
      const updated = [photo, ...existing.filter(p => p.id !== photo.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage fallback also failed:', e);
    }
  }
}

export async function getPhotosByDateFromIDB(date: string): Promise<GeoPhoto[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('date');
      const req = index.getAll(date);
      req.onsuccess = () => {
        const photos = (req.result || []) as GeoPhoto[];
        // Sort descending by id/timestamp
        photos.sort((a, b) => b.id.localeCompare(a.id));
        resolve(photos);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load photos from IndexedDB:', err);
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(`wgb_photos_${date}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}

export async function deletePhotoFromIDB(id: string, date: string): Promise<void> {
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
  // Cleanup localStorage fallback if present
  try {
    const key = `wgb_photos_${date}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const filtered = JSON.parse(saved).filter((p: GeoPhoto) => p.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (e) {}
}
