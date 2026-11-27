"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Save,
  Loader2,
  ClipboardList,
  Settings2,
  Search,
  MessageSquare,
  FileSpreadsheet,
  Upload,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  cn,
  shareToWhatsApp,
  calculateBMI,
  transliterateEnglishToMarathi,
  getOfficialSchoolName,
  getPrintSignatureBlockHtml,
} from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { isPlayerArchived } from '@/lib/student-audit-utils';

const DEFAULT_LABELS = {
  nirikshan: 'OBS',
  tondikam: 'ORAL',
  pratyashike: 'PRAC',
  upkram: 'ACT',
  prakalp: 'PROJ',
  chachani: 'TEST',
  swadhyay: 'SWAD',
};

const STD10_PHYSICAL_LABELS = {
  nirikshan: '50M RUN',
  tondikam: '600M RUN',
  pratyashike: 'LONG JUMP',
  upkram: 'SHOT PUT',
  prakalp: 'YOGA / PT',
  chachani: 'PRACTICAL',
  swadhyay: 'ORAL / VIVA',
};

const ASSESSMENT_FIELDS = [
  'nirikshan',
  'tondikam',
  'pratyashike',
  'upkram',
  'prakalp',
  'chachani',
  'swadhyay',
] as const;

type AssessmentField = (typeof ASSESSMENT_FIELDS)[number];

export function StandardRegistry({
  store,
  std,
  language = 'English',
}: {
  store: any;
  std: string;
  language?: string;
}) {
  const { toast } = useToast();
  const isStd10 = std === '10';
  const maxMarks = isStd10 ? 100 : 70;

  const [activeTerm, setActiveTerm] = useState<'First' | 'Second'>('First');
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [editingLabels, setEditingLabels] = useState(
    isStd10 ? STD10_PHYSICAL_LABELS : DEFAULT_LABELS
  );
  const [isMarathiView, setIsMarathiView] = useState(language === 'Marathi');
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setIsMarathiView(language === 'Marathi');
  }, [language]);

  const playersInStd = useMemo(() => {
    return (store.data.players || [])
      .filter((p: any) => p.std === std && !isPlayerArchived(p))
      .filter((p: any) => {
        const query = searchTerm.toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(query) ||
          (p.nameMarathi || '').includes(searchTerm) ||
          (p.generalRegisterNumber || '').includes(searchTerm)
        );
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber, 10) || 0) - (parseInt(b.serialNumber, 10) || 0);
      });
  }, [store.data.players, std, searchTerm]);

  const [termRecords, setTermRecords] = useState<Record<string, any>>({});

  const currentLabels = useMemo(() => {
    const configId = `${std}_${activeTerm}`;
    const baseDefaults = isStd10 ? STD10_PHYSICAL_LABELS : DEFAULT_LABELS;
    return store.data.examConfigs[configId] || baseDefaults;
  }, [store.data.examConfigs, std, activeTerm, isStd10]);

  useEffect(() => {
    if (!store.isLoaded) return;
    const newRecords: Record<string, any> = {};
    playersInStd.forEach((p: any) => {
      const historyList = store.data.fitnessHistory[p.id] || [];
      const history = historyList.find((h: any) => h.term === activeTerm);

      newRecords[p.id] = history || {
        nirikshan: '',
        tondikam: '',
        pratyashike: '',
        upkram: '',
        prakalp: '',
        chachani: '',
        swadhyay: '',
        height: p.height || '',
        weight: p.weight || '',
      };
    });
    setTermRecords(newRecords);
  }, [activeTerm, playersInStd, store.data.fitnessHistory, store.isLoaded]);

  const handleChange = (id: string, field: string, value: string) => {
    setTermRecords((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const calculateTotal = (id: string, recordOverride?: Record<string, any>) => {
    const r = recordOverride || termRecords[id] || {};
    return ASSESSMENT_FIELDS.reduce((acc, f) => acc + (parseFloat(r[f]) || 0), 0);
  };

  const getGrade = (total: number) => {
    if (isStd10) {
      if (total >= 91) return 'A1 (अ-1)';
      if (total >= 81) return 'A2 (अ-2)';
      if (total >= 71) return 'B1 (ब-1)';
      if (total >= 61) return 'B2 (ब-2)';
      if (total >= 51) return 'C1 (क-1)';
      if (total >= 41) return 'C2 (क-2)';
      if (total >= 35) return 'D (ड)';
      return 'E (ई)';
    }
    if (total >= 63) return 'अ-1';
    if (total >= 56) return 'अ-2';
    if (total >= 49) return 'ब-1';
    if (total >= 42) return 'ब-2';
    return 'क-1';
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
      status: grade,
      updatedAt: new Date().toISOString(),
    });
    setIsSaving(null);
    toast({ title: 'Record Saved', description: `Archived result for ${player.name} (${total}/${maxMarks} • ${grade}).` });
  };

  const handleSaveAll = () => {
    if (playersInStd.length === 0) return;
    setIsSavingAll(true);
    playersInStd.forEach((p: any) => {
      const total = calculateTotal(p.id);
      const grade = getGrade(total);
      store.setFitness(p.id, {
        ...(termRecords[p.id] || {}),
        term: activeTerm,
        score: total.toString(),
        status: grade,
        updatedAt: new Date().toISOString(),
      });
    });
    setIsSavingAll(false);
    toast({
      title: 'All Marks Saved',
      description: `Saved ${activeTerm} Term marks for ${playersInStd.length} students in Std ${std}.`,
      className: 'bg-emerald-600 text-white font-bold',
    });
  };

  const handleExportExcel = () => {
    const rows = playersInStd.map((p: any, idx: number) => {
      const r = termRecords[p.id] || {};
      const total = calculateTotal(p.id);
      const grade = getGrade(total);
      return {
        'Roll No': p.serialNumber || String(idx + 1),
        'G.R. No.': p.generalRegisterNumber || '',
        'Student Name': p.name || '',
        'Marathi Name': p.nameMarathi || '',
        'Gender': p.gender || '',
        'Ht (cm)': r.height || p.height || '',
        'Wt (kg)': r.weight || p.weight || '',
        [currentLabels.nirikshan]: r.nirikshan || '',
        [currentLabels.tondikam]: r.tondikam || '',
        [currentLabels.pratyashike]: r.pratyashike || '',
        [currentLabels.upkram]: r.upkram || '',
        [currentLabels.prakalp]: r.prakalp || '',
        [currentLabels.chachani]: r.chachani || '',
        [currentLabels.swadhyay]: r.swadhyay || '',
        'Total': total,
        'Max Marks': maxMarks,
        'Grade': grade,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Std_${std}_${activeTerm}`);

    const fileName = isStd10
      ? `Std_10_Physical_Exam_100Marks_${activeTerm}_Term.xlsx`
      : `Std_${std}_${activeTerm}_Exam_Marks.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: 'Excel Exam Sheet Downloaded',
      description: `Exported ${rows.length} students. You can edit marks in Excel and re-import.`,
    });
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      let updatedCount = 0;
      const nextRecords = { ...termRecords };

      rawRows.forEach((raw) => {
        const lowerMap: Record<string, unknown> = {};
        Object.entries(raw).forEach(([k, v]) => {
          lowerMap[k.trim().toLowerCase()] = v;
        });

        const gr = String(lowerMap['g.r. no.'] || lowerMap['gr no'] || '').trim();
        const roll = String(lowerMap['roll no'] || lowerMap['snr'] || '').trim();
        const sName = String(lowerMap['student name'] || lowerMap['name'] || '').trim().toLowerCase();
        const mName = String(lowerMap['marathi name'] || '').trim();

        const student = playersInStd.find((p: any) => {
          if (gr && p.generalRegisterNumber && p.generalRegisterNumber.trim() === gr) return true;
          if (sName && (p.name || '').trim().toLowerCase() === sName) return true;
          if (mName && (p.nameMarathi || '').trim() === mName) return true;
          if (roll && p.serialNumber && p.serialNumber.trim() === roll) return true;
          return false;
        });

        if (!student) return;

        const pickVal = (keys: string[], fallback: string) => {
          for (const k of keys) {
            const v = lowerMap[k.trim().toLowerCase()];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              return String(v).trim();
            }
          }
          return fallback;
        };

        const existing = nextRecords[student.id] || {};
        const updatedEntry: Record<string, any> = {
          ...existing,
          height: pickVal(['ht (cm)', 'height', 'ht'], existing.height || ''),
          weight: pickVal(['wt (kg)', 'weight', 'wt'], existing.weight || ''),
        };

        ASSESSMENT_FIELDS.forEach((field) => {
          const customLabel = currentLabels[field] || field;
          updatedEntry[field] = pickVal([customLabel, field], existing[field] || '');
        });

        nextRecords[student.id] = updatedEntry;

        const total = calculateTotal(student.id, updatedEntry);
        const grade = getGrade(total);
        store.setFitness(student.id, {
          ...updatedEntry,
          term: activeTerm,
          score: total.toString(),
          status: grade,
          updatedAt: new Date().toISOString(),
        });
        updatedCount++;
      });

      setTermRecords(nextRecords);
      toast({
        title: 'Excel Marks Imported',
        description: `Updated & auto-graded ${updatedCount} student(s) in Std ${std}.`,
        className: 'bg-emerald-600 text-white font-bold',
      });
    } catch (err) {
      console.error('Exam Excel import error:', err);
      toast({
        title: 'Import Failed',
        description: 'Could not read the Excel/CSV file. Please export the sheet first and edit it.',
        variant: 'destructive',
      });
    }
  };

  const handleWhatsAppShare = (player: any) => {
    const total = calculateTotal(player.id);
    const grade = getGrade(total);
    const profile = store.data.schoolProfile;

    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: profile.schoolName,
      teacherName: profile.teacherName,
      studentName: isMarathiView
        ? player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name
        : player.name,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || '---',
      height: player.height || '---',
      weight: player.weight || '---',
      reportType: isStd10
        ? `इयत्ता १० वी शारीरिक शिक्षण परीक्षा (${activeTerm === 'First' ? 'प्रथम' : 'द्वितीय'} सत्र)`
        : `परीक्षा निकाल (${activeTerm === 'First' ? 'प्रथम' : 'द्वितीय'} सत्र)`,
      reportData: `एकूण गुण: ${total}/${maxMarks}\nश्रेणी (Grade): ${grade}`,
    });
  };

  const handleSaveLabels = () => {
    store.setExamLabels(std, activeTerm, editingLabels);
    setIsLabelDialogOpen(false);
    toast({
      title: '7 Tabs Updated',
      description: `Assessment columns updated for Standard ${std} (${activeTerm} Term).`,
    });
  };

  const handlePrintTerm = () => {
    const isM = isMarathiView;
    const termLabel =
      activeTerm === 'First'
        ? isM
          ? 'प्रथम सत्र'
          : 'First Term'
        : isM
          ? 'द्वितीय सत्र'
          : 'Second Term';
    const labels = currentLabels;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, isM);
    const reportTitle = isStd10
      ? isM
        ? `इयत्ता १० वी शारीरिक शिक्षण परीक्षा गुणपत्रक (१०० गुण) | ${termLabel}`
        : `Std 10 Physical Exam Test Sheet (100 Marks) | ${termLabel}`
      : isM
        ? `परीक्षा आणि आरोग्य नोंदणी - इयत्ता ${std} वी | ${termLabel}`
        : `Exam & Health Registry - Std: ${std} | Term: ${termLabel}`;
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, isM);

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
            .header { text-align: center; border-bottom: 4px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
            .report-title { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 10px; text-decoration: underline; }
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
            <div class="report-title">${reportTitle}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SNR</th>
                <th>STUDENT NAME</th>
                <th>GEN</th>
                <th>HT</th>
                <th>WT</th>
                <th>BMI</th>
                <th>${labels.nirikshan}</th>
                <th>${labels.tondikam}</th>
                <th>${labels.pratyashike}</th>
                <th>${labels.upkram}</th>
                <th>${labels.prakalp}</th>
                <th>${labels.chachani}</th>
                <th>${labels.swadhyay}</th>
                <th>TOT (/${maxMarks})</th>
                <th>GRD</th>
              </tr>
            </thead>
            <tbody>
              ${playersInStd
                .map((p: any, i: number) => {
                  const total = calculateTotal(p.id);
                  const r = termRecords[p.id] || {};
                  const dName = isM
                    ? p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name
                    : p.name;
                  const heightVal = r.height || p.height || '-';
                  const weightVal = r.weight || p.weight || '-';
                  const bmiVal = calculateBMI(
                    heightVal !== '-' ? heightVal : null,
                    weightVal !== '-' ? weightVal : null,
                    p.bmi
                  );
                  return `
                    <tr>
                      <td>${p.serialNumber || i + 1}</td>
                      <td class="name-cell">${dName.toUpperCase()}</td>
                      <td>${p.gender[0]}</td>
                      <td>${heightVal}</td>
                      <td>${weightVal}</td>
                      <td><strong>${bmiVal}</strong></td>
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
                })
                .join('')}
            </tbody>
          </table>
          ${signatureBlockHtml}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  if (!isMounted || !store.isLoaded) return <TableSkeleton rows={10} cols={13} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-amber-100 p-4 rounded-[1.5rem] border-2 border-amber-200">
            <ClipboardList className="w-9 h-9 text-amber-700" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
                {isStd10 ? 'Std 10 Physical Exam Test' : `Std ${std} Exam Hub`}
              </h2>
              {isStd10 && (
                <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">
                  100 Marks • Auto-Grade
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 bg-primary/5">
                Max {maxMarks} Marks
              </Badge>
              <button
                onClick={() => {
                  setEditingLabels(currentLabels);
                  setIsLabelDialogOpen(true);
                }}
                className="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:underline bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10"
              >
                <Settings2 className="w-3 h-3" /> Edit 7 Tabs
              </button>
              <div className="flex bg-muted/40 p-1 rounded-xl border">
                <Button
                  variant={!isMarathiView ? 'default' : 'ghost'}
                  onClick={() => setIsMarathiView(false)}
                  className="h-6 px-3 text-[8px] font-black uppercase rounded-lg"
                >
                  EN
                </Button>
                <Button
                  variant={isMarathiView ? 'default' : 'ghost'}
                  onClick={() => setIsMarathiView(true)}
                  className="h-6 px-3 text-[8px] font-black uppercase rounded-lg"
                >
                  मराठी
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-56 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isMarathiView ? 'नाव किंवा GR ने शोधा...' : 'Find by Name/GR...'}
              className="pl-9 h-11 rounded-full bg-muted/30 border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border">
            <Button
              variant={activeTerm === 'First' ? 'default' : 'ghost'}
              onClick={() => setActiveTerm('First')}
              className="rounded-xl px-5 font-black uppercase text-xs shadow-none"
            >
              First Term
            </Button>
            <Button
              variant={activeTerm === 'Second' ? 'default' : 'ghost'}
              onClick={() => setActiveTerm('Second')}
              className="rounded-xl px-5 font-black uppercase text-xs shadow-none"
            >
              Second Term
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar: Excel Export/Import, Save All, Print */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="h-12 px-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black uppercase text-xs tracking-wider flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          Export Exam Excel (.xlsx)
        </Button>

        <Button
          onClick={() => excelInputRef.current?.click()}
          variant="outline"
          className="h-12 px-5 rounded-2xl border-2 border-blue-600/30 bg-blue-50 hover:bg-blue-100 text-blue-900 font-black uppercase text-xs tracking-wider flex items-center gap-2"
        >
          <Upload className="w-4 h-4 text-blue-700" />
          Import Edited Excel
        </Button>
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleImportExcel}
        />

        <Button
          onClick={handleSaveAll}
          disabled={isSavingAll || playersInStd.length === 0}
          className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider shadow-md"
        >
          {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save All ({playersInStd.length})
        </Button>

        <Button
          onClick={handlePrintTerm}
          className="h-12 flex-1 min-w-[180px] rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest shadow-md active-scale"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Term Sheet
        </Button>
      </div>

      <div className="overflow-x-auto scrollbar-hide border border-border rounded-3xl bg-white shadow-2xl">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-muted/80 sticky top-0 z-20">
            <TableRow>
              <TableHead className="border-r h-14 px-4 font-black text-[10px] uppercase w-[220px] sticky left-0 bg-muted/95 z-30">
                Student Name
              </TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">
                Ht (cm)
              </TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[70px]">
                Wt (kg)
              </TableHead>
              {ASSESSMENT_FIELDS.map((field) => (
                <TableHead
                  key={field}
                  onClick={() => {
                    setEditingLabels(currentLabels);
                    setIsLabelDialogOpen(true);
                  }}
                  title="Click to rename tab"
                  className="border-r h-14 px-2 font-black text-[9px] uppercase text-center w-[80px] text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {currentLabels[field]}
                </TableHead>
              ))}
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[75px] bg-primary/10">
                TOTAL /{maxMarks}
              </TableHead>
              <TableHead className="border-r h-14 px-2 font-black text-[10px] uppercase text-center w-[85px] bg-emerald-50 text-emerald-800">
                GRADE
              </TableHead>
              <TableHead className="h-14 px-2 font-black text-[10px] uppercase text-right w-[100px] sticky right-0 bg-muted/95 z-30">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersInStd.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-20 font-black uppercase opacity-20">
                  No matching entries found.
                </TableCell>
              </TableRow>
            ) : (
              playersInStd.map((p: any) => {
                const r = termRecords[p.id] || {};
                const total = calculateTotal(p.id);
                const grade = getGrade(total);
                const dName = isMarathiView
                  ? p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name
                  : p.name;
                return (
                  <TableRow key={p.id} className="border-b h-14 group">
                    <TableCell className="border-r p-2 text-xs font-black sticky left-0 bg-white z-10 truncate w-[220px]">
                      {dName.toUpperCase()}
                    </TableCell>
                    <TableCell className="border-r p-0">
                      <Input
                        type="number"
                        className="h-14 text-center border-0 bg-transparent focus:bg-white"
                        value={r.height || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleChange(p.id, 'height', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="border-r p-0">
                      <Input
                        type="number"
                        className="h-14 text-center border-0 bg-transparent focus:bg-white"
                        value={r.weight || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleChange(p.id, 'weight', e.target.value)
                        }
                      />
                    </TableCell>
                    {ASSESSMENT_FIELDS.map((field) => (
                      <TableCell key={field} className="border-r p-0">
                        <Input
                          type="number"
                          className="h-14 text-center border-0 bg-transparent focus:bg-white"
                          value={r[field] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange(p.id, field, e.target.value)
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="border-r p-0 text-center bg-primary/5 font-black text-primary">
                      {total}
                    </TableCell>
                    <TableCell className="border-r p-1 text-center bg-emerald-50/40">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-black text-[10px]',
                          isStd10 && total < 35
                            ? 'border-destructive/40 text-destructive bg-destructive/5'
                            : 'border-emerald-400 text-emerald-800 bg-emerald-50'
                        )}
                      >
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-0 sticky right-0 bg-white z-10 flex items-center justify-end h-14 px-2 gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleWhatsAppShare(p)}
                        disabled={!p.mobileNumber}
                        className="text-emerald-600 hover:bg-emerald-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary hover:text-white"
                        onClick={() => handleSave(p)}
                        disabled={isSaving === p.id}
                      >
                        {isSaving === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="bg-primary p-7 text-white relative">
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
              <Settings2 className="w-6 h-6 text-accent" /> Edit 7 Assessment Tabs
            </DialogTitle>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] relative z-10">
              Standard {std} &bull; {activeTerm} Term {isStd10 ? '• Physical Exam (100 Marks)' : ''}
            </p>
          </DialogHeader>

          <div className="p-6 sm:p-7 space-y-4">
            <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
              Customize the 7 editable test/assessment tab names for this standard. Excel exports will automatically use these names.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ASSESSMENT_FIELDS.map((field: AssessmentField, idx: number) => (
                <div key={field} className="space-y-1">
                  <Label className="text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                    Tab {idx + 1} ({field})
                  </Label>
                  <Input
                    value={editingLabels[field] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingLabels({ ...editingLabels, [field]: e.target.value.toUpperCase() })
                    }
                    className="h-11 font-black border-2 rounded-xl bg-muted/20 focus:bg-white shadow-inner"
                    maxLength={24}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t gap-3 flex-col sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setIsLabelDialogOpen(false)}
              className="flex-1 font-black uppercase text-[10px] h-12 rounded-2xl"
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveLabels}
              className="flex-1 bg-primary text-white h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale"
            >
              Save 7 Tabs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
