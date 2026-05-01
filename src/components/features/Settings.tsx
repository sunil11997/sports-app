
"use client";

import React from 'react';
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
  CloudCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSchoolData } from '@/hooks/use-school-data';
import { usePWA } from '@/components/providers/pwa-provider';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Settings({ language, setLanguage }: { language: 'English' | 'Marathi', setLanguage: (l: 'English' | 'Marathi') => void }) {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const schoolData = useSchoolData();
  const { isOnline, isInstallable, installApp } = usePWA();
  const LOGO_INAPP = "/icon-512.png";

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: language === 'Marathi' ? "डेटा एक्सपोर्ट झाला" : "Consolidated Registry Exported",
      description: language === 'Marathi' ? "तुमच्या शाळेचा संपूर्ण डेटा JSON फाईलमध्ये जतन केला आहे." : "A complete institutional JSON backup has been generated. Store this in your secure records."
    });
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
        "ios-list-item w-full text-left group disabled:opacity-50",
        (!onClick || disabled) && "cursor-default active:bg-white"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg text-white transition-transform group-active:scale-90", color)}>
          {Icon ? <Icon className="w-5 h-5" /> : <div className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{label}</span>
          {sublabel && <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mt-0.5">{sublabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-medium text-muted-foreground">{value}</span>}
        {accessory && accessory}
        {onClick && !accessory && !disabled && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-active:translate-x-1 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3 py-6">
        <div className="w-24 h-24 rounded-full shadow-xl overflow-hidden relative mx-auto mb-4 border-4 border-white bg-primary">
          <Image 
            src={LOGO_INAPP} 
            alt="App Logo" 
            width={96} 
            height={96} 
            unoptimized 
            priority 
            className="object-cover w-full h-full" 
          />
        </div>
        <h2 className="text-4xl font-black text-primary tracking-tight uppercase">Hub Control</h2>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Ashram Shala Waghamba • v3.0 Production</p>
      </div>

      <div className="space-y-6">
        {/* Administrator Info - Google Identity */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Institutional Lead</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-primary text-white font-black">{user?.displayName?.[0] || 'T'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-primary uppercase text-lg leading-none">{user?.displayName || 'Sunil Deshmukh'}</p>
                <div className="flex items-center gap-1 mt-1.5 opacity-60">
                   <Mail className="w-3 h-3" />
                   <span className="text-[10px] font-bold uppercase">{user?.email || 'ashramshala.waghamba@gmail.com'}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive">
               <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Institutional Data Safety */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-primary" /> Institutional Data Portability
          </label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border">
            <SettingsItem 
              icon={CloudCheck} 
              color="bg-primary" 
              label={language === 'Marathi' ? "गूगल क्लाउड सिंक" : "Google Cloud Sync"} 
              sublabel={user?.isAnonymous ? "Currently running in local mode" : "Auto-update enabled for Google Account"}
              value={user?.isAnonymous ? "Local" : "Active"}
            />
            <SettingsItem 
              icon={FileJson} 
              color="bg-indigo-500" 
              label={language === 'Marathi' ? "संपूर्ण बॅकअप घ्या" : "Consolidated Backup"} 
              sublabel={language === 'Marathi' ? "डेटा JSON फॉरमॅटमध्ये जतन करा" : "Full Database JSON Export"}
              onClick={handleManualExport}
            />
            <SettingsItem 
              icon={Database} 
              color="bg-emerald-500" 
              label={language === 'Marathi' ? "डेटाबेस स्थिती" : "Registry Health"} 
              value={isOnline ? (language === 'Marathi' ? "सुरू आहे" : "Live") : (language === 'Marathi' ? "बंद आहे" : "Cached")}
              sublabel={language === 'Marathi' ? "सुरक्षित नोंदणी संरक्षण" : "Real-time sync to registry"}
            />
          </div>
        </div>

        {/* Application Management */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Application Management</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white border">
            <SettingsItem 
              icon={SmartphoneNfc} 
              color="bg-orange-500" 
              label={language === 'Marathi' ? "फोनवर इंस्टॉल करा" : "Install on Phone"} 
              sublabel={isInstallable ? (language === 'Marathi' ? "ऑफलाईन वापरासाठी उपलब्ध" : "Available for offline use") : (language === 'Marathi' ? "वापरासाठी तयार" : "Ready for use")}
              disabled={!isInstallable}
              onClick={isInstallable ? installApp : undefined}
            />
            <SettingsItem 
              icon={Languages} 
              color="bg-purple-500" 
              label={language === 'Marathi' ? "प्रणाली भाषा" : "System Language"} 
              sublabel={language === 'Marathi' ? "प्राथमिक भाषा निवडा" : "Select primary interface language"}
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
              value={isOnline ? "Cloud Active" : "Local Sync Mode"}
            />
          </div>
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
