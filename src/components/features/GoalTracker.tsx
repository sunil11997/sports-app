"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Save, 
  History, 
  Trash2, 
  Loader2, 
  Zap,
  ArrowRight,
  Flame,
  Star,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const METRICS: Record<string, string[]> = {
  'Athletics': ['100m Sprint (sec)', '200m Sprint (sec)', '400m Sprint (sec)', 'Long Jump (mtr)', 'High Jump (mtr)', 'Shot Put (mtr)', 'Javelin (mtr)'],
  'Kabaddi': ['Successful Raids', 'Tackle Points', 'Bonus Points', 'Super Tackles'],
  'Volleyball': ['Successful Serves', 'Spike Points', 'Block Points', 'Aces'],
  'Kho Kho': ['Chasing Points', 'Running Time (min)', 'Pole Dives'],
  'General': ['Push-ups Count', 'Chin-ups Count', 'Plank Duration (sec)']
};

export function GoalTracker({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [activeSport, setActiveSport] = useState(preselectedSport || "Athletics");
  const [metric, setMetric] = useState("");
  const [currentPB, setCurrentPB] = useState("");
  const [target, setTarget] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preselectedSport) setActiveSport(preselectedSport);
  }, [preselectedSport]);

  const players = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => p.category === 'athlete' && (!activeSport || p.sports?.includes(activeSport) || activeSport === 'Athletics'))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, activeSport]
  );

  const handleSaveGoal = async () => {
    if (!selectedPlayerId || !metric || !currentPB || !target) {
      toast({ title: "Incomplete Data", description: "Please fill all fields to set the goal.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const player = players.find((p: any) => p.id === selectedPlayerId);
      await store.setGoal({
        playerId: selectedPlayerId,
        playerName: player?.name || "Unknown",
        sport: activeSport,
        metric,
        currentPB,
        target,
        month: selectedMonth
      });

      toast({ 
        title: "लक्ष्य जतन केले!", 
        description: `${player?.name} साठी नवीन ध्येय सेट झाले आहे.`,
        className: "bg-primary text-white"
      });

      setMetric("");
      setCurrentPB("");
      setTarget("");
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const goalsList = useMemo(() => {
    return (store.data.goals || [])
      .filter((g: any) => (!selectedPlayerId || g.playerId === selectedPlayerId) && (activeSport === 'Athletics' || g.sport === activeSport))
      .sort((a: any, b: any) => b.month.localeCompare(a.month));
  }, [store.data.goals, selectedPlayerId, activeSport]);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Goal Registry - Waghamba Hub</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 12px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 20px; }
            .report-type { font-weight: 800; text-transform: uppercase; text-align: center; margin-top: 10px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: center; }
            th { background-color: #f4f4f4; font-weight: 900; text-transform: uppercase; font-size: 10px; }
            .name-cell { text-align: left; font-weight: 800; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
            <div class="report-type">ATHLETE SELF-IMPROVEMENT & TARGET REGISTRY</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>STUDENT ATHLETE</th>
                <th>SPORT / EVENT</th>
                <th>MONTH</th>
                <th>PREVIOUS BEST</th>
                <th>TARGET GOAL</th>
              </tr>
            </thead>
            <tbody>
              ${goalsList.map((g: any) => `
                <tr>
                  <td class="name-cell">${g.playerName.toUpperCase()}</td>
                  <td>${g.metric}</td>
                  <td>${format(new Date(g.month + "-01"), 'MMM yyyy')}</td>
                  <td>${g.currentPB}</td>
                  <td><strong>${g.target}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-accent p-8 rounded-[3rem] shadow-2xl relative overflow-hidden text-white">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none">लक्ष्य आणि ध्येय ट्रॅकर</h2>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.3em]">Self-Improvement Registry</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
        </div>

        <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">१. खेळाडू निवडा</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white text-lg"><SelectValue placeholder="खेळाडू निवडा..." /></SelectTrigger>
              <SelectContent>
                {players.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">२. क्रीडा प्रकार / इव्हेंट</label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-muted/20"><SelectValue placeholder="निवडा (उदा. १०० मी. धावणे)" /></SelectTrigger>
              <SelectContent>
                {(METRICS[activeSport] || METRICS['General']).map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">सध्याचा सर्वोत्तम (PB)</label>
                <Input value={currentPB} onChange={e => setCurrentPB(e.target.value)} placeholder="उदा. १३.२ सेकंद" className="h-12 border-2 rounded-xl font-black text-primary" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-2">पुढील ध्येय (Target)</label>
                <Input value={target} onChange={e => setTarget(e.target.value)} placeholder="उदा. १२.८ सेकंद" className="h-12 border-2 rounded-xl font-black text-accent" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">महिना निवडा</label>
            <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="h-12 border-2 rounded-xl font-bold" />
          </div>

          <Button 
            onClick={handleSaveGoal} 
            disabled={isSaving || !selectedPlayerId || !metric}
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
            ध्येय जतन करा
          </Button>
        </Card>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">प्रगती आणि ध्येय इतिहास</h3>
           </div>
           <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={handlePrint} disabled={goalsList.length === 0} className="font-black text-[10px] uppercase border-2 h-10 rounded-xl px-4">
                <Printer className="w-3.5 h-3.5 mr-2" /> Export targets
             </Button>
             <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Monthly Registry</Badge>
           </div>
        </div>

        <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[600px]">
           <ScrollArea className="flex-1 p-8">
              {goalsList.length === 0 ? (
                <div className="py-32 text-center opacity-20 border-4 border-dashed rounded-[3rem]">
                  <Flame className="w-20 h-20 mx-auto mb-6" />
                  <p className="font-black uppercase tracking-[0.2em]">No target logs archived</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {goalsList.map((goal: any) => (
                    <div key={goal.id} className="p-8 rounded-[2.5rem] border-2 border-primary/5 hover:border-accent transition-all group bg-white shadow-sm relative overflow-hidden">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="flex items-start gap-6">
                             <div className="w-16 h-16 bg-accent/10 rounded-[1.2rem] flex items-center justify-center shrink-0 border border-accent/20 group-hover:scale-110 transition-transform">
                                <Trophy className="w-8 h-8 text-accent" />
                             </div>
                             <div className="space-y-1">
                                <h4 className="font-black text-primary uppercase text-xl leading-tight group-hover:text-accent transition-colors">{goal.playerName}</h4>
                                <div className="flex items-center gap-3">
                                   <Badge variant="secondary" className="text-[9px] font-black uppercase px-3">{goal.metric}</Badge>
                                   <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5">
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {format(new Date(goal.month + "-01"), 'MMMM yyyy')}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-6 bg-muted/20 p-5 rounded-3xl border-2 border-dashed border-muted">
                             <div className="text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Current PB</p>
                                <p className="text-lg font-black text-primary leading-none">{goal.currentPB}</p>
                             </div>
                             <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                             <div className="text-center">
                                <p className="text-[8px] font-black text-accent uppercase mb-1">Target</p>
                                <p className="text-lg font-black text-accent leading-none">{goal.target}</p>
                             </div>
                          </div>
                          
                          <Button variant="ghost" size="icon" onClick={() => store.deleteGoal(goal.id)} className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0">
                             <Trash2 className="w-5 h-5" />
                          </Button>
                       </div>
                       <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                          <Zap className="w-32 h-32" />
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </ScrollArea>

           <div className="p-10 bg-primary/5 border-t text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Goal-setting triggers a 2x increase in student training engagement.</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
