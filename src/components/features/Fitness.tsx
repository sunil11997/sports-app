"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, Printer, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Fitness({ store }: { store: any }) {
  const { toast } = useToast();
  const [assessments, setAssessments] = React.useState<Record<string, any>>(store.data.fitness);

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
          status: '' 
        }),
        [field]: value
      }
    }));
  };

  const handleSave = (id: string) => {
    const current = assessments[id];
    if (!current) return;

    // Logic: Calculate a total score based on provided values
    // This is a simplified institutional scoring model
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
    const scoreNum = parseFloat(calculatedScore);
    
    let status = 'Pending';
    if (scoreNum >= 75) status = 'Level A (Excellent)';
    else if (scoreNum >= 60) status = 'Level B (Fit)';
    else if (scoreNum >= 45) status = 'Level C (Average)';
    else if (scoreNum > 0) status = 'Level D (Needs Training)';

    const finalAssessment = { ...current, score: calculatedScore, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    toast({ 
      title: "Assessment Updated", 
      description: `Fitness score for the player is ${calculatedScore} (${status})` 
    });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Fitness Report - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 12px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
            .fit { color: green; font-weight: bold; }
            .training { color: red; font-weight: bold; }
            .score-cell { font-weight: bold; color: #235C36; }
          </style>
        </head>
        <body>
          <h1>Complete Fitness Assessment Roster</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>10x6 SHUTTLE</th>
                <th>50M RUN</th>
                <th>600M RUN</th>
                <th>SIT & REACH</th>
                <th>BOARD JUMP</th>
                <th>SIT UPS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${store.data.players.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong><br/>Std ${p.std}</td>
                    <td>${fit.shuttleRun || '-'}</td>
                    <td>${fit.run50m || '-'}</td>
                    <td>${fit.run600m || '-'}</td>
                    <td>${fit.sitAndReach || '-'}</td>
                    <td>${fit.boardJump || '-'}</td>
                    <td>${fit.sitUps || '-'}</td>
                    <td class="score-cell">${fit.score || '-'}</td>
                    <td class="${fit.status?.includes('A') || fit.status?.includes('B') ? 'fit' : 'training'}">${fit.status || 'Pending'}</td>
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
          <Activity className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Institutional Fitness Hub</h2>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl font-bold h-12">
          <Printer className="w-4 h-4 mr-2" /> Print Roster
        </Button>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                <TableHead className="text-primary-foreground font-bold uppercase min-w-[150px]">Player</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">10x6 Shuttle</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">50M Run</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">600M Run</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Sit/Reach</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Board Jump</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Sit Ups</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Total</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-center">Status</TableHead>
                <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {store.data.players.map((player: any) => {
                const current = assessments[player.id] || { 
                  shuttleRun: '', run50m: '', run600m: '', 
                  sitAndReach: '', boardJump: '', sitUps: '', 
                  score: '', status: '' 
                };
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-[10px] text-muted-foreground">STD {player.std} | {player.gender}</span>
                      </div>
                    </TableCell>
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
                    <TableCell className="p-2">
                      <Input 
                        placeholder="CM" 
                        className="w-16 h-8 text-xs mx-auto text-center"
                        value={current.boardJump}
                        onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input 
                        placeholder="Qty" 
                        className="w-16 h-8 text-xs mx-auto text-center"
                        value={current.sitUps}
                        onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-center font-black text-primary">
                      {current.score || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {current.status?.includes('A') || current.status?.includes('B') ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-[10px] whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" /> {current.status}
                        </Badge>
                      ) : current.status?.includes('Training') ? (
                        <Badge variant="destructive" className="gap-1 text-[10px] whitespace-nowrap">
                          <AlertCircle className="w-3 h-3" /> {current.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold"
                        onClick={() => handleSave(player.id)}
                      >
                        <Calculator className="w-3 h-3 mr-1" /> Update
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h3 className="text-lg font-black text-primary uppercase">School Level Definitions</h3>
          <p className="text-sm text-muted-foreground">Status is automatically calculated as an average of all recorded physical test parameters.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-primary text-primary-foreground px-4 py-2">Level A: 75+</Badge>
          <Badge className="bg-primary/70 text-primary-foreground px-4 py-2">Level B: 60+</Badge>
          <Badge className="bg-muted text-muted-foreground px-4 py-2">Level C: 45+</Badge>
          <Badge variant="destructive" className="px-4 py-2">Level D: Below 45</Badge>
        </div>
      </div>
    </div>
  );
}
