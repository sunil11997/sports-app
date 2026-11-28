/**
 * Tournament Sheet Persistence Service
 * Automatically persists teacher edits to tournament sheets across all sports and categories
 * in browser localStorage so that edits are never lost when switching sheets, sports, or navigating away.
 */

import { SheetRow } from '@/components/features/OfficialTournamentSheetModal';

const STORAGE_KEY = 'wgb_official_tournament_sheets_v3';

export interface SavedSheetStore {
  [sportKey: string]: {
    [categoryKey: string]: SheetRow[];
  };
}

/**
 * Load all saved tournament sheets from localStorage
 */
export function loadAllSavedTournamentSheets(): SavedSheetStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SavedSheetStore;
  } catch (err) {
    console.warn('Failed to parse saved tournament sheets from localStorage:', err);
    return {};
  }
}

/**
 * Get saved sheet rows for a specific sport and category
 */
export function getSavedTournamentSheet(sportKey: string, categoryKey: string): SheetRow[] | null {
  const all = loadAllSavedTournamentSheets();
  const sportData = all[sportKey];
  if (!sportData) return null;
  const rows = sportData[categoryKey];
  if (Array.isArray(rows) && rows.length > 0) {
    return rows;
  }
  return null;
}

/**
 * Save sheet rows for a specific sport and category
 */
export function saveTournamentSheet(sportKey: string, categoryKey: string, rows: SheetRow[]): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadAllSavedTournamentSheets();
    if (!all[sportKey]) {
      all[sportKey] = {};
    }
    all[sportKey][categoryKey] = rows;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to save tournament sheet to localStorage:', err);
  }
}

/**
 * Clear saved sheet rows for a specific sport and category (Reset to default)
 */
export function clearSavedTournamentSheet(sportKey: string, categoryKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadAllSavedTournamentSheets();
    if (all[sportKey] && all[sportKey][categoryKey]) {
      delete all[sportKey][categoryKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.warn('Failed to clear tournament sheet from localStorage:', err);
  }
}

/**
 * Clear all saved tournament sheets (factory reset)
 */
export function clearAllSavedTournamentSheets(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear all tournament sheets from localStorage:', err);
  }
}
