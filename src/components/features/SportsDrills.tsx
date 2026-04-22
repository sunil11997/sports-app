
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
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Toe Touch Sprint', skill: 'Toe Touch', equipment: 'Cones, Whistle', difficulty: 'Beginner', duration: '15 Mins', desc: 'Repeat short sprints touching cones representing defenders feet.' },
    { id: 'k2', name: 'Lion Jump Box', skill: 'Lion Jump', equipment: 'Plyometric Box, Mats', difficulty: 'Advanced', duration: '20 Mins', desc: 'Explosive jumps over a box to simulate escaping a chain tackle.' },
    { id: 'k3', name: 'Ankle Hold Reaction', skill: 'Ankle Hold', equipment: 'Mats', difficulty: 'Intermediate', duration: '25 Mins', desc: 'Partner drill focused on timing the grip when raider steps back.' },
    { id: 'k4', name: 'Dubki Low Crawl', skill: 'Dubki', equipment: 'Low Hurdle/Bar', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Diving under a horizontal bar while maintaining forward momentum.' },
  ],
  'Volleyball': [
    { id: 'v1', name: 'Target Serve', skill: 'Serving', equipment: 'Balls, Target Hoops', difficulty: 'Beginner', duration: '20 Mins', desc: 'Aiming serves at specific court zones marked by hoops.' },
    { id: 'v2', name: 'Wall Bump Drill', skill: 'Passing (Bump)', equipment: 'Ball, Wall', difficulty: 'Beginner', duration: '10 Mins', desc: 'Continuous passing against a wall to build forearm consistency.' },
    { id: 'v3', name: 'Spike Power Hit', skill: 'Spiking (Attack)', equipment: 'Ball, High Net', difficulty: 'Advanced', duration: '30 Mins', desc: 'Focusing on vertical reach and wrist snap for powerful spikes.' },
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Turning Speed', skill: 'Pole turning', equipment: 'Poles', difficulty: 'Intermediate', duration: '15 Mins', desc: 'Practicing the sharp 180-degree turn around the pole.' },
    { id: 'kh2', name: 'Zig-Zag Escape', skill: 'Zig-zag running', equipment: 'Cones', difficulty: 'Beginner', duration: '20 Mins', desc: 'Improving dodging ability by weaving through tight cone patterns.' },
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Reaction', skill: 'Starting technique', equipment: 'Starting Blocks, Clapper', difficulty: 'Advanced', duration: '15 Mins', desc: 'Explosive reaction drill for 100m/200m starts.' },
    { id: 'r2', name: 'Endurance Pace', skill: 'Endurance', equipment: 'Stopwatch', difficulty: 'Intermediate', duration: '45 Mins', desc: 'Steady-state running at 70% max heart rate.' },
  ]
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set());

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
              <Dumbbell className="w-10 h-10 text-cyan-600" /> AI Drill Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Structured training exercises mapped to technical game skills.
            </p>
          </div>
          <div className="w-full md:w-80 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Discipline</label>
            <Select value={activeSport} onValueChange={setActiveSport}>
              <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(DRILLS_DATA).map(sport => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDrills.map((drill) => {
          const isDone = completedDrills.has(drill.id);
          return (
            <Card key={drill.id} className={cn(
              "border-2 rounded-[2rem] overflow-hidden transition-all group",
              isDone ? "border-primary/40 bg-primary/5" : "hover:border-primary/30 bg-white"
            )}>
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                <Video className="w-12 h-12 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-0 font-bold">
                    <Play className="w-3 h-3 mr-1 fill-white" /> AI VIDEO HINT
                  </Badge>
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

// Minimal select components needed since I'm using raw exports or generic ones
function Select({ children, value, onValueChange }: any) {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-white px-4 font-black text-primary uppercase appearance-none shadow-sm focus:outline-none focus:border-primary"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l pl-3">
        <Dumbbell className="w-4 h-4 text-primary opacity-30" />
      </div>
    </div>
  );
}

function SelectTrigger({ children, className }: any) { return <div className={className}>{children}</div>; }
function SelectValue({ placeholder }: any) { return <span>{placeholder}</span>; }
function SelectContent({ children }: any) { return <>{children}</>; }
function SelectItem({ value, children }: any) { return <option value={value}>{children}</option>; }
