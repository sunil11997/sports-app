"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Gauge, 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Clock,
  History,
  Activity,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, isAfter, startOfDay, parseISO } from 'date-fns';

const BORG_DESCRIPTIONS: Record<number, { label: string, color: string, desc: string }> = {
  1: { label: "Very Light", color: "text-emerald-500", desc: "Hardly any exertion (Rest/Recovery)" },
  2: { label: "Easy", color: "text-emerald-500", desc: "Comfortable pace, can talk easily" },
  3: { label: "Moderate", color: "text-emerald-600", desc: "Beginning to sweat, breathing slightly harder" },
  4: { label: "Somewhat Hard", color: "text-blue-500", desc: "Steady pace, breathing is constant" },
  5: { label: "Hard", color: "text-blue-600", desc: "Challenging but sustainable for a short time" },
  6: { label: "Very Hard", color: "text-orange-500", desc: "Deep breathing, conversation is difficult" },
  7: { label: "Intense", color: "text-orange-600", desc: "High intensity, muscles feel fatigued" },
  8: { label: "Extreme", color: "text-red-500", desc: "Near maximal effort, cannot sustain for long" },
  9: { label: "Near Maximal", color: "text-red-600", desc: "Extremely difficult, almost at limit" },
  10: { label: "MAXIMAL", color: "text-red-700", desc: "Absolute peak effort, gasping for air" }
};

const SESSION_TYPES = [
  "General Practice",
  "Intense Ground Work",
  "Tournament Match",
  "Gym / Strength",
  "Conditioning / Running",
  "Technical Skills",
  "Active Recovery"
];

interface LoadEntry {
  date: string;
  load: number;
  rpe: number;
  type: string;
}

export function TrainingLoad({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState("60");
  const [sessionType, setSessionType] = useState("General Practice");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);

  const playerLoadHistory = useMemo(() => {
    if (!selectedPlayerId || !store.data.fitnessHistory[selectedPlayerId]) return [];
    
    return store.data.fitnessHistory[selectedPlayerId]
      .filter((h: any) => h.lastTrainingLoad)
      .map((h: any): LoadEntry => ({
        date: h.date || h.updatedAt?.split('T')[0] || "Unknown",
        load: parseInt(h.lastTrainingLoad) || 0,
        rpe: parseInt(h.lastRpe) || 0,
        type: h.sessionType || "Practice"
      }))
      .sort((a: LoadEntry, b: LoadEntry) => a.date.localeCompare(b.date));
  }, [selectedPlayerId, store.data.fitnessHistory]);

  const loadMetrics = useMemo(() => {
    if (playerLoadHistory.length === 0) return { acute: 0, chronic: 0, ratio: 0, status: 'Insufficient Data' };

    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);
    const twentyEightDaysAgo = subDays(today, 28);

    const acuteLoads = playerLoadHistory.filter((h: LoadEntry) => isAfter(parseISO(h.date), sevenDaysAgo));
    const chronicLoads = playerLoadHistory.filter((h: LoadEntry) => isAfter(parseISO(h.date), twentyEightDaysAgo));

    const acuteTotal = acuteLoads.reduce((sum: number, h: LoadEntry) => sum + h.load, 0);
    const chronicTotal = chronicLoads.reduce((sum: number, h: LoadEntry) => sum + h.load, 0);

    const acuteAvg = acuteTotal / 7;
    const chronicAvg = chronicTotal / 28;

    const ratio = chronicAvg > 0 ? (acuteAvg / chronicAvg) : 0;

    let status = 'Optimal';
    if (ratio > 1.5) status = 'Danger (Overload)';
    else if (ratio > 1.3) status = 'Warning (High)';
    else if (ratio < 0.8 && ratio > 0) status = 'Underloading';

    return {
      acute: Math.round(acuteAvg),
      chronic: Math.round(chronicAvg),
      ratio: parseFloat(ratio.toFixed(2)),
      status
    };
  }, [playerLoadHistory]);

  const trainingLoadValue = useMemo(() => {
    const mins = parseInt(duration) || 0;
    return rpe * mins;
  }, [rpe, duration]);

  const handleSave = async () => {
    if (!selectedPlayerId) {
      toast({ title: "Identification Required", description: "Select a student to log load.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const player = store.data.players.find((p: any) => p.id === selectedPlayerId);
    
    try {
      await store.setFitness(selectedPlayerId, {
        ...store.data.fitness[selectedPlayerId],
        lastTrainingLoad: trainingLoadValue.toString(),
        lastRpe: rpe.toString(),
        sessionType: sessionType,
        date: date,
        updatedAt: new Date().toISOString()
      });

      toast({ 
        title: "Load Registry Updated", 
        description: `Archived ${trainingLoadValue} load units for ${player?.name}.`,
        className: "bg-primary text-white font-black"
      });
    } catch (err) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = useMemo(() => {
    return playerLoadHistory.slice(-14).map(h => ({
      name: format(parseISO(h.date), 'dd/MM'),
      load: h.load,
      rpe: h.rpe
    }));
  }, [playerLoadHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border border-primary/10">
              <Gauge className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Advanced Load Management</h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sports Science Registry v4.3.25
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-3">
             <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-white shadow-sm">
                  <SelectValue placeholder="Identify Athlete..." />
                </SelectTrigger>
                <SelectContent>
                  {store.data.players.filter((p: any) => p.category === 'athlete').map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
            <div className="space-y-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">1. Session Context</label>
                 <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger className="h-12 border-2 rounded-xl font-bold bg-muted/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">2. Duration (Mins)</label>
                    <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-12 rounded-xl border-2 font-black" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">3. Date</label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl border-2 font-black" />
                  </div>
               </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                   <BrainCircuit className="w-4 h-4 text-accent" /> Perceived Exertion (RPE)
                </h4>
                <Badge className="bg-primary text-white font-black text-xs px-3">{rpe}/10</Badge>
              </div>
              <Slider value={[rpe]} onValueChange={(val) => setRpe(val[0])} min={1} max={10} step={1} />
              <div className="bg-muted/10 p-6 rounded-[2rem] border-2 border-dashed border-muted text-center space-y-2">
                <p className={cn("text-3xl font-black uppercase tracking-tight", BORG_DESCRIPTIONS[rpe].color)}>{BORG_DESCRIPTIONS[rpe].label}</p>
                <p className="text-xs font-medium text-foreground/60 leading-relaxed">&quot;{BORG_DESCRIPTIONS[rpe].desc}&quot;</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving || !selectedPlayerId} className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl active-scale">
               {isSaving ? <Zap className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />} Archive Session Load
            </Button>
          </Card>

          <Card className={cn(
            "border-2 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden",
            loadMetrics.status.includes('Danger') ? "bg-destructive" : loadMetrics.status.includes('Warning') ? "bg-orange-500" : "bg-emerald-600"
          )}>
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Workload Ratio (ACWR)</p>
                      <h3 className="text-5xl font-black tracking-tighter mt-1">{loadMetrics.ratio || '0.0'}</h3>
                   </div>
                   <Badge className="bg-white/20 text-white border-0 font-black uppercase text-[10px] px-4">{loadMetrics.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/10">
                   <div>
                      <p className="text-[9px] font-black text-white/50 uppercase">Acute (7d Avg)</p>
                      <p className="text-2xl font-black">{loadMetrics.acute}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/50 uppercase">Chronic (28d Avg)</p>
                      <p className="text-2xl font-black">{loadMetrics.chronic}</p>
                   </div>
                </div>

                {loadMetrics.ratio > 1.5 && (
                  <div className="bg-black/20 p-4 rounded-2xl flex items-start gap-3 border border-white/10">
                     <AlertTriangle className="w-5 h-5 text-white shrink-0" />
                     <p className="text-xs font-bold leading-tight">INJURY WARNING: Athlete workload is increasing too fast. Reduce intensity tomorrow.</p>
                  </div>
                )}
             </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl h-[450px] flex flex-col">
              <CardHeader className="bg-slate-50 border-b p-8 flex flex-row justify-between items-center">
                 <div className="flex items-center gap-3">
                    <LineChartIcon className="w-6 h-6 text-primary" />
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Load Intensity Trend</CardTitle>
                 </div>
                 <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-3">Last 14 Records</Badge>
              </CardHeader>
              <CardContent className="flex-1 p-10">
                 {chartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                       <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="load" stroke="#1e3a8a" strokeWidth={4} fillOpacity={1} fill="url(#colorLoad)" name="Unit Load" />
                       <Line type="monotone" dataKey="rpe" stroke="#f59e0b" strokeWidth={2} dot={false} name="RPE Score" />
                     </AreaChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <History className="w-16 h-16 mb-4 text-primary" />
                      <p className="font-black uppercase tracking-widest text-sm">No historical load data found</p>
                   </div>
                 )}
              </CardContent>
           </Card>

           <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[300px]">
              <CardHeader className="bg-primary p-6 text-white flex flex-row justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-accent" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Load History Registry</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-muted/30 border-b">
                          <tr className="h-12 text-[10px] font-black uppercase text-muted-foreground">
                             <th className="px-8">Date</th>
                             <th className="px-4">Session Type</th>
                             <th className="px-4 text-center">RPE</th>
                             <th className="px-8 text-right">Unit Load</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {playerLoadHistory.slice().reverse().slice(0, 5).map((h: LoadEntry, i: number) => (
                            <tr key={i} className="h-16 hover:bg-muted/10 transition-colors">
                               <td className="px-8 font-black text-xs text-primary uppercase">{format(parseISO(h.date), 'dd MMM yyyy')}</td>
                               <td className="px-4"><Badge variant="secondary" className="text-[9px] font-black uppercase px-3">{h.type}</Badge></td>
                               <td className="px-4 text-center font-bold">{h.rpe}</td>
                               <td className="px-8 text-right font-black text-primary">{h.load}</td>
                            </tr>
                          ))}
                          {playerLoadHistory.length === 0 && (
                            <tr><td colSpan={4} className="h-32 text-center text-[10px] font-black uppercase opacity-20">Awaiting registry entries</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}