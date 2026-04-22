
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
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Medal,
  ScrollText,
  Library,
  Play,
  Newspaper,
  Calendar,
  PenTool,
  Clock
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
import { SportsLibrary } from '@/components/features/SportsLibrary';
import { GamePlanning } from '@/components/features/GamePlanning';
import { SportsKnowledge } from '@/components/features/SportsKnowledge';

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
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

  const handleSectionSelect = (section: 'sports' | 'general') => {
    setSelectedSection(section);
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-xl w-full text-center space-y-12">
          <div className="space-y-8">
            <div className="w-36 h-36 bg-white rounded-[3rem] flex items-center justify-center mx-auto border shadow-2xl overflow-hidden">
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
                <School className="w-14 h-14 text-primary" />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight px-4 uppercase">
                {SCHOOL_NAME}
              </h1>
              <p className="text-primary font-black tracking-[0.3em] text-[10px] uppercase opacity-80">
                आदिवासी विकास विभाग • महाराष्ट्र शासन
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={handleStartHub}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black text-2xl h-24 rounded-[2rem] shadow-xl active:scale-95 transition-all group"
            >
              ENTER
              <ArrowRight className="ml-3 w-8 h-8" />
            </Button>
            <p className="mt-8 text-primary/20 text-[9px] font-black uppercase tracking-[0.5em]">
              V3.0 INSTITUTIONAL STACK
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || !schoolData.isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="font-black text-primary tracking-[0.3em] uppercase text-xs">Syncing Registry...</p>
        </div>
      </div>
    );
  }

  // Section Selection Screen
  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight">
              Select Management Section
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => handleSectionSelect('sports')}
              className="group bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary hover:shadow-2xl active:scale-[0.98]"
            >
              <Medal className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">Sports Hub</h3>
              <p className="text-muted-foreground font-medium text-lg">
                Manage athletes, performance scores, technical evaluation, and tournament rosters.
              </p>
            </button>

            <button 
              onClick={() => handleSectionSelect('general')}
              className="group bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary hover:shadow-2xl active:scale-[0.98]"
            >
              <GraduationCap className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">Student Registry</h3>
              <p className="text-muted-foreground font-medium text-lg">
                Manage general students, monthly growth tracking, exam logs, and physical logs.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sportsTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Roster", icon: LayoutDashboard },
    { id: "rules", label: "Rules", icon: ScrollText },
    { id: "drills", label: "Drills", icon: Library },
    { id: "videos", label: "Videos", icon: Play },
    { id: "news", label: "News", icon: Newspaper },
    { id: "events", label: "Events", icon: Calendar },
    { id: "planning", label: "Planning", icon: PenTool },
    { id: "history-sports", label: "History", icon: Clock },
    { id: "daily-report", label: "Report", icon: FileText },
    { id: "tournament", label: "Tourney", icon: ClipboardList },
    { id: "archive", label: "Archives", icon: HistoryIcon },
    { id: "registration", label: "Register", icon: User },
    { id: "attendance", label: "Presence", icon: CalendarCheck },
    { id: "fitness", label: "Fitness", icon: Activity },
    { id: "sports-skills", label: "Skills", icon: Trophy },
    { id: "health", label: "Health", icon: Stethoscope },
    { id: "ai", label: "AI Hub", icon: Sparkles },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const generalTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Registry", icon: LayoutDashboard },
    { id: "daily-report", label: "Session", icon: FileText },
    { id: "archive", label: "Records", icon: HistoryIcon },
    { id: "registration", label: "Enroll", icon: User },
    { id: "attendance", label: "Log", icon: CalendarCheck },
    { id: "fitness", label: "Physicals", icon: Activity },
    { id: "health", label: "Medical", icon: Stethoscope },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="sticky top-0 z-50 bg-white border-b py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="bg-primary/5 p-2 rounded-xl border w-11 h-11 flex items-center justify-center">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={32} height={32} />
              ) : (
                <School className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black uppercase text-primary leading-none">
                {selectedSection === 'sports' ? 'Waghamba Sports Hub' : 'Waghamba Registry'}
              </h1>
              <p className="text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{SCHOOL_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedSection(null)}
              className="hidden md:flex text-[10px] font-black text-primary uppercase"
            >
              Switch Hub
            </Button>
            {isOnline ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 font-black px-4 py-1.5 rounded-full text-[10px]">
                <Wifi className="w-3.5 h-3.5 mr-1" /> ONLINE
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-black px-4 py-1.5 rounded-full text-[10px]">
                <WifiOff className="w-3.5 h-3.5 mr-1" /> OFFLINE
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-muted/50 p-1 flex gap-1 rounded-xl min-w-max border">
              {currentTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="rounded-lg px-4 py-2 font-black text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary uppercase tracking-wider"
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="home">
              <Card className="border-0 rounded-[2.5rem] shadow-sm bg-white overflow-hidden">
                <CardContent className="p-16 text-center space-y-10">
                  <div className="w-40 h-40 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto border p-4">
                    {LOGO ? (
                      <Image src={LOGO.imageUrl} alt="Logo" width={110} height={110} />
                    ) : (
                      <School className="w-16 h-16 text-primary" />
                    )}
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tight">{SCHOOL_NAME}</h2>
                    <p className="text-xl font-bold text-muted-foreground uppercase tracking-[0.3em]">आदिवासी विकास विभाग • महाराष्ट्र शासन</p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-white border py-5 px-12 rounded-[2.5rem] shadow-xl">
                        <p className="text-3xl font-black text-primary uppercase">सुनिल देशमुख</p>
                      </div>
                      <Badge className="bg-primary text-white px-6 py-2 rounded-full font-black uppercase text-xs">
                        {selectedSection === 'sports' ? 'Managing Sports Excellence' : 'Managing Institutional Registry'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard">
              <Dashboard store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="rules">
              <SportsLibrary type="rules" />
            </TabsContent>

            <TabsContent value="drills">
              <SportsLibrary type="drills" />
            </TabsContent>

            <TabsContent value="videos">
              <SportsLibrary type="videos" />
            </TabsContent>

            <TabsContent value="news">
              <SportsKnowledge type="news" />
            </TabsContent>

            <TabsContent value="events">
              <SportsKnowledge type="events" />
            </TabsContent>

            <TabsContent value="planning">
              <GamePlanning />
            </TabsContent>

            <TabsContent value="history-sports">
              <SportsKnowledge type="history" />
            </TabsContent>

            <TabsContent value="daily-report">
              <DailyReport store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="tournament">
              <TournamentRosters store={schoolData} />
            </TabsContent>

            <TabsContent value="archive">
              <History store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="registration">
              <Registration store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="attendance">
              <Attendance store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="fitness">
              <Fitness store={schoolData} section={selectedSection} />
            </TabsContent>

            <TabsContent value="sports-skills">
              <SportsSkills store={schoolData} />
            </TabsContent>

            <TabsContent value="ai">
              <AIAdvice store={schoolData} />
            </TabsContent>

            <TabsContent value="health">
              <HealthIncidents store={schoolData} section={selectedSection} />
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
