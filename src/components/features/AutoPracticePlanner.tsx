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
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': { skills: ["Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill", "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill", "Thigh hold drill", "Chain tackle drill"] },
  'Volleyball': { skills: ["Serve practice drill", "Underhand pass drill", "Overhand pass drill", "Set practice drill", "Spike approach drill", "Block timing drill", "Dig practice drill", "Court coverage drill"] },
  'Kho Kho': { skills: ["Pole turn speed drill", "Chaser speed run", "Kho timing tap", "Dodging practice", "Single chain run", "Double chain run", "Dive attack drill", "Sudden turn drill"] }
};

const GROUND_NUMBERS: Record<string, string> = {
  'Kabaddi': 'Ground No. 1',
  'Volleyball': 'Ground No. 2',
  'Kho Kho': 'Ground No. 3'
};

const DEFAULT_U17_BOYS = ["u17_b1", "u17_b2", "u17_b3", "u17_b4", "u17_b5", "u17_b6", "u17_b7", "u17_b8", "u17_b9", "u17_b10", "u17_b11", "u17_b12"];
const DEFAULT_U17_GIRLS = ["u17_g1", "u17_g2", "u17_g3", "u17_g4", "u17_g5", "u17_g6", "u17_g7", "u17_g8", "u17_g9", "u17_g10", "u17_g11", "u17_g12"];
const DEFAULT_U14_BOYS = ["u14_b1", "u14_b2", "u14_b3", "u14_b4", "u14_b5", "u14_b6", "u14_b7", "u14_b8", "u14_b9", "u14_b10"];
const DEFAULT_U14_GIRLS = ["u14_g1", "u14_g2", "u14_g3", "u14_g4", "u14_g5", "u14_g6", "u14_g7", "u14_g8", "u14_g9"];
const DEFAULT_KHOKHO_BOYS = ["kk_b1", "kk_b2", "kk_b3", "kk_b4", "kk_b5", "kk_b6", "kk_b7", "kk_b8", "kk_b9", "kk_b10"];
const DEFAULT_KHOKHO_GIRLS = ["kk_g1", "kk_g2", "kk_g3", "kk_g4", "kk_g5", "kk_g6", "kk_g7", "kk_g8", "kk_g9"];

interface PlayerPlanEntry {
  playerId: string;
  game1: string;
  game2: string;
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
  const [activeTab, setActiveTab] = useState<'u17boys' | 'u17girls' | 'u14boys' | 'u14girls' | 'khokhoboys' | 'khokhogirls' | 'drills'>('u17boys');

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
        setDrills(d.drills || {});
      } else {
        // Clear state
        setU17BoysPlan([]);
        setU17GirlsPlan([]);
        setU14BoysPlan([]);
        setU14GirlsPlan([]);
        setKhokhoBoysPlan([]);
        setKhokhoGirlsPlan([]);
        setDrills({});
      }
    });
    return () => unsub();
  }, [store.isLoaded, scheduleKey, db]);

  // Fallbacks if states are empty
  const u17BoysList = useMemo(() => u17BoysPlan.length > 0 ? u17BoysPlan : DEFAULT_U17_BOYS.map(id => ({ playerId: id, game1: 'None', game2: 'None' })), [u17BoysPlan]);
  const u17GirlsList = useMemo(() => u17GirlsPlan.length > 0 ? u17GirlsPlan : DEFAULT_U17_GIRLS.map(id => ({ playerId: id, game1: 'None', game2: 'None' })), [u17GirlsPlan]);
  const u14BoysList = useMemo(() => u14BoysPlan.length > 0 ? u14BoysPlan : DEFAULT_U14_BOYS.map(id => ({ playerId: id, game1: 'None', game2: 'None' })), [u14BoysPlan]);
  const u14GirlsList = useMemo(() => u14GirlsPlan.length > 0 ? u14GirlsPlan : DEFAULT_U14_GIRLS.map(id => ({ playerId: id, game1: 'None', game2: 'None' })), [u14GirlsPlan]);
  const khokhoBoysList = useMemo(() => khokhoBoysPlan.length > 0 ? khokhoBoysPlan : DEFAULT_KHOKHO_BOYS.map(id => ({ playerId: id, game1: 'Kho Kho', game2: 'Kho Kho' })), [khokhoBoysPlan]);
  const khokhoGirlsList = useMemo(() => khokhoGirlsPlan.length > 0 ? khokhoGirlsPlan : DEFAULT_KHOKHO_GIRLS.map(id => ({ playerId: id, game1: 'Kho Kho', game2: 'Kho Kho' })), [khokhoGirlsPlan]);

  const getPlayerDetails = useCallback((id: string | null) => {
    if (!id) return null;
    return (store.data.players || []).find((p: any) => p.id === id) || null;
  }, [store.data.players]);

  const getCohortPlayers = useCallback((gender: 'Male' | 'Female', ageCat?: 'U17' | 'U14', isKhokhoOnly?: boolean) => {
    return (store.data.players || []).filter((p: any) => {
      if (p.category !== 'athlete') return false;
      if (p.gender !== gender) return false;
      
      if (isKhokhoOnly) {
        return Array.isArray(p.sports) && p.sports.length === 1 && p.sports[0] === 'Kho Kho';
      }

      // Filter by age category
      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (ageCat === 'U14' && age >= 14) return false;
      if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;

      // Exclude khokho-only players from the general U17/U14 pool
      if (Array.isArray(p.sports) && p.sports.length === 1 && p.sports[0] === 'Kho Kho') return false;

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
        if (mod === 0) {
          plan.push({ playerId: entry.playerId, game1: 'Kabaddi', game2: 'Volleyball' });
        } else if (mod === 1) {
          plan.push({ playerId: entry.playerId, game1: 'Volleyball', game2: 'Kho Kho' });
        } else {
          plan.push({ playerId: entry.playerId, game1: 'Kabaddi', game2: 'Kho Kho' });
        }
      });
      return plan;
    };

    const nextU17Boys = autoPlanCohort(u17BoysList);
    const nextU17Girls = autoPlanCohort(u17GirlsList);
    const nextU14Boys = autoPlanCohort(u14BoysList);
    const nextU14Girls = autoPlanCohort(u14GirlsList);

    // Kho Kho daily players practice Kho Kho
    const nextKkBoys = khokhoBoysList.map(item => ({ playerId: item.playerId, game1: 'Kho Kho', game2: 'Kho Kho' }));
    const nextKkGirls = khokhoGirlsList.map(item => ({ playerId: item.playerId, game1: 'Kho Kho', game2: 'Kho Kho' }));

    // Select exactly 2 drills for each sport
    const nextDrills: Record<string, string[]> = {};
    ['Kabaddi', 'Volleyball', 'Kho Kho'].forEach(sport => {
      const list = SPORTS_DATA[sport]?.skills || [];
      nextDrills[sport] = [...list].sort(() => 0.5 - Math.random()).slice(0, 2);
    });

    setU17BoysPlan(nextU17Boys);
    setU17GirlsPlan(nextU17Girls);
    setU14BoysPlan(nextU14Boys);
    setU14GirlsPlan(nextU14Girls);
    setKhokhoBoysPlan(nextKkBoys);
    setKhokhoGirlsPlan(nextKkGirls);
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
  };

  const handleGameChange = (cohort: typeof activeTab, idx: number, gameSlot: 'game1' | 'game2', val: string) => {
    if (isPastDate) return;
    const planUpdater = (prev: PlayerPlanEntry[], list: PlayerPlanEntry[]) => {
      const next = prev.length > 0 ? [...prev] : [...list];
      if (next[idx]) {
        next[idx] = { ...next[idx], [gameSlot]: val };
      }
      return next;
    };

    if (cohort === 'u17boys') setU17BoysPlan(prev => planUpdater(prev, u17BoysList));
    if (cohort === 'u17girls') setU17GirlsPlan(prev => planUpdater(prev, u17GirlsList));
    if (cohort === 'u14boys') setU14BoysPlan(prev => planUpdater(prev, u14BoysList));
    if (cohort === 'u14girls') setU14GirlsPlan(prev => planUpdater(prev, u14GirlsList));
    if (cohort === 'khokhoboys') setKhokhoBoysPlan(prev => planUpdater(prev, khokhoBoysList));
    if (cohort === 'khokhogirls') setKhokhoGirlsPlan(prev => planUpdater(prev, khokhoGirlsList));
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
        timeRange: selectedSession === 'Morning' ? '6:00 AM - 8:00 AM' : '5:00 PM - 7:00 PM',
        u17BoysPlan: u17BoysList,
        u17GirlsPlan: u17GirlsList,
        u14BoysPlan: u14BoysList,
        u14GirlsPlan: u14GirlsList,
        khokhoBoysPlan: khokhoBoysList,
        khokhoGirlsPlan: khokhoGirlsList,
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
    const timeText = selectedSession === 'Morning' ? 'Morning Session: 6:00 AM - 8:00 AM' : 'Evening Session: 5:00 PM - 7:00 PM';
    const coachName = "Sunil Deshmukh";

    const getGroundNo = (sport: string) => {
      if (sport === 'Kabaddi') return 'Ground No. 1';
      if (sport === 'Volleyball') return 'Ground No. 2';
      if (sport === 'Kho Kho') return 'Ground No. 3';
      return '';
    };

    const renderPrintPage = (title: string, planList: PlayerPlanEntry[], pageNum: number, totalPages: number) => {
      const details = planList.map((item, i) => ({ 
        index: i + 1, 
        player: getPlayerDetails(item.playerId), 
        game1: item.game1, 
        game2: item.game2 
      }));

      return `
        <div class="print-page-block" style="page-break-after: ${pageNum < totalPages ? 'always' : 'avoid'}; min-height: 275mm; box-sizing: border-box; display: flex; flex-direction: column; padding: 10px;">
          <div style="text-align: center; border-bottom: 3px double #235C36; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-size: 22px; font-weight: 900; color: #235C36; text-transform: uppercase; letter-spacing: 0.5px;">${schoolName}</div>
            <div style="font-size: 15px; font-weight: 800; text-transform: uppercase; margin-top: 3px; color: #333; letter-spacing: 1px;">DAILY PRACTICE PLAN - ${title}</div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 15px; background: #f9f9f9; padding: 8px 12px; border-radius: 6px; border: 1px solid #eee; text-transform: uppercase;">
            <div>DATE: <span style="color: #235C36; font-weight: 900;">${selectedDate}</span></div>
            <div>SESSION: <span style="color: #235C36; font-weight: 900;">${timeText}</span></div>
            <div>COACH: <span style="color: #235C36; font-weight: 900;">${coachName}</span></div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; flex: 1;">
            <thead>
              <tr style="background: #235C36; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 45px; font-weight: 900; text-transform: uppercase; font-size: 10px;">SLOT</th>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900; text-transform: uppercase; font-size: 10px;">PLAYER NAME</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 50px; font-weight: 900; text-transform: uppercase; font-size: 10px;">STD</th>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900; text-transform: uppercase; font-size: 10px;">GAME 1 PRACTICE</th>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900; text-transform: uppercase; font-size: 10px;">GAME 2 PRACTICE</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 75px; font-weight: 900; text-transform: uppercase; font-size: 10px;">ATTEND</th>
              </tr>
            </thead>
            <tbody>
              ${details.map(item => {
                const isGroupLeader = item.index <= 2;
                const pName = item.player ? item.player.name : '- VACANT -';
                const pNameText = isGroupLeader 
                  ? `${pName} <span style="font-size: 8px; color: #b45309; background: #fef3c7; padding: 2px 5px; border-radius: 4px; font-weight: 900; border: 1px solid #f59e0b; margin-left: 5px; letter-spacing: 0.5px;">GROUP LEADER</span>`
                  : pName;

                // Game 1 Details
                const g1 = item.game1;
                const g1Ground = getGroundNo(g1);
                const g1Drills = drills[g1] ? drills[g1].filter(d => d.trim() !== '').join(', ') : '';
                const g1Text = g1 !== 'None'
                  ? `<div style="font-weight: 900; text-transform: uppercase; color: #111;">${g1}</div>
                     <div style="font-size: 9px; color: #b45309; font-weight: bold; margin-top: 1px;">${g1Ground}</div>
                     ${g1Drills ? `<div style="font-size: 9px; color: #555; font-style: italic; margin-top: 1px; line-height: 1.2;">Drills: ${g1Drills}</div>` : ''}`
                  : `<span style="color: #bbb;">-</span>`;

                // Game 2 Details
                const g2 = item.game2;
                const g2Ground = getGroundNo(g2);
                const g2Drills = drills[g2] ? drills[g2].filter(d => d.trim() !== '').join(', ') : '';
                const g2Text = g2 !== 'None'
                  ? `<div style="font-weight: 900; text-transform: uppercase; color: #111;">${g2}</div>
                     <div style="font-size: 9px; color: #b45309; font-weight: bold; margin-top: 1px;">${g2Ground}</div>
                     ${g2Drills ? `<div style="font-size: 9px; color: #555; font-style: italic; margin-top: 1px; line-height: 1.2;">Drills: ${g2Drills}</div>` : ''}`
                  : `<span style="color: #bbb;">-</span>`;

                return `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold; background: #fafafa;">${item.index}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 10px; font-weight: 900; text-transform: uppercase; color: #000; font-size: 13px;">
                      ${pNameText}
                    </td>
                    <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold;">${item.player ? item.player.std : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 10px;">${g1Text}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 10px;">${g2Text}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-size: 18px; font-weight: bold; color: #111;">☐</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div style="font-size: 9px; color: #777; text-align: center; margin-top: auto; padding-top: 15px; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
            <span>Page ${pageNum} of ${totalPages}</span>
            <span>Ashram Shala Waghamba &bull; Physical Education Registry</span>
            <span>Printed on: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      `;
    };

    const pagesHtml = [
      renderPrintPage("Under 17 Boys Squad", u17BoysList, 1, 6),
      renderPrintPage("Under 17 Girls Squad", u17GirlsList, 2, 6),
      renderPrintPage("Under 14 Boys Squad", u14BoysList, 3, 6),
      renderPrintPage("Under 14 Girls Squad", u14GirlsList, 4, 6),
      renderPrintPage("Kho Kho Daily Boys Squad", khokhoBoysList, 5, 6),
      renderPrintPage("Kho Kho Daily Girls Squad", khokhoGirlsList, 6, 6)
    ].join('');

    const printContent = `
      <html>
        <head>
          <title>Practice Planner - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0 !important; }
              @page {
                size: A4 portrait;
                margin: 12mm 10mm 12mm 10mm;
              }
            }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 10px; color: #111; line-height: 1.3; }
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
    { id: 'drills', label: 'Focus Drills' }
  ] as const;

  const currentCohortInfo = useMemo(() => {
    if (activeTab === 'u17boys') return { gender: 'Male' as const, ageCat: 'U17' as const, list: u17BoysList, isKhokho: false };
    if (activeTab === 'u17girls') return { gender: 'Female' as const, ageCat: 'U17' as const, list: u17GirlsList, isKhokho: false };
    if (activeTab === 'u14boys') return { gender: 'Male' as const, ageCat: 'U14' as const, list: u14BoysList, isKhokho: false };
    if (activeTab === 'u14girls') return { gender: 'Female' as const, ageCat: 'U14' as const, list: u14GirlsList, isKhokho: false };
    if (activeTab === 'khokhoboys') return { gender: 'Male' as const, ageCat: undefined, list: khokhoBoysList, isKhokho: true };
    return { gender: 'Female' as const, ageCat: undefined, list: khokhoGirlsList, isKhokho: true };
  }, [activeTab, u17BoysList, u17GirlsList, u14BoysList, u14GirlsList, khokhoBoysList, khokhoGirlsList]);

  const poolOptions = useMemo(() => {
    if (activeTab === 'drills') return [];
    return getCohortPlayers(currentCohortInfo.gender, currentCohortInfo.ageCat, currentCohortInfo.isKhokho);
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
                <SelectItem value="Morning" className="font-bold">Morning (6 to 8 AM)</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['Kabaddi', 'Volleyball', 'Kho Kho'].map(sport => {
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
                        <Input 
                          value={sportDrills[0] || ''} 
                          onChange={(e) => handleDrillChange(sport, 0, e.target.value)} 
                          className="mt-1 font-bold rounded-lg border-2 h-10" 
                          placeholder="e.g. Toe touch drill"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Focus Drill 2</label>
                        <Input 
                          value={sportDrills[1] || ''} 
                          onChange={(e) => handleDrillChange(sport, 1, e.target.value)} 
                          className="mt-1 font-bold rounded-lg border-2 h-10" 
                          placeholder="e.g. Set practice drill"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-primary/10 text-left">
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-16 text-center">Slot</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase">Player Profile</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-16 text-center">Std</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-60">Game 1 Practice</th>
                    <th className="pb-3 text-[10px] font-black text-primary uppercase w-60">Game 2 Practice</th>
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
                                  <SelectItem value={entry.playerId} className="font-bold">
                                    {(player?.name || 'Vacant').toUpperCase()}
                                  </SelectItem>
                                  {poolOptions
                                    .filter((p: any) => p.id !== entry.playerId)
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
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4">
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
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
