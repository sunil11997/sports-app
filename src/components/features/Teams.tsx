"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, UsersRound, Trophy } from 'lucide-react';

export function Teams({ store }: { store: any }) {
  const players = store.data.players;
  
  const getCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  };

  const categories = ['Girls U14', 'Girls U17', 'Boys U14', 'Boys U17'];
  const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
  
  players.forEach((p: any) => {
    const cat = getCategory(p);
    if (groups[cat]) groups[cat].push(p);
  });

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Aashram School Waghamba - Team Lists</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; }
            h1 { color: #235C36; border-bottom: 2px solid #8AF075; padding-bottom: 10px; }
            h2 { margin-top: 30px; color: #1b4b3a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #235C36; color: white; }
          </style>
        </head>
        <body>
          <h1>AASHRAM SCHOOL WAGHAMBA - CATEGORY ROSTERS</h1>
          ${categories.map(cat => `
            <h2>${cat} (${groups[cat].length} Players)</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Std</th><th>Age</th><th>Sports</th></tr>
              </thead>
              <tbody>
                ${groups[cat].map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.std}</td>
                    <td>${p.age}</td>
                    <td>${(p.sports || []).join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Age Category Teams</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold border-2" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Rosters
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <Card key={cat} className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden hover:border-accent transition-all">
            <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">
                {cat}
              </CardTitle>
              <Badge className="bg-accent text-accent-foreground font-black">
                {groups[cat].length} PLAYERS
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 sticky top-0">
                    <tr className="text-left font-bold text-primary">
                      <th className="p-3">Player Name</th>
                      <th className="p-3">Std</th>
                      <th className="p-3">Sports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[cat].length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground font-medium">
                          No players in this category
                        </td>
                      </tr>
                    ) : (
                      groups[cat].map((p, i) => (
                        <tr key={p.id} className={`border-b border-primary/5 ${i % 2 === 0 ? 'bg-white' : 'bg-primary/[0.02]'}`}>
                          <td className="p-3 font-bold text-foreground/80">{p.name}</td>
                          <td className="p-3 text-muted-foreground">{p.std}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(p.sports || []).map((s: string) => (
                                <Badge key={s} variant="outline" className="text-[10px] font-bold uppercase border-accent text-primary">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary p-8 rounded-[2.5rem] text-primary-foreground shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-3">
              <Trophy className="w-8 h-8 text-accent" /> Sport-Specific Teams
            </h3>
            <p className="text-primary-foreground/80 font-medium">
              Teams are automatically suggested based on player skill scores and physical fitness assessment.
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-black px-10 py-8 rounded-2xl text-xl uppercase tracking-widest shadow-lg">
            Generate Dynamic Teams
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>
    </div>
  );
}
