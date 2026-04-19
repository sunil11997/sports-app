
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
    setSkills(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { skill1: '', skill2: '', score: '' }),
        [field]: value
      }
    }));
  };

  const handleSave = (id: string) => {
    const key = `${id}_${activeSport}`;
    const skill = skills[key];
    if (!skill) return;

    store.setSportSkill(id, activeSport, skill);
    toast({ title: "Skills Saved", description: `${activeSport} skills updated.` });
  };

  const filteredPlayers = store.data.players.filter((p: any) => p.sports.includes(activeSport));

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${activeSport} Skill Assessment - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Skill Roster: ${activeSport}</h1>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th><th>PRIMARY SKILL</th><th>SECONDARY SKILL</th><th>OVERALL SCORE</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${s.skill1 || '-'}</td>
                    <td>${s.skill2 || '-'}</td>
                    <td><strong>${s.score || '-'}</strong></td>
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
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Technical Expertise</h2>
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
              <TableHead className="text-primary-foreground font-bold uppercase">Primary Skill</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Secondary Skill</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Overall Score</TableHead>
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
                const current = skills[key] || { skill1: '', skill2: '', score: '' };
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {player.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeSport === 'Kabaddi' ? (
                        <Select value={current.skill1} onValueChange={(val) => handleChange(player.id, 'skill1', val)}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select Skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {KABADDI_SKILLS.map(skill => (
                              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          placeholder="e.g. Spike" 
                          className="rounded-lg"
                          value={current.skill1}
                          onChange={(e) => handleChange(player.id, 'skill1', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {activeSport === 'Kabaddi' ? (
                        <Select value={current.skill2} onValueChange={(val) => handleChange(player.id, 'skill2', val)}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select Skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {KABADDI_SKILLS.map(skill => (
                              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          placeholder="e.g. Serve" 
                          className="rounded-lg"
                          value={current.skill2}
                          onChange={(e) => handleChange(player.id, 'skill2', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        placeholder="Score" 
                        className="w-24 rounded-lg font-bold text-primary"
                        value={current.score}
                        onChange={(e) => handleChange(player.id, 'score', e.target.value)}
                      />
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
    </div>
  );
}
