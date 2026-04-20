
"use client";

import { useMemo, useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // 1. Primary Collections
  const playersRef = useMemoFirebase(() => user ? collection(db, 'players') : null, [db, user]);
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersRef);

  const allIncidentsRef = useMemoFirebase(() => user ? collection(db, 'all_health_incidents') : null, [db, user]);
  const { data: healthIncidents } = useCollection<HealthIncident>(allIncidentsRef);

  // 2. Reactive State for Sub-collections
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});

  // 3. Real-time Synchronization Loop
  useEffect(() => {
    if (!user || !players || players.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    players.forEach(player => {
      // Sync Attendance
      const attRef = collection(db, 'players', player.id, 'attendance');
      const unsubAtt = onSnapshot(attRef, (snapshot) => {
        const newAtt: AttendanceRecord = {};
        snapshot.docs.forEach(doc => {
          newAtt[`${player.id}_${doc.id}`] = doc.data().status;
        });
        setAttendanceData(prev => ({ ...prev, ...newAtt }));
      });
      unsubscribers.push(unsubAtt);

      // Sync Fitness
      const fitRef = collection(db, 'players', player.id, 'fitnessAssessments');
      const unsubFit = onSnapshot(fitRef, (snapshot) => {
        const history: FitnessAssessment[] = [];
        snapshot.docs.forEach(d => {
          const data = d.data() as FitnessAssessment;
          if (d.id === 'latest') {
            setFitnessData(prev => ({ ...prev, [player.id]: data }));
          }
          history.push({ ...data, date: d.id === 'latest' ? data.updatedAt : d.id });
        });
        setFitnessHistory(prev => ({ ...prev, [player.id]: history }));
      });
      unsubscribers.push(unsubFit);

      // Sync Sport Skills
      const skillRef = collection(db, 'players', player.id, 'sportSkills');
      const unsubSkill = onSnapshot(skillRef, (snapshot) => {
        const playerSkills: Record<string, SportSkill> = {};
        const historyList: (SportSkill & { sportName: string })[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data() as SportSkill;
          playerSkills[`${player.id}_${doc.id}`] = data;
          historyList.push({ ...data, sportName: doc.id });
        });
        setSportSkillsData(prev => ({ ...prev, ...playerSkills }));
        setSkillsHistory(prev => ({ ...prev, [player.id]: historyList }));
      });
      unsubscribers.push(unsubSkill);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [db, user, players]);

  const aggregatedData = useMemo(() => {
    return {
      players: players || [],
      attendance,
      fitness,
      fitnessHistory,
      sportSkills,
      skillsHistory,
      healthIncidents: healthIncidents || [],
    };
  }, [players, healthIncidents, attendance, fitness, fitnessHistory, sportSkills, skillsHistory]);

  const addPlayer = (player: any) => {
    if (!playersRef) return;
    const newDocRef = doc(playersRef, player.id);
    setDocumentNonBlocking(newDocRef, player, { merge: true });
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
    Object.entries(records).forEach(([key, status]) => {
      const [playerId, date] = key.split('_');
      if (!playerId || !date) return;
      const attRef = doc(db, 'players', playerId, 'attendance', date);
      setDocumentNonBlocking(attRef, { status, playerId, date }, { merge: true });
    });
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    const timestamp = new Date().toISOString();
    const dateId = timestamp.split('T')[0];
    const historyRef = doc(db, 'players', playerId, 'fitnessAssessments', dateId);
    setDocumentNonBlocking(historyRef, { ...assessment, playerId, updatedAt: timestamp }, { merge: true });
    const latestRef = doc(db, 'players', playerId, 'fitnessAssessments', 'latest');
    setDocumentNonBlocking(latestRef, { ...assessment, playerId, updatedAt: timestamp }, { merge: true });
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    const skillRef = doc(db, 'players', playerId, 'sportSkills', sport);
    setDocumentNonBlocking(skillRef, { ...skill, playerId, sportName: sport, lastUpdated: new Date().toISOString() }, { merge: true });
  };

  const addHealthIncident = (incident: HealthIncident) => {
    const globalIncRef = doc(db, 'all_health_incidents', incident.id);
    setDocumentNonBlocking(globalIncRef, incident, { merge: true });
    const playerIncRef = doc(db, 'players', incident.playerId, 'healthIncidents', incident.id);
    setDocumentNonBlocking(playerIncRef, incident, { merge: true });
  };

  const exportBackupData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
      data: aggregatedData
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waghamba_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    data: aggregatedData,
    isLoaded: !playersLoading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setAttendance,
    setFitness,
    setSportSkill,
    addHealthIncident,
    exportBackupData
  };
}
