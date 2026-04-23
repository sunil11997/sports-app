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
  aadharNumber?: string;
  mobileNumber?: string;
  sports: string[];
  history: 'Yes' | 'No';
  histDetail?: string;
  medical?: string;
  photoUrl?: string;
  category: 'athlete' | 'student';
  examMarks?: string;
}

export interface SchoolProfile {
  id: string;
  teacherName: string;
  qualification: string;
  role: string;
  schoolName: string;
  taluka: string;
  district: string;
  importantInfo?: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  [key: string]: 'P' | 'A' | undefined | null; // key: playerId_dateString (YYYY-MM-DD)
}

export interface FitnessAssessment {
  shuttleRun?: string;   // 10*6 Shuttle Run (Agility)
  run50m?: string;       // 50 Meter Run (Speed)
  run600m?: string;      // 600 Meter Run (Endurance)
  sitAndReach?: string;  // Flexibility
  boardJump?: string;    // Power / Broad Jump
  sitUps?: string;       // Core Strength
  strengthScore?: string; // Specific Strength Rating
  score: string;
  status: string;
  date?: string;
  updatedAt?: string;
  playerId?: string;
  term?: 'First' | 'Second';
  // Registry specific monthly data
  height?: string;
  weight?: string;
  examMarks?: string;
  // Marathi Academic Markers
  nirikshan?: string;    // दैनंदिन निरीक्षण
  tondikam?: string;     // तोंडीकाम
  pratyashike?: string;  // प्रात्यक्षिके/प्रयोग
  upkram?: string;       // उपक्रम/कृती
  prakalp?: string;      // प्रकल्प
  chachani?: string;     // चाचणी (लेखी)
  swadhyay?: string;     // स्वाध्याय/वर्गकार्य
}

export interface SportSkill {
  skill1: string;
  score1: string;
  skill2: string;
  score2: string;
  score: string;
  detailedSkills?: Record<string, string>;
  lastUpdated?: string;
  sportName?: string;
  playerId?: string;
}

export interface AppState {
  players: Player[];
  attendance: AttendanceRecord;
  fitness: Record<string, FitnessAssessment>;
  sportSkills: Record<string, SportSkill>; // key: playerId_sportName
  healthIncidents: HealthIncident[];
}

export interface HealthIncident {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  description: string;
}
