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
  Scan,
  Fingerprint,
  Hash,
  Ruler,
  Trophy,
  GraduationCap,
  Medal,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    if (stream) stream.getTracks().forEach(track => track.stop());
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error' });
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
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
        if (activeCam === 'profile') setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
        else setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: dataUrl });
        stopCamera();
      }
    }
  };

  const isGeneral = section === 'general';

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
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, searchTerm, selectedSport]);

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      const updatedCategory = (editingPlayer.sports && editingPlayer.sports.length > 0) ? 'athlete' : editingPlayer.category;
      store.updatePlayer({ ...editingPlayer, category: updatedCategory });
      
      if (Object.values(monthlyPerformance).some(v => v !== '')) {
         store.setFitness(editingPlayer.id, {
           ...store.data.fitness[editingPlayer.id],
           ...monthlyPerformance,
           updatedAt: new Date().toISOString(),
           score: store.data.fitness[editingPlayer.id]?.score || "0",
           status: store.data.fitness[editingPlayer.id]?.status || "Developing"
         });
      }
      setEditingPlayer(null);
      toast({ title: "Registry Updated", description: "Identity and performance records archived." });
    }
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border">
            {isGeneral ? <GraduationCap className="w-5 h-5 text-primary" /> : <Medal className="w-5 h-5 text-primary" />}
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isGeneral ? 'Student Registry' : 'Athlete Roster'}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {!isGeneral && (
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full md:w-[180px] h-11 rounded-full bg-muted/30 border-none font-black uppercase text-[10px]"><SelectValue placeholder="Sport" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL GAMES</SelectItem>
                {SPORTS_LIST.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name/GR/Aadhar..." 
              className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner" 
              value={searchTerm} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="google-card overflow-hidden overflow-x-auto border">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase w-[100px]">Roll (Sr)</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase">Athlete Profile</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-center">GR Number</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-center">Standard</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-center">Identity (Aadhar)</TableHead>
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-24 opacity-30 font-black uppercase tracking-widest">No records found</TableCell></TableRow>
            ) : (
              filteredPlayers.map((p: any) => {
                return (
                  <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors border-b last:border-0">
                    <TableCell className="px-6">
                       <Badge className="bg-primary/10 text-primary font-black text-sm border-0 h-10 w-10 flex items-center justify-center rounded-xl shadow-inner">
                         {p.serialNumber || '0'}
                       </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                          <AvatarImage src={p.photoUrl} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-sm uppercase text-primary leading-none">{p.name || "UNNAMED"}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{p.gender}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                       <span className="font-black text-xs text-primary/80 bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                         {p.generalRegisterNumber || '---'}
                       </span>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-[10px] font-black text-primary bg-primary/5">Std {p.std}</Badge>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-black text-[10px] text-primary/60">{p.aadharNumber || 'Aadhar Pend.'}</span>
                        {p.mobileNumber && <span className="text-[8px] font-bold text-muted-foreground mt-0.5">{p.mobileNumber}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/5" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive/5" onClick={() => store.deletePlayer(p.id)}><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="sm:max-w-[950px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0 relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Profile & Performance Editor</DialogTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">{editingPlayer?.name}</p>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="bg-muted/50 p-2 h-auto gap-4 rounded-none border-b shrink-0 px-10">
              <TabsTrigger value="profile" className="rounded-xl py-3 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Full Registry Info</TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl py-3 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white">Monthly Registry</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {editingPlayer && (
                <>
                <TabsContent value="profile" className="p-8 m-0 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                     <div className="md:col-span-4 space-y-8">
                        <div className="space-y-4">
                          <Label className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2 ml-2"><ImageIcon className="w-4 h-4" /> Identity Photo</Label>
                          <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-xl">
                             {activeCam === 'profile' ? (
                               <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                             ) : editingPlayer.photoUrl ? (
                               <div className="relative w-full h-full">
                                 <Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                               </div>
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
                        </div>
                     </div>

                     <div className="md:col-span-8 space-y-10">
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                              <Hash className="w-5 h-5" />
                              <h4 className="font-black uppercase text-sm tracking-widest">Institutional Identity</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Std</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
                                 <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Roll No</Label><Input value={editingPlayer.serialNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-black text-center" /></div>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">GR Number</Label><Input value={editingPlayer.generalRegisterNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Gender</Label><Select value={editingPlayer.gender} onValueChange={(v: any) => setEditingPlayer({...editingPlayer, gender: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Aadhar (12 Digits)</Label><Input value={editingPlayer.aadharNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-mono" maxLength={12} /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Mobile Number</Label><Input value={editingPlayer.mobileNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-mono" /></div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                              <Ruler className="w-5 h-5" />
                              <h4 className="font-black uppercase text-sm tracking-widest">Physical & Medical</h4>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Standing (cm)</Label><Input type="number" value={editingPlayer.height} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Weight (kg)</Label><Input type="number" value={editingPlayer.weight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Blood Group</Label><Select value={editingPlayer.bloodGroup} onValueChange={v => setEditingPlayer({...editingPlayer, bloodGroup: v})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
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
                           <h4 className="font-black uppercase text-primary">Monthly Technical Scores</h4>
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
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">100m Sprint (sec)</Label><Input value={monthlyPerformance.running100m} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlyPerformance({...monthlyPerformance, running100m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">200m Sprint (sec)</Label><Input value={monthlyPerformance.running200m} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlyPerformance({...monthlyPerformance, running200m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">400m Sprint (sec)</Label><Input value={monthlyPerformance.running400m} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlyPerformance({...monthlyPerformance, running400m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                         </div>
                      </div>
                   </div>
                </TabsContent>
                </>
              )}
            </div>

            <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
              <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-10 h-14 font-black uppercase text-[10px] tracking-widest">Discard</Button>
              <Button onClick={handleUpdatePlayer} className="bg-primary px-20 rounded-full font-black uppercase text-[10px] shadow-2xl text-white h-14 active-scale">
                Save & Archive Profile
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
