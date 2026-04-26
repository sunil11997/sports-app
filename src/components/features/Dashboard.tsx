
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Edit, 
  Search, 
  Save, 
  X, 
  Activity, 
  Printer, 
  Droplet, 
  User, 
  Medal, 
  GraduationCap, 
  Maximize2, 
  Filter, 
  Percent, 
  Phone, 
  Fingerprint,
  Camera,
  Upload,
  RefreshCw,
  XCircle,
  RotateCw,
  ImageIcon,
  ArrowUpCircle,
  Users,
  ChevronRight,
  Scale,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/types';
import { differenceInYears, isValid } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { TableSkeleton, ChartSkeleton } from '@/components/ui/loading-skeletons';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

const getBMIInfo = (hStr: string, wStr: string, isMarathi: boolean) => {
  const h = parseFloat(hStr) / 100;
  const w = parseFloat(wStr);
  if (!h || !w || isNaN(h) || isNaN(w) || h <= 0) return { bmi: "-", label: isMarathi ? "उपलब्ध नाही" : "N/A", color: "text-muted-foreground bg-muted border-transparent" };
  
  const bmi = w / (h * h);
  const bmiStr = isNaN(bmi) ? "-" : bmi.toFixed(1);
  
  if (bmi < 18.5) return { bmi: bmiStr, label: isMarathi ? "कमी वजन" : "Underweight", color: "text-blue-600 bg-blue-50 border-blue-100" };
  if (bmi < 25) return { bmi: bmiStr, label: isMarathi ? "सामान्य" : "Normal", color: "text-green-600 bg-green-50 border-green-100" };
  if (bmi < 30) return { bmi: bmiStr, label: isMarathi ? "जास्त वजन" : "Overweight", color: "text-orange-600 bg-orange-50 border-orange-100" };
  return { bmi: bmiStr, label: isMarathi ? "लठ्ठपणा" : "Obese", color: "text-red-600 bg-red-50 border-red-100" };
};

export function Dashboard({ store, section, language = 'English', t }: { store: any, section: 'sports' | 'general', language?: string, t: any }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string, name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isMarathi = language === 'Marathi';
  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const getPlayerCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const genderPart = p.gender === 'Female' ? 'girls' : 'boys';
    let agePart = 'senior';
    if (age < 14) agePart = 'u14';
    else if (age < 17) agePart = 'u17';
    return `${genderPart}-${agePart}`;
  };

  const calculateAttendance = (playerId: string) => {
    const records = Object.entries(store.data.attendance)
      .filter(([key, status]) => 
        key.startsWith(`${playerId}_`) && (status === 'P' || status === 'A')
      );
    
    if (records.length === 0) return 0;
    
    const presents = records.filter(([, status]) => status === 'P').length;
    const result = Math.round((presents / records.length) * 100);
    return isNaN(result) ? 0 : result;
  };

  const filteredPlayers = useMemo(() => store.data.players.filter((p: any) => {
    const matchesCategory = p.category === targetCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.sports && p.sports.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (p.aadharNumber && p.aadharNumber.includes(searchTerm));
    const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
    return matchesCategory && matchesSearch && matchesTab;
  }), [store.data.players, targetCategory, searchTerm, activeCategory]);

  const chartData = useMemo(() => {
    if (!filteredPlayers.length) return [];
    const groups: Record<string, { name: string, count: number, avgFitness: number, totalFit: number }> = {};
    
    filteredPlayers.forEach((p: any) => {
      const std = `Std ${p.std}`;
      if (!groups[std]) groups[std] = { name: std, count: 0, avgFitness: 0, totalFit: 0 };
      
      const fit = store.data.fitness[p.id] || { score: '0' };
      groups[std].count++;
      groups[std].totalFit += parseFloat(fit.score) || 0;
    });

    return Object.values(groups).map(g => ({
      ...g,
      avgFitness: Math.round(g.totalFit / g.count)
    })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
  }, [filteredPlayers, store.data.fitness]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPlayers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPlayers.map((p: any) => p.id)));
    }
  };

  const handleEditClick = (player: Player) => {
    stopCamera();
    setEditingPlayer({ 
      ...player, 
      sports: player.sports || [],
      bloodGroup: player.bloodGroup || "None",
      examMarks: player.examMarks || "0",
      aadharNumber: player.aadharNumber || "",
      mobileNumber: player.mobileNumber || ""
    });
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      if (!isGeneral && (!editingPlayer.sports || editingPlayer.sports.length === 0)) {
        toast({ title: isMarathi ? "त्रुटी" : "Validation Error", description: isMarathi ? "किमान एक खेळ निवडणे आवश्यक आहे." : "At least one sport must be selected.", variant: "destructive" });
        return;
      }

      const dobDate = new Date(editingPlayer.dob);
      const age = isValid(dobDate) ? differenceInYears(new Date(), dobDate) : (parseInt(editingPlayer.age as any) || 0);
      
      store.updatePlayer({
        ...editingPlayer,
        age: isNaN(age) ? 0 : age
      });
      setEditingPlayer(null);
      stopCamera();
      toast({
        title: isMarathi ? "रेकॉर्ड अपडेट केले" : "Record Updated",
        description: isMarathi ? `${editingPlayer.name} चे प्रोफाइल यशस्वीरित्या अपडेट केले गेले आहे.` : `${editingPlayer.name}'s profile has been updated successfully.`,
      });
    }
  };

  const handlePromoteSelected = () => {
    const playersToPromote = store.data.players.filter((p: any) => selectedIds.has(p.id));
    
    playersToPromote.forEach((p: any) => {
      const currentStd = parseInt(p.std) || 0;
      if (currentStd < 12) {
        store.updatePlayer({ ...p, std: (currentStd + 1).toString() });
      } else {
        if (confirm(isMarathi ? `${p.name} १२वी उत्तीर्ण झाले आहेत. त्यांना काढून टाकायचे?` : `${p.name} has finished Std 12. Remove from active roster?`)) {
          store.deletePlayer(p.id);
        }
      }
    });

    toast({
      title: isMarathi ? "प्रक्रिया पूर्ण झाली" : "Promotion Complete",
      description: isMarathi ? "निवडलेल्या विद्यार्थ्यांना पुढील इयत्तेत वर्ग केले आहे." : "Selected students have been moved to the next standard.",
    });
    setSelectedIds(new Set());
    setIsPromotionDialogOpen(false);
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play failed", e));
    }
  }, [isCameraActive, stream]);

  const startCamera = async (currentMode: 'user' | 'environment' = facingMode) => {
    stopCamera();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: currentMode, width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setStream(newStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access device camera.' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && editingPlayer) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setEditingPlayer({ ...editingPlayer, photoUrl: dataUrl });
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPlayer({ ...editingPlayer, photoUrl: reader.result as string });
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSportInEdit = (sport: string) => {
    if (!editingPlayer) return;
    const currentSports = editingPlayer.sports || [];
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    setEditingPlayer({ ...editingPlayer, sports: newSports });
  };

  const handlePrint = () => {
    const categoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Student Registry' : 'Active Player Roster'} - ${categoryLabel}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; padding-bottom: 10px; text-transform: uppercase; }
            .meta { font-weight: bold; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; font-size: 12px; }
            .photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'GENERAL STUDENT REGISTRY' : 'ACTIVE ATHLETE ROSTER'}</h1>
          <div class="meta">Category: ${categoryLabel.toUpperCase()} | Date: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>SR</th><th>PHOTO</th><th>NAME</th><th>GENDER</th><th>AGE</th><th>STD</th><th>BMI STATUS</th><th>AADHAR</th><th>MOBILE</th>${isGeneral ? '<th>EXAM MARKS</th>' : '<th>SPORTS</th>'}<th>ATT %</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any, i: number) => {
                const bmiInfo = getBMIInfo(p.height, p.weight, isMarathi);
                return `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.photoUrl ? `<img src="${p.photoUrl}" class="photo" />` : 'No Photo'}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.gender}</td>
                  <td>${p.age || 0}</td>
                  <td>${p.std}</td>
                  <td>${bmiInfo.bmi} (${bmiInfo.label})</td>
                  <td>${p.aadharNumber || '-'}</td>
                  <td>${p.mobileNumber || '-'}</td>
                  <td>${isGeneral ? (p.examMarks || '0') : (p.sports || []).join(', ')}</td>
                  <td>${calculateAttendance(p.id)}%</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  if (!store.isLoaded) {
    return <TableSkeleton rows={10} cols={8} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
        {CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={`h-8 rounded px-3 text-[10px] font-black uppercase transition-all ${activeCategory === cat.id ? '' : 'text-muted-foreground'}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {isMarathi ? (cat.id === 'all' ? 'सर्व' : cat.label.replace('Boys', 'मुले').replace('Girls', 'मुली').replace('Senior', 'वरिष्ठ')) : cat.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          {isGeneral ? <GraduationCap className="w-6 h-6 text-primary" /> : <Medal className="w-6 h-6 text-accent" />}
          <div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">
              {isGeneral ? (isMarathi ? 'एक्सेल: विद्यार्थी नोंदणी' : 'Excel: Student Registry') : (isMarathi ? 'एक्सेल: खेळाडू यादी' : 'Excel: Athlete Roster')}
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">{isMarathi ? 'फिल्टर:' : 'Filtered by:'} {CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCharts(!showCharts)}
            className={cn("font-black h-9 text-[10px] uppercase", showCharts && "bg-primary text-white border-primary")}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> {isMarathi ? 'आलेख पहा' : 'View Analytics'}
          </Button>
          {selectedIds.size > 0 && (
            <Button 
              onClick={() => setIsPromotionDialogOpen(true)}
              className="bg-accent text-accent-foreground font-black h-9 text-xs uppercase animate-in zoom-in-95"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" /> {t.promoteNext} ({selectedIds.size})
            </Button>
          )}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isMarathi ? "शोध: नाव, आधार, खेळ..." : "Search by name, aadhar, sport..."} 
              className="pl-9 h-9 text-sm rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9">
            <Printer className="w-4 h-4 mr-2" /> {isMarathi ? 'प्रिंट' : 'Print'}
          </Button>
        </div>
      </div>

      {showCharts && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          {!chartData.length ? <ChartSkeleton /> : (
            <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-lg">
              <CardHeader className="bg-primary/5 border-b p-6">
                <CardTitle className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> {isMarathi ? 'इयत्तावार सरासरी तंदुरुस्ती' : 'Standard-wise Average Fitness'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeights: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeights: 700 }} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="avgFitness" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avgFitness >= 70 ? '#235C36' : '#8AF075'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto ios-card-shadow">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase w-[40px] text-center">
                <Checkbox checked={selectedIds.size === filteredPlayers.length && filteredPlayers.length > 0} onCheckedChange={toggleSelectAll} />
              </TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase w-[50px] text-center">SR</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase w-[60px] text-center">{isMarathi ? 'फोटो' : 'Photo'}</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase min-w-[180px]">{isMarathi ? 'नाव' : 'Name'}</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase text-center w-[50px]">{isMarathi ? 'वय' : 'Age'}</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase text-center w-[50px]">{isMarathi ? 'इयत्ता' : 'Std'}</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase text-center w-[150px]">{isMarathi ? 'BMI स्टेटस' : 'BMI Status'}</TableHead>
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase text-center w-[100px]">{isMarathi ? 'संपर्क' : 'Contact'}</TableHead>
              {isGeneral ? (
                <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase w-[100px] text-center">{isMarathi ? 'गुण' : 'Exam'}</TableHead>
              ) : (
                <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase min-w-[150px]">{isMarathi ? 'खेळ' : 'Sports'}</TableHead>
              )}
              <TableHead className="border-r h-10 px-2 font-black text-[11px] uppercase text-center w-[100px]">{isMarathi ? 'उपस्थिती' : 'Att %'}</TableHead>
              <TableHead className="h-10 px-2 font-black text-[11px] uppercase text-center w-[90px]">{isMarathi ? 'क्रिया' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground font-bold uppercase tracking-widest opacity-30">
                  {isMarathi ? 'कोणतेही रेकॉर्ड सापडले नाहीत.' : 'No records found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => {
                const attPercent = calculateAttendance(player.id);
                const bmiInfo = getBMIInfo(player.height, player.weight, isMarathi);
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/20 hover:bg-primary/5 transition-colors h-12">
                    <TableCell className="border-r p-1 text-center">
                      <Checkbox checked={selectedIds.has(player.id)} onCheckedChange={() => toggleSelect(player.id)} />
                    </TableCell>
                    <TableCell className="border-r p-2 text-center text-xs font-bold text-primary">{index + 1}</TableCell>
                    <TableCell className="border-r p-1">
                      <div 
                        className="flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => player.photoUrl && setViewingPhoto({ url: player.photoUrl, name: player.name })}
                      >
                        <Avatar className="w-9 h-9 border shadow-sm">
                          <AvatarImage src={player.photoUrl} alt={player.name} className="object-cover" />
                          <AvatarFallback className="text-[10px]"><User className="w-3 h-3" /></AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-2 text-xs font-black">
                      <div className="flex flex-col">
                        <span className="uppercase text-primary">{player.name}</span>
                        <span className="text-[8px] uppercase text-muted-foreground font-black">
                          {isMarathi ? (player.gender === 'Female' ? 'महिला' : 'पुरुष') : player.gender} • {player.aadharNumber || 'NO AADHAR'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-2 text-center text-xs font-bold">{player.age || 0}</TableCell>
                    <TableCell className="border-r p-2 text-center text-xs font-bold">{player.std}</TableCell>
                    <TableCell className="border-r p-2 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-black text-primary">{bmiInfo.bmi}</span>
                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 h-4 border", bmiInfo.color)}>
                          {bmiInfo.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-2 text-center text-[10px] font-mono font-bold">
                      {player.mobileNumber || '-'}
                    </TableCell>
                    {isGeneral ? (
                      <TableCell className="border-r p-2 text-center text-xs font-black text-primary">{String(player.examMarks || '0')}</TableCell>
                    ) : (
                      <TableCell className="border-r p-2">
                        <div className="flex flex-wrap gap-1">
                          {(player.sports || []).map((s: string) => (
                            <span key={s} className="bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="border-r p-2 text-center">
                      <div className={cn(
                        "flex items-center justify-center gap-1 text-[11px] font-black",
                        attPercent >= 75 ? "text-primary" : attPercent >= 50 ? "text-orange-600" : "text-destructive"
                      )}>
                        {attPercent}%
                      </div>
                    </TableCell>
                    <TableCell className="p-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEditClick(player)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => {
                          if(confirm(isMarathi ? `${player.name} काढून टाकायचे?` : `Delete ${player.name}?`)) store.deletePlayer(player.id);
                        }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
          <DialogHeader className="bg-accent/10 p-8 border-b border-accent/20">
            <DialogTitle className="text-2xl font-black uppercase text-primary flex items-center gap-3">
              <ArrowUpCircle className="w-6 h-6 text-accent" /> {t.promotionHub}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-dashed">
              <Users className="w-8 h-8 text-primary opacity-40" />
              <div>
                <p className="text-sm font-black uppercase text-primary">{selectedIds.size} Students Selected</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.promoteDesc}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Promotion Preview</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {Array.from(selectedIds).map(id => {
                  const p = store.data.players.find((player: any) => player.id === id);
                  if (!p) return null;
                  const nextStd = (parseInt(p.std) || 0) + 1;
                  return (
                    <div key={id} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                      <span className="text-xs font-bold uppercase">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Std {p.std}</Badge>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <Badge className="bg-primary text-white text-[10px]">
                          {nextStd > 12 ? t.graduated : `Std ${nextStd}`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 p-8 border-t">
            <Button variant="ghost" onClick={() => setIsPromotionDialogOpen(false)} className="font-black uppercase text-xs tracking-widest">{isMarathi ? 'रद्द करा' : 'Cancel'}</Button>
            <Button onClick={handlePromoteSelected} className="bg-primary text-white px-12 font-black uppercase text-xs tracking-widest rounded-2xl h-14 shadow-lg">
              {isMarathi ? 'बदली करा' : 'Complete Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2rem] border-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{viewingPhoto?.name || "Student Identification Photo"}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-[3/4] bg-muted">
            {viewingPhoto && (
              <Image 
                src={viewingPhoto.url} 
                alt={viewingPhoto.name} 
                fill 
                className="object-cover"
                unoptimized
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">{viewingPhoto?.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{isMarathi ? 'अधिकृत ओळख फोटो' : 'Official Identity Photo'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-full h-10 w-10"
              onClick={() => setViewingPhoto(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPlayer} onOpenChange={(open) => { if(!open) { stopCamera(); setEditingPlayer(null); } }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-0 shadow-2xl bg-white">
          <DialogHeader className="bg-primary/5 p-8 border-b">
            <DialogTitle className="text-2xl font-black uppercase text-primary flex items-center gap-3">
              <Edit className="w-6 h-6" /> {isMarathi ? 'माहिती सुधारा' : 'Edit Registry Record'}
            </DialogTitle>
          </DialogHeader>
          
          {editingPlayer && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> {isMarathi ? 'ओळख फोटो' : 'Identity Photo'}
                    </Label>
                    {isCameraActive && (
                      <Button variant="outline" size="sm" onClick={() => startCamera(facingMode === 'user' ? 'environment' : 'user')} className="h-7 text-[10px] font-bold uppercase">
                        <RotateCw className="w-3 h-3 mr-1" /> {isMarathi ? 'बदला' : 'Flip'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30">
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", facingMode === 'user' && "-scale-x-100")} />
                    ) : editingPlayer.photoUrl ? (
                      <img src={editingPlayer.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                        <Camera className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">No Photo Set</span>
                      </div>
                    )}
                    
                    {isCameraActive && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                        <Button type="button" onClick={takePhoto} className="flex-1 bg-accent text-accent-foreground font-black text-xs h-10 rounded-xl">SNAP</Button>
                        <Button type="button" variant="destructive" onClick={stopCamera} className="w-10 h-10 p-0 rounded-xl"><XCircle className="w-5 h-5" /></Button>
                      </div>
                    )}
                  </div>

                  {!isCameraActive && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" size="sm" onClick={() => startCamera()} className="bg-primary h-10 font-black text-[10px] uppercase rounded-xl">
                        <Camera className="w-3 h-3 mr-1" /> {isMarathi ? 'कॅमेरा' : 'Camera'}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-2 h-10 font-black text-[10px] uppercase rounded-xl">
                        <Upload className="w-3 h-3 mr-1" /> {isMarathi ? 'अपलोड' : 'Upload'}
                      </Button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'पूर्ण नाव' : 'Full Name'}</Label>
                    <Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'लिंग' : 'Gender'}</Label>
                    <Select value={editingPlayer.gender} onValueChange={(val: any) => setEditingPlayer({ ...editingPlayer, gender: val })}>
                      <SelectTrigger className="h-11 font-bold rounded-xl border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{isMarathi ? 'पुरुष' : 'Male'}</SelectItem>
                        <SelectItem value="Female">{isMarathi ? 'महिला' : 'Female'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1"><Fingerprint className="w-3 h-3" /> {isMarathi ? 'आधार कार्ड' : 'Aadhar'}</Label>
                    <Input value={editingPlayer.aadharNumber || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, aadharNumber: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {isMarathi ? 'मोबाईल' : 'Mobile'}</Label>
                    <Input value={editingPlayer.mobileNumber || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, mobileNumber: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'जन्मतारीख' : 'DOB'}</Label>
                    <Input type="date" value={editingPlayer.dob} onChange={(e) => setEditingPlayer({ ...editingPlayer, dob: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'इयत्ता' : 'Standard'}</Label>
                    <Select value={editingPlayer.std} onValueChange={(val) => setEditingPlayer({ ...editingPlayer, std: val })}>
                      <SelectTrigger className="h-11 font-bold rounded-xl border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'उंची (सेंमी)' : 'Height (cm)'}</Label>
                    <Input type="number" value={editingPlayer.height} onChange={(e) => setEditingPlayer({ ...editingPlayer, height: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'वजन (किग्रॅ)' : 'Weight (kg)'}</Label>
                    <Input type="number" value={editingPlayer.weight} onChange={(e) => setEditingPlayer({ ...editingPlayer, weight: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                  </div>

                  {isGeneral ? (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'परीक्षा गुण' : 'Exam Marks'}</Label>
                      <Input type="number" value={editingPlayer.examMarks || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, examMarks: e.target.value })} className="h-11 font-bold rounded-xl border-2" />
                    </div>
                  ) : (
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground">{isMarathi ? 'क्रीडा प्रकार' : 'Participating Sports'}</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                        {SPORTS_LIST.map(sport => (
                          <div key={sport} className="flex items-center space-x-2">
                            <Checkbox id={`edit-${sport}`} checked={(editingPlayer.sports || []).includes(sport)} onCheckedChange={() => toggleSportInEdit(sport)} />
                            <label htmlFor={`edit-${sport}`} className="text-[11px] font-bold cursor-pointer uppercase">{sport}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="bg-muted/10 p-8 border-t">
            <Button variant="ghost" size="lg" onClick={() => { stopCamera(); setEditingPlayer(null); }} className="font-black uppercase text-xs tracking-widest">{isMarathi ? 'रद्द करा' : 'Cancel'}</Button>
            <Button size="lg" onClick={handleUpdatePlayer} className="bg-primary text-white px-12 font-black uppercase text-xs tracking-widest rounded-2xl h-14 shadow-lg">{isMarathi ? 'बदल जतन करा' : 'Update Roster'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
