"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
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
  ArrowLeft,
  ArrowRight,
  Flame,
  Menu,
  Star,
  Loader2,
  CalendarDays,
  ChevronRight,
  FileText,
  CircleArrowUp,
  Cake,
  TrendingUp,
  History,
  Medal,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PasscodeLock } from '@/components/features/PasscodeLock';

/**
 * SSR Hardening: Features are dynamically imported with ssr: false 
 * to prevent the "Black Screen" caused by server-side execution of browser-only libs.
 */
const Dashboard = dynamic(() => import('@/components/features/Dashboard').then(m => m.Dashboard), { ssr: false });
const Registration = dynamic(() => import('@/components/features/Registration').then(m => m.Registration), { ssr: false });
const Attendance = dynamic(() => import('@/components/features/Attendance').then(m => m.Attendance), { ssr: false });
const Fitness = dynamic(() => import('@/components/features/Fitness').then(m => m.Fitness), { ssr: false });
const DailyReport = dynamic(() => import('@/components/features/DailyReport').then(m => m.DailyReport), { ssr: false });
const ExamsHub = dynamic(() => import('@/components/features/ExamsHub').then(m => m.ExamsHub), { ssr: false });
const PromotionHub = dynamic(() => import('@/components/features/PromotionHub').then(m => m.PromotionHub), { ssr: false });
const GameHub = dynamic(() => import('@/components/features/GameHub').then(m => m.GameHub), { ssr: false });
const Settings = dynamic(() => import('@/components/features/Settings').then(m => m.Settings), { ssr: false });
const PerformanceDossier = dynamic(() => import('@/components/features/History').then(m => m.PerformanceDossier), { ssr: false });
const Gamification = dynamic(() => import('@/components/features/Gamification').then(m => m.Gamification), { ssr: false });
const AIAdvice = dynamic(() => import('@/components/features/AIAdvice').then(m => m.AIAdvice), { ssr: false });
const PerformanceHub = dynamic(() => import('@/components/features/PerformanceHub').then(m => m.PerformanceHub), { ssr: false });
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

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
const SPLASH_LOTTIE_URL = "https://lottie.host/33acb9fa-1151-11ee-9728-ff4c18263730/8X5iIe9y9f.json";

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashData, setSplashData] = useState<any>(null);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [subTab, setSubTab] = useState<string>("overview");
  const [headerDate, setHeaderDate] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const schoolData = useSchoolData(stage === 'hub' || stage === 'selector' || showSplash);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
    setHeaderDate(format(new Date(), 'dd MMM yyyy'));
    
    fetch(SPLASH_LOTTIE_URL)
      .then(res => res.ok ? res.json() : null)
      .then(data => setSplashData(data))
      .catch(() => setSplashData(null));

    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Ensure navigation resets on main tab change to prevent module persistence
  useEffect(() => {
    if (activeTab === 'home') setSubTab('overview');
    else if (activeTab === 'students') setSubTab('list');
  }, [activeTab]);

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

  const birthdaysToday = useMemo(() => {
    if (!isMounted || !schoolData.data.players) return [];
    const today = format(new Date(), 'MM-dd');
    return (schoolData.data.players || []).filter((p: any) => p.dob && p.dob.endsWith(today));
  }, [isMounted, schoolData.data.players]);

  if (!isMounted) return <div className="min-h-screen bg-[#1e3a8a]" />;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center p-6 z-[9999] fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
        <div className="max-w-xs w-full text-center space-y-8 relative z-10">
           <div className="w-64 h-64 mx-auto relative animate-in zoom-in duration-1000">
             {splashData ? (
               <Lottie animationData={splashData} loop={true} className="w-full h-full" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
                 <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">WGB Registry Protocol</p>
               </div>
             )}
           </div>
           <div className="space-y-4">
             <h2 className="text-white text-3xl font-display font-black uppercase tracking-[0.2em]">WGB HUB V4.3.26</h2>
             <div className="flex flex-col items-center gap-3">
               <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-accent w-1/2 animate-[loader-progress_2s_infinite_ease-in-out]" />
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

  if (stage !== 'landing' && schoolData.data.schoolProfile?.passcode && !isUnlocked) {
    return <PasscodeLock correctPasscode={schoolData.data.schoolProfile.passcode} onSuccess={() => setIsUnlocked(true)} teacherEmail={user?.email} />;
  }

  if (stage === 'hub' && selectedSection) {
    const teacher = schoolData.data.schoolProfile;
    const totalAthletes = (schoolData.data.players || []).filter((p: any) => p.category === 'athlete').length;
    const totalStudents = (schoolData.data.players || []).length;
    const activeDisplayCount = selectedSection === 'sports' ? totalAthletes : totalStudents;
    const countLabel = selectedSection === 'sports' ? "Total Athletes" : "Registered Students";
    
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
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{headerDate}</span>
              </div>
              <button onClick={() => setStage('selector')} className="rounded-full h-8 w-8 text-primary hover:bg-primary/5 flex items-center justify-center transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 h-full">
            
            <TabsContent value="home" className="mt-0 space-y-8 animate-in fade-in duration-700 h-full">
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
                  <Card className="rounded-[3.5rem] bg-primary p-12 text-white shadow-2xl relative overflow-hidden border-none">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-3">
                          <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">Command Center</Badge>
                          <h2 className="text-5xl font-display font-black leading-tight tracking-tighter uppercase">
                            Welcome,<br/>{teacher?.teacherName?.split(' ')[0] || "Coach"}
                          </h2>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm max-w-sm">
                           <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3 flex items-center gap-2"><UsersRound className="w-3.5 h-3.5 text-accent" /> {countLabel}</p>
                           <p className="text-5xl font-black uppercase tracking-tighter">{activeDisplayCount}</p>
                           <p className="text-sm font-bold text-white/60">Active Registry</p>
                        </div>
                        <Button onClick={() => setSubTab('roster')} className="h-20 w-full md:auto px-12 rounded-3xl bg-accent text-accent-foreground font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-primary transition-all active-scale text-lg">
                          Manage Registry <ArrowRight className="ml-4 w-6 h-6" />
                        </Button>
                      </div>

                      <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                         {selectedSection === 'general' && birthdaysToday.length > 0 && (
                           <div className="bg-accent rounded-[2.5rem] p-8 border border-white/10 shadow-xl">
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto"><Cake className="text-white w-6 h-6 animate-bounce" /></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Today&apos;s Birthdays</span>
                             </div>
                             <div className="space-y-3">
                               {birthdaysToday.map((p: any) => (
                                 <div key={p.id} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                                   <p className="text-sm font-black uppercase text-white">{p.name}</p>
                                   <Badge className="bg-white text-accent font-black text-[9px]">Std {p.std}</Badge>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                         <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-emerald-50/20 rounded-2xl flex items-center justify-center"><Activity className="text-emerald-400 w-6 h-6" /></div>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Synchronized</span>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Attendance consistency</p>
                           <p className="text-3xl font-black">94% <span className="text-sm font-bold text-emerald-400 ml-2">↑ 2%</span></p>
                         </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {subTab === "roster" && <Dashboard store={schoolData} section={selectedSection || 'general'} t={t} />}
              {subTab === "enroll" && <Registration store={schoolData} section={selectedSection || 'general'} />}
            </TabsContent>

            <TabsContent value="sport" className="mt-0 h-full">
              <GameHub store={schoolData} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 space-y-8 animate-in fade-in duration-700 h-full">
              {subTab === "list" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                      { id: "leaderboard", label: "Leaderboard", desc: "Digital Appreciation", icon: Medal, color: "bg-amber-500" },
                      { id: "ai", label: "AI Coaching Hub", desc: "Predictive Analytics", icon: BrainCircuit, color: "bg-purple-600" },
                      { id: "performance", label: "History Dossier", desc: "Consolidated Records", icon: History, color: "bg-indigo-500" },
                      { id: "monthly-progress", label: "Monthly Progress", desc: "Athletic Metrics Registry", icon: TrendingUp, color: "bg-emerald-600" },
                      { id: "attendance", label: "Attendance Registry", desc: "Presence tracking", icon: CalendarDays, color: "bg-blue-500" },
                      { id: "fitness", label: "Fitness Evaluations", desc: "Physical test scores", icon: Activity, color: "bg-emerald-500" },
                      { id: "exams", label: "Institutional Exams", desc: "Term-wise grading", icon: FileText, color: "bg-amber-500" },
                      { id: "promotion", label: "Standard Promotion", desc: "Move students forward", icon: CircleArrowUp, color: "bg-rose-500" },
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
              ) : (
                <div className="space-y-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSubTab("list")}
                    className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
                  </Button>
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {subTab === "leaderboard" && <Gamification store={schoolData} />}
                    {subTab === "ai" && <AIAdvice store={schoolData} />}
                    {subTab === "performance" && <PerformanceDossier store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "monthly-progress" && <PerformanceHub store={schoolData} />}
                    {subTab === "attendance" && <Attendance store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "fitness" && <Fitness store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "exams" && <ExamsHub store={schoolData} language={language} />}
                    {subTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection || 'general'} language={language} />}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="mt-0 h-full">
               <Settings language={language} setLanguage={setLanguage} />
            </TabsContent>

          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50">
          <div className="h-full flex items-center justify-around md:justify-center md:gap-12 max-w-7xl mx-auto">
            {sportsTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
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
            <button onClick={() => { setSelectedSection('sports'); setStage('hub'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tight">Sports Hub</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Athletics & Training</p>
            </button>
            <button onClick={() => { setSelectedSection('general'); setStage('hub'); }} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
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
      <div className="relative z-10 max-w-2xl w-full text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center overflow-hidden bg-white rounded-full shadow-2xl border-4 border-primary/5">
            <Image src={LOGO_PATH} alt="Logo" width={256} height={256} unoptimized className="object-contain w-full h-full" priority />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-primary tracking-tighter leading-tight uppercase">
            {language === 'Marathi' ? "शासकीय माध्यमिक" : "WAGHAMBA"}<br/>
            <span className="text-accent">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "SPORTS HUB"}</span>
          </h1>
        </div>
        <div className="flex flex-col gap-4 max-sm mx-auto w-full">
          <Button onClick={() => setStage('selector')} className="h-20 rounded-[2rem] bg-primary text-white text-lg font-display font-black uppercase tracking-widest shadow-xl active-scale">
            {translations[language].enter} <ArrowRight className="ml-4 w-6 h-6" />
          </Button>
          <button onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')} className="text-[10px] font-display font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> {language === 'English' ? 'मराठी (Marathi)' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}