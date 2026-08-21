
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
    console.error('WGB-App-Error:', error);

    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      (error.message && (
        error.message.toLowerCase().includes('chunk') || 
        error.message.toLowerCase().includes('loading css chunk') ||
        error.message.toLowerCase().includes('loading chunk') ||
        error.message.toLowerCase().includes('failed to fetch dynamically imported module')
      ));

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_time');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 5000) {
        sessionStorage.setItem('chunk_reload_time', now.toString());
        console.log('Detected chunk loading failure. Purging cache and reloading page...');
        if (typeof window !== 'undefined') {
          if ('caches' in window && window.caches) {
            window.caches.keys().then(names => {
              Promise.all(names.map(name => window.caches.delete(name))).then(() => {
                window.location.reload();
              });
            });
          } else {
            window.location.reload();
          }
        }
      }
    }
  }, [error]);

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      if ('caches' in window && window.caches) {
        window.caches.keys().then(names => {
          Promise.all(names.map(name => window.caches.delete(name))).finally(() => {
            window.location.href = '/';
          });
        });
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner text-primary">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">ॲप अपडेट / सिस्टम रिफ्रेश</h2>
          <p className="text-muted-foreground text-xs font-semibold leading-relaxed">
            ॲपचे नवीन व्हर्जन उपलब्ध आहे. कृपया नवीन बदल लोड करण्यासाठी खालील बटण दाबा.
          </p>
          <p className="text-muted-foreground/60 text-[11px] font-medium">
            (New institutional build available. Tap below to refresh and load latest version.)
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button 
            onClick={handleHardRefresh}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest shadow-xl active-scale transition-all"
          >
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> अपडेट करा व हब उघडा (Reload Hub)
          </Button>
          <Button 
            variant="outline"
            onClick={() => reset()}
            className="w-full h-12 rounded-xl font-bold uppercase text-[11px] text-muted-foreground"
          >
            पुन्हा प्रयत्न करा (Retry)
          </Button>
        </div>

        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">
          शासकीय माध्यमिक आश्रम शाळा वाघंबा &bull; v6.0.0
        </p>
      </div>
    </div>
  );
}
