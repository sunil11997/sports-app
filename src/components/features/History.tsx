"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  History as HistoryIcon, 
  Printer, 
  Stethoscope,
  TrendingUp,
  Trophy,
  ChartLine
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Line
} from 'recharts';
import { ChartSkeleton, TableSkeleton, DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const availablePlayers = store.data.players.filter((p: any) => p.category === targetCategory);

  const player = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const playerIncidents = useMemo(() => 
    store.data.healthIncidents.filter((inc: any) => inc.playerId === selectedPlayerId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [selectedPlayerId, store.data.healthIncidents]
  );

  const playerFitness = useMemo(() => 
    (store.data.fitnessHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date).getTime() - new Date(b.updatedAt || b.date).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const chartData = useMemo(() => {
    return playerFitness.map(f => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      strength: parseFloat(f.strengthScore) || 0,
      endurance: parseFloat(f.enduranceScore) || 0
    }));
  }, [playerFitness]);

  const handlePrint = () => {
    if (!player) return;
    const printContent = `
      <html>
        <head>
          <title>Progress Dossier - ${player.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.4; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; text-transform: uppercase; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background: #f4f4f4; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>INSTITUTIONAL PROGRESS: ${player.name}</h1>
          <p>Std: ${player.std} | Age: ${player.age} | ${section.toUpperCase()} Division</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                ${isGeneral ? '<th>Ht (cm)</th><th>Wt (kg)</th><th>Exam SC</th>' : '<th>10x6</th><th>50M</th><th>600M</th><th>Reach</th><th>Jump</th><th>Situps</th><th>Strength</th>'}
                <th>Total Score</th>
                <th>Status / Level</th>
              </tr>
            </thead>
            <tbody>
              ${[...playerFitness].reverse().map(f => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td>
                  ${isGeneral ? `<td>${f.height || '-'}</td><td>${f.weight || '-'}</td><td>${f.examMarks || '-'}</td>` : `<td>${f.shuttleRun || '-'}</td><td>${f.run50m || '-'}</td><td>${f.run600m || '-'}</td><td>${f.sitAndReach || '-'}</td><td>${f.boardJump || '-'}</td><td>${f.sitUps || '-'}</td><td>${f.strengthScore || '-'}%</td>`}
                  <td><strong>${f.score}${isGeneral ? '' : '%'}</strong></td>
                  <td>${f.status}</td>
                </tr>
              `).join('')}
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

  if (!store.isLoaded) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <HistoryIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Archives</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Multi-Year Evolution Tracker</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-12 text-md font-bold bg-white rounded-xl border-2 shadow-sm">
              <SelectValue placeholder="Pick student..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-xs tracking-widest shadow-md">
            <Printer className="w-4 h-4 mr-2" /> Export Case Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3rem] opacity-30">
          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
          <p className="font-black uppercase text-sm tracking-widest">Select a profile to analyze progress trends</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {!chartData.length ? <ChartSkeleton /> : (
                <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
                  <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <ChartLine className="w-4 h-4 text-accent" /> Score Trend Analysis
                    </CardTitle>
                    <Badge className="bg-primary text-white font-black text-[9px] uppercase px-4 py-1">Standardized Index</Badge>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#235C36" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#235C36" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '15px' }}
                          />
                          <Area type="monotone" dataKey="score" stroke="#235C36" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                          {!isGeneral && (
                            <>
                              <Line type="monotone" dataKey="strength" stroke="#8AF075" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                              <Line type="monotone" dataKey="endurance" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </>
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                <Table className="border-collapse min-w-max">
                  <TableHeader className="bg-muted/30 sticky top-0">
                    <TableRow className="border-b">
                      <TableHead className="border-r h-10 px-4 text-[9px] uppercase font-black sticky left-0 bg-muted/90 backdrop-blur-md z-10 w-[120px]">Month</TableHead>
                      {isGeneral ? (
                        <>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[60px]">Ht (cm)</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[60px]">Wt (kg)</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[60px]">Exam SC</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[50px]">10x6</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[50px]">50M</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[50px]">600M</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[50px]">Str %</TableHead>
                          <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[50px]">End %</TableHead>
                        </>
                      )}
                      <TableHead className="border-r h-10 px-2 text-[9px] uppercase font-black text-center w-[80px] bg-primary/5">Score</TableHead>
                      <TableHead className="h-10 px-2 text-[9px] uppercase font-black text-right w-[150px]">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...playerFitness].reverse().map((fit: any, idx: number) => (
                      <TableRow key={idx} className="border-b even:bg-muted/20 h-10 hover:bg-primary/5 transition-colors">
                        <TableCell className="border-r p-2 text-[10px] font-bold sticky left-0 bg-white z-10">
                          {format(new Date(fit.updatedAt || fit.date || new Date()), 'MMMM yyyy')}
                        </TableCell>
                        {isGeneral ? (
                          <>
                            <TableCell className="border-r p-1 text-center text-[10px] font-bold">{fit.height || '-'}</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px] font-bold">{fit.weight || '-'}</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px] font-black text-primary">{fit.examMarks || '0'}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="border-r p-1 text-center text-[10px]">{fit.shuttleRun || '-'}</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px]">{fit.run50m || '-'}</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px]">{fit.run600m || '-'}</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px] font-bold text-accent-foreground">{fit.strengthScore || '-'}%</TableCell>
                            <TableCell className="border-r p-1 text-center text-[10px] font-bold text-primary">{fit.enduranceScore || '-'}%</TableCell>
                          </>
                        )}
                        <TableCell className="border-r p-1 text-center text-[11px] font-black text-primary bg-primary/5">
                          {fit.score}{isGeneral ? '' : '%'}
                        </TableCell>
                        <TableCell className="p-1 text-right text-[9px] font-black uppercase text-muted-foreground/60 pr-4">
                          {fit.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl">
                <CardHeader className="bg-destructive/5 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase text-destructive tracking-widest flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Medical History Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {playerIncidents.length === 0 ? (
                    <p className="text-[10px] font-bold uppercase text-muted-foreground italic text-center py-10 opacity-30">No recorded incidents</p>
                  ) : (
                    <div className="space-y-4">
                      {playerIncidents.map((inc: any) => (
                        <div key={inc.id} className="border-l-4 border-destructive/30 pl-4 py-1 group">
                          <div className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yyyy')}</div>
                          <p className="text-xs font-bold text-foreground/80 leading-snug mt-1 group-hover:text-destructive transition-colors">{inc.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl">
                <CardHeader className="bg-amber-50 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase text-amber-800 tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Technical Proficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(store.data.skillsHistory[selectedPlayerId] || []).length === 0 ? (
                    <p className="text-[10px] font-bold uppercase text-muted-foreground italic text-center py-10 opacity-30">No technical data</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.values(store.data.sportSkills)
                        .filter((s: any) => s.playerId === selectedPlayerId)
                        .map((skill: any, idx: number) => (
                          <div key={idx} className="bg-muted/30 p-4 rounded-2xl border border-muted">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black uppercase text-primary">{skill.sportName}</span>
                              <Badge className="bg-primary text-white text-[10px] font-black">{skill.score}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(skill.detailedSkills || {}).map(([name, sc]) => (
                                <span key={name} className="text-[8px] font-black uppercase bg-white px-1.5 py-0.5 rounded border border-muted">
                                  {name}: {sc}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
