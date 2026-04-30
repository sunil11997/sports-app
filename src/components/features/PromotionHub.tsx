"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpCircle, 
  Users, 
  ChevronRight, 
  GraduationCap, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function PromotionHub({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [isPromoting, setIsPromoting] = useState<string | null>(null);

  const students = useMemo(() => {
    const targetCategory = section === 'general' ? 'student' : 'athlete';
    return store.data.players.filter((p: any) => p.category === targetCategory);
  }, [store.data.players, section]);

  const statsByStd = useMemo(() => {
    const stats: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) stats[i.toString()] = 0;
    students.forEach((s: any) => {
      if (stats[s.std] !== undefined) stats[s.std]++;
    });
    return stats;
  }, [students]);

  const handlePromoteAllInStd = (std: string) => {
    const playersToPromote = students.filter((s: any) => s.std === std);
    if (playersToPromote.length === 0) return;

    const nextStd = parseInt(std) + 1;
    const isFinalStd = std === "12";
    const targetLabel = isFinalStd ? "Graduated Status" : `Std ${nextStd}`;

    if (!confirm(`Are you sure you want to promote all ${playersToPromote.length} students from Std ${std} to ${targetLabel}?`)) return;

    setIsPromoting(std);
    
    playersToPromote.forEach((p: any) => {
      const currentStdNum = parseInt(p.std) || 0;
      if (currentStdNum < 12) {
        store.updatePlayer({ ...p, std: (currentStdNum + 1).toString() });
      } else {
        store.updatePlayer({ ...p, std: "Graduated" });
      }
    });

    // Short artificial delay for visual feedback
    setTimeout(() => {
      setIsPromoting(null);
      toast({
        title: "Promotion Success",
        description: `All students from Standard ${std} have been successfully moved to ${targetLabel}.`,
      });
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <ArrowUpCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Standard Promotion Hub</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
            Manage institutional transitions by moving entire classes to their next academic standard.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(statsByStd).map(([std, count]) => {
          const nextStd = parseInt(std) + 1;
          const isFinalStd = std === "12";
          
          return (
            <Card key={std} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-primary/30 transition-all shadow-xl group">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-primary uppercase tracking-tight">Std {std}</span>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{count} Students Enrolled</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-black uppercase bg-muted/50">Ready</Badge>
                </div>

                <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Current</p>
                    <Badge variant="outline" className="bg-white text-primary border-primary/10 text-xs px-4 py-1">Std {std}</Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30" />
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Target</p>
                    <Badge className="bg-primary text-white text-xs px-4 py-1 shadow-sm">
                      {isFinalStd ? "Graduated" : `Std ${nextStd}`}
                    </Badge>
                  </div>
                </div>

                <Button 
                  onClick={() => handlePromoteAllInStd(std)}
                  disabled={count === 0 || isPromoting === std}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active-scale",
                    isFinalStd ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {isPromoting === std ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ArrowUpCircle className="w-5 h-5 mr-2" /> 
                      {isFinalStd ? "Mark as Graduated" : `Promote Standard`}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/10 p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Institutional Transfer Logic</h4>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
            "Promoting a standard will instantly update the academic level for all students currently assigned to it. 
            This action is permanent and should only be performed at the start of a new term or year."
          </p>
          <div className="flex items-center justify-center gap-2 pt-6">
             <CheckCircle2 className="w-5 h-5 text-primary" />
             <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.3em]">Registry Synchronized • V3.0 Hub</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
