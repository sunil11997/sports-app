
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
  ArrowRight, 
  GraduationCap, 
  Medal, 
  UserPlus, 
  LayoutGrid, 
  Zap, 
  Settings as SettingsIcon, 
  ArrowUpCircle, 
  Cake, 
  PartyPopper,
  Menu,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Loader2,
  FileText,
  History as HistoryIcon,
  HeartPulse,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePWA } from '@/components/providers/pwa-provider';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
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
const HistoryView = dynamic(() => import('@/components/features/History').then(mod => mod.History), { ssr: false, loading: () => <TableSkeleton /> });
const SchoolActivities = dynamic(() => import('@/components/features/SchoolActivities').then(mod => mod.SchoolActivities), { ssr: false, loading: () => <TableSkeleton /> });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    sportsHub: "Sports Excellence",
    studentRegistry: "Student Registry",
    switchHub: "Switch Hub",
    home: "Home", register: "Enroll", roster: "List", promote: "Next Year", tourney: "Tourney", report: "Report", history: "History", presence: "Attendance", fitness: "Tests", skills: "Skills", drills: "Coach", health: "Health", aiHub: "AI Hub", settings: "Settings", enroll: "Enroll", registry: "Registry", session: "Session", activities: "Activities",
    enter: "ACCESS HUB", googleLogin: "LOGIN WITH GOOGLE", syncNote: "Syncs registry to your Google Account", onlineStatus: "Online", offlineStatus: "Local"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा विभाग",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    home: "मुख्यपृष्ठ", register: "नोंदणी", roster: "यादी", promote: "प्रमोशन", tourney: "स्पर्धा", report: "अहवाल", history: "इतिहास", presence: "उपस्थिती", fitness: "चाचणी", skills: "कौशल्ये", drills: "कोचिंग", health: "आरोग्य", aiHub: "AI केंद्र", settings: "सेटिंग्ज", enroll: "नावनोंदणी", registry: "नोंदणी वही", session: "सत्र", activities: "उपक्रम",
    enter: "प्रवेश करा", googleLogin: "गूगल द्वारे लॉगिन करा", syncNote: "तुमचा डेटा गूगल खात्यावर सेव्ह होईल", onlineStatus: "ऑनलाइन", offlineStatus: "ऑफलाइन"
  }
};

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isOnline } = usePWA();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = translations[language];
  const LOGO_PATH = "/icon-512.png";

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await initiateGoogleSignIn(auth);
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.register, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard },
    { id: "tournament", label: t.tourney, icon: Trophy },
    { id: "attendance", label: t.presence, icon: CalendarCheck },
    { id: "fitness", label: t.fitness, icon: Activity },
    { id: "skills", label: t.skills, icon: Medal },
    { id: "drills", label: t.drills, icon: Zap },
    { id: "activities", label: t.activities, icon: ClipboardList },
    { id: "health", label: t.health, icon: HeartPulse },
    { id: "history", label: t.history, icon: HistoryIcon },
    { id: "report", label: t.report, icon: FileText },
    { id: "ai", label: t.aiHub, icon: Sparkles },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.enroll, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard },
    { id: "attendance", label: t.presence, icon: CalendarCheck },
    { id: "fitness", label: t.fitness, icon: Activity },
    { id: "activities", label: t.activities, icon: ClipboardList },
    { id: "promotion", label: t.promote, icon: ArrowUpCircle },
    { id: "classes", label: "Profiles", icon: LayoutGrid },
    { id: "history", label: t.history, icon: HistoryIcon },
    { id: "report", label: t.report, icon: FileText },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const birthdaysToday = useMemo(() => {
    if (!isMounted) return [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    return schoolData.data.players.filter(p => {
      if (!p.dob) return false;
      const d = new Date(p.dob);
      return (d.getMonth() + 1) === currentMonth && d.getDate() === currentDay;
    });
  }, [schoolData.data.players, isMounted]);

  if (!isMounted) return null;

  const isFullyAuthenticated = user && !user.isAnonymous;

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!isFullyAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-xl w-full text-center space-y-12 relative z-10 animate-in fade-in duration-1000">
          <div className="relative mx-auto w-40 h-40">
            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-6" />
            <div className="relative z-10 bg-white p-6 rounded-[3rem] shadow-xl border border-primary/5">
              <Image src={LOGO_PATH} alt="App Logo" width={160} height={160} priority unoptimized className="object-contain w-full h-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-primary tracking-tighter uppercase leading-tight">{t.schoolName}</h1>
              <p className="text-muted-foreground font-black tracking-[0.4em] text-[9px] uppercase opacity-60">Institutional Management Hub</p>
            </div>
            
            <div className="space-y-4 pt-4">
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn}
                className="w-full bg-white text-foreground hover:bg-muted border border-primary/10 h-20 rounded-[1.5rem] shadow-sm active-scale group"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.67 4.7 1.8l3.5-3.5C17.84 1.25 15.19 0 12 0 7.33 0 3.32 2.67 1.28 6.59l4.13 3.21C6.4 7.09 9.02 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-1.99 3.42-4.93 3.42-8.7z" />
                      <path fill="#FBBC05" d="M5.41 14.62c-.24-.69-.37-1.42-.37-2.18s.13-1.49.37-2.18L1.28 6.59C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.41l4.13-3.21z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.03.69-2.35 1.1-4.22 1.1-3.15 0-5.81-2.13-6.76-4.99l-4.13 3.21C3.32 21.33 7.33 24 12 24z" />
                    </svg>
                    <div className="text-left">
                      <span className="block font-black text-lg uppercase leading-none">{t.googleLogin}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.syncNote}</span>
                    </div>
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-black tracking-widest">OR</span></div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => { initiateAnonymousSignIn(auth); setSelectedSection(null); }} 
                className="w-full h-12 rounded-xl text-muted-foreground font-black text-[10px] uppercase tracking-widest"
              >
                Enter Without Sync (Local Only)
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 opacity-40">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Secure Institutional Standard</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button onClick={() => setSelectedSection('sports')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-xl transition-all active-scale group border border-transparent hover:border-primary/20">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors">
              <Medal className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Training & Excellence</p>
          </button>
          <button onClick={() => setSelectedSection('general')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-xl transition-all active-scale group border border-transparent hover:border-primary/20">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors">
              <GraduationCap className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.studentRegistry}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Academic & Records</p>
          </button>
        </div>
      </div>
    );
  }

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24 md:pb-0 animate-in fade-in duration-1000">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedSection(null)}>
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
                <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                  {isOnline ? "Syncing to Cloud" : "Local Mode"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1 mx-8 flex-1 justify-center overflow-x-auto scrollbar-hide">
            {currentTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full h-10 px-6 font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
               <SelectTrigger className="h-8 border bg-white font-black uppercase text-[9px] w-[90px] rounded-full"><SelectValue /></SelectTrigger>
               <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
             </Select>
             <Button variant="ghost" size="icon" onClick={() => setSelectedSection(null)} className="rounded-full h-8 w-8 hover:bg-primary/5 text-primary" title={t.switchHub}>
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
                   <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
                    Welcome back, Coach
                   </h2>
                   <div className="bg-white p-2 rounded-2xl shadow-sm border flex items-center gap-2">
                     <span className="text-[10px] font-black text-primary uppercase px-3 py-1 bg-primary/5 rounded-full">{schoolData.selectedYear}</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-[2.5rem] p-10 bg-primary text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Institutional Hub</p>
                        <h3 className="text-5xl font-black tracking-tight">{schoolData.data.players.length}</h3>
                        <p className="text-sm font-bold opacity-60">Total Enrolled Students</p>
                      </div>
                      <Button onClick={() => setActiveTab('registration')} className="bg-white text-primary hover:bg-white/90 rounded-full font-black uppercase text-[10px] px-8 h-10 shadow-lg">
                        <UserPlus className="w-4 h-4 mr-2" /> Add New Record
                      </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-105 transition-transform duration-1000" />
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="google-card p-8 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-inner">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{schoolData.data.activities.length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">Activities Logged</p>
                      </div>
                    </Card>
                    <Card className="google-card p-8 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shadow-inner">
                        <Medal className="w-5 h-5 text-primary" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{schoolData.data.players.filter(p => p.category === 'athlete').length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">Active Athletes</p>
                      </div>
                    </Card>
                  </div>
                </div>

                {selectedSection === 'general' && birthdaysToday.length > 0 && (
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
                      <PartyPopper className="w-10 h-10 text-accent opacity-50" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {birthdaysToday.map((student: any) => (
                        <div key={student.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all cursor-default border border-accent/10">
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

          <div className="pb-8">
            <TabsContent value="dashboard" className="mt-0">{activeTab === "dashboard" && <Dashboard store={schoolData} section={selectedSection!} language={language} t={t} onTabChange={setActiveTab} />}</TabsContent>
            <TabsContent value="registration" className="mt-0">{activeTab === "registration" && <Registration store={schoolData} section={selectedSection!} language={language} />}</TabsContent>
            <TabsContent value="attendance" className="mt-0">{activeTab === "attendance" && <Attendance store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="fitness" className="mt-0">{activeTab === "fitness" && <Fitness store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="skills" className="mt-0">{activeTab === "skills" && <SportsSkills store={schoolData} />}</TabsContent>
            <TabsContent value="drills" className="mt-0">{activeTab === "drills" && <SportsDrills store={schoolData} />}</TabsContent>
            <TabsContent value="activities" className="mt-0">{activeTab === "activities" && <SchoolActivities store={schoolData} />}</TabsContent>
            <TabsContent value="health" className="mt-0">{activeTab === "health" && <HealthIncidents store={schoolData} />}</TabsContent>
            <TabsContent value="history" className="mt-0">{activeTab === "history" && <HistoryView store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="report" className="mt-0">{activeTab === "report" && <DailyReport store={schoolData} />}</TabsContent>
            <TabsContent value="ai" className="mt-0">{activeTab === "ai" && <AIAdvice store={schoolData} />}</TabsContent>
            <TabsContent value="settings" className="mt-0">{activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}</TabsContent>
            <TabsContent value="promotion" className="mt-0">{activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="classes" className="mt-0">{activeTab === "classes" && <ClassesSection store={schoolData} />}</TabsContent>
            <TabsContent value="tournament" className="mt-0">{activeTab === "tournament" && <TournamentRosters store={schoolData} />}</TabsContent>
          </div>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-20 px-2 md:hidden z-50 safe-area-bottom overflow-x-auto scrollbar-hide">
        <div className="h-full flex items-center justify-start gap-4 px-4 min-w-max">
          {currentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id}
              className="google-nav-item min-w-[70px]"
            >
              <div className="google-nav-icon">
                <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="google-nav-label text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
