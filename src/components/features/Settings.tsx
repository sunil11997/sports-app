"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { initiateGoogleBackup, initiateGoogleSignIn, initiateSignOut } from '@/firebase/non-blocking-login';
import { Settings as SettingsIcon, CloudUpload, LogOut, CheckCircle, ShieldCheck, Mail, Info, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  const handleBackup = () => {
    setIsBackupLoading(true);
    
    // We call this directly (no await before the call) to satisfy browser popup requirements
    initiateGoogleBackup(auth)
      .then(() => {
        toast({
          title: "Gmail Sync Successful",
          description: "Your data is now safely backed up to your Google account."
        });
      })
      .catch((err: any) => {
        if (err.code === 'auth/popup-blocked') {
          toast({
            variant: "destructive",
            title: "Popup Blocked",
            description: "Please allow popups for this site in your browser settings to continue."
          });
        } else if (err.code === 'auth/credential-already-in-use') {
          // If the Google account is already linked to another user, we offer to sign in directly
          toast({
            variant: "destructive",
            title: "Account Already Exists",
            description: "This Google account is already associated with another profile. Please sign in directly.",
            action: (
              <Button variant="outline" size="sm" onClick={() => initiateGoogleSignIn(auth)}>
                Sign In
              </Button>
            )
          });
        } else {
          toast({
            variant: "destructive",
            title: "Sync Failed",
            description: err.message || "Could not connect to Google."
          });
        }
      })
      .finally(() => {
        setIsBackupLoading(false);
      });
  };

  const handleLogout = () => {
    initiateSignOut(auth);
  };

  const isGoogleLinked = user?.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">System Settings</h2>
          <p className="text-muted-foreground font-medium">Manage your account and cloud backup preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
            <div className="flex items-center gap-3">
              <CloudUpload className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl font-black text-primary uppercase">Gmail Cloud Backup</CardTitle>
            </div>
            <CardDescription className="font-medium">
              Link your account to Google to prevent data loss if you lose your phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {isGoogleLinked ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 p-6 rounded-3xl flex items-start gap-4">
                  <ShieldCheck className="w-10 h-10 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-black text-green-800 uppercase text-lg">Backup Active</h4>
                    <p className="text-green-700 font-medium">Your data is safely synced to your Google Account.</p>
                    <div className="flex items-center gap-2 mt-2 bg-white/50 w-fit px-3 py-1 rounded-full border border-green-200">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-800">{user?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="text-xs font-bold text-primary uppercase">All records are Auto-Syncing</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-start gap-4">
                  <Info className="w-10 h-10 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-black text-amber-800 uppercase text-lg">Backup Pending</h4>
                    <p className="text-amber-700 font-medium">
                      You are currently using a temporary guest session. Please link your Gmail to secure your data.
                    </p>
                  </div>
                </div>
                <Button 
                  disabled={isBackupLoading}
                  onClick={handleBackup}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-2xl text-xl shadow-lg uppercase tracking-wider transition-all"
                >
                  {isBackupLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <CloudUpload className="w-6 h-6 mr-3" />
                  )}
                  {isBackupLoading ? "Connecting..." : "Backup with Gmail"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">
                  * Popups must be allowed in your browser settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
            <div className="flex items-center gap-3">
              <LogOut className="w-6 h-6 text-destructive" />
              <CardTitle className="text-2xl font-black text-primary uppercase">Session Control</CardTitle>
            </div>
            <CardDescription className="font-medium">
              Manage your current active session on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border">
                <span className="font-bold text-muted-foreground uppercase text-xs">Login Method</span>
                <Badge variant={user?.isAnonymous ? "outline" : "default"} className="font-black uppercase">
                  {user?.isAnonymous ? "Guest Session" : "Google Authenticated"}
                </Badge>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border">
                <span className="font-bold text-muted-foreground uppercase text-xs">Device UID</span>
                <span className="font-mono text-[10px] text-muted-foreground font-bold">{user?.uid.substring(0, 12)}...</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="w-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-black h-14 rounded-2xl text-lg uppercase tracking-wider transition-all"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out / Exit
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                शासकिय माध्यमिक आश्रम शाळा वाघांबा
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
