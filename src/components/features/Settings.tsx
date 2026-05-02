"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase';
import { 
  ChevronRight, 
  Wifi,
  WifiOff,
  SmartphoneNfc,
  Database,
  ShieldAlert,
  FileJson,
  Languages,
  UserCheck,
  LogOut,
  Mail,
  CloudCheck,
  Globe,
  Smartphone,
  Info,
  Key,
  Loader2
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
  const [isSyncing, setIsSyncing] = useState(false);
  
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
      toast({ title: "Sync Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEmailSync = async () => {
    if (!emailInput.includes('@')) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
    }
    try {
      setIsSyncing(true);
      await syncViaEmail(auth, emailInput);
      toast({ title: "Sync Successful", description: "Identity verified across devices." });
    } catch (error: any) {
      toast({ title: "Sync Error", description: "Check connection or password.", variant: "destructive" });
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
        "ios-list-item w-full text-left group disabled:opacity-50 p-4 border-b last:border-0 flex items-center justify-between transition-all active:bg-muted/50",
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
        {user?.isAnonymous && (
          <Alert className="bg-amber-50 border-amber-200 rounded-[2rem] p-6 shadow-sm">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-black uppercase text-xs tracking-widest">Local Mode Active</AlertTitle>
            <AlertDescription className="text-amber-700/80 text-xs font-medium mt-1 leading-relaxed">
              Data entered now is stored only on this device. To see your records on another phone or computer, sign in to your Cloud Identity below.
            </AlertDescription>
          </Alert>
        )}

        {/* Cloud Identity Section */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CloudCheck className="w-3 h-3 text-primary" /> Cloud Identity & Sync
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            {user?.isAnonymous ? (
              <div className="p-6 space-y-4">
                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={isSyncing}
                  className="w-full h-14 rounded-2xl bg-white border-2 border-primary/10 text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest shadow-md transition-all active-scale"
                >
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Globe className="w-5 h-5 mr-2" />}
                  Sync with Google Account
                </Button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                  <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-white px-4 text-muted-foreground">OR USE EMAIL SYNC</span></div>
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter school email..." 
                    className="h-14 rounded-2xl border-2 font-bold px-5 bg-muted/20" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <Button 
                    onClick={handleEmailSync} 
                    disabled={isSyncing}
                    className="h-14 w-14 rounded-2xl bg-primary text-white shadow-lg p-0"
                  >
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-emerald-200 shadow-sm">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-emerald-500 text-white font-black">{user?.displayName?.[0] || 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-emerald-800 uppercase text-lg leading-none">{user?.displayName || 'Cloud User'}</p>
                    <div className="flex items-center gap-1 mt-1.5 opacity-60">
                       <CloudCheck className="w-3 h-3 text-emerald-600" />
                       <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Sync Active: {user?.email}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive">
                   <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Institutional Data */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Data Management
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem 
              icon={FileJson} 
              color="bg-indigo-500" 
              label={language === 'Marathi' ? "डेटा बॅकअप" : "Institutional Backup"} 
              sublabel="Export full JSON Registry"
              onClick={handleManualExport}
            />
            <SettingsItem 
              icon={Database} 
              color="bg-emerald-500" 
              label="Sync Engine Health" 
              value={isOnline ? "Live" : "Cached"}
              sublabel="Real-time registry link status"
            />
          </div>
        </div>

        {/* Device Settings */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Device & Interface</label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem 
              icon={SmartphoneNfc} 
              color="bg-orange-500" 
              label="Install App" 
              sublabel={isInstallable ? "Available for offline use" : "Running in Web Mode"}
              disabled={!isInstallable}
              onClick={isInstallable ? installApp : undefined}
            />
            <SettingsItem 
              icon={Languages} 
              color="bg-purple-500" 
              label="System Language" 
              sublabel="Select UI primary language"
              accessory={
                <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                  <Button variant={language === 'Marathi' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('Marathi'); }} className="h-7 rounded-full font-black text-[9px] px-3">मराठी</Button>
                  <Button variant={language === 'English' ? "default" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setLanguage('English'); }} className="h-7 rounded-full font-black text-[9px] px-3">EN</Button>
                </div>
              }
            />
          </div>
        </div>

        <div className="text-center pt-4 opacity-30">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">WGB-PRO-SYNC-V3</p>
        </div>
      </div>
    </div>
  );
}
