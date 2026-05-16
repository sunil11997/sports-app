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
  CalendarDays,
  Target,
  Timer,
  Zap,
  ChevronRight
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
const History = NextDynamic(() => import('@/components/features/History').then(mod => mod.History), { ssr: false, loading: () => <TableSkeleton /> });
const HealthIncidents = NextDynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { ssr: false, loading: () => <TableSkeleton /> });
const Fitness = NextDynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { ssr: false, loading: () => <TableSkeleton /> });
const GameHub = NextDynamic(() => import('@/components/features/GameHub').then(mod => mod.GameHub), { ssr: false, loading: () => <TableSkeleton /> });
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

  if (!isMounted) return null;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 z-[9999] fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        </div>
        <div className="max-w-xs w-full text-center space-y-12 relative z-10">
           <div className="w-56 h-56 mx-auto relative drop-shadow-[0_0_35px_rgba(59,130,246,0.5)]">
             <Lottie animationData={splashAnim} loop={true} />
           </div>
           <div className="space-y-4">
             <h2 className="text-white text-3xl font-display font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">WGB HUB V3.1</h2>
             <div className="flex flex-col items-center gap-3">
               <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-1/2 animate-[loader-progress_2s_infinite_ease-in-out]" />
               </div>
               <p className="text-blue-400/60 text-[10px] font-display font-black uppercase tracking-[0.5em]">Synchronizing Institutional Registry</p>
             </div>
           </div>
        </div>
        <style jsx global>{`
          @keyframes loader-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  if (stage === 'hub' && selectedSection) {
    const teacher = schoolData.data.schoolProfile;
    const athleteCount = schoolData.data.players.filter(p => p.category === 'athlete').length;
    
    return (
      <div className="min-h-screen flex flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('selector')}>
              <div className="rounded-full w-9 h-9 shadow-sm overflow-hidden bg-white border shrink-0 flex items-center justify-center relative">
                <Image src={LOGO_PATH} alt="Logo" width={36} height={36} unoptimized className="object-cover" priority />
              </div>
              <h1 className="text-base font-display font-black uppercase text-primary leading-none tracking-tight">
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
            
            <TabsContent value="home" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <div className="flex bg-muted/40 p-1.5 rounded-2xl border w-fit mb-6 shadow-inner">
                <button 
                  onClick={() => setSubTab("overview")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "overview" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Overview</button>
                <button 
                  onClick={() => setSubTab("roster")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "roster" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Full Roster</button>
                <button 
                  onClick={() => setSubTab("enroll")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "enroll" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >New Enrollment</button>
              </div>

              {subTab === "overview" && (
                <div className="space-y-10">
                  {/* FEATURED DASHBOARD COMMAND CENTER */}
                  <Card className="rounded-[3.5rem] bg-primary p-12 text-white shadow-2xl relative overflow-hidden group border-none">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-3">
                          <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">Institutional Dashboard</Badge>
                          <h2 className="text-5xl font-display font-black leading-tight tracking-tighter uppercase">
                            Welcome Back,<br/>{teacher.teacherName.split(' ')[0]}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3 flex items-center gap-2"><Timer className="w-3.5 h-3.5 text-accent" /> Today&apos;s Practice</p>
                              <p className="text-2xl font-black uppercase tracking-tight">Kabaddi Drills</p>
                              <p className="text-sm font-bold text-white/60">16:30 • Main Ground</p>
                           </div>
                           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3 flex items-center gap-2"><UsersRound className="w-3.5 h-3.5 text-accent" /> Enrolled Athletes</p>
                              <p className="text-4xl font-black uppercase tracking-tighter">{athleteCount}</p>
                              <p className="text-sm font-bold text-white/60">Active Registry</p>
                           </div>
                        </div>

                        <Button onClick={() => setSubTab('roster')} className="h-20 w-full md:w-auto px-12 rounded-3xl bg-accent text-accent-foreground font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-primary transition-all active-scale text-lg">
                          Manage Students <ArrowRight className="ml-4 w-6 h-6" />
                        </Button>
                      </div>

                      <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center"><Activity className="text-emerald-400 w-6 h-6" /></div>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Synchronized</span>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Attendance consistency</p>
                           <p className="text-3xl font-black">94% <span className="text-sm font-bold text-emerald-400 ml-2">↑ 2%</span></p>
                         </div>

                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center"><Trophy className="text-orange-400 w-6 h-6" /></div>
                              <Badge variant="outline" className="text-white/40 border-white/10 text-[9px] uppercase">Coming Soon</Badge>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Upcoming Tournament</p>
                           <p className="text-2xl font-black uppercase tracking-tight">District Kabaddi</p>
                           <p className="text-xs font-bold text-white/40 mt-1 flex items-center gap-2"><CalendarDays className="w-3 h-3" /> 15th October 2024</p>
                         </div>

                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center"><Target className="text-blue-400 w-6 h-6" /></div>
                              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Institutional Fitness Goal</p>
                           <p className="text-2xl font-black uppercase tracking-tight">90% Peak Fitness</p>
                           <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                              <div className="h-full bg-blue-400 w-[78%]" />
                           </div>
                         </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none group-hover:bg-accent/30 transition-all duration-700" />
                  </Card>

                  {/* Quick Action Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card onClick={() => setActiveTab('sport')} className="group cursor-pointer bg-white rounded-[2.5rem] border-2 border-primary/10 p-2 overflow-hidden shadow-lg active-scale transition-all">
                        <div className="flex items-center justify-between p-6">
                           <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                 <Zap className="w-10 h-10" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Open Training Deck</h3>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access technical drills</p>
                              </div>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                              <ChevronRight className="w-6 h-6 text-primary" />
                           </div>
                        </div>
                     </Card>

                     <Card onClick={() => setSubTab('enroll')} className="group cursor-pointer bg-white rounded-[2.5rem] border-2 border-accent/10 p-2 overflow-hidden shadow-lg active-scale transition-all">
                        <div className="flex items-center justify-between p-6">
                           <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-accent/5 rounded-[1.5rem] flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                 <UserCircle className="w-10 h-10" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">New Registration</h3>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enroll a new student</p>
                              </div>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                              <ChevronRight className="w-6 h-6 text-accent" />
                           </div>
                        </div>
                     </Card>
                  </div>
                </div>
              )}

              {subTab === "roster" && <Dashboard store={schoolData} section={selectedSection} t={t} />}
              {subTab === "enroll" && <Registration store={schoolData} section={selectedSection} language={language} />}
            </TabsContent>

            <TabsContent value="sport" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <GameHub store={schoolData} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 space-y-8 animate-in fade-in duration-700">
              <div className="flex bg-muted/40 p-1.5 rounded-2xl border w-fit mb-6 overflow-x-auto scrollbar-hide max-w-full shadow-inner">
                <button 
                  onClick={() => setSubTab("attendance")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] whitespace-nowrap tracking-widest transition-all", subTab === "attendance" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Attendance</button>
                <button 
                  onClick={() => setSubTab("performance")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] whitespace-nowrap tracking-widest transition-all", subTab === "performance" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Performance</button>
                <button 
                  onClick={() => setSubTab("medical")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] whitespace-nowrap tracking-widest transition-all", subTab === "medical" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Medical Reports</button>
                <button 
                  onClick={() => setSubTab("fitness")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] whitespace-nowrap tracking-widest transition-all", subTab === "fitness" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Fitness Tracking</button>
              </div>
              
              {subTab === "attendance" && <Attendance store={schoolData} section={selectedSection} />}
              {subTab === "performance" && <History store={schoolData} section={selectedSection} />}
              {subTab === "medical" && <HealthIncidents store={schoolData} section={selectedSection} />}
              {subTab === "fitness" && <Fitness store={schoolData} section={selectedSection} />}
            </TabsContent>

            <TabsContent value="profile" className="mt-0 space-y-8 animate-in fade-in duration-700">
               <div className="flex bg-muted/40 p-1.5 rounded-2xl border w-fit mb-6 shadow-inner">
                <button 
                  onClick={() => setSubTab("profile")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "profile" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Teacher Profile</button>
                <button 
                  onClick={() => setSubTab("settings")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "settings" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Settings</button>
              </div>
              {subTab === "profile" ? <SchoolRegistration store={schoolData} /> : <Settings language={language} setLanguage={setLanguage} />}
            </TabsContent>

          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50 overflow-x-auto scrollbar-hide">
          <div className="h-full flex items-center justify-start md:justify-center gap-4 px-6 min-w-max">
            {sportsTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setSubTab(tab.id === 'home' ? 'overview' : tab.id === 'students' ? 'attendance' : 'skills'); }} 
                data-active={activeTab === tab.id} 
                className={cn("google-nav-item min-w-[80px] md:min-w-[100px] flex flex-col items-center gap-1 transition-all", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}
              >
                <div className={cn("google-nav-icon w-14 h-8 flex items-center justify-center rounded-full transition-all", activeTab === tab.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <span className="google-nav-label text-[10px] font-display font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
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
            <h2 className="text-3xl font-display font-black text-primary tracking-tighter uppercase">{t.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => { setSelectedSection('sports'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Athletics & Training</p>
            </button>
            <button onClick={() => { setSelectedSection('general'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <School className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tight">{t.studentRegistry}</h3>
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
            <h1 className="text-4xl md:text-6xl font-display font-black text-primary tracking-tighter leading-tight uppercase">
              {language === 'Marathi' ? "शासकीय माध्यमिक" : "ASHRAM SHALA"}<br/>
              <span className="text-accent">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "WAGHAMBA HUB"}</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-sm mx-auto">
          <Button onClick={() => setStage('selector')} className="h-20 rounded-[2rem] bg-primary text-white text-lg font-display font-black uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all active-scale group">
            {isUserLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.enter} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" /></>}
          </Button>
          <button onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')} className="text-[10px] font-display font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> {language === 'English' ? 'मराठी (Marathi)' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}