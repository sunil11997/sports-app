
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Dumbbell, 
  CalendarRange, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Printer,
  Download,
  Search,
  PenTool,
  Scan,
  Maximize2,
  Clock,
  CheckCircle2,
  Library,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const DRILL_LIBRARY = [
  { id: 'k1', category: 'Kabaddi', name: 'Toe Touch Speed', duration: '15m', level: 'Advanced', description: 'Focus on explosive leg extension and rapid retreat.' },
  { id: 'k2', category: 'Kabaddi', name: 'Ankle Hold Grip', duration: '20m', level: 'Intermediate', description: 'Strengthening hand grip and pulling force.' },
  { id: 'v1', category: 'Volleyball', name: 'Jump Serve Peak', duration: '25m', level: 'Pro', description: 'Timing the vertical jump with the ball toss peak.' },
  { id: 'v2', category: 'Volleyball', name: 'Side-Out Rotation', duration: '15m', level: 'Intermediate', description: 'Coordination and communication during rotation phases.' },
  { id: 'a1', category: 'Agility', name: 'Shuttle 10x6 Sprint', duration: '10m', level: 'Basic', description: 'Developing core acceleration and deceleration.' },
  { id: 'a2', category: 'Agility', name: 'Ladder Drill (High Knee)', duration: '12m', level: 'Basic', description: 'Improving foot speed and coordination.' }
];

export function CoreHub({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeHubTab, setActiveHubTab] = useState("analysis");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Analysis States
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Planning States
  const [currentPlan, setCurrentPlan] = useState<any[]>([]);
  const [planName, setPlanName] = useState("Monday Elite Training");

  const filteredDrills = DRILL_LIBRARY.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlanTime = currentPlan.reduce((acc, item) => acc + parseInt(item.duration), 0);

  const handleTogglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleAddToPlan = (drill: any) => {
    setCurrentPlan([...currentPlan, { ...drill, planId: Math.random() }]);
    toast({ title: "Drill Added", description: `${drill.name} added to practice plan.` });
  };

  const handlePrintPlan = () => {
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Practice Plan: ${planName}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; }
            h1 { color: #221 50% 38%; border-bottom: 4px solid #F59E0B; padding-bottom: 10px; text-transform: uppercase; }
            .meta { margin-bottom: 30px; font-weight: 800; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f8f8f8; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          <h1>Practice Plan: ${planName}</h1>
          <div class="meta">
            Date: ${format(new Date(), 'PP')} | Total Estimated Duration: ${totalPlanTime} Mins
          </div>
          <table>
            <thead>
              <tr><th>Sequence</th><th>Drill/Activity</th><th>Duration</th><th>Focus Points</th></tr>
            </thead>
            <tbody>
              ${currentPlan.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.name.toUpperCase()}</strong> (${p.category})</td>
                  <td>${p.duration}</td>
                  <td>${p.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Waghamba Ashram Shala - Sports Hub V3.0</div>
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-10 rounded-[3.5rem] border-2 border-primary/10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter flex items-center gap-4">
              <Zap className="w-10 h-10 text-accent" /> Core Hub
            </h2>
            <p className="text-lg font-medium text-muted-foreground max-w-xl">
              Elite institutional analysis, drill management, and tactical planning suite.
            </p>
          </div>
          <Tabs value={activeHubTab} onValueChange={setActiveHubTab} className="w-full md:w-auto">
            <TabsList className="bg-white/50 border rounded-2xl h-14 p-1.5 shadow-inner">
              <TabsTrigger value="analysis" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Analysis</TabsTrigger>
              <TabsTrigger value="library" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Library</TabsTrigger>
              <TabsTrigger value="planning" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Planning</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="pb-12">
        <Tabs value={activeHubTab} onValueChange={setActiveHubTab} className="space-y-8">
          
          <TabsContent value="analysis" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 border-2 rounded-[3rem] overflow-hidden bg-black shadow-2xl relative">
                <div className="aspect-video bg-muted/10 flex items-center justify-center relative">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src="https://www.w3schools.com/html/mov_bbb.mp4" // Placeholder
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />
                </div>
                
                <div className="bg-zinc-900 p-6 flex flex-wrap items-center justify-between gap-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => handleStep(-0.033)} className="text-white hover:bg-white/10 rounded-full h-12 w-12"><ChevronLeft className="w-6 h-6" /></Button>
                    <Button onClick={handleTogglePlayback} className="bg-white text-black hover:bg-white/90 rounded-full h-14 w-14 shadow-xl">
                      {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6 ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStep(0.033)} className="text-white hover:bg-white/10 rounded-full h-12 w-12"><ChevronRight className="w-6 h-6" /></Button>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    {[0.25, 0.5, 1].map(rate => (
                      <Button 
                        key={rate} 
                        size="sm" 
                        variant={playbackRate === rate ? "default" : "ghost"}
                        onClick={() => { setPlaybackRate(rate); if(videoRef.current) videoRef.current.playbackRate = rate; }}
                        className={cn("rounded-xl font-black text-[10px] px-4", playbackRate === rate ? "bg-accent text-white" : "text-white/60")}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="border-white/20 text-white rounded-xl hover:bg-white/10"><RotateCcw className="w-5 h-5" /></Button>
                    <Button variant="outline" size="icon" className="border-white/20 text-white rounded-xl hover:bg-white/10"><PenTool className="w-5 h-5" /></Button>
                    <Button className="bg-accent text-white rounded-xl px-6 font-black uppercase text-[10px]"><Maximize2 className="w-4 h-4 mr-2" /> Fullscreen</Button>
                  </div>
                </div>
              </Card>

              <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2 mb-6">
                    <Target className="w-6 h-6 text-accent" /> Technique Analysis
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Loaded Footage</label>
                      <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg"><Video className="w-5 h-5" /></div>
                            <span className="font-bold text-sm uppercase">Kabaddi_Raid_01.mp4</span>
                         </div>
                         <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20">60 FPS</Badge>
                      </div>
                    </div>

                    <div className="p-5 bg-muted/30 rounded-3xl border-2 border-dashed border-muted text-center space-y-4">
                      <p className="text-xs font-medium text-muted-foreground italic">"Frame-by-frame breakdown active. Use arrows to detect drag in leg extension."</p>
                      <Button variant="outline" className="w-full rounded-xl border-2 font-black uppercase text-[10px] tracking-widest h-11">
                        Compare Side-by-Side
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                       <Button variant="ghost" className="h-12 rounded-xl text-primary font-black uppercase text-[10px] border-2 border-transparent hover:border-primary/10">Add Telestration</Button>
                       <Button variant="ghost" className="h-12 rounded-xl text-primary font-black uppercase text-[10px] border-2 border-transparent hover:border-primary/10">Save Clips</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-0">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
               <div className="relative flex-1 w-full max-w-xl">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input 
                   placeholder="Search Ballogy drills, techniques, categories..." 
                   className="pl-12 h-14 rounded-2xl border-2 font-bold shadow-inner" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" className="h-14 rounded-2xl font-black uppercase text-[10px] px-8 border-2 shadow-sm"><Library className="w-5 h-5 mr-2" /> All Categories</Button>
                 <Button className="bg-primary text-white h-14 rounded-2xl font-black uppercase text-[10px] px-10 shadow-lg"><Plus className="w-5 h-5 mr-2" /> Custom Drill</Button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredDrills.map(drill => (
                 <Card key={drill.id} className="border-2 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-xl bg-white">
                   <div className="aspect-video bg-muted/30 relative flex items-center justify-center">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                     <Play className="w-12 h-12 text-white/50 group-hover:scale-110 group-hover:text-primary transition-all z-10" />
                     <Badge className="absolute top-4 right-4 bg-white/90 text-primary border-0 font-black text-[9px] uppercase px-3 shadow-sm">{drill.category}</Badge>
                   </div>
                   <div className="p-8 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-primary uppercase tracking-tight">{drill.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.duration}</span>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{drill.level}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-full"><Plus className="w-5 h-5" onClick={() => handleAddToPlan(drill)} /></Button>
                     </div>
                     <p className="text-xs font-medium text-foreground/60 leading-relaxed italic border-l-4 border-primary/10 pl-4">"{drill.description}"</p>
                     <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-[10px] border-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">View Demo Footage</Button>
                   </div>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="planning" className="mt-0">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4 space-y-6">
                  <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2 mb-6">
                      <CalendarRange className="w-6 h-6 text-accent" /> Session Builder
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Practice Title</label>
                        <Input value={planName} onChange={(e) => setPlanName(e.target.value)} className="h-12 rounded-xl border-2 font-bold bg-muted/20 shadow-inner" />
                      </div>
                      <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/5 text-center">
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Run Time</p>
                         <h4 className="text-5xl font-black text-primary tracking-tighter">{totalPlanTime}<span className="text-sm ml-1 opacity-40">MINS</span></h4>
                         <div className="mt-4 flex items-center justify-center gap-2 text-primary/40">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">Balanced Intensity</span>
                         </div>
                      </div>
                      <Button onClick={handlePrintPlan} disabled={currentPlan.length === 0} className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale">
                        <Printer className="w-5 h-5 mr-3" /> Export to PDF
                      </Button>
                    </div>
                  </Card>
               </div>

               <div className="lg:col-span-8 space-y-6">
                  <Card className="border-2 rounded-[3rem] overflow-hidden shadow-2xl bg-white min-h-[600px] flex flex-col">
                    <div className="bg-muted/30 p-6 border-b flex justify-between items-center">
                       <span className="text-xs font-black text-primary uppercase tracking-widest">Planned Sequence</span>
                       <Badge variant="outline" className="font-black text-[9px] uppercase px-4 py-1 rounded-full">{currentPlan.length} ACTIVITIES</Badge>
                    </div>
                    <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                      {currentPlan.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
                           <Dumbbell className="w-16 h-16" />
                           <p className="font-black uppercase text-sm tracking-widest text-center">Drag and drop drills here<br />to build your session</p>
                        </div>
                      ) : (
                        currentPlan.map((p, idx) => (
                          <div key={p.planId} className="bg-white p-6 rounded-3xl border-2 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                             <div className="flex items-center gap-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary shadow-inner">{idx + 1}</div>
                                <div>
                                   <p className="font-black text-primary uppercase tracking-tight leading-none">{p.name}</p>
                                   <span className="text-[9px] font-bold text-muted-foreground uppercase">{p.category} • {p.level}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <p className="font-black text-sm text-primary">{p.duration}</p>
                                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Estimated</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentPlan(currentPlan.filter(i => i.planId !== p.planId))} className="text-destructive hover:bg-destructive/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></Button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-8 bg-muted/10 border-t flex items-center justify-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Session Logic Verified by Institutional Hub</span>
                    </div>
                  </Card>
               </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

