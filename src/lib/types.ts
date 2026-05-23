export interface Player {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  std: string;
  serialNumber?: string; // Class Serial Number
  dob: string;
  age: number;
  height: string; // Standing Height (cm)
  sittingHeight?: string; // Sitting Height (cm)
  weight: string;
  bmi: string;
  bloodGroup?: string;
  aadharNumber?: string;
  mobileNumber?: string;
  generalRegisterNumber?: string;
  address?: string;
  aadharPhotoUrl?: string;
  sports: string[];
  history: 'Yes' | 'No';
  histDetail?: string;
  medical?: string;
  photoUrl?: string;
  category: 'athlete' | 'student';
  examMarks?: string;
  academicYear?: string;
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
  [key: string]: 'P' | 'A' | undefined | null; // key: playerId_dateString_session
}

export interface FitnessAssessment {
  shuttleRun?: string;   // 10*6 Shuttle Run (Agility)
  run50m?: string;       // 50 Meter Run (Speed)
  run600m?: string;      // 600 Meter Run (Endurance / Stamina)
  sitAndReach?: string;  // Flexibility
  boardJump?: string;    // Power / Broad Jump
  sitUps?: string;       // Core Strength
  sprint30m?: string;    // Raw 30m Linear Sprint
  proAgility?: string;   // Pro-Agility (5-10-5) Shuttle
  codDeficit?: string;   // Calculated Change of Direction Deficit
  agilityDiagnostic?: string; // Classification Text
  strengthScore?: string; // Specific Strength Rating (0-100)
  enduranceScore?: string; // Specific Endurance Rating (0-100)
  speedScore?: string;    // Specific Speed Rating (0-100)
  score: string;
  status: string;
  date?: string;
  updatedAt?: string;
  playerId?: string;
  term?: 'First' | 'Second';
  academicYear?: string;
  height?: string;
  weight?: string;
  examMarks?: string;
  nirikshan?: string;    
  tondikam?: string;     
  pratyashike?: string;  
  upkram?: string;       
  prakalp?: string;      
  chachani?: string;     
  swadhyay?: string;     
}

export interface TacticalEvent {
  id: string;
  playerId: string;
  playerName: string;
  sport: string;
  date: string;
  situation: string;
  decisionType: 'Positive' | 'Negative';
  outcome: 'Success' | 'Failure';
  description: string;
  schoolId: string;
  academicYear: string;
}

export interface GoalRecord {
  id: string;
  playerId: string;
  playerName: string;
  sport: string;
  metric: string;
  currentPB: string;
  target: string;
  month: string; // yyyy-MM
  schoolId: string;
  academicYear: string;
}

export interface ExamLabels {
  nirikshan: string;
  tondikam: string;
  pratyashike: string;
  upkram: string;
  prakalp: string;
  chachani: string;
  swadhyay: string;
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
  academicYear?: string;
}

export interface AppState {
  players: Player[];
  attendance: AttendanceRecord;
  fitness: Record<string, FitnessAssessment>;
  sportSkills: Record<string, SportSkill>; 
  healthIncidents: HealthIncident[];
}

export interface HealthIncident {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  description: string;
  academicYear?: string;
  severity: 'Minor' | 'Critical';
  category: 'athlete' | 'student';
}
