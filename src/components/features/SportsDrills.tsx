
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  Dumbbell, 
  Video, 
  Target, 
  Info, 
  Search,
  CheckCircle2,
  X,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Toe Touch Sprint', skill: 'Toe Touch', equipment: 'Cones, Whistle', difficulty: 'Beginner', duration: '15 Mins', desc: 'Repeat short sprints touching cones representing defenders feet.', video: 'https://www.youtube.com/embed/S_8U-6YkF8c' },
    { id: 'k2', name: 'Lion Jump Box', skill: 'Lion Jump', equipment: 'Plyometric Box, Mats', difficulty: 'Advanced', duration: '20 Mins', desc: 'Explosive jumps over a box to simulate escaping a chain tackle.', video: 'https://www.youtube.com/embed/v9Y7_G8J8gI' },
    { id: 'k3', name: 'Ankle Hold Reaction', skill: 'Ankle Hold', equipment: 'Mats', difficulty: 'Intermediate', duration: '25 Mins', desc: 'Partner drill focused on timing the grip when raider steps back.', video: 'https://www.youtube.com/embed/K9Z7Nq9V-80' },
    { id: 'k4', name: 'Dubki Low Crawl', skill: 'Dubki', equipment: 'Low Hurdle/Bar', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Diving under a horizontal bar while maintaining forward momentum.', video: 'https://www.youtube.com/embed/S8u0K-eH7-A' },
    { id: 'k5', name: 'Chain Tackle Sync', skill: 'Chain Tackle', equipment: 'Partner, whistle', difficulty: 'Advanced', duration: '30 Mins', desc: 'Synchronized movement with a partner to block raider path.', video: 'https://www.youtube.com/embed/3O9k8XyD8jY' },
  ],
  'Volleyball': [
    { id: 'v1', name: 'Target Serve', skill: 'Serving', equipment: 'Balls, Target Hoops', difficulty: 'Beginner', duration: '20 Mins', desc: 'Aiming serves at specific court zones marked by hoops.', video: 'https://www.youtube.com/embed/6Yv5S3O3o7k' },
    { id: 'v2', name: 'Wall Bump Drill', skill: 'Passing (Bump)', equipment: 'Ball, Wall', difficulty: 'Beginner', duration: '10 Mins', desc: 'Continuous passing against a wall to build forearm consistency.', video: 'https://www.youtube.com/embed/e6-V9n-O828' },
    { id: 'v3', name: 'Spike Power Hit', skill: 'Spiking (Attack)', equipment: 'Ball, High Net', difficulty: 'Advanced', duration: '30 Mins', desc: 'Focusing on vertical reach and wrist snap for powerful spikes.', video: 'https://www.youtube.com/embed/Z6-C_mE-vB8' },
    { id: 'v4', name: 'Block Timing Jump', skill: 'Blocking', equipment: 'Net, Block board', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Jump timing drill against a simulated opponent spike.', video: 'https://www.youtube.com/embed/W9o76wYVv8g' },
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Turning Speed', skill: 'Pole turning', equipment: 'Poles', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Practicing the sharp 180-degree turn around the pole.', video: 'https://www.youtube.com/embed/9Bv_pX-rN-A' },
    { id: 'kh2', name: 'Zig-Zag Escape', skill: 'Zig-zag running', equipment: 'Cones', difficulty: 'Beginner', duration: '20 Mins', desc: 'Improving dodging ability by weaving through tight cone patterns.', video: 'https://www.youtube.com/embed/L_4R9m-MvS4' },
    { id: 'kh3', name: 'Pole Dive Practice', skill: 'Diving', equipment: 'Sand Pit / Mats', difficulty: 'Advanced', duration: '30 Mins', desc: 'Full length dive from pole to touch running opponent.', video: 'https://www.youtube.com/embed/0X9R6Q9v_f8' },
  ],
  'Handball': [
    { id: 'h1', name: 'Pivot Shot Accuracy', skill: 'Shooting', equipment: 'Handball, Goal Post', difficulty: 'Intermediate', duration: '20 Mins', desc: 'Turning 180 degrees at the goal line to shoot past keeper.', video: 'https://www.youtube.com/embed/J7P5C-O7_z8' },
    { id: 'h2', name: 'Wing Fast Break', skill: 'Speed', equipment: 'Balls, whistle', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Rapid transition from defense to attack along the sidelines.', video: 'https://www.youtube.com/embed/S9V7O-kL2f8' },
    { id: 'h3', name: 'Keeper Reaction', skill: 'Goalkeeping', equipment: 'Goal post, reaction balls', difficulty: 'Advanced', duration: '25 Mins', desc: 'Rapid saving practice for low and high shots.', video: 'https://www.youtube.com/embed/X9o7V-eR_z0' },
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Reaction', skill: 'Starting technique', equipment: 'Starting Blocks, Clapper', difficulty: 'Advanced', duration: '15 Mins', desc: 'Explosive reaction drill for 100m/200m starts.', video: 'https://www.youtube.com/embed/Y-9V7O-kL2f8' },
    { id: 'r2', name: 'Endurance Pace', skill: 'Endurance', equipment: 'Stopwatch', difficulty: 'Intermediate', duration: '45 Mins', desc: 'Steady-state running at 70% max heart rate.', video: 'https://www.youtube.com/embed/W9o7-kL2f8' },
    { id: 'r3', name: 'Interval Sprints', skill: 'Acceleration', equipment: 'Track, cones', difficulty: 'Advanced', duration: '20 Mins', desc: 'High intensity 50m sprints with 10s rest cycles.', video: 'https://www.youtube.com/embed/Z9V7O-kL2f8' },
  ],
  'Jumps': [
    { id: 'j1', name: 'Penultimate Step', skill: 'Take-off', equipment: 'Sand pit', difficulty: 'Advanced', duration: '20 Mins', desc: 'Focus on the second-to-last step to lower center of gravity.', video: 'https://www.youtube.com/embed/A9V7O-kL2f8' },
    { id: 'j2', name: 'Arch Back High Jump', skill: 'Bar clearance', equipment: 'High jump mat', difficulty: 'Intermediate', duration: '25 Mins', desc: 'Static back arching drills on mat to improve bar clearance.', video: 'https://www.youtube.com/embed/B9V7O-kL2f8' },
  ]
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const handleToggleComplete = (drillId: string, drillName: string) => {
    const newCompleted = new Set(completedDrills);
    if (newCompleted.has(drillId)) {
      newCompleted.delete(drillId);
      toast({ title: "Drill Unmarked", description: `${drillName} removed from today's log.` });
    } else {
      newCompleted.add(drillId);
      toast({ 
        title: "Drill Completed!", 
        description: `Great job! ${drillName} finished successfully.`,
        className: "bg-primary text-white border-primary"
      });
    }
    setCompletedDrills(newCompleted);
  };

  const currentDrills = DRILLS_DATA[activeSport] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <Dumbbell className="w-10 h-10 text-cyan-600" /> Practice Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Structured training exercises mapped to technical game skills.
            </p>
          </div>
          <div className="w-full md:w-80 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Game / Discipline</label>
            <div className="relative">
              <select 
                value={activeSport} 
                onChange={(e) => setActiveSport(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-white px-4 font-black text-primary uppercase appearance-none shadow-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(DRILLS_DATA).map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l pl-3">
                <Dumbbell className="w-4 h-4 text-primary opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDrills.map((drill) => {
          const isDone = completedDrills.has(drill.id);
          return (
            <Card key={drill.id} className={cn(
              "border-2 rounded-[2rem] overflow-hidden transition-all group relative",
              isDone ? "border-primary/40 bg-primary/5" : "hover:border-primary/30 bg-white"
            )}>
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                <Video className="w-12 h-12 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveVideo(drill)}
                    className="bg-white/20 backdrop-blur-md text-white border-0 font-bold hover:bg-white/40 h-9"
                  >
                    <PlayCircle className="w-5 h-5 mr-2 fill-white text-primary" /> PLAY AI VIDEO
                  </Button>
                </div>
                {isDone && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-16 h-16 text-primary fill-white" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight leading-tight">{drill.name}</h3>
                    <Badge variant="outline" className="mt-2 border-cyan-200 text-cyan-700 bg-cyan-50 font-black text-[9px] uppercase">
                      Skill: {drill.skill}
                    </Badge>
                  </div>
                  <Badge className={cn(
                    "font-black uppercase text-[8px]",
                    drill.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  )}>
                    {drill.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3 pt-2 border-t border-dashed">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                    <Target className="w-3 h-3" /> Equipment: {drill.equipment}
                  </div>
                  <p className="text-xs font-medium text-foreground/70 leading-relaxed italic">
                    "{drill.desc}"
                  </p>
                </div>

                <Button 
                  onClick={() => handleToggleComplete(drill.id, drill.name)}
                  variant={isDone ? "default" : "outline"}
                  className={cn(
                    "w-full rounded-xl font-black uppercase text-xs tracking-widest h-12 transition-all",
                    isDone ? "bg-primary hover:bg-primary/90" : "border-2 hover:bg-primary/5"
                  )}
                >
                  {isDone ? (
                    <><CheckCircle className="w-4 h-4 mr-2" /> DRILL COMPLETED</>
                  ) : (
                    "MARK AS FINISHED"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black rounded-[2rem] border-0">
          <DialogHeader className="p-6 bg-white flex flex-row justify-between items-center border-b">
            <DialogTitle className="text-xl font-black uppercase text-primary tracking-tight">
              AI Training: {activeVideo?.name}
            </DialogTitle>
            <DialogClose className="rounded-full bg-muted/50 p-2 hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </DialogClose>
          </DialogHeader>
          <div className="aspect-video bg-muted relative">
            <iframe 
              width="100%" 
              height="100%" 
              src={activeVideo?.video || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
          <div className="p-8 bg-white space-y-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-primary text-white font-black px-4 py-1">TECHNIQUE GUIDE</Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Duration: {activeVideo?.duration}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground/80">
              {activeVideo?.desc} Ensuring proper form during this {activeVideo?.difficulty} drill is critical for competitive {activeSport} success.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-2 border-dashed rounded-[2.5rem] bg-muted/20 p-12 text-center">
        <Info className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h4 className="text-lg font-black text-muted-foreground uppercase">Institutional Coaching Policy</h4>
        <p className="max-w-xl mx-auto text-sm font-medium text-muted-foreground/60 mt-2">
          Daily drill completion contributes to the "Technical Skill Score" in the primary player registry. 
          Teacher Sunil Deshmukh should ensure adequate hydration during high-intensity sessions.
        </p>
      </Card>
    </div>
  );
}
