/**
 * Equipment Service - Modular Data Repository for Waghamba Sports Health Hub.
 * Manages inventory stock, issues/returns, and annual indents.
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
import type { EquipmentItem, EquipmentIssueRecord, IndentItem } from '@/lib/types';
import { generateId } from '@/lib/id-generator';

export function subscribeToEquipmentInventory(
  db: Firestore,
  schoolId: string,
  onUpdate: (items: EquipmentItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'equipment_inventory'),
    where('schoolId', '==', schoolId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        ...(d.data() as EquipmentItem),
        id: d.id,
      }));
      onUpdate(list);
    },
    (err) => {
      console.warn('WGB EquipmentService: Stock subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToEquipmentIssues(
  db: Firestore,
  schoolId: string,
  academicYear: string,
  onUpdate: (issues: EquipmentIssueRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!db || !schoolId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'equipment_issues'),
    where('schoolId', '==', schoolId),
    where('academicYear', '==', academicYear)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        ...(d.data() as EquipmentIssueRecord),
        id: d.id,
      }));
      onUpdate(list);
    },
    (err) => {
      console.warn('WGB EquipmentService: Issues subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveEquipmentItem(
  db: Firestore,
  schoolId: string,
  item: Partial<EquipmentItem>
): Promise<string> {
  const id = item.id || generateId('eq');
  const ref = doc(db, 'equipment_inventory', id);

  await setDoc(
    ref,
    {
      ...item,
      id,
      schoolId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return id;
}

export async function removeEquipmentItem(
  db: Firestore,
  itemId: string
): Promise<void> {
  const ref = doc(db, 'equipment_inventory', itemId);
  await deleteDoc(ref);
}
