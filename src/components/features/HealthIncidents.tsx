
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, History, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function HealthIncidents({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = React.useState("");
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = React.useState("");

  const handleSave = () => {
    if (!selectedPlayer || !date || !description) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayer);
    const incident = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description
    };

    store.addHealthIncident(incident);
    setDescription("");
    toast({ title: "Incident Logged", description: "Health record has been updated." });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Health History Log - Waghamba School</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; }
            h1 { color: #8A1515; border-bottom: 2px solid #ddd; }
            .incident { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .date { color: #666; font-size: 12px; }
            .name { font-weight: bold; font-size: 16px; margin-right: 10px; }
            .desc { margin-top: 5px; color: #444; line-height: 1.5; }
          </style>
        </head>
        <body>
          <h1>Complete Medical History Log</h1>
          ${store.data.healthIncidents.map((inc: any) => `
            <div class="incident">
              <span class="name">${inc.playerName}</span>
              <span class="date">${format(new Date(inc.date), 'dd MMM yyyy')}</span>
              <div class="desc">${inc.description}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Plus className="w-5 h-5" /> Log New Incident
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">Select Player</label>
              <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue placeholder="Choose player..." />
                </SelectTrigger>
                <SelectContent>
                  {store.data.players.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">Incident Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">Description / Treatment</label>
              <Textarea 
                placeholder="e.g. Twisted ankle during Kabaddi practice. Applied ice pack." 
                className="rounded-xl border-2 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6" onClick={handleSave}>
              Save Incident Record
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
            <History className="w-6 h-6" /> Medical History Log
          </h3>
          <Button variant="outline" onClick={handlePrint} className="rounded-xl font-bold border-2">
            <Printer className="w-4 h-4 mr-2" /> Print Full History
          </Button>
        </div>
        
        <div className="space-y-4">
          {store.data.healthIncidents.length === 0 ? (
            <Card className="border-dashed border-2 p-12 flex flex-col items-center text-muted-foreground rounded-3xl">
              <Stethoscope className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No health incidents recorded yet.</p>
            </Card>
          ) : (
            store.data.healthIncidents.map((inc: any) => (
              <Card key={inc.id} className="border-2 border-primary/10 hover:border-primary/20 transition-all rounded-2xl shadow-sm bg-white">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black">
                        {inc.playerName[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-primary uppercase leading-tight">{inc.playerName}</h4>
                        <span className="text-xs text-muted-foreground font-mono">{format(new Date(inc.date), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px]">Incident</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 border-l-2 border-accent ml-5 pl-4 py-1 mt-2">
                    {inc.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
