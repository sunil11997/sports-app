"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Crown, 
  Flame, 
  HeartPulse, 
  Medal, 
  Star, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format, subDays, isSameDay } from 'date-fns';

interface StudentPerformance {
  id: string;
  name: string;
  photoUrl?: string;
  std: string;
  fitnessScore: number;
  attendanceStreak: number;
  isRecoveryChampion: boolean;
  totalScore: number;
}

export function Gamification({ store }: { store: any }) {
  const leaderboardData = useMemo(() => {
    const players = store.data.players || [];
    const attendance = store.data.attendance || {};
    const fitness = store.data.fitness || {};
    const health = store.data.healthIncidents || [];
    
    const results: StudentPerformance[] = players.map((p: any) => {
      // 1. Calculate Attendance Streak (last 30 days window)
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = format(subDays(today, i), 'yyyy-MM-dd');
        // Check Morning or Evening presence
        const isPresent = attendance[`${p.id}_${d}_Morning`] === 'P' || attendance[`${p.id}_${d}_Evening`] === 'P';
        if (isPresent) streak++;
        else break; // Streak broken
      }

      // 2. Recovery Champion Logic:
      // Player had a 'Critical' incident but is now 'Elite' or 'Optimal'
      const hadCriticalInjury = health.some((h: any) => h.playerId === p.id && h.severity === 'Critical');
      const fitData = fitness[p.id] || {};
      const isRecoveryChampion = hadCriticalInjury && (fitData.status === 'Elite' || fitData.status === 'Optimal');

      const fScore = parseFloat(fitData.score) || 0;
      
      // 3. Weighted Total Score for Leaderboard
      // Streak (max 30 days) = 40 points max
      // Fitness Score (0-100) = 60 points max
      const totalScore = (streak / 30 * 40) + (fScore / 100 * 60);

      return {
        id: p.id,
        name: p.name,
        photoUrl: p.photoUrl,
        std: p.std,
        fitnessScore: fScore,
        attendanceStreak: streak,
        isRecoveryChampion,
        totalScore: Math.round(totalScore)
      };
    });

    return results.sort((a, b) => b.totalScore - a.totalScore);
  }, [store.data]);

  const topFive = leaderboardData.slice(0, 5);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <Trophy className="w-10 h-10 text-accent animate-bounce" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">डिजिटल कौतुक आणि लीडरबोर्ड</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto italic">
            Appreciation hub for Waghamba athletes. Excellence is recognized and rewarded daily.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <Crown className="w-7 h-7 text-amber-500" /> Top 5 Students of the Month
            </h3>
            <Badge variant="outline" className="font-black text-[9px] uppercase border-primary/20 bg-white px-4 h-8 rounded-full">Monthly Pulse</Badge>
          </div>

          <div className="space-y-4">
            {topFive.length === 0 ? (
              <div className="py-20 text-center opacity-20 border-4 border-dashed rounded-[3rem]">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">Awaiting Registry Data</p>
              </div>
            ) : (
              topFive.map((student, idx) => (
                <Card key={student.id} className={cn(
                  "border-2 rounded-[2.5rem] p-6 transition-all hover:shadow-xl group overflow-hidden relative",
                  idx === 0 ? "border-amber-400 bg-amber-50/30" : "border-primary/5 bg-white"
                )}>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner",
                      idx === 0 ? "bg-amber-400 text-white" : "bg-primary/10 text-primary"
                    )}>
                      {idx + 1}
                    </div>
                    <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                      <AvatarImage src={student.photoUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black uppercase">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-primary uppercase text-lg group-hover:text-accent transition-colors truncate">{student.name}</h4>
                        {idx === 0 && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Std {student.std} &bull; Monthly Rating: {student.totalScore}/100</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-2xl font-black text-primary">{student.totalScore}</p>
                      <p className="text-[8px] font-black uppercase text-muted-foreground">Aggregate</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-amber-500 text-white font-black text-[9px] uppercase px-4 py-1 rounded-full shadow-lg">Consistency King</Badge>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <Card className="border-2 rounded-[3rem] bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-primary p-8 text-white">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Medal className="w-6 h-6 text-accent" /> Digital Badges
                </CardTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Automatic Achievement System</p>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-emerald-100 shadow-sm relative group overflow-hidden">
                    <Flame className="w-10 h-10 text-emerald-600 animate-pulse group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-primary uppercase text-sm">नियमित खेळाडू (Consistency King)</h5>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      Awarded for a <span className="text-emerald-600 font-black">15-day practice streak</span>. Recognition for daily discipline at the Ashram Shala.
                    </p>
                    <div className="pt-2">
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-emerald-200 text-emerald-700 bg-emerald-50">Active: {leaderboardData.filter(s => s.attendanceStreak >= 15).length} Students</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-blue-100 shadow-sm group overflow-hidden">
                    <ShieldCheck className="w-10 h-10 text-blue-600 group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-primary uppercase text-sm">फायटर खेळाडू (Recovery Champion)</h5>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      Awarded for the most <span className="text-blue-600 font-black">stable post-injury recovery</span>. Resilience in returning to elite fitness levels.
                    </p>
                    <div className="pt-2">
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-blue-200 text-blue-700 bg-blue-50">Active: {leaderboardData.filter(s => s.isRecoveryChampion).length} Students</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted text-center space-y-2">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Institutional Merit System</p>
                   <p className="text-xs font-medium text-foreground/60 italic leading-relaxed">
                     &quot;Achievements are synchronized with the student&apos;s Performance Dossier and visible to all faculty members.&quot;
                   </p>
                </div>
              </CardContent>
           </Card>

           <Card className="border-2 rounded-[3rem] bg-accent p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-8 h-8" />
                  <h4 className="text-2xl font-black uppercase tracking-tight">Motivate the Squad</h4>
                </div>
                <p className="text-sm font-bold opacity-80 leading-relaxed">
                  Teacher Sunil, use the Leaderboard during morning mass PT to celebrate the Top 5 students. Digital recognition drives long-term performance.
                </p>
                <Button className="w-full h-14 bg-white text-accent rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale">
                  Export Appreciation PDF
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
           </Card>
        </div>
      </div>
    </div>
  );
}
