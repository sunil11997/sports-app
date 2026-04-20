
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
import { UserPlus, Camera, RefreshCw, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  gender: z.enum(["Male", "Female"]),
  std: z.string(),
  dob: z.string(),
  height: z.string(),
  weight: z.string(),
  bloodGroup: z.string(),
  sports: z.array(z.string()).min(1, "Select at least one sport"),
  history: z.enum(["Yes", "No"]),
  histDetail: z.string().optional(),
  medical: z.string().optional(),
  photoUrl: z.string().optional(),
});

export function Registration({ store }: { store: any }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "Male",
      std: "1",
      dob: "",
      height: "",
      weight: "",
      bloodGroup: "O+",
      sports: [],
      history: "No",
      histDetail: "",
      medical: "",
      photoUrl: "",
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setHasCameraPermission(true);
      setIsCameraActive(true);
      setCapturedPhoto(null);

      // We need to wait for the next tick to ensure the video element is rendered if it was hidden
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play failed", e));
        }
      }, 100);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Match canvas to video stream resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror if it's front camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
        form.setValue('photoUrl', dataUrl);
        stopCamera();
        
        toast({
          title: "Photo Captured",
          description: "Student photo has been attached to the form.",
        });
      }
    }
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
    form.setValue('photoUrl', '');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const age = differenceInYears(new Date(), new Date(values.dob));
    const h = parseFloat(values.height) / 100;
    const w = parseFloat(values.weight);
    const bmi = (w / (h * h)).toFixed(1);

    const newPlayer = {
      ...values,
      id: Math.random().toString(36).substr(2, 9),
      age,
      bmi: isNaN(parseFloat(bmi)) ? "0" : bmi,
    };

    store.addPlayer(newPlayer);
    toast({ 
      title: "Registration Successful", 
      description: `${values.name} has been added to the institutional roster.` 
    });
    form.reset();
    setCapturedPhoto(null);
  };

  return (
    <Card className="border-2 border-primary/10 shadow-xl overflow-hidden rounded-[2.5rem] bg-white">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-8 px-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-primary uppercase tracking-tight">Player Registration</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Institutional Sports & Health Record</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Photo & Identity Section */}
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-2">
                  <FormLabel className="font-black text-primary uppercase text-xs tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Player Identity Photo
                  </FormLabel>
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-inner group">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                    ) : isCameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover -scale-x-100" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                          <Camera className="w-10 h-10 text-primary/20" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
                          Official photo required<br/>for tournament eligibility
                        </p>
                      </div>
                    )}
                    
                    {isCameraActive && (
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 gap-3 animate-in slide-in-from-bottom-4">
                        <Button 
                          type="button" 
                          onClick={takePhoto} 
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-14 px-8 shadow-2xl font-black uppercase text-xs tracking-widest active-scale"
                        >
                          Capture Student
                        </Button>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={stopCamera} 
                          className="rounded-2xl h-14 w-14 shadow-2xl p-0 active-scale"
                        >
                          <XCircle className="w-6 h-6" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isCameraActive && !capturedPhoto && (
                    <Button 
                      type="button" 
                      onClick={startCamera} 
                      className="w-full bg-primary/5 text-primary hover:bg-primary/10 rounded-2xl h-14 border-2 border-primary/10 font-black uppercase text-xs tracking-widest active-scale"
                    >
                      <Camera className="w-5 h-5 mr-2" /> Start Camera
                    </Button>
                  )}

                  {capturedPhoto && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                      <Button 
                        type="button" 
                        onClick={startCamera} 
                        className="flex-1 bg-primary/5 text-primary hover:bg-primary/10 rounded-2xl h-14 font-black uppercase text-xs tracking-widest active-scale"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Retake
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={clearPhoto} 
                        className="flex-1 rounded-2xl h-14 text-destructive hover:bg-destructive/5 font-black uppercase text-xs tracking-widest active-scale"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {hasCameraPermission === false && (
                    <Alert variant="destructive" className="rounded-2xl border-2">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="font-black uppercase text-xs">Camera Blocked</AlertTitle>
                      <AlertDescription className="text-xs font-medium">
                        Institutional security requires camera access. Please check phone settings.
                      </AlertDescription>
                    </Alert>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Core Details Section */}
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Full Player Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter student name" className="rounded-xl border-2 h-12 font-bold focus:border-accent transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="std"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Standard / Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue placeholder="Select standard" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {[...Array(12)].map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="165" className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="55" className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_GROUPS.map(group => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest block">Sports Specialization *</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10">
                    {SPORTS_LIST.map((sport) => (
                      <FormField
                        key={sport}
                        control={form.control}
                        name="sports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 hover:bg-white/50 rounded-xl transition-colors cursor-pointer">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(sport)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, sport])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== sport
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-bold cursor-pointer text-foreground/70">
                              {sport}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Past Sport History?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="No">No History</SelectItem>
                            <SelectItem value="Yes">Has History</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="histDetail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Achievement Details</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. District Winner 2023" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medical"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">Critical Medical Info / Allergies</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Asthma, Dust Allergy" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-primary/10">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-16 py-8 rounded-2xl shadow-xl transition-all active-scale text-lg uppercase tracking-widest"
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
