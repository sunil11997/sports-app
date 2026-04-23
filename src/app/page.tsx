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
    schoolName: "SPORTS APP",
    sportsHub: "Sports Hub",
    studentRegistry: "Student Registry",
    switchHub: "Switch Hub",
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
    excellenceDesc: "Outstanding performance in technical skills and physical assessment tests.",
    topSquadRanking: "Top Squad Ranking",
    calculatedPerformanceHub: "Performance Analysis Hub",
    loadingRegistry: "Syncing Registry...",
    loadingHallOfFame: "Loading Hall of Fame...",
    noAthletes: "No athletes registered yet.",
    registerFirst: "Please enroll students in the Register tab.",
    selectHub: "Management Portal",
    sportsHubDesc: "Manage athletes, performance scores, and tournaments.",
    studentRegistryDesc: "Manage academic registries and growth logs.",
    enter: "GET STARTED",
    institutionalStack: "V3.0 PERFORMANCE ENGINE",
    tribalLogoHint: "OFFICIAL SPORTS SYSTEM",
    registrySummary: "Institutional Registry",
    registryDesc: "Consolidated enrollment counts across all standards.",
    totalStudents: "Total Enrollment",
    classWise: "Standard Breakdown",
    boysLabel: "Boys",
    girlsLabel: "Girls",
    classes: "Classes",
    activities: "Activities",
    reports: "Reports",
    installApp: "INSTALL MOBILE APP"
  },
  Marathi: {
    schoolName: "स्पोर्ट्स ॲप",
    sportsHub: "क्रीडा केंद्र",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
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
    excellenceDesc: "तांत्रिक कौशल्ये आणि शारीरिक मूल्यमापन चाचण्यांमध्ये उत्कृष्ट कामगिरी.",
    topSquadRanking: "अव्वल संघ रँकिंग",
    calculatedPerformanceHub: "कार्यप्रदर्शन केंद्र",
    loadingRegistry: "रजिस्ट्री सिंक होत आहे...",
    loadingHallOfFame: "हॉल ऑफ फेम लोड होत आहे...",
    noAthletes: "अजून कोणतेही खेळाडू नोंदणीकृत नाहीत.",
    registerFirst: "नोंदणी टॅबमध्ये विद्यार्थी नोंदवा.",
    selectHub: "व्यवस्थापन विभाग निवडा",
    sportsHubDesc: "खेळाडू, कामगिरीचे गुण आणि स्पर्धा व्यवस्थापित करा.",
    studentRegistryDesc: "सामान्य विद्यार्थी वाढीचे लॉग आणि नोंदणी व्यवस्थापित करा.",
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
    installApp: "मोबाईल ॲप इंस्टॉल करा"
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

  const handleStartHub = () => setIsEntered(true);

  const handleSectionSelect = (section: 'sports' | 'general') => {
    setSelectedSection(section);
    setActiveTab("home"); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setIsTabChanging(true);
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsTabChanging(false), 150);
  };

  const topPerformers = useMemo(() => {
    if (!schoolData.data.players) return [];
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
  const profile = schoolData.data.schoolProfile;

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-xl w-full text-center space-y-10 relative z-10">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-accent shadow-xl overflow-hidden active-scale">
              {LOGO ? (
                <Image 
                  src={LOGO.imageUrl} 
                  alt="Sports App Logo" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              ) : (
                <Trophy className="w-12 h-12 text-primary" />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-primary tracking-tight leading-none px-4 uppercase">
                {t.schoolName}
              </h1>
              <p className="text-muted-foreground font-black tracking-[0.4em] text-[10px] uppercase">
                {t.tribalLogoHint}
              </p>
            </div>
          </div>

          <div className="pt-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 space-y-4">
            <Button 
              onClick={handleStartHub}
              className="group w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl h-20 rounded-[1.5rem] shadow-xl transition-all active-scale"
            >
              {t.enter}
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {isInstallable && (
              <Button 
                onClick={installApp}
                variant="outline"
                className="w-full border-2 border-primary/10 bg-white text-primary font-black text-xs h-12 rounded-xl active-scale uppercase tracking-widest hover:bg-muted"
              >
                <Smartphone className="mr-2 w-4 h-4" />
                {t.installApp}
              </Button>
            )}

            <p className="text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.5em] pt-8">
              {t.institutionalStack}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || !schoolData.isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
          <p className="font-black text-muted-foreground tracking-widest uppercase text-xs animate-pulse">{t.loadingRegistry}</p>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-4xl w-full space-y-12 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-border text-primary font-black uppercase text-[10px] tracking-widest mb-2 shadow-sm">
              <MapPin className="w-3 h-3 text-accent" /> {profile.taluka}, {profile.district} • {profile.schoolName}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tight leading-none">
              {t.selectHub}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => handleSectionSelect('sports')}
              className="bg-white border-2 border-transparent rounded-[2.5rem] p-10 text-left transition-all hover:border-accent hover:shadow-2xl active-scale shadow-lg group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[3rem] group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform">
                  <Medal className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-3xl font-black text-primary uppercase mb-3 tracking-tight">{t.sportsHub}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed opacity-80">
                  {t.sportsHubDesc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-accent font-black uppercase text-[10px] tracking-widest">
                  Open Portal <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleSectionSelect('general')}
              className="bg-white border-2 border-transparent rounded-[2.5rem] p-10 text-left transition-all hover:border-primary/20 hover:shadow-2xl active-scale shadow-lg group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:-rotate-6 transition-transform">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-black text-primary uppercase mb-3 tracking-tight">{t.studentRegistry}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed opacity-80">
                  {t.studentRegistryDesc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                  Access Registry <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-primary bg-primary/5" },
    { id: "registration", label: t.register, icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard, color: "text-purple-600 bg-purple-50" },
    { id: "tournament", label: t.tourney, icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { id: "attendance", label: t.presence, icon: CalendarCheck, color: "text-teal-600 bg-teal-50" },
    { id: "fitness", label: t.fitness, icon: Activity, color: "text-orange-600 bg-orange-50" },
    { id: "sports-skills", label: t.skills, icon: Medal, color: "text-yellow-600 bg-yellow-50" },
    { id: "drills", label: t.drills, icon: Dumbbell, color: "text-cyan-600 bg-cyan-50" },
    { id: "health", label: t.health, icon: Stethoscope, color: "text-red-600 bg-red-50" },
    { id: "daily-report", label: t.report, icon: FileText, color: "text-rose-600 bg-rose-50" },
    { id: "archive", label: t.history, icon: HistoryIcon, color: "text-indigo-600 bg-indigo-50" },
    { id: "ai", label: t.aiHub, icon: Sparkles, color: "text-fuchsia-600 bg-fuchsia-50" },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-primary bg-primary/5" },
    { id: "registration", label: t.enroll, icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
    { id: "classes", label: t.classes, icon: LayoutGrid, color: "text-indigo-600 bg-indigo-50" },
    { id: "activities", label: t.activities, icon: Zap, color: "text-amber-600 bg-amber-50" },
    { id: "daily-report", label: t.reports, icon: FileText, color: "text-rose-600 bg-rose-50" },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-muted/10 pb-12">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-accent p-2 rounded-xl w-10 h-10 flex items-center justify-center shadow-sm">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={28} height={28} />
              ) : (
                <Trophy className="w-6 h-6 text-black" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? t.sportsHub : t.studentRegistry}
              </h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-widest truncate max-w-[200px]">{profile.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[10px] font-black text-primary uppercase">{profile.teacherName}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase">{profile.taluka}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedSection(null)}
              className="text-[9px] font-black uppercase bg-white rounded-full h-8 px-4 border-border hover:bg-muted"
            >
              {t.switchHub}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white p-1 flex gap-2 rounded-2xl min-w-max border border-border h-auto shadow-sm">
              {currentTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 min-w-[90px]",
                    "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active-scale",
                    !activeTab.includes(tab.id) && tab.color
                  )}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative">
            {isTabChanging && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[2rem]">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
              </div>
            )}

            <TabsContent value="home" className="mt-0">
              {selectedSection === 'sports' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {bestPlayer ? (
                    <Card className="border-0 rounded-[2.5rem] shadow-xl bg-white overflow-hidden ios-spring">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative aspect-[4/3] lg:aspect-auto min-h-[350px]">
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
                              <User className="w-24 h-24 text-muted-foreground/20" />
                            </div>
                          )}
                          <div className="absolute top-6 left-6">
                            <Badge className="bg-accent text-black font-black text-[10px] px-6 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white/50">
                              <Crown className="w-4 h-4" /> {t.performanceLeader}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-10 lg:p-16 flex flex-col justify-center space-y-8 bg-white border-l border-border">
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">{t.studentExcellence}</h3>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none text-primary">
                              {bestPlayer.name}
                            </h2>
                            <div className="flex flex-wrap gap-3 pt-2">
                              <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase text-[10px] px-4 py-1 rounded-full">
                                Std {bestPlayer.std}
                              </Badge>
                              <Badge className="bg-primary text-white font-black uppercase text-[10px] px-4 py-1 rounded-full shadow-sm">
                                Score: {bestPlayer.performance.toFixed(0)}
                              </Badge>
                              <Badge className="bg-muted text-muted-foreground font-black uppercase text-[10px] px-4 py-1 rounded-full border-0">
                                Level: {bestPlayer.latestStatus || 'A'}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-muted/50 p-8 rounded-[2rem] border border-border space-y-4 shadow-inner">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-md">
                                <Award className="w-7 h-7 text-black" />
                              </div>
                              <h4 className="text-2xl font-black uppercase tracking-tight text-primary">{t.congratulations}</h4>
                            </div>
                            <p className="text-muted-foreground font-semibold text-lg leading-relaxed italic">
                              "{t.excellenceDesc}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border-2 border-dashed rounded-[2.5rem] shadow-sm bg-white p-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-primary uppercase">{t.noAthletes}</h4>
                        <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">{t.registerFirst}</p>
                      </div>
                      <Button onClick={() => handleTabChange('registration')} className="rounded-full px-8 bg-primary text-white font-black">
                        Go to Registration
                      </Button>
                    </Card>
                  )}

                  {topPerformers.length > 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                          <Star className="w-6 h-6 text-accent fill-accent" /> {t.topSquadRanking}
                        </h3>
                        <p className="hidden md:block text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{t.calculatedPerformanceHub}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {topPerformers.slice(1, 11).map((player, idx) => (
                          <Card key={player.id} className="border-2 border-transparent rounded-[2rem] overflow-hidden hover:border-accent shadow-lg bg-white group active-scale">
                            <div className="relative aspect-square">
                              {player.photoUrl ? (
                                <Image src={player.photoUrl} alt={player.name} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <User className="w-10 h-10 text-muted-foreground/20" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-black/80 text-accent font-black shadow-lg border-0 h-8 w-8 flex items-center justify-center p-0 rounded-lg">
                                  #{idx + 2}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-5 space-y-3">
                              <div className="space-y-0.5">
                                <h4 className="font-black text-primary uppercase text-sm truncate">{player.name}</h4>
                                <p className="text-[9px] font-black text-muted-foreground uppercase">Std {player.std} • {player.latestStatus || 'B'}</p>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-muted">
                                <span className="text-[8px] font-black text-muted-foreground uppercase">Fitness</span>
                                <span className="text-sm font-black text-primary">{player.fitnessScore || '0'}%</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-border">
                    <div className="relative z-10 space-y-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <UsersRound className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">{t.registrySummary}</h2>
                          <p className="text-sm font-medium text-muted-foreground max-w-xl">{t.registryDesc}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-muted/30 p-8 rounded-3xl border border-border shadow-inner space-y-2">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{t.totalStudents}</span>
                          <p className="text-5xl font-black text-primary leading-none">{totalStudentCount}</p>
                        </div>
                        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-2">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">{t.boysLabel}</span>
                          <p className="text-5xl font-black text-emerald-700 leading-none">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.boys, 0)}</p>
                        </div>
                        <div className="bg-accent/10 p-8 rounded-3xl border border-accent/20 shadow-sm space-y-2">
                          <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em]">{t.girlsLabel}</span>
                          <p className="text-5xl font-black text-primary leading-none">{Object.values(classSummaries).reduce((acc, curr) => acc + curr.girls, 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-accent" /> {t.classWise}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 px-1">
                      {Object.entries(classSummaries).map(([std, stats]) => (
                        <Card 
                          key={std} 
                          onClick={() => handleTabChange(`classes`)}
                          className="border-2 border-transparent rounded-[2rem] p-6 hover:border-primary shadow-lg bg-white transition-all cursor-pointer group active-scale"
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="bg-muted p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                <GraduationCap className="w-6 h-6" />
                              </div>
                              <Badge className="bg-accent text-black font-black text-lg px-3 py-0.5 rounded-lg shadow-sm">Std {std}</Badge>
                            </div>
                            <div className="flex justify-between items-end border-b border-muted pb-2">
                              <span className="text-[8px] font-black text-muted-foreground uppercase">Total</span>
                              <span className="text-2xl font-black text-primary">{stats.total}</span>
                            </div>
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
