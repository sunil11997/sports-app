
"use client";

import { useMemo, useState, useEffect } from 'react';
import { collection, doc, query, where, collectionGroup, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * useSchoolData - Optimized Hook for Waghamba Sports Hub
 * Uses Collection Group Queries to minimize active listeners and maximize load speed.
 */
export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // 1. School Profile (Primary)
  const schoolDocRef = useMemoFirebase(() => user ? doc(db, 'schools', user.uid) : null, [db, user]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  // 2. Players (Primary)
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

  // 4. Global Collection Group Queries (One listener for ALL students)
  useEffect(() => {
    if (!user) return;

    // A. Sync ALL Attendance records for this school
    const attGroupQuery = query(collectionGroup(db, 'attendance'), where('schoolId', '==', user.uid));
    const unsubAtt = onSnapshot(attGroupQuery, (snapshot) => {
      const newAtt: AttendanceRecord = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newAtt[`${data.playerId}_${doc.id}`] = data.status;
      });
      setAttendanceData(prev => ({ ...prev, ...newAtt }));
    });

    // B. Sync ALL Fitness assessments
    const fitGroupQuery = query(collectionGroup(db, 'fitnessAssessments'), where('schoolId', '==', user.uid));
    const unsubFit = onSnapshot(fitGroupQuery, (snapshot) => {
      const latestMap: Record<string, FitnessAssessment> = {};
      const historyMap: Record<string, FitnessAssessment[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as FitnessAssessment;
        const pId = data.playerId;
        if (!pId) return;

        if (doc.id === 'latest') {
          latestMap[pId] = data;
        }
        
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, date: doc.id === 'latest' ? data.updatedAt : doc.id });
      });

      setFitnessData(prev => ({ ...prev, ...latestMap }));
      setFitnessHistory(prev => ({ ...prev, ...historyMap }));
    });

    // C. Sync ALL Sport Skills
    const skillsGroupQuery = query(collectionGroup(db, 'sportSkills'), where('schoolId', '==', user.uid));
    const unsubSkills = onSnapshot(skillsGroupQuery, (snapshot) => {
      const skillsMap: Record<string, SportSkill> = {};
      const historyMap: Record<string, (SportSkill & { sportName: string })[]> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data() as SportSkill;
        const pId = data.playerId;
        if (!pId) return;

        skillsMap[`${pId}_${doc.id}`] = data;
        if (!historyMap[pId]) historyMap[pId] = [];
        historyMap[pId].push({ ...data, sportName: doc.id });
      });

      setSportSkillsData(prev => ({ ...prev, ...skillsMap }));
      setSkillsHistory(prev => ({ ...prev, ...historyMap }));
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
  const drillsSyncRef = useMemoFirebase(() => user ? collection(db, 'drill_completions') : null, [db, user]);
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
      schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
      teacherName: "सुनिल देशमुख",
      taluka: "सटाणा",
      district: "नाशिक",
      id: "default",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      updatedAt: new Date().toISOString()
    }
  }), [players, healthIncidents, activities, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, drillCompletions, schoolProfile]);

  // Persistence methods...
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
      const attRef = doc(db, 'players', playerId, 'attendance', date);
      if (!status) deleteDocumentNonBlocking(attRef);
      else setDocumentNonBlocking(attRef, { status, playerId, date, schoolId: user.uid }, { merge: true });
    });
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const dateId = timestamp.split('T')[0];
    const historyRef = doc(db, 'players', playerId, 'fitnessAssessments', dateId);
    setDocumentNonBlocking(historyRef, { ...assessment, playerId, schoolId: user.uid, updatedAt: timestamp }, { merge: true });
    const latestRef = doc(db, 'players', playerId, 'fitnessAssessments', 'latest');
    setDocumentNonBlocking(latestRef, { ...assessment, playerId, schoolId: user.uid, updatedAt: timestamp }, { merge: true });
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    if (!user) return;
    const skillRef = doc(db, 'players', playerId, 'sportSkills', sport);
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
    const playerIncRef = doc(db, 'players', incident.playerId, 'healthIncidents', incident.id);
    setDocumentNonBlocking(playerIncRef, { ...incident, schoolId: user.uid }, { merge: true });
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
