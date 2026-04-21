"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  History as HistoryIcon, 
  Printer, 
  HeartPulse, 
  Trophy, 
  Activity, 
  User,
  Medal,
  Stethoscope,
  Scale,
  Ruler,
  GraduationCap
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
      .sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()),
    [selectedPlayerId, store.data.skillsHistory]
  );

  const handlePrint = () => {
    if (!player) return;
    const printContent = `
      <html>
        <head>
          <title>Progress Dossier - ${player.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; }
            th { background: #f4f4f4; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>INSTITUTIONAL PROGRESS: ${player.name}</h1>
          <p>Std: ${player.std} | Age: ${player.age}</p>
          ${isGeneral ? `
            <h2>Monthly Evolution</h2>
            <table>
              <thead><tr><th>Date</th><th>Ht (cm)</th><th>Wt (kg)</th><th>Exam</th><th>Status</th></tr></thead>
              <tbody>${playerFitness.map(f => `<tr><td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td><td>${f.height || '-'}</td><td>${f.weight || '-'}</td><td>${f.examMarks || '-'}</td><td>${f.status}</td></tr>`).join('')}</tbody>
            </table>
          ` : `
            <h2>Athletic Performance</h2>
            <table>
              <thead><tr><th>Date</th><th>Fitness Score</th><th>Status</th></tr></thead>
              <tbody>${playerFitness.map(f => `<tr><td>${format(new Date(f.updatedAt || f.date || new Date()), 'PP')}</td><td>${f.score}</td><td>${f.status}</td></tr>`).join('')}</tbody>
            </table>
          `}
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
          <User className="w-12 h-12 mx-auto mb-2" />
          <p className="font-bold uppercase text-[11px] tracking-widest">Select a student from archives</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="bg-muted/50 p-2 border-b font-black text-[11px] uppercase text-primary">Monthly Spread History</div>
            <Table className="border-collapse">
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow className="border-b">
                  <TableHead className="border-r h-8 px-2 text-[10px] uppercase font-black">Date</TableHead>
                  {isGeneral ? (
                    <>
                      <TableHead className="border-r h-8 px-2 text-[10px] uppercase font-black text-center">Ht</TableHead>
                      <TableHead className="border-r h-8 px-2 text-[10px] uppercase font-black text-center">Wt</TableHead>
                      <TableHead className="h-8 px-2 text-[10px] uppercase font-black text-center">Exam</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="border-r h-8 px-2 text-[10px] uppercase font-black text-center">Score</TableHead>
                      <TableHead className="h-8 px-2 text-[10px] uppercase font-black text-center">Status</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerFitness.map((fit: any, idx: number) => (
                  <TableRow key={idx} className="border-b even:bg-muted/30 h-9">
                    <TableCell className="border-r p-2 text-[10px] font-bold">
                      {format(new Date(fit.updatedAt || fit.date || new Date()), 'MMM yyyy')}
                    </TableCell>
                    {isGeneral ? (
                      <>
                        <TableCell className="border-r p-1 text-center text-[11px]">{fit.height || '-'}</TableCell>
                        <TableCell className="border-r p-1 text-center text-[11px]">{fit.weight || '-'}</TableCell>
                        <TableCell className="p-1 text-center text-[11px] font-black text-primary">{fit.examMarks || '0'}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="border-r p-1 text-center text-[11px] font-black text-primary">{fit.score}</TableCell>
                        <TableCell className="p-1 text-center text-[10px] font-bold uppercase text-muted-foreground">{fit.status}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="bg-muted/50 p-2 border-b font-black text-[11px] uppercase text-destructive">Health & Incident Log</div>
            <div className="p-4 space-y-3">
              {playerIncidents.map((inc: any) => (
                <div key={inc.id} className="border-l-4 border-destructive/30 pl-3 py-1">
                  <div className="text-[10px] font-black text-muted-foreground uppercase">{format(new Date(inc.date), 'dd MMM yyyy')}</div>
                  <p className="text-xs font-medium leading-relaxed mt-1">{inc.description}</p>
                </div>
              ))}
              {playerIncidents.length === 0 && <p className="text-[11px] text-muted-foreground italic text-center py-4">No medical history logged.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}