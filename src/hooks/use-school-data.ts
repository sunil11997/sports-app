"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { collection, doc, query, where, onSnapshot } from "firebase/firestore";
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from "@/firebase";
import type {
  Player,
  AttendanceRecord,
  FitnessAssessment,
  SportSkill,
  HealthIncident,
  SchoolProfile,
  ExamLabels,
  PerformanceLabels,
  TacticalEvent,
  GoalRecord,
  EquipmentItem,
  EquipmentIssueRecord,
  IndentItem,
} from "@/lib/types";
import {
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { guessMarathiName } from "@/lib/utils";
import {
  getCurrentAcademicYear,
  getAvailableAcademicYears,
  getIndiaLocalDateString,
} from "@/lib/date-utils";
import {
  generateFullBackupData,
  downloadBackupJson,
  executeRestore,
  type RestoreSummary,
} from "@/lib/backup-restore";

const OFFLINE_ATTENDANCE_KEY = "wgb_offline_attendance_queue";
const OFFLINE_EQUIPMENT_KEY = "wgb_offline_equipment_stock";

/**
 * useSchoolData - Institutional Registry Engine v6.2.0
 * Hardened for dynamic Academic Years (IST), Firestore Equipment collections, complete Backup/Restore.
 */
export function useSchoolData(isActive: boolean = true) {
  const db = useFirestore();
  const { user } = useUser();
  const syncLockRef = useRef(false);

  const [selectedYear, setSelectedYear] = useState<string>(() => getCurrentAcademicYear());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});
  const [gameRules, setGameRulesData] = useState<Record<string, any>>({});
  const [examConfigs, setExamConfigs] = useState<Record<string, ExamLabels>>({});
  const [performanceConfigs, setPerformanceConfigs] = useState<Record<string, PerformanceLabels>>({});
  const [dailyReadiness, setDailyReadinessData] = useState<Record<string, any>>({});
  const [tacticalEvents, setTacticalEventsData] = useState<TacticalEvent[]>([]);
  const [goals, setGoalsData] = useState<GoalRecord[]>([]);
  const [reportPhotos, setReportPhotosData] = useState<Record<string, any[]>>({});
  const [dailySummaries, setDailySummariesData] = useState<Record<string, { summary: string; weather: string }>>({});
  const [drillCompletions, setDrillCompletionsData] = useState<Record<string, boolean>>({});
  const [teamPlans, setTeamPlans] = useState<Record<string, any>>({});
  const [drillCompletionsRaw, setDrillCompletionsRaw] = useState<any[]>([]);

  // Equipment Collections
  const [equipmentList, setEquipmentListData] = useState<EquipmentItem[]>([]);
  const [equipmentIssues, setEquipmentIssuesData] = useState<EquipmentIssueRecord[]>([]);
  const [equipmentIndents, setEquipmentIndentsData] = useState<IndentItem[]>([]);

  // Memoized Firebase References
  const schoolDocRef = useMemoFirebase(
    () => (user && db && isActive ? doc(db, "schools", user.uid) : null),
    [db, user, isActive]
  );
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  const playersQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, "players"), where("ownerId", "==", user.uid));
  }, [db, user, isActive]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  const incidentsQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(
      collection(db, "all_health_incidents"),
      where("schoolId", "==", user.uid),
      where("academicYear", "==", selectedYear)
    );
  }, [db, user, selectedYear, isActive]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(
      collection(db, "school_activities"),
      where("schoolId", "==", user.uid),
      where("academicYear", "==", selectedYear)
    );
  }, [db, user, selectedYear, isActive]);
  const { data: schoolActivities } = useCollection(activitiesQuery);

  // Sync Offline Attendance Queue
  const syncOfflineAttendance = useCallback(async () => {
    if (!user || !db || !navigator.onLine || syncLockRef.current) return;

    const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
    if (!queueStr) return;

    const queue: AttendanceRecord = JSON.parse(queueStr);
    const keys = Object.keys(queue);
    if (keys.length === 0) return;

    syncLockRef.current = true;
    setIsSyncing(true);

    try {
      for (const key of keys) {
        const status = queue[key];
        const parts = key.split("_");
        if (parts.length < 3) continue;
        const session = parts.pop()!;
        const date = parts.pop()!;
        const playerId = parts.join("_");
        const attRef = doc(db, "attendance_registry", `${playerId}_${date}_${session}`);

        if (!status) {
          deleteDocumentNonBlocking(attRef);
        } else {
          setDocumentNonBlocking(
            attRef,
            {
              status,
              playerId,
              date,
              session,
              schoolId: user.uid,
              academicYear: selectedYear,
            },
            { merge: true }
          );
        }
        delete queue[key];
      }
      localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
      setPendingCount(0);
    } catch (error) {
      console.warn("WGB: Offline sync failed, retry required.", error);
    } finally {
      setIsSyncing(false);
      syncLockRef.current = false;
    }
  }, [db, user, selectedYear]);

  // Firestore Real-time Subscriptions
  useEffect(() => {
    if (!user || !db || !isActive) return;

    const handleSync = () => syncOfflineAttendance();
    window.addEventListener("online", handleSync);
    handleSync();

    const today = getIndiaLocalDateString();
    const unsubs = [
      onSnapshot(
        query(
          collection(db, "attendance_registry"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const newAtt: AttendanceRecord = {};
          snapshot.docs.forEach((doc) => {
            const d = doc.data();
            const sessionSuffix = d.session ? `_${d.session}` : "_Morning";
            newAtt[`${d.playerId}_${d.date}${sessionSuffix}`] = d.status;
          });
          const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
          if (queueStr) {
            const queue = JSON.parse(queueStr);
            setAttendanceData({ ...newAtt, ...queue });
            setPendingCount(Object.keys(queue).length);
          } else {
            setAttendanceData(newAtt);
          }
        }
      ),
      onSnapshot(
        query(
          collection(db, "fitness_registry"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const latestMap: Record<string, FitnessAssessment> = {};
          const historyMap: Record<string, FitnessAssessment[]> = {};
          snapshot.docs.forEach((doc) => {
            const data = doc.data() as FitnessAssessment;
            const pId = data.playerId;
            if (!pId) return;
            if (
              !latestMap[pId] ||
              (data.updatedAt &&
                latestMap[pId].updatedAt &&
                new Date(data.updatedAt) > new Date(latestMap[pId].updatedAt!))
            ) {
              latestMap[pId] = data;
            }
            if (!historyMap[pId]) historyMap[pId] = [];
            historyMap[pId].push({
              ...data,
              date: data.date || data.updatedAt?.split("T")[0],
            });
          });
          setFitnessData(latestMap);
          setFitnessHistory(historyMap);
        }
      ),
      onSnapshot(
        query(
          collection(db, "skills_registry"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const skillsMap: Record<string, SportSkill> = {};
          snapshot.docs.forEach((doc) => {
            const data = doc.data() as SportSkill;
            const pId = data.playerId;
            if (!pId) return;
            const key = `${pId}_${data.sportName}`;
            if (
              !skillsMap[key] ||
              (data.lastUpdated &&
                skillsMap[key].lastUpdated &&
                new Date(data.lastUpdated) > new Date(skillsMap[key].lastUpdated!))
            ) {
              skillsMap[key] = data;
            }
          });
          setSportSkillsData(skillsMap);
        }
      ),
      onSnapshot(
        query(
          collection(db, "readiness_registry"),
          where("schoolId", "==", user.uid),
          where("date", "==", today)
        ),
        (snapshot) => {
          const map: Record<string, any> = {};
          snapshot.docs.forEach((doc) => {
            const d = doc.data();
            map[d.playerId] = d;
          });
          setDailyReadinessData(map);
        }
      ),
      onSnapshot(
        query(
          collection(db, "tactical_registry"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const events: TacticalEvent[] = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as TacticalEvent)
          );
          setTacticalEventsData(
            events.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
          );
        }
      ),
      onSnapshot(
        query(collection(db, "drill_completions"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const map: Record<string, boolean> = {};
          const rawList: any[] = [];
          snapshot.docs.forEach((doc) => {
            map[doc.id] = true;
            rawList.push(doc.data());
          });
          setDrillCompletionsData(map);
          setDrillCompletionsRaw(rawList);
        }
      ),
      onSnapshot(
        query(collection(db, "game_rules_registry"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const rulesMap: Record<string, any> = {};
          snapshot.docs.forEach((doc) => (rulesMap[doc.id] = doc.data()));
          setGameRulesData(rulesMap);
        }
      ),
      onSnapshot(
        query(collection(db, "exam_configs"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const configMap: Record<string, ExamLabels> = {};
          snapshot.docs.forEach((doc) => (configMap[doc.id] = doc.data().labels as ExamLabels));
          setExamConfigs(configMap);
        }
      ),
      onSnapshot(
        query(collection(db, "performance_configs"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const configMap: Record<string, PerformanceLabels> = {};
          snapshot.docs.forEach(
            (doc) => (configMap[doc.id] = doc.data().labels as PerformanceLabels)
          );
          setPerformanceConfigs(configMap);
        }
      ),
      onSnapshot(
        query(
          collection(db, "team_plans"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const plansMap: Record<string, any> = {};
          snapshot.docs.forEach((doc) => {
            plansMap[doc.id] = doc.data();
          });
          setTeamPlans(plansMap);
        }
      ),
      onSnapshot(
        query(
          collection(db, "goal_registry"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const goalsList: GoalRecord[] = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as GoalRecord)
          );
          setGoalsData(goalsList);
        }
      ),
      onSnapshot(
        query(collection(db, "report_photos"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const photosMap: Record<string, any[]> = {};
          snapshot.docs.forEach((doc) => {
            const p = doc.data();
            const date = p.date;
            if (!date) return;
            if (!photosMap[date]) photosMap[date] = [];
            photosMap[date].push({ ...p, id: doc.id });
          });
          setReportPhotosData(photosMap);
        }
      ),
      onSnapshot(
        query(collection(db, "daily_summaries"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const summariesMap: Record<string, { summary: string; weather: string }> = {};
          snapshot.docs.forEach((doc) => {
            const d = doc.data();
            if (d.date) summariesMap[d.date] = { summary: d.summary || "", weather: d.weather || "Sunny" };
          });
          setDailySummariesData(summariesMap);
        }
      ),
      // Equipment Inventory Listeners
      onSnapshot(
        query(collection(db, "equipment_inventory"), where("schoolId", "==", user.uid)),
        (snapshot) => {
          const items: EquipmentItem[] = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as EquipmentItem)
          );
          setEquipmentListData(items);
          if (typeof window !== "undefined" && items.length > 0) {
            localStorage.setItem(OFFLINE_EQUIPMENT_KEY, JSON.stringify(items));
          }
        }
      ),
      onSnapshot(
        query(
          collection(db, "equipment_issues"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const issues: EquipmentIssueRecord[] = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as EquipmentIssueRecord)
          );
          setEquipmentIssuesData(issues);
        }
      ),
      onSnapshot(
        query(
          collection(db, "equipment_indents"),
          where("schoolId", "==", user.uid),
          where("academicYear", "==", selectedYear)
        ),
        (snapshot) => {
          const indents: IndentItem[] = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as IndentItem)
          );
          setEquipmentIndentsData(indents);
        }
      ),
    ];

    return () => {
      window.removeEventListener("online", handleSync);
      unsubs.forEach((unsub) => unsub());
    };
  }, [db, user, selectedYear, syncOfflineAttendance, isActive]);

  // Aggregated Data Object
  const aggregatedData = useMemo(() => {
    const dbPlayers = allPlayers || [];

    return {
      players: dbPlayers,
      attendance,
      fitness,
      fitnessHistory,
      sportSkills,
      skillsHistory,
      drillCompletions,
      drillCompletionsRaw,
      gameRules,
      examConfigs,
      performanceConfigs,
      dailyReadiness,
      tacticalEvents,
      goals,
      reportPhotos,
      dailySummaries,
      schoolActivities: schoolActivities || [],
      healthIncidents: healthIncidents || [],
      teamPlans,
      equipmentList,
      equipmentIssues,
      equipmentIndents,
      schoolProfile: (schoolProfile as SchoolProfile | null) || ({
        name: "शासकीय माध्यमिक आश्रम शाळा, वाघंबा",
        nameMarathi: "शासकीय माध्यमिक आश्रम शाळा, वाघंबा",
        schoolName: "शासकीय माध्यमिक आश्रम शाळा, वाघंबा",
        teacherName: "श्री. सुनील पंडित",
        taluka: "बागलाण",
        district: "नाशिक",
        id: user?.uid || "default",
        qualification: "B.P.Ed / M.P.Ed",
        role: "Physical Education Director",
        updatedAt: new Date().toISOString(),
        passcode: "",
        adminEmail: "",
      } as SchoolProfile),
    };
  }, [
    allPlayers,
    healthIncidents,
    attendance,
    fitness,
    fitnessHistory,
    sportSkills,
    skillsHistory,
    gameRules,
    examConfigs,
    performanceConfigs,
    schoolProfile,
    dailyReadiness,
    tacticalEvents,
    goals,
    reportPhotos,
    dailySummaries,
    drillCompletions,
    drillCompletionsRaw,
    schoolActivities,
    teamPlans,
    equipmentList,
    equipmentIssues,
    equipmentIndents,
    user,
  ]);

  return {
    data: aggregatedData,
    isLoaded: !!db && !playersLoading && !schoolsLoading,
    selectedYear,
    setSelectedYear,
    availableAcademicYears: getAvailableAcademicYears(2023, 7),
    pendingSyncCount: pendingCount,
    isSyncing,

    saveSchoolProfile: (profile: any) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "schools", user.uid),
        { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    updatePasscode: (passcode: string) => {
      if (typeof window !== "undefined") {
        if (passcode) {
          localStorage.setItem("wgb_app_pin_lock", passcode);
        } else {
          localStorage.removeItem("wgb_app_pin_lock");
        }
      }
      if (!user || !db) return;
      updateDocumentNonBlocking(doc(db, "schools", user.uid), { passcode });
    },

    addPlayer: (playerData: any) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "players", playerData.id),
        {
          ...playerData,
          ownerId: user.uid,
          schoolId: user.uid,
          academicYear: selectedYear,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },

    updatePlayer: (player: any) => {
      if (!db || !user) return;
      setDocumentNonBlocking(
        doc(db, "players", player.id),
        {
          ...player,
          ownerId: user.uid,
          schoolId: user.uid,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },

    deletePlayer: (playerId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "players", playerId));
    },

    setTeamPlan: (sport: string, date: string, plan: any) => {
      if (!user || !db) return;
      const id = `${user.uid}_${sport}_${date}`;
      setDocumentNonBlocking(
        doc(db, "team_plans", id),
        {
          ...plan,
          id,
          sport,
          date,
          schoolId: user.uid,
          academicYear: selectedYear,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },

    addActivity: (act: any) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "school_activities", act.id),
        { ...act, schoolId: user.uid, academicYear: selectedYear, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    deleteActivity: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "school_activities", id));
    },

    setAttendance: (newAttendance: AttendanceRecord) => {
      if (!user || !db) return;
      setAttendanceData((prev) => ({ ...prev, ...newAttendance }));
      Object.entries(newAttendance).forEach(([key, status]) => {
        const parts = key.split("_");
        if (parts.length < 3) return;
        const session = parts.pop()!;
        const date = parts.pop()!;
        const playerId = parts.join("_");
        const attRef = doc(db, "attendance_registry", `${playerId}_${date}_${session}`);
        if (!navigator.onLine) {
          const q = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || "{}");
          q[key] = status;
          localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(q));
          setPendingCount(Object.keys(q).length);
        } else {
          if (!status) deleteDocumentNonBlocking(attRef);
          else
            setDocumentNonBlocking(
              attRef,
              {
                status,
                playerId,
                date,
                session,
                schoolId: user.uid,
                academicYear: selectedYear,
              },
              { merge: true }
            );
        }
      });
    },

    setFitness: (playerId: string, assessment: FitnessAssessment) => {
      if (!user || !db) return;
      const dateId = assessment.month || getIndiaLocalDateString();
      setDocumentNonBlocking(
        doc(db, "fitness_registry", `${playerId}_${dateId}`),
        {
          ...assessment,
          playerId,
          schoolId: user.uid,
          date: dateId,
          updatedAt: new Date().toISOString(),
          academicYear: selectedYear,
        },
        { merge: true }
      );
    },

    setReadiness: (playerId: string, d: any) => {
      if (!user || !db) return;
      const dateId = getIndiaLocalDateString();
      setDocumentNonBlocking(
        doc(db, "readiness_registry", `${playerId}_${dateId}`),
        {
          ...d,
          playerId,
          schoolId: user.uid,
          date: dateId,
          timestamp: new Date().toISOString(),
          academicYear: selectedYear,
        },
        { merge: true }
      );
    },

    addTacticalEvent: (e: any) => {
      if (!user || !db) return;
      const id = Math.random().toString(36).substr(2, 9);
      setDocumentNonBlocking(
        doc(db, "tactical_registry", id),
        { ...e, id, schoolId: user.uid, academicYear: selectedYear, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    deleteTacticalEvent: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "tactical_registry", id));
    },

    setGoal: (g: any) => {
      if (!user || !db) return;
      const id = `${g.playerId}_${g.month}_${g.metric.replace(/\s+/g, "_")}`;
      setDocumentNonBlocking(
        doc(db, "goal_registry", id),
        { ...g, id, schoolId: user.uid, academicYear: selectedYear, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    deleteGoal: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "goal_registry", id));
    },

    saveDailySummary: (date: string, summary: string, weather: string) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "daily_summaries", `${user.uid}_${date}`),
        {
          schoolId: user.uid,
          date,
          summary,
          weather,
          academicYear: selectedYear,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },

    saveReportPhoto: (photo: any) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "report_photos", photo.id),
        {
          ...photo,
          schoolId: user.uid,
          academicYear: selectedYear,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },

    deleteReportPhoto: (photoId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "report_photos", photoId));
    },

    setExamLabels: (std: string, term: string, labels: ExamLabels) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "exam_configs", `${std}_${term}`),
        { labels, std, term, schoolId: user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    setPerformanceLabels: (std: string, month: string, labels: PerformanceLabels) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "performance_configs", `${std}_${month}`),
        { labels, std, month, schoolId: user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    setSportSkill: (pId: string, sport: string, skill: SportSkill) => {
      if (!user || !db) return;
      const timeId = new Date().getTime().toString();
      setDocumentNonBlocking(
        doc(db, "skills_registry", `${pId}_${sport}_${timeId}`),
        {
          ...skill,
          playerId: pId,
          sportName: sport,
          schoolId: user.uid,
          lastUpdated: new Date().toISOString(),
          academicYear: selectedYear,
        },
        { merge: true }
      );
    },

    setDrillCompletion: (
      dId: string,
      pId: string,
      comp: boolean,
      meta?: { sportName?: string; drillName?: string; gender?: string; std?: string }
    ) => {
      if (!user || !db) return;
      const refId = `${pId}_${dId}`;
      if (comp) {
        setDocumentNonBlocking(
          doc(db, "drill_completions", refId),
          {
            id: refId,
            schoolId: user.uid,
            playerId: pId,
            drillId: dId,
            sportName: meta?.sportName || dId.split("_")[0] || "",
            drillName: meta?.drillName || dId.split("_")[1] || "",
            gender: meta?.gender || "",
            std: meta?.std || "",
            timestamp: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        deleteDocumentNonBlocking(doc(db, "drill_completions", refId));
      }
    },

    setGameRule: (s: string, pdf: string | null) => {
      if (!user || !db) return;
      if (!pdf) deleteDocumentNonBlocking(doc(db, "game_rules_registry", s));
      else
        setDocumentNonBlocking(
          doc(db, "game_rules_registry", s),
          { sportName: s, pdfData: pdf, schoolId: user.uid, updatedAt: new Date().toISOString() },
          { merge: true }
        );
    },

    addHealthIncident: (i: HealthIncident) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "all_health_incidents", i.id),
        { ...i, schoolId: user.uid, academicYear: selectedYear, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    deleteHealthIncident: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "all_health_incidents", id));
    },

    // ==========================================
    // EQUIPMENT INVENTORY OPERATIONS (FIRESTORE)
    // ==========================================
    addEquipmentItem: (item: EquipmentItem) => {
      if (!user || !db) return;
      const now = new Date().toISOString();
      const safeTotal = Math.max(0, item.totalQty || 0);
      const safeAvailable = Math.min(safeTotal, Math.max(0, item.availableQty ?? safeTotal));
      const safeDamaged = Math.min(safeTotal - safeAvailable, Math.max(0, item.damagedQty || 0));

      const payload: EquipmentItem = {
        ...item,
        schoolId: user.uid,
        academicYear: selectedYear,
        totalQty: safeTotal,
        availableQty: safeAvailable,
        damagedQty: safeDamaged,
        createdAt: item.createdAt || now,
        updatedAt: now,
      };

      setDocumentNonBlocking(doc(db, "equipment_inventory", item.id), payload, { merge: true });
    },

    updateEquipmentItem: (item: EquipmentItem) => {
      if (!user || !db) return;
      const now = new Date().toISOString();
      const safeTotal = Math.max(0, item.totalQty || 0);
      const safeAvailable = Math.min(safeTotal, Math.max(0, item.availableQty ?? safeTotal));
      const safeDamaged = Math.min(safeTotal - safeAvailable, Math.max(0, item.damagedQty || 0));

      const payload: EquipmentItem = {
        ...item,
        schoolId: user.uid,
        totalQty: safeTotal,
        availableQty: safeAvailable,
        damagedQty: safeDamaged,
        updatedAt: now,
      };

      setDocumentNonBlocking(doc(db, "equipment_inventory", item.id), payload, { merge: true });
    },

    deleteEquipmentItem: (itemId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "equipment_inventory", itemId));
    },

    issueEquipment: (issue: EquipmentIssueRecord) => {
      if (!user || !db) return false;
      const item = equipmentList.find((e) => e.id === issue.itemId);
      if (!item || item.availableQty < issue.quantity) {
        return false;
      }

      const now = new Date().toISOString();
      // Deduct from available quantity
      const newAvailable = Math.max(0, item.availableQty - issue.quantity);
      setDocumentNonBlocking(
        doc(db, "equipment_inventory", item.id),
        { availableQty: newAvailable, updatedAt: now },
        { merge: true }
      );

      // Record issue
      const issuePayload: EquipmentIssueRecord = {
        ...issue,
        schoolId: user.uid,
        academicYear: selectedYear,
        status: "Issued",
        createdAt: now,
        updatedAt: now,
      };
      setDocumentNonBlocking(doc(db, "equipment_issues", issue.id), issuePayload, { merge: true });
      return true;
    },

    returnEquipment: (
      issueId: string,
      returnDate: string,
      status: "Returned" | "Damaged",
      remarks = "",
      damagedCount = 0
    ) => {
      if (!user || !db) return;
      const issue = equipmentIssues.find((i) => i.id === issueId);
      if (!issue) return;

      const now = new Date().toISOString();
      setDocumentNonBlocking(
        doc(db, "equipment_issues", issueId),
        {
          returnDate: returnDate || getIndiaLocalDateString(),
          status,
          remarks: remarks || issue.remarks,
          updatedAt: now,
        },
        { merge: true }
      );

      const item = equipmentList.find((e) => e.id === issue.itemId);
      if (item) {
        const returnedQty = issue.quantity;
        const validDamaged = Math.min(returnedQty, Math.max(0, damagedCount));
        const returnedToStock = Math.max(0, returnedQty - validDamaged);

        const newAvailable = Math.min(item.totalQty, item.availableQty + returnedToStock);
        const newDamaged = item.damagedQty + validDamaged;

        setDocumentNonBlocking(
          doc(db, "equipment_inventory", item.id),
          {
            availableQty: newAvailable,
            damagedQty: newDamaged,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    },

    addIndentItem: (indent: IndentItem) => {
      if (!user || !db) return;
      const now = new Date().toISOString();
      const payload: IndentItem = {
        ...indent,
        schoolId: user.uid,
        academicYear: selectedYear,
        createdAt: indent.createdAt || now,
        updatedAt: now,
      };
      setDocumentNonBlocking(doc(db, "equipment_indents", indent.id), payload, { merge: true });
    },

    updateIndentItem: (indent: IndentItem) => {
      if (!user || !db) return;
      setDocumentNonBlocking(
        doc(db, "equipment_indents", indent.id),
        { ...indent, schoolId: user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },

    deleteIndentItem: (indentId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, "equipment_indents", indentId));
    },

    // ==========================================
    // BACKUP & RESTORE OPERATIONS
    // ==========================================
    exportBackupData: () => {
      if (!user) return;
      const fullBackup = generateFullBackupData(aggregatedData, user.uid, selectedYear);
      downloadBackupJson(fullBackup, aggregatedData.schoolProfile?.schoolName || aggregatedData.schoolProfile?.name);
    },

    importBackupData: async (backupPayload: any): Promise<RestoreSummary> => {
      if (!user || !db) {
        return {
          success: false,
          totalRecords: 0,
          importedCounts: {},
          skippedCounts: {},
          errors: ["User or database not connected."],
        };
      }
      return executeRestore(backupPayload, db, user.uid, selectedYear);
    },

    autoFixAllMarathiNames: async (): Promise<number> => {
      if (!user || !db) return 0;
      let updatedCount = 0;
      const players = aggregatedData.players || [];
      for (const player of players) {
        const guessed = guessMarathiName(player.name);
        const currentMarathi = (player.nameMarathi || "").trim();
        if (
          !currentMarathi ||
          !/[\u0900-\u097F]/.test(currentMarathi) ||
          currentMarathi === player.name
        ) {
          if (guessed && guessed !== currentMarathi) {
            setDocumentNonBlocking(
              doc(db, "players", player.id),
              { ...player, nameMarathi: guessed, ownerId: user.uid, schoolId: user.uid },
              { merge: true }
            );
            updatedCount++;
          }
        }
      }
      return updatedCount;
    },

    syncOfflineAttendance,
  };
}