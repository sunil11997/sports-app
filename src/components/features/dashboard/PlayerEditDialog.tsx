"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  UserCheck,
  Camera,
  Upload,
  CircleX,
  Type,
  Ruler,
  Weight,
  Phone,
  FileDigit,
  Home,
  ScanFace,
  Eye,
  EyeOff,
  Trophy,
  User,
  Shirt,
  Target,
  Medal,
  Award,
  Activity,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import {
  getAgeValidation,
  transliterateEnglishToMarathi,
  cn,
} from '@/lib/utils';
import { compressImage, maskAadhaar, isValidAadhaar } from '@/lib/privacy-utils';

const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SPORTS_LIST = [
  'Kabaddi',
  'Volleyball',
  'Kho Kho',
  'Handball',
  'Running',
  'Shot Put',
  'Javelin Throw',
  'Disc Throw',
  'Long Jump',
  'High Jump',
  'Athletics',
  'Yoga',
  'PT Mass',
];

const SPORT_CONFIG: Record<string, { mr: string; category: string; iconLabel: string; isSquad12?: boolean }> = {
  'Kabaddi': { mr: 'कबड्डी', category: 'सांघिक संघ (12 Squad)', iconLabel: '🤼', isSquad12: true },
  'Volleyball': { mr: 'व्हॉलीबॉल', category: 'सांघिक संघ (12 Squad)', iconLabel: '🏐', isSquad12: true },
  'Kho Kho': { mr: 'खो खो', category: 'सांघिक संघ (12 Squad)', iconLabel: '🏃', isSquad12: true },
  'Handball': { mr: 'हॅन्डबॉल', category: 'सांघिक संघ (12 Squad)', iconLabel: '🤾', isSquad12: true },
  'Running': { mr: 'धावणे (रनिंग)', category: 'ट्रॅक इव्हेंट (Track)', iconLabel: '⚡' },
  'Shot Put': { mr: 'गोळाफेक', category: 'थ्रो इव्हेंट (Field)', iconLabel: '☄️' },
  'Javelin Throw': { mr: 'भालाफेक', category: 'थ्रो इव्हेंट (Field)', iconLabel: '🗡️' },
  'Disc Throw': { mr: 'थाळीफेक', category: 'थ्रो इव्हेंट (Field)', iconLabel: '🥏' },
  'Long Jump': { mr: 'लांब उडी', category: 'जंप इव्हेंट (Field)', iconLabel: '🦘' },
  'High Jump': { mr: 'उंच उडी', category: 'जंप इव्हेंट (Field)', iconLabel: '🪜' },
  'Athletics': { mr: 'मैदानी स्पर्धा (ऍथलेटिक्स)', category: 'मैदानी महोत्सव', iconLabel: '🏅' },
  'Yoga': { mr: 'योगासने', category: 'विशेष प्रात्यक्षिक', iconLabel: '🧘' },
  'PT Mass': { mr: 'पी.टी. कवायत', category: 'विशेष संचलन', iconLabel: '🚩' }
};

const SPORT_POSITION_OPTIONS: Record<string, { code: string; labelMr: string }[]> = {
  'Kabaddi': [
    { code: 'RC', labelMr: 'उजवा कोपरा (Right Corner #1)' },
    { code: 'LC', labelMr: 'डावा कोपरा (Left Corner #7)' },
    { code: 'RI', labelMr: 'उजवा इन (Right In #2)' },
    { code: 'LI', labelMr: 'डावा इन (Left In #6)' },
    { code: 'RCv', labelMr: 'उजवा कव्हर (Right Cover #3)' },
    { code: 'LCv', labelMr: 'डावा कव्हर (Left Cover #5)' },
    { code: 'CTR', labelMr: 'मध्यरक्षक / सेंटर (Center #4)' },
    { code: 'RDR', labelMr: 'मुख्य चढाईपटू (Main Raider)' },
    { code: 'AR', labelMr: 'ऑल-राउंडर (All-Rounder)' }
  ],
  'Volleyball': [
    { code: 'SET', labelMr: 'सेटर / पासर (Setter / Playmaker)' },
    { code: 'OH', labelMr: 'आक्रमक / स्मॅशर (Outside Hitter / Spiker)' },
    { code: 'MB', labelMr: 'मध्यरक्षक / ब्लॉकर (Middle Blocker)' },
    { code: 'OPP', labelMr: 'विरुद्ध आक्रमक (Opposite Hitter)' },
    { code: 'LIB', labelMr: 'लिबेरो / मुख्य बचावपटू (Libero)' },
    { code: 'UNI', labelMr: 'युनिव्हर्सल खेळाडू (Universal Player)' }
  ],
  'Kho Kho': [
    { code: 'CH', labelMr: 'आक्रमक पाठलागपटू (Active Chaser)' },
    { code: 'R1', labelMr: 'धावपटू तुकडी १ (Runner Batch 1)' },
    { code: 'R2', labelMr: 'धावपटू तुकडी २ (Runner Batch 2)' },
    { code: 'R3', labelMr: 'धावपटू तुकडी ३ (Runner Batch 3)' },
    { code: 'PD', labelMr: 'पोल डायव्हर (Pole Diver)' },
    { code: 'AR', labelMr: 'ऑल-राउंडर (All-Rounder)' }
  ],
  'Handball': [
    { code: 'GK', labelMr: 'गोलरक्षक (Goalkeeper)' },
    { code: 'LW', labelMr: 'डावा विंग (Left Wing)' },
    { code: 'RW', labelMr: 'उजवा विंग (Right Wing)' },
    { code: 'CB', labelMr: 'मध्य फळी (Center Back / Playmaker)' },
    { code: 'PV', labelMr: 'पिव्हट / लाईन खेळाडू (Pivot)' },
    { code: 'LB', labelMr: 'डावा बॅक (Left Back)' },
    { code: 'RB', labelMr: 'उजवा बॅक (Right Back)' }
  ],
  'Running': [
    { code: '100M', labelMr: '१०० मी. धावणे (100m Sprint)' },
    { code: '200M', labelMr: '२०० मी. धावणे (200m Sprint)' },
    { code: '400M', labelMr: '४०० मी. धावणे (400m Run)' },
    { code: 'RELAY', labelMr: '४x१०० रिले (4x100m Relay)' }
  ],
  'Athletics': [
    { code: '100M', labelMr: '१०० मी. धावणे (100m Sprint)' },
    { code: '200M', labelMr: '२०० मी. धावणे (200m Sprint)' },
    { code: '400M', labelMr: '४०० मी. धावणे (400m Run)' },
    { code: 'RELAY', labelMr: '४x१०० रिले (4x100m Relay)' },
    { code: 'LJ', labelMr: 'लांब उडी (Long Jump)' },
    { code: 'HJ', labelMr: 'उंच उडी (High Jump)' },
    { code: 'SP', labelMr: 'गोळाफेक (Shot Put)' },
    { code: 'JT', labelMr: 'भालाफेक (Javelin Throw)' },
    { code: 'DT', labelMr: 'थाळीफेक (Discus Throw)' }
  ],
  'Yoga': [
    { code: 'ASANA', labelMr: 'आसन प्रात्यक्षिकपटू (Asana Performer)' },
    { code: 'LEAD', labelMr: 'सूर्य नमस्कार संघ प्रमुख (Surya Namaskar Lead)' },
    { code: 'BAL', labelMr: 'संतुलन आसन विशेष (Balance Asana)' }
  ],
  'PT Mass': [
    { code: 'DRILL', labelMr: 'कवायतपटू (Mass PT Performer)' },
    { code: 'CMD', labelMr: 'पुढील रांग कमांडर (Front Row Lead)' },
    { code: 'FLAG', labelMr: 'ध्वज संचलन पथक (March Squad)' }
  ]
};

interface PlayerEditDialogProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
}

export function PlayerEditDialog({
  player,
  isOpen,
  onClose,
  onSave,
}: PlayerEditDialogProps) {
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(player);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);
  const [activeCam, setActiveCam] = useState<'profile' | 'aadhar' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const aadharUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingPlayer(player ? { ...player } : null);
  }, [player]);

  // Clean unmount for low RAM devices to prevent camera memory leaks
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          try { track.stop(); } catch (e) {}
        });
      }
    };
  }, [stream]);

  const ageValidation = useMemo(
    () => getAgeValidation(editingPlayer?.dob),
    [editingPlayer?.dob]
  );

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) {}
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setActiveCam(null);
  };

  const startCamera = async (
    type: 'profile' | 'aadhar',
    mode: 'user' | 'environment' = 'environment'
  ) => {
    stopCamera();
    try {
      const constraints = { video: { facingMode: mode }, audio: false };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setActiveCam(type);
      setFacingMode(mode);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackStream);
        setActiveCam(type);
        setFacingMode('user');
      } catch {
        // Camera unavailable or denied
      }
    }
  };

  const takePhoto = async () => {
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
        try {
          const compressed = await compressImage(canvas.toDataURL('image/jpeg', 0.85), 800, 0.75);
          if (activeCam === 'profile') {
            setEditingPlayer({ ...editingPlayer, photoUrl: compressed.dataUrl });
          } else {
            setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: compressed.dataUrl });
          }
        } catch {
          const rawUrl = canvas.toDataURL('image/jpeg', 0.7);
          if (activeCam === 'profile') {
            setEditingPlayer({ ...editingPlayer, photoUrl: rawUrl });
          } else {
            setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: rawUrl });
          }
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'aadhar'
  ) => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      try {
        const compressed = await compressImage(file, 800, 0.75);
        if (type === 'profile') {
          setEditingPlayer({ ...editingPlayer, photoUrl: compressed.dataUrl });
        } else {
          setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: compressed.dataUrl });
        }
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (type === 'profile') {
            setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
          } else {
            setEditingPlayer({ ...editingPlayer, aadharPhotoUrl: dataUrl });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && stream && activeCam) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeCam]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async () => {
    if (!editingPlayer) return;

    try {
      setIsSubmitting(true);
      const finalName = (editingPlayer.name || '').trim();
      const finalNameMarathi =
        (editingPlayer.nameMarathi || '').trim() || transliterateEnglishToMarathi(finalName);

      if (!finalName && !finalNameMarathi) {
        toast({
          title: "नाव आवश्यक आहे (Name Required)",
          description: "कृपया विद्यार्थ्यांचे नाव प्रविष्ट करा.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const primary = editingPlayer.primarySport || editingPlayer.sports?.[0] || '';
      const jersey = (editingPlayer.jerseyNumber || '').replace(/[^0-9]/g, '');
      const pos = (editingPlayer.position || '').trim();

      const updatedJerseyNumbers = {
        ...(editingPlayer.jerseyNumbers || {}),
        ...(primary && jersey ? { [primary]: jersey } : {})
      };
      const updatedPositions = {
        ...(editingPlayer.positions || {}),
        ...(primary && pos ? { [primary]: pos } : {})
      };

      const updated: Player = {
        ...editingPlayer,
        name: finalName || finalNameMarathi,
        nameMarathi: finalNameMarathi || finalName,
        motherName: editingPlayer.motherName?.trim() || '',
        fatherName: editingPlayer.fatherName?.trim() || '',
        saralId: editingPlayer.saralId?.trim() || '',
        category: editingPlayer.category || 'student',
        primarySport: primary || '',
        jerseyNumber: jersey || '',
        jerseyNumbers: Object.keys(updatedJerseyNumbers).length > 0 ? updatedJerseyNumbers : {},
        position: pos || '',
        positions: Object.keys(updatedPositions).length > 0 ? updatedPositions : {},
        age: ageValidation ? ageValidation.ageYears : (editingPlayer.age || 0),
        ageCategory: ageValidation ? ageValidation.category : (editingPlayer.ageCategory || 'None'),
        ageDetailed: ageValidation ? ageValidation.ageString : (editingPlayer.ageDetailed || ''),
      };

      stopCamera();
      if (onSave) {
        await onSave(updated);
      }
      toast({
        title: "माहिती यशस्वीरित्या जतन झाली! (Information Saved Successfully!)",
        description: `${updated.nameMarathi || updated.name} ची संस्थात्मक माहिती यशस्वीरित्या अद्ययावत केली.`,
        className: "bg-emerald-600 text-white font-bold"
      });
      handleClose();
    } catch (err: any) {
      console.warn("Notice during player save:", err);
      toast({
        title: "जतन करताना त्रुटी आली (Save Error)",
        description: "माहिती जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
        variant: "destructive"
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editingPlayer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-[850px] rounded-2xl sm:rounded-[3rem] p-0 overflow-hidden max-h-[92dvh] h-[92dvh] sm:h-[85vh] flex flex-col border-none shadow-3xl bg-white gap-0">
        <DialogHeader className="bg-primary p-4 sm:p-8 text-white shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
              <UserCheck className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-2xl font-black uppercase tracking-tight">
                Institutional Profile Editor
              </DialogTitle>
              <p className="text-[10px] sm:text-xs text-white/70 font-medium mt-0.5">
                G.R. No: {editingPlayer.generalRegisterNumber || '---'} &bull; Standard {editingPlayer.std}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-8 touch-pan-y scrollbar-thin">
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Visual Documents Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Photo */}
              <div className="p-4 border-2 rounded-2xl bg-slate-50 flex flex-col items-center gap-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Student Photo (छायाचित्र)
                </Label>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center shadow-inner">
                  {activeCam === 'profile' ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : editingPlayer.photoUrl ? (
                    <Image src={editingPlayer.photoUrl} alt="Student" fill unoptimized className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                {activeCam === 'profile' ? (
                  <div className="flex gap-2 w-full">
                    <Button size="sm" onClick={takePhoto} className="flex-1 h-9 rounded-xl font-black text-[10px]">
                      Capture
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopCamera} className="h-9 w-9 p-0 rounded-xl">
                      <CircleX className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-xl font-black text-[9px] uppercase tracking-wider"
                      onClick={() => startCamera('profile', 'user')}
                    >
                      <Camera className="w-3 h-3 mr-1" /> Front Camera
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => profileUploadRef.current?.click()}
                      className="h-9 w-9 p-0 rounded-xl border-2"
                      title="Upload Image"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </Button>
                    <input
                      type="file"
                      ref={profileUploadRef}
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profile')}
                    />
                  </div>
                )}
              </div>

              {/* Aadhaar Photo Scan */}
              <div className="p-4 border-2 rounded-2xl bg-slate-50 flex flex-col items-center gap-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Aadhaar Document Scan
                </Label>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center shadow-inner">
                  {activeCam === 'aadhar' ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : editingPlayer.aadharPhotoUrl ? (
                    <Image src={editingPlayer.aadharPhotoUrl} alt="Aadhaar" fill unoptimized className="object-cover" />
                  ) : (
                    <ScanFace className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                {activeCam === 'aadhar' ? (
                  <div className="flex gap-2 w-full">
                    <Button size="sm" onClick={takePhoto} className="flex-1 h-9 rounded-xl font-black text-[10px]">
                      Capture
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopCamera} className="h-9 w-9 p-0 rounded-xl">
                      <CircleX className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-xl font-black text-[9px] uppercase tracking-wider"
                      onClick={() => startCamera('aadhar', 'environment')}
                    >
                      <Camera className="w-3 h-3 mr-1" /> Back Scan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => aadharUploadRef.current?.click()}
                      className="h-9 w-9 p-0 rounded-xl border-2"
                      title="Upload Scan"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </Button>
                    <input
                      type="file"
                      ref={aadharUploadRef}
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'aadhar')}
                    />
                  </div>
                )}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> Full Name (English)
                </Label>
                <Input
                  value={editingPlayer.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const mr = transliterateEnglishToMarathi(val);
                    setEditingPlayer({ ...editingPlayer, name: val, nameMarathi: mr });
                  }}
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> संपूर्ण नाव (मराठी)
                </Label>
                <Input
                  value={editingPlayer.nameMarathi || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, nameMarathi: e.target.value })}
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>
            </div>

            {/* Parents & Saral ID Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Mother&apos;s Name (आईचे नाव)
                  </Label>
                  <span className="text-[9px] text-muted-foreground font-semibold">ऐच्छिक (Optional)</span>
                </div>
                <Input
                  value={editingPlayer.motherName || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, motherName: e.target.value })}
                  placeholder="आईचे नाव / Mother's Name"
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Father&apos;s Name (वडिलांचे नाव)
                  </Label>
                  <span className="text-[9px] text-muted-foreground font-semibold">ऐच्छिक (Optional)</span>
                </div>
                <Input
                  value={editingPlayer.fatherName || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, fatherName: e.target.value })}
                  placeholder="वडिलांचे नाव / Father's Name"
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <FileDigit className="w-3 h-3" /> Saral ID No (सरल आयडी क्र.)
                  </Label>
                  <span className="text-[9px] text-muted-foreground font-semibold">ऐच्छिक (Optional)</span>
                </div>
                <Input
                  value={editingPlayer.saralId || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, saralId: e.target.value })}
                  placeholder="19-digit Saral ID Number"
                  className="h-11 border-2 rounded-xl font-bold text-xs font-mono"
                />
              </div>
            </div>

            {/* Standard, G.R. Number, Gender, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Standard (इयत्ता)
                </Label>
                <Select
                  value={String(editingPlayer.std || '1')}
                  onValueChange={(val) => setEditingPlayer({ ...editingPlayer, std: val })}
                >
                  <SelectTrigger className="h-11 border-2 rounded-xl font-bold text-xs">
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                      <SelectItem key={s} value={String(s)} className="font-bold text-xs">
                        Class {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  G.R. Number (नोंदणी क्र.)
                </Label>
                <Input
                  value={editingPlayer.generalRegisterNumber || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, generalRegisterNumber: e.target.value })}
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Gender (लिंग)
                </Label>
                <Select
                  value={editingPlayer.gender || 'Male'}
                  onValueChange={(val: any) => setEditingPlayer({ ...editingPlayer, gender: val })}
                >
                  <SelectTrigger className="h-11 border-2 rounded-xl font-bold text-xs">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male (मुलगा)</SelectItem>
                    <SelectItem value="Female">Female (मुलगी)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" /> Category (प्रवर्ग)
                </Label>
                <Select
                  value={editingPlayer.category || 'student'}
                  onValueChange={(val: 'athlete' | 'student') => setEditingPlayer({ ...editingPlayer, category: val })}
                >
                  <SelectTrigger className="h-11 border-2 rounded-xl font-bold text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="font-bold text-xs">General Student (विद्यार्थी)</SelectItem>
                    <SelectItem value="athlete" className="font-bold text-xs">Active Athlete (खेळाडू)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* DOB & Age Verification */}
            <div className="p-4 border-2 rounded-2xl bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Date of Birth (जन्मतारीख)
                </Label>
                {ageValidation && (
                  <Badge variant="outline" className="text-[10px] font-black bg-white">
                    Age: {ageValidation.ageYears} yrs &bull; {ageValidation.category}
                  </Badge>
                )}
              </div>
              <Input
                type="date"
                value={editingPlayer.dob || ''}
                onChange={(e) => setEditingPlayer({ ...editingPlayer, dob: e.target.value })}
                className="h-11 border-2 rounded-xl font-bold text-xs bg-white"
              />
            </div>

            {/* Aadhaar Number with Privacy Masking & PEN Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <FileDigit className="w-3 h-3" /> Aadhaar ID (आधार क्रमांक)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                    className="h-6 text-[10px] text-muted-foreground px-2"
                  >
                    {showFullAadhaar ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {showFullAadhaar ? 'Hide' : 'Reveal'}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type={showFullAadhaar ? 'text' : 'password'}
                    maxLength={12}
                    value={editingPlayer.aadharNumber || ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setEditingPlayer({ ...editingPlayer, aadharNumber: digits });
                    }}
                    placeholder="12-digit Aadhaar Number"
                    className="h-11 border-2 rounded-xl font-mono text-xs tracking-wider"
                  />
                  {!showFullAadhaar && editingPlayer.aadharNumber && (
                    <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                      Preview: {maskAadhaar(editingPlayer.aadharNumber)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <FileDigit className="w-3 h-3 text-accent" /> PEN No. (पेन क्रमांक / UDISE+)
                  </Label>
                  <span className="text-[9px] text-muted-foreground font-semibold">ऐच्छिक (Optional)</span>
                </div>
                <Input
                  value={editingPlayer.penNumber || editingPlayer.panNumber || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingPlayer({ ...editingPlayer, penNumber: val, panNumber: val });
                  }}
                  placeholder="11-digit PEN Number"
                  maxLength={20}
                  className="h-11 border-2 rounded-xl font-mono text-xs tracking-wider"
                />
              </div>
            </div>

            {/* Physical Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Ruler className="w-3 h-3" /> Height (cm)
                </Label>
                <Input
                  type="number"
                  value={editingPlayer.height || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, height: e.target.value })}
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Weight className="w-3 h-3" /> Weight (kg)
                </Label>
                <Input
                  type="number"
                  value={editingPlayer.weight || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, weight: e.target.value })}
                  className="h-11 border-2 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Blood Group
                </Label>
                <Select
                  value={editingPlayer.bloodGroup || 'None'}
                  onValueChange={(val) => setEditingPlayer({ ...editingPlayer, bloodGroup: val })}
                >
                  <SelectTrigger className="h-11 border-2 rounded-xl font-bold text-xs">
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg} className="font-bold text-xs">
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Athlete Roster Status Card */}
            <div className={cn(
              "p-4 rounded-2xl border-2 transition-all space-y-3",
              editingPlayer.category === 'athlete'
                ? "bg-amber-50/70 border-amber-300 shadow-sm"
                : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm transition-colors",
                    editingPlayer.category === 'athlete'
                      ? "bg-amber-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                      Athlete Status & Sports Roster
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {editingPlayer.category === 'athlete'
                        ? "नोंदणी: ॲक्टिव्ह खेळाडू (Active Athlete on Sports Roster)"
                        : "नोंदणी: सामान्य विद्यार्थी (General Student Only)"}
                    </p>
                  </div>
                </div>

                <Badge
                  className={cn(
                    "text-[10px] font-black px-2.5 py-1 uppercase tracking-wider",
                    editingPlayer.category === 'athlete'
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {editingPlayer.category === 'athlete' ? "🏆 Athlete Active" : "Student"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant={editingPlayer.category === 'athlete' ? "default" : "outline"}
                  onClick={() => setEditingPlayer({ ...editingPlayer, category: 'athlete' })}
                  className={cn(
                    "h-10 rounded-xl font-black text-[11px] uppercase tracking-wide gap-1.5 transition-all",
                    editingPlayer.category === 'athlete'
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                      : "border-2 hover:border-amber-300"
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" /> Add in Athlete (खेळाडू)
                </Button>

                <Button
                  type="button"
                  variant={editingPlayer.category !== 'athlete' ? "default" : "outline"}
                  onClick={() => setEditingPlayer({ ...editingPlayer, category: 'student' })}
                  className={cn(
                    "h-10 rounded-xl font-black text-[11px] uppercase tracking-wide gap-1.5 transition-all",
                    editingPlayer.category !== 'athlete'
                      ? "bg-primary text-white shadow-md"
                      : "border-2 hover:border-primary/40"
                  )}
                >
                  <User className="w-3.5 h-3.5" /> General Student (विद्यार्थी)
                </Button>
              </div>
            </div>

            {/* Sports & Tournament Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Medal className="w-3.5 h-3.5 text-accent" />
                  Sports Disciplines (सहभागी खेळ - सर्व १३ खेळ)
                </Label>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {(editingPlayer.sports || []).length} निवडले
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-4 border-2 rounded-2xl bg-slate-50">
                {SPORTS_LIST.map((sport) => {
                  const currentSports = editingPlayer.sports || [];
                  const isChecked = currentSports.includes(sport);
                  const conf = SPORT_CONFIG[sport] || { mr: sport, category: 'खेळ', iconLabel: '🏅' };
                  return (
                    <div
                      key={sport}
                      onClick={() => {
                        const next = isChecked
                          ? currentSports.filter((s) => s !== sport)
                          : [...currentSports, sport];
                        const primary = editingPlayer.primarySport === sport && isChecked
                          ? (next[0] || '')
                          : (!editingPlayer.primarySport && !isChecked ? sport : editingPlayer.primarySport);
                        setEditingPlayer({
                          ...editingPlayer,
                          sports: next,
                          primarySport: primary,
                          category: next.length > 0 ? 'athlete' : editingPlayer.category,
                        });
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                        isChecked
                          ? "bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/20"
                          : "bg-white/60 border-slate-200 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...currentSports, sport]
                              : currentSports.filter((s) => s !== sport);
                            setEditingPlayer({
                              ...editingPlayer,
                              sports: next,
                              category: next.length > 0 ? 'athlete' : editingPlayer.category,
                            });
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span>{conf.iconLabel}</span>
                            <span>{conf.mr}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{sport}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0.5">
                        {conf.category}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Tournament Athlete Settings (Only when sports selected or athlete) */}
              {(editingPlayer.category === 'athlete' || (editingPlayer.sports && editingPlayer.sports.length > 0)) && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Shirt className="w-4 h-4 text-indigo-600" />
                      <h5 className="text-[11px] font-black uppercase tracking-wider">
                        Tournament & Squad Configuration (स्पर्धा तपशील)
                      </h5>
                    </div>
                    <Badge className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                      🏆 Match Ready
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Tournament Sport */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                        <Target className="w-3 h-3 text-accent" /> मुख्य स्पर्धा खेळ (Primary Sport)
                      </Label>
                      <Select
                        value={editingPlayer.primarySport || editingPlayer.sports?.[0] || ''}
                        onValueChange={(val) => setEditingPlayer({ ...editingPlayer, primarySport: val })}
                      >
                        <SelectTrigger className="h-10 border-2 rounded-xl font-bold text-xs bg-white">
                          <SelectValue placeholder="खेळ निवडा" />
                        </SelectTrigger>
                        <SelectContent>
                          {(editingPlayer.sports && editingPlayer.sports.length > 0 ? editingPlayer.sports : SPORTS_LIST).map((s) => (
                            <SelectItem key={s} value={s} className="font-bold text-xs">
                              {SPORT_CONFIG[s]?.iconLabel} {SPORT_CONFIG[s]?.mr || s} ({s})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Official Jersey Number */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                          <Shirt className="w-3 h-3 text-indigo-600" /> जर्सी क्रमांक (Jersey #)
                        </Label>
                        <span className="text-[9px] text-muted-foreground font-semibold">१..१२ संघ</span>
                      </div>
                      <Input
                        type="text"
                        value={editingPlayer.jerseyNumber || ''}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, jerseyNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) })}
                        placeholder="उदा. 7"
                        className="h-10 border-2 rounded-xl font-black text-xs bg-white text-primary"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setEditingPlayer({ ...editingPlayer, jerseyNumber: n })}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-black border transition-all",
                              editingPlayer.jerseyNumber === n
                                ? "bg-indigo-600 text-white border-indigo-700"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            #{n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Position / Tactical Role */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                      <Activity className="w-3 h-3 text-accent" /> खेळातील स्थान / पोझिशन (Tactical Position)
                    </Label>
                    <Input
                      type="text"
                      value={editingPlayer.position || ''}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                      placeholder="उदा. Right Corner, Setter, Chaser, Raider..."
                      className="h-10 border-2 rounded-xl font-bold text-xs bg-white"
                    />
                    {(() => {
                      const curSport = editingPlayer.primarySport || editingPlayer.sports?.[0] || 'Kabaddi';
                      const opts = SPORT_POSITION_OPTIONS[curSport] || [];
                      if (opts.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                          {opts.map((opt) => (
                            <button
                              key={opt.code}
                              type="button"
                              onClick={() => setEditingPlayer({ ...editingPlayer, position: opt.labelMr })}
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all",
                                editingPlayer.position === opt.labelMr
                                  ? "bg-accent text-white border-accent shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              {opt.labelMr}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
 
        <DialogFooter className="p-4 sm:p-6 bg-slate-50 border-t shrink-0 flex flex-row items-center justify-between gap-3 z-10 sticky bottom-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="h-11 rounded-xl font-bold text-xs"
          >
            Cancel (रद्द करा)
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-11 px-8 rounded-xl font-black text-xs uppercase tracking-wider shadow-md bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                जतन करत आहे...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Save Changes (बदल जतन करा)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
