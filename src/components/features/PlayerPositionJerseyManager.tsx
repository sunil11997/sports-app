"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shirt, 
  Target, 
  Users, 
  Trophy, 
  Save, 
  Printer, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Crown, 
  Medal, 
  Sparkles,
  Search,
  LayoutGrid,
  ListOrdered,
  Flame,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { 
  cn, 
  getAgeValidation, 
  getLocalizedAgeCategory, 
  getOfficialSchoolName, 
  getTeacherName, 
  getSportPositions,
  SPORT_POSITIONS_MAP,
  transliterateEnglishToMarathi 
} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

const SUPPORTED_SPORTS = [
  'Kabaddi',
  'Kho Kho',
  'Volleyball',
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

export function PlayerPositionJerseyManager({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<string>(preselectedSport || 'Kabaddi');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'court'>('table');
  const [isSaving, setIsSaving] = useState(false);

  // Local draft changes: playerId -> { jersey: string, position: string }
  const [draftChanges, setDraftChanges] = useState<Record<string, { jersey?: string; position?: string }>>({});

  const allPlayers = useMemo(() => store?.data?.players || [], [store?.data?.players]);
  const availablePositions = useMemo(() => getSportPositions(selectedSport), [selectedSport]);

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

  // Compute jersey duplicates
  const jerseyDuplicates = useMemo(() => {
    const counts: Record<string, string[]> = {}; // jersey -> [playerNames]
    
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

        const updatedPlayer = {
          ...original,
          jerseyNumber: change.jersey !== undefined ? change.jersey : original.jerseyNumber,
          jerseyNumbers: updatedJerseyNumbers,
          positions: updatedPositions
        };

        if (store.updatePlayer) {
          await store.updatePlayer(updatedPlayer);
        }
      }

      setDraftChanges({});
      toast({
        title: "जर्सी व पोझिशन्स सेव्ह झाल्या! ✅",
        description: `${selectedSport} संघाची माहिती यशस्वीरित्या अपडेट केली गेली.`
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

    const listText = sportPlayers.map((p: any, idx: number) => {
      const draft = draftChanges[p.id];
      const jersey = draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-');
      const pos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '-');
      const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
      return `${idx + 1}. [जर्सी #${jersey}] ${displayName} (इ. ${p.std} वी) - 📍 ${pos}`;
    }).join('\n');

    const msg = `*${schoolName}*\n*अधिकृत सामना लाइन-अप व जर्सी तक्ता (Official Match Squad)*\n\n*क्रीडा प्रकार:* ${selectedSport}\n*गट:* ${selectedCategory} (${selectedGender})\n*क्रीडा शिक्षक:* ${teacherName}\n------------------------------\n*खेळाडू व जर्सी क्रमांक:*\n${listText}\n------------------------------\nवाघंबा स्पोर्ट्स हब डिजिटल प्रणाली`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handlePrintLineup = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const rows = sportPlayers.map((p: any, idx: number) => {
      const draft = draftChanges[p.id];
      const jersey = draft?.jersey !== undefined ? draft.jersey : (p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-');
      const pos = draft?.position !== undefined ? draft.position : (p.positions?.[selectedSport] || '-');
      const ageVal = getAgeValidation(p.dob);

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 900; font-size: 13px; color: #1e3a8a; background: #f1f5f9;">
            #${jersey}
          </td>
          <td>
            <div style="font-weight: 800; font-size: 11px;">${p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name}</div>
            <div style="font-size: 9px; color: #64748b;">${p.name}</div>
          </td>
          <td style="text-align: center; font-weight: bold;">इ. ${p.std} वी</td>
          <td style="text-align: center; font-weight: bold;">${pos}</td>
          <td style="text-align: center;">${ageVal?.category || p.ageCategory || '-'}</td>
          <td style="text-align: center; width: 45px; height: 40px; border: 1px dashed #94a3b8;">
            ${p.photoUrl ? `<img src="${p.photoUrl}" style="max-height: 35px; max-width: 35px; object-fit: cover;" />` : '<span style="font-size: 7px; color: #94a3b8;">Photo</span>'}
          </td>
          <td style="width: 70px;"></td>
        </tr>
      `;
    }).join('');

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
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.3; font-size: 10.5px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 20px; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .header-table td { border: none; padding: 2px; }
            
            .school-title { font-size: 17px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 12px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 12px; font-weight: 900; padding: 6px; border-radius: 4px; margin: 8px 0 12px 0; text-transform: uppercase; }
            
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
            table.data-table th, table.data-table td { border: 1px solid #64748b; padding: 5px 6px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; text-align: center; }
            
            .footer-sign { display: flex; justify-content: space-between; margin-top: 30px; padding: 0 20px; font-size: 11px; font-weight: 800; }
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
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत सामना लाइन-अप प्रिंट करा (Print)</button>
          </div>
          
          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 55px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन - शालेय क्रीडा स्पर्धा संघ निवड</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 50px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              सामना लाइन-अप व जर्सी तक्ता (Official Match Squad & Jersey Sheet) - ${selectedSport}
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 800; font-size: 10px; background: #e2e8f0; padding: 5px 10px; border-radius: 4px;">
              <div>खेळ: <span style="color: #1e3a8a;">${selectedSport}</span></div>
              <div>गट: <span style="color: #1e3a8a;">${selectedCategory} (${selectedGender})</span></div>
              <div>एकूण खेळाडू: <span style="color: #1e3a8a;">${sportPlayers.length}</span></div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px;">अ.क्र.</th>
                  <th style="width: 60px;">जर्सी नं.</th>
                  <th>खेळाडूचे नाव (Player Name)</th>
                  <th style="width: 50px;">इयत्ता</th>
                  <th>स्थान / पोझिशन (Position)</th>
                  <th style="width: 75px;">वयोगट</th>
                  <th style="width: 50px;">फोटो</th>
                  <th style="width: 70px;">स्वाक्षरी</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

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
                {selectedSport}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Shirt className="w-8 h-8 text-amber-400 shrink-0" />
              खेळाडू स्थान व जर्सी व्यवस्थापन (Position & Jersey Tracker)
            </h2>
            <p className="text-xs md:text-sm text-emerald-200/90 font-medium max-w-2xl">
              कबड्डी, खो-खो, व्हॉलीबॉल आणि ॲथलेटिक्ससाठी खेळाडूंना अधिकृत जर्सी क्रमांक व मैदानावरील पोझिशन्स नियुक्त करा.
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
              <Share2 className="w-4 h-4" /> WhatsApp लाइन-अप
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
                जर्सी <span className="font-black underline">#{num}</span> ही एकापेक्षा जास्त खेळाडूंना दिलेली आहे: <strong>{jerseyDuplicates.counts[num]?.join(', ')}</strong>. कृपया प्रत्येक खेळाडूस अद्वितीय (Unique) क्रमांक द्या.
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
            <Select value={selectedSport} onValueChange={(val) => { setSelectedSport(val); setDraftChanges({}); }}>
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
                <SelectItem value="U14" className="font-bold text-xs">U-14 (१४ वर्षांखालील)</SelectItem>
                <SelectItem value="U17" className="font-bold text-xs">U-17 (१७ वर्षांखालील)</SelectItem>
                <SelectItem value="U19" className="font-bold text-xs">U-19 (१९ वर्षांखालील)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> लिंग (Gender)
            </label>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="लिंग निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold text-xs">मुले व मुली (All)</SelectItem>
                <SelectItem value="Male" className="font-bold text-xs">मुले (Boys)</SelectItem>
                <SelectItem value="Female" className="font-bold text-xs">मुली (Girls)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-500" /> शोधा (Search)
            </label>
            <div className="relative">
              <Input
                placeholder="नाव किंवा G.R. ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-bold text-xs rounded-xl h-11 pl-9 border-2 border-primary/20"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> मांडणी (View Mode)
            </label>
            <div className="flex bg-muted/60 p-1 rounded-xl border border-primary/10 h-11 items-center">
              <Button
                type="button"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={cn("flex-1 text-xs font-bold rounded-lg h-9", viewMode === 'table' && "shadow-sm")}
              >
                <ListOrdered className="w-3.5 h-3.5 mr-1" /> तक्ता (Table)
              </Button>
              <Button
                type="button"
                variant={viewMode === 'court' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('court')}
                className={cn("flex-1 text-xs font-bold rounded-lg h-9", viewMode === 'court' && "shadow-sm")}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" /> मैदान (Ground)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-white overflow-hidden">
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
            <div>
              <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-500" />
                {selectedSport} संघ - जर्सी व पोझिशन नियुक्ती तक्ता
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                एकूण खेळाडू: <span className="text-primary font-black">{sportPlayers.length}</span>
              </p>
            </div>

            {hasUnsavedChanges && (
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1">
                ⚠️ सेव्ह न केलेले बदल उपलब्ध
              </Badge>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                  <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                  <th className="py-3.5 px-4 text-center w-28">जर्सी क्रमांक (Jersey #)</th>
                  <th className="py-3.5 px-4">खेळाडूचे नाव (Player Name)</th>
                  <th className="py-3.5 px-4 text-center">इयत्ता / वयोगट</th>
                  <th className="py-3.5 px-4 w-72">मैदानातील स्थान / पोझिशन (Position)</th>
                  <th className="py-3.5 px-4 text-center">रोल प्रिफिक्स (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/40">
                {sportPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground font-bold">
                      {selectedSport} क्रीडा प्रकारात कोणताही खेळाडू सापडला नाही. खेळाडूंच्या प्रोफाइलमध्ये हा खेळ निवडा.
                    </td>
                  </tr>
                ) : (
                  sportPlayers.map((player: any, idx: number) => {
                    const draft = draftChanges[player.id];
                    const currentJersey = draft?.jersey !== undefined 
                      ? draft.jersey 
                      : (player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || '');
                    const currentPos = draft?.position !== undefined 
                      ? draft.position 
                      : (player.positions?.[selectedSport] || '');

                    const isDup = currentJersey && jerseyDuplicates.duplicates.has(currentJersey);
                    const isChanged = draft !== undefined;

                    return (
                      <tr 
                        key={player.id} 
                        className={cn(
                          "hover:bg-primary/5 transition-colors font-medium",
                          isChanged && "bg-amber-50/40",
                          isDup && "bg-rose-50/50"
                        )}
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">
                          {idx + 1}
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
                          <div className="font-black text-slate-900 text-sm">
                            {player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold">
                            {player.name} &bull; GR: {player.generalRegisterNumber || '-'}
                          </div>
                        </td>

                        {/* Standard & Age */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">इ. {player.std} वी</span>
                          <span className="text-[10px] block text-muted-foreground font-semibold">
                            {player.ageCategory || 'U17'} &bull; {player.gender === 'Female' ? 'मुली' : 'मुले'}
                          </span>
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
                                <SelectItem key={pos.id} value={pos.nameEn} className="font-bold text-xs">
                                  <span className="font-mono text-primary font-black mr-1.5">[{pos.shortCode}]</span>
                                  {pos.nameMr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Role Tags */}
                        <td className="py-3.5 px-4 text-center">
                          {idx === 0 ? (
                            <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 shadow-sm">
                              ⭐ कर्णधार (CPT)
                            </Badge>
                          ) : idx === 1 ? (
                            <Badge className="bg-slate-300 text-slate-900 font-black text-[9px] px-2 py-0.5">
                              🥈 उपकर्णधार (VC)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] text-muted-foreground font-semibold">
                              खेळाडू
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
      ) : (
        /* Tactical Field / Ground Visualizer */
        <div className="space-y-6">
          <Card className="p-6 md:p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-emerald-900 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-amber-300">
                  <Activity className="w-6 h-6" />
                  {selectedSport} ग्राउंड रणनीती व्यू (Ground Layout)
                </h3>
                <p className="text-xs text-emerald-200 font-medium">
                  मैदानातील पोझिशननुसार खेळाडूंची मांडणी व जर्सी क्रमांक
                </p>
              </div>

              <Badge className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1">
                {sportPlayers.length} खेळाडू रोस्टर
              </Badge>
            </div>

            {/* Visual Ground / Tactical Pitch Layout */}
            <div className="bg-emerald-800/80 rounded-3xl p-6 border-4 border-white/20 relative min-h-[380px] flex flex-col justify-between shadow-inner">
              <div className="text-center font-black text-white/40 uppercase tracking-[0.3em] text-xs border-b border-white/20 pb-2">
                &mdash; प्रतिस्पर्धी बाजू (OPPONENT COURT / FIELD) &mdash;
              </div>

              {/* Positions Grid by Sport */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-6">
                {sportPlayers.map((player: any, idx: number) => {
                  const draft = draftChanges[player.id];
                  const jersey = draft?.jersey !== undefined 
                    ? draft.jersey 
                    : (player.jerseyNumbers?.[selectedSport] || player.jerseyNumber || idx + 1);
                  const pos = draft?.position !== undefined 
                    ? draft.position 
                    : (player.positions?.[selectedSport] || 'खेळाडू');
                  const marathi = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;

                  return (
                    <div 
                      key={player.id}
                      className="bg-slate-900/90 text-white p-3.5 rounded-2xl border-2 border-amber-400/40 shadow-lg flex items-center gap-3 hover:scale-105 transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-md">
                        #{jersey}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-black text-xs truncate text-white">
                          {marathi}
                        </div>
                        <div className="text-[10px] text-amber-300 font-bold truncate">
                          📍 {pos}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          इ. {player.std} वी
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center font-black text-white/40 uppercase tracking-[0.3em] text-xs border-t border-white/20 pt-2">
                &mdash; आपली बाजू (OUR ATTACK / DEFENSE LINE) &mdash;
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
