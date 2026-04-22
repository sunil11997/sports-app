
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  FileText, 
  Activity, 
  Users, 
  Cloud, 
  Clock, 
  Target
} from 'lucide-react';
import { format } from 'date-fns';

export function DailyReport({ store }: { store: any }) {
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activitySummary, setActivitySummary] = useState("");
  const [weather, setWeather] = useState("Sunny");
  const [sessionTime, setSessionTime] = useState("Morning");
  const [duration, setDuration] = useState("90 Mins");
  const [focusArea, setFocusArea] = useState("Skill Practice");

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
            @media print {
              body { padding: 0; margin: 0; }
              @page { size: auto; margin: 1cm; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; line-height: 1.4; font-size: 12px; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 20px; font-weight: 900; color: #235C36; margin: 0; }
            .report-title { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; font-size: 12px; }
            h2 { color: #1b4b3a; border-left: 4px solid #8AF075; padding-left: 10px; margin-top: 20px; text-transform: uppercase; font-size: 14px; }
            .summary-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; white-space: pre-wrap; min-height: 100px; }
            .stats { display: flex; gap: 15px; margin-bottom: 15px; }
            .stat-item { flex: 1; padding: 12px; background: #f4fcf6; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
            .stat-value { font-size: 18px; font-weight: 900; color: #235C36; }
            .stat-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: bold; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; background: #fff; padding: 12px; border: 1px solid #eee; border-radius: 8px; }
            .detail-row { font-size: 12px; }
            .detail-label { font-weight: bold; color: #235C36; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .sign-box { border-top: 1px solid #333; width: 180px; text-align: center; padding-top: 5px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
            <div class="report-title">Daily Sport & Health Activity Summary</div>
          </div>

          <div class="meta">
            <span>Date: ${format(new Date(reportDate), 'PPPP')}</span>
            <span>Ref: WGB/SPORTS/${format(new Date(reportDate), 'yyyy/MM/dd')}</span>
          </div>

          <div class="details-grid">
            <div class="detail-row"><span class="detail-label">Weather:</span> ${weather}</div>
            <div class="detail-row"><span class="detail-label">Session:</span> ${sessionTime}</div>
            <div class="detail-row"><span class="detail-label">Duration:</span> ${duration}</div>
            <div class="detail-row"><span class="detail-label">Primary Focus:</span> ${focusArea}</div>
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${store.data.players.length}</div>
              <div class="stat-label">Total Roster</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${presentCount}</div>
              <div class="stat-label">Total Present</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${absentCount}</div>
              <div class="stat-label">Total Absent</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${incidentsOnDate.length}</div>
              <div class="stat-label">Health Alerts</div>
            </div>
          </div>

          <h2>Session Activity Summary</h2>
          <div class="summary-box">${activitySummary || 'No activity summary recorded for today.'}</div>

          ${incidentsOnDate.length > 0 ? `
            <h2>Critical Health Logs (Count: ${incidentsOnDate.length})</h2>
            <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 10px; border-radius: 8px; font-size: 11px;">
              Please refer to the digital Health Registry for detailed medical observations reported today.
            </div>
          ` : ''}

          <p style="margin-top: 20px; font-size: 10px; color: #777; font-style: italic;">
            * This is an institutional consolidated report. Individual attendance logs are maintained in the central digital registry.
          </p>

          <div class="footer">
            <div class="sign-box">Physical Education Teacher</div>
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
              Capture structured session details and print official daily summaries.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary uppercase">Report Date</label>
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
              Print Official Report
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <Target className="w-5 h-5" /> Structured Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <Cloud className="w-3 h-3" /> Weather Condition
                  </label>
                  <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunny">Sunny ☀️</SelectItem>
                      <SelectItem value="Cloudy">Cloudy ☁️</SelectItem>
                      <SelectItem value="Rainy">Rainy 🌧️</SelectItem>
                      <SelectItem value="Windy">Windy 💨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Session Timing
                  </label>
                  <Select value={sessionTime} onValueChange={setSessionTime}>
                    <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning Session</SelectItem>
                      <SelectItem value="Evening">Evening Session</SelectItem>
                      <SelectItem value="Special">Special Camp</SelectItem>
                      <SelectItem value="Theory">Theory Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Session Duration
                  </label>
                  <Input 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 90 Mins"
                    className="rounded-xl border-2 h-12 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <Target className="w-3 h-3" /> Primary Focus Area
                  </label>
                  <Select value={focusArea} onValueChange={setFocusArea}>
                    <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skill Practice">Skill Practice</SelectItem>
                      <SelectItem value="Fitness Training">Fitness Training</SelectItem>
                      <SelectItem value="Match Play">Match Play</SelectItem>
                      <SelectItem value="Tactics & Strategy">Tactics & Strategy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Detailed Activity Summary
                </label>
                <Textarea 
                  placeholder="Describe drills, match scores, or specific player observations..."
                  className="min-h-[180px] rounded-2xl border-2 p-4 text-lg"
                  value={activitySummary}
                  onChange={(e) => setActivitySummary(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-accent/10 border-b border-accent/20">
              <CardTitle className="text-lg font-black text-primary uppercase">Consolidated Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground font-bold text-sm">Roster Size</span>
                </div>
                <span className="text-2xl font-black text-primary">{store.data.players.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-muted-foreground font-bold text-sm">Present Today</span>
                </div>
                <span className="text-2xl font-black text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <span className="text-muted-foreground font-bold text-sm">Absent Today</span>
                </div>
                <span className="text-2xl font-black text-destructive">{absentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-muted-foreground font-bold text-sm">Health Alerts</span>
                </div>
                <span className="text-2xl font-black text-orange-600">{incidentsOnDate.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
