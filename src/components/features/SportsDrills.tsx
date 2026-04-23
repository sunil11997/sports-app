
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
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { 
      id: 'k1', 
      name: 'The Perfect Dubki', 
      skill: 'Dubki', 
      equipment: 'Mats', 
      difficulty: 'Intermediate', 
      duration: '20 Mins', 
      instructions: [
        'Start in a low defensive crouch stance facing the midline.',
        'Anticipate the defenders coming in for a waist-level tackle.',
        'Swiftly drop your head and shoulders toward the ground.',
        'Propel your body forward using explosive force from your legs.',
        'Stay flat and crawl under the defenders\' reach to cross the midline.'
      ]
    },
    { 
      id: 'k2', 
      name: 'Ankle Hold Reaction', 
      skill: 'Ankle Hold', 
      equipment: 'Mats', 
      difficulty: 'Intermediate', 
      duration: '15 Mins', 
      instructions: [
        'The defender stays low and watches the raider\'s lead foot.',
        'When the raider steps deep, strike fast to grip the ankle with both hands.',
        'Pull the raider backward while keeping your own feet planted.',
        'Call for immediate support from the chain to secure the tackle.'
      ]
    },
    { 
      id: 'k3', 
      name: 'Chain Tackle Sync', 
      skill: 'Chain Tackle', 
      equipment: 'Partner, whistle', 
      difficulty: 'Advanced', 
      duration: '30 Mins', 
      instructions: [
        'Two defenders hold hands to form a "chain".',
        'Move laterally in unison to mirror the raider\'s movement.',
        'On signal, swing the chain forward like a net to block the raider\'s path.',
        'Use shoulder force to push the raider out of bounds while maintaining the hand-grip.'
      ]
    }
  ],
  'Volleyball': [
    { 
      id: 'v1', 
      name: 'Overhead Serve Accuracy', 
      skill: 'Serving', 
      equipment: 'Balls, Net', 
      difficulty: 'Beginner', 
      duration: '20 Mins', 
      instructions: [
        'Stand behind the end line with your non-dominant foot forward.',
        'Toss the ball about 2-3 feet high directly in front of your hitting shoulder.',
        'Keep your hitting hand firm and fingers together.',
        'Strike the center of the ball with the heel of your palm.',
        'Aim for the back corners of the opponent\'s court.'
      ]
    },
    { 
      id: 'v2', 
      name: 'Spike Timing & Snap', 
      skill: 'Spiking (Attack)', 
      equipment: 'High Net, Balls', 
      difficulty: 'Advanced', 
      duration: '25 Mins', 
      instructions: [
        'Approach the net using a 3-step rhythm (Left-Right-Left).',
        'Jump vertically using explosive upward arm swing.',
        'Keep the ball in front of your hitting shoulder while in the air.',
        'Snap your wrist over the ball to create top-spin and downward trajectory.',
        'Land softly on both feet to avoid net contact or injury.'
      ]
    }
  ],
  'Kho Kho': [
    { 
      id: 'kh1', 
      name: 'Pole Turning Speed', 
      skill: 'Pole turning', 
      equipment: 'Wooden Poles', 
      difficulty: 'Intermediate', 
      duration: '15 Mins', 
      instructions: [
        'Sprint toward the pole at maximum speed.',
        'Grip the pole with your inner hand to create a pivot point.',
        'Keep your body low and swing your outer leg around the pole.',
        'Execute a sharp 180-degree turn without losing momentum.',
        'Immediately accelerate back into the court.'
      ]
    },
    { 
      id: 'kh2', 
      name: 'Precision Kho Giving', 
      skill: 'Giving kho', 
      equipment: 'Flat Court', 
      difficulty: 'Beginner', 
      duration: '10 Mins', 
      instructions: [
        'Approach the sitting teammate from behind.',
        'Tap the teammate\'s back clearly between the shoulders.',
        'Loudly announce "KHO" simultaneously.',
        'The giver must immediately sit in the vacated square.',
        'Practice this at high speed to maintain pressure on the runner.'
      ]
    }
  ],
  'Handball': [
    { 
      id: 'h1', 
      name: 'Fast Break Transition', 
      skill: 'Fast break', 
      equipment: 'Balls, Court', 
      difficulty: 'Advanced', 
      duration: '20 Mins', 
      instructions: [
        'On turnover, the wings immediately sprint toward the opponent\'s goal.',
        'The goalkeeper looks for the long-pass opportunity instantly.',
        'Receive the ball while running at full speed without a travel violation.',
        'Execute a jump-shot or running shot before the defense can recover.'
      ]
    }
  ],
  'Running': [
    { 
      id: 'r1', 
      name: 'Block Start Reaction', 
      skill: 'Starting technique', 
      equipment: 'Blocks, Clapper', 
      difficulty: 'Advanced', 
      duration: '15 Mins', 
      instructions: [
        'Set the blocks to your specific leg length.',
        'On "Set", lift hips and shift weight forward onto your hands.',
        'On "Go", drive both legs powerfully against the blocks.',
        'Maintain a low driving posture for the first 10-15 meters.',
        'Look down at the track to avoid premature upright standing.'
      ]
    }
  ],
  'Long Jump': [
    { 
      id: 'lj1', 
      name: 'The Penultimate Step', 
      skill: 'Take-off', 
      equipment: 'Sand Pit', 
      difficulty: 'Advanced', 
      duration: '20 Mins', 
      instructions: [
        'Focus on the second-to-last step of the approach run.',
        'This step should be slightly longer to lower your center of gravity.',
        'The final step is then shorter and faster to convert horizontal speed to vertical.',
        'Drive the lead knee upward during the take-off phase.',
        'Keep your eyes fixed forward, not down at the board.'
      ]
    }
  ],
  'High Jump': [
    { 
      id: 'hj1', 
      name: 'Fosbury Back Arch', 
      skill: 'Bar clearance (Fosbury flop)', 
      equipment: 'Mat, Bar', 
      difficulty: 'Intermediate', 
      duration: '30 Mins', 
      instructions: [
        'Run the J-approach curve to build centrifugal force.',
        'Take off from the outer foot while rotating your back to the bar.',
        'While in the air, thrust your hips upward to create a bridge/arch.',
        'Tuck your chin toward your chest as your legs clear the bar.',
        'Land on your upper back and shoulders on the safety mat.'
      ]
    }
  ],
  'Shot Put': [
    { 
      id: 'sp1', 
      name: 'Glide Power Position', 
      skill: 'Glide technique', 
      equipment: 'Shot Put Ball', 
      difficulty: 'Intermediate', 
      duration: '25 Mins', 
      instructions: [
        'Start at the back of the circle facing away from the target.',
        'Hop backward on one leg while keeping the shot tucked against your neck.',
        'Land in a strong "Power Position" with legs wide and torso rotated.',
        'Drive through the hips and throw with full arm extension.',
        'Follow through by flicking the fingers at the release point.'
      ]
    }
  ],
  'Javline': [
    { 
      id: 'jv1', 
      name: 'Cross Step Approach', 
      skill: 'Cross steps', 
      equipment: 'Javelin', 
      difficulty: 'Advanced', 
      duration: '20 Mins', 
      instructions: [
        'Hold the javelin at ear level with the tip pointing slightly down.',
        'Execute the 5-step delivery rhythm.',
        'Use "Cross Steps" to pull the javelin back while maintaining forward speed.',
        'The final "Impulse Step" creates a block for the front leg.',
        'Transfer weight from back to front leg and launch the javelin over the shoulder.'
      ]
    }
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
      toast({ title: "Drill Reset", description: `${drillName} unmarked for today.` });
    } else {
      newCompleted.add(drillId);
      toast({ 
        title: "Session Synced!", 
        description: `${drillName} logged to technical history.`,
        className: "bg-accent border-accent-foreground text-accent-foreground font-black"
      });
    }
    setCompletedDrills(newCompleted);
  };

  const currentDrills = DRILLS_DATA[activeSport] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-10 h-10 text-cyan-600" /> Coaching Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Institutional training protocols for all Ashram Shala sports disciplines.
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

      {/* Drills Grid */}
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
                      <Badge className={cn(
                        "font-black uppercase text-[8px] px-3",
                        drill.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      )}>
                        {drill.difficulty}
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
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">How to Perform</span>
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
                    <><CheckCircle className="w-5 h-5 mr-2" /> DRILL COMPLETED TODAY</>
                  ) : (
                    "MARK SESSION AS FINISHED"
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Institutional Note */}
      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/20 p-12 text-center shadow-inner">
        <div className="max-w-2xl mx-auto space-y-4">
          <Info className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Institutional Practice Standard</h4>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
            "Regular drill completion directly influences the 'Technical Move Scores' in the student registry. 
            Coaches must prioritize proper form and student safety during all high-intensity sessions."
          </p>
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
            Approved by PE Department - Waghamba School
          </p>
        </div>
      </Card>
    </div>
  );
}
