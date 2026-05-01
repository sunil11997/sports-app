"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { collection, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();
  const [selectedYear, setSelectedYear] = useState("2024-25");

  const schoolDocRef = useMemoFirebase(() => user ? doc(db, 'schools', user.uid) : null, [db, user]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  const playersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});
  const [drillCompletions, setDrillCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user || !db) return;

    const attQuery = query(
      collection(db, 'attendance_registry'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      const newAtt: AttendanceRecord = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newAtt[`${data.playerId}_${data.date}`] = data.status;
      });
      setAttendanceData(newAtt);
    }, (err) => console.error("WGB-Att-Sync-Error:", err));

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

        if (hasNewerUpdate) {
          latestMap[pId] = data;
        }
        
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, date: data.date || data.updatedAt?.split('T')[0] });
      });

      setFitnessData(latestMap);
      setFitnessHistory(historyMap);
    }, (err) => console.error("WGB-Fit-Sync-Error:", err));

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
    }, (err) => console.error("WGB-Skill-Sync-Error:", err));

    return () => {
      unsubAtt();
      unsubFit();
      unsubSkills();
    };
  }, [db, user, selectedYear]);

  const incidentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'all_health_incidents'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
  }, [db, user, selectedYear]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  const drillsSyncRef = useMemoFirebase(() => user ? query(collection(db, 'drill_completions'), where('schoolId', '==', user.uid)) : null, [db, user]);
  const { data: drillComps } = useCollection(drillsSyncRef);

  useEffect(() => {
    if (drillComps) {
      const logs: Record<string, boolean> = {};
      drillComps.forEach(d => { logs[d.id] = true; });
      setDrillCompletions(logs);
    }
  }, [drillComps]);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'school_activities'), 
      where('schoolId', '==', user.uid),
      where('academicYear', '==', selectedYear)
    );
  }, [db, user, selectedYear]);
  const { data: activities } = useCollection(activitiesQuery);

  const aggregatedData = useMemo(() => ({
    players: allPlayers || [],
    attendance,
    fitness,
    fitnessHistory,
    sportSkills,
    skillsHistory,
    drillCompletions,
    healthIncidents: healthIncidents || [],
    activities: activities || [],
    schoolProfile: schoolProfile || {
      schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
      teacherName: "सुनिल देशमुख (Sunil Deshmukh)",
      taluka: "बागलाण",
      district: "नाशिक",
      id: "default",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      updatedAt: new Date().toISOString()
    }
  }), [allPlayers, healthIncidents, activities, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, drillCompletions, schoolProfile]);

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

  const deletePlayer = useCallback((id: string) => {
    const docRef = doc(db, 'players', id);
    deleteDocumentNonBlocking(docRef);
  }, [db]);

  const setAttendance = useCallback((records: AttendanceRecord) => {
    if (!user) return;
    Object.entries(records).forEach(([key, status]) => {
      const [playerId, date] = key.split('_');
      if (!playerId || !date) return;
      const player = aggregatedData.players.find(p => p.id === playerId);
      const attRef = doc(db, 'attendance_registry', `${playerId}_${date}`);
      if (!status) deleteDocumentNonBlocking(attRef);
      else setDocumentNonBlocking(attRef, { 
        status, 
        playerId, 
        date, 
        schoolId: user.uid, 
        academicYear: selectedYear,
        std: player?.std || "N/A"
      }, { merge: true });
    });
  }, [db, user, selectedYear, aggregatedData.players]);

  const setFitness = useCallback((playerId: string, assessment: FitnessAssessment) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const dateId = timestamp.split('T')[0];
    const refId = `${playerId}_${dateId}`;
    const player = aggregatedData.players.find(p => p.id === playerId);
    const fitnessRef = doc(db, 'fitness_registry', refId);
    setDocumentNonBlocking(fitnessRef, { 
      ...assessment, 
      playerId, 
      schoolId: user.uid, 
      date: dateId, 
      updatedAt: timestamp, 
      academicYear: selectedYear,
      std: assessment.std || player?.std || "N/A" 
    }, { merge: true });
  }, [db, user, selectedYear, aggregatedData.players]);

  const setSportSkill = useCallback((playerId: string, sport: string, skill: SportSkill) => {
    if (!user) return;
    const refId = `${playerId}_${sport}`;
    const player = aggregatedData.players.find(p => p.id === playerId);
    const skillRef = doc(db, 'skills_registry', refId);
    setDocumentNonBlocking(skillRef, { 
      ...skill, 
      playerId, 
      sportName: sport, 
      schoolId: user.uid, 
      lastUpdated: new Date().toISOString(), 
      academicYear: selectedYear,
      std: player?.std || "N/A"
    }, { merge: true });
  }, [db, user, selectedYear, aggregatedData.players]);

  const setDrillCompletion = useCallback((drillId: string, playerId: string, completed: boolean) => {
    if (!user) return;
    const refId = `${playerId}_${drillId}`;
    const drillRef = doc(db, 'drill_completions', refId);
    if (completed) setDocumentNonBlocking(drillRef, { schoolId: user.uid, playerId, drillId, timestamp: new Date().toISOString() }, { merge: true });
    else deleteDocumentNonBlocking(drillRef);
  }, [db, user]);

  const addHealthIncident = useCallback((incident: HealthIncident) => {
    if (!user) return;
    const player = aggregatedData.players.find(p => p.id === incident.playerId);
    const globalIncRef = doc(db, 'all_health_incidents', incident.id);
    setDocumentNonBlocking(globalIncRef, { 
      ...incident, 
      schoolId: user.uid, 
      academicYear: selectedYear,
      std: player?.std || "N/A"
    }, { merge: true });
  }, [db, user, selectedYear, aggregatedData.players]);

  const addActivity = useCallback((activityData: any) => {
    if (!user) return;
    const activityRef = doc(db, 'school_activities', activityData.id);
    setDocumentNonBlocking(activityRef, { ...activityData, schoolId: user.uid, timestamp: new Date().toISOString(), academicYear: selectedYear }, { merge: true });
  }, [db, user, selectedYear]);

  const deleteActivity = useCallback((id: string) => {
    const docRef = doc(db, 'school_activities', id);
    deleteDocumentNonBlocking(docRef);
  }, [db]);

  const exportBackupData = useCallback(() => {
    const backup = { 
      timestamp: new Date().toISOString(), 
      schoolName: schoolProfile?.schoolName || "Backup", 
      academicYear: selectedYear,
      registryCount: aggregatedData.players.length,
      data: aggregatedData 
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wgb_sports_registry_${selectedYear}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [aggregatedData, schoolProfile, selectedYear]);

  return {
    data: aggregatedData,
    isLoaded: !playersLoading && !schoolsLoading,
    selectedYear,
    setSelectedYear,
    saveSchoolProfile, addPlayer, updatePlayer, deletePlayer, setAttendance, setFitness, setSportSkill, setDrillCompletion, addHealthIncident, addActivity, deleteActivity, exportBackupData
  };
}
