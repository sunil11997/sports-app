"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Share2, 
  Sparkles, 
  Trophy, 
  HeartPulse, 
  Activity, 
  CalendarDays, 
  Send, 
  CheckCircle2, 
  User, 
  Printer, 
  Shirt,
  MessageSquare
} from 'lucide-react';
import { cn, getAgeValidation, getOfficialSchoolName, getTeacherName, calculateBMI, transliterateEnglishToMarathi } from '@/lib/utils';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

export function ParentProgressShareModal({ 
  isOpen, 
  onClose, 
  store, 
  initialPlayerId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  store: any; 
  initialPlayerId?: string;
}) {
  const players = useMemo(() => store?.data?.players || [], [store?.data?.players]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialPlayerId || players[0]?.id || '');
  const [customTeacherRemark, setCustomTeacherRemark] = useState<string>('खेळाडूची मैदानावरील उपस्थिती व सराव अत्यंत उत्तम आहे. आगामी क्रीडा स्पर्धेसाठी निवड योग्य.');

  const player = useMemo(() => {
    return players.find((p: any) => p.id === (selectedPlayerId || initialPlayerId)) || players[0];
  }, [players, selectedPlayerId, initialPlayerId]);

  const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);

  // Player metrics
  const fitness = store?.data?.fitness?.[player?.id] || { score: '85', status: 'Excellent (उत्कृष्ट)' };
  const ageVal = getAgeValidation(player?.dob);
  const mainSport = player?.sports?.[0] || 'Kabaddi';
  const jersey = player?.jerseyNumbers?.[mainSport] || player?.jerseyNumber || '-';
  const position = player?.positions?.[mainSport] || 'खेळाडू';
  const marathiName = player?.nameMarathi || transliterateEnglishToMarathi(player?.name) || player?.name;

  // Compute WhatsApp message
  const whatsappText = useMemo(() => {
    if (!player) return '';

    return `*${schoolName}*\n*विद्यार्थी क्रीडा व शारीरिक प्रगती अहवाल (Sports & Fitness Report Card)*\n\n*विद्यार्थ्याचे नाव:* ${marathiName} (${player.name})\n*इयत्ता:* ${player.std} वी | *हजेरी क्रमांक/GR:* ${player.generalRegisterNumber || player.serialNumber || '-'}\n*वय / वयोगट:* ${ageVal?.ageYears || player.age} वर्षे (${ageVal?.category || player.ageCategory || 'U17'})\n------------------------------\n🏅 *क्रीडा प्रकार:* ${player.sports?.join(', ') || 'क्रीडा सराव'}\n🎽 *जर्सी क्रमांक:* #${jersey} | *स्थान / पोझिशन:* ${position}\n💪 *शारीरिक तंदुरुस्ती स्कोअर:* ${fitness.score}/100 [${fitness.status || 'Good'}]\n📏 *उंची / वजन / BMI:* ${player.height || '-'} cm | ${player.weight || '-'} kg | BMI: ${player.bmi || '-'}\n------------------------------\n📝 *क्रीडा शिक्षकांचा अभिप्राय:* ${customTeacherRemark}\n\n*क्रीडा शिक्षक:* ${teacherName}\n*वाघंबा स्पोर्ट्स हब डिजिटल प्रणाली*`;
  }, [player, marathiName, ageVal, mainSport, jersey, position, fitness, customTeacherRemark, schoolName, teacherName]);

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappText);
    const mobile = (player?.mobileNumber || '').replace(/[^0-9]/g, '');
    const url = mobile.length === 10 
      ? `https://wa.me/91${mobile}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handlePrintCard = () => {
    if (!player) return;
    const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sports Progress Card - ${player.name}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print { 
              @page { size: A5 landscape; margin: 0.6cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.35; font-size: 11px; background: #f8fafc; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 3px solid #1e3a8a; border-radius: 12px; padding: 18px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .header-table td { border: none; padding: 2px; }
            .school-title { font-size: 15px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .badge-title { background: #1e3a8a; color: white; text-align: center; font-size: 11px; font-weight: 900; padding: 4px; border-radius: 4px; margin: 6px 0 10px 0; }
            .info-grid { display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center; margin-bottom: 12px; }
            .metrics-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10.5px; }
            .metrics-table th, .metrics-table td { border: 1px solid #cbd5e1; padding: 5px 8px; }
            .metrics-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 20px; font-size: 10px; font-weight: 800; }
            .sign-box { text-align: center; }
            .sign-box img { max-height: 35px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 50px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ कार्ड प्रिंट करा (Print A5)</button>
          </div>
          
          <div class="card">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;"><img src="${TRIBAL_DEV_LOGO_B64}" style="height: 45px;" /></td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन - क्रीडा व शारीरिक शिक्षण विभाग</div>
                  <div class="school-title">${schoolName}</div>
                </td>
                <td style="width: 15%; text-align: center;"><img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 40px;" /></td>
              </tr>
            </table>

            <div class="badge-title">विद्यार्थी क्रीडा व शारीरिक प्रगती कार्ड (STUDENT SPORTS CARD)</div>

            <div class="info-grid">
              <div style="width: 75px; height: 75px; border: 1px dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${player.photoUrl ? `<img src="${player.photoUrl}" style="max-height: 75px; max-width: 75px; object-fit: cover;" />` : '<span style="font-size: 8px; color: #94a3b8;">फोटो / Photo</span>'}
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 900; color: #0f172a;">${marathiName}</div>
                <div style="font-size: 10px; color: #64748b;">${player.name} &bull; इयत्ता ${player.std} वी (GR: ${player.generalRegisterNumber || '-'})</div>
                <div style="font-size: 10px; font-weight: bold; color: #1e3a8a; margin-top: 2px;">
                  खेळ: ${player.sports?.join(', ')} &bull; जर्सी: #${jersey} (${position})
                </div>
              </div>
            </div>

            <table class="metrics-table">
              <tr>
                <th>शारीरिक तंदुरुस्ती स्कोअर</th>
                <td><strong>${fitness.score}/100</strong> (${fitness.status})</td>
                <th>उंची / वजन</th>
                <td>${player.height || '-'} cm / ${player.weight || '-'} kg</td>
              </tr>
              <tr>
                <th>BMI इंडेक्स</th>
                <td><strong>${player.bmi || '-'}</strong></td>
                <th>वयोगट</th>
                <td>${ageVal?.category || player.ageCategory || 'U17'}</td>
              </tr>
            </table>

            <div style="background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 6px 10px; margin: 8px 0; font-size: 10px;">
              <strong>क्रीडा शिक्षक शेरा:</strong> ${customTeacherRemark}
            </div>

            <div class="footer-sign">
              <div class="sign-box">
                <img src="${signatureSrc}" alt="Teacher Signature" />
                <div style="border-top: 1px dashed #475569; padding-top: 2px;">क्रीडा शिक्षक (${teacherName})</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div style="border-top: 1px dashed #475569; padding-top: 2px;">मुख्याध्यापक स्वाक्षरी व शिक्का</div>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            पालक WhatsApp प्रगती कार्ड (Parent Progress Share)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          {/* Player Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">विद्यार्थी निवडा (Select Student)</label>
            <Select value={player?.id || ''} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="rounded-xl font-bold h-11 border-2 border-primary/20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {players.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="font-bold text-xs">
                    {p.nameMarathi || p.name} (इ. {p.std} वी)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Card */}
          {player && (
            <Card className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{marathiName}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold">{player.name} &bull; इ. {player.std} वी</p>
                </div>
                <Badge className="bg-emerald-600 text-white font-black text-xs px-3 py-1">
                  फिटनेस {fitness.score}/100
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-bold text-muted-foreground block">क्रीडा प्रकार</span>
                  <span className="font-black text-primary text-xs">{mainSport}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-bold text-muted-foreground block">जर्सी / पोझिशन</span>
                  <span className="font-black text-slate-900 text-xs">#{jersey} ({position})</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-bold text-muted-foreground block">उंची / वजन</span>
                  <span className="font-black text-slate-900 text-xs">{player.height || '-'}cm / {player.weight || '-'}kg</span>
                </div>
              </div>

              {/* Custom Teacher Remark */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">क्रीडा शिक्षकांचा अभिप्राय (Teacher Remark)</label>
                <Input
                  value={customTeacherRemark}
                  onChange={(e) => setCustomTeacherRemark(e.target.value)}
                  className="rounded-xl font-bold bg-white text-xs h-10 border-emerald-300"
                />
              </div>
            </Card>
          )}

          {/* WhatsApp Text Preview Box */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> संदेश पूर्वावलोकन (WhatsApp Message Text)
            </label>
            <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3.5 rounded-xl whitespace-pre-line max-h-44 overflow-y-auto leading-relaxed border border-slate-800">
              {whatsappText}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrintCard}
            className="rounded-xl font-bold text-xs h-11 px-4"
          >
            <Printer className="w-4 h-4 mr-1.5" /> A5 कार्ड प्रिंट
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs">बंद करा</Button>
            <Button
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-6"
            >
              <Send className="w-4 h-4" /> WhatsApp वर पाठवा
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
