"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  History, 
  Printer, 
  AlertTriangle, 
  HeartPulse, 
  ShieldAlert, 
  CalendarDays,
  Activity,
  Stethoscope,
  Info,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const INCIDENT_TYPES = [
  { label: 'Sprain (मुरगळणे/लचकणे)', value: 'Sprain' },
  { label: 'Strain (स्नायू ताणले जाणे)', value: 'Strain' },
  { label: 'Contusion (मार बसून सूज येणे)', value: 'Contusion' },
  { label: 'Abrasion (घर्षणाने त्वचा सोलणे)', value: 'Abrasion' },
  { label: 'Fracture (हाड फ्रॅक्चर होणे)', value: 'Fracture' },
  { label: 'Head Impact (डोक्याला मार)', value: 'Head Impact' }
];

const BODY_REGIONS = [
  { id: 'head', label: 'Head (डोके)', x: '50%', y: '8%' },
  { id: 'shoulders', label: 'Shoulders (खांदे)', x: '50%', y: '18%' },
  { id: 'chest', label: 'Chest (छाती)', x: '50%', y: '28%' },
  { id: 'back', label: 'Back (पाठ)', x: '50%', y: '35%' },
  { id: 'hands_left', label: 'Left Hand/Finger (डावा हात/बोटे)', x: '12%', y: '45%' },
  { id: 'hands_right', label: 'Right Hand/Finger (उजवा हात/बोटे)', x: '88%', y: '45%' },
  { id: 'hamstrings', label: 'Hamstrings (मांडी)', x: '50%', y: '60%' },
  { id: 'knees', label: 'Knees (गुडघे)', x: '50%', y: '75%' },
  { id: 'ankles', label: 'Ankles (घोटा)', x: '50%', y: '90%' }
];

class InjuryRecoverySystem {
  static getProtocolAndMedicine(injuryType: string, bodyPart: string, severity: string) {
    let days = 0;
    let protocol = "";
    let medicine = "";
    const isCritical = severity.includes('Severe') || severity.includes('Critical');

    if (injuryType === 'Sprain' || injuryType === 'Strain') {
      days = isCritical ? 21 : 7;
      protocol = "Apply R.I.C.E (Rest, Ice, Compression, Elevation) for 48 hours. Avoid weight bearing.";
      medicine = "Apply Volini/Diclofenac Gel. Use Crepe Bandage for stability. Paracetamol (if prescribed) for pain.";
    } else if (injuryType === 'Abrasion') {
      days = 3;
      protocol = "Clean wound with antiseptic solution. Keep it dry and sterile.";
      medicine = "Apply Betadine/Soframycin Ointment. Clean with Savlon.";
    } else if (injuryType === 'Contusion') {
      days = 5;
      protocol = "Cold fermentation for first 24h, followed by warm fermentation.";
      medicine = "Thrombophob Gel to reduce swelling. Rest the muscle.";
    } else if (injuryType === 'Fracture') {
      days = 60;
      protocol = "IMMEDIATE EMERGENCY. Immobilize the limb. No movement.";
      medicine = "Refer to Civil Hospital Satana immediately. Calcium supplements post-plaster.";
    } else if (injuryType === 'Head Impact') {
      days = 14;
      protocol = "Concussion Protocol: Monitor for vomiting, dizziness, or blurred vision for 24h.";
      medicine = "Complete mental and physical rest. Zero screen time. Medical observation required.";
    } else {
      days = 5;
      protocol = "Standard rest and monitoring.";
      medicine = "Apply antiseptic if needed. Consult school doctor.";
    }

    const returnDate = addDays(new Date(), days);

    return {
      daysOff: days,
      protocol,
      medicine,
      expectedReturn: format(returnDate, 'dd MMM yyyy')
    };
  }
}

export function HealthIncidents({ store, section }: { store: any, section: 'sports' | 'general' }) {
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [severity, setSeverity] = useState("Minor");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const isGeneral = section === 'general';
  
  const filteredPlayers = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => isGeneral ? true : p.category === 'athlete')
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, isGeneral]
  );

  const recoveryInfo = useMemo(() => {
    if (!selectedType || !selectedBodyPart || !isMounted) return null;
    return InjuryRecoverySystem.getProtocolAndMedicine(selectedType, selectedBodyPart, severity);
  }, [selectedType, selectedBodyPart, severity, isMounted]);

  const handleSave = () => {
    if (!selectedPlayer || !selectedType || !selectedBodyPart) {
      toast({ title: "Incomplete Registry", description: "Please map the body part and select injury type.", variant: "destructive" });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayer);
    const info = recoveryInfo;
    
    const fullLog = `[INSTITUTIONAL MEDICAL AUDIT]
Location: ${selectedBodyPart}
Diagnosis: ${selectedType}
Severity: ${severity}
Recovery: ${info?.daysOff} Days
Est. Return: ${info?.expectedReturn}
PROTOCOL: ${info?.protocol}
MEDICINE/FIRST-AID: ${info?.medicine}
COACH REMARKS: ${description || 'Standard logging.'}`;
    
    const incident = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description: fullLog,
      severity: (severity.includes('Severe') || severity.includes('Critical')) ? 'Critical' : 'Minor',
      category: player?.category || 'student'
    } as const;

    store.addHealthIncident(incident);
    setDescription("");
    setSelectedType("");
    setSelectedPlayer("");
    setSelectedBodyPart(null);
    setSeverity("Minor");
    
    toast({ 
      title: "Medical Log Archived", 
      description: `Recovery protocol set for ${info?.expectedReturn}`,
      className: "bg-primary text-white"
    });
  };

  const handlePrint = () => {
    const incidentsToPrint = store.data.healthIncidents.filter((inc: any) => 
      filteredPlayers.some((p: any) => p.id === inc.playerId)
    );

    const printContent = `
      <html>
        <head>
          <title>Institutional Injury Registry - Waghamba Hub</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 4px solid #f59e0b; text-align: center; margin-bottom: 5px; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 30px; text-decoration: underline; }
            .meta { font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 30px; opacity: 0.7; }
            .incident { margin-bottom: 40px; border-bottom: 1px dashed #ccc; padding-bottom: 25px; }
            .critical { border-left: 6px solid #ef4444; padding-left: 20px; background: #fff5f5; }
            .name { font-weight: 900; font-size: 18px; color: #1e3a8a; text-transform: uppercase; }
            .date { color: #666; font-size: 10px; font-weight: 900; }
            .desc { margin-top: 15px; white-space: pre-wrap; font-size: 13px; font-weight: 500; }
            .footer { margin-top: 50px; font-size: 10px; opacity: 0.5; text-align: center; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक</h1>
          <div class="report-type">HEALTH REGISTRY & MEDICAL AUDIT LOG</div>
          <div class="meta">Registry v4.3.0 • Official Instructor: Sunil Deshmukh</div>
          ${incidentsToPrint.slice().reverse().map((inc: any) => `
            <div class="incident ${inc.severity === 'Critical' ? 'critical' : ''}">
              <div class="name">${inc.playerName}</div>
              <div class="date">Archived on: ${inc.date}</div>
              <div class="desc">${inc.description}</div>
            </div>
          `).join('')}
          <div class="footer">Confidential Institutional Document • Ashram Shala Waghamba</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-2 border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                 <Stethoscope className="w-8 h-8 text-white" />
               </div>
               <div>
                 <CardTitle className="text-3xl font-black uppercase tracking-tight leading-none">Injury Registry</CardTitle>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-2">Visual Mapping & Recovery IQ</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">१. खेळाडू निवडा (Athlete)</label>
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 bg-primary/5">Roster Sync</Badge>
                    </div>
                    <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-white shadow-sm"><SelectValue placeholder="Identify student..." /></SelectTrigger>
                      <SelectContent>{filteredPlayers.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">२. दुखापतीचे ठिकाण (Map Injury)</label>
                    <div className="relative bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-primary/10 aspect-[1/1.4] overflow-hidden group">
                       <div className="absolute inset-0 flex items-center justify-center p-8">
                          <svg viewBox="0 0 100 240" className="h-full w-auto opacity-40 group-hover:opacity-60 transition-opacity">
                             <path d="M50 10 C 60 10, 65 20, 65 35 C 65 50, 50 55, 50 55 C 50 55, 35 50, 35 35 C 35 20, 40 10, 50 10" fill="currentColor" />
                             <path d="M35 55 L 65 55 L 75 120 L 25 120 Z" fill="currentColor" />
                             <path d="M25 60 L 10 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                             <path d="M75 60 L 90 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                             <path d="M30 120 L 20 220" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                             <path d="M70 120 L 80 220" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                          </svg>
                       </div>
                       
                       {BODY_REGIONS.map((region) => (
                         <button
                           key={region.id}
                           onClick={() => setSelectedBodyPart(region.label)}
                           style={{ left: region.x, top: region.y }}
                           className={cn(
                             "absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 transition-all duration-300 shadow-lg flex items-center justify-center",
                             selectedBodyPart === region.label 
                               ? "bg-accent border-white scale-150 z-20" 
                               : "bg-primary border-primary/20 hover:scale-125"
                           )}
                         >
                           {selectedBodyPart === region.label && <CheckCircle2 className="w-4 h-4 text-white" />}
                         </button>
                       ))}

                       <div className="absolute bottom-6 inset-x-6">
                          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border shadow-xl flex items-center justify-between">
                             <div>
                                <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Selected Location</p>
                                <p className="font-black text-xs uppercase text-primary leading-none truncate max-w-[150px]">{selectedBodyPart || 'Tap Body Map'}</p>
                             </div>
                             <Activity className={cn("w-5 h-5 transition-colors", selectedBodyPart ? "text-accent animate-pulse" : "text-muted-foreground/30")} />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">३. प्रकार (Injury Type)</label>
                    <Select onValueChange={setSelectedType} value={selectedType}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-white shadow-sm"><SelectValue placeholder="Diagnosis" /></SelectTrigger>
                      <SelectContent>{INCIDENT_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">४. तीव्रता (Severity)</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Minor (कमी)', 'Severe (गंभीर)'].map((level) => (
                         <button
                           key={level}
                           type="button"
                           onClick={() => setSeverity(level)}
                           className={cn(
                             "h-12 rounded-xl font-black text-[9px] uppercase border-2 transition-all",
                             severity === level 
                               ? (level.includes('Severe') ? "bg-destructive text-white border-destructive shadow-lg" : "bg-primary text-white border-primary shadow-lg")
                               : "bg-white text-muted-foreground border-muted-foreground/10"
                           )}
                         >
                           {level}
                         </button>
                       ))}
                    </div>
                  </div>

                  {recoveryInfo && (
                    <div className="bg-accent/5 p-6 rounded-[2rem] border-2 border-dashed border-accent/20 space-y-6 animate-in zoom-in-95 duration-500 shadow-inner">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Thermometer className="w-5 h-5 text-accent" />
                           <h4 className="text-[10px] font-black uppercase text-accent tracking-widest">Medical Protocol</h4>
                         </div>
                         <Badge className="bg-accent text-white font-black text-[9px] uppercase px-3 shadow-sm">{recoveryInfo.daysOff} Days Off</Badge>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="p-4 bg-white rounded-xl border-l-4 border-accent shadow-sm">
                            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Suggested First Aid/Medicine</p>
                            <p className="text-[11px] font-bold text-foreground/80 leading-relaxed italic">{recoveryInfo.medicine}</p>
                         </div>
                         <div className="p-4 bg-white rounded-xl border-l-4 border-primary shadow-sm">
                            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Activity Protocol</p>
                            <p className="text-[11px] font-bold text-foreground/80 leading-relaxed italic">{recoveryInfo.protocol}</p>
                         </div>
                      </div>

                      <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-2 bg-white/50 p-2 rounded-lg justify-center">
                        <CalendarDays className="w-3.5 h-3.5" /> Return Date: {recoveryInfo.expectedReturn}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">५. कोचची निरीक्षणे (Remarks)</label>
                    <Textarea placeholder="How did it happen? (e.g. During raid dash...)" className="rounded-2xl border-2 min-h-[120px] text-sm font-medium p-4 focus:border-accent" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <Button 
                    className={cn(
                      "w-full rounded-3xl font-black h-20 text-xs uppercase tracking-[0.2em] shadow-2xl active-scale transition-all",
                      (severity.includes('Severe') || severity.includes('Critical')) ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-primary hover:bg-primary/90 text-white"
                    )} 
                    onClick={handleSave}
                  >
                    {(severity.includes('Severe') || severity.includes('Critical')) ? <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" /> : <ShieldAlert className="w-6 h-6 mr-3" />}
                    Archive Medical Log
                  </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-dashed border-primary/10 flex items-start gap-4 shadow-inner">
           <AlertCircle className="w-6 h-6 text-primary opacity-40 mt-1 shrink-0" />
           <div className="space-y-1">
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Medical Disclaimer</p>
              <p className="text-[9px] font-medium text-primary/40 leading-relaxed italic">
                These medicine suggestions are standard sports first-aid protocols. Always consult with a certified medical professional or the school doctor before administering any medication.
              </p>
           </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/5">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Injury Pulse</h3>
          </div>
          <Button variant="outline" onClick={handlePrint} className="rounded-2xl font-black border-2 h-12 px-6 text-[9px] uppercase tracking-widest hover:bg-primary/5">
            <Printer className="w-4 h-4 mr-2" /> Medical Audit
          </Button>
        </div>
        
        <ScrollArea className="flex-1 min-h-[600px]">
          <div className="space-y-4 pr-4">
            {store.data.healthIncidents.length === 0 ? (
              <Card className="border-dashed border-4 p-24 text-center text-muted-foreground rounded-[3.5rem] opacity-30 bg-white/50">
                <HeartPulse className="w-20 h-20 mx-auto mb-6" />
                <p className="font-black uppercase tracking-widest text-sm">No Health Logs Archived</p>
              </Card>
            ) : (
              [...store.data.healthIncidents].slice().reverse().map((inc: any) => (
                <Card key={inc.id} className={cn("border-2 rounded-[2.5rem] shadow-sm bg-white overflow-hidden group transition-all hover:border-primary/30", inc.severity === 'Critical' ? "border-destructive/20" : "border-primary/5")}>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner transition-transform group-hover:scale-110", 
                          inc.severity === 'Critical' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        )}>
                          {inc.playerName[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-primary uppercase text-lg leading-tight group-hover:text-accent transition-colors">{inc.playerName}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Badge className="font-black text-[8px] uppercase px-3 bg-muted text-muted-foreground border-0">{inc.date}</Badge>
                            {inc.severity === 'Critical' && <Badge className="bg-destructive text-white text-[8px] font-black uppercase px-3 shadow-sm animate-pulse border-0">CRITICAL</Badge>}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/10 text-primary/40 font-black text-[8px] uppercase">Registry Entry</Badge>
                    </div>
                    <div className="bg-muted/10 p-6 rounded-3xl border-2 border-transparent group-hover:border-primary/5 transition-all">
                       <p className="text-xs font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
                         &quot;{inc.description}&quot;
                       </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Protocol Synchronized</span>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => store.deleteHealthIncident(inc.id)} className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10">
                          <AlertCircle className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
