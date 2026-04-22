"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, Printer, Calculator, Scale, Ruler, GraduationCap, Save } from 'lucide-react';
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
          strengthScore: '',
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
      // Logic for athletic fitness assessment
      const fields = ['shuttleRun', 'run50m', 'run600m', 'sitAndReach', 'boardJump', 'sitUps', 'strengthScore'];
      let filledCount = 0;
      let sum = 0;

      fields.forEach(f => {
        const val = parseFloat(current[f]);
        if (!isNaN(val)) {
          filledCount++;
          // Normalized mock calculation for institutional points
          // In real school system, this would use age/gender standardized percentiles
          sum += (val > 100 ? 100 : val); 
        }
      });

      const calculatedScore = filledCount > 0 ? Math.round(sum / filledCount).toString() : "0";
      scoreNum = parseInt(calculatedScore);
      
      if (scoreNum >= 85) status = 'Level A (Elite)';
      else if (scoreNum >= 70) status = 'Level B (Advanced)';
      else if (scoreNum >= 50) status = 'Level C (Developing)';
      else if (scoreNum > 0) status = 'Level D (Needs Support)';
      
      current.score = calculatedScore;
    } else {
      // Logic for general registry monthly logs
      status = 'Updated';
      current.score = current.examMarks || "0";
    }

    const finalAssessment = { ...current, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    toast({ 
      title: "Data Synced", 
      description: `Fitness record for ${id} has been archived in history.`,
    });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Monthly Growth Report' : 'Fitness Report'} - Waghamba</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 10px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'MONTHLY GROWTH LOG' : 'ATHLETE FITNESS ASSESSMENT'}</h1>
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                ${isGeneral ? 
                  '<th>HT (CM)</th><th>WT (KG)</th><th>EXAM</th>' : 
                  '<th>10x6</th><th>50M</th><th>600M</th><th>REACH</th><th>JUMP</th><th>SITUPS</th><th>STR</th>'
                }
                <th>SCORE</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    ${isGeneral ? 
                      `<td>${fit.height || '-'}</td><td>${fit.weight || '-'}</td><td>${fit.examMarks || '-'}</td>` : 
                      `<td>${fit.shuttleRun || '-'}</td><td>${fit.run50m || '-'}</td><td>${fit.run600m || '-'}</td><td>${fit.sitAndReach || '-'}</td><td>${fit.boardJump || '-'}</td><td>${fit.sitUps || '-'}</td><td>${fit.strengthScore || '-'}</td>`
                    }
                    <td>${fit.score || '-'}%</td>
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
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase w-[180px] sticky left-0 bg-muted/50 z-30">Student Details</TableHead>
              {isGeneral ? (
                <>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">HT (cm)</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">WT (kg)</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[80px]">Exam</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">10x6</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">50M</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">600M</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">Reach</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">Jump</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">Situps</TableHead>
                  <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[60px]">Str</TableHead>
                </>
              )}
              <TableHead className="border-r h-9 px-2 font-black text-[10px] uppercase text-center w-[120px]">Status / Level</TableHead>
              <TableHead className="h-9 px-2 font-black text-[10px] uppercase text-right w-[80px] sticky right-0 bg-muted/50 z-30">Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                  No records found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || { 
                  shuttleRun: '', run50m: '', run600m: '', 
                  sitAndReach: '', boardJump: '', sitUps: '', strengthScore: '',
                  score: '', status: '',
                  height: '', weight: '', examMarks: ''
                };
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-xs font-bold sticky left-0 bg-white z-10">
                      <div className="truncate w-[160px]">{player.name}</div>
                    </TableCell>
                    
                    {isGeneral ? (
                      <>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-xs border-0 bg-transparent focus:bg-white rounded-none" value={current.height} onChange={(e) => handleChange(player.id, 'height', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-xs border-0 bg-transparent focus:bg-white rounded-none" value={current.weight} onChange={(e) => handleChange(player.id, 'weight', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-xs font-black text-primary border-0 bg-transparent focus:bg-white rounded-none" value={current.examMarks} onChange={(e) => handleChange(player.id, 'examMarks', e.target.value)} />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="sec" value={current.shuttleRun} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="sec" value={current.run50m} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="min" value={current.run600m} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="cm" value={current.sitAndReach} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="cm" value={current.boardJump} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="count" value={current.sitUps} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-10 text-center text-[10px] border-0 bg-transparent focus:bg-white rounded-none" placeholder="0-100" value={current.strengthScore} onChange={(e) => handleChange(player.id, 'strengthScore', e.target.value)} />
                        </TableCell>
                      </>
                    )}

                    <TableCell className="border-r p-1 text-center bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary">{current.score || '0'}%</span>
                        <span className="text-[8px] font-bold uppercase text-muted-foreground truncate w-full">{current.status || 'Pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 text-right sticky right-0 bg-white z-10">
                      <Button variant="ghost" size="icon" className="h-10 w-full rounded-none hover:bg-primary/20" onClick={() => handleSave(player.id)}>
                        <Save className="w-4 h-4 text-primary" />
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
