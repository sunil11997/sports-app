"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase';
import { 
  ChevronRight, 
  Smartphone,
  Database,
  ShieldAlert,
  FileJson,
  Languages,
  LogOut,
  Mail,
  Cloud,
  Globe,
  Info,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSchoolData } from '@/hooks/use-school-data';
import { usePWA } from '@/components/providers/pwa-provider';
import { initiateSignOut, initiateGoogleSignIn, syncViaEmail } from '@/firebase/non-blocking-login';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Settings({ language, setLanguage }: { language: 'English' | 'Marathi', setLanguage: (l: 'English' | 'Marathi') => void }) {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const schoolData = useSchoolData();
  const { isOnline, isInstallable, installApp } = usePWA();
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authMode, setAuthMode] = useState<'sync' | 'login'>('sync');
  
  const LOGO_INAPP = "/icon-512.png";

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: language === 'Marathi' ? "डेटा एक्सपोर्ट झाला" : "Consolidated Registry Exported",
      description: language === 'Marathi' ? "तुमच्या शाळेचा संपूर्ण डेटा JSON फाईलमध्ये जतन केला आहे." : "A complete institutional JSON backup has been generated."
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSyncing(true);
      await initiateGoogleSignIn(auth);
    } catch (error: any) {
      console.error("Google Sync Error:", error);
      toast({ 
        title: "Google Sync Failed", 
        description: "If Google login fails, please use the Email Sync option below for higher reliability.", 
        variant: "destructive" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAuthAction = async () => {
    if (!emailInput.includes('@')) {
      toast({ 
        title: language === 'Marathi' ? "अवैध ईमेल" : "Invalid Email", 
        description: language === 'Marathi' ? "कृपया एक वैध ईमेल पत्ता प्रविष्ट करा." : "Please enter a valid email address.",
        variant: "destructive" 
      });
      return;
    }

    if (passwordInput.length < 6) {
      toast({ 
        title: language === 'Marathi' ? "लहान पासवर्ड" : "Short Password", 
        description: language === 'Marathi' ? "पासवर्ड किमान ६ अक्षरांचा असावा." : "Password must be at least 6 characters.",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      setIsSyncing(true);
      await syncViaEmail(auth, emailInput.trim().toLowerCase(), passwordInput);
      toast({ 
        title: language === 'Marathi' ? "यशस्वी" : "Identity Verified", 
        description: language === 'Marathi' ? "तुमचा डेटा आता क्लाउडमध्ये सुरक्षित आहे." : "Your school records are now synchronized to the cloud.",
        className: "bg-primary text-white" 
      });
    } catch (error: any) {
      console.error("Auth Action Error:", error.code, error.message);
      
      let errorMessage = language === 'Marathi' 
        ? "त्रुटी आली. कृपया पुन्हा प्रयत्न करा." 
        : "An error occurred. Please try again.";
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = language === 'Marathi'
          ? "चुकीचा पासवर्ड किंवा ईमेल. कृपया तपासा."
          : "Incorrect password or email. Please check your credentials.";
      } else if (error.code === 'auth/user-token-expired') {
        errorMessage = language === 'Marathi'
          ? "सत्र संपले आहे. कृपया पुन्हा प्रयत्न करा."
          : "Session expired. Please try your request again.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = language === 'Marathi'
          ? "पासवर्ड किमान ६ अक्षरांचा असावा."
          : "Password must be at least 6 characters.";
      }

      toast({ 
        title: language === 'Marathi' ? "लॉगिन त्रुटी" : "Sync Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await initiateSignOut(auth);
      window.location.reload();
    } catch (error) {
      toast({ title: "Logout Error", variant: "destructive" });
    }
  };

  const SettingsItem = ({ icon: Icon, color, label, value, onClick, sublabel, disabled, accessory }: any) => (
    <div 
      className={cn(
        "w-full text-left group disabled:opacity-50 p-4 border-b last:border-0 flex items-center justify-between transition-all active:bg-muted/50 cursor-pointer",
        (!onClick || disabled) && "cursor-default active:bg-white"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl text-white transition-transform group-active:scale-90 shadow-sm", color)}>
          {Icon ? <Icon className="w-5 h-5" /> : <div className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{label}</span>
          {sublabel && <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none mt-1 tracking-wider">{sublabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-md">{value}</span>}
        {accessory && accessory}
        {onClick && !accessory && !disabled && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-active:translate-x-1 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-3 py-6">
        <div className="w-20 h-20 rounded-full shadow-xl overflow-hidden relative mx-auto mb-4 border-4 border-white bg-primary p-2">
          <Image src={LOGO_INAPP} alt="Logo" width={80} height={80} unoptimized className="object-contain w-full h-full" />
        </div>
        <h2 className="text-3xl font-black text-primary tracking-tight uppercase">Hub Control</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Registry Engine v3.0</p>
      </div>

      <div className="space-y-6">
        {/* Cloud Synchronization Warning */}
        {user?.isAnonymous ? (
          <Alert className="bg-amber-50 border-amber-200 rounded-[2rem] p-6 shadow-sm">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-black uppercase text-xs tracking-widest">
              {language === 'Marathi' ? "लोकल मोड सक्रिय" : "Local Mode Active"}
            </AlertTitle>
            <AlertDescription className="text-amber-700/80 text-xs font-medium mt-1 leading-relaxed">
              {language === 'Marathi' 
                ? "तुमचा डेटा सध्या फक्त या डिव्हाइसवर जतन केला आहे. सर्व डिव्हाइसेसवर डेटा पाहण्यासाठी कृपया खाली सिंक करा." 
                : "Records are currently stored only on this device. To enable sync across all your phones, please link your Cloud Identity below."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="text-white w-6 h-6" />
               </div>
               <div>
                  <p className="font-black text-emerald-900 uppercase text-sm">Cloud Sync Active</p>
                  <p className="text-[10px] font-bold text-emerald-700/60 uppercase truncate max-w-[150px]">{user?.email}</p>
               </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-emerald-700 hover:text-destructive font-black text-[10px] uppercase">Sign Out</Button>
          </div>
        )}

        {/* Cloud Identity Section */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Cloud className="w-3 h-3 text-primary" /> Multi-Device Cloud Sync
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            {user?.isAnonymous && (
              <div className="p-6 space-y-6">
                {/* Auth Mode Toggle */}
                <div className="flex bg-muted/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setAuthMode('sync')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all",
                      authMode === 'sync' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {language === 'Marathi' ? "नवीन खाते / सिंक" : "Sync & Register"}
                  </button>
                  <button 
                    onClick={() => setAuthMode('login')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all",
                      authMode === 'login' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {language === 'Marathi' ? "लॉगिन करा" : "Log In"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase ml-1">
                      {language === 'Marathi' ? "ईमेल पत्ता" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input 
                        placeholder="your-name@school.com" 
                        className="h-14 rounded-2xl border-2 font-bold pl-12 bg-muted/20" 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase ml-1">
                      {language === 'Marathi' ? "पासवर्ड" : "Password"}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        className="h-14 rounded-2xl border-2 font-bold pl-12 pr-12 bg-muted/20" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()}
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAuthAction} 
                    disabled={isSyncing}
                    className="w-full h-14 rounded-2xl bg-primary text-white shadow-lg font-black uppercase text-xs tracking-widest active-scale"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : authMode === 'sync' ? (
                      <><UserPlus className="w-5 h-5 mr-2" /> {language === 'Marathi' ? "डेटा क्लाउडवर जतन करा" : "Secure Data to Cloud"}</>
                    ) : (
                      <><LogIn className="w-5 h-5 mr-2" /> {language === 'Marathi' ? "लॉगिन करा" : "Log In to Hub"}</>
                    )}
                  </Button>
                </div>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                  <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-white px-4 text-muted-foreground">OR USE GOOGLE</span></div>
                </div>

                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={isSyncing}
                  className="w-full h-14 rounded-2xl bg-white border-2 border-primary/10 text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest shadow-md transition-all active-scale"
                >
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Globe className="w-5 h-5 mr-2" />}
                  Sync with Google ID
                </Button>
                <p className="text-[9px] text-center text-muted-foreground font-medium italic">
                  * Recommended for high-reliability data sync across all devices.
                </p>
              </div>
            )}

            {!user?.isAnonymous && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-primary/5">
                   <Cloud className="w-6 h-6 text-primary" />
                   <div className="flex-1">
                      <p className="text-xs font-black text-primary uppercase">Registry Synchronized</p>
                      <p className="text-[10px] font-medium text-muted-foreground">Your records are backed up in real-time to your cloud identity.</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Institutional Data */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Data & Safety
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem 
              icon={FileJson} 
              color="bg-indigo-500" 
              label={language === 'Marathi' ? "डेटा बॅकअप" : "Institutional Backup"} 
              sublabel="Export full Registry to JSON"
              onClick={handleManualExport}
            />
            <SettingsItem 
              icon={Database} 
              color="bg-emerald-500" 
              label="Cloud Registry Health" 
              value={isOnline ? "Healthy" : "Offline"}
              sublabel="Real-time synchronization status"
            />
          </div>
        </div>

        {/* Device Settings */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Interface Settings</label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem 
              icon={Smartphone} 
              color="bg-orange-500" 
              label="Install Native Hub" 
              sublabel={isInstallable ? "Available for local installation" : "Running on web engine"}
              disabled={!isInstallable}
              onClick={isInstallable ? installApp : undefined}
            />
            <SettingsItem 
              icon={Languages} 
              color="bg-purple-500" 
              label="System Language" 
              sublabel="Select primary display language"
              accessory={
                <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                  <Button variant={language === 'Marathi' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('Marathi'); }} className="h-7 rounded-full font-black text-[9px] px-3">मराठी</Button>
                  <Button variant={language === 'English' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('English'); }} className="h-7 rounded-full font-black text-[9px] px-3">EN</Button>
                </div>
              }
            />
          </div>
        </div>

        <div className="text-center pt-8 opacity-20">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.6em]">WGB-VAULT-V3.0</p>
        </div>
      </div>
    </div>
  );
}
