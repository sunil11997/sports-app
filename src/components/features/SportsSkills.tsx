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
  "Dubki", "Toe Touch", "Running Hand Touch", "Back Kick", "Lion Jump", 
  "Sidekick", "Scorpion Kick", "Frog Jump", "Ankle Hold", "Thigh Hold", 
  "Chain Tackle", "Dash", "Block", "Waist Hold", "Knee Hold"
];

const VOLLEYBALL_SKILLS = [
  "Serving", "Passing (Bump)", "Setting", "Spiking (Attack)", 
  "Blocking", "Digging (Defense)", "Footwork / Movement", "Communication"
];

const HANDBALL_SKILLS = [
  "Passing", "Catching", "Dribbling", "Shooting", "Jump shot", "Running shot", "Dive shot", "Spin shot",
  "Feints (body fake)", "Break-through (1 vs 1 attack)", "Fast break", "Blocking", "Marking", "Tackling",
  "Interception", "Goalkeeping", "Defensive stance", "Footwork", "Pivot play", "Positioning",
  "Support play", "Timing", "Coordination", "Communication", "Decision making", "Game awareness",
  "Reaction time", "Balance & body control"
];

const KHO_KHO_SKILLS = [
  "Sitting posture", "Pole turning", "Giving kho", "Receiving kho", "Chasing",
  "Dodging", "Zig-zag running", "Sudden direction change", "Fake (feint) movement",
  "Touching (tagging)", "Diving", "Rolling", "Skidding", "Running speed",
  "Reaction time", "Footwork", "Coordination", "Balance & body control",
  "Awareness of court", "Team coordination"
];

const RUNNING_SKILLS = [
  "Starting technique", "Acceleration", "Stride length", "Stride frequency", "Running posture",
  "Arm action", "Foot placement", "Breathing control", "Pacing", "Endurance",
  "Speed", "Sprinting technique", "Turning technique", "Finish (leaning)", "Reaction time",
  "Balance", "Coordination", "Agility", "Flexibility", "Recovery technique"
];

const SHOT_PUT_SKILLS = [
  "Grip", "Stance", "Shot placement (neck position)", "Glide technique", "Rotation technique",
  "Power position", "Leg drive", "Hip rotation", "Trunk rotation", "Arm extension",
  "Release angle", "Release height", "Follow-through", "Balance", "Coordination",
  "Timing", "Footwork", "Strength", "Explosive power", "Control"
];

const JAVLINE_SKILLS = [
  "Grip", "Carrying position", "Run-up", "Approach rhythm", "Withdrawal (drawing back)", 
  "Cross steps", "Impulse stride", "Block (front leg action)", "Hip rotation", 
  "Trunk rotation", "Arm action", "Release", "Release angle", "Follow-through", 
  "Balance", "Coordination", "Timing", "Footwork", "Speed", "Strength", "Flexibility", "Control"
];

const LONG_JUMP_SKILLS = [
  "Approach run", "Acceleration", "Rhythm control", "Take-off", "Take-off foot placement",
  "Penultimate step", "Last step control", "Knee drive", "Arm swing",
  "Flight technique (hang)", "Flight technique (hitch-kick)", "Body posture in air",
  "Landing", "Leg extension", "Sand contact technique", "Balance", "Coordination",
  "Timing", "Speed", "Strength", "Explosive power", "Flexibility", "Control"
];

const HIGH_JUMP_SKILLS = [
  "Approach run", "Curve running", "J-approach", "Rhythm control", "Take-off",
  "Take-off foot placement", "Penultimate step", "Last step", "Knee drive",
  "Arm swing", "Body lean (inward)", "Bar clearance (Fosbury flop)", "Back arch",
  "Hip lift", "Head position", "Landing (mat)", "Balance", "Coordination",
  "Timing", "Speed", "Strength", "Explosive power", "Flexibility", "Control"
];

export function SportsSkills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(sportsList[0]);
  const [skills, setSkills] = useState<Record<string, any>>(store.data.sportSkills);
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);

  const getDetailedSkillsList = (sport: string) => {
    switch (sport) {
      case 'Kabaddi': return KABADDI_SKILLS;
      case 'Volleyball': return VOLLEYBALL_SKILLS;
      case 'Handball': return HANDBALL_SKILLS;
      case 'Kho Kho': return KHO_KHO_SKILLS;
      case 'Running': return RUNNING_SKILLS;
      case 'Shot Put': return SHOT_PUT_SKILLS;
      case 'Javline': return JAVLINE_SKILLS;
      case 'Long Jump': return LONG_JUMP_SKILLS;
      case 'High Jump': return HIGH_JUMP_SKILLS;
      default: return [];
    }
  };

  const getMaxScore = (sport: string) => {
    switch (sport) {
      case 'Kabaddi': return 150;
      case 'Volleyball': return 80;
      case 'Handball': return 280;
      case 'Kho Kho': return 200;
      case 'Running': return 200;
      case 'Shot Put': return 200;
      case 'Javline': return 220;
      case 'Long Jump': return 230;
      case 'High Jump': return 240;
      default: return 20;
    }
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
    toast({ title: "Scores Synced", description: "Technical spreadsheet updated." });
    setEditingDetailedPlayer(null);
  };

  const filteredPlayers = store.data.players.filter((p: any) => p.category === 'athlete' && p.sports.includes(activeSport));

  const handlePrint = () => {
    const maxScore = getMaxScore(activeSport);
    const printContent = `
      <html>
        <head>
          <title>${activeSport} Skill Sheet</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Skill Registry: ${activeSport}</h1>
          <table>
            <thead>
              <tr><th>PLAYER</th><th>SKILLS</th><th>SCORE</th></tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || {};
                const b = Object.entries(s.detailedSkills || {}).map(([n, sc]) => `${n}: ${sc}`).join(', ');
                return `<tr><td>${p.name} (Std ${p.std})</td><td>${b}</td><td>${s.score || '0'} / ${maxScore}</td></tr>`;
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Excel: Technical Skills Registry</h2>
        </div>
        <Button onClick={handlePrint} size="sm" className="font-bold h-9">
          <Printer className="w-4 h-4 mr-2" /> Print Sheet
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
        {sportsList.map(sport => (
          <Button
            key={sport}
            variant={activeSport === sport ? "default" : "ghost"}
            size="sm"
            className={`h-8 rounded px-3 text-[10px] font-black uppercase transition-all ${activeSport === sport ? '' : 'text-muted-foreground'}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase w-[200px]">Player Name</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[150px]">Status</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[120px]">Current Total</TableHead>
              <TableHead className="h-9 px-2 font-black text-[10px] uppercase text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No athletes found for {activeSport}.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const key = `${player.id}_${activeSport}`;
                const current = skills[key] || { score: '0', detailedSkills: {} };
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-xs font-bold">
                      {player.name} <span className="text-[9px] text-muted-foreground uppercase">(Std {player.std})</span>
                    </TableCell>
                    <TableCell className="border-r p-2 text-center">
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">
                        {Object.keys(current.detailedSkills || {}).length} Moves Scored
                      </span>
                    </TableCell>
                    <TableCell className="border-r p-2 text-center">
                      <div className="font-black text-primary text-sm">{current.score || '0'} <span className="text-[9px] text-muted-foreground">/ {getMaxScore(activeSport)}</span></div>
                    </TableCell>
                    <TableCell className="p-1 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase" onClick={() => setEditingDetailedPlayer({ player, sport: activeSport })}>
                        Score Moves
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDetailedPlayer} onOpenChange={(open) => !open && setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-primary">Technical Evaluation: {editingDetailedPlayer?.sport}</DialogTitle>
          </DialogHeader>
          {editingDetailedPlayer && (
            <div className="py-2 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-black text-sm uppercase">{editingDetailedPlayer.player.name}</span>
                <span className="text-lg font-black text-primary">Total: {skills[`${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`]?.score || '0'}/{getMaxScore(editingDetailedPlayer.sport)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {getDetailedSkillsList(editingDetailedPlayer.sport).map((skill) => {
                  const key = `${editingDetailedPlayer.player.id}_${editingDetailedPlayer.sport}`;
                  const score = skills[key]?.detailedSkills?.[skill] || '';
                  return (
                    <div key={skill} className="flex items-center justify-between border-b border-dashed py-1">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">{skill}</Label>
                      <div className="flex items-center gap-1">
                        <Input type="number" max="10" min="0" className="w-14 h-7 text-center text-xs font-bold" value={score} onChange={(e) => handleDetailedSkillChange(skill, e.target.value)} />
                        <span className="text-[9px] font-bold text-muted-foreground">/10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingDetailedPlayer(null)}>Cancel</Button>
            <Button size="sm" onClick={() => handleSave(editingDetailedPlayer!.player.id)}>Complete Evaluation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}