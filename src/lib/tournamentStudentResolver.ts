/**
 * Tournament Student Resolver Utility
 * Resolves full student details: Mother Name, Aadhaar Number, Marathi Name,
 * exact Age Category (वयोगट: १४ / १७ / १९ वर्षाखालील), and default school metadata.
 */

import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';
import { correctMarathiFullName, decomposeMarathiFullName } from '@/lib/marathiNameHelper';
import { getAgeValidation } from '@/lib/utils';
import { DEFAULT_UDISE, DEFAULT_TALUKA, DEFAULT_SCHOOL_MR } from '@/lib/tournamentExcelExport';

export function formatDobDDMMYYYY(dob?: string): string {
  if (!dob || dob === '-' || dob === '---') return '-';
  const clean = String(dob).trim();
  if (clean.includes('/')) return clean;
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
    }
  }
  return clean;
}

export function formatAadharGrouped(aadhar?: string): string {
  if (!aadhar || aadhar === '-' || aadhar === '---') return '-';
  const digits = String(aadhar).replace(/\D/g, '');
  if (digits.length === 12) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
  if (digits.length > 0) {
    return digits;
  }
  return String(aadhar).trim();
}

/**
 * Accurately determines the official Marathi Age Group (वयोगट)
 * Strictly returns '१४ वर्षाखालील मुले/मुली', '१७ वर्षाखालील मुले/मुली', or '१९ वर्षाखालील मुले/मुली'
 * NEVER returns just 'मुले' or 'मुली'.
 */
export function getPlayerAgeCategoryLabel(player: any, genderFallback?: string): string {
  const isGirl = player.gender === 'Female' || 
                 player.gender === 'मुली' || 
                 player.gender === 'female' || 
                 player.gender === 'F' || 
                 genderFallback === 'Female' || 
                 genderFallback === 'मुली';
  const suffix = isGirl ? 'मुली' : 'मुले';

  // 1. If explicit category already set (e.g. '14 वर्षाखालील मुले')
  if (player.ageCategoryLabel && typeof player.ageCategoryLabel === 'string') {
    const raw = player.ageCategoryLabel.trim();
    if (raw.includes('14') || raw.includes('१४')) return `१४ वर्षाखालील ${suffix}`;
    if (raw.includes('17') || raw.includes('१७')) return `१७ वर्षाखालील ${suffix}`;
    if (raw.includes('19') || raw.includes('१९')) return `१९ वर्षाखालील ${suffix}`;
  }

  // 2. Check DOB age cut-off as per official SGFI / Maharashtra School Sports rules (cut-off: 31 Dec 2026)
  if (player.dob && player.dob !== '-' && player.dob !== '---') {
    const ageVal = getAgeValidation(player.dob, 2026);
    if (ageVal) {
      if (ageVal.eligibilityType === 'U14') return `१४ वर्षाखालील ${suffix}`;
      if (ageVal.eligibilityType === 'U17') return `१७ वर्षाखालील ${suffix}`;
      if (ageVal.eligibilityType === 'U19') return `१९ वर्षाखालील ${suffix}`;
      if (ageVal.ageYears > 0) {
        if (ageVal.ageYears < 14) return `१४ वर्षाखालील ${suffix}`;
        if (ageVal.ageYears < 17) return `१७ वर्षाखालील ${suffix}`;
        return `१९ वर्षाखालील ${suffix}`;
      }
    }
  }

  // 3. Fallback based on Standard (इयत्ता) in school sports
  // Std 1 to 7 = Under 14
  // Std 8 to 10 = Under 17
  // Std 11 to 12 = Under 19
  const rawStd = String(player.std || '');
  const stdNum = parseInt(rawStd.replace(/\D/g, ''), 10);
  if (stdNum > 0) {
    if (stdNum <= 7) return `१४ वर्षाखालील ${suffix}`;
    if (stdNum <= 10) return `१७ वर्षाखालील ${suffix}`;
    return `१९ वर्षाखालील ${suffix}`;
  }

  // 4. Fallback based on age property
  const ageNum = parseInt(String(player.age || '').replace(/\D/g, ''), 10);
  if (ageNum > 0) {
    if (ageNum < 14) return `१४ वर्षाखालील ${suffix}`;
    if (ageNum < 17) return `१७ वर्षाखालील ${suffix}`;
    return `१९ वर्षाखालील ${suffix}`;
  }

  // Default for middle school
  return `१४ वर्षाखालील ${suffix}`;
}

/**
 * Searches WAGHAMBA_STUDENTS_DATA using multi-layer fuzzy matching
 */
export function findStudentInMasterRegistry(p: any): SchoolStudent | undefined {
  if (!p) return undefined;

  const id = (p.id || '').trim();
  const rawName = (p.name || '').trim().toLowerCase();
  const marathiName = (p.nameMarathi || '').trim();
  const gr = String(p.generalRegisterNumber || p.serialNumber || p.rollNo || '').trim();
  const std = String(p.std || '').replace(/\D/g, '').trim();

  // 1. Direct ID match
  if (id) {
    const byId = WAGHAMBA_STUDENTS_DATA.find(s => s.id === id);
    if (byId) return byId;
  }

  // 2. RollNo + Standard match
  if (gr && std) {
    const byRollStd = WAGHAMBA_STUDENTS_DATA.find(s => (s.rollNo === gr || s.serialNumber === gr) && s.std === std);
    if (byRollStd) return byRollStd;
  }

  // 3. Exact Marathi Name match
  if (marathiName) {
    const exactMr = WAGHAMBA_STUDENTS_DATA.find(s => s.nameMarathi === marathiName);
    if (exactMr) return exactMr;

    // Substring / Token match
    const tokens: string[] = marathiName.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      const byTokens = WAGHAMBA_STUDENTS_DATA.find(s => {
        if (std && s.std !== std) return false;
        return tokens.every((tok: string) => s.nameMarathi.includes(tok));
      });
      if (byTokens) return byTokens;
    }
  }

  // 4. English Name token match
  if (rawName) {
    const exactEn = WAGHAMBA_STUDENTS_DATA.find(s => s.name.toLowerCase() === rawName);
    if (exactEn) return exactEn;

    const enTokens: string[] = rawName.split(/\s+/).filter(Boolean);
    if (enTokens.length >= 2) {
      const byEnTokens = WAGHAMBA_STUDENTS_DATA.find(s => {
        if (std && s.std !== std) return false;
        const sLower = s.name.toLowerCase();
        return enTokens.every((tok: string) => sLower.includes(tok));
      });
      if (byEnTokens) return byEnTokens;
    }
  }

  // 5. RollNo match only if unique
  if (gr) {
    const rollMatches = WAGHAMBA_STUDENTS_DATA.filter(s => s.rollNo === gr || s.serialNumber === gr);
    if (rollMatches.length === 1) return rollMatches[0];
  }

  return undefined;
}

/**
 * Resolves full student data ensuring:
 * - motherName is populated (from player, master registry, or Marathi name decomposition)
 * - aadhar is populated (from aadharNumber, apaarId, master registry apaarId)
 * - ageCategoryLabel has exact '१४/१७/१९ वर्षाखालील मुले/मुली'
 * - schoolName, uDise, taluka have official defaults
 */
export function resolveStudentDetails(p: any, defaultSportMr: string = '', defaultCategoryLabel: string = ''): {
  studentName: string;
  std: string;
  grNo: string;
  dob: string;
  motherName: string;
  aadhar: string;
  saralId: string;
  schoolName: string;
  uDise: string;
  taluka: string;
  ageCategoryLabel: string;
  sportOrEvent: string;
  gender: string;
} {
  const masterStudent = findStudentInMasterRegistry(p);

  // Student Full Name
  let studentName = p.nameMarathi?.trim() || 
                    masterStudent?.nameMarathi?.trim() || 
                    p.name || 
                    masterStudent?.name || 
                    '';
  studentName = correctMarathiFullName(studentName);

  // Class / Std
  const rawStd = p.std || masterStudent?.std || '';
  const stdNum = String(rawStd).replace(/\D/g, '');
  const std = stdNum ? `इ. ${stdNum} वी` : (rawStd || '-');

  // G.R. Number
  const grNo = String(p.generalRegisterNumber || masterStudent?.rollNo || p.serialNumber || masterStudent?.serialNumber || '-');

  // Date of Birth
  const rawDob = p.dob || masterStudent?.dob || '';
  const dob = formatDobDDMMYYYY(rawDob);

  // Mother's Name resolution:
  // Priority 1: p.motherName (if non-empty)
  // Priority 2: masterStudent.motherName
  // Priority 3: Decompose Marathi full name
  let motherName = (p.motherName && p.motherName !== '-' && p.motherName !== '---') ? p.motherName.trim() : '';
  if (!motherName && masterStudent?.motherName) {
    motherName = masterStudent.motherName.trim();
  }
  if (!motherName && studentName) {
    const decomp = decomposeMarathiFullName(studentName);
    if (decomp.motherName) {
      motherName = decomp.motherName.trim();
    }
  }
  if (!motherName) {
    motherName = '-';
  }

  // Aadhaar Number resolution:
  // In Ashram school data, Aadhaar is stored in aadharNumber, or apaarId, or saralId (12 digits)
  let rawAadhar = p.aadharNumber || 
                  p.aadhar || 
                  p.apaarId || 
                  masterStudent?.apaarId || 
                  (p.saralId && p.saralId.length === 12 ? p.saralId : '') || 
                  (masterStudent?.saralId && masterStudent.saralId.length === 12 ? masterStudent.saralId : '') || 
                  '';
  const aadhar = formatAadharGrouped(rawAadhar);

  // Saral ID
  const saralId = p.penNumber || p.saralId || masterStudent?.saralId || masterStudent?.penNumber || '-';

  // School, UDISE, Taluka
  const schoolName = p.schoolName || DEFAULT_SCHOOL_MR;
  const uDise = p.uDise || DEFAULT_UDISE;
  const taluka = p.taluka || DEFAULT_TALUKA;

  // Gender
  const isGirl = p.gender === 'Female' || 
                 p.gender === 'मुली' || 
                 p.gender === 'female' || 
                 p.gender === 'F' || 
                 masterStudent?.gender === 'Female' ||
                 (defaultCategoryLabel && defaultCategoryLabel.includes('मुली'));
  const gender = isGirl ? 'Female' : 'Male';

  // Age Category (वयोगट)
  const ageCategoryLabel = getPlayerAgeCategoryLabel(
    { ...p, dob: rawDob || p.dob, std: stdNum || p.std, gender },
    gender
  );

  // Sport
  const sportOrEvent = p.sportOrEvent || defaultSportMr || '-';

  return {
    studentName,
    std,
    grNo,
    dob,
    motherName,
    aadhar,
    saralId,
    schoolName,
    uDise,
    taluka,
    ageCategoryLabel,
    sportOrEvent,
    gender
  };
}
