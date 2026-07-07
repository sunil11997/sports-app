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
  ScanFace,
  Camera,
  Upload,
  CircleX,
  Type,
  Search,
  Weight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn, getAgeValidation, getLocalizedAgeCategory } from '@/lib/utils';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

export function StandardClassView({ store, std, language = 'English' }: { store: any, std: string, language?: string }) {
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(language === 'Marathi');
  const [searchTerm, setSearchTerm] = useState("");

  const editingAgeValidation = useMemo(() => getAgeValidation(editingPlayer?.dob), [editingPlayer?.dob]);

  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMarathiView(language === 'Marathi');
  }, [language]);

  const students = useMemo(() => {
    return [...(store.data.players || [])]
      .filter((p: any) => p.std === std)
      .filter((p: any) => {
        const query = searchTerm.toLowerCase();
        return (p.name || "").toLowerCase().includes(query) || 
               (p.nameMarathi || "").includes(searchTerm) ||
               (p.generalRegisterNumber || "").includes(searchTerm);
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std, searchTerm]);

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { en: "Underweight", mr: "कमी वजन" };
    if (bmi < 25) return { en: "Normal", mr: "योग्य वजन" };
    if (bmi < 30) return { en: "Overweight", mr: "जास्त वजन" };
    return { en: "Obese", mr: "अति वजन" };
  };

  const startCamera = async (type: 'profile' | 'aadhar', mode: 'user' | 'environment' = 'environment') => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    try {
      const constraints = { video: { facingMode: mode }, audio: false };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallbackStream);
          setActiveCam(type);
          setFacingMode('user');
        } catch (inner) {
          toast({ variant: 'destructive', title: 'Device Not Found' });
        }
      } else {
        toast({ variant: 'destructive', title: 'Camera Access Denied' });
      }
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
      const ageValidation = getAgeValidation(editingPlayer.dob);
      const updatedPlayer = {
        ...editingPlayer,
        age: ageValidation ? ageValidation.ageYears : editingPlayer.age,
        ageCategory: ageValidation ? ageValidation.category : "None",
        ageDetailed: ageValidation ? ageValidation.ageString : "",
      };
      store.updatePlayer(updatedPlayer);
      setEditingPlayer(null);
      stopCamera();
      toast({ title: "Registry Updated", description: `${editingPlayer.name}'s profile has been modified.` });
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("Are you sure you want to PERMANENTLY DELETE this student from the institutional registry?")) {
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

  const handlePrint = () => {
    const isM = isMarathiView;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? `विद्यार्थी आरोग्य आणि शारीरिक नोंदणी - इयत्ता ${std} वी` 
      : `Student Health & Physical Registry - Standard ${std}`;

    const printContent = `
      <html>
        <head>
          <title>Institutional Registry - Std ${std}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            @media print { 
              @page { size: A4 landscape; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; line-height: 1.2; font-size: 10px; }
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-top: 5px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: center; }
            th { background-color: #f2f2f2; font-weight: 900; text-transform: uppercase; font-size: 8px; }
            .name-cell { text-align: left; font-weight: 900; min-width: 150px; text-transform: uppercase; }
            .status-normal { color: #059669; }
            .status-warning { color: #d97706; font-weight: 900; }
            .status-danger { color: #dc2626; font-weight: 900; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <div class="school-name">${schoolName}</div>
            <div class="report-type">${reportTitle}</div>
            <div style="font-size: 10px; font-weight: 700; margin-top: 5px;">Date: ${format(new Date(), 'dd MMMM yyyy')} | Registry v5.0 Stable</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SR</th>
                <th>STUDENT NAME</th>
                <th>GEN</th>
                <th>AGE</th>
                <th>HT (cm)</th>
                <th>SIT HT</th>
                <th>WT (kg)</th>
                <th>BMI</th>
                <th>WEIGHT STATUS / वजन स्थिती</th>
                <th>GR NO.</th>
                <th>BLOOD</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((p: any, i: number) => {
                const bmiNum = parseFloat(p.bmi) || 0;
                const status = getBmiStatus(bmiNum);
                const statusClass = bmiNum >= 25 ? 'status-danger' : (bmiNum < 18.5 ? 'status-warning' : 'status-normal');
                const displayName = isM ? (p.nameMarathi || p.name) : p.name;
                return `
                  <tr>
                    <td>${p.serialNumber || i+1}</td>
                    <td class="name-cell">${displayName}</td>
                    <td>${p.gender[0]}</td>
                    <td>${p.age}</td>
                    <td>${p.height || '-'}</td>
                    <td>${p.sittingHeight || '-'}</td>
                    <td>${p.weight || '-'}</td>
                    <td><strong>${p.bmi || '-'}</strong></td>
                    <td class="${statusClass}"><strong>${status.en} / ${status.mr}</strong></td>
                    <td>${p.generalRegisterNumber || '-'}</td>
                    <td>${p.bloodGroup || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; display: flex; justify-content: space-between; font-weight: 900; text-transform: uppercase; font-size: 9px;">
            <span>Class Teacher Signature</span>
            <span>Sports Director</span>
            <span>Principal Signature</span>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  React.useEffect(() => {
    if (videoRef.current && stream && activeCam) { videoRef.current.srcObject = stream; }
  }, [stream, activeCam]);

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
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={isMarathiView ? "नाव किंवा GR ने शोधा..." : "Find by Name/GR..."} 
                className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-black uppercase text-xs shadow-lg active-scale">
             <Printer className="w-4 h-4 mr-2" /> {isMarathiView ? 'रिपोर्ट प्रिंट करा' : 'Print Health Roster'}
           </Button>
        </div>
      </div>

      <div className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl overflow-x-auto scrollbar-hide">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase pl-8 w-[100px]">{isMarathiView ? 'अनु. क्र.' : 'Roll (Sr)'}</TableHead>
                <TableHead className="font-black text-[10px] uppercase">{isMarathiView ? 'विद्यार्थी नाव' : 'Student Name'}</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">{isMarathiView ? 'जी.आर. नंबर' : 'GR Number'}</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">BMI / Status</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">{isMarathiView ? 'लिंग' : 'Gender'}</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pr-8">{isMarathiView ? 'बदला' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 opacity-20 font-black uppercase">No entries found.</TableCell></TableRow>
              ) : students.map((student: any) => {
                const bmi = parseFloat(student.bmi) || 0;
                const status = getBmiStatus(bmi);
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
                          <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-[10px]">{(student.name || "?")[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-xs uppercase text-primary">{isMarathiView ? (student.nameMarathi || student.name) : student.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">
                            Age {student.age}
                            {student.ageCategory && student.ageCategory !== "None" && (
                              <> &bull; {getLocalizedAgeCategory(student.ageCategory, isMarathiView)}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-black text-[10px] text-primary/70 bg-muted/50 px-3 py-1 rounded-md border">
                        {student.generalRegisterNumber || '---'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-xs text-primary">{student.bmi || '--'}</span>
                        <span className={cn(
                          "text-[8px] font-black uppercase",
                          bmi >= 25 ? "text-destructive" : (bmi < 18.5 ? "text-amber-600" : "text-emerald-600")
                        )}>{isMarathiView ? status.mr : status.en}</span>
                      </div>
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
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => { setEditingPlayer(null); stopCamera(); }}>
        <DialogContent className="sm:max-w-[850px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col h-[85vh] max-h-[90vh]">
          <DialogHeader className="bg-primary p-8 text-white shrink-0 relative overflow-hidden">
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Profile Editor</DialogTitle>
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Registry Update Cycle v5.0 Stable</p>
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
                            <div className="relative w-full h-full"><Image src={editingPlayer.photoUrl} alt="Profile" fill unoptimized className="object-cover" /></div>
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
                            <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 font-black text-[9px]" onClick={() => startCamera('profile', 'environment')}><Camera className="w-3 h-3 mr-2" /> BACK CAM</Button>
                            <Button size="sm" variant="ghost" onClick={() => profileUploadRef.current?.click()} className="h-10 w-10 p-0 rounded-xl border"><Upload className="w-3 h-3" /></Button>
                            <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><ScanFace className="w-3 h-3" /> Identity Scan</Label>
                        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/10 bg-muted/10">
                          {activeCam === 'aadhar' ? (
                            <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover")} />
                          ) : editingPlayer.aadharPhotoUrl ? (
                            <div className="relative w-full h-full"><Image src={editingPlayer.aadharPhotoUrl} alt="Aadhar" fill unoptimized className="object-cover" /></div>
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
                            <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 font-black text-[9px]" onClick={() => startCamera('aadhar', 'environment')}>BACK SCAN</Button>
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
                        <h3 className="font-black uppercase text-xs tracking-widest">Identity</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Full Name (English)</Label><Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2"><Type className="w-3 h-3 mr-2" />नाव (मराठी)</Label><Input value={editingPlayer.nameMarathi || ""} onChange={(e) => setEditingPlayer({...editingPlayer, nameMarathi: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">GR Number</Label><Input value={editingPlayer.generalRegisterNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, generalRegisterNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Roll No</Label><Input value={editingPlayer.serialNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, serialNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-primary ml-2">Standard</Label>
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
                        <h3 className="font-black uppercase text-xs tracking-widest">Demographics</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Gender</Label><Select value={editingPlayer.gender} onValueChange={(val: any) => setEditingPlayer({...editingPlayer, gender: val})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Date of Birth</Label><Input type="date" value={editingPlayer.dob || ""} onChange={(e) => setEditingPlayer({...editingPlayer, dob: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Blood Group</Label><Select value={editingPlayer.bloodGroup || "None"} onValueChange={(val) => setEditingPlayer({...editingPlayer, bloodGroup: val})}><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                      </div>

                      {editingAgeValidation && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-primary/5 space-y-4 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                                {isMarathiView ? "जन्म तारीख" : "Date of Birth"}
                              </span>
                              <p className="text-sm font-black text-primary">{editingPlayer.dob}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                                {isMarathiView ? "वय (३१ डिसेंबर २०२६ रोजी)" : "Age (as of 31 Dec 2026)"}
                              </span>
                              <p className="text-sm font-black text-primary">
                                {isMarathiView ? (
                                  editingAgeValidation.ageString
                                    .replace(/Years/g, "वर्षे")
                                    .replace(/Months/g, "महिने")
                                    .replace(/Days/g, "दिवस")
                                ) : (
                                  editingAgeValidation.ageString
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                                {isMarathiView ? "नियुक्त गट" : "Assigned Category"}
                              </span>
                              <p className={cn("text-sm font-black uppercase", editingAgeValidation.eligible ? "text-primary" : "text-destructive")}>
                                {getLocalizedAgeCategory(editingAgeValidation.category, isMarathiView)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                                {isMarathiView ? "पात्रता स्थिती" : "Eligibility Status"}
                              </span>
                              <div>
                                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", 
                                  editingAgeValidation.eligible ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-destructive/5 text-destructive border border-destructive/20"
                                )}>
                                  {editingAgeValidation.eligible ? (isMarathiView ? "पात्र" : "Eligible") : (isMarathiView ? "अपात्र" : "Not eligible")}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!editingAgeValidation.eligible && (
                            <p className="text-xs font-black text-destructive uppercase tracking-wide bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                              {isMarathiView ? "उपलब्ध वयोगटासाठी पात्र नाही." : "Not eligible for available age categories."}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Ht (cm)</Label><Input type="number" value={editingPlayer.height || ""} onChange={(e) => setEditingPlayer({...editingPlayer, height: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Sit Ht</Label><Input type="number" value={editingPlayer.sittingHeight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, sittingHeight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Wt (kg)</Label><Input type="number" value={editingPlayer.weight || ""} onChange={(e) => setEditingPlayer({...editingPlayer, weight: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                        <Contact className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Contact</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Aadhar</Label><Input maxLength={12} value={editingPlayer.aadharNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, aadharNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Mobile</Label><Input value={editingPlayer.mobileNumber || ""} onChange={(e) => setEditingPlayer({...editingPlayer, mobileNumber: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                      </div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2"><MapPin className="w-3 h-3 mr-2" />Address</Label><Input value={editingPlayer.address || ""} onChange={(e) => setEditingPlayer({...editingPlayer, address: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-accent border-b-2 border-accent/5 pb-2">
                        <Medal className="w-4 h-4" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Sports</h3>
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
                              <Label className="text-[10px] font-black uppercase text-foreground/70">{sport}</Label>
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
                        <h3 className="font-black uppercase text-xs tracking-widest">Medical</h3>
                      </div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary ml-2">Medical Conditions</Label><Input value={editingPlayer.medical || ""} onChange={(e) => setEditingPlayer({...editingPlayer, medical: e.target.value})} className="h-12 border-2 rounded-xl font-bold" /></div>
                    </div>
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 border-t bg-muted/10 shrink-0">
             <Button onClick={handleUpdatePlayer} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active-scale">Save Registry Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
