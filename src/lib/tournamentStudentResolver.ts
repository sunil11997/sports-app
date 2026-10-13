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
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
      }
      return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
    }
    return clean;
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
      }
      return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
    }
    return clean.replace(/\//g, '.');
  }
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
      }
      return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
    }
  }
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
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

export type UnderAgeType = 'U14' | 'U17' | 'U19';

export interface UnderCategoryInfo {
  ageType: UnderAgeType;
  gender: 'Male' | 'Female';
  key: 'u14_girls' | 'u14_boys' | 'u17_girls' | 'u17_boys' | 'u19_girls' | 'u19_boys';
  rosterCategoryKey: 'Girls U14' | 'Boys U14' | 'Girls U17' | 'Boys U17' | 'Girls Senior' | 'Boys Senior';
  marathiLabel: string;
  shortLabel: string;
}

/**
 * Searches WAGHAMBA_STUDENTS_DATA using multi-layer fuzzy matching
 */
export function findStudentInMasterRegistry(p: any): SchoolStudent | undefined {
  if (!p) return undefined;

  const id = (p.id || '').trim();
  const rawName = (p.name || p.studentName || '').trim().toLowerCase();
  const marathiName = (p.nameMarathi || p.studentName || '').trim();
  const gr = String(p.grNo || p.generalRegisterNumber || p.serialNumber || p.rollNo || '').trim();
  const std = String(p.std || '').replace(/\D/g, '').trim();

  // 1. Direct ID match
  if (id) {
    const byId = WAGHAMBA_STUDENTS_DATA.find(s => s.id === id);
    if (byId) return byId;
  }

  // 2. Parse std & roll from synthetic ID (e.g. user_std8_05 -> std 8, roll 5)
  if (id && id.includes('std')) {
    const match = id.match(/std(\d+)[-_](\d+)/i);
    if (match) {
      const parsedStd = match[1];
      const parsedRoll = String(parseInt(match[2], 10));
      const byParsed = WAGHAMBA_STUDENTS_DATA.find(s => s.std === parsedStd && (s.rollNo === parsedRoll || s.serialNumber === parsedRoll));
      if (byParsed) return byParsed;
    }
  }

  // 3. Exact Roll No + Standard match
  if (gr && std) {
    const byRollStd = WAGHAMBA_STUDENTS_DATA.find(s => (s.rollNo === gr || s.serialNumber === gr) && s.std === std);
    if (byRollStd) return byRollStd;
  }

  // 4. Exact Marathi Name match
  if (marathiName) {
    const exactMr = WAGHAMBA_STUDENTS_DATA.find(s => s.nameMarathi === marathiName);
    if (exactMr) return exactMr;

    // Fuzzy token match in Marathi
    const mrTokens = marathiName.split(/\s+/).filter((t: string) => t.length > 2);
    if (mrTokens.length >= 2) {
      const byTokens = WAGHAMBA_STUDENTS_DATA.find(s => {
        if (!s.nameMarathi) return false;
        const matches = mrTokens.filter((t: string) => s.nameMarathi.includes(t));
        return matches.length >= 2;
      });
      if (byTokens) return byTokens;
    }
  }

  // 5. English Name match
  if (rawName) {
    const exactEn = WAGHAMBA_STUDENTS_DATA.find(s => s.name.toLowerCase() === rawName);
    if (exactEn) return exactEn;

    // Fuzzy English token match
    const enTokens = rawName.split(/\s+/).filter((t: string) => t.length > 2);
    if (enTokens.length >= 2) {
      const byEnTokens = WAGHAMBA_STUDENTS_DATA.find(s => {
        const sEn = s.name.toLowerCase();
        const matches = enTokens.filter((t: string) => sEn.includes(t));
        return matches.length >= 2;
      });
      if (byEnTokens) return byEnTokens;
    }
  }

  // 6. Roll No match if unique
  if (gr) {
    const rollMatches = WAGHAMBA_STUDENTS_DATA.filter(s => s.rollNo === gr || s.serialNumber === gr);
    if (rollMatches.length === 1) return rollMatches[0];
  }

  return undefined;
}

/**
 * Canonically determines a student's official Under (वयोगट) Category
 * (१४ वर्षाखालील / १७ वर्षाखालील / १९ वर्षाखालील) with zero cross-contamination.
 */
export function getStudentUnderCategory(player: any, genderFallback?: string): UnderCategoryInfo {
  const masterStudent = findStudentInMasterRegistry(player);
  
  // Resolve Gender
  const isGirl = player.gender === 'Female' || 
                 player.gender === 'मुली' || 
                 player.gender === 'female' || 
                 player.gender === 'F' || 
                 genderFallback === 'Female' || 
                 genderFallback === 'मुली' ||
                 masterStudent?.gender === 'Female';
  const gender: 'Male' | 'Female' = isGirl ? 'Female' : 'Male';
  const suffix = isGirl ? 'मुली' : 'मुले';

  // 1. If explicit category already marked on player
  const explicit = String(player.ageCategoryLabel || player.categoryLabel || '').trim();
  if (explicit) {
    if (explicit.includes('14') || explicit.includes('१४') || explicit.toLowerCase().includes('u14')) {
      return {
        ageType: 'U14',
        gender,
        key: isGirl ? 'u14_girls' : 'u14_boys',
        rosterCategoryKey: isGirl ? 'Girls U14' : 'Boys U14',
        marathiLabel: `१४ वर्षाखालील ${suffix}`,
        shortLabel: '१४ वर्षाखालील'
      };
    }
    if (explicit.includes('17') || explicit.includes('१७') || explicit.toLowerCase().includes('u17')) {
      return {
        ageType: 'U17',
        gender,
        key: isGirl ? 'u17_girls' : 'u17_boys',
        rosterCategoryKey: isGirl ? 'Girls U17' : 'Boys U17',
        marathiLabel: `१७ वर्षाखालील ${suffix}`,
        shortLabel: '१७ वर्षाखालील'
      };
    }
    if (explicit.includes('19') || explicit.includes('१९') || explicit.toLowerCase().includes('u19') || explicit.toLowerCase().includes('senior')) {
      return {
        ageType: 'U19',
        gender,
        key: isGirl ? 'u19_girls' : 'u19_boys',
        rosterCategoryKey: isGirl ? 'Girls Senior' : 'Boys Senior',
        marathiLabel: `१९ वर्षाखालील ${suffix}`,
        shortLabel: '१९ वर्षाखालील'
      };
    }
  }

  // 2. Check DOB (from player or master registry)
  const dobCandidate = player.dob || masterStudent?.dob;
  if (dobCandidate && dobCandidate !== '-' && dobCandidate !== '---') {
    const ageVal = getAgeValidation(dobCandidate, 2026);
    if (ageVal) {
      if (ageVal.eligibilityType === 'U14' || (ageVal.ageYears > 0 && ageVal.ageYears < 14)) {
        return {
          ageType: 'U14',
          gender,
          key: isGirl ? 'u14_girls' : 'u14_boys',
          rosterCategoryKey: isGirl ? 'Girls U14' : 'Boys U14',
          marathiLabel: `१४ वर्षाखालील ${suffix}`,
          shortLabel: '१४ वर्षाखालील'
        };
      }
      if (ageVal.eligibilityType === 'U17' || (ageVal.ageYears >= 14 && ageVal.ageYears < 17)) {
        return {
          ageType: 'U17',
          gender,
          key: isGirl ? 'u17_girls' : 'u17_boys',
          rosterCategoryKey: isGirl ? 'Girls U17' : 'Boys U17',
          marathiLabel: `१७ वर्षाखालील ${suffix}`,
          shortLabel: '१७ वर्षाखालील'
        };
      }
      if (ageVal.eligibilityType === 'U19' || ageVal.ageYears >= 17) {
        return {
          ageType: 'U19',
          gender,
          key: isGirl ? 'u19_girls' : 'u19_boys',
          rosterCategoryKey: isGirl ? 'Girls Senior' : 'Boys Senior',
          marathiLabel: `१९ वर्षाखालील ${suffix}`,
          shortLabel: '१९ वर्षाखालील'
        };
      }
    }
  }

  // 3. Fallback based on Standard (इयत्ता) in Maharashtra school sports:
  // Std 1 to 7 = Under 14
  // Std 8 to 10 = Under 17
  // Std 11 to 12 = Under 19
  const rawStd = String(player.std || masterStudent?.std || '');
  const stdNum = parseInt(rawStd.replace(/\D/g, ''), 10);
  if (stdNum > 0) {
    if (stdNum <= 7) {
      return {
        ageType: 'U14',
        gender,
        key: isGirl ? 'u14_girls' : 'u14_boys',
        rosterCategoryKey: isGirl ? 'Girls U14' : 'Boys U14',
        marathiLabel: `१४ वर्षाखालील ${suffix}`,
        shortLabel: '१४ वर्षाखालील'
      };
    }
    if (stdNum <= 10) {
      return {
        ageType: 'U17',
        gender,
        key: isGirl ? 'u17_girls' : 'u17_boys',
        rosterCategoryKey: isGirl ? 'Girls U17' : 'Boys U17',
        marathiLabel: `१७ वर्षाखालील ${suffix}`,
        shortLabel: '१७ वर्षाखालील'
      };
    }
    return {
      ageType: 'U19',
      gender,
      key: isGirl ? 'u19_girls' : 'u19_boys',
      rosterCategoryKey: isGirl ? 'Girls Senior' : 'Boys Senior',
      marathiLabel: `१९ वर्षाखालील ${suffix}`,
      shortLabel: '१९ वर्षाखालील'
    };
  }

  // 4. Fallback based on player's age property
  const ageNum = parseInt(String(player.age || masterStudent?.age || '').replace(/\D/g, ''), 10);
  if (ageNum > 0) {
    if (ageNum < 14) {
      return {
        ageType: 'U14',
        gender,
        key: isGirl ? 'u14_girls' : 'u14_boys',
        rosterCategoryKey: isGirl ? 'Girls U14' : 'Boys U14',
        marathiLabel: `१४ वर्षाखालील ${suffix}`,
        shortLabel: '१४ वर्षाखालील'
      };
    }
    if (ageNum < 17) {
      return {
        ageType: 'U17',
        gender,
        key: isGirl ? 'u17_girls' : 'u17_boys',
        rosterCategoryKey: isGirl ? 'Girls U17' : 'Boys U17',
        marathiLabel: `१७ वर्षाखालील ${suffix}`,
        shortLabel: '१७ वर्षाखालील'
      };
    }
    return {
      ageType: 'U19',
      gender,
      key: isGirl ? 'u19_girls' : 'u19_boys',
      rosterCategoryKey: isGirl ? 'Girls Senior' : 'Boys Senior',
      marathiLabel: `१९ वर्षाखालील ${suffix}`,
      shortLabel: '१९ वर्षाखालील'
    };
  }

  // Default: middle school U14
  return {
    ageType: 'U14',
    gender,
    key: isGirl ? 'u14_girls' : 'u14_boys',
    rosterCategoryKey: isGirl ? 'Girls U14' : 'Boys U14',
    marathiLabel: `१४ वर्षाखालील ${suffix}`,
    shortLabel: '१४ वर्षाखालील'
  };
}

/**
 * Accurately determines the official Marathi Age Group (वयोगट)
 * Strictly returns '१४ वर्षाखालील मुले/मुली', '१७ वर्षाखालील मुले/मुली', or '१९ वर्षाखालील मुले/मुली'
 */
export function getPlayerAgeCategoryLabel(player: any, genderFallback?: string): string {
  return getStudentUnderCategory(player, genderFallback).marathiLabel;
}

/**
 * Resolves full student data ensuring:
 * - grNo is populated (from generalRegisterNumber, grNo, serialNumber, rollNo, or master registry)
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
                    p.studentName?.trim() ||
                    masterStudent?.nameMarathi?.trim() || 
                    p.name || 
                    masterStudent?.name || 
                    '';
  studentName = correctMarathiFullName(studentName);

  // Class / Std
  const rawStd = p.std || masterStudent?.std || '';
  const stdNum = String(rawStd).replace(/\D/g, '');
  const std = stdNum ? `इ. ${stdNum} वी` : (rawStd || '-');

  // G.R. Number resolution (जनरल रजिस्टर नं.)
  const cleanGrCandidate = (val: any): string => {
    if (!val) return '';
    const str = String(val).trim();
    if (!str || str === '-' || str === '---' || str === 'None' || str === 'null' || str === 'undefined') return '';
    if (str.includes('@') || str.includes('.com') || str.includes('mailto:')) return '';
    return str;
  };

  let grNo = cleanGrCandidate(p.generalRegisterNumber) ||
             cleanGrCandidate(p.grNo) ||
             cleanGrCandidate(p.serialNumber) ||
             cleanGrCandidate(p.rollNo) ||
             cleanGrCandidate(masterStudent?.rollNo) ||
             cleanGrCandidate(masterStudent?.serialNumber) ||
             cleanGrCandidate(masterStudent?.saralId);

  // If still not resolved, try parsing roll from ID (e.g. wgb-std8-12 -> 12)
  if (!grNo && p.id) {
    const idMatch = String(p.id).match(/std\d+[-_](\d+)/i) || String(p.id).match(/_(\d+)$/);
    if (idMatch && idMatch[1]) {
      const num = parseInt(idMatch[1], 10);
      if (!isNaN(num) && num > 0) {
        grNo = String(num);
      }
    }
  }

  if (!grNo) {
    grNo = '-';
  }

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
  const underInfo = getStudentUnderCategory(
    { ...p, dob: rawDob || p.dob, std: stdNum || p.std, gender },
    gender
  );
  const ageCategoryLabel = (defaultCategoryLabel && (defaultCategoryLabel.includes('१४') || defaultCategoryLabel.includes('१७') || defaultCategoryLabel.includes('१९')))
    ? defaultCategoryLabel
    : underInfo.marathiLabel;

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
