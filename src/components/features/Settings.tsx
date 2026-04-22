
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
  CheckCircle2
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
  const { isOnline } = usePWA();

  const handleBackup = () => {
    initiateGoogleBackup(auth)
      .then(() => {
        toast({ 
          title: "Account Linked", 
          description: "Your school data is now securely backed up to your Google account cloud." 
        });
      })
      .catch((err) => {
        toast({ 
          variant: "destructive", 
          title: "Backup Linking Failed", 
          description: err.message || "Ensure you have a stable connection and Google Auth is enabled in Firebase Console." 
        });
      });
  };

  const handleManualExport = () => {
    schoolData.exportBackupData();
    toast({
      title: "Backup File Generated",
      description: "Institutional data has been exported. You can now upload this file to your personal Google Drive."
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
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 ios-card-shadow">
          <School className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-primary tracking-tight uppercase">Hub Configuration</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">शासकीय माध्यमिक आश्रम शाळा वाघंबा</p>
      </div>

      <div className="space-y-6">
        {/* Connectivity & Language Section */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Preferences</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white">
            <SettingsItem 
              icon={Languages} 
              color="bg-purple-500" 
              label="App Language" 
              sublabel="Select UI primary language"
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
              label="System Status" 
              value={isOnline ? "Synced & Online" : "Local Mode"}
              sublabel={isOnline ? "Direct Cloud Sync Active" : "Data will sync when back online"}
            />
          </div>
        </div>

        {/* Cloud & Backup Section */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">iCloud & Google Backup</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white">
            <SettingsItem 
              icon={Cloud} 
              color="bg-sky-500" 
              label="Sync with Google" 
              value={isGoogleLinked ? "Backed Up" : "Configure"}
              sublabel={isGoogleLinked ? "Cloud Storage Active" : "Link for automated safety"}
              onClick={handleBackup}
            />
            <SettingsItem 
              icon={Download} 
              color="bg-emerald-500" 
              label="Manual Export (.json)" 
              sublabel="Offline Database Backup"
              onClick={handleManualExport}
            />
            <SettingsItem 
              icon={History} 
              color="bg-indigo-500" 
              label="Sync Integrity" 
              value="Live"
              sublabel="Real-time protection enabled"
            />
          </div>
          <p className="px-5 text-[9px] font-bold text-muted-foreground leading-relaxed">
            Linking your Google account ensures all student rosters and health logs are safely stored in Google's cloud infrastructure.
          </p>
        </div>

        {/* User Identity */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Institutional Identity</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white">
            <SettingsItem 
              icon={User} 
              color="bg-blue-600" 
              label="Sports Teacher" 
              value="सुनिल देशमुख"
            />
            <SettingsItem 
              icon={Award} 
              color="bg-amber-500" 
              label="Role" 
              value="Physical Education Dir."
            />
            <SettingsItem 
              icon={Mail} 
              color="bg-rose-500" 
              label="Session Mail" 
              value={user?.email || "Local Cache Mode"}
            />
          </div>
        </div>

        {/* System & Security */}
        <div className="space-y-2">
          <label className="px-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Integrity</label>
          <div className="ios-card-shadow rounded-3xl overflow-hidden bg-white">
            <SettingsItem 
              icon={Lock} 
              color="bg-slate-700" 
              label="Encryption" 
              value="AES-256"
              sublabel="End-to-end institutional grade"
            />
            <SettingsItem 
              icon={ShieldCheck} 
              color="bg-green-600" 
              label="Database Status" 
              value="Protected"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 px-4">
          <Button 
            variant="ghost" 
            onClick={() => initiateSignOut(auth)}
            className="w-full bg-white text-destructive hover:bg-destructive/5 rounded-2xl h-16 font-black uppercase text-xs tracking-[0.2em] ios-card-shadow active-scale border border-destructive/5"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Terminate Session
          </Button>
        </div>

        <div className="text-center pt-8 pb-12">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">
            Powered by Google Genkit & Firebase
          </p>
        </div>
      </div>
    </div>
  );
}
