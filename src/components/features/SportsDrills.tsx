
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Zap, 
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2
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
  'Athletics': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "Relay baton exchange drill",
      "Long jump take-off drill", "Sand pit landing drill", "High jump approach drill", "Scissor jump drill"
    ]
  }
};

export function SportsDrills({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
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
    store.data.players.filter((p: any) => 
      p.category === 'athlete' && (p.sports?.includes(activeSport) || activeSport === 'Kabaddi')
    ),
  [store.data.players, activeSport]);

  // Logic: 7 Players who haven't mastered the drill, sorted by Female first and then Standard
  const dailySquad = useMemo(() => {
    const drillKey = `${activeSport}_${activeDrill}`;
    return playersInSport
      .filter((p: any) => !store.data.drillCompletions[`${p.id}_${drillKey}`])
      .sort((a: any, b: any) => {
        // Priority 1: Female first
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        // Priority 2: Standard (Under-wise)
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        // Priority 3: Serial Number
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      })
      .slice(0, 7);
  }, [playersInSport, activeSport, activeDrill, store.data.drillCompletions]);

  // Logic: Players who ALREADY mastered this specific drill (to allow Restore/Undo)
  const masteredThisDrill = useMemo(() => {
    const drillKey = `${activeSport}_${activeDrill}`;
    return playersInSport
      .filter((p: any) => store.data.drillCompletions[`${p.id}_${drillKey}`])
      .sort((a: any, b: any) => b.name.localeCompare(a.name)); // Show latest first roughly
  }, [playersInSport, activeSport, activeDrill, store.data.drillCompletions]);

  const handleMasteryToggle = async (playerId: string, mastered: boolean) => {
    const drillKey = `${activeSport}_${activeDrill}`;
    const opId = `${playerId}_${drillKey}`;
    setIsProcessing(opId);

    const playerName = store.data.players.find((p: any) => p.id === playerId)?.name;

    if (mastered) {
      store.setDrillCompletion(drillKey, playerId, true);
      toast({ 
        title: "Mastery Logged", 
        description: `${playerName} successfully archived. Next athlete rotating in.`,
        className: "bg-emerald-500 text-white" 
      });
    } else {
      // "No" keeps them in pool, doesn't mark complete
      toast({ 
        title: "Practice Required", 
        description: `${playerName} will automatically reappear in tomorrow's squad.`,
        variant: "destructive" 
      });
    }
    
    setIsProcessing(null);
  };

  const handleRestore = (playerId: string) => {
    const drillKey = `${activeSport}_${activeDrill}`;
    const playerName = store.data.players.find((p: any) => p.id === playerId)?.name;
    store.setDrillCompletion(drillKey, playerId, false);
    toast({ 
      title: "Athlete Restored", 
      description: `${playerName} moved back to active training registry.` 
    });
  };

  const handleNextDrill = () => {
    const skills = SPORTS_DATA[activeSport].skills;
    const currentIndex = skills.indexOf(activeDrill);
    const nextDrill = skills[(currentIndex + 1) % skills.length];
    setActiveDrill(nextDrill);
    toast({ title: "Session Focus Updated", description: `Active Focus: ${nextDrill}` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
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
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden min-h-[650px] flex flex-col">
            <CardHeader className="bg-primary/5 border-b p-8 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-accent" /> Active Daily Squad
                </CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Rotation Queue: Females & Lower Standards Prioritized</p>
              </div>
              <Button onClick={handleNextDrill} className="bg-accent text-white font-black uppercase text-xs h-12 px-8 rounded-xl shadow-lg active-scale">
                <RefreshCcw className="w-4 h-4 mr-2" /> Next Technical Skill
              </Button>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {dailySquad.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner animate-in zoom-in duration-500">
                    <CircleCheck className="w-14 h-14" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-primary uppercase">Skill Registry Complete</h4>
                    <p className="text-muted-foreground font-medium max-w-xs mx-auto italic">All eligible athletes have mastered this move. Switch drills to rotate new candidates.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailySquad.map((player: any) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between bg-muted/20 p-5 rounded-[2rem] border-2 border-transparent hover:border-primary/10 transition-all animate-in slide-in-from-right-4 duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-white rounded-full border-2 border-primary/5 overflow-hidden shadow-sm">
                            <img src={player.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} className="w-full h-full object-cover" alt="Profile" />
                          </div>
                          {player.gender === 'Female' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white" title="Female Priority" />}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase text-primary leading-none truncate max-w-[120px]">{player.name}</p>
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
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate Found</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-8 bg-primary/5 border-t flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Institutional Engine: Intelligent Auto-Rotation Active</p>
              </div>
              <Badge className="bg-primary text-white font-black text-[9px] px-4 py-1.5 rounded-full shadow-lg">
                Squad Size: 07 Students
              </Badge>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 rounded-[2.5rem] bg-primary text-white shadow-2xl relative overflow-hidden p-10">
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                 <Zap className="w-10 h-10 text-accent animate-pulse" />
                 <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Rotation Intel</h3>
               </div>
               <div className="space-y-4 pt-4">
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Unmastered Pool</p>
                   <p className="text-3xl font-black">{playersInSport.length - masteredThisDrill.length}</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Drill Proficiency</p>
                   <p className="text-3xl font-black">{Math.round((masteredThisDrill.length / (playersInSport.length || 1)) * 100)}%</p>
                 </div>
               </div>
               <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                 "Empty slots in the 7-player squad are immediately filled by the next prioritised student in the registry."
               </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-[80px]" />
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col h-full max-h-[400px]">
            <CardHeader className="bg-muted/30 border-b p-6">
               <CardTitle className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                 <Medal className="w-4 h-4 text-accent" /> Mastery Vault
               </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-6 space-y-3">
                {masteredThisDrill.length === 0 ? (
                  <div className="py-10 text-center opacity-20">
                     <CircleCheck className="w-10 h-10 mx-auto mb-2" />
                     <p className="text-[9px] font-black uppercase">No masteries today</p>
                  </div>
                ) : (
                  masteredThisDrill.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border overflow-hidden shadow-sm">
                          <img src={p.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 uppercase truncate max-w-[100px]">{p.name}</span>
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

