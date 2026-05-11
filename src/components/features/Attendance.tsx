"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sun,
  Moon,
  WifiOff,
  RefreshCw,
  CloudSun,
} from "lucide-react";
import { Badge } from '@/components/ui/badge';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSession, setActiveSession] = useState<'Morning' | 'Evening'>('Morning');
  const { isOnline } = usePWA();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = isMounted ? eachDayOfInterval({ start: monthStart, end: monthEnd }) : [];

  const isGeneral = section === 'general';
  const categories = isGeneral ? GENERAL_CATEGORIES : SPORTS_CATEGORIES;

  const getPlayerCategory = (p: any) => {
    if (isGeneral) return p.std;
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
        if (a.gender !== b.gender) {
          return a.gender === 'Female' ? -1 : 1;
        }
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory]);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}_${activeSession}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? null : 'P';
    store.setAttendance({ [key]: nextStatus });
  };

  const handlePrint = () => {
    const categoryLabel = categories.find(c => c.id === activeCategory)?.label || "All";
    const sessionLabel = activeSession === 'Morning' ? 'Morning (सकाळ)' : 'Evening (संध्याकाळ)';
    const printContent = `
      <html>
        <head>
          <title>Attendance Report - ${format(currentDate, 'MMMM yyyy')}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; }
            h1 { color: #235C36; text-transform: uppercase; border-bottom: 2px solid #333; margin-bottom: 10px; }
            .meta { font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body>
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
    win?.print();
  };

  if (!isMounted || !store.isLoaded) {
    return <TableSkeleton rows={15} cols={10} />;
  }

  return (
    <div className="space-y-4">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-900 uppercase leading-none">Offline Mode Active</p>
              <p className="text-[10px] font-bold text-amber-700 uppercase mt-1">Attendance will sync when internet returns</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 font-black">LOCAL SAVE</Badge>
        </div>
      )}

      {/* Sync Status */}
      {store.pendingSyncCount > 0 && isOnline && (
        <div className="bg-primary/5 border-2 border-primary/10 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className={cn("w-5 h-5 text-primary", store.isSyncing && "animate-spin")} />
            <div>
              <p className="text-sm font-black text-primary uppercase leading-none">Pending Synchronization</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{store.pendingSyncCount} items queued for cloud upload</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={store.syncOfflineAttendance} 
            disabled={store.isSyncing}
            className="rounded-full h-8 px-4 font-black uppercase text-[9px] border-primary/20 text-primary"
          >
            {store.isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
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
            Session: <span className="text-primary">{activeSession}</span> • Filter: {categories.find(c => c.id === activeCategory)?.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-black text-primary uppercase text-[11px] min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
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
              <TableRow>
                <TableCell colSpan={days.length + 2} className="text-center py-8 text-muted-foreground font-black uppercase text-xs opacity-40">
                  No records found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                let monthlyTotal = 0;
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-xs font-bold sticky left-0 bg-white z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-primary/40">#{player.serialNumber || '0'}</span>
                           <span className="uppercase truncate w-[140px] text-primary">{player.name}</span>
                        </div>
                        <span className="text-[8px] uppercase text-muted-foreground font-black ml-6">{player.gender} • Std {player.std}</span>
                      </div>
                    </TableCell>
                    {days.map(day => {
                      const key = `${player.id}_${format(day, 'yyyy-MM-dd')}_${activeSession}`;
                      const status = store.data.attendance[key];
                      if (status === 'P') monthlyTotal++;
                      
                      return (
                        <TableCell 
                          key={day.toString()} 
                          className="border-r p-0 text-center cursor-pointer hover:bg-primary/10 transition-colors"
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
    </div>
  );
}
