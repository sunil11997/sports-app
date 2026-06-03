"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Search, 
  Trash2, 
  Camera, 
  CircleX, 
  RefreshCcw,
  ImageIcon,
  Filter,
  Scan,
  Fingerprint,
  Upload,
  Hash,
  Ruler,
  HeartPulse,
  UserPlus,
  Trophy,
  Flame,
  ShieldCheck,
  GraduationCap,
  Medal,
  Info,
  Baby,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { format, subDays } from 'date-fns';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

interface DashboardProps {
  store: any;
  section: 'sports' | 'general';
  searchTerm?: string;
  selectedSport?: string;
  t: any;
}

export function Dashboard({ store, section, searchTerm: initialSearch = "", selectedSport: initialSport = "all" }: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [monthlyPerformance, setMonthlyPerformance] = useState<any>({});
  const [convertingPlayer, setConvertingPlayer] = useState<Player | null>(null);
  const [selectedSportsForConversion, setSelectedSportsForConversion] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

  useEffect(() => {
    if (editingPlayer) {
      // Load current month's performance data if it exists
      const currentMonth = format(new Date(), 'yyyy-MM');
      const existing = store.data.fitness[editingPlayer.id] || {};
      setMonthlyPerformance({
        month: currentMonth,
        running100m: existing.running100m || '',
        running200m: existing.running200m || '',
        running400m: existing.running400m || '',
        shotPut: existing.shotPut || '',
        javelin: existing.javelin || '',
        discThrow: existing.discThrow || '',
        longJump: existing.longJump || '',
        highJump: existing.highJump || ''
      });
    }
  }, [editingPlayer, store.data.fitness]);

  const startCamera = async (type: 'profile' | 'aadhar', mode: 'user' | 'environment' = 'user') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Enable camera permissions.' });
    }
  };

  const toggleCamera = () => {
    if (!activeCam) return;
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(activeCam, nextMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActiveCam(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && activeCam && editingPlayer) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (activeCam === 'profile') {
          setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
        } else {
          setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: dataUrl });
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setEditingPlayer({ ...editingPlayer, photoUrl: reader.result as string });
        } else {
          setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: reader.result as string });
        }
        toast({ title: "Photo Updated" });
      };
      reader.readAsDataURL(file);
    }
  };

  const isGeneral = section === 'general';

  const getAgeRank = useCallback((age: number) => {
    if (age < 14) return 1;
    if (age < 17) return 2;
    return 3;
  }, []);

  const checkStreak = useCallback((playerId: string) => {
    const attendance = store.data.attendance || {};
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 15; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      if (attendance[`${playerId}_${d}_Morning`] === 'P' || attendance[`${playerId}_${d}_Evening`] === 'P') streak++;
      else break;
    }
    return streak >= 15;
  }, [store.data.attendance]);

  const checkRecoveryChampion = useCallback((playerId: string) => {
    const health = store.data.healthIncidents || [];
    const fitness = store.data.fitness || {};
    const hadCritical = health.some((h: any) => h.playerId === playerId && h.severity === 'Critical');
    const fit = fitness[playerId] || {};
    return hadCritical && (fit.status === 'Elite' || fit.status === 'Optimal');
  }, [store.data.healthIncidents, store.data.fitness]);

  const filteredPlayers = useMemo(() => {
    const baseList = store.data.players || [];
    return baseList
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const nameMatch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const aadharMatch = (p.aadharNumber || "").includes(searchTerm);
        const grMatch = (p.generalRegisterNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || aadharMatch || grMatch;
        const matchesSport = selectedSport === 'all' || (p.sports && p.sports.includes(selectedSport));
        
        return matchesSection && matchesSearch && matchesSport;
      })
      .sort((a: any, b: any) => {
        if (isGeneral) {
          const stdA = parseInt(a.std) || 0;
          const stdB = parseInt(b.std) || 0;
          if (stdA !== stdB) return stdA - stdB;
          return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
        } else {
          const ageRankA = getAgeRank(parseInt(a.age) || 0);
          const ageRankB = getAgeRank(parseInt(b.age) || 0);
          if (ageRankA !== ageRankB) return ageRankA - ageRankB;
          if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
          return (a.name || "").localeCompare(b.name || "");
        }
      });
  }, [store.data.players, isGeneral, searchTerm, selectedSport, getAgeRank]);

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      // Auto-promote to athlete if sports are assigned
      const updatedCategory = (editingPlayer.sports && editingPlayer.sports.length > 0) ? 'athlete' : editingPlayer.category;
      
      // Save Player Info
      store.updatePlayer({ ...editingPlayer, category: updatedCategory });
      
      // Save Monthly Performance
      if (Object.values(monthlyPerformance).some(v => v !== '')) {
         store.setFitness(editingPlayer.id, {
           ...store.data.fitness[editingPlayer.id],
           ...monthlyPerformance,
           month: monthlyPerformance.month,
           updatedAt: new Date().toISOString(),
           score: store.data.fitness[editingPlayer.id]?.score || "0",
           status: store.data.fitness[editingPlayer.id]?.status || "Developing"
         });
      }

      setEditingPlayer(null);
      toast({ title: "Record Updated", description: "Institutional registry successfully synchronized." });
    }
  };

  const handleConvertAction = () => {
    if (convertingPlayer) {
      store.updatePlayer({
        ...convertingPlayer,
        category: 'athlete',
        sports: selectedSportsForConversion
      });
      toast({ 
        title: "Promotion Success", 
        description: `${convertingPlayer.name} has been promoted to the Athlete Roster.` 
      });
      setConvertingPlayer(null);
      setSelectedSportsForConversion([]);
    }
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
            {isGeneral ? <GraduationCap className="w-5 h-5 text-primary" /> : <Medal className="w-5 h-5 text-primary" />}
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isGeneral ? 'Student Registry' : 'Athlete Roster'}</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {!isGeneral && (
            <div className="relative">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-full md:w-[180px] h-11 rounded-full bg-muted/30 border-none shadow-inner font-black uppercase text-[10px]">
                  <Filter className="w-3.5 h-3.5 mr-2 opacity-40" />
                  <SelectValue placeholder="Sport Wise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL GAMES</SelectItem>
                  {SPORTS_LIST.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name..." className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="google-card overflow-hidden overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground w-[80px]">Sr No</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground">Student Profile</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">{isGeneral ? 'Standard' : 'Performance Badges'}</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">{isGeneral ? 'Aadhar' : 'Participating Sports'}</TableHead>
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 opacity-30 font-black uppercase tracking-widest">No records found</TableCell></TableRow>
            ) : (
              filteredPlayers.map((p: any) => {
                const isStreak = checkStreak(p.id);
                const isFighter = checkRecoveryChampion(p.id);
                return (
                  <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors border-b last:border-0">
                    <TableCell className="px-6 text-sm font-black text-primary/60">#{p.serialNumber || '0'}</TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-11 h-11 border-2 border-white shadow-sm">
                          <AvatarImage src={p.photoUrl} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-sm uppercase text-primary leading-none">{p.name || "UNNAMED STUDENT"}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{p.gender} &bull; GR: {p.generalRegisterNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      {isGeneral ? (
                        <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/20 text-[10px] font-black text-primary bg-primary/5">Std {p.std}</Badge>
                      ) : (
                        <div className="flex justify-center gap-2">
                           {isStreak && (
                             <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm" title="Consistency King (15+ Days)">
                               <Flame className="w-4 h-4 text-emerald-600" />
                             </div>
                           )}
                           {isFighter && (
                             <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm" title="Recovery Champion">
                               <ShieldCheck className="w-4 h-4 text-blue-600" />
                             </div>
                           )}
                           {!isStreak && !isFighter && <Badge variant="outline" className="text-[8px] font-black opacity-30">No Badges</Badge>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      {isGeneral ? (
                        <span className="font-mono font-black text-xs text-primary/70">{p.aadharNumber || 'Pending'}</span>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1">
                          {(p.sports || []).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[8px] font-black border-accent/30 text-accent uppercase px-1.5">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {isGeneral && p.category === 'student' && (
                          <Button variant="ghost" size="icon" title="Convert to Athlete" className="rounded-full hover:bg-emerald-50 text-emerald-600" onClick={() => { setConvertingPlayer(p); setSelectedSportsForConversion([]); }}>
                            <Trophy className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/5 text-destructive" onClick={() => store.deletePlayer(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[900px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-10 text-white shrink-0 relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-left">
                <DialogTitle className="text-3xl font-black uppercase tracking-tight">Institutional Profile Registry</DialogTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Restoring identity for: {editingPlayer?.name}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>
          
          <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="bg-muted/50 p-2 h-auto gap-4 rounded-none border-b shrink-0 px-10">
              <TabsTrigger value="profile" className="rounded-xl py-3 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Student Info</TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl py-3 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white">Monthly Registry</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {editingPlayer && (
                <>
                <TabsContent value="profile" className="p-10 m-0 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                     <div className="md:col-span-4 space-y-8">
                        <div className="space-y-4">
                          <Label className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2 ml-2"><ImageIcon className="w-4 h-4" /> Identity Photo</Label>
                          <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-xl">
                             {activeCam === 'profile' ? (
                               <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                             ) : editingPlayer.photoUrl ? (
                               <Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12" /></div>
                             )}
                             {activeCam === 'profile' && (
                               <div className="absolute bottom-4 inset-x-4 flex flex-col gap-2 z-20">
                                 <Button onClick={takePhoto} className="w-full bg-accent text-white h-12 rounded-xl font-black uppercase">Capture</Button>
                                 <Button onClick={stopCamera} variant="destructive" className="w-full h-10 rounded-xl">Cancel</Button>
                               </div>
                             )}
                          </div>
                          {!activeCam && (
                            <Button onClick={() => startCamera('profile')} variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px]"><Camera className="w-4 h-4 mr-2" /> Recapture Photo</Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2 ml-2"><Scan className="w-4 h-4" /> Aadhar Scan</Label>
                          <div className="relative aspect-[1.6/1] rounded-[1.5rem] overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20">
                             {activeCam === 'aadhar' ? (
                               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                             ) : editingPlayer.aadharPhotoUrl ? (
                               <Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" />
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Fingerprint className="w-10 h-10" /></div>
                             )}
                          </div>
                          <Button variant="ghost" onClick={() => startCamera('aadhar', 'environment')} className="w-full h-10 font-black uppercase text-[9px] hover:bg-primary/5">Update Document</Button>
                        </div>
                     </div>

                     <div className="md:col-span-8 space-y-10">
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                              <Hash className="w-5 h-5 text-accent" />
                              <h4 className="font-black uppercase text-sm tracking-widest">Registry Data</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Std</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
                                 <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Roll (Sr)</Label><Input value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-black text-center" /></div>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">GR Number</Label><Input value={editingPlayer.generalRegisterNumber} onChange={e => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Gender</Label><Select value={editingPlayer.gender} onValueChange={(v: any) => setEditingPlayer({...editingPlayer, gender: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Birth Date</Label><Input type="date" value={editingPlayer.dob} onChange={e => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Blood Group</Label><Select value={editingPlayer.bloodGroup} onValueChange={v => setEditingPlayer({...editingPlayer, bloodGroup: v})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                              <Ruler className="w-5 h-5 text-accent" />
                              <h4 className="font-black uppercase text-sm tracking-widest">Physical Profile</h4>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Standing (cm)</Label><Input type="number" value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1"><Baby className="w-3 h-3" /> Sitting (cm)</Label><Input type="number" value={editingPlayer.sittingHeight} onChange={e => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Weight (kg)</Label><Input type="number" value={editingPlayer.weight} onChange={e => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                           </div>
                        </div>

                        <div className="space-y-4 p-8 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20">
                           <Label className="font-black text-accent uppercase text-[10px] tracking-[0.2em] mb-4 block">Athletic Participation (Selected Games)</Label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
                              {SPORTS_LIST.map(sport => (
                                <div key={sport} className="flex items-center gap-3">
                                  <Checkbox 
                                    id={`edit-sport-${sport}`}
                                    checked={editingPlayer.sports?.includes(sport)} 
                                    onCheckedChange={(checked) => {
                                      const curr = editingPlayer.sports || [];
                                      const next = checked ? [...curr, sport] : curr.filter(s => s !== sport);
                                      setEditingPlayer({...editingPlayer, sports: next});
                                    }} 
                                    className="w-5 h-5 border-accent/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                  />
                                  <label htmlFor={`edit-sport-${sport}`} className="text-[11px] font-black uppercase text-foreground/80 cursor-pointer">{sport}</label>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="p-10 m-0 space-y-10">
                   <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                           <Zap className="w-6 h-6 text-accent animate-pulse" />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-primary uppercase">Monthly Technical Scores</h4>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Archiving: {format(new Date(), 'MMMM yyyy')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] px-6 py-1.5 rounded-full bg-white">Performance Hub</Badge>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                           <Activity className="w-5 h-5 text-accent" />
                           <h5 className="font-black uppercase text-sm tracking-widest">Track & Field (Runs)</h5>
                         </div>
                         <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">100m Sprint (sec)</Label><Input value={monthlyPerformance.running100m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running100m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">200m Sprint (sec)</Label><Input value={monthlyPerformance.running200m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running200m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">400m Sprint (sec)</Label><Input value={monthlyPerformance.running400m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running400m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                           <Target className="w-5 h-5 text-accent" />
                           <h5 className="font-black uppercase text-sm tracking-widest">Field & Technical Events</h5>
                         </div>
                         <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Shot Put (m)</Label><Input value={monthlyPerformance.shotPut} onChange={e => setMonthlyPerformance({...monthlyPerformance, shotPut: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Javelin (m)</Label><Input value={monthlyPerformance.javelin} onChange={e => setMonthlyPerformance({...monthlyPerformance, javelin: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Disc Throw (m)</Label><Input value={monthlyPerformance.discThrow} onChange={e => setMonthlyPerformance({...monthlyPerformance, discThrow: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Long Jump (m)</Label><Input value={monthlyPerformance.longJump} onChange={e => setMonthlyPerformance({...monthlyPerformance, longJump: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                            </div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">High Jump (m)</Label><Input value={monthlyPerformance.highJump} onChange={e => setMonthlyPerformance({...monthlyPerformance, highJump: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted text-center space-y-4">
                      <div className="flex items-center justify-center gap-3 text-primary/40">
                         <ShieldCheck className="w-5 h-5" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Monthly records will accumulate in the Performance Dossier History.</p>
                      </div>
                   </div>
                </TabsContent>
                </>
              )}
            </div>

            <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
              <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-10 h-14 font-black uppercase text-[10px] tracking-widest">Discard</Button>
              <Button onClick={handleUpdatePlayer} className="bg-primary px-20 rounded-full font-black uppercase text-[10px] shadow-2xl text-white h-14 tracking-[0.2em] active-scale">
                Save & Synchronize Registry
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!convertingPlayer} onOpenChange={() => setConvertingPlayer(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-emerald-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Athlete Promotion</DialogTitle>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">Assign sports to: {convertingPlayer?.name}</p>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <Label className="font-black text-primary uppercase text-[10px] tracking-widest ml-1">Select Specialized Sports</Label>
              <div className="grid grid-cols-2 gap-4">
                {SPORTS_LIST.map(sport => (
                  <div key={sport} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all">
                    <Checkbox 
                      id={`convert-${sport}`}
                      checked={selectedSportsForConversion.includes(sport)} 
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedSportsForConversion([...selectedSportsForConversion, sport]);
                        else setSelectedSportsForConversion(selectedSportsForConversion.filter(s => s !== sport));
                      }}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <label htmlFor={`convert-${sport}`} className="text-[10px] font-black uppercase text-foreground/70 cursor-pointer">{sport}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t gap-3 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setConvertingPlayer(null)} className="flex-1 font-black uppercase text-[10px] h-12 rounded-xl">Cancel</Button>
            <Button onClick={handleConvertAction} disabled={selectedSportsForConversion.length === 0} className="flex-1 bg-emerald-600 text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active-scale">
              Promote to Athlete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} hidden />
    </div>
  );
}
