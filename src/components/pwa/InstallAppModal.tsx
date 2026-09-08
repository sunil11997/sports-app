"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePWA } from "@/components/providers/pwa-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
} from "lucide-react";

export function InstallAppModal() {
  const {
    isInstallModalOpen,
    setIsInstallModalOpen,
    isInstallable,
    isStandalone,
    isIOS,
    installApp,
  } = usePWA();

  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const result = await installApp();
      if (result) {
        setInstalledSuccess(true);
        setTimeout(() => {
          setIsInstallModalOpen(false);
        }, 1800);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-slate-900/95 border-emerald-500/30 text-white backdrop-blur-xl shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-400/40 p-1 bg-white/5">
            <Image
              src="/icon-192.png"
              alt="Waghamba Sports App"
              width={80}
              height={80}
              className="rounded-xl object-contain"
            />
          </div>
          <div>
            <DialogTitle className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Waghamba Sports Hub</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 mt-1 font-medium">
              {isStandalone
                ? "ॲप आधीच इन्स्टॉल आहे (App is already installed)"
                : "मोबाईल किंवा लॅपटॉपवर ॲपप्रमाणे इन्स्टॉल करा (Install as an App)"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {isStandalone ? (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-emerald-300">
              तुम्ही ॲप स्टँडअलोन मोडमध्ये वापरत आहात!
            </p>
            <p className="text-xs text-slate-400">
              Your application is running smoothly in standalone application mode.
            </p>
            <Button
              onClick={() => setIsInstallModalOpen(false)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
            >
              ठीक आहे (Close)
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Features Highlight */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-slate-200 font-semibold">1-टॅप जलद प्रवेश</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-base">📶</span>
                <span className="text-slate-200 font-semibold">ऑफलाइन हजेरी सेव्ह</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-slate-200 font-semibold">ग्राउंड व्हॉइस अलर्ट</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-base">📱</span>
                <span className="text-slate-200 font-semibold">फुल-स्क्रीन अनुभव</span>
              </div>
            </div>

            {/* Direct 1-Click Install Button (Chrome / Edge / Android) */}
            {isInstallable && (
              <div className="pt-2">
                <Button
                  onClick={handleInstallClick}
                  disabled={installing || installedSuccess}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {installedSuccess ? (
                    <>
                      <Check className="w-6 h-6 text-white" />
                      <span>इन्स्टॉल यशस्वी! (Installed)</span>
                    </>
                  ) : installing ? (
                    <span>इन्स्टॉल होत आहे...</span>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>आत्ताच इन्स्टॉल करा (Install Now)</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step-by-Step Guidance */}
            {isIOS ? (
              <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> iPhone / iPad वर इन्स्टॉल करण्यासाठी:
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                  <li>
                    Safari मध्ये खाली असलेला{" "}
                    <span className="inline-flex items-center gap-1 bg-slate-700 px-1.5 py-0.5 rounded text-white font-bold">
                      <Share2 className="w-3 h-3" /> Share
                    </span>{" "}
                    बटण दाबा.
                  </li>
                  <li>
                    खाली स्क्रोल करून{" "}
                    <span className="inline-flex items-center gap-1 bg-slate-700 px-1.5 py-0.5 rounded text-white font-bold">
                      <PlusSquare className="w-3 h-3" /> Add to Home Screen
                    </span>{" "}
                    निवडा.
                  </li>
                  <li>वर उजव्या कोपऱ्यातील &apos;Add&apos; वर टॅप करा. ॲप होमस्क्रीनवर जोडले जाईल!</li>
                </ol>
              </div>
            ) : !isInstallable ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Android / Chrome वर मॅन्युअल इन्स्टॉल:
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                  <li>
                    ब्राउझरच्या वरच्या उजव्या बाजूला असलेल्या तीन ठिपक्यांवर (
                    <span className="font-mono font-bold text-white">⋮</span> Menu) टॅप करा.
                  </li>
                  <li>
                    मेनूमधील &apos;<span className="text-white font-semibold">Install app</span>&apos; किंवा &apos;
                    <span className="text-white font-semibold">Add to Home screen</span>&apos; निवडा.
                  </li>
                  <li>&apos;Install&apos; ची खात्री करा. ॲप तुमच्या फोनवर तयार होईल!</li>
                </ol>
              </div>
            ) : null}

            {/* Android APK Direct Option */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                Android APK फाईल हवी आहे का?
              </span>
              <a
                href="/app-debug.apk"
                download="Waghamba-Sports-Hub.apk"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2"
              >
                <span>APK डाऊनलोड</span>
                <Download className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
