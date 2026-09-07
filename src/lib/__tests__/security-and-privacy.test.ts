/**
 * Security, Privacy, Role-Based Authorization, and AI Safety Verification Test Suite.
 * Validates Phase 1 through 17 compliance for Waghamba Sports Health Hub.
 */

import {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
  type UserRole,
} from '../auth-roles';
import {
  maskAadhaar,
  isValidAadhaar,
  sanitizeStudentForAI,
} from '../privacy-utils';
import { generateId, generateUUID } from '../id-generator';
import { detectEmergencyRedFlags } from '../ai-safety';

describe('1. Role-Based Access Control & Server Authorization', () => {
  it('Admin must possess full management and destruction privileges', () => {
    const adminPerms = getPermissionsForRole('admin');
    expect(adminPerms.canManageSchool).toBe(true);
    expect(adminPerms.canManageMembers).toBe(true);
    expect(adminPerms.canDeleteStudent).toBe(true);
    expect(adminPerms.isReadOnly).toBe(false);
  });

  it('Teacher can record attendance, fitness, and edit roster, but cannot delete students or manage members', () => {
    const teacherPerms = getPermissionsForRole('teacher');
    expect(teacherPerms.canRecordAttendance).toBe(true);
    expect(teacherPerms.canRecordFitness).toBe(true);
    expect(teacherPerms.canEditRoster).toBe(true);
    expect(teacherPerms.canDeleteStudent).toBe(false);
    expect(teacherPerms.canManageMembers).toBe(false);
    expect(teacherPerms.canManageSchool).toBe(false);
    expect(teacherPerms.isReadOnly).toBe(false);
  });

  it('Coach can record attendance, tactics, and equipment, but has no academic or student deletion permissions', () => {
    const coachPerms = getPermissionsForRole('coach');
    expect(coachPerms.canRecordAttendance).toBe(true);
    expect(coachPerms.canManageTacticsAndMatches).toBe(true);
    expect(coachPerms.canManageEquipment).toBe(true);
    expect(coachPerms.canEditRoster).toBe(false);
    expect(coachPerms.canDeleteStudent).toBe(false);
    expect(coachPerms.canRecordFitness).toBe(false);
    expect(coachPerms.isReadOnly).toBe(false);
  });

  it('Viewer is strictly read-only across all modules', () => {
    const viewerPerms = getPermissionsForRole('viewer');
    expect(viewerPerms.isReadOnly).toBe(true);
    expect(viewerPerms.canRecordAttendance).toBe(false);
    expect(viewerPerms.canEditRoster).toBe(false);
    expect(viewerPerms.canDeleteStudent).toBe(false);
    expect(viewerPerms.canManageSchool).toBe(false);
    expect(viewerPerms.canManageEquipment).toBe(false);
    expect(viewerPerms.canLogInjuries).toBe(false);
  });

  it('Unrecognized or invalid roles default safely to viewer permissions', () => {
    const fallbackPerms = getPermissionsForRole('hacker' as any);
    expect(fallbackPerms.isReadOnly).toBe(true);
    expect(fallbackPerms.canManageSchool).toBe(false);
    expect(hasPermission('hacker' as any, 'canDeleteStudent')).toBe(false);
  });
});

describe('2. Aadhaar & Sensitive Data Privacy', () => {
  it('Aadhaar numbers must be masked displaying only the last 4 digits', () => {
    expect(maskAadhaar('234567890123')).toBe('•••• •••• 0123');
    expect(maskAadhaar('2345 6789 0123')).toBe('•••• •••• 0123');
    expect(maskAadhaar(null)).toBe('---');
    expect(maskAadhaar('')).toBe('---');
  });

  it('Aadhaar validator correctly validates 12-digit format and rejects invalid inputs', () => {
    expect(isValidAadhaar('234567890123')).toBe(true);
    // Invalid: starts with 0 or 1
    expect(isValidAadhaar('012345678901')).toBe(false);
    expect(isValidAadhaar('123456789012')).toBe(false);
    // Invalid: less or more than 12 digits
    expect(isValidAadhaar('12345')).toBe(false);
    expect(isValidAadhaar('23456789012345')).toBe(false);
    // Invalid: repeated digits
    expect(isValidAadhaar('222222222222')).toBe(false);
  });

  it('sanitizeStudentForAI must completely strip PII before external AI transmission', () => {
    const rawStudent = {
      id: 'student_test_12345',
      name: 'Sunil Arjun Patil',
      nameMarathi: 'सुनील अर्जुन पाटील',
      aadharNumber: '234567890123',
      contactNumber: '9876543210',
      parentName: 'Arjun Patil',
      address: 'Waghamba, Baglan, Nashik',
      std: '9',
      age: 14,
      gender: 'Male',
      sports: ['Kabaddi', 'Running'],
      fitnessScore: 88,
      fitnessLevel: 'A',
    };

    const sanitized = sanitizeStudentForAI(rawStudent);

    // Identifiers stripped
    expect(sanitized.athleteId).toBe('Athlete-2345');
    expect((sanitized as any).name).toBeUndefined();
    expect((sanitized as any).nameMarathi).toBeUndefined();
    expect((sanitized as any).aadharNumber).toBeUndefined();
    expect((sanitized as any).contactNumber).toBeUndefined();
    expect((sanitized as any).parentName).toBeUndefined();
    expect((sanitized as any).address).toBeUndefined();

    // Physical and athletic metrics preserved
    expect(sanitized.standard).toBe('Class 9');
    expect(sanitized.age).toBe(14);
    expect(sanitized.gender).toBe('Male');
    expect(sanitized.sports).toEqual(['Kabaddi', 'Running']);
    expect(sanitized.fitnessScore).toBe(88);
  });
});

describe('3. Collision-Resistant ID Generation', () => {
  it('generateId produces non-colliding unique strings with designated prefix', () => {
    const idSet = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      const id = generateId('std');
      expect(id.startsWith('std_')).toBe(true);
      expect(idSet.has(id)).toBe(false);
      idSet.add(id);
    }

    expect(idSet.size).toBe(count);
  });

  it('generateUUID produces valid RFC4122 format', () => {
    const uuid = generateUUID();
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true);
  });
});

describe('4. AI Safety & Medical Red-Flag Detection', () => {
  it('detectEmergencyRedFlags flags suspected fracture symptoms', () => {
    const check1 = detectEmergencyRedFlags('The player fell and has a suspected bone fracture in his arm.');
    expect(check1.isEmergency).toBe(true);
    expect(check1.redFlag).toContain('Fracture');

    const check2 = detectEmergencyRedFlags('खेळाडूचे हाड मोडले आहे आणि प्रचंड वेदना होत आहेत.');
    expect(check2.isEmergency).toBe(true);
  });

  it('detectEmergencyRedFlags flags head trauma and loss of consciousness', () => {
    const check = detectEmergencyRedFlags('Student had a collision, got a head injury and became unconscious for a moment.');
    expect(check.isEmergency).toBe(true);
    expect(check.redFlag).toContain('Head Trauma');
  });

  it('detectEmergencyRedFlags flags chest pain and respiratory distress', () => {
    const check = detectEmergencyRedFlags('Player is clutching his chest with severe chest pain and shortness of breath.');
    expect(check.isEmergency).toBe(true);
    expect(check.redFlag).toContain('Cardiorespiratory');
  });

  it('Normal athletic coaching questions are not flagged as emergencies', () => {
    const check1 = detectEmergencyRedFlags('What is the best warm-up routine for Kabaddi raiders?');
    expect(check1.isEmergency).toBe(false);

    const check2 = detectEmergencyRedFlags('विद्यार्थ्यांना धावण्याचा वेग वाढवण्यासाठी काय आहार द्यावा?');
    expect(check2.isEmergency).toBe(false);
  });
});
