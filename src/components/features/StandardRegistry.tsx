
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, Save, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function StandardRegistry({ store, std }: { store: any, std: string }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record<string, any>>(store.data.fitness);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const playersInStd = store.data.players.filter((p: any) => p.std === std && p.category === 'student');

  const handleChange = (id: string, field: string, value: string) => {
    setRecords(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          nirikshan: '', tondikam: '', pratyashike: '', 
          upkram: '', prakalp: '', chachani: '', swadhyay: '',
          height: '', weight: ''
        }),
        [field]: value
      }
    }));
  };

  const calculateTotal = (id: string) => {
    const r = records[id] || {};
    const fields = ['nirikshan', 'tondikam', 'pratyashike', 'upkram', 'prakalp', 'chachani', 'swadhyay'];
    return fields.reduce((acc, f) => acc + (parseFloat(r[f]) || 0), 0);
  };

  const getGrade = (total: number) => {
    if (total >= 91) return "अ-1";
    if (total >= 81) return "अ-2";
    if (total >= 71) return "ब-1";
    if (total >= 61) return "ब-2";
    if (total >= 51) return "क-1";
    if (total >= 41) return "क-2";
    if (total >= 31) return "ड";
    if (total >= 21) return "ई-1";
    return "ई-2";
  };

  const handleSave = async (player: any) => {
    const id = player.id;
    setIsSaving(id);
    const total = calculateTotal(id);
    const grade = getGrade(total);
    
    const dataToSave = {
      ...(records[id] || {}),
      score: total.toString(),
      status: grade,
      height: records[id]?.height || player.height,
      weight: records[id]?.weight || player.weight
    };

    store.setFitness(id, dataToSave);
    setIsSaving(null);
    toast({ title: "रेकॉर्ड जतन केला", description: `${player.name} ची शैक्षणिक माहिती अपडेट झाली.` });
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>विद्यार्थी प्रगती पुस्तक - इयत्ता ${std}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; font-size: 10px; }
            h1 { text-align: center; color: #235C36; border-bottom: 2px solid #8AF075; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 4px; text-align: center; }
            th { background: #f2f2f2; font-weight: bold; font-size: 8px; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body>
          <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा - विद्यार्थी नोंदणी (इयत्ता ${std})</h1>
          <table>
            <thead>
              <tr>
                <th>क्र.</th><th>विद्यार्थ्याचे नाव</th><th>लिंग</th><th>वय</th><th>उंची</th><th>वजन</th><th>BMI</th>
                <th>दैनंदिन निरीक्षण</th><th>तोंडीकाम</th><th>प्रात्यक्षिके</th><th>उपक्रम</th><th>प्रकल्प</th><th>चाचणी</th><th>स्वाध्याय</th>
                <th>एकूण</th><th>श्रेणी</th>
              </tr>
            </thead>
            <tbody>
              ${playersInStd.map((p: any, i: number) => {
                const r = store.data.fitness[p.id] || {};
                const total = calculateTotal(p.id);
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td class="name-cell">${p.name}</td>
                    <td>${p.gender === 'Female' ? 'महिला' : 'पुरुष'}</td>
                    <td>${p.age}</td>
                    <td>${r.height || p.height}</td>
                    <td>${r.weight || p.weight}</td>
                    <td>${p.bmi}</td>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10">
        <div>
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8" /> इयत्ता {std} - विद्यार्थी नोंदणी
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Institutional Class Registry • Satana, Nashik</p>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-lg">
          <Printer className="w-5 h-5 mr-2" /> शीट प्रिंट करा
        </Button>
      </div>

      <div className="border border-border rounded-3xl overflow-hidden bg-white shadow-2xl overflow-x-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-12 px-4 font-black text-[10px] uppercase w-[200px] sticky left-0 bg-muted/95 z-30">विद्यार्थ्याचे नाव</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">लिंग</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[50px]">वय</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">उंची</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">वजन</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">BMI</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">निरीक्षण</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">तोंडीकाम</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">प्रयोग</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">उपक्रम</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">प्रकल्प</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">चाचणी</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[9px] uppercase text-center w-[60px]">स्वाध्याय</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[10px] uppercase text-center w-[80px] bg-primary/10">एकूण</TableHead>
              <TableHead className="border-r h-12 px-2 font-black text-[10px] uppercase text-center w-[60px] bg-primary/10">श्रेणी</TableHead>
              <TableHead className="h-12 px-2 font-black text-[10px] uppercase text-right w-[60px] sticky right-0 bg-muted/95 z-30">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersInStd.length === 0 ? (
              <TableRow><TableCell colSpan={16} className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest opacity-30">या वर्गात कोणतेही विद्यार्थी नाहीत</TableCell></TableRow>
            ) : (
              playersInStd.map((p: any) => {
                const r = records[p.id] || {};
                const total = calculateTotal(p.id);
                return (
                  <TableRow key={p.id} className="border-b hover:bg-primary/5 h-14">
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10">
                      <div className="flex flex-col">
                        <span className="uppercase text-primary">{p.name}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">{p.aadharNumber || 'No Aadhar'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r p-0 text-center text-[10px] font-bold">{p.gender === 'Female' ? 'महिला' : 'पुरुष'}</TableCell>
                    <TableCell className="border-r p-0 text-center text-[10px] font-bold">{p.age}</TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={r.height || p.height} onChange={(e) => handleChange(p.id, 'height', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[10px] font-bold border-0 bg-transparent focus:bg-white" value={r.weight || p.weight} onChange={(e) => handleChange(p.id, 'weight', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0 text-center text-[10px] font-bold opacity-40">{p.bmi}</TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.nirikshan || ''} onChange={(e) => handleChange(p.id, 'nirikshan', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.tondikam || ''} onChange={(e) => handleChange(p.id, 'tondikam', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.pratyashike || ''} onChange={(e) => handleChange(p.id, 'pratyashike', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.upkram || ''} onChange={(e) => handleChange(p.id, 'upkram', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.prakalp || ''} onChange={(e) => handleChange(p.id, 'prakalp', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.chachani || ''} onChange={(e) => handleChange(p.id, 'chachani', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0"><Input className="h-14 text-center text-[11px] font-bold border-0 bg-transparent focus:bg-white" value={r.swadhyay || ''} onChange={(e) => handleChange(p.id, 'swadhyay', e.target.value)} /></TableCell>
                    <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary text-sm">{total}</TableCell>
                    <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary text-xs">{getGrade(total)}</TableCell>
                    <TableCell className="p-0 text-right sticky right-0 bg-white z-10">
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
