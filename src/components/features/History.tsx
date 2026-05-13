"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Printer, 
  Stethoscope,
  TrendingUp,
  Trophy,
  ChartLine,
  Star,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History as HistoryIcon,
  Cake,
  Users,
  Timer,
  Wind,
  Dumbbell
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
  ComposedChart,
  Area,
  Line,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CHART_COLORS = ['#0048A0', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';

  const availablePlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = Number(a.std) || 0;
        const stdB = Number(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0);
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
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date || 0).getTime() - new Date(b.updatedAt || b.date || 0).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const skillMasteryData = useMemo(() => {
    if (!selectedPlayerId) return [];
    // Calculate mastery based on drill completions
    const sports = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
    return sports.map(sport => {
      const skill = store.data.sportSkills[`${selectedPlayerId}_${sport}`];
      return {
        name: sport,
        score: parseFloat(skill?.score) || 0,
        participation: Object.keys(store.data.drillCompletions).filter(k => k.startsWith(selectedPlayerId)).length // Mock participation for visualization
      };
    }).filter(s => s.score > 0);
  }, [selectedPlayerId, store.data.sportSkills, store.data.drillCompletions]);

  const playerAttendance = useMemo(() => {
    if (!selectedPlayerId) return { present: 0, total: 0 };
    let present = 0;
    const entries = Object.keys(store.data.attendance).filter(k => k.startsWith(selectedPlayerId));
    entries.forEach(k => {
      if (store.data.attendance[k] === 'P') present++;
    });
    return { present, total: entries.length };
  }, [selectedPlayerId, store.data.attendance]);

  const chartData = useMemo(() => {
    return playerFitness.map((f: any) => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      strength: parseFloat(f.strengthScore) || 0,
      stamina: parseFloat(f.enduranceScore) || 0,
      speed: parseFloat(f.speedScore) || 0
    }));
  }, [playerFitness]);

  const teamCategory = useMemo(() => {
    if (!player) return "N/A";
    const age = Number(player.age) || 0;
    const gender = player.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14 Squad`;
    if (age < 17) return `${gender} U17 Squad`;
    return `${gender} Senior Squad`;
  }, [player]);

  const handlePrint = () => {
    if (!player) return;
    
    const photoHtml = player.photoUrl 
      ? `<img src="${player.photoUrl}" style="width:100%;height:100%;object-fit:cover;">`
      : '<div style="background:#eee;height:100%;"></div>';

    const htmlContent = `
      <html>
        <head>
          <title>Institutional Performance Dossier - ${player.name}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; line-height: 1.4; color: #111; font-size: 12px; }
            .header { text-align: center; border-bottom: 4px double #0048A0; padding-bottom: 10px; margin-bottom: 25px; }
            .school-name { font-size: 22px; font-weight: 900; color: #0048A0; text-transform: uppercase; }
            .profile-grid { display: grid; grid-template-columns: 100px 1fr; gap: 20px; margin-bottom: 20px; }
            .photo-box { width: 100px; height: 120px; border: 1px solid #ddd; overflow: hidden; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .data-table th, .data-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .box { border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: #fafafa; margin-top: 10px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #0048A0; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #F59E0B; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <div class="school-name">ASHRAM SHALA WAGHAMBA</div>
            <div style="font-weight: 800; font-size: 14px;">INSTITUTIONAL PERFORMANCE DOSSIER</div>
          </div>
          <div class="profile-grid">
            <div class="photo-box">${photoHtml}</div>
            <table style="width: 100%;">
              <tr><td style="font-weight:900;">STUDENT NAME:</td><td>${player.name.toUpperCase()}</td></tr>
              <tr><td style="font-weight:900;">GR / SERIAL:</td><td>${player.generalRegisterNumber || 'N/A'} / #${player.serialNumber || '0'}</td></tr>
              <tr><td style="font-weight:900;">CATEGORY:</td><td>${teamCategory}</td></tr>
              <tr><td style="font-weight:900;">ATTENDANCE:</td><td>${playerAttendance.present} / ${playerAttendance.total} sessions</td></tr>
            </table>
          </div>
          <h3>Institutional Growth Registry</h3>
          <table class="data-table">
            <thead><tr><th>DATE</th><th>SPEED %</th><th>STAMINA %</th><th>CORE %</th><th>TOTAL %</th></tr></thead>
            <tbody>
              ${playerFitness.map((f: any) => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td>
                  <td>${f.speedScore || '-'}%</td>
                  <td>${f.enduranceScore || '-'}%</td>
                  <td>${f.strengthScore || '-'}%</td>
                  <td><strong>${f.score}%</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const win = window.open('', '_blank');
    win?.document.write(htmlContent);
    win?.document.close();
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
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Analytics</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry Progress Hub</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-14 text-md font-bold bg-white rounded-2xl border-2 shadow-sm focus:border-primary">
              <SelectValue placeholder="Identify Athlete..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {availablePlayers.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 font-black uppercase text-xs tracking-widest active-scale shadow-xl">
            <Printer className="w-4 h-4 mr-2" /> Export Performance Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3.5rem] opacity-30 bg-white/50 backdrop-blur-sm">
          <TrendingUp className="w-20 h-20 mx-auto mb-6 text-primary" />
          <p className="font-black uppercase text-lg tracking-widest text-primary">Identify an entry to access institutional metrics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden group">
              <div className="h-2 w-full bg-accent" />
              <CardContent className="p-8 space-y-8 text-center">
                <Avatar className="w-40 h-40 border-4 border-primary/10 shadow-2xl mx-auto group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src={player?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-5xl uppercase">{player?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h3 className="font-black uppercase text-3xl text-primary leading-tight tracking-tight">{player?.name}</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase bg-accent/5 px-3">{teamCategory}</Badge>
                    <Badge className="bg-primary text-white text-[10px] font-black uppercase px-3 shadow-md">GR: {player?.generalRegisterNumber || 'N/A'}</Badge>
                  </div>
                </div>
                
                <div className="pt-6 border-t grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Standard</p>
                    <p className="text-xl font-black text-primary">Std {player?.std}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Attendance</p>
                    <p className="text-xl font-black text-primary">{playerAttendance.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-destructive/5 border-b p-6">
                <CardTitle className="text-xs font-black uppercase text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Medical History Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {playerIncidents.length === 0 ? (
                  <div className="py-10 text-center opacity-20">
                    <Stethoscope className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No medical alerts recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playerIncidents.map((inc: any) => (
                      <div key={inc.id} className="flex gap-4 border-l-4 border-destructive/20 pl-4 py-2 bg-destructive/[0.02] rounded-r-xl">
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{format(new Date(inc.date), 'dd MMM yyyy')}</p>
                          <p className="text-sm font-bold text-foreground/80 leading-relaxed italic">"{inc.description}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-slate-50 border-b p-8 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-3">
                  <ChartLine className="w-5 h-5 text-accent" /> Institutional Growth Trends
                </CardTitle>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[9px] font-bold text-muted-foreground uppercase">Total</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-[9px] font-bold text-muted-foreground uppercase">Stamina</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-muted-foreground uppercase">Speed</span></div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                {chartData.length < 2 ? (
                   <div className="h-[350px] flex flex-col items-center justify-center opacity-20 border-4 border-dashed rounded-[2rem]">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase text-sm tracking-widest">Insufficient trend data for visualization</p>
                   </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={5} fill="#0048A0" fillOpacity={0.08} />
                        <Line type="monotone" dataKey="stamina" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                        <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-lg">
                  <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4" /> Skill Mastery Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {skillMasteryData.length === 0 ? (
                       <div className="h-[250px] flex flex-col items-center justify-center opacity-10">
                          <Trophy className="w-12 h-12" />
                          <p className="text-[9px] font-black uppercase mt-2">No skill data</p>
                       </div>
                    ) : (
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={skillMasteryData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                               {skillMasteryData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                               ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                          {skillMasteryData.map((s, i) => (
                             <Badge key={i} variant="outline" className="text-[8px] font-black uppercase border-primary/20">
                                {s.name}: {s.score}
                             </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
               </Card>

               <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-lg flex flex-col">
                  <CardHeader className="bg-emerald-50 border-b p-6">
                    <CardTitle className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Attendance Consistency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                           <circle 
                              cx="80" cy="80" r="70" 
                              stroke="#10b981" 
                              strokeWidth="12" 
                              fill="transparent" 
                              strokeDasharray="440" 
                              strokeDashoffset={440 - (440 * (playerAttendance.present / (playerAttendance.total || 1)))} 
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black text-primary">{Math.round((playerAttendance.present / (playerAttendance.total || 1)) * 100)}%</span>
                           <span className="text-[9px] font-black text-muted-foreground uppercase">Stability</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-foreground/70 uppercase tracking-tight">{playerAttendance.present} of {playerAttendance.total} Total Sessions</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Registry Log Analysis</p>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
