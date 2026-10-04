"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
  Activity
} from 'lucide-react';
import { transliterateEnglishToMarathi, getAgeValidation } from '@/lib/utils';
import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { DETAILED_SKILLS_DATA } from './SportsSkills';

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
  sportOrEvent?: string;
  gameActivity?: string;
  skillScore?: string;
  skillScoreNum?: number;
  skillRank?: number;
  ageCategoryLabel?: string;
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
  if (!dob) return '';
  const trimmed = dob.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return trimmed;
}

export function convertDDMMYYYYToISO(dob: string | undefined): string {
  if (!dob) return '';
  const trimmed = dob.trim();
  const match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
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

  // Convert raw player object to SheetRow
  const playerToSheetRow = useCallback((p: any, index: number): SheetRow => {
    const allStorePlayers: any[] = store?.data?.players || [];
    const storeMatch = allStorePlayers.find(sp => sp.id === p.id || sp.generalRegisterNumber === p.generalRegisterNumber);
    const masterMatch = findMasterStudent(p) || (storeMatch ? findMasterStudent(storeMatch) : undefined);

    const name = p.nameMarathi?.trim() || 
                 storeMatch?.nameMarathi?.trim() || 
                 masterMatch?.nameMarathi?.trim() || 
                 transliterateEnglishToMarathi(p.name) || 
                 p.name || '';

    const rawStd = p.std || storeMatch?.std || masterMatch?.std || '';
    const std = formatStdMarathi(rawStd);

    const grNo = p.generalRegisterNumber || 
                 storeMatch?.generalRegisterNumber || 
                 masterMatch?.rollNo || 
                 p.serialNumber || 
                 '';

    const rawDob = p.dob || storeMatch?.dob || masterMatch?.dob || '';
    const dob = formatDobDDMMYYYY(rawDob);

    const motherName = p.motherName || 
                       storeMatch?.motherName || 
                       masterMatch?.motherName || 
                       '';

    const rawAadhar = p.aadharNumber || 
                      storeMatch?.aadharNumber || 
                      masterMatch?.apaarId || 
                      '';
    const aadhar = formatAadharDisplay(rawAadhar);

    const rawSaral = p.saralId || 
                     storeMatch?.saralId || 
                     masterMatch?.saralId || 
                     p.apaarId || 
                     storeMatch?.apaarId || 
                     '';
    const saralId = formatSaralIdDisplay(rawSaral);

    return {
      id: p.id || `row-${index}-${Date.now()}`,
      srNo: p.srNo || String(index + 1),
      studentName: name,
      std,
      grNo: String(grNo),
      dob,
      motherName,
      aadhar,
      saralId,
      sportOrEvent: p.sportOrEvent || (SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey),
      gameActivity: p.gameActivity || '',
      skillScore: p.skillScore || '-',
      skillScoreNum: p.skillScoreNum || 0,
      skillRank: p.skillRank || (index + 1),
      ageCategoryLabel: p.ageCategoryLabel || ''
    };
  }, [findMasterStudent, store?.data?.players, selectedSportKey]);

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
    const allStorePlayers: any[] = (store?.data?.players && store.data.players.length > 0)
      ? store.data.players
      : WAGHAMBA_STUDENTS_DATA;
    const collected: SheetRow[] = [];
    const seenPlayerEvent = new Set<string>();

    ATHLETICS_CORE_SIX.forEach(ev => {
      allStorePlayers.forEach(p => {
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
    const allStorePlayers: any[] = (store?.data?.players && store.data.players.length > 0)
      ? store.data.players
      : WAGHAMBA_STUDENTS_DATA;
    const newSheets: Record<string, SheetRow[]> = {};
    const isAthletics = ATHLETICS_DISCIPLINES.includes(sportKey);

    OFFICIAL_CATEGORIES.forEach(catDef => {
      // 1. Filter strictly by gender
      let pool = allStorePlayers.filter((p: any) => {
        const isFem = p.gender === 'Female' || p.gender === 'मुली';
        return catDef.gender === 'Female' ? isFem : !isFem;
      });

      // 2. Filter strictly by age cut-off (31 Dec 2026)
      pool = pool.filter((p: any) => {
        const ageVal = getAgeValidation(p.dob, 2026);
        if (ageVal) {
          if (catDef.ageType === 'U14') return ageVal.eligibilityType === 'U14';
          if (catDef.ageType === 'U17') return ageVal.eligibilityType === 'U17';
          if (catDef.ageType === 'U19') return ageVal.eligibilityType === 'U19';
        }
        const age = parseInt(p.age) || 0;
        if (age > 0) {
          if (catDef.ageType === 'U14') return age < 14;
          if (catDef.ageType === 'U17') return age >= 14 && age < 17;
          if (catDef.ageType === 'U19') return age >= 17 && age <= 19;
        }
        // Standard-based eligibility fallback when exact DOB parsing is pending
        const stdNum = parseInt(String(p.std).replace(/\D/g, '')) || 0;
        if (stdNum > 0) {
          if (catDef.ageType === 'U14') return stdNum <= 7;
          if (catDef.ageType === 'U17') return stdNum >= 8 && stdNum <= 10;
          if (catDef.ageType === 'U19') return stdNum > 10;
        }
        return false;
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

      // 4. Strict filter:
      // Show players who have marks from Skill Hub for this specific game
      let filtered = scoredPlayers.filter(p => p.hasSkillMark && (p.isInSport || isAthletics));

      // Fallback: If no players have marks yet in this category for this sport, use sport participants
      if (filtered.length === 0) {
        if (basePlayers && basePlayers.length > 0 && getInitialCategoryKey(initialCategory) === catDef.key) {
          filtered = basePlayers.map(p => {
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
        } else {
          filtered = scoredPlayers.filter(p => p.isInSport);
        }
      }

      // 5. Sort strictly by Skill Hub mark ranking (highest score first)
      filtered.sort((a, b) => b.skillScoreNum - a.skillScoreNum);

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
      sportOrEvent: SPORT_MARATHI_MAP[selectedSportKey] || selectedSportKey,
      gameActivity: isAthleticsSport ? "भालाफेक / धावणे" : "चढाईपटू (Raider)",
      skillScore: "-",
      skillScoreNum: 0,
      skillRank: activeRows.length + 1
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

  // Generate HTML for a single category sheet matching uploaded PDF
  // RULE 1: For Kabaddi, Volleyball, Kho Kho, and Handball, strictly limit to 12 players!
  // RULE 2: ONLY headers should be bold. Other student information MUST NOT be bold!
  // RULE 3: Official Tournament squad format without internal skill score columns
  const generateSingleSheetTableHtml = (catLabel: string, rawRowsList: SheetRow[], isMultiPage: boolean = false) => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    // Enforce 12-player rule for team sports
    const is12 = is12SquadSport(selectedSportKey, sportName);
    const rowsList = is12 ? rawRowsList.slice(0, 12) : rawRowsList;

    const rowsHtml = rowsList.length > 0 ? rowsList.map(r => `
      <tr>
        <td class="text-center font-normal">${r.srNo || '-'}</td>
        <td class="font-normal text-left">${r.studentName || '-'}</td>
        <td class="text-center font-normal">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal">${r.aadhar || '-'}</td>
        <td class="text-center font-normal">${r.saralId || '-'}</td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="8" class="text-center py-6 text-muted font-normal">या वयोगटासाठी खेळाडू यादी उपलब्ध नाही</td>
      </tr>
    `;

    return `
      <div class="sheet-page ${isMultiPage ? 'page-break' : ''}">
        <table class="official-outer-box">
          <thead>
            <!-- ROW 1: DEPARTMENT NAME (BOLD) -->
            <tr>
              <th colspan="8" class="header-line-1">
                ${departmentName}
              </th>
            </tr>

            <!-- ROW 2: PROJECT NAME (BOLD) -->
            <tr>
              <th colspan="8" class="header-line-2">
                ${projectName}
              </th>
            </tr>

            <!-- ROW 3: SCHOOL NAME (BOLD) -->
            <tr>
              <th colspan="8" class="header-line-3">
                ${schoolName}
              </th>
            </tr>

            <!-- ROW 4: SUBHEADER METADATA BAR (AGE GROUP, SPORT, YEAR) (BOLD) -->
            <tr>
              <th colspan="3" class="meta-bar-cell text-left">
                वयोगट :- ${catLabel}
              </th>
              <th colspan="3" class="meta-bar-cell text-center">
                खेळ प्रकार :- ${sportName}
              </th>
              <th colspan="2" class="meta-bar-cell text-center">
                सन:- ${academicYear}
              </th>
            </tr>

            <!-- ROW 5: COLUMN HEADERS (BOLD) -->
            <tr>
              <th class="col-header" style="width: 5%;">अ.क्र.</th>
              <th class="col-header" style="width: 25%;">विद्यार्थ्याचे नाव</th>
              <th class="col-header" style="width: 8%;">इयत्ता</th>
              <th class="col-header" style="width: 10%;">ज.रजि.नं.</th>
              <th class="col-header" style="width: 12%;">जन्म तारीख</th>
              <th class="col-header" style="width: 14%;">आईचे नाव</th>
              <th class="col-header" style="width: 14%;">आधार कार्ड नं.</th>
              <th class="col-header" style="width: 12%;">सरल आय.डी.नं.</th>
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

              <Button
                onClick={handlePrintActiveSheet}
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-1.5"
                title="फक्त सध्या निवडलेला गट प्रिंट करा"
              >
                <Printer className="w-4 h-4" />
                🖨️ चालू शीट प्रिंट (Print Active)
              </Button>

              <Button
                onClick={handlePrintAllCategories}
                variant="outline"
                className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-900 hover:bg-blue-950 text-white shadow-md gap-1.5 border-none"
                title="१४/१७/१९ मुले व मुली सर्व शीट स्वतंत्र पानांवर प्रिंट करा"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                📑 सर्व ६ गट प्रिंट (Print All 6)
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
                  <th className="p-2 text-center w-28 border-r font-black">अ.क्र. (Sr No)</th>
                  <th className="p-2 border-r min-w-[200px] font-black">विद्यार्थ्याचे नाव (Student Name)</th>
                  {isConsolidatedAthleticsView && (
                    <th className="p-2 text-center w-32 border-r font-black text-amber-700">मैदानी इव्हेंट (Event)</th>
                  )}
                  <th className="p-2 text-center min-w-[170px] border-r font-black text-blue-900">खेळ कौशल्य / पोझिशन</th>
                  <th className="p-2 text-center w-32 border-r font-black text-emerald-800">कौशल्य गुण / रँक</th>
                  <th className="p-2 text-center w-24 border-r font-black">इयत्ता (Std)</th>
                  <th className="p-2 text-center w-24 border-r font-black">ज.रजि.नं. (GR)</th>
                  <th className="p-2 text-center w-28 border-r font-black">जन्म तारीख (DOB)</th>
                  <th className="p-2 text-center w-28 border-r font-black">आईचे नाव (Mother)</th>
                  <th className="p-2 text-center w-36 border-r font-black">आधार कार्ड नं. (Aadhaar)</th>
                  <th className="p-2 text-center min-w-[150px] border-r font-black">सरल आय.डी.नं.</th>
                  <th className="p-2 text-center w-16 font-black">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-normal">
                {activeRows.length === 0 ? (
                  <tr>
                    <td colSpan={isConsolidatedAthleticsView ? 12 : 11} className="text-center py-12 text-muted-foreground font-normal">
                      या वयोगटासाठी Skill Hub मध्ये गुण नोंदवलेले खेळाडू आढळले नाहीत. वरील &quot;+ खेळाडू ओळ&quot; किंवा &quot;👥 रोस्टरमधून जोडा&quot; वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((row, index) => {
                    const isBeyond12 = is12PlayersOnly && !isConsolidatedAthleticsView && index >= 12;

                    return (
                      <tr key={row.id} className={`hover:bg-slate-50/80 transition-colors ${isBeyond12 ? 'bg-amber-50/30' : ''}`}>
                        {/* अ.क्र. with quick edit input and Up/Down arrows */}
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

                        {/* विद्यार्थ्याचे नाव (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={row.studentName}
                              onChange={(e) => updateRowField(index, 'studentName', e.target.value)}
                              onBlur={() => handleRowBlur(index)}
                              className="h-8 text-xs font-normal text-slate-800 focus:bg-amber-50/40"
                              placeholder="विद्यार्थ्याचे नाव"
                            />
                            {isBeyond12 && (
                              <span className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.5 rounded shrink-0 whitespace-nowrap">
                                12 नंतरचा
                              </span>
                            )}
                          </div>
                        </td>

                        {/* मैदानी इव्हेंट (Consolidated Athletics only) */}
                        {isConsolidatedAthleticsView && (
                          <td className="p-1.5 border-r text-center font-bold text-amber-800">
                            <Input
                              value={row.sportOrEvent || ''}
                              onChange={(e) => updateRowField(index, 'sportOrEvent', e.target.value)}
                              className="h-8 text-center text-xs font-bold text-amber-800 focus:bg-amber-50/40"
                              placeholder="उदा. भालाफेक"
                            />
                          </td>
                        )}

                        {/* खेळ कौशल्य क्रिया व पोझिशन (Game Related Activities) */}
                        <td className="p-1.5 border-r text-center">
                          <Input
                            value={row.gameActivity || ''}
                            onChange={(e) => updateRowField(index, 'gameActivity', e.target.value)}
                            className="h-8 text-center text-xs font-semibold text-blue-900 focus:bg-blue-50/40"
                            placeholder="कौशल्य क्रिया / पोझिशन"
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

                        {/* इयत्ता (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.std}
                            onChange={(e) => updateRowField(index, 'std', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="इ. ९ वी"
                          />
                        </td>

                        {/* ज.रजि.नं. (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.grNo}
                            onChange={(e) => updateRowField(index, 'grNo', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="GR No"
                          />
                        </td>

                        {/* जन्म तारीख (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.dob}
                            onChange={(e) => updateRowField(index, 'dob', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="DD/MM/YYYY"
                          />
                        </td>

                        {/* आईचे नाव (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.motherName}
                            onChange={(e) => updateRowField(index, 'motherName', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40"
                            placeholder="आईचे नाव"
                          />
                        </td>

                        {/* आधार कार्ड नं. (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.aadhar}
                            onChange={(e) => updateRowField(index, 'aadhar', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40 font-mono"
                            placeholder="XXXX XXXX XXXX"
                          />
                        </td>

                        {/* सरल आय.डी.नं. (Font Normal) */}
                        <td className="p-1.5 border-r">
                          <Input
                            value={row.saralId}
                            onChange={(e) => updateRowField(index, 'saralId', e.target.value)}
                            onBlur={() => handleRowBlur(index)}
                            className="h-8 text-center text-xs font-normal focus:bg-amber-50/40 font-mono"
                            placeholder="2018 27200116..."
                          />
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

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-xs h-10">
                रद्द करा (Close)
              </Button>

              {isAthleticsSport && (
                <Button
                  onClick={handlePrintConsolidatedAthletics}
                  className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2"
                >
                  <Medal className="w-4 h-4 text-amber-300" /> सर्व ६ खेळ एकत्र प्रिंट
                </Button>
              )}

              <Button
                onClick={handlePrintActiveSheet}
                className="h-10 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-2"
              >
                <Printer className="w-4 h-4" /> चालू शीट प्रिंट
              </Button>

              <Button
                onClick={handlePrintAllCategories}
                className="h-10 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-900 hover:bg-blue-950 text-white shadow-md gap-2"
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
              const allStudents: any[] = store?.data?.players?.length > 0 
                ? store.data.players 
                : WAGHAMBA_STUDENTS_DATA;

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
