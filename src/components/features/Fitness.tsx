"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Printer, Scale, Save, Loader2, Calendar, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

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
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Auto-sync local state when store data arrives from Firestore
  useEffect(() => {
    if (store.isLoaded && store.data.fitness) {
      setAssessments(prev => {
        // Only update if current local state is mostly empty or data has changed
        const newMap = { ...prev };
        Object.entries(store.data.fitness).forEach(([id, data]) => {
          if (!newMap[id]) newMap[id] = data;
        });
        return newMap;
      });
    }
  }, [store.isLoaded, store.data.fitness]);

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
          enduranceScore: '',
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

  const calculateAutoScores = (id: string) => {
    const current = assessments[id] || {};
    const situps = parseInt(current.sitUps) || 0;
    const boardJump = parseInt(current.boardJump) || 0;
    const situpsRating = Math.min(60, (situps / 35) * 60);
    const jumpRating = Math.min(40, (boardJump / 220) * 40);
    const strength = Math.round(situpsRating + jumpRating);

    const run60Parts = (current.run600m || "").split(':');
    let run600Seconds = 0;
    if (run60Parts.length === 2) {
      run600Seconds = (parseInt(run60Parts[0]) * 60) + parseInt(run60Parts[1]);
    } else {
      run600Seconds = parseInt(run60Parts[0]) || 0;
    }
    
    let endurance = 0;
    if (run600Seconds > 0) {
      endurance = Math.max(0, Math.min(100, Math.round(100 - (run600Seconds - 130) * 0.5)));
    }

    return { strength, endurance };
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    const { strength, endurance } = calculateAutoScores(id);
    const current = { ...(assessments[id] || {}) };
    setIsSaving(id);
    
    let status = 'Logged';

    if (!isGeneral) {
      current.strengthScore = strength.toString();
      current.enduranceScore = endurance.toString();

      const fields = ['shuttleRun', 'run50m', 'run600m', 'sitAndReach', 'boardJump', 'sitUps', 'strengthScore', 'enduranceScore'];
      let sum = 0;
      let count = 0;

      fields.forEach(f => {
        if (f === 'run600m' || f === 'run50m' || f === 'shuttleRun') return;
        const val = parseFloat(current[f]);
        if (!isNaN(val)) {
          sum += (val > 100 ? 100 : val);
          count++;
        }
      });
      
      sum += (strength + endurance);
      count += 2;

      const calculatedScore = count > 0 ? Math.round(sum / count).toString() : "0";
      const scoreNum = parseInt(calculatedScore);
      
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
    
    setLastSavedId(id);
    setTimeout(() => setLastSavedId(null), 1000);
    setIsSaving(null);

    toast({ 
      title: "Data Synced to Cloud", 
      description: `${player.name}'s performance metrics have been archived.`,
    });
  };

  const handlePrint = () => {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const categoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All";
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Growth Report' : 'Athletic Profile'} - ${categoryLabel}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 30px; font-size: 10px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #235C36; padding-bottom: 10px; }
            h1 { color: #235C36; text-transform: uppercase; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f8f8f8; font-weight: bold; font-size: 8px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INSTITUTIONAL PERFORMANCE REGISTRY</h1>
            <p>Period: ${currentMonth} | Category: ${categoryLabel.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                ${isGeneral ? '<th>HT</th><th>WT</th><th>EXAM SC</th>' : '<th>10x6</th><th>50M</th><th>600M</th><th>REACH</th><th>JUMP</th><th>SITUPS</th><th>ENDURANCE %</th><th>STRENGTH %</th>'}
                <th>AGGREGATE</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                const fit = store.data.fitness[p.id] || {};
                return `
                  <tr>
                    <td><strong>${p.name}</strong> (Std ${p.std})</td>
                    ${isGeneral ? `<td>${fit.height || '-'}</td><td>${fit.weight || '-'}</td><td>${fit.examMarks || '-'}</td>` : `<td>${fit.shuttleRun || '-'}</td><td>${fit.run50m || '-'}</td><td>${fit.run600m || '-'}</td><td>${fit.sitAndReach || '-'}</td><td>${fit.boardJump || '-'}</td><td>${fit.sitUps || '-'}</td><td>${fit.enduranceScore || '-'}%</td><td>${fit.strengthScore || '-'}%</td>`}
                    <td>${fit.score || '0'}${isGeneral ? '' : '%'}</td>
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

  if (!store.isLoaded) {
    return <TableSkeleton rows={12} cols={10} />;
  }

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
              {isGeneral ? 'Monthly Growth Registry' : 'Advanced Athletic Hub'}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isGeneral && (
            <Badge variant="outline" className="bg-white border-2 border-accent text-accent-foreground font-black uppercase text-[9px] px-3 h-9 hidden md:flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> Auto-Scoring Active
            </Badge>
          )}
          <Button onClick={handlePrint} size="sm" className="font-bold h-9 bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4 mr-2" /> Print Sheet
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto ios-card-shadow">
        <Table className="border-collapse min-w-max">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow className="border-b">
              <TableHead className="border-r h-10 px-4 font-black text-[11px] uppercase w-[180px] sticky left-0 bg-muted/95 z-30">Athlete</TableHead>
              {isGeneral ? (
                <>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">HT (cm)</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">WT (kg)</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[90px]">Exam</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">10x6</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">50M</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[75px]">600M</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Reach</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Jump</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[60px]">Situps</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[85px] bg-accent/5">Auto Endur.</TableHead>
                  <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[85px] bg-accent/5">Auto Strength</TableHead>
                </>
              )}
              <TableHead className="border-r h-10 px-2 font-black text-[10px] uppercase text-center w-[120px]">Final Level</TableHead>
              <TableHead className="h-10 px-2 font-black text-[10px] uppercase text-right w-[60px] sticky right-0 bg-muted/95 z-30">Save</TableHead>
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
                const current = assessments[player.id] || store.data.fitness[player.id] || {};
                const { strength, endurance } = !isGeneral ? calculateAutoScores(player.id) : { strength: 0, endurance: 0 };
                const isPulse = lastSavedId === player.id;
                
                return (
                  <TableRow 
                    key={player.id} 
                    className={cn(
                      "border-b even:bg-muted/10 hover:bg-primary/5 transition-all h-12",
                      isPulse && "animate-success-pulse"
                    )}
                  >
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 ios-blur">
                      <div className="flex flex-col">
                        <span className="text-primary uppercase truncate w-[140px]">{player.name}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Std {player.std}</span>
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
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="S" value={current.shuttleRun || ''} onChange={(e) => handleChange(player.id, 'shuttleRun', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="S" value={current.run50m || ''} onChange={(e) => handleChange(player.id, 'run50m', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="M:S" value={current.run600m || ''} onChange={(e) => handleChange(player.id, 'run600m', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="CM" value={current.sitAndReach || ''} onChange={(e) => handleChange(player.id, 'sitAndReach', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="CM" value={current.boardJump || ''} onChange={(e) => handleChange(player.id, 'boardJump', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0"><Input className="h-12 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" placeholder="#" value={current.sitUps || ''} onChange={(e) => handleChange(player.id, 'sitUps', e.target.value)} /></TableCell>
                        <TableCell className="border-r p-0 text-center bg-accent/[0.03]">
                          <span className={cn(
                            "text-[10px] font-black",
                            endurance >= 80 ? "text-green-600" : endurance >= 50 ? "text-orange-600" : "text-destructive"
                          )}>{endurance}%</span>
                        </TableCell>
                        <TableCell className="border-r p-0 text-center bg-accent/[0.03]">
                          <span className={cn(
                            "text-[10px] font-black",
                            strength >= 80 ? "text-green-600" : strength >= 50 ? "text-orange-600" : "text-destructive"
                          )}>{strength}%</span>
                        </TableCell>
                      </>
                    )}

                    <TableCell className="border-r p-1 text-center bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-primary">{current.score || '0'}{isGeneral ? '' : '%'}</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground truncate w-full px-1">{current.status || 'Pending'}</span>
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
