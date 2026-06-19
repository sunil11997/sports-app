
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Layout, 
  PenTool, 
  Save, 
  ChevronRight, 
  CirclePlay,
  ShieldCheck,
  Trash2,
  Sword,
  ShieldHalf,
  Gamepad2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STANDARD_STRATEGIES: Record<string, any[]> = {
  'Kabaddi': [
    { title: '५-१-१ डिफेन्स सेटअप', type: 'Defense', intensity: 'High', desc: 'डिफेंडरची साखळी आणि कोपरं सांभाळण्याची रणनीती. जेव्हा बोनस ऑन असतो तेव्हा ही वापरतात.', howTo: '१. दोन्ही कोपरे (Corners) लाइनच्या आत खोलवर राहातात.\n२. मधले कव्हर्स रेडरच्या हालचालीवर लक्ष ठेवतात आणि त्याला बोनस घेण्यास प्रवृत्त करतात.\n३. जसा रेडर बोनससाठी पाय टाकतो, तसे कोपरे आणि कव्हर्स मिळून त्याला घेतात.', img: 'https://picsum.photos/seed/kdef1/600/400' },
    { title: '३-२-२ कव्वर पॅटर्न', type: 'Defense', intensity: 'Extreme', desc: 'मधल्या डिफेंडर्सनी रेडरला घेरण्याची रणनीती. अत्यंत वेगवान हालचाल आवश्यक.', howTo: '१. ही रणनीती प्रामुख्याने ७ खेळाडू मैदानात असताना वापरली जाते.\n२. मधले दोन खेळाडू (In-Covers) रेडरला कोपऱ्याकडे ढकलतात.\n३. रेडर कोपऱ्यात अडकला की संपूर्ण टीम साखळीने त्याला डॅश करते.', img: 'https://picsum.photos/seed/kdef2/600/400' },
    { title: 'बोनस एस्केप अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'रेडरने बोनस घेताना कोपऱ्यातून पळून जाण्याचे तंत्र.', howTo: '१. रेडर कोपऱ्यातील डिफेंडरला फसवून पाय बोनस लाईनच्या पलीकडे टाकतो.\n२. पाय पडताच कंबर फिरवून मध्यरेषेकडे झेप घेतो.\n३. हे करताना डिफेंडरचा डॅश चुकवणे महत्त्वाचे असते.', img: 'https://picsum.photos/seed/koff1/600/400' },
    { title: 'साखळी पकड (Chain Tackle)', type: 'Defense', intensity: 'High', desc: 'दोन खेळाडूंनी हात धरून रेडरला घेरण्याची आणि डॅश करण्याची पद्धत.', howTo: '१. दोन डिफेंडर्स एकमेकांचे हात घट्ट धरतात.\n२. रेडर जेव्हा कोपऱ्यात जातो, तेव्हा हे दोघे वर्तुळाकार फिरून त्याचा रस्ता रोखतात.\n३. साखळीचा वापर करून रेडरला उचलून बाहेर ढकलले जाते.', img: 'https://picsum.photos/seed/k4/600/400' },
    { title: 'डॅश डिफेन्स (Dash)', type: 'Defense', intensity: 'High', desc: 'रेडरला मध्यरेषेकडे जाण्यापासून जोरात धक्का देऊन बाहेर काढणे.', howTo: '१. कव्वर डिफेन्स रेडरच्या हालचालीचा अंदाज घेतात.\n२. जसा रेडर कोपऱ्यात जातो, कव्हर खेळाडू जोरात धावत येऊन त्याला खांद्याने धक्का देतो.', img: 'https://picsum.photos/seed/k5/600/400' },
    { title: 'थाय होल्ड (Thigh Hold)', type: 'Defense', intensity: 'Moderate', desc: 'रेडरचे पाय पकडून त्याला जागीच रोखण्याची पद्धत.', howTo: '१. डिफेंडर रेडरच्या एका पायावर लक्ष केंद्रित करतो.\n२. जसा पाय जवळ येतो, डिफेंडर दोन्ही हातांनी मांडी धरून त्याला खाली पाडतो.', img: 'https://picsum.photos/seed/k6/600/400' }
  ],
  'Volleyball': [
    { title: '६-२ रोटेशन पॅटर्न', type: 'Rotation', intensity: 'Moderate', desc: 'दोन सेटर वापरून आक्रमणाची धार वाढवण्याची पद्धत.', howTo: '१. दोन सेटर विरुद्ध दिशेला उभे राहतात.\n२. मागच्या रांगेतील सेटर सेट करण्यासाठी पुढे येतो.\n३. यामुळे समोरच्या रांगेत नेहमी ३ अटॅकर्स उपलब्ध असतात.', img: 'https://picsum.photos/seed/v1/600/400' },
    { title: 'ट्रिपल ब्लॉक कव्हरेज', type: 'Defense', intensity: 'High', desc: 'प्रतिस्पर्धी स्पायकरला रोखण्यासाठी तीन खेळाडूंनी एकत्र उडी मारणे.', howTo: '१. समोरच्या रांगेतील तिन्ही खेळाडू स्पायकरच्या समोर एकत्र येतात.\n२. एकाच वेळी उडी मारून हातांची भिंत उभी करतात.\n३. यामुळे बॉल परत जाण्याची शक्यता ९०% वाढते.', img: 'https://picsum.photos/seed/v2/600/400' },
    { title: 'लिबेरो डिफेन्स (Libero)', type: 'Defense', intensity: 'High', desc: 'विशेष संरक्षण खेळाडू जो फक्त मागच्या रांगेत खेळतो.', howTo: '१. लिबेरोचा गणवेश वेगळ्या रंगाचा असतो.\n२. तो बॉल रिसीव्ह करण्यात आणि डिगिंग करण्यात तज्ज्ञ असतो.', img: 'https://picsum.photos/seed/v3/600/400' },
    { title: 'फ्लोट सर्व्हिस (Float)', type: 'Offense', intensity: 'Low', desc: 'बॉल न फिरवता मारणे जेणेकरून तो हवेत डोलत जाईल.', howTo: '१. बॉलच्या मध्यभागी सरळ हाताने मारा.\n२. बॉलला स्पिन देऊ नका.', img: 'https://picsum.photos/seed/v4/600/400' }
  ],
  'Running': [
    { title: '१००मी स्टार्ट (Start)', type: 'Technique', intensity: 'Extreme', desc: 'सुरुवातीच्या सेकंदात जास्तीत जास्त वेग पकडण्याची पद्धत.', howTo: '१. ब्लॉक्सवर योग्य स्थितीत बसा.\n२. गोळी सुटताच हातांच्या वेगाने पुढे झेपावा.', img: 'https://picsum.photos/seed/r1/600/400' },
    { title: 'बॅटन एक्सचेंज (Relay)', type: 'Teamwork', intensity: 'High', desc: 'रिले रेसमध्ये बॅटन न पाहता यशस्वीपणे दुसऱ्या खेळाडूकडे सोपवणे.', howTo: '१. एक्सचेंज झोनमध्ये येताच बॅटन देणाऱ्याने ओरडावे.\n२. घेणाऱ्याने हात मागे करून बॅटन घट्ट पकडावे.', img: 'https://picsum.photos/seed/r2/600/400' }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedStrat, setSelectedStrat] = useState<any | null>(null);
  
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
    toast({ title: "Strategy Saved", description: "Match plan archived to registry." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-accent p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30">
               <Layout className="w-10 h-10 text-white" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Playbook</h2>
               <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em]">Elite Tactical Hub v4.3.26</p>
             </div>
           </div>
           <Button onClick={() => setIsBuilderOpen(true)} className="bg-white text-accent h-14 rounded-2xl font-black uppercase text-[10px] px-8 shadow-xl">
             <Gamepad2 className="w-4 h-4 mr-2" /> Simulate Match
           </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <Sword className="w-7 h-7 text-accent" /> {activeSport} Formations
            </h3>
            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Official Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strat, idx) => (
              <Card key={idx} onClick={() => setSelectedStrat(strat)} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-accent transition-all group shadow-xl cursor-pointer active:scale-95">
                 <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image src={strat.img} alt={strat.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className={cn(
                      "absolute top-6 left-6 font-black uppercase text-[9px] border-0",
                      strat.type === 'Defense' ? "bg-blue-600 text-white" : "bg-orange-600 text-white"
                    )}>{strat.type}</Badge>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">{strat.title}</h4>
                       <CirclePlay className="w-10 h-10 text-white/50" />
                    </div>
                 </div>
                 <CardContent className="p-8 space-y-4">
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed line-clamp-2 italic border-l-4 border-accent/20 pl-4">
                      &quot;{strat.desc}&quot;
                    </p>
                    <div className="flex items-center text-[10px] font-black text-accent uppercase tracking-widest gap-2">
                       Learn Technique <ChevronRight className="w-3 h-3" />
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
                   <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Advice</h3>
                 </div>
                 <p className="text-sm font-bold opacity-70 leading-relaxed italic">
                   &quot;Tactics are built on discipline and intelligence. Execution is the key to winning championships.&quot;
                 </p>
              </div>
           </Card>

           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h4 className="text-xs font-black text-primary uppercase tracking-widest">Simulations</h4>
                 <Badge variant="secondary" className="text-[8px] font-black uppercase">{customPlans.length} Archived</Badge>
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
                           <button onClick={() => setCustomPlans(customPlans.filter(p => p.id !== plan.id))} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Trash2 className="w-4 h-4" />
                           </button>
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

      <Dialog open={!!selectedStrat} onOpenChange={() => setSelectedStrat(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-3xl bg-white flex flex-col max-h-[90vh]">
          {selectedStrat && (
            <>
              <DialogHeader className="bg-primary p-10 text-white relative shrink-0">
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                    <CirclePlay className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">{selectedStrat.title}</DialogTitle>
                    <Badge className="bg-accent text-white font-black text-[8px] uppercase px-3 border-0">{selectedStrat.type}</Badge>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="p-10 space-y-8">
                  <div className="aspect-video relative rounded-[2rem] overflow-hidden border-4 border-primary/5 shadow-inner bg-muted">
                    <Image src={selectedStrat.img} alt={selectedStrat.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary"><Info className="w-4 h-4" /><h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Blueprint</h4></div>
                    <div className="bg-muted/30 p-8 rounded-3xl border-2 border-dashed border-muted">
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic whitespace-pre-wrap">&quot;{selectedStrat.howTo}&quot;</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/5 flex items-start gap-4">
                     <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                     <p className="text-[11px] font-bold text-primary/70 uppercase tracking-tight">This tactic follows official WGB institutional standards.</p>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-10 bg-slate-50 border-t shrink-0">
                <Button onClick={() => setSelectedStrat(null)} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale">Close Guide</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
