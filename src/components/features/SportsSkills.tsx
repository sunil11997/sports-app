"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export function SportsSkills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);

  const handleChange = (id: string, field: string, value: string) => {
    const key = `${id}_${activeSport}`;
    const current = skills[key] || { skill1: '', score1: '0', skill2: '', score2: '0', score: '0' };
    
    const updated = {
      ...current,
      [field]: value
    };

    // Auto-calculate total score
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

  const handleSave = (id: string) => {
    const key = `${id}_${activeSport}`;
    const skill = skills[key];
    if (!skill) return;

    store.setSportSkill(id, activeSport, skill);
    toast({ title: "Skills Saved", description: `${activeSport} technical report updated.` });
  };

  const filteredPlayers = store.data.players.filter((p: any) => p.sports.includes(activeSport));

  const handlePrint = () => {
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
            .total-row { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Skill Roster: ${activeSport}</h1>
          <p>Institutional Technical Performance Evaluation</p>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>PRIMARY SKILL (M)</th>
                <th>SECONDARY SKILL (M)</th>
                <th>TOTAL SCORE</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong><br/><small>Std ${p.std}</small></td>
                    <td>${s.skill1 || '-'}${s.score1 ? ` (${s.score1})` : ''}</td>
                    <td>${s.skill2 || '-'}${s.score2 ? ` (${s.score2})` : ''}</td>
                    <td class="score-cell">${s.score || '0'}</td>
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
              <TableHead className="text-primary-foreground font-bold uppercase min-w-[250px]">Primary Skill (Max 10)</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase min-w-[250px]">Secondary Skill (Max 10)</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-center">Total (20)</TableHead>
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
                const current = skills[key] || { skill1: '', score1: '0', skill2: '', score2: '0', score: '0' };
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {player.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {activeSport === 'Kabaddi' ? (
                          <Select value={current.skill1} onValueChange={(val) => handleChange(player.id, 'skill1', val)}>
                            <SelectTrigger className="rounded-lg flex-1">
                              <SelectValue placeholder="Skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {KABADDI_SKILLS.map(skill => (
                                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            placeholder="Primary Skill" 
                            className="rounded-lg flex-1"
                            value={current.skill1}
                            onChange={(e) => handleChange(player.id, 'skill1', e.target.value)}
                          />
                        )}
                        <Input 
                          type="number"
                          max="10"
                          placeholder="Marks"
                          className="w-20 rounded-lg text-center font-bold"
                          value={current.score1}
                          onChange={(e) => handleChange(player.id, 'score1', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {activeSport === 'Kabaddi' ? (
                          <Select value={current.skill2} onValueChange={(val) => handleChange(player.id, 'skill2', val)}>
                            <SelectTrigger className="rounded-lg flex-1">
                              <SelectValue placeholder="Skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {KABADDI_SKILLS.map(skill => (
                                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            placeholder="Secondary Skill" 
                            className="rounded-lg flex-1"
                            value={current.skill2}
                            onChange={(e) => handleChange(player.id, 'skill2', e.target.value)}
                          />
                        )}
                        <Input 
                          type="number"
                          max="10"
                          placeholder="Marks"
                          className="w-20 rounded-lg text-center font-bold"
                          value={current.score2}
                          onChange={(e) => handleChange(player.id, 'score2', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="bg-primary/5 py-2 px-3 rounded-lg border border-primary/10">
                        <span className="font-black text-xl text-primary">{current.score || '0'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-black"
                        onClick={() => handleSave(player.id)}
                      >
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
        <p className="text-sm font-bold text-primary italic">* Each skill is marked out of 10 points for a total institutional technical score of 20.</p>
        <div className="flex gap-4">
          <Badge className="bg-primary/20 text-primary border-primary/30">Primary: 10M</Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">Secondary: 10M</Badge>
          <Badge className="bg-accent text-accent-foreground font-black">Total: 20M</Badge>
        </div>
      </div>
    </div>
  );
}
