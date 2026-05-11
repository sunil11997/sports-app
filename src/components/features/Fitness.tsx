"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Printer, 
  Scale, 
  Save, 
  Loader2, 
  Calendar, 
  ShieldAlert, 
  BrainCircuit, 
  Info,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  Dumbbell
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

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

export function Fitness({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FitnessAnalysisOutput | null>(null);
  const [activeInstruction, setActiveInstruction] = useState<string>("");
  const [analyzingPlayer, setAnalyzingPlayer] = useState<any>(null);

  const isGeneral = section === 'general';

  const getPlayerCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const genderPart = p.gender === 'Female' ? 'girls' : 'boys';
    let agePart = 'senior';
    if (age < 14) agePart = 'u14';
    else if (age < 17) agePart = 'u17';
    return `${genderPart}-${agePart}`;
  };

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        return matchesSection && matchesTab;
      })
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory]);

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || store.data.fitness[id] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    const current = { ...(assessments[id] || store.data.fitness[id] || {}) };
    setIsSaving(id);
    
    // Auto-calculate score
    const fields = ['shuttleRun', 'run50m', 'sitAndReach', 'boardJump', 'sitUps'];
    let sum = 0;
    let count = 0;
    fields.forEach(f => {
      const val = parseFloat(current[f]);
      if (!isNaN(val)) { sum += Math.min(100, val); count++; }
    });
    const scoreNum = count > 0 ? Math.round(sum / count) : 0;
    current.score = scoreNum.toString();
    current.status = scoreNum >= 85 ? 'Level A (Elite)' : scoreNum >= 70 ? 'Level B' : scoreNum >= 50 ? 'Level C' : 'Level D';

    store.setFitness(id, current);
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 1000);
    setIsSaving(null);
    toast({ title: "Instant Sync Complete", description: "Record archived." });
  };

  const handleAiAnalysis = async (player: any) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "AI analysis requires internet connection.", variant: "destructive" });
      return;
    }

    const fit = assessments[player.id] || store.data.fitness[player.id] || {};
    if (!fit.score || fit.score === "0") {
      toast({ title: "No Data", description: "Please enter fitness scores before analysis.", variant: "destructive" });
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
        testName: "Overall Performance",
        score: fit.score,
        language: "English"
      });
      setSelectedAnalysis(result);
      
      const instr = await getTestInstructions({
        testName: "Beep Test",
        language: "English"
      });
      setActiveInstruction(instr);
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate analysis.", variant: "destructive" });
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => {
    const categoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>Institutional Performance Registry</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; }
            h1 { color: #221d1d; text-transform: uppercase; border-bottom: 2px solid #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Performance Registry: ${categoryLabel}</h1>
          <table>
            <thead>
              <tr><th>SNR</th><th>NAME</th><th>STD</th><th>GENDER</th><th>SCORE</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `<tr><td>${p.serialNumber || ''}</td><td>${p.name}</td><td>${p.std}</td><td>${p.gender}</td><td>${fit.score || '0'}%</td><td>${fit.status || 'Pending'}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  if (!store.isLoaded) return <TableSkeleton rows={12} cols={10} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={cn(
              "h-8 rounded px-3 text-[10px] font-black uppercase transition-all",
              activeCategory === cat.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white border-2 border-primary/20 text-primary font-black uppercase text-[9px] px-3 h-9 hidden md:flex items-center gap-2">
            <BrainCircuit className="w-3 h-3" /> AI Expert Ready
          </Badge>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9 bg-primary hover:bg-primary/90 text-white">
            <Printer className="w-4 h-4 mr-2" /> Print Sheet
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-10 px-4 font-black text-[11px] uppercase w-[180px] sticky left-0 bg-muted/95 z-30">Athlete</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">10x6 (s)</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">50M (s)</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[75px]">600M (m:s)</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Reach (cm)</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Jump (cm)</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Situps</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[120px] bg-primary/5">Final Status</TableHead>
              <TableHead className="h-10 px-2 font-black text-[10px] uppercase text-right w-[100px] sticky right-0 bg-muted/95 z-30">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow><TableCell colSpan={15} className="text-center py-12 text-muted-foreground font-bold uppercase tracking-widest opacity-30">No records found.</TableCell></TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness[player.id] || {};
                const isPulse = lastSavedId === player.id;
                
                return (
                  <TableRow key={player.id} className={cn("border-b even:bg-muted/10 hover:bg-primary/5 transition-all h-12", isPulse && "animate-success-pulse")}>
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10">
                      <div className="flex flex-col">
                        <span className="text-primary uppercase truncate w-[120px]">{player.name}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">#{player.serialNumber || '0'} • Std {player.std}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="border-r p-0"><Input type="number" className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.shuttleRun || ''} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.run50m || ''} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.run600m || ''} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.sitAndReach || ''} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.boardJump || ''} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.sitUps || ''} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>

                    <TableCell className="border-r p-1 text-center bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-primary">{current.score || '0'}%</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground truncate w-full px-1">{current.status || 'Pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 text-right sticky right-0 bg-white z-10">
                      <div className="flex items-center h-full">
                        <Button variant="ghost" size="icon" className="h-12 w-10 text-primary" onClick={() => handleSave(player)} disabled={isSaving === player.id}>
                          {isSaving === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-10 text-accent" onClick={() => handleAiAnalysis(player)}>
                          <BrainCircuit className="w-4 h-4" />
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

      {/* AI Analysis Dialog */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary/5 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg text-white">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tight">AI Coach Hub</DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                  Analyzing performance for: {analyzingPlayer?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
            {aiLoading ? (
              <div className="py-20 text-center space-y-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-sm font-black uppercase tracking-widest text-primary/40 animate-pulse">Consulting Sports Scientist...</p>
              </div>
            ) : (
              <>
                {/* 1. Expert Instructions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <Info className="w-4 h-4" /> Test Mastery Guide
                  </h4>
                  <div className="bg-muted/30 p-6 rounded-3xl border-2 border-dashed border-muted text-sm font-medium leading-relaxed italic text-foreground/70">
                    "{activeInstruction}"
                  </div>
                </div>

                {/* 2. Analysis Report */}
                {selectedAnalysis && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" /> Data-Driven Analysis
                      </h4>
                      <Badge className={cn(
                        "font-black uppercase text-[10px] px-4 py-1 rounded-full",
                        selectedAnalysis.status === 'Excellent' ? "bg-emerald-500 text-white" : 
                        selectedAnalysis.status === 'Average' ? "bg-accent text-white" : 
                        "bg-destructive text-white"
                      )}>
                        {selectedAnalysis.status} Result
                      </Badge>
                    </div>

                    <Card className="border-2 rounded-3xl p-6 bg-primary/[0.02]">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                          {selectedAnalysis.feedback}
                        </p>
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-2 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Dumbbell className="w-5 h-5 text-accent" />
                          <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">Coaching Drills</h5>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                          {selectedAnalysis.recommendations}
                        </p>
                      </Card>
                      <Card className="border-2 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Trophy className="w-5 h-5 text-emerald-600" />
                          <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">Sports Benefits</h5>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                          {selectedAnalysis.sportsBenefit}
                        </p>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-8 bg-muted/10 border-t">
            <Button 
              onClick={() => setAiModalOpen(false)}
              className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
            >
              Back to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
