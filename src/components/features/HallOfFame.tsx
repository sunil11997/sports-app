
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Medal, 
  Trophy, 
  Star, 
  Activity, 
  Target,
  Zap,
  Dumbbell,
  Loader2,
  Edit3
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

/**
 * DiscIcon - Hoisted to top to fix runtime TypeError
 */
const DiscIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const METRICS = [
  { id: 'score', label: 'Overall Fitness', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'metric2', label: 'Javelin Throw', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'metric3', label: 'Shot Put', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'metric7', label: 'Disc Throw', icon: DiscIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'metric1', label: '100m Sprint', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function HallOfFame({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activeMetric, setActiveMetric] = useState('score');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const standards = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString()), []);

  const currentMetricConfig = useMemo(() => METRICS.find(m => m.id === activeMetric)!, [activeMetric]);

  const getRankings = (std: string, gender: 'Male' | 'Female') => {
    const playersInStd = (store.data.players || []).filter((p: any) => p.std === std && p.gender === gender);
    
    return playersInStd.map((p: any) => {
      const historyList = store.data.fitnessHistory?.[p.id] || [];
      const history = historyList.find((h: any) => h.month === selectedMonth);
      const scoreValue = parseFloat(history?.[activeMetric] || '0');
      return { ...p, rankScore: scoreValue };
    })
    .filter((p: any) => p.rankScore > 0)
    .sort((a: any, b: any) => (b.rankScore as number) - (a.rankScore as number))
    .slice(0, 5);
  };

  const handleUpdateScore = async (playerId: string, value: string) => {
    setIsSaving(playerId);
    try {
      const existing = (store.data.fitnessHistory[playerId] || []).find((h: any) => h.month === selectedMonth) || {};
      
      await store.setFitness(playerId, {
        ...existing,
        [activeMetric]: value,
        month: selectedMonth,
        updatedAt: new Date().toISOString()
      });
      
      toast({ title: "Registry Updated", description: "Performance data archived successfully." });
    } catch (error) {
      console.error("WGB Rank Engine Error:", error);
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setIsSaving(null);
    }
  };

  const MetricIcon = currentMetricConfig.icon;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <Crown className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight leading-none">Institutional Hall of Fame</h2>
            <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto italic">
              Recognizing the elite Top 5 athletes for every standard based on fitness and performance metrics.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
             <div className="flex bg-muted/40 p-1.5 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide max-w-full">
                {METRICS.map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => { setActiveMetric(m.id); setIsEditMode(false); }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap",
                      activeMetric === m.id ? "bg-primary text-white shadow-lg scale-105" : "text-muted-foreground hover:bg-white"
                    )}
                  >
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
             </div>
             <div className="flex gap-2">
               <Input 
                 type="month" 
                 value={selectedMonth} 
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value)} 
                 className="w-40 h-12 rounded-xl border-2 font-black uppercase text-[10px]" 
               />
               {activeMetric !== 'score' && (
                 <Button 
                   variant={isEditMode ? "default" : "outline"} 
                   onClick={() => setIsEditMode(!isEditMode)}
                   className={cn("h-12 rounded-xl font-black uppercase text-[10px] px-6 border-2", isEditMode && "bg-accent text-white border-accent")}
                 >
                   <Edit3 className="w-4 h-4 mr-2" /> {isEditMode ? 'Close Editor' : 'Edit Metrics'}
                 </Button>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16">
        {standards.map((std) => {
          const topBoys = getRankings(std, 'Male');
          const topGirls = getRankings(std, 'Female');
          const allInStd = (store.data.players || []).filter((p: any) => p.std === std);

          if (!isEditMode && topBoys.length === 0 && topGirls.length === 0) return null;

          return (
            <div key={std} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center gap-6 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl">
                    {std}
                  </div>
                  <div className="flex-1 border-b-4 border-dashed border-primary/10 pb-4">
                    <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Standard {std} Elite Squad</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mt-1">
                      <MetricIcon className={cn("w-3 h-3", currentMetricConfig.color)} /> {currentMetricConfig.label} Registry &bull; {format(new Date(selectedMonth + "-01"), 'MMMM yyyy')}
                    </p>
                  </div>
               </div>

               {isEditMode ? (
                 <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl">
                    <CardHeader className={cn("border-b p-8", currentMetricConfig.bg)}>
                       <div className="flex justify-between items-center">
                          <div>
                             <CardTitle className="text-xl font-black text-primary uppercase">Quick Registry Entry</CardTitle>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Updating: {currentMetricConfig.label}</p>
                          </div>
                          <Badge className="bg-primary text-white font-black uppercase text-[10px] px-4 py-1.5">Std {std} Class List</Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                          <table className="w-full border-collapse">
                             <thead className="bg-muted/30 sticky top-0 z-10">
                                <tr>
                                   <th className="p-6 text-left text-[10px] font-black uppercase text-primary border-r w-[250px]">Student Athlete</th>
                                   <th className="p-6 text-center text-[10px] font-black uppercase text-primary border-r">Gender</th>
                                   <th className="p-6 text-center text-[10px] font-black uppercase text-primary w-[200px]">Result Value</th>
                                </tr>
                             </thead>
                             <tbody>
                                {allInStd.sort((a: any, b: any) => a.gender.localeCompare(b.gender)).map((p: any) => {
                                   const hist = (store.data.fitnessHistory[p.id] || []).find((h: any) => h.month === selectedMonth) || {};
                                   const isUpdating = isSaving === p.id;
                                   return (
                                      <tr key={p.id} className="border-b last:border-0 hover:bg-primary/5 transition-colors">
                                         <td className="p-6 border-r">
                                            <div className="flex items-center gap-3">
                                               <Avatar className="w-8 h-8 border shadow-sm">
                                                  <AvatarImage src={p.photoUrl} className="object-cover" />
                                                  <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{(p.name || "?")[0]}</AvatarFallback>
                                               </Avatar>
                                               <span className="font-black text-sm uppercase text-primary truncate max-w-[150px]">{p.name}</span>
                                            </div>
                                         </td>
                                         <td className="p-6 border-r text-center">
                                            <Badge variant="outline" className={cn("text-[9px] font-black border-primary/20", p.gender === 'Female' ? "text-pink-600 bg-pink-50" : "text-blue-600 bg-blue-50")}>
                                               {p.gender.toUpperCase()}
                                            </Badge>
                                         </td>
                                         <td className="p-6">
                                            <div className="relative max-w-[150px] mx-auto">
                                               <Input 
                                                  type="number"
                                                  step="0.1"
                                                  placeholder="0.0"
                                                  className="h-12 text-center font-black text-lg focus:ring-accent border-2 rounded-xl"
                                                  defaultValue={hist[activeMetric] || ""}
                                                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateScore(p.id, e.target.value)}
                                               />
                                               {isUpdating && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
                                            </div>
                                         </td>
                                      </tr>
                                   );
                                })}
                             </tbody>
                          </table>
                       </div>
                    </CardContent>
                 </Card>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl hover:border-blue-200 transition-all">
                      <CardHeader className="bg-blue-50/50 border-b border-blue-100 p-6 flex flex-row justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Medal className="w-6 h-6 text-blue-600" />
                            <CardTitle className="text-lg font-black text-blue-900 uppercase">Top 5 Boys</CardTitle>
                         </div>
                         <Badge className="bg-blue-600 text-white font-black text-[9px] px-3">STD {std}</Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                         {topBoys.length === 0 ? (
                           <div className="py-10 text-center opacity-20"><Dumbbell className="w-8 h-8 mx-auto mb-2" /><p className="text-[8px] font-black uppercase">No records found</p></div>
                         ) : topBoys.map((p: any, i: number) => (
                           <div key={p.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border-2 border-blue-50 group hover:border-blue-400 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-inner", i === 0 ? "bg-amber-400 text-white" : "bg-blue-50 text-blue-600")}>
                                    {i + 1}
                                 </div>
                                 <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                    <AvatarImage src={p.photoUrl} className="object-cover" />
                                    <AvatarFallback className="bg-blue-50 text-blue-600 font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-black text-primary uppercase text-sm group-hover:text-blue-600 transition-colors">{p.name}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">GR: {p.generalRegisterNumber || '---'}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xl font-black text-blue-600">{p.rankScore}{activeMetric === 'score' ? '%' : ''}</p>
                                 <p className="text-[8px] font-black uppercase text-muted-foreground">Rating</p>
                              </div>
                           </div>
                         ))}
                      </CardContent>
                    </Card>

                    <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl hover:border-pink-200 transition-all">
                      <CardHeader className="bg-pink-50/50 border-b border-pink-100 p-6 flex flex-row justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Medal className="w-6 h-6 text-pink-600" />
                            <CardTitle className="text-lg font-black text-pink-900 uppercase">Top 5 Girls</CardTitle>
                         </div>
                         <Badge className="bg-pink-600 text-white font-black text-[9px] px-3">STD {std}</Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                         {topGirls.length === 0 ? (
                           <div className="py-10 text-center opacity-20"><Dumbbell className="w-8 h-8 mx-auto mb-2" /><p className="text-[8px] font-black uppercase">No records found</p></div>
                         ) : topGirls.map((p: any, i: number) => (
                           <div key={p.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border-2 border-pink-50 group hover:border-pink-400 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-inner", i === 0 ? "bg-amber-400 text-white" : "bg-pink-50 text-pink-600")}>
                                    {i + 1}
                                 </div>
                                 <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={p.photoUrl} className="object-cover" />
                                    <AvatarFallback className="bg-pink-50 text-pink-600 font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-black text-primary uppercase text-sm group-hover:text-pink-600 transition-colors">{p.name}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">GR: {p.generalRegisterNumber || '---'}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xl font-black text-pink-600">{p.rankScore}{activeMetric === 'score' ? '%' : ''}</p>
                                 <p className="text-[8px] font-black uppercase text-muted-foreground">Rating</p>
                              </div>
                           </div>
                         ))}
                      </CardContent>
                    </Card>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white text-center">
        <div className="relative z-10 space-y-4">
           <Trophy className="w-12 h-12 text-accent mx-auto" />
           <h4 className="text-2xl font-black uppercase">Institutional Pride</h4>
           <p className="text-sm font-medium opacity-70 max-w-xl mx-auto italic">
             &quot;The Hall of Fame is updated in real-time based on the most recent fitness evaluations archived in the institutional registry.&quot;
           </p>
           <Button className="mt-6 bg-accent text-white h-16 rounded-2xl px-12 font-black uppercase tracking-widest shadow-xl active-scale">
             Export Annual Medalist PDF
           </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>
    </div>
  );
}
