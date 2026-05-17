
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, History, Printer, AlertTriangle, ShieldCheck, HeartPulse, Info } from 'lucide-react';
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

export function HealthIncidents({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [severity, setSeverity] = useState("Minor");

  useEffect(() => {
    // Set initial date on client only
    setDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const isGeneral = section === 'general';
  
  const filteredPlayers = useMemo(() => 
    store.data.players
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => {
        // 1. Sort by Standard
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;

        // 2. Sort by Gender (Female first)
        if (a.gender !== b.gender) {
          return a.gender === 'Female' ? -1 : 1;
        }

        // 3. Sort by Serial Number
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
      setDescription(`TYPE: ${typeData.label}\n\nSUGGESTED TREATMENT:\n${typeData.treatment}\n\nNOTES: `);
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
    const incident = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description: `[${severity.toUpperCase()}] ${description}`,
      severity,
      category: player?.category || 'student'
    };

    store.addHealthIncident(incident);
    setDescription("");
    setSelectedType("");
    setSelectedPlayer("");
    toast({ 
      title: severity === "Critical" ? "CRITICAL ALERT LOGGED" : "Incident Logged", 
      description: "Health record has been updated and synced to cloud.",
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
          <title>Health History Log - Waghamba School</title>
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
          <h1>Complete Medical & Injury Log - ${section === 'sports' ? 'Sports Hub' : 'Student Registry'}</h1>
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
    win?.print();
  };

  const incidentsList = store.data.healthIncidents.filter((inc: any) => 
    filteredPlayers.some((p: any) => p.id === inc.playerId)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Plus className="w-5 h-5" /> Smart Incident Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">1. Select Student</label>
              <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                <SelectTrigger className="rounded-xl border-2 h-12">
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlayers.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">2. Incident Type</label>
              <Select onValueChange={handleTypeChange} value={selectedType}>
                <SelectTrigger className="rounded-xl border-2 h-12 bg-accent/5">
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
                  <span className="text-[10px] font-black text-primary uppercase">Auto-Suggested Treatment</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium italic">
                  {currentTypeData.treatment}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">3. Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-2 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">4. Severity</label>
                <Select onValueChange={setSeverity} value={severity}>
                  <SelectTrigger className={cn("rounded-xl border-2 h-12 font-bold", severity === "Critical" ? "text-destructive border-destructive/30" : "text-primary border-primary/10")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">5. Detailed Log & Treatment</label>
              <Textarea 
                placeholder="Details of the incident and actions taken..." 
                className="rounded-xl border-2 min-h-[150px] text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              className={cn(
                "w-full rounded-2xl font-black py-7 text-lg uppercase tracking-widest transition-all shadow-lg active-scale",
                severity === "Critical" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-primary hover:bg-primary/90 text-white"
              )} 
              onClick={handleSave}
            >
              {severity === "Critical" ? <AlertTriangle className="w-6 h-6 mr-2 animate-pulse" /> : <HeartPulse className="w-6 h-6 mr-2" />}
              Save Record
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            <h3 className="text-3xl font-black text-primary uppercase tracking-tight">Health Registry ({section === 'sports' ? 'Sports' : 'General'})</h3>
          </div>
          <Button variant="outline" onClick={handlePrint} className="rounded-xl font-bold border-2 h-12 px-6 shadow-sm ios-spring">
            <Printer className="w-5 h-5 mr-2 text-primary" /> Print Full History
          </Button>
        </div>
        
        <div className="space-y-4">
          {incidentsList.length === 0 ? (
            <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[2.5rem] bg-white/50 backdrop-blur-sm">
              <Stethoscope className="w-16 h-16 mb-6 opacity-10" />
              <p className="text-xl font-bold uppercase tracking-widest opacity-30">No health logs found for this section</p>
            </Card>
          ) : (
            incidentsList.slice().reverse().map((inc: any) => {
              const isCritical = inc.description.includes('[CRITICAL]');
              return (
                <Card 
                  key={inc.id} 
                  className={cn(
                    "border-2 transition-all rounded-[1.5rem] shadow-sm bg-white overflow-hidden group",
                    isCritical ? "border-destructive/30 shadow-destructive/5" : "border-primary/10 hover:border-primary/30"
                  )}
                >
                  <CardContent className="p-0">
                    <div className={cn("h-1.5 w-full", isCritical ? "bg-destructive" : "bg-primary/20")} />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110 duration-300",
                            isCritical ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                          )}>
                            {inc.playerName[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-primary uppercase text-lg leading-tight">{inc.playerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                                {format(new Date(inc.date), 'dd MMM yyyy')}
                              </span>
                              {isCritical && (
                                <Badge className="bg-destructive text-white text-[8px] font-black uppercase px-2 py-0 animate-pulse">
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-destructive rounded-full">
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="relative pl-6 py-1">
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full", isCritical ? "bg-destructive" : "bg-accent")} />
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {inc.description.replace('[CRITICAL] ', '').replace('[MINOR] ', '')}
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
