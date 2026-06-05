"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Zap, 
  Printer, 
  Edit, 
  Camera, 
  CircleX, 
  ImageIcon, 
  Scan, 
  Fingerprint, 
  Hash, 
  Ruler, 
  Zap as ZapIcon,
  Activity
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
import type { Player } from '@/lib/types';

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
        const rollA = parseInt(a.serialNumber) || 0;
        const rollB = parseInt(b.serialNumber) || 0;
        return rollA - rollB;
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
      store.updatePlayer(editingPlayer);
      if (Object.values(monthlyPerformance).some(v => v !== '')) {
         store.setFitness(editingPlayer.id, {
           ...store.data.fitness[editingPlayer.id],
           ...monthlyPerformance,
           updatedAt: new Date().toISOString()
         });
      }
      setEditingPlayer(null);
      toast({ title: "Profile Updated" });
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Std ${std} Registry - Waghamba Hub</title>
          <style>
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none !important; } }
            body { font-family: Inter, sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 11px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 25px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 20px; }
            .report-title { font-weight: 800; text-transform: uppercase; text-align: center; margin-top: 5px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #111; padding: 8px; text-align: left; }
            th { background: #f1f1f1; font-weight: 900; text-transform: uppercase; font-size: 9px; }
            .roll-cell { text-align: center; font-weight: 900; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
            <div class="report-title">Class Registry: Standard ${std}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ROLL</th>
                <th>STUDENT NAME</th>
                <th>GENDER</th>
                <th>GR NO</th>
                <th>HEIGHT</th>
                <th>WEIGHT</th>
                <th>AADHAR</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((s: any) => `
                <tr>
                  <td class="roll-cell">${s.serialNumber || '-'}</td>
                  <td><strong>${s.name.toUpperCase()}</strong></td>
                  <td>${s.gender}</td>
                  <td>${s.generalRegisterNumber || '-'}</td>
                  <td>${s.height || '-'} cm</td>
                  <td>${s.weight || '-'} kg</td>
                  <td>${s.aadharNumber || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
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
             <Zap className="w-3.5 h-3.5 text-accent" /> v4.3.3 Registry
           </Badge>
           <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-black uppercase text-xs shadow-lg">
             <Printer className="w-4 h-4 mr-2" /> Print Class Roster
           </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase pl-8 w-[100px]">Roll (Sr)</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Student Name</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">GR Number</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Ht/Wt</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">Aadhar ID</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id} className="hover:bg-primary/5 h-16">
                  <TableCell className="pl-8">
                    <Badge variant="secondary" className="font-black text-xs h-9 w-9 flex items-center justify-center rounded-lg bg-primary/5 text-primary border-primary/10">
                      {student.serialNumber || '0'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-xs uppercase text-primary">{student.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-black text-[10px] text-primary/70 bg-muted/50 px-3 py-1 rounded-md border">
                      {student.generalRegisterNumber || '---'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-[10px] font-bold">
                    {student.height}cm / {student.weight}kg
                  </TableCell>
                  <TableCell className="text-center text-[10px] font-mono font-black text-muted-foreground">
                    {student.aadharNumber || 'Pending'}
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
          <DialogHeader className="bg-primary p-8 text-white shrink-0">
             <div className="flex items-center gap-4">
                <Edit className="w-6 h-6" />
                <DialogTitle className="text-2xl font-black uppercase">Edit Std {std} Profile</DialogTitle>
             </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8">
            {editingPlayer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">Student Name</Label>
                  <Input value={editingPlayer.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">Roll Number</Label>
                  <Input value={editingPlayer.serialNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">GR Number</Label>
                  <Input value={editingPlayer.generalRegisterNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">Aadhar Number</Label>
                  <Input value={editingPlayer.aadharNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 font-bold rounded-xl font-mono" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-8 border-t bg-muted/10">
             <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-xl h-12 font-black uppercase px-8">Discard</Button>
             <Button onClick={handleUpdatePlayer} className="bg-primary text-white rounded-xl h-12 font-black uppercase px-12 shadow-lg">Save Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
