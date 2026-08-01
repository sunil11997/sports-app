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
  AlertCircle,
  Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { cn, parseMedicalLog } from '@/lib/utils';

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

export function HealthIncidents({ store, section, language = 'English', preselectedSport }: { store: any, section: 'sports' | 'general', language?: string, preselectedSport?: string }) {
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
  const isMarathi = language === 'Marathi';
  
  const filteredPlayers = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => isGeneral ? true : (p.category === 'athlete' && (!preselectedSport || p.sports?.includes(preselectedSport))))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, isGeneral, preselectedSport]
  );

  const filteredIncidents = useMemo(() => {
    return (store.data.healthIncidents || []).filter((h: any) => {
      const p = (store.data.players || []).find((pl: any) => pl.id === h.playerId);
      if (!isGeneral && h.category !== 'athlete') return false;
      if (preselectedSport && p && (!p.sports || !p.sports.includes(preselectedSport))) return false;
      return true;
    });
  }, [store.data.healthIncidents, store.data.players, isGeneral, preselectedSport]);

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
    const isM = isMarathi;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? 'आरोग्य नोंदणी आणि वैद्यकीय ऑडिट लॉग' 
      : 'HEALTH REGISTRY & MEDICAL AUDIT LOG';

    const incidentsToPrint = store.data.healthIncidents.filter((inc: any) => 
      filteredPlayers.some((p: any) => p.id === inc.playerId)
    );

    const printContent = `
      <html>
        <head>
          <title>Institutional Injury Registry - Waghamba Hub</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap');
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.5; background: #fff; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 4px solid #f59e0b; text-align: center; margin-bottom: 5px; font-size: 20px; font-weight: 900; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 20px; color: #b45309; font-size: 14px; }
            .meta { font-weight: 700; text-transform: uppercase; font-size: 11px; margin-bottom: 20px; opacity: 0.8; text-align: center; background: #f1f5f9; padding: 8px; border-radius: 6px; }
            .audit-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            .audit-table th { background: #1e3a8a; color: white; text-transform: uppercase; font-weight: 800; font-size: 10px; }
            .audit-table tr:nth-child(even) { background: #f8fafc; }
            .critical-tag { color: #dc2626; font-weight: 900; }
            .minor-tag { color: #2563eb; font-weight: 900; }
            .footer { margin-top: 50px; font-size: 10px; opacity: 0.6; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'GO BACK'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? 'प्रिंट करा' : 'CONFIRM PRINT'}</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">${reportTitle}</div>
          <div class="meta">Institutional Medical Registry Audit • Instructor: Sunil Deshmukh • Total Records: ${incidentsToPrint.length}</div>
          
          <table class="audit-table">
            <thead>
              <tr>
                <th>अनु.क्र.</th>
                <th>विद्यार्थ्यांचे नाव (Athlete)</th>
                <th>दिनांक</th>
                <th>ठिकाण (Body Part)</th>
                <th>दुखापत / निदान</th>
                <th>तीव्रता</th>
                <th>प्रथमोपचार व औषधोपचार</th>
                <th>परत येण्याची तारीख</th>
              </tr>
            </thead>
            <tbody>
              ${incidentsToPrint.slice().reverse().map((inc: any, index: number) => {
                const p = store.data.players.find((pl: any) => pl.id === inc.playerId);
                const displayName = isM ? (p?.nameMarathi || inc.playerName) : inc.playerName;
                const parsed = parseMedicalLog(inc.description);
                const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${index + 1}</td>
                    <td><strong>${displayName}</strong> ${p?.std ? `(Std ${p.std})` : ''}</td>
                    <td>${inc.date}</td>
                    <td>${parsed.location}</td>
                    <td>${parsed.diagnosis}</td>
                    <td><span class="${isCrit ? 'critical-tag' : 'minor-tag'}">${parsed.severity}</span></td>
                    <td>${parsed.medicine || parsed.protocol}</td>
                    <td><strong>${parsed.expectedReturn}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">Confidential Medical Audit Registry Document • Ashram Shala Waghamba</div>
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
                      <SelectContent>{filteredPlayers.map((p: any) => (<SelectItem key={p.id} value={p.id}>{isMarathi ? (p.nameMarathi || p.name) : p.name} (Std {p.std})</SelectItem>))}</SelectContent>
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
            {filteredIncidents.length === 0 ? (
              <Card className="border-dashed border-4 p-24 text-center text-muted-foreground rounded-[3.5rem] opacity-30 bg-white/50">
                <HeartPulse className="w-20 h-20 mx-auto mb-6" />
                <p className="font-black uppercase tracking-widest text-sm">No Health Logs Archived</p>
              </Card>
            ) : (
              [...filteredIncidents].slice().reverse().map((inc: any) => {
                const player = store.data.players.find((p: any) => p.id === inc.playerId);
                const displayName = isMarathi ? (player?.nameMarathi || inc.playerName) : inc.playerName;
                const parsed = parseMedicalLog(inc.description);
                const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');
                return (
                  <Card key={inc.id} className={cn("border-2 rounded-[2.5rem] shadow-sm bg-white overflow-hidden group transition-all hover:border-primary/30", isCrit ? "border-red-200 shadow-red-500/5" : "border-primary/10")}>
                    <div className="p-7">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-transform group-hover:scale-105", 
                            isCrit ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                          )}>
                            {displayName[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-primary uppercase text-base leading-tight group-hover:text-accent transition-colors">{displayName}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge className="font-black text-[9px] uppercase px-2.5 bg-slate-100 text-slate-700 border-0">{inc.date}</Badge>
                              <Badge className={cn("text-[9px] font-black uppercase px-2.5 border-0", isCrit ? "bg-red-600 text-white animate-pulse" : "bg-blue-600 text-white")}>
                                {parsed.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary font-black text-[9px] uppercase">
                          📍 {parsed.location}
                        </Badge>
                      </div>

                      {/* Structured Medical Summary Grid */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3 text-xs">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Injury / Diagnosis</span>
                          <span className="font-extrabold text-slate-900">{parsed.diagnosis}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Est. Return</span>
                          <span className="font-extrabold text-emerald-700">{parsed.expectedReturn} ({parsed.daysOff})</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {parsed.medicine && (
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-150">
                            <span className="text-[9px] font-black uppercase text-amber-800 block mb-0.5">💊 First Aid / Suggested Medicine:</span>
                            <p className="font-semibold text-amber-950 leading-relaxed">{parsed.medicine}</p>
                          </div>
                        )}
                        {parsed.protocol && (
                          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-150">
                            <span className="text-[9px] font-black uppercase text-blue-800 block mb-0.5">📋 Activity & Rest Protocol:</span>
                            <p className="font-semibold text-blue-950 leading-relaxed">{parsed.protocol}</p>
                          </div>
                        )}
                        {parsed.remarks && (
                          <p className="text-[11px] text-slate-600 italic px-1 pt-1">
                            &quot;{parsed.remarks}&quot;
                          </p>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-dashed flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => {
                               setSelectedPlayer(inc.playerId);
                               if (parsed.diagnosis) setSelectedType(parsed.diagnosis);
                               if (parsed.location) setSelectedBodyPart(parsed.location.toLowerCase());
                               if (parsed.severity) setSeverity(parsed.severity);
                               if (parsed.remarks) setDescription(parsed.remarks);
                               toast({ title: "संपादन मोड", description: `${displayName} ची वैद्यकीय नोंद एडिट करण्यासाठी लोड केली.`, className: "bg-blue-600 text-white font-bold" });
                             }} 
                             className="h-8 px-3 text-[10px] font-black border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                           >
                             <Pencil className="w-3 h-3 mr-1" /> एडिट
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => store.deleteHealthIncident(inc.id)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10">
                              <AlertCircle className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
