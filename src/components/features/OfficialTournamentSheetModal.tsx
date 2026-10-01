"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Search, 
  UserPlus, 
  Settings2, 
  FileText, 
  Check, 
  Hash, 
  X,
  Sparkles
} from 'lucide-react';
import { transliterateEnglishToMarathi } from '@/lib/utils';
import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';

export interface SheetRow {
  id: string;
  srNo: string;
  studentName: string;
  std: string;
  grNo: string;
  dob: string;
  motherName: string;
  aadhar: string;
  saralId: string;
}

interface OfficialTournamentSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: string;
  initialCategory?: string;
  initialPlayers?: any[];
  store: any;
}

export const SPORT_MARATHI_MAP: Record<string, string> = {
  'Handball': 'हॅन्डबॉल',
  'Kabaddi': 'कबड्डी',
  'Kho Kho': 'खो खो',
  'Volleyball': 'व्हॉलीबॉल',
  'Athletics': 'ऍथलेटिक्स',
  'Running': 'धावणे (रनिंग)',
  'Shot Put': 'गोळाफेक',
  'Javelin Throw': 'भालाफेक',
  'Disc Throw': 'थाळीफेक',
  'Long Jump': 'लांब उडी',
  'High Jump': 'उंच उडी',
  'Yoga': 'योगासने',
  'PT Mass': 'पी.टी. कवायत',
  'All': 'सर्व खेळ'
};

export function getMarathiAgeGroup(category: string, gender?: string): string {
  const cat = (category || '').toLowerCase();
  const isFemale = cat.includes('girl') || cat.includes('मुली') || gender === 'Female';
  const suffix = isFemale ? 'मुली' : 'मुले';
  
  if (cat.includes('14') || cat.includes('u14')) {
    return `14 वर्षाखालील ${suffix}`;
  }
  if (cat.includes('17') || cat.includes('u17')) {
    return `17 वर्षाखालील ${suffix}`;
  }
  if (cat.includes('19') || cat.includes('u19') || cat.includes('senior')) {
    return `19 वर्षाखालील ${suffix}`;
  }
  return category ? `वयोगट ${category}` : `14 वर्षाखालील ${suffix}`;
}

export function formatStdMarathi(std: string | number | undefined): string {
  if (!std) return '-';
  const str = String(std).trim();
  if (str.startsWith('इ.') || str.includes('वी')) return str;
  return `इ. ${str} वी`;
}

export function formatDobDDMMYYYY(dob: string | undefined): string {
  if (!dob) return '';
  const trimmed = dob.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return trimmed;
}

export function formatAadharDisplay(aadhar: string | undefined): string {
  if (!aadhar) return '';
  const digits = aadhar.replace(/\D/g, '');
  if (digits.length === 12) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
  return aadhar.trim();
}

export function formatSaralIdDisplay(saral: string | undefined): string {
  if (!saral) return '';
  const clean = saral.trim();
  if (clean.length > 8 && !clean.includes(' ')) {
    return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  return clean;
}

export function OfficialTournamentSheetModal({
  isOpen,
  onClose,
  initialSport = 'Kabaddi',
  initialCategory = 'Girls U14',
  initialPlayers = [],
  store
}: OfficialTournamentSheetModalProps) {
  // Official Header Fields matching Maharashtra Tribal Development Department sports entry form
  const [departmentName, setDepartmentName] = useState<string>("आदिवासी विकास विभाग नाशिक");
  const [projectName, setProjectName] = useState<string>("एकात्मिक आदिवासी विकास प्रकल्प,कळवण ता.कळवण जि.नाशिक");
  const [schoolName, setSchoolName] = useState<string>("शासकीय माध्यमिक आश्रमशाळा वाघांबा ता.सटाणा जि.नाशिक");

  // Sport, Age Group, Academic Year
  const [selectedSportKey, setSelectedSportKey] = useState<string>(initialSport);
  const [sportName, setSportName] = useState<string>(SPORT_MARATHI_MAP[initialSport] || initialSport || 'हॅन्डबॉल');
  const [ageGroup, setAgeGroup] = useState<string>(getMarathiAgeGroup(initialCategory));
  const [academicYear, setAcademicYear] = useState<string>("2026-27");

  // Table rows
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Student Picker Dialog state
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // Find student in master databases to auto-complete missing fields
  const findMasterStudent = useCallback((p: any): SchoolStudent | undefined => {
    const rawName = (p.name || '').trim().toLowerCase();
    const marathiName = (p.nameMarathi || '').trim();
    const gr = (p.generalRegisterNumber || p.serialNumber || '').trim();
    const id = (p.id || '').trim();

    return WAGHAMBA_STUDENTS_DATA.find((s) => {
      if (id && s.id === id) return true;
      if (gr && (s.rollNo === gr || s.serialNumber === gr)) return true;
      if (marathiName && s.nameMarathi && s.nameMarathi.includes(marathiName)) return true;
      if (rawName && s.name && s.name.toLowerCase().includes(rawName)) return true;
      return false;
    });
  }, []);

  // Initialize or reload rows from initialPlayers
  const buildRowsFromPlayers = useCallback((playersList: any[]) => {
    const allStorePlayers: any[] = store?.data?.players || [];

    const built: SheetRow[] = playersList.map((p, index) => {
      // Find matching student in store or master dataset for missing information
      const storeMatch = allStorePlayers.find(sp => sp.id === p.id || sp.generalRegisterNumber === p.generalRegisterNumber);
      const masterMatch = findMasterStudent(p) || (storeMatch ? findMasterStudent(storeMatch) : undefined);

      // Student Name: prefer Marathi
      const name = p.nameMarathi?.trim() || 
                   storeMatch?.nameMarathi?.trim() || 
                   masterMatch?.nameMarathi?.trim() || 
                   transliterateEnglishToMarathi(p.name) || 
                   p.name || '';

      // Standard / Class
      const rawStd = p.std || storeMatch?.std || masterMatch?.std || '';
      const std = formatStdMarathi(rawStd);

      // G.R. Number
      const grNo = p.generalRegisterNumber || 
                   storeMatch?.generalRegisterNumber || 
                   masterMatch?.rollNo || 
                   p.serialNumber || 
                   '';

      // DOB
      const rawDob = p.dob || storeMatch?.dob || masterMatch?.dob || '';
      const dob = formatDobDDMMYYYY(rawDob);

      // Mother Name
      const motherName = p.motherName || 
                         storeMatch?.motherName || 
                         masterMatch?.motherName || 
                         '';

      // Aadhaar Card Number
      const rawAadhar = p.aadharNumber || 
                        storeMatch?.aadharNumber || 
                        masterMatch?.apaarId || 
                        '';
      const aadhar = formatAadharDisplay(rawAadhar);

      // Saral ID
      const rawSaral = p.saralId || 
                       storeMatch?.saralId || 
                       masterMatch?.saralId || 
                       p.apaarId || 
                       storeMatch?.apaarId || 
                       '';
      const saralId = formatSaralIdDisplay(rawSaral);

      return {
        id: p.id || `row-${index}-${Date.now()}`,
        srNo: String(index + 1),
        studentName: name,
        std,
        grNo: String(grNo),
        dob,
        motherName,
        aadhar,
        saralId
      };
    });

    return built;
  }, [findMasterStudent, store?.data?.players]);

  // Sync when props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSportKey(initialSport);
      setSportName(SPORT_MARATHI_MAP[initialSport] || initialSport || 'हॅन्डबॉल');
      setAgeGroup(getMarathiAgeGroup(initialCategory));
      
      const built = buildRowsFromPlayers(initialPlayers);
      setRows(built);
    }
  }, [isOpen, initialSport, initialCategory, initialPlayers, buildRowsFromPlayers]);

  // Row operations
  const updateRowField = (index: number, field: keyof SheetRow, value: string) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    setRows(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const autoRenumber = () => {
    setRows(prev => prev.map((row, i) => ({ ...row, srNo: String(i + 1) })));
  };

  const sortBySrNo = () => {
    setRows(prev => {
      const next = [...prev];
      next.sort((a, b) => {
        const numA = parseInt(a.srNo) || 0;
        const numB = parseInt(b.srNo) || 0;
        return numA - numB;
      });
      return next;
    });
  };

  const addBlankRow = () => {
    const nextSr = rows.length > 0 ? String(rows.length + 1) : "1";
    setRows(prev => [
      ...prev,
      {
        id: `custom-row-${Date.now()}`,
        srNo: nextSr,
        studentName: "",
        std: "इ. ८ वी",
        grNo: "",
        dob: "",
        motherName: "",
        aadhar: "",
        saralId: ""
      }
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const resetRows = () => {
    const built = buildRowsFromPlayers(initialPlayers);
    setRows(built);
  };

  // Add student from school registry picker
  const handleAddFromStudentPicker = (student: any) => {
    const rawDob = student.dob || '';
    const dob = formatDobDDMMYYYY(rawDob);
    const std = formatStdMarathi(student.std);
    const grNo = String(student.generalRegisterNumber || student.rollNo || student.serialNumber || '');
    const aadhar = formatAadharDisplay(student.aadharNumber || student.apaarId || '');
    const saralId = formatSaralIdDisplay(student.saralId || student.apaarId || '');
    const motherName = student.motherName || '';
    const studentName = student.nameMarathi?.trim() || transliterateEnglishToMarathi(student.name) || student.name || '';

    const newRow: SheetRow = {
      id: student.id || `picked-${Date.now()}`,
      srNo: String(rows.length + 1),
      studentName,
      std,
      grNo,
      dob,
      motherName,
      aadhar,
      saralId
    };

    setRows(prev => [...prev, newRow]);
    setIsPickerOpen(false);
  };

  // Generate and launch the Official Printable HTML matching uploaded PDF
  const handlePrintOfficialSheet = () => {
    const teacherName = store?.data?.schoolProfile?.teacherName || "क्रीडा शिक्षक";

    const tableRowsHtml = rows.map((r) => {
      return `
        <tr>
          <td class="text-center font-bold">${r.srNo || '-'}</td>
          <td class="font-bold text-left">${r.studentName || '-'}</td>
          <td class="text-center font-bold">${r.std || '-'}</td>
          <td class="text-center">${r.grNo || '-'}</td>
          <td class="text-center">${r.dob || '-'}</td>
          <td class="text-center">${r.motherName || '-'}</td>
          <td class="text-center">${r.aadhar || '-'}</td>
          <td class="text-center">${r.saralId || '-'}</td>
        </tr>
      `;
    }).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>${sportName} - ${ageGroup} (${academicYear}) - अधिकृत क्रीडा स्पर्धा शीट</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            
            @media print {
              @page {
                size: A4 landscape;
                margin: 0.6cm;
              }
              .no-print {
                display: none !important;
              }
              body {
                background: #ffffff !important;
                padding: 0 !important;
              }
              .official-outer-box {
                border: 2px solid #000000 !important;
                box-shadow: none !important;
              }
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
              color: #000000;
              background-color: #f8fafc;
              margin: 0;
              padding: 10px;
              font-size: 11pt;
              line-height: 1.25;
            }

            .print-toolbar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: #ffffff;
              padding: 10px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 99999;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .btn {
              cursor: pointer;
              padding: 8px 18px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 11pt;
              border: none;
              transition: all 0.2s;
            }

            .btn-close {
              background: #334155;
              color: white;
            }

            .btn-print {
              background: #f59e0b;
              color: #020617;
            }

            .page-container {
              max-width: 1050px;
              margin: 45px auto 20px auto;
            }

            /* The outer bordered table structure exactly as in official PDF */
            .official-outer-box {
              background: #ffffff;
              border: 2px solid #000000;
              width: 100%;
              border-collapse: collapse;
            }

            .official-outer-box td, 
            .official-outer-box th {
              border: 1px solid #000000;
              padding: 4px 6px;
              vertical-align: middle;
            }

            .header-line-1 {
              font-size: 14pt;
              font-weight: 900;
              text-align: center;
              padding: 6px 4px;
              background: #ffffff;
              letter-spacing: 0.3px;
            }

            .header-line-2 {
              font-size: 12.5pt;
              font-weight: 800;
              text-align: center;
              padding: 5px 4px;
              background: #ffffff;
            }

            .header-line-3 {
              font-size: 12pt;
              font-weight: 800;
              text-align: center;
              padding: 5px 4px;
              background: #ffffff;
            }

            .meta-bar-cell {
              font-size: 11pt;
              font-weight: 900;
              padding: 6px 8px;
            }

            .col-header {
              font-size: 10.5pt;
              font-weight: 900;
              text-align: center;
              background: #ffffff;
              padding: 6px 4px;
            }

            .text-center {
              text-align: center;
            }

            .text-left {
              text-align: left;
              padding-left: 8px !important;
            }

            .font-bold {
              font-weight: 700;
            }

            .footer-sign-section {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
              font-size: 10.5pt;
              font-weight: 800;
            }

            .sign-box {
              text-align: center;
              min-width: 220px;
            }
          </style>
        </head>
        <body>
          <div class="no-print print-toolbar">
            <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
            <div style="font-weight: 800; font-size: 12pt; color: #f8fafc;">
              ${sportName} &bull; ${ageGroup} (${academicYear})
            </div>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (Print or Save PDF)</button>
          </div>

          <div class="page-container">
            <table class="official-outer-box">
              <thead>
                <!-- ROW 1: DEPARTMENT NAME -->
                <tr>
                  <th colspan="8" class="header-line-1">
                    ${departmentName}
                  </th>
                </tr>

                <!-- ROW 2: PROJECT NAME -->
                <tr>
                  <th colspan="8" class="header-line-2">
                    ${projectName}
                  </th>
                </tr>

                <!-- ROW 3: SCHOOL NAME -->
                <tr>
                  <th colspan="8" class="header-line-3">
                    ${schoolName}
                  </th>
                </tr>

                <!-- ROW 4: SUBHEADER METADATA BAR (AGE GROUP, SPORT, YEAR) -->
                <tr>
                  <th colspan="3" class="meta-bar-cell text-left">
                    वयोगट :- ${ageGroup}
                  </th>
                  <th colspan="3" class="meta-bar-cell text-center">
                    खेळ प्रकार :- ${sportName}
                  </th>
                  <th colspan="2" class="meta-bar-cell text-center">
                    सन:- ${academicYear}
                  </th>
                </tr>

                <!-- ROW 5: COLUMN HEADERS -->
                <tr>
                  <th class="col-header" style="width: 5%;">अ.क्र.</th>
                  <th class="col-header" style="width: 25%;">विद्यार्थ्याचे नाव</th>
                  <th class="col-header" style="width: 8%;">इयत्ता</th>
                  <th class="col-header" style="width: 9%;">ज.रजि.नं.</th>
                  <th class="col-header" style="width: 11%;">जन्म तारीख</th>
                  <th class="col-header" style="width: 12%;">आईचे नाव</th>
                  <th class="col-header" style="width: 15%;">आधार कार्ड नं.</th>
                  <th class="col-header" style="width: 15%;">सरल आय.डी.नं.</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>

            <!-- OFFICIAL FOOTER SIGNATURE SECTION -->
            <div class="footer-sign-section">
              <div class="sign-box">
                <br/><br/>
                <div>क्रीडा शिक्षक (स्वाक्षरी)</div>
                <div style="font-size: 9.5pt; color: #334155; margin-top: 3px;">(${teacherName})</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)</div>
                <div style="font-size: 9.5pt; color: #334155; margin-top: 3px;">(शा. मा. आ. शाळा वाघांबा)</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[96vw] max-w-7xl max-h-[95vh] flex flex-col p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 shadow-3xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="shrink-0 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-500" />
                अधिकृत क्रीडा स्पर्धा शीट (Official Tournament Entry Sheet)
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                आदिवासी विकास विभाग, प्रकल्प कळवण व आश्रमशाळा वाघांबा अधिकृत क्रीडा स्पर्धा प्रवेश पत्र
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="h-9 rounded-xl font-bold text-xs gap-1.5 border-primary/20 bg-white"
              >
                <Settings2 className="w-4 h-4 text-primary" />
                {showConfig ? "माहिती लपवा" : "शीर्षक संपादन (Edit Headers)"}
              </Button>

              <Button
                onClick={handlePrintOfficialSheet}
                className="h-10 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-2"
              >
                <Printer className="w-4 h-4" />
                🖨️ प्रिंट / डाउनलोड (Download & Print PDF)
              </Button>
            </div>
          </DialogHeader>

          {/* Config Accordion / Edit Top Headers if toggled */}
          {showConfig && (
            <div className="shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm my-2 space-y-3 animate-in fade-in">
              <div className="text-xs font-black uppercase text-primary tracking-wider">
                शासकीय व संस्थात्मक शीर्षक माहिती (Official Header Settings)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">पहिली ओळ (Department Line 1):</label>
                  <Input 
                    value={departmentName} 
                    onChange={(e) => setDepartmentName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">दुसरी ओळ (Project Line 2):</label>
                  <Input 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">तिसरी ओळ (School Line 3):</label>
                  <Input 
                    value={schoolName} 
                    onChange={(e) => setSchoolName(e.target.value)} 
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subheader Toolbar: Sport, Category/Age Group, Academic Year */}
          <div className="shrink-0 bg-white dark:bg-slate-800 p-3 rounded-2xl border shadow-sm my-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-primary">खेळ प्रकार (Sport Type)</label>
              <div className="flex gap-2">
                <Select 
                  value={selectedSportKey} 
                  onValueChange={(val) => {
                    setSelectedSportKey(val);
                    setSportName(SPORT_MARATHI_MAP[val] || val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs font-bold w-full bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SPORT_MARATHI_MAP).map((k) => (
                      <SelectItem key={k} value={k} className="text-xs font-bold">
                        {SPORT_MARATHI_MAP[k]} ({k})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  value={sportName} 
                  onChange={(e) => setSportName(e.target.value)} 
                  placeholder="खेळ नाव" 
                  className="h-9 text-xs font-bold w-32"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-primary">वयोगट (Age Group)</label>
              <Input 
                value={ageGroup} 
                onChange={(e) => setAgeGroup(e.target.value)} 
                placeholder="उदा. 14 वर्षाखालील मुली" 
                className="h-9 text-xs font-bold bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-primary">शैक्षणिक वर्ष (Academic Year)</label>
              <Input 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)} 
                placeholder="उदा. 2026-27" 
                className="h-9 text-xs font-bold bg-slate-50"
              />
            </div>
          </div>

          {/* Action Row: Serial No options, Add Player, Picker */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={addBlankRow}
                className="h-8 rounded-lg text-xs font-bold bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> + रिक्त खेळाडू ओळ (Add Row)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="h-8 rounded-lg text-xs font-bold bg-white text-blue-700 border-blue-300 hover:bg-blue-50 gap-1 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> 👥 रोस्टरमधून निवडा (Pick Student)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={autoRenumber}
                className="h-8 rounded-lg text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-100 gap-1 shadow-sm"
                title="सर्व खेळाडूंना १ ते N असा नवीन अनुक्रमांक द्या"
              >
                <Hash className="w-3.5 h-3.5" /> १, २, ३... क्रम लावा (Auto Renumber)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={sortBySrNo}
                className="h-8 rounded-lg text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-100 gap-1 shadow-sm"
                title="अ.क्र. नुसार खेळाडू चढत्या क्रमाने लावा"
              >
                🔢 अ.क्र. नुसार सॉर्ट करा
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-bold text-xs">
                एकूण खेळाडू: {rows.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetRows}
                className="h-8 text-xs font-bold text-muted-foreground hover:text-destructive gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> रीसेट (Reset)
              </Button>
            </div>
          </div>

          {/* Interactive Editable Table */}
          <div className="flex-1 min-h-[300px] overflow-auto rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 text-slate-900 dark:text-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="p-2 text-center w-24 border-r">अ.क्र. (Sr No)</th>
                  <th className="p-2 border-r min-w-[200px]">विद्यार्थ्याचे नाव (Student Name)</th>
                  <th className="p-2 text-center w-28 border-r">इयत्ता (Std)</th>
                  <th className="p-2 text-center w-28 border-r">ज.रजि.नं. (GR No)</th>
                  <th className="p-2 text-center w-32 border-r">जन्म तारीख (DOB)</th>
                  <th className="p-2 text-center w-32 border-r">आईचे नाव (Mother)</th>
                  <th className="p-2 text-center w-40 border-r">आधार कार्ड नं. (Aadhaar)</th>
                  <th className="p-2 text-center min-w-[180px] border-r">सरल आय.डी.नं. (Saral ID)</th>
                  <th className="p-2 text-center w-20">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground font-bold">
                      यादीत अद्याप खेळाडू नाहीत. वरील &quot;+ रिक्त खेळाडू ओळ&quot; किंवा &quot;👥 रोस्टरमधून निवडा&quot; वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* अ.क्र. with quick edit and Up/Down arrows */}
                      <td className="p-1.5 border-r text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveRow(index, 'up')}
                              disabled={index === 0}
                              className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                              title="वर हलवा"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveRow(index, 'down')}
                              disabled={index === rows.length - 1}
                              className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                              title="खाली हलवा"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <Input
                            value={row.srNo}
                            onChange={(e) => updateRowField(index, 'srNo', e.target.value)}
                            className="h-8 w-12 text-center font-black text-xs px-1 bg-amber-50/70 border-amber-200 focus:bg-white"
                            title="इथे अनुक्रमांक थेट बदलू शकता"
                          />
                        </div>
                      </td>

                      {/* विद्यार्थ्याचे नाव */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.studentName}
                          onChange={(e) => updateRowField(index, 'studentName', e.target.value)}
                          className="h-8 text-xs font-black text-slate-900 focus:bg-amber-50/40"
                          placeholder="विद्यार्थ्याचे नाव"
                        />
                      </td>

                      {/* इयत्ता */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.std}
                          onChange={(e) => updateRowField(index, 'std', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40"
                          placeholder="इ. ९ वी"
                        />
                      </td>

                      {/* ज.रजि.नं. */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.grNo}
                          onChange={(e) => updateRowField(index, 'grNo', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40"
                          placeholder="GR No"
                        />
                      </td>

                      {/* जन्म तारीख */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.dob}
                          onChange={(e) => updateRowField(index, 'dob', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40"
                          placeholder="DD/MM/YYYY"
                        />
                      </td>

                      {/* आईचे नाव */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.motherName}
                          onChange={(e) => updateRowField(index, 'motherName', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40"
                          placeholder="आईचे नाव"
                        />
                      </td>

                      {/* आधार कार्ड नं. */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.aadhar}
                          onChange={(e) => updateRowField(index, 'aadhar', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40 font-mono"
                          placeholder="XXXX XXXX XXXX"
                        />
                      </td>

                      {/* सरल आय.डी.नं. */}
                      <td className="p-1.5 border-r">
                        <Input
                          value={row.saralId}
                          onChange={(e) => updateRowField(index, 'saralId', e.target.value)}
                          className="h-8 text-center text-xs font-bold focus:bg-amber-50/40 font-mono"
                          placeholder="2018 27200116..."
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="p-1.5 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRow(index)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="यादीतून काढा"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer controls */}
          <DialogFooter className="shrink-0 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground font-medium">
              💡 टीप: प्रिंट करण्यापूर्वी तुम्ही खेळाडूचे नाव, अनुक्रमांक (Sr No) व इतर कोणतीही माहिती बदलू शकता.
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-xs h-10">
                रद्द करा (Close)
              </Button>
              <Button
                onClick={handlePrintOfficialSheet}
                className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-2"
              >
                <Printer className="w-4 h-4" /> अधिकृत शीट प्रिंट करा (Print Sheet)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Dialog: Pick Student from School Master Roster */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5 rounded-3xl bg-white border-2 shadow-2xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-black text-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              शाळेच्या रोस्टरमधून खेळाडू जोडा (Select Student)
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="विद्यार्थ्याचे नाव, GR नंबर किंवा इयत्ता शोधा..."
              className="pl-9 h-10 text-xs font-bold rounded-xl"
            />
          </div>

          <div className="flex-1 min-h-[250px] max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {(() => {
              const allStudents: any[] = store?.data?.players?.length > 0 
                ? store.data.players 
                : WAGHAMBA_STUDENTS_DATA;

              const q = pickerSearch.trim().toLowerCase();
              const filtered = allStudents.filter((s: any) => {
                if (!q) return true;
                const matchName = (s.name || '').toLowerCase().includes(q);
                const matchMar = (s.nameMarathi || '').includes(q);
                const matchGR = String(s.generalRegisterNumber || s.rollNo || s.serialNumber || '').includes(q);
                const matchStd = String(s.std || '').includes(q);
                return matchName || matchMar || matchGR || matchStd;
              }).slice(0, 30);

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10 text-muted-foreground font-bold text-xs">
                    कोणताही विद्यार्थी सापडला नाही.
                  </div>
                );
              }

              return filtered.map((s: any) => {
                const displayName = s.nameMarathi?.trim() || transliterateEnglishToMarathi(s.name) || s.name;
                const gr = s.generalRegisterNumber || s.rollNo || s.serialNumber || '-';
                const mother = s.motherName || '-';

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-slate-900 text-xs">{displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                        <span>इयत्ता: {s.std} वी</span>
                        <span>&bull;</span>
                        <span>GR: {gr}</span>
                        <span>&bull;</span>
                        <span>आई: {mother}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddFromStudentPicker(s)}
                      className="h-8 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> जोडा
                    </Button>
                  </div>
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
