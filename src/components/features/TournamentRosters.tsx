"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Medal } from 'lucide-react';
import { getAgeValidation } from '@/lib/utils';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Athletics'];

export function TournamentRosters({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const [selectedSport, setSelectedSport] = useState(preselectedSport || SPORTS_LIST[0]);

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const getCategory = useCallback((p: any) => {
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'Age Pending';
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  }, []);

  const categories = useMemo(() => ['Boys U14', 'Boys U17', 'Boys Senior', 'Girls U14', 'Girls U17', 'Girls Senior', 'Age Pending'], []);
  
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    const playersInSport = store.data.players.filter((p: any) => p.sports && p.sports.includes(selectedSport));

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
        const fitnessData = store.data.fitness[p.id] || { score: '0' };
        const rating = (parseFloat(skillData.score) * 0.7) + (parseFloat(fitnessData.score) * 0.3);
        groups[cat].push({ ...p, competencyRating: rating.toFixed(1) });
      }
    });

    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => parseFloat(b.competencyRating) - parseFloat(a.competencyRating));
    });

    return groups;
  }, [selectedSport, store.data.players, store.data.sportSkills, store.data.fitness, categories, getCategory]);

  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category];
    const topTwelve = groupPlayers.slice(0, 12);

    const printContent = `
      <html>
        <head>
          <title>Tournament Entry - ${selectedSport} - ${category}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; line-height: 1.3; font-size: 12px; }
            .header { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 10px; margin-bottom: 25px; }
            .school-name { font-size: 22px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-top: 10px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: 900; text-transform: uppercase; font-size: 10px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</div>
            <div class="report-type">TOURNAMENT ENTRY FORM: ${selectedSport.toUpperCase()}</div>
            <div style="font-size: 14px; font-weight: 700; text-align:center; margin-top: 5px;">Category: ${category.toUpperCase()}</div>
          </div>

          <table>
            <thead>
              <tr><th>SR</th><th>GR NO.</th><th>PLAYER NAME</th><th>STD</th><th>AGE</th><th>AADHAR</th></tr>
            </thead>
            <tbody>
              ${topTwelve.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.generalRegisterNumber || '-'}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td>${p.std}</td>
                  <td>${getAgeValidation(p.dob)?.ageYears || p.age || '-'}</td>
                  <td>${p.aadharNumber || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-6">
      {!preselectedSport && (
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
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Discipline</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(cat => (
          <Card key={cat} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col h-[500px]">
            <div className="bg-muted/40 p-6 border-b flex justify-between items-center">
              <span className="text-xl font-black uppercase text-primary">{cat}</span>
              <Badge className="bg-primary text-white font-black">{processedGroups[cat].length} ATHLETES</Badge>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">Athlete</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">Age</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedGroups[cat].slice(0, 15).map((p, i) => {
                    const ageVal = getAgeValidation(p.dob);
                    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
                    return (
                      <TableRow key={p.id} className={i < 12 ? 'bg-emerald-50/30' : ''}>
                        <TableCell className="text-xs font-bold truncate max-w-[150px]">{p.name.toUpperCase()}</TableCell>
                        <TableCell className="text-xs font-bold text-center">{age <= 0 ? "Pending" : age}</TableCell>
                        <TableCell className="text-center font-black text-primary">{p.competencyRating}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="p-6 border-t bg-muted/20">
              <Button onClick={() => handlePrint(cat)} disabled={processedGroups[cat].length === 0} className="w-full h-14 bg-white text-primary font-black uppercase text-xs tracking-widest border-2 shadow-sm rounded-2xl">
                <Printer className="w-5 h-5 mr-2" /> Print Official Squad List
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
