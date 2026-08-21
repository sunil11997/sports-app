"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  HeartPulse, 
  Moon, 
  Activity, 
  Save, 
  Loader2, 
  Users, 
  ShieldCheck, 
  Zap, 
  Info, 
  ClipboardCheck, 
  ZoomIn, 
  User,
  Printer,
  Sparkles,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Award
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn, transliterateEnglishToMarathi, shareToWhatsApp, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const CoachAlertSystem = {
  evaluateAthleteReadiness: (input: {
    sleepHours: number;
    soreness: number;
    fatigue: number;
    injuryStatus: string;
    phvOffset: number;
  }) => {
    const { sleepHours, soreness, fatigue, injuryStatus, phvOffset } = input;

    if (injuryStatus === "Sidelined") {
      return {
        statusColor: "RED",
        score: 30,
        action: "विश्रांती द्या (Complete Rest)",
        advice: "खेळाडूला आज मैदानावरील सरावातून पूर्ण विश्रांती द्या आणि फिजिओथेरपी किंवा डॉक्टरांचा सल्ला घ्या.",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-300",
        badgeBg: "bg-rose-600 text-white",
        dot: "bg-rose-600"
      };
    }

    const isGrowthSpurt = !isNaN(phvOffset) && phvOffset >= -0.5 && phvOffset <= 0.5;
    const strainScore = soreness + fatigue;

    if (strainScore >= 7 || sleepHours < 6 || injuryStatus === "Restricted") {
      return {
        statusColor: "YELLOW",
        score: 65,
        action: "सराव मर्यादित करा (Light/Restricted)",
        advice: isGrowthSpurt 
            ? "खेळाडू 'ग्रोथ स्पर्ट' (उंची वाढ) टप्प्यात असून थकवा जास्त आहे. उड्या मारणे व जड वजन बंद करून केवळ हलका तांत्रिक सराव घ्या."
            : "थकवा जास्त आहे किंवा झोप कमी झाली आहे. धावणे व ताकदीचा सराव कमी करून हलका कौशल्य सराव घ्या.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-300",
        badgeBg: "bg-amber-500 text-slate-950",
        dot: "bg-amber-500"
      };
    }

    return {
      statusColor: "GREEN",
      score: 95,
      action: "पूर्ण सराव (100% Fit & Ready)",
      advice: isGrowthSpurt
          ? "खेळाडू तंदुरुस्त आहे, पण उंची वाढण्याचा काळ सुरू असल्याने धावण्याच्या अचूक पोश्चरवर लक्ष ठेवा."
          : "खेळाडू पूर्णपणे सज्ज आहे. आज तुम्ही पूर्ण ताकद, गती आणि सामन्याचा सराव घेऊ शकता.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      badgeBg: "bg-emerald-600 text-white",
      dot: "bg-emerald-600"
    };
  }
};

const calculatePhvOffset = (player: any) => {
  if (!player?.height || !player?.weight || !player?.age) return 0;
  
  const h = parseFloat(player.height);
  const sH = parseFloat(player.sittingHeight || (h * 0.52).toFixed(1));
  const w = parseFloat(player.weight);
  const age = Number(player.age) || 0;
  
  if (isNaN(h) || isNaN(w) || isNaN(age)) return 0;

  const legL = h - sH;
  let offset = 0;
  
  if (player.gender === 'Male') {
    offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
  } else {
    offset = -9.376 + (0.0001881 * (legL * sH)) + (0.022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
  }
  
  return isNaN(offset) ? 0 : offset;
};

export function DailyReadiness({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [sleepHours, setSleepHours] = useState(8);
  const [sorenessScore, setSorenessScore] = useState(1);
  const [fatigueScore, setFatigueScore] = useState(1);
  const [injuryStatus, setInjuryStatus] = useState("Fit to Train");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedAthleteForPhoto, setSelectedAthleteForPhoto] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const players = useMemo(() => {
    if (!store?.data?.players) return [];
    return [...store.data.players]
      .filter((p: any) => p && p.category === 'athlete' && (!preselectedSport || !p.sports?.length || p.sports.includes(preselectedSport)))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [store?.data?.players, preselectedSport]);

  const filteredSquad = useMemo(() => {
    if (!searchQuery) return players;
    const q = searchQuery.toLowerCase();
    return players.filter((p: any) => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.nameMarathi || '').toLowerCase().includes(q) || 
      (p.std || '').toString().includes(q)
    );
  }, [players, searchQuery]);

  // Set default selected player
  useEffect(() => {
    if (!selectedPlayerId && players.length > 0) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  // Sync state when selecting a different player
  useEffect(() => {
    if (selectedPlayerId && store.data.dailyReadiness?.[selectedPlayerId]) {
      const d = store.data.dailyReadiness[selectedPlayerId];
      setSleepHours(d.sleepHours || 8);
      setSorenessScore(d.sorenessScore || 1);
      setFatigueScore(d.fatigueScore || 1);
      setInjuryStatus(d.injuryStatus || "Fit to Train");
    } else {
      setSleepHours(8);
      setSorenessScore(1);
      setFatigueScore(1);
      setInjuryStatus("Fit to Train");
    }
  }, [selectedPlayerId, store.data.dailyReadiness]);

  const activeAlert = useMemo(() => {
    if (!selectedPlayerId || !players) return null;
    const p = players.find((p: any) => p.id === selectedPlayerId);
    if (!p) return null;
    return CoachAlertSystem.evaluateAthleteReadiness({
      sleepHours,
      soreness: sorenessScore,
      fatigue: fatigueScore,
      injuryStatus,
      phvOffset: calculatePhvOffset(p)
    });
  }, [selectedPlayerId, players, sleepHours, sorenessScore, fatigueScore, injuryStatus]);

  const handleSave = useCallback(async () => {
    if (!selectedPlayerId || !isMounted || !store) return;
    setIsSaving(true);
    try {
      const p = players.find((pl: any) => pl.id === selectedPlayerId);
      const displayName = p?.nameMarathi || p?.name || 'खेळाडू';

      await store.setReadiness(selectedPlayerId, {
        sleepHours, 
        sorenessScore, 
        fatigueScore, 
        injuryStatus,
        readinessScore: activeAlert?.score || 95,
        readinessStatus: activeAlert?.statusColor || "GREEN",
        recordedAt: new Date().toISOString()
      });

      toast({ 
        title: "✅ सज्जता नोंद जतन झाली!", 
        description: `${displayName} ची आजची सराव सज्जता (${activeAlert?.action}) नोंदवली गेली.`,
        className: "bg-emerald-600 text-white font-bold"
      });
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [selectedPlayerId, isMounted, store, sleepHours, sorenessScore, fatigueScore, injuryStatus, activeAlert, players, toast]);

  // Fast 1-Tap Batch: Mark All Athletes 100% Fit & Ready
  const handleMarkAllReady = async () => {
    if (!players || players.length === 0) return;
    setIsSaving(true);
    try {
      for (const p of players) {
        await store.setReadiness(p.id, {
          sleepHours: 8,
          sorenessScore: 1,
          fatigueScore: 1,
          injuryStatus: "Fit to Train",
          readinessScore: 100,
          readinessStatus: "GREEN",
          recordedAt: new Date().toISOString()
        });
      }
      toast({
        title: "⚡ सर्व खेळाडू पूर्ण फिट नोंदवले!",
        description: `एकूण ${players.length} खेळाडूंची सकाळच्या सरावासाठी १००% सज्जता नोंदवली गेली.`,
        className: "bg-emerald-600 text-white font-bold"
      });
    } catch (e) {
      toast({ title: "त्रुटी", description: "नोंद जतन करताना अडचण आली.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp Readiness Share
  const handleWhatsAppShare = (player: any) => {
    const d = store.data.dailyReadiness?.[player.id] || {};
    const evalData = CoachAlertSystem.evaluateAthleteReadiness({
      sleepHours: d.sleepHours || 8,
      soreness: d.sorenessScore || 1,
      fatigue: d.fatigueScore || 1,
      injuryStatus: d.injuryStatus || "Fit to Train",
      phvOffset: calculatePhvOffset(player)
    });

    const profile = store.data.schoolProfile;
    const displayName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;

    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: profile?.schoolName,
      teacherName: profile?.teacherName,
      studentName: displayName,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: player.height || "---",
      weight: player.weight || "---",
      reportType: "दैनिक सराव सज्जता व आरोग्य निर्देशांक (Daily Readiness)",
      reportData: `तंदुरुस्ती स्थिती: ${evalData.action}\nझोप: ${d.sleepHours || 8} तास\nस्नायू थकवा (Soreness): ${d.sorenessScore || 1}/१०\nशारीरिक थकवा (Fatigue): ${d.fatigueScore || 1}/१०\nमार्गदर्शन: ${evalData.advice}`
    });
  };

  // Print Official Readiness Audit
  const handlePrintAudit = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, true);

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Athlete Readiness Audit Registry - Waghamba Hub</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print {
              @page { size: A4 portrait; margin: 0.8cm; }
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 25px; color: #0f172a; line-height: 1.4; background: #fff; font-size: 11px; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 3px double #f59e0b; text-align: center; margin-bottom: 4px; font-size: 18px; font-weight: 900; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 12px; color: #b45309; font-size: 13px; }
            .meta { font-weight: 700; text-transform: uppercase; font-size: 10px; margin-bottom: 15px; text-align: center; background: #f1f5f9; padding: 6px; border-radius: 6px; }
            .audit-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: middle; }
            .audit-table th { background: #1e3a8a; color: white; text-transform: uppercase; font-weight: 800; font-size: 9px; }
            .audit-table tr:nth-child(even) { background: #f8fafc; }
            .green-badge { background: #dcfce7; color: #15803d; font-weight: 900; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .yellow-badge { background: #fef3c7; color: #b45309; font-weight: 900; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .red-badge { background: #fee2e2; color: #b91c1c; font-weight: 900; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: 900; text-transform: uppercase; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.15); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (GO BACK)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत ऑडिट प्रिंट करा (PRINT AUDIT)</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">दैनिक खेळाडू सराव सज्जता व आरोग्य नोंदवही (Daily Readiness Audit)</div>
          <div class="meta">खेळ: ${preselectedSport || 'सर्व संघ'} &bull; एकूण खेळाडू: ${players.length} &bull; दिनांक: ${format(new Date(), 'dd MMMM yyyy')}</div>

          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 5%;">अ.क्र.</th>
                <th style="width: 25%;">खेळाडूचे नाव</th>
                <th style="width: 10%;">इयत्ता</th>
                <th style="width: 12%;">झोप (तास)</th>
                <th style="width: 12%;">थकवा इंडेक्स</th>
                <th style="width: 18%;">सज्जता स्थिती (Readiness)</th>
                <th style="width: 18%;">कोच शेरा / कृती</th>
              </tr>
            </thead>
            <tbody>
              ${players.map((p: any, idx: number) => {
                const d = store.data.dailyReadiness?.[p.id] || {};
                const evalData = CoachAlertSystem.evaluateAthleteReadiness({
                  sleepHours: d.sleepHours || 8,
                  soreness: d.sorenessScore || 1,
                  fatigue: d.fatigueScore || 1,
                  injuryStatus: d.injuryStatus || "Fit to Train",
                  phvOffset: calculatePhvOffset(p)
                });
                const badgeClass = evalData.statusColor === 'GREEN' ? 'green-badge' : evalData.statusColor === 'YELLOW' ? 'yellow-badge' : 'red-badge';
                const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                    <td>
                      <strong>${displayName}</strong><br/>
                      <span style="font-size: 8.5px; color: #64748b;">Roll No: #${p.serialNumber || '0'}</span>
                    </td>
                    <td>इयत्ता ${p.std} वी</td>
                    <td>${d.sleepHours || 8} तास</td>
                    <td>Soreness: ${d.sorenessScore || 1}/10 &bull; Fatigue: ${d.fatigueScore || 1}/10</td>
                    <td><span class="${badgeClass}">${evalData.action}</span></td>
                    <td style="font-size: 9px; font-style: italic;">${evalData.advice}</td>
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
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <HeartPulse className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                दैनिक खेळाडू सज्जता व आरोग्य नोंद (Daily Readiness Pad)
              </h2>
              <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                Live Pulse
              </Badge>
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PHV Growth Spurt Alert &bull; Muscle Fatigue Engine &bull; Quick Touch Pad
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleMarkAllReady}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase text-xs tracking-wider h-12 px-5 rounded-2xl shadow-xl active-scale flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> सर्व खेळाडू १००% फिट (Mark All Ready)
          </Button>
          <Button 
            onClick={handlePrintAudit}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black uppercase text-xs tracking-wider h-12 px-5 rounded-2xl shadow-xl active-scale flex items-center gap-2"
          >
            <Printer className="w-4 h-4 mr-1" /> अधिकृत रिपोर्ट प्रिंट करा
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 1-Tap Touch Grading Form */}
        <Card className="lg:col-span-5 border-2 rounded-[2.5rem] p-7 shadow-xl bg-white space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Athlete Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" /> १. खेळाडू निवडा (Select Athlete):
              </label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-slate-50 text-base">
                  <SelectValue placeholder="खेळाडू निवडा..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {players.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nameMarathi || p.name} (इयत्ता {p.std} वी &bull; Roll #{p.serialNumber || '0'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Real-Time Readiness Scorecard Box */}
            {activeAlert && (
              <div className={cn(
                "p-5 rounded-2xl border-2 space-y-3 transition-all shadow-sm",
                activeAlert.bg,
                activeAlert.border
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm", activeAlert.color)}>
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <Badge className={cn("font-black uppercase text-[9px] px-2.5", activeAlert.badgeBg)}>
                        {activeAlert.statusColor} Alert &bull; Score {activeAlert.score}/100
                      </Badge>
                      <h4 className={cn("text-base font-black uppercase leading-tight mt-1", activeAlert.color)}>
                        {activeAlert.action}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-xl border border-white/60">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                    &quot;{activeAlert.advice}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Quick Touch Grids for Ground Evaluation */}
            <div className="space-y-5 pt-2">
              
              {/* A. Sleep Hours Touch Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" /> रात्रीची झोप (Sleep Hours):
                  </span>
                  <Badge className="bg-indigo-100 text-indigo-900 font-black text-xs">{sleepHours} तास</Badge>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 6, 7, 8, 9, 10].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSleepHours(h)}
                      className={cn(
                        "h-10 rounded-xl font-black text-xs border transition-all flex items-center justify-center",
                        sleepHours === h 
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-md scale-105" 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* B. Muscle Soreness Touch Pad (1 to 5) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" /> स्नायू दुखणे (Muscle Soreness):
                  </span>
                  <Badge className={cn(
                    "font-black text-xs",
                    sorenessScore >= 4 ? "bg-rose-100 text-rose-800" : sorenessScore >= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {sorenessScore === 1 ? 'काहीही नाही' : sorenessScore <= 3 ? 'मध्यम' : 'जास्त दुखणे'} ({sorenessScore}/5)
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSorenessScore(n)}
                      className={cn(
                        "h-10 rounded-xl font-black text-xs border transition-all flex items-center justify-center",
                        sorenessScore === n 
                          ? (n <= 2 ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : n === 3 ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105" : "bg-rose-600 text-white border-rose-700 shadow-md scale-105")
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* C. Physical Fatigue Touch Pad (1 to 5) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" /> शारीरिक थकवा (Fatigue Level):
                  </span>
                  <Badge className={cn(
                    "font-black text-xs",
                    fatigueScore >= 4 ? "bg-rose-100 text-rose-800" : fatigueScore >= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {fatigueScore === 1 ? 'ताजेतवाने (Fresh)' : fatigueScore <= 3 ? 'सामान्य' : 'अतिथकवा'} ({fatigueScore}/5)
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFatigueScore(n)}
                      className={cn(
                        "h-10 rounded-xl font-black text-xs border transition-all flex items-center justify-center",
                        fatigueScore === n 
                          ? (n <= 2 ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : n === 3 ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105" : "bg-rose-600 text-white border-rose-700 shadow-md scale-105")
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* D. Injury Status */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase ml-1 block">
                  दुखापत स्थिती (Injury Status):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Fit to Train', label: 'तंदुरुस्त (Fit)', color: 'bg-emerald-600' },
                    { id: 'Restricted', label: 'हलका सराव', color: 'bg-amber-500' },
                    { id: 'Sidelined', label: 'विश्रांती (Rest)', color: 'bg-rose-600' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setInjuryStatus(st.id)}
                      className={cn(
                        "h-11 rounded-xl font-black text-[10px] uppercase border transition-all flex items-center justify-center text-center px-1",
                        injuryStatus === st.id 
                          ? `${st.color} text-white shadow-md scale-105 border-transparent` 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!selectedPlayerId || isSaving} 
            className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale mt-4"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
            आजची सज्जता नोंद जतन करा
          </Button>
        </Card>

        {/* Right Column: Squad Readiness Dashboard Roster */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                खेळाडू सज्जता रोस्टर ({players.length} खेळाडू)
              </h3>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="खेळाडू शोधा..."
                className="pl-9 h-10 rounded-xl text-xs font-bold border-2 bg-white"
              />
            </div>
          </div>

          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[600px]">
            <div className="bg-slate-50 p-4 border-b flex items-center justify-between text-xs font-black uppercase text-slate-700">
              <span>खेळाडू प्रोफाइल</span>
              <span>आजची स्थिती व कृती</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[650px] p-4 space-y-3">
              {filteredSquad.length === 0 ? (
                <div className="py-24 text-center opacity-30">
                  <Users className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-black uppercase">कोणतेही खेळाडू आढळले नाहीत.</p>
                </div>
              ) : (
                filteredSquad.map((player: any) => {
                  const d = store.data.dailyReadiness?.[player.id] || {};
                  const evalData = CoachAlertSystem.evaluateAthleteReadiness({
                    sleepHours: d.sleepHours || 8,
                    soreness: d.sorenessScore || 1,
                    fatigue: d.fatigueScore || 1,
                    injuryStatus: d.injuryStatus || "Fit to Train",
                    phvOffset: calculatePhvOffset(player)
                  });
                  const displayName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;

                  return (
                    <div 
                      key={player.id} 
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 group",
                        selectedPlayerId === player.id 
                          ? "bg-primary/5 border-primary shadow-md" 
                          : "bg-white border-slate-200 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div 
                          onClick={() => setSelectedAthleteForPhoto(player)}
                          className="relative cursor-pointer shrink-0"
                          title="फोटो झूम करा"
                        >
                          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                            <AvatarImage src={player.photoUrl} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                              {player.name ? player.name[0] : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm",
                            evalData.dot
                          )} />
                        </div>

                        <div 
                          onClick={() => setSelectedPlayerId(player.id)}
                          className="min-w-0 cursor-pointer"
                        >
                          <p className="font-black text-sm text-slate-900 uppercase leading-none truncate group-hover:text-primary transition-colors">
                            {displayName}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 block">
                            Std {player.std} &bull; Roll #{player.serialNumber || '0'} &bull; {player.age ? `${player.age} वर्षे` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("font-black text-[9px] uppercase px-2.5 py-1", evalData.badgeBg)}>
                          {evalData.action}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleWhatsAppShare(player)}
                          className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                          title="WhatsApp वर शेअर करा"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex items-center justify-between text-[10px] font-black uppercase text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cloud Synced
              </span>
              <span>वाघंबा क्रीडा आरोग्य केंद्र</span>
            </div>
          </Card>
        </div>

      </div>

      {/* Lightbox Photo Preview Modal */}
      <Dialog open={!!selectedAthleteForPhoto} onOpenChange={() => setSelectedAthleteForPhoto(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-5 bg-slate-950 text-white border-2 border-amber-400/40">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-amber-400 uppercase">
              👤 {selectedAthleteForPhoto?.nameMarathi || selectedAthleteForPhoto?.name} (Std {selectedAthleteForPhoto?.std})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="w-full h-56 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              {selectedAthleteForPhoto?.photoUrl ? (
                <img 
                  src={selectedAthleteForPhoto.photoUrl} 
                  alt="Athlete" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <User className="w-16 h-16 text-slate-600" />
              )}
            </div>
            <div className="bg-slate-900 p-3 rounded-xl text-xs space-y-1 text-slate-300">
              <p><strong>वय:</strong> {selectedAthleteForPhoto?.age} वर्षे</p>
              <p><strong>खेळ:</strong> {Array.isArray(selectedAthleteForPhoto?.sports) ? selectedAthleteForPhoto.sports.join(', ') : selectedAthleteForPhoto?.sports || 'General'}</p>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button 
              onClick={() => setSelectedAthleteForPhoto(null)} 
              className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase h-10 rounded-xl"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
