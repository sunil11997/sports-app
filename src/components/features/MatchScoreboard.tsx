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
  Volleyball,
  UserCheck,
  Crown,
  Shield,
  Star,
  PlusCircle,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { sounds } from '@/lib/soundEffects';

class SoundEffects {
  public enabled: boolean = true;

  public playTick() {
    if (!this.enabled) return;
    sounds.playCountdownTick(false);
  }

  public playWarning() {
    if (!this.enabled) return;
    sounds.playCountdownTick(true);
  }

  public playWhistle() {
    if (!this.enabled) return;
    sounds.playWhistle(0.85);
  }

  public playBuzzer() {
    if (!this.enabled) return;
    sounds.playBuzzer(1.2);
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

export interface SquadPlayer {
  id: string;
  name: string;
  nameMarathi?: string;
  jerseyNumber: string;
  std?: string;
  raidPoints: number;
  tacklePoints: number;
  bonusPoints: number;
  totalPoints: number;
  superRaids: number;
  superTackles: number;
  isOut?: boolean;
}

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
  playerId?: string;
  playerName?: string;
  jerseyNumber?: string;
  isDoOrDie?: boolean;
}

// Default squad generators for Quick Match Setup
const DEFAULT_SQUAD_A: SquadPlayer[] = [
  { id: 'p_a1', jerseyNumber: '1', name: 'Rahul Shinde', nameMarathi: 'राहुल शिंदे', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a2', jerseyNumber: '2', name: 'Sachin Kale', nameMarathi: 'सचिन काळे', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a3', jerseyNumber: '3', name: 'Ajay Pawar', nameMarathi: 'अजय पवार', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a4', jerseyNumber: '4', name: 'Vijay Kadam', nameMarathi: 'विजय कदम', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a5', jerseyNumber: '5', name: 'Amol Jadhav', nameMarathi: 'अमोल जाधव', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a6', jerseyNumber: '6', name: 'Rohan More', nameMarathi: 'रोहन मोरे', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_a7', jerseyNumber: '7', name: 'Suraj Gavit', nameMarathi: 'सूरज गावित', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
];

const DEFAULT_SQUAD_B: SquadPlayer[] = [
  { id: 'p_b1', jerseyNumber: '1', name: 'Kiran Gavit', nameMarathi: 'किरण गावित', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b2', jerseyNumber: '2', name: 'Mayur Thakare', nameMarathi: 'मयूर ठाकरे', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b3', jerseyNumber: '3', name: 'Akash Chaudhari', nameMarathi: 'आकाश चौधरी', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b4', jerseyNumber: '4', name: 'Shubham Bhoye', nameMarathi: 'शुभम भोये', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b5', jerseyNumber: '5', name: 'Yogesh Wagh', nameMarathi: 'योगेश वाघ', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b6', jerseyNumber: '6', name: 'Vikas Bagul', nameMarathi: 'विकास बागुल', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
  { id: 'p_b7', jerseyNumber: '7', name: 'Vishal Gaikwad', nameMarathi: 'विशाल गायकवाड', raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0, isOut: false },
];

export function MatchScoreboard({ store, preselectedSport = 'Kabaddi' }: MatchScoreboardProps) {
  const { toast } = useToast();
  const allPlayers = useMemo(() => store?.data?.players || [], [store]);

  // Active View Tab: 'arena' | 'player_stats' | 'squad_setup'
  const [activeTab, setActiveTab] = useState<'arena' | 'player_stats' | 'squad_setup'>('arena');

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

  // Player Squads
  const [squadA, setSquadA] = useState<SquadPlayer[]>(() => {
    if (allPlayers.length >= 7) {
      return allPlayers.slice(0, 7).map((p: any, idx: number) => ({
        id: p.id || `p_a_${idx}`,
        jerseyNumber: p.jerseyNumber || `${idx + 1}`,
        name: p.name || `Player A${idx + 1}`,
        nameMarathi: p.nameMarathi || p.name || `खेळाडू A${idx + 1}`,
        std: p.std,
        raidPoints: 0,
        tacklePoints: 0,
        bonusPoints: 0,
        totalPoints: 0,
        superRaids: 0,
        superTackles: 0,
        isOut: false
      }));
    }
    return DEFAULT_SQUAD_A;
  });

  const [squadB, setSquadB] = useState<SquadPlayer[]>(() => {
    if (allPlayers.length >= 14) {
      return allPlayers.slice(7, 14).map((p: any, idx: number) => ({
        id: p.id || `p_b_${idx}`,
        jerseyNumber: p.jerseyNumber || `${idx + 1}`,
        name: p.name || `Player B${idx + 1}`,
        nameMarathi: p.nameMarathi || p.name || `खेळाडू B${idx + 1}`,
        std: p.std,
        raidPoints: 0,
        tacklePoints: 0,
        bonusPoints: 0,
        totalPoints: 0,
        superRaids: 0,
        superTackles: 0,
        isOut: false
      }));
    }
    return DEFAULT_SQUAD_B;
  });

  // Selected Active Player for each team
  const [selectedPlayerIdA, setSelectedPlayerIdA] = useState<string>(() => squadA[0]?.id || 'p_a1');
  const [selectedPlayerIdB, setSelectedPlayerIdB] = useState<string>(() => squadB[0]?.id || 'p_b1');

  // Match Half/Period & Match Clock
  const [matchHalf, setMatchHalf] = useState<number>(1); // 1 = 1st Half, 2 = 2nd Half, 3 = Extra Time
  const [matchSecondsRemaining, setMatchSecondsRemaining] = useState<number>(1200); // Default 20 mins
  const [isMatchClockRunning, setIsMatchClockRunning] = useState<boolean>(false);

  // Points & Statistics
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [eventsLog, setEventsLog] = useState<ScoreEvent[]>([]);

  // -------------------------------------------------------------
  // PRO KABADDI SPECIFIC STATES & RULES
  // -------------------------------------------------------------
  const [raidSeconds, setRaidSeconds] = useState<number>(30);
  const [isRaidRunning, setIsRaidRunning] = useState<boolean>(false);
  const [raidingTeam, setRaidingTeam] = useState<'A' | 'B'>('A');
  const [emptyRaidsA, setEmptyRaidsA] = useState<number>(0); // 0, 1, 2
  const [emptyRaidsB, setEmptyRaidsB] = useState<number>(0); // 0, 1, 2
  const [defendersA, setDefendersA] = useState<number>(7);
  const [defendersB, setDefendersB] = useState<number>(7);
  const [timeoutsA, setTimeoutsA] = useState<number>(2);
  const [timeoutsB, setTimeoutsB] = useState<number>(2);
  const [timeoutClock, setTimeoutClock] = useState<number | null>(null);

  // -------------------------------------------------------------
  // KHO-KHO SPECIFIC STATES
  // -------------------------------------------------------------
  const [khoTurn, setKhoTurn] = useState<number>(1); // 1, 2, 3, 4
  const [khoInningSeconds, setKhoInningSeconds] = useState<number>(540);
  const [isKhoRunning, setIsKhoRunning] = useState<boolean>(false);
  const [chasingTeam, setChasingTeam] = useState<'A' | 'B'>('A');
  const [activeBatch, setActiveBatch] = useState<number>(1);
  const [batchDismissedCount, setBatchDismissedCount] = useState<number>(0);

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

  // Check if current raid is a Do-or-Die raid
  const isCurrentRaidDoOrDie = useMemo(() => {
    if (sport !== 'Kabaddi') return false;
    return raidingTeam === 'A' ? emptyRaidsA === 2 : emptyRaidsB === 2;
  }, [sport, raidingTeam, emptyRaidsA, emptyRaidsB]);

  // -------------------------------------------------------------
  // 30-SECOND KABADDI RAID CLOCK INTERVAL
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (isRaidRunning && raidSeconds > 0) {
      interval = setInterval(() => {
        setRaidSeconds((prev) => {
          const next = prev - 1;
          if (next === 10) sfx.playWarning();
          else if (next <= 5 && next > 0) sfx.playTick();
          else if (next === 0) {
            sfx.playBuzzer();
            setIsRaidRunning(false);
            
            // If raid runs out of time in Kabaddi:
            if (sport === 'Kabaddi') {
              if (isCurrentRaidDoOrDie) {
                // Time-out during Do-or-Die raid = Raider Out, Defending team gets 1 point!
                const defTeam = raidingTeam === 'A' ? 'B' : 'A';
                handleDoOrDieFailure(defTeam);
              } else {
                toast({
                  title: "⏰ रेड वेळ संपली (30s Raid Time Out!)",
                  description: `30 सेकंद पूर्ण झाले आहेत. रिकामी रेड किंवा गुण तपासा.`,
                  variant: "destructive",
                });
              }
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRaidRunning, raidSeconds, sport, isCurrentRaidDoOrDie, raidingTeam]);

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

  // Helper to get active player info
  const getActivePlayer = (team: 'A' | 'B', targetPlayerId?: string): SquadPlayer | undefined => {
    const squad = team === 'A' ? squadA : squadB;
    const pId = targetPlayerId || (team === 'A' ? selectedPlayerIdA : selectedPlayerIdB);
    return squad.find(p => p.id === pId) || squad[0];
  };

  // -------------------------------------------------------------
  // ADD SCORE WITH PLAYER ATTRIBUTION
  // -------------------------------------------------------------
  const addScore = (
    team: 'A' | 'B', 
    points: number, 
    type: string, 
    customPlayerId?: string
  ) => {
    const teamName = team === 'A' ? teamACustomName : teamBCustomName;
    const opponent = team === 'A' ? 'B' : 'A';

    // Identify player who scored
    const activePlayer = getActivePlayer(team, customPlayerId);
    const playerName = activePlayer?.nameMarathi || activePlayer?.name || (team === 'A' ? 'संघ अ खेळाडू' : 'संघ ब खेळाडू');
    const jerseyNumber = activePlayer?.jerseyNumber || '';

    // Update Team Score
    if (team === 'A') setScoreA(prev => prev + points);
    else setScoreB(prev => prev + points);

    // Update Player Stats in Squad
    if (activePlayer) {
      const updateSquad = (prevSquad: SquadPlayer[]) => {
        return prevSquad.map(p => {
          if (p.id === activePlayer.id) {
            const isBonus = type.includes('Bonus');
            const isTackle = type.includes('Tackle');
            const isSuperTackle = type.includes('Super Tackle');
            const isSuperRaid = type.includes('Super Raid') || (points >= 3 && !isTackle);

            return {
              ...p,
              totalPoints: p.totalPoints + points,
              bonusPoints: isBonus ? p.bonusPoints + points : p.bonusPoints,
              tacklePoints: isTackle ? p.tacklePoints + points : p.tacklePoints,
              raidPoints: (!isTackle && !isBonus) ? p.raidPoints + points : isBonus ? p.raidPoints + points : p.raidPoints,
              superRaids: isSuperRaid ? p.superRaids + 1 : p.superRaids,
              superTackles: isSuperTackle ? p.superTackles + 1 : p.superTackles,
            };
          }
          return p;
        });
      };

      if (team === 'A') setSquadA(updateSquad);
      else setSquadB(updateSquad);
    }

    // Build Descriptive Event Log
    const playerBadgeText = jerseyNumber ? `[#${jerseyNumber} ${playerName}]` : playerName;
    const newEvent: ScoreEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
      team,
      teamName,
      points,
      type,
      playerId: activePlayer?.id,
      playerName,
      jerseyNumber,
      isDoOrDie: isCurrentRaidDoOrDie,
      desc: `${teamName}: ${playerBadgeText} +${points} (${type})`
    };
    setEventsLog(prev => [newEvent, ...prev]);

    // -------------------------------------------------------------
    // KABADDI RULES ADJUSTMENTS
    // -------------------------------------------------------------
    if (sport === 'Kabaddi') {
      if (type.includes('Raid') || type.includes('Touch') || type.includes('Bonus')) {
        // Successful Raid (Touch or Bonus): Resets empty raids counter for raiding team
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

  // -------------------------------------------------------------
  // PRO KABADDI: DO-OR-DIE FAILURE HANDLER
  // -------------------------------------------------------------
  const handleDoOrDieFailure = (defendingTeam: 'A' | 'B') => {
    const failedRaidingTeam = defendingTeam === 'A' ? 'B' : 'A';
    const failedTeamName = failedRaidingTeam === 'A' ? teamACustomName : teamBCustomName;
    const defendingTeamName = defendingTeam === 'A' ? teamACustomName : teamBCustomName;
    const raiderPlayer = getActivePlayer(failedRaidingTeam);

    // Defending team gets 1 tackle/out point
    if (defendingTeam === 'A') setScoreA(prev => prev + 1);
    else setScoreB(prev => prev + 1);

    // Defending team tackler gets 1 tackle point
    const tacklerPlayer = getActivePlayer(defendingTeam);
    if (tacklerPlayer) {
      const updateSquad = (prevSquad: SquadPlayer[]) => {
        return prevSquad.map(p => p.id === tacklerPlayer.id ? { ...p, tacklePoints: p.tacklePoints + 1, totalPoints: p.totalPoints + 1 } : p);
      };
      if (defendingTeam === 'A') setSquadA(updateSquad);
      else setSquadB(updateSquad);
    }

    // Reset empty raids counter
    if (failedRaidingTeam === 'A') setEmptyRaidsA(0);
    else setEmptyRaidsB(0);

    // Deduct 1 defender from the failed raiding team
    if (failedRaidingTeam === 'A') setDefendersA(prev => Math.max(1, prev - 1));
    else setDefendersB(prev => Math.max(1, prev - 1));

    // Log Event
    const newEvent: ScoreEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
      team: defendingTeam,
      teamName: defendingTeamName,
      points: 1,
      type: 'Do-Or-Die Out',
      isDoOrDie: true,
      playerId: tacklerPlayer?.id,
      playerName: tacklerPlayer?.nameMarathi || tacklerPlayer?.name,
      jerseyNumber: tacklerPlayer?.jerseyNumber,
      desc: `🚨 डू ऑर डाय रेड निष्फळ! ${failedTeamName} चा रेडर [${raiderPlayer?.nameMarathi || raiderPlayer?.name || 'रेडर'}] बाद ➔ ${defendingTeamName} +1 गुण`
    };
    setEventsLog(prev => [newEvent, ...prev]);

    sfx.playBuzzer();
    toast({
      title: "🚨 डू ऑर डाय रेड निष्फळ! (Do-or-Die Out)",
      description: `${failedTeamName} ची ३री रेड निष्फळ ठरल्याने ${defendingTeamName} ला १ गुण मिळाला व रेडर बाद.`,
      variant: "destructive",
    });

    // Reset raid clock for defending team's turn
    resetRaidClock(defendingTeam);
  };

  // -------------------------------------------------------------
  // PRO KABADDI: EMPTY RAID LOGIC
  // -------------------------------------------------------------
  const handleEmptyRaid = () => {
    if (raidingTeam === 'A') {
      const current = emptyRaidsA;
      if (current === 0) {
        // Raid 1 empty -> next will be Raid 2
        setEmptyRaidsA(1);
        toast({ title: "⚪ १ली रिकामी रेड (Empty Raid 1)", description: `${teamACustomName} ची १ली रिकामी रेड नोंदवली.` });
        resetRaidClock('B');
      } else if (current === 1) {
        // Raid 2 empty -> 3rd raid MUST BE DO-OR-DIE!
        setEmptyRaidsA(2);
        sfx.playWarning();
        toast({ 
          title: "⚠️ २री रिकामी रेड! पुढील रेड डू-ऑर-डाय (Do-or-Die Raid Alert!)", 
          description: `${teamACustomName} ची पुढील ३री रेड 'डू-ऑर-डाय (करो किंवा मरो)' असेल!`,
          variant: "destructive"
        });
        resetRaidClock('B');
      } else if (current === 2) {
        // 3rd Raid was DO-OR-DIE and was empty -> Raider OUT! Team B +1 Point
        handleDoOrDieFailure('B');
      }
    } else {
      const current = emptyRaidsB;
      if (current === 0) {
        setEmptyRaidsB(1);
        toast({ title: "⚪ १ली रिकामी रेड (Empty Raid 1)", description: `${teamBCustomName} ची १ली रिकामी रेड नोंदवली.` });
        resetRaidClock('A');
      } else if (current === 1) {
        setEmptyRaidsB(2);
        sfx.playWarning();
        toast({ 
          title: "⚠️ २री रिकामी रेड! पुढील रेड डू-ऑर-डाय (Do-or-Die Raid Alert!)", 
          description: `${teamBCustomName} ची पुढील ३री रेड 'डू-ऑर-डाय (करो किंवा मरो)' असेल!`,
          variant: "destructive"
        });
        resetRaidClock('A');
      } else if (current === 2) {
        handleDoOrDieFailure('A');
      }
    }
  };

  // -------------------------------------------------------------
  // UNDO LAST EVENT
  // -------------------------------------------------------------
  const undoLastEvent = () => {
    if (eventsLog.length === 0) return;
    const last = eventsLog[0];
    if (last.team === 'A') setScoreA(prev => Math.max(0, prev - last.points));
    else setScoreB(prev => Math.max(0, prev - last.points));

    // Rollback player points if attached
    if (last.playerId) {
      const rollbackSquad = (prevSquad: SquadPlayer[]) => {
        return prevSquad.map(p => {
          if (p.id === last.playerId) {
            const isBonus = last.type.includes('Bonus');
            const isTackle = last.type.includes('Tackle');
            return {
              ...p,
              totalPoints: Math.max(0, p.totalPoints - last.points),
              bonusPoints: isBonus ? Math.max(0, p.bonusPoints - last.points) : p.bonusPoints,
              tacklePoints: isTackle ? Math.max(0, p.tacklePoints - last.points) : p.tacklePoints,
              raidPoints: (!isTackle && !isBonus) ? Math.max(0, p.raidPoints - last.points) : p.raidPoints,
            };
          }
          return p;
        });
      };

      if (last.team === 'A') setSquadA(rollbackSquad);
      else setSquadB(rollbackSquad);
    }

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
    if (!window.confirm("तुम्हाला संपूर्ण सामना रिसेट करायचा आहे का? (Reset all match scores & player stats?)")) return;
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

    // Reset Player Stats
    setSquadA(prev => prev.map(p => ({ ...p, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0 })));
    setSquadB(prev => prev.map(p => ({ ...p, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0, superRaids: 0, superTackles: 0 })));

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

  // Top Raider & Top Defender computation
  const allSquadPlayers = useMemo(() => [...squadA.map(p => ({ ...p, team: 'A', teamName: teamACustomName })), ...squadB.map(p => ({ ...p, team: 'B', teamName: teamBCustomName }))], [squadA, squadB, teamACustomName, teamBCustomName]);

  const topRaider = useMemo(() => {
    return [...allSquadPlayers].sort((a, b) => b.raidPoints - a.raidPoints)[0];
  }, [allSquadPlayers]);

  const topDefender = useMemo(() => {
    return [...allSquadPlayers].sort((a, b) => b.tacklePoints - a.tacklePoints)[0];
  }, [allSquadPlayers]);

  const topScorer = useMemo(() => {
    return [...allSquadPlayers].sort((a, b) => b.totalPoints - a.totalPoints)[0];
  }, [allSquadPlayers]);

  // -------------------------------------------------------------
  // WHATSAPP SHARE GENERATOR
  // -------------------------------------------------------------
  const shareMatchOnWhatsApp = () => {
    const leaderText = scoreA > scoreB ? `${teamACustomName} आघाडीवर (+${scoreA - scoreB})` : scoreB > scoreA ? `${teamBCustomName} आघाडीवर (+${scoreB - scoreA})` : "सामना बरोबरीत (Tie)";
    
    // Top Scorers text
    const topScorersA = squadA.filter(p => p.totalPoints > 0).sort((a, b) => b.totalPoints - a.totalPoints).map(p => `• #${p.jerseyNumber} ${p.nameMarathi || p.name}: ${p.totalPoints} pts (R:${p.raidPoints}, T:${p.tacklePoints})`).join('\n');
    const topScorersB = squadB.filter(p => p.totalPoints > 0).sort((a, b) => b.totalPoints - a.totalPoints).map(p => `• #${p.jerseyNumber} ${p.nameMarathi || p.name}: ${p.totalPoints} pts (R:${p.raidPoints}, T:${p.tacklePoints})`).join('\n');

    const text = `🏆 *शासकीय माध्यमिक आश्रम शाळा वाघंबा - प्रो क्रीडा निकाल* 🏆\n` +
      `🏅 *खेळ:* ${sport}\n` +
      `⚔️ *सामना:* ${teamACustomName} vs ${teamBCustomName}\n` +
      `📊 *अंतिम गुणफलक (Score):*\n` +
      `👉 ${teamACustomName}: *${scoreA} गुण*\n` +
      `👉 ${teamBCustomName}: *${scoreB} गुण*\n` +
      `🎯 *स्थिती:* ${leaderText}\n\n` +
      (topScorer && topScorer.totalPoints > 0 ? `🌟 *सर्वोत्कृष्ट खेळाडू (Top Scorer):* #${topScorer.jerseyNumber} ${topScorer.nameMarathi || topScorer.name} (${topScorer.teamName}) - ${topScorer.totalPoints} गुण\n\n` : '') +
      (topScorersA ? `🎖️ *${teamACustomName} खेळाडू गुण:*\n${topScorersA}\n\n` : '') +
      (topScorersB ? `🎖️ *${teamBCustomName} खेळाडू गुण:*\n${topScorersB}\n\n` : '') +
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
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={cn("font-black text-lg uppercase tracking-tight", isFullscreen ? "text-white" : "text-primary")}>
                {sport} प्रो लाईव्ह गुणफलक
              </h2>
              <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest animate-pulse">
                PKL PRO RULES
              </Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              शासकीय माध्यमिक आश्रम शाळा वाघंबा &bull; Inter-House Pro Kabaddi League
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Tabs */}
          <div className="flex bg-muted/60 p-1 rounded-xl border">
            <button
              onClick={() => setActiveTab('arena')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'arena' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🏟️ लाईव्ह कोर्ट (Arena)
            </button>
            <button
              onClick={() => setActiveTab('player_stats')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'player_stats' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              📊 खेळाडू गुणफलक (Player Stats)
            </button>
            <button
              onClick={() => setActiveTab('squad_setup')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'squad_setup' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              👥 संघ रचना (Squad)
            </button>
          </div>

          <div className="flex bg-muted/60 p-1 rounded-xl border">
            {['Kabaddi', 'Kho Kho', 'Volleyball', 'General'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSport(s);
                  resetRaidClock();
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                  sport === s ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "text-muted-foreground hover:text-foreground"
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
            {isFullscreen ? "सामान्य" : "स्टेडियम स्क्रीन"}
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

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 1: MAIN DIGITAL SCOREBOARD ARENA */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeTab === 'arena' && (
        <>
          {/* ================= PRO KABADDI DO-OR-DIE BANNER ALERT ================= */}
          {sport === 'Kabaddi' && isCurrentRaidDoOrDie && (
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between animate-pulse border-4 border-amber-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-2xl">
                  <Flame className="w-8 h-8 text-amber-300 fill-amber-300 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-300 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      PRO KABADDI RULE: 3RD RAID
                    </span>
                    <span className="text-xs font-bold text-amber-200">
                      (२ रिकाम्या रेडनंतर ३री रेड)
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                    🚨 {raidingTeam === 'A' ? teamACustomName : teamBCustomName} ची &quot;डू-ऑर-डाय&quot; (DO-OR-DIE) रेड!
                  </h3>
                  <p className="text-xs font-medium text-amber-100">
                    या रेडमध्ये रेडरने गुण घेतला नाही तर रेडर बाद होईल व प्रतिस्पर्धी संघाला १ गुण मिळेल!
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-red-700 text-sm font-black px-4 py-2 uppercase tracking-widest hidden md:inline-flex shadow-lg">
                गुण आवश्यक (Must Score)
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* ================= TEAM A CARD ================= */}
            <Card className={cn(
              "lg:col-span-4 p-6 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden shadow-xl",
              isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200",
              sport === 'Kabaddi' && raidingTeam === 'A' && "ring-4 ring-orange-500 shadow-orange-500/20"
            )}>
              <div>
                {/* Top Bar: House Selector */}
                <div className="flex items-center justify-between gap-2 mb-3">
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
                    <Badge className={cn("text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1", emptyRaidsA === 2 ? "bg-red-600" : "bg-orange-600")}>
                      <Flame className="w-3 h-3 fill-current" /> {emptyRaidsA === 2 ? "🚨 DO-OR-DIE RAID" : "रेड सुरू (Raiding)"}
                    </Badge>
                  )}
                </div>

                <Input 
                  value={teamACustomName}
                  onChange={(e) => setTeamACustomName(e.target.value)}
                  className="font-black text-xl md:text-2xl uppercase tracking-tight border-dashed border-2 rounded-2xl mb-3 text-center bg-transparent"
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

                {/* Tactical Badges for Kabaddi: Court Players & Pro Raid Progression */}
                {sport === 'Kabaddi' && (
                  <div className="space-y-2 mt-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">कोर्टवरील खेळाडू</p>
                        <p className="text-lg font-black text-primary">{defendersA} / 7</p>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {defendersA <= 3 ? "🛡️ सुपर टॅकल Active" : defendersB >= 6 ? "⭐ बोनस Active" : ""}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">रेड क्रम (Raid Count)</p>
                        <div className="flex items-center justify-center gap-1.5 my-1">
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsA >= 1 ? "bg-amber-500 text-white border-amber-600" : "bg-muted text-muted-foreground")}>1</span>
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsA >= 2 ? "bg-orange-600 text-white border-orange-700" : "bg-muted text-muted-foreground")}>2</span>
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsA === 2 ? "bg-red-600 text-white border-red-700 animate-pulse" : "bg-muted text-muted-foreground")}>3</span>
                        </div>
                        <p className={cn("text-[10px] font-black uppercase", emptyRaidsA === 2 ? "text-red-600 animate-pulse font-extrabold" : "text-muted-foreground")}>
                          {emptyRaidsA === 0 ? "रेड १ (Normal)" : emptyRaidsA === 1 ? "१ रिकामी (1 Empty)" : "🚨 डू-ऑर-डाय (D.O.D.)"}
                        </p>
                      </div>
                    </div>

                    {/* ACTIVE RAIDER / PLAYER SELECTOR CHIPS */}
                    <div className="p-2.5 rounded-2xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> सध्याचा खेळाडू (Active Player):
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {squadA.find(p => p.id === selectedPlayerIdA)?.totalPoints || 0} गुण
                        </span>
                      </div>
                      
                      <select 
                        value={selectedPlayerIdA}
                        onChange={(e) => setSelectedPlayerIdA(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 font-bold text-xs rounded-xl p-2 border border-slate-300 dark:border-slate-700 focus:outline-none"
                      >
                        {squadA.map(p => (
                          <option key={p.id} value={p.id}>
                            #{p.jerseyNumber} {p.nameMarathi || p.name} ({p.totalPoints} pts - R:{p.raidPoints} T:{p.tacklePoints})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* POINT BUTTONS KEYPAD */}
              <div className="space-y-2 pt-4 mt-3 border-t">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => addScore('A', 1, sport === 'Kabaddi' ? 'Touch Point' : 'Point')}
                    className="h-12 font-black text-sm rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95"
                  >
                    +1 गुण (Touch)
                  </Button>
                  <Button 
                    onClick={() => addScore('A', 2, sport === 'Kabaddi' ? '2 Raid Points' : '+2 Points')}
                    className="h-12 font-black text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
                  >
                    +2 गुण (2 Pts)
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
                      ⭐ बोनस +1
                    </Button>
                    <Button 
                      onClick={() => addScore('A', 2, 'Super Tackle (+2)')}
                      variant="outline"
                      className="h-10 font-bold text-xs rounded-xl border-purple-500/40 text-purple-700 hover:bg-purple-50"
                    >
                      🛡️ सुपर टॅकल +2
                    </Button>
                    <Button 
                      onClick={() => addScore('A', 2, 'All-Out')}
                      variant="outline"
                      className="h-10 font-bold text-xs rounded-xl border-red-500/40 text-red-700 hover:bg-red-50"
                    >
                      💥 ऑल-आउट +2
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
              <Card className={cn("p-5 rounded-[2.5rem] border-2 text-center shadow-lg", isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
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
                  "p-5 rounded-[2.5rem] border-4 text-center shadow-2xl relative overflow-hidden transition-all",
                  isCurrentRaidDoOrDie ? "border-red-600 bg-red-950/20" : raidSeconds <= 5 ? "border-red-600 bg-red-950/10" : raidSeconds <= 10 ? "border-amber-500 bg-amber-950/10" : "border-primary/20",
                  isFullscreen ? "bg-slate-900 text-white" : "bg-white"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1", isCurrentRaidDoOrDie ? "text-red-600 animate-pulse font-extrabold" : "text-orange-600")}>
                      <Flame className="w-3.5 h-3.5" /> {isCurrentRaidDoOrDie ? "🚨 DO-OR-DIE RAID" : "३० सेकंद प्रो रेडर घड्याळ"}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {raidingTeam === 'A' ? teamACustomName : teamBCustomName} ची रेड
                    </span>
                  </div>

                  {/* HUGE DIGITAL DIGITS */}
                  <div className={cn(
                    "text-8xl md:text-9xl font-black font-mono tracking-tighter select-none my-1 transition-colors",
                    isCurrentRaidDoOrDie ? "text-red-600 animate-pulse" : raidSeconds <= 5 ? "text-red-600 animate-pulse" : raidSeconds <= 10 ? "text-amber-500" : "text-primary dark:text-emerald-400"
                  )}>
                    {raidSeconds.toString().padStart(2, '0')}
                  </div>

                  {/* Current Active Raider name banner */}
                  <div className="text-xs font-black text-muted-foreground mb-3 truncate">
                    रेडर: <span className="text-foreground">#{getActivePlayer(raidingTeam)?.jerseyNumber} {getActivePlayer(raidingTeam)?.nameMarathi || getActivePlayer(raidingTeam)?.name}</span>
                  </div>

                  {/* RAID CONTROL BUTTONS */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={isRaidRunning ? pauseRaidClock : startRaidClock}
                      className={cn(
                        "h-12 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg active-scale",
                        isRaidRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                      )}
                    >
                      {isRaidRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {isRaidRunning ? "थांबवा" : "रेड सुरू"}
                    </Button>

                    <Button
                      onClick={() => resetRaidClock(raidingTeam === 'A' ? 'B' : 'A')}
                      className="h-12 rounded-2xl font-black text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg active-scale"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" /> ३०s रिसेट
                    </Button>

                    <Button
                      onClick={handleEmptyRaid}
                      variant="outline"
                      className={cn(
                        "h-12 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-muted",
                        isCurrentRaidDoOrDie ? "border-red-600 text-red-600 bg-red-50 hover:bg-red-100 font-extrabold animate-pulse" : "border-slate-300 dark:border-slate-700"
                      )}
                    >
                      {isCurrentRaidDoOrDie ? "❌ D.O.D. बाद (Out)" : "रिकामी रेड (Empty)"}
                    </Button>
                  </div>

                  {/* Sound Effect Test Triggers */}
                  <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t">
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
                <Card className={cn("p-5 rounded-[2.5rem] border-2 text-center shadow-xl", isFullscreen ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
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
              <div>
                {/* Top Bar: House Selector */}
                <div className="flex items-center justify-between gap-2 mb-3">
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
                    <Badge className={cn("text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1", emptyRaidsB === 2 ? "bg-red-600" : "bg-orange-600")}>
                      <Flame className="w-3 h-3 fill-current" /> {emptyRaidsB === 2 ? "🚨 DO-OR-DIE RAID" : "रेड सुरू (Raiding)"}
                    </Badge>
                  )}
                </div>

                <Input 
                  value={teamBCustomName}
                  onChange={(e) => setTeamBCustomName(e.target.value)}
                  className="font-black text-xl md:text-2xl uppercase tracking-tight border-dashed border-2 rounded-2xl mb-3 text-center bg-transparent"
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

                {/* Tactical Badges for Kabaddi: Court Players & Pro Raid Progression */}
                {sport === 'Kabaddi' && (
                  <div className="space-y-2 mt-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">कोर्टवरील खेळाडू</p>
                        <p className="text-lg font-black text-primary">{defendersB} / 7</p>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {defendersB <= 3 ? "🛡️ सुपर टॅकल Active" : defendersA >= 6 ? "⭐ बोनस Active" : ""}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/40 border text-xs">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">रेड क्रम (Raid Count)</p>
                        <div className="flex items-center justify-center gap-1.5 my-1">
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsB >= 1 ? "bg-amber-500 text-white border-amber-600" : "bg-muted text-muted-foreground")}>1</span>
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsB >= 2 ? "bg-orange-600 text-white border-orange-700" : "bg-muted text-muted-foreground")}>2</span>
                          <span className={cn("w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold", emptyRaidsB === 2 ? "bg-red-600 text-white border-red-700 animate-pulse" : "bg-muted text-muted-foreground")}>3</span>
                        </div>
                        <p className={cn("text-[10px] font-black uppercase", emptyRaidsB === 2 ? "text-red-600 animate-pulse font-extrabold" : "text-muted-foreground")}>
                          {emptyRaidsB === 0 ? "रेड १ (Normal)" : emptyRaidsB === 1 ? "१ रिकामी (1 Empty)" : "🚨 डू-ऑर-डाय (D.O.D.)"}
                        </p>
                      </div>
                    </div>

                    {/* ACTIVE RAIDER / PLAYER SELECTOR CHIPS */}
                    <div className="p-2.5 rounded-2xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> सध्याचा खेळाडू (Active Player):
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {squadB.find(p => p.id === selectedPlayerIdB)?.totalPoints || 0} गुण
                        </span>
                      </div>
                      
                      <select 
                        value={selectedPlayerIdB}
                        onChange={(e) => setSelectedPlayerIdB(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 font-bold text-xs rounded-xl p-2 border border-slate-300 dark:border-slate-700 focus:outline-none"
                      >
                        {squadB.map(p => (
                          <option key={p.id} value={p.id}>
                            #{p.jerseyNumber} {p.nameMarathi || p.name} ({p.totalPoints} pts - R:{p.raidPoints} T:{p.tacklePoints})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* POINT BUTTONS KEYPAD */}
              <div className="space-y-2 pt-4 mt-3 border-t">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => addScore('B', 1, sport === 'Kabaddi' ? 'Touch Point' : 'Point')}
                    className="h-12 font-black text-sm rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95"
                  >
                    +1 गुण (Touch)
                  </Button>
                  <Button 
                    onClick={() => addScore('B', 2, sport === 'Kabaddi' ? '2 Raid Points' : '+2 Points')}
                    className="h-12 font-black text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
                  >
                    +2 गुण (2 Pts)
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
                      ⭐ बोनस +1
                    </Button>
                    <Button 
                      onClick={() => addScore('B', 2, 'Super Tackle (+2)')}
                      variant="outline"
                      className="h-10 font-bold text-xs rounded-xl border-purple-500/40 text-purple-700 hover:bg-purple-50"
                    >
                      🛡️ सुपर टॅकल +2
                    </Button>
                    <Button 
                      onClick={() => addScore('B', 2, 'All-Out')}
                      variant="outline"
                      className="h-10 font-bold text-xs rounded-xl border-red-500/40 text-red-700 hover:bg-red-50"
                    >
                      💥 ऑल-आउट +2
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
                  लाईव्ह सामना घडामोडी (Match Action Timeline with Player Details)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {eventsLog.length} नोंदी (Events Logged)
              </span>
            </div>

            {eventsLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs font-bold italic">
                सामन्याची गुण नोंदणी सुरू करा. प्रत्येक खेळाडूने घेतलेले गुण व प्रो कबड्डी डू-ऑर-डाय घडामोडी येथे वेळेसह दिसतील.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {eventsLog.map((event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border text-xs",
                      event.isDoOrDie ? "bg-red-50 border-red-200" : "bg-muted/40"
                    )}
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
                    <Badge className={cn("text-white font-black text-[10px]", event.isDoOrDie ? "bg-red-600" : "bg-primary")}>
                      +{event.points} गुण
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 2: PLAYER PERFORMANCE SCORECARD & LEADERBOARD */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeTab === 'player_stats' && (
        <div className="space-y-6">
          {/* Top Performers Spotlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Top Scorer */}
            <Card className="p-5 rounded-3xl border bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  🌟 सर्वोच्च गुणपटू (Top Scorer)
                </span>
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              {topScorer && topScorer.totalPoints > 0 ? (
                <div>
                  <h4 className="text-xl font-black text-foreground">#{topScorer.jerseyNumber} {topScorer.nameMarathi || topScorer.name}</h4>
                  <p className="text-xs font-bold text-muted-foreground">{topScorer.teamName}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-600">{topScorer.totalPoints}</span>
                    <span className="text-xs font-bold text-muted-foreground">एकूण गुण</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-4">अद्याप गुण नोंदवले नाहीत.</p>
              )}
            </Card>

            {/* Top Raider */}
            <Card className="p-5 rounded-3xl border bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
                  ⚡ सर्वोत्कृष्ट रेडर (Top Raider)
                </span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              {topRaider && topRaider.raidPoints > 0 ? (
                <div>
                  <h4 className="text-xl font-black text-foreground">#{topRaider.jerseyNumber} {topRaider.nameMarathi || topRaider.name}</h4>
                  <p className="text-xs font-bold text-muted-foreground">{topRaider.teamName}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-orange-600">{topRaider.raidPoints}</span>
                    <span className="text-xs font-bold text-muted-foreground">रेड गुण ({topRaider.bonusPoints} बोनस)</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-4">अद्याप रेड गुण नाहीत.</p>
              )}
            </Card>

            {/* Top Defender */}
            <Card className="p-5 rounded-3xl border bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                  🛡️ सर्वोत्कृष्ट पकडपटू (Top Defender)
                </span>
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              {topDefender && topDefender.tacklePoints > 0 ? (
                <div>
                  <h4 className="text-xl font-black text-foreground">#{topDefender.jerseyNumber} {topDefender.nameMarathi || topDefender.name}</h4>
                  <p className="text-xs font-bold text-muted-foreground">{topDefender.teamName}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-600">{topDefender.tacklePoints}</span>
                    <span className="text-xs font-bold text-muted-foreground">पकड गुण</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-4">अद्याप टॅकल गुण नाहीत.</p>
              )}
            </Card>

          </div>

          {/* TEAM A & TEAM B DETAILED PLAYER TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Team A Table */}
            <Card className="p-5 rounded-3xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn("w-3.5 h-3.5 rounded-full", houseAObj.bg)} />
                  <h3 className="font-black text-base uppercase text-primary">
                    {teamACustomName} - खेळाडू गुणफलक
                  </h3>
                </div>
                <Badge className="bg-primary text-white font-black text-xs">
                  एकूण: {scoreA} गुण
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground font-black text-[10px] uppercase">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-2">खेळाडू नाव</th>
                      <th className="py-2 px-1 text-center">रेड</th>
                      <th className="py-2 px-1 text-center">बोनस</th>
                      <th className="py-2 px-1 text-center">टॅकल</th>
                      <th className="py-2 px-1 text-right font-black">एकूण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-bold">
                    {squadA.map(p => (
                      <tr key={p.id} className={cn("hover:bg-muted/30 transition-colors", p.totalPoints > 0 && "bg-amber-50/50 dark:bg-amber-950/20")}>
                        <td className="py-2.5 px-1 font-mono font-black text-primary">#{p.jerseyNumber}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-black text-foreground">{p.nameMarathi || p.name}</p>
                          {p.std && <p className="text-[10px] text-muted-foreground">इ. {p.std}</p>}
                        </td>
                        <td className="py-2.5 px-1 text-center text-orange-600 font-black">{p.raidPoints}</td>
                        <td className="py-2.5 px-1 text-center text-amber-600">{p.bonusPoints}</td>
                        <td className="py-2.5 px-1 text-center text-purple-600 font-black">{p.tacklePoints}</td>
                        <td className="py-2.5 px-1 text-right font-black text-sm text-primary">
                          {p.totalPoints}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Team B Table */}
            <Card className="p-5 rounded-3xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn("w-3.5 h-3.5 rounded-full", houseBObj.bg)} />
                  <h3 className="font-black text-base uppercase text-primary">
                    {teamBCustomName} - खेळाडू गुणफलक
                  </h3>
                </div>
                <Badge className="bg-primary text-white font-black text-xs">
                  एकूण: {scoreB} गुण
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground font-black text-[10px] uppercase">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-2">खेळाडू नाव</th>
                      <th className="py-2 px-1 text-center">रेड</th>
                      <th className="py-2 px-1 text-center">बोनस</th>
                      <th className="py-2 px-1 text-center">टॅकल</th>
                      <th className="py-2 px-1 text-right font-black">एकूण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-bold">
                    {squadB.map(p => (
                      <tr key={p.id} className={cn("hover:bg-muted/30 transition-colors", p.totalPoints > 0 && "bg-amber-50/50 dark:bg-amber-950/20")}>
                        <td className="py-2.5 px-1 font-mono font-black text-primary">#{p.jerseyNumber}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-black text-foreground">{p.nameMarathi || p.name}</p>
                          {p.std && <p className="text-[10px] text-muted-foreground">इ. {p.std}</p>}
                        </td>
                        <td className="py-2.5 px-1 text-center text-orange-600 font-black">{p.raidPoints}</td>
                        <td className="py-2.5 px-1 text-center text-amber-600">{p.bonusPoints}</td>
                        <td className="py-2.5 px-1 text-center text-purple-600 font-black">{p.tacklePoints}</td>
                        <td className="py-2.5 px-1 text-right font-black text-sm text-primary">
                          {p.totalPoints}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 3: SQUAD ROSTER & JERSEY CUSTOMIZATION */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeTab === 'squad_setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team A Squad Setup */}
          <Card className="p-5 rounded-3xl border shadow-sm">
            <h3 className="font-black text-base uppercase mb-4 text-primary">
              👥 {teamACustomName} खेळाडू यादी व जर्सी क्र.
            </h3>
            <div className="space-y-3">
              {squadA.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-2xl bg-muted/30 border">
                  <Input 
                    value={p.jerseyNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSquadA(prev => prev.map((pl, i) => i === idx ? { ...pl, jerseyNumber: val } : pl));
                    }}
                    className="w-16 font-mono font-black text-center h-9 text-xs"
                    placeholder="#"
                  />
                  <Input 
                    value={p.nameMarathi || p.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSquadA(prev => prev.map((pl, i) => i === idx ? { ...pl, nameMarathi: val, name: val } : pl));
                    }}
                    className="flex-1 font-bold h-9 text-xs"
                    placeholder="खेळाडूचे नाव"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Team B Squad Setup */}
          <Card className="p-5 rounded-3xl border shadow-sm">
            <h3 className="font-black text-base uppercase mb-4 text-primary">
              👥 {teamBCustomName} खेळाडू यादी व जर्सी क्र.
            </h3>
            <div className="space-y-3">
              {squadB.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-2xl bg-muted/30 border">
                  <Input 
                    value={p.jerseyNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSquadB(prev => prev.map((pl, i) => i === idx ? { ...pl, jerseyNumber: val } : pl));
                    }}
                    className="w-16 font-mono font-black text-center h-9 text-xs"
                    placeholder="#"
                  />
                  <Input 
                    value={p.nameMarathi || p.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSquadB(prev => prev.map((pl, i) => i === idx ? { ...pl, nameMarathi: val, name: val } : pl));
                    }}
                    className="flex-1 font-bold h-9 text-xs"
                    placeholder="खेळाडूचे नाव"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ----------------- PRINT-ONLY OFFICIAL A4 SCORECARD ----------------- */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-[9999] text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase">शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
          <p className="text-sm font-bold">तालुका - सुरगाणा, जिल्हा - नाशिक &bull; क्रीडा व शारीरिक शिक्षण विभाग</p>
          <h2 className="text-lg font-black uppercase tracking-wider mt-2 bg-black text-white py-1 px-4 inline-block">
            अधिकृत प्रो सामना गुणपत्रिका (OFFICIAL MATCH & PLAYER SCORECARD)
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-bold border border-black p-4 mb-4">
          <div><strong>खेळ / प्रकार (Sport):</strong> {sport} (Pro Rules)</div>
          <div><strong>दिनांक (Date):</strong> {new Date().toLocaleDateString('mr-IN')}</div>
          <div><strong>संघ अ (Team A):</strong> {teamACustomName}</div>
          <div><strong>संघ ब (Team B):</strong> {teamBCustomName}</div>
          <div><strong>अंतिम निकाल (Result):</strong> {scoreA > scoreB ? `${teamACustomName} विजयी (+${scoreA - scoreB} गुण)` : scoreB > scoreA ? `${teamBCustomName} विजयी (+${scoreB - scoreA} गुण)` : "सामना बरोबरीत (Tie)"}</div>
          <div><strong>अंतिम गुण (Final Score):</strong> {teamACustomName} ({scoreA}) - {teamBCustomName} ({scoreB})</div>
        </div>

        {/* Player Point Distribution Table */}
        <h3 className="font-black text-xs uppercase mb-2">खेळाडू गुण तपशील (Player-wise Points Breakdown):</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-bold text-[11px] mb-1">{teamACustomName} ({scoreA} गुण)</h4>
            <table className="w-full text-[10px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border border-black p-1">#</th>
                  <th className="border border-black p-1 text-left">खेळाडू नाव</th>
                  <th className="border border-black p-1 text-center">रेड</th>
                  <th className="border border-black p-1 text-center">टॅकल</th>
                  <th className="border border-black p-1 text-right">एकूण</th>
                </tr>
              </thead>
              <tbody>
                {squadA.map(p => (
                  <tr key={p.id} className="border-b border-gray-300">
                    <td className="border border-black p-1 text-center">#{p.jerseyNumber}</td>
                    <td className="border border-black p-1">{p.nameMarathi || p.name}</td>
                    <td className="border border-black p-1 text-center">{p.raidPoints}</td>
                    <td className="border border-black p-1 text-center">{p.tacklePoints}</td>
                    <td className="border border-black p-1 text-right font-bold">{p.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-bold text-[11px] mb-1">{teamBCustomName} ({scoreB} गुण)</h4>
            <table className="w-full text-[10px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border border-black p-1">#</th>
                  <th className="border border-black p-1 text-left">खेळाडू नाव</th>
                  <th className="border border-black p-1 text-center">रेड</th>
                  <th className="border border-black p-1 text-center">टॅकल</th>
                  <th className="border border-black p-1 text-right">एकूण</th>
                </tr>
              </thead>
              <tbody>
                {squadB.map(p => (
                  <tr key={p.id} className="border-b border-gray-300">
                    <td className="border border-black p-1 text-center">#{p.jerseyNumber}</td>
                    <td className="border border-black p-1">{p.nameMarathi || p.name}</td>
                    <td className="border border-black p-1 text-center">{p.raidPoints}</td>
                    <td className="border border-black p-1 text-center">{p.tacklePoints}</td>
                    <td className="border border-black p-1 text-right font-bold">{p.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h3 className="font-black text-xs uppercase mb-2">सामना कृती नोंदी (Match Action Progression):</h3>
        <table className="w-full text-[10px] border-collapse border border-black mb-12">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-1 text-left">वेळ</th>
              <th className="border border-black p-1 text-left">संघ</th>
              <th className="border border-black p-1 text-left">तपशील व खेळाडू</th>
              <th className="border border-black p-1 text-right">गुण</th>
            </tr>
          </thead>
          <tbody>
            {eventsLog.slice(0, 25).map((e) => (
              <tr key={e.id} className="border-b border-gray-300">
                <td className="border border-black p-1">{e.timestamp}</td>
                <td className="border border-black p-1 font-bold">{e.teamName}</td>
                <td className="border border-black p-1">{e.desc}</td>
                <td className="border border-black p-1 text-right font-bold">+{e.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold pt-12">
          <div className="border-t border-black pt-2">पंच / मुख्य रेफरी स्वाक्षरी</div>
          <div className="border-t border-black pt-2">क्रीडा शिक्षक स्वाक्षरी</div>
          <div className="border-t border-black pt-2">मुख्याध्यापक / शाळा शिक्का</div>
        </div>
      </div>

    </div>
  );
}
