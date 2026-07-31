"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  FileText, 
  AlertTriangle, 
  Users, 
  ClipboardCheck, 
  History, 
  Trophy, 
  Zap, 
  Share2, 
  Plus, 
  Sparkles, 
  Flame, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function DailyReport({ store, section, language = 'Marathi' }: { store: any, section: 'sports' | 'general', language?: string }) {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [manualNotes, setManualSummary] = useState("");
  const [weather, setWeather] = useState("Sunny");

  // Custom Quick Log state
  const [customSport, setCustomSport] = useState("Yoga");
  const [customDrill, setCustomDrill] = useState("Surya Namaskar (सूर्य नमस्कार)");
  const [customBoysCount, setCustomBoysCount] = useState<number>(15);
  const [customGirlsCount, setCustomGirlsCount] = useState<number>(15);

  const isMarathi = language === 'Marathi';

  useEffect(() => {
    setIsMounted(true);
    setReportDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const players = useMemo(() => store?.data?.players || [], [store?.data?.players]);

  // Attendance summary calculated with Boys & Girls count ONLY
  const attendanceCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.attendance) {
      return { morningBoys: 0, morningGirls: 0, morningTotal: 0, eveningBoys: 0, eveningGirls: 0, eveningTotal: 0 };
    }

    let mBoys = 0, mGirls = 0;
    let eBoys = 0, eGirls = 0;

    Object.entries(store.data.attendance).forEach(([key, status]) => {
      if (status === 'P' && key.includes(reportDate)) {
        const playerId = key.split('_')[0];
        const player = players.find((p: any) => p.id === playerId);
        const gender = player?.gender || 'Male';

        if (key.endsWith('_Morning')) {
          if (gender === 'Male') mBoys++;
          else mGirls++;
        }
        if (key.endsWith('_Evening')) {
          if (gender === 'Male') eBoys++;
          else eGirls++;
        }
      }
    });

    return {
      morningBoys: mBoys,
      morningGirls: mGirls,
      morningTotal: mBoys + mGirls,
      eveningBoys: eBoys,
      eveningGirls: eGirls,
      eveningTotal: eBoys + eGirls
    };
  }, [store?.data?.attendance, players, reportDate, isMounted]);

  // Drills / Activities completed today grouped by Sport/Category
  const drillGroupedSummary = useMemo(() => {
    if (!isMounted || !reportDate) return { yoga: [], ptMass: [], kabaddi: [], other: [] };

    const rawCompletions = (store?.data?.drillCompletionsRaw || []).filter((d: any) => 
      d.timestamp?.startsWith(reportDate)
    );

    // Also include custom logged activities for today
    const activitiesToday = (store?.data?.activities || []).filter((a: any) => 
      a.date === reportDate
    );

    const drillMap: Record<string, { sport: string; drill: string; boys: number; girls: number }> = {};

    // Process raw drill completions
    rawCompletions.forEach((d: any) => {
      const sport = d.sportName || d.drillId?.split('_')[0] || 'Sports';
      const drill = d.drillName || d.drillId?.split('_')[1] || 'Drill';
      const key = `${sport}___${drill}`;

      if (!drillMap[key]) {
        drillMap[key] = { sport, drill, boys: 0, girls: 0 };
      }

      // Check player gender if stored or lookup
      let gender = d.gender;
      if (!gender && d.playerId) {
        const p = players.find((pl: any) => pl.id === d.playerId);
        gender = p?.gender;
      }

      if (gender === 'Female') drillMap[key].girls++;
      else drillMap[key].boys++;
    });

    // Process logged activities
    activitiesToday.forEach((a: any) => {
      const sport = a.type || 'Activity';
      const drill = a.summary || a.type;
      const key = `${sport}___${drill}`;

      if (!drillMap[key]) {
        drillMap[key] = { 
          sport, 
          drill, 
          boys: parseInt(a.boysCount || '0') || 0, 
          girls: parseInt(a.girlsCount || '0') || 0 
        };
      } else {
        drillMap[key].boys += parseInt(a.boysCount || '0') || 0;
        drillMap[key].girls += parseInt(a.girlsCount || '0') || 0;
      }
    });

    const yoga: any[] = [];
    const ptMass: any[] = [];
    const kabaddi: any[] = [];
    const other: any[] = [];

    Object.values(drillMap).forEach((item) => {
      const lower = item.sport.toLowerCase();
      if (lower.includes('yoga')) yoga.push(item);
      else if (lower.includes('pt') || lower.includes('mass')) ptMass.push(item);
      else if (lower.includes('kabaddi')) kabaddi.push(item);
      else other.push(item);
    });

    return { yoga, ptMass, kabaddi, other };
  }, [store?.data?.drillCompletionsRaw, store?.data?.activities, players, reportDate, isMounted]);

  // Health summary count (NO student names)
  const healthSummaryCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.healthIncidents) return { boys: 0, girls: 0, total: 0, descriptions: [] };
    const healthToday = store.data.healthIncidents.filter((h: any) => h.date === reportDate);

    let boys = 0, girls = 0;
    const descriptions: string[] = [];

    healthToday.forEach((h: any) => {
      const p = players.find((player: any) => player.id === h.playerId);
      const gender = p?.gender || 'Male';
      if (gender === 'Female') girls++;
      else boys++;
      if (h.description) descriptions.push(h.description);
    });

    return { boys, girls, total: healthToday.length, descriptions };
  }, [store?.data?.healthIncidents, players, reportDate, isMounted]);

  // Fitness evaluation counts today
  const fitnessCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.fitness) return { boys: 0, girls: 0, total: 0 };
    const fitnessToday = Object.values(store.data.fitness).filter((f: any) => f.date === reportDate);
    let boys = 0, girls = 0;
    fitnessToday.forEach((f: any) => {
      const p = players.find((player: any) => player.id === f.playerId);
      if (p?.gender === 'Female') girls++;
      else boys++;
    });
    return { boys, girls, total: fitnessToday.length };
  }, [store?.data?.fitness, players, reportDate, isMounted]);

  // Handle Quick Add Activity Log
  const handleAddQuickActivity = () => {
    if (!customDrill || (customBoysCount <= 0 && customGirlsCount <= 0)) {
      toast({ title: "तपशील भरा (Fill Details)", description: "कृपया मुले/मुली संख्या टाका.", variant: "destructive" });
      return;
    }

    const activityId = `act_${Date.now()}`;
    const activityObj = {
      id: activityId,
      date: reportDate,
      type: customSport,
      summary: customDrill,
      boysCount: customBoysCount.toString(),
      girlsCount: customGirlsCount.toString(),
      totalCount: (customBoysCount + customGirlsCount).toString(),
      category: 'athlete',
      createdAt: new Date().toISOString()
    };

    if (store?.addActivity) {
      store.addActivity(activityObj);
      toast({ 
        title: "दैनिक उपक्रम नोंदवले! (Activity Saved)", 
        description: `${customSport}: ${customDrill} (मुले: ${customBoysCount}, मुली: ${customGirlsCount})`, 
        className: "bg-emerald-600 text-white font-bold" 
      });
    }
  };

  // Printable HTML Generator with Devanagari Marathi Header & NO Student Names
  const handlePrint = () => {
    if (!reportDate) return;
    
    const schoolNameMarathi = store?.data?.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक';
    const teacherName = store?.data?.schoolProfile?.teacherName || 'Teacher Sunil Deshmukh';

    const formatActivityTable = (items: any[], titleMarathi: string, titleEnglish: string) => {
      if (!items || items.length === 0) {
        return `<div class="empty-msg">आज ${titleMarathi} प्रकार आयोजित केले नाहीत / नोंदवलेले नाहीत.</div>`;
      }
      let html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>अनु.क्र. (Sr)</th>
              <th>प्रकार / प्रकाराचे नाव (Activity / Asana)</th>
              <th>मुले (Boys)</th>
              <th>मुली (Girls)</th>
              <th>एकूण (Total)</th>
            </tr>
          </thead>
          <tbody>
      `;
      items.forEach((item, index) => {
        const total = item.boys + item.girls;
        html += `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td><strong>${item.drill}</strong></td>
            <td style="text-align: center; color: #1e3a8a; font-weight: 800;">${item.boys}</td>
            <td style="text-align: center; color: #ec4899; font-weight: 800;">${item.girls}</td>
            <td style="text-align: center; color: #111827; font-weight: 900;">${total}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      return html;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Daily Report - ${reportDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap');
            
            @media print { 
              @page { size: A4; margin: 1.2cm; } 
              .no-print { display: none !important; } 
              body { padding-top: 0 !important; background: #fff !important; }
            }
            
            body { 
              font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; 
              padding: 24px; 
              line-height: 1.5; 
              color: #1f2937; 
              background: #f8fafc;
            }
            .paper {
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
              padding: 32px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
              border: 1px solid #e2e8f0;
            }
            .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 14px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px; }
            .report-title { font-size: 16px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub-header { font-size: 12px; font-weight: 700; color: #4b5563; margin-top: 4px; }
            
            .meta-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 10px; 
              background: #f1f5f9; 
              padding: 12px 16px; 
              border-radius: 8px; 
              margin-bottom: 24px;
              font-size: 12px;
              font-weight: 700;
            }
            
            h3 { 
              color: #1e3a8a; 
              font-size: 14px; 
              font-weight: 900; 
              border-left: 4px solid #1e3a8a; 
              padding-left: 10px; 
              margin-top: 24px; 
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            
            .stat-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px; }
            .card-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
            .card-title { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
            .card-numbers { display: flex; justify-content: space-around; text-align: center; }
            .num-item { font-size: 12px; font-weight: 700; }
            .num-val { font-size: 18px; font-weight: 900; }
            
            .report-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
            .report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            .report-table th { background: #1e3a8a; color: #ffffff; font-weight: 800; text-transform: uppercase; font-size: 11px; }
            .report-table tr:nth-child(even) { background: #f8fafc; }
            
            .empty-msg { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; text-align: center; border-radius: 8px; font-size: 12px; color: #64748b; font-style: italic; }
            .notes-box { background: #fffdf5; border: 1px solid #fef08a; padding: 14px; border-radius: 8px; font-size: 12px; line-height: 1.6; min-height: 70px; }
            
            .footer-sign { margin-top: 48px; display: flex; justify-content: space-between; padding: 0 20px; }
            .sign-block { text-align: center; border-top: 1.5px dashed #334155; width: 220px; padding-top: 6px; font-size: 12px; font-weight: 800; }
            
            .print-bar { 
              position: fixed; top: 0; left: 0; right: 0; 
              background: #1e3a8a; color: #fff; padding: 12px 24px; 
              display: flex; justify-content: space-between; align-items: center; 
              z-index: 9999; box-shadow: 0 4px 14px rgba(0,0,0,0.15); 
            }
            .btn { 
              cursor: pointer; padding: 10px 20px; border-radius: 8px; 
              font-weight: 800; font-size: 12px; border: none; transition: all 0.2s; 
            }
            .btn-back { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
            .btn-print { background: #f59e0b; color: #fff; font-weight: 900; }
          </style>
        </head>
        <body style="padding-top: 70px;">
          <div class="no-print print-bar">
            <button onclick="window.close()" class="btn btn-back">← मागे जा (Go Back)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (PRINT PDF)</button>
          </div>

          <div class="paper">
            <div class="header">
              <div class="school-name">${schoolNameMarathi}</div>
              <div class="report-title">दैनिक क्रीडा, योगा व शारीरिक शिक्षण अहवाल</div>
              <div class="sub-header">(DAILY ACTIVITY & PHYSICAL EDUCATION REPORT)</div>
            </div>

            <div class="meta-grid">
              <div>📅 तारीख (Date): <strong>${reportDate ? format(new Date(reportDate), 'dd-MM-yyyy') : '---'}</strong></div>
              <div>🌤️ हवामान (Weather): <strong>${weather}</strong></div>
              <div>👨‍🏫 क्रीडा मार्गदर्शक: <strong>${teacherName}</strong></div>
            </div>

            <h3>१. संस्थात्मक उपस्थिती अहवाल (Attendance Summary)</h3>
            <div class="stat-cards">
              <div class="card-box">
                <div class="card-title">☀️ सकाळ सत्र (Morning Session)</div>
                <div class="card-numbers">
                  <div class="num-item"><span style="color: #1e3a8a;">मुले:</span> <div class="num-val" style="color: #1e3a8a;">${attendanceCounts.morningBoys}</div></div>
                  <div class="num-item"><span style="color: #ec4899;">मुली:</span> <div class="num-val" style="color: #ec4899;">${attendanceCounts.morningGirls}</div></div>
                  <div class="num-item"><span style="color: #111827;">एकूण:</span> <div class="num-val">${attendanceCounts.morningTotal}</div></div>
                </div>
              </div>

              <div class="card-box">
                <div class="card-title">🌙 संध्याकाळ सत्र (Evening Session)</div>
                <div class="card-numbers">
                  <div class="num-item"><span style="color: #1e3a8a;">मुले:</span> <div class="num-val" style="color: #1e3a8a;">${attendanceCounts.eveningBoys}</div></div>
                  <div class="num-item"><span style="color: #ec4899;">मुली:</span> <div class="num-val" style="color: #ec4899;">${attendanceCounts.eveningGirls}</div></div>
                  <div class="num-item"><span style="color: #111827;">एकूण:</span> <div class="num-val">${attendanceCounts.eveningTotal}</div></div>
                </div>
              </div>
            </div>

            <h3>२. योगासन व प्राणायाम सत्र (Yoga & Pranayama Session)</h3>
            ${formatActivityTable(drillGroupedSummary.yoga, 'योगासन', 'Yoga')}

            <h3>३. पी. टी. मास व कवायत प्रकार (PT Mass Exercises)</h3>
            ${formatActivityTable(drillGroupedSummary.ptMass, 'पी.टी. मास', 'PT Mass')}

            <h3>४. कबड्डी व इतर खेळ ड्रिल्स (Kabaddi & Sports Drills)</h3>
            ${formatActivityTable(drillGroupedSummary.kabaddi.concat(drillGroupedSummary.other), 'खेळ ड्रिल्स', 'Sports Drills')}

            <h3>५. आरोग्य व वैद्यकीय स्वास्थ लॉग (Health & Medical Log)</h3>
            <div class="card-box">
              <div class="card-numbers" style="margin-bottom: 8px;">
                <div class="num-item"><span style="color: #1e3a8a;">बाधित मुले (Boys):</span> <strong style="font-size: 16px;">${healthSummaryCounts.boys}</strong></div>
                <div class="num-item"><span style="color: #ec4899;">बाधित मुली (Girls):</span> <strong style="font-size: 16px;">${healthSummaryCounts.girls}</strong></div>
                <div class="num-item"><span style="color: #b45309;">एकूण तक्रारी (Total Alerts):</span> <strong style="font-size: 16px;">${healthSummaryCounts.total}</strong></div>
              </div>
              ${healthSummaryCounts.total === 0 
                ? '<div class="empty-msg" style="padding: 6px;">आज कोणतीही वैद्यकीय तक्रार किंवा आरोग्य अडचण नोंदवली गेली नाही. (All Healthy)</div>' 
                : `<div style="font-size: 11px; color: #dc2626; font-weight: 700; border-top: 1px solid #fee2e2; padding-top: 6px;">लॉग नोंद: ${healthSummaryCounts.descriptions.join(' | ')}</div>`
              }
            </div>

            <h3>६. मार्गदर्शक / शिक्षकांचे निरीक्षण व शेरा (Instructor Remarks)</h3>
            <div class="notes-box">
              ${manualNotes || 'आजचे क्रीडा, योगा व शारीरिक शिक्षण सत्र नियोजनानुसार पार पडले. सर्व विद्यार्थी उपक्रमात उत्साहाने सहभागी झाले.'}
            </div>

            <div class="footer-sign">
              <div class="sign-block">
                <div>क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-block">
                <div>मुख्याध्यापक स्वाक्षरी</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">(शासकीय माध्यमिक आश्रम शाळा वाघंबा)</div>
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

  // WhatsApp School Group Formatted Text Sharing
  const handleShareWhatsApp = () => {
    const schoolName = store?.data?.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक';
    const formattedDate = reportDate ? format(new Date(reportDate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

    let text = `🚩 *${schoolName}* 🚩\n`;
    text += `📋 *दैनिक क्रीडा, योगा व पी.टी. अहवाल*\n`;
    text += `📅 तारीख: *${formattedDate}*\n\n`;

    text += `👥 *१. संस्थात्मक उपस्थिती:* \n`;
    text += `• सकाळ सत्र: मुले: ${attendanceCounts.morningBoys}, मुली: ${attendanceCounts.morningGirls} (एकूण: ${attendanceCounts.morningTotal})\n`;
    text += `• संध्याकाळ सत्र: मुले: ${attendanceCounts.eveningBoys}, मुली: ${attendanceCounts.eveningGirls} (एकूण: ${attendanceCounts.eveningTotal})\n\n`;

    if (drillGroupedSummary.yoga.length > 0) {
      text += `🧘 *२. योगासन सत्र:* \n`;
      drillGroupedSummary.yoga.forEach((item) => {
        text += `• ${item.drill}: मुले: ${item.boys}, मुली: ${item.girls} (एकूण: ${item.boys + item.girls})\n`;
      });
      text += `\n`;
    }

    if (drillGroupedSummary.ptMass.length > 0) {
      text += `🏃 *३. पी.टी. मास कवायत:* \n`;
      drillGroupedSummary.ptMass.forEach((item) => {
        text += `• ${item.drill}: मुले: ${item.boys}, मुली: ${item.girls} (एकूण: ${item.boys + item.girls})\n`;
      });
      text += `\n`;
    }

    if (drillGroupedSummary.kabaddi.length > 0 || drillGroupedSummary.other.length > 0) {
      text += `🤼 *४. कबड्डी व ड्रिल्स:* \n`;
      [...drillGroupedSummary.kabaddi, ...drillGroupedSummary.other].forEach((item) => {
        text += `• ${item.drill}: मुले: ${item.boys}, मुली: ${item.girls} (एकूण: ${item.boys + item.girls})\n`;
      });
      text += `\n`;
    }

    text += `🏥 *५. आरोग्य अहवाल:* \n`;
    text += `• तक्रारी: मुले: ${healthSummaryCounts.boys}, मुली: ${healthSummaryCounts.girls} (एकूण: ${healthSummaryCounts.total})\n\n`;

    if (manualNotes) {
      text += `📝 *शेरा:* ${manualNotes}\n\n`;
    }

    text += `✍️ *क्रीडा मार्गदर्शक:* ${store?.data?.schoolProfile?.teacherName || 'Sunil Deshmukh'}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20" suppressHydrationWarning>
      {/* Top Banner */}
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-3 text-center lg:text-left">
            <Badge className="bg-primary text-white text-[10px] font-black uppercase px-4 py-1 tracking-widest">
              Daily Auto-Report Engine
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight flex items-center justify-center lg:justify-start gap-3">
              <FileText className="w-9 h-9 text-amber-500" /> दैनिक अहवाल (Daily Report)
            </h2>
            <p className="text-sm font-semibold text-foreground/70">
              शाळेचे नाव मराठीत, योगा, पी.टी. मास व कबड्डी ड्रिल्सच्या मुले/मुलींच्या संख्येचा स्वयंचलित अहवाल.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-primary uppercase ml-2 tracking-widest">निवडा तारीख (Date)</label>
              <Input 
                type="date" 
                value={reportDate} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportDate(e.target.value)} 
                className="rounded-2xl border-2 h-12 font-black shadow-sm bg-white" 
              />
            </div>
            
            <div className="flex gap-2 self-end">
              <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white h-12 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active-scale px-6">
                <Printer className="w-4 h-4 mr-2" /> प्रिंट / PDF
              </Button>
              <Button onClick={handleShareWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active-scale px-6">
                <Share2 className="w-4 h-4 mr-2" /> शाळा ग्रुप
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-blue-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full">सकाळ सत्र (Morning)</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{attendanceCounts.morningBoys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{attendanceCounts.morningGirls}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
              <p className="text-[9px] font-bold text-slate-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-slate-900">{attendanceCounts.morningTotal}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">संध्याकाळ सत्र (Evening)</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{attendanceCounts.eveningBoys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{attendanceCounts.eveningGirls}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
              <p className="text-[9px] font-bold text-slate-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-slate-900">{attendanceCounts.eveningTotal}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-emerald-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">फिटनेस मूल्यमापन</span>
            <Zap className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{fitnessCounts.boys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{fitnessCounts.girls}</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <p className="text-[9px] font-bold text-emerald-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-emerald-900">{fitnessCounts.total}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-amber-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full">आरोग्य तक्रारी</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{healthSummaryCounts.boys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{healthSummaryCounts.girls}</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <p className="text-[9px] font-bold text-amber-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-amber-900">{healthSummaryCounts.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Column for Recorded Activities, Right Column for Quick Add & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recorded Activities Breakdown */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Yoga Activities Section */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-indigo-50/60 border-b p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> १. योगासन व प्राणायाम सत्र (Yoga & Pranayama)
              </CardTitle>
              <Badge variant="outline" className="font-bold border-indigo-200 text-indigo-700 bg-white">
                {drillGroupedSummary.yoga.length} उपक्रम प्रकार
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {drillGroupedSummary.yoga.length === 0 ? (
                <p className="text-xs font-bold text-muted-foreground italic text-center py-6">
                  आज योगासन उपक्रम नोंदवलेले नाहीत. खालील &quot;त्वरित उपक्रम नोंद&quot; बॉक्समधून नोंदवा.
                </p>
              ) : (
                <div className="space-y-3">
                  {drillGroupedSummary.yoga.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                      <div>
                        <p className="font-black text-sm text-indigo-950 uppercase">{item.drill}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">{item.sport}</p>
                      </div>
                      <div className="flex gap-3 text-center">
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                          <span className="text-blue-900 font-black">{item.boys}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                          <span className="text-pink-900 font-black">{item.girls}</span>
                        </div>
                        <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                          <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                          <span className="font-black">{item.boys + item.girls}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PT Mass Exercises Section */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-teal-50/60 border-b p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" /> २. पी. टी. मास व कवायत (PT Mass Exercises)
              </CardTitle>
              <Badge variant="outline" className="font-bold border-teal-200 text-teal-700 bg-white">
                {drillGroupedSummary.ptMass.length} कवायत प्रकार
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {drillGroupedSummary.ptMass.length === 0 ? (
                <p className="text-xs font-bold text-muted-foreground italic text-center py-6">
                  आज पी.टी. मास किंवा कवायत प्रकार नोंदवलेले नाहीत.
                </p>
              ) : (
                <div className="space-y-3">
                  {drillGroupedSummary.ptMass.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-teal-50/30 rounded-2xl border border-teal-100">
                      <div>
                        <p className="font-black text-sm text-teal-950 uppercase">{item.drill}</p>
                        <p className="text-[10px] font-bold text-teal-600 uppercase mt-0.5">{item.sport}</p>
                      </div>
                      <div className="flex gap-3 text-center">
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                          <span className="text-blue-900 font-black">{item.boys}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                          <span className="text-pink-900 font-black">{item.girls}</span>
                        </div>
                        <div className="bg-teal-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                          <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                          <span className="font-black">{item.boys + item.girls}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kabaddi & Sports Drills Section */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-amber-50/60 border-b p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" /> ३. कबड्डी व इतर खेळ ड्रिल्स (Kabaddi & Drills)
              </CardTitle>
              <Badge variant="outline" className="font-bold border-amber-200 text-amber-700 bg-white">
                {drillGroupedSummary.kabaddi.length + drillGroupedSummary.other.length} ड्रिल्स
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {[...drillGroupedSummary.kabaddi, ...drillGroupedSummary.other].length === 0 ? (
                <p className="text-xs font-bold text-muted-foreground italic text-center py-6">
                  आज कबड्डी किंवा इतर खेळाचे ड्रिल्स नोंदवलेले नाहीत.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...drillGroupedSummary.kabaddi, ...drillGroupedSummary.other].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
                      <div>
                        <p className="font-black text-sm text-amber-950 uppercase">{item.drill}</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">{item.sport}</p>
                      </div>
                      <div className="flex gap-3 text-center">
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                          <span className="text-blue-900 font-black">{item.boys}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                          <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                          <span className="text-pink-900 font-black">{item.girls}</span>
                        </div>
                        <div className="bg-amber-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                          <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                          <span className="font-black">{item.boys + item.girls}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Logger & Instructor Remarks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Log Activity Box */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-primary/20">
            <CardHeader className="bg-primary p-6 text-white">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" /> त्वरित उपक्रम नोंदवा (Quick Log)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">उपक्रम वर्ग (Category)</label>
                <Select value={customSport} onValueChange={(val) => {
                  setCustomSport(val);
                  if (val === 'Yoga') setCustomDrill("Surya Namaskar (सूर्य नमस्कार)");
                  else if (val === 'PT Mass') setCustomDrill("Mass PT Exercise No 1");
                  else setCustomDrill("Dubki practice drill");
                }}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yoga">Yoga & Pranayama (योगा)</SelectItem>
                    <SelectItem value="PT Mass">PT Mass (पी. टी. मास)</SelectItem>
                    <SelectItem value="Kabaddi">Kabaddi (कबड्डी)</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                    <SelectItem value="Kho Kho">Kho Kho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">प्रकार / आसन (Drill / Asana)</label>
                <Input 
                  value={customDrill} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDrill(e.target.value)} 
                  placeholder="उदा. सूर्य नमस्कार / Mass PT 1" 
                  className="h-12 rounded-xl border-2 font-bold text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-600 ml-1">मुले (Boys Count)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={customBoysCount} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomBoysCount(parseInt(e.target.value) || 0)} 
                    className="h-12 rounded-xl border-2 font-black text-center text-blue-900" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-600 ml-1">मुली (Girls Count)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={customGirlsCount} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomGirlsCount(parseInt(e.target.value) || 0)} 
                    className="h-12 rounded-xl border-2 font-black text-center text-pink-900" 
                  />
                </div>
              </div>

              <Button onClick={handleAddQuickActivity} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-md">
                <CheckCircle2 className="w-4 h-4 mr-2" /> अहवालात जोडा (Save Log)
              </Button>
            </CardContent>
          </Card>

          {/* Observations & Remarks */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                मार्गदर्शक शेरा व हवामान
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">हवामान (Weather Context)</label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunny">Sunny (लख्ख ऊन) ☀️</SelectItem>
                    <SelectItem value="Rainy">Rainy (पावसाळी) 🌧️</SelectItem>
                    <SelectItem value="Overcast">Overcast (ढगाळ) ☁️</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">क्रीडा मार्गदर्शक निरीक्षण (Remarks)</label>
                <Textarea 
                  value={manualNotes} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualSummary(e.target.value)} 
                  placeholder="आजच्या उपक्रमाबाबत विशेष निरीक्षण किंवा नोंद येथे लिहा..." 
                  className="min-h-[140px] rounded-2xl border-2 p-4 font-medium text-sm" 
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
