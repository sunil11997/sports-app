"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CircleCheck, 
  UsersRound, 
  Target, 
  Medal, 
  Check, 
  X, 
  RefreshCcw, 
  RotateCcw,
  ShieldCheck,
  CalendarDays,
  Loader2,
  UserPlus,
  Trash2,
  Plus,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': {
    skills: [
      "Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill",
      "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill",
      "Thigh hold drill", "Chain tackle drill", "Dash practice drill", "Corner defense drill",
      "Reaction speed drill", "Agility ladder drill", "Shuttle run drill", "Shadow raiding drill"
    ]
  },
  'Volleyball': {
    skills: [
      "Target serving drill", "Partner passing drill", "Wall setting drill", 
      "Toss and spike drill", "Blocking jump drill", "Digging defense drill", 
      "Circle passing drill", "Serve receive drill", "3-touch drill"
    ]
  },
  'Kho Kho': {
    skills: [
      "Pole dive drill", "Zig-zag running drill", "Chase and tag drill", "Giving kho drill",
      "Direction change drill", "Reaction speed drill", "Sitting position drill", "Dodging practice drill"
    ]
  },
  'Handball': {
    skills: [
      "Partner passing drill", "Wall passing drill", "Zig-zag dribbling drill", "Cone dribbling drill",
      "Target shooting drill", "Jump shot drill", "Bounce shot drill", "Goalkeeper reaction drill"
    ]
  },
  'Running': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "High-knee drive",
      "Baton exchange drill", "Stride length drill", "Explosive reaction drill", "Interval pacing"
    ]
  },
  'Shot Put': {
    skills: [
      "Glide technique", "Grip and carry", "Initial stance", "Power position",
      "Extension and push", "Wrist flick", "Reverse recovery", "Balance maintenance"
    ]
  },
  'Javelin Throw': {
    skills: [
      "Grip and carry", "Approach run", "Cross-over steps", "Withdrawal",
      "Power position", "Delivery strike", "Recovery step", "Tip control"
    ]
  },
  'Disc Throw': {
    skills: [
      "Grip technique", "Initial stance", "Wind-up", "Turning rhythm",
      "Power position", "Release and flick", "Reverse/Recovery", "Spin control"
    ]
  },
  'Athletics': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "Relay baton exchange drill",
      "Long jump take-off drill", "Sand pit landing drill", "High jump approach drill", "Scissor jump drill"
    ]
  }
};

interface SportsDrillsProps {
  store: any;
  preselectedSport?: string;
}

const DrillMedal = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
    <path d="M11 12 5.12 2.2" />
    <path d="m13 12 5.88-9.8" />
    <path d="M8 7h8" />
    <circle cx="12" cy="17" r="5" />
    <path d="M12 18v-2" />
  </svg>
);

export function SportsDrills({ store, preselectedSport }: SportsDrillsProps) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || 'Kabaddi');
  const [activeDrill, setActiveDrill] = useState(SPORTS_DATA[activeSport || 'Kabaddi'].skills[0]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [todayFocus, setTodayFocus] = useState<'U14' | 'U17'>('U14');
  const [sessionPlayerIds, setSessionPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    const date = new Date().getDate();
    setTodayFocus(date % 2 === 0 ? 'U14' : 'U17');
  }, []);

  useEffect(() => {
    if (preselectedSport) {
      setActiveSport(preselectedSport);
      setActiveDrill(SPORTS_DATA[preselectedSport].skills[0]);
    }
  }, [preselectedSport]);

  const playersInSport = useMemo(() => 
    (store.data.players || []).filter((p: any) => 
      p.category === 'athlete' && (p.sports?.includes(activeSport) || activeSport === 'Kabaddi')
    ),
  [store.data.players, activeSport]);

  const drillKey = `${activeSport}_${activeDrill}`;

  const filterByFocus = useCallback((player: any) => {
    const age = parseInt(player.age) || 0;
    if (todayFocus === 'U14') return age < 14;
    if (todayFocus === 'U17') return age >= 14 && age < 17;
    return true;
  }, [todayFocus]);

  // Initial auto-population of the session
  useEffect(() => {
    if (playersInSport.length > 0 && sessionPlayerIds.length === 0) {
      const initialFemale = playersInSport
        .filter((p: any) => p.gender === 'Female' && filterByFocus(p) && !store.data.drillCompletions[`${p.id}_${drillKey}`])
        .sort((a: any, b: any) => (parseInt(a.std) || 0) - (parseInt(b.std) || 0))
        .slice(0, 7)
        .map(p => p.id);

      const initialMale = playersInSport
        .filter((p: any) => p.gender === 'Male' && filterByFocus(p) && !store.data.drillCompletions[`${p.id}_${drillKey}`])
        .sort((a: any, b: any) => (parseInt(a.std) || 0) - (parseInt(b.std) || 0))
        .slice(0, 7)
        .map(p => p.id);

      setSessionPlayerIds([...initialFemale, ...initialMale]);
    }
  }, [playersInSport, todayFocus, drillKey, store.data.drillCompletions, filterByFocus, sessionPlayerIds.length]);

  const currentSessionPlayers = useMemo(() => {
    return sessionPlayerIds
      .map(id => playersInSport.find(p => p.id === id))
      .filter(p => !!p && !store.data.drillCompletions[`${p.id}_${drillKey}`]);
  }, [sessionPlayerIds, playersInSport, store.data.drillCompletions, drillKey]);

  const femaleSquad = currentSessionPlayers.filter(p => p.gender === 'Female');
  const maleSquad = currentSessionPlayers.filter(p => p.gender === 'Male');

  const masteredThisDrill = useMemo(() => {
    return playersInSport
      .filter((p: any) => store.data.drillCompletions[`${p.id}_${drillKey}`])
      .sort((a: any, b: any) => (b.name || "").localeCompare(a.name || ""));
  }, [playersInSport, drillKey, store.data.drillCompletions]);

  const handleMasteryToggle = async (playerId: string, mastered: boolean) => {
    const opId = `${playerId}_${drillKey}`;
    setIsProcessing(opId);

    const playerName = store.data.players.find((p: any) => p.id === playerId)?.name;

    if (mastered) {
      store.setDrillCompletion(drillKey, playerId, true);
      toast({ 
        title: "Mastery Logged", 
        description: `${playerName} successfully archived.`,
        className: "bg-emerald-500 text-white" 
      });
      // Removing from session is handled by the useMemo filtering drillCompletions
    } else {
      toast({ 
        title: "Practice Required", 
        description: `${playerName} remains in the training pool.`,
        variant: "destructive" 
      });
    }
    
    setIsProcessing(null);
  };

  const handleRemoveFromSession = (playerId: string) => {
    setSessionPlayerIds(prev => prev.filter(id => id !== playerId));
    toast({ title: "Athlete Removed", description: "Removed from current practice session." });
  };

  const handleAddToSession = (playerId: string) => {
    if (sessionPlayerIds.includes(playerId)) {
      toast({ title: "Already Present", description: "Athlete is already in the session pool.", variant: "destructive" });
      return;
    }
    setSessionPlayerIds(prev => [...prev, playerId]);
    toast({ title: "Athlete Added", description: "Athlete joined the practice rotation.", className: "bg-primary text-white" });
  };

  const handleRestore = (playerId: string) => {
    const playerName = store.data.players.find((p: any) => p.id === playerId)?.name;
    store.setDrillCompletion(drillKey, playerId, false);
    toast({ 
      title: "Athlete Restored", 
      description: `${playerName} moved back to active training registry.` 
    });
  };

  const handleResetSession = () => {
    setSessionPlayerIds([]);
    toast({ title: "Session Reset", description: "Rotation pool cleared. Re-generating based on focus..." });
  };

  const handleNextDrill = () => {
    const skills = SPORTS_DATA[activeSport].skills;
    const currentIndex = skills.indexOf(activeDrill);
    const nextDrill = skills[(currentIndex + 1) % skills.length];
    setActiveDrill(nextDrill);
    toast({ title: "Session Focus Updated", description: `Active Focus: ${nextDrill}` });
  };

  const SquadList = ({ squad, title, emptyColor }: { squad: any[], title: string, emptyColor: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="font-black text-primary uppercase text-xs tracking-widest">{title}</h4>
        <Badge variant="outline" className="text-[9px] font-black">{squad.length} Active</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {squad.map((player: any) => (
          <div 
            key={player.id} 
            className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-primary/5 hover:border-primary/20 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-primary/5 overflow-hidden shadow-sm relative">
                <Image 
                  src={player.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((player.name || '').trim())}`} 
                  alt="Profile"
                  width={40}
                  height={40}
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-black text-xs uppercase text-primary leading-none truncate max-w-[100px]">{player.name}</p>
                <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Std {player.std} &bull; Age {player.age}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
               <Button 
                onClick={() => handleRemoveFromSession(player.id)}
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
               <Button 
                onClick={() => handleMasteryToggle(player.id, false)}
                disabled={isProcessing === `${player.id}_${drillKey}`}
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => handleMasteryToggle(player.id, true)}
                disabled={isProcessing === `${player.id}_${drillKey}`}
                className="h-9 w-9 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg active-scale"
              >
                {isProcessing === `${player.id}_${drillKey}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ))}
        {squad.length === 0 && (
          <div className={cn("flex items-center justify-center py-12 rounded-2xl border-2 border-dashed opacity-20", emptyColor)}>
             <span className="text-[8px] font-black uppercase tracking-widest">Empty Slot</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
               <Badge className={cn(
                 "px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg",
                 todayFocus === 'U14' ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
               )}>
                 <CalendarDays className="w-3.5 h-3.5 mr-2" /> 
                 Rotation Focus: {todayFocus}
               </Badge>
               <Button variant="ghost" onClick={handleResetSession} className="h-8 text-[9px] font-black uppercase text-primary hover:bg-primary/5">
                 <RefreshCcw className="w-3 h-3 mr-1" /> Reset Pool
               </Button>
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <UsersRound className="w-10 h-10 text-accent" /> Active Drill Pool
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-2">Discipline</label>
              <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setActiveDrill(SPORTS_DATA[val].skills[0]); setSessionPlayerIds([]); }}>
                <SelectTrigger className="h-14 md:w-[200px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(SPORTS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-2">Technical Skill</label>
              <Select value={activeDrill} onValueChange={setActiveDrill}>
                <SelectTrigger className="h-14 md:w-[250px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPORTS_DATA[activeSport].skills.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden min-h-[750px] flex flex-col">
            <CardHeader className="bg-primary/5 border-b p-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-accent" /> Session Roster
                </CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Manual adjustments enabled &bull; Registry V3.9</p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                   <Select onValueChange={handleAddToSession}>
                      <SelectTrigger className="h-12 pl-9 rounded-xl border-2 font-black uppercase text-[10px] bg-white">
                        <SelectValue placeholder="ADD ATHLETE..." />
                      </SelectTrigger>
                      <SelectContent>
                        {playersInSport.filter(p => !sessionPlayerIds.includes(p.id)).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
                <Button onClick={handleNextDrill} className="bg-accent text-white font-black uppercase text-xs h-12 px-6 rounded-xl shadow-lg active-scale shrink-0">
                  Next Drill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex-1 bg-muted/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SquadList squad={femaleSquad} title="Female Squad Pool" emptyColor="border-pink-300" />
                <SquadList squad={maleSquad} title="Male Squad Pool" emptyColor="border-blue-300" />
              </div>
            </CardContent>
            <div className="p-8 bg-white border-t flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Mastery removes athlete from the active session pool.</p>
              </div>
              <Badge className="bg-primary text-white font-black text-[9px] px-4 py-1.5 rounded-full shadow-lg">
                Session Count: {currentSessionPlayers.length} athletes
              </Badge>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 rounded-[2.5rem] bg-primary text-white shadow-2xl relative overflow-hidden p-10">
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                 <DrillMedal className="w-10 h-10 text-accent animate-pulse" />
                 <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Rotation Intel</h3>
               </div>
               <div className="space-y-4 pt-4">
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Roster Participation</p>
                   <p className="text-3xl font-black">{sessionPlayerIds.length} / {playersInSport.length}</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Drill Mastery Rate</p>
                   <p className="text-3xl font-black">{Math.round((masteredThisDrill.length / (playersInSport.length || 1)) * 100)}%</p>
                 </div>
               </div>
               <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                 &quot;Adjust your session roster manually using the selector. Mastery data is archived instantly to the Cloud Registry.&quot;
               </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-[80px]" />
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col h-full max-h-[450px]">
            <CardHeader className="bg-muted/30 border-b p-6">
               <CardTitle className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                 <CircleCheck className="w-4 h-4 text-emerald-500" /> Mastery Vault
               </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-6 space-y-3">
                {masteredThisDrill.length === 0 ? (
                  <div className="py-10 text-center opacity-20">
                     <DrillMedal className="w-10 h-10 mx-auto mb-2" />
                     <p className="text-[9px] font-black uppercase">No logs yet</p>
                  </div>
                ) : (
                  masteredThisDrill.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border overflow-hidden shadow-sm relative">
                          <Image 
                            src={p.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((p.name || '').trim())}`} 
                            alt="Profile"
                            width={32}
                            height={32}
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-emerald-800 uppercase truncate block max-w-[100px]">{p.name}</span>
                          <span className="text-[8px] font-bold text-emerald-600/60 uppercase">Std {p.std}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleRestore(p.id)} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
