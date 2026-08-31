import { z } from 'zod';

/**
 * Player / Student Registration Validation Schema
 */
export const PlayerSchema = z.object({
  id: z.string().min(1, 'Player ID is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  nameMarathi: z.string().optional(),
  gender: z.enum(['Male', 'Female']),
  std: z.string().min(1, 'Standard is required'),
  serialNumber: z.string().optional(),
  dob: z.string().min(4, 'Valid Date of Birth is required'),
  age: z.number().min(3).max(25),
  height: z.string().min(1, 'Height is required'),
  sittingHeight: z.string().optional(),
  weight: z.string().min(1, 'Weight is required'),
  bmi: z.string().optional(),
  bloodGroup: z.string().optional(),
  aadharNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  generalRegisterNumber: z.string().optional(),
  address: z.string().optional(),
  sports: z.array(z.string()).default([]),
  history: z.enum(['Yes', 'No']).default('No'),
  histDetail: z.string().optional(),
  medical: z.string().optional(),
  photoUrl: z.string().optional(),
  category: z.enum(['athlete', 'student']).default('student'),
  jerseyNumber: z.string().optional(),
  jerseyNumbers: z.record(z.string()).optional(),
  positions: z.record(z.string()).optional(),
  schoolId: z.string().optional(),
  ownerId: z.string().optional()
});

/**
 * Health Incident / Injury Log Schema
 */
export const HealthIncidentSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1, 'Player ID is required'),
  playerName: z.string().min(1, 'Player name is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  severity: z.enum(['Minor', 'Critical']),
  category: z.enum(['athlete', 'student']),
  academicYear: z.string().optional(),
  resolved: z.boolean().optional(),
  schoolId: z.string().optional()
});

/**
 * Equipment Item Inventory Schema
 */
export const EquipmentItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Item name is required'),
  nameMarathi: z.string().min(2, 'Marathi name is required'),
  category: z.enum(['Balls', 'Nets & Mats', 'Athletics', 'Training & PT', 'First Aid', 'Other']),
  totalQty: z.number().min(0, 'Total quantity must be non-negative'),
  availableQty: z.number().min(0, 'Available quantity must be non-negative'),
  damagedQty: z.number().min(0, 'Damaged quantity must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  condition: z.enum(['Good', 'Needs Repair', 'Damaged', 'Expired']),
  notes: z.string().optional(),
  sport: z.string().optional(),
  schoolId: z.string().optional()
});

/**
 * School Profile Validation Schema
 */
export const SchoolProfileSchema = z.object({
  id: z.string().min(1),
  teacherName: z.string().min(2, 'Teacher name is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  role: z.string().min(2, 'Role is required'),
  schoolName: z.string().min(3, 'School name is required'),
  taluka: z.string().min(2, 'Taluka is required'),
  district: z.string().min(2, 'District is required'),
  passcode: z.string().optional(),
  teacherSignature: z.string().optional(),
  importantInfo: z.string().optional()
});
