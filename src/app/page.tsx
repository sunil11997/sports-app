"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import NextDynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Trophy, 
  UsersRound, 
  UserCircle,
  ClipboardList,
  Activity,
  User,
  School,
  ArrowRight,
  Flame,
  Menu,
  Star,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';
import splashAnim from './lib/splash-animation.json';

// Lottie is browser-only and must be wrapped for SSR stability
const Lottie = NextDynamic(() => import('lottie-react'), { ssr: false });

// Feature Components
const Dashboard = NextDynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { ssr: false, loading: () => <TableSkeleton /> });
const Registration = NextDynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { ssr: false, loading: () => <TableSkeleton /> });
const Attendance = NextDynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { ssr: false, loading: () => <TableSkeleton /> });
const Fitness = NextDynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { ssr: false, loading: () => <TableSkeleton /> });
const SportsSkills = NextDynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { ssr: false, loading: () => <TableSkeleton /> });
const SportsDrills = NextDynamic(() => import('@/components/features/SportsDrills').then(mod => mod.SportsDrills), { ssr: false, loading: () => <TableSkeleton /> });
const DailyReport = NextDynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { ssr: false, loading: () => <TableSkeleton /> });
const Settings = NextDynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { ssr: false, loading: () => <StatsSkeleton /> });
const SchoolRegistration = NextDynamic(() => import('@/components/features/SchoolRegistration').then(mod => mod.SchoolRegistration), { ssr: false });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    sportsHub: "Sports Excellence",
    studentRegistry: "Student Registry",
    home: "Home",
    sport: "Sport Hub",
    students: "Students",
    profile: "Profile",
    enter: "ACCESS HUB"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा विभाग",
    studentRegistry: "विद्यार्थी नोंदणी",
    home: "मुख्यपृष्ठ",
    sport: "खेळ व सराव",
    students: "विद्यार्थी",
    profile: "प्रोफाइल",
    enter: "हब मध्ये प्रवेश करा"
  }
};

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [subTab, setSubTab] = useState<string>("overview");
  
  const schoolData = useSchoolData(stage === 'hub' && isMounted);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      const timer = setTimeout(() => initiateAnonymousSignIn(auth), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, auth, isMounted]);

  const t = translations[language];
  const LOGO_PATH = "/icon-512.png";

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "sport", label: t.sport, icon: Trophy },
    { id: "students", label: t.students, icon: UsersRound },
    { id: "profile", label: t.profile, icon: UserCircle },
  ];

  const topPerformers = useMemo(() => {
    if (selectedSection !== 'sports' || !schoolData.data.players) return [];
    const sports = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
    return sports.map(sport => {
      const athletesInSport = schoolData.data.players.filter(p => p.category === 'athlete' && p.sports?.includes(sport));
      let topPlayer: any = null;
      let highestScore = -1;
      athletesInSport.forEach(p => {
        const skill = schoolData.data.sportSkills[`${p.id}_${sport}`];
        if (skill) {
          const score = parseFloat(skill.score) || 0;
          if (score > highestScore) { highestScore = score; topPlayer = p; }
        }
      });
      return { sport, player: topPlayer, score: highestScore };
    }).filter(item => item.player !== null);
  }, [selectedSection, schoolData.data.players, schoolData.data.sportSkills]);

  if (!isMounted) return null;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center p-6 z-[9999] fixed inset-0">
        <div className="max-w-xs w-full text-center space-y-8">
           <div className="w-48 h-48 mx-auto relative">
             <Lottie animationData={splashAnim} loop={true} />
           </div>
           <div className="space-y-2">
             <h2 className="text-white text-2xl font-black uppercase tracking-widest animate-pulse">WGB HUB V3.1</h2>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Registry...</p>
           </div>
        </div>
      </div>
    );
  }

  if (stage === 'hub' && selectedSection) {
    const teacher = schoolData.data.schoolProfile;
    return (
      <div className="min-h-screen flex flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('selector')}>
              <div className="rounded-full w-9 h-9 shadow-sm overflow-hidden bg-white border shrink-0 flex items-center justify-center relative">
                <Image src={LOGO_PATH} alt="Logo" width={36} height={36} unoptimized className="object-cover" priority />
              </div>
              <h1 className="text-base font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? "Sports Hub" : "Student Registry"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
                <SelectTrigger className="h-8 border bg-white font-black uppercase text-[9px] w-[90px] rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setStage('selector')} className="rounded-full h-8 w-8 text-primary hover:bg-primary/5">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            
            {/* TAB 1: HOME (Dashboard Purpose) */}
            <TabsContent value="home" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <div className="flex bg-muted/40 p-1 rounded-2xl border w-fit mb-6">
                <Button variant={subTab === "overview" ? "default" : "ghost"} onClick={() => setSubTab("overview")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Overview</Button>
                <Button variant={subTab === "roster" ? "default" : "ghost"} onClick={() => setSubTab("roster")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Roster</Button>
                <Button variant={subTab === "enroll" ? "default" : "ghost"} onClick={() => setSubTab("enroll")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Enroll New</Button>
              </div>

              {subTab === "overview" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Welcome, {teacher.teacherName.split(' ')[0]}</h2>
                      <p className="text-muted-foreground font-medium text-sm">Registry Overview • {schoolData.selectedYear}</p>
                    </div>
                    <Card className="p-4 rounded-2xl bg-white border-2 flex items-center gap-4 shadow-sm border-primary/10">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Head Instructor</p>
                        <p className="font-black text-primary uppercase text-xs mt-1">{teacher.teacherName}</p>
                        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">{teacher.role}</p>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-[2.5rem] p-10 bg-primary text-white shadow-xl relative overflow-hidden">
                      <h3 className="text-5xl font-black tracking-tight">
                        {schoolData.data.players.filter(p => p.category === 'athlete').length}
                      </h3>
                      <p className="text-sm font-bold opacity-60 uppercase mt-2">Active Athletes</p>
                      <Button onClick={() => setSubTab('enroll')} className="bg-white text-primary rounded-full font-black uppercase text-[10px] px-8 h-10 mt-6 shadow-lg">Add New Student</Button>
                    </Card>
                    <Card onClick={() => setSubTab('roster')} className="google-card p-8 flex flex-col justify-between cursor-pointer group hover:bg-primary/[0.02]">
                      <ClipboardList className="w-10 h-10 text-accent" />
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">Open</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Full Database</p>
                      </div>
                    </Card>
                    <Card className="google-card p-8 flex flex-col justify-between group">
                      <Activity className="w-10 h-10 text-primary" />
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{Object.keys(schoolData.data.fitness).length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Metrics Logged</p>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="rounded-[2rem] border-2 p-8 bg-white shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-primary/10">
                           <School className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                           <h4 className="text-xl font-black text-primary uppercase tracking-tight">{teacher.schoolName}</h4>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{teacher.taluka}, {teacher.district}</p>
                           <div className="flex gap-2 mt-3 justify-center md:justify-start">
                              <Badge variant="outline" className="text-[8px] font-black border-primary/20">{teacher.qualification}</Badge>
                              <Badge className="bg-emerald-500 text-white text-[8px] font-black">CERTIFIED HUB</Badge>
                           </div>
                        </div>
                     </Card>
                     <Card className="rounded-[2rem] border-2 p-8 bg-accent/[0.03] shadow-sm border-accent/10 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-accent/20">
                           <Activity className="w-10 h-10 text-accent" />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                           <h4 className="text-xl font-black text-primary uppercase tracking-tight">System Health</h4>
                           <p className="text-sm font-medium text-foreground/60 leading-tight">All local data is currently synchronized with the institutional cloud vault.</p>
                        </div>
                     </Card>
                  </div>
                  
                  {topPerformers.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-accent fill-accent" />
                        <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Technical Leaders</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topPerformers.map((item, idx) => (
                          <Card key={idx} className="google-card p-5 border-l-4 border-accent relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{item.sport}</span>
                              <p className="font-black text-primary uppercase text-sm truncate">{item.player.name}</p>
                              <Badge variant="outline" className="w-fit text-[9px] font-black border-accent/20 text-accent bg-accent/5">Mastery: {item.score}%</Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {subTab === "roster" && <Dashboard store={schoolData} section={selectedSection} t={t} />}
              {subTab === "enroll" && <Registration store={schoolData} section={selectedSection} language={language} />}
            </TabsContent>

            {/* TAB 2: SPORT (All games and drills) */}
            <TabsContent value="sport" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <div className="flex bg-muted/40 p-1 rounded-2xl border w-fit mb-6">
                <Button variant={subTab === "skills" ? "default" : "ghost"} onClick={() => setSubTab("skills")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Technical Mastery</Button>
                <Button variant={subTab === "drills" ? "default" : "ghost"} onClick={() => setSubTab("drills")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Drills & Plans</Button>
              </div>
              {subTab === "skills" ? <SportsSkills store={schoolData} section={selectedSection} /> : <SportsDrills store={schoolData} />}
            </TabsContent>

            {/* TAB 3: STUDENTS (Attendance and report) */}
            <TabsContent value="students" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <div className="flex bg-muted/40 p-1 rounded-2xl border w-fit mb-6">
                <Button variant={subTab === "attendance" ? "default" : "ghost"} onClick={() => setSubTab("attendance")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Attendance</Button>
                <Button variant={subTab === "report" ? "default" : "ghost"} onClick={() => setSubTab("report")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Daily Report</Button>
              </div>
              {subTab === "attendance" ? <Attendance store={schoolData} section={selectedSection} /> : <DailyReport store={schoolData} section={selectedSection} />}
            </TabsContent>

            {/* TAB 4: PROFILE (Setting and teacher profile) */}
            <TabsContent value="profile" className="mt-0 space-y-8 animate-in fade-in duration-700">
               <div className="flex bg-muted/40 p-1 rounded-2xl border w-fit mb-6">
                <Button variant={subTab === "profile" ? "default" : "ghost"} onClick={() => setSubTab("profile")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Teacher Profile</Button>
                <Button variant={subTab === "settings" ? "default" : "ghost"} onClick={() => setSubTab("settings")} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">Sync Settings</Button>
              </div>
              {subTab === "profile" ? <SchoolRegistration store={schoolData} /> : <Settings language={language} setLanguage={setLanguage} />}
            </TabsContent>

          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50 overflow-x-auto scrollbar-hide">
          <div className="h-full flex items-center justify-start md:justify-center gap-4 px-6 min-w-max">
            {sportsTabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSubTab(tab.id === 'home' ? 'overview' : tab.id === 'sport' ? 'skills' : tab.id === 'students' ? 'attendance' : 'profile'); }} data-active={activeTab === tab.id} className={cn("google-nav-item min-w-[80px] md:min-w-[100px] flex flex-col items-center gap-1 transition-all", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}>
                <div className={cn("google-nav-icon w-14 h-8 flex items-center justify-center rounded-full transition-all", activeTab === tab.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <span className="google-nav-label text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  if (stage === 'selector') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl mx-auto border border-primary/5 active-scale mb-4 overflow-hidden shrink-0 flex items-center justify-center relative">
              <Image src={LOGO_PATH} alt="Logo" width={64} height={64} unoptimized className="object-cover" priority />
            </div>
            <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{t.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => { setSelectedSection('sports'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Athletics & Training</p>
            </button>
            <button onClick={() => { setSelectedSection('general'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <School className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.studentRegistry}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Student Profiles</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.03] rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
      <div className="relative z-10 max-w-2xl w-full text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <div className="w-32 h-32 bg-white rounded-full shadow-2xl mx-auto border-2 border-primary/10 flex items-center justify-center overflow-hidden relative">
            <Image src={LOGO_PATH} alt="Logo" width={128} height={128} unoptimized className="object-cover" priority />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/10 mb-2">
              <Flame className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight uppercase">
              {language === 'Marathi' ? "शासकीय माध्यमिक" : "ASHRAM SHALA"}<br/>
              <span className="text-accent">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "WAGHAMBA HUB"}</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-sm mx-auto">
          <Button onClick={() => setStage('selector')} className="h-20 rounded-[2rem] bg-primary text-white text-lg font-black uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all active-scale group">
            {isUserLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.enter} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" /></>}
          </Button>
          <button onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')} className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> {language === 'English' ? 'मराठी (Marathi)' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}
