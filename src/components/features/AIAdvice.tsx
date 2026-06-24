"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  BrainCircuit, 
  Printer, 
  Zap, 
  Send,
  ShieldCheck,
  ClipboardCopy,
  ExternalLink
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
  const [aiEngine, setAiEngine] = useState<'Genkit' | 'Gemini Pro'>('Genkit');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<PlayerRecommendationOutput | null>(null);
  
  const [activeTab, setActiveTab] = useState("report");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAdvice(null);
    setChatHistory([]);
  }, [selectedPlayerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

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
      const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
      const context = p ? `Player: ${p.name}, Std: ${p.std}, Age: ${p.age}.` : "General inquiry.";
      const profile = store.data.schoolProfile;
      const tContext = `Teacher: ${profile.teacherName}, School: ${profile.schoolName}, Role: ${profile.role}`;
      
      const response = await coachChat({
        message: userMsg,
        history: chatHistory,
        playerContext: context,
        teacherContext: tContext,
        language: language,
        engine: aiEngine
      });
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      toast({ title: "Chat Error", description: "Failed to connect to AI engine.", variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  };

  const getAdvice = async () => {
    if (!isOnline) {
      toast({ title: "Offline Mode", description: "Internet required for analysis.", variant: "destructive" });
      return;
    }

    if (!selectedPlayerId) {
      toast({ title: "Select student", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
      const fit = store.data.fitness[selectedPlayerId] || {};
      
      const input = {
        id: p.id, name: p.name, gender: p.gender, std: p.std, age: p.age.toString(), height: p.height, weight: p.weight, bmi: p.bmi,
        sports: p.sports || [], history: p.history, medical: p.medical || "None", language: language, engine: (aiEngine === 'Gemini Pro' ? 'Gemini' : 'Genkit') as any,
        fitnessScore: fit.score || "N/A", fitnessStatus: fit.status || "N/A"
      };

      const result = await playerRecommendation(input);
      setAdvice(result);
    } catch (error) {
      toast({ title: "AI Error", description: "Registry sync failure or quota reached.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyForExternalAI = () => {
    if (!selectedPlayerId) return;
    const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
    const fit = store.data.fitness[selectedPlayerId] || {};
    const skills = store.data.sportSkills[`${selectedPlayerId}_Kabaddi`] || {};

    const contextString = `
Athlete Profile Analysis - Ashram Shala Waghamba
------------------------------------------------
Name: ${p.name} (Std ${p.std})
Gender: ${p.gender} | Age: ${p.age}
Height: ${p.height}cm | Weight: ${p.weight}kg | BMI: ${p.bmi}
Primary Sports: ${(p.sports || []).join(', ')}
Institutional Fitness Score: ${fit.score || 'N/A'}%
Category: ${fit.status || 'Pending Assessment'}

Technical Mastery Data:
Kabaddi Skill Rating: ${skills.score || '0'}%
Medical Notes: ${p.medical || 'None recorded'}

PROMPT: Please act as an elite sports scientist and head coach. Based on the data above, provide a specialized 30-day training periodization and nutritional blueprint optimized for a rural student-athlete at Ashram Shala Waghamba. Focus on explosive power and injury prevention.
    `.trim();

    navigator.clipboard.writeText(contextString);
    toast({
      title: "AI Prompt Copied",
      description: "Paste this into Gemini, ChatGPT, or DeepSeek for deep analysis.",
      className: "bg-emerald-600 text-white font-black"
    });
  };

  const handlePrint = () => {
    if (!advice) return;
    const player = store.data.players.find((p: any) => p.id === selectedPlayerId);
    
    const printContent = `
      <html>
        <head>
          <title>AI Performance Advice - ${player?.name}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
            .inst-header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
            .school-name { font-size: 18px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            h1 { color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; font-size: 20px; border-bottom: 4px solid #f59e0b; padding-bottom: 5px; }
            h2 { color: #1e3a8a; margin-top: 30px; border-left: 5px solid #f59e0b; padding-left: 15px; text-transform: uppercase; font-size: 14px; }
            section { margin-bottom: 30px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="inst-header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</div>
          </div>
          <h1>Performance Strategy: ${player?.name}</h1>
          <section><h2>Executive Summary</h2><p>${advice.summary}</p></section>
          <section><h2>Training Blueprint</h2><div style="white-space: pre-wrap;">${advice.trainingPlan}</div></section>
          <section><h2>Dietary Plan</h2><div style="white-space: pre-wrap;">${advice.dietPlan}</div></section>
          <section><h2>Health Protocol</h2><div style="white-space: pre-wrap;">${advice.healthAdvice}</div></section>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-accent" /> AI Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">Personalized performance analysis with Google Gemini Flash.</p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-xs font-bold bg-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Marathi">Marathi</SelectItem></SelectContent>
              </Select>
              <Select onValueChange={(v: any) => setAiEngine(v)} value={aiEngine}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-xs font-bold bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genkit">Standard</SelectItem>
                  <SelectItem value="Gemini Pro">High Perf 💎</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
              <SelectTrigger className="rounded-2xl border-2 h-12 font-bold bg-white"><SelectValue placeholder="Pick student..." /></SelectTrigger>
              <SelectContent>{store.data.players.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40 p-2 h-auto gap-4 rounded-3xl border">
          <TabsTrigger value="report" className="rounded-2xl py-3 px-8 font-black uppercase text-xs">Tactical Report</TabsTrigger>
          <TabsTrigger value="chat" className="rounded-2xl py-3 px-8 font-black uppercase text-xs">Coach Chat</TabsTrigger>
          <TabsTrigger value="external" className="rounded-2xl py-3 px-8 font-black uppercase text-xs flex items-center gap-2">
            <ExternalLink className="w-3 h-3" /> External AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-0">
          {!advice && (
            <div className="p-20 text-center border-4 border-dashed rounded-[3rem] bg-white/50 space-y-6">
              <Button disabled={loading || !selectedPlayerId || !isOnline} onClick={getAdvice} className="rounded-2xl h-16 px-12 font-black text-lg bg-primary text-white shadow-xl uppercase tracking-widest">
                {loading ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3" />}
                Run AI Analysis
              </Button>
            </div>
          )}

          {advice && (
            <Card className="border-4 border-accent shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-accent/10 border-b-2 flex flex-row justify-between items-center">
                <CardTitle className="text-xl font-black text-primary">REPORT PREVIEW</CardTitle>
                <Button variant="outline" onClick={handlePrint} className="rounded-xl font-bold border-accent"><Printer className="mr-2 h-4 w-4" /> Print PDF</Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Generated by Institutional AI Intelligence</p>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-muted italic font-medium leading-relaxed">
                     &quot;{advice.summary}&quot;
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase text-primary tracking-widest">Training Strategy</h4>
                        <p className="text-xs font-medium text-foreground/70 leading-relaxed whitespace-pre-wrap">{advice.trainingPlan}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase text-primary tracking-widest">Performance Notes</h4>
                        <p className="text-xs font-medium text-foreground/70 leading-relaxed whitespace-pre-wrap">{advice.performanceSuggestions}</p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card className="border-2 rounded-[3rem] overflow-hidden bg-white h-[600px] flex flex-col">
            <CardHeader className="bg-accent/5 border-b p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-black text-primary uppercase">&quot;Coach Sunil&apos;s AI&quot;</CardTitle>
              {aiEngine === 'Gemini Pro' && <Badge className="bg-accent text-white font-black text-[9px] px-3">PRO ENGINE ACTIVE</Badge>}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-8">
                <div className="space-y-6">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("p-4 rounded-3xl text-sm font-medium shadow-sm max-w-[80%]", msg.role === 'user' ? "bg-primary text-white" : "bg-white border")}>{msg.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-4">
                      <div className="p-4 rounded-3xl bg-muted animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /></div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
              <div className="p-8 bg-white border-t flex gap-4">
                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder="Discuss tactics with AI Coach..." className="flex-1 h-14 rounded-2xl border-2 px-6" />
                <Button onClick={handleSendChat} disabled={chatLoading || !isOnline} className="w-14 h-14 rounded-2xl bg-accent text-white shadow-lg"><Send className="w-6 h-6" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external" className="mt-0">
           <Card className="border-2 border-dashed rounded-[3rem] p-12 text-center bg-white shadow-xl space-y-8">
              <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto">
                 <ClipboardCopy className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-primary uppercase">AI Connect Engine</h3>
                 <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                    Export student&apos;s biometrics and fitness data to external high-intelligence platforms like Gemini or ChatGPT.
                 </p>
              </div>
              <div className="pt-4">
                 <Button 
                   disabled={!selectedPlayerId} 
                   onClick={copyForExternalAI}
                   className="rounded-3xl h-20 px-12 bg-primary text-white font-black uppercase tracking-widest shadow-2xl active-scale"
                 >
                    <ClipboardCopy className="w-6 h-6 mr-3" /> Prepare AI Context Block
                 </Button>
                 <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase opacity-40">Ready for Gemini &bull; ChatGPT &bull; DeepSeek</p>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}