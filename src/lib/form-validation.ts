/**
 * Form Validation Schemas & Error Sanitization for Waghamba Sports Health Hub.
 * Enforces strict input validation across student registration, attendance, fitness, and equipment.
 */

import { z } from 'zod';
import { isValidAadhaar } from './privacy-utils';

export const StudentFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  nameMarathi: z.string().trim().max(100).optional().default(''),
  fatherName: z.string().trim().max(100).optional().default(''),
  motherName: z.string().trim().max(100).optional().default(''),
  panNumber: z.string().trim().max(20).optional().default(''),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select a gender' }),
  dob: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 30 && year <= currentYear - 3;
  }, 'Date of birth must correspond to a valid school age (3-30 years)'),
  std: z.string().refine((val) => {
    const n = parseInt(val, 10);
    return !isNaN(n) && n >= 1 && n <= 12;
  }, 'Standard must be between 1 and 12'),
  section: z.string().max(10).optional().default('A'),
  generalRegisterNumber: z.string().trim().min(1, 'General Register (G.R.) Number is required').max(50),
  aadharNumber: z.string().trim().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return isValidAadhaar(val);
  }, 'Aadhaar number must be exactly 12 digits and valid'),
  contactNumber: z.string().trim().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return /^\d{10}$/.test(val.replace(/\D/g, ''));
  }, 'Contact number must be a valid 10-digit phone number'),
  bloodGroup: z.enum(['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional().default('None'),
  height: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    const n = parseFloat(val);
    return !isNaN(n) && n >= 50 && n <= 250;
  }, 'Height must be between 50 cm and 250 cm'),
  weight: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    const n = parseFloat(val);
    return !isNaN(n) && n >= 10 && n <= 180;
  }, 'Weight must be between 10 kg and 180 kg'),
  sports: z.array(z.string()).default([]),
  category: z.enum(['general', 'athlete']).default('general'),
});

export type StudentFormData = z.infer<typeof StudentFormSchema>;

export const AttendanceItemSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  session: z.enum(['Morning', 'Evening', 'FullDay']),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  schoolId: z.string().min(1),
  academicYear: z.string().min(4),
});

export const EquipmentFormSchema = z.object({
  name: z.string().trim().min(2, 'Item name must be at least 2 characters').max(100),
  sport: z.string().min(1, 'Please select or specify a sport'),
  totalQuantity: z.number().int().min(0, 'Quantity cannot be negative'),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Damaged']).default('Good'),
  storageLocation: z.string().trim().max(100).optional().default('Sports Store Room'),
});

/**
 * Strips sensitive internal backend stacks from error responses before displaying them to users.
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  const message = error.message || String(error);

  if (code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
    return 'तुम्हाला ही कृती करण्याची परवानगी नाही / You do not have permission to perform this action.';
  }
  if (code === 'unavailable' || message.includes('offline')) {
    return 'नेटवर्क अनुपलब्ध आहे. माहिती ऑफलाइन साठवली जाईल / Network is unavailable. Changes are safely queued offline.';
  }
  if (code === 'not-found') {
    return 'नोंद आढळली नाही / Record not found.';
  }
  if (code === 'already-exists') {
    return 'ही नोंद आधीच अस्तित्वात आहे / A record with this identifier already exists.';
  }

  // Generic sanitized message
  return 'कृती अयशस्वी झाली. कृपया माहिती तपासून पुन्हा प्रयत्न करा / Operation failed. Please check inputs and retry.';
}
