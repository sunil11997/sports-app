"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight, Save, Printer } from 'lucide-react';

export function Attendance({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const targetCategory = section === 'general' ? 'student' : 'athlete';
  const filteredPlayers = store.data.players.filter((p: any) => p.category === targetCategory);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? undefined : 'P';
    
    store.setAttendance({ [key]: nextStatus });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Attendance Report - ${format(currentDate, 'MMMM yyyy')}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 10px; }
            h1 { color: #235C36; text-transform: uppercase; border-bottom: 2px solid #8AF075; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body>
          <h1>Attendance (${section.toUpperCase()}): ${format(currentDate, 'MMMM yyyy')}</h1>
          <table>
            <thead>
              <tr>
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
                return `<tr><td class="name-cell">${p.name}</td>${row}<td>${total}</td></tr>`;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-black text-primary uppercase tracking-tight">Excel: Monthly Attendance</h2>
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
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                let monthlyTotal = 0;
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-xs font-bold sticky left-0 bg-white z-10">
                      {player.name}
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