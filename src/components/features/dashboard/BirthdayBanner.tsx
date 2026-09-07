"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Cake } from 'lucide-react';
import type { Player } from '@/lib/types';

interface BirthdayBannerProps {
  birthdays: Player[];
  isMarathiView: boolean;
}

export function BirthdayBanner({ birthdays, isMarathiView }: BirthdayBannerProps) {
  if (!birthdays || birthdays.length === 0) return null;

  return (
    <Card className="p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400/40 shadow-sm flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
        <Cake className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60">
            {isMarathiView ? "आजचा वाढदिवस 🎂" : "Today's Birthday 🎂"}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">
            ({birthdays.length} {isMarathiView ? "विद्यार्थी" : "Students"})
          </span>
        </div>
        <p className="text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5">
          {birthdays.map((b) => (isMarathiView && b.nameMarathi ? b.nameMarathi : b.name)).join(", ")}
        </p>
      </div>
    </Card>
  );
}
