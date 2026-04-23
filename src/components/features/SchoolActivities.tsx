
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Printer, 
  Plus, 
  History, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ACTIVITY_TYPES = [
  "Yoga Session",
  "Mass PT",
  "Morning Drills",
  "Institutional Games",
  "Physical Education Theory",
  "Special Camp Activity",
  "Annual Sports Practice"
];

export function SchoolActivities({ store }: { store: any }) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [std, setStd] = useState("1");
  const [type, setType] = useState(ACTIVITY_TYPES[0]);
  const [duration, setDuration] = useState("30 Mins");
  const [summary, setSummary] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  const handleSave = () => {
    if (!summary) {
      toast({ title: "Summary Required", description: "Please describe the activity summary.", variant: "destructive" });
      return;
    }

    const newActivity = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      std,
      type,
      duration,
      summary,
      timestamp: new Date().toISOString()
    };

    setActivities([newActivity, ...activities]);
    setSummary("");
    toast({ title: "Activity Logged", description: "Class activity record archived successfully." });
  };

  const handlePrint = (activity: any) => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Activity Report - Std ${activity.std}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; padding-bottom: 10px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; font-weight: bold; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee; white-space: pre-wrap; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Institutional Physical Activity Report</h1>
          <div class="meta">
            <div>Standard: ${activity.std}</div>
            <div>Date: ${format(new Date(activity.date), 'PPPP')}</div>
            <div>Activity Type: ${activity.type}</div>
            <div>Duration: ${activity.duration}</div>
          </div>
          <h3>Session Summary:</h3>
          <div class="content">${activity.summary}</div>
          <div class="footer">
            <div style="border-top: 1px solid #333; width: 150px; text-align: center; padding-top: 5px;">Class Teacher</div>
            <div style="border-top: 1px solid #333; width: 150px; text-align: center; padding-top: 5px;">PE Department</div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Plus className="w-5 h-5" /> Log Class Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase">Activity Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-2 h-12 font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase">Standard</label>
                <Select value={std} onValueChange={setStd}>
                  <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>Std {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase">Duration</label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45 Mins" className="rounded-xl border-2 h-12 font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase">Activity Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase">Activity Summary</label>
              <Textarea 
                placeholder="Describe what was covered, participation level, and any notable observations..." 
                className="rounded-xl border-2 min-h-[150px] font-medium"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-lg active-scale">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Save Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" /> Activity History
          </h3>
        </div>

        {activities.length === 0 ? (
          <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[3rem] bg-white/50 opacity-40">
            <Zap className="w-16 h-16 mb-4" />
            <p className="text-xl font-bold uppercase tracking-widest">No activities logged today</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <Card key={act.id} className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-lg group">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-primary uppercase tracking-tight">{act.type}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="border-primary/20 text-primary font-bold uppercase text-[9px]">Std {act.std}</Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(act.date), 'dd MMM yyyy')}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {act.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handlePrint(act)} className="h-10 w-10 border-2 rounded-xl text-primary hover:bg-primary/5">
                        <Printer className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setActivities(activities.filter(a => a.id !== act.id))} className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-xl">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground/80 font-medium leading-relaxed bg-muted/30 p-4 rounded-xl border border-primary/5">
                    {act.summary}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
