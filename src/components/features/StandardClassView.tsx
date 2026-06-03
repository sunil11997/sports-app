"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Zap, 
  Scale, 
  Calendar,
  Clock,
  Printer,
  FileBarChart,
  Target,
  Edit,
  Camera,
  CircleX,
  ImageIcon,
  Scan,
  Fingerprint,
  Upload,
  Hash,
  Ruler,
  HeartPulse,
  RefreshCcw,
  Baby,
  ShieldCheck,
  Phone,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Player } from '@/lib/types';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function StandardClassView({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
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

  const students = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

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
      toast({ title: "Profile Updated", description: "Registry synchronized." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Standard {std} Overview</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {students.length} Enrolled Students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-6 h-10 rounded-full bg-white hidden lg:flex items-center gap-2">
             <Zap className="w-3.5 h-3.5 text-accent" /> v4.0.0 Engine
           </Badge>
           <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-black uppercase text-xs shadow-lg">
             <Printer className="w-4 h-4 mr-2" /> Print Summary
           </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase pl-8">Name</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Ht/Wt</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Identity</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id} className="hover:bg-primary/5 h-16">
                  <TableCell className="font-bold text-xs pl-8 uppercase text-primary">{student.name}</TableCell>
                  <TableCell className="text-center text-[10px] font-bold">
                    {student.height}cm / {student.weight}kg
                  </TableCell>
                  <TableCell className="text-center text-[10px] font-mono font-black text-primary/60">
                    {student.generalRegisterNumber || student.aadharNumber || 'Pending'}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={() => setEditingPlayer(student)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[950px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0 relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Profile Edit</DialogTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">{editingPlayer?.name}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
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
                          <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-xl">
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
                          {!activeCam && (
                            <Button onClick={() => startCamera('profile')} variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px]"><Camera className="w-4 h-4 mr-2" /> Recapture</Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2 ml-2"><Scan className="w-4 h-4" /> Aadhar Scan</Label>
                          <div className="relative aspect-[1.6/1] rounded-[1.5rem] overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20">
                             {activeCam === 'aadhar' ? (
                               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                             ) : editingPlayer.aadharPhotoUrl ? (
                               <div className="relative w-full h-full">
                                 <Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" />
                               </div>
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Fingerprint className="w-10 h-10" /></div>
                             )}
                          </div>
                          <Button variant="ghost" onClick={() => startCamera('aadhar', 'environment')} className="w-full h-10 font-black uppercase text-[9px] hover:bg-primary/5">Update Doc</Button>
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-10">
                         <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                              <Hash className="w-5 h-5" />
                              <h4 className="font-black uppercase text-sm tracking-widest">Institutional Identity</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Std</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
                                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Roll No</Label><Input value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-black text-center" /></div>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">GR Number</Label><Input value={editingPlayer.generalRegisterNumber} onChange={e => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Gender</Label><Select value={editingPlayer.gender} onValueChange={(v: any) => setEditingPlayer({...editingPlayer, gender: v})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Aadhar (12 Digits)</Label><Input value={editingPlayer.aadharNumber} onChange={e => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-mono" maxLength={12} /></div>
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Mobile Number</Label><Input value={editingPlayer.mobileNumber} onChange={e => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-mono" /></div>
                            </div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Physical Address</Label><Input value={editingPlayer.address} onChange={e => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 border-2 rounded-xl" /></div>
                         </div>

                         <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                               <Ruler className="w-5 h-5" />
                               <h4 className="font-black uppercase text-sm tracking-widest">Physical & Medical</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Standing (cm)</Label><Input type="number" value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Sitting (cm)</Label><Input type="number" value={editingPlayer.sittingHeight} onChange={e => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Weight (kg)</Label><Input type="number" value={editingPlayer.weight} onChange={e => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                               <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Blood Group</Label><Select value={editingPlayer.bloodGroup} onValueChange={v => setEditingPlayer({...editingPlayer, bloodGroup: v})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Medical Alerts</Label><Textarea value={editingPlayer.medical} onChange={e => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="min-h-[80px] border-2 rounded-xl" /></div>
                         </div>

                         <div className="space-y-4 p-8 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20">
                            <Label className="font-black text-accent uppercase text-[10px] tracking-[0.2em] block mb-4">Assign Sports Participation</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                               {SPORTS_LIST.map(sport => (
                                 <div key={sport} className="flex items-center gap-2">
                                   <Checkbox 
                                     id={`class-edit-sport-${sport}`}
                                     checked={editingPlayer.sports?.includes(sport)} 
                                     onCheckedChange={(checked) => {
                                       const curr = editingPlayer.sports || [];
                                       const next = checked ? [...curr, sport] : curr.filter(s => s !== sport);
                                       setEditingPlayer({...editingPlayer, sports: next});
                                     }} 
                                     className="w-4 h-4 border-accent/30"
                                   />
                                   <label htmlFor={`class-edit-sport-${sport}`} className="text-[10px] font-black uppercase text-foreground/70 cursor-pointer">{sport}</label>
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
                           <Zap className="w-8 h-8 text-accent animate-pulse" />
                        </div>
                        <div>
                           <h4 className="font-black uppercase text-primary text-xl">Monthly Performance Log</h4>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Archiving: {format(new Date(), 'MMMM yyyy')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] px-6 py-1.5 rounded-full bg-white">v4.0.0 Engine</Badge>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                            <Activity className="w-5 h-5 text-accent" />
                            <h5 className="font-black uppercase text-sm tracking-widest">Track (Runs)</h5>
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">100m Sprint (s)</Label><Input value={monthlyPerformance.running100m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running100m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">200m Sprint (s)</Label><Input value={monthlyPerformance.running200m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running200m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">400m Sprint (s)</Label><Input value={monthlyPerformance.running400m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running400m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" placeholder="00.00" /></div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                            <Target className="w-5 h-5 text-accent" />
                            <h5 className="font-black uppercase text-sm tracking-widest">Throws & Jumps</h5>
                         </div>
                         <div className="space-y-6">
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
                </TabsContent>
                </>
              )}
            </div>

            <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
              <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-10 h-14 font-black uppercase text-[10px] tracking-widest">Discard</Button>
              <Button onClick={handleUpdatePlayer} className="bg-primary px-20 rounded-full font-black uppercase text-[10px] shadow-2xl text-white h-14 active-scale">
                Save & Archive snapshot
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
