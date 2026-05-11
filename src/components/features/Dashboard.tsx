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
} from "@/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Camera States for Edit Dialog
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
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
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
      const dobDate = new Date(editingPlayer.dob);
      const age = isValid(dobDate) ? differenceInYears(new Date(), dobDate) : editingPlayer.age;
      const h = parseFloat(editingPlayer.height) / 100;
      const w = parseFloat(editingPlayer.weight);
      const bmi = (w / (h * h)).toFixed(1);
      
      store.updatePlayer({
        ...editingPlayer,
        age: isNaN(age) ? 0 : age,
        bmi: isNaN(parseFloat(bmi)) ? "0.0" : bmi
      });
      setEditingPlayer(null);
      toast({ title: "Record Updated", description: `${editingPlayer.name}'s profile saved.` });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingPlayerId) {
      store.deletePlayer(deletingPlayerId);
      setDeletingPlayerId(null);
      toast({ title: "Record Deleted", variant: "destructive" });
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
              <tr><th>SR. NO</th><th>GR NO.</th><th>NAME</th><th>GENDER</th><th>STD</th><th>HT/WT</th><th>BMI</th><th>HEALTH</th></tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => `
                <tr>
                  <td>${p.serialNumber || '-'}</td>
                  <td>${p.generalRegisterNumber || '-'}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td>${p.gender}</td>
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
            <Input placeholder="Search name or GR number..." className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase text-muted-foreground text-right">Actions</TableHead>
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
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{p.gender} • GR: {p.generalRegisterNumber || 'N/A'}</p>
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
        <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-primary/5 p-8 border-b shrink-0">
            <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Comprehensive Profile Editor</DialogTitle>
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Institutional Multi-Registry Sync</p>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            {editingPlayer && (
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Photo Section */}
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Identity Photo</Label>
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 group">
                           {activeCam === 'profile' ? (
                             <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                           ) : editingPlayer.photoUrl ? (
                             <img src={editingPlayer.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /><span className="text-[10px] font-black uppercase">No Photo</span></div>
                           )}
                           {activeCam === 'profile' && (
                             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-20">
                               <Button onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs rounded-xl">CAPTURE</Button>
                               <Button variant="destructive" onClick={stopCamera} className="w-12 h-12 p-0 rounded-xl"><XCircle className="w-6 h-6" /></Button>
                             </div>
                           )}
                        </div>
                        {!activeCam && (
                          <div className="flex gap-2">
                            <Button onClick={() => startCamera('profile')} className="flex-1 bg-primary text-white rounded-xl h-10 font-black text-[10px] uppercase"><Camera className="w-3 h-3 mr-2" /> Recapture</Button>
                            <Button variant="outline" onClick={() => profileUploadRef.current?.click()} className="w-10 h-10 p-0 border-2 rounded-xl"><Upload className="w-4 h-4" /></Button>
                            <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><ScanLine className="w-4 h-4" /> Aadhar Scan</Label>
                        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20">
                           {activeCam === 'aadhar' ? (
                             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                           ) : editingPlayer.aadharPhotoUrl ? (
                             <img src={editingPlayer.aadharPhotoUrl} alt="Aadhar" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center opacity-30"><Fingerprint className="w-8 h-8" /></div>
                           )}
                           {activeCam === 'aadhar' && (
                             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-4">
                               <Button onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-[9px] rounded-xl">SCAN</Button>
                               <Button variant="destructive" onClick={stopCamera} className="w-10 h-10 p-0 rounded-xl"><XCircle className="w-4 h-4" /></Button>
                             </div>
                           )}
                        </div>
                        {!activeCam && (
                          <div className="flex gap-2">
                            <Button onClick={() => startCamera('aadhar', 'environment')} className="flex-1 bg-accent/10 text-accent-foreground border-2 border-accent/20 rounded-xl h-10 font-black text-[10px] uppercase">New Scan</Button>
                            <Button variant="outline" onClick={() => aadharUploadRef.current?.click()} className="w-10 h-10 p-0 border-2 rounded-xl"><Upload className="w-4 h-4" /></Button>
                            <input type="file" ref={aadharUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                          </div>
                        )}
                      </div>
                   </div>

                   {/* Data Section */}
                   <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-10 font-bold border-2" /></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Gender</Label><Select value={editingPlayer.gender} onValueChange={v => setEditingPlayer({...editingPlayer, gender: v as any})}><SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Std</Label><Select value={editingPlayer.std} onValueChange={v => setEditingPlayer({...editingPlayer, std: v})}><SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger><SelectContent>{[...Array(12)].map((_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>)}</SelectContent></Select></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Sr No</Label><Input type="number" value={editingPlayer.serialNumber} onChange={e => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-10 font-black border-2" /></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">GR No</Label><Input value={editingPlayer.generalRegisterNumber} onChange={e => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-10 font-black border-2" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Mobile</Label><Input value={editingPlayer.mobileNumber} onChange={e => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-10 font-mono border-2" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Blood Group</Label><Select value={editingPlayer.bloodGroup || 'None'} onValueChange={v => setEditingPlayer({...editingPlayer, bloodGroup: v})}><SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger><SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">Aadhar Number</Label><Input value={editingPlayer.aadharNumber} onChange={e => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-10 font-mono font-black border-2 text-center" /></div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary border-b pb-2"><HeartPulse className="w-4 h-4" /><h3 className="text-xs font-black uppercase">Medical & Recovery</h3></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label className="text-[9px] font-black opacity-60">Height (cm)</Label><Input type="number" value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-10 border-2" /></div>
                        <div className="space-y-1"><Label className="text-[9px] font-black opacity-60">Weight (kg)</Label><Input type="number" value={editingPlayer.weight} onChange={e => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-10 border-2" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-[9px] font-black opacity-60">Clinical Notes</Label><Textarea value={editingPlayer.medical} onChange={e => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="min-h-[80px] border-2" /></div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary border-b pb-2"><Medal className="w-4 h-4" /><h3 className="text-xs font-black uppercase">Sports Participation</h3></div>
                      <div className="bg-muted/30 p-5 rounded-2xl border-2 border-dashed grid grid-cols-2 gap-x-6 gap-y-2">
                         {SPORTS_LIST.map(sport => (
                           <div key={sport} className="flex items-center space-x-2">
                             <Checkbox id={`ed-${sport}`} checked={editingPlayer.sports?.includes(sport)} onCheckedChange={c => {
                               const s = editingPlayer.sports || [];
                               setEditingPlayer({...editingPlayer, sports: c ? [...s, sport] : s.filter(x => x !== sport)});
                             }} />
                             <label htmlFor={`ed-${sport}`} className="text-[9px] font-bold uppercase cursor-pointer">{sport}</label>
                           </div>
                         ))}
                      </div>
                      <div className="space-y-1"><Label className="text-[9px] font-black opacity-60">Performance History</Label><Textarea value={editingPlayer.histDetail} onChange={e => setEditingPlayer({...editingPlayer, histDetail: e.target.value})} className="min-h-[80px] border-2" /></div>
                   </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="bg-muted/10 p-8 flex gap-4 shrink-0 border-t">
            <Button variant="ghost" onClick={() => setEditingPlayer(null)} className="rounded-full px-8 font-black uppercase text-[10px] h-14">Discard</Button>
            <Button onClick={handleUpdatePlayer} className="bg-primary px-16 rounded-full font-black uppercase text-[10px] shadow-xl text-white h-14">
              Sync Record to Cloud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
