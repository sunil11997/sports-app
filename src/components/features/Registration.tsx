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
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Camera, XCircle, ImageIcon, Fingerprint, Phone, MapPin, ScanLine, ClipboardList, Upload, ShieldAlert, RefreshCw, Hash, UserCircle2, Medal } from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

// Updated Schema: Only Name and Std are required.
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
  aadharNumber: z.string().optional(),
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
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isMarathi = language === 'Marathi';

  const t = {
    title: isMarathi ? 'नवीन नावनोंदणी' : 'Institutional Enrollment',
    subtitle: isMarathi ? 'संस्थात्मक विद्यार्थी व खेळाडू नोंदणी' : 'Unified Student & Athlete Registry',
    enrollBtn: isMarathi ? 'नोंदणी पूर्ण करा' : 'Complete Enrollment',
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

    toast({ title: "Enrollment Success", description: `${values.name} added to ${values.category} list.` });
    form.reset({
      ...form.getValues(),
      name: "",
      serialNumber: "",
      generalRegisterNumber: "",
      aadharNumber: "",
      mobileNumber: ""
    });
  };

  return (
    <Card className="border-2 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-primary/5 border-b p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-primary uppercase tracking-tight">{t.title}</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{t.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Photo & Aadhar (Optional) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-2">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Identity Photo
                  </FormLabel>
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-inner group">
                    {activeCam === 'profile' ? (
                      <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                    ) : form.watch('photoUrl') ? (
                      <img src={form.watch('photoUrl')} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><Camera className="w-12 h-12 mb-2" /><span className="text-[10px] font-black uppercase">Click to capture</span></div>
                    )}
                    {activeCam === 'profile' && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-20">
                        <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs h-12 rounded-xl shadow-lg">CAPTURE</Button>
                        <Button type="button" variant="destructive" onClick={stopCamera} className="w-12 h-12 p-0 rounded-xl"><XCircle className="w-6 h-6" /></Button>
                      </div>
                    )}
                  </div>
                  {!activeCam && (
                    <Button type="button" onClick={() => startCamera('profile')} className="w-full bg-primary/5 text-primary border-2 border-primary/10 rounded-xl h-12 font-black uppercase text-[10px]">
                      <Camera className="w-4 h-4 mr-2" /> Start Camera
                    </Button>
                  )}
                </div>
              </div>

              {/* Required & Optional Fields */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full bg-accent/5 p-6 rounded-[2rem] border-2 border-dashed border-accent/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-accent uppercase text-[10px] tracking-[0.2em]">Enrollment Section *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-14 font-black border-2 bg-white rounded-2xl"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="student"><div className="flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> General Student</div></SelectItem>
                          <SelectItem value="athlete"><div className="flex items-center gap-2"><Medal className="w-4 h-4" /> Sports Athlete</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-primary uppercase text-[10px] tracking-[0.2em]">Student Name *</FormLabel>
                      <FormControl><Input placeholder="Full Name" className="h-14 font-bold border-2 rounded-2xl bg-white" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="std" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-primary uppercase text-[10px] tracking-[0.2em]">Standard (Std) *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-14 font-black border-2 bg-white rounded-2xl"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Secondary Optional Fields */}
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-muted-foreground uppercase text-[10px]">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-12 font-bold rounded-xl border-2"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-muted-foreground uppercase text-[10px]">Serial No (Optional)</FormLabel>
                    <FormControl><Input placeholder="Hajeri No" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="generalRegisterNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-muted-foreground uppercase text-[10px]">GR Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="GR-XXXX" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-muted-foreground uppercase text-[10px]">Mobile (Optional)</FormLabel>
                    <FormControl><Input placeholder="10 Digits" className="h-12 font-mono border-2 rounded-xl" {...field} /></FormControl>
                  </FormItem>
                )} />

                {form.watch('category') === 'athlete' && (
                  <div className="col-span-full space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Select Games (Athletes Only)</FormLabel>
                    <div className="grid grid-cols-3 gap-2 bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 shadow-inner">
                      {SPORTS_LIST.map(sport => (
                        <FormField key={sport} control={form.control} name="sports" render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value?.includes(sport)} 
                                onCheckedChange={(checked) => {
                                  const curr = field.value || [];
                                  return checked ? field.onChange([...curr, sport]) : field.onChange(curr.filter(v => v !== sport))
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">{sport}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-8 border-t">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black px-16 h-16 rounded-2xl shadow-xl uppercase tracking-widest active-scale">
                {t.enrollBtn}
              </Button>
            </div>
          </form>
        </Form>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
