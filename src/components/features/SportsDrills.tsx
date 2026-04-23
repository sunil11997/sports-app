
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Dumbbell, 
  Target, 
  Info, 
  CheckCircle2,
  BookOpen,
  Clock,
  ClipboardCheck,
  History,
  LayoutGrid,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'The Perfect Dubki', skill: 'Dubki', instructions: ['Start in a low defensive crouch stance.', 'Anticipate waist-level tackle.', 'Swiftly drop head and shoulders.', 'Propel forward using explosive leg force.', 'Crawl flat to cross midline.'], equipment: 'Mats', duration: '15 Mins' },
    { id: 'k2', name: 'Toe Touch Accuracy', skill: 'Toe Touch', instructions: ['Extend lead leg quickly during raid.', 'Touch defender\'s foot with toe point.', 'Maintain balance to retreat instantly.', 'Keep upper body away from defenders.'], equipment: 'None', duration: '10 Mins' },
    { id: 'k3', name: 'Ankle Hold Reaction', skill: 'Ankle Hold', instructions: ['Watch the raider\'s lead foot placement.', 'Strike fast when raider steps deep.', 'Grip ankle with both hands firmly.', 'Pull backward while planting feet.'], equipment: 'Mats', duration: '15 Mins' },
    { id: 'k4', name: 'Chain Tackle Sync', skill: 'Chain Tackle', instructions: ['Hold hands firmly with partner.', 'Move laterally in unison.', 'Swing chain forward like a net.', 'Push raider out of bounds using weight.'], equipment: 'Partner', duration: '20 Mins' },
    { id: 'k5', name: 'Lion Jump Timing', skill: 'Lion Jump', instructions: ['Wait for defenders to dive low.', 'Take explosive vertical leap.', 'Clear the defender\'s height.', 'Land safely and cross the line.'], equipment: 'Soft Mats', duration: '15 Mins' },
  ],
  'Volleyball': [
    { id: 'v1', name: 'Overhead Serve', skill: 'Serving', instructions: ['Toss ball 3 feet high.', 'Hitting arm back at 90 degrees.', 'Strike with heel of palm.', 'Snap wrist for top spin.'], equipment: 'Balls, Net', duration: '20 Mins' },
    { id: 'v2', name: 'Spike Timing', skill: 'Spiking (Attack)', instructions: ['3-step approach (Left-Right-Left).', 'Jump vertically with arm swing.', 'Contact ball at peak height.', 'Snap wrist downward.'], equipment: 'High Net', duration: '25 Mins' },
    { id: 'v3', name: 'Bump Pass Control', skill: 'Passing (Bump)', instructions: ['Clasp hands for flat platform.', 'Legs wide and knees bent.', 'Don\'t swing arms; use legs.', 'Direct ball to the setter.'], equipment: 'Balls', duration: '15 Mins' },
  ],
  'Handball': [
    { id: 'h1', name: 'Jump Shot Power', skill: 'Jump shot', instructions: ['Take 3 steps toward goal.', 'Jump high off non-dominant foot.', 'Release ball at peak of jump.', 'Snap wrist for speed.'], equipment: 'Balls, Goal', duration: '20 Mins' },
    { id: 'h2', name: 'Fast Break Sprint', skill: 'Fast break', instructions: ['Sprint immediately after turnover.', 'Receive long pass while running.', 'Maintain speed without traveling.', 'Execute running shot on goal.'], equipment: 'Balls, Court', duration: '15 Mins' },
    { id: 'h3', name: 'Pivot Positioning', skill: 'Pivot play', instructions: ['Stand with back to the goal.', 'Receive pass in low stance.', 'Spin quickly around defender.', 'Shoot from close range.'], equipment: 'Defender', duration: '20 Mins' },
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Turning Speed', skill: 'Pole turning', instructions: ['Sprint toward pole at max speed.', 'Grip pole with inner hand.', 'Pivot low around the wood.', 'Accelerate back into court.'], equipment: 'Poles', duration: '15 Mins' },
    { id: 'kh2', name: 'Giving Precision Kho', skill: 'Giving kho', instructions: ['Approach sitter from behind.', 'Tap back clearly between shoulders.', 'Loudly announce "KHO".', 'Sit immediately in square.'], equipment: 'Court', duration: '10 Mins' },
    { id: 'kh3', name: 'Sudden Diving', skill: 'Diving', instructions: ['Target runner\'s path.', 'Execute full-body layout dive.', 'Extend arm to touch runner.', 'Tuck and roll for safe landing.'], equipment: 'Soft Ground', duration: '20 Mins' },
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Drive', skill: 'Starting technique', instructions: ['Set blocks to leg length.', 'On "Set", lift hips high.', 'On "Go", drive legs powerfully.', 'Stay low for first 15 meters.'], equipment: 'Blocks', duration: '15 Mins' },
    { id: 'r2', name: 'Stride Frequency', skill: 'Stride frequency', instructions: ['Short, fast steps to build speed.', 'High knee lift.', 'Quick foot-ground contact.', 'Maintain upright posture.'], equipment: 'Track', duration: '20 Mins' },
  ],
  'Shot Put': [
    { id: 'sp1', name: 'Glide Technique', skill: 'Glide technique', instructions: ['Start at back of circle.', 'Hop backward on one leg.', 'Land in strong power position.', 'Explode through hips and arm.'], equipment: 'Shot Put Ball', duration: '25 Mins' },
    { id: 'sp2', name: 'Grip & Placement', skill: 'Grip', instructions: ['Rest shot on finger bases.', 'Keep elbow high.', 'Tuck shot against neck.', 'Maintain firm wrist.'], equipment: 'Shot Put Ball', duration: '10 Mins' },
  ],
  'Javline': [
    { id: 'jv1', name: 'Cross Step Rhythm', skill: 'Cross steps', instructions: ['Run with javelin at ear level.', 'Perform 5-step delivery.', 'Execute cross steps for tension.', 'Block with front leg.'], equipment: 'Javelin', duration: '20 Mins' },
    { id: 'jv2', name: 'Release Angle', skill: 'Release angle', instructions: ['Hold javelin point slightly down.', 'Transfer weight back to front.', 'Launch over the shoulder.', 'Snap fingers at release.'], equipment: 'Javelin', duration: '15 Mins' },
  ],
  'Long Jump': [
    { id: 'lj1', name: 'Penultimate Step', skill: 'Take-off', instructions: ['Second-to-last step is longer.', 'Lower center of gravity.', 'Final step is fast and short.', 'Drive knee upward hard.'], equipment: 'Sand Pit', duration: '20 Mins' },
    { id: 'lj2', name: 'Landing Extension', skill: 'Landing', instructions: ['Keep legs high in air.', 'Extend feet forward at landing.', 'Collapse knees to avoid falling back.', 'Sweep arms forward.'], equipment: 'Sand Pit', duration: '15 Mins' },
  ],
  'High Jump': [
    { id: 'hj1', name: 'Fosbury Back Arch', skill: 'Bar clearance (Fosbury flop)', instructions: ['Run J-approach for speed.', 'Take off from outer foot.', 'Arch back over the bar.', 'Thrust hips upward at peak.'], equipment: 'Mat, Bar', duration: '30 Mins' },
    { id: 'hj2', name: 'J-Approach Curve', skill: 'Approach run', instructions: ['Start straight for 4 steps.', 'Curve for last 4 steps.', 'Build centrifugal force.', 'Maintain speed in turn.'], equipment: 'Cones', duration: '15 Mins' },
  ]
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [viewCompletedOnly, setViewCompletedMode] = useState(false);
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set());

  const handleToggleComplete = (drillId: string, drillName: string) => {
    const newCompleted = new Set(completedDrills);
    if (newCompleted.has(drillId)) {
      newCompleted.delete(drillId);
      toast({ title: "Drill Reset", description: `${drillName} unmarked for today.` });
    } else {
      newCompleted.add(drillId);
      toast({ 
        title: "Session Logged", 
        description: `${drillName} synced to technical history.`,
        className: "bg-accent border-accent-foreground text-accent-foreground font-black"
      });
    }
    setCompletedDrills(newCompleted);
  };

  const currentDrills = (DRILLS_DATA[activeSport] || []).filter(d => 
    viewCompletedOnly ? completedDrills.has(d.id) : true
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-10 h-10 text-cyan-600" /> Coaching Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Technical training protocols mapping directly to Game Skill move sets.
            </p>
          </div>
          <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4">
            <div className="space-y-2 w-full md:w-64">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Game / Discipline</label>
              <select 
                value={activeSport} 
                onChange={(e) => setActiveSport(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-white px-4 font-black text-primary uppercase appearance-none shadow-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(DRILLS_DATA).map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 w-full md:w-64">
              <label className="text-[10px] font-black text-primary uppercase ml-2">View Mode</label>
              <Button 
                variant={viewCompletedOnly ? "default" : "outline"} 
                onClick={() => setViewCompletedMode(!viewCompletedOnly)}
                className={cn(
                  "w-full h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all",
                  viewCompletedOnly ? "bg-accent text-accent-foreground border-accent" : "border-primary/20 bg-white text-primary"
                )}
              >
                {viewCompletedOnly ? <><History className="w-4 h-4 mr-2" /> Show All Drills</> : <><Filter className="w-4 h-4 mr-2" /> Show Completed Only</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentDrills.length === 0 ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[2.5rem] bg-white/50">
          <Dumbbell className="w-16 h-16 mb-6 opacity-10" />
          <p className="text-xl font-bold uppercase tracking-widest opacity-30">
            {viewCompletedOnly ? 'No drills completed in this category today' : 'No drills found'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentDrills.map((drill) => {
            const isDone = completedDrills.has(drill.id);
            return (
              <Card key={drill.id} className={cn(
                "border-2 rounded-[2.5rem] overflow-hidden transition-all group relative",
                isDone ? "border-primary/40 bg-primary/5" : "hover:border-primary/30 bg-white shadow-xl"
              )}>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-primary uppercase tracking-tight leading-tight">{drill.name}</h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50 font-black text-[9px] uppercase px-3">
                          {drill.skill}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-muted-foreground font-black text-[10px] uppercase">
                        <Clock className="w-3 h-3" /> {drill.duration}
                      </div>
                      {isDone && <CheckCircle2 className="w-8 h-8 text-primary fill-white animate-in zoom-in" />}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Coaching Instructions</span>
                      </div>
                      <ul className="space-y-3">
                        {drill.instructions.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-sm font-medium text-foreground/80 leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 bg-white border border-primary/20 rounded-full flex items-center justify-center text-[10px] font-black text-primary shadow-sm">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase px-2">
                      <Target className="w-3 h-3 text-accent" /> Equipment: <span className="text-foreground ml-1">{drill.equipment}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleToggleComplete(drill.id, drill.name)}
                    variant={isDone ? "default" : "outline"}
                    className={cn(
                      "w-full rounded-2xl font-black uppercase text-xs tracking-widest h-14 transition-all active-scale shadow-lg",
                      isDone ? "bg-primary hover:bg-primary/90" : "border-2 border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    {isDone ? (
                      <><CheckCircle className="w-5 h-5 mr-2" /> SESSION COMPLETED</>
                    ) : (
                      "MARK AS COMPLETED"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/20 p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <Info className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Technical Drill Standard</h4>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
            "Every completed drill recorded here serves as institutional evidence of technical progress. 
            Ensure students maintain proper form to avoid injuries during high-intensity sessions."
          </p>
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
            Approved by PE Department - Waghamba School
          </p>
        </div>
      </Card>
    </div>
  );
}
