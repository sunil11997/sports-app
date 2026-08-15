"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Mail, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  Loader2, 
  PhoneCall, 
  Send, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { getRecaptchaVerifier, sendPhoneOtp } from '@/firebase/non-blocking-login';
import type { ConfirmationResult } from 'firebase/auth';

interface OtpLoginProps {
  onLoginSuccess: (identifier: string, type: 'phone' | 'email') => void;
  language?: 'English' | 'Marathi';
}

const translations = {
  English: {
    title: "OTP Verification",
    subtitle: "Sign in securely with your Mobile Number or Email OTP",
    mobileTab: "Mobile OTP",
    emailTab: "Email OTP",
    phonePlaceholder: "Enter 10-digit mobile number",
    emailPlaceholder: "Enter school or staff email address",
    sendOtp: "Send Verification OTP",
    sending: "Sending OTP...",
    verifyOtp: "Verify & Access Hub",
    verifying: "Verifying Code...",
    enterOtpHeader: "Enter 6-Digit OTP",
    sentTo: "We sent a 6-digit code to",
    changeContact: "Change Number / Email",
    resendOtp: "Resend OTP",
    resendIn: "Resend code in",
    sec: "s",
    demoNote: "Demo mode active: Use code 123456 or the code shown in notification toast.",
    invalidPhone: "Please enter a valid 10-digit mobile number.",
    invalidEmail: "Please enter a valid email address.",
    otpSentSuccess: "OTP sent successfully!",
    otpVerifiedSuccess: "Authentication successful! Accessing Hub...",
    invalidOtp: "Invalid OTP code. Please check and try again.",
    loggedAs: "Logged in as",
  },
  Marathi: {
    title: "OTP सत्यापन",
    subtitle: "तुमच्या मोबाईल नंबर किंवा ईमेल OTP द्वारे सुरक्षित लॉगिन करा",
    mobileTab: "मोबाईल OTP",
    emailTab: "ईमेल OTP",
    phonePlaceholder: "१० अंकी मोबाईल नंबर टाका",
    emailPlaceholder: "शाळा किंवा कर्मचारी ईमेल टाका",
    sendOtp: "OTP कोड पाठवा",
    sending: "OTP पाठवत आहे...",
    verifyOtp: "सत्यापित करा आणि हब मध्ये प्रवेश करा",
    verifying: "सत्यापित होत आहे...",
    enterOtpHeader: "६ अंकी OTP कोड प्रविष्ट करा",
    sentTo: "आम्ही ६ अंकी कोड पाठवला आहे:",
    changeContact: "नंबर / ईमेल बदला",
    resendOtp: "पुन्हा OTP पाठवा",
    resendIn: "पुन्हा OTP पाठवण्यासाठी",
    sec: "सेकंद",
    demoNote: "डेमो मोड सुरु आहे: १२३४५६ कोड किंवा स्क्रीन वरील संदेशातील कोड वापरा.",
    invalidPhone: "कृपया वैध १० अंकी मोबाईल नंबर टाका.",
    invalidEmail: "कृपया वैध ईमेल आयडी टाका.",
    otpSentSuccess: "OTP यशस्वीरित्या पाठवला गेला आहे!",
    otpVerifiedSuccess: "सत्यापन यशस्वी! हब मध्ये प्रवेश करत आहे...",
    invalidOtp: "अवैध OTP कोड. कृपया तपासा आणि पुन्हा प्रयत्न करा.",
    loggedAs: "या नावाने लॉगिन केले आहे",
  }
};

export function OtpLogin({ onLoginSuccess, language = 'English' }: OtpLoginProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const t = translations[language];

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'verified'>('input');
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState<string>("123456");
  
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Focus first input when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (mode === 'phone') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        toast({ title: t.invalidPhone, variant: "destructive" });
        return;
      }
    } else {
      if (!email || !email.includes('@') || !email.includes('.')) {
        toast({ title: t.invalidEmail, variant: "destructive" });
        return;
      }
    }

    setIsSending(true);

    // Generate random 6 digit code for demo / fallback
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOtp(code);

    try {
      if (mode === 'phone' && auth && typeof window !== 'undefined') {
        try {
          const verifier = getRecaptchaVerifier(auth, 'recaptcha-container');
          const fullPhone = `+91${phone.replace(/\D/g, '')}`;
          const result = await sendPhoneOtp(auth, fullPhone, verifier);
          setConfirmationResult(result);
          toast({
            title: t.otpSentSuccess,
            description: `${t.sentTo} +91 ${phone}`,
          });
        } catch (firebaseErr: any) {
          console.warn("Firebase Phone Auth fallback to demo OTP:", firebaseErr);
          toast({
            title: "Demo SMS Mode Active 📱",
            description: `OTP Code for +91 ${phone}: ${code}`,
            className: "bg-emerald-700 text-white font-bold"
          });
        }
      } else {
        // Email OTP simulation
        toast({
          title: "Demo Email Mode ✉️",
          description: `OTP Code for ${email}: ${code}`,
          className: "bg-emerald-700 text-white font-bold"
        });
      }

      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      toast({
        title: "Error Sending OTP",
        description: err.message || "Failed to dispatch OTP code. Please retry.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, idx) => {
        if (idx < 6) newOtp[idx] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast({ title: "Please enter complete 6-digit OTP code.", variant: "destructive" });
      return;
    }

    setIsVerifying(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(fullOtp);
      } else {
        // Check demo OTP or 123456
        if (fullOtp !== generatedDemoOtp && fullOtp !== "123456") {
          throw new Error("Invalid OTP");
        }
      }

      setStep('verified');
      toast({
        title: "OTP Verified! 🎉",
        description: t.otpVerifiedSuccess,
        className: "bg-emerald-600 text-white font-bold"
      });

      setTimeout(() => {
        const identifier = mode === 'phone' ? `+91 ${phone}` : email;
        onLoginSuccess(identifier, mode);
      }, 1000);

    } catch (err) {
      toast({
        title: "Verification Failed",
        description: t.invalidOtp,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-2xl border border-primary/10 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-3">
          {step === 'verified' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-primary" />
          )}
        </div>
        <h3 className="text-2xl font-display font-black uppercase text-primary tracking-tight">
          {t.title}
        </h3>
        <p className="text-xs font-bold text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-6 relative z-10">
          {/* Tabs: Mobile vs Email */}
          <div className="flex bg-muted/40 p-1.5 rounded-2xl border shadow-inner">
            <button
              onClick={() => setMode('phone')}
              className={cn(
                "flex-1 h-11 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                mode === 'phone' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Smartphone className="w-4 h-4" />
              {t.mobileTab}
            </button>
            <button
              onClick={() => setMode('email')}
              className={cn(
                "flex-1 h-11 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                mode === 'email' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Mail className="w-4 h-4" />
              {t.emailTab}
            </button>
          </div>

          {/* Form Input */}
          {mode === 'phone' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-accent-foreground" /> Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <div className="h-14 px-4 bg-muted/30 border-2 border-primary/10 rounded-2xl flex items-center justify-center font-black text-sm text-primary shadow-sm">
                  🇮🇳 +91
                </div>
                <Input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.phonePlaceholder}
                  className="h-14 rounded-2xl text-base font-bold tracking-wider border-2 border-primary/10 focus:border-primary px-4 bg-white/70"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-accent-foreground" /> Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="h-14 rounded-2xl text-sm font-bold border-2 border-primary/10 focus:border-primary px-4 bg-white/70"
              />
            </div>
          )}

          <div id="recaptcha-container" />

          <Button
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-display font-black uppercase tracking-widest shadow-xl text-sm active-scale transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                {t.sendOtp} <Send className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-muted-foreground flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>{t.demoNote}</span>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          <div className="text-center space-y-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
              {t.enterOtpHeader}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {t.sentTo} <strong className="text-primary">{mode === 'phone' ? `+91 ${phone}` : email}</strong>
            </p>
          </div>

          {/* 6 Digit Input Grid */}
          <div className="flex justify-center gap-2 sm:gap-3 my-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-black rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-2 ring-primary/20 p-0 shadow-sm bg-white"
              />
            ))}
          </div>

          {/* Verification Actions */}
          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-display font-black uppercase tracking-widest shadow-xl text-sm active-scale transition-all"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.verifying}
              </>
            ) : (
              <>
                {t.verifyOtp} <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Resend & Back controls */}
          <div className="flex items-center justify-between text-xs pt-2">
            <button
              onClick={() => {
                setStep('input');
                setOtp(Array(6).fill(""));
              }}
              className="text-muted-foreground hover:text-primary font-black uppercase text-[10px] tracking-wider transition-colors"
            >
              ← {t.changeContact}
            </button>

            {resendTimer > 0 ? (
              <span className="text-[11px] font-bold text-muted-foreground">
                {t.resendIn} {resendTimer}{t.sec}
              </span>
            ) : (
              <button
                onClick={handleSendOtp}
                className="text-primary font-black uppercase text-[10px] tracking-wider hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> {t.resendOtp}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'verified' && (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-display font-black uppercase text-emerald-700">Verified Successfully</h4>
            <p className="text-xs font-bold text-muted-foreground">
              {t.loggedAs}: <span className="text-primary">{mode === 'phone' ? `+91 ${phone}` : email}</span>
            </p>
          </div>
        </div>
      )}

    </Card>
  );
}
