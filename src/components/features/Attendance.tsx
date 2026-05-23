"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { usePWA } from "@/components/providers/pwa-provider";

import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Sun,
  Moon,
  WifiOff,
  Gauge,
  ClipboardCheck,
  ChevronDown
} from "lucide-react";
import { TrainingLoad } from './TrainingLoad';

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

export function Attendance({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSession, setActiveSession] = useState<'Morning' | 'Evening'>('Morning');
  const [showFatigueReport, setShowFatigueReport] = useState(false);
  const { isOnline } = usePWA();

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
  }, []);

  const monthStart = useMemo(() => currentDate ? startOfMonth(currentDate) : null, [currentDate]);
  const monthEnd = useMemo(() => currentDate ? endOfMonth(currentDate) : null, [currentDate]);
  const days = useMemo(() => {
    if (isMounted && monthStart && monthEnd) {
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    return [];
  }, [isMounted, monthStart, monthEnd]);

  const isGeneral = section === 'general';
  const categories = useMemo(() => isGeneral ? GENERAL_CATEGORIES : SPORTS_CATEGORIES, [isGeneral]);

  const getPlayerCategory = useCallback((p: any) => {
    if (isGeneral) return p.std;
    const age = parseInt(p.age) || 0;
    const genderPart = p.gender === 'Female' ? 'girls' : 'boys';
    let agePart = 'senior';
    if (age < 14) agePart = 'u14';
    else if (age < 17) agePart = 'u17';
    return `${genderPart}-${agePart}`;
  }, [isGeneral]);

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
        if (a.gender !== b.gender) {
          return a.gender === 'Female' ? -1 : 1;
        }
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory]);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}_${activeSession}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? null : 'P';
    store.setAttendance({ [key]: nextStatus });
  };

  const handlePrint = () => {
    if (!currentDate) return;
    const categoryLabel = categories.find(c => c.id === activeCategory)?.label || "All";
    const sessionLabel = activeSession === 'Morning' ? 'Morning' : 'Evening';
    const printContent = `
      <html>
        <head>
          <title>Attendance Report - ${format(currentDate, 'MMMM yyyy')}</title>
          <style>
            @media print { 
              @page { size: A4 landscape; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; color: #111; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 2px solid #333; margin-bottom: 10px; }
            .meta { font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <h1>Attendance (${section.toUpperCase()}): ${format(currentDate, 'MMMM yyyy')}</h1>
          <div class="meta">Category: ${categoryLabel.toUpperCase()} | Session: ${sessionLabel.toUpperCase()}</div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>STUDENT</th>
                <th>STD</th>
                <th>GEN</th>
                ${days.map(d => `<th>${format(d, 'd')}</th>`).join('')}
                <th>TOT</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                let total = 0;
                const row = days.map(d => {
                  const s = store.data.attendance[`${p.id}_${format(d, 'yyyy-MM-dd')}_${activeSession}`];
                  if (s === 'P') total++;
                  return `<td>${s || '-'}</td>`;
                }).join('');
                return `<tr><td>${p.serialNumber || ''}</td><td class="name-cell">${p.name}</td><td>${p.std}</td><td>${p.gender[0]}</td>${row}<td>${total}</td></tr>`;
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

  if (!isMounted || !store.isLoaded) {
    return <TableSkeleton rows={15} cols={10} />;
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {!isOnline && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-900 uppercase">Offline Mode Active</p>
              <p className="text-[10px] font-bold text-amber-700 uppercase mt-1">Attendance will sync when internet returns</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto flex-1">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded px-3 text-[10px] font-black uppercase transition-all",
                activeCategory === cat.id ? 'bg-primary text-white' : 'text-muted-foreground'
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        
        <div className="bg-muted/50 p-1 rounded-lg border flex items-center gap-1 min-w-fit">
           <Button 
             variant={activeSession === 'Morning' ? "default" : "ghost"}
             size="sm"
             onClick={() => setActiveSession('Morning')}
             className={cn(
               "h-8 rounded px-4 text-[10px] font-black uppercase flex items-center gap-2",
               activeSession === 'Morning' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
             )}
           >
             <Sun className="w-3.5 h-3.5" /> Morning
           </Button>
           <Button 
             variant={activeSession === 'Evening' ? "default" : "ghost"}
             size="sm"
             onClick={() => setActiveSession('Evening')}
             className={cn(
               "h-8 rounded px-4 text-[10px] font-black uppercase flex items-center gap-2",
               activeSession === 'Evening' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
             )}
           >
             <Moon className="w-3.5 h-3.5" /> Evening
           </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Monthly Presence Log</h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-2">
            Session: <span className="text-primary">{activeSession}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-black text-primary uppercase text-[11px] min-w-[120px] text-center">
              {currentDate ? format(currentDate, 'MMMM yyyy') : 'Loading...'}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9 bg-primary text-white">
            <Printer className="w-4 h-4 mr-2" /> Print Sheet
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase sticky left-0 bg-muted/50 z-30 min-w-[180px]">Student Name</TableHead>
              {days.map(day => (
                <TableHead key={day.toString()} className="border-r h-9 px-1 font-black text-[10px] uppercase text-center w-[30px]">
                  {format(day, 'd')}
                </TableHead>
              ))}
              <TableHead className="h-9 px-2 font-black text-[10px] uppercase text-center w-[50px]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow><TableCell colSpan={days.length + 2} className="text-center py-8">No records found.</TableCell></TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                let monthlyTotal = 0;
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 h-10">
                    <TableCell className="border-r p-2 text-xs font-bold sticky left-0 bg-white z-10 truncate w-[180px]">
                      {player.name.toUpperCase()}
                    </TableCell>
                    {days.map(day => {
                      const key = `${player.id}_${format(day, 'yyyy-MM-dd')}_${activeSession}`;
                      const status = store.data.attendance[key];
                      if (status === 'P') monthlyTotal++;
                      
                      return (
                        <TableCell 
                          key={day.toString()} 
                          className="border-r p-0 text-center cursor-pointer"
                          onClick={() => handleToggle(player.id, day)}
                        >
                          <div className={cn(
                            "w-full h-10 flex items-center justify-center text-[10px] font-black",
                            status === 'P' ? "bg-primary text-white" : 
                            status === 'A' ? "bg-destructive text-white" : 
                            'text-muted-foreground/20'
                          )}>
                            {status || '-'}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="p-2 text-center font-black text-primary text-xs bg-primary/5">{monthlyTotal}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-8">
        <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
          <div 
            onClick={() => setShowFatigueReport(!showFatigueReport)}
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-all border-b group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary uppercase tracking-tight">End-of-Session Fatigue Report</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5 tracking-widest">Post-training Exertion & Load Archival</p>
              </div>
            </div>
            <div className={cn("transition-transform duration-300", showFatigueReport ? "rotate-180" : "")}>
              <ChevronDown className="w-6 h-6 text-primary/30 group-hover:text-primary" />
            </div>
          </div>
          
          {showFatigueReport && (
            <div className="p-8 animate-in slide-in-from-top-4 duration-500">
               <TrainingLoad store={store} />
               <div className="mt-8 flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10">
                  <ClipboardCheck className="w-5 h-5 text-primary opacity-40" />
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Load metrics will be archived in the individual Athlete Performance Dossier.</p>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
