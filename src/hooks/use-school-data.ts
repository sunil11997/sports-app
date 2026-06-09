"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { collection, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile, ExamLabels, PerformanceLabels, TacticalEvent, GoalRecord } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';

const OFFLINE_ATTENDANCE_KEY = 'wgb_offline_attendance_queue';

export function useSchoolData(isActive: boolean = true) {
  const db = useFirestore();
  const { user } = useUser();
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const schoolDocRef = useMemoFirebase(() => (user && db && isActive) ? doc(db, 'schools', user.uid) : null, [db, user, isActive]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  const playersQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user, isActive]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

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

  const syncOfflineAttendance = useCallback(async () => {
    if (!user || !db || !navigator.onLine || isSyncing) return;

    const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
    if (!queueStr) {
      setPendingCount(0);
      return;
    }

    const queue: AttendanceRecord = JSON.parse(queueStr);
    const keys = Object.keys(queue);
    
    if (keys.length === 0) {
      setPendingCount(0);
      return;
    }

    setIsSyncing(true);

    try {
      for (const key of keys) {
        const status = queue[key];
        const parts = key.split('_');
        if (parts.length < 3) continue;
        
        const playerId = parts[0];
        const date = parts[1];
        const session = parts[2];
        
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
      console.error("WGB: Offline sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [db, user, selectedYear, isSyncing]);

  useEffect(() => {
    if (!user || !db || !isActive) return;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', syncOfflineAttendance);
      syncOfflineAttendance();
    }

    const attQuery = query(
      collection(db, 'attendance_registry'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      const newAtt: AttendanceRecord = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const sessionSuffix = data.session ? `_${data.session}` : '_Morning';
        newAtt[`${data.playerId}_${data.date}${sessionSuffix}`] = data.status;
      });
      
      const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
      if (queueStr) {
        const queue = JSON.parse(queueStr);
        setAttendanceData({ ...newAtt, ...queue });
        setPendingCount(Object.keys(queue).length);
      } else {
        setAttendanceData(newAtt);
      }
    });

    const fitQuery = query(
      collection(db, 'fitness_registry'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubFit = onSnapshot(fitQuery, (snapshot) => {
      const latestMap: Record<string, FitnessAssessment> = {};
      const historyMap: Record<string, FitnessAssessment[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as FitnessAssessment;
        const pId = data.playerId;
        if (!pId) return;

        const currentLatest = latestMap[pId];
        const hasNewerUpdate = !currentLatest || 
          (data.updatedAt && currentLatest.updatedAt && new Date(data.updatedAt) > new Date(currentLatest.updatedAt));

        if (hasNewerUpdate) latestMap[pId] = data;
        
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, date: data.date || data.updatedAt?.split('T')[0] });
      });

      setFitnessData(latestMap);
      setFitnessHistory(historyMap);
    });

    const skillsQuery = query(
      collection(db, 'skills_registry'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubSkills = onSnapshot(skillsQuery, (snapshot) => {
      const skillsMap: Record<string, SportSkill> = {};
      const historyMap: Record<string, (SportSkill & { sportName: string })[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as SportSkill;
        const pId = data.playerId;
        if (!pId) return;

        const currentLatest = skillsMap[`${pId}_${data.sportName}`];
        if (!currentLatest || (data.lastUpdated && currentLatest.lastUpdated && new Date(data.lastUpdated) > new Date(currentLatest.lastUpdated))) {
          skillsMap[`${pId}_${data.sportName}`] = data;
        }

        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, sportName: data.sportName || 'Unknown' });
      });

      setSportSkillsData(skillsMap);
      setSkillsHistory(historyMap);
    });

    const rulesQuery = query(
      collection(db, 'game_rules_registry'),
      where('schoolId', '==', user.uid)
    );
    const unsubRules = onSnapshot(rulesQuery, (snapshot) => {
      const rulesMap: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        rulesMap[doc.id] = doc.data();
      });
      setGameRulesData(rulesMap);
    });

    const examConfigQuery = query(
      collection(db, 'exam_configs'),
      where('schoolId', '==', user.uid)
    );
    const unsubExamConfigs = onSnapshot(examConfigQuery, (snapshot) => {
      const configMap: Record<string, ExamLabels> = {};
      snapshot.docs.forEach(doc => {
        configMap[doc.id] = doc.data().labels as ExamLabels;
      });
      setExamConfigs(configMap);
    });

    const performanceConfigQuery = query(
      collection(db, 'performance_configs'),
      where('schoolId', '==', user.uid)
    );
    const unsubPerformanceConfigs = onSnapshot(performanceConfigQuery, (snapshot) => {
      const configMap: Record<string, PerformanceLabels> = {};
      snapshot.docs.forEach(doc => {
        configMap[doc.id] = doc.data().labels as PerformanceLabels;
      });
      setPerformanceConfigs(configMap);
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const readinessQuery = query(
      collection(db, 'readiness_registry'),
      where('schoolId', '==', user.uid),
      where('date', '==', today)
    );
    const unsubReadiness = onSnapshot(readinessQuery, (snapshot) => {
      const map: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        map[data.playerId] = data;
      });
      setDailyReadinessData(map);
    });

    const tacticalQuery = query(
      collection(db, 'tactical_registry'),
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubTactical = onSnapshot(tacticalQuery, (snapshot) => {
      const events: TacticalEvent[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TacticalEvent));
      setTacticalEventsData(events.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    });

    const goalsQuery = query(
      collection(db, 'goal_registry'),
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      const list: GoalRecord[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GoalRecord));
      setGoalsData(list.sort((a, b) => (b.month || "").localeCompare(a.month || "")));
    });

    const drillsQuery = query(
      collection(db, 'drill_completions'),
      where('schoolId', '==', user.uid)
    );
    const unsubDrills = onSnapshot(drillsQuery, (snapshot) => {
      const map: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        map[doc.id] = true;
      });
      setDrillCompletionsData(map);
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', syncOfflineAttendance);
      }
      unsubAtt();
      unsubFit();
      unsubSkills();
      unsubRules();
      unsubExamConfigs();
      unsubPerformanceConfigs();
      unsubReadiness();
      unsubTactical();
      unsubGoals();
      unsubDrills();
    };
  }, [db, user, selectedYear, syncOfflineAttendance, isActive]);

  const setAttendance = (newAttendance: AttendanceRecord) => {
    if (!user || !db) return;
    
    setAttendanceData(prev => ({ ...prev, ...newAttendance }));

    Object.entries(newAttendance).forEach(([key, status]) => {
      const parts = key.split('_');
      if (parts.length < 3) return;
      
      const playerId = parts[0];
      const date = parts[1];
      const session = parts[2];
      
      const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
      
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '{}';
        const queue = JSON.parse(queueStr);
        queue[key] = status;
        localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
        setPendingCount(Object.keys(queue).length);
      } else {
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
      }
    });
  };

  const incidentsQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(
      collection(db, 'all_health_incidents'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
  }, [db, user, selectedYear, isActive]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

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
    activities: [],
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
  }), [allPlayers, healthIncidents, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, gameRules, examConfigs, performanceConfigs, schoolProfile, dailyReadiness, tacticalEvents, goals, drillCompletions]);

  const isActuallyLoaded = useMemo(() => {
    if (!isActive) return false;
    return !!db && !playersLoading && !schoolsLoading;
  }, [isActive, db, playersLoading, schoolsLoading]);

  const deleteHealthIncident = useCallback((id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'all_health_incidents', id));
  }, [db]);

  return {
    data: aggregatedData,
    isLoaded: isActuallyLoaded,
    selectedYear,
    setSelectedYear,
    pendingSyncCount: pendingCount,
    isSyncing,
    saveSchoolProfile: (profile: any) => {
      if (!user || !db) return;
      const profileRef = doc(db, 'schools', user.uid);
      setDocumentNonBlocking(profileRef, { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
    },
    updatePasscode: (passcode: string) => {
      if (!user || !db) return;
      const profileRef = doc(db, 'schools', user.uid);
      updateDocumentNonBlocking(profileRef, { passcode });
    },
    addPlayer: (playerData: any) => {
      if (!user || !db) return;
      const playerRef = doc(db, 'players', playerData.id);
      setDocumentNonBlocking(playerRef, { ...playerData, ownerId: user.uid, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
    },
    updatePlayer: (player: any) => {
      if (!db) return;
      const docRef = doc(db, 'players', player.id);
      updateDocumentNonBlocking(docRef, player);
    },
    deletePlayer: (playerId: string) => {
      if (!db) return;
      const docRef = doc(db, 'players', playerId);
      deleteDocumentNonBlocking(docRef);
    },
    setAttendance,
    setFitness: (playerId: string, assessment: FitnessAssessment) => {
      if (!user || !db) return;
      const dateId = assessment.month || new Date().toISOString().split('T')[0];
      const fitnessRef = doc(db, 'fitness_registry', `${playerId}_${dateId}`);
      setDocumentNonBlocking(fitnessRef, { ...assessment, playerId, schoolId: user.uid, date: dateId, updatedAt: new Date().toISOString(), academicYear: selectedYear }, { merge: true });
    },
    setReadiness: (playerId: string, data: any) => {
      if (!user || !db) return;
      const dateId = new Date().toISOString().split('T')[0];
      const ref = doc(db, 'readiness_registry', `${playerId}_${dateId}`);
      setDocumentNonBlocking(ref, { 
        ...data, 
        playerId, 
        schoolId: user.uid, 
        date: dateId, 
        timestamp: new Date().toISOString(),
        academicYear: selectedYear 
      }, { merge: true });
    },
    addTacticalEvent: (eventData: Omit<TacticalEvent, 'id' | 'schoolId' | 'academicYear'>) => {
      if (!user || !db) return;
      const id = Math.random().toString(36).substr(2, 9);
      const ref = doc(db, 'tactical_registry', id);
      setDocumentNonBlocking(ref, { 
        ...eventData, 
        id, 
        schoolId: user.uid, 
        academicYear: selectedYear 
      }, { merge: true });
    },
    deleteTacticalEvent: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'tactical_registry', id));
    },
    setGoal: (goalData: Omit<GoalRecord, 'id' | 'schoolId' | 'academicYear'>) => {
      if (!user || !db) return;
      const id = `${goalData.playerId}_${goalData.month}_${goalData.metric.replace(/\s+/g, '_')}`;
      const ref = doc(db, 'goal_registry', id);
      setDocumentNonBlocking(ref, { 
        ...goalData, 
        id, 
        schoolId: user.uid, 
        academicYear: selectedYear 
      }, { merge: true });
    },
    deleteGoal: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'goal_registry', id));
    },
    setExamLabels: (std: string, term: string, labels: ExamLabels) => {
      if (!user || !db) return;
      const configId = `${std}_${term}`;
      const configRef = doc(db, 'exam_configs', configId);
      setDocumentNonBlocking(configRef, { labels, std, term, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
    },
    setPerformanceLabels: (std: string, month: string, labels: PerformanceLabels) => {
      if (!user || !db) return;
      const configId = `${std}_${month}`;
      const configRef = doc(db, 'performance_configs', configId);
      setDocumentNonBlocking(configRef, { labels, std, month, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
    },
    setSportSkill: (playerId: string, sport: string, skill: SportSkill) => {
      if (!user || !db) return;
      const timeId = new Date().getTime().toString();
      const skillRef = doc(db, 'skills_registry', `${playerId}_${sport}_${timeId}`);
      setDocumentNonBlocking(skillRef, { ...skill, playerId, sportName: sport, schoolId: user.uid, lastUpdated: new Date().toISOString(), academicYear: selectedYear }, { merge: true });
    },
    setDrillCompletion: (drillId: string, playerId: string, completed: boolean) => {
      if (!user || !db) return;
      const refId = `${playerId}_${drillId}`;
      const drillRef = doc(db, 'drill_completions', refId);
      if (completed) setDocumentNonBlocking(drillRef, { id: refId, schoolId: user.uid, playerId, drillId, timestamp: new Date().toISOString() }, { merge: true });
      else deleteDocumentNonBlocking(drillRef);
    },
    setGameRule: (sportName: string, pdfData: string | null) => {
      if (!user || !db) return;
      const ruleRef = doc(db, 'game_rules_registry', sportName);
      if (!pdfData) deleteDocumentNonBlocking(ruleRef);
      else setDocumentNonBlocking(ruleRef, { sportName, pdfData, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
    },
    addHealthIncident: (incident: HealthIncident) => {
      if (!user || !db) return;
      const globalIncRef = doc(db, 'all_health_incidents', incident.id);
      setDocumentNonBlocking(globalIncRef, { ...incident, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
    },
    deleteHealthIncident,
    addActivity: (activityData: any) => {
      if (!user || !db) return;
      const activityRef = doc(db, 'school_activities', activityData.id);
      setDocumentNonBlocking(activityRef, { ...activityData, schoolId: user.uid, timestamp: new Date().toISOString(), academicYear: selectedYear }, { merge: true });
    },
    deleteActivity: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'school_activities', id));
    },
    exportBackupData: () => {
      const backup = { data: aggregatedData, timestamp: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `wgb_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    },
    importBackupData: async (backup: any) => {
      if (!user || !db || !backup.data) return;
      const { data } = backup;
      
      if (data.schoolProfile) {
        const profileRef = doc(db, 'schools', user.uid);
        setDocumentNonBlocking(profileRef, { ...data.schoolProfile, id: user.uid, ownerId: user.uid }, { merge: true });
      }

      if (Array.isArray(data.players)) {
        data.players.forEach((p: any) => {
          const playerRef = doc(db, 'players', p.id);
          setDocumentNonBlocking(playerRef, { ...p, ownerId: user.uid, schoolId: user.uid }, { merge: true });
        });
      }

      if (Array.isArray(data.goals)) {
        data.goals.forEach((g: any) => {
          const goalRef = doc(db, 'goal_registry', g.id);
          setDocumentNonBlocking(goalRef, { ...g, schoolId: user.uid }, { merge: true });
        });
      }

      if (Array.isArray(data.tacticalEvents)) {
        data.tacticalEvents.forEach((te: any) => {
          const teRef = doc(db, 'tactical_registry', te.id);
          setDocumentNonBlocking(teRef, { ...te, schoolId: user.uid }, { merge: true });
        });
      }

      if (Array.isArray(data.healthIncidents)) {
        data.healthIncidents.forEach((hi: any) => {
          const hiRef = doc(db, 'all_health_incidents', hi.id);
          setDocumentNonBlocking(hiRef, { ...hi, schoolId: user.uid }, { merge: true });
        });
      }

      if (data.examConfigs) {
        Object.entries(data.examConfigs).forEach(([id, labels]: [string, any]) => {
          const configRef = doc(db, 'exam_configs', id);
          setDocumentNonBlocking(configRef, { labels, schoolId: user.uid }, { merge: true });
        });
      }
    },
    syncOfflineAttendance
  };
}
