
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Camera, 
  XCircle, 
  ImageIcon, 
  Fingerprint, 
  Phone, 
  MapPin, 
  ScanLine, 
  ClipboardList, 
  Upload, 
  ShieldAlert, 
  Hash, 
  UserCircle2, 
  Medal,
  HeartPulse,
  History as HistoryIcon,
  Ruler,
  RefreshCcw
} from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

/**
 * Unified Enrollment Schema
 * Only Name and Std are compulsory as requested.
 */
const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  std: z.string().min(1, "Standard is required"),
  category: z.enum(["athlete", "student"]),
  gender: z.enum(["Male", "Female"]).optional().default("Male"),
  serialNumber: z.string().optional().default(""),
  dob: z.string().optional().default(""),
  height: z.string().optional().default(""),
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

export function Registration({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isMarathi = language === 'Marathi';

  const t = {
    title: isMarathi ? 'संस्थात्मक नावनोंदणी' : 'Institutional Enrollment',
    subtitle: isMarathi ? 'विद्यार्थी व खेळाडू संपूर्ण नोंदणी' : 'Full Student & Athlete Registry Hub',
    enrollBtn: isMarathi ? 'नोंदणी जतन करा' : 'Register Profile',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", 
      std: "1", 
      category: section === 'sports' ? 'athlete' : 'student',
      gender: "Male", 
      serialNumber: "", 
      dob: "", 
      height: "", 
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
    },
  });

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
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Please check permissions.' });
    }
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

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setActiveCam(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === 'profile') form.setValue('photoUrl', dataUrl);
        else form.setValue('aadharPhotoUrl', dataUrl);
        toast({ title: "Photo Ready", description: "Identity document captured successfully." });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const dobDate = values.dob ? new Date(values.dob) : null;
    const age = (dobDate && isValid(dobDate)) ? differenceInYears(new Date(), dobDate) : 0;
    
    let bmi = "0.0";
    if (values.height && values.weight) {
      const h = parseFloat(values.height) / 100;
      const w = parseFloat(values.weight);
      bmi = (w / (h * h)).toFixed(1);
    }

    store.addPlayer({
      ...values,
      id: Math.random().toString(36).substr(2, 9),
      age: isNaN(age) ? 0 : age,
      bmi: isNaN(parseFloat(bmi)) ? "0.0" : bmi,
    });

    toast({ title: "Enrollment Success", description: `${values.name} archived to cloud registry.` });
    form.reset({
      ...form.getValues(),
      name: "",
      serialNumber: "",
      generalRegisterNumber: "",
      aadharNumber: "",
      mobileNumber: "",
      photoUrl: "",
      aadharPhotoUrl: ""
    });
  };

  return (
    <Card className="border-2 shadow-2xl rounded-[3rem] bg-white overflow-hidden">
      <CardHeader className="bg-primary/5 border-b p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-primary rounded-[1.5rem] text-white shadow-xl">
              <UserPlus className="w-10 h-10" />
            </div>
            <div>
              <CardTitle className="text-4xl font-black text-primary uppercase tracking-tight leading-none">{t.title}</CardTitle>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-3">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="bg-white p-2 rounded-2xl border-2 border-primary/10 shadow-inner inline-flex">
            <Button 
              type="button"
              variant={form.watch('category') === 'student' ? 'default' : 'ghost'}
              onClick={() => form.setValue('category', 'student')}
              className={cn("rounded-xl px-6 h-12 font-black uppercase text-[10px] tracking-widest", form.watch('category') === 'student' ? 'bg-primary text-white' : 'text-muted-foreground')}
            >
              <UserCircle2 className="w-4 h-4 mr-2" /> General
            </Button>
            <Button 
              type="button"
              variant={form.watch('category') === 'athlete' ? 'default' : 'ghost'}
              onClick={() => form.setValue('category', 'athlete')}
              className={cn("rounded-xl px-6 h-12 font-black uppercase text-[10px] tracking-widest", form.watch('category') === 'athlete' ? 'bg-primary text-white' : 'text-muted-foreground')}
            >
              <Medal className="w-4 h-4 mr-2" /> Athlete
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Profile Images Column */}
              <div className="lg:col-span-4 space-y-10">
                <div className="space-y-4">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Identity Photo (Profile)
                  </FormLabel>
                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-2xl group">
                    {activeCam === 'profile' ? (
                      <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                    ) : form.watch('photoUrl') ? (
                      <img src={form.watch('photoUrl')} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest">Awaiting Capture</span></div>
                    )}
                    {activeCam === 'profile' && (
                      <div className="absolute bottom-6 left-0 right-0 flex flex-col gap-3 px-6 z-20">
                        <Button type="button" onClick={toggleCamera} variant="secondary" className="w-full bg-white/80 backdrop-blur h-10 rounded-xl font-black text-[9px] uppercase"><RefreshCcw className="w-3 h-3 mr-2" /> Flip Camera</Button>
                        <div className="flex gap-3">
                          <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs h-14 rounded-2xl shadow-xl active-scale">CAPTURE</Button>
                          <Button type="button" variant="destructive" onClick={stopCamera} className="w-14 h-14 p-0 rounded-2xl shadow-xl"><XCircle className="w-6 h-6" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {!activeCam && (
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => startCamera('profile')} className="flex-1 bg-primary/5 text-primary border-2 border-primary/10 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all">
                        <Camera className="w-4 h-4 mr-2" /> Camera
                      </Button>
                      <Button type="button" onClick={() => profileUploadRef.current?.click()} variant="outline" className="w-14 h-14 p-0 rounded-2xl border-2">
                        <Upload className="w-6 h-6" />
                      </Button>
                      <input type="file" ref={profileUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ScanLine className="w-4 h-4" /> Aadhar Identity Scan
                  </FormLabel>
                  <div className="relative aspect-[1.6/1] rounded-[1.5rem] overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20 shadow-inner">
                    {activeCam === 'aadhar' ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : form.watch('aadharPhotoUrl') ? (
                      <img src={form.watch('aadharPhotoUrl')} alt="Aadhar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Fingerprint className="w-10 h-10" /><span className="text-[8px] font-black uppercase tracking-widest mt-2">No Document Scanned</span></div>
                    )}
                    {activeCam === 'aadhar' && (
                      <div className="absolute bottom-4 left-0 right-0 flex flex-col gap-2 px-6">
                        <Button type="button" onClick={toggleCamera} variant="secondary" className="w-full bg-white/80 h-8 rounded-lg font-black text-[8px] uppercase"><RefreshCcw className="w-3 h-3 mr-2" /> Switch Camera</Button>
                        <div className="flex gap-2">
                          <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-[10px] h-10 rounded-xl">SCAN DOC</Button>
                          <Button type="button" variant="destructive" onClick={stopCamera} className="w-10 h-10 p-0 rounded-xl"><XCircle className="w-5 h-5" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {!activeCam && (
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => startCamera('aadhar', 'environment')} className="flex-1 bg-accent/5 text-accent-foreground border-2 border-accent/20 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest hover:bg-accent/10 transition-all">
                        <Fingerprint className="w-4 h-4 mr-2" /> Live Scan
                      </Button>
                      <Button type="button" onClick={() => aadharUploadRef.current?.click()} variant="outline" className="w-12 h-12 p-0 rounded-2xl border-2">
                        <Upload className="w-5 h-5" />
                      </Button>
                      <input type="file" ref={aadharUploadRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                    </div>
                  )}
                </div>
              </div>

              {/* Data Fields Column */}
              <div className="lg:col-span-8 space-y-12">
                {/* Core Identification Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                    <Hash className="w-5 h-5" />
                    <h3 className="font-black uppercase text-sm tracking-[0.2em]">Institutional Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Full Name *</FormLabel>
                        <FormControl><Input placeholder="Required Field" className="h-14 font-black border-2 rounded-2xl bg-white focus:border-primary shadow-sm text-lg" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="std" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Standard (Std) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 font-black border-2 bg-white rounded-2xl text-lg shadow-sm"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="serialNumber" render={({ field }) => (
                      <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">Roll No</FormLabel><FormControl><Input className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="generalRegisterNumber" render={({ field }) => (
                      <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">GR Number</FormLabel><FormControl><Input className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem><FormLabel className="font-black text-muted-foreground uppercase text-[9px]">Birth Date</FormLabel><FormControl><Input type="date" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>

                {/* Health & Physicals Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b-2 border-primary/5 pb-3">
                    <Ruler className="w-5 h-5" />
                    <h3 className="font-black uppercase text-sm tracking-[0.2em]">Physical & Aadhar</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem><FormLabel className="text-[9px] font-black uppercase text-muted-foreground">Height (cm)</FormLabel><FormControl><Input type="number" className="h-12 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem><FormLabel className="text-[9px] font-black uppercase text-muted-foreground">Weight (kg)</FormLabel><FormControl><Input type="number" className="h-12 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                      <FormItem><FormLabel className="text-[9px] font-black uppercase text-muted-foreground">Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                      <FormItem><FormLabel className="text-[9px] font-black uppercase text-muted-foreground">Contact No</FormLabel><FormControl><Input className="h-12 border-2 rounded-xl font-mono" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary">Aadhar Number (12-Digit)</FormLabel><FormControl><Input placeholder="0000 0000 0000" className="h-14 font-mono font-black border-2 rounded-2xl text-center text-lg" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="medical" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><HeartPulse className="w-3 h-3" /> Medical Conditions</FormLabel><FormControl><Textarea className="min-h-[56px] border-2 rounded-2xl" placeholder="e.g. Asthma, Past injuries..." {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>

                {/* Sports Specific Section */}
                {form.watch('category') === 'athlete' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 text-accent border-b-2 border-accent/10 pb-3">
                      <Medal className="w-5 h-5" />
                      <h3 className="font-black uppercase text-sm tracking-[0.2em]">Athletic Participation</h3>
                    </div>
                    <div className="bg-accent/5 p-8 rounded-[2.5rem] border-2 border-dashed border-accent/20">
                      <FormLabel className="font-black text-accent uppercase text-[10px] tracking-widest mb-6 block">Select Active Institutional Games</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                        {SPORTS_LIST.map(sport => (
                          <FormField key={sport} control={form.control} name="sports" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 group">
                              <FormControl><Checkbox checked={field.value?.includes(sport)} onCheckedChange={(checked) => {
                                const curr = field.value || [];
                                return checked ? field.onChange([...curr, sport]) : field.onChange(curr.filter(v => v !== sport))
                              }} className="w-5 h-5 rounded-md border-2 border-accent/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent" /></FormControl>
                              <FormLabel className="text-xs font-black uppercase text-foreground/70 cursor-pointer group-hover:text-accent transition-colors">{sport}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </div>
                    <FormField control={form.control} name="histDetail" render={({ field }) => (
                      <FormItem><FormLabel className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-2"><HistoryIcon className="w-3 h-3" /> Competition History</FormLabel><FormControl><Textarea className="min-h-[80px] border-2 rounded-2xl" placeholder="Previous participation details..." {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                )}
                
                <div className="pt-8 border-t border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <ShieldAlert className="w-6 h-6 opacity-30" />
                    <p className="text-[10px] font-bold uppercase tracking-widest max-w-xs leading-relaxed opacity-40">Records are cryptographically secured in the institutional cloud vault.</p>
                  </div>
                  <Button type="submit" className="w-full md:w-auto px-20 h-20 bg-primary hover:bg-primary/90 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] active-scale transition-all text-lg">
                    {t.enrollBtn}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
