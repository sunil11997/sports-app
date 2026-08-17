"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  History as HistoryIcon, 
  Printer, 
  ChartLine, 
  Search, 
  MessageSquare,
  ChevronRight,
  BarChart,
  Users,
  Trophy,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Ruler,
  Scale,
  Award,
  Sparkles,
  Flame,
  ShieldCheck,
  ShieldAlert,
  ZoomIn,
  TrendingUp,
  User,
  HeartPulse,
  Filter
} from 'lucide-react';
import { format, subDays, startOfDay, parseISO, isAfter } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn, shareToWhatsApp, transliterateEnglishToMarathi, calculateBMI, getBmiCategory, parseNumericValue } from '@/lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  LineChart,
  Legend
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Player, FitnessAssessment } from '@/lib/types';

export function PerformanceDossier({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStd, setFilterStd] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  const isGeneral = section === 'general';
  const isMarathi = language === 'Marathi';

  // Filter students
  const availablePlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: Player) => {
        if (filterCategory === 'athlete' && p.category !== 'athlete') return false;
        if (filterCategory === 'student' && p.category === 'athlete') return false;
        if (filterStd !== 'ALL' && (p.std || '').toString() !== filterStd) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const pName = (p.name || '').toLowerCase();
          const pMar = (p.nameMarathi || '').toLowerCase();
          const gr = (p.generalRegisterNumber || '').toLowerCase();
          const roll = (p.serialNumber || '').toLowerCase();
          return pName.includes(q) || pMar.includes(q) || gr.includes(q) || roll.includes(q);
        }
        return true;
      })
      .sort((a: Player, b: Player) => {
        const stdA = parseInt(a.std || '0') || 0;
        const stdB = parseInt(b.std || '0') || 0;
        if (stdA !== stdB) return stdA - stdB;
        return (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0);
      });
  }, [store.data.players, filterCategory, filterStd, searchTerm]);

  const currentPlayer = useMemo(() => 
    (store.data.players || []).find((p: Player) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  // 1. Comprehensive Attendance Calculations
  const attendanceData = useMemo(() => {
    if (!selectedPlayerId) return { 
      rate30: 0, 
      streak: 0, 
      totalPresent: 0, 
      totalAbsent: 0, 
      totalSessions: 0, 
      overallRate: 0,
      recentLogs: [] as Array<{ date: string; morning: string; evening: string; isPresent: boolean }>
    };

    const attRecord = store.data.attendance || {};
    let presentCount30 = 0;
    let streak = 0;
    let streakBroken = false;
    const today = startOfDay(new Date());

    // 30-day streak & rate
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      const mStatus = attRecord[`${selectedPlayerId}_${d}_Morning`];
      const eStatus = attRecord[`${selectedPlayerId}_${d}_Evening`];
      const isPresent = mStatus === 'P' || eStatus === 'P';

      if (isPresent) {
        presentCount30++;
        if (!streakBroken) streak++;
      } else {
        streakBroken = true;
      }
    }

    // All-time / logged session aggregation
    let totalPresent = 0;
    let totalAbsent = 0;
    const dateMap = new Map<string, { morning: string; evening: string }>();

    Object.entries(attRecord).forEach(([key, status]) => {
      if (key.startsWith(`${selectedPlayerId}_`)) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const dateStr = parts[1];
          const session = parts[2];
          const cur = dateMap.get(dateStr) || { morning: '-', evening: '-' };
          if (session === 'Morning') cur.morning = (status as string) || '-';
          if (session === 'Evening') cur.evening = (status as string) || '-';
          dateMap.set(dateStr, cur);

          if (status === 'P') totalPresent++;
          if (status === 'A') totalAbsent++;
        }
      }
    });

    const totalSessions = totalPresent + totalAbsent;
    const overallRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : Math.round((presentCount30 / 30) * 100);

    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    const recentLogs = sortedDates.slice(0, 20).map(([date, sess]) => ({
      date,
      morning: sess.morning,
      evening: sess.evening,
      isPresent: sess.morning === 'P' || sess.evening === 'P'
    }));

    return {
      rate30: Math.round((presentCount30 / 30) * 100),
      streak,
      totalPresent,
      totalAbsent,
      totalSessions,
      overallRate,
      recentLogs
    };
  }, [selectedPlayerId, store.data.attendance]);

  // 2. Skills & Drills Completed History
  const completedSkills = useMemo(() => {
    if (!selectedPlayerId) return [];

    const rawList = (store.data.drillCompletionsRaw || []).filter((d: any) => d.playerId === selectedPlayerId);
    const completionsMap = store.data.drillCompletions || {};
    
    // Also extract from drillCompletions keys
    const setOfSkills = new Map<string, any>();
    
    rawList.forEach((r: any) => {
      const key = `${r.sport || 'Sports'}_${r.drill || 'Drill'}`;
      setOfSkills.set(key, {
        sport: r.sport || 'General Sports',
        drill: r.drill || 'Completed Drill',
        date: r.date || format(new Date(), 'yyyy-MM-dd'),
        time: r.timestamp || 'Logged'
      });
    });

    Object.keys(completionsMap).forEach(key => {
      if (key.startsWith(`${selectedPlayerId}_`)) {
        const withoutId = key.replace(`${selectedPlayerId}_`, '');
        const parts = withoutId.split('_');
        const sport = parts.length > 1 ? parts[0] : 'General';
        const drill = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
        if (!setOfSkills.has(withoutId)) {
          setOfSkills.set(withoutId, {
            sport,
            drill,
            date: 'Logged',
            time: 'Mastered'
          });
        }
      }
    });

    return Array.from(setOfSkills.values());
  }, [selectedPlayerId, store.data.drillCompletionsRaw, store.data.drillCompletions]);

  // Group completed skills by sport
  const skillsBySport = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    completedSkills.forEach(s => {
      const sp = s.sport || 'General';
      if (!grouped[sp]) grouped[sp] = [];
      grouped[sp].push(s);
    });
    return grouped;
  }, [completedSkills]);

  // 3. Height & Weight History / Physical Growth Evolution
  const heightWeightHistory = useMemo(() => {
    if (!currentPlayer) return [];

    const list: Array<{
      date: string;
      label: string;
      height: number;
      weight: number;
      bmi: string;
      bmiCategory: { en: string; mr: string; color: string };
      source: string;
    }> = [];

    // Base Registration record
    const baseH = parseNumericValue(currentPlayer.height);
    const baseW = parseNumericValue(currentPlayer.weight);
    if (baseH > 0 || baseW > 0) {
      const baseBmi = calculateBMI(baseH, baseW, currentPlayer.bmi);
      list.push({
        date: currentPlayer.admissionDate || currentPlayer.academicYear || 'Baseline',
        label: 'प्रारंभिक नोंदणी (Initial Registration)',
        height: baseH,
        weight: baseW,
        bmi: baseBmi,
        bmiCategory: getBmiCategory(baseBmi),
        source: 'Registration'
      });
    }

    // Monthly fitness assessments
    const fitList = (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .filter((f: FitnessAssessment) => f.height || f.weight || f.score)
      .sort((a: any, b: any) => (a.month || a.date || "").localeCompare(b.month || b.date || ""));

    fitList.forEach((f: FitnessAssessment) => {
      const h = parseNumericValue(f.height) || baseH;
      const w = parseNumericValue(f.weight) || baseW;
      const dateStr = f.month || f.date || 'Assessment';
      const bmi = calculateBMI(h, w, (f as any).bmi);

      list.push({
        date: dateStr,
        label: f.term ? `${f.term} Term Assessment` : (f.month ? format(new Date(f.month + "-01"), 'MMMM yyyy') : dateStr),
        height: h,
        weight: w,
        bmi,
        bmiCategory: getBmiCategory(bmi),
        source: 'Physical Fitness Test'
      });
    });

    return list;
  }, [currentPlayer, selectedPlayerId, store.data.fitnessHistory]);

  // Chart data for Height & Weight progression
  const growthChartData = useMemo(() => {
    return heightWeightHistory.map(h => ({
      date: h.date,
      height: h.height > 0 ? h.height : undefined,
      weight: h.weight > 0 ? h.weight : undefined,
      bmi: parseFloat(h.bmi) || undefined
    }));
  }, [heightWeightHistory]);

  // 4. PHV (Peak Height Velocity) Growth Spurt
  const phvData = useMemo(() => {
    if (!currentPlayer?.height || !currentPlayer?.weight || !currentPlayer?.age) return null;
    const h = parseFloat(currentPlayer.height);
    const w = parseFloat(currentPlayer.weight);
    const age = currentPlayer.age;
    const sH = parseFloat(currentPlayer.sittingHeight || (h * 0.52).toFixed(1));
    const legL = h - sH;

    let offset = 0;
    if (currentPlayer.gender === 'Male') {
      offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
    } else {
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }

    const offsetNum = parseFloat(offset.toFixed(2));
    let statusLabel = offsetNum < -1 ? 'Pre-growth (वाढ सुरू व्हायची आहे)' : (offsetNum > 1 ? 'Post-growth (वाढ पूर्णत्वाकडे)' : 'Peak Growth Phase (वाढीचा सर्वोच्च टप्पा)');
    return { offset: offset.toFixed(2), offsetNum, status: statusLabel };
  }, [currentPlayer]);

  // 5. Medical History
  const medicalHistory = useMemo(() => 
    (store.data.healthIncidents || []).filter((h: any) => h.playerId === selectedPlayerId),
    [selectedPlayerId, store.data.healthIncidents]
  );

  // 6. Fitness Performance History
  const fitnessHistoryList = useMemo(() => 
    (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .sort((a: any, b: any) => (a.month || a.date || "").localeCompare(b.month || b.date || "")),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const fitnessChartData = useMemo(() => 
    fitnessHistoryList.map((f: any) => ({
      date: f.month ? format(new Date(f.month + "-01"), 'MMM yy') : (f.date || "---"),
      score: parseFloat(f.score) || 0,
      speed: parseFloat(f.speedScore) || 0,
      strength: parseFloat(f.strengthScore) || 0,
      agility: parseFloat(f.agilityScore) || 0
    })),
  [fitnessHistoryList]);

  // Current display metrics
  const currentH = parseNumericValue(currentPlayer?.height);
  const currentW = parseNumericValue(currentPlayer?.weight);
  const currentBmi = calculateBMI(currentH, currentW, currentPlayer?.bmi);
  const bmiCat = getBmiCategory(currentBmi);

  const displayName = isMarathi 
    ? (currentPlayer?.nameMarathi || transliterateEnglishToMarathi(currentPlayer?.name) || currentPlayer?.name || '')
    : (currentPlayer?.name || '');

  const handleWhatsAppShare = () => {
    if (!currentPlayer) return;
    const profile = store.data.schoolProfile || {};
    const lastFit = fitnessHistoryList[fitnessHistoryList.length - 1] || {};
    shareToWhatsApp({
      phone: currentPlayer.mobileNumber,
      schoolName: profile.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा',
      teacherName: profile.teacherName || 'क्रीडा शिक्षक',
      studentName: displayName,
      std: currentPlayer.std,
      age: currentPlayer.age,
      dob: currentPlayer.dob,
      bmi: currentBmi,
      height: currentPlayer.height || "---",
      weight: currentPlayer.weight || "---",
      reportType: "सर्वसमावेशक विद्यार्थी इतिहास व प्रगती अहवाल",
      reportData: `उपस्थिती: ${attendanceData.overallRate}% (${attendanceData.totalPresent} दिवस उपस्थित)\nपूर्ण केलेले सराव/कौशल्ये: ${completedSkills.length}\nशारीरिक फिटनेस: ${lastFit.score || '---'}%\nउंची: ${currentPlayer.height || '---'} cm | वजन: ${currentPlayer.weight || '---'} kg (BMI: ${currentBmi} - ${bmiCat.mr})`
    });
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* TOP HEADER & SEARCH / FILTER PANEL */}
      <Card className="border-2 rounded-[2.5rem] bg-white p-6 shadow-xl border-slate-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tight">
                {isMarathi ? 'विद्यार्थी सर्वसमावेशक इतिहास (Student Dossier)' : 'Student Comprehensive History'}
              </h2>
              <p className="text-xs font-bold text-muted-foreground">
                {isMarathi ? 'उपस्थिती, पूर्ण केलेली कौशल्ये, उंची-वजन वाढ व फिटनेस चाचणी इतिहास' : 'Attendance, Completed Drills, Height & Weight Growth and Fitness Logs'}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            {/* Standard Filter */}
            <Select value={filterStd} onValueChange={setFilterStd}>
              <SelectTrigger className="h-11 rounded-xl font-bold border-2 bg-slate-50 text-xs">
                <SelectValue placeholder="वर्ग / इयत्ता" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">सर्व इयत्ता (All Classes)</SelectItem>
                <SelectItem value="5">इयत्ता ५ वी (Std 5)</SelectItem>
                <SelectItem value="6">इयत्ता ६ वी (Std 6)</SelectItem>
                <SelectItem value="7">इयत्ता ७ वी (Std 7)</SelectItem>
                <SelectItem value="8">इयत्ता ८ वी (Std 8)</SelectItem>
                <SelectItem value="9">इयत्ता ९ वी (Std 9)</SelectItem>
                <SelectItem value="10">इयत्ता १० वी (Std 10)</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-11 rounded-xl font-bold border-2 bg-slate-50 text-xs">
                <SelectValue placeholder="प्रवर्ग" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">सर्व विद्यार्थी (All Students)</SelectItem>
                <SelectItem value="athlete">खेळाडू (Athletes Only)</SelectItem>
                <SelectItem value="student">सामान्य विद्यार्थी (General Students)</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="नाव किंवा GR No शोधा..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 h-11 rounded-xl border-2 bg-slate-50 text-xs font-bold" 
              />
            </div>
          </div>
        </div>

        {/* Student Picker Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <label className="text-xs font-black uppercase text-primary shrink-0 flex items-center gap-1.5">
            <User className="w-4 h-4 text-accent" /> विद्यार्थी निवडा (Select Student):
          </label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="h-12 font-black text-sm bg-primary/5 rounded-2xl border-2 border-primary/20 shadow-xs flex-1">
              <SelectValue placeholder="-- खेळाडू / विद्यार्थी निवडा (Click to Pick Student) --" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {availablePlayers.map((p: Player) => (
                <SelectItem key={p.id} value={p.id} className="font-bold py-2">
                  {isMarathi ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name} 
                  <span className="text-xs text-muted-foreground ml-2">
                    (Std {p.std} • {p.category === 'athlete' ? '🏆 Athlete' : 'Student'} • GR: {p.generalRegisterNumber || p.serialNumber || 'N/A'})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {!selectedPlayerId || !currentPlayer ? (
        /* Empty State */
        <Card className="border-4 border-dashed rounded-[3rem] p-16 text-center bg-white/70 shadow-sm border-slate-200">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 text-primary">
            <HistoryIcon className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-primary uppercase tracking-wide">विद्यार्थी निवडा (Select an Entry)</h3>
          <p className="text-xs font-bold text-muted-foreground max-w-md mx-auto mt-1">
            वरील ड्रॉपडाउनमधून विद्यार्थी निवडून त्याची संपूर्ण उपस्थिती, सराव कौशल्ये, उंची-वजन वाढ व फिटनेस इतिहास पहा.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {availablePlayers.slice(0, 6).map((p: Player) => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlayerId(p.id)}
                className="rounded-xl border-2 text-xs font-bold hover:bg-primary/5 hover:border-primary/40"
              >
                {isMarathi ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name} (Std {p.std})
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        /* Comprehensive Student Profile & History */
        <div className="space-y-6">
          {/* PROFILE SUMMARY CARD */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-slate-200">
            <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Avatar + Basic Details */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div 
                  onClick={() => setExpandedPhotoUrl(currentPlayer.photoUrl || currentPlayer.aadharPhotoUrl || null)}
                  className="relative group/avatar cursor-pointer"
                  title="फोटो मोठा पाहण्यासाठी क्लिक करा (Click to expand photo)"
                >
                  <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-amber-400 shadow-2xl rounded-3xl overflow-hidden bg-slate-800">
                    <AvatarImage src={currentPlayer.photoUrl || currentPlayer.aadharPhotoUrl} className="object-cover group-hover/avatar:scale-105 transition-transform" />
                    <AvatarFallback className="bg-slate-800 text-amber-400 text-4xl font-black">{currentPlayer.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-slate-900 flex items-center gap-1 text-[9px] font-black uppercase">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-0.5 uppercase">
                      इयत्ता {currentPlayer.std} वी (Std {currentPlayer.std})
                    </Badge>
                    <Badge variant="outline" className="border-emerald-400/60 text-emerald-300 bg-emerald-950/40 text-xs font-black uppercase">
                      {currentPlayer.category === 'athlete' ? '🏆 ॲथलीट / खेळाडू' : 'सामान्य विद्यार्थी'}
                    </Badge>
                    {currentPlayer.gender && (
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs font-bold">
                        {currentPlayer.gender === 'Male' ? 'मुलगा (Boy)' : 'मुलगी (Girl)'}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {displayName}
                  </h1>
                  {currentPlayer.nameMarathi && currentPlayer.name && currentPlayer.nameMarathi !== currentPlayer.name && (
                    <p className="text-xs font-bold text-slate-400 font-mono tracking-wider">
                      {currentPlayer.name}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-300 font-medium pt-1">
                    <span><strong>GR No:</strong> {currentPlayer.generalRegisterNumber || '---'}</span>
                    <span><strong>हजेरी क्र:</strong> {currentPlayer.serialNumber || '---'}</span>
                    <span><strong>जन्म तारीख:</strong> {currentPlayer.dob || '---'} ({currentPlayer.age} वर्षे)</span>
                    <span><strong>रक्तगट:</strong> {currentPlayer.bloodGroup || '---'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <Button 
                  onClick={handleWhatsAppShare}
                  className="flex-1 sm:flex-none h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp अहवाल पाठवा
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 sm:flex-none h-12 border-2 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-black text-xs uppercase px-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" /> प्रिंट डॉक्युमेंट (Print)
                </Button>
              </div>
            </div>

            {/* QUICK STATS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-t border-slate-200 bg-slate-50 text-center p-4">
              <div className="p-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">उपस्थिती (Attendance)</p>
                <p className="text-xl font-black text-primary mt-0.5">{attendanceData.overallRate}%</p>
                <span className="text-[10px] font-bold text-emerald-600">{attendanceData.totalPresent} दिवस हजर</span>
              </div>
              <div className="p-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">पूर्ण सराव (Skills Mastered)</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">{completedSkills.length}</p>
                <span className="text-[10px] font-bold text-muted-foreground">कौशल्ये पूर्ण</span>
              </div>
              <div className="p-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">उंची व वजन (Height & Weight)</p>
                <p className="text-xl font-black text-blue-700 mt-0.5">{currentH || '---'} cm</p>
                <span className="text-[10px] font-bold text-slate-600">{currentW || '---'} kg</span>
              </div>
              <div className="p-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">BMI स्थिती (Body Mass Index)</p>
                <p className={`text-xl font-black mt-0.5 ${bmiCat.color}`}>{currentBmi}</p>
                <span className={`text-[10px] font-bold ${bmiCat.color}`}>{bmiCat.mr}</span>
              </div>
            </div>
          </Card>

          {/* MAIN TABS NAVIGATION */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-14 p-1 bg-white border-2 border-slate-200 rounded-2xl shadow-md gap-1">
              <TabsTrigger value="overview" className="rounded-xl font-black text-xs flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Calendar className="w-4 h-4" /> उपस्थिती (Attendance)
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-xl font-black text-xs flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Trophy className="w-4 h-4 text-amber-400" /> सराव कौशल्ये ({completedSkills.length})
              </TabsTrigger>
              <TabsTrigger value="growth" className="rounded-xl font-black text-xs flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> उंची व वजन (Growth)
              </TabsTrigger>
              <TabsTrigger value="fitness" className="rounded-xl font-black text-xs flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Activity className="w-4 h-4 text-blue-400" /> फिटनेस व वैद्यकीय
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ATTENDANCE HISTORY */}
            <TabsContent value="overview" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 30-Day Pulse Card */}
                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">30 दिवसांची उपस्थिती (30-Day Rate)</p>
                      <h3 className="text-4xl font-black text-primary mt-1">{attendanceData.rate30}%</h3>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-black text-xs px-3 py-1">
                      🔥 {attendanceData.streak} दिवस सलग
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${attendanceData.rate30}%` }} />
                  </div>
                </Card>

                {/* Overall Attendance Summary */}
                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-emerald-100">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">वार्षिक एकूण उपस्थिती (All Sessions)</p>
                  <h3 className="text-4xl font-black text-emerald-600 mt-1">{attendanceData.overallRate}%</h3>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mt-3 pt-3 border-t">
                    <span>हजर सत्रे: <strong className="text-emerald-700">{attendanceData.totalPresent}</strong></span>
                    <span>गैरहजर: <strong className="text-rose-600">{attendanceData.totalAbsent}</strong></span>
                    <span>एकूण: <strong>{attendanceData.totalSessions}</strong></span>
                  </div>
                </Card>

                {/* Sports Participation */}
                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-amber-100">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">खेळ सहभाग (Assigned Sports)</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(currentPlayer.sports) && currentPlayer.sports.length > 0 ? (
                      currentPlayer.sports.map((s: string) => (
                        <Badge key={s} className="bg-amber-500/20 text-amber-900 border-amber-400 font-bold text-xs">
                          🏆 {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-medium">कोणताही खेळ निवडलेला नाही</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Detailed Recent Attendance Table */}
              <Card className="border-2 rounded-3xl bg-white shadow-md overflow-hidden border-slate-200">
                <CardHeader className="bg-slate-900 text-white p-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> अलीकडील उपस्थिती नोंदी (Recent Attendance Register Logs)
                  </CardTitle>
                  <Badge className="bg-slate-800 text-slate-300 font-bold text-[10px]">
                    शेवटच्या {attendanceData.recentLogs.length} नोंदी
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {attendanceData.recentLogs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-bold uppercase">या विद्यार्थ्याची कोणतीही हजेरी नोंद आढळली नाही.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-black">
                          <tr>
                            <th className="p-3.5 text-left">दिनांक (Date)</th>
                            <th className="p-3.5 text-center">सकाळचे सत्र (Morning)</th>
                            <th className="p-3.5 text-center">संध्याकाळचे सत्र (Evening)</th>
                            <th className="p-3.5 text-right">दैनंदिन स्थिती (Daily Status)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                          {attendanceData.recentLogs.map((log, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5 font-black text-primary font-mono">{log.date}</td>
                              <td className="p-3.5 text-center">
                                {log.morning === 'P' ? (
                                  <Badge className="bg-emerald-600 text-white font-black text-[10px] px-2.5">P (हजर)</Badge>
                                ) : log.morning === 'A' ? (
                                  <Badge className="bg-rose-600 text-white font-black text-[10px] px-2.5">A (गैरहजर)</Badge>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center">
                                {log.evening === 'P' ? (
                                  <Badge className="bg-emerald-600 text-white font-black text-[10px] px-2.5">P (हजर)</Badge>
                                ) : log.evening === 'A' ? (
                                  <Badge className="bg-rose-600 text-white font-black text-[10px] px-2.5">A (गैरहजर)</Badge>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                {log.isPresent ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-black">
                                    <CheckCircle2 className="w-4 h-4" /> उपस्थित
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-black">गैरहजर</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: COMPLETED SKILLS & DRILLS */}
            <TabsContent value="skills" className="mt-4 space-y-6">
              <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-amber-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-primary uppercase flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" /> पूर्ण केलेली क्रीडा कौशल्ये व सराव (Completed Drills & Mastery)
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">
                      या विद्यार्थ्याने विविध खेळांमध्ये प्रभुत्व मिळवलेल्या कौशल्यांची नोंद
                    </p>
                  </div>
                  <Badge className="bg-amber-500 text-slate-950 font-black text-sm px-3.5 py-1">
                    एकूण पूर्ण: {completedSkills.length} कौशल्ये
                  </Badge>
                </div>

                {completedSkills.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20 text-amber-500" />
                    <p className="text-xs font-bold uppercase">या विद्यार्थ्याचे अद्याप कोणतेही ड्रिल नोंदवलेले नाही.</p>
                    <p className="text-[11px] text-slate-400 mt-1">दैनंदिन सराव प्लॅनर किंवा क्रीडा कौशल्ये टॅबमधून सराव पूर्ण नोंदवा.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(skillsBySport).map(([sport, skills]) => (
                      <div key={sport} className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl">
                          <h4 className="font-black text-xs uppercase flex items-center gap-2">
                            🏆 {sport}
                          </h4>
                          <Badge className="bg-amber-500 text-slate-950 text-[10px] font-black">
                            {skills.length} Mastered
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {skills.map((skill, idx) => (
                            <div key={idx} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-start justify-between gap-2 shadow-xs">
                              <div className="min-w-0">
                                <p className="font-black text-xs text-slate-900 truncate">{skill.drill}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                                  <span>📅 {skill.date}</span>
                                  {skill.time && <span>• {skill.time}</span>}
                                </div>
                              </div>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 3: HEIGHT & WEIGHT GROWTH EVOLUTION */}
            <TabsContent value="growth" className="mt-4 space-y-6">
              {/* Current Height / Weight / BMI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-blue-100 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">सध्याची उंची (Current Height)</p>
                  <h3 className="text-3xl font-black text-blue-900 mt-1">{currentH || '---'} <span className="text-sm font-bold">cm</span></h3>
                  <p className="text-[11px] font-bold text-muted-foreground mt-1">उंची मोजमाप</p>
                </Card>

                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-emerald-100 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Scale className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">सध्याचे वजन (Current Weight)</p>
                  <h3 className="text-3xl font-black text-emerald-900 mt-1">{currentW || '---'} <span className="text-sm font-bold">kg</span></h3>
                  <p className="text-[11px] font-bold text-muted-foreground mt-1">शरीर वजन</p>
                </Card>

                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-indigo-100 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">BMI निर्देशांक (Body Mass Index)</p>
                  <h3 className={`text-3xl font-black mt-1 ${bmiCat.color}`}>{currentBmi}</h3>
                  <Badge className="bg-slate-900 text-white font-black text-[10px] mt-1">
                    {bmiCat.mr} ({bmiCat.en})
                  </Badge>
                </Card>
              </div>

              {/* PHV Growth Spurt Info Card */}
              {phvData && (
                <Card className="border-2 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider">PHV (Peak Height Velocity) वाढ टप्पा विश्लेषण</p>
                      <h4 className="text-xl font-black text-white mt-0.5">{phvData.status}</h4>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        वाढीचा ऑफसेट: <strong className="text-amber-300 font-mono">{phvData.offset} वर्षे</strong> (शरीराच्या वाढीच्या सर्वोच्च वेगाचे शास्त्रीय मोजमाप)
                      </p>
                    </div>
                    <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-1 shrink-0 uppercase">
                      Growth Verified
                    </Badge>
                  </div>
                </Card>
              )}

              {/* Visual Height & Weight Progression Chart */}
              {growthChartData.length > 0 && (
                <Card className="border-2 rounded-3xl bg-white p-6 shadow-md border-slate-200">
                  <h4 className="text-xs font-black uppercase text-primary mb-6 flex items-center gap-2">
                    <ChartLine className="w-5 h-5 text-accent" /> उंची व वजन प्रगती आलेख (Growth Progression Chart)
                  </h4>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis yAxisId="height" orientation="left" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis yAxisId="weight" orientation="right" domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} />
                        <Legend />
                        <Line yAxisId="height" type="monotone" dataKey="height" stroke="#2563eb" strokeWidth={3} name="उंची Height (cm)" activeDot={{ r: 6 }} />
                        <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="#059669" strokeWidth={3} name="वजन Weight (kg)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Height & Weight History Table */}
              <Card className="border-2 rounded-3xl bg-white shadow-md overflow-hidden border-slate-200">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" /> उंची, वजन व BMI कालानुक्रमिक इतिहास (Measurement Timeline)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {heightWeightHistory.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                      <p className="text-xs font-bold uppercase">उंची/वजन नोंदी उपलब्ध नाहीत.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-black">
                          <tr>
                            <th className="p-3.5 text-left">नोंद प्रकार / दिनांक (Assessment / Date)</th>
                            <th className="p-3.5 text-center">उंची (Height)</th>
                            <th className="p-3.5 text-center">वजन (Weight)</th>
                            <th className="p-3.5 text-center">BMI निर्देशांक</th>
                            <th className="p-3.5 text-right">आरोग्य स्थिती (Category)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                          {heightWeightHistory.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5">
                                <p className="font-black text-primary">{item.label}</p>
                                <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                              </td>
                              <td className="p-3.5 text-center font-black text-blue-700">
                                {item.height > 0 ? `${item.height} cm` : '---'}
                              </td>
                              <td className="p-3.5 text-center font-black text-emerald-700">
                                {item.weight > 0 ? `${item.weight} kg` : '---'}
                              </td>
                              <td className="p-3.5 text-center font-black font-mono">
                                {item.bmi}
                              </td>
                              <td className="p-3.5 text-right">
                                <Badge className={`font-black text-[10px] ${item.bmiCategory.color} bg-slate-100 border-0`}>
                                  {item.bmiCategory.mr}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: FITNESS TEST PERFORMANCE & MEDICAL AUDIT */}
            <TabsContent value="fitness" className="mt-4 space-y-6">
              {/* Fitness Score Progression Chart */}
              <Card className="border-2 rounded-3xl bg-white shadow-md p-6 border-slate-200">
                <h4 className="text-xs font-black uppercase text-primary mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" /> फिटनेस चाचणी स्कोअर प्रगती (Fitness Assessment Progression)
                </h4>
                {fitnessChartData.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-20 text-primary" />
                    <p className="text-xs font-bold uppercase">कोणत्याही चाचणीचा स्कोअर अद्याप नोंदवलेला नाही.</p>
                  </div>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={fitnessChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={3} fill="#1e3a8a" fillOpacity={0.1} name="एकूण स्कोअर (Score %)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Medical Incident History */}
              <Card className="border-2 rounded-3xl bg-white shadow-md overflow-hidden border-slate-200">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" /> वैद्यकीय व इजा ऑडिट इतिहास (Medical Audit History)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {medicalHistory.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-black uppercase text-emerald-700">स्वच्छ वैद्यकीय रेकॉर्ड (Clean Medical Record)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">या विद्यार्थ्याची कोणतीही गंभीर दुखापत नोंदवलेली नाही.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medicalHistory.map((m: any, i: number) => (
                        <div key={i} className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-primary font-mono">{m.date}</span>
                            <Badge className="bg-rose-600 text-white font-black text-[9px] px-2.5">
                              {m.severity || 'Minor'}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX DIALOG */}
      <Dialog open={!!expandedPhotoUrl} onOpenChange={() => setExpandedPhotoUrl(null)}>
        <DialogContent className="sm:max-w-[550px] p-4 bg-slate-950 text-white border-2 border-amber-400/40 rounded-3xl shadow-2xl">
          <DialogHeader className="pb-2 border-b border-slate-800">
            <DialogTitle className="text-sm font-black text-amber-400 uppercase tracking-wide">
              👤 {displayName} - पूर्ण छायाचित्र (Photo)
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 max-h-[70vh] overflow-hidden bg-black/60 rounded-2xl">
            {expandedPhotoUrl && (
              <img 
                src={expandedPhotoUrl} 
                alt={displayName} 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setExpandedPhotoUrl(null)}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs rounded-xl"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
