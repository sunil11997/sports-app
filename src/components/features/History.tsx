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
  Users
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
      : '<div style="background:#eee;height:100%;display:flex;align-items:center;justify-center;font-size:10px;">ID PHOTO</div>';

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
      : playerIncidents.map((i: any) => `${format(new Date(i.date), 'dd MMM yy')}: ${i.description}`).join('; ');

    const win = window.open('', '_blank');
    if (!win) return;

    const htmlContent = `
      <html>
        <head>
          <title>Dossier - ${player.name}</title>
          <style>
            @media print { @page { size: A4; margin: 1cm; } }
            body { font-family: 'Inter', sans-serif; padding: 20px; line-height: 1.4; color: #111; font-size: 12px; }
            .header { text-align: center; border-bottom: 4px double #0048A0; padding-bottom: 10px; margin-bottom: 25px; }
            .school-name { font-size: 22px; font-weight: 900; color: #0048A0; text-transform: uppercase; }
            .profile-grid { display: grid; grid-template-columns: 100px 1fr; gap: 20px; margin-bottom: 20px; }
            .photo-box { width: 100px; height: 120px; border: 1px solid #ddd; overflow: hidden; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .data-table th, .data-table td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 11px; }
            .data-table th { background: #f5f5f5; }
            h3 { border-left: 4px solid #F59E0B; padding-left: 8px; text-transform: uppercase; font-size: 13px; margin-top: 20px; color: #0048A0; }
            .insight-box { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
            .box { border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: #fafafa; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; }
            .sign { border-top: 1px solid #000; width: 180px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">ASHRAM SHALA WAGHAMBA</div>
            <div style="font-weight: 800; font-size: 14px;">INSTITUTIONAL ATHLETE PERFORMANCE DOSSIER</div>
          </div>
          <div class="profile-grid">
            <div class="photo-box">${photoHtml}</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="font-weight:900; width: 120px;">STUDENT NAME:</td><td>${player.name.toUpperCase()}</td></tr>
              <tr><td style="font-weight:900;">GR / SERIAL NO:</td><td>${player.generalRegisterNumber || 'N/A'} / #${player.serialNumber || '0'}</td></tr>
              <tr><td style="font-weight:900;">CLASS / SQUAD:</td><td>Std ${player.std} / ${teamCategory}</td></tr>
              <tr><td style="font-weight:900;">GENDER / AGE:</td><td>${player.gender} / ${player.age} Yrs</td></tr>
              <tr><td style="font-weight:900;">ATTENDANCE:</td><td>${playerAttendance.present} Sessions Present</td></tr>
            </table>
          </div>
          <h3>1. Historical Growth Log</h3>
          <table class="data-table">
            <thead><tr><th>DATE</th><th>SCORE</th><th>STRENGTH %</th><th>ENDURANCE %</th><th>INSTITUTIONAL STATUS</th></tr></thead>
            <tbody>${fitnessRows}</tbody>
          </table>
          <h3>2. Growth Analysis</h3>
          <div class="insight-box">
            <div class="box"><strong>STRENGTHS (+):</strong><ul>${insightsPlus || 'None recorded'}</ul></div>
            <div class="box"><strong>FOCUS AREAS (-):</strong><ul>${insightsWeak || 'None recorded'}</ul></div>
          </div>
          <h3>3. Health & Medical Summary</h3>
          <div class="box">${medicalLogs}</div>
          <div class="footer"><div class="sign">Teacher Sunil Deshmukh</div><div class="sign">Institutional Principal</div></div>
        </body>
      </html>
    `;
    
    win.document.write(htmlContent);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
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
          <Button disabled={!selectedPlayerId} onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-xs tracking-widest shadow-md active-scale">
            <Printer className="w-4 h-4 mr-2" /> Export A4 Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3rem] opacity-30">
          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
          <p className="font-black uppercase text-sm tracking-widest">Select an athlete to view progress</p>
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
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
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
                    <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1 justify-center"><Users className="w-3 h-3" /> Presence</p>
                    <p className="text-xs font-bold text-primary">{playerAttendance.present} Sessions</p>
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
                    <p className="text-[10px] font-black uppercase">Clear Medical Record</p>
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
                  <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" /> Plus Points (+)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.plus.length > 0 ? analyticalInsights.plus.map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-emerald-900/70">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" /> {p}
                    </div>
                  )) : <p className="text-[10px] font-bold text-muted-foreground uppercase">Recording baseline data...</p>}
                </div>
              </Card>
              <Card className="border-2 rounded-[2.5rem] bg-orange-50/50 p-6 border-orange-100">
                <h4 className="text-xs font-black text-orange-800 uppercase flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-orange-600 fill-orange-600" /> Focus Areas (-)
                </h4>
                <div className="space-y-3">
                  {analyticalInsights.weak.length > 0 ? analyticalInsights.weak.map((w, i) => (
                    <div key={i} className="flex gap-2 text-xs font-bold text-orange-900/70">
                      <Target className="w-3 h-3 text-orange-600 mt-0.5 shrink-0" /> {w}
                    </div>
                  )) : <p className="text-[10px] font-bold text-muted-foreground uppercase">Performing at standard levels.</p>}
                </div>
              </Card>
            </div>

            <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase text-primary flex items-center gap-2">
                  <ChartLine className="w-4 h-4 text-accent" /> Growth Trends
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[8px] font-black uppercase bg-white">Standard: {player?.std}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {chartData.length < 2 ? (
                   <div className="h-[300px] flex flex-col items-center justify-center space-y-4 opacity-20">
                      <TrendingUp className="w-12 h-12" />
                      <p className="font-black uppercase text-xs">Waiting for more testing data...</p>
                   </div>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={4} fill="#0048A0" fillOpacity={0.05} name="Aggregate" />
                        <Line type="monotone" dataKey="strength" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Strength %" />
                        <Line type="monotone" dataKey="endurance" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Endurance %" />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
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
