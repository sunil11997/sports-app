"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  Unlock, 
  Delete, 
  ShieldCheck, 
  AlertCircle,
  Mail,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PasscodeLockProps {
  correctPasscode: string;
  onSuccess: () => void;
  onResetPin?: () => void;
  teacherEmail?: string | null;
  language?: 'English' | 'Marathi';
}

export function PasscodeLock({ 
  correctPasscode, 
  onSuccess, 
  onResetPin,
  teacherEmail,
  language = 'Marathi'
}: PasscodeLockProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, num];
      setPin(newPin);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin.join('') === correctPasscode) {
        onSuccess();
        toast({
          title: language === 'Marathi' ? "प्रवेश यशस्वी! 🔓" : "Hub Unlocked! 🔓",
          description: language === 'Marathi' ? "सुरक्षा पिन अचूक आहे." : "Access granted to Waghamba Hub.",
          className: "bg-emerald-600 text-white font-bold"
        });
      } else {
        setError(true);
        setPin([]);
        toast({
          variant: "destructive",
          title: language === 'Marathi' ? "चुकीचा पिन! ⚠️" : "Invalid Passcode",
          description: language === 'Marathi' ? "कृपया ४ अंकी अचूक पिन टाका." : "Please try again or use recovery options."
        });
      }
    }
  }, [pin, correctPasscode, onSuccess, toast, language]);

  if (showRecovery) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500 text-white">
        <div className="max-w-md w-full space-y-6 text-center bg-slate-900/90 p-8 rounded-[2.5rem] border border-white/10 shadow-3xl">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              {language === 'Marathi' ? "सुरक्षा पिन पुनर्प्राप्ती" : "Security Recovery"}
            </h2>
            <p className="text-xs font-medium text-slate-300 leading-relaxed">
              {language === 'Marathi'
                ? "जर तुम्ही पिन विसरला असाल, तर तुम्ही सेटिंग्जमध्ये जाऊन ईमेलद्वारे लॉगिन करून पिन रीसेट करू शकता."
                : "If you have forgotten your Hub PIN, verify your account credentials to clear or reset the passcode."}
            </p>
          </div>

          <div className="space-y-4 pt-2">
             <Card className="p-4 border border-white/10 bg-white/5 rounded-2xl flex items-center gap-4 text-left">
                <Mail className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="overflow-hidden">
                   <p className="text-[10px] font-black uppercase text-slate-400">
                     {language === 'Marathi' ? "नोंदणीकृत ईमेल" : "Registered Account"}
                   </p>
                   <p className="text-xs font-bold text-white truncate">{teacherEmail || 'Coach / Admin Account'}</p>
                </div>
             </Card>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {onResetPin && (
              <Button 
                onClick={() => {
                  onResetPin();
                  onSuccess();
                }}
                variant="destructive"
                className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-wider"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {language === 'Marathi' ? "पिन लॉक तात्पुरता काढा (Remove Lock)" : "Remove PIN Lock"}
              </Button>
            )}

            <Button 
              onClick={() => setShowRecovery(false)} 
              className="w-full h-12 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-wider"
            >
              {language === 'Marathi' ? "मागे जा (Back to PIN)" : "Back to PIN Entry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-500 text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xs w-full space-y-10 text-center">
        <div className="space-y-3">
          <div className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto transition-all duration-300 shadow-2xl border",
            error 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-shake" 
              : "bg-white/10 text-emerald-400 border-white/20"
          )}>
            {error ? <AlertCircle className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {language === 'Marathi' ? "ॲप पिन टाका" : "Enter Hub PIN"}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
            {language === 'Marathi' ? "शासकीय आश्रम शाळा वाघंबा" : "WGB Institutional Registry"}
          </p>
        </div>

        {/* 4-Digit Indicator Dots */}
        <div className="flex justify-center gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                pin[i] ? "bg-emerald-400 border-emerald-400 scale-125 shadow-lg shadow-emerald-400/50" : "bg-transparent border-white/30",
                error && "border-rose-500 bg-rose-500 shadow-rose-500/50"
              )}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n.toString())}
              className="w-16 h-16 rounded-full bg-white/10 text-2xl font-black text-white hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center mx-auto border border-white/10 shadow-lg backdrop-blur-md"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-full bg-white/10 text-2xl font-black text-white hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center mx-auto border border-white/10 shadow-lg backdrop-blur-md"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-rose-400 active:scale-90 transition-all mx-auto"
            title="Delete"
          >
            <Delete className="w-7 h-7" />
          </button>
        </div>

        <button 
          onClick={() => setShowRecovery(true)}
          className="text-xs font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {language === 'Marathi' ? "पिन विसरलात? (Forgot PIN)" : "Forgot PIN?"}
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.35s ease-in-out; }
      `}</style>
    </div>
  );
}

