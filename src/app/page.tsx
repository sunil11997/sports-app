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
  FileText,
  ClipboardList,
  User,
  Loader2,
  History as HistoryIcon,
  ArrowRight,
  GraduationCap,
  Medal,
  Star,
  Award,
  Crown,
  Dumbbell,
  UsersRound,
  ChevronRight,
  LayoutGrid,
  Zap,
  MapPin,
  Smartphone,
  UserPlus
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
import { History } from '@/components/features/History';
import { SchoolActivities } from '@/components/features/SchoolActivities';
import { ClassesHub } from '@/components/features/ClassesHub';

const translations = {
  English: {
    schoolName: "MY SPORTS APP",
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
    noAthletes: "No athletes registered yet.",
    registerFirst: "Please enroll students in the Register tab to see the Hall of Fame.",
    selectHub: "Select Management Section",
    sportsHubDesc: "Manage athletes, performance scores, and tournament rosters.",
    studentRegistryDesc: "Manage general student growth logs and physical registry.",
    enter: "ENTER HUB",
    institutionalStack: "PRO ATHLETIC STACK V3.0",
    tribalLogoHint: "OFFICIAL SPORTS MANAGEMENT SYSTEM",
    registrySummary: "Class Registry Overview",
    registryDesc: "Consolidated institutional enrollment counts across all standards.",
    totalStudents: "Total Enrollment",
    classWise: "Standard Breakdown",
    boysLabel: "Boys",
    girlsLabel: "Girls",
    classes: "Classes",
    activities: "Activities",
    reports: "Reports",
    installApp: "INSTALL AS MOBILE APP"
  },
  Marathi: {
    schoolName: "माय स्पोर्ट्स ॲप",
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
    noAthletes: "अजून कोणतेही खेळाडू नोंदणीकृत नाहीत.",
    registerFirst: "हॉल ऑफ फेम पाहण्यासाठी कृपया 'नोंदणी' टॅबमध्ये विद्यार्थी नोंदवा.",
    selectHub: "व्यवस्थापन विभाग निवडा",
    sportsHubDesc: "खेळाडू, कामगिरीचे गुण आणि स्पर्धा रोस्टर व्यवस्थापित करा.",
    studentRegistryDesc: "सामान्य विद्यार्थी वाढीचे लॉग आणि शारीरिक नोंदणी व्यवस्थापित करा.",
    enter: "प्रवेश करा",
    institutionalStack: "संस्थात्मक स्टॅक V3.0",
    tribalLogoHint: "शासकीय क्रीडा व्यवस्थापन प्रणाली",
    registrySummary: "विद्यार्थी नोंदणी सारांश",
    registryDesc: "सर्व इयत्तांमधील एकत्रित नोंदणी संख्या.",
    totalStudents: "एकूण नावनोंदणी",
    classWise: "इयत्तावार माहिती",
    boysLabel: "मुले",
    girlsLabel: "मुली",
    classes: "वर्ग",
    activities: "शालेय उपक्रम",
    reports: "अहवाल",
    installApp: "मोबाईल ॲप म्हणून इंस्टॉल करा"
  }
};

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [isTabChanging, setIsTabChanging] = useState(false);
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isInstallable, installApp } = usePWA();
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
    // Only show athletes in sports hall of fame
    const filtered = schoolData.data.players.filter(p => p.category === 'athlete');
    
    return [...filtered].map(p => {
      const fitness = schoolData.data.fitness[p.id] || { score: '0' };
      const skills = Object.values(schoolData.data.sportSkills).filter(s => s.playerId === p.id);
      const maxSkill = skills.length > 0 ? Math.max(...skills.map(s => parseFloat(s.score) || 0)) : 0;
      const performance = (parseFloat(fitness.score) || 0) + maxSkill;
      return { ...p, performance, fitnessScore: fitness.score, latestStatus: fitness.status };
    }).sort((a, b) => b.performance - a.performance);
  }, [schoolData.data.players, schoolData.data.fitness, schoolData.data.sportSkills]);

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
  const profile = schoolData.data.schoolProfile || {
    schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
    teacherName: "सुनिल देशमुख",
    taluka: "सटाणा",
    district: "नाशिक"
  };

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center mx-auto border shadow-2xl overflow-hidden ios-card-shadow ios-spring">
              {LOGO ? (
                <Image 
                  src={LOGO.imageUrl} 
                  alt="My Sports App Logo" 
                  width={110} 
                  height={110} 
                  className="object-contain p-4"
                  data-ai-hint="Sports Logo"
                />
              ) : (
                <Trophy className="w-16 h-16 text-primary" />
              )}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none px-4 uppercase">
                {t.schoolName}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-white/20" />
                <p className="text-accent font-black tracking-[0.4em] text-[11px] uppercase opacity-90">
                  {t.tribalLogoHint}
                </p>
                <div className="h-px w-12 bg-white/20" />
              </div>
            </div>
          </div>

          <div className="pt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 space-y-4">
            <Button 
              onClick={handleStartHub}
              className="group w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-2xl h-28 rounded-[2.5rem] shadow-2xl transition-all active:scale-[0.97]"
            >
              {t.enter}
              <ArrowRight className="ml-4 w-10 h-10 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            {isInstallable && (
              <Button 
                onClick={installApp}
                variant="outline"
                className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-md text-white font-black text-sm h-14 rounded-2xl shadow-lg active:scale-[0.97] uppercase tracking-widest hover:bg-white/10"
              >
                <Smartphone className="mr-3 w-5 h-5 text-accent" />
                {t.installApp}
              </Button>
            )}

            <div className="mt-12 flex flex-col items-center gap-2">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em]">
                {t.institutionalStack}
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/20" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || !schoolData.isLoaded) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <p className="font-black text-white tracking-[0.4em] uppercase text-xs animate-pulse">{t.loadingRegistry}</p>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 relative text-white">
        <div className="max-w-5xl w-full space-y-16 text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/10 text-accent font-black uppercase text-[10px] tracking-widest mb-4">
              <MapPin className="w-3 h-3" /> {profile.taluka}, {profile.district} • {profile.schoolName}
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none">
              {t.selectHub}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <button 
              onClick={() => handleSectionSelect('sports')}
              className="bg-zinc-900 border-2 border-white/5 rounded-[3.5rem] p-12 text-left transition-all hover:border-accent hover:shadow-2xl active:scale-[0.96] shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-[4rem] group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-accent rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform">
                  <Medal className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase mb-4 tracking-tight">{t.sportsHub}</h3>
                <p className="text-zinc-400 font-semibold text-xl leading-relaxed opacity-80">
                  {t.sportsHubDesc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-accent font-black uppercase text-sm tracking-widest group-hover:gap-4 transition-all">
                  Open Hub <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleSectionSelect('general')}
              className="bg-zinc-900 border-2 border-white/5 rounded-[3.5rem] p-12 text-left transition-all hover:border-white/20 hover:shadow-2xl active:scale-[0.96] shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[4rem] group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg group-hover:-rotate-12 transition-transform">
                  <GraduationCap className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase mb-4 tracking-tight">{t.studentRegistry}</h3>
                <p className="text-zinc-400 font-semibold text-xl leading-relaxed opacity-80">
                  {t.studentRegistryDesc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-white font-black uppercase text-sm tracking-widest group-hover:gap-4 transition-all">
                  Access Registry <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
          
          <div className="pt-8">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em]">ADMIN: {profile.teacherName}</p>
          </div>
        </div>
      </div>
    );
  }

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-accent bg-accent/10" },
    { id: "registration", label: t.register, icon: User, color: "text-emerald-400 bg-emerald-500/10" },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard, color: "text-purple-400 bg-purple-500/10" },
    { id: "tournament", label: t.tourney, icon: ClipboardList, color: "text-amber-400 bg-amber-500/10" },
    { id: "daily-report", label: t.report, icon: FileText, color: "text-rose-400 bg-rose-500/10" },
    { id: "archive", label: t.history, icon: HistoryIcon, color: "text-indigo-400 bg-indigo-500/10" },
    { id: "attendance", label: t.presence, icon: CalendarCheck, color: "text-teal-400 bg-teal-500/10" },
    { id: "fitness", label: t.fitness, icon: Activity, color: "text-orange-400 bg-orange-500/10" },
    { id: "sports-skills", label: t.skills, icon: Trophy, color: "text-yellow-400 bg-yellow-500/10" },
    { id: "drills", label: t.drills, icon: Dumbbell, color: "text-cyan-400 bg-cyan-500/10" },
    { id: "health", label: t.health, icon: Stethoscope, color: "text-red-400 bg-red-500/10" },
    { id: "ai", label: t.aiHub, icon: Sparkles, color: "text-fuchsia-400 bg-fuchsia-500/10" },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-accent bg-accent/10" },
    { id: "registration", label: t.enroll, icon: User, color: "text-emerald-400 bg-emerald-500/10" },
    { id: "classes", label: t.classes, icon: LayoutGrid, color: "text-indigo-400 bg-indigo-500/10" },
    { id: "activities", label: t.activities, icon: Zap, color: "text-amber-400 bg-amber-500/10" },
    { id: "daily-report", label: t.reports, icon: FileText, color: "text-rose-400 bg-rose-500/10" },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-[#000000] pb-20 md:pb-8 text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-accent p-2.5 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg active-scale">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={32} height={32} />
              ) : (
                <Trophy className="w-7 h-7 text-black" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase text-white leading-none tracking-tight">
                {selectedSection === 'sports' ? t.sportsHub : t.studentRegistry}
              </h1>
              <p className="text-[10px] font-black text-accent uppercase mt-1 tracking-widest">{profile.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4 text-right">
              <span className="text-[10px] font-black text-white uppercase leading-tight">{profile.teacherName}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase">{profile.taluka}, {profile.district}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedSection(null)}
              className="text-[10px] font-black text-white uppercase bg-white/5 hover:bg-white/10 rounded-full px-5 h-9 border border-white/10"
            >
              {t.switchHub}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-zinc-900/50 p-2 flex gap-3 rounded-2xl min-w-max border border-white/5 h-auto">
              {currentTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-xl px-6 py-4 font-black text-[12px] uppercase tracking-wider transition-all shadow-sm flex flex-col items-center gap-2 min-w-[110px]",
                    "data-[state=active]:shadow-xl data-[state=active]:scale-110 data-[state=active]:z-10 data-[state=active]:bg-accent data-[state=active]:text-black",
                    !activeTab.includes(tab.id) && tab.color
                  )}
                >
                  <tab.icon className="w-5 h-5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative min-h-[500px]">
            {isTabChanging && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-[3rem]">
                <Loader2 className="w-16 h-16 animate-spin text-accent" />
              </div>
            )}

            <TabsContent value="home" className="mt-0">
              {selectedSection === 'sports' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {bestPlayer ? (
                    <Card className="border-0 rounded-[4rem] shadow-2xl bg-zinc-900 overflow-hidden ios-spring">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative w-full aspect-[4/3] lg:aspect-auto min-h-[450px]">
                          {bestPlayer.photoUrl ? (
                            <Image 
                              src={bestPlayer.photoUrl} 
                              alt={bestPlayer.name} 
                              fill 
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                              <User className="w-32 h-32 text-zinc-700 opacity-20" />
                            </div>
                          )}
                          <div className="absolute top-10 left-10">
                            <Badge className="bg-yellow-400 text-black font-black text-xs px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border-4 border-black/20">
                              <Crown className="w-5 h-5" /> {t.performanceLeader}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-12 lg:p-24 flex flex-col justify-center space-y-10 bg-gradient-to-br from-zinc-900 to-black text-white relative">
                          <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Trophy className="w-80 h-80" />
                          </div>
                          
                          <div className="space-y-6 relative z-10">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-accent">{t.studentExcellence}</h3>
                            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-none">
                              {bestPlayer.name}
                            </h2>
                            <div className="flex flex-wrap gap-4 pt-4">
                              <Badge variant="outline" className="text-white border-white/40 font-black uppercase text-sm px-6 py-2 rounded-full backdrop-blur-md">
                                Std {bestPlayer.std}
                              </Badge>
                              <Badge className="bg-accent text-black font-black uppercase text-sm px-6 py-2 rounded-full shadow-lg">
                                Score: {bestPlayer.performance.toFixed(0)}
                              </Badge>
                              <Badge className="bg-white/10 text-white font-black uppercase text-sm px-6 py-2 rounded-full border-0">
                                Level: {bestPlayer.latestStatus || 'A'}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl relative z-10">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl">
                                <Award className="w-10 h-10 text-black" />
                              </div>
                              <h4 className="text-3xl font-black uppercase tracking-tight">{t.congratulations}</h4>
                            </div>
                            <p className="text-zinc-400 font-semibold text-xl leading-relaxed italic opacity-90">
                              "{t.excellenceDesc}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border-0 rounded-[4rem] shadow-sm bg-zinc-900/50 p-24 text-center space-y-6">
                      {schoolData.isLoaded ? (
                        <>
                          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                            <UserPlus className="w-10 h-10 text-accent opacity-20" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-2xl font-black text-white uppercase">{t.noAthletes}</h4>
                            <p className="text-zinc-500 font-medium max-w-sm mx-auto">{t.registerFirst}</p>
                          </div>
                          <Button onClick={() => handleTabChange('registration')} className="rounded-full px-8 bg-accent text-black font-black hover:bg-accent/90">
                            Go to Registration <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-6" />
                          <p className="font-black text-white uppercase tracking-[0.4em] text-sm">{t.loadingHallOfFame}</p>
                        </>
                      )}
                    </Card>
                  )}

                  {topPerformers.length > 0 && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between px-6">
                        <h3 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                          <Star className="w-10 h-10 text-accent fill-accent" /> {t.topSquadRanking}
                        </h3>
                        <p className="hidden md:block text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">{t.calculatedPerformanceHub}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                        {topPerformers.slice(1, 9).map((player, idx) => (
                          <Card key={player.id} className="border-2 border-white/5 rounded-[3.5rem] overflow-hidden hover:border-accent hover:shadow-2xl transition-all group active:scale-[0.95] shadow-xl bg-zinc-900">
                            <div className="relative aspect-square">
                              {player.photoUrl ? (
                                <Image src={player.photoUrl} alt={player.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                  <User className="w-16 h-16 text-zinc-600 opacity-20" />
                                </div>
                              )}
                              <div className="absolute top-6 left-6">
                                <Badge className="bg-black/95 text-accent font-black shadow-xl border-0 h-10 w-10 flex items-center justify-center p-0 rounded-2xl group-hover:bg-accent group-hover:text-black transition-colors">
                                  #{idx + 2}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-8 space-y-5">
                              <div className="space-y-1">
                                <h4 className="font-black text-white uppercase text-xl truncate">{player.name}</h4>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] opacity-60">Std {player.std} • {player.latestStatus || 'B'}</p>
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t border-dashed border-white/10">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fitness Index</span>
                                <span className="text-2xl font-black text-accent">{player.fitnessScore || '0'}%</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-gradient-to-br from-zinc-900 to-black p-16 rounded-[4rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
                    <div className="relative z-10 space-y-10">
                      <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10">
                          <UsersRound className="w-12 h-12 text-accent" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-6xl font-black uppercase tracking-tight">{t.registrySummary}</h2>
                          <p className="text-xl font-medium text-zinc-400 leading-relaxed max-w-xl">{t.registryDesc}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl space-y-3">
                          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">{t.totalStudents}</span>
                          <p className="text-6xl font-black text-white leading-none">{totalStudentCount}</p>
                        </div>
                        <div className="bg-emerald-500/10 backdrop-blur-md p-10 rounded-[3rem] border border-emerald-400/20 shadow-xl space-y-3">
                          <span className="text-[11px] font-black text-emerald-400/50 uppercase tracking-[0.4em]">{t.boysLabel}</span>
                          <p className="text-6xl font-black text-emerald-400 leading-none">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.boys, 0)}</p>
                        </div>
                        <div className="bg-accent/10 backdrop-blur-md p-10 rounded-[3rem] border border-accent/20 shadow-xl space-y-3">
                          <span className="text-[11px] font-black text-accent/50 uppercase tracking-[0.4em]">{t.girlsLabel}</span>
                          <p className="text-6xl font-black text-accent leading-none">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.girls, 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-[100px]" />
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-8">
                      <h3 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                        <ClipboardList className="w-10 h-10 text-accent" /> {t.classWise}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2">
                      {Object.entries(classSummaries).map(([std, stats]) => (
                        <Card 
                          key={std} 
                          onClick={() => handleTabChange(`classes`)}
                          className="border-2 border-white/5 rounded-[3.5rem] p-10 hover:border-accent transition-all cursor-pointer group active:scale-[0.96] shadow-xl bg-zinc-900 relative overflow-hidden ios-spring"
                        >
                          <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-start">
                              <div className="bg-white/5 p-5 rounded-[1.5rem] group-hover:bg-accent group-hover:text-black transition-all shadow-inner">
                                <GraduationCap className="w-10 h-10 text-white group-hover:text-black" />
                              </div>
                              <Badge className="bg-accent text-black font-black text-2xl px-6 py-2 rounded-full shadow-lg">Std {std}</Badge>
                            </div>
                            
                            <div className="space-y-5">
                              <div className="flex justify-between items-end border-b-2 border-dashed border-white/10 pb-3">
                                <span className="text-zinc-500 font-black text-[11px] uppercase tracking-widest">{t.totalStudents}</span>
                                <span className="text-4xl font-black text-white">{stats.total}</span>
                              </div>
                              <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest opacity-60">
                                <span>{stats.boys} {t.boysLabel}</span>
                                <span>{stats.girls} {t.girlsLabel}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                            <ChevronRight className="w-8 h-8 text-accent" />
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
              <DailyReport store={schoolData} />
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
              <HealthIncidents store={schoolData} />
            </TabsContent>

            <TabsContent value="activities">
              <SchoolActivities store={schoolData} />
            </TabsContent>

            <TabsContent value="classes">
              <ClassesHub store={schoolData} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
