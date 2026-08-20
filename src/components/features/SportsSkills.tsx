"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Trophy, 
  Save, 
  Printer, 
  UserCircle, 
  Star, 
  Target, 
  ShieldCheck, 
  ChevronRight, 
  MessageSquare, 
  Info, 
  Check, 
  Sparkles, 
  Filter,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  TrendingUp,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn, shareToWhatsApp, getAgeValidation, transliterateEnglishToMarathi, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { YogaPtGuideModal } from '@/components/ui/YogaPtGuideModal';
import { format } from 'date-fns';

const sportsList = ['Yoga', 'PT Mass', 'Kabaddi', 'Volleyball', 'Handball', 'Kho Kho', 'Running', 'Shot Put', 'Javelin Throw', 'Disc Throw', 'Long Jump', 'High Jump'];
const ALL_CLASSES = ['5', '6', '7', '8', '9', '10'];

export interface SkillItem {
  id: string;
  name: string;
  nameMr: string;
  category: 'Fundamental' | 'Offensive' | 'Defensive' | 'Advanced';
}

export const DETAILED_SKILLS_DATA: Record<string, SkillItem[]> = {
  'Yoga': [
    { id: 'sn', name: 'Surya Namaskar', nameMr: 'सूर्य नमस्कार (१२ स्थिती)', category: 'Fundamental' },
    { id: 'tad', name: 'Tadasana', nameMr: 'ताडासन (उंची व तोल)', category: 'Fundamental' },
    { id: 'vrik', name: 'Vrikshasana', nameMr: 'वृक्षासन (एकाग्रता व संतुलन)', category: 'Fundamental' },
    { id: 'bhuj', name: 'Bhujangasana', nameMr: 'भुजंगासन (पाठीचा मणका लवचिकता)', category: 'Fundamental' },
    { id: 'padm', name: 'Padmasana', nameMr: 'पद्मासन (ध्यान मुद्रा)', category: 'Fundamental' },
    { id: 'anul', name: 'Anulom Vilom', nameMr: 'अनुलोम विलोम प्राणायाम', category: 'Advanced' },
    { id: 'kapal', name: 'Kapalbhati', nameMr: 'कपालभाती प्राणायाम', category: 'Advanced' },
    { id: 'shav', name: 'Shavasana', nameMr: 'शवासन (विश्रांती व श्वसन)', category: 'Fundamental' },
    { id: 'trik', name: 'Trikonasana', nameMr: 'त्रिकोणासन (कंबर व मांड्या)', category: 'Fundamental' },
    { id: 'pasch', name: 'Paschimottanasana', nameMr: 'पश्चिमोत्तानासन', category: 'Advanced' }
  ],
  'PT Mass': [
    { id: 'pt1', name: 'Mass PT Ex 1', nameMr: 'पी.टी. प्रकार क्र. १ (हात वर व बाजूला)', category: 'Fundamental' },
    { id: 'pt2', name: 'Mass PT Ex 2', nameMr: 'पी.टी. प्रकार क्र. २ (छातीचा विस्तार)', category: 'Fundamental' },
    { id: 'pt3', name: 'Mass PT Ex 3', nameMr: 'पी.टी. प्रकार क्र. ३ (कंबर वाकवणे)', category: 'Fundamental' },
    { id: 'pt4', name: 'Mass PT Ex 4', nameMr: 'पी.टी. प्रकार क्र. ४ (बाजूला झुकणे)', category: 'Fundamental' },
    { id: 'pt5', name: 'Mass PT Ex 5', nameMr: 'पी.टी. प्रकार क्र. ५ (उड्या मारणे - Jacks)', category: 'Advanced' },
    { id: 'pt_warm', name: 'Freehand Warm-up', nameMr: 'वॉर्म-अप व स्ट्रेचिंग कवायत', category: 'Fundamental' },
    { id: 'pt_march', name: 'Marching in Place', nameMr: 'संचलनाची लयबद्ध हालचाल', category: 'Fundamental' }
  ],
  'Kabaddi': [
    { id: 'kab_raid', name: 'Raiding & Cant Chant', nameMr: 'चढाई व अखंड कॅन्ट (Chanting)', category: 'Offensive' },
    { id: 'kab_hand', name: 'Running Hand Touch', nameMr: 'रनिंग हँड टच (धावून हात लावणे)', category: 'Offensive' },
    { id: 'kab_toe', name: 'Toe Touch Execution', nameMr: 'टो टच (पायाच्या अंगठ्याने स्पर्श)', category: 'Offensive' },
    { id: 'kab_dubki', name: 'Dubki / Lion Jump', nameMr: 'डुबकी व हवेत जंप मारून सुटका', category: 'Advanced' },
    { id: 'kab_bonus', name: 'Bonus Line Cross', nameMr: 'बोनस रेषा पार करणे', category: 'Offensive' },
    { id: 'kab_ankle', name: 'Ankle Hold (घोटा पकड)', nameMr: 'अँकल होल्ड (घोटा पकड)', category: 'Defensive' },
    { id: 'kab_thigh', name: 'Thigh Hold (मांडी पकड)', nameMr: 'थाय होल्ड (मांडी पकड)', category: 'Defensive' },
    { id: 'kab_chain', name: 'Chain Tackle / Corner Cover', nameMr: 'साखळी पकड व कव्हर डिफेन्स', category: 'Defensive' },
    { id: 'kab_dash', name: 'Cover Dash (बाहेर ढकलणे)', nameMr: 'कव्हर डॅश (बाहेर ढकलणे)', category: 'Defensive' },
    { id: 'kab_foot', name: 'Footwork & Agility', nameMr: 'फुटवर्क व चपळता', category: 'Fundamental' }
  ],
  'Volleyball': [
    { id: 'vol_under_serve', name: 'Underhand / Float Serve', nameMr: 'अंडरहँड / फ्लोट सर्व्हिस', category: 'Fundamental' },
    { id: 'vol_pass', name: 'Underarm Bump Passing', nameMr: 'अंडरआर्म पासिंग (Bump Pass)', category: 'Fundamental' },
    { id: 'vol_set', name: 'Overhead Setting', nameMr: 'ओव्हरहेड सेटिंग (बोटांनी पास)', category: 'Offensive' },
    { id: 'vol_spike', name: 'Spiking & Attack Shot', nameMr: 'स्पाईकिंग (बॉल कोर्टात मारणे)', category: 'Offensive' },
    { id: 'vol_block', name: 'Net Blocking & Timing', nameMr: 'नेट ब्लॉकिंग (उडी व हात पोझिशन)', category: 'Defensive' },
    { id: 'vol_dig', name: 'Digging & Floor Defense', nameMr: 'डिगिंग व खाली वाकून चेंडू काढणे', category: 'Defensive' },
    { id: 'vol_rot', name: 'Court Rotation & Awareness', nameMr: 'कोर्ट रोटेशन व संवाद', category: 'Fundamental' }
  ],
  'Kho Kho': [
    { id: 'kho_sit', name: 'Sitting & Giving Kho', nameMr: 'योग्य बैठक व जलद खो देणे', category: 'Fundamental' },
    { id: 'kho_dive', name: 'Pole Diving (पोल डायव्ह)', nameMr: 'पोल डायव्ह व पोल टर्निंग', category: 'Advanced' },
    { id: 'kho_dodge', name: 'Dodging & Zig-Zag Run', nameMr: 'डॉजिंग व झिग-झॅग धावणे', category: 'Defensive' },
    { id: 'kho_fake', name: 'Direction Change Fake', nameMr: 'दिशेची फसवणूक (Fake Movement)', category: 'Defensive' },
    { id: 'kho_ring', name: 'Ring Play in Middle', nameMr: 'मध्य चौकोनात रिंग प्ले', category: 'Defensive' },
    { id: 'kho_chase', name: 'Fast Chasing & Tapping', nameMr: 'वेगाने पाठलाग व स्पर्श', category: 'Offensive' }
  ],
  'Handball': [
    { id: 'hb_pass', name: 'Wrist & Chest Passing', nameMr: 'मनगट व छाती पासेस', category: 'Fundamental' },
    { id: 'hb_drib', name: 'Speed Dribbling', nameMr: 'वेगाने ड्रिबलिंग व नियंत्रण', category: 'Offensive' },
    { id: 'hb_jump_shot', name: '3-Step Jump Shot', nameMr: '३-स्टेप जंप शॉट (उडी मारून गोल)', category: 'Offensive' },
    { id: 'hb_block', name: 'Defensive Wall Blocking', nameMr: 'डिफेन्स वॉल ब्लॉकिंग', category: 'Defensive' },
    { id: 'hb_gk', name: 'Goalkeeping Reflexes', nameMr: 'गोलकीपिंग चपळता व रिफ्लेक्स', category: 'Defensive' }
  ],
  'Running': [
    { id: 'run_start', name: 'Crouch / Standing Start', nameMr: 'क्राउच स्टार्ट (On Your Mark - Go)', category: 'Fundamental' },
    { id: 'run_acc', name: 'Linear Acceleration', nameMr: 'सुरुवातीचा वेग वाढवणे (Acceleration)', category: 'Fundamental' },
    { id: 'run_posture', name: 'Sprint Posture & Arm Drive', nameMr: 'धावण्याची मुद्रा व हात हालचाल', category: 'Fundamental' },
    { id: 'run_breath', name: 'Breathing Control', nameMr: 'श्वसन नियंत्रण व स्टॅमिना', category: 'Fundamental' },
    { id: 'run_finish', name: 'Torso Finish Lean', nameMr: 'फिनिशिंग लाईनवर छाती पुढे झुकवणे', category: 'Advanced' }
  ],
  'Shot Put': [
    { id: 'sp_grip', name: 'Neck Stance & Grip', nameMr: 'मानेजवळ गोळा ठेवणे व ग्रिप', category: 'Fundamental' },
    { id: 'sp_glide', name: 'Glide / Rotation Technique', nameMr: 'ग्लाईड किंवा रोटेशन पद्धत', category: 'Advanced' },
    { id: 'sp_release', name: '45-Degree Angle Release', nameMr: '४५ अंश कोनात गोळा फेकणे', category: 'Offensive' },
    { id: 'sp_recov', name: 'Reverse & Foul Prevention', nameMr: 'फॉऊल न करता तोल सांभाळणे', category: 'Defensive' }
  ],
  'Javelin Throw': [
    { id: 'jav_grip', name: 'Finnish / American Grip', nameMr: 'भाला पकडण्याची पद्धत (Grip)', category: 'Fundamental' },
    { id: 'jav_cross', name: '5-Step Cross-over Approach', nameMr: '५-स्टेप क्रॉस-ओव्हर धाव', category: 'Advanced' },
    { id: 'jav_throw', name: 'Explosive Power Delivery', nameMr: 'कमर व खांद्याची ताकद देऊन फेकणे', category: 'Offensive' }
  ],
  'Disc Throw': [
    { id: 'dt_grip', name: 'Finger Grip & Stance', nameMr: 'थाळीची बोटे पकड व स्टॅन्स', category: 'Fundamental' },
    { id: 'dt_spin', name: '1.5 Turn Spin Rotation', nameMr: 'दीड फेऱ्याचे रोटेशन', category: 'Advanced' },
    { id: 'dt_rel', name: 'Centrifugal Force Release', nameMr: 'सेंट्रिफ्यूगल फोर्सने रिलीज', category: 'Offensive' }
  ],
  'Long Jump': [
    { id: 'lj_run', name: 'Approach Run Consistency', nameMr: 'अचूक धावमार्ग (Approach Run)', category: 'Fundamental' },
    { id: 'lj_board', name: 'Take-off Board Strike', nameMr: 'टेक-ऑफ बोर्डवरून उड्डाण', category: 'Advanced' },
    { id: 'lj_flight', name: 'Sail / Hang Flight Phase', nameMr: 'हवेतील पोझिशन (Flight)', category: 'Fundamental' },
    { id: 'lj_land', name: 'Sand Landing & Forward Roll', nameMr: 'वाळूमध्ये सुरक्षित लँडिंग', category: 'Fundamental' }
  ],
  'High Jump': [
    { id: 'hj_curve', name: 'J-Curve Approach Run', nameMr: 'J-आकाराची वळण धाव', category: 'Fundamental' },
    { id: 'hj_arch', name: 'Fosbury Flop Bar Clearance', nameMr: 'पाठीवर कमान करून बार ओलांडणे', category: 'Advanced' },
    { id: 'hj_land', name: 'Mat Landing Safety', nameMr: 'मॅटवर सुरक्षित पाठीवर पडणे', category: 'Fundamental' }
  ]
};

export function SportsSkills({ 
  store, 
  section = 'sports', 
  preselectedSport 
}: { 
  store: any, 
  section?: 'sports' | 'general', 
  preselectedSport?: string 
}) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || sportsList[0]);
  const [localDetailedSkills, setLocalDetailedSkills] = useState<Record<string, number>>({});
  const [editingDetailedPlayer, setEditingDetailedPlayer] = useState<{player: any, sport: string} | null>(null);
  
  // Class selection for Yoga & PT Mass
  const [selectedClasses, setSelectedClasses] = useState<string[]>(ALL_CLASSES);
  // Age group selection for other sports
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('All');
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  // Guide Modal
  const [guideModalName, setGuideModalName] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedSport) setActiveSport(preselectedSport);
  }, [preselectedSport]);

  const isGeneral = section === 'general';
  const targetCategory = isGeneral ? 'student' : 'athlete';
  const isYogaOrPt = activeSport === 'Yoga' || activeSport === 'PT Mass';

  const toggleClassSelection = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const selectAllClasses = () => {
    setSelectedClasses(ALL_CLASSES);
  };

  // Get current active skills list
  const currentSkillsList = useMemo(() => {
    return DETAILED_SKILLS_DATA[activeSport] || DETAILED_SKILLS_DATA['Kabaddi'];
  }, [activeSport]);

  // Open Evaluation Modal for a Student
  const handleOpenEvaluation = (player: any, sport: string) => {
    const key = `${player.id}_${sport}`;
    const existingData = store.data.sportSkills[key] || {};
    const rawSkills = existingData.detailedSkills || {};
    const normalized: Record<string, number> = {};

    currentSkillsList.forEach(s => {
      const val = parseFloat(rawSkills[s.name] || rawSkills[s.nameMr] || rawSkills[s.id]);
      normalized[s.id] = isNaN(val) ? 8 : (val > 10 ? Math.round(val / 10) : val);
    });

    setLocalDetailedSkills(normalized);
    setEditingDetailedPlayer({ player, sport });
  };

  // Save Evaluated Skills
  const handleSave = () => {
    if (!editingDetailedPlayer) return;
    const { player, sport } = editingDetailedPlayer;
    
    let totalScore = 0;
    const skillsToSave: Record<string, string> = {};

    currentSkillsList.forEach(s => {
      const val = localDetailedSkills[s.id] ?? 8;
      const normalizedPercent = Math.min(10, Math.max(0, val)) * 10;
      skillsToSave[s.name] = normalizedPercent.toString();
      totalScore += normalizedPercent;
    });

    const aggregate = currentSkillsList.length > 0 ? (totalScore / currentSkillsList.length).toFixed(1) : "0";

    store.setSportSkill(player.id, sport, {
      score: aggregate,
      detailedSkills: skillsToSave,
      playerId: player.id,
      sportName: sport
    });

    toast({ 
      title: "🎯 कौशल्य गुण नोंदवले!", 
      description: `${player.nameMarathi || player.name} चे ${sport} कौशल्य मूल्यमापन (${aggregate}%) जतन झाले.`,
      className: "bg-emerald-600 text-white font-bold"
    });
    setEditingDetailedPlayer(null);
  };

  // WhatsApp Share
  const handleWhatsAppShare = (player: any) => {
    const sportName = isGeneral ? 'General P.E.' : activeSport;
    const s = store.data.sportSkills[`${player.id}_${sportName}`] || { score: '0' };
    const profile = store.data.schoolProfile;
    const displayName = player.nameMarathi || transliterateEnglishToMarathi(player.name) || player.name;
    
    shareToWhatsApp({
      phone: player.mobileNumber,
      schoolName: profile?.schoolName,
      teacherName: profile?.teacherName,
      studentName: displayName,
      std: player.std,
      age: player.age,
      dob: player.dob,
      bmi: player.bmi || "---",
      height: player.height || "---",
      weight: player.weight || "---",
      reportType: `क्रीडा कौशल्य अहवाल (${sportName})`,
      reportData: `तांत्रिक गुणवत्ता (Skill Mastery): ${s.score}% / १००%\nस्तर: ${parseFloat(s.score) >= 90 ? '⭐ मास्टर' : parseFloat(s.score) >= 70 ? '🥇 प्रगत' : '🥈 मध्यम'}`
    });
  };

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    return store.data.players
      .filter((p: any) => {
        if (p.category !== targetCategory) return false;
        if (!isGeneral && p.sports && !p.sports.includes(activeSport)) return false;

        // Class multi-selection for Yoga & PT Mass
        if (isYogaOrPt) {
          if (selectedClasses.length > 0 && !selectedClasses.includes(p.std)) {
            return false;
          }
        } else {
          // Age group selection for other sports
          if (selectedAgeGroup !== 'All') {
            const ageVal = getAgeValidation(p.dob);
            const age = ageVal ? ageVal.ageYears : (parseInt(p.age) || 0);
            if (selectedAgeGroup === 'U14' && (age >= 14 || age <= 0)) return false;
            if (selectedAgeGroup === 'U17' && (age < 14 || age >= 17)) return false;
            if (selectedAgeGroup === 'Senior' && age < 17) return false;
          }
        }

        // Search query match
        if (searchQuery) {
          const nameEn = (p.name || '').toLowerCase();
          const nameMr = (p.nameMarathi || '').toLowerCase();
          const q = searchQuery.toLowerCase();
          if (!nameEn.includes(q) && !nameMr.includes(q)) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        const stdA = parseInt(a.std) || 0;
        const stdB = parseInt(b.std) || 0;
        if (stdA !== stdB) return stdA - stdB;
        if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
  }, [store.data.players, targetCategory, isGeneral, activeSport, isYogaOrPt, selectedClasses, selectedAgeGroup, searchQuery]);

  // Print Official Technical Skills Registry
  const handlePrint = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, true);

    const printContent = `
      <html>
        <head>
          <title>Institutional Sports Skills Registry - Waghamba Hub</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap');
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; background: #fff; font-size: 11px; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 3px double #f59e0b; text-align: center; margin-bottom: 4px; font-size: 18px; font-weight: 900; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 12px; color: #b45309; font-size: 13px; }
            .meta { font-weight: 700; text-transform: uppercase; font-size: 10px; margin-bottom: 15px; text-align: center; background: #f1f5f9; padding: 6px; border-radius: 6px; }
            .audit-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
            .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: middle; }
            .audit-table th { background: #1e3a8a; color: white; text-transform: uppercase; font-weight: 800; font-size: 9.5px; }
            .audit-table tr:nth-child(even) { background: #f8fafc; }
            .master-tag { color: #15803d; font-weight: 900; background: #dcfce7; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .adv-tag { color: #0369a1; font-weight: 900; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .med-tag { color: #b45309; font-weight: 900; background: #fef3c7; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: 900; text-transform: uppercase; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.15); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (GO BACK)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट काढा (PRINT AUDIT)</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">विद्यार्थी क्रीडा कौशल्य मूल्यमापन अधिकृत नोंदवही (Skills Assessment)</div>
          <div class="meta">खेळ: ${activeSport} &bull; एकूण विद्यार्थी: ${filteredPlayers.length} &bull; दिनांक: ${format(new Date(), 'dd MMMM yyyy')}</div>
          
          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 5%;">अ.क्र.</th>
                <th style="width: 25%;">विद्यार्थ्याचे नाव</th>
                <th style="width: 10%;">इयत्ता</th>
                <th style="width: 10%;">वय / लिंग</th>
                <th style="width: 20%;">तांत्रिक गुणवत्ता (Score)</th>
                <th style="width: 15%;">कौशल्य श्रेणी</th>
                <th style="width: 15%;">स्वाक्षरी</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPlayers.map((p: any, idx: number) => {
                const s = store.data.sportSkills[`${p.id}_${activeSport}`] || { score: '0' };
                const scoreNum = parseFloat(s.score) || 0;
                const tagClass = scoreNum >= 90 ? 'master-tag' : scoreNum >= 70 ? 'adv-tag' : 'med-tag';
                const tagLabel = scoreNum >= 90 ? '⭐ मास्टर (Master)' : scoreNum >= 70 ? '🥇 प्रगत (Advanced)' : scoreNum >= 50 ? '🥈 मध्यम' : '🥉 प्राथमिक';
                const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                    <td>
                      <strong>${displayName}</strong><br/>
                      <span style="font-size: 9px; color: #64748b;">Roll No: #${p.serialNumber || '0'}</span>
                    </td>
                    <td>इयत्ता ${p.std} वी</td>
                    <td>${p.age || '---'} वर्षे &bull; ${p.gender === 'Male' ? 'मुलगा' : 'मुलगी'}</td>
                    <td>
                      <strong>${s.score}% / १००%</strong>
                    </td>
                    <td><span class="${tagClass}">${tagLabel}</span></td>
                    <td></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${signatureBlockHtml}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-slate-900 via-primary to-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-md">
            <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
                {activeSport} कौशल्य मूल्यमापन (Skills Mastery)
              </h2>
              <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                10-Point Grading
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-bold text-white/70 uppercase flex items-center gap-1.5 tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ground Practical Assessment Pad &bull; Quick WhatsApp Card
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isYogaOrPt && (
            <Button 
              onClick={() => setGuideModalName(activeSport === 'Yoga' ? 'Surya Namaskar' : 'Mass PT Exercise No 1')} 
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-widest h-14 rounded-2xl px-6 shadow-xl active-scale transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> कसे करावे (Deep Guide)
            </Button>
          )}
          <Button 
            onClick={handlePrint} 
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl px-6 shadow-2xl active-scale transition-all"
          >
            <Printer className="w-5 h-5 mr-2" /> अधिकृत रिपोर्ट प्रिंट करा
          </Button>
        </div>
      </div>
      
      {/* 2. Sport Switcher Bar */}
      {!isGeneral && !preselectedSport && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100/80 rounded-[2rem] border shadow-inner overflow-x-auto scrollbar-hide">
          {sportsList.map(sport => (
            <Button 
              key={sport} 
              variant={activeSport === sport ? "default" : "ghost"} 
              size="sm" 
              className={cn(
                "h-11 px-6 rounded-xl text-[10px] font-black uppercase transition-all", 
                activeSport === sport ? "bg-primary text-white shadow-lg scale-105" : "text-slate-700 hover:bg-white"
              )}
              onClick={() => setActiveSport(sport)}
            >
              {sport}
            </Button>
          ))}
        </div>
      )}

      {/* 3. Class / Age Group Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {isYogaOrPt ? (
          <Card className="flex-1 border-2 border-primary/20 rounded-2xl p-4 bg-gradient-to-r from-primary/5 via-white to-amber-500/5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase text-primary mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-600" /> इयत्ता:
              </span>
              {ALL_CLASSES.map(cls => {
                const isSelected = selectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassSelection(cls)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border",
                      isSelected 
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    इयत्ता {cls} वी
                  </button>
                );
              })}
              <button
                type="button"
                onClick={selectAllClasses}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 ml-auto"
              >
                सर्व
              </button>
            </div>
          </Card>
        ) : (
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border-2 shadow-sm w-fit">
            <span className="text-[10px] font-black uppercase text-muted-foreground px-3">Age Category:</span>
            {['All', 'U14', 'U17', 'Senior'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedAgeGroup(cat)}
                className={cn(
                  "h-8 px-3.5 rounded-xl text-[10px] font-black uppercase transition-all",
                  selectedAgeGroup === cat ? "bg-primary text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {cat === 'All' ? 'सर्व खेळाडू' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Search athlete */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खेळाडूचे नाव शोधा..."
            className="pl-9 h-10 rounded-xl text-xs font-bold border-2"
          />
        </div>
      </div>

      {/* 4. Student Athletes Table */}
      <div className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
        <ScrollArea className="w-full">
          <Table className="min-w-max border-collapse">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="h-14">
                <TableHead className="font-black text-[11px] uppercase px-8">विद्यार्थी खेळाडू (Student Athlete)</TableHead>
                <TableHead className="font-black text-[11px] uppercase text-center w-[220px]">गुणवत्ता (Mastery Score)</TableHead>
                <TableHead className="font-black text-[11px] uppercase text-center w-[160px]">श्रेणी (Level)</TableHead>
                <TableHead className="font-black text-[11px] uppercase text-right px-8">मूल्यमापन व कृती (Action)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-24 font-black uppercase tracking-widest opacity-30">
                    कोणतेही विद्यार्थी उपलब्ध नाहीत.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((p: any) => {
                  const sportName = isGeneral ? 'General P.E.' : activeSport;
                  const s = store.data.sportSkills[`${p.id}_${sportName}`] || { score: '0' };
                  const scoreNum = parseFloat(s.score) || 0;
                  const displayName = p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name;
                  
                  const isMaster = scoreNum >= 90;
                  const isAdv = scoreNum >= 70 && scoreNum < 90;
                  const isMed = scoreNum >= 50 && scoreNum < 70;

                  return (
                    <TableRow key={p.id} className="h-20 hover:bg-primary/5 transition-all group border-b last:border-0">
                      <TableCell className="px-8">
                         <div className="flex flex-col">
                            <span className="font-black uppercase text-sm text-slate-900 leading-none">{displayName}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                              Roll: #{p.serialNumber || '0'} &bull; Std {p.std} &bull; {p.gender === 'Male' ? 'मुलगा' : 'मुलगी'} &bull; {p.age ? `${p.age} वर्षे` : ''}
                            </span>
                         </div>
                      </TableCell>
                      
                      {/* Aggregate Mastery Bar */}
                      <TableCell className="text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-black text-primary leading-none">{s.score}%</span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border">
                             <div 
                               className={cn("h-full rounded-full transition-all", isMaster ? "bg-emerald-500" : isAdv ? "bg-blue-500" : isMed ? "bg-amber-500" : "bg-rose-400")} 
                               style={{ width: `${s.score}%` }} 
                             />
                          </div>
                        </div>
                      </TableCell>

                      {/* Level Badge */}
                      <TableCell className="text-center">
                        {isMaster ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-black text-[9px] uppercase px-2.5">
                            ⭐ मास्टर (Master)
                          </Badge>
                        ) : isAdv ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-black text-[9px] uppercase px-2.5">
                            🥇 प्रगत (Adv)
                          </Badge>
                        ) : isMed ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-black text-[9px] uppercase px-2.5">
                            🥈 मध्यम (Med)
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-black text-[9px] uppercase px-2.5">
                            🥉 प्राथमिक (Basic)
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleWhatsAppShare(p)} 
                            disabled={!p.mobileNumber} 
                            className="text-emerald-600 hover:bg-emerald-50 rounded-full h-10 w-10"
                            title="WhatsApp कार्ड पाठवा"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEvaluation(p, sportName)} 
                            className="font-black text-[10px] uppercase rounded-xl border-2 hover:bg-primary hover:text-white transition-all h-10 px-5"
                          >
                            कौशल्य गुण द्या (Grade Skills) <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* 5. 1-10 Marks Grading Modal with Quick Buttons */}
      <Dialog open={!!editingDetailedPlayer} onOpenChange={() => setEditingDetailedPlayer(null)}>
        <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl flex flex-col max-h-[90vh]">
          
          <DialogHeader className="bg-gradient-to-r from-slate-900 to-primary p-7 text-white relative shrink-0">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                 <Target className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-black uppercase tracking-tight">
                  मैदानावर थेट कौशल्य मूल्यमापन (1-10 Marks Pad)
                </DialogTitle>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
                  {editingDetailedPlayer?.player.nameMarathi || editingDetailedPlayer?.player.name} &bull; Std {editingDetailedPlayer?.player.std} &bull; {editingDetailedPlayer?.sport}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* 100% Scrollable Evaluation List */}
          <div className="flex-1 overflow-y-auto max-h-[60vh] p-6 space-y-4">
             <div className="grid grid-cols-1 gap-4">
                {currentSkillsList.map(skill => {
                  const currentVal = localDetailedSkills[skill.id] ?? 8;
                  return (
                    <div 
                      key={skill.id} 
                      className="p-4 rounded-2xl border-2 bg-slate-50/70 hover:border-primary/30 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h5 className="text-xs font-black text-slate-900 uppercase leading-tight">
                            {skill.nameMr}
                          </h5>
                          <span className="text-[10px] text-muted-foreground font-bold">{skill.name} ({skill.category})</span>
                        </div>

                        {/* Guide Button & Score Badge */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setGuideModalName(skill.name)}
                            className="h-7 text-[9px] font-black uppercase text-amber-700 bg-amber-100/80 hover:bg-amber-200 rounded-lg px-2"
                          >
                            <Info className="w-3 h-3 mr-1" /> माहिती
                          </Button>
                          <span className={cn(
                            "text-xs font-black px-2.5 py-0.5 rounded-lg border",
                            currentVal >= 9 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : currentVal >= 7 ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-amber-100 text-amber-900 border-amber-300"
                          )}>
                            {currentVal} / १०
                          </span>
                        </div>
                      </div>

                      {/* 1-10 Quick Touch Buttons */}
                      <div className="grid grid-cols-10 gap-1 pt-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSelected = currentVal === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setLocalDetailedSkills(prev => ({ ...prev, [skill.id]: num }));
                              }}
                              className={cn(
                                "h-9 rounded-lg font-black text-xs transition-all border flex items-center justify-center",
                                isSelected
                                  ? (num >= 9 ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : num >= 7 ? "bg-primary text-white border-primary shadow-md scale-105" : num >= 5 ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105" : "bg-rose-600 text-white border-rose-700 shadow-md scale-105")
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t shrink-0">
            <Button 
              onClick={handleSave} 
              className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl active-scale text-xs"
            >
              कौशल्य गुण जतन करा (Save Evaluation)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deep Information Guide Modal */}
      <YogaPtGuideModal 
        guideName={guideModalName} 
        isOpen={!!guideModalName} 
        onClose={() => setGuideModalName(null)} 
      />
    </div>
  );
}

