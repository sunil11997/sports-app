export type UserRole = 'admin' | 'teacher' | 'coach' | 'viewer';

export interface AuthUser {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  role?: UserRole;
  schoolId?: string;
}

export interface Player {
  id: string;
  name: string;
  nameMarathi?: string; // Devanagari Name for official registers
  gender: 'Male' | 'Female';
  std: string;
  serialNumber?: string; // Class Serial Number / Roll No
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
  storagePath?: string;
  category: 'athlete' | 'student';
  examMarks?: string;
  academicYear?: string;
  ageCategory?: string;
  ageDetailed?: string;
  motherName?: string;
  fatherName?: string;
  saralId?: string;
  admissionDate?: string;
  identificationMark?: string;
  jerseyNumber?: string;
  jerseyNumbers?: Record<string, string>; // Sport -> Jersey number e.g. { "Kabaddi": "7", "Volleyball": "10" }
  positions?: Record<string, string>; // Sport -> Tactical position e.g. { "Kabaddi": "Right Corner", "Kho Kho": "Runner (Batch 1)" }
  faceDescriptor?: number[]; // 128-dimensional face embedding vector
  faceDescriptors?: number[][]; // Multiple enrolled face descriptors (optional)
  faceEnrolledAt?: string; // ISO date timestamp of face registration
  faceEnrolledPhotoUrl?: string; // Captured snapshot during face enrollment
  schoolId?: string;
  ownerId?: string;
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
  passcode?: string; // Secure PIN for app entry
  teacherSignature?: string; // Custom Base64 or Image URL for Teacher Signature
  ownerId?: string;
  adminEmail?: string;
}

export interface AttendanceRecord {
  [key: string]: 'P' | 'A' | undefined | null; // key: playerId_dateString_session
}

export interface FitnessAssessment {
  shuttleRun?: string;   // 10*6 Shuttle Run (Agility)
  run50m?: string;       // 50 Meter Run (Speed)
  run600m?: string;      // 600 Meter Run (Endurance / Stamina)
  sitAndReach?: string;  // Flexibility
  boardJump?: string;    // Standup Jump / Broad Jump (cm)
  sitUps?: string;       // Core Strength
  sprint30m?: string;    // Raw 30m Linear Sprint
  proAgility?: string;   // Pro-Agility (5-10-5) Shuttle
  codDeficit?: string;   // Calculated Change of Direction Deficit
  agilityDiagnostic?: string; // Classification Text
  strengthScore?: string; // Specific Strength Rating (0-100)
  enduranceScore?: string; // Specific Endurance Rating (0-100)
  speedScore?: string;    // Specific Speed Rating (0-100)
  flexScore?: string;
  agilityScore?: string;
  
  // Monthly Performance Fields
  metric1?: string;
  metric2?: string;
  metric3?: string;
  metric4?: string;
  metric5?: string;
  metric6?: string;
  metric7?: string;
  
  score: string;
  status: string;
  date?: string;
  month?: string; // yyyy-MM
  updatedAt?: string;
  playerId?: string;
  term?: 'First' | 'Second';
  academicYear?: string;
  schoolId?: string;
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

export interface DailyReadinessRecord {
  playerId: string;
  date: string;
  sleepHours?: number;
  sorenessScore?: number;
  fatigueScore?: number;
  injuryStatus?: 'Fit to Train' | 'Restricted' | 'Sidelined';
  painLevel?: number;
  swellingStatus?: 'none' | 'mild' | 'severe';
  rangeOfMotion?: 'full' | 'partial' | 'restricted';
  functionalTest?: 'passed' | 'mild_discomfort' | 'failed';
  psychologicalConfidence?: 'confident' | 'hesitant' | 'fearful';
  notes?: string;
  schoolId?: string;
  academicYear?: string;
  timestamp?: string;
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

export interface PerformanceLabels {
  metric1: string;
  metric2: string;
  metric3: string;
  metric4: string;
  metric5: string;
  metric6: string;
  metric7: string;
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
  schoolId?: string;
}

export interface AppState {
  players: Player[];
  attendance: AttendanceRecord;
  fitness: Record<string, FitnessAssessment>;
  sportSkills: Record<string, SportSkill>; 
  healthIncidents: HealthIncident[];
  dailyReadiness?: Record<string, DailyReadinessRecord>;
  schoolProfile?: SchoolProfile;
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
  resolved?: boolean;
  resolutionDate?: string;
  schoolId?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  nameMarathi: string;
  category: 'Balls' | 'Nets & Mats' | 'Athletics' | 'Training & PT' | 'First Aid' | 'Other';
  totalQty: number;
  availableQty: number;
  damagedQty: number;
  unit: string; // e.g. 'Nos', 'Sets', 'Boxes', 'Pairs'
  condition: 'Good' | 'Needs Repair' | 'Damaged' | 'Expired';
  notes?: string;
  lastChecked?: string;
  sport?: string;
  schoolId?: string;
}

export interface EquipmentIssueRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemNameMarathi: string;
  issuedTo: string; // Student / Captain / Class Monitor name
  roleOrClass: string; // e.g. "Std 9th B Captain", "House Leader", "PE Monitor"
  quantity: number;
  issueDate: string; // YYYY-MM-DD HH:mm
  expectedReturnDate?: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue' | 'Damaged';
  remarks?: string;
  schoolId?: string;
}

export interface IndentItem {
  id: string;
  itemName: string;
  itemNameMarathi: string;
  category: string;
  currentStock: number;
  requiredQty: number;
  estimatedRate: number; // in INR
  totalEstimate: number;
  justification: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface PracticeSlot {
  id: string;
  time: string;
  sport: string;
  ground: string;
  coach: string;
  groupName: string;
  skills: string[];
  players: string[];
}

export interface DailyPracticeSchedule {
  id: string;
  schoolId: string;
  date: string;
  ageGroup: 'U14' | 'U17' | 'U19';
  duration: number;
  maxGroupSize: number;
  grounds: string[];
  coaches: string[];
  timetable: PracticeSlot[];
  updatedAt: string;
}

export interface SchoolActivity {
  id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  category: 'Sports' | 'Fitness' | 'Health Camp' | 'Tournament' | 'Yoga' | 'PT' | 'Other';
  schoolId: string;
  academicYear: string;
  attendeesCount?: number;
  photoUrl?: string;
}

export interface DailySummary {
  id: string;
  date: string;
  schoolId: string;
  attendancePresent: number;
  attendanceTotal: number;
  trainingLoadAvg: number;
  injuriesReported: number;
  readinessRate: number;
  summaryNotes?: string;
  updatedAt: string;
}

export interface ReportPhoto {
  id: string;
  schoolId: string;
  date: string;
  title: string;
  photoUrl: string;
  storagePath?: string;
  category: string;
  academicYear: string;
}

export interface DrillCompletion {
  id: string;
  playerId: string;
  drillId: string;
  drillName: string;
  sport: string;
  completedAt: string;
  score?: number;
  schoolId: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'achievement' | 'injury' | 'schedule';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface ParentShareData {
  playerId: string;
  playerName: string;
  dob: string;
  std: string;
  schoolName: string;
  teacherName: string;
  fitnessSummary: {
    status: string;
    score: string;
    bmi: string;
  };
  attendanceSummary: {
    presentDays: number;
    totalDays: number;
    percentage: string;
  };
  achievements: string[];
  recentReadiness?: string;
  shareDate: string;
}

export interface TeamPlan {
  id: string;
  schoolId: string;
  sport: string;
  category: string;
  gender: string;
  starters: string[];
  reserves: string[];
  captainId?: string;
  viceCaptainId?: string;
  academicYear: string;
  updatedAt: string;
}

