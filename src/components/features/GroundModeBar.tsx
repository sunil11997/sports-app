"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Play, 
  Trophy, 
  ShieldAlert, 
  Camera, 
  Save,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroundModeBarProps {
  isActive: boolean;
  onAction: (action: 'attendance' | 'practice' | 'scoreboard' | 'injury' | 'camera' | 'sync') => void;
  pendingSyncCount?: number;
}

export function GroundModeBar({
  isActive,
  onAction,
  pendingSyncCount = 0,
}: GroundModeBarProps) {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xl z-50 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-slate-950 border-4 border-amber-400 rounded-3xl p-2.5 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-1.5 sm:gap-2">
        {/* 1. Attendance */}
        <button
          type="button"
          onClick={() => onAction('attendance')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-transform active:scale-95 shadow-md"
        >
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">हजेरी</span>
        </button>

        {/* 2. Practice */}
        <button
          type="button"
          onClick={() => onAction('practice')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-transform active:scale-95 shadow-md"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 stroke-none" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">सराव</span>
        </button>

        {/* 3. Scoreboard */}
        <button
          type="button"
          onClick={() => onAction('scoreboard')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black transition-transform active:scale-95 shadow-md"
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">गुणफलक</span>
        </button>

        {/* 4. Injury */}
        <button
          type="button"
          onClick={() => onAction('injury')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black transition-transform active:scale-95 shadow-md"
        >
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">दुखापत</span>
        </button>

        {/* 5. Camera */}
        <button
          type="button"
          onClick={() => onAction('camera')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black transition-transform active:scale-95 shadow-md"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">कॅमेरा</span>
        </button>

        {/* 6. Save/Sync */}
        <button
          type="button"
          onClick={() => onAction('sync')}
          className="flex-1 flex flex-col items-center justify-center h-16 sm:h-18 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-transform active:scale-95 shadow-md relative"
        >
          <Save className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 uppercase">जतन</span>
          {pendingSyncCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-950">
              {pendingSyncCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
