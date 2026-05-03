
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart3, 
  Printer, 
  Stethoscope,
  TrendingUp,
  Trophy,
  ChartLine,
  User,
  Star,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History as HistoryIcon
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
  Line,
  LineChart
} from 'recharts';
import { ChartSkeleton, DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';

  const availablePlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral]);

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
      endurance: parseFloat(f.enduranceScore) || 0,
      bmi: parseFloat(f.bmi) || 0
    }));
  }, [playerFitness]);

  const analyticalInsights = useMemo(() => {
    if (!player) return { plus: [], weak: [] };
    const plus: string[] = [];
    const weak: string[] = [];
    
    const latestFit = playerFitness[playerFitness.length - 1] || store.data.fitness[player.id] || {};
    const latestSkills = Object.values(store.data.sportSkills).filter((s: any) => s.playerId === player.id);
    
    // BMI Logic
    const bmi = parseFloat(latestFit.bmi || player.bmi);
    if (bmi < 18.5) weak.push("Underweight status (Need nutritional focus)");
    else if (bmi >= 18.5 && bmi <= 24.9) plus.push("Healthy BMI Index (Fit for institutional training)");
    else if (bmi > 25) weak.push("Overweight status (Needs aerobic focus)");

    // Performance Logic
    if (parseFloat(latestFit.score) > 80) plus.push("Excellent overall physical score");
    if (parseFloat(latestFit.enduranceScore) > 85) plus.push("Elite aerobic endurance (High 600m performance)");
    if (parseFloat(latestFit.enduranceScore) < 45) weak.push("Low stamina (Focus on 600m pacing)");
    if (parseFloat(latestFit.strengthScore) > 85) plus.push("High explosive power (Board jump/Situps master)");
    
    // Technical Logic
    if (latestSkills.some(s => parseFloat(s.score) > 70)) plus.push("Advanced technical proficiency in games");

    return { plus, weak };
  }, [player, playerFitness, store.data.fitness, store.data.sportSkills]);

  const handlePrint = () => {
    if (!player) return;
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head><title>Performance Dossier - ${player.name}</title>
        <style>
          body { font-family: Inter, sans-serif; padding: 40px; color: #111; }
          h1 { color: #235C36; border-bottom: 3px solid #F59E0B; padding-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .box { padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
        </style></head>
        <body>
          <h1>INSTITUTIONAL DOSSIER: ${player.name.toUpperCase()}</h1>
          <div class="grid">
            <div class="box"><strong>Plus Points:</strong><ul>${analyticalInsights.plus.map(p => `<li>${p}</li>`).join('')}</ul></div>
            <div class="box"><strong>Growth Areas:</strong><ul>${analyticalInsights.weak.map(w => `<li>${w}</li>`).join('')}</ul></div>
          </div>
          <table>
            <thead><tr><th>Month</th><th>Agg Score</th><th>Status</th></tr></thead>
            <tbody>${playerFitness.map(f => `<tr><td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td><td>${f.score}%</td><td>${f.status}</td></tr>`).join('')}</tbody>
          </table>
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Dashboard</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Advanced Performance Analytics</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-12 text-md font-bold bg-white rounded-xl border-2 shadow-sm">
              <SelectValue placeholder="Pick profile to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-xs tracking-widest shadow-md">
            <Printer className="w-4 h-4 mr-2" /> Export Performance Dossier
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 rounded-[2.5rem] bg-emerald-50/50 p-8 shadow-sm border-emerald-100">
                  <h4 className="text-sm font-black text-emerald-800 uppercase flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5" /> Institutional Plus Points
                  </h4>
                  <div className="space-y-3">
                    {analyticalInsights.plus.length === 0 ? <p className="text-xs italic text-muted-foreground">Monitoring active performance...</p> : 
                    analyticalInsights.plus.map((p, i) => (
                      <div key={i} className="flex gap-2 text-xs font-bold text-emerald-900/70">
                        <Star className="w-3 h-3 text-emerald-600 fill-emerald-600 mt-0.5 shrink-0" /> {p}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="border-2 rounded-[2.5rem] bg-orange-50/50 p-8 shadow-sm border-orange-100">
                  <h4 className="text-sm font-black text-orange-800 uppercase flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5" /> Growth & Weak Areas
                  </h4>
                  <div className="space-y-3">
                    {analyticalInsights.weak.length === 0 ? <p className="text-xs italic text-muted-foreground">No critical weaknesses identified.</p> : 
                    analyticalInsights.weak.map((w, i) => (
                      <div key={i} className="flex gap-2 text-xs font-bold text-orange-900/70">
                        <Target className="w-3 h-3 text-orange-600 mt-0.5 shrink-0" /> {w}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {!chartData.length ? <ChartSkeleton /> : (
                <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
                  <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <ChartLine className="w-4 h-4 text-accent" /> Institutional Progress Chart
                    </CardTitle>
                    <Badge className="bg-primary text-white font-black text-[9px] uppercase px-4 py-1">Normalized Index</Badge>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" x1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#235C36" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#235C36" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="score" stroke="#235C36" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" name="Aggregate Score" />
                          {!isGeneral && (
                            <>
                              <Line type="monotone" dataKey="strength" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Strength Rating" />
                              <Line type="monotone" dataKey="endurance" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Endurance Rating" />
                            </>
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="border border-border rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                <Table className="min-w-max border-collapse">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b">
                      <TableHead className="border-r h-12 px-6 text-[10px] uppercase font-black">Timeline</TableHead>
                      <TableHead className="border-r h-12 px-4 text-[10px] uppercase font-black text-center">Score</TableHead>
                      {!isGeneral && <TableHead className="border-r h-12 px-4 text-[10px] uppercase font-black text-center">Str/End %</TableHead>}
                      <TableHead className="h-12 px-6 text-[10px] uppercase font-black text-right">Term Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...playerFitness].reverse().map((fit: any, idx: number) => (
                      <TableRow key={idx} className="border-b hover:bg-primary/5 h-16 transition-colors">
                        <TableCell className="border-r px-6 font-bold text-xs">
                          <div className="flex items-center gap-2 text-primary">
                            <Calendar className="w-3 h-3" /> {format(new Date(fit.updatedAt || fit.date || new Date()), 'MMMM yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="border-r text-center font-black text-lg text-primary">{fit.score}%</TableCell>
                        {!isGeneral && (
                          <TableCell className="border-r text-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-orange-600">S: {fit.strengthScore}%</span>
                              <span className="text-[10px] font-bold text-blue-600">E: {fit.enduranceScore}%</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-right px-6">
                          <Badge variant="outline" className="font-black text-[9px] uppercase border-primary/20 px-3">{fit.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" /> Personal Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4 border-b border-dashed pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg">
                      {player.name[0]}
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-xl text-primary leading-tight">{player.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">GR: {player.generalRegisterNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block">Standard</span> Std {player.std}</div>
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block">Age</span> {player.age} Years</div>
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block">Current BMI</span> {player.bmi}</div>
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block">Gender</span> {player.gender}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
                <CardHeader className="bg-destructive/5 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase text-destructive tracking-widest flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Medical Archive
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {playerIncidents.length === 0 ? (
                    <p className="text-[10px] font-bold uppercase text-muted-foreground italic text-center py-10 opacity-30">Clear Health Record</p>
                  ) : (
                    <div className="space-y-4">
                      {playerIncidents.slice(0, 3).map((inc: any) => (
                        <div key={inc.id} className="border-l-4 border-destructive/30 pl-4 py-1">
                          <div className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yyyy')}</div>
                          <p className="text-xs font-bold text-foreground/80 leading-snug mt-1">{inc.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
                <CardHeader className="bg-accent/10 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase text-accent tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Technical Mastery
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {Object.values(store.data.sportSkills).filter((s: any) => s.playerId === selectedPlayerId).length === 0 ? (
                    <p className="text-[10px] font-bold uppercase text-muted-foreground italic text-center py-10 opacity-30">No technical data</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.values(store.data.sportSkills)
                        .filter((s: any) => s.playerId === selectedPlayerId)
                        .map((skill: any, idx: number) => (
                          <div key={idx} className="bg-muted/30 p-4 rounded-2xl border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black uppercase text-primary">{skill.sportName}</span>
                              <Badge className="bg-primary text-white text-[10px] font-black">{skill.score}</Badge>
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
