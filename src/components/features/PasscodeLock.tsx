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
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PasscodeLockProps {
  correctPasscode: string;
  onSuccess: () => void;
  teacherEmail?: string | null;
}

export function PasscodeLock({ correctPasscode, onSuccess, teacherEmail }: PasscodeLockProps) {
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
      } else {
        setError(true);
        setPin([]);
        toast({
          variant: "destructive",
          title: "Invalid Passcode",
          description: "Please try again or use recovery options."
        });
      }
    }
  }, [pin, correctPasscode, onSuccess, toast]);

  if (showRecovery) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Security Recovery</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              If you have forgotten your institutional PIN, please use your registered credentials to reset.
            </p>
          </div>

          <div className="space-y-4 pt-4">
             <Card className="p-6 border-2 border-primary/5 bg-muted/30 rounded-2xl flex items-center gap-4 text-left">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                   <p className="text-[10px] font-black uppercase text-muted-foreground">Recovery Email</p>
                   <p className="text-sm font-bold text-primary truncate max-w-[200px]">{teacherEmail || 'No email linked'}</p>
                </div>
             </Card>
             <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed px-4">
               Sign in with your Email & Password in the Settings menu to clear or update your local passcode.
             </p>
          </div>

          <Button 
            onClick={() => setShowRecovery(false)} 
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest"
          >
            Back to PIN Entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-xs w-full space-y-12 text-center">
        <div className="space-y-4">
          <div className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto transition-all duration-300",
            error ? "bg-destructive/10 text-destructive animate-shake" : "bg-primary/5 text-primary"
          )}>
            {error ? <AlertCircle className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Enter Hub PIN</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">WGB Institutional Registry</p>
        </div>

        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                pin[i] ? "bg-primary border-primary scale-125" : "bg-transparent border-primary/20",
                error && "border-destructive bg-destructive"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n.toString())}
              className="w-16 h-16 rounded-full bg-muted/30 text-xl font-black text-primary hover:bg-primary/10 active:scale-90 transition-all flex items-center justify-center mx-auto shadow-sm"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-full bg-muted/30 text-xl font-black text-primary hover:bg-primary/10 active:scale-90 transition-all flex items-center justify-center mx-auto shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-primary/40 hover:text-destructive transition-colors mx-auto"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={() => setShowRecovery(true)}
          className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          Forgot PIN?
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
