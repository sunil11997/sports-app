
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Standard imports to eliminate loading flicker on tab switch
import { Registration } from '@/components/features/Registration';
import { Dashboard } from '@/components/features/Dashboard';
import { Attendance } from '@/components/features/Attendance';
import { Fitness } from '@/components/features/Fitness';
import { SportsSkills } from '@/components/features/SportsSkills';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { AIAdvice } from '@/components/features/AIAdvice';
import { DailyReport } from '@/components/features/DailyReport';
import { TournamentRosters } from '@/components/features/TournamentRosters';
import { Settings } from '@/components/features/Settings';
import { History } from '@/components/features/History';

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const schoolData = useSchoolData();
  const { isOnline } = usePWA();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const SCHOOL_NAME = "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
  const LOGO = PlaceHolderImages.find(img => img.id === 'adivasi-vikas-logo');

  useEffect(() => {
    if (isEntered && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [isEntered, user, isUserLoading, auth]);

  const handleStartHub = () => {
    setIsEntered(true);
  };

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-[#113320] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="max-w-xl w-full relative z-10 text-center space-y-12">
          <div className="space-y-8">
            <div className="w-36 h-36 bg-white/10 backdrop-blur-xl rounded-[3rem] flex items-center justify-center mx-auto border border-white/20 shadow-2xl overflow-hidden">
              {LOGO ? (
                <Image 
                  src={LOGO.imageUrl} 
                  alt="Adivasi Vikas Vibhag" 
                  width={100} 
                  height={100} 
                  className="object-contain p-3"
                  data-ai-hint={LOGO.imageHint}
                />
              ) : (
                <School className="w-14 h-14 text-accent" />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight px-4 uppercase">
                {SCHOOL_NAME}
              </h1>
              <p className="text-accent font-black tracking-[0.3em] text-[10px] uppercase opacity-80">
                आदिवासी विकास विभाग • महाराष्ट्र शासन
              </p>
            </div>

            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md py-4 px-8 rounded-2xl border border-white/10 shadow-xl">
              <User className="w-5 h-5 text-accent" />
              <p className="text-white text-lg font-bold">सुनिल देशमुख <span className="text-[10px] opacity-40 ml-2 uppercase font-black tracking-widest">Teacher</span></p>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={handleStartHub}
              className="w-full bg-accent hover:bg-accent/90 text-[#113320] font-black text-2xl h-24 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(138,240,117,0.4)] active:scale-95 transition-all group border-b-8 border-[#235C36]"
            >
              ENTER
              <ArrowRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            <p className="mt-8 text-white/20 text-[9px] font-black uppercase tracking-[0.5em]">
              V2.5 HIGH PERFORMANCE STACK
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || !schoolData.isLoaded) {
    return (
      <div className="min-h-screen bg-[#113320] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-accent/20 rounded-3xl flex items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
          </div>
          <p className="font-black text-accent tracking-[0.3em] uppercase text-xs">Syncing Core...</p>
        </div>
      </div>
    );
  }

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background ios-spring pb-20 md:pb-8">
      <header className="ios-blur sticky top-0 z-50 border-b border-muted py-4 px-6 md:px-8 ios-card-shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer active-scale" onClick={() => navigateTo('home')}>
            <div className="bg-primary/10 p-1.5 rounded-xl overflow-hidden w-11 h-11 flex items-center justify-center border border-primary/5">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={32} height={32} data-ai-hint={LOGO.imageHint} />
              ) : (
                <School className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-black tracking-tight uppercase text-primary leading-none">Waghamba Sports</h1>
              <p className="text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{SCHOOL_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 font-black flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] tracking-widest">
                <Wifi className="w-3.5 h-3.5" /> ONLINE
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-black flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] tracking-widest">
                <WifiOff className="w-3.5 h-3.5" /> OFFLINE
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-muted/50 backdrop-blur-md p-1.5 h-auto flex gap-1 rounded-[1.5rem] min-w-max border shadow-inner">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "daily-report", label: "Report", icon: FileText },
                { id: "tournament", label: "Tourney", icon: ClipboardList },
                { id: "history", label: "History", icon: HistoryIcon },
                { id: "registration", label: "Register", icon: User },
                { id: "attendance", label: "Presence", icon: CalendarCheck },
                { id: "fitness", label: "Fitness", icon: Activity },
                { id: "sports", label: "Skills", icon: Trophy },
                { id: "health", label: "Health", icon: Stethoscope },
                { id: "ai", label: "AI Hub", icon: Sparkles },
                { id: "settings", label: "Settings", icon: SettingsIcon },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-xl px-5 py-3 font-black text-xs transition-all active-scale data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary uppercase tracking-wider",
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
                <Card className="border-0 rounded-[3.5rem] shadow-2xl overflow-hidden bg-white/40 backdrop-blur-2xl relative">
                  <div className="absolute top-0 right-0 p-12">
                    <div className="w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                  </div>
                  <CardContent className="p-16 text-center space-y-10 relative z-10">
                    <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-primary/5 p-4">
                      {LOGO ? (
                        <Image src={LOGO.imageUrl} alt="Logo" width={110} height={110} data-ai-hint={LOGO.imageHint} />
                      ) : (
                        <School className="w-16 h-16 text-primary" />
                      )}
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tight leading-tight">{SCHOOL_NAME}</h2>
                      <div className="h-2 w-32 bg-accent mx-auto rounded-full" />
                      <p className="text-xl font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60">आदिवासी विकास विभाग • महाराष्ट्र शासन</p>
                      
                      <div className="flex items-center justify-center gap-3 bg-white/90 py-5 px-12 rounded-[2.5rem] border shadow-2xl w-fit mx-auto active-scale">
                        <User className="w-7 h-7 text-primary" />
                        <p className="text-3xl font-black text-primary">सुनिल देशमुख</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                      {[
                        { icon: Users, label: "Roster", value: `${schoolData.data.players.length} Active`, color: "bg-blue-500" },
                        { icon: Wifi, label: "Sync", value: "Cloud Live", color: "bg-green-500" },
                        { icon: Stethoscope, label: "Health", value: "Real-time", color: "bg-red-500" },
                        { icon: Trophy, label: "Evals", value: "Ready", color: "bg-yellow-500" }
                      ].map((stat, i) => (
                        <div key={i} className="p-8 bg-white rounded-[2.5rem] border shadow-xl active-scale transition-all">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4", stat.color + "/10")}>
                            <stat.icon className={cn("w-7 h-7", stat.color.replace("bg-", "text-"))} />
                          </div>
                          <h3 className="font-black text-foreground text-[10px] uppercase tracking-widest">{stat.label}</h3>
                          <p className="text-xs font-black text-muted-foreground uppercase mt-2">{stat.value}</p>
                        </div>
                      ))}
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
          </div>
        </Tabs>
      </main>
    </div>
  );
}
