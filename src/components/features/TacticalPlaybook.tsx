"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layout, 
  PenTool, 
  Video, 
  Plus, 
  Save, 
  Printer, 
  ChevronRight, 
  CirclePlay,
  ShieldCheck,
  Zap,
  Info,
  Trash2,
  Maximize2,
  Sword,
  ShieldHalf,
  Gamepad2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STANDARD_STRATEGIES: Record<string, any[]> = {
  'Kabaddi': [
    { title: '५-१-१ डिफेन्स सेटअप', type: 'Defense', intensity: 'High', desc: 'डिफेंडरची साखळी आणि कोपरं सांभाळण्याची रणनीती. जेव्हा बोनस ऑन असतो तेव्हा ही वापरतात.', img: 'https://picsum.photos/seed/kdef1/600/400' },
    { title: '३-२-२ कव्हर पॅटर्न', type: 'Defense', intensity: 'Extreme', desc: 'मधल्या डिफेंडर्सनी रेडरला घेरण्याची रणनीती. अत्यंत वेगवान हालचाल आवश्यक.', img: 'https://picsum.photos/seed/kdef2/600/400' },
    { title: 'बोनस एस्केप अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'रेडरने बोनस घेताना कोपऱ्यातून पळून जाण्याचे तंत्र.', img: 'https://picsum.photos/seed/koff1/600/400' }
  ],
  'Volleyball': [
    { title: '६-२ रोटेशन पॅटर्न', type: 'Rotation', intensity: 'Moderate', desc: 'दोन सेटर वापरून आक्रमणाची धार वाढवण्याची पद्धत.', img: 'https://picsum.photos/seed/vrot1/600/400' },
    { title: 'ट्रिपल ब्लॉक कव्हरेज', type: 'Defense', intensity: 'High', desc: 'प्रतिस्पर्धी स्पायकरला रोखण्यासाठी तीन खेळाडूंनी एकत्र उडी मारणे.', img: 'https://picsum.photos/seed/vdef1/600/400' }
  ],
  'Kho Kho': [
    { title: 'पोल डायव्ह ट्रॅप', type: 'Attack', intensity: 'Extreme', desc: 'पोल जवळ असताना डिफेंडरला बाद करण्याची वेगवान पद्धत.', img: 'https://picsum.photos/seed/kh1/600/400' },
    { title: 'झिग-झॅग डॉजिंग', type: 'Defense', intensity: 'High', desc: 'डिफेंडरने चेझरला थकवण्यासाठी नागमोडी धावण्याची रणनीती.', img: 'https://picsum.photos/seed/kh2/600/400' }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [planTitle, setPlanTitle] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [customPlans, setCustomPlans] = useState<any[]>([]);

  const strategies = useMemo(() => STANDARD_STRATEGIES[activeSport] || [], [activeSport]);

  const handleSavePlan = () => {
    if (!planTitle || !planDesc) return;
    const newPlan = {
      id: Math.random().toString(36).substr(2, 9),
      title: planTitle,
      desc: planDesc,
      date: format(new Date(), 'dd MMM yyyy'),
      sport: activeSport
    };
    setCustomPlans([newPlan, ...customPlans]);
    setPlanTitle("");
    setPlanDesc("");
    setIsBuilderOpen(false);
    toast({ title: "Strategy Saved", description: "Match plan archived to institutional registry." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-accent p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30">
               <Layout className="w-10 h-10 text-white" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">रणनीती मास्टरक्लास</h2>
               <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em]">Elite Tactical Playbook</p>
             </div>
           </div>
           <div className="flex gap-3">
             <Button onClick={() => setIsBuilderOpen(true)} className="bg-white text-accent h-14 rounded-2xl font-black uppercase text-[10px] px-8 shadow-xl active-scale">
               <Gamepad2 className="w-4 h-4 mr-2" /> Simulate Match
             </Button>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <Sword className="w-7 h-7 text-accent" /> Pro Formations
            </h3>
            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Official Hub Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strat, idx) => (
              <Card key={idx} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-accent transition-all group shadow-xl">
                 <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image src={strat.img} alt={strat.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className={cn(
                      "absolute top-6 left-6 font-black uppercase text-[9px] border-0",
                      strat.type === 'Defense' ? "bg-blue-600 text-white" : "bg-orange-600 text-white"
                    )}>{strat.type}</Badge>
                    <Badge variant="outline" className="absolute top-6 right-6 border-white/40 text-white font-black uppercase text-[8px] px-3 bg-white/10 backdrop-blur-sm">
                      {strat.intensity} Intensity
                    </Badge>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">{strat.title}</h4>
                       <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                         <CirclePlay className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
                 <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed italic border-l-4 border-accent/20 pl-6">
                      &quot;{strat.desc}&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-primary/5 rounded-2xl border border-primary/5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Key Focus</p>
                          <p className="text-[10px] font-bold text-primary uppercase">Coordination</p>
                       </div>
                       <div className="p-4 bg-accent/5 rounded-2xl border border-accent/5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Success Rate</p>
                          <p className="text-[10px] font-bold text-accent uppercase">84% Optimal</p>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-dashed flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5 text-accent animate-pulse" /> Live Analysis Ready
                       </span>
                       <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/5 text-accent">
                         <Maximize2 className="w-5 h-5" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-2 rounded-[3rem] bg-primary p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                     <ShieldHalf className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Coaching Insight</h3>
                 </div>
                 <p className="text-sm font-bold opacity-70 leading-relaxed italic">
                   &quot;रणनीतीचा अभ्यास केल्यामुळे खेळाडूंमधील ताळमेळ सुधारतो. विशेषतः साखळी पकड आणि कोपरं सांभाळताना हे तंत्र अत्यंत प्रभावी ठरते.&quot;
                 </p>
                 <div className="space-y-4 pt-4">
                    {['Team Defense Chain', 'Raid Exit Strategy', 'Counter-Attack Flow'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                        <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
           </Card>

           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h4 className="text-xs font-black text-primary uppercase tracking-widest">Archived Plans</h4>
                 <Badge variant="secondary" className="text-[8px] font-black uppercase">{customPlans.length} Records</Badge>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {customPlans.length === 0 ? (
                    <div className="py-20 text-center opacity-20 border-4 border-dashed rounded-[2.5rem]">
                      <PenTool className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No plans archived</p>
                    </div>
                  ) : (
                    customPlans.map((plan) => (
                      <Card key={plan.id} className="border-2 rounded-[2rem] p-6 hover:border-primary/30 transition-all group bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h5 className="font-black text-primary uppercase text-sm">{plan.title}</h5>
                           <Button variant="ghost" size="icon" onClick={() => setCustomPlans(customPlans.filter(p => p.id !== plan.id))} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                        <p className="text-xs font-medium text-foreground/60 line-clamp-2 italic">&quot;{plan.desc}&quot;</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">{plan.date}</span>
                          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary uppercase">{plan.sport}</Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
           </div>
        </div>
      </div>

      {isBuilderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="w-full max-w-lg rounded-[3rem] border-none shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-primary p-8 text-white text-center relative">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                    <PenTool className="w-8 h-8 text-white" />
                 </div>
                 <h4 className="text-2xl font-black uppercase tracking-tight">Create Tactical Map</h4>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Institutional Strategy Registry</p>
              </div>
              <div className="p-8 space-y-6 bg-white">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Strategy Title</label>
                    <Input 
                      value={planTitle} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanTitle(e.target.value)} 
                      placeholder="e.g. U17 Final Defense Setup" 
                      className="h-14 rounded-2xl border-2 font-bold px-6 shadow-inner" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Tactical Breakdown</label>
                    <Textarea 
                      value={planDesc} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPlanDesc(e.target.value)} 
                      placeholder="Describe the core technical moves..." 
                      className="min-h-[150px] rounded-2xl border-2 font-medium p-6 shadow-inner" 
                    />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button onClick={() => setIsBuilderOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</Button>
                    <Button onClick={handleSavePlan} className="flex-1 h-14 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale">
                      <Save className="w-4 h-4 mr-2" /> Archive Tactics
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}