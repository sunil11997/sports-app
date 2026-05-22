
"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Dumbbell, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Zap,
  CirclePlay,
  Activity,
  HeartPulse,
  Medal,
  ShieldAlert
} from 'lucide-react';
import { SportsSkills } from './SportsSkills';
import { SportsDrills } from './SportsDrills';
import { TournamentRosters } from './TournamentRosters';
import { Teams } from './Teams';
import { HealthIncidents } from './HealthIncidents';
import { DailyReport } from './DailyReport';
import { DailyReadiness } from './DailyReadiness';
import { cn } from '@/lib/utils';

const GAMES = [
  { id: 'Kabaddi', label: 'Kabaddi', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Volleyball', label: 'Volleyball', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Handball', label: 'Handball', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'Kho Kho', label: 'Kho Kho', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'Athletics', label: 'Athletics', icon: Medal, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export function GameHub({ store }: { store: any }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedGame(null)} 
              className="rounded-full h-12 w-12 hover:bg-primary/5 text-primary"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="h-10 w-px bg-muted mx-2" />
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tight leading-none">{selectedGame} Hub</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Institutional Sports Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Pro Coaching Active</span>
          </div>
        </div>

        <Tabs defaultValue="readiness" className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="bg-muted/50 p-1.5 h-auto rounded-full border shadow-inner overflow-x-auto scrollbar-hide max-w-full gap-1">
              <TabsTrigger value="readiness" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5" /> Readiness
              </TabsTrigger>
              <TabsTrigger value="injury" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-destructive data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Injury Hub
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Skills</TabsTrigger>
              <TabsTrigger value="drills" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Drills</TabsTrigger>
              <TabsTrigger value="teams" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Teams</TabsTrigger>
              <TabsTrigger value="tournament" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Tournament</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-full px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Activity className="w-3 h-3" /> Auto Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="readiness" className="mt-0">
            <DailyReadiness store={store} />
          </TabsContent>

          <TabsContent value="injury" className="mt-0">
            <HealthIncidents store={store} section="sports" />
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <SportsSkills store={store} section="sports" preselectedSport={selectedGame} />
          </TabsContent>

          <TabsContent value="drills" className="mt-0">
            <SportsDrills store={store} preselectedSport={selectedGame} defaultView="checklist" />
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <Teams store={store} preselectedSport={selectedGame} />
          </TabsContent>

          <TabsContent value="tournament" className="mt-0">
            <TournamentRosters store={store} preselectedSport={selectedGame} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <DailyReport store={store} section="sports" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <CirclePlay className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Game Hub</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto italic">
            Select a discipline to access technical mastery, training logs, health, and auto-reports.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((game) => (
          <Card 
            key={game.id} 
            onClick={() => setSelectedGame(game.id)}
            className="border-2 rounded-[3rem] p-10 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden text-center"
          >
            <div className={cn("w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500", game.bg)}>
              <game.icon className={cn("w-10 h-10", game.color)} />
            </div>
            <h3 className="text-3xl font-black text-primary uppercase tracking-tight">{game.label}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Open Management Deck</p>
            
            <div className="mt-8 pt-8 border-t border-dashed flex justify-center gap-4">
              <div className="flex flex-col items-center">
                <Target className="w-4 h-4 text-muted-foreground/30 mb-1" />
                <span className="text-[8px] font-black uppercase text-muted-foreground">Skills</span>
              </div>
              <div className="flex flex-col items-center">
                <Dumbbell className="w-4 h-4 text-muted-foreground/30 mb-1" />
                <span className="text-[8px] font-black uppercase text-muted-foreground">Drills</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldAlert className="w-4 h-4 text-muted-foreground/30 mb-1" />
                <span className="text-[8px] font-black uppercase text-muted-foreground">Injuries</span>
              </div>
            </div>

            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ChevronRight className="w-6 h-6 text-primary/20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
