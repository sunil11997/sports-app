
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
  Ruler,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, shareToWhatsApp, getAgeValidation } from '@/lib/utils';
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

  const getPlayerCategory = useCallback((p: any) => {
    if (!p) return 'all';
    return p.std;
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!store.data.players) return [];
    const query = searchTerm.trim().toLowerCase();
    
    return store.data.players
      .filter((p: any) => {
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        if (!matchesTab) return false;

        if (!query) return true;
        const name = (p.name || "").toLowerCase();
        const marathiName = (p.nameMarathi || "").toLowerCase();
        const gr = (p.generalRegisterNumber || "").toLowerCase();
        
        return name.includes(query) || marathiName.includes(query) || gr.includes(query);
      })
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        return (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0);
      });
  }, [store.data.players, activeCategory, getPlayerCategory, searchTerm]);

  const handleAutoSave = async (playerId: string) => {
    const current = { ...(assessments[playerId] || store.data.fitness?.[playerId] || {}) };
    setIsSaving(playerId);
    
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

    await store.setFitness(playerId, { ...current, playerId, month: format(new Date(), 'yyyy-MM') });
    
    setLastSavedId(playerId);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handlePrint = () => {
    const isM = localMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? `विद्यार्थी शारीरिक क्षमता चाचणी अहवाल - ${activeCategory === 'all' ? 'सर्व इयत्ता' : 'इयत्ता ' + activeCategory}`
      : `Student Physical Fitness Registry - ${activeCategory === 'all' ? 'All Classes' : 'Standard ' + activeCategory}`;

    const printContent = `
      <html>
        <head>
          <title>Fitness Registry - ${format(new Date(), 'dd/MM/yyyy')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            @media print { 
              @page { size: landscape; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; font-size: 10px; color: #111; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 18px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-top: 5px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: center; }
            th { background-color: #f2f2f2; font-weight: 900; text-transform: uppercase; font-size: 8px; }
            .name-cell { text-align: left; font-weight: 900; min-width: 150px; text-transform: uppercase; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 12px 25px; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; transition: all 0.2s; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; box-shadow: 0 4px 10px rgba(245,158,11,0.3); }
            .btn:active { scale: 0.95; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'GO BACK'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? 'प्रिंट करा' : 'CONFIRM PRINT'}</button>
          </div>
          <div class="header">
            <div class="school-name">${schoolName}</div>
            <div class="report-type">${reportTitle}</div>
            <div style="font-size: 10px; font-weight: 700; margin-top: 5px;">Date: ${format(new Date(), 'dd MMMM yyyy')} | Registry v5.2 Stable</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>STUDENT NAME</th>
                <th>STD</th>
                <th>10x6 SHUTTLE</th>
                <th>BOARD JUMP</th>
                <th>50m RUN</th>
                <th>600m RUN</th>
                <th>SIT & REACH</th>
                <th>SIT-UPS</th>
                <th>SCORE %</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any, i: number) => {
                const fit = store.data.fitness?.[p.id] || {};
                const dName = isM ? (p.nameMarathi || p.name) : p.name;
                return `
                  <tr>
                    <td>${p.serialNumber || i+1}</td>
                    <td class="name-cell">${dName}</td>
                    <td>${p.std}</td>
                    <td>${fit.shuttleRun || '-'}</td>
                    <td>${fit.boardJump || '-'}</td>
                    <td>${fit.run50m || '-'}</td>
                    <td>${fit.run600m || '-'}</td>
                    <td>${fit.sitAndReach || '-'}</td>
                    <td>${fit.sitUps || '-'}</td>
                    <td><strong>${fit.score || '0'}%</strong></td>
                    <td><strong>${fit.status || 'Active'}</strong></td>
                  </tr>
                `;
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
          <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center border-2 border-accent/20 shadow-inner">
            <Flame className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Registry Engine v5.2 Stable</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-[550px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
            <Input 
              placeholder={localMarathiView ? "नाव किंवा GR ने शोधा..." : "Find Student by Name or GR..."} 
              className="pl-16 h-24 rounded-[1.5rem] border-2 border-primary/10 bg-muted/20 font-black text-2xl shadow-inner focus:bg-white transition-all placeholder:text-muted-foreground/30" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button onClick={handlePrint} className="h-24 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-sm shadow-2xl active-scale transition-all">
            <Printer className="w-8 h-8 mr-3" /> Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-muted/40 rounded-[2rem] border shadow-inner overflow-x-auto scrollbar-hide">
        {GENERAL_CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-11 rounded-xl px-8 text-[11px] font-black uppercase transition-all whitespace-nowrap",
              activeCategory === cat.id ? 'bg-primary text-white shadow-lg scale-105' : 'text-muted-foreground hover:bg-white'
            )}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
        <div className="ml-auto flex items-center px-4">
           <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 h-8 flex items-center gap-2 px-4 rounded-full">
              <RefreshCw className={cn("w-3 h-3", isOnline && "animate-spin")} />
              {isOnline ? 'CLOUD SYNC' : 'OFFLINE MODE'}
           </Badge>
        </div>
      </div>

      <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl relative">
        <div className="overflow-x-auto scrollbar-hide relative max-h-[70vh] overflow-y-auto">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-100 sticky top-0 z-50 shadow-sm border-b">
              <TableRow className="h-20">
                <TableHead className="px-10 font-black uppercase w-[250px] sticky left-0 top-0 bg-slate-200 z-[60] border-r">
                   Student Profile
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Zap className="w-4 h-4 mx-auto mb-2 text-accent" />10x6 Shuttle
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Trophy className="w-4 h-4 mx-auto mb-2 text-amber-500" />Board Jump
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Timer className="w-4 h-4 mx-auto mb-2 text-blue-500" />50m Speed
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Activity className="w-4 h-4 mx-auto mb-2 text-emerald-500" />600m Run
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Ruler className="w-4 h-4 mx-auto mb-2 text-purple-500" />Sit & Reach
                </TableHead>
                <TableHead className="px-2 font-black text-[9px] uppercase text-center w-[110px] sticky top-0 bg-slate-100 z-40 border-r">
                   <Zap className="w-4 h-4 mx-auto mb-2 text-rose-500" />Sit-Ups
                </TableHead>
                <TableHead className="px-6 font-black uppercase text-center w-[130px] bg-primary/10 sticky top-0 z-40 border-r">
                   Fitness %
                </TableHead>
                <TableHead className="px-4 font-black uppercase text-center w-[80px] sticky top-0 bg-slate-100 z-40">
                   Report
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-40 opacity-20 font-black uppercase text-2xl tracking-[0.3em]">No registry entries</TableCell></TableRow>
              ) : filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || store.data.fitness?.[player.id] || {};
                const isPulse = lastSavedId === player.id;
                const isSyncing = isSaving === player.id;
                return (
                  <TableRow key={player.id} className={cn("border-b h-20 transition-all", isPulse && "bg-emerald-50 animate-success-pulse", isSyncing && "bg-muted/50")}>
                    <TableCell className="px-10 font-black sticky left-0 bg-white z-20 uppercase text-xs border-r group-hover:bg-muted/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-primary leading-none truncate max-w-[200px]">{localMarathiView ? (player.nameMarathi || player.name) : player.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Roll #{player.serialNumber || '0'} &bull; Std {player.std}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-20 text-center border-0 bg-transparent text-sm font-black focus:bg-white" value={current.shuttleRun || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-20 text-center border-0 bg-transparent text-sm font-black focus:bg-white" value={current.boardJump || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-20 text-center border-0 bg-transparent text-sm font-black focus:bg-white" value={current.run50m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-20 text-center border-0 bg-transparent focus:bg-white" value={current.run600m || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" step="0.1" className="h-20 text-center border-0 bg-transparent focus:bg-white" value={current.sitAndReach || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r"><Input type="number" className="h-20 text-center border-0 bg-transparent text-sm font-black focus:bg-white" value={current.sitUps || ''} onBlur={() => handleAutoSave(player.id)} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                    <TableCell className="p-6 text-center bg-primary/5 border-r">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-primary leading-none">{current.score || '0'}%</span>
                        <Badge className={cn(
                          "mt-2 text-[8px] font-black uppercase border-0 px-3",
                          current.status === 'Elite' ? "bg-amber-400 text-white" : "bg-emerald-500 text-white"
                        )}>{current.status || 'Active'}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(player)} disabled={!player.mobileNumber} className="text-emerald-600 hover:bg-emerald-50 rounded-full h-12 w-12 shadow-inner border border-transparent hover:border-emerald-100">
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
