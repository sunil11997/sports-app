"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Search, 
  Printer, 
  User, 
  Medal, 
  GraduationCap, 
  Phone, 
  Fingerprint, 
  MapPin, 
  ClipboardList, 
  Hash, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  HeartPulse, 
  History,
  Camera,
  Upload,
  XCircle,
  RefreshCw,
  ImageIcon,
  ScanLine
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { differenceInYears, isValid } from 'date-fns';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

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
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

  const startCamera = async (type: 'profile' | 'aadhar', mode: 'user' | 'environment' = 'user') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Enable camera permissions.' });
    }
  };

  const toggleCamera = () => {
    if (!activeCam) return;
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(activeCam, nextMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
        if (activeCam === 'profile') {
          setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
        } else {
          setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: dataUrl });
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setEditingPlayer({ ...editingPlayer, photoUrl: reader.result as string });
        } else {
          setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: reader.result as string });
        }
        toast({ title: "Photo Updated", description: "Identity document captured successfully." });
      };
      reader.readAsDataURL(file);
    }
  };

  const isGeneral = section === 'general';

  const getAgeCategory = (age: number, gender: string) => {
    const g = gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${g} U14`;
    if (age < 17) return `${g} U17`;
    return `${g} Senior`;
  };

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (p.aadharNumber && p.aadharNumber.includes(searchTerm)) ||
          (p.generalRegisterNumber && p.generalRegisterNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSection && matchesSearch;
      })
      .sort((a: any, b: any) => {
        if (isGeneral) {
          const stdA = parseInt(a.std) || 0;
          const stdB = parseInt(b.std) || 0;
          if (stdA !== stdB) return stdA - stdB;
          return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
        } else {
          const getCategoryRank = (p: any) => {
            const age = parseInt(p.age) || 0;
            const genderRank = p.gender === 'Female' ? 0 : 1;
            let ageRank = 2;
            if (age < 14) ageRank = 0;
            else if (age < 17) ageRank = 1;
            return genderRank * 10 + ageRank; 
          };
          const rankA = getCategoryRank(a);
          const rankB = getCategoryRank(b);
          if (rankA !== rankB) return rankA - rankB;
          return a.name.localeCompare(b.name);
        }
      });
  }, [store.data.players, isGeneral, searchTerm]);

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      store.updatePlayer(editingPlayer);
      setEditingPlayer(null);
      toast({ title: "Record Updated" });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingPlayerId) {
      store.deletePlayer(deletingPlayerId);
      setDeletingPlayerId(null);
      toast({ title: "Record Deleted", variant: "destructive" });
    }
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={8} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
            {isGeneral ? <GraduationCap className="w-5 h-5 text-primary" /> : <Medal className="w-5 h-5 text-primary" />}
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{isGeneral ? 'Student Registry' : 'Athlete Roster'}</h2>
        </div>
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name or GR number..." className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="google-card overflow-hidden overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/30"><TableRow>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground w-[80px]">Sr No</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground">Student Profile</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">{isGeneral ? 'Standard' : 'Category'}</TableHead>
            <TableHead className="h-12 px-4 text-[10px] font-black uppercase text-muted-foreground text-center">Aadhar Number</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-24 opacity-30 font-black uppercase tracking-widest">No records found</TableCell></TableRow> : 
            filteredPlayers.map((p: any) => {
              return (
                <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-colors border-b last:border-0">
                  <TableCell className="px-6 text-sm font-black text-primary/60">#{p.serialNumber || '0'}</TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-11 h-11 border-2 border-white shadow-sm" onClick={() => setViewingPhoto(p.photoUrl || null)}>
                        <AvatarImage src={p.photoUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm uppercase text-primary leading-none">{p.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{p.gender} • GR: {p.generalRegisterNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    {isGeneral ? (
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 border-muted text-[10px] font-black text-muted-foreground">Std {p.std}</Badge>
                    ) : (
                      <Badge className="rounded-full px-3 py-0.5 bg-accent text-accent-foreground text-[10px] font-black">{getAgeCategory(p.age, p.gender)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-center font-mono font-black text-xs text-primary/70">{p.aadharNumber || 'Pending'}</TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary" onClick={() => setEditingPlayer(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/5 text-destructive" onClick={() => setDeletingPlayerId(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
          <DialogHeader className="bg-primary/5 p-8 border-b shrink-0">
            <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Edit Student Profile</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {editingPlayer && (
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Identity Photo</Label>
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 group">
                           {activeCam === 'profile' ? (
                             <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                           ) : editingPlayer.photoUrl ? (
                             <img src={editingPlayer.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /></div>
                           )}
                           {activeCam === 'profile' && (
                             <div className="absolute bottom-4 left-0 right-0 flex flex-col gap-2 px-4 z-20">
                               <Button onClick={toggleCamera} variant="secondary" className="w-full bg-white/80 h-8 rounded-lg font-black text-[8px] uppercase"><RefreshCw className="w-3 h-3 mr-2" /> Flip Camera</Button>
                               <div className="flex gap-2">
                                 <Button onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs rounded-xl">CAPTURE</Button>
                                 <Button variant="destructive" onClick={stopCamera} className="w-12 h-12 p-0 rounded-xl"><XCircle className="w-6 h-6" /></Button>
                               </div>
                             </div>
                           )}
                        </div>
                        {!activeCam && (
                          <div className="flex gap-2">
                            <Button onClick={() => startCamera('profile')} className="flex-1 bg-primary text-white rounded-xl h-10 font-black text-[10px] uppercase">Recapture</Button>
                            <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-10 font-bold border-2" /></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Aadhar Number (12 Digit)</Label><Input value={editingPlayer.aadharNumber || ''} onChange={e => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-10 font-black border-2" maxLength={12} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Standard</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Roll No</Label><Input type="number" value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-10 font-black border-2" /></div>
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
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
