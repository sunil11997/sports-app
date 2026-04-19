"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Dashboard({ store }: { store: any }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredPlayers = store.data.players.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <TableHead className="text-primary-foreground font-bold uppercase">Gender</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Std</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Age</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">Sport</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase">BMI</TableHead>
              <TableHead className="text-primary-foreground font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground font-medium">
                  No players found. Register some players first!
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any, index: number) => (
                <TableRow key={player.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-bold text-primary">{index + 1}</TableCell>
                  <TableCell className="font-bold">{player.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={player.gender === 'Male' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}>
                      {player.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.std}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>
                    <Badge className="bg-accent text-accent-foreground font-bold">
                      {player.sport}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono font-bold ${parseFloat(player.bmi) > 25 ? 'text-destructive' : 'text-primary'}`}>
                      {player.bmi}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}