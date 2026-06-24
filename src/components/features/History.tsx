"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Printer, 
  ChartLine, 
  Search, 
  MessageSquare,
  ChevronRight,
  BarChart
} from 'lucide-react';
import { format, subDays, startOfDay, parseISO, isAfter } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn, shareToWhatsApp } from '@/lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area
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
        return p.name.toLowerCase().includes(query) || (p.generalRegisterNumber || "").includes(searchTerm);
      })
      .sort((a: Player, b: Player) => (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0));
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
    let statusLabel = offsetNum < 0 ? 'Pre-growth' : 'Post-growth';
    return { offset: offset.toFixed(2), offsetNum, status: statusLabel };
  }, [currentPlayer]);

  const historyData = useMemo(() => 
    (store.data.fitnessHistory?.[selectedPlayerId] || [])
      .sort((a: any, b: any) => (a.month || "").localeCompare(b.month || "")),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const chartData = useMemo(() => 
    historyData.map((f: any) => ({
      date: f.month ? format(new Date(f.month + "-01"), 'MMM yy') : "---",
      score: parseFloat(f.score) || 0,
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
      reportType: "Dossier Registry Update",
      reportData: `Att Rate: ${attendanceStats.rate}%\nFitness: ${lastFit.score || '0'}%\nPHV: ${phvData?.offset}`
    });
  };

  if (!store.isLoaded) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border-2 shadow-xl">
        <div className="flex items-center gap-6">
          <History className="w-10 h-10 text-primary" />
          <div>
            <h2 className="text-2xl font-black text-primary uppercase">Institutional History</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registry Dossier Hub</p>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Find student/GR..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-9 h-11 rounded-full border-2 bg-muted/20" 
            />
          </div>
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue placeholder="Pick student..." /></SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: Player) => (<SelectItem key={p.id} value={p.id}>{isMarathi ? (p.nameMarathi || p.name) : p.name} (Std {p.std})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-24 text-center border-4 border-dashed rounded-[3.5rem] opacity-20 bg-white/50">
          <History className="w-16 h-16 mx-auto mb-4 text-primary" />
          <p className="font-black uppercase tracking-widest">Select an entry to view exhaustive history</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden p-8 text-center space-y-6">
              <Avatar className="w-40 h-40 border shadow-2xl mx-auto">
                <AvatarImage src={currentPlayer?.photoUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">{currentPlayer?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                 <h3 className="text-3xl font-black text-primary uppercase leading-tight">{isMarathi ? (currentPlayer?.nameMarathi || currentPlayer?.name) : currentPlayer?.name}</h3>
                 <Badge className="bg-primary text-white font-black mt-2">STD {currentPlayer?.std} REGISTER</Badge>
              </div>
              <div className="flex gap-4">
                 <Button onClick={() => window.print()} className="flex-1 h-16 bg-primary text-white rounded-3xl font-black uppercase tracking-widest">Print PDF</Button>
                 <Button onClick={handleWhatsAppShare} className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center"><MessageSquare className="w-6 h-6" /></Button>
              </div>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-primary text-white p-8 shadow-xl">
               <h4 className="text-xs font-black uppercase text-accent mb-6">Attendance Pulse</h4>
               <div className="flex justify-between items-end">
                  <div><p className="text-[10px] font-black text-white/60 uppercase">30-Day Rate</p><h4 className="text-5xl font-black tracking-tighter">{attendanceStats.rate}%</h4></div>
                  <Badge className="bg-accent text-white border-0 font-black">{attendanceStats.streak} Day Streak</Badge>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 rounded-[3.5rem] bg-white shadow-xl p-8 h-[400px]">
               <h4 className="text-xs font-black uppercase text-primary mb-6 flex items-center gap-2"><ChartLine className="w-5 h-5 text-accent" /> Performance Pulse</h4>
               <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                      <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={4} fill="#1e3a8a" fillOpacity={0.08} name="Score %" />
                    </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden p-8">
               <h4 className="text-xs font-black uppercase text-primary mb-6 flex items-center gap-2"><History className="w-4 h-4" /> Medical Audit History</h4>
               {medicalHistory.length === 0 ? (
                 <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/30">Clean Medical Record</p>
               ) : (
                 <div className="space-y-4">
                    {medicalHistory.map((m: any, i: number) => (
                      <div key={i} className="p-4 bg-destructive/[0.02] border border-destructive/5 rounded-2xl">
                         <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black uppercase text-primary">{m.date}</span><Badge className="bg-destructive text-white border-0 text-[8px] px-2">{m.severity}</Badge></div>
                         <p className="text-xs font-medium text-foreground/70 italic leading-relaxed">&quot;{m.description.split('\n')[0]}&quot;</p>
                      </div>
                    ))}
                 </div>
               )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}