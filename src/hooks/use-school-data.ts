"use client";

import { useState, useEffect } from 'react';
import type { Player, AppState, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, BiometricLog, FitnessLog } from '@/lib/types';
import { format } from 'date-fns';

const STORAGE_KEY = 'waghamba_sports_v1';

const initialData: AppState = {
  players: [],
  attendance: {},
  fitness: {},
  sportSkills: {},
  healthIncidents: [],
  biometricHistory: [],
  fitnessHistory: [],
};

export function useSchoolData() {
  const [data, setData] = useState<AppState>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          ...initialData,
          ...parsed,
          biometricHistory: parsed.biometricHistory || [],
          fitnessHistory: parsed.fitnessHistory || [],
        });
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
    const today = format(new Date(), 'yyyy-MM-dd');
    const bioLog: BiometricLog = {
      playerId: player.id,
      date: today,
      height: player.height,
      weight: player.weight,
      bmi: player.bmi,
    };

    setData(prev => ({ 
      ...prev, 
      players: [...prev.players, player],
      biometricHistory: [...prev.biometricHistory, bioLog]
    }));
  };

  const updatePlayer = (player: Player) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const bioLog: BiometricLog = {
      playerId: player.id,
      date: today,
      height: player.height,
      weight: player.weight,
      bmi: player.bmi,
    };

    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === player.id ? player : p),
      biometricHistory: [...prev.biometricHistory, bioLog]
    }));
  };

  const deletePlayer = (id: string) => {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
      biometricHistory: prev.biometricHistory.filter(h => h.playerId !== id),
      fitnessHistory: prev.fitnessHistory.filter(h => h.playerId !== id),
      healthIncidents: prev.healthIncidents.filter(h => h.playerId !== id),
    }));
  };

  const setAttendance = (records: AttendanceRecord) => {
    setData(prev => ({ ...prev, attendance: { ...prev.attendance, ...records } }));
  };

  const setFitness = (playerId: string, assessment: FitnessAssessment) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const log: FitnessLog = {
      ...assessment,
      playerId,
      date: today,
    };

    setData(prev => ({
      ...prev,
      fitness: { ...prev.fitness, [playerId]: assessment },
      fitnessHistory: [...prev.fitnessHistory, log]
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
