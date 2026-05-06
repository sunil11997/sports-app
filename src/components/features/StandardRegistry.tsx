
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, Save, Loader2, ClipboardList, CalendarDays, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

export function StandardRegistry({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
  const [activeTerm, setActiveTerm] = useState<'First' | 'Second'>('First');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const playersInStd = useMemo(() => {
    return store.data.players
      .filter((p: any) => p.std === std)
      .sort((a: any, b: any) => {
        // 1. Sort by Gender (Female first)
        if (a.gender !== b.gender) {
          return a.gender === 'Female' ? -1 : 1;
        }
        // 2. Sort by Serial Number (Numeric)
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, std]);

  const [termRecords, setTermRecords] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!store.isLoaded) return;
    const newRecords: Record<string, any> = {};
    playersInStd.forEach((p: any) => {
      const history = (store.data.fitnessHistory[p.id] || [])
        .find((h: any) => h.term === activeTerm);
      
      if (history) {
        newRecords[p.id] = history;
      } else {
        newRecords[p.id] = {
          nirikshan: '', tondikam: '', pratyashike: '', 
          upkram: '', prakalp: '', chachani: '', swadhyay: '',
          height: '', weight: ''
        };
      }
    });
    setTermRecords(newRecords);
  }, [activeTerm, playersInStd, store.data.fitnessHistory, store.isLoaded]);

  const handleChange = (id: string, field: string, value: string) => {
    setTermRecords(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
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
    if (total >= 42) return "ब-2";
    if (total >= 35) return "क-1";
    if (total >= 28) return "क-2";
    if (total >= 21) return "ड";
    if (total >= 14) return "ई-1";
    return "ई-2";
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    setIsSaving(id);
    const total = calculateTotal(id);
    const grade = getGrade(total);
    
    const dataToSave = {
      ...(termRecords[id] || {}),
      term: activeTerm,
      score: total.toString(),
      status: grade,
      height: termRecords[id]?.height || player.height,
      weight: termRecords[id]?.weight || player.weight
    };

    store.setFitness(id, dataToSave);
    setIsSaving(null);
    toast({ 
      title: "रेकॉर्ड जतन केला", 
      description: `${player.name} ची ${activeTerm === 'First' ? 'पहिले' : 'दुसरे'} सत्राची माहिती अपडेट झाली.` 
    });
  };

  const handlePrintTerm = () => {
    const termLabel = activeTerm === 'First' ? 'पहिले सत्र (First Term)' : 'दुसरे सत्र (Second Term)';
    const printContent = `
      <html>
        <head>
          <title>विद्यार्थी परीक्षा नोंदणी - इयत्ता ${std}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; font-size: 10px; }
            h1 { text-align: center; color: #235C36; border-bottom: 2px solid #8AF075; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 4px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा - परीक्षा गुण नोंदणी</h1>
          <h2>इयत्ता: ${std} | ${termLabel}</h2>
          <table>
            <thead>
              <tr>
                <th>क्र.</th><th>Sr No</th><th>विद्यार्थ्याचे नाव</th><th>लिंग</th>
                <th>दैनंदिन निरीक्षण</th><th>तोंडीकाम</th><th>प्रात्यक्षिके</th><th>उपक्रम</th><th>प्रकल्प</th><th>चाचणी</th><th>स्वाध्याय</th>
                <th>एकूण</th><th>श्रेणी</th>
              </tr>
            </thead>
            <tbody>
              ${playersInStd.map((p: any, i: number) => {
                const total = calculateTotal(p.id);
                const r = termRecords[p.id] || {};
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${p.serialNumber || ''}</td>
                    <td>${p.name}</td>
                    <td>${p.gender === 'Female' ? 'महिला' : 'पुरुष'}</td>
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
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  if (!store.isLoaded) {
    return <TableSkeleton rows={10} cols={11} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-amber-100 p-4 rounded-[1.5rem] border-2 border-amber-200 shadow-inner">
            <ClipboardList className="w-10 h-10 text-amber-700" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">इयत्ता {std} - परीक्षा नोंदणी</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Institutional Exam Registry • Female group listed first</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button 
            variant={activeTerm === 'First' ? "default" : "ghost"}
            onClick={() => setActiveTerm('First')}
            className={cn(
              "rounded-xl px-6 font-black uppercase text-xs tracking-wider transition-all",
              activeTerm === 'First' ? "bg-primary text-white shadow-lg" : "text-muted-foreground"
            )}
          >
            <CalendarDays className="w-4 h-4 mr-2" /> प्रथम सत्र
          </Button>
          <Button 
            variant={activeTerm === 'Second' ? "default" : "ghost"}
            onClick={() => setActiveTerm('Second')}
            className={cn(
              "rounded-xl px-6 font-black uppercase text-xs tracking-wider transition-all",
              activeTerm === 'Second' ? "bg-primary text-white shadow-lg" : "text-muted-foreground"
            )}
          >
            <CalendarDays className="w-4 h-4 mr-2" /> द्वितीय सत्र
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Button onClick={handlePrintTerm} className="h-16 rounded-2xl bg-white border-2 border-primary/10 text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest shadow-md">
          <Printer className="w-5 h-5 mr-2" /> पत्रक प्रिंट करा
        </Button>
        <Button className="h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest shadow-xl">
          <FileText className="w-5 h-5 mr-2" /> वार्षिक निकाल प्रिंट करा
        </Button>
      </div>

      <div className="border border-border rounded-3xl overflow-hidden bg-white shadow-2xl overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-14 px-4 font-black text-[10px] uppercase w-[220px] sticky left-0 bg-muted/95 z-30">विद्यार्थ्याचे नाव</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">लिंग</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">निरीक्षण</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">तोंडीकाम</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">प्रयोग</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">उपक्रम</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">प्रकल्प</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">चाचणी</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[60px]">स्वाध्याय</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[80px] bg-primary/10">एकूण</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[60px] bg-primary/10">श्रेणी</TableHead>
              <TableHead className="h-14 px-2 font-black text-[10px] uppercase text-right w-[60px] sticky right-0 bg-muted/95 z-30">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersInStd.length === 0 ? (
              <TableRow><TableCell colSpan={16} className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest opacity-30">या वर्गात कोणतेही विद्यार्थी नाहीत</TableCell></TableRow>
            ) : (
              playersInStd.map((p: any) => {
                const r = termRecords[p.id] || {};
                const total = calculateTotal(p.id);
                return (
                  <TableRow key={p.id} className="border-b hover:bg-primary/5 h-14 transition-colors">
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 ios-blur">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-primary/40">#{p.serialNumber || '0'}</span>
                           <span className="uppercase text-primary">{p.name}</span>
                        </div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60 ml-6">{p.gender} • Term: {activeTerm}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-0 text-center text-[10px] font-bold">{p.gender === 'Female' ? 'महिला' : 'पुरुष'}</TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.nirikshan || ''} onChange={(e) => handleChange(p.id, 'nirikshan', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.tondikam || ''} onChange={(e) => handleChange(p.id, 'tondikam', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.pratyashike || ''} onChange={(e) => handleChange(p.id, 'pratyashike', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.upkram || ''} onChange={(e) => handleChange(p.id, 'upkram', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.prakalp || ''} onChange={(e) => handleChange(p.id, 'prakalp', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.chachani || ''} onChange={(e) => handleChange(p.id, 'chachani', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input type="number" placeholder="Marks" className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.swadhyay || ''} onChange={(e) => handleChange(p.id, 'swadhyay', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary text-sm">{total}</TableCell>
                    <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary text-xs">{getGrade(total)}</TableCell>
                    <TableCell className="p-0 text-right sticky right-0 bg-white z-10 ios-blur">
                      <Button variant="ghost" size="icon" className="h-14 w-full rounded-none text-primary" onClick={() => handleSave(p)} disabled={isSaving === p.id}>
                        {isSaving === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
