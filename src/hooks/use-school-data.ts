"use client";

import { useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, AppState } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // Memoize collection references - only provide the reference if the user is authenticated
  // to avoid permission errors on the splash screen.
  const playersRef = useMemoFirebase(() => user ? collection(db, 'players') : null, [db, user]);
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersRef);

  const allIncidentsRef = useMemoFirebase(() => user ? collection(db, 'all_health_incidents') : null, [db, user]);
  const { data: healthIncidents } = useCollection<HealthIncident>(allIncidentsRef);

  // Helper to structure the state for the components
  const aggregatedData: AppState = useMemo(() => {
    return {
      players: players || [],
      attendance: {}, // Managed via specific doc writes in this MVP
      fitness: {}, 
      sportSkills: {}, 
      healthIncidents: healthIncidents || [],
      biometricHistory: [], 
      fitnessHistory: [],
    };
  }, [players, healthIncidents]);

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
      const attRef = doc(db, 'players', playerId, 'attendance', date);
      setDocumentNonBlocking(attRef, { status, playerId, date }, { merge: true });
    });
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    const fitRef = doc(db, 'players', playerId, 'fitnessAssessments', 'latest');
    setDocumentNonBlocking(fitRef, { ...assessment, playerId }, { merge: true });
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    const skillRef = doc(db, 'players', playerId, 'sportSkills', sport);
    setDocumentNonBlocking(skillRef, { ...skill, playerId, sportName: sport }, { merge: true });
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