"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Printer, 
  Medal, 
  Shirt, 
  Target, 
  FileText, 
  Trophy, 
  Hash, 
  Star, 
  FileSpreadsheet, 
  Users, 
  ChevronDown, 
  Download,
  Sparkles,
  Filter
} from 'lucide-react';
import { getAgeValidation, getOfficialSchoolName, getTeacherName, sanitizeGrNumber } from '@/lib/utils';
import { 
  OfficialTournamentSheetModal, 
  ATHLETICS_CORE_SIX, 
  isAthleticsSixSport,
  getPlayerSkillMarksAndRank,
  getPlayerGameActivity,
  SPORT_MARATHI_MAP,
  SheetRow
} from './OfficialTournamentSheetModal';
import { 
  exportSingleCategoryToExcel, 
  exportGame12PlayersBoysGirlsExcel,
  exportBoysOnly12Excel,
  exportGirlsOnly12Excel,
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

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

export const CATEGORY_MARATHI_MAP: Record<string, string> = {
  'Girls U14': '१४ वर्षाखालील मुली',
  'Boys U14': '१४ वर्षाखालील मुले',
  'Girls U17': '१७ वर्षाखालील मुली',
  'Boys U17': '१७ वर्षाखालील मुले',
  'Girls Senior': '१९ वर्षाखालील मुली',
  'Boys Senior': '१९ वर्षाखालील मुले',
  'Age Pending': 'इतर'
};

function formatDobDDMMYYYY(dob?: string): string {
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

function formatAadharDisplay(aadhar?: string): string {
  if (!aadhar || aadhar === '-' || aadhar === '---') return '-';
  const digits = String(aadhar).replace(/\D/g, '');
  if (digits.length === 12) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
  return String(aadhar).trim();
}

const SPORTS_LIST = [
  'Kabaddi',
  'Volleyball',
  'Kho Kho',
  'Handball',
  'Javelin Throw',
  'Disc Throw',
  'Shot Put',
  'Running',
  'Long Jump',
  'High Jump',
  'Athletics',
  'Yoga',
  'PT Mass'
];

export function TournamentRosters({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const [selectedSport, setSelectedSport] = useState(preselectedSport || SPORTS_LIST[0]);
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('Girls U14');
  const [modalPlayers, setModalPlayers] = useState<any[]>([]);

  // Local state for custom Sr No per player
  const [customSrNumbers, setCustomSrNumbers] = useState<Record<string, string>>({});

  const handleOpenOfficialSheet = (category?: string, playersList?: any[]) => {
    setModalCategory(category || 'Girls U14');
    const baseList = (playersList && playersList.length > 0) ? playersList : (store?.data?.players || []);
    const playersWithCustomSr = baseList.map((p: any, idx: number) => ({
      ...p,
      srNo: customSrNumbers[p.id] || String(idx + 1)
    }));
    setModalPlayers(playersWithCustomSr);
    setIsOfficialModalOpen(true);
  };

  const handleExportCategoryExcel = (category: string, playersList: any[]) => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const teacherName = getTeacherName(schoolProfile);
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const sportMr = SPORT_MARATHI_MAP[selectedSport] || selectedSport;
    const catLabelMr = CATEGORY_MARATHI_MAP[category] || category;

    const topTwelve = playersList.slice(0, 12);
    const rows = topTwelve.map((p, idx) => {
      const resolved = resolveStudentDetails(p, sportMr, catLabelMr);
      return {
        id: p.id,
        srNo: customSrNumbers[p.id] || String(idx + 1),
        studentName: resolved.studentName,
        std: resolved.std,
        grNo: resolved.grNo,
        dob: resolved.dob,
        motherName: resolved.motherName,
        aadhar: resolved.aadhar,
        saralId: resolved.saralId,
        schoolName: schoolName || DEFAULT_SCHOOL_MR,
        uDise: DEFAULT_UDISE,
        taluka: DEFAULT_TALUKA,
        gameActivity: p.gameActivity || p.position || '',
        skillScore: p.skillScore || '-',
        skillScoreNum: p.skillScoreNum || 0,
        skillRank: p.markRank || (idx + 1),
        sportOrEvent: resolved.sportOrEvent || sportMr,
        ageCategoryLabel: resolved.ageCategoryLabel || catLabelMr
      };
    });

    while (rows.length < 12) {
      const idx = rows.length + 1;
      rows.push({
        id: `blank_${idx}`,
        srNo: String(idx),
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
        gameActivity: '',
        skillScore: '-',
        skillScoreNum: 0,
        skillRank: idx,
        sportOrEvent: sportMr,
        ageCategoryLabel: catLabelMr
      });
    }

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName: schoolName || DEFAULT_SCHOOL_MR,
      sportName: sportMr,
      selectedSportKey: selectedSport,
      academicYear: "2026-27",
      teacherName: teacherName || "क्रीडा शिक्षक",
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA
    };

    exportSingleCategoryToExcel(catLabelMr, rows, meta);
  };

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const isAthletics = isAthleticsSixSport(selectedSport);

  // Underwise List Filter State: allows showing ONLY the selected under list
  const [selectedUnderFilter, setSelectedUnderFilter] = useState<'all' | 'U14' | 'U17' | 'U19'>('all');

  const getCategory = useCallback((p: any) => {
    return getStudentUnderCategory(p).rosterCategoryKey;
  }, []);

  const categories = useMemo(() => ['Girls U14', 'Boys U14', 'Girls U17', 'Boys U17', 'Girls Senior', 'Boys Senior'], []);

  const displayedCategories = useMemo(() => {
    if (selectedUnderFilter === 'U14') return ['Girls U14', 'Boys U14'];
    if (selectedUnderFilter === 'U17') return ['Girls U17', 'Boys U17'];
    if (selectedUnderFilter === 'U19') return ['Girls Senior', 'Boys Senior'];
    return categories;
  }, [selectedUnderFilter, categories]);

  const activeUnderLabel = useMemo(() => {
    if (selectedUnderFilter === 'U17') return '१७ वर्षाखालील';
    if (selectedUnderFilter === 'U19') return '१९ वर्षाखालील';
    return '१४ वर्षाखालील';
  }, [selectedUnderFilter]);
  
  // Process groups:
  // USER REQUIREMENT: Show players who were given marks from Skill Hub, sorted strictly by their mark ranking!
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    const allPlayers: any[] = store?.data?.players || [];

    let playersInSport = allPlayers.filter((p: any) => {
      if (!p.sports) return false;
      if (Array.isArray(p.sports) && p.sports.includes(selectedSport)) return true;
      if (typeof p.sports === 'string' && p.sports.includes(selectedSport)) return true;
      if (isAthletics && (Array.isArray(p.sports) && p.sports.includes('Athletics'))) {
        return true;
      }
      return false;
    });

    // Fallback: If no player specifically assigned to this sport yet, include all players
    if (playersInSport.length === 0) {
      playersInSport = allPlayers;
    }

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillInfo = getPlayerSkillMarksAndRank(p, selectedSport, store);
        const fitnessData = store?.data?.fitness?.[p.id] || { score: '0' };
        const position = p.positions?.[selectedSport] || p.position || '-';
        const gameActivity = getPlayerGameActivity(p, selectedSport, store);
        const jersey = p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-';

        groups[cat].push({ 
          ...p, 
          skillScore: skillInfo.scoreDisplay,
          skillScoreNum: skillInfo.score,
          hasSkillMark: skillInfo.hasMark,
          fitnessScore: fitnessData.score || '0',
          jersey,
          position,
          gameActivity
        });
      }
    });

    // Filter and Sort by Skill Hub Mark Ranking while preserving all squad players up to 12
    Object.keys(groups).forEach(cat => {
      let list = groups[cat];
      const withMarks = list.filter(p => p.hasSkillMark);
      const withoutMarks = list.filter(p => !p.hasSkillMark);

      // Evaluated players ranked first by skill score descending
      withMarks.sort((a, b) => b.skillScoreNum - a.skillScoreNum);
      // Other players follow by standard/name
      withoutMarks.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

      let finalList = [...withMarks, ...withoutMarks];

      // If fewer than 12 players in this sport for this category, fill up to 12 from other athletes in the exact same category
      if (finalList.length < 12) {
        const existingIds = new Set(finalList.map(p => p.id));
        const categoryOtherAthletes = allPlayers.filter(p => {
          if (existingIds.has(p.id)) return false;
          return getCategory(p) === cat;
        });
        categoryOtherAthletes.sort((a, b) => (parseInt(a.std || '0') - parseInt(b.std || '0')) || (a.name || '').localeCompare(b.name || ''));

        for (const extra of categoryOtherAthletes) {
          if (finalList.length >= 12) break;
          const skillInfo = getPlayerSkillMarksAndRank(extra, selectedSport, store);
          finalList.push({
            ...extra,
            skillScore: skillInfo.scoreDisplay,
            skillScoreNum: skillInfo.score,
            hasSkillMark: skillInfo.hasMark,
            fitnessScore: '0',
            jersey: extra.jerseyNumbers?.[selectedSport] || extra.jerseyNumber || '-',
            position: extra.positions?.[selectedSport] || extra.position || '-',
            gameActivity: getPlayerGameActivity(extra, selectedSport, store)
          });
        }
      }

      groups[cat] = finalList.map((p, idx) => ({
        ...p,
        markRank: idx + 1
      }));
    });

    return groups;
  }, [selectedSport, store, categories, getCategory, isAthletics]);

  // Extract 12 boys and 12 girls for a specific sport (First Boys, Then Girls)
  // Strictly filtered by targetAgeType so there is NEVER a cross-under mismatch!
  const getSelectedSport12Squads = useCallback((sportKey: string, targetAgeType?: 'U14' | 'U17' | 'U19') => {
    const allStorePlayers: any[] = store?.data?.players || [];
    const sportMr = SPORT_MARATHI_MAP[sportKey] || sportKey;
    const isTargetAthletics = isAthleticsSixSport(sportKey);
    const resolvedAgeType: 'U14' | 'U17' | 'U19' = targetAgeType || (selectedUnderFilter !== 'all' ? selectedUnderFilter : 'U14');

    const filterAndScore = (genderType: 'Male' | 'Female') => {
      let pool = allStorePlayers.filter((p: any) => {
        const studentCat = getStudentUnderCategory(p);
        if (studentCat.ageType !== resolvedAgeType) return false;
        return genderType === 'Female' ? studentCat.gender === 'Female' : studentCat.gender === 'Male';
      });

      const scored = pool.map(p => {
        const skillInfo = getPlayerSkillMarksAndRank(p, sportKey, store);
        const isInSport = Boolean(
          p.sports && Array.isArray(p.sports) && (p.sports.includes(sportKey) || (isTargetAthletics && p.sports.includes('Athletics')))
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

      return finalList.slice(0, 12).map((p, idx): SheetRow => {
        const catLabel = getPlayerAgeCategoryLabel(p, genderType);
        const resolved = resolveStudentDetails(p, sportMr, catLabel);
        return {
          id: p.id || `p-${idx}`,
          srNo: customSrNumbers[p.id] || String(idx + 1),
          studentName: resolved.studentName,
          std: resolved.std,
          grNo: resolved.grNo,
          dob: resolved.dob,
          motherName: resolved.motherName,
          aadhar: resolved.aadhar,
          saralId: resolved.saralId,
          schoolName: resolved.schoolName || DEFAULT_SCHOOL_MR,
          uDise: resolved.uDise || DEFAULT_UDISE,
          taluka: resolved.taluka || DEFAULT_TALUKA,
          sportOrEvent: resolved.sportOrEvent || sportMr,
          gameActivity: p.gameActivity || p.position || '',
          skillScore: p.skillScore || '-',
          skillScoreNum: p.skillScoreNum || 0,
          skillRank: idx + 1,
          ageCategoryLabel: resolved.ageCategoryLabel || catLabel,
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
  }, [store, customSrNumbers, selectedUnderFilter]);

  // Master Tournament Unique Players Calculation (deduplicated, first boys then girls, total count)
  const getUniqueTournamentPlayersList = useMemo(() => {
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
      const { boysRows, girlsRows } = getSelectedSport12Squads(spKey);
      const spMr = SPORT_MARATHI_MAP[spKey] || spKey;

      [...boysRows, ...girlsRows].forEach(p => {
        const key = p.id || p.grNo || p.studentName;
        if (!key || !p.studentName || !p.studentName.trim() || p.studentName === '-') return;

        if (!playerSportsMap.has(key)) {
          playerSportsMap.set(key, new Set());
        }
        playerSportsMap.get(key)!.add(spMr);

        if (!seenPlayerKeys.has(key)) {
          seenPlayerKeys.add(key);
          const isGirl = p.gender === 'Female' || p.ageCategoryLabel === 'मुली';
          if (isGirl) uniqueGirls.push(p);
          else uniqueBoys.push(p);
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
        const sportMr = (p.sports && Array.isArray(p.sports) && p.sports.length > 0)
          ? p.sports.map((s: string) => SPORT_MARATHI_MAP[s] || s).join(', ')
          : (SPORT_MARATHI_MAP[selectedSport] || selectedSport);

        const ageCat = getPlayerAgeCategoryLabel(p, isGirl ? 'Female' : 'Male');
        const resolved = resolveStudentDetails(p, sportMr, ageCat);

        const filledRow: SheetRow = {
          id: p.id,
          srNo: '1',
          studentName: resolved.studentName,
          std: resolved.std,
          grNo: resolved.grNo,
          dob: resolved.dob,
          motherName: resolved.motherName,
          aadhar: resolved.aadhar,
          saralId: resolved.saralId,
          schoolName: resolved.schoolName || DEFAULT_SCHOOL_MR,
          uDise: resolved.uDise || DEFAULT_UDISE,
          taluka: resolved.taluka || DEFAULT_TALUKA,
          sportOrEvent: resolved.sportOrEvent || sportMr,
          gameActivity: p.gameActivity || p.position || '',
          skillScore: '-',
          skillScoreNum: 0,
          skillRank: 1,
          ageCategoryLabel: resolved.ageCategoryLabel || ageCat,
          gender: isGirl ? 'Female' : 'Male'
        };

        if (isGirl) uniqueGirls.push(filledRow);
        else uniqueBoys.push(filledRow);
      }
    });

    uniqueBoys.sort((a, b) => (parseInt(a.std.replace(/\D/g, '') || '0') - parseInt(b.std.replace(/\D/g, '') || '0')) || a.studentName.localeCompare(b.studentName));
    uniqueGirls.sort((a, b) => (parseInt(a.std.replace(/\D/g, '') || '0') - parseInt(b.std.replace(/\D/g, '') || '0')) || a.studentName.localeCompare(b.studentName));

    const combined: SheetRow[] = [];
    uniqueBoys.forEach((b, idx) => {
      const key = b.id || b.grNo || b.studentName;
      const games = playerSportsMap.get(key);
      const gameStr = games && games.size > 0 ? Array.from(games).join(', ') : b.sportOrEvent;
      const catLabel = getPlayerAgeCategoryLabel(b, 'Male');
      const resolved = resolveStudentDetails(b, gameStr, catLabel);

      combined.push({
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

      combined.push({
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
      uniquePlayers: combined,
      summary: {
        total: combined.length,
        boys: uniqueBoys.length,
        girls: uniqueGirls.length
      }
    };
  }, [store, getSelectedSport12Squads, selectedSport]);

  const getOfficialPrintStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
    @media print {
      @page { size: A4 landscape; margin: 0.5cm; }
      .no-print { display: none !important; }
      body { background: #ffffff !important; padding: 0 !important; }
      .official-outer-box { border: 2px solid #000000 !important; box-shadow: none !important; }
    }
    * { box-sizing: border-box; }
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .btn {
      padding: 8px 18px;
      font-size: 11pt;
      font-weight: 800;
      border-radius: 6px;
      cursor: pointer;
      border: none;
    }
    .btn-close { background: #475569; color: #ffffff; }
    .btn-print { background: #d97706; color: #ffffff; }
    .page-container { margin-top: 55px; }
    .official-outer-box {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000000;
      background: #ffffff;
    }
    .official-outer-box th, .official-outer-box td {
      border: 1px solid #000000;
      padding: 4px 5px;
      vertical-align: middle;
    }
    .header-line-1 { font-size: 13.5pt; font-weight: 900 !important; text-align: center; padding: 5px 4px; }
    .header-line-2 { font-size: 12pt; font-weight: 800 !important; text-align: center; padding: 4px 4px; }
    .header-line-3 { font-size: 11.5pt; font-weight: 800 !important; text-align: center; padding: 4px 4px; }
    .meta-bar-cell { font-size: 10.5pt; font-weight: 900 !important; padding: 5px 8px; }
    .col-header { font-size: 10pt; font-weight: 900 !important; text-align: center; padding: 5px 3px; background: #ffffff; }
    .font-normal { font-weight: 400 !important; font-size: 10pt; }
    .text-center { text-align: center; }
    .text-left { text-align: left; padding-left: 6px !important; }
    .footer-sign-section { margin-top: 20px; display: flex; justify-content: space-between; padding: 0 20px; font-size: 10pt; font-weight: 800; }
    .sign-box { text-align: center; min-width: 220px; }
  `;

  // Quick Print for a specific category using the exact 11 Marathi columns requested:
  // 1. अनु. क्र. 2. खेळाडूचे पूर्ण नाव 3. जनरल रजिस्टर नं. 4. जन्मतारीख 5. आईचे नाव
  // 6. आधार क्र. 7. शाळेचे नाव 8. यु-डायस क्रमांक 9. तालुका 10. वयोगट 11. खेळाचा प्रकार
  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category] || [];
    const topTwelve = groupPlayers.slice(0, 12);

    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";
    const sportLabelMr = SPORT_MARATHI_MAP[selectedSport] || selectedSport;
    const catLabelMr = CATEGORY_MARATHI_MAP[category] || category;

    // Build strictly 12 player rows
    const rowsToPrint: any[] = topTwelve.map((p, idx) => {
      const resolved = resolveStudentDetails(p, sportLabelMr, catLabelMr);
      return {
        srNo: customSrNumbers[p.id] || String(idx + 1),
        studentName: resolved.studentName,
        std: resolved.std,
        grNo: resolved.grNo,
        dob: resolved.dob,
        motherName: resolved.motherName,
        aadhar: resolved.aadhar,
        schoolName: schoolName,
        uDise: DEFAULT_UDISE,
        taluka: DEFAULT_TALUKA,
        ageCategoryLabel: resolved.ageCategoryLabel || catLabelMr,
        sportOrEvent: resolved.sportOrEvent || sportLabelMr
      };
    });

    while (rowsToPrint.length < 12) {
      const idx = rowsToPrint.length + 1;
      rowsToPrint.push({
        srNo: String(idx),
        studentName: '',
        std: '-',
        grNo: '-',
        dob: '-',
        motherName: '-',
        aadhar: '-',
        schoolName: schoolName,
        uDise: DEFAULT_UDISE,
        taluka: DEFAULT_TALUKA,
        ageCategoryLabel: catLabelMr,
        sportOrEvent: sportLabelMr
      });
    }

    const rowsHtml = rowsToPrint.map(r => `
      <tr>
        <td class="text-center font-normal">${r.srNo}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo}</td>
        <td class="text-center font-normal">${r.dob}</td>
        <td class="text-center font-normal">${r.motherName}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.aadhar}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.uDise}</td>
        <td class="text-center font-normal">${r.taluka}</td>
        <td class="text-center font-normal">${r.ageCategoryLabel}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportLabelMr} - ${catLabelMr} (2026-27) - अधिकृत क्रीडा स्पर्धा शीट</title>
          <meta charset="utf-8" />
          <style>${getOfficialPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              ${sportLabelMr} &bull; ${catLabelMr} (सन २०२६-२७) &bull; अधिकृत १२ खेळाडू संघ
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (Print)</button>
          </div>
          <div class="page-container">
            <table class="official-outer-box">
              <thead>
                <tr><th colspan="12" class="header-line-1">आदिवासी विकास विभाग नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-2">एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
                <tr>
                  <th colspan="4" class="meta-bar-cell text-left">वयोगट :- ${catLabelMr}</th>
                  <th colspan="4" class="meta-bar-cell text-center">खेळ प्रकार :- ${sportLabelMr}</th>
                  <th colspan="4" class="meta-bar-cell text-center">सन:- २०२६-२७</th>
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
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  // Print 12 Players Official Squad Sheet: First Boys (12 players), then Girls (12 players) (Underwise)
  const handlePrintGame12BoysGirls = () => {
    const { boysRows, girlsRows, sportMr, boysCatLabel, girlsCatLabel, combinedCatLabel } = getSelectedSport12Squads(selectedSport);
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    const padTo12 = (list: SheetRow[], genderLabel: string) => {
      const padded = [...list.slice(0, 12)];
      while (padded.length < 12) {
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
          schoolName: schoolName,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          sportOrEvent: sportMr,
          ageCategoryLabel: genderLabel,
          gender: genderLabel.includes('मुली') ? 'Female' : 'Male'
        });
      }
      return padded;
    };

    const finalBoys = padTo12(boysRows, boysCatLabel);
    const finalGirls = padTo12(girlsRows, girlsCatLabel);

    const renderRows = (rows: SheetRow[], startSr: number) => rows.map((r, i) => `
      <tr>
        <td class="text-center font-normal">${startSr + i}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal">${r.ageCategoryLabel || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportMr}</td>
      </tr>
    `).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - ${combinedCatLabel} १२ खेळाडू संघ (प्रथम मुले, नंतर मुली) - २०२६-२७</title>
          <meta charset="utf-8" />
          <style>${getOfficialPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              ${sportMr} &bull; ${combinedCatLabel} १२ खेळाडू संघ (प्रथम मुले, नंतर मुली) &bull; सन २०२६-२७
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (Print)</button>
          </div>
          <div class="page-container">
            <table class="official-outer-box">
              <thead>
                <tr><th colspan="12" class="header-line-1">आदिवासी विकास विभाग नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-2">एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
                <tr>
                  <th colspan="4" class="meta-bar-cell text-left">वयोगट :- ${combinedCatLabel} १२ खेळाडू संघ (प्रथम मुले, नंतर मुली)</th>
                  <th colspan="4" class="meta-bar-cell text-center">खेळ प्रकार :- ${sportMr}</th>
                  <th colspan="4" class="meta-bar-cell text-center">सन:- २०२६-२७</th>
                </tr>
                <tr>
                  <th colspan="12" style="background: #e2e8f0; font-weight: 900; text-align: left; padding: 4px 8px; font-size: 10pt;">
                    👦 १. मुले संघ (${boysCatLabel} - १२ खेळाडू)
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
                ${renderRows(finalBoys, 1)}
                <tr>
                  <td colspan="12" style="background: #fce7f3; font-weight: 900; text-align: left; padding: 4px 8px; font-size: 10pt; color: #9d174d;">
                    👧 २. मुली संघ (${girlsCatLabel} - १२ खेळाडू)
                  </td>
                </tr>
                ${renderRows(finalGirls, 1)}
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
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Export 12 Players for Selected Sport: First Boys, then Girls (.xlsx)
  const handleExportGame12BoysGirlsExcel = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";
    const { boysRows, girlsRows, sportMr, combinedCatLabel } = getSelectedSport12Squads(selectedSport);

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName,
      sportName: sportMr,
      selectedSportKey: selectedSport,
      academicYear: "2026-27",
      teacherName,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA,
      categoryLabel: combinedCatLabel
    };

    exportGame12PlayersBoysGirlsExcel(selectedSport, boysRows, girlsRows, meta);
  };

  // Export 12 Boys Only (.xlsx)
  const handleExport12BoysOnlyExcel = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";
    const { boysRows, sportMr, boysCatLabel } = getSelectedSport12Squads(selectedSport);

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName,
      sportName: sportMr,
      selectedSportKey: selectedSport,
      academicYear: "2026-27",
      teacherName,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA,
      categoryLabel: boysCatLabel
    };

    exportBoysOnly12Excel(selectedSport, boysRows, meta);
  };

  // Export 12 Girls Only (.xlsx)
  const handleExport12GirlsOnlyExcel = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";
    const { girlsRows, sportMr, girlsCatLabel } = getSelectedSport12Squads(selectedSport);

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName,
      sportName: sportMr,
      selectedSportKey: selectedSport,
      academicYear: "2026-27",
      teacherName,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA,
      categoryLabel: girlsCatLabel
    };

    exportGirlsOnly12Excel(selectedSport, girlsRows, meta);
  };

  // Print 12 Boys Only
  const handlePrint12BoysOnly = () => {
    const { boysRows, sportMr, boysCatLabel } = getSelectedSport12Squads(selectedSport);
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    const padTo12 = (list: SheetRow[]) => {
      const padded = [...list.slice(0, 12)];
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
          schoolName: schoolName,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          sportOrEvent: sportMr,
          ageCategoryLabel: boysCatLabel,
          gender: 'Male'
        });
      }
      return padded;
    };

    const finalBoys = padTo12(boysRows);
    const rowsHtml = finalBoys.map((r, i) => `
      <tr>
        <td class="text-center font-normal">${i + 1}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal" style="font-weight: 600;">${r.ageCategoryLabel || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportMr}</td>
      </tr>
    `).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - ${boysCatLabel} (१२ खेळाडू संघ) - सन २०२६-२७</title>
          <meta charset="utf-8" />
          <style>${getOfficialPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              👦 ${sportMr} &bull; ${boysCatLabel} &bull; १२ खेळाडू संघ &bull; सन २०२६-२७
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ १२ मुले संघ प्रिंट करा (Print 12 Boys)</button>
          </div>
          <div class="page-container">
            <table class="official-outer-box">
              <thead>
                <tr><th colspan="12" class="header-line-1">आदिवासी विकास विभाग नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-2">एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
                <tr>
                  <th colspan="4" class="meta-bar-cell text-left">वयोगट :- ${boysCatLabel} (१२ खेळाडू संघ)</th>
                  <th colspan="4" class="meta-bar-cell text-center">खेळ प्रकार :- ${sportMr}</th>
                  <th colspan="4" class="meta-bar-cell text-center">सन:- २०२६-२७</th>
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
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Print 12 Girls Only
  const handlePrint12GirlsOnly = () => {
    const { girlsRows, sportMr, girlsCatLabel } = getSelectedSport12Squads(selectedSport);
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    const padTo12 = (list: SheetRow[]) => {
      const padded = [...list.slice(0, 12)];
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
          schoolName: schoolName,
          uDise: DEFAULT_UDISE,
          taluka: DEFAULT_TALUKA,
          sportOrEvent: sportMr,
          ageCategoryLabel: girlsCatLabel,
          gender: 'Female'
        });
      }
      return padded;
    };

    const finalGirls = padTo12(girlsRows);

    const rowsHtml = finalGirls.map((r, i) => `
      <tr>
        <td class="text-center font-normal">${i + 1}</td>
        <td class="font-normal text-left">${r.studentName ? r.studentName : '&nbsp;'}</td>
        <td class="text-center font-normal font-bold">${r.std || '-'}</td>
        <td class="text-center font-normal">${r.grNo || '-'}</td>
        <td class="text-center font-normal">${r.dob || '-'}</td>
        <td class="text-center font-normal">${r.motherName || '-'}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.aadhar || '-'}</td>
        <td class="text-center font-normal" style="font-size: 8.5pt;">${r.schoolName || DEFAULT_SCHOOL_MR}</td>
        <td class="text-center font-normal font-mono" style="font-size: 8.5pt;">${r.uDise || DEFAULT_UDISE}</td>
        <td class="text-center font-normal">${r.taluka || DEFAULT_TALUKA}</td>
        <td class="text-center font-normal" style="font-weight: 600;">${r.ageCategoryLabel || '-'}</td>
        <td class="text-center font-normal" style="font-weight: 700;">${r.sportOrEvent || sportMr}</td>
      </tr>
    `).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportMr} - ${girlsCatLabel} (१२ खेळाडू संघ) - सन २०२६-२७</title>
          <meta charset="utf-8" />
          <style>${getOfficialPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              👧 ${sportMr} &bull; ${girlsCatLabel} &bull; १२ खेळाडू संघ &bull; सन २०२६-२७
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ १२ मुली संघ प्रिंट करा (Print 12 Girls)</button>
          </div>
          <div class="page-container">
            <table class="official-outer-box">
              <thead>
                <tr><th colspan="12" class="header-line-1">आदिवासी विकास विभाग नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-2">एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक</th></tr>
                <tr><th colspan="12" class="header-line-3">${schoolName}</th></tr>
                <tr>
                  <th colspan="4" class="meta-bar-cell text-left">वयोगट :- ${girlsCatLabel} (१२ खेळाडू संघ)</th>
                  <th colspan="4" class="meta-bar-cell text-center">खेळ प्रकार :- ${sportMr}</th>
                  <th colspan="4" class="meta-bar-cell text-center">सन:- २०२६-२७</th>
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
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  // Print Master Tournament Unique Players Entry Sheet (deduplicated, first boys then girls, with count)
  // Print Master Tournament Unique Players Entry Sheet (ONLY Student Name, GR No, and Sport)
  // User requirement: "IN THAT EXCELL SHEET WHERE ALL PLAEER ARE SHOWING IN THAT PDF ONLY SHOW STUDENTS NAAME THIER RESITER NUMBER AND WHICH GAME THAT PLAYER PLAYING AND ALSO ADD A OPTION TO PRINT ONLY ALL MALE PLYER AND ALSO OPTION FOR PRINT ONLY FEMALE PLAYER ONLY"
  const handlePrintUniqueTournamentPlayers = (genderFilter?: 'all' | 'boys' | 'girls' | React.MouseEvent) => {
    const filter = (genderFilter === 'boys' || genderFilter === 'girls') ? genderFilter : 'all';
    const { uniquePlayers, summary } = getUniqueTournamentPlayersList;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    let playersToRender = uniquePlayers;
    let metaLeft = `शालेय क्रीडा स्पर्धा सन :- २०२६-२७ | एकूण सहभागी खेळाडू मास्टर यादी (सर्व खेळ)`;
    let metaRight = `एकूण खेळाडू: ${summary.total} (👦 मुले: ${summary.boys} | 👧 मुली: ${summary.girls})`;
    let docTitle = `शालेय क्रीडा स्पर्धा सन २०२६-२७ - एकूण ${summary.total} सहभागी खेळाडू मास्टर यादी`;

    if (filter === 'boys') {
      playersToRender = uniquePlayers.filter(p => p.gender === 'Male' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुले')));
      metaLeft = `शालेय क्रीडा स्पर्धा सन :- २०२६-२७ | सहभागी मुले खेळाडू मास्टर यादी (सर्व खेळ)`;
      metaRight = `एकूण मुले खेळाडू संख्या: ${summary.boys || playersToRender.length}`;
      docTitle = `सहभागी मुले खेळाडू मास्टर यादी (एकूण ${summary.boys}) - सन २०२६-२७`;
    } else if (filter === 'girls') {
      playersToRender = uniquePlayers.filter(p => p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली')));
      metaLeft = `शालेय क्रीडा स्पर्धा सन :- २०२६-२७ | सहभागी मुली खेळाडू मास्टर यादी (सर्व खेळ)`;
      metaRight = `एकूण मुली खेळाडू संख्या: ${summary.girls || playersToRender.length}`;
      docTitle = `सहभागी मुली खेळाडू मास्टर यादी (एकूण ${summary.girls}) - सन २०२६-२७`;
    }

    let rowsHtml = '';
    if (playersToRender.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="4" class="text-center py-6 text-muted font-normal">खेळाडू यादी उपलब्ध नाही</td>
        </tr>
      `;
    } else if (genderFilter === 'all') {
      const boys = playersToRender.filter(p => p.gender === 'Male' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुले')));
      const girls = playersToRender.filter(p => p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली')));

      const boysRows = boys.map((r, i) => `
        <tr>
          <td class="text-center font-normal">${i + 1}</td>
          <td class="font-normal text-left" style="font-weight: 600;">${r.studentName ? r.studentName : '&nbsp;'}</td>
          <td class="text-center font-normal font-mono" style="font-weight: 600;">${r.grNo || '-'}</td>
          <td class="text-center font-normal" style="font-weight: 700; color: #1e3a8a;">${r.sportOrEvent || '-'}</td>
        </tr>
      `).join('');

      const girlsRows = girls.map((r, i) => `
        <tr>
          <td class="text-center font-normal">${i + 1}</td>
          <td class="font-normal text-left" style="font-weight: 600;">${r.studentName ? r.studentName : '&nbsp;'}</td>
          <td class="text-center font-normal font-mono" style="font-weight: 600;">${r.grNo || '-'}</td>
          <td class="text-center font-normal" style="font-weight: 700; color: #1e3a8a;">${r.sportOrEvent || '-'}</td>
        </tr>
      `).join('');

      rowsHtml = `
        ${boys.length > 0 ? `
          <tr>
            <th colspan="4" style="background: #e0f2fe; color: #0369a1; text-align: left; font-size: 10.5pt; font-weight: 800; padding: 6px 10px; border: 1px solid #000000;">
              👦 १. मुले खेळाडू यादी (एकूण मुले: ${boys.length})
            </th>
          </tr>
          ${boysRows}
        ` : ''}
        ${girls.length > 0 ? `
          <tr>
            <th colspan="4" style="background: #fce7f3; color: #be185d; text-align: left; font-size: 10.5pt; font-weight: 800; padding: 6px 10px; border: 1px solid #000000;">
              👧 २. मुली खेळाडू यादी (एकूण मुली: ${girls.length})
            </th>
          </tr>
          ${girlsRows}
        ` : ''}
      `;
    } else {
      rowsHtml = playersToRender.map((r, i) => `
        <tr>
          <td class="text-center font-normal">${i + 1}</td>
          <td class="font-normal text-left" style="font-weight: 600;">${r.studentName ? r.studentName : '&nbsp;'}</td>
          <td class="text-center font-normal font-mono" style="font-weight: 600;">${r.grNo || '-'}</td>
          <td class="text-center font-normal" style="font-weight: 700; color: #1e3a8a;">${r.sportOrEvent || '-'}</td>
        </tr>
      `).join('');
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>${getOfficialPrintStyles()}</style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              🎯 ${docTitle}
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (Print)</button>
          </div>
          <div class="page-container" style="max-width: 900px;">
            <table class="official-outer-box">
              <thead>
                <tr><th colspan="4" class="header-line-1">आदिवासी विकास विभाग नाशिक</th></tr>
                <tr><th colspan="4" class="header-line-2">एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक</th></tr>
                <tr><th colspan="4" class="header-line-3">${schoolName}</th></tr>
                <tr>
                  <th colspan="2" class="meta-bar-cell text-left">
                    ${metaLeft}
                  </th>
                  <th colspan="2" class="meta-bar-cell text-right" style="color: #047857; font-size: 11pt;">
                    ${metaRight}
                  </th>
                </tr>
                <tr>
                  <th class="col-header" style="width: 8%;">अनु. क्र.</th>
                  <th class="col-header" style="width: 44%;">विद्यार्थ्याचे पूर्ण नाव</th>
                  <th class="col-header" style="width: 22%;">जनरल रजिस्टर नं.</th>
                  <th class="col-header" style="width: 26%;">खेळाचा प्रकार</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <div class="footer-sign-section" style="margin-top: 25px; display: flex; justify-content: space-between; page-break-inside: avoid;">
              <div class="sign-box" style="text-align: center; width: 40%;">
                <br/><br/>
                <div style="font-weight: 700;">क्रीडा शिक्षक (स्वाक्षरी)</div>
                <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${teacherName})</div>
              </div>
              <div class="sign-box" style="text-align: center; width: 45%;">
                <br/><br/>
                <div style="font-weight: 700;">मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
                <div style="font-size: 9.5pt; color: #334155; margin-top: 3px; font-weight: normal;">(${schoolName})</div>
              </div>
            </div>
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

  // Export Master Tournament Unique Players Entry Sheet (.xlsx)
  const handleExportUniqueTournamentPlayersExcel = (genderFilter?: 'all' | 'boys' | 'girls' | React.MouseEvent) => {
    const filter = (genderFilter === 'boys' || genderFilter === 'girls') ? genderFilter : 'all';
    const { uniquePlayers, summary } = getUniqueTournamentPlayersList;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName,
      sportName: "सर्व खेळ",
      selectedSportKey: "All",
      academicYear: "2026-27",
      teacherName,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA
    };

    exportUniqueTournamentPlayersExcel(uniquePlayers, meta, summary, filter);
  };

  // Export Every Game's 12 Players (Boys then Girls) into a master multi-tab workbook
  const handleExportEveryGame12Excel = () => {
    const tournamentSports = [
      { key: 'Kabaddi', labelMr: 'कबड्डी' },
      { key: 'Kho Kho', labelMr: 'खो खो' },
      { key: 'Volleyball', labelMr: 'व्हॉलीबॉल' },
      { key: 'Handball', labelMr: 'हॅन्डबॉल' },
      { key: 'Running', labelMr: 'धावणे' },
      { key: 'Long Jump', labelMr: 'लांब उडी' },
      { key: 'Shot Put', labelMr: 'गोळाफेक' },
      { key: 'Javelin Throw', labelMr: 'भालाफेक' }
    ];

    const sportsData = tournamentSports.map(s => {
      const { boysRows, girlsRows } = getSelectedSport12Squads(s.key);
      return {
        sportKey: s.key,
        sportNameMr: s.labelMr,
        boysRows,
        girlsRows
      };
    });

    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true) || DEFAULT_SCHOOL_MR;
    const teacherName = getTeacherName(schoolProfile) || "क्रीडा शिक्षक";

    const meta: TournamentExcelMetadata = {
      departmentName: "आदिवासी विकास विभाग नाशिक",
      projectName: "एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक",
      schoolName,
      sportName: "सर्व खेळ",
      selectedSportKey: "All",
      academicYear: "2026-27",
      teacherName,
      uDise: DEFAULT_UDISE,
      taluka: DEFAULT_TALUKA
    };

    exportEveryGame12PlayersWorkbookToExcel(sportsData, meta);
  };

  const { summary: uniqueSummary } = getUniqueTournamentPlayersList;

  return (
    <div className="space-y-6">
      {!preselectedSport && (
        <div className="bg-primary/5 p-6 sm:p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="bg-white p-3.5 sm:p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
              <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">Tournament Selection</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Skill Hub गुण रँकिंग व अधिकृत स्पर्धा प्रवेश पत्र (११ रकाने मराठी फॉरमॅट)
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black border-2 border-emerald-600/30 rounded-xl h-8 gap-1.5 shadow-sm"
                  onClick={() => {
                    const el = document.querySelector('[data-value="jersey"]') as HTMLElement || document.querySelector('[value="jersey"]') as HTMLElement;
                    if (el) el.click();
                  }}
                >
                  <Shirt className="w-3.5 h-3.5 text-emerald-600" />
                  🎽 जर्सी व पोझिशन
                </Button>

                {/* 12 PLAYERS BOYS THEN GIRLS DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                      title="१२ खेळाडू संघ: प्रथम मुले, नंतर मुली प्रिंट व एक्सेल पर्याय"
                    >
                      <Users className="w-3.5 h-3.5 text-white" />
                      👥 १२ खेळाडू ({activeUnderLabel})
                      <ChevronDown className="w-3 h-3 text-white/80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-2">
                    <DropdownMenuLabel className="text-xs font-bold text-slate-700">
                      १२ खेळाडू संघ पर्याय ({activeUnderLabel})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handlePrint12BoysOnly}
                      className="gap-2 cursor-pointer text-xs font-bold text-slate-900 focus:bg-blue-50"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                      🖨️ 👦 फक्त १२ मुले संघ प्रिंट ({activeUnderLabel})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handlePrint12GirlsOnly}
                      className="gap-2 cursor-pointer text-xs font-bold text-slate-900 focus:bg-pink-50"
                    >
                      <Printer className="w-4 h-4 text-pink-600" />
                      🖨️ 👧 फक्त १२ मुली संघ प्रिंट ({activeUnderLabel})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handlePrintGame12BoysGirls}
                      className="gap-2 cursor-pointer text-xs font-bold text-slate-900 focus:bg-amber-50"
                    >
                      <Printer className="w-4 h-4 text-amber-600" />
                      🖨️ 👥 १२ मुले व १२ मुली एकत्र प्रिंट ({activeUnderLabel})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleExport12BoysOnlyExcel}
                      className="gap-2 cursor-pointer text-xs font-bold text-blue-800 focus:bg-blue-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      📊 👦 फक्त १२ मुले संघ एक्सेल ({activeUnderLabel})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleExport12GirlsOnlyExcel}
                      className="gap-2 cursor-pointer text-xs font-bold text-pink-800 focus:bg-pink-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-pink-600" />
                      📊 👧 फक्त १२ मुली संघ एक्सेल ({activeUnderLabel})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleExportGame12BoysGirlsExcel}
                      className="gap-2 cursor-pointer text-xs font-bold text-emerald-800 focus:bg-emerald-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      📊 👥 १२ मुले + १२ मुली (३ टॅब WorkBook)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* DEDUPLICATED TOTAL PLAYERS DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                      title="कोणताही खेळाडू दुबार न घेता एकूण सहभागी खेळाडूंची संख्या व यादी"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      🎯 एकूण खेळाडू: {uniqueSummary.total}
                      <ChevronDown className="w-3 h-3 text-white/80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80 p-2">
                    <DropdownMenuLabel className="text-xs font-bold text-slate-800">
                      🎯 एकूण सहभागी खेळाडू मास्टर यादी
                      <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                        एकूण: {uniqueSummary.total} (👦 मुले: {uniqueSummary.boys} | 👧 मुली: {uniqueSummary.girls})
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handlePrintUniqueTournamentPlayers('all')}
                      className="gap-2 cursor-pointer text-xs font-bold text-slate-900 focus:bg-amber-50"
                    >
                      <Printer className="w-4 h-4 text-amber-600" />
                      🖨️ 👥 सर्व खेळाडू प्रिंट (मुले व मुली एकत्र)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handlePrintUniqueTournamentPlayers('boys')}
                      className="gap-2 cursor-pointer text-xs font-bold text-blue-900 focus:bg-blue-50"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                      🖨️ 👦 फक्त मुले खेळाडू प्रिंट ({uniqueSummary.boys} मुले)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handlePrintUniqueTournamentPlayers('girls')}
                      className="gap-2 cursor-pointer text-xs font-bold text-pink-900 focus:bg-pink-50"
                    >
                      <Printer className="w-4 h-4 text-pink-600" />
                      🖨️ 👧 फक्त मुली खेळाडू प्रिंट ({uniqueSummary.girls} मुली)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleExportUniqueTournamentPlayersExcel('all')}
                      className="gap-2 cursor-pointer text-xs font-bold text-emerald-800 focus:bg-emerald-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      📊 👥 सर्व खेळाडू मास्टर एक्सेल (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExportUniqueTournamentPlayersExcel('boys')}
                      className="gap-2 cursor-pointer text-xs font-bold text-blue-800 focus:bg-blue-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      📊 👦 फक्त मुले खेळाडू मास्टर एक्सेल (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExportUniqueTournamentPlayersExcel('girls')}
                      className="gap-2 cursor-pointer text-xs font-bold text-pink-800 focus:bg-pink-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-pink-600" />
                      📊 👧 फक्त मुली खेळाडू मास्टर एक्सेल (.xlsx)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* EVERY GAME 12 PLAYERS WORKBOOK */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                  onClick={handleExportEveryGame12Excel}
                  title="सर्व खेळांचे १२ खेळाडू (मुले व मुली) एकत्रित एक्सेल वर्कबुक डाउनलोड करा"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  📚 सर्व खेळ १२ खेळाडू (Excel)
                </Button>

                {/* OFFICIAL SHEET MODAL BUTTON */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                  onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                  📋 अधिकृत स्पर्धा शीट (Official Sheet)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                  onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                  📋 अधिकृत स्पर्धा शीट (Official Sheet)
                </Button>

                {isAthletics && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                    onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
                  >
                    <Medal className="w-3.5 h-3.5 text-amber-300" />
                    🏃 सर्व ६ मैदानी खेळ एकत्र शीट
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Discipline</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(sport => (
                  <SelectItem key={sport} value={sport}>
                    {SPORT_MARATHI_MAP[sport] ? `${SPORT_MARATHI_MAP[sport]} (${sport})` : sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ATHLETICS BANNER WHEN ATHLETICS DISCIPLINE SELECTED */}
      {isAthletics && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 p-4 rounded-3xl border-2 border-emerald-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">
                मैदानी व धावणे स्पर्धा (Athletics Track & Field Meet)
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी व उंच उडी सर्व खेळाडू एकत्रित अधिकृत शीटवर प्रिंट करा
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
            className="h-10 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2 shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            🏃 सर्व मैदानी खेळ एकत्रित शीट प्रिंट
          </Button>
        </div>
      )}

      {/* UNDERWISE LIST FILTER TABS */}
      <div className="bg-slate-900/5 border-2 border-slate-200/90 p-3 sm:p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-slate-900 tracking-wider">
              वयोगट यादी निवडा (Underwise List Filter)
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold">
              फक्त निवडलेल्या वयोगटाचे खेळाडू आणि संघ पाहण्यासाठी खालील टॅब निवडा
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedUnderFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedUnderFilter('all')}
            className={`h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs font-black transition-all ${
              selectedUnderFilter === 'all'
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            🌐 सर्व वयोगट (All)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedUnderFilter === 'U14' ? 'default' : 'outline'}
            onClick={() => setSelectedUnderFilter('U14')}
            className={`h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs font-black transition-all ${
              selectedUnderFilter === 'U14'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            👦👧 १४ वर्षाखालील (U-14)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedUnderFilter === 'U17' ? 'default' : 'outline'}
            onClick={() => setSelectedUnderFilter('U17')}
            className={`h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs font-black transition-all ${
              selectedUnderFilter === 'U17'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            👦👧 १७ वर्षाखालील (U-17)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedUnderFilter === 'U19' ? 'default' : 'outline'}
            onClick={() => setSelectedUnderFilter('U19')}
            className={`h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs font-black transition-all ${
              selectedUnderFilter === 'U19'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200'
            }`}
          >
            👦👧 १९ वर्षाखालील (U-19)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {displayedCategories.map(cat => (
          <Card key={cat} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[460px] max-h-[620px]">
            <div className="bg-muted/40 p-5 border-b flex justify-between items-center">
              <div>
                <span className="text-lg font-black uppercase text-primary">
                  {CATEGORY_MARATHI_MAP[cat] || cat}
                </span>
                <span className="text-xs font-bold text-muted-foreground ml-2">
                  ({cat})
                </span>
                <div className="text-[10px] text-muted-foreground font-bold">
                  Skill Hub गुण रँकिंगनुसार क्रमवारी &bull; अधिकृत वयोगट
                </div>
              </div>
              <Badge className="bg-primary text-white font-black">{processedGroups[cat].length} ATHLETES</Badge>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4 overscroll-contain touch-pan-x touch-pan-y">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase w-16 text-center">अ.क्र.</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">खेळाडू (Athlete)</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">जर्सी</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">कौशल्य क्रिया</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center text-emerald-800">कौशल्य गुण</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center text-amber-700">रँक</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedGroups[cat].slice(0, 15).map((p, i) => {
                    const currentSr = customSrNumbers[p.id] || String(i + 1);

                    return (
                      <TableRow key={p.id} className={i < 12 ? 'bg-emerald-50/40 font-medium' : 'font-medium'}>
                        {/* Editable Sr No Input */}
                        <TableCell className="p-1 text-center">
                          <Input
                            value={currentSr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomSrNumbers(prev => ({ ...prev, [p.id]: val }));
                            }}
                            className="w-12 h-7 text-center font-bold text-xs bg-amber-50 border-amber-300 focus:bg-white px-1 mx-auto"
                            title="अ.क्र. थेट बदला"
                          />
                        </TableCell>
                        <TableCell className="text-xs font-bold max-w-[130px]">
                          <div className="font-black text-slate-900 truncate">
                            {(p.nameMarathi && p.nameMarathi.trim() ? p.nameMarathi.trim() : p.name)}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-normal">
                            इ.{p.std} &bull; GR: {sanitizeGrNumber(p.generalRegisterNumber, p.serialNumber || '-')}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-black text-center text-amber-700">
                          #{p.jersey}
                        </TableCell>
                        <TableCell className="text-[10px] font-semibold text-center text-blue-900 truncate max-w-[100px]" title={p.gameActivity || p.position}>
                          {p.gameActivity || p.position}
                        </TableCell>
                        <TableCell className="text-xs font-black text-center text-emerald-700">
                          {p.skillScore !== '-' ? p.skillScore : '-'}
                        </TableCell>
                        <TableCell className="text-center font-black text-amber-600 text-xs">
                          #{p.markRank}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 sm:p-5 border-t bg-muted/20 flex flex-col gap-2">
              <Button 
                onClick={() => handleOpenOfficialSheet(cat, processedGroups[cat])} 
                disabled={processedGroups[cat].length === 0} 
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> 📋 अधिकृत क्रीडा स्पर्धा शीट (Official Sheet)
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleExportCategoryExcel(cat, processedGroups[cat])} 
                  disabled={processedGroups[cat].length === 0} 
                  variant="outline" 
                  className="w-full h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black uppercase text-xs border border-emerald-300 shadow-xs rounded-xl flex items-center justify-center gap-1.5"
                  title="हा वयोगट थेट एक्सेल (.xlsx) फाईलमध्ये डाउनलोड करा"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> 📊 एक्सेल (.xlsx)
                </Button>
                <Button 
                  onClick={() => handlePrint(cat)} 
                  disabled={processedGroups[cat].length === 0} 
                  variant="outline" 
                  className="w-full h-9 bg-white text-primary font-black uppercase text-xs tracking-widest border-2 shadow-sm rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Quick Print
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Official Tournament Sheet Modal */}
      <OfficialTournamentSheetModal
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        initialSport={selectedSport}
        initialCategory={modalCategory}
        initialPlayers={modalPlayers}
        store={store}
      />
    </div>
  );
}
