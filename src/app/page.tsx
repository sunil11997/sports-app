"use client";

import React, { useState } from 'react';
import { useSchoolData } from '@/hooks/use-school-data';
import { Registration } from '@/components/features/Registration';
import { Dashboard } from '@/components/features/Dashboard';
import { Attendance } from '@/components/features/Attendance';
import { Fitness } from '@/components/features/Fitness';
import { SportsSkills } from '@/components/features/SportsSkills';
import { HealthIncidents } from '@/components/features/HealthIncidents';
import { Teams } from '@/components/features/Teams';
import { AIAdvice } from '@/components/features/AIAdvice';
import { Card } from '@/components/ui/card';
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
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WaghambaApp() {
  const [isEntered, setIsEntered] = useState(false);
  const schoolData = useSchoolData();

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground tracking-tight uppercase leading-tight">
              Government Secondary<br />Aashram School Waghamba
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl font-medium tracking-wide">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-8 shadow-md border-b-4 border-accent">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="bg-accent p-2 rounded-lg">
            <School className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Aashram School Waghamba</h1>
            <p className="text-sm font-medium text-primary-foreground/70">स्पोर्ट्स & हेल्थ पोर्टल</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-primary/5 p-1 h-auto flex flex-wrap gap-1 border border-primary/10 rounded-2xl">
            <TabsTrigger value="dashboard" className="flex-1 min-w-[120px] rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
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
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <Dashboard store={schoolData} />
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
          </div>
        </Tabs>
      </main>
    </div>
  );
}