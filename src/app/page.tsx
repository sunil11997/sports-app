
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
  GraduationCap,
  Medal,
  Trophy as TrophyIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/providers/pwa-provider';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Feature Components
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
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const schoolData = useSchoolData();
  const { isOnline } = usePWA();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const SCHOOL_NAME = "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
  const LOGO = PlaceHolderImages.find(img => img.id === 'adivasi-vikas-logo');
  const HERO_IMAGE = PlaceHolderImages.find(img => img.id === 'school-sports-hero');

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

  const handleTabChange = (value: string) => {
    setIsTabChanging(true);
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Minimal timeout for consistent UX
    setTimeout(() => setIsTabChanging(false), 200);
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
              className="w-full bg-primary hover:bg-primary/90 text-white font-black text-2xl h-24 rounded-[2rem] shadow-xl transition-all"
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

  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight">
            Select Management Section
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => handleSectionSelect('sports')}
              className="bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary"
            >
              <Medal className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">Sports Hub</h3>
              <p className="text-muted-foreground font-medium text-lg">
                Manage athletes, performance scores, and tournament rosters.
              </p>
            </button>

            <button 
              onClick={() => handleSectionSelect('general')}
              className="bg-white border-2 border-primary/10 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary"
            >
              <GraduationCap className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-black text-primary uppercase mb-3">Student Registry</h3>
              <p className="text-muted-foreground font-medium text-lg">
                Manage general student growth logs and physical registry.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sportsTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Roster", icon: LayoutDashboard },
    { id: "daily-report", label: "Report", icon: FileText },
    { id: "tournament", label: "Tourney", icon: ClipboardList },
    { id: "archive", label: "History", icon: HistoryIcon },
    { id: "registration", label: "Register", icon: User },
    { id: "attendance", label: "Presence", icon: CalendarCheck },
    { id: "fitness", label: "Fitness", icon: Activity },
    { id: "sports-skills", label: "Skills", icon: TrophyIcon },
    { id: "health", label: "Health", icon: Stethoscope },
    { id: "ai", label: "AI Hub", icon: Sparkles },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const generalTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Registry", icon: LayoutDashboard },
    { id: "daily-report", label: "Session", icon: FileText },
    { id: "archive", label: "History", icon: HistoryIcon },
    { id: "registration", label: "Enroll", icon: User },
    { id: "attendance", label: "Log", icon: CalendarCheck },
    { id: "fitness", label: "Physicals", icon: Activity },
    { id: "health", label: "Medical", icon: Stethoscope },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const currentTabs = selectedSection === 'sports' ? sportsTabs : generalTabs;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="sticky top-0 z-50 bg-white border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-primary/5 p-2 rounded-xl border w-11 h-11 flex items-center justify-center">
              {LOGO ? (
                <Image src={LOGO.imageUrl} alt="Logo" width={32} height={32} />
              ) : (
                <School className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black uppercase text-primary leading-none">
                {selectedSection === 'sports' ? 'Sports Hub' : 'Student Registry'}
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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

          <div className="relative min-h-[400px]">
            {isTabChanging && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            <TabsContent value="home">
              <Card className="border-0 rounded-[2.5rem] shadow-sm bg-white overflow-hidden">
                <div className="relative w-full h-64 md:h-96">
                  {HERO_IMAGE && (
                    <Image 
                      src={HERO_IMAGE.imageUrl} 
                      alt="Sports Hero" 
                      fill 
                      className="object-cover"
                      data-ai-hint={HERO_IMAGE.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">{SCHOOL_NAME}</h2>
                    <p className="text-white/80 font-bold uppercase tracking-[0.3em] mt-2">आदिवासी विकास विभाग • महाराष्ट्र शासन</p>
                  </div>
                </div>
                <CardContent className="p-8 md:p-16 text-center space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                    <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center border p-4">
                      {LOGO ? (
                        <Image src={LOGO.imageUrl} alt="Logo" width={80} height={80} />
                      ) : (
                        <School className="w-12 h-12 text-primary" />
                      )}
                    </div>
                    <div className="space-y-4 text-left">
                      <div className="bg-white border py-4 px-10 rounded-2xl shadow-md inline-block">
                        <p className="text-2xl font-black text-primary uppercase">सुनिल देशमुख</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary text-white px-4 py-1.5 rounded-full font-black uppercase text-[10px]">
                          Physical Education Director
                        </Badge>
                        <Badge variant="outline" className="border-primary text-primary px-4 py-1.5 rounded-full font-black uppercase text-[10px]">
                          {selectedSection === 'sports' ? 'Sports Hub' : 'Registry Hub'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard">
              <Dashboard store={schoolData} section={selectedSection} />
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
