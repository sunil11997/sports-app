"use client";

import React, { useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import { cn, getAgeValidation, getOfficialSchoolName, getTeacherName } from '@/lib/utils';

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

export function Teams({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const players = store.data.players;
  
  const getCategory = useCallback((p: any) => {
    const ageVal = getAgeValidation(p.dob);
    const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
    if (!age || age <= 0 || isNaN(age)) return 'Age Pending';
    const gender = p.gender === 'Female' ? 'Girls' : 'Boys';
    if (age < 14) return `${gender} U14`;
    if (age < 17) return `${gender} U17`;
    return `${gender} Senior`;
  }, []);

  const categories = useMemo(() => ['Girls U14', 'Girls U17', 'Boys U14', 'Boys U17', 'Boys Senior', 'Girls Senior', 'Age Pending'], []);
  
  const groups = useMemo(() => {
    const map: Record<string, any[]> = categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
    players.forEach((p: any) => {
      if (preselectedSport && !p.sports?.includes(preselectedSport)) return;
      const cat = getCategory(p);
      if (map[cat]) map[cat].push(p);
    });
    return map;
  }, [players, preselectedSport, categories, getCategory]);

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

            h2 { margin-top: 20px; color: #1e3a8a; border-left: 4px solid #f59e0b; padding-left: 8px; text-transform: uppercase; font-size: 13px; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; }
            th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #f1f5f9; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #1e293b; }

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
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (PRINT TOURNAMENT SQUAD)</button>
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

            <!-- FORM HEADING -->
            <div class="form-heading">
              खेळाडू संघ यादी (OFFICIAL TOURNAMENT SQUAD ROSTER - ${preselectedSport?.toUpperCase() || 'ALL SPORTS'})
            </div>

            ${categories.map(cat => groups[cat].length > 0 ? `
              <h2>${cat} (${groups[cat].length} Players)</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 32px;">SR</th>
                    <th style="width: 75px;">G.R. NO.</th>
                    <th>PLAYER NAME</th>
                    <th style="width: 50px;">STD</th>
                    <th style="width: 60px;">AGE</th>
                    <th>SPORTS</th>
                  </tr>
                </thead>
                <tbody>
                  ${groups[cat].map((p, idx) => `
                    <tr>
                      <td style="text-align: center;"><strong>${idx + 1}</strong></td>
                      <td style="text-align: center;"><strong>${p.generalRegisterNumber || '---'}</strong></td>
                      <td><strong>${p.nameMarathi || p.name}</strong> (${p.name})</td>
                      <td style="text-align: center;">${p.std} वी</td>
                      <td style="text-align: center;">${p.age}</td>
                      <td>${(p.sports || []).join(', ')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '').join('')}

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
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
          {preselectedSport || 'All'} Category Teams
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold border-2" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Rosters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => groups[cat].length > 0 ? (
          <Card key={cat} className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden hover:border-accent transition-all">
            <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">
                {cat}
              </CardTitle>
              <Badge className="bg-accent text-accent-foreground font-black">
                {groups[cat].length} PLAYERS
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 sticky top-0">
                    <tr className="text-left font-bold text-primary">
                      <th className="p-3">Player Name</th>
                      <th className="p-3">Std</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Skill Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[cat].map((p, i) => {
                      const skill = store.data.sportSkills[`${p.id}_${preselectedSport || p.sports?.[0]}`];
                      const ageVal = getAgeValidation(p.dob);
                      const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
                      return (
                        <tr key={p.id} className={`border-b border-primary/5 ${i % 2 === 0 ? 'bg-white' : 'bg-primary/[0.02]'}`}>
                          <td className="p-3 font-bold text-foreground/80 uppercase">{p.name}</td>
                          <td className="p-3 text-muted-foreground">Std {p.std}</td>
                          <td className="p-3 font-bold text-foreground/75">{age <= 0 ? "Pending" : age}</td>
                          <td className="p-3 font-black text-primary">{skill?.score || '0'}%</td>
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
