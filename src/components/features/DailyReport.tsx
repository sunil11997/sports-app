"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, FileText, Activity, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export function DailyReport({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [isMounted, setIsMounted] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [manualNotes, setManualSummary] = useState("");
  const [weather, setWeather] = useState("Sunny");
  const [sessionTime, setSessionTime] = useState("Morning");

  const targetCategory = section === 'general' ? 'student' : 'athlete';

  useEffect(() => {
    setIsMounted(true);
    setReportDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const activitiesToday = useMemo(() => {
    if (!isMounted || !reportDate) return [];
    return store.data.activities.filter((a: any) => 
      a.date === reportDate && a.category === targetCategory
    );
  }, [store.data.activities, reportDate, isMounted, targetCategory]);

  const autoSummary = useMemo(() => {
    if (activitiesToday.length === 0) return `No ${section === 'sports' ? 'athletic training' : 'physical education'} activities logged for this date.`;
    return activitiesToday.map((a: any) => `• [Std ${a.std}] ${a.type} (${a.duration}): ${a.summary}`).join('\n\n');
  }, [activitiesToday, section]);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Daily Report - ${reportDate}</title>
          <style>
            @media print { @page { size: A4; margin: 2cm; } .no-print { display: none; } }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 14px; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .report-title { font-weight: 800; text-transform: uppercase; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #eee; padding: 10px 0; }
            h3 { color: #1b4b3a; border-left: 5px solid #8AF075; padding-left: 10px; margin-top: 30px; text-transform: uppercase; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee; white-space: pre-wrap; min-height: 150px; }
            .btn { display: inline-block; padding: 10px 20px; background: #235C36; color: white; text-decoration: none; border-radius: 5px; font-weight: 900; margin-bottom: 20px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .sign { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right;">
            <a href="javascript:window.close()" class="btn">RETURN TO APP</a>
          </div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div class="report-title">${section === 'sports' ? 'Competitive Sports' : 'Physical Education'} Activity Report</div>
          </div>
          <div class="meta">
            <span>Date: ${format(new Date(reportDate), 'PPPP')}</span>
            <span>Session: ${sessionTime} (${weather})</span>
          </div>
          <h3>Consolidated Activity Summary</h3>
          <div class="box">${autoSummary}</div>
          <h3>Additional Instructor Observations</h3>
          <div class="box">${manualNotes || 'No additional notes provided.'}</div>
          <div class="footer">
            <div class="sign">Physical Education Director</div>
            <div class="sign">Principal Signature</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <FileText className="w-10 h-10 text-accent" /> Institutional Report Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">Automatic summary generation for the {section === 'sports' ? 'Sports Hub' : 'Student Registry'}.</p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">Select Date</label>
              <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="rounded-2xl border-2 h-14 font-black" />
            </div>
            <Button onClick={handlePrint} className="bg-primary text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"><Printer className="w-5 h-5 mr-2" /> Print Official Report</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
          <CardHeader className="bg-accent/10 border-b p-6"><CardTitle className="text-sm font-black uppercase tracking-widest">Automatic Daily Summary ({targetCategory === 'athlete' ? 'Athletes' : 'Students'})</CardTitle></CardHeader>
          <CardContent className="p-8">
            <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted font-medium text-sm text-foreground/60 whitespace-pre-wrap leading-relaxed min-h-[250px]">{autoSummary}</div>
          </CardContent>
        </Card>
        <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-6"><CardTitle className="text-sm font-black uppercase tracking-widest">Additional Notes</CardTitle></CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <Select value={weather} onValueChange={setWeather}><SelectTrigger className="h-12 border-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sunny">Sunny ☀️</SelectItem><SelectItem value="Rainy">Rainy 🌧️</SelectItem></SelectContent></Select>
               <Select value={sessionTime} onValueChange={setSessionTime}><SelectTrigger className="h-12 border-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Evening">Evening</SelectItem></SelectContent></Select>
             </div>
             <Textarea value={manualNotes} onChange={(e) => setManualSummary(e.target.value)} placeholder="Type extra observations here..." className="min-h-[200px] rounded-2xl border-2 p-6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
