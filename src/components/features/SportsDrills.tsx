"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CircleCheck, 
  UsersRound, 
  ShieldCheck,
  Loader2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Flame,
  Info,
  Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export function SportsDrills({ store, preselectedSport }: SportsDrillsProps) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || 'Kabaddi');
  const [activeDrill, setActiveDrill] = useState(SPORTS_DATA[activeSport || 'Kabaddi']?.skills[0] || "Standard Drill");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedSport && SPORTS_DATA[preselectedSport]) {
      setActiveSport(preselectedSport);
      setActiveDrill(SPORTS_DATA[preselectedSport].skills[0]);
    }
  }, [preselectedSport]);

  const drillKey = `${activeSport}_${activeDrill}`;

  const playersInSport = useMemo(() => 
    (store.data.players || []).filter((p: any) => 
      p.category === 'athlete' && p.sports?.includes(activeSport)
    ),
  [store.data.players, activeSport]);

  const groupedSquads = useMemo(() => {
    const groups: Record<string, any[]> = { 'U14': [], 'U17': [], 'Senior': [] };
    
    playersInSport.forEach((p: any) => {
      const lookupKey = p.id + "_" + drillKey;
      const isMastered = !!(store.data.drillCompletions && store.data.drillCompletions[lookupKey]);
      
      if (!isMastered) {
        const age = parseInt(p.age) || 0;
        let cat = 'Senior';
        if (age < 14) cat = 'U14';
        else if (age < 17) cat = 'U17';
        groups[cat].push(p);
      }
    });
    
    return groups;
  }, [playersInSport, store.data.drillCompletions, drillKey]);

  const masteredThisDrill = useMemo(() => {
    return playersInSport
      .filter((p: any) => {
        const lookupKey = p.id + "_" + drillKey;
        return !!(store.data.drillCompletions && store.data.drillCompletions[lookupKey]);
      })
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [playersInSport, drillKey, store.data.drillCompletions]);

  const handleMasteryToggle = async (playerId: string, mastered: boolean) => {
    const opId = playerId + "_" + drillKey;
    setIsProcessing(opId);
    const player = store.data.players.find((p: any) => p.id === playerId);

    if (mastered) {
      store.setDrillCompletion(drillKey, playerId, true);
      toast({ title: "Mastery Logged", description: `${player?.name} archived to registry.`, className: "bg-emerald-500 text-white" });
    } else {
      toast({ title: "Keep Practicing", description: `${player?.name} needs more volume.`, variant: "destructive" });
    }
    setIsProcessing(null);
  };

  const handleRestore = (playerId: string) => {
    store.setDrillCompletion(drillKey, playerId, false);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <Badge className="bg-primary text-white text-[10px] uppercase px-4 py-1 mb-2">Practice Roster</Badge>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <UsersRound className="w-10 h-10 text-accent" /> {activeSport} Rotation
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={activeSport} onValueChange={setActiveSport}>
              <SelectTrigger className="h-14 md:w-[180px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(SPORTS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={activeDrill} onValueChange={setActiveDrill}>
              <SelectTrigger className="h-14 md:w-[220px] rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{SPORTS_DATA[activeSport]?.skills.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-2 rounded-[2.5rem] bg-white shadow-xl min-h-[600px] flex flex-col">
          <CardHeader className="bg-muted/30 border-b flex flex-row justify-between items-center p-8">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
               <ShieldCheck className="w-6 h-6 text-emerald-600" /> Ground Session Pool
            </CardTitle>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-primary">Live Sync</span>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1 bg-muted/5 overflow-y-auto">
            <div className="space-y-12">
               {Object.entries(groupedSquads).map(([cat, squad]) => (
                 <div key={cat} className="space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-primary/5 pb-2">
                       <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
                         <Users className="w-4 h-4 text-accent" /> {cat} Athletes
                       </h3>
                       <Badge variant="secondary" className="bg-primary/5 text-primary font-black text-[9px] px-3">{squad.length} Active</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {squad.map((player: any) => (
                         <div key={player.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                           <div className="flex items-center gap-3">
                             <Avatar className="w-10 h-10 border-2 border-primary/5">
                               <AvatarImage src={player.photoUrl} className="object-cover" />
                               <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">{player.name[0]}</AvatarFallback>
                             </Avatar>
                             <div className="min-w-0">
                               <p className="font-black text-xs uppercase text-primary leading-none truncate max-w-[120px]">{player.name}</p>
                               <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Std {player.std}</span>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <Button onClick={() => handleMasteryToggle(player.id, false)} disabled={!!isProcessing} variant="outline" size="icon" className="h-9 w-9 text-destructive border-2"><X className="w-4 h-4" /></Button>
                              <Button onClick={() => handleMasteryToggle(player.id, true)} disabled={!!isProcessing} className="h-9 w-9 bg-emerald-500 text-white shadow-md active-scale"><Check className="w-4 h-4" /></Button>
                           </div>
                         </div>
                       ))}
                       {squad.length === 0 && (
                         <div className="col-span-full py-10 text-center opacity-20 border-2 border-dashed rounded-3xl">
                            <Flame className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-[8px] font-black uppercase">No {cat} athletes pending in this drill</p>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
          <div className="p-6 bg-white border-t flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
               <Info className="w-3.5 h-3.5" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Grouping: Under-wise Registry (U14/U17/Senior)</p>
            </div>
            <Badge className="bg-primary text-white font-black text-[9px] px-4 py-1.5 rounded-full">v4.1.1 Registry</Badge>
          </div>
        </Card>

        <Card className="lg:col-span-4 border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary p-6 text-white">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <CircleCheck className="w-5 h-5 text-accent" /> Mastery Archive
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-3">
              {masteredThisDrill.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100 group animate-in slide-in-from-right-4 duration-300">
                  <div className="min-w-0">
                    <p className="font-black text-[10px] text-emerald-800 uppercase truncate">{p.name}</p>
                    <span className="text-[8px] font-bold text-emerald-600/60 uppercase">Logged Today</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRestore(p.id)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {masteredThisDrill.length === 0 && (
                <div className="py-24 text-center opacity-10 space-y-4">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">No logs archived for this session</p>
                </div>
              )}
            </CardContent>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
