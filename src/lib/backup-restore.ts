/**
 * Complete School Data Backup & Restore Engine
 * Waghamba Sports Health Hub
 */

import type { FullSchoolBackupData } from "@/lib/types";
import { getIndiaLocalDateString, getCurrentAcademicYear } from "@/lib/date-utils";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export const BACKUP_FORMAT_VERSION = "6.2.0";

/**
 * Builds the complete export JSON data payload.
 */
export function generateFullBackupData(
  aggregatedData: any,
  userUid: string,
  selectedYear: string
): FullSchoolBackupData {
  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    schoolId: userUid,
    academicYear: selectedYear || getCurrentAcademicYear(),
    schoolProfile: aggregatedData.schoolProfile || null,
    players: aggregatedData.players || [],
    attendance: aggregatedData.attendance || {},
    fitness: aggregatedData.fitness || {},
    fitnessHistory: aggregatedData.fitnessHistory || {},
    sportSkills: aggregatedData.sportSkills || {},
    skillsHistory: aggregatedData.skillsHistory || {},
    dailyReadiness: aggregatedData.dailyReadiness || {},
    tacticalEvents: aggregatedData.tacticalEvents || [],
    goals: aggregatedData.goals || [],
    teams: aggregatedData.teams || {},
    teamPlans: aggregatedData.teamPlans || {},
    schoolActivities: aggregatedData.schoolActivities || [],
    healthIncidents: aggregatedData.healthIncidents || [],
    dailySummaries: aggregatedData.dailySummaries || {},
    drillCompletions: aggregatedData.drillCompletions || {},
    reportPhotos: aggregatedData.reportPhotos || {},
    equipmentInventory: aggregatedData.equipmentList || [],
    equipmentIssues: aggregatedData.equipmentIssues || [],
    equipmentIndents: aggregatedData.equipmentIndents || [],
    gameRules: aggregatedData.gameRules || {},
    examConfigs: aggregatedData.examConfigs || {},
    performanceConfigs: aggregatedData.performanceConfigs || {},
  };
}

/**
 * Triggers a browser download of the full backup JSON file.
 */
export function downloadBackupJson(backupData: FullSchoolBackupData, schoolName?: string) {
  const sanitizedName = (schoolName || "School")
    .replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, "_")
    .substring(0, 30);
  const dateStr = getIndiaLocalDateString();
  const filename = `WGB_Backup_${sanitizedName}_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface RestoreSummary {
  success: boolean;
  totalRecords: number;
  importedCounts: Record<string, number>;
  skippedCounts: Record<string, number>;
  errors: string[];
}

/**
 * Validates a parsed backup object.
 */
export function validateBackupStructure(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid backup file: Not a valid JSON object." };
  }
  if (!data.version && !data.exportedAt && !data.data) {
    return { valid: false, error: "Invalid format: Missing backup metadata or schema keys." };
  }
  return { valid: true };
}

/**
 * Restores all collections from parsed backup into Firestore safely under the target schoolId.
 */
export async function executeRestore(
  backupPayload: any,
  db: any,
  targetSchoolId: string,
  currentAcademicYear: string
): Promise<RestoreSummary> {
  const summary: RestoreSummary = {
    success: true,
    totalRecords: 0,
    importedCounts: {},
    skippedCounts: {},
    errors: [],
  };

  if (!db || !targetSchoolId) {
    summary.success = false;
    summary.errors.push("Firestore or authenticated user not available.");
    return summary;
  }

  // Handle both v6.2 flat payload and legacy wrapped `{ data: { ... } }`
  const root = backupPayload.data ? backupPayload.data : backupPayload;
  const backupYear = backupPayload.academicYear || currentAcademicYear;

  try {
    // 1. School Profile
    if (root.schoolProfile && typeof root.schoolProfile === "object") {
      setDocumentNonBlocking(
        doc(db, "schools", targetSchoolId),
        {
          ...root.schoolProfile,
          id: targetSchoolId,
          ownerId: targetSchoolId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      summary.importedCounts["School Profile"] = 1;
    }

    // 2. Players
    if (Array.isArray(root.players)) {
      let pCount = 0;
      root.players.forEach((p: any) => {
        if (p && p.id) {
          setDocumentNonBlocking(
            doc(db, "players", p.id),
            {
              ...p,
              ownerId: targetSchoolId,
              schoolId: targetSchoolId,
              academicYear: p.academicYear || backupYear,
            },
            { merge: true }
          );
          pCount++;
        }
      });
      summary.importedCounts["Students / Athletes"] = pCount;
    }

    // 3. Attendance
    if (root.attendance && typeof root.attendance === "object") {
      let aCount = 0;
      Object.entries(root.attendance).forEach(([key, status]) => {
        const parts = key.split("_");
        if (parts.length >= 2 && status) {
          const [playerId, date, session = "Morning"] = parts;
          setDocumentNonBlocking(
            doc(db, "attendance_registry", `${playerId}_${date}_${session}`),
            {
              status,
              playerId,
              date,
              session,
              schoolId: targetSchoolId,
              academicYear: backupYear,
            },
            { merge: true }
          );
          aCount++;
        }
      });
      summary.importedCounts["Attendance Records"] = aCount;
    }

    // 4. Fitness Registry
    if (root.fitness && typeof root.fitness === "object") {
      let fCount = 0;
      Object.entries(root.fitness).forEach(([key, fit]: [string, any]) => {
        if (fit && fit.playerId) {
          const dateId = fit.month || fit.date || fit.updatedAt?.split("T")[0] || getIndiaLocalDateString();
          setDocumentNonBlocking(
            doc(db, "fitness_registry", `${fit.playerId}_${dateId}`),
            {
              ...fit,
              playerId: fit.playerId,
              schoolId: targetSchoolId,
              academicYear: fit.academicYear || backupYear,
              updatedAt: fit.updatedAt || new Date().toISOString(),
            },
            { merge: true }
          );
          fCount++;
        }
      });
      summary.importedCounts["Fitness Assessments"] = fCount;
    }

    // 5. Sport Skills
    if (root.sportSkills && typeof root.sportSkills === "object") {
      let sCount = 0;
      Object.entries(root.sportSkills).forEach(([key, skill]: [string, any]) => {
        if (skill && skill.playerId && skill.sportName) {
          const timeId = skill.lastUpdated || Date.now().toString();
          setDocumentNonBlocking(
            doc(db, "skills_registry", `${skill.playerId}_${skill.sportName}_${timeId}`),
            {
              ...skill,
              schoolId: targetSchoolId,
              academicYear: skill.academicYear || backupYear,
            },
            { merge: true }
          );
          sCount++;
        }
      });
      summary.importedCounts["Skill Assessments"] = sCount;
    }

    // 6. Equipment Inventory
    if (Array.isArray(root.equipmentInventory || root.equipmentList)) {
      const items = root.equipmentInventory || root.equipmentList;
      let eqCount = 0;
      items.forEach((item: any) => {
        if (item && item.id) {
          setDocumentNonBlocking(
            doc(db, "equipment_inventory", item.id),
            {
              ...item,
              schoolId: targetSchoolId,
              academicYear: item.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          eqCount++;
        }
      });
      summary.importedCounts["Equipment Items"] = eqCount;
    }

    // 7. Equipment Issues
    if (Array.isArray(root.equipmentIssues)) {
      let issCount = 0;
      root.equipmentIssues.forEach((iss: any) => {
        if (iss && iss.id) {
          setDocumentNonBlocking(
            doc(db, "equipment_issues", iss.id),
            {
              ...iss,
              schoolId: targetSchoolId,
              academicYear: iss.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          issCount++;
        }
      });
      summary.importedCounts["Equipment Issues"] = issCount;
    }

    // 8. Equipment Indents
    if (Array.isArray(root.equipmentIndents)) {
      let indCount = 0;
      root.equipmentIndents.forEach((ind: any) => {
        if (ind && ind.id) {
          setDocumentNonBlocking(
            doc(db, "equipment_indents", ind.id),
            {
              ...ind,
              schoolId: targetSchoolId,
              academicYear: ind.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          indCount++;
        }
      });
      summary.importedCounts["Equipment Indents"] = indCount;
    }

    // 9. Health Incidents
    if (Array.isArray(root.healthIncidents)) {
      let hCount = 0;
      root.healthIncidents.forEach((inc: any) => {
        if (inc && inc.id) {
          setDocumentNonBlocking(
            doc(db, "all_health_incidents", inc.id),
            {
              ...inc,
              schoolId: targetSchoolId,
              academicYear: inc.academicYear || backupYear,
            },
            { merge: true }
          );
          hCount++;
        }
      });
      summary.importedCounts["Health Incidents"] = hCount;
    }

    // 10. Goals
    if (Array.isArray(root.goals)) {
      let gCount = 0;
      root.goals.forEach((g: any) => {
        if (g && g.id) {
          setDocumentNonBlocking(
            doc(db, "goal_registry", g.id),
            {
              ...g,
              schoolId: targetSchoolId,
              academicYear: g.academicYear || backupYear,
            },
            { merge: true }
          );
          gCount++;
        }
      });
      summary.importedCounts["Goals"] = gCount;
    }

    // 11. Tactical Events
    if (Array.isArray(root.tacticalEvents)) {
      let tCount = 0;
      root.tacticalEvents.forEach((t: any) => {
        if (t && t.id) {
          setDocumentNonBlocking(
            doc(db, "tactical_registry", t.id),
            {
              ...t,
              schoolId: targetSchoolId,
              academicYear: t.academicYear || backupYear,
            },
            { merge: true }
          );
          tCount++;
        }
      });
      summary.importedCounts["Tactical Events"] = tCount;
    }

    // 12. School Activities
    if (Array.isArray(root.schoolActivities)) {
      let actCount = 0;
      root.schoolActivities.forEach((act: any) => {
        if (act && act.id) {
          setDocumentNonBlocking(
            doc(db, "school_activities", act.id),
            {
              ...act,
              schoolId: targetSchoolId,
              academicYear: act.academicYear || backupYear,
            },
            { merge: true }
          );
          actCount++;
        }
      });
      summary.importedCounts["Activities"] = actCount;
    }

    summary.totalRecords = Object.values(summary.importedCounts).reduce(
      (a, b) => a + b,
      0
    );
  } catch (err: any) {
    summary.success = false;
    summary.errors.push(err?.message || "Unknown error during data restore.");
  }

  return summary;
}
