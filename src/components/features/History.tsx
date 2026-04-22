
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  History as HistoryIcon, 
  Printer, 
  Stethoscope,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const availablePlayers = store.data.players.filter((p: any) => p.category === targetCategory);

  const player = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const playerIncidents = useMemo(() => 
    store.data.healthIncidents.filter((inc: any) => inc.playerId === selectedPlayerId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [selectedPlayerId, store.data.healthIncidents]
  );

  const playerFitness = useMemo(() => 
    (store.data.fitnessHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const playerSkills = useMemo(() => 
    (store.data.skillsHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()),
    [selectedPlayerId, store.data.skillsHistory]
  );

  const handlePrint = () => {
    if (!player) return;
    const printContent = `
      <html>
        <head>
          <title>Progress Dossier - ${player.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.4; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; text-transform: uppercase; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background: #f4f4f4; font-weight: bold; }
            .section-title { background: #e8f5e9; padding: 8px 12px; margin-top: 25px; border-radius: 4px; font-weight: 900; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>INSTITUTIONAL PROGRESS: ${player.name}</h1>
          <p>Std: ${player.std} | Age: ${player.age} | ${section.toUpperCase()} Division</p>
          
          <div class="section-title">DETAILED PERFORMANCE HISTORY</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                ${isGeneral ? 
                  '<th>Ht (cm)</th><th>Wt (kg)</th><th>Exam SC</th>' : 
                  '<th>10x6</th><th>50M</th><th>600M</th><th>Reach</th><th>Jump</th><th>Situps</th><th>Strength</th>'
                }
                <th>Total Score</th>
                <th>Status / Level</th>
              </tr>
            </thead>
            <tbody>
              ${playerFitness.map(f => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td>
                  ${isGeneral ? 
                    `<td>${f.height || '-'}</td><td>${f.weight || '-'}</td><td>${f.examMarks || '-'}</td>` : 
                    `<td>${f.shuttleRun || '-'}</td><td>${f.run50m || '-'}</td><td>${f.run600m || '-'}</td><td>${f.sitAndReach || '-'}</td><td>${f.boardJump || '-'}</td><td>${f.sitUps || '-'}</td><td>${f.strengthScore || '-'}%</td>`
                  }
                  <td><strong>${f.score}${isGeneral ? '' : '%'}</strong></td>
                  <td>${f.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">TECHNICAL SKILL EVOLUTION</div>
          <table>
            <thead>
              <tr><th>Sport</th><th>Technical Moves & Scores</th><th>Aggregate</th><th>Last Updated</th></tr>
            </thead>
            <tbody>
              ${playerSkills.map(s => `
                <tr>
                  <td><strong>${s.sportName}</strong></td>
                  <td>${Object.entries(s.detailedSkills || {}).map(([name, sc]) => `${name}: ${sc}/10`).join(', ')}</td>
                  <td><strong>${s.score}</strong></td>
                  <td>${format(new Date(s.lastUpdated || 0), 'PP')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">MEDICAL & INCIDENT LOG</div>
          <table>
            <thead><tr><th>Date</th><th>Incident Description & Suggested Treatment</th></tr></thead>
            <tbody>
              ${playerIncidents.map(inc => `<tr><td>${format(new Date(inc.date), 'dd MMM yyyy')}</td><td>${inc.description}</td></tr>`).join('')}
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Excel: Progress Archives</h2>
        </div>
        <div className="flex flex-col w-full md:w-80 gap-2">
          <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
            <SelectTrigger className="h-9 text-sm font-bold bg-white">
              <SelectValue placeholder="Pick student..." />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!selectedPlayerId} onClick={handlePrint} size="sm" className="font-bold h-9">
            <Printer className="w-4 h-4 mr-2" /> Export Dossier
          </Button>
        </div>
      </div>

      {!selectedPlayerId ? (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg opacity-40">
          <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          <p className="font-bold uppercase text-[11px] tracking-widest">Select a student to view monthly evolution</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
            <div className="bg-primary/5 p-2 border-b font-black text-[11px] uppercase text-primary flex items-center justify-between">
              <span>Monthly Progress Spread: {player?.name}</span>
              <Badge variant="outline" className="text-[9px] font-black uppercase">Archive Data</Badge>
            </div>
            <Table className="border-collapse min-w-max">
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow className="border-b">
                  <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black sticky left-0 bg-muted/30 z-10 w-[120px]">Date</TableHead>
                  {isGeneral ? (
                    <>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[60px]">Ht</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[60px]">Wt</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[60px]">Exam</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">10x6</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">50M</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">600M</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">Reach</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">Jump</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">Situps</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[50px]">Str %</TableHead>
                    </>
                  )}
                  <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[80px]">Score</TableHead>
                  <TableHead className="h-8 px-2 text-[9px] uppercase font-black text-right w-[150px]">Status / Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerFitness.length === 0 ? (
                  <TableRow><TableCell colSpan={15} className="text-center py-4 text-[11px] text-muted-foreground italic">No archive data found for this player.</TableCell></TableRow>
                ) : (
                  playerFitness.map((fit: any, idx: number) => (
                    <TableRow key={idx} className="border-b even:bg-muted/30 h-9 hover:bg-primary/5 transition-colors">
                      <TableCell className="border-r p-2 text-[10px] font-bold sticky left-0 bg-white z-10">
                        {format(new Date(fit.updatedAt || fit.date || new Date()), 'MMM yyyy')}
                      </TableCell>
                      {isGeneral ? (
                        <>
                          <TableCell className="border-r p-1 text-center text-[11px]">{fit.height || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[11px]">{fit.weight || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[11px] font-black text-primary">{fit.examMarks || '0'}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.shuttleRun || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.run50m || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.run600m || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.sitAndReach || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.boardJump || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.sitUps || '-'}</TableCell>
                          <TableCell className="border-r p-1 text-center text-[10px]">{fit.strengthScore || '-'}</TableCell>
                        </>
                      )}
                      <TableCell className="border-r p-1 text-center text-[11px] font-black text-primary bg-primary/5">
                        {fit.score}{isGeneral ? '' : '%'}
                      </TableCell>
                      <TableCell className="p-1 text-right text-[9px] font-black uppercase text-muted-foreground/60 pr-4">
                        {fit.status}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
            <div className="bg-amber-50 p-2 border-b font-black text-[11px] uppercase text-amber-800 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Technical Skill Archive
            </div>
            <Table className="border-collapse min-w-max">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b">
                  <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black w-[150px]">Sport Name</TableHead>
                  <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black">Detailed Skill Evaluation</TableHead>
                  <TableHead className="border-r h-8 px-2 text-[9px] uppercase font-black text-center w-[100px]">Aggregate</TableHead>
                  <TableHead className="h-8 px-2 text-[9px] uppercase font-black text-right w-[150px]">Sync Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerSkills.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4 text-[11px] text-muted-foreground italic">No technical skill data logged.</TableCell></TableRow>
                ) : (
                  playerSkills.map((skill: any, idx: number) => (
                    <TableRow key={idx} className="border-b even:bg-muted/30 h-auto hover:bg-amber-50/30 transition-colors">
                      <TableCell className="border-r p-2 text-[10px] font-black uppercase text-amber-700">{skill.sportName}</TableCell>
                      <TableCell className="border-r p-2 text-[10px]">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(skill.detailedSkills || {}).map(([name, sc]) => (
                            <span key={name} className="bg-white border px-1.5 py-0.5 rounded-sm shadow-xs font-medium">
                              {name}: <span className="font-black text-primary">{sc}</span>
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="border-r p-2 text-center text-sm font-black text-primary">{skill.score}</TableCell>
                      <TableCell className="p-2 text-right text-[10px] font-medium text-muted-foreground">{format(new Date(skill.lastUpdated || 0), 'PP')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="bg-destructive/5 p-2 border-b font-black text-[11px] uppercase text-destructive flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Health & Medical Archives
            </div>
            <div className="p-4 space-y-3">
              {playerIncidents.map((inc: any) => (
                <div key={inc.id} className="border-l-4 border-destructive/30 pl-3 py-1">
                  <div className="text-[10px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yyyy')}</div>
                  <p className="text-xs font-medium leading-relaxed mt-1">{inc.description}</p>
                </div>
              ))}
              {playerIncidents.length === 0 && <p className="text-[11px] text-muted-foreground italic text-center py-4">No medical history logged for this student.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
