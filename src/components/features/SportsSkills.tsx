"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trophy, Save, Printer, UserCircle, Star, Target, ShieldCheck, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const sportsList = ['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

const DETAILED_SKILLS: Record<string, string[]> = {
  'Volleyball': [
    'Serving', 'Passing', 'Setting', 'Spiking', 'Blocking', 
    'Digging', 'Footwork', 'Rolling', 'Communication', 'Court positioning'
  ],
  'Kabaddi': [
    'Raiding', 'Cant (Kabaddi chanting)', 'Hand touch', 'Toe touch', 'Kick', 
    'Dubki', 'Running hand touch', 'Escape skills', 'Blocking', 'Ankle hold', 
    'Thigh hold', 'Waist hold', 'Chain tackle', 'Dash', 'Coordination', 
    'Footwork', 'Balance', 'Agility', 'Team communication', 'Defensive positioning'
  ],
  'Kho Kho': [
    'Sitting technique', 'Pole diving', 'Dodging', 'Zig-zag running', 'Giving kho', 
    'Chasing', 'Direction change', 'Fake movement', 'Turning skills', 'Speed running', 
    'Coordination', 'Balance', 'Agility', 'Reflex action', 'Team communication', 
    'Court awareness', 'Defensive movement', 'Offensive movement'
  ],
  'Handball': [
    'Passing', 'Catching', 'Dribbling', 'Shooting', 'Jump shot', 
    'Bounce shot', 'Goalkeeping', 'Blocking', 'Footwork', 'Dodging', 
    'Fake movement', 'Defensive positioning', 'Attacking movement', 
    'Team coordination', 'Speed running', 'Agility', 'Balance', 
    'Reaction speed', 'Court awareness', 'Communication'
  ],
  'Running': [
    'Starting technique', 'Linear acceleration', 'Maximum velocity', 'Running posture', 'Arm action', 
    'Breathing control', 'Finishing lean', 'Lane discipline', 'Reaction time', 'Stamina'
  ],
  'Shot Put': [
    'Grip', 'Stance', 'Glide technique', 'Rotation', 'Power position', 
    'Extension', 'Wrist flick', 'Reverse/Recovery', 'Balance', 'Angle of release'
  ],
  'Javelin Throw': [
    'Grip', 'Carry', 'Approach run', 'Cross-over steps', 'Withdrawal', 
    'Power position', 'Delivery', 'Recovery', 'Flick', 'Tip control'
  ],
  'Disc Throw': [
    'Grip', 'Initial stance', 'Swing', 'Turn/Pivot', 'Power position', 
    'Release', 'Reverse/Recovery', 'Centrifugal control', 'Balance', 'Angle of release'
  ],
  'Long Jump': [
    'Approach run', 'Take-off', 'Flight phase', 'Landing technique', 'Speed maintenance'
  ],
  'High Jump': [
    'Approach curve', 'Take-off point', 'Body arch', 'Bar clearance', 'Landing safety'
  ],
};

export function SportsSkills({ store, section = 'sports', preselectedSport }: { store: any, section?: 'sports' | 'general', preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || sportsList[0]);
  const [localDetailedSkills, setLocalDetailedSkills] = useState<Record<string, string>>({});
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  useEffect(() => {
    if (preselectedSport) setActiveSport(preselectedSport);
  }, [preselectedSport]);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const handleOpenEvaluation = (player: any, sport: string) => {
    const key = `${player.id}_${sport}`;
    const existingData = store.data.sportSkills[key] || {};
    const rawSkills = existingData.detailedSkills || {};
    const normalized: Record<string, string> = {};
    Object.keys(rawSkills).forEach(k => {
      const val = parseFloat(rawSkills[k]);
      normalized[k] = isNaN(val) ? '' : (val / 10).toString();
    });
    setLocalDetailedSkills(normalized);
    setEditingDetailedPlayer({ player, sport });
  };

  const handleSave = () => {
    if (!editingDetailedPlayer) return;
    const { player, sport } = editingDetailedPlayer;
    
    const skills = DETAILED_SKILLS[sport] || [];
    let totalScore = 0;
    const skillsToSave: Record<string, string> = {};

    skills.forEach(s => {
      const val = parseFloat(localDetailedSkills[s]) || 0;
      const normalized = Math.min(10, Math.max(0, val)) * 10;
      skillsToSave[s] = normalized.toString();
      totalScore += normalized;
    });

    const aggregate = skills.length > 0 ? (totalScore / skills.length).toFixed(1) : "0";

    store.setSportSkill(player.id, sport, {
      score: aggregate,
      detailedSkills: skillsToSave,
      playerId: player.id,
      sportName: sport
    });

    toast({ title: "Evaluation Archived", description: `Technical moves for ${player.name} saved to registry.` });
    setEditingDetailedPlayer(null);
  };

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.category === targetCategory && (isGeneral || (p.sports && p.sports.includes(activeSport))))
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, targetCategory, isGeneral, activeSport]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border-2 shadow-xl gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-[1.5rem] flex items-center justify-center border-2 border-accent/20">
            <Trophy className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">{activeSport} Mastery</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 bg-primary/5">Institutional Scorecard</Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mt-0.5 tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 10-Point Grading Active
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl px-10 shadow-2xl active-scale transition-all">
          <Printer className="w-5 h-5 mr-2" /> Export Technical Registry
        </Button>
      </div>
      
      {!isGeneral && !preselectedSport && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/40 rounded-[2rem] border-2 shadow-inner overflow-x-auto scrollbar-hide">
          {sportsList.map(sport => (
            <Button 
              key={sport} 
              variant={activeSport === sport ? "default" : "ghost"} 
              size="sm" 
              className={cn(
                "h-11 px-6 rounded-xl text-[10px] font-black uppercase transition-all", 
                activeSport === sport ? "bg-primary text-white shadow-lg scale-105" : "text-muted-foreground hover:bg-white"
              )}
              onClick={() => setActiveSport(sport)}
            >
              {sport}
            </Button>
          ))}
        </div>
      )}

      <div className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
        <ScrollArea className="w-full">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="h-14">
                <TableHead className="font-black text-[11px] uppercase px-8">Student Athlete</TableHead>
                <TableHead className="font-black text-[11px] uppercase text-center w-[200px]">Aggregate Mastery</TableHead>
                <TableHead className="font-black text-[11px] uppercase text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-32 font-black uppercase tracking-widest opacity-20">No matching registry entries.</TableCell></TableRow>
              ) : (
                filteredPlayers.map((p: any) => {
                  const sportName = isGeneral ? 'General P.E.' : activeSport;
                  const s = store.data.sportSkills[`${p.id}_${sportName}`] || { score: '0' };
                  return (
                    <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-all group border-b last:border-0">
                      <TableCell className="px-8">
                         <div className="flex flex-col">
                            <span className="font-black uppercase text-sm text-primary leading-none">{p.name}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Roll No: #{p.serialNumber || '0'} • Std {p.std}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-black text-primary leading-none">{s.score}%</span>
                          <div className="w-16 h-1 bg-muted rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-accent" style={{ width: `${s.score}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEvaluation(p, sportName)} className="font-black text-[10px] uppercase rounded-xl border-2 hover:bg-primary hover:text-white transition-all h-10 px-6">
                          Evaluate Technical Moves <ChevronRight className="w-3 h-3 ml-2" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={() => setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-primary p-10 text-white relative shrink-0">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                 <Target className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Technical Assessment</DialogTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">{editingDetailedPlayer?.player.name} • {editingDetailedPlayer?.sport}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 gap-6">
                  {(DETAILED_SKILLS[editingDetailedPlayer?.sport || ''] || []).map(skill => (
                    <div key={skill} className="space-y-3 bg-muted/20 p-4 rounded-2xl border-2 border-transparent hover:border-primary/10 transition-all">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">{skill}</Label>
                        <span className="text-[10px] font-black text-accent">{localDetailedSkills[skill] || '0'} / 10</span>
                      </div>
                      <Input 
                        type="number" 
                        min="0"
                        max="10"
                        step="0.1"
                        value={localDetailedSkills[skill] || ''} 
                        placeholder="0-10"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value;
                          setLocalDetailedSkills(prev => ({ ...prev, [skill]: val }));
                        }} 
                        className="h-12 text-center text-lg font-black rounded-xl border-2 shadow-inner focus:ring-accent" 
                      />
                    </div>
                  ))}
               </div>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <DialogFooter className="p-10 bg-slate-50 border-t shrink-0">
            <Button onClick={handleSave} className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl active-scale text-xs">
              Archive Technical Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}