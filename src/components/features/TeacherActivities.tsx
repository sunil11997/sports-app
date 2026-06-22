
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  ClipboardList, 
  Sun, 
  Dumbbell, 
  Users, 
  Waves, 
  Play, 
  Clock, 
  ShieldCheck, 
  Flame,
  CheckCircle2,
  ListChecks,
  Megaphone
} from 'lucide-react';
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
      { t: 'Exercise 4: Side Bending', d: 'Reach down sides of knees alternating left and right.' },
      { t: 'Exercise 5: Jumping Jacks', d: 'Synchronized jump with hand clap above head (16 counts).' }
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
      { t: 'Vajrasana', d: 'Sit on heels, hands on knees, keep back straight. Ideal after lunch.' },
      { t: 'Bhujangasana (Cobra)', d: 'Lie on stomach, lift chest using arm strength, look upward.' }
    ],
    proTips: 'Maintain absolute silence. Focus on rhythmic breathing (Inhale/Exhale).'
  },
  {
    id: 'warmups',
    title: 'Morning Drills (सकाळचा सराव)',
    icon: Flame,
    color: 'bg-orange-600',
    duration: '10 Mins',
    objective: 'Injury prevention and metabolic activation.',
    steps: [
      { t: 'Jogging (Slow)', d: '3 rounds around the assembly ground at 40% intensity.' },
      { t: 'High Knees', d: 'Running in place lifting knees to hip height (30 seconds).' },
      { t: 'Butt Kicks', d: 'Running in place with heels touching glutes (30 seconds).' },
      { t: 'Dynamic Neck Rotation', d: 'Slow circular motion (4 directions).' },
      { t: 'Wrist & Ankle Prep', d: 'Crucial for Kabaddi and Kho-Kho athletes.' }
    ],
    proTips: 'Ensure every student is participating. Identify any student showing discomfort.'
  }
];

export function TeacherActivities() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">Instructor Blueprint</Badge>
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                Teacher Activity Hub
              </h2>
            </div>
            <p className="text-lg font-medium text-white/70 max-w-xl">
              Official pedagogical guide for Physical Education instructors at Ashram Shala Waghamba.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                  <Megaphone className="w-5 h-5 text-accent" />
                  <span className="text-xs font-black uppercase">Assembly Standards</span>
               </div>
               <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                  <ListChecks className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black uppercase">Drill Instructions</span>
               </div>
            </div>
          </div>
          <div className="lg:col-span-5 hidden lg:block">
             <div className="relative w-full aspect-square bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center p-12">
                <ClipboardList className="w-32 h-32 text-white/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-[120px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-12">
        {ACTIVITY_GUIDES.map((guide) => (
          <Card key={guide.id} className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
               <div className={cn("lg:col-span-4 p-12 text-white flex flex-col justify-between relative overflow-hidden", guide.color)}>
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <guide.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{guide.title}</h3>
                    <div className="flex items-center gap-3">
                       <Badge className="bg-black/20 text-white border-0 font-black uppercase text-[10px] px-4">{guide.duration}</Badge>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Institutional Level</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                      &quot;{guide.objective}&quot;
                    </p>
                  </div>
                  <div className="relative z-10 pt-8 mt-12 border-t border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" /> Coach Sunil's Advice
                     </p>
                     <p className="text-xs font-bold leading-relaxed bg-black/10 p-4 rounded-2xl border border-white/10">
                       {guide.proTips}
                     </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
               </div>

               <div className="lg:col-span-8 p-12">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                    <Play className="w-3 h-3 text-accent fill-accent" /> Sequence of Execution
                  </h4>
                  
                  <ScrollArea className="h-[400px] pr-8">
                    <div className="space-y-6">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                              {idx + 1}
                            </div>
                            {idx !== guide.steps.length - 1 && <div className="w-0.5 h-full bg-muted my-2" />}
                          </div>
                          <div className="flex-1 pb-8">
                             <h5 className="font-black text-primary uppercase text-lg leading-none mb-2 group-hover:text-accent transition-colors">{step.t}</h5>
                             <p className="text-sm font-medium text-foreground/60 leading-relaxed italic">
                               {step.d}
                             </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>

                  <div className="mt-8 pt-8 border-t border-dashed flex items-center justify-between">
                     <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                       <CheckCircle2 className="w-5 h-5" /> Safety Standards Compliant
                     </div>
                     <Button variant="outline" className="rounded-xl border-2 font-black uppercase text-[10px] h-11 px-6 hover:bg-primary hover:text-white transition-all">
                       Print Sequence PDF
                     </Button>
                  </div>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

