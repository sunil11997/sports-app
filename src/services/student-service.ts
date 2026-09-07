/**
 * Student Service - Modular Data Repository for Waghamba Sports Health Hub.
 * Provides targeted queries, subscriptions, and mutations with tenant & academic-year isolation.
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Player } from '@/lib/types';
import { generateId } from '@/lib/id-generator';

export interface StudentFilterOptions {
  standard?: string;
  category?: 'athlete' | 'general' | 'all';
}

/**
 * Subscribes to real-time player roster updates for a specific school.
 * Returns an unsubscribe function to safely tear down the listener when the view unmounts.
 */
export function subscribeToSchoolStudents(
  db: Firestore,
  schoolId: string,
  onUpdate: (players: Player[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'players'),
    where('schoolId', '==', schoolId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const players: Player[] = snapshot.docs.map((d) => ({
        ...(d.data() as Player),
        id: d.id,
      }));
      // Sort by serial number or standard
      players.sort((a: any, b: any) => (parseInt(a.serialNumber || '0', 10) || 0) - (parseInt(b.serialNumber || '0', 10) || 0));
      onUpdate(players);
    },
    (err) => {
      console.warn('WGB StudentService: Subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * One-off fetch of students for a specific school and standard.
 */
export async function getStudentsByStandard(
  db: Firestore,
  schoolId: string,
  standard: string
): Promise<Player[]> {
  if (!db || !schoolId) return [];

  const q = query(
    collection(db, 'players'),
    where('schoolId', '==', schoolId),
    where('std', '==', standard)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...(d.data() as Player), id: d.id }));
}

/**
 * Saves or updates a student profile with authoritative tenant metadata.
 */
export async function saveStudentProfile(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  data: Partial<Player>
): Promise<string> {
  const studentId = data.id || generateId('std');
  const studentRef = doc(db, 'players', studentId);
  const now = new Date().toISOString();

  const payload: Partial<Player> = {
    ...data,
    id: studentId,
    schoolId,
    ownerId: schoolId,
    academicYear: data.academicYear || academicYear,
    updatedAt: now,
  };

  await setDoc(studentRef, payload, { merge: true });
  return studentId;
}

/**
 * Deletes a student profile document.
 */
export async function removeStudentProfile(
  db: Firestore,
  studentId: string
): Promise<void> {
  const studentRef = doc(db, 'players', studentId);
  await deleteDoc(studentRef);
}
