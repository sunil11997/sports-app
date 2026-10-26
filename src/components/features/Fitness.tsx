"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Printer, 
  Loader2, 
  Flame,
  Search,
  RefreshCw,
  WifiOff,
  MessageSquare,
  Trophy,
  Zap,
  Timer,
  Ruler,
  ChevronLeft,
  Award,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, shareToWhatsApp, getAgeValidation, calculateBMI, transliterateEnglishToMarathi, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { usePWA } from '@/components/providers/pwa-provider';
import { evaluateKheloIndiaFitness, TALENT_TIER_DETAILS, type TalentTier } from '@/lib/kheloIndiaNorms';

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `Std ${i + 1}` 
  }))
];

export function Fitness({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [localMarathiView, setLocalMarathiView] = useState(language === 'Marathi');
  const [filterTidOnly, setFilterTidOnly] = useState(false);

  useEffect(() => {
    setLocalMarathiView(language === 'Marathi');
  }, [language]);

  const getPlayerCategory = useCallback((p: any) => {
    if (!p) return 'all';
    return p.std;
  }, []);

  // Compute talent candidates
  const talentCounts = useMemo(() => {
    const players = store.data.players || [];
    let talentCount = 0;
    players.forEach((p: any) => {
      const fit = store.data.fitness?.[p.id] || {};
      if (fit.kheloIndiaTier === 'talent' || fit.kheloIndiaTier === 'state' || (parseInt(fit.score || '0') >= 75)) {
        talentCount++;
      }
    });
    return talentCount;
  }, [store.data.players, store.data.fitness]);

  const filteredPlayers = useMemo(() => {
    if (!store.data.players) return [];
    const query = searchTerm.trim().toLowerCase();
    
    return store.data.players
      .filter((p: any) => {
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        if (!matchesTab) return false;

        const fit = store.data.fitness?.[p.id] || {};
        if (filterTidOnly) {
          const isTalent = fit.kheloIndiaTier === 'talent' || fit.kheloIndiaTier === 'state' || (parseInt(fit.score || '0') >= 75);
          if (!isTalent) return false;
        }

        if (!query) return true;
        const name = (p.name || "").toLowerCase();
        const marathiName = (p.nameMarathi || "").toLowerCase();
        const gr = (p.generalRegisterNumber || "").toLowerCase();
        
        return name.includes(query) || marathiName.includes(query) || gr.includes(query);
      })
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        return (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0);
      });
  }, [store.data.players, store.data.fitness, activeCategory, getPlayerCategory, searchTerm, filterTidOnly]);

  const handleAutoSave = async (playerId: string) => {
    const player = (store.data.players || []).find((p: any) => p.id === playerId);
    const current = { ...(assessments[playerId] || store.data.fitness?.[playerId] || {}) };
    setIsSaving(playerId);
    
    // Evaluate against official SAI Khelo India Norms
    const evalResult = evaluateKheloIndiaFitness({
      age: player?.age,
      gender: player?.gender,
      run50m: current.run50m,
      run600m: current.run600m,
      sitAndReach: current.sitAndReach,
      sitUps: current.sitUps,
      shuttleRun: current.shuttleRun,
      boardJump: current.boardJump,
    });

    const hasAnyMetric = Boolean(
      current.shuttleRun || current.boardJump || current.run50m || 
      current.run600m || current.sitAndReach || current.sitUps
    );

    if (!hasAnyMetric) {
      current.score = '';
      current.status = 'प्रलंबित (Pending)';
      current.kheloIndiaTier = 'developing';
      current.kheloIndiaPercentile = 0;
    } else {
      current.score = evalResult.overallPercentile.toString();
      current.status = evalResult.tierInfo.badgeMr.split(' ')[1] || 'Active';
      current.kheloIndiaBadge = evalResult.tierInfo.badgeMr;
      current.kheloIndiaTier = evalResult.tier;
      current.kheloIndiaPercentile = evalResult.overallPercentile;
      current.strengths = evalResult.strengthsMr;
      current.recommendations = evalResult.recommendationsMr;
    }

    await store.setFitness(playerId, { ...current, playerId, month: format(new Date(), 'yyyy-MM') });
    
    setLastSavedId(playerId);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handlePrint = () => {
    const isM = localMarathiView;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, isM);
    const reportTitle = isM 
      ? `विद्यार्थी शारीरिक क्षमता व खेलो इंडिया टॅलेंट मूल्यांकन अहवाल - ${activeCategory === 'all' ? 'सर्व इयत्ता' : 'इयत्ता ' + activeCategory}`
      : `Student Physical Fitness & SAI Khelo India Talent Assessment - ${activeCategory === 'all' ? 'All Classes' : 'Standard ' + activeCategory}`;
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, isM);

    const printContent = `
      <html>
        <head>
          <title>SAI Khelo India Fitness Registry - ${format(new Date(), 'dd/MM/yyyy')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
            @media print { 
              @page { size: landscape; margin: 0.8cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; font-size: 9.5px; color: #111; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
            .dept-title { font-size: 11px; font-weight: 800; color: #b45309; }
            .school-name { font-size: 16px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 3px 0; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; font-size: 11px; color: #0f766e; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1.5px solid #1e3a8a !important; padding: 5px; text-align: center; }
            th { background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 900; text-transform: uppercase; font-size: 8px; }
            .name-cell { text-align: left; font-weight: 900; min-width: 140px; }
            .badge-cell { font-weight: 800; font-size: 8.5px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 10px; font-weight: 900; text-transform: uppercase; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 70px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'GO BACK'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? 'प्रिंट करा' : 'CONFIRM PRINT'}</button>
          </div>
          <div class="header">
            <div class="dept-title">महाराष्ट्र शासन • आदिवासी विकास विभाग (क्रीडा व शारीरिक शिक्षण)</div>
            <div class="school-name">${schoolName}</div>
            <div class="report-type">${reportTitle}</div>
            <div style="font-size: 9px; font-weight: 700; color: #475569; margin-top: 3px;">
              Date: ${format(new Date(), 'dd MMMM yyyy')} | SAI Khelo India Battery Assessment Registry
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>STUDENT NAME</th>
                <th>STD</th>
                <th>HT (cm)</th>
                <th>WT (kg)</th>
                <th>BMI</th>
                <th>10x6 SHUTTLE</th>
                <th>BOARD JUMP</th>
                <th>50m RUN (s)</th>
                <th>600m RUN (s)</th>
                <th>SIT & REACH</th>
                <th>SIT-UPS</th>
                <th>PERCENTILE</th>
                <th>KHELO INDIA NORM / TALENT TIER</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any, i: number) => {
                const fit = store.data.fitness?.[p.id] || {};
                const dName = isM ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name;
                const heightVal = p.height || fit.height || '-';
                const weightVal = p.weight || fit.weight || '-';
                const bmiVal = calculateBMI(heightVal !== '-' ? heightVal : null, weightVal !== '-' ? weightVal : null, p.bmi || fit.bmi);
                const tier = (fit.kheloIndiaTier as TalentTier) || 'developing';
                const tierInfo = TALENT_TIER_DETAILS[tier] || TALENT_TIER_DETAILS.developing;

                return `
                  <tr>
                    <td>${p.serialNumber || i+1}</td>
                    <td class="name-cell">${dName}</td>
                    <td>${p.std}</td>
                    <td>${heightVal}</td>
                    <td>${weightVal}</td>
                    <td><strong>${bmiVal}</strong></td>
                    <td>${fit.shuttleRun || '-'}</td>
                    <td>${fit.boardJump || '-'}</td>
                    <td>${fit.run50m || '-'}</td>
                    <td>${fit.run600m || '-'}</td>
                    <td>${fit.sitAndReach || '-'}</td>
                    <td>${fit.sitUps || '-'}</td>
                    <td><strong>${fit.score || '0'}%</strong></td>
                    <td class="badge-cell"><strong>${tierInfo.badgeMr}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          ${signatureBlockHtml}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  const handleWhatsAppShare = (player: any) => {
    const fit = store.data.fitness?.[player.id] || {};
    const tier = (fit.kheloIndiaTier as TalentTier) || 'developing';
    const tierInfo = TALENT_TIER_DETAILS[tier] || TALENT_TIER_DETAILS.developing;

    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: store.data.schoolProfile?.schoolName,
      teacherName: store.data.schoolProfile?.teacherName,
      studentName: localMarathiView ? (player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name) : player.name,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: player.height || "---",
      weight: player.weight || "---",
      reportType: "शारीरिक क्षमता व खेलो इंडिया टॅलेंट कार्ड (Fitness Hub)",
      reportData: `स्कोअर: ${fit.score || '0'}% (${tierInfo.badgeMr})\nतपशील: ५० मी. स्प्रिंट: ${fit.run50m || '-'}s | ६०० मी: ${fit.run600m || '-'}s`
    });
  };

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({ ...prev, [id]: { ...(prev[id] || store.data.fitness?.[id] || {}), [field]: value } }));
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border shadow-xl">
        <div className="flex items-center gap-3 sm:gap-6 flex-1">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-amber-500/10 rounded-xl sm:rounded-[2rem] flex items-center justify-center border-2 border-amber-500/20 shadow-inner shrink-0 text-amber-500">
            <Trophy className="w-7 h-7 sm:w-10 sm:h-10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
                {localMarathiView ? "शारीरिक क्षमता व खेलो इंडिया टॅलेंट हब" : "SAI Khelo India Fitness & Talent Hub"}
              </h2>
              <Badge className="bg-amber-500/20 text-amber-700 border-amber-300 font-bold text-[10px]">
                SAI Norms
              </Badge>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 sm:mt-1">
              National Fitness Battery • Talent Identification Engine v6.4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-[450px]">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-primary/40" />
            <Input 
              placeholder={localMarathiView ? "नाव किंवा GR ने शोधा..." : "Find Student by Name or GR..."} 
              className="pl-11 sm:pl-14 h-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-primary/10 bg-muted/20 font-bold text-xs sm:text-base shadow-inner focus:bg-white transition-all placeholder:text-muted-foreground/40" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button onClick={handlePrint} className="h-12 sm:h-16 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm shadow-xl active-scale transition-all shrink-0">
            <Printer className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 bg-muted/40 rounded-xl sm:rounded-[2rem] border shadow-inner">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {GENERAL_CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 sm:h-10 rounded-lg sm:rounded-xl px-3 sm:px-5 text-[10px] sm:text-[11px] font-black uppercase transition-all whitespace-nowrap shrink-0",
                activeCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white'
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant={filterTidOnly ? "default" : "outline"}
            onClick={() => setFilterTidOnly(!filterTidOnly)}
            className={cn(
              "h-8 sm:h-9 text-[10px] sm:text-xs font-black rounded-xl gap-1.5 shadow-sm transition-all",
              filterTidOnly 
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600" 
                : "border-amber-300 text-amber-700 hover:bg-amber-50"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {localMarathiView ? "🏆 राष्ट्रीय गुणवत्ता शोध (TID)" : "🏆 Talent Identified (TID)"}
            <Badge className="ml-1 bg-amber-600 text-white px-1.5 py-0 text-[9px] rounded-full">
              {talentCounts}
            </Badge>
          </Button>

          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 h-8 flex items-center gap-1.5 px-3 rounded-full text-[9px] sm:text-[10px]">
            <RefreshCw className={cn("w-3 h-3", isOnline && "animate-spin")} />
            {isOnline ? 'CLOUD SYNC' : 'OFFLINE'}
          </Badge>
        </div>
      </div>

      <Card className="border-2 rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl relative">
        <div className="overflow-x-auto scrollbar-hide relative max-h-[70vh] overflow-y-auto">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-100 sticky top-0 z-50 shadow-sm border-b">
              <TableRow className="h-14 sm:h-18">
                <TableHead className="px-3 sm:px-8 font-black uppercase w-[160px] sm:w-[240px] sticky left-0 top-0 bg-slate-200 z-[60] border-r text-xs">
                   Student Profile
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-accent" />10x6 Shuttle
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-amber-500" />Board Jump
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-blue-500" />50m Speed (s)
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-emerald-500" />600m Run (s)
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-purple-500" />Sit & Reach (cm)
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[90px] sm:w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-rose-500" />Sit-Ups (reps)
                </TableHead>
                <TableHead className="px-3 sm:px-6 font-black uppercase text-center w-[150px] sm:w-[190px] bg-amber-500/10 sticky top-0 z-40 border-r text-xs">
                   SAI Khelo India Norm
                </TableHead>
                <TableHead className="px-2 sm:px-4 font-black uppercase text-center w-[70px] sm:w-[80px] sticky top-0 bg-slate-100 z-40 text-xs">
                   Share
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-32 opacity-40 font-black uppercase text-base sm:text-lg">
                    {filterTidOnly 
                      ? "कोणताही राष्ट्रीय/राज्य गुणवत्ता खेळाडू सापडला नाही. आधी फिटनेस चाचणी नोंदवा." 
                      : "No registry entries"}
                  </TableCell>
                </TableRow>
              ) : filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                const isPulse = lastSavedId === player.id;
                const isSyncing = isSaving === player.id;
                const tier = (current.kheloIndiaTier as TalentTier) || 'developing';
                const tierInfo = TALENT_TIER_DETAILS[tier] || TALENT_TIER_DETAILS.developing;

                return (
                  <TableRow key={player.id} className={cn("border-b h-14 sm:h-18 transition-all", isPulse && "bg-emerald-50 animate-success-pulse", isSyncing && "bg-muted/50")}>
                    <TableCell className="px-3 sm:px-8 font-black sticky left-0 bg-white z-20 uppercase text-xs border-r group-hover:bg-muted/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-primary leading-none truncate max-w-[130px] sm:max-w-[200px]">
                          {localMarathiView ? (player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name) : player.name}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">
                          Roll #{player.serialNumber || '0'} &bull; Std {player.std} &bull; Age {player.age}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm font-black focus:bg-white" value={current.shuttleRun || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm font-black focus:bg-white" value={current.boardJump || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm font-black focus:bg-white" value={current.run50m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm focus:bg-white" value={current.run600m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm focus:bg-white" value={current.sitAndReach || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-14 sm:h-18 text-center border-0 bg-transparent text-xs sm:text-sm font-black focus:bg-white" value={current.sitUps || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                    <TableCell className="p-2 sm:p-4 text-center bg-amber-500/5 border-r">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-base sm:text-xl font-black text-primary leading-none">
                          {current.score ? `${current.score}%` : '---'}
                        </span>
                        <Badge className={cn("text-[8px] sm:text-[9px] font-bold border px-2 py-0.5 whitespace-nowrap", tierInfo.colorClass)}>
                          {tierInfo.badgeMr.split(' ')[0]} {tierInfo.badgeMr.split(' ')[1]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="p-1 sm:p-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(player)} disabled={!player.mobileNumber} className="text-emerald-600 hover:bg-emerald-50 rounded-full h-8 w-8 sm:h-10 sm:w-10 shadow-inner border border-transparent hover:border-emerald-100">
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
