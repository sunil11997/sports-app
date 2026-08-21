"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Share2, 
  Flame, 
  Zap, 
  Clock, 
  Users, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  Award, 
  Sparkles,
  AlertTriangle,
  History,
  CheckCircle2,
  Volleyball
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// -------------------------------------------------------------
// Web Audio API Synthesizer (100% Offline, Zero External MP3s)
// -------------------------------------------------------------
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Short Warning Tick
  public playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // High Warning Beep (at 10s / 5s)
  public playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Loud Referee Whistle (Dual high harmonic frequencies with flutter)
  public playWhistle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2600, now);
      osc2.frequency.setValueAtTime(3100, now);

      // Tremolo flutter
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(25, now);
      lfoGain.gain.setValueAtTime(200, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.setValueAtTime(0.8, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      lfo.stop(now + 0.85);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {}
  }

  // Deep Electric Buzzer (00:00 Raid Over / Inning End)
  public playBuzzer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(140, now + 1.1);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.setValueAtTime(0.8, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  }
}

const sfx = new SoundEffects();

// -------------------------------------------------------------
// School Houses & Presets
// -------------------------------------------------------------
const SCHOOL_HOUSES = [
  { id: 'shivaji', name: 'Shivaji House (शिवाजी सदन)', short: 'Shivaji', color: '#dc2626', bg: 'bg-red-600', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  { id: 'raman', name: 'Raman House (रमण सदन)', short: 'Raman', color: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  { id: 'tagore', name: 'Tagore House (टागोर सदन)', short: 'Tagore', color: '#16a34a', bg: 'bg-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'ashoka', name: 'Ashoka House (अशोक सदन)', short: 'Ashoka', color: '#d97706', bg: 'bg-amber-600', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  { id: 'custom', name: 'Custom School / Team', short: 'Team', color: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
];

interface MatchScoreboardProps {
  store: any;
  preselectedSport?: string;
}

interface ScoreEvent {
  id: string;
  timestamp: string;
  team: 'A' | 'B';
  teamName: string;
  points: number;
  type: string;
  desc: string;
  raiderName?: string;
}

export function MatchScoreboard({ store, preselectedSport = 'Kabaddi' }: MatchScoreboardProps) {
  const { toast } = useToast();
  const allPlayers = useMemo(() => store?.data?.players || [], [store]);

  // Sport Mode Selection
  const [sport, setSport] = useState<string>(() => {
    if (preselectedSport.includes('Kabaddi')) return 'Kabaddi';
    if (preselectedSport.includes('Kho')) return 'Kho Kho';
    if (preselectedSport.includes('Volley')) return 'Volleyball';
    return preselectedSport || 'Kabaddi';
  });

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Teams Configuration
  const [teamAHouse, setTeamAHouse] = useState('shivaji');
  const [teamBHouse, setTeamBHouse] = useState('raman');
  const [teamACustomName, setTeamACustomName] = useState('Shivaji House');
  const [teamBCustomName, setTeamBCustomName] = useState('Raman House');

  // Match Half/Period & Match Clock
  const [matchHalf, setMatchHalf] = useState<number>(1); // 1 = 1st Half, 2 = 2nd Half, 3 = Extra Time
  const [matchSecondsRemaining, setMatchSecondsRemaining] = useState<number>(1200); // Default 20 mins
  const [isMatchClockRunning, setIsMatchClockRunning] = useState<boolean>(false);

  // Points & Statistics
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [eventsLog, setEventsLog] = useState<ScoreEvent[]>([]);

  // -------------------------------------------------------------
  // KABADDI SPECIFIC STATES
  // -------------------------------------------------------------
  const [raidSeconds, setRaidSeconds] = useState<number>(30);
  const [isRaidRunning, setIsRaidRunning] = useState<boolean>(false);
  const [raidingTeam, setRaidingTeam] = useState<'A' | 'B'>('A');
  const [emptyRaidsA, setEmptyRaidsA] = useState<number>(0);
  const [emptyRaidsB, setEmptyRaidsB] = useState<number>(0);
  const [defendersA, setDefendersA] = useState<number>(7);
  const [defendersB, setDefendersB] = useState<number>(7);
  const [timeoutsA, setTimeoutsA] = useState<number>(2);
  const [timeoutsB, setTimeoutsB] = useState<number>(2);
  const [timeoutClock, setTimeoutClock] = useState<number | null>(null);

  // -------------------------------------------------------------
  // KHO-KHO SPECIFIC STATES
  // -------------------------------------------------------------
  const [khoTurn, setKhoTurn] = useState<number>(1); // 1, 2, 3, 4
  const [khoInningSeconds, setKhoInningSeconds] = useState<number>(540); // 9 minutes = 540s (7m = 420s)
  const [isKhoRunning, setIsKhoRunning] = useState<boolean>(false);
  const [chasingTeam, setChasingTeam] = useState<'A' | 'B'>('A');
  const [activeBatch, setActiveBatch] = useState<number>(1); // Batch 1 (3 def), Batch 2, Batch 3
  const [batchDismissedCount, setBatchDismissedCount] = useState<number>(0);
  const [turnScores, setTurnScores] = useState<Record<string, number>>({ 'T1_A': 0, 'T2_B': 0, 'T3_A': 0, 'T4_B': 0 });

  // -------------------------------------------------------------
  // VOLLEYBALL SPECIFIC STATES
  // -------------------------------------------------------------
  const [volleySet, setVolleySet] = useState<number>(1);
  const [setsWonA, setSetsWonA] = useState<number>(0);
  const [setsWonB, setSetsWonB] = useState<number>(0);
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>('A');
  const [setHistory, setSetHistory] = useState<{ set: number; a: number; b: number }[]>([]);

  // Audio Mute sync
  useEffect(() => {
    sfx.enabled = !soundMuted;
  }, [soundMuted]);

  // Sync House Names
  useEffect(() => {
    const hA = SCHOOL_HOUSES.find(h => h.id === teamAHouse);
    if (hA && teamAHouse !== 'custom') setTeamACustomName(hA.name.split(' (')[0]);
  }, [teamAHouse]);

  useEffect(() => {
    const hB = SCHOOL_HOUSES.find(h => h.id === teamBHouse);
    if (hB && teamBHouse !== 'custom') setTeamBCustomName(hB.name.split(' (')[0]);
  }, [teamBHouse]);

  // -------------------------------------------------------------
  // 30-SECOND KABADDI RAID CLOCK INTERVAL
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (isRaidRunning && raidSeconds > 0) {
      interval = setInterval(() => {
        setRaidSeconds((prev) => {
          const next = prev - 1;
          // Audio cues
          if (next === 10) sfx.playWarning();
          else if (next <= 5 && next > 0) sfx.playTick();
          else if (next === 0) {
            sfx.playBuzzer();
            setIsRaidRunning(false);
            toast({
              title: "⏰ रेड वेळ संपली (Raid Time Out!)",
              description: `30 सेकंद पूर्ण झाले आहेत. गुण / आउट तपासा.`,
              variant: "destructive",
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRaidRunning, raidSeconds, toast]);

  // -------------------------------------------------------------
  // MATCH CLOCK INTERVAL
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (isMatchClockRunning && matchSecondsRemaining > 0) {
      interval = setInterval(() => {
        setMatchSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsMatchClockRunning(false);
            sfx.playWhistle();
            toast({
              title: "🏁 हाफ / सामना वेळ संपला (Half/Match Time End)",
              description: `अधिकृत शिट्टी वाजली आहे.`,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatchClockRunning, matchSecondsRemaining, toast]);

  // -------------------------------------------------------------
  // KHO-KHO INNING TIMER
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (isKhoRunning && khoInningSeconds > 0) {
      interval = setInterval(() => {
        setKhoInningSeconds((prev) => {
          const next = prev - 1;
          if (next === 30) sfx.playWarning();
          if (next === 0) {
            setIsKhoRunning(false);
            sfx.playWhistle();
            toast({
              title: `🏁 टर्न ${khoTurn} पूर्ण (Turn ${khoTurn} Over)`,
              description: `९/७ मिनिटांची वेळ पूर्ण झाली आहे.`,
            });
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isKhoRunning, khoInningSeconds, khoTurn, toast]);

  // -------------------------------------------------------------
  // 30s TIMEOUT TIMER
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (timeoutClock !== null && timeoutClock > 0) {
      interval = setInterval(() => {
        setTimeoutClock(prev => {
          if (prev === 1) {
            sfx.playBuzzer();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeoutClock]);

  // -------------------------------------------------------------
  // ACTIONS: KABADDI RAID CLOCK
  // -------------------------------------------------------------
  const startRaidClock = () => {
    if (raidSeconds === 0) setRaidSeconds(30);
    setIsRaidRunning(true);
  };

  const pauseRaidClock = () => {
    setIsRaidRunning(false);
  };

  const resetRaidClock = (newRaidingTeam?: 'A' | 'B') => {
    setIsRaidRunning(false);
    setRaidSeconds(30);
    if (newRaidingTeam) {
      setRaidingTeam(newRaidingTeam);
    } else {
      setRaidingTeam(prev => prev === 'A' ? 'B' : 'A');
    }
  };

  // Add Points Function
  const addScore = (team: 'A' | 'B', points: number, type: string, isDoOrDie: boolean = false) => {
    const teamName = team === 'A' ? teamACustomName : teamBCustomName;
    const opponent = team === 'A' ? 'B' : 'A';

    if (team === 'A') setScoreA(prev => prev + points);
    else setScoreB(prev => prev + points);

    // Event Log
    const newEvent: ScoreEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
      team,
      teamName,
      points,
      type,
      desc: `${teamName}: +${points} (${type})`
    };
    setEventsLog(prev => [newEvent, ...prev]);

    // Kabaddi specific adjustments
    if (sport === 'Kabaddi') {
      if (type.includes('Raid') || type.includes('Touch') || type.includes('Bonus')) {
        // Successful raid: reset empty raid count for raiding team
        if (team === 'A') setEmptyRaidsA(0);
        else setEmptyRaidsB(0);

        // Deduct defenders from defending team
        if (team === 'A') {
          setDefendersB(prev => Math.max(1, prev - (points >= 3 ? points - (type.includes('Bonus') ? 1 : 0) : points)));
        } else {
          setDefendersA(prev => Math.max(1, prev - (points >= 3 ? points - (type.includes('Bonus') ? 1 : 0) : points)));
        }
      } else if (type.includes('Tackle') || type.includes('Super Tackle')) {
        // Raider tackled out: defending team gets point
        // Deduct 1 defender from the raiding team
        if (team === 'A') {
          setDefendersB(prev => Math.max(1, prev - 1));
        } else {
          setDefendersA(prev => Math.max(1, prev - 1));
        }
      } else if (type === 'All-Out') {
        // All out: restore 7 defenders for opponent
        if (opponent === 'A') setDefendersA(7);
        else setDefendersB(7);
        sfx.playWhistle();
      }

      // Auto reset raid clock for next raid
      resetRaidClock(opponent);
    }

    // Kho-Kho adjustments
    if (sport === 'Kho Kho') {
      setBatchDismissedCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
          // Batch cleared! Next batch in
          setActiveBatch(b => (b % 3) + 1);
          toast({
            title: `🛡️ तुकडी ${activeBatch} ऑल-आउट! (Batch ${activeBatch} Cleared)`,
            description: `पुढील ३ खेळाडूंची तुकडी मैदानात येत आहे.`,
          });
          return 0;
        }
        return next;
      });
    }

    // Volleyball Set check
    if (sport === 'Volleyball') {
      const currentScoreA = team === 'A' ? scoreA + points : scoreA;
      const currentScoreB = team === 'B' ? scoreB + points : scoreB;
      const targetPoints = (volleySet === 3 || volleySet === 5) ? 15 : 25;

      if ((currentScoreA >= targetPoints || currentScoreB >= targetPoints) && Math.abs(currentScoreA - currentScoreB) >= 2) {
        const setWinner = currentScoreA > currentScoreB ? 'A' : 'B';
        const winnerName = setWinner === 'A' ? teamACustomName : teamBCustomName;
        sfx.playWhistle();
        if (setWinner === 'A') setSetsWonA(prev => prev + 1);
        else setSetsWonB(prev => prev + 1);

        setSetHistory(prev => [...prev, { set: volleySet, a: currentScoreA, b: currentScoreB }]);
        setScoreA(0);
        setScoreB(0);
        setVolleySet(prev => prev + 1);

        toast({
          title: `🏆 सेट ${volleySet} विजयी: ${winnerName}!`,
          description: `गुण: ${currentScoreA} - ${currentScoreB}`,
        });
      }
    }
  };

  // Handle Empty Raid
  const handleEmptyRaid = () => {
    if (raidingTeam === 'A') {
      const nextCount = emptyRaidsA + 1;
      setEmptyRaidsA(nextCount);
      if (nextCount >= 3) {
        // Do or die failed: opponent gets point & raider out
        addScore('B', 1, 'Do-Or-Die Out');
        setEmptyRaidsA(0);
        return;
      }
    } else {
      const nextCount = emptyRaidsB + 1;
      setEmptyRaidsB(nextCount);
      if (nextCount >= 3) {
        addScore('A', 1, 'Do-Or-Die Out');
        setEmptyRaidsB(0);
        return;
      }
    }
    resetRaidClock(raidingTeam === 'A' ? 'B' : 'A');
  };

  // Undo Last Event
  const undoLastEvent = () => {
    if (eventsLog.length === 0) return;
    const last = eventsLog[0];
    if (last.team === 'A') setScoreA(prev => Math.max(0, prev - last.points));
    else setScoreB(prev => Math.max(0, prev - last.points));
    setEventsLog(prev => prev.slice(1));
    toast({ title: "कृती पूर्ववत केली (Event Undone)", description: `${last.desc} रद्द करण्यात आले.` });
  };

  // Trigger Team Timeout
  const triggerTimeout = (team: 'A' | 'B') => {
    if (team === 'A' && timeoutsA <= 0) return;
    if (team === 'B' && timeoutsB <= 0) return;

    if (team === 'A') setTimeoutsA(prev => prev - 1);
    else setTimeoutsB(prev => prev - 1);

    setIsRaidRunning(false);
    setIsMatchClockRunning(false);
    setIsKhoRunning(false);
    setTimeoutClock(30);
    sfx.playBuzzer();

    toast({
      title: `⏸️ अधिकृत टाइम-आऊट (३० सेकंद)`,
      description: `${team === 'A' ? teamACustomName : teamBCustomName} ने टाइम-आऊट घेतला आहे.`,
    });
  };

  // Reset Complete Match
  const resetEntireMatch = () => {
    if (!window.confirm("तुम्हाला संपूर्ण सामना रिसेट करायचा आहे का? (Reset all match scores?)")) return;
    setScoreA(0);
    setScoreB(0);
    setEventsLog([]);
    setRaidSeconds(30);
    setIsRaidRunning(false);
    setEmptyRaidsA(0);
    setEmptyRaidsB(0);
    setDefendersA(7);
    setDefendersB(7);
    setTimeoutsA(2);
    setTimeoutsB(2);
    setMatchSecondsRemaining(1200);
    setIsMatchClockRunning(false);
    setKhoTurn(1);
    setKhoInningSeconds(540);
    setIsKhoRunning(false);
    setActiveBatch(1);
    setBatchDismissedCount(0);
    setVolleySet(1);
    setSetsWonA(0);
    setSetsWonB(0);
    setSetHistory([]);
    setTimeoutClock(null);
    toast({ title: "सामना रिसेट झाला (Match Reset Completed)" });
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // House Colors Helper
  const houseAObj = SCHOOL_HOUSES.find(h => h.id === teamAHouse) || SCHOOL_HOUSES[0];
  const houseBObj = SCHOOL_HOUSES.find(h => h.id === teamBHouse) || SCHOOL_HOUSES[1];

  // -------------------------------------------------------------
  // WHATSAPP SHARE GENERATOR
  // -------------------------------------------------------------
  const shareMatchOnWhatsApp = () => {
    const leaderText = scoreA > scoreB ? `${teamACustomName} आघाडीवर (+${scoreA - scoreB})` : scoreB > scoreA ? `${teamBCustomName} आघाडीवर (+${scoreB - scoreA})` : "सामना बरोबरीत (Tie)";
    const text = `🏆 *शासकीय माध्यमिक आश्रम शाळा वाघंबा - क्रीडा निकाल* 🏆\n` +
      `🏅 *खेळ:* ${sport}\n` +
      `⚔️ *सामना:* ${teamACustomName} vs ${teamBCustomName}\n` +
      `📊 *गुणफलक (Score):*\n` +
      `👉 ${teamACustomName}: ${scoreA} गुण\n` +
      `👉 ${teamBCustomName}: ${scoreB} गुण\n` +
      `🎯 *स्थिती:* ${leaderText}\n\n` +
      `📅 दिनांक: ${new Date().toLocaleDateString('mr-IN')}\n` +
      `📍 स्थळ: आश्रम शाळा वाघंबा क्रीडा संकुल`;

    if (navigator.share) {
      navigator.share({ title: `${sport} Match Result`, text });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // -------------------------------------------------------------
  // PRINT A4 MATCH SCORECARD
  // -------------------------------------------------------------
  const printOfficialScorecard = () => {
    window.print();
  };

  return (
    <div className={cn("space-y-6 transition-all duration-300", isFullscreen && "fixed inset-0 z-50 bg-slate-950 p-4 md:p-8 overflow-y-auto")}>
      
      {/* ----------------- TOP CONTROLS BAR ----------------- */}
      <div className={cn("flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border shadow-sm", isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={cn("font-black text-lg uppercase tracking-tight", isFullscreen ? "text-white" : "text-primary")}>
                {sport} लाईव्ह गुणफलक
              </h2>
              <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest animate-pulse">
                LIVE ARENA
              </Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              शासकीय माध्यमिक आश्रम शाळा वाघंबा &bull; Inter-House Championship
            </p>
          </div>
        </div>

        {/* Sport Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted/60 p-1 rounded-xl border">
            {['Kabaddi', 'Kho Kho', 'Volleyball', 'General'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSport(s);
                  resetRaidClock();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                  sport === s ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundMuted(!soundMuted)}
            className="rounded-xl h-9 px-3 text-xs font-bold"
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareMatchOnWhatsApp}
            className="rounded-xl h-9 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
          >
            <Share2 className="w-4 h-4 mr-1.5" /> WhatsApp
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={printOfficialScorecard}
            className="rounded-xl h-9 px-3 text-xs font-bold"
          >
            <Printer className="w-4 h-4 mr-1.5" /> A4 पत्रक
          </Button>

          <Button
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-xl h-9 px-3 text-xs font-bold bg-primary text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 mr-1.5" /> : <Maximize2 className="w-4 h-4 mr-1.5" />}
            {isFullscreen ? "सामान्य स्क्रीन" : "स्टेडियम स्क्रीन"}
          </Button>
        </div>
      </div>

      {/* ----------------- TIMEOUT ALERT MODAL ----------------- */}
      {timeoutClock !== null && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-3xl shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 animate-spin" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">अधिकृत टाइम-आऊट सुरू आहे (30s TIMEOUT)</h3>
              <p className="text-xs font-bold">खेळाडूंनी रणनीती व पाणी घेण्यासाठी विश्रांती घ्यावी.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black font-mono tracking-tighter bg-slate-950 text-amber-400 px-4 py-1.5 rounded-2xl">
              00:{timeoutClock.toString().padStart(2, '0')}
            </span>
            <Button 
              size="sm" 
              onClick={() => setTimeoutClock(null)}
              className="bg-slate-950 text-white font-black hover:bg-slate-900 rounded-xl"
            >
              समाप्त करा (Resume)
            </Button>
          </div>
        </div>
      )}

      {/* ----------------- DIGITAL SCOREBOARD ARENA ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= TEAM A CARD ================= */}
        <Card className={cn(
          "lg:col-span-4 p-6 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden shadow-xl",
          isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200",
          sport === 'Kabaddi' && raidingTeam === 'A' && "ring-4 ring-orange-500 shadow-orange-500/20"
        )}>
          {/* Top Bar: House Selector */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={cn("w-4 h-4 rounded-full", houseAObj.bg)} />
                <select
                  value={teamAHouse}
                  onChange={(e) => setTeamAHouse(e.target.value)}
                  className="bg-muted/40 font-black text-xs uppercase rounded-xl px-2.5 py-1.5 border border-muted focus:outline-none text-foreground"
                >
                  {SCHOOL_HOUSES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              {sport === 'Kabaddi' && raidingTeam === 'A' && (
                <Badge className="bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" /> रेड सुरू (Raiding)
                </Badge>
              )}
            </div>

            <Input 
              value={teamACustomName}
              onChange={(e) => setTeamACustomName(e.target.value)}
              className="font-black text-xl md:text-2xl uppercase tracking-tight border-dashed border-2 rounded-2xl mb-4 text-center bg-transparent"
              placeholder="Team A Name"
            />

            {/* BIG SCORE DISPLAY */}
            <div className="text-center py-4 my-2 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-primary dark:text-amber-400 select-none">
                {scoreA}
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-1">
                एकूण गुण (Total Points)
              </p>
            </div>

            {/* Tactical Badges for Kabaddi */}
            {sport === 'Kabaddi' && (
              <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">कोर्टवरील खेळाडू</p>
                  <p className="text-lg font-black text-primary">{defendersA} / 7</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">रिकामी रेड (Empty)</p>
                  <p className={cn("text-lg font-black", emptyRaidsA === 2 ? "text-red-500 animate-pulse font-extrabold" : "text-primary")}>
                    {emptyRaidsA} / 2 {emptyRaidsA === 2 && "⚠️ DO-OR-DIE!"}
                  </p>
                </div>
              </div>
            )}

            {/* Kho-Kho Inning Summary */}
            {sport === 'Kho Kho' && (
              <div className="mt-4 p-3 rounded-2xl bg-muted/40 border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">सध्याची स्थिती (Status)</p>
                <p className="text-sm font-black text-primary">
                  {chasingTeam === 'A' ? "🏃‍♂️ चेसर संघ (Chasing)" : "🛡️ धावपटू तुकडी (Defenders Running)"}
                </p>
              </div>
            )}

            {/* Volleyball Sets Won */}
            {sport === 'Volleyball' && (
              <div className="mt-4 p-3 rounded-2xl bg-muted/40 border text-center flex items-center justify-around">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">जिंकलेले सेट (Sets)</p>
                  <p className="text-2xl font-black text-primary">{setsWonA}</p>
                </div>
                {servingTeam === 'A' && (
                  <Badge className="bg-blue-600 text-white font-black text-[10px]">
                    सर्व्हिस (Serving 🏐)
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* POINT BUTTONS KEYPAD */}
          <div className="space-y-2 pt-4 mt-4 border-t">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => addScore('A', 1, sport === 'Kabaddi' ? 'Touch Point' : 'Point')}
                className="h-12 font-black text-sm rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95"
              >
                +1 गुण
              </Button>
              <Button 
                onClick={() => addScore('A', 2, sport === 'Kabaddi' ? '2 Raid Points' : '+2 Points')}
                className="h-12 font-black text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
              >
                +2 गुण
              </Button>
              <Button 
                onClick={() => addScore('A', 3, 'Super Raid (+3)')}
                className="h-12 font-black text-xs rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md active:scale-95"
              >
                सुपर रेड +3
              </Button>
            </div>

            {sport === 'Kabaddi' && (
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => addScore('A', 1, 'Bonus Point')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-amber-500/40 text-amber-700 hover:bg-amber-50"
                >
                  बोनस +1
                </Button>
                <Button 
                  onClick={() => addScore('A', 2, 'Super Tackle (+2)')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-purple-500/40 text-purple-700 hover:bg-purple-50"
                >
                  सुपर टॅकल +2
                </Button>
                <Button 
                  onClick={() => addScore('A', 2, 'All-Out')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-red-500/40 text-red-700 hover:bg-red-50"
                >
                  ऑल-आउट +2
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => triggerTimeout('A')}
                disabled={timeoutsA <= 0}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
              >
                ⏱️ टाइम-आऊट ({timeoutsA} बाकी)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRaidingTeam('A')}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
              >
                रेडर बनवा (Set Raider)
              </Button>
            </div>
          </div>
        </Card>


        {/* ================= CENTER MATCH ARENA & TIMERS ================= */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          
          {/* MATCH HALF / ROUND CLOCK */}
          <Card className={cn("p-6 rounded-[2.5rem] border-2 text-center shadow-lg", isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="font-bold text-[10px] uppercase">
                {sport === 'Kabaddi' ? `हाफ ${matchHalf}` : sport === 'Kho Kho' ? `टर्न ${khoTurn}/4` : `सेट ${volleySet}`}
              </Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                सामना वेळ (Match Clock)
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  if (sport === 'Kabaddi') setMatchHalf(h => h === 1 ? 2 : 1);
                  else if (sport === 'Kho Kho') setKhoTurn(t => (t % 4) + 1);
                }}
                className="h-6 text-[10px] font-bold px-2"
              >
                बदला
              </Button>
            </div>

            <div className="text-5xl font-black font-mono tracking-tighter text-slate-800 dark:text-slate-100 py-1">
              {formatTime(matchSecondsRemaining)}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => setIsMatchClockRunning(!isMatchClockRunning)}
                className={cn(
                  "rounded-xl h-10 px-5 font-black text-xs tracking-wider",
                  isMatchClockRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                {isMatchClockRunning ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                {isMatchClockRunning ? "थांबवा (Pause)" : "सुरू करा (Start Clock)"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsMatchClockRunning(false);
                  setMatchSecondsRemaining(1200);
                }}
                className="rounded-xl h-10 px-3 font-bold text-xs"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* ---------------- 30-SEC RAID CLOCK / INNING CLOCK ---------------- */}
          {sport === 'Kabaddi' && (
            <Card className={cn(
              "p-6 rounded-[2.5rem] border-4 text-center shadow-2xl relative overflow-hidden transition-all",
              raidSeconds <= 5 ? "border-red-600 bg-red-950/20" : raidSeconds <= 10 ? "border-amber-500 bg-amber-950/10" : "border-primary/20",
              isFullscreen ? "bg-slate-900 text-white" : "bg-white"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> ३० सेकंद प्रो रेडर घड्याळ
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {raidingTeam === 'A' ? teamACustomName : teamBCustomName} ची रेड
                </span>
              </div>

              {/* HUGE DIGITAL DIGITS */}
              <div className={cn(
                "text-8xl md:text-9xl font-black font-mono tracking-tighter select-none my-2 transition-colors",
                raidSeconds <= 5 ? "text-red-600 animate-pulse" : raidSeconds <= 10 ? "text-amber-500" : "text-primary dark:text-emerald-400"
              )}>
                {raidSeconds.toString().padStart(2, '0')}
              </div>

              {/* RAID CONTROL BUTTONS */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  onClick={isRaidRunning ? pauseRaidClock : startRaidClock}
                  className={cn(
                    "h-14 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg active-scale",
                    isRaidRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {isRaidRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isRaidRunning ? "थांबवा" : "रेड सुरू"}
                </Button>

                <Button
                  onClick={() => resetRaidClock(raidingTeam === 'A' ? 'B' : 'A')}
                  className="h-14 rounded-2xl font-black text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg active-scale"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> ३०s रिसेट
                </Button>

                <Button
                  onClick={handleEmptyRaid}
                  variant="outline"
                  className="h-14 rounded-2xl font-black text-[11px] uppercase tracking-wider border-slate-300 dark:border-slate-700 hover:bg-muted"
                >
                  रिकामी रेड (Empty)
                </Button>
              </div>

              {/* Sound Effect Test Triggers */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="ghost" onClick={() => sfx.playWhistle()} className="h-7 text-[10px] font-bold text-muted-foreground hover:text-foreground">
                  🔊 शिट्टी (Whistle)
                </Button>
                <Button size="sm" variant="ghost" onClick={() => sfx.playBuzzer()} className="h-7 text-[10px] font-bold text-muted-foreground hover:text-foreground">
                  📢 बजर (Buzzer)
                </Button>
              </div>
            </Card>
          )}

          {/* ---------------- KHO-KHO INNING & BATCH CLOCK ---------------- */}
          {sport === 'Kho Kho' && (
            <Card className={cn("p-6 rounded-[2.5rem] border-2 text-center shadow-xl", isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                  खो-खो टर्न घड्याळ (Turn Clock)
                </span>
                <Badge className="bg-purple-100 text-purple-800 font-bold text-[10px]">
                  तुकडी {activeBatch} (३ खेळाडू)
                </Badge>
              </div>

              <div className="text-7xl font-black font-mono tracking-tighter text-purple-700 dark:text-purple-300 my-2">
                {formatTime(khoInningSeconds)}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  onClick={() => setIsKhoRunning(!isKhoRunning)}
                  className={cn(
                    "h-12 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-md",
                    isKhoRunning ? "bg-amber-600" : "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  {isKhoRunning ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                  {isKhoRunning ? "थांबवा" : "टर्न सुरू"}
                </Button>
                <Button
                  onClick={() => {
                    setIsKhoRunning(false);
                    setKhoInningSeconds(540);
                    setChasingTeam(prev => prev === 'A' ? 'B' : 'A');
                  }}
                  variant="outline"
                  className="h-12 rounded-2xl font-black text-xs uppercase"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> ९m रिसेट
                </Button>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-muted/30 border text-left flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">तुकडीतील बाद खेळाडू</p>
                  <p className="text-sm font-black text-primary">{batchDismissedCount} / 3 Out</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    const cTeam = chasingTeam;
                    addScore(cTeam, 1, 'Defender Out');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl"
                >
                  +1 खेळाडू बाद (Touch)
                </Button>
              </div>
            </Card>
          )}

          {/* BOTTOM GLOBAL ACTIONS */}
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undoLastEvent}
              disabled={eventsLog.length === 0}
              className="rounded-2xl h-11 px-4 text-xs font-black uppercase text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> शेवटची नोंद रद्द (Undo)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetEntireMatch}
              className="rounded-2xl h-11 px-4 text-xs font-black uppercase text-red-600 hover:bg-red-50"
            >
              सामना रिसेट (Reset All)
            </Button>
          </div>
        </div>


        {/* ================= TEAM B CARD ================= */}
        <Card className={cn(
          "lg:col-span-4 p-6 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden shadow-xl",
          isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200",
          sport === 'Kabaddi' && raidingTeam === 'B' && "ring-4 ring-orange-500 shadow-orange-500/20"
        )}>
          {/* Top Bar: House Selector */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={cn("w-4 h-4 rounded-full", houseBObj.bg)} />
                <select
                  value={teamBHouse}
                  onChange={(e) => setTeamBHouse(e.target.value)}
                  className="bg-muted/40 font-black text-xs uppercase rounded-xl px-2.5 py-1.5 border border-muted focus:outline-none text-foreground"
                >
                  {SCHOOL_HOUSES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              {sport === 'Kabaddi' && raidingTeam === 'B' && (
                <Badge className="bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" /> रेड सुरू (Raiding)
                </Badge>
              )}
            </div>

            <Input 
              value={teamBCustomName}
              onChange={(e) => setTeamBCustomName(e.target.value)}
              className="font-black text-xl md:text-2xl uppercase tracking-tight border-dashed border-2 rounded-2xl mb-4 text-center bg-transparent"
              placeholder="Team B Name"
            />

            {/* BIG SCORE DISPLAY */}
            <div className="text-center py-4 my-2 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-primary dark:text-amber-400 select-none">
                {scoreB}
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-1">
                एकूण गुण (Total Points)
              </p>
            </div>

            {/* Tactical Badges for Kabaddi */}
            {sport === 'Kabaddi' && (
              <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">कोर्टवरील खेळाडू</p>
                  <p className="text-lg font-black text-primary">{defendersB} / 7</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">रिकामी रेड (Empty)</p>
                  <p className={cn("text-lg font-black", emptyRaidsB === 2 ? "text-red-500 animate-pulse font-extrabold" : "text-primary")}>
                    {emptyRaidsB} / 2 {emptyRaidsB === 2 && "⚠️ DO-OR-DIE!"}
                  </p>
                </div>
              </div>
            )}

            {/* Kho-Kho Inning Summary */}
            {sport === 'Kho Kho' && (
              <div className="mt-4 p-3 rounded-2xl bg-muted/40 border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">सध्याची स्थिती (Status)</p>
                <p className="text-sm font-black text-primary">
                  {chasingTeam === 'B' ? "🏃‍♂️ चेसर संघ (Chasing)" : "🛡️ धावपटू तुकडी (Defenders Running)"}
                </p>
              </div>
            )}

            {/* Volleyball Sets Won */}
            {sport === 'Volleyball' && (
              <div className="mt-4 p-3 rounded-2xl bg-muted/40 border text-center flex items-center justify-around">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">जिंकलेले सेट (Sets)</p>
                  <p className="text-2xl font-black text-primary">{setsWonB}</p>
                </div>
                {servingTeam === 'B' && (
                  <Badge className="bg-blue-600 text-white font-black text-[10px]">
                    सर्व्हिस (Serving 🏐)
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* POINT BUTTONS KEYPAD */}
          <div className="space-y-2 pt-4 mt-4 border-t">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => addScore('B', 1, sport === 'Kabaddi' ? 'Touch Point' : 'Point')}
                className="h-12 font-black text-sm rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95"
              >
                +1 गुण
              </Button>
              <Button 
                onClick={() => addScore('B', 2, sport === 'Kabaddi' ? '2 Raid Points' : '+2 Points')}
                className="h-12 font-black text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
              >
                +2 गुण
              </Button>
              <Button 
                onClick={() => addScore('B', 3, 'Super Raid (+3)')}
                className="h-12 font-black text-xs rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md active:scale-95"
              >
                सुपर रेड +3
              </Button>
            </div>

            {sport === 'Kabaddi' && (
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => addScore('B', 1, 'Bonus Point')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-amber-500/40 text-amber-700 hover:bg-amber-50"
                >
                  बोनस +1
                </Button>
                <Button 
                  onClick={() => addScore('B', 2, 'Super Tackle (+2)')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-purple-500/40 text-purple-700 hover:bg-purple-50"
                >
                  सुपर टॅकल +2
                </Button>
                <Button 
                  onClick={() => addScore('B', 2, 'All-Out')}
                  variant="outline"
                  className="h-10 font-bold text-xs rounded-xl border-red-500/40 text-red-700 hover:bg-red-50"
                >
                  ऑल-आउट +2
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => triggerTimeout('B')}
                disabled={timeoutsB <= 0}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
              >
                ⏱️ टाइम-आऊट ({timeoutsB} बाकी)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRaidingTeam('B')}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
              >
                रेडर बनवा (Set Raider)
              </Button>
            </div>
          </div>
        </Card>

      </div>


      {/* ----------------- MATCH TIMELINE & EVENT LOGS ----------------- */}
      <Card className="p-6 rounded-[2.5rem] border shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-black text-base uppercase tracking-tight text-primary">
              लाईव्ह सामना घडामोडी (Match Action Timeline)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground">
            {eventsLog.length} नोंदी (Events Logged)
          </span>
        </div>

        {eventsLog.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs font-bold italic">
            सामन्याची गुण नोंदणी सुरू करा. सर्व नोंदी येथे वेळेसह नोंदवल्या जातील.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {eventsLog.map((event) => (
              <div 
                key={event.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                    {event.timestamp}
                  </span>
                  <span className={cn("font-black uppercase", event.team === 'A' ? "text-red-600" : "text-blue-600")}>
                    {event.teamName}
                  </span>
                  <span className="font-medium text-foreground">
                    {event.desc}
                  </span>
                </div>
                <Badge className="bg-primary text-white font-black text-[10px]">
                  +{event.points} गुण
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ----------------- PRINT-ONLY OFFICIAL A4 SCORECARD ----------------- */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-[9999] text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase">शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
          <p className="text-sm font-bold">तालुका - सुरगाणा, जिल्हा - नाशिक &bull; क्रीडा व शारीरिक शिक्षण विभाग</p>
          <h2 className="text-lg font-black uppercase tracking-wider mt-2 bg-black text-white py-1 px-4 inline-block">
            अधिकृत सामना गुणपत्रिका (OFFICIAL MATCH SCORECARD)
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-bold border border-black p-4 mb-6">
          <div><strong>खेळ / प्रकार (Sport):</strong> {sport}</div>
          <div><strong>दिनांक (Date):</strong> {new Date().toLocaleDateString('mr-IN')}</div>
          <div><strong>संघ अ (Team A):</strong> {teamACustomName}</div>
          <div><strong>संघ ब (Team B):</strong> {teamBCustomName}</div>
          <div><strong>अंतिम निकाल (Result):</strong> {scoreA > scoreB ? `${teamACustomName} विजयी (+${scoreA - scoreB} गुण)` : scoreB > scoreA ? `${teamBCustomName} विजयी (+${scoreB - scoreA} गुण)` : "सामना बरोबरीत (Tie)"}</div>
          <div><strong>अंतिम गुण (Final Score):</strong> {teamACustomName} ({scoreA}) - {teamBCustomName} ({scoreB})</div>
        </div>

        <h3 className="font-black text-xs uppercase mb-2">गुण नोंदणी तपशील (Point Progression):</h3>
        <table className="w-full text-[10px] border-collapse border border-black mb-12">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-1 text-left">वेळ</th>
              <th className="border border-black p-1 text-left">संघ</th>
              <th className="border border-black p-1 text-left">प्रकार</th>
              <th className="border border-black p-1 text-right">गुण</th>
            </tr>
          </thead>
          <tbody>
            {eventsLog.slice(0, 20).map((e) => (
              <tr key={e.id} className="border-b border-gray-300">
                <td className="border border-black p-1">{e.timestamp}</td>
                <td className="border border-black p-1 font-bold">{e.teamName}</td>
                <td className="border border-black p-1">{e.type}</td>
                <td className="border border-black p-1 text-right font-bold">+{e.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold pt-16">
          <div className="border-t border-black pt-2">पंच / रेफरी स्वाक्षरी</div>
          <div className="border-t border-black pt-2">क्रीडा शिक्षक स्वाक्षरी</div>
          <div className="border-t border-black pt-2">मुख्याध्यापक / शाळा शिक्का</div>
        </div>
      </div>

    </div>
  );
}
