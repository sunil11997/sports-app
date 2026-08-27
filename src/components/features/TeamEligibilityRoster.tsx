"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Share2, 
  Search, 
  Calendar, 
  Users, 
  Trophy, 
  Filter, 
  Clock, 
  FileText,
  UserCheck,
  UserX,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  cn, 
  getAgeValidation, 
  getLocalizedAgeCategory, 
  getOfficialSchoolName, 
  getTeacherName, 
  transliterateEnglishToMarathi 
} from '@/lib/utils';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

const SPORTS_LIST = [
  'All',
  'Kabaddi',
  'Kho Kho',
  'Volleyball',
  'Athletics',
  'Handball',
  'Running',
  'Shot Put',
  'Javelin Throw',
  'Disc Throw',
  'Long Jump',
  'High Jump',
  'Yoga',
  'PT Mass'
];

const ACADEMIC_YEARS = [
  { label: '2026 - 2027 (Cut-off: 31 Dec 2026)', year: 2026 },
  { label: '2025 - 2026 (Cut-off: 31 Dec 2025)', year: 2025 },
  { label: '2027 - 2028 (Cut-off: 31 Dec 2027)', year: 2027 },
];

export function TeamEligibilityRoster({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const [selectedSport, setSelectedSport] = useState(preselectedSport || 'All');
  const [refYear, setRefYear] = useState<number>(2026);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const players = useMemo(() => store?.data?.players || [], [store?.data?.players]);

  // Compute player validations
  const evaluatedPlayers = useMemo(() => {
    return players.map((p: any) => {
      const ageVal = getAgeValidation(p.dob, refYear);
      const marathiName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
      const position = p.positions?.[selectedSport !== 'All' ? selectedSport : p.sports?.[0]] || '-';
      const jersey = p.jerseyNumbers?.[selectedSport !== 'All' ? selectedSport : p.sports?.[0]] || p.jerseyNumber || '-';

      return {
        ...p,
        marathiName,
        ageVal,
        currentPosition: position,
        currentJersey: jersey
      };
    });
  }, [players, refYear, selectedSport]);

  // Filtered list
  const filteredPlayers = useMemo(() => {
    return evaluatedPlayers.filter((p: any) => {
      // Sport filter
      if (selectedSport !== 'All') {
        if (!p.sports || !p.sports.includes(selectedSport)) return false;
      }

      // Gender filter
      if (selectedGenderFilter !== 'All') {
        if (p.gender !== selectedGenderFilter) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'All') {
        if (selectedCategoryFilter === 'U14' && p.ageVal?.eligibilityType !== 'U14') return false;
        if (selectedCategoryFilter === 'U17' && p.ageVal?.eligibilityType !== 'U17') return false;
        if (selectedCategoryFilter === 'U19' && p.ageVal?.eligibilityType !== 'U19') return false;
        if (selectedCategoryFilter === 'Overage' && p.ageVal?.eligibilityType !== 'Overage') return false;
        if (selectedCategoryFilter === 'Underage' && p.ageVal?.eligibilityType !== 'Underage') return false;
        if (selectedCategoryFilter === 'Eligible' && !p.ageVal?.eligible) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchMarathi = (p.marathiName || '').includes(q);
        const matchGR = (p.generalRegisterNumber || '').toLowerCase().includes(q);
        const matchAadhaar = (p.aadharNumber || '').includes(q);
        const matchStd = (p.std || '').toString().includes(q);
        if (!matchName && !matchMarathi && !matchGR && !matchAadhaar && !matchStd) return false;
      }

      return true;
    });
  }, [evaluatedPlayers, selectedSport, selectedGenderFilter, selectedCategoryFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    let u14 = 0;
    let u17 = 0;
    let u19 = 0;
    let overage = 0;
    let underage = 0;
    let totalEligible = 0;

    const baseList = selectedSport === 'All' 
      ? evaluatedPlayers 
      : evaluatedPlayers.filter((p: any) => p.sports && p.sports.includes(selectedSport));

    baseList.forEach((p: any) => {
      if (p.ageVal?.eligibilityType === 'U14') u14++;
      if (p.ageVal?.eligibilityType === 'U17') u17++;
      if (p.ageVal?.eligibilityType === 'U19') u19++;
      if (p.ageVal?.eligibilityType === 'Overage') overage++;
      if (p.ageVal?.eligibilityType === 'Underage') underage++;
      if (p.ageVal?.eligible) totalEligible++;
    });

    return {
      total: baseList.length,
      u14,
      u17,
      u19,
      overage,
      underage,
      totalEligible
    };
  }, [evaluatedPlayers, selectedSport]);

  const handleWhatsAppShare = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const playerListText = filteredPlayers.slice(0, 30).map((p: any, i: number) => {
      const statusBadge = p.ageVal?.eligible ? `[${p.ageVal.category}]` : `[⚠️ ${p.ageVal?.category || 'अपात्र'}]`;
      const dobStr = p.dob || 'DOB N/A';
      return `${i + 1}. ${p.marathiName || p.name} (इ. ${p.std} वी) - DOB: ${dobStr} | वय: ${p.ageVal?.ageYears || '-'} वर्षे ${statusBadge}`;
    }).join('\n');

    const msg = `*${schoolName}*\n*शालेय क्रीडा संघ वय पात्रता पडताळणी तक्ता (Eligibility Roster)*\n\n*क्रीडा प्रकार:* ${selectedSport}\n*कट-ऑफ तारीख:* ३१ डिसेंबर ${refYear} (DSO Standard)\n*क्रीडा शिक्षक:* ${teacherName}\n*एकूण खेळाडू:* ${filteredPlayers.length} (पात्र: ${stats.totalEligible} | वयाधिक: ${stats.overage})\n------------------------------\n*खेळाडू यादी:*\n${playerListText}\n------------------------------\nवाघंबा स्पोर्ट्स हब डिजिटल प्रणाली`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handlePrintDSO = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const rows = filteredPlayers.map((p: any, idx: number) => {
      const ageStr = p.ageVal ? `${p.ageVal.ageYears} Y, ${p.ageVal.ageMonths} M` : '-';
      const statusColor = p.ageVal?.eligible ? '#15803d' : '#b91c1c';
      const statusLabel = p.ageVal?.eligible 
        ? `${p.ageVal.category}` 
        : `⚠️ ${p.ageVal?.category || 'Ineligible'}`;

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td>
            <strong>${p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name}</strong>
            <div style="font-size: 8.5px; color: #475569;">${p.name}</div>
          </td>
          <td style="text-align: center; font-weight: bold;">${p.std || '-'} वी</td>
          <td style="text-align: center;">${p.generalRegisterNumber || p.serialNumber || '-'}</td>
          <td style="text-align: center; font-weight: 700;">${p.dob || '-'}</td>
          <td style="text-align: center; font-weight: bold;">${ageStr}</td>
          <td style="text-align: center;">${p.aadharNumber || '-'}</td>
          <td style="text-align: center; font-weight: 800; color: ${statusColor};">${statusLabel}</td>
          <td style="text-align: center; width: 45px; height: 45px; border: 1px dashed #94a3b8;">
            ${p.photoUrl ? `<img src="${p.photoUrl}" style="max-height: 40px; max-width: 40px; object-fit: cover;" />` : '<span style="font-size: 7px; color: #94a3b8;">फोटो / Photo</span>'}
          </td>
          <td style="width: 60px; height: 35px;"></td>
        </tr>
      `;
    }).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DSO Eligibility Roster - ${selectedSport} (${refYear})</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print { 
              @page { size: A4 landscape; margin: 0.6cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 10px; color: #0f172a; line-height: 1.25; font-size: 10px; background: #f8fafc; }
            .paper { max-width: 1100px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 15px; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .header-table td { border: none; padding: 2px 6px; }
            
            .school-title { font-size: 16px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 12px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 11.5px; font-weight: 900; padding: 5px; border-radius: 4px; margin: 6px 0 10px 0; text-transform: uppercase; }
            
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
            table.data-table th, table.data-table td { border: 1px solid #64748b; padding: 4px 5px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; text-align: center; }
            
            .footer-sign { display: flex; justify-content: space-between; margin-top: 25px; padding: 0 20px; font-size: 10px; font-weight: 800; }
            .sign-box { text-align: center; min-width: 180px; }
            .sign-box img { max-height: 40px; margin-bottom: 4px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 50px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत DSO पात्रता तक्ता प्रिंट करा (Print A4)</button>
          </div>
          
          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 55px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन - आदिवासी विकास विभाग / शालेय शिक्षण व क्रीडा विभाग</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 50px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              जिल्हा क्रीडा परिषद (DSO) स्पर्धा - खेळाडू अधिकृत वय पात्रता प्रमाणपत्र तक्ता (सन ${refYear}-${refYear + 1})
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 800; font-size: 9.5px; background: #e2e8f0; padding: 4px 8px; border-radius: 3px;">
              <div>खेळ: <span style="color: #1e3a8a;">${selectedSport === 'All' ? 'सर्व खेळ (All Games)' : selectedSport}</span></div>
              <div>वय गणना कट-ऑफ तारीख: <span style="color: #1e3a8a;">३१ डिसेंबर ${refYear}</span></div>
              <div>गट: <span style="color: #1e3a8a;">${selectedCategoryFilter} (${selectedGenderFilter})</span></div>
              <div>एकूण खेळाडू: <span style="color: #1e3a8a;">${filteredPlayers.length}</span> (पात्र: ${stats.totalEligible})</div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px;">अ.क्र.</th>
                  <th>खेळाडूचे संपूर्ण नाव (मराठी / इंग्रजी)</th>
                  <th style="width: 45px;">इयत्ता</th>
                  <th style="width: 60px;">जनरल रजि. नं. (G.R.)</th>
                  <th style="width: 70px;">जन्म तारीख (DOB)</th>
                  <th style="width: 85px;">वय (३१/१२/${refYear} रोजी)</th>
                  <th style="width: 85px;">आधार क्रमांक</th>
                  <th style="width: 95px;">वय पात्रता स्थिती</th>
                  <th style="width: 45px;">फोटो</th>
                  <th style="width: 60px;">खेळाडू स्वाक्षरी</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="footer-sign">
              <div class="sign-box">
                <br/><br/>
                <div>तयार केले (क्रीडा शिक्षक स्वाक्षरी)</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-box" style="border: 1px dashed #94a3b8; padding: 8px 15px; border-radius: 4px;">
                <div style="font-size: 8.5px; color: #64748b;">शाळेचा अधिकृत शिक्का</div>
                <div style="height: 30px;"></div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>मुख्याध्यापक / प्राचार्य स्वाक्षरी व शिक्का</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">${schoolName}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-blue-800/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                DSO / SGFI Standard Rule
              </Badge>
              <Badge variant="outline" className="text-blue-200 border-blue-400/30 text-xs">
                Cut-off: 31st December
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
              शालेय संघ वय पात्रता रोस्टर (Eligibility Roster)
            </h2>
            <p className="text-xs md:text-sm text-blue-200/90 font-medium max-w-2xl">
              शैक्षणिक वर्षाच्या ३१ डिसेंबरनुसार खेळाडूंचे अचूक वय मोजून U-14, U-17, U-19 स्पर्धांसाठी स्वयंचलित पात्रता निश्चित करा.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none shadow-md gap-2 h-11 px-5"
            >
              <Share2 className="w-4 h-4" /> WhatsApp तक्ता पाठवा
            </Button>
            <Button
              onClick={handlePrintDSO}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-6 border border-amber-300"
            >
              <Printer className="w-4 h-4" /> DSO अधिकृत यादी प्रिंट (A4)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="rounded-2xl border-2 border-primary/10 shadow-sm p-4 bg-white hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">एकूण खेळाडू</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-primary mt-2">{stats.total}</p>
          <span className="text-[10px] text-muted-foreground font-semibold">खेळ: {selectedSport}</span>
        </Card>

        <Card 
          onClick={() => setSelectedCategoryFilter('U14')}
          className={cn(
            "rounded-2xl border-2 shadow-sm p-4 cursor-pointer transition-all bg-emerald-50/50 hover:bg-emerald-50",
            selectedCategoryFilter === 'U14' ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-emerald-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">U-14 पात्र</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{stats.u14}</p>
          <span className="text-[10px] text-emerald-600 font-bold">१४ वर्षांखालील</span>
        </Card>

        <Card 
          onClick={() => setSelectedCategoryFilter('U17')}
          className={cn(
            "rounded-2xl border-2 shadow-sm p-4 cursor-pointer transition-all bg-blue-50/50 hover:bg-blue-50",
            selectedCategoryFilter === 'U17' ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-blue-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">U-17 पात्र</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{stats.u17}</p>
          <span className="text-[10px] text-blue-600 font-bold">१७ वर्षांखालील</span>
        </Card>

        <Card 
          onClick={() => setSelectedCategoryFilter('U19')}
          className={cn(
            "rounded-2xl border-2 shadow-sm p-4 cursor-pointer transition-all bg-purple-50/50 hover:bg-purple-50",
            selectedCategoryFilter === 'U19' ? 'border-purple-600 ring-2 ring-purple-600/30' : 'border-purple-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider">U-19 पात्र</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">{stats.u19}</p>
          <span className="text-[10px] text-purple-600 font-bold">१९ वर्षांखालील</span>
        </Card>

        <Card 
          onClick={() => setSelectedCategoryFilter('Overage')}
          className={cn(
            "rounded-2xl border-2 shadow-sm p-4 cursor-pointer transition-all bg-rose-50/50 hover:bg-rose-50",
            selectedCategoryFilter === 'Overage' ? 'border-rose-600 ring-2 ring-rose-600/30' : 'border-rose-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">वयाधिक (Overage)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{stats.overage}</p>
          <span className="text-[10px] text-rose-600 font-bold">⚠️ अपात्र (&gt;१९ वर्षे)</span>
        </Card>

        <Card 
          onClick={() => setSelectedCategoryFilter('All')}
          className={cn(
            "rounded-2xl border-2 shadow-sm p-4 cursor-pointer transition-all bg-slate-50 hover:bg-slate-100",
            selectedCategoryFilter === 'All' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">सर्व गट</span>
            <Filter className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{filteredPlayers.length}</p>
          <span className="text-[10px] text-muted-foreground font-semibold">फिल्टर रीसेट</span>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Academic Year Cut-Off */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> कट-ऑफ वर्ष (Cut-Off Date)
            </label>
            <Select value={refYear.toString()} onValueChange={(val) => setRefYear(parseInt(val, 10))}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="वर्ष निवडा" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map(ay => (
                  <SelectItem key={ay.year} value={ay.year.toString()} className="font-bold text-xs">
                    {ay.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sport Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> क्रीडा प्रकार (Sport)
            </label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="खेळ निवडा" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(sport => (
                  <SelectItem key={sport} value={sport} className="font-bold text-xs">
                    {sport === 'All' ? 'सर्व क्रीडा प्रकार (All Sports)' : sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> पात्रता गट (Category)
            </label>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="गट निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold text-xs">सर्व गट (All)</SelectItem>
                <SelectItem value="Eligible" className="font-bold text-xs">🟢 सर्व पात्र खेळाडू (All Eligible)</SelectItem>
                <SelectItem value="U14" className="font-bold text-xs">U-14 (१४ वर्षांखालील)</SelectItem>
                <SelectItem value="U17" className="font-bold text-xs">U-17 (१७ वर्षांखालील)</SelectItem>
                <SelectItem value="U19" className="font-bold text-xs">U-19 (१९ वर्षांखालील)</SelectItem>
                <SelectItem value="Overage" className="font-bold text-xs">🔴 वयाधिक (Overage - अपात्र)</SelectItem>
                <SelectItem value="Underage" className="font-bold text-xs">🟡 कमी वयाचा (Underage)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> लिंग (Gender)
            </label>
            <Select value={selectedGenderFilter} onValueChange={setSelectedGenderFilter}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="लिंग निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold text-xs">मुले व मुली (All)</SelectItem>
                <SelectItem value="Male" className="font-bold text-xs">मुले (Boys)</SelectItem>
                <SelectItem value="Female" className="font-bold text-xs">मुली (Girls)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Query */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-500" /> शोधा (Search)
            </label>
            <div className="relative">
              <Input
                placeholder="नाव / G.R. / आधार..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-bold text-xs rounded-xl h-11 pl-9 border-2 border-primary/20"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            </div>
          </div>
        </div>
      </Card>

      {/* Roster Table Card */}
      <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-white overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div>
            <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              पात्रता पडताळणी तक्ता (Eligibility Table) - ३१/१२/{refYear}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">
              एकूण सापडलेले खेळाडू: <span className="text-primary font-black">{filteredPlayers.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-black text-xs px-3 py-1">
              कट-ऑफ: ३१ डिसेंबर {refYear}
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                <th className="py-3.5 px-4">खेळाडूचे नाव (Player Name)</th>
                <th className="py-3.5 px-4 text-center">इयत्ता / लिंग</th>
                <th className="py-3.5 px-4 text-center">G.R. नंबर</th>
                <th className="py-3.5 px-4 text-center">जन्म तारीख (DOB)</th>
                <th className="py-3.5 px-4 text-center">अचूक वय (३१/१२/{refYear})</th>
                <th className="py-3.5 px-4 text-center">क्रीडा प्रकार / पोझिशन</th>
                <th className="py-3.5 px-4 text-center">पात्रता स्थिती (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/40">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-bold">
                    निवडलेल्या फिल्टरनुसार कोणताही खेळाडू सापडला नाही.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player: any, idx: number) => {
                  const ageVal = player.ageVal;
                  const isEligible = ageVal?.eligible;
                  const isOverage = ageVal?.eligibilityType === 'Overage';
                  const isUnderage = ageVal?.eligibilityType === 'Underage';

                  return (
                    <tr 
                      key={player.id} 
                      className={cn(
                        "hover:bg-primary/5 transition-colors font-medium",
                        isOverage && "bg-rose-50/40",
                        isUnderage && "bg-amber-50/30"
                      )}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {player.marathiName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold">
                          {player.name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">इ. {player.std} वी</span>
                        <span className="text-[10px] block text-muted-foreground">
                          {player.gender === 'Female' ? 'मुली' : 'मुले'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                        {player.generalRegisterNumber || player.serialNumber || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {player.dob || (
                          <span className="text-rose-500 font-black">नोंद नाही</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {ageVal ? (
                          <div>
                            <span className="font-black text-slate-950 text-xs">
                              {ageVal.ageYears} वर्षे {ageVal.ageMonths} महिने
                            </span>
                            <span className="text-[9px] block text-muted-foreground font-semibold">
                              {ageVal.ageDays} दिवस
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(player.sports || []).slice(0, 2).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[9px] font-bold px-1.5 py-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        {player.currentPosition && player.currentPosition !== '-' && (
                          <span className="text-[9.5px] block font-bold text-indigo-700 mt-1">
                            📍 {player.currentPosition}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isEligible && (
                          <Badge className={cn(
                            "font-black text-[10px] px-3 py-1 shadow-sm uppercase tracking-wider",
                            ageVal.eligibilityType === 'U14' && "bg-emerald-600 text-white",
                            ageVal.eligibilityType === 'U17' && "bg-blue-600 text-white",
                            ageVal.eligibilityType === 'U19' && "bg-purple-600 text-white"
                          )}>
                            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                            {getLocalizedAgeCategory(ageVal.category, true)}
                          </Badge>
                        )}

                        {isOverage && (
                          <Badge className="bg-rose-600 text-white font-black text-[10px] px-3 py-1 shadow-sm uppercase tracking-wider animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1 inline" />
                            वयाधिक (Overage - {ageVal.ageYears}y)
                          </Badge>
                        )}

                        {isUnderage && (
                          <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 shadow-sm uppercase tracking-wider">
                            <Clock className="w-3 h-3 mr-1 inline" />
                            कमी वयाचा (Underage)
                          </Badge>
                        )}

                        {!ageVal && (
                          <Badge variant="outline" className="text-slate-500 text-[10px]">
                            DOB तपासा
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
