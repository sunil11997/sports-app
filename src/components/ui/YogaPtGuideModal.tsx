"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
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
  Check
} from 'lucide-react';
import { getYogaPtGuide, YogaPtGuide } from '@/lib/yogaPtKnowledge';

interface YogaPtGuideModalProps {
  guideName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function YogaPtGuideModal({ guideName, isOpen, onClose }: YogaPtGuideModalProps) {
  if (!guideName) return null;

  const guide = getYogaPtGuide(guideName);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-r from-primary via-primary/95 to-accent p-8 text-white relative shrink-0">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
              {guide?.category === 'Yoga' ? (
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
              ) : (
                <Activity className="w-8 h-8 text-emerald-300 animate-bounce" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 border border-white/30 backdrop-blur-md">
                  {guide?.category || 'Deep Guide'} Protocol
                </Badge>
                {guide?.duration && (
                  <span className="text-[10px] font-bold text-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {guide.duration}
                  </span>
                )}
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">
                {guide?.nameMarathi || guideName}
              </DialogTitle>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                {guide?.name || guideName} • मार्गदर्शक व प्रात्यक्षिक माहिती
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none" />
        </DialogHeader>

        {/* Scrollable Content Body */}
        <ScrollArea className="flex-1 p-8 space-y-6">
          {!guide ? (
            <div className="py-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h4 className="font-black text-base text-primary uppercase">{guideName}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                या प्रकाराची सविस्तर प्रात्यक्षिक माहिती लवकरच अपडेट केली जाईल. (Detailed guide pending)
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Description Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-accent" /> स्वरूप व प्रास्ताविक (Overview)
                </span>
                <p className="text-slate-800 font-semibold leading-relaxed text-sm">
                  {guide.description}
                </p>
                {guide.countsOrRhythm && (
                  <div className="pt-2 border-t border-slate-200 mt-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-amber-900">ताल / अंक पद्धती: {guide.countsOrRhythm}</span>
                  </div>
                )}
              </div>

              {/* Step by Step How to Conduct */}
              <div className="space-y-3">
                <h4 className="font-black text-primary uppercase text-xs tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> कसे करावे? (Step-by-Step Instructions)
                </h4>
                <div className="space-y-2.5">
                  {guide.howToConduct.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs hover:border-primary/20 transition-all">
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

              {/* Benefits Grid */}
              <div className="space-y-3">
                <h4 className="font-black text-emerald-700 uppercase text-xs tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> शारीरिक व मानसिक फायदे (Benefits)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {guide.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/80 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-bold text-emerald-950 text-[11px] leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautions Box */}
              {guide.precautions && guide.precautions.length > 0 && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> खबरदारी व काळजी (Precautions)
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {guide.precautions.map((prec, idx) => (
                      <li key={idx} className="text-amber-950 font-semibold text-[11px] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        {prec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-5 bg-slate-100/80 border-t shrink-0 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
            Ashram Shala Coaching Module
          </span>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs h-11 px-8 rounded-xl shadow-md">
            समजले (Understood)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
