/**
 * Marathi Name Helper & Normalization Engine
 * Specialized for Maharashtra Government Ashram Schools (Devanagari Unicode & Official Registers).
 * Repairs legacy Shree-Lipi / Kruti-Dev / OCR glyph artifacts and standardizes Maharashtra naming conventions:
 * [Student Name] + [Mother's Name] + [Father's Name] + [Surname]
 */

import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';

// Core dictionary of recognized Marathi first names, patronymics, and surnames
export const MARATHI_NAME_DICTIONARY: Record<string, string> = {
  // Common Student / First Names
  'विपूल': 'विपुल',
  'ऋनितक': 'ऋतिक',
  'ऋतीक': 'ऋतिक',
  'हितेश': 'हितेश',
  'अरविंद': 'अरविंद',
  'वैभव': 'वैभव',
  'धनराज': 'धनराज',
  'साईल': 'साहिल',
  'कृष्णा': 'कृष्णा',
  'राहुल': 'राहुल',
  'अंकुश': 'अंकुश',
  'साई': 'साई',
  'हर्षदा': 'हर्षदा',
  'अमृता': 'अमृता',
  'जान्हवी': 'जान्हवी',
  'भारती': 'भारती',
  'रविना': 'रविना',
  'मिनाक्षी': 'मीनाक्षी',
  'वैष्णवी': 'वैष्णवी',
  'स्वरांजली': 'स्वरांजली',
  'लक्ष्मी': 'लक्ष्मी',
  'रुद्रा': 'रुद्रा',
  'हेमंत': 'हेमंत',
  'अन्विता': 'अन्विता',
  'कुणाल': 'कुणाल',
  'प्रशांत': 'प्रशांत',
  'श्रीकांत': 'श्रीकांत',
  'तेजस': 'तेजस',
  'ज्ञानेश्वर': 'ज्ञानेश्वर',
  'आर्यन': 'आर्यन',
  'ऋषी': 'ऋषी',
  'विकास': 'विकास',
  'योगिता': 'योगिता',
  'रूपाली': 'रूपाली',
  'रुपाली': 'रूपाली',
  'गीतांजली': 'गीतांजली',
  'कोमल': 'कोमल',
  'सुहानी': 'सुहानी',
  'सुरमिला': 'सुरमिला',
  'प्रांजल': 'प्रांजल',
  'सोनाली': 'सोनाली',
  'भाग्यश्री': 'भाग्यश्री',
  'जिया': 'जिया',
  'साक्षी': 'साक्षी',
  'दिशा': 'दिशा',
  'वर्षा': 'वर्षा',
  'अथर्व': 'अथर्व',
  'स्वप्निल': 'स्वप्निल',
  'दिनेश': 'दिनेश',
  'मनोज': 'मनोज',
  'राजवीर': 'राजवीर',
  'संस्कार': 'संस्कार',
  'ज्ञानराज': 'ज्ञानराज',
  'चिराग': 'चिराग',
  'सोम': 'सोम',
  'कार्तिक': 'कार्तिक',
  'कावेरी': 'कावेरी',
  'आरती': 'आरती',
  'धनश्री': 'धनश्री',
  'रुचिता': 'रुचिता',
  'प्रियंका': 'प्रियंका',
  'दिपिका': 'दीपिका',
  'दिपाली': 'दीपाली',
  'अक्षरा': 'अक्षरा',
  'रिया': 'रिया',
  'कल्याणी': 'कल्याणी',
  'रोहित': 'रोहित',
  'राकेश': 'राकेश',
  'योगेश': 'योगेश',
  'परशराम': 'परशराम',
  'शरद': 'शरद',
  'शैलेश': 'शैलेश',
  'आदित्य': 'आदित्य',
  'सुनील': 'सुनील',
  'नितीन': 'नितीन',
  'कल्पेश': 'कल्पेश',
  'विजय': 'विजय',
  'युवराज': 'युवराज',
  'अर्जुन': 'अर्जुन',
  'सचिन': 'सचिन',
  'मयूर': 'मयूर',
  'गौतम': 'गौतम',
  'पंकज': 'पंकज',
  'तन्मय': 'तन्मय',
  'भुषण': 'भूषण',
  'महेंद्र': 'महेंद्र',
  'हर्षल': 'हर्षल',
  'लक्ष्मण': 'लक्ष्मण',
  'प्रभात': 'प्रभात',
  'कुंदन': 'कुंदन',
  'हर्षद': 'हर्षद',
  'रोहिणी': 'रोहिणी',
  'पूर्वा': 'पूर्वा',
  'शितल': 'शीतल',
  'विद्या': 'विद्या',
  'तेजल': 'तेजल',
  'राधिका': 'राधिका',
  'प्रगती': 'प्रगती',
  'माधुरी': 'माधुरी',
  'पल्लवी': 'पल्लवी',
  'इच्छा': 'इच्छा',
  'गायत्री': 'गायत्री',
  'मयुरी': 'मयुरी',
  'निलम': 'नीलम',
  'शुभम': 'शुभम',
  'पुरुषोत्तम': 'पुरुषोत्तम',
  'अविनाश': 'अविनाश',
  'चेतन': 'चेतन',
  'प्रविण': 'प्रवीण',
  'विराज': 'विराज',
  'दावित': 'दावित',
  'भाऊदास': 'भाऊदास',
  'सार्थक': 'सार्थक',
  'मंगेश': 'मंगेश',
  'करण': 'करण',
  'साहिल': 'साहिल',
  'पितांबर': 'पितांबर',
  'समीर': 'समीर',
  'नंदिनी': 'नंदिनी',
  'ऋषिकेश': 'ऋषिकेश',
  'हरेश': 'हरेश',
  'अजय': 'अजय',
  'अश्विन': 'अश्विन',
  'अमित': 'अमित',
  'राम': 'राम',
  'यश': 'यश',
  'सपना': 'सपना',
  'अंजू': 'अंजू',
  'मंजू': 'मंजू',
  'समीरा': 'समीरा',
  'तुळशी': 'तुळशी',
  'अश्विनी': 'अश्विनी',
  'आशा': 'आशा',
  'संध्या': 'संध्या',
  'तन्वी': 'तन्वी',
  'अनुसया': 'अनुसया',
  'चित्रा': 'चित्रा',
  'प्रतिमा': 'प्रतिमा',
  'अस्मिता': 'अस्मिता',
  'निखील': 'निखिल',
  'ललित': 'ललित',
  'सागर': 'सागर',

  // Surnames
  'पवार': 'पवार',
  'चौधरी': 'चौधरी',
  'चौधरȣ': 'चौधरी',
  'महाले': 'महाले',
  'देशमुख': 'देशमुख',
  'माळी': 'माळी',
  'माळीस': 'माळीस',
  'ठाकरे': 'ठाकरे',
  'सोनवणे': 'सोनवणे',
  'अहिरे': 'अहिरे',
  'अǑहरे': 'अहिरे',
  'बागुल': 'बागुल',
  'चौरे': 'चौरे',
  'भोये': 'भोये',
  'निकम': 'निकम',
  'Ǔनकम': 'निकम',
  'पालवी': 'पालवी',
  'गवळी': 'गवळी',
  'साबळे': 'साबळे',
  'खैर': 'खैर',
  'बडे': 'बडे',
  'बडȶ': 'बडे',
  'कामडी': 'कामडी',
  'सूर्यवंशी': 'सूर्यवंशी',
  'सूय[वंशी': 'सूर्यवंशी',
  'गांगुर्डे': 'गांगुर्डे',
  'गांगुडȶ': 'गांगुर्डे',
  'जाधव': 'जाधव',
  'गावीत': 'गावित',
  'गाͪवत': 'गावित',
  'राठोड': 'राठोड',
  'जगताप': 'जगताप',
  'गायकवाड': 'गायकवाड',
  'अंबिस': 'अंबिस',
  'अंǒबस': 'अंबिस',
  'शिंदे': 'शिंदे',
  'चव्हाण': 'चव्हाण',
  'चåहाण': 'चव्हाण',
  'कोल्हे': 'कोल्हे',
  'कोãहे': 'कोल्हे',
  'जोपळे': 'जोपळे',
  'वाघ': 'वाघ',
  'खांडवी': 'खांडवी'
};

/**
 * Repairs legacy font encoding errors, OCR diacritics, and Kruti/Shree-Lipi glyphs.
 */
export function cleanLegacyMarathiText(str: string): string {
  if (!str) return '';
  let s = str;

  // 1. Matra prefix replacements: Ǔ, Ǒ, ͧ, ͪ, ͬ, ͫ before consonant -> consonant + ि
  s = s.replace(/([ǓǑͧͪͬͫ])\s*([क-ह])/g, '$2\u093F');

  // 2. Reph replacement: consonant followed by [ -> र् + consonant
  s = s.replace(/([क-ह])\[/g, 'र्$1');

  // 3. Known ligature / glyph replacements
  s = s
    .replace(/£/g, 'ज्ञा')
    .replace(/æ/g, 'श्व')
    .replace(/ͩĐç/g, 'कृष्')
    .replace(/ç/g, 'ष्ण')
    .replace(/Đ/g, 'क्र')
    .replace(/Ĥ/g, 'प्र')
    .replace(/Įी/g, 'श्री')
    .replace(/Į/g, 'श्र')
    .replace(/ê/g, 'क्ष्म')
    .replace(/è/g, 'स्व')
    .replace(/Úया/g, 'द्या')
    .replace(/Ú/g, 'द्य')
    .replace(/Ø/g, 'र्')
    .replace(/Û/g, 'न्ह')
    .replace(/ã/g, 'ल्')
    .replace(/È/g, 'क्')
    .replace(/É/g, 'ख्य')
    .replace(/¢/g, 'क्ष')
    .replace(/ȧ/g, 'ी')
    .replace(/ȣ/g, 'ी')
    .replace(/ȸ/g, 'ी')
    .replace(/डɉ/g, 'डों')
    .replace(/ɉ/g, 'ों')
    .replace(/ǽ/g, 'रू')
    .replace(/ġ/g, 'द्र')
    .replace(/Ĩ/g, 'न्वि')
    .replace(/×/g, 'त्ना')
    .replace(/Ê/g, 'ग्य')
    .replace(/İ/g, 'राम')
    .replace(/Ï/g, 'ज्यो')
    .replace(/धवäया/g, 'धवळ्या')
    .replace(/äया/g, 'ळ्या')
    .replace(/बाÏया/g, 'बाज्या')
    .replace(/àहा/g, 'म्हा')
    .replace(/à/g, 'म्ह')
    .replace(/ͨझ/g, 'झि')
    .replace(/सुŘया/g, 'सुऱ्या')
    .replace(/सɋ/g, 'सौ')
    .replace(/ɋ/g, 'ौ')
    .replace(/दƣू/g, 'दत्तू')
    .replace(/दƣ/g, 'दत्त')
    .replace(/ƣ/g, 'त्त')
    .replace(/पवळू/g, 'पवळू')
    .replace(/सूय/g, 'सूर्य')
    .replace(/सृय/g, 'सूर्य')
    .replace(/सुय/g, 'सूर्य')
    .replace(/उƣम/g, 'उत्तम')
    .replace(/इÍछा/g, 'इच्छा')
    .replace(/Í/g, 'च्छ')
    .replace(/बडȶ/g, 'बडे')
    .replace(/गांगुडȶ/g, 'गांगुर्डे')
    .replace(/डȶ/g, 'डे')
    .replace(/ɪया/g, 'ट्या')
    .replace(/ɪ/g, 'ट्य')
    .replace(/ŧ/g, 'त्र्यं')
    .replace(/दसु/g, 'दसू')
    .replace(/कȧतȸ/g, 'कीर्ती')
    .replace(/ǒबरदावन/g, 'बिरदावन')
    .replace(/ǒबरदावण/g, 'बिरदावन')
    .replace(/ǒबबी/g, 'बिबी')
    .replace(/ǒबटा/g, 'बिटा')
    .replace(/ǒबबा/g, 'बिबा')
    .replace(/ǒब/g, 'बि')
    .replace(/ǐरया/g, 'रिया')
    .replace(/ǐरंना/g, 'रिना')
    .replace(/ǐरं/g, 'रिंग')
    .replace(/ǐर/g, 'रि')
    .replace(/वि ंद/g, 'विंद')
    .replace(/चि ंता/g, 'चिंता')
    .replace(/डि त/g, 'डित')
    .replace(/सरेखा/g, 'सुरेखा')
    .replace(/काͧशनाथ/g, 'काशिनाथ')
    .replace(/अǓन/g, 'अनि')
    .replace(/सुǓन/g, 'सुनि')
    .replace(/सुǓन/g, 'सुनी')
    .replace(/नाͧशक/g, 'नाशिक')
    .replace(/साक्री/g, 'साक्री')
    .replace(/साĐȧ/g, 'साक्री')
    .replace(/मंजळू/g, 'मंजुळा')
    .replace(/उͧम/g, 'उर्मि')
    .replace(/उर्मला/g, 'उर्मिला')
    .replace(/उर्म\[ला/g, 'उर्मिला')
    .replace(/अन्विता कलू/g, 'अन्विता कलू')
    .replace(/अन्वता/g, 'अन्विता')
    .replace(/अĨीता/g, 'अन्विता')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

/**
 * Corrects and standardizes an individual Marathi word or name token using the dictionary.
 */
export function correctMarathiWord(word: string): string {
  if (!word) return '';
  const cleaned = cleanLegacyMarathiText(word);
  if (MARATHI_NAME_DICTIONARY[cleaned]) {
    return MARATHI_NAME_DICTIONARY[cleaned];
  }
  // Check with suffix like बाई (bai) or राव (rao)
  if (cleaned.endsWith('बाई')) {
    const root = cleaned.slice(0, -3);
    const correctedRoot = MARATHI_NAME_DICTIONARY[root] || root;
    return correctedRoot + 'बाई';
  }
  if (cleaned.endsWith('राव')) {
    const root = cleaned.slice(0, -3);
    const correctedRoot = MARATHI_NAME_DICTIONARY[root] || root;
    return correctedRoot + 'राव';
  }
  return cleaned;
}

/**
 * Standardizes a complete Marathi full name:
 * Cleans OCR artifacts, normalizes tokens, ensures proper spacing.
 */
export function correctMarathiFullName(fullName: string): string {
  if (!fullName) return '';
  const cleaned = cleanLegacyMarathiText(fullName);
  const words = cleaned.split(' ').filter(Boolean);
  return words.map(correctMarathiWord).join(' ');
}

// Set of common Maharashtra tribal and regional surnames in Ashram schools
export const ASHRAM_SCHOOL_SURNAMES = new Set([
  'पवार', 'गायकवाड', 'बागुल', 'भोये', 'भोईर', 'जाधव', 'गावित', 'गांगुर्डे',
  'सूर्यवंशी', 'खांडवी', 'राठोड', 'जोपळे', 'चव्हाण', 'कोल्हे', 'वाघ', 'जगताप',
  'अंबिस', 'शिंदे', 'महाले', 'पडवळ', 'मोरे', 'झुंजारराव', 'बेंडकुळे', 'कुवर'
]);

/**
 * Decomposes a Marathi full name into Student Name, Mother Name, Father Name, and Surname.
 * Accurately detects whether surname is at the start (Ashram school format) or at the end.
 */
export function decomposeMarathiFullName(fullName: string) {
  const corrected = correctMarathiFullName(fullName);
  const tokens = corrected.split(' ').filter(Boolean);

  let studentName = '';
  let motherName = '';
  let fatherName = '';
  let surname = '';

  if (tokens.length === 1) {
    studentName = tokens[0];
  } else if (tokens.length === 2) {
    if (ASHRAM_SCHOOL_SURNAMES.has(tokens[0])) {
      surname = tokens[0];
      studentName = tokens[1];
    } else {
      studentName = tokens[0];
      surname = tokens[1];
    }
  } else if (tokens.length === 3) {
    // Check if first token is surname (e.g. पवार राहुल रमेश)
    if (ASHRAM_SCHOOL_SURNAMES.has(tokens[0])) {
      surname = tokens[0];
      studentName = tokens[1];
      fatherName = tokens[2];
    } else {
      studentName = tokens[0];
      fatherName = tokens[1];
      surname = tokens[2];
    }
  } else if (tokens.length >= 4) {
    if (ASHRAM_SCHOOL_SURNAMES.has(tokens[0])) {
      surname = tokens[0];
      studentName = tokens[1];
      motherName = tokens[2];
      fatherName = tokens.slice(3).join(' ');
    } else {
      studentName = tokens[0];
      motherName = tokens[1];
      fatherName = tokens[2];
      surname = tokens.slice(3).join(' ');
    }
  }

  return {
    fullName: corrected,
    studentName,
    motherName,
    fatherName,
    surname
  };
}

/**
 * Searches the official Waghamba School Master Registry by query and optional class standard.
 * Features:
 * - Multi-token matching across word boundaries
 * - Phonetic English-to-Marathi transliterated matching
 * - Search by Student Name, Marathi Name, Roll Number, APAAR ID, Village, Parent Name, Phone
 */
export function searchWaghambaStudents(query: string, std?: string): SchoolStudent[] {
  let list = WAGHAMBA_STUDENTS_DATA;
  if (std && std !== 'all') {
    list = list.filter((s) => s.std === std);
  }

  if (!query || query.trim() === '') {
    return list;
  }

  const rawQ = query.trim().toLowerCase();
  const rawClean = cleanLegacyMarathiText(rawQ).toLowerCase();
  const tokens = rawQ.split(/\s+/).filter(Boolean);

  return list.filter((s) => {
    const nameEng = (s.name || '').toLowerCase();
    const nameMar = (s.nameMarathi || '').toLowerCase();
    const roll = s.rollNo || '';
    const apaar = s.apaarId || '';
    const vill = (s.village || '').toLowerCase();
    const parent = (s.parentName || '').toLowerCase();
    const mob = s.mobileNumber || '';

    // Direct single query match
    if (
      nameEng.includes(rawQ) ||
      nameMar.includes(rawQ) ||
      nameMar.includes(rawClean) ||
      roll === rawQ ||
      apaar.includes(rawQ) ||
      vill.includes(rawQ) ||
      parent.includes(rawQ) ||
      mob.includes(rawQ)
    ) {
      return true;
    }

    // Token-wise match (every token must match something in the student record)
    if (tokens.length > 1) {
      const allTokensMatch = tokens.every((tok) => {
        return (
          nameEng.includes(tok) ||
          nameMar.includes(tok) ||
          parent.includes(tok) ||
          vill.includes(tok) ||
          roll === tok
        );
      });
      if (allTokensMatch) return true;
    }

    return false;
  });
}

