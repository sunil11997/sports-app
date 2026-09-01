"use client";

import type { Player } from "@/lib/types";

let faceapiInstance: typeof import("@vladmandic/face-api") | null = null;
let modelsLoadingPromise: Promise<boolean> | null = null;
let modelsLoaded = false;
let ssdModelLoaded = false;

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
 * Caches the load promise to ensure it only initializes once.
 */
export async function loadFaceModels(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (modelsLoaded) return true;
  if (modelsLoadingPromise) return modelsLoadingPromise;

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
    if (!trimmed.startsWith("data:") && !trimmed.startsWith("blob:")) {
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
      inputSize: 320,
      scoreThreshold: 0.40,
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
 * distanceThreshold: lower = stricter match (default 0.52).
 */
export async function buildFaceMatcher(
  players: Player[],
  distanceThreshold = 0.52
): Promise<any | null> {
  if (typeof window === "undefined") return null;
  const faceapi = await getFaceApi();
  if (!faceapi) return null;

  const labeledDescriptors: any[] = [];

  players.forEach((p) => {
    const descriptors: Float32Array[] = [];

    if (p.faceDescriptor && Array.isArray(p.faceDescriptor) && p.faceDescriptor.length > 0) {
      descriptors.push(new Float32Array(p.faceDescriptor));
    }

    if (p.faceDescriptors && Array.isArray(p.faceDescriptors)) {
      p.faceDescriptors.forEach((arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
          descriptors.push(new Float32Array(arr));
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
