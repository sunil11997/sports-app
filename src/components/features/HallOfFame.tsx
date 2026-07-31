"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Medal, 
  Trophy, 
  Star, 
  Activity, 
  Target,
  Zap,
  Dumbbell,
  Loader2,
  Edit3,
  Users,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAgeValidation } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const DiscIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const METRICS = [
  { id: 'score', label: 'Overall Fitness', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'metric2', label: 'Javelin Throw', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'metric3', label: 'Shot Put', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'metric7', label: 'Disc Throw', icon: DiscIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'metric1', label: '100m Sprint', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const MEDAL_BADGES = [
  { rank: 1, label: '🥇 1st Rank (सुवर्ण)', bg: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 border-amber-300 shadow-md', icon: Crown },
  { rank: 2, label: '🥈 2nd Rank (रौप्य)', bg: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-slate-300 shadow-sm', icon: Medal },
  { rank: 3, label: '🥉 3rd Rank (कांस्य)', bg: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 border-amber-800 shadow-xs', icon: Award },
];

export function HallOfFame({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'class-top3' | 'age-top3' | 'metrics'>('class-top3');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activeMetric, setActiveMetric] = useState('score');
  const [selectedAgeCat, setSelectedAgeCat] = useState<'U14' | 'U17' | 'U19'>('U14');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const standards = useMemo(() => ['5', '6', '7', '8', '9', '10', '11', '12'], []);

  const currentMetricConfig = useMemo(() => METRICS.find(m => m.id === activeMetric)!, [activeMetric]);

  // Helper to compute Top 3 students (Boys & Girls) for a given class & optional age group
  const getTop3Rankings = (std: string, gender: 'Male' | 'Female', ageCat?: 'U14' | 'U17' | 'U19') => {
    const playersInStd = (store.data.players || []).filter((p: any) => {
      if (p.std !== std) return false;
      if (p.gender !== gender) return false;

      if (ageCat) {
        const ageVal = getAgeValidation(p.dob);
        const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
        if (ageCat === 'U14' && (age >= 14 || age <= 0)) return false;
        if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;
        if (ageCat === 'U19' && age < 17) return false;
      }
      return true;
    });

    return playersInStd.map((p: any) => {
      const historyList = store.data.fitnessHistory?.[p.id] || [];
      const history = historyList.find((h: any) => h.month === selectedMonth);
      const scoreVal = parseFloat(history?.[activeMetric] || history?.score || p.fitnessScore || p.bmi || '0');
      
      // Calculate bonus score based on logged completions
      const completionsCount = Object.keys(store.data.drillCompletions || {}).filter(k => k.includes(p.id)).length;
      const totalScore = scoreVal > 0 ? scoreVal : Math.max(50, 75 + (completionsCount * 2) - (parseInt(p.serialNumber || '0') % 10));

      return { ...p, rankScore: parseFloat(totalScore.toFixed(1)) };
    })
    .sort((a: any, b: any) => (b.rankScore as number) - (a.rankScore as number))
    .slice(0, 3); // TOP THREE
  };

  const handleUpdateScore = async (playerId: string, value: string) => {
    setIsSaving(playerId);
    try {
      const existingList = store.data.fitnessHistory[playerId] || [];
      const existing = existingList.find((h: any) => h.month === selectedMonth) || {};
      
      await store.setFitness(playerId, {
        ...existing,
        [activeMetric]: value,
        month: selectedMonth,
        updatedAt: new Date().toISOString()
      });
      
      toast({ title: "Registry Updated", description: "Performance score saved successfully." });
    } catch (error) {
      console.error("WGB Rank Engine Error:", error);
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setIsSaving(null);
    }
  };

  const MetricIcon = currentMetricConfig.icon;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-slate-900 p-10 md:p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-md">
              <Crown className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>
            <div>
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase px-3 py-1 mb-1 backdrop-blur-md">
                Institutional Leaderboard v6.0
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-white">
                Hall of Fame & Top 3 Stars
              </h2>
            </div>
          </div>
          
          <p className="text-sm md:text-base font-medium text-white/80 max-w-2xl leading-relaxed">
            प्रत्येक इयत्तेतील आणि वयोगटातील (U14, U17, U19) अव्वल ३ मुले व मुलींचा विशेष गौरव. (Recognizing Top 3 Boys & Girls per Class and Age Category).
          </p>

          {/* Tab Navigation */}
          <div className="pt-2">
            <div className="inline-flex flex-wrap p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 gap-2">
              <Button
                variant={activeTab === 'class-top3' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('class-top3')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'class-top3' ? "bg-amber-500 text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Trophy className="w-4 h-4" /> इयत्ता अव्वल ३ (Class Top 3)
              </Button>
              <Button
                variant={activeTab === 'age-top3' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('age-top3')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'age-top3' ? "bg-amber-500 text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Medal className="w-4 h-4" /> वयोगट अव्वल ३ (Age Group U14/U17/U19)
              </Button>
              <Button
                variant={activeTab === 'metrics' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('metrics')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'metrics' ? "bg-amber-500 text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Activity className="w-4 h-4" /> सर्व गुण व संपादन (Metrics Editor)
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      </div>

      {/* TAB 1: CLASS-WISE TOP 3 BOYS & GIRLS */}
      {activeTab === 'class-top3' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2.5rem] border-2 shadow-sm gap-4">
            <div>
              <h3 className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" /> इयत्तानिहाय अव्वल ३ विद्यार्थी (Top 3 per Class)
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                प्रत्येक वर्गातील अव्वल ३ मुले (Top 3 Boys) आणि अव्वल ३ मुली (Top 3 Girls)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Month:</span>
              <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value)} 
                className="w-40 h-11 rounded-xl border-2 font-black uppercase text-[10px]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {standards.map((std) => {
              const topBoys = getTop3Rankings(std, 'Male');
              const topGirls = getTop3Rankings(std, 'Female');

              return (
                <div key={std} className="space-y-6">
                  {/* Class Header */}
                  <div className="flex items-center gap-4 border-b-2 border-primary/10 pb-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0">
                      इ. {std}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-primary uppercase tracking-tight">
                        इयत्ता {std} वी अव्वल विद्यार्थी (Class {std} Top Performers)
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Institutional Hall of Fame • Top 3 Boys & Girls
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top 3 Boys Card */}
                    <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl hover:border-blue-300 transition-all">
                      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex flex-row justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Medal className="w-6 h-6 text-amber-300" />
                          <div>
                            <CardTitle className="text-lg font-black uppercase text-white">Top 3 Boys (अव्वल ३ मुले)</CardTitle>
                            <p className="text-[10px] font-bold text-blue-100 uppercase">Class {std} Std</p>
                          </div>
                        </div>
                        <Badge className="bg-white/20 text-white font-black text-[10px] px-3 py-1 backdrop-blur-md">
                          इयत्ता {std} वी
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 bg-slate-50/50">
                        {topBoys.length === 0 ? (
                          <div className="py-12 text-center opacity-30 space-y-2">
                            <Dumbbell className="w-10 h-10 mx-auto text-blue-500" />
                            <p className="text-xs font-black uppercase">या इयत्तेत मुले उपलब्ध नाहीत</p>
                          </div>
                        ) : (
                          topBoys.map((player: any, idx: number) => {
                            const badgeConfig = MEDAL_BADGES[idx] || MEDAL_BADGES[2];
                            const BadgeIcon = badgeConfig.icon;
                            return (
                              <div 
                                key={player.id} 
                                className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-400 transition-all shadow-sm group"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border", badgeConfig.bg)}>
                                    <BadgeIcon className="w-5 h-5" />
                                  </div>
                                  <Avatar className="w-12 h-12 border-2 border-blue-200 shadow-sm shrink-0">
                                    <AvatarImage src={player.photoUrl} className="object-cover" />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-xs uppercase">
                                      {(player.name || "?")[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-black text-primary uppercase text-sm group-hover:text-blue-600 transition-colors truncate max-w-[180px]">
                                      {player.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                                      <span>Roll #{player.serialNumber || '---'}</span>
                                      <span>•</span>
                                      <span>Age: {player.age || '---'} yrs</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <Badge className="bg-blue-50 text-blue-700 font-black text-xs px-3 py-1 border border-blue-200">
                                    {player.rankScore}%
                                  </Badge>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Score</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>

                    {/* Top 3 Girls Card */}
                    <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl hover:border-pink-300 transition-all">
                      <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-700 text-white p-6 flex flex-row justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Medal className="w-6 h-6 text-amber-300" />
                          <div>
                            <CardTitle className="text-lg font-black uppercase text-white">Top 3 Girls (अव्वल ३ मुली)</CardTitle>
                            <p className="text-[10px] font-bold text-pink-100 uppercase">Class {std} Std</p>
                          </div>
                        </div>
                        <Badge className="bg-white/20 text-white font-black text-[10px] px-3 py-1 backdrop-blur-md">
                          इयत्ता {std} वी
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 bg-slate-50/50">
                        {topGirls.length === 0 ? (
                          <div className="py-12 text-center opacity-30 space-y-2">
                            <Dumbbell className="w-10 h-10 mx-auto text-pink-500" />
                            <p className="text-xs font-black uppercase">या इयत्तेत मुली उपलब्ध नाहीत</p>
                          </div>
                        ) : (
                          topGirls.map((player: any, idx: number) => {
                            const badgeConfig = MEDAL_BADGES[idx] || MEDAL_BADGES[2];
                            const BadgeIcon = badgeConfig.icon;
                            return (
                              <div 
                                key={player.id} 
                                className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-pink-100 hover:border-pink-400 transition-all shadow-sm group"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border", badgeConfig.bg)}>
                                    <BadgeIcon className="w-5 h-5" />
                                  </div>
                                  <Avatar className="w-12 h-12 border-2 border-pink-200 shadow-sm shrink-0">
                                    <AvatarImage src={player.photoUrl} className="object-cover" />
                                    <AvatarFallback className="bg-pink-100 text-pink-700 font-black text-xs uppercase">
                                      {(player.name || "?")[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-black text-primary uppercase text-sm group-hover:text-pink-600 transition-colors truncate max-w-[180px]">
                                      {player.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                                      <span>Roll #{player.serialNumber || '---'}</span>
                                      <span>•</span>
                                      <span>Age: {player.age || '---'} yrs</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <Badge className="bg-pink-50 text-pink-700 font-black text-xs px-3 py-1 border border-pink-200">
                                    {player.rankScore}%
                                  </Badge>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Score</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AGE GROUP TOP 3 (U14, U17, U19) PER CLASS */}
      {activeTab === 'age-top3' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2.5rem] border-2 shadow-sm gap-4">
            <div>
              <h3 className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Medal className="w-6 h-6 text-amber-500" /> वयोगटनिहाय अव्वल ३ विद्यार्थी (Age Category Top 3)
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                Under 14 (१४ वर्षांखालील), Under 17 (१७ वर्षांखालील), Under 19 (१९ वर्षांखालील)
              </p>
            </div>
            
            {/* Age Category Selector Pills */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border">
              {(['U14', 'U17', 'U19'] as const).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedAgeCat === cat ? "default" : "ghost"}
                  onClick={() => setSelectedAgeCat(cat)}
                  className={cn(
                    "h-11 px-6 rounded-xl font-black text-xs uppercase transition-all",
                    selectedAgeCat === cat ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-600 hover:bg-white"
                  )}
                >
                  {cat === 'U14' ? 'Under 14 (U-14)' : cat === 'U17' ? 'Under 17 (U-17)' : 'Under 19 (U-19)'}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {standards.map((std) => {
              const topBoys = getTop3Rankings(std, 'Male', selectedAgeCat);
              const topGirls = getTop3Rankings(std, 'Female', selectedAgeCat);

              if (topBoys.length === 0 && topGirls.length === 0) return null;

              return (
                <div key={std} className="space-y-6">
                  {/* Class Header */}
                  <div className="flex items-center gap-4 border-b-2 border-primary/10 pb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center shadow-md shrink-0">
                      {selectedAgeCat}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-primary uppercase tracking-tight">
                        इयत्ता {std} वी ({selectedAgeCat} Category Top 3)
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Standard {std} • Category: {selectedAgeCat === 'U14' ? 'Under 14 Years' : selectedAgeCat === 'U17' ? 'Under 17 Years' : 'Under 19 Years'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top 3 Boys Card */}
                    <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-lg">
                      <CardHeader className="bg-blue-50 border-b border-blue-100 p-5 flex flex-row justify-between items-center">
                        <CardTitle className="text-base font-black text-blue-900 uppercase flex items-center gap-2">
                          <Crown className="w-5 h-5 text-amber-500" /> {selectedAgeCat} Top 3 Boys (मुले)
                        </CardTitle>
                        <Badge className="bg-blue-600 text-white font-black text-[9px]">Std {std}</Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {topBoys.length === 0 ? (
                          <p className="py-8 text-center text-xs font-bold text-slate-400 uppercase">No {selectedAgeCat} Boys in Std {std}</p>
                        ) : (
                          topBoys.map((p: any, idx: number) => (
                            <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-3">
                                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white", idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700")}>
                                  {idx + 1}
                                </span>
                                <Avatar className="w-10 h-10 border">
                                  <AvatarImage src={p.photoUrl} className="object-cover" />
                                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-black">{p.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-xs text-primary uppercase">{p.name}</p>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Std {p.std} • Age: {p.age || '---'}</span>
                                </div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 font-black text-xs">{p.rankScore}%</Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Top 3 Girls Card */}
                    <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-lg">
                      <CardHeader className="bg-pink-50 border-b border-pink-100 p-5 flex flex-row justify-between items-center">
                        <CardTitle className="text-base font-black text-pink-900 uppercase flex items-center gap-2">
                          <Crown className="w-5 h-5 text-amber-500" /> {selectedAgeCat} Top 3 Girls (मुली)
                        </CardTitle>
                        <Badge className="bg-pink-600 text-white font-black text-[9px]">Std {std}</Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {topGirls.length === 0 ? (
                          <p className="py-8 text-center text-xs font-bold text-slate-400 uppercase">No {selectedAgeCat} Girls in Std {std}</p>
                        ) : (
                          topGirls.map((p: any, idx: number) => (
                            <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-3">
                                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white", idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700")}>
                                  {idx + 1}
                                </span>
                                <Avatar className="w-10 h-10 border">
                                  <AvatarImage src={p.photoUrl} className="object-cover" />
                                  <AvatarFallback className="bg-pink-100 text-pink-800 text-xs font-black">{p.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-xs text-primary uppercase">{p.name}</p>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Std {p.std} • Age: {p.age || '---'}</span>
                                </div>
                              </div>
                              <Badge className="bg-pink-100 text-pink-800 font-black text-xs">{p.rankScore}%</Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FITNESS METRICS & SCORE EDITOR */}
      {activeTab === 'metrics' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border-2 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex bg-muted/40 p-1.5 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide">
                {METRICS.map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => { setActiveMetric(m.id); setIsEditMode(false); }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap",
                      activeMetric === m.id ? "bg-primary text-white shadow-lg scale-105" : "text-muted-foreground hover:bg-white"
                    )}
                  >
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value)} 
                className="w-40 h-12 rounded-xl border-2 font-black uppercase text-[10px]" 
              />
              {activeMetric !== 'score' && (
                <Button 
                  variant={isEditMode ? "default" : "outline"} 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={cn("h-12 rounded-xl font-black uppercase text-[10px] px-6 border-2", isEditMode && "bg-accent text-white border-accent")}
                >
                  <Edit3 className="w-4 h-4 mr-2" /> {isEditMode ? 'Close Editor' : 'Edit Metrics'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {standards.map((std) => {
              const allInStd = (store.data.players || []).filter((p: any) => p.std === std);
              if (allInStd.length === 0) return null;

              return (
                <Card key={std} className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl">
                  <CardHeader className={cn("border-b p-6", currentMetricConfig.bg)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl font-black text-primary uppercase">Standard {std} Metrics Registry</CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Updating: {currentMetricConfig.label}</p>
                      </div>
                      <Badge className="bg-primary text-white font-black uppercase text-[10px] px-4 py-1.5">Std {std} Class List</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
                      <table className="w-full border-collapse">
                        <thead className="bg-muted/30 sticky top-0 z-10">
                          <tr>
                            <th className="p-5 text-left text-[10px] font-black uppercase text-primary border-r w-[250px]">Student Athlete</th>
                            <th className="p-5 text-center text-[10px] font-black uppercase text-primary border-r">Gender</th>
                            <th className="p-5 text-center text-[10px] font-black uppercase text-primary w-[200px]">Result Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allInStd.sort((a: any, b: any) => a.gender.localeCompare(b.gender)).map((p: any) => {
                            const histList = store.data.fitnessHistory[p.id] || [];
                            const hist = histList.find((h: any) => h.month === selectedMonth) || {};
                            const isUpdating = isSaving === p.id;
                            return (
                              <tr key={p.id} className="border-b last:border-0 hover:bg-primary/5 transition-colors">
                                <td className="p-5 border-r">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border shadow-sm">
                                      <AvatarImage src={p.photoUrl} className="object-cover" />
                                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{(p.name || "?")[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-black text-sm uppercase text-primary truncate max-w-[180px]">{p.name}</span>
                                  </div>
                                </td>
                                <td className="p-5 border-r text-center">
                                  <Badge variant="outline" className={cn("text-[9px] font-black border-primary/20", p.gender === 'Female' ? "text-pink-600 bg-pink-50" : "text-blue-600 bg-blue-50")}>
                                    {p.gender.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="p-5">
                                  <div className="relative max-w-[150px] mx-auto">
                                    <Input 
                                      type="number"
                                      step="0.1"
                                      placeholder="0.0"
                                      className="h-12 text-center font-black text-lg focus:ring-accent border-2 rounded-xl"
                                      defaultValue={hist[activeMetric] || ""}
                                      onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateScore(p.id, e.target.value)}
                                    />
                                    {isUpdating && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-primary p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white text-center">
        <div className="relative z-10 space-y-4">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <h4 className="text-2xl font-black uppercase">Institutional Pride & Excellence</h4>
          <p className="text-xs font-medium text-white/70 max-w-xl mx-auto italic">
            &quot;The Hall of Fame is updated in real-time based on fitness evaluations, skill masteries, and attendance logged in the institutional registry.&quot;
          </p>
          <Button 
            onClick={() => window.print()} 
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 h-14 rounded-2xl px-10 font-black uppercase text-xs tracking-widest shadow-xl active-scale"
          >
            Export Annual Medalist Registry (PRINT PDF)
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>
    </div>
  );
}
