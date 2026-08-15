"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  PhoneCall, 
  Send, 
  RefreshCw,
  Lock,
  AlertCircle,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { 
  getRecaptchaVerifier, 
  sendPhoneOtp, 
  verifyAndLinkPhoneOtp, 
  initiateGoogleSignIn 
} from '@/firebase/non-blocking-login';
import type { ConfirmationResult } from 'firebase/auth';

interface OtpLoginProps {
  onLoginSuccess: (identifier: string, type: 'phone' | 'email') => void;
  language?: 'English' | 'Marathi';
}

const translations = {
  English: {
    title: "Official Secure Verification",
    subtitle: "Verify your identity via Google 2-Step OTP or Mobile SMS OTP to protect sensitive school records",
    googleBtn: "Sign In with Google Account",
    googleDesc: "Google sends authentic 2-Step verification OTP / phone prompt directly to your phone. 100% reliable & keeps all your existing data.",
    googleVerifying: "Verifying with Google...",
    orDivider: "OR VERIFY WITH MOBILE SMS OTP",
    mobileTab: "Mobile Number (SMS)",
    phonePlaceholder: "Enter 10-digit mobile number",
    sendOtp: "Send SMS Verification OTP",
    sending: "Dispatching SMS OTP...",
    verifyOtp: "Verify OTP & Access Hub",
    verifying: "Verifying Code...",
    enterOtpHeader: "Enter 6-Digit SMS OTP",
    sentTo: "We sent a 6-digit SMS verification code to",
    changeContact: "Change Number",
    resendOtp: "Resend SMS OTP",
    resendIn: "Resend code in",
    sec: "s",
    securityNote: "Your student rosters, fitness assessments, and historical records remain 100% private and fully preserved upon verification.",
    invalidPhone: "Please enter a valid 10-digit mobile number.",
    otpSentSuccess: "SMS OTP sent successfully!",
    otpSentDesc: "Please check your SMS inbox and enter the 6-digit verification code.",
    otpVerifiedSuccess: "Identity verified successfully! Accessing Hub...",
    invalidOtp: "Invalid OTP code. Please enter the correct 6-digit code received via SMS.",
    loggedAs: "Logged in as",
    authError: "Failed to dispatch SMS OTP. Please verify your phone number and try again.",
    quotaError: "SMS verification limit reached. Please use Google Verification above or contact administrator.",
    captchaError: "reCAPTCHA validation failed. Please retry.",
  },
  Marathi: {
    title: "अधिकृत सुरक्षित सत्यापन",
    subtitle: "विद्यार्थी व आरोग्य माहितीच्या सुरक्षेसाठी गुगल २-स्टेप OTP किंवा मोबाईल OTP द्वारे लॉगिन करा",
    googleBtn: "गुगल खात्याद्वारे त्वरित लॉगिन करा",
    googleDesc: "गुगल थेट तुमच्या मोबाईलवर खरा २-स्टेप OTP / सुरक्षा संदेश पाठवते. तुमचा सर्व जुना डेटा १००% सुरक्षित राहतो.",
    googleVerifying: "गुगल सत्यापन होत आहे...",
    orDivider: "किंवा मोबाईल SMS OTP द्वारे लॉगिन करा",
    mobileTab: "मोबाईल नंबर (SMS)",
    phonePlaceholder: "१० अंकी मोबाईल नंबर टाका",
    sendOtp: "SMS द्वारे OTP पाठवा",
    sending: "SMS द्वारे OTP पाठवत आहे...",
    verifyOtp: "OTP सत्यापित करा आणि हब उघडा",
    verifying: "सत्यापित होत आहे...",
    enterOtpHeader: "६ अंकी SMS OTP कोड टाका",
    sentTo: "आम्ही ६ अंकी पडताळणी कोड SMS द्वारे पाठवला आहे:",
    changeContact: "नंबर बदला",
    resendOtp: "पुन्हा SMS पाठवा",
    resendIn: "पुन्हा OTP पाठवण्यासाठी",
    sec: "सेकंद",
    securityNote: "सत्यापनानंतर तुमचा सर्व जुना डेटा, विद्यार्थी व हजेरी १००% सुरक्षित व अबाधित राहील.",
    invalidPhone: "कृपया वैध १० अंकी मोबाईल नंबर टाका.",
    otpSentSuccess: "SMS द्वारे OTP यशस्वीरित्या पाठवला आहे!",
    otpSentDesc: "कृपया तुमचा SMS इनबॉक्स तपासा आणि ६ अंकी कोड टाका.",
    otpVerifiedSuccess: "सत्यापन यशस्वी! हब मध्ये प्रवेश करत आहे...",
    invalidOtp: "अवैध OTP कोड. कृपया SMS मध्ये आलेला ६ अंकी कोड पुन्हा तपासा.",
    loggedAs: "या नावाने लॉगिन केले आहे",
    authError: "OTP पाठवण्यात समस्या आली. कृपया नंबर तपासून पुन्हा प्रयत्न करा किंवा वरून गुगल द्वारे लॉगिन करा.",
    quotaError: "SMS मर्यादा संपली आहे. कृपया वरील गुगल लॉगिन पर्याय वापरा.",
    captchaError: "reCAPTCHA सत्यापन अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
  }
};

export function OtpLogin({ onLoginSuccess, language = 'English' }: OtpLoginProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const t = translations[language];

  const [step, setStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; code?: string } | null>(null);

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
      }, 150);
    }
  }, [step]);

  // Direct Google Official Sign-In & 2-Step OTP Verification
  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({ title: "Authentication Initializing", description: "Please wait...", variant: "destructive" });
      return;
    }

    setIsGoogleLoading(true);
    setErrorInfo(null);

    try {
      const user = await initiateGoogleSignIn(auth);
      const identifier = user?.email || user?.displayName || 'Google Verified';
      
      toast({
        title: "Google Verified! 🎉",
        description: `${t.otpVerifiedSuccess} (${identifier})`,
        className: "bg-emerald-600 text-white font-bold"
      });

      onLoginSuccess(identifier, 'email');
    } catch (err: any) {
      console.error("WGB Google Auth Error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        const errorTitle = "Google Verification Notice";
        const errorMsg = err.message || "Failed to complete Google verification. Please retry.";
        setErrorInfo({ title: errorTitle, message: errorMsg, code: err.code });
        toast({ title: errorTitle, description: errorMsg, variant: "destructive" });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast({ title: t.invalidPhone, variant: "destructive" });
      return;
    }

    if (!auth) {
      toast({ 
        title: "Authentication Service Initializing", 
        description: "Please wait a moment and try again.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSending(true);
    setErrorInfo(null);

    try {
      const verifier = getRecaptchaVerifier(auth, 'recaptcha-container');
      const fullPhone = `+91${cleanPhone}`;
      
      const result = await sendPhoneOtp(auth, fullPhone, verifier);
      setConfirmationResult(result);
      
      toast({
        title: t.otpSentSuccess,
        description: `${t.sentTo} +91 ${cleanPhone}`,
        className: "bg-primary text-white font-bold"
      });

      setStep('otp');
      setResendTimer(45);
    } catch (err: any) {
      console.error("WGB Real Phone OTP Error:", err);
      let errorTitle = "SMS Delivery Notice";
      let errorMsg = t.authError;
      const code = err?.code || 'unknown';

      if (code === 'auth/operation-not-allowed') {
        errorTitle = "Phone Auth Not Enabled in Firebase";
        errorMsg = language === 'Marathi'
          ? "Firebase Console मध्ये 'Phone' साइन-इन पद्धत चालू केलेली नाही. तुम्ही वरील 'गुगल खात्याद्वारे लॉगिन' पर्याय वापरू शकता."
          : "Phone authentication is not enabled in Firebase Console. You can use the instant 'Sign In with Google' button above.";
      } else if (code === 'auth/unauthorized-domain') {
        errorTitle = "Domain Not Authorized in Firebase";
        errorMsg = language === 'Marathi'
          ? "सध्याचे डोमेन Firebase Authentication मध्ये जोडलेले नाही. वरील गुगल लॉगिन वापरू शकता."
          : "Current domain is not in Firebase Auth's Authorized Domains list. Please use the Google Sign-In option above.";
      } else if (code === 'auth/quota-exceeded') {
        errorTitle = "SMS Daily Limit Exceeded";
        errorMsg = language === 'Marathi'
          ? "आजची मोफत SMS मर्यादा संपली आहे. कृपया वरील 'गुगल खात्याद्वारे त्वरित लॉगिन' वापरा."
          : "SMS limit reached. Please use the 'Sign In with Google' button above for instant verification.";
      } else if (code === 'auth/captcha-check-failed' || code === 'auth/invalid-app-credential') {
        errorTitle = "reCAPTCHA Verification Failed";
        errorMsg = language === 'Marathi'
          ? "reCAPTCHA सत्यापन अयशस्वी झाले. कृपया पेज रीफ्रेश करा किंवा गुगलने लॉगिन करा."
          : "reCAPTCHA verification failed. Please refresh the page or use Google Sign-In.";
      } else if (code === 'auth/too-many-requests') {
        errorTitle = "Too Many Attempts";
        errorMsg = language === 'Marathi'
          ? "वारंवार प्रयत्न केल्यामुळे तात्पुरता ब्लॉक झाला आहे. कृपया गुगल लॉगिन वापरा."
          : "Too many SMS requests. Please use the Google Sign-In button above.";
      } else if (code === 'auth/invalid-phone-number') {
        errorTitle = "Invalid Phone Number";
        errorMsg = t.invalidPhone;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setErrorInfo({ title: errorTitle, message: errorMsg, code });

      toast({
        title: errorTitle,
        description: errorMsg,
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

    if (!confirmationResult || !auth) {
      toast({ 
        title: "Session Expired", 
        description: "Please request a fresh OTP code.", 
        variant: "destructive" 
      });
      setStep('input');
      return;
    }

    setIsVerifying(true);

    try {
      // Verify Real SMS OTP and link account to preserve existing data & UID
      await verifyAndLinkPhoneOtp(auth, confirmationResult, fullOtp);

      setStep('verified');
      toast({
        title: "OTP Verified! 🎉",
        description: t.otpVerifiedSuccess,
        className: "bg-emerald-600 text-white font-bold"
      });

      setTimeout(() => {
        const identifier = `+91 ${phone.replace(/\D/g, '')}`;
        onLoginSuccess(identifier, 'phone');
      }, 800);

    } catch (err: any) {
      console.error("WGB OTP Verification Error:", err);
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
        <div className="space-y-5 relative z-10">

          {/* PRIMARY OPTION: Official Google 2-Step Verification */}
          <div className="bg-primary/5 p-4 rounded-3xl border-2 border-primary/15 space-y-3 shadow-sm">
            <Button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-16 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-neutral-200 shadow-md font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all active-scale"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>{t.googleVerifying}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{t.googleBtn}</span>
                </>
              )}
            </Button>
            <p className="text-[11px] font-bold text-muted-foreground text-center px-2 leading-relaxed">
              {t.googleDesc}
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-primary/10 w-full" />
            <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 shrink-0">
              {t.orDivider}
            </span>
            <div className="border-t border-primary/10 w-full" />
          </div>

          {/* Phone Form Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-accent-foreground" /> {t.mobileTab}
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

          {/* Invisible Recaptcha Container */}
          <div id="recaptcha-container" />

          <Button
            onClick={handleSendOtp}
            disabled={isSending || phone.replace(/\D/g, '').length !== 10}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-display font-black uppercase tracking-widest shadow-lg text-xs active-scale transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                {t.sendOtp} <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {errorInfo && (
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive text-xs space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 font-black uppercase text-[11px] tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorInfo.title}</span>
              </div>
              <p className="font-semibold text-muted-foreground leading-relaxed">
                {errorInfo.message}
              </p>
              {errorInfo.code && errorInfo.code !== 'unknown' && (
                <p className="text-[10px] font-mono text-muted-foreground/70 pt-1">
                  Error Code: {errorInfo.code}
                </p>
              )}
            </div>
          )}

          {/* Security & Data Protection Notice */}
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{t.securityNote}</span>
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
              {t.sentTo} <strong className="text-primary">+91 {phone.replace(/\D/g, '')}</strong>
            </p>
          </div>

          {/* 6 Digit Input Grid */}
          <div className="flex justify-center gap-2 sm:gap-3 my-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
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
              {t.loggedAs}: <span className="text-primary">+91 {phone.replace(/\D/g, '')}</span>
            </p>
          </div>
        </div>
      )}

    </Card>
  );
}
