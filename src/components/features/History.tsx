"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Printer, 
  TrendingUp, 
  ChartLine, 
  Target, 
  Ruler, 
  Activity, 
  BrainCircuit, 
  Medal, 
  Zap, 
  InfoIcon, 
  Timer, 
  MoveUpRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Legend,
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function PerformanceDossier({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';

  const availablePlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = Number(a.std) || 0;
        const stdB = Number(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral]);

  const currentPlayer = useMemo(() => 
    (store.data.players || []).find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const currentFitness = useMemo(() => 
    store.data.fitness[selectedPlayerId] || null,
    [selectedPlayerId, store.data.fitness]
  );

  const phvData = useMemo(() => {
    if (!currentPlayer?.height || !currentPlayer?.weight || !currentPlayer?.age) return null;
    
    const h = parseFloat(currentPlayer.height);
    const w = parseFloat(currentPlayer.weight);
    const age = currentPlayer.age;
    
    const sH = parseFloat(currentPlayer.sittingHeight || (h * 0.52).toFixed(1));
    const legL = h - sH;

    let offset = 0;
    if (currentPlayer.gender === 'Male') {
      offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
    } else {
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }

    const offsetNum = parseFloat(offset.toFixed(2));
    
    let coachingAdvice = "";
    if (offsetNum < -1.0) {
      coachingAdvice = "Pre-Growth Spurt: Focus on skill coordination and foundational motor learning.";
    } else if (offsetNum >= -1.0 && offsetNum <= 1.0) {
      coachingAdvice = "Circa-PHV (Active Spurt): High injury risk. Focus on core stability and flexibility.";
    } else {
      coachingAdvice = "Post-Growth Spurt: Peak window for power and speed development.";
    }

    return {
      offset: offset.toFixed(2),
      offsetNum,
      status: offsetNum < 0 ? 'Pre-growth spurt' : 'Post-growth spurt',
      sittingHeight: sH,
      legLength: legL.toFixed(1),
      coachingAdvice,
      biologicalAge: (age + offsetNum).toFixed(1)
    };
  }, [currentPlayer]);

  const playerFitnessHistory = useMemo(() => 
    (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date || 0).getTime() - new Date(b.updatedAt || b.date || 0).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const chartData = useMemo(() => {
    return playerFitnessHistory.map((f: any) => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      agility: parseFloat(f.agilityScore) || 0,
      stamina: parseFloat(f.enduranceScore) || 0,
    }));
  }, [playerFitnessHistory]);

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <BarChart className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Performance Dossier</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry Progress Hub v4.2.1</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-14 text-md font-bold bg-white rounded-2xl border-2 shadow-sm">
              <SelectValue placeholder="Identify Student..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={() => window.print()} className="bg-primary text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-xl">
            <Printer className="w-4 h-4 mr-2" /> Export Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3.5rem] opacity-30 bg-white/50 backdrop-blur-sm">
          <TrendingUp className="w-20 h-20 mx-auto mb-6 text-primary" />
          <p className="font-black uppercase text-lg tracking-widest text-primary">Identify an entry to access metrics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardContent className="p-8 space-y-8 text-center">
                <Avatar className="w-40 h-40 border-4 border-primary/10 shadow-2xl mx-auto">
                  <AvatarImage src={currentPlayer?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-5xl uppercase">{currentPlayer?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h3 className="font-black uppercase text-3xl text-primary leading-tight tracking-tight">{currentPlayer?.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase">Std {currentPlayer?.std} Registry</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-6">
                 <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-accent" /> PHV Maturity
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {phvData && (
                  <>
                    <div className={cn(
                      "p-8 rounded-[2.5rem] border-2 shadow-inner text-center space-y-3",
                      phvData.offsetNum < 0 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
                    )}>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maturity Offset</p>
                      <p className={cn("text-5xl font-black tracking-tighter", phvData.offsetNum < 0 ? "text-emerald-700" : "text-orange-700")}>
                        {phvData.offset} <span className="text-sm">Yrs</span>
                      </p>
                      <Badge className={cn("font-black uppercase text-[10px] px-6 py-1 rounded-full", phvData.offsetNum < 0 ? "bg-emerald-600 text-white" : "bg-orange-600 text-white")}>
                        {phvData.status}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-primary uppercase flex items-center gap-2">
                         <BrainCircuit className="w-4 h-4 text-accent" /> Focus Advice
                       </h4>
                       <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10">
                          <p className="text-xs font-bold text-foreground/70 leading-relaxed italic">&quot;{phvData.coachingAdvice}&quot;</p>
                       </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-3">
                  <ChartLine className="w-5 h-5 text-accent" /> Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {chartData.length < 1 ? (
                   <div className="h-[400px] flex flex-col items-center justify-center opacity-20 border-4 border-dashed rounded-[2rem]">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase text-sm tracking-widest">Awaiting Archive Entry</p>
                   </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={5} fill="#0048A0" fillOpacity={0.08} name="Aggregate Score" />
                        <Line type="monotone" dataKey="stamina" stroke="#f59e0b" strokeWidth={3} name="Endurance" />
                        <Line type="monotone" dataKey="agility" stroke="#10b981" strokeWidth={3} name="Agility" />
                        <Legend verticalAlign="top" iconType="circle" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl flex flex-col">
              <CardHeader className="bg-primary p-8 text-white">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent" /> Registry Archive
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {playerFitnessHistory.slice().reverse().map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase">{format(new Date(f.updatedAt || f.date || new Date()), 'MMMM yyyy')}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{f.status} Rank</span>
                         </div>
                         <div className="text-right">
                            <span className="text-xl font-black text-primary">{f.score}%</span>
                         </div>
                      </div>
                    ))}
                    {playerFitnessHistory.length === 0 && (
                      <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/40">No records found</p>
                    )}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}