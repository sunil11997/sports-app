
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PenTool, Target, Users, Layout, Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GamePlanning() {
  const { toast } = useToast();
  const [matchName, setMatchName] = useState("");
  const [strategy, setStrategy] = useState("");
  const [formations, setFormations] = useState("");

  const handleSave = () => {
    toast({ title: "Strategy Saved", description: "Match plan archived to cloud registry." });
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win?.document.write(`
      <html>
        <head><title>Match Strategy - ${matchName}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #235C36; border-bottom: 2px solid #333;">Match Plan: ${matchName}</h1>
          <h3>Formations & Lineup:</h3>
          <p style="white-space: pre-wrap;">${formations}</p>
          <h3>Tactical Strategy:</h3>
          <p style="white-space: pre-wrap;">${strategy}</p>
        </body>
      </html>
    `);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-black text-primary uppercase flex items-center gap-3">
            <PenTool className="w-6 h-6" /> Tactical Planning Board
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="font-bold border-2"><Printer className="w-4 h-4 mr-2" /> Print Plan</Button>
            <Button size="sm" onClick={handleSave} className="font-bold"><Save className="w-4 h-4 mr-2" /> Save Strategy</Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Tournament/Match Name</label>
            <Input 
              value={matchName} 
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="e.g. District Kabaddi Final 2024" 
              className="h-12 font-bold rounded-xl border-2" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3" /> Formations & Lineups
              </label>
              <Textarea 
                value={formations}
                onChange={(e) => setFormations(e.target.value)}
                placeholder="List player positions and subs..." 
                className="min-h-[200px] rounded-2xl border-2 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Target className="w-3 h-3" /> Tactical Approach
              </label>
              <Textarea 
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Describe offensive and defensive tactics..." 
                className="min-h-[200px] rounded-2xl border-2 font-medium" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Layout, title: "Kabaddi Court", desc: "Standard 13m x 10m layout planning." },
          { icon: Layout, title: "Volleyball Court", desc: "Rotation and service zone strategy." },
          { icon: Layout, title: "Track Strategy", desc: "Relay exchange and pacing planning." }
        ].map((item, i) => (
          <Card key={i} className="border-2 rounded-[2rem] p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-black text-primary uppercase text-sm mb-1">{item.title}</h4>
            <p className="text-xs font-medium text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
