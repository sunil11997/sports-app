import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COMMON_MARATHI_NAMES: Record<string, string> = {
  // Common First Names
  rahul: 'राहुल', ramesh: 'रमेश', suresh: 'सुरेश', ganesh: 'गणेश', mahesh: 'महेश',
  dinesh: 'दिनेश', vijay: 'विजय', ajay: 'अजय', amit: 'अमित', amol: 'अमोल',
  aniket: 'अनिकेत', akshay: 'अक्षय', aditya: 'आदित्य', abhishek: 'अभिषेक', rohan: 'रोहन',
  sachin: 'सचिन', sunil: 'सुनील', anil: 'अनिल', santosh: 'संतोष', samir: 'समीर',
  sameer: 'समीर', nitin: 'नितीन', pravin: 'प्रवीण', pradeep: 'प्रदीप', prashant: 'प्रशांत',
  pranam: 'प्रणाम', priya: 'प्रिया', pooja: 'पूजा', puja: 'पूजा', sneha: 'स्नेहा',
  swati: 'स्वाती', neha: 'नेहा', nisha: 'निशा', kavita: 'कविता', sunita: 'सुनिता',
  anita: 'अनिता', sangita: 'संगीता', sangeta: 'संगीता', aarti: 'आरती', arti: 'आरती',
  shreya: 'श्रेया', sakshi: 'साक्षी', vaishnavi: 'वैष्णवी', tanvi: 'तन्वी', isha: 'ईशा',
  om: 'ओम', aarav: 'आरव', ananya: 'अनन्या', aryan: 'आर्यन', shivam: 'शिवम',
  krishna: 'कृष्णा', ram: 'राम', radha: 'राधा', gauri: 'गौरी', tanmay: 'तन्मय',
  rushikesh: 'ऋषिकेश', hrishikesh: 'ऋषिकेश', sanket: 'संकेत', prathamesh: 'प्रथमेश',
  swapnil: 'स्वप्निल', omkar: 'ओंकार', sourabh: 'सौरभ', saurabh: 'सौरभ', shubham: 'शुभम',
  utkarsh: 'उत्कर्ष', chinmay: 'चिन्मय', tushar: 'तुषार', kiran: 'किरण', chetan: 'चेतन',
  shrikant: 'श्रीकांत', shripad: 'श्रीपाद', harish: 'हरीश', rajesh: 'राजेश', yogesh: 'योगेश',

  // Common Surnames
  patil: 'पाटील', pawar: 'पवार', shinde: 'शिंदे', deshmukh: 'देशमुख', kulkarni: 'कुलकर्णी',
  jadhav: 'जाधव', gaikwad: 'गायकवाड', chavan: 'चव्हाण', joshi: 'जोशी', kadam: 'कदम',
  more: 'मोरे', kale: 'काळे', thorat: 'थोरात', sawant: 'सावंत', bhosale: 'भोसले',
  salunkhe: 'साळुंखे', jagtap: 'जगताप', ghurde: 'घुरडे', wagh: 'वाघ', kamble: 'कांबळे',
  mane: 'माने', nikam: 'निकम', ingale: 'इंगळे', ingole: 'इंगोळे', mankar: 'मानकर',
  kharat: 'खरात', zope: 'झोपे', gore: 'गोरे', auti: 'औटी', shelke: 'शेळके',
  sutar: 'सुतार', sonawane: 'सोनवणे', landge: 'लांडगे', ghode: 'घोडे'
};

function transliterateWord(word: string): string {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return '';
  if (COMMON_MARATHI_NAMES[cleanWord]) {
    return COMMON_MARATHI_NAMES[cleanWord];
  }

  const commonPairs: Array<[string, string]> = [
    ['sh', 'श'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'], ['dh', 'ध'], ['th', 'थ'], ['ph', 'फ'], ['bh', 'भ'], ['jh', 'झ'], ['ny', 'ञ'], ['rr', 'ऱ'], ['ll', 'ळ'], ['tt', 'ट'], ['dd', 'ड'], ['nn', 'ण'], ['aa', 'ा'], ['ee', 'ी'], ['ii', 'ी'], ['oo', 'ू'], ['ou', 'ौ'], ['au', 'ौ']
  ];

  const singleMap: Record<string, string> = {
    a: 'अ', b: 'ब', c: 'क', d: 'ड', e: 'ए', f: 'फ', g: 'ग', h: 'ह', i: 'इ', j: 'ज', k: 'क', l: 'ल', m: 'म', n: 'न', o: 'ओ', p: 'प', r: 'र', s: 'स', t: 'ट', u: 'उ', v: 'व', w: 'व', x: 'क्स', y: 'य', z: 'झ'
  };

  let result = '';
  let index = 0;

  while (index < cleanWord.length) {
    let matched = false;

    for (const [pair, replacement] of commonPairs) {
      if (cleanWord.startsWith(pair, index)) {
        result += replacement;
        index += pair.length;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const char = cleanWord[index];

    if (char === 'a' && index > 0) {
      result += '';
      index += 1;
      continue;
    }

    if (char === 'i' && index > 0) {
      result += 'ि';
      index += 1;
      continue;
    }

    if (char === 'u' && index > 0) {
      result += 'ु';
      index += 1;
      continue;
    }

    if (char === 'e' && index > 0) {
      result += 'े';
      index += 1;
      continue;
    }

    if (char === 'o' && index > 0) {
      result += 'ो';
      index += 1;
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

  return result;
}

export function transliterateEnglishToMarathi(name: string | undefined | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const words = trimmed.split(/\s+/);
  return words.map(w => transliterateWord(w)).join(' ').trim();
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

export function parseNumericValue(val: any): number {
  if (val === null || val === undefined) return 0;
  let str = String(val).trim();
  if (!str) return 0;

  // Convert Devanagari numerals (०१२३४५६७८९) to ASCII (0123456789)
  const devanagariMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  str = str.replace(/[०-९]/g, d => devanagariMap[d] || d);

  // Extract numeric match (optional sign, digits, optional decimal)
  const match = str.match(/[-+]?\d*\.?\d+/);
  if (!match) return 0;
  
  const num = parseFloat(match[0]);
  return isNaN(num) ? 0 : num;
}

export function calculateBMI(height?: string | number | null, weight?: string | number | null, existingBmi?: string | number | null): string {
  const hNum = parseNumericValue(height);
  const wNum = parseNumericValue(weight);

  if (hNum > 0 && wNum > 0) {
    let hMeters = hNum;
    if (hNum > 3.0) {
      // Height is given in centimeters
      hMeters = hNum / 100;
    }
    if (hMeters > 0.4 && hMeters < 3.0 && wNum > 2 && wNum < 300) {
      const calculated = wNum / (hMeters * hMeters);
      if (calculated >= 5 && calculated <= 100) {
        return calculated.toFixed(1);
      }
    }
  }

  const existingNum = parseNumericValue(existingBmi);
  if (existingNum >= 5 && existingNum <= 100) {
    return existingNum.toFixed(1);
  }

  return '---';
}

export function getBmiCategory(bmiVal: string | number | null): { en: string; mr: string; color: string } {
  const num = parseNumericValue(bmiVal);
  if (num === 0 || isNaN(num)) return { en: 'Unknown', mr: 'अज्ञात', color: 'text-slate-500' };
  if (num < 18.5) return { en: 'Underweight', mr: 'कमी वजन', color: 'text-amber-600' };
  if (num < 25) return { en: 'Normal Weight', mr: 'योग्य वजन', color: 'text-emerald-600' };
  if (num < 30) return { en: 'Overweight', mr: 'जास्त वजन', color: 'text-amber-700' };
  return { en: 'Obese', mr: 'स्थूल / अतिवजन', color: 'text-rose-600' };
}

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';

export function getOfficialSchoolName(schoolProfile?: any, isMarathi: boolean = true): string {
  if (schoolProfile?.schoolName && schoolProfile.schoolName.trim()) {
    return schoolProfile.schoolName.trim();
  }
  return isMarathi 
    ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
    : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
}

export function getTeacherName(schoolProfile?: any): string {
  if (schoolProfile?.teacherName && schoolProfile.teacherName.trim()) {
    return schoolProfile.teacherName.trim();
  }
  return 'सुनील देशमुख (B.P.Ed)';
}

export function getPrintSignatureBlockHtml(schoolProfile?: any, isMarathi: boolean = true): string {
  const teacherName = getTeacherName(schoolProfile);
  const schoolName = getOfficialSchoolName(schoolProfile, isMarathi);
  const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;
  
  return `
    <div class="no-break-sign" style="margin-top: 35px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif; font-size: 11px; padding: 10px 20px; border-top: 1px dashed #cbd5e1;">
      <div style="text-align: center;">
        <img src="${signatureSrc}" alt="Teacher Signature" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 4px; display: block; margin-left: auto; margin-right: auto;" />
        <div style="font-weight: 900; text-transform: uppercase; color: #0f172a;">${isMarathi ? 'क्रीडा शिक्षक स्वाक्षरी' : 'Sports Teacher Signature'}</div>
        <div style="font-size: 10px; color: #475569; font-weight: 700; margin-top: 2px;">(${teacherName})</div>
      </div>
      <div style="text-align: center;">
        <div style="border: 2px dashed #94a3b8; border-radius: 8px; width: 80px; height: 42px; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px auto; font-size: 10px; color: #94a3b8; font-weight: 800;">${isMarathi ? 'शिक्का' : 'STAMP'}</div>
        <div style="font-weight: 900; text-transform: uppercase; color: #0f172a;">${isMarathi ? 'मुख्याध्यापक स्वाक्षरी' : 'Principal Signature'}</div>
        <div style="font-size: 10px; color: #475569; font-weight: 700; margin-top: 2px;">(${schoolName})</div>
      </div>
    </div>
  `;
}



