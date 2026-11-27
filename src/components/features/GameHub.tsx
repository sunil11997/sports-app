"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Sparkles,
  FileBadge,
  BookOpen,
  Shirt,
  Package,
  Award,
  FileText,
  MoreHorizontal,
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
import { YogaPtHub } from './YogaPtHub';
import { SportsLibrary } from './SportsLibrary';
import { MatchScoreboard } from './MatchScoreboard';
import { TeamEligibilityRoster } from './TeamEligibilityRoster';
import { PlayerPositionJerseyManager } from './PlayerPositionJerseyManager';
import { EquipmentInventoryHub } from './EquipmentInventoryHub';
import { SportsCertificateGenerator } from './SportsCertificateGenerator';
import { StudentSportsReportCard } from './StudentSportsReportCard';
import { TournamentFixturesHub } from './TournamentFixturesHub';
import { DailyPracticePlanner } from './DailyPracticePlanner';
import { AutoPracticePlanner } from './AutoPracticePlanner';
import { Attendance } from './Attendance';

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

const TEAM_SPORTS = new Set(['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho']);

function SubViewSwitcher({
  options,
  active,
  onChange,
}: {
  options: Array<{ id: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-primary/10 shadow-sm mb-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = active === opt.id;
        return (
          <Button
            key={opt.id}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onChange(opt.id)}
            className={cn(
              'h-9 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5',
              isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-primary/5'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

export function GameHub({ store }: { store: any }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('squad');
  const [squadSub, setSquadSub] = useState<string>('eligibility');
  const [practiceSub, setPracticeSub] = useState<string>('daily-practice');
  const [matchSub, setMatchSub] = useState<string>('fixtures');
  const [certSub, setCertSub] = useState<string>('certificates');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
    setActiveTab('squad');
    setSquadSub('eligibility');
    setPracticeSub('daily-practice');
    setMatchSub('fixtures');
    setCertSub('certificates');
  };

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
    const isTeamSport = TEAM_SPORTS.has(selectedGame);

    const squadOptions = [
      { id: 'eligibility', label: 'DSO Eligibility', icon: ShieldCheck },
      { id: 'tournament', label: 'Tournament Squad', icon: Trophy },
      ...(isTeamSport
        ? [
            { id: 'teams', label: 'Team Builder', icon: Users },
            { id: 'jerseys', label: 'Jersey & Positions', icon: Shirt },
          ]
        : []),
      { id: 'id-cards', label: 'ID Cards', icon: FileBadge },
    ];

    const practiceOptions = [
      { id: 'daily-practice', label: 'Ground Practice Log', icon: Activity },
      { id: 'auto-practice', label: 'Auto Ground Planner', icon: Sparkles },
      { id: 'attendance', label: 'Ground Attendance', icon: ShieldCheck },
      { id: 'drills', label: 'Drills (सराव प्रकार)', icon: Zap },
      { id: 'skills', label: 'Practice Skills', icon: Target },
      { id: 'library', label: 'Rules & Library (नियम व PDF)', icon: BookOpen },
    ];

    const matchOptions = [
      { id: 'fixtures', label: 'Fixtures & Standings', icon: Trophy },
      ...(isTeamSport ? [{ id: 'scoreboard', label: 'Live Scoreboard', icon: Activity }] : []),
    ];

    const certOptions = [
      { id: 'certificates', label: 'Certificates (प्रमाणपत्रे)', icon: Award },
      { id: 'report-cards', label: 'Report Card (प्रगती पुस्तक)', icon: FileText },
      { id: 'reports', label: 'Daily Report (दैनिक अहवाल)', icon: Activity },
    ];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        {/* Sport Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 border-primary/10 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedGame(null)}
              className="rounded-full h-10 w-10 sm:h-12 sm:w-12 hover:bg-primary/5 text-primary flex items-center justify-center shrink-0"
              title="Back to All Games"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="h-8 sm:h-10 w-px bg-muted mx-1" />
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-primary uppercase tracking-tight leading-none">
                {selectedGame} Hub
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">
                {isTeamSport ? 'Team Sport • Ashram Shala Sports Deck' : 'Individual Track & Field • Ashram Shala Sports Deck'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 font-black text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <MoreHorizontal className="w-4 h-4" /> More / Pro Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Optional Coaching Tools
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('readiness')} className="rounded-xl font-bold text-xs cursor-pointer">
                  <HeartPulse className="w-4 h-4 mr-2 text-emerald-600" /> Daily Readiness
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('goals')} className="rounded-xl font-bold text-xs cursor-pointer">
                  <Target className="w-4 h-4 mr-2 text-amber-600" /> Targets & Goals
                </DropdownMenuItem>
                {isTeamSport && (
                  <>
                    <DropdownMenuItem onClick={() => setActiveTab('playbook')} className="rounded-xl font-bold text-xs cursor-pointer">
                      <Layout className="w-4 h-4 mr-2 text-blue-600" /> Tactical Playbook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('tactics')} className="rounded-xl font-bold text-xs cursor-pointer">
                      <BrainCircuit className="w-4 h-4 mr-2 text-purple-600" /> Match Decisions
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setActiveTab('equipment')} className="rounded-xl font-bold text-xs cursor-pointer">
                  <Package className="w-4 h-4 mr-2 text-amber-700" /> Equipment Inventory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 5 Practical Core Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto scrollbar-hide pb-1">
            <TabsList className="bg-muted/40 p-1.5 rounded-2xl border border-border/60 flex items-center w-max min-w-full sm:min-w-0 gap-1">
              <TabsTrigger
                value="squad"
                className="rounded-xl px-4 sm:px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Squad & DSO Roster
              </TabsTrigger>
              <TabsTrigger
                value="practice"
                className="rounded-xl px-4 sm:px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-emerald-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" /> Practice & Drills
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="rounded-xl px-4 sm:px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-blue-700 data-[state=active]:text-white whitespace-nowrap flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> Matches & Scoreboard
              </TabsTrigger>
              <TabsTrigger
                value="injury"
                className="rounded-xl px-4 sm:px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-destructive data-[state=active]:text-white whitespace-nowrap flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Injury Hub
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="rounded-xl px-4 sm:px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-amber-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> Certificates & Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="squad" className="mt-0">
            <SubViewSwitcher options={squadOptions} active={squadSub} onChange={setSquadSub} />
            {squadSub === 'eligibility' && <TeamEligibilityRoster store={store} preselectedSport={selectedGame} />}
            {squadSub === 'tournament' && <TournamentRosters store={store} preselectedSport={selectedGame} />}
            {squadSub === 'teams' && isTeamSport && <Teams store={store} preselectedSport={selectedGame} />}
            {squadSub === 'jerseys' && isTeamSport && <PlayerPositionJerseyManager store={store} preselectedSport={selectedGame} />}
            {squadSub === 'id-cards' && <PlayerIDCardManager store={store} preselectedSport={selectedGame} />}
          </TabsContent>

          <TabsContent value="practice" className="mt-0">
            <SubViewSwitcher options={practiceOptions} active={practiceSub} onChange={setPracticeSub} />
            {practiceSub === 'daily-practice' && <DailyPracticePlanner store={store} preselectedSport={selectedGame} />}
            {practiceSub === 'auto-practice' && <AutoPracticePlanner store={store} preselectedSport={selectedGame} />}
            {practiceSub === 'attendance' && <Attendance store={store} section="sports" />}
            {practiceSub === 'drills' && <SportsDrills store={store} preselectedSport={selectedGame} />}
            {practiceSub === 'skills' && <SportsSkills store={store} section="sports" preselectedSport={selectedGame} />}
            {practiceSub === 'library' && <SportsLibrary store={store} type="rules" preselectedSport={selectedGame} />}
          </TabsContent>

          <TabsContent value="matches" className="mt-0">
            <SubViewSwitcher options={matchOptions} active={matchSub} onChange={setMatchSub} />
            {matchSub === 'fixtures' && <TournamentFixturesHub store={store} preselectedSport={selectedGame} />}
            {matchSub === 'scoreboard' && isTeamSport && <MatchScoreboard store={store} preselectedSport={selectedGame} />}
          </TabsContent>

          <TabsContent value="injury" className="mt-0">
            <HealthIncidents store={store} section="sports" preselectedSport={selectedGame} />
          </TabsContent>

          <TabsContent value="certificates" className="mt-0">
            <SubViewSwitcher options={certOptions} active={certSub} onChange={setCertSub} />
            {certSub === 'certificates' && <SportsCertificateGenerator store={store} preselectedSport={selectedGame} />}
            {certSub === 'report-cards' && <StudentSportsReportCard store={store} preselectedSport={selectedGame} />}
            {certSub === 'reports' && <DailyReport store={store} section="sports" preselectedSport={selectedGame} />}
          </TabsContent>

          {/* Optional Pro Tools accessed via More dropdown */}
          <TabsContent value="readiness" className="mt-0">
            <DailyReadiness store={store} preselectedSport={selectedGame} />
          </TabsContent>
          <TabsContent value="goals" className="mt-0">
            <GoalTracker store={store} preselectedSport={selectedGame} />
          </TabsContent>
          <TabsContent value="playbook" className="mt-0">
            <TacticalPlaybook store={store} preselectedSport={selectedGame} />
          </TabsContent>
          <TabsContent value="tactics" className="mt-0">
            <TacticalAnalytics store={store} preselectedSport={selectedGame} />
          </TabsContent>
          <TabsContent value="equipment" className="mt-0">
            <EquipmentInventoryHub store={store} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-6 sm:p-12 rounded-2xl sm:rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <CirclePlay className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-primary uppercase tracking-tight">Institutional Game Hub</h2>
          <p className="text-xs sm:text-lg font-medium text-muted-foreground max-w-2xl mx-auto italic">
            Select a discipline to manage DSO squads, ground drills, matches, injuries, and certificates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {GAMES.map((game) => {
          const GameIcon = game.icon;
          return (
            <Card
              key={game.id}
              onClick={() => handleSelectGame(game.id)}
              className="border-2 rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden text-center"
            >
              <div className={cn("w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-[1.5rem] flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:scale-110 duration-500", game.bg)}>
                <GameIcon className={cn("w-7 h-7 sm:w-10 sm:h-10", game.color)} />
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-primary uppercase tracking-tight">{game.label}</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-1 sm:mt-2 tracking-wider sm:tracking-widest">Open Management Deck</p>
              <div className="absolute top-4 sm:top-6 right-5 sm:right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary/20" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
