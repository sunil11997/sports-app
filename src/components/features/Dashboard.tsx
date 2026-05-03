"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, Printer, User, Medal, GraduationCap, Phone, Fingerprint, MapPin, ClipboardList, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

interface DashboardProps {
  store: any;
  section: 'sports' | 'general';
  language?: string;
  t: any;
  onTabChange?: (tab: string) => void;
}

export function Dashboard({ store, section, language = 'English', t, onTabChange }: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const isGeneral = section === 'general';

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => {
        // Athletes appear everywhere. Students only appear in General.
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (p.aadharNumber && p.aadharNumber.includes(searchTerm)) ||
          (p.generalRegisterNumber && p.generalRegisterNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSection && matchesSearch;
      })
      .sort((a: any, b: any) => {
        // Institutional Sorting: By Std first, then by Class Serial Number
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        
        const srA = parseInt(a.serialNumber) || 0;
        const srB = parseInt(b.serialNumber) || 0;
        return srA - srB;
      });
  }, [store.data.players, isGeneral, searchTerm]);

  const getHealthStatus = (bmi: string) => {
    const val = parseFloat(bmi);
    if (!val || isNaN(val)) return { label: 'Pending', color: 'bg-muted text-muted-foreground' };
    if (val < 18.5) return { label: 'Underweight', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (val <= 24.9) return { label: 'Fit', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    return { label: 'Overweight', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      const h = parseFloat(editingPlayer.height) / 100;
      const w = parseFloat(editingPlayer.weight);
      const bmi = (w / (h * h)).toFixed(1);
      
      store.updatePlayer({
        ...editingPlayer,
        bmi: isNaN(parseFloat(bmi)) ? "0.0" : bmi
      });
      setEditingPlayer(null);
      toast({ title: "Record Updated", description: `${editingPlayer.name}'s profile saved.` });
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Institutional Registry - ${section}</title>
          <style>
            @media print { @page { size: A4; margin: 1cm; } .no-print { display: none; } }
            body { font-family: Inter, sans-serif; padding: 20px; color: #111; font-size: 11px; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 18px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; font-weight: bold; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800;">${isGeneral ? 'GENERAL REGISTRY' : 'ATHLETE ROSTER'} - ${store.selectedYear}</div>
          </div>
          <table>
            <thead>
              <tr><th>SR. NO</th><th>GR NO.</th><th>NAME</th><th>STD</th><th>HT/WT</th><th>BMI</th><th>HEALTH</th></tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => `
                <tr>
                  <td>${p.serialNumber || '-'}</td>
                  <td>${p.generalRegisterNumber || '-'}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td>${p.std}</td>
                  <td>${p.height}/${p.weight}</td>
                  <td>${p.bmi}</td>
                  <td>${getHealthStatus(p.bmi).label}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shadow-inner">
            {isGeneral ? <GraduationCap className="w-5 h-5 text-primary" /> : <Medal className="w-5 h-5 text-primary" />}
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isGeneral ? 'Student Registry' : 'Athlete Roster'}</h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name or GR number..." className="pl-9 h-11 rounded-full bg-muted/30 border-none focus-visible:ring-primary shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={handlePrint} size="icon" variant="outline" className="rounded-full h-11 w-11 hover:bg-primary/5 border-muted"><Printer className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="google-card overflow-hidden overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/30"><TableRow>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground w-[80px]">Sr No</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground">Student Profile</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">Standard</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">BMI Index</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">Status</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground text-right">Edit</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-24 opacity-30 font-black uppercase tracking-widest">No records found</TableCell></TableRow> : 
            filteredPlayers.map((p: any) => {
              const health = getHealthStatus(p.bmi);
              return (
                <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors border-b last:border-0">
                  <TableCell className="px-6 text-sm font-black text-primary/60">#{p.serialNumber || '0'}</TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-11 h-11 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform" onClick={() => setViewingPhoto(p.photoUrl || null)}>
                        <AvatarImage src={p.photoUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm uppercase text-primary leading-none">{p.name}</p>
                          {p.category === 'athlete' && <Badge className="h-4 px-1.5 bg-accent text-[7px] font-black uppercase">ATHLETE</Badge>}
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">GR: {p.generalRegisterNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <Badge variant="outline" className="rounded-full px-3 py-0.5 border-muted text-[10px] font-black text-muted-foreground">Std {p.std}</Badge>
                  </TableCell>
                  <TableCell className="px-4 text-center font-mono font-black text-xs text-primary/70">{p.bmi}</TableCell>
                  <TableCell className="px-4 text-center">
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full border-2", health.color)}>
                      {health.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary/5 p-10 border-b">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 border">
              <Edit className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Edit Student Record</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Name</Label>
                <Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 font-bold rounded-2xl bg-muted/30 border-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Standard</Label>
                <Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}>
                  <SelectTrigger className="h-12 font-bold rounded-2xl bg-muted/30 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Class Sr. No</Label>
                <Input type="number" value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 font-black rounded-2xl bg-accent/5 border-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">GR Number</Label>
                <Input value={editingPlayer.generalRegisterNumber} onChange={e => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 font-black rounded-2xl bg-muted/30 border-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Height (cm)</Label>
                <Input type="number" maxLength={3} value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 font-black rounded-2xl bg-muted/30 border-none shadow-inner" />
              </div>
            </div>
          )}
          <DialogFooter className="bg-muted/10 p-10 flex gap-3">
            <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-8 font-black uppercase text-[10px]">Cancel</Button>
            <Button onClick={handleUpdatePlayer} className="bg-primary px-12 rounded-full font-black uppercase text-[10px] shadow-lg text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="sr-only"><DialogTitle>Identity Photo</DialogTitle></DialogHeader>
          {viewingPhoto && <img src={viewingPhoto} alt="Student" className="w-full aspect-[3/4] object-cover" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
