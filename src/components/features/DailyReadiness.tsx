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
  Award,
  Stethoscope,
  Bandage,
  CheckCircle,
  XCircle,
  HelpCircle,
  Share2
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
    painLevel?: number;
    swelling?: string;
    rangeOfMotion?: string;
    functionalTest?: string;
    confidence?: string;
  }) => {
    const { sleepHours, soreness, fatigue, injuryStatus, phvOffset, painLevel = 0, swelling = 'none', rangeOfMotion = 'full', functionalTest = 'passed', confidence = 'confident' } = input;

    if (injuryStatus === "Sidelined" || painLevel >= 6 || functionalTest === 'failed' || swelling === 'severe') {
      return {
        statusColor: "RED",
        score: Math.max(10, 40 - (painLevel * 3)),
        action: "विश्रांती आवश्यक (Complete Rest / Sidelined)",
        advice: "खेळाडूला हालचाली दरम्यान वेदना/सूज आहे. आज मैदानावरील सरावातून पूर्ण विश्रांती द्या आणि डॉक्टरांचा सल्ला घ्या.",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-300",
        badgeBg: "bg-rose-600 text-white",
        dot: "bg-rose-600",
        isReadyForPlay: false
      };
    }

    const isGrowthSpurt = !isNaN(phvOffset) && phvOffset >= -0.5 && phvOffset <= 0.5;
    const strainScore = soreness + fatigue;

    if (strainScore >= 7 || sleepHours < 6 || injuryStatus === "Restricted" || (painLevel >= 2 && painLevel <= 5) || rangeOfMotion === 'partial' || functionalTest === 'mild_discomfort' || confidence === 'hesitant') {
      return {
        statusColor: "YELLOW",
        score: 65,
        action: "मर्यादित रिहॅब सराव (Light / Rehab Only)",
        advice: isGrowthSpurt 
            ? "खेळाडू रिकव्हरी टप्प्यात असून वाढीचा काळ सुरू आहे. केवळ हलका स्ट्रेचिंग व तांत्रिक सराव द्या."
            : "वेदना हलकी आहे. जड वजन/सामना टाळून फक्त नॉन-कॉन्टॅक्ट रिहॅब व मोबिलिटी सराव घ्या.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-300",
        badgeBg: "bg-amber-500 text-slate-950",
        dot: "bg-amber-500",
        isReadyForPlay: false
      };
    }

    return {
      statusColor: "GREEN",
      score: 95,
      action: "खेळण्यास १००% सज्ज (100% Fit & Cleared)",
      advice: "खेळाडूची चाचणी उत्तीर्ण झाली आहे. शून्य वेदना आणि पूर्ण मोबिलिटी असल्याने सामन्यात उतरण्यास १००% मंजुरी.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      badgeBg: "bg-emerald-600 text-white",
      dot: "bg-emerald-600",
      isReadyForPlay: true
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
  const [filterMode, setFilterMode] = useState<'injured' | 'all'>('injured');
  
  // Standard Metrics
  const [sleepHours, setSleepHours] = useState(8);
  const [sorenessScore, setSorenessScore] = useState(1);
  const [fatigueScore, setFatigueScore] = useState(1);
  const [injuryStatus, setInjuryStatus] = useState("Fit to Train");

  // Clinical Return-To-Play Questions
  const [painLevel, setPainLevel] = useState<number>(0);
  const [swellingStatus, setSwellingStatus] = useState<'none' | 'mild' | 'severe'>('none');
  const [rangeOfMotion, setRangeOfMotion] = useState<'full' | 'partial' | 'restricted'>('full');
  const [functionalTest, setFunctionalTest] = useState<'passed' | 'mild_discomfort' | 'failed'>('passed');
  const [psychologicalConfidence, setPsychologicalConfidence] = useState<'confident' | 'hesitant' | 'fearful'>('confident');

  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedAthleteForPhoto, setSelectedAthleteForPhoto] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allPlayers = useMemo(() => {
    if (!store?.data?.players) return [];
    return [...store.data.players]
      .filter((p: any) => p && p.category === 'athlete' && (!preselectedSport || !p.sports?.length || p.sports.includes(preselectedSport)))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [store?.data?.players, preselectedSport]);

  // Active Health Incidents & Injured Player Detection
  const healthIncidents = useMemo(() => store?.data?.healthIncidents || store?.data?.health || [], [store?.data?.healthIncidents, store?.data?.health]);

  const activeInjuryMap = useMemo(() => {
    const map: Record<string, any> = {};
    healthIncidents.forEach((inc: any) => {
      if (inc && inc.playerId && !inc.resolved) {
        map[inc.playerId] = inc;
      }
    });
    return map;
  }, [healthIncidents]);

  // Injured Players Pool
  const injuredPlayers = useMemo(() => {
    return allPlayers.filter((p: any) => {
      const hasActiveIncident = !!activeInjuryMap[p.id];
      const readinessData = store.data.dailyReadiness?.[p.id];
      const hasInjuryReadiness = readinessData && (readinessData.injuryStatus === 'Restricted' || readinessData.injuryStatus === 'Sidelined');
      const isMarkedInjured = p.injuryStatus === 'injured' || p.isInjured;
      return hasActiveIncident || hasInjuryReadiness || isMarkedInjured;
    });
  }, [allPlayers, activeInjuryMap, store.data.dailyReadiness]);

  // Set default view: switch to all if no injured athletes exist
  useEffect(() => {
    if (injuredPlayers.length === 0 && filterMode === 'injured') {
      setFilterMode('all');
    }
  }, [injuredPlayers.length, filterMode]);

  // Active displayed players based on filterMode
  const displayedPlayers = useMemo(() => {
    const source = filterMode === 'injured' ? (injuredPlayers.length > 0 ? injuredPlayers : allPlayers) : allPlayers;
    if (!searchQuery) return source;
    const q = searchQuery.toLowerCase();
    return source.filter((p: any) => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.nameMarathi || '').toLowerCase().includes(q) || 
      (p.std || '').toString().includes(q)
    );
  }, [filterMode, injuredPlayers, allPlayers, searchQuery]);

  // Set default selected player
  useEffect(() => {
    if (!selectedPlayerId && displayedPlayers.length > 0) {
      setSelectedPlayerId(displayedPlayers[0].id);
    } else if (displayedPlayers.length > 0 && !displayedPlayers.some((p: any) => p.id === selectedPlayerId)) {
      setSelectedPlayerId(displayedPlayers[0].id);
    }
  }, [displayedPlayers, selectedPlayerId]);

  // Sync state when selecting a different player
  useEffect(() => {
    if (selectedPlayerId && store.data.dailyReadiness?.[selectedPlayerId]) {
      const d = store.data.dailyReadiness[selectedPlayerId];
      setSleepHours(d.sleepHours || 8);
      setSorenessScore(d.sorenessScore || 1);
      setFatigueScore(d.fatigueScore || 1);
      setInjuryStatus(d.injuryStatus || "Fit to Train");
      setPainLevel(d.painLevel || (d.injuryStatus === 'Sidelined' ? 7 : d.injuryStatus === 'Restricted' ? 3 : 0));
      setSwellingStatus(d.swellingStatus || (d.injuryStatus === 'Sidelined' ? 'severe' : 'none'));
      setRangeOfMotion(d.rangeOfMotion || (d.injuryStatus === 'Sidelined' ? 'restricted' : 'full'));
      setFunctionalTest(d.functionalTest || (d.injuryStatus === 'Sidelined' ? 'failed' : 'passed'));
      setPsychologicalConfidence(d.psychologicalConfidence || (d.injuryStatus === 'Sidelined' ? 'fearful' : 'confident'));
    } else {
      const activeInc = activeInjuryMap[selectedPlayerId];
      setSleepHours(8);
      setSorenessScore(activeInc ? 4 : 1);
      setFatigueScore(activeInc ? 4 : 1);
      setInjuryStatus(activeInc ? "Sidelined" : "Fit to Train");
      setPainLevel(activeInc ? 6 : 0);
      setSwellingStatus(activeInc ? 'mild' : 'none');
      setRangeOfMotion(activeInc ? 'partial' : 'full');
      setFunctionalTest(activeInc ? 'mild_discomfort' : 'passed');
      setPsychologicalConfidence(activeInc ? 'hesitant' : 'confident');
    }
  }, [selectedPlayerId, store.data.dailyReadiness, activeInjuryMap]);

  const activeAlert = useMemo(() => {
    if (!selectedPlayerId || !allPlayers) return null;
    const p = allPlayers.find((p: any) => p.id === selectedPlayerId);
    if (!p) return null;
    return CoachAlertSystem.evaluateAthleteReadiness({
      sleepHours,
      soreness: sorenessScore,
      fatigue: fatigueScore,
      injuryStatus,
      phvOffset: calculatePhvOffset(p),
      painLevel,
      swelling: swellingStatus,
      rangeOfMotion,
      functionalTest,
      confidence: psychologicalConfidence
    });
  }, [selectedPlayerId, allPlayers, sleepHours, sorenessScore, fatigueScore, injuryStatus, painLevel, swellingStatus, rangeOfMotion, functionalTest, psychologicalConfidence]);

  const handleSave = useCallback(async () => {
    if (!selectedPlayerId || !isMounted || !store) return;
    setIsSaving(true);
    try {
      const p = allPlayers.find((pl: any) => pl.id === selectedPlayerId);
      const displayName = p?.nameMarathi || p?.name || 'खेळाडू';

      await store.setReadiness(selectedPlayerId, {
        sleepHours, 
        sorenessScore, 
        fatigueScore, 
        injuryStatus,
        painLevel,
        swellingStatus,
        rangeOfMotion,
        functionalTest,
        psychologicalConfidence,
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
  }, [selectedPlayerId, isMounted, store, sleepHours, sorenessScore, fatigueScore, injuryStatus, painLevel, swellingStatus, rangeOfMotion, functionalTest, psychologicalConfidence, activeAlert, allPlayers, toast]);

  // Clear Injury & Return to Play directly
  const handleClearInjuryAndReturnToPlay = async () => {
    if (!selectedPlayerId || !store) return;
    setIsSaving(true);
    try {
      const p = allPlayers.find((pl: any) => pl.id === selectedPlayerId);
      const displayName = p?.nameMarathi || p?.name || 'खेळाडू';

      // 1. Resolve active health incidents
      if (store.data.healthIncidents && store.updateHealthIncident) {
        const incidents = store.data.healthIncidents.filter((h: any) => h.playerId === selectedPlayerId && !h.resolved);
        for (const inc of incidents) {
          await store.updateHealthIncident({
            ...inc,
            resolved: true,
            resolvedAt: new Date().toISOString(),
            clearanceNotes: "क्रीडा शिक्षकांनी सज्जता चाचणी घेऊन सामन्यासाठी १००% फिट घोषित केले."
          });
        }
      }

      // 2. Set readiness to 100% Fit
      setInjuryStatus("Fit to Train");
      setPainLevel(0);
      setSwellingStatus('none');
      setRangeOfMotion('full');
      setFunctionalTest('passed');
      setPsychologicalConfidence('confident');
      setSorenessScore(1);
      setFatigueScore(1);

      await store.setReadiness(selectedPlayerId, {
        sleepHours: 8,
        sorenessScore: 1,
        fatigueScore: 1,
        injuryStatus: "Fit to Train",
        painLevel: 0,
        swellingStatus: 'none',
        rangeOfMotion: 'full',
        functionalTest: 'passed',
        psychologicalConfidence: 'confident',
        readinessScore: 100,
        readinessStatus: "GREEN",
        recordedAt: new Date().toISOString()
      });

      toast({
        title: "🎉 खेळाडू पूर्ण बरा - खेळण्यास मंजुरी!",
        description: `${displayName} ची दुखापत यशस्वीरित्या क्लिअर झाली आणि संघात १००% फिट नोंदवले गेले.`,
        className: "bg-emerald-600 text-white font-bold"
      });
    } catch (e) {
      toast({ title: "त्रुटी", description: "नोंद अद्ययावत करताना अडचण आली.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Fast 1-Tap Batch: Mark All Athletes 100% Fit & Ready
  const handleMarkAllReady = async () => {
    if (!allPlayers || allPlayers.length === 0) return;
    setIsSaving(true);
    try {
      for (const p of allPlayers) {
        await store.setReadiness(p.id, {
          sleepHours: 8,
          sorenessScore: 1,
          fatigueScore: 1,
          injuryStatus: "Fit to Train",
          painLevel: 0,
          swellingStatus: 'none',
          rangeOfMotion: 'full',
          functionalTest: 'passed',
          psychologicalConfidence: 'confident',
          readinessScore: 100,
          readinessStatus: "GREEN",
          recordedAt: new Date().toISOString()
        });
      }
      toast({
        title: "⚡ सर्व खेळाडू पूर्ण फिट नोंदवले!",
        description: `एकूण ${allPlayers.length} खेळाडूंची सकाळच्या सरावासाठी १००% सज्जता नोंदवली गेली.`,
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
      phvOffset: calculatePhvOffset(player),
      painLevel: d.painLevel || 0,
      swelling: d.swellingStatus || 'none',
      rangeOfMotion: d.rangeOfMotion || 'full',
      functionalTest: d.functionalTest || 'passed',
      confidence: d.psychologicalConfidence || 'confident'
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
      reportType: "दैनिक सराव सज्जता व दुखापत तपासणी अहवाल (Daily Readiness & Return-to-Play)",
      reportData: `स्थिती: ${evalData.action}\nसज्जता स्कोअर: ${evalData.score}/१००\nवेदना स्तर: ${d.painLevel || 0}/१०\nहालचाल (ROM): ${d.rangeOfMotion === 'full' ? '१००% मोकळी' : d.rangeOfMotion === 'partial' ? 'काहीशी आखडलेली' : 'मर्यादित'}\nमार्गदर्शन: ${evalData.advice}`
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
          <div class="report-type">दैनिक खेळाडू सराव सज्जता व दुखापत नोंदवही (Daily Readiness & Return-to-Play Audit)</div>
          <div class="meta">खेळ: ${preselectedSport || 'सर्व संघ'} &bull; खेळाडू संख्या: ${displayedPlayers.length} &bull; दिनांक: ${format(new Date(), 'dd MMMM yyyy')}</div>

          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 5%;">अ.क्र.</th>
                <th style="width: 25%;">खेळाडूचे नाव</th>
                <th style="width: 10%;">इयत्ता</th>
                <th style="width: 10%;">झोप (तास)</th>
                <th style="width: 12%;">वेदना स्तर (0-10)</th>
                <th style="width: 18%;">सज्जता स्थिती (Readiness)</th>
                <th style="width: 20%;">कोच शेरा / कृती</th>
              </tr>
            </thead>
            <tbody>
              ${displayedPlayers.map((p: any, idx: number) => {
                const d = store.data.dailyReadiness?.[p.id] || {};
                const evalData = CoachAlertSystem.evaluateAthleteReadiness({
                  sleepHours: d.sleepHours || 8,
                  soreness: d.sorenessScore || 1,
                  fatigue: d.fatigueScore || 1,
                  injuryStatus: d.injuryStatus || "Fit to Train",
                  phvOffset: calculatePhvOffset(p),
                  painLevel: d.painLevel || 0,
                  swelling: d.swellingStatus || 'none',
                  rangeOfMotion: d.rangeOfMotion || 'full',
                  functionalTest: d.functionalTest || 'passed',
                  confidence: d.psychologicalConfidence || 'confident'
                });
                const badgeClass = evalData.statusColor === 'GREEN' ? 'green-badge' : evalData.statusColor === 'YELLOW' ? 'yellow-badge' : 'red-badge';
                const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                    <td>
                      <strong>${displayName}</strong><br/>
                      <span style="font-size: 8.5px; color: #64748b;">GR: ${p.generalRegisterNumber || '-'} &bull; Roll: #${p.serialNumber || '0'}</span>
                    </td>
                    <td>इयत्ता ${p.std} वी</td>
                    <td>${d.sleepHours || 8} तास</td>
                    <td>${d.painLevel || 0}/१०</td>
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

  const currentSelectedAthlete = allPlayers.find((p: any) => p.id === selectedPlayerId);
  const activeIncidentForCurrent = activeInjuryMap[selectedPlayerId];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner shrink-0">
            <HeartPulse className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                दैनिक खेळाडू सज्जता व दुखापत तपासणी (Daily Readiness & Return-to-Play)
              </h2>
              <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                Clinical Readiness
              </Badge>
            </div>
            <p className="text-xs font-bold text-white/70 mt-1.5 flex items-center gap-2">
              <Bandage className="w-3.5 h-3.5 text-rose-400" /> दुखापतग्रस्त खेळाडूंची मैदानावर परतण्याची (Return-to-Play) ५-टप्प्यांची क्लिनिकल चाचणी
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleMarkAllReady}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-11 px-4 rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> सर्व खेळाडू १००% फिट
          </Button>
          <Button 
            onClick={handlePrintAudit}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs h-11 px-4 rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> ऑडिट प्रिंट (A4)
          </Button>
        </div>
      </div>

      {/* Filter Mode Selector: Injured Only vs All Squad */}
      <Card className="p-4 rounded-2xl border-2 border-primary/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-primary">खेळाडू यादी फिल्टर:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('injured')}
              className={cn(
                "py-1.5 px-3 rounded-lg font-black text-xs flex items-center gap-1.5 transition-all",
                filterMode === 'injured' ? "bg-rose-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Bandage className="w-3.5 h-3.5" /> दुखापतग्रस्त खेळाडू ({injuredPlayers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={cn(
                "py-1.5 px-3 rounded-lg font-black text-xs flex items-center gap-1.5 transition-all",
                filterMode === 'all' ? "bg-primary text-white shadow" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Users className="w-3.5 h-3.5" /> संपूर्ण संघ ({allPlayers.length})
            </button>
          </div>
        </div>

        {filterMode === 'injured' && injuredPlayers.length === 0 && (
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            सध्या कोणताही खेळाडू दुखापतग्रस्त नाही! सर्व खेळाडू पूर्ण तंदुरुस्त आहेत.
          </div>
        )}
      </Card>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Clinical Return-to-Play Questionnaire & Touch Grading */}
        <Card className="lg:col-span-6 border-2 rounded-[2.5rem] p-6 md:p-8 shadow-xl bg-white space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Athlete Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500" /> १. चाचणीसाठी खेळाडू निवडा (Select Athlete):
              </label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-black bg-slate-50 text-sm">
                  <SelectValue placeholder="खेळाडू निवडा..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {displayedPlayers.map((p: any) => {
                    const isInj = !!activeInjuryMap[p.id];
                    return (
                      <SelectItem key={p.id} value={p.id} className="font-bold text-xs">
                        {isInj ? '🩹 ' : ''}{p.nameMarathi || p.name} (इ. {p.std} वी &bull; GR: {p.generalRegisterNumber || '-'})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Active Injury Banner if registered */}
            {activeIncidentForCurrent && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900 uppercase flex items-center gap-1.5">
                    <Bandage className="w-4 h-4 text-rose-600" /> नोंदवलेली दुखापत माहिती (Logged Injury)
                  </span>
                  <Badge className="bg-rose-600 text-white font-black text-[9px]">
                    {activeIncidentForCurrent.severity || 'Active'}
                  </Badge>
                </div>
                <div className="text-xs text-rose-800 font-bold space-y-0.5">
                  <div><strong>प्रकार:</strong> {activeIncidentForCurrent.injuryType || 'दुखापत'} &bull; <strong>भाग:</strong> {activeIncidentForCurrent.bodyPart || 'अवयव'}</div>
                  <div><strong>तपशील:</strong> {activeIncidentForCurrent.description || 'उपचार सुरू आहेत.'}</div>
                </div>
              </div>
            )}

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
                      <Stethoscope className="w-5 h-5" />
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

            {/* CLINICAL RETURN-TO-PLAY QUESTIONS */}
            <div className="space-y-5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-500" /> क्लिनिकल सराव/सामना सज्जता प्रश्नावली (Return-to-Play Test)
              </div>

              {/* Q1: Pain Level (0-10 VAS Scale) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    १. हालचाली दरम्यान वेदना स्तर (Pain Level 0-10 Scale):
                  </span>
                  <Badge className={cn(
                    "font-black text-xs",
                    painLevel >= 6 ? "bg-rose-100 text-rose-800" : painLevel >= 2 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {painLevel === 0 ? 'शून्य वेदना (Zero Pain)' : painLevel <= 3 ? 'हलकी कळ (Mild)' : painLevel <= 6 ? 'मध्यम वेदना' : 'तीव्र वेदना (Severe)'} ({painLevel}/10)
                  </Badge>
                </div>
                <div className="grid grid-cols-11 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPainLevel(n)}
                      className={cn(
                        "h-9 rounded-lg font-black text-xs border transition-all flex items-center justify-center",
                        painLevel === n 
                          ? (n === 0 ? "bg-emerald-600 text-white" : n <= 3 ? "bg-emerald-500 text-white" : n <= 6 ? "bg-amber-500 text-white" : "bg-rose-600 text-white")
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Swelling Status */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase block">
                  २. सूज व ताण स्थिती (Swelling / Inflammation):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'नाही / पूर्ण बरी (None)', color: 'bg-emerald-600' },
                    { id: 'mild', label: 'हलकी सूज (Mild)', color: 'bg-amber-500' },
                    { id: 'severe', label: 'जास्त सूज (Severe)', color: 'bg-rose-600' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSwellingStatus(st.id as any)}
                      className={cn(
                        "h-10 rounded-xl font-black text-[10px] uppercase border transition-all flex items-center justify-center text-center px-1",
                        swellingStatus === st.id 
                          ? `${st.color} text-white shadow-md scale-105 border-transparent` 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Joint Range of Motion (ROM) */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase block">
                  ३. सांध्याची हालचाल / मोबिलिटी (Range of Motion):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'full', label: '१००% पूर्ण हालचाल (Full)', color: 'bg-emerald-600' },
                    { id: 'partial', label: 'काहीशी आखडलेली (Partial)', color: 'bg-amber-500' },
                    { id: 'restricted', label: 'हालचालीस त्रास (Restricted)', color: 'bg-rose-600' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setRangeOfMotion(st.id as any)}
                      className={cn(
                        "h-10 rounded-xl font-black text-[10px] uppercase border transition-all flex items-center justify-center text-center px-1",
                        rangeOfMotion === st.id 
                          ? `${st.color} text-white shadow-md scale-105 border-transparent` 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4: Functional Agility & Jump Test */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase block">
                  ४. उडी व गती चाचणी (Functional Agility & Jump Test):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'passed', label: 'सहज शक्य (Cleared)', color: 'bg-emerald-600' },
                    { id: 'mild_discomfort', label: 'हलकी कळ (Mild)', color: 'bg-amber-500' },
                    { id: 'failed', label: 'अशक्य / त्रास (Failed)', color: 'bg-rose-600' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFunctionalTest(st.id as any)}
                      className={cn(
                        "h-10 rounded-xl font-black text-[10px] uppercase border transition-all flex items-center justify-center text-center px-1",
                        functionalTest === st.id 
                          ? `${st.color} text-white shadow-md scale-105 border-transparent` 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Psychological Confidence */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase block">
                  ५. खेळाडूचा आत्मविश्वास (Psychological Readiness):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'confident', label: '१००% तयार (Ready)', color: 'bg-emerald-600' },
                    { id: 'hesitant', label: 'साशंक / भीती (Hesitant)', color: 'bg-amber-500' },
                    { id: 'fearful', label: 'खेळण्यास तयार नाही', color: 'bg-rose-600' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setPsychologicalConfidence(st.id as any)}
                      className={cn(
                        "h-10 rounded-xl font-black text-[10px] uppercase border transition-all flex items-center justify-center text-center px-1",
                        psychologicalConfidence === st.id 
                          ? `${st.color} text-white shadow-md scale-105 border-transparent` 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep & Fatigue Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700">झोप (तास):</span>
                  <Select value={sleepHours.toString()} onValueChange={(val) => setSleepHours(Number(val))}>
                    <SelectTrigger className="h-9 font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8, 9, 10].map(h => <SelectItem key={h} value={h.toString()}>{h} तास</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700">दुखापत स्थिती वर्गवारी:</span>
                  <Select value={injuryStatus} onValueChange={setInjuryStatus}>
                    <SelectTrigger className="h-9 font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fit to Train">तंदुरुस्त (Fit)</SelectItem>
                      <SelectItem value="Restricted">मर्यादित सराव (Restricted)</SelectItem>
                      <SelectItem value="Sidelined">विश्रांती (Sidelined)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4">
            {activeIncidentForCurrent && (
              <Button 
                onClick={handleClearInjuryAndReturnToPlay}
                disabled={isSaving}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> दुखापत बरी झाली - सामना/सराव १००% मंजुरी द्या
              </Button>
            )}

            <Button 
              onClick={handleSave} 
              disabled={!selectedPlayerId || isSaving} 
              className="w-full h-13 bg-primary text-white rounded-xl font-black uppercase tracking-wider shadow-xl active-scale"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
              आजची सज्जता व चाचणी नोंद सेव्ह करा
            </Button>
          </div>
        </Card>

        {/* Right Column: Squad Readiness Dashboard Roster */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {filterMode === 'injured' ? `दुखापतग्रस्त खेळाडू (${displayedPlayers.length})` : `सर्व खेळाडू (${displayedPlayers.length})`}
              </h3>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाव किंवा GR..."
                className="pl-9 h-10 rounded-xl text-xs font-bold border-2 bg-white"
              />
            </div>
          </div>

          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[600px]">
            <div className="bg-slate-50 p-4 border-b flex items-center justify-between text-xs font-black uppercase text-slate-700">
              <span>खेळाडू माहिती</span>
              <span>चाचणी स्थिती व कृती</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[650px] p-4 space-y-3">
              {displayedPlayers.length === 0 ? (
                <div className="py-24 text-center opacity-40">
                  <Users className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-black uppercase">कोणतेही खेळाडू आढळले नाहीत.</p>
                </div>
              ) : (
                displayedPlayers.map((player: any) => {
                  const d = store.data.dailyReadiness?.[player.id] || {};
                  const isInj = !!activeInjuryMap[player.id];
                  const evalData = CoachAlertSystem.evaluateAthleteReadiness({
                    sleepHours: d.sleepHours || 8,
                    soreness: d.sorenessScore || 1,
                    fatigue: d.fatigueScore || 1,
                    injuryStatus: d.injuryStatus || "Fit to Train",
                    phvOffset: calculatePhvOffset(player),
                    painLevel: d.painLevel || 0,
                    swelling: d.swellingStatus || 'none',
                    rangeOfMotion: d.rangeOfMotion || 'full',
                    functionalTest: d.functionalTest || 'passed',
                    confidence: d.psychologicalConfidence || 'confident'
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
                      <div className="flex items-center gap-3 min-w-0">
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
                          <p className="font-black text-sm text-slate-900 uppercase leading-none truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {isInj && <Bandage className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                            {displayName}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 block">
                            इ. {player.std} वी &bull; GR: {player.generalRegisterNumber || '-'} {d.painLevel ? `&bull; वेदना: ${d.painLevel}/10` : ''}
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
              👤 {selectedAthleteForPhoto?.nameMarathi || selectedAthleteForPhoto?.name} (इ. {selectedAthleteForPhoto?.std} वी)
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

