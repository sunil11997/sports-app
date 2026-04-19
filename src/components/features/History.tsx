"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { History as HistoryIcon, Printer, TrendingUp, Calendar, HeartPulse, Activity } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function History({ store }: { store: any }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const player = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const monthlyData = useMemo(() => {
    if (!selectedPlayerId) return [];

    // Last 12 months
    const end = new Date();
    const start = subMonths(end, 11);
    const months = eachMonthOfInterval({ start, end });

    return months.map(monthDate => {
      const monthStr = format(monthDate, 'yyyy-MM');
      
      // Attendance
      const attRecords = Object.entries(store.data.attendance)
        .filter(([key]) => key.startsWith(`${selectedPlayerId}_`) && key.includes(monthStr));
      const presents = attRecords.filter(([, status]) => status === 'P').length;
      const attendancePercent = attRecords.length > 0 ? Math.round((presents / attRecords.length) * 100) : 0;

      // Health
      const incidents = store.data.healthIncidents.filter((inc: any) => 
        inc.playerId === selectedPlayerId && inc.date.startsWith(monthStr)
      );

      // Fitness
      const fitnessLogs = store.data.fitnessHistory.filter((f: any) => 
        f.playerId === selectedPlayerId && f.date.startsWith(monthStr)
      );
      const avgFitnessScore = fitnessLogs.length > 0 
        ? (fitnessLogs.reduce((sum: number, f: any) => sum + parseFloat(f.score || 0), 0) / fitnessLogs.length).toFixed(1)
        : null;

      // Biometrics
      const bioLogs = store.data.biometricHistory.filter((b: any) => 
        b.playerId === selectedPlayerId && b.date.startsWith(monthStr)
      );
      const latestBio = bioLogs[bioLogs.length - 1];

      return {
        month: format(monthDate, 'MMM yyyy'),
        monthRaw: monthStr,
        attendance: attendancePercent,
        incidentCount: incidents.length,
        fitnessScore: avgFitnessScore ? parseFloat(avgFitnessScore) : null,
        weight: latestBio ? parseFloat(latestBio.weight) : null,
        height: latestBio ? parseFloat(latestBio.height) : null,
        bmi: latestBio ? parseFloat(latestBio.bmi) : null,
        incidents: incidents.map((i: any) => i.description).join('; ')
      };
    }).filter(d => d.attendance > 0 || d.incidentCount > 0 || d.fitnessScore !== null || d.weight !== null);
  }, [selectedPlayerId, store.data]);

  const handlePrint = () => {
    if (!player) return;
    const printContent = `
      <html>
        <head>
          <title>Progress Report - ${player.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; margin-bottom: 20px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
            .stat-box { background: #f4fcf6; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <h1>Monthly Progress: ${player.name}</h1>
          <div class="stat-box">
            <strong>ID:</strong> ${player.id} | <strong>Std:</strong> ${player.std} | <strong>Sports:</strong> ${player.sports.join(', ')}
          </div>
          <table>
            <thead>
              <tr>
                <th>MONTH</th>
                <th>ATTENDANCE %</th>
                <th>FITNESS SCORE</th>
                <th>WEIGHT (KG)</th>
                <th>BMI</th>
                <th>HEALTH INCIDENTS</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyData.map(d => `
                <tr>
                  <td>${d.month}</td>
                  <td>${d.attendance}%</td>
                  <td>${d.fitnessScore || '-'}</td>
                  <td>${d.weight || '-'}</td>
                  <td>${d.bmi || '-'}</td>
                  <td>${d.incidents || 'None'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <footer style="margin-top: 50px; font-size: 10px; color: #888; text-align: center;">
            Waghamba Sports Hub - Institutional Progress Record
          </footer>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-accent" /> Progress History
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Track monthly variations in fitness, attendance, and health metrics to visualize development.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
              <SelectTrigger className="rounded-2xl border-2 h-14 text-lg font-bold bg-white">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {store.data.players.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              disabled={!selectedPlayerId} 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 font-black text-lg shadow-lg uppercase tracking-wider"
            >
              <Printer className="w-6 h-6 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center justify-center text-muted-foreground rounded-[3rem] bg-white">
          <HistoryIcon className="w-20 h-20 mb-6 opacity-10" />
          <h3 className="text-2xl font-bold uppercase">Select a Player</h3>
          <p className="font-medium">Please pick a student to view their historical progress data.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
          <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Activity className="w-5 h-5" /> Fitness & Weight Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis yAxisId="left" tick={{fontSize: 12}} label={{ value: 'Score/Weight', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="top" height={36} />
                  <Line yAxisId="left" type="monotone" dataKey="fitnessScore" name="Fitness Score" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="hsl(var(--accent))" strokeWidth={4} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Attendance Consistency (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '16px'}} />
                  <Line type="stepAfter" dataKey="attendance" name="Attendance %" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-2 border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary text-primary-foreground p-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Complete Monthly Breakdown</CardTitle>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
                  {player.name} | STD {player.std}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-primary uppercase p-6">Month</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-center">Attendance</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-center">Fitness Score</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-center">Biometrics</TableHead>
                    <TableHead className="font-bold text-primary uppercase">Health Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium">
                        No historical records found for this player.
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthlyData.map((d, i) => (
                      <TableRow key={d.monthRaw} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-black text-primary p-6">{d.month}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{width: `${d.attendance}%`}} />
                            </div>
                            <span className="font-bold text-xs">{d.attendance}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-black text-xl text-primary">{d.fitnessScore || '-'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 text-[10px] font-bold uppercase">
                            <span>W: {d.weight ? `${d.weight}kg` : '-'}</span>
                            <span>H: {d.height ? `${d.height}cm` : '-'}</span>
                            <span className="text-accent">BMI: {d.bmi || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {d.incidentCount > 0 ? (
                            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                              <HeartPulse className="w-4 h-4" />
                              <span className="max-w-[300px] truncate" title={d.incidents}>
                                {d.incidentCount} Logged: {d.incidents}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Clear History</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
