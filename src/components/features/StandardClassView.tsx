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
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
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
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; padding-bottom: 10px; }
            h2 { color: #1b4b3a; margin-top: 30px; text-transform: uppercase; font-size: 12px; border-left: 4px solid #8AF075; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background: #f8f8f8; font-weight: 800; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <h1>Standard ${std} - Institutional Profile</h1>
          <p>Total Students: ${students.length}</p>
          
          <h2>Health Registry</h2>
          <table>
            <thead>
              <tr><th>SNR</th><th>Name</th><th>Gender</th><th>Ht (cm)</th><th>Wt (kg)</th><th>BMI</th></tr>
            </thead>
            <tbody>
              ${students.map((s: any) => {
                const fit = store.data.fitness[s.id] || {};
                const h = fit.height || s.height;
                const w = fit.weight || s.weight;
                return `
                  <tr>
                    <td>${s.serialNumber || '-'}</td>
                    <td><strong>${s.name.toUpperCase()}</strong></td>
                    <td>${s.gender}</td>
                    <td>${h || '-'}</td>
                    <td>${w || '-'}</td>
                    <td>${calculateBMI(h, w)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h2>Class Activities</h2>
          ${classActivities.map((a: any) => `
              <div style="margin-top: 15px; padding: 10px; background: #f9f9f9;">
                <div style="font-weight: 900;">${a.type} - ${format(new Date(a.date), 'dd MMM yyyy')}</div>
                <p style="font-size: 11px;">${a.summary}</p>
              </div>
            `).join('')
          }
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
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
              {students.length} Enrolled Students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest shadow-lg">
            <Printer className="w-4 h-4 mr-2" /> Print Summary
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Height</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Weight</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">BMI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const fitnessData = store.data.fitness[student.id] || {};
                const h = fitnessData.height || student.height;
                const w = fitnessData.weight || student.weight;
                const bmi = calculateBMI(h, w);

                return (
                  <TableRow key={student.id} className="hover:bg-primary/5 h-12">
                    <TableCell className="font-bold text-xs">
                      <span className="uppercase text-primary">{student.name}</span>
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold">{h} cm</TableCell>
                    <TableCell className="text-center text-xs font-bold">{w} kg</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-black text-[10px]">
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
  );
}