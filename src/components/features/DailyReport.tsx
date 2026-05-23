"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, FileText, AlertTriangle, Users, ClipboardCheck, History, Trophy, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function DailyReport({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [isMounted, setIsMounted] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [manualNotes, setManualSummary] = useState("");
  const [weather, setWeather] = useState("Sunny");

  const targetCategory = useMemo(() => section === 'general' ? 'student' : 'athlete', [section]);

  useEffect(() => {
    setIsMounted(true);
    setReportDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const activitiesToday = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.activities) return [];
    return store.data.activities.filter((a: any) => 
      a.date === reportDate && a.category === targetCategory
    );
  }, [store?.data?.activities, reportDate, isMounted, targetCategory]);

  const healthToday = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.healthIncidents) return [];
    return store.data.healthIncidents.filter((h: any) => 
      h.date === reportDate && (section === 'general' ? true : h.category === 'athlete')
    );
  }, [store?.data?.healthIncidents, reportDate, isMounted, section]);

  const attendanceSummary = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.attendance) return { morning: 0, evening: 0 };
    let morning = 0;
    let evening = 0;
    
    Object.entries(store.data.attendance).forEach(([key, status]) => {
      if (status === 'P' && key.includes(reportDate)) {
        if (key.endsWith('_Morning')) morning++;
        if (key.endsWith('_Evening')) evening++;
      }
    });
    
    return { morning, evening };
  }, [store?.data?.attendance, reportDate, isMounted]);

  const fitnessLogsToday = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.fitness) return [];
    return Object.values(store.data.fitness).filter((f: any) => f.date === reportDate);
  }, [store?.data?.fitness, reportDate, isMounted]);

  const drillsCompletedToday = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.drillCompletionsRaw) return [];
    return store.data.drillCompletionsRaw.filter((d: any) => d.timestamp?.startsWith(reportDate));
  }, [store?.data?.drillCompletionsRaw, reportDate, isMounted]);

  const autoSummary = useMemo(() => {
    let summaryLines: string[] = [];
    
    if (activitiesToday.length > 0) {
      summaryLines.push("### RECORDED ACTIVITIES");
      activitiesToday.forEach((a: any) => summaryLines.push(`• [Std ${a.std}] ${a.type} (${a.duration}): ${a.summary}`));
      summaryLines.push("");
    }

    if (drillsCompletedToday.length > 0) {
      summaryLines.push("### DRILLS MASTERED");
      summaryLines.push(`${drillsCompletedToday.length} technical drills successfully logged today across the registry.`);
      summaryLines.push("");
    }

    if (fitnessLogsToday.length > 0) {
      summaryLines.push("### FITNESS EVALUATIONS");
      summaryLines.push(`${fitnessLogsToday.length} physical test scores updated in the institutional performance registry.`);
      summaryLines.push("");
    }

    if (summaryLines.length === 0) {
      return `No automatic activity, drills, or fitness metrics were archived for this date in the ${section === 'sports' ? 'Sport Hub' : 'General Registry'}.`;
    }

    return summaryLines.join('\n');
  }, [activitiesToday, drillsCompletedToday, fitnessLogsToday, section]);

  const handlePrint = () => {
    if (!reportDate) return;
    const printContent = `
      <html>
        <head>
          <title>Daily Briefing - ${reportDate}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1.5cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; line-height: 1.4; color: #111; font-size: 13px; }
            .header { text-align: center; border-bottom: 4px double #221d1d; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-title { font-weight: 800; text-transform: uppercase; margin-top: 5px; text-decoration: underline; }
            .meta { display: flex; justify-content: space-between; font-weight: 800; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 20px; }
            h3 { color: #111; border-left: 5px solid #1e3a8a; padding-left: 10px; margin-top: 25px; text-transform: uppercase; font-size: 14px; }
            .box { background: #fdfdfd; padding: 15px; border: 1px solid #ddd; border-radius: 8px; white-space: pre-wrap; min-height: 100px; margin-top: 5px; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
            .stat-item { border: 1px solid #eee; padding: 10px; border-radius: 5px; text-align: center; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: 900; }
            .sign { border-top: 1px solid #333; width: 220px; text-align: center; padding-top: 5px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; transition: all 0.2s; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>

          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div class="report-title">Daily Institutional Activity Briefing (${section.toUpperCase()})</div>
          </div>
          <div class="meta">
            <span>DATE: ${reportDate ? format(new Date(reportDate), 'PPPP') : '---'}</span>
            <span>WEATHER: ${weather.toUpperCase()}</span>
          </div>

          <h3>1. Institutional Attendance Overview</h3>
          <div class="stat-grid">
            <div class="stat-item"><strong>Morning Session:</strong> ${attendanceSummary.morning} Present</div>
            <div class="stat-item"><strong>Evening Session:</strong> ${attendanceSummary.evening} Present</div>
          </div>

          <h3>2. Consolidated Activity Summary</h3>
          <div class="box">${autoSummary}</div>

          <h3>3. Health & Medical Log</h3>
          <div class="box">
            ${healthToday.length === 0 
              ? 'No medical incidents reported today.' 
              : healthToday.map((h: any) => `ALERT: [${h.playerName}] ${h.description}`).join('\n')
            }
          </div>

          <h3>4. Head Instructor Observations</h3>
          <div class="box">${manualNotes || 'Standard operations conducted.'}</div>

          <div class="footer">
            <div class="sign">Teacher Sunil Deshmukh</div>
            <div class="sign">Principal Signature</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20" suppressHydrationWarning>
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center justify-center md:justify-start gap-3">
              <FileText className="w-10 h-10 text-accent" /> Auto-Report
            </h2>
            <p className="text-lg font-medium text-foreground/70">Registry engine automatically aggregates all session data for archival.</p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">Select Date</label>
              <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="rounded-2xl border-2 h-14 font-black shadow-sm" />
            </div>
            <Button onClick={handlePrint} className="bg-primary text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale">
              <Printer className="w-5 h-5 mr-2" /> Print Daily Brief
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-accent/5 border-b p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Automatic Activity Stream
              </CardTitle>
              <Badge variant="outline" className="font-black border-accent/20 text-accent">Real-Time Sync</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-muted/30 p-8 rounded-[2rem] border-2 border-dashed border-muted font-medium text-sm text-foreground/60 whitespace-pre-wrap leading-relaxed min-h-[300px]">
                {autoSummary}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden transition-all",
            healthToday.length > 0 ? "border-destructive/30" : "border-border"
          )}>
            <CardHeader className={cn(
              "border-b p-6 flex flex-row justify-between items-center",
              healthToday.length > 0 ? "bg-destructive/5" : "bg-muted/10"
            )}>
              <CardTitle className={cn(
                "text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2",
                healthToday.length > 0 ? "text-destructive" : "text-primary"
              )}>
                <AlertTriangle className="w-4 h-4" /> Health Registry Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {healthToday.length === 0 ? (
                <p className="text-sm font-bold text-muted-foreground italic text-center opacity-40">No medical alerts recorded for this period.</p>
              ) : (
                <div className="space-y-4">
                  {healthToday.map((h: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-destructive/[0.03] border border-destructive/10 rounded-2xl">
                      <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black uppercase text-xs text-destructive">{h.playerName}</p>
                        <p className="text-xs font-medium text-foreground/70">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border-2 shadow-sm text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Morning Presence</p>
                <p className="text-3xl font-black text-primary">{attendanceSummary.morning}</p>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border-2 shadow-sm text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Evening Presence</p>
                <p className="text-3xl font-black text-primary">{attendanceSummary.evening}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border-2 shadow-sm text-center">
                <Trophy className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Drills Logged</p>
                <p className="text-3xl font-black text-accent">{drillsCompletedToday.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border-2 shadow-sm text-center">
                <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Fitness Evaluations</p>
                <p className="text-3xl font-black text-emerald-500">{fitnessLogsToday.length}</p>
             </div>
          </div>

          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Observations</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Weather Context</label>
                 <Select value={weather} onValueChange={setWeather}>
                   <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Sunny">Sunny ☀️</SelectItem>
                     <SelectItem value="Rainy">Rainy 🌧️</SelectItem>
                     <SelectItem value="Overcast">Overcast ☁️</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Head Instructor Remark</label>
                 <Textarea 
                  value={manualNotes} 
                  onChange={(e) => setManualSummary(e.target.value)} 
                  placeholder="Record summary observations..." 
                  className="min-h-[150px] rounded-2xl border-2 p-6 font-medium text-sm" 
                 />
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
