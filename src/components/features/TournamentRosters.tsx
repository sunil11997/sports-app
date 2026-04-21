"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      // Get score for this specific sport
      const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
      groups[cat].push({ ...p, tournamentScore: skillData.score });
    }
  });

  // Sort groups by score descending
  Object.keys(groups).forEach(cat => {
    groups[cat].sort((a, b) => parseFloat(b.tournamentScore) - parseFloat(a.tournamentScore));
  });

  const handlePrint = (category: string) => {
    const groupPlayers = groups[category];
    const printContent = `
      <html>
        <head>
          <title>Tournament Entry Sheet - ${selectedSport} - ${category}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 20px; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: 900; color: #235C36; margin: 0; }
            .sheet-title { font-size: 18px; font-weight: 700; text-transform: uppercase; margin-top: 10px; background: #f4fcf6; display: inline-block; padding: 5px 20px; border-radius: 5px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 12px; text-align: left; }
            th { background-color: #eee; text-transform: uppercase; font-size: 12px; }
            .score-cell { font-weight: bold; text-align: center; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .sign-box { border-top: 2px solid #333; width: 200px; text-align: center; padding-top: 10px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
            <div class="sheet-title">OFFICIAL TOURNAMENT ENTRY SHEET</div>
          </div>
          
          <div class="meta-info">
            <div>SPORT: ${selectedSport.toUpperCase()}</div>
            <div>CATEGORY: ${category.toUpperCase()}</div>
            <div>TEACHER: सुनिल देशमुख</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">SR.</th>
                <th>PLAYER NAME</th>
                <th style="width: 60px;">STD</th>
                <th style="width: 60px;">AGE</th>
                <th style="width: 100px;">BLOOD GP</th>
                <th style="width: 100px;">SKILL SCORE</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              ${groupPlayers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.std}</td>
                  <td>${p.age}</td>
                  <td>${p.bloodGroup || '-'}</td>
                  <td class="score-cell">${p.tournamentScore}</td>
                  <td></td>
                </tr>
              `).join('')}
              ${Array(Math.max(0, 12 - groupPlayers.length)).fill(0).map((_, i) => `
                <tr>
                  <td>${groupPlayers.length + i + 1}</td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div class="sign-box">Coach Signature</div>
            <div class="sign-box">Principal Signature</div>
            <div class="sign-box">Authority Seal</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <FileSpreadsheet className="w-10 h-10 text-accent" /> Tournament Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Generate sport-specific tournament rosters ranked by technical skill scores.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <label className="text-sm font-bold text-primary uppercase">Select Discipline</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="rounded-2xl border-2 h-14 text-lg font-bold bg-white">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(sport => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(cat => (
          <Card key={cat} className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden hover:border-accent transition-all bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row justify-between items-center p-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">
                  {cat}
                </CardTitle>
              </div>
              <Badge className="bg-accent text-accent-foreground font-black px-4 py-1">
                {groups[cat].length} PLAYERS
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 sticky top-0 z-10">
                    <tr className="text-left font-bold text-primary border-b">
                      <th className="p-4">Player</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[cat].length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-muted-foreground font-medium italic">
                          No {selectedSport} players in this category.
                        </td>
                      </tr>
                    ) : (
                      groups[cat].map((p, i) => (
                        <tr key={p.id} className={`border-b border-primary/5 hover:bg-primary/5 transition-colors ${i < 12 ? 'bg-green-50/30' : ''}`}>
                          <td className="p-4">
                            <div className="font-black text-foreground/90 uppercase">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">STD {p.std} | AGE {p.age}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-primary/10 text-primary font-black px-3 py-1 rounded-lg border border-primary/10">
                              {p.tournamentScore}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                             {i < 12 ? (
                               <Badge className="bg-green-600 text-white text-[9px] font-black uppercase">Main Squad</Badge>
                             ) : (
                               <Badge variant="outline" className="text-[9px] font-black uppercase">Reserve</Badge>
                             )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {groups[cat].length > 0 && (
                <div className="p-6 bg-primary/5 border-t border-primary/10">
                  <Button 
                    onClick={() => handlePrint(cat)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-md"
                  >
                    <Printer className="w-4 h-4 mr-2" /> Print Official {cat} Sheet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-accent p-8 rounded-[3rem] text-accent-foreground shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white/20 p-4 rounded-3xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-2xl font-black uppercase tracking-tight">Tournament Selection Logic</h3>
            <p className="font-medium opacity-90">
              Players are ranked based on their **Institutional Technical Score** from the Sports Skills tab. 
              Top 12 players in each category are highlighted as the proposed main squad for tournament entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
