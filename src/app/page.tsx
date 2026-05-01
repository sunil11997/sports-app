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
  Stethoscope, 
  Sparkles, 
  Home, 
  FileText, 
  History as HistoryIcon, 
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
  Search,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePWA } from '@/components/providers/pwa-provider';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';

// Animation Import
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import splashAnimation from '@/app/lib/splash-animation.json';

// Dynamic Feature Loading
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
const ClassesSection = dynamic(() => import('@/components/features/ClassesSection').then(mod => mod.ClassesSection), { ssr: false, loading: () => <StatsSkeleton /> });
const Settings = dynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { ssr: false, loading: () => <StatsSkeleton /> });
const PromotionHub = dynamic(() => import('@/components/features/PromotionHub').then(mod => mod.PromotionHub), { ssr: false, loading: () => <StatsSkeleton /> });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    sportsHub: "Sports Hub",
    studentRegistry: "Student Registry",
    switchHub: "Switch",
    home: "Home", register: "Enroll", roster: "List", promote: "Next Year", tourney: "Tourney", report: "Report", history: "History", presence: "Attendance", fitness: "Tests", skills: "Skills", drills: "Coach", health: "Health", aiHub: "AI Hub", settings: "Settings", enroll: "Enroll", registry: "Registry", session: "Session",
    enter: "ACCESS HUB", onlineStatus: "Online", offlineStatus: "Local"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा विभाग",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    home: "मुख्यपृष्ठ", register: "नोंदणी", roster: "यादी", promote: "प्रमोशन", tourney: "स्पर्धा", report: "अहवाल", history: "इतिहास", presence: "उपस्थिती", fitness: "चाचणी", skills: "कौशल्ये", drills: "कोचिंग", health: "आरोग्य", aiHub: "AI केंद्र", settings: "सेटिंग्ज", enroll: "नावनोंदणी", registry: "नोंदणी वही", session: "सत्र",
    enter: "प्रवेश करा", onlineStatus: "ऑनलाइन", offlineStatus: "ऑफलाइन"
  }
};

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isOnline } = usePWA();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
    if (!user && !isUserLoading) initiateAnonymousSignIn(auth);
  }, [user, isUserLoading, auth]);

  const t = translations[language];
  const LOGO_INAPP = "/icon-512.png";

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.register, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard },
    { id: "tournament", label: t.tourney, icon: Trophy },
    { id: "attendance", label: t.presence, icon: CalendarCheck },
    { id: "fitness", label: t.fitness, icon: Activity },
    { id: "ai", label: t.aiHub, icon: Sparkles },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const generalTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.enroll, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard },
    { id: "promotion", label: t.promote, icon: ArrowUpCircle },
    { id: "classes", label: "Profiles", icon: LayoutGrid },
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

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-xl w-full text-center space-y-8 relative z-10">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 z-0">
              <Lottie animationData={splashAnimation} loop={true} className="w-full h-full" />
            </div>
            <div className="absolute inset-4 z-10 rounded-full overflow-hidden shadow-2xl active-scale bg-primary">
              <Image src={LOGO_INAPP} alt="App Logo" width={256} height={256} priority unoptimized className="object-cover w-full h-full" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-tight">{t.schoolName}</h1>
              <p className="text-muted-foreground font-black tracking-[0.4em] text-[10px] uppercase">Institutional Management Hub</p>
            </div>
            <Button onClick={() => setIsEntered(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xl h-20 rounded-[1.5rem] shadow-xl active-scale mt-8">{t.enter} <ArrowRight className="ml-3 w-6 h-6" /></Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button onClick={() => setSelectedSection('sports')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors">
              <Medal className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Training & Excellence</p>
          </button>
          <button onClick={() => setSelectedSection('general')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary transition-colors">
              <GraduationCap className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.studentRegistry}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Academic & Records</p>
          </button>
        </div>
      </div>
    );
  }

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] pb-24 md:pb-0">
      {/* Google Style Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="rounded-full w-9 h-9 shadow-sm overflow-hidden bg-primary p-0.5 border">
              <Image src={LOGO_INAPP} alt="Logo" width={36} height={36} unoptimized className="object-cover w-full h-full rounded-full" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? "Sports" : "Students"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">
                  {isOnline ? "Syncing" : "Local Mode"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center bg-muted/50 rounded-full px-4 py-1.5 gap-2 border">
               <Search className="w-3.5 h-3.5 text-muted-foreground" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Global Registry Search</span>
             </div>
             <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
               <SelectTrigger className="h-8 border bg-white font-black uppercase text-[9px] w-[90px] rounded-full"><SelectValue /></SelectTrigger>
               <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
             </Select>
             <Button variant="ghost" size="icon" onClick={() => setSelectedSection(null)} className="rounded-full h-8 w-8 hover:bg-primary/5 text-primary">
               <Menu className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
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
                  <Card className="rounded-[2.5rem] p-10 bg-primary text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em]">Institutional Hub</p>
                        <h3 className="text-5xl font-black tracking-tight">{schoolData.data.players.length}</h3>
                        <p className="text-sm font-bold opacity-60">Total Enrolled Students</p>
                      </div>
                      <Button onClick={() => setActiveTab('registration')} className="bg-white text-primary hover:bg-white/90 rounded-full font-black uppercase text-[10px] px-8 h-10 shadow-xl">
                        <UserPlus className="w-4 h-4 mr-2" /> Add New Record
                      </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700" />
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="google-card p-8 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-inner">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{schoolData.data.activities.length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Activities Logged</p>
                      </div>
                    </Card>
                    <Card className="google-card p-8 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shadow-inner">
                        <Medal className="w-5 h-5 text-primary" />
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{schoolData.data.players.filter(p => p.category === 'athlete').length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Active Athletes</p>
                      </div>
                    </Card>
                  </div>
                </div>

                {selectedSection === 'general' && birthdaysToday.length > 0 && (
                  <Card className="rounded-[2.5rem] border-none bg-accent/5 p-8 shadow-inner animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                          <Cake className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Today's Birthdays</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Celebrate with the students</p>
                        </div>
                      </div>
                      <PartyPopper className="w-10 h-10 text-accent animate-bounce" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {birthdaysToday.map((student: any) => (
                        <div key={student.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-xl transition-all cursor-default border border-accent/20">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-xl uppercase shadow-inner">
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-primary uppercase text-sm leading-none">{student.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1.5">Std {student.std} • Happy Birthday!</p>
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
            <TabsContent value="ai" className="mt-0">{activeTab === "ai" && <AIAdvice store={schoolData} />}</TabsContent>
            <TabsContent value="settings" className="mt-0">{activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}</TabsContent>
            <TabsContent value="promotion" className="mt-0">{activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection!} />}</TabsContent>
            <TabsContent value="classes" className="mt-0">{activeTab === "classes" && <ClassesSection store={schoolData} />}</TabsContent>
            <TabsContent value="tournament" className="mt-0">{activeTab === "tournament" && <TournamentRosters store={schoolData} />}</TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Google Style Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-20 px-4 md:hidden z-50 safe-area-bottom">
        <div className="h-full max-w-lg mx-auto flex items-center justify-around">
          {currentTabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id}
              className="google-nav-item"
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