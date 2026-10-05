/**
 * Complete School Data Backup & Restore Engine
 * Waghamba Sports Health Hub
 */

import type { FullSchoolBackupData } from "@/lib/types";
import { getIndiaLocalDateString, getCurrentAcademicYear } from "@/lib/date-utils";
import { doc, writeBatch, setDoc } from "firebase/firestore";

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

interface RestoreOp {
  type: string;
  ref: any;
  data: any;
}

/**
 * Restores all collections from parsed backup into Firestore safely under the target schoolId.
 * Executes writes in manageable chunks via writeBatch with sequential fallback.
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
  const operations: RestoreOp[] = [];

  try {
    // 1. School Profile
    if (root.schoolProfile && typeof root.schoolProfile === "object") {
      operations.push({
        type: "School Profile",
        ref: doc(db, "schools", targetSchoolId),
        data: {
          ...root.schoolProfile,
          id: targetSchoolId,
          ownerId: targetSchoolId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // 2. Players
    if (Array.isArray(root.players)) {
      root.players.forEach((p: any) => {
        if (p && p.id) {
          operations.push({
            type: "Students / Athletes",
            ref: doc(db, "players", p.id),
            data: {
              ...p,
              ownerId: targetSchoolId,
              schoolId: targetSchoolId,
              academicYear: p.academicYear || backupYear,
              updatedAt: p.updatedAt || new Date().toISOString(),
            },
          });
        }
      });
    }

    // 3. Attendance
    if (root.attendance && typeof root.attendance === "object") {
      Object.entries(root.attendance).forEach(([key, status]) => {
        const parts = key.split("_");
        if (parts.length >= 2 && status) {
          const [playerId, date, session = "Morning"] = parts;
          operations.push({
            type: "Attendance Records",
            ref: doc(db, "attendance_registry", `${playerId}_${date}_${session}`),
            data: {
              status,
              playerId,
              date,
              session,
              schoolId: targetSchoolId,
              academicYear: backupYear,
            },
          });
        }
      });
    }

    // 4. Fitness Registry
    if (root.fitness && typeof root.fitness === "object") {
      Object.entries(root.fitness).forEach(([key, fit]: [string, any]) => {
        if (fit && fit.playerId) {
          const dateId = fit.month || fit.date || fit.updatedAt?.split("T")[0] || getIndiaLocalDateString();
          operations.push({
            type: "Fitness Assessments",
            ref: doc(db, "fitness_registry", `${fit.playerId}_${dateId}`),
            data: {
              ...fit,
              playerId: fit.playerId,
              schoolId: targetSchoolId,
              academicYear: fit.academicYear || backupYear,
              updatedAt: fit.updatedAt || new Date().toISOString(),
            },
          });
        }
      });
    }

    // 5. Sport Skills
    if (root.sportSkills && typeof root.sportSkills === "object") {
      Object.entries(root.sportSkills).forEach(([key, skill]: [string, any]) => {
        if (skill && skill.playerId && skill.sportName) {
          const timeId = skill.lastUpdated || Date.now().toString();
          operations.push({
            type: "Skill Assessments",
            ref: doc(db, "skills_registry", `${skill.playerId}_${skill.sportName}_${timeId}`),
            data: {
              ...skill,
              schoolId: targetSchoolId,
              academicYear: skill.academicYear || backupYear,
            },
          });
        }
      });
    }

    // 6. Equipment Inventory
    if (Array.isArray(root.equipmentInventory || root.equipmentList)) {
      const items = root.equipmentInventory || root.equipmentList;
      items.forEach((item: any) => {
        if (item && item.id) {
          operations.push({
            type: "Equipment Items",
            ref: doc(db, "equipment_inventory", item.id),
            data: {
              ...item,
              schoolId: targetSchoolId,
              academicYear: item.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      });
    }

    // 7. Equipment Issues
    if (Array.isArray(root.equipmentIssues)) {
      root.equipmentIssues.forEach((iss: any) => {
        if (iss && iss.id) {
          operations.push({
            type: "Equipment Issues",
            ref: doc(db, "equipment_issues", iss.id),
            data: {
              ...iss,
              schoolId: targetSchoolId,
              academicYear: iss.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      });
    }

    // 8. Equipment Indents
    if (Array.isArray(root.equipmentIndents)) {
      root.equipmentIndents.forEach((ind: any) => {
        if (ind && ind.id) {
          operations.push({
            type: "Equipment Indents",
            ref: doc(db, "equipment_indents", ind.id),
            data: {
              ...ind,
              schoolId: targetSchoolId,
              academicYear: ind.academicYear || backupYear,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      });
    }

    // 9. Health Incidents
    if (Array.isArray(root.healthIncidents)) {
      root.healthIncidents.forEach((inc: any) => {
        if (inc && inc.id) {
          operations.push({
            type: "Health Incidents",
            ref: doc(db, "all_health_incidents", inc.id),
            data: {
              ...inc,
              schoolId: targetSchoolId,
              academicYear: inc.academicYear || backupYear,
            },
          });
        }
      });
    }

    // 10. Goals
    if (Array.isArray(root.goals)) {
      root.goals.forEach((g: any) => {
        if (g && g.id) {
          operations.push({
            type: "Goals",
            ref: doc(db, "goal_registry", g.id),
            data: {
              ...g,
              schoolId: targetSchoolId,
              academicYear: g.academicYear || backupYear,
            },
          });
        }
      });
    }

    // 11. Tactical Events
    if (Array.isArray(root.tacticalEvents)) {
      root.tacticalEvents.forEach((t: any) => {
        if (t && t.id) {
          operations.push({
            type: "Tactical Events",
            ref: doc(db, "tactical_registry", t.id),
            data: {
              ...t,
              schoolId: targetSchoolId,
              academicYear: t.academicYear || backupYear,
            },
          });
        }
      });
    }

    // 12. School Activities
    if (Array.isArray(root.schoolActivities)) {
      root.schoolActivities.forEach((act: any) => {
        if (act && act.id) {
          operations.push({
            type: "Activities",
            ref: doc(db, "school_activities", act.id),
            data: {
              ...act,
              schoolId: targetSchoolId,
              academicYear: act.academicYear || backupYear,
            },
          });
        }
      });
    }

    // 13. Daily Summaries
    if (root.dailySummaries && typeof root.dailySummaries === "object") {
      Object.entries(root.dailySummaries).forEach(([date, summaryData]: [string, any]) => {
        if (summaryData) {
          operations.push({
            type: "Daily Summaries",
            ref: doc(db, "daily_summaries", date),
            data: {
              ...summaryData,
              date,
              schoolId: targetSchoolId,
              academicYear: backupYear,
            },
          });
        }
      });
    }

    // 14. Team Plans
    if (root.teamPlans && typeof root.teamPlans === "object") {
      Object.entries(root.teamPlans).forEach(([id, plan]: [string, any]) => {
        if (plan) {
          operations.push({
            type: "Team Plans",
            ref: doc(db, "team_plans", id),
            data: {
              ...plan,
              schoolId: targetSchoolId,
              academicYear: backupYear,
            },
          });
        }
      });
    }

    // 15. Rules & Configs
    if (root.gameRules && typeof root.gameRules === "object") {
      Object.entries(root.gameRules).forEach(([id, rule]: [string, any]) => {
        if (rule) {
          operations.push({
            type: "Game Rules",
            ref: doc(db, "game_rules_registry", id),
            data: { ...rule, schoolId: targetSchoolId },
          });
        }
      });
    }

    if (root.examConfigs && typeof root.examConfigs === "object") {
      Object.entries(root.examConfigs).forEach(([id, conf]: [string, any]) => {
        if (conf) {
          operations.push({
            type: "Exam Configs",
            ref: doc(db, "exam_configs", id),
            data: { labels: conf, schoolId: targetSchoolId },
          });
        }
      });
    }

    if (root.performanceConfigs && typeof root.performanceConfigs === "object") {
      Object.entries(root.performanceConfigs).forEach(([id, conf]: [string, any]) => {
        if (conf) {
          operations.push({
            type: "Performance Configs",
            ref: doc(db, "performance_configs", id),
            data: { labels: conf, schoolId: targetSchoolId },
          });
        }
      });
    }

    // Execute in controlled chunks of 50 items to avoid overwhelming IndexedDB / Firestore payload limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
      const chunk = operations.slice(i, i + CHUNK_SIZE);
      try {
        const batch = writeBatch(db);
        chunk.forEach((op) => batch.set(op.ref, op.data, { merge: true }));
        await batch.commit();
        chunk.forEach((op) => {
          summary.importedCounts[op.type] = (summary.importedCounts[op.type] || 0) + 1;
        });
      } catch (batchErr: any) {
        console.warn(`WGB: Batch commit failed at chunk offset ${i}, falling back to sequential writes:`, batchErr);
        for (const op of chunk) {
          try {
            await setDoc(op.ref, op.data, { merge: true });
            summary.importedCounts[op.type] = (summary.importedCounts[op.type] || 0) + 1;
          } catch (singleErr: any) {
            summary.skippedCounts[op.type] = (summary.skippedCounts[op.type] || 0) + 1;
            summary.errors.push(`Failed to save ${op.type} (${op.ref.id}): ${singleErr?.message || singleErr}`);
          }
        }
      }
    }

    summary.totalRecords = Object.values(summary.importedCounts).reduce(
      (a, b) => a + b,
      0
    );
    summary.success = summary.totalRecords > 0 || operations.length === 0;
  } catch (err: any) {
    summary.success = false;
    summary.errors.push(err?.message || "Unknown error during data restore.");
  }

  return summary;
}
