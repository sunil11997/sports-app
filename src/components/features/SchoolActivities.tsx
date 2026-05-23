
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function SchoolActivities({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [std, setStd] = useState("1");
  const [type, setType] = useState("Morning Drills");
  const [duration, setDuration] = useState("30 Mins");
  const [summary, setSummary] = useState("");

  const targetCategory = section === 'general' ? 'student' : 'athlete';

  const handleSave = () => {
    if (!summary) return;
    store.addActivity({
      id: Math.random().toString(36).substr(2, 9),
      date, std, type, duration, summary, category: targetCategory
    });
    setSummary("");
    toast({ title: "Activity Logged" });
  };

  const handlePrint = (activity: any) => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Activity - Std ${activity.std}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 30px; }
            h1 { color: #235C36; text-transform: uppercase; margin: 0; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee; margin-top: 20px; }
            
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
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
            <div style="font-weight: 800; text-transform: uppercase; margin-top: 10px;">ACTIVITY RECORD: ${activity.type}</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
            <span>Standard: Std ${activity.std}</span>
            <span>Date: ${format(new Date(activity.date), 'PPPP')}</span>
          </div>
          <div class="box"><p style="white-space: pre-wrap;">${activity.summary}</p></div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const activitiesList = useMemo(() => {
    return (store.data.activities || [])
      .filter((a: any) => a.category === targetCategory)
      .slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.data.activities, targetCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-xl font-black text-primary uppercase">Log Activity</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning Drills">Morning Drills</SelectItem>
                <SelectItem value="Mass PT">Mass PT</SelectItem>
                <SelectItem value="Yoga Session">Yoga Session</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" />
              <Select value={std} onValueChange={setStd}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>Std {i+1}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary..." className="min-h-[150px]" />
            <Button onClick={handleSave} className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest">Archive Log</Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Institutional History</h3>
        {activitiesList.map((act: any) => (
          <Card key={act.id} className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-lg group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black text-primary uppercase">{act.type}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Std {act.std} &bull; {format(new Date(act.date), 'dd MMM yyyy')}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handlePrint(act)} className="h-10 w-10 border-2 rounded-xl text-primary"><Printer className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => store.deleteActivity(act.id)} className="h-10 w-10 text-destructive"><Trash2 className="w-5 h-5" /></Button>
                </div>
              </div>
              <p className="text-foreground/80 font-medium leading-relaxed italic border-l-4 border-accent/30 pl-4">&quot;{act.summary}&quot;</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
