"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, Save, Loader2, ClipboardList } from 'lucide-react';
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
        if (a.gender !== b.gender) return a.gender === 'Female' ? -1 : 1;
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

  const handlePrintTerm = () => {
    const termLabel = activeTerm === 'First' ? 'First Term' : 'Second Term';
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
            .header { text-align: center; border-bottom: 3px double #235C36; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #235C36; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: 900; }
            .name-cell { text-align: left; font-weight: 900; min-width: 180px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #235C36; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            .btn-print { background: #F59E0B; color: white; }
          </style>
        </head>
        <body style="padding-top: 80px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">← GO BACK</button>
            <button onclick="window.print()" class="btn btn-print">CONFIRM PRINT</button>
          </div>
          <div class="header">
            <div class="school-name">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
            <div style="font-weight: 800; margin-top: 5px;">Exam & Health Registry - Std: ${std} | Term: ${termLabel}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>STUDENT NAME</th>
                <th>GEN</th>
                <th>HT</th>
                <th>WT</th>
                <th>OBS</th>
                <th>ORAL</th>
                <th>PRAC</th>
                <th>ACT</th>
                <th>PROJ</th>
                <th>TEST</th>
                <th>TOT</th>
                <th>GRD</th>
              </tr>
            </thead>
            <tbody>
              ${playersInStd.map((p: any, i: number) => {
                const total = calculateTotal(p.id);
                const r = termRecords[p.id] || {};
                return `
                  <tr>
                    <td>${p.serialNumber || i+1}</td>
                    <td class="name-cell">${p.name.toUpperCase()}</td>
                    <td>${p.gender[0]}</td>
                    <td>${r.height || '-'}</td>
                    <td>${r.weight || '-'}</td>
                    <td>${r.nirikshan || '-'}</td>
                    <td>${r.tondikam || '-'}</td>
                    <td>${r.pratyashike || '-'}</td>
                    <td>${r.upkram || '-'}</td>
                    <td>${r.prakalp || '-'}</td>
                    <td>${r.chachani || '-'}</td>
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
  };

  if (!store.isLoaded) return <TableSkeleton rows={10} cols={11} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-amber-100 p-4 rounded-[1.5rem] border-2 border-amber-200">
            <ClipboardList className="w-10 h-10 text-amber-700" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Std {std} Exam Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Term Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl border">
          <Button variant={activeTerm === 'First' ? "default" : "ghost"} onClick={() => setActiveTerm('First')} className="rounded-xl px-6 font-black uppercase text-xs">First Term</Button>
          <Button variant={activeTerm === 'Second' ? "default" : "ghost"} onClick={() => setActiveTerm('Second')} className="rounded-xl px-6 font-black uppercase text-xs">Second Term</Button>
        </div>
      </div>

      <Button onClick={handlePrintTerm} className="h-16 w-full rounded-2xl bg-white border-2 border-primary/10 text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest shadow-md">
        <Printer className="w-5 h-5 mr-2" /> Print Term Sheet
      </Button>

      <div className="border border-border rounded-3xl overflow-hidden bg-white shadow-2xl overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-14 px-4 font-black text-[10px] uppercase w-[220px] sticky left-0 bg-muted/95 z-30">Student Name</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Ht (cm)</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">Wt (kg)</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">OBS</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">ORAL</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">PRAC</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">ACT</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">PROJ</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[50px]">TEST</TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[60px] bg-primary/10">TOTAL</TableHead>
              <TableHead className="h-14 px-2 font-black text-[10px] uppercase text-right w-[60px] sticky right-0 bg-muted/95 z-30">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersInStd.map((p: any) => {
              const r = termRecords[p.id] || {};
              const total = calculateTotal(p.id);
              return (
                <TableRow key={p.id} className="border-b h-14">
                  <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 truncate w-[220px]">
                    {p.name.toUpperCase()}
                  </TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.height || ''} onChange={(e) => handleChange(p.id, 'height', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.weight || ''} onChange={(e) => handleChange(p.id, 'weight', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.nirikshan || ''} onChange={(e) => handleChange(p.id, 'nirikshan', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.tondikam || ''} onChange={(e) => handleChange(p.id, 'tondikam', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.pratyashike || ''} onChange={(e) => handleChange(p.id, 'pratyashike', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.upkram || ''} onChange={(e) => handleChange(p.id, 'upkram', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.prakalp || ''} onChange={(e) => handleChange(p.id, 'prakalp', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0"><Input type="number" className="h-14 text-center border-0" value={r.chachani || ''} onChange={(e) => handleChange(p.id, 'chachani', e.target.value)} /></TableCell>
                  <TableCell className="border-r p-0 text-center bg-primary/5 font-black">{total}</TableCell>
                  <TableCell className="p-0 text-right sticky right-0 bg-white z-10">
                    <Button variant="ghost" className="h-14 w-full rounded-none" onClick={() => handleSave(p)} disabled={isSaving === p.id}>
                      {isSaving === p.id ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
