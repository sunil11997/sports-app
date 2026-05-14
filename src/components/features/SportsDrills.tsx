
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Sparkles,
  ClipboardList,
  Medal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { coachChat } from '@/ai/flows/coach-chat';
import { usePWA } from '@/components/providers/pwa-provider';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const SPORTS_DATA: Record<string, { skills: string[], dailyPlan?: string[], lessonPlan?: string[] }> = {
  'Kabaddi': {
    skills: [
      "Cant (Continuous Chanting)", "Toe Touch", "Hand Touch", "Running Hand Touch", 
      "Side Kick", "Mule Kick", "Back Kick", "Dubki", "Escape Skills", "Bonus Line Skill",
      "Ankle Hold", "Thigh Hold", "Waist Hold", "Block", "Dash", "Chain Formation", 
      "Corner Play", "Cover Positioning"
    ],
    dailyPlan: ["10 min warm-up", "Raid practice", "Defense drills", "Mini match", "Cool down"],
    lessonPlan: ["Introduction to Kabaddi", "Warm-up activities", "Skill demonstration", "Practice session", "Mini game", "Cool down"]
  },
  'Volleyball': {
    skills: ["Serving", "Passing", "Setting", "Spiking", "Blocking"],
    dailyPlan: ["Wall set practice", "Service consistency", "Digging drills", "Spike approach", "Team rotation"]
  },
  'Kho Kho': {
    skills: ["Pole Dive", "Giving Kho", "Zig-Zag Running", "Dodging", "Pole Turning", "Fake Kho"],
    dailyPlan: ["Agility circuit", "Kho timing drills", "Pole turning speed", "Sudden turn practice"]
  },
  'Handball': {
    skills: ["Dribbling", "Passing", "Shooting", "Goalkeeping", "Jump Shot", "Piston Movement"],
    dailyPlan: ["Shooting accuracy", "Fast break transitions", "Goalkeeper reflexes", "Defensive wall setup"]
  },
  'Running': {
    skills: ["Block Start", "Baton Exchange", "Pacing", "Stamina"],
    dailyPlan: ["Warm-up jogging", "Interval sprints", "Reaction time drills", "Form correction"]
  }
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
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

  const handleToggleComplete = async (skill: string) => {
    if (!selectedPlayerId) {
      toast({ title: "Select Athlete", description: "Pick an athlete to log the training session.", variant: "destructive" });
      return;
    }
    const skillKey = `${activeSport}_${skill}`;
    setIsProcessing(skillKey);
    store.setDrillCompletion(skillKey, selectedPlayerId, true);
    toast({ 
      title: "Drill Archived", 
      description: `${skill} training record updated for ${selectedPlayer?.name}.` 
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
      const context = `Student: ${selectedPlayer.name}, Std: ${selectedPlayer.std}, Age: ${selectedPlayer.age}. Sport: ${activeSport}. Drills completed count: ${Object.keys(store.data.drillCompletions).filter(k => k.startsWith(selectedPlayerId)).length}`;
      
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

  const currentSkills = (SPORTS_DATA[activeSport]?.skills || []).filter(skill => {
    const skillKey = `${activeSport}_${skill}`;
    return !store.data.drillCompletions[`${selectedPlayerId}_${skillKey}`];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <PlayCircle className="w-10 h-10 text-cyan-600" /> PE Drills & Practice
            </h2>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-primary font-black uppercase text-[10px] tracking-widest bg-white">
                <ShieldCheck className="w-3 h-3 mr-1.5" /> Institutional Coaching Hub
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <Select value={activeSport} onValueChange={(val) => { setActiveSport(val); setSelectedPlayerId(""); setChatHistory([]); }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(SPORTS_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedPlayerId} onValueChange={(v) => { setSelectedPlayerId(v); setChatHistory([]); }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black uppercase text-[11px] bg-white shadow-sm"><SelectValue placeholder="Identify Athlete" /></SelectTrigger>
              <SelectContent>{playersInSport.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-24 flex flex-col items-center opacity-30 rounded-[3rem] bg-white/50">
          <User className="w-16 h-16 mb-4 text-primary" />
          <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">Identify an athlete to access practice deck</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="checklist" className="space-y-6">
              <TabsList className="bg-muted/50 p-1.5 h-auto rounded-full border shadow-inner inline-flex">
                <TabsTrigger value="checklist" className="rounded-full px-8 py-3 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Skills & Drills</TabsTrigger>
                <TabsTrigger value="plans" className="rounded-full px-8 py-3 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Practice Plans</TabsTrigger>
                <TabsTrigger value="assistant" className="rounded-full px-8 py-3 font-black uppercase text-xs tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Coach AI</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="mt-0">
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b p-8">
                    <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                      <ClipboardList className="w-7 h-7 text-accent" /> {activeSport} Mastery Checklist
                    </CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Check to remove mastered drills from registry</p>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    {currentSkills.length === 0 ? (
                      <div className="py-20 text-center space-y-4 opacity-20">
                        <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
                        <p className="font-black uppercase tracking-widest text-lg">All Technical Drills Logged</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentSkills.map((skill) => (
                          <div 
                            key={skill} 
                            className="flex items-center justify-between bg-muted/20 p-5 rounded-[1.5rem] border-2 border-transparent hover:border-primary/10 transition-all group"
                          >
                            <span className="font-black uppercase text-xs text-primary group-hover:text-accent transition-colors">{skill}</span>
                            <Checkbox 
                              disabled={isProcessing === `${activeSport}_${skill}`}
                              onCheckedChange={() => handleToggleComplete(skill)} 
                              className="w-6 h-6 rounded-lg border-2 border-primary/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plans" className="mt-0 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SPORTS_DATA[activeSport]?.dailyPlan && (
                    <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
                      <CardHeader className="bg-accent/5 border-b p-6">
                        <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" /> Daily Practice Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ul className="space-y-3">
                          {SPORTS_DATA[activeSport].dailyPlan?.map((item, i) => (
                            <li key={i} className="flex items-start gap-4 p-3 bg-muted/20 rounded-xl">
                              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</span>
                              <span className="text-sm font-bold text-foreground/80 pt-0.5">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {activeSport === "Kabaddi" && SPORTS_DATA[activeSport]?.lessonPlan && (
                    <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-primary/20">
                      <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> PE Instructor Lesson Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ul className="space-y-3">
                          {SPORTS_DATA[activeSport].lessonPlan?.map((item, i) => (
                            <li key={i} className="flex items-start gap-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                              <span className="text-sm font-bold text-primary/80">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
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
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-8">
                      <div className="space-y-6">
                        {chatHistory.length === 0 && (
                          <div className="py-20 text-center space-y-4 opacity-30">
                            <Sparkles className="w-16 h-16 mx-auto text-primary" />
                            <p className="font-black uppercase text-sm tracking-widest text-primary">Discuss specific technical drills for {selectedPlayer?.name}</p>
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
                        {chatLoading && <div className="flex items-center gap-2 text-muted-foreground italic text-xs ml-12"><Loader2 className="w-3 h-3 animate-spin" /> Coach is analyzing...</div>}
                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-6 bg-white border-t space-y-4">
                      <div className="flex gap-3">
                        <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={`Discuss ${activeSport} technique...`} className="flex-1 h-14 rounded-2xl border-2 px-6 font-bold shadow-inner" />
                        <Button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading || !isOnline} className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground shadow-lg p-0 active-scale"><Send className="w-6 h-6" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden text-center p-10 group">
              <div className="w-32 h-32 mx-auto rounded-[2rem] border-4 border-primary/10 overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500">
                <img src={selectedPlayer?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPlayer?.name}`} alt="Student" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-black text-primary uppercase leading-tight">{selectedPlayer?.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Std {selectedPlayer?.std} • {activeSport} Athlete</p>
              <div className="mt-8 pt-8 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Registry Status</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border-emerald-200">Active Training</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Drills Mastered</span>
                  <span className="text-xl font-black text-primary">
                    {Object.keys(store.data.drillCompletions).filter(k => k.startsWith(selectedPlayerId)).length}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-2 rounded-[2.5rem] bg-primary text-white p-8 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                   <Medal className="w-6 h-6 text-accent" /> Institutional Rank
                 </h4>
                 <p className="text-xs font-medium text-white/70 leading-relaxed">
                   Participate in daily drills to improve technical scores and qualify for district tournaments.
                 </p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
