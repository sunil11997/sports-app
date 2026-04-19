"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sportsList = ['Volleyball', 'Kabaddi', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

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

  // Filter players who have this activeSport in their sports array
  const filteredPlayers = store.data.players.filter((p: any) => p.sports.includes(activeSport));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-primary uppercase tracking-tight mb-6">Technical Expertise</h2>
      
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
                      <Input 
                        placeholder="e.g. Spike" 
                        className="rounded-lg"
                        value={current.skill1}
                        onChange={(e) => handleChange(player.id, 'skill1', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="e.g. Serve" 
                        className="rounded-lg"
                        value={current.skill2}
                        onChange={(e) => handleChange(player.id, 'skill2', e.target.value)}
                      />
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
