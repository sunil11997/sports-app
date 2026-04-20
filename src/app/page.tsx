
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';

// Dynamic imports for feature components to speed up initial server startup and page load
const Registration = dynamic(() => import('@/components/features/Registration').then(mod => mod.Registration), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const Dashboard = dynamic(() => import('@/components/features/Dashboard').then(mod => mod.Dashboard), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const Attendance = dynamic(() => import('@/components/features/Attendance').then(mod => mod.Attendance), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const Fitness = dynamic(() => import('@/components/features/Fitness').then(mod => mod.Fitness), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const SportsSkills = dynamic(() => import('@/components/features/SportsSkills').then(mod => mod.SportsSkills), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const HealthIncidents = dynamic(() => import('@/components/features/HealthIncidents').then(mod => mod.HealthIncidents), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const AIAdvice = dynamic(() => import('@/components/features/AIAdvice').then(mod => mod.AIAdvice), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const DailyReport = dynamic(() => import('@/components/features/DailyReport').then(mod => mod.DailyReport), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const TournamentRosters = dynamic(() => import('@/components/features/TournamentRosters').then(mod => mod.TournamentRosters), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});
const Settings = dynamic(() => import('@/components/features/Settings').then(mod => mod.Settings), { 
  loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> 
});

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const schoolData = useSchoolData();
  const { isOnline } = usePWA();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (isEntered && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [isEntered, user, isUserLoading, auth]);

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 animate-in fade-in duration-1000">
        <div className="max-w-3xl w-full text-center space-y-12 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground tracking-tight leading-tight">
              शासकीय माध्यमिक आश्रम शाळा वाघंबा<br />
              <span className="text-2xl md:text-3xl opacity-90 block mt-2">ता. सटाणा जि. नाशिक</span>
            </h1>
            <div className="bg-accent/20 py-3 px-6 rounded-full inline-block border border-primary-foreground/20">
              <p className="text-primary-foreground text-xl font-bold">क्रिडा शिक्षक - सुनिल देशमुख</p>
            </div>
            <p className="text-primary-foreground/80 text-lg md:text-xl font-medium tracking-wide uppercase">
              SPORTS & HEALTH MANAGEMENT SYSTEM
            </p>
          </div>
          <Button 
            onClick={() => setIsEntered(true)}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-2xl px-16 py-8 rounded-full shadow-[0_12px_0_hsl(140,45%,15%)] active:translate-y-2 active:shadow-[0_4px_0_hsl(140,45%,15%)] transition-all border-2 border-primary-foreground/20 active:scale-95"
          >
            ENTER PORTAL
          </Button>
        </div>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <School className="w-16 h-16 text-primary animate-pulse mx-auto" />
          <p className="font-bold text-primary animate-bounce">Establishing Secure Link...</p>
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase">आश्रम शाळा वाघंबा | सुनिल देशमुख</p>
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
            {user?.isAnonymous && (
              <Badge variant="outline" className="border-primary/20 text-primary font-black px-3 py-1 rounded-full text-[10px]">
                GUEST
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
                <Card className="border-0 rounded-[2.5rem] ios-card-shadow overflow-hidden bg-white/60 backdrop-blur-xl">
                  <CardContent className="p-12 text-center space-y-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                      <School className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight leading-tight">शासकीय माध्यमिक आश्रम शाळा वाघंबा</h2>
                      <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest opacity-60">High Performance Institutional Portal</p>
                      <div className="flex items-center justify-center gap-2 bg-white/80 py-4 px-10 rounded-3xl border border-muted ios-card-shadow w-fit mx-auto active-scale">
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

            <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
              <TabsContent value="dashboard" className="tab-content-enter">
                <Dashboard store={schoolData} />
              </TabsContent>

              <TabsContent value="daily-report" className="tab-content-enter">
                <DailyReport store={schoolData} />
              </TabsContent>

              <TabsContent value="tournament" className="tab-content-enter">
                <TournamentRosters store={schoolData} />
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
