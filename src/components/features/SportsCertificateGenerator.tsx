"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Award, 
  Medal, 
  Printer, 
  Search, 
  Trophy, 
  Users, 
  Calendar, 
  CheckSquare, 
  Square, 
  Eye
} from 'lucide-react';
import { 
  cn, 
  getOfficialSchoolName, 
  getTeacherName, 
  getAgeValidation,
  transliterateEnglishToMarathi 
} from '@/lib/utils';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';
import { useToast } from '@/hooks/use-toast';

const SPORTS_LIST = [
  'Kabaddi',
  'Volleyball',
  'Kho Kho',
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

const RANKS = [
  { id: 'first', labelEn: '1st Place (Winner)', labelMr: 'प्रथम क्रमांक (विजेता 🥇)', medal: '🥇' },
  { id: 'second', labelEn: '2nd Place (Runner-Up)', labelMr: 'द्वितीय क्रमांक (उपविजेता 🥈)', medal: '🥈' },
  { id: 'third', labelEn: '3rd Place', labelMr: 'तृतीय क्रमांक (कांस्य 🥉)', medal: '🥉' },
  { id: 'consolation', labelEn: 'Consolation Prize', labelMr: 'उत्तेजनार्थ पारितोषिक ⭐', medal: '⭐' },
  { id: 'best_player', labelEn: 'Player of Tournament', labelMr: 'सर्वोत्कृष्ट खेळाडू 🏆', medal: '🏆' },
];

export function SportsCertificateGenerator({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState(preselectedSport || 'Kabaddi');
  const [certType, setCertType] = useState<'merit' | 'participation'>('merit');
  const [selectedRank, setSelectedRank] = useState('first');
  const [eventName, setEventName] = useState('वार्षिक शालेय क्रीडा महोत्सव २०२६-२७');
  const [eventLevel, setEventLevel] = useState('शालेय / तालुका स्तरीय स्पर्धा');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventVenue, setEventVenue] = useState('शालेय क्रीडा संकुल, वाघंबा');
  const [selectedStandard, setSelectedStandard] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);

  const allPlayers = useMemo(() => store?.data?.players || [], [store?.data?.players]);
  const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p: any) => {
      const matchSport = !selectedSport || (p.sports && p.sports.includes(selectedSport));
      if (!matchSport) return false;

      if (selectedStandard !== 'All' && String(p.std) !== selectedStandard) return false;
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
  }, [allPlayers, selectedSport, selectedStandard, selectedGender, searchQuery]);

  // Set default preview player
  const currentPreviewPlayer = useMemo(() => {
    if (previewPlayerId) {
      const found = filteredPlayers.find((p: any) => p.id === previewPlayerId);
      if (found) return found;
    }
    return filteredPlayers[0] || null;
  }, [filteredPlayers, previewPlayerId]);

  const toggleSelectPlayer = (id: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayerIds.length === filteredPlayers.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(filteredPlayers.map((p: any) => p.id));
    }
  };

  // Generate certificate HTML for printing
  const generateCertificateHtml = (player: any) => {
    const marathiName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
    const rankDef = RANKS.find(r => r.id === selectedRank);
    const ageVal = getAgeValidation(player.dob);
    const category = ageVal?.category || player.ageCategory || 'U14';
    const photo = player.photoUrl;

    const rankText = certType === 'merit'
      ? `<div class="merit-badge">🏆 ${rankDef?.labelMr}</div>`
      : `<div class="merit-badge" style="background: #047857; color: white;">⚡ सक्रिय सहभाग प्रमाणपत्र (Certificate of Participation)</div>`;

    const descriptionMarathi = certType === 'merit'
      ? `यांनी <b>${schoolName}</b> येथे आयोजित <b>${eventName} (${eventLevel})</b> मध्ये <b>${selectedSport}</b> (${category} गट) या क्रीडा प्रकारात अतिशय उत्कृष्ट व दर्जेदार खेळ सादर करून <b>${rankDef?.labelMr}</b> संपादन केल्याबद्दल हे <b>प्रावीण्य प्रमाणपत्र</b> सस्नेह प्रदान करण्यात येत आहे.`
      : `यांनी <b>${schoolName}</b> येथे आयोजित <b>${eventName} (${eventLevel})</b> मध्ये <b>${selectedSport}</b> (${category} गट) या क्रीडा प्रकारात शिस्तबद्ध व उत्साही सहभाग नोंदवल्याबद्दल हे <b>सहभाग प्रमाणपत्र</b> गौरवपूर्वक प्रदान करण्यात येत आहे.`;

    const photoBlock = photo
      ? `<div class="photo-box"><img src="${photo}" alt="Player Photo" /></div>`
      : `<div class="photo-box photo-placeholder">फोटो</div>`;

    return `
      <div class="cert-page">
        <div class="cert-border-outer">
          <div class="cert-border-inner">
            <!-- Header Logos -->
            <div class="cert-header">
              <div class="logo-col text-left">
                <img src="${TRIBAL_DEV_LOGO_B64}" class="header-logo" alt="Tribal Dev Dept" />
              </div>
              <div class="title-col">
                <div class="govt-title">महाराष्ट्र शासन &bull; आदिवासी विकास विभाग</div>
                <div class="school-title">${schoolName}</div>
                <div class="location-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                <div class="main-cert-title">
                  ${certType === 'merit' ? 'क्रीडा प्रावीण्य प्रमाणपत्र' : 'क्रीडा सहभाग प्रमाणपत्र'}
                </div>
                <div class="cert-subtitle">CERTIFICATE OF ${certType === 'merit' ? 'MERIT & EXCELLENCE' : 'ACTIVE PARTICIPATION'}</div>
              </div>
              <div class="logo-col text-right">
                <img src="${AMRIT_MAHOTSAV_LOGO_B64}" class="header-logo" alt="Amrit Mahotsav" />
              </div>
            </div>

            <!-- Recipient Ribbon -->
            <div class="recipient-section">
              ${rankText}
              <div class="certify-lead">प्रमाणित करण्यात येते की,</div>
              <div class="recipient-name">${marathiName}</div>
              <div class="recipient-sub">(${player.name}) &bull; इयत्ता: ${player.std} वी &bull; GR नं.: ${player.generalRegisterNumber || '-'}</div>
            </div>

            <!-- Body Statement -->
            <div class="cert-body-statement">
              ${descriptionMarathi}
            </div>

            <!-- Meta details row -->
            <div class="meta-details-strip">
              <div><b>क्रीडा प्रकार:</b> ${selectedSport}</div>
              <div><b>वयोगट:</b> ${category} (${player.gender === 'Female' ? 'मुली' : 'मुले'})</div>
              <div><b>स्थळ:</b> ${eventVenue}</div>
              <div><b>दिनांक:</b> ${eventDate}</div>
            </div>

            <!-- Footer Signatures -->
            <div class="cert-footer">
              <div class="sign-block text-left">
                ${photoBlock}
              </div>

              <div class="sign-block text-center">
                <div class="seal-circle">
                  शालेय<br/>अधिकृत<br/>सिक्का
                </div>
              </div>

              <div class="sign-block text-center">
                <div class="sign-line">
                  <div class="sign-name">${teacherName}</div>
                  <div class="sign-designation">क्रीडा शिक्षक / शारीरिक शिक्षण संचालक</div>
                </div>
              </div>

              <div class="sign-block text-center">
                <div class="sign-line">
                  <div class="sign-name">${schoolProfile?.headMasterName || 'मुख्याध्यापक'}</div>
                  <div class="sign-designation">मुख्याध्यापक / प्राचार्य स्वाक्षरी</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Launch Print Window for Single or Batch
  const handlePrint = (playersToPrint: any[]) => {
    if (!playersToPrint || playersToPrint.length === 0) {
      toast({ title: "कृपया खेळाडू निवडा", description: "प्रमाणपत्र प्रिंट करण्यासाठी किमान एक खेळाडू निवडा.", variant: "destructive" });
      return;
    }

    const pagesHtml = playersToPrint.map(p => generateCertificateHtml(p)).join('');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sports Certificates - ${selectedSport}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            
            @page {
              size: A4 landscape;
              margin: 0.5cm;
            }

            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; background: white !important; }
              .cert-page { page-break-after: always; break-after: page; }
            }

            * { box-sizing: border-box; }
            body {
              font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
              margin: 0;
              padding: 15px;
              background: #f1f5f9;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .print-controls {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #1e3a8a;
              color: white;
              padding: 10px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 99999;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }

            .btn {
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 12px;
              cursor: pointer;
              border: none;
            }
            .btn-close { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: #020617; }

            .cert-page {
              width: 285mm;
              height: 198mm;
              margin: 0 auto 20px auto;
              background: #fffdfa;
              position: relative;
            }

            .cert-border-outer {
              border: 8px double #b45309;
              border-radius: 12px;
              height: 100%;
              padding: 6px;
              background: #fffdf8;
              box-shadow: inset 0 0 20px rgba(180, 83, 9, 0.08);
            }

            .cert-border-inner {
              border: 2px solid #d97706;
              border-radius: 8px;
              height: 100%;
              padding: 16px 24px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }

            .cert-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid rgba(180, 83, 9, 0.3);
              padding-bottom: 8px;
            }

            .header-logo {
              height: 52px;
              width: auto;
              object-fit: contain;
            }

            .title-col {
              text-align: center;
              flex: 1;
              padding: 0 15px;
            }

            .govt-title {
              font-size: 11px;
              font-weight: 800;
              color: #b45309;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .school-title {
              font-size: 20px;
              font-weight: 900;
              color: #1e3a8a;
              margin: 2px 0;
            }

            .location-title {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
            }

            .main-cert-title {
              font-size: 22px;
              font-weight: 900;
              color: #b45309;
              margin-top: 4px;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-family: 'Cinzel', 'Noto Sans Devanagari', serif;
            }

            .cert-subtitle {
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 3px;
              color: #475569;
            }

            .recipient-section {
              text-align: center;
              margin: 6px 0;
            }

            .merit-badge {
              display: inline-block;
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: #0f172a;
              font-weight: 900;
              font-size: 13px;
              padding: 4px 18px;
              border-radius: 20px;
              text-transform: uppercase;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              margin-bottom: 6px;
            }

            .certify-lead {
              font-size: 12px;
              font-style: italic;
              color: #475569;
              font-weight: 600;
            }

            .recipient-name {
              font-size: 26px;
              font-weight: 900;
              color: #0f172a;
              margin: 3px 0;
              text-decoration: underline;
              text-decoration-color: #f59e0b;
              text-underline-offset: 4px;
            }

            .recipient-sub {
              font-size: 11px;
              font-weight: 700;
              color: #334155;
            }

            .cert-body-statement {
              font-size: 13px;
              line-height: 1.6;
              text-align: center;
              color: #1e293b;
              padding: 0 20px;
              margin: 8px 0;
            }

            .meta-details-strip {
              display: flex;
              justify-content: space-around;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 6px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #334155;
            }

            .cert-footer {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              padding-top: 10px;
              border-top: 1px solid rgba(180, 83, 9, 0.2);
            }

            .photo-box {
              width: 52px;
              height: 60px;
              border: 2px solid #b45309;
              border-radius: 4px;
              overflow: hidden;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .photo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .photo-placeholder {
              font-size: 10px;
              color: #94a3b8;
              font-weight: bold;
            }

            .seal-circle {
              width: 65px;
              height: 65px;
              border: 2px dashed #b45309;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: 900;
              color: #b45309;
              text-align: center;
              line-height: 1.1;
            }

            .sign-line {
              min-width: 180px;
              border-top: 1.5px solid #334155;
              padding-top: 4px;
              text-align: center;
            }

            .sign-name {
              font-size: 11px;
              font-weight: 900;
              color: #1e3a8a;
            }

            .sign-designation {
              font-size: 9px;
              font-weight: 700;
              color: #64748b;
            }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-close">&larr; बंद करा (Close)</button>
            <span style="font-weight: 900; font-size: 13px;">एकूण ${playersToPrint.length} प्रमाणपत्रे तयार आहेत</span>
            <button onclick="window.print()" class="btn btn-print">🖨️ सर्व प्रमाणपत्रे प्रिंट करा (A4 Landscape)</button>
          </div>
          ${pagesHtml}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(fullHtml);
      win.document.close();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-amber-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                Official Certification Hub
              </Badge>
              <Badge variant="outline" className="text-amber-200 border-amber-400/30 text-xs">
                {selectedSport} &bull; A4 लँडस्केप फॉरमॅट
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              क्रीडा प्रावीण्य व सहभाग प्रमाणपत्र जनरेटर (Sports Certificates)
            </h2>
            <p className="text-xs md:text-sm text-amber-200/90 font-medium max-w-2xl">
              शालेय, तालुका व जिल्हा क्रीडा स्पर्धांसाठी अधिकृत महाराष्ट्र शासन व अमृत महोत्सव लोगोयुक्त प्रावीण्य व सहभाग प्रमाणपत्रे एका क्लिकवर प्रिंट करा.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handlePrint(selectedPlayerIds.length > 0 ? filteredPlayers.filter((p: any) => selectedPlayerIds.includes(p.id)) : filteredPlayers)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-6 border border-amber-300"
            >
              <Printer className="w-4 h-4" />
              {selectedPlayerIds.length > 0 
                ? `निवडलेले (${selectedPlayerIds.length}) प्रिंट करा`
                : `सर्व (${filteredPlayers.length}) प्रिंट करा`}
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Certificate Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" /> प्रमाणपत्राचा प्रकार (Type)
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCertType('merit')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  certType === 'merit' ? "bg-amber-500 text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                🏆 प्रावीण्य (Merit)
              </button>
              <button
                type="button"
                onClick={() => setCertType('participation')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  certType === 'participation' ? "bg-amber-500 text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                ⚡ सहभाग (Participation)
              </button>
            </div>
          </div>

          {/* Sport Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> खेळ (Sport)
            </label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="खेळ निवडा" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS_LIST.map(s => (
                  <SelectItem key={s} value={s} className="font-bold text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rank (if merit) */}
          {certType === 'merit' && (
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-amber-500" /> क्रमांक / पारितोषिक (Rank)
              </label>
              <Select value={selectedRank} onValueChange={setSelectedRank}>
                <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                  <SelectValue placeholder="क्रमांक निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {RANKS.map(r => (
                    <SelectItem key={r.id} value={r.id} className="font-bold text-xs">
                      {r.labelMr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Event Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> स्पर्धेचा दिनांक (Date)
            </label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="font-bold text-xs rounded-xl h-11 border-2 border-primary/20"
            />
          </div>
        </div>

        {/* Event Title & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">स्पर्धेचे नाव (Event / Tournament Name)</label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="उदा. वार्षिक शालेय क्रीडा महोत्सव २०२६-२७"
              className="font-bold text-xs rounded-xl h-10 border-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">स्पर्धा स्तर (Competition Level)</label>
            <Input
              value={eventLevel}
              onChange={(e) => setEventLevel(e.target.value)}
              placeholder="उदा. तालुका स्तरीय / आंतरशालेय स्पर्धा"
              className="font-bold text-xs rounded-xl h-10 border-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">स्थळ (Event Venue)</label>
            <Input
              value={eventVenue}
              onChange={(e) => setEventVenue(e.target.value)}
              placeholder="उदा. शालेय क्रीडा संकुल, वाघंबा"
              className="font-bold text-xs rounded-xl h-10 border-primary/20"
            />
          </div>
        </div>
      </Card>

      {/* Live Certificate Preview Box */}
      {currentPreviewPlayer && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-sm text-primary uppercase">
                थेट नमुना अवलोकन (Live Certificate Preview)
              </h3>
            </div>
            <Button
              size="sm"
              onClick={() => handlePrint([currentPreviewPlayer])}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl gap-1.5 h-8"
            >
              <Printer className="w-3.5 h-3.5" /> हे एकच प्रिंट करा (Print This)
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-600/60 shadow-xl relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20">
            {/* Ornamental Border Line */}
            <div className="border-2 border-dashed border-amber-600/40 p-6 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <img src={TRIBAL_DEV_LOGO_B64} alt="Logo" className="h-12 object-contain" />
                <div className="text-center">
                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider">महाराष्ट्र शासन &bull; आदिवासी विकास विभाग</div>
                  <div className="text-lg md:text-xl font-black text-primary">{schoolName}</div>
                  <div className="text-xs font-bold text-slate-500">तालुका: {schoolProfile?.taluka || 'बागलाण'}, जिल्हा: {schoolProfile?.district || 'नाशिक'}</div>
                  <div className="text-base md:text-lg font-black text-amber-700 mt-1 uppercase tracking-widest">
                    {certType === 'merit' ? 'क्रीडा प्रावीण्य प्रमाणपत्र' : 'क्रीडा सहभाग प्रमाणपत्र'}
                  </div>
                </div>
                <img src={AMRIT_MAHOTSAV_LOGO_B64} alt="Logo" className="h-12 object-contain" />
              </div>

              <div className="text-center space-y-2 py-2">
                <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase shadow">
                  {certType === 'merit' ? RANKS.find(r => r.id === selectedRank)?.labelMr : '⚡ सक्रिय सहभाग'}
                </Badge>
                <div className="text-xs italic text-slate-500">प्रमाणित करण्यात येते की,</div>
                <div className="text-2xl font-black text-slate-900 underline decoration-amber-400 underline-offset-4">
                  {currentPreviewPlayer.nameMarathi || transliterateEnglishToMarathi(currentPreviewPlayer.name) || currentPreviewPlayer.name}
                </div>
                <div className="text-xs font-bold text-slate-600">
                  ({currentPreviewPlayer.name}) &bull; इयत्ता: {currentPreviewPlayer.std} वी &bull; GR: {currentPreviewPlayer.generalRegisterNumber || '-'}
                </div>
              </div>

              <div className="text-center text-xs md:text-sm leading-relaxed text-slate-700 px-4">
                यांनी <b>{schoolName}</b> येथे आयोजित <b>{eventName} ({eventLevel})</b> मध्ये <b>{selectedSport}</b> या क्रीडा प्रकारात उत्कृष्ट खेळ सादर करून 
                <b> {certType === 'merit' ? RANKS.find(r => r.id === selectedRank)?.labelMr : 'सक्रिय सहभाग'}</b> संपादन केल्याबद्दल हे प्रमाणपत्र सस्नेह प्रदान करण्यात येत आहे.
              </div>

              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-amber-500/20 text-xs font-bold text-slate-600">
                <div>क्रीडा प्रकार: <span className="text-primary font-black">{selectedSport}</span></div>
                <div>स्थळ: <span className="text-primary font-black">{eventVenue}</span></div>
                <div>दिनांक: <span className="text-primary font-black">{eventDate}</span></div>
                <div className="text-amber-800 font-black">क्रीडा शिक्षक: {teacherName}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Selection Table */}
      <Card className="rounded-[2rem] border-2 border-primary/10 shadow-sm overflow-hidden bg-white">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-base text-primary uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> खेळाडू यादी ({filteredPlayers.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              प्रमाणपत्रे तयार करण्यासाठी खेळाडूंची निवड करा किंवा नमुना पाहण्यासाठी नावावर क्लिक करा
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              className="text-xs font-black rounded-xl h-9 border-2"
            >
              {selectedPlayerIds.length === filteredPlayers.length ? 'सर्व अन-सिलेक्ट करा' : 'सर्व खेळाडू निवडा'}
            </Button>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव शोधा..."
              className="font-bold text-xs rounded-xl h-9 w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                <th className="py-3 px-4 text-center w-12">निवड</th>
                <th className="py-3 px-4 text-center w-12">अ.क्र.</th>
                <th className="py-3 px-4">खेळाडूचे नाव (Player Name)</th>
                <th className="py-3 px-4 text-center">इयत्ता</th>
                <th className="py-3 px-4 text-center">GR क्रमांक</th>
                <th className="py-3 px-4 text-center">खेळ</th>
                <th className="py-3 px-4 text-center">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground font-bold">
                    निवडलेल्या निकषांनुसार खेळाडू आढळले नाहीत.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player: any, idx: number) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  const isPreview = currentPreviewPlayer?.id === player.id;
                  const mName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;

                  return (
                    <tr 
                      key={player.id} 
                      className={cn(
                        "hover:bg-amber-50/50 transition-colors",
                        isPreview && "bg-amber-100/40"
                      )}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectPlayer(player.id)}
                          className="text-primary hover:text-amber-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{mName}</div>
                        <div className="text-[10px] text-slate-500">{player.name}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">इ. {player.std} वी</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                        {player.generalRegisterNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {selectedSport}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewPlayerId(player.id)}
                            className="h-7 text-[10px] font-bold text-amber-700 hover:bg-amber-100 rounded-lg px-2"
                          >
                            <Eye className="w-3 h-3 mr-1" /> नमुना
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePrint([player])}
                            className="h-7 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg px-2 shadow-sm"
                          >
                            <Printer className="w-3 h-3 mr-1" /> प्रिंट
                          </Button>
                        </div>
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
