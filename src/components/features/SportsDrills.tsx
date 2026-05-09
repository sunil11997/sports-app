"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  Dumbbell, 
  BookOpen, 
  Clock, 
  ClipboardCheck, 
  History, 
  Loader2, 
  User, 
  PlayCircle, 
  ShieldCheck,
  Globe,
  BarChart3,
  Users2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0048A0', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

// Rich Drill Database
const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Dubki Mastery', skill: 'Dubki', url: 'https://www.prokabaddi.com/technical-rules', instructions: ['Maintain a low raiding stance.', 'Wait for the defender chain to lunge.', 'Contract your body, duck low, and spring forward under their arms.'], duration: '15m' },
    { id: 'k2', name: 'Toe Touch Speed', skill: 'Toe Touch', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-toe-touch', instructions: ['Approach the corner defender with rhythmic movement.', 'Suddenly extend your lead leg to touch the toe.', 'Retract immediately to maintain balance.'], duration: '10m' },
    { id: 'k3', name: 'Running Hand Touch', skill: 'Hand Touch', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-hand-touch', instructions: ['Sprint toward the midline or a defender.', 'Extend your arm fully while in motion.', 'Touch and pivot back to your half in one fluid motion.'], duration: '12m' },
    { id: 'k6', name: 'Ankle Hold Grip', skill: 'Ankle Hold', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-ankle-hold', instructions: ['Anchor your feet firmly.', 'Watch the raider\'s foot placement.', 'Lunge and grab the ankle with both hands using a thumb-lock grip.'], duration: '15m' }
  ],
  'Volleyball': [
    { id: 'v1', name: 'Service Ace', skill: 'Serving', url: 'https://www.fivb.com/en/volleyball/thegame_glossary/basicrules', instructions: ['Toss the ball high and slightly in front.', 'Step forward and strike the ball with a flat palm.', 'Aim for deep corners to disrupt the reception.'], duration: '20m' },
    { id: 'v2', name: 'Bump Pass Control', skill: 'Passing', url: 'https://www.fivb.com/en/volleyball/thegame_glossary/skills', instructions: ['Interlock fingers and create a flat platform with forearms.', 'Bend knees and shrug shoulders.', 'Use your legs to direct the ball to the setter.'], duration: '15m' }
  ],
  'Handball': [
    { id: 'h1', name: 'Jump Shot Power', skill: 'Shooting', url: 'https://www.ihf.info/media-center/news/handball-basics-jump-shot', instructions: ['Take a three-step run-up.', 'Explode upwards from your non-throwing foot.', 'Release the ball at the peak of your jump.'], duration: '20m' }
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Turning Speed', skill: 'Pole turning', url: 'https://khokhofederation.in/rules-of-kho-kho/', instructions: ['Grip the pole with the inner hand.', 'Lean outward to use centrifugal force.', 'Pivot rapidly while staying low to the ground.'], duration: '15m' }
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Drill', skill: 'Sprinting', url: 'https://www.worldathletics.org/news/series/starting-block-basics', instructions: ['Adjust blocks to your leg length.', 'On "Set", lift hips and lean forward.', 'Drive hard with the front leg on the whistle.'], duration: '20m' }
  ],
  'Shot Put': [
    { id: 'sp1', name: 'Glide Technique', skill: 'Throwing', url: 'https://www.worldathletics.org/be-your-best/shot-put-technique', instructions: ['Start at the back of the circle facing away.', 'Perform a rhythmic hop backward.', 'Rotate hips and push the shot at a 45-degree angle.'], duration: '20m' }
  ],
  'Javline': [
    { id: 'j1', name: 'Approach Rhythms', skill: 'Approach', url: 'https://www.worldathletics.org/disciplines/javelin-throw', instructions: ['Start with a controlled run.', 'Transition into cross-over steps.', 'Maintain a high javelin position throughout.'], duration: '15m' }
  ],
  'Long Jump': [
    { id: 'lj1', name: 'Hitch-kick Flight', skill: 'Flight', url: 'https://www.worldathletics.org/disciplines/long-jump', instructions: ['Achieve maximum velocity on approach.', 'Perform a cycling motion with legs in the air.', 'Land with feet extended forward.'], duration: '15m' }
  ],
  'High Jump': [
    { id: 'hj1', name: 'Fosbury Flop', skill: 'Bar Clearance', url: 'https://www.worldathletics.org/disciplines/high-jump', instructions: ['Approach in a J-curve.', 'Take off from the outer foot.', 'Arch your back over the bar and kick legs high.'], duration: '20m' }
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

  // Analytics Calculation
  const analyticsData = useMemo(() => {
    const completions = Object.keys(store.data.drillCompletions);
    const genderCounts = { Male: 0, Female: 0 };
    const ageCounts: Record<string, number> = { 'U14': 0, 'U17': 0, 'Senior': 0 };

    completions.forEach(compKey => {
      const pId = compKey.split('_')[0];
      const player = store.data.players.find((p: any) => p.id === pId);
      if (player) {
        genderCounts[player.gender as keyof typeof genderCounts]++;
        const age = parseInt(player.age);
        if (age < 14) ageCounts['U14']++;
        else if (age < 17) ageCounts['U17']++;
        else ageCounts['Senior']++;
      }
    });

    const genderChart = [
      { name: 'Boys', value: genderCounts.Male },
      { name: 'Girls', value: genderCounts.Female }
    ];

    const ageChart = Object.entries(ageCounts).map(([name, count]) => ({ name, count }));

    return { genderChart, ageChart };
  }, [store.data.drillCompletions, store.data.players]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <PlayCircle className="w-10 h-10 text-cyan-600" /> Coaching Hub
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Institutional Training Registry
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full h-8 border-primary text-primary font-black text-[9px] uppercase px-4 hover:bg-primary hover:text-white transition-all">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> View Participation Analytics
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-primary uppercase flex items-center gap-2">
                      <Users2 className="w-6 h-6" /> Training Participation Overview
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <Card className="border-none shadow-none bg-muted/30 rounded-3xl p-4">
                      <CardTitle className="text-[10px] font-black uppercase text-center mb-4 tracking-widest">Gender Distribution</CardTitle>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.genderChart}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.genderChart.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="border-none shadow-none bg-muted/30 rounded-3xl p-4">
                      <CardTitle className="text-[10px] font-black uppercase text-center mb-4 tracking-widest">Age-Wise Participation</CardTitle>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.ageChart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                            <YAxis fontSize={10} fontWeight="bold" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0048A0" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                  <p className="text-[9px] font-bold text-center text-muted-foreground uppercase mt-4 tracking-widest">
                    Live analytics generated from {Object.keys(store.data.drillCompletions).length} logged sessions
                  </p>
                </DialogContent>
              </Dialog>
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
                {viewHistory ? <History className="w-4 h-4 mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />} {viewHistory ? "Completed" : "Active Drills"}
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
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-cyan-200 text-cyan-700 bg-cyan-50">Skill: {drill.skill}</Badge>
                      {drill.url && (
                        <a href={drill.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[8px] font-black text-blue-600 hover:underline uppercase">
                          <Globe className="w-2.5 h-2.5 mr-1" /> Tutorial Link
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.duration}</span>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-2xl space-y-4 border-2 border-dashed border-muted">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest"><BookOpen className="w-3 h-3" /> How to Conduct</div>
                  <ul className="space-y-3">
                    {drill.instructions.map((ins: any, i: number) => (
                      <li key={i} className="text-xs font-bold text-foreground/70 flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                        <span className="pt-0.5">{ins}</span>
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
                    "RESET TRAINING RECORD"
                  ) : (
                    <><Dumbbell className="w-4 h-4 mr-2" /> LOG DRILL COMPLETION</>
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
