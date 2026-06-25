"use client";

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Search, 
  Trash2, 
  Hash, 
  UserCheck, 
  Calendar, 
  Contact, 
  MapPin, 
  HeartPulse, 
  Medal,
  Camera,
  CircleX,
  Type,
  Ruler,
  Weight,
  Phone,
  FileDigit,
  Home,
  ScanFace
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function Dashboard({ store, section, searchTerm: initialSearch = "", t }: { store: any, section: string, searchTerm?: string, t: any }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(false);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isGeneral = section === 'general';

  const filteredPlayers = useMemo(() => {
    return (store.data.players || [])
      .filter((p: Player) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const query = searchTerm.toLowerCase();
        return matchesSection && (
          p.name.toLowerCase().includes(query) || 
          (p.aadharNumber || "").includes(searchTerm) || 
          (p.generalRegisterNumber || "").toLowerCase().includes(query)
        );
      })
      .sort((a: any, b: any) => (parseInt(a.serialNumber || '0') || 0) - (parseInt(b.serialNumber || '0') || 0));
  }, [store.data.players, isGeneral, searchTerm]);

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      store.updatePlayer(editingPlayer);
      setEditingPlayer(null);
      stopCamera();
      toast({ title: "Registry Updated", description: `${editingPlayer.name}'s profile has been modified.` });
    }
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

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("Permanently delete this student from the institutional registry?")) {
      store.deletePlayer(playerId);
      toast({ title: "Registry Purged", variant: "destructive" });
    }
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
        <div className="flex items-center gap-6">
          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(false)} className="h-9 text-[10px] font-black uppercase">English</Button>
            <Button variant={isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(true)} className="h-9 text-[10px] font-black uppercase">मराठी</Button>
          </div>
          <h2 className="text-xl font-black text-primary uppercase">{isMarathiView ? 'विद्यार्थी नोंदणी' : 'Registry Roster'}</h2>
        </div>
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={isMarathiView ? "नाव / आधार शोधा..." : "Search name/Aadhar..."} 
            className="pl-9 h-11 rounded-full bg-muted/30 border-none" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <Card className="google-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-max">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-6 text-[10px] font-black uppercase w-[100px]">Roll</TableHead>
                <TableHead className="px-4 text-[10px] font-black uppercase">Student Profile</TableHead>
                <TableHead className="px-4 text-[10px] font-black uppercase text-center">GR No</TableHead>
                <TableHead className="px-4 text-[10px] font-black uppercase text-center">Standard</TableHead>
                <TableHead className="px-4 text-[10px] font-black uppercase text-center">Height/Weight</TableHead>
                <TableHead className="px-6 text-[10px] font-black uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((p: Player) => (
                <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors">
                  <TableCell className="px-6"><Badge variant="secondary" className="font-black text-xs">{p.serialNumber || '0'}</Badge></TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border shadow-sm">
                        <AvatarImage src={p.photoUrl} className="object-cover" />
                        <AvatarFallback className="font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm uppercase text-primary">{isMarathiView ? (p.nameMarathi || p.name) : p.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.gender} &bull; Age {p.age}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center font-bold text-xs">{p.generalRegisterNumber || '---'}</TableCell>
                  <TableCell className="px-4 text-center"><Badge variant="outline" className="font-black text-[10px]">Std {p.std}</Badge></TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="text-[10px] font-black text-primary/60 uppercase">
                      {p.height ? `${p.height}cm` : '--'} / {p.weight ? `${p.weight}kg` : '--'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 text-right flex justify-end gap-2 pt-6">
                    <Button variant="ghost" size="icon" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[850px] rounded-[3rem] p-0 overflow-hidden h-[85vh] flex flex-col border-none shadow-3xl">
          <DialogHeader className="bg-primary p-8 text-white shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><UserCheck className="w-8 h-8 text-white" /></div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Profile Editor</DialogTitle>
             </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-10 space-y-10">
              {editingPlayer && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4 space-y-8">
                     <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Camera className="w-3 h-3" /> Profile Photo</Label>
                       <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/5 bg-muted/20 shadow-inner">
                         {activeCam === 'profile' ? (
                           <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                         ) : editingPlayer.photoUrl ? (
                           <div className="relative w-full h-full"><Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" /></div>
                         ) : (
                           <div className="w-full h-full flex items-center justify-center opacity-10"><UserCheck className="w-12 h-12" /></div>
                         )}
                         {activeCam === 'profile' && (
                           <div className="absolute bottom-4 inset-x-4 flex gap-2">
                             <Button size="sm" onClick={takePhoto} className="flex-1 h-10 bg-accent text-white font-black text-[9px] rounded-xl">CAPTURE</Button>
                             <Button size="sm" variant="destructive" onClick={stopCamera} className="h-10 w-10 p-0 rounded-xl"><CircleX className="w-4 h-4" /></Button>
                           </div>
                         )}
                       </div>
                       {!activeCam && (
                         <Button size="sm" variant="outline" className="w-full h-12 rounded-2xl font-black text-[9px] uppercase" onClick={() => startCamera('profile')}><Camera className="w-3 h-3 mr-2" /> NEW PHOTO</Button>
                       )}
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><ScanFace className="w-3 h-3" /> Identity Scan</Label>
                        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/10 bg-muted/10 shadow-inner">
                          {activeCam === 'aadhar' ? (
                            <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover")} />
                          ) : editingPlayer.aadharPhotoUrl ? (
                            <div className="relative w-full h-full"><Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" /></div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10"><ScanFace className="w-8 h-8" /></div>
                          )}
                        </div>
                        {!activeCam && (
                          <Button size="sm" variant="outline" className="w-full h-10 rounded-xl font-black text-[9px] uppercase" onClick={() => startCamera('aadhar', 'environment')}>UPDATE SCAN</Button>
                        )}
                      </div>
                  </div>

                  <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                        <Hash className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Primary Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Full Name (English)</Label>
                          <Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2"><Type className="w-3 h-3" /> नाव (मराठी)</Label>
                          <Input value={editingPlayer.nameMarathi || ""} onChange={(e) => setEditingPlayer({...editingPlayer, nameMarathi: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary uppercase ml-1">Gender</Label><Select value={editingPlayer.gender} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, gender: val})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary uppercase ml-1">Standard</Label><Select value={editingPlayer.std} onValueChange={(val) => setEditingPlayer({...editingPlayer, std: val})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent></Select></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary uppercase ml-1">Registry Role</Label><Select value={editingPlayer.category} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, category: val})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="athlete">Athlete</SelectItem></SelectContent></Select></div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                        <HeartPulse className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Biometric Profile</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</Label><Input type="date" value={editingPlayer.dob || ""} onChange={(e) => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Ruler className="w-3 h-3" /> Ht (cm)</Label><Input type="number" value={editingPlayer.height || ""} onChange={(e) => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Ruler className="w-3 h-3" /> Sit Ht (cm)</Label><Input type="number" value={editingPlayer.sittingHeight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Weight className="w-3 h-3" /> Wt (kg)</Label><Input type="number" value={editingPlayer.weight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary">Blood Group</Label><Select value={editingPlayer.bloodGroup || "None"} onValueChange={(val) => setEditingPlayer({...editingPlayer, bloodGroup: val})}><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary">Roll Number</Label><Input value={editingPlayer.serialNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                        <Contact className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Administrative</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><FileDigit className="w-3 h-3" /> Aadhar Number</Label><Input value={editingPlayer.aadharNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Number</Label><Input value={editingPlayer.mobileNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary">GR Number</Label><Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-primary flex items-center gap-1"><Home className="w-3 h-3" /> Address</Label><Input value={editingPlayer.address || ""} onChange={(e) => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase text-accent flex items-center gap-2"><Medal className="w-4 h-4" /> Sports Registry</Label>
                      <div className="bg-accent/5 p-6 rounded-3xl border-2 border-dashed border-accent/10 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SPORTS_LIST.map(sport => (
                          <div key={sport} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={editingPlayer.sports?.includes(sport)} 
                              onCheckedChange={(checked) => {
                                const curr = editingPlayer.sports || [];
                                const next = checked ? [...curr, sport] : curr.filter(s => s !== sport);
                                setEditingPlayer({...editingPlayer, sports: next});
                              }}
                            />
                            <Label className="text-[10px] font-black uppercase text-foreground/70">{sport}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary ml-2">Medical Notes</Label>
                      <Input value={editingPlayer.medical || ""} onChange={(e) => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 border-t bg-muted/10 shrink-0">
             <Button onClick={handleUpdatePlayer} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Save Registry Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}