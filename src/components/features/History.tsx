
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Printer, 
  Stethoscope,
  TrendingUp,
  Trophy,
  ChartLine,
  Zap,
  Target,
  AlertCircle,
  CircleCheck,
  History as HistoryIcon,
  Timer,
  Dumbbell,
  Ruler,
  Scale,
  Activity,
  Baby
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

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';

  const availablePlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = Number(a.std) || 0;
        const stdB = Number(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral]);

  const player = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  // Mirwald PHV Calculation Logic
  const phvData = useMemo(() => {
    if (!player?.height || !player?.weight || !player?.age) return null;
    
    const h = parseFloat(player.height);
    const sH = parseFloat(player.sittingHeight || (h * 0.52).toFixed(1)); // Estimation if missing
    const w = parseFloat(player.weight);
    const age = player.age;
    const legL = h - sH;

    let offset = 0;
    if (player.gender === 'Male') {
      offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
    } else {
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.0022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }

    return {
      offset: offset.toFixed(2),
      status: offset < 0 ? 'Pre-growth spurt' : 'Post-growth spurt',
      isPeak: Math.abs(offset) < 0.5,
      sittingHeight: sH,
      legLength: legL.toFixed(1)
    };
  }, [player]);

  const playerIncidents = useMemo(() => 
    store.data.healthIncidents.filter((inc: any) => inc.playerId === selectedPlayerId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [selectedPlayerId, store.data.healthIncidents]
  );

  const playerFitness = useMemo(() => 
    (store.data.fitnessHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date || 0).getTime() - new Date(b.updatedAt || b.date || 0).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const skillMasteryData = useMemo(() => {
    if (!selectedPlayerId) return [];
    const sports = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball'];
    return sports.map(sport => {
      const skill = store.data.sportSkills[`${selectedPlayerId}_${sport}`];
      return {
        name: sport,
        score: parseFloat(skill?.score) || 0
      };
    }).filter(s => s.score > 0);
  }, [selectedPlayerId, store.data.sportSkills]);

  const playerAttendance = useMemo(() => {
    if (!selectedPlayerId) return { present: 0, total: 0 };
    let present = 0;
    const entries = Object.keys(store.data.attendance).filter(k => k.startsWith(selectedPlayerId));
    entries.forEach(k => {
      if (store.data.attendance[k] === 'P') present++;
    });
    return { present, total: entries.length };
  }, [selectedPlayerId, store.data.attendance]);

  const chartData = useMemo(() => {
    return playerFitness.map((f: any) => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      agility: parseFloat(f.agilityScore) || 0,
      stamina: parseFloat(f.enduranceScore) || 0,
    }));
  }, [playerFitness]);

  const teamCategory = useMemo(() => {
    if (!player) return "N/A";
    const age = Number(player.age) || 0;
    const gender = player.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14 Squad`;
    if (age < 17) return `${gender} U17 Squad`;
    return `${gender} Senior Squad`;
  }, [player]);

  const handlePrint = () => {
    if (!player) return;
    window.print();
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-lg">
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
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden group">
              <div className="h-2 w-full bg-accent" />
              <CardContent className="p-8 space-y-8 text-center">
                <Avatar className="w-40 h-40 border-4 border-primary/10 shadow-2xl mx-auto">
                  <AvatarImage src={player?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-5xl uppercase">{player?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h3 className="font-black uppercase text-3xl text-primary leading-tight tracking-tight">{player?.name}</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase">{teamCategory}</Badge>
                    <Badge className="bg-primary text-white text-[10px] font-black uppercase">GR: {player?.generalRegisterNumber || 'N/A'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* High-Performance Analytics (PHV Maturity) */}
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-6">
                 <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-accent" /> High-Performance Analytics
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <Ruler className="w-4 h-4 text-primary mx-auto mb-1 opacity-40" />
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Height</p>
                    <p className="text-sm font-black text-primary">{player?.height}cm</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <Scale className="w-4 h-4 text-primary mx-auto mb-1 opacity-40" />
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Weight</p>
                    <p className="text-sm font-black text-primary">{player?.weight}kg</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <Baby className="w-4 h-4 text-primary mx-auto mb-1 opacity-40" />
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Sitting Ht</p>
                    <p className="text-sm font-black text-primary">{phvData?.sittingHeight}cm</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <Target className="w-4 h-4 text-primary mx-auto mb-1 opacity-40" />
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Leg Length</p>
                    <p className="text-sm font-black text-primary">{phvData?.legLength}cm</p>
                  </div>
                </div>

                {phvData && (
                  <div className={cn(
                    "p-6 rounded-[2rem] border-2 shadow-inner text-center space-y-2 relative overflow-hidden",
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
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                      <TrendingUp className="w-16 h-16" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-3">
                  <ChartLine className="w-5 h-5 text-accent" /> Institutional Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {chartData.length < 2 ? (
                   <div className="h-[350px] flex flex-col items-center justify-center opacity-20 border-4 border-dashed rounded-[2rem]">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase text-sm tracking-widest">Insufficient trend data</p>
                   </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={5} fill="#0048A0" fillOpacity={0.08} />
                        <Line type="monotone" dataKey="stamina" stroke="#f59e0b" strokeWidth={3} />
                        <Legend verticalAlign="top" iconType="circle" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-lg flex flex-col">
                  <CardHeader className="bg-emerald-50 border-b p-6">
                    <CardTitle className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2">
                      <CircleCheck className="w-4 h-4" /> Attendance Consistency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                           <circle 
                              cx="80" cy="80" r="70" 
                              stroke="#10b981" 
                              strokeWidth="12" 
                              fill="transparent" 
                              strokeDasharray="440" 
                              strokeDashoffset={440 - (440 * (playerAttendance.present / (playerAttendance.total || 1)))} 
                              strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black text-primary">{Math.round((playerAttendance.present / (playerAttendance.total || 1)) * 100)}%</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-lg">
                  <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4" /> Skill Mastery Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {skillMasteryData.length === 0 ? (
                       <div className="h-[250px] flex flex-col items-center justify-center opacity-10">
                          <Trophy className="w-12 h-12" />
                       </div>
                    ) : (
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={skillMasteryData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                               {skillMasteryData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                               ))}
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
