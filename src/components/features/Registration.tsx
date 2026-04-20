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
import { UserPlus, Camera, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setHasCameraPermission(true);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCapturedPhoto(dataUrl);
        form.setValue('photoUrl', dataUrl);
        stopCamera();
      }
    }
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
    form.setValue('photoUrl', '');
  };

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
    toast({ title: "Registration Successful", description: `${values.name} has been added.` });
    form.reset();
    setCapturedPhoto(null);
  };

  return (
    <Card className="border-2 border-primary/10 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-8 px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-primary-foreground">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-black text-primary uppercase tracking-tight">Player Registration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Photo Upload Section */}
              <div className="lg:col-span-1 space-y-4">
                <FormLabel className="font-bold text-primary block mb-2">Player Photo</FormLabel>
                <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-primary/10 bg-muted/30 flex items-center justify-center">
                  {capturedPhoto ? (
                    <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                  ) : isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-12 h-12 text-primary/30 mx-auto" />
                      <p className="text-sm font-medium text-muted-foreground">No photo captured</p>
                    </div>
                  )}
                  
                  {isCameraActive && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <Button type="button" onClick={takePhoto} className="bg-accent text-accent-foreground rounded-full shadow-lg">
                        <Camera className="w-4 h-4 mr-2" /> Capture
                      </Button>
                      <Button type="button" variant="destructive" onClick={stopCamera} className="rounded-full shadow-lg">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {!isCameraActive && !capturedPhoto && (
                  <Button type="button" onClick={startCamera} className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-2xl h-12 border-2 border-primary/10">
                    <Camera className="w-4 h-4 mr-2" /> Start Camera
                  </Button>
                )}

                {capturedPhoto && (
                  <div className="flex gap-2">
                    <Button type="button" onClick={startCamera} className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-2xl h-12">
                      <RefreshCw className="w-4 h-4 mr-2" /> Retake
                    </Button>
                    <Button type="button" variant="outline" onClick={clearPhoto} className="flex-1 rounded-2xl h-12 border-destructive text-destructive hover:bg-destructive/10">
                      Remove
                    </Button>
                  </div>
                )}
                
                {hasCameraPermission === false && (
                  <Alert variant="destructive" className="rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription>
                      Access denied. Please enable camera in settings.
                    </AlertDescription>
                  </Alert>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Form Fields Section */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-primary">Full Player Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="rounded-xl border-2 focus:ring-accent" {...field} />
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
                      <FormLabel className="font-bold text-primary">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-2">
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
                      <FormLabel className="font-bold text-primary">Standard/Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-2">
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormLabel className="font-bold text-primary">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-xl border-2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-primary">Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="165" className="rounded-xl border-2" {...field} />
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
                      <FormLabel className="font-bold text-primary">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="55" className="rounded-xl border-2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-primary">Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-2">
                            <SelectValue placeholder="Blood Group" />
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

                <FormField
                  control={form.control}
                  name="history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-primary">Sports History</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-2">
                            <SelectValue placeholder="Has history?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sports"
                render={() => (
                  <FormItem className="lg:col-span-3">
                    <div className="mb-4">
                      <FormLabel className="text-base font-bold text-primary">Sports Participation *</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-primary/5 p-6 rounded-2xl border-2 border-primary/10">
                      {SPORTS_LIST.map((sport) => (
                        <FormField
                          key={sport}
                          control={form.control}
                          name="sports"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={sport}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
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
                                <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                                  {sport}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="histDetail"
                render={({ field }) => (
                  <FormItem className="lg:col-span-1">
                    <FormLabel className="font-bold text-primary">Achievement Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Won District Level in 2023" className="rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medical"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel className="font-bold text-primary">Medical Conditions / Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="Asthma, No allergies" className="rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 py-6 rounded-2xl shadow-lg transition-all">
                Register Player
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
