
"use client";

import React, { useState, useMemo } from 'react';
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
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function DailyReadiness({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [sleepHours, setSleepHours] = useState(8);
  const [sorenessScore, setSorenessScore] = useState(1); // 1 = उत्तम, 5 = प्रचंड थकवा
  const [fatigueScore, setFatigueScore] = useState(1);
  const [injuryStatus, setInjuryStatus] = useState("Fit to Train");
  const [isSaving, setIsSaving] = useState(false);

  const players = useMemo(() => 
    store.data.players.filter((p: any) => p.category === 'athlete')
      .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    [store.data.players]
  );

  const selectedPlayer = useMemo(() => 
    players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, players]
  );

  // PHV Offset Calculation Logic (Mirwald)
  const calculatePhvOffset = (player: any) => {
    if (!player?.height || !player?.weight || !player?.age) return 0;
    
    const h = parseFloat(player.height);
    const sH = parseFloat(player.sittingHeight || (h * 0.52).toFixed(1));
    const w = parseFloat(player.weight);
    const age = player.age;
    const legL = h - sH;

    let offset = 0;
    if (player.gender === 'Male') {
      offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
    } else {
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.0022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }
    return offset;
  };

  // CoachAlertSystem logic integrated
  const coachAlert = useMemo(() => {
    if (!selectedPlayer) return null;

    const phvOffset = calculatePhvOffset(selectedPlayer);
    const strainScore = sorenessScore + fatigueScore;
    const isGoingThroughGrowthSpurt = phvOffset >= -0.5 && phvOffset <= 0.5;

    if (injuryStatus === "Sidelined") {
      return {
        statusColor: "RED",
        action: "विश्रांती द्या",
        advice: "खेळाडूला आज मैदानावरील सरावातून पूर्ण विश्रांती द्या आणि फिजिओथेरपी किंवा डॉक्टरांचा सल्ला घ्या.",
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive"
      };
    }

    if (strainScore >= 7 || sleepHours < 6) {
      return {
        statusColor: "YELLOW",
        action: "सराव मर्यादित करा",
        advice: isGoingThroughGrowthSpurt 
            ? "मुलगा 'ग्रोथ स्पर्ट' (उंची वाढण्याच्या वेगवान टप्प्यात) मधून जात आहे आणि थकवा जास्त आहे. उड्या मारणे (Jumps) आणि वजन उचलणे पूर्ण बंद करा. फक्त कौशल्यांचा सराव घ्या."
            : "थकवा जास्त आहे आणि झोप कमी झाली आहे. धावण्याचा आणि ताकदीचा सराव कमी करून हलका तांत्रिक सराव (Tactical Drills) घ्या.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200"
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
      border: "border-emerald-200"
    };
  }, [selectedPlayer, sleepHours, sorenessScore, fatigueScore, injuryStatus]);

  const handleSave = async () => {
    if (!selectedPlayerId) {
      toast({ title: "Identification Required", description: "Select a student first.", variant: "destructive" });
      return;
    }

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
        description: "आजचा आरोग्य डेटा यशस्वीरीत्या जतन केला!",
        className: "bg-emerald-600 text-white font-black"
      });
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <HeartPulse className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">दैनंदिन आरोग्य सज्जता</h2>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Daily Athlete Readiness System</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 flex items-center gap-2">
            <Users className="w-3 h-3" /> खेळाडू निवडा (Select Athlete)
          </label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white text-lg">
              <SelectValue placeholder="खेळाडूची निवड करा..." />
            </SelectTrigger>
            <SelectContent>
              {players.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {coachAlert ? (
          <div className={cn("p-8 rounded-[2rem] border-2 space-y-6 transition-all shadow-sm relative overflow-hidden", coachAlert.bg, coachAlert.border)}>
             <div className="flex items-center gap-6 relative z-10">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center shadow-inner bg-white shrink-0", coachAlert.color)}>
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("px-4 py-1 rounded-full font-black uppercase text-[10px]", coachAlert.statusColor === 'RED' ? 'bg-red-600' : coachAlert.statusColor === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600')}>
                      {coachAlert.statusColor} Alert
                    </Badge>
                    <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">System evaluated</span>
                  </div>
                  <h3 className={cn("text-2xl font-black uppercase leading-none mt-2", coachAlert.color)}>{coachAlert.action}</h3>
                </div>
             </div>

             <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                  <Info className="w-4 h-4 text-accent" /> प्रशिक्षकांसाठी सल्ला (Advice):
                </div>
                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic">
                  "{coachAlert.advice}"
                </p>
             </div>
             
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        ) : (
          <div className="p-10 text-center border-4 border-dashed rounded-[2rem] opacity-20">
             <Zap className="w-12 h-12 mx-auto mb-4" />
             <p className="text-sm font-black uppercase tracking-widest">Identify athlete to run readiness engine</p>
          </div>
        )}

        <div className="space-y-10 py-4">
           {/* 1. Sleep */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2"><Moon className="w-4 h-4 text-blue-500" /> १. गेल्या रात्री किती तास झोप झाली?</h4>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-black text-xs px-4 h-8">{sleepHours} तास</Badge>
              </div>
              <Slider value={[sleepHours]} onValueChange={(val) => setSleepHours(val[0])} min={4} max={12} step={0.5} className="cursor-pointer" />
              <div className="flex justify-between px-1"><span className="text-[9px] font-bold text-muted-foreground uppercase">४ तास</span><span className="text-[9px] font-bold text-muted-foreground uppercase">१२ तास</span></div>
           </div>

           {/* 2. Soreness */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500" /> २. स्नायूंचा थकवा किंवा दुखावा (Soreness) किती आहे?</h4>
                <Badge className="bg-orange-500 text-white font-black text-xs px-4 h-8">स्तर: {sorenessScore}</Badge>
              </div>
              <Slider value={[sorenessScore]} onValueChange={(val) => setSorenessScore(val[0])} min={1} max={5} step={1} className="cursor-pointer" />
              <div className="flex justify-between px-1"><span className="text-[9px] font-bold text-muted-foreground uppercase">१ - अजिबात नाही</span><span className="text-[9px] font-bold text-muted-foreground uppercase">५ - प्रचंड दुखावा</span></div>
           </div>

           {/* 3. Fatigue */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-red-500" /> ३. सध्या शरीरात थकवा किती जाणवतोय?</h4>
                <Badge className="bg-red-500 text-white font-black text-xs px-4 h-8">स्तर: {fatigueScore}</Badge>
              </div>
              <Slider value={[fatigueScore]} onValueChange={(val) => setFatigueScore(val[0])} min={1} max={5} step={1} className="cursor-pointer" />
           </div>

           {/* 4. Injury */}
           <div className="space-y-4">
              <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2 ml-2">४. दुखापत किंवा इजा स्टेटस</h4>
              <Select value={injuryStatus} onValueChange={setInjuryStatus}>
                <SelectTrigger className="h-14 rounded-xl border-2 font-bold bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fit to Train">पूर्णपणे तंदुरुस्त (Fit)</SelectItem>
                  <SelectItem value="Restricted">हलका सराव (Restricted)</SelectItem>
                  <SelectItem value="Sidelined">सरावापासून विश्रांती (Sidelined)</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="pt-8 space-y-6">
           <Button 
            onClick={handleSave}
            disabled={!selectedPlayerId || isSaving}
            className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl active-scale flex items-center justify-center gap-4 text-lg"
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            आरोग्य नोंद सबमिट करा
          </Button>
          
          <div className="bg-muted/10 p-6 rounded-[2rem] border-2 border-dashed border-muted text-center space-y-2">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-500" /> Certified Readiness Protocol
             </p>
             <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Institutional Registry • WGB Hub V3.8.2</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
