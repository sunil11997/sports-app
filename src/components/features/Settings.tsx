"use client";

import React, { useState, useRef } from 'react';
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
  ChevronLeft,
  Lock,
  Smartphone as Phone,
  UploadCloud,
  History,
  RotateCcw
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function Settings({ language, setLanguage }: { language: 'English' | 'Marathi', setLanguage: (l: 'English' | 'Marathi') => void }) {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const schoolData = useSchoolData();
  const { isOnline, isInstallable, installApp } = usePWA();
  const restoreFileRef = useRef<HTMLInputElement>(null);
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authMode, setAuthMode] = useState<'sync' | 'login'>('sync');
  const [showRegistration, setShowRegistration] = useState(false);
  
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  
  const LOGO_INAPP = "/icon-512.png";

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: language === 'Marathi' ? "डेटा एक्सपोर्ट झाला" : "Consolidated Registry Exported",
      description: language === 'Marathi' ? "तुमच्या शाळेचा संपूर्ण डेटा JSON फाईलमध्ये जतन केला आहे." : "A complete institutional JSON backup has been generated."
    });
  };

  const handleRestoreImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.data) throw new Error("Invalid format");
        
        await schoolData.importBackupData(json);
        toast({ 
          title: "Registry Restored", 
          description: "Institutional data has been successfully synchronized to the cloud.",
          className: "bg-emerald-600 text-white font-black"
        });
      } catch (err) {
        toast({ 
          title: "Import Error", 
          description: "The selected file is not a valid WGB Registry backup.", 
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
    if (restoreFileRef.current) restoreFileRef.current.value = "";
  };

  const handleSetPasscode = () => {
    if (newPasscode.length !== 4 || !/^\d+$/.test(newPasscode)) {
      toast({ title: "Invalid PIN", description: "Passcode must be exactly 4 digits.", variant: "destructive" });
      return;
    }
    schoolData.updatePasscode(newPasscode);
    setIsPasscodeDialogOpen(false);
    setNewPasscode("");
    toast({ 
      title: "Security Updated", 
      description: "App passcode has been set successfully.",
      className: "bg-primary text-white"
    });
  };

  const toggleRotation = async () => {
    try {
      if (typeof window !== 'undefined' && window.screen?.orientation) {
        // Unlock orientation to allow system-level rotation settings to take over
        await (window.screen.orientation as any).unlock?.();
        toast({ title: "Rotation Unlocked", description: "The app will now rotate with your system settings." });
      } else {
        throw new Error("API Not Supported");
      }
    } catch (e) {
      toast({ title: "Unsupported", description: "Browser does not support direct orientation control.", variant: "destructive" });
    }
  };

  const handleAuthAction = async () => {
    if (!auth) return;
    if (!emailInput.includes('@')) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
    }
    if (passwordInput.length < 6) {
      toast({ title: "Short Password", variant: "destructive" });
      return;
    }
    
    try {
      setIsSyncing(true);
      await syncViaEmail(auth, emailInput.trim().toLowerCase(), passwordInput);
      toast({ title: "Identity Verified", className: "bg-primary text-white" });
    } catch (error: any) {
      toast({ title: "Sync Error", variant: "destructive" });
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
        <Button variant="ghost" onClick={() => setShowRegistration(false)} className="font-black uppercase text-xs tracking-widest text-primary mb-2">
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
        <h2 className="text-3xl font-black text-primary tracking-tight uppercase">Hub Control v5.1</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Registry Engine v5.1.0 Stable</p>
      </div>

      <div className="space-y-6">
        {isOnline && isInstallable && (
          <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-[2.5rem] shadow-lg animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Download className="text-white w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-primary uppercase tracking-tight">Native Web App Ready</h3>
                <p className="text-xs font-medium text-muted-foreground max-w-[250px] mx-auto leading-relaxed">Install this system directly to your device.</p>
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
            <SettingsItem icon={School} color="bg-primary" label="Teacher & School Profile" sublabel="Configure Instructor Details" onClick={() => setShowRegistration(true)} />
            <SettingsItem icon={Lock} color="bg-accent" label="App Passcode (PIN)" sublabel={schoolData.data.schoolProfile?.passcode ? "PIN Protection Active" : "No PIN Set"} value={schoolData.data.schoolProfile?.passcode ? "****" : "OFF"} onClick={() => setIsPasscodeDialogOpen(true)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Data & Safety
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem icon={FileJson} color="bg-indigo-500" label="Export Registry" sublabel="Generate JSON Backup" onClick={handleManualExport} />
            <SettingsItem 
              icon={UploadCloud} 
              color="bg-emerald-500" 
              label="Restore from Backup" 
              sublabel="Upload Institutional JSON" 
              onClick={() => restoreFileRef.current?.click()} 
            />
            <input type="file" ref={restoreFileRef} hidden accept=".json" onChange={handleRestoreImport} />
            <SettingsItem icon={Database} color="bg-blue-500" label="Registry Status" value={isOnline ? "Online" : "Offline"} sublabel="Real-time cloud sync status" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Smartphone className="w-3 h-3 text-primary" /> System Controls
          </label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
             <SettingsItem icon={RotateCcw} color="bg-orange-600" label="Toggle Screen Rotation" sublabel="Unlock orientation for landscape" onClick={toggleRotation} />
             <SettingsItem icon={Phone} color="bg-orange-500" label="Native Hub Status" sublabel={isInstallable ? "Ready to Install" : "Running on Web"} value={isInstallable ? "Available" : "Active"} onClick={isInstallable ? installApp : undefined} />
          </div>
        </div>

        {user?.isAnonymous ? (
          <Alert className="bg-amber-50 border-amber-200 rounded-[2rem] p-6 shadow-sm">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-black uppercase text-xs tracking-widest">Local Mode Active</AlertTitle>
            <AlertDescription className="text-amber-700/80 text-xs font-medium mt-1 leading-relaxed">
              Records are currently stored only on this device. Link your data to a Cloud Identity below.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-lg"><CheckCircle2 className="text-emerald-600 w-6 h-6" /></div>
               <div>
                  <p className="font-black text-emerald-900 uppercase text-sm">Cloud Identity Linked</p>
                  <p className="text-[10px] font-bold text-emerald-700/60 uppercase truncate max-w-[150px]">{user?.email}</p>
               </div>
            </div>
            <button onClick={handleLogout} className="text-emerald-700 hover:text-destructive font-black text-[10px] uppercase">Sign Out</button>
          </div>
        )}

        {user?.isAnonymous && (
          <div className="space-y-2">
            <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Cloud className="w-3 h-3 text-primary" /> Identity Synchronization
            </label>
            <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm p-6 space-y-6">
              <div className="flex bg-muted/50 p-1 rounded-xl">
                <button onClick={() => setAuthMode('sync')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", authMode === 'sync' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Register</button>
                <button onClick={() => setAuthMode('login')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", authMode === 'login' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Log In</button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase ml-1">Institutional Email</label>
                  <Input 
                    placeholder="teacher@waghamba.com" 
                    className="h-14 rounded-2xl border-2 font-bold" 
                    value={emailInput} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase ml-1">Passcode</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl border-2 font-bold" 
                      value={passwordInput} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordInput(e.target.value)} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                </div>
                <Button onClick={handleAuthAction} disabled={isSyncing} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg">
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : authMode === 'sync' ? 'Register Institutional Identity' : 'Log In to Hub'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Interface Settings</label>
          <div className="rounded-[2rem] overflow-hidden bg-white border shadow-sm">
            <SettingsItem icon={Languages} color="bg-purple-500" label="System Language" sublabel="Select primary display language" accessory={
              <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                <Button variant={language === 'Marathi' ? "default" : "ghost"} size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setLanguage('Marathi'); }} className="h-7 rounded-full font-black text-[9px] px-3">मराठी</Button>
                <Button variant={language === 'English' ? "default" : "ghost"} size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setLanguage('English'); }} className="h-7 rounded-full font-black text-[9px] px-3">EN</Button>
              </div>
            } />
          </div>
        </div>
      </div>

      <Dialog open={isPasscodeDialogOpen} onOpenChange={setIsPasscodeDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-primary p-8 text-white">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-white" /></div>
             <DialogTitle className="text-2xl font-black uppercase tracking-tight">Registry Passcode</DialogTitle>
             <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Institutional PIN Protection</p>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">New 4-Digit PIN</label>
              <Input 
                type="password" 
                maxLength={4} 
                placeholder="0000" 
                value={newPasscode} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPasscode(e.target.value.replace(/\D/g, ''))} 
                className="h-16 text-center text-3xl tracking-[0.5em] font-black border-2 rounded-2xl bg-muted/20" 
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 border-t flex flex-col gap-3">
             <Button onClick={handleSetPasscode} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">Save PIN</Button>
             {schoolData.data.schoolProfile?.passcode && (
               <Button onClick={() => { schoolData.updatePasscode(""); setIsPasscodeDialogOpen(false); }} variant="ghost" className="w-full text-destructive font-black uppercase text-[10px]">Disable Passcode</Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
