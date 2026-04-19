"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Search, Save, X } from 'lucide-react';
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

const SPORTS_LIST = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Running', 'Handball', 'Long Jump', 'High Jump', 'Shot Put', 'Javline'];

export function Dashboard({ store }: { store: any }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const filteredPlayers = store.data.players.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sports.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateAttendance = (playerId: string) => {
    const records = Object.entries(store.data.attendance)
      .filter(([key]) => key.startsWith(`${playerId}_`));
    
    if (records.length === 0) return 0;
    
    const presents = records.filter(([, status]) => status === 'P').length;
    return Math.round((presents / records.length) * 100);
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer({ ...player });
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      if (editingPlayer.sports.length === 0) {
        toast({ title: "Validation Error", description: "At least one sport must be selected.", variant: "destructive" });
        return;
      }
      store.updatePlayer(editingPlayer);
      setEditingPlayer(null);
      toast({
        title: "Player Updated",
        description: `${editingPlayer.name}'s profile has been updated successfully.`,
      });
    }
  };

  const toggleSportInEdit = (sport: string) => {
    if (!editingPlayer) return;
    const currentSports = editingPlayer.sports;
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    setEditingPlayer({ ...editingPlayer, sports: newSports });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Active Roster</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or sport..." 
            className="pl-10 rounded-2xl border-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-primary hover:bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground font-bold uppercase">SR</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Name</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Sports</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Std</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">BMI</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Attendance</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                  No players found. Register some players first!
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => {
                const attPercent = calculateAttendance(player.id);
                return (
                  <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold text-primary">{index + 1}</TableCell>
                    <TableCell className="font-bold">{player.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {player.sports.map((s: string) => (
                          <Badge key={s} className="bg-accent text-accent-foreground font-bold text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{player.std}</TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${parseFloat(player.bmi) > 25 ? 'text-destructive' : 'text-primary'}`}>
                        {player.bmi}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2 max-w-[60px]">
                          <div 
                            className={`h-2 rounded-full ${attPercent > 80 ? 'bg-green-500' : attPercent > 50 ? 'bg-yellow-500' : 'bg-destructive'}`} 
                            style={{ width: `${attPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{attPercent}%</span>
                      </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase">Edit Player Profile</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right font-bold">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="col-span-3 rounded-xl border-2"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-bold mt-2">Sports</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2 bg-primary/5 p-4 rounded-xl border-2 border-primary/10">
                  {SPORTS_LIST.map(sport => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-sport-${sport}`}
                        checked={editingPlayer.sports.includes(sport)}
                        onCheckedChange={() => toggleSportInEdit(sport)}
                      />
                      <Label htmlFor={`edit-sport-${sport}`} className="text-sm font-medium cursor-pointer">{sport}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-std" className="text-right font-bold">Standard</Label>
                <div className="col-span-3">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="edit-height" className="text-right font-bold">Ht (cm)</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    value={editingPlayer.height}
                    onChange={(e) => {
                      const h = parseFloat(e.target.value) / 100;
                      const w = parseFloat(editingPlayer.weight);
                      const bmi = (w / (h * h)).toFixed(1);
                      setEditingPlayer({ 
                        ...editingPlayer, 
                        height: e.target.value,
                        bmi: isNaN(parseFloat(bmi)) ? "0" : bmi
                      });
                    }}
                    className="rounded-xl border-2"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="edit-weight" className="text-right font-bold">Wt (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={editingPlayer.weight}
                    onChange={(e) => {
                      const h = parseFloat(editingPlayer.height) / 100;
                      const w = parseFloat(e.target.value);
                      const bmi = (w / (h * h)).toFixed(1);
                      setEditingPlayer({ 
                        ...editingPlayer, 
                        weight: e.target.value,
                        bmi: isNaN(parseFloat(bmi)) ? "0" : bmi
                      });
                    }}
                    className="rounded-xl border-2"
                  />
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
