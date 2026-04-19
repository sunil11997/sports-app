
"use client";

import { useMemo, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, AppState } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // 1. Primary Collections
  const playersRef = useMemoFirebase(() => user ? collection(db, 'players') : null, [db, user]);
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersRef);

  const allIncidentsRef = useMemoFirebase(() => user ? collection(db, 'all_health_incidents') : null, [db, user]);
  const { data: healthIncidents } = useCollection<HealthIncident>(allIncidentsRef);

  // 2. Reactive State for Sub-collections (Attendance, Fitness, Skills)
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});

  // 3. Real-time Synchronization Loop
  useEffect(() => {
    if (!user || !players || players.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    // Sync sub-data for each player in the roster
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

      // Sync Fitness (Latest)
      const fitRef = collection(db, 'players', player.id, 'fitnessAssessments');
      const unsubFit = onSnapshot(fitRef, (snapshot) => {
        const latestDoc = snapshot.docs.find(d => d.id === 'latest');
        if (latestDoc) {
          setFitnessData(prev => ({ ...prev, [player.id]: latestDoc.data() as FitnessAssessment }));
        }
      });
      unsubscribers.push(unsubFit);

      // Sync Sport Skills
      const skillRef = collection(db, 'players', player.id, 'sportSkills');
      const unsubSkill = onSnapshot(skillRef, (snapshot) => {
        const playerSkills: Record<string, SportSkill> = {};
        snapshot.docs.forEach(doc => {
          playerSkills[`${player.id}_${doc.id}`] = doc.data() as SportSkill;
        });
        setSportSkillsData(prev => ({ ...prev, ...playerSkills }));
      });
      unsubscribers.push(unsubSkill);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [db, user, players]);

  const aggregatedData: AppState = useMemo(() => {
    return {
      players: players || [],
      attendance,
      fitness,
      sportSkills,
      healthIncidents: healthIncidents || [],
      biometricHistory: [], 
      fitnessHistory: [],
    };
  }, [players, healthIncidents, attendance, fitness, sportSkills]);

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
    const fitRef = doc(db, 'players', playerId, 'fitnessAssessments', 'latest');
    setDocumentNonBlocking(fitRef, { ...assessment, playerId, updatedAt: new Date().toISOString() }, { merge: true });
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

  return {
    data: aggregatedData,
    isLoaded: !playersLoading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setAttendance,
    setFitness,
    setSportSkill,
    addHealthIncident
  };
}
