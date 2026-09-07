/**
 * Injury & Health Incident Service - Modular Data Repository for Waghamba Sports Health Hub.
 * Manages athlete health incident logs, recovery timelines, and medical clearances.
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
import type { HealthIncident } from '@/lib/types';
import { generateId } from '@/lib/id-generator';

export function subscribeToHealthIncidents(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  onUpdate: (incidents: HealthIncident[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'all_health_incidents'),
    where('schoolId', '==', schoolId),
    where('academicYear', '==', academicYear)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        ...(d.data() as HealthIncident),
        id: d.id,
      }));
      // Sort newest first
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('WGB InjuryService: Subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveHealthIncident(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  incident: Partial<HealthIncident>
): Promise<string> {
  const id = incident.id || generateId('inj');
  const ref = doc(db, 'all_health_incidents', id);

  await setDoc(
    ref,
    {
      ...incident,
      id,
      schoolId,
      academicYear,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return id;
}

export async function removeHealthIncident(
  db: Firestore,
  incidentId: string
): Promise<void> {
  const ref = doc(db, 'all_health_incidents', incidentId);
  await deleteDoc(ref);
}
