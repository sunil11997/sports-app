"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAgeValidation } from '@/lib/utils';
import { 
  Users, 
  Printer, 
  Save, 
  X, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Check, 
  Search, 
  MapPin, 
  BookOpen, 
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': {
    skills: ["Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill", "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill", "Thigh hold drill", "Chain tackle drill", "Dash practice drill", "Corner defense drill"]
  },
  'Volleyball': {
    skills: ["Serve practice drill", "Underhand pass drill", "Overhand pass drill", "Set practice drill", "Spike approach drill", "Block timing drill", "Dig practice drill", "Court coverage drill", "Free ball pass drill", "Defense transition drill"]
  },
  'Handball': {
    skills: ["Dribble speed drill", "Chest pass drill", "Bounce pass drill", "Jump shot drill", "Wing shoot drill", "Fallback defense drill", "Goalie reflexes drill", "Fastbreak transition drill", "Pivot turn drill", "Penalty throw drill"]
  },
  'Kho Kho': {
    skills: ["Pole turn speed drill", "Chaser speed run", "Kho timing tap", "Dodging practice", "Single chain run", "Double chain run", "Dive attack drill", "Sudden turn drill", "Fake call tap", "Entry zone speed"]
  },
  'Running': {
    skills: ["Starting block drill", "Spike speed stride", "Arm swing drill", "Knee drive drill", "Baton exchange drill", "Pacing strategy run", "Finish line dip", "High intensity sprints", "Interval conditioning"]
  },
  'Shot Put': {
    skills: ["Glide technique drill", "Power position throw", "Spin rotation drill", "Release angle check", "Wrist snap practice", "Balance ring hold", "Med ball throw", "Core rotation lift"]
  },
  'Javelin Throw': {
    skills: ["Cross-over step drill", "Approach rhythm run", "Release pull power", "Javelin carry sprint", "Elbow high extension", "Block leg plant", "Flight angle check", "Target throw accuracy"]
  },
  'Disc Throw': {
    skills: ["Wind-up rotation drill", "Spin entry balance", "Power launch stance", "Release spin check", "Orbit trajectory check", "Footwork speed glide", "Core twisting power"]
  },
  'Long Jump': {
    skills: ["Approach speed run", "Board takeoff lift", "Flight hitch-kick", "Landing extension", "Takeoff foot plant", "Speed retention stride", "Hurdle takeoff drill"]
  },
  'High Jump': {
    skills: ["J-approach run speed", "Takeoff arch height", "Fosbury flop turn", "Landing roll safety", "Knee drive lift", "Bar clearance timing", "Vertical launch power"]
  }
};

export function AutoPracticePlanner({ store }: { store: any }) {
  const { toast } = useToast();

  const [selectedSport, setSelectedSport] = useState<string>("Kabaddi");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const todayDateString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isPastDate = selectedDate < todayDateString;

  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  
  const [u14BoysLineup, setU14BoysLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u17BoysLineup, setU17BoysLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u19BoysLineup, setU19BoysLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u14GirlsLineup, setU14GirlsLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u17GirlsLineup, setU17GirlsLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u19GirlsLineup, setU19GirlsLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [isSaving, setIsSaving] = useState(false);

  const schoolId = store.data.schoolProfile?.id || "default";
  const planKey = `${schoolId}_${selectedSport}_${selectedDate}`;
  const savedPlan = store.data.teamPlans?.[planKey];

  // Pad helper to fetch exactly 7 elements
  const padLineupTo7 = useCallback((arr?: (string | null)[]) => {
    const base = Array(7).fill(null);
    if (Array.isArray(arr)) {
      for (let i = 0; i < Math.min(arr.length, 7); i++) {
        base[i] = arr[i];
      }
    }
    return base;
  }, []);

  // Load plan from Firebase if exists
  useEffect(() => {
    if (savedPlan) {
      setSelectedDrills(savedPlan.drills || []);
      setU14BoysLineup(padLineupTo7(savedPlan.u14Players));
      setU17BoysLineup(padLineupTo7(savedPlan.u17Players));
      setU19BoysLineup(padLineupTo7(savedPlan.u19Players));
      setU14GirlsLineup(padLineupTo7(savedPlan.u14GirlsPlayers));
      setU17GirlsLineup(padLineupTo7(savedPlan.u17GirlsPlayers));
      setU19GirlsLineup(padLineupTo7(savedPlan.u19GirlsPlayers));
    } else {
      setSelectedDrills([]);
      setU14BoysLineup(Array(7).fill(null));
      setU17BoysLineup(Array(7).fill(null));
      setU19BoysLineup(Array(7).fill(null));
      setU14GirlsLineup(Array(7).fill(null));
      setU17GirlsLineup(Array(7).fill(null));
      setU19GirlsLineup(Array(7).fill(null));
    }
  }, [savedPlan, selectedSport, selectedDate, padLineupTo7]);

  const drillsList = useMemo(() => SPORTS_DATA[selectedSport]?.skills || [], [selectedSport]);

  const handleDrillToggle = (drill: string) => {
    if (isPastDate) return;
    setSelectedDrills(prev => 
      prev.includes(drill) ? prev.filter(d => d !== drill) : [...prev, drill]
    );
  };

  const getPlayerDetails = useCallback((id: string | null) => {
    if (!id) return null;
    return (store.data.players || []).find((p: any) => p.id === id) || null;
  }, [store.data.players]);

  // Find busy players scheduled in other games today
  const busyPlayersOnDate = useMemo(() => {
    const ids = new Set<string>();
    if (store.data.teamPlans) {
      Object.entries(store.data.teamPlans).forEach(([key, plan]: [string, any]) => {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const planSchoolId = parts[0];
          const planSport = parts[1];
          const planDate = parts.slice(2).join('_');
          
          if (planSchoolId === schoolId && planDate === selectedDate && planSport !== selectedSport) {
            if (Array.isArray(plan.u14Players)) plan.u14Players.forEach((id: any) => id && ids.add(id));
            if (Array.isArray(plan.u17Players)) plan.u17Players.forEach((id: any) => id && ids.add(id));
            if (Array.isArray(plan.u19Players)) plan.u19Players.forEach((id: any) => id && ids.add(id));
            if (Array.isArray(plan.u14GirlsPlayers)) plan.u14GirlsPlayers.forEach((id: any) => id && ids.add(id));
            if (Array.isArray(plan.u17GirlsPlayers)) plan.u17GirlsPlayers.forEach((id: any) => id && ids.add(id));
            if (Array.isArray(plan.u19GirlsPlayers)) plan.u19GirlsPlayers.forEach((id: any) => id && ids.add(id));
          }
        }
      });
    }
    return ids;
  }, [store.data.teamPlans, selectedDate, selectedSport, schoolId]);

  // Find players selected in the active lineups (to avoid double selection inside this plan)
  const busyPlayersInCurrentPlan = useMemo(() => {
    const ids = new Set<string>();
    u14BoysLineup.forEach(id => id && ids.add(id));
    u17BoysLineup.forEach(id => id && ids.add(id));
    u19BoysLineup.forEach(id => id && ids.add(id));
    u14GirlsLineup.forEach(id => id && ids.add(id));
    u17GirlsLineup.forEach(id => id && ids.add(id));
    u19GirlsLineup.forEach(id => id && ids.add(id));
    return ids;
  }, [u14BoysLineup, u17BoysLineup, u19BoysLineup, u14GirlsLineup, u17GirlsLineup, u19GirlsLineup]);

  // Determine eligible players for dropdown selection
  const getEligiblePlayers = useCallback((ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female', excludeExceptionId?: string | null) => {
    const athletes = (store.data.players || []).filter((p: any) => p.category === 'athlete');
    return athletes.filter((p: any) => {
      if (p.id === excludeExceptionId) return true;
      if (p.gender !== gender) return false;
      if (busyPlayersOnDate.has(p.id)) return false;
      if (busyPlayersInCurrentPlan.has(p.id)) return false;
      if (!Array.isArray(p.sports) || !p.sports.includes(selectedSport)) return false;

      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (!age || age <= 0 || isNaN(age)) return false;

      if (ageCat === 'U14' && age >= 14) return false;
      if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;
      if (ageCat === 'U19' && age < 17) return false;

      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players, busyPlayersOnDate, busyPlayersInCurrentPlan, selectedSport]);

  // Handle dropdown selection change
  const handlePlayerChange = (ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female', index: number, playerId: string) => {
    if (isPastDate) return;
    const value = playerId === 'vacant' ? null : playerId;
    const setter = gender === 'Male' 
      ? (ageCat === 'U14' ? setU14BoysLineup : ageCat === 'U17' ? setU17BoysLineup : setU19BoysLineup)
      : (ageCat === 'U14' ? setU14GirlsLineup : ageCat === 'U17' ? setU17GirlsLineup : setU19GirlsLineup);

    setter(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Run auto planner generator
  const handleAutoSchedule = () => {
    if (isPastDate) return;

    // A. Auto Select 3-4 drills
    if (drillsList.length > 0) {
      const shuffledDrills = [...drillsList].sort(() => 0.5 - Math.random());
      setSelectedDrills(shuffledDrills.slice(0, Math.min(4, drillsList.length)));
    } else {
      setSelectedDrills([]);
    }

    // B. Helper to auto-fill a lineup
    const fillLineup = (ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female') => {
      const lineup = Array(7).fill(null);
      // Grab all players who are registered for this sport & match criteria
      const athletes = (store.data.players || []).filter((p: any) => p.category === 'athlete');
      const pool = athletes.filter((p: any) => {
        if (p.gender !== gender) return false;
        if (busyPlayersOnDate.has(p.id)) return false; // Plays another game today
        if (!Array.isArray(p.sports) || !p.sports.includes(selectedSport)) return false;

        const ageVal = getAgeValidation(p.dob);
        const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
        if (!age || age <= 0 || isNaN(age)) return false;

        if (ageCat === 'U14' && age >= 14) return false;
        if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;
        if (ageCat === 'U19' && age < 17) return false;

        return true;
      });

      // Sort / Shuffle pool to randomize selection fairly
      const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      
      // Fill up to 7 players
      for (let i = 0; i < Math.min(7, shuffledPool.length); i++) {
        lineup[i] = shuffledPool[i].id;
        // Mark as busy temporarily so we don't double select
        busyPlayersInCurrentPlan.add(shuffledPool[i].id);
      }
      return lineup;
    };

    // Clear busy list for fresh run
    busyPlayersInCurrentPlan.clear();

    const u14B = fillLineup('U14', 'Male');
    const u17B = fillLineup('U17', 'Male');
    const u19B = fillLineup('U19', 'Male');
    const u14G = fillLineup('U14', 'Female');
    const u17G = fillLineup('U17', 'Female');
    const u19G = fillLineup('U19', 'Female');

    setU14BoysLineup(u14B);
    setU17BoysLineup(u17B);
    setU19BoysLineup(u19B);
    setU14GirlsLineup(u14G);
    setU17GirlsLineup(u17G);
    setU19GirlsLineup(u19G);

    toast({ title: "Auto-Filled Lineups", description: "Successfully auto-selected 7 eligible players per squad with focus drills." });
  };

  // Save Plan
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await store.setTeamPlan(selectedSport, selectedDate, {
        drills: selectedDrills,
        u14Players: u14BoysLineup,
        u17Players: u17BoysLineup,
        u19Players: u19BoysLineup,
        u14GirlsPlayers: u14GirlsLineup,
        u17GirlsPlayers: u17GirlsLineup,
        u19GirlsPlayers: u19GirlsLineup
      });
      toast({ title: "Auto Plan Saved", description: "Practice plan synced successfully." });
    } catch (e) {
      toast({ title: "Failed to Save", description: "Could not write plan to server.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Print with age-category page breaks, bold player names, and attendance checkboxes
  const handlePrint = () => {
    const schoolName = store.data.schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
    
    // Group lineups by age group
    const renderAgePageBlock = (title: string, boysIds: (string | null)[], girlsIds: (string | null)[]) => {
      const boysList = boysIds.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
      const girlsList = girlsIds.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));

      const renderTable = (squadTitle: string, list: { index: number; player: any }[]) => `
        <div style="flex: 1 1 48%; min-width: 320px; box-sizing: border-box;">
          <h3 style="background: #235C36; color: white; margin: 0; padding: 10px 12px; font-size: 15px; text-transform: uppercase; font-weight: 900; text-align: center; border-radius: 6px 6px 0 0;">
            ${squadTitle}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 40px; font-weight: 900;">SLOT</th>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900;">PLAYER NAME</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 55px; font-weight: 900;">STD</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 45px; font-weight: 900;">AGE</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 80px; font-weight: 900;">ATTEND</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold; background: #fafafa;">${item.index}</td>
                  <td style="border: 1px solid #ddd; padding: 8px 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; color: #000;">
                    ${item.player ? item.player.name : '<span style="color: #ccc; font-weight: normal;">- VACANT -</span>'}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold;">${item.player ? item.player.std : '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">${item.player ? (getAgeValidation(item.player.dob)?.ageYears || item.player.age || '-') : '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">
                    <span style="display: inline-block; width: 18px; height: 18px; border: 2px solid #333; border-radius: 4px; vertical-align: middle;"></span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      return `
        <div class="age-page-block" style="page-break-after: always; padding-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: 900; color: #235C36; border-left: 6px solid #235C36; padding-left: 10px; margin-bottom: 15px; text-transform: uppercase;">
            ${title} CATEGORY SQUADS
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; margin-bottom: 20px;">
            ${renderTable(`${title} Boys Squad`, boysList)}
            ${renderTable(`${title} Girls Squad`, girlsList)}
          </div>
        </div>
      `;
    };

    const printContent = `
      <html>
        <head>
          <title>${selectedSport} Auto Practice Planner - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0 !important; }
              @page {
                size: A4 portrait;
                margin: 15mm 10mm 15mm 10mm;
              }
              .age-page-block:last-child {
                page-break-after: avoid !important;
              }
            }
            body { font-family: 'Inter', sans-serif; padding: 15px; color: #111; line-height: 1.3; }
            .header-main { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-title { font-size: 24px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .subtitle { font-size: 18px; font-weight: 800; text-transform: uppercase; margin-top: 5px; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 25px; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; }
            .drills-section { background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; }
            .drills-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #235C36; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
            .drill-item { display: inline-block; background: #f0fdf4; border: 1px dashed #bbf7d0; color: #166534; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; margin: 4px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">PRINT PLANNER</button>
          </div>

          <div class="header-main">
            <div class="school-title">${schoolName}</div>
            <div class="subtitle">${selectedSport.toUpperCase()} PRACTICE PLANNER</div>
          </div>

          <div class="meta-grid">
            <div>DATE: <span>${selectedDate}</span></div>
            <div>DISCIPLINE: <span style="text-transform: uppercase; color: #235C36;">${selectedSport}</span></div>
          </div>

          <div class="drills-section">
            <div class="drills-title">Selected Focus Drills</div>
            <div class="drills-list">
              ${selectedDrills.length > 0 
                ? selectedDrills.map(d => `<span class="drill-item">${d}</span>`).join('') 
                : '<span style="color: #999; font-style: italic;">No drills selected for today\'s session.</span>'
              }
            </div>
          </div>

          ${renderAgePageBlock("Under 17", u17BoysLineup, u17GirlsLineup)}
          ${renderAgePageBlock("Under 14", u14BoysLineup, u14GirlsLineup)}
          ${renderAgePageBlock("Under 19", u19BoysLineup, u19GirlsLineup)}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const renderSlotSelector = (ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female', lineup: (string | null)[], index: number) => {
    const selectedPlayerId = lineup[index];
    const eligible = getEligiblePlayers(ageCat, gender, selectedPlayerId);
    const details = getPlayerDetails(selectedPlayerId);
    
    const displayAge = (p: any) => {
      const ageVal = getAgeValidation(p.dob);
      return ageVal ? `${ageVal.ageYears} yrs` : `${p.age || '?'} yrs`;
    };

    return (
      <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-primary/5 hover:border-primary/15 transition-all shadow-sm">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-xs text-primary shadow-inner">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <Select 
            value={selectedPlayerId || "vacant"} 
            onValueChange={(val) => handlePlayerChange(ageCat, gender, index, val)}
            disabled={isPastDate}
          >
            <SelectTrigger className="h-10 text-xs font-bold border-0 bg-transparent shadow-none px-0 hover:bg-primary/[0.02] rounded-lg transition-colors w-full focus:ring-0">
              <SelectValue placeholder="Select Player" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
              {eligible.map((p: any) => (
                <SelectItem key={p.id} value={p.id} className="font-bold">
                  {p.name.toUpperCase()} (Std {p.std} • {displayAge(p)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {details && (
          <Badge className="bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
            Std {details.std}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Header controls card */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Auto Planner</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Automated Squad Selecetion (7 Players)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="space-y-1 w-full sm:w-48">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Discipline</label>
            <Select value={selectedSport} onValueChange={(val) => setSelectedSport(val)}>
              <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
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
              <Sparkles className="w-4 h-4 text-white animate-spin" /> Auto Select
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Focus Drills Card */}
      <Card className="border-2 rounded-[3.5rem] overflow-hidden bg-white shadow-xl">
        <CardHeader className="bg-primary/5 border-b p-8">
          <CardTitle className="text-xl font-black uppercase text-primary tracking-tight">Focus Drills Selection</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Select skills to focus on during today&apos;s practice sessions</p>
        </CardHeader>
        <CardContent className="p-8">
          {drillsList.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {drillsList.map((drill) => {
                const isSelected = selectedDrills.includes(drill);
                return (
                  <button
                    key={drill}
                    disabled={isPastDate}
                    onClick={() => handleDrillToggle(drill)}
                    className={`flex items-center gap-3 px-5 py-3.5 border-2 rounded-2xl font-bold text-xs tracking-wide transition-all ${
                      isSelected 
                        ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                        : 'bg-white border-primary/5 text-muted-foreground hover:border-primary/10 hover:text-foreground'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <span className="text-[8px] font-black">✓</span>}
                    </div>
                    <span className="truncate">{drill}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground text-center py-6">No drills registered for this discipline.</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Squad grids */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-primary tracking-widest pl-2 border-l-4 border-primary">Boys Practice Squads</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { title: "Under 14 Boys (U14)", ageCat: 'U14' as const, gender: 'Male' as const, lineup: u14BoysLineup },
            { title: "Under 17 Boys (U17)", ageCat: 'U17' as const, gender: 'Male' as const, lineup: u17BoysLineup },
            { title: "Under 19 Boys (U19)", ageCat: 'U19' as const, gender: 'Male' as const, lineup: u19BoysLineup }
          ].map(cat => {
            const filledCount = cat.lineup.filter(id => id !== null).length;
            return (
              <Card key={cat.title} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[500px]">
                <div className="bg-primary/5 p-6 border-b flex justify-between items-center">
                  <div>
                    <span className="text-lg font-black uppercase text-primary block leading-none">{cat.title}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 block tracking-wider">Practice Squad</span>
                  </div>
                  <Badge className={`${filledCount === 7 ? 'bg-emerald-500' : 'bg-primary'} text-white font-black text-xs px-3.5 py-1 rounded-full`}>
                    {filledCount} / 7 SELECTED
                  </Badge>
                </div>
                <CardContent className="p-6 flex-1 space-y-4">
                  {Array(7).fill(null).map((_, i) => renderSlotSelector(cat.ageCat, cat.gender, cat.lineup, i))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-black uppercase text-accent tracking-widest pl-2 border-l-4 border-accent">Girls Practice Squads</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { title: "Under 14 Girls (U14)", ageCat: 'U14' as const, gender: 'Female' as const, lineup: u14GirlsLineup },
            { title: "Under 17 Girls (U17)", ageCat: 'U17' as const, gender: 'Female' as const, lineup: u17GirlsLineup },
            { title: "Under 19 Girls (U19)", ageCat: 'U19' as const, gender: 'Female' as const, lineup: u19GirlsLineup }
          ].map(cat => {
            const filledCount = cat.lineup.filter(id => id !== null).length;
            return (
              <Card key={cat.title} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[500px]">
                <div className="bg-accent/5 p-6 border-b flex justify-between items-center">
                  <div>
                    <span className="text-lg font-black uppercase text-accent block leading-none">{cat.title}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 block tracking-wider">Practice Squad</span>
                  </div>
                  <Badge className={`${filledCount === 7 ? 'bg-emerald-500' : 'bg-accent'} text-white font-black text-xs px-3.5 py-1 rounded-full`}>
                    {filledCount} / 7 SELECTED
                  </Badge>
                </div>
                <CardContent className="p-6 flex-1 space-y-4">
                  {Array(7).fill(null).map((_, i) => renderSlotSelector(cat.ageCat, cat.gender, cat.lineup, i))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. Action bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border-2 border-primary/10 shadow-2xl px-8 py-5 rounded-[2rem] flex items-center justify-center gap-4 z-40 w-[90%] max-w-xl animate-in slide-in-from-bottom-8 duration-500">
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          className="rounded-2xl border-2 font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-sm"
        >
          <Printer className="w-5 h-5 mr-2 text-primary" /> Print Plan
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isPastDate}
          className="rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-lg active-scale"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">Saving...</span>
          ) : isPastDate ? (
            <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Archived Session</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Save Plan</span>
          )}
        </Button>
      </div>
    </div>
  );
}
