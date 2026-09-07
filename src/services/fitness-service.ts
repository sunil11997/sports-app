/**
 * Fitness Service - Modular Data Repository for Waghamba Sports Health Hub.
 * Manages physical fitness battery assessments and historical performance metrics.
 */

import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { FitnessAssessment } from '@/lib/types';
import { generateId } from '@/lib/id-generator';

export function subscribeToFitnessAssessments(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  onUpdate: (data: { latest: Record<string, FitnessAssessment>; history: Record<string, FitnessAssessment[]> }) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate({ latest: {}, history: {} });
    return () => {};
  }

  const q = query(
    collection(db, 'fitness_registry'),
    where('schoolId', '==', schoolId),
    where('academicYear', '==', academicYear)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const latest: Record<string, FitnessAssessment> = {};
      const history: Record<string, FitnessAssessment[]> = {};

      snapshot.docs.forEach((d) => {
        const item = { ...(d.data() as FitnessAssessment), id: d.id };
        const pId = item.playerId;
        if (!pId) return;

        if (!history[pId]) history[pId] = [];
        history[pId].push(item);

        const itemTime = item.date ? new Date(item.date).getTime() : 0;
        const latestTime = latest[pId]?.date ? new Date(latest[pId].date!).getTime() : 0;
        if (!latest[pId] || itemTime > latestTime) {
          latest[pId] = item;
        }
      });

      onUpdate({ latest, history });
    },
    (err) => {
      console.warn('WGB FitnessService: Subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveFitnessAssessment(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  assessment: Partial<FitnessAssessment>
): Promise<string> {
  const id = assessment.id || generateId('fit');
  const ref = doc(db, 'fitness_registry', id);

  await setDoc(
    ref,
    {
      ...assessment,
      id,
      schoolId,
      academicYear,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return id;
}
