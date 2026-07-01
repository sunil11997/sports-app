"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Camera, 
  CircleX, 
  ImageIcon, 
  Upload, 
  ShieldAlert, 
  Hash, 
  UserCircle2, 
  Medal,
  Search,
  CheckCircle2,
  Calendar,
  HeartPulse,
  MapPin,
  ScanFace,
  Type,
  Loader2,
  Weight,
  Ruler
} from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePWA } from '@/components/providers/pwa-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];
const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  nameMarathi: z.string().optional().default(""),
  std: z.string().min(1, "Standard is required"),
  category: z.enum(["athlete", "student"]),
  gender: z.enum(["Male", "Female"]),
  serialNumber: z.string().optional().default(""),
  dob: z.string().optional().default(""),
  height: z.string().optional().default(""),
  sittingHeight: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  bloodGroup: z.string().optional().default("None"),
  generalRegisterNumber: z.string().optional().default(""),
  aadharNumber: z.string().optional().default(""),
  mobileNumber: z.string().optional().default(""),
  address: z.string().optional().default(""),
  sports: z.array(z.string()).optional().default([]),
  history: z.enum(["Yes", "No"]).optional().default("No"),
  histDetail: z.string().optional().default(""),
  medical: z.string().optional().default(""),
  photoUrl: z.string().optional().default(""),
  aadharPhotoUrl: z.string().optional().default(""),
});

type FormValues = z.infer<typeof formSchema>;

export function Registration({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const { isOnline } = usePWA();
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [registrySearch, setRegistrySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);

  const defaultValues: FormValues = useMemo(() => ({
    name: "", 
    nameMarathi: "",
    std: "1", 
    category: (section === 'sports' ? 'athlete' : 'student') as "athlete" | "student",
    gender: "Male", 
    serialNumber: "", 
    dob: "", 
    height: "", 
    sittingHeight: "",
    weight: "",
    bloodGroup: "None", 
    aadharNumber: "", 
    mobileNumber: "", 
    generalRegisterNumber: "", 
    address: "",
    sports: [], 
    history: "No", 
    histDetail: "", 
    medical: "", 
    photoUrl: "", 
    aadharPhotoUrl: ""
  }), [section]);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });

  const suggestedStudents = useMemo(() => {
    if (!registrySearch || registrySearch.length < 2) return [];
    return (store.data.players || []).filter((p: any) => 
      (p.name || "").toLowerCase().includes(registrySearch.toLowerCase()) || 
      (p.generalRegisterNumber || "").includes(registrySearch)
    ).slice(0, 5);
  }, [registrySearch, store.data.players]);

  const handleAutoFill = (student: any) => {
    form.reset({ 
      ...student, 
      category: (section === 'sports' ? 'athlete' : student.category) as "athlete" | "student" 
    });
    setRegistrySearch("");
    toast({ title: "Data Fetched", description: `Loaded registry details for ${student.name}.` });
  };

  const startCamera = async (type: 'profile' | 'aadhar', mode: 'user' | 'environment' = 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      // First attempt with preferred mode (Back Camera)
      const constraints = {
        video: { facingMode: mode },
        audio: false
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        // Fallback to any available camera if the specific mode isn't found
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallbackStream);
          setActiveCam(type);
          setFacingMode('user');
        } catch (innerError) {
          toast({ variant: 'destructive', title: 'Device Not Found', description: 'No camera hardware detected on this device.' });
        }
      } else {
        toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please ensure camera permissions are granted.' });
      }
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
    if (videoRef.current && canvasRef.current && activeCam) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (activeCam === 'profile') form.setValue('photoUrl', dataUrl);
        else form.setValue('aadharPhotoUrl', dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === 'profile') form.setValue('photoUrl', dataUrl);
        else form.setValue('aadharPhotoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const dobDate = values.dob ? new Date(values.dob) : null;
      const age = (dobDate && isValid(dobDate)) ? differenceInYears(new Date(), dobDate) : 0;
      
      let bmi = "---";
      if (values.height && values.weight) {
        const h = parseFloat(values.height) / 100;
        const w = parseFloat(values.weight);
        if (h > 0) bmi = (w / (h * h)).toFixed(1);
      }

      await store.addPlayer({ 
        ...values, 
        id: Math.random().toString(36).substr(2, 9), 
        age: isNaN(age) ? 0 : age,
        bmi 
      });
      
      toast({ 
        title: "Enrollment Success", 
        description: `${values.name} archived to registry.`,
        className: "bg-primary text-white" 
      });
      form.reset(defaultValues);
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream && activeCam) { videoRef.current.srcObject = stream; }
  }, [stream, activeCam]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <Card className="border-2 rounded-[3rem] bg-accent/5 p-8 shadow-lg">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white"><Search className="w-7 h-7" /></div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase text-accent tracking-widest ml-1">Registry Auto-Fill</label>
                <div className="relative">
                  <Input 
                    value={registrySearch} 
                    onChange={(e) => setRegistrySearch(e.target.value)} 
                    placeholder="Search existing student by name or GR number..." 
                    className="h-14 rounded-2xl border-2 border-accent/20 font-bold bg-white pl-12" 
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/40" />
                </div>
                {suggestedStudents.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded-2xl border-2 border-accent/20 shadow-xl space-y-1 animate-in slide-in-from-top-2 duration-300 relative z-50">
                    {suggestedStudents.map((s: any) => (
                      <button key={s.id} type="button" onClick={() => handleAutoFill(s)} className="w-full text-left p-4 hover:bg-accent/5 rounded-xl flex items-center justify-between group transition-colors">
                        <div>
                          <p className="font-black text-primary uppercase text-sm">{s.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Std {s.std} &bull; GR: {s.generalRegisterNumber || '---'}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
      </Card>

      <Card className="border-2 shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-primary rounded-[1.5rem] text-white shadow-xl"><UserPlus className="w-10 h-10" /></div>
            <div>
              <CardTitle className="text-4xl font-black text-primary uppercase leading-none">Enrollment Hub</CardTitle>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">Institutional Registry v5.0 Stable</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Identity Photo</FormLabel>
                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-inner">
                      {activeCam === 'profile' ? (
                        <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                      ) : form.watch('photoUrl') ? (
                        <div className="relative w-full h-full"><Image src={form.watch('photoUrl')} alt="Profile" fill unoptimized className="object-cover" /></div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /></div>
                      )}
                    </div>
                    {!activeCam && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startCamera('profile', 'environment')} className="flex-1 bg-primary/5 text-primary border-2 border-primary/10 rounded-2xl h-14 font-black uppercase text-[10px]">
                          <Camera className="w-4 h-4 mr-2" /> Back Camera
                        </button>
                        <Button type="button" onClick={() => profileUploadRef.current?.click()} variant="outline" className="h-14 w-14 rounded-2xl border-2"><Upload className="w-5 h-5" /></Button>
                        <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                      </div>
                    )}
                    {activeCam === 'profile' && (
                      <div className="flex gap-2">
                        <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-white rounded-2xl h-14 font-black uppercase text-[10px]">Capture</Button>
                        <Button type="button" onClick={stopCamera} variant="destructive" className="h-14 w-14 rounded-2xl"><CircleX className="w-5 h-5" /></Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2"><ScanFace className="w-4 h-4" /> Identity/Aadhar Scan</FormLabel>
                    <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/10 bg-muted/10">
                      {activeCam === 'aadhar' ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : form.watch('aadharPhotoUrl') ? (
                        <div className="relative w-full h-full"><Image src={form.watch('aadharPhotoUrl')} alt="Aadhar" fill unoptimized className="object-cover" /></div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10"><ScanFace className="w-8 h-8" /></div>
                      )}
                    </div>
                    {!activeCam && (
                       <div className="flex gap-2">
                          <button type="button" onClick={() => startCamera('aadhar', 'environment')} className="flex-1 bg-primary/5 text-primary border-2 border-primary/10 rounded-2xl h-12 font-black uppercase text-[9px]">Back Scan</button>
                          <Button type="button" onClick={() => aadharUploadRef.current?.click()} variant="outline" className="h-12 w-12 rounded-xl border-2"><Upload className="w-4 h-4" /></Button>
                          <input type="file" ref={aadharUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                       </div>
                    )}
                    {activeCam === 'aadhar' && (
                       <div className="flex gap-2">
                          <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-white rounded-2xl h-12 font-black uppercase text-[9px]">Scan ID</Button>
                          <Button type="button" onClick={stopCamera} variant="destructive" className="h-12 w-12 rounded-xl"><CircleX className="w-4 h-4" /></Button>
                       </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-12">
                  <ScrollArea className="h-[750px] pr-6">
                    <div className="space-y-12">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                            <UserCircle2 className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Primary Identity</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Full Name (English) *</FormLabel>
                                <FormControl><Input placeholder="Full legal name" className="h-14 font-black border-2 rounded-2xl bg-white text-lg" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="nameMarathi" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2"><Type className="w-3 h-3" /> नाव (मराठी)</FormLabel>
                                <FormControl><Input placeholder="पूर्ण नाव मराठीत" className="h-14 font-black border-2 rounded-2xl bg-white text-lg" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                            <Hash className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Classification</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="std" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Standard *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger className="h-12 font-black border-2 bg-white rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Hub Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent><SelectItem value="student">General Student</SelectItem><SelectItem value="athlete">Active Athlete</SelectItem></SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                            <HeartPulse className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Biometric Profile</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <FormField control={form.control} name="dob" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Birth Date</FormLabel>
                                <FormControl><Input type="date" className="h-12 font-bold border-2 rounded-xl" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="height" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-1"><Ruler className="w-3 h-3" /> Ht (cm)</FormLabel>
                                <FormControl><Input type="number" placeholder="155" className="h-12 font-bold border-2 rounded-xl" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="sittingHeight" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-1"><Ruler className="w-3 h-3" /> Sit Ht (cm)</FormLabel>
                                <FormControl><Input type="number" placeholder="85" className="h-12 font-bold border-2 rounded-xl" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="weight" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-1"><Weight className="w-3 h-3" /> Wt (kg)</FormLabel>
                                <FormControl><Input type="number" placeholder="48" className="h-12 font-bold border-2 rounded-xl" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Blood Group</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="serialNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Roll Number</FormLabel>
                                <FormControl><Input placeholder="Class SR" className="h-12 font-bold border-2 rounded-xl" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-2">
                            <MapPin className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Administrative Contact</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FormField control={form.control} name="generalRegisterNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">GR Number</FormLabel>
                                <FormControl><Input placeholder="School register serial" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Aadhar ID</FormLabel>
                                <FormControl><Input placeholder="12-digit number" maxLength={12} className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Parent Mobile</FormLabel>
                                <FormControl><Input placeholder="For WhatsApp reports" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="address" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Residential Address</FormLabel>
                                <FormControl><Input placeholder="Village/Taluka" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="flex items-center gap-3 text-accent border-b-2 border-accent/5 pb-2">
                            <Medal className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest text-accent">Sports Registry</h3>
                          </div>
                          <div className="bg-accent/5 p-8 rounded-3xl border-2 border-dashed border-accent/10">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              {SPORTS_LIST.map(sport => (
                                <div key={sport} className="flex items-center space-x-3">
                                  <Checkbox 
                                    id={`sport-${sport}`}
                                    checked={form.watch('sports').includes(sport)} 
                                    onCheckedChange={(checked) => {
                                      const current = form.getValues('sports');
                                      const next = checked ? [...current, sport] : current.filter(s => s !== sport);
                                      form.setValue('sports', next);
                                    }}
                                    className="w-5 h-5 rounded-md border-2 border-accent/30 data-[state=checked]:bg-accent"
                                  />
                                  <Label htmlFor={`sport-${sport}`} className="text-[10px] font-black uppercase text-foreground/70">{sport}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormField control={form.control} name="medical" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Medical Notes / Allergies</FormLabel>
                              <FormControl><Input placeholder="Any emergency info..." className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-8 border-t border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-muted-foreground opacity-40">
                      <ShieldAlert className="w-6 h-6" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Institutional Cloud Vault Security Active.</p>
                    </div>
                    <Button type="submit" disabled={!isOnline || isSubmitting} className="w-full md:w-auto px-20 h-20 bg-primary text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] text-lg active-scale">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : null}
                      Archive Registry Profile
                    </Button>
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
