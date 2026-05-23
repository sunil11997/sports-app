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
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STANDARD_STRATEGIES: Record<string, any[]> = {
  'Kabaddi': [
    { title: '५-१-१ डिफेन्स सेटअप', type: 'Defense', desc: 'डिफेंडरची साखळी आणि कोपरं सांभाळण्याची रणनीती. जेव्हा बोनस ऑन असतो तेव्हा ही वापरतात.', img: 'https://picsum.photos/seed/kdef1/600/400' },
    { title: '३-२-२ कव्हर पॅटर्न', type: 'Defense', desc: 'मधल्या डिफेंडर्सनी रेडरला घेरण्याची रणनीती. अत्यंत वेगवान हालचाल आवश्यक.', img: 'https://picsum.photos/seed/kdef2/600/400' },
    { title: 'बोनस एस्केप अटॅक', type: 'Offense', desc: 'रेडरने बोनस घेताना कोपऱ्यातून पळून जाण्याचे तंत्र.', img: 'https://picsum.photos/seed/koff1/600/400' }
  ],
  'Volleyball': [
    { title: '६-२ रोटेशन पॅटर्न', type: 'Rotation', desc: 'दोन सेटर वापरून आक्रमणाची धार वाढवण्याची पद्धत.', img: 'https://picsum.photos/seed/vrot1/600/400' },
    { title: 'ट्रिपल ब्लॉक कव्हरेज', type: 'Defense', desc: 'प्रतिस्पर्धी स्पायकरला रोखण्यासाठी तीन खेळाडूंनी एकत्र उडी मारणे.', img: 'https://picsum.photos/seed/vdef1/600/400' }
  ],
  'Kho Kho': [
    { title: 'पोल डायव्ह ट्रॅप', type: 'Attack', desc: 'पोल जवळ असताना डिफेंडरला बाद करण्याची वेगवान पद्धत.', img: 'https://picsum.photos/seed/kh1/600/400' },
    { title: 'झिग-झॅग डॉजिंग', type: 'Defense', desc: 'डिफेंडरने चेझरला थकवण्यासाठी नागमोडी धावण्याची रणनीती.', img: 'https://picsum.photos/seed/kh2/600/400' }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  // Custom Plan State
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

  const handlePrintPlaybook = () => {
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Institutional Playbook - ${activeSport}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { color: #1e3a8a; border-bottom: 4px solid #f59e0b; padding-bottom: 10px; text-transform: uppercase; }
            .strategy { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .type { font-weight: 900; color: #f59e0b; text-transform: uppercase; font-size: 12px; }
            h2 { margin-top: 5px; text-transform: uppercase; }
            p { color: #444; }
          </style>
        </head>
        <body>
          <h1>WAGHAMBA SPORTS HUB - ${activeSport.toUpperCase()} TACTICAL PLAYBOOK</h1>
          ${strategies.map(s => `
            <div class="strategy">
              <div class="type">${s.type}</div>
              <h2>${s.title}</h2>
              <p>${s.desc}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-accent p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30">
               <Layout className="w-10 h-10 text-white" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">डिजिटल रणनीती बोर्ड</h2>
               <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em]">Institutional Tactical Playbook</p>
             </div>
           </div>
           <div className="flex gap-3">
             <Button onClick={handlePrintPlaybook} variant="outline" className="bg-white/10 border-white/20 text-white h-14 rounded-2xl font-black uppercase text-[10px] px-8 hover:bg-white/20">
               <Printer className="w-4 h-4 mr-2" /> Export Playbook
             </Button>
             <Button onClick={() => setIsBuilderOpen(true)} className="bg-white text-accent h-14 rounded-2xl font-black uppercase text-[10px] px-8 shadow-xl active-scale">
               <PenTool className="w-4 h-4 mr-2" /> New Strategy
             </Button>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-accent" /> Master Strategies
            </h3>
            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Official Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strat, idx) => (
              <Card key={idx} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-accent transition-all group shadow-xl">
                 <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image src={strat.img} alt={strat.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-6 left-6 bg-accent text-white font-black uppercase text-[9px] border-0">{strat.type}</Badge>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">{strat.title}</h4>
                       <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                         <CirclePlay className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
                 <CardContent className="p-8">
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed italic border-l-4 border-accent/20 pl-6">
                      &quot;{strat.desc}&quot;
                    </p>
                    <div className="mt-8 pt-8 border-t border-dashed flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5 text-accent" /> Active Study Material
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
                     <Video className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Study Room</h3>
                 </div>
                 <p className="text-sm font-bold opacity-70 leading-relaxed">
                   मैदानाबाहेर सरावाचा अभ्यास करा. पावसाळ्याच्या दिवसांत हे रणनीती बोर्ड मुलांसाठी अत्यंत उपयुक्त ठरतील.
                 </p>
                 <div className="space-y-4 pt-4">
                    {['Rotation Positions', 'Block Timing', 'Defense Chains'].map((item, i) => (
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
                 <h4 className="text-xs font-black text-primary uppercase tracking-widest">Match Plans</h4>
                 <Badge variant="secondary" className="text-[8px] font-black uppercase">{customPlans.length} Archived</Badge>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {customPlans.length === 0 ? (
                    <div className="py-20 text-center opacity-20 border-4 border-dashed rounded-[2.5rem]">
                      <PenTool className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No match plans saved</p>
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
                 <h4 className="text-2xl font-black uppercase tracking-tight">Create Match Strategy</h4>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Archive for hostel study</p>
              </div>
              <div className="p-8 space-y-6 bg-white">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Strategy Title</label>
                    <Input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="e.g. Nashik District Finals Setup" className="h-14 rounded-2xl border-2 font-bold px-6 shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Tactical Description</label>
                    <Textarea value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="Describe the positioning and core focus..." className="min-h-[150px] rounded-2xl border-2 font-medium p-6 shadow-inner" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button onClick={() => setIsBuilderOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</Button>
                    <Button onClick={handleSavePlan} className="flex-1 h-14 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale">
                      <Save className="w-4 h-4 mr-2" /> Archive Plan
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/10 p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <Info className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Institutional Study Mode</h4>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
            &quot;रणनीतीचा अभ्यास केल्यामुळे मैदानावरील प्रत्यक्ष सरावाचा वेळ वाचतो. मुले हॉस्टेलमध्ये असताना मोबाईलवर या रणनीतींचा अभ्यास करून स्वतःला अधिक सज्ज करू शकतात.&quot;
          </p>
          <div className="flex items-center justify-center gap-2 pt-6">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.3em]">Registry Synchronized • Tactical V4.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
