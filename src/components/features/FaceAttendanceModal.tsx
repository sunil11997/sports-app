"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  Sun,
  Moon,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  UserCheck,
  Zap,
  ImageIcon,
  X,
} from "lucide-react";
import type { Player } from "@/lib/types";
import {
  loadFaceModels,
  areFaceModelsLoaded,
  detectAllFacesWithDescriptors,
  buildFaceMatcher,
  extractFaceDescriptorFromImageUrl,
  playAttendanceChime,
  speakAttendanceAnnounce,
  parseCameraError,
  analyzeFaceFrameQuality,
  type FaceQualityResult,
} from "@/lib/face-recognition";
import { getDisplayNameForLocale } from "@/lib/utils";

interface FaceAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  store?: any;
  activeSession: "Morning" | "Evening";
  onSessionChange?: (session: "Morning" | "Evening") => void;
  dateStr: string;
  attendance: Record<string, string | null>;
  onMarkAttendance: (
    playerId: string,
    dateStr: string,
    session: "Morning" | "Evening",
    status: "P"
  ) => void;
  language?: string;
}

interface ScanEvent {
  playerId: string;
  name: string;
  time: string;
  photoUrl?: string;
}

export function FaceAttendanceModal({
  isOpen,
  onClose,
  players,
  store,
  activeSession,
  onSessionChange,
  dateStr,
  attendance,
  onMarkAttendance,
  language = "English",
}: FaceAttendanceModalProps) {
  const isMarathi = language === "Marathi";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [cameraError, setCameraError] = useState<{ message: string; actionable: string } | null>(null);
  const [qualityResult, setQualityResult] = useState<FaceQualityResult | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<"Morning" | "Evening">(activeSession);
  const [isBatchEnrolling, setIsBatchEnrolling] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Debounce map to avoid re-triggering the same player within 8 seconds
  const lastMarkedRef = useRef<Record<string, number>>({});
  const isDetectingRef = useRef(false);
  const onMarkAttendanceRef = useRef(onMarkAttendance);
  onMarkAttendanceRef.current = onMarkAttendance;
  const lastQualityUpdateRef = useRef(0);

  useEffect(() => {
    setCurrentSession(activeSession);
  }, [activeSession]);

  const [enrolledVersion, setEnrolledVersion] = useState(0);

  // Filter players who have enrolled face descriptors
  const enrolledPlayers = useMemo(() => {
    void enrolledVersion;
    return players.filter((p) => {
      const hasFd =
        (Array.isArray(p.faceDescriptor) && p.faceDescriptor.length > 0) ||
        (p.faceDescriptor && typeof p.faceDescriptor === "object" && Object.keys(p.faceDescriptor).length > 0);
      const hasFds =
        (Array.isArray(p.faceDescriptors) && p.faceDescriptors.length > 0) ||
        (p.faceDescriptors && typeof p.faceDescriptors === "object" && Object.keys(p.faceDescriptors).length > 0);
      return hasFd || hasFds;
    });
  }, [players, enrolledVersion]);

  // Students who have an existing profile photo but no face descriptor yet
  const unenrolledWithPhoto = useMemo(() => {
    void enrolledVersion;
    return players.filter((p) => {
      const hasFd =
        (Array.isArray(p.faceDescriptor) && p.faceDescriptor.length > 0) ||
        (p.faceDescriptor && typeof p.faceDescriptor === "object" && Object.keys(p.faceDescriptor).length > 0) ||
        (Array.isArray(p.faceDescriptors) && p.faceDescriptors.length > 0) ||
        (p.faceDescriptors && typeof p.faceDescriptors === "object" && Object.keys(p.faceDescriptors).length > 0);
      return !hasFd && Boolean(p.photoUrl || p.aadharPhotoUrl);
    });
  }, [players, enrolledVersion]);

  // 1-Click Auto-Enroll all students from their existing profile photos
  const handleBatchEnrollFromPhotos = async () => {
    if (isBatchEnrolling || unenrolledWithPhoto.length === 0 || !store) return;

    setIsBatchEnrolling(true);
    setBatchProgress({ current: 0, total: unenrolledWithPhoto.length });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < unenrolledWithPhoto.length; i++) {
      const student = unenrolledWithPhoto[i];
      const photo = student.photoUrl || student.aadharPhotoUrl;
      setBatchProgress({ current: i + 1, total: unenrolledWithPhoto.length });

      if (photo && typeof photo === "string" && photo.trim().length > 10) {
        try {
          const res = await extractFaceDescriptorFromImageUrl(photo);
          if (res && res.descriptor) {
            const descArr = Array.from(res.descriptor);
            const updated: Player = {
              ...student,
              faceDescriptor: descArr,
              faceDescriptors: [descArr],
              faceEnrolledAt: new Date().toISOString(),
              faceEnrolledPhotoUrl: photo,
            };
            // Immediate in-memory sync
            student.faceDescriptor = descArr;
            student.faceDescriptors = [descArr];
            student.faceEnrolledAt = updated.faceEnrolledAt;
            student.faceEnrolledPhotoUrl = photo;

            if (store && typeof store.updatePlayer === "function") {
              store.updatePlayer(updated);
            }
            successCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          console.warn("Failed auto-enroll for", student.name, err);
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    setEnrolledVersion((v) => v + 1);
    setIsBatchEnrolling(false);
    setBatchProgress(null);

    // Rebuild the face matcher immediately with all enrolled students
    const allEnrolled = players.filter((p) => {
      const hasFd =
        (Array.isArray(p.faceDescriptor) && p.faceDescriptor.length > 0) ||
        (p.faceDescriptor && typeof p.faceDescriptor === "object" && Object.keys(p.faceDescriptor).length > 0);
      const hasFds =
        (Array.isArray(p.faceDescriptors) && p.faceDescriptors.length > 0) ||
        (p.faceDescriptors && typeof p.faceDescriptors === "object" && Object.keys(p.faceDescriptors).length > 0);
      return hasFd || hasFds;
    });
    if (allEnrolled.length > 0) {
      const matcher = await buildFaceMatcher(allEnrolled, 0.60);
      setFaceMatcher(matcher);
    }

    if (successCount > 0) {
      playAttendanceChime("success");
    }

    const message = isMarathi
      ? `यशस्वी! ${successCount} विद्यार्थ्यांची फोटोवरून चेहरा नोंदणी पूर्ण झाली!` +
        (failedCount > 0
          ? ` (${failedCount} फोटोंमध्ये चेहरा स्पष्ट आढळला नाही, त्यांची कॅमेऱ्याने थेट नोंदणी करा)`
          : "")
      : `Success! Auto-enrolled ${successCount} students from photos.` +
        (failedCount > 0
          ? ` (${failedCount} faces were unclear, please enroll with live camera)`
          : "");

    alert(message);
  };

  // Build the FaceMatcher index asynchronously
  const [faceMatcher, setFaceMatcher] = useState<any>(null);

  useEffect(() => {
    let active = true;
    if (enrolledPlayers.length > 0) {
      buildFaceMatcher(enrolledPlayers, 0.60).then((matcher) => {
        if (active) setFaceMatcher(matcher);
      });
    } else {
      setFaceMatcher(null);
    }
    return () => {
      active = false;
    };
  }, [enrolledPlayers]);

  // Players map for quick lookup by ID
  const playerMap = useMemo(() => {
    const map = new Map<string, Player>();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  // Stop active camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setQualityResult(null);
  }, []);

  // Start active camera with specific facingMode and safe attributes
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
        console.warn("Primary camera request failed, trying generic fallback...", err);
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
          console.error("Attendance camera error:", fallbackErr);
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

  // Init models and start camera on open
  useEffect(() => {
    let isCancelled = false;

    if (isOpen) {
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
      setRecentScans([]);
    }

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

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

  // Switch session
  const handleToggleSession = (sess: "Morning" | "Evening") => {
    setCurrentSession(sess);
    if (onSessionChange) onSessionChange(sess);
  };

  // Toggle front/back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Real-time detection and recognition loop
  useEffect(() => {
    let animId: number;

    const runRecognitionLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        canvas &&
        !isLoadingModels &&
        !cameraError &&
        !modelLoadError &&
        cameraActive &&
        areFaceModelsLoaded() &&
        !isDetectingRef.current
      ) {
        isDetectingRef.current = true;

        try {
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;

          if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
            canvas.width = videoWidth;
            canvas.height = videoHeight;
          }

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Single-pass face detection with descriptors
            const detections = await detectAllFacesWithDescriptors(video);

            // Throttle diagnostic quality updates to every 400ms to avoid 60fps re-render overhead
            const nowTime = Date.now();
            if (nowTime - lastQualityUpdateRef.current > 400) {
              lastQualityUpdateRef.current = nowTime;
              if (detections.length === 0) {
                setQualityResult({
                  code: "NO_FACE",
                  messageEn: "Adjust face position in camera",
                  messageMr: "चेहरा कॅमेऱ्यासमोर व्यवस्थित ठेवा",
                  isAcceptable: false,
                  qualityScore: 10,
                  metrics: { brightness: 120, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
                });
              } else if (detections.length > 1) {
                setQualityResult({
                  code: "MULTIPLE_FACES",
                  messageEn: "Multiple faces detected — Single person only",
                  messageMr: "एकापेक्षा जास्त चेहरे दिसत आहेत — एकाच व्यक्तीने समोर या",
                  isAcceptable: false,
                  qualityScore: 30,
                  metrics: { brightness: 120, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: detections.length },
                });
              } else {
                const targetBox = detections[0].detection.box;
                const faceRatio = targetBox.width / videoWidth;
                const isTooFar = faceRatio < 0.12;
                const isTooClose = faceRatio > 0.85;
                if (isTooFar) {
                  setQualityResult({
                    code: "TOO_FAR",
                    messageEn: "Face is too far away — Move closer",
                    messageMr: "चेहरा खूप लांब आहे — कॅमेऱ्याच्या जवळ या",
                    isAcceptable: false,
                    qualityScore: 40,
                    metrics: { brightness: 120, faceRatio, offsetCenterX: 0, offsetCenterY: 0, faceCount: 1 },
                  });
                } else if (isTooClose) {
                  setQualityResult({
                    code: "TOO_CLOSE",
                    messageEn: "Face is too close — Step back slightly",
                    messageMr: "चेहरा खूप जवळ आहे — थोडे मागे जा",
                    isAcceptable: false,
                    qualityScore: 45,
                    metrics: { brightness: 120, faceRatio, offsetCenterX: 0, offsetCenterY: 0, faceCount: 1 },
                  });
                } else {
                  setQualityResult({
                    code: "READY",
                    messageEn: "Face detected ✓ Scanning...",
                    messageMr: "चेहरा ओळखला जात आहे ✓",
                    isAcceptable: true,
                    qualityScore: 95,
                    metrics: { brightness: 120, faceRatio, offsetCenterX: 0, offsetCenterY: 0, faceCount: 1 },
                  });
                }
              }
            }

            detections.forEach((detection) => {
              const { box } = detection.detection;
              let isMatch = false;
              let matchedPlayer: Player | null = null;
              let confidence = 0;

              if (faceMatcher) {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                if (match.label !== "unknown" && match.distance <= 0.60) {
                  isMatch = true;
                  matchedPlayer = playerMap.get(match.label) || null;
                  // Convert distance to realistic confidence percentage
                  confidence = Math.round(Math.max(65, Math.min(99, (1 - match.distance * 0.7) * 100)));
                }
              }

              // Draw on canvas overlay
              const mirroredX =
                facingMode === "user" ? canvas.width - box.x - box.width : box.x;

              // Bounding Box with safe roundRect fallback
              ctx.lineWidth = 3;
              ctx.strokeStyle = isMatch ? "#10b981" : "#f59e0b"; // Green if match, Amber if unknown
              ctx.beginPath();
              if (typeof (ctx as any).roundRect === "function") {
                (ctx as any).roundRect(mirroredX, box.y, box.width, box.height, 12);
              } else {
                ctx.rect(mirroredX, box.y, box.width, box.height);
              }
              ctx.stroke();

              // Top Label Box
              ctx.fillStyle = isMatch ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)";
              const labelText =
                isMatch && matchedPlayer
                  ? `${getDisplayNameForLocale(
                      matchedPlayer.name,
                      matchedPlayer.nameMarathi,
                      isMarathi ? "mr" : "en"
                    )} (${confidence}%)`
                  : isMarathi
                  ? "नोंदणी नसलेला चेहरा"
                  : "Unknown Face";

              ctx.font = "bold 14px sans-serif";
              const textWidth = ctx.measureText(labelText).width;
              ctx.fillRect(
                mirroredX,
                box.y > 30 ? box.y - 28 : box.y + box.height + 4,
                textWidth + 16,
                24
              );

              ctx.fillStyle = "#ffffff";
              ctx.fillText(
                labelText,
                mirroredX + 8,
                box.y > 30 ? box.y - 12 : box.y + box.height + 20
              );

              // Process Attendance Marking if matched
              if (isMatch && matchedPlayer) {
                const now = Date.now();
                const lastTime = lastMarkedRef.current[matchedPlayer.id] || 0;

                // 8 seconds cooldown per student
                if (now - lastTime > 8000) {
                  lastMarkedRef.current[matchedPlayer.id] = now;

                  const pId = matchedPlayer.id;
                  const pName = getDisplayNameForLocale(
                    matchedPlayer.name,
                    matchedPlayer.nameMarathi,
                    isMarathi ? "mr" : "en"
                  );

                  // Mark Present in parent store
                  onMarkAttendanceRef.current(pId, dateStr, currentSession, "P");

                  if (soundEnabled) {
                    playAttendanceChime("success");
                  }
                  if (speechEnabled) {
                    speakAttendanceAnnounce(pName, isMarathi ? "Marathi" : "English");
                  }

                  // Add to recent scans list
                  setRecentScans((prev) => [
                    {
                      playerId: pId,
                      name: pName,
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }),
                      photoUrl:
                        matchedPlayer?.faceEnrolledPhotoUrl ||
                        matchedPlayer?.photoUrl,
                    },
                    ...prev.slice(0, 9), // keep latest 10
                  ]);
                }
              }
            });
          }
        } catch (e) {
          // loop error ignored
        } finally {
          isDetectingRef.current = false;
        }
      }

      animId = requestAnimationFrame(runRecognitionLoop);
    };

    if (isOpen && !isLoadingModels && !cameraError && !modelLoadError) {
      animId = requestAnimationFrame(runRecognitionLoop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    isOpen,
    isLoadingModels,
    cameraError,
    modelLoadError,
    faceMatcher,
    playerMap,
    facingMode,
    currentSession,
    dateStr,
    isMarathi,
    soundEnabled,
    speechEnabled,
    cameraActive,
  ]);

  // Calculate session count of present students
  const sessionPresentCount = useMemo(() => {
    let count = 0;
    players.forEach((p) => {
      if (attendance[`${p.id}_${dateStr}_${currentSession}`] === "P") {
        count++;
      }
    });
    return count;
  }, [players, attendance, dateStr, currentSession]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-slate-950 text-slate-50 border-slate-800 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  {isMarathi ? "चेहरा हजेरी स्कॅनर" : "AI Face Attendance Scanner"}
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {enrolledPlayers.length} / {players.length}{" "}
                    {isMarathi ? "नोंदणीकृत" : "Enrolled"}
                  </Badge>
                </DialogTitle>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>📅 {dateStr}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    ✓ {sessionPresentCount} {isMarathi ? "उपस्थित" : "Present"}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Switcher & Controls */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <Button
                  size="sm"
                  variant={currentSession === "Morning" ? "default" : "ghost"}
                  onClick={() => handleToggleSession("Morning")}
                  className={`h-7 px-2.5 text-xs gap-1 ${
                    currentSession === "Morning"
                      ? "bg-amber-600 hover:bg-amber-500 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  {isMarathi ? "सकाळ" : "Morning"}
                </Button>
                <Button
                  size="sm"
                  variant={currentSession === "Evening" ? "default" : "ghost"}
                  onClick={() => handleToggleSession("Evening")}
                  className={`h-7 px-2.5 text-xs gap-1 ${
                    currentSession === "Evening"
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  {isMarathi ? "संध्याकाळ" : "Evening"}
                </Button>
              </div>

              {/* Sound Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-8 w-8 border-slate-700 ${
                  soundEnabled ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500"
                }`}
                title={isMarathi ? "आवाज चालू/बंद" : "Toggle Sound"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              {/* Camera Switch (Front / Back Camera) */}
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
                      ? "मागील कॅमेरा (Back)"
                      : "Back Cam"
                    : isMarathi
                    ? "पुढील कॅमेरा (Front)"
                    : "Front Cam"}
                </span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Camera Scanner Viewport (2 Columns on MD) */}
          <div className="md:col-span-2 p-4 flex flex-col items-center justify-center bg-slate-950 gap-3">
            {/* Auto-Enroll All Existing Photos Quick Banner */}
            {unenrolledWithPhoto.length > 0 && store && (
              <div className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-slate-100 truncate">
                      {isMarathi
                        ? `${unenrolledWithPhoto.length} विद्यार्थ्यांचे प्रोफाईल फोटो उपलब्ध आहेत`
                        : `${unenrolledWithPhoto.length} students have profile photos`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isMarathi
                        ? "एका क्लिकवर सर्वांची चेहरा नोंदणी करा"
                        : "1-Click Auto-Enroll all from existing photos"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBatchEnrolling || isLoadingModels}
                  onClick={handleBatchEnrollFromPhotos}
                  className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-none shrink-0"
                >
                  {isBatchEnrolling ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      {batchProgress
                        ? `${batchProgress.current}/${batchProgress.total}`
                        : "..."}
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 mr-1 fill-current" />
                      {isMarathi ? "सर्व फोटोवरून नोंदवा" : "Auto-Enroll All"}
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-2xl">
              {isLoadingModels ? (
                <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                  <span className="text-sm font-semibold">
                    {isMarathi ? "फेस डिटेक्शन लोड होत आहे..." : "Loading face detection..."}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isMarathi ? "कृत्रिम बुद्धिमत्ता मॉडेल तयार होत आहेत" : "Initializing high-speed face recognition models"}
                  </span>
                </div>
              ) : modelLoadError ? (
                <div className="p-6 text-center text-rose-400 text-sm flex flex-col items-center gap-3">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                  <span className="font-bold">
                    {isMarathi ? "फेस मॉडेल लोड अयशस्वी झाले" : "Face model failed to load"}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleRetryModels} className="mt-2 text-white">
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                    {isMarathi ? "पुन्हा प्रयत्न करा" : "Retry face detection"}
                  </Button>
                </div>
              ) : cameraError ? (
                <div className="p-6 text-center text-rose-400 text-sm flex flex-col items-center gap-2">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                  <span className="font-bold text-sm">{cameraError.message}</span>
                  <span className="text-xs text-slate-400">{cameraError.actionable}</span>
                  <Button size="sm" variant="outline" onClick={() => startCamera()} className="mt-3 text-white">
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                    {isMarathi ? "कॅमेरा पुन्हा सुरू करा" : "Retry Camera"}
                  </Button>
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
                  {/* Canvas Overlay for Boxes & Names */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* Face Alignment Oval Guide with Dynamic Color State */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className={`w-48 h-60 rounded-[50%] border-2 transition-all duration-300 ${
                        qualityResult?.isAcceptable
                          ? "border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.6)] scale-100"
                          : qualityResult?.code === "NO_FACE"
                          ? "border-dashed border-slate-500/70 scale-95"
                          : "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-95"
                      }`}
                    />
                  </div>

                  {/* Live Diagnostic Quality Banner */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
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
                        "विद्यार्थ्याने कॅमेऱ्यासमोर यावे"
                      ) : (
                        "Stand in front of camera"
                      )}
                    </div>

                    <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{isMarathi ? "लाईव्ह" : "Live AI"}</span>
                    </div>
                  </div>

                  {/* Warning if no students have enrolled face ID */}
                  {enrolledPlayers.length === 0 && (
                    <div className="absolute inset-x-4 bottom-4 bg-amber-500/90 text-slate-950 p-3 rounded-xl text-xs font-semibold text-center shadow-lg">
                      {isMarathi
                        ? "⚠️ कोणत्याही विद्यार्थ्याची चेहरा नोंदणी झालेली नाही. कृपया आधी प्रोफाईलमध्ये चेहरा नोंदवा किंवा वरील 'सर्व फोटोवरून नोंदवा' बटण दाबा."
                        : "⚠️ No students have enrolled face biometric yet. Please auto-enroll from photos above or enroll via profile."}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Real-time Attendance Feed Sidebar (1 Column on MD) */}
          <div className="p-4 bg-slate-900/50 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-full max-h-[380px] md:max-h-none overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isMarathi ? "हजेरी नोंदवली (लाईव्ह)" : "Live Feed"}
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs px-2">
                {recentScans.length} {isMarathi ? "स्कॅन" : "Scanned"}
              </Badge>
            </div>

            {/* Scanned List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {recentScans.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs p-4">
                  <Users className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                  <span>
                    {isMarathi
                      ? "चेहरा ओळखल्यावर येथे हजेरी दिसेल"
                      : "Recognized students will appear here in real-time"}
                  </span>
                </div>
              ) : (
                recentScans.map((scan, idx) => (
                  <div
                    key={`${scan.playerId}_${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 animate-in fade-in slide-in-from-right duration-300 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 border border-emerald-500/40">
                        {scan.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={scan.photoUrl}
                            alt={scan.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-300">
                            {scan.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{scan.name}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {currentSession === "Morning"
                              ? isMarathi
                                ? "सकाळ हजर"
                                : "Morning Present"
                              : isMarathi
                              ? "संध्याकाळ हजर"
                              : "Evening Present"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">
                      {scan.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer Close Button */}
            <div className="pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {isMarathi ? "स्कॅनर बंद करा" : "Close Scanner"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
