"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, Printer, Calculator, Scale, Ruler, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Fitness({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [assessments, setAssessments] = React.useState<Record<string, any>>(store.data.fitness);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';
  const filteredPlayers = store.data.players.filter((p: any) => p.category === targetCategory);

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          shuttleRun: '', 
          run50m: '', 
          run600m: '', 
          sitAndReach: '', 
          boardJump: '', 
          sitUps: '', 
          score: '', 
          status: '',
          height: '',
          weight: '',
          examMarks: ''
        }),
        [field]: value
      }
    }));
  };

  const handleSave = (id: string) => {
    const current = assessments[id];
    if (!current) return;

    let scoreNum = 0;
    let status = 'Logged';

    if (!isGeneral) {
      const fields = ['shuttleRun', 'run50m', 'run600m', 'sitAndReach', 'boardJump', 'sitUps'];
      let filledCount = 0;
      let sum = 0;

      fields.forEach(f => {
        const val = parseFloat(current[f]);
        if (!isNaN(val)) {
          filledCount++;
          sum += val;
        }
      });

      const calculatedScore = filledCount > 0 ? (sum / filledCount).toFixed(1) : "0";
      scoreNum = parseFloat(calculatedScore);
      
      if (scoreNum >= 75) status = 'Level A';
      else if (scoreNum >= 60) status = 'Level B';
      else if (scoreNum >= 45) status = 'Level C';
      else if (scoreNum > 0) status = 'Level D';
      
      current.score = calculatedScore;
    } else {
      status = 'Updated';
      current.score = current.examMarks || "0";
    }

    const finalAssessment = { ...current, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    toast({ 
      title: "Log Saved", 
      description: "Data successfully synced to spreadsheet." 
    });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Monthly Growth Report' : 'Fitness Report'} - Waghamba</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 12px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'MONTHLY GROWTH LOG' : 'ATHLETE FITNESS ASSESSMENT'}</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                ${isGeneral ? '<th>HT (CM)</th><th>WT (KG)</th><th>EXAM</th>' : '<th>SHUTTLE</th><th>50M</th><th>600M</th><th>REACH</th>'}
                <th>SCORE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong> (Std ${p.std})</td>
                    ${isGeneral ? 
                      `<td>${fit.height || '-'}</td><td>${fit.weight || '-'}</td><td>${fit.examMarks || '-'}</td>` : 
                      `<td>${fit.shuttleRun || '-'}</td><td>${fit.run50m || '-'}</td><td>${fit.run600m || '-'}</td><td>${fit.sitAndReach || '-'}</td>`
                    }
                    <td>${fit.score || '-'}</td>
                    <td>${fit.status || 'Pending'}</td>
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {isGeneral ? <Scale className="w-6 h-6 text-primary" /> : <Activity className="w-6 h-6 text-accent" />}
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">
            {isGeneral ? 'Excel: Monthly Growth Registry' : 'Excel: Athlete Fitness Registry'}
          </h2>
        </div>
        <Button onClick={handlePrint} size="sm" className="font-bold h-9">
          <Printer className="w-4 h-4 mr-2" /> Print Sheet
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase w-[200px]">Student Details</TableHead>
              {isGeneral ? (
                <>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">HT (cm)</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">WT (kg)</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">Exam</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[70px]">10x6</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[70px]">50M</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[70px]">600M</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[70px]">Reach</TableHead>
                </>
              )}
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[100px]">Status</TableHead>
              <TableHead className="h-9 px-2 font-black text-[10px] uppercase text-right w-[100px]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || { 
                  shuttleRun: '', run50m: '', run600m: '', 
                  sitAndReach: '', score: '', status: '',
                  height: '', weight: '', examMarks: ''
                };
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-xs font-bold">
                      {player.name} <span className="text-[9px] text-muted-foreground uppercase">(Std {player.std})</span>
                    </TableCell>
                    
                    {isGeneral ? (
                      <>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-xs border-0 bg-transparent focus:bg-white" value={current.height} onChange={(e) => handleChange(player.id, 'height', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-xs border-0 bg-transparent focus:bg-white" value={current.weight} onChange={(e) => handleChange(player.id, 'weight', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-xs font-black text-primary border-0 bg-transparent focus:bg-white" value={current.examMarks} onChange={(e) => handleChange(player.id, 'examMarks', e.target.value)} />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-[10px] border-0 bg-transparent focus:bg-white" value={current.shuttleRun} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-[10px] border-0 bg-transparent focus:bg-white" value={current.run50m} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-[10px] border-0 bg-transparent focus:bg-white" value={current.run600m} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-1">
                          <Input className="h-7 text-center text-[10px] border-0 bg-transparent focus:bg-white" value={current.sitAndReach} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} />
                        </TableCell>
                      </>
                    )}

                    <TableCell className="border-r p-2 text-center">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{current.status || '-'}</span>
                    </TableCell>
                    <TableCell className="p-1 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase" onClick={() => handleSave(player.id)}>
                        Sync
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}