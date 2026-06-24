"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Waves, 
  Play, 
  ShieldCheck, 
  Flame,
  CheckCircle2,
  ListChecks,
  Megaphone,
  Printer,
  Zap,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ACTIVITY_GUIDES = [
  {
    id: 'mass-pt',
    title: 'Mass PT (सामूहिक पी.टी.)',
    icon: Users,
    color: 'bg-blue-600',
    duration: '20 Mins',
    objective: 'Standardized coordination and discipline for the entire assembly.',
    steps: [
      { t: 'Command 1: Attention (सावधान)', d: 'Heels together, toes 30 degrees apart, hands tight at sides.' },
      { t: 'Command 2: Stand at Ease (विश्राम)', d: 'Left foot 12 inches apart, hands behind back, chest up.' },
      { t: 'Exercise 1: Arm Rotation', d: 'Move arms in large circles (8 counts forward, 8 counts backward).' },
      { t: 'Exercise 2: Trunk Twist', d: 'Twist torso left and right with arms extended horizontally.' },
      { t: 'Exercise 3: Toe Touch', d: 'Bend forward to touch toes without bending knees.' },
    ],
    proTips: 'Teacher should stand on a raised platform. Use a whistle or rhythmic counting (1-2-3-4).'
  },
  {
    id: 'yoga',
    title: 'Yoga Hub (योगासन)',
    icon: Waves,
    color: 'bg-purple-600',
    duration: '15 Mins',
    objective: 'Flexibility, mental focus, and core stability.',
    steps: [
      { t: 'Suryanamaskar (12 Steps)', d: 'Perform 6 sets of 12 steps: Pranamasana to Shavasana.' },
      { t: 'Tadasana (Mountain Pose)', d: 'Stretch hands upward, stand on toes, balance for 10 seconds.' },
      { t: 'Vrikshasana (Tree Pose)', d: 'Balance on one leg, place other foot on inner thigh, hands in prayer.' },
    ],
    proTips: 'Maintain absolute silence. Focus on rhythmic breathing (Inhale/Exhale).'
  }
];

export function TeacherActivities() {
  const handlePrint = (guide: any) => {
    const printContent = `<html><body style="font-family:sans-serif;padding:40px;"><h1>${guide.title}</h1><p>${guide.objective}</p></body></html>`;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white text-center">
        <div className="relative z-10 space-y-6">
          <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">Instructor Blueprint</Badge>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">Teacher Activity Hub</h2>
          <p className="text-lg font-medium text-white/70 max-w-xl mx-auto">Official pedagogical guide for Physical Education instructors at Ashram Shala Waghamba.</p>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-[120px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-12">
        {ACTIVITY_GUIDES.map((guide) => (
          <Card key={guide.id} className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl flex flex-col lg:flex-row h-full">
               <div className={cn("lg:w-1/3 p-12 text-white flex flex-col justify-between relative overflow-hidden", guide.color)}>
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <guide.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{guide.title}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-90 italic">&quot;{guide.objective}&quot;</p>
                  </div>
                  <div className="relative z-10 pt-8 mt-12 border-t border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Coach Sunil&apos;s Advice</p>
                     <p className="text-xs font-bold leading-relaxed bg-black/10 p-4 rounded-2xl border border-white/10">{guide.proTips}</p>
                  </div>
               </div>

               <div className="lg:w-2/3 p-12 flex flex-col">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Play className="w-3 h-3 text-accent fill-accent" /> Sequence of Execution</h4>
                  <ScrollArea className="flex-1 h-[300px]">
                    <div className="space-y-8 pr-8">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-6 group">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shrink-0">{idx + 1}</div>
                          <div className="flex-1"><h5 className="font-black text-primary uppercase text-lg leading-none mb-2 group-hover:text-accent transition-colors">{step.t}</h5><p className="text-sm font-medium text-foreground/60 leading-relaxed italic">{step.d}</p></div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="mt-8 pt-8 border-t border-dashed flex flex-col sm:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 className="w-5 h-5" /> Safety Standards Compliant</div>
                     <Button onClick={() => handlePrint(guide)} className="rounded-xl border-2 font-black uppercase text-[10px] h-12 px-8 bg-primary text-white shadow-lg"><Printer className="w-4 h-4 mr-2" /> Print PDF</Button>
                  </div>
               </div>
          </Card>
        ))}
      </div>
    </div>
  );
}