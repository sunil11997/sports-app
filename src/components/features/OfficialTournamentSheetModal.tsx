"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Search, 
  UserPlus, 
  Settings2, 
  FileText, 
  Check, 
  Hash, 
  X,
  Sparkles,
  Layers,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Filter,
  Medal,
  Activity,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { transliterateEnglishToMarathi, getAgeValidation } from '@/lib/utils';
import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { DETAILED_SKILLS_DATA } from './SportsSkills';
import {
  exportSingleCategoryToExcel,
  exportGame12PlayersBoysGirlsExcel,
  exportBoysOnly12Excel,
  exportGirlsOnly12Excel,
  exportConsolidatedAthleticsToExcel,
  exportAllCategoriesWorkbookToExcel,
  exportEveryGame12PlayersWorkbookToExcel,
  exportUniqueTournamentPlayersExcel,
  TournamentExcelMetadata,
  DEFAULT_UDISE,
  DEFAULT_TALUKA,
  DEFAULT_SCHOOL_MR
} from '@/lib/tournamentExcelExport';
import {
  resolveStudentDetails,
  getPlayerAgeCategoryLabel,
  formatAadharGrouped,
  getStudentUnderCategory
} from '@/lib/tournamentStudentResolver';

export interface SheetRow {
  id: string;
  srNo: string;
  studentName: string;
  std: string;
  grNo: string;
  dob: string;
  motherName: string;
  aadhar: string;
  saralId: string;
  schoolName?: string;
  uDise?: string;
  taluka?: string;
  sportOrEvent?: string;
  gameActivity?: string;
  skillScore?: string;
  skillScoreNum?: number;
  skillRank?: number;
  ageCategoryLabel?: string;
  gender?: string;
}

export interface UnderCategoryDef {
  key: string;
  ageType: 'U14' | 'U17' | 'U19';
  gender: 'Female' | 'Male';
  labelMr: string;
  badge: string;
  shortLabel: string;
}

export const OFFICIAL_CATEGORIES: UnderCategoryDef[] = [
  { key: 'u14_girls', ageType: 'U14', gender: 'Female', labelMr: '14 वर्षाखालील मुली', badge: '👧 14 मुली (Girls)', shortLabel: '14 मुली' },
  { key: 'u14_boys', ageType: 'U14', gender: 'Male', labelMr: '14 वर्षाखालील मुले', badge: '👦 14 मुले (Boys)', shortLabel: '14 मुले' },
  { key: 'u17_girls', ageType: 'U17', gender: 'Female', labelMr: '17 वर्षाखालील मुली', badge: '👧 17 मुली (Girls)', shortLabel: '17 मुली' },
  { key: 'u17_boys', ageType: 'U17', gender: 'Male', labelMr: '17 वर्षाखालील मुले', badge: '👦 17 मुले (Boys)', shortLabel: '17 मुले' },
  { key: 'u19_girls', ageType: 'U19', gender: 'Female', labelMr: '19 वर्षाखालील मुली', badge: '👧 19 मुली (Girls)', shortLabel: '19 मुली' },
  { key: 'u19_boys', ageType: 'U19', gender: 'Male', labelMr: '19 वर्षाखालील मुले', badge: '👦 19 मुले (Boys)', shortLabel: '19 मुले' },
];

export const SPORT_MARATHI_MAP: Record<string, string> = {
  'Kabaddi': 'कबड्डी',
  'Volleyball': 'व्हॉलीबॉल',
  'Kho Kho': 'खो खो',
  'Handball': 'हॅन्डबॉल',
  'Javelin Throw': 'भालाफेक',
  'Long Jump': 'लांब उडी',
  'High Jump': 'उंच उडी',
  'Shot Put': 'गोळाफेक',
  'Disc Throw': 'थाळीफेक',
  'Running': 'धावणे (रनिंग)',
  'Athletics': 'मैदानी स्पर्धा (ऍथलेटिक्स)',
  'Yoga': 'योगासने',
  'PT Mass': 'पी.टी. कवायत',
  'All': 'सर्व खेळ'
};

export const SQUAD_12_SPORTS = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball'];

export function is12SquadSport(sportKey: string, sportNameMr: string): boolean {
  if (SQUAD_12_SPORTS.includes(sportKey)) return true;
  const lower = (sportNameMr || '').toLowerCase();
  return lower.includes('कबड्डी') || 
         lower.includes('व्हॉलीबॉल') || 
         lower.includes('खो') || 
         lower.includes('हॅन्डबॉल');
}

export const ATHLETICS_CORE_SIX = [
  { key: 'Javelin Throw', labelMr: 'भालाफेक', fullMr: 'भालाफेक (Javelin Throw)' },
  { key: 'Disc Throw', labelMr: 'थाळीफेक', fullMr: 'थाळीफेक (Disc Throw)' },
  { key: 'Shot Put', labelMr: 'गोळाफेक', fullMr: 'गोळाफेक (Shot Put)' },
  { key: 'Running', labelMr: 'धावणे', fullMr: 'धावणे (Running Event)' },
  { key: 'Long Jump', labelMr: 'लांब उडी', fullMr: 'लांब उडी (Long Jump)' },
  { key: 'High Jump', labelMr: 'उंच उडी', fullMr: 'उंच उडी (High Jump)' }
];

export const ATHLETICS_DISCIPLINES = [
  'Javelin Throw', 
  'Disc Throw', 
  'Shot Put', 
  'Running',
  'Long Jump', 
  'High Jump', 
  'Athletics'
];

export function isAthleticsSixSport(sportKey: string): boolean {
  return ATHLETICS_DISCIPLINES.includes(sportKey);
}

// Retrieve Skill Hub marks and ranking for a player in a specific sport
export function getPlayerSkillMarksAndRank(
  player: any, 
  sportKey: string, 
  store: any
): { score: number; scoreDisplay: string; hasMark: boolean; detailedSkills?: Record<string, string> } {
  const skills = store?.data?.sportSkills || {};
  let skillRecord = skills[`${player.id}_${sportKey}`];

  if (!skillRecord) {
    const mrName = SPORT_MARATHI_MAP[sportKey];
    if (mrName && skills[`${player.id}_${mrName}`]) {
      skillRecord = skills[`${player.id}_${mrName}`];
    }
  }

  if (!skillRecord && ATHLETICS_DISCIPLINES.includes(sportKey)) {
    skillRecord = skills[`${player.id}_Athletics`];
  }

  const scoreNum = skillRecord ? parseFloat(String(skillRecord.score || '0')) : 0;
  const detailed = skillRecord?.detailedSkills;
  const hasDetailed = detailed && typeof detailed === 'object' && Object.keys(detailed).length > 0;
  const hasMark = (scoreNum > 0) || Boolean(hasDetailed);

  return {
    score: scoreNum,
    scoreDisplay: hasMark ? `${scoreNum}%` : '-',
    hasMark,
    detailedSkills: detailed
  };
}

// Retrieve game-related activity / skill description strictly for this specific game
export function getPlayerGameActivity(player: any, sportKey: string, store: any): string {
  const pos = player.positions?.[sportKey] || player.position || '';
  const skillInfo = getPlayerSkillMarksAndRank(player, sportKey, store);
  const detailed = skillInfo.detailedSkills;
  const sportSkillsList = DETAILED_SKILLS_DATA[sportKey] || [];

  let topSkillMr = '';
  if (detailed && typeof detailed === 'object') {
    let maxVal = -1;
    let topSkillName = '';
    for (const [sName, sVal] of Object.entries(detailed)) {
      const num = parseFloat(String(sVal));
      if (!isNaN(num) && num > maxVal) {
        maxVal = num;
        topSkillName = sName;
      }
    }
    if (topSkillName) {
      const matched = sportSkillsList.find(s => s.name === topSkillName || s.nameMr === topSkillName || s.id === topSkillName);
      topSkillMr = matched ? matched.nameMr : topSkillName;
    }
  }

  if (!topSkillMr && sportSkillsList.length > 0) {
    topSkillMr = sportSkillsList[0].nameMr;
  }

  if (pos && topSkillMr) {
    return `${pos} (${topSkillMr})`;
  }
  return pos || topSkillMr || (SPORT_MARATHI_MAP[sportKey] || sportKey);
}

interface OfficialTournamentSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: string;
  initialCategory?: string;
  initialPlayers?: any[];
  store: any;
}

export function formatStdMarathi(std: string | number | undefined): string {
  if (!std) return '-';
  const str = String(std).trim();
  if (str.startsWith('इ.') || str.includes('वी')) return str;
  return `इ. ${str} वी`;
}

export function parseStdToNumberOrString(val: string | undefined): string {
  if (!val) return '';
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let normalized = val.trim();
  marathiDigits.forEach((md, i) => {
    normalized = normalized.replaceAll(md, String(i));
  });
  const digits = normalized.replace(/\D/g, '');
  return digits || val.trim();
}

export function formatDobDDMMYYYY(dob: string | undefined): string {
  if (!dob || dob === '-' || dob === '---') return '';
  const trimmed = dob.trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed.replace(/\//g, '.');
  const dotSlashHyphenMatch = trimmed.match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/);
  if (dotSlashHyphenMatch) {
    const p1 = dotSlashHyphenMatch[1];
    const p2 = dotSlashHyphenMatch[2].padStart(2, '0');
    const p3 = dotSlashHyphenMatch[3];
    if (p1.length === 4) {
      return `${p3.padStart(2, '0')}.${p2}.${p1}`;
    }
    return `${p1.padStart(2, '0')}.${p2}.${p3}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }
  return trimmed;
}

export function convertDDMMYYYYToISO(dob: string | undefined): string {
  if (!dob) return '';
  const trimmed = dob.trim();
  const match = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const dd = match[1].padStart(2, '0');
    const mm = match[2].padStart(2, '0');
    const yyyy = match[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
}

export function formatAadharDisplay(aadhar: string | undefined): string {
  if (!aadhar) return '';
  const digits = aadhar.replace(/\D/g, '');
  if (digits.length === 12) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
  return aadhar.trim();
}

export function formatSaralIdDisplay(saral: string | undefined): string {
  if (!saral) return '';
  const clean = saral.trim();
  if (clean.length > 8 && !clean.includes(' ')) {
    return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  return clean;
}

export function OfficialTournamentSheetModal({
  isOpen,
  onClose,
  initialSport = 'Kabaddi',
  initialCategory = 'Girls U14',
  initialPlayers = [],
  store
}: OfficialTournamentSheetModalProps) {
  // Official Header Fields matching Maharashtra Tribal Development Department sports entry form
  const [departmentName, setDepartmentName] = useState<string>("आदिवासी विकास विभाग नाशिक");
  const [projectName, setProjectName] = useState<string>("एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक");
  const [schoolName, setSchoolName] = useState<string>("शासकीय माध्यमिक आश्रमशाळा वाघांबा ता.सटाणा जि.नाशिक");

  // Sport and Academic Year
  const [selectedSportKey, setSelectedSportKey] = useState<string>(initialSport);
  const [sportName, setSportName] = useState<string>(SPORT_MARATHI_MAP[initialSport] || initialSport || 'कबड्डी');
  const [academicYear, setAcademicYear] = useState<string>("2026-27");

  // Active Category Key
  const getInitialCategoryKey = (catStr: string): string => {
    const lower = (catStr || '').toLowerCase();
    const isFemale = lower.includes('girl') || lower.includes('मुली') || lower.includes('female');
    if (lower.includes('14') || lower.includes('u14')) {
      return isFemale ? 'u14_girls' : 'u14_boys';
    }
    if (lower.includes('17') || lower.includes('u17')) {
      return isFemale ? 'u17_girls' : 'u17_boys';
    }
    if (lower.includes('19') || lower.includes('u19') || lower.includes('senior')) {
      return isFemale ? 'u19_girls' : 'u19_boys';
    }
    return isFemale ? 'u14_girls' : 'u14_boys';
  };

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(getInitialCategoryKey(initialCategory));
  const [customAgeGroup, setCustomAgeGroup] = useState<string>('14 वर्षाखालील मुली');

  // Filter mode: strictly show only players with Skill Hub marks by default!
  const [onlySkillHubMarked, setOnlySkillHubMarked] = useState<boolean>(true);

  // Athletics mode: when viewing Javelin, Discus, Shot Put, Running, Long Jump, High Jump
  const isAthleticsSport = isAthleticsSixSport(selectedSportKey);
  const [isConsolidatedAthleticsView, setIsConsolidatedAthleticsView] = useState<boolean>(false);

  // Multi-Category Map: each category maintains its OWN distinct rows
  const [categorySheets, setCategorySheets] = useState<Record<string, SheetRow[]>>({});
  // Consolidated Athletics Sheet Rows (all 6 events together)
  const [athleticsConsolidatedRows, setAthleticsConsolidatedRows] = useState<SheetRow[]>([]);

  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);

  // Debounced auto-save timer ref
  const debounceSyncRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Refs to control initialization strictly on opening or user-driven sport changes
  const prevOpenRef = useRef<boolean>(false);
  const prevSportRef = useRef<string>(initialSport);

  // Student Picker Dialog state
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // Check if current sport requires strictly 12 players on printed sheet
  const is12PlayersOnly = is12SquadSport(selectedSportKey, sportName);

  // Find student in master databases to auto-complete missing fields
  const findMasterStudent = useCallback((p: any): SchoolStudent | undefined => {
    const rawName = (p.name || '').trim().toLowerCase();
    const marathiName = (p.nameMarathi || '').trim();
    const gr = (p.generalRegisterNumber || p.serialNumber || '').trim();
    const id = (p.id || '').trim();

    return WAGHAMBA_STUDENTS_DATA.find((s) => {
      if (id && s.id === id) return true;
      if (gr && (s.rollNo === gr || s.serialNumber === gr)) return true;
      if (marathiName && s.nameMarathi && s.nameMarathi.includes(marathiName)) return true;
      if (rawName && s.name && s.name.toLowerCase().includes(rawName)) return true;
      return false;
    });
  }, []);

  // Convert raw player object to SheetRow with comprehensive resolution
  const playerToSheetRow = useCallback((p: any, index: number): SheetRow => {
    const resolved = resolveStudentDetails(p, SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey, customAgeGroup);

    return {
      id: p.id || `row-${index}-${Date.now()}`,
      srNo: p.srNo || String(index + 1),
      studentName: resolved.studentName,
      std: resolved.std,
      grNo: resolved.grNo,
      dob: resolved.dob,
      motherName: (p.motherName && p.motherName !== '-' && p.motherName !== '---') ? p.motherName : resolved.motherName,
      aadhar: (p.aadharNumber && p.aadharNumber !== '-' && p.aadharNumber !== '---') ? formatAadharGrouped(p.aadharNumber) : resolved.aadhar,
      saralId: resolved.saralId,
      schoolName: p.schoolName || schoolName || DEFAULT_SCHOOL_MR,
      uDise: p.uDise || DEFAULT_UDISE,
      taluka: p.taluka || DEFAULT_TALUKA,
      sportOrEvent: p.sportOrEvent || resolved.sportOrEvent,
      gameActivity: p.gameActivity || '',
      skillScore: p.skillScore || '-',
      skillScoreNum: p.skillScoreNum || 0,
      skillRank: p.skillRank || (index + 1),
      ageCategoryLabel: getPlayerAgeCategoryLabel(p, resolved.gender),
      gender: resolved.gender
    };
  }, [selectedSportKey, schoolName, customAgeGroup]);

  // Synchronize student data back to profile (only for profile fields, NEVER for srNo!)
  const syncRowToStudentProfile = useCallback((row: SheetRow) => {
    if (!store?.updatePlayer) return;

    const allPlayers: any[] = store?.data?.players || [];
    let existing = allPlayers.find((p: any) => p.id === row.id);
    if (!existing && row.grNo) {
      existing = allPlayers.find((p: any) => 
        String(p.generalRegisterNumber).trim() === row.grNo.trim() || 
        String(p.serialNumber).trim() === row.grNo.trim()
      );
    }

    const cleanStd = parseStdToNumberOrString(row.std);
    const isoDob = convertDDMMYYYYToISO(row.dob);
    const cleanAadhar = (row.aadhar || '').replace(/\s+/g, '');
    const cleanSaral = (row.saralId || '').replace(/\s+/g, '');

    const updatedPlayer: any = {
      ...(existing || {}),
      id: existing?.id || row.id,
      nameMarathi: row.studentName.trim(),
      name: existing?.name || transliterateEnglishToMarathi(row.studentName) || row.studentName,
      std: cleanStd || existing?.std || '',
      generalRegisterNumber: row.grNo.trim(),
      serialNumber: row.grNo.trim(),
      dob: isoDob || existing?.dob || '',
      motherName: row.motherName.trim(),
      aadharNumber: cleanAadhar || existing?.aadharNumber || '',
      saralId: cleanSaral || existing?.saralId || '',
      penNumber: cleanSaral || existing?.penNumber || existing?.panNumber || '',
      panNumber: cleanSaral || existing?.panNumber || '',
      category: existing?.category || 'athlete',
      updatedAt: new Date().toISOString()
    };

    try {
      store.updatePlayer(updatedPlayer);
      setLastSyncStatus(`विद्यार्थी प्रोफाइल अपडेट सेव्ह झाली (${row.studentName || row.grNo})`);
      setTimeout(() => setLastSyncStatus(null), 3000);
    } catch (err) {
      console.error("Error auto-updating student profile from sheet:", err);
    }
  }, [store]);

  // Build Consolidated Athletics Sheet Rows for all 6 events:
  // Javelin Throw, Disc Throw, Shot Put, Running, Long Jump, High Jump
  const buildConsolidatedAthleticsRows = useCallback((): SheetRow[] => {
    const allStorePlayers: any[] = store?.data?.players || [];
    const collected: SheetRow[] = [];
    const seenPlayerEvent = new Set<string>();

    ATHLETICS_CORE_SIX.forEach(ev => {
      allStorePlayers.forEach(p => {
        if (p.category && p.category !== 'athlete') return;
        const skillInfo = getPlayerSkillMarksAndRank(p, ev.key, store);
        const isRegistered = Boolean(
          p.sports && Array.isArray(p.sports) && (p.sports.includes(ev.key) || p.sports.includes('Athletics'))
        );

        // Include player if they have Skill Hub mark or are registered in this athletics discipline
        if (skillInfo.hasMark || isRegistered) {
          const key = `${p.id}_${ev.key}`;
          if (!seenPlayerEvent.has(key)) {
            seenPlayerEvent.add(key);
            const activity = getPlayerGameActivity(p, ev.key, store);
            const baseRow = playerToSheetRow(p, collected.length);
            collected.push({
              ...baseRow,
              srNo: String(collected.length + 1),
              sportOrEvent: ev.labelMr,
              gameActivity: activity,
              skillScore: skillInfo.scoreDisplay,
              skillScoreNum: skillInfo.score,
              skillRank: 1,
              ageCategoryLabel: p.gender === 'Female' ? 'मुली' : 'मुले'
            });
          }
        }
      });
    });

    // Sort strictly by Skill Hub marks ranking (highest score first)
    collected.sort((a, b) => (b.skillScoreNum || 0) - (a.skillScoreNum || 0));

    // Re-assign Sr No and Rank by mark ranking
    return collected.map((r, i) => ({
      ...r,
      srNo: String(i + 1),
      skillRank: i + 1
    }));
  }, [store, playerToSheetRow]);

  // Build sheets for all 6 categories from store players
  const initializeCategorySheets = useCallback((sportKey: string, basePlayers?: any[]) => {
    const allStorePlayers: any[] = store?.data?.players || [];
    const newSheets: Record<string, SheetRow[]> = {};
    const isAthletics = ATHLETICS_DISCIPLINES.includes(sportKey);

    OFFICIAL_CATEGORIES.forEach(catDef => {
      // 1. Filter strictly by canonical Under category and gender
      let pool = allStorePlayers.filter((p: any) => {
        const studentCat = getStudentUnderCategory(p);
        return studentCat.gender === catDef.gender && studentCat.ageType === catDef.ageType;
      });

      // 3. For each player, retrieve their game-specific activities and Skill Hub marks
      const scoredPlayers = pool.map(p => {
        const skillInfo = getPlayerSkillMarksAndRank(p, sportKey, store);
        const activity = getPlayerGameActivity(p, sportKey, store);
        const isInSport = Boolean(
          p.sports && Array.isArray(p.sports) && (p.sports.includes(sportKey) || (isAthletics && (p.sports.includes('Athletics') || p.category === 'athlete')))
        );

        return {
          ...p,
          skillScoreNum: skillInfo.score,
          skillScoreDisplay: skillInfo.scoreDisplay,
          hasSkillMark: skillInfo.hasMark,
          gameActivity: activity,
          isInSport
        };
      });

      // 4. Form complete tournament squad (up to 12 players for team sports):
      // Primary: Players with marks from Skill Hub for this specific game
      const withMarksInSport = scoredPlayers.filter(p => p.hasSkillMark && (p.isInSport || isAthletics));
      withMarksInSport.sort((a, b) => b.skillScoreNum - a.skillScoreNum);

      // Secondary: Other players assigned to this sport without marks yet
      const otherInSport = scoredPlayers.filter(p => !p.hasSkillMark && (p.isInSport || isAthletics));
      otherInSport.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

      // Tertiary: Other eligible athletes in this age category
      const otherAthletes = scoredPlayers.filter(p => !p.isInSport && !isAthletics);
      otherAthletes.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

      let filtered = [...withMarksInSport, ...otherInSport];
      // If fewer than 12 players, fill up to 12 from other athletes in the same age category
      if (filtered.length < 12) {
        filtered = [...filtered, ...otherAthletes.slice(0, 12 - filtered.length)];
      }

      // Fallback: If still empty, use basePlayers if matching initial category
      if (filtered.length === 0 && basePlayers && basePlayers.length > 0 && getInitialCategoryKey(initialCategory) === catDef.key) {
        filtered = basePlayers
          .filter(p => {
            const studentCat = getStudentUnderCategory(p);
            return studentCat.gender === catDef.gender && studentCat.ageType === catDef.ageType;
          })
          .map(p => {
            const skillInfo = getPlayerSkillMarksAndRank(p, sportKey, store);
            const activity = getPlayerGameActivity(p, sportKey, store);
            return {
              ...p,
              skillScoreNum: skillInfo.score,
              skillScoreDisplay: skillInfo.scoreDisplay,
              hasSkillMark: skillInfo.hasMark,
              gameActivity: activity,
              isInSport: true
            };
          });
      }

      // Map to SheetRow with initial Sr No = Mark Ranking (1, 2, 3...)
      newSheets[catDef.key] = filtered.map((p, i) => {
        const row = playerToSheetRow(p, i);
        return {
          ...row,
          srNo: String(i + 1), // Sr No corresponds to their mark rank
          sportOrEvent: SPORT_MARATHI_MAP[sportKey] || sportKey,
          gameActivity: p.gameActivity,
          skillScore: p.skillScoreDisplay,
          skillScoreNum: p.skillScoreNum,
          skillRank: i + 1,
          ageCategoryLabel: catDef.shortLabel
        };
      });
    });

    setCategorySheets(newSheets);

    // If it's an athletics sport, also build the consolidated sheet for all 6 events
    if (ATHLETICS_DISCIPLINES.includes(sportKey)) {
      setAthleticsConsolidatedRows(buildConsolidatedAthleticsRows());
    }
  }, [store, playerToSheetRow, initialCategory, buildConsolidatedAthleticsRows]);

  // Sync strictly on modal open or sport change (does NOT re-trigger on user typing!)
  useEffect(() => {
    if (isOpen) {
      const isFirstOpen = !prevOpenRef.current;
      const isSportChanged = prevSportRef.current !== initialSport;

      if (isFirstOpen || isSportChanged) {
        setSelectedSportKey(initialSport);
        setSportName(SPORT_MARATHI_MAP[initialSport] || initialSport || 'कबड्डी');
        const catKey = getInitialCategoryKey(initialCategory);
        setActiveCategoryKey(catKey);
        const catDef = OFFICIAL_CATEGORIES.find(c => c.key === catKey);
        if (catDef) {
          setCustomAgeGroup(catDef.labelMr);
        }
        initializeCategorySheets(initialSport, initialPlayers);
        prevSportRef.current = initialSport;
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialSport, initialCategory, initializeCategorySheets, initialPlayers]);

  // Handle switching category
  const handleSelectCategory = (catKey: string) => {
    setActiveCategoryKey(catKey);
    setIsConsolidatedAthleticsView(false);
    const catDef = OFFICIAL_CATEGORIES.find(c => c.key === catKey);
    if (catDef) {
      setCustomAgeGroup(catDef.labelMr);
    }
  };

  // Active category rows (or consolidated athletics rows if toggled)
  const activeRows = isConsolidatedAthleticsView 
    ? athleticsConsolidatedRows 
    : (categorySheets[activeCategoryKey] || []);

  // Update rows for active category or consolidated view
  const updateActiveRows = (newRows: SheetRow[]) => {
    if (isConsolidatedAthleticsView) {
      setAthleticsConsolidatedRows(newRows);
    } else {
      setCategorySheets(prev => ({
        ...prev,
        [activeCategoryKey]: newRows
      }));
    }
  };

  // Row operations: user can freely edit Sr No without it being reset!
  const updateRowField = (index: number, field: keyof SheetRow, value: string) => {
    const next = [...activeRows];
    const updatedRow = { ...next[index], [field]: value };
    next[index] = updatedRow;
    updateActiveRows(next);

    // CRITICAL: NEVER sync Sr No, Rank, or Game Activity to the student profile!
    // This allows the teacher to edit Sr No freely without triggering store updates or reverts!
    const sheetOnlyFields: (keyof SheetRow)[] = ['srNo', 'gameActivity', 'skillScore', 'skillScoreNum', 'skillRank', 'sportOrEvent', 'ageCategoryLabel'];
    if (!sheetOnlyFields.includes(field)) {
      if (debounceSyncRef.current[updatedRow.id]) {
        clearTimeout(debounceSyncRef.current[updatedRow.id]);
      }
      debounceSyncRef.current[updatedRow.id] = setTimeout(() => {
        syncRowToStudentProfile(updatedRow);
      }, 500);
    }
  };

  const handleRowBlur = (index: number) => {
    // Only profile fields get synced on blur if needed
    const row = activeRows[index];
    if (row) {
      syncRowToStudentProfile(row);
    }
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeRows.length) return;
    const next = [...activeRows];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    updateActiveRows(next);
  };

  const autoRenumber = () => {
    const next = activeRows.map((row, i) => ({ ...row, srNo: String(i + 1) }));
    updateActiveRows(next);
  };

  const sortBySrNo = () => {
    const next = [...activeRows];
    next.sort((a, b) => {
      const numA = parseInt(a.srNo) || 0;
      const numB = parseInt(b.srNo) || 0;
      return numA - numB;
    });
    updateActiveRows(next);
  };

  const sortBySkillHubRanking = () => {
    const next = [...activeRows];
    next.sort((a, b) => (b.skillScoreNum || 0) - (a.skillScoreNum || 0));
    const renumbered = next.map((r, i) => ({
      ...r,
      srNo: String(i + 1),
      skillRank: i + 1
    }));
    updateActiveRows(renumbered);
  };

  const addBlankRow = () => {
    const nextSr = activeRows.length > 0 ? String(activeRows.length + 1) : "1";
    const isGirl = activeCategoryKey.includes('girl');
    const newRow: SheetRow = {
      id: `custom-row-${Date.now()}`,
      srNo: nextSr,
      studentName: "",
      std: "इ. ८ वी",
      grNo: "",
      dob: "",
      motherName: "",
      aadhar: "",
      saralId: "",
      schoolName: schoolName || DEFAULT_SCHOOL_MR,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA,
      sportOrEvent: SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey,
      gameActivity: isAthleticsSport ? "भालाफेक / धावणे" : "चढाईपटू (Raider)",
      skillScore: "-",
      skillScoreNum: 0,
      skillRank: activeRows.length + 1,
      ageCategoryLabel: customAgeGroup || (isGirl ? 'मुली' : 'मुले'),
      gender: isGirl ? 'Female' : 'Male'
    };
    updateActiveRows([...activeRows, newRow]);
  };

  const deleteRow = (index: number) => {
    updateActiveRows(activeRows.filter((_, i) => i !== index));
  };

  const resetCurrentCategory = () => {
    initializeCategorySheets(selectedSportKey);
  };

  // Add student from picker into active category sheet
  const handleAddFromStudentPicker = (student: any) => {
    const skillInfo = getPlayerSkillMarksAndRank(student, selectedSportKey, store);
    const activity = getPlayerGameActivity(student, selectedSportKey, store);
    const baseRow = playerToSheetRow(student, activeRows.length);
    const newRow: SheetRow = {
      ...baseRow,
      srNo: String(activeRows.length + 1),
      sportOrEvent: SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey,
      gameActivity: activity,
      skillScore: skillInfo.scoreDisplay,
      skillScoreNum: skillInfo.score,
      skillRank: activeRows.length + 1
    };
    updateActiveRows([...activeRows, newRow]);
    setIsPickerOpen(false);
  };

  // Generate HTML for a single category sheet matching user requirements:
  // Heading will be same: Department, Project, School, Subheader
  // Columns in Marathi:
  // 1. अनु. क्र.
  // 2. खेळाडूचे पूर्ण नाव
  // 3. जनरल रजिस्टर नं.
  // 4. जन्मतारीख
  // 5. आईचे नाव
  // 6. आधार क्र.
  // 7. शाळेचे नाव
  // 8. यु-डायस क्रमांक (27200116503)
  // 9. तालुका (बागलाण)
  // 10. वयोगट
  // 11. खेळाचा प्रकार
  const generateSingleSheetTableHtml = (catLabel: string, rawRowsList: SheetRow[], isMultiPage: boolean = false) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    // Enforce 12-player rule for team sports
    const is12 = is12SquadSport(selectedSportKey, sportName);
    let rowsList = is12 ? rawRowsList.slice(0, 12) : rawRowsList;

    // Ensure strictly 12 player rows for team sports on the official printed sheet
    if (is12 && rowsList.length < 12) {
      const padded: SheetRow[] = [...rowsList];
      for (let i = rowsList.length; i < 12; i++) {
        padded.push({
          id: `blank_${i + 1}`,
          srNo: String(i + 1),
          studentName: '',
          std: '-',
          grNo: '-',
          dob: '-',
          motherName: '-',
          aadhar: '-',
          saralId: '-',
          schoolName: schoolName || DEFAULT_SCHOOL_MR,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          sportOrEvent: sportName,
          gameActivity: '',
          skillScore: '-',
          skillScoreNum: 0,
          skillRank: i + 1,
          ageCategoryLabel: catLabel
        });
      }
      rowsList = padded;
    }

    const rowsHtml = rowsList.length > 0 ? rowsList.map(r => `
      <tr>
        <td class="text-center font-normal">${r.srNo || '-'}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal">${r.ageCategoryLabel || catLabel || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportName || '-'}</td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="12" class="text-center py-6 text-muted font-normal">या वयोगटासाठी खेळाडू यादी उपलब्ध नाही</td>
      </tr>
    `;

    return `
      <div class="sheet-page ${isMultiPage ? 'page-break' : ''}">
        <table class="official-outer-box">
          <thead>
            <!-- ROW 1: DEPARTMENT NAME (BOLD) -->
            <tr>
              <th colspan="12" class="header-line-1">
                ${departmentName}
              </th>
            </tr>

            <!-- ROW 2: PROJECT NAME (BOLD) -->
            <tr>
              <th colspan="12" class="header-line-2">
                ${projectName}
              </th>
            </tr>

            <!-- ROW 3: SCHOOL NAME (BOLD) -->
            <tr>
              <th colspan="12" class="header-line-3">
                ${schoolName}
              </th>
            </tr>

            <!-- ROW 4: SUBHEADER METADATA BAR (AGE GROUP, SPORT, YEAR) (BOLD) -->
            <tr>
              <th colspan="4" class="meta-bar-cell text-left">
                वयोगट :- ${catLabel}
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                खेळ प्रकार :- ${sportName}
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>

            <!-- ROW 5: COLUMN HEADERS (BOLD) - 12 MARATHI COLUMNS -->
            <tr>
              <th class="col-header" style="width: 4%;">अनु. क्र.</th>
              <th class="col-header" style="width: 17%;">खेळाडूचे पूर्ण नाव</th>
              <th class="col-header" style="width: 6%;">इयत्ता</th>
              <th class="col-header" style="width: 8%;">जनरल रजिस्टर नं.</th>
              <th class="col-header" style="width: 8%;">जन्मतारीख</th>
              <th class="col-header" style="width: 9%;">आईचे नाव</th>
              <th class="col-header" style="width: 11%;">आधार क्र.</th>
              <th class="col-header" style="width: 14%;">शाळेचे नाव</th>
              <th class="col-header" style="width: 8%;">यु-डायस क्रमांक</th>
              <th class="col-header" style="width: 5%;">तालुका</th>
              <th class="col-header" style="width: 5%;">वयोगट</th>
              <th class="col-header" style="width: 5%;">खेळाचा प्रकार</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- FOOTER SIGNATURE SECTION -->
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate 12 Players Official Squad Sheet: First Boys (12 players), then Girls (12 players)
  // Generate 12 Players Official Squad Sheet: First Boys (12 players), then Girls (12 players)
  const generateGame12BoysGirlsHtml = (sportLabelMr: string, boysList: SheetRow[], girlsList: SheetRow[]) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const padTo12 = (list: SheetRow[], genderLabel: string) => {
      const padded = [...list.slice(0, 12)];
      while (padded.length < 12) {
        const defCat = genderLabel === 'मुली' ? '१४ वर्षाखालील मुली' : '१४ वर्षाखालील मुले';
        padded.push({
          id: `blank_${genderLabel}_${padded.length + 1}`,
          srNo: String(padded.length + 1),
          studentName: '',
          std: '-',
          grNo: '-',
          dob: '-',
          motherName: '-',
          aadhar: '-',
          saralId: '-',
          schoolName: schoolName || DEFAULT_SCHOOL_MR,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          sportOrEvent: sportLabelMr,
          ageCategoryLabel: defCat,
          gender: genderLabel === 'मुली' ? 'Female' : 'Male'
        });
      }
      return padded;
    };

    const finalBoys = padTo12(boysList, 'मुले');
    const finalGirls = padTo12(girlsList, 'मुली');

    const renderRows = (rows: SheetRow[], startSr: number, genderType: string) => rows.map((r, i) => {
      const vyogat = getPlayerAgeCategoryLabel(r, genderType);
      return `
      <tr>
        <td class="text-center font-normal">${startSr + i}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal" style="font-weight: 600;">${vyogat}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportLabelMr}</td>
      </tr>
    `}).join('');

    return `
      <div class="sheet-page">
        <table class="official-outer-box">
          <thead>
            <tr><th colspan="12" class="header-line-1">${departmentName}</th></tr>
            <tr><th colspan="12" class="header-line-2">${projectName}</th></tr>
            <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
            <tr>
              <th colspan="4" class="meta-bar-cell text-left">
                वयोगट :- १२ खेळाडू संघ (प्रथम मुले, नंतर मुली)
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                खेळ प्रकार :- ${sportLabelMr}
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>
            <tr>
              <th colspan="12" style="background: #e2e8f0; font-weight: 900; text-align: left; padding: 4px 8px; font-size: 10pt;">
                👦 १. मुले संघ (Boys Squad - १२ खेळाडू)
              </th>
            </tr>
            <tr>
              <th class="col-header" style="width: 4%;">अनु. क्र.</th>
              <th class="col-header" style="width: 17%;">खेळाडूचे पूर्ण नाव</th>
              <th class="col-header" style="width: 6%;">इयत्ता</th>
              <th class="col-header" style="width: 8%;">जनरल रजिस्टर नं.</th>
              <th class="col-header" style="width: 8%;">जन्मतारीख</th>
              <th class="col-header" style="width: 9%;">आईचे नाव</th>
              <th class="col-header" style="width: 11%;">आधार क्र.</th>
              <th class="col-header" style="width: 14%;">शाळेचे नाव</th>
              <th class="col-header" style="width: 8%;">यु-डायस क्रमांक</th>
              <th class="col-header" style="width: 5%;">तालुका</th>
              <th class="col-header" style="width: 5%;">वयोगट</th>
              <th class="col-header" style="width: 5%;">खेळाचा प्रकार</th>
            </tr>
          </thead>
          <tbody>
            ${renderRows(finalBoys, 1, 'Male')}
            <tr>
              <td colspan="12" style="background: #fce7f3; font-weight: 900; text-align: left; padding: 4px 8px; font-size: 10pt; color: #9d174d;">
                👧 २. मुली संघ (Girls Squad - १२ खेळाडू)
              </td>
            </tr>
            ${renderRows(finalGirls, 1, 'Female')}
          </tbody>
        </table>

        <!-- FOOTER SIGNATURE SECTION -->
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate 12 BOYS ONLY HTML
  const generate12BoysOnlyHtml = (sportLabelMr: string, boysList: SheetRow[]) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const padded = [...boysList.slice(0, 12)];
    while (padded.length < 12) {
      padded.push({
        id: `blank_b_${padded.length + 1}`,
        srNo: String(padded.length + 1),
        studentName: '',
        std: '-',
        grNo: '-',
        dob: '-',
        motherName: '-',
        aadhar: '-',
        saralId: '-',
        schoolName: schoolName || DEFAULT_SCHOOL_MR,
        uDise: DEFAULT_UDISE,
        taluka: DEFAULT_TALUKA,
        sportOrEvent: sportLabelMr,
        ageCategoryLabel: '१४ वर्षाखालील मुले',
        gender: 'Male'
      });
    }

    const rowsHtml = padded.map((r, i) => `
      <tr>
        <td class="text-center font-normal">${i + 1}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal" style="font-weight: 600;">${getPlayerAgeCategoryLabel(r, 'Male')}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportLabelMr}</td>
      </tr>
    `).join('');

    return `
      <div class="sheet-page">
        <table class="official-outer-box">
          <thead>
            <tr><th colspan="12" class="header-line-1">${departmentName}</th></tr>
            <tr><th colspan="12" class="header-line-2">${projectName}</th></tr>
            <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
            <tr>
              <th colspan="4" class="meta-bar-cell text-left">
                वयोगट :- १२ मुले संघ (Boys 12 Squad)
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                खेळ प्रकार :- ${sportLabelMr}
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>
            <tr>
              <th class="col-header" style="width: 4%;">अनु. क्र.</th>
              <th class="col-header" style="width: 17%;">खेळाडूचे पूर्ण नाव</th>
              <th class="col-header" style="width: 6%;">इयत्ता</th>
              <th class="col-header" style="width: 8%;">जनरल रजिस्टर नं.</th>
              <th class="col-header" style="width: 8%;">जन्मतारीख</th>
              <th class="col-header" style="width: 9%;">आईचे नाव</th>
              <th class="col-header" style="width: 11%;">आधार क्र.</th>
              <th class="col-header" style="width: 14%;">शाळेचे नाव</th>
              <th class="col-header" style="width: 8%;">यु-डायस क्रमांक</th>
              <th class="col-header" style="width: 5%;">तालुका</th>
              <th class="col-header" style="width: 5%;">वयोगट</th>
              <th class="col-header" style="width: 5%;">खेळाचा प्रकार</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate 12 GIRLS ONLY HTML
  const generate12GirlsOnlyHtml = (sportLabelMr: string, girlsList: SheetRow[]) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const padded = [...girlsList.slice(0, 12)];
    while (padded.length < 12) {
      padded.push({
        id: `blank_g_${padded.length + 1}`,
        srNo: String(padded.length + 1),
        studentName: '',
        std: '-',
        grNo: '-',
        dob: '-',
        motherName: '-',
        aadhar: '-',
        saralId: '-',
        schoolName: schoolName || DEFAULT_SCHOOL_MR,
        uDise: DEFAULT_UDISE,
        taluka: DEFAULT_TALUKA,
        sportOrEvent: sportLabelMr,
        ageCategoryLabel: '१४ वर्षाखालील मुली',
        gender: 'Female'
      });
    }

    const rowsHtml = padded.map((r, i) => `
      <tr>
        <td class="text-center font-normal">${i + 1}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal" style="font-weight: 600;">${getPlayerAgeCategoryLabel(r, 'Female')}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportLabelMr}</td>
      </tr>
    `).join('');

    return `
      <div class="sheet-page">
        <table class="official-outer-box">
          <thead>
            <tr><th colspan="12" class="header-line-1">${departmentName}</th></tr>
            <tr><th colspan="12" class="header-line-2">${projectName}</th></tr>
            <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
            <tr>
              <th colspan="4" class="meta-bar-cell text-left">
                वयोगट :- १२ मुली संघ (Girls 12 Squad)
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                खेळ प्रकार :- ${sportLabelMr}
              </th>
              <th colspan="4" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>
            <tr>
              <th class="col-header" style="width: 4%;">अनु. क्र.</th>
              <th class="col-header" style="width: 17%;">खेळाडूचे पूर्ण नाव</th>
              <th class="col-header" style="width: 6%;">इयत्ता</th>
              <th class="col-header" style="width: 8%;">जनरल रजिस्टर नं.</th>
              <th class="col-header" style="width: 8%;">जन्मतारीख</th>
              <th class="col-header" style="width: 9%;">आईचे नाव</th>
              <th class="col-header" style="width: 11%;">आधार क्र.</th>
              <th class="col-header" style="width: 14%;">शाळेचे नाव</th>
              <th class="col-header" style="width: 8%;">यु-डायस क्रमांक</th>
              <th class="col-header" style="width: 5%;">तालुका</th>
              <th class="col-header" style="width: 5%;">वयोगट</th>
              <th class="col-header" style="width: 5%;">खेळाचा प्रकार</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate Master Tournament Unique Players Entry Sheet:
  // "dont add in the list same student in the same porpose that list is the i want to know how many plyer are going to play"
  const generateUniquePlayersSheetHtml = (uniquePlayers: SheetRow[], summary: { total: number; boys: number; girls: number }) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const rowsHtml = uniquePlayers.length > 0 ? uniquePlayers.map(r => `
      <tr>
        <td class="text-center font-normal">${r.srNo || '-'}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal">${r.ageCategoryLabel || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700; color: #1e3a8a;">${r.sportOrEvent || '-'}</td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="12" class="text-center py-6 text-muted font-normal">खेळाडू यादी उपलब्ध नाही</td>
      </tr>
    `;

    return `
      <div class="sheet-page">
        <table class="official-outer-box">
          <thead>
            <tr><th colspan="12" class="header-line-1">${departmentName}</th></tr>
            <tr><th colspan="12" class="header-line-2">${projectName}</th></tr>
            <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
            <tr>
              <th colspan="6" class="meta-bar-cell text-left">
                शालेय क्रीडा स्पर्धा सन :- ${academicYear} | एकूण सहभागी खेळाडू मास्टर यादी (सर्व खेळ)
              </th>
              <th colspan="6" class="meta-bar-cell text-right" style="color: #047857; font-size: 11pt;">
                एकूण खेळाडू: ${summary.total} (👦 मुले: ${summary.boys} | 👧 मुली: ${summary.girls})
              </th>
            </tr>
            <tr>
              <th class="col-header" style="width: 4%;">अनु. क्र.</th>
              <th class="col-header" style="width: 17%;">खेळाडूचे पूर्ण नाव</th>
              <th class="col-header" style="width: 6%;">इयत्ता</th>
              <th class="col-header" style="width: 8%;">जनरल रजिस्टर नं.</th>
              <th class="col-header" style="width: 8%;">जन्मतारीख</th>
              <th class="col-header" style="width: 9%;">आईचे नाव</th>
              <th class="col-header" style="width: 11%;">आधार क्र.</th>
              <th class="col-header" style="width: 14%;">शाळेचे नाव</th>
              <th class="col-header" style="width: 8%;">यु-डायस क्रमांक</th>
              <th class="col-header" style="width: 5%;">तालुका</th>
              <th class="col-header" style="width: 5%;">वयोगट</th>
              <th class="col-header" style="width: 5%;">खेळाचा प्रकार</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- FOOTER SIGNATURE SECTION -->
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate Consolidated Athletics Sheet for all 6 events:
  // Javelin Throw, Disc Throw, Shot Put, Running, Long Jump, High Jump
  const generateConsolidatedAthleticsSheetHtml = (rowsList: SheetRow[]) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const rowsHtml = rowsList.length > 0 ? rowsList.map(r => `
      <tr>
        <td class="text-center font-normal">${r.srNo || '-'}</td>
        <td class="font-normal text-left">${r.studentName || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700; color: #1e3a8a;">${r.sportOrEvent || '-'}</td>
        <td class="text-center font-normal">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal">${r.aadhar || '-'}</td>
        <td class="text-center font-normal"></td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="9" class="text-center py-8 text-muted font-normal">
          भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी व उंच उडीसाठी खेळाडू उपलब्ध नाहीत
        </td>
      </tr>
    `;

    return `
      <div class="sheet-page">
        <table class="official-outer-box">
          <thead>
            <tr>
              <th colspan="9" class="header-line-1">${departmentName}</th>
            </tr>
            <tr>
              <th colspan="9" class="header-line-2">${projectName}</th>
            </tr>
            <tr>
              <th colspan="9" class="header-line-3">${schoolName}</th>
            </tr>
            <tr>
              <th colspan="3" class="meta-bar-cell text-left">
                वयोगट :- सर्व वयोगट / मुले व मुली
              </th>
              <th colspan="4" class="meta-bar-cell text-center" style="color: #b45309;">
                खेळ प्रकार :- सर्व मैदानी व धावणे स्पर्धा (भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी, उंच उडी)
              </th>
              <th colspan="2" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>
            <tr>
              <th class="col-header" style="width: 5%;">अ.क्र.</th>
              <th class="col-header" style="width: 24%;">विद्यार्थ्याचे नाव</th>
              <th class="col-header" style="width: 15%;">मैदानी खेळ / इव्हेंट</th>
              <th class="col-header" style="width: 7%;">इयत्ता</th>
              <th class="col-header" style="width: 9%;">ज.रजि.नं.</th>
              <th class="col-header" style="width: 11%;">जन्म तारीख</th>
              <th class="col-header" style="width: 11%;">आईचे नाव</th>
              <th class="col-header" style="width: 12%;">आधार कार्ड नं.</th>
              <th class="col-header" style="width: 6%;">सही</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- FOOTER SIGNATURE SECTION -->
        <div class="footer-sign-section">
          <div class="sign-box">
            <br/><br/>
            <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
          </div>
          <div class="sign-box">
            <br/><br/>
            <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
            <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(शा. मा. आ. शाळा वाघांबा)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Base CSS for Printable Sheet
  const getPrintStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
    
    @media print {
      @page {
        size: A4 landscape;
        margin: 0.5cm;
      }
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .official-outer-box {
        border: 2px solid #000000 !important;
        box-shadow: none !important;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
      color: #000000;
      background-color: #f8fafc;
      margin: 0;
      padding: 10px;
      font-size: 10.5pt;
      line-height: 1.25;
    }

    .print-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn {
      cursor: pointer;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11pt;
      border: none;
      transition: all 0.2s;
    }

    .btn-close {
      background: #334155;
      color: white;
    }

    .btn-print {
      background: #f59e0b;
      color: #020617;
    }

    .page-container {
      max-width: 1100px;
      margin: 45px auto 20px auto;
    }

    .sheet-page {
      margin-bottom: 30px;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .official-outer-box {
      background: #ffffff;
      border: 2px solid #000000;
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    .official-outer-box td, 
    .official-outer-box th {
      border: 1px solid #000000;
      padding: 4px 5px;
      vertical-align: middle;
    }

    .header-line-1 {
      font-size: 13.5pt;
      font-weight: 900 !important;
      text-align: center;
      padding: 5px 4px;
      background: #ffffff;
      letter-spacing: 0.3px;
    }

    .header-line-2 {
      font-size: 12pt;
      font-weight: 800 !important;
      text-align: center;
      padding: 4px 4px;
      background: #ffffff;
    }

    .header-line-3 {
      font-size: 11.5pt;
      font-weight: 800 !important;
      text-align: center;
      padding: 4px 4px;
      background: #ffffff;
    }

    .meta-bar-cell {
      font-size: 10.5pt;
      font-weight: 900 !important;
      padding: 5px 8px;
    }

    .col-header {
      font-size: 10pt;
      font-weight: 900 !important;
      text-align: center;
      background: #ffffff;
      padding: 5px 3px;
    }

    .official-outer-box tbody td,
    .font-normal {
      font-weight: 400 !important;
      font-size: 10pt;
    }

    .text-center {
      text-align: center;
    }

    .text-left {
      text-align: left;
      padding-left: 6px !important;
    }

    .footer-sign-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 10pt;
      font-weight: 800;
    }

    .sign-box {
      text-align: center;
      min-width: 220px;
    }
  `;

  // Print Active Sheet
  const handlePrintActiveSheet = () => {
    // If user is in Consolidated Athletics view, print the consolidated sheet
    if (isConsolidatedAthleticsView) {
      handlePrintConsolidatedAthletics();
      return;
    }

    const content = generateSingleSheetTableHtml(customAgeGroup, activeRows, false);
    const limitNotice = is12PlayersOnly ? `(फक्त पहिले १२ खेळाडू - Official Squad)` : '';

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportName} - ${customAgeGroup} (${academicYear}) - अधिकृत क्रीडा स्पर्धा शीट</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              ${sportName} &bull; ${customAgeGroup} (${academicYear}) ${limitNotice}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (Print or Save PDF)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Print ALL 6 Athletics Events together on a single consolidated printable sheet:
  // Javelin Throw, Disc Throw, Shot Put, Running, Long Jump, High Jump
  const handlePrintConsolidatedAthletics = () => {
    const rows = athleticsConsolidatedRows.length > 0 
      ? athleticsConsolidatedRows 
      : buildConsolidatedAthleticsRows();

    const content = generateConsolidatedAthleticsSheetHtml(rows);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>सर्व मैदानी स्पर्धा एकत्रित अधिकृत प्रवेश पत्र - भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी, उंच उडी (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              🏃 सर्व मैदानी व धावणे स्पर्धा एकत्रित अधिकृत शीट (${rows.length} खेळाडू) &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ एकत्रित मैदानी शीट प्रिंट (Print Athletics Sheet)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Print ALL 6 categories on separate A4 sheets with page breaks
  const handlePrintAllCategories = () => {
    const sheetsHtml = OFFICIAL_CATEGORIES.map(catDef => {
      const catRows = categorySheets[catDef.key] || [];
      return generateSingleSheetTableHtml(catDef.labelMr, catRows, true);
    }).join('');

    const limitNotice = is12PlayersOnly ? `(प्रत्येक शीटवर १२ खेळाडू मर्यादा)` : '';

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportName} - सर्व ६ वयोगट स्वतंत्र शीट (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              ${sportName} &bull; सर्व ६ वयोगट (14/17/19 मुले व मुली स्वतंत्र शीट) ${limitNotice}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ सर्व शीट प्रिंट करा (Print All A4 Sheets)</button>
          </div>
          <div class="page-container">
            ${sheetsHtml}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Helper to extract 12 boys and 12 girls for a specific sport (Strictly Underwise)
  const getSportBoysAndGirls12Squads = useCallback((targetSportKey: string, targetAgeType?: 'U14' | 'U17' | 'U19') => {
    const allStorePlayers: any[] = store?.data?.players || [];
    const sportMr = SPORT_MARATHI_MAP[targetSportKey] || targetSportKey;
    const isTargetAthletics = ATHLETICS_DISCIPLINES.includes(targetSportKey);

    const activeCatDef = OFFICIAL_CATEGORIES.find(c => c.key === activeCategoryKey);
    const resolvedAgeType: 'U14' | 'U17' | 'U19' = targetAgeType || (activeCatDef?.ageType as 'U14' | 'U17' | 'U19') || 'U14';

    const filterAndScore = (genderType: 'Male' | 'Female') => {
      let pool = allStorePlayers.filter((p: any) => {
        const studentCat = getStudentUnderCategory(p);
        if (studentCat.ageType !== resolvedAgeType) return false;
        return genderType === 'Female' ? studentCat.gender === 'Female' : studentCat.gender === 'Male';
      });

      const scored = pool.map(p => {
        const skillInfo = getPlayerSkillMarksAndRank(p, targetSportKey, store);
        const isInSport = Boolean(
          p.sports && Array.isArray(p.sports) && (p.sports.includes(targetSportKey) || (isTargetAthletics && p.sports.includes('Athletics')))
        );
        return {
          ...p,
          skillScoreNum: skillInfo.score,
          skillScoreDisplay: skillInfo.scoreDisplay,
          hasSkillMark: skillInfo.hasMark,
          isInSport
        };
      });

      const withMarks = scored.filter(p => p.hasSkillMark && (p.isInSport || isTargetAthletics));
      withMarks.sort((a, b) => b.skillScoreNum - a.skillScoreNum);

      const withoutMarks = scored.filter(p => !p.hasSkillMark && (p.isInSport || isTargetAthletics));
      withoutMarks.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

      const otherEligible = scored.filter(p => !p.isInSport && !isTargetAthletics);
      otherEligible.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

      let finalList = [...withMarks, ...withoutMarks];
      if (finalList.length < 12) {
        finalList = [...finalList, ...otherEligible.slice(0, 12 - finalList.length)];
      }

      return finalList.slice(0, 12).map((p, idx) => {
        const row = playerToSheetRow(p, idx);
        return {
          ...row,
          srNo: String(idx + 1),
          sportOrEvent: sportMr,
          schoolName: schoolName || DEFAULT_SCHOOL_MR,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          ageCategoryLabel: getPlayerAgeCategoryLabel(p, genderType),
          gender: genderType
        };
      });
    };

    const boysRows = filterAndScore('Male');
    const girlsRows = filterAndScore('Female');
    const boysCatLabel = resolvedAgeType === 'U14' ? '१४ वर्षाखालील मुले' : resolvedAgeType === 'U17' ? '१७ वर्षाखालील मुले' : '१९ वर्षाखालील मुले';
    const girlsCatLabel = resolvedAgeType === 'U14' ? '१४ वर्षाखालील मुली' : resolvedAgeType === 'U17' ? '१७ वर्षाखालील मुली' : '१९ वर्षाखालील मुली';
    const combinedCatLabel = resolvedAgeType === 'U14' ? '१४ वर्षाखालील' : resolvedAgeType === 'U17' ? '१७ वर्षाखालील' : '१९ वर्षाखालील';

    return { 
      boysRows, 
      girlsRows, 
      sportMr, 
      ageType: resolvedAgeType,
      boysCatLabel,
      girlsCatLabel,
      combinedCatLabel
    };
  }, [store, playerToSheetRow, schoolName, activeCategoryKey]);

  // Master Tournament Unique Players Calculation:
  // "dont add in the list same student in the same porpose that list is the i want to know how many plyer are going to play"
  const getUniqueTournamentPlayersData = useMemo(() => {
    const tournamentSports = [
      'Kabaddi',
      'Kho Kho',
      'Volleyball',
      'Handball',
      'Running',
      'Long Jump',
      'Shot Put',
      'Javelin Throw'
    ];

    const seenPlayerKeys = new Set<string>();
    const uniqueBoys: SheetRow[] = [];
    const uniqueGirls: SheetRow[] = [];
    const playerSportsMap = new Map<string, Set<string>>();

    tournamentSports.forEach(spKey => {
      const { boysRows, girlsRows } = getSportBoysAndGirls12Squads(spKey);
      const spMr = SPORT_MARATHI_MAP[spKey] || spKey;

      [...boysRows, ...girlsRows].forEach(p => {
        const key = p.id || p.grNo || p.studentName;
        if (!key || p.studentName === '-- या वयोगटासाठी खेळाडू यादी उपलब्ध नाही --' || !p.studentName.trim()) return;

        if (!playerSportsMap.has(key)) {
          playerSportsMap.set(key, new Set());
        }
        playerSportsMap.get(key)!.add(spMr);

        if (!seenPlayerKeys.has(key)) {
          seenPlayerKeys.add(key);
          const isGirl = p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली'));
          if (isGirl) {
            uniqueGirls.push(p);
          } else {
            uniqueBoys.push(p);
          }
        }
      });
    });

    const allStorePlayers: any[] = store?.data?.players || [];
    allStorePlayers.forEach(p => {
      if (p.category === 'athlete') {
        const key = p.id || p.generalRegisterNumber || p.nameMarathi || p.name;
        if (!key || seenPlayerKeys.has(key)) return;
        seenPlayerKeys.add(key);
        const isGirl = p.gender === 'Female' || p.gender === 'मुली' || p.gender === 'female' || p.gender === 'F';
        const row = playerToSheetRow(p, 0);
        const sportMr = (p.sports && Array.isArray(p.sports) && p.sports.length > 0)
          ? p.sports.map((s: string) => SPORT_MARATHI_MAP[s] || s).join(', ')
          : (SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey);

        const filledRow: SheetRow = {
          ...row,
          sportOrEvent: sportMr,
          schoolName: schoolName || DEFAULT_SCHOOL_MR,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          ageCategoryLabel: isGirl ? 'मुली' : 'मुले',
          gender: isGirl ? 'Female' : 'Male'
        };

        if (isGirl) {
          uniqueGirls.push(filledRow);
        } else {
          uniqueBoys.push(filledRow);
        }
      }
    });

    uniqueBoys.sort((a, b) => (parseInt(a.std.replace(/\D/g, '') || '0') - parseInt(b.std.replace(/\D/g, '') || '0')) || a.studentName.localeCompare(b.studentName));
    uniqueGirls.sort((a, b) => (parseInt(a.std.replace(/\D/g, '') || '0') - parseInt(b.std.replace(/\D/g, '') || '0')) || a.studentName.localeCompare(b.studentName));

    const combinedUnique: SheetRow[] = [];
    uniqueBoys.forEach((b, idx) => {
      const key = b.id || b.grNo || b.studentName;
      const games = playerSportsMap.get(key);
      const gameStr = games && games.size > 0 ? Array.from(games).join(', ') : b.sportOrEvent;
      const catLabel = getPlayerAgeCategoryLabel(b, 'Male');
      const resolved = resolveStudentDetails(b, gameStr, catLabel);

      combinedUnique.push({
        ...b,
        srNo: String(idx + 1),
        studentName: resolved.studentName || b.studentName,
        grNo: resolved.grNo || b.grNo || '-',
        dob: resolved.dob || b.dob || '-',
        motherName: (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (b.motherName || '-')),
        aadhar: (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (b.aadhar || '-')),
        sportOrEvent: gameStr,
        ageCategoryLabel: resolved.ageCategoryLabel || catLabel
      });
    });

    const boysOffset = uniqueBoys.length;
    uniqueGirls.forEach((g, idx) => {
      const key = g.id || g.grNo || g.studentName;
      const games = playerSportsMap.get(key);
      const gameStr = games && games.size > 0 ? Array.from(games).join(', ') : g.sportOrEvent;
      const catLabel = getPlayerAgeCategoryLabel(g, 'Female');
      const resolved = resolveStudentDetails(g, gameStr, catLabel);

      combinedUnique.push({
        ...g,
        srNo: String(boysOffset + idx + 1),
        studentName: resolved.studentName || g.studentName,
        grNo: resolved.grNo || g.grNo || '-',
        dob: resolved.dob || g.dob || '-',
        motherName: (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (g.motherName || '-')),
        aadhar: (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (g.aadhar || '-')),
        sportOrEvent: gameStr,
        ageCategoryLabel: resolved.ageCategoryLabel || catLabel
      });
    });

    return {
      uniquePlayers: combinedUnique,
      summary: {
        total: combinedUnique.length,
        boys: uniqueBoys.length,
        girls: uniqueGirls.length
      }
    };
  }, [store, getSportBoysAndGirls12Squads, playerToSheetRow, schoolName, selectedSportKey]);

  // Metadata for Excel Export
  const getExcelMetadata = (): TournamentExcelMetadata => ({
    departmentName,
    projectName,
    schoolName,
    sportName,
    selectedSportKey,
    academicYear,
    teacherName: store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक",
    uDise: DEFAULT_UDISE,
    taluka: DEFAULT_TALUKA
  });

  // Export Active Sheet to Excel (.xlsx)
  const handleExportActiveSheetExcel = () => {
    if (isConsolidatedAthleticsView) {
      handleExportConsolidatedAthleticsExcel();
      return;
    }
    const meta = getExcelMetadata();
    exportSingleCategoryToExcel(customAgeGroup, activeRows, meta);
  };

  // Export 12 Players for Selected Sport: First Boys, then Girls (.xlsx)
  const handleExportGame12BoysGirlsExcel = () => {
    const meta = getExcelMetadata();
    const { boysRows, girlsRows } = getSportBoysAndGirls12Squads(selectedSportKey);
    exportGame12PlayersBoysGirlsExcel(selectedSportKey, boysRows, girlsRows, meta);
  };

  // Print 12 Players for Selected Sport: First Boys, then Girls
  const handlePrintGame12BoysGirls = () => {
    const { boysRows, girlsRows, sportMr } = getSportBoysAndGirls12Squads(selectedSportKey);
    const content = generateGame12BoysGirlsHtml(sportMr, boysRows, girlsRows);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - १२ खेळाडू संघ (प्रथम मुले, नंतर मुली) (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              ${sportMr} &bull; १२ खेळाडू संघ (प्रथम मुले, नंतर मुली) &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ १२ खेळाडू शीट प्रिंट करा (Print 12 Squad)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Export 12 Boys Only for Selected Sport (.xlsx)
  const handleExport12BoysOnlyExcel = () => {
    const meta = getExcelMetadata();
    const { boysRows } = getSportBoysAndGirls12Squads(selectedSportKey);
    exportBoysOnly12Excel(selectedSportKey, boysRows, meta);
  };

  // Export 12 Girls Only for Selected Sport (.xlsx)
  const handleExport12GirlsOnlyExcel = () => {
    const meta = getExcelMetadata();
    const { girlsRows } = getSportBoysAndGirls12Squads(selectedSportKey);
    exportGirlsOnly12Excel(selectedSportKey, girlsRows, meta);
  };

  // Print 12 Boys Only for Selected Sport
  const handlePrint12BoysOnly = () => {
    const { boysRows, sportMr } = getSportBoysAndGirls12Squads(selectedSportKey);
    const content = generate12BoysOnlyHtml(sportMr, boysRows);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - १२ मुले संघ (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              👦 ${sportMr} &bull; १२ मुले संघ &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ १२ मुले संघ प्रिंट करा (Print 12 Boys)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Print 12 Girls Only for Selected Sport
  const handlePrint12GirlsOnly = () => {
    const { girlsRows, sportMr } = getSportBoysAndGirls12Squads(selectedSportKey);
    const content = generate12GirlsOnlyHtml(sportMr, girlsRows);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - १२ मुली संघ (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              👧 ${sportMr} &bull; १२ मुली संघ &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ १२ मुली संघ प्रिंट करा (Print 12 Girls)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Export EVERY GAME 12 Players Workbook (.xlsx)
  const handleExportEveryGame12BoysGirlsExcel = () => {
    const meta = getExcelMetadata();
    const games = ['Kabaddi', 'Kho Kho', 'Volleyball', 'Handball'];
    const sportsData = games.map(gKey => {
      const { boysRows, girlsRows, sportMr } = getSportBoysAndGirls12Squads(gKey);
      return {
        sportKey: gKey,
        sportNameMr: sportMr,
        boysRows,
        girlsRows
      };
    });
    exportEveryGame12PlayersWorkbookToExcel(sportsData, meta);
  };

  // Print EVERY GAME 12 Players (Boys then Girls) with page breaks
  const handlePrintEveryGame12BoysGirls = () => {
    const gamesToPrint = ['Kabaddi', 'Kho Kho', 'Volleyball', 'Handball'];
    const sheetsHtml = gamesToPrint.map(gKey => {
      const { boysRows, girlsRows, sportMr } = getSportBoysAndGirls12Squads(gKey);
      return `<div class="page-break">${generateGame12BoysGirlsHtml(sportMr, boysRows, girlsRows)}</div>`;
    }).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>सर्व खेळ - १२ खेळाडू संघ (मुले व मुली) (${academicYear})</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              सर्व खेळ &bull; १२ खेळाडू संघ (कबड्डी, खो-खो, व्हॉलीबॉल, हॅन्डबॉल) &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ सर्व खेळ प्रिंट करा (Print All Games)</button>
          </div>
          <div class="page-container">
            ${sheetsHtml}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Export UNIQUE Tournament Players to Excel (.xlsx)
  const handleExportUniqueTournamentPlayersExcel = () => {
    const meta = getExcelMetadata();
    const { uniquePlayers, summary } = getUniqueTournamentPlayersData;
    exportUniqueTournamentPlayersExcel(uniquePlayers, meta, summary);
  };

  // Print UNIQUE Tournament Players List (Deduplicated, First Boys then Girls)
  const handlePrintUniqueTournamentPlayers = () => {
    const { uniquePlayers, summary } = getUniqueTournamentPlayersData;
    const content = generateUniquePlayersSheetHtml(uniquePlayers, summary);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>शालेय क्रीडा स्पर्धा सन ${academicYear} - एकूण ${summary.total} सहभागी खेळाडू मास्टर यादी</title>
          <meta charset="utf-8" />
          <style>${getPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 11pt; color: #f8fafc;">
              🎯 एकूण सहभागी खेळाडू: ${summary.total} (मुले: ${summary.boys} | मुली: ${summary.girls}) &bull; सन ${academicYear}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ मास्टर खेळाडू यादी प्रिंट (Print Master)</button>
          </div>
          <div class="page-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Export Consolidated Athletics to Excel (.xlsx)
  const handleExportConsolidatedAthleticsExcel = () => {
    const meta = getExcelMetadata();
    const rows = athleticsConsolidatedRows.length > 0 
      ? athleticsConsolidatedRows 
      : buildConsolidatedAthleticsRows();
    exportConsolidatedAthleticsToExcel(rows, meta);
  };

  // Export All 6 Categories as Multi-Sheet Excel Workbook (.xlsx)
  const handleExportAllCategoriesExcel = () => {
    const meta = getExcelMetadata();
    exportAllCategoriesWorkbookToExcel(categorySheets, meta);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[96vw] max-w-7xl max-h-[94vh] flex flex-col p-3 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 shadow-3xl overflow-y-auto overscroll-contain touch-pan-y">
          {/* Header */}
          <DialogHeader className="shrink-0 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md z-30">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-500" />
                अधिकृत क्रीडा स्पर्धा शीट (Official Tournament Entry Sheet)
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  आदिवासी विकास विभाग &bull; Skill Hub कौशल्य गुण व रँकिंगनुसार खेळाडू यादी
                </span>
                {is12PlayersOnly && !isConsolidatedAthleticsView && (
                  <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5">
                    ⚡ संघ मर्यादा: १२ खेळाडू (Top 12 Squad)
                  </Badge>
                )}
                {lastSyncStatus && (
                  <Badge className="bg-emerald-600 text-white font-black text-[10px] animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {lastSyncStatus}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAthleticsSport && (
                <Button
                  onClick={handlePrintConsolidatedAthletics}
                  className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-1.5 border-none"
                  title="भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी, उंच उडी सर्व खेळाडू एकाच शीटवर प्रिंट करा"
                >
                  <Medal className="w-4 h-4 text-amber-300" />
                  🏃 सर्व ६ मैदानी खेळ एकत्रित प्रिंट
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="h-9 rounded-xl font-bold text-xs gap-1.5 border-primary/20 bg-white"
              >
                <Settings2 className="w-4 h-4 text-primary" />
                {showConfig ? "माहिती लपवा" : "शीर्षक संपादन (Edit Headers)"}
              </Button>

              {/* Excel Export Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2 border-none"
                    title="स्पर्धा शीट एक्सेल (.xlsx) फॉरमॅटमध्ये डाउनलोड करा"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                    📊 एक्सेल डाउनलोड (Excel)
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-2">
                  <DropdownMenuLabel className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    एक्सेल एक्सपोर्ट पर्याय (.xlsx)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleExportActiveSheetExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        चालू शीट एक्सेल डाउनलोड
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {isConsolidatedAthleticsView ? 'सर्व मैदानी खेळ एकत्र' : customAgeGroup} ({activeRows.length} खेळाडू)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExport12BoysOnlyExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-blue-600" />
                        👦 १२ मुले संघ एक्सेल (.xlsx)
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} फक्त १२ मुले अधिकृत संघ (.xlsx)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExport12GirlsOnlyExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-pink-50 focus:bg-pink-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-pink-600" />
                        👧 १२ मुली संघ एक्सेल (.xlsx)
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} फक्त १२ मुली अधिकृत संघ (.xlsx)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportGame12BoysGirlsExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        👥 १२ मुले + १२ मुली (३ टॅब WorkBook)
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} (टॅब १: मुले व मुली, टॅब २: मुले, टॅब ३: मुली)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportEveryGame12BoysGirlsExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-purple-50 focus:bg-purple-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        🏆 सर्व खेळ १२ खेळाडू एक्सेल वर्कबुक
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        कबड्डी, खो-खो, व्हॉलीबॉल, हॅन्डबॉल १२ मुले व मुली
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportUniqueTournamentPlayersExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                        🎯 एकूण सहभागी खेळाडू मास्टर यादी एक्सेल
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        अद्वितीय मुले व मुली ({getUniqueTournamentPlayersData.summary.total} खेळाडू) - नो डुप्लिकेट
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportAllCategoriesExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        सर्व ६ वयोगट एक्सेल वर्कबुक
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        14/17/19 मुले व मुली सर्व शीट स्वतंत्र टॅबमध्ये
                      </span>
                    </div>
                  </DropdownMenuItem>

                  {isAthleticsSport && (
                    <DropdownMenuItem
                      onClick={handleExportConsolidatedAthleticsExcel}
                      className="p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Medal className="w-3.5 h-3.5 text-amber-600" />
                          सर्व ६ मैदानी खेळ एकत्र एक्सेल
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब व उंच उडी
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 12 Players Print Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-10 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-1.5 border-none"
                    title="१२ खेळाडू संघ प्रिंट पर्याय (मुले / मुली / एकत्र)"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    👥 १२ खेळाडू प्रिंट ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-2">
                  <DropdownMenuLabel className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    १२ खेळाडू प्रिंट पर्याय
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handlePrint12BoysOnly}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        👦 फक्त १२ मुले संघ प्रिंट
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} - १२ मुलांचे अधिकृत पत्र
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePrint12GirlsOnly}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-pink-50 focus:bg-pink-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-pink-600" />
                        👧 फक्त १२ मुली संघ प्रिंट
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} - १२ मुलींचे अधिकृत पत्र
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePrintGame12BoysGirls}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-amber-600" />
                        👥 १२ मुले व १२ मुली एकत्र प्रिंट
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} - प्रथम मुले नंतर मुली
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePrintEveryGame12BoysGirls}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-purple-50 focus:bg-purple-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        🏆 सर्व खेळ १२ खेळाडू प्रिंट (All Games)
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        कबड्डी, खो-खो, व्हॉलीबॉल, हॅन्डबॉल सर्व पाने
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handlePrintActiveSheet}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-1.5"
                title="फक्त सध्या निवडलेला गट प्रिंट करा"
              >
                <Printer className="w-4 h-4" />
                🖨️ चालू शीट प्रिंट
              </Button>

              <Button
                onClick={handlePrintUniqueTournamentPlayers}
                className="h-10 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-700 hover:bg-indigo-800 text-white shadow-md gap-1.5 border-none"
                title="सर्व खेळ मिळून खेळणारे एकूण अद्वितीय खेळाडू प्रिंट करा"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                🎯 एकूण खेळाडू ({getUniqueTournamentPlayersData.summary.total})
              </Button>

              <Button
                onClick={handlePrintAllCategories}
                variant="outline"
                className="h-10 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-900 hover:bg-blue-950 text-white shadow-md gap-1.5 border-none"
                title="१४/१७/१९ मुले व मुली सर्व शीट स्वतंत्र पानांवर प्रिंट करा"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                📑 सर्व ६ गट प्रिंट
              </Button>
            </div>
          </DialogHeader>

          {/* Config Accordion / Edit Top Headers if toggled */}
          {showConfig && (
            <div className="shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm my-2 space-y-3 animate-in fade-in">
              <div className="text-xs font-black uppercase text-primary tracking-wider">
                शासकीय व संस्थात्मक शीर्षक माहिती (Official Header Settings)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">पहिली ओळ (Department Line 1):</label>
                  <Input 
                    value={departmentName} 
                    onChange={(e) => setDepartmentName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">दुसरी ओळ (Project Line 2):</label>
                  <Input 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">तिसरी ओळ (School Line 3):</label>
                  <Input 
                    value={schoolName} 
                    onChange={(e) => setSchoolName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Top Discipline & Year Row */}
          <div className="shrink-0 bg-white dark:bg-slate-800 p-3 rounded-2xl border shadow-sm my-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-primary flex items-center justify-between">
                <span>खेळ प्रकार (Select Sport / Field Event)</span>
                <span className="text-muted-foreground font-semibold">कबड्डी, व्हॉलीबॉल, खो खो, हॅन्डबॉल, भालाफेक, लांब उडी, गोळाफेक इ.</span>
              </label>
              <div className="flex gap-2">
                <Select 
                  value={selectedSportKey} 
                  onValueChange={(val) => {
                    setSelectedSportKey(val);
                    setSportName(SPORT_MARATHI_MAP[val] || val);
                    setIsConsolidatedAthleticsView(false);
                    initializeCategorySheets(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs font-bold w-full bg-slate-50 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SPORT_MARATHI_MAP).map((k) => (
                      <SelectItem key={k} value={k} className="text-xs font-bold">
                        {SPORT_MARATHI_MAP[k]} ({k})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  value={sportName} 
                  onChange={(e) => setSportName(e.target.value)} 
                  placeholder="खेळ नाव" 
                  className="h-9 text-xs font-bold w-44"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-primary">शैक्षणिक वर्ष (Academic Year)</label>
              <Input 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)} 
                placeholder="उदा. 2026-27" 
                className="h-9 text-xs font-bold bg-slate-50"
              />
            </div>
          </div>

          {/* ATHLETICS MODE SWITCHER IF ONE OF 6 ATHLETICS DISCIPLINES */}
          {isAthleticsSport && (
            <div className="shrink-0 bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-emerald-300 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-slate-900">
                    मैदानी स्पर्धा पर्याय (Track & Field Events Mode):
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी, उंच उडी सर्व खेळाडू एकत्रित किंवा स्वतंत्र शीट
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isConsolidatedAthleticsView ? "default" : "outline"}
                  onClick={() => setIsConsolidatedAthleticsView(true)}
                  className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                    isConsolidatedAthleticsView 
                      ? 'bg-emerald-700 text-white shadow-sm' 
                      : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <Medal className="w-3.5 h-3.5" />
                  🏃 सर्व ६ खेळ एकत्रित शीट ({athleticsConsolidatedRows.length} खेळाडू)
                </Button>

                <Button
                  size="sm"
                  variant={!isConsolidatedAthleticsView ? "default" : "outline"}
                  onClick={() => setIsConsolidatedAthleticsView(false)}
                  className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                    !isConsolidatedAthleticsView 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  🎯 फक्त {sportName} शीट
                </Button>
              </div>
            </div>
          )}

          {/* TOURNAMENT TOTAL UNIQUE PLAYERS SUMMARY BAR */}
          <div className="shrink-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-indigo-200 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs my-1">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="text-xs font-black text-slate-900 flex flex-wrap items-center gap-2">
                  <span>स्पर्धेत खेळणारे एकूण अद्वितीय खेळाडू:</span>
                  <Badge className="bg-indigo-600 text-white font-black text-xs px-2.5 py-0.5">
                    {getUniqueTournamentPlayersData.summary.total} खेळाडू
                  </Badge>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    👦 मुले: {getUniqueTournamentPlayersData.summary.boys}
                  </span>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                    👧 मुली: {getUniqueTournamentPlayersData.summary.girls}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  कोणत्याही विद्यार्थ्याची पुनरावृत्ती नाही (प्रथम मुले, नंतर मुली) &bull; यु-डायस: {DEFAULT_UDISE} &bull; तालुका: {DEFAULT_TALUKA}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportUniqueTournamentPlayersExcel}
                className="h-8 rounded-xl text-xs font-black bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-300 gap-1.5 shadow-xs"
                title="एकूण सहभागी विद्यार्थ्यांची अद्वितीय यादी एक्सेलमध्ये डाउनलोड करा"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                📊 अद्वितीय खेळाडू एक्सेल
              </Button>
              <Button
                size="sm"
                onClick={handlePrintUniqueTournamentPlayers}
                className="h-8 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                title="एकूण सहभागी विद्यार्थ्यांची अद्वितीय यादी प्रिंट करा"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-200" />
                🖨️ अद्वितीय खेळाडू प्रिंट
              </Button>
            </div>
          </div>

          {/* CATEGORY SELECTOR PILLS - Disabled in consolidated athletics mode */}
          {!isConsolidatedAthleticsView && (
            <div className="shrink-0 bg-slate-100/90 dark:bg-slate-800/80 p-2 rounded-2xl border shadow-inner">
              <div className="text-[10px] font-black uppercase text-slate-500 mb-1.5 px-1 flex items-center justify-between">
                <span>🎯 वयोगट व लिंग निवडा (Select Category & Gender):</span>
                <span className="text-primary font-black">प्रत्येक वयोगट व मुला-मुलींसाठी स्वतंत्र शीट</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {OFFICIAL_CATEGORIES.map(cat => {
                  const isSelected = activeCategoryKey === cat.key;
                  const count = (categorySheets[cat.key] || []).length;
                  const isGirl = cat.gender === 'Female';

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`h-11 px-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-between border-2 shadow-xs ${
                        isSelected
                          ? isGirl
                            ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400/40 shadow-md scale-[1.02]'
                            : 'bg-blue-700 text-white border-blue-800 ring-2 ring-blue-400/40 shadow-md scale-[1.02]'
                          : isGirl
                            ? 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100'
                            : 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <span className="truncate">{cat.badge}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-900 shadow-2xs'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Category Information Banner */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 py-1 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">चालू शीट:</span>
              <Input
                value={isConsolidatedAthleticsView ? "सर्व मैदानी खेळ एकत्रित" : customAgeGroup}
                onChange={(e) => setCustomAgeGroup(e.target.value)}
                disabled={isConsolidatedAthleticsView}
                className="h-8 text-xs font-black text-primary w-48 bg-white border-primary/30"
              />
              <Badge variant="outline" className="font-bold text-xs bg-white">
                एकूण खेळाडू: {activeRows.length}
              </Badge>
              {is12PlayersOnly && !isConsolidatedAthleticsView && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  प्रिंटमध्ये फक्त पहिले १२ खेळाडू येतील
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportActiveSheetExcel}
                className="h-8 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 gap-1 shadow-xs"
                title="चालू शीट थेट एक्सेल (.xlsx) फाईलमध्ये डाउनलोड करा"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> 📊 एक्सेल (.xlsx)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={addBlankRow}
                className="h-8 rounded-lg text-xs font-bold bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> + खेळाडू ओळ
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="h-8 rounded-lg text-xs font-bold bg-white text-blue-700 border-blue-300 hover:bg-blue-50 gap-1 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> 👥 रोस्टरमधून जोडा
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={sortBySkillHubRanking}
                className="h-8 rounded-lg text-xs font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 gap-1 shadow-sm"
                title="Skill Hub कौशल्य गुणांनुसार खेळाडू रँकिंग क्रमाने लावा"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" /> ⭐ गुण रँकिंगनुसार लावा
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={autoRenumber}
                className="h-8 rounded-lg text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-100 gap-1 shadow-sm"
                title="सर्व खेळाडूंना १ ते N असा नवीन अनुक्रमांक द्या"
              >
                <Hash className="w-3.5 h-3.5" /> १, २, ३... क्रम लावा
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={sortBySrNo}
                className="h-8 rounded-lg text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-100 gap-1 shadow-sm"
                title="अ.क्र. नुसार खेळाडू चढत्या क्रमाने लावा"
              >
                🔢 अ.क्र. सॉर्ट
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetCurrentCategory}
                className="h-8 text-xs font-bold text-muted-foreground hover:text-destructive gap-1"
                title="चालू यादी पूर्ववत करा"
              >
                <RotateCcw className="w-3.5 h-3.5" /> रीसेट
              </Button>
            </div>
          </div>

          {/* Interactive Editable Table for Active Category */}
          <div className="w-full flex-1 min-h-[260px] max-h-[58vh] overflow-x-auto overflow-y-auto rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white shadow-inner touch-pan-x touch-pan-y overscroll-contain">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 text-slate-900 dark:text-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="p-2 text-center w-28 border-r font-black">अनु. क्र. (Sr No)</th>
                  <th className="p-2 border-r min-w-[190px] font-black">खेळाडूचे पूर्ण नाव</th>
                  <th className="p-2 text-center w-20 border-r font-black">इयत्ता (Std)</th>
                  <th className="p-2 text-center w-24 border-r font-black">ज.रजि.नं. (GR)</th>
                  <th className="p-2 text-center w-28 border-r font-black">जन्मतारीख (DOB)</th>
                  <th className="p-2 text-center w-28 border-r font-black">आईचे नाव (Mother)</th>
                  <th className="p-2 text-center w-36 border-r font-black">आधार क्र. (Aadhaar)</th>
                  <th className="p-2 text-center min-w-[170px] border-r font-black">शाळेचे नाव</th>
                  <th className="p-2 text-center w-32 border-r font-black text-amber-700">यु-डायस क्र.</th>
                  <th className="p-2 text-center w-24 border-r font-black text-blue-800">तालुका</th>
                  <th className="p-2 text-center w-28 border-r font-black">वयोगट</th>
                  <th className="p-2 text-center min-w-[140px] border-r font-black text-emerald-800">खेळाचा प्रकार</th>
                  <th className="p-2 text-center w-28 border-r font-black">कौशल्य गुण / रँक</th>
                  <th className="p-2 text-center w-16 font-black">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-normal">
                {activeRows.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-12 text-muted-foreground font-normal">
                      या वयोगटासाठी Skill Hub मध्ये गुण नोंदवलेले खेळाडू आढळले नाहीत. वरील &quot;+ खेळाडू ओळ&quot; किंवा &quot;👥 रोस्टरमधून जोडा&quot; वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((row, index) => {
                    const isBeyond12 = is12PlayersOnly && !isConsolidatedAthleticsView && index >= 12;

                    return (
                      <tr key={row.id} className={`hover:bg-slate-50/80 transition-colors ${isBeyond12 ? 'bg-amber-50/30' : ''}`}>
                        {/* अनु. क्र. with quick edit input and Up/Down arrows */}
                        <td className="p-1.5 border-r text-center align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => moveRow(index, 'up')}
                                disabled={index === 0}
                                className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                                title="वर हलवा"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveRow(index, 'down')}
                                disabled={index === activeRows.length - 1}
                                className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                                title="खाली हलवा"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <Input
                              value={row.srNo}
                              onChange={(e) => updateRowField(index, 'srNo', e.target.value)}
                              className="h-8 w-14 text-center font-bold text-xs px-1 bg-amber-50 border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-500 shadow-xs"
                              title="अनुक्रमांक थेट बदला - बदल सेव्ह राहील"
                            />
                          </div>
                        </td>

                        {/* खेळाडूचे पूर्ण नाव */}
                        <td className="p-1.5 border-r">
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={row.studentName}
                              onChange={(e) => updateRowField(index, 'studentName', e.target.value)}
                              onBlur={() => handleRowBlur(index)}
                              className="h-8 text-xs font-normal text-slate-800 focus:bg-amber-50/40"
                              placeholder="खेळाडूचे पूर्ण नाव"
                            />
                            {isBeyond12 && (
                              <span className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.5 rounded shrink-0 whitespace-nowrap">
                                12 नंतरचा
                              </span>
                            )}
                          </div>
                        </td>

                        {/* इयत्ता */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.std}
                            onChange={(e) => updateRowField(index, 'std', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40 w-16 mx-auto"
                            placeholder="इयत्ता"
                          />
                        </td>

                        {/* जनरल रजिस्टर नं. */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.grNo}
                            onChange={(e) => updateRowField(index, 'grNo', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="GR No"
                          />
                        </td>

                        {/* जन्मतारीख */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.dob}
                            onChange={(e) => updateRowField(index, 'dob', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="DD.MM.YYYY"
                          />
                        </td>

                        {/* आईचे नाव */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.motherName}
                            onChange={(e) => updateRowField(index, 'motherName', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="आईचे नाव"
                          />
                        </td>

                        {/* आधार क्र. */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.aadhar}
                            onChange={(e) => updateRowField(index, 'aadhar', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40 font-mono"
                            placeholder="XXXX XXXX XXXX"
                          />
                        </td>

                        {/* शाळेचे नाव */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.schoolName || schoolName || DEFAULT_SCHOOL_MR}
                            onChange={(e) => updateRowField(index, 'schoolName', e.target.value)}
                            className="h-8 text-xs font-normal focus:bg-amber-50/40"
                            placeholder="शाळेचे नाव"
                          />
                        </td>

                        {/* यु-डायस क्रमांक (27200116503) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.uDise || DEFAULT_UDISE}
                            onChange={(e) => updateRowField(index, 'uDise', e.target.value)}
                            className="h-8 text-center text-xs font-mono font-bold text-amber-900 bg-amber-50/50"
                            placeholder="27200116503"
                          />
                        </td>

                        {/* तालुका (बागलाण) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.taluka || DEFAULT_TALUKA}
                            onChange={(e) => updateRowField(index, 'taluka', e.target.value)}
                            className="h-8 text-center text-xs font-bold text-blue-900 bg-blue-50/50"
                            placeholder="बागलाण"
                          />
                        </td>

                        {/* वयोगट */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.ageCategoryLabel || customAgeGroup}
                            onChange={(e) => updateRowField(index, 'ageCategoryLabel', e.target.value)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="उदा. 14 वर्षाखालील मुले"
                          />
                        </td>

                        {/* खेळाचा प्रकार */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.sportOrEvent || sportName}
                            onChange={(e) => updateRowField(index, 'sportOrEvent', e.target.value)}
                            className="h-8 text-center text-xs font-bold text-emerald-900 bg-emerald-50/50"
                            placeholder="खेळाचा प्रकार"
                          />
                        </td>

                        {/* कौशल्य गुण व रँक (Skill Hub Marks & Ranking) */}
                        <td className="p-1.5 border-r text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[11px] px-2 py-0.5">
                              {row.skillScore !== '-' ? `${row.skillScore}` : '-'}
                            </Badge>
                            {row.skillRank && (
                              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] px-1.5 py-0.5">
                                #{row.skillRank}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Delete Action */}
                        <td className="p-1.5 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRow(index)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="यादीतून काढा"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer controls */}
          <DialogFooter className="shrink-0 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md z-30">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                अ.क्र. (Sr No) थेट बदलता येतो. Skill Hub कौशल्य गुण व रँकिंगनुसार यादी तयार आहे.
                {is12PlayersOnly && !isConsolidatedAthleticsView && " सांघिक खेळांसाठी प्रिंटमध्ये १२ खेळाडू मर्यादा लागू असते."}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-xs h-10">
                रद्द करा (Close)
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
                    title="स्पर्धा शीट एक्सेल (.xlsx) फॉरमॅटमध्ये डाउनलोड करा"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" /> 📊 एक्सेल (.xlsx)
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-2">
                  <DropdownMenuLabel className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    एक्सेल एक्सपोर्ट (.xlsx)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleExportActiveSheetExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        चालू शीट एक्सेल डाउनलोड
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {isConsolidatedAthleticsView ? 'सर्व मैदानी खेळ एकत्र' : customAgeGroup} ({activeRows.length} खेळाडू)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportGame12BoysGirlsExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        १२ खेळाडू संघ (प्रथम मुले, नंतर मुली) एक्सेल
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {sportName} १२ मुले + १२ मुली संघ
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportEveryGame12BoysGirlsExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-purple-50 focus:bg-purple-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        सर्व खेळ १२ खेळाडू एक्सेल वर्कबुक
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        कबड्डी, खो-खो, व्हॉलीबॉल, हॅन्डबॉल
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportUniqueTournamentPlayersExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                        🎯 एकूण सहभागी खेळाडू मास्टर यादी एक्सेल
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        अद्वितीय मुले व मुली ({getUniqueTournamentPlayersData.summary.total} खेळाडू)
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportAllCategoriesExcel}
                    className="p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        सर्व ६ वयोगट एक्सेल वर्कबुक
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        14/17/19 मुले व मुली सर्व शीट स्वतंत्र टॅबमध्ये
                      </span>
                    </div>
                  </DropdownMenuItem>

                  {isAthleticsSport && (
                    <DropdownMenuItem
                      onClick={handleExportConsolidatedAthleticsExcel}
                      className="p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Medal className="w-3.5 h-3.5 text-amber-600" />
                          सर्व ६ मैदानी खेळ एकत्र एक्सेल
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब व उंच उडी
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handlePrintGame12BoysGirls}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-1.5"
                title="चालू खेळाचे १२ मुले व १२ मुली संघ प्रिंट करा"
              >
                <Trophy className="w-4 h-4 text-amber-300" /> 👥 १२ खेळाडू (मुले व मुली)
              </Button>

              <Button
                onClick={handlePrintActiveSheet}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-1.5"
              >
                <Printer className="w-4 h-4" /> चालू शीट प्रिंट
              </Button>

              <Button
                onClick={handlePrintUniqueTournamentPlayers}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-700 hover:bg-indigo-800 text-white shadow-md gap-1.5"
                title="सर्व खेळ मिळून खेळणारे एकूण अद्वितीय खेळाडू प्रिंट करा"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                🎯 एकूण खेळाडू ({getUniqueTournamentPlayersData.summary.total})
              </Button>

              <Button
                onClick={handlePrintAllCategories}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-900 hover:bg-blue-950 text-white shadow-md gap-1.5"
              >
                <Layers className="w-4 h-4 text-amber-400" /> सर्व ६ गट प्रिंट
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Dialog: Pick Student from School Master Roster */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5 rounded-3xl bg-white border-2 shadow-2xl overflow-y-auto overscroll-contain touch-pan-y">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-black text-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              शाळेच्या रोस्टरमधून खेळाडू निवडा (Select Student)
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="विद्यार्थ्याचे नाव, GR नंबर किंवा इयत्ता शोधा..."
              className="pl-9 h-10 text-xs font-bold rounded-xl"
            />
          </div>

          <div className="flex-1 min-h-[250px] max-h-[50vh] overflow-y-auto overscroll-contain touch-pan-y space-y-2 pr-1">
            {(() => {
              const allStudents: any[] = (store?.data?.players || []).filter((s: any) => s.category === 'athlete' || !s.category);

              const activeCatDef = OFFICIAL_CATEGORIES.find(c => c.key === activeCategoryKey);
              const targetGender = activeCatDef?.gender;

              const q = pickerSearch.trim().toLowerCase();
              const filtered = allStudents.filter((s: any) => {
                if (targetGender && !isConsolidatedAthleticsView) {
                  const isFem = s.gender === 'Female' || s.gender === 'मुली';
                  if (targetGender === 'Female' && !isFem) return false;
                  if (targetGender === 'Male' && isFem) return false;
                }

                if (!q) return true;
                const matchName = (s.name || '').toLowerCase().includes(q);
                const matchMar = (s.nameMarathi || '').includes(q);
                const matchGR = String(s.generalRegisterNumber || s.rollNo || s.serialNumber || '').includes(q);
                const matchStd = String(s.std || '').includes(q);
                return matchName || matchMar || matchGR || matchStd;
              }).slice(0, 30);

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10 text-muted-foreground font-bold text-xs">
                    कोणताही विद्यार्थी सापडला नाही.
                  </div>
                );
              }

              return filtered.map((s: any) => {
                const displayName = s.nameMarathi?.trim() || transliterateEnglishToMarathi(s.name) || s.name;
                const gr = s.generalRegisterNumber || s.rollNo || s.serialNumber || '-';
                const mother = s.motherName || '-';

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-slate-900 text-xs">{displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                        <span>इयत्ता: {s.std} वी</span>
                        <span>&bull;</span>
                        <span>लिंग: {s.gender === 'Female' ? 'मुली' : 'मुले'}</span>
                        <span>&bull;</span>
                        <span>GR: {gr}</span>
                        <span>&bull;</span>
                        <span>आई: {mother}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddFromStudentPicker(s)}
                      className="h-8 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> जोडा
                    </Button>
                  </div>
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
