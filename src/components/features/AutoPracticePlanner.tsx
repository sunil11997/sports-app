"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAgeValidation } from '@/lib/utils';
import { 
  Printer, 
  Save, 
  Sparkles, 
  MapPin, 
  SlidersHorizontal
} from 'lucide-react';

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': { skills: ["Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill", "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill", "Thigh hold drill", "Chain tackle drill"] },
  'Volleyball': { skills: ["Serve practice drill", "Underhand pass drill", "Overhand pass drill", "Set practice drill", "Spike approach drill", "Block timing drill", "Dig practice drill", "Court coverage drill"] },
  'Kho Kho': { skills: ["Pole turn speed drill", "Chaser speed run", "Kho timing tap", "Dodging practice", "Single chain run", "Double chain run", "Dive attack drill", "Sudden turn drill"] },
  'Shot Put': { skills: ["Glide technique drill", "Power position throw", "Spin rotation drill", "Release angle check", "Wrist snap practice", "Balance ring hold"] },
  'Discus Throw': { skills: ["Stance and grip check", "Swing and rotation drill", "Release angle snap", "Follow-through balance"] },
  'Javelin Throw': { skills: ["Grip and carry run", "Crossover steps drill", "Arch back power pull", "Release angle check"] },
  'Running': { skills: ["Starting blocks push", "Acceleration phase stride", "Max speed sprint", "Finish line dip"] }
};

const GROUND_NUMBERS: Record<string, string> = {
  'Kabaddi': 'Ground No. 1',
  'Volleyball': 'Ground No. 2',
  'Kho Kho': 'Ground No. 3',
  'Shot Put': 'Ground No. 4',
  'Discus Throw': 'Discus Ring',
  'Javelin Throw': 'Javelin Runway',
  'Running': 'Running Track'
};

const DEFAULT_U17_BOYS = ["u17_b1", "u17_b2", "u17_b3", "u17_b4", "u17_b5", "u17_b6", "u17_b7", "u17_b8", "u17_b9", "u17_b10", "u17_b11", "u17_b12", "u17_b13", "u17_b14"];
const DEFAULT_U17_GIRLS = ["u17_g1", "u17_g2", "u17_g3", "u17_g4", "u17_g5", "u17_g6", "u17_g7", "u17_g8", "u17_g9", "u17_g10", "u17_g11", "u17_g12", "u17_g13", "u17_g14"];
const DEFAULT_U14_BOYS = ["u14_b1", "u14_b2", "u14_b3", "u14_b4", "u14_b5", "u14_b6", "u14_b7", "u14_b8", "u14_b9", "u14_b10", "u14_b11", "u14_b12", "u14_b13", "u14_b14"];
const DEFAULT_U14_GIRLS = ["u14_g1", "u14_g2", "u14_g3", "u14_g4", "u14_g5", "u14_g6", "u14_g7", "u14_g8", "u14_g9", "u14_g10", "u14_g11", "u14_g12", "u14_g13", "u14_g14"];
const DEFAULT_KHOKHO_BOYS = ["kk_b1", "kk_b2", "kk_b3", "kk_b4", "kk_b5", "kk_b6", "kk_b7", "kk_b8", "kk_b9", "kk_b10", "kk_b11", "kk_b12", "kk_b13", "kk_b14"];
const DEFAULT_KHOKHO_GIRLS = ["kk_g1", "kk_g2", "kk_g3", "kk_g4", "kk_g5", "kk_g6", "kk_g7", "kk_g8", "kk_g9", "kk_g10", "kk_g11", "kk_g12", "kk_g13", "kk_g14"];
const DEFAULT_SHOTPUT_GIRLS = ["sp_g1", "sp_g2", "sp_g3", "sp_g4", "sp_g5", "sp_g6", "sp_g7", "sp_g8", "sp_g9", "sp_g10", "sp_g11", "sp_g12", "sp_g13", "sp_g14"];

interface PlayerPlanEntry {
  playerId: string;
  game1: string;
  game2: string;
  drill1_1?: string;
  drill1_2?: string;
  drill2_1?: string;
  drill2_2?: string;
}

export function AutoPracticePlanner({ store }: { store: any }) {
  const { toast } = useToast();
  const db = useFirestore();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [selectedSession, setSelectedSession] = useState<'Morning' | 'Evening'>('Morning');
  const [activeTab, setActiveTab] = useState<'u17boys' | 'u17girls' | 'u14boys' | 'u14girls' | 'khokhoboys' | 'khokhogirls' | 'shotputgirls' | 'drills'>('u17boys');

  const todayDateString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isPastDate = selectedDate < todayDateString;

  // Plan states
  const [u17BoysPlan, setU17BoysPlan] = useState<PlayerPlanEntry[]>([]);
  const [u17GirlsPlan, setU17GirlsPlan] = useState<PlayerPlanEntry[]>([]);
  const [u14BoysPlan, setU14BoysPlan] = useState<PlayerPlanEntry[]>([]);
  const [u14GirlsPlan, setU14GirlsPlan] = useState<PlayerPlanEntry[]>([]);
  const [khokhoBoysPlan, setKhokhoBoysPlan] = useState<PlayerPlanEntry[]>([]);
  const [khokhoGirlsPlan, setKhokhoGirlsPlan] = useState<PlayerPlanEntry[]>([]);
  const [shotputGirlsPlan, setShotputGirlsPlan] = useState<PlayerPlanEntry[]>([]);

  const [bulkGame, setBulkGame] = useState<string>('None');
  const [bulkDrill1, setBulkDrill1] = useState<string>('');
  const [bulkDrill2, setBulkDrill2] = useState<string>('');
  const [bulkSlot, setBulkSlot] = useState<'game1' | 'game2'>('game1');

  useEffect(() => {
    setBulkDrill1('');
    setBulkDrill2('');
  }, [bulkGame]);
  const [drills, setDrills] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const schoolId = store.data.schoolProfile?.id || "default";
  const scheduleKey = `${schoolId}_autoplan_${selectedDate}_${selectedSession}`;

  // Load from Firebase
  useEffect(() => {
    if (!store.isLoaded || !db) return;

    const docRef = doc(db, 'master_auto_plans', scheduleKey);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setU17BoysPlan(d.u17BoysPlan || []);
        setU17GirlsPlan(d.u17GirlsPlan || []);
        setU14BoysPlan(d.u14BoysPlan || []);
        setU14GirlsPlan(d.u14GirlsPlan || []);
        setKhokhoBoysPlan(d.khokhoBoysPlan || []);
        setKhokhoGirlsPlan(d.khokhoGirlsPlan || []);
        setShotputGirlsPlan(d.shotputGirlsPlan || []);
        setDrills(d.drills || {});
      } else {
        // Clear state
        setU17BoysPlan([]);
        setU17GirlsPlan([]);
        setU14BoysPlan([]);
        setU14GirlsPlan([]);
        setKhokhoBoysPlan([]);
        setKhokhoGirlsPlan([]);
        setShotputGirlsPlan([]);
        setDrills({});
      }
    });
    return () => unsub();
  }, [store.isLoaded, scheduleKey, db]);

  // Fallbacks if states are empty
  const u17BoysList = useMemo(() => u17BoysPlan.length > 0 ? u17BoysPlan : DEFAULT_U17_BOYS.map(id => ({ playerId: id, game1: 'None', game2: 'None', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [u17BoysPlan]);
  const u17GirlsList = useMemo(() => u17GirlsPlan.length > 0 ? u17GirlsPlan : DEFAULT_U17_GIRLS.map(id => ({ playerId: id, game1: 'None', game2: 'None', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [u17GirlsPlan]);
  const u14BoysList = useMemo(() => u14BoysPlan.length > 0 ? u14BoysPlan : DEFAULT_U14_BOYS.map(id => ({ playerId: id, game1: 'None', game2: 'None', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [u14BoysPlan]);
  const u14GirlsList = useMemo(() => u14GirlsPlan.length > 0 ? u14GirlsPlan : DEFAULT_U14_GIRLS.map(id => ({ playerId: id, game1: 'None', game2: 'None', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [u14GirlsPlan]);
  const khokhoBoysList = useMemo(() => khokhoBoysPlan.length > 0 ? khokhoBoysPlan : DEFAULT_KHOKHO_BOYS.map(id => ({ playerId: id, game1: 'Kho Kho', game2: 'Kho Kho', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [khokhoBoysPlan]);
  const khokhoGirlsList = useMemo(() => khokhoGirlsPlan.length > 0 ? khokhoGirlsPlan : DEFAULT_KHOKHO_GIRLS.map(id => ({ playerId: id, game1: 'Kho Kho', game2: 'Kho Kho', drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry)), [khokhoGirlsPlan]);
  const shotputGirlsList = useMemo(() => shotputGirlsPlan.length > 0 ? shotputGirlsPlan : DEFAULT_SHOTPUT_GIRLS.map((id, idx) => {
    const comboIdx = idx % 6;
    let game1 = 'None';
    let game2 = 'None';
    if (comboIdx === 0) { game1 = 'Shot Put'; game2 = 'Discus Throw'; }
    else if (comboIdx === 1) { game1 = 'Discus Throw'; game2 = 'Javelin Throw'; }
    else if (comboIdx === 2) { game1 = 'Javelin Throw'; game2 = 'Running'; }
    else if (comboIdx === 3) { game1 = 'Shot Put'; game2 = 'Javelin Throw'; }
    else if (comboIdx === 4) { game1 = 'Discus Throw'; game2 = 'Running'; }
    else { game1 = 'Shot Put'; game2 = 'Running'; }
    return { playerId: id, game1, game2, drill1_1: '', drill1_2: '', drill2_1: '', drill2_2: '' } as PlayerPlanEntry;
  }), [shotputGirlsPlan]);

  const getPlayerDetails = useCallback((id: string | null) => {
    if (!id) return null;
    return (store.data.players || []).find((p: any) => p.id === id) || null;
  }, [store.data.players]);

  const getCohortPlayers = useCallback((gender: 'Male' | 'Female', ageCat?: 'U17' | 'U14', isKhokhoOnly?: boolean, isShotPutOnly?: boolean) => {
    return (store.data.players || []).filter((p: any) => {
      if (p.category !== 'athlete') return false;
      if (p.gender !== gender) return false;
      
      if (isKhokhoOnly) {
        return Array.isArray(p.sports) && p.sports.length === 1 && p.sports[0] === 'Kho Kho';
      }

      if (isShotPutOnly) {
        return Array.isArray(p.sports) && p.sports.includes('Shot Put');
      }

      // Filter by age category
      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (ageCat === 'U14' && age >= 14) return false;
      if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;

      // Exclude special groups from the general U17/U14 pool
      if (Array.isArray(p.sports) && p.sports.length === 1 && p.sports[0] === 'Kho Kho') return false;
      if (Array.isArray(p.sports) && p.sports.includes('Shot Put')) return false;

      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players]);

  // Solver
  const handleAutoSchedule = () => {
    if (isPastDate) return;

    // Helper to auto plan multi-sport cohort
    const autoPlanCohort = (playerList: { playerId: string }[]) => {
      const plan: PlayerPlanEntry[] = [];
      const shuffled = [...playerList].sort(() => 0.5 - Math.random());
      
      shuffled.forEach((entry, idx) => {
        const mod = idx % 3;
        let game1 = 'None';
        let game2 = 'None';
        if (mod === 0) {
          game1 = 'Kabaddi';
          game2 = 'Volleyball';
        } else if (mod === 1) {
          game1 = 'Volleyball';
          game2 = 'Kho Kho';
        } else {
          game1 = 'Kabaddi';
          game2 = 'Kho Kho';
        }

        const g1Drills = SPORTS_DATA[game1]?.skills || [];
        const g2Drills = SPORTS_DATA[game2]?.skills || [];
        const shufG1 = [...g1Drills].sort(() => 0.5 - Math.random());
        const shufG2 = [...g2Drills].sort(() => 0.5 - Math.random());

        plan.push({ 
          playerId: entry.playerId, 
          game1, 
          game2,
          drill1_1: shufG1[0] || '',
          drill1_2: shufG1[1] || '',
          drill2_1: shufG2[0] || '',
          drill2_2: shufG2[1] || ''
        });
      });
      return plan;
    };

    const nextU17Boys = autoPlanCohort(u17BoysList);
    const nextU17Girls = autoPlanCohort(u17GirlsList);
    const nextU14Boys = autoPlanCohort(u14BoysList);
    const nextU14Girls = autoPlanCohort(u14GirlsList);

    // Kho Kho daily players practice Kho Kho
    const nextKkBoys = khokhoBoysList.map(item => {
      const kkDrills = [...(SPORTS_DATA['Kho Kho']?.skills || [])].sort(() => 0.5 - Math.random());
      return { 
        playerId: item.playerId, 
        game1: 'Kho Kho', 
        game2: 'Kho Kho',
        drill1_1: kkDrills[0] || '',
        drill1_2: kkDrills[1] || '',
        drill2_1: kkDrills[2] || kkDrills[0] || '',
        drill2_2: kkDrills[3] || kkDrills[1] || ''
      };
    });
    
    const nextKkGirls = khokhoGirlsList.map(item => {
      const kkDrills = [...(SPORTS_DATA['Kho Kho']?.skills || [])].sort(() => 0.5 - Math.random());
      return { 
        playerId: item.playerId, 
        game1: 'Kho Kho', 
        game2: 'Kho Kho',
        drill1_1: kkDrills[0] || '',
        drill1_2: kkDrills[1] || '',
        drill2_1: kkDrills[2] || kkDrills[0] || '',
        drill2_2: kkDrills[3] || kkDrills[1] || ''
      };
    });

    // Athletics / Throws daily players practice 2 sports out of Shot Put, Discus Throw, Javelin Throw, Running
    const nextSpGirls = shotputGirlsList.map((item, idx) => {
      const comboIdx = idx % 6;
      let game1 = 'None';
      let game2 = 'None';
      if (comboIdx === 0) { game1 = 'Shot Put'; game2 = 'Discus Throw'; }
      else if (comboIdx === 1) { game1 = 'Discus Throw'; game2 = 'Javelin Throw'; }
      else if (comboIdx === 2) { game1 = 'Javelin Throw'; game2 = 'Running'; }
      else if (comboIdx === 3) { game1 = 'Shot Put'; game2 = 'Javelin Throw'; }
      else if (comboIdx === 4) { game1 = 'Discus Throw'; game2 = 'Running'; }
      else { game1 = 'Shot Put'; game2 = 'Running'; }

      const g1Drills = SPORTS_DATA[game1]?.skills || [];
      const g2Drills = SPORTS_DATA[game2]?.skills || [];
      const shufG1 = [...g1Drills].sort(() => 0.5 - Math.random());
      const shufG2 = [...g2Drills].sort(() => 0.5 - Math.random());

      return { 
        playerId: item.playerId, 
        game1, 
        game2,
        drill1_1: shufG1[0] || '',
        drill1_2: shufG1[1] || '',
        drill2_1: shufG2[0] || '',
        drill2_2: shufG2[1] || ''
      };
    });

    // Select exactly 2 drills for each sport globally (backup)
    const nextDrills: Record<string, string[]> = {};
    ['Kabaddi', 'Volleyball', 'Kho Kho', 'Shot Put', 'Discus Throw', 'Javelin Throw', 'Running'].forEach(sport => {
      const list = SPORTS_DATA[sport]?.skills || [];
      nextDrills[sport] = [...list].sort(() => 0.5 - Math.random()).slice(0, 2);
    });

    setU17BoysPlan(nextU17Boys);
    setU17GirlsPlan(nextU17Girls);
    setU14BoysPlan(nextU14Boys);
    setU14GirlsPlan(nextU14Girls);
    setKhokhoBoysPlan(nextKkBoys);
    setKhokhoGirlsPlan(nextKkGirls);
    setShotputGirlsPlan(nextSpGirls);
    setDrills(nextDrills);

    toast({ title: "Master Planner Generated", description: "Successfully generated practice plan with zero conflict." });
  };

  const handlePlayerChange = (cohort: typeof activeTab, idx: number, val: string) => {
    if (isPastDate) return;
    const planUpdater = (prev: PlayerPlanEntry[], list: PlayerPlanEntry[]) => {
      const next = prev.length > 0 ? [...prev] : [...list];
      if (next[idx]) {
        next[idx] = { ...next[idx], playerId: val };
      }
      return next;
    };

    if (cohort === 'u17boys') setU17BoysPlan(prev => planUpdater(prev, u17BoysList));
    if (cohort === 'u17girls') setU17GirlsPlan(prev => planUpdater(prev, u17GirlsList));
    if (cohort === 'u14boys') setU14BoysPlan(prev => planUpdater(prev, u14BoysList));
    if (cohort === 'u14girls') setU14GirlsPlan(prev => planUpdater(prev, u14GirlsList));
    if (cohort === 'khokhoboys') setKhokhoBoysPlan(prev => planUpdater(prev, khokhoBoysList));
    if (cohort === 'khokhogirls') setKhokhoGirlsPlan(prev => planUpdater(prev, khokhoGirlsList));
    if (cohort === 'shotputgirls') setShotputGirlsPlan(prev => planUpdater(prev, shotputGirlsList));
  };

  const handleBulkApply = (cohort: typeof activeTab) => {
    if (isPastDate) return;
    const planUpdater = (prev: PlayerPlanEntry[], list: PlayerPlanEntry[]) => {
      const next = prev.length > 0 ? [...prev] : [...list];
      return next.map(item => {
        if (bulkSlot === 'game1') {
          return {
            ...item,
            game1: bulkGame,
            drill1_1: bulkDrill1,
            drill1_2: bulkDrill2
          };
        } else {
          return {
            ...item,
            game2: bulkGame,
            drill2_1: bulkDrill1,
            drill2_2: bulkDrill2
          };
        }
      });
    };

    if (cohort === 'u17boys') setU17BoysPlan(prev => planUpdater(prev, u17BoysList));
    if (cohort === 'u17girls') setU17GirlsPlan(prev => planUpdater(prev, u17GirlsList));
    if (cohort === 'u14boys') setU14BoysPlan(prev => planUpdater(prev, u14BoysList));
    if (cohort === 'u14girls') setU14GirlsPlan(prev => planUpdater(prev, u14GirlsList));
    if (cohort === 'khokhoboys') setKhokhoBoysPlan(prev => planUpdater(prev, khokhoBoysList));
    if (cohort === 'khokhogirls') setKhokhoGirlsPlan(prev => planUpdater(prev, khokhoGirlsList));
    if (cohort === 'shotputgirls') setShotputGirlsPlan(prev => planUpdater(prev, shotputGirlsList));

    toast({
      title: "Bulk Applied",
      description: `Successfully applied ${bulkGame} to all players in this cohort.`
    });
  };

  const handleGameChange = (cohort: typeof activeTab, idx: number, gameSlot: 'game1' | 'game2', val: string) => {
    if (isPastDate) return;
    const planUpdater = (prev: PlayerPlanEntry[], list: PlayerPlanEntry[]) => {
      const next = prev.length > 0 ? [...prev] : [...list];
      if (next[idx]) {
        const defaultDrills = val !== 'None' ? (SPORTS_DATA[val]?.skills || []) : [];
        next[idx] = { 
          ...next[idx], 
          [gameSlot]: val,
          [gameSlot === 'game1' ? 'drill1_1' : 'drill2_1']: defaultDrills[0] || '',
          [gameSlot === 'game1' ? 'drill1_2' : 'drill2_2']: defaultDrills[1] || ''
        };
      }
      return next;
    };

    if (cohort === 'u17boys') setU17BoysPlan(prev => planUpdater(prev, u17BoysList));
    if (cohort === 'u17girls') setU17GirlsPlan(prev => planUpdater(prev, u17GirlsList));
    if (cohort === 'u14boys') setU14BoysPlan(prev => planUpdater(prev, u14BoysList));
    if (cohort === 'u14girls') setU14GirlsPlan(prev => planUpdater(prev, u14GirlsList));
    if (cohort === 'khokhoboys') setKhokhoBoysPlan(prev => planUpdater(prev, khokhoBoysList));
    if (cohort === 'khokhogirls') setKhokhoGirlsPlan(prev => planUpdater(prev, khokhoGirlsList));
    if (cohort === 'shotputgirls') setShotputGirlsPlan(prev => planUpdater(prev, shotputGirlsList));
  };

  const handleDrillFieldChange = (cohort: typeof activeTab, idx: number, drillSlot: 'drill1_1' | 'drill1_2' | 'drill2_1' | 'drill2_2', val: string) => {
    if (isPastDate) return;
    const planUpdater = (prev: PlayerPlanEntry[], list: PlayerPlanEntry[]) => {
      const next = prev.length > 0 ? [...prev] : [...list];
      if (next[idx]) {
        next[idx] = { ...next[idx], [drillSlot]: val };
      }
      return next;
    };

    if (cohort === 'u17boys') setU17BoysPlan(prev => planUpdater(prev, u17BoysList));
    if (cohort === 'u17girls') setU17GirlsPlan(prev => planUpdater(prev, u17GirlsList));
    if (cohort === 'u14boys') setU14BoysPlan(prev => planUpdater(prev, u14BoysList));
    if (cohort === 'u14girls') setU14GirlsPlan(prev => planUpdater(prev, u14GirlsList));
    if (cohort === 'khokhoboys') setKhokhoBoysPlan(prev => planUpdater(prev, khokhoBoysList));
    if (cohort === 'khokhogirls') setKhokhoGirlsPlan(prev => planUpdater(prev, khokhoGirlsList));
    if (cohort === 'shotputgirls') setShotputGirlsPlan(prev => planUpdater(prev, shotputGirlsList));
  };

  const handleDrillChange = (sport: string, drillIdx: number, val: string) => {
    if (isPastDate) return;
    setDrills(prev => {
      const next = { ...prev };
      const list = [...(next[sport] || ['', ''])];
      list[drillIdx] = val;
      next[sport] = list;
      return next;
    });
  };

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'master_auto_plans', scheduleKey);
      await setDoc(docRef, {
        id: scheduleKey,
        schoolId,
        date: selectedDate,
        session: selectedSession,
        timeRange: selectedSession === 'Morning' ? '6:00 AM - 7:30 AM' : '5:00 PM - 7:00 PM',
        u17BoysPlan: u17BoysList,
        u17GirlsPlan: u17GirlsList,
        u14BoysPlan: u14BoysList,
        u14GirlsPlan: u14GirlsList,
        khokhoBoysPlan: khokhoBoysList,
        khokhoGirlsPlan: khokhoGirlsList,
        shotputGirlsPlan: shotputGirlsList,
        drills,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Planner Saved", description: `Saved ${selectedSession} practice plan successfully.` });
    } catch (e) {
      toast({ title: "Failed to Save", description: "Error writing master planner to database.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const schoolName = store.data.schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
    const timeText = selectedSession === 'Morning' ? 'Morning Session: 6:00 AM - 7:30 AM' : 'Evening Session: 5:00 PM - 7:00 PM';
    const coachName = "Sunil Deshmukh";

    const getGroundNo = (sport: string) => {
      if (sport === 'Kabaddi') return 'Ground No. 1';
      if (sport === 'Volleyball') return 'Ground No. 2';
      if (sport === 'Kho Kho') return 'Ground No. 3';
      if (sport === 'Shot Put') return 'Ground No. 4';
      return '';
    };

    const renderPrintPage = (
      title: string, 
      boysList: PlayerPlanEntry[], 
      girlsList: PlayerPlanEntry[] | null, 
      pageNum: number, 
      totalPages: number
    ) => {
      const renderTable = (subTitle: string, list: PlayerPlanEntry[]) => {
        const activeEntries = list.filter(item => {
          if (!item.playerId || item.playerId === 'vacant') return false;
          const player = getPlayerDetails(item.playerId);
          if (!player) return false;
          return true;
        });

        const details = activeEntries.map((item, i) => ({ 
          index: i + 1, 
          player: getPlayerDetails(item.playerId), 
          game1: item.game1, 
          game2: item.game2,
          drill1_1: item.drill1_1,
          drill1_2: item.drill1_2,
          drill2_1: item.drill2_1,
          drill2_2: item.drill2_2
        }));

        return `
          <div style="margin-bottom: 6px; page-break-inside: avoid;">
            <div style="background: #235C36; color: white; padding: 4px 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; border-radius: 4px 4px 0 0; border: 1px solid #1c4a2b; letter-spacing: 0.5px;">
              ${subTitle}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #777;">
              <thead>
                <tr style="background: #e8efe9; font-size: 10px; border-bottom: 2px solid #235C36;">
                  <th style="border: 1px solid #777; padding: 3px; text-align: center; width: 40px; font-weight: 900; color: #111;">SLOT</th>
                  <th style="border: 1px solid #777; padding: 3px 6px; text-align: left; font-weight: 900; color: #111;">PLAYER NAME</th>
                  <th style="border: 1px solid #777; padding: 3px; text-align: center; width: 40px; font-weight: 900; color: #111;">STD</th>
                  <th style="border: 1px solid #777; padding: 3px 6px; text-align: left; font-weight: 900; width: 180px; color: #111;">GAME 1 PRACTICE</th>
                  <th style="border: 1px solid #777; padding: 3px 6px; text-align: left; font-weight: 900; width: 180px; color: #111;">GAME 2 PRACTICE</th>
                  <th style="border: 1px solid #777; padding: 3px; text-align: center; width: 50px; font-weight: 900; color: #111;">ATTEND</th>
                </tr>
              </thead>
              <tbody>
                ${details.length === 0 ? `
                  <tr>
                    <td colspan="6" style="border: 1px solid #777; padding: 12px; text-align: center; color: #666; font-style: italic; font-weight: bold;">
                      No active players scheduled.
                    </td>
                  </tr>
                ` : details.map(item => {
                  const isGroupLeader = item.index <= 2;
                  const pName = item.player ? item.player.name : '- VACANT -';
                  const pNameText = isGroupLeader 
                    ? `${pName} <span style="font-size: 7px; color: #b45309; background: #fef3c7; padding: 1px 3px; border-radius: 2px; font-weight: 900; border: 1px solid #f59e0b; margin-left: 4px; display: inline-block;">LEADER</span>`
                    : pName;

                  // Game 1 Details
                  const g1 = item.game1;
                  const g1Ground = getGroundNo(g1);
                  const g1Drills = [item.drill1_1, item.drill1_2].filter(Boolean).join(', ') || drills[g1]?.join(', ') || 'No drills';
                  const g1Text = g1 !== 'None'
                    ? `<div style="font-weight: 900; text-transform: uppercase; font-size: 11px; color: #111;">${g1}</div>
                       <div style="font-size: 9px; color: #b45309; font-weight: 900; margin-top: 1px;">${g1Ground}</div>
                       <div style="font-size: 9px; color: #333; font-style: italic; margin-top: 1px; line-height: 1.1;">
                         Drills: <span contenteditable="true" style="border-bottom: 1px dashed #666; cursor: text; color: #000; font-weight: bold;">${g1Drills}</span>
                       </div>`
                    : `<span style="color: #999;">-</span>`;

                  // Game 2 Details
                  const g2 = item.game2;
                  const g2Ground = getGroundNo(g2);
                  const g2Drills = [item.drill2_1, item.drill2_2].filter(Boolean).join(', ') || drills[g2]?.join(', ') || 'No drills';
                  const g2Text = g2 !== 'None'
                    ? `<div style="font-weight: 900; text-transform: uppercase; font-size: 11px; color: #111;">${g2}</div>
                       <div style="font-size: 9px; color: #b45309; font-weight: 900; margin-top: 1px;">${g2Ground}</div>
                       <div style="font-size: 9px; color: #333; font-style: italic; margin-top: 1px; line-height: 1.1;">
                         Drills: <span contenteditable="true" style="border-bottom: 1px dashed #666; cursor: text; color: #000; font-weight: bold;">${g2Drills}</span>
                       </div>`
                    : `<span style="color: #999;">-</span>`;

                  return `
                    <tr style="height: 25px;">
                      <td style="border: 1px solid #777; padding: 3px; text-align: center; font-weight: bold; background: #fafafa; color: #111;">${item.index}</td>
                      <td style="border: 1px solid #777; padding: 3px 6px; font-weight: 900; text-transform: uppercase; color: #000; font-size: 11px;" contenteditable="true">
                        ${pNameText}
                      </td>
                      <td style="border: 1px solid #777; padding: 3px; text-align: center; font-weight: bold;" contenteditable="true">${item.player ? item.player.std : '-'}</td>
                      <td style="border: 1px solid #777; padding: 3px 6px; vertical-align: top;">${g1Text}</td>
                      <td style="border: 1px solid #777; padding: 3px 6px; vertical-align: top;">${g2Text}</td>
                      <td style="border: 1px solid #777; padding: 3px; text-align: center; font-size: 16px; font-weight: bold; color: #000;">☐</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      };

      const boysTableHtml = boysList.length > 0 ? renderTable("Boys Practice Timetable", boysList) : '';
      const girlsTableHtml = girlsList && girlsList.length > 0 ? renderTable("Girls Practice Timetable", girlsList) : '';

      return `
        <div class="print-page-block" style="page-break-after: ${pageNum < totalPages ? 'always' : 'avoid'}; page-break-inside: avoid; max-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; padding: 2px;">
          <div style="text-align: center; border-bottom: 2px double #235C36; padding-bottom: 2px; margin-bottom: 6px;">
            <div style="font-size: 18px; font-weight: 900; color: #235C36; text-transform: uppercase; letter-spacing: 0.5px;">${schoolName}</div>
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; margin-top: 1px; color: #333; letter-spacing: 0.5px;">DAILY PRACTICE TIMETABLE - ${title}</div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 8px; background: #f9f9f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #bbb; text-transform: uppercase;">
            <div>DATE: <span style="color: #235C36; font-weight: 900;">${selectedDate}</span></div>
            <div>SESSION: <span style="color: #235C36; font-weight: 900;">${timeText}</span></div>
            <div>COACH: <span style="color: #235C36; font-weight: 900;">${coachName}</span></div>
          </div>

          <div style="flex: 1;">
            ${boysTableHtml}
            ${girlsTableHtml}
          </div>

          <div style="font-size: 8px; color: #555; text-align: center; margin-top: auto; padding-top: 4px; border-top: 1px solid #ccc; display: flex; justify-content: space-between; font-weight: bold;">
            <span>Page ${pageNum} of ${totalPages}</span>
            <span>Ashram Shala Waghamba &bull; Physical Education Registry</span>
            <span>Printed on: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      `;
    };

    const pagesHtml = [
      renderPrintPage("Under 17 Cohorts", u17BoysList, u17GirlsList, 1, 4),
      renderPrintPage("Under 14 Cohorts", u14BoysList, u14GirlsList, 2, 4),
      renderPrintPage("Kho Kho Daily Cohorts", khokhoBoysList, khokhoGirlsList, 3, 4),
      renderPrintPage("Athletics & Throws (Shot Put, Discus, Javelin & Running) Girls", [], shotputGirlsList, 4, 4)
    ].join('');

    const printContent = `
      <html>
        <head>
          <title>Practice Planner - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0 !important; padding: 0 !important; }
              @page {
                size: legal portrait;
                margin: 10mm 10mm 10mm 10mm;
              }
            }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 10px; color: #111; line-height: 1.25; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; font-family: inherit; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">PRINT TIMETABLE</button>
          </div>
          ${pagesHtml}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const tabs = [
    { id: 'u17boys', label: 'U17 Boys' },
    { id: 'u17girls', label: 'U17 Girls' },
    { id: 'u14boys', label: 'U14 Boys' },
    { id: 'u14girls', label: 'U14 Girls' },
    { id: 'khokhoboys', label: 'Kho Kho Boys' },
    { id: 'khokhogirls', label: 'Kho Kho Girls' },
    { id: 'shotputgirls', label: 'Athletics / Throws Girls' },
    { id: 'drills', label: 'Focus Drills' }
  ] as const;

  const currentCohortInfo = useMemo(() => {
    if (activeTab === 'u17boys') return { gender: 'Male' as const, ageCat: 'U17' as const, list: u17BoysList, isKhokho: false, isShotPut: false };
    if (activeTab === 'u17girls') return { gender: 'Female' as const, ageCat: 'U17' as const, list: u17GirlsList, isKhokho: false, isShotPut: false };
    if (activeTab === 'u14boys') return { gender: 'Male' as const, ageCat: 'U14' as const, list: u14BoysList, isKhokho: false, isShotPut: false };
    if (activeTab === 'u14girls') return { gender: 'Female' as const, ageCat: 'U14' as const, list: u14GirlsList, isKhokho: false, isShotPut: false };
    if (activeTab === 'khokhoboys') return { gender: 'Male' as const, ageCat: undefined, list: khokhoBoysList, isKhokho: true, isShotPut: false };
    if (activeTab === 'khokhogirls') return { gender: 'Female' as const, ageCat: undefined, list: khokhoGirlsList, isKhokho: true, isShotPut: false };
    return { gender: 'Female' as const, ageCat: undefined, list: shotputGirlsList, isKhokho: false, isShotPut: true };
  }, [activeTab, u17BoysList, u17GirlsList, u14BoysList, u14GirlsList, khokhoBoysList, khokhoGirlsList, shotputGirlsList]);

  const poolOptions = useMemo(() => {
    if (activeTab === 'drills') return [];
    return getCohortPlayers(currentCohortInfo.gender, currentCohortInfo.ageCat, currentCohortInfo.isKhokho, currentCohortInfo.isShotPut);
  }, [activeTab, currentCohortInfo, getCohortPlayers]);

  return (
    <div className="space-y-8 pb-32">
      {/* Header controls card */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Master Auto Planner</h2>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              शासकीय माध्यमिक आश्रम शाळा वाघंबा &bull; Coach Sunil Deshmukh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="space-y-1 w-full sm:w-48">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Training Session</label>
            <Select value={selectedSession} onValueChange={(val: any) => setSelectedSession(val)}>
              <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning" className="font-bold">Morning (6:00 to 7:30 AM)</SelectItem>
                <SelectItem value="Evening" className="font-bold">Evening (5 to 7 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 w-full sm:w-44">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Planner Date</label>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"
            />
          </div>

          <div className="pt-5 w-full sm:w-auto">
            <Button 
              onClick={handleAutoSchedule} 
              disabled={isPastDate}
              className="h-12 w-full bg-accent text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-md active-scale flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" /> Auto Plan Day
            </Button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-primary/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-primary border-primary text-white shadow-md' 
                : 'bg-white border-primary/10 hover:border-primary/30 text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Workspace */}
      <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
          <div className="flex justify-between items-center">
            <span className="text-lg font-black uppercase text-primary tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label} Workspace
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Configure Practice Timetable
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {activeTab === 'drills' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {['Kabaddi', 'Volleyball', 'Kho Kho', 'Shot Put'].map(sport => {
                const sportDrills = drills[sport] || ['', ''];
                const ground = GROUND_NUMBERS[sport];
                return (
                  <Card key={sport} className="border-2 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-primary/5 p-4 border-b">
                      <span className="text-sm font-black uppercase text-primary block">{sport} Drills</span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {ground}
                      </span>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Focus Drill 1</label>
                        <Select 
                          value={sportDrills[0] || ''} 
                          onValueChange={(val) => handleDrillChange(sport, 0, val)}
                        >
                          <SelectTrigger className="h-10 text-xs font-bold border-2 bg-white rounded-lg shadow-sm">
                            <SelectValue placeholder="Select Focus Drill 1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="" className="font-bold">-- Select Drill --</SelectItem>
                            {(SPORTS_DATA[sport]?.skills || []).map((skill) => (
                              <SelectItem key={skill} value={skill} className="font-bold">{skill}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Focus Drill 2</label>
                        <Select 
                          value={sportDrills[1] || ''} 
                          onValueChange={(val) => handleDrillChange(sport, 1, val)}
                        >
                          <SelectTrigger className="h-10 text-xs font-bold border-2 bg-white rounded-lg shadow-sm">
                            <SelectValue placeholder="Select Focus Drill 2" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="" className="font-bold">-- Select Drill --</SelectItem>
                            {(SPORTS_DATA[sport]?.skills || []).map((skill) => (
                              <SelectItem key={skill} value={skill} className="font-bold">{skill}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Apply Bar */}
              <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    Bulk Cohort Scheduler
                  </span>
                  <p className="text-[10px] font-bold text-amber-700 uppercase">
                    Select game & drills to apply to all players in this cohort.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-40">
                    <Select value={bulkGame} onValueChange={setBulkGame}>
                      <SelectTrigger className="h-9 text-xs font-bold border bg-white rounded-lg">
                        <SelectValue placeholder="Select Game" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        <SelectItem value="None" className="font-bold">-- NONE --</SelectItem>
                        <SelectItem value="Kabaddi" className="font-bold">KABADDI (G1)</SelectItem>
                        <SelectItem value="Volleyball" className="font-bold">VOLLEYBALL (G2)</SelectItem>
                        <SelectItem value="Kho Kho" className="font-bold">KHO KHO (G3)</SelectItem>
                        <SelectItem value="Shot Put" className="font-bold">SHOT PUT (G4)</SelectItem>
                        <SelectItem value="Discus Throw" className="font-bold">DISCUS THROW (G5)</SelectItem>
                        <SelectItem value="Javelin Throw" className="font-bold">JAVELIN THROW (G6)</SelectItem>
                        <SelectItem value="Running" className="font-bold">RUNNING (G7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-44">
                    <Select 
                      value={bulkDrill1} 
                      onValueChange={setBulkDrill1}
                      disabled={bulkGame === 'None'}
                    >
                      <SelectTrigger className="h-9 text-xs font-bold border bg-white rounded-lg">
                        <SelectValue placeholder="Select Drill 1" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        <SelectItem value="" className="font-bold">-- NO DRILL --</SelectItem>
                        {(SPORTS_DATA[bulkGame]?.skills || []).map(skill => (
                          <SelectItem key={skill} value={skill} className="font-bold">{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-44">
                    <Select 
                      value={bulkDrill2} 
                      onValueChange={setBulkDrill2}
                      disabled={bulkGame === 'None'}
                    >
                      <SelectTrigger className="h-9 text-xs font-bold border bg-white rounded-lg">
                        <SelectValue placeholder="Select Drill 2" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        <SelectItem value="" className="font-bold">-- NO DRILL --</SelectItem>
                        {(SPORTS_DATA[bulkGame]?.skills || []).map(skill => (
                          <SelectItem key={skill} value={skill} className="font-bold">{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Select value={bulkSlot} onValueChange={(val: any) => setBulkSlot(val)}>
                      <SelectTrigger className="h-9 text-xs font-bold border bg-white rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        <SelectItem value="game1" className="font-bold">GAME 1 SLOT</SelectItem>
                        <SelectItem value="game2" className="font-bold">GAME 2 SLOT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <button
                    onClick={() => handleBulkApply(activeTab)}
                    disabled={isPastDate}
                    className="h-9 px-4 text-xs font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Apply to All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-primary/10 text-left">
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-16 text-center">Slot</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase">Player Profile</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-16 text-center">Std</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-80">Game 1 Practice</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-80">Game 2 Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {currentCohortInfo.list.map((entry, idx) => {
                    const player = getPlayerDetails(entry.playerId);
                    const isLeader = idx < 2;

                    return (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${
                            isLeader 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-primary/5 text-primary'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[240px]">
                              <Select 
                                value={entry.playerId} 
                                onValueChange={(val) => handlePlayerChange(activeTab, idx, val)}
                              >
                                <SelectTrigger className="h-9 text-xs font-bold border-2 bg-white rounded-lg shadow-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  <SelectItem value="vacant" className="font-bold text-red-600">
                                    -- VACANT / EMPTY --
                                  </SelectItem>
                                  {entry.playerId && entry.playerId !== 'vacant' && (
                                    <SelectItem value={entry.playerId} className="font-bold">
                                      {(player?.name || 'Vacant').toUpperCase()}
                                    </SelectItem>
                                  )}
                                  {poolOptions
                                    .filter((p: any) => p.id !== entry.playerId && p.id !== 'vacant')
                                    .map((p: any) => (
                                      <SelectItem key={p.id} value={p.id} className="font-bold">
                                        {p.name.toUpperCase()} (Std {p.std})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {isLeader && (
                              <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded shadow-sm">
                                Leader
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-center font-black text-muted-foreground text-sm">
                          {player ? player.std : '-'}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="space-y-2">
                            <Select 
                              value={entry.game1} 
                              onValueChange={(val) => handleGameChange(activeTab, idx, 'game1', val)}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold border-2 bg-white rounded-lg shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None" className="font-bold">-- NONE --</SelectItem>
                                <SelectItem value="Kabaddi" className="font-bold">KABADDI (G1)</SelectItem>
                                <SelectItem value="Volleyball" className="font-bold">VOLLEYBALL (G2)</SelectItem>
                                <SelectItem value="Kho Kho" className="font-bold">KHO KHO (G3)</SelectItem>
                                <SelectItem value="Shot Put" className="font-bold">SHOT PUT (G4)</SelectItem>
                                <SelectItem value="Discus Throw" className="font-bold">DISCUS THROW (G5)</SelectItem>
                                <SelectItem value="Javelin Throw" className="font-bold">JAVELIN THROW (G6)</SelectItem>
                                <SelectItem value="Running" className="font-bold">RUNNING (G7)</SelectItem>
                              </SelectContent>
                            </Select>
                            {entry.game1 !== 'None' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <Select 
                                  value={entry.drill1_1 || ''} 
                                  onValueChange={(val) => handleDrillFieldChange(activeTab, idx, 'drill1_1', val)}
                                >
                                  <SelectTrigger className="h-8 text-[10px] font-bold border bg-white rounded-lg shadow-sm">
                                    <SelectValue placeholder="Drill 1" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48">
                                    {(SPORTS_DATA[entry.game1]?.skills || []).map(skill => (
                                      <SelectItem key={skill} value={skill} className="text-[10px] font-bold">{skill}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select 
                                  value={entry.drill1_2 || ''} 
                                  onValueChange={(val) => handleDrillFieldChange(activeTab, idx, 'drill1_2', val)}
                                >
                                  <SelectTrigger className="h-8 text-[10px] font-bold border bg-white rounded-lg shadow-sm">
                                    <SelectValue placeholder="Drill 2" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48">
                                    {(SPORTS_DATA[entry.game1]?.skills || []).map(skill => (
                                      <SelectItem key={skill} value={skill} className="text-[10px] font-bold">{skill}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="space-y-2">
                            <Select 
                              value={entry.game2} 
                              onValueChange={(val) => handleGameChange(activeTab, idx, 'game2', val)}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold border-2 bg-white rounded-lg shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None" className="font-bold">-- NONE --</SelectItem>
                                <SelectItem value="Kabaddi" className="font-bold">KABADDI (G1)</SelectItem>
                                <SelectItem value="Volleyball" className="font-bold">VOLLEYBALL (G2)</SelectItem>
                                <SelectItem value="Kho Kho" className="font-bold">KHO KHO (G3)</SelectItem>
                                <SelectItem value="Shot Put" className="font-bold">SHOT PUT (G4)</SelectItem>
                                <SelectItem value="Discus Throw" className="font-bold">DISCUS THROW (G5)</SelectItem>
                                <SelectItem value="Javelin Throw" className="font-bold">JAVELIN THROW (G6)</SelectItem>
                                <SelectItem value="Running" className="font-bold">RUNNING (G7)</SelectItem>
                              </SelectContent>
                            </Select>
                            {entry.game2 !== 'None' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <Select 
                                  value={entry.drill2_1 || ''} 
                                  onValueChange={(val) => handleDrillFieldChange(activeTab, idx, 'drill2_1', val)}
                                >
                                  <SelectTrigger className="h-8 text-[10px] font-bold border bg-white rounded-lg shadow-sm">
                                    <SelectValue placeholder="Drill 1" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48">
                                    {(SPORTS_DATA[entry.game2]?.skills || []).map(skill => (
                                      <SelectItem key={skill} value={skill} className="text-[10px] font-bold">{skill}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select 
                                  value={entry.drill2_2 || ''} 
                                  onValueChange={(val) => handleDrillFieldChange(activeTab, idx, 'drill2_2', val)}
                                >
                                  <SelectTrigger className="h-8 text-[10px] font-bold border bg-white rounded-lg shadow-sm">
                                    <SelectValue placeholder="Drill 2" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48">
                                    {(SPORTS_DATA[entry.game2]?.skills || []).map(skill => (
                                      <SelectItem key={skill} value={skill} className="text-[10px] font-bold">{skill}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Action floating bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border-2 border-primary/10 shadow-2xl px-8 py-5 rounded-[2rem] flex items-center justify-center gap-4 z-40 w-[90%] max-w-xl animate-in slide-in-from-bottom-8 duration-500">
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="rounded-2xl border-2 font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-sm flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5 text-primary" /> Print Plan
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isPastDate}
          className="rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-lg active-scale flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : isPastDate ? (
            <span>Archived Session</span>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
