"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trophy, Save, Printer, UserCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

const sportsList = ['Volleyball', 'Kabaddi', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

export function SportsSkills({ store, section = 'sports' }: { store: any, section?: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const handleSave = (id: string) => {
    const sportName = isGeneral ? 'General P.E.' : activeSport;
    const key = `${id}_${sportName}`;
    if (skills[key]) store.setSportSkill(id, sportName, skills[key]);
    toast({ title: "Score Saved" });
    setEditingDetailedPlayer(null);
  };

  const handlePrint = () => {
    const sportName = isGeneral ? 'General P.E.' : activeSport;
    const printContent = `
      <html>
        <head>
          <title>Skill Sheet - ${sportName}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1.5cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 14px; color: #111; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 20px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; text-transform: uppercase; font-size: 11px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #F59E0B; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800; text-transform: uppercase;">Technical Registry: ${sportName}</div>
          </div>
          <table>
            <thead><tr><th>SNR</th><th>NAME</th><th>STD</th><th>GENDER</th><th>SCORE</th></tr></thead>
            <tbody>
              ${filteredPlayers.map((p: any, i: number) => {
                const s = store.data.sportSkills[`${p.id}_${sportName}`] || { score: '0' };
                return `<tr><td>${p.serialNumber || i+1}</td><td><strong>${p.name.toUpperCase()}</strong></td><td>${p.std}</td><td>${p.gender}</td><td>${s.score}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.category === targetCategory && (isGeneral || p.sports?.includes(activeSport)))
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, targetCategory, isGeneral, activeSport]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border-2 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Technical Mastery Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Performance Registry</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-primary text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-8 shadow-lg">
          <Printer className="w-4 h-4 mr-2" /> Print Score Sheet
        </Button>
      </div>
      
      {!isGeneral && (
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl border overflow-x-auto scrollbar-hide">
          {sportsList.map(sport => (
            <Button 
              key={sport} 
              variant={activeSport === sport ? "default" : "ghost"} 
              size="sm" 
              className={cn("h-9 px-4 text-[10px] font-black uppercase", activeSport === sport ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}
              onClick={() => setActiveSport(sport)}
            >
              {sport}
            </Button>
          ))}
        </div>
      )}

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table className="min-w-max">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase h-12 px-6">Athlete Details</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-center w-[150px]">Technical Score</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((p: any) => {
              const sportName = isGeneral ? 'General P.E.' : activeSport;
              const s = store.data.sportSkills[`${p.id}_${sportName}`] || { score: '0' };
              return (
                <TableRow key={p.id} className="h-16 hover:bg-primary/5 transition-colors">
                  <TableCell className="px-6 font-bold uppercase text-xs text-primary">{p.name}</TableCell>
                  <TableCell className="text-center font-black text-primary text-base">{s.score}</TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="outline" size="sm" onClick={() => setEditingDetailedPlayer({ player: p, sport: sportName })} className="font-black text-[9px] uppercase rounded-lg">Score technical moves</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={() => setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase text-center text-primary">Technical Evaluation</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
             {editingDetailedPlayer && (
               <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">STUDENT: <span className="text-primary">${editingDetailedPlayer.player.name}</span></p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Technical Score (Aggregate)</Label>
                    <Input 
                      type="number" 
                      value={skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.score || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const key = `${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`;
                        setSkills(prev => ({ ...prev, [key]: { ...prev[key], score: val } }));
                      }} 
                      className="h-14 text-2xl font-black text-center rounded-2xl border-2" 
                    />
                  </div>
               </div>
             )}
          </div>
          <DialogFooter className="p-4">
            <Button onClick={() => handleSave(editingDetailedPlayer!.player.id)} className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">ARCHIVE SCORE</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}