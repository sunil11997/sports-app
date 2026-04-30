'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

/**
 * Global Error Boundary for the Waghamba Sports Hub.
 * Provides a graceful recovery path for Teacher Sunil Deshmukh.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your institutional monitoring service if available
    console.error('WGB-App-Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-destructive/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">System Interruption</h2>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            The Physical Ed & Sports Hub encountered a temporary issue. This is usually caused by a sync timeout or a missing internet connection.
          </p>
          {error.message && (
            <div className="mt-4 p-4 bg-muted/50 rounded-2xl text-[10px] font-mono text-muted-foreground break-all border border-dashed border-muted-foreground/20">
              System Log: {error.message}
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button 
            onClick={() => reset()}
            className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl active-scale transition-all"
          >
            <RefreshCcw className="w-5 h-5 mr-2" /> Reload Institutional Registry
          </Button>
          <p className="mt-6 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
            Waghamba Ashram Shala • Error Recovery Hub
          </p>
        </div>
      </div>
    </div>
  );
}
