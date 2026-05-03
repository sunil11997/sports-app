"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trophy, Save, Printer, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const sportsList = ['Volleyball', 'Kabaddi', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

const KABADDI_SKILLS = ["Dubki", "Toe Touch", "Running Hand Touch", "Back Kick", "Lion Jump", "Sidekick", "Scorpion Kick", "Frog Jump", "Ankle Hold", "Thigh Hold", "Chain Tackle", "Dash", "Block", "Waist Hold", "Knee Hold"];
const VOLLEYBALL_SKILLS = ["Serving", "Passing (Bump)", "Setting", "Spiking (Attack)", "Blocking", "Digging (Defense)", "Footwork", "Communication"];
const HANDBALL_SKILLS = ["Passing", "Catching", "Dribbling", "Shooting", "Jump shot", "Running shot", "Dive shot", "Spin shot", "Feints", "Break-through", "Blocking", "Marking", "Tackling", "Interception", "Goalkeeping"];
const KHOKHO_SKILLS = ["Pole turning", "Giving Kho", "Dodging", "Running", "Diving", "Tapping", "Fake Kho", "Chain Play", "Ring Game", "Defensive Footwork"];
const RUNNING_SKILLS = ["Block Start", "Arm Action", "Knee Drive", "Finish Technique", "Pace Control", "Relay Baton Exchange"];
const SHOTPUT_SKILLS = ["Grip", "Stance", "Glide Technique", "Spin Technique", "Release Angle", "Power Position"];
const JAVELINE_SKILLS = ["Grip", "Approach Run", "Cross-over Steps", "Release Angle", "Recovery", "Flight Control"];
const LONGJUMP_SKILLS = ["Approach Run", "Takeoff", "Flight (Hitch-kick)", "Flight (Hang)", "Landing Technique"];
const HIGHJUMP_SKILLS = ["Approach", "Takeoff", "Bar Clearance (Flop)", "Bar Clearance (Straddle)", "Landing"];

const GENERAL_SKILLS = ["Fundamental Technique", "Game Awareness", "Pace Control", "Precision", "Rules Understanding", "Sportsmanship"];

export function SportsSkills({ store, section = 'sports' }: { store: any, section?: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const getDetailedSkillsList = (sport: string) => {
    if (isGeneral) return GENERAL_SKILLS;
    switch(sport) {
      case 'Kabaddi': return KABADDI_SKILLS;
      case 'Volleyball': return VOLLEYBALL_SKILLS;
      case 'Handball': return HANDBALL_SKILLS;
      case 'Kho Kho': return KHOKHO_SKILLS;
      case 'Running': return RUNNING_SKILLS;
      case 'Shot Put': return SHOTPUT_SKILLS;
      case 'Javline': return JAVELINE_SKILLS;
      case 'Long Jump': return LONGJUMP_SKILLS;
      case 'High Jump': return HIGHJUMP_SKILLS;
      default: return GENERAL_SKILLS;
    }
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
    const sportToSave = isGeneral ? 'General P.E.' : activeSport;
    const key = `${id}_${sportToSave}`;
    if (skills[key]) store.setSportSkill(id, sportToSave, skills[key]);
    toast({ title: "Scores Synced", description: "Technical technical registry updated." });
    setEditingDetailedPlayer(null);
  };

  const handlePrint = () => {
    const players = store.data.players.filter((p: any) => p.category === targetCategory && (isGeneral || p.sports?.includes(activeSport)));
    const printContent = `
      <html>
        <head>
          <title>Skill Score Sheet - ${isGeneral ? 'General P.E.' : activeSport}</title>
          <style>
            @media print { @page { size: A4; margin: 1.5cm; } .no-print { display: none; } }
            body { font-family: Inter, sans-serif; padding: 20px; font-size: 14px; color: #111; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 20px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; }
            th { background: #f4f4f4; text-transform: uppercase; font-weight: 800; font-size: 12px; }
            .score { font-weight: 900; color: #235C36; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800; text-transform: uppercase;">Technical Skill Registry: ${isGeneral ? 'General P.E.' : activeSport}</div>
          </div>
          <table>
            <thead>
              <tr><th>Sr.</th><th>Student Name</th><th>Std</th><th>Gender</th><th style="text-align: center;">Total Score</th></tr>
            </thead>
            <tbody>
              ${players.map((p: any, i: number) => {
                const sportName = isGeneral ? 'General P.E.' : activeSport;
                const s = store.data.sportSkills[`${p.id}_${sportName}`] || { score: '0' };
                return `<tr><td>${i+1}</td><td><strong>${p.name.toUpperCase()}</strong></td><td>${p.std}</td><td>${p.gender}</td><td class="score">${s.score} / ${getMaxScore(activeSport)}</td></tr>`;
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

  const filteredPlayers = store.data.players.filter((p: any) => 
    p.category === targetCategory && (isGeneral || p.sports?.includes(activeSport))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border-2 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center shadow-inner">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
              {isGeneral ? 'Student Technical Registry' : 'Advanced Athletic Hub'}
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Institutional Performance Logs</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-8 shadow-lg active-scale">
          <Printer className="w-4 h-4 mr-2" /> Print score sheet
        </Button>
      </div>
      
      {!isGeneral && (
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl border overflow-x-auto scrollbar-hide">
          {sportsList.map(sport => (
            <Button 
              key={sport} 
              variant={activeSport === sport ? "default" : "ghost"} 
              size="sm" 
              className={cn(
                "h-9 px-4 text-[10px] font-black uppercase transition-all",
                activeSport === sport ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
              )} 
              onClick={() => setActiveSport(sport)}
            >
              {sport}
            </Button>
          ))}
        </div>
      )}

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase h-12 px-6">Student Registry</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-center w-[200px]">Evaluation Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-center w-[150px]">Technical Score</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-right w-[150px] px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-24">
                  <div className="opacity-20 flex flex-col items-center">
                    <UserCircle className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase tracking-widest">No students found in this category</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((p: any) => {
                const sportName = isGeneral ? 'General P.E.' : activeSport;
                const s = skills[`${p.id}_${sportName}`] || { score: '0', detailedSkills: {} };
                return (
                  <TableRow key={p.id} className="h-16 hover:bg-primary/5 transition-colors border-b">
                    <TableCell className="px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase text-primary leading-tight">{p.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Standard {p.std}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-[10px] uppercase text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {Object.keys(s.detailedSkills || {}).length} Moves Tracked
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-primary text-base">{s.score}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Out of {getMaxScore(activeSport)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingDetailedPlayer({ player: p, sport: sportName })} 
                        className="font-black text-[9px] uppercase border-2 h-9 rounded-lg hover:bg-primary/5 transition-all"
                      >
                        Score technical moves
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={() => setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl">
          <DialogHeader className="bg-primary/5 p-8 border-b">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 border border-primary/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Technical Evaluation</DialogTitle>
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{editingDetailedPlayer?.sport}</p>
          </DialogHeader>
          
          <div className="p-8 overflow-y-auto max-h-[50vh] scrollbar-hide">
            {editingDetailedPlayer && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-muted/30 p-6 rounded-[2rem] border-2 border-dashed">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Profile</span>
                    <h3 className="font-black uppercase text-xl text-primary">{editingDetailedPlayer.player.name}</h3>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aggregate Score</span>
                    <p className="text-3xl font-black text-primary">
                      {skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.score || '0'}
                      <span className="text-xs opacity-40 ml-1">/ {getMaxScore(editingDetailedPlayer.sport)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {getDetailedSkillsList(editingDetailedPlayer.sport).map((skill) => {
                    const val = skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.detailedSkills?.[skill] || '';
                    return (
                      <div key={skill} className="flex items-center justify-between border-b border-muted py-3 group hover:border-primary/30 transition-colors">
                        <Label className="text-[11px] font-bold uppercase text-foreground/70 group-hover:text-primary">{skill}</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            max="10" 
                            min="0" 
                            className="w-16 h-10 text-center font-black rounded-xl border-2 focus-visible:ring-primary shadow-inner" 
                            value={val} 
                            onChange={(e) => handleDetailedSkillChange(skill, e.target.value)} 
                          />
                          <span className="text-[9px] font-black text-muted-foreground/30">/ 10</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted/10 p-8 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingDetailedPlayer(null)} className="flex-1 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest h-12">Discard</Button>
            <Button onClick={() => handleSave(editingDetailedPlayer!.player.id)} className="flex-[2] bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg">Save technical registry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
