
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, Printer, Scale, Save, Loader2, Calendar, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
];

export function Fitness({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Record<string, any>>(store.data.fitness);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

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

  const getReadableCategory = (p: any) => {
    const age = parseInt(p.age) || 0;
    const genderLabel = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${genderLabel} U14`;
    if (age < 17) return `${genderLabel} U17`;
    return `${genderLabel} Senior`;
  };

  const filteredPlayers = store.data.players.filter((p: any) => {
    const matchesTarget = p.category === targetCategory;
    const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
    return matchesTarget && matchesTab;
  });

  const handleChange = (id: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          shuttleRun: '', 
          run50m: '', 
          run600m: '', 
          sitAndReach: '', 
          boardJump: '', 
          sitUps: '', 
          strengthScore: '',
          score: '', 
          status: '',
          height: '',
          weight: '',
          examMarks: ''
        }),
        [field]: value
      }
    }));
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    const current = assessments[id] || {};
    setIsSaving(id);
    
    let scoreNum = 0;
    let status = 'Logged';

    if (!isGeneral) {
      // Auto-Strength from Sit-ups (Approx)
      const situps = parseInt(current.sitUps) || 0;
      const autoStrength = Math.min(100, Math.round((situps / 35) * 100));
      if (!current.strengthScore) current.strengthScore = autoStrength.toString();

      const fields = ['shuttleRun', 'run50m', 'run600m', 'sitAndReach', 'boardJump', 'sitUps', 'strengthScore'];
      let sum = 0;
      let count = 0;

      fields.forEach(f => {
        const val = parseFloat(current[f]);
        if (!isNaN(val)) {
          sum += (val > 100 ? 100 : val);
          count++;
        }
      });

      const calculatedScore = count > 0 ? Math.round(sum / count).toString() : "0";
      scoreNum = parseInt(calculatedScore);
      
      if (scoreNum >= 85) status = 'Level A (Elite)';
      else if (scoreNum >= 70) status = 'Level B (Advanced)';
      else if (scoreNum >= 50) status = 'Level C (Developing)';
      else if (scoreNum > 0) status = 'Level D (Needs Support)';
      
      current.score = calculatedScore;
    } else {
      status = 'Updated';
      current.score = current.examMarks || "0";
    }

    const finalAssessment = { ...current, status };
    store.setFitness(id, finalAssessment);
    setAssessments(prev => ({ ...prev, [id]: finalAssessment }));
    
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 1000);
    setIsSaving(null);

    toast({ 
      title: "Data Synced", 
      description: `Fitness record for ${player.name} archived successfully.`,
      className: "bg-accent border-accent-foreground text-accent-foreground font-black",
    });
  };

  const handlePrint = () => {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const categoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Monthly Growth Report' : 'Fitness Report'} - ${categoryLabel}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 10px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #235C36; padding-bottom: 10px; }
            h1 { color: #235C36; text-transform: uppercase; margin: 0; }
            .month-sub { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; font-size: 9px; text-transform: uppercase; }
            .score-cell { font-weight: 900; color: #235C36; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isGeneral ? 'MONTHLY STUDENT GROWTH LOG' : 'INSTITUTIONAL ATHLETE FITNESS'}</h1>
            <div class="month-sub">Period: ${currentMonth} | Category: ${categoryLabel.toUpperCase()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>CATEGORY</th>
                ${isGeneral ? 
                  '<th>HT (CM)</th><th>WT (KG)</th><th>EXAM SC</th>' : 
                  '<th>10x6</th><th>50M</th><th>600M</th><th>REACH</th><th>JUMP</th><th>SITUPS</th><th>STRENGTH %</th>'
                }
                <th>TOTAL</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                const category = getReadableCategory(p);
                return `
                  <tr>
                    <td><strong>${p.name}</strong><br/><small>Std ${p.std}</small></td>
                    <td>${category}</td>
                    ${isGeneral ? 
                      `<td>${fit.height || '-'}</td><td>${fit.weight || '-'}</td><td>${fit.examMarks || '-'}</td>` : 
                      `<td>${fit.shuttleRun || '-'}</td><td>${fit.run50m || '-'}</td><td>${fit.run600m || '-'}</td><td>${fit.sitAndReach || '-'}</td><td>${fit.boardJump || '-'}</td><td>${fit.sitUps || '-'}</td><td>${fit.strengthScore || '-'}%</td>`
                    }
                    <td class="score-cell">${fit.score || '0'}${isGeneral ? '' : '%'}</td>
                    <td><strong>${fit.status || 'PENDING'}</strong></td>
                  </tr>
                `;
              }).join('')}
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
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
        {CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={`h-8 rounded px-3 text-[10px] font-black uppercase transition-all ${activeCategory === cat.id ? '' : 'text-muted-foreground'}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {isGeneral ? <Scale className="w-6 h-6 text-primary" /> : <Activity className="w-6 h-6 text-accent" />}
          <div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">
              {isGeneral ? 'Monthly Growth Registry' : 'Athlete Fitness Registry'}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> Filtered: {CATEGORIES.find(c => c.id === activeCategory)?.label} | {format(new Date(), 'MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="font-bold h-9 border-2" onClick={() => window.location.hash = 'archive'}>
            <History className="w-4 h-4 mr-2" /> View History Spread
          </Button>
          <Button onClick={handlePrint} size="sm" className="font-bold h-9 bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4 mr-2" /> Print Sheet
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto ios-card-shadow">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-10 px-4 font-black text-[11px] uppercase w-[200px] sticky left-0 bg-muted/95 z-30">Student Details</TableHead>
              {isGeneral ? (
                <>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">HT (cm)</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">WT (kg)</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">Exam</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">10x6</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">50M</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">600M</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">Reach</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">Jump</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[65px]">Situps</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">Str Rating</TableHead>
                </>
              )}
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[120px]">Score / Level</TableHead>
              <TableHead className="h-10 px-2 font-black text-[10px] uppercase text-right w-[80px] sticky right-0 bg-muted/95 z-30">Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-12 text-muted-foreground font-bold uppercase tracking-widest opacity-30">
                  No records found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const current = assessments[player.id] || { 
                  shuttleRun: '', run50m: '', run600m: '', 
                  sitAndReach: '', boardJump: '', sitUps: '', strengthScore: '',
                  score: '', status: '',
                  height: '', weight: '', examMarks: ''
                };
                const isPulse = lastSavedId === player.id;
                
                return (
                  <TableRow 
                    key={player.id} 
                    className={cn(
                      "border-b even:bg-muted/20 hover:bg-primary/5 transition-all h-12",
                      isPulse && "animate-success-pulse"
                    )}
                  >
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 ios-blur">
                      <div className="flex flex-col">
                        <span className="text-primary uppercase truncate w-[160px]">{player.name}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Std {player.std} • {getReadableCategory(player)}</span>
                      </div>
                    </TableCell>
                    
                    {isGeneral ? (
                      <>
                        <TableCell className="border-r p-0">
                          <Input className="h-12 text-center text-xs border-0 bg-transparent focus:bg-white rounded-none" value={current.height || ''} onChange={(e) => handleChange(player.id, 'height', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-12 text-center text-xs border-0 bg-transparent focus:bg-white rounded-none" value={current.weight || ''} onChange={(e) => handleChange(player.id, 'weight', e.target.value)} />
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <Input className="h-12 text-center text-xs font-black text-primary border-0 bg-transparent focus:bg-white rounded-none" value={current.examMarks || ''} onChange={(e) => handleChange(player.id, 'examMarks', e.target.value)} />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.shuttleRun || ''} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.run50m || ''} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.run600m || ''} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.sitAndReach || ''} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.boardJump || ''} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={current.sitUps || ''} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-black text-primary border-0 bg-primary/5 focus:bg-white" placeholder="0-100" value={current.strengthScore || ''} onChange={(e) => handleChange(player.id, 'strengthScore', e.target.value)} /></TableCell>
                      </>
                    )}

                    <TableCell className="border-r p-1 text-center bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-primary">{current.score || '0'}{isGeneral ? '' : '%'}</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground truncate w-full">{current.status || 'Pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 text-right sticky right-0 bg-white z-10 ios-blur">
                      <Button variant="ghost" size="icon" className="h-12 w-full rounded-none text-primary" onClick={() => handleSave(player)} disabled={isSaving === player.id}>
                        {isSaving === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
