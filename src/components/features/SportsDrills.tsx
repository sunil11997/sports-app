
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users2,
  MessageSquare,
  Send,
  Bot,
  Sparkles
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
import { coachChat } from '@/ai/flows/coach-chat';
import { usePWA } from '@/components/providers/pwa-provider';

const COLORS = ['#0048A0', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Dubki Mastery', skill: 'Dubki', url: 'https://www.prokabaddi.com/technical-rules', instructions: ['Maintain a low raiding stance.', 'Wait for the defender chain to lunge.', 'Contract your body, duck low, and spring forward under their arms.'], duration: '15m' },
    { id: 'k2', name: 'Toe Touch Speed', skill: 'Toe Touch', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-toe-touch', instructions: ['Approach the corner defender with rhythmic movement.', 'Suddenly extend your lead leg to touch the toe.', 'Retract immediately to maintain balance.'], duration: '10m' },
    { id: 'k3', name: 'Running Hand Touch', skill: 'Hand Touch', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-hand-touch', instructions: ['Sprint toward the midline or a defender.', 'Extend your arm fully while in motion.', 'Touch and pivot back to your half in one fluid motion.'], duration: '12m' },
    { id: 'k4', name: 'Frog Jump Tech', skill: 'Frog Jump', instructions: ['Launch over a diving defender using explosive leg power.', 'Land softly and maintain momentum towards mid-line.', 'Keep eyes on remaining defenders during flight.'], duration: '20m' },
    { id: 'k5', name: 'Scorpion Kick', skill: 'Back Kick', instructions: ['Raider turns back to defender.', 'Executes a high back-kick aiming for the shoulder.', 'Requires high core stability and timing.'], duration: '15m' },
    { id: 'k6', name: 'Ankle Hold Grip', skill: 'Ankle Hold', url: 'https://www.prokabaddi.com/news/kabaddi-skills-explained-the-ankle-hold', instructions: ['Anchor your feet firmly.', 'Watch the raider\'s foot placement.', 'Lunge and grab the ankle with both hands using a thumb-lock grip.'], duration: '15m' }
  ],
  'Volleyball': [
    { id: 'v1', name: 'Jump Serve Peak', skill: 'Serving', url: 'https://www.fivb.com/en/volleyball/thegame_glossary/basicrules', instructions: ['Toss the ball high and slightly in front.', 'Step forward and strike the ball with a flat palm.', 'Aim for deep corners to disrupt the reception.'], duration: '20m' },
    { id: 'v2', name: 'Bump Pass Control', skill: 'Passing', url: 'https://www.fivb.com/en/volleyball/thegame_glossary/skills', instructions: ['Interlock fingers and create a flat platform with forearms.', 'Bend knees and shrug shoulders.', 'Use your legs to direct the ball to the setter.'], duration: '15m' },
    { id: 'v3', name: 'Setter Accuracy Drill', skill: 'Setting', instructions: ['Fingertips forming a triangle.', 'Push the ball upwards using wrist flick.', 'Practice consistent height and arc for hitters.'], duration: '25m' }
  ],
  'Handball': [
    { id: 'h1', name: 'Jump Shot Power', skill: 'Shooting', url: 'https://www.ihf.info/media-center/news/handball-basics-jump-shot', instructions: ['Take a three-step run-up.', 'Explode upwards from your non-throwing foot.', 'Release the ball at the peak of your jump.'], duration: '20m' },
    { id: 'h2', name: 'Wing Shooting Arc', skill: 'Shooting', instructions: ['Run from a tight angle on the wing.', 'Jump into the circle area.', 'Twist body in mid-air to maximize goal target area.'], duration: '20m' }
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Pole Turning Speed', skill: 'Pole turning', url: 'https://khokhofederation.in/rules-of-kho-kho/', instructions: ['Grip the pole with the inner hand.', 'Lean outward to use centrifugal force.', 'Pivot rapidly while staying low to the ground.'], duration: '15m' },
    { id: 'kh2', name: 'Fake Kho Timing', skill: 'Dodging', instructions: ['Mimic the verbal Kho call without tapping.', 'Divert the runner\'s attention.', 'Immediately give a real Kho to the opposite square.'], duration: '10m' }
  ],
  'Running': [
    { id: 'r1', name: 'Block Start Drill', skill: 'Sprinting', url: 'https://www.worldathletics.org/news/series/starting-block-basics', instructions: ['Adjust blocks to your leg length.', 'On "Set", lift hips and lean forward.', 'Drive hard with the front leg on the whistle.'], duration: '20m' },
    { id: 'r2', name: 'Baton Exchange', skill: 'Relay', instructions: ['Incoming runner gives verbal "Hup" signal.', 'Outgoing runner starts with arm extended back.', 'Non-visual blind hand-off at maximum speed.'], duration: '30m' }
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
  const { isOnline } = usePWA();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [viewHistory, setViewHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  const playersInSport = useMemo(() => 
    store.data.players.filter((p: any) => p.category === 'athlete' && (p.sports?.includes(activeSport) || activeSport === 'Kabaddi')),
  [store.data.players, activeSport]);

  const selectedPlayer = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
  [selectedPlayerId, store.data.players]);

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

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading || !selectedPlayer) return;
    if (!isOnline) {
      toast({ title: "Offline", description: "AI Chat requires internet.", variant: "destructive" });
      return;
    }

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const fit = store.data.fitness[selectedPlayerId] || {};
      const context = `Student: ${selectedPlayer.name}, Std: ${selectedPlayer.std}, Age: ${selectedPlayer.age}. Sport: ${activeSport}. Fitness Score: ${fit.score || 'N/A'}. Drills completed: ${Object.keys(store.data.drillCompletions).filter(k => k.startsWith(selectedPlayerId)).length}`;
      
      const response = await coachChat({
        message: userMsg,
        history: chatHistory,
        playerContext: context,
        language: "English"
      });
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      toast({ title: "Chat Error", description: "Failed to reach AI Coach.", variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  };

  const currentDrills = (DRILLS_DATA[activeSport] || []).filter(d => {
    const isDone = !!store.data.drillCompletions[`${selectedPlayerId}_${d.id}`];
    return viewHistory ? isDone : !isDone;
  });

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

    return {
      genderChart: [
        { name: 'Boys', value: genderCounts.Male },
        { name: 'Girls', value: genderCounts.Female }
      ],
      ageChart: Object.entries(ageCounts).map(([name, count]) => ({ name, count }))
    };
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
              <Badge variant="outline" className="text-primary font-black uppercase text-[10px] tracking-widest bg-white">
                <ShieldCheck className="w-3 h-3 mr-1.5" /> Institutional Training Hub
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-8 text-primary font-black text-[9px] uppercase hover:bg-primary/5">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Global Participation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] rounded-[2.5rem]">
                  <DialogHeader><DialogTitle className="text-2xl font-black text-primary uppercase">Activity Distribution</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analyticsData.genderChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {analyticsData.genderChart.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip /><Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.ageChart}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} fontWeight="bold" /><YAxis fontSize={10} fontWeight="bold" />
                          <Tooltip /><Bar dataKey="count" fill="#0048A0" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setSelectedPlayerId(""); setChatHistory([]); }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black uppercase text-[11px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(DRILLS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedPlayerId} onValueChange={(v) => { setSelectedPlayerId(v); setChatHistory([]); }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black uppercase text-[11px] bg-white"><SelectValue placeholder="Pick Athlete" /></SelectTrigger>
              <SelectContent>{playersInSport.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-24 flex flex-col items-center opacity-30 rounded-[3rem] bg-white/50">
          <User className="w-16 h-16 mb-4 text-primary" />
          <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">Identify an athlete to access training</p>
        </Card>
      ) : (
        <Tabs defaultValue="drills" className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 h-auto rounded-full border shadow-inner inline-flex">
            <TabsTrigger value="drills" className="rounded-full px-8 py-3 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Training Drills</TabsTrigger>
            <TabsTrigger value="assistant" className="rounded-full px-8 py-3 font-black uppercase text-xs tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Coach Assistant AI</TabsTrigger>
          </TabsList>

          <TabsContent value="drills" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={() => setViewHistory(!viewHistory)} className="font-black uppercase text-[10px] tracking-widest">
                {viewHistory ? <History className="mr-2 h-4 w-4" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                {viewHistory ? "View Available" : "View Logged Sessions"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDrills.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20"><CheckCircle className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest">No drills found in this view</p></div>
              ) : (
                currentDrills.map((drill) => (
                  <Card key={drill.id} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/30 transition-all group">
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{drill.name}</h3>
                          <Badge variant="secondary" className="text-[9px] font-black uppercase">{drill.skill}</Badge>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.duration}</span>
                      </div>
                      
                      <div className="bg-muted/30 p-5 rounded-2xl space-y-3 border-2 border-dashed border-muted">
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase"><BookOpen className="w-3 h-3" /> Technical Protocol</div>
                        <ul className="space-y-2">
                          {drill.instructions.map((ins: any, i: number) => (
                            <li key={i} className="text-xs font-bold text-foreground/70 flex gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[9px]">{i + 1}</span>
                              {ins}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => handleToggleComplete(drill.id, drill.name)} 
                        disabled={isProcessing === drill.id} 
                        className={cn(
                          "w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active-scale", 
                          viewHistory ? "bg-accent text-accent-foreground" : "bg-primary text-white"
                        )}
                      >
                        {isProcessing === drill.id ? <Loader2 className="animate-spin" /> : (viewHistory ? "Reset Training Log" : "Log Mastery Session")}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="assistant" className="mt-0">
            <Card className="border-2 border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white flex flex-col h-[600px]">
              <CardHeader className="bg-accent/5 border-b p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Coach Sunil's AI Assistant</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Consulting for: {selectedPlayer?.name}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 font-black uppercase text-[9px] px-3 rounded-full animate-pulse">Live Link Active</Badge>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50/50">
                <ScrollArea className="flex-1 p-8">
                  <div className="space-y-6">
                    {chatHistory.length === 0 && (
                      <div className="py-20 text-center space-y-4 opacity-30">
                        <Sparkles className="w-16 h-16 mx-auto text-primary" />
                        <p className="font-black uppercase text-sm tracking-widest">Ask for specific technical tips for {selectedPlayer?.name}</p>
                      </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md", msg.role === 'user' ? "bg-primary text-white" : "bg-accent text-accent-foreground")}>
                          {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={cn("max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm", msg.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-white border text-foreground rounded-tl-none")}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex items-center gap-2 text-muted-foreground italic text-xs ml-12"><Loader2 className="w-3 h-3 animate-spin" /> Coach Sunil is analyzing...</div>}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-6 bg-white border-t space-y-4">
                  <div className="flex gap-3">
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={`Discuss ${activeSport} technique...`} className="flex-1 h-14 rounded-2xl border-2 px-6 font-bold shadow-inner" />
                    <Button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading || !isOnline} className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground shadow-lg p-0 active-scale"><Send className="w-6 h-6" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Suggest a technical drill",
                      "How is their stamina?",
                      "Compare with team average"
                    ].map((s, i) => (
                      <button key={i} onClick={() => setChatInput(s)} className="text-[10px] font-black uppercase text-primary/50 hover:text-primary bg-primary/5 px-4 py-2 rounded-full border transition-all">{s}</button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
