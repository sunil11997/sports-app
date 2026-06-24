"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ClipboardList, 
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    id: 'athletics-base',
    title: 'Athletics Foundation (ॲथलेटिक्स पाया)',
    icon: Zap,
    color: 'bg-rose-600',
    duration: '25 Mins',
    objective: 'Developing running mechanics and linear explosive power.',
    steps: [
      { t: 'A-Skips (High Knees)', d: 'Rhythmic skipping while lifting knees to hip height.' },
      { t: 'B-Skips (Leg Extension)', d: 'Extension of the lower leg before striking the ground under center of mass.' },
      { t: 'Arm Action Drill', d: 'Seated or standing, swing arms from hip to chin at 90-degree angles.' },
      { t: 'Falling Starts', d: 'Leaning forward until balance is lost, then exploding into a 10m sprint.' },
      { t: 'Stretches for Runners', d: 'Calf, quad, and hamming dynamic stretches.' }
    ],
    proTips: 'Focus on "Toe-Up" (dorsiflexion) and "Chest-Up" posture. Speed follows form.'
  },
  {
    id: 'kabaddi-warmup',
    title: 'Kabaddi Specific Warmup (कबड्डी सराव)',
    icon: Flame,
    color: 'bg-orange-600',
    duration: '15 Mins',
    objective: 'Agility, grip strength, and reaction prep for Kabaddi.',
    steps: [
      { t: 'Sideways Shuffling', d: 'Lateral movement along the baulk line, staying low in defensive stance.' },
      { t: 'Finger & Wrist Prep', d: 'Squeezing and rotating wrists; essential for ankle/thigh holds.' },
      { t: 'Reaction Tag', d: 'Partner drill: one player tries to touch the other within a small square.' },
      { t: 'Ankle Stability', d: 'One-legged balance drills to prevent sprains during escape moves.' },
      { t: 'Cant Practice', d: 'Running rounds while maintaining clear, rhythmic "Kabaddi" chant.' }
    ],
    proTips: 'Simulate game intensity. Ensure students maintain the "Cant" without breaking breath.'
  },
  {
    id: 'cooldown',
    title: 'Recovery & Cool Down (कुल डाऊन)',
    icon: RotateCcw,
    color: 'bg-emerald-600',
    duration: '10 Mins',
    objective: 'Heart rate reduction and metabolic waste clearance.',
    steps: [
      { t: 'Slow Jog to Walk', d: 'Transition from high activity to a slow walk for 3 minutes.' },
      { t: 'Static Stretching', d: 'Hold each major muscle group stretch for 20-30 seconds.' },
      { t: 'Deep Breathing', d: 'Standing or lying down, focused belly breathing (4 sec in, 6 sec out).' },
      { t: 'Mental Review', d: 'Briefly discuss the successes of the practice session.' }
    ],
    proTips: 'Never skip cool-down. It reduces muscle soreness and speeds up readiness for next practice.'
  }
];

export function TeacherActivities() {
  const handlePrint = (guide: typeof ACTIVITY_GUIDES[0]) => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Guide - ${guide.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            @media print { 
              @page { size: A4; margin: 1.5cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; line-height: 1.6; color: #111; font-size: 14px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
            .school-name { font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-title { font-weight: 800; text-transform: uppercase; margin-top: 5px; color: #333; }
            .objective-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
            .objective-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; letter-spacing: 0.1em; }
            .step { margin-bottom: 20px; display: flex; gap: 15px; }
            .step-num { width: 30px; height: 30px; background: #1e3a8a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; shrink: 0; }
            .step-content h4 { margin: 0 0 5px 0; text-transform: uppercase; font-size: 16px; color: #1e3a8a; }
            .step-content p { margin: 0; color: #444; }
            .pro-tips { margin-top: 40px; padding: 20px; background: #fffbeb; border-left: 6px solid #f59e0b; border-radius: 0 12px 12px 0; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: 900; font-size: 12px; opacity: 0.6; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← CLOSE</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>

          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</div>
            <div class="report-title">Pedagogical Blueprint: ${guide.title}</div>
          </div>

          <div class="objective-box">
            <span class="objective-label">Instructor Objective</span>
            <p style="margin-top: 5px; font-style: italic; font-weight: 500;">&quot;${guide.objective}&quot;</p>
            <p style="margin-top: 10px; font-size: 12px;"><strong>Estimated Duration:</strong> ${guide.duration}</p>
          </div>

          <div class="steps-container">
            ${guide.steps.map((step, i) => `
              <div class="step">
                <div class="step-num">${i + 1}</div>
                <div class="step-content">
                  <h4>${step.t}</h4>
                  <p>${step.d}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="pro-tips">
            <strong style="text-transform: uppercase; font-size: 11px;">Coach Sunil&apos;s Pro-Tips:</strong>
            <p style="margin-top: 5px; font-size: 13px;">${guide.proTips}</p>
          </div>

          <div class="footer">
            <span>Official Activity Registry • WGB Hub v4.3.26</span>
            <span>Date: ${format(new Date(), 'dd/MM/yyyy')}</span>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="space-y-2">
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">Instructor Blueprint</Badge>
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                Teacher Activity Hub
              </h2>
            </div>
            <p className="text-lg font-medium text-white/70 max-w-xl mx-auto lg:mx-0">
              Official pedagogical guide for Physical Education instructors at Ashram Shala Waghamba.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
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
          <Card key={guide.id} className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl group">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
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
                       <ShieldCheck className="w-4 h-4" /> Coach Sunil&apos;s Advice
                     </p>
                     <p className="text-xs font-bold leading-relaxed bg-black/10 p-4 rounded-2xl border border-white/10">
                       {guide.proTips}
                     </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
               </div>

               <div className="lg:col-span-8 p-12 flex flex-col">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                    <Play className="w-3 h-3 text-accent fill-accent" /> Sequence of Execution
                  </h4>
                  
                  <ScrollArea className="flex-1 min-h-[350px]">
                    <div className="space-y-8 pr-8">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                              {idx + 1}
                            </div>
                            {idx !== guide.steps.length - 1 && <div className="w-0.5 h-full bg-muted my-2" />}
                          </div>
                          <div className="flex-1 pb-4">
                             <h5 className="font-black text-primary uppercase text-lg leading-none mb-2 group-hover:text-accent transition-colors">{step.t}</h5>
                             <p className="text-sm font-medium text-foreground/60 leading-relaxed italic">
                               {step.d}
                             </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="mt-8 pt-8 border-t border-dashed flex flex-col sm:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                       <CheckCircle2 className="w-5 h-5" /> Safety Standards Compliant
                     </div>
                     <Button 
                        onClick={() => handlePrint(guide)}
                        className="w-full sm:w-auto rounded-xl border-2 font-black uppercase text-[10px] h-12 px-8 bg-primary text-white shadow-lg active-scale transition-all"
                      >
                       <Printer className="w-4 h-4 mr-2" /> Print Sequence PDF
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