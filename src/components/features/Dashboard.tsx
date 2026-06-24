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
  Printer, 
  UserCheck, 
  Calendar, 
  Contact, 
  MapPin, 
  HeartPulse, 
  Baby, 
  ScanFace,
  Medal,
  Ruler,
  Camera,
  Upload,
  RefreshCcw,
  CircleX,
  User,
  Type
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

interface DashboardProps {
  store: any;
  section: 'sports' | 'general';
  searchTerm?: string;
  selectedSport?: string;
  t: any;
}

const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function Dashboard({ store, section, searchTerm: initialSearch = "", selectedSport: initialSport = "all", t }: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(false);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);

  const isGeneral = section === 'general';

  const filteredPlayers = useMemo(() => {
    const baseList = store.data.players || [];
    return [...baseList]
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const nameMatch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const aadharMatch = (p.aadharNumber || "").includes(searchTerm);
        const grMatch = (p.generalRegisterNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSection && (nameMatch || aadharMatch || grMatch) && (selectedSport === 'all' || (p.sports && p.sports.includes(selectedSport)));
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, searchTerm, selectedSport]);

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
    if (confirm("Are you sure you want to PERMANENTLY DELETE this student?")) {
      store.deletePlayer(playerId);
      toast({ title: "Registry Purged", variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === 'profile') setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
        else setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
        <div className="flex items-center gap-6">
          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(false)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">English</Button>
            <Button variant={isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(true)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">मराठी</Button>
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isMarathiView ? 'विद्यार्थी नोंदणी' : 'Registry Roster'}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
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

      <Card className="google-card overflow-hidden border">
        <div className="overflow-x-auto scrollbar-hide">
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
                    <Badge variant="secondary" className="font-black text-xs h-9 w-9 flex items-center justify-center rounded-lg bg-primary/5 text-primary border-primary/10">
                      {p.serialNumber || '0'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                        <AvatarImage src={p.photoUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{(p.name || "?")[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm uppercase text-primary leading-none">{isMarathiView ? (p.nameMarathi || p.name) : p.name}</p>
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
                      <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => handleDeletePlayer(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[850px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col h-[85vh] max-h-[90vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0 relative overflow-hidden">
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Profile Editor</DialogTitle>
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Registry Update Cycle v4.3.26</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-10 space-y-10">
              {editingPlayer && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4 space-y-8">
                     <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Camera className="w-3 h-3" /> Profile Photo</Label>
                       <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/5 bg-muted/20 shadow-inner">
                         {activeCam === 'profile' ? (
                           <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                         ) : editingPlayer.photoUrl ? (
                           <Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center"><UserCheck className="w-12 h-12 opacity-10" /></div>
                         )}
                         {activeCam === 'profile' && (
                           <div className="absolute bottom-4 inset-x-4 flex gap-2">
                             <Button size="sm" onClick={takePhoto} className="flex-1 h-10 bg-accent text-white font-black text-[9px] rounded-xl">CAPTURE</Button>
                             <Button size="sm" variant="destructive" onClick={stopCamera} className="h-10 w-10 p-0 rounded-xl"><CircleX className="w-4 h-4" /></Button>
                           </div>
                         )}
                       </div>
                       {!activeCam && (
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 font-black text-[9px]" onClick={() => startCamera('profile')}><Camera className="w-3 h-3 mr-2" /> NEW PHOTO</Button>
                           <Button size="sm" variant="ghost" onClick={() => profileUploadRef.current?.click()} className="h-10 w-10 p-0 rounded-xl border"><Upload className="w-3 h-3" /></Button>
                           <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                         </div>
                       )}
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><ScanFace className="w-3 h-3" /> Identity Scan</Label>
                        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/10 bg-muted/10">
                          {activeCam === 'aadhar' ? (
                            <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                          ) : editingPlayer.aadharPhotoUrl ? (
                            <Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10"><ScanFace className="w-8 h-8" /></div>
                          )}
                          {activeCam === 'aadhar' && (
                             <div className="absolute bottom-2 inset-x-2 flex gap-2">
                                <Button size="sm" onClick={takePhoto} className="flex-1 h-8 bg-accent text-white font-black text-[8px] rounded-lg">SCAN</Button>
                                <Button size="sm" variant="destructive" onClick={stopCamera} className="h-8 w-8 p-0 rounded-lg"><CircleX className="w-3 h-3" /></Button>
                             </div>
                          )}
                        </div>
                        {!activeCam && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 font-black text-[9px]" onClick={() => startCamera('aadhar', 'environment')}>UPDATE SCAN</Button>
                            <Button size="sm" variant="ghost" onClick={() => aadharUploadRef.current?.click()} className="h-10 w-10 p-0 rounded-xl border"><Upload className="w-3 h-3" /></Button>
                            <input type="file" ref={aadharUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                        <Hash className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Primary Identity</h3>
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
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">GR Number</Label>
                          <Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Roll / Serial Number</Label>
                          <Input value={editingPlayer.serialNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Standard (Class)</Label>
                          <Select value={editingPlayer.std} onValueChange={(val) => setEditingPlayer({...editingPlayer, std: val})}>
                            <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Category</Label>
                          <Select value={editingPlayer.category} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, category: val})}>
                            <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="student">General Student</SelectItem><SelectItem value="athlete">Active Athlete</SelectItem></SelectContent>
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
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Date of Birth</Label>
                          <Input type="date" value={editingPlayer.dob || ""} onChange={(e) => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Blood Group</Label>
                          <Select value={editingPlayer.bloodGroup || "None"} onValueChange={(val) => setEditingPlayer({...editingPlayer, bloodGroup: val})}>
                            <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Ht (cm)</Label>
                          <Input type="number" value={editingPlayer.height || ""} onChange={(e) => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-1"><Baby className="w-3 h-3" /> Sit Ht (cm)</Label>
                          <Input type="number" value={editingPlayer.sittingHeight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Wt (kg)</Label>
                          <Input type="number" value={editingPlayer.weight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
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
                          <Input maxLength={12} value={editingPlayer.aadharNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Mobile Number</Label>
                          <Input value={editingPlayer.mobileNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2"><MapPin className="w-3 h-3" /> Permanent Address</Label>
                        <Input value={editingPlayer.address || ""} onChange={(e) => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-accent border-b-2 border-accent/5 pb-2">
                        <Medal className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Institutional Sports</h3>
                      </div>
                      <div className="bg-accent/5 p-8 rounded-[2rem] border-2 border-dashed border-accent/20">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {SPORTS_LIST.map(sport => (
                            <div key={sport} className="flex items-center space-x-3">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">Sports History?</Label>
                          <Select value={editingPlayer.history} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, history: val})}>
                            <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary ml-2">History Details</Label>
                          <Input value={editingPlayer.histDetail || ""} onChange={(e) => setEditingPlayer({...editingPlayer, histDetail: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
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
                        <Input value={editingPlayer.medical || ""} onChange={(e) => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="bg-muted/10 p-8 border-t flex gap-4 shrink-0">
            <Button variant="ghost" onClick={() => { setEditingPlayer(null); stopCamera(); }} className="h-14 px-10 rounded-full font-black uppercase text-[10px]">Discard</Button>
            <Button onClick={handleUpdatePlayer} className="bg-primary flex-1 h-14 rounded-full font-black uppercase text-[10px] text-white shadow-lg active-scale">Save Profile Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
