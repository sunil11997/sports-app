
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Calendar, Clock, Trophy, Star } from 'lucide-react';
import { format } from 'date-fns';

const HISTORY_DATA = [
  { date: "May 20, 1936", event: "Jesse Owens sets world records in Berlin." },
  { date: "August 15, 2008", event: "Usain Bolt wins 100m gold in world record time." },
  { date: "October 14, 1954", event: "Formation of institutional Sports Authority in Maharashtra." }
];

const NEWS_DATA = [
  { title: "Zilla Parishad Tournament", date: "Coming Soon", desc: "Preparations begin for the annual ZP athletic meet." },
  { title: "Inter-Ashram Shala Meet", date: "August 2024", desc: "Waghamba school selected as host for regional Kabaddi meet." }
];

export function SportsKnowledge({ type }: { type: 'news' | 'events' | 'history' }) {
  if (type === 'history') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-primary uppercase flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6" /> Today in Sports History
        </h3>
        {HISTORY_DATA.map((item, i) => (
          <Card key={i} className="border-2 rounded-[1.5rem] bg-white">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-center min-w-[100px]">
                <span className="block text-2xl font-black text-primary">{item.date.split(' ')[1].replace(',', '')}</span>
                <span className="block text-[10px] font-black uppercase text-muted-foreground">{item.date.split(' ')[0]}</span>
              </div>
              <div className="h-10 w-px bg-muted" />
              <p className="text-sm font-bold text-foreground/80">{item.event}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(type === 'news' ? NEWS_DATA : NEWS_DATA).map((item, i) => (
        <Card key={i} className="border-2 rounded-[2rem] overflow-hidden group hover:border-primary transition-all">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-primary uppercase flex items-center gap-2">
              {type === 'news' ? <Newspaper className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {item.title}
            </CardTitle>
            <Badge className="bg-accent text-accent-foreground font-black text-[9px] uppercase">{item.date}</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
            <div className="mt-4 flex items-center text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer group-hover:gap-2 transition-all">
              Read Details <Trophy className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
