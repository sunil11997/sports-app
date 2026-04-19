"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Calendar, FileText, Activity, Users, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

export function DailyReport({ store }: { store: any }) {
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activitySummary, setActivitySummary] = useState("");

  const attendanceOnDate = store.data.players.map((p: any) => {
    const status = store.data.attendance[`${p.id}_${reportDate}`];
    return { name: p.name, status: status || '-' };
  });

  const presentCount = attendanceOnDate.filter((a: any) => a.status === 'P').length;
  const absentCount = attendanceOnDate.filter((a: any) => a.status === 'A').length;

  const incidentsOnDate = store.data.healthIncidents.filter((inc: any) => inc.date === reportDate);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Daily Sport Report - ${format(new Date(reportDate), 'dd MMM yyyy')}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 4px solid #235C36; padding-bottom: 20px; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: 900; color: #235C36; margin: 0; }
            .report-title { font-size: 18px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; }
            h2 { color: #1b4b3a; border-left: 4px solid #8AF075; padding-left: 10px; margin-top: 30px; text-transform: uppercase; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f4fcf6; }
            .summary-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-top: 10px; white-space: pre-wrap; }
            .stats { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat-item { flex: 1; padding: 15px; background: #f4fcf6; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
            .stat-value { font-size: 20px; font-weight: 900; color: #235C36; }
            .stat-label { font-size: 10px; text-transform: uppercase; color: #666; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sign-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">शासकिय माध्यमिक आश्रम शाळा वाघांबा</h1>
            <div class="report-title">Daily Sport & Health Activity Report</div>
          </div>

          <div class="meta">
            <span>Date: ${format(new Date(reportDate), 'PPPP')}</span>
            <span>Teacher: सुनिल देशमुख</span>
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${store.data.players.length}</div>
              <div class="stat-label">Total Roster</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${presentCount}</div>
              <div class="stat-label">Present</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${absentCount}</div>
              <div class="stat-label">Absent</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${incidentsOnDate.length}</div>
              <div class="stat-label">Health Alerts</div>
            </div>
          </div>

          <h2>Activity Summary</h2>
          <div class="summary-box">${activitySummary || 'No activity summary recorded for today.'}</div>

          <h2>Attendance Log</h2>
          <table>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Player Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceOnDate.map((a: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${a.name}</td>
                  <td style="color: ${a.status === 'P' ? 'green' : 'red'}; font-weight: bold;">${a.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${incidentsOnDate.length > 0 ? `
            <h2>Health & Medical Incidents</h2>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Incident Description</th>
                </tr>
              </thead>
              <tbody>
                ${incidentsOnDate.map((inc: any) => `
                  <tr>
                    <td><strong>${inc.playerName}</strong></td>
                    <td>${inc.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="footer">
            <div class="sign-box">Coach Signature</div>
            <div class="sign-box">Principal Signature</div>
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
    <div className="space-y-8">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <FileText className="w-10 h-10 text-accent" /> Daily Report Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Generate and print official daily summaries of attendance, training activities, and health logs.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary uppercase">Select Report Date</label>
              <Input 
                type="date" 
                value={reportDate} 
                onChange={(e) => setReportDate(e.target.value)} 
                className="rounded-2xl border-2 h-14 text-lg font-bold bg-white"
              />
            </div>
            <Button 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 font-black text-lg shadow-lg uppercase tracking-wider"
            >
              <Printer className="w-6 h-6 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Activity className="w-5 h-5" /> Today's Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea 
                placeholder="Write a brief summary of the sports activities conducted today, training modules covered, and any special observations..."
                className="min-h-[200px] rounded-2xl border-2 p-4 text-lg"
                value={activitySummary}
                onChange={(e) => setActivitySummary(e.target.value)}
              />
              <p className="mt-4 text-sm text-muted-foreground italic">
                * This summary will be included in the official printed daily report.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Users className="w-5 h-5" /> Daily Attendance Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">Player Name</TableHead>
                    <TableHead className="text-center font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceOnDate.map((a: any) => (
                    <TableRow key={a.name}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          a.status === 'P' ? 'bg-green-100 text-green-700' : 
                          a.status === 'A' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {a.status === 'P' ? 'PRESENT' : a.status === 'A' ? 'ABSENT' : 'NOT SET'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
            <CardHeader className="bg-accent/10 border-b border-accent/20">
              <CardTitle className="text-lg font-black text-primary uppercase">Daily Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground font-bold">Total Players</span>
                <span className="text-2xl font-black text-primary">{store.data.players.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground font-bold">Present Today</span>
                <span className="text-2xl font-black text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground font-bold">Absent Today</span>
                <span className="text-2xl font-black text-destructive">{absentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold">Health Incidents</span>
                <span className="text-2xl font-black text-orange-600">{incidentsOnDate.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
              <CardTitle className="text-lg font-black text-destructive uppercase flex items-center gap-2">
                <Stethoscope className="w-5 h-5" /> Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {incidentsOnDate.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-8">No health incidents reported today.</p>
              ) : (
                <div className="space-y-4">
                  {incidentsOnDate.map((inc: any) => (
                    <div key={inc.id} className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                      <p className="font-bold text-destructive text-sm uppercase">{inc.playerName}</p>
                      <p className="text-xs text-foreground/70 mt-1">{inc.description}</p>
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
