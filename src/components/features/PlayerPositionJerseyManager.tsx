"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shirt, 
  Target, 
  Users, 
  Trophy, 
  Save, 
  Printer, 
  Share2, 
  AlertCircle, 
  Crown, 
  Medal, 
  Search,
  ListOrdered,
  Activity,
  Layers,
  Camera,
  Shield,
  Upload,
  UserCheck,
  Zap,
  Sparkles,
  Check,
  X,
  UserPlus,
  Edit3,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  cn, 
  getAgeValidation, 
  getOfficialSchoolName, 
  getTeacherName, 
  getSportPositions,
  SPORT_POSITIONS_MAP,
  LEFT_COURT_POSITIONS,
  MIDDLE_COURT_POSITIONS,
  RIGHT_COURT_POSITIONS,
  NUMBERED_COURT_POSITIONS,
  getPositionBadgeInfo,
  transliterateEnglishToMarathi,
  sanitizeGrNumber
} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

export const KABADDI_QUICK_POSITIONS = [
  { num: 1, code: 'RC', name: 'उजवा कोपरा (Right Corner)', shortMr: 'उ.कोपरा' },
  { num: 2, code: 'RI', name: 'उजवा इन (Right In)', shortMr: 'उ.इन' },
  { num: 3, code: 'RCv', name: 'उजवा कव्हर (Right Cover)', shortMr: 'उ.कव्हर' },
  { num: 4, code: 'CTR', name: 'मध्यरक्षक / सेंटर (Center)', shortMr: 'सेंटर' },
  { num: 5, code: 'LCv', name: 'डावा कव्हर (Left Cover)', shortMr: 'डा.कव्हर' },
  { num: 6, code: 'LI', name: 'डावा इन (Left In)', shortMr: 'डा.इन' },
  { num: 7, code: 'LC', name: 'डावा कोपरा (Left Corner)', shortMr: 'डा.कोपरा' },
];

const SUPPORTED_SPORTS = [
  'Kabaddi',
  'Volleyball',
  'Kho Kho',
  'Athletics',
  'Handball',
  'Running',
  'Shot Put',
  'Javelin Throw',
  'Disc Throw',
  'Long Jump',
  'High Jump',
  'Yoga',
  'PT Mass'
];

interface CourtPositionDef {
  id: string;
  nameEn: string;
  nameMr: string;
  shortCode: string;
  role: 'Attack' | 'Defense' | 'Setter' | 'Specialist';
  defaultPosName: string;
}

const SPORT_SQUAD_CONFIG: Record<string, {
  startersCount: number;
  reservesCount: number;
  maxSquad: number;
  courtTitle: string;
  courtSubtitle: string;
  positions: CourtPositionDef[];
}> = {
  'Kabaddi': {
    startersCount: 7,
    reservesCount: 5,
    maxSquad: 12,
    courtTitle: 'कबड्डी मॅट रणनीती (७ मुख्य खेळाडू + ५ राखीव)',
    courtSubtitle: 'अधिकृत कबड्डी नियमानुसार मैदानावर एका वेळी ७ खेळाडू आणि राखीव बाकावर ५ खेळाडू (एकूण १२)',
    positions: [
      { id: 'right_corner', nameEn: 'Right Corner', nameMr: 'उजवा कोपरा (Right Corner)', shortCode: 'RC', role: 'Defense', defaultPosName: 'उजवा कोपरा (Right Corner)' },
      { id: 'right_in', nameEn: 'Right In', nameMr: 'उजवा इन (Right In)', shortCode: 'RI', role: 'Defense', defaultPosName: 'उजवा इन (Right In)' },
      { id: 'right_cover', nameEn: 'Right Cover', nameMr: 'उजवा कव्हर (Right Cover)', shortCode: 'RCv', role: 'Defense', defaultPosName: 'उजवा कव्हर (Right Cover)' },
      { id: 'center', nameEn: 'Center', nameMr: 'मध्यरक्षक / सेंटर (Center)', shortCode: 'CTR', role: 'Attack', defaultPosName: 'मध्यरक्षक / सेंटर (Center)' },
      { id: 'left_cover', nameEn: 'Left Cover', nameMr: 'डावा कव्हर (Left Cover)', shortCode: 'LCv', role: 'Defense', defaultPosName: 'डावा कव्हर (Left Cover)' },
      { id: 'left_in', nameEn: 'Left In', nameMr: 'डावा इन (Left In)', shortCode: 'LI', role: 'Defense', defaultPosName: 'डावा इन (Left In)' },
      { id: 'left_corner', nameEn: 'Left Corner', nameMr: 'डावा कोपरा (Left Corner)', shortCode: 'LC', role: 'Defense', defaultPosName: 'डावा कोपरा (Left Corner)' },
    ]
  },
  'Volleyball': {
    startersCount: 6,
    reservesCount: 6,
    maxSquad: 12,
    courtTitle: 'व्हॉलीबॉल कोर्ट रोटेशन (६ मुख्य खेळाडू + ६ राखीव)',
    courtSubtitle: 'अधिकृत व्हॉलीबॉल नियमानुसार मैदानावर ६ खेळाडू (झोन १ ते ६) आणि राखीव बाकावर ६ खेळाडू (एकूण १२)',
    positions: [
      { id: 'pos4_oh1', nameEn: 'Pos 4: Left Front (OH1)', nameMr: 'झोन ४: डावा आक्रमक (OH1)', shortCode: 'Z4-OH', role: 'Attack', defaultPosName: 'आक्रमक / स्मॅशर (Spiker)' },
      { id: 'pos3_mb1', nameEn: 'Pos 3: Middle Blocker 1', nameMr: 'झोन ३: मध्यम ब्लॉकर (MB1)', shortCode: 'Z3-MB', role: 'Defense', defaultPosName: 'मध्यरक्षक / ब्लॉकर' },
      { id: 'pos2_opp', nameEn: 'Pos 2: Right Front (Setter/Opp)', nameMr: 'झोन २: सेटर / उजवा आक्रमक', shortCode: 'Z2-SET', role: 'Setter', defaultPosName: 'सेटर (Setter / पासर)' },
      { id: 'pos5_lb', nameEn: 'Pos 5: Left Back', nameMr: 'झोन ५: डावा बचावपटू (LB)', shortCode: 'Z5-LB', role: 'Defense', defaultPosName: 'डावा पाठीमागील रक्षक' },
      { id: 'pos6_lib', nameEn: 'Pos 6: Middle Back / Libero', nameMr: 'झोन ६: लिबेरो / मध्य बचावपटू', shortCode: 'Z6-LIB', role: 'Specialist', defaultPosName: 'लिबेरो / मुख्य बचावपटू' },
      { id: 'pos1_s', nameEn: 'Pos 1: Right Back / Server', nameMr: 'झोन १: सर्व्हर / उजवा बचावपटू', shortCode: 'Z1-SRV', role: 'Defense', defaultPosName: 'सर्व्हर / रक्षक' },
    ]
  },
  'Kho Kho': {
    startersCount: 9,
    reservesCount: 3,
    maxSquad: 12,
    courtTitle: 'खो-खो मैदान रचना (९ मुख्य खेळाडू + ३ राखीव)',
    courtSubtitle: 'अधिकृत खो-खो नियमानुसार मैदानावर ९ खेळाडू (८ बसलेले चेझर + १ सक्रिय) आणि राखीव ३ (एकूण १२)',
    positions: [
      { id: 'chaser_1', nameEn: 'Pole 1 Chaser', nameMr: 'खांब १ चेझर', shortCode: 'P1', role: 'Attack', defaultPosName: 'खांब १ चेझर' },
      { id: 'chaser_2', nameEn: 'Square 2', nameMr: 'चौकोन २', shortCode: 'SQ2', role: 'Attack', defaultPosName: 'चौकोन २ चेझर' },
      { id: 'chaser_3', nameEn: 'Square 3', nameMr: 'चौकोन ३', shortCode: 'SQ3', role: 'Attack', defaultPosName: 'चौकोन ३ चेझर' },
      { id: 'chaser_4', nameEn: 'Square 4 (Center)', nameMr: 'मध्य चौकोन ४', shortCode: 'SQ4', role: 'Attack', defaultPosName: 'मध्य चौकोन ४' },
      { id: 'chaser_5', nameEn: 'Square 5 (Center)', nameMr: 'मध्य चौकोन ५', shortCode: 'SQ5', role: 'Attack', defaultPosName: 'मध्य चौकोन ५' },
      { id: 'chaser_6', nameEn: 'Square 6', nameMr: 'चौकोन ६', shortCode: 'SQ6', role: 'Attack', defaultPosName: 'चौकोन ६ चेझर' },
      { id: 'chaser_7', nameEn: 'Square 7', nameMr: 'चौकोन ७', shortCode: 'SQ7', role: 'Attack', defaultPosName: 'चौकोन ७ चेझर' },
      { id: 'chaser_8', nameEn: 'Pole 2 Chaser', nameMr: 'खांब २ चेझर', shortCode: 'P2', role: 'Attack', defaultPosName: 'खांब २ चेझर' },
      { id: 'active_attacker', nameEn: 'Active Chaser (Attacker)', nameMr: 'सक्रिय आक्रमक चेझर', shortCode: 'ACT', role: 'Attack', defaultPosName: 'सक्रिय आक्रमक' },
    ]
  }
};

export function PlayerPositionJerseyManager({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<string>(preselectedSport || 'Kabaddi');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'court' | 'lanes' | 'table'>('court');
  const [sortBy, setSortBy] = useState<'skills' | 'jersey' | 'name'>('skills');
  const [isSaving, setIsSaving] = useState(false);

  // Coach Manual Captain & Vice Captain Selection
  const [captainId, setCaptainId] = useState<string>('');
  const [viceCaptainId, setViceCaptainId] = useState<string>('');

  // Local draft changes: playerId -> { jersey: string, position: string, isCaptain?: boolean, isViceCaptain?: boolean, photoUrl?: string }
  const [draftChanges, setDraftChanges] = useState<Record<string, { jersey?: string; position?: string; isCaptain?: boolean; isViceCaptain?: boolean; photoUrl?: string }>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allPlayers = useMemo(() => store?.data?.players || [], [store?.data?.players]);
  const availablePositions = useMemo(() => getSportPositions(selectedSport), [selectedSport]);

  const squadConfig = useMemo(() => {
    return SPORT_SQUAD_CONFIG[selectedSport] || {
      startersCount: 7,
      reservesCount: 5,
      maxSquad: 12,
      courtTitle: `${selectedSport} ग्राउंड रणनीती व्यू`,
      courtSubtitle: `अधिकृत १२ खेळाडूंचा सामना रोस्टर`,
      positions: (SPORT_POSITIONS_MAP[selectedSport] || []).map((pos: any) => ({
        id: pos.id,
        nameEn: pos.nameEn,
        nameMr: pos.nameMr,
        shortCode: pos.shortCode,
        role: pos.category || 'Specialist',
        defaultPosName: pos.nameMr
      }))
    };
  }, [selectedSport]);

  // Filter & Sort players for selected sport (Default: Ranked by Skills Marks!)
  const sportPlayers = useMemo(() => {
    const list = allPlayers.filter((p: any) => {
      const matchSport = p.sports && p.sports.includes(selectedSport);
      if (!matchSport) return false;

      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;

      const ageVal = getAgeValidation(p.dob);
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'U14' && ageVal?.eligibilityType !== 'U14') return false;
        if (selectedCategory === 'U17' && ageVal?.eligibilityType !== 'U17') return false;
        if (selectedCategory === 'U19' && ageVal?.eligibilityType !== 'U19') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const marathi = p.nameMarathi || transliterateEnglishToMarathi(p.name) || '';
        const matchName = (p.name || '').toLowerCase().includes(q) || marathi.includes(q);
        const matchGR = (p.generalRegisterNumber || '').toLowerCase().includes(q);
        if (!matchName && !matchGR) return false;
      }

      return true;
    });

    return list.sort((a: any, b: any) => {
      if (sortBy === 'skills') {
        const aSkill = parseFloat(store?.data?.sportSkills?.[`${a.id}_${selectedSport}`]?.score || '0');
        const bSkill = parseFloat(store?.data?.sportSkills?.[`${b.id}_${selectedSport}`]?.score || '0');
        if (bSkill !== aSkill) return bSkill - aSkill;

        const aFit = parseFloat(store?.data?.fitness?.[a.id]?.score || '0');
        const bFit = parseFloat(store?.data?.fitness?.[b.id]?.score || '0');
        if (bFit !== aFit) return bFit - aFit;
      } else if (sortBy === 'jersey') {
        const aJ = parseInt(draftChanges[a.id]?.jersey || a.jerseyNumbers?.[selectedSport] || a.jerseyNumber || '999', 10);
        const bJ = parseInt(draftChanges[b.id]?.jersey || b.jerseyNumbers?.[selectedSport] || b.jerseyNumber || '999', 10);
        if (aJ !== bJ) return aJ - bJ;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allPlayers, selectedSport, selectedGender, selectedCategory, searchQuery, sortBy, draftChanges, store?.data?.sportSkills, store?.data?.fitness]);

  // Manual Slot Assignments for Tactical Court: Slot Index -> PlayerId
  const [slotAssignments, setSlotAssignments] = useState<Record<number, string>>({});

  // Add / Edit Player Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);
  const [targetPositionDef, setTargetPositionDef] = useState<CourtPositionDef | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'roster' | 'new'>('roster');
  const [modalSearch, setModalSearch] = useState('');

  // New Player Direct Creation Form State
  const [newPlayerNameEn, setNewPlayerNameEn] = useState('');
  const [newPlayerNameMr, setNewPlayerNameMr] = useState('');
  const [newPlayerStd, setNewPlayerStd] = useState('8');
  const [newPlayerGender, setNewPlayerGender] = useState('Male');
  const [newPlayerJersey, setNewPlayerJersey] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // Determine starters, reserves, and extended pool based on Skills Rankings and Slot Assignments
  const { starters, reserves, extendedPool } = useMemo(() => {
    const startersLimit = squadConfig.startersCount;
    const maxSquad = squadConfig.maxSquad;

    const startersList: any[] = [];
    const usedPlayerIds = new Set<string>();

    for (let i = 0; i < startersLimit; i++) {
      const assignedId = slotAssignments[i];
      let assignedPlayer = assignedId ? allPlayers.find((p: any) => p.id === assignedId) : null;

      // If not manually assigned by slot, check if any sportPlayer matches this slot's position and is not yet used
      if (!assignedPlayer && squadConfig.positions[i]) {
        const posDef = squadConfig.positions[i];
        assignedPlayer = sportPlayers.find((p: any) => {
          if (usedPlayerIds.has(p.id)) return false;
          const draft = draftChanges[p.id];
          const pos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '');
          return pos === posDef.nameMr || pos === posDef.nameEn || pos === posDef.shortCode;
        });
      }

      // Fallback: take next available from sportPlayers
      if (!assignedPlayer) {
        assignedPlayer = sportPlayers.find((p: any) => !usedPlayerIds.has(p.id)) || null;
      }

      if (assignedPlayer) {
        usedPlayerIds.add(assignedPlayer.id);
        startersList.push(assignedPlayer);
      }
    }

    const remainingSportPlayers = sportPlayers.filter((p: any) => !usedPlayerIds.has(p.id));
    const reservesList = remainingSportPlayers.slice(0, squadConfig.reservesCount);
    reservesList.forEach((p: any) => usedPlayerIds.add(p.id));
    const extendedList = remainingSportPlayers.slice(squadConfig.reservesCount);

    return {
      starters: startersList,
      reserves: reservesList,
      extendedPool: extendedList
    };
  }, [sportPlayers, allPlayers, squadConfig, slotAssignments, draftChanges, selectedSport]);

  const handleOpenAddEditModal = (slotIndex: number, posDef?: CourtPositionDef) => {
    setTargetSlotIndex(slotIndex);
    const position = posDef || squadConfig.positions[slotIndex] || squadConfig.positions[0];
    setTargetPositionDef(position);
    setNewPlayerPosition(position?.nameMr || 'उजवा कोपरा (Right Corner)');
    setNewPlayerJersey(`${slotIndex + 1}`);
    setNewPlayerNameEn('');
    setNewPlayerNameMr('');
    setModalSearch('');
    setActiveModalTab('roster');
    setIsAddEditModalOpen(true);
  };

  const handleAssignExistingPlayer = (player: any) => {
    if (targetSlotIndex === null) return;
    const pos = targetPositionDef?.nameMr || squadConfig.positions[targetSlotIndex]?.nameMr || 'खेळाडू';

    setSlotAssignments(prev => ({
      ...prev,
      [targetSlotIndex]: player.id
    }));

    setDraftChanges(prev => ({
      ...prev,
      [player.id]: {
        ...prev[player.id],
        position: pos,
        jersey: prev[player.id]?.jersey || player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || `${targetSlotIndex + 1}`
      }
    }));

    if (store?.updatePlayer && (!player.sports || !player.sports.includes(selectedSport))) {
      const updatedSports = Array.from(new Set([...(player.sports || []), selectedSport]));
      store.updatePlayer({
        ...player,
        sports: updatedSports,
        positions: {
          ...(player.positions || {}),
          [selectedSport]: pos
        }
      });
    }

    setIsAddEditModalOpen(false);
    toast({
      title: "✅ खेळाडू रणनीतीमध्ये नियुक्त!",
      description: `${player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name} यांना ${pos} स्थानावर नियुक्त केले.`
    });
  };

  const handleCreateAndAssignNewPlayer = async () => {
    if (!newPlayerNameEn.trim() && !newPlayerNameMr.trim()) {
      toast({
        title: "नाव आवश्यक आहे",
        description: "कृपया खेळाडूचे नाव प्रविष्ट करा.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPlayer(true);
    try {
      const enName = newPlayerNameEn.trim() || newPlayerNameMr.trim();
      const mrName = newPlayerNameMr.trim() || transliterateEnglishToMarathi(enName);
      const pos = newPlayerPosition || targetPositionDef?.nameMr || 'खेळाडू';
      const jersey = newPlayerJersey.trim() || `${(targetSlotIndex !== null ? targetSlotIndex : 0) + 1}`;
      const newId = `std_${Date.now()}`;

      const newPlayer = {
        id: newId,
        name: enName,
        nameMarathi: mrName,
        gender: newPlayerGender,
        std: newPlayerStd,
        sports: [selectedSport],
        positions: { [selectedSport]: pos },
        jerseyNumber: jersey,
        jerseyNumbers: { [selectedSport]: jersey },
        generalRegisterNumber: `GR-${Math.floor(1000 + Math.random() * 9000)}`,
        dob: '2010-06-01',
        ageCategory: 'U17',
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      if (store?.addPlayer) {
        await store.addPlayer(newPlayer);
      }

      if (targetSlotIndex !== null) {
        setSlotAssignments(prev => ({
          ...prev,
          [targetSlotIndex]: newId
        }));
      }

      setDraftChanges(prev => ({
        ...prev,
        [newId]: {
          position: pos,
          jersey: jersey
        }
      }));

      setIsAddEditModalOpen(false);
      toast({
        title: "🎉 नवीन खेळाडू तयार व रणनीतीत जोडला!",
        description: `${mrName} (#${jersey}) यांना ${selectedSport} संघात व ${pos} स्थानावर जोडले आहे.`
      });
    } catch (err) {
      toast({
        title: "त्रुटी",
        description: "खेळाडू जोडताना त्रुटी आली.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const handleClearSlot = (slotIndex: number) => {
    setSlotAssignments(prev => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
    setIsAddEditModalOpen(false);
    toast({
      title: "स्थान रिक्त केले",
      description: "या स्थानावरील खेळाडू हटवला आहे."
    });
  };

  // Initialize coach captain state from player flags if not explicitly set
  useEffect(() => {
    const currentCap = sportPlayers.find((p: any) => p.isCaptain || p.positions?.[selectedSport]?.toLowerCase().includes('captain'));
    const currentVC = sportPlayers.find((p: any) => p.isViceCaptain || p.positions?.[selectedSport]?.toLowerCase().includes('vice'));
    if (currentCap) setCaptainId(prev => prev || currentCap.id);
    if (currentVC) setViceCaptainId(prev => prev || currentVC.id);
  }, [sportPlayers, selectedSport]);

  // Compute jersey duplicates
  const jerseyDuplicates = useMemo(() => {
    const counts: Record<string, string[]> = {};
    
    sportPlayers.forEach((p: any) => {
      const draft = draftChanges[p.id];
      const jersey = (draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '')).trim();
      if (jersey) {
        if (!counts[jersey]) counts[jersey] = [];
        counts[jersey].push(p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name);
      }
    });

    const duplicates = new Set<string>();
    Object.entries(counts).forEach(([num, names]) => {
      if (names.length > 1) {
        duplicates.add(num);
      }
    });

    return { duplicates, counts };
  }, [sportPlayers, draftChanges, selectedSport]);

  const handleJerseyChange = (playerId: string, value: string) => {
    const cleanNum = value.replace(/[^0-9]/g, '').slice(0, 3);
    setDraftChanges(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        jersey: cleanNum
      }
    }));
  };

  const handlePositionChange = (playerId: string, value: string) => {
    setDraftChanges(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        position: value
      }
    }));
  };

  // ⚡ 1-Click Auto Select Final Match Squad & Assign Official Positions Based on Skills Marks
  const handleAutoSelectSquadBySkills = () => {
    if (sportPlayers.length === 0) {
      toast({
        title: "खेळाडू सापडले नाहीत",
        description: `${selectedSport} खेळामध्ये कोणतेही खेळाडू नोंदणीकृत नाहीत.`,
        variant: "destructive"
      });
      return;
    }

    // Rank players strictly by skills score (and fitness as secondary)
    const sortedBySkills = [...sportPlayers].sort((a: any, b: any) => {
      const aSkill = parseFloat(store?.data?.sportSkills?.[`${a.id}_${selectedSport}`]?.score || '0');
      const bSkill = parseFloat(store?.data?.sportSkills?.[`${b.id}_${selectedSport}`]?.score || '0');
      if (bSkill !== aSkill) return bSkill - aSkill;
      const aFit = parseFloat(store?.data?.fitness?.[a.id]?.score || '0');
      const bFit = parseFloat(store?.data?.fitness?.[b.id]?.score || '0');
      return bFit - aFit;
    });

    const startersLimit = squadConfig.startersCount;
    const maxSquad = squadConfig.maxSquad;
    const final12 = sortedBySkills.slice(0, maxSquad);

    const newDraft: typeof draftChanges = { ...draftChanges };

    final12.forEach((player: any, idx: number) => {
      const isStarter = idx < startersLimit;
      let assignedPos = '';

      if (selectedSport === 'Kabaddi') {
        if (isStarter) {
          // Official 7 starting positions:
          // 1: Right Corner, 2: Right In, 3: Right Cover, 4: Center (Main Raider), 5: Left Cover, 6: Left In, 7: Left Corner
          const kabaddiPositions = [
            'उजवा कोपरा (Right Corner)',
            'उजवा इन (Right In)',
            'उजवा कव्हर (Right Cover)',
            'मध्यरक्षक / सेंटर (Center)',
            'डावा कव्हर (Left Cover)',
            'डावा इन (Left In)',
            'डावा कोपरा (Left Corner)'
          ];
          assignedPos = kabaddiPositions[idx] || 'खेळाडू';
        } else {
          const kabaddiReserves = [
            'राखीव - चढाईपटू (Reserve Raider)',
            'राखीव - कोपरा रक्षक (Reserve Corner)',
            'राखीव - कव्हर रक्षक (Reserve Cover)',
            'राखीव - अष्टपैलू (Reserve All-Rounder)',
            'राखीव - बचावपटू (Reserve Defender)'
          ];
          assignedPos = kabaddiReserves[idx - startersLimit] || 'राखीव खेळाडू';
        }
      } else {
        if (isStarter && squadConfig.positions[idx]) {
          assignedPos = squadConfig.positions[idx].defaultPosName || squadConfig.positions[idx].nameMr;
        } else {
          assignedPos = `राखीव खेळाडू ${idx - startersLimit + 1}`;
        }
      }

      newDraft[player.id] = {
        ...(newDraft[player.id] || {}),
        position: assignedPos,
        jersey: (idx + 1).toString(),
        isCaptain: idx === 0,
        isViceCaptain: idx === 1
      };
    });

    setCaptainId(final12[0]?.id || '');
    setViceCaptainId(final12[1]?.id || '');
    setSortBy('skills');
    setDraftChanges(newDraft);

    toast({
      title: "🎯 कौशल्य गुणांवरून अंतिम संघ निवडला! ✅",
      description: `सर्वोच्च कौशल्य गुणांच्या आधारे ${final12.length} खेळाडूंची अंतिम संघात निवड केली असून #१ ते #${startersLimit} मुख्य पोझिशन्स व जर्सी क्रमांक दिले आहेत. जतन करण्यासाठी 'बदल सेव्ह करा' दाबा.`
    });
  };

  // 1-Click Auto-Number Jerseys #1 to #12 for the squad
  const handleAutoNumberJerseys = () => {
    const maxSquad = squadConfig.maxSquad;
    const squadPlayers = sportPlayers.slice(0, maxSquad);
    const newDraft: typeof draftChanges = { ...draftChanges };

    squadPlayers.forEach((player: any, idx: number) => {
      newDraft[player.id] = {
        ...(newDraft[player.id] || {}),
        jersey: (idx + 1).toString()
      };
    });

    setDraftChanges(newDraft);
    toast({
      title: "🔢 जर्सी क्रमांक १ ते १२ दिले!",
      description: `संघातील १२ खेळाडूंना अनुक्रमे १ ते १२ जर्सी क्रमांक दिले आहेत.`
    });
  };

  const handleSetCaptain = (playerId: string) => {
    if (captainId === playerId) {
      setCaptainId('');
      setDraftChanges(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], isCaptain: false }
      }));
      toast({ title: "कर्णधार पद काढले" });
    } else {
      setCaptainId(playerId);
      if (viceCaptainId === playerId) setViceCaptainId('');
      setDraftChanges(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], isCaptain: true, isViceCaptain: false }
      }));
      const pl = sportPlayers.find((p: any) => p.id === playerId);
      toast({ 
        title: "👑 मुख्य कर्णधार नियुक्त!", 
        description: `${pl?.nameMarathi || pl?.name} यांना ${selectedSport} संघाचा मुख्य कर्णधार बनवले.` 
      });
    }
  };

  const handleSetViceCaptain = (playerId: string) => {
    if (viceCaptainId === playerId) {
      setViceCaptainId('');
      setDraftChanges(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], isViceCaptain: false }
      }));
      toast({ title: "उपकर्णधार पद काढले" });
    } else {
      setViceCaptainId(playerId);
      if (captainId === playerId) setCaptainId('');
      setDraftChanges(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], isViceCaptain: true, isCaptain: false }
      }));
      const pl = sportPlayers.find((p: any) => p.id === playerId);
      toast({ 
        title: "🥈 उपकर्णधार नियुक्त!", 
        description: `${pl?.nameMarathi || pl?.name} यांना ${selectedSport} संघाचा उपकर्णधार बनवले.` 
      });
    }
  };

  const handlePhotoUpload = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "फोटोचा आकार खूप मोठा आहे", description: "कृपया २ MB पेक्षा लहान फोटो निवडा.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setDraftChanges(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          photoUrl: base64
        }
      }));

      const original = allPlayers.find((p: any) => p.id === playerId);
      if (original && store?.updatePlayer) {
        store.updatePlayer({ ...original, photoUrl: base64 });
      }

      toast({ title: "📸 खेळाडूचा फोटो यशस्वीरित्या जोडला!" });
    };
    reader.readAsDataURL(file);
  };

  const hasUnsavedChanges = Object.keys(draftChanges).length > 0;

  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);

    try {
      for (const [playerId, change] of Object.entries(draftChanges)) {
        const original = allPlayers.find((p: any) => p.id === playerId);
        if (!original) continue;

        const updatedJerseyNumbers = { ...(original.jerseyNumbers || {}) };
        const updatedPositions = { ...(original.positions || {}) };

        if (change.jersey !== undefined) {
          updatedJerseyNumbers[selectedSport] = change.jersey;
        }
        if (change.position !== undefined) {
          updatedPositions[selectedSport] = change.position;
        }

        const isCapt = change.isCaptain !== undefined ? change.isCaptain : (captainId === playerId);
        const isVC = change.isViceCaptain !== undefined ? change.isViceCaptain : (viceCaptainId === playerId);

        const updatedPlayer = {
          ...original,
          jerseyNumber: change.jersey !== undefined ? change.jersey : original.jerseyNumber,
          jerseyNumbers: updatedJerseyNumbers,
          positions: updatedPositions,
          isCaptain: isCapt,
          isViceCaptain: isVC,
          photoUrl: change.photoUrl || original.photoUrl
        };

        if (store.updatePlayer) {
          await store.updatePlayer(updatedPlayer);
        }
      }

      setDraftChanges({});
      toast({
        title: "जर्सी, पोझिशन्स व कर्णधार सेव्ह झाले! ✅",
        description: `${selectedSport} संघ माहिती यशस्वीरित्या अद्ययावत झाली.`
      });
    } catch (err) {
      toast({
        title: "त्रुटी",
        description: "माहिती जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppSquadShare = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const formatPlayerLine = (p: any, idx: number) => {
      const draft = draftChanges[p.id];
      const jersey = draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || `${idx + 1}`);
      const pos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '-');
      const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
      const roleBadge = (captainId === p.id || draft?.isCaptain) ? ' 👑 [कर्णधार]' : (viceCaptainId === p.id || draft?.isViceCaptain) ? ' 🥈 [उपकर्णधार]' : '';
      return `${idx + 1}. #${jersey} ${displayName}${roleBadge} (इ. ${p.std} वी) - 📍 ${pos}`;
    };

    const startersText = starters.map((p: any, idx: number) => formatPlayerLine(p, idx)).join('\n');
    const reservesText = reserves.map((p: any, idx: number) => formatPlayerLine(p, starters.length + idx)).join('\n');

    const msg = `🏆 *${schoolName}*\n📋 *अधिकृत १२ खेळाडू सामना रोस्टर (Match Squad)*\n\n*क्रीडा प्रकार:* ${selectedSport}\n*गट:* ${selectedCategory} (${selectedGender})\n*क्रीडा शिक्षक / मार्गदर्शक:* ${teacherName}\n==============================\n⚡ *मैदानावरील मुख्य खेळाडू (Starters - ${starters.length}):*\n${startersText || 'खेळाडू नियुक्त नाहीत'}\n\n🛡️ *राखीव खेळाडू (Reserves - ${reserves.length}):*\n${reservesText || 'राखीव खेळाडू नाहीत'}\n==============================\nवाघंबा स्पोर्ट्स हब अधिकृत प्रणाली`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handlePrintLineup = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const renderRows = (list: any[], startIndex: number, typeLabel: string) => {
      return list.map((p: any, idx: number) => {
        const draft = draftChanges[p.id];
        const jersey = draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || `${startIndex + idx + 1}`);
        const pos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '-');
        const ageVal = getAgeValidation(p.dob);
        const isCapt = (captainId === p.id || draft?.isCaptain);
        const isVC = (viceCaptainId === p.id || draft?.isViceCaptain);
        const roleLabel = isCapt ? '<b style="color:#d97706;">⭐ कर्णधार (CPT)</b>' : isVC ? '<b style="color:#475569;">🥈 उपकर्णधार (VC)</b>' : typeLabel;

        const photoImg = (draft?.photoUrl || p.photoUrl) 
          ? `<img src="${draft?.photoUrl || p.photoUrl}" style="height: 38px; width: 38px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" />` 
          : '<div style="font-size: 7px; color: #94a3b8; border: 1px dashed #cbd5e1; height: 38px; width: 38px; display: flex; align-items: center; justify-content: center;">Photo</div>';

        return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${startIndex + idx + 1}</td>
            <td style="text-align: center; font-weight: 900; font-size: 13px; color: #1e3a8a; background: #f8fafc;">
              #${jersey}
            </td>
            <td style="text-align: center; width: 45px; padding: 2px;">
              ${photoImg}
            </td>
            <td>
              <div style="font-weight: 800; font-size: 11px;">${p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name}</div>
              <div style="font-size: 9px; color: #64748b;">${p.name} &bull; GR: ${sanitizeGrNumber(p.generalRegisterNumber, p.serialNumber || '-')}</div>
            </td>
            <td style="text-align: center; font-weight: bold;">इ. ${p.std} वी</td>
            <td style="text-align: center; font-weight: bold; color: #047857;">${pos}</td>
            <td style="text-align: center;">${roleLabel}</td>
            <td style="text-align: center;">${ageVal?.category || p.ageCategory || '-'}</td>
            <td style="width: 70px;"></td>
          </tr>
        `;
      }).join('');
    };

    const startersRows = renderRows(starters, 0, 'मुख्य खेळाडू (Starter)');
    const reservesRows = renderRows(reserves, starters.length, 'राखीव (Reserve)');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Match Squad Lineup - ${selectedSport}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print { 
              @page { size: A4 portrait; margin: 0.8cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.3; font-size: 10px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 18px; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
            .header-table td { border: none; padding: 2px; }
            
            .school-title { font-size: 16px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 11px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 12px; font-weight: 900; padding: 5px; border-radius: 4px; margin: 6px 0 10px 0; text-transform: uppercase; }
            
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9.5px; }
            table.data-table th, table.data-table td { border: 1px solid #64748b; padding: 4px 5px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; text-align: center; }
            
            .section-header { background: #047857; color: white; font-weight: 900; padding: 3px 8px; font-size: 10px; text-transform: uppercase; border-radius: 3px; margin-top: 10px; }
            .section-header-sub { background: #334155; color: white; font-weight: 900; padding: 3px 8px; font-size: 10px; text-transform: uppercase; border-radius: 3px; margin-top: 10px; }

            .footer-sign { display: flex; justify-content: space-between; margin-top: 25px; padding: 0 20px; font-size: 10.5px; font-weight: 800; }
            .sign-box { text-align: center; min-width: 180px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 55px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत १२ खेळाडू सामना तक्ता प्रिंट करा (A4 Sheet)</button>
          </div>
          
          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 50px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन - शालेय क्रीडा स्पर्धा अधिकृत सामना रोस्टर</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 45px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              अधिकृत १२ खेळाडू सामना रोस्टर व जर्सी क्रमांक (Official 12-Player Squad) - ${selectedSport}
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 800; font-size: 10px; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">
              <div>खेळ: <span style="color: #1e3a8a;">${selectedSport}</span></div>
              <div>वयोगट: <span style="color: #1e3a8a;">${selectedCategory} (${selectedGender})</span></div>
              <div>नियम: <span style="color: #1e3a8a;">${starters.length} मुख्य + ${reserves.length} राखीव = एकूण ${starters.length + reserves.length} खेळाडू</span></div>
            </div>

            <div class="section-header">मैदानातील मुख्य खेळाडू (Starters - ${starters.length})</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px;">अ.क्र.</th>
                  <th style="width: 50px;">जर्सी नं.</th>
                  <th style="width: 45px;">फोटो</th>
                  <th>खेळाडूचे नाव (Player Name)</th>
                  <th style="width: 45px;">इयत्ता</th>
                  <th>स्थान / पोझिशन (Position)</th>
                  <th style="width: 80px;">भूमिका (Role)</th>
                  <th style="width: 60px;">वयोगट</th>
                  <th style="width: 65px;">स्वाक्षरी</th>
                </tr>
              </thead>
              <tbody>
                ${startersRows}
              </tbody>
            </table>

            ${reserves.length > 0 ? `
              <div class="section-header-sub">राखीव खेळाडू (Reserves / Substitutes - ${reserves.length})</div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 25px;">अ.क्र.</th>
                    <th style="width: 50px;">जर्सी नं.</th>
                    <th style="width: 45px;">फोटो</th>
                    <th>खेळाडूचे नाव (Player Name)</th>
                    <th style="width: 45px;">इयत्ता</th>
                    <th>स्थान / पोझिशन (Position)</th>
                    <th style="width: 80px;">भूमिका (Role)</th>
                    <th style="width: 60px;">वयोगट</th>
                    <th style="width: 65px;">स्वाक्षरी</th>
                  </tr>
                </thead>
                <tbody>
                  ${reservesRows}
                </tbody>
              </table>
            ` : ''}

            <div class="footer-sign">
              <div class="sign-box">
                <br/><br/>
                <div>क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>मुख्याध्यापक स्वाक्षरी व शिक्का</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">${schoolName}</div>
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

  // Render options for position select dropdowns
  const renderPositionSelectOptions = () => {
    const sportSpecific = (SPORT_POSITIONS_MAP[selectedSport] || []).map(p => ({
      id: p.id,
      nameMr: p.nameMr,
      shortCode: p.shortCode,
    }));

    // For Kabaddi, show strictly the 7 official player positions as per rules
    if (selectedSport === 'Kabaddi') {
      return (
        <SelectGroup>
          <SelectLabel className="text-[10px] font-black uppercase text-amber-500 tracking-wider py-1 px-2">
            🎯 अधिकृत ७ कबड्डी पोझिशन्स (7 Kabaddi Positions)
          </SelectLabel>
          {sportSpecific.map(pos => (
            <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
              <span className="font-mono text-emerald-500 font-bold mr-1.5">[{pos.shortCode}]</span> {pos.nameMr}
            </SelectItem>
          ))}
        </SelectGroup>
      );
    }

    return (
      <>
        {sportSpecific.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] font-black uppercase text-amber-500 tracking-wider py-1 px-2">
              🎯 अधिकृत {selectedSport} पोझिशन्स
            </SelectLabel>
            {sportSpecific.map(pos => (
              <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
                <span className="font-mono text-emerald-500 font-bold mr-1.5">[{pos.shortCode}]</span> {pos.nameMr}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        <SelectSeparator className="my-1" />

        {/* Left 1 to 6 */}
        <SelectGroup>
          <SelectLabel className="text-[10px] font-black uppercase text-blue-500 tracking-wider py-1 px-2 flex items-center justify-between">
            <span>⬅️ डावी फळी (Left 1 ते 6)</span>
            <span className="text-[9px] font-mono text-blue-400">६ पोझिशन्स</span>
          </SelectLabel>
          {LEFT_COURT_POSITIONS.map(pos => (
            <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
              <span className="font-mono text-blue-600 dark:text-blue-400 font-black mr-1.5">[{pos.shortCode}]</span> {pos.nameMr}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator className="my-1" />

        {/* Middle 1 to 5 */}
        <SelectGroup>
          <SelectLabel className="text-[10px] font-black uppercase text-amber-500 tracking-wider py-1 px-2 flex items-center justify-between">
            <span>⏺️ मध्य फळी (Middle 1 ते 5)</span>
            <span className="text-[9px] font-mono text-amber-400">५ पोझिशन्स</span>
          </SelectLabel>
          {MIDDLE_COURT_POSITIONS.map(pos => (
            <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-black mr-1.5">[{pos.shortCode}]</span> {pos.nameMr}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator className="my-1" />

        {/* Right 1 to 6 */}
        <SelectGroup>
          <SelectLabel className="text-[10px] font-black uppercase text-emerald-500 tracking-wider py-1 px-2 flex items-center justify-between">
            <span>➡️ उजवी फळी (Right 1 ते 6)</span>
            <span className="text-[9px] font-mono text-emerald-400">६ पोझिशन्स</span>
          </SelectLabel>
          {RIGHT_COURT_POSITIONS.map(pos => (
            <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black mr-1.5">[{pos.shortCode}]</span> {pos.nameMr}
            </SelectItem>
          ))}
        </SelectGroup>
      </>
    );
  };

  // Render individual tactical lane slot in 17-Lanes Board
  const renderLaneSlot = (posDef: any, theme: 'blue' | 'amber' | 'emerald') => {
    const assignedPlayer = sportPlayers.find((p: any) => {
      const draft = draftChanges[p.id];
      const pPos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '');
      return pPos === posDef.nameMr || pPos === posDef.nameEn || pPos === posDef.shortCode;
    });

    const themeBorder = theme === 'blue' ? 'border-blue-500/40 bg-blue-950/50 hover:border-blue-400' :
      theme === 'amber' ? 'border-amber-500/40 bg-amber-950/50 hover:border-amber-400' :
      'border-emerald-500/40 bg-emerald-950/50 hover:border-emerald-400';

    const themeBadge = theme === 'blue' ? 'bg-blue-600 text-white' :
      theme === 'amber' ? 'bg-amber-500 text-slate-950 font-black' :
      'bg-emerald-600 text-white';

    if (assignedPlayer) {
      const draft = draftChanges[assignedPlayer.id];
      const currentJersey = draft?.jersey !== undefined 
        ? draft.jersey 
        : (assignedPlayer.jerseyNumbers?.[selectedSport] || assignedPlayer.jerseyNumber || '-');
      const photo = draft?.photoUrl || assignedPlayer.photoUrl;
      const marathiName = assignedPlayer.nameMarathi || transliterateEnglishToMarathi(assignedPlayer.name) || assignedPlayer.name;
      const isCapt = (captainId === assignedPlayer.id || draft?.isCaptain);
      const isVC = (viceCaptainId === assignedPlayer.id || draft?.isViceCaptain);

      return (
        <div 
          key={posDef.id}
          className={cn(
            "flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all shadow-sm",
            themeBorder,
            isCapt && "ring-2 ring-amber-400 bg-amber-950/60",
            isVC && "ring-2 ring-slate-300 bg-slate-900/80"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn("text-xs font-mono font-black px-2 py-0.5 rounded-lg shrink-0", themeBadge)}>
              {posDef.shortCode}
            </span>

            <Avatar className="w-9 h-9 rounded-xl border border-white/20 shrink-0">
              <AvatarImage src={photo} alt={assignedPlayer.name} className="object-cover" />
              <AvatarFallback className="bg-slate-800 text-amber-300 font-bold text-[10px]">
                {assignedPlayer.name ? assignedPlayer.name.slice(0, 2).toUpperCase() : 'PL'}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs text-white truncate max-w-[110px] sm:max-w-[140px]" title={marathiName}>
                  {marathiName}
                </span>
                {isCapt && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                {isVC && <Medal className="w-3 h-3 text-slate-300 shrink-0" />}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                #{currentJersey} &bull; इ. {assignedPlayer.std} वी &bull; {posDef.nameEn}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handlePositionChange(assignedPlayer.id, '')}
              className="h-7 w-7 p-0 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg"
              title="या स्थानावरून खेळाडू काढा (Clear position)"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    // Unassigned Slot
    return (
      <div 
        key={posDef.id}
        className="flex items-center justify-between p-2.5 rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs font-mono font-black px-2 py-0.5 rounded-lg", themeBadge)}>
            {posDef.shortCode}
          </span>
          <span className="text-xs font-bold text-slate-300">
            {posDef.nameMr}
          </span>
        </div>

        <div className="max-w-[150px] sm:max-w-[170px] w-full ml-2">
          <Select
            value=""
            onValueChange={(playerId) => handlePositionChange(playerId, posDef.nameMr)}
          >
            <SelectTrigger className="h-7 text-[10px] font-bold rounded-lg bg-slate-950/80 border border-white/20 text-slate-300 px-2">
              <SelectValue placeholder="+ खेळाडू निवडा" />
            </SelectTrigger>
            <SelectContent className="max-h-56 text-xs">
              {sportPlayers.map((p: any) => {
                const draft = draftChanges[p.id];
                const pJersey = draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-');
                const mName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                return (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-bold">
                    <span className="font-mono text-amber-400 mr-1">#{pJersey}</span> {mName} (इ. {p.std})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Render a player card on tactical court or bench
  const renderPlayerCard = (player: any, idx: number, posDef?: CourtPositionDef, isReserve = false) => {
    const draft = draftChanges[player.id];
    const currentJersey = draft?.jersey !== undefined 
      ? draft.jersey 
      : (player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || `${idx + 1}`);
    const currentPos = draft?.position !== undefined 
      ? draft.position 
      : (player.positions?.[selectedSport] || posDef?.defaultPosName || 'खेळाडू');
    const photo = draft?.photoUrl || player.photoUrl;
    const isCapt = (captainId === player.id || draft?.isCaptain);
    const isVC = (viceCaptainId === player.id || draft?.isViceCaptain);
    const marathiName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
    const posBadge = getPositionBadgeInfo(currentPos);
    const skillData = store?.data?.sportSkills?.[`${player.id}_${selectedSport}`] || { score: '0' };
    const skillScore = parseFloat(skillData.score || '0');

    return (
      <div 
        key={player.id}
        className={cn(
          "group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 shadow-md",
          isReserve 
            ? "bg-slate-900/95 border-slate-700 text-white" 
            : "bg-slate-950/90 border-amber-400/60 text-white hover:border-amber-300 hover:scale-[1.02]",
          isCapt && "ring-2 ring-amber-400 border-amber-400 bg-amber-950/40",
          isVC && "ring-2 ring-slate-300 border-slate-300 bg-slate-900/90"
        )}
      >
        {/* Hidden File Input for Direct Photo Upload */}
        <input
          type="file"
          accept="image/*"
          ref={el => { fileInputRefs.current[player.id] = el; }}
          onChange={(e) => handlePhotoUpload(player.id, e)}
          className="hidden"
        />

        {/* Top Badges: Captaincy & Jersey Number */}
        <div className="w-full flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1">
            {isCapt ? (
              <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0 shadow flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" /> CPT
              </Badge>
            ) : isVC ? (
              <Badge className="bg-slate-300 text-slate-950 font-black text-[9px] px-1.5 py-0 shadow flex items-center gap-0.5">
                <Medal className="w-2.5 h-2.5" /> VC
              </Badge>
            ) : (
              <span className={cn(
                "text-[9px] font-mono font-bold px-1 py-0.5 rounded",
                posBadge.zone === 'left' ? "text-blue-300 bg-blue-950/70 border border-blue-500/30" :
                posBadge.zone === 'middle' ? "text-amber-300 bg-amber-950/70 border border-amber-500/30" :
                posBadge.zone === 'right' ? "text-emerald-300 bg-emerald-950/70 border border-emerald-500/30" :
                "text-emerald-400/80"
              )}>
                {posBadge.shortCode ? `[${posBadge.shortCode}]` : (posDef?.shortCode || `#${idx + 1}`)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddEditModal(idx, posDef);
              }}
              className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 transition-colors border border-amber-400/40"
              title="खेळाडू बदला किंवा संपादन करा (Edit / Change Player)"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-amber-300 font-black">#</span>
            <input
              type="text"
              value={currentJersey}
              onChange={(e) => handleJerseyChange(player.id, e.target.value)}
              className="w-8 h-5 text-center font-black text-xs rounded bg-white text-slate-950 border border-amber-400 focus:outline-none"
              title="जर्सी क्रमांक बदला"
            />
          </div>
        </div>

        {/* Player Avatar & Photo Upload Trigger */}
        <div className="relative my-1">
          <Avatar className="w-14 h-14 rounded-2xl border-2 border-amber-400/80 shadow-md">
            <AvatarImage src={photo} alt={player.name} className="object-cover" />
            <AvatarFallback className="bg-slate-800 text-amber-300 font-black text-xs">
              {player.name ? player.name.slice(0, 2).toUpperCase() : 'PL'}
            </AvatarFallback>
          </Avatar>
          
          <button
            type="button"
            onClick={() => fileInputRefs.current[player.id]?.click()}
            title="खेळाडूचा फोटो अपलोड करा (Click to upload photo)"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        {/* Player Names & Standard */}
        <div className="text-center w-full mt-1">
          <div className="font-black text-xs text-white truncate max-w-[120px]" title={marathiName}>
            {marathiName}
          </div>
          <div className="text-[9px] text-slate-400 truncate">
            इ. {player.std} वी &bull; GR: {sanitizeGrNumber(player.generalRegisterNumber, player.serialNumber || '-')}
          </div>
        </div>

        {/* Skills Marks Badge */}
        <div className="flex items-center justify-center gap-1.5 my-1">
          <Badge className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm border flex items-center gap-1",
            skillScore >= 80 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
            skillScore >= 60 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
            "bg-slate-800 text-slate-400 border-slate-700"
          )}>
            <Target className="w-2.5 h-2.5" />
            {skillScore > 0 ? `${skillScore}/100 गुण` : 'कौशल्य बाकी'}
          </Badge>
        </div>

        {/* Position Badge & Dropdown Selector */}
        <div className="w-full mt-1.5 space-y-1.5">
          <Select
            value={currentPos}
            onValueChange={(val) => handlePositionChange(player.id, val)}
          >
            <SelectTrigger className="h-6 text-[9px] font-bold rounded-lg bg-slate-900 border border-amber-400/30 text-amber-300 px-1.5">
              <SelectValue placeholder="पोझिशन..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 text-xs">
              {renderPositionSelectOptions()}
            </SelectContent>
          </Select>

          {/* Super Easy Quick 1-Click Position Number Buttons */}
          {selectedSport === 'Kabaddi' && (
            <div className="pt-0.5">
              <div className="text-[8px] font-black text-amber-300/80 uppercase text-center mb-0.5">
                ⚡ जलद पोझिशन (1-Tap):
              </div>
              <div className="grid grid-cols-4 gap-0.5">
                {KABADDI_QUICK_POSITIONS.map(pos => {
                  const isActive = currentPos.includes(pos.code) || currentPos.includes(pos.name);
                  return (
                    <button
                      key={pos.num}
                      type="button"
                      onClick={() => handlePositionChange(player.id, pos.name)}
                      className={cn(
                        "text-[8px] font-black py-0.5 px-0.5 rounded transition-all flex items-center justify-center gap-0.5 text-center",
                        isActive 
                          ? "bg-amber-400 text-slate-950 ring-1 ring-amber-300 font-black shadow" 
                          : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                      )}
                      title={`${pos.num}. ${pos.name}`}
                    >
                      <span className="font-mono text-[7px] text-amber-400">{pos.num}</span>
                      <span>{pos.code}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handlePositionChange(player.id, 'राखीव खेळाडू (Reserve)')}
                  className={cn(
                    "text-[8px] font-black py-0.5 px-0.5 rounded transition-all text-center",
                    currentPos.includes('राखीव') || currentPos.includes('Reserve')
                      ? "bg-slate-300 text-slate-950 font-black"
                      : "bg-slate-900/90 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  )}
                  title="राखीव खेळाडू"
                >
                  RES
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Coach Role Selector: Quick Toggle Captain / VC */}
        <div className="flex items-center justify-center gap-1 w-full mt-2 pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleSetCaptain(player.id)}
            className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5",
              isCapt ? "bg-amber-500 text-slate-950 shadow" : "bg-white/10 text-white/70 hover:bg-amber-500/30"
            )}
            title="क्रीडा शिक्षक: कर्णधार बनवा (Make Captain)"
          >
            <Crown className="w-2.5 h-2.5" /> {isCapt ? 'कर्णधार ✅' : 'CPT'}
          </button>

          <button
            type="button"
            onClick={() => handleSetViceCaptain(player.id)}
            className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5",
              isVC ? "bg-slate-300 text-slate-950 shadow" : "bg-white/10 text-white/70 hover:bg-slate-300/30"
            )}
            title="क्रीडा शिक्षक: उपकर्णधार बनवा (Make Vice-Captain)"
          >
            <Medal className="w-2.5 h-2.5" /> {isVC ? 'उपकर्णधार ✅' : 'VC'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-emerald-800/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                Tactical Squad Deck
              </Badge>
              <Badge variant="outline" className="text-emerald-200 border-emerald-400/30 text-xs">
                {selectedSport} &bull; कमाल १२ खेळाडू संघ
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Shirt className="w-8 h-8 text-amber-400 shrink-0" />
              खेळाडू स्थान, जर्सी व ग्राउंड मांडणी (Tactical Ground Roster)
            </h2>
            <p className="text-xs md:text-sm text-emerald-200/90 font-medium max-w-2xl">
              कबड्डी (७ मुख्य + ५ राखीव), व्हॉलीबॉल (६ मुख्य + ६ राखीव) साठी अचूक ग्राउंड पोझिशन्स, फोटो, जर्सी क्रमांक व कर्णधार नियुक्त करा.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleAutoSelectSquadBySkills}
              type="button"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-4 border border-amber-300 transition-transform active:scale-95"
              title="सर्वोच्च कौशल्य गुण असलेल्या १२ खेळाडूंची अंतिम संघात निवड करून #१ ते #७ पोझिशन्स व जर्सी क्रमांक द्या"
            >
              <Zap className="w-4 h-4 fill-current" />
              ⚡ कौशल्य गुणांवरून संघ निवडा
            </Button>
            <Button
              onClick={handleAutoNumberJerseys}
              type="button"
              variant="outline"
              className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl border-none shadow-md gap-1.5 h-11 px-3.5"
              title="संघातील खेळाडूंना १ ते १२ जर्सी क्रमांक द्या"
            >
              <ListOrdered className="w-4 h-4" /> १-१२ जर्सी द्या
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-6 animate-pulse"
              >
                <Save className="w-4 h-4" /> बदल सेव्ह करा ({Object.keys(draftChanges).length})
              </Button>
            )}
            <Button
              onClick={handleWhatsAppSquadShare}
              variant="outline"
              className="bg-emerald-700/80 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none shadow-md gap-2 h-11 px-4"
            >
              <Share2 className="w-4 h-4" /> WhatsApp रोस्टर
            </Button>
            <Button
              onClick={handlePrintLineup}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-5 border border-amber-300"
            >
              <Printer className="w-4 h-4" /> सामना तक्ता प्रिंट (A4)
            </Button>
          </div>
        </div>
      </div>

      {/* Duplicate Jersey Number Alert */}
      {jerseyDuplicates.duplicates.size > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex items-start gap-3 text-rose-900 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-black text-sm block">⚠️ जर्सी क्रमांक डुप्लिकेट इशारा (Duplicate Jersey Warning)</span>
            {Array.from(jerseyDuplicates.duplicates).map((num) => (
              <div key={num} className="mt-1">
                जर्सी <span className="font-black underline">#{num}</span> ही एकापेक्षा जास्त खेळाडूंना दिलेली आहे: <strong>{jerseyDuplicates.counts[num]?.join(', ')}</strong>. कृपया प्रत्येक खेळाडूस अद्वितीय क्रमांक द्या.
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sport Switcher */}
      <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* Sport Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> खेळ (Select Sport)
            </label>
            <Select value={selectedSport} onValueChange={(val) => { setSelectedSport(val); setDraftChanges({}); setCaptainId(''); setViceCaptainId(''); }}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="खेळ निवडा" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_SPORTS.map(s => (
                  <SelectItem key={s} value={s} className="font-bold text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" /> वयोगट (Category)
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="वयोगट निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold text-xs">सर्व वयोगट (All)</SelectItem>
                <SelectItem value="U14" className="font-bold text-xs">U14 (१४ वर्षांखालील)</SelectItem>
                <SelectItem value="U17" className="font-bold text-xs">U17 (१७ वर्षांखालील)</SelectItem>
                <SelectItem value="U19" className="font-bold text-xs">U19 (१९ वर्षांखालील)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> लिंग (Gender)
            </label>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="लिंग निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold text-xs">सर्व (मुले व मुली)</SelectItem>
                <SelectItem value="Male" className="font-bold text-xs">👦 मुले (Boys)</SelectItem>
                <SelectItem value="Female" className="font-bold text-xs">👧 मुली (Girls)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Player */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-500" /> खेळाडू शोधा (Search)
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव किंवा GR क्रमांक..."
              className="font-bold text-xs rounded-xl h-11 border-2 border-primary/20"
            />
          </div>

          {/* Sort By Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> क्रमवारी (Sort)
            </label>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20 bg-amber-50/50">
                <SelectValue placeholder="क्रम निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skills" className="font-bold text-xs">🎯 कौशल्य गुण (सर्वोच्च)</SelectItem>
                <SelectItem value="jersey" className="font-bold text-xs">🎽 जर्सी क्रमांक (#1..12)</SelectItem>
                <SelectItem value="name" className="font-bold text-xs">🔤 नाव (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> व्ह्यू (View)
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 h-11 items-center">
              <button
                type="button"
                onClick={() => setViewMode('court')}
                className={cn(
                  "flex-1 py-1.5 px-1.5 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 transition-all",
                  viewMode === 'court' ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
                title="मैदान मांडणी व्यू"
              >
                <Activity className="w-3 h-3" /> ग्राउंड
              </button>
              <button
                type="button"
                onClick={() => setViewMode('lanes')}
                className={cn(
                  "flex-1 py-1.5 px-1.5 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 transition-all",
                  viewMode === 'lanes' ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
                title="१७ लेन व्यू"
              >
                <Target className="w-3 h-3" /> लेन
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  "flex-1 py-1.5 px-1.5 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 transition-all",
                  viewMode === 'table' ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
                title="तक्ता व्यू"
              >
                <ListOrdered className="w-3 h-3" /> तक्ता
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Squad Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl bg-white border-2 border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
            {starters.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">मैदानावर मुख्य खेळाडू</div>
            <div className="text-sm font-black text-emerald-900">{squadConfig.startersCount} पैकी {starters.length} सज्ज</div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white border-2 border-amber-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            {reserves.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">राखीव खेळाडू (Reserves)</div>
            <div className="text-sm font-black text-amber-900">{squadConfig.reservesCount} पैकी {reserves.length} बेंचवर</div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white border-2 border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
            {starters.length + reserves.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">अधिकृत सामना संघ</div>
            <div className="text-sm font-black text-blue-900">कमाल {squadConfig.maxSquad} खेळाडू मर्यादा</div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white border-2 border-purple-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">क्रीडा शिक्षक निवड</div>
            <div className="text-xs font-black text-purple-900 truncate max-w-[130px]">
              {captainId ? (sportPlayers.find((p: any) => p.id === captainId)?.nameMarathi || 'नियुक्त') : 'कर्णधार निवडा'}
            </div>
          </div>
        </Card>
      </div>

      {/* Main View: Court Mode vs Table Mode */}
      {viewMode === 'court' ? (
        <div className="space-y-8">
          {/* TACTICAL COURT GROUND CONTAINER */}
          <Card className="rounded-[2.5rem] border-4 border-emerald-950/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white overflow-hidden p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-700/40">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                  <Activity className="w-4 h-4" /> {selectedSport} अधिकृत ग्राउंड रणनीती
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                  {squadConfig.courtTitle}
                </h3>
                <p className="text-xs text-emerald-200/80 font-medium">
                  {squadConfig.courtSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1">
                  मैदानावर: {starters.length} / {squadConfig.startersCount}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleOpenAddEditModal(0, squadConfig.positions[0])}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md gap-1.5 h-8 px-3"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  रणनीती संपादन / खेळाडू जोडा (Edit & Add Player)
                </Button>
              </div>
            </div>

            {/* Kabaddi 7 Positions Strategy Reference */}
            {selectedSport === 'Kabaddi' && (
              <div className="mb-6 bg-slate-900/80 border-2 border-amber-500/40 rounded-2xl p-4 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-3">
                  <Shield className="w-4 h-4 text-amber-400" />
                  अधिकृत ७ खेळाडू पोझिशन्स व कार्य (Kabaddi 7 Player Positions)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-200">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-blue-500/30">
                    <span className="font-black text-blue-400 block mb-1">🛡️ Right Corner &amp; Left Corner [RC, LC]:</span>
                    <span className="text-[11px] text-slate-300">The players at the absolute ends of the defensive semi-circle. They initiate tackles and try to trap the opponent raider.</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-teal-500/30">
                    <span className="font-black text-teal-400 block mb-1">⚡ Right In &amp; Left In [RI, LI]:</span>
                    <span className="text-[11px] text-slate-300">The players standing next to the corners. They often act as secondary raiders and hold defensive chains with the corners.</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/30">
                    <span className="font-black text-amber-400 block mb-1">🧱 Right Cover &amp; Left Cover [RCv, LCv]:</span>
                    <span className="text-[11px] text-slate-300">The middle-defense players next to the ins. They block the raider&apos;s path and support heavy tackles.</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="font-black text-emerald-400 block mb-1">🎯 Center [CTR]:</span>
                    <span className="text-[11px] text-slate-300">The player right in the middle of the formation. Usually held by the team&apos;s main raider or a primary coordinator.</span>
                  </div>
                </div>
              </div>
            )}

            {/* REALISTIC COURT LAYOUT BY SPORT */}
            {selectedSport === 'Kabaddi' ? (
              /* KABADDI COURT */
              <div className="relative bg-gradient-to-b from-amber-900/60 to-emerald-950/90 rounded-3xl p-6 md:p-8 border-4 border-amber-400/50 shadow-inner overflow-hidden">
                <div className="text-center font-black text-amber-200/50 uppercase tracking-[0.4em] text-[10px] mb-2">
                  &mdash; मध्य रेषा / MID LINE &mdash;
                </div>

                <div className="w-full border-b-2 border-dashed border-amber-300/40 my-3 relative">
                  <span className="absolute -top-3 left-4 text-[9px] font-black text-amber-300/70 uppercase">
                    बाल्क लाईन (Baulk Line 3.75m)
                  </span>
                </div>

                <div className="w-full border-b border-amber-400/40 mb-6 relative">
                  <span className="absolute -top-3 left-4 text-[9px] font-black text-amber-400/70 uppercase">
                    बोनस लाईन (Bonus Line 4.75m)
                  </span>
                </div>

                {/* Starters Grid: 7 Positions for Kabaddi with Horizontal Scroll Support */}
                <div className="text-[10px] text-amber-200/80 font-bold lg:hidden flex items-center justify-end gap-1 mb-1">
                  <span>↔️ सर्व ७ पोझिशन्स पाहण्यासाठी डावीकडे/उजवीकडे स्क्रोल करा</span>
                </div>
                <div className="w-full overflow-x-auto pb-4 pt-1 -mx-1 px-1 scrollbar-thin touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="min-w-[850px] grid grid-cols-7 gap-3 my-2">
                    {squadConfig.positions.map((posDef, i) => {
                      const player = starters[i];
                      if (!player) {
                        return (
                          <div 
                            key={posDef.id} 
                            onClick={() => handleOpenAddEditModal(i, posDef)}
                            className="cursor-pointer border-2 border-dashed border-amber-400/50 hover:border-amber-300 hover:bg-slate-900/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[175px] bg-slate-900/40 text-slate-300 transition-all hover:scale-[1.02] group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-2 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-black text-amber-300 mb-1">{posDef.nameMr}</div>
                            <div className="text-[10px] text-slate-400 font-bold">खेळाडू रिक्त</div>
                            <Button size="sm" variant="outline" className="mt-2 text-[10px] font-black h-7 bg-amber-400 text-slate-950 border-none hover:bg-amber-300 rounded-lg shadow">
                              + खेळाडू जोडा
                            </Button>
                          </div>
                        );
                      }
                      return renderPlayerCard(player, i, posDef, false);
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t-2 border-white/30 flex items-center justify-between text-[10px] text-amber-200/60 font-bold uppercase">
                  <span>लॉबी (Lobby 1.0m) &larr;</span>
                  <span>&mdash; शेवटची रेषा / END LINE &mdash;</span>
                  <span>&rarr; लॉबी (Lobby 1.0m)</span>
                </div>
              </div>
            ) : selectedSport === 'Volleyball' ? (
              /* VOLLEYBALL COURT */
              <div className="relative bg-gradient-to-b from-sky-950/70 to-emerald-950/90 rounded-3xl p-6 md:p-8 border-4 border-sky-400/50 shadow-inner overflow-hidden">
                <div className="w-full bg-slate-200/90 text-slate-950 py-1 px-4 rounded-xl flex items-center justify-between font-black text-[10px] uppercase shadow mb-4">
                  <span>🚩 डावा अँटेना</span>
                  <span className="tracking-[0.3em] flex items-center gap-2">
                    🕸️ व्हॉलीबॉल नेट (NET LINE &bull; २.२४/२.४३ मी) 🕸️
                  </span>
                  <span>🚩 उजवा अँटेना</span>
                </div>

                <div className="w-full border-b-2 border-dashed border-sky-300/50 my-3 relative">
                  <span className="absolute -top-3 left-4 text-[9px] font-black text-sky-300 uppercase">
                    ३ मीटर अटॅक लाईन (3M Attack Line - फ्रंट झोन)
                  </span>
                </div>

                <div className="space-y-4 my-4">
                  <div className="text-[10px] font-black text-sky-300 uppercase">
                    आक्रमक फळी (Front Row Attack: Zones 4, 3, 2)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {squadConfig.positions.slice(0, 3).map((posDef, i) => {
                      const player = starters[i];
                      if (!player) {
                        return (
                          <div key={posDef.id} className="border-2 border-dashed border-sky-400/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[160px] bg-slate-900/40 text-slate-400">
                            <div className="text-xs font-black text-sky-300 mb-1">{posDef.nameMr}</div>
                            <div className="text-[10px] text-slate-400">खेळाडू रिक्त</div>
                          </div>
                        );
                      }
                      return renderPlayerCard(player, i, posDef, false);
                    })}
                  </div>

                  <div className="text-[10px] font-black text-amber-300 uppercase pt-2">
                    बचाव व सर्व्हिस फळी (Back Row Defense & Service: Zones 5, 6, 1)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {squadConfig.positions.slice(3, 6).map((posDef, i) => {
                      const player = starters[3 + i];
                      if (!player) {
                        return (
                          <div key={posDef.id} className="border-2 border-dashed border-amber-400/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[160px] bg-slate-900/40 text-slate-400">
                            <div className="text-xs font-black text-amber-300 mb-1">{posDef.nameMr}</div>
                            <div className="text-[10px] text-slate-400">खेळाडू रिक्त</div>
                          </div>
                        );
                      }
                      return renderPlayerCard(player, 3 + i, posDef, false);
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t-2 border-white/20 text-center text-[10px] text-white/40 uppercase font-black tracking-widest">
                  &mdash; सर्व्हिस झोन (SERVICE ZONE) &mdash;
                </div>
              </div>
            ) : (
              /* GENERIC COURT / FIELD */
              <div className="bg-emerald-900/80 rounded-3xl p-6 border-4 border-amber-400/40 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-4">
                  {starters.map((player: any, i: number) => {
                    const posDef = squadConfig.positions[i] || {
                      id: `pos_${i}`,
                      nameEn: 'Player',
                      nameMr: 'खेळाडू',
                      shortCode: `P${i+1}`,
                      role: 'Specialist' as const,
                      defaultPosName: 'खेळाडू'
                    };
                    return renderPlayerCard(player, i, posDef, false);
                  })}
                </div>
              </div>
            )}

            {/* RESERVES BENCH SECTION */}
            <div className="mt-8 pt-6 border-t-2 border-emerald-800/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-black text-amber-300 uppercase">
                    राखीव खेळाडू बेंच (Reserves / Substitutes &bull; {reserves.length} खेळाडू)
                  </h4>
                </div>
                <span className="text-xs text-slate-300 font-bold">
                  अधिकृत १२ खेळाडू मर्यादेतील राखीव खेळाडू
                </span>
              </div>

              {reserves.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-400 bg-slate-900/60 rounded-2xl border border-dashed border-slate-700">
                  सध्या राखीव बाकावर खेळाडू नाहीत.
                </div>
              ) : (
                <div className="w-full overflow-x-auto pb-3 pt-1 -mx-1 px-1 scrollbar-thin touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="min-w-[650px] grid grid-cols-5 gap-3">
                    {reserves.map((player: any, i: number) => {
                      return renderPlayerCard(player, starters.length + i, undefined, true);
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* EXTENDED POOL */}
            {extendedPool.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-black text-slate-400 uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> विस्तारित खेळाडू पूल (Extended Pool &bull; {extendedPool.length} खेळाडू)
                  </h5>
                  <span className="text-[10px] text-amber-400 font-bold">
                    सामन्यासाठी १२ खेळाडू निवडले आहेत
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {extendedPool.map((p: any) => (
                    <div key={p.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px]">
                      <div className="font-bold text-white truncate">{p.nameMarathi || p.name}</div>
                      <div className="text-slate-400">इ. {p.std} वी &bull; #{p.jerseyNumber || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : viewMode === 'lanes' ? (
        /* 17 TACTICAL LANES VIEW (LEFT 6, MIDDLE 5, RIGHT 6) */
        <div className="space-y-8 animate-in fade-in duration-300">
          <Card className="rounded-[2.5rem] border-4 border-emerald-950/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white overflow-hidden p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-700/40">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                  <Target className="w-4 h-4" /> १७-लेन रणनीती ग्राउंड रचना
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                  डावा १ ते ६ &bull; मध्य १ ते ५ &bull; उजवा १ ते ६ रणनीती व्यू
                </h3>
                <p className="text-xs text-emerald-200/80 font-medium">
                  {selectedSport} सामन्यासाठी अचूक रणनीती नियोजन: डावी बाजू (६ स्थाने), मध्य फळी (५ स्थाने) आणि उजवी बाजू (६ स्थाने)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 shadow">
                  ⬅️ डावी: L1 ते L6
                </Badge>
                <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 shadow">
                  ⏺️ मध्य: M1 ते M5
                </Badge>
                <Badge className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 shadow">
                  ➡️ उजवी: R1 ते R6
                </Badge>
              </div>
            </div>

            {/* 3 TACTICAL COLUMNS: LEFT 6, MIDDLE 5, RIGHT 6 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN (6 POSITIONS) */}
              <div className="bg-slate-950/60 border-2 border-blue-500/40 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white font-black text-xs">डावी बाजू (Left)</Badge>
                    <span className="text-sm font-black text-blue-200">L1 ते L6</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-300">६ स्थाने</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {LEFT_COURT_POSITIONS.map(pos => renderLaneSlot(pos, 'blue'))}
                </div>
                <div className="pt-2 border-t border-blue-500/20 text-center text-[10px] text-blue-300/60 font-bold uppercase">
                  डावी फळी / आक्रमक व बचाव (Left Zone)
                </div>
              </div>

              {/* MIDDLE COLUMN (5 POSITIONS) */}
              <div className="bg-slate-950/60 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-slate-950 font-black text-xs">मध्य भाग (Middle)</Badge>
                    <span className="text-sm font-black text-amber-200">M1 ते M5</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-300">५ स्थाने</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {MIDDLE_COURT_POSITIONS.map(pos => renderLaneSlot(pos, 'amber'))}
                </div>
                <div className="pt-2 border-t border-amber-500/20 text-center text-[10px] text-amber-300/60 font-bold uppercase">
                  मध्य फळी / सेटर व मुख्य नियंत्रक (Middle Zone)
                </div>
              </div>

              {/* RIGHT COLUMN (6 POSITIONS) */}
              <div className="bg-slate-950/60 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white font-black text-xs">उजवी बाजू (Right)</Badge>
                    <span className="text-sm font-black text-emerald-200">R1 ते R6</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300">६ स्थाने</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {RIGHT_COURT_POSITIONS.map(pos => renderLaneSlot(pos, 'emerald'))}
                </div>
                <div className="pt-2 border-t border-emerald-500/20 text-center text-[10px] text-emerald-300/60 font-bold uppercase">
                  उजवी फळी / आक्रमक व बचाव (Right Zone)
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* TABLE MODE VIEW */
        <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                  <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                  <th className="py-3.5 px-4 text-center w-16">फोटो</th>
                  <th className="py-3.5 px-4 text-center w-28">जर्सी नं.</th>
                  <th className="py-3.5 px-4">खेळाडूचे नाव (Player Name)</th>
                  <th className="py-3.5 px-4 text-center w-20">इयत्ता</th>
                  <th className="py-3.5 px-4 text-center w-28">कौशल्य गुण</th>
                  <th className="py-3.5 px-4 min-w-[300px]">मैदानातील पोझिशन (Fast 1-Click Buttons &amp; List)</th>
                  <th className="py-3.5 px-4 text-center">क्रीडा शिक्षक निवड (Captaincy)</th>
                  <th className="py-3.5 px-4 text-center">प्रकार</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/40">
                {sportPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground font-bold">
                      {selectedSport} क्रीडा प्रकारात कोणताही खेळाडू सापडला नाही. खेळाडूंच्या प्रोफाइलमध्ये हा खेळ निवडा.
                    </td>
                  </tr>
                ) : (
                  sportPlayers.map((player: any, idx: number) => {
                    const draft = draftChanges[player.id];
                    const currentJersey = draft?.jersey !== undefined 
                      ? draft.jersey 
                      : (player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || `${idx + 1}`);
                    const currentPos = draft?.position !== undefined 
                      ? draft.position 
                      : (player.positions?.[selectedSport] || '');
                    const photo = draft?.photoUrl || player.photoUrl;

                    const isDup = currentJersey && jerseyDuplicates.duplicates.has(currentJersey);
                    const isChanged = draft !== undefined;
                    const isCapt = (captainId === player.id || draft?.isCaptain);
                    const isVC = (viceCaptainId === player.id || draft?.isViceCaptain);
                    const isStarter = idx < squadConfig.startersCount;
                    const skillData = store?.data?.sportSkills?.[`${player.id}_${selectedSport}`] || { score: '0' };
                    const skillScore = parseFloat(skillData.score || '0');

                    return (
                      <tr 
                        key={player.id} 
                        className={cn(
                          "hover:bg-primary/5 transition-colors font-medium",
                          isChanged && "bg-amber-50/40",
                          isDup && "bg-rose-50/50",
                          isCapt && "bg-amber-100/30"
                        )}
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">
                          {idx + 1}
                        </td>

                        {/* Photo Thumbnail + Upload Button */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            ref={el => { fileInputRefs.current[player.id] = el; }}
                            onChange={(e) => handlePhotoUpload(player.id, e)}
                            className="hidden"
                          />
                          <div className="relative inline-block">
                            <Avatar className="w-10 h-10 rounded-xl border border-slate-300">
                              <AvatarImage src={photo} alt={player.name} className="object-cover" />
                              <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-700">
                                {player.name ? player.name.slice(0, 2).toUpperCase() : 'PL'}
                              </AvatarFallback>
                            </Avatar>
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[player.id]?.click()}
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow"
                              title="फोटो बदला"
                            >
                              <Camera className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </td>

                        {/* Jersey Number Input */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-black text-slate-400 text-sm">#</span>
                            <Input
                              value={currentJersey}
                              onChange={(e) => handleJerseyChange(player.id, e.target.value)}
                              placeholder="0"
                              maxLength={3}
                              className={cn(
                                "w-16 h-10 text-center font-black text-base rounded-xl border-2 transition-all",
                                isDup 
                                  ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-300" 
                                  : isChanged 
                                  ? "border-amber-500 bg-amber-50 text-amber-900" 
                                  : "border-primary/20 focus:border-primary text-slate-900"
                              )}
                            />
                          </div>
                          {isDup && (
                            <span className="text-[9px] font-bold text-rose-600 block mt-0.5">डुप्लिकेट!</span>
                          )}
                        </td>

                        {/* Player Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            {player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name}
                            {isCapt && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                            {isVC && <Medal className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold">
                            {player.name} &bull; GR: {sanitizeGrNumber(player.generalRegisterNumber, player.serialNumber || '-')}
                          </div>
                        </td>

                        {/* Standard */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">इ. {player.std} वी</span>
                        </td>

                        {/* Skills Score */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge className={cn(
                            "text-xs font-black px-2 py-0.5 shadow-sm border",
                            skillScore >= 80 ? "bg-emerald-500/20 text-emerald-800 border-emerald-500/40" :
                            skillScore >= 60 ? "bg-amber-500/20 text-amber-900 border-amber-500/40" :
                            "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {skillScore > 0 ? `${skillScore}/100` : '-'}
                          </Badge>
                        </td>

                        {/* Position Selector + Fast 1-Click Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            {selectedSport === 'Kabaddi' && (
                              <div className="flex flex-wrap items-center gap-1">
                                {KABADDI_QUICK_POSITIONS.map(pos => {
                                  const isActive = currentPos.includes(pos.code) || currentPos.includes(pos.name);
                                  return (
                                    <button
                                      key={pos.num}
                                      type="button"
                                      onClick={() => handlePositionChange(player.id, pos.name)}
                                      className={cn(
                                        "text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 shadow-sm",
                                        isActive
                                          ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-black scale-105"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 hover:text-slate-950"
                                      )}
                                      title={`${pos.num}. ${pos.name}`}
                                    >
                                      <span className="font-mono text-[8.5px] text-amber-800 font-black">{pos.num}.</span>
                                      <span>{pos.code}</span>
                                    </button>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => handlePositionChange(player.id, 'राखीव खेळाडू (Reserve)')}
                                  className={cn(
                                    "text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all",
                                    currentPos.includes('राखीव') || currentPos.includes('Reserve')
                                      ? "bg-slate-800 text-white font-black"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200"
                                  )}
                                  title="राखीव खेळाडू"
                                >
                                  राखीव
                                </button>
                              </div>
                            )}

                            <Select 
                              value={currentPos || ''} 
                              onValueChange={(val) => handlePositionChange(player.id, val)}
                            >
                              <SelectTrigger className={cn(
                                "font-bold text-xs rounded-xl h-8 border-2",
                                isChanged ? "border-amber-500 bg-amber-50" : "border-primary/20"
                              )}>
                                <SelectValue placeholder="पोझिशन निवडा..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-64 text-xs">
                                {renderPositionSelectOptions()}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>

                        {/* Captaincy Selection */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => handleSetCaptain(player.id)}
                              variant={isCapt ? "default" : "outline"}
                              className={cn(
                                "h-8 text-xs font-bold rounded-lg gap-1",
                                isCapt ? "bg-amber-500 text-slate-950 hover:bg-amber-600 font-black shadow" : "border-amber-400 text-amber-700 hover:bg-amber-50"
                              )}
                            >
                              <Crown className="w-3 h-3" /> {isCapt ? 'कर्णधार' : 'CPT'}
                            </Button>

                            <Button
                              size="sm"
                              type="button"
                              onClick={() => handleSetViceCaptain(player.id)}
                              variant={isVC ? "default" : "outline"}
                              className={cn(
                                "h-8 text-xs font-bold rounded-lg gap-1",
                                isVC ? "bg-slate-700 text-white hover:bg-slate-800 font-black shadow" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <Medal className="w-3 h-3" /> {isVC ? 'उपकर्णधार' : 'VC'}
                            </Button>
                          </div>
                        </td>

                        {/* Squad Status: Starter vs Reserve */}
                        <td className="py-3.5 px-4 text-center">
                          {isStarter ? (
                            <Badge className="bg-emerald-600 text-white font-black text-[10px]">
                              मुख्य (Starter)
                            </Badge>
                          ) : idx < squadConfig.maxSquad ? (
                            <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 font-bold text-[10px]">
                              राखीव (Reserve)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 font-medium text-[10px]">
                              पूल (Pool)
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ADD / EDIT PLAYER IN MATCH STRATEGY MODAL */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-6 max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="border-b pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black uppercase text-primary flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-500" />
                कबड्डी रणनीती: खेळाडू संपादन / जोडा
              </DialogTitle>
              {targetPositionDef && (
                <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5">
                  [{targetPositionDef.shortCode}] {targetPositionDef.nameMr}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              या स्थानावर खेळण्यासाठी शाळेच्या खेळाडूंमधून निवडा किंवा नवीन खेळाडू थेट नोंदवा.
            </p>
          </DialogHeader>

          {/* Currently Assigned Player Info */}
          {targetSlotIndex !== null && starters[targetSlotIndex] && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between shrink-0 my-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9 rounded-xl border border-amber-400">
                  <AvatarImage src={starters[targetSlotIndex].photoUrl} />
                  <AvatarFallback className="bg-slate-900 text-amber-300 text-xs font-black">
                    {starters[targetSlotIndex].name ? starters[targetSlotIndex].name.slice(0, 2) : 'PL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    सध्या नियुक्त: {starters[targetSlotIndex].nameMarathi || starters[targetSlotIndex].name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    इ. {starters[targetSlotIndex].std} वी &bull; #{starters[targetSlotIndex].jerseyNumber || '-'}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleClearSlot(targetSlotIndex)}
                className="text-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50 rounded-xl h-8"
              >
                स्थान रिक्त करा
              </Button>
            </div>
          )}

          <Tabs value={activeModalTab} onValueChange={(val: any) => setActiveModalTab(val)} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 mb-3 shrink-0">
              <TabsTrigger value="roster" className="rounded-lg font-black text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="w-3.5 h-3.5" /> शाळेच्या रोस्टरमधून निवडा
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-lg font-black text-xs gap-1.5 data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
                <UserPlus className="w-3.5 h-3.5" /> + नवीन खेळाडू तयार करा
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SELECT EXISTING PLAYER */}
            <TabsContent value="roster" className="flex-1 min-h-0 flex flex-col mt-0 space-y-3">
              <div className="relative shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="विद्यार्थ्याचे नाव किंवा GR क्रमांक शोधा..."
                  className="pl-9 h-10 font-bold text-xs rounded-xl"
                />
              </div>

              {/* NATIVE SMOOTH SCROLL CONTAINER (Touch & Wheel Guaranteed) */}
              <div 
                className="flex-1 min-h-[220px] max-h-[50vh] overflow-y-auto overscroll-contain pr-2 space-y-2 scrollbar-thin touch-pan-y"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="space-y-2 pb-2">
                  {allPlayers
                    .filter((p: any) => {
                      if (!modalSearch.trim()) return true;
                      const q = modalSearch.toLowerCase().trim();
                      const matchName = (p.name || '').toLowerCase().includes(q) || (p.nameMarathi || '').includes(q);
                      const matchGr = (p.generalRegisterNumber || '').toLowerCase().includes(q);
                      return matchName || matchGr;
                    })
                    .map((player: any) => {
                      const isCurrent = targetSlotIndex !== null && starters[targetSlotIndex]?.id === player.id;
                      const displayName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
                      const hasSport = player.sports && player.sports.includes(selectedSport);
                      const jersey = player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || '-';

                      return (
                        <div
                          key={player.id}
                          className={cn(
                            "p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3",
                            isCurrent ? "bg-amber-50 border-amber-400" : "bg-white hover:bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="w-9 h-9 rounded-xl border shrink-0">
                              <AvatarImage src={player.photoUrl} />
                              <AvatarFallback className="bg-slate-900 text-amber-300 font-bold text-xs">
                                {player.name ? player.name.slice(0, 2) : 'PL'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-black text-xs text-slate-900 truncate">
                                {displayName} #{jersey}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {player.name} &bull; इ. {player.std} वी &bull; GR: {player.generalRegisterNumber || '-'}
                                {hasSport && <span className="ml-1 text-emerald-600 font-bold">({selectedSport})</span>}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            disabled={isCurrent}
                            onClick={() => handleAssignExistingPlayer(player)}
                            className={cn(
                              "text-xs font-black rounded-xl h-8 shrink-0 px-3",
                              isCurrent ? "bg-amber-400 text-slate-950" : "bg-primary hover:bg-primary/90 text-white"
                            )}
                          >
                            {isCurrent ? "नियुक्त आहे" : "हा खेळाडू ठेवा"}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: CREATE NEW PLAYER */}
            <TabsContent 
              value="new" 
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain mt-0 space-y-3 pr-2 scrollbar-thin touch-pan-y max-h-[55vh]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-primary">इंग्रजी नाव (English Name) *</label>
                  <Input
                    value={newPlayerNameEn}
                    onChange={(e) => {
                      setNewPlayerNameEn(e.target.value);
                      if (!newPlayerNameMr || newPlayerNameMr === transliterateEnglishToMarathi(newPlayerNameEn)) {
                        setNewPlayerNameMr(transliterateEnglishToMarathi(e.target.value));
                      }
                    }}
                    placeholder="e.g. Ramesh Shinde"
                    className="h-10 text-xs font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-primary">मराठी नाव (Marathi Name) *</label>
                  <Input
                    value={newPlayerNameMr}
                    onChange={(e) => setNewPlayerNameMr(e.target.value)}
                    placeholder="उदा. रमेश शिंदे"
                    className="h-10 text-xs font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-primary">इयत्ता (Class/Std)</label>
                  <Select value={newPlayerStd} onValueChange={setNewPlayerStd}>
                    <SelectTrigger className="h-10 text-xs font-bold rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['5', '6', '7', '8', '9', '10', '11', '12'].map(s => (
                        <SelectItem key={s} value={s} className="text-xs font-bold">इ. {s} वी</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-primary">लिंग (Gender)</label>
                  <Select value={newPlayerGender} onValueChange={setNewPlayerGender}>
                    <SelectTrigger className="h-10 text-xs font-bold rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male" className="text-xs font-bold">👦 मुलगा (Boy)</SelectItem>
                      <SelectItem value="Female" className="text-xs font-bold">👧 मुलगी (Girl)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-black uppercase text-primary">जर्सी क्रमांक (#)</label>
                  <Input
                    value={newPlayerJersey}
                    onChange={(e) => setNewPlayerJersey(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                    placeholder="उदा. 7"
                    className="h-10 text-xs font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-primary">रणनीती पोझिशन (Position)</label>
                <Select value={newPlayerPosition} onValueChange={setNewPlayerPosition}>
                  <SelectTrigger className="h-10 text-xs font-bold rounded-xl bg-amber-50 border-amber-300">
                    <SelectValue placeholder="पोझिशन निवडा" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {KABADDI_QUICK_POSITIONS.map(p => (
                      <SelectItem key={p.code} value={p.name} className="text-xs font-bold">
                        [{p.code}] {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                onClick={handleCreateAndAssignNewPlayer}
                disabled={isCreatingPlayer}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-11 gap-2 shadow-lg mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {isCreatingPlayer ? "खेळाडू जोडत आहे..." : "नवीन खेळाडू तयार करा व रणनीतीत ठेवा"}
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditModalOpen(false)}
              className="w-full rounded-xl font-black text-xs"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

