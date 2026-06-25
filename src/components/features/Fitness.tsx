"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Printer, 
  Loader2, 
  Flame,
  Search,
  RefreshCw,
  WifiOff,
  MessageSquare,
  Trophy,
  Zap,
  Timer,
  Ruler
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, shareToWhatsApp } from '@/lib/utils';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { usePWA } from '@/components/providers/pwa-provider';

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `Std ${i + 1}` 
  }))
];

export function Fitness({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [localMarathiView, setLocalMarathiView] = useState(language === 'Marathi');

  useEffect(() => {
    setLocalMarathiView(language === 'Marathi');
  }, [language]);

  const isGeneral = section === 'general';
  const categories = GENERAL_CATEGORIES;

  const getPlayerCategory = useCallback((p: any) => {
    if (!p) return 'all';
    return p.std;
  }, []);

  const filteredPlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        const query = searchTerm.toLowerCase();
        return matchesSection && matchesTab && (p.name.toLowerCase().includes(query) || (p.generalRegisterNumber || "").includes(searchTerm));
      })
      .sort((a: any, b: any) => (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0));
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory, searchTerm]);

  const handleAutoSave = async (playerId: string) => {
    const id = playerId;
    const current = { ...(assessments[id] || store.data.fitness?.[id] || {}) };
    setIsSaving(id);
    
    // Performance Matrix Calculation for All Core Tests
    const shuttleVal = 100 - (parseFloat(current.shuttleRun || '0') * 4);
    const jumpVal = (parseFloat(current.boardJump || '0') || 0) * 0.4;
    const speedVal = 100 - (parseFloat(current.run50m || '0') * 5); 
    const enduranceVal = 100 - (parseFloat(current.run600m || '0') * 0.5);
    const flexVal = (parseFloat(current.sitAndReach || '0') || 0) * 2;
    const coreVal = (parseFloat(current.sitUps || '0') || 0) * 2;
    
    const validMetrics = [shuttleVal, jumpVal, speedVal, enduranceVal, flexVal, coreVal]
      .map(v => Math.max(0, Math.min(100, v)))
      .filter(v => v > 0);

    const avgScore = validMetrics.length > 0 
      ? validMetrics.reduce((a, b) => a + b, 0) / validMetrics.length 
      : 0;

    current.score = Math.round(avgScore).toString();
    current.status = avgScore >= 80 ? 'Elite' : avgScore >= 60 ? 'Optimal' : 'Developing';

    await store.setFitness(id, { ...current, playerId: id, month: format(new Date(), 'yyyy-MM') });
    
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handleWhatsAppShare = (player: any) => {
    const fit = store.data.fitness?.[player.id] || {};
    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: store.data.schoolProfile.schoolName,
      teacherName: store.data.schoolProfile.teacherName,
      studentName: localMarathiView ? (player.nameMarathi || player.name) : player.name,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: player.height || "---",
      weight: player.weight || "---",
      reportType: "शारीरिक चाचणी (Fitness Hub)",
      reportData: `स्कोअर: ${fit.score || '0'}%\nस्टेटस: ${fit.status || 'Pending'}`
    });
  };

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({ ...prev, [id]: { ...(prev[id] || store.data.fitness?.[id] || {}), [field]: value } }));
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border shadow-xl">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-16 h-16 bg-accent/10 rounded-[1.5rem] flex items-center justify-center border-2 border-accent/20">
            <Flame className="w-9 h-9 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Exhaustive Physical Evaluation Registry</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/5 text-primary border-primary/10 px-4 h-12 flex items-center gap-2">
            {isOnline ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" /> : <WifiOff className="w-4 h-4 text-destructive" />}
            {isOnline ? 'Cloud Sync' : 'Offline'}
          </Badge>
          <Button onClick={() => window.print()} className="h-14 px-8 bg-primary rounded-2xl font-black uppercase"><Printer className="w-5 h-5 mr-2" /> Print Sheet</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted/40 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-9 rounded-xl px-5 text-[10px] font-black uppercase transition-all whitespace-nowrap",
              activeCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white'
            )}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="border rounded-[3rem] overflow-hidden bg-white shadow-2xl overflow-x-auto scrollbar-hide">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-20">
              <TableRow className="h-16">
                <TableHead className="px-8 font-black uppercase w-[200px] sticky left-0 bg-slate-50 z-30">Athlete</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Zap className="w-3 h-3 mx-auto mb-1" />10x6 Shuttle</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Trophy className="w-3 h-3 mx-auto mb-1" />Board Jump</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Timer className="w-3 h-3 mx-auto mb-1" />50m Speed</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Activity className="w-3 h-3 mx-auto mb-1" />600m Run</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Ruler className="w-3 h-3 mx-auto mb-1" />Sit & Reach</TableHead>
                <TableHead className="px-2 font-black text-[8px] uppercase text-center w-[90px]"><Zap className="w-3 h-3 mx-auto mb-1" />Sit-Ups</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[110px] bg-primary/5">Score %</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[60px]">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                const isPulse = lastSavedId === player.id;
                return (
                  <TableRow key={player.id} className={cn("border-b h-16 transition-all", isPulse && "bg-emerald-50 animate-success-pulse")}>
                    <TableCell className="px-8 font-black sticky left-0 bg-white z-10 uppercase text-[10px]">
                      {localMarathiView ? (player.nameMarathi || player.name) : player.name}
                    </TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent text-xs" value={current.shuttleRun || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-16 text-center border-0 bg-transparent text-xs" value={current.boardJump || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent text-xs" value={current.run50m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent text-xs" value={current.run600m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent text-xs" value={current.sitAndReach || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-16 text-center border-0 bg-transparent text-xs" value={current.sitUps || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                    <TableCell className="p-4 text-center bg-primary/5">
                      <span className="text-lg font-black text-primary">{current.score || '0'}%</span>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(player)} disabled={!player.mobileNumber} className="text-emerald-600 hover:bg-emerald-50">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
