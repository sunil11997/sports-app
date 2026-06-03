"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Printer, 
  TrendingUp, 
  Trophy, 
  ChartLine, 
  Target, 
  CircleCheck, 
  Ruler, 
  Scale, 
  Activity, 
  Baby,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Info,
  Medal,
  Zap
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
  BarChart as RechartsBarChart,
  Bar,
  Cell
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CHART_COLORS = ['#0048A0', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

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
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.0022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }

    return {
      offset: offset.toFixed(2),
      status: offset < 0 ? 'Pre-growth spurt' : 'Post-growth spurt',
      sittingHeight: sH,
      legLength: legL.toFixed(1),
      isEstimated: !currentPlayer.sittingHeight
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

  const handlePrint = () => {
    if (!currentPlayer) return;
    window.print();
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <BarChart className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Analytics</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry Progress Hub</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-14 text-md font-bold bg-white rounded-2xl border-2 shadow-sm">
              <SelectValue placeholder="Identify Athlete..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-xl">
            <Printer className="w-4 h-4 mr-2" /> Export Performance Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3.5rem] opacity-30 bg-white/50 backdrop-blur-sm">
          <TrendingUp className="w-20 h-20 mx-auto mb-6 text-primary" />
          <p className="font-black uppercase text-lg tracking-widest text-primary">Identify an entry to access institutional metrics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                   <Medal className="w-4 h-4 text-accent" /> Institutional Recommendations
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 {currentFitness?.recommendedSports ? (
                   <div className="space-y-4">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Optimized Training Paths</p>
                      <div className="grid grid-cols-1 gap-3">
                        {currentFitness.recommendedSports.map((sport: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border-2 border-dashed border-accent/20">
                            <span className="text-xs font-black text-primary uppercase">{sport}</span>
                            <Zap className="w-4 h-4 text-accent animate-pulse" />
                          </div>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="py-10 text-center opacity-20">
                      <Target className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-[9px] font-black uppercase">Awaiting Fitness Evaluation</p>
                   </div>
                 )}
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-6">
                 <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-accent" /> Growth Spurt Analytics
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {phvData && (
                  <div className={cn(
                    "p-6 rounded-[2rem] border-2 shadow-inner text-center space-y-2",
                    parseFloat(phvData.offset) < 0 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
                  )}>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">PHV Maturity Offset</p>
                    <p className={cn(
                      "text-4xl font-black tracking-tighter",
                      parseFloat(phvData.offset) < 0 ? "text-emerald-700" : "text-orange-700"
                    )}>
                      {phvData.offset} <span className="text-sm">Yrs</span>
                    </p>
                    <Badge className={cn(
                      "font-black uppercase text-[8px] px-3",
                      parseFloat(phvData.offset) < 0 ? "bg-emerald-600" : "bg-orange-600"
                    )}>
                      {phvData.status}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl">
                   <Info className="w-3.5 h-3.5 text-muted-foreground" />
                   <p className="text-[9px] font-medium text-muted-foreground leading-tight italic">
                     Archived month-wise to track biological development.
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-3">
                  <ChartLine className="w-5 h-5 text-accent" /> Monthly Performance History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {chartData.length < 1 ? (
                   <div className="h-[350px] flex flex-col items-center justify-center opacity-20 border-4 border-dashed rounded-[2rem]">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase text-sm tracking-widest">Awaiting First Archive Entry</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl flex flex-col">
                  <CardHeader className="bg-primary p-8 text-white">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                      <Zap className="w-5 h-5 text-accent" /> Score Registry Log
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
                      </div>
                    </ScrollArea>
                  </CardContent>
               </Card>

               <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
                  <CardHeader className="bg-emerald-50 border-b p-8">
                    <CardTitle className="text-xs font-black uppercase text-emerald-700 tracking-widest flex items-center gap-3">
                      <CircleCheck className="w-5 h-5" /> Attendance Consistency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                           <circle 
                              cx="80" cy="80" r="70" 
                              stroke="#10b981" 
                              strokeWidth="12" 
                              fill="transparent" 
                              strokeDasharray="440" 
                              strokeDashoffset={440 - (440 * (chartData.length > 0 ? 0.94 : 0))} 
                              strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black text-primary">94%</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
