"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Activity, 
  Trophy, 
  Stethoscope, 
  Sparkles,
  Home,
  FileText,
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
  UserPlus,
  User,
  Download,
  X,
  ClipboardList,
  ArrowUpCircle,
  Settings as SettingsIcon,
  Cake,
  PartyPopper,
  RefreshCcw,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { DashboardHomeSkeleton, StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';

// Dynamic Feature Loading with Retry-Ready Fallbacks
const Registration = dynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { ssr: false, loading: () => <TableSkeleton /> });
const Dashboard = dynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { ssr: false, loading: () => <TableSkeleton /> });
const Attendance = dynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { ssr: false, loading: () => <TableSkeleton /> });
const Fitness = dynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { ssr: false, loading: () => <TableSkeleton /> });
const SportsSkills = dynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { ssr: false, loading: () => <TableSkeleton /> });
const SportsDrills = dynamic(() => import('@/components/features/SportsDrills').then(mod => mod.SportsDrills), { ssr: false, loading: () => <TableSkeleton /> });
const HealthIncidents = dynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { ssr: false, loading: () => <TableSkeleton /> });
const AIAdvice = dynamic(() => import('@/components/features/AIAdvice').then(mod => mod.AIAdvice), { ssr: false, loading: () => <StatsSkeleton /> });
const DailyReport = dynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { ssr: false, loading: () => <TableSkeleton /> });
const TournamentRosters = dynamic(() => import('@/components/features/TournamentRosters').then(mod => mod.TournamentRosters), { ssr: false, loading: () => <TableSkeleton /> });
const History = dynamic(() => import('@/components/features/History').then(mod => mod.History), { ssr: false, loading: () => <TableSkeleton /> });
const SchoolActivities = dynamic(() => import('@/components/features/SchoolActivities').then(mod => mod.SchoolActivities), { ssr: false, loading: () => <TableSkeleton /> });
const ClassesHub = dynamic(() => import('@/components/features/ClassesHub').then(mod => mod.ClassesHub), { ssr: false, loading: () => <StatsSkeleton /> });
const ClassesSection = dynamic(() => import('@/components/features/ClassesSection').then(mod => mod.ClassesSection), { ssr: false, loading: () => <StatsSkeleton /> });
const Settings = dynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { ssr: false, loading: () => <StatsSkeleton /> });
const PromotionHub = dynamic(() => import('@/components/features/PromotionHub').then(mod => mod.PromotionHub), { ssr: false, loading: () => <StatsSkeleton /> });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
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
    settings: "Settings",
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
    institutionalStack: "ESTD. 1966 • V3.0 ENGINE",
    tribalLogoHint: "GOVT. SECONDARY ASHRAM SHALA",
    registrySummary: "Institutional Registry",
    registryDesc: "Consolidated enrollment counts across all standards.",
    totalStudents: "Total Enrollment",
    classWise: "Standard Breakdown",
    boysLabel: "Boys",
    girlsLabel: "Girls",
    classes: "Classes",
    exam: "Exam",
    activities: "Activities",
    reports: "Reports",
    installApp: "INSTALL MOBILE APP",
    installBanner: "Install Sports App for a better experience",
    promotionHub: "Promotion Hub",
    promoteNext: "Transfer to Next Std",
    promoteDesc: "Move selected students to their next academic standard.",
    selectAll: "Select All",
    graduated: "Graduated",
    birthdayToday: "Today's Birthdays",
    happyBirthday: "Happy Birthday!",
    noBirthdays: "No birthdays today.",
    academicYear: "Academic Year",
    archiveMode: "Viewing Archived Data"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
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
    settings: "सेटिंग्ज",
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
    institutionalStack: "स्थापना १९६६ • स्टॅक V3.0",
    tribalLogoHint: "शासकीय माध्यमिक आश्रमशाळा",
    registrySummary: "विद्यार्थी नोंदणी सारांश",
    registryDesc: "सर्व इयत्तांमधील एकत्रित नोंदणी संख्या.",
    totalStudents: "एकूण नावनोंदणी",
    classWise: "इयत्तावार माहिती",
    boysLabel: "मुले",
    girlsLabel: "मुली",
    classes: "वर्ग",
    exam: "परीक्षा",
    activities: "शालेय उपक्रम",
    reports: "अहवाल",
    installApp: "मोबाईल ॲप इंस्टॉल करा",
    installBanner: "चांगल्या अनुभवासाठी स्पोर्ट्स ॲप इंस्टॉल करा",
    promotionHub: "बढती केंद्र",
    promoteNext: "पुढील इयत्तेत वर्ग करा",
    promoteDesc: "निवडलेल्या विद्यार्थ्यांना त्यांच्या पुढील शैक्षणिक इयत्तेत हलवा.",
    selectAll: "सर्व निवडा",
    graduated: "उत्तीर्ण / शाळा सोडली",
    birthdayToday: "आजचे वाढदिवस",
    happyBirthday: "वादिवसाच्या हार्दिक शुभेच्छा!",
    noBirthdays: "आज कोणाचाही वाढदिवस नाही.",
    academicYear: "शैक्षणिक वर्ष",
    archiveMode: "आर्काइव्ह माहिती पहात आहात"
  }
};

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [todayDate, setTodayDate] = useState<Date | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isInstallable, installApp } = usePWA();
  const auth = useAuth();

  const t = translations[language];
  const LOGO_INAPP = "/icon-512.png"; // High-res for in-app identity

  // 1. CHUNK LOAD ERROR RESILIENCE
  useEffect(() => {
    const handleChunkError = (e: ErrorEvent) => {
      // Specifically target chunk load failures which common in unstable networks or after deployment
      if (e.message?.includes('Loading chunk') || e.message?.includes('ChunkLoadError')) {
        console.warn('Network interruption detected. Auto-refreshing for stability.');
        window.location.reload();
      }
    };
    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  // Background initialization
  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    setTodayDate(new Date());
  }, []);

  const handleStartHub = () => {
    setIsEntered(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSectionSelect = (section: 'sports' | 'general') => {
    setSelectedSection(section);
    setActiveTab("home"); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const todayBirthdays = useMemo(() => {
    if (!todayDate || !schoolData.data.players) return [];
    const currentMonth = todayDate.getMonth() + 1;
    const currentDay = todayDate.getDate();

    return schoolData.data.players.filter(p => {
      if (!p.dob) return false;
      const dobDate = new Date(p.dob);
      return (dobDate.getMonth() + 1 === currentMonth) && (dobDate.getDate() === currentDay);
    });
  }, [schoolData.data.players, todayDate]);

  const topPerformers = useMemo(() => {
    if (!schoolData.data.players || !schoolData.isLoaded) return [];
    const filtered = schoolData.data.players.filter(p => p.category === 'athlete');
    
    return [...filtered].map(p => {
      const fitness = schoolData.data.fitness[p.id] || { score: '0' };
      const skills = Object.values(schoolData.data.sportSkills).filter(s => s.playerId === p.id);
      const maxSkill = skills.length > 0 ? Math.max(...skills.map(s => parseFloat(s.score) || 0)) : 0;
      const performance = (parseFloat(fitness.score) || 0) + maxSkill;
      return { ...p, performance, fitnessScore: fitness.score, latestStatus: fitness.status };
    }).sort((a, b) => b.performance - a.performance);
  }, [schoolData.data.players, schoolData.data.fitness, schoolData.data.sportSkills, schoolData.isLoaded]);

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

  const totalStudentCount = useMemo(() => 
    Object.values(classSummaries).reduce((acc, curr) => acc + curr.total, 0),
  [classSummaries]);

  const bestPlayer = topPerformers[0];
  const profile = schoolData.data.schoolProfile;

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-xl w-full text-center space-y-10 relative z-10">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-52 h-52 bg-white rounded-full flex items-center justify-center mx-auto border-4 border-accent shadow-2xl overflow-hidden active-scale group p-4">
              <div className="relative w-full h-full">
                <Image 
                  src={LOGO_INAPP} 
                  alt="Sports App Logo" 
                  width={200}
                  height={200}
                  priority
                  unoptimized
                  className="object-contain group-hover:scale-110 transition-transform duration-700 w-full h-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight px-4 uppercase">
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
    { id: "settings", label: t.settings, icon: SettingsIcon, color: "text-slate-600 bg-slate-50" },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-primary bg-primary/5" },
    { id: "registration", label: t.enroll, icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard, color: "text-purple-600 bg-purple-50" },
    { id: "promotion", label: t.promotionHub, icon: ArrowUpCircle, color: "text-blue-600 bg-blue-50" },
    { id: "exam", label: t.exam, icon: ClipboardList, color: "text-amber-600 bg-amber-50" },
    { id: "classes", label: t.classes, icon: LayoutGrid, color: "text-indigo-600 bg-indigo-50" },
    { id: "activities", label: t.activities, icon: Zap, color: "text-purple-600 bg-purple-50" },
    { id: "daily-report", label: t.reports, icon: FileText, color: "text-rose-600 bg-rose-50" },
    { id: "settings", label: t.settings, icon: SettingsIcon, color: "text-slate-600 bg-slate-50" },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-muted/10 pb-12">
      {isInstallable && showInstallBanner && (
        <div className="bg-primary text-white p-3 flex justify-between items-center animate-in slide-in-from-top duration-500 sticky top-0 z-[60] shadow-lg">
          <div className="flex items-center gap-3 ml-2">
            <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider">{t.installBanner}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={installApp} 
              size="sm" 
              className="bg-white text-primary font-black text-[10px] h-8 px-5 rounded-full hover:bg-white/90 shadow-lg active-scale"
            >
              INSTALL
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInstallBanner(false)} 
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <header className={cn(
        "sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border py-4 px-6 shadow-sm transition-all",
        isInstallable && showInstallBanner ? "top-[52px]" : "top-0"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-white p-1 rounded-full w-14 h-14 flex items-center justify-center shadow-lg border border-accent overflow-hidden relative">
              <Image src={LOGO_INAPP} alt="Logo" width={48} height={48} unoptimized className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase text-primary leading-none tracking-tight">
                  {selectedSection === 'sports' ? t.sportsHub : t.studentRegistry}
                </h1>
                {!schoolData.isLoaded && (
                  <RefreshCcw className="w-3 h-3 text-accent animate-spin" />
                )}
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-widest truncate max-w-[150px] md:max-w-[200px]">{profile.schoolName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-2xl border shadow-inner">
              <div className="hidden md:flex items-center gap-1 text-[9px] font-black text-primary uppercase pl-3 pr-1">
                <CalendarDays className="w-3 h-3" /> {t.session}
              </div>
              <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
                <SelectTrigger className="h-10 md:h-9 border-0 bg-transparent font-black uppercase text-[10px] tracking-widest focus:ring-0 w-[110px] md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25" className="text-[10px] font-bold">2024-25</SelectItem>
                  <SelectItem value="2023-24" className="text-[10px] font-bold">Archive 23-24</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedSection(null)}
                className="text-[9px] font-black uppercase bg-white rounded-full h-10 md:h-8 px-4 border-border hover:bg-muted"
              >
                {t.switchHub}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {schoolData.selectedYear !== "2024-25" && (
        <div className="bg-amber-100 border-b border-amber-200 py-2 text-center sticky z-40" style={{ top: (isInstallable && showInstallBanner ? 122 : 72) }}>
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <HistoryIcon className="w-3 h-3" /> {t.archiveMode}: {schoolData.selectedYear}
          </p>
        </div>
      )}

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

          <div className="relative min-h-[60vh]">
            <TabsContent value="home" className="mt-0">
              {!schoolData.isLoaded ? (
                selectedSection === 'sports' ? <DashboardHomeSkeleton /> : <StatsSkeleton />
              ) : selectedSection === 'sports' ? (
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
                  {todayBirthdays.length > 0 && (
                    <Card className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                        <PartyPopper className="w-48 h-48 text-white" />
                      </div>
                      <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-md shadow-inner">
                          <Cake className="w-16 h-16 text-white" />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">{t.happyBirthday}</h2>
                          <p className="text-white/80 font-black uppercase text-xs tracking-[0.3em]">{t.birthdayToday}</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                            {todayBirthdays.map(p => (
                              <Badge key={p.id} className="bg-white text-rose-600 font-black uppercase text-sm px-6 py-2 rounded-full shadow-lg border-0 hover:scale-105 transition-transform">
                                {p.name} (Std {p.std})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                              <span className="text-8px font-black text-muted-foreground uppercase">Total</span>
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

            {/* Content Tabs */}
            <TabsContent value="dashboard" className="mt-0">
              {activeTab === "dashboard" && <Dashboard store={schoolData} section={selectedSection} language={language} t={t} />}
            </TabsContent>

            <TabsContent value="promotion" className="mt-0">
              {activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection} />}
            </TabsContent>

            <TabsContent value="daily-report" className="mt-0">
              {activeTab === "daily-report" && <DailyReport store={schoolData} />}
            </TabsContent>

            <TabsContent value="tournament" className="mt-0">
              {activeTab === "tournament" && <TournamentRosters store={schoolData} />}
            </TabsContent>

            <TabsContent value="archive" className="mt-0">
              {activeTab === "archive" && <History store={schoolData} section={selectedSection} />}
            </TabsContent>

            <TabsContent value="registration" className="mt-0">
              {activeTab === "registration" && <Registration store={schoolData} section={selectedSection} language={language} />}
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              {activeTab === "attendance" && <Attendance store={schoolData} section={selectedSection} />}
            </TabsContent>

            <TabsContent value="fitness" className="mt-0">
              {activeTab === "fitness" && <Fitness store={schoolData} section={selectedSection} />}
            </TabsContent>

            <TabsContent value="sports-skills" className="mt-0">
              {activeTab === "sports-skills" && <SportsSkills store={schoolData} />}
            </TabsContent>

            <TabsContent value="drills" className="mt-0">
              {activeTab === "drills" && <SportsDrills store={schoolData} />}
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              {activeTab === "ai" && <AIAdvice store={schoolData} />}
            </TabsContent>

            <TabsContent value="health" className="mt-0">
              {activeTab === "health" && <HealthIncidents store={schoolData} />}
            </TabsContent>

            <TabsContent value="activities" className="mt-0">
              {activeTab === "activities" && <SchoolActivities store={schoolData} />}
            </TabsContent>

            <TabsContent value="classes" className="mt-0">
              {activeTab === "classes" && <ClassesSection store={schoolData} />}
            </TabsContent>

            <TabsContent value="exam" className="mt-0">
              {activeTab === "exam" && <ClassesHub store={schoolData} />}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              {activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
