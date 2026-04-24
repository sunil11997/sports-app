
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
import { UserPlus, Camera, RefreshCw, XCircle, AlertCircle, RotateCw, GraduationCap, Medal, Upload, Image as ImageIcon, Languages, Fingerprint, Phone } from 'lucide-react';
import { differenceInYears, isValid } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  gender: z.enum(["Male", "Female"]),
  std: z.string(),
  dob: z.string(),
  height: z.string(),
  weight: z.string(),
  bloodGroup: z.string(),
  aadharNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  sports: z.array(z.string()).optional(),
  history: z.enum(["Yes", "No"]),
  histDetail: z.string().optional(),
  medical: z.string().optional(),
  photoUrl: z.string().optional(),
  examMarks: z.string().optional(),
});

export function Registration({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isMarathi = language === 'Marathi';

  const t = {
    title: isMarathi ? (section === 'general' ? 'सामान्य विद्यार्थी नावनोंदणी' : 'खेळाडू नोंदणी') : (section === 'general' ? 'General Student Enrollment' : 'Athlete Registration'),
    subtitle: isMarathi ? (section === 'general' ? 'संस्थात्मक इयत्ता ४-१२ नोंदणी' : 'क्रीडा उत्कृष्टता कार्यक्रम') : (section === 'general' ? 'Institutional Class 4-12 Registry' : 'Sports Excellence Program'),
    studentName: isMarathi ? 'विद्यार्थ्याचे नाव *' : 'Student Name *',
    gender: isMarathi ? 'लिंग' : 'Gender',
    male: isMarathi ? 'पुरुष' : 'Male',
    female: isMarathi ? 'महिला' : 'Female',
    std: isMarathi ? 'इयत्ता' : 'Standard',
    dob: isMarathi ? 'जन्मतारीख' : 'Date of Birth',
    height: isMarathi ? 'उंची (सेंमी)' : 'Height (cm)',
    weight: isMarathi ? 'वजन (किग्रॅ)' : 'Weight (kg)',
    bloodGroup: isMarathi ? 'रक्तगट' : 'Blood Group',
    aadhar: isMarathi ? 'आधार कार्ड नंबर' : 'Aadhar Number',
    mobile: isMarathi ? 'मोबाईल नंबर' : 'Mobile Number',
    medical: isMarathi ? 'वैद्यकीय नोंदी' : 'Medical Notes',
    examMarks: isMarathi ? 'शारीरिक शिक्षण परीक्षा गुण' : 'Physical Ed Exam Marks',
    sportsDiscipline: isMarathi ? 'क्रीडा प्रकार *' : 'Sports Discipline *',
    enrollBtn: isMarathi ? 'विद्यार्थ्याची नोंदणी करा' : 'Enroll Student',
    photoPreview: isMarathi ? 'ओळखपत्राचे पूर्वावलोकन' : 'Identity Preview',
    liveCamera: isMarathi ? 'लाइव्ह कॅमेरा' : 'Live Camera',
    uploadGallery: isMarathi ? 'गॅलरीमधून अपलोड करा' : 'Upload Gallery',
    snapPhoto: isMarathi ? 'फोटो काढा' : 'Snap Photo',
    retake: isMarathi ? 'पुन्हा घ्या' : 'Retake',
    remove: isMarathi ? 'काढून टाका' : 'Remove',
    successTitle: isMarathi ? 'नोंदणी यशस्वी' : 'Enrollment Successful',
    successDesc: (name: string) => isMarathi ? `${name} आता संस्थात्मक नोंदणीमध्ये समाविष्ट आहे.` : `${name} is now on the institutional registry.`
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "Male",
      std: "1",
      dob: "",
      height: "",
      weight: "",
      bloodGroup: "None",
      aadharNumber: "",
      mobileNumber: "",
      sports: [],
      history: "No",
      histDetail: "",
      medical: "",
      photoUrl: "",
      examMarks: "",
    },
  });

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play failed", e));
    }
  }, [isCameraActive, stream]);

  const startCamera = async (currentMode: 'user' | 'environment' = facingMode) => {
    stopCamera();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: currentMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setHasCameraPermission(true);
      setStream(newStream);
      setIsCameraActive(true);
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: isMarathi ? 'कॅमेरा प्रवेश नाकारला' : 'Camera Access Denied',
        description: isMarathi ? 'कृपया ब्राउझर सेटिंग्जमध्ये कॅमेरा परवानग्या सुरू करा.' : 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
        form.setValue('photoUrl', dataUrl);
        stopCamera();
        
        toast({
          title: isMarathi ? "यशस्वीरित्या टिपले" : "Capture Success",
          description: isMarathi ? "विद्यार्थ्याचा फोटो जतन केला आहे." : "Student identity photo has been saved.",
        });
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedPhoto(dataUrl);
        form.setValue('photoUrl', dataUrl);
        stopCamera();
        toast({
          title: isMarathi ? "अपलोड यशस्वी" : "Upload Success",
          description: isMarathi ? "गॅलरीमधून फोटो जोडला गेला." : "Photo added from gallery.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
    form.setValue('photoUrl', '');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const dobDate = new Date(values.dob);
    const ageRaw = isValid(dobDate) ? differenceInYears(new Date(), dobDate) : 0;
    const age = isNaN(ageRaw) ? 0 : ageRaw;

    const h = parseFloat(values.height) / 100;
    const w = parseFloat(values.weight);
    const bmiVal = (w / (h * h));
    const bmi = isNaN(bmiVal) || bmiVal <= 0 ? "0.0" : bmiVal.toFixed(1);

    const newPlayer = {
      ...values,
      id: Math.random().toString(36).substr(2, 9),
      age,
      bmi,
      category: section === 'sports' ? 'athlete' : 'student',
      sports: section === 'sports' ? values.sports : [],
    };

    store.addPlayer(newPlayer);
    
    store.setFitness(newPlayer.id, {
      score: "0",
      status: isMarathi ? "सुरुवातीची नोंद" : "Initial Log",
      height: values.height,
      weight: values.weight,
      examMarks: values.examMarks || "0"
    });

    toast({ 
      title: t.successTitle, 
      description: t.successDesc(values.name) 
    });
    form.reset();
    setCapturedPhoto(null);
  };

  const isGeneral = section === 'general';

  return (
    <Card className={cn(
      "border-2 shadow-xl overflow-hidden rounded-[2.5rem] bg-white transition-all",
      isGeneral ? "border-primary/20" : "border-accent/20"
    )}>
      <CardHeader className={cn(
        "border-b py-8 px-8",
        isGeneral ? "bg-primary/5" : "bg-accent/5"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-2xl text-white shadow-lg",
            isGeneral ? "bg-primary" : "bg-accent text-accent-foreground"
          )}>
            {isGeneral ? <GraduationCap className="w-8 h-8" /> : <Medal className="w-8 h-8" />}
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-primary uppercase tracking-tight">
              {t.title}
            </CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> {t.photoPreview}
                    </FormLabel>
                    {isCameraActive && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleCamera}
                        className="text-primary font-bold text-[10px] uppercase h-7 rounded-lg border-primary/20"
                      >
                        <RotateCw className="w-3 h-3 mr-1" /> {isMarathi ? 'बदला' : 'Switch'}
                      </Button>
                    )}
                  </div>
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-muted/30 shadow-inner">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover animate-in fade-in zoom-in-95" />
                    ) : isCameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={cn(
                          "w-full h-full object-cover",
                          facingMode === 'user' && "-scale-x-100"
                        )} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <Camera className="w-12 h-12 text-primary/20" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {isMarathi ? 'कॅमेरा स्टँडबाय' : 'Identity Standby'}
                        </p>
                      </div>
                    )}
                    
                    {isCameraActive && (
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 gap-3">
                        <Button 
                          type="button" 
                          onClick={takePhoto} 
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-14 px-8 shadow-2xl font-black uppercase text-xs tracking-widest active-scale"
                        >
                          {t.snapPhoto}
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
                    <div className="flex flex-col gap-3">
                      <Button 
                        type="button" 
                        onClick={() => startCamera()} 
                        className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 font-black uppercase text-xs tracking-widest active-scale shadow-lg"
                      >
                        <Camera className="w-5 h-5 mr-2" /> {t.liveCamera}
                      </Button>
                      <Button 
                        type="button" 
                        onClick={triggerGallery} 
                        variant="outline"
                        className="w-full border-2 border-primary/20 text-primary rounded-2xl h-14 font-black uppercase text-xs tracking-widest active-scale shadow-sm"
                      >
                        <Upload className="w-5 h-5 mr-2" /> {t.uploadGallery}
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  )}

                  {capturedPhoto && (
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        onClick={() => startCamera()} 
                        className="flex-1 bg-primary/5 text-primary hover:bg-primary/10 rounded-2xl h-14 font-black uppercase text-xs tracking-widest border-2 border-primary/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> {t.retake}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={clearPhoto} 
                        className="flex-1 rounded-2xl h-14 text-destructive hover:bg-destructive/5 font-black uppercase text-xs tracking-widest"
                      >
                        {t.remove}
                      </Button>
                    </div>
                  )}
                  
                  {hasCameraPermission === false && (
                    <Alert variant="destructive" className="rounded-2xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold uppercase">{isMarathi ? 'हार्डवेअर ब्लॉक' : 'Hardware Blocked'}</AlertTitle>
                      <AlertDescription className="text-[10px]">
                        {isMarathi ? 'कृपया कॅमेरा प्रवेश द्या किंवा अपलोड पर्याय वापरा.' : 'Please allow camera access or use the Upload option.'}
                      </AlertDescription>
                    </Alert>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.studentName}</FormLabel>
                        <FormControl>
                          <Input placeholder={isMarathi ? "पूर्ण नाव" : "Full Name"} className="rounded-xl border-2 h-12 font-bold" {...field} />
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
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.gender}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue placeholder={isMarathi ? "निवडा" : "Select"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">{t.male}</SelectItem>
                            <SelectItem value="Female">{t.female}</SelectItem>
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
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.std}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue />
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
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.dob}</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                          <Fingerprint className="w-3 h-3" /> {t.aadhar}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="12 Digit Aadhar" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {t.mobile}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="10 Digit Mobile" className="rounded-xl border-2 h-12 font-bold" {...field} />
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
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.height}</FormLabel>
                          <FormControl>
                            <Input type="number" className="rounded-xl border-2 h-12 font-bold" {...field} />
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
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.weight}</FormLabel>
                          <FormControl>
                            <Input type="number" className="rounded-xl border-2 h-12 font-bold" {...field} />
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
                        <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.bloodGroup}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_GROUPS.map(group => (
                              <SelectItem key={group} value={group}>{isMarathi && group === 'None' ? 'काहीही नाही' : group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isGeneral && (
                    <FormField
                      control={form.control}
                      name="examMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.examMarks}</FormLabel>
                          <FormControl>
                            <Input placeholder={isMarathi ? "१०० पैकी" : "Out of 100"} type="number" className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {!isGeneral && (
                  <div className="space-y-4">
                    <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest block">{t.sportsDiscipline}</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10">
                      {SPORTS_LIST.map((sport) => (
                        <FormField
                          key={sport}
                          control={form.control}
                          name="sports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-1">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(sport)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    return checked
                                      ? field.onChange([...current, sport])
                                      : field.onChange(current.filter((value: any) => value !== sport))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-bold text-foreground/80 cursor-pointer">
                                {sport}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <FormLabel className="font-black text-primary uppercase text-[10px] tracking-widest">{t.medical}</FormLabel>
                  <FormControl>
                    <Input placeholder={isMarathi ? "कोणतीही ऍलर्जी किंवा आजार" : "Any allergies or conditions"} className="rounded-xl border-2 h-12 font-bold" {...form.register('medical')} />
                  </FormControl>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t">
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "text-white font-black px-20 h-16 rounded-2xl shadow-xl transition-all active-scale text-lg uppercase tracking-widest",
                  isGeneral ? "bg-primary hover:bg-primary/90" : "bg-accent hover:bg-accent/90"
                )}
              >
                {t.enrollBtn}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
