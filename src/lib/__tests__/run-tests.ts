/**
 * Verification test runner script for Waghamba Sports Health Hub.
 * Executes security, privacy, role-based authorization, and AI boundaries tests.
 */

import {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
} from '../auth-roles';
import {
  maskAadhaar,
  isValidAadhaar,
  sanitizeStudentForAI,
} from '../privacy-utils';
import { generateId, generateUUID } from '../id-generator';
import { detectEmergencyRedFlags } from '../ai-safety';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log(' WAGHAMBA SPORTS HEALTH HUB • VERIFICATION TEST SUITE');
console.log('======================================================\n');

// 1. Role-Based Access Control
console.log('--- Suite 1: Role-Based Authorization & Permissions ---');
{
  const admin = getPermissionsForRole('admin');
  assert(admin.canManageSchool === true && admin.canDeleteStudent === true, 'Admin has full school and delete permissions');

  const teacher = getPermissionsForRole('teacher');
  assert(teacher.canRecordAttendance === true && teacher.canDeleteStudent === false, 'Teacher can record attendance but NOT delete students');

  const coach = getPermissionsForRole('coach');
  assert(coach.canManageTacticsAndMatches === true && coach.canEditRoster === false, 'Coach can manage tactics/matches but NOT edit roster');

  const viewer = getPermissionsForRole('viewer');
  assert(viewer.isReadOnly === true && viewer.canRecordAttendance === false, 'Viewer is strictly read-only with no write permissions');

  const hacker = getPermissionsForRole('unauthorized_role');
  assert(hacker.isReadOnly === true && hacker.canManageSchool === false, 'Unknown role defaults safely to viewer');
}

// 2. Aadhaar & Privacy
console.log('\n--- Suite 2: Aadhaar & Sensitive Data Privacy ---');
{
  assert(maskAadhaar('234567890123') === '•••• •••• 0123', 'Aadhaar masking displays only last 4 digits');
  assert(maskAadhaar(null) === '---', 'Null Aadhaar returns safe placeholder');
  assert(isValidAadhaar('234567890123') === true, 'Valid 12-digit Aadhaar accepted');
  assert(isValidAadhaar('012345678901') === false, 'Aadhaar starting with 0 rejected');
  assert(isValidAadhaar('12345') === false, 'Aadhaar with short length rejected');
  assert(isValidAadhaar('222222222222') === false, 'Aadhaar with identical digits rejected');

  const raw = {
    id: 'std_998877',
    name: 'Suresh Patil',
    aadharNumber: '234567890123',
    contactNumber: '9988776655',
    parentName: 'Ramesh Patil',
    address: 'Waghamba Village',
    std: '8',
    age: 13,
    gender: 'Male',
    sports: ['Kabaddi'],
    fitnessScore: 92,
  };
  const sanitized = sanitizeStudentForAI(raw);
  assert(sanitized.athleteId === 'Athlete-8877', 'PII sanitized: name replaced by anonymous athlete ID');
  assert(typeof (sanitized as any).name === 'undefined', 'PII sanitized: real student name stripped');
  assert(typeof (sanitized as any).aadharNumber === 'undefined', 'PII sanitized: Aadhaar number stripped');
  assert(typeof (sanitized as any).contactNumber === 'undefined', 'PII sanitized: contact number stripped');
  assert(sanitized.sports[0] === 'Kabaddi' && sanitized.fitnessScore === 92, 'Non-identifying physical metrics preserved');
}

// 3. Collision-Resistant ID Generation
console.log('\n--- Suite 3: Collision-Resistant ID Generation ---');
{
  const set = new Set<string>();
  const total = 500;
  for (let i = 0; i < total; i++) {
    set.add(generateId('test'));
  }
  assert(set.size === total, `Generated ${total} unique, non-colliding IDs`);

  const uuid = generateUUID();
  assert(uuid.length === 36 && uuid.includes('-'), 'generateUUID produces standard RFC4122 format');
}

// 4. AI Safety & Red-Flag Protocol
console.log('\n--- Suite 4: AI Safety & Emergency Red-Flag Screening ---');
{
  const r1 = detectEmergencyRedFlags('Player fell down and has a suspected bone fracture in his leg.');
  assert(r1.isEmergency === true && r1.redFlag.includes('Fracture'), 'Suspected fracture detected as medical emergency');

  const r2 = detectEmergencyRedFlags('खेळाडूचे हाड मोडले आहे आणि असह्य वेदना होत आहेत');
  assert(r2.isEmergency === true, 'Marathi fracture query detected as medical emergency');

  const r3 = detectEmergencyRedFlags('Student got hit in the head, feels dizzy and lost consciousness.');
  assert(r3.isEmergency === true, 'Head injury and concussion detected as emergency');

  const r4 = detectEmergencyRedFlags('Player is experiencing severe chest pain and cannot breathe.');
  assert(r4.isEmergency === true, 'Chest pain & breathing trouble detected as emergency');

  const normal = detectEmergencyRedFlags('What is the best warm-up drill for Kho-Kho?');
  assert(normal.isEmergency === false, 'Standard sports coaching question is not flagged');
}

console.log('\n------------------------------------------------------');
console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
