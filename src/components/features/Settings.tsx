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
  LogIn,
  Download,
  School,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSchoolData } from '@/hooks/use-school-data';
import { usePWA } from '@/components/providers/pwa-provider';
import { initiateSignOut, syncViaEmail } from '@/firebase/non-blocking-login';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SchoolRegistration } from './SchoolRegistration';

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
  const [showRegistration, setShowRegistration] = useState(false);
  
  const LOGO_INAPP = "/icon-512.png";

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: language === 'Marathi' ? "डेटा एक्सपोर्ट झाला" : "Consolidated Registry Exported",
      description: language === 'Marathi' ? "तुमच्या शाळेचा संपूर्ण डेटा JSON फाईलमध्ये जतन केला आहे." : "A complete institutional JSON backup has been generated."
    });
  };

  const handleAuthAction = async () => {
    if (!auth) return;
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
      toast({ title: "Sync Error", description: "Identity sync failed. Please check credentials.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await initiateSignOut(auth);
      window.location.href = "/";
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

  if (showRegistration) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <Button 
          variant="ghost" 
          onClick={() => setShowRegistration(false)}
          className="font-black uppercase text-xs tracking-widest text-primary mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Settings
        </Button>
        <SchoolRegistration store={schoolData} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-3 py-6">
        <div className="w-24 h-24 rounded-full shadow-2xl overflow-hidden relative mx-auto mb-4 border-4 border-white bg-white flex items-center justify-center p-0">
          <Image src={LOGO_INAPP} alt="Logo" width={96} height={96} unoptimized className="object-cover w-full h-full" />
        </div>
        <h2 className="text-3xl font-black text-primary tracking-tight uppercase">Hub Control</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Registry Engine v3.9.9</p>
      </div>

      <div className="space-y-6">
        {isOnline && isInstallable && (
          <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-[2.5rem] shadow-lg animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Download className="text-white w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-primary uppercase tracking-tight">Institutional Web App Ready</h3>
                <p className="text-xs font-medium text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                  Install this system directly to your device for a fast, native-like experience.
                </p>
              </div>
              <Button onClick={installApp} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale">Install Now</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <UserCheck className="w-3 h-3 text-primary" /> Institutional Profile
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem 
              icon={School} 
              color="bg-primary" 
              label="Teacher & School Profile" 
              sublabel="Configure Instructor Details"
              onClick={() => setShowRegistration(true)}
            />
          </div>
        </div>

        {user?.isAnonymous ? (
          <Alert className="bg-amber-50 border-amber-200 rounded-[2rem] p-6 shadow-sm">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-black uppercase text-xs tracking-widest">Local Mode Active</AlertTitle>
            <AlertDescription className="text-amber-700/80 text-xs font-medium mt-1 leading-relaxed">
              Records are currently stored only on this device. Use the forms below to link your data to a Cloud Identity for multi-device sync.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="text-emerald-600 w-6 h-6" />
               </div>
               <div>
                  <p className="font-black text-emerald-900 uppercase text-sm">Cloud Sync Active</p>
                  <p className="text-[10px] font-bold text-emerald-700/60 uppercase truncate max-w-[150px]">{user?.email}</p>
               </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-emerald-700 hover:text-destructive font-black text-[10px] uppercase">Sign Out</Button>
          </div>
        )}

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Cloud className="w-3 h-3 text-primary" /> Multi-Device Cloud Sync
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            {user?.isAnonymous && (
              <div className="p-6 space-y-6">
                <div className="flex bg-muted/50 p-1 rounded-xl">
                  <button onClick={() => setAuthMode('sync')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", authMode === 'sync' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Sync & Register</button>
                  <button onClick={() => setAuthMode('login')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", authMode === 'login' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Log In</button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input placeholder="teacher@school.com" className="h-14 rounded-2xl border-2 font-bold pl-12 bg-muted/20" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase ml-1">Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 rounded-2xl border-2 font-bold pl-12 pr-12 bg-muted/20" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                  </div>

                  <Button onClick={handleAuthAction} disabled={isSyncing} className="w-full h-14 rounded-2xl bg-primary text-white shadow-lg font-black uppercase text-xs tracking-widest active-scale">
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : authMode === 'sync' ? <><UserPlus className="w-5 h-5 mr-2" /> Register & Sync Data</> : <><LogIn className="w-5 h-5 mr-2" /> Log In to Hub</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Data & Safety
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem icon={FileJson} color="bg-indigo-500" label="Institutional Backup" sublabel="Export full Registry to JSON" onClick={handleManualExport} />
            <SettingsItem icon={Database} color="bg-emerald-500" label="Cloud Registry Health" value={isOnline ? "Healthy" : "Offline"} sublabel="Real-time synchronization status" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Interface Settings</label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem icon={Smartphone} color="bg-orange-500" label="Native Hub Status" sublabel={isInstallable ? "Ready to Install" : "Running on Web"} value={isInstallable ? "Available" : "Active"} onClick={isInstallable ? installApp : undefined} />
            <SettingsItem icon={Languages} color="bg-purple-500" label="System Language" sublabel="Select primary display language" accessory={<div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10"><Button variant={language === 'Marathi' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('Marathi'); }} className="h-7 rounded-full font-black text-[9px] px-3">मराठी</Button><Button variant={language === 'English' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('English'); }} className="h-7 rounded-full font-black text-[9px] px-3">EN</Button></div>} />
          </div>
        </div>
      </div>
    </div>
  );
}