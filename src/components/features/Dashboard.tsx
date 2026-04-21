"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Search, Save, X, Activity, Printer, Droplet, User, Medal, GraduationCap } from 'lucide-react';
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

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function Dashboard({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const filteredPlayers = store.data.players.filter((p: any) => {
    const matchesCategory = p.category === targetCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.sports && p.sports.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const calculateAttendance = (playerId: string) => {
    const records = Object.entries(store.data.attendance)
      .filter(([key]) => key.startsWith(`${playerId}_`));
    
    if (records.length === 0) return 0;
    
    const presents = records.filter(([, status]) => status === 'P').length;
    return Math.round((presents / records.length) * 100);
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer({ 
      ...player, 
      sports: player.sports || [],
      bloodGroup: player.bloodGroup || "O+",
      examMarks: player.examMarks || "0"
    });
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      if (!isGeneral && (!editingPlayer.sports || editingPlayer.sports.length === 0)) {
        toast({ title: "Validation Error", description: "At least one sport must be selected.", variant: "destructive" });
        return;
      }

      const age = differenceInYears(new Date(), new Date(editingPlayer.dob));
      
      store.updatePlayer({
        ...editingPlayer,
        age
      });
      setEditingPlayer(null);
      toast({
        title: "Record Updated",
        description: `${editingPlayer.name}'s profile has been updated successfully.`,
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
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Student Registry' : 'Active Player Roster'} - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; color: #333; }
            h1 { color: #235C36; border-bottom: 3px solid #8AF075; padding-bottom: 10px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; font-size: 12px; }
            .badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
            .photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'GENERAL STUDENT REGISTRY' : 'ACTIVE ATHLETE ROSTER'}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>SR</th><th>PHOTO</th><th>NAME</th><th>AGE</th><th>STD</th><th>BLOOD</th>${isGeneral ? '<th>EXAM MARKS</th>' : '<th>SPORTS</th>'}<th>LATEST BMI</th><th>ATTENDANCE</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.photoUrl ? `<img src="${p.photoUrl}" class="photo" />` : 'No Photo'}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.age}</td>
                  <td>${p.std}</td>
                  <td>${p.bloodGroup || 'N/A'}</td>
                  <td>${isGeneral ? (p.examMarks || '0') : p.sports.join(', ')}</td>
                  <td>${p.bmi}</td>
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          {isGeneral ? <GraduationCap className="w-6 h-6 text-primary" /> : <Medal className="w-6 h-6 text-accent" />}
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">
            {isGeneral ? 'Excel: Student Registry' : 'Excel: Athlete Roster'}
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9">
            <Printer className="w-4 h-4 mr-2" /> Print Sheet
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-white shadow-sm">
        <Table className="border-collapse">
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[50px] text-center">SR</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[60px] text-center">Photo</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase">Name</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[60px]">Age</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[60px]">Std</TableHead>
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[70px]">Blood</TableHead>
              {isGeneral ? (
                <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase w-[100px] text-center">Exam</TableHead>
              ) : (
                <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase">Sports</TableHead>
              )}
              <TableHead className="border-r h-9 px-2 font-black text-[11px] uppercase text-center w-[80px]">BMI</TableHead>
              <TableHead className="h-9 px-2 font-black text-[11px] uppercase text-center w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => (
                <TableRow key={player.id} className="border-b even:bg-muted/30 hover:bg-primary/5 transition-colors h-10">
                  <TableCell className="border-r p-2 text-center text-xs font-bold text-primary">{index + 1}</TableCell>
                  <TableCell className="border-r p-1 flex justify-center items-center">
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage src={player.photoUrl} alt={player.name} className="object-cover" />
                      <AvatarFallback className="text-[10px]"><User className="w-3 h-3" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="border-r p-2 text-xs font-bold">{player.name}</TableCell>
                  <TableCell className="border-r p-2 text-center text-xs">{player.age}</TableCell>
                  <TableCell className="border-r p-2 text-center text-xs">{player.std}</TableCell>
                  <TableCell className="border-r p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                      <Droplet className="w-2.5 h-2.5 text-destructive" /> {player.bloodGroup || 'N/A'}
                    </div>
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
                  <TableCell className="border-r p-2 text-center text-xs font-mono font-bold">
                    {player.bmi}
                  </TableCell>
                  <TableCell className="p-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleEditClick(player)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={() => {
                        if(confirm(`Delete ${player.name}?`)) store.deletePlayer(player.id);
                      }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-primary">Edit Record</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Full Name</Label>
                  <Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">DOB</Label>
                  <Input type="date" value={editingPlayer.dob} onChange={(e) => setEditingPlayer({ ...editingPlayer, dob: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Standard</Label>
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
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Blood Group</Label>
                  <Select value={editingPlayer.bloodGroup || "O+"} onValueChange={(val) => setEditingPlayer({ ...editingPlayer, bloodGroup: val })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isGeneral ? (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Exam Marks</Label>
                    <Input type="number" value={editingPlayer.examMarks || ""} onChange={(e) => setEditingPlayer({ ...editingPlayer, examMarks: e.target.value })} className="h-9 text-sm" />
                  </div>
                ) : (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-bold uppercase">Sports</Label>
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
            <Button variant="outline" size="sm" onClick={() => setEditingPlayer(null)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdatePlayer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}