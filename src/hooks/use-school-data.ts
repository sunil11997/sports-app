"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile, ExamLabels, PerformanceLabels, TacticalEvent, GoalRecord } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';

const OFFLINE_ATTENDANCE_KEY = 'wgb_offline_attendance_queue';

/**
 * useSchoolData - Institutional Registry Engine v4.3.26
 * Hardened for high-resilience persistence and strict hook execution order.
 */
export function useSchoolData(isActive: boolean = true) {
  // 1. ALL Hook definitions MUST remain at the top level
  const db = useFirestore();
  const { user } = useUser();
  const syncLockRef = useRef(false);

  const [selectedYear, setSelectedYear] = useState("2024-25");
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
  const [drillCompletions, setDrillCompletionsData] = useState<Record<string, boolean>>({});

  // Memoized Firebase References
  const schoolDocRef = useMemoFirebase(() => (user && db && isActive) ? doc(db, 'schools', user.uid) : null, [db, user, isActive]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  const playersQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user, isActive]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  const incidentsQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'all_health_incidents'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear));
  }, [db, user, selectedYear, isActive]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'school_activities'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear));
  }, [db, user, selectedYear, isActive]);
  const { data: schoolActivities } = useCollection(activitiesQuery);

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
        const parts = key.split('_');
        if (parts.length < 3) continue;
        const [playerId, date, session] = parts;
        const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
        
        if (!status) {
          deleteDocumentNonBlocking(attRef);
        } else {
          setDocumentNonBlocking(attRef, { 
            status, 
            playerId, 
            date, 
            session, 
            schoolId: user.uid, 
            academicYear: selectedYear 
          }, { merge: true });
        }
        delete queue[key];
      }
      localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
      setPendingCount(0);
    } catch (error) {
      console.warn("WGB: Offline sync failed, retry required.");
    } finally {
      setIsSyncing(false);
      syncLockRef.current = false;
    }
  }, [db, user, selectedYear]);

  // 2. Synchronization Effect
  useEffect(() => {
    if (!user || !db || !isActive) return;

    const handleSync = () => syncOfflineAttendance();
    window.addEventListener('online', handleSync);
    handleSync();

    const today = format(new Date(), 'yyyy-MM-dd');
    const unsubs = [
      onSnapshot(query(collection(db, 'attendance_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const newAtt: AttendanceRecord = {};
        snapshot.docs.forEach(doc => {
          const d = doc.data();
          const sessionSuffix = d.session ? `_${d.session}` : '_Morning';
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
      }),
      onSnapshot(query(collection(db, 'fitness_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const latestMap: Record<string, FitnessAssessment> = {};
        const historyMap: Record<string, FitnessAssessment[]> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data() as FitnessAssessment;
          const pId = data.playerId;
          if (!pId) return;
          if (!latestMap[pId] || (data.updatedAt && latestMap[pId].updatedAt && new Date(data.updatedAt) > new Date(latestMap[pId].updatedAt!))) {
            latestMap[pId] = data;
          }
          if (!historyMap[pId]) historyMap[pId] = [];
          historyMap[pId].push({ ...data, date: data.date || data.updatedAt?.split('T')[0] });
        });
        setFitnessData(latestMap);
        setFitnessHistory(historyMap);
      }),
      onSnapshot(query(collection(db, 'skills_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const skillsMap: Record<string, SportSkill> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data() as SportSkill;
          const pId = data.playerId;
          if (!pId) return;
          const key = `${pId}_${data.sportName}`;
          if (!skillsMap[key] || (data.lastUpdated && skillsMap[key].lastUpdated && new Date(data.lastUpdated) > new Date(skillsMap[key].lastUpdated!))) {
            skillsMap[key] = data;
          }
        });
        setSportSkillsData(skillsMap);
      }),
      onSnapshot(query(collection(db, 'readiness_registry'), where('schoolId', '==', user.uid), where('date', '==', today)), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.docs.forEach(doc => { 
          const d = doc.data(); 
          map[d.playerId] = d; 
        });
        setDailyReadinessData(map);
      }),
      onSnapshot(query(collection(db, 'tactical_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const events: TacticalEvent[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TacticalEvent));
        setTacticalEventsData(events.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
      }),
      onSnapshot(query(collection(db, 'goal_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const list: GoalRecord[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GoalRecord));
        setGoalsData(list.sort((a, b) => (b.month || "").localeCompare(a.month || "")));
      }),
      onSnapshot(query(collection(db, 'drill_completions'), where('schoolId', '==', user.uid)), (snapshot) => {
        const map: Record<string, boolean> = {};
        snapshot.docs.forEach(doc => map[doc.id] = true);
        setDrillCompletionsData(map);
      }),
      onSnapshot(query(collection(db, 'game_rules_registry'), where('schoolId', '==', user.uid)), (snapshot) => {
        const rulesMap: Record<string, any> = {};
        snapshot.docs.forEach(doc => rulesMap[doc.id] = doc.data());
        setGameRulesData(rulesMap);
      }),
      onSnapshot(query(collection(db, 'exam_configs'), where('schoolId', '==', user.uid)), (snapshot) => {
        const configMap: Record<string, ExamLabels> = {};
        snapshot.docs.forEach(doc => configMap[doc.id] = doc.data().labels as ExamLabels);
        setExamConfigs(configMap);
      }),
      onSnapshot(query(collection(db, 'performance_configs'), where('schoolId', '==', user.uid)), (snapshot) => {
        const configMap: Record<string, PerformanceLabels> = {};
        snapshot.docs.forEach(doc => configMap[doc.id] = doc.data().labels as PerformanceLabels);
        setPerformanceConfigs(configMap);
      })
    ];

    return () => {
      window.removeEventListener('online', handleSync);
      unsubs.forEach(unsub => unsub());
    };
  }, [db, user, selectedYear, syncOfflineAttendance, isActive]);

  // 3. Aggregated Data Memo
  const aggregatedData = useMemo(() => ({
    players: allPlayers || [],
    attendance,
    fitness,
    fitnessHistory,
    sportSkills,
    skillsHistory,
    drillCompletions,
    gameRules,
    examConfigs,
    performanceConfigs,
    dailyReadiness,
    tacticalEvents,
    goals,
    healthIncidents: healthIncidents || [],
    activities: schoolActivities || [],
    schoolProfile: schoolProfile || {
      schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
      teacherName: "Sunil Deshmukh",
      taluka: "Satana",
      district: "Nashik",
      id: "default",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  }), [allPlayers, healthIncidents, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, gameRules, examConfigs, performanceConfigs, schoolProfile, dailyReadiness, tacticalEvents, goals, drillCompletions, schoolActivities]);

  return {
    data: aggregatedData,
    isLoaded: !!db && !playersLoading && !schoolsLoading,
    selectedYear,
    setSelectedYear,
    pendingSyncCount: pendingCount,
    isSyncing,
    saveSchoolProfile: (profile: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'schools', user.uid), { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    updatePasscode: (passcode: string) => { if (!user || !db) return; updateDocumentNonBlocking(doc(db, 'schools', user.uid), { passcode }); },
    addPlayer: (playerData: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'players', playerData.id), { ...playerData, ownerId: user.uid, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    updatePlayer: (player: any) => { if (!db) return; updateDocumentNonBlocking(doc(db, 'players', player.id), player); },
    deletePlayer: (playerId: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'players', playerId)); },
    addActivity: (act: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'school_activities', act.id), { ...act, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteActivity: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'school_activities', id)); },
    setAttendance: (newAttendance: AttendanceRecord) => {
      if (!user || !db) return;
      setAttendanceData(prev => ({ ...prev, ...newAttendance }));
      Object.entries(newAttendance).forEach(([key, status]) => {
        const parts = key.split('_');
        if (parts.length < 3) return;
        const [playerId, date, session] = parts;
        const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
        if (!navigator.onLine) {
          const q = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '{}');
          q[key] = status;
          localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(q));
          setPendingCount(Object.keys(q).length);
        } else {
          if (!status) deleteDocumentNonBlocking(attRef);
          else setDocumentNonBlocking(attRef, { status, playerId, date, session, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
        }
      });
    },
    setFitness: (playerId: string, assessment: FitnessAssessment) => { if (!user || !db) return; const dateId = assessment.month || new Date().toISOString().split('T')[0]; setDocumentNonBlocking(doc(db, 'fitness_registry', `${playerId}_${dateId}`), { ...assessment, playerId, schoolId: user.uid, date: dateId, updatedAt: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    setReadiness: (playerId: string, d: any) => { if (!user || !db) return; const dateId = new Date().toISOString().split('T')[0]; setDocumentNonBlocking(doc(db, 'readiness_registry', `${playerId}_${dateId}`), { ...d, playerId, schoolId: user.uid, date: dateId, timestamp: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    addTacticalEvent: (e: any) => { if (!user || !db) return; const id = Math.random().toString(36).substr(2, 9); setDocumentNonBlocking(doc(db, 'tactical_registry', id), { ...e, id, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteTacticalEvent: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'tactical_registry', id)); },
    setGoal: (g: any) => { if (!user || !db) return; const id = `${g.playerId}_${g.month}_${g.metric.replace(/\s+/g, '_')}`; setDocumentNonBlocking(doc(db, 'goal_registry', id), { ...g, id, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteGoal: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'goal_registry', id)); },
    setExamLabels: (std: string, term: string, labels: ExamLabels) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'exam_configs', `${std}_${term}`), { labels, std, term, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    setPerformanceLabels: (std: string, month: string, labels: PerformanceLabels) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'performance_configs', `${std}_${month}`), { labels, std, month, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    setSportSkill: (pId: string, sport: string, skill: SportSkill) => { if (!user || !db) return; const timeId = new Date().getTime().toString(); setDocumentNonBlocking(doc(db, 'skills_registry', `${pId}_${sport}_${timeId}`), { ...skill, playerId: pId, sportName: sport, schoolId: user.uid, lastUpdated: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    setDrillCompletion: (dId: string, pId: string, comp: boolean) => { if (!user || !db) return; const refId = `${pId}_${dId}`; if (comp) setDocumentNonBlocking(doc(db, 'drill_completions', refId), { id: refId, schoolId: user.uid, playerId: pId, drillId: dId, timestamp: new Date().toISOString() }, { merge: true }); else deleteDocumentNonBlocking(doc(db, 'drill_completions', refId)); },
    setGameRule: (s: string, pdf: string | null) => { if (!user || !db) return; if (!pdf) deleteDocumentNonBlocking(doc(db, 'game_rules_registry', s)); else setDocumentNonBlocking(doc(db, 'game_rules_registry', s), { sportName: s, pdfData: pdf, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    addHealthIncident: (i: HealthIncident) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'all_health_incidents', i.id), { ...i, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteHealthIncident: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'all_health_incidents', id)); },
    exportBackupData: () => {
      const data = {
        data: aggregatedData,
        exportedAt: new Date().toISOString(),
        version: "4.3.26"
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WGB_Registry_Backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
    },
    importBackupData: async (b: any) => {
      if (!user || !db || !b.data) return;
      const { data } = b;
      if (data.schoolProfile) setDocumentNonBlocking(doc(db, 'schools', user.uid), { ...data.schoolProfile, id: user.uid, ownerId: user.uid }, { merge: true });
      if (Array.isArray(data.players)) data.players.forEach((p: any) => setDocumentNonBlocking(doc(db, 'players', p.id), { ...p, ownerId: user.uid, schoolId: user.uid }, { merge: true }));
    },
    syncOfflineAttendance
  };
}
