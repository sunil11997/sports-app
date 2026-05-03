
"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { collection, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * useSchoolData - The Institutional Registry Engine
 * 
 * Provides real-time synchronization and automatic data restoration across devices.
 * All data is keyed to the authenticated user's Google UID.
 */
export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();
  const [selectedYear, setSelectedYear] = useState("2024-25");

  // 1. Institutional Profile Sync
  const schoolDocRef = useMemoFirebase(() => user ? doc(db, 'schools', user.uid) : null, [db, user]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  // 2. Player Registry Sync (Top-level with Owner ID filtering)
  const playersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  // 3. Reactive Registries (Attendance, Fitness, Skills)
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});

  useEffect(() => {
    if (!user || !db) return;

    // A. Reactive Attendance (Instant update across devices)
    const attQuery = query(
      collection(db, 'attendance_registry'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      const newAtt: AttendanceRecord = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const sessionSuffix = data.session ? `_${data.session}` : '_Morning'; // Default to Morning if missing
        newAtt[`${data.playerId}_${data.date}${sessionSuffix}`] = data.status;
      });
      setAttendanceData(newAtt);
    });

    // B. Reactive Fitness Assessments
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

    // C. Reactive Technical Skills
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
  }, [db, user, selectedYear]);

  // 4. Sync Health Incidents
  const incidentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'all_health_incidents'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
  }, [db, user, selectedYear]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  // 5. Sync Class Activities
  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'school_activities'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
  }, [db, user, selectedYear]);
  const { data: activities } = useCollection(activitiesQuery);

  // 6. Drill Completions (Instant cross-device checkmarks)
  const drillsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'drill_completions'), where('schoolId', '==', user.uid));
  }, [db, user]);
  const { data: drillComps } = useCollection(drillsQuery);

  const drillCompletions = useMemo(() => {
    const logs: Record<string, boolean> = {};
    if (drillComps) drillComps.forEach(d => { logs[d.id] = true; });
    return logs;
  }, [drillComps]);

  // Consolidated Data Object
  const aggregatedData = useMemo(() => ({
    players: allPlayers || [],
    attendance,
    fitness,
    fitnessHistory,
    sportSkills,
    skillsHistory,
    drillCompletions,
    healthIncidents: healthIncidents || [],
    activities: (activities || []).map((a: any) => ({ ...a, category: a.category || (a.std ? 'student' : 'athlete') })),
    schoolProfile: schoolProfile || {
      schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
      teacherName: "Sunil Deshmukh",
      taluka: "Satana",
      district: "Nashik",
      id: "default",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      updatedAt: new Date().toISOString()
    }
  }), [allPlayers, healthIncidents, activities, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, drillCompletions, schoolProfile]);

  // ACTION HANDLERS (Synchronized with user.uid)
  const saveSchoolProfile = useCallback((profile: any) => {
    if (!user) return;
    const profileRef = doc(db, 'schools', user.uid);
    setDocumentNonBlocking(profileRef, { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
  }, [db, user]);

  const addPlayer = useCallback((playerData: any) => {
    if (!user) return;
    const playerRef = doc(db, 'players', playerData.id);
    setDocumentNonBlocking(playerRef, { ...playerData, ownerId: user.uid, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
  }, [db, user, selectedYear]);

  const updatePlayer = useCallback((player: any) => {
    const docRef = doc(db, 'players', player.id);
    updateDocumentNonBlocking(docRef, player);
  }, [db]);

  const deletePlayer = useCallback((playerId: string) => {
    const docRef = doc(db, 'players', playerId);
    deleteDocumentNonBlocking(docRef);
  }, [db]);

  const setAttendance = useCallback((records: AttendanceRecord) => {
    if (!user) return;
    Object.entries(records).forEach(([key, status]) => {
      const parts = key.split('_');
      if (parts.length < 3) return;
      
      const playerId = parts[0];
      const date = parts[1];
      const session = parts[2];
      
      const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
      if (!status) deleteDocumentNonBlocking(attRef);
      else setDocumentNonBlocking(attRef, { 
        status, 
        playerId, 
        date, 
        session,
        schoolId: user.uid, 
        academicYear: selectedYear 
      }, { merge: true });
    });
  }, [db, user, selectedYear]);

  const setFitness = useCallback((playerId: string, assessment: FitnessAssessment) => {
    if (!user) return;
    const dateId = new Date().toISOString().split('T')[0];
    const fitnessRef = doc(db, 'fitness_registry', `${playerId}_${dateId}`);
    setDocumentNonBlocking(fitnessRef, { 
      ...assessment, 
      playerId, 
      schoolId: user.uid, 
      date: dateId, 
      updatedAt: new Date().toISOString(), 
      academicYear: selectedYear 
    }, { merge: true });
  }, [db, user, selectedYear]);

  const setSportSkill = useCallback((playerId: string, sport: string, skill: SportSkill) => {
    if (!user) return;
    const skillRef = doc(db, 'skills_registry', `${playerId}_${sport}`);
    setDocumentNonBlocking(skillRef, { 
      ...skill, 
      playerId, 
      sportName: sport, 
      schoolId: user.uid, 
      lastUpdated: new Date().toISOString(), 
      academicYear: selectedYear 
    }, { merge: true });
  }, [db, user, selectedYear]);

  const setDrillCompletion = useCallback((drillId: string, playerId: string, completed: boolean) => {
    if (!user) return;
    const refId = `${playerId}_${drillId}`;
    const drillRef = doc(db, 'drill_completions', refId);
    if (completed) setDocumentNonBlocking(drillRef, { id: refId, schoolId: user.uid, playerId, drillId, timestamp: new Date().toISOString() }, { merge: true });
    else deleteDocumentNonBlocking(drillRef);
  }, [db, user]);

  const addHealthIncident = useCallback((incident: HealthIncident) => {
    if (!user) return;
    const globalIncRef = doc(db, 'all_health_incidents', incident.id);
    setDocumentNonBlocking(globalIncRef, { ...incident, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
  }, [db, user, selectedYear]);

  const addActivity = useCallback((activityData: any) => {
    if (!user) return;
    const activityRef = doc(db, 'school_activities', activityData.id);
    setDocumentNonBlocking(activityRef, { ...activityData, schoolId: user.uid, timestamp: new Date().toISOString(), academicYear: selectedYear }, { merge: true });
  }, [db, user, selectedYear]);

  const deleteActivity = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(db, 'school_activities', id));
  }, [db]);

  const exportBackupData = useCallback(() => {
    const backup = { data: aggregatedData, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wgb_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [aggregatedData]);

  return {
    data: aggregatedData,
    isLoaded: !playersLoading && !schoolsLoading,
    selectedYear,
    setSelectedYear,
    saveSchoolProfile, addPlayer, updatePlayer, deletePlayer, setAttendance, setFitness, setSportSkill, setDrillCompletion, addHealthIncident, addActivity, deleteActivity, exportBackupData
  };
}
