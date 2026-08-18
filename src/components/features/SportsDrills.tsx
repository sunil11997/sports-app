
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  CircleCheck, 
  UsersRound, 
  ShieldCheck,
  Loader2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Flame,
  Info,
  Users,
  Sparkles,
  Filter,
  ZoomIn,
  Trophy,
  User,
  Calendar,
  Sun,
  Moon,
  CheckSquare,
  Square,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAgeValidation } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { YogaPtGuideModal } from '@/components/ui/YogaPtGuideModal';
import { format } from 'date-fns';

const SPORTS_DATA: Record<string, { skills: string[] }> = {
  'Yoga': {
    skills: [
      "Surya Namaskar (सूर्य नमस्कार)",
      "Tadasana (ताडासन)",
      "Vrikshasana (वृक्षासन)",
      "Bhujangasana (भुजंगासन)",
      "Padmasana (पद्मासन)",
      "Anulom Vilom Pranayama (अनुलोम विलोम)",
      "Kapalbhati Pranayama (कपालभाती)",
      "Shavasana (शवासन)",
      "Trikonasana (त्रिकोणासन)",
      "Dhanurasana (धनुरासन)",
      "Paschimottanasana (पश्चिमोत्तानासन)",
      "Vajrasana (वज्रासन)"
    ]
  },
  'PT Mass': {
    skills: [
      "Mass PT Exercise No 1",
      "Mass PT Exercise No 2",
      "Mass PT Exercise No 3",
      "Mass PT Exercise No 4",
      "Mass PT Exercise No 5",
      "Freehand Warm-up",
      "Jumping Jacks & Hopping",
      "Arm Swings & Shoulder Rotation",
      "Trunk Bending & Twisting",
      "Marching in Place",
      "Deep Breathing PT",
      "Cool-down Stretch Routine"
    ]
  },
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
      "Glide technique drill", "Power position throw", "Spin rotation drill", "Release angle check",
      "Wrist snap practice", "Balance ring hold", "Med ball throw", "Core rotation lift"
    ]
  },
  'Javelin Throw': {
    skills: [
      "Cross-over step drill", "Approach rhythm run", "Release pull power", "Javelin carry sprint",
      "Elbow high extension", "Block leg plant", "Flight angle check", "Target throw accuracy"
    ]
  },
  'Disc Throw': {
    skills: [
      "Wind-up rotation drill", "Spin entry balance", "Power launch stance", "Release spin check",
      "Orbit trajectory check", "Footwork speed glide", "Core twisting power"
    ]
  },
  'Long Jump': {
    skills: [
      "Approach speed run", "Board takeoff lift", "Flight hitch-kick", "Landing extension",
      "Takeoff foot plant", "Speed retention stride", "Hurdle takeoff drill"
    ]
  },
  'High Jump': {
    skills: [
      "J-approach run speed", "Takeoff arch height", "Fosbury flop turn", "Landing roll safety",
      "Knee drive lift", "Bar clearance timing", "Vertical launch power"
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

interface SportsDrillsProps {
  store: any;
  preselectedSport?: string;
}

export function SportsDrills({ store, preselectedSport }: SportsDrillsProps) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || 'Kabaddi');
  const [activeDrill, setActiveDrill] = useState(SPORTS_DATA[activeSport || 'Kabaddi']?.skills[0] || "Standard Drill");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [guideModalName, setGuideModalName] = useState<string | null>(null);
  const [selectedAthleteForPhoto, setSelectedAthleteForPhoto] = useState<any | null>(null);

  // Date and Session selection for attendance linkage
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSession, setSelectedSession] = useState<'Morning' | 'Evening'>('Morning');
  
  // Filter mode: "attended_only" vs "all"
  const [filterMode, setFilterMode] = useState<'attended_only' | 'all'>('attended_only');

  // Selected student IDs for batch drill operations
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (preselectedSport && SPORTS_DATA[preselectedSport]) {
      setActiveSport(preselectedSport);
      setActiveDrill(SPORTS_DATA[preselectedSport].skills[0]);
    }
  }, [preselectedSport]);

  const drillKey = `${activeSport}_${activeDrill}`;
  const isYogaOrPt = activeSport === 'Yoga' || activeSport === 'PT Mass';

  // Base list of athletes registered for this sport
  const playersInSport = useMemo(() => 
    (store.data.players || []).filter((p: any) => 
      p.category === 'athlete' && (isYogaOrPt || p.sports?.includes(activeSport))
    ),
  [store.data.players, activeSport, isYogaOrPt]);

  // Helper to determine attendance status of a player for the active date and session
  const getAttendanceStatus = useCallback((playerId: string): { status: 'P' | 'A' | 'Unmarked'; label: string } => {
    const attRecord = store?.data?.attendance || {};
    const exactKey = `${playerId}_${selectedDate}_${selectedSession}`;
    const val = attRecord[exactKey];
    
    if (val === 'P') return { status: 'P', label: 'उपस्थित (Present)' };
    if (val === 'A') return { status: 'A', label: 'अनुपस्थित (Absent)' };
    
    // Fallback: check other session if unmarked
    const mVal = attRecord[`${playerId}_${selectedDate}_Morning`];
    const eVal = attRecord[`${playerId}_${selectedDate}_Evening`];
    if (mVal === 'P' || eVal === 'P') return { status: 'P', label: 'उपस्थित (Present)' };
    if (mVal === 'A' && eVal === 'A') return { status: 'A', label: 'अनुपस्थित (Absent)' };

    return { status: 'Unmarked', label: 'नोंद नाही (Unmarked)' };
  }, [store?.data?.attendance, selectedDate, selectedSession]);

  // Attended players in this sport
  const attendedPlayersInSport = useMemo(() => {
    const attended = playersInSport.filter((p: any) => getAttendanceStatus(p.id).status === 'P');
    // If no players are marked present yet, fallback to all sport players so the user can still practice
    return attended.length > 0 ? attended : playersInSport;
  }, [playersInSport, getAttendanceStatus]);

  // Count of strictly marked present
  const presentCount = useMemo(() => {
    return playersInSport.filter((p: any) => getAttendanceStatus(p.id).status === 'P').length;
  }, [playersInSport, getAttendanceStatus]);

  // Automatically select attended students when drill changes or when component initializes
  const selectAttendedStudentsForDrill = useCallback((drillName: string, sport: string) => {
    setActiveDrill(drillName);
    
    const targetPlayers = (store.data.players || []).filter((p: any) => 
      p.category === 'athlete' && ((sport === 'Yoga' || sport === 'PT Mass') || p.sports?.includes(sport))
    );

    const attended = targetPlayers.filter((p: any) => {
      const attRecord = store?.data?.attendance || {};
      const exactVal = attRecord[`${p.id}_${selectedDate}_${selectedSession}`];
      if (exactVal === 'P') return true;
      const mVal = attRecord[`${p.id}_${selectedDate}_Morning`];
      const eVal = attRecord[`${p.id}_${selectedDate}_Evening`];
      return mVal === 'P' || eVal === 'P';
    });

    const targetList = attended.length > 0 ? attended : targetPlayers;
    const targetIds = targetList.map((p: any) => p.id);
    setSelectedStudentIds(targetIds);

    toast({
      title: `🎯 Drill Selected: ${drillName}`,
      description: attended.length > 0 
        ? `उपस्थित ${attended.length} खेळाडू आपोआप निवडले गेले! (${attended.length} attended students auto-selected)`
        : `सर्व ${targetPlayers.length} खेळाडू निवडले गेले (${targetPlayers.length} athletes loaded)`,
      className: "bg-emerald-600 text-white font-bold"
    });
  }, [store?.data?.players, store?.data?.attendance, selectedDate, selectedSession, toast]);

  // On first load or when activeSport changes, auto-select attended students
  useEffect(() => {
    const availableSkills = SPORTS_DATA[activeSport]?.skills || [];
    const currentOrFirst = availableSkills.includes(activeDrill) ? activeDrill : availableSkills[0] || "Standard Drill";
    setActiveDrill(currentOrFirst);
    
    const attended = playersInSport.filter((p: any) => getAttendanceStatus(p.id).status === 'P');
    const targetList = attended.length > 0 ? attended : playersInSport;
    setSelectedStudentIds(targetList.map((p: any) => p.id));
  }, [activeSport]);

  // Filtered list based on view mode (Attended Only vs All)
  const displayPlayers = useMemo(() => {
    if (filterMode === 'attended_only') {
      const attended = playersInSport.filter((p: any) => getAttendanceStatus(p.id).status === 'P');
      return attended.length > 0 ? attended : playersInSport;
    }
    return playersInSport;
  }, [playersInSport, filterMode, getAttendanceStatus]);

  // Grouped squads
  const groupedSquads = useMemo(() => {
    if (isYogaOrPt) {
      // Group by Class for Yoga & PT Mass
      const groups: Record<string, any[]> = {
        'Class 5': [], 'Class 6': [], 'Class 7': [], 'Class 8': [], 'Class 9': [], 'Class 10': [], 'Other Classes': []
      };
      displayPlayers.forEach((p: any) => {
        const lookupKey = p.id + "_" + drillKey;
        const isMastered = !!(store.data.drillCompletions && store.data.drillCompletions[lookupKey]);
        if (!isMastered) {
          const std = (p.std || "").toString().trim();
          if (groups[`Class ${std}`]) groups[`Class ${std}`].push(p);
          else groups['Other Classes'].push(p);
        }
      });
      return groups;
    } else {
      // Group by Age Category for Sport Athletes
      const groups: Record<string, any[]> = { 'U14': [], 'U17': [], 'Senior': [], 'Age Pending': [] };
      displayPlayers.forEach((p: any) => {
        const lookupKey = p.id + "_" + drillKey;
        const isMastered = !!(store.data.drillCompletions && store.data.drillCompletions[lookupKey]);
        if (!isMastered) {
          const ageVal = getAgeValidation(p.dob);
          const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
          let cat = 'Senior';
          if (!age || age <= 0 || isNaN(age)) cat = 'Age Pending';
          else if (age < 14) cat = 'U14';
          else if (age < 17) cat = 'U17';
          groups[cat].push(p);
        }
      });
      return groups;
    }
  }, [displayPlayers, store.data.drillCompletions, drillKey, isYogaOrPt]);

  const masteredThisDrill = useMemo(() => {
    return playersInSport
      .filter((p: any) => {
        const lookupKey = p.id + "_" + drillKey;
        return !!(store.data.drillCompletions && store.data.drillCompletions[lookupKey]);
      })
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [playersInSport, drillKey, store.data.drillCompletions]);

  const toggleStudentSelection = (playerId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const selectAllVisible = () => {
    setSelectedStudentIds(displayPlayers.map((p: any) => p.id));
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleMasteryToggle = async (playerId: string, mastered: boolean) => {
    const opId = playerId + "_" + drillKey;
    setIsProcessing(opId);
    const player = store.data.players.find((p: any) => p.id === playerId);

    if (mastered) {
      store.setDrillCompletion(drillKey, playerId, true, {
        sportName: activeSport,
        drillName: activeDrill,
        gender: player?.gender || 'Male',
        std: player?.std || ''
      });
      toast({ title: "Mastery Logged", description: `${player?.name || 'Player'} marked complete for ${activeDrill}.`, className: "bg-emerald-600 text-white" });
    } else {
      toast({ title: "Keep Practicing", description: `${player?.name} needs more practice.`, variant: "default" });
    }
    setIsProcessing(null);
  };

  // 1-Click Batch Mastery for All Selected/Attended Students
  const handleBatchMastery = async (mastered: boolean) => {
    if (selectedStudentIds.length === 0) {
      toast({ title: "No Students Selected", description: "Please select at least one student.", variant: "destructive" });
      return;
    }

    setIsBatchProcessing(true);
    let count = 0;

    selectedStudentIds.forEach(playerId => {
      const player = store.data.players.find((p: any) => p.id === playerId);
      store.setDrillCompletion(drillKey, playerId, mastered, {
        sportName: activeSport,
        drillName: activeDrill,
        gender: player?.gender || 'Male',
        std: player?.std || ''
      });
      count++;
    });

    toast({
      title: mastered ? "⚡ All Attended Logged!" : "Mastery Reset",
      description: mastered 
        ? `Successfully marked ${count} students complete for "${activeDrill}".`
        : `Reset drill status for ${count} students.`,
      className: mastered ? "bg-emerald-600 text-white font-bold" : undefined
    });

    setIsBatchProcessing(false);
  };

  const handleRestore = (playerId: string) => {
    store.setDrillCompletion(drillKey, playerId, false);
  };

  const availableDrills = SPORTS_DATA[activeSport]?.skills || [];

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      {/* Top Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1">
                ⚡ Select Only Drills Mode
              </Badge>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-bold">
                {presentCount > 0 ? `🟢 ${presentCount} Attended Today` : `👥 ${playersInSport.length} Total Athletes`}
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <UsersRound className="w-9 h-9 text-amber-500" /> {activeSport} Drills
            </h2>
            <p className="text-xs font-bold text-muted-foreground">
              सराव प्रकार निवडा — उपस्थित विद्यार्थी आपोआप निवडले जातील (Select any drill and attended students are auto-selected).
            </p>
          </div>

          {/* Controls: Date, Session, Sport */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {!preselectedSport && (
              <div className="w-full sm:w-44">
                <label className="text-[9px] font-black text-primary uppercase ml-1 block mb-1">खेळ (Sport)</label>
                <Select value={activeSport} onValueChange={(val) => {
                  setActiveSport(val);
                  if (SPORTS_DATA[val]) {
                    selectAttendedStudentsForDrill(SPORTS_DATA[val].skills[0], val);
                  }
                }}>
                  <SelectTrigger className="h-11 rounded-xl border-2 font-black uppercase text-[11px] bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {Object.keys(SPORTS_DATA).map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-full sm:w-36">
              <label className="text-[9px] font-black text-primary uppercase ml-1 block mb-1">तारीख (Date)</label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 font-bold text-xs rounded-xl border-2 bg-white shadow-sm"
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="text-[9px] font-black text-primary uppercase ml-1 block mb-1">सत्र (Session)</label>
              <Select value={selectedSession} onValueChange={(val: any) => setSelectedSession(val)}>
                <SelectTrigger className="h-11 rounded-xl border-2 font-black uppercase text-[11px] bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning" className="font-bold">🌅 Morning (सकाळ)</SelectItem>
                  <SelectItem value="Evening" className="font-bold">🌇 Evening (संध्याकाळ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 sm:pt-5 w-full sm:w-auto">
              <Button
                onClick={() => setGuideModalName(activeDrill)}
                variant="outline"
                className="h-11 border-2 border-amber-400/60 hover:bg-amber-50 text-amber-900 font-black text-xs uppercase rounded-xl px-4 shadow-sm flex items-center gap-1.5 w-full sm:w-auto"
              >
                <Info className="w-4 h-4 text-amber-600" /> Guide (माहिती)
              </Button>
            </div>
          </div>
        </div>

        {/* 🎯 "SELECT ONLY DRILLS" QUICK HORIZONTAL CHIPS CAROUSEL */}
        <div className="space-y-2 pt-2 border-t border-primary/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> 
              १. सराव प्रकार निवडा (Click Any Drill to Auto-Select Attended Athletes):
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {availableDrills.length} Drills Available
            </span>
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2 p-1">
              {availableDrills.map((drill, index) => {
                const isCurrent = activeDrill === drill;
                return (
                  <button
                    key={drill}
                    onClick={() => selectAttendedStudentsForDrill(drill, activeSport)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border-2 active:scale-95 shadow-sm",
                      isCurrent 
                        ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary/20 scale-105" 
                        : "bg-white hover:bg-primary/5 text-primary border-primary/20 hover:border-primary/50"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                      isCurrent ? "bg-white text-primary" : "bg-primary/10 text-primary"
                    )}>
                      {index + 1}
                    </span>
                    <span>{drill}</span>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* 🚀 ACTIVE DRILL & AUTOMATIC ATTENDANCE ACTION BAR */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 p-6 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-emerald-500/30">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md">
              चालू ड्रिल (Active Drill)
            </span>
            <span className="text-emerald-200 text-xs font-bold">
              {selectedSession} Session • {selectedDate}
            </span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
            <Trophy className="w-6 h-6 text-amber-300 shrink-0" />
            <span>{activeDrill}</span>
          </h3>
          <p className="text-xs text-emerald-100 font-medium">
            🎯 <span className="font-black text-amber-300">{selectedStudentIds.length}</span> उपस्थित विद्यार्थी आपोआप निवडले गेले आहेत. (Attended students ready for 1-click mastery logging)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-emerald-950/40 p-1.5 rounded-xl border border-emerald-600/50">
            <button
              onClick={selectAllVisible}
              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> सर्व निवडा (All)
            </button>
            <button
              onClick={deselectAll}
              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> क्लिअर (Clear)
            </button>
          </div>

          <Button
            onClick={() => handleBatchMastery(true)}
            disabled={isBatchProcessing || selectedStudentIds.length === 0}
            className="h-12 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl px-6 shadow-lg active:scale-95 flex items-center gap-2 border border-amber-300"
          >
            {isBatchProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-slate-950" />
            )}
            <span>उपस्थित {selectedStudentIds.length} खेळाडूंना नोंदवा (1-Click Log)</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid: Squads & Mastery Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Athletes List */}
        <Card className="lg:col-span-8 border-2 rounded-[2.5rem] bg-white shadow-xl min-h-[600px] flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 md:p-8">
            <div>
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" /> Ground Practice Pool
              </CardTitle>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">
                {filterMode === 'attended_only' ? 'फक्त उपस्थित खेळाडू दाखवले आहेत (Showing Attended Only)' : 'सर्व खेळाडू दाखवले आहेत (Showing All)'}
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white p-1 rounded-xl border-2 border-primary/10 shadow-sm text-xs font-bold">
                <button
                  onClick={() => setFilterMode('attended_only')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-black transition-all text-[10px] uppercase",
                    filterMode === 'attended_only' 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  🟢 केवळ उपस्थित ({presentCount > 0 ? presentCount : displayPlayers.length})
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-black transition-all text-[10px] uppercase",
                    filterMode === 'all' 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  👥 सर्व खेळाडू ({playersInSport.length})
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 flex-1 bg-muted/5">
            <ScrollArea className="h-full max-h-[750px]">
              <div className="space-y-10 pr-2">
                {Object.entries(groupedSquads).map(([cat, squad]) => (
                  <div key={cat} className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-primary/5 pb-2">
                      <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" /> {cat} Athletes
                      </h3>
                      <Badge variant="secondary" className="bg-primary/5 text-primary font-black text-[9px] px-3">
                        {squad.length} Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {squad.map((player: any) => {
                        const isSelected = selectedStudentIds.includes(player.id);
                        const att = getAttendanceStatus(player.id);
                        const isAttended = att.status === 'P';

                        return (
                          <div 
                            key={player.id} 
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all shadow-sm bg-white",
                              isSelected 
                                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30" 
                                : "border-primary/5 hover:border-primary/20"
                            )}
                          >
                            {/* Selection Checkbox & Player Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleStudentSelection(player.id)}
                                className={cn(
                                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                  isSelected 
                                    ? "bg-emerald-600 border-emerald-600 text-white" 
                                    : "border-slate-300 hover:border-primary bg-white"
                                )}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div 
                                onClick={() => setSelectedAthleteForPhoto(player)}
                                className="flex items-center gap-2.5 cursor-pointer group/athlete hover:opacity-80 transition-opacity min-w-0"
                                title="खेळाडूचा फोटो व माहिती पाहण्यासाठी क्लिक करा"
                              >
                                <div className="relative shrink-0">
                                  <Avatar className="w-10 h-10 border-2 border-primary/10 shadow-sm group-hover/athlete:ring-2 group-hover/athlete:ring-amber-400 transition-all">
                                    <AvatarImage src={player.photoUrl} className="object-cover" />
                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                                      {player.name?.[0] || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 bg-slate-900 text-amber-400 p-0.5 rounded-full shadow-xs">
                                    <ZoomIn className="w-2.5 h-2.5" />
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <p className="font-black text-xs uppercase text-primary leading-tight truncate max-w-[130px] group-hover/athlete:text-amber-600 transition-colors">
                                    {player.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">
                                      Std {player.std || '-'}
                                    </span>
                                    <span className={cn(
                                      "text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded",
                                      isAttended 
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                                        : att.status === 'A'
                                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                    )}>
                                      {isAttended ? '🟢 Present' : att.status === 'A' ? '🔴 Absent' : '⚪ Unmarked'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button 
                                onClick={() => handleMasteryToggle(player.id, false)} 
                                disabled={!!isProcessing} 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-destructive border-2 hover:bg-destructive/10 rounded-lg"
                                title="पुन्हा सराव करा (Needs Practice)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleMasteryToggle(player.id, true)} 
                                disabled={!!isProcessing} 
                                className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active-scale rounded-lg"
                                title="सराव पूर्ण (Mark Mastered)"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      {squad.length === 0 && (
                        <div className="col-span-full py-8 text-center opacity-30 border-2 border-dashed rounded-2xl">
                          <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <p className="text-[9px] font-black uppercase">No {cat} athletes pending</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right 4 Cols: Mastery Archive */}
        <Card className="lg:col-span-4 border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary p-6 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-amber-400" /> Mastery Archive
              </CardTitle>
              <Badge className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5">
                {masteredThisDrill.length} Mastered
              </Badge>
            </div>
            <p className="text-[10px] text-primary-foreground/80 font-bold uppercase tracking-wider mt-1 truncate">
              {activeDrill}
            </p>
          </CardHeader>

          <ScrollArea className="flex-1 max-h-[650px]">
            <CardContent className="p-6 space-y-3">
              {masteredThisDrill.map((p: any) => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 group animate-in slide-in-from-right-4 duration-300"
                >
                  <div 
                    onClick={() => setSelectedAthleteForPhoto(p)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    title="खेळाडूचा फोटो पहा"
                  >
                    <Avatar className="w-8 h-8 border border-emerald-300">
                      <AvatarImage src={p.photoUrl} className="object-cover" />
                      <AvatarFallback className="bg-emerald-200 text-emerald-900 text-[9px] font-black">
                        {p.name?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-[10px] text-emerald-800 uppercase truncate max-w-[130px]">
                        {p.name}
                      </p>
                      <span className="text-[8px] font-bold text-emerald-600/70 uppercase block">
                        Logged Today • Std {p.std || '-'}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRestore(p.id)} 
                    className="h-7 w-7 text-emerald-600 hover:bg-emerald-200 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                    title="काढून टाका (Restore)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {masteredThisDrill.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No logs archived yet</p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <YogaPtGuideModal 
        guideName={guideModalName} 
        isOpen={!!guideModalName} 
        onClose={() => setGuideModalName(null)} 
      />

      {/* ATHLETE PHOTO & PROFILE LIGHTBOX */}
      <Dialog open={!!selectedAthleteForPhoto} onOpenChange={() => setSelectedAthleteForPhoto(null)}>
        <DialogContent className="sm:max-w-[480px] p-5 bg-slate-950 text-white border-2 border-amber-400/40 rounded-3xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center justify-between">
              <span>👤 {selectedAthleteForPhoto?.name}</span>
              <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5">
                इयत्ता (Std) {selectedAthleteForPhoto?.std || 'N/A'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {selectedAthleteForPhoto?.photoUrl ? (
                <img 
                  src={selectedAthleteForPhoto.photoUrl} 
                  alt={selectedAthleteForPhoto.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <User className="w-16 h-16 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold uppercase">फोटो उपलब्ध नाही (No Photo)</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-bold">खेळ (Sports):</span>
                <span className="font-black text-amber-400">
                  {Array.isArray(selectedAthleteForPhoto?.sports) ? selectedAthleteForPhoto.sports.join(', ') : (selectedAthleteForPhoto?.sports || activeSport)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-bold">प्रवर्ग (Category):</span>
                <span className="font-black text-white uppercase">{selectedAthleteForPhoto?.category || 'Athlete'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-bold">चालू सराव ड्रिल (Active Drill):</span>
                <span className="font-black text-emerald-400 truncate max-w-[220px]">{activeDrill}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              onClick={() => setSelectedAthleteForPhoto(null)}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs rounded-xl"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
