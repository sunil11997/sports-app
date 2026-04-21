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
      // Logic: Calculate a total score based on provided institutional fitness fields
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
      
      if (scoreNum >= 75) status = 'Level A (Excellent)';
      else if (scoreNum >= 60) status = 'Level B (Fit)';
      else if (scoreNum >= 45) status = 'Level C (Average)';
      else if (scoreNum > 0) status = 'Level D (Needs Training)';
      
      current.score = calculatedScore;
    } else {
      status = 'Monthly Log Updated';
      current.score = current.examMarks || "0";
    }

    const finalAssessment = { ...current, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    toast({ 
      title: isGeneral ? "Monthly Log Saved" : "Assessment Updated", 
      description: isGeneral ? "Monthly height, weight and marks updated." : `Fitness level: ${status}` 
    });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Monthly Growth Report' : 'Institutional Fitness Report'} - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 12px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'MONTHLY GROWTH & EXAM TRACKER' : 'ATHLETE FITNESS ASSESSMENT'}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th>
                ${isGeneral ? '<th>HEIGHT (CM)</th><th>WEIGHT (KG)</th><th>EXAM MARKS</th>' : '<th>10x6 SHUTTLE</th><th>50M RUN</th><th>600M RUN</th><th>SIT/REACH</th>'}
                <th>SCORE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong><br/>Std ${p.std}</td>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {isGeneral ? <Scale className="w-8 h-8 text-primary" /> : <Activity className="w-8 h-8 text-accent" />}
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
            {isGeneral ? 'Monthly Growth Registry' : 'Athlete Fitness Hub'}
          </h2>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl font-bold h-12">
          <Printer className="w-4 h-4 mr-2" /> Print {isGeneral ? 'Growth Report' : 'Fitness Roster'}
        </Button>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                <TableHead className="text-primary-foreground font-bold uppercase min-w-[150px]">Student</TableHead>
                {isGeneral ? (
                  <>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">Height (cm)</TableHead>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">Weight (kg)</TableHead>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">Exam Marks</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">10x6 Shuttle</TableHead>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">50M Run</TableHead>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">600M Run</TableHead>
                    <TableHead className="text-primary-foreground font-bold uppercase text-center">Sit/Reach</TableHead>
                  </>
                )}
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Status</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No students found in this section.
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
                    <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold">
                        <div className="flex flex-col">
                          <span>{player.name}</span>
                          <span className="text-[10px] text-muted-foreground">STD {player.std}</span>
                        </div>
                      </TableCell>
                      
                      {isGeneral ? (
                        <>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="cm" 
                              className="w-20 h-9 text-center mx-auto"
                              value={current.height}
                              onChange={(e) => handleChange(player.id, 'height', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="kg" 
                              className="w-20 h-9 text-center mx-auto"
                              value={current.weight}
                              onChange={(e) => handleChange(player.id, 'weight', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="0-100" 
                              className="w-20 h-9 text-center mx-auto font-black text-primary"
                              value={current.examMarks}
                              onChange={(e) => handleChange(player.id, 'examMarks', e.target.value)}
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="Sec" 
                              className="w-16 h-8 text-xs mx-auto text-center"
                              value={current.shuttleRun}
                              onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="Sec" 
                              className="w-16 h-8 text-xs mx-auto text-center"
                              value={current.run50m}
                              onChange={(e) => handleChange(player.id, 'run50m', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="Min" 
                              className="w-16 h-8 text-xs mx-auto text-center"
                              value={current.run600m}
                              onChange={(e) => handleChange(player.id, 'run600m', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              placeholder="CM" 
                              className="w-16 h-8 text-xs mx-auto text-center"
                              value={current.sitAndReach}
                              onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)}
                            />
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                          {current.status || 'Pending Log'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold"
                          onClick={() => handleSave(player.id)}
                        >
                          <Calculator className="w-3 h-3 mr-1" /> Update Log
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
