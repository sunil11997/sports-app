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
} from 'lucide-react';
import type { Player } from '@/lib/types';
import {
  getAgeValidation,
  transliterateEnglishToMarathi,
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
];

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
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(player);
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

  const ageValidation = useMemo(
    () => getAgeValidation(editingPlayer?.dob),
    [editingPlayer?.dob]
  );

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
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

  const handleSubmit = () => {
    if (!editingPlayer) return;

    const finalName = (editingPlayer.name || '').trim();
    const finalNameMarathi =
      (editingPlayer.nameMarathi || '').trim() || transliterateEnglishToMarathi(finalName);

    const updated: Player = {
      ...editingPlayer,
      name: finalName,
      nameMarathi: finalNameMarathi,
      age: ageValidation ? ageValidation.ageYears : editingPlayer.age,
      ageCategory: ageValidation ? ageValidation.category : 'None',
      ageDetailed: ageValidation ? ageValidation.ageString : '',
    };

    stopCamera();
    onSave(updated);
  };

  if (!editingPlayer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[850px] rounded-2xl sm:rounded-[3rem] p-0 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col border-none shadow-3xl bg-white">
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

        <ScrollArea className="flex-1 p-4 sm:p-8">
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

            {/* Standard, G.R. Number, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Aadhaar Number with Privacy Masking */}
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

            {/* Sports Selection Checkboxes */}
            <div className="space-y-2 pt-2">
              <Label className="text-[10px] font-black uppercase tracking-wider text-primary">
                Sports Disciplines (सहभागी खेळ)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 border-2 rounded-2xl bg-slate-50">
                {SPORTS_LIST.map((sport) => {
                  const currentSports = editingPlayer.sports || [];
                  const isChecked = currentSports.includes(sport);
                  return (
                    <label
                      key={sport}
                      className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...currentSports, sport]
                            : currentSports.filter((s) => s !== sport);
                          setEditingPlayer({ ...editingPlayer, sports: next });
                        }}
                      />
                      <span>{sport}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 sm:p-6 bg-slate-50 border-t shrink-0 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleClose} className="h-11 rounded-xl font-bold text-xs">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="h-11 px-8 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
