
"use client";

import React, { useState, useEffect } from 'react';
import { useSchoolData } from '@/hooks/use-school-data';
import { Registration } from '@/components/features/Registration';
import { Dashboard } from '@/components/features/Dashboard';
import { Attendance } from '@/components/features/Attendance';
import { Fitness } from '@/components/features/Fitness';
import { SportsSkills } from '@/components/features/SportsSkills';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { Teams } from '@/components/features/Teams';
import { AIAdvice } from '@/components/features/AIAdvice';
import { History } from '@/components/features/History';
import { DailyReport } from '@/components/features/DailyReport';
import { TournamentRosters } from '@/components/features/TournamentRosters';
import { Settings } from '@/components/features/Settings';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Activity, 
  Trophy, 
  Stethoscope, 
  UsersRound, 
  Sparkles,
  School,
  Home,
  History as HistoryIcon,
  User,
  FileText,
  ClipboardList,
  Wifi,
  WifiOff,
  LogIn,
  Settings as SettingsIcon,
  CloudUpload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
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
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center space-y-12">
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
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-2xl px-16 py-8 rounded-full shadow-[0_12px_0_hsl(140,45%,15%)] active:translate-y-2 active:shadow-[0_4px_0_hsl(140,45%,15%)] transition-all border-2 border-primary-foreground/20"
          >
            ENTER PORTAL
          </Button>
          
          <div className="text-primary-foreground/60 text-sm">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/20 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              Cloud Sync Active - Data Protected
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-8 shadow-md border-b-4 border-accent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-accent p-2 rounded-lg">
              <School className="w-8 h-8 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">शासकिय माध्यमिक आश्रम शाळा वाघांबा</h1>
              <p className="text-sm font-medium text-primary-foreground/70">ता. सटाणा जि. नाशिक | क्रिडा शिक्षक - सुनिल देशमुख</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <Badge className="bg-accent text-accent-foreground font-black flex items-center gap-1 px-3 py-1">
                <Wifi className="w-3 h-3" /> ONLINE
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-black flex items-center gap-1 px-3 py-1">
                <WifiOff className="w-3 h-3" /> OFFLINE
              </Badge>
            )}
            {user?.isAnonymous && (
              <Badge variant="outline" className="text-white border-white/40 flex items-center gap-1">
                <CloudUpload className="w-3 h-3" /> GUEST SESSION
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="bg-primary/5 p-1 h-auto flex flex-wrap gap-1 border border-primary/10 rounded-2xl">
            <TabsTrigger value="home" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="w-4 h-4 mr-2" /> Home
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="daily-report" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" /> Daily Report
            </TabsTrigger>
            <TabsTrigger value="tournament" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="w-4 h-4 mr-2" /> Tournament
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HistoryIcon className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" /> Registration
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarCheck className="w-4 h-4 mr-2" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="fitness" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" /> Fitness
            </TabsTrigger>
            <TabsTrigger value="sports" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="w-4 h-4 mr-2" /> Sports
            </TabsTrigger>
            <TabsTrigger value="health" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Stethoscope className="w-4 h-4 mr-2" /> Health
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UsersRound className="w-4 h-4 mr-2" /> Teams
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-bold">
              <Sparkles className="w-4 h-4 mr-2" /> AI Advice
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <SettingsIcon className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="home">
              <Card className="border-4 border-primary/10 rounded-[3rem] shadow-2xl overflow-hidden bg-white">
                <CardContent className="p-12 text-center space-y-8">
                  <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                    <School className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-primary uppercase h2">शासकिय माध्यमिक आश्रम शाळा वाघांबा</h2>
                    <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">ता. सटाणा जि. नाशिक</p>
                    <div className="flex items-center justify-center gap-2 bg-primary/5 py-4 px-8 rounded-2xl border border-primary/10 w-fit mx-auto">
                      <User className="w-6 h-6 text-primary" />
                      <p className="text-2xl font-black text-primary">क्रिडा शिक्षक - सुनिल देशमुख</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-black text-primary uppercase">Roster</h3>
                      <p className="text-sm font-medium">{schoolData.data.players.length} Cloud-Synced Players</p>
                    </div>
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <HistoryIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-black text-primary uppercase">History</h3>
                      <p className="text-sm font-medium">Auto-Backup Enabled</p>
                    </div>
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <Stethoscope className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-black text-primary uppercase">Health</h3>
                      <p className="text-sm font-medium">Secure Records</p>
                    </div>
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-black text-primary uppercase">Sports</h3>
                      <p className="text-sm font-medium">Global Accessibility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="dashboard">
              <Dashboard store={schoolData} />
            </TabsContent>
            <TabsContent value="daily-report">
              <DailyReport store={schoolData} />
            </TabsContent>
            <TabsContent value="tournament">
              <TournamentRosters store={schoolData} />
            </TabsContent>
            <TabsContent value="history">
              <History store={schoolData} />
            </TabsContent>
            <TabsContent value="registration">
              <Registration store={schoolData} />
            </TabsContent>
            <TabsContent value="attendance">
              <Attendance store={schoolData} />
            </TabsContent>
            <TabsContent value="fitness">
              <Fitness store={schoolData} />
            </TabsContent>
            <TabsContent value="sports">
              <SportsSkills store={schoolData} />
            </TabsContent>
            <TabsContent value="health">
              <HealthIncidents store={schoolData} />
            </TabsContent>
            <TabsContent value="teams">
              <Teams store={schoolData} />
            </TabsContent>
            <TabsContent value="ai">
              <AIAdvice store={schoolData} />
            </TabsContent>
            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
