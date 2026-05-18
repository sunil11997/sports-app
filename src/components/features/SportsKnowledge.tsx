
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Newspaper, 
  Clock, 
  Globe, 
  MapPin, 
  Landmark, 
  Info,
  ChevronRight as ChevronRightIcon,
  CircleCheck
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    details: "The Maharashtra State Kabaddi Association has announced the commencement of selection trials for the U-17 and U-19 categories. The trials are being held at the Chhatrapati Shivaji Stadium in Nashik. Over 500 athletes from various districts are expected to participate. Selected players will represent the state in the upcoming National School Games. Coaches are advised to ensure all students have their institutional ID and medical clearance ready.",
    icon: Landmark
  },
  { 
    category: 'India', 
    title: "National Athletics Meet", 
    date: "LIVE", 
    desc: "Indian sprinters break seasonal records at the National Inter-State Senior Championships.",
    details: "Day 3 of the National Inter-State Senior Athletics Championships has seen spectacular performances in the 100m and 400m sprints. New seasonal bests were set by the top three finishers in the men's category. This meet serves as a primary qualifier for international invitational events later this year. The Athletics Federation of India (AFI) has emphasized the importance of scientific training modules used by institutional coaches across the country.",
    icon: MapPin
  },
  { 
    category: 'World', 
    title: "World Cup Qualifiers", 
    date: "UPDATE", 
    desc: "International football and cricket qualifiers see major shifts in global rankings.",
    details: "In a series of high-stakes matches across the globe, the international sports landscape is shifting. Recent qualifying results have seen traditional underdogs rising in the rankings, while established teams struggle to maintain consistency. These shifts highlight the evolving nature of global athletic preparation and the critical role of grassroots sports hubs in identifying elite talent early in their development.",
    icon: Globe
  }
];

export function SportsKnowledge({ type }: { type: 'news' | 'events' | 'history' }) {
  const [selectedNews, setSelectedNews] = useState<any>(null);

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

  // Assign icon to a capitalized variable for safe JSX rendering
  const NewsIcon = selectedNews?.icon;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNews.map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <Card 
              key={i} 
              onClick={() => setSelectedNews(item)}
              className="border-2 rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all shadow-xl bg-white relative cursor-pointer active:scale-[0.98]"
            >
              <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ItemIcon className="w-4 h-4 text-primary" />
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
                <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-3">
                  {item.desc}
                </p>
                <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between">
                  <div className="flex items-center text-[9px] font-black text-primary uppercase tracking-widest group-hover:gap-2 transition-all">
                    Read Details <ChevronRightIcon className="w-3 h-3 ml-1" />
                  </div>
                  <Newspaper className="w-4 h-4 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary p-10 text-white relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                {NewsIcon && <NewsIcon className="w-8 h-8 text-white" />}
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">{selectedNews?.title}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-accent text-white font-black text-[8px] uppercase px-3">{selectedNews?.category}</Badge>
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{selectedNews?.date} UPDATE</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>

          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Info className="w-4 h-4" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Detailed Briefing</h4>
              </div>
              <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-4 border-accent/20 pl-6">
                "{selectedNews?.details}"
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                <CircleCheck className="w-4 h-4 text-emerald-500" /> Source Verified • Official Sports Pulse
              </p>
            </div>
          </div>

          <DialogFooter className="p-10 bg-slate-50 border-t">
            <Button 
              onClick={() => setSelectedNews(null)}
              className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale"
            >
              Close Briefing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
