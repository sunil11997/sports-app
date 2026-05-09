"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Dumbbell, Target, BookOpen, Clock, ClipboardCheck, Users, History, Loader2, User, PlayCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * Updated Sports Drills component v4.1
 * Forces a clean re-bundle of the drill logic and registry interactions.
 */

// Comprehensive Drill Database mapped to Skills Hub categories
const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Dubki Mastery', skill: 'Dubki', instructions: ['Start low in raid.', 'Anticipate chain tackle.', 'Duck head and lunge forward.'], duration: '15m' },
    { id: 'k2', name: 'Toe Touch Speed', skill: 'Toe Touch', instructions: ['Extend lead leg quickly.', 'Touch defender\'s foot.', 'Retreat to midline fast.'], duration: '10m' },
    { id: 'k3', name: 'Running Hand Touch', skill: 'Running Hand Touch', instructions: ['Build momentum toward corners.', 'Sudden lunge and arm extension.', 'Immediate pivot toward home.'], duration: '12m' },
    { id: 'k4', name: 'Back Kick Power', skill: 'Back Kick', instructions: ['Turn back to defender.', 'Powerful backward leg thrust.', 'Target upper torso.'], duration: '15m' },
    { id: 'k5', name: 'Lion Jump Timing', skill: 'Lion Jump', instructions: ['Bait the corner dash.', 'Explosive vertical jump.', 'Fly over the chain defenders.'], duration: '20m' },
    { id: 'k6', name: 'Ankle Hold Grip', skill: 'Ankle Hold', instructions: ['Watch raider\'s leading foot.', 'Grip with both hands firmly.', 'Pull backward to destabilize.'], duration: '15m' },
    { id: 'k7', name: 'Thigh Hold Technique', skill: 'Thigh Hold', instructions: ['Wait for raider to deep lunge.', 'Wrap arms around thighs.', 'Lift and drive raider down.'], duration: '15m' },
    { id: 'k8', name: 'Chain Tackle Sync', skill: 'Chain Tackle', instructions: ['Maintain hand grip in pair.', 'Coordinated surround movement.', 'Cut raider\'s exit path.'], duration: '20m' },
    { id: 'k9', name: 'Dash Defense', skill: 'Dash', instructions: ['Wait for mid-court cross.', 'Shoulder push with full body.', 'Drive raider out of bounds.'], duration: '15m' },
    { id: 'k10', name: 'Block & Cover', skill: 'Block', instructions: ['Square up against raider.', 'Arms wide to block escape.', 'Use mass to stop momentum.'], duration: '15m' }
  ],
  'Volleyball': [
    { id: 'v1', name: 'Service Ace', skill: 'Serving', instructions: ['High toss consistency.', 'Flat palm strike.', 'Aim for court corners.'], duration: '20m' },
    { id: 'v2', name: 'Passing (Bump) Accuracy', skill: 'Passing (Bump)', instructions: ['Low athletic stance.', 'Platform arm preparation.', 'Direct ball to the setter.'], duration: '15m' },
    { id: 'v3', name: 'Setter Precision', skill: 'Setting', instructions: ['Finger-tip control.', 'Diamond hand shape.', 'Soft touch for attackers.'], duration: '20m' },
    { id: 'v4', name: 'Spike Power', skill: 'Spiking (Attack)', instructions: ['3-step rhythmic approach.', 'Vertical jump at peak.', 'Wrist snap on ball contact.'], duration: '25m' },
    { id: 'v5', name: 'Wall Block', skill: 'Blocking', instructions: ['Hands up, fingers spread.', 'Timing against the hitter.', 'Push hands over the net.'], duration: '15m' },
    { id: 'v6', name: 'Digging Drill', skill: 'Digging (Defense)', instructions: ['React to hard-hit balls.', 'Chest low to ground.', 'Control the first touch.'], duration: '20m' }
  ],
  'Handball': [
    { id: 'h1', name: 'Passing Rhythms', skill: 'Passing', instructions: ['Chest pass accuracy.', 'Shoulder pass for distance.', 'Quick release under pressure.'], duration: '15m' },
    { id: 'h2', name: 'Catching Focus', skill: 'Catching', instructions: ['Soft hands absorption.', 'W-hand shape catch.', 'Immediate transition to shot.'], duration: '10m' },
    { id: 'h3', name: 'Dribbling Control', skill: 'Dribbling', instructions: ['Low ball bounce.', 'Using both hands alternately.', 'Maintain vision on court.'], duration: '15m' },
    { id: 'h4', name: 'Jump Shot Power', skill: 'Jump shot', instructions: ['3-step run-up.', 'Vertical takeoff.', 'Highest point release.'], duration: '20m' },
    { id: 'h5', name: 'Piston Movement', skill: 'Blocking', instructions: ['Move forward on attacker.', 'Backpedal to line.', 'Lateral coordination.'], duration: '15m' }
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Pivot', skill: 'Pole turning', instructions: ['Inner hand grip on pole.', 'Body low and outside.', 'Fast pivot around pole.'], duration: '15m' },
    { id: 'kh2', name: 'Clear Kho Signal', skill: 'Giving Kho', instructions: ['Strong shoulder tap.', 'Loud and clear "KHO" command.', 'Instant replacement.'], duration: '10m' },
    { id: 'kh3', name: 'Dodging Agility', skill: 'Dodging', instructions: ['Sudden change of direction.', 'Using pole for shielding.', 'Maintain stamina.'], duration: '20m' },
    { id: 'kh4', name: 'Diving Touch', skill: 'Diving', instructions: ['Sprint parallel to defender.', 'Explosive lunge forward.', 'Hand tap before landing.'], duration: '20m' },
    { id: 'kh5', name: 'Ring Game Mastery', skill: 'Ring Game', instructions: ['Zig-zag movement between chasers.', 'Maintain central lane distance.', 'Quick reflex turns.'], duration: '25m' }
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Drill', skill: 'Block Start', instructions: ['Correct block spacing.', 'Drive from front leg.', 'Low head stay for 10m.'], duration: '20m' },
    { id: 'r2', name: 'Arm Action Focus', skill: 'Arm Action', instructions: ['90-degree elbow lock.', 'Shoulder rotation drive.', 'Sync arms with stride.'], duration: '10m' },
    { id: 'r3', name: 'Baton Handover', skill: 'Relay Baton Exchange', instructions: ['Blind exchange practice.', 'V-hand shape.', 'Speed synchronization.'], duration: '15m' }
  ],
  'Shot Put': [
    { id: 'sp1', name: 'Grip & Stance', skill: 'Grip', instructions: ['Fingertip placement.', 'Elbow high and out.', 'Stable base stance.'], duration: '10m' },
    { id: 'sp2', name: 'Glide Phase', skill: 'Glide Technique', instructions: ['Low crouch position.', 'Powerful kick-off.', 'Quick hip rotation.'], duration: '20m' },
    { id: 'sp3', name: 'Release Angle', skill: 'Release Angle', instructions: ['45-degree trajectory.', 'Extension of the arm.', 'Powerful flick finish.'], duration: '15m' }
  ],
  'Javline': [
    { id: 'j1', name: 'Grip Stability', skill: 'Grip', instructions: ['Wrap fingers firmly.', 'Javelin rests on palm.', 'Thumb guide placement.'], duration: '10m' },
    { id: 'j2', name: 'Approach Rhythms', skill: 'Approach Run', instructions: ['Rhythmic build-up.', 'Javelin held high.', 'Speed control.'], duration: '15m' },
    { id: 'j3', name: 'Cross-over Steps', skill: 'Cross-over Steps', instructions: ['Sideways running drill.', 'Hip alignment.', 'Maintain throwing power.'], duration: '15m' }
  ],
  'Long Jump': [
    { id: 'lj1', name: 'Takeoff Power', skill: 'Takeoff', instructions: ['Mark the takeoff board.', 'Single leg explosive drive.', 'Maintain upward momentum.'], duration: '15m' },
    { id: 'lj2', name: 'Flight (Hitch-kick)', skill: 'Flight (Hitch-kick)', instructions: ['Cycling motion in air.', 'Arm sync for balance.', 'Extend legs forward.'], duration: '20m' },
    { id: 'lj3', name: 'Landing Safety', skill: 'Landing Technique', instructions: ['Heels first contact.', 'Collapse knees forward.', 'Clear the sand marks.'], duration: '15m' }
  ],
  'High Jump': [
    { id: 'hj1', name: 'Fosbury Approach', skill: 'Approach', instructions: ['J-shaped run-up.', 'Centrifugal force gain.', 'Speed to vertical transition.'], duration: '20m' },
    { id: 'hj2', name: 'Bar Clearance (Flop)', skill: 'Bar Clearance (Flop)', instructions: ['Back to the bar.', 'Arching the spine.', 'Kick legs at the peak.'], duration: '20m' }
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
      toast({ title: "Select Athlete", description: "Pick an athlete to log the training session.", variant: "destructive" });
      return;
    }
    const isDone = !!store.data.drillCompletions[`${selectedPlayerId}_${drillId}`];
    setIsProcessing(drillId);
    store.setDrillCompletion(drillId, selectedPlayerId, !isDone);
    toast({ 
      title: isDone ? "Drill Reset" : "Training Logged", 
      description: `${drillName} training record updated for student.` 
    });
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
              <ShieldCheck className="w-4 h-4" /> Institutional Training Registry
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">1. Select Game</label>
              <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setSelectedPlayerId(""); }}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-black uppercase text-[10px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(DRILLS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">2. Active Athlete</label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-black uppercase text-[10px] bg-white"><SelectValue placeholder="Pick Player" /></SelectTrigger>
                <SelectContent>{playersInSport.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">3. View Sessions</label>
              <Button variant={viewHistory ? "default" : "outline"} onClick={() => setViewHistory(!viewHistory)} className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px] bg-white shadow-sm">
                {viewHistory ? <History className="w-4 h-4 mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />} {viewHistory ? "Completed" : "Today's Drills"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-24 flex flex-col items-center opacity-30 rounded-[3rem] bg-white/50">
          <User className="w-16 h-16 mb-4 text-primary" />
          <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">Select an athlete to start training sessions</p>
        </Card>
      ) : currentDrills.length === 0 ? (
        <Card className="border-dashed border-4 p-24 flex flex-col items-center opacity-30 rounded-[3rem] bg-white/50">
          <CheckCircle className="w-16 h-16 mb-4 text-primary" />
          <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">No remaining drills for this category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDrills.map((drill) => (
            <Card key={drill.id} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/30 transition-all group">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">{drill.name}</h3>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-cyan-200 text-cyan-700 bg-cyan-50">Skill: {drill.skill}</Badge>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.duration}</span>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-2xl space-y-3 border-2 border-dashed border-muted">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest"><BookOpen className="w-3 h-3" /> Coaching Steps</div>
                  <ul className="space-y-2">
                    {drill.instructions.map((ins: any, i: number) => (
                      <li key={i} className="text-xs font-bold text-foreground/70 flex gap-2">
                        <span className="text-primary">•</span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => handleToggleComplete(drill.id, drill.name)} 
                  disabled={isProcessing === drill.id} 
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active-scale", 
                    viewHistory ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {isProcessing === drill.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : viewHistory ? (
                    "RESET DRILL RECORD"
                  ) : (
                    <><Dumbbell className="w-4 h-4 mr-2" /> LOG COMPLETION</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

