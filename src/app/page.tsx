
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Activity, 
  Trophy, 
  Sparkles, 
  Home, 
  GraduationCap, 
  Medal, 
  UserPlus, 
  LayoutGrid, 
  Zap, 
  Settings as SettingsIcon, 
  ArrowUpCircle, 
  Cake, 
  Menu,
  ChevronLeft,
  Loader2,
  FileText,
  HeartPulse,
  ClipboardList,
  TrendingUp,
  Video,
  Dumbbell,
  UsersRound,
  ArrowRight,
  ShieldCheck,
  Flame,
  Globe,
  BarChart3,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePWA } from '@/components/providers/pwa-provider';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';

// Dynamic Feature Loading
const Registration = dynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { ssr: false, loading: () => <TableSkeleton /> });
const Dashboard = dynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { ssr: false, loading: () => <TableSkeleton /> });
const Attendance = dynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { ssr: false, loading: () => <TableSkeleton /> });
const Fitness = dynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { ssr: false, loading: () => <TableSkeleton /> });
const AIAdvice = dynamic(() => import('@/components/features/AIAdvice').then(mod => mod.AIAdvice), { ssr: false, loading: () => <StatsSkeleton /> });
const TournamentRosters = dynamic(() => import('@/components/features/TournamentRosters').then(mod => mod.TournamentRosters), { ssr: false, loading: () => <TableSkeleton /> });
const ClassesSection = dynamic(() => import('@/components/features/ClassesSection').then(mod => mod.ClassesSection), { ssr: false, loading: () => <StatsSkeleton /> });
const Settings = dynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { ssr: false, loading: () => <StatsSkeleton /> });
const PromotionHub = dynamic(() => import('@/components/features/PromotionHub').then(mod => mod.PromotionHub), { ssr: false, loading: () => <StatsSkeleton /> });
const SportsSkills = dynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { ssr: false, loading: () => <TableSkeleton /> });
const DailyReport = dynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { ssr: false, loading: () => <TableSkeleton /> });
const SportsDrills = dynamic(() => import('@/components/features/SportsDrills').then(mod => mod.SportsDrills), { ssr: false, loading: () => <TableSkeleton /> });
const HealthIncidents = dynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { ssr: false, loading: () => <TableSkeleton /> });
const PersonalDashboard = dynamic(() => import('@/components/features/History').then(mod => mod.History), { ssr: false, loading: () => <TableSkeleton /> });
const SchoolActivities = dynamic(() => import('@/components/features/SchoolActivities').then(mod => mod.SchoolActivities), { ssr: false, loading: () => <TableSkeleton /> });
const CoreHub = dynamic(() => import('@/components/features/CoreHub').then(mod => mod.CoreHub), { ssr: false, loading: () => <TableSkeleton /> });
const Teams = dynamic(() => import('@/components/features/Teams').then(mod => mod.Teams), { ssr: false, loading: () => <TableSkeleton /> });
const ExamsHub = dynamic(() => import('@/components/features/ExamsHub').then(mod => mod.ExamsHub), { ssr: false, loading: () => <TableSkeleton /> });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    sportsHub: "Sports Excellence",
    studentRegistry: "Student Registry",
    switchHub: "Switch Hub",
    home: "Home", register: "Enroll", roster: "List", promote: "Next Year", tourney: "Tourney", teams: "Teams", report: "Report", history: "Dashboard", presence: "Attendance", fitness: "Tests", skills: "Skills", drills: "Coach", health: "Health", aiHub: "AI Hub", settings: "Settings", enroll: "Enroll", registry: "Registry", exams: "Exams", session: "Session", activities: "Activities",
    coreHub: "Core Hub",
    enter: "ACCESS INSTITUTIONAL HUB", googleLogin: "LOGIN WITH GOOGLE", syncNote: "Registry available on this device", onlineStatus: "Online", offlineStatus: "Local",
    installApp: "INSTALL NATIVE HUB"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा विभाग",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    home: "मुख्यपृष्ठ", register: "नोंदणी", roster: "यादी", promote: "प्रमोशन", tourney: "स्पर्धा", teams: "संघ", report: "अहवाल", history: "डॅशबोर्ड", presence: "उपस्थिती", fitness: "चाचणी", skills: "कौशल्ये", drills: "कोचिंग", health: "आरोग्य", aiHub: "AI केंद्र", settings: "सेटिंग्ज", enroll: "नावनोंदणी", registry: "नोंदणी वही", exams: "परीक्षा", session: "सत्र", activities: "उपक्रम",
    coreHub: "प्रशिक्षण",
    enter: "हब मध्ये प्रवेश करा", googleLogin: "गूगल द्वारे लॉगिन करा", syncNote: "डेटा या डिव्हाइसवर उपलब्ध असेल", onlineStatus: "ऑनलाइन", offlineStatus: "ऑफलाइन",
    installApp: "ॲप इन्स्टॉल करा"
  }
};

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isOnline, isInstallable, installApp } = usePWA();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      const timer = setTimeout(() => {
        initiateAnonymousSignIn(auth);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, auth]);

  const t = translations[language];
  const LOGO_PATH = "/icon-512.png";

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.register, icon: UserPlus },
    { id: "core", label: t.coreHub, icon: Video },
    { id: "history", label: t.history, icon: BarChart3 },
    { id: "tournament", label: t.tourney, icon: Trophy },
    { id: "teams", label: t.teams, icon: UsersRound },
    { id: "fitness", label: t.fitness, icon: Activity },
    { id: "skills", label: t.skills, icon: Medal },
    { id: "drills", label: t.drills, icon: Dumbbell },
    { id: "attendance", label: t.presence, icon: CalendarCheck },
    { id: "ai", label: t.aiHub, icon: Sparkles },
    { id: "report", label: t.report, icon: FileText },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.enroll, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard },
    { id: "history", label: t.history, icon: BarChart3 },
    { id: "classes", label: t.registry, icon: LayoutGrid },
    { id: "exams", label: t.exams, icon: FileText },
    { id: "attendance", label: t.presence, icon: CalendarCheck },
    { id: "fitness", label: t.fitness, icon: Activity },
    { id: "activities", label: t.activities, icon: ClipboardList },
    { id: "health", label: t.health, icon: HeartPulse },
    { id: "promotion", label: t.promote, icon: ArrowUpCircle },
    { id: "report", label: t.report, icon: FileText },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const birthdaysToday = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    return schoolData.data.players.filter(p => {
      if (!p.dob) return false;
      const d = new Date(p.dob);
      return (d.getMonth() + 1) === currentMonth && d.getDate() === currentDay;
    });
  }, [schoolData.data.players]);

  // INSTANT INSTITUTIONAL SPLASH: Replaced placeholder icon with full logo
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="relative z-10 space-y-8 animate-pulse text-center">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] mx-auto shadow-2xl flex items-center justify-center group border-4 border-white/20 overflow-hidden relative">
             <Image src={LOGO_PATH} alt="Institutional Logo" fill priority unoptimized className="object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tighter uppercase">WGB Sports Hub</h1>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em]">Institutional Registry Booting</p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto opacity-20" />
          <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.3em]">Initializing Registry</p>
        </div>
      </div>
    );
  }

  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.03] rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <div className="w-32 h-32 bg-white p-6 rounded-[3rem] shadow-2xl mx-auto border-2 border-primary/5 flex items-center justify-center group hover:scale-105 transition-transform duration-500">
              <Image src={LOGO_PATH} alt="App Logo" width={100} height={100} priority unoptimized className="object-contain" />
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/10 mb-2">
                <Flame className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Excellence</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight uppercase">
                {language === 'Marathi' ? "शासकीय माध्यमिक" : "ASHRAM SHALA"}<br/>
                <span className="text-accent">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "WAGHAMBA HUB"}</span>
              </h1>
              <p className="text-sm md:text-lg font-medium text-muted-foreground max-w-md mx-auto uppercase tracking-widest opacity-60">
                {language === 'Marathi' ? "डिजिटल व्यवस्थापन आणि क्रीडा केंद्र" : "Digital Management & Sports Hub"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Button 
              onClick={() => setStage('selector')}
              className="h-20 rounded-[2rem] bg-primary text-white text-lg font-black uppercase tracking-widest shadow-2xl hover:bg-primary/90 transition-all active-scale group"
            >
              {t.enter} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {isInstallable && (
              <Button 
                onClick={installApp}
                variant="outline"
                className="h-14 rounded-2xl border-2 border-primary text-primary font-black uppercase tracking-widest active-scale group"
              >
                <Download className="mr-2 w-5 h-5 animate-bounce" /> {t.installApp}
              </Button>
            )}

            <div className="flex items-center justify-center gap-4">
               <button 
                 onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')}
                 className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2"
               >
                 <Globe className="w-4 h-4" /> {language === 'English' ? 'Switch to Marathi' : 'English मध्ये बदला'}
               </button>
            </div>
          </div>

          <div className="pt-12 flex items-center justify-center gap-2 opacity-30">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">
              Authorized Institutional Registry • v3.1 Powered by Genkit
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'selector') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-6">
            <button onClick={() => setStage('landing')} className="w-16 h-16 bg-white p-3 rounded-2xl shadow-xl mx-auto border border-primary/5 active-scale mb-4">
              <Image src={LOGO_PATH} alt="App Logo" width={48} height={48} priority unoptimized className="object-contain" />
            </button>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{t.schoolName}</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-60">Digital Management Suite</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => { setSelectedSection('sports'); setStage('hub'); setActiveTab('home'); }} 
              className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors duration-500">
                  <Medal className="w-12 h-12 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Competitive Training & Coaching</p>
              </div>
            </button>

            <button 
              onClick={() => { setSelectedSection('general'); setStage('hub'); setActiveTab('home'); }} 
              className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors duration-500">
                  <GraduationCap className="w-12 h-12 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.studentRegistry}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Academic & Physical Ed Profile</p>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 pt-8">
            <Button variant="ghost" onClick={() => setStage('landing')} className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Entrance
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] animate-in fade-in duration-1000">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('selector')}>
            <div className="rounded-full w-9 h-9 shadow-sm overflow-hidden bg-white p-1 border">
              <Image src={LOGO_PATH} alt="Logo" width={36} height={36} unoptimized className="object-contain w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-3 h-3 text-primary" />
                <h1 className="text-base font-black uppercase text-primary leading-none tracking-tight">
                  {selectedSection === 'sports' ? "Sports" : "Students"}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 ml-5">
                <div className={cn("w-1.5 h-1.5 rounded-full", (isOnline && !user?.isAnonymous) ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                  {user?.isAnonymous ? "Device Only" : "Cloud Sync Active"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
               <SelectTrigger className="h-8 border bg-white font-black uppercase text-[9px] w-[90px] rounded-full"><SelectValue /></SelectTrigger>
               <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
             </Select>
             <Button variant="ghost" size="icon" onClick={() => setStage('selector')} className="rounded-full h-8 w-8 hover:bg-primary/5 text-primary" title={t.switchHub}>
               <Menu className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsContent value="home" className="mt-0 space-y-8 animate-in fade-in duration-700">
            {!schoolData.isLoaded ? <StatsSkeleton /> : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
                      Welcome, Coach
                     </h2>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Managing {selectedSection === 'sports' ? 'Athletic Excellence' : 'Academic Growth'}</p>
                   </div>
                   <div className="bg-white p-2 rounded-2xl shadow-sm border flex items-center gap-2">
                     <span className="text-[10px] font-black text-primary uppercase px-3 py-1 bg-primary/5 rounded-full">{schoolData.selectedYear} Term</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="rounded-[2.5rem] p-10 bg-primary text-white shadow-xl relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Institutional Hub</p>
                        <h3 className="text-5xl font-black tracking-tight">
                          {schoolData.data.players.filter(p => selectedSection === 'general' ? true : p.category === 'athlete').length}
                        </h3>
                        <p className="text-sm font-bold opacity-60">Registered {selectedSection === 'sports' ? 'Athletes' : 'Students'}</p>
                      </div>
                      <Button onClick={() => setActiveTab('registration')} className="bg-white text-primary hover:bg-white/90 rounded-full font-black uppercase text-[10px] px-8 h-10 shadow-lg">
                        <UserPlus className="w-4 h-4 mr-2" /> Add New {selectedSection === 'sports' ? 'Athlete' : 'Student'}
                      </Button>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-6 lg:col-span-2">
                    <Card onClick={() => setActiveTab('history')} className="google-card p-8 flex flex-col justify-between group hover:border-primary/20 border-2 border-transparent transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">Open</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">Analytics Hub</p>
                      </div>
                    </Card>
                    
                    <Card onClick={() => setActiveTab('fitness')} className="google-card p-8 flex flex-col justify-between group hover:border-primary/20 border-2 border-transparent transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">
                          {Object.keys(schoolData.data.fitness).filter(id => {
                            const p = schoolData.data.players.find(p => p.id === id);
                            return selectedSection === 'general' ? !!p : p?.category === 'athlete';
                          }).length}
                        </p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">Tests Logged</p>
                      </div>
                    </Card>
                  </div>
                </div>

                {birthdaysToday.filter(p => selectedSection === 'general' ? true : p.category === 'athlete').length > 0 && (
                  <Card className="rounded-[2.5rem] border-none bg-accent/5 p-8 shadow-inner animate-in zoom-in-95 duration-500 border border-accent/10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-md">
                          <Cake className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Today's Birthdays</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Institutional Celebration</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {birthdaysToday
                        .filter(p => selectedSection === 'general' ? true : p.category === 'athlete')
                        .map((student: any) => (
                        <div key={student.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 border border-accent/10">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-xl uppercase shadow-inner">
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-primary uppercase text-sm leading-none">{student.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1.5 opacity-60">Std {student.std} • Happy Birthday!</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <div className="pb-12">
            <TabsContent value="core" className="mt-0">{activeTab === "core" && <CoreHub store={schoolData} />}</TabsContent>
            <TabsContent value="dashboard" className="mt-0">{activeTab === "dashboard" && <Dashboard store={schoolData} section={selectedSection!} language={language} t={t} onTabChange={setActiveTab} />}</TabsContent>
            <TabsContent value="registration" className="mt-0">{activeTab === "registration" && <Registration store={schoolData} section={selectedSection!} language={language} />}</TabsContent>
            <TabsContent value="attendance" className="mt-0">{activeTab === "attendance" && <Attendance store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="fitness" className="mt-0">{activeTab === "fitness" && <Fitness store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="skills" className="mt-0">{activeTab === "skills" && <SportsSkills store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="drills" className="mt-0">{activeTab === "drills" && <SportsDrills store={schoolData} />}</TabsContent>
            <TabsContent value="activities" className="mt-0">{activeTab === "activities" && <SchoolActivities store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="health" className="mt-0">{activeTab === "health" && <HealthIncidents store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="history" className="mt-0">{activeTab === "history" && <PersonalDashboard store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="report" className="mt-0">{activeTab === "report" && <DailyReport store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="ai" className="mt-0">{activeTab === "ai" && <AIAdvice store={schoolData} />}</TabsContent>
            <TabsContent value="settings" className="mt-0">{activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}</TabsContent>
            <TabsContent value="promotion" className="mt-0">{activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="classes" className="mt-0">{activeTab === "classes" && <ClassesSection store={schoolData} />}</TabsContent>
            <TabsContent value="exams" className="mt-0">{activeTab === "exams" && <ExamsHub store={schoolData} />}</TabsContent>
            <TabsContent value="tournament" className="mt-0">{activeTab === "tournament" && <TournamentRosters store={schoolData} />}</TabsContent>
            <TabsContent value="teams" className="mt-0">{activeTab === "teams" && <Teams store={schoolData} />}</TabsContent>
          </div>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50 safe-area-bottom overflow-x-auto scrollbar-hide">
        <div className="h-full flex items-center justify-start md:justify-center gap-4 px-6 min-w-max">
          {currentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id}
              className="google-nav-item min-w-[80px] md:min-w-[100px] flex flex-col items-center gap-1 group transition-all"
            >
              <div className={cn(
                "google-nav-icon w-14 h-8 flex items-center justify-center rounded-full transition-all group-active:scale-90",
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              )}>
                <tab.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "google-nav-label text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          ))}
          <div className="w-6 shrink-0 md:hidden" />
        </div>
      </nav>
    </div>
  );
}
