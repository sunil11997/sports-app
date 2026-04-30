"use client";

import React, { useRef, useState } from 'react';
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
import { UserPlus, Camera, XCircle, ImageIcon, Fingerprint, Phone, MapPin, ScanLine, ClipboardList, Upload } from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  gender: z.enum(["Male", "Female"]),
  std: z.string(),
  dob: z.string(),
  height: z.string(),
  weight: z.string(),
  bloodGroup: z.string(),
  generalRegisterNumber: z.string().min(1, "GR Number is required"),
  aadharNumber: z.string().length(12, "Aadhar must be exactly 12 digits").regex(/^\d+$/, "Only numbers allowed"),
  mobileNumber: z.string().length(10, "Mobile must be exactly 10 digits").regex(/^\d+$/, "Only numbers allowed"),
  address: z.string().min(5, "Address is too short"),
  sports: z.array(z.string()).optional(),
  history: z.enum(["Yes", "No"]),
  histDetail: z.string().optional(),
  medical: z.string().optional(),
  photoUrl: z.string().optional(),
  aadharPhotoUrl: z.string().optional(),
});

export function Registration({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);
  
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isGeneral = section === 'general';
  const isMarathi = language === 'Marathi';

  const t = {
    title: isMarathi ? (isGeneral ? 'सामान्य विद्यार्थी नावनोंदणी' : 'खेळाडू नोंदणी') : (isGeneral ? 'General Student Enrollment' : 'Athlete Registration'),
    subtitle: isMarathi ? (isGeneral ? 'संस्थात्मक शारीरिक शिक्षण नोंदणी' : 'क्रीडा उत्कृष्टता कार्यक्रम') : (isGeneral ? 'Institutional Physical Ed Registry' : 'Sports Excellence Program'),
    studentName: isMarathi ? 'विद्यार्थ्याचे नाव *' : 'Student Name *',
    gender: isMarathi ? 'लिंग' : 'Gender',
    std: isMarathi ? 'इयत्ता' : 'Standard',
    dob: isMarathi ? 'जन्मतारीख' : 'Date of Birth',
    height: isMarathi ? 'उंची (cm)' : 'Height (cm)',
    weight: isMarathi ? 'वजन (kg)' : 'Weight (kg)',
    grNumber: isMarathi ? 'जनरल रजिस्टर नंबर (GR No.)' : 'General Register Number (GR No.)',
    aadhar: isMarathi ? 'आधार कार्ड (१२ अंक)' : 'Aadhar Number (12 Digits)',
    mobile: isMarathi ? 'मोबाईल (१० अंक)' : 'Mobile Number (10 Digits)',
    address: isMarathi ? 'घरचा पत्ता' : 'Residential Address',
    medical: isMarathi ? 'वैद्यकीय नोंदी' : 'Medical Notes',
    aadharScan: isMarathi ? 'आधार कार्ड स्कॅन' : 'Aadhar Card Scan/Upload',
    enrollBtn: isMarathi ? 'विद्यार्थ्याची नोंदणी करा' : 'Enroll Student',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", gender: "Male", std: "1", dob: "", height: "", weight: "",
      bloodGroup: "None", aadharNumber: "", mobileNumber: "", generalRegisterNumber: "", address: "",
      sports: [], history: "No", histDetail: "", medical: "", photoUrl: "", aadharPhotoUrl: ""
    },
  });

  const startCamera = async (type: 'profile' | 'aadhar', mode: 'user' | 'environment' = 'user') => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.' });
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setActiveCam(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && activeCam) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (activeCam === 'profile') form.setValue('photoUrl', dataUrl);
        else form.setValue('aadharPhotoUrl', dataUrl);
        stopCamera();
      }
    }
  };

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('aadharPhotoUrl', reader.result as string);
        toast({ title: "Aadhar Uploaded", description: "Identity document captured successfully." });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const dobDate = new Date(values.dob);
    const age = isValid(dobDate) ? differenceInYears(new Date(), dobDate) : 0;
    const h = parseFloat(values.height) / 100;
    const w = parseFloat(values.weight);
    const bmi = (w / (h * h)).toFixed(1);

    store.addPlayer({
      ...values,
      id: Math.random().toString(36).substr(2, 9),
      age: isNaN(age) ? 0 : age,
      bmi: isNaN(parseFloat(bmi)) ? "0.0" : bmi,
      category: section === 'sports' ? 'athlete' : 'student',
    });

    toast({ title: "Registration Successful", description: `${values.name} is now on the registry.` });
    form.reset();
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
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-2">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Identity Preview
                  </FormLabel>
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-inner">
                    {activeCam === 'profile' ? (
                      <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                    ) : form.watch('photoUrl') ? (
                      <img src={form.watch('photoUrl')} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-20">
                        <Camera className="w-12 h-12 mb-2" />
                        <span className="text-[10px] font-black uppercase">No Photo</span>
                      </div>
                    )}
                    {activeCam === 'profile' && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                        <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs h-10 rounded-xl">SNAP</Button>
                        <Button type="button" variant="destructive" onClick={stopCamera} className="w-10 h-10 p-0 rounded-xl"><XCircle className="w-5 h-5" /></Button>
                      </div>
                    )}
                  </div>
                  {!activeCam && <Button type="button" onClick={() => startCamera('profile')} className="w-full bg-primary/5 text-primary border-2 border-primary/10 rounded-xl h-12 font-black uppercase text-[10px]">Open Camera</Button>}
                </div>

                <div className="space-y-2">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ScanLine className="w-4 h-4" /> {t.aadharScan}
                  </FormLabel>
                  <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20">
                    {activeCam === 'aadhar' ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : form.watch('aadharPhotoUrl') ? (
                      <img src={form.watch('aadharPhotoUrl')} alt="Aadhar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                        <Fingerprint className="w-8 h-8 mb-1" />
                        <span className="text-[8px] font-black uppercase">Scan Aadhar</span>
                      </div>
                    )}
                    {activeCam === 'aadhar' && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center px-4">
                        <Button type="button" onClick={takePhoto} className="bg-accent text-accent-foreground font-black text-[9px] h-8 px-6 rounded-lg">CAPTURE CARD</Button>
                      </div>
                    )}
                  </div>
                  {!activeCam && (
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => startCamera('aadhar', 'environment')} className="flex-1 bg-accent/5 text-accent-foreground border-2 border-accent/10 rounded-xl h-12 font-black uppercase text-[10px]">Start Scanner</Button>
                      <Button type="button" onClick={() => aadharUploadRef.current?.click()} className="w-12 h-12 bg-primary/5 text-primary border-2 border-primary/10 rounded-xl p-0 flex items-center justify-center shadow-sm">
                        <Upload className="w-5 h-5" />
                      </Button>
                      <input type="file" ref={aadharUploadRef} className="hidden" accept="image/*" onChange={handleAadharUpload} />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-primary uppercase text-[10px]">{t.studentName}</FormLabel>
                  <FormControl><Input placeholder="Full Name" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="std" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-primary uppercase text-[10px]">{t.std}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 font-bold rounded-xl border-2"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{[...Array(12)].map((_, i) => (<SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>))}</SelectContent></Select></FormItem>
                )} />

                <FormField control={form.control} name="generalRegisterNumber" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><ClipboardList className="w-3 h-3" /> {t.grNumber}</FormLabel>
                  <FormControl><Input placeholder="e.g. GR-1234" className="h-12 font-black rounded-xl border-2" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><Fingerprint className="w-3 h-3" /> {t.aadhar}</FormLabel>
                  <FormControl><Input maxLength={12} placeholder="1234 5678 9012" className="h-12 font-mono font-black text-lg text-center rounded-xl border-2" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><Phone className="w-3 h-3" /> {t.mobile}</FormLabel>
                  <FormControl><Input maxLength={10} placeholder="98XXXXXXXX" className="h-12 font-mono font-black text-lg text-center rounded-xl border-2" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="col-span-1 md:col-span-2">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel className="font-black text-primary uppercase text-[10px] flex items-center gap-2"><MapPin className="w-3 h-3" /> {t.address}</FormLabel>
                    <FormControl><Input placeholder="At. Post. Taluka, District, Pin" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4 col-span-1 md:col-span-2">
                  <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem><FormLabel className="font-black text-primary uppercase text-[10px]">{t.dob}</FormLabel>
                    <FormControl><Input type="date" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem><FormLabel className="font-black text-primary uppercase text-[10px]">{t.height}</FormLabel>
                    <FormControl><Input type="number" placeholder="cm" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel className="font-black text-primary uppercase text-[10px]">{t.weight}</FormLabel>
                    <FormControl><Input type="number" placeholder="kg" className="h-12 font-bold rounded-xl border-2" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                {!isGeneral && (
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px]">Select Games</FormLabel>
                    <div className="grid grid-cols-3 gap-2 bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10">
                      {SPORTS_LIST.map(sport => (
                        <FormField key={sport} control={form.control} name="sports" render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl><Checkbox checked={field.value?.includes(sport)} onCheckedChange={(checked) => {
                              const curr = field.value || [];
                              return checked ? field.onChange([...curr, sport]) : field.onChange(curr.filter(v => v !== sport))
                            }}/></FormControl>
                            <FormLabel className="text-[10px] font-bold uppercase">{sport}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-8 border-t"><Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black px-16 h-16 rounded-2xl shadow-xl uppercase tracking-widest">{t.enrollBtn}</Button></div>
          </form>
        </Form>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
