"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { cn, getAgeValidation } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  WifiOff,
  Search
} from "lucide-react";

const SPORTS_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
  { id: 'age-pending', label: 'Age Pending' },
];

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `Std ${i + 1}` 
  }))
];

export function Attendance({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSession, setActiveSession] = useState<'Morning' | 'Evening'>('Morning');
  const [localMarathiView, setLocalMarathiView] = useState(language === 'Marathi');
  const [searchTerm, setSearchTerm] = useState("");
  const { isOnline } = usePWA();

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
    setLocalMarathiView(language === 'Marathi');
  }, [language]);

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
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'age-pending';
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
        const query = searchTerm.toLowerCase();
        const matchesSearch = (p.name || "").toLowerCase().includes(query) || 
                             (p.nameMarathi || "").toLowerCase().includes(query) ||
                             (p.generalRegisterNumber || "").includes(searchTerm);
        return matchesSection && matchesTab && matchesSearch;
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory, searchTerm]);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}_${activeSession}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? null : 'P';
    store.setAttendance({ [key]: nextStatus });
  };

  const handlePrint = () => {
    if (!currentDate) return;
    const isM = localMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? `मासिक उपस्थिती अहवाल - ${format(currentDate, 'MMMM yyyy')}` 
      : `Monthly Attendance Report - ${format(currentDate, 'MMMM yyyy')}`;
    const sessionLabel = isM 
      ? (activeSession === 'Morning' ? 'सकाळ' : 'संध्याकाळ')
      : activeSession;
    
    const printContent = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
            @media print { 
              @page { size: A4 landscape; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Poppins', sans-serif; padding: 20px; font-size: 10px; color: #111; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 2px solid #333; margin-bottom: 5px; text-align: center; }
            .report-type { font-weight: 800; text-transform: uppercase; text-align: center; margin-bottom: 15px; text-decoration: underline; }
            .meta { font-weight: bold; margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print" style="position:fixed; top:0; left:0; right:0; background:#1e3a8a; padding:10px; text-align:center;">
             <button onclick="window.print()" style="background:#f59e0b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:900; cursor:pointer;">${isM ? 'प्रिंट करा' : 'Print Report'}</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">${reportTitle}</div>
          <div class="meta">
            <span>${isM ? 'सत्र' : 'Session'}: ${sessionLabel}</span>
            <span>${isM ? 'तारीख' : 'Date'}: ${format(new Date(), 'dd/MM/yyyy')}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>${isM ? 'अनु. क्र.' : 'Sr No'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</th>
                <th>${isM ? 'लिंग' : 'Gender'}</th>
                ${days.map(d => `<th>${format(d, 'd')}</th>`).join('')}
                <th>${isM ? 'एकूण' : 'Total'}</th>
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
                const displayName = isM ? (p.nameMarathi || p.name) : p.name;
                return `<tr><td>${p.serialNumber || ''}</td><td class="name-cell">${displayName.toUpperCase()}</td><td>${p.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>${row}<td>${total}</td></tr>`;
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
            </div>
          </div>
        </div>
      )}

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

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border shadow-xl">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(false)} className="h-10 px-6 text-[10px] font-black uppercase rounded-lg">English</Button>
            <Button variant={localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(true)} className="h-10 px-6 text-[10px] font-black uppercase rounded-lg">मराठी</Button>
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Presence Log</h2>
            <div className="flex bg-muted/40 p-1 rounded-xl border mt-2">
              <Button variant={activeSession === 'Morning' ? "default" : "ghost"} onClick={() => setActiveSession('Morning')} className="h-8 px-4 text-[9px] font-black uppercase rounded-lg">Morning</Button>
              <Button variant={activeSession === 'Evening' ? "default" : "ghost"} onClick={() => setActiveSession('Evening')} className="h-8 px-4 text-[9px] font-black uppercase rounded-lg">Evening</Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
            <Input 
              placeholder={localMarathiView ? "नाव किंवा GR ने शोधा..." : "Find Student by Name or GR..."} 
              className="pl-14 h-16 rounded-[1.2rem] border-2 border-primary/10 bg-muted/20 font-black text-lg shadow-inner focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border shadow-inner">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-black text-primary uppercase text-[10px] min-w-[100px] text-center tracking-widest">
                  {currentDate ? format(currentDate, 'MMM yyyy') : '...'}
                </span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handlePrint} className="h-12 px-6 bg-primary text-white rounded-xl font-black uppercase text-xs shadow-lg active-scale">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
          </div>
        </div>
      </div>

      <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl relative">
        <div className="overflow-x-auto scrollbar-hide relative max-h-[70vh] overflow-y-auto">
          <Table className="border-collapse min-w-max">
            <TableHeader className="bg-slate-100 sticky top-0 z-50 shadow-sm border-b">
              <TableRow className="h-14">
                <TableHead className="border-r px-6 font-black text-[11px] uppercase w-[220px] sticky left-0 top-0 bg-slate-200 z-[60]">Student Profile</TableHead>
                {days.map(day => (
                  <TableHead key={day.toString()} className="border-r px-1 font-black text-[10px] uppercase text-center w-[40px] sticky top-0 bg-slate-100 z-40">
                    {format(day, 'd')}
                  </TableHead>
                ))}
                <TableHead className="px-4 font-black text-[10px] uppercase text-center w-[70px] bg-primary/10 sticky top-0 right-0 z-[60]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow><TableCell colSpan={days.length + 2} className="text-center py-40 opacity-20 font-black uppercase text-2xl">No registry entries</TableCell></TableRow>
              ) : filteredPlayers.map((player: any) => {
                let monthlyTotal = 0;
                return (
                  <TableRow key={player.id} className="border-b h-14 group hover:bg-primary/5 transition-colors">
                    <TableCell className="border-r px-6 text-[10px] font-black sticky left-0 bg-white z-20 uppercase border-r group-hover:bg-muted/5">
                      {localMarathiView ? (player.nameMarathi || player.name) : player.name}
                    </TableCell>
                    {days.map(day => {
                      const key = `${player.id}_${format(day, 'yyyy-MM-dd')}_${activeSession}`;
                      const status = store.data.attendance[key];
                      if (status === 'P') monthlyTotal++;
                      return (
                        <TableCell 
                          key={day.toString()} 
                          className="border-r p-0 text-center cursor-pointer transition-colors"
                          onClick={() => handleToggle(player.id, day)}
                        >
                          <div className={cn(
                            "w-full h-14 flex items-center justify-center text-[10px] font-black",
                            status === 'P' ? "bg-primary text-white shadow-inner" : 
                            status === 'A' ? "bg-destructive text-white shadow-inner" : 
                            'text-muted-foreground/10'
                          )}>
                            {status || '-'}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="px-4 text-center font-black text-primary text-sm bg-primary/5 sticky right-0 z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.05)]">{monthlyTotal}</TableCell>
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
