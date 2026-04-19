
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Fitness({ store }: { store: any }) {
  const { toast } = useToast();
  const [assessments, setAssessments] = React.useState<Record<string, any>>(store.data.fitness);

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { flexibility: '', endurance: '', score: '', status: '' }),
        [field]: value
      }
    }));
  };

  const handleSave = (id: string) => {
    const assessment = assessments[id];
    if (!assessment) return;

    const score = parseFloat(assessment.score);
    const status = score >= 50 ? 'Fit' : 'Need Training';
    
    const finalAssessment = { ...assessment, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    toast({ title: "Assessment Saved", description: "Fitness data updated successfully." });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Physical Capability Report - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; }
            .fit { color: green; font-weight: bold; }
            .training { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Fitness Assessment Roster</h1>
          <table>
            <thead>
              <tr>
                <th>PLAYER</th><th>GENDER</th><th>FLEXIBILITY</th><th>ENDURANCE</th><th>SCORE</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${store.data.players.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong> (Std ${p.std})</td>
                    <td>${p.gender}</td>
                    <td>${fit.flexibility || '-'}</td>
                    <td>${fit.endurance || '-'}</td>
                    <td>${fit.score || '-'}</td>
                    <td class="${fit.status === 'Fit' ? 'fit' : 'training'}">${fit.status || 'Pending'}</td>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Physical Capability</h2>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl font-bold h-12">
          <Printer className="w-4 h-4 mr-2" /> Print Roster
        </Button>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground font-bold uppercase">Player</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Gender</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Flexibility</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Endurance</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Score (0-100)</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Status</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {store.data.players.map((player: any) => {
              const current = assessments[player.id] || { flexibility: '', endurance: '', score: '', status: '' };
              return (
                <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-bold">
                    <div className="flex flex-col">
                      <span>{player.name}</span>
                      <span className="text-[10px] text-muted-foreground">STD {player.std}</span>
                    </div>
                  </TableCell>
                  <TableCell>{player.gender}</TableCell>
                  <TableCell>
                    <Input 
                      placeholder="e.g. 70" 
                      className="w-20 rounded-lg"
                      value={current.flexibility}
                      onChange={(e) => handleChange(player.id, 'flexibility', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="e.g. 85" 
                      className="w-20 rounded-lg"
                      value={current.endurance}
                      onChange={(e) => handleChange(player.id, 'endurance', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      placeholder="Score" 
                      className="w-20 rounded-lg font-bold text-primary"
                      value={current.score}
                      onChange={(e) => handleChange(player.id, 'score', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {current.status === 'Fit' ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fit
                      </Badge>
                    ) : current.status === 'Need Training' ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" /> Training
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold"
                      onClick={() => handleSave(player.id)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
