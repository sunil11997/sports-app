'use client';

import { Button } from '@/components/ui/button';
import { Home, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-primary/10">
          <SearchX className="w-12 h-12 text-primary opacity-40" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Invalid Registry Path</h2>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">
            The requested module could not be located in the institutional database.
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-2xl text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
            Error Code: 404 &bull; Path Restricted
          </div>
        </div>

        <div className="pt-4">
          <Button asChild className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl active-scale">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" /> Return to Command Center
            </Link>
          </Button>
          <p className="mt-6 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
            Waghamba Ashram Shala &bull; Registry Pulse
          </p>
        </div>
      </div>
    </div>
  );
}
