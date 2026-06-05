
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
  Activity,
  Trash2,
  Languages
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function StandardClassView({ store, std, language = 'English' }: { store: any, std: string, language?: string }) {
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(language === 'Marathi');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    setIsMarathiView(language === 'Marathi');
  }, [language]);

  useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

  const students = useMemo(() => {
    return [...(store.data.players || [])]
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

  const handlePrint = () => {
    const isM = isMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? `वर्ग रजिस्टर: इयत्ता ${std} वी (मराठी नोंद)` 
      : `Class Registry: Standard ${std} (English Record)`;

    const printContent = `
      <html>
        <head>
          <title>Std ${std} Registry</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none !important; } }
            body { font-family: 'Poppins', sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 11px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 25px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 18px; }
            .report-title { font-weight: 900; text-align: center; margin-top: 5px; text-decoration: underline; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #111; padding: 10px; text-align: left; }
            th { background: #f1f1f1; font-weight: 900; }
            .center { text-align: center; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" style="background:rgba(255,255,255,0.2); color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">&larr; ${isM ? 'मागे जा' : 'Go Back'}</button>
            <button onclick="window.print()" class="btn">${isM ? 'प्रिंट करा' : 'Print Sheet'}</button>
          </div>
          <div class="header">
            <h1>${schoolName}</h1>
            <div class="report-title">${reportTitle}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="center">${isM ? 'अनु. क्र.' : 'Sr No'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</th>
                <th class="center">${isM ? 'लिंग' : 'Gender'}</th>
                <th class="center">${isM ? 'जी.आर. नंबर' : 'GR Number'}</th>
                <th class="center">${isM ? 'आधार नंबर' : 'Aadhar No'}</th>
                <th class="center">${isM ? 'उंची/वजन' : 'Ht/Wt'}</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((s: any) => {
                const displayName = isM ? (s.nameMarathi || s.name) : s.name;
                return `
                  <tr>
                    <td class="center">${s.serialNumber || '-'}</td>
                    <td><strong>${displayName.toUpperCase()}</strong></td>
                    <td class="center">${s.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>
                    <td class="center">${s.generalRegisterNumber || '-'}</td>
                    <td class="center">${s.aadharNumber || '-'}</td>
                    <td class="center">${s.height || '-'} cm / ${s.weight || '-'} kg</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setActiveCam(null);
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      store.updatePlayer(editingPlayer);
      setEditingPlayer(null);
      toast({ title: "Profile Updated" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(false)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">English</Button>
            <Button variant={isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(true)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">मराठी</Button>
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">{isMarathiView ? `इयत्ता ${std} वी - रजिस्टर` : `Standard ${std} Registry`}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {students.length} {isMarathiView ? 'विद्यार्थी (मुलगे आधी)' : 'Enrolled Students (Boys First)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-black uppercase text-xs shadow-lg active-scale">
             <Printer className="w-4 h-4 mr-2" /> {isMarathiView ? 'प्रिंट काढा' : 'Print Sheet'}
           </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase pl-8 w-[100px]">{isMarathiView ? 'अनु. क्र.' : 'Roll (Sr)'}</TableHead>
                <TableHead className="font-black text-[10px] uppercase">{isMarathiView ? 'विद्यार्थी नाव' : 'Student Name'}</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">{isMarathiView ? 'जी.आर. नंबर' : 'GR Number'}</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">{isMarathiView ? 'लिंग' : 'Gender'}</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">{isMarathiView ? 'बदला' : 'Edit'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const displayName = isMarathiView ? (student.nameMarathi || student.name) : student.name;
                return (
                  <TableRow key={student.id} className="hover:bg-primary/5 h-16">
                    <TableCell className="pl-8">
                      <Badge variant="secondary" className="font-black text-xs h-9 w-9 flex items-center justify-center rounded-lg bg-primary/5 text-primary border-primary/10">
                        {student.serialNumber || '0'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-xs uppercase text-primary">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border shadow-sm">
                          <AvatarImage src={student.photoUrl} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-[10px]">{student.name[0]}</AvatarFallback>
                        </Avatar>
                        {displayName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-black text-[10px] text-primary/70 bg-muted/50 px-3 py-1 rounded-md border">
                        {student.generalRegisterNumber || '---'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/10 text-primary">
                        {isMarathiView ? (student.gender === 'Male' ? 'मुलगा' : 'मुलगी') : student.gender}
                      </Badge>
                    </TableCell>
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
        <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-primary p-8 text-white">
             <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            {editingPlayer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary">Name (English)</Label>
                  <Input value={editingPlayer.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary">Name (Marathi / मराठी)</Label>
                  <Input value={editingPlayer.nameMarathi || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, nameMarathi: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary">Roll Number</Label>
                  <Input value={editingPlayer.serialNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary">GR Number</Label>
                  <Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 font-bold rounded-xl" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-8 border-t bg-muted/10">
             <Button onClick={handleUpdatePlayer} className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">Save Registry Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
