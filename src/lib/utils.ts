import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transliterateEnglishToMarathi(name: string | undefined | null): string {
  if (!name) return '';

  const normalized = name.trim().toLowerCase();
  if (!normalized) return '';

  const commonPairs: Array<[string, string]> = [
    ['sh', 'श'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'], ['dh', 'ध'], ['th', 'थ'], ['ph', 'फ'], ['bh', 'भ'], ['jh', 'झ'], ['ny', 'ञ'], ['rr', 'ऱ'], ['ll', 'ळ'], ['tt', 'ट'], ['dd', 'ड'], ['nn', 'ण'], ['aa', 'ा'], ['ee', 'ी'], ['ii', 'ी'], ['oo', 'ू'], ['ou', 'ौ'], ['au', 'ौ']
  ];

  const singleMap: Record<string, string> = {
    a: 'अ', b: 'ब', c: 'क', d: 'ड', e: 'ए', f: 'फ', g: 'ग', h: 'ह', i: 'इ', j: 'ज', k: 'क', l: 'ल', m: 'म', n: 'न', o: 'ओ', p: 'प', r: 'र', s: 'स', t: ' ट', u: 'उ', v: 'व', w: 'व', x: 'क्स', y: 'य', z: 'झ'
  };

  let result = '';
  let index = 0;

  while (index < normalized.length) {
    let matched = false;

    for (const [pair, replacement] of commonPairs) {
      if (normalized.startsWith(pair, index)) {
        result += replacement;
        index += pair.length;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (char === 'a' && index > 0 && normalized[index - 1] !== ' ') {
      result += '';
      index += 1;
      continue;
    }

    if (char === 'i' && index > 0 && normalized[index - 1] !== ' ') {
      result += 'ि';
      index += 1;
      continue;
    }

    if (char === 'u' && index > 0 && normalized[index - 1] !== ' ') {
      result += 'ु';
      index += 1;
      continue;
    }

    if (char === 'e' && index > 0 && normalized[index - 1] !== ' ') {
      result += 'े';
      index += 1;
      continue;
    }

    if (char === 'o' && index > 0 && normalized[index - 1] !== ' ') {
      result += 'ो';
      index += 1;
      continue;
    }

    if (char === ' ' || char === '-' || char === '_') {
      result += ' ';
      index += 1;
      continue;
    }

    if (char && nextChar && `${char}${nextChar}` in singleMap) {
      result += singleMap[`${char}${nextChar}`] || '';
      index += 2;
      continue;
    }

    if (char && char in singleMap) {
      result += singleMap[char] || '';
      index += 1;
      continue;
    }

    result += char;
    index += 1;
  }

  return result.replace(/\s+/g, ' ').trim();
}

export function getDisplayNameForLocale(name: string | undefined | null, nameMarathi: string | undefined | null, locale: 'en' | 'mr' = 'mr') {
  if (locale === 'mr') {
    return (nameMarathi || transliterateEnglishToMarathi(name || '') || name || '').trim();
  }
  return (name || '').trim();
}

/**
 * shareToWhatsApp - Institutional Reporting Engine
 * Constructs a formatted Marathi message for parents and students.
 * Fixed: Uses high-resilience link triggering to prevent "wa.me refused to connect" errors.
 */
export function shareToWhatsApp(options: {
  phone?: string;
  schoolName: string;
  teacherName: string;
  studentName: string;
  std: string;
  age: string | number;
  dob: string;
  bmi: string;
  height: string;
  weight: string;
  reportType: string;
  reportData: string;
}) {
  const { phone, schoolName, teacherName, studentName, std, age, dob, bmi, height, weight, reportType, reportData } = options;

  const message = `*${schoolName}*\n*प्रगती अहवाल (Progress Report)*\n\n*शिक्षक:* ${teacherName}\n------------------------------\n*विद्यार्थ्याची माहिती:*\n*नाव:* ${studentName}\n*इयत्ता:* ${std} वी\n*वय:* ${age} वर्षे | *जन्म तारीख:* ${dob}\n*उंची:* ${height} cm | *वजन:* ${weight} kg\n*BMI:* ${bmi}\n\n*नवीन अपडेट - ${reportType}:*\n${reportData}\n------------------------------\nहा अहवाल 'वाघंबा स्पोर्ट्स हब' मधून आपोआप पाठवण्यात आला आहे.`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;
  
  if (typeof window !== 'undefined') {
    // High-resilience navigation: Create a hidden link and click it to bypass CSP/iframe restrictions
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export interface AgeValidation {
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  ageString: string;
  category: string;
  eligible: boolean;
  statusText: string;
}

export function getAgeValidation(dobString: string | undefined | null): AgeValidation | null {
  if (!dobString) return null;
  
  let birthYear: number;
  let birthMonth: number;
  let birthDay: number;

  const match = dobString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    birthYear = parseInt(match[1], 10);
    birthMonth = parseInt(match[2], 10) - 1; // 0-indexed
    birthDay = parseInt(match[3], 10);
  } else {
    const dobDate = new Date(dobString);
    if (isNaN(dobDate.getTime())) return null;
    birthYear = dobDate.getFullYear();
    birthMonth = dobDate.getMonth();
    birthDay = dobDate.getDate();
  }

  // Target Reference Date: 31 December 2026
  const refYear = 2026;
  const refMonth = 11; // 0-indexed December
  const refDay = 31;

  let years = refYear - birthYear;
  let months = refMonth - birthMonth;
  let days = refDay - birthDay;

  if (days < 0) {
    // Number of days in the month prior to December 2026 (November has 30 days)
    const prevMonthDays = new Date(refYear, refMonth, 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const ageString = `${years} Years, ${months} Months, ${days} Days`;

  // Age Categories based on DOB ranges:
  // - Under 14 (U14): DOB from 01-01-2013 to 31-12-2015 (inclusive)
  // - Under 17 (U17): DOB from 01-01-2010 to 31-12-2012 (inclusive)
  // - Under 19 (U19): DOB from 01-01-2008 to 31-12-2009 (inclusive)
  
  // Compare date components directly to avoid timezone shift errors
  // We construct a number YYYYMMDD for comparison:
  const dobNum = birthYear * 10000 + (birthMonth + 1) * 100 + birthDay;
  
  let category = "";
  let eligible = false;
  let statusText = "";

  if (dobNum >= 20130101 && dobNum <= 20151231) {
    category = "Under 14 (U14)";
    eligible = true;
    statusText = "Eligible";
  } else if (dobNum >= 20100101 && dobNum <= 20121231) {
    category = "Under 17 (U17)";
    eligible = true;
    statusText = "Eligible";
  } else if (dobNum >= 20080101 && dobNum <= 20091231) {
    category = "Under 19 (U19)";
    eligible = true;
    statusText = "Eligible";
  } else {
    category = "None";
    eligible = false;
    statusText = "Not eligible for available age categories.";
  }

  return {
    ageYears: years,
    ageMonths: months,
    ageDays: days,
    ageString,
    category,
    eligible,
    statusText
  };
}

export function getLocalizedAgeCategory(category: string, isMarathi: boolean): string {
  if (!category) return "";
  if (isMarathi) {
    if (category.includes("Under 14")) return "१४ वर्षांखालील (U14)";
    if (category.includes("Under 17")) return "१७ वर्षांखालील (U17)";
    if (category.includes("Under 19")) return "१९ वर्षांखालील (U19)";
    if (category === "None") return "पात्र नाही";
  }
  return category;
}

export interface ParsedMedicalLog {
  location: string;
  diagnosis: string;
  severity: string;
  daysOff: string;
  expectedReturn: string;
  protocol: string;
  medicine: string;
  remarks: string;
}

export function parseMedicalLog(fullLog: string): ParsedMedicalLog {
  if (!fullLog) {
    return {
      location: 'General',
      diagnosis: 'Medical Audit Log',
      severity: 'Minor',
      daysOff: '5 Days',
      expectedReturn: '-',
      protocol: 'Standard physical rest',
      medicine: 'First Aid / Rest',
      remarks: 'None recorded'
    };
  }

  const getField = (key: string) => {
    const match = fullLog.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const location = getField('Location') || 'Body Region';
  const diagnosis = getField('Diagnosis') || 'Injury Record';
  const severity = getField('Severity') || (fullLog.toLowerCase().includes('critical') || fullLog.toLowerCase().includes('severe') ? 'Critical' : 'Minor');
  const daysOff = getField('Recovery') || '7 Days';
  const expectedReturn = getField('Est. Return') || '-';
  const protocol = getField('PROTOCOL') || '';
  const medicine = getField('MEDICINE/FIRST-AID') || getField('MEDICINE') || '';
  
  let remarks = getField('COACH REMARKS') || getField('REMARKS') || '';
  if (!remarks && !fullLog.includes('[INSTITUTIONAL MEDICAL AUDIT]')) {
    remarks = fullLog;
  }

  return {
    location,
    diagnosis,
    severity,
    daysOff,
    expectedReturn,
    protocol: protocol || 'Standard recovery protocol',
    medicine: medicine || 'First aid applied',
    remarks: remarks || 'No additional remarks'
  };
}

export function calculateBMI(height?: string | number | null, weight?: string | number | null, existingBmi?: string | number | null): string {
  if (existingBmi && existingBmi !== '---' && existingBmi !== '-' && !isNaN(Number(existingBmi)) && Number(existingBmi) > 0) {
    return Number(existingBmi).toFixed(1);
  }
  const h = parseFloat(String(height || 0)) / 100;
  const w = parseFloat(String(weight || 0));
  if (h > 0 && w > 0) {
    return (w / (h * h)).toFixed(1);
  }
  return '---';
}

export function getBmiCategory(bmiVal: string | number | null): { en: string; mr: string; color: string } {
  const num = parseFloat(String(bmiVal || 0));
  if (num === 0 || isNaN(num)) return { en: 'Unknown', mr: 'अज्ञात', color: 'text-slate-500' };
  if (num < 18.5) return { en: 'Underweight', mr: 'कमी वजन', color: 'text-amber-600' };
  if (num < 25) return { en: 'Normal Weight', mr: 'योग्य वजन', color: 'text-emerald-600' };
  if (num < 30) return { en: 'Overweight', mr: 'जास्त वजन', color: 'text-amber-700' };
  return { en: 'Obese', mr: 'स्थूल / अतिवजन', color: 'text-rose-600' };
}


