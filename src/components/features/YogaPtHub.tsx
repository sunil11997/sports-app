"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Activity, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  BookOpen, 
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Check,
  ChevronRight,
  Archive,
  Flame,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { YOGA_PT_KNOWLEDGE_BASE, YogaPtGuide } from '@/lib/yogaPtKnowledge';
import { HealthIncidents } from './HealthIncidents';
import { format } from 'date-fns';

interface YogaPtHubProps {
  store: any;
  gameType: 'Yoga' | 'PT Mass';
  onBack?: () => void;
}

const ALL_12_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function YogaPtHub({ store, gameType, onBack }: YogaPtHubProps) {
  const { toast } = useToast();
  // ONLY TWO TABS: 'drills' and 'injury'
  const [activeMainTab, setActiveMainTab] = useState<'drills' | 'injury'>('drills');
  
  const isYoga = gameType === 'Yoga';

  // Full Drills Lists
  const drillsList = isYoga ? [
    'Surya Namaskar', 'Tadasana', 'Vrikshasana', 'Bhujangasana', 'Padmasana',
    'Anulom Vilom', 'Kapalbhati', 'Shavasana', 'Trikonasana', 'Dhanurasana', 
    'Paschimottanasana', 'Vajrasana'
  ] : [
    'Mass PT Exercise No 1', 'Mass PT Exercise No 2', 'Mass PT Exercise No 3', 
    'Mass PT Exercise No 4', 'Mass PT Exercise No 5', 'Freehand Warm-up', 
    'Jumping Jacks', 'Arm Swings', 'Trunk Bending', 'Marching in Place',
    'Deep Breathing PT', 'Cool-down Stretch Routine'
  ];

  // Currently Selected Skill / Drill
  const [selectedSkill, setSelectedSkill] = useState<string>(drillsList[0]);

  // Multiple Classes Selector State (1st to 12th)
  const [selectedClasses, setSelectedClasses] = useState<string[]>(ALL_12_CLASSES);

  // Session Attendance & Archive Form State
  const [sessionDate, setSessionDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [boysCount, setBoysCount] = useState<string>('30');
  const [girlsCount, setGirlsCount] = useState<string>('25');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isArchiving, setIsArchiving] = useState(false);

  const currentGuide: YogaPtGuide | undefined = YOGA_PT_KNOWLEDGE_BASE[selectedSkill];

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const selectAllClasses = () => setSelectedClasses(ALL_12_CLASSES);
  const clearAllClasses = () => setSelectedClasses([]);

  // AUTOMATIC ARCHIVE FUNCTION
  const handleAutoArchive = () => {
    const b = parseInt(boysCount) || 0;
    const g = parseInt(girlsCount) || 0;

    if (selectedClasses.length === 0) {
      toast({ variant: 'destructive', title: 'इयत्ता निवडा', description: 'कृपया सराव केलेल्या इयत्ता (१ ली ते १२ वी) निवडा.' });
      return;
    }

    if (b === 0 && g === 0) {
      toast({ variant: 'destructive', title: 'संख्या टाका', description: 'कृपया उपस्थित मुलांची किंवा मुलींची संख्या टाका.' });
      return;
    }

    setIsArchiving(true);

    const activityId = `act_${Date.now()}`;
    const classSummaryStr = `[इयत्ता: ${selectedClasses.join(', ')} वी] ${selectedSkill}`;
    
    const newActivity = {
      id: activityId,
      date: sessionDate,
      type: gameType,
      boysCount: b.toString(),
      girlsCount: g.toString(),
      summary: classSummaryStr + (sessionNotes ? ` - ${sessionNotes}` : ''),
      createdAt: new Date().toISOString()
    };

    // 1. Add to store activities (Auto-Archived into Daily Report)
    store.addActivity(newActivity);

    // 2. Auto-Archive completion for players in selected classes
    const playersInClasses = (store.data.players || []).filter((p: any) => 
      selectedClasses.includes((p.std || "").toString().trim())
    );

    const drillKey = `${gameType}_${selectedSkill}`;
    playersInClasses.forEach((player: any) => {
      store.setDrillCompletion(drillKey, player.id, true, {
        sportName: gameType,
        drillName: selectedSkill,
        gender: player.gender || 'Male',
        std: player.std || ''
      });
    });

    setIsArchiving(false);

    toast({
      title: "ऑटो-अर्काईव्ह पूर्ण! (Automatic Archive Successful)",
      description: `${gameType} - ${selectedSkill} सत्र इयत्ता ${selectedClasses.join(', ')} साठी दैनिक अहवालात ऑटो-अर्काईव्ह केले गेले. (एकूण: ${b + g} विद्यार्थी)`,
      className: "bg-emerald-600 text-white font-bold"
    });

    setSessionNotes('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Executive Header Banner */}
      <div className={`p-8 md:p-10 rounded-[3.5rem] border-2 shadow-2xl text-white relative overflow-hidden ${
        isYoga 
          ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border-indigo-500/30' 
          : 'bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 border-teal-500/30'
      }`}>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 bg-white/10 rounded-[1.5rem] flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-md shrink-0">
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
                  {isYoga ? 'योगासन व प्राणायाम सराव' : 'सामूहिक पी.टी. व कवायत सराव'}
                </h2>
                <p className="text-xs md:text-sm font-bold text-white/80 mt-1.5">
                  {isYoga 
                    ? 'सर्व १२ आसने, प्रात्यक्षिक माहिती, इयत्ता १ ते १२ वी निवड व ऑटो-अर्काईव्ह' 
                    : 'शासकीय पी.टी. १ ते ५ कवायत प्रकार, प्रात्यक्षिक पायऱ्या व ऑटो-अर्काईव्ह'}
                </p>
              </div>
            </div>
          </div>

          {/* MAIN TWO TABS ONLY: DRILLS & INJURY HUB */}
          <div className="pt-2">
            <div className="inline-flex p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 gap-2">
              <Button
                variant={activeMainTab === 'drills' ? 'default' : 'ghost'}
                onClick={() => setActiveMainTab('drills')}
                className={cn(
                  "h-13 px-8 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5",
                  activeMainTab === 'drills' ? "bg-white text-slate-950 shadow-xl font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                {isYoga ? <Sparkles className="w-4 h-4 text-amber-500" /> : <Activity className="w-4 h-4 text-emerald-500" />}
                १. {isYoga ? 'योगासन ड्रील्स व सराव (Yoga Drills)' : 'पी.टी. कवायत ड्रील्स व सराव (Mass PT Drills)'}
              </Button>

              <Button
                variant={activeMainTab === 'injury' ? 'default' : 'ghost'}
                onClick={() => setActiveMainTab('injury')}
                className={cn(
                  "h-13 px-8 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5",
                  activeMainTab === 'injury' ? "bg-red-600 text-white shadow-xl font-black scale-105" : "text-white hover:bg-white/10"
                )}
              >
                <ShieldAlert className="w-4 h-4" /> २. इंज्युरी हब व मेडिकल लॉग (Injury Hub)
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      </div>

      {/* TAB 1: DRILLS & PRACTICE SECTION WITH AUTOMATIC ARCHIVE */}
      {activeMainTab === 'drills' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* SECTION A: DRILLS LIST SELECTOR */}
          <Card className="border-2 border-primary/20 rounded-[3rem] p-6 md:p-8 bg-white shadow-xl space-y-4">
            <div>
              <Badge className="bg-primary text-white text-[9px] uppercase px-3 py-1 mb-1">
                Step 1: Choose {gameType} Skill
              </Badge>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                {isYoga ? 'योगासन प्रकार निवडा (Select Yoga Asana)' : 'सामूहिक पी.टी. कवायत प्रकार निवडा (Select Mass PT Exercise)'}
              </h3>
            </div>

            <ScrollArea className="w-full pb-2">
              <div className="flex gap-3 shrink-0 py-1">
                {drillsList.map((skillName) => {
                  const isSelected = selectedSkill === skillName;
                  return (
                    <Button
                      key={skillName}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => setSelectedSkill(skillName)}
                      className={cn(
                        "h-14 px-6 rounded-2xl font-black text-xs uppercase transition-all shrink-0 border-2 flex items-center gap-2",
                        isSelected 
                          ? "bg-primary text-white shadow-lg border-primary scale-105" 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/40"
                      )}
                    >
                      {isYoga ? <Sparkles className="w-4 h-4 text-amber-400" /> : <Activity className="w-4 h-4 text-emerald-500" />}
                      {skillName}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>

          {/* SECTION B: DEEP SKILL INFORMATION CARD (AUTOMATICALLY SHOWN FOR SELECTED SKILL) */}
          <Card className="border-2 border-slate-200 rounded-[3rem] p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-amber-500/5 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-3">
              <div>
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[9.5px] font-black uppercase px-3 py-0.5">
                  Deep Skill Protocol Guide
                </Badge>
                <h3 className="text-2xl font-black text-primary uppercase mt-1">
                  {currentGuide?.nameMarathi || selectedSkill}
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  {currentGuide?.name || selectedSkill} • सविस्तर माहिती व प्रात्यक्षिक पायऱ्या
                </p>
              </div>
              {currentGuide?.duration && (
                <Badge className="bg-slate-900 text-amber-300 font-black text-xs px-4 py-2 self-start md:self-auto flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> वेळ / ताल: {currentGuide.duration}
                </Badge>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
              {/* Description */}
              <div className="md:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <span className="text-[9.5px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" /> स्वरूप व प्रास्ताविक (Overview)
                </span>
                <p className="text-slate-800 font-semibold text-sm leading-relaxed">
                  {currentGuide?.description || 'या प्रकाराचे सविस्तर प्रात्यक्षिक आणि मार्गदर्शक नियम...'}
                </p>
                {currentGuide?.countsOrRhythm && (
                  <div className="pt-2 border-t border-slate-100 text-amber-900 font-extrabold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" /> ताल / अंक पद्धती: {currentGuide.countsOrRhythm}
                  </div>
                )}
              </div>

              {/* Step-by-Step How to Conduct */}
              <div className="md:col-span-7 space-y-3">
                <h4 className="font-black text-primary uppercase text-xs tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> कसे करावे? (Step-by-Step Instructions)
                </h4>
                <div className="space-y-2">
                  {(currentGuide?.howToConduct || ['सावधान स्थितीत उभे राहा.', 'श्वास घेत हालचाल करा.', 'मूळ स्थितीत या.']).map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-slate-800 text-xs leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits & Precautions */}
              <div className="md:col-span-5 space-y-4">
                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-black text-emerald-800 uppercase text-xs tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> शारीरिक फायदे (Health Benefits)
                  </h4>
                  <div className="space-y-1.5">
                    {(currentGuide?.benefits || ['शरीराची लवचिकता वाढते.', 'ताणतणाव कमी होतो.']).map((b, idx) => (
                      <div key={idx} className="bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-[11px] flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                {currentGuide?.precautions && currentGuide.precautions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-black text-amber-900 uppercase text-xs tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> खबरदारी व काळजी (Precautions)
                    </h4>
                    <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 space-y-1 text-amber-950 text-[11px] font-semibold">
                      {currentGuide.precautions.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" /> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* SECTION C: CHOOSE MULTIPLE CLASSES (1ST TO 12TH) */}
          <Card className="border-2 border-primary/20 rounded-[3rem] p-6 md:p-8 bg-white shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <Badge className="bg-primary text-white text-[9px] uppercase px-3 py-1 mb-1">
                  Step 2: Choose Multiple Classes (इयत्ता १ ली ते १२ वी)
                </Badge>
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" /> इयत्ता निवडा ({selectedClasses.length} इयत्ता निवडल्या)
                </h3>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  एकापेक्षा जास्त इयत्ता निवडून सराव एकाच वेळी जतन करा.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllClasses} 
                  className="text-[10px] font-black uppercase rounded-xl border-primary/20 hover:bg-primary/10 h-10 px-4"
                >
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> सर्व इयत्ता (Select All 1-12)
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllClasses} 
                  className="text-[10px] font-black uppercase rounded-xl text-slate-500 hover:bg-slate-100 h-10 px-3"
                >
                  क्लियर (Clear)
                </Button>
              </div>
            </div>

            {/* Class Chips Grid (1st to 12th) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ALL_12_CLASSES.map(cls => {
                const isSelected = selectedClasses.includes(cls);
                return (
                  <Button
                    key={cls}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleClass(cls)}
                    className={cn(
                      "h-12 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border-2",
                      isSelected 
                        ? "bg-primary text-white shadow-md border-primary scale-105" 
                        : "bg-white text-slate-700 border-slate-200 hover:border-primary/40"
                    )}
                  >
                    <span className={cn("w-4 h-4 rounded-md flex items-center justify-center border text-[9px]", isSelected ? "bg-white text-primary border-white" : "border-slate-300")}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    इयत्ता {cls} वी (Std {cls})
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* SECTION D: AUTOMATIC ARCHIVE FORM */}
          <Card className="border-2 border-emerald-500/30 rounded-[3rem] p-6 md:p-8 bg-gradient-to-r from-emerald-500/5 via-white to-teal-500/5 shadow-xl space-y-6">
            <div className="border-b pb-4">
              <Badge className="bg-emerald-600 text-white text-[9px] uppercase px-3 py-1 mb-1">
                Step 3: Automatic Archive to Daily Report
              </Badge>
              <h3 className="text-2xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
                <Archive className="w-6 h-6 text-emerald-600" /> सराव उपस्थिती व ऑटो-अर्काईव्ह (Auto-Archive Log)
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                बटणावर क्लिक करताच सराव सत्र दैनिक अहवालात (Daily Report) आपोआप जतन होईल.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-700">तारीख (Session Date)</Label>
                <Input 
                  type="date" 
                  value={sessionDate} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionDate(e.target.value)} 
                  className="h-12 rounded-xl border-2 font-bold text-xs bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-blue-700">उपस्थित मुले (Boys Count)</Label>
                <Input 
                  type="number" 
                  value={boysCount} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBoysCount(e.target.value)} 
                  className="h-12 rounded-xl border-2 border-blue-200 font-black text-lg text-blue-800 text-center bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-pink-700">उपस्थित मुली (Girls Count)</Label>
                <Input 
                  type="number" 
                  value={girlsCount} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGirlsCount(e.target.value)} 
                  className="h-12 rounded-xl border-2 border-pink-200 font-black text-lg text-pink-800 text-center bg-white" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-700">विशेष टीप / शेरा (Remarks Optional)</Label>
              <Input 
                value={sessionNotes} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionNotes(e.target.value)} 
                placeholder="उदा. इयत्ता ५ वी ते १० वी मधील सर्व मुलांनी उत्कृष्ट सराव पूर्ण केला..." 
                className="h-12 rounded-xl border-2 font-semibold text-xs bg-white" 
              />
            </div>

            <Button 
              onClick={handleAutoArchive} 
              disabled={isArchiving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active-scale transition-all flex items-center justify-center gap-2"
            >
              <Archive className="w-5 h-5" /> सराव पूर्ण करा व आपोआप जतन (COMPLETE & AUTOMATIC ARCHIVE)
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 2: INJURY HUB & MEDICAL LOGS */}
      {activeMainTab === 'injury' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <HealthIncidents store={store} section="sports" preselectedSport={gameType} />
        </div>
      )}
    </div>
  );
}
