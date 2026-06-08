"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Printer, 
  TrendingUp, 
  ChartLine, 
  Target, 
  Ruler, 
  Activity, 
  BrainCircuit, 
  Medal, 
  Zap, 
  InfoIcon, 
  Timer, 
  MoveUpRight 
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
} from 'recharts';
import { DashboardHomeSkeleton } from '@/components/ui/loading-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function PerformanceDossier({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';
  const isMarathi = language === 'Marathi';

  const availablePlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = Number(a.std) || 0;
        const stdB = Number(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral]);

  const currentPlayer = useMemo(() => 
    (store.data.players || []).find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const currentFitness = useMemo(() => 
    store.data.fitness[selectedPlayerId] || null,
    [selectedPlayerId, store.data.fitness]
  );

  const phvData = useMemo(() => {
    if (!currentPlayer?.height || !currentPlayer?.weight || !currentPlayer?.age) return null;
    
    const h = parseFloat(currentPlayer.height);
    const w = parseFloat(currentPlayer.weight);
    const age = currentPlayer.age;
    
    const sH = parseFloat(currentPlayer.sittingHeight || (h * 0.52).toFixed(1));
    const legL = h - sH;

    let offset = 0;
    if (currentPlayer.gender === 'Male') {
      offset = -9.236 + (0.0002708 * (legL * sH)) + (-0.001663 * (age * legL)) + (0.007216 * (age * sH)) + (0.02292 * ((w / h) * 100));
    } else {
      offset = -9.376 + (0.0001881 * (legL * sH)) + (0.022 * (age * legL)) + (0.005841 * (age * sH)) + (-0.002658 * (age * w)) + (0.03322 * ((w / h) * 100));
    }

    const offsetNum = parseFloat(offset.toFixed(2));
    
    let coachingAdvice = "";
    if (offsetNum < -1.0) {
      coachingAdvice = "Pre-Growth Spurt: Focus on skill coordination and foundational motor learning.";
    } else if (offsetNum >= -1.0 && offsetNum <= 1.0) {
      coachingAdvice = "Circa-PHV (Active Spurt): High injury risk. Focus on core stability and flexibility.";
    } else {
      coachingAdvice = "Post-Growth Spurt: Peak window for power and speed development.";
    }

    return {
      offset: offset.toFixed(2),
      offsetNum,
      status: offsetNum < 0 ? 'Pre-growth spurt' : 'Post-growth spurt',
      sittingHeight: sH,
      legLength: legL.toFixed(1),
      coachingAdvice,
      biologicalAge: (age + offsetNum).toFixed(1)
    };
  }, [currentPlayer]);

  const playerFitnessHistory = useMemo(() => 
    (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date || 0).getTime() - new Date(b.updatedAt || b.date || 0).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const chartData = useMemo(() => {
    return playerFitnessHistory.map((f: any) => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      agility: parseFloat(f.agilityScore) || 0,
      stamina: parseFloat(f.enduranceScore) || 0,
    }));
  }, [playerFitnessHistory]);

  const handlePrintDossier = () => {
    if (!currentPlayer) return;
    const isM = isMarathi;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? 'खेळाडू कामगिरी डोसियर आणि बायोलॉजिकल ऑडिट' 
      : 'Athletic Performance Dossier & Biological Audit';
    const displayName = isM ? (currentPlayer.nameMarathi || currentPlayer.name) : currentPlayer.name;

    const printContent = `
      <html>
        <head>
          <title>Performance Dossier - ${currentPlayer.name}</title>
          <style>
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none !important; } }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.5; color: #111; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 20px; }
            .report-title { font-weight: 800; text-transform: uppercase; margin-top: 5px; text-decoration: underline; }
            .meta { font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .section-title { font-size: 14px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; border-left: 5px solid #f59e0b; padding-left: 10px; margin: 25px 0 10px 0; }
            .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-val { font-size: 18px; font-weight: 900; color: #1e3a8a; }
            .stat-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: center; font-size: 11px; }
            th { background: #f8f8f8; font-weight: 900; }
            .advice-box { background: #f0f7ff; padding: 15px; border-radius: 8px; border: 1px dashed #1e3a8a; font-style: italic; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'GO BACK'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? 'प्रिंट करा' : 'CONFIRM PRINT'}</button>
          </div>
          <div class="header">
            <h1>${schoolName}</h1>
            <div class="report-title">${reportTitle}</div>
          </div>
          <div class="meta">
            <span>${isM ? 'नाव' : 'ATHLETE'}: ${displayName.toUpperCase()}</span>
            <span>${isM ? 'इयत्ता' : 'STD'}: ${currentPlayer.std}</span>
            <span>${isM ? 'नोंदणी क्र.' : 'IDENTITY'}: ${currentPlayer.generalRegisterNumber || currentPlayer.aadharNumber || 'N/A'}</span>
          </div>

          <div class="section-title">1. Physical & Biological Maturity (PHV)</div>
          <div class="stat-grid">
            <div class="stat-box"><div class="stat-val">${currentPlayer.height} cm</div><div class="stat-label">Height</div></div>
            <div class="stat-box"><div class="stat-val">${currentPlayer.weight} kg</div><div class="stat-label">Weight</div></div>
            <div class="stat-box"><div class="stat-val">${phvData?.offset} Yrs</div><div class="stat-label">PHV Offset</div></div>
          </div>
          <p style="margin-top:15px;"><strong>Biological Status:</strong> ${phvData?.status}</p>
          <div class="advice-box">"Coaching Advice: ${phvData?.coachingAdvice}"</div>

          <div class="section-title">2. Latest Performance Metrics (%)</div>
          <div class="stat-grid">
            <div class="stat-box"><div class="stat-val">${currentFitness?.score || 0}%</div><div class="stat-label">Aggregate Fitness</div></div>
            <div class="stat-box"><div class="stat-val">${currentFitness?.speedScore || 0}%</div><div class="stat-label">Speed Rating</div></div>
            <div class="stat-box"><div class="stat-val">${currentFitness?.enduranceScore || 0}%</div><div class="stat-label">Stamina Rating</div></div>
          </div>

          <div class="section-title">3. Historical Progress Log</div>
          <table>
            <thead>
              <tr><th>DATE</th><th>SCORE</th><th>SPEED</th><th>STAMINA</th><th>AGILITY</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              ${playerFitnessHistory.slice().reverse().map((f: any) => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date || new Date()), 'dd MMM yyyy')}</td>
                  <td>${f.score}%</td>
                  <td>${f.speedScore || '-'}%</td>
                  <td>${f.enduranceScore || '-'}%</td>
                  <td>${f.agilityScore || '-'}%</td>
                  <td>${f.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="font-size: 8px; margin-top: 50px; text-align: center; opacity: 0.5;">Waghamba Institutional Hub Registry Engine v4.3.22</p>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <BarChart className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Performance Dossier</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry Progress Hub v4.3.22</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-14 text-md font-bold bg-white rounded-2xl border-2 shadow-sm">
              <SelectValue placeholder="Identify Student..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {isMarathi ? (p.nameMarathi || p.name) : p.name} (Std {p.std})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrintDossier} className="bg-primary text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-xl active-scale">
            <Printer className="w-4 h-4 mr-2" /> Export Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center text-muted-foreground border-4 border-dashed rounded-[3.5rem] opacity-30 bg-white/50 backdrop-blur-sm">
          <TrendingUp className="w-20 h-20 mx-auto mb-6 text-primary" />
          <p className="font-black uppercase text-lg tracking-widest text-primary">Identify an entry to access metrics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardContent className="p-8 space-y-8 text-center">
                <Avatar className="w-40 h-40 border-4 border-primary/10 shadow-2xl mx-auto">
                  <AvatarImage src={currentPlayer?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-5xl uppercase">{currentPlayer?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h3 className="font-black uppercase text-3xl text-primary leading-tight tracking-tight">
                    {isMarathi ? (currentPlayer?.nameMarathi || currentPlayer?.name) : currentPlayer?.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-black border-accent/30 text-accent uppercase">Std {currentPlayer?.std} Registry</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-6">
                 <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-accent" /> PHV Maturity
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {phvData && (
                  <>
                    <div className={cn(
                      "p-8 rounded-[2.5rem] border-2 shadow-inner text-center space-y-3",
                      phvData.offsetNum < 0 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
                    )}>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maturity Offset</p>
                      <p className={cn("text-5xl font-black tracking-tighter", phvData.offsetNum < 0 ? "text-emerald-700" : "text-orange-700")}>
                        {phvData.offset} <span className="text-sm">Yrs</span>
                      </p>
                      <Badge className={cn("font-black uppercase text-[10px] px-6 py-1 rounded-full", phvData.offsetNum < 0 ? "bg-emerald-600 text-white" : "bg-orange-600 text-white")}>
                        {phvData.status}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-primary uppercase flex items-center gap-2">
                         <BrainCircuit className="w-4 h-4 text-accent" /> Focus Advice
                       </h4>
                       <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10">
                          <p className="text-xs font-bold text-foreground/70 leading-relaxed italic">&quot;{phvData.coachingAdvice}&quot;</p>
                       </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-3">
                  <ChartLine className="w-5 h-5 text-accent" /> Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {chartData.length < 1 ? (
                   <div className="h-[400px] flex flex-col items-center justify-center opacity-20 border-4 border-dashed rounded-[2rem]">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase text-sm tracking-widest">Awaiting Archive Entry</p>
                   </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#0048A0" strokeWidth={5} fill="#0048A0" fillOpacity={0.08} name="Aggregate Score" />
                        <Line type="monotone" dataKey="stamina" stroke="#f59e0b" strokeWidth={3} name="Endurance" />
                        <Line type="monotone" dataKey="agility" stroke="#10b981" strokeWidth={3} name="Agility" />
                        <Legend verticalAlign="top" iconType="circle" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl flex flex-col">
              <CardHeader className="bg-primary p-8 text-white">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent" /> Registry Archive
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {playerFitnessHistory.slice().reverse().map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase">{format(new Date(f.updatedAt || f.date || new Date()), 'MMMM yyyy')}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{f.status} Rank</span>
                         </div>
                         <div className="text-right">
                            <span className="text-xl font-black text-primary">{f.score}%</span>
                         </div>
                      </div>
                    ))}
                    {playerFitnessHistory.length === 0 && (
                      <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/40">No records found</p>
                    )}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}