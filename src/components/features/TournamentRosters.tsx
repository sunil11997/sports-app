"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Users, Target, Star, Medal } from 'lucide-react';
import { format } from 'date-fns';

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

  const categories = [
    'Boys U14', 'Boys U17', 'Boys Senior',
    'Girls U14', 'Girls U17', 'Girls Senior'
  ];
  
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    
    // Only players who play this sport
    const playersInSport = store.data.players.filter((p: any) => p.sports && p.sports.includes(selectedSport));

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
        const fitnessData = store.data.fitness[p.id] || { score: '0' };
        
        // Performance calculation for ranking
        const competencyScore = (parseFloat(skillData.score) * 0.7) + (parseFloat(fitnessData.score) * 0.3);
        
        groups[cat].push({ 
          ...p, 
          tournamentScore: skillData.score, 
          fitnessScore: fitnessData.score,
          competencyRating: competencyScore.toFixed(1)
        });
      }
    });

    // Rank by performance score
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => parseFloat(b.competencyRating) - parseFloat(a.competencyRating));
    });

    return groups;
  }, [selectedSport, store.data.players, store.data.sportSkills, store.data.fitness]);

  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category];
    const topTwelve = groupPlayers.slice(0, 12);

    const printContent = `
      <html>
        <head>
          <title>Tournament Entry - ${selectedSport} - ${category}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #111; line-height: 1.3; }
            .header { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 15px; margin-bottom: 25px; }
            .school-name { font-size: 24px; font-weight: 900; color: #235C36; margin-bottom: 5px; text-transform: uppercase; }
            .address { font-size: 14px; font-weight: 700; color: #444; margin-bottom: 10px; }
            .report-title { font-size: 16px; font-weight: 800; text-decoration: underline; margin-top: 10px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-weight: bold; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; text-transform: uppercase; font-weight: 800; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: 800; font-size: 12px; }
            .sr-col { width: 30px; text-align: center; }
            .std-col { width: 40px; text-align: center; }
            .age-col { width: 40px; text-align: center; }
            .gr-col { width: 70px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div class="address">तालूका - सटाणा, जिल्हा - नाशिक (Tal. Satana, Dist. Nashik)</div>
            <div class="report-title">TOURNAMENT ENTRY FORM (OFFICIAL SQUAD)</div>
          </div>

          <div class="meta-grid">
            <div>Game/Discipline: ${selectedSport.toUpperCase()}</div>
            <div>Category: ${category.toUpperCase()}</div>
            <div>Institutional Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
            <div>Generation Date: ${format(new Date(), 'dd/MM/yyyy')}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="sr-col">SR</th>
                <th class="gr-col">GR NO.</th>
                <th>PLAYER NAME</th>
                <th class="std-col">STD</th>
                <th>DATE OF BIRTH</th>
                <th class="age-col">AGE</th>
                <th>AADHAR NUMBER</th>
              </tr>
            </thead>
            <tbody>
              ${topTwelve.map((p, i) => `
                <tr>
                  <td class="sr-col">${i + 1}</td>
                  <td class="gr-col">${p.generalRegisterNumber || '-'}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td class="std-col">${p.std}</td>
                  <td>${p.dob ? format(new Date(p.dob), 'dd/MM/yyyy') : '-'}</td>
                  <td class="age-col">${p.age}</td>
                  <td>${p.aadharNumber || '-'}</td>
                </tr>
              `).join('')}
              ${Array(Math.max(0, 12 - topTwelve.length)).fill(0).map((_, i) => `
                <tr><td class="sr-col">${topTwelve.length + i + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px; font-size: 10px; font-style: italic;">
            * Institutional validation: This list is generated from the central registry based on competitive performance scores.
          </div>

          <div class="footer">
            <div class="sign-box" style="text-align: center;">
              <div style="height: 60px;"></div>
              <div style="border-top: 1px solid #000; width: 180px; padding-top: 5px;">Physical Education Teacher</div>
            </div>
            <div class="sign-box" style="text-align: center;">
              <div style="height: 60px;"></div>
              <div style="border-top: 1px solid #000; width: 180px; padding-top: 5px;">Principal Signature</div>
            </div>
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
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Medal className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Tournament Selection</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Institutional Squad Generation</p>
          </div>
        </div>
        
        <div className="w-full md:w-80 space-y-2">
          <label className="text-[10px] font-black text-primary uppercase ml-2">Select Tournament Discipline</label>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(cat => {
          const groupPlayers = processedGroups[cat];
          const hasPlayers = groupPlayers.length > 0;
          
          return (
            <Card key={cat} className="border-2 border-border rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col h-[550px] group transition-all hover:border-primary/30">
              <div className="bg-muted/40 p-6 border-b flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xl font-black uppercase text-primary tracking-tight">{cat}</span>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mt-1">Official Selection List</p>
                  </div>
                </div>
                <Badge className="bg-primary text-white font-black px-4 py-1 rounded-full text-xs">
                  {groupPlayers.length} ATHLETES
                </Badge>
              </div>
              
              <div className="flex-1 overflow-auto">
                <Table className="border-collapse min-w-full">
                  <TableHeader className="bg-muted/30 sticky top-0 z-20">
                    <TableRow className="border-b">
                      <TableHead className="border-r h-10 px-4 font-black text-[10px] uppercase w-[220px] sticky left-0 bg-muted/90 backdrop-blur-md">Athlete Details</TableHead>
                      <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Score</TableHead>
                      <TableHead className="h-10 px-2 font-black text-[10px] uppercase text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!hasPlayers ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-32">
                          <div className="opacity-20 flex flex-col items-center">
                            <Target className="w-12 h-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No candidates found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupPlayers.map((p, i) => {
                        const isMainSquad = i < 12;
                        return (
                          <TableRow key={p.id} className={`border-b h-14 transition-colors ${isMainSquad ? 'bg-emerald-50/30 hover:bg-emerald-100/40' : 'hover:bg-muted/50'}`}>
                            <TableCell className={`border-r p-4 text-xs font-bold sticky left-0 ${isMainSquad ? 'bg-emerald-50/50' : 'bg-white'}`}>
                              <div className="flex flex-col">
                                <span className="uppercase text-sm">{p.name}</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mt-1">
                                  Std {p.std} • GR: {p.generalRegisterNumber || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="border-r p-2 text-center">
                              <Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px]">{p.competencyRating}</Badge>
                            </TableCell>
                            <TableCell className="p-2 text-center">
                              <Badge className={isMainSquad ? "bg-accent text-accent-foreground font-black text-[9px] uppercase px-3" : "bg-muted text-muted-foreground font-black text-[9px] uppercase px-3"}>
                                {isMainSquad ? 'Main Squad' : 'Reserve'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {hasPlayers && (
                <div className="p-6 border-t bg-muted/20 flex gap-3">
                  <Button 
                    onClick={() => handlePrint(cat)} 
                    className="flex-1 h-14 bg-white hover:bg-primary/5 text-primary font-black uppercase text-xs tracking-widest border-2 border-primary/10 shadow-sm rounded-2xl transition-all"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print Entry Sheet
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 border-2 border-primary/10 bg-white rounded-2xl">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
