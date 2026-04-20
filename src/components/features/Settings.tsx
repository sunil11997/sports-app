
"use client";

import React from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateGoogleBackup, initiateSignOut } from '@/firebase/non-blocking-login';
import { 
  Cloud, 
  ChevronRight, 
  User, 
  Info, 
  LogOut, 
  ShieldCheck, 
  Award, 
  Smartphone,
  School,
  Mail,
  Smartphone as PhoneIcon,
  Wifi,
  Github
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Settings() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleBackup = () => {
    initiateGoogleBackup(auth)
      .then(() => {
        toast({ title: "Backup Successful", description: "Your profile is now synced with Google." });
      })
      .catch((err) => {
        toast({ variant: "destructive", title: "Backup Failed", description: err.message });
      });
  };

  const isGoogleLinked = user?.providerData.some(p => p.providerId === 'google.com');

  const SettingsItem = ({ icon: Icon, color, label, value, onClick, sublabel }: any) => (
    <button 
      onClick={onClick}
      className="ios-list-item w-full text-left group"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg text-white", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {sublabel && <span className="text-[10px] font-bold text-muted-foreground uppercase">{sublabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-active:translate-x-1 transition-transform" />
      </div>
    </button>
  );

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-3xl font-black text-primary tracking-tight">SETTINGS</h2>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Waghamba Sports Health Hub</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="space-y-2">
          <label className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profile & Cloud</label>
          <div className="ios-card-shadow rounded-2xl overflow-hidden">
            <SettingsItem 
              icon={User} 
              color="bg-blue-500" 
              label="Teacher Profile" 
              value="Sunil Deshmukh"
              sublabel="Sports Teacher"
            />
            <SettingsItem 
              icon={Cloud} 
              color="bg-sky-400" 
              label="Google Backup" 
              value={isGoogleLinked ? "Active" : "Not Configured"}
              onClick={handleBackup}
            />
            <SettingsItem 
              icon={Mail} 
              color="bg-red-400" 
              label="Email Address" 
              value={user?.email || "Guest User"}
            />
          </div>
        </div>

        {/* Institution Section */}
        <div className="space-y-2">
          <label className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Institution</label>
          <div className="ios-card-shadow rounded-2xl overflow-hidden">
            <SettingsItem 
              icon={School} 
              color="bg-green-600" 
              label="School Name" 
              value="शासकीय माध्यमिक आश्रम शाळा वाघंबा"
            />
            <SettingsItem 
              icon={Award} 
              color="bg-yellow-500" 
              label="Designation" 
              value="Senior Sports Coach"
            />
            <SettingsItem 
              icon={PhoneIcon} 
              color="bg-slate-500" 
              label="Contact" 
              value="+91 Nashik"
            />
          </div>
        </div>

        {/* System Section */}
        <div className="space-y-2">
          <label className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System</label>
          <div className="ios-card-shadow rounded-2xl overflow-hidden">
            <SettingsItem 
              icon={Wifi} 
              color="bg-orange-500" 
              label="Cloud Status" 
              value="Live Syncing"
            />
            <SettingsItem 
              icon={ShieldCheck} 
              color="bg-indigo-500" 
              label="Security Mode" 
              value="DBAC Multi-Layer"
            />
            <SettingsItem 
              icon={Info} 
              color="bg-gray-400" 
              label="App Version" 
              value="v2.5.0-iOS"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <Button 
            variant="ghost" 
            onClick={() => initiateSignOut(auth)}
            className="w-full bg-white text-destructive hover:bg-destructive/5 rounded-2xl h-14 font-black uppercase text-sm tracking-widest ios-card-shadow"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out Session
          </Button>
        </div>

        <div className="text-center py-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
            Powered by Firebase Cloud Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
