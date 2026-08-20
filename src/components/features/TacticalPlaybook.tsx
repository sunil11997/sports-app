
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Layout, 
  Save, 
  ChevronRight, 
  ShieldCheck, 
  Trash2, 
  Sword, 
  ShieldHalf, 
  Gamepad2, 
  Info,
  Sparkles,
  Target,
  Users,
  Flame,
  Zap,
  Clock,
  Flag,
  Printer,
  Plus,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Radio,
  Play,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { format } from 'date-fns';

// 1. Formation Presets with Player Coordinates on a 100x60 Tactical Grid
export interface TacticalFormation {
  id: string;
  name: string;
  nameMr: string;
  sport: string;
  type: 'Defense' | 'Offense' | 'Transition' | 'Special';
  desc: string;
  situation: string;
  coachInstructions: string[];
  players: { id: string; role: string; roleMr: string; x: number; y: number; team: 'home' | 'away' }[];
  arrows: { from: [number, number]; to: [number, number]; color: string; label?: string }[];
}

export const REALTIME_FORMATIONS: Record<string, TacticalFormation[]> = {
  'Kabaddi': [
    {
      id: 'kab_5_1_1',
      name: '5-1-1 Bonus Trap Defense',
      nameMr: '५-१-१ बोनस ट्रॅप डिफेन्स',
      sport: 'Kabaddi',
      type: 'Defense',
      desc: 'बोनस रेषेवर रेडरला आकर्षित करून कोपऱ्यातून अचानक साखळीने पकडण्याची रणनीती.',
      situation: 'जेव्हा प्रतिस्पर्धी रेडर बोनस घेण्याचा प्रयत्न करतो किंवा आघाडी टिकवायची असते.',
      coachInstructions: [
        'दोन्ही कोपरे (Corners) बोनस रेषेच्या किंचित मागे राहून रेडरला आत येऊ द्या.',
        'मध्य कव्हर्स (In-Covers) घट्ट साखळी जोडून रेडरच्या वळणावर लक्ष ठेवा.',
        'जसा रेडरचा पाय बोनस रेषेवर पडतो, तशी डाव्या कोपऱ्याने अँकल होल्ड आणि उजव्या कव्हरने डॅश मारा.'
      ],
      players: [
        { id: 'LC', role: 'Left Corner', roleMr: 'डावा कोपरा', x: 18, y: 72, team: 'home' },
        { id: 'LIn', role: 'Left In', roleMr: 'डावा कव्हर', x: 32, y: 55, team: 'home' },
        { id: 'C1', role: 'Center Cover', roleMr: 'मध्य फळी', x: 50, y: 45, team: 'home' },
        { id: 'RIn', role: 'Right In', roleMr: 'उजवा कव्हर', x: 68, y: 55, team: 'home' },
        { id: 'RC', role: 'Right Corner', roleMr: 'उजवा कोपरा', x: 82, y: 72, team: 'home' },
        { id: 'Rider', role: 'Opp Raider', roleMr: 'विरोधी रेडर', x: 50, y: 80, team: 'away' }
      ],
      arrows: [
        { from: [18, 72], to: [45, 78], color: '#f59e0b', label: 'Ankle Hold Trap' },
        { from: [68, 55], to: [52, 75], color: '#3b82f6', label: 'Cover Dash' },
        { from: [50, 80], to: [50, 65], color: '#ef4444', label: 'Raid Path' }
      ]
    },
    {
      id: 'kab_super_tackle',
      name: 'Super Tackle 3-Player Wall',
      nameMr: '३-खेळाडू सुपर टॅकल भिंत',
      sport: 'Kabaddi',
      type: 'Special',
      desc: '३ किंवा त्यापेक्षा कमी खेळाडू असताना २ अतिरिक्त गुणांसाठी केलेली धोकादायक पण प्रभावी पकड.',
      situation: 'जेव्हा संघात फक्त ३ किंवा २ खेळाडू शिल्लक असतात आणि ऑल-आऊट टाळायचा असतो.',
      coachInstructions: [
        'तिन्ही खेळाडूंनी एकमेकांचे हात घट्ट पकडून उभे राहा.',
        'रेडरला लॉबीच्या टोकापर्यंत जाऊ द्या, मध्यरेषेवर घाई करू नका.',
        'रेडरने पाय उचलताच तिघांनी एकाच क्षणी अंगावर झेपावून जमिनीवर दाबा.'
      ],
      players: [
        { id: 'P1', role: 'Left Ankle', roleMr: 'डावा रक्षक', x: 25, y: 65, team: 'home' },
        { id: 'P2', role: 'Center Lock', roleMr: 'मध्य लॉक', x: 50, y: 60, team: 'home' },
        { id: 'P3', role: 'Right Thigh', roleMr: 'उजवा रक्षक', x: 75, y: 65, team: 'home' },
        { id: 'Rider', role: 'Aggressive Raider', roleMr: 'रेडर', x: 50, y: 82, team: 'away' }
      ],
      arrows: [
        { from: [25, 65], to: [48, 75], color: '#10b981', label: 'Low Tackle' },
        { from: [75, 65], to: [52, 75], color: '#10b981', label: 'Upper Lock' }
      ]
    },
    {
      id: 'kab_dubki_raid',
      name: 'Dubki & Lobby Escape Vector',
      nameMr: 'डूबकी व लॉबी सुटका आक्रमक चाल',
      sport: 'Kabaddi',
      type: 'Offense',
      desc: 'दोन डिफेंडर्सच्या हाताखालून वेगात वाकून जमिनीलगत मध्यरेषा पार करण्याची रेडरची चाल.',
      situation: 'जेव्हा दोन्ही कव्हर्स एकदम साखळी घेऊन अंगावर येतात.',
      coachInstructions: [
        'कव्हर्सना पुढे येण्यासाठी थोडा वेळ द्या.',
        'जसे ते हात उंचावून साखळी पुढे करतात, तसे कंबरेतून पूर्ण वाकून खाली जा.',
        'एका हाताने मध्यरेषेला स्पर्श करा आणि पाय वेगात बाहेर काढा.'
      ],
      players: [
        { id: 'RD', role: 'Our Raider', roleMr: 'आपला रेडर', x: 50, y: 68, team: 'home' },
        { id: 'D1', role: 'Left Chain', roleMr: 'डावी साखळी', x: 42, y: 60, team: 'away' },
        { id: 'D2', role: 'Right Chain', roleMr: 'उजवी साखळी', x: 58, y: 60, team: 'away' },
        { id: 'C', role: 'Center Line', roleMr: 'मध्य रेषा', x: 50, y: 20, team: 'away' }
      ],
      arrows: [
        { from: [50, 68], to: [50, 40], color: '#f59e0b', label: 'Low Dubki Slip' },
        { from: [50, 40], to: [50, 20], color: '#10b981', label: 'Safe Midline Reach' }
      ]
    }
  ],
  'Volleyball': [
    {
      id: 'vb_6_2_formation',
      name: '6-2 Double Setter Offense',
      nameMr: '६-२ डबल सेटर आक्रमक मांडणी',
      sport: 'Volleyball',
      type: 'Offense',
      desc: 'दोन सेटर्स वापरून फ्रंट लाईनमध्ये नेहमी ३ स्पायकर्स सज्ज ठेवण्याची आधुनिक रणनीती.',
      situation: 'जेव्हा प्रतिस्पर्ध्याची ब्लॉक भिंत मजबूत असते आणि विविध कोनातून स्मॅश मारायचे असतात.',
      coachInstructions: [
        'मागच्या रांगेतील सेटर चेंडू येताच वेगात फ्रंट झोनमध्ये पोझिशन २/३ वर धावेल.',
        'तिन्ही फ्रंट खेळाडूंनी एकाच वेळी स्पाइकचा पवित्रा घेऊन ब्लॉकर्सना संभ्रमात टाकावे.',
        'उजव्या विंगला क्विक शॉट किंवा डाव्या आऊटसाईडला हाय सेट पास करा.'
      ],
      players: [
        { id: 'OH', role: 'Outside Hitter', roleMr: 'डावा स्पायकर', x: 20, y: 35, team: 'home' },
        { id: 'MB', role: 'Middle Blocker', roleMr: 'मध्य ब्लॉकर', x: 50, y: 30, team: 'home' },
        { id: 'OP', role: 'Opposite Hitter', roleMr: 'उजवा स्पायकर', x: 80, y: 35, team: 'home' },
        { id: 'S', role: 'Back Setter', roleMr: 'बॅक सेटर', x: 65, y: 75, team: 'home' },
        { id: 'L', role: 'Libero', roleMr: 'लिबेरो', x: 50, y: 80, team: 'home' },
        { id: 'DS', role: 'Def Specialist', roleMr: 'बॅक डिफेन्डर', x: 25, y: 75, team: 'home' }
      ],
      arrows: [
        { from: [65, 75], to: [55, 32], color: '#f59e0b', label: 'Setter Sprint' },
        { from: [55, 32], to: [20, 20], color: '#10b981', label: 'High Spike Set' },
        { from: [55, 32], to: [50, 18], color: '#3b82f6', label: 'Quick Middle Pop' }
      ]
    },
    {
      id: 'vb_triple_block',
      name: 'Triple Wall Net Block',
      nameMr: 'तिहेरी नेट ब्लॉक भिंत',
      sport: 'Volleyball',
      type: 'Defense',
      desc: 'प्रतिस्पर्ध्याच्या मुख्य स्पायकरचा पॉवर स्मॅश १००% अडवण्यासाठी तिघांनी एकत्र उडी घेणे.',
      situation: 'जेव्हा प्रतिस्पर्ध्याचा सर्वोत्तम स्पायकर फ्रंट लाईनमधून पॉवर स्मॅश मारत असतो.',
      coachInstructions: [
        'दोन्ही आऊटसाईड ब्लॉकर्सनी चेंडू हवेत असताना मध्य ब्लॉकरजवळ तातडीने क्लोज व्हावे.',
        'स्पायकरच्या हाताच्या हालचालीनुसार तिघांनी एकाच वेळी उडी मारून हात नेटच्या पलीकडे दाबावेत.',
        'मागच्या लिबेरोने ब्लॉकच्या कडेने पडणारा ड्रॉप बॉल कव्हर करावा.'
      ],
      players: [
        { id: 'B1', role: 'Left Blocker', roleMr: 'डावा ब्लॉक', x: 38, y: 15, team: 'home' },
        { id: 'B2', role: 'Middle Blocker', roleMr: 'मध्य ब्लॉक', x: 50, y: 15, team: 'home' },
        { id: 'B3', role: 'Right Blocker', roleMr: 'उजवा ब्लॉक', x: 62, y: 15, team: 'home' },
        { id: 'LIB', role: 'Libero Dig', roleMr: 'लिबेरो', x: 50, y: 70, team: 'home' },
        { id: 'SPK', role: 'Opp Spiker', roleMr: 'विरोधी स्पायकर', x: 50, y: 5, team: 'away' }
      ],
      arrows: [
        { from: [38, 15], to: [48, 12], color: '#10b981', label: 'Tight Wall' },
        { from: [62, 15], to: [52, 12], color: '#10b981', label: 'Tight Wall' }
      ]
    }
  ],
  'Kho Kho': [
    {
      id: 'kho_3_3_single_chain',
      name: '3-3 Single Chain Ring Defense',
      nameMr: '३-३ सिंगल साखळी रिंग संरक्षण',
      sport: 'Kho Kho',
      type: 'Defense',
      desc: '३ खेळाडूंच्या तुकडीने पोलजवळ चक्राकार फिरून जास्तीत जास्त वेळ काढण्याचे डिफेन्स तंत्र.',
      situation: 'जेव्हा चेझर्स वेगात आक्रमण करत असतात आणि डावाचा वेळ वाढवायचा असतो.',
      coachInstructions: [
        'धावपटूने खांबापासून १.५ मीटर त्रिज्येत सतत हलत राहावे.',
        'चेझरने खो देताच विरुद्ध दिशेला वळून खांबाच्या मागे यावे.',
        'पाठ न दाखवता डोळ्यांच्या कोनातून चेझरच्या पावलांवर लक्ष ठेवा.'
      ],
      players: [
        { id: 'R1', role: 'Lead Runner', roleMr: 'मुख्य धावपटू', x: 25, y: 40, team: 'home' },
        { id: 'R2', role: 'Support Runner', roleMr: 'मदतनीस', x: 30, y: 48, team: 'home' },
        { id: 'R3', role: 'Third Runner', roleMr: 'तिसरा धावपटू', x: 20, y: 55, team: 'home' },
        { id: 'P1', role: 'Pole Post', roleMr: 'खांब (Pole)', x: 15, y: 50, team: 'away' },
        { id: 'C1', role: 'Active Chaser', roleMr: 'चेझर', x: 45, y: 45, team: 'away' }
      ],
      arrows: [
        { from: [25, 40], to: [18, 46], color: '#f59e0b', label: 'Ring Arc' },
        { from: [18, 46], to: [28, 54], color: '#10b981', label: 'Pole Turn' }
      ]
    },
    {
      id: 'kho_pole_dive_attack',
      name: 'Fast Pole Dive Ambush',
      nameMr: 'झटपट पोल डाईव्ह अटॅक',
      sport: 'Kho Kho',
      type: 'Offense',
      desc: 'चेझरने खांबाची गती वापरून हवेत शरीर झोकून धावपटूला अनपेक्षित स्पर्श करण्याचे तंत्र.',
      situation: 'जेव्हा धावपटू खांबाजवळ सावध न राहता वेळ काढत असतो.',
      coachInstructions: [
        'मागून वेगात येऊन खांबावर एका हाताची पकड घ्या.',
        'शरीराचा तोल खांबावरून पुढे फेकून एका हाताने धावपटूच्या पायाला टॅप करा.'
      ],
      players: [
        { id: 'CH', role: 'Fast Chaser', roleMr: 'आक्रमक चेझर', x: 25, y: 35, team: 'home' },
        { id: 'POL', role: 'Pole', roleMr: 'खांब', x: 20, y: 50, team: 'away' },
        { id: 'RN', role: 'Unaware Runner', roleMr: 'धावपटू', x: 15, y: 65, team: 'away' }
      ],
      arrows: [
        { from: [25, 35], to: [20, 50], color: '#f59e0b', label: 'Pole Grip' },
        { from: [20, 50], to: [15, 65], color: '#ef4444', label: 'Explosive Dive' }
      ]
    }
  ],
  'Handball': [
    {
      id: 'hb_6_0_wall',
      name: '6-0 Static Wall Defense',
      nameMr: '६-० अभेद्य गोल डिफेन्स भिंत',
      sport: 'Handball',
      type: 'Defense',
      desc: '६-मीटर डी-लाईनवर ६ खेळाडूंनी मिळून विंग ते विंग भिंत उभी करून गोल अडवणे.',
      situation: 'जेव्हा प्रतिस्पर्धी टीमकडे ताकदवान 9m शूटर नसून ते विंग कट्स मारत असतात.',
      coachInstructions: [
        'सर्व ६ खेळाडूंनी ६-मीटर लाईनला लागून एकत्र राहावे.',
        'चेंडू डावीकडे जाताच संपूर्ण भिंत डावीकडे २ पावले शिफ्ट होईल.',
        'शॉट मारताना समोरचा खेळाडू पुढे येऊन ब्लॉक करेल, इतर मागे कव्हर करतील.'
      ],
      players: [
        { id: 'LW', role: 'Left Wing Def', roleMr: 'डावा विंग', x: 18, y: 40, team: 'home' },
        { id: 'LB', role: 'Left Back Def', roleMr: 'डावा बॅक', x: 30, y: 35, team: 'home' },
        { id: 'CB1', role: 'Center Def L', roleMr: 'मध्य डावा', x: 44, y: 32, team: 'home' },
        { id: 'CB2', role: 'Center Def R', roleMr: 'मध्य उजवा', x: 56, y: 32, team: 'home' },
        { id: 'RB', role: 'Right Back Def', roleMr: 'उजवा बॅक', x: 70, y: 35, team: 'home' },
        { id: 'RW', role: 'Right Wing Def', roleMr: 'उजवा विंग', x: 82, y: 40, team: 'home' },
        { id: 'GK', role: 'Goalkeeper', roleMr: 'गोलकीपर', x: 50, y: 20, team: 'home' }
      ],
      arrows: [
        { from: [44, 32], to: [48, 48], color: '#3b82f6', label: 'Step Out & Block' }
      ]
    }
  ]
};

// 2. Universal Real-Time Ground Tactical Situations
export const REALTIME_MATCH_SITUATIONS = [
  {
    id: 'sit_leading',
    title: '🔥 आघाडीवर असताना (Protecting the Lead)',
    subtitle: 'सामन्यात आघाडी असताना शांत डोक्याने वेळ खाणे व चूक न करणे',
    icon: Flame,
    color: 'bg-emerald-600 text-white',
    tactics: [
      'कबड्डी: प्रत्येक रेड पूर्ण २८-२९ सेकंद चालवा, घाईने खोलवर जाऊ नका.',
      'व्हॉलीबॉल: सर्व्हिसमध्ये जोखीम न घेता सेफ फ्लोट सर्व्हिस कोर्टात टाका.',
      'खो-खो: धावपटूने खांबाच्या जवळ राहून सलग ३ मिनिटे वेळ खावी.',
      'हँडबॉल: पासिंगची गती नियंत्रित ठेवून निश्चित गोल चान्स मिळेपर्यंत चेंडू फिरवा.'
    ]
  },
  {
    id: 'sit_trailing',
    title: '⚡ पिछाडीवर असताना (Comeback / Aggressive Attack)',
    subtitle: 'गुणांची तूट भरून काढण्यासाठी जलद व आक्रमक चाली करणे',
    icon: Zap,
    color: 'bg-rose-600 text-white',
    tactics: [
      'कबaddi: बोनस ऑन असताना बोनसचा प्रयत्न करून कॉर्नरवर हात स्पर्श मारा.',
      'व्हॉलीबॉल: ३-मीटर लाईनच्या मागून बॅक-रो अटॅकचा वापर करून प्रतिस्पर्ध्याला चकवा.',
      'खो-खो: चेझर्सने सुरुवातीच्या ३० सेकंदात आक्रमक पोल डाईव्ह मारून गडी बाद करावेत.',
      'हँडबॉल: फास्ट ब्रेक (Fast Break) पद्धत वापरून गोलकीपरकडून थेट लांब पास फेका.'
    ]
  },
  {
    id: 'sit_timeout',
    title: '⏱️ ३०-सेकंद टाईम-आऊट ब्रीफिंग (30s Time-out Master Cues)',
    subtitle: 'टाईम-आऊट दरम्यान प्रशिक्षकाने खेळाडूंना द्यायच्या थेट सूचना',
    icon: Clock,
    color: 'bg-amber-600 text-white',
    tactics: [
      '१. "श्वास दीर्घ घ्या आणि शांत व्हा, घाई करू नका."',
      '२. "त्यांचा डावा कोपरा / कमकुवत खेळाडू टार्गेट करा."',
      '३. "साखळी तोडू नका, एकमेकांना आवाज द्या (Communication)."'
    ]
  },
  {
    id: 'sit_clutch',
    title: '🏆 शेवटची २ मिनिटे (Clutch / Last 2 Minutes Gameplan)',
    subtitle: 'अंतिम क्षणी विजय खेचून आणण्यासाठी निर्णायक रणनीती',
    icon: Flag,
    color: 'bg-purple-600 text-white',
    tactics: [
      'फाऊल टाळा: कोणताही अनावश्यक अँकल किंवा जंप टाळा.',
      'कॅप्टन कंट्रोल: सर्व निर्णय कोर्टवरील मुख्य खेळाडूच्या इशाऱ्यावर होतील.',
      'वेळेचे गणित: स्कोअरबोर्ड आणि उर्वरित सेकंद डोळ्यासमोर ठेवा.'
    ]
  }
];

// 3. Quick Touch Action Whistle Calls for Ground Use
export const GROUND_COACH_CALLS = [
  { text: '३० सेकंद दम टिकवा!', sub: 'Clock Run', color: 'bg-blue-900 text-white' },
  { text: 'साखळी घट्ट जोडा!', sub: 'Tight Chain', color: 'bg-emerald-800 text-white' },
  { text: 'बोनस ब्लॉक करा!', sub: 'No Bonus', color: 'bg-amber-700 text-white' },
  { text: 'फास्ट ब्रेक अटॅक!', sub: 'Speed Counter', color: 'bg-rose-700 text-white' },
  { text: 'टाईम-आऊट कॉल!', sub: 'Time-out', color: 'bg-purple-800 text-white' },
  { text: 'डावा कोपरा टार्गेट करा!', sub: 'Weak Side', color: 'bg-teal-800 text-white' },
  { text: 'रिंग प्ले डिफेन्स!', sub: 'Ring Defense', color: 'bg-indigo-800 text-white' },
  { text: 'तिहेरी ब्लॉक भिंत!', sub: 'Triple Block', color: 'bg-slate-800 text-white' },
];

// 4. Realistic Real-Time Match Decisions & Crisis Solver for Every Sport
export interface TacticalDecision {
  id: string;
  sport: string;
  category: 'Defense Crisis' | 'Offense Bottleneck' | 'Clutch/Time Crisis' | 'Foul Correction' | 'Pacing & Form';
  situationTitle: string;
  situationTitleMr: string;
  rootCause: string;
  onGroundAction: string;
  playerDirectives: string[];
  coachFieldCall: string;
  impactBadge: string;
}

export const GAME_TACTICAL_DECISIONS: Record<string, TacticalDecision[]> = {
  'Kabaddi': [
    {
      id: 'kab_dec_bonus_leak',
      sport: 'Kabaddi',
      category: 'Defense Crisis',
      situationTitle: 'Opponent Raider Taking Easy Bonus Points',
      situationTitleMr: 'विरोधी रेडर वारंवार सहज बोनस गुण घेत आहे',
      rootCause: 'कॉर्नर खेळाडू खूप खोलवर उभे राहिल्याने रेडर आरामात बोनस रेषेच्या आत पाय टाकत आहे.',
      onGroundAction: 'कॉर्नर खेळाडूंनी बोनस रेषेच्या १ पाऊल पुढे येऊन साखळी बंद करावी. इन-कव्हर्सनी रेडरच्या हालचालीवर लक्ष ठेवून पाठीवर डॅश मारावा.',
      playerDirectives: [
        'दोन्ही कोपऱ्यांनी बोनस रेषेवर पाय रोवून पुढे सरकावे.',
        'रेडरने बोनसचा प्रयत्न करताच कव्हर्सनी वेगात डॅश मारावा.',
        'रेडरला मध्यरेषेकडे पळण्यासाठी जागा देऊ नका.'
      ],
      coachFieldCall: '📢 "बोनस लाईन ब्लॉक करा! कॉर्नर पुढे या, कव्हर डॅश मारा!"',
      impactBadge: 'बोनस गळती रोखा (Deny Bonus)'
    },
    {
      id: 'kab_dec_super_tackle',
      sport: 'Kabaddi',
      category: 'Defense Crisis',
      situationTitle: 'Team Down to 3 Players Under All-Out Threat',
      situationTitleMr: 'संघात फक्त ३ खेळाडू शिल्लक आहेत (सुपर टॅकल संधी)',
      rootCause: 'ऑल-आऊट होण्याचा धोका असून १ खेळाडू बाद झाल्यास संघ संकटात येईल.',
      onGroundAction: 'सुपर टॅकल फॉर्मेशन लावा. रेडरला खोलवर लॉबीच्या दिशेने आकर्षित करा आणि तिघांनी एकाच क्षणी एकत्र झेप घेऊन पकड पूर्ण करा.',
      playerDirectives: [
        'तिन्ही खेळाडूंनी एकमेकांचे हात घट्ट जोडून साखळी ठेवावी.',
        'मध्यरेषेवर घाई न करता रेडरला कॉर्नरच्या जाळ्यात ओढावे.',
        'एक खेळाडू पायावर तर दोन खेळाडू कंबरेवर झेपावतील.'
      ],
      coachFieldCall: '📢 "सुपर टॅकल सज्ज! त्याला लॉबीत ओढा, तिघांनी एकदम झेपावा!"',
      impactBadge: '+२ सुपर टॅकल गुण (Super Tackle)'
    },
    {
      id: 'kab_dec_do_or_die',
      sport: 'Kabaddi',
      category: 'Offense Bottleneck',
      situationTitle: 'Do-or-Die Raid (3rd Raid Point Pressure)',
      situationTitleMr: 'तिसरी चढाई / करो किंवा मरो रेड (Do-or-Die Raid)',
      rootCause: 'गुण न मिळाल्यास रेडर बाद होऊन प्रतिस्पर्ध्याला तांत्रिक गुण मिळेल.',
      onGroundAction: 'चपळ व किक स्पेशलिस्ट रेडर पाठवा. कॉर्नरवर फेक टच दाखवून इन-कव्हरवर अचानक रनिंग हॅन्ड टच किंवा डूबकी मारा.',
      playerDirectives: [
        'पहिल्या १५ सेकंदात प्रतिस्पर्ध्याच्या डिफेन्सची हालचाल तपासा.',
        '२२ व्या सेकंदाला वेगात दिशा बदलून आक्रमक किक किंवा टो-टच मारा.',
        'टच मिळताच क्षणाचाही विलंब न करता मध्यरेषेकडे झेप घ्या.'
      ],
      coachFieldCall: '📢 "डू ऑर डाय! खोटा टच दाखवून वेगात मध्यरेषेवर झेप घ्या!"',
      impactBadge: 'नक्की गुण मिळवा (Point Guaranteed)'
    },
    {
      id: 'kab_dec_clock_lead',
      sport: 'Kabaddi',
      category: 'Clutch/Time Crisis',
      situationTitle: 'Protecting 2-Point Lead in Last 2 Minutes',
      situationTitleMr: 'शेवटच्या २ मिनिटांत २ गुणांची आघाडी टिकवणे',
      rootCause: 'अनावश्यक घाई किंवा आगाऊ टॅकलमुळे प्रतिस्पर्ध्याला बरोबरीची संधी मिळू शकते.',
      onGroundAction: 'आपली प्रत्येक चढाई पूर्ण २८-२९ सेकंद चालवा. डिफेन्समध्ये ५ खेळाडूंची सुरक्षित साखळी ठेवा आणि कोणताही धोकादायक ॲडव्हान्स टॅकल करू नका.',
      playerDirectives: [
        'रेडरने ३० सेकंदाचा दम मोजून शेवटच्या सेकंदाला सुरक्षित परतावे.',
        'डिफेंडर्सनी मध्यरेषेपासून २ मीटर मागे राहून केवळ सुरक्षित पकड करावी.',
        'प्रतिस्पर्धी रेडरला बोनस न देता सेफ खेळावे.'
      ],
      coachFieldCall: '📢 "पूर्ण २९ सेकंद दम! कोणताही ॲडव्हान्स टॅकल करायचा नाही!"',
      impactBadge: 'वेळेचे नियंत्रण व विजय (Match Seal)'
    }
  ],
  'Volleyball': [
    {
      id: 'vb_dec_cross_spike',
      sport: 'Volleyball',
      category: 'Defense Crisis',
      situationTitle: 'Opponent Outside Spiker Hitting Powerful Cross-Court Smashes',
      situationTitleMr: 'प्रतिस्पर्धी स्पायकरचा जोरदार क्रॉस-कोर्ट स्मॅश',
      rootCause: 'सिंगल ब्लॉक कमी पडत असून चेंडू थेट डिफेन्सच्या मोकळ्या भागात आदळत आहे.',
      onGroundAction: 'डबल किंवा तिहेरी ब्लॉक लावा. लिबेरोला पोझिशन ५ वर डीप कॉर्नर कव्हर करण्यासाठी आधीच पोझिशन घ्यायला सांगा.',
      playerDirectives: [
        'मिडल ब्लॉकरने आऊटसाईड ब्लॉकरजवळ तातडीने क्लोज व्हावे.',
        'हात नेटच्या पलीकडे खाली कोनात दाबावेत.',
        'लिबेरोने ब्लॉकच्या कडेने येणारा डिग बॉल वर उडवावा.'
      ],
      coachFieldCall: '📢 "डबल ब्लॉक घट्ट लावा! लिबेरो डाव्या कोपऱ्यात सज्ज राहा!"',
      impactBadge: 'स्मॅश अडवा (Shut Down Spike)'
    },
    {
      id: 'vb_dec_poor_pass',
      sport: 'Volleyball',
      category: 'Offense Bottleneck',
      situationTitle: 'Poor Serve Receive / Passing Breakdown on First Ball',
      situationTitleMr: 'सर्व्हिस पासिंग खराब होऊन फर्स्ट बॉल चुकत आहे',
      rootCause: 'प्रतिस्पर्ध्याची फ्लोट सर्व्हिस ओळखण्यात चूक होत असल्याने सेटरला बॉल पोहोचत नाही.',
      onGroundAction: '४-खेळाडू सर्व्हिस रिसिव्ह सिस्टीम लागू करा. कमकुवत पासरला फ्रंट लाईनमध्ये लपवा आणि लिबेरोला ६०% कोर्ट कव्हर करू द्या.',
      playerDirectives: [
        'चेंडू हातावर घेण्यापूर्वी पायांची हालचाल करून चेंडूच्या मागे यावे.',
        'सेटरने अ‍ॅक्युरेट हाय-आर्च सेट देऊन आऊटसाईड स्पायकरला चेंडू द्यावा.',
        'अटॅकर्सनी रोल शॉट किंवा वाइप-ऑफ वापरून पॉईंट काढावा.'
      ],
      coachFieldCall: '📢 "लिबेरो मेन पास घेईल! सेटर हाय बॉल सेट करेल!"',
      impactBadge: 'पासिंग स्थैर्य (Stable Receive)'
    },
    {
      id: 'vb_dec_tip_dump',
      sport: 'Volleyball',
      category: 'Defense Crisis',
      situationTitle: 'Opponent Soft Tips & Dumps Landing Behind Block',
      situationTitleMr: 'ब्लॉकच्या मागे मोकळ्या जागेत ड्रॉप व टिप चेंडू पडत आहेत',
      rootCause: 'ब्लॉकर्स उडी मारल्यावर त्यांच्या मागे मोकळी जागा निर्माण होत आहे.',
      onGroundAction: 'बॅक-रो डिफेन्डरने २ मीटर पुढे येऊन ब्लॉक कव्हर करावे (Tip Shadow Defense).',
      playerDirectives: [
        'मिडल बॅक खेळाडूने स्पायकरचा हात पाहून पुढे यावे.',
        'एका हाताने किंवा अंडरआर्मने चेंडू सेटरकडे पॉप करावा.'
      ],
      coachFieldCall: '📢 "टिप कव्हरेज! मागचा खेळाडू २ पावले पुढे या!"',
      impactBadge: 'ड्रॉप बॉल सेव्ह (Tip Recovery)'
    },
    {
      id: 'vb_dec_deuce_clutch',
      sport: 'Volleyball',
      category: 'Clutch/Time Crisis',
      situationTitle: 'Deuce Situation (24-24 in Deciding Set)',
      situationTitleMr: 'निर्णायक सेटमध्ये २४-२४ ड्युस परिस्थिती',
      rootCause: 'एका चुकीने सेट गमवावा लागू शकतो.',
      onGroundAction: 'हाय-रिस्क जंप सर्व्हिस टाळा, प्रतिस्पर्ध्याच्या कमकुवत खेळाडूवर अचूक फ्लोट सर्व्हिस टाका. सेटरने मिडल अटॅकला जलद क्विक पास द्यावा.',
      playerDirectives: [
        'सर्व्हिस १००% कोर्टात इन ठेवा.',
        'स्पायकरने नेटला स्पर्श न करता ब्लॉकच्या हातांवरून चेंडू बाहेर काढावा.'
      ],
      coachFieldCall: '📢 "सेफ फ्लोट सर्व्हिस! सेंटर क्विक स्मॅश खेळा!"',
      impactBadge: 'सेट विजय (Set Point Win)'
    }
  ],
  'Kho Kho': [
    {
      id: 'kho_dec_pole_ring',
      sport: 'Kho Kho',
      category: 'Offense Bottleneck',
      situationTitle: 'Opponent Runner Playing 3-3 Pole Ring Delay',
      situationTitleMr: 'धावपटू खांबाजवळ चक्राकार फिरून वेळ काढत आहे',
      rootCause: 'धावपटू खांबाचा आधार घेऊन चेझर्सना हुलकावणी देत वेळ काढत आहे.',
      onGroundAction: 'मागून येणाऱ्या चेझरने अचानक पोल डाईव्ह मारावी, किंवा विरुद्ध दिशेला डमी खो देऊन धावपटूची दिशा बंद करावी.',
      playerDirectives: [
        'चेझरने खो देताच दुसऱ्या चेझरने खांबाची विरुद्ध बाजू ब्लॉक करावी.',
        'हवेत शरीर झोकून एका हाताने धावपटूचा पाय टॅप करावा.'
      ],
      coachFieldCall: '📢 "डमी खो द्या! पोल डाईव्ह मारून पायाला टॅप करा!"',
      impactBadge: 'गडी बाद करा (Break Ring Play)'
    },
    {
      id: 'kho_dec_defender_trapped',
      sport: 'Kho Kho',
      category: 'Defense Crisis',
      situationTitle: 'Our Defender Trapped in Single Chain Corner',
      situationTitleMr: 'आपला डिफेन्डर साखळीत कोपऱ्यात अडकला आहे',
      rootCause: 'चेझर वेगात जवळ येत असून दिशा बदलायला जागा नाही.',
      onGroundAction: 'अचानक बैठक घेऊन (Squat Feint) चेझरला पुढे जाऊ द्या आणि विरुद्ध दिशेला खांबाकडे वेगाने झेप घ्या.',
      playerDirectives: [
        'चेझरचा हात पाठीवर लागण्यापूर्वी खाली वाका.',
        'चेझर पुढे निघून जाताच वेगाने विरुद्ध बाजूला पळा.'
      ],
      coachFieldCall: '📢 "सडन स्क्वॅट मारा! मागून वळून खांबाकडे पळा!"',
      impactBadge: 'सुरक्षित सुटका (Escape Trap)'
    },
    {
      id: 'kho_dec_chaser_fatigue',
      sport: 'Kho Kho',
      category: 'Clutch/Time Crisis',
      situationTitle: 'Chasers Tiring in 2nd Half / Slow Kho Reaction',
      situationTitleMr: 'दुसऱ्या डावात चेझर्सचा वेग मंदावला आहे',
      rootCause: 'सलग पाठलाग केल्याने स्नायू थकले असून खो देण्याची गती कमी झाली आहे.',
      onGroundAction: 'राखीव वेगाच्या चेझर्सना मैदानात आणा. पोल फिरण्यासाठी फ्रेश खेळाडू तैनात करा.',
      playerDirectives: [
        'प्रत्येक खो देताना मोठ्याने ओरडून ताळमेळ ठेवा.',
        'लांब पळण्याऐवजी जवळच्या स्क्वेअरमधून खो पास करा.'
      ],
      coachFieldCall: '📢 "सब्स्टिट्यूट फ्रेश चेझर! प्रत्येक खो वर मोठ्याने आवाज द्या!"',
      impactBadge: 'गती पुनर्प्राप्ती (Regain Speed)'
    }
  ],
  'Handball': [
    {
      id: 'hb_dec_tall_shooter',
      sport: 'Handball',
      category: 'Defense Crisis',
      situationTitle: 'Opponent Tall 9m Jump Shooter Scoring Over Defense',
      situationTitleMr: 'प्रतिस्पर्ध्याचा ९-मीटर उंच शूटर लांबून गोल करत आहे',
      rootCause: '६-० डिफेन्समध्ये शूटरला सहज उडी मारून शॉट मारता येत आहे.',
      onGroundAction: '५-१ डिफेन्स प्रणाली लागू करा. एका चपळ बचावपटूला ९ मीटरवर शूटरला मॅन-टू-मॅन मार्क करायला सांगा.',
      playerDirectives: [
        'पुढील डिफेंडरने शूटरला चेंडू मिळताच त्याच्या जवळ जाऊन ब्लॉक करावा.',
        'इतर ५ खेळाडूंनी ६-मीटर लाईन घट्ट ठेवावी.'
      ],
      coachFieldCall: '📢 "५-१ डिफेन्स! ९-मीटर शूटरला पुढे येऊन ब्लॉक करा!"',
      impactBadge: 'शूटर लॉक करा (Lock Shooter)'
    },
    {
      id: 'hb_dec_suspension',
      sport: 'Handball',
      category: 'Clutch/Time Crisis',
      situationTitle: '2-Minute Player Suspension (Playing with 5 Court Players)',
      situationTitleMr: 'आपल्या खेळाडूला २ मिनिटांची निलंबन शिक्षा (१ खेळाडू कमी)',
      rootCause: '१ खेळाडू कमी असल्यामुळे डिफेन्समध्ये गॅप पडत आहे.',
      onGroundAction: 'आक्रमणात संथ पासिंग करून वेळ खा (Controlled Play). डिफेन्समध्ये कॉम्पॅक्ट ५-० भिंत उभी करा.',
      playerDirectives: [
        'चेंडू गमावू नका, खात्री असल्याशिवाय शॉट मारू नका.',
        'डिफेन्समध्ये मध्यभागी गर्दी करून विंग कट्स अडवा.'
      ],
      coachFieldCall: '📢 "संथ पासिंग! गोलकीपरच्या मदतीने डी-लाईन घट्ट ठेवा!"',
      impactBadge: 'नुकसान टाळा (Survive Penalty)'
    },
    {
      id: 'hb_dec_gk_bounce',
      sport: 'Handball',
      category: 'Foul Correction',
      situationTitle: 'Goalkeeper Conceding on Low Bounce Shots',
      situationTitleMr: 'गोलकीपर खालच्या उसळी शॉट्सवर गोल खात आहे',
      rootCause: 'पायांमधील गॅपमुळे चेंडू पायाखालून गोलमध्ये जात आहे.',
      onGroundAction: 'गोलकीपरने पाय किंचित अरुंद ठेवावेत व हात खाली ठेवून "स्टार सेव्ह" पोझिशन वापरावी.',
      playerDirectives: [
        'शूटरच्या मनगटाच्या हालचालीवर लक्ष ठेवा.',
        'शॉट सुटताच एका पायाने बाजूला झेप घेऊन लोअर कॉर्नर ब्लॉक करा.'
      ],
      coachFieldCall: '📢 "स्टार सेव्ह पोझिशन! शूटरला विंगच्या अरुंद कोनात ढकला!"',
      impactBadge: 'गोल बचाव (Goalkeeper Wall)'
    }
  ],
  'Running': [
    {
      id: 'run_dec_final_kick',
      sport: 'Running',
      category: 'Pacing & Form',
      situationTitle: 'Getting Overtaken on Final 100m Stretch',
      situationTitleMr: 'शेवटच्या १०० मीटरमध्ये प्रतिस्पर्धी खेळाडू पुढे निघत आहे',
      rootCause: 'धावपटूचा सुरुवातीला जास्त जोर गेल्यामुळे शेवटच्या टप्प्यात पाय जड झाले आहेत.',
      onGroundAction: 'हातांची ॲक्शन (Arm Swing) वेगाने वाढवा. डोके सरळ ठेवून पाठीचा कणा किंचित पुढे झुकवा (Torso Lean).',
      playerDirectives: [
        'खांदे मोकळे ठेवून कोपर ९० अंशात वेगाने मागे-पुढे हलवा.',
        'फिनिश लाईन ओलांडण्यापूर्वी छाती पुढे फेका.'
      ],
      coachFieldCall: '📢 "हात वेगात चालवा! छाती पुढे झुकवून फिनिश करा!"',
      impactBadge: 'अंतिम वेग वाढवा (Final Kick Sprint)'
    },
    {
      id: 'run_dec_baton_drop',
      sport: 'Running',
      category: 'Foul Correction',
      situationTitle: 'Relay Baton Handover Mismatch in Exchange Zone',
      situationTitleMr: '४x१०० रिलेमध्ये बॅटन एक्सचेंजमध्ये गोंधळ होत आहे',
      rootCause: 'वेगातील ताळमेळ चुकल्यामुळे एक्सचेंज झोनमध्ये धावपटू थांबत आहे.',
      onGroundAction: 'अ‍ॅक्सिलरेशन मार्क २ पावले मागे सरकवा. बॅटन देणाऱ्याने "हात!" अशी जोरात हाक मारताच हात न पाहता मागे स्थिर ठेवावा.',
      playerDirectives: [
        'हाक ऐकल्याशिवाय हात मागे करू नका.',
        'बॅटन हातात घट्ट बसल्याची खात्री झाल्यावरच वेग वाढवा.'
      ],
      coachFieldCall: '📢 "हाक ऐकताच हात मागे स्थिर! एक्सचेंज झोनच्या आत पास करा!"',
      impactBadge: 'विनाचूक रिले पास (Flawless Handover)'
    },
    {
      id: 'run_dec_pacing_burnout',
      sport: 'Running',
      category: 'Pacing & Form',
      situationTitle: 'Pacing Error / Early Burnout in 400m / 800m',
      situationTitleMr: '४००मी / ८००मी मध्ये सुरुवातीचा वेग जास्त झाल्याने दम भरणे',
      rootCause: 'पहिल्या २०० मीटरमध्ये पूर्ण स्प्रिंट केल्यामुळे लॅक्टिक ॲसिड वाढून शेवटच्या टप्प्यात पाय थांबतात.',
      onGroundAction: 'निगेटिव्ह स्प्लिट (Negative Split) रणनीती वापरा. पहिल्या २०० मी मध्ये ९०% नियंत्रित लय ठेवा आणि शेवटच्या १५० मी मध्ये १००% किक मारा.',
      playerDirectives: [
        'पहिल्या वळणावर स्वतःची गती नियंत्रित ठेवा.',
        'श्वासोच्छ्वास २ पावले आत, २ पावले बाहेर असा नियमित ठेवा.'
      ],
      coachFieldCall: '📢 "पहिल्या २०० मी मध्ये नियंत्रित राहा, शेवटच्या वळणावर किक लावा!"',
      impactBadge: 'स्टॅमिना संतुलन (Perfect Split)'
    }
  ],
  'Athletics': [
    {
      id: 'ath_dec_longjump_foul',
      sport: 'Athletics',
      category: 'Foul Correction',
      situationTitle: 'Long Jump Foul / Stepping Over Takeoff Board',
      situationTitleMr: 'लांब उडी टेकऑफ बोर्डवर वारंवार फाऊल होणे',
      rootCause: 'ॲप्रोच रनमधील पावलांचे अंतर असमान असल्यामुळे टेकऑफ पाय बोर्ड ओलांडत आहे.',
      onGroundAction: 'सुरुवातीचा रन-अप मार्क ४ इंच मागे सरकवा. शेवटच्या ३ पावलांवर डोके उंच ठेवून उसळी घेण्यावर भर द्या.',
      playerDirectives: [
        'टेकऑफ बोर्डकडे न पाहता समोर वाळूच्या खड्ड्याकडे नजर ठेवा.',
        'टेकऑफ पायाने पूर्ण ताकदीने बोर्डवर दाब देऊन हवेत झेप घ्या.'
      ],
      coachFieldCall: '📢 "रन-अप ४ इंच मागे घ्या! बोर्डवर पाय रोवून वर उडी घ्या!"',
      impactBadge: 'फाऊल टाळा व कमाल उडी (Clean Takeoff)'
    },
    {
      id: 'ath_dec_shotput_glide',
      sport: 'Athletics',
      category: 'Foul Correction',
      situationTitle: 'Shot Put Stepping Over Toe-Board / Foul Release',
      situationTitleMr: 'गोळा फेकताना रिंगच्या टो-बोर्डवर तोल जाऊन फाऊल होणे',
      rootCause: 'फेकल्यानंतर शरीराचा तोल पुढे जात असून पाय टो-बोर्ड ओलांडत आहे.',
      onGroundAction: 'ग्लाइडची पावले ४ इंच लहान करा. फेकल्या फेकल्या उजवा पाय पुढे आणून "रिव्हर्स लेग स्विच" करा आणि डोके खाली ठेवा.',
      playerDirectives: [
        'गोळा रिलीज होताच उजवा पाय वेगात पुढे आणून जमिनीवर रोवा.',
        'फेकल्यानंतर रिंगच्या आतच तोल सांभाळा.'
      ],
      coachFieldCall: '📢 "ग्लाइड लहान करा! फेकताना रिव्हर्स पाय वेगात बदला!"',
      impactBadge: 'कायदेशीर दूर फेक (Legal Distance Throw)'
    },
    {
      id: 'ath_dec_javelin_angle',
      sport: 'Athletics',
      category: 'Pacing & Form',
      situationTitle: 'Javelin Release Angle Too High / Wind Drag Loss',
      situationTitleMr: 'भालाफेक मध्ये भाल्याचा कोन चुकून अंतर कमी पडणे',
      rootCause: 'भाला खूप उंच हवेत गेल्याने वारा त्याला अडवत आहे आणि अंतर कमी पडत आहे.',
      onGroundAction: 'भाल्याची ग्रिप कानाच्या समांतर ठेवा. ३२-३४ अंश कोनात सरळ रेषेत खांद्याचा जोर लावून फेका.',
      playerDirectives: [
        'क्रॉस-ओव्हर पावलांवर शरीर मागे धनुष्यासारखे ताणा.',
        'डोक्याच्या वरून ३४ अंशात थेट पुढे भाला फेका.'
      ],
      coachFieldCall: '📢 "भाला कानाच्या समांतर ओढा! ३४ अंशात थेट पुढे फेका!"',
      impactBadge: 'कमाल भालाफेक अंतर (Max Javelin Distance)'
    }
  ],
  'Yoga': [
    {
      id: 'yo_dec_balance_loss',
      sport: 'Yoga',
      category: 'Pacing & Form',
      situationTitle: 'Loss of Balance in Standing Asanas (Vrikshasana/Tadasana)',
      situationTitleMr: 'एका पायावरील आसनात तोल जाणे व डगमगणे',
      rootCause: 'नजर हलल्यामुळे आणि पोटाचे कोर स्नायू सैल असल्यामुळे विद्यार्थी डगमगत आहेत.',
      onGroundAction: 'समोर भिंतीवर किंवा जमिनीवर एका स्थिर बिंदूवर नजर खिळवा (दृष्टी). पोटाचे स्नायू आत खेचून श्वास संथ ठेवा.',
      playerDirectives: [
        'डोळ्यांची नजर समोर एका बिंदूवर स्थिर ठेवा.',
        'तळपाय जमिनीवर घट्ट रोवून शरीराचा कणा सरळ ताणा.'
      ],
      coachFieldCall: '📢 "समोर एका बिंदूवर नजर स्थिर ठेवा! श्वास संथ घ्या!"',
      impactBadge: 'आसन स्थिरता (Stillness & Focus)'
    }
  ],
  'PT Mass': [
    {
      id: 'pt_dec_marching_sync',
      sport: 'PT Mass',
      category: 'Pacing & Form',
      situationTitle: 'Squad Marching Rhythm Breakdown with Drum Beat',
      situationTitleMr: 'सामूहिक कवायतीत संचलनाचा ठेका चुकणे',
      rootCause: 'काही विद्यार्थ्यांचा डावा-उजवा पाय ढोलाच्या तालावर पडत नाही.',
      onGroundAction: 'प्रशिक्षकाने तोंडाने "डावा-उजवा-डावा" अशी मोठ्या आवाजात मोजणी सुरू करावी. डाव्या पायावर जोरात आपट देण्याचा इशारा करावा.',
      playerDirectives: [
        'ढोलाच्या आवाजावर लक्ष ठेवून एकसाथ पाय जमिनीवर आपटा.',
        'हात खांद्याच्या समांतर रेषेत पुढे-मागे झोका.'
      ],
      coachFieldCall: '📢 "डावा पाय जोर द्या! १-२-१ चा ठेका धरा!"',
      impactBadge: 'एकसंघ संचलन (Squad Synchronization)'
    }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [selectedFormationId, setSelectedFormationId] = useState<string>("");
  const [activeTabMode, setActiveTabMode] = useState<'board' | 'decisions' | 'situations' | 'builder'>('board');
  const [decisionFilter, setDecisionFilter] = useState<string>("All");
  const [decisionSearch, setDecisionSearch] = useState<string>("");
  
  // Custom Plan Builder
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [customPlanTitle, setCustomPlanTitle] = useState("");
  const [customPlanCategory, setCustomPlanCategory] = useState("Offense");
  const [customPlanInstructions, setCustomPlanInstructions] = useState("");
  const [savedCustomPlans, setSavedCustomPlans] = useState<any[]>([]);

  useEffect(() => {
    if (preselectedSport) setActiveSport(preselectedSport);
  }, [preselectedSport]);

  const formationsList = useMemo(() => {
    return REALTIME_FORMATIONS[activeSport] || REALTIME_FORMATIONS['Kabaddi'] || [];
  }, [activeSport]);

  useEffect(() => {
    if (formationsList.length > 0) {
      setSelectedFormationId(formationsList[0].id);
    }
  }, [formationsList]);

  const activeFormation = useMemo(() => {
    return formationsList.find(f => f.id === selectedFormationId) || formationsList[0];
  }, [formationsList, selectedFormationId]);

  const tacticalDecisionsList = useMemo(() => {
    const list = GAME_TACTICAL_DECISIONS[activeSport] || GAME_TACTICAL_DECISIONS['Kabaddi'] || [];
    return list.filter(d => {
      const matchesFilter = decisionFilter === 'All' || d.category === decisionFilter;
      const matchesSearch = !decisionSearch || 
        d.situationTitle.toLowerCase().includes(decisionSearch.toLowerCase()) ||
        d.situationTitleMr.includes(decisionSearch) ||
        d.onGroundAction.includes(decisionSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeSport, decisionFilter, decisionSearch]);


  const handleSaveCustomPlan = () => {
    if (!customPlanTitle.trim() || !customPlanInstructions.trim()) {
      toast({ title: "माहिती अपूर्ण आहे", description: "कृपया रणनीतीचे नाव आणि सूचना टाका.", variant: "destructive" });
      return;
    }

    const newPlan = {
      id: `strat_${Date.now()}`,
      title: customPlanTitle.trim(),
      category: customPlanCategory,
      instructions: customPlanInstructions.trim(),
      sport: activeSport,
      createdAt: format(new Date(), 'dd MMM yyyy, hh:mm a')
    };

    setSavedCustomPlans([newPlan, ...savedCustomPlans]);
    setCustomPlanTitle("");
    setCustomPlanInstructions("");
    setIsBuilderOpen(false);

    if (store.addTacticalEvent) {
      store.addTacticalEvent({
        type: 'strategy',
        title: newPlan.title,
        notes: newPlan.instructions,
        sport: activeSport,
        timestamp: new Date().toISOString()
      });
    }

    toast({
      title: "🎯 रणनीती जतन झाली!",
      description: `"${newPlan.title}" मैदानावरील रणनीती संग्रहात सेव्ह झाली आहे.`,
      className: "bg-emerald-600 text-white font-bold"
    });
  };

  const handlePrintPlaybook = () => {
    const schoolName = getOfficialSchoolName(store);
    const signatureBlockHtml = getPrintSignatureBlockHtml(store);

    const printContent = `
      <html>
        <head>
          <title>Institutional Tactical Playbook - ${activeSport}</title>
          <style>
            @media print { 
              @page { size: A4 portrait; margin: 1cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; line-height: 1.5; color: #111; font-size: 12px; }
            .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { color: #1e3a8a; text-transform: uppercase; margin: 0; font-size: 18px; }
            h2 { color: #d97706; text-transform: uppercase; margin: 5px 0 0 0; font-size: 14px; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; }
            .strategy-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 10px; background: #f8fafc; }
            .card-title { font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; }
            ul { margin: 6px 0; padding-left: 20px; }
            li { margin-bottom: 4px; font-size: 11px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट काढा (Print)</button>
          </div>
          <div class="header">
            <h1>${schoolName}</h1>
            <h2>${activeSport} - ऑन-ग्राउंड अधिकृत खेळ रणनीती व प्लेबूक (Tactical Playbook)</h2>
          </div>
          
          <div class="section-title">१. अधिकृत मैदानावरील रणनीती (Standard Formations)</div>
          ${formationsList.map(f => `
            <div class="strategy-card">
              <div class="card-title">${f.nameMr || f.name} (${f.type})</div>
              <p><strong>वर्णन:</strong> ${f.desc}</p>
              <p><strong>वापरण्याची परिस्थिती:</strong> ${f.situation}</p>
              <p><strong>प्रशिक्षकाचे ऑन-ग्राउंड आदेश:</strong></p>
              <ul>
                ${f.coachInstructions.map(inst => `<li>${inst}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          <div class="section-title">२. सामना संकट निवारण व थेट निर्णय (Match Crisis & Tactical Decisions)</div>
          ${(GAME_TACTICAL_DECISIONS[activeSport] || []).map(d => `
            <div class="strategy-card" style="border-left: 4px solid #e11d48;">
              <div class="card-title" style="color: #be123c;">${d.situationTitleMr} (${d.category})</div>
              <p><strong>⚠️ मूळ अडचण:</strong> ${d.rootCause}</p>
              <p><strong>🛡️ थेट मैदानावरील उपाय:</strong> ${d.onGroundAction}</p>
              <p><strong>📢 प्रशिक्षक आज्ञा:</strong> ${d.coachFieldCall}</p>
              <ul>
                ${d.playerDirectives.map(dir => `<li>${dir}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          <div class="section-title">३. सामना परिस्थितीनुसार त्वरित रणनीती (Match Situations)</div>
          ${REALTIME_MATCH_SITUATIONS.map(s => `
            <div class="strategy-card">
              <div class="card-title">${s.title}</div>
              <p style="font-size: 10px; color: #64748b;">${s.subtitle}</p>
              <ul>
                ${s.tactics.map(t => `<li>${t}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          ${savedCustomPlans.length > 0 ? `
            <div class="section-title">४. प्रशिक्षकांनी तयार केलेल्या विशेष रणनीती (Custom Tactics)</div>
            ${savedCustomPlans.map(cp => `
              <div class="strategy-card">
                <div class="card-title">${cp.title} (${cp.category})</div>
                <p>${cp.instructions}</p>
              </div>
            `).join('')}
          ` : ''}

          ${signatureBlockHtml}
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-primary to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Layout className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                  {activeSport} - ऑन-ग्राउंड थेट रणनीती प्लेबूक
                </h2>
                <Badge className="bg-amber-500 text-blue-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                  Live Ground Deck
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Real-Time Interactive Tactics, Match Situations & Ground Formations
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <Button
            variant={activeTabMode === 'board' ? 'default' : 'ghost'}
            onClick={() => setActiveTabMode('board')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              activeTabMode === 'board' ? "bg-amber-500 hover:bg-amber-600 text-blue-950 shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <Gamepad2 className="w-4 h-4 mr-2" /> थेट मैदान रणनीती फलक (Court Board)
          </Button>
          <Button
            variant={activeTabMode === 'decisions' ? 'default' : 'ghost'}
            onClick={() => setActiveTabMode('decisions')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              activeTabMode === 'decisions' ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <ShieldHalf className="w-4 h-4 mr-2" /> 🚨 सामना निर्णय व उपाय (Crisis Solver)
          </Button>
          <Button
            variant={activeTabMode === 'situations' ? 'default' : 'ghost'}
            onClick={() => setActiveTabMode('situations')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              activeTabMode === 'situations' ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <Zap className="w-4 h-4 mr-2" /> सामना परिस्थिती (Match Cues)
          </Button>
          <Button
            variant={activeTabMode === 'builder' ? 'default' : 'ghost'}
            onClick={() => setActiveTabMode('builder')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              activeTabMode === 'builder' ? "bg-white text-primary shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <Plus className="w-4 h-4 mr-2" /> नवीन रणनीती बनवा (Custom Builder)
          </Button>
        </div>
      </div>

      {/* Quick Coach Voice Whistle Strip for Instant On-Ground Action */}
      <div className="bg-white p-4 rounded-3xl border-2 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-500" /> प्रशिक्षक थेट मैदानावरील आज्ञा (Coach Quick Action Whistles):
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Tap to highlight on ground</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {GROUND_COACH_CALLS.map((call, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                toast({
                  title: `📢 ${call.text}`,
                  description: `आज्ञा: ${call.sub} - खेळाडूंना तात्काळ सूचना दिली.`,
                  className: "bg-primary text-white font-bold"
                });
              }}
              className={cn(
                "p-2.5 rounded-xl font-black text-center transition-all active:scale-90 shadow-sm border text-xs flex flex-col items-center justify-center",
                call.color
              )}
            >
              <span className="text-[11px] leading-tight">{call.text}</span>
              <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">{call.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MODE 1: INTERACTIVE TACTICAL COURT BOARD */}
      {activeTabMode === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Ground Court Visualizer */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-slate-950 text-white space-y-4 relative overflow-hidden">
              
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-0.5">
                    {activeFormation ? activeFormation.type : 'Formation'}
                  </Badge>
                  <h3 className="text-xl font-black uppercase text-amber-400 mt-1">
                    {activeFormation ? (activeFormation.nameMr || activeFormation.name) : 'मैदान रचना'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    🟢 Home Defenders &bull; 🔴 Opponent
                  </span>
                </div>
              </div>

              {/* DYNAMIC SVG TACTICAL COURT */}
              <div className="w-full aspect-[16/10] bg-emerald-900/90 rounded-2xl border-4 border-white/40 relative overflow-hidden shadow-inner flex items-center justify-center select-none">
                
                {/* Court Markings based on sport */}
                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                  {/* Grid Lines */}
                  <rect x="0" y="0" width="100" height="100" fill="#064e3b" />
                  
                  {/* Outer Boundary */}
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                  
                  {/* Midline */}
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="2" strokeDasharray="1 0" />
                  <circle cx="50" cy="50" r="8" fill="none" stroke="#f59e0b" strokeWidth="1" />

                  {/* Sport Specific Ground Lines */}
                  {activeSport === 'Kabaddi' && (
                    <>
                      {/* Baulk Lines */}
                      <line x1="5" y1="32" x2="95" y2="32" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                      <line x1="5" y1="68" x2="95" y2="68" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                      {/* Bonus Lines */}
                      <line x1="5" y1="24" x2="95" y2="24" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" />
                      <line x1="5" y1="76" x2="95" y2="76" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" />
                      {/* Lobbies */}
                      <line x1="12" y1="5" x2="12" y2="95" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                      <line x1="88" y1="5" x2="88" y2="95" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    </>
                  )}

                  {activeSport === 'Volleyball' && (
                    <>
                      {/* 3-meter Attack Lines */}
                      <line x1="5" y1="35" x2="95" y2="35" stroke="#facc15" strokeWidth="1.5" />
                      <line x1="5" y1="65" x2="95" y2="65" stroke="#facc15" strokeWidth="1.5" />
                    </>
                  )}

                  {activeSport === 'Handball' && (
                    <>
                      {/* 6-meter D-Zone Arc */}
                      <path d="M 20 5 A 30 30 0 0 0 80 5" fill="none" stroke="#facc15" strokeWidth="1.5" />
                      <path d="M 20 95 A 30 30 0 0 1 80 95" fill="none" stroke="#facc15" strokeWidth="1.5" />
                    </>
                  )}

                  {/* Draw Tactical Movement Arrows */}
                  {activeFormation?.arrows?.map((arrow, idx) => (
                    <g key={idx}>
                      <defs>
                        <marker id={`arrow-${idx}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill={arrow.color} />
                        </marker>
                      </defs>
                      <line
                        x1={arrow.from[0]}
                        y1={arrow.from[1]}
                        x2={arrow.to[0]}
                        y2={arrow.to[1]}
                        stroke={arrow.color}
                        strokeWidth="1.8"
                        strokeDasharray="2 2"
                        markerEnd={`url(#arrow-${idx})`}
                      />
                    </g>
                  ))}

                  {/* Render Players on Ground */}
                  {activeFormation?.players?.map((p) => {
                    const isHome = p.team === 'home';
                    return (
                      <g key={p.id} className="cursor-pointer transition-transform hover:scale-110">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4.5"
                          fill={isHome ? "#10b981" : "#ef4444"}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                        <text
                          x={p.x}
                          y={p.y + 1.2}
                          fontSize="3"
                          fontWeight="900"
                          fill="#ffffff"
                          textAnchor="middle"
                        >
                          {p.id}
                        </text>
                        <text
                          x={p.x}
                          y={p.y + 8}
                          fontSize="2.4"
                          fontWeight="bold"
                          fill="#f8fafc"
                          textAnchor="middle"
                        >
                          {p.roleMr || p.role}
                        </text>
                      </g>
                    );
                  })}
                </svg>

              </div>

              {/* Formation Selector Bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  मैदान रणनीती निवडा (Select Ground Formation):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {formationsList.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFormationId(f.id)}
                      className={cn(
                        "p-3 rounded-2xl text-left border-2 transition-all active:scale-95 text-xs font-bold",
                        selectedFormationId === f.id
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black"
                          : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase opacity-80">{f.type}</span>
                        <Zap className="w-3 h-3 text-amber-400" />
                      </div>
                      <p className="text-xs uppercase mt-0.5 truncate">{f.nameMr || f.name}</p>
                    </button>
                  ))}
                </div>
              </div>

            </Card>
          </div>

          {/* Right Column: Coach Action Guide & Match Situation Blueprint */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Formation Strategy Card */}
            {activeFormation && (
              <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-black text-primary uppercase">
                      {activeFormation.nameMr || activeFormation.name}
                    </h4>
                  </div>
                  <Badge className="bg-primary text-white font-black text-[9px] uppercase">
                    {activeFormation.type}
                  </Badge>
                </div>

                <div className="bg-muted/20 p-4 rounded-2xl border space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    रणनीतीचे उद्दिष्ट (Objective):
                  </span>
                  <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                    {activeFormation.desc}
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> केव्हा वापरावे (When to Deploy):
                  </span>
                  <p className="text-xs font-bold text-amber-900">
                    {activeFormation.situation}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" /> मैदानावरील प्रत्यक्ष सूचना (Coach Field Directives):
                  </span>
                  <div className="space-y-2">
                    {activeFormation.coachInstructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 font-black">
                          {i + 1}
                        </span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handlePrintPlaybook}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> प्लेबूक शीट प्रिंट करा (Print Playbook)
                </Button>
              </Card>
            )}

          </div>

        </div>
      )}

      {/* 3. MODE 2: REAL-TIME REALISTIC MATCH DECISION MATRIX & CRISIS SOLVER */}
      {activeTabMode === 'decisions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                  {activeSport} - सामना संकट निवारण व थेट निर्णय (Match Crisis Solver)
                </h3>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                मैदानावर प्रत्यक्ष सामना चालू असताना उद्भवणाऱ्या अडचणी, फाऊल्स आणि तातडीच्या उपाययोजना.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Input
                  value={decisionSearch}
                  onChange={(e) => setDecisionSearch(e.target.value)}
                  placeholder="अडचण किंवा रणनीती शोधा..."
                  className="h-11 rounded-xl text-xs pl-3 border-2 font-bold"
                />
              </div>
              <Button onClick={handlePrintPlaybook} className="bg-primary text-white h-11 px-4 rounded-xl font-black uppercase text-xs shadow-md">
                <Printer className="w-4 h-4 mr-2" /> प्रिंट
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Defense Crisis', 'Offense Bottleneck', 'Clutch/Time Crisis', 'Foul Correction', 'Pacing & Form'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDecisionFilter(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl font-black text-xs uppercase transition-all active:scale-95 border",
                  decisionFilter === cat
                    ? "bg-rose-600 text-white border-rose-700 shadow-md scale-105"
                    : "bg-white text-primary border-primary/20 hover:bg-muted"
                )}
              >
                {cat === 'All' ? 'सर्व निर्णय (All)' : cat}
              </button>
            ))}
          </div>

          {/* Decisions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tacticalDecisionsList.length === 0 ? (
              <div className="col-span-2 py-20 text-center opacity-30 border-4 border-dashed rounded-[2.5rem] bg-white">
                <ShieldHalf className="w-16 h-16 mx-auto mb-3" />
                <p className="font-black uppercase tracking-widest text-sm">कोणताही निर्णय जुळत नाही.</p>
              </div>
            ) : (
              tacticalDecisionsList.map((dec) => (
                <Card key={dec.id} className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-5 hover:border-rose-400 transition-all group relative overflow-hidden">
                  
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-3 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-rose-100 text-rose-800 border border-rose-300 font-black text-[9px] uppercase px-2.5">
                          {dec.category}
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[9px] uppercase px-2.5">
                          {dec.impactBadge}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase leading-tight group-hover:text-rose-600 transition-colors">
                        {dec.situationTitleMr}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{dec.situationTitle}</p>
                    </div>
                  </div>

                  {/* Problem & Root Cause Box */}
                  <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-1.5">
                      ⚠️ समस्येचे मूळ कारण (Root Cause):
                    </span>
                    <p className="text-xs font-bold text-rose-950 leading-relaxed">
                      {dec.rootCause}
                    </p>
                  </div>

                  {/* Tactical Solution Box */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                      🛡️ थेट मैदानावरील उपाय (Tactical Fix):
                    </span>
                    <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                      {dec.onGroundAction}
                    </p>
                  </div>

                  {/* Player Directives */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                      खेळाडूंना ३ टप्प्यांत थेट आज्ञा (Step-by-Step Directives):
                    </span>
                    <div className="space-y-1.5">
                      {dec.playerDirectives.map((dir, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] shrink-0 font-black">
                            {i + 1}
                          </span>
                          <span>{dir}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coach Verbal Command / Whistle Trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: dec.coachFieldCall,
                          description: `${dec.situationTitleMr} साठी खेळाडूंना तत्काळ आदेश दिला.`,
                          className: "bg-rose-600 text-white font-bold"
                        });
                      }}
                      className="w-full p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-amber-400 border-2 border-amber-500/40 text-left font-black text-xs flex items-center justify-between hover:scale-[1.01] active:scale-95 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{dec.coachFieldCall}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg">
                        Tap Callout
                      </span>
                    </button>
                  </div>

                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. MODE 3: REAL-TIME MATCH SITUATIONS */}
      {activeTabMode === 'situations' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                सामना परिस्थितीनुसार थेट रणनीती (Real-Time Match Situations)
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                खेळ चालू असताना स्कोअर आणि वेळेनुसार खेळाडूंना द्यायच्या तात्काळ चाली.
              </p>
            </div>
            <Button onClick={handlePrintPlaybook} className="bg-primary text-white h-11 px-4 rounded-xl font-black uppercase text-xs shadow-md">
              <Printer className="w-4 h-4 mr-2" /> प्रिंट
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REALTIME_MATCH_SITUATIONS.map((sit) => {
              const IconComp = sit.icon;
              return (
                <Card key={sit.id} className="border-2 rounded-[2.5rem] p-6 shadow-lg bg-white space-y-4 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm", sit.color)}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-primary uppercase text-base">{sit.title}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground">{sit.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sit.tactics.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border text-xs font-bold text-foreground leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODE 3: CUSTOM ON-GROUND STRATEGY BUILDER */}
      {activeTabMode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-6">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-primary uppercase">नवीन रणनीती तयार करा</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Create Custom Match Tactic</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  १. रणनीतीचे शीर्षक (Strategy Title)
                </label>
                <Input
                  value={customPlanTitle}
                  onChange={(e) => setCustomPlanTitle(e.target.value)}
                  placeholder="उदा. ४-२ कॉर्नर ट्रॅप किंवा ३-मीटर क्विक स्पाइक"
                  className="h-12 border-2 rounded-xl font-bold bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  २. प्रकार (Category)
                </label>
                <Select value={customPlanCategory} onValueChange={setCustomPlanCategory}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-muted/20">
                    <SelectValue placeholder="प्रकार निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offense">आक्रमक (Offense / Raid / Spike)</SelectItem>
                    <SelectItem value="Defense">बचाव (Defense / Tackle / Block)</SelectItem>
                    <SelectItem value="Transition">फास्ट ट्रान्सिशन (Fast Break)</SelectItem>
                    <SelectItem value="Special">विशेष परिस्थिती (Clutch / Super Tackle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  ३. मैदानावरील पायऱ्या व सूचना (Instructions)
                </label>
                <Textarea
                  value={customPlanInstructions}
                  onChange={(e) => setCustomPlanInstructions(e.target.value)}
                  placeholder="१. खेळाडूंची रचना...\n२. चेंडू किंवा रेडरच्या हालचालीनुसार कृती...\n३. अंतिम टच आणि सेफ रिटर्न..."
                  className="min-h-[140px] border-2 rounded-xl font-bold p-3 text-xs"
                />
              </div>

              <Button
                onClick={handleSaveCustomPlan}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg active-scale"
              >
                <Save className="w-4 h-4 mr-2" /> रणनीती जतन करा (Save to Playbook)
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-xl font-black text-primary uppercase">
                जतन केलेल्या विशेष रणनीती ({savedCustomPlans.length})
              </h4>
              <Badge variant="secondary" className="font-black text-[9px] uppercase">
                Custom Locker
              </Badge>
            </div>

            <div className="space-y-4">
              {savedCustomPlans.length === 0 ? (
                <div className="py-24 text-center opacity-30 border-4 border-dashed rounded-[2.5rem] bg-white">
                  <Layout className="w-14 h-14 mx-auto mb-3" />
                  <p className="font-black uppercase tracking-widest text-xs">कोणतीही कस्टम रणनीती सेव्ह केलेली नाही.</p>
                </div>
              ) : (
                savedCustomPlans.map((plan) => (
                  <Card key={plan.id} className="border-2 rounded-[2rem] p-6 shadow-sm bg-white hover:border-primary/40 transition-all space-y-3 relative group">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="bg-primary/10 text-primary font-black text-[9px] uppercase mb-1">
                          {plan.category} &bull; {plan.sport}
                        </Badge>
                        <h4 className="text-base font-black text-primary uppercase">{plan.title}</h4>
                        <span className="text-[9px] text-muted-foreground font-bold">{plan.createdAt}</span>
                      </div>
                      <button
                        onClick={() => setSavedCustomPlans(savedCustomPlans.filter(p => p.id !== plan.id))}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-muted/20 p-3.5 rounded-xl border text-xs font-bold text-foreground/80 whitespace-pre-wrap">
                      {plan.instructions}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

