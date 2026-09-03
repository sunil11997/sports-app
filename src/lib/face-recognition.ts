"use client";

import type { Player } from "@/lib/types";

let faceapiInstance: typeof import("@vladmandic/face-api") | null = null;
let modelsLoadingPromise: Promise<boolean> | null = null;
let modelsLoaded = false;
let ssdModelLoaded = false;

export type CameraErrorType =
  | "PERMISSION_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "CAMERA_IN_USE"
  | "OVERCONSTRAINED"
  | "NOT_SECURE_CONTEXT"
  | "UNSUPPORTED_BROWSER"
  | "UNKNOWN";

export interface ParsedCameraError {
  type: CameraErrorType;
  messageEn: string;
  messageMr: string;
  actionableEn: string;
  actionableMr: string;
}

export type FaceQualityCode =
  | "READY"
  | "CAMERA_NOT_READY"
  | "MODELS_LOADING"
  | "MODELS_FAILED"
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "TOO_FAR"
  | "TOO_CLOSE"
  | "OUTSIDE_FRAME"
  | "POOR_LIGHTING"
  | "HIGH_GLARE"
  | "TURNED_AWAY"
  | "BLURRY";

export interface FaceQualityResult {
  code: FaceQualityCode;
  messageEn: string;
  messageMr: string;
  isAcceptable: boolean;
  qualityScore: number; // 0 to 100
  detection?: any;
  descriptor?: Float32Array;
  metrics: {
    brightness: number;
    faceRatio: number;
    offsetCenterX: number;
    offsetCenterY: number;
    faceCount: number;
    poseRatio?: number;
  };
}

/**
 * Checks if the current browser environment is running under a secure context (HTTPS / localhost).
 */
export function isSecureContextEnv(): boolean {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext !== undefined) return window.isSecureContext;
  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

/**
 * Maps standard DOM / MediaDevices exceptions into clear, actionable bilingual error structures.
 */
export function parseCameraError(err: any): ParsedCameraError {
  if (!isSecureContextEnv()) {
    return {
      type: "NOT_SECURE_CONTEXT",
      messageEn: "Camera requires HTTPS or a secure context.",
      messageMr: "कॅमेरा सुरू करण्यासाठी सुरक्षित (HTTPS) कनेक्शन आवश्यक आहे.",
      actionableEn: "Open the website with https:// or install the secure PWA.",
      actionableMr: "कृपया संकेतस्थळ https:// सह उघडा किंवा ॲप स्थापित करा.",
    };
  }

  if (!navigator?.mediaDevices?.getUserMedia) {
    return {
      type: "UNSUPPORTED_BROWSER",
      messageEn: "Browser does not support camera access.",
      messageMr: "हा ब्राउझर कॅमेरा ॲक्सेसला सपोर्ट करत नाही.",
      actionableEn: "Please use Google Chrome, Edge, or install as PWA app.",
      actionableMr: "कृपया गुगल क्रोम वापरा किंवा ॲप इन्स्टॉल करा.",
    };
  }

  const name = err?.name || "";
  const msg = (err?.message || "").toLowerCase();

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || msg.includes("permission")) {
    return {
      type: "PERMISSION_DENIED",
      messageEn: "Camera permission denied.",
      messageMr: "कॅमेरा परवानगी नाकारली गेली आहे.",
      actionableEn: "Please enable camera permission in your browser address bar/settings and tap Retry.",
      actionableMr: "कृपया ब्राउझर सेटिंग्जमध्ये जाऊन कॅमेरा परवानगी 'Allow' करा आणि पुन्हा प्रयत्न करा.",
    };
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError" || msg.includes("not found")) {
    return {
      type: "CAMERA_UNAVAILABLE",
      messageEn: "Camera unavailable. No camera device found.",
      messageMr: "कॅमेरा डिव्हाइस उपलब्ध नाही किंवा जोडलेले नाही.",
      actionableEn: "Check that your camera hardware is connected and enabled.",
      actionableMr: "कृपया डिव्हाइसचा कॅमेरा व्यवस्थित सुरू आहे का ते तपासा.",
    };
  }

  if (name === "NotReadableError" || name === "TrackStartError" || msg.includes("in use")) {
    return {
      type: "CAMERA_IN_USE",
      messageEn: "Camera is already in use by another application.",
      messageMr: "कॅमेरा इतर कोणत्याही ॲप किंवा ब्राउझर टॅबद्वारे वापरला जात आहे.",
      actionableEn: "Close other camera apps/tabs and tap Retry.",
      actionableMr: "कृपया इतर कॅमेरा ॲप्स किंवा टॅब्स बंद करा आणि पुन्हा प्रयत्न करा.",
    };
  }

  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return {
      type: "OVERCONSTRAINED",
      messageEn: "Requested camera configuration is not supported by hardware.",
      messageMr: "मागितलेली कॅमेरा गुणवत्ता डिव्हाइस सपोर्ट करत नाही.",
      actionableEn: "Switching to default camera resolution...",
      actionableMr: "डिफॉल्ट रिझोल्यूशनवर स्विच केले जात आहे...",
    };
  }

  return {
    type: "UNKNOWN",
    messageEn: err?.message || "Could not access camera.",
    messageMr: "कॅमेरा सुरू करताना अडचण आली. कृपया परवानगी तपासा.",
    actionableEn: "Please refresh the page and verify camera permissions.",
    actionableMr: "कृपया पेज रीफ्रेश करा आणि कॅमेरा परवानगी तपासा.",
  };
}

/**
 * Dynamically loads the @vladmandic/face-api module strictly on client side.
 */
export async function getFaceApi() {
  if (typeof window === "undefined") return null;
  if (!faceapiInstance) {
    faceapiInstance = await import("@vladmandic/face-api");
  }
  return faceapiInstance;
}

/**
 * Loads the face-api neural network models from the public /models directory.
 * Supports force reload on retry.
 */
export async function loadFaceModels(forceReload = false): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!forceReload && modelsLoaded) return true;
  if (!forceReload && modelsLoadingPromise) return modelsLoadingPromise;

  modelsLoadingPromise = (async () => {
    try {
      const faceapi = await getFaceApi();
      if (!faceapi) return false;

      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      // Attempt to load SSD MobileNet for ultra-reliable static photo detection
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        ssdModelLoaded = true;
      } catch (e) {
        console.warn("SSD MobileNet not available, using TinyFace fallback.");
      }

      modelsLoaded = true;
      return true;
    } catch (err) {
      console.warn("Retrying standard faceLandmark68Net fallback...", err);
      try {
        const faceapi = await getFaceApi();
        if (!faceapi) return false;

        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        modelsLoaded = true;
        return true;
      } catch (fallbackErr) {
        console.error("Failed to load face-api models:", fallbackErr);
        modelsLoadingPromise = null;
        modelsLoaded = false;
        return false;
      }
    }
  })();

  return modelsLoadingPromise;
}

export function areFaceModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Calculates average brightness (0-255) from a video or canvas element in a given bounding box.
 */
export function calculateLuminosity(
  source: HTMLVideoElement | HTMLCanvasElement,
  box?: { x: number; y: number; width: number; height: number }
): number {
  try {
    const canvas = document.createElement("canvas");
    const sw = (source as HTMLVideoElement).videoWidth || source.width || 320;
    const sh = (source as HTMLVideoElement).videoHeight || source.height || 240;

    if (sw === 0 || sh === 0) return 120;

    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 120;

    if (box && box.width > 10 && box.height > 10) {
      // Clip to face box
      const sx = Math.max(0, box.x);
      const sy = Math.max(0, box.y);
      const sWidth = Math.min(sw - sx, box.width);
      const sHeight = Math.min(sh - sy, box.height);
      ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    } else {
      // Central 50%
      ctx.drawImage(source, sw * 0.25, sh * 0.25, sw * 0.5, sh * 0.5, 0, 0, canvas.width, canvas.height);
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    let totalLuma = 0;
    const totalPixels = canvas.width * canvas.height;

    for (let i = 0; i < d.length; i += 4) {
      // Perceived luminance formula (ITU-R BT.709)
      const luma = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      totalLuma += luma;
    }

    return Math.round(totalLuma / totalPixels);
  } catch (e) {
    return 120;
  }
}

/**
 * Diagnostic Face Quality Analyzer:
 * Inspects lighting, distance, centering, pose angle, and face count.
 * Never outputs a generic "Face not detected" when a specific cause is known.
 */
export async function analyzeFaceFrameQuality(
  videoOrCanvas: HTMLVideoElement | HTMLCanvasElement,
  minConfidence = 0.25
): Promise<FaceQualityResult> {
  const isVideo = videoOrCanvas instanceof HTMLVideoElement;
  const width = isVideo ? videoOrCanvas.videoWidth : videoOrCanvas.width;
  const height = isVideo ? videoOrCanvas.videoHeight : videoOrCanvas.height;

  // 1. Verify Camera / Frame Readiness
  if (isVideo && (videoOrCanvas.readyState < 2 || width === 0 || height === 0 || videoOrCanvas.paused)) {
    return {
      code: "CAMERA_NOT_READY",
      messageEn: "Initializing camera stream...",
      messageMr: "कॅमेरा सुरू होत आहे...",
      isAcceptable: false,
      qualityScore: 0,
      metrics: { brightness: 0, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }

  // 2. Verify Models Readiness
  if (!modelsLoaded) {
    return {
      code: "MODELS_LOADING",
      messageEn: "Loading face detection...",
      messageMr: "फेस डिटेक्शन लोड होत आहे...",
      isAcceptable: false,
      qualityScore: 0,
      metrics: { brightness: 0, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }

  const faceapi = await getFaceApi();
  if (!faceapi) {
    return {
      code: "MODELS_FAILED",
      messageEn: "Face model failed to load",
      messageMr: "फेस मॉडेल लोड होऊ शकले नाही",
      isAcceptable: false,
      qualityScore: 0,
      metrics: { brightness: 0, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }

  // 3. Luminosity / Lighting check
  const overallLuma = calculateLuminosity(videoOrCanvas);
  if (overallLuma < 35) {
    return {
      code: "POOR_LIGHTING",
      messageEn: "Poor lighting — Please move to a brighter area",
      messageMr: "कमी उजेड (प्रकाश अपुरा आहे) — कृपया चांगल्या प्रकाशात या",
      isAcceptable: false,
      qualityScore: 20,
      metrics: { brightness: overallLuma, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }
  if (overallLuma > 235) {
    return {
      code: "HIGH_GLARE",
      messageEn: "High glare — Avoid direct backlight or harsh reflection",
      messageMr: "अतिप्रखर प्रकाश/चमक — उजेडाची दिशा बदला",
      isAcceptable: false,
      qualityScore: 25,
      metrics: { brightness: overallLuma, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }

  // 4. Run face detection with landmarks
  try {
    const tinyOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: minConfidence,
    });

    const detections = await faceapi
      .detectAllFaces(videoOrCanvas, tinyOptions)
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {
      return {
        code: "NO_FACE",
        messageEn: "No face detected in guide",
        messageMr: "मार्गदर्शकात चेहरा आढळला नाही",
        isAcceptable: false,
        qualityScore: 0,
        metrics: { brightness: overallLuma, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
      };
    }

    if (detections.length > 1) {
      return {
        code: "MULTIPLE_FACES",
        messageEn: "Multiple faces detected — Single person only",
        messageMr: "एकापेक्षा जास्त चेहरे दिसत आहेत — एकाच व्यक्तीने समोर या",
        isAcceptable: false,
        qualityScore: 30,
        metrics: { brightness: overallLuma, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: detections.length },
      };
    }

    // Single face evaluation
    const target = detections[0];
    const box = target.detection.box;
    const faceW = box.width;
    const faceH = box.height;
    const faceRatio = faceW / width;

    // Check Distance
    if (faceRatio < 0.16) {
      return {
        code: "TOO_FAR",
        messageEn: "Face is too far away — Move closer to camera",
        messageMr: "चेहरा खूप लांब आहे — कॅमेऱ्याच्या जवळ या",
        isAcceptable: false,
        qualityScore: 40,
        detection: target.detection,
        metrics: { brightness: overallLuma, faceRatio, offsetCenterX: 0, offsetCenterY: 0, faceCount: 1 },
      };
    }
    if (faceRatio > 0.75) {
      return {
        code: "TOO_CLOSE",
        messageEn: "Face is too close — Step back slightly",
        messageMr: "चेहरा खूप जवळ आहे — थोडे मागे जा",
        isAcceptable: false,
        qualityScore: 45,
        detection: target.detection,
        metrics: { brightness: overallLuma, faceRatio, offsetCenterX: 0, offsetCenterY: 0, faceCount: 1 },
      };
    }

    // Check Centering in Guide
    const faceCenterX = box.x + faceW / 2;
    const faceCenterY = box.y + faceH / 2;
    const offsetCenterX = Math.abs(faceCenterX - width / 2) / width;
    const offsetCenterY = Math.abs(faceCenterY - height / 2) / height;

    if (offsetCenterX > 0.28 || offsetCenterY > 0.30) {
      return {
        code: "OUTSIDE_FRAME",
        messageEn: "Face is outside the frame — Center face in the oval guide",
        messageMr: "चेहरा मार्गदर्शकाच्या बाहेर आहे — चेहरा मध्यभागी ठेवा",
        isAcceptable: false,
        qualityScore: 50,
        detection: target.detection,
        metrics: { brightness: overallLuma, faceRatio, offsetCenterX, offsetCenterY, faceCount: 1 },
      };
    }

    // Check Head Pose / Tilt using facial landmarks (nose to eyes ratio)
    let poseRatio = 1.0;
    if (target.landmarks) {
      const nose = target.landmarks.getNose();
      const leftEye = target.landmarks.getLeftEye();
      const rightEye = target.landmarks.getRightEye();

      if (nose.length > 0 && leftEye.length > 0 && rightEye.length > 0) {
        const noseTip = nose[3] || nose[0];
        const leftEyeCenter = leftEye[0];
        const rightEyeCenter = rightEye[3] || rightEye[0];

        const distLeft = Math.abs(noseTip.x - leftEyeCenter.x);
        const distRight = Math.abs(rightEyeCenter.x - noseTip.x);

        if (distLeft > 0 && distRight > 0) {
          poseRatio = distLeft / distRight;
          if (poseRatio < 0.35 || poseRatio > 2.8) {
            return {
              code: "TURNED_AWAY",
              messageEn: "Face is turned away — Look directly at the camera",
              messageMr: "चेहरा वळलेला आहे — कृपया सरळ कॅमेऱ्याकडे पहा",
              isAcceptable: false,
              qualityScore: 55,
              detection: target.detection,
              metrics: { brightness: overallLuma, faceRatio, offsetCenterX, offsetCenterY, faceCount: 1, poseRatio },
            };
          }
        }
      }
    }

    // All quality checks passed!
    const qualityScore = Math.min(
      100,
      Math.round(85 + (1 - offsetCenterX - offsetCenterY) * 10 + (overallLuma > 60 && overallLuma < 200 ? 5 : 0))
    );

    return {
      code: "READY",
      messageEn: "Face aligned perfectly ✓ Hold steady",
      messageMr: "चेहरा अचूक स्थितीत आहे ✓ स्थिर राहा",
      isAcceptable: true,
      qualityScore,
      detection: target.detection,
      descriptor: target.descriptor,
      metrics: { brightness: overallLuma, faceRatio, offsetCenterX, offsetCenterY, faceCount: 1, poseRatio },
    };
  } catch (e) {
    return {
      code: "NO_FACE",
      messageEn: "Adjust face position in camera",
      messageMr: "चेहरा कॅमेऱ्यासमोर व्यवस्थित ठेवा",
      isAcceptable: false,
      qualityScore: 10,
      metrics: { brightness: overallLuma, faceRatio: 0, offsetCenterX: 0, offsetCenterY: 0, faceCount: 0 },
    };
  }
}

/**
 * Stability Tracker:
 * Requires continuous acceptable frames for a short duration (e.g. 1000ms)
 * to prevent capturing accidental motion blurs or unstable poses.
 */
export class FaceStabilityTracker {
  private startTime: number | null = null;
  private requiredDurationMs: number;

  constructor(requiredDurationMs = 1000) {
    this.requiredDurationMs = requiredDurationMs;
  }

  public update(isAcceptable: boolean): { isStable: boolean; progressPercent: number } {
    const now = Date.now();
    if (!isAcceptable) {
      this.startTime = null;
      return { isStable: false, progressPercent: 0 };
    }

    if (!this.startTime) {
      this.startTime = now;
      return { isStable: false, progressPercent: 10 };
    }

    const elapsed = now - this.startTime;
    const progressPercent = Math.min(100, Math.round((elapsed / this.requiredDurationMs) * 100));
    const isStable = elapsed >= this.requiredDurationMs;

    return { isStable, progressPercent };
  }

  public reset() {
    this.startTime = null;
  }
}

/**
 * Resizes and compresses captured canvas to JPEG DataURL (max 320x320, ~15-25KB)
 * to avoid storing bloated Base64 in Firestore.
 */
export function compressFacePhoto(
  source: CanvasImageSource,
  maxDim = 320,
  quality = 0.85
): string {
  const canvas = document.createElement("canvas");
  let sw = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || (source as HTMLCanvasElement).width || 320;
  let sh = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || (source as HTMLCanvasElement).height || 240;

  if (sw > maxDim || sh > maxDim) {
    const ratio = Math.min(maxDim / sw, maxDim / sh);
    sw = Math.round(sw * ratio);
    sh = Math.round(sh * ratio);
  }

  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(source, 0, 0, sw, sh);
  }
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Creates an enhanced HTMLCanvasElement with adjusted brightness, contrast, gamma, and rotation.
 */
function createEnhancedCanvas(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  options: {
    brightness?: number;   // multiplier, e.g. 1.4 (+40%), 1.8 (+80%)
    contrast?: number;     // multiplier, e.g. 1.25
    gamma?: number;        // exponent for shadows, e.g. 0.6
    rotationDeg?: number;  // degrees: -15, 15, -30, 30, -45, 45, 90, -90, 180
  } = {}
): HTMLCanvasElement {
  const { brightness = 1.0, contrast = 1.0, gamma = 1.0, rotationDeg = 0 } = options;
  const canvas = document.createElement("canvas");

  if (rotationDeg % 180 !== 0 && rotationDeg % 90 !== 0) {
    const rad = (Math.abs(rotationDeg) * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    canvas.width = Math.round(srcW * cos + srcH * sin);
    canvas.height = Math.round(srcW * sin + srcH * cos);
  } else if (Math.abs(rotationDeg) === 90 || Math.abs(rotationDeg) === 270) {
    canvas.width = srcH;
    canvas.height = srcW;
  } else {
    canvas.width = srcW;
    canvas.height = srcH;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotationDeg !== 0) {
    ctx.rotate((rotationDeg * Math.PI) / 180);
  }
  ctx.drawImage(source, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx.restore();

  // Apply pixel manipulation for lighting/shadow/contrast enhancement
  if (brightness !== 1.0 || contrast !== 1.0 || gamma !== 1.0) {
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          let val = data[i + c];
          // 1. Gamma correction (lifts deep shadows in low-light photos)
          if (gamma !== 1.0) {
            val = 255 * Math.pow(val / 255, gamma);
          }
          // 2. Brightness multiplier
          val = val * brightness;
          // 3. Contrast adjustment
          if (contrast !== 1.0) {
            val = factor * (val - 128) + 128;
          }
          data[i + c] = Math.max(0, Math.min(255, val));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      // Ignore canvas security errors if any
    }
  }

  return canvas;
}

/**
 * Executes multi-scale detection on a specific element/canvas.
 */
async function runDetectionOnTarget(
  faceapi: any,
  target: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  isStatic = false
): Promise<{ descriptor: Float32Array; detection: any } | null> {
  // 1. Try SSD MobileNet v1 (Ultra-robust for varied poses & shadows)
  if (ssdModelLoaded) {
    try {
      const ssdOptions = new faceapi.SsdMobilenetv1Options({
        minConfidence: isStatic ? 0.12 : 0.35,
      });
      const res = await faceapi
        .detectSingleFace(target, ssdOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (res) return { descriptor: res.descriptor, detection: res.detection };
    } catch (e) { /* ignore and continue */ }
  }

  // 2. Multi-Scale TinyFaceDetector passes
  const inputSizes = isStatic ? [416, 320, 512, 224, 608, 160] : [320, 224];
  const thresholds = isStatic ? [0.20, 0.10, 0.05] : [0.40, 0.25];

  for (const size of inputSizes) {
    for (const scoreThreshold of thresholds) {
      try {
        const tinyOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: size,
          scoreThreshold,
        });
        const res = await faceapi
          .detectSingleFace(target, tinyOptions)
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (res) return { descriptor: res.descriptor, detection: res.detection };
      } catch (e) { /* ignore and continue */ }
    }
  }

  // 3. detectAllFaces fallback (picks the largest face if single-face was indecisive)
  if (isStatic) {
    try {
      const allFacesOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.08,
      });
      const allResults = await faceapi
        .detectAllFaces(target, allFacesOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      if (allResults && allResults.length > 0) {
        // Pick the largest detected face by bounding box area
        let bestFace = allResults[0];
        let maxArea = bestFace.detection.box.width * bestFace.detection.box.height;

        for (let i = 1; i < allResults.length; i++) {
          const area = allResults[i].detection.box.width * allResults[i].detection.box.height;
          if (area > maxArea) {
            maxArea = area;
            bestFace = allResults[i];
          }
        }
        return { descriptor: bestFace.descriptor, detection: bestFace.detection };
      }
    } catch (e) { /* ignore */ }
  }

  return null;
}

/**
 * Detects a face in video, image, or canvas with full multi-pass compensation
 * for low light, shadows, high glare, tilts, and bad angles.
 */
export async function extractFaceDescriptor(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  isStaticPhoto = false
): Promise<{ descriptor: Float32Array; detection: any } | null> {
  if (typeof window === "undefined") return null;
  const faceapi = await getFaceApi();
  if (!faceapi) return null;

  const isLoaded = await loadFaceModels();
  if (!isLoaded) return null;

  // PASS 1: Standard Direct Detection
  const directResult = await runDetectionOnTarget(faceapi, input, isStaticPhoto);
  if (directResult) return directResult;

  // If live video or non-static, skip heavy multi-pass
  if (!isStaticPhoto) return null;

  // Extract base dimensions
  const srcW = (input as HTMLImageElement).naturalWidth || input.width || 400;
  const srcH = (input as HTMLImageElement).naturalHeight || input.height || 400;

  // PASS 2: Low-Light & Shadow Boosting Passes
  const lightProfiles = [
    { brightness: 1.4, gamma: 0.65, contrast: 1.25 },  // Moderate Low-Light
    { brightness: 1.85, gamma: 0.45, contrast: 1.4 },  // Extreme Darkness / Deep Shadows
    { brightness: 0.75, gamma: 1.35, contrast: 1.3 },  // Blown-out / Flash Glare
    { brightness: 2.2, gamma: 0.35, contrast: 1.5 },   // Ultra Dark / Night Photo
  ];

  for (const profile of lightProfiles) {
    const enhancedCanvas = createEnhancedCanvas(input, srcW, srcH, profile);
    const res = await runDetectionOnTarget(faceapi, enhancedCanvas, true);
    if (res) return res;
  }

  // PASS 3: Multi-Angle / Orientation & Tilt Rotation Passes (-45° to +45°, 90°, -90°, 180°)
  const angleProfiles = [-15, 15, -30, 30, -45, 45, 90, -90, 180];
  for (const deg of angleProfiles) {
    const rotatedCanvas = createEnhancedCanvas(input, srcW, srcH, { rotationDeg: deg });
    const res = await runDetectionOnTarget(faceapi, rotatedCanvas, true);
    if (res) return res;
  }

  // PASS 4: Combined Bad Angle + Low-Light Boost Passes
  const combinedProfiles = [
    { rotationDeg: -15, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
    { rotationDeg: 15, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
    { rotationDeg: -30, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
    { rotationDeg: 30, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
    { rotationDeg: 90, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
    { rotationDeg: -90, brightness: 1.5, gamma: 0.55, contrast: 1.3 },
  ];

  for (const combined of combinedProfiles) {
    const combinedCanvas = createEnhancedCanvas(input, srcW, srcH, combined);
    const res = await runDetectionOnTarget(faceapi, combinedCanvas, true);
    if (res) return res;
  }

  // PASS 5: Regional Sub-Crops (Crucial for Aadhaar cards, ID cards, and wide portrait shots)
  const cropRegions = [
    { x: 0, y: 0, w: srcW, h: Math.floor(srcH * 0.65) }, // Top 65% (Head & Shoulders)
    { x: 0, y: 0, w: Math.floor(srcW * 0.6), h: Math.floor(srcH * 0.6) }, // Top-Left 60% (Aadhaar photo location)
    { x: Math.floor(srcW * 0.4), y: 0, w: Math.floor(srcW * 0.6), h: Math.floor(srcH * 0.6) }, // Top-Right 60% (ID photo location)
    { x: Math.floor(srcW * 0.15), y: Math.floor(srcH * 0.1), w: Math.floor(srcW * 0.7), h: Math.floor(srcH * 0.7) }, // Center 70%
  ];

  for (const region of cropRegions) {
    if (region.w > 60 && region.h > 60) {
      try {
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = region.w;
        cropCanvas.height = region.h;
        const cropCtx = cropCanvas.getContext("2d");
        if (cropCtx) {
          cropCtx.drawImage(
            input,
            region.x,
            region.y,
            region.w,
            region.h,
            0,
            0,
            region.w,
            region.h
          );
          const res = await runDetectionOnTarget(faceapi, cropCanvas, true);
          if (res) return res;

          // Try regional crop with shadow lifting
          const liftedCrop = createEnhancedCanvas(cropCanvas, region.w, region.h, {
            brightness: 1.4,
            gamma: 0.6,
            contrast: 1.3,
          });
          const resLifted = await runDetectionOnTarget(faceapi, liftedCrop, true);
          if (resLifted) return resLifted;
        }
      } catch (e) {
        // Continue to next region
      }
    }
  }

  return null;
}

/**
 * Loads an image from a URL or Base64 string and extracts its face descriptor.
 * Handles CORS, Data URLs, canvas normalization, shadow lifting, and rotation.
 */
export async function extractFaceDescriptorFromImageUrl(
  imageUrl: string
): Promise<{ descriptor: Float32Array; detection: any } | null> {
  if (typeof window === "undefined" || !imageUrl || typeof imageUrl !== "string") return null;

  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  await loadFaceModels();

  return new Promise(async (resolve) => {
    let objectUrlToRevoke: string | null = null;
    let finalSrc = trimmed;

    // If it's a remote HTTP/HTTPS URL (e.g. Firebase Storage), try fetch -> blob to avoid CORS canvas taint
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const response = await fetch(trimmed, { mode: "cors" });
        if (response.ok) {
          const blob = await response.blob();
          objectUrlToRevoke = URL.createObjectURL(blob);
          finalSrc = objectUrlToRevoke;
        }
      } catch (fetchErr) {
        finalSrc = trimmed;
      }
    }

    const img = new Image();
    // Only set crossOrigin on remote HTTP/HTTPS endpoints; NEVER on blob: or data: URLs
    if (finalSrc.startsWith("http://") || finalSrc.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = async () => {
      try {
        if ("decode" in img) {
          await img.decode().catch(() => {});
        }

        // Run ultra-resilient multi-pass extraction on the loaded image
        const result = await extractFaceDescriptor(img, true);
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        resolve(result);
      } catch (e) {
        console.error("Error extracting descriptor from loaded image:", e);
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        resolve(null);
      }
    };

    img.onerror = (err) => {
      console.warn("Failed to load image for face recognition:", trimmed.substring(0, 50), err);
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      resolve(null);
    };

    img.src = finalSrc;
  });
}

/**
 * Detects all faces present in the video/canvas frame with 128-d descriptors.
 */
export async function detectAllFacesWithDescriptors(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
) {
  if (typeof window === "undefined") return [];
  const faceapi = await getFaceApi();
  if (!faceapi) return [];

  const isLoaded = await loadFaceModels();
  if (!isLoaded) return [];

  try {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.20,
    });

    const results = await faceapi
      .detectAllFaces(input, options)
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    return results;
  } catch (e) {
    console.error("Error detecting faces:", e);
    return [];
  }
}

/**
 * Builds a FaceMatcher index from all players who have enrolled face descriptors.
 * distanceThreshold: lower = stricter match, higher = more forgiving (default 0.60).
 */
export async function buildFaceMatcher(
  players: Player[],
  distanceThreshold = 0.60
): Promise<any | null> {
  if (typeof window === "undefined") return null;
  const faceapi = await getFaceApi();
  if (!faceapi) return null;

  const labeledDescriptors: any[] = [];

  const toFloat32Descriptor = (raw: any): Float32Array | null => {
    if (!raw) return null;
    if (raw instanceof Float32Array && raw.length === 128) return raw;
    if (Array.isArray(raw) && raw.length === 128) return new Float32Array(raw.map(Number));
    if (typeof raw === "object") {
      const vals = Object.values(raw).map(Number);
      if (vals.length === 128) return new Float32Array(vals);
    }
    return null;
  };

  players.forEach((p) => {
    const descriptors: Float32Array[] = [];

    const primary = toFloat32Descriptor(p.faceDescriptor);
    if (primary) descriptors.push(primary);

    if (p.faceDescriptors) {
      const list = Array.isArray(p.faceDescriptors)
        ? p.faceDescriptors
        : typeof p.faceDescriptors === "object"
        ? Object.values(p.faceDescriptors)
        : [];

      list.forEach((arr) => {
        const d = toFloat32Descriptor(arr);
        if (d && (!primary || descriptors.length === 0)) {
          descriptors.push(d);
        }
      });
    }

    if (descriptors.length > 0) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(p.id, descriptors)
      );
    }
  });

  if (labeledDescriptors.length === 0) return null;

  return new faceapi.FaceMatcher(labeledDescriptors, distanceThreshold);
}

/**
 * Calculates Euclidean distance between two vectors.
 */
export function euclideanDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const d = v1[i] - v2[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Plays a pleasant synthesizer confirmation chime on successful attendance scan.
 */
export function playAttendanceChime(type: "success" | "warning" | "error" = "success") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "warning") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // AudioContext autoplay restrictions or disabled sound
  }
}

/**
 * Speaks attendance confirmation in Marathi or English using Web Speech Synthesis.
 */
export function speakAttendanceAnnounce(
  studentName: string,
  language: "Marathi" | "English" = "Marathi"
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    const text =
      language === "Marathi"
        ? `हजेरी नोंदवली, ${studentName}`
        : `Present marked, ${studentName}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    if (language === "Marathi") {
      const mrVoice = voices.find(
        (v) => v.lang.startsWith("mr") || v.lang.startsWith("hi")
      );
      if (mrVoice) utterance.voice = mrVoice;
      utterance.lang = "mr-IN";
    } else {
      utterance.lang = "en-IN";
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Speech synthesis error ignored
  }
}
