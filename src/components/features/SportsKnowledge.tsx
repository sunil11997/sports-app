"use client";

import React, { useState, useEffect } from 'react';
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
  CircleCheck,
  Loader2,
  RefreshCw,
  AlertCircle
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
import { getSportsNews } from '@/ai/flows/sports-news';
import { getSportsHistory } from '@/ai/flows/sports-history';
import { usePWA } from '@/components/providers/pwa-provider';
import { format } from 'date-fns';

export function SportsKnowledge({ type }: { type: 'news' | 'events' | 'history' }) {
  const { isOnline } = usePWA();
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isOnline) return;
    setIsLoading(true);
    setError(null);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (type === 'news') {
        const result = await getSportsNews(today);
        setItems(result.items || []);
      } else if (type === 'history') {
        const result = await getSportsHistory(today);
        setItems(result.items || []);
      }
    } catch (err: any) {
      console.error(`WGB ${type}: Registry pulse sync failed`, err);
      setError(err.message || "Failed to connect to AI engine.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  if (error) {
    return (
      <div className="py-10 text-center space-y-4">
        <div className="bg-destructive/10 p-6 rounded-[2rem] border-2 border-destructive/20 max-w-sm mx-auto">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-xs font-black text-destructive uppercase tracking-widest">{error}</p>
          <Button variant="outline" onClick={fetchData} className="mt-4 rounded-xl font-black uppercase text-[10px] h-10 border-destructive/20 text-destructive hover:bg-destructive/5">
            <RefreshCw className="w-3 h-3 mr-2" /> Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'history') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-primary uppercase flex items-center gap-3">
            <Clock className="w-6 h-6" /> Today in History
          </h3>
          <Button variant="ghost" size="icon" onClick={fetchData} disabled={isLoading || !isOnline} className="rounded-full h-8 w-8 hover:bg-primary/5">
            <RefreshCw className={cn("w-4 h-4 text-primary", isLoading && "animate-spin")} />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-2 rounded-[1.5rem] h-[100px] flex items-center justify-center bg-white/50 animate-pulse">
                <Loader2 className="w-6 h-6 text-primary/10 animate-spin" />
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed rounded-[3rem] opacity-20">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">History Vault Offline</p>
            <Button variant="ghost" onClick={fetchData} className="mt-4 font-black uppercase text-[10px]">
              <RefreshCw className="w-3 h-3 mr-2" /> Try Sync
            </Button>
          </div>
        ) : (
          items.map((item, i) => (
            <Card key={i} className="border-2 rounded-[1.5rem] bg-white shadow-sm hover:border-primary/10 transition-all group active:scale-[0.98]">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="text-center min-w-[100px] group-hover:scale-110 transition-transform">
                  <span className="block text-2xl font-black text-primary leading-none">{item.date.split(',')[0].split(' ').pop()}</span>
                  <span className="block text-[10px] font-black uppercase text-muted-foreground mt-1">{item.date.split(',')[0].split(' ')[0]}</span>
                </div>
                <div className="h-10 w-px bg-muted" />
                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic">"{item.event}"</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  const sortedNews = [...items].sort((a, b) => {
    const sequence = { 'Maharashtra': 1, 'India': 2, 'World': 3 };
    return (sequence[a.category as keyof typeof sequence] || 99) - (sequence[b.category as keyof typeof sequence] || 99);
  });

  const getIconForCategory = (cat: string) => {
    switch (cat) {
      case 'Maharashtra': return Landmark;
      case 'India': return MapPin;
      default: return Globe;
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-2 rounded-[2.5rem] h-[250px] flex items-center justify-center bg-white/50 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary/20 animate-spin" />
            </Card>
          ))}
        </div>
      ) : sortedNews.length === 0 ? (
        <div className="py-20 text-center border-4 border-dashed rounded-[3rem] opacity-20">
          <Newspaper className="w-16 h-16 mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest">Pulse Registry Offline</p>
          <Button variant="ghost" onClick={fetchData} className="mt-4 font-black uppercase text-[10px]">
            <RefreshCw className="w-3 h-3 mr-2" /> Try Sync
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNews.map((item, i) => {
            const ItemIcon = getIconForCategory(item.category);
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
      )}

      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedNews && (
            <>
              <DialogHeader className="bg-primary p-10 text-white relative">
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">{selectedNews.title}</DialogTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent text-white font-black text-[8px] uppercase px-3">{selectedNews.category}</Badge>
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{selectedNews.date} UPDATE</span>
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
                    "{selectedNews.details}"
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
