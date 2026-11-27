
"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, FileText, Users } from 'lucide-react';
import { StandardRegistry } from './StandardRegistry';
import { isPlayerArchived } from '@/lib/student-audit-utils';

export function ExamsHub({ store, language = 'English' }: { store: any, language?: string }) {
  const [selectedStd, setSelectedStd] = useState<string | null>(null);
  const [showHigherStds, setShowHigherStds] = useState(false);

  const classSummaries = useMemo(() => {
    const summary: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      summary[i.toString()] = 0;
    }
    // Exam hub shows ALL active students (excluding TC/Left archived)
    (store.data.players || []).forEach((p: any) => {
      if (!isPlayerArchived(p) && summary[p.std] !== undefined) summary[p.std]++;
    });
    return summary;
  }, [store.data.players]);

  const visibleStds = useMemo(() => {
    return Object.entries(classSummaries).filter(([std, count]) => {
      const num = parseInt(std, 10);
      if (num <= 10) return true;
      return showHigherStds || count > 0;
    });
  }, [classSummaries, showHigherStds]);

  if (selectedStd) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStd(null)}
          className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Exams Hub
        </Button>
        <StandardRegistry store={store} std={selectedStd} language={language} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Exam Hub</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
            Official term-wise result management and academic performance scoring for Standards 1-12.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Showing Std 1 – {showHigherStds ? '12' : '10'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHigherStds((prev) => !prev)}
          className="text-xs font-black uppercase text-primary rounded-xl"
        >
          {showHigherStds ? 'Hide Std 11–12' : 'Show Std 11–12'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleStds.map(([std, count]) => (
          <Card 
            key={std} 
            onClick={() => setSelectedStd(std)}
            className="border-2 rounded-[2.5rem] p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <Badge className="bg-primary text-white font-black text-xl px-4 py-1 rounded-full">Std {std}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between border-b border-dashed pb-2">
                  <span className="text-muted-foreground font-black text-[10px] uppercase">Enrolled</span>
                  <span className="text-3xl font-black text-primary">{count}</span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase pt-2 tracking-widest flex items-center gap-1">
                  <Users className="w-3 h-3" /> Enter Grades
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
