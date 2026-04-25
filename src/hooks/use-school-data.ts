
"use client";

import { useMemo, useState, useEffect } from 'react';
import { collection, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * useSchoolData - Optimized Hook for Waghamba Sports Hub
 * Uses Root-Level Collections to resolve index errors while maintaining high performance.
 */
export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // 1. School Profile
  const schoolDocRef = useMemoFirebase(() => user ? doc(db, 'schools', user.uid) : null, [db, user]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  // 2. Players
  const playersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user]);
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  // 3. Reactive State for high-volume data
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});
  const [drillCompletions, setDrillCompletions] = useState<Record<string, boolean>>({});

  // 4. Centralized Data Fetching (Using root collections instead of collectionGroup)
  useEffect(() => {
    if (!user) return;

    // A. Sync ALL Attendance records for this school
    const attQuery = query(collection(db, 'attendance_registry'), where('schoolId', '==', user.uid));
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      const newAtt: AttendanceRecord = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newAtt[`${data.playerId}_${data.date}`] = data.status;
      });
      setAttendanceData(newAtt);
    });

    // B. Sync ALL Fitness assessments
    const fitQuery = query(collection(db, 'fitness_registry'), where('schoolId', '==', user.uid));
    const unsubFit = onSnapshot(fitQuery, (snapshot) => {
      const latestMap: Record<string, FitnessAssessment> = {};
      const historyMap: Record<string, FitnessAssessment[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as FitnessAssessment;
        const pId = data.playerId;
        if (!pId) return;

        // Determine if this is the "latest" for this specific player (client-side logic to avoid complex indexes)
        if (!latestMap[pId] || (data.updatedAt && latestMap[pId].updatedAt && data.updatedAt > latestMap[pId].updatedAt)) {
          latestMap[pId] = data;
        }
        
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, date: data.date || data.updatedAt?.split('T')[0] });
      });

      setFitnessData(latestMap);
      setFitnessHistory(historyMap);
    });

    // C. Sync ALL Sport Skills
    const skillsQuery = query(collection(db, 'skills_registry'), where('schoolId', '==', user.uid));
    const unsubSkills = onSnapshot(skillsQuery, (snapshot) => {
      const skillsMap: Record<string, SportSkill> = {};
      const historyMap: Record<string, (SportSkill & { sportName: string })[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as SportSkill;
        const pId = data.playerId;
        if (!pId) return;

        skillsMap[`${pId}_${data.sportName}`] = data;
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, sportName: data.sportName || 'Unknown' });
      });

      setSportSkillsData(skillsMap);
      setSkillsHistory(historyMap);
    });

    return () => {
      unsubAtt();
      unsubFit();
      unsubSkills();
    };
  }, [db, user]);

  // 5. Global Health Incidents
  const incidentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'all_health_incidents'), where('schoolId', '==', user.uid));
  }, [db, user]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  // 6. Drill Completions
  const drillsSyncRef = useMemoFirebase(() => user ? query(collection(db, 'drill_completions'), where('schoolId', '==', user.uid)) : null, [db, user]);
  const { data: drillComps } = useCollection(drillsSyncRef);

  useEffect(() => {
    if (drillComps) {
      const logs: Record<string, boolean> = {};
      drillComps.forEach(d => { logs[d.id] = true; });
      setDrillCompletions(logs);
    }
  }, [drillComps]);

  // 7. Global Activities
  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'school_activities'), where('schoolId', '==', user.uid));
  }, [db, user]);
  const { data: activities } = useCollection(activitiesQuery);

  const aggregatedData = useMemo(() => ({
    players: players || [],
    attendance,
    fitness,
    fitnessHistory,
    sportSkills,
    skillsHistory,
    drillCompletions,
    healthIncidents: healthIncidents || [],
    activities: activities || [],
    schoolProfile: schoolProfile || {
      schoolName: "शासकीय माध्यमिक आश्रमशाळा वाघंबा",
      teacherName: "सुनिल देशमुख",
      taluka: "बागलाण",
      district: "नाशिक",
      id: "default",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      updatedAt: new Date().toISOString()
    }
  }), [players, healthIncidents, activities, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, drillCompletions, schoolProfile]);

  const saveSchoolProfile = (profile: any) => {
    if (!user) return;
    const profileRef = doc(db, 'schools', user.uid);
    setDocumentNonBlocking(profileRef, { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const addPlayer = (playerData: any) => {
    if (!user) return;
    const playerRef = doc(db, 'players', playerData.id);
    setDocumentNonBlocking(playerRef, { ...playerData, ownerId: user.uid, schoolId: user.uid }, { merge: true });
  };

  const updatePlayer = (player: any) => {
    const docRef = doc(db, 'players', player.id);
    updateDocumentNonBlocking(docRef, player);
  };

  const deletePlayer = (id: string) => {
    const docRef = doc(db, 'players', id);
    deleteDocumentNonBlocking(docRef);
  };

  const setAttendance = (records: AttendanceRecord) => {
    if (!user) return;
    Object.entries(records).forEach(([key, status]) => {
      const [playerId, date] = key.split('_');
      if (!playerId || !date) return;
      const attRef = doc(db, 'attendance_registry', `${playerId}_${date}`);
      if (!status) deleteDocumentNonBlocking(attRef);
      else setDocumentNonBlocking(attRef, { status, playerId, date, schoolId: user.uid }, { merge: true });
    });
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const dateId = timestamp.split('T')[0];
    const refId = `${playerId}_${dateId}`;
    const fitnessRef = doc(db, 'fitness_registry', refId);
    setDocumentNonBlocking(fitnessRef, { ...assessment, playerId, schoolId: user.uid, date: dateId, updatedAt: timestamp }, { merge: true });
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    if (!user) return;
    const refId = `${playerId}_${sport}`;
    const skillRef = doc(db, 'skills_registry', refId);
    setDocumentNonBlocking(skillRef, { ...skill, playerId, sportName: sport, schoolId: user.uid, lastUpdated: new Date().toISOString() }, { merge: true });
  };

  const setDrillCompletion = (drillId: string, completed: boolean) => {
    if (!user) return;
    const drillRef = doc(db, 'drill_completions', drillId);
    if (completed) setDocumentNonBlocking(drillRef, { schoolId: user.uid, timestamp: new Date().toISOString() }, { merge: true });
    else deleteDocumentNonBlocking(drillRef);
  };

  const addHealthIncident = (incident: HealthIncident) => {
    if (!user) return;
    const globalIncRef = doc(db, 'all_health_incidents', incident.id);
    setDocumentNonBlocking(globalIncRef, { ...incident, schoolId: user.uid }, { merge: true });
  };

  const addActivity = (activityData: any) => {
    if (!user) return;
    const activityRef = doc(db, 'school_activities', activityData.id);
    setDocumentNonBlocking(activityRef, { ...activityData, schoolId: user.uid, timestamp: new Date().toISOString() }, { merge: true });
  };

  const deleteActivity = (id: string) => {
    const docRef = doc(db, 'school_activities', id);
    deleteDocumentNonBlocking(docRef);
  };

  const exportBackupData = () => {
    const backup = { timestamp: new Date().toISOString(), schoolName: schoolProfile?.schoolName || "Backup", data: aggregatedData };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waghamba_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    data: aggregatedData,
    isLoaded: !playersLoading && !schoolsLoading,
    saveSchoolProfile, addPlayer, updatePlayer, deletePlayer, setAttendance, setFitness, setSportSkill, setDrillCompletion, addHealthIncident, addActivity, deleteActivity, exportBackupData
  };
}
