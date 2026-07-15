"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
  Clock,
  Zap
} from 'lucide-react';

const TEAM_SPORTS = ['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho'];
const OTHER_SPORTS = ['Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Kabaddi': { skills: ["Cant practice drill", "Toe touch drill", "Hand touch drill", "Dubki practice drill", "Bonus line drill", "Running raid drill", "Escape practice drill", "Ankle hold drill", "Thigh hold drill", "Chain tackle drill"] },
  'Volleyball': { skills: ["Serve practice drill", "Underhand pass drill", "Overhand pass drill", "Set practice drill", "Spike approach drill", "Block timing drill", "Dig practice drill", "Court coverage drill"] },
  'Handball': { skills: ["Dribble speed drill", "Chest pass drill", "Bounce pass drill", "Jump shot drill", "Wing shoot drill", "Fallback defense drill", "Goalie reflexes drill", "Fastbreak transition drill"] },
  'Kho Kho': { skills: ["Pole turn speed drill", "Chaser speed run", "Kho timing tap", "Dodging practice", "Single chain run", "Double chain run", "Dive attack drill", "Sudden turn drill"] },
  'Running': { skills: ["Starting block drill", "Spike speed stride", "Arm swing drill", "Knee drive drill", "Baton exchange drill", "Pacing strategy run"] },
  'Shot Put': { skills: ["Glide technique drill", "Power position throw", "Spin rotation drill", "Release angle check", "Wrist snap practice", "Balance ring hold"] },
  'Javelin Throw': { skills: ["Cross-over step drill", "Approach rhythm run", "Release pull power", "Javelin carry sprint", "Elbow high extension", "Block leg plant"] },
  'Disc Throw': { skills: ["Wind-up rotation drill", "Spin entry balance", "Power launch stance", "Release spin check", "Orbit trajectory check"] },
  'Long Jump': { skills: ["Approach speed run", "Board takeoff lift", "Flight hitch-kick", "Landing extension", "Takeoff foot plant"] },
  'High Jump': { skills: ["J-approach run speed", "Takeoff arch height", "Fosbury flop turn", "Landing roll safety", "Knee drive lift"] }
};

interface SquadData {
  u14Boys: (string | null)[];
  u17Boys: (string | null)[];
  u14Girls: (string | null)[];
  u17Girls: (string | null)[];
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

  const todayDateString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isPastDate = selectedDate < todayDateString;

  // Master auto plans state
  const [teamPlans, setTeamPlans] = useState<Record<string, SquadData>>({});
  const [otherPlans, setOtherPlans] = useState<Record<string, (string | null)[]>>({});
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
        setTeamPlans(d.teamPlans || {});
        setOtherPlans(d.otherPlans || {});
        setDrills(d.drills || {});
      } else {
        // Clear state
        setTeamPlans({});
        setOtherPlans({});
        setDrills({});
      }
    });
    return () => unsub();
  }, [store.isLoaded, scheduleKey, db]);

  // List of eligible athletes matching selected age group (U14 & U17)
  const eligibleAthletes = useMemo(() => {
    const athletes = (store.data.players || []).filter((p: any) => p.category === 'athlete');
    return athletes.filter((p: any) => {
      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (!age || age <= 0 || isNaN(age)) return false;
      return age < 19; // Limit to U14 & U17
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players]);

  const getPlayerDetails = useCallback((id: string | null) => {
    if (!id) return null;
    return (store.data.players || []).find((p: any) => p.id === id) || null;
  }, [store.data.players]);

  // Check which players are already assigned in any selector today (to prevent duplicates)
  const getAssignedPlayersSet = useCallback((currentTeamPlans: Record<string, SquadData>, currentOtherPlans: Record<string, (string | null)[]>) => {
    const ids = new Set<string>();
    Object.values(currentTeamPlans).forEach((squads: SquadData) => {
      squads.u14Boys.forEach(id => id && ids.add(id));
      squads.u17Boys.forEach(id => id && ids.add(id));
      squads.u14Girls.forEach(id => id && ids.add(id));
      squads.u17Girls.forEach(id => id && ids.add(id));
    });
    Object.values(currentOtherPlans).forEach((lineup: (string | null)[]) => {
      lineup.forEach(id => id && ids.add(id));
    });
    return ids;
  }, []);

  // Filter athletes for manually changing players in dropdowns
  const getDropdownEligible = useCallback((ageCat: 'U14' | 'U17', gender: 'Male' | 'Female', sport: string, currentId?: string | null) => {
    const currentAssigned = getAssignedPlayersSet(teamPlans, otherPlans);
    return eligibleAthletes.filter((p: any) => {
      if (p.id === currentId) return true;
      if (p.gender !== gender) return false;
      if (currentAssigned.has(p.id)) return false;
      if (!Array.isArray(p.sports) || !p.sports.includes(sport)) return false;

      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (ageCat === 'U14' && age >= 14) return false;
      if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;

      return true;
    });
  }, [eligibleAthletes, teamPlans, otherPlans, getAssignedPlayersSet]);

  const getDropdownEligibleOther = useCallback((sport: string, currentId?: string | null) => {
    const currentAssigned = getAssignedPlayersSet(teamPlans, otherPlans);
    return eligibleAthletes.filter((p: any) => {
      if (p.id === currentId) return true;
      if (currentAssigned.has(p.id)) return false;
      if (!Array.isArray(p.sports) || !p.sports.includes(sport)) return false;
      return true;
    });
  }, [eligibleAthletes, teamPlans, otherPlans, getAssignedPlayersSet]);

  // Main Solver: Auto Schedules ALL games without duplicate player assignments
  const handleAutoSchedule = () => {
    if (isPastDate) return;

    const assignedSet = new Set<string>();
    const nextTeamPlans: Record<string, SquadData> = {};
    const nextOtherPlans: Record<string, (string | null)[]> = {};
    const nextDrills: Record<string, string[]> = {};

    // 1. Helper to select 7 players for a squad category
    const fillSquad = (sport: string, ageCat: 'U14' | 'U17', gender: 'Male' | 'Female') => {
      const lineup = Array(7).fill(null);
      const pool = eligibleAthletes.filter((p: any) => {
        if (p.gender !== gender) return false;
        if (assignedSet.has(p.id)) return false; // Already practicing a game today
        if (!Array.isArray(p.sports) || !p.sports.includes(sport)) return false;

        const ageVal = getAgeValidation(p.dob);
        const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
        if (ageCat === 'U14' && age >= 14) return false;
        if (ageCat === 'U17' && (age < 14 || age >= 17)) return false;

        return true;
      });

      // Randomize selection
      const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(7, shuffledPool.length); i++) {
        lineup[i] = shuffledPool[i].id;
        assignedSet.add(shuffledPool[i].id); // Lock player for the day
      }
      return lineup;
    };

    // 2. Schedule Team Sports first
    TEAM_SPORTS.forEach(sport => {
      nextTeamPlans[sport] = {
        u14Boys: fillSquad(sport, 'U14', 'Male'),
        u17Boys: fillSquad(sport, 'U17', 'Male'),
        u14Girls: fillSquad(sport, 'U14', 'Female'),
        u17Girls: fillSquad(sport, 'U17', 'Female')
      };

      // Auto pick drills
      const list = SPORTS_DATA[sport]?.skills || [];
      nextDrills[sport] = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
    });

    // 3. Schedule Athletics / Other Sports next
    OTHER_SPORTS.forEach(sport => {
      const lineup = Array(7).fill(null);
      const pool = eligibleAthletes.filter((p: any) => {
        if (assignedSet.has(p.id)) return false;
        if (!Array.isArray(p.sports) || !p.sports.includes(sport)) return false;
        return true;
      });

      const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(7, shuffledPool.length); i++) {
        lineup[i] = shuffledPool[i].id;
        assignedSet.add(shuffledPool[i].id);
      }
      nextOtherPlans[sport] = lineup;

      // Auto pick drills
      const list = SPORTS_DATA[sport]?.skills || [];
      nextDrills[sport] = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
    });

    setTeamPlans(nextTeamPlans);
    setOtherPlans(nextOtherPlans);
    setDrills(nextDrills);

    toast({ title: "Master Planner Generated", description: "All sports auto-scheduled successfully with zero student conflicts." });
  };

  // Change player manually in Team Sports
  const handleTeamPlayerChange = (sport: string, ageCat: 'u14Boys' | 'u17Boys' | 'u14Girls' | 'u17Girls', index: number, value: string) => {
    if (isPastDate) return;
    const playerId = value === 'vacant' ? null : value;
    setTeamPlans(prev => {
      const next = { ...prev };
      if (!next[sport]) return prev;
      const squad = { ...next[sport] };
      const arr = [...squad[ageCat]];
      arr[index] = playerId;
      squad[ageCat] = arr;
      next[sport] = squad;
      return next;
    });
  };

  // Change player manually in Other Sports
  const handleOtherPlayerChange = (sport: string, index: number, value: string) => {
    if (isPastDate) return;
    const playerId = value === 'vacant' ? null : value;
    setOtherPlans(prev => {
      const next = { ...prev };
      if (!next[sport]) return prev;
      const arr = [...next[sport]];
      arr[index] = playerId;
      next[sport] = arr;
      return next;
    });
  };

  // Save Master Plan to Firestore
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
        teamPlans,
        otherPlans,
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

  // Print A4 sheets with page breaks, bold names, and attendance checkboxes
  const handlePrint = () => {
    const schoolName = store.data.schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
    const timeText = selectedSession === 'Morning' ? 'Morning Session: 6:00 AM - 8:00 AM' : 'Evening Session: 5:00 PM - 7:00 PM';

    const renderPrintTable = (title: string, list: (string | null)[]) => {
      const details = list.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
      return `
        <div style="flex: 1 1 48%; min-width: 320px; box-sizing: border-box; margin-bottom: 15px; page-break-inside: avoid;">
          <h3 style="background: #235C36; color: white; margin: 0; padding: 10px 12px; font-size: 14px; text-transform: uppercase; font-weight: 900; text-align: center; border-radius: 6px 6px 0 0;">
            ${title}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 40px; font-weight: 900;">SLOT</th>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-weight: 900;">PLAYER NAME</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 55px; font-weight: 900;">STD</th>
                <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; width: 85px; font-weight: 900;">ATTEND</th>
              </tr>
            </thead>
            <tbody>
              ${details.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold; background: #fafafa;">${item.index}</td>
                  <td style="border: 1px solid #ddd; padding: 8px 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; color: #000;">
                    ${item.player ? item.player.name : '<span style="color: #ccc; font-weight: normal;">- VACANT -</span>'}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold;">${item.player ? item.player.std : '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-size: 18px; font-weight: bold; color: #111;">☐</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    // Construct Page 1: Under-17 Boys and Girls Team Sports
    let p1Content = `
      <div class="print-page-block" style="page-break-after: always;">
        <h2 style="font-size: 18px; font-weight: 900; color: #235C36; border-left: 6px solid #235C36; padding-left: 10px; margin-bottom: 15px; text-transform: uppercase;">
          PAGE 1: UNDER 17 TEAM PRACTICE SQUADS
        </h2>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${TEAM_SPORTS.map(sport => {
            const data = teamPlans[sport];
            if (!data) return '';
            return `
              <div style="page-break-inside: avoid;">
                <h4 style="margin: 0 0 10px 0; text-transform: uppercase; color: #111; font-size: 14px; font-weight: 900;">DISCIPLINE: ${sport} - Focus: ${(drills[sport] || []).join(', ')}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between;">
                  ${renderPrintTable(`${sport} U17 Boys`, data.u17Boys)}
                  ${renderPrintTable(`${sport} U17 Girls`, data.u17Girls)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Construct Page 2: Under-14 Boys and Girls Team Sports
    let p2Content = `
      <div class="print-page-block" style="page-break-after: always;">
        <h2 style="font-size: 18px; font-weight: 900; color: #235C36; border-left: 6px solid #235C36; padding-left: 10px; margin-bottom: 15px; text-transform: uppercase;">
          PAGE 2: UNDER 14 TEAM PRACTICE SQUADS
        </h2>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${TEAM_SPORTS.map(sport => {
            const data = teamPlans[sport];
            if (!data) return '';
            return `
              <div style="page-break-inside: avoid;">
                <h4 style="margin: 0 0 10px 0; text-transform: uppercase; color: #111; font-size: 14px; font-weight: 900;">DISCIPLINE: ${sport} - Focus: ${(drills[sport] || []).join(', ')}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between;">
                  ${renderPrintTable(`${sport} U14 Boys`, data.u14Boys)}
                  ${renderPrintTable(`${sport} U14 Girls`, data.u14Girls)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Construct Page 3: Athletics & Other Games
    let p3Content = `
      <div class="print-page-block">
        <h2 style="font-size: 18px; font-weight: 900; color: #235C36; border-left: 6px solid #235C36; padding-left: 10px; margin-bottom: 15px; text-transform: uppercase;">
          PAGE 3: ATHLETICS & OTHER PRACTICE SQUADS
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between;">
          ${OTHER_SPORTS.map(sport => {
            const list = otherPlans[sport];
            if (!list) return '';
            return `
              <div style="flex: 1 1 48%; min-width: 320px; box-sizing: border-box; page-break-inside: avoid;">
                <h4 style="margin: 0 0 5px 0; text-transform: uppercase; color: #111; font-size: 13px; font-weight: 900;">DISCIPLINE: ${sport}</h4>
                <p style="margin: 0 0 10px 0; font-size: 11px; font-style: italic; color: #555;">Drills: ${(drills[sport] || []).join(', ')}</p>
                ${renderPrintTable(`${sport} Squad`, list)}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const printContent = `
      <html>
        <head>
          <title>Master Auto Practice Planner - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0 !important; }
              @page {
                size: A4 portrait;
                margin: 15mm 10mm 15mm 10mm;
              }
            }
            body { font-family: 'Inter', sans-serif; padding: 15px; color: #111; line-height: 1.3; }
            .header-main { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-title { font-size: 24px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .subtitle { font-size: 18px; font-weight: 800; text-transform: uppercase; margin-top: 5px; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 25px; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; }
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
            <div class="subtitle">MASTER AUTO PRACTICE PLANNER</div>
          </div>

          <div class="meta-grid">
            <div>DATE: <span>${selectedDate}</span></div>
            <div>SESSION: <span style="text-transform: uppercase; color: #235C36;">${timeText}</span></div>
          </div>

          ${p1Content}
          ${p2Content}
          ${p3Content}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header controls card */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Master Auto Planner</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Automated Practice Planner (7 Slots)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
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

      {/* Main planner display grids */}
      {Object.keys(teamPlans).length === 0 ? (
        <Card className="border-2 rounded-[2.5rem] bg-white border-dashed p-12 text-center shadow-inner flex flex-col items-center justify-center min-h-[300px]">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-4 animate-bounce" />
          <p className="font-black text-primary uppercase text-sm tracking-widest">No Active Daily Planner</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest max-w-xs mx-auto">Click &apos;Auto Plan Day&apos; to schedule all team sports and athletics for the day.</p>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Team Sports */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2 pl-2 border-l-4 border-primary">
              Team Sports Lineups
            </h3>
            {TEAM_SPORTS.map(sport => {
              const data = teamPlans[sport];
              if (!data) return null;
              return (
                <div key={sport} className="space-y-4 bg-muted/20 p-6 rounded-[2.5rem] border-2 border-primary/5">
                  <div className="flex justify-between items-center px-4 border-b border-primary/5 pb-2">
                    <h4 className="text-lg font-black uppercase text-primary">{sport} Practice Plan</h4>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Focus Drills: {(drills[sport] || []).join(', ')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* U17 Boys */}
                    <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-md">
                      <div className="bg-primary/5 p-4 border-b font-black text-xs uppercase text-primary">Under 17 Boys</div>
                      <CardContent className="p-4 space-y-3">
                        {data.u17Boys.map((pId, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">{idx+1}</span>
                            <div className="flex-1">
                              <Select value={pId || "vacant"} onValueChange={(val) => handleTeamPlayerChange(sport, 'u17Boys', idx, val)}>
                                <SelectTrigger className="h-8 text-xs font-bold border-0 bg-transparent py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
                                  {getDropdownEligible('U17', 'Male', sport, pId).map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name.toUpperCase()}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* U17 Girls */}
                    <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-md">
                      <div className="bg-accent/5 p-4 border-b font-black text-xs uppercase text-accent">Under 17 Girls</div>
                      <CardContent className="p-4 space-y-3">
                        {data.u17Girls.map((pId, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent">{idx+1}</span>
                            <div className="flex-1">
                              <Select value={pId || "vacant"} onValueChange={(val) => handleTeamPlayerChange(sport, 'u17Girls', idx, val)}>
                                <SelectTrigger className="h-8 text-xs font-bold border-0 bg-transparent py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
                                  {getDropdownEligible('U17', 'Female', sport, pId).map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name.toUpperCase()}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* U14 Boys */}
                    <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-md">
                      <div className="bg-primary/5 p-4 border-b font-black text-xs uppercase text-primary">Under 14 Boys</div>
                      <CardContent className="p-4 space-y-3">
                        {data.u14Boys.map((pId, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">{idx+1}</span>
                            <div className="flex-1">
                              <Select value={pId || "vacant"} onValueChange={(val) => handleTeamPlayerChange(sport, 'u14Boys', idx, val)}>
                                <SelectTrigger className="h-8 text-xs font-bold border-0 bg-transparent py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
                                  {getDropdownEligible('U14', 'Male', sport, pId).map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name.toUpperCase()}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* U14 Girls */}
                    <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-md">
                      <div className="bg-accent/5 p-4 border-b font-black text-xs uppercase text-accent">Under 14 Girls</div>
                      <CardContent className="p-4 space-y-3">
                        {data.u14Girls.map((pId, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent">{idx+1}</span>
                            <div className="flex-1">
                              <Select value={pId || "vacant"} onValueChange={(val) => handleTeamPlayerChange(sport, 'u14Girls', idx, val)}>
                                <SelectTrigger className="h-8 text-xs font-bold border-0 bg-transparent py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
                                  {getDropdownEligible('U14', 'Female', sport, pId).map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name.toUpperCase()}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Athletics & Individual Events */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2 pl-2 border-l-4 border-primary">
              Athletics & Other Sports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OTHER_SPORTS.map(sport => {
                const list = otherPlans[sport];
                if (!list) return null;
                return (
                  <Card key={sport} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[450px]">
                    <div className="bg-primary/5 p-6 border-b">
                      <span className="text-lg font-black uppercase text-primary block leading-none">{sport}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 block tracking-wider">Practice Squad</span>
                    </div>
                    <CardContent className="p-6 space-y-3 flex-1">
                      {list.map((pId, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">{idx+1}</span>
                          <div className="flex-1">
                            <Select value={pId || "vacant"} onValueChange={(val) => handleOtherPlayerChange(sport, idx, val)}>
                              <SelectTrigger className="h-8 text-xs font-bold border-0 bg-transparent py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="vacant" className="text-muted-foreground font-semibold">-- VACANT --</SelectItem>
                                {getDropdownEligibleOther(sport, pId).map((p: any) => (
                                  <SelectItem key={p.id} value={p.id} className="font-bold">{p.name.toUpperCase()} (Std {p.std})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action floating bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border-2 border-primary/10 shadow-2xl px-8 py-5 rounded-[2rem] flex items-center justify-center gap-4 z-40 w-[90%] max-w-xl animate-in slide-in-from-bottom-8 duration-500">
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={Object.keys(teamPlans).length === 0}
          className="rounded-2xl border-2 font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-sm"
        >
          <Printer className="w-5 h-5 mr-2 text-primary" /> Print Plan
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isPastDate || Object.keys(teamPlans).length === 0}
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
