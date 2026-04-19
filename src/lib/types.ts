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
  bloodGroup?: string;
  sports: string[];
  history: 'Yes' | 'No';
  histDetail?: string;
  medical?: string;
}

export interface AttendanceRecord {
  [key: string]: 'P' | 'A'; // key: playerId_dateString (YYYY-MM-DD)
}

export interface FitnessAssessment {
  shuttleRun: string;   // 10*6 Shuttle Run
  run50m: string;       // 50 Meter Run
  run600m: string;      // 600 Meter Run
  sitAndReach: string;  // Flexibility
  boardJump: string;    // Power
  sitUps: string;       // Core
  score: string;
  status: string;
  date?: string;        // Added for history
}

export interface SportSkill {
  skill1: string;
  score1: string;
  skill2: string;
  score2: string;
  score: string;
  detailedSkills?: Record<string, string>; // Generic field for detailed scoring
}

export interface BiometricLog {
  playerId: string;
  date: string;
  height: string;
  weight: string;
  bmi: string;
}

export interface FitnessLog extends FitnessAssessment {
  playerId: string;
  date: string;
}

export interface AppState {
  players: Player[];
  attendance: AttendanceRecord;
  fitness: Record<string, FitnessAssessment>;
  sportSkills: Record<string, SportSkill>; // key: playerId_sportName
  healthIncidents: HealthIncident[];
  biometricHistory: BiometricLog[];
  fitnessHistory: FitnessLog[];
}

export interface HealthIncident {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  description: string;
}
