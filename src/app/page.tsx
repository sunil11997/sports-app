
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useSchoolData } from '@/hooks/use-school-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Trophy, 
  UsersRound, 
  UserCircle,
  Activity,
  ArrowLeft,
  ArrowRight,
  Menu,
  Star,
  Loader2,
  CalendarDays,
  ChevronRight,
  FileText,
  FileBadge,
  CircleArrowUp,
  Cake,
  TrendingUp,
  History,
  Medal,
  BrainCircuit,
  ClipboardList,
  Crown,
  RotateCw,
  IdCard,
  Bell,
  Gift,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Volume2,
  Download,
  Smartphone,
  Share2,
  ShieldCheck,
  Shirt,
  Package,
  Sun,
  Lock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn, initiateSignOut } from '@/firebase/non-blocking-login';
import { cn, isBirthdayToday, transliterateEnglishToMarathi } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { usePWA } from '@/components/providers/pwa-provider';
import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

const HubFallback = () => (
  <div className="p-6">
    <TableSkeleton rows={6} cols={4} />
  </div>
);

/**
 * Platinum Hub v5.3 Stable
 * Hardened for Screen Rotation and Nothing Phone (2a) Safe Areas.
 */
import { Dashboard } from '@/components/features/Dashboard';
import { PasscodeLock } from '@/components/features/PasscodeLock';

const Registration = dynamic(
  () => import('@/components/features/Registration').then((m) => m.Registration),
  { ssr: false, loading: () => <HubFallback /> }
);
const Attendance = dynamic(
  () => import('@/components/features/Attendance').then((m) => m.Attendance),
  { ssr: false, loading: () => <HubFallback /> }
);
const Fitness = dynamic(
  () => import('@/components/features/Fitness').then((m) => m.Fitness),
  { ssr: false, loading: () => <HubFallback /> }
);
const ExamsHub = dynamic(
  () => import('@/components/features/ExamsHub').then((m) => m.ExamsHub),
  { ssr: false, loading: () => <HubFallback /> }
);
const PromotionHub = dynamic(
  () => import('@/components/features/PromotionHub').then((m) => m.PromotionHub),
  { ssr: false, loading: () => <HubFallback /> }
);
const GameHub = dynamic(
  () => import('@/components/features/GameHub').then((m) => m.GameHub),
  { ssr: false, loading: () => <HubFallback /> }
);
const Settings = dynamic(
  () => import('@/components/features/Settings').then((m) => m.Settings),
  { ssr: false, loading: () => <HubFallback /> }
);
const PerformanceDossier = dynamic(
  () => import('@/components/features/History').then((m) => m.PerformanceDossier),
  { ssr: false, loading: () => <HubFallback /> }
);
const Gamification = dynamic(
  () => import('@/components/features/Gamification').then((m) => m.Gamification),
  { ssr: false, loading: () => <HubFallback /> }
);
const PlayerIDCardManager = dynamic(
  () => import('@/components/features/PlayerIDCardManager').then((m) => m.PlayerIDCardManager),
  { ssr: false, loading: () => <HubFallback /> }
);
const AIAdvice = dynamic(
  () => import('@/components/features/AIAdvice').then((m) => m.AIAdvice),
  { ssr: false, loading: () => <HubFallback /> }
);
const PerformanceHub = dynamic(
  () => import('@/components/features/PerformanceHub').then((m) => m.PerformanceHub),
  { ssr: false, loading: () => <HubFallback /> }
);
const HallOfFame = dynamic(
  () => import('@/components/features/HallOfFame').then((m) => m.HallOfFame),
  { ssr: false, loading: () => <HubFallback /> }
);
const ClassesSection = dynamic(
  () => import('@/components/features/ClassesSection').then((m) => m.ClassesSection),
  { ssr: false, loading: () => <HubFallback /> }
);
const DailyReport = dynamic(
  () => import('@/components/features/DailyReport').then((m) => m.DailyReport),
  { ssr: false, loading: () => <HubFallback /> }
);
const MatchScoreboard = dynamic(
  () => import('@/components/features/MatchScoreboard').then((m) => m.MatchScoreboard),
  { ssr: false, loading: () => <HubFallback /> }
);
const OtpLogin = dynamic(
  () => import('@/components/features/OtpLogin').then((m) => m.OtpLogin),
  { ssr: false }
);
const TeamEligibilityRoster = dynamic(
  () => import('@/components/features/TeamEligibilityRoster').then((m) => m.TeamEligibilityRoster),
  { ssr: false, loading: () => <HubFallback /> }
);
const PlayerPositionJerseyManager = dynamic(
  () => import('@/components/features/PlayerPositionJerseyManager').then((m) => m.PlayerPositionJerseyManager),
  { ssr: false, loading: () => <HubFallback /> }
);
const EquipmentInventoryHub = dynamic(
  () => import('@/components/features/EquipmentInventoryHub').then((m) => m.EquipmentInventoryHub),
  { ssr: false, loading: () => <HubFallback /> }
);
const ParentProgressShareModal = dynamic(
  () => import('@/components/features/ParentProgressShareModal').then((m) => m.ParentProgressShareModal),
  { ssr: false }
);

const translations = {
  English: {
    schoolName: "ASHRAM SHALA WAGHAMBA",
    home: "Home",
    sport: "Sport Hub",
    students: "Students",
    profile: "Profile",
    enter: "ACCESS HUB"
  },
  Marathi: {
    schoolName: "शासकीय आश्रम शाळा वाघंबा",
    home: "मुख्यपृष्ठ",
    sport: "क्रीडा विभाग",
    students: "विद्यार्थी",
    profile: "प्रोफाइल",
    enter: "हब मध्ये प्रवेश करा"
  }
};

const LOGO_PATH = "/icon-512.png";
const SPLASH_LOTTIE_URL = "https://lottie.host/33acb9fa-1151-11ee-9728-ff4c18263730/8X5iIe9y9f.json";

export default function WaghambaApp() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashData, setSplashData] = useState<any>(null);
  const [stage, setStage] = useState<'landing' | 'selector' | 'hub'>('landing');
  const [selectedSection, setSelectedSection] = useState<'sports' | 'general' | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<'English' | 'Marathi'>('English');
  const [subTab, setSubTab] = useState<string>("overview");
  const [headerDate, setHeaderDate] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [otpUser, setOtpUser] = useState<string | null>(null);
  
  const schoolData = useSchoolData(stage === 'hub' || stage === 'selector' || showSplash);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [activeAchievements, setActiveAchievements] = useState<any[]>([]);
  const [isGroundMode, setIsGroundMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wgb_ground_mode') === 'true';
    }
    return false;
  });
  const [isParentShareOpen, setIsParentShareOpen] = useState(false);
  const [sharePlayerId, setSharePlayerId] = useState<string | undefined>(undefined);

  const toggleGroundMode = useCallback(() => {
    setIsGroundMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('wgb_ground_mode', String(next));
      }
      toast({
        title: next ? "मैदान मोड सुरू झाला! ☀️" : "सामान्य मोड सुरू झाला",
        description: next ? "कडक उन्हात स्पष्ट दिसण्यासाठी हाय-कॉन्ट्रास्ट व मोठे बटन्स सक्रिय केले आहेत." : "स्टाफ रूम मोड सक्रिय.",
        className: next ? "bg-amber-500 text-slate-950 font-black" : ""
      });
      return next;
    });
  }, [toast]);

  const handleTriggerAppInstall = useCallback(async () => {
    if (isStandalone) {
      toast({
        title: "ॲप आधीच इन्स्टॉल आहे!",
        description: "तुम्ही ॲप स्टँडअलोन मोडमध्ये वापरत आहात.",
        className: "bg-emerald-600 text-white font-bold"
      });
      return;
    }
    const success = await installApp();
    if (!success) {
      setIsInstallGuideOpen(true);
    }
  }, [isStandalone, installApp, toast]);

  // Register Service Worker on mount for mobile push notifications
  useEffect(() => {
    setIsMounted(true);
    setHeaderDate(format(new Date(), 'dd MMM yyyy'));
    
    if (typeof window !== 'undefined') {
      const savedOtpUser = localStorage.getItem('wgb_otp_auth_user');
      if (savedOtpUser) {
        setOtpUser(savedOtpUser);
      }

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      // Register service worker for Android Chrome & mobile PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('Service Worker registered for mobile push:', reg.scope);
        }).catch((err) => {
          console.warn('SW registration error:', err);
        });
      }
    }

    fetch(SPLASH_LOTTIE_URL)
      .then(res => res.ok ? res.json() : null)
      .then(data => setSplashData(data))
      .catch(() => setSplashData(null));

    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Request Notification Permission from User (Touch triggered for mobile browser compliance)
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({ title: "असमर्थित", description: "या ब्राउझरमध्ये नोटिफिकेशन्स समर्थित नाहीत." });
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        if ('vibrate' in navigator) {
          try { navigator.vibrate([100, 50, 100]); } catch (e) {}
        }
        toast({
          title: "🔔 मोबाईल सूचना सुरू झाल्या!",
          description: "आता खेळाडूंचा वाढदिवस व यशाच्या सूचना थेट तुमच्या फोनवर येतील.",
          className: "bg-emerald-600 text-white font-bold"
        });

        // Test push notification
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification("वाघंबा स्पोर्ट्स हब 🏆", {
              body: "मोबाईल सूचना यशस्वीरित्या सक्रिय केल्या आहेत!",
              icon: '/icon-512.png',
              badge: '/icon-192.png'
            });
          });
        }
      } else {
        toast({ title: "सूचना नाकारल्या", description: "तुम्ही ब्राउझर सेटिंग्जमधून सूचना सुरू करू शकता.", variant: "destructive" });
      }
    } catch (e) {
      console.warn("Permission request error:", e);
    }
  }, [toast]);

  // Robust Mobile & Desktop Notification Dispatcher
  const sendAppAlert = useCallback(async (title: string, body: string, icon = '/icon-512.png') => {
    if (typeof window === 'undefined') return;

    // Mobile Vibration
    if ('vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) {}
    }

    // 1. Android / Mobile Service Worker Push
    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          await (reg as any).showNotification(title, {
            body,
            icon,
            badge: '/icon-192.png',
            tag: title,
            vibrate: [200, 100, 200],
            data: { url: '/' }
          });
          return;
        }
      } catch (e) {
        console.warn('SW notification fallback:', e);
      }
    }

    // 2. Desktop Notification fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
        return;
      } catch (e) {}
    }

    // 3. In-App Toast
    toast({ title, description: body });
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'home') setSubTab('overview');
    else if (activeTab === 'students') setSubTab('list');
  }, [activeTab]);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user && auth) {
      const timer = setTimeout(() => initiateAnonymousSignIn(auth), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, auth, isMounted]);

  // Happy Birthday & New Achievement Notifications
  useEffect(() => {
    if (!schoolData.isLoaded || !schoolData.data.players) return;

    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const todayBirthdayKey = format(new Date(), 'MM-dd');

    // 1. Birthday Checks (Daily Mobile Push Notification)
    const bdays = (schoolData.data.players || []).filter((p: any) => isBirthdayToday(p.dob));
    const lastBirthdayNotify = localStorage.getItem('wgb_birthday_notify_date');

    if (lastBirthdayNotify !== todayDate && bdays.length > 0) {
      bdays.forEach((p: any) => {
        const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
        sendAppAlert(
          "🎂 वाढदिवसाच्या हार्दिक शुभेच्छा! 🎉",
          `${displayName} (इयत्ता ${p.std || '---'} वी) चा आज वाढदिवस आहे! शुभेच्छा देण्यासाठी टॅप करा.`
        );
      });
      localStorage.setItem('wgb_birthday_notify_date', todayDate);
    }

    // 2. Achievement Checks (Trigger once per unique milestone achieved)
    try {
      const players = schoolData.data.players || [];
      const attendance = schoolData.data.attendance || {};
      const fitness = schoolData.data.fitness || {};
      const health = schoolData.data.healthIncidents || [];
      
      const notifiedKey = 'wgb_notified_achievements';
      const notifiedMap = JSON.parse(localStorage.getItem(notifiedKey) || '{}');
      let mapChanged = false;
      const achievementsList: any[] = [];

      players.forEach((p: any) => {
        if (p.category !== 'athlete') return;
        const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;

        // A. Consistency King: streak >= 15
        let streak = 0;
        const now = new Date();
        for (let i = 0; i < 30; i++) {
          const d = format(subDays(now, i), 'yyyy-MM-dd');
          const isPresent = attendance[`${p.id}_${d}_Morning`] === 'P' || attendance[`${p.id}_${d}_Evening`] === 'P';
          if (isPresent) streak++;
          else break;
        }

        const consistencyKey = `${p.id}_consistency`;
        if (streak >= 15) {
          achievementsList.push({
            id: consistencyKey,
            player: p,
            title: "🔥 सराव सातत्य विजेता (Consistency King)",
            desc: `${displayName} ने सलग ${streak} दिवस सरावाला उपस्थित राहून विक्रम केला आहे.`
          });

          if (!notifiedMap[consistencyKey]) {
            sendAppAlert(
              "🏆 नवीन क्रीडा यश प्राप्त!",
              `${displayName} ने सलग ${streak} दिवसांचा सराव पूर्ण करून 'Consistency King' बॅज मिळवला!`
            );
            notifiedMap[consistencyKey] = true;
            mapChanged = true;
          }
        }

        // B. Recovery Champion
        const hadCriticalInjury = health.some((h: any) => h.playerId === p.id && h.severity === 'Critical');
        const fitData = fitness[p.id] || {};
        const isRecoveryChampion = hadCriticalInjury && (fitData.status === 'Elite' || fitData.status === 'Optimal');

        const recoveryKey = `${p.id}_recovery`;
        if (isRecoveryChampion) {
          achievementsList.push({
            id: recoveryKey,
            player: p,
            title: "🛡️ रिकव्हरी चॅम्पियन (Recovery Champion)",
            desc: `${displayName} दुखापतीतून पूर्णपणे बरा होऊन ${fitData.status} फिटनेस पातळीवर परतला आहे.`
          });

          if (!notifiedMap[recoveryKey]) {
            sendAppAlert(
              "🛡️ दुखापतीतून यशस्वी पुनरागमन!",
              `${displayName} ने १००% तंदुरुस्ती मिळवून 'Recovery Champion' बॅज प्राप्त केला!`
            );
            notifiedMap[recoveryKey] = true;
            mapChanged = true;
          }
        }
      });

      setActiveAchievements(achievementsList);

      if (mapChanged) {
        localStorage.setItem(notifiedKey, JSON.stringify(notifiedMap));
      }
    } catch (err) {
      console.warn("Failed to check achievements: ", err);
    }

  }, [schoolData.isLoaded, schoolData.data, sendAppAlert]);

  const toggleRotation = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.screen?.orientation) {
        const orientation = window.screen.orientation;
        if (orientation.type.startsWith('portrait')) {
          await (orientation as any).lock('landscape').catch(() => {
             orientation.unlock();
             toast({ title: "Rotation Enabled", description: "Turn device to rotate view." });
          });
          toast({ title: "Landscape Active", description: "App locked to wide view." });
        } else {
          await (orientation as any).lock('portrait').catch(() => {
             orientation.unlock();
          });
          toast({ title: "Portrait Active", description: "App locked to tall view." });
        }
      } else {
        toast({ title: "System Restricted", description: "Rotation API requires PWA mode." });
      }
    } catch (e) {
      toast({ title: "System Restricted", description: "Orientation lock restricted by browser.", variant: "destructive" });
    }
  }, [toast]);

  const t = useMemo(() => translations[language], [language]);

  const sportsTabs = useMemo(() => [
    { id: "home", label: t.home, icon: Home },
    { id: "sport", label: t.sport, icon: Trophy },
    { id: "daily-report", label: language === 'Marathi' ? "दैनिक अहवाल" : "Daily Report", icon: FileText },
    { id: "students", label: t.students, icon: UsersRound },
    { id: "profile", label: t.profile, icon: UserCircle },
  ], [t, language]);

  const birthdaysToday = useMemo(() => {
    if (!isMounted || !schoolData?.data?.players) return [];
    return (schoolData.data.players || []).filter((p: any) => isBirthdayToday(p.dob));
  }, [isMounted, schoolData?.data?.players]);

  const activePasscode = schoolData.data.schoolProfile?.passcode || (typeof window !== 'undefined' ? localStorage.getItem('wgb_app_pin_lock') : null);

  if (!isMounted) return <div className="min-h-screen bg-[#1e3a8a]" />;

  if (showSplash) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-0 z-[9999] fixed inset-0 bg-[#071d49] select-none overflow-hidden"
      >
        <Image 
          src="/splash.jpg" 
          alt="Waghamba Sports Health Hub Splash Screen" 
          fill
          priority
          unoptimized
          className="object-contain object-center animate-in fade-in zoom-in-95 duration-700" 
        />
      </div>
    );
  }

  // 🔒 Security PIN Lock Gate
  if (activePasscode && !isUnlocked) {
    return (
      <PasscodeLock 
        correctPasscode={activePasscode} 
        onSuccess={() => setIsUnlocked(true)} 
        onResetPin={() => {
          schoolData.updatePasscode("");
          setIsUnlocked(true);
        }}
        teacherEmail={user?.email || schoolData.data.schoolProfile?.adminEmail}
        language={language}
      />
    );
  }

  if (stage === 'hub' && selectedSection) {
    const teacher = schoolData.data.schoolProfile;
    const totalAthletes = (schoolData.data.players || []).filter((p: any) => p.category === 'athlete').length;
    const totalStudents = (schoolData.data.players || []).length;
    const activeDisplayCount = selectedSection === 'sports' ? totalAthletes : totalStudents;
    const countLabel = selectedSection === 'sports' ? "Total Athletes" : "Registered Students";
    
    return (
      <div className={cn("min-h-screen flex flex-col bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))]", isGroundMode && "ground-mode")}>
        <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b py-2.5 sm:py-3 px-3 sm:px-6 z-50 shadow-sm safe-area-top">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 shrink" onClick={() => setStage('selector')}>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center bg-white rounded-xl border shadow-sm p-0.5 overflow-hidden">
                <Image src={LOGO_PATH} alt="Logo" width={40} height={40} unoptimized className="object-contain w-full h-full" priority />
              </div>
              <h1 className="text-xs sm:text-base font-display font-black uppercase text-primary leading-none tracking-tight truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
                {selectedSection === 'sports' ? "Sports Hub" : "Student Registry"}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* High Contrast Ground Mode Toggle Button */}
              <button 
                onClick={toggleGroundMode}
                className={cn(
                  "h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-full flex items-center justify-center gap-1.5 text-[10px] font-black tracking-wide border transition-all active-scale",
                  isGroundMode 
                    ? "bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/50" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                )}
                title="मैदान मोड (High-Contrast Sunlight Mode)"
              >
                <Sun className={cn("w-3.5 h-3.5", isGroundMode ? "text-slate-950 animate-spin" : "text-amber-600")} />
                <span className="hidden sm:inline">{isGroundMode ? "मैदान चालू" : "मैदान मोड"}</span>
              </button>

              {!isStandalone && (
                <button 
                  onClick={handleTriggerAppInstall} 
                  className="h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-wide border border-emerald-500/30 transition-all active-scale"
                  title="ॲप इन्स्टॉल करा (Install App)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                  <span className="hidden sm:inline">इन्स्टॉल</span>
                </button>
              )}
              <button 
                onClick={() => setIsNotificationOpen(true)} 
                className="relative h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active-scale"
                title="सूचना व वाढदिवस (Notifications)"
              >
                <Bell className="w-4 h-4" />
                {(birthdaysToday.length > 0 || activeAchievements.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse border border-white shadow-sm">
                    {birthdaysToday.length + activeAchievements.length}
                  </span>
                )}
              </button>
              <button onClick={toggleRotation} className="hidden xs:flex h-8 w-8 rounded-full bg-primary/5 text-primary items-center justify-center hover:bg-primary/10 transition-colors" title="Rotate View">
                <RotateCw className="w-4 h-4" />
              </button>
              {activePasscode && (
                <button 
                  onClick={() => {
                    setIsUnlocked(false);
                    toast({
                      title: language === 'Marathi' ? "ॲप लॉक केले 🔒" : "App Locked 🔒",
                      description: language === 'Marathi' ? "प्रवेश करण्यासाठी पुन्हा पिन टाका." : "Enter PIN to access.",
                      className: "bg-slate-900 text-white font-bold"
                    });
                  }}
                  className="h-8 w-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 flex items-center justify-center transition-colors active-scale"
                  title="ॲप लॉक करा (Lock App)"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{headerDate}</span>
              </div>
              <button onClick={() => setStage('selector')} className="rounded-full h-8 w-8 text-primary hover:bg-primary/5 flex items-center justify-center transition-colors" title="Menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 h-full">
            
            <TabsContent value="home" className="mt-0 space-y-6 sm:space-y-8 animate-in fade-in duration-700 h-full">
              <div className="flex bg-muted/40 p-1 rounded-2xl border w-full sm:w-fit mb-4 sm:mb-6 shadow-inner overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => setSubTab("overview")} 
                  className={cn("rounded-xl h-10 sm:h-11 px-4 sm:px-8 font-black uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex-1 sm:flex-initial whitespace-nowrap", subTab === "overview" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Dashboard</button>
                <button 
                  onClick={() => setSubTab("roster")} 
                  className={cn("rounded-xl h-10 sm:h-11 px-4 sm:px-8 font-black uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex-1 sm:flex-initial whitespace-nowrap", subTab === "roster" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Full Roster</button>
                <button 
                  onClick={() => setSubTab("enroll")} 
                  className={cn("rounded-xl h-10 sm:h-11 px-4 sm:px-8 font-black uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex-1 sm:flex-initial whitespace-nowrap", subTab === "enroll" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
                >Enrollment</button>
              </div>

              {subTab === "overview" && (
                <div className="space-y-6 sm:space-y-12">
                  <Card className="rounded-2xl sm:rounded-[3.5rem] bg-primary p-5 sm:p-12 text-white shadow-2xl relative overflow-hidden border-none">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
                      <div className="lg:col-span-7 space-y-5 sm:space-y-8">
                        <div className="space-y-2 sm:space-y-3">
                          <Badge className="bg-white/10 text-white border-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Command Center V5.3</Badge>
                          <h2 className="text-2xl sm:text-5xl font-display font-black leading-tight tracking-tighter uppercase">
                            Welcome,<br/>{teacher?.teacherName?.split(' ')[0] || "Coach"}
                          </h2>
                        </div>
                        <div className="bg-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 backdrop-blur-sm max-w-sm">
                           <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-2 sm:mb-3 flex items-center gap-2"><UsersRound className="w-3.5 h-3.5 text-accent" /> {countLabel}</p>
                           <p className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">{activeDisplayCount}</p>
                           <p className="text-xs sm:text-sm font-bold text-white/60">Active Registry</p>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                          <Button onClick={() => setSubTab('roster')} className="h-12 sm:h-20 flex-1 px-6 sm:px-12 rounded-xl sm:rounded-3xl bg-accent text-accent-foreground font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-primary transition-all active-scale text-sm sm:text-lg">
                            Manage <ArrowRight className="ml-2 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6" />
                          </Button>
                          <Button onClick={toggleRotation} variant="outline" className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-3xl border-2 border-white/20 bg-white/5 hover:bg-white/10">
                            <RotateCw className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                          </Button>
                        </div>
                      </div>

                      <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                         {birthdaysToday.length > 0 && (
                           <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
                             <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner"><Cake className="text-white w-5 h-5 sm:w-6 sm:h-6 animate-bounce" /></div>
                                <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full shadow-sm">
                                  🎂 Today&apos;s Birthday Celebration!
                                </span>
                             </div>
                             <div className="space-y-2.5 sm:space-y-3">
                               {birthdaysToday.map((p: any) => (
                                 <div key={p.id} className="flex items-center justify-between border-b border-white/20 pb-2 last:border-0">
                                   <div>
                                     <p className="text-sm sm:text-base font-black uppercase text-white tracking-wide">{p.name}</p>
                                     {p.nameMarathi && <p className="text-xs text-white/80 font-bold">{p.nameMarathi}</p>}
                                   </div>
                                   <Badge className="bg-white text-rose-600 font-black text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-md">
                                     {p.std ? `Std ${p.std}` : p.category || 'Player'}
                                   </Badge>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                         <div className="bg-black/20 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-white/5 backdrop-blur-md">
                           <div className="flex justify-between items-start mb-4 sm:mb-6">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50/20 rounded-xl sm:rounded-2xl flex items-center justify-center"><Activity className="text-emerald-400 w-5 h-5 sm:w-6 sm:h-6" /></div>
                              <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">Synchronized</span>
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Attendance consistency</p>
                           <p className="text-2xl sm:text-3xl font-black">94% <span className="text-sm font-bold text-emerald-400 ml-2">↑ 2%</span></p>
                         </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {subTab === "roster" && <Dashboard store={schoolData} section={selectedSection || 'general'} t={t} />}
              {subTab === "enroll" && <Registration store={schoolData} section={selectedSection || 'general'} />}
            </TabsContent>

            <TabsContent value="sport" className="mt-0 h-full">
              <GameHub store={schoolData} />
            </TabsContent>

            <TabsContent value="icard" className="mt-0 h-full">
              <PlayerIDCardManager store={schoolData} section={selectedSection || 'sports'} />
            </TabsContent>

            <TabsContent value="daily-report" className="mt-0 h-full">
              <DailyReport store={schoolData} section={selectedSection || 'sports'} language={language} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 space-y-6 sm:space-y-8 animate-in fade-in duration-700 h-full">
              {subTab === "list" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { id: "equipment-inventory", label: "Equipment & Kit Inventory", desc: "साहित्य नोंद, वाटप-जमा व वार्षिक मागणी", icon: Package, color: "bg-amber-700" },
                      { id: "parent-share", label: "Parent WhatsApp Cards", desc: "पालक प्रगती व फिटनेस अहवाल पाठवा", icon: Share2, color: "bg-emerald-600" },
                      { id: "eligibility-roster", label: "DSO Eligibility Roster", desc: "Age Cut-off & U14/U17/U19 Validator", icon: ShieldCheck, color: "bg-blue-800" },
                      { id: "position-jersey", label: "Jersey & Position Chart", desc: "Tactical Indian Sports Tracker", icon: Shirt, color: "bg-emerald-700" },
                      { id: "scoreboard-module", label: "Live Match Scoreboard", desc: "Digital Kabaddi, Volleyball & Kho-Kho Board", icon: Trophy, color: "bg-amber-500" },
                      { id: "icard-module", label: "Official ID Cards", desc: "Player Identity & Printable Forms", icon: IdCard, color: "bg-blue-900" },
                      { id: "daily-report", label: "Daily Activity Report", desc: "Yoga, PT Mass & Drills Log", icon: FileText, color: "bg-amber-600" },
                      { id: "classes", label: "Students Registry", desc: "Std-wise Profiles", icon: ClipboardList, color: "bg-blue-600" },
                      { id: "hall-of-fame", label: "Hall of Fame", desc: "Top 5 Per Class", icon: Crown, color: "bg-amber-600" },
                      { id: "leaderboard", label: "Monthly Medals", desc: "Digital Appreciation", icon: Medal, color: "bg-amber-500" },
                      { id: "ai", label: "AI Coaching Hub", desc: "Predictive Analytics", icon: BrainCircuit, color: "bg-purple-600" },
                      { id: "performance", label: "History Dossier", desc: "Consolidated Records", icon: History, color: "bg-indigo-500" },
                      { id: "monthly-progress", label: "Monthly Progress", desc: "Athletic Metrics Registry", icon: TrendingUp, color: "bg-emerald-600" },
                      { id: "attendance", label: "Attendance Registry", desc: "Presence tracking", icon: CalendarDays, color: "bg-blue-500" },
                      { id: "fitness", label: "Fitness Evaluations", desc: "Physical test scores", icon: Activity, color: "bg-emerald-500" },
                      { id: "exams", label: "Institutional Exams", desc: "Term-wise grading", icon: FileText, color: "bg-amber-500" },
                      { id: "promotion", label: "Standard Promotion", desc: "Move students forward", icon: CircleArrowUp, color: "bg-rose-500" },
                    ].map(item => (
                      <Card key={item.id} onClick={() => {
                        if (item.id === "icard-module") setActiveTab("icard");
                        else if (item.id === "parent-share") setIsParentShareOpen(true);
                        else setSubTab(item.id);
                      }} className="border-2 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-md hover:shadow-xl bg-white relative overflow-hidden">
                        <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white shadow-md", item.color)}>
                          <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <h3 className="text-base sm:text-xl font-black text-primary uppercase tracking-tight">{item.label}</h3>
                        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">{item.desc}</p>
                        <ChevronRight className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSubTab("list")}
                    className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
                  </Button>
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {subTab === "equipment-inventory" && <EquipmentInventoryHub store={schoolData} />}
                    {subTab === "eligibility-roster" && <TeamEligibilityRoster store={schoolData} />}
                    {subTab === "position-jersey" && <PlayerPositionJerseyManager store={schoolData} />}
                    {subTab === "scoreboard-module" && <MatchScoreboard store={schoolData} />}
                    {subTab === "icard-module" && <PlayerIDCardManager store={schoolData} section={selectedSection || 'general'} />}
                    {subTab === "daily-report" && <DailyReport store={schoolData} section={selectedSection || 'sports'} language={language} />}
                    {subTab === "classes" && <ClassesSection store={schoolData} language={language} />}
                    {subTab === "hall-of-fame" && <HallOfFame store={schoolData} />}
                    {subTab === "leaderboard" && <Gamification store={schoolData} />}
                    {subTab === "ai" && <AIAdvice store={schoolData} />}
                    {subTab === "performance" && <PerformanceDossier store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "monthly-progress" && <PerformanceHub store={schoolData} />}
                    {subTab === "attendance" && <Attendance store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "fitness" && <Fitness store={schoolData} section={selectedSection || 'general'} language={language} />}
                    {subTab === "exams" && <ExamsHub store={schoolData} language={language} />}
                    {subTab === "promotion" && <PromotionHub store={schoolData} section={selectedSection || 'general'} language={language} />}
                  </div>
                </div>
              )}
            </TabsContent>

            <ParentProgressShareModal 
              isOpen={isParentShareOpen} 
              onClose={() => setIsParentShareOpen(false)} 
              store={schoolData} 
              initialPlayerId={sharePlayerId} 
            />

            <TabsContent value="i-card" className="mt-0 h-full">
              <PlayerIDCardManager store={schoolData} />
            </TabsContent>

            <TabsContent value="profile" className="mt-0 h-full">
               <Settings language={language} setLanguage={setLanguage} />
            </TabsContent>

          </Tabs>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t h-[calc(4.25rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-1 sm:px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="h-full flex items-center justify-around md:justify-center md:gap-8 max-w-7xl mx-auto w-full">
            {sportsTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                data-active={activeTab === tab.id} 
                className={cn("google-nav-item flex-1 min-w-0 max-w-[72px] sm:max-w-[90px] flex flex-col items-center gap-0.5 transition-all", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}
              >
                <div className={cn("google-nav-icon w-10 h-7 sm:w-14 sm:h-8 flex items-center justify-center rounded-full transition-all", activeTab === tab.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <tab.icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </div>
                <span className="google-nav-label text-[9px] sm:text-[10px] font-bold sm:font-black uppercase tracking-tight truncate w-full text-center leading-tight px-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  if (stage === 'selector') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-4xl w-full space-y-6 sm:space-y-12 my-auto py-6">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-2 sm:mb-4 flex items-center justify-center bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl sm:shadow-2xl border-2 sm:border-4 border-primary/10 p-2 overflow-hidden">
              <Image src={LOGO_PATH} alt="Logo" width={128} height={128} unoptimized className="object-contain w-full h-full" priority />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-primary tracking-tight uppercase">{t.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <button onClick={() => { setSelectedSection('sports'); setStage('hub'); }} className="bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 text-center shadow-md hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4 sm:mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-xl sm:text-2xl font-display font-black text-primary uppercase tracking-tight">Sports Hub</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 sm:mt-2 tracking-widest opacity-60">Athletics & Training</p>
            </button>
            <button onClick={() => { setSelectedSection('general'); setStage('hub'); }} className="bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 text-center shadow-md hover:shadow-2xl transition-all active-scale group border-2 border-transparent hover:border-primary/20">
              <UsersRound className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4 sm:mb-8 transition-transform group-hover:scale-110" />
              <h3 className="text-xl sm:text-2xl font-display font-black text-primary uppercase tracking-tight">Student Registry</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 sm:mt-2 tracking-widest opacity-60">Profiles & Records</p>
            </button>
          </div>

          {!isStandalone && (
            <div className="flex justify-center pt-2">
              <button 
                onClick={handleTriggerAppInstall} 
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg active-scale"
              >
                <Download className="w-4 h-4 animate-bounce" /> 📲 ॲप डाऊनलोड / इन्स्टॉल करा
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/20 to-primary/5 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center animate-in fade-in duration-700 my-auto py-4">
        
        {/* Left Branding Column */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-4 sm:space-y-6">
          <div className="relative w-28 h-28 sm:w-48 sm:h-48 mx-auto lg:mx-0 flex items-center justify-center overflow-hidden bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl sm:shadow-2xl border-2 sm:border-4 border-primary/10 p-2 sm:p-3">
            <Image src={LOGO_PATH} alt="Logo" width={192} height={192} unoptimized className="object-contain w-full h-full" priority />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Badge className="bg-primary text-white border-none px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-display font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">
              Official Institutional Portal
            </Badge>
            <h1 className="text-2xl sm:text-5xl font-display font-black text-primary tracking-tighter leading-tight uppercase">
              {language === 'Marathi' ? "शासकीय माध्यमिक" : "WAGHAMBA"}<br/>
              <span className="text-emerald-600">{language === 'Marathi' ? "आश्रम शाळा वाघंबा" : "SPORTS HUB"}</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground max-w-sm mx-auto lg:mx-0 leading-relaxed">
              {language === 'Marathi'
                ? "विद्यार्थी विकास, क्रीडा कौशल्ये आणि आरोग्य व्यवस्थापन प्रणाली."
                : "Comprehensive Student Athletics, Health Assessment & Physical Education Command Center."}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            {!isStandalone && (
              <Button 
                onClick={handleTriggerAppInstall} 
                className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg active-scale px-3.5 sm:px-4"
              >
                <Download className="mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" /> 📲 Install App
              </Button>
            )}
            <Button 
              onClick={toggleRotation} 
              variant="outline" 
              className="h-10 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-primary/10 text-primary font-display font-black text-[11px] sm:text-xs uppercase tracking-wider hover:bg-primary/5 active-scale px-3.5 sm:px-4"
            >
              <RotateCw className="mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" /> Rotate
            </Button>
            <button 
              onClick={() => setLanguage(language === 'English' ? 'Marathi' : 'English')} 
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-white border-2 border-primary/10 font-display font-black text-[11px] sm:text-xs text-primary uppercase tracking-wider hover:bg-primary/5 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {language === 'English' ? 'मराठी' : 'English'}
            </button>
          </div>
        </div>

        {/* Right OTP Authentication Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          {otpUser ? (
            <Card className="w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-primary/10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 text-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <UserCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-2">
                <Badge className="bg-emerald-600 text-white border-none px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                  OTP Session Active
                </Badge>
                <h3 className="text-xl sm:text-2xl font-display font-black text-primary uppercase tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-sm font-bold text-muted-foreground">
                  Logged in as <strong className="text-primary">{otpUser}</strong>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={() => setStage('selector')} 
                  className="w-full h-13 sm:h-16 rounded-xl sm:rounded-2xl bg-primary text-white font-display font-black uppercase tracking-widest shadow-xl text-sm sm:text-base active-scale"
                >
                  {translations[language].enter} <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <button
                  onClick={async () => {
                    setOtpUser(null);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('wgb_otp_auth_user');
                    }
                    if (auth) {
                      await initiateSignOut(auth);
                    }
                  }}
                  className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
                >
                  Switch Account / Sign Out
                </button>
              </div>
            </Card>
          ) : (
            <div className="w-full space-y-4">
              <OtpLogin 
                language={language}
                onLoginSuccess={(identifier) => {
                  setOtpUser(identifier);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('wgb_otp_auth_user', identifier);
                  }
                  setStage('selector');
                }} 
              />
            </div>
          )}
        </div>

      </div>
      <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-slate-900 via-primary to-indigo-950 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-black uppercase tracking-tight text-white leading-none">
                    सूचना केंद्र (Notification Center)
                  </DialogTitle>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white/70 uppercase">
                    वाढदिवस व क्रीडा यशाच्या थेट मोबाईल सूचना
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[65vh] overflow-y-auto">
            {/* Permission request alert banner if not granted */}
            {notificationPermission !== 'granted' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>मोबाईलवर थेट नोटिफिकेशन अलर्ट मिळवण्यासाठी सूचना सुरू करा.</span>
                </div>
                <Button 
                  onClick={requestNotificationPermission}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase h-10 rounded-xl shadow-sm"
                >
                  🔔 मोबाईल सूचना सुरू करा (Enable Notifications)
                </Button>
              </div>
            )}

            {/* App Installation Section if not standalone */}
            {!isStandalone && (
              <div className="p-3.5 sm:p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex items-center justify-between gap-2.5 sm:gap-3 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm">
                    📲
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">वाघंबा ॲप डाउनलोड करा</p>
                    <p className="text-[10px] font-semibold text-emerald-800">थेट फोनवर ॲप म्हणून चालवा (Standalone).</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setIsNotificationOpen(false);
                    handleTriggerAppInstall();
                  }}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl h-8 sm:h-9 px-3 sm:px-3.5 shadow-md active-scale shrink-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> इन्स्टॉल
                </Button>
              </div>
            )}

            {/* Birthdays Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-rose-600 flex items-center gap-2 tracking-wider">
                <Cake className="w-4 h-4" /> आजचे वाढदिवस (Today&apos;s Birthdays - {birthdaysToday.length})
              </h4>
              {birthdaysToday.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border text-center text-xs text-muted-foreground font-bold">
                  आज कोणाचाही वाढदिवस नाही.
                </div>
              ) : (
                birthdaysToday.map((p: any) => {
                  const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                  const wishText = encodeURIComponent(`🎉 शासकीय माध्यमिक आश्रम शाळा वाघंबा कडून *${displayName}* (इयत्ता ${p.std || '---'} वी) ला वाढदिवसाच्या हार्दिक क्रीडा शुभेच्छा! 🎂💐🏆`);
                  const phone = p.mobileNumber ? p.mobileNumber.replace(/\D/g, '') : '';
                  const wishUrl = phone ? `https://wa.me/91${phone}?text=${wishText}` : `https://wa.me/?text=${wishText}`;

                  return (
                    <div key={p.id} className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200 flex items-center justify-between gap-2.5 sm:gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0">
                          🎂
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs sm:text-sm text-slate-900 uppercase leading-none truncate">{displayName}</p>
                          <span className="text-[9px] sm:text-[10px] font-bold text-rose-700 uppercase mt-0.5 block truncate">
                            इयत्ता {p.std || '---'} वी &bull; Roll #{p.serialNumber || '0'}
                          </span>
                        </div>
                      </div>

                      <a 
                        href={wishUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="h-8 sm:h-9 px-2.5 sm:px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> शुभेच्छा
                      </a>
                    </div>
                  );
                })
              )}
            </div>

            {/* Achievements Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-primary flex items-center gap-2 tracking-wider">
                <Crown className="w-4 h-4 text-amber-500" /> अलीकडील यश व सन्मान (Recent Achievements)
              </h4>
              {activeAchievements.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border text-center text-xs text-muted-foreground font-bold">
                  सध्या नवीन यश प्रलंबित आहेत. सराव सुरू ठेवा!
                </div>
              ) : (
                activeAchievements.map((ach: any) => (
                  <div key={ach.id} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border-2 flex items-start gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-900 uppercase leading-tight">{ach.title}</p>
                      <p className="text-[11px] text-slate-600 font-medium mt-1 leading-snug">{ach.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="p-3 sm:p-4 bg-slate-50 border-t">
            <Button 
              onClick={() => setIsNotificationOpen(false)} 
              className="w-full h-10 sm:h-11 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-wider"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 📲 PWA Installation Guide Dialog */}
      <Dialog open={isInstallGuideOpen} onOpenChange={setIsInstallGuideOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[480px] rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl bg-white">
          <DialogHeader className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 sm:p-6 text-white text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  मोबाईल ॲप डाऊनलोड करा
                </DialogTitle>
                <p className="text-[10px] sm:text-[11px] font-bold text-white/80 uppercase tracking-wider mt-0.5">
                  Install WGB Sports App on your device
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-left bg-white">
            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase">
                <span>🤖</span> Android / Google Chrome मध्ये:
              </div>
              <ol className="text-xs text-slate-700 space-y-1 sm:space-y-1.5 list-decimal list-inside font-medium">
                <li>क्रोम ब्राउझरच्या वरच्या उजव्या कोपऱ्यात <strong>३ डॉट्स (⋮)</strong> वर क्लिक करा.</li>
                <li>यादीतील <strong>&apos;Install App&apos;</strong> किंवा <strong>&apos;Add to Home screen&apos;</strong> निवडा.</li>
                <li><strong>&apos;Install&apos;</strong> बटणावर क्लिक करा. ॲप थेट फोनच्या ॲप ड्रॉवरमध्ये येईल.</li>
              </ol>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase">
                <span>🍎</span> iPhone / Safari ब्राउझर मध्ये:
              </div>
              <ol className="text-xs text-slate-700 space-y-1 sm:space-y-1.5 list-decimal list-inside font-medium">
                <li>सफारीच्या तळाशी असलेल्या <strong>Share (📤)</strong> चिन्हावर टॅप करा.</li>
                <li>खाली स्क्रोल करून <strong>&apos;Add to Home Screen&apos;</strong> निवडा.</li>
                <li>वरच्या उजव्या कोपऱ्यात <strong>&apos;Add&apos;</strong> वर टॅप करा.</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="p-3 sm:p-4 bg-slate-50 border-t">
            <Button 
              onClick={() => setIsInstallGuideOpen(false)} 
              className="w-full h-10 sm:h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider"
            >
              समजले (Got it)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
