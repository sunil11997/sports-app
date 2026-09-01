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
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Player } from "@/lib/types";
import {
  loadFaceModels,
  extractFaceDescriptor,
  playAttendanceChime,
} from "@/lib/face-recognition";
import { getDisplayNameForLocale } from "@/lib/utils";

interface FaceEnrollmentModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  store: any;
  language?: string;
  onEnrolled?: (player: Player) => void;
}

export function FaceEnrollmentModal({
  player,
  isOpen,
  onClose,
  store,
  language = "English",
  onEnrolled,
}: FaceEnrollmentModalProps) {
  const isMarathi = language === "Marathi";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera feed
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        isMarathi
          ? "कॅमेरा सुरू करताना अडचण आली. कृपया कॅमेरा परवानगी तपासा."
          : "Could not access camera. Please verify camera permissions."
      );
    }
  }, [facingMode, isMarathi, stopCamera]);

  // Initialize models and camera on open
  useEffect(() => {
    let isCancelled = false;

    if (isOpen && player) {
      setEnrolledSuccess(false);
      setCapturedPhoto(player.faceEnrolledPhotoUrl || null);
      setIsLoadingModels(true);

      loadFaceModels().then((loaded) => {
        if (!isCancelled) {
          setIsLoadingModels(false);
          if (loaded) {
            startCamera();
          } else {
            setCameraError(
              isMarathi
                ? "फेस मॉडेल लोड होऊ शकले नाहीत. पुन्हा प्रयत्न करा."
                : "Failed to load face recognition models. Please retry."
            );
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
  }, [isOpen, player, startCamera, stopCamera, isMarathi]);

  // Real-time face presence checker loop
  useEffect(() => {
    let animId: number;
    let isChecking = false;

    const checkFace = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        !isProcessing &&
        !enrolledSuccess &&
        !isChecking
      ) {
        isChecking = true;
        try {
          const res = await extractFaceDescriptor(videoRef.current);
          setIsFaceDetected(!!res);
        } catch (e) {
          // ignore loop errors
        } finally {
          isChecking = false;
        }
      }
      animId = requestAnimationFrame(checkFace);
    };

    if (isOpen && !isLoadingModels && !cameraError) {
      animId = requestAnimationFrame(checkFace);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isLoadingModels, cameraError, isProcessing, enrolledSuccess]);

  // Toggle front/back camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Capture face and extract 128-d descriptor
  const handleCaptureAndEnroll = async () => {
    if (!videoRef.current || !player || isProcessing) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const result = await extractFaceDescriptor(video);

      if (!result) {
        alert(
          isMarathi
            ? "चेहरा स्पष्ट दिसत नाही. कृपया चेहऱ्यावर चांगला प्रकाश ठेवा आणि पुन्हा प्रयत्न करा."
            : "No clear face detected. Please ensure good lighting and look directly at the camera."
        );
        setIsProcessing(false);
        return;
      }

      // Draw snapshot to canvas to get preview image
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // If front camera, mirror image for natural orientation
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const descriptorArray = Array.from(result.descriptor);

      const updatedPlayer: Player = {
        ...player,
        faceDescriptor: descriptorArray,
        faceDescriptors: [descriptorArray],
        faceEnrolledAt: new Date().toISOString(),
        faceEnrolledPhotoUrl: photoDataUrl,
      };

      store.updatePlayer(updatedPlayer);
      setCapturedPhoto(photoDataUrl);
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
  };

  // Remove enrolled face data
  const handleRemoveFaceData = () => {
    if (!player) return;
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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-slate-950 text-slate-50 border-slate-800">
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
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
                  {displayName} • {player.std ? `Std ${player.std}` : "Athlete"} • Roll: {player.serialNumber || player.generalRegisterNumber || "---"}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCamera}
              className="text-slate-400 hover:text-white"
              title={isMarathi ? "कॅमेरा बदला" : "Switch Camera"}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 flex flex-col items-center gap-4">
          {/* Camera Viewport */}
          <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner">
            {isLoadingModels ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs">
                  {isMarathi ? "फेस AI मॉडेल लोड होत आहे..." : "Loading Face AI Engine..."}
                </span>
              </div>
            ) : cameraError ? (
              <div className="p-4 text-center text-rose-400 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8" />
                <span>{cameraError}</span>
                <Button size="sm" variant="outline" onClick={startCamera} className="mt-2">
                  {isMarathi ? "पुन्हा प्रयत्न करा" : "Retry"}
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
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                  <span className="text-sm font-bold mt-2">
                    {isMarathi ? "चेहरा यशस्वीरित्या नोंदवला गेला!" : "Face Successfully Registered!"}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === "user" ? "scale-x-[-1]" : ""
                  }`}
                />
                {/* Face Alignment Oval Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-48 h-60 rounded-[50%] border-2 transition-all duration-300 ${
                      isFaceDetected
                        ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-100"
                        : "border-dashed border-amber-400/70 scale-95"
                    }`}
                  />
                </div>

                {/* Real-time detection status pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className={`text-xs px-3 py-1 font-medium transition-colors ${
                      isFaceDetected
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md"
                    }`}
                  >
                    {isFaceDetected
                      ? isMarathi
                        ? "✓ चेहरा सापडला"
                        : "✓ Face Detected"
                      : isMarathi
                      ? "चेहरा फ्रेममध्ये आणा"
                      : "Align Face in Frame"}
                  </Badge>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            {player.faceDescriptor ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveFaceData}
                className="gap-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
                {isMarathi ? "नोंदणी रद्द करा" : "Clear Face Data"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {isMarathi ? "बंद करा" : "Close"}
              </Button>

              <Button
                onClick={handleCaptureAndEnroll}
                disabled={
                  isLoadingModels ||
                  !!cameraError ||
                  !isFaceDetected ||
                  isProcessing
                }
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isMarathi ? "प्रक्रिया सुरू आहे..." : "Processing..."}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
