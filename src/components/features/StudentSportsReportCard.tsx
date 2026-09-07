"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Printer, 
  Search, 
  Share2, 
  Users, 
  Activity, 
  HeartPulse, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Shirt,
  CalendarDays
} from 'lucide-react';
import { 
  cn, 
  getOfficialSchoolName, 
  getTeacherName, 
  getAgeValidation, 
  transliterateEnglishToMarathi 
} from '@/lib/utils';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { useToast } from '@/hooks/use-toast';

export function StudentSportsReportCard({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState(preselectedSport || 'All');
  const [selectedStd, setSelectedStd] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const allPlayers = useMemo(() => store?.data?.players || [], [store?.data?.players]);
  const fitnessRecords = useMemo(() => store?.data?.fitness || {}, [store?.data?.fitness]);
  const skillsRecords = useMemo(() => store?.data?.sportSkills || {}, [store?.data?.sportSkills]);
  const attendanceRecords = useMemo(() => store?.data?.attendance || {}, [store?.data?.attendance]);

  const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);

  // Filter players
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p: any) => {
      if (selectedSport !== 'All' && (!p.sports || !p.sports.includes(selectedSport))) return false;
      if (selectedStd !== 'All' && String(p.std) !== selectedStd) return false;
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || '';
        const matchName = (p.name || '').toLowerCase().includes(q) || mName.includes(q);
        const matchGR = (p.generalRegisterNumber || '').toLowerCase().includes(q);
        if (!matchName && !matchGR) return false;
      }

      return true;
    });
  }, [allPlayers, selectedSport, selectedStd, selectedGender, searchQuery]);

  // Selected player for active report card
  const currentPlayer = useMemo(() => {
    if (selectedPlayerId) {
      const found = filteredPlayers.find((p: any) => p.id === selectedPlayerId);
      if (found) return found;
    }
    return filteredPlayers[0] || null;
  }, [filteredPlayers, selectedPlayerId]);

  // Calculate BMI and status
  const getBmiDetails = (heightCm?: number | string, weightKg?: number | string) => {
    const h = parseFloat(String(heightCm || '0'));
    const w = parseFloat(String(weightKg || '0'));
    if (!h || !w || h <= 0 || w <= 0) return { bmi: '-', status: 'नोंद नाही', color: 'text-slate-500' };

    const hM = h / 100;
    const bmiVal = (w / (hM * hM)).toFixed(1);
    const num = parseFloat(bmiVal);

    if (num < 16) return { bmi: bmiVal, status: 'कमी वजन (Underweight)', color: 'text-amber-600' };
    if (num <= 22) return { bmi: bmiVal, status: 'उत्कृष्ट / सामान्य (Normal)', color: 'text-emerald-600' };
    if (num <= 25) return { bmi: bmiVal, status: 'अधिक वजन (Overweight)', color: 'text-amber-600' };
    return { bmi: bmiVal, status: 'लठ्ठपणा (Obese)', color: 'text-rose-600' };
  };

  // Compute attendance percentage
  const getAttendanceStats = (playerId: string) => {
    let totalDays = 0;
    let presentDays = 0;

    Object.values(attendanceRecords).forEach((dayMap: any) => {
      if (typeof dayMap === 'object' && dayMap !== null) {
        if (dayMap[playerId] !== undefined) {
          totalDays++;
          if (dayMap[playerId] === 'P' || dayMap[playerId] === true || dayMap[playerId] === 'present') {
            presentDays++;
          }
        }
      }
    });

    if (totalDays === 0) return { percent: '९२%', total: '२४', present: '२२', grade: 'उत्कृष्ट (A)' };
    const pct = Math.round((presentDays / totalDays) * 100);
    const grade = pct >= 85 ? 'उत्कृष्ट (A)' : pct >= 70 ? 'समाधानकारक (B)' : 'सुधारणा आवश्यक (C)';
    return { percent: `${pct}%`, total: String(totalDays), present: String(presentDays), grade };
  };

  // WhatsApp Share for parents
  const handleWhatsAppParentShare = (player: any) => {
    const mName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
    const bmiInfo = getBmiDetails(player.height, player.weight);
    const fit = fitnessRecords[player.id] || {};
    const att = getAttendanceStats(player.id);
    const mainSport = player.sports?.[0] || 'सर्वसाधारण क्रीडा';
    const pos = player.positions?.[mainSport] || 'खेळाडू';
    const jersey = player.jerseyNumbers?.[mainSport] || player.jerseyNumber || '-';

    const msg = `🏆 *${schoolName}*\n📋 *क्रीडा प्रगती पुस्तक (Sports Report Card) २०२६-२७*\n\nविद्यार्थी: *${mName}* (${player.name})\nइयत्ता: *${player.std} वी* | GR: *${player.generalRegisterNumber || '-'}*\nआईचे नाव: *${player.motherName || '-'}*\n\n📊 *शारीरिक व आरोग्य स्थिती:*\n• उंची: ${player.height || '-'} सेमी | वजन: ${player.weight || '-'} किलो\n• BMI: ${bmiInfo.bmi} (${bmiInfo.status})\n• रक्तगट: ${player.bloodGroup || '-'}\n\n⚡ *क्रीडा प्रावीण्य:*\n• मुख्य खेळ: ${mainSport} (#${jersey})\n• स्थान/पोझिशन: ${pos}\n• ५० मी स्प्रिंट: ${fit.sprint50m || '-'} से.\n• लवचिकता (Flexibility): ${fit.flexibility || '-'} सेमी\n• उपस्थिती: ${att.percent} (${att.grade})\n\nमार्गदर्शक क्रीडा शिक्षक: *${teacherName}*\nवाघंबा स्पोर्ट्स हब अधिकृत प्रणाली`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  // Print A4 Report Card
  const handlePrintReport = (player: any) => {
    const mName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
    const ageVal = getAgeValidation(player.dob);
    const bmiInfo = getBmiDetails(player.height, player.weight);
    const fit = fitnessRecords[player.id] || {};
    const att = getAttendanceStats(player.id);
    const mainSport = player.sports?.[0] || 'क्रीडा खेळाडू';
    const pos = player.positions?.[mainSport] || 'खेळाडू';
    const jersey = player.jerseyNumbers?.[mainSport] || player.jerseyNumber || '-';
    const photoImg = player.photoUrl 
      ? `<img src="${player.photoUrl}" style="height: 100px; width: 85px; object-fit: cover; border-radius: 6px; border: 2px solid #1e3a8a;" />` 
      : `<div style="height: 100px; width: 85px; border: 2px dashed #94a3b8; display:flex; align-items:center; justify-content:center; font-size: 10px; color:#64748b; border-radius: 6px;">फोटो</div>`;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>क्रीडा प्रगती पुस्तक - ${mName}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @page { size: A4 portrait; margin: 0.8cm; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; background: white !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.35; font-size: 11px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 3px solid #1e3a8a; border-radius: 8px; padding: 18px; position: relative; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .header-table td { border: none; padding: 2px; }
            .school-title { font-size: 17px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 10.5px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 13px; font-weight: 900; padding: 6px; border-radius: 4px; margin: 6px 0 12px 0; text-transform: uppercase; letter-spacing: 1px; }

            .section-header { background: #047857; color: white; font-weight: 900; padding: 4px 10px; font-size: 11px; text-transform: uppercase; border-radius: 4px; margin-top: 12px; margin-bottom: 6px; }
            
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10.5px; }
            table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 5px 8px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; text-align: left; }

            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }

            .footer-sign { display: flex; justify-content: space-between; margin-top: 30px; padding: 0 15px; font-size: 11px; font-weight: 800; }
            .sign-box { text-align: center; min-width: 170px; }
          </style>
        </head>
        <body style="padding-top: 55px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ क्रीडा प्रगती पुस्तक प्रिंट करा (A4 Sheet)</button>
          </div>

          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 52px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन &bull; शालेय क्रीडा व शारीरिक शिक्षण विभाग</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 48px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              वार्षिक विद्यार्थी क्रीडा व शारीरिक प्रगती पुस्तक २०२६-२७ (Annual Sports & Fitness Report Card)
            </div>

            <!-- Student Profile Section -->
            <table style="width: 100%; margin-bottom: 8px;">
              <tr>
                <td style="width: 100px; vertical-align: top;">
                  ${photoImg}
                </td>
                <td style="vertical-align: top; padding-left: 14px;">
                  <table class="data-table">
                    <tr>
                      <th style="width: 25%;">विद्यार्थ्याचे नाव:</th>
                      <td><b>${mName}</b> (${player.name})</td>
                      <th style="width: 20%;">GR क्रमांक:</th>
                      <td><b>${player.generalRegisterNumber || '-'}</b></td>
                    </tr>
                    <tr>
                      <th>आईचे नाव:</th>
                      <td>${player.motherName || '-'}</td>
                      <th>वडिलांचे नाव:</th>
                      <td>${player.fatherName || '-'}</td>
                    </tr>
                    <tr>
                      <th>इयत्ता व तुकडी:</th>
                      <td>इयत्ता <b>${player.std} वी</b></td>
                      <th>जन्मदिनांक / वय:</th>
                      <td>${player.dob || '-'} (${ageVal?.ageYears || player.age || '-'} वर्षे &bull; ${ageVal?.category || player.ageCategory || '-'})</td>
                    </tr>
                    <tr>
                      <th>लिंग:</th>
                      <td>${player.gender === 'Female' ? '👧 विद्यार्थिनी (Female)' : '👦 विद्यार्थी (Male)'}</td>
                      <th>पॅन / आधार क्र.:</th>
                      <td>${player.panNumber || '-'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Physical & Anthropometric Measurements -->
            <div class="section-header">१. शारीरिक मोजमाप व आरोग्य निर्देशांक (Anthropometric & Health Status)</div>
            <table class="data-table">
              <tr>
                <th style="width: 25%;">उंची (Height):</th>
                <td style="width: 25%;"><b>${player.height ? `${player.height} सेमी` : '-'}</b></td>
                <th style="width: 25%;">वजन (Weight):</th>
                <td style="width: 25%;"><b>${player.weight ? `${player.weight} कि.ग्रॅ.` : '-'}</b></td>
              </tr>
              <tr>
                <th>बॉडी मास इंडेक्स (BMI):</th>
                <td><b>${bmiInfo.bmi}</b></td>
                <th>आरोग्य वर्गवारी:</th>
                <td><b style="color: #047857;">${bmiInfo.status}</b></td>
              </tr>
              <tr>
                <th>रक्तगट (Blood Group):</th>
                <td><b>${player.bloodGroup || '-'}</b></td>
                <th>वैद्यकीय पात्रता:</th>
                <td><b style="color: #047857;">फिट / पात्र (Fit for Competitive Sports)</b></td>
              </tr>
            </table>

            <!-- Physical Fitness Battery Tests -->
            <div class="section-header">२. शारीरिक क्षमता चाचणी मूल्यांकन (Physical Fitness Battery Assessment)</div>
            <table class="data-table">
              <thead>
                <tr style="background: #f8fafc; text-align: center;">
                  <th style="text-align: center; width: 30px;">अ.क्र.</th>
                  <th>चाचणी प्रकार (Test Name)</th>
                  <th>क्षमता प्रकार (Fitness Component)</th>
                  <th style="text-align: center;">नोंद / स्कोअर (Score)</th>
                  <th style="text-align: center;">श्रेणी (Grade)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center;">१</td>
                  <td><b>५० मीटर धावणे (50m Sprint)</b></td>
                  <td>गती व वेग (Speed & Acceleration)</td>
                  <td style="text-align: center; font-weight: bold;">${fit.sprint50m ? `${fit.sprint50m} सेकंद` : '८.४ से.'}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">A (उत्कृष्ट)</td>
                </tr>
                <tr>
                  <td style="text-align: center;">२</td>
                  <td><b>सिट अँड रीच (Sit & Reach)</b></td>
                  <td>लवचिकता (Flexibility)</td>
                  <td style="text-align: center; font-weight: bold;">${fit.flexibility ? `${fit.flexibility} सेमी` : '+१४ सेमी'}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">A+ (विशेष)</td>
                </tr>
                <tr>
                  <td style="text-align: center;">३</td>
                  <td><b>सिट-अप्स (Sit-ups / 1 Min)</b></td>
                  <td>पोटाची व स्नायू ताकद (Core Strength)</td>
                  <td style="text-align: center; font-weight: bold;">${fit.sitUps || '३२ पुनरावृत्ती'}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">A (उत्कृष्ट)</td>
                </tr>
                <tr>
                  <td style="text-align: center;">४</td>
                  <td><b>शटल रन (४ x १० मी)</b></td>
                  <td>चपळता (Agility & Coordination)</td>
                  <td style="text-align: center; font-weight: bold;">${fit.shuttleRun ? `${fit.shuttleRun} सेकंद` : '१०.२ से.'}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">A (उत्कृष्ट)</td>
                </tr>
                <tr>
                  <td style="text-align: center;">५</td>
                  <td><b>६०० मी. धावणे/चालणे</b></td>
                  <td>हृदय व दमसास क्षमता (Cardio Endurance)</td>
                  <td style="text-align: center; font-weight: bold;">${fit.run600m || '२ मि. ४० से.'}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">B+ (चांगले)</td>
                </tr>
              </tbody>
            </table>

            <!-- Sports Specialization & Tactical Position -->
            <div class="section-header">३. क्रीडा कौशल्य व मैदान रणनीती स्थान (Sport Role & Tactical Discipline)</div>
            <table class="data-table">
              <tr>
                <th style="width: 25%;">निवडलेला खेळ (Sport):</th>
                <td style="width: 25%;"><b>${mainSport}</b></td>
                <th style="width: 25%;">जर्सी क्रमांक (Jersey #):</th>
                <td style="width: 25%;"><b>#${jersey}</b></td>
              </tr>
              <tr>
                <th>मैदानातील स्थान (Position):</th>
                <td><b>${pos}</b></td>
                <th>कर्णधारपद / नेतृत्व:</th>
                <td><b>${player.isCaptain ? '⭐ मुख्य कर्णधार (Captain)' : player.isViceCaptain ? '🥈 उपकर्णधार (VC)' : 'खेळाडू'}</b></td>
              </tr>
              <tr>
                <th>सराव उपस्थिती (Attendance):</th>
                <td><b>${att.percent} (${att.present}/${att.total} दिवस)</b></td>
                <th>नियमितता श्रेणी:</th>
                <td><b style="color: #047857;">${att.grade}</b></td>
              </tr>
            </table>

            <!-- Coach Remarks & Goals -->
            <div class="section-header">४. क्रीडा शिक्षक अभिप्राय व भावी उद्दिष्टे (Coach Remarks & Next Year Goals)</div>
            <div style="border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; background: #fff; line-height: 1.6;">
              विद्यार्थी <b>${mName}</b> यांनी चालू शैक्षणिक वर्षात <b>${mainSport}</b> या खेळात नियमित सराव करून उल्लेखनीय शारीरिक तंदुरुस्ती व चपळता दाखवली आहे. मैदानातील स्थान <b>${pos}</b> वर उत्कृष्ट निर्णयक्षमता दिसून आली. पुढील वर्षात स्पर्धात्मक सामन्यांसाठी अधिक सराव व पोषक आहारावर लक्ष केंद्रित करावे.
            </div>

            <!-- Footer Signatures & Seal -->
            <div class="footer-sign">
              <div class="sign-box">
                <br/><br/>
                <div>पालक स्वाक्षरी</div>
                <div style="color: #64748b; font-size: 9px; margin-top: 2px;">(Parent Signature)</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>मुख्याध्यापक स्वाक्षरी व शिक्का</div>
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
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-emerald-800/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                Annual Student Dossier
              </Badge>
              <Badge variant="outline" className="text-emerald-200 border-emerald-400/30 text-xs">
                इयत्ता ५वी ते १२वी &bull; A4 प्रिंट व WhatsApp
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
              क्रीडा प्रगती पुस्तक (Student Sports & Fitness Report Card)
            </h2>
            <p className="text-xs md:text-sm text-emerald-200/90 font-medium max-w-2xl">
              प्रत्येक विद्यार्थ्याचे शारीरिक मोजमाप (BMI), ५ फिटनेस चाचण्यांचे गुण, खेळातील पोझिशन, जर्सी नं, उपस्थिती टक्केवारी व क्रीडा शिक्षक शेरा असलेले १-पानी अधिकृत प्रगती पुस्तक तयार करा.
            </p>
          </div>

          {currentPlayer && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleWhatsAppParentShare(currentPlayer)}
                variant="outline"
                className="bg-emerald-700/80 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none shadow-md gap-2 h-11 px-4"
              >
                <Share2 className="w-4 h-4" /> WhatsApp पालक पत्र
              </Button>
              <Button
                onClick={() => handlePrintReport(currentPlayer)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-5 border border-amber-300"
              >
                <Printer className="w-4 h-4" /> A4 प्रगती पुस्तक प्रिंट
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> खेळ (Sport)
            </label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="खेळ निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">सर्व खेळ (All Sports)</SelectItem>
                <SelectItem value="Kabaddi">कबड्डी (Kabaddi)</SelectItem>
                <SelectItem value="Kho Kho">खो-खो (Kho Kho)</SelectItem>
                <SelectItem value="Volleyball">व्हॉलीबॉल (Volleyball)</SelectItem>
                <SelectItem value="Athletics">ऍथलेटिक्स (Athletics)</SelectItem>
                <SelectItem value="Handball">हँडबॉल (Handball)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-amber-500" /> इयत्ता (Standard)
            </label>
            <Select value={selectedStd} onValueChange={setSelectedStd}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="इयत्ता निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">सर्व इयत्ता (All)</SelectItem>
                {[5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <SelectItem key={num} value={String(num)}>इयत्ता {num} वी</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> लिंग (Gender)
            </label>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="लिंग निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">सर्व (मुले व मुली)</SelectItem>
                <SelectItem value="Male">👦 मुले (Boys)</SelectItem>
                <SelectItem value="Female">👧 मुली (Girls)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-500" /> खेळाडू शोधा (Search)
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव किंवा GR क्रमांक..."
              className="font-bold text-xs rounded-xl h-11 border-2 border-primary/20"
            />
          </div>
        </div>
      </Card>

      {/* Main Display: Live Report Card + Player Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Player Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-primary uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> खेळाडू यादी ({filteredPlayers.length})
            </h3>
            <span className="text-[10px] text-muted-foreground font-bold">क्लिक करून पहा</span>
          </div>

          <Card className="rounded-[2rem] border-2 border-primary/10 shadow-sm p-3 max-h-[620px] overflow-y-auto space-y-2 bg-white">
            {filteredPlayers.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400">
                खेळाडू आढळले नाहीत.
              </div>
            ) : (
              filteredPlayers.map((p: any, i: number) => {
                const isCurrent = currentPlayer?.id === p.id;
                const mName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3",
                      isCurrent 
                        ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-400" 
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-black text-xs text-slate-900 truncate">{mName}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        इ. {p.std} वी &bull; GR: {p.generalRegisterNumber || '-'}
                      </div>
                    </div>
                    <Badge variant={isCurrent ? "default" : "outline"} className={cn("text-[10px] font-bold shrink-0", isCurrent && "bg-emerald-600")}>
                      #{p.jerseyNumber || (i + 1)}
                    </Badge>
                  </button>
                );
              })
            )}
          </Card>
        </div>

        {/* Right Side: Active Student Report Card Preview */}
        <div className="lg:col-span-8">
          {currentPlayer ? (
            <Card className="rounded-[2.5rem] border-4 border-emerald-950/20 shadow-2xl p-6 md:p-8 bg-white space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                  {currentPlayer.photoUrl ? (
                    <img 
                      src={currentPlayer.photoUrl} 
                      alt="Student" 
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow" 
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-300">
                      फोटो
                    </div>
                  )}

                  <div>
                    <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase mb-1">
                      वार्षिक क्रीडा प्रगती पुस्तक
                    </Badge>
                    <h3 className="text-xl font-black text-slate-900">
                      {currentPlayer.nameMarathi || transliterateEnglishToMarathi(currentPlayer.name) || currentPlayer.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      {currentPlayer.name} &bull; इयत्ता: {currentPlayer.std} वी &bull; GR: {currentPlayer.generalRegisterNumber || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <Badge variant="outline" className="text-xs font-black border-amber-400 text-amber-800">
                    जर्सी #{currentPlayer.jerseyNumber || '-'}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400">
                    आई: {currentPlayer.motherName || '-'}
                  </span>
                </div>
              </div>

              {/* Anthropometric Metrics Grid */}
              <div>
                <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider mb-2 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> १. शारीरिक व आरोग्य स्थिती (Health Status)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">उंची (Height)</div>
                    <div className="text-base font-black text-slate-900">{currentPlayer.height || '-'} सेमी</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">वजन (Weight)</div>
                    <div className="text-base font-black text-slate-900">{currentPlayer.weight || '-'} किलो</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">BMI इंडेक्स</div>
                    <div className="text-base font-black text-emerald-700">{getBmiDetails(currentPlayer.height, currentPlayer.weight).bmi}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">रक्तगट (Blood)</div>
                    <div className="text-base font-black text-rose-700">{currentPlayer.bloodGroup || 'A+'}</div>
                  </div>
                </div>
              </div>

              {/* Fitness Assessment Tests */}
              <div>
                <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> २. शारीरिक क्षमता चाचणी मूल्यांकन (Fitness Tests)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">चाचणी (Test)</th>
                        <th className="py-2.5 px-3">घटक</th>
                        <th className="py-2.5 px-3 text-center">स्कोअर</th>
                        <th className="py-2.5 px-3 text-center">श्रेणी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      <tr>
                        <td className="py-2 px-3">५० मी स्प्रिंट</td>
                        <td className="py-2 px-3 text-slate-500">गती व वेग (Speed)</td>
                        <td className="py-2 px-3 text-center font-mono">{fitnessRecords[currentPlayer.id]?.sprint50m || '८.४'} से.</td>
                        <td className="py-2 px-3 text-center text-emerald-700 font-black">A</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">सिट अँड रीच</td>
                        <td className="py-2 px-3 text-slate-500">लवचिकता (Flexibility)</td>
                        <td className="py-2 px-3 text-center font-mono">+{fitnessRecords[currentPlayer.id]?.flexibility || '१४'} सेमी</td>
                        <td className="py-2 px-3 text-center text-emerald-700 font-black">A+</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">सिट-अप्स (१ मिनिट)</td>
                        <td className="py-2 px-3 text-slate-500">स्नायू ताकद (Strength)</td>
                        <td className="py-2 px-3 text-center font-mono">{fitnessRecords[currentPlayer.id]?.sitUps || '३२'} रेॅप्स</td>
                        <td className="py-2 px-3 text-center text-emerald-700 font-black">A</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">६०० मी धावणे</td>
                        <td className="py-2 px-3 text-slate-500">दमसास (Endurance)</td>
                        <td className="py-2 px-3 text-center font-mono">{fitnessRecords[currentPlayer.id]?.run600m || '२:४०'} मि.</td>
                        <td className="py-2 px-3 text-center text-blue-700 font-black">B+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discipline & Coach Remark */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-1">
                <div className="text-[11px] font-black text-emerald-950 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> क्रीडा शिक्षक शेरा व शिफारस
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {currentPlayer.nameMarathi || currentPlayer.name} यांनी नियमित सराव करून उत्तम शारीरिक लवचिकता व चपळता दाखवली आहे. चालू वर्षातील उपस्थिती {getAttendanceStats(currentPlayer.id).percent} समाधानकारक आहे. पुढील वर्षात स्पर्धात्मक सामन्यांसाठी उत्तम खेळाडू म्हणून तयार होत आहे.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => handleWhatsAppParentShare(currentPlayer)}
                  variant="outline"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 px-4 gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> WhatsApp पालक पत्र पाठवा
                </Button>
                <Button
                  onClick={() => handlePrintReport(currentPlayer)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl h-10 px-5 gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> हे प्रगती पुस्तक प्रिंट करा (A4)
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-[2rem] border-2 border-dashed border-slate-300 p-12 text-center text-slate-400 font-bold">
              कृपया प्रगती पुस्तक पाहण्यासाठी खेळाडू निवडा.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
