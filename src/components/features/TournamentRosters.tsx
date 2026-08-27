"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Medal } from 'lucide-react';
import { getAgeValidation, getOfficialSchoolName, getTeacherName } from '@/lib/utils';

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

const SPORTS_LIST = ['Yoga', 'PT Mass', 'Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Athletics'];

export function TournamentRosters({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const [selectedSport, setSelectedSport] = useState(preselectedSport || SPORTS_LIST[0]);

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const getCategory = useCallback((p: any) => {
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'Age Pending';
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  }, []);

  const categories = useMemo(() => ['Boys U14', 'Boys U17', 'Boys Senior', 'Girls U14', 'Girls U17', 'Girls Senior', 'Age Pending'], []);
  
  const processedGroups = useMemo(() => {
    const groups: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    const playersInSport = store.data.players.filter((p: any) => p.sports && p.sports.includes(selectedSport));

    playersInSport.forEach((p: any) => {
      const cat = getCategory(p);
      if (groups[cat]) {
        const skillData = store.data.sportSkills[`${p.id}_${selectedSport}`] || { score: '0' };
        const fitnessData = store.data.fitness[p.id] || { score: '0' };
        const rating = (parseFloat(skillData.score) * 0.7) + (parseFloat(fitnessData.score) * 0.3);
        groups[cat].push({ ...p, competencyRating: rating.toFixed(1) });
      }
    });

    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => parseFloat(b.competencyRating) - parseFloat(a.competencyRating));
    });

    return groups;
  }, [selectedSport, store.data.players, store.data.sportSkills, store.data.fitness, categories, getCategory]);

  const handlePrint = (category: string) => {
    const groupPlayers = processedGroups[category];
    const topTwelve = groupPlayers.slice(0, 12);
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);
    const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;

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
              font-size: 14px;
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
            th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #f1f5f9; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #1e293b; text-align: center; }
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

            <!-- PROJECT & SCHOOL INFO IN BOLD -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 10px; margin-bottom: 8px; font-size: 10.5px; font-weight: 800; line-height: 1.45;">
              <div>• <strong>प्रकल्पाचे नाव:</strong> एकात्मिक आदिवासी विकास प्रकल्प कळवण, ता. कळवण, जि. नाशिक</div>
              <div>• <strong>शाळेचे पूर्ण नाव व पत्ता:</strong> ${schoolName}</div>
              <div>• <strong>दूरध्वनी क्रमांक:</strong> ०२५५५-२९९०१५ / ९४२०४५८२४६</div>
            </div>

            <!-- FORM HEADING -->
            <div class="form-heading">
              शालेय क्रीडा स्पर्धा संघ प्रवेश पत्र (OFFICIAL TOURNAMENT SQUAD ENTRY FORM)
            </div>

            <div class="info-bar">
              <span>🏆 खेळाचा प्रकार: <strong>${selectedSport.toUpperCase()}</strong></span>
              <span>🎯 वयोगट: <strong>${category.toUpperCase()}</strong></span>
              <span>👥 खेळाडू संख्या: <strong>${topTwelve.length} Athletes</strong></span>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 30px;">अ.क्र</th>
                  <th style="width: 50px;">जर्सी नं.</th>
                  <th style="width: 70px;">G.R. NO.</th>
                  <th>खेळाडूचे नाव (PLAYER NAME)</th>
                  <th style="width: 45px;">इयत्ता</th>
                  <th style="width: 90px;">स्थान / पोझिशन</th>
                  <th style="width: 80px;">जन्म तारीख / वय</th>
                  <th style="width: 100px;">आधार क्रमांक</th>
                  <th style="width: 80px;">खेळाडू सही</th>
                </tr>
              </thead>
              <tbody>
                ${topTwelve.map((p, i) => {
                  const displayName = p.nameMarathi && p.nameMarathi.trim() ? p.nameMarathi.trim() : p.name;
                  const jersey = p.jerseyNumbers?.[selectedSport] || p.jerseyNumber || '-';
                  const position = p.positions?.[selectedSport] || '-';
                  return `
                  <tr>
                    <td class="center"><strong>${i + 1}</strong></td>
                    <td class="center" style="font-weight: 900; color: #1e3a8a; background: #f8fafc;">#${jersey}</td>
                    <td class="center"><strong>${p.generalRegisterNumber || '---'}</strong></td>
                    <td><strong>${displayName}</strong></td>
                    <td class="center"><strong>${p.std} वी</strong></td>
                    <td class="center">${position}</td>
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
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Institutional Squad Generation</p>
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2">Select Discipline</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-14 text-lg font-black bg-white rounded-2xl border-2 border-primary/20 shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{SPORTS_LIST.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(cat => (
          <Card key={cat} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl flex flex-col h-[500px]">
            <div className="bg-muted/40 p-6 border-b flex justify-between items-center">
              <span className="text-xl font-black uppercase text-primary">{cat}</span>
              <Badge className="bg-primary text-white font-black">{processedGroups[cat].length} ATHLETES</Badge>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">Athlete</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center">Age</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedGroups[cat].slice(0, 15).map((p, i) => {
                    const ageVal = getAgeValidation(p.dob);
                    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
                    return (
                      <TableRow key={p.id} className={i < 12 ? 'bg-emerald-50/30' : ''}>
                        <TableCell className="text-xs font-bold truncate max-w-[150px]">{(p.nameMarathi && p.nameMarathi.trim() ? p.nameMarathi.trim() : p.name).toUpperCase()}</TableCell>
                        <TableCell className="text-xs font-bold text-center">{age <= 0 ? "Pending" : age}</TableCell>
                        <TableCell className="text-center font-black text-primary">{p.competencyRating}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="p-6 border-t bg-muted/20">
              <Button onClick={() => handlePrint(cat)} disabled={processedGroups[cat].length === 0} className="w-full h-14 bg-white text-primary font-black uppercase text-xs tracking-widest border-2 shadow-sm rounded-2xl">
                <Printer className="w-5 h-5 mr-2" /> Print Official Squad List
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
