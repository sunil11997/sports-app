"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  PenTool,
  Maximize2,
  Clock,
  CheckCircle2,
  Zap,
  Target,
  User,
  Medal,
  RefreshCw,
  Sparkles,
  Eye,
  Youtube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Running', 'Shot Put', 'Javline', 'Long Jump', 'High Jump'];

// Professional Technical Mastery Videos
const SPORT_VIDEOS: Record<string, string> = {
  'Kabaddi': 'https://www.youtube.com/watch?v=S8XWf8p0Urc',
  'Volleyball': 'https://www.youtube.com/watch?v=qf-1h-K2qRk',
  'Handball': 'https://www.youtube.com/watch?v=_vC-T7qZ6_w',
  'Kho Kho': 'https://www.youtube.com/watch?v=R9Vf8p0Urc',
  'Running': 'https://www.youtube.com/watch?v=7S08JbLwB_k',
  'Shot Put': 'https://www.youtube.com/watch?v=S8XWf8p0Urc',
  'Javline': 'https://www.youtube.com/watch?v=qf-1h-K2qRk',
  'Long Jump': 'https://www.youtube.com/watch?v=_vC-T7qZ6_w',
  'High Jump': 'https://www.youtube.com/watch?v=7S08JbLwB_k',
};

const DRILL_LIBRARY = [
  // Kabaddi
  { id: 'k1', category: 'Kabaddi', name: 'Dubki Mastery', duration: '15m', level: 'Advanced', description: 'Technique for diving under a defender chain.', video: 'https://www.youtube.com/watch?v=S8XWf8p0Urc' },
  { id: 'k2', category: 'Kabaddi', name: 'Toe Touch Speed', duration: '10m', level: 'Intermediate', description: 'Extending leg to touch defender and retreating.', video: 'https://www.youtube.com/watch?v=S8XWf8p0Urc' },
  { id: 'k3', category: 'Kabaddi', name: 'Ankle Hold Grip', duration: '20m', level: 'Intermediate', description: 'Grip strength and timing for ankle defense.', video: 'https://www.youtube.com/watch?v=S8XWf8p0Urc' },
  { id: 'k4', category: 'Kabaddi', name: 'Hand Touch Reach', duration: '12m', level: 'Basic', description: 'Improving upper body reach during raiding.', video: 'https://www.youtube.com/watch?v=S8XWf8p0Urc' },
  // Volleyball
  { id: 'v1', category: 'Volleyball', name: 'Jump Serve Peak', duration: '25m', level: 'Pro', description: 'Timing the vertical jump with ball toss peak.', video: 'https://www.youtube.com/watch?v=qf-1h-K2qRk' },
  { id: 'v2', category: 'Volleyball', name: 'Bump Pass Control', duration: '15m', level: 'Basic', description: 'Fundamental forearm pass accuracy drills.', video: 'https://www.youtube.com/watch?v=qf-1h-K2qRk' },
  { id: 'v3', category: 'Volleyball', name: 'Spike Approach', duration: '20m', level: 'Intermediate', description: '3-step approach and explosive takeoff.', video: 'https://www.youtube.com/watch?v=qf-1h-K2qRk' },
  { id: 'v4', category: 'Volleyball', name: 'Block Timing', duration: '15m', level: 'Advanced', description: 'Reacting to attacker hand movements.', video: 'https://www.youtube.com/watch?v=qf-1h-K2qRk' },
  // Handball
  { id: 'h1', category: 'Handball', name: 'Jump Shot Power', duration: '20m', level: 'Intermediate', description: 'Generating power from air-borne position.', video: 'https://www.youtube.com/watch?v=_vC-T7qZ6_w' },
  { id: 'h2', category: 'Handball', name: 'Piston Movement', duration: '15m', level: 'Advanced', description: 'Defensive coordination and lateral shifts.', video: 'https://www.youtube.com/watch?v=_vC-T7qZ6_w' },
  // Athletics
  { id: 'a1', category: 'Running', name: 'Block Start', duration: '15m', level: 'Intermediate', description: 'Explosive reaction time from starting blocks.', video: 'https://www.youtube.com/watch?v=7S08JbLwB_k' },
  { id: 'a2', category: 'Shot Put', name: 'Glide Technique', duration: '20m', level: 'Advanced', description: 'Mastering the linear glide across the circle.', video: 'https://www.youtube.com/watch?v=S8XWf8p0Urc' },
  { id: 'a3', category: 'Long Jump', name: 'Hitch-Kick Flight', duration: '15m', level: 'Advanced', description: 'Managing body position during flight phase.', video: 'https://www.youtube.com/watch?v=_vC-T7qZ6_w' }
];

export function CoreHub({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeHubTab, setActiveHubTab] = useState("analysis");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("Kabaddi");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("all");
  
  // Analysis States
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysisVideo, setAnalysisVideo] = useState(SPORT_VIDEOS['Kabaddi']);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to check for YouTube
  const isYouTube = useMemo(() => {
    return analysisVideo.includes('youtube.com') || analysisVideo.includes('youtu.be');
  }, [analysisVideo]);

  const getYouTubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}`;
    }
    return null;
  };

  // Planning States
  const [currentPlan, setCurrentPlan] = useState<any[]>([]);
  const [planName, setPlanName] = useState("Standard Technical Practice");

  // Sync video source with sport selection
  useEffect(() => {
    if (SPORT_VIDEOS[selectedSport]) {
      setAnalysisVideo(SPORT_VIDEOS[selectedSport]);
      setIsPlaying(false);
    }
  }, [selectedSport]);

  const filteredDrills = DRILL_LIBRARY.filter(d => 
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     d.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (d.category === selectedSport || !selectedSport)
  );

  const playersInSport = useMemo(() => {
    return store.data.players.filter((p: any) => 
      p.category === 'athlete' && (!selectedSport || p.sports?.includes(selectedSport))
    );
  }, [store.data.players, selectedSport]);

  const totalPlanTime = currentPlan.reduce((acc, item) => acc + parseInt(item.duration), 0);

  const handleTogglePlayback = () => {
    if (isYouTube) return;
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = (amount: number) => {
    if (isYouTube) return;
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleAddToPlan = (drill: any) => {
    setCurrentPlan([...currentPlan, { ...drill, planId: Math.random() }]);
    toast({ title: "Drill Added", description: `${drill.name} added to practice plan.` });
  };

  const handleViewTechnique = (drill: any) => {
    if (drill.video) {
      setAnalysisVideo(drill.video);
      setActiveHubTab("analysis");
      setIsPlaying(false);
      toast({ title: "Technical View", description: `Reviewing technical moves for ${drill.name}` });
    }
  };

  const handleAutoPlan = () => {
    const sportDrills = DRILL_LIBRARY.filter(d => d.category === selectedSport).slice(0, 4);
    if (sportDrills.length === 0) {
      toast({ title: "No Drills Found", description: "No standard drills available for this sport category yet.", variant: "destructive" });
      return;
    }
    const mapped = sportDrills.map(d => ({ ...d, planId: Math.random() }));
    setCurrentPlan(mapped);
    setPlanName(`${selectedSport} Technical Session`);
    toast({ title: "Plan Generated", description: `Standard 4-drill session created for ${selectedSport}.` });
  };

  const handlePrintPlan = () => {
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Practice Plan: ${planName}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; }
            h1 { color: #235C36; border-bottom: 4px solid #F59E0B; padding-bottom: 10px; text-transform: uppercase; }
            .meta { margin-bottom: 30px; font-weight: 800; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f8f8f8; text-transform: uppercase; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>Practice Plan: ${planName}</h1>
          <div class="meta">
            Date: ${format(new Date(), 'PP')} | Discipline: ${selectedSport} | Duration: ${totalPlanTime} Mins
          </div>
          <table>
            <thead>
              <tr><th>Seq</th><th>Drill</th><th>Duration</th><th>Description</th></tr>
            </thead>
            <tbody>
              ${currentPlan.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.name.toUpperCase()}</strong></td>
                  <td>${p.duration}</td>
                  <td>${p.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Institutional Selector Header */}
      <div className="bg-primary p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Zap className="w-10 h-10 text-accent" /> Core Hub
            </h2>
            <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Advanced Technical Registry</p>
          </div>

          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60 ml-2">Select Institutional Game</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-14 rounded-2xl bg-white/10 border-white/20 text-white font-black uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60 ml-2">Select Student Registry</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="h-14 rounded-2xl bg-white/10 border-white/20 text-white font-black uppercase">
                <SelectValue placeholder="All Athletes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Athletes</SelectItem>
                {playersInSport.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <Tabs value={activeHubTab} onValueChange={setActiveHubTab} className="space-y-8">
        <div className="flex items-center justify-center">
          <TabsList className="bg-muted/50 border rounded-full h-16 p-2 shadow-inner">
            <TabsTrigger value="analysis" className="rounded-full px-10 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Analysis</TabsTrigger>
            <TabsTrigger value="library" className="rounded-full px-10 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Library</TabsTrigger>
            <TabsTrigger value="planning" className="rounded-full px-10 font-black uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Planning</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="analysis" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 border-2 rounded-[3.5rem] overflow-hidden bg-black shadow-2xl relative">
              <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
                {isYouTube ? (
                  <iframe 
                    key={analysisVideo} // Key forces reload when video changes
                    src={getYouTubeEmbed(analysisVideo) || ""}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    key={analysisVideo}
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={analysisVideo}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    controls={false}
                    playsInline
                    muted
                  />
                )}
              </div>
              
              {!isYouTube && (
                <div className="bg-zinc-950 p-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => handleStep(-0.033)} className="text-white hover:bg-white/10 rounded-full h-14 w-14"><ChevronLeft className="w-8 h-8" /></Button>
                    <Button onClick={handleTogglePlayback} className="bg-white text-black hover:bg-white/90 rounded-full h-16 w-16 shadow-2xl scale-110">
                      {isPlaying ? <Pause className="fill-current w-8 h-8" /> : <Play className="fill-current w-8 h-8 ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStep(0.033)} className="text-white hover:bg-white/10 rounded-full h-14 w-14"><ChevronRight className="w-8 h-8" /></Button>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                    {[0.25, 0.5, 1].map(rate => (
                      <Button 
                        key={rate} 
                        size="sm" 
                        variant={playbackRate === rate ? "default" : "ghost"}
                        onClick={() => { setPlaybackRate(rate); if(videoRef.current) videoRef.current.playbackRate = rate; }}
                        className={cn("rounded-xl font-black text-xs px-6 h-10", playbackRate === rate ? "bg-accent text-white" : "text-white/60")}
                      >
                        {rate}x Speed
                      </Button>
                    ))}
                  </div>

                  <Button className="bg-accent text-white rounded-2xl px-8 h-14 font-black uppercase text-xs tracking-widest shadow-xl"><Maximize2 className="w-5 h-5 mr-3" /> Analyze Form</Button>
                </div>
              )}

              {isYouTube && (
                <div className="bg-zinc-950 p-6 flex items-center justify-center border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/40">
                    <Youtube className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Mastery Streaming Engine Active</span>
                  </div>
                </div>
              )}
            </Card>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white flex flex-col h-full">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3 mb-8">
                  <Target className="w-7 h-7 text-accent" /> Technique Hub
                </h3>
                <div className="flex-1 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Active Recording</label>
                    <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/5 flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                            isYouTube ? "bg-red-600" : "bg-primary"
                          )}>
                            {isYouTube ? <Youtube className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase text-primary leading-none truncate max-w-[150px]">
                              {selectedSport}_Tutorial_Mastery
                            </p>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Institutional Material</span>
                          </div>
                       </div>
                       <Badge variant="outline" className="w-fit text-[9px] font-black uppercase border-primary/20 bg-white">Standard Analysis</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Analysis Checkpoints</h4>
                    <div className="grid grid-cols-1 gap-3">
                       {['Posture Alignment', 'Explosive Takeoff', 'Reaction Delay'].map((check, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-colors">
                           <span className="text-xs font-bold text-foreground/80 uppercase">{check}</span>
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t space-y-3">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest">Compare Side-by-Side</Button>
                  <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg">Save Analysis Log</Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="mt-0">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
             <div className="relative flex-1 w-full max-w-2xl">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
               <Input 
                 placeholder={`Search technical drills for ${selectedSport}...`} 
                 className="pl-16 h-16 rounded-[2rem] border-2 font-bold shadow-inner text-lg" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex gap-3">
               <Button onClick={handleAutoPlan} className="bg-accent text-white h-16 rounded-[1.5rem] font-black uppercase text-xs px-10 tracking-widest shadow-xl active-scale">
                 <Sparkles className="w-5 h-5 mr-3" /> Auto-Plan {selectedSport}
               </Button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredDrills.length === 0 ? (
               <div className="col-span-full py-32 text-center space-y-4 opacity-20">
                 <Dumbbell className="w-20 h-20 mx-auto" />
                 <p className="text-2xl font-black uppercase tracking-widest">No drills match your search</p>
               </div>
             ) : filteredDrills.map(drill => (
               <Card key={drill.id} className="border-2 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-xl bg-white relative">
                 <div className="aspect-video bg-zinc-100 relative flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => handleViewTechnique(drill)}>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                   <Play className="w-16 h-16 text-white/50 group-hover:scale-110 group-hover:text-primary transition-all z-10" />
                   <Badge className="absolute top-6 left-6 bg-primary text-white border-0 font-black text-[10px] uppercase px-4 py-1.5 rounded-full shadow-lg">{drill.category}</Badge>
                 </div>
                 <div className="p-8 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-primary uppercase tracking-tight">{drill.name}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-4 h-4" /> {drill.duration}</span>
                          <span className="text-[10px] font-black text-accent uppercase tracking-widest">{drill.level}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleAddToPlan(drill)} className="text-primary hover:bg-primary/5 rounded-full h-12 w-12 border border-primary/10"><Plus className="w-6 h-6" /></Button>
                   </div>
                   <p className="text-sm font-medium text-foreground/60 leading-relaxed italic border-l-4 border-accent/20 pl-4">"{drill.description}"</p>
                   <div className="grid grid-cols-2 gap-3 pt-2">
                     <Button variant="outline" onClick={() => handleViewTechnique(drill)} className="rounded-xl font-black uppercase text-[10px] border-2 h-11 flex items-center gap-2">
                        <Eye className="w-3 h-3" /> View Technique
                     </Button>
                     <Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] h-11">Progression</Button>
                   </div>
                 </div>
               </Card>
             ))}
           </div>
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 space-y-8">
                <Card className="border-2 rounded-[3rem] p-10 shadow-2xl bg-white">
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3 mb-8">
                    <CalendarRange className="w-8 h-8 text-accent" /> Session Builder
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Practice Title</label>
                      <Input value={planName} onChange={(e) => setPlanName(e.target.value)} className="h-14 rounded-2xl border-2 font-bold bg-muted/20 shadow-inner px-6" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Selected Sport</label>
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border-2 border-primary/5">
                        <Medal className="w-5 h-5 text-primary" />
                        <span className="font-black text-primary uppercase">{selectedSport}</span>
                      </div>
                    </div>

                    <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/5 text-center relative overflow-hidden">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Target Run Time</p>
                       <h4 className="text-6xl font-black text-primary tracking-tighter">{totalPlanTime}<span className="text-xl ml-2 opacity-40">MINS</span></h4>
                       <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600 font-bold uppercase text-[10px]">
                          <CheckCircle2 className="w-4 h-4" /> Balanced Intensity
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Button onClick={handleAutoPlan} variant="outline" className="w-full h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest">
                        <RefreshCw className="w-5 h-5 mr-3" /> Reset to Standard
                      </Button>
                      <Button onClick={handlePrintPlan} disabled={currentPlan.length === 0} className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl active-scale">
                        <Printer className="w-6 h-6 mr-3" /> Export Session PDF
                      </Button>
                    </div>
                  </div>
                </Card>
             </div>

             <div className="lg:col-span-8 space-y-6">
                <Card className="border-2 rounded-[3.5rem] overflow-hidden shadow-2xl bg-white min-h-[700px] flex flex-col">
                  <div className="bg-muted/40 p-8 border-b flex justify-between items-center sticky top-0 z-10">
                     <div className="flex items-center gap-3">
                       <ListOrdered className="w-5 h-5 text-primary" />
                       <span className="text-xs font-black text-primary uppercase tracking-widest">Planned Activity Sequence</span>
                     </div>
                     <Badge className="font-black text-xs uppercase px-6 py-2 rounded-full bg-primary text-white">{currentPlan.length} Segments</Badge>
                  </div>
                  <div className="flex-1 p-10 space-y-6 overflow-y-auto">
                    {currentPlan.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                         <Dumbbell className="w-24 h-24" />
                         <div className="text-center space-y-2">
                           <p className="font-black uppercase text-xl tracking-widest">Planning Deck Empty</p>
                           <p className="text-sm font-bold max-w-xs mx-auto">Add drills from the library or use "Auto-Plan" to start building your session.</p>
                         </div>
                      </div>
                    ) : (
                      currentPlan.map((p, idx) => (
                        <div key={p.planId} className="bg-white p-8 rounded-[2rem] border-2 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all animate-in slide-in-from-right-4 duration-300">
                           <div className="flex items-center gap-8">
                              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-2xl text-primary shadow-inner border border-primary/5">{idx + 1}</div>
                              <div>
                                 <p className="font-black text-2xl text-primary uppercase tracking-tight leading-none">{p.name}</p>
                                 <div className="flex items-center gap-4 mt-2">
                                   <Badge variant="secondary" className="text-[9px] font-black uppercase">{p.category}</Badge>
                                   <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Target className="w-3 h-3" /> {p.level} Focus</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <div className="text-right">
                                 <p className="font-black text-2xl text-primary leading-none">{p.duration}</p>
                                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Est. Time</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentPlan(currentPlan.filter(i => i.planId !== p.planId))} className="text-destructive hover:bg-destructive/5 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6" /></Button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-10 bg-muted/10 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Registry synchronized with cloud vault</p>
                    </div>
                    {selectedPlayerId && selectedPlayerId !== 'all' && (
                      <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border shadow-sm">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase text-primary">Assigning to: {store.data.players.find((p: any) => p.id === selectedPlayerId)?.name}</span>
                      </div>
                    )}
                  </div>
                </Card>
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ListOrdered = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" x1="6" x2="21" y2="6"/><line x1="10" x1="12" x2="21" y2="12"/><line x1="10" x1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
  </svg>
);
