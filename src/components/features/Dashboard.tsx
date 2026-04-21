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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {isGeneral ? <GraduationCap className="w-8 h-8 text-primary" /> : <Medal className="w-8 h-8 text-accent" />}
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
            {isGeneral ? 'Class 4-12 Registry' : 'Sports Talent Pool'}
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name..." 
              className="pl-10 rounded-2xl border-2 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl h-11 font-bold">
            <Printer className="w-4 h-4 mr-2" /> Print Roster
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-primary hover:bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground font-bold uppercase w-[60px]">SR</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase w-[80px]">Photo</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Name</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Age</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Std</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-center">Blood</TableHead>
              {isGeneral ? (
                <TableHead className="text-primary-foreground font-bold uppercase">Exam Marks</TableHead>
              ) : (
                <TableHead className="text-primary-foreground font-bold uppercase">Sports</TableHead>
              )}
              <TableHead className="text-primary-foreground font-bold uppercase">Latest BMI</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground font-medium">
                  No records found in this section.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => {
                const sports = Array.isArray(player.sports) ? player.sports : [];
                
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold text-primary">{index + 1}</TableCell>
                    <TableCell>
                      <Avatar className="w-10 h-10 border-2 border-primary/10">
                        <AvatarImage src={player.photoUrl} alt={player.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/5">
                          <User className="w-5 h-5 text-primary/30" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-bold">{player.name}</TableCell>
                    <TableCell>{player.age}</TableCell>
                    <TableCell>{player.std}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-destructive font-black text-xs">
                        <Droplet className="w-3 h-3" />
                        {player.bloodGroup || 'N/A'}
                      </div>
                    </TableCell>
                    {isGeneral ? (
                      <TableCell className="font-black text-primary">{player.examMarks || '0'}/100</TableCell>
                    ) : (
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {sports.map((s: string) => (
                            <Badge key={s} className="bg-accent text-accent-foreground font-bold text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className={`font-mono font-bold ${parseFloat(player.bmi) > 25 ? 'text-destructive' : 'text-primary'}`}>
                        {player.bmi}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => handleEditClick(player)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => {
                          if(confirm(`Are you sure you want to delete ${player.name}?`)) {
                            store.deletePlayer(player.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[800px] rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase">Edit Institutional Record</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="font-bold">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                      className="rounded-xl border-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-gender" className="font-bold">Gender</Label>
                      <Select 
                        value={editingPlayer.gender} 
                        onValueChange={(val: any) => setEditingPlayer({ ...editingPlayer, gender: val })}
                      >
                        <SelectTrigger className="rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-dob" className="font-bold">DOB</Label>
                      <Input
                        id="edit-dob"
                        type="date"
                        value={editingPlayer.dob}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, dob: e.target.value })}
                        className="rounded-xl border-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-std" className="font-bold">Standard</Label>
                      <Select 
                        value={editingPlayer.std} 
                        onValueChange={(val) => setEditingPlayer({ ...editingPlayer, std: val })}
                      >
                        <SelectTrigger className="rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-blood-group" className="font-bold">Blood Group</Label>
                      <Select 
                        value={editingPlayer.bloodGroup || "O+"} 
                        onValueChange={(val) => setEditingPlayer({ ...editingPlayer, bloodGroup: val })}
                      >
                        <SelectTrigger className="rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map(group => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {isGeneral ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-exam-marks" className="font-bold">Physical Ed Exam Marks</Label>
                      <Input
                        id="edit-exam-marks"
                        type="number"
                        value={editingPlayer.examMarks || ""}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, examMarks: e.target.value })}
                        className="rounded-xl border-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="font-bold">Sports Participation</Label>
                      <div className="grid grid-cols-2 gap-2 bg-primary/5 p-4 rounded-xl border-2 border-primary/10 max-h-[160px] overflow-y-auto">
                        {SPORTS_LIST.map(sport => (
                          <div key={sport} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`edit-sport-${sport}`}
                              checked={(editingPlayer.sports || []).includes(sport)}
                              onCheckedChange={() => toggleSportInEdit(sport)}
                            />
                            <Label htmlFor={`edit-sport-${sport}`} className="text-sm font-medium cursor-pointer">{sport}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-medical" className="font-bold">Medical Conditions</Label>
                    <Input
                      id="edit-medical"
                      value={editingPlayer.medical || ""}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, medical: e.target.value })}
                      placeholder="e.g. Asthma, Allergies"
                      className="rounded-xl border-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setEditingPlayer(null)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold" onClick={handleUpdatePlayer}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
