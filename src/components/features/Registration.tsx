"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
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
  Ruler,
  RefreshCcw,
  Baby,
  Search,
  CheckCircle2
} from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePWA } from '@/components/providers/pwa-provider';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
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
  aadharNumber: z.string().min(12, "Aadhar must be 12 digits").optional().or(z.literal("")),
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [registrySearch, setRegistrySearch] = useState("");

  const defaultValues: FormValues = useMemo(() => ({
    name: "", 
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const suggestedStudents = useMemo(() => {
    if (!registrySearch || registrySearch.length < 2) return [];
    return (store.data.players || []).filter((p: any) => 
      p.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
      p.aadharNumber?.includes(registrySearch) ||
      p.generalRegisterNumber?.includes(registrySearch)
    ).slice(0, 5);
  }, [registrySearch, store.data.players]);

  const handleAutoFill = (student: any) => {
    form.reset({
      ...student,
      category: (section === 'sports' ? 'athlete' : student.category) as "athlete" | "student",
    });
    setRegistrySearch("");
    toast({
      title: "Data Fetched",
      description: `Loaded registry details for ${student.name}.`,
    });
  };

  useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

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

  const toggleCamera = () => {
    if (!activeCam) return;
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(activeCam, nextMode);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && activeCam) {
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

  const onSubmit = (values: FormValues) => {
    const dobDate = values.dob ? new Date(values.dob) : null;
    const age = (dobDate && isValid(dobDate)) ? differenceInYears(new Date(), dobDate) : 0;
    
    let bmiValue = "0.0";
    if (values.height && values.weight) {
      const h = parseFloat(values.height) / 100;
      const w = parseFloat(values.weight);
      bmiValue = (w / (h * h)).toFixed(1);
    }

    store.addPlayer({
      ...values,
      id: Math.random().toString(36).substr(2, 9),
      age: isNaN(age) ? 0 : age,
      bmi: isNaN(parseFloat(bmiValue)) ? "0.0" : bmiValue,
    });

    toast({ title: "Enrollment Success", description: `${values.name} archived to registry.` });
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="border-2 rounded-[3rem] bg-accent/5 border-accent/10 shadow-lg overflow-hidden">
        <CardContent className="p-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white">
                <Search className="w-7 h-7" />
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase text-accent tracking-widest ml-1">Search Registry</label>
                <div className="relative">
                  <Input 
                    value={registrySearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistrySearch(e.target.value)}
                    placeholder="Type name or GR number..." 
                    className="h-14 rounded-2xl border-2 border-accent/20 font-bold bg-white pl-12"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/40" />
                </div>
                {suggestedStudents.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded-2xl border-2 border-accent/20 shadow-xl space-y-1">
                    {suggestedStudents.map((s: any) => (
                      <button key={s.id} type="button" onClick={() => handleAutoFill(s)} className="w-full text-left p-4 hover:bg-accent/5 rounded-xl flex items-center justify-between group">
                        <div>
                          <p className="font-black text-primary uppercase text-sm">{s.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Std {s.std} &bull; GR: {s.generalRegisterNumber || 'N/A'}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-primary rounded-[1.5rem] text-white shadow-xl">
                <UserPlus className="w-10 h-10" />
              </div>
              <div>
                <CardTitle className="text-4xl font-black text-primary uppercase tracking-tight leading-none">Enrollment</CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-3">Institutional Registry Hub</p>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-2xl border-2 border-primary/10 shadow-inner inline-flex">
              <Button type="button" variant={form.watch('category') === 'student' ? 'default' : 'ghost'} onClick={() => form.setValue('category', 'student')} className={cn("rounded-xl px-6 h-12 font-black uppercase text-[10px]", form.watch('category') === 'student' ? "bg-primary text-white" : "text-muted-foreground")}>
                <UserCircle2 className="w-4 h-4 mr-2" /> General
              </Button>
              <Button type="button" variant={form.watch('category') === 'athlete' ? 'default' : 'ghost'} onClick={() => form.setValue('category', 'athlete')} className={cn("rounded-xl px-6 h-12 font-black uppercase text-[10px]", form.watch('category') === 'athlete' ? "bg-primary text-white" : "text-muted-foreground")}>
                <Medal className="w-4 h-4 mr-2" /> Athlete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Identity Photo
                    </FormLabel>
                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-2xl">
                      {activeCam === 'profile' ? (
                        <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                      ) : form.watch('photoUrl') ? (
                        <div className="relative w-full h-full"><Image src={form.watch('photoUrl')} alt="Profile" fill unoptimized className="object-cover" /></div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest">Awaiting Capture</span></div>
                      )}
                      {activeCam === 'profile' && (
                        <div className="absolute bottom-6 left-0 right-0 flex flex-col gap-3 px-6 z-20">
                          <Button type="button" onClick={toggleCamera} variant="secondary" className="w-full bg-white/80 h-10 rounded-xl font-black text-[9px] uppercase"><RefreshCcw className="w-3 h-3 mr-2" /> Flip Camera</Button>
                          <div className="flex gap-3">
                            <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs h-14 rounded-2xl shadow-xl">CAPTURE</Button>
                            <Button type="button" variant="destructive" onClick={stopCamera} className="w-14 h-14 p-0 rounded-2xl shadow-xl"><CircleX className="w-6 h-6" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {!activeCam && (
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => startCamera('profile')} className="flex-1 bg-primary/5 text-primary border-2 border-primary/10 rounded-2xl h-14 font-black uppercase text-[10px]">
                          <Camera className="w-4 h-4 mr-2" /> Camera
                        </Button>
                        <Button type="button" onClick={() => profileUploadRef.current?.click()} variant="outline" className="w-14 h-14 p-0 rounded-2xl border-2">
                          <Upload className="w-6 h-6" />
                        </Button>
                        <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                      <Hash className="w-5 h-5" />
                      <h3 className="font-black uppercase text-sm tracking-[0.2em]">Institutional Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Full Name (English) *</FormLabel>
                          <FormControl><Input placeholder="Full legal name" className="h-14 font-black border-2 rounded-2xl bg-white text-lg" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                          <FormLabel className="font-black text-muted-foreground uppercase text-[9px]">Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="serialNumber" render={({ field }) => (
                        <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">Roll No</FormLabel><FormControl><Input className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="generalRegisterNumber" render={({ field }) => (
                        <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">GR No</FormLabel><FormControl><Input className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                      <Ruler className="w-5 h-5" />
                      <h3 className="font-black uppercase text-sm tracking-[0.2em]">Physical Details</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase">Ht (cm)</FormLabel><FormControl><Input type="number" className="h-12 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="sittingHeight" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase flex items-center gap-1"><Baby className="w-3 h-3" /> Sit Ht (cm)</FormLabel><FormControl><Input type="number" className="h-12 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase">Wt (kg)</FormLabel><FormControl><Input type="number" className="h-12 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black uppercase">Blood Grp</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-accent border-b-2 border-accent/10 pb-3">
                      <Medal className="w-5 h-5" />
                      <h3 className="font-black uppercase text-sm tracking-[0.2em]">Games</h3>
                    </div>
                    <div className="bg-accent/5 p-8 rounded-[2.5rem] border-2 border-dashed border-accent/20">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                        {SPORTS_LIST.map(sport => (
                          <FormField key={sport} control={form.control} name="sports" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value?.includes(sport)} onCheckedChange={(checked) => {
                                const curr = field.value || [];
                                return checked ? field.onChange([...curr, sport]) : field.onChange(curr.filter(v => v !== sport))
                              }} className="w-5 h-5 rounded-md border-2 border-accent/30 data-[state=checked]:bg-accent" /></FormControl>
                              <FormLabel className="text-xs font-black uppercase text-foreground/70 cursor-pointer">{sport}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <ShieldAlert className="w-6 h-6 opacity-30" />
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Records are cryptographically secured.</p>
                    </div>
                    <Button type="submit" className="w-full md:w-auto px-20 h-20 bg-primary text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] text-lg active-scale">
                      Register Profile
                    </Button>
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <input type="file" ref={aadharUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhar')} />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-24 right-8 z-50">
        <Badge variant="outline" className="bg-white border-2 border-primary/20 text-primary font-black uppercase text-[10px] px-6 py-2 rounded-full shadow-2xl">
          WGB HUB V4.3.24 STABLE
        </Badge>
      </div>
    </div>
  );
}