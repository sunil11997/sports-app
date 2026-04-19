export interface Player {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  std: string;
  dob: string;
  age: number;
  height: string;
  weight: string;
  bmi: string;
  sport: string;
  history: 'Yes' | 'No';
  histDetail?: string;
  medical?: string;
}

export interface AttendanceRecord {
  [key: string]: 'P' | 'A'; // key: playerId_dateString (YYYY-MM-DD)
}

export interface FitnessAssessment {
  flexibility: string;
  endurance: string;
  score: string;
  status: string;
}

export interface SportSkill {
  skill1: string;
  skill2: string;
  score: string;
}

export interface HealthIncident {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  description: string;
}

export interface AppState {
  players: Player[];
  attendance: AttendanceRecord;
  fitness: Record<string, FitnessAssessment>;
  sportSkills: Record<string, SportSkill>; // key: playerId_sportName
  healthIncidents: HealthIncident[];
}