
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, CalendarCheck, Activity, Trophy, Stethoscope, Sparkles, Home, FileText, History as HistoryIcon, ArrowRight, GraduationCap, Medal, UserPlus, LayoutGrid, Zap, Settings as SettingsIcon } from 'lucide-react';
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
    sportsHub: "Physical Ed & Sports Hub",
    studentRegistry: "Institutional Registry",
    switchHub: "Change Hub",
    home: "Home", register: "Enroll", roster: "List", tourney: "Tourney", report: "Report", history: "History", presence: "Attendance", fitness: "Tests", skills: "Skills", drills: "Coach", health: "Health", aiHub: "AI Hub", settings: "Setup", enroll: "Enroll", registry: "Registry", session: "Session",
    enter: "ACCESS HUB", onlineStatus: "Cloud Connected", offlineStatus: "Local Sync Mode"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "शारीरिक शिक्षण व क्रीडा",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    home: "मुख्यपृष्ठ", register: "नोंदणी", roster: "यादी", tourney: "स्पर्धा", report: "अहवाल", history: "इतिहास", presence: "उपस्थिती", fitness: "चाचणी", skills: "कौशल्ये", drills: "कोचिंग", health: "आरोग्य", aiHub: "AI केंद्र", settings: "सेटिंग्ज", enroll: "नावनोंदणी", registry: "नोंदणी वही", session: "सत्र",
    enter: "प्रवेश करा", onlineStatus: "क्लाउड कनेक्टेड", offlineStatus: "ऑफलाईन मोड"
  }
};

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [todayDate, setTodayDate] = useState<Date | null>(null);
  
  const schoolData = useSchoolData();
  const { user, isUserLoading } = useUser();
  const { isOnline } = usePWA();
  const auth = useAuth();

  const t = translations[language];
  const LOGO_INAPP = "/icon-512.png";

  useEffect(() => {
    if (!user && !isUserLoading) initiateAnonymousSignIn(auth);
    setTodayDate(new Date());
  }, [user, isUserLoading, auth]);

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home, color: "text-primary bg-primary/5" },
    { id: "registration", label: t.register, icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
    { id: "dashboard", label: t.roster, icon: LayoutDashboard, color: "text-purple-600 bg-purple-50" },
    { id: "tournament", label: t.tourney, icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { id: "attendance", label: t.presence, icon: CalendarCheck, color: "text-teal-600 bg-teal-50" },
    { id: "fitness", label: t.fitness, icon: Activity, color: "text-orange-600 bg-orange-50" },
    { id: "sports-skills", label: t.skills, icon: Medal, color: "text-yellow-600 bg-yellow-50" },
    { id: "drills", label: t.drills, icon: Trophy, color: "text-cyan-600 bg-cyan-50" },
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
    { id: "promotion", label: "Promote", icon: Medal, color: "text-blue-600 bg-blue-50" },
    { id: "classes", label: "Profiles", icon: LayoutGrid, color: "text-indigo-600 bg-indigo-50" },
    { id: "activities", label: "Daily Log", icon: Zap, color: "text-purple-600 bg-purple-50" },
    { id: "daily-report", label: "Report", icon: FileText, color: "text-rose-600 bg-rose-50" },
    { id: "settings", label: t.settings, icon: SettingsIcon, color: "text-slate-600 bg-slate-50" },
  ];

  if (!isEntered) {
    return (
      <div className="h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-xl w-full text-center space-y-8 relative z-10">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 z-0">
              <Lottie animationData={splashAnimation} loop={true} className="w-full h-full" />
            </div>
            <div className="absolute inset-4 z-10 rounded-full overflow-hidden shadow-2xl active-scale bg-white">
              <Image src={LOGO_INAPP} alt="App Logo" width={256} height={256} priority unoptimized className="object-cover w-full h-full" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-tight">{t.schoolName}</h1>
              <p className="text-muted-foreground font-black tracking-[0.4em] text-[10px] uppercase">{t.sportsHub}</p>
            </div>
            <Button onClick={() => setIsEntered(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xl h-20 rounded-[1.5rem] shadow-xl active-scale mt-8">{t.enter} <ArrowRight className="ml-3 w-6 h-6" /></Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="h-screen bg-muted/10 flex flex-col items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button onClick={() => setSelectedSection('sports')} className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl active-scale group border-4 border-transparent hover:border-accent">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"><Medal className="w-8 h-8 text-black" /></div>
            <h3 className="text-2xl font-black text-primary uppercase">{t.sportsHub}</h3>
          </button>
          <button onClick={() => setSelectedSection('general')} className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl active-scale group border-4 border-transparent hover:border-primary">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"><GraduationCap className="w-8 h-8 text-white" /></div>
            <h3 className="text-2xl font-black text-primary uppercase">{t.studentRegistry}</h3>
          </button>
        </div>
      </div>
    );
  }

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
      <header className="flex-none bg-white/90 backdrop-blur-xl border-b py-3 px-6 shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="rounded-full w-12 h-12 shadow-lg overflow-hidden">
              <Image src={LOGO_INAPP} alt="Logo" width={48} height={48} unoptimized className="object-cover w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black uppercase text-primary leading-none tracking-tight">
                  {selectedSection === 'sports' ? "Sports Hub" : "Student Hub"}
                </h1>
                {isOnline ? (
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7px] font-black uppercase">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-md border border-destructive/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    <span className="text-[7px] font-black uppercase">Local Sync</span>
                  </div>
                )}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">{schoolData.data.schoolProfile.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}><SelectTrigger className="h-9 border-0 bg-muted/50 font-black uppercase text-[10px] w-[120px] rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24 Archive</SelectItem></SelectContent></Select>
             <Button variant="outline" size="sm" onClick={() => setSelectedSection(null)} className="text-[9px] font-black uppercase rounded-full h-9 px-4">{t.switchHub}</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col w-full max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-none overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-white p-1 flex gap-1 rounded-2xl border min-w-max h-auto shadow-sm">
              {currentTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className={cn("rounded-xl px-4 py-3 font-black text-[10px] uppercase transition-all flex flex-col items-center gap-1 min-w-[80px]", "data-[state=active]:bg-primary data-[state=active]:text-white shadow-none", !activeTab.includes(tab.id) && tab.color)}>
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 mt-2">
            <div className="pb-20">
              <TabsContent value="home" className="mt-0">{!schoolData.isLoaded ? <StatsSkeleton /> : <div className="space-y-6"><h2 className="text-3xl font-black text-primary uppercase">{selectedSection === 'sports' ? "Athlete Dashboard" : "Institutional Hub"}</h2><Card className="rounded-[2.5rem] p-10 bg-primary text-white shadow-2xl relative overflow-hidden"><div className="relative z-10 space-y-2"><p className="text-xs font-bold opacity-70 uppercase tracking-widest">Active Academic Year</p><h3 className="text-5xl font-black">{schoolData.selectedYear}</h3><div className="flex gap-4 pt-4"><div className="bg-white/10 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase opacity-60">Total Registry</p><p className="text-2xl font-black">{schoolData.data.players.length}</p></div><div className="bg-white/10 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase opacity-60">Activities Logged</p><p className="text-2xl font-black">{schoolData.data.activities.length}</p></div></div></div></Card></div>}</TabsContent>
              <TabsContent value="dashboard" className="mt-0">{activeTab === "dashboard" && <Dashboard store={schoolData} section={selectedSection!} language={language} t={t} />}</TabsContent>
              <TabsContent value="registration" className="mt-0">{activeTab === "registration" && <Registration store={schoolData} section={selectedSection!} language={language} />}</TabsContent>
              <TabsContent value="attendance" className="mt-0">{activeTab === "attendance" && <Attendance store={schoolData} section={selectedSection!} />}</TabsContent>
              <TabsContent value="fitness" className="mt-0">{activeTab === "fitness" && <Fitness store={schoolData} section={selectedSection!} />}</TabsContent>
              <TabsContent value="sports-skills" className="mt-0">{activeTab === "sports-skills" && <SportsSkills store={schoolData} />}</TabsContent>
              <TabsContent value="drills" className="mt-0">{activeTab === "drills" && <SportsDrills store={schoolData} />}</TabsContent>
              <TabsContent value="health" className="mt-0">{activeTab === "health" && <HealthIncidents store={schoolData} />}</TabsContent>
              <TabsContent value="daily-report" className="mt-0">{activeTab === "daily-report" && <DailyReport store={schoolData} />}</TabsContent>
              <TabsContent value="ai" className="mt-0">{activeTab === "ai" && <AIAdvice store={schoolData} />}</TabsContent>
              <TabsContent value="settings" className="mt-0">{activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}</TabsContent>
              <TabsContent value="promotion" className="mt-0">{activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection!} />}</TabsContent>
              <TabsContent value="classes" className="mt-0">{activeTab === "classes" && <ClassesSection store={schoolData} />}</TabsContent>
              <TabsContent value="activities" className="mt-0">{activeTab === "activities" && <SchoolActivities store={schoolData} />}</TabsContent>
              <TabsContent value="tournament" className="mt-0">{activeTab === "tournament" && <TournamentRosters store={schoolData} />}</TabsContent>
              <TabsContent value="archive" className="mt-0">{activeTab === "archive" && <History store={schoolData} section={selectedSection!} />}</TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
}
