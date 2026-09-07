/**
 * Attendance Service - Modular Data Repository for Waghamba Sports Health Hub.
 * Features targeted date-level and academic-year subscriptions with seamless offline queue fallback.
 */

import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { enqueueMutation } from '@/lib/offline-queue';

/**
 * Subscribes to attendance records for a specific date and academic year.
 * Prevents fetching all historical days across the entire academic calendar on every screen.
 */
export function subscribeToDateAttendance(
  db: Firestore,
  schoolId: string,
  date: string,
  academicYear: string,
  onUpdate: (attendanceMap: Record<string, string>) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!db || !schoolId || !date) {
    onUpdate({});
    return () => {};
  }

  const q = query(
    collection(db, 'attendance_registry'),
    where('schoolId', '==', schoolId),
    where('date', '==', date),
    where('academicYear', '==', academicYear)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const result: Record<string, string> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const sessionSuffix = data.session ? `_${data.session}` : '_Morning';
        result[`${data.playerId}_${data.date}${sessionSuffix}`] = data.status;
      });
      onUpdate(result);
    },
    (err) => {
      console.warn('WGB AttendanceService: Date subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to all attendance records for the selected academic year.
 * Used by consolidated reports and monthly attendance summaries.
 */
export function subscribeToYearAttendance(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  onUpdate: (attendanceMap: Record<string, string>) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate({});
    return () => {};
  }

  const q = query(
    collection(db, 'attendance_registry'),
    where('schoolId', '==', schoolId),
    where('academicYear', '==', academicYear)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const result: Record<string, string> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const sessionSuffix = data.session ? `_${data.session}` : '_Morning';
        result[`${data.playerId}_${data.date}${sessionSuffix}`] = data.status;
      });
      onUpdate(result);
    },
    (err) => {
      console.warn('WGB AttendanceService: Year subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Marks attendance for a player with atomic offline queue support.
 */
export async function markAttendance(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  playerId: string,
  date: string,
  session: string,
  status: string | null
): Promise<void> {
  const docId = `${playerId}_${date}_${session}`;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    // Queue mutation in IndexedDB
    await enqueueMutation({
      collectionName: 'attendance_registry',
      docId,
      action: status ? 'set' : 'delete',
      payload: status
        ? {
            status,
            playerId,
            date,
            session,
            schoolId,
            academicYear,
            updatedAt: new Date().toISOString(),
          }
        : undefined,
      options: { merge: true },
      schoolId,
      academicYear,
    });
    return;
  }

  const attRef = doc(db, 'attendance_registry', docId);

  if (!status) {
    await deleteDoc(attRef);
  } else {
    await setDoc(
      attRef,
      {
        status,
        playerId,
        date,
        session,
        schoolId,
        academicYear,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
}
