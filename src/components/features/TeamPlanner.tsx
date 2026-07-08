"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Printer, 
  Save, 
  X, 
  CheckCircle2, 
  Plus, 
  Target, 
  Calendar,
  Sparkles,
  Search,
  BookOpen,
  Trash2
} from 'lucide-react';
import { getAgeValidation } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': {
    skills: [
      "Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill",
      "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill",
      "Thigh hold drill", "Chain tackle drill", "Dash practice drill", "Corner defense drill",
      "Reaction speed drill", "Agility ladder drill", "Shuttle run drill", "Shadow raiding drill"
    ]
  },
  'Volleyball': {
    skills: [
      "Target serving drill", "Partner passing drill", "Wall setting drill", 
      "Toss and spike drill", "Blocking jump drill", "Digging defense drill", 
      "Circle passing drill", "Serve receive drill", "3-touch drill", "Defense rotation"
    ]
  },
  'Kho Kho': {
    skills: [
      "Pole dive drill", "Zig-zag running drill", "Chase and tag drill", "Giving kho drill",
      "Direction change drill", "Reaction speed drill", "Sitting position drill", "Dodging practice drill",
      "Turning at pole", "Low sitting stance"
    ]
  },
  'Handball': {
    skills: [
      "Partner passing drill", "Wall passing drill", "Zig-zag dribbling drill", "Cone dribbling drill",
      "Target shooting drill", "Jump shot drill", "Bounce shot drill", "Goalkeeper reaction drill",
      "Defense shifting", "Fast break transition"
    ]
  },
  'Running': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "High-knee drive",
      "Baton exchange drill", "Stride length drill", "Explosive reaction drill", "Interval pacing",
      "Finish lean technique"
    ]
  },
  'Shot Put': {
    skills: [
      "Glide technique", "Grip and carry", "Initial stance", "Power position",
      "Extension and push", "Wrist flick", "Reverse recovery", "Balance maintenance",
      "Rotational delivery"
    ]
  },
  'Javelin Throw': {
    skills: [
      "Grip and carry", "Approach run", "Cross-over steps", "Withdrawal",
      "Power position", "Delivery strike", "Recovery step", "Tip control",
      "Arm speed drills"
    ]
  },
  'Disc Throw': {
    skills: [
      "Grip technique", "Initial stance", "Wind-up", "Turning rhythm",
      "Power position", "Release and flick", "Reverse/Recovery", "Spin control",
      "Centrifugal balance"
    ]
  },
  'Athletics': {
    skills: [
      "Sprint start drill", "Acceleration drill", "Shuttle run drill", "Relay baton exchange drill",
      "Long jump take-off drill", "Sand pit landing drill", "High jump approach drill", "Scissor jump drill",
      "Fosbury flop drills"
    ]
  }
};

const SPORTS_LIST = Object.keys(SPORTS_DATA);

export function TeamPlanner({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  
  const [selectedSport, setSelectedSport] = useState(preselectedSport || SPORTS_LIST[0]);
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

  const [historySearch, setHistorySearch] = useState('');
  const [historySportFilter, setHistorySportFilter] = useState('all');

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const schoolId = store.data.schoolProfile?.id || "default";
  const planKey = `${schoolId}_${selectedSport}_${selectedDate}`;
  const savedPlan = store.data.teamPlans?.[planKey];

  useEffect(() => {
    if (savedPlan) {
      setSelectedDrills(savedPlan.drills || []);
      setU14BoysLineup(savedPlan.u14Players || Array(7).fill(null));
      setU17BoysLineup(savedPlan.u17Players || Array(7).fill(null));
      setU19BoysLineup(savedPlan.u19Players || Array(7).fill(null));
      setU14GirlsLineup(savedPlan.u14GirlsPlayers || Array(7).fill(null));
      setU17GirlsLineup(savedPlan.u17GirlsPlayers || Array(7).fill(null));
      setU19GirlsLineup(savedPlan.u19GirlsPlayers || Array(7).fill(null));
    } else {
      setSelectedDrills([]);
      setU14BoysLineup(Array(7).fill(null));
      setU17BoysLineup(Array(7).fill(null));
      setU19BoysLineup(Array(7).fill(null));
      setU14GirlsLineup(Array(7).fill(null));
      setU17GirlsLineup(Array(7).fill(null));
      setU19GirlsLineup(Array(7).fill(null));
    }
  }, [savedPlan, selectedSport, selectedDate]);

  const drillsList = useMemo(() => SPORTS_DATA[selectedSport]?.skills || [], [selectedSport]);

  const handleDrillToggle = (drill: string) => {
    setSelectedDrills(prev => 
      prev.includes(drill) ? prev.filter(d => d !== drill) : [...prev, drill]
    );
  };

  const assignedPlayerIdsOnDate = useMemo(() => {
    const ids = new Set<string>();
    const schoolId = store.data.schoolProfile?.id || "default";
    
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
  }, [store.data.teamPlans, store.data.schoolProfile?.id, selectedDate, selectedSport]);

  const currentLineupPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    u14BoysLineup.forEach(id => id && ids.add(id));
    u17BoysLineup.forEach(id => id && ids.add(id));
    u19BoysLineup.forEach(id => id && ids.add(id));
    u14GirlsLineup.forEach(id => id && ids.add(id));
    u17GirlsLineup.forEach(id => id && ids.add(id));
    u19GirlsLineup.forEach(id => id && ids.add(id));
    return ids;
  }, [u14BoysLineup, u17BoysLineup, u19BoysLineup, u14GirlsLineup, u17GirlsLineup, u19GirlsLineup]);

  const getEligiblePlayers = useCallback((ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female', excludeExceptionId?: string | null) => {
    return (store.data.players || []).filter((p: any) => {
      if (p.category !== 'athlete') return false;
      if (!p.sports?.includes(selectedSport)) return false;

      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      
      if (!age || age <= 0 || isNaN(age)) return false;

      const playerGender = p.gender || 'Male';
      if (playerGender.toLowerCase() !== gender.toLowerCase()) return false;

      if (ageCat === 'U14' && age >= 14) return false;
      if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;
      if (ageCat === 'U19' && age < 17) return false;

      if (assignedPlayerIdsOnDate.has(p.id)) return false;
      if (currentLineupPlayerIds.has(p.id) && p.id !== excludeExceptionId) return false;

      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players, selectedSport, assignedPlayerIdsOnDate, currentLineupPlayerIds]);

  const getPlayerDetails = useCallback((playerId: string | null) => {
    if (!playerId) return null;
    return (store.data.players || []).find((p: any) => p.id === playerId);
  }, [store.data.players]);

  const handlePlayerChange = (ageCat: 'U14' | 'U17' | 'U19', gender: 'Male' | 'Female', index: number, playerId: string) => {
    let updater;
    if (gender === 'Male') {
      updater = ageCat === 'U14' ? setU14BoysLineup 
              : ageCat === 'U17' ? setU17BoysLineup 
              : setU19BoysLineup;
    } else {
      updater = ageCat === 'U14' ? setU14GirlsLineup 
              : ageCat === 'U17' ? setU17GirlsLineup 
              : setU19GirlsLineup;
    }
    
    updater(prev => {
      const next = [...prev];
      next[index] = playerId === "clear" ? null : playerId;
      return next;
    });
  };

  const handleRemoveHistoryPlayer = async (record: { date: string; sport: string; player: any; category: string }) => {
    if (!store.setTeamPlan) {
      toast({ title: "Action Restricted", description: "Storage system initialization pending.", variant: "destructive" });
      return;
    }

    const schoolId = store.data.schoolProfile?.id || "default";
    const targetPlanKey = `${schoolId}_${record.sport}_${record.date}`;
    const plan = store.data.teamPlans?.[targetPlanKey];

    if (!plan) {
      toast({ title: "Error", description: "Could not find the associated practice plan.", variant: "destructive" });
      return;
    }

    let lineupField: string;
    if (record.category === 'U14 Boys') lineupField = 'u14Players';
    else if (record.category === 'U17 Boys') lineupField = 'u17Players';
    else if (record.category === 'U19 Boys') lineupField = 'u19Players';
    else if (record.category === 'U14 Girls') lineupField = 'u14GirlsPlayers';
    else if (record.category === 'U17 Girls') lineupField = 'u17GirlsPlayers';
    else if (record.category === 'U19 Girls') lineupField = 'u19GirlsPlayers';
    else return;

    const currentLineup = plan[lineupField];
    if (!Array.isArray(currentLineup)) return;

    const updatedLineup = currentLineup.map((id: string | null) => id === record.player.id ? null : id);

    try {
      await store.setTeamPlan(record.sport, record.date, {
        ...plan,
        [lineupField]: updatedLineup
      });

      if (record.sport === selectedSport && record.date === selectedDate) {
        if (lineupField === 'u14Players') setU14BoysLineup(updatedLineup);
        else if (lineupField === 'u17Players') setU17BoysLineup(updatedLineup);
        else if (lineupField === 'u19Players') setU19BoysLineup(updatedLineup);
        else if (lineupField === 'u14GirlsPlayers') setU14GirlsLineup(updatedLineup);
        else if (lineupField === 'u17GirlsPlayers') setU17GirlsLineup(updatedLineup);
        else if (lineupField === 'u19GirlsPlayers') setU19GirlsLineup(updatedLineup);
      }

      toast({ 
        title: "Player Removed", 
        description: `Removed ${record.player.name} from ${record.sport} (${record.category}) on ${record.date}.` 
      });
    } catch (e) {
      toast({ title: "Failed to Remove", description: "Could not update the database.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!store.setTeamPlan) {
      toast({ title: "Save Restricted", description: "Storage system initialization pending.", variant: "destructive" });
      return;
    }

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
      toast({ title: "Plan Saved", description: "Daily practice schedule synced successfully." });
    } catch (e) {
      toast({ title: "Failed to Save", description: "Could not write plan to server.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const schoolName = store.data.schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
    const u14BDetails = u14BoysLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u17BDetails = u17BoysLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u19BDetails = u19BoysLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u14GDetails = u14GirlsLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u17GDetails = u17GirlsLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u19GDetails = u19GirlsLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));

    const hasU14B = u14BoysLineup.some(id => id !== null);
    const hasU17B = u17BoysLineup.some(id => id !== null);
    const hasU19B = u19BoysLineup.some(id => id !== null);
    const hasU14G = u14GirlsLineup.some(id => id !== null);
    const hasU17G = u17GirlsLineup.some(id => id !== null);
    const hasU19G = u19GirlsLineup.some(id => id !== null);

    const countB = [hasU14B, hasU17B, hasU19B].filter(Boolean).length;
    const countG = [hasU14G, hasU17G, hasU19G].filter(Boolean).length;

    const getTableWidth = (count: number) => {
      if (count === 3) return '31%';
      if (count === 2) return '48%';
      return '100%';
    };

    const bWidth = getTableWidth(countB);
    const gWidth = getTableWidth(countG);

    const renderTable = (title: string, list: { index: number; player: any }[], width: string) => `
      <div style="flex: 1 1 ${width}; margin: 8px; box-sizing: border-box; max-width: ${width}; page-break-inside: avoid;">
        <h3 style="background: #235C36; color: white; margin: 0; padding: 10px 12px; font-size: 15px; text-transform: uppercase; font-weight: 900; text-align: center; border-radius: 6px 6px 0 0;">
          ${title}
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 40px; font-weight: 900;">SLOT</th>
              <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900;">PLAYER NAME</th>
              <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 55px; font-weight: 900;">STD</th>
              <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 40px; font-weight: 900;">AGE</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold; background: #fafafa;">${item.index}</td>
                <td style="border: 1px solid #ddd; padding: 8px 10px; font-weight: bold; text-transform: uppercase;">
                  ${item.player ? item.player.name : '<span style="color: #ccc;">- VACANT -</span>'}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">${item.player ? item.player.std : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">${item.player ? (getAgeValidation(item.player.dob)?.ageYears || item.player.age || '-') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    let boysSection = '';
    if (hasU14B || hasU17B || hasU19B) {
      boysSection = `
        <div class="section-heading">BOYS SQUADS</div>
        <div class="tables-container" style="display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 4px; margin-bottom: 15px;">
          ${hasU14B ? renderTable("Under 14 Boys (U14B)", u14BDetails, bWidth) : ''}
          ${hasU17B ? renderTable("Under 17 Boys (U17B)", u17BDetails, bWidth) : ''}
          ${hasU19B ? renderTable("Under 19 Boys (U19B)", u19BDetails, bWidth) : ''}
        </div>
      `;
    }

    let girlsSection = '';
    if (hasU14G || hasU17G || hasU19G) {
      girlsSection = `
        <div class="section-heading" style="margin-top: 15px;">GIRLS SQUADS</div>
        <div class="tables-container" style="display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 4px; margin-bottom: 15px;">
          ${hasU14G ? renderTable("Under 14 Girls (U14G)", u14GDetails, gWidth) : ''}
          ${hasU17G ? renderTable("Under 17 Girls (U17G)", u17GDetails, gWidth) : ''}
          ${hasU19G ? renderTable("Under 19 Girls (U19G)", u19GDetails, gWidth) : ''}
        </div>
      `;
    }

    const hasAnyPlayers = hasU14B || hasU17B || hasU19B || hasU14G || hasU17G || hasU19G;
    const squadsContent = hasAnyPlayers
      ? `${boysSection} ${girlsSection}`
      : `<div style="text-align: center; padding: 50px; font-weight: bold; color: #999; text-transform: uppercase; border: 2px dashed #ddd; border-radius: 8px;">No players selected in any squad for this session.</div>`;

    const printContent = `
      <html>
        <head>
          <title>Daily Team Planner - ${selectedSport} - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { padding-top: 0 !important; margin: 0 !important; }
              @page {
                size: A4 portrait;
                margin: 15mm 10mm 15mm 10mm;
              }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; line-height: 1.4; }
            .header { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 12px; margin-bottom: 20px; }
            .school-title { font-size: 26px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .subtitle { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-top: 6px; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; margin-bottom: 20px; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; }
            .drills-section { background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
            .drills-title { font-size: 15px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #235C36; padding-bottom: 4px; margin-bottom: 10px; color: #235C36; }
            .drills-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .drill-item { background: white; border: 1px solid #ccc; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; }
            .tables-container { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 10px; margin-bottom: 30px; }
            .section-heading { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #235C36; border-left: 4px solid #235C36; padding-left: 8px; margin-bottom: 15px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">PRINT PLAN SHEET</button>
          </div>

          <div class="header">
            <div class="school-title">${schoolName}</div>
            <div class="subtitle">DAILY PRACTICE TEAM PLANNER</div>
          </div>

          <div class="meta-grid">
            <div>DISCIPLINE: <span style="color: #235C36;">${selectedSport.toUpperCase()}</span></div>
            <div>DATE: <span>${selectedDate}</span></div>
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

          ${squadsContent}
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
          {details && (
            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none truncate -mt-1 pl-1">
              Std {details.std} &bull; {displayAge(details)}
            </p>
          )}
        </div>
        {selectedPlayerId && !isPastDate && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handlePlayerChange(ageCat, gender, index, "clear")}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
          >
            <X className="w-4.5 h-4.5" />
          </Button>
        )}
      </div>
    );
  };

  const practiceHistory = useMemo(() => {
    const historyList: {
      date: string;
      sport: string;
      player: any;
      category: string;
      drills: string[];
    }[] = [];
    
    const schoolId = store.data.schoolProfile?.id || "default";
    
    if (store.data.teamPlans && store.data.players) {
      Object.entries(store.data.teamPlans).forEach(([key, plan]: [string, any]) => {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const planSchoolId = parts[0];
          const planSport = parts[1];
          const planDate = parts.slice(2).join('_');
          
          if (planSchoolId === schoolId) {
            const drills = plan.drills || [];
            
            const addPlayers = (playerIds: any[], catName: string) => {
              if (Array.isArray(playerIds)) {
                playerIds.forEach(id => {
                  if (id) {
                    const playerObj = store.data.players.find((p: any) => p.id === id);
                    if (playerObj) {
                      historyList.push({
                        date: planDate,
                        sport: planSport,
                        player: playerObj,
                        category: catName,
                        drills
                      });
                    }
                  }
                });
              }
            };
            
            addPlayers(plan.u14Players, 'U14 Boys');
            addPlayers(plan.u17Players, 'U17 Boys');
            addPlayers(plan.u19Players, 'U19 Boys');
            addPlayers(plan.u14GirlsPlayers, 'U14 Girls');
            addPlayers(plan.u17GirlsPlayers, 'U17 Girls');
            addPlayers(plan.u19GirlsPlayers, 'U19 Girls');
          }
        }
      });
    }
    
    return historyList.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const sportCompare = a.sport.localeCompare(b.sport);
      if (sportCompare !== 0) return sportCompare;
      return a.player.name.localeCompare(b.player.name);
    });
  }, [store.data.teamPlans, store.data.players, store.data.schoolProfile?.id]);

  const filteredHistory = useMemo(() => {
    return practiceHistory.filter(record => {
      const matchesSearch = record.player.name.toLowerCase().includes(historySearch.toLowerCase());
      const matchesSport = historySportFilter === 'all' || record.sport === historySportFilter;
      return matchesSearch && matchesSport;
    });
  }, [practiceHistory, historySearch, historySportFilter]);

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Practice Planner</h2>
              {isPastDate && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border-none">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Daily squad selection & drills</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {!preselectedSport && (
            <div className="space-y-1 sm:w-48">
              <label className="text-[9px] font-black text-primary uppercase ml-2">Discipline</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1 sm:w-48">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Session Date</label>
            <div className="relative">
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm pr-10"
              />
              <Calendar className="w-4 h-4 absolute right-3.5 top-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-md">
        <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center gap-3">
          <Target className="w-6 h-6 text-primary animate-pulse" />
          <div>
            <CardTitle className="text-lg font-black text-primary uppercase tracking-tight">Practice Focus Drills</CardTitle>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Select drills to target during today&apos;s session</p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {drillsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {drillsList.map(drill => {
                const isSelected = selectedDrills.includes(drill);
                return (
                  <button
                    key={drill}
                    disabled={isPastDate}
                    onClick={() => !isPastDate && handleDrillToggle(drill)}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-left border-2 font-bold text-xs transition-all ${
                      isPastDate ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                    } ${
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
            <p className="text-sm font-semibold text-muted-foreground text-center py-6">No specific drills registered for this discipline.</p>
          )}
        </CardContent>
      </Card>

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

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-md">
        <CardHeader className="bg-muted/30 border-b p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-lg font-black text-primary uppercase tracking-tight">Practice History Log</CardTitle>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Audit log of all registered student practices</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search athlete name..." 
                value={historySearch} 
                onChange={(e) => setHistorySearch(e.target.value)} 
                className="pl-9 h-10 border-2 rounded-xl font-bold text-xs"
              />
            </div>
            <Select value={historySportFilter} onValueChange={setHistorySportFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44 font-bold border-2 rounded-xl shadow-sm text-xs bg-white"><SelectValue placeholder="All Sports" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">All Sports</SelectItem>
                {SPORTS_LIST.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-muted/10 border-b border-primary/5">
                  <th className="p-4 pl-8 text-[10px] font-black uppercase text-muted-foreground">Date</th>
                  <th className="p-4 text-[10px] font-black uppercase text-muted-foreground">Discipline</th>
                  <th className="p-4 text-[10px] font-black uppercase text-muted-foreground">Athlete Name</th>
                  <th className="p-4 text-[10px] font-black uppercase text-muted-foreground text-center">Squad</th>
                  <th className="p-4 text-[10px] font-black uppercase text-muted-foreground">Focus Drills</th>
                  <th className="p-4 pr-8 text-[10px] font-black uppercase text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs font-black uppercase text-muted-foreground opacity-55">
                      No practice records found.
                    </td>
                  </tr>
                ) : filteredHistory.slice(0, 50).map((record, i) => {
                  const isGirlsCategory = record.category.includes('Girls');
                  return (
                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors h-14">
                      <td className="p-4 pl-8 text-xs font-bold text-primary">{record.date}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="font-black text-[9px] uppercase bg-accent/5 text-accent border border-accent/10">
                          {record.sport}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase">{record.player.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Std {record.player.std}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className={`font-black text-[9px] uppercase ${
                          isGirlsCategory ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-primary/5 text-primary'
                        }`}>
                          {record.category}
                        </Badge>
                      </td>
                      <td className="p-4 max-w-xs md:max-w-md">
                        <div className="flex flex-wrap gap-1">
                          {record.drills.length > 0 ? (
                            record.drills.map((drill, idx) => (
                              <Badge key={idx} variant="outline" className="text-[8px] font-black uppercase tracking-wide border-primary/5 bg-primary/[0.02]">
                                {drill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[9px] font-semibold text-muted-foreground/60 italic">No drills selected</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-xl hover:text-destructive hover:bg-destructive/5 text-muted-foreground border"
                          onClick={() => handleRemoveHistoryPlayer(record)}
                          title={`Remove ${record.player.name} from practice`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredHistory.length > 50 && (
            <div className="p-4 text-center border-t bg-muted/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Showing latest 50 records of {filteredHistory.length} total
            </div>
          )}
        </CardContent>
      </Card>

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
