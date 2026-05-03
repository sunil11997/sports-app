"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

export function Attendance({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = isMounted ? eachDayOfInterval({ start: monthStart, end: monthEnd }) : [];

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
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory]);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? null : 'P';
    store.setAttendance({ [key]: nextStatus });
  };

  const handlePrint = () => {
    const categoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>Attendance Report - ${format(currentDate, 'MMMM yyyy')}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; }
            h1 { color: #235C36; text-transform: uppercase; border-bottom: 2px solid #8AF075; margin-bottom: 10px; }
            .meta { font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body>
          <h1>Attendance (${section.toUpperCase()}): ${format(currentDate, 'MMMM yyyy')}</h1>
          <div class="meta">Category: ${categoryLabel.toUpperCase()}</div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>PLAYER</th>
                ${days.map(d => `<th>${format(d, 'd')}</th>`).join('')}
                <th>TOT</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                let total = 0;
                const row = days.map(d => {
                  const s = store.data.attendance[`${p.id}_${format(d, 'yyyy-MM-dd')}`];
                  if (s === 'P') total++;
                  return `<td>${s || '-'}</td>`;
                }).join('');
                return `<tr><td>${p.serialNumber || ''}</td><td class="name-cell">${p.name}</td>${row}<td>${total}</td></tr>`;
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
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
        {CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={`h-8 rounded px-3 text-[10px] font-black uppercase transition-all ${activeCategory === cat.id ? '' : 'text-muted-foreground'}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Excel: Monthly Attendance</h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Filtered by: {CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
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
          <Button onClick={handlePrint} size="sm" className="font-bold h-9">
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
                <TableCell colSpan={days.length + 2} className="text-center py-8 text-muted-foreground">
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
                           <span className="uppercase truncate w-[140px]">{player.name}</span>
                        </div>
                        <span className="text-[8px] uppercase text-muted-foreground font-black ml-6">Std {player.std} • {player.gender}</span>
                      </div>
                    </TableCell>
                    {days.map(day => {
                      const key = `${player.id}_${format(day, 'yyyy-MM-dd')}`;
                      const status = store.data.attendance[key];
                      if (status === 'P') monthlyTotal++;
                      
                      return (
                        <TableCell 
                          key={day.toString()} 
                          className="border-r p-0 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => handleToggle(player.id, day)}
                        >
                          <div className={`w-full h-10 flex items-center justify-center text-[10px] font-black ${
                            status === 'P' ? 'bg-primary/20 text-primary' : 
                            status === 'A' ? 'bg-destructive/20 text-destructive' : 
                            'text-muted-foreground/30'
                          }`}>
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
