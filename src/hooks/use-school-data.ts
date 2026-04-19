
"use client";

import { useMemo } from 'react';
import { collection, doc, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, AppState } from '@/lib/types';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSchoolData() {
  const db = useFirestore();

  // Memoize collection references
  const playersRef = useMemoFirebase(() => collection(db, 'players'), [db]);
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersRef);

  // We'll aggregate subcollection data. For a large app, we'd fetch subcollections on demand.
  // For this MVP, we fetch the main rosters.
  const allIncidentsRef = useMemoFirebase(() => collection(db, 'all_health_incidents'), [db]);
  const { data: healthIncidents } = useCollection<HealthIncident>(allIncidentsRef);

  // Helper to structure the state for the components
  const aggregatedData: AppState = useMemo(() => {
    return {
      players: players || [],
      attendance: {}, // Managed via specific doc writes
      fitness: {}, // Managed via specific doc writes
      sportSkills: {}, // Managed via specific doc writes
      healthIncidents: healthIncidents || [],
      biometricHistory: [], // These would typically be fetched per player in a real app
      fitnessHistory: [],
    };
  }, [players, healthIncidents]);

  const addPlayer = (player: any) => {
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
