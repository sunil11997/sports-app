"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trophy, Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const sportsList = ['Volleyball', 'Kabaddi', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

const KABADDI_SKILLS = ["Dubki", "Toe Touch", "Running Hand Touch", "Back Kick", "Lion Jump", "Sidekick", "Scorpion Kick", "Frog Jump", "Ankle Hold", "Thigh Hold", "Chain Tackle", "Dash", "Block", "Waist Hold", "Knee Hold"];
const VOLLEYBALL_SKILLS = ["Serving", "Passing (Bump)", "Setting", "Spiking (Attack)", "Blocking", "Digging (Defense)", "Footwork", "Communication"];
const HANDBALL_SKILLS = ["Passing", "Catching", "Dribbling", "Shooting", "Jump shot", "Running shot", "Dive shot", "Spin shot", "Feints", "Break-through", "Blocking", "Marking", "Tackling", "Interception", "Goalkeeping", "Defensive stance", "Footwork", "Pivot play", "Positioning", "Support play", "Timing", "Coordination", "Communication", "Decision making", "Awareness", "Reaction time", "Balance"];

export function SportsSkills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  const getDetailedSkillsList = (sport: string) => {
    if (sport === 'Kabaddi') return KABADDI_SKILLS;
    if (sport === 'Volleyball') return VOLLEYBALL_SKILLS;
    if (sport === 'Handball') return HANDBALL_SKILLS;
    return ["Fundamental Technique", "Game Awareness", "Pace Control", "Precision"];
  };

  const getMaxScore = (sport: string) => getDetailedSkillsList(sport).length * 10;

  const handleDetailedSkillChange = (skill: string, value: string) => {
    if (!editingDetailedPlayer) return;
    const { player, sport } = editingDetailedPlayer;
    const key = `${player.id}_${sport}`;
    const current = skills[key] || { score: '0', detailedSkills: {} };
    const updatedDetailedSkills = { ...(current.detailedSkills || {}), [skill]: value };
    const total = Object.values(updatedDetailedSkills).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);
    setSkills(prev => ({ ...prev, [key]: { ...current, detailedSkills: updatedDetailedSkills, score: total.toString() } }));
  };

  const handleSave = (id: string) => {
    const key = `${id}_${activeSport}`;
    if (skills[key]) store.setSportSkill(id, activeSport, skills[key]);
    toast({ title: "Scores Synced", description: "Technical technical registry updated." });
    setEditingDetailedPlayer(null);
  };

  const handlePrint = () => {
    const players = store.data.players.filter((p: any) => p.category === 'athlete' && p.sports?.includes(activeSport));
    const printContent = `
      <html>
        <head>
          <title>Skill Score Sheet - ${activeSport}</title>
          <style>
            @media print { @page { size: A4; margin: 1.5cm; } .no-print { display: none; } }
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 14px; color: #111; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 20px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; }
            th { background: #f4f4f4; text-transform: uppercase; font-weight: 800; font-size: 12px; }
            .score { font-weight: 900; color: #235C36; text-align: center; }
            .btn { display: inline-block; padding: 10px 20px; background: #235C36; color: white; text-decoration: none; border-radius: 5px; font-weight: 900; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right;"><a href="javascript:window.close()" class="btn">RETURN TO APP</a></div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800; text-transform: uppercase;">Technical Skill Registry: ${activeSport}</div>
          </div>
          <table>
            <thead>
              <tr><th>Sr.</th><th>Student Name</th><th>Std</th><th>Gender</th><th>Category</th><th style="text-align: center;">Total Score</th></tr>
            </thead>
            <tbody>
              ${players.map((p: any, i: number) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || { score: '0' };
                const cat = p.age < 14 ? 'U14' : p.age < 17 ? 'U17' : 'Senior';
                return `<tr><td>${i+1}</td><td><strong>${p.name.toUpperCase()}</strong></td><td>${p.std}</td><td>${p.gender}</td><td>${cat}</td><td class="score">${s.score} / ${getMaxScore(activeSport)}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const filteredPlayers = store.data.players.filter((p: any) => p.category === 'athlete' && p.sports?.includes(activeSport));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 shadow-lg">
        <div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-accent" /><h2 className="text-2xl font-black text-primary uppercase">Technical Skills Registry</h2></div>
        <Button onClick={handlePrint} className="bg-primary font-black uppercase text-xs tracking-widest h-12 rounded-xl px-8"><Printer className="w-4 h-4 mr-2" /> Print score sheet</Button>
      </div>
      
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl border overflow-x-auto">
        {sportsList.map(sport => (<Button key={sport} variant={activeSport === sport ? "default" : "ghost"} size="sm" className="h-9 px-4 text-[10px] font-black uppercase" onClick={() => setActiveSport(sport)}>{sport}</Button>))}
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white shadow-xl overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader className="bg-muted/50"><TableRow>
            <TableHead className="font-black text-[10px] uppercase w-[250px]">Athlete Name</TableHead>
            <TableHead className="font-black text-[10px] uppercase text-center w-[150px]">Status</TableHead>
            <TableHead className="font-black text-[10px] uppercase text-center w-[150px]">Total Score</TableHead>
            <TableHead className="font-black text-[10px] uppercase text-right w-[150px]">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-20 font-black uppercase">No athletes found for {activeSport}</TableCell></TableRow> : 
            filteredPlayers.map((p: any) => {
              const s = skills[`${p.id}_${activeSport}`] || { score: '0', detailedSkills: {} };
              return (
                <TableRow key={p.id} className="h-14 hover:bg-primary/5">
                  <TableCell className="font-black text-xs uppercase">{p.name} <span className="text-[8px] opacity-40 ml-2">Std {p.std}</span></TableCell>
                  <TableCell className="text-center font-bold text-[10px] uppercase text-muted-foreground">{Object.keys(s.detailedSkills || {}).length} Moves Scored</TableCell>
                  <TableCell className="text-center font-black text-primary">{s.score} <span className="text-[8px] opacity-40">/ {getMaxScore(activeSport)}</span></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" onClick={() => setEditingDetailedPlayer({ player: p, sport: activeSport })} className="font-black text-[9px] uppercase border-2 h-9 rounded-lg">Score Moves</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={() => setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">Technical evaluation: {editingDetailedPlayer?.sport}</DialogTitle></DialogHeader>
          {editingDetailedPlayer && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4"><span className="font-black uppercase text-lg">{editingDetailedPlayer.player.name}</span><span className="text-2xl font-black text-primary">{skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.score || '0'}/{getMaxScore(editingDetailedPlayer.sport)}</span></div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {getDetailedSkillsList(editingDetailedPlayer.sport).map((skill) => {
                  const val = skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.detailedSkills?.[skill] || '';
                  return (
                    <div key={skill} className="flex items-center justify-between border-b border-dashed py-2">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">{skill}</Label>
                      <div className="flex items-center gap-2"><Input type="number" max="10" min="0" className="w-16 h-10 text-center font-black" value={val} onChange={(e) => handleDetailedSkillChange(skill, e.target.value)} /><span className="text-[9px] font-black opacity-30">/10</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter className="pt-8"><Button variant="ghost" onClick={() => setEditingDetailedPlayer(null)} className="font-black uppercase text-xs">Cancel</Button><Button onClick={() => handleSave(editingDetailedPlayer!.player.id)} className="bg-primary font-black uppercase text-xs h-12 rounded-xl px-12 shadow-lg">Save Registry</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
