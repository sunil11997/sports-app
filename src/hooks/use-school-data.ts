"use client";

import { useState, useEffect } from 'react';
import type { Player, AppState, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident } from '@/lib/types';

const STORAGE_KEY = 'waghamba_sports_v1';

const initialData: AppState = {
  players: [],
  attendance: {},
  fitness: {},
  sportSkills: {},
  healthIncidents: [],
};

export function useSchoolData() {
  const [data, setData] = useState<AppState>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load school data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const addPlayer = (player: Player) => {
    setData(prev => ({ ...prev, players: [...prev.players, player] }));
  };

  const updatePlayer = (player: Player) => {
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === player.id ? player : p)
    }));
  };

  const deletePlayer = (id: string) => {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const setAttendance = (records: AttendanceRecord) => {
    setData(prev => ({ ...prev, attendance: { ...prev.attendance, ...records } }));
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    setData(prev => ({
      ...prev,
      fitness: { ...prev.fitness, [playerId]: assessment }
    }));
  };

  const setSportSkill = (playerId: string, sport: string, skill: SportSkill) => {
    setData(prev => ({
      ...prev,
      sportSkills: { ...prev.sportSkills, [`${playerId}_${sport}`]: skill }
    }));
  };

  const addHealthIncident = (incident: HealthIncident) => {
    setData(prev => ({
      ...prev,
      healthIncidents: [incident, ...prev.healthIncidents]
    }));
  };

  return {
    data,
    isLoaded,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setAttendance,
    setFitness,
    setSportSkill,
    addHealthIncident
  };
}