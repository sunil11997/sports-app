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
  Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function History({ store }: { store: any }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

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
          <title>Institutional History - ${player.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; margin-bottom: 10px; text-transform: uppercase; }
            h2 { color: #1b4b3a; margin-top: 30px; border-left: 5px solid #8AF075; padding-left: 15px; text-transform: uppercase; font-size: 16px; }
            .meta { background: #f4fcf6; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-weight: bold; }
            .item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .date { font-size: 11px; color: #666; font-weight: bold; }
            .title { font-weight: bold; color: #235C36; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Institutional Performance & Health Dossier</h1>
          <div class="meta">
            PLAYER: ${player.name} | STD: ${player.std} | AGE: ${player.age} | GENDER: ${player.gender}
          </div>

          <h2>Sports Skill Proficiency</h2>
          <table>
            <thead>
              <tr>
                <th>Sport</th>
                <th>Overall Score</th>
                <th>Last Assessment</th>
              </tr>
            </thead>
            <tbody>
              ${playerSkills.map(s => `
                <tr>
                  <td><strong>${s.sportName}</strong></td>
                  <td>${s.score}</td>
                  <td>${format(new Date(s.lastUpdated), 'PPP')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Fitness Evolution</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${playerFitness.map(f => `
                <tr>
                  <td>${format(new Date(f.updatedAt || f.date), 'PPP')}</td>
                  <td>${f.score}</td>
                  <td>${f.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Medical & Health Log</h2>
          ${playerIncidents.map(inc => `
            <div class="item">
              <div class="date">${format(new Date(inc.date), 'PPP')}</div>
              <div class="title">Incident Logged</div>
              <div style="font-size: 12px;">${inc.description}</div>
            </div>
          `).join('')}
          ${playerIncidents.length === 0 ? '<p>No health incidents on record.</p>' : ''}

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
              <HistoryIcon className="w-10 h-10 text-accent" /> History Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Access the complete institutional history for any student, including past performance and medical logs.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
              <SelectTrigger className="rounded-2xl border-2 h-14 text-lg font-bold bg-white shadow-sm">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {store.data.players.map((p: any) => (
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
              Export Full Dossier
            </Button>
          </div>
        </div>
      </div>

      {!selectedPlayerId ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center justify-center text-muted-foreground rounded-[3rem] bg-white/50">
          <User className="w-20 h-20 mb-6 opacity-10" />
          <h3 className="text-2xl font-black uppercase tracking-widest opacity-30">Selection Required</h3>
          <p className="font-bold opacity-30 uppercase text-xs mt-2 text-center">Please pick a student from the list above to view records</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Health History */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <HeartPulse className="w-6 h-6 text-destructive" />
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Health History</h3>
            </div>
            <div className="space-y-4">
              {playerIncidents.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5 text-center italic text-muted-foreground">
                  No medical records found
                </div>
              ) : (
                playerIncidents.map((inc: any) => (
                  <Card key={inc.id} className="border-2 border-primary/5 rounded-[1.5rem] bg-white overflow-hidden shadow-sm">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">
                          {format(new Date(inc.date), 'dd MMM yyyy')}
                        </Badge>
                        <Stethoscope className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                        {inc.description}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Performance & Skills History */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Medal className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Game Skills</h3>
            </div>
            <div className="space-y-4">
              {playerSkills.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5 text-center italic text-muted-foreground">
                  No technical evaluations yet
                </div>
              ) : (
                playerSkills.map((skill: any, idx: number) => (
                  <Card key={idx} className="border-2 border-primary/5 rounded-[1.5rem] bg-white overflow-hidden shadow-sm group hover:border-accent/30 transition-all">
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-primary">
                          {skill.sportName[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-primary uppercase text-sm">{skill.sportName}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(skill.lastUpdated), 'MMM yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary">{skill.score}</span>
                        <Badge variant="ghost" className="block text-[8px] font-black uppercase opacity-50 p-0">Expertise</Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Fitness Progression */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Fitness Evaluation</h3>
            </div>
            <div className="space-y-4">
              {playerFitness.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5 text-center italic text-muted-foreground">
                  No fitness logs on record
                </div>
              ) : (
                playerFitness.map((fit: any, idx: number) => (
                  <Card key={idx} className="border-2 border-primary/5 rounded-[1.5rem] bg-white overflow-hidden shadow-sm">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-black text-primary uppercase text-xs">Institutional Test</h4>
                        <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(fit.updatedAt || fit.date), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Fitness Level</p>
                          <Badge className="bg-primary text-primary-foreground font-black text-[10px]">
                            {fit.status || 'General'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-primary">{fit.score}</span>
                          <span className="text-[10px] font-bold text-muted-foreground block uppercase">Avg Score</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {player && (
        <div className="bg-primary p-12 rounded-[3rem] text-primary-foreground shadow-2xl relative overflow-hidden mt-12">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-3xl">
                <Medal className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Institutional Heritage</h3>
            </div>
            <p className="text-lg font-medium opacity-80 leading-relaxed max-w-2xl">
              Every log entry contributes to the lifelong athletic journey of {player.name}. This record is the official institutional memory of their development at **शासकीय माध्यमिक आश्रम शाळा वाघंबा**.
            </p>
          </div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>
      )}
    </div>
  );
}
