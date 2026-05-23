"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Trophy, 
  UsersRound, 
  UserCircle,
  Activity,
  ArrowRight,
  Flame,
  Menu,
  Star,
  Loader2,
  CalendarDays,
  Target,
  Timer,
  Zap,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  FileText,
  CircleArrowUp,
  BarChart,
  Newspaper,
  Gauge,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { Dashboard } from '@/components/features/Dashboard';
import { Registration } from '@/components/features/Registration';
import { Attendance } from '@/components/features/Attendance';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { Fitness } from '@/components/features/Fitness';
import { DailyReport } from '@/components/features/DailyReport';
import { ExamsHub } from '@/components/features/ExamsHub';
import { PromotionHub } from '@/components/features/PromotionHub';
import { ClassesSection } from '@/components/features/ClassesSection';
import { SportsKnowledge } from '@/components/features/SportsKnowledge';
import { TrainingLoad } from '@/components/features/TrainingLoad';
import { GameHub } from '@/components/features/GameHub';
import { Settings } from '@/components/features/Settings';
import { SchoolRegistration } from '@/components/features/SchoolRegistration';
import { NotificationCenter } from '@/components/features/NotificationCenter';
import { History } from '@/components/features/History';

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    home: "Home",
    sport: "Sport Hub",
    students: "Students",
    profile: "Profile",
    enter: "ACCESS HUB"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    home: "मुख्यपृष्ठ",
    sport: "क्रीडा विभाग",
    students: "विद्यार्थी",
    profile: "प्रोफाइल",
    enter: "हब मध्ये प्रवेश करा"
  }
};

const LOGO_PATH = "/icon-512.png";

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [subTab, setSubTab] = useState<string>("overview");
  const [todayFormatted, setTodayFormatted] = useState("");
  const [headerDate, setHeaderDate] = useState("");
  
  const schoolData = useSchoolData(stage === 'hub' && isMounted);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
    setTodayFormatted(format(new Date(), 'EEEE, do MMMM yyyy'));
    setHeaderDate(format(new Date(), 'dd MMM yyyy'));
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      const timer = setTimeout(() => initiateAnonymousSignIn(auth), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, auth, isMounted]);

  const t = useMemo(() => translations[language], [language]);

  const sportsTabs = useMemo(() => [
    { id: "home", label: t.home, icon: Home },
    { id: "sport", label: t.sport, icon: Trophy },
    { id: "students", label: t.students, icon: UsersRound },
    { id: "profile", label: t.profile, icon: UserCircle },
  ], [t]);

  if (!isMounted) return null;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center p-6 z-[9999] fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 overflow-hidden" />
        <div className="max-w-xs w-full text-center space-y-12 relative z-10">
           <div className="w-56 h-56 mx-auto relative bg-white rounded-full p-2 shadow-[0_0_80px_rgba(255,255,255,0.4)] animate-in zoom-in duration-700 flex items-center justify-center overflow-hidden border-4 border-white/20">
             <Image 
               src={LOGO_PATH} 
               alt="Institutional Logo" 
               width={224}
               height={224}
               unoptimized 
               className="object-contain w-full h-full scale-110" 
               priority 
             />
           </div>
           <div className="space-y-4">
             <h2 className="text-white text-3xl font-display font-black uppercase tracking-[0.2em]">WGB HUB V3.8.2</h2>
             <div className="flex flex-col items-center gap-3">
               <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-1/2 animate-[loader-progress_2s_infinite_ease-in-out]" />
               </div>
               <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.5em]">Synchronizing Registry</p>
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
    const athleteCount = schoolData.data.players.length;
    
    return (
      <div className="min-h-screen flex flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('selector')}>
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full border shadow-sm overflow-hidden">
                <Image src={LOGO_PATH} alt="Logo" width={40} height={40} unoptimized className="object-contain w-full h-full" priority />
              </div>
              <h1 className="text-base font-display font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? "Sports Hub" : "Student Registry"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase whitespace-nowrap tracking-widest">{headerDate}</span>
              </div>
              <button onClick={() => setStage('selector')} className="rounded-full h-8 w-8 text-primary hover:bg-primary/5 flex items-center justify-center transition-colors">
                <Menu className="w-5 h-5" />
              </button>
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
                >Dashboard</button>
                <button 
                  onClick={() => setSubTab("roster")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "roster" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Full Roster</button>
                <button 
                  onClick={() => setSubTab("enroll")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "enroll" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Enrollment</button>
              </div>

              {subTab === "overview" && (
                <div className="space-y-12">
                  <Card className="rounded-[3.5rem] bg-primary p-12 text-white shadow-2xl relative overflow-hidden group border-none">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-3">
                          <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">Command Center</Badge>
                          <h2 className="text-5xl font-display font-black leading-tight tracking-tighter uppercase">
                            Welcome,<br/>{teacher.teacherName.split(' ')[0]}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3 flex items-center gap-2"><Timer className="w-3.5 h-3.5 text-accent" /> Today&apos;s Practice</p>
                              <p className="text-2xl font-black uppercase tracking-tight">Kabaddi Drills</p>
                              <p className="text-sm font-bold text-white/60">16:30 • Main Ground</p>
                           </div>
                           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3 flex items-center gap-2"><UsersRound className="w-3.5 h-3.5 text-accent" /> Students Count</p>
                              <p className="text-4xl font-black uppercase tracking-tighter">{athleteCount}</p>
                              <p className="text-sm font-bold text-white/60">Active Registry</p>
                           </div>
                        </div>

                        <Button onClick={() => setSubTab('roster')} className="h-20 w-full md:w-auto px-12 rounded-3xl bg-accent text-accent-foreground font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-primary transition-all active-scale text-lg">
                          Manage Registry <ArrowRight className="ml-4 w-6 h-6" />
                        </Button>
                      </div>

                      <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-emerald-50/20 rounded-2xl flex items-center justify-center"><Activity className="text-emerald-400 w-6 h-6" /></div>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Synchronized</span>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Attendance consistency</p>
                           <p className="text-3xl font-black">94% <span className="text-sm font-bold text-emerald-400 ml-2">↑ 2%</span></p>
                         </div>

                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-orange-50/20 rounded-2xl flex items-center justify-center"><Trophy className="text-orange-400 w-6 h-6" /></div>
                              <Badge variant="outline" className="text-white/40 border-white/10 text-[9px] uppercase">Coming Soon</Badge>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Upcoming Tournament</p>
                           <p className="text-2xl font-black uppercase tracking-tight">District Kabaddi</p>
                           <p className="text-xs font-bold text-white/40 mt-1 flex items-center gap-2"><CalendarDays className="w-3 h-3" /> 15th Oct 2024</p>
                         </div>

                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-blue-50/20 rounded-2xl flex items-center justify-center"><Target className="text-blue-400 w-6 h-6" /></div>
                              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Fitness Goal</p>
                           <p className="text-2xl font-black uppercase tracking-tight">90% Peak Fitness</p>
                           <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                              <div className="h-full bg-blue-400 w-[78%]" />
                           </div>
                         </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Newspaper className="w-7 h-7 text-primary" />
                            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Today&apos;s Pulse</h3>
                         </div>
                         <Badge className="bg-primary/5 text-primary border-primary/10 px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                           <CalendarDays className="w-3.5 h-3.5" /> {todayFormatted}
                         </Badge>
                      </div>
                      <SportsKnowledge type="news" />
                    </div>
                    <div className="lg:col-span-4">
                      <SportsKnowledge type="history" />
                    </div>
                  </div>
                </div>
              )}

              {subTab === "roster" && <Dashboard store={schoolData} section={selectedSection || 'general'} t={t} />}
              {subTab === "enroll" && <Registration store={schoolData} section={selectedSection || 'general'} language={language} />}
            </TabsContent>

            <TabsContent value="sport" className="mt-0 animate-in fade-in duration-700">
              <GameHub store={schoolData} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 space-y-8 animate-in fade-in duration-700">
              {subTab === "attendance" || subTab === "performance" || subTab === "fitness" || subTab === "exams" || subTab === "classes" || subTab === "promotion" || subTab === "medical" || subTab === "reports" || subTab === "loads" ? (
                <div className="relative group/scroll">
                  <div className="flex bg-muted/40 p-1.5 rounded-2xl border w-full mb-6 overflow-x-auto scrollbar-hide shadow-inner gap-1">
                    {[
                      { id: "attendance", label: "Attendance", icon: CalendarDays },
                      { id: "performance", label: "Performance", icon: BarChart },
                      { id: "loads", label: "Training Load", icon: Gauge },
                      { id: "fitness", label: "Fitness Tracking", icon: Activity },
                      { id: "exams", label: "Exam Hub", icon: FileText },
                      { id: "classes", label: "Classes Hub", icon: GraduationCap },
                      { id: "promotion", label: "Promotion Hub", icon: CircleArrowUp },
                      { id: "medical", label: "Injury Hub", icon: ShieldAlert },
                      { id: "reports", label: "Daily Reports", icon: ClipboardList }
                    ].map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setSubTab(item.id)} 
                        className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] whitespace-nowrap tracking-widest transition-all shrink-0 flex items-center gap-2", subTab === item.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                      >
                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                      </button>
                    ))}
                    <button onClick={() => setSubTab("all")} className="rounded-xl h-11 px-8 font-black uppercase text-[11px] text-muted-foreground hover:bg-white border-l ml-2 flex items-center gap-2 shrink-0">
                      <Menu className="w-3.5 h-3.5" /> Back to Selector
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                      { id: "attendance", label: "Attendance Registry", desc: "Presence tracking", icon: CalendarDays, color: "bg-blue-500" },
                      { id: "performance", label: "Performance Dossier", desc: "Analytics & Trends", icon: BarChart, color: "bg-indigo-500" },
                      { id: "loads", label: "Training Load (RPE)", desc: "Periodization metrics", icon: Gauge, color: "bg-orange-600" },
                      { id: "fitness", label: "Fitness Evaluations", desc: "Physical test scores", icon: Activity, color: "bg-emerald-500" },
                      { id: "exams", label: "Institutional Exams", desc: "Term-wise grading", icon: FileText, color: "bg-amber-500" },
                      { id: "classes", label: "Classes Registry", desc: "Standard wise data", icon: GraduationCap, color: "bg-purple-500" },
                      { id: "promotion", label: "Standard Promotion", desc: "Move students forward", icon: CircleArrowUp, color: "bg-rose-500" },
                      { id: "medical", label: "Injury Hub", desc: "Advanced medical log", icon: ShieldAlert, color: "bg-red-500" },
                      { id: "reports", label: "Daily Briefings", desc: "Archival summaries", icon: ClipboardList, color: "bg-slate-700" }
                    ].map(item => (
                      <Card key={item.id} onClick={() => setSubTab(item.id)} className="border-2 rounded-[2.5rem] p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg", item.color)}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase tracking-tight">{item.label}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{item.desc}</p>
                        <ChevronRight className="absolute bottom-8 right-8 text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </Card>
                    ))}
                </div>
              )}
              
              {subTab === "attendance" && <Attendance store={schoolData} section={selectedSection || 'general'} />}
              {subTab === "performance" && <History store={schoolData} section={selectedSection || 'general'} />}
              {subTab === "loads" && <TrainingLoad store={schoolData} />}
              {subTab === "fitness" && <Fitness store={schoolData} section={selectedSection || 'general'} />}
              {subTab === "exams" && <ExamsHub store={schoolData} />}
              {subTab === "classes" && <ClassesSection store={schoolData} />}
              {subTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection || 'general'} />}
              {subTab === "medical" && <HealthIncidents store={schoolData} section={selectedSection || 'general'} />}
              {subTab === "reports" && <DailyReport store={schoolData} section={selectedSection || 'general'} />}
            </TabsContent>

            <TabsContent value="profile" className="mt-0 space-y-8 animate-in fade-in duration-700">
               <div className="flex bg-muted/40 p-1.5 rounded-2xl border w-fit mb-6 shadow-inner">
                <button 
                  onClick={() => setSubTab("profile")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "profile" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Teacher Profile</button>
                <button 
                  onClick={() => setSubTab("alerts")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "alerts" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Alert Hub</button>
                <button 
                  onClick={() => setSubTab("settings")} 
                  className={cn("rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest transition-all", subTab === "settings" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Settings</button>
              </div>
              {subTab === "profile" ? <SchoolRegistration store={schoolData} /> : subTab === "alerts" ? <NotificationCenter store={schoolData} /> : <Settings language={language} setLanguage={setLanguage} />}
            </TabsContent>

          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50">
          <div className="h-full flex items-center justify-around md:justify-center md:gap-12 max-w-7xl mx-auto">
            {sportsTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setSubTab(tab.id === 'home' ? 'overview' : tab.id === 'students' ? 'all' : 'profile'); }} 
                data-active={activeTab === tab.id} 
                className={cn("google-nav-item min-w-[70px] flex flex-col items-center gap-1 transition-all", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}
              >
                <div className={cn("google-nav-icon w-14 h-8 flex items-center justify-center rounded-full transition-all", activeTab === tab.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <span className="google-nav-label text-[10px] font-display font-black uppercase tracking-widest">{tab.label}</span>
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
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center bg-white rounded-full shadow-2xl border-4 border-primary/10 overflow-hidden">
              <Image src={LOGO_PATH} alt="Logo" width={128} height={128} unoptimized className="object-contain w-full h-full" priority />
            </div>
            <h2 className="text-3xl font-display font-black text-primary tracking-tighter uppercase">{t.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => { setSelectedSection('sports'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tight">Sports Hub</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Athletics & Training</p>
            </button>
            <button onClick={() => { setSelectedSection('general'); setStage('hub'); setActiveTab('home'); setSubTab('overview'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <UsersRound className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tight">Student Registry</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Profiles & Records</p>
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
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center overflow-hidden bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-primary/5">
            <Image src={LOGO_PATH} alt="Logo" width={256} height={256} unoptimized className="object-contain w-full h-full" priority />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/10 mb-2">
              <Flame className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-primary tracking-tighter leading-tight uppercase">
              {language === 'Marathi' ? "शासकीय माध्यमिक" : "WAGHAMBA"}<br/>
              <span className="text-accent">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "SPORTS HUB"}</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          <Button onClick={isUserLoading ? undefined : () => setStage('selector')} className="h-20 rounded-[2rem] bg-primary text-white text-lg font-display font-black uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all active-scale group">
            {isUserLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{translations[language].enter} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" /></>}
          </Button>
          <button onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')} className="text-[10px] font-display font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> {language === 'English' ? 'मराठी (Marathi)' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}
