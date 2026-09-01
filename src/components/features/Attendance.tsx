"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { cn, getAgeValidation, transliterateEnglishToMarathi, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { usePWA } from "@/components/providers/pwa-provider";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  WifiOff,
  Search,
  UserX,
  UserCheck,
  Calendar,
  Users,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  FileText,
  ListFilter,
  Check,
  CalendarDays,
  AlertCircle,
  Camera,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";

const FaceAttendanceModal = dynamic(
  () => import("./FaceAttendanceModal").then((m) => m.FaceAttendanceModal),
  { ssr: false }
);

const SPORTS_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'boys-u14', label: 'Boys U14' },
  { id: 'boys-u17', label: 'Boys U17' },
  { id: 'boys-senior', label: 'Boys Senior' },
  { id: 'girls-u14', label: 'Girls U14' },
  { id: 'girls-u17', label: 'Girls U17' },
  { id: 'girls-senior', label: 'Girls Senior' },
  { id: 'age-pending', label: 'Age Pending' },
];

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `Std ${i + 1}` 
  }))
];

export function Attendance({ store, section, language = 'English' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSession, setActiveSession] = useState<'Morning' | 'Evening'>('Morning');
  const [localMarathiView, setLocalMarathiView] = useState(language === 'Marathi');
  const [searchTerm, setSearchTerm] = useState("");
  const { isOnline } = usePWA();

  // New View Mode State: 'grid' (Monthly Grid) or 'absentees' (Absentee Identification & Session Tracker)
  const [viewMode, setViewMode] = useState<'grid' | 'absentees'>('grid');
  // Selected date for Absentee Tracker (formatted YYYY-MM-DD)
  const [selectedAbsentDate, setSelectedAbsentDate] = useState<string>('');
  // Filter session for Absentee Tracker ('Morning' | 'Evening' | 'Both')
  const [absentSessionFilter, setAbsentSessionFilter] = useState<'Morning' | 'Evening' | 'Both'>('Morning');
  // Absence filter type: 'all_unattended' (not marked 'P') vs 'marked_absent' (explicitly 'A')
  const [absentTypeFilter, setAbsentTypeFilter] = useState<'all_unattended' | 'marked_absent'>('all_unattended');
  // Face Attendance AI Scanner Modal state
  const [isFaceAttendanceOpen, setIsFaceAttendanceOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const today = new Date();
    setCurrentDate(today);
    setSelectedAbsentDate(format(today, 'yyyy-MM-dd'));
    setLocalMarathiView(language === 'Marathi');
  }, [language]);

  const monthStart = useMemo(() => currentDate ? startOfMonth(currentDate) : null, [currentDate]);
  const monthEnd = useMemo(() => currentDate ? endOfMonth(currentDate) : null, [currentDate]);
  const days = useMemo(() => {
    if (isMounted && monthStart && monthEnd) {
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    return [];
  }, [isMounted, monthStart, monthEnd]);

  const isGeneral = section === 'general';
  const categories = useMemo(() => isGeneral ? GENERAL_CATEGORIES : SPORTS_CATEGORIES, [isGeneral]);

  const getPlayerCategory = useCallback((p: any) => {
    if (isGeneral) return p.std;
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'age-pending';
    const genderPart = p.gender === 'Female' ? 'girls' : 'boys';
    let agePart = 'senior';
    if (age < 14) agePart = 'u14';
    else if (age < 17) agePart = 'u17';
    return `${genderPart}-${agePart}`;
  }, [isGeneral]);

  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const matchesTab = activeCategory === 'all' || getPlayerCategory(p) === activeCategory;
        const query = searchTerm.toLowerCase();
        const matchesSearch = (p.name || "").toLowerCase().includes(query) || 
                             (p.nameMarathi || "").toLowerCase().includes(query) ||
                             (p.generalRegisterNumber || "").includes(searchTerm);
        return matchesSection && matchesTab && matchesSearch;
      })
      .sort((a: any, b: any) => {
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, isGeneral, activeCategory, getPlayerCategory, searchTerm]);

  // Absentees calculation for the selected date
  const absenteesData = useMemo(() => {
    const dateStr = selectedAbsentDate || (currentDate ? format(currentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    
    let morningPresent = 0;
    let morningExplicitAbsent = 0;
    let morningUnmarked = 0;
    
    let eveningPresent = 0;
    let eveningExplicitAbsent = 0;
    let eveningUnmarked = 0;
    
    const list: any[] = [];
    
    filteredPlayers.forEach((player: any) => {
      const mStatus = store.data.attendance[`${player.id}_${dateStr}_Morning`];
      const eStatus = store.data.attendance[`${player.id}_${dateStr}_Evening`];
      
      if (mStatus === 'P') morningPresent++;
      else if (mStatus === 'A') morningExplicitAbsent++;
      else morningUnmarked++;
      
      if (eStatus === 'P') eveningPresent++;
      else if (eStatus === 'A') eveningExplicitAbsent++;
      else eveningUnmarked++;

      let isAbsentInMorning = absentTypeFilter === 'marked_absent' ? mStatus === 'A' : mStatus !== 'P';
      let isAbsentInEvening = absentTypeFilter === 'marked_absent' ? eStatus === 'A' : eStatus !== 'P';

      let includeInList = false;
      if (absentSessionFilter === 'Morning') includeInList = isAbsentInMorning;
      else if (absentSessionFilter === 'Evening') includeInList = isAbsentInEvening;
      else if (absentSessionFilter === 'Both') includeInList = isAbsentInMorning || isAbsentInEvening;

      if (includeInList) {
        list.push({
          ...player,
          morningStatus: mStatus,
          eveningStatus: eStatus,
          isAbsentInMorning,
          isAbsentInEvening,
        });
      }
    });

    const total = filteredPlayers.length;
    const morningTotalAbsent = total - morningPresent;
    const eveningTotalAbsent = total - eveningPresent;

    return {
      dateStr,
      total,
      morningPresent,
      morningExplicitAbsent,
      morningUnmarked,
      morningTotalAbsent,
      eveningPresent,
      eveningExplicitAbsent,
      eveningUnmarked,
      eveningTotalAbsent,
      list
    };
  }, [filteredPlayers, store.data.attendance, selectedAbsentDate, currentDate, absentSessionFilter, absentTypeFilter]);

  const handleToggle = (playerId: string, date: Date) => {
    const key = `${playerId}_${format(date, 'yyyy-MM-dd')}_${activeSession}`;
    const currentStatus = store.data.attendance[key];
    const nextStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? null : 'P';
    store.setAttendance({ [key]: nextStatus });
  };

  const handleSetSingleStatus = (playerId: string, dateStr: string, session: 'Morning' | 'Evening', newStatus: 'P' | 'A' | null) => {
    const key = `${playerId}_${dateStr}_${session}`;
    store.setAttendance({ [key]: newStatus });
  };

  const handleBatchMarkAbsent = (session: 'Morning' | 'Evening') => {
    const updates: Record<string, string | null> = {};
    const dateStr = absenteesData.dateStr;
    filteredPlayers.forEach((p: any) => {
      const key = `${p.id}_${dateStr}_${session}`;
      if (store.data.attendance[key] !== 'P') {
        updates[key] = 'A';
      }
    });
    store.setAttendance(updates);
  };

  const handleBatchMarkPresent = (session: 'Morning' | 'Evening') => {
    const updates: Record<string, string | null> = {};
    const dateStr = absenteesData.dateStr;
    filteredPlayers.forEach((p: any) => {
      const key = `${p.id}_${dateStr}_${session}`;
      updates[key] = 'P';
    });
    store.setAttendance(updates);
  };

  const handlePrint = () => {
    if (!currentDate) return;
    const isM = localMarathiView;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, isM);
    const reportTitle = isM 
      ? `मासिक उपस्थिती अहवाल - ${format(currentDate, 'MMMM yyyy')}` 
      : `Monthly Attendance Report - ${format(currentDate, 'MMMM yyyy')}`;
    const sessionLabel = isM 
      ? (activeSession === 'Morning' ? 'सकाळ' : 'संध्याकाळ')
      : activeSession;
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, isM);
    
    const printContent = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
            @media print { 
              @page { size: A4 landscape; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Poppins', sans-serif; padding: 20px; font-size: 10px; color: #111; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 2px solid #333; margin-bottom: 5px; text-align: center; }
            .report-type { font-weight: 800; text-transform: uppercase; text-align: center; margin-bottom: 15px; text-decoration: underline; }
            .meta { font-weight: bold; margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
            .name-cell { text-align: left; font-weight: bold; width: 120px; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print" style="position:fixed; top:0; left:0; right:0; background:#1e3a8a; padding:10px; text-align:center;">
             <button onclick="window.print()" style="background:#f59e0b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:900; cursor:pointer;">${isM ? 'प्रिंट करा' : 'Print Report'}</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">${reportTitle}</div>
          <div class="meta">
            <span>${isM ? 'सत्र' : 'Session'}: ${sessionLabel}</span>
            <span>${isM ? 'तारीख' : 'Date'}: ${format(new Date(), 'dd/MM/yyyy')}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>${isM ? 'अनु. क्र.' : 'Sr No'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</th>
                <th>${isM ? 'लिंग' : 'Gender'}</th>
                ${days.map(d => `<th>${format(d, 'd')}</th>`).join('')}
                <th>${isM ? 'एकूण' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any) => {
                let total = 0;
                const row = days.map(d => {
                  const s = store.data.attendance[`${p.id}_${format(d, 'yyyy-MM-dd')}_${activeSession}`];
                  if (s === 'P') total++;
                  return `<td>${s || '-'}</td>`;
                }).join('');
                const displayName = isM ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name;
                return `<tr><td>${p.serialNumber || ''}</td><td class="name-cell">${displayName.toUpperCase()}</td><td>${p.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>${row}<td>${total}</td></tr>`;
              }).join('')}
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

  const handlePrintAbsentees = () => {
    const isM = localMarathiView;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, isM);
    
    let formattedDate = absenteesData.dateStr;
    try {
      formattedDate = format(parseISO(absenteesData.dateStr), 'dd/MM/yyyy');
    } catch (e) {
      formattedDate = absenteesData.dateStr;
    }

    const sessionText = absentSessionFilter === 'Morning' ? (isM ? 'सकाळ सत्र (Morning Session)' : 'Morning Session') :
                        absentSessionFilter === 'Evening' ? (isM ? 'संध्याकाळ सत्र (Evening Session)' : 'Evening Session') :
                        (isM ? 'सकाळ व संध्याकाळ सत्र (Morning & Evening Sessions)' : 'Morning & Evening Sessions');

    const reportTitle = isM 
      ? `गैरहजर विद्यार्थी यादी - ${formattedDate}` 
      : `Absent Students Report - ${formattedDate}`;

    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, isM);

    const printContent = `
      <html>
        <head>
          <title>Absentee List - ${formattedDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800;900&display=swap');
            @media print { 
              @page { size: A4 portrait; margin: 1cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Poppins', sans-serif; padding: 25px; font-size: 11px; color: #0f172a; line-height: 1.4; }
            .header-box { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 15px; }
            h1 { color: #1e3a8a; font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0; }
            .sub-heading { font-weight: 800; text-transform: uppercase; font-size: 13px; color: #dc2626; letter-spacing: 0.5px; }
            .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; font-weight: 700; margin-bottom: 15px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #1e3a8a; color: white; border: 1px solid #1e3a8a; padding: 8px 6px; text-align: center; font-size: 10px; text-transform: uppercase; font-weight: 800; }
            td { border: 1px solid #cbd5e1; padding: 7px 6px; text-align: center; font-size: 10.5px; }
            .name-cell { text-align: left; font-weight: 700; color: #0f172a; }
            .badge-absent { display: inline-block; background-color: #fee2e2; color: #991b1b; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-size: 9.5px; text-transform: uppercase; }
            .badge-unmarked { display: inline-block; background-color: #fef3c7; color: #92400e; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-size: 9.5px; text-transform: uppercase; }
            .footer-notes { margin-top: 25px; padding: 10px; border: 1px dashed #cbd5e1; background: #fff; font-size: 9.5px; color: #475569; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print" style="position:fixed; top:0; left:0; right:0; background:#1e3a8a; padding:12px; text-align:center; z-index: 1000;">
             <button onclick="window.print()" style="background:#dc2626; color:white; border:none; padding:10px 24px; border-radius:6px; font-weight:900; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
               ${isM ? 'प्रिंट करा (Print)' : 'Print Absentee Report'}
             </button>
          </div>

          <div class="header-box">
            <h1>${schoolName}</h1>
            <div class="sub-heading">${reportTitle}</div>
          </div>

          <div class="meta-bar">
            <span><strong>${isM ? 'दिनांक' : 'Date'}:</strong> ${formattedDate}</span>
            <span><strong>${isM ? 'सत्र' : 'Session'}:</strong> ${sessionText}</span>
            <span><strong>${isM ? 'एकूण गैरहजर' : 'Total Absent'}:</strong> ${absenteesData.list.length} / ${absenteesData.total}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">${isM ? 'अनु. क्र.' : 'Sr.'}</th>
                <th style="width: 70px;">${isM ? 'इयत्ता / Std' : 'Std/Cat'}</th>
                <th>${isM ? 'विद्यार्थ्याचे नाव (Student Name)' : 'Student Name'}</th>
                <th style="width: 65px;">${isM ? 'लिंग' : 'Gender'}</th>
                <th style="width: 100px;">${isM ? 'सकाळ सत्र' : 'Morning Status'}</th>
                <th style="width: 100px;">${isM ? 'संध्याकाळ सत्र' : 'Evening Status'}</th>
                <th style="width: 120px;">${isM ? 'पालक संपर्क / शेरा' : 'Remarks / Reason'}</th>
              </tr>
            </thead>
            <tbody>
              ${absenteesData.list.length === 0 ? `
                <tr>
                  <td colSpan="7" style="padding: 30px; text-align: center; color: #166534; font-weight: 800; font-size: 14px;">
                    🎉 ${isM ? 'सर्व विद्यार्थी उपस्थित आहेत! कोणीही गैरहजर नाही.' : 'All students are Present! No absentees recorded.'}
                  </td>
                </tr>
              ` : absenteesData.list.map((p: any, idx: number) => {
                const displayName = isM ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name;
                const mBadge = p.morningStatus === 'A' ? `<span class="badge-absent">${isM ? 'गैरहजर (A)' : 'Absent (A)'}</span>` :
                               p.morningStatus === 'P' ? `<span style="color:#166534; font-weight:800;">${isM ? 'उपस्थित (P)' : 'Present (P)'}</span>` :
                               `<span class="badge-unmarked">${isM ? 'नोंद नाही (-)' : 'Unmarked (-)'}</span>`;
                               
                const eBadge = p.eveningStatus === 'A' ? `<span class="badge-absent">${isM ? 'गैरहजर (A)' : 'Absent (A)'}</span>` :
                               p.eveningStatus === 'P' ? `<span style="color:#166534; font-weight:800;">${isM ? 'उपस्थित (P)' : 'Present (P)'}</span>` :
                               `<span class="badge-unmarked">${isM ? 'नोंद नाही (-)' : 'Unmarked (-)'}</span>`;
                               
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${p.std ? `Std ${p.std}` : p.category || '-'}</strong></td>
                    <td class="name-cell">${displayName.toUpperCase()}</td>
                    <td>${p.gender === 'Male' ? (isM ? 'मुलगा' : 'Male') : (isM ? 'मुलगी' : 'Female')}</td>
                    <td>${mBadge}</td>
                    <td>${eBadge}</td>
                    <td style="height: 25px;"></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer-notes">
            <strong>${isM ? 'टीप:' : 'Note:'}</strong> ${isM ? 'सदरील माहिती उपस्थिती नोंदवहीनुसार तयार करण्यात आली आहे. गैरहजर विद्यार्थ्यांच्या पालकांना त्वरित कळवण्यात यावे.' : 'This report is generated from the institutional presence log. Absentees should be reported to parents accordingly.'}
          </div>

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

  if (!isMounted || !store.isLoaded) {
    return <TableSkeleton rows={15} cols={10} />;
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {!isOnline && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-900 uppercase">Offline Mode Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Main View Mode Selector (Grid vs Absentees Tracker) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-[2rem] border shadow-lg">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border shadow-inner">
          <Button
            variant={viewMode === 'grid' ? "default" : "ghost"}
            onClick={() => setViewMode('grid')}
            className={cn(
              "h-11 rounded-xl px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2",
              viewMode === 'grid' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-white"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            {localMarathiView ? 'मासिक नोंदवही (Grid)' : 'Monthly Register'}
          </Button>

          <Button
            variant={viewMode === 'absentees' ? "default" : "ghost"}
            onClick={() => setViewMode('absentees')}
            className={cn(
              "h-11 rounded-xl px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 relative",
              viewMode === 'absentees' ? "bg-destructive text-white shadow-md" : "text-destructive hover:bg-rose-50"
            )}
          >
            <UserX className="w-4 h-4" />
            {localMarathiView ? 'गैरहजर विद्यार्थी Tracker' : 'Absent Students Tracker'}
            {absenteesData.morningTotalAbsent > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-destructive shadow-sm">
                {absenteesData.morningTotalAbsent}
              </span>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsFaceAttendanceOpen(true)}
            className="h-11 rounded-xl px-5 font-black uppercase text-xs tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 active-scale transition-all"
          >
            <Camera className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            {localMarathiView ? 'चेहरा हजेरी (Face Attendance)' : 'Face Attendance'}
          </Button>

          <div className="flex bg-muted/40 p-1 rounded-xl border">
            <Button variant={!localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(false)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">English</Button>
            <Button variant={localMarathiView ? "default" : "ghost"} onClick={() => setLocalMarathiView(true)} className="h-9 px-4 text-[10px] font-black uppercase rounded-lg">मराठी</Button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted/40 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-9 rounded-xl px-5 text-[10px] font-black uppercase transition-all whitespace-nowrap",
              activeCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white'
            )}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* VIEW MODE 1: MONTHLY GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border shadow-xl">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Presence Log</h2>
                <div className="flex bg-muted/40 p-1 rounded-xl border mt-2">
                  <Button variant={activeSession === 'Morning' ? "default" : "ghost"} onClick={() => setActiveSession('Morning')} className="h-8 px-4 text-[9px] font-black uppercase rounded-lg">Morning</Button>
                  <Button variant={activeSession === 'Evening' ? "default" : "ghost"} onClick={() => setActiveSession('Evening')} className="h-8 px-4 text-[9px] font-black uppercase rounded-lg">Evening</Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-[450px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
                <Input 
                  placeholder={localMarathiView ? "नाव किंवा GR ने शोधा..." : "Find Student by Name or GR..."} 
                  className="pl-14 h-16 rounded-[1.2rem] border-2 border-primary/10 bg-muted/20 font-black text-lg shadow-inner focus:bg-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border shadow-inner">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-black text-primary uppercase text-[10px] min-w-[100px] text-center tracking-widest">
                      {currentDate ? format(currentDate, 'MMM yyyy') : '...'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => currentDate && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handlePrint} className="h-12 px-6 bg-primary text-white rounded-xl font-black uppercase text-xs shadow-lg active-scale">
                    <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
              </div>
            </div>
          </div>

          <Card className="border-2 rounded-[3rem] overflow-hidden bg-white shadow-2xl relative">
            <div className="overflow-x-auto scrollbar-hide relative max-h-[70vh] overflow-y-auto">
              <Table className="border-collapse min-w-max">
                <TableHeader className="bg-slate-100 sticky top-0 z-50 shadow-sm border-b">
                  <TableRow className="h-14">
                    <TableHead className="border-r px-6 font-black text-[11px] uppercase w-[220px] sticky left-0 top-0 bg-slate-200 z-[60]">Student Profile</TableHead>
                    {days.map(day => (
                      <TableHead key={day.toString()} className="border-r px-1 font-black text-[10px] uppercase text-center w-[40px] sticky top-0 bg-slate-100 z-40">
                        {format(day, 'd')}
                      </TableHead>
                    ))}
                    <TableHead className="px-4 font-black text-[10px] uppercase text-center w-[70px] bg-primary/10 sticky top-0 right-0 z-[60]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.length === 0 ? (
                    <TableRow><TableCell colSpan={days.length + 2} className="text-center py-40 opacity-20 font-black uppercase text-2xl">No registry entries</TableCell></TableRow>
                  ) : filteredPlayers.map((player: any) => {
                    let monthlyTotal = 0;
                    return (
                      <TableRow key={player.id} className="border-b h-14 group hover:bg-primary/5 transition-colors">
                        <TableCell className="border-r px-6 text-[10px] font-black sticky left-0 bg-white z-20 uppercase border-r group-hover:bg-muted/5">
                          {localMarathiView ? (player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name) : player.name}
                        </TableCell>
                        {days.map(day => {
                          const key = `${player.id}_${format(day, 'yyyy-MM-dd')}_${activeSession}`;
                          const status = store.data.attendance[key];
                          if (status === 'P') monthlyTotal++;
                          return (
                            <TableCell 
                              key={day.toString()} 
                              className="border-r p-0 text-center cursor-pointer transition-colors"
                              onClick={() => handleToggle(player.id, day)}
                            >
                              <div className={cn(
                                "w-full h-14 flex items-center justify-center text-[10px] font-black",
                                status === 'P' ? "bg-primary text-white shadow-inner" : 
                                status === 'A' ? "bg-destructive text-white shadow-inner" : 
                                'text-muted-foreground/10'
                              )}>
                                {status || '-'}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="px-4 text-center font-black text-primary text-sm bg-primary/5 sticky right-0 z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.05)]">{monthlyTotal}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      {/* VIEW MODE 2: ABSENT STUDENTS TRACKER */}
      {viewMode === 'absentees' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Controls Bar for Absentee Inspection */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
              {/* Date Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  {localMarathiView ? 'उपस्थिती दिनांक' : 'Inspection Date'}
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={selectedAbsentDate}
                    onChange={(e) => setSelectedAbsentDate(e.target.value)}
                    className="h-12 rounded-xl font-bold border-2 border-muted bg-slate-50 w-full sm:w-[180px]"
                  />
                </div>
              </div>

              {/* Session Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  {localMarathiView ? 'सत्र निवड (Session)' : 'Session Filter'}
                </label>
                <div className="flex bg-muted/50 p-1 rounded-xl border">
                  <Button
                    variant={absentSessionFilter === 'Morning' ? "default" : "ghost"}
                    onClick={() => setAbsentSessionFilter('Morning')}
                    className="h-10 px-4 text-xs font-black uppercase rounded-lg flex items-center gap-1.5"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    {localMarathiView ? 'सकाळ' : 'Morning'}
                  </Button>
                  <Button
                    variant={absentSessionFilter === 'Evening' ? "default" : "ghost"}
                    onClick={() => setAbsentSessionFilter('Evening')}
                    className="h-10 px-4 text-xs font-black uppercase rounded-lg flex items-center gap-1.5"
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    {localMarathiView ? 'संध्याकाळ' : 'Evening'}
                  </Button>
                  <Button
                    variant={absentSessionFilter === 'Both' ? "default" : "ghost"}
                    onClick={() => setAbsentSessionFilter('Both')}
                    className="h-10 px-4 text-xs font-black uppercase rounded-lg"
                  >
                    {localMarathiView ? 'दोन्ही (Both)' : 'Both'}
                  </Button>
                </div>
              </div>

              {/* Absent Type Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  {localMarathiView ? 'अहवाल प्रकार' : 'Filter Criteria'}
                </label>
                <div className="flex bg-muted/50 p-1 rounded-xl border">
                  <Button
                    variant={absentTypeFilter === 'all_unattended' ? "default" : "ghost"}
                    onClick={() => setAbsentTypeFilter('all_unattended')}
                    className="h-10 px-4 text-[10px] font-black uppercase rounded-lg"
                  >
                    {localMarathiView ? 'सर्व न आलेले (Unattended)' : 'All Unattended'}
                  </Button>
                  <Button
                    variant={absentTypeFilter === 'marked_absent' ? "default" : "ghost"}
                    onClick={() => setAbsentTypeFilter('marked_absent')}
                    className="h-10 px-4 text-[10px] font-black uppercase rounded-lg"
                  >
                    {localMarathiView ? 'केवळ गैरहजर marked (A)' : 'Marked Absent (A)'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={localMarathiView ? "नाव किंवा GR ने शोधा..." : "Search absentees..."}
                className="pl-11 h-12 rounded-xl border-2 bg-slate-50 font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 rounded-[2rem] p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    ☀️ {localMarathiView ? 'सकाळ सत्र गैरहजर' : 'Morning Session Absentees'}
                  </p>
                  <h3 className="text-4xl font-black text-amber-900 mt-1">
                    {absenteesData.morningTotalAbsent} <span className="text-xs font-bold text-amber-700">/ {absenteesData.total}</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                  <Sun className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mt-3 pt-3 border-t border-amber-200/60">
                <span>Present: <strong>{absenteesData.morningPresent}</strong></span>
                <span>Explicit &apos;A&apos;: <strong>{absenteesData.morningExplicitAbsent}</strong></span>
                <span>Unmarked: <strong>{absenteesData.morningUnmarked}</strong></span>
              </div>
            </Card>

            <Card className="border-2 rounded-[2rem] p-6 bg-gradient-to-br from-indigo-50 to-blue-50/50 border-indigo-200 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">
                    🌙 {localMarathiView ? 'संध्याकाळ सत्र गैरहजर' : 'Evening Session Absentees'}
                  </p>
                  <h3 className="text-4xl font-black text-indigo-900 mt-1">
                    {absenteesData.eveningTotalAbsent} <span className="text-xs font-bold text-indigo-700">/ {absenteesData.total}</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <Moon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 mt-3 pt-3 border-t border-indigo-200/60">
                <span>Present: <strong>{absenteesData.eveningPresent}</strong></span>
                <span>Explicit &apos;A&apos;: <strong>{absenteesData.eveningExplicitAbsent}</strong></span>
                <span>Unmarked: <strong>{absenteesData.eveningUnmarked}</strong></span>
              </div>
            </Card>

            <Card className="border-2 rounded-[2rem] p-6 bg-white border-rose-200 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-destructive uppercase tracking-widest">
                    📋 {localMarathiView ? 'सध्याच्या फिल्टरनुसार गैरहजर' : 'Matching Absentees'}
                  </p>
                  <Badge variant="destructive" className="font-extrabold px-3 py-1 text-xs">
                    {absenteesData.list.length} Students
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  {localMarathiView 
                    ? 'खालील यादीत गैरहजर विद्यार्थ्यांची नावे आणि १-क्लिक हजेरी बटणे आहेत.'
                    : 'List showing absent players with instant 1-click attendance toggles.'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button 
                  onClick={handlePrintAbsentees}
                  className="w-full bg-destructive hover:bg-rose-700 text-white font-black uppercase text-xs h-11 rounded-xl shadow-md active-scale"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {localMarathiView ? 'गैरहजर यादी प्रिंट करा' : 'Print Absentee Report'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Batch Actions Toolbar */}
          <div className="bg-slate-50 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase text-slate-800">
                {localMarathiView ? 'झटपट कृती (Batch Actions):' : 'Batch Quick Actions:'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchMarkAbsent('Morning')}
                className="h-9 px-4 text-[10px] font-black uppercase border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
              >
                ☀️ {localMarathiView ? 'सकाळ: सर्वांना गैरहजर (A) करा' : 'Mark All Morning Unmarked as Absent'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchMarkPresent('Morning')}
                className="h-9 px-4 text-[10px] font-black uppercase border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
              >
                ☀️ {localMarathiView ? 'सकाळ: सर्वांना उपस्थित (P) करा' : 'Mark All Morning as Present'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchMarkAbsent('Evening')}
                className="h-9 px-4 text-[10px] font-black uppercase border-indigo-300 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
              >
                🌙 {localMarathiView ? 'संध्याकाळ: सर्वांना गैरहजर (A) करा' : 'Mark All Evening Unmarked as Absent'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchMarkPresent('Evening')}
                className="h-9 px-4 text-[10px] font-black uppercase border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100"
              >
                🌙 {localMarathiView ? 'संध्याकाळ: सर्वांना उपस्थित (P) करा' : 'Mark All Evening as Present'}
              </Button>
            </div>
          </div>

          {/* Absent Students Table / Card List */}
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
            <div className="p-6 border-b bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  {localMarathiView ? 'अनुपस्थित विद्यार्थी सूची' : 'Absent Students Identification List'}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">
                  {format(parseISO(absenteesData.dateStr), 'EEEE, dd MMMM yyyy')} • {absenteesData.list.length} {localMarathiView ? 'विद्यार्थी' : 'students found'}
                </p>
              </div>
              <Badge variant="outline" className="font-extrabold border-primary/20 text-primary bg-primary/5 text-xs px-3 py-1">
                {absentSessionFilter} Session
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100 border-b">
                  <TableRow>
                    <TableHead className="w-[60px] text-center font-black text-[10px] uppercase">#</TableHead>
                    <TableHead className="font-black text-[11px] uppercase">{localMarathiView ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</TableHead>
                    <TableHead className="w-[100px] text-center font-black text-[10px] uppercase">{localMarathiView ? 'इयत्ता / वर्ग' : 'Std / Cat'}</TableHead>
                    <TableHead className="w-[80px] text-center font-black text-[10px] uppercase">{localMarathiView ? 'लिंग' : 'Gender'}</TableHead>
                    <TableHead className="w-[160px] text-center font-black text-[10px] uppercase">{localMarathiView ? 'सकाळ सत्र (Morning)' : 'Morning Session'}</TableHead>
                    <TableHead className="w-[160px] text-center font-black text-[10px] uppercase">{localMarathiView ? 'संध्याकाळ सत्र (Evening)' : 'Evening Session'}</TableHead>
                    <TableHead className="w-[180px] text-center font-black text-[10px] uppercase">{localMarathiView ? 'हजेरी कृती' : 'Quick Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenteesData.list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center opacity-40 space-y-2">
                          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                          <p className="text-xl font-black uppercase text-slate-800">
                            {localMarathiView ? 'सर्व विद्यार्थी उपस्थित आहेत!' : 'No Absent Students Found'}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            {localMarathiView ? 'निवडलेल्या सत्रात सर्व विद्यार्थी उपस्थित नोंदवले गेले आहेत.' : 'All students in this filter were present for the selected session.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    absenteesData.list.map((player: any, idx: number) => {
                      const displayName = localMarathiView 
                        ? (player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name) 
                        : player.name;

                      return (
                        <TableRow key={player.id} className="border-b hover:bg-slate-50 transition-colors">
                          <TableCell className="text-center font-black text-xs text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-slate-900 uppercase">
                                {displayName}
                              </span>
                              {player.generalRegisterNumber && (
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  GR No: {player.generalRegisterNumber}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-extrabold text-xs">
                            <Badge variant="secondary" className="font-black uppercase text-[10px]">
                              {player.std ? `Std ${player.std}` : player.category || '-'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs">
                            {player.gender === 'Male' ? (localMarathiView ? 'मुलगा' : 'Male') : (localMarathiView ? 'मुलगी' : 'Female')}
                          </TableCell>

                          {/* Morning Status Cell */}
                          <TableCell className="text-center">
                            {player.morningStatus === 'P' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 font-extrabold uppercase text-[10px]">
                                ✓ {localMarathiView ? 'उपस्थित (P)' : 'Present (P)'}
                              </Badge>
                            ) : player.morningStatus === 'A' ? (
                              <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300 font-extrabold uppercase text-[10px]">
                                ✗ {localMarathiView ? 'गैरहजर (A)' : 'Absent (A)'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 font-extrabold uppercase text-[10px]">
                                - {localMarathiView ? 'नोंद नाही' : 'Unmarked'}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Evening Status Cell */}
                          <TableCell className="text-center">
                            {player.eveningStatus === 'P' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 font-extrabold uppercase text-[10px]">
                                ✓ {localMarathiView ? 'उपस्थित (P)' : 'Present (P)'}
                              </Badge>
                            ) : player.eveningStatus === 'A' ? (
                              <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300 font-extrabold uppercase text-[10px]">
                                ✗ {localMarathiView ? 'गैरहजर (A)' : 'Absent (A)'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 font-extrabold uppercase text-[10px]">
                                - {localMarathiView ? 'नोंद नाही' : 'Unmarked'}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Quick Actions Cell */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {absentSessionFilter === 'Morning' || absentSessionFilter === 'Both' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetSingleStatus(player.id, absenteesData.dateStr, 'Morning', player.morningStatus === 'P' ? 'A' : 'P')}
                                  className={cn(
                                    "h-8 px-2.5 text-[9px] font-black uppercase rounded-lg transition-all",
                                    player.morningStatus === 'P' ? "border-amber-300 bg-amber-50 text-amber-800" : "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                  )}
                                >
                                  {player.morningStatus === 'P' ? 'Set Morning A' : 'Mark Morning P'}
                                </Button>
                              ) : null}

                              {absentSessionFilter === 'Evening' || absentSessionFilter === 'Both' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetSingleStatus(player.id, absenteesData.dateStr, 'Evening', player.eveningStatus === 'P' ? 'A' : 'P')}
                                  className={cn(
                                    "h-8 px-2.5 text-[9px] font-black uppercase rounded-lg transition-all",
                                    player.eveningStatus === 'P' ? "border-amber-300 bg-amber-50 text-amber-800" : "border-indigo-500 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                                  )}
                                >
                                  {player.eveningStatus === 'P' ? 'Set Evening A' : 'Mark Evening P'}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* AI Face Attendance Scanner Modal */}
      {isFaceAttendanceOpen && (
        <FaceAttendanceModal
          isOpen={isFaceAttendanceOpen}
          onClose={() => setIsFaceAttendanceOpen(false)}
          players={store.data.players || []}
          store={store}
          activeSession={activeSession}
          onSessionChange={(sess) => setActiveSession(sess)}
          dateStr={selectedAbsentDate || (currentDate ? format(currentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))}
          attendance={store.data.attendance || {}}
          onMarkAttendance={(playerId, dStr, sess, status) => {
            handleSetSingleStatus(playerId, dStr, sess, status);
          }}
          language={localMarathiView ? 'Marathi' : 'English'}
        />
      )}
    </div>
  );
}
