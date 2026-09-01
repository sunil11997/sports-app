/**
 * Safe Account & Tenant Data Migration
 * Waghamba Sports Health Hub
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  Firestore,
} from "firebase/firestore";

export interface MigrationResult {
  success: boolean;
  sourceUid: string;
  targetUid: string;
  migratedCounts: Record<string, number>;
  error?: string;
}

const COLLECTIONS_TO_MIGRATE = [
  { name: "players", field: "ownerId", updateSchoolId: true },
  { name: "attendance_registry", field: "schoolId", updateSchoolId: true },
  { name: "fitness_registry", field: "schoolId", updateSchoolId: true },
  { name: "skills_registry", field: "schoolId", updateSchoolId: true },
  { name: "readiness_registry", field: "schoolId", updateSchoolId: true },
  { name: "equipment_inventory", field: "schoolId", updateSchoolId: true },
  { name: "equipment_issues", field: "schoolId", updateSchoolId: true },
  { name: "equipment_indents", field: "schoolId", updateSchoolId: true },
  { name: "all_health_incidents", field: "schoolId", updateSchoolId: true },
  { name: "goal_registry", field: "schoolId", updateSchoolId: true },
  { name: "tactical_registry", field: "schoolId", updateSchoolId: true },
  { name: "team_plans", field: "schoolId", updateSchoolId: true },
  { name: "school_activities", field: "schoolId", updateSchoolId: true },
  { name: "drill_completions", field: "schoolId", updateSchoolId: true },
  { name: "daily_summaries", field: "schoolId", updateSchoolId: true },
  { name: "report_photos", field: "schoolId", updateSchoolId: true },
  { name: "exam_configs", field: "schoolId", updateSchoolId: true },
  { name: "performance_configs", field: "schoolId", updateSchoolId: true },
];

/**
 * Migrates data from anonymous sourceUid to target permanent UID.
 */
export async function migrateSchoolData(
  db: Firestore,
  sourceUid: string,
  targetUid: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    sourceUid,
    targetUid,
    migratedCounts: {},
  };

  if (!db || !sourceUid || !targetUid || sourceUid === targetUid) {
    result.success = false;
    result.error = "Invalid source or target credentials.";
    return result;
  }

  try {
    // 1. Migrate School Profile
    const sourceSchoolSnap = await getDocs(
      query(collection(db, "schools"), where("ownerId", "==", sourceUid))
    );
    if (!sourceSchoolSnap.empty) {
      const sourceSchool = sourceSchoolSnap.docs[0].data();
      const batch = writeBatch(db);
      const targetSchoolRef = doc(db, "schools", targetUid);
      batch.set(
        targetSchoolRef,
        {
          ...sourceSchool,
          id: targetUid,
          ownerId: targetUid,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await batch.commit();
      result.migratedCounts["School Profile"] = 1;
    }

    // 2. Migrate Other Tenant Collections
    for (const colDef of COLLECTIONS_TO_MIGRATE) {
      const q = query(
        collection(db, colDef.name),
        where(colDef.field, "==", sourceUid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        let count = 0;
        // Firestore batches allow up to 500 writes
        let batch = writeBatch(db);
        let batchOpCount = 0;

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const docRef = doc(db, colDef.name, docSnap.id);

          const updatePayload: any = {
            [colDef.field]: targetUid,
            updatedAt: new Date().toISOString(),
          };
          if (colDef.updateSchoolId) {
            updatePayload.schoolId = targetUid;
          }
          if (data.ownerId && data.ownerId === sourceUid) {
            updatePayload.ownerId = targetUid;
          }

          batch.set(docRef, updatePayload, { merge: true });
          batchOpCount++;
          count++;

          if (batchOpCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            batchOpCount = 0;
          }
        }

        if (batchOpCount > 0) {
          await batch.commit();
        }

        result.migratedCounts[colDef.name] = count;
      }
    }
  } catch (err: any) {
    result.success = false;
    result.error = err?.message || "Error during tenant migration.";
  }

  return result;
}
