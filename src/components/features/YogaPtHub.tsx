"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Activity, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Share2, 
  BookOpen, 
  Info,
  Calendar,
  Flame,
  Award,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SportsSkills } from './SportsSkills';
import { SportsDrills } from './SportsDrills';
import { DailyReport } from './DailyReport';
import { YOGA_PT_KNOWLEDGE_BASE } from '@/lib/yogaPtKnowledge';
import { YogaPtGuideModal } from '@/components/ui/YogaPtGuideModal';
import { format } from 'date-fns';

interface YogaPtHubProps {
  store: any;
  gameType: 'Yoga' | 'PT Mass';
  onBack?: () => void;
}

export function YogaPtHub({ store, gameType, onBack }: YogaPtHubProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'session' | 'skills' | 'guide' | 'report'>('session');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['5', '6', '7', '8', '9', '10']);
  const [guideModalName, setGuideModalName] = useState<string | null>(null);

  // Quick Daily Activity Logging state
  const [selectedDrill, setSelectedDrill] = useState<string>(
    gameType === 'Yoga' ? 'Surya Namaskar' : 'Mass PT Exercise No 1'
  );
  const [sessionDate, setSessionDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [boysCount, setBoysCount] = useState<string>('25');
  const [girlsCount, setGirlsCount] = useState<string>('20');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const isYoga = gameType === 'Yoga';

  const drillsList = isYoga ? [
    'Surya Namaskar', 'Tadasana', 'Vrikshasana', 'Bhujangasana', 'Padmasana',
    'Anulom Vilom', 'Kapalbhati', 'Shavasana', 'Trikonasana', 'Paschimottanasana', 'Vajrasana'
  ] : [
    'Mass PT Exercise No 1', 'Mass PT Exercise No 2', 'Mass PT Exercise No 3', 
    'Mass PT Exercise No 4', 'Mass PT Exercise No 5', 'Freehand Warm-up', 
    'Jumping Jacks', 'Marching in Place'
  ];

  const handleSaveSessionLog = () => {
    const b = parseInt(boysCount) || 0;
    const g = parseInt(girlsCount) || 0;

    if (b === 0 && g === 0) {
      toast({ variant: 'destructive', title: 'त्रुटी', description: 'कृपया उपस्थित मुलांची किंवा मुलींची संख्या टाका.' });
      return;
    }

    const activityId = `act_${Date.now()}`;
    const newActivity = {
      id: activityId,
      date: sessionDate,
      type: gameType,
      boysCount: b.toString(),
      girlsCount: g.toString(),
      summary: selectedDrill + (sessionNotes ? ` (${sessionNotes})` : ''),
      createdAt: new Date().toISOString()
    };

    store.addActivity(newActivity);

    toast({
      title: "सराव नोंद यशस्वी! (Log Archived)",
      description: `${gameType} - ${selectedDrill} सराव अहवालात जोडला गेला. (मुले: ${b}, मुली: ${g})`,
      className: "bg-emerald-600 text-white font-bold"
    });

    setSessionNotes('');
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Redesigned Header Banner Tailored specifically for Yoga or Mass PT */}
      <div className={`p-8 md:p-12 rounded-[3.5rem] border-2 shadow-2xl text-white relative overflow-hidden ${
        isYoga 
          ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border-indigo-500/30' 
          : 'bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 border-teal-500/30'
      }`}>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 rounded-[1.8rem] flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-md shrink-0">
                {isYoga ? (
                  <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
                ) : (
                  <Activity className="w-10 h-10 text-emerald-300 animate-bounce" />
                )}
              </div>
              <div>
                <Badge className="bg-white/20 text-white border border-white/30 text-[9px] font-black uppercase px-3.5 py-1 mb-1.5 backdrop-blur-md">
                  Institutional Physical Education • {gameType}
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-white">
                  {isYoga ? 'योगासन व प्राणायाम हब' : 'सामूहिक पी.टी. व कवायत हब'}
                </h2>
                <p className="text-xs md:text-sm font-bold text-white/80 mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  {isYoga 
                    ? 'सर्व इयत्तांसाठी सूर्य नमस्कार, आसने व ध्यान प्राणायाम सराव' 
                    : 'शासकीय पी.टी. १ ते ५ कवायत प्रकार व सामूहिक व्यायाम'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setGuideModalName(isYoga ? 'Surya Namaskar' : 'Mass PT Exercise No 1')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase h-14 rounded-2xl px-6 shadow-xl active-scale flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" /> कसे करावे (Guide)
              </Button>
            </div>
          </div>

          {/* Navigation Bar Specifically Designed for Yoga & Mass PT Functions */}
          <div className="pt-2">
            <div className="inline-flex flex-wrap p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 gap-2">
              <Button
                variant={activeTab === 'session' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('session')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'session' ? "bg-white text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Calendar className="w-4 h-4" /> १. दैनंदिन सराव नोंद (Daily Session)
              </Button>
              <Button
                variant={activeTab === 'skills' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('skills')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'skills' ? "bg-white text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Users className="w-4 h-4" /> २. इयत्तानिहाय मूल्यमापन (Class Evaluation)
              </Button>
              <Button
                variant={activeTab === 'guide' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('guide')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'guide' ? "bg-white text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <BookOpen className="w-4 h-4" /> ३. सविस्तर मार्गदर्शक (All Guides)
              </Button>
              <Button
                variant={activeTab === 'report' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('report')}
                className={cn(
                  "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === 'report' ? "bg-white text-slate-950 shadow-lg font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <Printer className="w-4 h-4" /> ४. अहवाल व WhatsApp (Report)
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      </div>

      {/* TAB 1: DAILY PRACTICE LOG & QUICK ATTENDANCE ENTRY */}
      {activeTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
          {/* Practice Logger Card */}
          <Card className="lg:col-span-7 border-2 border-primary/20 rounded-[3rem] p-8 bg-white shadow-xl space-y-6">
            <div className="border-b pb-4">
              <Badge className="bg-primary text-white text-[9px] uppercase px-3 py-1 mb-1">
                {gameType} Daily Practice Entry
              </Badge>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                {isYoga ? 'आजचा योगासन सराव नोंदवा' : 'आजचा पी.टी. कवायत सराव नोंदवा'}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                सराव केलेला प्रकार निवडून उपस्थित मुलांची व मुलींची संख्या नोंदवा.
              </p>
            </div>

            <div className="space-y-5">
              {/* Select Drill / Asana */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-primary tracking-wider">
                  १. सराव केलेला प्रकार निवडा (Select {gameType} Activity)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {drillsList.map(drill => {
                    const isSel = selectedDrill === drill;
                    return (
                      <Button
                        key={drill}
                        type="button"
                        variant={isSel ? 'default' : 'outline'}
                        onClick={() => setSelectedDrill(drill)}
                        className={cn(
                          "h-12 px-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-between border-2",
                          isSel ? "bg-primary text-white shadow-md border-primary" : "bg-slate-50 text-slate-700 hover:bg-white"
                        )}
                      >
                        <span className="truncate">{drill}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuideModalName(drill);
                          }}
                          className="h-7 w-7 rounded-lg text-amber-500 hover:bg-amber-100/50 shrink-0"
                          title="कसे करावे (Guide)"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Counts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-600">तारीख (Date)</Label>
                  <Input 
                    type="date" 
                    value={sessionDate} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionDate(e.target.value)} 
                    className="h-12 rounded-xl border-2 font-bold text-xs" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-blue-700">उपस्थित मुले (Boys)</Label>
                  <Input 
                    type="number" 
                    value={boysCount} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBoysCount(e.target.value)} 
                    className="h-12 rounded-xl border-2 border-blue-200 font-black text-base text-blue-800 text-center" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-pink-700">उपस्थित मुली (Girls)</Label>
                  <Input 
                    type="number" 
                    value={girlsCount} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGirlsCount(e.target.value)} 
                    className="h-12 rounded-xl border-2 border-pink-200 font-black text-base text-pink-800 text-center" 
                  />
                </div>
              </div>

              {/* Session Remarks */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-600">विशेष टीप / शेरा (Remarks Optional)</Label>
                <Input 
                  value={sessionNotes} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionNotes(e.target.value)} 
                  placeholder="उदा. सर्व मुलांनी उत्कृष्ट सूर्य नमस्कार केले..." 
                  className="h-12 rounded-xl border-2 font-semibold text-xs" 
                />
              </div>

              <Button 
                onClick={handleSaveSessionLog} 
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl active-scale"
              >
                <Check className="w-5 h-5 mr-2" /> आजचा सराव अहवालात जतन करा (Save Session Log)
              </Button>
            </div>
          </Card>

          {/* Quick Guide & Drills Library */}
          <Card className="lg:col-span-5 border-2 border-slate-200 rounded-[3rem] p-8 bg-slate-50 shadow-lg space-y-6 flex flex-col">
            <div className="border-b pb-4">
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 bg-primary/5">
                Quick Guide Library
              </Badge>
              <h3 className="text-xl font-black text-primary uppercase mt-1">
                {isYoga ? 'योगासन प्रकार मार्गदर्शक' : 'कवायत व पी.टी. प्रकार सूची'}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                कसे करावे पाहण्यासाठी कोणत्याही प्रकारावर क्लिक करा.
              </p>
            </div>

            <ScrollArea className="flex-1 max-h-[420px] pr-2">
              <div className="space-y-3">
                {drillsList.map((item, idx) => (
                  <div 
                    key={item} 
                    onClick={() => setGuideModalName(item)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-200/80 hover:border-primary/40 cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-black text-xs text-primary uppercase group-hover:text-amber-600 transition-colors">
                          {item}
                        </h4>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                          {isYoga ? 'आसन / प्राणायाम' : 'कवायत प्रकार'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-600 group-hover:bg-amber-50 rounded-xl font-bold text-[10px] uppercase">
                      मार्गदर्शक <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* TAB 2: CLASS EVALUATION GRID */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SportsSkills store={store} preselectedSport={gameType} />
        </div>
      )}

      {/* TAB 3: ALL DEEP GUIDES & PROTOCOLS */}
      {activeTab === 'guide' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[2.5rem] border-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-primary uppercase flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-500" /> 
                {isYoga ? 'योगासन व प्राणायाम सविस्तर मार्गदर्शक पुस्तिका' : 'पी.टी. कवायत प्रकार १ ते ५ सविस्तर मार्गदर्शक'}
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                प्रत्येक प्रकाराचे वर्णन, कसे करावे (पायऱ्या), शारीरिक फायदे आणि आवश्यक खबरदारी
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drillsList.map((drillName) => {
              const guide = YOGA_PT_KNOWLEDGE_BASE[drillName];
              return (
                <Card 
                  key={drillName} 
                  onClick={() => setGuideModalName(drillName)}
                  className="border-2 rounded-[2.5rem] p-6 bg-white shadow-lg hover:border-primary/40 cursor-pointer transition-all hover:shadow-xl space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                        {isYoga ? 'Yoga Asana' : 'Mass PT'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 rounded-full group-hover:bg-amber-50">
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="text-lg font-black text-primary uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                      {guide?.nameMarathi || drillName}
                    </h4>

                    <p className="text-xs text-slate-600 font-semibold line-clamp-3 leading-relaxed">
                      {guide?.description || 'या प्रकाराचे सविस्तर प्रात्यक्षिक आणि मार्गदर्शक नियम...'}
                    </p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-[9.5px] font-extrabold text-amber-800 uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {guide?.duration || '५ मिनिटे'}
                    </span>
                    <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      कसे करावे <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY REPORT & WHATSAPP SHARE */}
      {activeTab === 'report' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <DailyReport store={store} section="sports" preselectedSport={gameType} />
        </div>
      )}

      {/* Deep Information Guide Modal */}
      <YogaPtGuideModal 
        guideName={guideModalName} 
        isOpen={!!guideModalName} 
        onClose={() => setGuideModalName(null)} 
      />
    </div>
  );
}
