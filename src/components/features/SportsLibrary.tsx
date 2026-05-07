
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ScrollText, 
  Library, 
  PlayCircle, 
  Trophy, 
  Target, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  Upload, 
  FileText, 
  Eye, 
  Trash2, 
  Loader2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const RULES_DATA = [
  {
    sport: "Kabaddi",
    rules: [
      "Duration: 20-minute halves (Men) / 15-minute halves (Women).",
      "Raid Limit: 30 seconds per raid.",
      "Scoring: 1 point for each opponent touched and safely returning to home half.",
      "Bonus Point: 6 or more defenders must be present.",
      "Super Tackle: 2 points if 3 or fewer defenders tackle the raider.",
      "All Out: 2 extra points for a complete clear of the opponent team."
    ]
  },
  {
    sport: "Volleyball",
    rules: [
      "Sets: Played to 25 points (Final deciding set to 15).",
      "Touches: Maximum 3 touches per side.",
      "Rotation: Players must rotate clockwise after winning a point on opponent serve.",
      "Libero: Specialized defensive player with a different colored jersey.",
      "Net Foul: No part of the body can touch the net during active play.",
      "Service: Must be executed within 8 seconds of the whistle."
    ]
  },
  {
    sport: "Kho Kho",
    rules: [
      "Duration: Two innings of 9 minutes each per team.",
      "Chasing: 8 players sit in squares facing alternate directions, 1 active chaser.",
      "Passing Kho: Active chaser must tap a sitting player's back to switch roles.",
      "Direction: Chasers cannot change direction once moving between poles.",
      "Out: Touching a runner or runner going out of the rectangular field.",
      "Pole Turning: Using the pole to pivot is a key tactical move."
    ]
  },
  {
    sport: "Handball",
    rules: [
      "Duration: Two halves of 30 minutes each (Senior).",
      "Steps Rule: Maximum 3 steps allowed while holding the ball.",
      "Dribbling: Players can dribble similar to basketball but with specific handball techniques.",
      "Goal Area: Only the goalkeeper is allowed inside the 6m D-zone.",
      "Scoring: Ball must completely cross the goal line between the posts.",
      "Passive Play: Referee can penalize teams that avoid attacking."
    ]
  },
  {
    sport: "Running (Athletics)",
    rules: [
      "Start: False start results in immediate disqualification (Senior standards).",
      "Lane Control: Runners must stay in their assigned lanes for 100m, 200m, and 400m.",
      "Baton Exchange: In relays, baton must be passed within the 20m exchange zone.",
      "Finish: Time is taken when the runner's torso crosses the finish line.",
      "Wind Assist: Records are not valid if wind exceeds 2.0m/s."
    ]
  },
  {
    sport: "Shot Put",
    rules: [
      "Grip: Shot must be held at the base of fingers, not in the palm.",
      "Delivery: Shot must be 'put' from the shoulder with one hand only.",
      "Circle: Thrower must stay within the 2.135m diameter circle.",
      "Sector: Shot must land within the 34.92-degree landing sector.",
      "Foul: Leaving the circle before the shot lands or stepping on the toe-board."
    ]
  },
  {
    sport: "Javelin Throw",
    rules: [
      "Grip: Javelin must be held at the grip.",
      "Delivery: Must be thrown over the shoulder or upper part of the arm.",
      "Landing: Metal head must strike the ground before any other part.",
      "Safety: No rotation or turning back to the landing area allowed.",
      "Valid Throw: Point of the javelin must leave a mark in the landing sector."
    ]
  },
  {
    sport: "Long Jump",
    rules: [
      "Takeoff: Must be executed from behind the front edge of the takeoff board.",
      "Measurement: From the board edge to the nearest break in the sand.",
      "Run-up: No limit on length, but must be within the runway lanes.",
      "Foul: Stepping over the takeoff line (plasticine indicator).",
      "Safety: Landing must be completed inside the sand pit."
    ]
  },
  {
    sport: "High Jump",
    rules: [
      "Takeoff: Must be executed from a single foot.",
      "Clearance: Bar must be cleared without being knocked off its supports.",
      "Attempts: Three consecutive failures at the same height result in elimination.",
      "Approach: Jumpers can approach from any angle.",
      "Safety: Landing must be on the official high-jump crash mat."
    ]
  }
];

export function SportsLibrary({ store, type }: { store: any, type: 'rules' | 'drills' | 'videos' }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSportForUpload, setSelectedSportForUpload] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSportForUpload) return;

    if (file.type !== 'application/pdf') {
      toast({ title: "Invalid File", description: "Please upload a valid PDF document.", variant: "destructive" });
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB Limit for Firestore
       toast({ title: "File Too Large", description: "Institutional PDFs must be under 1MB for registry storage.", variant: "destructive" });
       return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      store.setGameRule(selectedSportForUpload, base64String);
      toast({ title: "Rulebook Archived", description: `Official PDF for ${selectedSportForUpload} uploaded successfully.` });
      setIsUploading(false);
      setSelectedSportForUpload(null);
    };
    reader.readAsDataURL(file);
  };

  if (type === 'rules') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
        <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Rulebook</h2>
            <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
              View official technical regulations or upload tournament-specific PDF rules for all competitive games.
            </p>
          </div>
        </div>

        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RULES_DATA.map((item) => {
            const hasPdf = !!store.data.gameRules[item.sport];
            const pdfData = store.data.gameRules[item.sport]?.pdfData;

            return (
              <Card key={item.sport} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/30 transition-all group flex flex-col h-full">
                <CardHeader className="bg-primary/5 border-b p-6 flex flex-row justify-between items-center">
                  <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-accent" /> {item.sport}
                  </CardTitle>
                  <div className="flex gap-2">
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => { setSelectedSportForUpload(item.sport); fileInputRef.current?.click(); }}
                       className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary"
                     >
                       {isUploading && selectedSportForUpload === item.sport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                     </Button>
                     {hasPdf && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => store.setGameRule(item.sport, null)}
                         className="rounded-full h-8 w-8 hover:bg-destructive/10 text-destructive"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     )}
                  </div>
                </CardHeader>
                <CardContent className="p-8 flex-1 flex flex-col">
                  {hasPdf ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-10 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20">
                      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                         <FileText className="w-10 h-10" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-black text-primary uppercase tracking-widest text-sm">Official PDF Active</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Archived in Registry</p>
                      </div>
                      <Button 
                        onClick={() => setViewingPdf(pdfData)} 
                        className="bg-accent text-accent-foreground font-black px-8 rounded-xl h-12 uppercase text-xs tracking-widest shadow-lg active-scale"
                      >
                        <Eye className="w-4 h-4 mr-2" /> Open Official PDF
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {item.rules.map((rule, idx) => (
                        <li key={idx} className="flex gap-4 text-sm font-bold text-foreground/80 leading-relaxed">
                          <span className="text-accent font-black text-lg">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {!hasPdf && (
                    <div className="mt-8 pt-8 border-t border-dashed">
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedSportForUpload(item.sport); fileInputRef.current?.click(); }}
                        className="w-full h-12 border-2 rounded-xl font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/5"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Upload Official Rulebook
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!viewingPdf} onValueChange={() => setViewingPdf(null)}>
          <DialogContent className="sm:max-w-[95vw] h-[90vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col bg-slate-900">
            <DialogHeader className="p-6 bg-primary border-b border-white/10 flex flex-row items-center justify-between shrink-0">
               <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight leading-none">Inbuilt PDF Viewer</DialogTitle>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Institutional Technical Regulations</p>
                  </div>
               </div>
               <Button variant="ghost" onClick={() => setViewingPdf(null)} className="rounded-full h-12 w-12 text-white hover:bg-white/10">
                 <X className="w-6 h-6" />
               </Button>
            </DialogHeader>
            <div className="flex-1 w-full bg-slate-800 relative">
               {viewingPdf && (
                 <iframe 
                   src={viewingPdf} 
                   className="w-full h-full border-0" 
                   title="PDF Viewer"
                 />
               )}
            </div>
            <div className="p-4 bg-primary/10 border-t border-white/5 flex justify-center shrink-0">
               <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Waghamba Institutional Sports Hub • PDF Engine v1.0</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null; // Fallback for other types
}
