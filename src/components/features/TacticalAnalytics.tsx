"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BrainCircuit, 
  Save, 
  History, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Gauge 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TacticalEvent } from '@/lib/types';

const TACTICAL_SITUATIONS: Record<string, string[]> = {
  'Kabaddi': [
    'Last 5 Seconds Raid (शेवटची चढाई)',
    'Bonus Attempt (बोनस प्रयत्न)',
    'Chain Tackle Attempt (साखळी पकड)',
    'Advanced Tackle (विनाकारण घाई)',
    'Do or Die Raid (करा किंवा मरा चढाई)',
    'Escape from Dash (डॅश मधून सुटका)'
  ],
  'Volleyball': [
    'Crunch Point Serve (महत्त्वाचा सर्व्हिस)',
    'Triple Block Timing (तिहेरी ब्लॉक)',
    'Libero Coverage (लिबेरो कव्हरेज)',
    'Decision to Spike/Drop (स्पाईक की ड्रॉप)',
    'Set Under Pressure (दबावाखालील सेट)'
  ],
  'Kho Kho': [
    'Pole Dive Attempt (पोल डायव्ह)',
    'Direction Fake (दिशाभूल)',
    'Giving Kho Timing (खो देण्याची वेळ)',
    'Late Entry Running (उशिरा प्रवेश धावणे)',
    'Sudden Sudden Turn (अचानक वळण)'
  ],
  'General': [
    'Quick Reflex Response',
    'Tactical Positioning',
    'Communication Lead',
    'Risk Assessment'
  ]
};

export function TacticalAnalytics({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedSport, setSelectedSport] = useState(preselectedSport || "Kabaddi");
  const [situation, setSituation] = useState("");
  const [outcome, setOutcome] = useState<'Success' | 'Failure'>('Success');
  const [decisionType, setDecisionType] = useState<'Positive' | 'Negative'>('Positive');
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const players = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => p.category === 'athlete' && (!selectedSport || p.sports?.includes(selectedSport)))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, selectedSport]
  );

  const relevantEvents = useMemo((): TacticalEvent[] => {
    return (store.data.tacticalEvents || [])
      .filter((e: TacticalEvent) => e.sport === selectedSport)
      .slice(0, 10);
  }, [store.data.tacticalEvents, selectedSport]);

  const successRate = useMemo(() => {
    if (relevantEvents.length === 0) return 0;
    const successes = relevantEvents.filter((event: TacticalEvent) => event.outcome === 'Success').length;
    return Math.round((successes / relevantEvents.length) * 100);
  }, [relevantEvents]);

  const handleSaveEvent = async () => {
    if (!selectedPlayerId || !situation) {
      toast({ title: "Incomplete", description: "Pick athlete and situation.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const player = players.find((p: any) => p.id === selectedPlayerId);
      await store.addTacticalEvent({
        playerId: selectedPlayerId,
        playerName: player?.name || "Unknown",
        sport: selectedSport,
        date: format(new Date(), 'yyyy-MM-dd'),
        situation,
        decisionType,
        outcome,
        description
      });

      toast({ 
        title: "Decision Archived", 
        description: "Tactical registry updated.",
        className: decisionType === 'Positive' ? "bg-emerald-600 text-white" : "bg-orange-600 text-white"
      });

      setSituation("");
      setDescription("");
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="lg:col-span-5 space-y-8">
        <Card className="border-0 bg-primary p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Decision IQ</h2>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-1">Real-Time Tactical Registry</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                  <p className="text-[9px] font-black uppercase text-white/50 mb-1">Squad Success</p>
                  <h4 className="text-3xl font-black">{successRate}%</h4>
               </div>
               <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                  <p className="text-[9px] font-black uppercase text-white/50 mb-1">Total Logs</p>
                  <h4 className="text-3xl font-black">{relevantEvents.length}</h4>
               </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">१. खेळाडू निवडा</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white"><SelectValue placeholder="Pick athlete..." /></SelectTrigger>
              <SelectContent>
                {players.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">२. मैदानावरील प्रसंग (Situation)</label>
            <Select value={situation} onValueChange={setSituation}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-muted/20"><SelectValue placeholder="Pick situation..." /></SelectTrigger>
              <SelectContent>
                {(TACTICAL_SITUATIONS[selectedSport] || TACTICAL_SITUATIONS['General']).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">कोचची टिप्पणी (Remarks)</label>
            <Input 
              value={description} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} 
              placeholder="e.g. Advanced tackle under pressure..." 
              className="h-12 border-2 rounded-xl"
            />
          </div>

          <Button 
            onClick={handleSaveEvent} 
            disabled={isSaving || !selectedPlayerId || !situation}
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale"
          >
            {isSaving ? <Clock className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
            Log Decision
          </Button>
        </Card>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[600px]">
           <ScrollArea className="flex-1 p-6">
              {relevantEvents.length === 0 ? (
                <div className="py-24 text-center opacity-20 border-4 border-dashed rounded-[3rem] m-4">
                  <Activity className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm">No Tactical Decisions Recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relevantEvents.map((event: TacticalEvent) => (
                    <div key={event.id} className="p-6 rounded-[2rem] border-2 border-primary/5 hover:border-primary/20 transition-all group relative overflow-hidden bg-white">
                       <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-start gap-5">
                             <div className={cn(
                               "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                               event.outcome === 'Success' ? "bg-emerald-50 text-emerald-600" : "bg-destructive/5 text-destructive"
                             )}>
                               {event.outcome === 'Success' ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                             </div>
                             <div className="space-y-1">
                                <h4 className="font-black text-primary uppercase text-sm leading-none group-hover:text-accent transition-colors">{event.playerName}</h4>
                                <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-tight">{event.situation}</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => store.deleteTacticalEvent(event.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive">
                             <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </ScrollArea>
           <div className="p-8 bg-primary/5 border-t">
              <div className="flex items-center gap-3">
                 <Gauge className="w-5 h-5 text-accent animate-pulse" />
                 <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">Registry Synchronized • Tactical V3.9.4</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
