"use client";

import React, { useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';

export function Teams({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const players = store.data.players;
  
  const getCategory = useCallback((p: any) => {
    const age = parseInt(p.age) || 0;
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  }, []);

  const categories = useMemo(() => ['Girls U14', 'Girls U17', 'Boys U14', 'Boys U17', 'Boys Senior', 'Girls Senior'], []);
  
  const groups = useMemo(() => {
    const map: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    players.forEach((p: any) => {
      if (preselectedSport && !p.sports?.includes(preselectedSport)) return;
      const cat = getCategory(p);
      if (map[cat]) map[cat].push(p);
    });
    return map;
  }, [players, preselectedSport, categories, getCategory]);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Waghamba Hub - Team Lists</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #333; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 30px; text-decoration: underline; }
            h2 { margin-top: 30px; color: #1e3a8a; border-left: 5px solid #f59e0b; padding-left: 10px; text-transform: uppercase; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: 900; }
            .footer { margin-top: 50px; font-size: 10px; opacity: 0.5; text-align: center; }
          </style>
        </head>
        <body>
          <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
          <div class="report-type">${preselectedSport?.toUpperCase() || 'GENERAL'} SQUAD ROSTERS</div>
          ${categories.map(cat => groups[cat].length > 0 ? `
            <h2>${cat} (${groups[cat].length} Players)</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Std</th><th>Age</th><th>Sports</th></tr>
              </thead>
              <tbody>
                ${groups[cat].map(p => `
                  <tr>
                    <td><strong>${p.name.toUpperCase()}</strong></td>
                    <td>${p.std}</td>
                    <td>${p.age}</td>
                    <td>${(p.sports || []).join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '').join('')}
          <div class="footer">Confidential Institutional Document • WGB Hub v4.3.0</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
          {preselectedSport || 'All'} Category Teams
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold border-2" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Rosters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => groups[cat].length > 0 ? (
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
                      <th className="p-3">Skill Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[cat].map((p, i) => {
                      const skill = store.data.sportSkills[`${p.id}_${preselectedSport || p.sports?.[0]}`];
                      return (
                        <tr key={p.id} className={`border-b border-primary/5 ${i % 2 === 0 ? 'bg-white' : 'bg-primary/[0.02]'}`}>
                          <td className="p-3 font-bold text-foreground/80 uppercase">{p.name}</td>
                          <td className="p-3 text-muted-foreground">Std {p.std}</td>
                          <td className="p-3 font-black text-primary">{skill?.score || '0'}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null)}
      </div>
    </div>
  );
}
