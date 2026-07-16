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
  Copy, 
  Check, 
  Search, 
  MapPin, 
  BookOpen, 
  AlertTriangle,
  Clock
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

export function DailyPracticePlanner({ store }: { store: any }) {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'U14' | 'U17' | 'U19'>('U14');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [duration, setDuration] = useState<number>(90);
  const [maxGroupSize, setMaxGroupSize] = useState<number>(8);
  const [grounds, setGrounds] = useState<string[]>(["Main Ground", "Volleyball Court", "Kabaddi Court"]);
  const [coaches, setCoaches] = useState<string[]>(["Coach Sunil", "Coach Shinde", "Coach Patil"]);
  
  const [newGround, setNewGround] = useState("");
  const [newCoach, setNewCoach] = useState("");
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dialog / Modal State
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [searchPlayerQuery, setSearchPlayerQuery] = useState("");

  const schoolId = store.data.schoolProfile?.id || "default";
  const safeDateKey = selectedDate.replace(/\//g, '-');
  const scheduleKey = `${schoolId}_${safeDateKey}_${selectedAgeGroup}`;

  // Load from Firebase
  useEffect(() => {
    if (!store.isLoaded || !db) return;

    const docRef = doc(db, 'daily_practice_schedules', scheduleKey);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setTimetable(d.timetable || []);
        if (d.grounds) setGrounds(d.grounds);
        if (d.coaches) setCoaches(d.coaches);
        if (d.maxGroupSize) setMaxGroupSize(d.maxGroupSize);
        if (d.duration) setDuration(d.duration);
      } else {
        setTimetable([]);
      }
    });
    return () => unsub();
  }, [store.isLoaded, scheduleKey]);

  // List of eligible athletes matching selected age group
  const eligibleAthletes = useMemo(() => {
    const athletes = (store.data.players || []).filter((p: any) => p.category === 'athlete');
    return athletes.filter((p: any) => {
      const ageVal = getAgeValidation(p.dob);
      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
      if (!age || age <= 0 || isNaN(age)) return false;
      if (selectedAgeGroup === 'U14' && age >= 14) return false;
      if (selectedAgeGroup === 'U17' && (age < 14 || age >= 17)) return false;
      if (selectedAgeGroup === 'U19' && age < 17) return false;
      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [store.data.players, selectedAgeGroup]);

  // Generate Daily Schedule automatically
  const handleAutoGenerate = () => {
    if (eligibleAthletes.length === 0) {
      toast({ title: "No Athletes Found", description: `No athletes match the ${selectedAgeGroup} category.`, variant: "destructive" });
      return;
    }

    // 1. Group players by sport
    const sportPlayersMap: Record<string, any[]> = {};
    eligibleAthletes.forEach((p: any) => {
      if (Array.isArray(p.sports)) {
        p.sports.forEach((sport: string) => {
          if (!sportPlayersMap[sport]) sportPlayersMap[sport] = [];
          sportPlayersMap[sport].push(p);
        });
      }
    });

    // 2. Divide players into groups per sport based on maxGroupSize
    const sportGroups: { sport: string; groupName: string; players: any[] }[] = [];
    Object.entries(sportPlayersMap).forEach(([sport, playersList]) => {
      const sortedPlayers = [...playersList].sort((a, b) => a.name.localeCompare(b.name));
      const numGroups = Math.ceil(sortedPlayers.length / maxGroupSize);
      if (numGroups === 0) return;

      const groupCap = Math.ceil(sortedPlayers.length / numGroups);
      for (let g = 0; g < numGroups; g++) {
        const groupPlayers = sortedPlayers.slice(g * groupCap, (g + 1) * groupCap);
        sportGroups.push({
          sport,
          groupName: `${sport} Group ${String.fromCharCode(65 + g)}`,
          players: groupPlayers
        });
      }
    });

    if (sportGroups.length === 0) {
      toast({ title: "No Groupings Created", description: "Make sure students have sports assigned to their profiles.", variant: "destructive" });
      return;
    }

    // 3. Calculate 30 min blocks
    const slotCount = Math.floor(duration / 30);
    const timeSlots: { start: string; end: string }[] = [];
    let currentHour = 7;
    let currentMin = 30;
    for (let i = 0; i < slotCount; i++) {
      const startH = String(currentHour).padStart(2, '0');
      const startM = String(currentMin).padStart(2, '0');
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
      
      const endH = String(currentHour).padStart(2, '0');
      const endM = String(currentMin).padStart(2, '0');
      
      timeSlots.push({
        start: `${startH}:${startM}`,
        end: `${endH}:${endM}`
      });
    }

    // 4. Run greedy scheduling
    const slotsData: any[] = [];
    const groupScheduledCount: Record<string, number> = {};
    sportGroups.forEach(g => {
      groupScheduledCount[g.groupName] = 0;
    });

    timeSlots.forEach((slot, slotIdx) => {
      const busyCoaches = new Set<string>();
      const busyGrounds = new Set<string>();
      const busyPlayers = new Set<string>();

      // Sort groups by how many times they've practiced to ensure fair rotation
      const sortedGroups = [...sportGroups].sort((a, b) => {
        return groupScheduledCount[a.groupName] - groupScheduledCount[b.groupName];
      });

      sortedGroups.forEach(group => {
        // Constraint A: check player overlap
        const hasOverlap = group.players.some(p => busyPlayers.has(p.id));
        if (hasOverlap) return; 

        // Constraint B: available ground
        const ground = grounds.find(g => !busyGrounds.has(g));
        if (!ground) return; 

        // Constraint C: available coach
        const coach = coaches.find(c => !busyCoaches.has(c));
        if (!coach) return; 

        // Select drill (rotate drills)
        const drills = SPORTS_DATA[group.sport]?.skills || ["Cardio Conditioning", "Match Play", "Drill Training"];
        const drillIndex = groupScheduledCount[group.groupName] % drills.length;
        const selectedDrill = drills[drillIndex];

        slotsData.push({
          id: `${slotIdx}_${group.groupName.replace(/\s+/g, '_')}`,
          time: `${slot.start} - ${slot.end}`,
          sport: group.sport,
          ground,
          coach,
          groupName: group.groupName,
          skills: [selectedDrill],
          players: group.players.map(p => p.id)
        });

        busyCoaches.add(coach);
        busyGrounds.add(ground);
        group.players.forEach(p => busyPlayers.add(p.id));
        groupScheduledCount[group.groupName] += 1;
      });
    });

    setTimetable(slotsData);
    toast({ title: "Planner Generated", description: `Successfully generated ${timeSlots.length} blocks for all sports.` });
  };

  // Add a Ground
  const handleAddGround = () => {
    if (newGround && !grounds.includes(newGround)) {
      setGrounds([...grounds, newGround]);
      setNewGround("");
    }
  };

  // Remove Ground
  const handleRemoveGround = (gName: string) => {
    setGrounds(grounds.filter(g => g !== gName));
  };

  // Add a Coach
  const handleAddCoach = () => {
    if (newCoach && !coaches.includes(newCoach)) {
      setCoaches([...coaches, newCoach]);
      setNewCoach("");
    }
  };

  // Remove Coach
  const handleRemoveCoach = (cName: string) => {
    setCoaches(coaches.filter(c => c !== cName));
  };

  // Save Schedule
  const handleSave = async () => {
    if (!db) {
      toast({ title: "Storage Restructured", description: "Storage initialization failed.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, 'daily_practice_schedules', scheduleKey);
      await setDoc(docRef, {
        id: scheduleKey,
        schoolId,
        date: selectedDate,
        ageGroup: selectedAgeGroup,
        duration,
        maxGroupSize,
        grounds,
        coaches,
        timetable,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({ title: "Planner Saved", description: "Successfully saved daily practice timetable." });
    } catch (e) {
      toast({ title: "Failed to Save", description: "Could not write planner to server.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Schedule
  const handleCopySchedule = async () => {
    if (!copySourceDate || !db) return;

    try {
      const safeSourceDateKey = copySourceDate.replace(/\//g, '-');
      const sourceKey = `${schoolId}_${safeSourceDateKey}_${selectedAgeGroup}`;
      const docRef = doc(db, 'daily_practice_schedules', sourceKey);
      
      const unsub = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const d = snapshot.data();
          setTimetable(d.timetable || []);
          if (d.grounds) setGrounds(d.grounds);
          if (d.coaches) setCoaches(d.coaches);
          if (d.maxGroupSize) setMaxGroupSize(d.maxGroupSize);
          if (d.duration) setDuration(d.duration);
          toast({ title: "Schedule Copied", description: `Copied successfully from ${copySourceDate}.` });
        } else {
          toast({ title: "No Schedule Found", description: `No schedule exists for ${copySourceDate} under ${selectedAgeGroup}.`, variant: "destructive" });
        }
        setIsCopyDialogOpen(false);
        unsub();
      });
    } catch (e) {
      toast({ title: "Copy Failed", description: "An error occurred during copy.", variant: "destructive" });
    }
  };

  // Print A4 portrait Layout
  const handlePrint = () => {
    const schoolName = store.data.schoolProfile?.schoolName || "शासकीय माध्यमिक आश्रम शाळा वाघंबा";
    const getPlayerName = (id: string) => {
      const p = (store.data.players || []).find((player: any) => player.id === id);
      return p ? p.name.toUpperCase() : "UNKNOWN";
    };

    const slotsByTime: Record<string, any[]> = {};
    timetable.forEach(slot => {
      if (!slotsByTime[slot.time]) slotsByTime[slot.time] = [];
      slotsByTime[slot.time].push(slot);
    });

    const printContent = `
      <html>
        <head>
          <title>Daily Practice Schedule - ${selectedDate} - ${selectedAgeGroup}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0 !important; padding: 0 !important; }
              @page {
                size: A4 portrait;
                margin: 12mm 10mm 12mm 10mm;
              }
            }
            @media screen {
              body { padding-top: 80px !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #000000; line-height: 1.3; }
            .header { text-align: center; border-bottom: 2.5px solid #000000; padding-bottom: 10px; margin-bottom: 18px; color: #000000; }
            .school-title { font-size: 22px; font-weight: 900; color: #000000; text-transform: uppercase; }
            .subtitle { font-size: 16px; font-weight: 800; text-transform: uppercase; margin-top: 4px; color: #000000; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 18px; background: #ffffff; padding: 8px 12px; border: 1.5px solid #000000; color: #000000; text-transform: uppercase; }
            .slot-card { border: 1.5px solid #000000; margin-bottom: 15px; border-radius: 6px; overflow: hidden; page-break-inside: avoid; background: #ffffff; }
            .slot-header { background: #000000; color: #ffffff; padding: 8px 12px; font-size: 13px; font-weight: 900; display: flex; justify-content: space-between; }
            .slot-body { padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #ffffff; color: #000000; }
            .slot-meta { font-size: 11px; font-weight: bold; color: #000000; }
            .slot-meta div { margin-bottom: 4px; }
            .player-list { font-size: 11px; color: #000000; }
            .player-title { font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 6px; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; }
            .players-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
            .player-item { background: #ffffff; border: 1px solid #000000; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; color: #000000; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #000000; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body>
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">PRINT TIMETABLE</button>
          </div>

          <div class="header">
            <div class="school-title">${schoolName}</div>
            <div class="subtitle">DAILY PRACTICE TIMETABLE (${selectedAgeGroup})</div>
          </div>

          <div class="meta-grid">
            <div>DATE: <span contenteditable="true" style="border-bottom: 1px dashed #000000; cursor: text; color: #000000; font-weight: 900; padding: 0 4px;">${selectedDate}</span></div>
            <div>DURATION: <span contenteditable="true" style="border-bottom: 1px dashed #000000; cursor: text; color: #000000; font-weight: 900; padding: 0 4px;">${duration} Minutes</span></div>
            <div>MAX GROUP SIZE: <span contenteditable="true" style="border-bottom: 1px dashed #000000; cursor: text; color: #000000; font-weight: 900; padding: 0 4px;">${maxGroupSize} Athletes</span></div>
          </div>

          ${Object.entries(slotsByTime).map(([timeStr, slots]) => `
            <div style="margin-bottom: 20px; page-break-inside: avoid; color: #000000;">
              <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; color: #000000; border-left: 5px solid #000000; padding-left: 8px; margin-bottom: 10px;">
                TIME BLOCK: ${timeStr}
              </h2>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${slots.map(slot => `
                  <div class="slot-card">
                    <div class="slot-header">
                      <span>${slot.sport.toUpperCase()} - ${slot.groupName.toUpperCase()}</span>
                      <span>${slot.ground.toUpperCase()}</span>
                    </div>
                    <div class="slot-body">
                      <div class="slot-meta">
                        <div><strong>COACH:</strong> ${slot.coach}</div>
                        <div><strong>GROUND:</strong> ${slot.ground}</div>
                        <div><strong>FOCUS DRILL:</strong> ${slot.skills.join(', ')}</div>
                        <div><strong>ATHLETES:</strong> ${slot.players.length} Registered</div>
                      </div>
                      <div class="player-list">
                        <div class="player-title">Squad Members</div>
                        <div class="players-grid">
                          ${slot.players.map((pId: string) => `
                            <div class="player-item">${getPlayerName(pId)}</div>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  // Add Custom / Manual Time Slot
  const handleAddCustomSlot = () => {
    const newSlot = {
      id: `manual_${Date.now()}`,
      time: "07:30 - 08:00",
      sport: SPORTS_LIST[0],
      ground: grounds[0] || "Main Ground",
      coach: coaches[0] || "Coach Sunil",
      groupName: "Custom Group",
      skills: ["General Conditioning"],
      players: []
    };
    setTimetable([...timetable, newSlot]);
  };

  // Delete Timetable Slot
  const handleDeleteSlot = (id: string) => {
    setTimetable(timetable.filter(s => s.id !== id));
  };

  // Open Edit Slot Modal
  const openEditSlot = (slot: any) => {
    setEditingSlot({ ...slot });
    setIsEditDialogOpen(true);
    setSearchPlayerQuery("");
  };

  // Save Edits inside Modal
  const handleSaveSlotEdits = () => {
    if (!editingSlot) return;
    setTimetable(timetable.map(s => s.id === editingSlot.id ? editingSlot : s));
    setIsEditDialogOpen(false);
    setEditingSlot(null);
  };

  // Toggle Athlete in Group Editor
  const togglePlayerInEditingGroup = (playerId: string) => {
    if (!editingSlot) return;
    const currentList = editingSlot.players || [];
    const isAssigned = currentList.includes(playerId);
    
    let nextList;
    if (isAssigned) {
      nextList = currentList.filter((id: string) => id !== playerId);
    } else {
      nextList = [...currentList, playerId];
    }

    setEditingSlot({
      ...editingSlot,
      players: nextList
    });
  };

  // Overlap checker for modal warnings
  const checkPlayerOverlap = (playerId: string, timeStr: string, currentSlotId: string) => {
    const overlappingSlots = timetable.filter(s => s.time === timeStr && s.id !== currentSlotId);
    const busySlot = overlappingSlots.find(s => s.players.includes(playerId));
    return busySlot ? busySlot.sport : null;
  };

  // Filter athletes shown in Edit Modal based on search
  const filteredAthletesInModal = useMemo(() => {
    if (!editingSlot) return [];
    
    return eligibleAthletes.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchPlayerQuery.toLowerCase());
      const playsThisSport = Array.isArray(p.sports) && p.sports.includes(editingSlot.sport);
      
      return matchesSearch && playsThisSport;
    });
  }, [eligibleAthletes, editingSlot, searchPlayerQuery]);

  // Group slots by time for display in main screen
  const timetableGroupedByTime = useMemo(() => {
    const map: Record<string, any[]> = {};
    timetable.forEach(slot => {
      if (!map[slot.time]) map[slot.time] = [];
      map[slot.time].push(slot);
    });
    return map;
  }, [timetable]);

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Header Card */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-6">
          <div className="bg-primary/5 p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Practice Scheduler</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Automated Timetable & Groups</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="space-y-1 w-full sm:w-32">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Age Group</label>
            <Select value={selectedAgeGroup} onValueChange={(val: any) => setSelectedAgeGroup(val)}>
              <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="U14" className="font-bold">U14 (Under 14)</SelectItem>
                <SelectItem value="U17" className="font-bold">U17 (Under 17)</SelectItem>
                <SelectItem value="U19" className="font-bold">U19 (Under 19)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 w-full sm:w-80">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Schedule Date</label>
            <Input 
              type="text" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              placeholder="e.g. 01/01/2011 to 30/05/2012"
              className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"
            />
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider ml-2">e.g. 01/01/2011 to 30/05/2012</p>
          </div>

          <div className="space-y-1 w-full sm:w-32">
            <label className="text-[9px] font-black text-primary uppercase ml-2">Duration</label>
            <Select value={String(duration)} onValueChange={(val) => setDuration(parseInt(val))}>
              <SelectTrigger className="h-12 font-bold bg-white rounded-xl border-2 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="60" className="font-bold">60 Min</SelectItem>
                <SelectItem value="90" className="font-bold">90 Min</SelectItem>
                <SelectItem value="120" className="font-bold">120 Min</SelectItem>
                <SelectItem value="180" className="font-bold">180 Min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Columns - Setup / Parameters */}
        <div className="xl:col-span-1 space-y-8">
          {/* Ground Config Card */}
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-md">
            <CardHeader className="bg-primary/5 p-6 border-b">
              <CardTitle className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Available Grounds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter ground name..." 
                  value={newGround} 
                  onChange={(e) => setNewGround(e.target.value)}
                  className="h-10 font-bold text-xs border-2 rounded-xl"
                />
                <Button onClick={handleAddGround} className="h-10 bg-primary rounded-xl px-4 font-bold text-xs">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {grounds.map(g => (
                  <Badge key={g} className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    {g}
                    <button onClick={() => handleRemoveGround(g)} className="hover:text-destructive text-primary/40"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coach Config Card */}
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-md">
            <CardHeader className="bg-accent/5 p-6 border-b">
              <CardTitle className="text-sm font-black text-accent uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Available Coaches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter coach name..." 
                  value={newCoach} 
                  onChange={(e) => setNewCoach(e.target.value)}
                  className="h-10 font-bold text-xs border-2 rounded-xl"
                />
                <Button onClick={handleAddCoach} className="h-10 bg-accent rounded-xl px-4 font-bold text-xs">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {coaches.map(c => (
                  <Badge key={c} className="bg-accent/5 text-accent border-accent/20 font-black text-[10px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    {c}
                    <button onClick={() => handleRemoveCoach(c)} className="hover:text-destructive text-accent/40"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parameters Card */}
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-md">
            <CardHeader className="bg-muted/30 p-6 border-b">
              <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Max Players Per Group</label>
                <Input 
                  type="number" 
                  value={maxGroupSize} 
                  onChange={(e) => setMaxGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-11 font-bold text-xs border-2 rounded-xl"
                />
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Quick Action Console</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleAutoGenerate} className="bg-primary rounded-xl font-black uppercase text-[10px] tracking-widest h-12">
                    Auto Schedule
                  </Button>
                  <Button onClick={() => setIsCopyDialogOpen(true)} variant="outline" className="border-2 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 flex items-center justify-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-primary" /> Copy Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Timetable */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center pl-2">
            <h3 className="text-sm font-black uppercase text-primary tracking-widest pl-2 border-l-4 border-primary">Schedule Timetable</h3>
            <Button onClick={handleAddCustomSlot} variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-primary border h-8 px-4 rounded-xl flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Custom Slot
            </Button>
          </div>

          {timetable.length === 0 ? (
            <Card className="border-2 rounded-[2.5rem] bg-white border-dashed p-12 text-center shadow-inner flex flex-col items-center justify-center min-h-[300px]">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-4 animate-bounce" />
              <p className="font-black text-primary uppercase text-sm tracking-widest">No Schedule Active</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest max-w-xs mx-auto">Click &apos;Auto Schedule&apos; to generate or manually append slots.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(timetableGroupedByTime).map(([timeStr, slots]) => (
                <div key={timeStr} className="space-y-3 bg-white p-6 rounded-[2rem] border-2 border-primary/5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-primary/5 pb-2.5">
                    <Clock className="w-4.5 h-4.5 text-primary" />
                    <span className="text-sm font-black text-primary tracking-wider">{timeStr}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slots.map((slot) => (
                      <div key={slot.id} className="border border-primary/10 rounded-2xl bg-muted/5 hover:border-primary/20 transition-all p-4 relative overflow-hidden flex flex-col justify-between gap-3 min-h-[140px]">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs font-black uppercase text-primary block leading-none">{slot.sport}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 block tracking-wider">{slot.groupName}</span>
                          </div>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full border-none">
                            {slot.ground}
                          </Badge>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/80 space-y-1">
                          <p><strong>Coach:</strong> {slot.coach}</p>
                          <p className="truncate"><strong>Drills:</strong> {slot.skills.join(', ')}</p>
                          <p><strong>Athletes:</strong> {slot.players?.length || 0} assigned</p>
                        </div>
                        <div className="flex gap-2 justify-end border-t border-primary/5 pt-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditSlot(slot)} 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteSlot(slot.id)} 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Save & Print Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border-2 border-primary/10 shadow-2xl px-8 py-5 rounded-[2rem] flex items-center justify-center gap-4 z-40 w-[90%] max-w-xl animate-in slide-in-from-bottom-8 duration-500">
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={timetable.length === 0}
          className="rounded-2xl border-2 font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-sm"
        >
          <Printer className="w-5 h-5 mr-2 text-primary" /> Print Plan
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || timetable.length === 0}
          className="rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-wider h-12 flex-1 shadow-lg active-scale"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">Saving...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Save Plan</span>
          )}
        </Button>
      </div>

      {/* 2. Copy Plan Dialog Overlay */}
      {isCopyDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border-2 border-primary/15 max-w-sm w-full p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsCopyDialogOpen(false)} 
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Copy Practice Plan</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select source date to copy from</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-primary uppercase pl-2">Source Date</label>
                <Input 
                  type="text" 
                  value={copySourceDate} 
                  onChange={(e) => setCopySourceDate(e.target.value)} 
                  placeholder="e.g. 01/01/2011 to 30/05/2012"
                  className="h-12 border-2 rounded-xl font-bold text-xs"
                />
              </div>
              <Button onClick={handleCopySchedule} className="w-full h-12 bg-primary rounded-xl font-black uppercase text-xs tracking-wider">
                Copy Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Slot Edit Dialog Overlay */}
      {isEditDialogOpen && editingSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] border-2 border-primary/15 max-w-lg w-full p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setIsEditDialogOpen(false); setEditingSlot(null); }} 
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-2 border-b pb-4">
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Edit Session Slot</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{editingSlot.time} block</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-primary uppercase pl-2">Discipline</label>
                <Select value={editingSlot.sport} onValueChange={(val) => setEditingSlot({ ...editingSlot, sport: val })}>
                  <SelectTrigger className="h-10 text-xs font-bold border-2 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{SPORTS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-primary uppercase pl-2">Ground</label>
                <Select value={editingSlot.ground} onValueChange={(val) => setEditingSlot({ ...editingSlot, ground: val })}>
                  <SelectTrigger className="h-10 text-xs font-bold border-2 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{grounds.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-primary uppercase pl-2">Coach</label>
                <Select value={editingSlot.coach} onValueChange={(val) => setEditingSlot({ ...editingSlot, coach: val })}>
                  <SelectTrigger className="h-10 text-xs font-bold border-2 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{coaches.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-primary uppercase pl-2">Time Slot</label>
                <Input 
                  value={editingSlot.time} 
                  onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                  className="h-10 text-xs font-bold border-2 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-primary uppercase pl-2">Focus Drills</label>
              <Input 
                value={editingSlot.skills.join(', ')} 
                onChange={(e) => setEditingSlot({ ...editingSlot, skills: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Comma separated focus drills"
                className="h-10 text-xs font-bold border-2 rounded-xl"
              />
            </div>

            {/* Roster Assignment Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-primary uppercase pl-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Group Squad members ({editingSlot.players?.length || 0})</label>
                <div className="relative w-44">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search name..."
                    value={searchPlayerQuery}
                    onChange={(e) => setSearchPlayerQuery(e.target.value)}
                    className="pl-8 h-8 text-[10px] font-bold border-2 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="border border-primary/5 rounded-2xl max-h-48 overflow-y-auto divide-y divide-primary/5">
                {filteredAthletesInModal.length === 0 ? (
                  <p className="p-6 text-center text-xs font-bold text-muted-foreground uppercase">No athletes found matching criteria.</p>
                ) : (
                  filteredAthletesInModal.map((p: any) => {
                    const isChecked = (editingSlot.players || []).includes(p.id);
                    const overlapSport = checkPlayerOverlap(p.id, editingSlot.time, editingSlot.id);
                    
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 hover:bg-primary/[0.01] transition-colors">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => togglePlayerInEditingGroup(p.id)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-primary uppercase block leading-none">{p.name}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 block">Std {p.std}</span>
                          </div>
                        </div>
                        {overlapSport && (
                          <Badge className="bg-destructive/10 hover:bg-destructive/15 text-destructive border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Busy: {overlapSport}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-primary/5">
              <Button onClick={() => { setIsEditDialogOpen(false); setEditingSlot(null); }} variant="outline" className="flex-1 h-12 border-2 rounded-xl font-black uppercase text-xs tracking-wider">
                Cancel
              </Button>
              <Button onClick={handleSaveSlotEdits} className="flex-1 h-12 bg-primary rounded-xl font-black uppercase text-xs tracking-wider">
                Apply Edits
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
