"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, query, where, limit, Firestore } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useSchoolData() {
  const db = useFirestore();
  const { user } = useUser();

  // 1. Specific School Profile Listener (Targets only current user's school)
  const schoolDocRef = useMemoFirebase(() => user ? doc(db, 'schools', user.uid) : null, [db, user]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  // 2. Players Listener (Query by ownerId for security and performance)
  const playersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user]);
  
  const { data: players, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  // 3. Global Incidents Listener
  const incidentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'all_health_incidents'), where('schoolId', '==', user.uid));
  }, [db, user]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  // 4. Drill Comps Listener
  const drillsSyncRef = useMemoFirebase(() => user ? collection(db, 'drill_completions') : null, [db, user]);
  const { data: drillComps } = useCollection(drillsSyncRef);

  // 5. Reactive State for Sub-collections
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});
  const [drillCompletions, setDrillCompletions] = useState<Record<string, boolean>>({});

  // Sync Drills separately
  useEffect(() => {
    if (drillComps) {
      const logs: Record<string, boolean> = {};
      drillComps.forEach(d => { logs[d.id] = true; });
      setDrillCompletions(logs);
    }
  }, [drillComps]);

  // 6. Subscription Management for Player Sub-collections
  const unsubscribersRef = useRef<Record<string, (() => void)[]>>({});

  useEffect(() => {
    if (!user || !players || players.length === 0) {
      Object.values(unsubscribersRef.current).forEach(unsubs => unsubs.forEach(u => u()));
      unsubscribersRef.current = {};
      return;
    }

    const currentPlayerIds = new Set(players.map(p => p.id));
    
    // Cleanup unsubscribers for players no longer in the list
    Object.keys(unsubscribersRef.current).forEach(id => {
      if (!currentPlayerIds.has(id)) {
        unsubscribersRef.current[id].forEach(u => u());
        delete unsubscribersRef.current[id];
      }
    });

    players.forEach(player => {
      if (!unsubscribersRef.current[player.id]) {
        const unsubs: (() => void)[] = [];

        // Sync Attendance
        const attRef = collection(db, 'players', player.id, 'attendance');
        const unsubAtt = onSnapshot(attRef, 
          (snapshot) => {
            const newAtt: AttendanceRecord = {};
            snapshot.docs.forEach(doc => {
              newAtt[`${player.id}_${doc.id}`] = doc.data().status;
            });
            setAttendanceData(prev => ({ ...prev, ...newAtt }));
          },
          (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: attRef.path,
              operation: 'list'
            }));
          }
        );
        unsubs.push(unsubAtt);

        // Sync Fitness
        const fitRef = collection(db, 'players', player.id, 'fitnessAssessments');
        const unsubFit = onSnapshot(fitRef, 
          (snapshot) => {
            const history: FitnessAssessment[] = [];
            snapshot.docs.forEach(d => {
              const data = d.data() as FitnessAssessment;
              if (d.id === 'latest') {
                setFitnessData(prev => ({ ...prev, [player.id]: data }));
              }
              history.push({ ...data, date: d.id === 'latest' ? data.updatedAt : d.id });
            });
            setFitnessHistory(prev => ({ ...prev, [player.id]: history }));
          },
          (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: fitRef.path,
              operation: 'list'
            }));
          }
        );
        unsubs.push(unsubFit);

        // Sync Sport Skills
        const skillRef = collection(db, 'players', player.id, 'sportSkills');
        const unsubSkill = onSnapshot(skillRef, 
          (snapshot) => {
            const playerSkills: Record<string, SportSkill> = {};
            const historyList: (SportSkill & { sportName: string })[] = [];
            snapshot.docs.forEach(doc => {
              const data = doc.data() as SportSkill;
              playerSkills[`${player.id}_${doc.id}`] = data;
              historyList.push({ ...data, sportName: doc.id });
            });
            setSportSkillsData(prev => ({ ...prev, ...playerSkills }));
            setSkillsHistory(prev => ({ ...prev, [player.id]: historyList }));
          },
          (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: skillRef.path,
              operation: 'list'
            }));
          }
        );
        unsubs.push(unsubSkill);

        unsubscribersRef.current[player.id] = unsubs;
      }
    });

    return () => {};
  }, [db, user, players]); 

  const aggregatedData = useMemo(() => {
    return {
      players: players || [],
      attendance,
      fitness,
      fitnessHistory,
      sportSkills,
      skillsHistory,
      drillCompletions,
      healthIncidents: healthIncidents || [],
      schoolProfile: schoolProfile || null
    };
  }, [players, healthIncidents, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, drillCompletions, schoolProfile]);

  const saveSchoolProfile = (profile: any) => {
    if (!user) return;
    const docId = user.uid;
    const profileRef = doc(db, 'schools', docId);
    setDocumentNonBlocking(profileRef, { 
      ...profile, 
      id: docId, 
      ownerId: user.uid,
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  };

  const addPlayer = (playerData: any) => {
    if (!user) return;
    const playerRef = doc(db, 'players', playerData.id);
    setDocumentNonBlocking(playerRef, { 
      ...playerData, 
      ownerId: user.uid, 
      schoolId: user.uid 
    }, { merge: true });
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
      
      if (!status) {
        deleteDocumentNonBlocking(attRef);
      } else {
        setDocumentNonBlocking(attRef, { 
          status, 
          playerId, 
          date, 
          schoolId: user.uid 
        }, { merge: true });
      }
    });
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const dateId = timestamp.split('T')[0];
    const historyRef = doc(db, 'players', playerId, 'fitnessAssessments', dateId);
    setDocumentNonBlocking(historyRef, { 
      ...assessment, 
      playerId, 
      schoolId: user.uid,
      updatedAt: timestamp 
    }, { merge: true });
    
    const latestRef = doc(db, 'players', playerId, 'fitnessAssessments', 'latest');
    setDocumentNonBlocking(latestRef, { 
      ...assessment, 
      playerId, 
      schoolId: user.uid,
      updatedAt: timestamp 
    }, { merge: true });
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    if (!user) return;
    const skillRef = doc(db, 'players', playerId, 'sportSkills', sport);
    setDocumentNonBlocking(skillRef, { 
      ...skill, 
      playerId, 
      sportName: sport, 
      schoolId: user.uid,
      lastUpdated: new Date().toISOString() 
    }, { merge: true });
  };

  const setDrillCompletion = (drillId: string, completed: boolean) => {
    if (!user) return;
    const drillRef = doc(db, 'drill_completions', drillId);
    if (completed) {
      setDocumentNonBlocking(drillRef, { 
        schoolId: user.uid,
        timestamp: new Date().toISOString() 
      }, { merge: true });
    } else {
      deleteDocumentNonBlocking(drillRef);
    }
  };

  const addHealthIncident = (incident: HealthIncident) => {
    if (!user) return;
    const globalIncRef = doc(db, 'all_health_incidents', incident.id);
    setDocumentNonBlocking(globalIncRef, { ...incident, schoolId: user.uid }, { merge: true });
    const playerIncRef = doc(db, 'players', incident.playerId, 'healthIncidents', incident.id);
    setDocumentNonBlocking(playerIncRef, { ...incident, schoolId: user.uid }, { merge: true });
  };

  const exportBackupData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      schoolName: schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
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
    isLoaded: !playersLoading && !schoolsLoading,
    saveSchoolProfile,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setAttendance,
    setFitness,
    setSportSkill,
    setDrillCompletion,
    addHealthIncident,
    exportBackupData
  };
}