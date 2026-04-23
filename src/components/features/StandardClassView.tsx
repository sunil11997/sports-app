
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Zap, 
  Scale, 
  Calendar,
  Clock,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';

export function StandardClassView({ store, std }: { store: any, std: string }) {
  const students = store.data.players.filter((p: any) => p.std === std && p.category === 'student');
  const classActivities = store.data.activities.filter((a: any) => a.std === std);

  const calculateBMI = (h: string, w: string) => {
    const height = parseFloat(h) / 100;
    const weight = parseFloat(w);
    if (!height || !weight) return "0.0";
    return (weight / (height * height)).toFixed(1);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Class Profile - Std ${std}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; padding-bottom: 10px; }
            h2 { color: #1b4b3a; margin-top: 30px; text-transform: uppercase; font-size: 14px; border-left: 4px solid #8AF075; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background: #f8f8f8; font-weight: 800; }
            .activity { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .act-header { font-weight: 900; color: #235C36; }
          </style>
        </head>
        <body>
          <h1>Standard ${std} - Institutional Profile</h1>
          <p>Location: Satana, Nashik | Total Students: ${students.length}</p>
          
          <h2>Student Health & Fitness Registry</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Age</th><th>Ht (cm)</th><th>Wt (kg)</th><th>BMI</th><th>Fitness Score</th></tr>
            </thead>
            <tbody>
              ${students.map((s: any) => {
                const fit = store.data.fitness[s.id] || {};
                const currentBMI = calculateBMI(fit.height || s.height, fit.weight || s.weight);
                return `
                  <tr>
                    <td><strong>${s.name.toUpperCase()}</strong></td>
                    <td>${s.age}</td>
                    <td>${fit.height || s.height || '-'}</td>
                    <td>${fit.weight || s.weight || '-'}</td>
                    <td>${currentBMI}</td>
                    <td>${fit.score || '0'}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h2>Logged Class Activities</h2>
          ${classActivities.length === 0 ? '<p>No activities logged for this class.</p>' : 
            classActivities.map((a: any) => `
              <div class="activity">
                <div class="act-header">${a.type} - ${format(new Date(a.date), 'dd MMM yyyy')}</div>
                <div style="font-size: 10px; color: #666;">Duration: ${a.duration}</div>
                <p style="margin-top: 5px;">${a.summary}</p>
              </div>
            `).join('')
          }
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Standard {std} Overview</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {students.length} Enrolled Students • {classActivities.length} Logged Activities
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-lg">
          <Printer className="w-5 h-5 mr-2" /> Print Class Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Scale className="w-5 h-5" /> Student Health Registry
              </CardTitle>
              <Badge className="bg-accent text-black font-black uppercase text-[10px]">BMI & Fitness</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Age</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Height</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Weight</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">BMI</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">Fitness Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => {
                    const fitnessData = store.data.fitness[student.id] || {};
                    const h = fitnessData.height || student.height;
                    const w = fitnessData.weight || student.weight;
                    const bmi = calculateBMI(h, w);
                    const bmiNum = parseFloat(bmi);

                    return (
                      <TableRow key={student.id} className="hover:bg-primary/5 h-12">
                        <TableCell className="font-bold text-xs">
                          <div className="flex flex-col">
                            <span className="uppercase text-primary">{student.name}</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">ID: {student.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold">{student.age}</TableCell>
                        <TableCell className="text-center text-xs font-bold">{h} cm</TableCell>
                        <TableCell className="text-center text-xs font-bold">{w} kg</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-black text-[10px]",
                              bmiNum >= 18.5 && bmiNum <= 24.9 ? "text-green-600 border-green-200" : "text-orange-600 border-orange-200"
                            )}
                          >
                            {bmi}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-black text-primary">{fitnessData.score || '0'}%</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col h-full">
            <CardHeader className="bg-primary/5 border-b p-6">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Class Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto">
              {classActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                  <Activity className="w-12 h-12 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No activities logged yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classActivities.map((act: any) => (
                    <div key={act.id} className="border-l-4 border-accent pl-4 py-2 space-y-1 group">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-primary uppercase leading-tight">{act.type}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Calendar className="w-2 h-2" /> {format(new Date(act.date), 'dd MMM')}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-foreground/70 line-clamp-2 italic">"{act.summary}"</p>
                      <div className="flex items-center gap-2 pt-1">
                         <span className="text-[8px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                           <Clock className="w-2 h-2" /> {act.duration}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
