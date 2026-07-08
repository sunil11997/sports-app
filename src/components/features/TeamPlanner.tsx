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
  BookOpen
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

  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [u14Lineup, setU14Lineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u17Lineup, setU17Lineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [u19Lineup, setU19Lineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [femaleLineup, setFemaleLineup] = useState<(string | null)[]>(Array(7).fill(null));
  const [isSaving, setIsSaving] = useState(false);

  // History search/filter state
  const [historySearch, setHistorySearch] = useState('');
  const [historySportFilter, setHistorySportFilter] = useState('all');

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  // Load saved plan from Firebase via store
  const schoolId = store.data.schoolProfile?.id || "default";
  const planKey = `${schoolId}_${selectedSport}_${selectedDate}`;
  const savedPlan = store.data.teamPlans?.[planKey];

  useEffect(() => {
    if (savedPlan) {
      setSelectedDrills(savedPlan.drills || []);
      setU14Lineup(savedPlan.u14Players || Array(7).fill(null));
      setU17Lineup(savedPlan.u17Players || Array(7).fill(null));
      setU19Lineup(savedPlan.u19Players || Array(7).fill(null));
      setFemaleLineup(savedPlan.femalePlayers || Array(7).fill(null));
    } else {
      setSelectedDrills([]);
      setU14Lineup(Array(7).fill(null));
      setU17Lineup(Array(7).fill(null));
      setU19Lineup(Array(7).fill(null));
      setFemaleLineup(Array(7).fill(null));
    }
  }, [savedPlan, selectedSport, selectedDate]);

  const drillsList = useMemo(() => SPORTS_DATA[selectedSport]?.skills || [], [selectedSport]);

  const handleDrillToggle = (drill: string) => {
    setSelectedDrills(prev => 
      prev.includes(drill) ? prev.filter(d => d !== drill) : [...prev, drill]
    );
  };

  // Find all players assigned to other sports on the same date
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
            if (Array.isArray(plan.femalePlayers)) plan.femalePlayers.forEach((id: any) => id && ids.add(id));
          }
        }
      });
    }
    return ids;
  }, [store.data.teamPlans, store.data.schoolProfile?.id, selectedDate, selectedSport]);

  // Find all players assigned to the current sport's lineup
  const currentLineupPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    u14Lineup.forEach(id => id && ids.add(id));
    u17Lineup.forEach(id => id && ids.add(id));
    u19Lineup.forEach(id => id && ids.add(id));
    femaleLineup.forEach(id => id && ids.add(id));
    return ids;
  }, [u14Lineup, u17Lineup, u19Lineup, femaleLineup]);

  const getEligiblePlayers = useCallback((catType: 'U14' | 'U17' | 'U19' | 'Female', excludeExceptionId?: string | null) => {
    return (store.data.players || []).filter((p: any) => {
      if (p.category !== 'athlete') return false;
      if (!p.sports?.includes(selectedSport)) return false;

      // Resolve age dynamically
      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      
      if (!age || age <= 0 || isNaN(age)) return false;

      // Gender check
      const isFemale = p.gender && p.gender.toLowerCase() === 'female';
      if (catType === 'Female') {
        if (!isFemale) return false;
      } else {
        if (isFemale) return false;
      }

      if (catType === 'U14' && age >= 14) return false;
      if (catType === 'U17' && (age < 14 || age >= 17)) return false;
      if (catType === 'U19' && age < 17) return false;

      // Daily single session constraint (exclude players assigned to other sports on same date)
      if (assignedPlayerIdsOnDate.has(p.id)) return false;

      // Exclude players already selected in other slots of the current sport (except for the slot's current player)
      if (currentLineupPlayerIds.has(p.id) && p.id !== excludeExceptionId) return false;

      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players, selectedSport, assignedPlayerIdsOnDate, currentLineupPlayerIds]);

  const getPlayerDetails = useCallback((playerId: string | null) => {
    if (!playerId) return null;
    return (store.data.players || []).find((p: any) => p.id === playerId);
  }, [store.data.players]);

  const handlePlayerChange = (catType: 'U14' | 'U17' | 'U19' | 'Female', index: number, playerId: string) => {
    const updater = catType === 'U14' ? setU14Lineup 
                  : catType === 'U17' ? setU17Lineup 
                  : catType === 'U19' ? setU19Lineup 
                  : setFemaleLineup;
    
    updater(prev => {
      const next = [...prev];
      next[index] = playerId === "clear" ? null : playerId;
      return next;
    });
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
        u14Players: u14Lineup,
        u17Players: u17Lineup,
        u19Players: u19Lineup,
        femalePlayers: femaleLineup
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
    const u14Details = u14Lineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u17Details = u17Lineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const u19Details = u19Lineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));
    const femaleDetails = femaleLineup.map((id, i) => ({ index: i + 1, player: getPlayerDetails(id) }));

    const renderTable = (title: string, list: { index: number; player: any }[]) => `
      <div style="flex: 1; margin: 10px; min-width: 230px;">
        <h3 style="background: #235C36; color: white; margin: 0; padding: 10px; font-size: 14px; text-transform: uppercase; font-weight: 900; text-align: center; border-radius: 8px 8px 0 0;">
          ${title}
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 40px;">SLOT</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">PLAYER NAME</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 50px;">STD</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 40px;">AGE</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold; background: #fafafa;">${item.index}</td>
                <td style="border: 1px solid #ddd; padding: 6px; font-weight: bold; text-transform: uppercase;">
                  ${item.player ? item.player.name : '<span style="color: #ccc;">- VACANT -</span>'}
                </td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${item.player ? item.player.std : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${item.player ? (getAgeValidation(item.player.dob)?.ageYears || item.player.age || '-') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const printContent = `
      <html>
        <head>
          <title>Daily Team Planner - ${selectedSport} - ${selectedDate}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; line-height: 1.4; }
            .header { text-align: center; border-bottom: 4px double #235C36; padding-bottom: 12px; margin-bottom: 20px; }
            .school-title { font-size: 20px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            .subtitle { font-size: 15px; font-weight: 800; text-transform: uppercase; margin-top: 6px; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 20px; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; }
            .drills-section { background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
            .drills-title { font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #235C36; padding-bottom: 4px; margin-bottom: 10px; color: #235C36; }
            .drills-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .drill-item { background: white; border: 1px solid #ccc; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 11px; }
            .tables-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
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

          <div class="tables-container">
            ${renderTable("Under 14 (U14)", u14Details)}
            ${renderTable("Under 17 (U17)", u17Details)}
            ${renderTable("Under 19 (U19)", u19Details)}
            ${renderTable("Female (Girls)", femaleDetails)}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const renderSlotSelector = (catType: 'U14' | 'U17' | 'U19' | 'Female', lineup: (string | null)[], index: number) => {
    const selectedPlayerId = lineup[index];
    const eligible = getEligiblePlayers(catType, selectedPlayerId);
    const details = getPlayerDetails(selectedPlayerId);
    
    // Determine player age to display in dropdown
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
            onValueChange={(val) => handlePlayerChange(catType, index, val)}
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
        {selectedPlayerId && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handlePlayerChange(catType, index, "clear")}
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
            
            addPlayers(plan.u14Players, 'U14');
            addPlayers(plan.u17Players, 'U17');
            addPlayers(plan.u19Players, 'U19');
            addPlayers(plan.femalePlayers, 'Female');
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
      {/* Configuration Header Card */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Practice Planner</h2>
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

      {/* Drills Section Card */}
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
                    onClick={() => handleDrillToggle(drill)}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-left border-2 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
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

      {/* Lineup Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "Under 14 (U14)", type: 'U14' as const, lineup: u14Lineup },
          { title: "Under 17 (U17)", type: 'U17' as const, lineup: u17Lineup },
          { title: "Under 19 (U19)", type: 'U19' as const, lineup: u19Lineup },
          { title: "Female (Girls)", type: 'Female' as const, lineup: femaleLineup }
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
                {Array(7).fill(null).map((_, i) => renderSlotSelector(cat.type, cat.lineup, i))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Practice History Section Card */}
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
                  <th className="p-4 pr-8 text-[10px] font-black uppercase text-muted-foreground">Focus Drills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-xs font-black uppercase text-muted-foreground opacity-55">
                      No practice records found.
                    </td>
                  </tr>
                ) : filteredHistory.slice(0, 50).map((record, i) => (
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
                        record.category === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-primary/5 text-primary'
                      }`}>
                        {record.category === 'Female' ? 'Female' : record.category}
                      </Badge>
                    </td>
                    <td className="p-4 pr-8 max-w-xs md:max-w-md">
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
                  </tr>
                ))}
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

      {/* Floating Save & Print Controls */}
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
          disabled={isSaving}
          className="rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-lg active-scale"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">Saving...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Save Plan</span>
          )}
        </Button>
      </div>
    </div>
  );
}
