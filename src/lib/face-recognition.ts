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
 * Detects a single face in a video, image, or canvas element and computes its 128-d descriptor vector.
 * Includes multi-model and multi-scale fallback for static photos.
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

  // 1. If static photo and SSD MobileNet is loaded, try high-accuracy SSD detection first
  if (isStaticPhoto && ssdModelLoaded) {
    try {
      const ssdOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
      const result = await faceapi
        .detectSingleFace(input, ssdOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (result) {
        return {
          descriptor: result.descriptor,
          detection: result.detection,
        };
      }
    } catch (e) {
      console.warn("SSD photo detection attempt error, trying TinyFaceDetector...", e);
    }
  }

  // 2. Try TinyFaceDetector with standard options (inputSize: 320, scoreThreshold: 0.35)
  try {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: isStaticPhoto ? 416 : 320,
      scoreThreshold: isStaticPhoto ? 0.25 : 0.40,
    });

    const result = await faceapi
      .detectSingleFace(input, options)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (result) {
      return {
        descriptor: result.descriptor,
        detection: result.detection,
      };
    }
  } catch (e) {
    console.warn("Primary TinyFace detection error:", e);
  }

  // 3. Fallback for difficult/small photos: try higher sensitivity (inputSize: 224, threshold: 0.15)
  if (isStaticPhoto) {
    try {
      const sensitiveOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.15,
      });

      const fallbackResult = await faceapi
        .detectSingleFace(input, sensitiveOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (fallbackResult) {
        return {
          descriptor: fallbackResult.descriptor,
          detection: fallbackResult.detection,
        };
      }
    } catch (e) {
      // Sensitive fallback failed
    }
  }

  return null;
}

/**
 * Loads an image from a URL or Base64 string and extracts its face descriptor.
 * Handles CORS, Data URLs, canvas normalization, and high-resolution scaling.
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
        // Fetch failed, proceed with direct image src with anonymous crossOrigin
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

        // Draw image onto a normalized canvas (max 800px) to enhance detection speed & reliability
        const maxDim = 800;
        let width = img.naturalWidth || img.width || 400;
        let height = img.naturalHeight || img.height || 400;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const result = await extractFaceDescriptor(canvas, true);
          if (result) {
            if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
            resolve(result);
            return;
          }
        }

        // Direct image element detection fallback
        const directResult = await extractFaceDescriptor(img, true);
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        resolve(directResult);
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
