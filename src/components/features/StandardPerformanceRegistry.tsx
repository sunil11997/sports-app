"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart, 
  Trophy, 
  Search, 
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, shareToWhatsApp } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import type { PerformanceLabels, Player } from '@/lib/types';

const DEFAULT_PERFORMANCE_LABELS: PerformanceLabels = {
  metric1: 'Sprint (100m)',
  metric2: 'Javelin',
  metric3: 'Shot Put',
  metric4: 'Long Jump',
  metric5: 'High Jump',
  metric6: 'Endurance',
  metric7: 'Standup Jump'
};

export function StandardPerformanceRegistry({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("entry");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedPlayerForHistory, setSelectedPlayerId] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [localRecords, setLocalRecords] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const playersInStd = useMemo(() => {
    return (store.data.players || [])
      .filter((p: Player) => p.std === std)
      .filter((p: Player) => {
        const query = searchTerm.toLowerCase();
        return (p.name || "").toLowerCase().includes(query) || (p.generalRegisterNumber || "").includes(searchTerm);
      })
      .sort((a: Player, b: Player) => (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0));
  }, [store.data.players, std, searchTerm]);

  const currentLabels = useMemo(() => {
    const configId = `${std}_${selectedMonth}`;
    return store.data.performanceConfigs?.[configId] || DEFAULT_PERFORMANCE_LABELS;
  }, [store.data.performanceConfigs, std, selectedMonth]);

  useEffect(() => {
    const newRecords: Record<string, any> = {};
    playersInStd.forEach((p: Player) => {
      const historyList = store.data.fitnessHistory[p.id] || [];
      const history = historyList.find((h: any) => h.month === selectedMonth);
      newRecords[p.id] = history || { metric1: '', metric7: '', height: p.height || '', weight: p.weight || '' };
    });
    setLocalRecords(newRecords);
    if (playersInStd.length > 0 && !selectedPlayerForHistory) setSelectedPlayerId(playersInStd[0].id);
  }, [selectedMonth, playersInStd, store.data.fitnessHistory, selectedPlayerForHistory]);

  const handleValueChange = (pId: string, field: string, val: string) => {
    setLocalRecords(prev => ({ ...prev, [pId]: { ...prev[pId], [field]: val } }));
  };

  const handleAutoSave = async (player: Player) => {
    setIsSaving(player.id);
    const data = localRecords[player.id];
    const scoreStr = (parseFloat(data.metric1 || '0') + parseFloat(data.metric7 || '0')) / 2 > 0 ? "75" : "0";
    await store.setFitness(player.id, { ...data, month: selectedMonth, score: scoreStr, status: 'Active' });
    setLastSavedId(player.id);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handleWhatsAppShare = (player: Player) => {
    const r = localRecords[player.id] || {};
    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: store.data.schoolProfile.schoolName,
      teacherName: store.data.schoolProfile.teacherName,
      studentName: player.nameMarathi || player.name,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: r.height || player.height || "---",
      weight: r.weight || player.weight || "---",
      reportType: "Monthly Progress Update",
      reportData: `Score: ${r.score || '0'}%\n${currentLabels.metric1}: ${r.metric1 || '-'}\n${currentLabels.metric7}: ${r.metric7 || '-'}`
    });
  };

  const rankings = useMemo(() => {
    const sorted = (playersInStd || [])
      .map((p: Player) => {
        const hist = (store.data.fitnessHistory[p.id] || []).find((h: any) => h.month === selectedMonth);
        return { ...p, score: parseFloat(hist?.score || '0') };
      })
      .filter((p: any) => p.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    return { 
      boys: sorted.filter((p: any) => p.gender === 'Male').slice(0, 5), 
      girls: sorted.filter((p: any) => p.gender === 'Female').slice(0, 5) 
    };
  }, [playersInStd, store.data.fitnessHistory, selectedMonth]);

  const historyData = useMemo(() => 
    (store.data.fitnessHistory[selectedPlayerForHistory] || [])
      .filter((h: any) => h.month)
      .sort((a: any, b: any) => (a.month || "").localeCompare(b.month || "")),
  [selectedPlayerForHistory, store.data.fitnessHistory]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <TrendingUp className="w-10 h-10 text-emerald-700" />
          <h2 className="text-3xl font-black text-primary uppercase">Std {std} Progress</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Find student..." className="pl-9 h-11 rounded-full border-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-11 w-40 font-black border-2 rounded-xl" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-muted/50 p-2 h-auto rounded-full border shadow-inner w-full flex">
          <TabsTrigger value="entry" className="rounded-full flex-1 py-3 font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Data Entry</TabsTrigger>
          <TabsTrigger value="rankings" className="rounded-full flex-1 py-3 font-black uppercase text-[10px] data-[state=active]:bg-accent data-[state=active]:text-white flex items-center gap-2 justify-center"><Trophy className="w-3.5 h-3.5" /> Rankings</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full flex-1 py-3 font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          <div className="overflow-x-auto scrollbar-hide border-2 rounded-[3rem] bg-white shadow-2xl">
            <Table className="min-w-max border-collapse">
              <TableHeader className="bg-muted/80 sticky top-0 z-20">
                <TableRow>
                  <TableHead className="border-r h-14 px-8 font-black uppercase w-[220px] sticky left-0 bg-muted z-30">Student Profile</TableHead>
                  <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[110px]">{currentLabels.metric1}</TableHead>
                  <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[110px]">{currentLabels.metric7}</TableHead>
                  <TableHead className="border-r h-14 px-2 font-black uppercase text-center w-[90px] bg-primary/5">SCORE %</TableHead>
                  <TableHead className="h-14 px-2 font-black uppercase text-right w-[100px] sticky right-0 bg-muted z-30">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersInStd.map((p: Player) => {
                  const r = localRecords[p.id] || {};
                  const isSyncing = isSaving === p.id;
                  const isPulse = lastSavedId === p.id;
                  return (
                    <TableRow key={p.id} className={cn("border-b h-14", isPulse && "bg-emerald-50 animate-success-pulse")}>
                      <TableCell className="border-r px-8 font-black sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                           {p.name.toUpperCase()}
                           {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                        </div>
                      </TableCell>
                      <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.metric1 || ''} onBlur={() => handleAutoSave(p)} onChange={(e) => handleValueChange(p.id, 'metric1', e.target.value)} /></TableCell>
                      <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-accent/5 font-black" value={r.metric7 || ''} onBlur={() => handleAutoSave(p)} onChange={(e) => handleValueChange(p.id, 'metric7', e.target.value)} /></TableCell>
                      <TableCell className="border-r text-center bg-primary/5 font-black text-primary">{r.score || '0'}%</TableCell>
                      <TableCell className="text-right sticky right-0 bg-white z-10 px-4">
                         <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(p)} disabled={!p.mobileNumber} className="text-emerald-600"><MessageSquare className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 rounded-[2.5rem] p-6 space-y-4">
              <h3 className="text-xl font-black uppercase text-pink-600 flex items-center gap-2"><Trophy className="w-5 h-5" /> Top Girls</h3>
              {rankings.girls.map((p: any, idx: number) => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-pink-50 rounded-2xl border border-pink-100">
                  <span className="font-black text-xs uppercase">{idx + 1}. {p.name}</span>
                  <span className="font-black text-pink-600">{p.score}%</span>
                </div>
              ))}
            </Card>
            <Card className="border-2 rounded-[2.5rem] p-6 space-y-4">
              <h3 className="text-xl font-black uppercase text-blue-600 flex items-center gap-2"><Trophy className="w-5 h-5" /> Top Boys</h3>
              {rankings.boys.map((p: any, idx: number) => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="font-black text-xs uppercase">{idx + 1}. {p.name}</span>
                  <span className="font-black text-blue-600">{p.score}%</span>
                </div>
              ))}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-[400px] overflow-y-auto pr-2">
              <div className="space-y-2">
                {playersInStd.map((p: Player) => (
                  <button key={p.id} onClick={() => setSelectedPlayerId(p.id)} className={cn("w-full text-left p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs flex items-center justify-between", selectedPlayerForHistory === p.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-primary/5")}>
                    {p.name}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8">
              <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl h-[400px] p-8">
                <h4 className="text-xs font-black uppercase text-primary mb-6 flex items-center gap-2"><BarChart className="w-5 h-5 text-accent" /> Progress Trends</h4>
                <div className="h-[280px]">
                  {historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={historyData.map((h: any) => ({ month: h.month ? format(new Date(h.month + "-01"), 'MMM yy') : '---', score: parseFloat(h.score) || 0 }))}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={4} fill="#1e3a8a" fillOpacity={0.08} name="Score %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-20 font-black uppercase">No trend data</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
