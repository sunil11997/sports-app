"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Loader2, 
  BrainCircuit, 
  HeartPulse, 
  Dumbbell, 
  Zap, 
  Printer, 
  Languages, 
  WifiOff,
  MessageSquare,
  Send,
  User,
  Bot,
  Apple
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRecommendation, type PlayerRecommendationOutput } from '@/ai/flows/player-recommendation';
import { coachChat } from '@/ai/flows/coach-chat';
import { usePWA } from '@/components/providers/pwa-provider';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export function AIAdvice({ store }: { store: any }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<PlayerRecommendationOutput | null>(null);
  
  // Chat States
  const [activeTab, setActiveTab] = useState("report");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  const getPlayerContext = () => {
    if (!selectedPlayerId) return "";
    const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
    const fit = store.data.fitness[selectedPlayerId] || {};
    const primarySport = p.sports?.[0] || "None";
    const skill = store.data.sportSkills[`${selectedPlayerId}_${primarySport}`] || {};
    
    return `Player: ${p.name}, Std: ${p.std}, Age: ${p.age}, Sports: ${p.sports?.join(', ')}. 
    Fitness Score: ${fit.score}%, Level: ${fit.status}. 
    Primary Sport Skills: ${Object.entries(skill.detailedSkills || {}).map(([k, v]) => `${k}: ${v}/10`).join(', ')}`;
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    if (!isOnline) {
      toast({ title: "Offline", description: "Internet required for AI Chat.", variant: "destructive" });
      return;
    }

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await coachChat({
        message: userMsg,
        history: chatHistory,
        playerContext: getPlayerContext(),
        language: language
      });
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      toast({ title: "Chat Error", description: "Could not get AI response.", variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  };

  const getAdvice = async () => {
    if (!isOnline) {
      toast({ 
        title: "Offline Mode", 
        description: "Internet connection is required for AI analysis.", 
        variant: "destructive" 
      });
      return;
    }

    if (!selectedPlayerId) {
      toast({ title: "Select a player", description: "Please pick a player to analyze.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
      const fit = store.data.fitness[selectedPlayerId] || {};
      const primarySport = p.sports?.[0] || "";
      const skill = store.data.sportSkills[`${selectedPlayerId}_${primarySport}`] || {};
      
      const incidents = store.data.healthIncidents
        .filter((inc: any) => inc.playerId === selectedPlayerId)
        .map((inc: any) => `${inc.date}: ${inc.description}`)
        .join("; ");

      const input = {
        id: p.id,
        name: p.name,
        gender: p.gender,
        std: p.std,
        age: p.age.toString(),
        height: p.height,
        weight: p.weight,
        bmi: p.bmi,
        sports: p.sports || [],
        history: p.history,
        histDetail: p.histDetail || "None",
        medical: p.medical || "None",
        language: language,
        fitnessShuttleRun: fit.shuttleRun || "N/A",
        fitnessRun50m: fit.run50m || "N/A",
        fitnessRun600m: fit.run600m || "N/A",
        fitnessSitAndReach: fit.sitAndReach || "N/A",
        fitnessBoardJump: fit.boardJump || "N/A",
        fitnessSitUps: fit.sitUps || "N/A",
        fitnessScore: fit.score || "N/A",
        fitnessStatus: fit.status || "N/A",
        sportSkill1: skill.skill1 || "N/A",
        sportSkill2: skill.skill2 || "N/A",
        sportSkillScore: skill.score || "N/A",
        detailedKabaddiSkills: primarySport === 'Kabaddi' ? skill.detailedSkills : undefined,
        detailedVolleyballSkills: primarySport === 'Volleyball' ? skill.detailedSkills : undefined,
        detailedHandballSkills: primarySport === 'Handball' ? skill.detailedSkills : undefined,
        detailedKhoKhoSkills: primarySport === 'Kho Kho' ? skill.detailedSkills : undefined,
        detailedRunningSkills: primarySport === 'Running' ? skill.detailedSkills : undefined,
        detailedShotPutSkills: primarySport === 'Shot Put' ? skill.detailedSkills : undefined,
        detailedJavlineSkills: primarySport === 'Javline' ? skill.detailedSkills : undefined,
        detailedLongJumpSkills: primarySport === 'Long Jump' ? skill.detailedSkills : undefined,
        detailedHighJumpSkills: primarySport === 'High Jump' ? skill.detailedSkills : undefined,
        pastHealthIncidents: incidents || "No incidents recorded"
      };

      const result = await playerRecommendation(input);
      setAdvice(result);
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Could not generate advice at this time.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!advice) return;
    const player = store.data.players.find((p: any) => p.id === selectedPlayerId);
    
    const printContent = `
      <html>
        <head>
          <title>AI Performance Advice - ${player?.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; margin-bottom: 20px; }
            h2 { color: #1b4b3a; margin-top: 30px; border-left: 5px solid #8AF075; padding-left: 15px; }
            .summary { background: #f4fcf6; padding: 20px; border-radius: 10px; font-style: italic; font-weight: 500; }
            section { margin-bottom: 40px; }
            .player-info { background: #eee; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Performance Strategy: ${player?.name}</h1>
          <div class="player-info">
            Std: ${player?.std} | Age: ${player?.age} | Sports: ${player?.sports?.join(', ')}
          </div>
          
          <section>
            <h2>Executive Summary</h2>
            <div class="summary">${advice.summary}</div>
          </section>

          <section>
            <h2>Training Blueprint</h2>
            <div style="white-space: pre-wrap;">${advice.trainingPlan}</div>
          </section>

          <section>
            <h2>Dietary & Nutrition Plan</h2>
            <div style="white-space: pre-wrap;">${advice.dietPlan}</div>
          </section>

          <section>
            <h2>Performance Boosters</h2>
            <div style="white-space: pre-wrap;">${advice.performanceSuggestions}</div>
          </section>

          <section>
            <h2>Health & Recovery Protocol</h2>
            <div style="white-space: pre-wrap;">${advice.healthAdvice}</div>
          </section>

          <footer style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #888;">
            AI generated report from Waghamba Sports Hub.
          </footer>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {!isOnline && (
        <div className="bg-destructive/10 border-2 border-destructive text-destructive p-4 rounded-2xl flex items-center gap-3 font-bold">
          <WifiOff className="w-6 h-6" />
          Offline Mode: AI Hub functions (Report & Chat) require an active internet connection.
        </div>
      )}

      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-accent" /> AI Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Get personalized AI analysis and chat with your institutional sports assistant.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                <Languages className="w-3 h-3" /> Select Language
              </label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-md font-bold bg-white">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">Context: Select Student</label>
              <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-md font-bold bg-white">
                  <SelectValue placeholder="Pick a student" />
                </SelectTrigger>
                <SelectContent>
                  {store.data.players.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40 p-2 h-auto gap-4 rounded-3xl border">
          <TabsTrigger value="report" className="rounded-2xl py-3 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" /> Comprehensive Report
          </TabsTrigger>
          <TabsTrigger value="chat" className="rounded-2xl py-3 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" /> Live Coach Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-0 space-y-6">
          {!advice && (
            <div className="p-20 text-center border-4 border-dashed rounded-[3rem] bg-white/50 space-y-6">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                <BrainCircuit className="w-10 h-10 text-primary opacity-20" />
              </div>
              <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest opacity-40">Select a student and generate performance advice</p>
              <Button 
                disabled={loading || !selectedPlayerId || !isOnline} 
                onClick={getAdvice}
                className="rounded-2xl h-16 px-12 font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-xl uppercase tracking-widest transition-all active-scale"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Zap className="w-6 h-6 mr-3" />}
                Run AI Analysis
              </Button>
            </div>
          )}

          {advice && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="md:col-span-2 border-4 border-accent shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-accent/10 border-b-2 border-accent/20 flex flex-row justify-between items-center">
                  <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-accent" /> EXECUTIVE SUMMARY
                  </CardTitle>
                  <Button variant="outline" onClick={handlePrint} className="rounded-xl font-bold border-accent text-primary h-10">
                    <Printer className="w-4 h-4 mr-2" /> Print Full Report
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-xl font-medium leading-relaxed text-foreground/90 italic">
                    "{advice.summary}"
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg font-black text-primary uppercase flex items-center gap-2">
                    <Apple className="w-5 h-5 text-emerald-600" /> Dietary Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-emerald prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {advice.dietPlan}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg font-black text-primary uppercase flex items-center gap-2">
                    <Dumbbell className="w-5 h-5" /> Training Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-green prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {advice.trainingPlan}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg font-black text-primary uppercase flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" /> Performance Boosters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-green prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {advice.performanceSuggestions}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1 border-2 border-destructive/20 shadow-xl rounded-[2rem] bg-destructive/[0.02]">
                <CardHeader className="bg-destructive/5">
                  <CardTitle className="text-lg font-black text-destructive uppercase flex items-center gap-2">
                    <HeartPulse className="w-5 h-5" /> Health Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-red prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {advice.healthAdvice}
                  </div>
                </CardContent>
              </Card>
              
              <div className="md:col-span-2 flex justify-center pt-8">
                <Button variant="ghost" onClick={() => setActiveTab("chat")} className="font-black text-primary uppercase tracking-widest text-xs h-12 rounded-full border-2 border-primary/10 px-8">
                  Ask AI specific questions about this student <MessageSquare className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card className="border-2 border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white flex flex-col h-[650px]">
            <CardHeader className="bg-accent/5 border-b p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Coach Assistant Chat</CardTitle>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Institutional AI Support
                  </div>
                </div>
              </div>
              {selectedPlayerId && (
                <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full">
                  Topic: {store.data.players.find((p: any) => p.id === selectedPlayerId)?.name}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col bg-slate-50/50">
              <ScrollArea className="flex-1 p-8">
                <div className="space-y-6">
                  {chatHistory.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-30">
                      <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="font-black uppercase text-sm tracking-widest">Ask me anything about training or health</p>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={cn(
                      "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                        msg.role === 'user' ? "bg-primary text-white" : "bg-accent text-accent-foreground"
                      )}>
                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={cn(
                        "max-w-[75%] p-5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-white border border-primary/5 text-foreground rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-5 h-5 text-accent-foreground animate-spin" />
                      </div>
                      <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-primary/5 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-8 bg-white border-t space-y-4">
                <div className="flex gap-4">
                  <Input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder={language === 'Marathi' ? "कोचला प्रश्न विचारा..." : "Ask the coach a question..."}
                    className="flex-1 h-14 rounded-2xl border-2 px-6 font-bold shadow-inner focus-visible:ring-accent"
                  />
                  <Button 
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatLoading || !isOnline}
                    className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg p-0 active-scale"
                  >
                    <Send className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    language === 'Marathi' ? "तंदुरुस्ती कशी सुधारावी?" : "How to improve stamina?",
                    language === 'Marathi' ? "दुखापत टाळण्यासाठी टिप्स" : "Injury prevention tips",
                    language === 'Marathi' ? "डाइट प्लान सुचवा" : "Suggest a diet plan"
                  ].map((suggestion, i) => (
                    <button 
                      key={i} 
                      onClick={() => setChatInput(suggestion)}
                      className="text-[10px] font-black uppercase text-primary/50 hover:text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/5 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
