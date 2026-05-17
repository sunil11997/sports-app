
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Calendar, Clock, Trophy, Globe, MapPin, Landmark } from 'lucide-react';

const HISTORY_DATA = [
  { date: "May 20, 1936", event: "Jesse Owens sets world records in Berlin." },
  { date: "August 15, 2008", event: "Usain Bolt wins 100m gold in world record time." },
  { date: "October 14, 1954", event: "Formation of institutional Sports Authority in Maharashtra." }
];

const NEWS_DATA = [
  { 
    category: 'Maharashtra', 
    title: "State Kabaddi Trials", 
    date: "TODAY", 
    desc: "Maharashtra state-level selection trials for junior athletes begin in Nashik district.",
    icon: Landmark
  },
  { 
    category: 'India', 
    title: "National Athletics Meet", 
    date: "LIVE", 
    desc: "Indian sprinters break seasonal records at the National Inter-State Senior Championships.",
    icon: MapPin
  },
  { 
    category: 'World', 
    title: "World Cup Qualifiers", 
    date: "UPDATE", 
    desc: "International football and cricket qualifiers see major shifts in global rankings.",
    icon: Globe
  }
];

export function SportsKnowledge({ type }: { type: 'news' | 'events' | 'history' }) {
  if (type === 'history') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-primary uppercase flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6" /> Today in History
        </h3>
        {HISTORY_DATA.map((item, i) => (
          <Card key={i} className="border-2 rounded-[1.5rem] bg-white shadow-sm hover:border-primary/10 transition-all">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-center min-w-[100px]">
                <span className="block text-2xl font-black text-primary">{item.date.split(' ')[1].replace(',', '')}</span>
                <span className="block text-[10px] font-black uppercase text-muted-foreground">{item.date.split(' ')[0]}</span>
              </div>
              <div className="h-10 w-px bg-muted" />
              <p className="text-sm font-bold text-foreground/80 leading-relaxed italic">"{item.event}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Geographic sequence: Maharashtra -> India -> World
  const sortedNews = [...NEWS_DATA].sort((a, b) => {
    const sequence = { 'Maharashtra': 1, 'India': 2, 'World': 3 };
    return (sequence[a.category as keyof typeof sequence] || 99) - (sequence[b.category as keyof typeof sequence] || 99);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedNews.map((item, i) => (
        <Card key={i} className="border-2 rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all shadow-xl bg-white relative">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                {item.category}
              </CardTitle>
            </div>
            <Badge className={cn(
              "font-black text-[9px] uppercase px-3",
              item.date === 'LIVE' ? "bg-destructive text-white animate-pulse" : "bg-accent text-accent-foreground"
            )}>{item.date}</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <h4 className="text-lg font-black text-primary uppercase leading-tight mb-3 group-hover:text-accent transition-colors">{item.title}</h4>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
            <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between">
              <div className="flex items-center text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer hover:gap-2 transition-all">
                Read Details <ChevronRight className="w-3 h-3 ml-1" />
              </div>
              <Newspaper className="w-4 h-4 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
