
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
  Baby
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Player } from '@/lib/types';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function StandardClassView({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Camera & Image state
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

  const students = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

  const classActivities = useMemo(() => {
    return store.data.activities.filter((a: any) => a.std === std);
  }, [store.data.activities, std]);

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
      setEditingPlayer(null);
      toast({ title: "Profile Updated" });
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
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <h1>Standard ${std} - Institutional Profile</h1>
          <p>Total Students: ${students.length}</p>
          
          <h2>Health Registry</h2>
          <table>
            <thead>
              <tr><th>SNR</th><th>Name</th><th>Gender</th><th>Ht (cm)</th><th>Wt (kg)</th><th>BMI</th></tr>
            </thead>
            <tbody>
              ${students.map((s: any) => {
                const fit = store.data.fitness[s.id] || {};
                const h = fit.height || s.height;
                const w = fit.weight || s.weight;
                return `
                  <tr>
                    <td>${s.serialNumber || '-'}</td>
                    <td><strong>${s.name.toUpperCase()}</strong></td>
                    <td>${s.gender}</td>
                    <td>${h || '-'}</td>
                    <td>${w || '-'}</td>
                    <td>${calculateBMI(h, w)}</td>
                  </tr>
                `;
              }).join('')}
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

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest shadow-lg">
            <Printer className="w-4 h-4 mr-2" /> Print Summary
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Height</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Weight</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">BMI</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const fitnessData = store.data.fitness[student.id] || {};
                const h = fitnessData.height || student.height;
                const w = fitnessData.weight || student.weight;
                const bmi = calculateBMI(h, w);

                return (
                  <TableRow key={student.id} className="hover:bg-primary/5 h-16">
                    <TableCell className="font-bold text-xs">
                      <span className="uppercase text-primary">{student.name}</span>
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold">{h} cm</TableCell>
                    <TableCell className="text-center text-xs font-bold">{w} kg</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-black text-[10px]">
                        {bmi}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary" onClick={() => setEditingPlayer(student)}>
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
        <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
          <DialogHeader className="bg-primary/5 p-8 border-b shrink-0">
            <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Update Profile</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {editingPlayer && (
              <div className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Identity Photo</Label>
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 group">
                           {activeCam === 'profile' ? (
                             <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                           ) : editingPlayer.photoUrl ? (
                             <div className="relative w-full h-full">
                               <Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                             </div>
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /></div>
                           )}
                           {activeCam === 'profile' && (
                             <div className="absolute bottom-4 left-0 right-0 flex flex-col gap-2 px-4 z-20">
                               <Button onClick={toggleCamera} variant="secondary" className="w-full bg-white/80 h-8 rounded-lg font-black text-[8px] uppercase">Flip Camera</Button>
                               <div className="flex gap-2">
                                 <Button onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs rounded-xl">CAPTURE</Button>
                                 <Button variant="destructive" onClick={stopCamera} className="w-12 h-12 p-0 rounded-xl"><CircleX className="w-6 h-6" /></Button>
                               </div>
                             </div>
                           )}
                        </div>
                        {!activeCam && (
                          <Button onClick={() => startCamera('profile')} className="w-full bg-primary/5 text-primary border-2 border-primary/10 rounded-xl h-11 font-black text-[10px] uppercase">Recapture Photo</Button>
                        )}
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary border-b pb-2">
                          <Hash className="w-4 h-4" />
                          <h3 className="font-black uppercase text-[11px] tracking-widest">Student Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-10 font-bold border-2" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Height (cm)</Label><Input type="number" value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-10 font-bold border-2" /></div>
                             <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Weight (kg)</Label><Input type="number" value={editingPlayer.weight} onChange={e => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-10 font-bold border-2" /></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-5 bg-accent/5 rounded-3xl border-2 border-dashed border-accent/20">
                        <Label className="font-black text-accent uppercase text-[9px] tracking-widest">Athletic Participation (Assign Sports)</Label>
                        <div className="grid grid-cols-2 gap-y-2">
                          {SPORTS_LIST.map(sport => (
                            <div key={sport} className="flex items-center gap-2">
                              <Checkbox 
                                checked={editingPlayer.sports?.includes(sport)} 
                                onCheckedChange={(checked) => {
                                  const curr = editingPlayer.sports || [];
                                  const next = checked ? [...curr, sport] : curr.filter(s => s !== sport);
                                  setEditingPlayer({...editingPlayer, sports: next});
                                }} 
                                className="w-4 h-4 border-accent/30"
                              />
                              <span className="text-[10px] font-black uppercase text-foreground/70">{sport}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
            <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-8 font-black uppercase text-[10px] h-14">Discard</Button>
            <Button onClick={handleUpdatePlayer} className="bg-primary px-16 rounded-full font-black uppercase text-[10px] shadow-xl text-white h-14">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
