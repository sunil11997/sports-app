"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Hash,
  Ruler,
  Medal,
  GraduationCap,
  Languages,
  Printer,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

interface DashboardProps {
  store: any;
  section: 'sports' | 'general';
  searchTerm?: string;
  selectedSport?: string;
  t: any;
}

export function Dashboard({ store, section, searchTerm: initialSearch = "", selectedSport: initialSport = "all", t }: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(false);
  
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

  const isGeneral = section === 'general';

  const filteredPlayers = useMemo(() => {
    const baseList = store.data.players || [];
    return [...baseList]
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const nameMatch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const marathiMatch = (p.nameMarathi || "").includes(searchTerm);
        const aadharMatch = (p.aadharNumber || "").includes(searchTerm);
        const grMatch = (p.generalRegisterNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSection && (nameMatch || aadharMatch || grMatch || marathiMatch) && (selectedSport === 'all' || (p.sports && p.sports.includes(selectedSport)));
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, searchTerm, selectedSport]);

  const handlePrintRegistry = () => {
    const isM = isMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? 'विद्यार्थी व खेळाडू संपूर्ण नोंदणी (मराठी रजिस्टर)' 
      : 'Full Student & Athlete Registry (English Register)';

    const printContent = `
      <html>
        <head>
          <title>Institutional Registry</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none !important; } }
            body { font-family: 'Poppins', sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 11px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 18px; }
            .report-title { font-weight: 900; text-align: center; margin-top: 10px; text-decoration: underline; font-size: 14px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: 900; }
            .center { text-align: center; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" style="background:rgba(255,255,255,0.2); color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">&larr; ${isM ? 'मागे जा' : 'Go Back'}</button>
            <button onclick="window.print()" class="btn">${isM ? 'प्रिंट करा' : 'Print Registry'}</button>
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
                <th class="center">${isM ? 'इयत्ता' : 'Standard'}</th>
                <th class="center">${isM ? 'जी.आर. नंबर' : 'GR Number'}</th>
                <th class="center">${isM ? 'आधार नंबर' : 'Aadhar No'}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => `
                <tr>
                  <td class="center">${p.serialNumber || '-'}</td>
                  <td><strong>${(isM ? (p.nameMarathi || p.name) : p.name).toUpperCase()}</strong></td>
                  <td class="center">${p.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>
                  <td class="center">${isM ? `इ. ${p.std} वी` : `Std ${p.std}`}</td>
                  <td class="center">${p.generalRegisterNumber || '-'}</td>
                  <td class="center">${p.aadharNumber || '-'}</td>
                </tr>
              `).join('')}
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

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
        <div className="flex items-center gap-6">
          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(false)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">English</Button>
            <Button variant={isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(true)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">मराठी</Button>
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isMarathiView ? 'विद्यार्थी नोंदणी' : (isGeneral ? 'Student Registry' : 'Athlete Roster')}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          <Button onClick={handlePrintRegistry} variant="outline" className="h-11 rounded-full border-2 font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/5">
            <Printer className="w-4 h-4 mr-2" /> {isMarathiView ? 'प्रिंट काढा' : 'Print Sheet'}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isMarathiView ? "नाव / आधार शोधा..." : "Search name/GR/Aadhar..."} 
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
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase w-[100px]">{isMarathiView ? 'अनु. क्र.' : 'Roll (Sr)'}</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase">{isMarathiView ? 'विद्यार्थी माहिती' : 'Profile'}</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-center">{isMarathiView ? 'जी.आर. नंबर' : 'GR Number'}</TableHead>
              <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-center">{isMarathiView ? 'इयत्ता' : 'Standard'}</TableHead>
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-right">{isMarathiView ? 'क्रिया' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((p: any) => (
              <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors border-b last:border-0">
                <TableCell className="px-6">
                   <Badge className="bg-primary/10 text-primary font-black text-sm border-0 h-10 w-10 flex items-center justify-center rounded-xl">{p.serialNumber || '0'}</Badge>
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                      <AvatarImage src={p.photoUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-black text-sm uppercase text-primary leading-none">
                        {isMarathiView ? (p.nameMarathi || p.name) : p.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{isMarathiView ? (p.gender === 'Male' ? 'मुलगा' : 'मुलगी') : p.gender}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-center">
                   <span className="font-black text-[10px] text-primary/80 bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{p.generalRegisterNumber || '---'}</span>
                </TableCell>
                <TableCell className="px-4 text-center">
                  <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-[10px] font-black text-primary bg-primary/5">{isMarathiView ? `इ. ${p.std} वी` : `Std ${p.std}`}</Badge>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => store.deletePlayer(p.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0">
             <DialogTitle className="text-2xl font-black uppercase tracking-tight">Profile Editor</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {editingPlayer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary">Student Name (English)</Label>
                    <Input value={editingPlayer.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary">Student Name (Marathi / मराठी)</Label>
                    <Input value={editingPlayer.nameMarathi || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, nameMarathi: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary">GR Number</Label>
                    <Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary">Roll Number</Label>
                    <Input value={editingPlayer.serialNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                 </div>
              </div>
            )}
          </div>
          <DialogFooter className="bg-muted/10 p-8 border-t flex gap-4">
            <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="h-14 px-10 rounded-full font-black uppercase text-[10px]">Discard</Button>
            <Button onClick={handleUpdatePlayer} className="bg-primary px-16 h-14 rounded-full font-black uppercase text-[10px] text-white shadow-lg active-scale">Save Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}