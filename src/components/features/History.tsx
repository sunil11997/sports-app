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
  Cake
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
  Legend
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      endurance: parseFloat(f.enduranceScore) || 0
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

  const analyticalInsights = useMemo(() => {
    if (!player) return { plus: [], weak: [] };
    const plus: string[] = [];
    const weak: string[] = [];
    
    const latestFit = playerFitness[playerFitness.length - 1] || store.data.fitness[player.id] || {};
    const bmi = parseFloat(latestFit.bmi || player.bmi || "0");
    if (bmi < 18.5) weak.push("Underweight (Nutrition priority)");
    else if (bmi >= 18.5 && bmi <= 24.9) plus.push("Optimal Body Mass Index");
    else if (bmi > 25) weak.push("Overweight (Aerobic priority)");

    const fitScore = parseFloat(latestFit.score || "0");
    if (fitScore > 80) plus.push("Elite Physical Preparedness");
    if (fitScore < 50 && fitScore > 0) weak.push("Foundational Strength Deficit");
    
    return { plus, weak };
  }, [player, playerFitness, store.data.fitness]);

  const handlePrint = () => {
    if (!player) return;
    
    const photoHtml = player.photoUrl 
      ? `<img src="${player.photoUrl}" style="width:100%;height:100%;object-fit:cover;">`
      : 'ID PHOTO';

    const fitnessRows = playerFitness.map((f: any) => `
      <tr>
        <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td>
        <td>${f.score}%</td>
        <td>${f.strengthScore || 'N/A'}%</td>
        <td>${f.enduranceScore || 'N/A'}%</td>
        <td>${f.status}</td>
      </tr>
    `).join('');

    const insightsPlus = analyticalInsights.plus.map(p => `<li>${p}</li>`).join('');
    const insightsWeak = analyticalInsights.weak.map(w => `<li>${w}</li>`).join('');
    const medicalLogs = playerIncidents.length === 0 
      ? 'No recorded health incidents.' 
      : playerIncidents.map((i: any) => i.description).join('; ');

    const win = window.open('', '_blank');
    if (!win) return;

    const htmlContent = `
      <html>
        <head>
          <title>Institutional Dossier - ${player.name}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #111; }
            .header { text-align: center; border-bottom: 4px double #221d1d; padding-bottom: 15px; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .profile-grid { display: grid; grid-template-columns: 120px 1fr; gap: 30px; margin-bottom: 30px; }
            .photo-box { width: 120px; height: 150px; border: 2px solid #ddd; background: #eee; overflow: hidden; display: flex; align-items: center; justify-content: center; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
            .data-table th { background: #f2f2f2; }
            h3 { border-left: 5px solid #f59e0b; padding-left: 10px; text-transform: uppercase; font-size: 15px; margin-top: 30px; }
            .insight-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
            .box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #fafafa; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: bold; }
            .sign { border-top: 1px solid #000; width: 220px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">ASHRAM SHALA WAGHAMBA</div>
            <div style="font-weight: 800; font-size: 16px; margin-top: 5px;">ATHLETE PERFORMANCE & GROWTH DOSSIER</div>
          </div>
          <div class="profile-grid">
            <div class="photo-box">${photoHtml}</div>
            <div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="font-weight:900; width: 150px;">NAME:</td><td>${player.name}</td></tr>
                <tr><td style="font-weight:900;">GR NUMBER:</td><td>${player.generalRegisterNumber || 'N/A'}</td></tr>
                <tr><td style="font-weight:900;">STD / SR:</td><td>Std ${player.std} / #${player.serialNumber || '0'}</td></tr>
                <tr><td style="font-weight:900;">GENDER / AGE:</td><td>${player.gender} / ${player.age} Years</td></tr>
                <tr><td style="font-weight:900;">ASSIGNED SQUAD:</td><td>${teamCategory}</td></tr>
              </table>
            </div>
          </div>
          <h3>1. Performance History</h3>
          <table class="data-table">
            <thead><tr><th>DATE</th><th>SCORE</th><th>STR %</th><th>END %</th><th>STATUS</th></tr></thead>
            <tbody>${fitnessRows}</tbody>
          </table>
          <h3>2. Growth Insights</h3>
          <div class="insight-box">
            <div class="box"><strong>STRENGTHS:</strong><ul>${insightsPlus}</ul></div>
            <div class="box"><strong>DEVELOPMENT AREAS:</strong><ul>${insightsWeak}</ul></div>
          </div>
          <h3>3. Health & Participation</h3>
          <p style="font-size: 13px;"><strong>Attendance Record:</strong> ${playerAttendance.present} sessions present out of ${playerAttendance.total} logged. <strong>Medical Notes:</strong> ${medicalLogs}</p>
          <div class="footer"><div class="sign">Teacher Sunil Deshmukh</div><div class="sign">Institutional Principal</div></div>
        </body>
      </html>
    `;
    
    win.document.write(htmlContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
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
              {availablePlayers.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-xs tracking-widest shadow-md">
            <Printer className="w-4 h-4 mr-2" /> Export Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3rem] opacity-30">
          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
          <p className="font-black uppercase text-sm tracking-widest">Select an athlete to view institutional data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-accent" />
              <CardContent className="p-8 space-y-6 text-center">
                <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-2xl mx-auto">
                  <AvatarImage src={player?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-4xl uppercase">{player?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-black uppercase text-2xl text-primary leading-tight">{player?.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase">{teamCategory}</Badge>
                    <Badge className="bg-primary text-white text-[10px] font-black uppercase">GR: {player?.generalRegisterNumber || 'N/A'}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dashed">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1 justify-center"><Cake className="w-3 h-3" /> Birthday</p>
                    <p className="text-xs font-bold text-primary">{player?.dob ? format(new Date(player.dob), 'dd MMM yyyy') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1 justify-center"><HistoryIcon className="w-3 h-3" /> Age</p>
                    <p className="text-xs font-bold text-primary">{player?.age} Yrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-destructive/5 border-b p-6">
                <CardTitle className="text-sm font-black uppercase text-destructive flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Health Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {playerIncidents.length === 0 ? (
                  <div className="py-8 text-center space-y-2 opacity-20">
                    <CheckCircle2 className="w-10 h-10 mx-auto" />
                    <p className="text-[10px] font-black uppercase">Clear Record</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playerIncidents.map((inc: any) => (
                      <div key={inc.id} className="flex gap-3 border-l-4 border-destructive/20 pl-4 py-1">
                        <div className="shrink-0 pt-1"><AlertCircle className="w-3 h-3 text-destructive" /></div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yy')}</p>
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
              <Card className="border-2 rounded-[2.5rem] bg-emerald-50/50 p-6 border-emerald-100">
                <h4 className="text-xs font-black text-emerald-800 uppercase flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5" /> Strengths (+)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.plus.map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-emerald-900/70">
                      <Star className="w-3 h-3 text-emerald-600 fill-emerald-600 mt-0.5 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-2 rounded-[2.5rem] bg-orange-50/50 p-6 border-orange-100">
                <h4 className="text-xs font-black text-orange-800 uppercase flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" /> Focus Areas (-)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.weak.map((w, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-orange-900/70">
                      <Zap className="w-3 h-3 text-orange-600 fill-orange-600 mt-0.5 shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase text-primary flex items-center gap-2">
                  <ChartLine className="w-4 h-4 text-accent" /> Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {chartData.length < 2 ? (
                   <div className="h-[300px] flex flex-col items-center justify-center space-y-4 opacity-20">
                      <TrendingUp className="w-12 h-12" />
                      <p className="font-black uppercase text-xs">Waiting for more data points...</p>
                   </div>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={4} fill="#0048A0" fillOpacity={0.05} name="Total Score" />
                        <Line type="monotone" dataKey="strength" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Strength" />
                        <Line type="monotone" dataKey="endurance" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Endurance" />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
