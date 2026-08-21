
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Zap,
  CirclePlay,
  Activity,
  HeartPulse,
  Medal,
  ShieldAlert,
  BrainCircuit,
  Layout,
  Star,
  Users,
  CalendarDays,
  Sparkles,
  Contact,
  FileBadge,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerIDCardManager } from './PlayerIDCardManager';
import { SportsSkills } from './SportsSkills';
import { SportsDrills } from './SportsDrills';
import { TournamentRosters } from './TournamentRosters';
import { Teams } from './Teams';
import { HealthIncidents } from './HealthIncidents';
import { DailyReport } from './DailyReport';
import { DailyReadiness } from './DailyReadiness';
import { TacticalAnalytics } from './TacticalAnalytics';
import { TacticalPlaybook } from './TacticalPlaybook';
import { GoalTracker } from './GoalTracker';
import { TeamPlanner } from './TeamPlanner';
import { DailyPracticePlanner } from './DailyPracticePlanner';
import { AutoPracticePlanner } from './AutoPracticePlanner';
import { YogaPtHub } from './YogaPtHub';
import { SportsLibrary } from './SportsLibrary';

const GAMES = [
  { id: 'Yoga', label: 'Yoga & Pranayama', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'PT Mass', label: 'PT Mass & Exercises', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'Kabaddi', label: 'Kabaddi', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Volleyball', label: 'Volleyball', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Handball', label: 'Handball', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'Kho Kho', label: 'Kho Kho', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'Athletics', label: 'Athletics', icon: Medal, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'Running', label: 'Running', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'Javelin Throw', label: 'Javelin Throw', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Shot Put', label: 'Shot Put', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Disc Throw', label: 'Disc Throw', icon: Medal, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'Long Jump', label: 'Long Jump', icon: Star, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'High Jump', label: 'High Jump', icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function GameHub({ store }: { store: any }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Dedicated Redesigned Hub for Yoga & Mass PT
  if (selectedGame === 'Yoga' || selectedGame === 'PT Mass') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedGame(null)} 
          className="flex items-center gap-2 font-black text-xs uppercase text-primary hover:bg-primary/10 px-5 py-2.5 rounded-xl border-2 transition-all w-fit bg-white shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> मुख्य क्रीडा सूची (Back to All Games)
        </button>
        <YogaPtHub store={store} gameType={selectedGame} onBack={() => setSelectedGame(null)} />
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedGame(null)} 
              className="rounded-full h-12 w-12 hover:bg-primary/5 text-primary flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
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
          <div className="w-full overflow-x-auto scrollbar-hide pb-2">
            <TabsList className="bg-muted/50 p-2 h-auto rounded-full border shadow-inner flex flex-nowrap shrink-0 gap-2 w-max min-w-full">
              <TabsTrigger value="id-cards" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-blue-900 data-[state=active]:text-amber-400 whitespace-nowrap flex items-center gap-2 border-2 border-amber-400/30">
                <FileBadge className="w-4 h-4 text-amber-400" /> ID Cards (ओळखपत्रे)
              </TabsTrigger>
              <TabsTrigger value="readiness" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5" /> Readiness
              </TabsTrigger>
              <TabsTrigger value="planner" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Team Planner
              </TabsTrigger>
              <TabsTrigger value="auto-planner" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Auto Planner
              </TabsTrigger>
              <TabsTrigger value="daily-planner" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" /> Daily Planner
              </TabsTrigger>
              <TabsTrigger value="goals" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Targets
              </TabsTrigger>
              <TabsTrigger value="playbook" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Layout className="w-3.5 h-3.5" /> Playbook
              </TabsTrigger>
              <TabsTrigger value="tactics" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5" /> Decisions
              </TabsTrigger>
              <TabsTrigger value="injury" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-destructive data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Injury Hub
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Skills</TabsTrigger>
              <TabsTrigger value="drills" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Drills (सराव प्रकार)
              </TabsTrigger>
              <TabsTrigger value="library" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-700 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Library (नियम व PDF)
              </TabsTrigger>
              <TabsTrigger value="teams" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Teams</TabsTrigger>
              <TabsTrigger value="tournament" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">Tournament</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-full px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-700 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Auto Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="id-cards" className="mt-0">
            <PlayerIDCardManager store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="readiness" className="mt-0">
            <DailyReadiness store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="planner" className="mt-0">
            <TeamPlanner store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="auto-planner" className="mt-0">
            <AutoPracticePlanner store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="daily-planner" className="mt-0">
            <DailyPracticePlanner store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="goals" className="mt-0">
            <GoalTracker store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="playbook" className="mt-0">
            <TacticalPlaybook store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="tactics" className="mt-0">
            <TacticalAnalytics store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="injury" className="mt-0">
            <HealthIncidents store={store} section="sports" preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="skills" className="mt-0">
            <SportsSkills store={store} section="sports" preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="drills" className="mt-0">
            <SportsDrills store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="library" className="mt-0">
            <SportsLibrary store={store} type="rules" preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="teams" className="mt-0">
            <Teams store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="tournament" className="mt-0">
            <TournamentRosters store={store} preselectedSport={selectedGame || undefined} />
          </TabsContent>
          <TabsContent value="reports" className="mt-0">
            <DailyReport store={store} section="sports" preselectedSport={selectedGame || undefined} />
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
            Select a discipline to access technical mastery, tactical playbooks, and injury logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((game) => {
          const GameIcon = game.icon;
          return (
            <Card 
              key={game.id} 
              onClick={() => setSelectedGame(game.id)}
              className="border-2 rounded-[3rem] p-10 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden text-center"
            >
              <div className={cn("w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500", game.bg)}>
                <GameIcon className={cn("w-10 h-10", game.color)} />
              </div>
              <h3 className="text-3xl font-black text-primary uppercase tracking-tight">{game.label}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Open Management Deck</p>
              <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <ChevronRight className="w-6 h-6 text-primary/20" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
