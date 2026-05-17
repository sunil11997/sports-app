
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CircleCheck, 
  Dumbbell, 
  BookOpen, 
  Clock, 
  ClipboardCheck, 
  Loader2, 
  User, 
  CirclePlay, 
  ShieldCheck,
  Send,
  Bot,
  Sparkles,
  ClipboardList,
  Medal,
  Check,
  X,
  RefreshCcw,
  UsersRound,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { coachChat } from '@/ai/flows/coach-chat';
import { usePWA } from '@/components/providers/pwa-provider';

const SPORTS_DATA: Record<string, { skills: string[], dailyPlan?: string[], lessonPlan?: string[] }> = {
  'Kabaddi': {
    skills: [
      "Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill",
      "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill",
      "Thigh hold drill", "Chain tackle drill", "Dash practice drill", "Corner defense drill",
      "Reaction speed drill", "Agility ladder drill", "Shuttle run drill", "Shadow raiding drill"
    ],
    dailyPlan: ["10 min warm-up", "Specific technical drills", "Raid/Defense coordination", "Match simulation", "Cool down"]
  },
  'Volleyball': {
    skills: [
      "Target serving drill", "Partner passing drill", "Wall setting drill", 
      "Toss and spike drill", "Blocking jump drill", "Digging defense drill", 
      "Circle passing drill", "Serve receive drill", "3-touch drill"
    ],
    dailyPlan: ["Wall set practice", "Service consistency", "Digging drills", "Spike approach", "Team rotation"]
  },
  'Kho Kho': {
    skills: [
      "Pole dive drill", "Zig-zag running drill", "Chase and tag drill", "Giving kho drill",
      "Direction change drill", "Reaction speed drill", "Sitting position drill", "Dodging practice drill"
    ],
    dailyPlan: ["Agility circuit", "Kho timing drills", "Pole turning speed", "Sudden turn practice"]
  },
  'Handball': {
    skills: [
      "Partner passing drill", "Wall passing drill", "Zig-zag dribbling drill", "Cone dribbling drill",
      "Target shooting drill", "Jump shot drill", "Bounce shot drill", "Goalkeeper reaction drill"
    ],
    dailyPlan: ["Shooting accuracy", "Fast break transitions", "Goalkeeper reflexes", "Defensive wall setup"]
  },
  'Athletics': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "Relay baton exchange drill",
      "Long jump take-off drill", "Sand pit landing drill", "High jump approach drill", "Scissor jump drill"
    ],
    dailyPlan: ["Warm-up jogging", "Interval sprints", "Reaction time drills", "Form correction"]
  }
};

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export function SportsDrills({ store, preselectedSport, defaultView = 'checklist' }: { store: any, preselectedSport?: string, defaultView?: 'checklist' | 'plans' }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [activeSport, setActiveSport] = useState(preselectedSport || 'Kabaddi');
  const [activeDrill, setActiveDrill] = useState(SPORTS_DATA[activeSport || 'Kabaddi'].skills[0]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedSport) {
      setActiveSport(preselectedSport);
      setActiveDrill(SPORTS_DATA[preselectedSport].skills[0]);
    }
  }, [preselectedSport]);

  const playersInSport = useMemo(() => 
    store.data.players.filter((p: any) => p.category === 'athlete' && (p.sports?.includes(activeSport) || activeSport === 'Kabaddi')),
  [store.data.players, activeSport]);

  // Daily Squad Logic: Get 7 players who haven't completed the drill
  const dailySquad = useMemo(() => {
    const drillKey = `${activeSport}_${activeDrill}`;
    return playersInSport
      .filter((p: any) => !store.data.drillCompletions[`${p.id}_${drillKey}`])
      .slice(0, 7);
  }, [playersInSport, activeSport, activeDrill, store.data.drillCompletions]);

  const allSquadFinished = dailySquad.length === 0 && playersInSport.length > 0;

  const handleMasteryToggle = async (playerId: string, mastered: boolean) => {
    const drillKey = `${activeSport}_${activeDrill}`;
    const opId = `${playerId}_${drillKey}`;
    setIsProcessing(opId);

    const playerName = store.data.players.find((p: any) => p.id === playerId)?.name;

    if (mastered) {
      store.setDrillCompletion(drillKey, playerId, true);
      toast({ title: "Drill Mastered", description: `${playerName} successfully completed ${activeDrill}.` });
    } else {
      // In "No" case, we ensure it's not marked as complete so they stay in squad
      store.setDrillCompletion(drillKey, playerId, false);
      toast({ title: "Needs Practice", description: `${playerName} remains in the Daily Squad for tomorrow.`, variant: "destructive" });
    }
    
    setIsProcessing(null);
  };

  const handleNextDrill = () => {
    const skills = SPORTS_DATA[activeSport].skills;
    const currentIndex = skills.indexOf(activeDrill);
    const nextDrill = skills[(currentIndex + 1) % skills.length];
    setActiveDrill(nextDrill);
    toast({ title: "New Drills Loaded", description: `Active Focus: ${nextDrill}` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <UsersRound className="w-10 h-10 text-accent" /> Daily Mastery Session
            </h2>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-primary font-black uppercase text-[10px] tracking-widest bg-white px-4 h-8 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-accent" /> Focus: {activeDrill}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setActiveDrill(SPORTS_DATA[val].skills[0]); }}>
              <SelectTrigger className="h-14 md:w-[200px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(SPORTS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={activeDrill} onValueChange={setActiveDrill}>
              <SelectTrigger className="h-14 md:w-[250px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPORTS_DATA[activeSport].skills.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            <CardHeader className="bg-primary/5 border-b p-8 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                  <Medal className="w-7 h-7 text-accent" /> Active Daily Squad
                </CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Focused Training Rotation • 7 Players Max</p>
              </div>
              {allSquadFinished && (
                <Button onClick={handleNextDrill} className="bg-accent text-white font-black uppercase text-xs h-12 px-8 rounded-xl shadow-lg active-scale">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Load New Drills
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {dailySquad.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                    <CircleCheck className="w-14 h-14" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-primary uppercase">Registry Complete</h4>
                    <p className="text-muted-foreground font-medium max-w-xs mx-auto italic">All eligible athletes in this sport have mastered the current technical drill.</p>
                  </div>
                  <Button onClick={handleNextDrill} className="bg-primary text-white font-black uppercase text-xs h-14 px-12 rounded-2xl shadow-xl">
                    Select Next Technical Skill
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailySquad.map((player: any) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between bg-muted/20 p-5 rounded-[2rem] border-2 border-transparent hover:border-primary/10 transition-all animate-in slide-in-from-right-4 duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full border-2 border-primary/5 overflow-hidden shadow-sm">
                          <img src={player.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase text-primary leading-none">{player.name}</p>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Std {player.std} • #{player.serialNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button 
                          onClick={() => handleMasteryToggle(player.id, false)}
                          disabled={isProcessing === `${player.id}_${activeSport}_${activeDrill}`}
                          variant="outline" 
                          size="icon" 
                          className="h-11 w-11 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                        <Button 
                          onClick={() => handleMasteryToggle(player.id, true)}
                          disabled={isProcessing === `${player.id}_${activeSport}_${activeDrill}`}
                          className="h-11 w-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg active-scale"
                        >
                          {isProcessing === `${player.id}_${activeSport}_${activeDrill}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: 7 - dailySquad.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center justify-center p-5 rounded-[2rem] border-2 border-dashed border-muted opacity-30">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empty Slot</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-8 bg-primary/5 border-t flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Institutional Rotation Engine Active</p>
              </div>
              <Badge className="bg-primary text-white font-black text-[9px] px-4 py-1.5 rounded-full shadow-lg">
                Daily Capacity: 07 Students
              </Badge>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 rounded-[2.5rem] bg-primary text-white shadow-2xl relative overflow-hidden p-10">
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                 <Zap className="w-10 h-10 text-accent animate-pulse" />
                 <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Session Intelligence</h3>
               </div>
               <div className="space-y-4 pt-4">
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total Athletes in Pool</p>
                   <p className="text-3xl font-black">{playersInSport.length}</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Current Focus Efficiency</p>
                   <p className="text-3xl font-black">{Math.round(((playersInSport.length - dailySquad.length) / (playersInSport.length || 1)) * 100)}%</p>
                 </div>
               </div>
               <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                 "Rotation logic prioritizes students who have not yet logged this technical move in the institutional registry."
               </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-[80px]" />
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden p-8 flex flex-col items-center text-center space-y-6 group">
            <div className="w-20 h-20 bg-muted/40 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <ClipboardCheck className="w-10 h-10 text-primary/40" />
            </div>
            <div>
               <h4 className="text-lg font-black text-primary uppercase leading-tight">Sync Status</h4>
               <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Real-Time Cloud Archival</p>
            </div>
            <div className="w-full h-px bg-muted" />
            <div className="flex flex-col gap-2 w-full">
               <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-muted-foreground">Today's Mastery</span>
                 <span className="text-primary">0/7 Logged</span>
               </div>
               <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-accent w-0 transition-all duration-1000" />
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

