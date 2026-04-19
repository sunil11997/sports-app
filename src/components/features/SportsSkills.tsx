"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Trophy, Save, Printer, ListChecks, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const sportsList = ['Volleyball', 'Kabaddi', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

const KABADDI_SKILLS = [
  "Dubki", 
  "Toe Touch", 
  "Running Hand Touch", 
  "Back Kick", 
  "Lion Jump", 
  "Sidekick", 
  "Scorpion Kick", 
  "Frog Jump", 
  "Ankle Hold", 
  "Thigh Hold", 
  "Chain Tackle", 
  "Dash", 
  "Block", 
  "Waist Hold", 
  "Knee Hold"
];

const VOLLEYBALL_SKILLS = [
  "Serving",
  "Passing (Bump)",
  "Setting",
  "Spiking (Attack)",
  "Blocking",
  "Digging (Defense)",
  "Footwork / Movement",
  "Communication"
];

export function SportsSkills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  const handleChange = (id: string, field: string, value: string) => {
    const key = `${id}_${activeSport}`;
    const current = skills[key] || { skill1: '', score1: '0', skill2: '', score2: '0', score: '0' };
    
    const updated = {
      ...current,
      [field]: value
    };

    if (field === 'score1' || field === 'score2') {
      const s1 = parseFloat(updated.score1) || 0;
      const s2 = parseFloat(updated.score2) || 0;
      updated.score = (s1 + s2).toString();
    }

    setSkills(prev => ({
      ...prev,
      [key]: updated
    }));
  };

  const handleDetailedSkillChange = (skill: string, value: string) => {
    if (!editingDetailedPlayer) return;
    
    const { player, sport } = editingDetailedPlayer;
    const key = `${player.id}_${sport}`;
    const current = skills[key] || { score: '0', detailedSkills: {} };
    const currentDetailedSkills = current.detailedSkills || {};
    
    const updatedDetailedSkills = {
      ...currentDetailedSkills,
      [skill]: value
    };

    // Calculate total score for detailed sports
    const total = Object.values(updatedDetailedSkills).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);

    const updated = {
      ...current,
      detailedSkills: updatedDetailedSkills,
      score: total.toString()
    };

    setSkills(prev => ({
      ...prev,
      [key]: updated
    }));
  };

  const handleSave = (id: string) => {
    const key = `${id}_${activeSport}`;
    const skill = skills[key];
    if (!skill) return;

    store.setSportSkill(id, activeSport, skill);
    toast({ title: "Skills Saved", description: `${activeSport} technical report updated.` });
    setEditingDetailedPlayer(null);
  };

  const filteredPlayers = store.data.players.filter((p: any) => p.sports.includes(activeSport));

  const handlePrint = () => {
    const isDetailed = activeSport === 'Kabaddi' || activeSport === 'Volleyball';
    const maxScore = activeSport === 'Kabaddi' ? 150 : activeSport === 'Volleyball' ? 80 : 20;

    const printContent = `
      <html>
        <head>
          <title>${activeSport} Skill Assessment - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; color: #333; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; text-transform: uppercase; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f4fcf6; font-weight: bold; font-size: 12px; color: #1b4b3a; }
            .score-cell { font-weight: 900; color: #235C36; }
            .skills-list { font-size: 10px; color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Skill Roster: ${activeSport}</h1>
          <p>Institutional Technical Performance Evaluation - Teacher Sunil Deshmukh</p>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th>
                ${isDetailed ? '<th>SKILLS BREAKDOWN</th>' : '<th>PRIMARY SKILL (10M)</th><th>SECONDARY SKILL (10M)</th>'}
                <th>TOTAL SCORE</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || {};
                if (isDetailed) {
                  const breakdown = Object.entries(s.detailedSkills || {})
                    .map(([name, score]) => `${name}: ${score}`)
                    .join(', ');
                  return `
                    <tr>
                      <td><strong>${p.name}</strong><br/><small>Std ${p.std}</small></td>
                      <td class="skills-list">${breakdown || 'No skills scored yet'}</td>
                      <td class="score-cell">${s.score || '0'} / ${maxScore}</td>
                    </tr>
                  `;
                }
                return `
                  <tr>
                    <td><strong>${p.name}</strong><br/><small>Std ${p.std}</small></td>
                    <td>${s.skill1 || '-'}${s.score1 ? ` (${s.score1})` : ''}</td>
                    <td>${s.skill2 || '-'}${s.score2 ? ` (${s.score2})` : ''}</td>
                    <td class="score-cell">${s.score || '0'} / 20</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  const isDetailedSport = activeSport === 'Kabaddi' || activeSport === 'Volleyball';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Technical Expertise</h2>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl font-bold h-12">
          <Printer className="w-4 h-4 mr-2" /> Print {activeSport} Roster
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border shadow-sm mb-6">
        {sportsList.map(sport => (
          <Button
            key={sport}
            variant={activeSport === sport ? "default" : "ghost"}
            className={`rounded-xl transition-all font-bold ${activeSport === sport ? 'bg-primary text-primary-foreground' : 'text-primary/70 hover:bg-primary/5'}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground font-bold uppercase">Player</TableHead>
              {isDetailedSport ? (
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Skill Assessment</TableHead>
              ) : (
                <>
                  <TableHead className="text-primary-foreground font-bold uppercase min-w-[250px]">Primary Skill (Max 10)</TableHead>
                  <TableHead className="text-primary-foreground font-bold uppercase min-w-[250px]">Secondary Skill (Max 10)</TableHead>
                </>
              )}
              <TableHead className="text-primary-foreground font-bold uppercase text-center">Total Score</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No players registered for {activeSport}.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const key = `${player.id}_${activeSport}`;
                const current = skills[key] || { skill1: '', score1: '0', skill2: '', score2: '0', score: '0', detailedSkills: {} };
                
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {player.id}</span>
                      </div>
                    </TableCell>
                    
                    {isDetailedSport ? (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="outline" className="border-accent text-primary">
                            {Object.keys(current.detailedSkills || {}).length} Skills Evaluated
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg font-bold h-8"
                            onClick={() => setEditingDetailedPlayer({ player, sport: activeSport })}
                          >
                            <ListChecks className="w-3 h-3 mr-1" /> Score Detailed Skills
                          </Button>
                        </div>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Primary Skill" 
                              className="rounded-lg flex-1 h-9"
                              value={current.skill1}
                              onChange={(e) => handleChange(player.id, 'skill1', e.target.value)}
                            />
                            <Input 
                              type="number"
                              max="10"
                              placeholder="Marks"
                              className="w-20 rounded-lg text-center font-bold h-9"
                              value={current.score1}
                              onChange={(e) => handleChange(player.id, 'score1', e.target.value)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Secondary Skill" 
                              className="rounded-lg flex-1 h-9"
                              value={current.skill2}
                              onChange={(e) => handleChange(player.id, 'skill2', e.target.value)}
                            />
                            <Input 
                              type="number"
                              max="10"
                              placeholder="Marks"
                              className="w-20 rounded-lg text-center font-bold h-9"
                              value={current.score2}
                              onChange={(e) => handleChange(player.id, 'score2', e.target.value)}
                            />
                          </div>
                        </TableCell>
                      </>
                    )}

                    <TableCell className="text-center">
                      <div className="bg-primary/5 py-2 px-3 rounded-lg border border-primary/10">
                        <span className="font-black text-xl text-primary">{current.score || '0'}</span>
                        <span className="text-[10px] text-muted-foreground block font-bold">
                          MAX {activeSport === 'Kabaddi' ? '150' : activeSport === 'Volleyball' ? '80' : '20'}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {!isDetailedSport && (
                        <Button 
                          size="sm" 
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-black"
                          onClick={() => handleSave(player.id)}
                        >
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                      )}
                      {isDetailedSport && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:bg-primary/5 rounded-lg font-bold"
                          onClick={() => setEditingDetailedPlayer({ player, sport: activeSport })}
                        >
                          Update
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
        <p className="text-sm font-bold text-primary italic">
          * {activeSport === 'Kabaddi' 
            ? 'For Kabaddi, all 15 technical moves are scored out of 10 marks each for a total of 150.' 
            : activeSport === 'Volleyball'
            ? 'For Volleyball, 8 specific skills are scored out of 10 marks each for a total of 80.'
            : 'Each skill is marked out of 10 points for a total institutional technical score of 20.'}
        </p>
        <div className="flex gap-4">
          <Badge className="bg-accent text-accent-foreground font-black uppercase">
            {activeSport === 'Kabaddi' ? 'Total: 150 Marks' : activeSport === 'Volleyball' ? 'Total: 80 Marks' : 'Total: 20 Marks'}
          </Badge>
        </div>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={(open) => !open && setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" /> {editingDetailedPlayer?.sport} Technical Assessment
            </DialogTitle>
          </DialogHeader>
          
          {editingDetailedPlayer && (
            <div className="py-4 space-y-6">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-primary uppercase">{editingDetailedPlayer.player.name}</h4>
                  <p className="text-xs text-muted-foreground font-bold">Standard: {editingDetailedPlayer.player.std}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary uppercase">Current Score</p>
                  <p className="text-3xl font-black text-primary">
                    {skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.score || '0'}
                    <span className="text-sm text-muted-foreground">
                      /{editingDetailedPlayer.sport === 'Kabaddi' ? '150' : '80'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-2">
                {(editingDetailedPlayer.sport === 'Kabaddi' ? KABADDI_SKILLS : VOLLEYBALL_SKILLS).map((skill) => {
                  const key = `${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`;
                  const score = skills[key]?.detailedSkills?.[skill] || '';
                  return (
                    <div key={skill} className="flex items-center justify-between group">
                      <Label className="font-bold text-foreground/80 group-hover:text-primary transition-colors">{skill}</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number"
                          max="10"
                          min="0"
                          placeholder="0-10"
                          className="w-20 text-center font-bold rounded-lg border-2 h-9"
                          value={score}
                          onChange={(e) => handleDetailedSkillChange(skill, e.target.value)}
                        />
                        <span className="text-[10px] font-black text-muted-foreground">/ 10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setEditingDetailedPlayer(null)}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-8" onClick={() => handleSave(editingDetailedPlayer!.player.id)}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
