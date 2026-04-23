
"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, LayoutGrid, Users } from 'lucide-react';
import { StandardRegistry } from './StandardRegistry';

export function ClassesHub({ store }: { store: any }) {
  const [selectedStd, setSelectedStd] = useState<string | null>(null);

  const classSummaries = React.useMemo(() => {
    const summary: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      summary[i.toString()] = 0;
    }
    store.data.players.filter((p: any) => p.category === 'student').forEach((p: any) => {
      if (summary[p.std] !== undefined) summary[p.std]++;
    });
    return summary;
  }, [store.data.players]);

  if (selectedStd) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStd(null)}
          className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes Hub
        </Button>
        <StandardRegistry store={store} std={selectedStd} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <LayoutGrid className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Classes Hub</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
            Access exhaustive academic and growth registries for Standards 1 through 12.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(classSummaries).map(([std, count]) => (
          <Card 
            key={std} 
            onClick={() => setSelectedStd(std)}
            className="border-2 rounded-[2.5rem] p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
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
                  <Users className="w-3 h-3" /> View Registry
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
