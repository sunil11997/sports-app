"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Upload
} from 'lucide-react';
import { 
  cn, 
  getAgeValidation, 
  getOfficialSchoolName, 
  getTeacherName, 
  getSportPositions,
  SPORT_POSITIONS_MAP,
  transliterateEnglishToMarathi 
} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

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
      { id: 'left_corner', nameEn: 'Left Corner', nameMr: 'डावा कोपरा (LC)', shortCode: 'LC', role: 'Defense', defaultPosName: 'डावा कोपरा (Left Corner)' },
      { id: 'left_in', nameEn: 'Left In', nameMr: 'डावा इन (LI)', shortCode: 'LI', role: 'Defense', defaultPosName: 'डावा इन (Left In)' },
      { id: 'left_cover', nameEn: 'Left Cover', nameMr: 'डावा कव्हर (L-COV)', shortCode: 'LCv', role: 'Defense', defaultPosName: 'डावा कव्हर (Left Cover)' },
      { id: 'center_raider', nameEn: 'Center / Main Raider', nameMr: 'मध्यरक्षक / चढाईपटू (CTR)', shortCode: 'CTR', role: 'Attack', defaultPosName: 'मध्यरक्षक / चढाईपटू' },
      { id: 'right_cover', nameEn: 'Right Cover', nameMr: 'उजवा कव्हर (R-COV)', shortCode: 'RCv', role: 'Defense', defaultPosName: 'उजवा कव्हर (Right Cover)' },
      { id: 'right_in', nameEn: 'Right In', nameMr: 'उजवा इन (RI)', shortCode: 'RI', role: 'Defense', defaultPosName: 'उजवा इन (Right In)' },
      { id: 'right_corner', nameEn: 'Right Corner', nameMr: 'उजवा कोपरा (RC)', shortCode: 'RC', role: 'Defense', defaultPosName: 'उजवा कोपरा (Right Corner)' },
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
  const [viewMode, setViewMode] = useState<'court' | 'table'>('court');
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

  // Filter players for selected sport
  const sportPlayers = useMemo(() => {
    return allPlayers.filter((p: any) => {
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
  }, [allPlayers, selectedSport, selectedGender, selectedCategory, searchQuery]);

  // Determine starters, reserves, and extended pool
  const { starters, reserves, extendedPool } = useMemo(() => {
    const startersLimit = squadConfig.startersCount;
    const maxSquad = squadConfig.maxSquad;

    const startersList = sportPlayers.slice(0, startersLimit);
    const reservesList = sportPlayers.slice(startersLimit, maxSquad);
    const extendedList = sportPlayers.slice(maxSquad);

    return {
      starters: startersList,
      reserves: reservesList,
      extendedPool: extendedList
    };
  }, [sportPlayers, squadConfig]);

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
              <div style="font-size: 9px; color: #64748b;">${p.name} &bull; GR: ${p.generalRegisterNumber || '-'}</div>
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
              <span className="text-[9px] font-mono text-emerald-400/80 font-bold">
                {posDef?.shortCode || `#${idx + 1}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
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
            इ. {player.std} वी &bull; GR: {player.generalRegisterNumber || '-'}
          </div>
        </div>

        {/* Position Badge & Dropdown Selector */}
        <div className="w-full mt-2">
          <Select
            value={currentPos}
            onValueChange={(val) => handlePositionChange(player.id, val)}
          >
            <SelectTrigger className="h-6 text-[9px] font-bold rounded-lg bg-slate-900 border border-amber-400/30 text-amber-300 px-1.5">
              <SelectValue placeholder="पोझिशन..." />
            </SelectTrigger>
            <SelectContent className="max-h-48 text-xs">
              {availablePositions.map(pos => (
                <SelectItem key={pos.id} value={pos.nameMr} className="text-xs font-bold">
                  <span className="font-mono text-primary font-bold mr-1">[{pos.shortCode}]</span> {pos.nameMr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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

          {/* View Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> डिस्प्ले व्ह्यू (View)
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('court')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  viewMode === 'court' ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Activity className="w-3.5 h-3.5" /> ग्राउंड (Court)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  viewMode === 'table' ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <ListOrdered className="w-3.5 h-3.5" /> तक्ता (Table)
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

              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1">
                  मैदानावर: {starters.length} / {squadConfig.startersCount}
                </Badge>
              </div>
            </div>

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

                {/* Starters Grid: 7 Positions for Kabaddi */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 my-4">
                  {squadConfig.positions.map((posDef, i) => {
                    const player = starters[i];
                    if (!player) {
                      return (
                        <div key={posDef.id} className="border-2 border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[160px] bg-slate-900/40 text-slate-400">
                          <div className="text-xs font-black text-amber-300 mb-1">{posDef.nameMr}</div>
                          <div className="text-[10px] text-slate-400">खेळाडू रिक्त</div>
                          <div className="text-[9px] text-slate-500 mt-2">रोस्टरमधून जोडा</div>
                        </div>
                      );
                    }
                    return renderPlayerCard(player, i, posDef, false);
                  })}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {reserves.map((player: any, i: number) => {
                    return renderPlayerCard(player, starters.length + i, undefined, true);
                  })}
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
                  <th className="py-3.5 px-4 text-center">इयत्ता</th>
                  <th className="py-3.5 px-4 w-64">मैदानातील पोझिशन (Position)</th>
                  <th className="py-3.5 px-4 text-center">क्रीडा शिक्षक निवड (Captaincy)</th>
                  <th className="py-3.5 px-4 text-center">प्रकार</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/40">
                {sportPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground font-bold">
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
                            {player.name} &bull; GR: {player.generalRegisterNumber || '-'}
                          </div>
                        </td>

                        {/* Standard */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">इ. {player.std} वी</span>
                        </td>

                        {/* Position Selector */}
                        <td className="py-3.5 px-4">
                          <Select 
                            value={currentPos || ''} 
                            onValueChange={(val) => handlePositionChange(player.id, val)}
                          >
                            <SelectTrigger className={cn(
                              "font-bold text-xs rounded-xl h-10 border-2",
                              isChanged ? "border-amber-500 bg-amber-50" : "border-primary/20"
                            )}>
                              <SelectValue placeholder="पोझिशन निवडा..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePositions.map(pos => (
                                <SelectItem key={pos.id} value={pos.nameMr} className="font-bold text-xs">
                                  <span className="font-mono text-primary font-black mr-1.5">[{pos.shortCode}]</span>
                                  {pos.nameMr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
    </div>
  );
}

