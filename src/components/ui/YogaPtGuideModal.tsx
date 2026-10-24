"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Zap,
  Check,
  Target,
  Trophy,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  Scale
} from 'lucide-react';
import { getYogaPtGuide } from '@/lib/yogaPtKnowledge';
import { 
  STRUCTURED_COACHING_DRILLS, 
  OFFICIAL_SPORTS_RULES, 
  type StructuredDrill,
  type SportOfficialRules
} from '@/data/sportCoachingKnowledge';

interface YogaPtGuideModalProps {
  guideName: string | null;
  sport?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function YogaPtGuideModal({ guideName, sport, isOpen, onClose }: YogaPtGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'drill' | 'rules'>('drill');
  if (!guideName) return null;

  // 1. Check for Yoga / PT Mass specific guide
  const yogaGuide = getYogaPtGuide(guideName);

  // 2. Check for Structured Coaching Drill
  let structuredDrill: StructuredDrill | null = null;
  const targetSport = sport || (guideName.includes("Kabaddi") ? "Kabaddi" : guideName.includes("Kho") ? "Kho Kho" : guideName.includes("Volley") ? "Volleyball" : null);

  if (targetSport && STRUCTURED_COACHING_DRILLS[targetSport]) {
    structuredDrill = STRUCTURED_COACHING_DRILLS[targetSport].find(
      (d) =>
        d.nameEn.toLowerCase() === guideName.toLowerCase() ||
        d.nameMr.toLowerCase() === guideName.toLowerCase() ||
        guideName.toLowerCase().includes(d.nameEn.toLowerCase()) ||
        d.nameEn.toLowerCase().includes(guideName.toLowerCase())
    ) || null;
  }

  // Fallback search across all sports if not found
  if (!structuredDrill) {
    for (const s of Object.keys(STRUCTURED_COACHING_DRILLS)) {
      const match = STRUCTURED_COACHING_DRILLS[s].find(
        (d) =>
          d.nameEn.toLowerCase() === guideName.toLowerCase() ||
          guideName.toLowerCase().includes(d.nameEn.toLowerCase()) ||
          d.nameEn.toLowerCase().includes(guideName.toLowerCase())
      );
      if (match) {
        structuredDrill = match;
        break;
      }
    }
  }

  // 3. Official Rules for the sport
  const officialRuleKey = targetSport || (structuredDrill ? structuredDrill.sport : null);
  const officialRules: SportOfficialRules | null = officialRuleKey && OFFICIAL_SPORTS_RULES[officialRuleKey] 
    ? OFFICIAL_SPORTS_RULES[officialRuleKey] 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-r from-primary via-primary/95 to-slate-900 p-8 text-white relative shrink-0">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl shrink-0">
              {yogaGuide?.category === 'Yoga' ? (
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
              ) : structuredDrill ? (
                <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
              ) : (
                <Activity className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 border border-white/30 backdrop-blur-md">
                  {structuredDrill ? `${structuredDrill.sport} • ${structuredDrill.category}` : yogaGuide?.category || 'Sports Drill'} Protocol
                </Badge>
                {structuredDrill && (
                  <Badge variant="outline" className="text-amber-200 border-amber-300/40 text-[9px] font-bold">
                    SGFI / Federation Standard
                  </Badge>
                )}
                {(structuredDrill?.durationMin || yogaGuide?.duration) && (
                  <span className="text-[10px] font-bold text-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {structuredDrill ? `${structuredDrill.durationMin} Min` : yogaGuide?.duration}
                  </span>
                )}
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white truncate">
                {structuredDrill ? structuredDrill.nameMr : yogaGuide?.nameMarathi || guideName}
              </DialogTitle>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest truncate">
                {structuredDrill ? structuredDrill.nameEn : yogaGuide?.name || guideName} • राष्ट्रीय क्रीडा मार्गदर्शन
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs if Official Rules Exist */}
          {officialRules && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 relative z-10">
              <button
                type="button"
                onClick={() => setActiveTab('drill')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'drill' 
                    ? 'bg-amber-400 text-slate-950 shadow-md' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                🎯 सराव पद्धती (Drill Specs)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'rules' 
                    ? 'bg-amber-400 text-slate-950 shadow-md' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> अधिकृत नियम (SGFI Rules)
              </button>
            </div>
          )}

          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none" />
        </DialogHeader>

        {/* Scrollable Content Body */}
        <ScrollArea className="flex-1 p-6 md:p-8 space-y-6">
          {activeTab === 'rules' && officialRules ? (
            <div className="space-y-6 text-xs animate-in fade-in duration-300">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-600" /> नियामक संस्था व स्वरूप (Governing Body)
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {officialRules.governingBody}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="font-black text-muted-foreground uppercase text-[9px] block">मैदान माप (Dimensions):</span>
                    <span className="font-bold text-slate-800">{officialRules.courtDimensions}</span>
                  </div>
                  <div>
                    <span className="font-black text-muted-foreground uppercase text-[9px] block">संघातील खेळाडू (Team Size):</span>
                    <span className="font-bold text-slate-800">{officialRules.teamSize}</span>
                  </div>
                  <div>
                    <span className="font-black text-muted-foreground uppercase text-[9px] block">कालावधी (Match Duration):</span>
                    <span className="font-bold text-slate-800">{officialRules.matchDuration}</span>
                  </div>
                  <div>
                    <span className="font-black text-muted-foreground uppercase text-[9px] block">वयोमर्यादा संदर्भ (Age Cutoff):</span>
                    <span className="font-bold text-slate-800">{officialRules.officialAgeCutoff}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Specifications */}
              <div className="space-y-3">
                <h4 className="font-black text-primary uppercase text-xs tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> अधिकृत क्रीडा साहित्य (Equipment Specifications)
                </h4>
                <div className="space-y-2">
                  {officialRules.equipmentSpecifications.map((eq, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="font-bold text-slate-800 text-[11px]">{eq}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Rules */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" /> महत्वाचे अधिकृत नियम (Official Rules)
                </h4>
                <div className="space-y-2">
                  {officialRules.officialRules.map((rule, i) => (
                    <div key={i} className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p className="font-bold text-amber-950 text-[11px] leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Recommendations */}
              <div className="space-y-3">
                <h4 className="font-black text-emerald-800 uppercase text-xs tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" /> रणनीती व सल्ला (Tactical Recommendations)
                </h4>
                <div className="space-y-2">
                  {officialRules.tacticalRecommendations.map((tac, i) => (
                    <div key={i} className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className="font-bold text-emerald-950 text-[11px] leading-relaxed">{tac}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : structuredDrill ? (
            /* Structured Drill Card View */
            <div className="space-y-6 text-xs animate-in fade-in duration-300">
              {/* Setup & Objective */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-accent" /> उद्दिष्ट व मैदान मांडणी (Objective & Setup)
                </span>
                <p className="text-slate-900 font-extrabold text-sm leading-relaxed">
                  {structuredDrill.objective}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
                  <strong className="text-primary font-black uppercase text-[10px] block mb-1">मैदान मांडणी (Setup):</strong>
                  <span className="font-semibold text-slate-700">{structuredDrill.setup}</span>
                </div>
                <div className="flex items-center gap-4 pt-2 text-[11px] font-bold text-slate-800">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> कालावधी: {structuredDrill.durationMin} मिनिटे</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-rose-600" /> आवर्तने: {structuredDrill.repetitions}</span>
                  <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-emerald-600" /> विश्रांती: {structuredDrill.restSeconds}s</span>
                </div>
              </div>

              {/* Coaching Cues */}
              <div className="space-y-3">
                <h4 className="font-black text-primary uppercase text-xs tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> प्रशिक्षक सूचना (Coaching Cues)
                </h4>
                <div className="space-y-2">
                  {structuredDrill.coachingCues.map((cue, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-bold text-slate-800 text-xs leading-relaxed pt-0.5">
                        {cue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              {structuredDrill.commonMistakes && structuredDrill.commonMistakes.length > 0 && (
                <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 space-y-2">
                  <h4 className="font-black text-rose-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> खेळाडूंच्या सामान्य चुका (Common Mistakes to Avoid)
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {structuredDrill.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-rose-950 font-bold text-[11px] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progression & Regression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1.5">
                  <h5 className="font-black text-amber-900 uppercase text-[10px] flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" /> सराव कठीण करणे (Progression)
                  </h5>
                  <p className="font-bold text-amber-950 text-[11px] leading-relaxed">
                    {structuredDrill.progression}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-1.5">
                  <h5 className="font-black text-blue-900 uppercase text-[10px] flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-blue-700" /> सराव सोपा करणे (Regression)
                  </h5>
                  <p className="font-bold text-blue-950 text-[11px] leading-relaxed">
                    {structuredDrill.regression}
                  </p>
                </div>
              </div>

              {/* Safety Precautions & Success Criteria */}
              <div className="space-y-3">
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                  <h4 className="font-black text-emerald-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> सुरक्षा व इजा प्रतिबंध (Safety & Precautions)
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {structuredDrill.safetyPrecautions.map((safe, idx) => (
                      <li key={idx} className="text-emerald-950 font-bold text-[11px] flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{safe}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black text-primary uppercase text-[10px] tracking-wider">
                      यशस्वी निकष (Measurable Success Criteria)
                    </h5>
                    <p className="font-extrabold text-slate-800 text-[11px] mt-0.5">
                      {structuredDrill.successCriteria}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : yogaGuide ? (
            /* Yoga / PT Mass Standard Guide */
            <div className="space-y-6 text-xs animate-in fade-in duration-300">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-accent" /> स्वरूप व प्रास्ताविक (Overview)
                </span>
                <p className="text-slate-800 font-semibold leading-relaxed text-sm">
                  {yogaGuide.description}
                </p>
                {yogaGuide.countsOrRhythm && (
                  <div className="pt-2 border-t border-slate-200 mt-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-amber-900">ताल / अंक पद्धती: {yogaGuide.countsOrRhythm}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-primary uppercase text-xs tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> कसे करावे? (Step-by-Step Instructions)
                </h4>
                <div className="space-y-2.5">
                  {yogaGuide.howToConduct.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-slate-800 text-xs leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-emerald-700 uppercase text-xs tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> शारीरिक व मानसिक फायदे (Benefits)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {yogaGuide.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/80 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-bold text-emerald-950 text-[11px] leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {yogaGuide.precautions && yogaGuide.precautions.length > 0 && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> खबरदारी व काळजी (Precautions)
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {yogaGuide.precautions.map((prec, idx) => (
                      <li key={idx} className="text-amber-950 font-semibold text-[11px] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        {prec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h4 className="font-black text-base text-primary uppercase">{guideName}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                या प्रकाराची सविस्तर प्रात्यक्षिक माहिती लवकरच अपडेट केली जाईल. (Detailed guide pending)
              </p>
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-5 bg-slate-100/80 border-t shrink-0 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
            National Coaching & Rules Registry
          </span>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs h-11 px-8 rounded-xl shadow-md">
            समजले (Understood)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
