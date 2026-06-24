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
  Calendar, 
  Flame,
  Search,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, shareToWhatsApp } from '@/lib/utils';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
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
        const query = searchTerm.toLowerCase();
        return matchesSection && matchesTab && (p.name.toLowerCase().includes(query) || (p.generalRegisterNumber || "").includes(searchTerm));
      })
      .sort((a: any, b: any) => (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0));
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory, searchTerm]);

  const handleAutoSave = async (playerId: string) => {
    const id = playerId;
    const current = { ...(assessments[id] || store.data.fitness?.[id] || {}) };
    setIsSaving(id);
    
    // Performance Matrix Calculation
    const speedVal = 100 - (parseFloat(current.run50m || '0') * 5); 
    const shuttleVal = 100 - (parseFloat(current.shuttleRun || '0') * 4);
    const jumpVal = (parseFloat(current.boardJump || '0') || 0) * 0.4;
    
    const avgScore = (Math.max(0, speedVal) + Math.max(0, shuttleVal) + Math.min(100, jumpVal)) / 3;
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
      reportType: "शारीरिक चाचणी (Fitness)",
      reportData: `स्कोअर: ${fit.score || '0'}%\nस्टेटस: ${fit.status || 'Pending'}\nगती: ${fit.run50m || '-'}s\nउडी: ${fit.boardJump || '-'}cm`
    });
  };

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({ ...prev, [id]: { ...(prev[id] || store.data.fitness?.[id] || {}), [field]: value } }));
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={6} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border shadow-xl">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-16 h-16 bg-accent/10 rounded-[1.5rem] flex items-center justify-center border-2 border-accent/20">
            <Flame className="w-9 h-9 text-accent animate-pulse" />
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Find athlete..." className="pl-12 h-14 rounded-2xl border-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      <div className="border rounded-[3rem] overflow-hidden bg-white shadow-2xl overflow-x-auto scrollbar-hide">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-20">
              <TableRow className="h-16">
                <TableHead className="px-8 font-black uppercase w-[220px] sticky left-0 bg-slate-50 z-30">Athlete Profile</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[120px]">10x6 Shuttle</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[120px]">Standup Jump</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[120px]">Speed (50m)</TableHead>
                <TableHead className="px-6 font-black uppercase text-center w-[130px] bg-primary/5">Score %</TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[80px]">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                const isPulse = lastSavedId === player.id;
                return (
                  <TableRow key={player.id} className={cn("border-b h-16 transition-all", isPulse && "bg-emerald-50 animate-success-pulse")}>
                    <TableCell className="px-8 font-black sticky left-0 bg-white z-10">
                      <div className="flex flex-col truncate w-[160px]">
                        <span className="text-primary uppercase text-sm">{localMarathiView ? (player.nameMarathi || player.name) : player.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Std {player.std}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent" value={current.shuttleRun || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-16 text-center border-0 bg-accent/5 font-black" value={current.boardJump || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-16 text-center border-0 bg-transparent" value={current.run50m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="p-4 text-center bg-primary/5">
                      <span className="text-xl font-black text-primary">{current.score || '0'}%</span>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(player)} disabled={!player.mobileNumber} className="text-emerald-600 hover:bg-emerald-50">
                        <MessageSquare className="w-5 h-5" />
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
