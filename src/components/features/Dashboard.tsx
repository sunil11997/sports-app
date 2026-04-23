
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Search, Save, X, Activity, Printer, Droplet, User, Medal, GraduationCap, Maximize2, Filter, Percent, Phone, Fingerprint } from 'lucide-react';
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
import { differenceInYears } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
const BLOOD_GROUPS = ['None', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

export function Dashboard({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string, name: string } | null>(null);

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
    return Math.round((presents / records.length) * 100);
  };

  const filteredPlayers = store.data.players.filter((p: any) => {
    const matchesCategory = p.category === targetCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.sports && p.sports.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (p.aadharNumber && p.aadharNumber.includes(searchTerm));
    const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
    return matchesCategory && matchesSearch && matchesTab;
  });

  const handleEditClick = (player: Player) => {
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

      const age = differenceInYears(new Date(), new Date(editingPlayer.dob));
      
      store.updatePlayer({
        ...editingPlayer,
        age
      });
      setEditingPlayer(null);
      toast({
        title: isMarathi ? "रेकॉर्ड अपडेट केले" : "Record Updated",
        description: isMarathi ? `${editingPlayer.name} चे प्रोफाइल यशस्वीरित्या अपडेट केले गेले आहे.` : `${editingPlayer.name}'s profile has been updated successfully.`,
      });
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
                <th>SR</th><th>PHOTO</th><th>NAME</th><th>GENDER</th><th>AGE</th><th>STD</th><th>AADHAR</th><th>MOBILE</th>${isGeneral ? '<th>EXAM MARKS</th>' : '<th>SPORTS</th>'}<th>ATT %</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.photoUrl ? `<img src="${p.photoUrl}" class="photo" />` : 'No Photo'}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.gender}</td>
                  <td>${p.age}</td>
                  <td>${p.std}</td>
                  <td>${p.aadharNumber || '-'}</td>
                  <td>${p.mobileNumber || '-'}</td>
                  <td>${isGeneral ? (p.examMarks || '0') : (p.sports || []).join(', ')}</td>
                  <td>${calculateAttendance(p.id)}%</td>
                </tr>
              `).join('')}
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

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
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
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isMarathi ? "शोध: नाव, आधार, खेळ..." : "Search by name, aadhar, sport..."} 
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9">
            <Printer className="w-4 h-4 mr-2" /> {isMarathi ? 'शीट प्रिंट करा' : 'Print Sheet'}
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[50px] text-center">SR</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[60px] text-center">{isMarathi ? 'फोटो' : 'Photo'}</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase min-w-[180px]">{isMarathi ? 'नाव' : 'Name'}</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[50px]">{isMarathi ? 'वय' : 'Age'}</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[50px]">{isMarathi ? 'इयत्ता' : 'Std'}</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[100px]">{isMarathi ? 'संपर्क' : 'Contact'}</TableHead>
              {isGeneral ? (
                <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[100px] text-center">{isMarathi ? 'गुण' : 'Exam'}</TableHead>
              ) : (
                <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase min-w-[150px]">{isMarathi ? 'खेळ' : 'Sports'}</TableHead>
              )}
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[100px]">{isMarathi ? 'उपस्थिती' : 'Att %'}</TableHead>
              <TableHead className="h-9 px-2 font-black text-[11px] uppercase text-center w-[90px]">{isMarathi ? 'क्रिया' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {isMarathi ? 'या श्रेणीत कोणतेही रेकॉर्ड सापडले नाहीत.' : 'No records found in this category.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => {
                const attPercent = calculateAttendance(player.id);
                return (
                  <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                    <TableCell className="border-r p-2 text-center text-xs font-bold text-primary">{index + 1}</TableCell>
                    <TableCell className="border-r p-1">
                      <div 
                        className="flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity relative group"
                        onClick={() => player.photoUrl && setViewingPhoto({ url: player.photoUrl, name: player.name })}
                      >
                        <Avatar className="w-8 h-8 border">
                          <AvatarImage src={player.photoUrl} alt={player.name} className="object-cover" />
                          <AvatarFallback className="text-[10px]"><User className="w-3 h-3" /></AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-2 text-xs font-bold">
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-[8px] uppercase text-muted-foreground font-black">
                          {isMarathi ? (player.gender === 'Female' ? 'महिला' : 'पुरुष') : player.gender} • {player.aadharNumber || 'NO AADHAR'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-2 text-center text-xs">{player.age}</TableCell>
                    <TableCell className="border-r p-2 text-center text-xs">{player.std}</TableCell>
                    <TableCell className="border-r p-2 text-center text-[10px] font-mono">
                      {player.mobileNumber || '-'}
                    </TableCell>
                    {isGeneral ? (
                      <TableCell className="border-r p-2 text-center text-xs font-black text-primary">{player.examMarks || '0'}</TableCell>
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleEditClick(player)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={() => {
                          if(confirm(isMarathi ? `${player.name} काढून टाकायचे?` : `Delete ${player.name}?`)) store.deletePlayer(player.id);
                        }}>
                          <Trash2 className="w-3 h-3" />
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

      {/* Photo Viewer Dialog */}
      <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2rem] border-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{viewingPhoto?.name || 'Student Photo'}</DialogTitle>
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

      {/* Edit Registry Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-primary">{isMarathi ? 'माहिती सुधारा' : 'Edit Record'}</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'पूर्ण नाव' : 'Full Name'}</Label>
                  <Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'लिंग' : 'Gender'}</Label>
                  <Select value={editingPlayer.gender} onValueChange={(val: any) => setEditingPlayer({ ...editingPlayer, gender: val })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{isMarathi ? 'पुरुष' : 'Male'}</SelectItem>
                      <SelectItem value="Female">{isMarathi ? 'महिला' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'आधार कार्ड' : 'Aadhar'}</Label>
                  <Input value={editingPlayer.aadharNumber || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, aadharNumber: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'मोबाईल' : 'Mobile'}</Label>
                  <Input value={editingPlayer.mobileNumber || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, mobileNumber: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'जन्मतारीख' : 'DOB'}</Label>
                  <Input type="date" value={editingPlayer.dob} onChange={(e) => setEditingPlayer({ ...editingPlayer, dob: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">{isMarathi ? 'इयत्ता' : 'Standard'}</Label>
                  <Select value={editingPlayer.std} onValueChange={(val) => setEditingPlayer({ ...editingPlayer, std: val })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isGeneral ? (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">{isMarathi ? 'परीक्षा गुण' : 'Exam Marks'}</Label>
                    <Input type="number" value={editingPlayer.examMarks || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, examMarks: e.target.value })} className="h-9 text-sm" />
                  </div>
                ) : (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-bold uppercase">{isMarathi ? 'खेळ' : 'Sports'}</Label>
                    <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
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
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingPlayer(null)}>{isMarathi ? 'रद्द करा' : 'Cancel'}</Button>
            <Button size="sm" onClick={handleUpdatePlayer}>{isMarathi ? 'बदल जतन करा' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
