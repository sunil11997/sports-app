"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Utensils, 
  Printer, 
  Apple, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  HeartPulse, 
  AlertCircle,
  Wheat,
  Activity
} from 'lucide-react';
import { 
  ASHRAM_MESS_WEEKLY_MENU, 
  TOURNAMENT_DAY_FUELING_TIMELINE,
  DayNutritionSchedule 
} from '@/data/ashramMessNutrition';
import { getOfficialSchoolName, getTeacherName } from '@/lib/utils';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';

interface AshramMessNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
}

export function AshramMessNutritionModal({
  isOpen,
  onClose,
  store
}: AshramMessNutritionModalProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'matchday' | 'hydration'>('weekly');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);

  const activeDay = ASHRAM_MESS_WEEKLY_MENU[selectedDayIdx] || ASHRAM_MESS_WEEKLY_MENU[0];

  const handlePrintDietChart = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="mr">
        <head>
          <title>आश्रम शाळा क्रीडा पोषण आहार तक्ता - ${schoolName}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print {
              @page { size: A4 landscape; margin: 0.8cm; }
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; font-size: 11px; }
            .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
            .dept-title { font-size: 13px; font-weight: 800; color: #b45309; }
            .school-title { font-size: 17px; font-weight: 900; color: #1e3a8a; margin: 4px 0; }
            .sub-title { font-size: 12px; font-weight: 800; color: #0f766e; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1.5px solid #334155; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background-color: #1e3a8a; color: white; font-weight: 800; text-align: center; font-size: 10.5px; }
            .day-col { font-weight: 800; background-color: #f1f5f9; width: 14%; text-align: center; vertical-align: middle; }
            .meal-time { font-size: 9.5px; font-weight: 800; color: #0f766e; display: block; margin-bottom: 2px; }
            .items-list { margin: 0; padding-left: 14px; font-weight: 700; }
            .nutrition-note { font-size: 9px; color: #475569; margin-top: 3px; font-style: italic; }
            
            .guidelines-box { margin-top: 12px; padding: 8px 12px; background: #fefce8; border: 1.5px dashed #ca8a04; border-radius: 6px; font-size: 10px; }
            
            .sig-table { width: 100%; border-collapse: collapse; margin-top: 25px; border: none; }
            .sig-table td { border: none; padding: 10px 20px; text-align: center; width: 33.33%; }
            .sig-title { font-weight: 800; font-size: 11px; }
            .sig-sub { font-size: 9.5px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="dept-title">महाराष्ट्र शासन • आदिवासी विकास विभाग (नाशिक प्रकल्प)</div>
            <div class="school-title">${schoolName}</div>
            <div class="sub-title">आश्रम शाळा क्रीडा व शारीरिक विकास पोषण आहार वेळापत्रक (Sports Diet Chart)</div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-top: 3px;">
              शासकीय वसतिगृह मेस रेशनवर आधारित पोषण नियोजन • सर्व खेळाडू व क्रीडा प्रकार
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>वार (Day)</th>
                <th>सकाळचा नाश्ता (Post-Practice)</th>
                <th>दुपारचे जेवण (Lunch)</th>
                <th>संध्याकाळचा सराव पूर्व नाश्ता (Pre-Practice)</th>
                <th>रात्रीचे जेवण (Dinner)</th>
              </tr>
            </thead>
            <tbody>
              ${ASHRAM_MESS_WEEKLY_MENU.map(day => `
                <tr>
                  <td class="day-col">${day.dayNameMr}</td>
                  <td>
                    <span class="meal-time">${day.breakfast.timeWindow}</span>
                    <ul class="items-list">
                      ${day.breakfast.itemsMr.map(it => `<li>${it}</li>`).join('')}
                    </ul>
                    <div class="nutrition-note">${day.breakfast.nutritionalValueMr}</div>
                  </td>
                  <td>
                    <span class="meal-time">${day.lunch.timeWindow}</span>
                    <ul class="items-list">
                      ${day.lunch.itemsMr.map(it => `<li>${it}</li>`).join('')}
                    </ul>
                    <div class="nutrition-note">${day.lunch.nutritionalValueMr}</div>
                  </td>
                  <td>
                    <span class="meal-time">${day.eveningSnack.timeWindow}</span>
                    <ul class="items-list">
                      ${day.eveningSnack.itemsMr.map(it => `<li>${it}</li>`).join('')}
                    </ul>
                    <div class="nutrition-note">${day.eveningSnack.nutritionalValueMr}</div>
                  </td>
                  <td>
                    <span class="meal-time">${day.dinner.timeWindow}</span>
                    <ul class="items-list">
                      ${day.dinner.itemsMr.map(it => `<li>${it}</li>`).join('')}
                    </ul>
                    <div class="nutrition-note">${day.dinner.nutritionalValueMr}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="guidelines-box">
            <strong>विशेष क्रीडा पोषण सूचना:</strong> 
            १) खेळाडूंना सरावाच्या ३० मिनिटांनंतर उकडलेली अंडी किंवा मोड आलेले कडधान्य देणे अनिवार्य आहे.
            २) तीव्र उष्णतेच्या काळात दररोज जेवणासोबत ताक किंवा लिंबू पाण्याचे वाटप करावे.
            ३) बाहेरील जंक फूड किंवा अति तळलेले पदार्थ खेळाडूंना पूर्णपणे वर्ज्य आहेत.
          </div>

          <table class="sig-table">
            <tr>
              <td>
                <div style="height: 40px;"></div>
                <div class="sig-title">मेस व्यवस्थापक / स्वयंपाकी</div>
                <div class="sig-sub">आश्रम शाळा वाघंबा</div>
              </td>
              <td>
                <div style="height: 40px;"></div>
                <div class="sig-title">वसतिगृह अधीक्षक (गृहपाल)</div>
                <div class="sig-sub">शासकीय आश्रम शाळा</div>
              </td>
              <td>
                <div style="height: 40px;"></div>
                <div class="sig-title">${teacherName}</div>
                <div class="sig-sub">क्रीडा शिक्षक / मुख्याध्यापक</div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 350);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader className="p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-amber-400 tracking-tight flex items-center gap-2">
                  आश्रम शाळा पोषण आहार नियोजन (Sports Mess Nutrition)
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    Govt Ration Compatible
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-slate-400 font-medium">
                  {schoolName} • शासकीय मेस रेशनवर आधारित दैनिक व सामना पूर्व पोषण
                </p>
              </div>
            </div>

            <Button
              onClick={handlePrintDietChart}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4" />
              डाएट चार्ट प्रिंट करा
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="bg-slate-950/70 border border-slate-800 p-1 w-full grid grid-cols-3 rounded-xl">
              <TabsTrigger value="weekly" className="text-xs font-bold gap-2">
                <Wheat className="w-3.5 h-3.5 text-amber-400" />
                साप्ताहिक मेस वेळापत्रक (Weekly Menu)
              </TabsTrigger>
              <TabsTrigger value="matchday" className="text-xs font-bold gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                सामना दिवस ऊर्जा नियोजन (Matchday Fueling)
              </TabsTrigger>
              <TabsTrigger value="hydration" className="text-xs font-bold gap-2">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                हायड्रेशन व रिकव्हरी (Hydration Protocol)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: WEEKLY MENU */}
            <TabsContent value="weekly" className="space-y-5 pt-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ASHRAM_MESS_WEEKLY_MENU.map((day, idx) => (
                  <Button
                    key={idx}
                    variant={selectedDayIdx === idx ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`rounded-xl text-xs font-bold whitespace-nowrap ${
                      selectedDayIdx === idx 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' 
                        : 'border-slate-800 bg-slate-950/50 text-slate-300'
                    }`}
                  >
                    {day.dayNameMr.split(' ')[0]}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breakfast */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {activeDay.breakfast.mealTimeMr}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {activeDay.breakfast.timeWindow}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-200">
                    {activeDay.breakfast.itemsMr.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2 rounded-lg font-medium">
                    ⚡ पोषण मूल्य: {activeDay.breakfast.nutritionalValueMr}
                  </div>
                </div>

                {/* Lunch */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {activeDay.lunch.mealTimeMr}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {activeDay.lunch.timeWindow}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-200">
                    {activeDay.lunch.itemsMr.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-emerald-300/80 bg-emerald-500/10 p-2 rounded-lg font-medium">
                    🌱 पोषण मूल्य: {activeDay.lunch.nutritionalValueMr}
                  </div>
                </div>

                {/* Pre-Practice Evening Snack */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      {activeDay.eveningSnack.mealTimeMr}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {activeDay.eveningSnack.timeWindow}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-200">
                    {activeDay.eveningSnack.itemsMr.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-orange-300/80 bg-orange-500/10 p-2 rounded-lg font-medium">
                    🔥 पोषण मूल्य: {activeDay.eveningSnack.nutritionalValueMr}
                  </div>
                </div>

                {/* Dinner */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {activeDay.dinner.mealTimeMr}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {activeDay.dinner.timeWindow}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-200">
                    {activeDay.dinner.itemsMr.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-indigo-300/80 bg-indigo-500/10 p-2 rounded-lg font-medium">
                    🌙 पोषण मूल्य: {activeDay.dinner.nutritionalValueMr}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: MATCHDAY TIMELINE */}
            <TabsContent value="matchday" className="space-y-4 pt-4">
              <div className="space-y-3">
                {TOURNAMENT_DAY_FUELING_TIMELINE.map((step, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {step.timeBeforeMatch}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-300">
                      {step.recommendedIntakeMr}
                    </p>
                    <div className="bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-xl space-y-1">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                        आश्रम मेस मधील उपलब्ध पर्याय:
                      </span>
                      <ul className="text-xs text-emerald-200 space-y-0.5 pl-4 list-disc font-medium">
                        {step.itemsAvailableInAshramMr.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-[11px] text-rose-300 bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg font-medium">
                      ⚠️ काय टाळावे: {step.strictAvoidMr}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: HYDRATION & RECOVERY */}
            <TabsContent value="hydration" className="space-y-4 pt-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-500" />
                  आश्रम शाळा नैसर्गिक इलेक्ट्रोलाइट व हायड्रेशन नियम
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <span className="font-bold text-amber-400 block">१. घरगुती ओआरएस / जलसंजीवनी:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      १ लिटर उकळवून थंड केलेले पाणी + १ लहान चमचा मीठ + ४ लहान चमचे साखर किंवा गूळ + अर्धे लिंबू.
                      तीव्र उन्हाळ्यात दुपारच्या सरावादरम्यान खेळाडूंना द्यावे.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <span className="font-bold text-emerald-400 block">२. ताक व जिरे-मीठ:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      दुपारच्या जेवणात १ पेला पातळ ताकात थोडे काळे मीठ व भाजलेले जिरे घालून दिल्यास शरीराचे तापमान नियंत्रित राहते व पचनक्रिया सुरळीत होते.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <span className="font-bold text-orange-400 block">३. क्रॅम्प्स (गोळे येणे) प्रतिबंध:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      कबड्डी व खो-खो खेळाडूंच्या पोटरीच्या स्नायूंमध्ये गोळे येणे टाळण्यासाठी पोटॅशियमयुक्त केळी व गुळ-शेंगदाणे सराव पूर्व नाश्त्यात नियमित असावेत.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <span className="font-bold text-indigo-400 block">४. स्नायू पुनर्प्राप्ती (Muscle Repair):</span>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      सामना संपल्यानंतर ३० मिनिटांच्या आत उकडलेले अंडे किंवा मोड आलेली मटकी/मूग खाल्ल्याने स्नायूंचे नुकसान भरून निघते.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
          <p className="text-[11px] text-slate-500 font-medium">
            वाघंबा आश्रम शाळा • आदिवासी विकास विभाग पोषण मार्गदर्शिका
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            बंद करा
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
