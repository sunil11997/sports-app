"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History as HistoryIcon, 
  Printer, 
  HeartPulse, 
  Trophy, 
  Activity, 
  User,
  Medal,
  Stethoscope,
  Scale,
  Ruler,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function History({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';

  const availablePlayers = store.data.players.filter((p: any) => p.category === targetCategory);

  const player = useMemo(() => 
    store.data.players.find((p: any) => p.id === selectedPlayerId),
    [selectedPlayerId, store.data.players]
  );

  const playerIncidents = useMemo(() => 
    store.data.healthIncidents.filter((inc: any) => inc.playerId === selectedPlayerId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [selectedPlayerId, store.data.healthIncidents]
  );

  const playerFitness = useMemo(() => 
    (store.data.fitnessHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime()),
    [selectedPlayerId, store.data.fitnessHistory]
  );

  const playerSkills = useMemo(() => 
    (store.data.skillsHistory[selectedPlayerId] || [])
      .sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()),
    [selectedPlayerId, store.data.skillsHistory]
  );

  const handlePrint = () => {
    if (!player) return;
    const printContent = `
      <html>
        <head>
          <title>${isGeneral ? 'Student Progress Dossier' : 'Institutional Performance History'} - ${player.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; margin-bottom: 10px; text-transform: uppercase; }
            h2 { color: #1b4b3a; margin-top: 30px; border-left: 5px solid #8AF075; padding-left: 15px; text-transform: uppercase; font-size: 16px; }
            .meta { background: #f4fcf6; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${isGeneral ? 'MONTHLY GROWTH & PROGRESS DOSSIER' : 'ATHLETIC PERFORMANCE RECORD'}</h1>
          <div class="meta">
            NAME: ${player.name} | STD: ${player.std} | AGE: ${player.age} | GENDER: ${player.gender}
          </div>

          ${isGeneral ? `
            <h2>Monthly Growth & Exam Evolution</h2>
            <table>
              <thead>
                <tr>
                  <th>Log Date</th>
                  <th>Height (cm)</th>
                  <th>Weight (kg)</th>
                  <th>Exam Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${playerFitness.map(f => `
                  <tr>
                    <td>${format(new Date(f.updatedAt || f.date || new Date()), 'PPP')}</td>
                    <td>${f.height || '-'}</td>
                    <td>${f.weight || '-'}</td>
                    <td>${f.examMarks || '-'}</td>
                    <td>${f.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <h2>Sports Skill Proficiency</h2>
            <table>
              <thead>
                <tr><th>Sport</th><th>Overall Score</th><th>Last Assessment</th></tr>
              </thead>
              <tbody>
                ${playerSkills.map(s => `
                  <tr><td><strong>${s.sportName}</strong></td><td>${s.score}</td><td>${format(new Date(s.lastUpdated || new Date()), 'PPP')}</td></tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Fitness Evolution</h2>
            <table>
              <thead>
                <tr><th>Date</th><th>Total Score</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${playerFitness.map(f => `
                  <tr><td>${format(new Date(f.updatedAt || f.date || new Date()), 'PPP')}</td><td>${f.score}</td><td>${f.status}</td></tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <h2>Medical & Health Log</h2>
          ${playerIncidents.map(inc => `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
              <div style="font-size: 11px; color: #666;">${format(new Date(inc.date), 'PPP')}</div>
              <div style="font-size: 12px;">${inc.description}</div>
            </div>
          `).join('')}

          <footer style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #888; text-align: center;">
            Official Record from शासकीय माध्यमिक आश्रम शाळा वाघंबा - Teacher Sunil Deshmukh
          </footer>
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
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <HistoryIcon className="w-10 h-10 text-accent" /> {isGeneral ? 'Registry Archives' : 'Athlete Dossiers'}
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              {isGeneral ? 'Complete monthly history of growth metrics and academic scores for students.' : 'Detailed athletic evolution and skill progression history for school players.'}
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
              <SelectTrigger className="rounded-2xl border-2 h-14 text-lg font-bold bg-white shadow-sm">
                <SelectValue placeholder="Pick a student..." />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              disabled={!selectedPlayerId} 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 font-black text-lg shadow-lg uppercase tracking-wider transition-all active:scale-95"
            >
              <Printer className="w-6 h-6 mr-2" />
              Export Full Report
            </Button>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center justify-center text-muted-foreground rounded-[3rem] bg-white/50">
          <User className="w-20 h-20 mb-6 opacity-10" />
          <h3 className="text-2xl font-black uppercase tracking-widest opacity-30">Selection Required</h3>
          <p className="font-bold opacity-30 uppercase text-xs mt-2 text-center">Please pick a student from the archives to view their journey</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <HeartPulse className="w-6 h-6 text-destructive" />
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Health Registry</h3>
            </div>
            <div className="space-y-4">
              {playerIncidents.map((inc: any) => (
                <Card key={inc.id} className="border-2 border-primary/5 rounded-[1.5rem] bg-white overflow-hidden shadow-sm">
                  <div className="p-5">
                    <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive mb-2">
                      {format(new Date(inc.date), 'dd MMM yyyy')}
                    </Badge>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                      {inc.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-4">
              {isGeneral ? <GraduationCap className="w-6 h-6 text-primary" /> : <Medal className="w-6 h-6 text-accent" />}
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                {isGeneral ? 'Monthly Growth & Marks Log' : 'Performance Progression'}
              </h3>
            </div>
            <div className="space-y-4">
              {playerFitness.map((fit: any, idx: number) => (
                <Card key={idx} className="border-2 border-primary/5 rounded-[2rem] bg-white overflow-hidden shadow-sm hover:border-primary/20 transition-all">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {format(new Date(fit.updatedAt || fit.date || new Date()), 'MMMM yyyy')}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{fit.status}</span>
                    </div>
                    
                    {isGeneral ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-primary/5 p-4 rounded-2xl text-center">
                          <Ruler className="w-4 h-4 text-primary mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Height</p>
                          <p className="text-xl font-black text-primary">{fit.height || '-'} <span className="text-[10px]">cm</span></p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-2xl text-center">
                          <Scale className="w-4 h-4 text-primary mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Weight</p>
                          <p className="text-xl font-black text-primary">{fit.weight || '-'} <span className="text-[10px]">kg</span></p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-2xl text-center border border-primary/10">
                          <FileText className="w-4 h-4 text-accent mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Exam Score</p>
                          <p className="text-xl font-black text-accent">{fit.examMarks || '0'}<span className="text-[10px]">/100</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Score</p>
                          <span className="text-3xl font-black text-primary">{fit.score}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Fitness Level</p>
                          <Badge className="bg-primary text-primary-foreground font-black text-[10px]">
                            {fit.status || 'General'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
