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
  ShieldCheck
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
  
  // Camera & Image state
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

  const calculateBMI = (h: string, w: string) => {
    const height = parseFloat(h) / 100;
    const weight = parseFloat(w);
    if (!height || !weight) return "0.0";
    return (weight / (height * height)).toFixed(1);
  };

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
      
      // Monthly Performance Save
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
      toast({ title: "Profile Updated", description: "Registry synchronized." });
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Class Profile - Std ${std}</title>
          <style>
            @media print { 
              @page { size: A4; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1e3a8a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
            h2 { color: #1b4b3a; margin-top: 30px; text-transform: uppercase; font-size: 12px; border-left: 4px solid #f59e0b; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background: #f8f8f8; font-weight: 800; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn">Back</button>
            <button onclick="window.print()" class="btn btn-print">Print</button>
          </div>
          <h1>Standard ${std} - Registry Summary</h1>
          <table>
            <thead><tr><th>SNR</th><th>Name</th><th>GR No</th><th>Ht</th><th>Wt</th><th>BMI</th></tr></thead>
            <tbody>
              ${students.map((s: any) => `<tr><td>${s.serialNumber || '-'}</td><td>${s.name}</td><td>${s.generalRegisterNumber || '-'}</td><td>${s.height}</td><td>${s.weight}</td><td>${calculateBMI(s.height, s.weight)}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
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
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-black uppercase text-xs shadow-lg">
          <Printer className="w-4 h-4 mr-2" /> Print Summary
        </Button>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase pl-8">Name</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Height</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Weight</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">BMI</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const bmi = calculateBMI(student.height, student.weight);
                return (
                  <TableRow key={student.id} className="hover:bg-primary/5 h-16">
                    <TableCell className="font-bold text-xs pl-8 uppercase text-primary">{student.name}</TableCell>
                    <TableCell className="text-center text-xs font-bold">{student.height} cm</TableCell>
                    <TableCell className="text-center text-xs font-bold">{student.weight} kg</TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className="font-black text-[10px]">{bmi}</Badge></TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={() => setEditingPlayer(student)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[900px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-10 text-white shrink-0">
             <DialogTitle className="text-2xl font-black uppercase text-center">Institutional Identity Edit</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="bg-muted/50 p-2 h-auto gap-4 rounded-none border-b shrink-0 px-10">
              <TabsTrigger value="profile" className="rounded-xl py-3 px-8 font-black uppercase text-[10px]">Student Info</TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl py-3 px-8 font-black uppercase text-[10px]">Performance Registry</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {editingPlayer && (
                <>
                <TabsContent value="profile" className="p-10 m-0 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <div className="md:col-span-4 space-y-8">
                         <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30">
                            {activeCam === 'profile' ? (
                               <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                            ) : editingPlayer.photoUrl ? (
                               <Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                            ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12" /></div>
                            )}
                         </div>
                         <Button onClick={() => startCamera('profile')} className="w-full bg-primary/5 text-primary border-2 h-12 rounded-xl font-black uppercase text-[10px]">Recapture Photo</Button>
                      </div>

                      <div className="md:col-span-8 space-y-8">
                         <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">GR No</Label><Input value={editingPlayer.generalRegisterNumber} onChange={e => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Roll No</Label><Input value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Gender</Label><Select value={editingPlayer.gender} onValueChange={(v: any) => setEditingPlayer({...editingPlayer, gender: v})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                               <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Birth Date</Label><Input type="date" value={editingPlayer.dob} onChange={e => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl" /></div>
                            </div>
                         </div>

                         <div className="space-y-4 p-8 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20">
                            <Label className="font-black text-accent uppercase text-[10px] tracking-[0.2em] mb-4 block">Assign Sports</Label>
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

                <TabsContent value="performance" className="p-10 m-0 space-y-8">
                   <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10 flex items-center gap-4">
                      <Zap className="w-8 h-8 text-accent animate-pulse" />
                      <div><h4 className="font-black uppercase text-primary">Monthly Performance Log</h4><p className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(), 'MMMM yyyy')}</p></div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">100m Sprint (s)</Label><Input value={monthlyPerformance.running100m} onChange={e => setMonthlyPerformance({...monthlyPerformance, running100m: e.target.value})} className="h-12 border-2 rounded-xl font-black text-primary" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Shot Put (m)</Label><Input value={monthlyPerformance.shotPut} onChange={e => setMonthlyPerformance({...monthlyPerformance, shotPut: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Long Jump (m)</Label><Input value={monthlyPerformance.longJump} onChange={e => setMonthlyPerformance({...monthlyPerformance, longJump: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                      </div>
                      <div className="space-y-6">
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Disc Throw (m)</Label><Input value={monthlyPerformance.discThrow} onChange={e => setMonthlyPerformance({...monthlyPerformance, discThrow: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Javelin (m)</Label><Input value={monthlyPerformance.javelin} onChange={e => setMonthlyPerformance({...monthlyPerformance, javelin: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">High Jump (m)</Label><Input value={monthlyPerformance.highJump} onChange={e => setMonthlyPerformance({...monthlyPerformance, highJump: e.target.value})} className="h-12 border-2 rounded-xl font-black" /></div>
                      </div>
                   </div>
                </TabsContent>
                </>
              )}
            </div>

            <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
              <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-10 h-14 font-black uppercase text-[10px]">Discard</Button>
              <Button onClick={handleUpdatePlayer} className="bg-primary px-20 rounded-full font-black uppercase text-[10px] shadow-2xl text-white h-14 active-scale">
                Archive Profile
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
