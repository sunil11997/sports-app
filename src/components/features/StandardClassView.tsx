
"use client";

import React, { useState, useMemo } from 'react';
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
  Printer,
  FileBarChart,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StandardClassView({ store, std }: { store: any, std: string }) {
  const [activeReportMode, setActiveReportMode] = useState<'First' | 'Yearly'>('First');
  
  const students = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        // 1. Sort by Gender (Female first)
        if (a.gender !== b.gender) {
          return a.gender === 'Female' ? -1 : 1;
        }
        // 2. Sort by Serial Number
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

  const classActivities = useMemo(() => {
    return store.data.activities.filter((a: any) => a.std === std);
  }, [store.data.activities, std]);

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
          <h1>Standard ${std} - Institutional Profile (${activeReportMode === 'First' ? 'Term 1' : 'Year-wise'})</h1>
          <p>Location: Satana, Nashik | Total Students: ${students.length}</p>
          
          <h2>Student Health Registry</h2>
          <table>
            <thead>
              <tr><th>SNR</th><th>Name</th><th>Gender</th><th>Age</th><th>Ht (cm)</th><th>Wt (kg)</th><th>BMI</th></tr>
            </thead>
            <tbody>
              ${students.map((s: any) => {
                const fitHistory = store.data.fitnessHistory[s.id] || [];
                const fit = fitHistory.find((h: any) => h.term === (activeReportMode === 'First' ? 'First' : 'Second')) || store.data.fitness[s.id] || {};
                const currentBMI = calculateBMI(fit.height || s.height, fit.weight || s.weight);
                return `
                  <tr>
                    <td>${s.serialNumber || '-'}</td>
                    <td><strong>${s.name.toUpperCase()}</strong></td>
                    <td>${s.gender}</td>
                    <td>${s.age}</td>
                    <td>${fit.height || s.height || '-'}</td>
                    <td>${fit.weight || s.weight || '-'}</td>
                    <td>${currentBMI}</td>
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

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button 
            variant={activeReportMode === 'First' ? "default" : "ghost"}
            onClick={() => setActiveReportMode('First')}
            className={cn(
              "rounded-xl px-4 font-black uppercase text-[10px] tracking-wider",
              activeReportMode === 'First' ? "bg-primary text-white" : "text-muted-foreground"
            )}
          >
            Term 1 View
          </Button>
          <Button 
            variant={activeReportMode === 'Yearly' ? "default" : "ghost"}
            onClick={() => setActiveReportMode('Yearly')}
            className={cn(
              "rounded-xl px-4 font-black uppercase text-[10px] tracking-wider",
              activeReportMode === 'Yearly' ? "bg-primary text-white" : "text-muted-foreground"
            )}
          >
            Year-wise
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest shadow-lg ml-2">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Scale className="w-5 h-5" /> Student Registry
              </CardTitle>
              <Badge className="bg-accent text-black font-black uppercase text-[10px]">
                Institutional Profile
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Age</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Height</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">Weight</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">BMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => {
                    const fitHistory = store.data.fitnessHistory[student.id] || [];
                    const fitnessData = fitHistory.find((h: any) => h.term === (activeReportMode === 'First' ? 'First' : 'Second')) || store.data.fitness[student.id] || {};
                    const h = fitnessData.height || student.height;
                    const w = fitnessData.weight || student.weight;
                    const bmi = calculateBMI(h, w);
                    const bmiNum = parseFloat(bmi);

                    return (
                      <TableRow key={student.id} className="hover:bg-primary/5 h-12">
                        <TableCell className="font-bold text-xs">
                          <div className="flex flex-col">
                            <span className="uppercase text-primary">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">SR: #{student.serialNumber || '0'} • {student.gender}</span>
                              {student.category === 'athlete' && <Badge className="bg-accent/10 text-accent text-[6px] font-black h-3 px-1 border-accent/20">ATHLETE</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold">{student.age}</TableCell>
                        <TableCell className="text-center text-xs font-bold">{h} cm</TableCell>
                        <TableCell className="text-center text-xs font-bold">{w} kg</TableCell>
                        <TableCell className="text-right">
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
