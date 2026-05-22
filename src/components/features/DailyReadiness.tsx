"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  HeartPulse, 
  Moon, 
  Activity, 
  Save, 
  Loader2, 
  Users,
  ShieldCheck,
  Zap,
  Info,
  ClipboardCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * CoachAlertSystem
 * Multi-factor physiological risk assessment engine.
 */
const CoachAlertSystem = {
  evaluateAthleteReadiness: (input: {
    sleepHours: number;
    soreness: number;
    fatigue: number;
    injuryStatus: string;
    phvOffset: number;
  }) => {
    const { sleepHours, soreness, fatigue, injuryStatus, phvOffset } = input;

    if (injuryStatus === "Sidelined") {
      return {
        statusColor: "RED",
        action: "विश्रांती द्या",
        advice: "खेळाडूला आज मैदानावरील सरावातून पूर्ण विश्रांती द्या आणि फिजिओथेरपी किंवा डॉक्टरांचा सल्ला घ्या.",
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive",
        dot: "bg-destructive"
      };
    }

    const isGoingThroughGrowthSpurt = !isNaN(phvOffset) && phvOffset >= -0.5 && phvOffset <= 0.5;
    const strainScore = soreness + fatigue;

    if (strainScore >= 7 || sleepHours < 6) {
      return {
        statusColor: "YELLOW",
        action: "सराव मर्यादित करा",
        advice: isGoingThroughGrowthSpurt 
            ? "मुलगा 'ग्रोथ स्पर्ट' (उंची वाढण्याच्या वेगवान टप्प्यात) मधून जात आहे आणि थकवा जास्त आहे. उड्या मारणे (Jumps) आणि वजन उचलणे पूर्ण बंद करा. फक्त कौशल्यांचा सराव घ्या."
            : "थकवा जास्त आहे आणि झोप कमी झाली आहे. धावण्याचा आणि ताकदीचा सराव कमी करून हलका तांत्रिक सराव (Tactical Drills) घ्या.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500"
      };
    }

    return {
      statusColor: "GREEN",
      action: "पूर्ण सराव",
      advice: isGoingThroughGrowthSpurt
          ? "खेळाडू फिट आहे, पण उंची वाढण्याचा काळ सुरू असल्याने सराव करताना खेळाडूच्या धावण्याच्या तंत्रावर (Running Mechanics) लक्ष ठेवा."
          : "खेळाडू पूर्णपणे सज्ज आहे. आज तुम्ही मॅक्सिमम ताकद, गती (Speed) आणि सामन्याचा सराव (Match Practice) घेऊ शकता.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      dot: "bg-emerald-600"
    };
  }
};

/**
 * calculatePhvOffset
 * Mirwald PHV Maturity estimation logic.
 */
const calculatePhvOffset = (player: any) => {
  if (!player?.height || !player?.weight || !player?.age) return 0;
  
  const h = parseFloat(player.height);
  const sH = parseFloat(player.sittingHeight || (h * 0.52).toFixed(1));
  const w = parseFloat(player.weight);
  const age = Number(player.age) || 0;
  
  if (isNaN(h) || isNaN(w) || isNaN(age)) return 0;

  const legL = h - sH;
  let offset = 0;
  
  if (player.gender === 'Male') {
    offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
  } else {
    offset = -9.376 + (0.0001881 * (legL * sH)) + (0.022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
  }
  
  return isNaN(offset) ? 0 : offset;
};

export function DailyReadiness({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [sleepHours, setSleepHours] = useState(8);
  const [sorenessScore, setSorenessScore] = useState(1);
  const [fatigueScore, setFatigueScore] = useState(1);
  const [injuryStatus, setInjuryStatus] = useState("Fit to Train");
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const players = useMemo(() => {
    if (!store?.data?.players) return [];
    return store.data.players
      .filter((p: any) => p && p.category === 'athlete')
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [store?.data?.players]);

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId || !players) return null;
    return players.find((p: any) => p.id === selectedPlayerId) || null;
  }, [selectedPlayerId, players]);

  const coachAlert = useMemo(() => {
    if (!selectedPlayer || !isMounted) return null;
    return CoachAlertSystem.evaluateAthleteReadiness({
      sleepHours,
      soreness: sorenessScore,
      fatigue: fatigueScore,
      injuryStatus,
      phvOffset: calculatePhvOffset(selectedPlayer)
    });
  }, [selectedPlayer, sleepHours, sorenessScore, fatigueScore, injuryStatus, isMounted]);

  const teamReadiness = useMemo(() => {
    if (!isMounted || !players) return [];
    return players.map((p: any) => {
      const data = store.data.dailyReadiness?.[p.id] || {};
      const analysis = CoachAlertSystem.evaluateAthleteReadiness({
        sleepHours: data.sleepHours || 8,
        soreness: data.sorenessScore || 1,
        fatigue: data.fatigueScore || 1,
        injuryStatus: data.injuryStatus || "Fit to Train",
        phvOffset: calculatePhvOffset(p)
      });
      return { player: p, analysis, hasData: !!store.data.dailyReadiness?.[p.id] };
    });
  }, [players, store.data.dailyReadiness, isMounted]);

  // Pre-calculate JSX for better build worker stability
  const squadView = useMemo(() => {
    if (!isMounted || teamReadiness.length === 0) {
      return (
        <div className="py-20 text-center opacity-20">
          <Users className="w-10 h-10 mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase">No athlete data synchronized</p>
        </div>
      );
    }

    return teamReadiness.map(({ player, analysis, hasData }) => {
      if (!player) return null;
      return (
        <div key={player.id} className={cn(
          "p-5 rounded-[1.5rem] border-2 transition-all group flex items-start gap-5",
          hasData ? "bg-white border-primary/5 hover:border-primary/20 hover:shadow-md" : "bg-muted/10 border-transparent opacity-40 grayscale"
        )}>
          <div className="relative">
            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
              <AvatarImage src={player.photoUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-sm">
                {player.name ? player.name[0] : '?'}
              </AvatarFallback>
            </Avatar>
            {hasData && (
              <div className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm animate-pulse", 
                analysis?.dot || "bg-emerald-500"
              )} />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-primary uppercase text-sm leading-none group-hover:text-accent transition-colors truncate">
                  {player.name}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">
                  Std {player.std} • Age {player.age}
                </p>
              </div>
              {hasData && (
                <Badge className={cn(
                  "font-black uppercase text-[8px] px-3 py-1 rounded-full whitespace-nowrap border-0 shadow-none", 
                  analysis?.bg || "bg-primary/10", 
                  analysis?.color || "text-primary"
                )}>
                  {analysis?.action || "Check"}
                </Badge>
              )}
            </div>
            
            {hasData && (
              <div className="bg-muted/20 p-4 rounded-xl border border-dashed border-muted relative">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-foreground/80 leading-relaxed italic">
                    "{analysis?.advice || "No advice available."}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [teamReadiness, isMounted]);

  const handleSave = async () => {
    if (!selectedPlayerId || !isMounted) return;
    setIsSaving(true);
    try {
      await store.setReadiness(selectedPlayerId, {
        sleepHours, 
        sorenessScore, 
        fatigueScore, 
        injuryStatus,
        readinessStatus: coachAlert?.statusColor || "GREEN"
      });
      toast({ 
        title: "यशस्वी", 
        description: "आजचा आरोग्य डेटा जतन केला!", 
        className: "bg-emerald-600 text-white" 
      });
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-primary/10">
              <HeartPulse className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">आरोग्य सज्जता नोंद</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Form (Coach सुनील)</p>
          </div>
        </div>

        <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 flex items-center gap-2">
              <Users className="w-3 h-3" /> खेळाडू निवडा
            </label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white text-lg">
                <SelectValue placeholder="खेळाडू निवडा..." />
              </SelectTrigger>
              <SelectContent>
                {players.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {coachAlert ? (
            <div className={cn(
              "p-8 rounded-[2rem] border-2 space-y-6 transition-all shadow-sm", 
              coachAlert.bg, 
              coachAlert.border
            )}>
               <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-inner", coachAlert.color)}>
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <Badge className={cn(
                      "font-black uppercase text-[9px] px-3", 
                      coachAlert.statusColor === 'RED' ? 'bg-red-600' : 
                      coachAlert.statusColor === 'YELLOW' ? 'bg-amber-500' : 
                      'bg-emerald-600'
                    )}>
                      {coachAlert.statusColor} Alert
                    </Badge>
                    <h3 className={cn("text-xl font-black uppercase leading-none mt-1.5", coachAlert.color)}>
                      {coachAlert.action}
                    </h3>
                  </div>
               </div>
               <div className="bg-white/60 p-5 rounded-2xl border border-white/50">
                <p className="text-xs font-bold text-foreground/80 leading-relaxed italic">
                  "{coachAlert.advice}"
                </p>
               </div>
            </div>
          ) : (
            <div className="p-10 text-center border-4 border-dashed rounded-[2rem] opacity-20">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm font-black uppercase">Start entry to run engine</p>
            </div>
          )}

          <div className="space-y-8 py-2">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-500" /> झोप (तास)
                  </h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-black">
                    {sleepHours} तास
                  </Badge>
                </div>
                <Slider 
                  value={[sleepHours]} 
                  onValueChange={(val) => setSleepHours(val[0])} 
                  min={4} 
                  max={12} 
                  step={0.5} 
                />
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" /> स्नायू थकवा (Soreness)
                  </h4>
                  <Badge className="bg-orange-500 text-white font-black">{sorenessScore}</Badge>
                </div>
                <Slider 
                  value={[sorenessScore]} 
                  onValueChange={(val) => setSorenessScore(val[0])} 
                  min={1} 
                  max={5} 
                  step={1} 
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" /> शारीरिक थकवा (Fatigue)
                  </h4>
                  <Badge className="bg-red-500 text-white font-black">{fatigueScore}</Badge>
                </div>
                <Slider 
                  value={[fatigueScore]} 
                  onValueChange={(val) => setFatigueScore(val[0])} 
                  min={1} 
                  max={5} 
                  step={1} 
                />
             </div>

             <div className="space-y-2">
                <h4 className="text-xs font-black text-primary uppercase ml-2">दुखापत स्टेटस</h4>
                <Select value={injuryStatus} onValueChange={setInjuryStatus}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fit to Train">तंदुरुस्त (Fit)</SelectItem>
                    <SelectItem value="Restricted">हलका सराव (Restricted)</SelectItem>
                    <SelectItem value="Sidelined">विश्रांती (Sidelined)</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!selectedPlayerId || isSaving} 
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl active-scale"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
            नोंद सबमिट करा
          </Button>
        </Card>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">सज्जता डॅशबोर्ड (Squad View)</h3>
           </div>
           <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">आजची स्थिती</Badge>
        </div>

        <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[700px]">
           <div className="bg-muted/30 p-6 border-b flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">खेळाडू यादी (Athlete Roster)</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{players.length} Total Athletes</span>
           </div>
           
           <div className="flex-1 overflow-y-auto max-h-[800px] scrollbar-hide p-6 space-y-4">
              {squadView}
           </div>

           <div className="p-8 bg-primary/5 border-t text-center">
              <div className="inline-flex items-center gap-4 text-primary font-black uppercase text-[10px] tracking-widest">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" /> Registry Synced with Cloud Vault
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
