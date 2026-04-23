
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Activity, 
  Trophy, 
  Stethoscope, 
  Sparkles,
  School,
  Home,
  Settings as SettingsIcon,
  FileText,
  ClipboardList,
  Wifi,
  WifiOff,
  User,
  Loader2,
  History as HistoryIcon,
  ArrowRight,
  GraduationCap,
  Medal,
  Trophy as TrophyIcon,
  Star,
  Award,
  Crown,
  Languages,
  Dumbbell,
  GraduationCap as ClassIcon,
  UsersRound,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

// Feature Components
import { Registration } from '@/components/features/Registration';
import { Dashboard } from '@/components/features/Dashboard';
import { Attendance } from '@/components/features/Attendance';
import { Fitness } from '@/components/features/Fitness';
import { SportsSkills } from '@/components/features/SportsSkills';
import { SportsDrills } from '@/components/features/SportsDrills';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { AIAdvice } from '@/components/features/AIAdvice';
import { DailyReport } from '@/components/features/DailyReport';
import { TournamentRosters } from '@/components/features/TournamentRosters';
import { Settings } from '@/components/features/Settings';
import { History } from '@/components/features/History';
import { StandardRegistry } from '@/components/features/StandardRegistry';

const translations = {
  English: {
    schoolName: "GOVT. SECONDARY ASHRAM SCHOOL WAGHAMBA",
    sportsHub: "Sports Hub",
    studentRegistry: "Student Registry",
    switchHub: "Switch Hub",
    online: "ONLINE",
    offline: "OFFLINE",
    home: "Home",
    register: "Register",
    roster: "Roster",
    tourney: "Tourney",
    report: "Report",
    history: "History",
    presence: "Presence",
    fitness: "Fitness",
    skills: "Skills",
    drills: "Drills",
    health: "Health",
    aiHub: "AI Hub",
    settings: "Settings",
    enroll: "Enroll",
    registry: "Registry",
    session: "Session",
    physicals: "Physicals",
    medical: "Medical",
    performanceLeader: "PERFORMANCE LEADER",
    studentExcellence: "Student Excellence",
    congratulations: "Congratulations!",
    excellenceDesc: "Outstanding performance in technical skills and physical assessment tests. Keeping the pride high!",
    topSquadRanking: "Top Squad Ranking",
    calculatedPerformanceHub: "Calculated Performance Hub",
    loadingRegistry: "Syncing Registry...",
    loadingHallOfFame: "Loading Hall of Fame...",
    selectHub: "Select Management Section",
    sportsHubDesc: "Manage athletes, performance scores, and tournament rosters.",
    studentRegistryDesc: "Manage general student growth logs and physical registry.",
    enter: "ENTER",
    institutionalStack: "V3.0 INSTITUTIONAL STACK",
    tribalLogoHint: "आदिवासी विकास विभाग • महाराष्ट्र शासन",
    registrySummary: "Class Registry Overview",
    registryDesc: "Consolidated institutional enrollment counts across all standards.",
    totalStudents: "Total Enrollment",
    classWise: "Standard Breakdown",
    boysLabel: "Boys",
    girlsLabel: "Girls"
  },
  Marathi: {
    schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा केंद्र",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    home: "मुख्यपृष्ठ",
    register: "नोंदणी",
    roster: "यादी",
    tourney: "स्पर्धा",
    report: "अहवाल",
    history: "इतिहास",
    presence: "उपस्थिती",
    fitness: "क्षमता",
    skills: "कौशल्ये",
    drills: "सराव",
    health: "आरोग्य",
    aiHub: "AI केंद्र",
    settings: "सेटिंग्ज",
    enroll: "नावनोंदणी",
    registry: "नोंदणी वही",
    session: "सत्र",
    physicals: "शारीरिक",
    medical: "वैद्यकीय",
    performanceLeader: "सर्वोत्कृष्ट खेळाडू",
    studentExcellence: "विद्यार्थी उत्कृष्टता",
    congratulations: "अभिनंदन!",
    excellenceDesc: "तांत्रिक कौशल्ये आणि शारीरिक मूल्यमापन चाचण्यांमध्ये उत्कृष्ट कामगिरी. शाळेचा अभिमान उंचावला!",
    topSquadRanking: "अव्वल संघ रँकिंग",
    calculatedPerformanceHub: "कार्यप्रदर्शन केंद्र",
    loadingRegistry: "रजिस्ट्री सिंक होत आहे...",
    loadingHallOfFame: "हॉल ऑफ फेम लोड होत आहे...",
    selectHub: "व्यवस्थापन विभाग निवडा",
    sportsHubDesc: "खेळाडू, कामगिरीचे गुण आणि स्पर्धा रोस्टर व्यवस्थापित करा.",
    studentRegistryDesc: "सामान्य विद्यार्थी वाढीचे लॉग आणि शारीरिक नोंदणी व्यवस्थापित करा.",
    enter: "प्रवेश करा",
    institutionalStack: "V3.0 संस्थात्मक स्टॅक",
    tribalLogoHint: "आदिवासी विकास विभाग • महाराष्ट्र शासन",
    registrySummary: "विद्यार्थी नोंदणी सारांश",
    registryDesc: "सर्व इयत्तांमधील एकत्रित नोंदणी संख्या.",
    totalStudents: "एकूण नावनोंदणी",
    classWise: "इयत्तावार माहिती",
    boysLabel: "मुले",
    girlsLabel: "मुली"
  }
};

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [isTabChanging, setIsTabChanging] = useState(false);
  const schoolData = useSchoolData();
  const { isOnline } = usePWA();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const t = translations[language];
  const LOGO = PlaceHolderImages.find(img => img.id === 'adivasi-vikas-logo');

  useEffect(() => {
    if (isEntered && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [isEntered, user, isUserLoading, auth]);

  const handleStartHub = () => {
    setIsEntered(true);
  };

  const handleSectionSelect = (section: 'sports' | 'general') => {
    setSelectedSection(section);
    setActiveTab("home"); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setIsTabChanging(true);
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsTabChanging(false), 200);
  };

  const topPerformers = useMemo(() => {
    if (!schoolData.data.players) return [];
    return [...schoolData.data.players].map(p => {
      const fitness = schoolData.data.fitness[p.id] || { score: '0' };
      const skills = Object.values(schoolData.data.sportSkills).filter(s => s.playerId === p.id);
      const maxSkill = skills.length > 0 ? Math.max(...skills.map(s => parseFloat(s.score) || 0)) : 0;
      const performance = (parseFloat(fitness.score) || 0) + maxSkill;
      return { ...p, performance, fitnessScore: fitness.score, latestStatus: fitness.status };
    }).sort((a, b) => b.performance - a.performance);
  }, [schoolData.data]);

  const classSummaries = useMemo(() => {
    const summary: Record<string, { total: number, boys: number, girls: number }> = {};
    for (let i = 1; i <= 12; i++) {
      summary[i.toString()] = { total: 0, boys: 0, girls: 0 };
    }
    
    schoolData.data.players.filter(p => p.category === 'student').forEach(p => {
      if (summary[p.std]) {
        summary[p.std].total++;
        if (p.gender === 'Male') summary[p.std].boys++;
        else summary[p.std].girls++;
      }
    });
    return summary;
  }, [schoolData.data.players]);

  const totalStudentCount = Object.values(classSummaries).reduce((acc, curr) => acc + curr.total, 0);

  const bestPlayer = topPerformers[0];

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-xl w-full text-center space-y-12">
          <div className="space-y-8">
            <div className="w-36 h-36 bg-white rounded-[3rem] flex items-center justify-center mx-auto border shadow-2xl overflow-hidden">
              {LOGO ? (
                <Image 
                  src={LOGO.imageUrl} 
                  alt="Adivasi Vikas Vibhag" 
                  width={100} 
                  height={100} 
                  className="object-contain p-3"
                  data-ai-hint={LOGO.imageHint}
                />
              ) : (
                <School className="w-14 h-14 text-primary" />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight px-4 uppercase">
                {t.schoolName}
              </h1>
              <p className="text-primary font-black tracking-[0.3em] text-[10px] uppercase opacity-80">
                {t.tribalLogoHint}
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={handleStartHub}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black text-2xl h-24 rounded-[2rem] shadow-xl transition-all"
            >
              {t.enter}
              <ArrowRight className="ml-3 w-8 h-8" />
            </Button>
            <p className="mt-8 text-primary/20 text-[9px] font-black uppercase tracking-[0.5em]">
              {t.institutionalStack}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || !schoolData.isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="font-black text-primary tracking-[0.3em] uppercase text-xs">{t.loadingRegistry}</p>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight">
            {t.selectHub}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => handleSectionSelect('sports')}
              className="bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary shadow-xl hover:shadow-2xl active:scale-95"
            >
              <Medal className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">{t.sportsHub}</h3>
              <p className="text-muted-foreground font-medium text-lg">
                {t.sportsHubDesc}
              </p>
            </button>

            <button 
              onClick={() => handleSectionSelect('general')}
              className="bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary shadow-xl hover:shadow-2xl active:scale-95"
            >
              <GraduationCap className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">{t.studentRegistry}</h3>
              <p className="text-muted-foreground font-medium text-lg">
                {t.studentRegistryDesc}
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-blue-600 bg-blue-50" },
    { id: "registration", label: t.register, icon: User, color: "text-emerald-600 bg-emerald-50" },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard, color: "text-purple-600 bg-purple-50" },
    { id: "tournament", label: t.tourney, icon: ClipboardList, color: "text-amber-600 bg-amber-50" },
    { id: "daily-report", label: t.report, icon: FileText, color: "text-rose-600 bg-rose-50" },
    { id: "archive", label: t.history, icon: HistoryIcon, color: "text-indigo-600 bg-indigo-50" },
    { id: "attendance", label: t.presence, icon: CalendarCheck, color: "text-teal-600 bg-teal-50" },
    { id: "fitness", label: t.fitness, icon: Activity, color: "text-orange-600 bg-orange-50" },
    { id: "sports-skills", label: t.skills, icon: TrophyIcon, color: "text-yellow-600 bg-yellow-50" },
    { id: "drills", label: t.drills, icon: Dumbbell, color: "text-cyan-600 bg-cyan-50" },
    { id: "health", label: t.health, icon: Stethoscope, color: "text-red-600 bg-red-50" },
    { id: "ai", label: t.aiHub, icon: Sparkles, color: "text-fuchsia-600 bg-fuchsia-50" },
    { id: "settings", label: t.settings, icon: SettingsIcon, color: "text-slate-600 bg-slate-50" },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-blue-600 bg-blue-50" },
    { id: "registration", label: t.enroll, icon: User, color: "text-emerald-600 bg-emerald-50" },
    ...[...Array(12)].map((_, i) => ({
      id: `std-${i + 1}`,
      label: `Std ${i + 1}`,
      icon: ClassIcon,
      color: "text-indigo-600 bg-indigo-50"
    })),
    { id: "settings", label: t.settings, icon: SettingsIcon, color: "text-slate-600 bg-slate-50" },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="sticky top-0 z-50 bg-white border-b py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-primary/5 p-2 rounded-xl border w-11 h-11 flex items-center justify-center shadow-inner">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={32} height={32} />
              ) : (
                <School className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? t.sportsHub : t.studentRegistry}
              </h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{t.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedSection(null)}
              className="text-[11px] font-black text-primary uppercase bg-primary/5 hover:bg-primary/10 rounded-full px-4"
            >
              {t.switchHub}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-muted/40 p-2 flex gap-3 rounded-2xl min-w-max border h-auto">
              {currentTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-xl px-6 py-4 font-black text-[12px] uppercase tracking-wider transition-all shadow-sm flex flex-col items-center gap-1 min-w-[100px]",
                    "data-[state=active]:shadow-lg data-[state=active]:scale-110",
                    tab.color
                  )}
                >
                  <tab.icon className="w-5 h-5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative min-h-[500px]">
            {isTabChanging && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[3rem]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}

            <TabsContent value="home">
              {selectedSection === 'sports' ? (
                <div className="space-y-12">
                  {bestPlayer ? (
                    <Card className="border-0 rounded-[3.5rem] shadow-2xl bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative w-full aspect-[4/3] lg:aspect-auto min-h-[400px]">
                          {bestPlayer.photoUrl ? (
                            <Image 
                              src={bestPlayer.photoUrl} 
                              alt={bestPlayer.name} 
                              fill 
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <User className="w-32 h-32 text-muted-foreground opacity-20" />
                            </div>
                          )}
                          <div className="absolute top-8 left-8">
                            <Badge className="bg-yellow-400 text-black font-black text-xs px-6 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-black/10">
                              <Crown className="w-4 h-4" /> {t.performanceLeader}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-10 lg:p-20 flex flex-col justify-center space-y-8 bg-gradient-to-br from-primary to-primary/90 text-white relative">
                          <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Trophy className="w-64 h-64" />
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">{t.studentExcellence}</h3>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
                              {bestPlayer.name}
                            </h2>
                            <div className="flex flex-wrap gap-3">
                              <Badge variant="outline" className="text-white border-white/30 font-black uppercase px-4 py-1 rounded-full">
                                Std {bestPlayer.std}
                              </Badge>
                              <Badge className="bg-accent text-accent-foreground font-black uppercase px-4 py-1 rounded-full">
                                Score: {bestPlayer.performance.toFixed(0)}
                              </Badge>
                              <Badge className="bg-white/10 text-white font-black uppercase px-4 py-1 rounded-full border-0">
                                Level: {bestPlayer.latestStatus || 'A'}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                                <Award className="w-8 h-8 text-accent-foreground" />
                              </div>
                              <h4 className="text-2xl font-black uppercase tracking-tight">{t.congratulations}</h4>
                            </div>
                            <p className="text-white/80 font-medium text-lg leading-relaxed">
                              {t.excellenceDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border-0 rounded-[3rem] shadow-sm bg-muted/20 p-20 text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="font-black text-primary uppercase">{t.loadingHallOfFame}</p>
                    </Card>
                  )}

                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" /> {t.topSquadRanking}
                      </h3>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.calculatedPerformanceHub}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                      {topPerformers.slice(1, 9).map((player, idx) => (
                        <Card key={player.id} className="border-2 border-primary/10 rounded-[2.5rem] overflow-hidden hover:border-primary transition-all group active:scale-95 shadow-lg">
                          <div className="relative aspect-square">
                            {player.photoUrl ? (
                              <Image src={player.photoUrl} alt={player.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <User className="w-12 h-12 text-muted-foreground opacity-20" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-white/90 text-primary font-black shadow-md border-0 h-8 w-8 flex items-center justify-center p-0 rounded-full">
                                #{idx + 2}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-6 bg-white space-y-4">
                            <div className="space-y-1">
                              <h4 className="font-black text-primary uppercase text-lg truncate">{player.name}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Std {player.std} • {player.latestStatus || 'B'}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-dashed">
                              <span className="text-[9px] font-black text-muted-foreground uppercase">Fitness Score</span>
                              <span className="text-lg font-black text-primary">{player.fitnessScore || '0'}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in duration-700">
                  <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border border-primary/10">
                          <UsersRound className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-5xl font-black text-primary uppercase tracking-tight">{t.registrySummary}</h2>
                          <p className="text-lg font-medium text-muted-foreground">{t.registryDesc}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5 space-y-2">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.totalStudents}</span>
                          <p className="text-5xl font-black text-primary">{totalStudentCount}</p>
                        </div>
                        <div className="bg-emerald-500 p-8 rounded-[2rem] shadow-lg text-white space-y-2">
                          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{t.boysLabel}</span>
                          <p className="text-5xl font-black">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.boys, 0)}</p>
                        </div>
                        <div className="bg-accent p-8 rounded-[2rem] shadow-lg text-accent-foreground space-y-2">
                          <span className="text-[10px] font-black text-accent-foreground/70 uppercase tracking-widest">{t.girlsLabel}</span>
                          <p className="text-5xl font-black">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.girls, 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-6">
                      <h3 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-primary" /> {t.classWise}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                      {Object.entries(classSummaries).map(([std, stats]) => (
                        <Card 
                          key={std} 
                          onClick={() => handleTabChange(`std-${std}`)}
                          className="border-2 rounded-[2.5rem] p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden"
                        >
                          <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                              <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                                <GraduationCap className="w-8 h-8 text-primary group-hover:text-white" />
                              </div>
                              <Badge className="bg-primary text-white font-black text-lg px-4 py-1 rounded-full">Std {std}</Badge>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-end border-b border-dashed pb-2">
                                <span className="text-muted-foreground font-black text-[10px] uppercase">{t.totalStudents}</span>
                                <span className="text-3xl font-black text-primary">{stats.total}</span>
                              </div>
                              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>{stats.boys} {t.boysLabel}</span>
                                <span>{stats.girls} {t.girlsLabel}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-6 h-6 text-primary" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dashboard">
              <Dashboard store={schoolData} section={selectedSection} language={language} />
            </TabsContent>

            <TabsContent value="daily-report">
              <DailyReport store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="tournament">
              <TournamentRosters store={schoolData} />
            </TabsContent>

            <TabsContent value="archive">
              <History store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="registration">
              <Registration store={schoolData} section={selectedSection} language={language} />
            </TabsContent>

            <TabsContent value="attendance">
              <Attendance store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="fitness">
              <Fitness store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="sports-skills">
              <SportsSkills store={schoolData} />
            </TabsContent>

            <TabsContent value="drills">
              <SportsDrills store={schoolData} />
            </TabsContent>

            <TabsContent value="ai">
              <AIAdvice store={schoolData} />
            </TabsContent>

            <TabsContent value="health">
              <HealthIncidents store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="settings">
              <Settings language={language} setLanguage={setLanguage} />
            </TabsContent>

            {/* Class-wise Standard Registry Contents */}
            {[...Array(12)].map((_, i) => (
              <TabsContent key={i} value={`std-${i + 1}`}>
                <StandardRegistry store={schoolData} std={(i + 1).toString()} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
