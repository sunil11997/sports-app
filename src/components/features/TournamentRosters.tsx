"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, FileSpreadsheet, Trophy, Users } from 'lucide-react';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

export function TournamentRosters({ store }: { store: any }) {
  const [selectedSport, setSelectedSport] = useState(SPORTS_LIST[0]);

  const getCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  };

  const categories = ['Girls U14', 'Girls U17', 'Boys U14', 'Boys U17', 'Girls Senior', 'Boys Senior'];
  const playersBySport = store.data.players.filter((p: any) => p.sports.includes(selectedSport));
  const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
  
  playersBySport.forEach((p: any) => {
    const cat = getCategory(p);
    if (groups[cat]) {
      const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
      groups[cat].push({ ...p, tournamentScore: skillData.score });
    }
  });

  Object.keys(groups).forEach(cat => {
    groups[cat].sort((a, b) => parseFloat(b.tournamentScore) - parseFloat(a.tournamentScore));
  });

  const handlePrint = (category: string) => {
    const groupPlayers = groups[category];
    const printContent = `
      <html>
        <head>
          <title>Entry Sheet - ${selectedSport} - ${category}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; }
            h1 { color: #235C36; border-bottom: 2px solid #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: left; }
            th { background-color: #eee; text-transform: uppercase; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>${category.toUpperCase()} - ${selectedSport.toUpperCase()} ENTRY SHEET</h1>
          <table>
            <thead><tr><th>SR</th><th>NAME</th><th>STD</th><th>AGE</th><th>BLOOD</th><th>SCORE</th></tr></thead>
            <tbody>
              ${groupPlayers.map((p, i) => `<tr><td>${i + 1}</td><td><strong>${p.name}</strong></td><td>${p.std}</td><td>${p.age}</td><td>${p.bloodGroup || '-'}</td><td>${p.tournamentScore}</td></tr>`).join('')}
              ${Array(Math.max(0, 12 - groupPlayers.length)).fill(0).map((_, i) => `<tr><td>${groupPlayers.length + i + 1}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
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
          <FileSpreadsheet className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Excel: Tournament Ranking Roster</h2>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="h-9 text-sm font-bold bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat} className="border border-border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="bg-muted/50 p-2 border-b flex justify-between items-center">
              <span className="text-[11px] font-black uppercase text-primary">{cat}</span>
              <Badge variant="outline" className="text-[9px] font-black uppercase bg-white">{groups[cat].length} Players</Badge>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow className="border-b">
                    <TableHead className="border-r h-7 px-2 text-[9px] font-black uppercase w-[150px]">Player</TableHead>
                    <TableHead className="border-r h-7 px-2 text-[9px] font-black uppercase text-center">Score</TableHead>
                    <TableHead className="h-7 px-2 text-[9px] font-black uppercase text-right">Squad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups[cat].length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-[10px] italic">No records.</TableCell></TableRow>
                  ) : (
                    groups[cat].map((p, i) => (
                      <TableRow key={p.id} className={`border-b even:bg-muted/20 h-8 ${i < 12 ? 'bg-green-50/50' : ''}`}>
                        <TableCell className="border-r p-2 text-[10px] font-bold uppercase">{p.name}</TableCell>
                        <TableCell className="border-r p-1 text-center font-black text-primary text-[10px]">{p.tournamentScore}</TableCell>
                        <TableCell className="p-1 text-right">
                          {i < 12 ? <span className="text-[8px] font-black text-green-600 border border-green-200 px-1 rounded uppercase">Main</span> : <span className="text-[8px] font-bold text-muted-foreground uppercase">Res</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {groups[cat].length > 0 && (
              <div className="p-2 border-t bg-muted/20">
                <Button onClick={() => handlePrint(cat)} size="sm" className="w-full h-8 text-[10px] font-bold uppercase">
                  <Printer className="w-3 h-3 mr-1" /> Export entry sheet
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}