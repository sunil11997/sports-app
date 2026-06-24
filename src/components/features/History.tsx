"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Printer, 
  TrendingUp, 
  ChartLine, 
  Activity, 
  BrainCircuit, 
  CalendarDays,
  ShieldAlert,
  ClipboardList,
  Search,
  History,
  Target,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { format, subDays, isAfter, startOfDay, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn, shareToWhatsApp } from '@/lib/utils';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Player } from '@/lib/types';

export function PerformanceDossier({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const isGeneral = section === 'general';
  const isMarathi = language === 'Marathi';

  const availablePlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: Player) => isGeneral ? true : p.category === 'athlete')
      .filter((p: Player) => {
        const query = searchTerm.toLowerCase();
        const matchesName = (p.name || "").toLowerCase().includes(query) || (p.nameMarathi || "").includes(searchTerm);
        const matchesGR = (p.generalRegisterNumber || "").includes(searchTerm);
        return matchesName || matchesGR;
      })
      .sort((a: Player, b: Player) => {
        const stdA = Number(a.std) || 0;
        const stdB = Number(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, searchTerm]);

  const currentPlayer = useMemo(() => 
    (store.data.players || []).find((p: Player) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const medicalHistory = useMemo(() => 
    (store.data.healthIncidents || []).filter((h: any) => h.playerId === selectedPlayerId),
    [selectedPlayerId, store.data.healthIncidents]
  );

  const attendanceStats = useMemo(() => {
    if (!selectedPlayerId) return { rate: 0, streak: 0 };
    const today = startOfDay(new Date());
    let presentCount = 0;
    let streak = 0;
    let streakBroken = false;

    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      const isPresent = store.data.attendance[`${selectedPlayerId}_${d}_Morning`] === 'P' || 
                        store.data.attendance[`${selectedPlayerId}_${d}_Evening`] === 'P';
      if (isPresent) {
        presentCount++;
        if (!streakBroken) streak++;
      } else {
        streakBroken = true;
      }
    }
    return { rate: Math.round((presentCount / 30) * 100), streak };
  }, [selectedPlayerId, store.data.attendance]);

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
    let advice = offsetNum < -1.0 ? "Pre-Growth Spurt: Skill coordination focus." : offsetNum <= 1.0 ? "Circa-PHV: High injury risk. Focus on core stability." : "Post-Growth Spurt: Peak window for power.";

    return { offset: offset.toFixed(2), offsetNum, status: offsetNum < 0 ? 'Pre-growth spurt' : 'Post-growth spurt', advice };
  }, [currentPlayer]);

  const historyData = useMemo(() => 
    (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(a.updatedAt || a.date || 0).getTime() - new Date(b.updatedAt || b.date || 0).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const chartData = useMemo(() => 
    historyData.map((f: any) => ({
      date: format(new Date(f.updatedAt || f.date || new Date()), 'MMM yy'),
      score: parseFloat(f.score) || 0,
      stamina: parseFloat(f.enduranceScore || '0') || 0,
    })),
  [historyData]);

  const handleWhatsAppShare = () => {
    if (!currentPlayer) return;
    const profile = store.data.schoolProfile;
    const lastFit = historyData[historyData.length - 1] || {};
    
    shareToWhatsApp({
      phone: currentPlayer.mobileNumber,
      schoolName: profile.schoolName,
      teacherName: profile.teacherName,
      studentName: isMarathi ? (currentPlayer.nameMarathi || currentPlayer.name) : currentPlayer.name,
      std: currentPlayer.std,
      age: currentPlayer.age,
      dob: currentPlayer.dob,
      bmi: currentPlayer.bmi || "---",
      height: currentPlayer.height || "---",
      weight: currentPlayer.weight || "---",
      reportType: "सर्वसमावेशक इतिहास (Dossier)",
      reportData: `उपस्थिती (30-दिवस): ${attendanceStats.rate}%\nअखेरचा फिटनेस स्कोअर: ${lastFit.score || '0'}%\nPHV मॅच्युरिटी: ${phvData?.offset}yr`
    });
  };

  const handlePrintDossier = () => {
    if (!currentPlayer) return;
    const isM = isMarathi;
    const displayName = isM ? (currentPlayer.nameMarathi || currentPlayer.name) : currentPlayer.name;
    const printContent = `
      <html>
        <head>
          <title>Institutional History - ${currentPlayer.name}</title>
          <style>
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none !important; } }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.4; color: #111; font-size: 11px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 18px; }
            .section-title { font-size: 12px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; border-left: 5px solid #f59e0b; padding-left: 10px; margin: 20px 0 10px 0; background: #f8fafc; }
            .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .stat-box { border: 1px solid #ddd; padding: 10px; border-radius: 8px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #eee; padding: 6px; text-align: left; }
            th { background: #f8f8f8; font-weight: 900; text-transform: uppercase; font-size: 9px; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print" style="position:fixed; top:0; left:0; right:0; background:#1e3a8a; padding:15px; display:flex; justify-content:space-between; z-index:1000;">
            <button onclick="window.close()" style="color:white; background:none; border:1px solid white; padding:5px 15px; border-radius:5px; cursor:pointer;">CLOSE</button>
            <button onclick="window.print()" style="background:#f59e0b; color:white; border:none; padding:5px 25px; border-radius:5px; font-weight:900; cursor:pointer;">PRINT HISTORY</button>
          </div>
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
            <div style="font-weight:800; text-transform:uppercase; margin-top:5px;">Institutional Consolidated Registry (Dossier)</div>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:800; border-bottom:1px solid #eee; padding-bottom:10px;">
            <span>STUDENT: ${displayName.toUpperCase()}</span>
            <span>STD: ${currentPlayer.std}</span>
            <span>GR NO: ${currentPlayer.generalRegisterNumber || '---'}</span>
          </div>

          <div class="section-title">1. Biometrics & Maturity</div>
          <div class="stat-grid">
            <div class="stat-box"><div>HT: ${currentPlayer.height}cm</div></div>
            <div class="stat-box"><div>WT: ${currentPlayer.weight}kg</div></div>
            <div class="stat-box"><div>PHV: ${phvData?.offset}yr</div></div>
            <div class="stat-box"><div>ATT: ${attendanceStats.rate}%</div></div>
          </div>

          <div class="section-title">2. Historical Performance Archive</div>
          <table>
            <thead><tr><th>DATE/TERM</th><th>SCORE</th><th>SPEED/METRIC</th><th>STAMINA/METRIC</th><th>STATUS</th></tr></thead>
            <tbody>
              ${historyData.slice().reverse().map((h: any) => `
                <tr>
                  <td>${h.month ? format(new Date(h.month + "-01"), 'MMM yyyy') : (h.term || '---')}</td>
                  <td>${h.score}%</td>
                  <td>${h.metric1 || h.speedScore || '-'}%</td>
                  <td>${h.metric2 || h.enduranceScore || '-'}%</td>
                  <td>${h.status || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">3. Medical & Incident Registry</div>
          <table>
            <thead><tr><th>DATE</th><th>DESCRIPTION / DIAGNOSIS</th><th>SEVERITY</th></tr></thead>
            <tbody>
              ${medicalHistory.length === 0 ? '<tr><td colspan="3">No medical alerts recorded.</td></tr>' : medicalHistory.map((m: any) => `
                <tr><td>${m.date}</td><td>${m.description}</td><td>${m.severity}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top:40px; text-align:center; opacity:0.5; font-size:8px;">WGB Registry Pulse v4.3.26 • System Synchronized</p>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/10 shadow-inner">
            <History className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional History</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Registry Dossier v4.3.26</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Find student/GR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-11 rounded-full border-2 bg-muted/20" />
          </div>
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue placeholder="Pick student..." /></SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => (<SelectItem key={p.id} value={p.id}>{isMarathi ? (p.nameMarathi || p.name) : p.name} (Std {p.std})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center border-4 border-dashed rounded-[3.5rem] opacity-20 bg-white/50">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary" />
          <p className="font-black uppercase tracking-[0.2em]">Select an entry to view exhaustive records</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardContent className="p-8 text-center space-y-6">
                <Avatar className="w-40 h-40 border-4 border-primary/5 shadow-2xl mx-auto">
                  <AvatarImage src={currentPlayer?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">{currentPlayer?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                   <h3 className="text-3xl font-black text-primary uppercase leading-tight">{isMarathi ? (currentPlayer?.nameMarathi || currentPlayer?.name) : currentPlayer?.name}</h3>
                   <Badge className="bg-primary text-white font-black mt-2">STD {currentPlayer?.std} REGISTER</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                   <div className="bg-muted/30 p-3 rounded-2xl border"><p className="text-[8px] font-black text-muted-foreground uppercase">GR No</p><p className="font-black text-primary">{currentPlayer?.generalRegisterNumber || '---'}</p></div>
                   <div className="bg-muted/30 p-3 rounded-2xl border"><p className="text-[8px] font-black text-muted-foreground uppercase">Roll No</p><p className="font-black text-primary">{currentPlayer?.serialNumber || '---'}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-primary text-white shadow-xl overflow-hidden">
               <CardHeader className="bg-white/10 p-6 border-b border-white/10"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Activity className="w-4 h-4 text-accent" /> 30-Day Pulse</CardTitle></CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-end">
                     <div><p className="text-[10px] font-black text-white/60 uppercase">Presence Rate</p><h4 className="text-5xl font-black tracking-tighter">{attendanceStats.rate}%</h4></div>
                     <Badge className="bg-accent text-white border-0 font-black">{attendanceStats.streak} Day Streak</Badge>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-accent" style={{ width: `${attendanceStats.rate}%` }} />
                  </div>
               </CardContent>
            </Card>

            <div className="flex gap-4">
               <Button onClick={handlePrintDossier} className="flex-1 h-20 bg-accent text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl active-scale"><Printer className="w-6 h-6 mr-3" /> Print PDF</Button>
               <Button onClick={handleWhatsAppShare} className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-2xl active-scale"><MessageSquare className="w-8 h-8" /></Button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
               <CardHeader className="bg-slate-50 border-b p-8 flex justify-between items-center">
                  <CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-2"><ChartLine className="w-5 h-5 text-accent" /> Performance Pulse</CardTitle>
                  {phvData && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black uppercase text-[9px] px-4">{phvData.status}</Badge>}
               </CardHeader>
               <CardContent className="p-8">
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                           <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} domain={[0, 100]} />
                           <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                           <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={4} fill="#1e3a8a" fillOpacity={0.08} name="Avg Fitness" />
                           <Legend verticalAlign="top" align="right" />
                        </ComposedChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
               <CardHeader className="bg-primary/5 border-b p-6"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Exam & Record Archive</CardTitle></CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                       <thead className="bg-muted/30"><tr><th className="p-4 font-black uppercase text-primary">Period/Term</th><th className="p-4 font-black uppercase text-primary text-center">Score</th><th className="p-4 font-black uppercase text-primary text-center">Status</th><th className="p-4 font-black uppercase text-primary text-right">Metrics</th></tr></thead>
                       <tbody>
                          {historyData.slice().reverse().map((h: any, idx: number) => (
                             <tr key={idx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                                <td className="p-4 font-black uppercase">{h.month ? format(new Date(h.month + "-01"), 'MMMM yyyy') : (h.term || 'First Term')}</td>
                                <td className="p-4 text-center font-black text-primary text-lg">{h.score}%</td>
                                <td className="p-4 text-center"><Badge variant="outline" className="font-black uppercase text-[9px] border-primary/20">{h.status || 'Archived'}</Badge></td>
                                <td className="p-4 text-right text-[10px] font-bold text-muted-foreground uppercase">{h.metric1 ? 'CUSTOM SET' : 'STANDARD'}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-2 border-destructive/10 rounded-[3rem] bg-white shadow-xl overflow-hidden">
               <CardHeader className="bg-destructive/5 border-b border-destructive/10 p-6"><CardTitle className="text-xs font-black uppercase text-destructive flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Medical Audit History</CardTitle></CardHeader>
               <CardContent className="p-8">
                  {medicalHistory.length === 0 ? (
                    <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/30">Clean Medical Record</p>
                  ) : (
                    <div className="space-y-4">
                       {medicalHistory.map((m: any, i: number) => (
                         <div key={i} className="flex gap-6 p-5 bg-destructive/[0.02] border border-destructive/5 rounded-3xl">
                            <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center shrink-0"><ShieldAlert className="w-5 h-5 text-destructive" /></div>
                            <div>
                               <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black uppercase text-primary">{m.date}</span><Badge className="bg-destructive text-white border-0 text-[8px] px-2">{m.severity}</Badge></div>
                               <p className="text-xs font-medium text-foreground/70 leading-relaxed italic">&quot;{m.description.split('\n')[0]}&quot;</p>
                            </div>
                         </div>
                       ))}
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
