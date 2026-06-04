"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Timer, 
  Gauge, 
  ShieldCheck,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export function TrainingLoad({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState("60");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const trainingLoad = useMemo(() => {
    const mins = parseInt(duration) || 0;
    return rpe * mins;
  }, [rpe, duration]);

  const loadStatus = useMemo(() => {
    if (trainingLoad < 200) return { label: 'Recovery', color: 'bg-emerald-500' };
    if (trainingLoad < 500) return { label: 'Optimal', color: 'bg-blue-600' };
    if (trainingLoad < 800) return { label: 'High Strain', color: 'bg-orange-500' };
    return { label: 'Overtraining Risk', color: 'bg-red-600' };
  }, [trainingLoad]);

  const handleSave = () => {
    if (!selectedPlayerId) {
      toast({ title: "Identification Required", description: "Select a student to log load.", variant: "destructive" });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayerId);
    
    store.setFitness(selectedPlayerId, {
      ...store.data.fitness[selectedPlayerId],
      lastTrainingLoad: trainingLoad.toString(),
      lastRpe: rpe.toString(),
      date: date
    });

    toast({ 
      title: "Training Load Logged", 
      description: `Institutional load of ${trainingLoad} synced for ${player?.name}.`,
      className: "bg-primary text-white font-black"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-4xl mx-auto">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <Gauge className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Session RPE Calculator</h2>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Post-Training Load Registry</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">1. Select Student</label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white">
                    <SelectValue placeholder="Pick an athlete..." />
                  </SelectTrigger>
                  <SelectContent>
                    {store.data.players.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">2. Session Duration (Mins)</label>
                <div className="relative">
                  <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-2 font-black text-lg focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">3. Training Date</label>
                <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="h-14 rounded-2xl border-2 font-bold" />
              </div>
            </div>
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-primary p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Calculated Load</p>
                <h3 className="text-6xl font-black tracking-tighter">{trainingLoad}</h3>
                <Badge className={cn("mt-4 text-[10px] font-black uppercase px-4 py-1 rounded-full", loadStatus.color)}>
                  {loadStatus.label}
                </Badge>
              </div>
              <div className="text-right">
                <TrendingUp className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[9px] font-bold text-white/40 uppercase mt-4">Total Internal Stress</p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
          </Card>
        </div>

        <Card className="border-2 rounded-[2.5rem] p-10 shadow-xl bg-white flex flex-col justify-between h-full">
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b-2 border-primary/5 pb-4">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-accent" /> Borg CR-10 Exertion
              </h4>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xl font-black w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner">
                {rpe}
              </Badge>
            </div>

            <div className="space-y-12 py-4">
              <Slider 
                value={[rpe]} 
                onValueChange={(val) => setRpe(val[0])}
                min={1} 
                max={10} 
                step={1}
                className="cursor-pointer"
              />
              
              <div className="bg-muted/20 p-8 rounded-[2rem] border-2 border-dashed border-muted text-center space-y-3 relative">
                <p className={cn("text-4xl font-black uppercase tracking-tight transition-all", BORG_DESCRIPTIONS[rpe].color)}>
                  {BORG_DESCRIPTIONS[rpe].label}
                </p>
                <p className="text-sm font-medium text-foreground/60 italic leading-relaxed">
                  &quot;{BORG_DESCRIPTIONS[rpe].desc}&quot;
                </p>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 border rounded-full">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 inline mr-2" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Certified Scale</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <Button 
              onClick={handleSave} 
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl active-scale flex items-center justify-center gap-4 text-lg"
            >
              <Save className="w-6 h-6" /> Archive Load Registry
            </Button>
            <p className="text-[9px] font-black text-muted-foreground uppercase text-center mt-6 tracking-[0.3em] opacity-40">
              Registry Engine &bull; WGB Hub V3.9.4
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}