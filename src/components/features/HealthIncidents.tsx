
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Plus, 
  History, 
  Printer, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const INCIDENT_TYPES = [
  { 
    label: "Muscle Sprain / Strain", 
    value: "sprain",
    treatment: "R.I.C.E Protocol: Rest the affected area. Ice for 15-20 mins. Compression with elastic bandage. Elevate above heart level."
  },
  { 
    label: "Heat Exhaustion / Dehydration", 
    value: "heat",
    treatment: "Move to cool/shaded area. Provide water or electrolytes. Use cool towels on forehead/neck. Monitor breathing."
  },
  { 
    label: "Minor Cut / Abrasion", 
    value: "cut",
    treatment: "Clean with antiseptic solution. Apply sterile bandage. Check for debris in wound."
  },
  { 
    label: "Head Impact / Dizziness", 
    value: "head",
    treatment: "CRITICAL: Stop all activity. Observe for confusion, nausea, or vision issues. Notify parents immediately. Seek medical consult if symptoms persist."
  },
  { 
    label: "Joint Dislocation / Fracture", 
    value: "fracture",
    treatment: "CRITICAL: Do not move the limb. Splint in current position. Apply ice pack carefully. Immediate emergency transport required."
  },
  { 
    label: "Asthma / Breathing Issue", 
    value: "breathing",
    treatment: "Assist with prescribed inhaler. Ensure student remains upright. Keep surroundings calm. If no improvement in 5 mins, call medical emergency."
  },
  { 
    label: "Other / General", 
    value: "other",
    treatment: "Observe student. Provide rest. Contact school nurse if needed."
  }
];

const BODY_PARTS = [
  { id: 'ankle', label: 'Ankle (घोटा)' },
  { id: 'knee', label: 'Knee (गुडघा)' },
  { id: 'shoulder', label: 'Shoulder (खांदा)' },
  { id: 'wrist', label: 'Wrist (मनगट)' },
  { id: 'back', label: 'Lower Back (कमर/पाठ)' },
  { id: 'hamstring', label: 'Hamstring (मांडीचे स्नायू)' }
];

export function HealthIncidents({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [severity, setSeverity] = useState("Minor");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  useEffect(() => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const isGeneral = section === 'general';
  
  const filteredPlayers = useMemo(() => 
    store.data.players
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      }),
    [store.data.players, isGeneral]
  );

  const currentTypeData = useMemo(() => 
    INCIDENT_TYPES.find(t => t.value === selectedType), 
    [selectedType]
  );

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    const typeData = INCIDENT_TYPES.find(t => t.value === val);
    if (typeData) {
      setDescription(`प्रकार: ${typeData.label}\n\nSUGGESTED TREATMENT:\n${typeData.treatment}\n\nटिप्पणी: `);
      if (val === 'head' || val === 'fracture') {
        setSeverity("Critical");
      } else {
        setSeverity("Minor");
      }
    }
  };

  const handleSave = () => {
    if (!selectedPlayer || !date || !description) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayer);
    const bodyPartInfo = selectedBodyPart ? `[भाग: ${selectedBodyPart}] ` : '';
    
    const incident = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description: `[${severity.toUpperCase()}] ${bodyPartInfo}${description}`,
      severity,
      category: player?.category || 'student'
    };

    store.addHealthIncident(incident);
    setDescription("");
    setSelectedType("");
    setSelectedPlayer("");
    setSelectedBodyPart(null);
    toast({ 
      title: severity === "Critical" ? "CRITICAL ALERT LOGGED" : "Injury Hub Updated", 
      description: "Health record has been archived in the cloud vault.",
      variant: severity === "Critical" ? "destructive" : "default"
    });
  };

  const handlePrint = () => {
    const incidentsToPrint = store.data.healthIncidents.filter((inc: any) => 
      filteredPlayers.some((p: any) => p.id === inc.playerId)
    );

    const printContent = `
      <html>
        <head>
          <title>Injury Registry - Waghamba Hub</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; }
            h1 { color: #8A1515; border-bottom: 2px solid #ddd; text-transform: uppercase; }
            .incident { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .critical { border-left: 5px solid red; padding-left: 15px; }
            .date { color: #666; font-size: 12px; font-weight: bold; }
            .name { font-weight: 900; font-size: 18px; color: #235C36; }
            .desc { margin-top: 8px; color: #333; line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: #eee; }
            .badge-critical { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Complete Injury & Medical Log - ${section.toUpperCase()} HUB</h1>
          <p>Institutional Record - Teacher Sunil Deshmukh</p>
          <hr/>
          ${incidentsToPrint.map((inc: any) => {
            const isCritical = inc.description.includes('[CRITICAL]');
            return `
              <div class="incident ${isCritical ? 'critical' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="name">${inc.playerName}</span>
                  <span class="badge ${isCritical ? 'badge-critical' : ''}">${isCritical ? 'CRITICAL' : 'MINOR'}</span>
                </div>
                <span class="date">${format(new Date(inc.date), 'dd MMMM yyyy')}</span>
                <div class="desc">${inc.description}</div>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  const incidentsList = store.data.healthIncidents.filter((inc: any) => 
    filteredPlayers.some((p: any) => p.id === inc.playerId)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-destructive/5 border-b border-destructive/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-destructive" /> Injury Hub Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">1. Select Student Athlete</label>
              <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                <SelectTrigger className="rounded-2xl border-2 h-14 font-black bg-white">
                  <SelectValue placeholder="Identify student..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlayers.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">2. Body Part (Quick Selection)</label>
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.label)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all border-2",
                      selectedBodyPart === part.label 
                        ? "bg-destructive text-white border-destructive shadow-lg scale-105" 
                        : "bg-white text-foreground/70 border-muted-foreground/10 hover:border-destructive/30"
                    )}
                  >
                    {part.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">3. Diagnosis Type</label>
              <Select onValueChange={handleTypeChange} value={selectedType}>
                <SelectTrigger className="rounded-2xl border-2 h-12 bg-accent/5 font-bold">
                  <SelectValue placeholder="What happened?" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentTypeData && (
              <div className="bg-accent/10 p-4 rounded-xl border border-accent/20 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase">Institutional Protocol</span>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed font-medium italic">
                  {currentTypeData.treatment}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">4. Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border-2 h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">5. Severity</label>
                <Select onValueChange={setSeverity} value={severity}>
                  <SelectTrigger className={cn("rounded-2xl border-2 h-12 font-black", severity === "Critical" ? "text-destructive border-destructive/30" : "text-primary border-primary/10")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor (कमी)</SelectItem>
                    <SelectItem value="Moderate">Moderate (मध्यम)</SelectItem>
                    <SelectItem value="Critical">Critical (गंभीर)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">6. Treatment Log</label>
              <Textarea 
                placeholder="Details of the incident and actions taken..." 
                className="rounded-2xl border-2 min-h-[120px] text-sm font-medium"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              className={cn(
                "w-full rounded-2xl font-black py-8 text-lg uppercase tracking-[0.2em] transition-all shadow-xl active-scale",
                severity === "Critical" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-primary hover:bg-primary/90 text-white"
              )} 
              onClick={handleSave}
            >
              {severity === "Critical" ? <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" /> : <ShieldAlert className="w-6 h-6 mr-3" />}
              Archive Injury Record
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/5">
              <History className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary uppercase tracking-tight">Health History</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registry Sync • {section.toUpperCase()} SECTION</p>
            </div>
          </div>
          <Button variant="outline" onClick={handlePrint} className="rounded-2xl font-black border-2 h-14 px-8 shadow-sm text-xs uppercase tracking-widest">
            <Printer className="w-5 h-5 mr-3 text-primary" /> Full Medical Audit
          </Button>
        </div>
        
        <div className="space-y-4">
          {incidentsList.length === 0 ? (
            <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[3rem] bg-white/50 backdrop-blur-sm">
              <Stethoscope className="w-20 h-20 mb-6 opacity-10" />
              <p className="text-2xl font-black uppercase tracking-widest opacity-30">No health logs recorded</p>
            </Card>
          ) : (
            incidentsList.slice().reverse().map((inc: any) => {
              const isCritical = inc.description.includes('[CRITICAL]');
              return (
                <Card 
                  key={inc.id} 
                  className={cn(
                    "border-2 transition-all rounded-[2rem] shadow-sm bg-white overflow-hidden group",
                    isCritical ? "border-destructive/30 shadow-destructive/5" : "border-primary/10 hover:border-primary/30"
                  )}
                >
                  <CardContent className="p-0">
                    <div className={cn("h-2 w-full", isCritical ? "bg-destructive" : "bg-primary/20")} />
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 duration-500",
                            isCritical ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                          )}>
                            {inc.playerName[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-primary uppercase text-xl leading-tight">{inc.playerName}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className="font-black text-[9px] uppercase px-3 bg-muted text-muted-foreground">
                                {format(new Date(inc.date), 'dd MMM yyyy')}
                              </Badge>
                              {isCritical && (
                                <Badge className="bg-destructive text-white text-[9px] font-black uppercase px-4 py-0.5 animate-pulse">
                                  CRITICAL ALERT
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center opacity-40">
                          <Info className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="relative pl-8 py-2">
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-full", isCritical ? "bg-destructive" : "bg-accent")} />
                        <p className="text-base font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
                          "{inc.description.replace('[CRITICAL] ', '').replace('[MINOR] ', '')}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
