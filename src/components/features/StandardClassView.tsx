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
  Hash, 
  Ruler, 
  Activity,
  Trash2,
  Calendar,
  Contact,
  HeartPulse,
  UserCheck,
  Baby,
  MapPin,
  Medal,
  ScanFace
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function StandardClassView({ store, std, language = 'English' }: { store: any, std: string, language?: string }) {
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(language === 'Marathi');

  useEffect(() => {
    setIsMarathiView(language === 'Marathi');
  }, [language]);

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
      ? `वर्ग रजिस्टर: इयत्ता ${std} वी` 
      : `Class Registry: Standard ${std}`;

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
          </style>
        </head>
        <body style="padding-top: 20px;">
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
              </tr>
            </thead>
            <tbody>
              ${students.map((s: any) => `
                <tr>
                  <td class="center">${s.serialNumber || '-'}</td>
                  <td><strong>${s.name.toUpperCase()}</strong></td>
                  <td class="center">${s.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>
                  <td class="center">${s.generalRegisterNumber || '-'}</td>
                  <td class="center">${s.aadharNumber || '-'}</td>
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

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      store.updatePlayer(editingPlayer);
      setEditingPlayer(null);
      toast({ title: "Registry Updated", description: `${editingPlayer.name}'s profile has been modified.` });
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("Are you sure you want to PERMANENTLY DELETE this student from the institutional registry?")) {
      store.deletePlayer(playerId);
      toast({ title: "Registry Purged", variant: "destructive" });
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
              {students.length} {isMarathiView ? 'विद्यार्थी' : 'Enrolled Students'}
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
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">{isMarathiView ? 'बदला' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
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
                        {student.name}
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
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={() => setEditingPlayer(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => handleDeletePlayer(student.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[850px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0 relative overflow-hidden">
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Profile Editor</DialogTitle>
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Modifying Core Registry Entry</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-10 space-y-10">
              {editingPlayer && (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                      <Hash className="w-4 h-4" />
                      <h3 className="font-black uppercase text-xs tracking-widest">Primary Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Full Name</Label>
                        <Input value={editingPlayer.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">GR Number</Label>
                        <Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Roll / Serial Number</Label>
                        <Input value={editingPlayer.serialNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-primary ml-2">Standard (Class)</Label>
                         <Select value={editingPlayer.std} onValueChange={(val) => setEditingPlayer({...editingPlayer, std: val})}>
                           <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                           <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent>
                         </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                      <Calendar className="w-4 h-4" />
                      <h3 className="font-black uppercase text-xs tracking-widest">Demographics & Physical</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Gender</Label>
                        <Select value={editingPlayer.gender} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, gender: val})}>
                          <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Category</Label>
                        <Select value={editingPlayer.category} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, category: val})}>
                          <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="student">General Student</SelectItem><SelectItem value="athlete">Active Athlete</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Date of Birth</Label>
                        <Input type="date" value={editingPlayer.dob || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Height (cm)</Label>
                        <Input type="number" value={editingPlayer.height || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-1"><Baby className="w-3 h-3" /> Sit Ht (cm)</Label>
                        <Input type="number" value={editingPlayer.sittingHeight || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Weight (kg)</Label>
                        <Input type="number" value={editingPlayer.weight || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Blood Group</Label>
                        <Select value={editingPlayer.bloodGroup || "None"} onValueChange={(val) => setEditingPlayer({...editingPlayer, bloodGroup: val})}>
                          <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                      <Contact className="w-4 h-4" />
                      <h3 className="font-black uppercase text-xs tracking-widest">Aadhar & Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Aadhar Number (12 Digit)</Label>
                        <Input maxLength={12} value={editingPlayer.aadharNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2">Mobile Number</Label>
                        <Input value={editingPlayer.mobileNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2"><MapPin className="w-3 h-3" /> Address</Label>
                      <Input value={editingPlayer.address || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-4">
                      <Label className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <ScanFace className="w-4 h-4" /> Aadhar Scan Data
                      </Label>
                      {editingPlayer.aadharPhotoUrl && (
                        <div className="relative aspect-[1.6/1] rounded-[1.5rem] overflow-hidden border-2 border-primary/10">
                          <Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-accent border-b-2 border-accent/5 pb-2">
                      <Medal className="w-4 h-4" />
                      <h3 className="font-black uppercase text-xs tracking-widest">Institutional Sports</h3>
                    </div>
                    <div className="bg-accent/5 p-6 rounded-2xl border-2 border-dashed border-accent/10">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SPORTS_LIST.map(sport => (
                          <div key={sport} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={editingPlayer.sports?.includes(sport)} 
                              onCheckedChange={(checked) => {
                                const curr = editingPlayer.sports || [];
                                const next = checked ? [...curr, sport] : curr.filter(s => s !== sport);
                                setEditingPlayer({...editingPlayer, sports: next});
                              }}
                              className="w-5 h-5 rounded-md border-2 border-accent/30 data-[state=checked]:bg-accent"
                            />
                            <Label className="text-[10px] font-black uppercase text-foreground/70 cursor-pointer">{sport}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Sports History?</Label>
                          <Select value={editingPlayer.history} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, history: val})}>
                            <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">History Details</Label>
                          <Input value={editingPlayer.histDetail || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, histDetail: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                      <HeartPulse className="w-4 h-4" />
                      <h3 className="font-black uppercase text-xs tracking-widest">Medical Registry</h3>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary ml-2">Medical Conditions & Alerts</Label>
                      <Input value={editingPlayer.medical || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 border-t bg-muted/10 shrink-0">
             <Button onClick={handleUpdatePlayer} className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">Save Registry Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
