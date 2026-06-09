
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
      toast({ title: "Identification Required", description: "Select a student.", variant: "destructive" });
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
      title: "Load Logged", 
      description: `Registry stress for ${player?.name} synced.`,
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
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">RPE Calculator</h2>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Load Registry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">1. Select Student</label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white"><SelectValue placeholder="Pick athlete..." /></SelectTrigger>
                <SelectContent>{store.data.players.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">2. Duration (Mins)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-14 rounded-2xl border-2 font-black text-lg" />
            </div>
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-primary p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Calculated Load</p>
              <h3 className="text-6xl font-black tracking-tighter">{trainingLoad}</h3>
              <Badge className={cn("mt-4 text-[10px] font-black uppercase px-4 py-1 rounded-full", loadStatus.color)}>{loadStatus.label}</Badge>
            </div>
          </Card>
        </div>

        <Card className="border-2 rounded-[2.5rem] p-10 shadow-xl bg-white flex flex-col justify-between h-full">
          <div className="space-y-10">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-accent" /> Exertion Scale</h4>
            <Slider value={[rpe]} onValueChange={(val) => setRpe(val[0])} min={1} max={10} step={1} />
            <div className="bg-muted/20 p-8 rounded-[2rem] border-2 border-dashed border-muted text-center space-y-3">
              <p className={cn("text-4xl font-black uppercase tracking-tight", BORG_DESCRIPTIONS[rpe].color)}>{BORG_DESCRIPTIONS[rpe].label}</p>
              <p className="text-sm font-medium text-foreground/60 italic leading-relaxed">&quot;{BORG_DESCRIPTIONS[rpe].desc}&quot;</p>
            </div>
          </div>
          <div className="pt-10">
            <Button onClick={handleSave} className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl active-scale">Archive Load</Button>
            <p className="text-[9px] font-black text-muted-foreground uppercase text-center mt-6 tracking-[0.3em] opacity-40">Registry Engine &bull; WGB Hub V4.3.24</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
