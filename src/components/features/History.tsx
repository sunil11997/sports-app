
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
  History as HistoryIcon,
  Cake,
  UsersRound,
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
  AreaChart,
  Area,
  Line,
  LineChart,
  Legend
} from 'recharts';
import { ChartSkeleton, DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
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

  const playerAttendance = useMemo(() => {
    if (!selectedPlayerId) return { present: 0, total: 0 };
    let present = 0;
    let entries = Object.keys(store.data.attendance).filter(k => k.startsWith(selectedPlayerId));
    entries.forEach(k => {
      if (store.data.attendance[k] === 'P') present++;
    });
    return { present, total: entries.length };
  }, [selectedPlayerId, store.data.attendance]);

  const chartData = useMemo(() => {
    return playerFitness.map(f => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      strength: parseFloat(f.strengthScore) || 0,
      endurance: parseFloat(f.enduranceScore) || 0,
      bmi: parseFloat(f.bmi) || 0
    }));
  }, [playerFitness]);

  const teamCategory = useMemo(() => {
    if (!player) return "N/A";
    const age = parseInt(player.age) || 0;
    const gender = player.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14 Squad`;
    if (age < 17) return `${gender} U17 Squad`;
    return `${gender} Senior Squad`;
  }, [player]);

  const analyticalInsights = useMemo(() => {
    if (!player) return { plus: [], weak: [] };
    const plus: string[] = [];
    const weak: string[] = [];
    
    const latestFit = playerFitness[playerFitness.length - 1] || store.data.fitness[player.id] || {};
    
    const bmi = parseFloat(latestFit.bmi || player.bmi);
    if (bmi < 18.5) weak.push("Underweight (Nutrition priority)");
    else if (bmi >= 18.5 && bmi <= 24.9) plus.push("Optimal Body Mass Index");
    else if (bmi > 25) weak.push("Overweight (Aerobic priority)");

    const fitScore = parseFloat(latestFit.score);
    if (fitScore > 80) plus.push("Elite Physical Preparedness");
    if (fitScore < 50 && fitScore > 0) weak.push("Foundational Strength Deficit");
    
    if (parseFloat(latestFit.enduranceScore) > 85) plus.push("Exceptional Aerobic Recovery");
    if (parseFloat(latestFit.strengthScore) > 85) plus.push("Superior Explosive Power");

    return { plus, weak };
  }, [player, playerFitness, store.data.fitness]);

  const handlePrint = () => {
    if (!player) return;
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Institutional Performance Dossier - ${player.name}</title>
          <style>
            @media print { @page { size: A4; margin: 1.5cm; } }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; line-height: 1.4; }
            .header { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 15px; margin-bottom: 30px; }
            .school-name { font-size: 22px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .report-title { font-size: 16px; font-weight: 800; margin-top: 5px; text-decoration: underline; }
            .profile-grid { display: grid; grid-template-columns: 120px 1fr; gap: 30px; margin-bottom: 30px; }
            .photo-box { width: 120px; height: 150px; border: 2px solid #ddd; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 10px; text-transform: uppercase; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            .data-table th { background: #f2f2f2; font-weight: 900; }
            h3 { text-transform: uppercase; font-size: 14px; border-left: 5px solid #F59E0B; padding-left: 10px; margin-top: 30px; }
            .insight-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; font-size: 12px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: 900; }
            .sign { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div class="report-title">ATHLETE PERFORMANCE & GROWTH DOSSIER</div>
          </div>

          <div class="profile-grid">
            <div class="photo-box">
              ${player.photoUrl ? `<img src="${player.photoUrl}" style="width:100%;height:100%;object-fit:cover;">` : 'ID PHOTO'}
            </div>
            <div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="font-weight:900; width: 150px;">NAME:</td><td style="text-transform:uppercase;">${player.name}</td></tr>
                <tr><td style="font-weight:900;">GR NUMBER:</td><td>${player.generalRegisterNumber || 'N/A'}</td></tr>
                <tr><td style="font-weight:900;">STANDARD / SR:</td><td>Std ${player.std} / #${player.serialNumber || '0'}</td></tr>
                <tr><td style="font-weight:900;">GENDER / AGE:</td><td>${player.gender} / ${player.age} Years</td></tr>
                <tr><td style="font-weight:900;">BIRTHDAY:</td><td>${player.dob ? format(new Date(player.dob), 'PPPP') : 'N/A'}</td></tr>
                <tr><td style="font-weight:900;">CURRENT BMI:</td><td>${player.bmi} (Status: ${analyticalInsights.plus.includes("Optimal Body Mass Index") ? 'Fit' : 'Monitor'})</td></tr>
                <tr><td style="font-weight:900;">ASSIGNED SQUAD:</td><td>${teamCategory}</td></tr>
              </table>
            </div>
          </div>

          <h3>1. Institutional Growth Matrix (Fitness History)</h3>
          <table class="data-table">
            <thead>
              <tr><th>ASSESSMENT DATE</th><th>AGGREGATE SCORE</th><th>STRENGTH %</th><th>ENDURANCE %</th><th>TERM RATING</th></tr>
            </thead>
            <tbody>
              ${playerFitness.map(f => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td>
                  <td>${f.score}%</td>
                  <td>${f.strengthScore || 'N/A'}%</td>
                  <td>${f.enduranceScore || 'N/A'}%</td>
                  <td>${f.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>2. Performance Insights & Diagnostics</h3>
          <div class="insight-box">
            <div class="box">
              <strong>STRENGTHS & COMPETENCIES:</strong>
              <ul>${analyticalInsights.plus.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
            <div class="box">
              <strong>AREAS FOR DEVELOPMENT:</strong>
              <ul>${analyticalInsights.weak.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
          </div>

          <h3>3. Health & Attendance Summary</h3>
          <p style="font-size: 12px;">
            <strong>Attendance Record:</strong> ${playerAttendance.present} Days Present out of ${playerAttendance.total} Logged Sessions.<br/>
            <strong>Medical Notes:</strong> ${playerIncidents.length === 0 ? 'No recorded health incidents.' : playerIncidents.map(i => i.description).join('; ')}
          </p>

          <div class="footer">
            <div class="sign">Teacher Sunil Deshmukh<br/>(P.E. Director)</div>
            <div class="sign">Institutional Principal<br/>(Official Signature)</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    win?.document.write(content);
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
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Athlete Dashboard</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">360° Institutional Dossier</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-12 text-md font-bold bg-white rounded-xl border-2 shadow-sm">
              <SelectValue placeholder="Select Athlete..." />
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
          <p className="font-black uppercase text-sm tracking-widest">Select an athlete to view comprehensive institutional data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden relative">
              <div className="h-2 w-full bg-accent" />
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-2xl">
                    <AvatarImage src={player?.photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary font-black text-4xl uppercase">{player?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-black uppercase text-2xl text-primary leading-tight">{player?.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase">{teamCategory}</Badge>
                      <Badge className="bg-primary text-white text-[10px] font-black uppercase">GR: {player?.generalRegisterNumber || 'N/A'}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1"><Cake className="w-3 h-3" /> Birthday</p>
                    <p className="text-xs font-bold text-primary">{player?.dob ? format(new Date(player.dob), 'dd MMM yyyy') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1"><HistoryIcon className="w-3 h-3" /> Age</p>
                    <p className="text-xs font-bold text-primary">{player?.age} Years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3" /> BMI</p>
                    <p className="text-xs font-bold text-primary">{player?.bmi}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1"><UsersRound className="w-3 h-3" /> Attendance</p>
                    <p className="text-xs font-bold text-primary">{Math.round((playerAttendance.present / (playerAttendance.total || 1)) * 100)}% Presence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-destructive/5 border-b p-6">
                <CardTitle className="text-sm font-black uppercase text-destructive tracking-widest flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Health & Medical Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {playerIncidents.length === 0 ? (
                  <div className="py-8 text-center space-y-2 opacity-20">
                    <CheckCircle2 className="w-10 h-10 mx-auto" />
                    <p className="text-[10px] font-black uppercase">Clear Medical Record</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playerIncidents.map((inc: any) => (
                      <div key={inc.id} className="flex gap-3 border-l-4 border-destructive/20 pl-4 py-1">
                        <div className="shrink-0 pt-1"><AlertCircle className="w-3 h-3 text-destructive" /></div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yyyy')}</p>
                          <p className="text-xs font-bold text-foreground/80 leading-snug">{inc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 rounded-[2.5rem] bg-emerald-50/50 p-6 shadow-sm border-emerald-100 group transition-all">
                <h4 className="text-xs font-black text-emerald-800 uppercase flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5" /> Institutional Insights (+)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.plus.map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-emerald-900/70 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i*100}ms` }}>
                      <Star className="w-3 h-3 text-emerald-600 fill-emerald-600 mt-0.5 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-2 rounded-[2.5rem] bg-orange-50/50 p-6 shadow-sm border-orange-100">
                <h4 className="text-xs font-black text-orange-800 uppercase flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" /> Development Areas (-)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.weak.map((w, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-orange-900/70 animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i*100}ms` }}>
                      <Zap className="w-3 h-3 text-orange-600 fill-orange-600 mt-0.5 shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <ChartLine className="w-4 h-4 text-accent" /> Physical Growth Trends
                </CardTitle>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[8px] font-black uppercase text-muted-foreground">Agg Score</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-[8px] font-black uppercase text-muted-foreground">Strength</span></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {chartData.length < 2 ? (
                   <div className="h-[300px] flex flex-col items-center justify-center space-y-4 opacity-20">
                      <TrendingUp className="w-12 h-12" />
                      <p className="font-black uppercase text-xs">Waiting for longitudinal data...</p>
                   </div>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" x1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0048A0" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0048A0" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" name="Aggregate Score" />
                        <Line type="monotone" dataKey="strength" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} name="Strength" />
                        <Line type="monotone" dataKey="endurance" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} name="Endurance" />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 rounded-[2.5rem] bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-accent/10 p-5 border-b">
                  <CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Technical Mastery (Last 3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   {Object.values(store.data.sportSkills)
                    .filter((s: any) => s.playerId === selectedPlayerId)
                    .slice(-3)
                    .map((skill: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-2xl border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border"><Dumbbell className="w-4 h-4 text-primary" /></div>
                          <span className="text-[10px] font-black uppercase text-primary">{skill.sportName}</span>
                        </div>
                        <span className="text-lg font-black text-primary">{skill.score}%</span>
                      </div>
                    ))}
                    {Object.values(store.data.sportSkills).filter((s: any) => s.playerId === selectedPlayerId).length === 0 && (
                      <p className="text-[10px] font-bold uppercase text-muted-foreground italic text-center opacity-30 py-4">No technical records logged</p>
                    )}
                </CardContent>
              </Card>

              <Card className="border-2 rounded-[2.5rem] bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/5 p-5 border-b">
                  <CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Institutional Timeline
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableBody>
                      {[...playerFitness].reverse().map((fit: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-primary/5 h-12">
                          <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(fit.updatedAt || fit.date || new Date()), 'MMM yyyy')}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className="font-black text-[9px] uppercase">{fit.status}</Badge></TableCell>
                          <TableCell className="text-right font-black text-primary text-xs">{fit.score}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

