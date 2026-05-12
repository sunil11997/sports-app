"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import NextDynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Settings as SettingsIcon, 
  ArrowUpCircle, 
  Cake, 
  Menu,
  Loader2,
  FileText,
  HeartPulse,
  ClipboardList,
  TrendingUp,
  UsersRound,
  ArrowRight,
  ShieldCheck,
  Flame,
  Globe,
  BarChart3,
  Dumbbell,
  Star,
  Gift,
  User,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';

// Force dynamic to prevent prerendering errors with Firebase
export const dynamic = 'force-dynamic';

const Registration = NextDynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { ssr: false, loading: () => <TableSkeleton /> });
const Dashboard = NextDynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { ssr: false, loading: () => <TableSkeleton /> });
const Attendance = NextDynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { ssr: false, loading: () => <TableSkeleton /> });
const Fitness = NextDynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { ssr: false, loading: () => <TableSkeleton /> });
const AIAdvice = NextDynamic(() => import('@/components/features/AIAdvice').then(mod => mod.AIAdvice), { ssr: false, loading: () => <StatsSkeleton /> });
const TournamentRosters = NextDynamic(() => import('@/components/features/TournamentRosters').then(mod => mod.TournamentRosters), { ssr: false, loading: () => <TableSkeleton /> });
const ClassesSection = NextDynamic(() => import('@/components/features/ClassesSection').then(mod => mod.ClassesSection), { ssr: false, loading: () => <StatsSkeleton /> });
const Settings = NextDynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { ssr: false, loading: () => <StatsSkeleton /> });
const PromotionHub = NextDynamic(() => import('@/components/features/PromotionHub').then(mod => mod.PromotionHub), { ssr: false, loading: () => <StatsSkeleton /> });
const SportsSkills = NextDynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { ssr: false, loading: () => <TableSkeleton /> });
const DailyReport = NextDynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { ssr: false, loading: () => <TableSkeleton /> });
const SportsDrills = NextDynamic(() => import('@/components/features/SportsDrills').then(mod => mod.SportsDrills), { ssr: false, loading: () => <TableSkeleton /> });
const HealthIncidents = NextDynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { ssr: false, loading: () => <TableSkeleton /> });
const PersonalDashboard = NextDynamic(() => import('@/components/features/History').then(mod => mod.History), { ssr: false, loading: () => <TableSkeleton /> });
const SchoolActivities = NextDynamic(() => import('@/components/features/SchoolActivities').then(mod => mod.SchoolActivities), { ssr: false, loading: () => <TableSkeleton /> });
const Teams = NextDynamic(() => import('@/components/features/Teams').then(mod => mod.Teams), { ssr: false, loading: () => <TableSkeleton /> });
const ExamsHub = NextDynamic(() => import('@/components/features/ExamsHub').then(mod => mod.ExamsHub), { ssr: false, loading: () => <TableSkeleton /> });

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    sportsHub: "Sports Excellence",
    studentRegistry: "Student Registry",
    switchHub: "Switch Hub",
    home: "Home", register: "Enroll", roster: "List", promote: "Next Year", tourney: "Tourney", teams: "Teams", report: "Report", history: "Analytics", presence: "Attendance", fitness: "Tests", skills: "Skills", drills: "Coach", health: "Health", aiHub: "AI Hub", settings: "Settings", enroll: "Enroll", registry: "Registry", exams: "Exams", session: "Session", activities: "Activities", rules: "Rules",
    coreHub: "Core Hub",
    enter: "ACCESS HUB", syncNote: "Registry available on this device", onlineStatus: "Online", offlineStatus: "Local",
    installApp: "INSTALL APP"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    sportsHub: "क्रीडा विभाग",
    studentRegistry: "विद्यार्थी नोंदणी",
    switchHub: "हब बदला",
    home: "मुख्यपृष्ठ", register: "नोंदणी", roster: "यादी", promote: "प्रमोशन", tourney: "स्पर्धा", teams: "संघ", report: "अहवाल", history: "Analytics", presence: "उपस्थिती", fitness: "चाचणी", skills: "कौशल्ये", drills: "कोचिंग", health: "आरोग्य", aiHub: "AI केंद्र", settings: "सेटिंग्ज", enroll: "नावनोंदणी", registry: "नोंदणी वही", exams: "परीक्षा", session: "सत्र", activities: "उपक्रम", rules: "नियम",
    coreHub: "प्रशिक्षण",
    enter: "हब मध्ये प्रवेश करा", syncNote: "डेटा या डिव्हाइसवर उपलब्ध असेल", onlineStatus: "ऑनलाइन", offlineStatus: "ऑफलाइन",
    installApp: "ॲप इन्स्टॉल करा"
  }
};

export default function WaghambaApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  
  const schoolData = useSchoolData(stage === 'hub');
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      const timer = setTimeout(() => {
        initiateAnonymousSignIn(auth);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, auth, isMounted]);

  const t = translations[language];
  const LOGO_PATH = "/icon-512.png";

  const sportsTabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "registration", label: t.register, icon: UserPlus },
    { id: "dashboard", label: t.roster, icon: ClipboardList },
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
    { id: "dashboard", label: t.roster, icon: ClipboardList },
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
    if (!schoolData.data.players) return [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    return schoolData.data.players.filter(p => {
      if (!p.dob) return false;
      const d = new Date(p.dob);
      return (d.getMonth() + 1) === currentMonth && d.getDate() === currentDay;
    });
  }, [schoolData.data.players]);

  const topPerformers = useMemo(() => {
    if (selectedSection !== 'sports' || !schoolData.data.players) return [];
    const sports = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
    
    return sports.map(sport => {
      const athletesInSport = schoolData.data.players.filter(p => 
        p.category === 'athlete' && p.sports?.includes(sport)
      );
      
      let topPlayer: any = null;
      let highestScore = -1;

      athletesInSport.forEach(p => {
        const skill = schoolData.data.sportSkills[`${p.id}_${sport}`];
        if (skill) {
          const score = parseFloat(skill.score) || 0;
          if (score > highestScore) {
            highestScore = score;
            topPlayer = p;
          }
        }
      });

      return { sport, player: topPlayer, score: highestScore };
    }).filter(item => item.player !== null);
  }, [selectedSection, schoolData.data.players, schoolData.data.sportSkills]);

  const enterHub = (section: 'sports' | 'general') => {
    setSelectedSection(section);
    setStage('hub');
    setActiveTab('home');
  };

  if (!isMounted) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.3em]">Waghamba Hub V3.1...</p>
      </div>
    </div>
  );

  if (stage === 'hub' && selectedSection) {
    const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;
    const teacher = schoolData.data.schoolProfile;

    return (
      <div className="min-h-screen flex flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b py-3 px-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('selector')}>
              <div className="rounded-full w-9 h-9 shadow-sm overflow-hidden bg-white border relative">
                <Image src={LOGO_PATH} alt="Logo" fill unoptimized className="object-cover" />
              </div>
              <h1 className="text-base font-black uppercase text-primary leading-none tracking-tight">
                {selectedSection === 'sports' ? "Sports" : "Students"}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={schoolData.selectedYear} onValueChange={schoolData.setSelectedYear}>
                <SelectTrigger className="h-8 border bg-white font-black uppercase text-[9px] w-[90px] rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setStage('selector')} className="rounded-full h-8 w-8 text-primary">
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
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Welcome, {teacher.teacherName.split(' ')[0]}</h2>
                      <p className="text-muted-foreground font-medium text-sm">Dashboard Overview • Academic Year {schoolData.selectedYear}</p>
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
                        {selectedSection === 'general' 
                          ? schoolData.data.players.length 
                          : schoolData.data.players.filter(p => p.category === 'athlete').length}
                      </h3>
                      <p className="text-sm font-bold opacity-60 uppercase mt-2">Registered Registry</p>
                      <Button onClick={() => setActiveTab('registration')} className="bg-white text-primary rounded-full font-black uppercase text-[10px] px-8 h-10 mt-6 shadow-lg">
                        Add New
                      </Button>
                    </Card>
                    <Card onClick={() => setActiveTab('dashboard')} className="google-card p-8 flex flex-col justify-between cursor-pointer group">
                      <ClipboardList className="w-10 h-10 text-accent" />
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">Open</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Full Registry</p>
                      </div>
                    </Card>
                    <Card onClick={() => setActiveTab('fitness')} className="google-card p-8 flex flex-col justify-between cursor-pointer group">
                      <Activity className="w-10 h-10 text-primary" />
                      <div className="mt-4">
                        <p className="text-4xl font-black text-primary">{Object.keys(schoolData.data.fitness).length}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Logs</p>
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
                        <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-accent/10">
                           <Activity className="w-10 h-10 text-accent" />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                           <h4 className="text-xl font-black text-primary uppercase tracking-tight">Active Activity Flow</h4>
                           <p className="text-sm font-medium text-foreground/60 leading-tight">Monitoring {schoolData.data.activities.length} institutional drills and sessions for the current term.</p>
                           <Button variant="ghost" onClick={() => setActiveTab('ai')} className="text-[10px] font-black text-accent uppercase p-0 h-auto mt-2 hover:bg-transparent">Open AI Analysis Assistant <ArrowRight className="w-3 h-3 ml-2" /></Button>
                        </div>
                     </Card>
                  </div>

                  {selectedSection === 'sports' && topPerformers.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-accent fill-accent" />
                        <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Discipline Leaders</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topPerformers.map((item, idx) => (
                          <Card key={idx} className="google-card p-5 border-l-4 border-accent relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{item.sport}</span>
                              <p className="font-black text-primary uppercase text-sm truncate">{item.player.name}</p>
                              <Badge variant="outline" className="w-fit text-[9px] font-black border-accent/20 text-accent bg-accent/5">
                                Score: {item.score}
                              </Badge>
                            </div>
                            <Trophy className="absolute -right-2 -bottom-2 w-12 h-12 text-accent/5 group-hover:scale-110 transition-transform" />
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSection === 'general' && birthdaysToday.length > 0 && (
                    <Card className="rounded-[2.5rem] border-none bg-accent/5 p-8 shadow-inner border border-accent/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift className="w-32 h-32 text-accent" />
                      </div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                          <Cake className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-primary uppercase tracking-tight">Happy Birthday!</h3>
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Celebrating our students today</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {birthdaysToday.map((student: any) => (
                          <div key={student.id} className="bg-white/80 backdrop-blur p-5 rounded-[2rem] shadow-sm flex items-center gap-4 border border-white/50">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/5">
                              {student.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-primary uppercase text-sm leading-none">{student.name}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Std {student.std} • Happy Wishes!</p>
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
              <TabsContent value="dashboard" className="mt-0">{activeTab === "dashboard" && <Dashboard store={schoolData} section={selectedSection} t={t} onTabChange={setActiveTab} />}</TabsContent>
              <TabsContent value="registration" className="mt-0">{activeTab === "registration" && <Registration store={schoolData} section={selectedSection} language={language} />}</TabsContent>
              <TabsContent value="attendance" className="mt-0">{activeTab === "attendance" && <Attendance store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="fitness" className="mt-0">{activeTab === "fitness" && <Fitness store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="skills" className="mt-0">{activeTab === "skills" && <SportsSkills store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="drills" className="mt-0">{activeTab === "drills" && <SportsDrills store={schoolData} />}</TabsContent>
              <TabsContent value="activities" className="mt-0">{activeTab === "activities" && <SchoolActivities store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="health" className="mt-0">{activeTab === "health" && <HealthIncidents store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="history" className="mt-0">{activeTab === "history" && <PersonalDashboard store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="report" className="mt-0">{activeTab === "report" && <DailyReport store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="ai" className="mt-0">{activeTab === "ai" && <AIAdvice store={schoolData} />}</TabsContent>
              <TabsContent value="settings" className="mt-0">{activeTab === "settings" && <Settings language={language} setLanguage={setLanguage} />}</TabsContent>
              <TabsContent value="promotion" className="mt-0">{activeTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection} />}</TabsContent>
              <TabsContent value="classes" className="mt-0">{activeTab === "classes" && <ClassesSection store={schoolData} />}</TabsContent>
              <TabsContent value="exams" className="mt-0">{activeTab === "exams" && <ExamsHub store={schoolData} />}</TabsContent>
              <TabsContent value="tournament" className="mt-0">{activeTab === "tournament" && <TournamentRosters store={schoolData} />}</TabsContent>
              <TabsContent value="teams" className="mt-0">{activeTab === "teams" && <Teams store={schoolData} />}</TabsContent>
            </div>
          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2 z-50 overflow-x-auto scrollbar-hide">
          <div className="h-full flex items-center justify-start md:justify-center gap-4 px-6 min-w-max">
            {currentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "google-nav-item min-w-[80px] md:min-w-[100px] flex flex-col items-center gap-1 transition-all",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "google-nav-icon w-14 h-8 flex items-center justify-center rounded-full transition-all",
                  activeTab === tab.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {tab.label}
                </span>
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
            <button onClick={() => setStage('landing')} className="w-16 h-16 bg-white rounded-2xl shadow-xl mx-auto border border-primary/5 active-scale mb-4 overflow-hidden relative">
              <Image src={LOGO_PATH} alt="Logo" fill unoptimized className="object-cover" />
            </button>
            <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{t.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => enterHub('sports')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Medal className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{t.sportsHub}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Athletics & Coaching</p>
            </button>
            <button onClick={() => enterHub('general')} className="bg-white rounded-[3rem] p-12 text-center shadow-sm hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <GraduationCap className="w-12 h-12 text-primary mx-auto mb-8 transition-transform group-hover:scale-110" />
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
          <div className="w-32 h-32 bg-white p-6 rounded-[3rem] shadow-2xl mx-auto border-2 border-primary/5 flex items-center justify-center relative">
            <Image src={LOGO_PATH} alt="Logo" width={128} height={128} unoptimized className="object-cover" />
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
          </div>
        </div>
        <div className="flex flex-col gap-4 max-sm mx-auto">
          <Button 
            onClick={() => {
              console.log("WGB: Transitioning to Selector Stage");
              setStage('selector');
            }}
            className="h-20 rounded-[2rem] bg-primary text-white text-lg font-black uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all active-scale group"
          >
            {isUserLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.enter} <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" /></>}
          </Button>
          <button 
            onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')}
            className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" /> {language === 'English' ? 'Marathi' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}