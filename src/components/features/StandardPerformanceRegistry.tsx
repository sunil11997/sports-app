
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  History, 
  Settings2, 
  Loader2, 
  TrendingUp, 
  ArrowRight,
  Target,
  BarChart,
  Trophy,
  Users,
  Search,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
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
  Area,
  Line,
  Legend
} from 'recharts';
import type { PerformanceLabels, Player } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_PERFORMANCE_LABELS: PerformanceLabels = {
  metric1: 'Running (100m)',
  metric2: 'Javelin Throw',
  metric3: 'Disc Throw',
  metric4: 'Long Jump',
  metric5: 'High Jump',
  metric6: 'Shot Put',
  metric7: 'Standup Jump'
};

export function StandardPerformanceRegistry({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("entry");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedPlayerForHistory, setSelectedPlayerId] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [editingLabels, setEditingLabels] = useState(DEFAULT_PERFORMANCE_LABELS);
  const [localRecords, setLocalRecords] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const playersInStd = useMemo(() => {
    return (store.data.players || [])
      .filter((p: Player) => p.std === std)
      .filter((p: Player) => {
        const query = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(query) || (p.generalRegisterNumber || "").includes(searchTerm);
      })
      .sort((a: Player, b: Player) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0);
      });
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
      newRecords[p.id] = history || {
        metric1: '', metric2: '', metric3: '', metric4: '',
        metric5: '', metric6: '', metric7: '',
        height: p.height || '', weight: p.weight || ''
      };
    });
    setLocalRecords(newRecords);
    if (playersInStd.length > 0 && !selectedPlayerForHistory) {
      setSelectedPlayerId(playersInStd[0].id);
    }
  }, [selectedMonth, playersInStd, store.data.fitnessHistory, selectedPlayerForHistory, store.isLoaded]);

  const handleValueChange = (pId: string, field: string, val: string) => {
    setLocalRecords(prev => ({
      ...prev,
      [pId]: { ...prev[pId], [field]: val }
    }));
  };

  const handleAutoSave = async (player: Player) => {
    setIsSaving(player.id);
    const data = localRecords[player.id];
    const metrics = ['metric1', 'metric2', 'metric3', 'metric4', 'metric5', 'metric6', 'metric7'];
    let sumVal = 0;
    let count = 0;
    metrics.forEach((m: string) => {
      if (data[m] && !isNaN(parseFloat(data[m]))) {
        sumVal += parseFloat(data[m]);
        count++;
      }
    });
    const scoreStr = count > 0 ? (sumVal / count).toFixed(1) : "0";
    await store.setFitness(player.id, {
      ...data,
      month: selectedMonth,
      score: scoreStr,
      status: parseFloat(scoreStr) >= 80 ? 'Elite' : parseFloat(scoreStr) >= 60 ? 'Optimal' : 'Developing'
    });
    setLastSavedId(player.id);
    setTimeout(() => setLastSavedId(null), 800);
    setIsSaving(null);
  };

  const handleWhatsAppShare = (player: Player) => {
    const r = localRecords[player.id] || {};
    const profile = store.data.schoolProfile;
    const monthName = format(new Date(selectedMonth + "-01"), 'MMMM yyyy');
    
    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: profile.schoolName,
      teacherName: profile.teacherName,
      studentName: player.nameMarathi || player.name,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: r.height || player.height || "---",
      weight: r.weight || player.weight || "---",
      reportType: `मासिक प्रगती अहवाल (${monthName})`,
      reportData: `सरासरी गुणवत्ता: ${r.score || '0'}%\n${currentLabels.metric1}: ${r.metric1 || '-'}\n${currentLabels.metric7}: ${r.metric7 || '-'}`
    });
  };

  const handleSaveLabels = () => {
    store.setPerformanceLabels(std, selectedMonth, editingLabels);
    setIsLabelDialogOpen(false);
    toast({ title: "Custom Registry Set" });
  };

  const historyData = useMemo(() => {
    if (!selectedPlayerForHistory) return [];
    return (store.data.fitnessHistory[selectedPlayerForHistory] || [])
      .filter((h: any) => h.month)
      .sort((a: any, b: any) => (a.month || "").localeCompare(b.month || ""));
  }, [selectedPlayerForHistory, store.data.fitnessHistory]);

  const chartData = useMemo(() => {
    return historyData.map((h: any) => ({
      month: h.month ? format(new Date(h.month + "-01"), 'MMM yy') : "---",
      score: parseFloat(h.score) || 0,
      m1: parseFloat(h.metric1) || 0,
      m2: parseFloat(h.metric2) || 0
    }));
  }, [historyData]);

  const rankings = useMemo(() => {
    const boys = playersInStd
      .filter((p: Player) => p.gender === 'Male')
      .map((p: Player) => {
        const hist = (store.data.fitnessHistory[p.id] || []).find((h: any) => h.month === selectedMonth);
        return { ...p, score: parseFloat(hist?.score || '0') };
      })
      .filter((p: any) => p.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    const girls = playersInStd
      .filter((p: Player) => p.gender === 'Female')
      .map((p: Player) => {
        const hist = (store.data.fitnessHistory[p.id] || []).find((h: any) => h.month === selectedMonth);
        return { ...p, score: parseFloat(hist?.score || '0') };
      })
      .filter((p: any) => p.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    return { boys, girls };
  }, [playersInStd, store.data.fitnessHistory, selectedMonth]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-emerald-100 p-4 rounded-[1.5rem] border-2 border-emerald-200">
            <TrendingUp className="w-10 h-10 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Std {std} Progress</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 bg-primary/5">Performance Hub</Badge>
              <button onClick={() => { setEditingLabels(currentLabels); setIsLabelDialogOpen(true); }} className="text-[9px] font-black text-accent uppercase flex items-center gap-1 hover:underline">
                <Settings2 className="w-3 h-3" /> Customize Metrics
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Find student..." 
              className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
            <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-10 w-40 font-black border-0 bg-transparent shadow-none focus:ring-0" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-muted/50 p-2 h-auto rounded-full border shadow-inner w-full flex justify-between overflow-x-auto scrollbar-hide">
          <TabsTrigger value="entry" className="rounded-full flex-1 px-4 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Data Entry</TabsTrigger>
          <TabsTrigger value="rankings" className="rounded-full flex-1 px-4 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Rankings
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-full flex-1 px-4 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Progress History</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
            <div className="overflow-x-auto scrollbar-hide">
              <Table className="min-w-max border-collapse">
                <TableHeader className="bg-muted/80 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="border-r h-14 px-4 font-black text-[11px] uppercase w-[200px] sticky left-0 bg-muted/95 z-30">Student Profile</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Age</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Ht (cm)</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Wt (kg)</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[110px] text-blue-600">{currentLabels.metric1}</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[110px] text-blue-600">{currentLabels.metric2}</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[110px] text-accent">{currentLabels.metric7}</TableHead>
                    <TableHead className="border-r h-14 px-2 font-black text-[11px] uppercase text-center w-[90px] bg-primary/5">SCORE</TableHead>
                    <TableHead className="h-14 px-2 font-black text-[11px] uppercase text-right w-[100px] sticky right-0 bg-muted/95 z-30">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playersInStd.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-20 font-black uppercase opacity-20">No matching athletes.</TableCell></TableRow>
                  ) : playersInStd.map((p: Player) => {
                    const r = localRecords[p.id] || {};
                    const isSavingRow = isSaving === p.id;
                    const isPulse = lastSavedId === p.id;
                    
                    return (
                      <TableRow key={p.id} className={cn("border-b h-14 group transition-colors", isPulse && "bg-emerald-50/50 animate-success-pulse")}>
                        <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 truncate w-[200px]">
                          <div className="flex items-center gap-2">
                             {p.name.toUpperCase()}
                             {isSavingRow && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                          </div>
                        </TableCell>
                        <TableCell className="border-r text-center font-bold text-xs">{p.age}</TableCell>
                        <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white rounded-none" value={r.height || ''} onBlur={() => handleAutoSave(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(p.id, 'height', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white rounded-none" value={r.weight || ''} onBlur={() => handleAutoSave(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(p.id, 'weight', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white rounded-none" value={r.metric1 || ''} onBlur={() => handleAutoSave(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(p.id, 'metric1', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white rounded-none" value={r.metric2 || ''} onBlur={() => handleAutoSave(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(p.id, 'metric2', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-accent/5 focus:bg-white rounded-none font-black" value={r.metric7 || ''} onBlur={() => handleAutoSave(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(p.id, 'metric7', e.target.value)} /></TableCell>
                        <TableCell className="border-r text-center bg-primary/5 font-black text-primary text-base">{parseFloat(r.score || '0').toFixed(0)}</TableCell>
                        <TableCell className="text-right sticky right-0 bg-white z-10 px-2 flex items-center justify-end gap-2 h-14">
                           <Button variant="ghost" size="icon" onClick={() => handleWhatsAppShare(p)} disabled={!p.mobileNumber} className="text-emerald-600 hover:bg-emerald-50">
                             <MessageSquare className="w-4 h-4" />
                           </Button>
                           <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5 border-primary/20">
                             {r.status || 'NEW'}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
          <p className="mt-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Auto-Save Active &bull; Registry Synced
          </p>
        </TabsContent>

        <TabsContent value="rankings" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-pink-50 border-b p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-pink-700 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Top 5 Girls (Std {std})
                </CardTitle>
                <Badge className="bg-pink-600 text-white font-black">{rankings.girls.length}</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {rankings.girls.map((p: any, idx: number) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl border border-pink-100 shadow-sm animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center font-black text-pink-700">{idx + 1}</div>
                        <div>
                          <p className="font-black text-xs uppercase text-pink-900">{p.name}</p>
                          <p className="text-[8px] font-bold text-pink-600 uppercase tracking-widest">Mastery Level: Elite</p>
                        </div>
                      </div>
                      <span className="text-xl font-black text-pink-700">{p.score}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-blue-50 border-b p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-700 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Top 5 Boys (Std {std})
                </CardTitle>
                <Badge className="bg-blue-600 text-white font-black">{rankings.boys.length}</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {rankings.boys.map((p: any, idx: number) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-right duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-700">{idx + 1}</div>
                        <div>
                          <p className="font-black text-xs uppercase text-blue-900">{p.name}</p>
                          <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">Mastery Level: Elite</p>
                        </div>
                      </div>
                      <span className="text-xl font-black text-blue-700">{p.score}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 rounded-[3rem] bg-white p-8 shadow-xl">
                 <h3 className="text-xl font-black text-primary uppercase flex items-center gap-3 mb-6"><Target className="w-6 h-6 text-accent" /> Student List</h3>
                 <ScrollArea className="h-[400px]">
                   <div className="space-y-2 pr-4">
                      {playersInStd.map((p: Player) => (
                        <button key={p.id} onClick={() => setSelectedPlayerId(p.id)} className={cn("w-full text-left p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs flex items-center justify-between group", selectedPlayerForHistory === p.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-primary/5 hover:border-primary/10")}>
                          {p.name}
                          <ArrowRight className={cn("w-4 h-4 transition-transform", selectedPlayerForHistory === p.id ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                        </button>
                      ))}
                   </div>
                 </ScrollArea>
              </Card>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[500px]">
                <CardHeader className="bg-primary/5 border-b p-8">
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3"><BarChart className="w-5 h-5 text-accent" /> Progress Trends</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="h-[350px] w-full p-8 border-b">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={4} fill="#1e3a8a" fillOpacity={0.08} name="Avg Score" />
                          <Line type="monotone" dataKey="m1" stroke="#f59e0b" strokeWidth={3} name={currentLabels.metric1} />
                          <Legend verticalAlign="top" iconType="circle" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20"><History className="w-16 h-16 mb-4 text-primary" /><p className="font-black uppercase tracking-widest text-sm">No historical data found</p></div>
                    )}
                  </div>
                  <div className="p-0 overflow-x-auto scrollbar-hide">
                    <Table>
                      <TableHeader><TableRow><TableHead className="font-black text-[10px] uppercase pl-8">Month</TableHead><TableHead className="font-black text-[10px] uppercase text-center">Score</TableHead><TableHead className="font-black text-[10px] uppercase text-right pr-8">Status Rank</TableHead></TableRow></TableHeader>
                      <TableBody>
                         {historyData.slice().reverse().map((h: any, idx: number) => (
                           <TableRow key={idx}>
                              <TableCell className="font-black uppercase text-xs pl-8">{h.month ? format(new Date(h.month + "-01"), 'MMMM yyyy') : '---'}</TableCell>
                              <TableCell className="text-center font-black text-primary">{h.score}%</TableCell>
                              <TableCell className="text-right pr-8"><Badge variant="outline" className="text-[9px] font-black uppercase">{h.status}</Badge></TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-primary p-8 text-white relative">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10"><Settings2 className="w-6 h-6 text-accent" /> Customize Metrics</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {(Object.keys(DEFAULT_PERFORMANCE_LABELS) as Array<keyof PerformanceLabels>).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase text-primary ml-2 tracking-widest">{field}</Label>
                  <Input value={editingLabels[field]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingLabels({...editingLabels, [field]: e.target.value})} className="h-12 font-black border-2 rounded-xl bg-muted/20 focus:bg-white shadow-inner" />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 border-t">
            <Button onClick={handleSaveLabels} className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale">Archive Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
