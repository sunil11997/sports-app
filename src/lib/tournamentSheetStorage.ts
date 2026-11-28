/**
 * Tournament Sheet Persistence Service
 * Automatically persists teacher edits to tournament sheets across all sports and categories
 * in browser localStorage with an in-memory cache and debounced writing for 60fps performance.
 */

import { SheetRow } from '@/components/features/OfficialTournamentSheetModal';

const STORAGE_KEY = 'wgb_official_tournament_sheets_v3';

export interface SavedSheetStore {
  [sportKey: string]: {
    [categoryKey: string]: SheetRow[];
  };
}

// In-memory cache for instant O(1) access and zero main-thread blocking
let inMemoryStore: SavedSheetStore | null = null;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let isDirty = false;

function getStore(): SavedSheetStore {
  if (inMemoryStore !== null) {
    return inMemoryStore;
  }
  if (typeof window === 'undefined') {
    inMemoryStore = {};
    return inMemoryStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    inMemoryStore = raw ? (JSON.parse(raw) as SavedSheetStore) : {};
  } catch (err) {
    console.warn('Failed to parse saved tournament sheets from localStorage:', err);
    inMemoryStore = {};
  }
  return inMemoryStore;
}

/**
 * Flush pending in-memory changes to localStorage immediately
 */
export function flushSavedTournamentSheets(): void {
  if (typeof window === 'undefined' || !isDirty || inMemoryStore === null) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryStore));
    isDirty = false;
  } catch (err) {
    console.warn('Failed to flush tournament sheets to localStorage:', err);
  }
}

/**
 * Load all saved tournament sheets from memory cache (loads from localStorage only once)
 */
export function loadAllSavedTournamentSheets(): SavedSheetStore {
  return getStore();
}

/**
 * Get saved sheet rows for a specific sport and category (instant O(1) in-memory lookup)
 */
export function getSavedTournamentSheet(sportKey: string, categoryKey: string): SheetRow[] | null {
  const store = getStore();
  const sportData = store[sportKey];
  if (!sportData) return null;
  const rows = sportData[categoryKey];
  if (Array.isArray(rows) && rows.length > 0) {
    return rows;
  }
  return null;
}

/**
 * Save sheet rows for a specific sport and category
 * Updates in-memory immediately for 0ms lag, and debounces localStorage write to 400ms.
 */
export function saveTournamentSheet(sportKey: string, categoryKey: string, rows: SheetRow[], immediate = false): void {
  const store = getStore();
  if (!store[sportKey]) {
    store[sportKey] = {};
  }
  store[sportKey][categoryKey] = rows;
  isDirty = true;

  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }

  if (immediate) {
    flushSavedTournamentSheets();
  } else {
    saveDebounceTimer = setTimeout(() => {
      flushSavedTournamentSheets();
    }, 400);
  }
}

/**
 * Clear saved sheet rows for a specific sport and category (Reset to default)
 */
export function clearSavedTournamentSheet(sportKey: string, categoryKey: string): void {
  const store = getStore();
  if (store[sportKey] && store[sportKey][categoryKey]) {
    delete store[sportKey][categoryKey];
    isDirty = true;
    flushSavedTournamentSheets();
  }
}

/**
 * Clear all saved tournament sheets (factory reset)
 */
export function clearAllSavedTournamentSheets(): void {
  inMemoryStore = {};
  isDirty = true;
  flushSavedTournamentSheets();
}
