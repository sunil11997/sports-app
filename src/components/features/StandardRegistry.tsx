
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, Save, Loader2, ClipboardList, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const DEFAULT_LABELS = {
  nirikshan: 'OBS',
  tondikam: 'ORAL',
  pratyashike: 'PRAC',
  upkram: 'ACT',
  prakalp: 'PROJ',
  chachani: 'TEST',
  swadhyay: 'SWAD'
};

export function StandardRegistry({ store, std, language = 'English' }: { store: any, std: string, language?: string }) {
  const { toast } = useToast();
  const [activeTerm, setActiveTerm] = useState<'First' | 'Second'>('First');
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [editingLabels, setEditingLabels] = useState(DEFAULT_LABELS);
  const [isMarathiView, setIsMarathiView] = useState(language === 'Marathi');

  useEffect(() => {
    setIsMarathiView(language === 'Marathi');
  }, [language]);

  const playersInStd = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

  const [termRecords, setTermRecords] = useState<Record<string, any>>({});

  const currentLabels = useMemo(() => {
    const configId = `${std}_${activeTerm}`;
    return store.data.examConfigs[configId] || DEFAULT_LABELS;
  }, [store.data.examConfigs, std, activeTerm]);

  useEffect(() => {
    if (!store.isLoaded) return;
    const newRecords: Record<string, any> = {};
    playersInStd.forEach((p: any) => {
      const historyList = store.data.fitnessHistory[p.id] || [];
      const history = historyList.find((h: any) => h.term === activeTerm);
      
      newRecords[p.id] = history || {
        nirikshan: '', tondikam: '', pratyashike: '', 
        upkram: '', prakalp: '', chachani: '', swadhyay: '',
        height: p.height || '', weight: p.weight || ''
      };
    });
    setTermRecords(newRecords);
  }, [activeTerm, playersInStd, store.data.fitnessHistory, store.isLoaded]);

  const handleChange = (id: string, field: string, value: string) => {
    setTermRecords(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const calculateTotal = (id: string) => {
    const r = termRecords[id] || {};
    const fields = ['nirikshan', 'tondikam', 'pratyashike', 'upkram', 'prakalp', 'chachani', 'swadhyay'];
    return fields.reduce((acc, f) => acc + (parseFloat(r[f]) || 0), 0);
  };

  const getGrade = (total: number) => {
    if (total >= 63) return "अ-1"; 
    if (total >= 56) return "अ-2";
    if (total >= 49) return "ब-1";
    return "ब-2";
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    setIsSaving(id);
    const total = calculateTotal(id);
    const grade = getGrade(total);
    
    store.setFitness(id, {
      ...(termRecords[id] || {}),
      term: activeTerm,
      score: total.toString(),
      status: grade
    });
    setIsSaving(null);
    toast({ title: "Record Saved" });
  };

  const handleSaveLabels = () => {
    store.setExamLabels(std, activeTerm, editingLabels);
    setIsLabelDialogOpen(false);
    toast({ title: "Labels Customized", description: `Registry columns updated for Standard ${std}.` });
  };

  const handlePrintTerm = () => {
    const isM = isMarathiView;
    const termLabel = activeTerm === 'First' ? (isM ? 'प्रथम सत्र' : 'First Term') : (isM ? 'द्वितीय सत्र' : 'Second Term');
    const labels = currentLabels;
    const schoolName = isM 
      ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
      : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
    const reportTitle = isM 
      ? `परीक्षा आणि आरोग्य नोंदणी - इयत्ता ${std} वी | ${termLabel}` 
      : `Exam & Health Registry - Std: ${std} | Term: ${termLabel}`;

    const printContent = `
      <html>
        <head>
          <title>Institutional Exam Registry - Std ${std}</title>
          <style>
            @media print { 
              @page { size: landscape; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 20px; font-size: 10px; color: #111; }
            .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 15px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: 900; text-transform: uppercase; font-size: 8px; }
            .name-cell { text-align: left; font-weight: 900; min-width: 180px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'Go Back'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? 'प्रिंट करा' : 'Print Report'}</button>
          </div>
          <div class="header">
            <div class="school-name">${schoolName}</div>
            <div class="report-type">${reportTitle}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${isM ? 'अनु. क्र.' : 'SNR'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव' : 'STUDENT NAME'}</th>
                <th>${isM ? 'लिंग' : 'GEN'}</th>
                <th>${isM ? 'उंची' : 'HT'}</th>
                <th>${isM ? 'वजन' : 'WT'}</th>
                <th>${labels.nirikshan}</th>
                <th>${labels.tondikam}</th>
                <th>${labels.pratyashike}</th>
                <th>${labels.upkram}</th>
                <th>${labels.prakalp}</th>
                <th>${labels.chachani}</th>
                <th>${labels.swadhyay}</th>
                <th>${isM ? 'एकूण' : 'TOT'}</th>
                <th>${isM ? 'श्रेणी' : 'GRD'}</th>
              </tr>
            </thead>
            <tbody>
              ${playersInStd.map((p: any, i: number) => {
                const total = calculateTotal(p.id);
                const r = termRecords[p.id] || {};
                const dName = isM ? (p.nameMarathi || p.name) : p.name;
                return `
                  <tr>
                    <td>${p.serialNumber || i+1}</td>
                    <td class="name-cell">${dName.toUpperCase()}</td>
                    <td>${p.gender[0]}</td>
                    <td>${r.height || '-'}</td>
                    <td>${r.weight || '-'}</td>
                    <td>${r.nirikshan || '-'}</td>
                    <td>${r.tondikam || '-'}</td>
                    <td>${r.pratyashike || '-'}</td>
                    <td>${r.upkram || '-'}</td>
                    <td>${r.prakalp || '-'}</td>
                    <td>${r.chachani || '-'}</td>
                    <td>${r.swadhyay || '-'}</td>
                    <td><strong>${total}</strong></td>
                    <td><strong>${getGrade(total)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={13} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-amber-100 p-4 rounded-[1.5rem] border-2 border-amber-200">
            <ClipboardList className="w-10 h-10 text-amber-700" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Std {std} Exam Hub</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 bg-primary/5">Term Registry</Badge>
              <button 
                onClick={() => { setEditingLabels(currentLabels); setIsLabelDialogOpen(true); }}
                className="text-[9px] font-black text-accent uppercase flex items-center gap-1 hover:underline"
              >
                <Settings2 className="w-3 h-3" /> Customize Labels
              </button>
              <div className="flex bg-muted/40 p-1 rounded-xl border ml-4">
                <Button variant={!isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(false)} className="h-6 px-3 text-[8px] font-black uppercase rounded-lg">EN</Button>
                <Button variant={isMarathiView ? "default" : "ghost"} onClick={() => setIsMarathiView(true)} className="h-6 px-3 text-[8px] font-black uppercase rounded-lg">मराठी</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button variant={activeTerm === 'First' ? "default" : "ghost"} onClick={() => setActiveTerm('First')} className="rounded-xl px-6 font-black uppercase text-xs shadow-none">First Term</Button>
          <Button variant={activeTerm === 'Second' ? "default" : "ghost"} onClick={() => setActiveTerm('Second')} className="rounded-xl px-6 font-black uppercase text-xs shadow-none">Second Term</Button>
        </div>
      </div>

      <Button onClick={handlePrintTerm} className="h-16 w-full rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest shadow-xl active-scale">
        <Printer className="w-5 h-5 mr-2" /> Print Term Sheet
      </Button>

      <div className="border border-border rounded-3xl overflow-hidden bg-white shadow-2xl overflow-x-auto scrollbar-hide">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-14 px-4 font-black text-[10px] uppercase w-[220px] sticky left-0 bg-muted/95 z-30">Student Name</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Ht (cm)</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Wt (kg)</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.nirikshan}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.tondikam}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.pratyashike}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.upkram}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.prakalp}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.chachani}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[55px] text-blue-600">{currentLabels.swadhyay}</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[60px] bg-primary/10">TOTAL</TableHead>
              <TableHead className="h-14 px-2 font-black text-[10px] uppercase text-right w-[60px] sticky right-0 bg-muted/95 z-30">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersInStd.map((p: any) => {
              const r = termRecords[p.id] || {};
              const total = calculateTotal(p.id);
              const dName = isMarathiView ? (p.nameMarathi || p.name) : p.name;
              return (
                <TableRow key={p.id} className="border-b h-14 group">
                  <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 truncate w-[220px]">
                    {dName.toUpperCase()}
                  </TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.height || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'height', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.weight || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'weight', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.nirikshan || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'nirikshan', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.tondikam || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'tondikam', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.pratyashike || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'pratyashike', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.upkram || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'upkram', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.prakalp || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'prakalp', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.chachani || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'chachani', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0 bg-transparent focus:bg-white" value={r.swadhyay || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(p.id, 'swadhyay', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary">{total}</TableCell>
                  <TableCell className="p-0 text-right sticky right-0 bg-white z-10">
                    <Button variant="ghost" className="h-14 w-full rounded-none hover:bg-primary hover:text-white" onClick={() => handleSave(p)} disabled={isSaving === p.id}>
                      {isSaving === p.id ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-primary p-8 text-white relative">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
              <Settings2 className="w-6 h-6 text-accent" /> Customize Column Labels
            </DialogTitle>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] relative z-10">Standard {std} &bull; {activeTerm} Term</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          </DialogHeader>

          <div className="p-8 space-y-6">
            <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
              &quot;Rename assessment categories to match official class requirements. Changes will apply to all students in this standard.&quot;
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(DEFAULT_LABELS).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase text-primary ml-2 tracking-widest">{field}</Label>
                  <Input 
                    value={editingLabels[field as keyof typeof DEFAULT_LABELS]} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingLabels({...editingLabels, [field]: e.target.value.toUpperCase()})}
                    className="h-12 font-black border-2 rounded-xl bg-muted/20 focus:bg-white shadow-inner"
                    maxLength={10}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t gap-3 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setIsLabelDialogOpen(false)} className="flex-1 font-black uppercase text-[10px] h-14 rounded-2xl">Discard</Button>
            <Button onClick={handleSaveLabels} className="flex-1 bg-primary text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale">Archive Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
