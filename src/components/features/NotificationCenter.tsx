
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellRing, 
  Dumbbell, 
  Trophy, 
  ClipboardCheck, 
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function NotificationCenter({ store }: { store: any }) {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [prefs, setPrefs] = useState({
    practice: true,
    tournament: true,
    attendance: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        toast({ title: "Notifications Active", description: "Waghamba Hub will now send institutional alerts." });
      }
    }
  };

  const togglePref = (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    toast({ 
      title: "Settings Updated", 
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} alerts ${next[key] ? 'enabled' : 'disabled'}.` 
    });
  };

  const simulateNotification = (title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, { body, icon: '/icon-512.png' });
    } else {
      toast({ title, description: body });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <BellRing className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Alerts</h2>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
            Configure automated reminders for practices, tournaments, and attendance logging.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {permission !== 'granted' && (
        <Card className="border-2 border-accent/20 bg-accent/5 rounded-[2.5rem] p-8 shadow-xl animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-xl font-black text-primary uppercase">Enable System Notifications</h3>
              <p className="text-sm font-medium text-foreground/70">Required for real-time practice reminders and tournament alerts.</p>
            </div>
            <Button onClick={requestPermission} className="bg-accent text-white h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active-scale">
              Grant Permission
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'practice', icon: Dumbbell, color: 'text-blue-600', label: 'Practice Reminders', desc: 'Alerts 15 mins before sessions', test: () => simulateNotification("Practice Alert", "Kabaddi drills starting in 15 mins at Main Ground.") },
          { id: 'tournament', icon: Trophy, color: 'text-orange-600', label: 'Tournament Alerts', desc: 'Institutional event updates', test: () => simulateNotification("Tournament Update", "District Kabaddi Meet entries closing tomorrow.") },
          { id: 'attendance', icon: ClipboardCheck, color: 'text-emerald-600', label: 'Attendance Prompts', desc: 'Daily registry sync reminder', test: () => simulateNotification("Registry Sync", "Don't forget to mark today's evening presence.") }
        ].map((item) => (
          <Card key={item.id} className="border-2 rounded-[2.5rem] p-8 bg-white shadow-xl hover:border-primary/20 transition-all group">
            <div className="flex flex-col h-full space-y-6">
              <div className="flex justify-between items-start">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-muted/50 transition-transform group-hover:scale-110", item.color)}>
                  <item.icon className="w-7 h-7" />
                </div>
                <Switch 
                  checked={prefs[item.id as keyof typeof prefs]} 
                  onCheckedChange={() => togglePref(item.id as keyof typeof prefs)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-primary uppercase">{item.label}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{item.desc}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={item.test} className="w-full rounded-xl font-black text-[9px] uppercase border border-primary/5 hover:bg-primary/5">
                Send Test Alert
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-primary p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
               <Smartphone className="w-8 h-8 text-white" />
             </div>
             <div className="space-y-1">
               <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Native Android Support</h3>
               <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Capacitor Registry Engine v3.3</p>
             </div>
           </div>
           <Badge variant="outline" className="text-white border-white/30 text-[10px] font-black uppercase px-6 h-10 rounded-full bg-white/5">
             Direct Tray Delivery Enabled
           </Badge>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>
    </div>
  );
}
