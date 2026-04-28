"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Search, Printer, User, Medal, GraduationCap, Phone, Fingerprint, Camera, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

export function Dashboard({ store, section, language = 'English', t }: { store: any, section: 'sports' | 'general', language?: string, t: any }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const filteredPlayers = useMemo(() => store.data.players.filter((p: any) => {
    const matchesCategory = p.category === targetCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.aadharNumber && p.aadharNumber.includes(searchTerm));
    return matchesCategory && matchesSearch;
  }), [store.data.players, targetCategory, searchTerm]);

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      store.updatePlayer(editingPlayer);
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
            .btn { display: inline-block; padding: 10px 20px; background: #235C36; color: white; text-decoration: none; border-radius: 5px; font-weight: 900; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right;"><a href="javascript:window.close()" class="btn">RETURN TO APP</a></div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800;">${isGeneral ? 'GENERAL STUDENT REGISTRY' : 'ACTIVE ATHLETE ROSTER'} - ${store.selectedYear}</div>
          </div>
          <table>
            <thead>
              <tr><th>SR</th><th>NAME</th><th>GENDER</th><th>STD</th><th>AADHAR</th><th>MOBILE</th><th>ADDRESS</th></tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td>${p.gender}</td>
                  <td>${p.std}</td>
                  <td>${p.aadharNumber || '-'}</td>
                  <td>${p.mobileNumber || '-'}</td>
                  <td style="font-size: 9px;">${p.address || '-'}</td>
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
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          {isGeneral ? <GraduationCap className="w-6 h-6 text-primary" /> : <Medal className="w-6 h-6 text-accent" />}
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isGeneral ? 'Student Registry' : 'Athlete Roster'}</h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name or aadhar..." className="pl-9 h-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <Button onClick={handlePrint} className="font-bold h-10 px-6 rounded-xl"><Printer className="w-4 h-4 mr-2" /> Print Sheet</Button>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/50 sticky top-0 z-20"><TableRow>
            <TableHead className="border-r h-12 px-2 text-center w-[50px]">SR</TableHead>
            <TableHead className="border-r h-12 px-2 text-center w-[60px]">Photo</TableHead>
            <TableHead className="border-r h-12 px-4 min-w-[200px]">Name</TableHead>
            <TableHead className="border-r h-12 px-2 text-center w-[80px]">Std</TableHead>
            <TableHead className="border-r h-12 px-4 w-[150px]">Aadhar</TableHead>
            <TableHead className="border-r h-12 px-4 w-[120px]">Mobile</TableHead>
            {!isGeneral && <TableHead className="border-r h-12 px-4 min-w-[150px]">Games</TableHead>}
            <TableHead className="h-12 px-4 text-right w-[80px]">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? <TableRow><TableCell colSpan={10} className="text-center py-20 opacity-30 font-black uppercase">No records found</TableCell></TableRow> : 
            filteredPlayers.map((p: any, i: number) => (
              <TableRow key={p.id} className="h-14 hover:bg-primary/5">
                <TableCell className="border-r text-center font-bold text-primary">{i+1}</TableCell>
                <TableCell className="border-r text-center"><Avatar className="w-10 h-10 mx-auto border shadow-sm"><AvatarImage src={p.photoUrl} className="object-cover" /><AvatarFallback><User className="w-4 h-4" /></AvatarFallback></Avatar></TableCell>
                <TableCell className="border-r font-black text-xs uppercase">{p.name}<div className="text-[8px] opacity-40 leading-none mt-1">{p.address}</div></TableCell>
                <TableCell className="border-r text-center font-bold">{p.std}</TableCell>
                <TableCell className="border-r font-mono text-[11px] font-black">{p.aadharNumber}</TableCell>
                <TableCell className="border-r font-mono text-[11px] font-black">{p.mobileNumber}</TableCell>
                {!isGeneral && <TableCell className="border-r"><div className="flex flex-wrap gap-1">{(p.sports || []).map((s: any) => <Badge key={s} variant="outline" className="text-[8px] font-black border-accent text-primary px-1.5 py-0">{s}</Badge>)}</div></TableCell>}
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary/5 p-8 border-b"><DialogTitle className="text-xl font-black uppercase text-primary">Edit Registry Record</DialogTitle></DialogHeader>
          {editingPlayer && (
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 font-bold rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Standard</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-12 font-bold rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Aadhar</Label><Input maxLength={12} value={editingPlayer.aadharNumber} onChange={e => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 font-mono font-black" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile</Label><Input maxLength={10} value={editingPlayer.mobileNumber} onChange={e => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 font-mono font-black" /></div>
              <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label><Input value={editingPlayer.address} onChange={e => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 font-bold rounded-xl" /></div>
            </div>
          )}
          <DialogFooter className="bg-muted/10 p-8 border-t"><Button variant="ghost" onClick={() => setEditingPlayer(null)} className="font-black uppercase text-xs">Cancel</Button><Button onClick={handleUpdatePlayer} className="bg-primary px-12 font-black uppercase text-xs h-12 rounded-xl shadow-lg text-white">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
