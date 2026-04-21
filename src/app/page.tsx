"use client";

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Activity, 
  Trophy, 
  Stethoscope, 
  Sparkles,
  School,
  Home,
  Settings as SettingsIcon,
  FileText,
  ClipboardList,
  Wifi,
  WifiOff,
  User,
  Loader2,
  History as HistoryIcon,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Dynamic imports with SSR disabled to prevent server-side hangs on client-only logic
const LoadingSpinner = () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

const Registration = dynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { 
  ssr: false,
  loading: LoadingSpinner 
});
const Dashboard = dynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { 
  ssr: false,
  loading: LoadingSpinner 
});
const Attendance = dynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { 
  ssr: false,
  loading: LoadingSpinner 
});
const Fitness = dynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { 
  ssr: false,
  loading: LoadingSpinner 
});
const SportsSkills = dynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { 
  ssr: false,
  loading: LoadingSpinner 
});
const HealthIncidents = dynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { 
  ssr: false,
  loading: LoadingSpinner 
});
const AIAdvice = dynamic(() => import('@/components/features/AIAdvice').then(mod => mod.AIAdvice), { 
  ssr: false,
  loading: LoadingSpinner 
});
const DailyReport = dynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { 
  ssr: false,
  loading: LoadingSpinner 
});
const TournamentRosters = dynamic(() => import('@/components/features/TournamentRosters').then(mod => mod.TournamentRosters), { 
  ssr: false,
  loading: LoadingSpinner 
});
const Settings = dynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { 
  ssr: false,
  loading: LoadingSpinner 
});
const History = dynamic(() => import('@/components/features/History').then(mod => mod.History), { 
  ssr: false,
  loading: LoadingSpinner 
});

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const schoolData = useSchoolData();
  const { isOnline } = usePWA();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const SCHOOL_NAME = "शासकीय माध्यमिक आश्रम शाळा वाघंबा";

  useEffect(() => {
    if (isEntered && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [isEntered, user, isUserLoading, auth]);

  const handleStartHub = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => {
      setShowWelcomeMessage(false);
      setIsEntered(true);
      toast({
        title: "Portal Authorized",
        description: "Institutional features are now active.",
      });
    }, 3000);
  };

  // Welcome Animation Screen
  if (showWelcomeMessage) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#113320] flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/30 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 text-center space-y-12 animate-in zoom-in-95 fade-in duration-1000">
          <div className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <Zap className="w-16 h-16 text-accent" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
              Welcome to New Era of Sport <br/> 
              <span className="text-accent">WAGHAMBA SCHOOL</span>
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-sm">
              {SCHOOL_NAME}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-12 bg-accent rounded-full animate-pulse" />
            <div className="h-1 w-12 bg-white/20 rounded-full" />
            <div className="h-1 w-12 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-[#113320] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="max-w-xl w-full relative z-10">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center">
            <div className="space-y-8">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                <School className="w-12 h-12 text-accent" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight px-4">
                  {SCHOOL_NAME}
                </h1>
                <p className="text-accent font-black tracking-[0.2em] text-sm uppercase opacity-80">
                  ता. सटाणा जि. नाशिक
                </p>
              </div>

              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <p className="text-white text-lg font-bold">सुनिल देशमुख <span className="text-xs opacity-60 ml-1 font-medium">(क्रिडा शिक्षक)</span></p>
              </div>
            </div>

            <div className="pt-8">
              <Button 
                onClick={handleStartHub}
                className="w-full bg-accent hover:bg-accent/90 text-primary font-black text-xl h-20 rounded-[2rem] shadow-[0_15px_40px_-5px_rgba(138,240,117,0.3)] active:scale-95 transition-all group border-b-4 border-primary/20"
              >
                START MANAGEMENT HUB
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                Institutional Performance Version 2.5
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#113320] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <School className="w-20 h-20 text-accent animate-pulse mx-auto" />
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
          </div>
          <p className="font-black text-accent tracking-[0.3em] uppercase text-xs animate-bounce">Establishing Secure Link...</p>
        </div>
      </div>
    );
  }

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background ios-spring animate-in fade-in duration-500 pb-20 md:pb-8">
      <header className="ios-blur sticky top-0 z-50 border-b border-muted py-3 px-6 md:px-8 ios-card-shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer active-scale" onClick={() => navigateTo('home')}>
            <div className="bg-primary p-2 rounded-xl">
              <School className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black tracking-tight uppercase text-primary">वाघंबा स्पोर्ट्स हब</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{SCHOOL_NAME} | सुनिल देशमुख</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 font-bold flex items-center gap-1 px-3 py-1 rounded-full text-[10px]">
                <Wifi className="w-3 h-3" /> ONLINE
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-bold flex items-center gap-1 px-3 py-1 rounded-full text-[10px]">
                <WifiOff className="w-3 h-3" /> OFFLINE
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-muted/80 backdrop-blur-md p-1.5 h-auto flex gap-1 rounded-2xl min-w-max border border-white/50 ios-card-shadow">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "daily-report", label: "Report", icon: FileText },
                { id: "tournament", label: "Tournament", icon: ClipboardList },
                { id: "history", label: "History", icon: HistoryIcon },
                { id: "registration", label: "Register", icon: User },
                { id: "attendance", label: "Presence", icon: CalendarCheck },
                { id: "fitness", label: "Fitness", icon: Activity },
                { id: "sports", label: "Skills", icon: Trophy },
                { id: "health", label: "Health", icon: Stethoscope },
                { id: "ai", label: "AI Hub", icon: Sparkles, color: "active:bg-accent active:text-accent-foreground" },
                { id: "settings", label: "Settings", icon: SettingsIcon },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-xl px-5 py-2.5 font-bold text-sm transition-all active-scale data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary",
                    tab.id === "ai" && "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="home" className="tab-content-enter">
              <div className="space-y-8">
                <Card className="border-0 rounded-[3rem] ios-card-shadow overflow-hidden bg-white/60 backdrop-blur-xl relative">
                  <div className="absolute top-0 right-0 p-8">
                    <div className="w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                  </div>
                  <CardContent className="p-12 text-center space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse border border-primary/5 shadow-inner">
                      <School className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight leading-tight">{SCHOOL_NAME}</h2>
                      <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest opacity-60">High Performance Institutional Portal</p>
                      <div className="flex items-center justify-center gap-2 bg-white/80 py-4 px-10 rounded-[2rem] border border-muted shadow-lg w-fit mx-auto active-scale">
                        <User className="w-6 h-6 text-primary" />
                        <p className="text-2xl font-black text-primary">सुनिल देशमुख</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                      {[
                        { icon: Users, label: "Roster", value: `${schoolData.data.players.length} Active`, color: "bg-blue-500" },
                        { icon: Wifi, label: "Sync", value: "Cloud Live", color: "bg-green-500" },
                        { icon: Stethoscope, label: "Health", value: "Active Logs", color: "bg-red-500" },
                        { icon: Trophy, label: "Status", value: "Eval Ready", color: "bg-yellow-500" }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 bg-white rounded-3xl border border-muted ios-card-shadow active-scale transition-all">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3", stat.color + "/10")}>
                            <stat.icon className={cn("w-6 h-6", stat.color.replace("bg-", "text-"))} />
                          </div>
                          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">{stat.label}</h3>
                          <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <Suspense fallback={<LoadingSpinner />}>
              <TabsContent value="dashboard" className="tab-content-enter">
                <Dashboard store={schoolData} />
              </TabsContent>

              <TabsContent value="daily-report" className="tab-content-enter">
                <DailyReport store={schoolData} />
              </TabsContent>

              <TabsContent value="tournament" className="tab-content-enter">
                <TournamentRosters store={schoolData} />
              </TabsContent>

              <TabsContent value="history" className="tab-content-enter">
                <History store={schoolData} />
              </TabsContent>

              <TabsContent value="registration" className="tab-content-enter">
                <Registration store={schoolData} />
              </TabsContent>

              <TabsContent value="attendance" className="tab-content-enter">
                <Attendance store={schoolData} />
              </TabsContent>

              <TabsContent value="fitness" className="tab-content-enter">
                <Fitness store={schoolData} />
              </TabsContent>

              <TabsContent value="sports" className="tab-content-enter">
                <SportsSkills store={schoolData} />
              </TabsContent>

              <TabsContent value="health" className="tab-content-enter">
                <HealthIncidents store={schoolData} />
              </TabsContent>

              <TabsContent value="ai" className="tab-content-enter">
                <AIAdvice store={schoolData} />
              </TabsContent>

              <TabsContent value="settings" className="tab-content-enter">
                <Settings />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
