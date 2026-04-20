"use client";

import React, { useState, useEffect } from 'react';
import { useSchoolData } from '@/hooks/use-school-data';
import { Registration } from '@/components/features/Registration';
import { Dashboard } from '@/components/features/Dashboard';
import { Attendance } from '@/components/features/Attendance';
import { Fitness } from '@/components/features/Fitness';
import { SportsSkills } from '@/components/features/SportsSkills';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { AIAdvice } from '@/components/features/AIAdvice';
import { DailyReport } from '@/components/features/DailyReport';
import { TournamentRosters } from '@/components/features/TournamentRosters';
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
  History as HistoryIcon,
  User,
  FileText,
  ClipboardList,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';

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
              शासकिय माध्यमिक आश्रम शाळा वाघांबा<br />
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
          <p className="font-bold text-primary animate-bounce">Securely Syncing Data...</p>
        </div>
      </div>
    );
  }

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background animate-in fade-in slide-in-from-right-20 duration-500">
      <header className="ios-blur sticky top-0 z-50 border-b border-primary/10 py-4 px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={() => navigateTo('home')}>
            <div className="bg-primary p-2 rounded-xl">
              <School className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black tracking-tight uppercase text-primary">वाघांबा स्पोर्ट्स हब</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">आश्रम शाळा वाघांबा | सुनिल देशमुख</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 font-bold flex items-center gap-1 px-3 py-1 rounded-full">
                <Wifi className="w-3 h-3" /> ONLINE
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-bold flex items-center gap-1 px-3 py-1 rounded-full">
                <WifiOff className="w-3 h-3" /> OFFLINE
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-muted/50 p-1 h-auto flex gap-1 border border-primary/5 rounded-2xl min-w-max">
              <TabsTrigger value="home" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <Home className="w-4 h-4 mr-2" /> Home
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="daily-report" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <FileText className="w-4 h-4 mr-2" /> Report
              </TabsTrigger>
              <TabsTrigger value="tournament" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <ClipboardList className="w-4 h-4 mr-2" /> Tournament
              </TabsTrigger>
              <TabsTrigger value="registration" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <Users className="w-4 h-4 mr-2" /> Register
              </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <CalendarCheck className="w-4 h-4 mr-2" /> Presence
              </TabsTrigger>
              <TabsTrigger value="fitness" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <Activity className="w-4 h-4 mr-2" /> Fitness
              </TabsTrigger>
              <TabsTrigger value="sports" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <Trophy className="w-4 h-4 mr-2" /> Skills
              </TabsTrigger>
              <TabsTrigger value="health" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all active:scale-95">
                <Stethoscope className="w-4 h-4 mr-2" /> Health
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-xl py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-bold transition-all active:scale-95">
                <Sparkles className="w-4 h-4 mr-2" /> AI
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="home" className="tab-content-enter">
              <div className="space-y-8">
                <Card className="border-0 rounded-[3rem] shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardContent className="p-12 text-center space-y-8">
                    <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                      <School className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black text-primary uppercase tracking-tight">शासकिय माध्यमिक आश्रम शाळा वाघांबा</h2>
                      <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Institutional Sports Hub</p>
                      <div className="flex items-center justify-center gap-2 bg-primary/5 py-4 px-8 rounded-2xl border border-primary/10 w-fit mx-auto active:scale-95 transition-transform">
                        <User className="w-6 h-6 text-primary" />
                        <p className="text-2xl font-black text-primary">सुनिल देशमुख - क्रिडा शिक्षक</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
                      <div className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm active:scale-95 transition-transform">
                        <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-black text-primary uppercase text-sm">Roster</h3>
                        <p className="text-xs font-bold text-muted-foreground">{schoolData.data.players.length} Players</p>
                      </div>
                      <div className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm active:scale-95 transition-transform">
                        <HistoryIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-black text-primary uppercase text-sm">Sync</h3>
                        <p className="text-xs font-bold text-muted-foreground">Auto-Cloud</p>
                      </div>
                      <div className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm active:scale-95 transition-transform">
                        <Stethoscope className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-black text-primary uppercase text-sm">Health</h3>
                        <p className="text-xs font-bold text-muted-foreground">Active Logs</p>
                      </div>
                      <div className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm active:scale-95 transition-transform">
                        <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-black text-primary uppercase text-sm">Skills</h3>
                        <p className="text-xs font-bold text-muted-foreground">Eval Ready</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
          </div>
        </Tabs>
      </main>
    </div>
  );
}

