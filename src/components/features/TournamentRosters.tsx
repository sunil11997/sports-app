"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Medal, Shirt, Target, FileText, Trophy, Hash, Star } from 'lucide-react';
import { getAgeValidation, getOfficialSchoolName, getTeacherName, sanitizeGrNumber } from '@/lib/utils';
import { 
  OfficialTournamentSheetModal, 
  ATHLETICS_CORE_SIX, 
  isAthleticsSixSport,
  getPlayerSkillMarksAndRank,
  getPlayerGameActivity,
  SPORT_MARATHI_MAP
} from './OfficialTournamentSheetModal';

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';
import { WAGHAMBA_STUDENTS_DATA } from '@/data/waghambaStudents';

const SPORTS_LIST = [
  'Kabaddi',
  'Volleyball',
  'Kho Kho',
  'Handball',
  'Javelin Throw',
  'Disc Throw',
  'Shot Put',
  'Running',
  'Long Jump',
  'High Jump',
  'Athletics',
  'Yoga',
  'PT Mass'
];

export function TournamentRosters({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const [selectedSport, setSelectedSport] = useState(preselectedSport || SPORTS_LIST[0]);
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('Girls U14');
  const [modalPlayers, setModalPlayers] = useState<any[]>([]);

  // Local state for custom Sr No per player
  const [customSrNumbers, setCustomSrNumbers] = useState<Record<string, string>>({});

  const handleOpenOfficialSheet = (category?: string, playersList?: any[]) => {
    setModalCategory(category || 'Girls U14');
    const fallbackList = (store?.data?.players && store.data.players.length > 0)
      ? store.data.players
      : WAGHAMBA_STUDENTS_DATA;
    const baseList = (playersList && playersList.length > 0) ? playersList : fallbackList;
    const playersWithCustomSr = baseList.map((p: any, idx: number) => ({
      ...p,
      srNo: customSrNumbers[p.id] || String(idx + 1)
    }));
    setModalPlayers(playersWithCustomSr);
    setIsOfficialModalOpen(true);
  };

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const isAthletics = isAthleticsSixSport(selectedSport);

  const getCategory = useCallback((p: any) => {
    const ageVal = getAgeValidation(p.dob);
    let age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);

    // Fallback: If exact DOB was unparseable, infer standard-based category
    // (In Maharashtra school sports: Std 1-7 is U14, Std 8-10 is U17, Std 11-12 is Senior)
    if (!age || age <= 0 || isNaN(age)) {
      const stdNum = parseInt(String(p.std || '').replace(/\D/g, ''), 10);
      if (stdNum > 0 && stdNum <= 7) age = 13;
      else if (stdNum >= 8 && stdNum <= 10) age = 16;
      else if (stdNum >= 11) age = 18;
    }

    if (!age || age <= 0 || isNaN(age)) return 'Age Pending';
    const gender = (p.gender === 'Female' || p.gender === 'female' || p.gender === 'F') ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  }, []);

  const categories = useMemo(() => ['Girls U14', 'Boys U14', 'Girls U17', 'Boys U17', 'Girls Senior', 'Boys Senior', 'Age Pending'], []);
  
  // Process groups:
  // USER REQUIREMENT: Show players who were given marks from Skill Hub, sorted strictly by their mark ranking!
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    const allPlayers: any[] = (store?.data?.players && store.data.players.length > 0)
      ? store.data.players
      : WAGHAMBA_STUDENTS_DATA;

    let playersInSport = allPlayers.filter((p: any) => {
      if (!p.sports) return false;
      if (Array.isArray(p.sports) && p.sports.includes(selectedSport)) return true;
      if (typeof p.sports === 'string' && p.sports.includes(selectedSport)) return true;
      if (isAthletics && ((Array.isArray(p.sports) && p.sports.includes('Athletics')) || p.category === 'athlete')) {
        return true;
      }
      return false;
    });

    // Fallback: If no player specifically assigned to this sport yet, include the full roster
    // so coaches can roster them, mark them, and print tournament sheets immediately!
    if (playersInSport.length === 0) {
      playersInSport = allPlayers;
    }

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillInfo = getPlayerSkillMarksAndRank(p, selectedSport, store);
        const fitnessData = store?.data?.fitness?.[p.id] || { score: '0' };
        const position = p.positions?.[selectedSport] || p.position || '-';
        const gameActivity = getPlayerGameActivity(p, selectedSport, store);
        const jersey = p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-';

        groups[cat].push({ 
          ...p, 
          skillScore: skillInfo.scoreDisplay,
          skillScoreNum: skillInfo.score,
          hasSkillMark: skillInfo.hasMark,
          fitnessScore: fitnessData.score || '0',
          jersey,
          position,
          gameActivity
        });
      }
    });

    // Filter and Sort by Skill Hub Mark Ranking
    Object.keys(groups).forEach(cat => {
      let list = groups[cat];
      const withMarks = list.filter(p => p.hasSkillMark);

      // If players have marks from Skill Hub, prioritize those players
      // Otherwise fallback to full list so list is not totally empty
      const finalList = withMarks.length > 0 ? withMarks : list;

      // Sort strictly by Skill Hub marks ranking (highest score first)
      finalList.sort((a, b) => b.skillScoreNum - a.skillScoreNum);

      groups[cat] = finalList.map((p, idx) => ({
        ...p,
        markRank: idx + 1
      }));
    });

    return groups;
  }, [selectedSport, store, categories, getCategory, isAthletics]);

  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category];
    const topTwelve = groupPlayers.slice(0, 12);
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);
    const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;
    const sportLabelMr = SPORT_MARATHI_MAP[selectedSport] || selectedSport;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournament Entry - ${selectedSport} - ${category}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print { 
              @page { size: A4 portrait; margin: 0.8cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
              .paper { border: none !important; box-shadow: none !important; padding: 0 !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.35; font-size: 11px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
            
            .letterhead {
              text-align: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .govt-title { font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; }
            .school-title { font-size: 18px; font-weight: 900; color: #1e3a8a; margin: 2px 0; }
            .meta-row { display: flex; justify-content: center; gap: 24px; font-size: 10.5px; font-weight: 800; color: #334155; margin-top: 2px; }
            .dispatch-row { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 800; color: #0f172a; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1; }
            
            .form-heading {
              text-align: center;
              font-size: 13px;
              font-weight: 900;
              color: #ffffff;
              background: #1e3a8a;
              padding: 6px 12px;
              border-radius: 4px;
              margin: 10px 0;
              letter-spacing: 0.5px;
            }

            .info-bar {
              display: flex;
              justify-content: space-between;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 6px 12px;
              border-radius: 5px;
              font-weight: 800;
              font-size: 11px;
              margin-bottom: 12px;
            }

            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 20px; }
            th, td { border: 1px solid #94a3b8; padding: 5px 6px; text-align: left; vertical-align: middle; }
            th { background-color: #f1f5f9; font-weight: 900; text-transform: uppercase; font-size: 9.5px; color: #1e293b; text-align: center; }
            td.center { text-align: center; }

            .sign-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 30px;
              padding: 0 10px;
            }
            .sign-block { text-align: center; width: 220px; font-size: 10.5px; font-weight: 800; }
            .sign-block img { height: 38px; max-width: 150px; object-fit: contain; margin-bottom: 2px; }

            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 8px 18px; border-radius: 6px; font-weight: 800; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 70px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (CLOSE)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (PRINT TOURNAMENT SHEET)</button>
          </div>

          <div class="paper">
            <!-- OFFICIAL LETTERHEAD -->
            <div class="letterhead">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="width: 80px; text-align: left;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" alt="Adivasi Vikas Logo" style="width: 75px; height: 75px; object-fit: contain;" />
                </div>
                <div style="flex: 1; text-align: center;">
                  <div class="govt-title">महाराष्ट्र शासन</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="meta-row">
                    <span>SSC Index No – 13.12.058</span>
                    <span>Udise No.- 27200116503</span>
                  </div>
                  <div style="font-size: 10px; font-weight: 700; color: #475569; margin-top: 2px;">
                    Email id – govt.waghamba2020@gmail.com
                  </div>
                </div>
                <div style="width: 80px; text-align: right;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" alt="Amrit Mahotsav Logo" style="width: 75px; height: 75px; object-fit: contain;" />
                </div>
              </div>
              <div class="dispatch-row">
                <span>जा.क्र. ________ /२०२६ वाघंबा</span>
                <span>दिनांक: ____/____/२०२६</span>
              </div>
            </div>

            <!-- PROJECT & SCHOOL INFO -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 10px; margin-bottom: 8px; font-size: 10px; font-weight: 800; line-height: 1.45;">
              <div>• <strong>प्रकल्पाचे नाव:</strong> एकात्मिक आदिवासी विकास प्रकल्प कळवण, ता. कळवण, जि. नाशिक</div>
              <div>• <strong>शाळेचे पूर्ण नाव व पत्ता:</strong> ${schoolName}</div>
              <div>• <strong>दूरध्वनी क्रमांक:</strong> ०२५५५-२९९०१५ / ९४२०४५८२४६</div>
            </div>

            <!-- FORM HEADING -->
            <div class="form-heading">
              शालेय क्रीडा स्पर्धा संघ प्रवेश पत्र (OFFICIAL TOURNAMENT SQUAD ENTRY FORM)
            </div>

            <div class="info-bar">
              <span>🏆 खेळ: <strong>${sportLabelMr.toUpperCase()} (${selectedSport.toUpperCase()})</strong></span>
              <span>🎯 वयोगट: <strong>${category.toUpperCase()}</strong></span>
              <span>👥 खेळाडू संख्या: <strong>${topTwelve.length} Athletes</strong></span>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 38px;">अ.क्र</th>
                  <th style="width: 50px;">जर्सी नं.</th>
                  <th style="width: 70px;">G.R. NO.</th>
                  <th>खेळाडूचे नाव (PLAYER NAME)</th>
                  <th style="width: 55px;">इयत्ता</th>
                  <th style="width: 85px;">जन्म तारीख</th>
                  <th style="width: 110px;">आधार क्रमांक</th>
                  <th style="width: 70px;">सही</th>
                </tr>
              </thead>
              <tbody>
                ${topTwelve.map((p, i) => {
                  const displayName = p.nameMarathi && p.nameMarathi.trim() ? p.nameMarathi.trim() : p.name;
                  const jersey = p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-';
                  const srNo = customSrNumbers[p.id] || String(i + 1);
                  
                  return `
                  <tr>
                    <td class="center"><strong>${srNo}</strong></td>
                    <td class="center" style="font-weight: 900; color: #1e3a8a; background: #f8fafc;">#${jersey}</td>
                    <td class="center"><strong>${sanitizeGrNumber(p.generalRegisterNumber, p.serialNumber || '---')}</strong></td>
                    <td><strong>${displayName}</strong></td>
                    <td class="center"><strong>${p.std} वी</strong></td>
                    <td class="center">${p.dob || (getAgeValidation(p.dob)?.ageYears || p.age || '---')}</td>
                    <td class="center">${p.aadharNumber || '---'}</td>
                    <td></td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>

            <!-- SIGNATURE BLOCKS -->
            <div class="sign-grid">
              <div class="sign-block">
                <img src="${signatureSrc}" alt="Teacher Signature" />
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="font-size: 9.5px; color: #64748b;">(${teacherName})</div>
              </div>
              <div class="sign-block">
                <div style="height: 38px;"></div>
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">मुख्याध्यापक सही व शिक्का</div>
                <div style="font-size: 9.5px; color: #64748b;">(शासकीय माध्यमिक आश्रम शाळा वाघंबा)</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-6">
      {!preselectedSport && (
        <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
              <Medal className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Tournament Selection</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Skill Hub गुण रँकिंग व अधिकृत स्पर्धा प्रवेश पत्र
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black border-2 border-emerald-600/30 rounded-xl h-8 gap-1.5 shadow-sm"
                  onClick={() => {
                    const el = document.querySelector('[data-value="jersey"]') as HTMLElement || document.querySelector('[value="jersey"]') as HTMLElement;
                    if (el) el.click();
                  }}
                >
                  <Shirt className="w-3.5 h-3.5 text-emerald-600" />
                  🎽 जर्सी व पोझिशन (Jersey & Positions)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                  onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                  📋 अधिकृत स्पर्धा शीट (Official Sheet)
                </Button>

                {isAthletics && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black border-none rounded-xl h-8 gap-1.5 shadow-md"
                    onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
                  >
                    <Medal className="w-3.5 h-3.5 text-amber-300" />
                    🏃 सर्व ६ मैदानी खेळ एकत्र शीट
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Discipline</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(sport => (
                  <SelectItem key={sport} value={sport}>
                    {SPORT_MARATHI_MAP[sport] ? `${SPORT_MARATHI_MAP[sport]} (${sport})` : sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ATHLETICS BANNER WHEN ATHLETICS DISCIPLINE SELECTED */}
      {isAthletics && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 p-4 rounded-3xl border-2 border-emerald-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">
                मैदानी व धावणे स्पर्धा (Athletics Track & Field Meet)
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी व उंच उडी सर्व खेळाडू एकत्रित अधिकृत शीटवर प्रिंट करा
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleOpenOfficialSheet('Girls U14', store?.data?.players)}
            className="h-10 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2 shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            🏃 सर्व मैदानी खेळ एकत्रित शीट प्रिंट
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(cat => (
          <Card key={cat} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col min-h-[460px] max-h-[620px]">
            <div className="bg-muted/40 p-5 border-b flex justify-between items-center">
              <div>
                <span className="text-lg font-black uppercase text-primary">{cat}</span>
                <div className="text-[10px] text-muted-foreground font-bold">
                  Skill Hub गुण रँकिंगनुसार क्रमवारी
                </div>
              </div>
              <Badge className="bg-primary text-white font-black">{processedGroups[cat].length} ATHLETES</Badge>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4 overscroll-contain touch-pan-x touch-pan-y">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase w-16 text-center">अ.क्र.</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">खेळाडू (Athlete)</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">जर्सी</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">कौशल्य क्रिया</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center text-emerald-800">कौशल्य गुण</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center text-amber-700">रँक</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedGroups[cat].slice(0, 15).map((p, i) => {
                    const currentSr = customSrNumbers[p.id] || String(i + 1);

                    return (
                      <TableRow key={p.id} className={i < 12 ? 'bg-emerald-50/40 font-medium' : 'font-medium'}>
                        {/* Editable Sr No Input */}
                        <TableCell className="p-1 text-center">
                          <Input
                            value={currentSr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomSrNumbers(prev => ({ ...prev, [p.id]: val }));
                            }}
                            className="w-12 h-7 text-center font-bold text-xs bg-amber-50 border-amber-300 focus:bg-white px-1 mx-auto"
                            title="अ.क्र. थेट बदला"
                          />
                        </TableCell>
                        <TableCell className="text-xs font-bold max-w-[130px]">
                          <div className="font-black text-slate-900 truncate">
                            {(p.nameMarathi && p.nameMarathi.trim() ? p.nameMarathi.trim() : p.name)}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-normal">
                            इ.{p.std} &bull; GR: {sanitizeGrNumber(p.generalRegisterNumber, p.serialNumber || '-')}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-black text-center text-amber-700">
                          #{p.jersey}
                        </TableCell>
                        <TableCell className="text-[10px] font-semibold text-center text-blue-900 truncate max-w-[100px]" title={p.gameActivity || p.position}>
                          {p.gameActivity || p.position}
                        </TableCell>
                        <TableCell className="text-xs font-black text-center text-emerald-700">
                          {p.skillScore !== '-' ? p.skillScore : '-'}
                        </TableCell>
                        <TableCell className="text-center font-black text-amber-600 text-xs">
                          #{p.markRank}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 sm:p-5 border-t bg-muted/20 flex flex-col gap-2">
              <Button 
                onClick={() => handleOpenOfficialSheet(cat, processedGroups[cat])} 
                disabled={processedGroups[cat].length === 0} 
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> 📋 अधिकृत क्रीडा स्पर्धा शीट (Official Sheet)
              </Button>
              <Button 
                onClick={() => handlePrint(cat)} 
                disabled={processedGroups[cat].length === 0} 
                variant="outline" 
                className="w-full h-9 bg-white text-primary font-black uppercase text-xs tracking-widest border-2 shadow-sm rounded-xl"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Quick Squad List Print
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Official Tournament Sheet Modal */}
      <OfficialTournamentSheetModal
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        initialSport={selectedSport}
        initialCategory={modalCategory}
        initialPlayers={modalPlayers}
        store={store}
      />
    </div>
  );
}
