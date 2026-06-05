"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Printer, 
  Save, 
  Loader2, 
  Calendar, 
  BrainCircuit, 
  Info,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  Target
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { analyzeFitness, getTestInstructions, type FitnessAnalysisOutput } from '@/ai/flows/fitness-analysis';
import { usePWA } from '@/components/providers/pwa-provider';

const SPORTS_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `Std ${i + 1}` 
  }))
];

export function Fitness({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FitnessAnalysisOutput | null>(null);
  const [activeInstruction, setActiveInstruction] = useState<string>("");
  const [analyzingPlayer, setAnalyzingPlayer] = useState<any>(null);

  const isGeneral = section === 'general';
  const categories = useMemo(() => isGeneral ? GENERAL_CATEGORIES : SPORTS_CATEGORIES, [isGeneral]);

  const getPlayerCategory = useCallback((p: any) => {
    if (!p) return 'all';
    if (isGeneral) return p.std;
    const age = parseInt(p.age) || 0;
    const genderPart = p.gender === 'Female' ? 'girls' : 'boys';
    let agePart = 'senior';
    if (age < 14) agePart = 'u14';
    else if (age < 17) agePart = 'u17';
    return `${genderPart}-${agePart}`;
  }, [isGeneral]);

  const filteredPlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        return matchesSection && matchesTab;
      })
      .sort((a: any, b: any) => {
        // Academic Standard First
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;

        // Gender: Boys first (Male prioritized)
        if (a.gender !== b.gender) {
          return a.gender === 'Male' ? -1 : 1;
        }

        // Roll Number Last
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory]);

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || store.data.fitness?.[id] || {}),
        [field]: value
      }
    }));
  };

  const calculateRecommendations = (metrics: any) => {
    const recs: string[] = [];
    const speed = parseFloat(metrics.speedScore || '0');
    const endurance = parseFloat(metrics.enduranceScore || '0');
    const strength = parseFloat(metrics.strengthScore || '0');
    const agility = parseFloat(metrics.agilityScore || '0');
    const flex = parseFloat(metrics.flexScore || '0');

    if (speed >= 80) recs.push("100m/200m Sprints", "Kabaddi (Raider)");
    if (agility >= 80) recs.push("Volleyball", "Kho Kho");
    if (endurance >= 80) recs.push("400m/800m Running", "Kho Kho");
    if (strength >= 80) recs.push("Shot Put", "Javelin Throw", "Disc Throw");
    if (flex >= 80) recs.push("High Jump", "Yoga");

    return recs.length > 0 ? recs : ["General Physical Education"];
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    const current = { ...(assessments[id] || store.data.fitness?.[id] || {}) };
    setIsSaving(id);
    
    // Core Score Calculations
    const speedVal = 100 - (parseFloat(current.run50m) * 5); 
    const shuttleVal = 100 - (parseFloat(current.shuttleRun) * 4);
    const flexVal = (parseFloat(current.sitAndReach) || 0) * 3;
    
    const staminaParts = (current.run600m || "0:0").split(':');
    const staminaSeconds = (parseInt(staminaParts[0]) * 60 + parseInt(staminaParts[1])) || 0;
    const enduranceScore = staminaSeconds > 0 ? Math.max(0, 100 - (staminaSeconds / 3)) : 0;
    
    const strengthScore = (parseFloat(current.sitUps) || 0) * 2;
    
    current.speedScore = Math.min(100, Math.max(0, speedVal)).toFixed(0);
    current.enduranceScore = Math.min(100, Math.max(0, enduranceScore)).toFixed(0);
    current.strengthScore = Math.min(100, Math.max(0, strengthScore)).toFixed(0);
    current.agilityScore = Math.min(100, Math.max(0, shuttleVal)).toFixed(0);
    current.flexScore = Math.min(100, Math.max(0, flexVal)).toFixed(0);

    const avgScore = (
      parseFloat(current.speedScore || '0') + 
      parseFloat(current.enduranceScore || '0') + 
      parseFloat(current.strengthScore || '0') +
      parseFloat(current.agilityScore || '0') + 
      parseFloat(current.flexScore || '0')
    ) / 5;
    
    current.score = Math.round(avgScore).toString();
    current.status = avgScore >= 85 ? 'Elite' : avgScore >= 70 ? 'Optimal' : avgScore >= 50 ? 'Developing' : 'Priority';
    current.recommendedSports = calculateRecommendations(current);

    store.setFitness(id, current);
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 1000);
    setIsSaving(null);
    toast({ title: "Metrics Archived", description: `${player.name}'s institutional profile updated.` });
  };

  const handleAiAnalysis = async (player: any) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "AI analysis requires internet.", variant: "destructive" });
      return;
    }

    const fit = assessments[player.id] || store.data.fitness?.[player.id] || {};
    if (!fit.score || fit.score === "0") {
      toast({ title: "No Data", description: "Please enter fitness scores first.", variant: "destructive" });
      return;
    }

    setAnalyzingPlayer(player);
    setAiLoading(true);
    setAiModalOpen(true);
    setSelectedAnalysis(null);

    try {
      const result = await analyzeFitness({
        age: player.age,
        gender: player.gender,
        testName: "Full Athletic Assessment",
        score: fit.score,
        language: "English"
      });
      setSelectedAnalysis(result);
      
      const instr = await getTestInstructions({
        testName: "Sit and Reach",
        language: "English"
      });
      setActiveInstruction(instr);
    } catch (error: any) {
      console.error(error);
      toast({ title: "AI Sync Error", description: "Demand spike or network failure.", variant: "destructive" });
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => {
    const categoryLabel = categories.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>Institutional Physical Performance Registry</title>
          <style>
            @media print { 
              @page { size: landscape; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; color: #111; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 4px double #333; padding-bottom: 10px; text-align: center; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 20px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #111; padding: 6px; text-align: center; }
            th { background: #f1f5f9; font-weight: 900; }
            .meta { font-weight: bold; margin-bottom: 15px; display: flex; justify-content: space-between; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
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
          <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
          <div class="report-type">PHYSICAL EXCELLENCE REGISTRY & PERFORMANCE SNAPSHOT</div>
          <div class="meta"><span>CATEGORY: ${categoryLabel.toUpperCase()}</span><span>DATE: ${format(new Date(), 'PP')}</span></div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>NAME</th>
                <th>STD</th>
                <th>10x6 SHUTTLE</th>
                <th>SIT & REACH</th>
                <th>SPEED (50m)</th>
                <th>STAMINA (600m)</th>
                <th>CORE (Situps)</th>
                <th>SCORE %</th>
                <th>RECS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness?.[p.id] || {};
                const recs = fit.recommendedSports ? fit.recommendedSports.join(', ') : 'Pending';
                return `<tr><td>${p.serialNumber || '-'}</td><td style="text-align:left;"><strong>${p.name.toUpperCase()}</strong></td><td>${p.std}</td><td>${fit.shuttleRun || '-'}s</td><td>${fit.sitAndReach || '-'}cm</td><td>${fit.run50m || '-'}s</td><td>${fit.run600m || '-'}</td><td>${fit.sitUps || '-'}</td><td>${fit.score || '0'}%</td><td>${recs}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!store.isLoaded) return <TableSkeleton rows={12} cols={10} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={cn(
              "h-10 rounded-xl px-5 text-[10px] font-black uppercase transition-all whitespace-nowrap",
              activeCategory === cat.id ? 'bg-primary text-white shadow-lg scale-105' : 'text-muted-foreground hover:bg-white hover:text-primary'
            )}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
            <Flame className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1.5 mt-0.5 tracking-widest">
              <Calendar className="w-3.5 h-3.5" /> Performance Registry &bull; {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-black uppercase text-[9px] px-4 h-10 hidden lg:flex items-center gap-2 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-accent" /> Monthly Registry Archive
          </Badge>
          <Button onClick={handlePrint} size="sm" className="font-black h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl active-scale transition-all">
            <Printer className="w-4 h-4 mr-2" /> Export Performance Sheet
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-20">
              <TableRow className="h-16">
                <TableHead className="border-r px-6 font-black text-[11px] uppercase w-[200px] sticky left-0 bg-slate-50/95 backdrop-blur z-30">Athlete Profile</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[90px] text-cyan-600">10x6 Shuttle</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[90px] text-purple-600">Sit & Reach</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[90px] text-accent">Speed (50m)</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[100px] text-primary">Stamina (600m)</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[100px] text-emerald-600">Core (Situps)</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[110px] bg-primary/5">Institutional Score</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[150px]">Best Sport Fit</TableHead>
                <TableHead className="px-6 font-black text-[10px] uppercase text-right w-[120px] sticky right-0 bg-slate-50/95 backdrop-blur z-30">Archive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow><TableCell colSpan={15} className="text-center py-32 text-muted-foreground font-black uppercase tracking-widest opacity-20">No matching registry entries.</TableCell></TableRow>
              ) : (
                filteredPlayers.map((player: any) => {
                  const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                  const isPulse = lastSavedId === player.id;
                  
                  return (
                    <TableRow key={player.id} className={cn("border-b even:bg-muted/10 hover:bg-primary/5 transition-all h-16 group", isPulse && "animate-success-pulse")}>
                      <TableCell className="border-r p-4 text-xs font-black sticky left-0 bg-white z-10 group-hover:bg-transparent">
                        <div className="flex flex-col">
                          <span className="text-primary uppercase text-sm truncate w-[140px]">{player.name}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Std {player.std} &bull; Age {player.age}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="border-r p-0"><Input type="number" step="0.1" placeholder="s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none" value={current.shuttleRun || ''} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                      <TableCell className="border-r p-0"><Input type="number" placeholder="cm" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none" value={current.sitAndReach || ''} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                      <TableCell className="border-r p-0"><Input type="number" step="0.1" placeholder="s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none" value={current.run50m || ''} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                      <TableCell className="border-r p-0"><Input placeholder="m:s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none" value={current.run600m || ''} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                      <TableCell className="border-r p-0"><Input type="number" placeholder="reps" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none" value={current.sitUps || ''} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>

                      <TableCell className="border-r p-2 text-center bg-primary/5">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-lg font-black text-primary">{current.score || '0'}%</span>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase px-2 py-0 rounded-md shadow-sm",
                            current.status === 'Elite' ? 'bg-emerald-500 text-white' : 
                            current.status === 'Optimal' ? 'bg-primary text-white' : 
                            current.status === 'Developing' ? 'bg-accent text-white' : 
                            'bg-destructive text-white'
                          )}>
                            {current.status || 'PENDING'}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="border-r p-2 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {current.recommendedSports?.slice(0, 2).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[7px] font-black uppercase border-accent/20 text-accent px-1.5 py-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="p-0 text-right sticky right-0 bg-white z-10 group-hover:bg-transparent px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-12 w-12 text-primary hover:bg-primary hover:text-white rounded-2xl shadow-sm transition-all" onClick={() => handleSave(player)} disabled={isSaving === player.id}>
                            {isSaving === player.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 text-accent hover:bg-accent hover:text-white rounded-2xl shadow-sm transition-all" onClick={() => handleAiAnalysis(player)}>
                            <BrainCircuit className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary p-10 text-white relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                <BrainCircuit className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black uppercase tracking-tight">AI Coach Analysis</DialogTitle>
                <DialogDescription className="font-bold text-white/70 uppercase text-[10px] tracking-[0.3em]">
                  Registry evaluation for: {analyzingPlayer?.name}
                </DialogDescription>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
          </DialogHeader>

          <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {aiLoading ? (
              <div className="py-24 text-center space-y-8">
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto opacity-20" />
                <div className="space-y-2">
                   <p className="text-lg font-black uppercase tracking-[0.2em] text-primary animate-pulse">Analyzing Metrics...</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Consulting institutional standards</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                    <Target className="w-4 h-4 text-accent" /> Institutional Protocol
                  </h4>
                  <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-dashed border-primary/10 text-sm font-medium leading-relaxed italic text-primary/80 shadow-inner">
                    &quot;{activeInstruction}&quot;
                  </div>
                </div>

                {selectedAnalysis && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex items-center justify-between border-b-2 border-primary/5 pb-4">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4 text-accent" /> Personalized Strategy
                      </h4>
                      <Badge className={cn(
                        "font-black uppercase text-[10px] px-6 py-1.5 rounded-full shadow-lg",
                        selectedAnalysis.status === 'Excellent' ? "bg-emerald-500 text-white" : 
                        selectedAnalysis.status === 'Average' ? "bg-accent text-white" : 
                        "bg-destructive text-white"
                      )}>
                        {selectedAnalysis.status} LEVEL
                      </Badge>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group">
                      <div className="flex gap-6 relative z-10">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5 group-hover:scale-110 transition-transform">
                          <Activity className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-base font-medium text-foreground/80 leading-relaxed pt-2">
                          {selectedAnalysis.feedback}
                        </p>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-10 bg-slate-50 border-t flex items-center justify-center">
            <button 
              onClick={() => setAiModalOpen(false)}
              className="w-full md:w-80 h-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active-scale"
            >
              Back to Performance Hub
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
