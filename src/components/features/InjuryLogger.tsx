"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Stethoscope, 
  Save, 
  Loader2, 
  Users,
  CircleHelp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const BODY_PARTS = [
  { id: 'ankle', label: 'Ankle (घोटा)' },
  { id: 'knee', label: 'Knee (गुडघा)' },
  { id: 'shoulder', label: 'Shoulder (खांदा)' },
  { id: 'wrist', label: 'Wrist (मनगट)' },
  { id: 'back', label: 'Lower Back (कमर/पाठ)' },
  { id: 'hamstring', label: 'Hamstring (मांडीचे स्नायू)' }
];

const INJURY_TYPES = [
  'Sprain (मुरगळणे/लचकणे)',
  'Strain (स्नायू ताणले जाणे)',
  'Contusion (मार बसून सूज येणे)',
  'Abrasion (घर्षणाने त्वचा सोलणे)',
  'Fracture (हाड फ्रॅक्चर होणे)'
];

export function InjuryLogger({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedInjuryType, setSelectedInjuryType] = useState<string | null>(null);
  const [severity, setSeverity] = useState('Mild (कमी)');
  const [isSaving, setIsSaving] = useState(false);

  const players = useMemo(() => 
    store.data.players.filter((p: any) => p.category === 'athlete')
      .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    [store.data.players]
  );

  const handleSave = async () => {
    if (!selectedPlayerId || !selectedBodyPart || !selectedInjuryType) return;
    
    setIsSaving(true);
    try {
      const player = players.find((p: any) => p.id === selectedPlayerId);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const incident = {
        id: Math.random().toString(36).substr(2, 9),
        playerId: selectedPlayerId,
        playerName: player?.name || "Unknown",
        date: today,
        description: `[INJURY LOG] भाग: ${selectedBodyPart}, प्रकार: ${selectedInjuryType}, तीव्रता: ${severity}`,
        severity: severity.includes('Severe') ? 'Critical' : 'Minor',
        category: 'athlete'
      };

      await store.addHealthIncident(incident);
      
      toast({ 
        title: "यशस्वी", 
        description: `${selectedBodyPart} वरील ${selectedInjuryType} ची नोंद जतन झाली!`,
        className: "bg-emerald-600 text-white" 
      });

      // Reset Form
      setSelectedBodyPart(null);
      setSelectedInjuryType(null);
      setSeverity('Mild (कमी)');
    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-destructive/5 p-8 rounded-[3rem] border-2 border-destructive/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-destructive/10">
            <Stethoscope className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">नवीन दुखापत नोंदवा (Injury Log)</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">WGB Health Registry</p>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 flex items-center gap-2">
            <Users className="w-3 h-3" /> खेळाडू निवडा
          </label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-white text-lg"><SelectValue placeholder="खेळाडू निवडा..." /></SelectTrigger>
            <SelectContent>{players.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} (Std {p.std})</SelectItem>))}</SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-primary uppercase ml-1">१. शरीराचा कोणता भाग दुखावला आहे?</label>
          <div className="flex flex-wrap gap-2">
            {BODY_PARTS.map((part) => (
              <button
                key={part.id}
                onClick={() => setSelectedBodyPart(part.label)}
                className={cn(
                  "px-6 py-3 rounded-full text-xs font-black uppercase transition-all border-2",
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

        <div className="space-y-4">
          <label className="text-sm font-black text-primary uppercase ml-1">२. दुखापतीचा प्रकार निवडा:</label>
          <Select value={selectedInjuryType || ""} onValueChange={setSelectedInjuryType}>
            <SelectTrigger className="h-14 rounded-xl border-2 font-bold bg-muted/20">
              <SelectValue placeholder="प्रकार निवडा" />
            </SelectTrigger>
            <SelectContent>
              {INJURY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-primary uppercase ml-1">३. दुखापतीची तीव्रता (Severity):</label>
          <RadioGroup value={severity} onValueChange={setSeverity} className="flex flex-wrap justify-between bg-muted/20 p-6 rounded-2xl border-2 border-dashed">
            {['Mild (कमी)', 'Moderate (मध्यम)', 'Severe (गंभीर)'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`severity-${level}`} className="text-destructive border-destructive" />
                <Label htmlFor={`severity-${level}`} className="text-xs font-black uppercase text-foreground/70 cursor-pointer">{level}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!selectedPlayerId || !selectedBodyPart || !selectedInjuryType || isSaving} 
          className="w-full h-16 bg-destructive text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl active-scale hover:bg-destructive/90"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} दुखापत जतन करा (Save Injury)
        </Button>
      </Card>

      <div className="flex items-center justify-center gap-4 p-6 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
        <AlertCircle className="w-5 h-5 text-primary opacity-40" />
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">नोंदवलेला डेटा 'आरोग्य हिस्ट्री' मध्ये आपोआप जतन केला जाईल.</p>
      </div>
    </div>
  );
}