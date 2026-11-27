"use client";

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import { generateId } from '@/lib/id-generator';
import {
  calculateBMI,
  getAgeValidation,
  transliterateEnglishToMarathi,
} from '@/lib/utils';
import { isPlayerArchived } from '@/lib/student-audit-utils';

interface StudentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  defaultStd?: string;
}

interface ParsedRow {
  serialNumber: string;
  generalRegisterNumber: string;
  saralId: string;
  apaarId: string;
  penNumber: string;
  name: string;
  nameMarathi: string;
  std: string;
  gender: 'Male' | 'Female';
  dob: string;
  parentMobile1: string;
  aadharNumber: string;
  height: string;
  weight: string;
}

const HEADER_ALIASES: Record<keyof ParsedRow, string[]> = {
  serialNumber: ['roll no', 'roll', 'sr', 'sr no', 'serial number', 'serialnumber', 'हजेरी क्र.', 'अनु. क्र.'],
  generalRegisterNumber: ['gr no', 'g.r. no.', 'gr', 'general register no', 'generalregisternumber', 'जनरल रजिस्टर नं.', 'जी.आर. नं.'],
  saralId: ['saral id', 'saral', 'saralid', 'सरल आयडी'],
  apaarId: ['apaar id', 'apaar', 'apaarid', 'अपार आयडी'],
  penNumber: ['pen', 'pen no', 'pen number', 'pennumber', 'पेन क्रमांक'],
  name: ['name', 'student name', 'name (english)', 'full name', 'english name'],
  nameMarathi: ['name marathi', 'name (marathi)', 'marathi name', 'namemarathi', 'विद्यार्थ्याचे नाव', 'मराठी नाव'],
  std: ['std', 'standard', 'class', 'इयत्ता'],
  gender: ['gender', 'sex', 'लिंग'],
  dob: ['dob', 'date of birth', 'birth date', 'जन्मतारीख'],
  parentMobile1: ['parent mobile', 'mobile', 'mobile no', 'phone', 'parentmobile1', 'mobilenumber', 'पालक मोबाईल'],
  aadharNumber: ['aadhaar', 'aadhar', 'aadhar number', 'aadhaar no', 'आधार क्र.'],
  height: ['height', 'height (cm)', 'उंची'],
  weight: ['weight', 'weight (kg)', 'वजन'],
};

function normalizeDateString(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'number') {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return s;
}

function normalizeGender(raw: unknown): 'Male' | 'Female' {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'f' || s === 'female' || s === 'girl' || s === 'मुलगी' || s === 'स्त्री') {
    return 'Female';
  }
  return 'Male';
}

function mapRawRow(raw: Record<string, unknown>, defaultStd?: string): ParsedRow | null {
  const lowerKeys: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    lowerKeys[k.trim().toLowerCase()] = v;
  }

  const pick = (field: keyof ParsedRow): string => {
    for (const alias of HEADER_ALIASES[field]) {
      const val = lowerKeys[alias];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return '';
  };

  const name = pick('name');
  const nameMarathi = pick('nameMarathi');
  if (!name && !nameMarathi) return null;

  const rawStd = pick('std') || defaultStd || '5';
  const stdClean = rawStd.replace(/[^0-9]/g, '') || rawStd;

  let dobRaw: unknown = '';
  for (const alias of HEADER_ALIASES.dob) {
    if (lowerKeys[alias] !== undefined && lowerKeys[alias] !== '') {
      dobRaw = lowerKeys[alias];
      break;
    }
  }

  return {
    serialNumber: pick('serialNumber'),
    generalRegisterNumber: pick('generalRegisterNumber'),
    saralId: pick('saralId'),
    apaarId: pick('apaarId'),
    penNumber: pick('penNumber'),
    name: name || nameMarathi,
    nameMarathi: nameMarathi || transliterateEnglishToMarathi(name) || name,
    std: stdClean,
    gender: normalizeGender(pick('gender')),
    dob: normalizeDateString(dobRaw),
    parentMobile1: pick('parentMobile1'),
    aadharNumber: pick('aadharNumber'),
    height: pick('height'),
    weight: pick('weight'),
  };
}

export function StudentExcelModal({
  isOpen,
  onClose,
  store,
  defaultStd,
}: StudentExcelModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const activeStudents: Player[] = (store?.data?.players || []).filter(
    (p: Player) => !isPlayerArchived(p) && (!defaultStd || p.std === defaultStd)
  );

  const handleExportExcel = (formatType: 'xlsx' | 'csv') => {
    const rows = activeStudents.map((p) => ({
      'Roll No': p.serialNumber || '',
      'Std': p.std || '',
      'G.R. No.': p.generalRegisterNumber || '',
      'Saral ID': p.saralId || '',
      'APAAR ID': p.apaarId || '',
      'PEN': p.penNumber || '',
      'Name (English)': p.name || '',
      'Name (Marathi)': p.nameMarathi || '',
      'Gender': p.gender || 'Male',
      'DOB': p.dob || '',
      'Parent Mobile': p.parentMobile1 || p.mobileNumber || '',
      'Aadhaar': p.aadharNumber || '',
      'Height (cm)': p.height || '',
      'Weight (kg)': p.weight || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, defaultStd ? `Std_${defaultStd}` : 'Students_Registry');

    const dateTag = new Date().toISOString().slice(0, 10);
    const baseName = defaultStd
      ? `Waghamba_Std_${defaultStd}_Registry_${dateTag}`
      : `Waghamba_All_Students_Saral_UDISE_${dateTag}`;

    if (formatType === 'csv') {
      XLSX.writeFile(wb, `${baseName}.csv`, { bookType: 'csv' });
    } else {
      XLSX.writeFile(wb, `${baseName}.xlsx`);
    }

    toast({
      title: 'Export Complete',
      description: `Exported ${rows.length} student records to ${formatType.toUpperCase()}.`,
    });
  };

  const handleDownloadTemplate = () => {
    const sample = [
      {
        'Roll No': '1',
        'Std': defaultStd || '8',
        'G.R. No.': '1425',
        'Saral ID': '2024272001165030001',
        'APAAR ID': '123456789012',
        'PEN': '21004567891',
        'Name (English)': 'Ramesh Suresh Pawar',
        'Name (Marathi)': 'रमेश सुरेश पवार',
        'Gender': 'Male',
        'DOB': '2012-06-15',
        'Parent Mobile': '9876543210',
        'Aadhaar': '',
        'Height (cm)': '148',
        'Weight (kg)': '40',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Saral_UDISE_Student_Import_Template.xlsx');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheet = wb.SheetNames[0];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[firstSheet], {
        defval: '',
      });
      const mapped = rawJson
        .map((r) => mapRawRow(r, defaultStd))
        .filter((r): r is ParsedRow => r !== null);

      setParsedRows(mapped);
      if (mapped.length === 0) {
        toast({
          title: 'No Valid Rows Found',
          description: 'Please check column headers (use the downloadable template).',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Excel parse error:', err);
      toast({
        title: 'Failed to Read File',
        description: 'Could not parse the selected Excel/CSV file.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    const existingPlayers: Player[] = store?.data?.players || [];
    let added = 0;
    let updated = 0;

    for (const row of parsedRows) {
      const match = existingPlayers.find(
        (p) =>
          (row.generalRegisterNumber &&
            p.generalRegisterNumber &&
            p.generalRegisterNumber.trim() === row.generalRegisterNumber) ||
          (row.saralId && p.saralId && p.saralId.trim() === row.saralId) ||
          (row.apaarId && p.apaarId && p.apaarId.trim() === row.apaarId) ||
          (p.std === row.std &&
            p.name.trim().toLowerCase() === row.name.trim().toLowerCase())
      );

      const ageVal = getAgeValidation(row.dob);
      const bmi = calculateBMI(row.height, row.weight, match?.bmi);

      if (match) {
        store.updatePlayer({
          ...match,
          serialNumber: row.serialNumber || match.serialNumber,
          generalRegisterNumber: row.generalRegisterNumber || match.generalRegisterNumber,
          saralId: row.saralId || match.saralId,
          apaarId: row.apaarId || match.apaarId,
          penNumber: row.penNumber || match.penNumber,
          name: row.name || match.name,
          nameMarathi: row.nameMarathi || match.nameMarathi,
          std: row.std || match.std,
          gender: row.gender || match.gender,
          dob: row.dob || match.dob,
          parentMobile1: row.parentMobile1 || match.parentMobile1,
          mobileNumber: row.parentMobile1 || match.mobileNumber,
          aadharNumber: row.aadharNumber || match.aadharNumber,
          height: row.height || match.height,
          weight: row.weight || match.weight,
          bmi,
          age: ageVal ? ageVal.ageYears : match.age,
          ageCategory: ageVal ? ageVal.category : match.ageCategory,
          ageDetailed: ageVal ? ageVal.ageString : match.ageDetailed,
        });
        updated++;
      } else {
        const newId = generateId(`std${row.std}`);
        store.addPlayer({
          id: newId,
          name: row.name,
          nameMarathi: row.nameMarathi,
          std: row.std,
          serialNumber: row.serialNumber,
          generalRegisterNumber: row.generalRegisterNumber,
          saralId: row.saralId,
          apaarId: row.apaarId,
          penNumber: row.penNumber,
          gender: row.gender,
          dob: row.dob,
          age: ageVal ? ageVal.ageYears : 0,
          ageCategory: ageVal ? ageVal.category : 'None',
          ageDetailed: ageVal ? ageVal.ageString : '',
          parentMobile1: row.parentMobile1,
          mobileNumber: row.parentMobile1,
          aadharNumber: row.aadharNumber,
          height: row.height,
          weight: row.weight,
          bmi,
          category: 'student',
          sports: [],
          history: 'No',
          status: 'active',
        });
        added++;
      }
    }

    setIsImporting(false);
    setParsedRows([]);
    setFileName('');
    toast({
      title: 'Excel/CSV Import Successful',
      description: `Added ${added} new students and updated ${updated} existing records.`,
      className: 'bg-emerald-600 text-white font-bold',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rounded-[2rem] border-2 p-6 sm:p-8 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Saral / UDISE+ Excel & CSV Import / Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Export & Template Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-sm text-emerald-950 uppercase">
                Export Registry ({activeStudents.length} Active Students)
              </h4>
              <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                Includes G.R. No., Saral ID, APAAR ID, PEN, Marathi/English Name, DOB & Parent Mobile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => handleExportExcel('xlsx')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 font-black text-xs uppercase"
              >
                <Download className="w-4 h-4 mr-1.5" /> Export .XLSX
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExportExcel('csv')}
                className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-xl h-10 px-4 font-black text-xs uppercase"
              >
                <FileDown className="w-4 h-4 mr-1.5" /> Export .CSV
              </Button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-slate-50/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-sm text-primary uppercase">
                  Import from Excel (.xlsx / .xls) or CSV
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Existing students are matched automatically by G.R. No., Saral ID, APAAR ID, or Name + Std.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="rounded-xl h-10 px-3 text-xs font-black uppercase"
                >
                  <FileDown className="w-4 h-4 mr-1.5" /> Sample Template
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary text-white rounded-xl h-10 px-4 text-xs font-black uppercase"
                >
                  <Upload className="w-4 h-4 mr-1.5" /> Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {fileName}</span>
                <Badge variant="secondary" className="font-black">
                  {parsedRows.length} rows ready
                </Badge>
              </div>
            )}

            {parsedRows.length > 0 && (
              <ScrollArea className="h-56 rounded-xl border bg-white">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase">Std</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">G.R.</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Name</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Saral / APAAR / PEN</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">DOB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 50).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-bold">Std {r.std}</TableCell>
                        <TableCell className="text-xs">{r.generalRegisterNumber || '---'}</TableCell>
                        <TableCell className="text-xs font-bold">
                          <div>{r.name}</div>
                          <div className="text-[10px] text-muted-foreground">{r.nameMarathi}</div>
                        </TableCell>
                        <TableCell className="text-[10px] font-mono">
                          {r.saralId || '-'} / {r.apaarId || '-'} / {r.penNumber || '-'}
                        </TableCell>
                        <TableCell className="text-xs">{r.dob || '---'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>

          {parsedRows.length > 50 && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Showing preview of first 50 rows. All {parsedRows.length} rows will be imported.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
            Close
          </Button>
          {parsedRows.length > 0 && (
            <Button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs px-6"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Import {parsedRows.length} Students
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
