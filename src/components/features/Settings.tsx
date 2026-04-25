"use client";

import React from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateGoogleBackup, initiateSignOut } from '@/firebase/non-blocking-login';
import { 
  Cloud, 
  ChevronRight, 
  User, 
  LogOut, 
  ShieldCheck, 
  Award, 
  School,
  Mail,
  Wifi,
  WifiOff,
  Download,
  Lock,
  History,
  Languages,
  SmartphoneNfc,
  Database,
  Chrome,
  ShieldAlert,
  FileJson
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSchoolData } from '@/hooks/use-school-data';
import { usePWA } from '@/components/providers/pwa-provider';

export function Settings({ language, setLanguage }: { language: 'English' | 'Marathi', setLanguage: (l: 'English' | 'Marathi') => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const schoolData = useSchoolData();
  const { isOnline, isInstallable, installApp } = usePWA();

  const handleBackup = () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: language === 'Marathi' ? "कनेक्शन नाही" : "No Connection",
        description: language === 'Marathi' ? "गुगल बॅकअपसाठी इंटरनेट कनेक्शन आवश्यक आहे." : "An active internet connection is required for Google backup."
      });
      return;
    }

    initiateGoogleBackup(auth)
      .then(() => {
        toast({ 
          title: language === 'Marathi' ? "गुगल खाते लिंक झाले" : "Google Account Linked", 
          description: language === 'Marathi' ? "तुमचा डेटा आता सुरक्षितपणे बॅकअप घेतला जात आहे." : "Your school data is now securely backed up to your Google account." 
        });
      })
      .catch((err: any) => {
        console.error("Backup Error:", err);
        let errorMsg = language === 'Marathi' ? "कृपया तुमचे इंटरनेट तपासा किंवा पुन्हा प्रयत्न करा." : "Please check your connection or try again.";
        
        if (err.code === 'auth/popup-blocked') {
          errorMsg = language === 'Marathi' ? "ब्राउझरने पॉपअप ब्लॉक केले आहे. कृपया ते सुरू करा." : "Browser blocked the popup. Please enable popups for this site.";
        } else if (err.code === 'auth/cancelled-popup-request') {
          errorMsg = language === 'Marathi' ? "प्रक्रिया रद्द केली गेली." : "Operation was cancelled.";
        }

        toast({ 
          variant: "destructive", 
          title: language === 'Marathi' ? "बॅकअप अयशस्वी" : "Backup Failed", 
          description: errorMsg 
        });
      });
  };

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: "Consolidated Registry Exported",
      description: "A complete institutional JSON backup has been generated. Store this in your secure records."
    });
  };

  const isGoogleLinked = user?.providerData.some(p => p.providerId === 'google.com');

  const SettingsItem = ({ icon: Icon, color, label, value, onClick, sublabel, disabled, accessory }: any) => (
    <div 
      className={cn(
        "ios-list-item w-full text-left group disabled:opacity-50",
        !onClick && "cursor-default active:bg-white"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg text-white transition-transform group-active:scale-90", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{label}</span>
          {sublabel && <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mt-0.5">{sublabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-medium text-muted-foreground">{value}</span>}
        {accessory && accessory}
        {onClick && !accessory && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-active:translate-x-1 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3 py-6">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 ios-card-shadow border-4 border-white">
          <School className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-4xl font-black text-primary tracking-tight uppercase">Hub Control</h2>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Ashram Shala Waghamba • v3.0 Production</p>
      </div>

      <div className="space-y-6">
        {/* Institutional Data Safety */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Institutional Data Portability
          </label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border">
            <SettingsItem 
              icon={FileJson} 
              color="bg-indigo-500" 
              label="Consolidated Backup" 
              sublabel="Full Database JSON Export"
              onClick={handleManualExport}
            />
            <SettingsItem 
              icon={Database} 
              color="bg-emerald-500" 
              label="Real-time Cloud Sync" 
              value={isOnline ? "Active" : "Offline"}
              sublabel="Encrypted registry protection"
            />
            <SettingsItem 
              icon={Chrome} 
              color="bg-sky-500" 
              label="Google Drive Link" 
              value={isGoogleLinked ? "Connected" : "Link Now"}
              sublabel="Secure institutional storage"
              onClick={handleBackup}
            />
          </div>
        </div>

        {/* Application Management */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Application Management</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border">
            <SettingsItem 
              icon={SmartphoneNfc} 
              color="bg-primary" 
              label={language === 'Marathi' ? "फोनवर इंस्टॉल करा" : "Install on Phone"} 
              sublabel={isInstallable ? "Available for offline use" : "Ready for use"}
              disabled={!isInstallable}
              onClick={isInstallable ? installApp : undefined}
            />
            <SettingsItem 
              icon={Languages} 
              color="bg-purple-500" 
              label="System Language" 
              sublabel="Select primary interface language"
              accessory={
                <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                  <Button 
                    variant={language === 'Marathi' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setLanguage('Marathi'); }}
                    className="h-7 rounded-full font-black text-[9px] px-3"
                  >
                    मराठी
                  </Button>
                  <Button 
                    variant={language === 'English' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setLanguage('English'); }}
                    className="h-7 rounded-full font-black text-[9px] px-3"
                  >
                    EN
                  </Button>
                </div>
              }
            />
            <SettingsItem 
              icon={isOnline ? Wifi : WifiOff} 
              color={isOnline ? "bg-green-500" : "bg-destructive"} 
              label="Registry Engine" 
              value={isOnline ? "Cloud Active" : "Local Engine Only"}
            />
          </div>
        </div>

        {/* Identity & Session */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identity & Session</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border">
            <SettingsItem icon={User} color="bg-blue-600" label="Lead Teacher" value="सुनिल देशमुख" sublabel="Registry Administrator" />
            <SettingsItem icon={Award} color="bg-amber-500" label="Institutional Role" value="PE Director" />
            <SettingsItem icon={Mail} color="bg-rose-500" label="Session UID" value={user?.uid.substring(0, 10) + "..."} />
          </div>
        </div>

        <div className="pt-6 px-4">
          <Button 
            variant="ghost" 
            onClick={() => initiateSignOut(auth)}
            className="w-full bg-white text-destructive hover:bg-destructive/5 rounded-2xl h-16 font-black uppercase text-xs tracking-[0.2em] ios-card-shadow active-scale border border-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            End Institutional Session
          </Button>
        </div>

        <div className="text-center pt-8 pb-12 opacity-30">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">
            WGB-SPORTS-HUB-PRO-V3.0
          </p>
        </div>
      </div>
    </div>
  );
}