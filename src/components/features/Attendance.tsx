"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight, Save } from 'lucide-react';

export function Attendance({ store }: { store: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? undefined : 'P';
    
    store.setAttendance({ [key]: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Monthly Presence</h2>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-black text-primary uppercase min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-max">
            <TableHeader className="bg-primary">
              <TableRow>
                <TableHead className="sticky left-0 bg-primary z-20 text-primary-foreground font-bold min-w-[200px]">PLAYER</TableHead>
                {days.map(day => (
                  <TableHead key={day.toString()} className="text-primary-foreground font-bold text-center px-1">
                    {format(day, 'd')}
                  </TableHead>
                ))}
                <TableHead className="text-primary-foreground font-bold text-center">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {store.data.players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={days.length + 2} className="text-center py-12 text-muted-foreground">
                    Register players to start tracking attendance.
                  </TableCell>
                </TableRow>
              ) : (
                store.data.players.map((player: any) => {
                  let monthlyTotal = 0;
                  return (
                    <TableRow key={player.id}>
                      <TableCell className="sticky left-0 bg-white z-10 font-bold border-r">
                        <div className="flex flex-col">
                          <span>{player.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{player.sport}</span>
                        </div>
                      </TableCell>
                      {days.map(day => {
                        const key = `${player.id}_${format(day, 'yyyy-MM-dd')}`;
                        const status = store.data.attendance[key];
                        if (status === 'P') monthlyTotal++;
                        
                        return (
                          <TableCell 
                            key={day.toString()} 
                            className="p-1 text-center cursor-pointer hover:bg-primary/5 transition-colors border-r last:border-r-0"
                            onClick={() => handleToggle(player.id, day)}
                          >
                            <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                              status === 'P' ? 'bg-primary text-primary-foreground' : 
                              status === 'A' ? 'bg-destructive text-destructive-foreground' : 
                              'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                            }`}>
                              {status || '-'}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-black text-primary bg-primary/5">{monthlyTotal}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
        <div className="flex gap-4 text-xs font-bold uppercase text-primary/70">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary rounded"></div> Present (P)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-destructive rounded"></div> Absent (A)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-muted/30 rounded"></div> Not Set (-)</div>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold">
          <Save className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
}