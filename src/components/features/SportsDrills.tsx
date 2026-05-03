"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Dumbbell, Target, BookOpen, Clock, ClipboardCheck, Users, History, Loader2, User, PlayCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Dubki Mastery', skill: 'Dubki', instructions: ['Start low in raid.', 'Anticipate chain tackle.', 'Duck head and lunge forward.'], duration: '15m' },
    { id: 'k2', name: 'Toe Touch Reach', skill: 'Toe Touch', instructions: ['Extend lead leg quickly.', 'Touch defender\'s foot.', 'Retreat to midline fast.'], duration: '10m' },
    { id: 'k9', name: 'Ankle Hold Grip', skill: 'Ankle Hold', instructions: ['Watch raider\'s leading foot.', 'Grip with both hands firmly.', 'Pull backward to destabilize.'], duration: '15m' },
    { id: 'k12', name: 'Dash Defense', skill: 'Dash', instructions: ['Wait for raider to deep lunge.', 'Shoulder push with momentum.', 'Drive raider out of bounds.'], duration: '15m' },
  ],
  'Volleyball': [
    { id: 'v1', name: 'Service Ace', skill: 'Serving', instructions: ['High toss consistency.', 'Flat palm strike.', 'Aim for court corners.'], duration: '20m' },
    { id: 'v4', name: 'Spike Power', skill: 'Spiking', instructions: ['3-step rhythmic approach.', 'Vertical jump at peak.', 'Wrist snap on ball contact.'], duration: '25m' },
    { id: 'v5', name: 'Wall Block', skill: 'Blocking', instructions: ['Hands up, fingers spread.', 'Timing against the hitter.', 'Push hands over the net.'], duration: '15m' },
    { id: 'v6', name: 'Digging Drill', skill: 'Digging', instructions: ['Low athletic stance.', 'Platform preparation.', 'Redirect ball to setter.'], duration: '20m' },
  ],
  'Kho Kho': [
    { id: 'kh2', name: 'Pole Pivot', skill: 'Pole turning', instructions: ['Inner hand grip on pole.', 'Body low and outside.', 'Fast pivot around pole.'], duration: '15m' },
    { id: 'kh3', name: 'Clear Kho', skill: 'Giving kho', instructions: ['Strong shoulder tap.', 'Loud and clear "KHO" command.', 'Instant replacement.'], duration: '10m' },
    { id: 'kh4', name: 'Diving Touch', skill: 'Diving', instructions: ['Sprint parallel to defender.', 'Explosive lunge forward.', 'Hand tap before landing.'], duration: '20m' },
  ],
  'Handball': [
    { id: 'h1', name: 'Jump Shot Power', skill: 'Shooting', instructions: ['3-step run-up.', 'Vertical takeoff.', 'Highest point release.'], duration: '20m' },
    { id: 'h2', name: 'Piston Movement', skill: 'Defense', instructions: ['Move forward on attacker.', 'Backpedal to line.', 'Lateral coordination.'], duration: '15m' },
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Drill', skill: 'Block Start', instructions: ['Correct block spacing.', 'Drive from front leg.', 'Low head stay for 10m.'], duration: '20m' },
    { id: 'r2', name: 'Baton Handover', skill: 'Relay', instructions: ['Blind exchange practice.', 'V-hand shape.', 'Speed synchronization.'], duration: '15m' },
  ],
  'Shot Put': [
    { id: 'sp1', name: 'Glide Phase', skill: 'Glide', instructions: ['Low crouch position.', 'Powerful kick-off.', 'Quick hip rotation.'], duration: '20m' },
  ],
  'Javline': [
    { id: 'j1', name: 'Approach Speed', skill: 'Approach', instructions: ['Rhythmic build-up.', 'Baton/Javelin high.', 'Final 5-step transition.'], duration: '15m' },
  ]
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [viewHistory, setViewHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const playersInSport = useMemo(() => 
    store.data.players.filter((p: any) => p.category === 'athlete' && (p.sports?.includes(activeSport) || activeSport === 'Kabaddi')),
  [store.data.players, activeSport]);

  const handleToggleComplete = async (drillId: string, drillName: string) => {
    if (!selectedPlayerId) {
      toast({ title: "Select Player", description: "Pick an athlete to log the session.", variant: "destructive" });
      return;
    }
    const isDone = !!store.data.drillCompletions[`${selectedPlayerId}_${drillId}`];
    setIsProcessing(drillId);
    store.setDrillCompletion(drillId, selectedPlayerId, !isDone);
    toast({ title: isDone ? "Drill Reset" : "Session Logged", description: `${drillName} updated for student.` });
    setIsProcessing(null);
  };

  const currentDrills = (DRILLS_DATA[activeSport] || []).filter(d => {
    const isDone = !!store.data.drillCompletions[`${selectedPlayerId}_${d.id}`];
    return viewHistory ? isDone : !isDone;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <PlayCircle className="w-10 h-10 text-cyan-600" /> Coaching Hub
            </h2>
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Head Coach: Sunil Deshmukh
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2">1. Game</label>
              <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setSelectedPlayerId(""); }}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(DRILLS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2">2. Athlete</label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-black uppercase text-[10px]"><SelectValue placeholder="Pick Player" /></SelectTrigger>
                <SelectContent>{playersInSport.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2">3. Status</label>
              <Button variant={viewHistory ? "default" : "outline"} onClick={() => setViewHistory(!viewHistory)} className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px]">
                {viewHistory ? <History className="w-4 h-4 mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />} {viewHistory ? "Done" : "Pending"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center opacity-30 rounded-[3rem]">
          <User className="w-16 h-16 mb-4" />
          <p className="text-xl font-black uppercase tracking-widest">Select an athlete to start Coach Sunil's training</p>
        </Card>
      ) : currentDrills.length === 0 ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center opacity-30 rounded-[3rem]">
          <CheckCircle className="w-16 h-16 mb-4" />
          <p className="text-xl font-black uppercase tracking-widest">No drills in this category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDrills.map((drill) => (
            <Card key={drill.id} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/20 transition-all">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{drill.name}</h3>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-cyan-200 text-cyan-700">{drill.skill}</Badge>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.duration}</span>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase"><BookOpen className="w-3 h-3" /> Instructions</div>
                  <ul className="space-y-1">{drill.instructions.map((ins: any, i: number) => <li key={i} className="text-xs font-bold text-foreground/70">• {ins}</li>)}</ul>
                </div>
                <Button onClick={() => handleToggleComplete(drill.id, drill.name)} disabled={isProcessing === drill.id} className={cn("w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active-scale", viewHistory ? "bg-accent text-accent-foreground" : "bg-primary text-white")}>
                  {isProcessing === drill.id ? <Loader2 className="w-5 h-5 animate-spin" /> : viewHistory ? "RESET DRILL" : "MARK AS DONE"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
