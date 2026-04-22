"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, FileSpreadsheet, Trophy, Users, Star, Target } from 'lucide-react';
import { format } from 'date-fns';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

export function TournamentRosters({ store }: { store: any }) {
  const [selectedSport, setSelectedSport] = useState(SPORTS_LIST[0]);

  // Logic to determine which sport a player is BEST fit for
  const getBestFitSport = (playerId: string) => {
    const allPlayerSkills = store.data.skillsHistory[playerId] || [];
    if (allPlayerSkills.length === 0) return "N/A";
    
    const sortedSkills = [...allPlayerSkills].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    return sortedSkills[0].sportName;
  };

  const getCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  };

  const categories = ['Girls U14', 'Girls U17', 'Girls Senior', 'Boys U14', 'Boys U17', 'Boys Senior'];
  
  // Grouping and Ranking Logic
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    
    // Only players who have this sport in their preferred list
    const playersInSport = store.data.players.filter((p: any) => p.sports.includes(selectedSport));

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
        const fitnessData = store.data.fitness[p.id] || { score: '0' };
        
        // Competency Score: 60% Skill + 40% Fitness
        const competencyScore = (parseFloat(skillData.score) * 0.6) + (parseFloat(fitnessData.score) * 0.4);
        
        groups[cat].push({ 
          ...p, 
          tournamentScore: skillData.score, 
          fitnessScore: fitnessData.score,
          competencyRating: competencyScore.toFixed(1),
          bestFit: getBestFitSport(p.id)
        });
      }
    });

    // Rank by Competency Rating
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => parseFloat(b.competencyRating) - parseFloat(a.competencyRating));
    });

    return groups;
  }, [selectedSport, store.data.players, store.data.sportSkills, store.data.fitness, store.data.skillsHistory]);

  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category];
    const printContent = `
      <html>
        <head>
          <title>Institutional Entry Sheet - ${selectedSport} - ${category}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 20px; }
            h1 { color: #235C36; margin: 0; text-transform: uppercase; }
            .meta { display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f4f4f4; text-transform: uppercase; }
            .squad-label { font-size: 9px; font-weight: bold; color: #666; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sign { border-top: 1px solid #333; width: 150px; text-align: center; padding-top: 5px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
            <div style="font-size: 14px; font-weight: bold;">Official Tournament Entry Sheet</div>
          </div>
          <div class="meta">
            <span>Discipline: ${selectedSport.toUpperCase()}</span>
            <span>Category: ${category}</span>
            <span>Date: ${format(new Date(), 'PP')}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>SR</th><th>PLAYER NAME</th><th>STD</th><th>AGE</th><th>FITNESS %</th><th>SKILL SC</th><th>COMPETENCY</th><th>SQUAD</th>
              </tr>
            </thead>
            <tbody>
              ${groupPlayers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.std}</td>
                  <td>${p.age}</td>
                  <td>${p.fitnessScore}%</td>
                  <td>${p.tournamentScore}</td>
                  <td>${p.competencyRating}</td>
                  <td>${i < 12 ? 'MAIN' : 'RESERVE'}</td>
                </tr>
              `).join('')}
              ${Array(Math.max(0, 15 - groupPlayers.length)).fill(0).map((_, i) => `
                <tr><td>${groupPlayers.length + i + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div class="sign">Physical Ed Director</div>
            <div class="sign">Principal Signature</div>
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
    <div className="space-y-4">
      <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl border-2 border-primary/10 shadow-sm">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Competency Ranking Hub</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Auto-Selection for Inter-School Tournaments</p>
          </div>
        </div>
        <div className="w-full md:w-72">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="h-12 text-md font-black bg-white rounded-xl border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat} className="border-2 border-border rounded-[2rem] overflow-hidden bg-white shadow-sm flex flex-col h-[450px]">
            <div className="bg-muted/50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-black uppercase text-primary tracking-wider">{cat} Ranking</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-black uppercase bg-white border-primary/20">
                {processedGroups[cat].length} Registered
              </Badge>
            </div>
            
            <div className="flex-1 overflow-auto">
              <Table className="border-collapse min-w-full">
                <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow className="border-b">
                    <TableHead className="border-r h-9 px-3 text-[10px] font-black uppercase w-[180px] sticky left-0 bg-muted/30">Athlete</TableHead>
                    <TableHead className="border-r h-9 px-2 text-[10px] font-black uppercase text-center w-[60px]">Fit %</TableHead>
                    <TableHead className="border-r h-9 px-2 text-[10px] font-black uppercase text-center w-[60px]">Skill</TableHead>
                    <TableHead className="border-r h-9 px-2 text-[10px] font-black uppercase text-center w-[80px]">Rank Sc</TableHead>
                    <TableHead className="h-9 px-2 text-[10px] font-black uppercase text-center w-[80px]">Fit For</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedGroups[cat].length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-[11px] font-bold text-muted-foreground uppercase opacity-40">
                        No competency data for this category
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedGroups[cat].map((p, i) => (
                      <TableRow key={p.id} className={`border-b h-11 transition-colors ${i < 12 ? 'bg-green-50/50 hover:bg-green-100/50' : 'hover:bg-muted/50'}`}>
                        <TableCell className={`border-r p-3 text-xs font-bold sticky left-0 ${i < 12 ? 'bg-green-50' : 'bg-white'}`}>
                          <div className="flex flex-col">
                            <span className="uppercase">{p.name}</span>
                            <span className="text-[9px] text-muted-foreground uppercase leading-none mt-1">
                              {i < 12 ? 'Main Squad' : 'Reserve List'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="border-r p-2 text-center text-xs font-medium">{p.fitnessScore}%</TableCell>
                        <TableCell className="border-r p-2 text-center text-xs font-medium">{p.tournamentScore}</TableCell>
                        <TableCell className="border-r p-2 text-center">
                          <Badge className="bg-primary text-white text-[10px] font-black px-2 py-0.5">{p.competencyRating}</Badge>
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-accent text-primary">
                            {p.bestFit}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {processedGroups[cat].length > 0 && (
              <div className="p-4 border-t bg-muted/30 flex gap-2">
                <Button onClick={() => handlePrint(cat)} variant="outline" size="sm" className="flex-1 h-10 text-[10px] font-black uppercase border-2 border-primary/10 shadow-sm bg-white hover:bg-primary/5">
                  <Printer className="w-4 h-4 mr-2" /> Export Entry Sheet
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/10 bg-white">
                  <Star className="w-4 h-4 text-accent" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
