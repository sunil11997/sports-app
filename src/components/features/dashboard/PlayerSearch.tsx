"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PlayerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isMarathiView: boolean;
  onToggleLanguage: () => void;
  totalCount: number;
}

export function PlayerSearch({
  searchTerm,
  onSearchChange,
  isMarathiView,
  onToggleLanguage,
  totalCount,
}: PlayerSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isMarathiView
              ? "नाव, हजेरी क्र., G.R. क्र. किंवा आधार शोधा..."
              : "Search by student name, roll no, G.R. or Aadhaar..."
          }
          className="pl-10 h-11 sm:h-12 bg-white rounded-xl sm:rounded-2xl border-2 border-primary/10 shadow-sm font-medium text-xs sm:text-sm focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Badge
          variant="outline"
          className="h-10 px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider bg-slate-50 border-2"
        >
          {totalCount} {isMarathiView ? "विद्यार्थी" : "Students"}
        </Badge>
        <Button
          type="button"
          variant="outline"
          onClick={onToggleLanguage}
          className="h-10 px-3.5 rounded-xl font-black text-[10px] sm:text-xs tracking-wider border-2 hover:bg-primary/5 transition-all"
        >
          {isMarathiView ? "English View" : "मराठी नाव"}
        </Button>
      </div>
    </div>
  );
}
