"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  Sparkles,
  Trash2,
  ImageIcon,
  ShieldCheck,
  SunMedium,
  User,
  Info,
} from "lucide-react";
import type { Player } from "@/lib/types";
import {
  loadFaceModels,
  areFaceModelsLoaded,
  extractFaceDescriptor,
  extractFaceDescriptorFromImageUrl,
  playAttendanceChime,
  parseCameraError,
  analyzeFaceFrameQuality,
  FaceStabilityTracker,
  compressFacePhoto,
  type FaceQualityResult,
} from "@/lib/face-recognition";
import { getDisplayNameForLocale } from "@/lib/utils";

interface FaceEnrollmentModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  store: any;
  userRole?: string; // admin | teacher | coach | viewer
  language?: string;
  onEnrolled?: (player: Player) => void;
}

export function FaceEnrollmentModal({
  player,
  isOpen,
  onClose,
  store,
  userRole = "teacher",
  language = "English",
  onEnrolled,
}: FaceEnrollmentModalProps) {
  const isMarathi = language === "Marathi";
  const isViewer = userRole === "viewer";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stabilityTrackerRef = useRef<FaceStabilityTracker>(new FaceStabilityTracker(1000));

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [cameraError, setCameraError] = useState<{ message: string; actionable: string } | null>(null);
  const [qualityResult, setQualityResult] = useState<FaceQualityResult | null>(null);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraActive, setCameraActive] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);

  // Stop camera tracks safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    stabilityTrackerRef.current.reset();
    setStabilityProgress(0);
    setQualityResult(null);
  }, []);

  // Start camera feed with explicit constraints and error classification
  const startCamera = useCallback(
    async (modeOverride?: "user" | "environment") => {
      stopCamera();
      setCameraError(null);
      const targetMode = modeOverride || facingMode;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("autoplay", "true");
          videoRef.current.muted = true;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err: any) {
        console.warn("Primary camera stream request failed, attempting fallback...", err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.setAttribute("autoplay", "true");
            videoRef.current.muted = true;
            await videoRef.current.play();
            setCameraActive(true);
          }
        } catch (fallbackErr: any) {
          console.error("Camera access failed:", fallbackErr);
          const parsed = parseCameraError(fallbackErr);
          setCameraError({
            message: isMarathi ? parsed.messageMr : parsed.messageEn,
            actionable: isMarathi ? parsed.actionableMr : parsed.actionableEn,
          });
        }
      }
    },
    [facingMode, isMarathi, stopCamera]
  );

  // Initialize models and camera on open
  useEffect(() => {
    let isCancelled = false;

    if (isOpen && player) {
      setEnrolledSuccess(false);
      setCapturedPhoto(player.faceEnrolledPhotoUrl || null);
      setIsLoadingModels(true);
      setModelLoadError(false);

      loadFaceModels().then((loaded) => {
        if (!isCancelled) {
          setIsLoadingModels(false);
          if (loaded) {
            startCamera();
          } else {
            setModelLoadError(true);
          }
        }
      });
    } else {
      stopCamera();
    }

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, player, startCamera, stopCamera]);

  // Retry loading face models
  const handleRetryModels = async () => {
    setIsLoadingModels(true);
    setModelLoadError(false);
    const loaded = await loadFaceModels(true);
    setIsLoadingModels(false);
    if (loaded) {
      startCamera();
    } else {
      setModelLoadError(true);
    }
  };

  // Helper to store descriptor and compressed snapshot
  const handleEnrollDescriptor = useCallback(
    async (
      descriptor: Float32Array,
      sourceElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ) => {
      if (!player || isProcessing || isViewer) return;

      setIsProcessing(true);
      try {
        // Compress snapshot to small JPEG DataURL (max 320px) to prevent bloating Firestore
        const compressedPhoto = compressFacePhoto(sourceElement, 320, 0.85);
        const descriptorArray = Array.from(descriptor);

        const updatedPlayer: Player = {
          ...player,
          faceDescriptor: descriptorArray,
          faceDescriptors: [descriptorArray],
          faceEnrolledAt: new Date().toISOString(),
          faceEnrolledPhotoUrl: compressedPhoto,
        };

        store.updatePlayer(updatedPlayer);
        setCapturedPhoto(compressedPhoto);
        setEnrolledSuccess(true);
        playAttendanceChime("success");

        if (onEnrolled) {
          onEnrolled(updatedPlayer);
        }
      } catch (e: any) {
        console.error("Enrollment failed:", e);
        alert(
          isMarathi
            ? "चेहरा नोंदणी अयशस्वी झाली: " + (e?.message || "")
            : "Face enrollment failed: " + (e?.message || "")
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [player, isProcessing, isViewer, store, isMarathi, onEnrolled]
  );

  // Real-time face quality & stability checker loop
  useEffect(() => {
    let animId: number;
    let isChecking = false;

    const checkQualityLoop = async () => {
      const video = videoRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        !isProcessing &&
        !enrolledSuccess &&
        !isChecking &&
        cameraActive &&
        areFaceModelsLoaded()
      ) {
        isChecking = true;
        try {
          const result = await analyzeFaceFrameQuality(video, 0.25);
          setQualityResult(result);

          const { isStable, progressPercent } = stabilityTrackerRef.current.update(result.isAcceptable);
          setStabilityProgress(progressPercent);

          if (isStable && result.isAcceptable && result.descriptor && !isProcessing) {
            // Auto capture on stable hold
            handleEnrollDescriptor(result.descriptor, video);
          }
        } catch (e) {
          // ignore loop cycle error
        } finally {
          isChecking = false;
        }
      }

      animId = requestAnimationFrame(checkQualityLoop);
    };

    if (isOpen && !isLoadingModels && !cameraError && !modelLoadError) {
      animId = requestAnimationFrame(checkQualityLoop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    isOpen,
    isLoadingModels,
    cameraError,
    modelLoadError,
    isProcessing,
    enrolledSuccess,
    cameraActive,
    handleEnrollDescriptor,
  ]);

  // Toggle front/back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Manual Capture button
  const handleManualCapture = async () => {
    if (!videoRef.current || !player || isProcessing || isViewer) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const result = await extractFaceDescriptor(video);

      if (!result) {
        alert(
          isMarathi
            ? "चेहरा स्पष्ट दिसत नाही. कृपया चेहऱ्यावर चांगला प्रकाश ठेवा आणि सरळ कॅमेऱ्याकडे पहा."
            : "No clear face detected. Please ensure good lighting and look directly at the camera."
        );
        setIsProcessing(false);
        return;
      }

      await handleEnrollDescriptor(result.descriptor, video);
    } catch (e: any) {
      console.error("Manual capture failed:", e);
      alert(
        isMarathi
          ? "नोंदणी करताना त्रुटी आली: " + (e?.message || "")
          : "Enrollment error: " + (e?.message || "")
      );
      setIsProcessing(false);
    }
  };

  // Extract and enroll face using existing profile photo URL/Base64
  const existingPhoto = player?.photoUrl || player?.aadharPhotoUrl;
  const handleEnrollFromExistingPhoto = async () => {
    if (!existingPhoto || !player || isProcessing || isViewer) return;

    setIsProcessing(true);
    try {
      const result = await extractFaceDescriptorFromImageUrl(existingPhoto);

      if (!result) {
        alert(
          isMarathi
            ? "फोटोमधील कमी प्रकाश (low light), चुकीचा अँगल (face angle) किंवा अस्पष्टतेमुळे चेहरा ओळखता आला नाही. कृपया थेट कॅमेऱ्याने चांगल्या प्रकाशात चेहरा नोंदवा."
            : "Could not add face from photo due to low lighting, face angle, or blur. Please proceed using the live camera in good lighting."
        );
        setIsProcessing(false);
        return;
      }

      const descriptorArray = Array.from(result.descriptor);
      const updatedPlayer: Player = {
        ...player,
        faceDescriptor: descriptorArray,
        faceDescriptors: [descriptorArray],
        faceEnrolledAt: new Date().toISOString(),
        faceEnrolledPhotoUrl: existingPhoto,
      };

      store.updatePlayer(updatedPlayer);
      setCapturedPhoto(existingPhoto);
      setEnrolledSuccess(true);
      playAttendanceChime("success");

      if (onEnrolled) {
        onEnrolled(updatedPlayer);
      }
    } catch (e: any) {
      console.error("Enrollment from photo failed:", e);
      alert(
        isMarathi
          ? "फोटोवरून चेहरा नोंदणी अयशस्वी: " + (e?.message || "")
          : "Photo enrollment failed: " + (e?.message || "")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove enrolled face data
  const handleRemoveFaceData = () => {
    if (!player || isViewer) return;
    const confirmMsg = isMarathi
      ? "तुम्हाला खात्री आहे की चेहरा नोंदणी डेटा हटवायचा आहे?"
      : "Are you sure you want to remove the registered face data for this student?";

    if (window.confirm(confirmMsg)) {
      const updatedPlayer: Player = {
        ...player,
        faceDescriptor: undefined,
        faceDescriptors: undefined,
        faceEnrolledAt: undefined,
        faceEnrolledPhotoUrl: undefined,
      };
      store.updatePlayer(updatedPlayer);
      setCapturedPhoto(null);
      setEnrolledSuccess(false);
      stabilityTrackerRef.current.reset();
      setStabilityProgress(0);
      if (onEnrolled) onEnrolled(updatedPlayer);
      startCamera();
    }
  };

  if (!player) return null;

  const displayName = getDisplayNameForLocale(
    player.name,
    player.nameMarathi,
    isMarathi ? "mr" : "en"
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-slate-950 text-slate-50 border-slate-800 shadow-2xl">
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  {isMarathi ? "बायोमेट्रिक चेहरा नोंदणी" : "Biometric Face Registration"}
                  {player.faceDescriptor && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {isMarathi ? "नोंदणीकृत" : "Enrolled"}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  {displayName} • {player.std ? `Std ${player.std}` : "Athlete"} • Roll:{" "}
                  {player.serialNumber || player.generalRegisterNumber || "---"}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleCamera}
              className="h-8 px-2.5 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 font-bold shadow-sm"
              title={isMarathi ? "पुढील/मागील कॅमेरा बदला" : "Switch Front/Back Camera"}
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">
                {facingMode === "environment"
                  ? isMarathi
                    ? "मागील (Back)"
                    : "Back Cam"
                  : isMarathi
                  ? "पुढील (Front)"
                  : "Front Cam"}
              </span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 flex flex-col items-center gap-3">
          {/* Biometric Privacy Notice Banner */}
          <div className="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-start gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-300">
              {isMarathi
                ? "सुरक्षित बायोमेट्रिक: चेहरा डेटा फक्त १२८-अंकी एन्क्रिप्टेड संख्या स्वरूपात साठवला जातो. कोणताही खाजगी फोटो शेअर केला जात नाही."
                : "Biometric Privacy: Face vectors are converted into 128 encrypted geometric points. Raw photos are not shared with third parties."}
            </p>
          </div>

          {/* Viewer Warning */}
          {isViewer && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-amber-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {isMarathi
                  ? "आपण 'पाहक' (Viewer) मोडमध्ये आहात. चेहरा नोंदणी किंवा बदल फक्त शिक्षक/प्रशासक करू शकतात."
                  : "You have Viewer role. Only coaches/teachers can enroll or modify face biometric data."}
              </span>
            </div>
          )}

          {/* Use Existing Profile Photo Banner */}
          {existingPhoto && !enrolledSuccess && !isViewer && (
            <div className="w-full bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={existingPhoto}
                    alt="Student Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {isMarathi ? "सध्याचा फोटो उपलब्ध" : "Profile Photo Found"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isMarathi
                      ? "कॅमेरा न वापरता थेट फोटोवरून नोंदवा"
                      : "Auto-enroll directly from existing photo"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing || isLoadingModels}
                onClick={handleEnrollFromExistingPhoto}
                className="text-xs font-bold bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 shrink-0 h-9 px-3 gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                {isMarathi ? "फोटो वापरा" : "Use Photo"}
              </Button>
            </div>
          )}

          {/* Camera Viewport */}
          <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner">
            {isLoadingModels ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-sm font-semibold">
                  {isMarathi ? "फेस डिटेक्शन लोड होत आहे..." : "Loading face detection..."}
                </span>
                <span className="text-xs text-slate-500">
                  {isMarathi ? "कृत्रिम बुद्धिमत्ता मॉडेल तयार होत आहेत" : "Initializing neural vision models"}
                </span>
              </div>
            ) : modelLoadError ? (
              <div className="p-4 text-center text-rose-400 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <span className="font-bold">
                  {isMarathi ? "फेस मॉडेल लोड अयशस्वी झाले" : "Face model failed to load"}
                </span>
                <Button size="sm" variant="outline" onClick={handleRetryModels} className="mt-2 text-white">
                  <RotateCw className="w-3.5 h-3.5 mr-1" />
                  {isMarathi ? "पुन्हा प्रयत्न करा" : "Retry face detection"}
                </Button>
              </div>
            ) : cameraError ? (
              <div className="p-5 text-center text-rose-400 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <span className="font-bold text-sm">{cameraError.message}</span>
                <span className="text-[11px] text-slate-400">{cameraError.actionable}</span>
                <Button size="sm" variant="outline" onClick={() => startCamera()} className="mt-3 text-white">
                  <RotateCw className="w-3.5 h-3.5 mr-1" />
                  {isMarathi ? "कॅमेरा पुन्हा सुरू करा" : "Retry Camera"}
                </Button>
              </div>
            ) : enrolledSuccess && capturedPhoto ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedPhoto}
                  alt="Enrolled Face"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 p-4 text-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                  <span className="text-base font-bold mt-2">
                    {isMarathi ? "चेहरा यशस्वीरित्या नोंदवला गेला! ✓" : "Face Successfully Registered! ✓"}
                  </span>
                  <span className="text-xs text-emerald-200/80 mt-1">
                    {isMarathi ? "आता हजेरी स्कॅनरमध्ये ओळखता येईल" : "Ready for instant AI attendance"}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={`w-full h-full object-cover ${
                    facingMode === "user" ? "scale-x-[-1]" : ""
                  }`}
                />

                {/* Face Alignment Oval Guide with Dynamic Color State */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-44 h-56 rounded-[50%] border-2 transition-all duration-300 ${
                      qualityResult?.isAcceptable
                        ? "border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.6)] scale-100"
                        : qualityResult?.code === "NO_FACE"
                        ? "border-dashed border-slate-500/70 scale-95"
                        : "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-95"
                    }`}
                  />
                </div>

                {/* Real-time Dynamic Actionable Status Pill */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-center pointer-events-none">
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 ${
                      qualityResult?.isAcceptable
                        ? "bg-emerald-500/90 text-slate-950"
                        : qualityResult?.code === "POOR_LIGHTING" || qualityResult?.code === "HIGH_GLARE"
                        ? "bg-amber-500/90 text-slate-950"
                        : qualityResult?.code === "MULTIPLE_FACES" || qualityResult?.code === "OUTSIDE_FRAME"
                        ? "bg-rose-500/90 text-white"
                        : "bg-slate-900/85 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {qualityResult ? (
                      isMarathi ? qualityResult.messageMr : qualityResult.messageEn
                    ) : isMarathi ? (
                      "चेहरा मार्गदर्शकात आणा..."
                    ) : (
                      "Align face in guide..."
                    )}
                  </div>
                </div>

                {/* Stability Progress Bar (Auto-capture hold timer) */}
                {stabilityProgress > 0 && !enrolledSuccess && (
                  <div className="absolute bottom-3 inset-x-6 flex flex-col items-center gap-1">
                    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-full overflow-hidden p-0.5 border border-emerald-500/40">
                      <Progress value={stabilityProgress} className="h-2 bg-slate-800" />
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold drop-shadow">
                      {isMarathi ? "स्थिर राहा... नोंदणी होत आहे" : "Hold steady... registering"} ({stabilityProgress}%)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Controls */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            {player.faceDescriptor && !isViewer ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveFaceData}
                className="gap-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isMarathi ? "नोंदणी रद्द करा" : "Clear Face Data"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {isMarathi ? "बंद करा" : "Close"}
              </Button>

              {!isViewer && (
                <Button
                  onClick={enrolledSuccess ? () => { setEnrolledSuccess(false); startCamera(); } : handleManualCapture}
                  disabled={
                    isLoadingModels ||
                    !!cameraError ||
                    modelLoadError ||
                    isProcessing ||
                    (!enrolledSuccess && !qualityResult?.isAcceptable)
                  }
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isMarathi ? "प्रक्रिया..." : "Processing..."}
                    </>
                  ) : enrolledSuccess ? (
                    <>
                      <RotateCw className="w-4 h-4" />
                      {isMarathi ? "पुन्हा स्कॅन करा" : "Re-Scan"}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      {isMarathi ? "चेहरा नोंदवा" : "Enroll Face"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
