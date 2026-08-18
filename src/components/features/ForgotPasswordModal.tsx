"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/firebase";
import { sendPasswordRecoveryEmail } from "@/firebase/non-blocking-login";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  language?: "English" | "Marathi";
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = "",
  language = "English",
}: ForgotPasswordModalProps) {
  const auth = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen && defaultEmail) {
      setEmail(defaultEmail);
    }
    if (isOpen) {
      setStatus(null);
    }
  }, [isOpen, defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !auth) return;

    setLoading(true);
    setStatus(null);

    const result = await sendPasswordRecoveryEmail(auth, email.trim());
    setLoading(false);

    if (result.success) {
      setStatus({
        type: "success",
        message:
          language === "Marathi"
            ? "तुमच्या ईमेलवर पासवर्ड रीसेट लिंक पाठवली आहे. कृपया इनबॉक्स व स्पॅम फोल्डर तपासा."
            : "Password reset link has been sent to your email. Please check your inbox and spam folder.",
      });
    } else {
      setStatus({
        type: "error",
        message:
          result.error ||
          (language === "Marathi"
            ? "ईमेल पाठवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
            : "Failed to send reset email. Please try again."),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-primary p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-display font-black uppercase tracking-tight text-white">
            {language === "Marathi" ? "पासवर्ड पुनर्प्राप्ती" : "Password Recovery"}
          </DialogTitle>
          <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider mt-1">
            {language === "Marathi"
              ? "नोंदणीकृत ईमेल द्वारे पासवर्ड रीसेट करा"
              : "Reset Password via Registered Email"}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            {language === "Marathi"
              ? "तुमचा अधिकृत ईमेल आयडी खाली टाका. आम्ही तुम्हाला नवीन पासवर्ड तयार करण्यासाठी सुरक्षित लिंक पाठवू."
              : "Enter your registered email address below. We'll send you a secure link to create a new password."}
          </p>

          {status && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                {language === "Marathi" ? "ईमेल आयडी" : "Registered Email"}
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@waghamba.com"
                className="h-13 rounded-2xl border-2 font-bold bg-muted/20"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="w-full sm:w-auto h-12 rounded-xl font-black uppercase text-xs text-muted-foreground"
              >
                {language === "Marathi" ? "रद्द करा" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full sm:flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-wider shadow-md active-scale"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {language === "Marathi" ? "पाठवत आहे..." : "Sending Link..."}
                  </>
                ) : language === "Marathi" ? (
                  "रीसेट लिंक पाठवा"
                ) : (
                  "Send Recovery Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
