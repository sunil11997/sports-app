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
  CloudSync,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
        const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (p.generalRegisterNumber || "").includes(searchTerm);
        return matchesSection && matchesTab && matchesSearch;
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory, searchTerm]);

  const handleAutoSave = async (playerId: string) => {
    const id = playerId;
    const current = { ...(assessments[id] || store.data.fitness?.[id] || {}) };
    const player = store.data.players.find((p: any) => p.id === id);
    if (!player) return;

    setIsSaving(id);
    
    // Core Institutional Calculations
    const speedVal = 100 - (parseFloat(current.run50m) * 5); 
    const shuttleVal = 100 - (parseFloat(current.shuttleRun) * 4);
    const flexVal = (parseFloat(current.sitAndReach) || 0) * 3;
    const jumpVal = (parseFloat(current.boardJump) || 0) * 0.4;
    
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
      parseFloat(current.flexScore || '0') +
      Math.min(100, jumpVal)
    ) / 6;
    
    current.score = Math.round(avgScore).toString();
    current.status = avgScore >= 85 ? 'Elite' : avgScore >= 70 ? 'Optimal' : avgScore >= 50 ? 'Developing' : 'Priority';

    await store.setFitness(id, current);
    
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || store.data.fitness?.[id] || {}),
        [field]: value
      }
    }));
  };

  const handlePrint = () => {
    const isM = localMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? 'शारीरिक गुणवत्ता नोंदणी आणि कामगिरी अहवाल' 
      : 'Physical Excellence Registry & Performance Snapshot';
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
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print" style="position:fixed; top:0; left:0; right:0; background:#1e3a8a; padding:10px; text-align:center; z-index:1000;">
             <button onclick="window.print()" style="background:#f59e0b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:900; cursor:pointer;">${isM ? 'प्रिंट करा' : 'Print Report'}</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">${reportTitle}</div>
          <div class="meta"><span>CATEGORY: ${categoryLabel.toUpperCase()}</span><span>DATE: ${format(new Date(), 'PP')}</span></div>
          <table>
            <thead>
              <tr>
                <th>${isM ? 'अनु. क्र.' : 'SNR'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव' : 'NAME'}</th>
                <th>${isM ? 'इयत्ता' : 'STD'}</th>
                <th>10x6 SHUTTLE</th>
                <th>SIT & REACH</th>
                <th>STANDUP JUMP</th>
                <th>SPEED (50m)</th>
                <th>STAMINA (600m)</th>
                <th>CORE (Situps)</th>
                <th>${isM ? 'गुण' : 'SCORE'} %</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness?.[p.id] || {};
                const name = isM ? (p.nameMarathi || p.name) : p.name;
                return `<tr><td>${p.serialNumber || '-'}</td><td style="text-align:left;"><strong>${name.toUpperCase()}</strong></td><td>${p.std}</td><td>${fit.shuttleRun || '-'}s</td><td>${fit.sitAndReach || '-'}cm</td><td>${fit.boardJump || '-'}cm</td><td>${fit.run50m || '-'}s</td><td>${fit.run600m || '-'}</td><td>${fit.sitUps || '-'}</td><td>${fit.score || '0'}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
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

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border-2 shadow-xl">
        <div className="flex flex-wrap items-center gap-8 flex-1">
          <div className="flex bg-muted/40 p-1.5 rounded-2xl border">
            <Button variant={!localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(false)} className="h-9 px-4 text-[10px] font-black uppercase rounded-xl">English</Button>
            <Button variant={localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(true)} className="h-9 px-4 text-[10px] font-black uppercase rounded-xl">मराठी</Button>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-accent/10 rounded-[1.5rem] flex items-center justify-center border-2 border-accent/20">
              <Flame className="w-9 h-9 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1.5 mt-1 tracking-[0.2em]">
                <Calendar className="w-3.5 h-3.5" /> Registry Pulse &bull; {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Find athlete by Name or GR..." 
              className="pl-12 h-14 rounded-2xl border-2 font-bold shadow-inner bg-muted/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
            {isOnline ? <CloudSync className="w-5 h-5 text-emerald-500 animate-spin" /> : <WifiOff className="w-5 h-5 text-destructive" />}
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{isOnline ? 'Cloud Sync Active' : 'Offline Mode'}</span>
          </div>
          <Button onClick={handlePrint} size="sm" className="font-black h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-2xl active-scale transition-all">
            <Printer className="w-5 h-5 mr-2" /> Export Performance Sheet
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-3xl">
        <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-20">
              <TableRow className="h-16">
                <TableHead className="border-r px-8 font-black text-[12px] uppercase w-[220px] sticky left-0 bg-slate-50/95 backdrop-blur z-30">Athlete Profile</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[100px] text-cyan-600">10x6 Shuttle</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[100px] text-purple-600">Sit & Reach</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[110px] text-orange-600 font-black">Standup Jump</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[100px] text-rose-600">Speed (50m)</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[110px] text-primary">Stamina (600m)</TableHead>
                <TableHead className="border-r px-4 font-black text-[10px] uppercase text-center w-[110px] text-emerald-600">Core (Situps)</TableHead>
                <TableHead className="px-6 font-black text-[12px] uppercase text-center w-[130px] bg-primary/5">Excellence Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-32 font-black uppercase tracking-widest opacity-20">No matching registry entries.</TableCell></TableRow>
              ) : filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                const isPulse = lastSavedId === player.id;
                const isSyncingRow = isSaving === player.id;
                
                return (
                  <TableRow key={player.id} className={cn("border-b even:bg-muted/5 hover:bg-primary/5 transition-all h-16 group relative", isPulse && "bg-emerald-50/30 animate-success-pulse")}>
                    <TableCell className="border-r p-6 text-xs font-black sticky left-0 bg-white z-10 group-hover:bg-transparent">
                      <div className="flex flex-col">
                        <span className="text-primary uppercase text-sm truncate w-[160px] flex items-center gap-2">
                          {localMarathiView ? (player.nameMarathi || player.name) : player.name}
                          {isSyncingRow && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Std {player.std} &bull; GR: {player.generalRegisterNumber || '---'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-0"><Input type="number" step="0.1" placeholder="s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none transition-colors" value={current.shuttleRun || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="cm" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none transition-colors" value={current.sitAndReach || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="cm" className="h-16 text-center text-sm font-black border-0 bg-accent/5 focus:bg-white rounded-none transition-colors" value={current.boardJump || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" step="0.1" placeholder="s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none transition-colors" value={current.run50m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input placeholder="m:s" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none transition-colors" value={current.run600m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="reps" className="h-16 text-center text-sm font-black border-0 bg-transparent focus:bg-white rounded-none transition-colors" value={current.sitUps || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                    <TableCell className="p-4 text-center bg-primary/5">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xl font-black text-primary leading-none">{current.score || '0'}%</span>
                        <Badge className={cn(
                          "text-[8px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm",
                          current.status === 'Elite' ? "bg-emerald-600 text-white" : "bg-primary text-white"
                        )}>
                          {current.status || 'PENDING'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="flex items-center justify-center gap-4 py-8 opacity-40">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">All changes are automatically archived to the WGB Institutional Vault</p>
      </div>
    </div>
  );
}
