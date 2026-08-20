"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  BrainCircuit, 
  Save, 
  History, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Gauge,
  Zap,
  Target,
  Sparkles,
  Trophy,
  Share2,
  Printer,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, transliterateEnglishToMarathi, shareToWhatsApp, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { format } from 'date-fns';
import type { TacticalEvent } from '@/lib/types';

// ==========================================
// 1. REALISTIC MATCH SITUATIONS & PRO TACTICAL SOLUTIONS
// ==========================================
export interface MatchScenario {
  id: string;
  title: string;
  titleMr: string;
  category: 'Offense' | 'Defense' | 'Crisis / Crunch' | 'Pacing & Transition';
  proSolution: string;
  commonMistake: string;
  recommendedMarks: number;
  reactionWindow: string;
}

export const GAME_MATCH_SCENARIOS: Record<string, MatchScenario[]> = {
  'Kabaddi': [
    {
      id: 'kab_do_or_die',
      title: 'Do-or-Die Raid (करा किंवा मरा चढाई)',
      titleMr: 'डू ऑर डाय चढाई (Do or Die Raid)',
      category: 'Crisis / Crunch',
      proSolution: '२५ सेकंद शांतपणे हालचाल करून कॉर्नर डिफेंडरला खेचणे, शेवटच्या ५ सेकंदात बोनसचा खोटा प्रयत्न करून हँड टच किंवा टो टच मारणे.',
      commonMistake: 'सुरुवातीलाच घाबरून विनाकारण आत घुसणे किंवा शेवटच्या सेकंदापर्यंत निर्णय न घेणे.',
      recommendedMarks: 9,
      reactionWindow: '०.५ - १ सेकंद'
    },
    {
      id: 'kab_super_tackle',
      title: 'Super Tackle Opportunity (३ किंवा कमी डिफेंडर्स)',
      titleMr: 'सुपर टॅकल प्रसंग (Super Tackle - 2 Points)',
      category: 'Defense',
      proSolution: 'रेडरला बोनस रेषेपर्यंत मोकळे येऊ देणे आणि तो वळताच दोन्ही कॉर्नरने एकाच वेळी साखळीने (Chain/Dash) बाहेर ढकलणे.',
      commonMistake: 'एकाच डिफेंडरने एकट्याने पुढे जाऊन ॲडव्हान्स टॅकल करणे.',
      recommendedMarks: 10,
      reactionWindow: '०.३ सेकंद'
    },
    {
      id: 'kab_last_minute_lead',
      title: 'Last 1 Min Lead Preservation (१ गुणाची आघाडी टिकवणे)',
      titleMr: 'शेवटच्या मिनिटात १ गुणाची आघाडी सांभाळणे',
      category: 'Offense',
      proSolution: 'पूर्ण ३० सेकंद बाल्क लाईनवर खेळणे, सुरक्षितपणे रिक्त चढाई (Empty Raid) करणे आणि प्रतिस्पर्ध्याला घाई करायला भाग पाडणे.',
      commonMistake: 'लीड असताना विनाकारण खोलवर जाऊन स्वतः आऊट होऊन प्रतिस्पर्ध्याला गुण देणे.',
      recommendedMarks: 8,
      reactionWindow: '२-३ सेकंद'
    },
    {
      id: 'kab_escape_dash',
      title: 'Escape Against Aggressive Cover Dash (डॅश सुटका)',
      titleMr: 'कव्हर डॅश समोर डुबकी / जंप मारणे',
      category: 'Offense',
      proSolution: 'कव्हर डॅश मारण्यासाठी वेगाने येताच शरीराचा तोल खाली करून डुबकी (Dubki) मारणे किंवा लॉबीकडे न जाता मधून सुटणे.',
      commonMistake: 'डिफेंडरच्या अंगावर जाणे किंवा लॉबीमध्ये ढकलले जाणे.',
      recommendedMarks: 9,
      reactionWindow: '०.२ सेकंद'
    },
    {
      id: 'kab_bonus_6_defenders',
      title: 'Bonus Line Execution with 6 Defenders',
      titleMr: '६ डिफेंडर्स असताना बोनस चोरणे',
      category: 'Offense',
      proSolution: 'कॉर्नरला दुसऱ्या बाजूला खेचून त्याच्या पायाच्या हालचालीवर लक्ष ठेवणे आणि क्षणार्धात मागचा पाय हवेत ठेवून बोनस रेषा ओलांडणे.',
      commonMistake: 'मागचा पाय हवेत न उचलणे (कॅन्ट तोडणे किंवा बोनस न मिळणे).',
      recommendedMarks: 8,
      reactionWindow: '०.५ सेकंद'
    },
    {
      id: 'kab_ankle_hold_timing',
      title: 'Ankle Hold on Retracting Raider',
      titleMr: 'रेडर परत फिरताना घोटा पकड (Ankle Hold)',
      category: 'Defense',
      proSolution: 'रेडरने आपला पाय पुढे टाकून वजन मागच्या पायावर घेताच पुढचा घोटा दोन्ही हातांनी घट्ट कवटाळणे.',
      commonMistake: 'रेडरचे दोन्ही पाय स्थिर असताना पकडण्याचा प्रयत्न करणे.',
      recommendedMarks: 9,
      reactionWindow: '०.४ सेकंद'
    }
  ],

  'Volleyball': [
    {
      id: 'vol_crunch_serve',
      title: 'Match Point Float / Jump Serve',
      titleMr: 'मॅच पॉईंट सर्व्हिस निर्णय (Crunch Serve)',
      category: 'Crisis / Crunch',
      proSolution: 'प्रतिस्पर्ध्याच्या सर्वात कमकुवत पासरवर (Weaker Passer) खोलवर फ्लोट सर्व्हिस करणे जेणेकरून अटॅक व्यवस्थित होणार नाही.',
      commonMistake: 'अति ताकदीने मारून सर्व्हिस नेटमध्ये किंवा आऊट घालवणे.',
      recommendedMarks: 9,
      reactionWindow: '१-२ सेकंद'
    },
    {
      id: 'vol_setter_dump',
      title: 'Setter Dump vs 3-Spiker Set',
      titleMr: 'सेटरचा स्वतः बॉल ड्रॉप करण्याचा निर्णय (Setter Dump)',
      category: 'Offense',
      proSolution: 'मध्यम ब्लॉकर स्पायकरकडे झुकताच अचानक डाव्या हाताने मोकळ्या जागेत (Hole in Court) बॉल हळूच टॅप करणे.',
      commonMistake: 'ब्लॉकर जागेवर असतानाच सोपा डम्प देणे जो सहज उचलला जातो.',
      recommendedMarks: 9,
      reactionWindow: '०.३ सेकंद'
    },
    {
      id: 'vol_triple_block_line',
      title: 'Spiking Against Triple Block (तिहेरी ब्लॉक)',
      titleMr: 'मोठ्या तिहेरी ब्लॉक समोर स्पाईक की रोल शॉट',
      category: 'Offense',
      proSolution: 'ब्लॉकच्या बोटांवर चेंडू मारून वाईप-आउट (Wipe-off/Tool) करणे किंवा ब्लॉकच्या मागे खोलवर टॅप टाकणे.',
      commonMistake: 'ब्लॉकच्या अगदी छातीवर थेट जोरात बॉल मारून ब्लॉक होणे.',
      recommendedMarks: 9,
      reactionWindow: '०.२ सेकंद'
    },
    {
      id: 'vol_libero_cover',
      title: 'Libero Tip / Drop Coverage',
      titleMr: 'लिबेरोचे ड्रॉप व टिप बॉल कव्हर करणे',
      category: 'Defense',
      proSolution: 'ब्लॉकरच्या अगदी मागे १.५ मीटर अंतरावर लो-स्टॅन्समध्ये राहून ड्रॉप बॉल दोन्ही हातांनी सुरक्षित वर काढणे.',
      commonMistake: 'मागे उभे राहून चेंडू जमिनीवर पडण्याची वाट पाहणे.',
      recommendedMarks: 8,
      reactionWindow: '०.४ सेकंद'
    }
  ],

  'Kho Kho': [
    {
      id: 'kho_pole_dive',
      title: 'Pole Dive Decision vs Turning Chase',
      titleMr: 'पोल डायव्ह मारणे की टर्निंग घेणे',
      category: 'Crisis / Crunch',
      proSolution: 'धावपटू पोलच्या जवळ येऊन गती कमी करत असल्याचे दिसताच पूर्ण शरीराची डायव्ह मारून हात लांबवणे.',
      commonMistake: 'खूप लांबून डायव्ह मारून गुडघ्यावर आदळणे किंवा पोल सुटणे.',
      recommendedMarks: 10,
      reactionWindow: '०.२ सेकंद'
    },
    {
      id: 'kho_direction_fake',
      title: 'Direction Change Fake (दिशेची फसवणूक)',
      titleMr: 'दिशेची फसवणूक करून पाठ दाखवणे (Fake Movement)',
      category: 'Offense',
      proSolution: 'चेसर्सच्या डोळ्यांत पाहून एका दिशेने खांदा झुकवणे आणि पुढचा खो मिळताच उलट दिशेला वेगाने धावणे.',
      commonMistake: 'हात न टेकवता वळणे आणि फॉऊल (Early Kho/Foul) होणे.',
      recommendedMarks: 8,
      reactionWindow: '०.५ सेकंद'
    },
    {
      id: 'kho_late_entry_batch3',
      title: 'Batch 3 Entry Timing (बॅच ३ चा प्रवेश)',
      titleMr: 'बॅच ३ च्या धावपटूंचा मैदानात योग्य वेळी प्रवेश',
      category: 'Defense',
      proSolution: 'बॅच २ चा शेवटचा खेळाडू आऊट होण्याआधीच विरोधी चेसर्स पोलकडे असताना सुरक्षित कोपऱ्यातून प्रवेश करणे.',
      commonMistake: 'उशिरा प्रवेश करून चेसरच्या हातात थेट सापडणे.',
      recommendedMarks: 9,
      reactionWindow: '१ सेकंद'
    },
    {
      id: 'kho_ring_play_middle',
      title: 'Middle Square Ring Play (मध्यभागी रिंग प्ले)',
      titleMr: 'मध्य चौकोनात गोलाकार रिंग मारून वेळ काढणे',
      category: 'Defense',
      proSolution: 'चेसर्सच्या खो देण्याच्या गतीवर नजर ठेवून ३ खो पर्यंत सुरक्षित अंतरावर गोलाकार फिरणे.',
      commonMistake: 'एकाच जागी थांबून राहणे आणि जवळचा खो येणे.',
      recommendedMarks: 8,
      reactionWindow: '०.३ सेकंद'
    }
  ],

  'Handball': [
    {
      id: 'hb_fast_break_shot',
      title: 'Fast Break 1-on-1 vs Goalkeeper',
      titleMr: 'फास्ट ब्रेकवर १-ऑन-१ गोलकीपर समोर निर्णय',
      category: 'Offense',
      proSolution: 'गोलकीपरच्या शरीराची हालचाल (Drop or Stand) वाचून शेवटच्या क्षणी बाऊन्स शॉट किंवा टॉप कॉर्नर मारणे.',
      commonMistake: 'गोलकीपरच्या थेट अंगावर किंवा छातीवर चेंडू मारणे.',
      recommendedMarks: 9,
      reactionWindow: '०.३ सेकंद'
    },
    {
      id: 'hb_jump_vs_wing_pass',
      title: 'Jump Shot vs Wing Pass Execution',
      titleMr: 'जंप शॉट की विंगला पास देण्याचा निर्णय',
      category: 'Offense',
      proSolution: 'डिफेंडर्स हवेत स्वतःला ब्लॉक करायला येताच हवेतच हात वळवून मोकळ्या विंगरला पास देणे.',
      commonMistake: 'डिफेंडर असतानाही जबरदस्तीने शॉट मारून बॉल गमावणे.',
      recommendedMarks: 9,
      reactionWindow: '०.२ सेकंद'
    },
    {
      id: 'hb_9m_free_throw',
      title: '9-Meter Free Throw Wall Bypass',
      titleMr: '९-मीटर फ्री थ्रो वॉल भेदणे',
      category: 'Crisis / Crunch',
      proSolution: 'वॉलच्या उजव्या बाजूला खोटा शॉट दाखवून पाय हलवून डाव्या बाजूने बाऊन्स शॉट काढणे.',
      commonMistake: 'थेट वॉलच्या मध्यभागी चेंडू मारणे.',
      recommendedMarks: 8,
      reactionWindow: '१ सेकंद'
    }
  ],

  'Running': [
    {
      id: 'run_pacing_strategy',
      title: '400m / 800m Pacing & Energy Split',
      titleMr: '४००/८०० मीटर धावणे - गती नियंत्रण व एनर्जी स्प्लिट',
      category: 'Pacing & Transition',
      proSolution: 'पहिल्या २०० मीटरमध्ये ८५% क्षमतेने गती गाठणे आणि शेवटच्या १०० मीटरच्या कर्व्हवर १००% स्प्रिंट किक मारणे.',
      commonMistake: 'पहिल्या ५० मीटरमध्ये पूर्ण ताकद संपवून शेवटी दम लागणे.',
      recommendedMarks: 9,
      reactionWindow: 'सतत भान'
    },
    {
      id: 'run_baton_exchange',
      title: '4x100m Relay Blind Baton Exchange',
      titleMr: '४x१०० रिले - न पाहता अचूक बॅटन देणे (Blind Exchange)',
      category: 'Crisis / Crunch',
      proSolution: 'इनकमिंग धावपटू चेक-मार्कवर पोहोचताच पूर्ण वेगाने पुढे धावणे आणि मागे न पाहता डाव्या हातात बॅटन घेणे.',
      commonMistake: 'मागे वळून पाहणे ज्यामुळे वेग कमी होतो किंवा बॅटन खाली पडणे.',
      recommendedMarks: 10,
      reactionWindow: '०.३ सेकंद'
    },
    {
      id: 'run_hurdle_trail_leg',
      title: 'Hurdle Lead vs Trail Leg Clearance',
      titleMr: 'हर्डल उडी न मारता स्प्रिंट मोशन राखणे',
      category: 'Pacing & Transition',
      proSolution: 'हर्डलवर उडी न मारता फक्त पाय जलद वर उचलून पुढचा पाय सरळ जमिनीवर टेकवणे जेणेकरून वेग मंदावणार नाही.',
      commonMistake: 'हर्डलवर खूप उंच उडी मारून हवेत जास्त वेळ राहणे.',
      recommendedMarks: 8,
      reactionWindow: '०.२ सेकंद'
    }
  ],

  'General': [
    {
      id: 'gen_fair_play',
      title: 'Sportsmanship & Instant Foul Control',
      titleMr: 'खेळाडूवृत्ती व वादाच्या प्रसंगी शांत राहणे',
      category: 'Crisis / Crunch',
      proSolution: 'रेफ्रीच्या निर्णयाचा आदर करणे आणि संघाचे लक्ष खेळावर केंद्रित ठेवणे.',
      commonMistake: 'रेफ्रीशी वाद घालून अनावश्यक तांत्रिक कार्ड किंवा दंड मिळवणे.',
      recommendedMarks: 9,
      reactionWindow: '१ सेकंद'
    }
  ]
};

// ==========================================
// 2. MAIN TACTICAL ANALYTICS COMPONENT
// ==========================================
export function TacticalAnalytics({ 
  store, 
  preselectedSport 
}: { 
  store: any, 
  preselectedSport?: string 
}) {
  const { toast } = useToast();
  
  // State
  const [selectedSport, setSelectedSport] = useState(preselectedSport || "Kabaddi");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [decisionSpeed, setDecisionSpeed] = useState<'Fast (⚡ अतिजलद)' | 'Normal (🏃 सामान्य)' | 'Delayed (⏳ उशीर)'>('Fast (⚡ अतिजलद)');
  const [marks, setMarks] = useState<number>(9);
  const [outcome, setOutcome] = useState<'Success' | 'Failure'>('Success');
  const [decisionType, setDecisionType] = useState<'Positive' | 'Negative'>('Positive');
  const [coachRemarks, setCoachRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'All' | 'Positive' | 'Negative'>('All');
  const [selectedScenarioView, setSelectedScenarioView] = useState<MatchScenario | null>(null);

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const sportsList = ['Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'General'];

  // Current sport scenarios
  const availableScenarios = useMemo(() => {
    return GAME_MATCH_SCENARIOS[selectedSport] || GAME_MATCH_SCENARIOS['General'];
  }, [selectedSport]);

  // Set default scenario when sport changes
  useEffect(() => {
    if (availableScenarios.length > 0) {
      setSelectedScenarioId(availableScenarios[0].id);
    }
  }, [selectedSport, availableScenarios]);

  // Active scenario object
  const activeScenario = useMemo(() => {
    return availableScenarios.find(s => s.id === selectedScenarioId) || availableScenarios[0];
  }, [availableScenarios, selectedScenarioId]);

  // Players filtered by sport
  const players = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => p.category === 'athlete' && (!selectedSport || !p.sports?.length || p.sports.includes(selectedSport)))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
    [store.data.players, selectedSport]
  );

  // Relevant Tactical Events
  const relevantEvents = useMemo((): TacticalEvent[] => {
    return (store.data.tacticalEvents || [])
      .filter((e: TacticalEvent) => {
        if (selectedSport && e.sport !== selectedSport) return false;
        if (filterType !== 'All' && e.decisionType !== filterType) return false;
        if (searchQuery) {
          const matchName = e.playerName?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchSit = e.situation?.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchName && !matchSit) return false;
        }
        return true;
      });
  }, [store.data.tacticalEvents, selectedSport, filterType, searchQuery]);

  // Stats Calculations
  const stats = useMemo(() => {
    if (relevantEvents.length === 0) return { successRate: 0, total: 0, positiveCount: 0, avgMarks: '0' };
    const positiveCount = relevantEvents.filter(e => e.decisionType === 'Positive' || e.outcome === 'Success').length;
    const rate = Math.round((positiveCount / relevantEvents.length) * 100);
    
    // Extract marks if available in description
    let totalMarks = 0;
    let countedMarks = 0;
    relevantEvents.forEach(e => {
      const match = e.description?.match(/\[MARKS:\s*(\d+)/i);
      if (match && match[1]) {
        totalMarks += parseInt(match[1]);
        countedMarks++;
      } else {
        totalMarks += (e.outcome === 'Success' ? 8 : 4);
        countedMarks++;
      }
    });

    const avgMarks = countedMarks > 0 ? (totalMarks / countedMarks).toFixed(1) : '0';

    return {
      successRate: rate,
      total: relevantEvents.length,
      positiveCount,
      avgMarks
    };
  }, [relevantEvents]);

  // Quick Preset Coach Remarks
  const quickRemarksPresets = useMemo(() => {
    if (selectedSport === 'Kabaddi') {
      return [
        'योग्य क्षणी बोनस घेतला आणि सुरक्षित परतला.',
        'विनाकारण ॲडव्हान्स टॅकलची घाई केली (सुधारणा हवी).',
        'कव्हरला वेळेत सपोर्ट देऊन सुपर टॅकल यशस्वी केला.',
        'डू ऑर डाय चढाईत शांत राहून गुण मिळवला.'
      ];
    } else if (selectedSport === 'Volleyball') {
      return [
        'ब्लॉकच्या बोटांवरून वाईप-आउट शॉट उत्कृष्ट मारला.',
        'मोठ्या ब्लॉकसमोर जबरदस्ती न करता डम्प टाकला.',
        'मॅच पॉईंटवर अचूक फ्लोट सर्व्हिस केली.',
        'लिबेरोने वेळेत पुढे येऊन ड्रॉप चेंडू उचलला.'
      ];
    } else if (selectedSport === 'Kho Kho') {
      return [
        'पोल जवळ येताच अचूक पोल डायव्ह मारून गुण मिळवला.',
        'दिशेची फसवणूक (Fake Movement) करून ३ खो वेळ काढला.',
        'बॅच ३ चा प्रवेश अगदी योग्य वेळी केला.'
      ];
    } else {
      return [
        'दबावाखाली योग्य आणि शांत निर्णय घेतला.',
        'निर्णयाचा वेग अतिशय जलद आणि परिणामकारक होता.',
        'घाई केल्यामुळे गुण गमावला, संयम हवा.'
      ];
    }
  }, [selectedSport]);

  // Save Tactical Event
  const handleSaveEvent = async () => {
    if (!selectedPlayerId || !activeScenario) {
      toast({ 
        title: "माहिती अपूर्ण आहे", 
        description: "कृपया खेळाडू आणि प्रसंग निवडा.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSaving(true);
    try {
      const player = players.find((p: any) => p.id === selectedPlayerId);
      const isPositive = marks >= 6 && outcome === 'Success';

      const fullDescription = `[TACTICAL_DECISION_AUDIT]
[MARKS: ${marks}/10]
[SPEED: ${decisionSpeed}]
[RECOMMENDED_PLAY: ${activeScenario.proSolution}]
[COACH_FEEDBACK: ${coachRemarks || 'मैदानावर प्रत्यक्ष अंमलबजावणी झाली.'}]`;

      await store.addTacticalEvent({
        playerId: selectedPlayerId,
        playerName: player?.name || "Unknown",
        sport: selectedSport,
        date: format(new Date(), 'yyyy-MM-dd'),
        situation: activeScenario.titleMr,
        decisionType: isPositive ? 'Positive' : 'Negative',
        outcome: marks >= 6 ? 'Success' : 'Failure',
        description: fullDescription
      });

      toast({ 
        title: "🎯 निर्णय क्षमता नोंदवली!", 
        description: `${player?.name || 'खेळाडू'} - ${activeScenario.titleMr} साठी ${marks}/१० गुण नोंदवले.`,
        className: isPositive ? "bg-emerald-600 text-white font-bold" : "bg-orange-600 text-white font-bold"
      });

      setCoachRemarks("");
    } catch (error) {
      toast({ title: "नोंद करताना एरर आला", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = (event: TacticalEvent) => {
    const player = (store.data.players || []).find((p: any) => p.id === event.playerId);
    const profile = store.data.schoolProfile;
    const displayName = player?.nameMarathi || transliterateEnglishToMarathi(player?.name || event.playerName) || event.playerName;

    shareToWhatsApp({
      phone: player?.mobileNumber,
      schoolName: profile?.schoolName,
      teacherName: profile?.teacherName,
      studentName: displayName,
      std: player?.std,
      age: player?.age,
      dob: player?.dob,
      bmi: player?.bmi || "---",
      height: player?.height || "---",
      weight: player?.weight || "---",
      reportType: `सामना निर्णय क्षमता अहवाल (${event.sport})`,
      reportData: `प्रसंग: ${event.situation}\nगुण: ${event.outcome === 'Success' ? 'यशस्वी (Positive)' : 'सुधारणा हवी (Review)'}\nकोच शेरा: ${event.description}`
    });
  };

  // Print Official Decision IQ Registry
  const handlePrint = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const signatureBlockHtml = getPrintSignatureBlockHtml(schoolProfile, true);

    const printContent = `
      <html>
        <head>
          <title>Match Decision IQ Audit Registry - Waghamba Hub</title>
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
            .success-tag { color: #15803d; font-weight: 900; background: #dcfce7; padding: 2px 5px; border-radius: 4px; display: inline-block; font-size: 9px; }
            .fail-tag { color: #dc2626; font-weight: 900; background: #fee2e2; padding: 2px 5px; border-radius: 4px; display: inline-block; font-size: 9px; }
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
          <div class="report-type">मैदानावरील सामना निर्णय क्षमता व रणनीती अधिकृत नोंदवही (Decision IQ)</div>
          <div class="meta">खेळ: ${selectedSport} &bull; एकूण नोंदी: ${relevantEvents.length} &bull; सरासरी गुणवत्ता: ${stats.avgMarks}/१० &bull; दिनांक: ${format(new Date(), 'dd MMMM yyyy')}</div>
          
          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 4%;">अ.क्र.</th>
                <th style="width: 20%;">खेळाडूचे नाव</th>
                <th style="width: 10%;">दिनांक</th>
                <th style="width: 25%;">मैदानावरील प्रसंग (Situation)</th>
                <th style="width: 26%;">कोचचे मूल्यमापन व शेरा</th>
                <th style="width: 15%;">निकाल व गुण</th>
              </tr>
            </thead>
            <tbody>
              ${relevantEvents.map((ev, idx) => {
                const player = (store.data.players || []).find((p: any) => p.id === ev.playerId);
                const displayName = player?.nameMarathi || transliterateEnglishToMarathi(player?.name || ev.playerName) || ev.playerName;
                const isSuccess = ev.outcome === 'Success' || ev.decisionType === 'Positive';
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                    <td>
                      <strong>${displayName}</strong><br/>
                      <span style="font-size: 9px; color: #64748b;">${player?.std ? `Std ${player.std}` : ''}</span>
                    </td>
                    <td>${ev.date}</td>
                    <td><strong>${ev.situation}</strong></td>
                    <td><div style="font-size: 10px; color: #334155;">${ev.description}</div></td>
                    <td>
                      <span class="${isSuccess ? 'success-tag' : 'fail-tag'}">
                        ${isSuccess ? 'यशस्वी निर्णय (Positive)' : 'सुधारणा हवी (Needs Work)'}
                      </span>
                    </td>
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <BrainCircuit className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                  सामना निर्णय क्षमता व थेट मूल्यमापन (Match Decision IQ)
                </h2>
                <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                  Pro Simulator Active
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Real-Time Ground Situations &bull; 1-10 Marks Grading Pad &bull; Tactical Reaction Solver
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats & Print Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl text-center">
            <span className="text-[8px] font-black uppercase text-white/60 block">यशस्वी निर्णय %</span>
            <span className="text-xl font-black text-emerald-400">{stats.successRate}%</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl text-center">
            <span className="text-[8px] font-black uppercase text-white/60 block">सरासरी गुण</span>
            <span className="text-xl font-black text-amber-400">{stats.avgMarks} / १०</span>
          </div>
          <Button 
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-12 px-6 rounded-2xl uppercase text-xs tracking-wider shadow-xl active-scale"
          >
            <Printer className="w-4 h-4 mr-2" /> अधिकृत रिपोर्ट प्रिंट करा
          </Button>
        </div>
      </div>

      {/* 2. Sport Switcher Pill Bar (if sport not locked) */}
      {!preselectedSport && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100/80 rounded-2xl border shadow-inner">
          {sportsList.map(sport => (
            <button
              key={sport}
              type="button"
              onClick={() => setSelectedSport(sport)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2",
                selectedSport === sport
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-200"
              )}
            >
              <Trophy className="w-3.5 h-3.5" /> {sport}
            </button>
          ))}
        </div>
      )}

      {/* 3. Main 2-Column Deck: Decision Evaluator Pad & Live Decision Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Match Situation Simulator & 1-10 Marks Grading Pad */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-2 rounded-[2.5rem] p-6 sm:p-8 shadow-xl bg-white space-y-6">
            
            {/* Step 1: Select Student Athlete */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" /> १. खेळाडू निवडा (Select Athlete)
                </label>
                <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20">
                  {players.length} खेळाडू उपलब्ध
                </Badge>
              </div>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-slate-50 text-base">
                  <SelectValue placeholder="खेळाडूचे नाव निवडा..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {players.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-bold">{p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">(Std {p.std} &bull; {p.sports?.join(', ') || selectedSport})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Realistic Ground Match Situation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> २. मैदानावरील प्रसंग निवडा (Match Situation)
                </label>
                <Badge className="bg-blue-100 text-blue-800 font-black text-[9px] uppercase">
                  {activeScenario?.category}
                </Badge>
              </div>
              <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-slate-50 text-sm">
                  <SelectValue placeholder="प्रसंग निवडा..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {availableScenarios.map((sc) => (
                    <SelectItem key={sc.id} value={sc.id}>
                      <span className="font-bold">{sc.titleMr}</span>
                      <span className="text-xs text-muted-foreground ml-2">({sc.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Pro Tactical Solution & Error Insight Box */}
            {activeScenario && (
              <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-emerald-50 border-2 border-amber-200 p-5 rounded-3xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-widest flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" /> योग्य निर्णय व प्रो पद्धत (Pro Tactical Choice):
                  </span>
                  <Badge variant="outline" className="text-[9px] font-black uppercase border-amber-400 bg-amber-100 text-amber-900">
                    ⏱️ रिॲक्शन वेळ: {activeScenario.reactionWindow}
                  </Badge>
                </div>
                <p className="text-xs font-black text-slate-900 leading-relaxed">
                  {activeScenario.proSolution}
                </p>

                <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-rose-900 leading-tight">
                    <strong className="uppercase">टाळायची चूक:</strong> {activeScenario.commonMistake}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Decision Reaction Speed & 1-10 Marks Grading Pad */}
            <div className="space-y-4 border-t pt-4">
              
              {/* Speed Buttons */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">
                  ३. निर्णयाचा वेग (Decision Reaction Speed):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fast (⚡ अतिजलद)', 'Normal (🏃 सामान्य)', 'Delayed (⏳ उशीर)'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setDecisionSpeed(spd)}
                      className={cn(
                        "h-12 rounded-xl text-xs font-black uppercase border-2 transition-all p-1 text-center",
                        decisionSpeed === spd
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-10 Marks Pad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">
                    ४. निर्णय क्षमता गुण (Tactical Marks: १ ते १० गुण):
                  </label>
                  <span className="text-sm font-black text-primary bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
                    {marks} / १० गुण ({marks >= 9 ? '⭐ अप्रतिम' : marks >= 7 ? '🥇 उत्तम' : marks >= 5 ? '🥈 समाधानकारक' : '🥉 सुधारणा हवी'})
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = marks === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setMarks(num);
                          setOutcome(num >= 6 ? 'Success' : 'Failure');
                          setDecisionType(num >= 6 ? 'Positive' : 'Negative');
                        }}
                        className={cn(
                          "h-12 rounded-xl font-black text-sm transition-all border-2 flex flex-col items-center justify-center",
                          isSelected
                            ? (num >= 8 ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : num >= 5 ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105" : "bg-rose-600 text-white border-rose-700 shadow-md scale-105")
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/40 hover:bg-slate-100"
                        )}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Step 5: Coach Remarks & Quick Presets */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  ५. कोचचा शेरा व मैदानावरील सल्ला (Coach Feedback):
                </label>
                <span className="text-[9px] font-bold text-muted-foreground">खालील पर्यायांवर टॅप करा</span>
              </div>

              {/* 1-Tap Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {quickRemarksPresets.map((pre, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoachRemarks(pre)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-all text-left"
                  >
                    + {pre}
                  </button>
                ))}
              </div>

              <Textarea 
                value={coachRemarks}
                onChange={(e) => setCoachRemarks(e.target.value)}
                placeholder="उदा. डू ऑर डायमध्ये कॉर्नरला ओढून वेळेत बोनस घेतला..."
                className="min-h-[80px] border-2 rounded-xl font-bold p-3 text-xs"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveEvent}
              disabled={isSaving || !selectedPlayerId}
              className={cn(
                "w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale transition-all flex items-center justify-center gap-2",
                marks >= 6
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              )}
            >
              {isSaving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
              निर्णय नोंद जतन करा (Log Decision Score)
            </Button>

          </Card>
        </div>

        {/* Right 5 Cols: Live Decision IQ Ledger & Student Analysis */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-5">
            
            {/* Header & Filter Controls */}
            <div className="space-y-3 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h4 className="text-base font-black text-primary uppercase">
                    निर्णय नोंदी ({relevantEvents.length})
                  </h4>
                </div>
                
                {/* Positive/Negative Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border text-[9px] font-black uppercase">
                  <button
                    type="button"
                    onClick={() => setFilterType('All')}
                    className={cn("px-2 py-1 rounded-lg transition-all", filterType === 'All' ? "bg-primary text-white" : "text-slate-600")}
                  >
                    सर्व
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('Positive')}
                    className={cn("px-2 py-1 rounded-lg transition-all", filterType === 'Positive' ? "bg-emerald-600 text-white" : "text-slate-600")}
                  >
                    यशस्वी
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('Negative')}
                    className={cn("px-2 py-1 rounded-lg transition-all", filterType === 'Negative' ? "bg-rose-600 text-white" : "text-slate-600")}
                  >
                    सुधारणा
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खेळाडूचे नाव किंवा प्रसंग शोधा..."
                  className="pl-9 h-10 rounded-xl text-xs font-bold border-2"
                />
              </div>
            </div>

            {/* Scrollable Events List */}
            <ScrollArea className="max-h-[560px] pr-2">
              <div className="space-y-3">
                {relevantEvents.length === 0 ? (
                  <div className="py-20 text-center opacity-30 border-2 border-dashed rounded-3xl">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-black uppercase text-xs">कोणतीही निर्णय नोंद उपलब्ध नाही.</p>
                  </div>
                ) : (
                  relevantEvents.map((ev: TacticalEvent) => {
                    const player = (store.data.players || []).find((p: any) => p.id === ev.playerId);
                    const displayName = player?.nameMarathi || transliterateEnglishToMarathi(player?.name || ev.playerName) || ev.playerName;
                    const isSuccess = ev.outcome === 'Success' || ev.decisionType === 'Positive';
                    
                    // Parse marks from description if present
                    const marksMatch = ev.description?.match(/\[MARKS:\s*(\d+)/i);
                    const parsedMarks = marksMatch ? marksMatch[1] : (isSuccess ? '8' : '4');

                    return (
                      <div 
                        key={ev.id} 
                        className="p-4 rounded-2xl border-2 bg-white shadow-sm hover:border-primary/40 transition-all space-y-2.5 group relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner",
                              isSuccess ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            )}>
                              {parsedMarks}
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900 text-sm leading-tight">{displayName}</h5>
                              <p className="text-[10px] text-muted-foreground font-bold">{ev.date} &bull; {ev.situation}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleWhatsAppShare(ev)} 
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="WhatsApp वर पाठवा"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => store.deleteTacticalEvent(ev.id)} 
                              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Description Summary */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border text-[11px] font-medium text-slate-800 space-y-1">
                          <p className="leading-snug">{ev.description.replace(/\[TACTICAL_DECISION_AUDIT\]|\[MARKS:[^\]]+\]|\[SPEED:[^\]]+\]/g, '').trim()}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

          </Card>

        </div>

      </div>

    </div>
  );
}