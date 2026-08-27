"use client";

import React, { useMemo, useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Users, MessageSquare, Crown, Shield } from 'lucide-react';
import { cn, getAgeValidation, getOfficialSchoolName, getTeacherName, transliterateEnglishToMarathi } from '@/lib/utils';

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

export function Teams({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const players = store.data.players;
  const [selectedSport, setSelectedSport] = useState(preselectedSport || 'All');
  
  const getCategory = useCallback((p: any) => {
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'Age Pending';
    const gender = p.gender === 'Female' ? 'मुली (Girls)' : 'मुले (Boys)';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior (U19)`;
  }, []);

  const categories = useMemo(() => [
    'मुले (Boys) U14', 
    'मुले (Boys) U17', 
    'मुले (Boys) Senior (U19)', 
    'मुली (Girls) U14', 
    'मुली (Girls) U17', 
    'मुली (Girls) Senior (U19)', 
    'Age Pending'
  ], []);
  
  const groups = useMemo(() => {
    const map: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    players.forEach((p: any) => {
      if (preselectedSport && !p.sports?.includes(preselectedSport)) return;
      const cat = getCategory(p);
      if (map[cat]) map[cat].push(p);
    });
    return map;
  }, [players, preselectedSport, categories, getCategory]);

  const handleWhatsAppTeamShare = (cat: string, squad: any[]) => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    const playerListText = squad.map((p: any, i: number) => {
      const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
      const isCapt = p.isCaptain || (p.positions?.[preselectedSport || ''] && p.positions[preselectedSport || ''].toLowerCase().includes('captain'));
      const isVC = p.isViceCaptain || (p.positions?.[preselectedSport || ''] && p.positions[preselectedSport || ''].toLowerCase().includes('vice'));
      const role = isCapt ? ' (⭐ कर्णधार - Captain)' : isVC ? ' (🥈 उपकर्णधार - VC)' : '';
      return `${i + 1}. ${displayName} (इयत्ता ${p.std} वी)${role}`;
    }).join('\n');

    const msg = `*${schoolName}*\n*अधिकृत शालेय क्रीडा संघ निवड (Official Squad Roster)*\n\n*क्रीडा प्रकार:* ${preselectedSport || 'सर्व खेळ'}\n*वयोगट वर्ग:* ${cat}\n*क्रीडा शिक्षक:* ${teacherName}\n------------------------------\n*निवडलेले खेळाडू (${squad.length}):*\n${playerListText}\n------------------------------\nवाघंबा स्पोर्ट्स हब डिजिटल प्रणाली`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handlePrint = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);
    const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Squad Rosters - ${preselectedSport || 'All Games'}</title>
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
            
            .letterhead { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
            .govt-title { font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; }
            .school-title { font-size: 18px; font-weight: 900; color: #1e3a8a; margin: 2px 0; }
            .meta-row { display: flex; justify-content: center; gap: 24px; font-size: 10.5px; font-weight: 800; color: #334155; margin-top: 2px; }
            .dispatch-row { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 800; color: #0f172a; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1; }
            
            .form-heading { text-align: center; font-size: 13px; font-weight: 900; color: #ffffff; background: #1e3a8a; padding: 6px 12px; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
            th, td { border: 1px solid #94a3b8; padding: 5px 6px; }
            th { background: #f1f5f9; font-weight: 900; color: #1e3a8a; text-align: left; }
            
            h2 { font-size: 11.5px; font-weight: 900; color: #1e3a8a; margin: 10px 0 4px 0; text-transform: uppercase; border-left: 3.5px solid #1e3a8a; padding-left: 6px; }
            
            .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; padding-top: 8px; }
            .sign-block { text-align: center; font-size: 10.5px; font-weight: 800; color: #0f172a; }
            .sign-block img { height: 38px; object-fit: contain; margin-bottom: 2px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: 900; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.15); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (CLOSE)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत संघ यादी प्रिंट करा (PRINT SQUAD)</button>
          </div>
          <div class="paper">
            <div class="letterhead">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="width: 70px; text-align: left;"><img src="${TRIBAL_DEV_LOGO_B64}" alt="Adivasi Vikas Logo" style="width: 65px; height: 65px; object-fit: contain;" /></div>
                <div style="flex: 1; text-align: center;">
                  <div class="govt-title">महाराष्ट्र शासन</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="meta-row"><span>SSC Index No – 13.12.058</span><span>Udise No.- 27200116503</span></div>
                </div>
                <div style="width: 70px; text-align: right;"><img src="${AMRIT_MAHOTSAV_LOGO_B64}" alt="Amrit Mahotsav Logo" style="width: 65px; height: 65px; object-fit: contain;" /></div>
              </div>
              <div class="dispatch-row"><span>जा.क्र. ________ /२०२६ वाघंबा</span><span>दिनांक: ____/____/२०२६</span></div>
            </div>
            <div class="form-heading">अधिकृत खेळाडू संघ निवड यादी (OFFICIAL TOURNAMENT SQUAD ROSTER - ${preselectedSport?.toUpperCase() || 'ALL SPORTS'})</div>
            ${categories.map(cat => groups[cat].length > 0 ? `
              <h2>${cat} (एकूण ${groups[cat].length} खेळाडू)</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 28px;">अ.क्र.</th>
                    <th style="width: 65px;">G.R. NO.</th>
                    <th>खेळाडूचे नाव (PLAYER NAME)</th>
                    <th style="width: 50px;">इयत्ता</th>
                    <th style="width: 50px;">वय</th>
                    <th style="width: 80px;">भूमिका (Role)</th>
                  </tr>
                </thead>
                <tbody>
                  ${groups[cat].map((p, idx) => {
                    const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                    const roleBadge = idx === 0 ? '⭐ Captain (C)' : idx === 1 ? '🥈 Vice-Captain' : 'Player';
                    return `
                      <tr>
                        <td style="text-align: center;"><strong>${idx + 1}</strong></td>
                        <td style="text-align: center;"><strong>${p.generalRegisterNumber || '---'}</strong></td>
                        <td><strong>${displayName}</strong> (${p.name})</td>
                        <td style="text-align: center;">इयत्ता ${p.std} वी</td>
                        <td style="text-align: center;">${p.age} वर्षे</td>
                        <td style="text-align: center; font-weight: 800;">${roleBadge}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '').join('')}
            <div class="sign-grid">
              <div class="sign-block">
                <img src="${signatureSrc}" alt="Teacher Signature" />
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="font-size: 9.5px; color: #64748b;">(${teacherName})</div>
              </div>
              <div class="sign-block">
                <div style="height: 38px;"></div>
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">मुख्याध्यापक सही व शिक्का</div>
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                अधिकृत शालेय संघ निवड व रोस्टर (Official Tournament Teams)
              </h2>
              <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">DSO & SGFI</Badge>
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> U14 / U17 / U19 Squad Rosters &bull; Captain Badges &bull; A4 Tournament Sheet
            </p>
          </div>
        </div>
        <Button 
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider h-12 px-6 rounded-2xl shadow-xl flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> अधिकृत संघ यादी प्रिंट करा
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => groups[cat].length > 0 ? (
          <Card key={cat} className="border-2 border-slate-200 shadow-xl rounded-[2.5rem] overflow-hidden hover:border-primary transition-all bg-white flex flex-col justify-between">
            <CardHeader className="bg-slate-50 border-b p-6 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" /> {cat}
                </CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5 block">{preselectedSport || 'All Sports'} Roster</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                  {groups[cat].length} खेळाडू
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleWhatsAppTeamShare(cat, groups[cat])}
                  className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                  title="WhatsApp वर संघ शेअर करा"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="max-h-[360px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/80 sticky top-0 border-b">
                    <tr className="text-left font-black text-slate-700 uppercase text-[10px]">
                      <th className="p-3.5 pl-5">खेळाडूचे नाव</th>
                      <th className="p-3.5 text-center">इयत्ता</th>
                      <th className="p-3.5 text-center">वय</th>
                      <th className="p-3.5 text-right pr-5">भूमिका / रेटिंग</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groups[cat].map((p, i) => {
                      const skill = store.data.sportSkills?.[`${p.id}_${preselectedSport || p.sports?.[0]}`];
                      const ageVal = getAgeValidation(p.dob);
                      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
                      const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                      return (
                        <tr key={p.id} className={cn("hover:bg-slate-50/80 transition-colors", i === 0 && "bg-amber-50/40")}>
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-2">
                              {p.isCaptain || (p.positions?.[preselectedSport || ''] && p.positions[preselectedSport || ''].toLowerCase().includes('captain')) ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase shadow-xs">C</span>
                              ) : p.isViceCaptain || (p.positions?.[preselectedSport || ''] && p.positions[preselectedSport || ''].toLowerCase().includes('vice')) ? (
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-black text-[9px] uppercase">VC</span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">#{i + 1}</span>
                              )}
                              <div>
                                <p className="font-black text-slate-900 uppercase text-xs leading-none">{displayName}</p>
                                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 block">{p.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-600">Std {p.std}</td>
                          <td className="p-3.5 text-center font-black text-slate-700">{age <= 0 ? "Pending" : `${age}y`}</td>
                          <td className="p-3.5 text-right pr-5">
                            <Badge variant="outline" className="font-black text-[9px] uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                              {skill?.score ? `${skill.score}%` : '85% (Ready)'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null)}
      </div>
    </div>
  );
}
