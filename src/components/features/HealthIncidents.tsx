"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  History, 
  Printer, 
  AlertTriangle, 
  HeartPulse, 
  ShieldAlert, 
  CalendarDays,
  Activity,
  Stethoscope,
  Info,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Share2,
  Eye,
  RotateCcw,
  Zap,
  Flame,
  User,
  Users,
  Search,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { cn, parseMedicalLog, transliterateEnglishToMarathi, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';

// ==========================================
// 1. REALISTIC ANATOMICAL BODY REGIONS
// ==========================================
export interface AnatomicalZone {
  id: string;
  label: string;
  labelMr: string;
  view: 'front' | 'back' | 'both';
  category: 'Head/Neck' | 'Upper Body' | 'Arms/Hands' | 'Core/Spine' | 'Legs/Knees' | 'Feet/Ankles';
  xFront?: number; // SVG %
  yFront?: number; // SVG %
  xBack?: number;  // SVG %
  yBack?: number;  // SVG %
  commonInjuries: string[];
}

export const ANATOMICAL_ZONES: AnatomicalZone[] = [
  // HEAD & NECK
  {
    id: 'head_cranium',
    label: 'Head & Cranium',
    labelMr: 'डोके व मेंदू',
    view: 'both',
    category: 'Head/Neck',
    xFront: 50, yFront: 8,
    xBack: 50, yBack: 8,
    commonInjuries: ['Head Impact / Concussion', 'Skin Abrasion / Mat Burn', 'Contusion / Deep Bruise']
  },
  {
    id: 'face_jaw',
    label: 'Forehead, Eyes & Jaw',
    labelMr: 'कपाळ, डोळे व जबडा',
    view: 'front',
    category: 'Head/Neck',
    xFront: 50, yFront: 13,
    commonInjuries: ['Contusion / Deep Bruise', 'Skin Abrasion / Mat Burn', 'Bone Fracture / Crack']
  },
  {
    id: 'neck_cervical',
    label: 'Neck & Cervical Spine',
    labelMr: 'मान व मणका',
    view: 'both',
    category: 'Head/Neck',
    xFront: 50, yFront: 18,
    xBack: 50, yBack: 18,
    commonInjuries: ['Muscle Strain / Pull', 'Ligament Sprain', 'Low Back Lumbar Spasm']
  },

  // SHOULDERS & CHEST
  {
    id: 'shoulder_left',
    label: 'Left Shoulder (Rotator Cuff)',
    labelMr: 'डावा खांदा व सांधा',
    view: 'both',
    category: 'Upper Body',
    xFront: 31, yFront: 23,
    xBack: 69, yBack: 23,
    commonInjuries: ['Joint Dislocation / Subluxation', 'Ligament Sprain', 'Contusion / Deep Bruise']
  },
  {
    id: 'shoulder_right',
    label: 'Right Shoulder (Rotator Cuff)',
    labelMr: 'उजवा खांदा व सांधा',
    view: 'both',
    category: 'Upper Body',
    xFront: 69, yFront: 23,
    xBack: 31, yBack: 23,
    commonInjuries: ['Joint Dislocation / Subluxation', 'Ligament Sprain', 'Contusion / Deep Bruise']
  },
  {
    id: 'chest_ribs',
    label: 'Chest & Rib Cage',
    labelMr: 'छाती व बरगड्या',
    view: 'front',
    category: 'Upper Body',
    xFront: 50, yFront: 28,
    commonInjuries: ['Contusion / Deep Bruise', 'Bone Fracture / Crack', 'Muscle Strain / Pull']
  },
  {
    id: 'upper_back',
    label: 'Upper Back & Shoulder Blades',
    labelMr: 'पाठीचा वरचा भाग',
    view: 'back',
    category: 'Core/Spine',
    xBack: 50, yBack: 28,
    commonInjuries: ['Muscle Strain / Pull', 'Contusion / Deep Bruise']
  },
  {
    id: 'lower_back',
    label: 'Lower Back (Lumbar Spine)',
    labelMr: 'कमर व पाठीचा मणका',
    view: 'back',
    category: 'Core/Spine',
    xBack: 50, yBack: 40,
    commonInjuries: ['Low Back Lumbar Spasm', 'Muscle Strain / Pull', 'Ligament Sprain']
  },
  {
    id: 'abdomen_groin',
    label: 'Abdomen & Core',
    labelMr: 'पोट व ओटीपोट',
    view: 'front',
    category: 'Core/Spine',
    xFront: 50, yFront: 38,
    commonInjuries: ['Muscle Strain / Pull', 'Contusion / Deep Bruise']
  },

  // ARMS & HANDS
  {
    id: 'elbow_left',
    label: 'Left Elbow Joint',
    labelMr: 'डावा कोपरा',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 23, yFront: 36,
    xBack: 77, yBack: 36,
    commonInjuries: ['Ligament Sprain', 'Skin Abrasion / Mat Burn', 'Joint Dislocation / Subluxation']
  },
  {
    id: 'elbow_right',
    label: 'Right Elbow Joint',
    labelMr: 'उजवा कोपरा',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 77, yFront: 36,
    xBack: 23, yBack: 36,
    commonInjuries: ['Ligament Sprain', 'Skin Abrasion / Mat Burn', 'Joint Dislocation / Subluxation']
  },
  {
    id: 'wrist_left',
    label: 'Left Wrist',
    labelMr: 'डावे मनगट',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 17, yFront: 47,
    xBack: 83, yBack: 47,
    commonInjuries: ['Ligament Sprain', 'Bone Fracture / Crack', 'Skin Abrasion / Mat Burn']
  },
  {
    id: 'wrist_right',
    label: 'Right Wrist',
    labelMr: 'उजवे मनगट',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 83, yFront: 47,
    xBack: 17, yBack: 47,
    commonInjuries: ['Ligament Sprain', 'Bone Fracture / Crack', 'Skin Abrasion / Mat Burn']
  },
  {
    id: 'fingers_left',
    label: 'Left Hand & Fingers',
    labelMr: 'डाव्या हाताची बोटे',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 13, yFront: 54,
    xBack: 87, yBack: 54,
    commonInjuries: ['Jammed Finger / Thumb Sprain', 'Joint Dislocation / Subluxation', 'Bone Fracture / Crack']
  },
  {
    id: 'fingers_right',
    label: 'Right Hand & Fingers',
    labelMr: 'उजव्या हाताची बोटे',
    view: 'both',
    category: 'Arms/Hands',
    xFront: 87, yFront: 54,
    xBack: 13, yBack: 54,
    commonInjuries: ['Jammed Finger / Thumb Sprain', 'Joint Dislocation / Subluxation', 'Bone Fracture / Crack']
  },

  // THIGHS & GROIN
  {
    id: 'hip_groin_left',
    label: 'Left Hip & Groin',
    labelMr: 'डावा खुबा व मांडीचा सांधा',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 41, yFront: 48,
    commonInjuries: ['Muscle Strain / Pull', 'Ligament Sprain', 'Contusion / Deep Bruise']
  },
  {
    id: 'hip_groin_right',
    label: 'Right Hip & Groin',
    labelMr: 'उजवा खुबा व मांडीचा सांधा',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 59, yFront: 48,
    commonInjuries: ['Muscle Strain / Pull', 'Ligament Sprain', 'Contusion / Deep Bruise']
  },
  {
    id: 'quad_left',
    label: 'Left Quadriceps (Front Thigh)',
    labelMr: 'डावी मांडी (समोरील स्नायू)',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 40, yFront: 57,
    commonInjuries: ['Contusion / Deep Bruise', 'Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps']
  },
  {
    id: 'quad_right',
    label: 'Right Quadriceps (Front Thigh)',
    labelMr: 'उजवी मांडी (समोरील स्नायू)',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 60, yFront: 57,
    commonInjuries: ['Contusion / Deep Bruise', 'Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps']
  },
  {
    id: 'hamstring_left',
    label: 'Left Hamstring (Back Thigh)',
    labelMr: 'डावी मांडी (मागील स्नायू)',
    view: 'back',
    category: 'Legs/Knees',
    xBack: 40, yBack: 57,
    commonInjuries: ['Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps', 'Contusion / Deep Bruise']
  },
  {
    id: 'hamstring_right',
    label: 'Right Hamstring (Back Thigh)',
    labelMr: 'उजवी मांडी (मागील स्नायू)',
    view: 'back',
    category: 'Legs/Knees',
    xBack: 60, yBack: 57,
    commonInjuries: ['Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps', 'Contusion / Deep Bruise']
  },

  // KNEES & SHINS
  {
    id: 'knee_left',
    label: 'Left Knee Joint (ACL/MCL/Patella)',
    labelMr: 'डावा गुडघा (लिगामेंट व गादी)',
    view: 'both',
    category: 'Legs/Knees',
    xFront: 40, yFront: 69,
    xBack: 40, yBack: 69,
    commonInjuries: ['Ligament Sprain', 'Meniscus / Cartilage Damage', 'Contusion / Deep Bruise']
  },
  {
    id: 'knee_right',
    label: 'Right Knee Joint (ACL/MCL/Patella)',
    labelMr: 'उजवा गुडघा (लिगामेंट व गादी)',
    view: 'both',
    category: 'Legs/Knees',
    xFront: 60, yFront: 69,
    xBack: 60, yBack: 69,
    commonInjuries: ['Ligament Sprain', 'Meniscus / Cartilage Damage', 'Contusion / Deep Bruise']
  },
  {
    id: 'shin_left',
    label: 'Left Shin (Tibia)',
    labelMr: 'डावी नडगी',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 40, yFront: 79,
    commonInjuries: ['Shin Splints / Tibial Stress', 'Contusion / Deep Bruise', 'Bone Fracture / Crack']
  },
  {
    id: 'shin_right',
    label: 'Right Shin (Tibia)',
    labelMr: 'उजवी नडगी',
    view: 'front',
    category: 'Legs/Knees',
    xFront: 60, yFront: 79,
    commonInjuries: ['Shin Splints / Tibial Stress', 'Contusion / Deep Bruise', 'Bone Fracture / Crack']
  },
  {
    id: 'calf_left',
    label: 'Left Calf (Gastrocnemius)',
    labelMr: 'डावी पोटरी',
    view: 'back',
    category: 'Legs/Knees',
    xBack: 40, yBack: 79,
    commonInjuries: ['Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps', 'Achilles Tendinitis']
  },
  {
    id: 'calf_right',
    label: 'Right Calf (Gastrocnemius)',
    labelMr: 'उजवी पोटरी',
    view: 'back',
    category: 'Legs/Knees',
    xBack: 60, yBack: 79,
    commonInjuries: ['Muscle Strain / Pull', 'Heat Exhaustion / Severe Cramps', 'Achilles Tendinitis']
  },

  // ANKLES & FEET
  {
    id: 'ankle_left',
    label: 'Left Ankle Joint (Malleolus)',
    labelMr: 'डावा घोटा (Ankle Joint)',
    view: 'both',
    category: 'Feet/Ankles',
    xFront: 40, yFront: 89,
    xBack: 40, yBack: 89,
    commonInjuries: ['Ligament Sprain', 'Achilles Tendinitis', 'Bone Fracture / Crack']
  },
  {
    id: 'ankle_right',
    label: 'Right Ankle Joint (Malleolus)',
    labelMr: 'उजवा घोटा (Ankle Joint)',
    view: 'both',
    category: 'Feet/Ankles',
    xFront: 60, yFront: 89,
    xBack: 60, yBack: 89,
    commonInjuries: ['Ligament Sprain', 'Achilles Tendinitis', 'Bone Fracture / Crack']
  },
  {
    id: 'foot_left',
    label: 'Left Foot & Toes',
    labelMr: 'डावे पाऊल व बोटे',
    view: 'both',
    category: 'Feet/Ankles',
    xFront: 38, yFront: 96,
    xBack: 38, yBack: 96,
    commonInjuries: ['Friction Blisters / Foot Corn', 'Bone Fracture / Crack', 'Skin Abrasion / Mat Burn']
  },
  {
    id: 'foot_right',
    label: 'Right Foot & Toes',
    labelMr: 'उजवे पाऊल व बोटे',
    view: 'both',
    category: 'Feet/Ankles',
    xFront: 62, yFront: 96,
    xBack: 62, yBack: 96,
    commonInjuries: ['Friction Blisters / Foot Corn', 'Bone Fracture / Crack', 'Skin Abrasion / Mat Burn']
  }
];

// ==========================================
// 2. REALISTIC SPORTS INJURY TAXONOMY
// ==========================================
export interface InjuryTypeDetail {
  value: string;
  label: string;
  labelMr: string;
  severityDefault: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  defaultDays: number;
  iconColor: string;
}

export const REALISTIC_INJURY_TYPES: InjuryTypeDetail[] = [
  {
    value: 'Ligament Sprain',
    label: 'Ligament Sprain (मुरगळणे / लचकणे)',
    labelMr: 'लिगामेंट मुरगळणे / लचकणे (Sprain)',
    severityDefault: 'Moderate',
    defaultDays: 10,
    iconColor: 'text-amber-500'
  },
  {
    value: 'Muscle Strain / Pull',
    label: 'Muscle Strain / Pull (स्नायू ताणणे किंवा फाटणे)',
    labelMr: 'स्नायू ताणणे किंवा फाटणे (Muscle Strain)',
    severityDefault: 'Moderate',
    defaultDays: 12,
    iconColor: 'text-rose-500'
  },
  {
    value: 'Contusion / Deep Bruise',
    label: 'Contusion / Dead Leg (मांडी मार / मुका मार / सूज)',
    labelMr: 'मुका मार / मांडी मार (Contusion)',
    severityDefault: 'Minor',
    defaultDays: 5,
    iconColor: 'text-blue-500'
  },
  {
    value: 'Skin Abrasion / Mat Burn',
    label: 'Skin Abrasion / Mat Burn (त्वचा सोलवटणे / खरचटणे)',
    labelMr: 'मॅट घर्षण / जखम (Mat Burn / Abrasion)',
    severityDefault: 'Minor',
    defaultDays: 4,
    iconColor: 'text-orange-500'
  },
  {
    value: 'Joint Dislocation / Subluxation',
    label: 'Joint Dislocation (सांधा निखळणे - खांदा/बोट)',
    labelMr: 'सांधा निखळणे (Dislocation)',
    severityDefault: 'Severe',
    defaultDays: 28,
    iconColor: 'text-purple-500'
  },
  {
    value: 'Meniscus / Cartilage Damage',
    label: 'Meniscus / Cartilage Strain (गुडघ्याची गादी इजा)',
    labelMr: 'गुडघ्याची गादी इजा (Meniscus Strain)',
    severityDefault: 'Severe',
    defaultDays: 21,
    iconColor: 'text-indigo-500'
  },
  {
    value: 'Bone Fracture / Crack',
    label: 'Bone Fracture / Hairline Crack (हाड मोडणे / क्रॅक)',
    labelMr: 'हाड फ्रॅक्चर / क्रॅक (Bone Fracture)',
    severityDefault: 'Critical',
    defaultDays: 45,
    iconColor: 'text-red-600'
  },
  {
    value: 'Head Impact / Concussion',
    label: 'Head Impact / Concussion (डोक्याला मार / चक्कर)',
    labelMr: 'डोक्याला मार / चक्कर (Concussion)',
    severityDefault: 'Severe',
    defaultDays: 14,
    iconColor: 'text-red-500'
  },
  {
    value: 'Shin Splints / Tibial Stress',
    label: 'Shin Splints (नडगीचे हाड दुखणे - धावपटू)',
    labelMr: 'नडगीचे दुखणे (Shin Splints)',
    severityDefault: 'Minor',
    defaultDays: 7,
    iconColor: 'text-teal-500'
  },
  {
    value: 'Achilles Tendinitis',
    label: 'Achilles Tendinitis (टाच व ॲकिलीस टेंडन सूज)',
    labelMr: 'टाचेचे दुखणे (Achilles Tendinitis)',
    severityDefault: 'Moderate',
    defaultDays: 14,
    iconColor: 'text-amber-600'
  },
  {
    value: 'Heat Exhaustion / Severe Cramps',
    label: 'Heat Exhaustion / Cramps (उष्णतेचा त्रास / तीव्र पेटके)',
    labelMr: 'उष्णतेचा त्रास / तीव्र पेटके (Muscle Cramps)',
    severityDefault: 'Minor',
    defaultDays: 2,
    iconColor: 'text-yellow-600'
  },
  {
    value: 'Jammed Finger / Thumb Sprain',
    label: 'Jammed Finger / Thumb (बोट चेपले जाणे - कबड्डी/व्हॉलीबॉल)',
    labelMr: 'बोटाचा सांधा दुखापत (Jammed Finger)',
    severityDefault: 'Minor',
    defaultDays: 6,
    iconColor: 'text-emerald-500'
  },
  {
    value: 'Low Back Lumbar Spasm',
    label: 'Low Back Lumbar Spasm (कमरेचा तीव्र ताण / चमक)',
    labelMr: 'कमरेचा तीव्र ताण (Lumbar Spasm)',
    severityDefault: 'Moderate',
    defaultDays: 8,
    iconColor: 'text-violet-500'
  },
  {
    value: 'Friction Blisters / Foot Corn',
    label: 'Friction Blisters / Foot Sores (पायाचे फोड व छाले)',
    labelMr: 'पायाचे फोड व छाले (Blisters)',
    severityDefault: 'Minor',
    defaultDays: 3,
    iconColor: 'text-cyan-500'
  }
];

// ==========================================
// 3. CLINICAL FIRST-AID & RECOVERY PROTOCOL ENGINE
// ==========================================
export class ClinicalInjurySolutions {
  static getDetailedSolution(injuryType: string, bodyPart: string, severity: string) {
    const isCritical = severity.includes('Severe') || severity.includes('Critical');
    let days = 7;
    let onFieldAction = "";
    let firstAidKitMed = "";
    let contraindications = "";
    let hospitalRedFlags = "";
    let returnStages = "";

    switch (injuryType) {
      case 'Ligament Sprain':
        days = isCritical ? 21 : (severity.includes('Moderate') ? 12 : 6);
        onFieldAction = `१. R.I.C.E. पद्धत त्वरित लागू करा: खेळाडूला त्वरित मैदानातून बाहेर बसवा (Rest).\n२. सूज आलेल्या भागावर १५ मिनिटे बर्फाचा पॅक लावा (Ice).\n३. ६ किंवा १० सेमी आकाराची क्रेप पट्टी (Crepe Bandage) घट्ट न आवळता मध्यम दाबाने गुंडाळा (Compression).\n४. पाय किंवा हात हृदयाच्या पातळीपेक्षा उंच ठेवा (Elevation).`;
        firstAidKitMed = `• डायनापार / व्होलिनी स्प्रे (Dynapar / Volini Spray) किंवा जेल.\n• लवचिक क्रेप पट्टी (Crepe Bandage).\n• वेदना शमनासाठी पॅरासिटामॉल (शाळेच्या डॉक्टरांच्या सल्ल्याने).\n• कोल्ड जेल पॅक (Ice Pack).`;
        contraindications = `❌ पहिल्या ४८ तासांत गरम शेक (Hot Fermentation) देऊ नका.\n❌ सूज असलेल्या भागावर जोरात मालिश (Deep Massage) करू नका.\n❌ वेदनाशामक स्प्रे मारून जबरदस्तीने खेळ सुरू ठेवू नका.`;
        hospitalRedFlags = `⚠️ जर खेळाडूला स्वतःच्या पायावर ४ पावलेही चालता येत नसेल.\n⚠️ सांध्यावर तीव्र सूज किंवा निळसर डाग (Hematoma) वाढत असल्यास.\n⚠️ सांधा सैल पडल्यासारखा वाटत असल्यास.`;
        returnStages = `• दिवस १-३: पूर्ण विश्रांती व सूज नियंत्रण.\n• दिवस ४-७: सांध्याची सौम्य गोलाकार हालचाल व हलके चालणे.\n• दिवस ८-१४: स्ट्रेचिंग व जॉगिंग.\n• दिवस १५+: पूर्ण सराव व सामन्यात प्रवेश.`;
        break;

      case 'Muscle Strain / Pull':
        days = isCritical ? 28 : (severity.includes('Moderate') ? 14 : 7);
        onFieldAction = `१. धावणे किंवा स्ट्रेचिंग त्वरित थांबवा; ताणलेल्या स्नायूला अजिबात खेचू नका.\n२. स्नायूवर बर्फ लावा (१५ मिनिटे).\n३. हॅमस्ट्रिंग / पोटरी असल्यास स्नायूच्या दिशेने सपोर्टिव्ह पट्टी बांधा.`;
        firstAidKitMed = `• थ्रोम्बोफोब जेल (Thrombophob Gel) किंवा डिक्लोफेनॅक जेल.\n• क्रेप बँडेज (स्नायू स्थिर ठेवण्यासाठी).\n• इलेक्ट्रोलाइट हायड्रेशन (ORS / नारळ पाणी).`;
        contraindications = `❌ तीव्र ताण बसलेल्या स्नायूला जोरात ताणू (Over-stretch) नका.\n❌ पहिल्या ३ दिवसांत गरम पाण्याच्या पिशवीने शेकू नका.`;
        hospitalRedFlags = `⚠️ स्नायूमध्ये खड्डा पडल्यासारखा वाटत असल्यास (Grade 3 Muscle Tear).\n⚠️ असह्य कळा येत असल्यास.`;
        returnStages = `• टप्पा १: विश्रांती व कोल्ड थेरपी.\n• टप्पा २: पेन-फ्री आयसोमेट्रिक कॉन्ट्रॅक्शन (हळूवार स्नायू आवळणे).\n• टप्पा ३: नियंत्रित रनिंग व चपळता ड्रिल्स.`;
        break;

      case 'Contusion / Deep Bruise':
        days = isCritical ? 10 : 5;
        onFieldAction = `१. मार बसलेल्या भागावर १० मिनिटे बर्फ लावा.\n२. स्नायूवर थेट भार देणे टाळा.\n३. २४ तासांनंतर हलका कोमट शेक सुरू करता येईल.`;
        firstAidKitMed = `• थ्रोम्बोफोब मलम (रक्त साठणे व सूज कमी करण्यासाठी).\n• बर्फाचा पॅक.\n• वेदनाशामक मलम.`;
        contraindications = `❌ मार बसलेल्या भागावर लगेच जोरात दाबू नका.`;
        hospitalRedFlags = `⚠️ सूज सतत वाढत असल्यास किंवा अंतर्गत रक्तस्त्रावाचा संशय असल्यास.`;
        returnStages = `• दिवस १-२: बर्फ व आराम.\n• दिवस ३-५: हालचाल सुरू करणे व मैदानावर हलका वॉर्म-अप.`;
        break;

      case 'Skin Abrasion / Mat Burn':
        days = isCritical ? 7 : 3;
        onFieldAction = `१. जखमेवरील माती व घाण स्वच्छ वाहत्या पाण्याने किंवा सॅव्हलॉनने धुवा.\n२. निर्जंतुक कापसाने हलके टिपून घ्या.\n३. अँटीसेप्टिक मलम लावून आवश्यकतेनुसार हलकी पट्टी बांधा.`;
        firstAidKitMed = `• बेटाडीन ५% मलम (Betadine Ointment) / सोफ्रामयसीन.\n• सॅव्हलॉन / डेटॉल लिक्विड.\n• निर्जंतुक गॉज पट्टी व मायक्रोपोअर टेप.`;
        contraindications = `❌ जखमेवर थेट माती किंवा अस्वच्छ हात लावू नका.\n❌ जखमेची खपली जबरदस्तीने काढू नका.`;
        hospitalRedFlags = `⚠️ जखमेतून पू येत असल्यास किंवा लालसरपणा पसरून ताप आल्यास (Infection).`;
        returnStages = `• दिवस १-२: जखम कोरडी व स्वच्छ ठेवणे.\n• दिवस ३-४: खपली धरल्यावर हलका सराव सुरू.`;
        break;

      case 'Joint Dislocation / Subluxation':
        days = 35;
        onFieldAction = `१. आणीबाणी (EMERGENCY): निखळलेला सांधा जागेवर बसवण्याचा स्वतः प्रयत्न करू नका!\n२. स्लिंग (Sling) किंवा स्प्लिंट लावून हात/बोट जसे आहे तसे स्थिर करा.\n३. तात्काळ सटाणा ग्रामीण रुग्णालय / ऑर्थोपेडिक सर्जन कडे रवाना करा.`;
        firstAidKitMed = `• ट्रायँगुलर बँडेज (Arm Sling).\n• फिंगर स्प्लिंट (Finger Splint).\n• बर्फाचा पॅक (सांध्याभोवती वेदना कमी करण्यासाठी).`;
        contraindications = `❌ जबरदस्तीने सांधा ओढून बसवण्याचा मूर्खपणा करू नका (नसांना इजा होऊ शकते).`;
        hospitalRedFlags = `⚠️ सांध्याचा आकार विद्रूप होणे, बोटांमध्ये मुंग्या येणे किंवा संवेदना जाणे.`;
        returnStages = `• आठवडा १-३: डॉक्टरांच्या सल्ल्यानुसार इमोबिलायझर.\n• आठवडा ४-५: फिजिओथेरपी व स्ट्रेंग्थेनिंग.\n• आठवडा ६+: मैदानावर परतणे.`;
        break;

      case 'Bone Fracture / Crack':
        days = 45;
        onFieldAction = `१. वैद्यकीय आणीबाणी: जखमी अवयवाची हालचाल पूर्णपणे थांबवा.\n२. लाकडी किंवा फायबर स्प्लिंट लावून अवयव सुरक्षित बांधा.\n३. तातडीने रुग्णवाहिकेतून किंवा गाडीतून एक्स-रे व प्लास्टरसाठी रुग्णालयात न्या.`;
        firstAidKitMed = `• लाकडी / मेटल स्प्लिंट्स (Immobilization Splints).\n• कॉटन व रोल्ड बँडेज.\n• पेनकिलर (केवळ डॉक्टरांच्या सूचनेनुसार).`;
        contraindications = `❌ फ्रॅक्चर झालेल्या भागावर वजन देणे किंवा वाकवणे पूर्ण निषिद्ध.`;
        hospitalRedFlags = `⚠️ हाडातून आवाज येणे, तीव्र वेदना, हाड त्वचेबाहेर येणे (Open Fracture).`;
        returnStages = `• दिवस १-३०: ऑर्थोपेडिक प्लास्टर / कास्ट.\n• दिवस ३१-४५: प्लास्टर निघाल्यानंतर स्नायूंची ताकद परत मिळवणे.`;
        break;

      case 'Head Impact / Concussion':
        days = 14;
        onFieldAction = `१. डोक्याला मार लागल्यास खेळाडूला त्वरित खेळातून बाहेर काढा (No Same-Day Return).\n२. खेळाडूची शुद्ध तपासा (नाव, वेळ, वार विचारणे).\n३. मान व डोके स्थिर ठेवून थंड सावलीत झोपवा.\n४. पुढील २४ तास उलटी, चक्कर, अंधुक दिसणे यावर लक्ष ठेवा.`;
        firstAidKitMed = `• कोल्ड कॉम्प्रेस.\n• ग्लूकोज / इलेक्ट्रोलाइट.\n• शून्य स्क्रीन टाईम (No Mobile/TV).`;
        contraindications = `❌ चक्कर येत असताना पुन्हा खेळात पाठवू नका.\n❌ झोपेचे औषध देऊ नका.`;
        hospitalRedFlags = `⚠️ बेशुद्ध पडणे, एकापेक्षा जास्त उलट्या होणे, डोळ्यांच्या बाहुल्यांचा आकार असमान होणे.`;
        returnStages = `• दिवस १-३: पूर्ण मानसिक व शारीरिक विश्रांती.\n• दिवस ४-७: हलके चालणे (लक्षणे नसल्यास).\n• दिवस ८-१४: नॉन-कॉन्टॅक्ट सराव.`;
        break;

      case 'Jammed Finger / Thumb Sprain':
        days = 7;
        onFieldAction = `१. बोट वाकवू नका; बर्फाच्या पाण्यात ५ मिनिटे बुडवा.\n२. लगतच्या चांगल्या बोटाला जोडून पट्टी बांधा (Buddy Taping).\n३. बोटाचा सांधा स्थिर ठेवा.`;
        firstAidKitMed = `• मेडिकल मायक्रोपोअर टेप.\n• फिंगर स्प्लिंट.\n• पेनकिलर जेल.`;
        contraindications = `❌ बोट जोरात खेचू नका (Pulling finger can worsen ligament tear).`;
        hospitalRedFlags = `⚠️ बोट सरळ करता येत नसल्यास (Mallet Finger) किंवा हाड वाकडे दिसत असल्यास.`;
        returnStages = `• दिवस १-३: बडी टेपिंग व विश्रांती.\n• दिवस ४-७: बॉल स्क्विझिंग व ग्रिप सराव.`;
        break;

      case 'Shin Splints / Tibial Stress':
        days = 8;
        onFieldAction = `१. कठीण जमिनीवर (डांबर/काँक्रीट) धावणे त्वरित थांबवा.\n२. नडगीच्या हाडावर १० मिनिटे बर्फाचा मसाज (Ice massage) करा.\n३. काल्फ व ॲकिलीसचे स्ट्रेचिंग करा.`;
        firstAidKitMed = `• आयस मसाज कप.\n• काल्फ कॉम्प्रेसिव्ह स्लीव्ह.\n• शॉक ॲबसॉर्बिंग इनसोल (Shoes Cushioning).`;
        contraindications = `❌ दुखणे दुर्लक्षित करून सलग धावू नका (कॅन लीड टू स्ट्रेस फ्रॅक्चर).`;
        hospitalRedFlags = `⚠️ हाडावर विशिष्ट एकाच बिंदूवर तीव्र वेदना व स्पर्श सहन न होणे.`;
        returnStages = `• दिवस १-४: मातीवर किंवा गवतावर हलके वॉक/जॉग.\n• दिवस ५-८: योग्य बुटांसह धावण्याचा सराव.`;
        break;

      case 'Heat Exhaustion / Severe Cramps':
        days = 2;
        onFieldAction = `१. खेळाडूला त्वरित सावलीत किंवा हवेशीर खोलीत झोपवा.\n२. कपडे सैल करा आणि ओल्या कपड्याने शरीर पुसा.\n३. १ ग्लास पाण्यात १ चमचा ORS / इलेक्ट्रॉल विरघळवून हळूहळू पाजा.\n४. पेटके आलेल्या स्नायूचे हळुवार उलट दिशेने स्ट्रेचिंग करा.`;
        firstAidKitMed = `• ओआरएस (ORS - Oral Rehydration Salts).\n• इलेक्ट्रॉल पावडर.\n• ग्लुकोज-डी.\n• थंड पाण्याची बाटली.`;
        contraindications = `❌ खेळाडू अर्धवट बेशुद्ध असल्यास जबरदस्तीने पाणी पाजू नका.\n❌ एकदम जास्त थंड पाणी एकदम पिऊ देऊ नका.`;
        hospitalRedFlags = `⚠️ शरीराचे तापमान १०३°F पेक्षा जास्त होणे, घाम थांबणे किंवा बेशुद्ध होणे (Heat Stroke).`;
        returnStages = `• दिवस १: पूर्ण विश्रांती व भरपूर द्रवपदार्थ सेवन.\n• दिवस २: हायड्रेशन तपासून हलका सराव.`;
        break;

      default:
        days = 5;
        onFieldAction = `१. खेळाडूला विश्रांती द्या व दुखऱ्या भागाची हालचाल मर्यादित ठेवा.\n२. बर्फ व सौम्य कम्प्रेशन लावा.`;
        firstAidKitMed = `• सामान्य प्रथमोपचार पेटीतील मलम व पट्टी.`;
        contraindications = `❌ जबरदस्तीने भार देणे टाळा.`;
        hospitalRedFlags = `⚠️ लक्षणे ३ दिवसांत कमी न झाल्यास डॉक्टरांचा सल्ला घ्या.`;
        returnStages = `• वेदनामुक्त झाल्यावर हळूहळू सराव सुरू करा.`;
        break;
    }

    const returnDate = addDays(new Date(), days);

    return {
      daysOff: days,
      onFieldAction,
      firstAidKitMed,
      contraindications,
      hospitalRedFlags,
      returnStages,
      expectedReturn: format(returnDate, 'dd MMM yyyy')
    };
  }
}

// ==========================================
// 4. MAIN HEALTH & INJURY HUB COMPONENT
// ==========================================
export function HealthIncidents({ 
  store, 
  section, 
  language = 'English', 
  preselectedSport 
}: { 
  store: any, 
  section: 'sports' | 'general', 
  language?: string, 
  preselectedSport?: string 
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Form State
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<string>("knee_right");
  const [selectedType, setSelectedType] = useState<string>("Ligament Sprain");
  const [severity, setSeverity] = useState<string>("Moderate");
  const [description, setDescription] = useState("");
  const [groundCondition, setGroundCondition] = useState<string>("Mud Ground (मातीचे मैदान)");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  // View Controls
  const [bodyView, setBodyView] = useState<'front' | 'back'>('front');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Lightbox / Modal
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const isGeneral = section === 'general';
  const isMarathi = language === 'Marathi';

  // Selected anatomical zone object
  const activeZone = useMemo(() => {
    return ANATOMICAL_ZONES.find(z => z.id === selectedBodyPartId) || ANATOMICAL_ZONES[0];
  }, [selectedBodyPartId]);

  // Filtered Players
  const filteredPlayers = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => isGeneral ? true : (p.category === 'athlete' && (!preselectedSport || p.sports?.includes(preselectedSport))))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, isGeneral, preselectedSport]
  );

  // Filtered Incidents List
  const filteredIncidents = useMemo(() => {
    return (store.data.healthIncidents || []).filter((h: any) => {
      const p = (store.data.players || []).find((pl: any) => pl.id === h.playerId);
      if (!isGeneral && h.category !== 'athlete') return false;
      if (preselectedSport && p && (!p.sports || !p.sports.includes(preselectedSport))) return false;
      
      const isResolved = h.resolved || h.status === 'Resolved' || h.description?.includes('[STATUS: RESOLVED]');
      if (activeTabFilter === 'active' && isResolved) return false;
      if (activeTabFilter === 'resolved' && !isResolved) return false;

      return true;
    });
  }, [store.data.healthIncidents, store.data.players, isGeneral, preselectedSport, activeTabFilter]);

  // Clinical Recovery & First-Aid Info
  const recoveryInfo = useMemo(() => {
    if (!selectedType || !activeZone) return null;
    return ClinicalInjurySolutions.getDetailedSolution(selectedType, activeZone.label, severity);
  }, [selectedType, activeZone, severity]);

  // When clicking a body part, switch view if required and suggest common injury
  const handleSelectZone = (zone: AnatomicalZone) => {
    setSelectedBodyPartId(zone.id);
    if (zone.view !== 'both') {
      setBodyView(zone.view);
    }
    if (zone.commonInjuries && zone.commonInjuries.length > 0) {
      setSelectedType(zone.commonInjuries[0]);
    }
  };

  // Handle Photo Capture/Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "फोटो खूप मोठा आहे", description: "कृपया ५ MB पेक्षा लहान आकाराचा फोटो निवडा.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedPhoto(reader.result as string);
      toast({ title: "📸 फोटो जोडला!", description: "दुखापतीचा फोटो वैद्यकीय रेकॉर्डमध्ये संलग्न केला आहे." });
    };
    reader.readAsDataURL(file);
  };

  // Save Injury Incident
  const handleSave = () => {
    if (!selectedPlayer || !selectedType || !activeZone) {
      toast({ 
        title: "माहिती अपूर्ण आहे", 
        description: "कृपया खेळाडू, शरीराचा भाग आणि दुखापतीचा प्रकार निवडा.", 
        variant: "destructive" 
      });
      return;
    }

    const player = store.data.players.find((p: any) => p.id === selectedPlayer);
    const info = recoveryInfo;
    
    const fullLog = `[INSTITUTIONAL MEDICAL AUDIT]
Location: ${activeZone.label} (${activeZone.labelMr})
Diagnosis: ${selectedType}
Severity: ${severity}
Ground: ${groundCondition}
Recovery: ${info?.daysOff} Days
Est. Return: ${info?.expectedReturn}
PROTOCOL: ${info?.onFieldAction}
MEDICINE/FIRST-AID: ${info?.firstAidKitMed}
CONTRAINDICATIONS: ${info?.contraindications}
RED_FLAGS: ${info?.hospitalRedFlags}
REHAB_STAGES: ${info?.returnStages}
COACH REMARKS: ${description || 'Standard on-field record.'}${attachedPhoto ? `\n[PHOTO_ATTACHED]: true` : ''}`;
    
    const incident = {
      id: `inj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      playerId: selectedPlayer,
      playerName: player?.name || "Unknown",
      date,
      description: fullLog,
      severity: (severity.includes('Severe') || severity.includes('Critical')) ? 'Critical' : 'Minor',
      category: player?.category || 'athlete',
      photoUrl: attachedPhoto || undefined,
      resolved: false,
      timestamp: new Date().toISOString()
    };

    store.addHealthIncident(incident);
    
    // Reset Form
    setDescription("");
    setAttachedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    toast({ 
      title: "🎯 दुखापत नोंद जतन झाली!", 
      description: `${player?.name || 'खेळाडू'} - ${activeZone.labelMr} वरील ${selectedType} ची नोंद झाली. अंदाजित पुनरागमन: ${info?.expectedReturn}`,
      className: "bg-emerald-600 text-white font-bold"
    });
  };

  // Mark Injury as Resolved / Fit to Play
  const handleMarkResolved = (incidentId: string) => {
    const target = (store.data.healthIncidents || []).find((h: any) => h.id === incidentId);
    if (!target) return;

    const updated = {
      ...target,
      resolved: true,
      resolvedDate: format(new Date(), 'yyyy-MM-dd'),
      description: `${target.description}\n[STATUS: RESOLVED - तंदुरुस्त / खेळण्यास सज्ज]`
    };

    if (store.updateHealthIncident) {
      store.updateHealthIncident(updated);
    } else {
      store.deleteHealthIncident(incidentId);
      store.addHealthIncident(updated);
    }

    toast({
      title: "✅ खेळाडू तंदुरुस्त घोषित!",
      description: `${target.playerName} ची दुखापत बरी झाल्याची नोंद झाली आहे.`,
      className: "bg-emerald-600 text-white font-bold"
    });
  };

  // Print Official Medical Incident Report
  const handlePrint = () => {
    const isM = isMarathi;
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, isM);
    const reportTitle = isM 
      ? 'शालेय क्रीडा दुखापत व प्रथमोपचार अधिकृत नोंदवही' 
      : 'INSTITUTIONAL SPORTS INJURY & MEDICAL AUDIT REGISTRY';
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, isM);

    const incidentsToPrint = filteredIncidents;

    const printContent = `
      <html>
        <head>
          <title>Institutional Injury Registry - Waghamba Hub</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap');
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; background: #fff; font-size: 11px; }
            h1 { color: #1e3a8a; text-transform: uppercase; border-bottom: 3px double #f59e0b; text-align: center; margin-bottom: 4px; font-size: 18px; font-weight: 900; }
            .report-type { font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 12px; color: #b45309; font-size: 13px; }
            .meta { font-weight: 700; text-transform: uppercase; font-size: 10px; margin-bottom: 15px; text-align: center; background: #f1f5f9; padding: 6px; border-radius: 6px; }
            .audit-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
            .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
            .audit-table th { background: #1e3a8a; color: white; text-transform: uppercase; font-weight: 800; font-size: 9.5px; }
            .audit-table tr:nth-child(even) { background: #f8fafc; }
            .critical-tag { color: #dc2626; font-weight: 900; background: #fee2e2; padding: 2px 5px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .minor-tag { color: #0369a1; font-weight: 900; background: #e0f2fe; padding: 2px 5px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .resolved-tag { color: #15803d; font-weight: 900; background: #dcfce7; padding: 2px 5px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: 900; text-transform: uppercase; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.15); color: white; }
            .btn-print { background: #f59e0b; color: white; }
            .photo-thumb { width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; ${isM ? 'मागे जा' : 'GO BACK'}</button>
            <button onclick="window.print()" class="btn btn-print">${isM ? '🖨️ प्रिंट काढा' : 'CONFIRM PRINT'}</button>
          </div>
          <h1>${schoolName}</h1>
          <div class="report-type">${reportTitle}</div>
          <div class="meta">Waghamba Sports Health Hub &bull; Total Incidents: ${incidentsToPrint.length} &bull; Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</div>
          
          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 4%;">अ.क्र.</th>
                <th style="width: 18%;">खेळाडूचे नाव</th>
                <th style="width: 9%;">दिनांक</th>
                <th style="width: 14%;">अवयव (Location)</th>
                <th style="width: 16%;">दुखापत व तीव्रता</th>
                <th style="width: 25%;">प्रथमोपचार / औषधोपचार</th>
                <th style="width: 8%;">पुनरागमन</th>
                <th style="width: 6%;">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              ${incidentsToPrint.map((inc: any, index: number) => {
                const p = store.data.players.find((item: any) => item.id === inc.playerId);
                const displayName = isM ? (p?.nameMarathi || transliterateEnglishToMarathi(p?.name || inc.playerName) || inc.playerName) : (p?.name || inc.playerName);
                const parsed = parseMedicalLog(inc.description);
                const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');
                const isRes = inc.resolved || inc.description?.includes('[STATUS: RESOLVED]');
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${index + 1}</td>
                    <td>
                      <strong>${displayName}</strong><br/>
                      <span style="font-size: 9px; color: #64748b;">${p?.std ? `Std ${p.std}` : ''} ${p?.sports ? `&bull; ${p.sports.join(', ')}` : ''}</span>
                    </td>
                    <td>${inc.date}</td>
                    <td><strong>${parsed.location}</strong></td>
                    <td>
                      <strong>${parsed.diagnosis}</strong><br/>
                      <span class="${isCrit ? 'critical-tag' : 'minor-tag'}">${parsed.severity}</span>
                    </td>
                    <td>
                      <div style="font-size: 10px; margin-bottom: 2px;"><strong>उपाय:</strong> ${parsed.protocol || parsed.medicine}</div>
                      ${parsed.remarks ? `<div style="font-size: 9px; color: #475569; italic;"><strong>टीप:</strong> ${parsed.remarks}</div>` : ''}
                    </td>
                    <td><strong>${parsed.expectedReturn}</strong></td>
                    <td><span class="${isRes ? 'resolved-tag' : (isCrit ? 'critical-tag' : 'minor-tag')}">${isRes ? 'तंदुरुस्त' : 'सध्या बाधित'}</span></td>
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

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Stethoscope className="w-7 h-7 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                  क्रीडा दुखापत व प्रथमोपचार कक्ष (Sports Injury Hub)
                </h2>
                <Badge className="bg-rose-500 text-white font-black text-[9px] uppercase px-2.5 py-0.5">
                  Interactive Body IQ
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Real Anatomical Human Body Mapping &bull; Clinical First-Aid Protocols &bull; Recovery Timeline
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button 
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-12 px-6 rounded-2xl uppercase text-xs tracking-wider shadow-xl active-scale"
          >
            <Printer className="w-4 h-4 mr-2" /> अधिकृत रिपोर्ट प्रिंट करा (Print Audit)
          </Button>
        </div>
      </div>

      {/* 2. Main 2-Column Clinical Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Interactive Anatomical Human Body & Mapping Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-2 rounded-[2.5rem] p-6 sm:p-8 shadow-xl bg-white space-y-6">
            
            {/* Step 1: Select Student Athlete */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600" /> १. दुखापतग्रस्त खेळाडू निवडा (Select Athlete)
                </label>
                <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20">
                  Roster Active
                </Badge>
              </div>
              <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-slate-50 text-base">
                  <SelectValue placeholder="विद्यार्थ्याचे नाव निवडा..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {filteredPlayers.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-bold">{isMarathi ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : p.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">(Std {p.std} &bull; {p.sports?.join(', ') || 'General'})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Interactive Real Anatomical Body Map */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-600" /> २. शरीराचा दुखावला गेलेला भाग निवडा (Map Body Part)
                  </label>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    शरीराच्या अचूक बिंदूवर टॅप करा किंवा उजवीकडील यादीतून निवडा.
                  </p>
                </div>

                {/* View & Gender Controls */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setBodyView('front')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                      bodyView === 'front' ? "bg-rose-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    पुढील भाग (Front)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyView('back')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                      bodyView === 'back' ? "bg-rose-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    मागील भाग (Back)
                  </button>
                </div>
              </div>

              {/* REALISTIC SVG ANATOMICAL BODY CONTAINER */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* SVG Visualizer */}
                <div className="md:col-span-6 flex justify-center">
                  <div className="relative w-64 aspect-[1/2] bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 rounded-3xl border-4 border-slate-800 shadow-2xl p-4 overflow-hidden select-none">
                    
                    {/* View Label Badge inside */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-white/10 text-white font-black text-[8px] uppercase tracking-wider backdrop-blur-md">
                        {bodyView === 'front' ? 'Anterior (Front)' : 'Posterior (Back)'}
                      </Badge>
                    </div>

                    {/* SVG Realistic Human Body Outline */}
                    <svg viewBox="0 0 100 200" className="w-full h-full">
                      {/* Anatomical Body Silhouette */}
                      {bodyView === 'front' ? (
                        <g fill="#1e293b" stroke="#475569" strokeWidth="0.8">
                          {/* Head & Neck */}
                          <circle cx="50" cy="18" r="9" />
                          <path d="M46 27 L46 33 L54 33 L54 27 Z" />
                          {/* Torso & Chest & Pelvis */}
                          <path d="M35 33 L65 33 L70 55 L65 85 L35 85 L30 55 Z" />
                          <line x1="50" y1="33" x2="50" y2="85" stroke="#334155" strokeWidth="0.5" />
                          {/* Arms */}
                          <path d="M34 35 L22 62 L15 90 L11 96 L16 98 L22 92 L28 65 L35 48 Z" />
                          <path d="M66 35 L78 62 L85 90 L89 96 L84 98 L78 92 L72 65 L65 48 Z" />
                          {/* Left Leg */}
                          <path d="M35 85 L48 85 L46 128 L48 165 L46 186 L36 188 L34 184 L40 165 L39 128 L32 88 Z" />
                          {/* Right Leg */}
                          <path d="M65 85 L52 85 L54 128 L52 165 L54 186 L64 188 L66 184 L60 165 L61 128 L68 88 Z" />
                        </g>
                      ) : (
                        <g fill="#1e293b" stroke="#475569" strokeWidth="0.8">
                          {/* Head & Cervical */}
                          <circle cx="50" cy="18" r="9" />
                          <path d="M46 27 L46 33 L54 33 L54 27 Z" />
                          {/* Upper & Lower Back */}
                          <path d="M35 33 L65 33 L70 55 L65 85 L35 85 L30 55 Z" />
                          <line x1="50" y1="27" x2="50" y2="85" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
                          {/* Arms Back */}
                          <path d="M34 35 L22 62 L15 90 L11 96 L16 98 L22 92 L28 65 L35 48 Z" />
                          <path d="M66 35 L78 62 L85 90 L89 96 L84 98 L78 92 L72 65 L65 48 Z" />
                          {/* Glutes & Legs Back */}
                          <path d="M35 85 L48 85 L46 128 L48 165 L46 186 L36 188 L34 184 L40 165 L39 128 L32 88 Z" />
                          <path d="M65 85 L52 85 L54 128 L52 165 L54 186 L64 188 L66 184 L60 165 L61 128 L68 88 Z" />
                        </g>
                      )}

                      {/* Interactive Anatomical Hotspots */}
                      {ANATOMICAL_ZONES
                        .filter(z => z.view === 'both' || z.view === bodyView)
                        .map((zone) => {
                          const xPos = bodyView === 'front' ? (zone.xFront || 50) : (zone.xBack || 50);
                          const yPos = bodyView === 'front' ? (zone.yFront || 50) : (zone.yBack || 50);
                          const isSelected = selectedBodyPartId === zone.id;

                          return (
                            <g 
                              key={zone.id}
                              onClick={() => handleSelectZone(zone)}
                              className="cursor-pointer transition-all duration-300"
                            >
                              {/* Glowing pulse ring if selected */}
                              {isSelected && (
                                <circle
                                  cx={xPos}
                                  cy={yPos * 1.9}
                                  r="7"
                                  fill="none"
                                  stroke="#f43f5e"
                                  strokeWidth="1.5"
                                  className="animate-ping opacity-75 origin-center"
                                />
                              )}
                              {/* Base Pin Circle */}
                              <circle
                                cx={xPos}
                                cy={yPos * 1.9}
                                r={isSelected ? "4.5" : "3.2"}
                                fill={isSelected ? "#f43f5e" : "#3b82f6"}
                                stroke="#ffffff"
                                strokeWidth="1"
                                className="hover:scale-125 transition-transform"
                              />
                            </g>
                          );
                        })}
                    </svg>

                    {/* Bottom Status Ribbon */}
                    <div className="absolute bottom-2 inset-x-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-white/10 text-center">
                      <p className="text-[9px] font-black text-rose-400 uppercase truncate">
                        {activeZone ? activeZone.labelMr : 'अवयव निवडा'}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Hotspot Direct Selector List */}
                <div className="md:col-span-6 space-y-3">
                  <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-rose-800 uppercase tracking-widest">
                      निवडलेला अवयव (Selected Region):
                    </span>
                    <h4 className="text-base font-black text-slate-900 uppercase">
                      {activeZone.labelMr}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground">{activeZone.label} ({activeZone.category})</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                      वारंवार होणाऱ्या दुखापती (Common for this zone):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeZone.commonInjuries.map((inj, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedType(inj)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all border",
                            selectedType === inj
                              ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          {inj}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Step 3: Injury Type & Severity Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">
                  ३. दुखापतीचा प्रकार (Injury Diagnosis)
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-white text-xs">
                    <SelectValue placeholder="दुखापत निवडा..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {REALISTIC_INJURY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="font-bold">{type.labelMr}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">
                  ४. तीव्रता व गंभीरता (Severity Level)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Minor (कमी)', 'Moderate (मध्यम)', 'Severe (गंभीर/Emergency)'].map((lvl) => {
                    const isSelected = severity.startsWith(lvl.split(' ')[0]);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl.split(' ')[0])}
                        className={cn(
                          "h-12 rounded-xl text-[9px] font-black uppercase border-2 transition-all p-1 text-center",
                          isSelected
                            ? (lvl.includes('Severe') ? "bg-rose-600 text-white border-rose-700 shadow-md" : "bg-primary text-white border-primary shadow-md")
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {lvl.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Step 4: Ground Condition & Coach Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  मैदानाची स्थिती (Ground Surface):
                </label>
                <Select value={groundCondition} onValueChange={setGroundCondition}>
                  <SelectTrigger className="h-11 rounded-xl border-2 font-bold text-xs bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mud Ground (मातीचे मैदान)">मातीचे मैदान (Mud Ground)</SelectItem>
                    <SelectItem value="Indoor Mat (कबड्डी मॅट)">इनडोअर मॅट (Kabaddi Mat)</SelectItem>
                    <SelectItem value="Clay / Hard Court (कठीण जमीन)">कठीण माती / काँक्रीट (Clay/Hard)</SelectItem>
                    <SelectItem value="Grass Turf (गवताळ मैदान)">गवताळ मैदान (Grass Turf)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Capture / Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-rose-600" /> दुखापतीचा फोटो जोडा (Photo Proof):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="injury-photo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 flex-1 border-2 rounded-xl font-black text-xs uppercase"
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" /> फोटो कॅमेरा / अपलोड
                  </Button>
                  {attachedPhoto && (
                    <div className="flex items-center gap-1">
                      <img 
                        src={attachedPhoto} 
                        alt="Injury Preview" 
                        onClick={() => setViewingPhotoUrl(attachedPhoto)}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-rose-500 cursor-pointer shadow-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setAttachedPhoto(null)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Remarks Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                ५. कोचची निरीक्षणे व दुखापत कशी झाली? (Incident Details)
              </label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="उदा. कबड्डीमध्ये रेडरला पकडताना घोटा वळला आणि सूज आली..."
                className="min-h-[90px] border-2 rounded-xl font-bold p-3 text-xs"
              />
            </div>

            {/* Save Incident Button */}
            <Button
              onClick={handleSave}
              className={cn(
                "w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale transition-all flex items-center justify-center gap-2",
                (severity.includes('Severe') || severity.includes('Critical'))
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              <ShieldAlert className="w-5 h-5" /> दुखापत नोंद जतन करा (Archive Injury Incident)
            </Button>

          </Card>
        </div>

        {/* Right 5 Cols: Live Clinical Solutions, First-Aid Protocols & Incident Ledger */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dynamic Clinical Solutions Panel for Selected Injury */}
          {recoveryInfo && (
            <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-5 border-rose-200">
              
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-rose-600" />
                  <h4 className="text-base font-black text-primary uppercase">
                    प्रथमोपचार व वैद्यकीय उपाय
                  </h4>
                </div>
                <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 shadow-sm">
                  {recoveryInfo.daysOff} दिवस विश्रांती (Days Off)
                </Badge>
              </div>

              {/* On Field Action */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                  ❄️ मैदानावरील तात्काळ कृती (Immediate First-Aid):
                </span>
                <p className="text-xs font-bold text-emerald-950 whitespace-pre-line leading-relaxed">
                  {recoveryInfo.onFieldAction}
                </p>
              </div>

              {/* First Aid Kit Medicine */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                  🩹 शाळेच्या पेटीतील मलम व औषधे (Approved Kit):
                </span>
                <p className="text-xs font-bold text-blue-950 whitespace-pre-line leading-relaxed">
                  {recoveryInfo.firstAidKitMed}
                </p>
              </div>

              {/* Strict Contraindications / Don'ts */}
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-1.5">
                  🚫 काय करू नये (Strict Don&apos;ts):
                </span>
                <p className="text-xs font-bold text-rose-950 whitespace-pre-line leading-relaxed">
                  {recoveryInfo.contraindications}
                </p>
              </div>

              {/* Hospital Red Flags */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                  🏥 रुग्णालयात कधी न्यावे (Hospital Red Flag):
                </span>
                <p className="text-[11px] font-bold text-amber-950 whitespace-pre-line leading-relaxed">
                  {recoveryInfo.hospitalRedFlags}
                </p>
              </div>

              {/* Return Date Badge */}
              <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                अंदाजित पुनरागमन: {recoveryInfo.expectedReturn}
              </div>

            </Card>
          )}

          {/* Active vs Resolved Injury Incident Ledger */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-black text-primary uppercase tracking-tight">
                  नोंदवलेल्या दुखापती ({filteredIncidents.length})
                </h4>
              </div>

              {/* Active/Resolved Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border text-[10px] font-black uppercase">
                <button
                  type="button"
                  onClick={() => setActiveTabFilter('all')}
                  className={cn("px-2.5 py-1 rounded-lg transition-all", activeTabFilter === 'all' ? "bg-primary text-white" : "text-slate-600")}
                >
                  सर्व
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter('active')}
                  className={cn("px-2.5 py-1 rounded-lg transition-all", activeTabFilter === 'active' ? "bg-rose-600 text-white" : "text-slate-600")}
                >
                  बाधित
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter('resolved')}
                  className={cn("px-2.5 py-1 rounded-lg transition-all", activeTabFilter === 'resolved' ? "bg-emerald-600 text-white" : "text-slate-600")}
                >
                  तंदुरुस्त
                </button>
              </div>
            </div>

            <ScrollArea className="max-h-[500px] pr-2">
              <div className="space-y-3">
                {filteredIncidents.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-[2rem] bg-white opacity-40">
                    <HeartPulse className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-black uppercase text-xs">कोणतीही दुखापत नोंद उपलब्ध नाही.</p>
                  </Card>
                ) : (
                  filteredIncidents.map((inc: any) => {
                    const p = store.data.players.find((item: any) => item.id === inc.playerId);
                    const displayName = isMarathi ? (p?.nameMarathi || transliterateEnglishToMarathi(p?.name || inc.playerName) || inc.playerName) : (p?.name || inc.playerName);
                    const parsed = parseMedicalLog(inc.description);
                    const isResolved = inc.resolved || inc.description?.includes('[STATUS: RESOLVED]');
                    const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');

                    return (
                      <Card key={inc.id} className="p-4 rounded-2xl border-2 bg-white shadow-sm hover:border-primary/40 transition-all space-y-3 group relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge className={cn("text-[8px] font-black uppercase px-2", isCrit ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-blue-100 text-blue-800 border-blue-200")}>
                                {parsed.diagnosis}
                              </Badge>
                              {isResolved && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[8px] font-black uppercase px-2">
                                  तंदुरुस्त (Fit)
                                </Badge>
                              )}
                            </div>
                            <h5 className="font-black text-slate-900 text-sm">{displayName}</h5>
                            <span className="text-[10px] text-muted-foreground font-bold">{inc.date} &bull; {parsed.location}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {inc.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoUrl(inc.photoUrl)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="फोटो पाहा"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {!isResolved && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkResolved(inc.id)}
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase rounded-lg px-2.5 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> तंदुरुस्त
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => store.deleteHealthIncident(inc.id)} 
                              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border text-[11px] font-medium text-slate-800 space-y-1">
                          <p><strong>प्रथमोपचार:</strong> {parsed.protocol || parsed.medicine}</p>
                          <p className="text-[10px] text-muted-foreground"><strong>पुनरागमन:</strong> {parsed.expectedReturn}</p>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

        </div>

      </div>

      {/* Lightbox Photo Preview Modal */}
      <Dialog open={!!viewingPhotoUrl} onOpenChange={() => setViewingPhotoUrl(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-black uppercase text-base text-primary">
              दुखापतीचा संलग्न फोटो (Injury Photo Proof)
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 rounded-2xl overflow-hidden border-2 shadow-inner flex items-center justify-center bg-black">
            {viewingPhotoUrl && (
              <img src={viewingPhotoUrl} alt="Injury Full" className="w-full h-auto max-h-[450px] object-contain" />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setViewingPhotoUrl(null)} className="w-full rounded-xl font-black uppercase text-xs">
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

