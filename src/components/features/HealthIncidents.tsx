
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
  ShieldAlert,
  CalendarDays,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const INCIDENT_TYPES = [
  { label: 'Sprain (मुरगळणे/लचकणे)', value: 'Sprain' },
  { label: 'Strain (स्नायू ताणले जाणे)', value: 'Strain' },
  { label: 'Contusion (मार बसून सूज येणे)', value: 'Contusion' },
  { label: 'Abrasion (घर्षणाने त्वचा सोलणे)', value: 'Abrasion' },
  { label: 'Fracture (हाड फ्रॅक्चर होणे)', value: 'Fracture' }
];

const BODY_PARTS = [
  { id: 'ankle', label: 'Ankle (घोटा)' },
  { id: 'knee', label: 'Knee (गुडघा)' },
  { id: 'shoulder', label: 'Shoulder (खांदा)' },
  { id: 'wrist', label: 'Wrist (मनगट)' },
  { id: 'back', label: 'Lower Back (कमर/पाठ)' },
  { id: 'hamstring', label: 'Hamstring (मांडीचे स्नायू)' }
];

/**
 * InjuryRecoverySystem
 * Institutional logic for calculating recovery timelines and protocols.
 */
class InjuryRecoverySystem {
  static calculateRecoveryTimeline(injuryType: string, severity: string) {
    let estimatedDaysOff = 0;
    let restrictionProtocol = "";

    if (severity.includes('Minor') || severity.includes('Mild')) {
      estimatedDaysOff = 3;
      restrictionProtocol = "हलका स्ट्रेचिंग सराव आणि बर्फाने शेक देणे (R.I.C.E. Protocol). मैदानावर धावणे बंद करा.";
    } else if (severity.includes('Moderate')) {
      estimatedDaysOff = 10;
      restrictionProtocol = "फिझिकल सराव पूर्ण बंद. फक्त व्हिडिओ ॲनालिसिस आणि रणनीती वर्गात (Tactical Sessions) सहभाग घ्यावा.";
    } else if (severity.includes('Critical') || severity.includes('Severe')) {
      estimatedDaysOff = 30;
      restrictionProtocol = "मैदानापासून पूर्ण दूर राहावे. डॉक्टरांच्या सल्ल्याशिवाय कोणताही व्यायाम करू नये.";
    }

    // Special case for Fractures
    if (injuryType.includes('Fracture')) {
      estimatedDaysOff = 45;
      restrictionProtocol = "प्लास्टर किंवा वैद्यकीय उपचार पूर्ण होईपर्यंत विश्रांती. रिहॅबिलिटेशन प्रोग्राम आवश्यक.";
    }

    const returnDate = addDays(new Date(), estimatedDaysOff);

    return {
      daysOff: estimatedDaysOff,
      protocol: restrictionProtocol,
      expectedReturnDate: format(returnDate, 'dd/MM/yyyy')
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

  const recoveryInfo = useMemo(() => {
    if (!selectedType || !severity) return null;
    return InjuryRecoverySystem.calculateRecoveryTimeline(selectedType, severity);
  }, [selectedType, severity]);

  const handleSave = () => {
    if (!selectedPlayer || !date || !selectedType || !selectedBodyPart) {
      toast({ title: "Error", description: "Please complete all mandatory fields.", variant: "destructive" });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayer);
    const timeline = recoveryInfo;
    
    // Construct rich description for archival
    const fullLog = `[DUKHAPAT LOG]
भाग: ${selectedBodyPart}
प्रकार: ${selectedType}
तीव्रता: ${severity}
रिकव्हरी कालावधी: ${timeline?.daysOff} दिवस
अपेक्षित परत येण्याची तारीख: ${timeline?.expectedReturnDate}
प्रोटोकॉल: ${timeline?.protocol}
नोंद: ${description || 'Standard logging.'}`;
    
    const incident = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description: fullLog,
      severity: severity === "Critical" ? 'Critical' : 'Minor',
      category: player?.category || 'student'
    };

    store.addHealthIncident(incident);
    setDescription("");
    setSelectedType("");
    setSelectedPlayer("");
    setSelectedBodyPart(null);
    setSeverity("Minor");
    
    toast({ 
      title: severity === "Critical" ? "CRITICAL ALERT LOGGED" : "Injury Registry Updated", 
      description: `Recovery set for ${timeline?.expectedReturnDate}`,
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
            body { font-family: Inter, sans-serif; padding: 40px; color: #111; }
            h1 { color: #8A1515; border-bottom: 2px solid #ddd; text-transform: uppercase; margin-bottom: 5px; }
            .header-info { font-weight: 800; text-transform: uppercase; font-size: 12px; margin-bottom: 30px; opacity: 0.7; }
            .incident { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .critical { border-left: 5px solid #ef4444; padding-left: 20px; }
            .date { color: #666; font-size: 11px; font-weight: 900; text-transform: uppercase; }
            .name { font-weight: 900; font-size: 20px; color: #1e3a8a; text-transform: uppercase; }
            .desc { margin-top: 12px; color: #333; line-height: 1.6; white-space: pre-wrap; font-size: 14px; font-weight: 500; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; background: #f1f5f9; }
            .badge-critical { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>WAGHAMBA INSTITUTIONAL HEALTH REGISTRY</h1>
          <div class="header-info">Official Injury & Recovery Audit • Teacher Sunil Deshmukh</div>
          ${incidentsToPrint.slice().reverse().map((inc: any) => {
            const isCritical = inc.severity === 'Critical';
            return `
              <div class="incident ${isCritical ? 'critical' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="name">${inc.playerName}</span>
                  <span class="badge ${isCritical ? 'badge-critical' : ''}">${isCritical ? 'CRITICAL ALERT' : 'ACTIVE LOG'}</span>
                </div>
                <span class="date">Recorded: ${format(new Date(inc.date), 'dd MMMM yyyy')}</span>
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
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-destructive/5 border-b border-destructive/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-destructive" /> दुखापत नोंदणी (Log)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 flex items-center gap-2"><Plus className="w-3 h-3" /> १. खेळाडू निवडा</label>
              <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                <SelectTrigger className="rounded-2xl border-2 h-14 font-black bg-white shadow-sm"><SelectValue placeholder="Identify student..." /></SelectTrigger>
                <SelectContent>{filteredPlayers.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">२. दुखापत कोठे झाली?</label>
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.label)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all border-2",
                      selectedBodyPart === part.label 
                        ? "bg-destructive text-white border-destructive shadow-lg scale-105" 
                        : "bg-white text-foreground/70 border-muted-foreground/10 hover:border-destructive/30"
                    )}
                  >{part.label}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">३. प्रकार</label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="rounded-2xl border-2 h-12 bg-white font-black uppercase text-[10px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>{INCIDENT_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">४. तीव्रता</label>
                <Select onValueChange={setSeverity} value={severity}>
                  <SelectTrigger className={cn("rounded-2xl border-2 h-12 font-black uppercase text-[10px]", severity === "Critical" ? "text-destructive" : "text-primary")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor (कमी)</SelectItem>
                    <SelectItem value="Moderate">Moderate (मध्यम)</SelectItem>
                    <SelectItem value="Critical">Critical (गंभीर)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {recoveryInfo && (
              <div className="bg-accent/5 p-6 rounded-[2rem] border-2 border-dashed border-accent/20 space-y-4 animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">रिकव्हरी अंदाज (Estimate)</span>
                  </div>
                  <Badge className="bg-accent text-white font-black text-[9px] uppercase px-3">{recoveryInfo.daysOff} दिवस</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground/80 leading-relaxed italic border-l-2 border-accent/30 pl-3">"{recoveryInfo.protocol}"</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> परत येण्याची तारीख: {recoveryInfo.expectedReturnDate}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">५. अतिरिक्त टिप्पणी (Optional)</label>
              <Textarea placeholder="More details..." className="rounded-2xl border-2 min-h-[100px] text-sm font-medium" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <Button 
              className={cn(
                "w-full rounded-2xl font-black h-16 text-xs uppercase tracking-[0.2em] transition-all shadow-xl active-scale",
                severity === "Critical" ? "bg-destructive text-white" : "bg-primary text-white"
              )} 
              onClick={handleSave}
            >
              {severity === "Critical" ? <AlertTriangle className="w-5 h-5 mr-3 animate-pulse" /> : <ShieldAlert className="w-5 h-5 mr-3" />}
              Archive Injury Record
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/5 shadow-inner">
              <History className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary uppercase tracking-tight">आरोग्य हिस्ट्री (Health History)</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registry Sync • ${section.toUpperCase()} HUB</p>
            </div>
          </div>
          <Button variant="outline" onClick={handlePrint} className="rounded-2xl font-black border-2 h-14 px-8 shadow-sm text-[10px] uppercase tracking-widest border-primary/10 text-primary">
            <Printer className="w-5 h-5 mr-3" /> Full Medical Audit
          </Button>
        </div>
        
        <div className="space-y-4">
          {incidentsList.length === 0 ? (
            <Card className="border-dashed border-4 p-24 flex flex-col items-center text-muted-foreground rounded-[3rem] bg-white/50 backdrop-blur-sm opacity-30">
              <HeartPulse className="w-20 h-20 mb-6" />
              <p className="text-xl font-black uppercase tracking-widest">No active health logs</p>
            </Card>
          ) : (
            incidentsList.slice().reverse().map((inc: any) => {
              const isCritical = inc.severity === 'Critical';
              return (
                <Card key={inc.id} className={cn("border-2 transition-all rounded-[2rem] shadow-sm bg-white overflow-hidden group", isCritical ? "border-destructive/30 shadow-destructive/5" : "border-primary/10 hover:border-primary/30")}>
                  <CardContent className="p-0">
                    <div className={cn("h-2 w-full", isCritical ? "bg-destructive" : "bg-primary/20")} />
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 duration-500", isCritical ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                            {inc.playerName[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-primary uppercase text-xl leading-tight group-hover:text-accent transition-colors">{inc.playerName}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className="font-black text-[9px] uppercase px-3 bg-muted text-muted-foreground">{format(new Date(inc.date), 'dd MMM yyyy')}</Badge>
                              {isCritical && <Badge className="bg-destructive text-white text-[8px] font-black uppercase px-4 py-1 animate-pulse">CRITICAL ALERT</Badge>}
                            </div>
                          </div>
                        </div>
                        <Info className="w-5 h-5 text-muted-foreground opacity-20" />
                      </div>
                      <div className="relative pl-8 py-2">
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-full", isCritical ? "bg-destructive" : "bg-accent")} />
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap italic">"{inc.description}"</p>
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
