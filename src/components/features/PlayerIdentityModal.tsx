"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Printer, X, FileText, CheckCircle2, User, Camera, ShieldCheck, Edit3 } from 'lucide-react';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';
import { getDisplayNameForLocale, calculateBMI, getOfficialSchoolName, getTeacherName } from '@/lib/utils';
import type { Player } from '@/lib/types';

interface PlayerIdentityModalProps {
  player: Player;
  schoolProfile?: any;
  onClose: () => void;
}

export function convertDobToMarathiWords(dobStr: string): string {
  if (!dobStr) return '---';
  const parts = dobStr.split('-');
  if (parts.length !== 3) return dobStr;
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  const monthNames = [
    '', 'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];

  const marathiDigits = (num: number) => {
    const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => digits[parseInt(d)] || d).join('');
  };

  return `${marathiDigits(day)}/${marathiDigits(month)}/${marathiDigits(year)} (${day} ${monthNames[month] || ''} ${year})`;
}

export function calculateAgeOn31Dec2025(dobStr: string): string {
  if (!dobStr) return '---';
  try {
    const dob = new Date(dobStr);
    const targetDate = new Date('2025-12-31');
    
    let years = targetDate.getFullYear() - dob.getFullYear();
    let months = targetDate.getMonth() - dob.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years} वर्षे ${months} महिने`;
  } catch (e) {
    return '---';
  }
}

export function PlayerIdentityModal({ player, schoolProfile, onClose }: PlayerIdentityModalProps) {
  const [motherName, setMotherName] = useState(player.motherName || '');
  const [fatherName, setFatherName] = useState(player.fatherName || '');
  const [saralId, setSaralId] = useState(player.saralId || player.serialNumber || '');
  const [admissionDate, setAdmissionDate] = useState(player.admissionDate || '');
  const [identificationMark, setIdentificationMark] = useState(player.identificationMark || '');
  const [selectedSport, setSelectedSport] = useState(player.sports && player.sports.length > 0 ? player.sports.join(', ') : '');
  const [photoUrl, setPhotoUrl] = useState(player.photoUrl || player.aadharPhotoUrl || '');
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setMotherName(player.motherName || '');
    setFatherName(player.fatherName || '');
    setSaralId(player.saralId || player.serialNumber || '');
    setAdmissionDate(player.admissionDate || '');
    setIdentificationMark(player.identificationMark || '');
    setSelectedSport(player.sports && player.sports.length > 0 ? player.sports.join(', ') : '');
    setPhotoUrl(player.photoUrl || player.aadharPhotoUrl || '');
  }, [player]);

  const displayName = getDisplayNameForLocale(player.name, player.nameMarathi, 'mr');
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);
  const teacherSignatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;
  const fullAddress = player.address || 'मु.पो. वाघंबा, ता. साटाणा (बागलाण), जि. नाशिक';
  const dobWords = convertDobToMarathiWords(player.dob);
  const age31Dec = calculateAgeOn31Dec2025(player.dob);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>खेळाडू ओळखपत्र - ${displayName}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
          @media print {
            @page { size: A4 portrait; margin: 0.4cm; }
            .no-print { display: none !important; }
            html, body { height: 100%; overflow: hidden; padding: 0 !important; margin: 0 !important; background: #fff !important; }
            .paper { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Noto Sans Devanagari', sans-serif;
            background: #f8fafc;
            color: #0f172a;
            padding: 12px;
            margin: 0;
            font-size: 11px;
            line-height: 1.35;
          }
          .paper {
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px solid #1e3a8a;
            border-radius: 6px;
            padding: 14px 18px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            page-break-inside: avoid;
          }
          .letterhead {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .govt-title {
            font-size: 13px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .school-title {
            font-size: 17px;
            font-weight: 900;
            color: #1e3a8a;
            margin: 1px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 800;
            color: #334155;
            margin-top: 2px;
          }
          .dispatch-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
            padding-top: 3px;
            border-top: 1px dashed #cbd5e1;
          }
          .bold-info-box {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            padding: 5px 10px;
            margin-bottom: 8px;
            font-size: 10.5px;
            font-weight: 800;
            line-height: 1.45;
          }
          .form-heading {
            text-align: center;
            font-size: 13.5px;
            font-weight: 900;
            color: #ffffff;
            background: #1e3a8a;
            padding: 4px 8px;
            border-radius: 4px;
            margin: 6px 0 8px 0;
            letter-spacing: 0.5px;
          }
          .identity-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .identity-table th, .identity-table td {
            border: 1px solid #94a3b8;
            padding: 3.5px 8px;
            vertical-align: middle;
            font-size: 10.5px;
          }
          .identity-table td.sr {
            width: 32px;
            text-align: center;
            font-weight: 800;
            background: #f8fafc;
          }
          .identity-table td.label {
            width: 220px;
            font-weight: 800;
            color: #1e293b;
            background: #f1f5f9;
          }
          .identity-table td.value {
            font-weight: 700;
            color: #0f172a;
          }
          .photo-box {
            width: 115px;
            height: 140px;
            border: 2px dashed #1e3a8a;
            border-radius: 6px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 9.5px;
            font-weight: 800;
            color: #475569;
            background: #fafafa;
            padding: 4px;
            box-sizing: border-box;
            shrink: 0;
          }
          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
          }
          .declaration-text {
            font-size: 10.5px;
            font-weight: 800;
            margin: 6px 0 10px 0;
            text-align: center;
            color: #1e293b;
          }
          .sign-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 10px;
            padding: 0 8px;
          }
          .sign-block {
            text-align: center;
            width: 200px;
            font-size: 10px;
            font-weight: 800;
          }
          .sign-block img {
            height: 34px;
            max-width: 140px;
            object-fit: contain;
            margin-bottom: 2px;
          }
          .medical-certificate-box {
            border: 1.5px solid #0f172a;
            border-radius: 6px;
            padding: 6px 10px;
            margin-top: 10px;
            background: #fffdf5;
          }
          .medical-title {
            font-size: 11.5px;
            font-weight: 900;
            color: #b45309;
            text-transform: uppercase;
            text-align: center;
            margin-bottom: 4px;
            border-bottom: 1px solid #fde047;
            padding-bottom: 2px;
          }
          .medical-body {
            font-size: 10.5px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1.4;
          }
            line-height: 1.5;
          }
          .btn-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #1e3a8a;
            color: #fff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 9999;
          }
          .btn {
            cursor: pointer;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 12px;
            border: none;
          }
          .btn-print { background: #f59e0b; color: #ffffff; }
          .btn-close { background: rgba(255,255,255,0.2); color: #ffffff; }
        </style>
      </head>
      <body style="padding-top: 60px;">
        <div class="no-print btn-bar">
          <button onclick="window.close()" class="btn btn-close">← मागे जा (Close)</button>
          <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (PRINT FORM)</button>
        </div>

        <div class="paper">
          <!-- LETTERHEAD WITH LOGOS -->
          <div class="letterhead">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px;">
              <!-- LEFT LOGO (Adivasi Vikas Vibhag) -->
              <div style="width: 85px; text-align: left; shrink: 0;">
                <img src="${TRIBAL_DEV_LOGO_B64}" alt="Adivasi Vikas Logo" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>

              <!-- CENTER SCHOOL HEADER INFO -->
              <div style="flex: 1; text-align: center;">
                <div class="govt-title">महाराष्ट्र शासन</div>
                <div class="school-title">शासकीय माध्यमिक आश्रमशाळा वाघंबा ता.बागलाण जि.नाशिक</div>
                <div class="meta-row" style="justify-content: center; gap: 24px; margin-top: 2px;">
                  <span>SSC Index No – 13.12.058</span>
                  <span>Udise No.- 27200116503</span>
                </div>
                <div style="font-size: 11px; font-weight: 800; color: #475569; margin-top: 2px;">
                  Email id – govt.waghamba2020@gmail.com
                </div>
              </div>

              <!-- RIGHT LOGO (Amrit Mahotsav) -->
              <div style="width: 85px; text-align: right; shrink: 0;">
                <img src="${AMRIT_MAHOTSAV_LOGO_B64}" alt="Amrit Mahotsav Logo" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
            </div>

            <!-- DISPATCH NO & DATE BELOW HEADER LOGOS -->
            <div class="dispatch-row">
              <span>जा.क्र. ________ /२०२६ वाघंबा</span>
              <span>दिनांक: ____/____/२०२६</span>
            </div>
          </div>

          <!-- PROJECT & SCHOOL INFO IN BOLD -->
          <div class="bold-info-box">
            <div>• <strong>प्रकल्पाचे नाव:</strong> एकात्मिक आदिवासी विकास प्रकल्प कळवण, ता. कळवण, जि. नाशिक</div>
            <div>• <strong>शाळेचे पूर्ण नाव व पत्ता:</strong> शासकीय माध्यमिक आश्रमशाळा वाघंबा, ता. साटाणा (बागलाण), जि. नाशिक</div>
            <div>• <strong>दूरध्वनी क्रमांक:</strong> ०२५५५-२९९०१५ / ९४२०४५८२४६</div>
          </div>

          <!-- HEADING -->
          <div class="form-heading">खेळाडू ओळखपत्र (PLAYER IDENTITY CARD / ELIGIBILITY FORM)</div>

          <!-- LAYOUT WITH PHOTO AND TABLE -->
          <div style="display: flex; gap: 16px; align-items: flex-start; margin-top: 10px;">
            <table class="identity-table" style="flex: 1;">
              <tr>
                <td class="sr">१</td>
                <td class="label">खेळाडूचे पूर्ण नाव</td>
                <td class="value"><strong>${displayName}</strong></td>
              </tr>
              <tr>
                <td class="sr">२</td>
                <td class="label">घराचा पत्ता</td>
                <td class="value">${fullAddress}</td>
              </tr>
              <tr>
                <td class="sr">३</td>
                <td class="label">विद्यार्थ्याची आईचे नाव</td>
                <td class="value">${motherName || '---'}</td>
              </tr>
              <tr>
                <td class="sr">४</td>
                <td class="label">विद्यार्थ्याच्या वडिलांचे नाव</td>
                <td class="value">${fatherName || '---'}</td>
              </tr>
              <tr>
                <td class="sr">५</td>
                <td class="label">खेळाडूची जन्म तारीख (अंकी व अक्षरी)</td>
                <td class="value"><strong>${dobWords}</strong></td>
              </tr>
              <tr>
                <td class="sr">६</td>
                <td class="label">आधार क्रमांक</td>
                <td class="value"><strong>${player.aadharNumber || '---'}</strong></td>
              </tr>
              <tr>
                <td class="sr">७</td>
                <td class="label">विद्यार्थ्याचा सरल क्रमांक (Saral ID)</td>
                <td class="value">${saralId || '---'}</td>
              </tr>
              <tr>
                <td class="sr">८</td>
                <td class="label">दिनांक ३१ डिसेंबर २०२५ रोजी पूर्ण वय</td>
                <td class="value"><strong>${age31Dec}</strong> (जन्म वर्ष: ${player.dob ? player.dob.split('-')[0] : '---'})</td>
              </tr>
              <tr>
                <td class="sr">९</td>
                <td class="label">निवड झालेल्या खेळाचा प्रकार</td>
                <td class="value"><strong>${selectedSport || '---'}</strong></td>
              </tr>
              <tr>
                <td class="sr">१०</td>
                <td class="label">विद्यार्थ्याचा जनरल रजिस्टर नंबर (G.R. No.)</td>
                <td class="value"><strong>${player.generalRegisterNumber || '---'}</strong></td>
              </tr>
              <tr>
                <td class="sr">११</td>
                <td class="label">खेळाडू शाळेत प्रवेश तारीख व वर्ष</td>
                <td class="value">${admissionDate || '---'}</td>
              </tr>
              <tr>
                <td class="sr">१२</td>
                <td class="label">सध्या शिकत असलेली इयत्ता</td>
                <td class="value"><strong>इयत्ता ${player.std} वी</strong> (${player.gender === 'Male' ? 'मुलगा' : 'मुलगी'})</td>
              </tr>
              <tr>
                <td class="sr">१३</td>
                <td class="label">उंची / वजन / बी.एम.आय. (Height/Weight/BMI)</td>
                <td class="value"><strong>उंची: ${player.height || '---'} cm &nbsp;|&nbsp; वजन: ${player.weight || '---'} kg &nbsp;|&nbsp; BMI: ${calculateBMI(player.height, player.weight, player.bmi)}</strong></td>
              </tr>
              <tr>
                <td class="sr">१४</td>
                <td class="label">शरीरावर कायमस्वरूपी ओळख खूण</td>
                <td class="value">${identificationMark || '---'}</td>
              </tr>
              <tr>
                <td class="sr">१५</td>
                <td class="label">खेळाडूची स्वाक्षरी</td>
                <td class="value" style="height: 36px; vertical-align: bottom;">
                  <div style="border-bottom: 1.5px dashed #64748b; width: 180px; margin-top: 15px;"></div>
                </td>
              </tr>
            </table>

            <!-- PHOTO FRAME -->
            <div class="photo-box">
              ${photoUrl ? `<img src="${photoUrl}" alt="Player Photo" />` : `
                <div style="margin-top: 15px;">📸</div>
                <div style="margin-top: 6px; font-size: 8.5px; padding: 0 4px;">खेळाडूचा पासपोर्ट फोटो व मुख्याध्यापकांचा शिक्का</div>
              `}
            </div>
          </div>

          <!-- DECLARATION -->
          <div class="declaration-text">
            "वरील माहिती शाळेतील उपलब्ध अभिलेखावरून घेण्यात आलेली असून ती तंतोतंत बरोबर व खरी आहे."
          </div>

          <!-- SIGNATURE BLOCKS -->
          <div class="sign-grid">
            <div class="sign-block">
              <img src="${TEACHER_SIGN_B64}" alt="Teacher Signature" />
              <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">क्रीडा शिक्षक स्वाक्षरी</div>
              <div style="font-size: 10px; color: #64748b;">(${teacherName})</div>
            </div>
            <div class="sign-block">
              <div style="height: 44px;"></div>
              <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">मुख्याध्यापक सही व शिक्का</div>
              <div style="font-size: 10px; color: #64748b;">(शासकीय माध्यमिक आश्रम शाळा वाघंबा)</div>
            </div>
          </div>

          <!-- MEDICAL OFFICER CERTIFICATE -->
          <div class="medical-certificate-box">
            <div class="medical-title">• वैद्यकीय अधिकाऱ्याने दिलेला दाखला (MEDICAL FITNESS CERTIFICATE) •</div>
            <div class="medical-body">
              "उपरोक्त विद्यार्थी खेळाडू <strong>${displayName}</strong> (इयत्ता ${player.std} वी) याची वैद्यकीय तपासणी केली असून त्याचे वर नमूद केलेले वय बरोबर असून तो शारीरिकदृष्ट्या क्रीडा स्पर्धेत भाग घेण्यासाठी पूर्णपणे तंदुरुस्त आहे."
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
              <div class="sign-block">
                <div style="height: 40px;"></div>
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">वैद्यकीय अधिकाऱ्याची स्वाक्षरी व शिक्का</div>
                <div style="font-size: 9.5px; color: #64748b;">(ग्रामीण रुग्णालय / प्राथमिक आरोग्य केंद्र)</div>
              </div>
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl bg-white border-2 border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden my-6">
        {/* MODAL HEADER */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase">Official Form</Badge>
                <span className="text-xs font-bold opacity-80">शासकीय आश्रमशाळा वाघंबा</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">
                खेळाडू ओळखपत्र (PLAYER IDENTITY CARD)
              </h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* QUICK EDIT TOGGLE BAR */}
          <div className="flex flex-wrap items-center justify-between bg-slate-100 p-4 rounded-2xl gap-3 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ऑटो-फील माहिती: <strong>{displayName}</strong> (इयत्ता {player.std} वी)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-black uppercase rounded-xl h-9 border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "फॉर्म बंद करा (Done)" : "माहितीत बदल करा (Edit Fields)"}
            </Button>
          </div>

          {/* EDITABLE FIELDS PANEL */}
          {isEditing && (
            <div className="p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">आईचे नाव (Mother&apos;s Name)</label>
                <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">वडिलांचे नाव (Father&apos;s Name)</label>
                <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">सरल आयडी (Saral ID)</label>
                <Input value={saralId} onChange={(e) => setSaralId(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">खेळाडूचा निवडलेला खेळ (Sport)</label>
                <Input value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">प्रवेश तारीख (Admission Date)</label>
                <Input value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900">ओळख खूण (Identification Mark)</label>
                <Input value={identificationMark} onChange={(e) => setIdentificationMark(e.target.value)} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold" />
              </div>
              <div className="space-y-1 col-span-1 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-amber-900">खेळाडूचा फोटो अपडेट करा (Upload Student Photo)</label>
                <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="h-10 rounded-xl bg-white border-amber-200 text-xs font-bold file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200" />
              </div>
            </div>
          )}

          {/* FORM PREVIEW CARD */}
          <div className="border-2 border-primary/30 rounded-3xl p-6 bg-white space-y-4 shadow-md font-sans text-xs">
            {/* LETTERHEAD PREVIEW */}
            <div className="border-b-2 border-primary pb-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                {/* LEFT LOGO */}
                <div className="w-16 h-16 shrink-0">
                  <img src={TRIBAL_DEV_LOGO_B64} alt="Adivasi Vikas Logo" className="w-full h-full object-contain" />
                </div>

                {/* CENTER TEXT */}
                <div className="text-center flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">महाराष्ट्र शासन</p>
                  <h3 className="text-base md:text-lg font-black text-primary uppercase">{schoolName} ता.बागलाण जि.नाशिक</h3>
                  <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-600">
                    <span>SSC Index No – 13.12.058</span>
                    <span>Udise No.- 27200116503</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500">Email id – govt.waghamba2020@gmail.com</p>
                </div>

                {/* RIGHT LOGO */}
                <div className="w-16 h-16 shrink-0">
                  <img src={AMRIT_MAHOTSAV_LOGO_B64} alt="Amrit Mahotsav Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* DISPATCH ROW BELOW HEADER */}
              <div className="flex justify-between text-[11px] font-extrabold text-slate-800 border-t border-dashed border-slate-200 pt-2 px-1">
                <span>जा.क्र. ________ /२०२६ वाघंबा</span>
                <span>दिनांक: ____/____/२०२६</span>
              </div>
            </div>

            {/* BOLD INFO */}
            <div className="bg-slate-100 p-3 rounded-xl border font-bold text-[11px] space-y-1 text-slate-800">
              <p>• <strong>प्रकल्पाचे नाव:</strong> एकात्मिक आदिवासी विकास प्रकल्प कळवण, ता. कळवण, जि. नाशिक</p>
              <p>• <strong>शाळेचे पूर्ण नाव व पत्ता:</strong> शासकीय माध्यमिक आश्रमशाळा वाघंबा, ता. साटाणा (बागलाण), जि. नाशिक</p>
              <p>• <strong>दूरध्वनी क्रमांक:</strong> ०२५५५-२९९०१५ / ९४२०४५८२४६</p>
            </div>

            {/* TITLE */}
            <div className="bg-primary text-white text-center py-2 font-black uppercase rounded-lg text-sm tracking-wide">
              खेळाडू ओळखपत्र (PLAYER IDENTITY CARD / ELIGIBILITY FORM)
            </div>

            {/* SUMMARY PREVIEW TABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>१. नाव:</strong> {displayName}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>२. पत्ता:</strong> {fullAddress}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>३. आईचे नाव:</strong> {motherName || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>४. वडिलांचे नाव:</strong> {fatherName || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>५. जन्म तारीख:</strong> {dobWords}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>६. आधार नं:</strong> {player.aadharNumber || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>७. सरल नं:</strong> {saralId || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>८. ३१ डिसे. २०२५ रोजी वय:</strong> {age31Dec}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>९. निवडलेला खेळ:</strong> {selectedSport || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>१०. G.R. No.:</strong> {player.generalRegisterNumber || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>११. प्रवेश तारीख:</strong> {admissionDate || '---'}</div>
              <div className="p-2 bg-slate-50 border rounded-xl"><strong>१२. इयत्ता:</strong> इयत्ता {player.std} वी</div>
              <div className="p-2 bg-slate-50 border rounded-xl col-span-1 md:col-span-2"><strong>१३. ओळख खूण:</strong> {identificationMark || '---'}</div>
            </div>

            {/* MEDICAL CERTIFICATE PREVIEW */}
            <div className="border-2 border-amber-500/40 bg-amber-50/50 p-3 rounded-2xl text-[11px] font-bold space-y-1">
              <p className="text-amber-900 font-black uppercase text-center">• वैद्यकीय अधिकाऱ्याने दिलेला दाखला (MEDICAL CERTIFICATE) •</p>
              <p className="text-slate-800">&quot;उपरोक्त विद्यार्थी खेळाडूची तपासणी केली असून त्याचे वर नमूद केलेले वय बरोबर असून तो शारीरिकदृष्ट्या पूर्णपणे तंदुरुस्त आहे.&quot;</p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-14 rounded-2xl px-8 font-black uppercase text-xs border-2"
            >
              रद्द करा (Close)
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-10 font-black uppercase text-xs tracking-wider shadow-xl active-scale transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" /> प्रिंट / पीडीएफ डाउनलोड करा (PRINT OFFICIAL FORM)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
