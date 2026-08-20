"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Save, 
  History, 
  Trash2, 
  Loader2, 
  Zap,
  ArrowRight,
  Flame,
  Star,
  Printer,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Play,
  Volume2,
  Award,
  Search,
  Users,
  Check,
  RotateCcw,
  MessageSquare,
  Filter,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, transliterateEnglishToMarathi, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export interface PracticalSkill {
  id: string;
  name: string;
  nameMr: string;
  commandCue: string;
  category: 'Raid / Attack' | 'Defense / Tackle' | 'Technique & Form' | 'Power & Speed' | 'Mobility & Stance';
  maxMarks: number;
}

export const PRACTICAL_GAME_SKILLS: Record<string, PracticalSkill[]> = {
  'Kabaddi': [
    { id: 'kab_toe_touch', name: 'Toe Touch (पाय स्पर्श)', nameMr: 'टो टच / पायाचा अंगठा स्पर्श', commandCue: 'डू! जलद धाव घेऊन पायाचा अंगठा स्पर्श करा व सुरक्षित परता.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_hand_touch', name: 'Running Hand Touch (धावत हात स्पर्श)', nameMr: 'रनिंग हॅन्ड टच', commandCue: 'डू! कॉर्नर किंवा कव्हर खेळाडूला अचानक हात लावून पळा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_dubki', name: 'Dubki / Low Escape (डूबकी मारणे)', nameMr: 'डूबकी तंत्र व सुटका', commandCue: 'डू! दोन खेळाडूंच्या हाताखालून वाकून डूबकी मारून मध्य रेषा ओलांडा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_kick', name: 'Side / Back Kick (किक मारणे)', nameMr: 'साईड / बॅक किक', commandCue: 'डू! तोल सांभाळून अचूक किक मारून पॉईंट घ्या.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_bonus', name: 'Bonus Line Crossing (बोनस रेषा पार)', nameMr: 'बोनस लाईन तंत्र', commandCue: 'डू! एक पाय हवेत आणि एक पाय बोनस रेषेच्या पुढे ठेवून बोनस मिळवा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_cant', name: 'Cant & Chanting Rhythm (कबड्डी दम टिकवणे)', nameMr: 'कबड्डी-कबड्डी जप व दम', commandCue: 'डू! न तुटता सलग कबड्डी उच्चार करत ३० सेकंद चढाई करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kab_ankle_hold', name: 'Ankle Hold (घोटा पकड)', nameMr: 'अँकल होल्ड / घोटा पकड', commandCue: 'डू! चढाईपटूचा घोटा घट्ट पकडून जमिनीवर खिळवून ठेवा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kab_thigh_hold', name: 'Thigh Hold (मांडी पकड)', nameMr: 'थाई होल्ड / मांडी पकड', commandCue: 'डू! दोन्ही हातांनी चढाईपटूची मांडी घट्ट पकडून उचला.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kab_waist_hold', name: 'Waist Hold / Trunk Lock (कंबर पकड)', nameMr: 'कंबर पकड तंत्र', commandCue: 'डू! चढाईपटूला मागून कंबरेत पकडून फिरवून टाका.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kab_chain_tackle', name: 'Chain Tackle (साखळी पकड)', nameMr: 'साखळी टॅकल', commandCue: 'डू! साथीदाराचा हात पकडून साखळीने चढाईपटूला कव्हर करा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kab_dash', name: 'Dash & Body Block (डॅश / ब्लॉक)', nameMr: 'डॅश / लॉबी ढकलणे', commandCue: 'डू! वेगात येऊन चढाईपटूला लॉबीच्या बाहेर डॅश मारा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kab_escape', name: 'Lobby Escape & Turn (लॉबी सुटका)', nameMr: 'टॅकलमधून सुटका व फिरणे', commandCue: 'डू! पकडीतून स्वतःला सोडवून मध्य रेषेकडे झेप घ्या.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'Volleyball': [
    { id: 'vb_underhand_serve', name: 'Underhand Serve (अंडरहँड सर्व्हिस)', nameMr: 'अंडरहँड अचूक सर्व्हिस', commandCue: 'डू! अचूक दिशेने चेंडू विरुद्ध कोर्टात सर्व्ह करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'vb_tennis_serve', name: 'Overhand / Tennis Serve (टेनिस सर्व्हिस)', nameMr: 'ओव्हरहँड सर्व्हिस', commandCue: 'डू! चेंडू वर फेकून तळहाताने जोरदार सर्व्हिस मारा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'vb_jump_float', name: 'Jump Float Serve (जंप फ्लोट सर्व्हिस)', nameMr: 'जंप फ्लोट सर्व्हिस', commandCue: 'डू! उडी मारून चेंडू न फिरवता फ्लोट सर्व्हिस करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'vb_dig_pass', name: 'Forearm Pass / Dig (अंडरआर्म पासिंग)', nameMr: 'अंडरआर्म डिग व पास', commandCue: 'डू! दोन्ही हात जोडून चेंडू अचूक सेटरकडे पास करा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'vb_overhead_set', name: 'Overhead Set (ओव्हरहेड सेटिंग)', nameMr: 'ओव्हरहेड बोटांनी सेटिंग', commandCue: 'डू! बोटांच्या टोकांनी चेंडू मऊ स्पर्श करून स्पायकरसाठी सेट करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'vb_spike_smash', name: 'Spike / Smash (स्पाइक / स्मॅश)', nameMr: 'स्मॅश / स्पाइकिंग शॉट', commandCue: 'डू! ३-स्टेप ॲप्रोचने उडी मारून चेंडू खाली कोर्टात दाबा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'vb_block', name: 'Block / Net Defense (ब्लॉकिंग)', nameMr: 'नेट ब्लॉकिंग', commandCue: 'डू! नेटवर वेळेवर उडी मारून विरुद्ध स्पाइक अडवा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'vb_dive_roll', name: 'Dive & Roll Recovery (डायव्ह व रोल)', nameMr: 'डायव्हिंग डिफेन्स', commandCue: 'डू! जमिनीवर झेप घेऊन चेंडू वर उडवा व सुरक्षित रोल करा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'Kho Kho': [
    { id: 'kho_giving_kho', name: 'Giving Kho with Stance (योग्य खो देणे)', nameMr: 'योग्य बैठक व खो उच्चार', commandCue: 'डू! बसलेल्या खेळाडूच्या पाठीवर अचूक हात ठेवून वेगात खो द्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'kho_pole_dive', name: 'Pole Dive (पोल डाईव्ह मारणे)', nameMr: 'पोल डाईव्ह व गडी बाद करणे', commandCue: 'डू! खांबावरून संपूर्ण शरीर झोकून पळणाऱ्या गड्याला स्पर्श करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kho_tapping', name: 'Tapping & Trapping (टॅपिंग तंत्र)', nameMr: 'टॅपिंग व ट्रॅपिंग', commandCue: 'डू! अचानक हात लांबवून समोरच्या गड्याला टॅप करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'kho_direction_change', name: 'Direction Change & Fake (दिशा बदल)', nameMr: 'दिशा बदल व हुलकावणी', commandCue: 'डू! खांद्याची हालचाल करून दिशा बदलून धावपटूला फसवून पकडा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'kho_pole_turning', name: 'Pole Turning Speed (पोल फिरणे)', nameMr: 'पोल वेगात वळणे', commandCue: 'डू! खांब एका हाताने पकडून अतिशय वेगाने फेरी मारा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'kho_zigzag_running', name: 'Zig-Zag Running (झिग-झॅग संरक्षण)', nameMr: 'झिग-झॅग पळणे (डिफेन्स)', commandCue: 'डू! दोन खेळाडूंच्या मधून झिग-झॅग धावून ३ मिनिटे संरक्षण करा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kho_ring_play', name: 'Ring Play (रिंग प्ले तंत्र)', nameMr: 'रिंग प्ले संरक्षण', commandCue: 'डू! चार खेळाडूंच्या भोवती वर्तुळात धावून वेळ काढा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'kho_dodging', name: 'Dodging & Feinting (चकवणे)', nameMr: 'चकवणे व हुलकावणी', commandCue: 'डू! अचानक पाय थांबवून व शरीर वाकवून पाठलाग करणाऱ्याला चकवा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'Handball': [
    { id: 'hb_dribble', name: 'Speed Dribbling (धावत ड्रिब्लिंग)', nameMr: 'वेगात ड्रिब्लिंग करणे', commandCue: 'डू! चेंडू न पाहता दोन्ही हातांनी ड्रिबल करत गोलकडे धाव घ्या.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'hb_pass', name: 'Chest & Bounce Pass (छाती व उसळी पास)', nameMr: 'छाती पास व बाऊन्स पास', commandCue: 'डू! साथीदाराच्या छातीवर अचूक बाऊन्स पास द्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'hb_jump_shot', name: 'Jump Shot on Goal (जंप शॉट)', nameMr: 'उडी मारून गोल करणे', commandCue: 'डू! डी-लाईन बाहेरून उडी मारून हवेत असताना गोलपोस्टमध्ये शॉट मारा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'hb_wing_shot', name: 'Wing / Angle Shot (विंग शॉट)', nameMr: 'कोनातून विंग शॉट', commandCue: 'डू! विंग पोझिशनवरून शरीराचा कोन बदलून गोल मारा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'hb_penalty_shot', name: '7m Penalty Throw (पेनल्टी थ्रो)', nameMr: '७ मी. पेनल्टी थ्रो', commandCue: 'डू! स्थिर पाय ठेवून गोलकीपरच्या दिशेने पॉवर थ्रो करा.', category: 'Raid / Attack', maxMarks: 10 },
    { id: 'hb_feint', name: 'Body Feint & Dodging (बॉडी फेक)', nameMr: 'बॉडी फेक व चकवणे', commandCue: 'डू! एका बाजूला हुलकावणी देऊन दुसऱ्या बाजूने बचावपटूला कट करा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'hb_defense_block', name: 'Zone Defense Block (झोन ब्लॉकिंग)', nameMr: 'हात वर करून डिफेन्स ब्लॉक', commandCue: 'डू! दोन्ही हात उंचावून विरुद्ध खेळाडूचा शॉट अडवा.', category: 'Defense / Tackle', maxMarks: 10 },
    { id: 'hb_goalkeeper_save', name: 'Goalkeeper Save (गोलकीपर सेव्ह)', nameMr: 'गोलकीपिंग सेव्ह तंत्र', commandCue: 'डू! हात आणि पायाचा वापर करून थेट शॉट अडवून चेंडू बाहेर काढा.', category: 'Defense / Tackle', maxMarks: 10 },
  ],
  'Running': [
    { id: 'run_crouch_start', name: 'Crouch Start & Block Drive (क्रॉउच स्टार्ट)', nameMr: 'स्टार्टिंग ब्लॉक व क्रॉउच स्टार्ट', commandCue: 'डू! "ऑन युवर मार्क, सेट, गो" वर स्फोटक सुरुवात करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'run_acceleration', name: '30m Acceleration Drive (वेग वाढवणे)', nameMr: 'सुरुवातीचा वेग व जोर', commandCue: 'डू! डोके खाली ठेवून पहिल्या ३० मीटरमध्ये कमाल वेग गाठा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'run_max_velocity', name: 'Max Velocity Posture (कमाल धाव पोश्चर)', nameMr: 'कमाल गती व हात-पाय ॲक्शन', commandCue: 'डू! सरळ पाठीचा कणा व उंच गुडघा उचलून १००% वेगाने धाव घ्या.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'run_curve_running', name: 'Curve Running (200m/400m वळण)', nameMr: 'ट्रॅक वळणावर धावणे', commandCue: 'डू! डाव्या बाजूला शरीर थोडे झुकवून वळणावर गती टिकवा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'run_finish_lean', name: 'Finishing Torso Lean (फिनिशिंग लीन)', nameMr: 'फिनिशिंग लाईन लीन', commandCue: 'डू! अंतिम रेषेवर छाती पुढे झुकवून वेळ कमी करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'run_baton_exchange', name: 'Relay Baton Exchange (बॅटन देवाणघेवाण)', nameMr: '४x१०० मी. बॅटन एक्सचेंज', commandCue: 'डू! न पाहता वेगात हातात बॅटन अचूक पास करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'run_endurance_pace', name: 'Pacing & Breathing (पेसिंग व श्वास)', nameMr: 'लांब पल्ल्यातील श्वास नियंत्रण', commandCue: 'डू! २ पावले श्वास घेणे, २ पावले सोडणे या लयीत पळा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'Athletics': [
    { id: 'ath_100m_sprint', name: '100m Sprint Practical (१०० मी. धावणे)', nameMr: '१०० मी. स्प्रिंट प्रात्यक्षिक', commandCue: 'डू! १०० मीटर कमाल वेगाने पूर्ण करा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'ath_200m_sprint', name: '200m Curve Sprint (२०० मी. धावणे)', nameMr: '२०० मी. स्प्रिंट प्रात्यक्षिक', commandCue: 'डू! वळण आणि सरळ रेषेत गती राखून धाव पूर्ण करा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'ath_400m_endurance', name: '400m Stride Pace (४०० मी. धावणे)', nameMr: '४०० मी. पेस व स्टॅमिना', commandCue: 'डू! संतुलित वेगाने धावून शेवटच्या १०० मीटरमध्ये जोर लावा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'ath_relay_exchange', name: 'Relay Handover (रिले बॅटन पास)', nameMr: 'रिले बॅटन देवाणघेवाण', commandCue: 'डू! एक्सचेंज झोनमध्ये वेगात बॅटन हातात द्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'ath_long_jump', name: 'Long Jump Flight (लांब उडी)', nameMr: 'लांब उडी टेकऑफ व लँडिंग', commandCue: 'डू! बोर्डवरून उंच उडी घेऊन पुढे लँडिंग करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'ath_high_jump', name: 'High Jump Clearance (उंच उडी)', nameMr: 'उंच उडी बार क्लिअरन्स', commandCue: 'डू! पाठीचा कमान आकार करून बार ओलांडा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'ath_shot_put', name: 'Shot Put Throw (गोळा फेक)', nameMr: 'गोळा फेक रिलीज', commandCue: 'डू! मानेवरून गोळा ४५ अंशात ढकला.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'ath_javelin', name: 'Javelin Throw (भाला फेक)', nameMr: 'भाला फेक रिलीज', commandCue: 'डू! वेगात धावून खांद्यावरून भाला फेका.', category: 'Power & Speed', maxMarks: 10 },
  ],
  'Shot Put': [
    { id: 'sp_grip_placement', name: 'Clean Grip & Neck Placement (ग्रिप व मान प्लेसमेंट)', nameMr: 'गोळा पकड व मान प्लेसमेंट', commandCue: 'डू! गोळा बोटांच्या मुळाशी पकडून मानेच्या खळग्यात घट्ट दाबा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'sp_glide', name: 'O\'Brien Glide Technique (ग्लाइड तंत्र)', nameMr: 'ग्लाइड पावले व वजन शिफ्ट', commandCue: 'डू! मागे तोंड करून एका पायावर वेगात मागे सरका.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'sp_rotational_spin', name: 'Rotational Spin (स्पिन तंत्र)', nameMr: 'रोटेशनल फिरकी तंत्र', commandCue: 'डू! वर्तुळात शरीर फिरवून पॉवर पोझिशनमध्ये या.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'sp_power_position', name: 'Power Position & Hip Torque (पॉवर पोझिशन)', nameMr: 'पॉवर पोझिशन व कंबर पिळणे', commandCue: 'डू! पाय वाकवून कंबर वेगाने पुढे ढकला.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'sp_arm_thrust', name: 'Explosive Thrust & Extension (हात ढकलणे)', nameMr: 'हाताचा स्फोटक जोर', commandCue: 'डू! कोपर उंच ठेवून ४०-४२ अंश कोनात गोळा ढकला.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'sp_wrist_flick', name: 'Wrist Flick & Release (मनगट फ्लिक)', nameMr: 'मनगटाचा अंतिम झटका', commandCue: 'डू! गोळा सुटताना मनगटाने बाहेरच्या दिशेने झटका द्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'sp_reverse_recovery', name: 'Reverse Leg Switch & Balance (रिव्हर्स रिकव्हरी)', nameMr: 'रिव्हर्स तोल सांभाळणे (फाऊल टाळा)', commandCue: 'डू! फेकल्यानंतर पाय बदलून रिंगमध्येच तोल सांभाळा.', category: 'Technique & Form', maxMarks: 10 },
  ],
  'Javelin Throw': [
    { id: 'jav_grip_carry', name: 'V-Grip & Overhead Carry (ग्रिप व कॅरी)', nameMr: 'भाला पकड व डोक्यावर धरणे', commandCue: 'डू! कॉर्डवर बोटे घट्ट ठेवून भाला कानाच्या समांतर धरा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'jav_approach_run', name: '5-Step Approach Run (५-स्टेप ॲप्रोच रन)', nameMr: 'ॲप्रोच रन रिदम व वेग', commandCue: 'डू! लयीत ५-७ पावले वेगाने धाव घ्या.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'jav_crossover_step', name: 'Cross-over Steps / Impulse (इम्पल्स स्टेप्स)', nameMr: 'क्रॉस-ओव्हर पावले', commandCue: 'डू! उजवा पाय डाव्या पायावरून क्रॉस करून मागे झुका.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'jav_withdrawal', name: 'Arm Withdrawal (हात मागे खेचणे)', nameMr: 'भाला पूर्ण मागे खेचणे', commandCue: 'डू! हात सरळ करून भाल्याचे टोक हनुवटीजवळ ठेवा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'jav_bow_stance', name: 'Bow Stance & Shoulder Pull (बो पोझिशन)', nameMr: 'धनुष्यासारखा शरीर ताण', commandCue: 'डू! डावा पाय रोवून खांद्याने भाला पुढे ओढा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'jav_release_angle', name: 'High Extension Release (३२-३६° रिलीज)', nameMr: 'उंच कोनात भाला सोडणे', commandCue: 'डू! डोक्याच्या वरून ३४ अंश कोनात भाला हवेत फेका.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'jav_recovery', name: 'Follow-through & Recovery (फाऊल रिकव्हरी)', nameMr: 'रेषा ओलांडण्यापूर्वी तोल', commandCue: 'डू! उजव्या पायावर वजन टाकून रेषेच्या आत थांबा.', category: 'Technique & Form', maxMarks: 10 },
  ],
  'Disc Throw': [
    { id: 'dt_grip_finger', name: 'Discus Finger-pad Grip (डिस्क ग्रिप)', nameMr: 'बोटांच्या टोकांनी डिस्क पकडणे', commandCue: 'डू! पहिल्या पेऱ्यात डिस्क ठेवून अंगठा सपाट ठेवा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'dt_windup_swings', name: 'Initial Wind-up Swings (सुरुवातीचे स्विंग्स)', nameMr: 'सुरुवातीचे २-३ स्विंग्स', commandCue: 'डू! पाठीचा कणा फिरवून खांद्याने डिस्क मागे न्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'dt_pivot_turn', name: 'Center Pivot & Turn (पिव्हॉट व टर्न)', nameMr: 'मध्यभागी वेगात फिरणे', commandCue: 'डू! डाव्या पायाच्या चेंडूवर ३६० अंश फिरा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'dt_power_position', name: 'Power Position & Hip Drive (पॉवर पोझिशन)', nameMr: 'कंबर पुढे ढकलणे', commandCue: 'डू! पायांचा जोर लावून छाती पुढे फेका.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'dt_centrifugal_release', name: 'Centrifugal Spin Release (फिरती रिलीज)', nameMr: 'घड्याळाच्या दिशेने फिरवून सोडणे', commandCue: 'डू! तर्जनीवरून क्लॉकव्हाईज फिरवून डिस्क हवेत फेका.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'dt_balance_recovery', name: 'Recovery & Ring Balance (तोल सांभाळणे)', nameMr: 'फेकल्यानंतर रिंगमध्ये तोल', commandCue: 'डू! फेकल्यानंतर उडी मारून रिंगच्या आत राहा.', category: 'Technique & Form', maxMarks: 10 },
  ],
  'Long Jump': [
    { id: 'lj_approach_run', name: 'Rhythmic 20m Approach Run (ॲप्रोच रन)', nameMr: 'अचूक २०-२५ मी. धाव', commandCue: 'डू! मोजलेल्या पावलांवर समान लयीत कमाल वेग गाठा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'lj_takeoff_board', name: 'Takeoff Board Hit (टेकऑफ बोर्ड अचूकता)', nameMr: 'बोर्ड न ओलांडता उडी मारणे', commandCue: 'डू! संपूर्ण तळपाय बोर्डवर आपटून वर उसळी घ्या.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'lj_knee_drive', name: 'Vertical Knee Drive (गुडघा उंच उचलणे)', nameMr: 'गुडघ्याची वर झेप', commandCue: 'डू! विरुद्ध गुडघा छातीजवळ वेगाने वर फेका.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'lj_flight_technique', name: 'Flight Technique (Hang / Hitch-kick)', nameMr: 'हवेतील शरीर हालचाल (हँग तंत्र)', commandCue: 'डू! हवेत असताना पाय आणि हात लांब ताणून ठेवा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'lj_landing_technique', name: 'Landing in Sand & Forward Fall (लँडिंग)', nameMr: 'वाळूत पुढे सुरक्षित पडणे', commandCue: 'डू! दोन्ही पाय पुढे फेकून पाठीवर न पडता पुढे व्हा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'High Jump': [
    { id: 'hj_j_curve_approach', name: 'J-Curve Approach Run (J-ॲप्रोच रन)', nameMr: 'J-आकाराचा वळणदार रन', commandCue: 'डू! ५ पावले सरळ व ३ पावले वळणावर वेगात धावा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'hj_plant_pop', name: 'Plant Foot & Vertical Pop (टेकऑफ पॉप)', nameMr: 'टेकऑफ पायाचा जोर', commandCue: 'डू! बारपासून ३ फूट अंतरावर पाय रोवून वर उडी घ्या.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'hj_fosbury_arch', name: 'Fosbury Flop Back Arch (कमान करणे)', nameMr: 'बारवर पाठीची कमान करणे', commandCue: 'डू! डोके व खांदे बार ओलांडताना कंबर वर उचला.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'hj_bar_clearance', name: 'Leg Kick & Bar Clearance (पाय वर काढणे)', nameMr: 'पाय बारला न लागता काढणे', commandCue: 'डू! डोके पलीकडे गेल्यावर दोन्ही पाय वर झटका.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'hj_mat_landing', name: 'Safe Upper Back Landing (मॅट लँडिंग)', nameMr: 'पाठीच्या वरच्या भागावर लँडिंग', commandCue: 'डू! मानेवर भार न देता पाठीवर सुरक्षित उतरा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'Yoga': [
    { id: 'yo_surya_namaskar', name: 'Surya Namaskar 12 Steps (सूर्यनमस्कार १२ स्थिती)', nameMr: 'सूर्यनमस्कार १२ आसने व लय', commandCue: 'डू! १ ते १२ स्थिती अचूक श्वासाच्या तालात पूर्ण करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'yo_tadasana', name: 'Tadasana / Vrikshasana (वृक्षासन तोल)', nameMr: 'ताडासन व वृक्षासन एका पायावर तोल', commandCue: 'डू! एका पायावर स्थिर उभे राहून १ मिनिट तोल सांभाळा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'yo_bhujangasana', name: 'Bhujangasana / Chakrasana (भुजंगासन/चक्रासन)', nameMr: 'पाठीची कमान व लवचिकता', commandCue: 'डू! छाती वर उचलून पाठीचा कणा मागे ताणा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'yo_paschimottanasana', name: 'Paschimottanasana (पश्चिमोत्तानासन)', nameMr: 'पुढे वाकून पायाचे अंगठे पकडणे', commandCue: 'डू! गुडघे न वाकवता कपाळ गुडघ्याला लावा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'yo_sarvangasana', name: 'Sarvangasana / Halasana (सर्वांगासन)', nameMr: 'खांद्यावर संपूर्ण शरीर सरळ तोलणे', commandCue: 'डू! पाय आणि कंबर सरळ रेषेत ९० अंशात उचला.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'yo_pranayama', name: 'Anulom Vilom & Kapalbhati (प्राणायाम)', nameMr: 'श्वासोच्छ्वास नियंत्रण व शुद्धीक्रिया', commandCue: 'डू! संथ लयीत अनुलोम विलोम व कपालभाती करा.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'yo_hold_duration', name: 'Asana Stillness & Hold (आसन स्थिरता)', nameMr: 'स्थिरम् सुखम् आसनम्', commandCue: 'डू! कोणत्याही आसनात न हलता २ मिनिटे शांत राहा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'PT Mass': [
    { id: 'pt_ex_1_4', name: 'Mass PT Table Ex 1 to 4 (कवायत प्रकार १ ते ४)', nameMr: 'सामूहिक कवायत प्रकार १ ते ४ अचूकता', commandCue: 'डू! १ ते ४ कवायत प्रकार अचूक लयीत करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'pt_ex_5_8', name: 'Mass PT Table Ex 5 to 8 (कवायत प्रकार ५ ते ८)', nameMr: 'सामूहिक कवायत प्रकार ५ ते ८', commandCue: 'डू! ५ ते ८ कवायत प्रकार विनाचूक पूर्ण करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'pt_marching_sync', name: 'Marching in Step Rhythm (संचलनातील ताळमेळ)', nameMr: 'डावा-उजवा संचलन तालबद्धता', commandCue: 'डू! ढोलाच्या तालावर एकसाथ पाय आपटून मार्च करा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'pt_commands', name: 'Squad Commands Reaction (सावधान/विश्राम/मुड)', nameMr: 'सावधान, विश्राम, उजवे-डावे मुड', commandCue: 'डू! आज्ञा मिळताच एका सेकंदात अचूक हालचाल करा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'pt_stretching_claps', name: 'Synchronized Stretching & Clapping (टाळ्या व ताण)', nameMr: 'लयबद्ध टाळ्या व स्ट्रेचिंग', commandCue: 'डू! संपूर्ण वर्गासोबत एकसाथ टाळ्या वाजवून ताण द्या.', category: 'Mobility & Stance', maxMarks: 10 },
    { id: 'pt_posture_file', name: 'Chest Out Posture & Line Discipline (रांगेतील शिस्त)', nameMr: 'छाती पुढे, सरळ नजर व शिस्त', commandCue: 'डू! सरळ रेषेत उभे राहून शिस्त पाळा.', category: 'Mobility & Stance', maxMarks: 10 },
  ],
  'General': [
    { id: 'gen_shuttle_run', name: 'Shuttle Run Agility (शटल रन चपळता)', nameMr: '१०x४ मी. शटल रन', commandCue: 'डू! वेगात जाऊन लाकडी ठोकळा उचलून आणा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'gen_pushups', name: 'Push-up Power Form (पुश-अप्स सामर्थ्य)', nameMr: 'पुश-अप्स छाती व हातांचा जोर', commandCue: 'डू! सरळ पाठीसह सलग २० अचूक पुश-अप्स करा.', category: 'Power & Speed', maxMarks: 10 },
    { id: 'gen_plank', name: 'Core Plank Hold (प्लँक स्टॅबिलिटी)', nameMr: 'प्लँक कोर स्थिरता', commandCue: 'डू! कोपरांवर शरीर तोलून १ मिनिट स्थिर राहा.', category: 'Technique & Form', maxMarks: 10 },
    { id: 'gen_reaction', name: 'Reaction Ball Catch (प्रतिक्षिप्त क्रिया)', nameMr: 'हात-डोळे समन्वय', commandCue: 'डू! उसळणारा चेंडू न पाडता दोन्ही हातांनी पकडा.', category: 'Mobility & Stance', maxMarks: 10 },
  ]
};

const RATING_PRESETS = [
  { marks: 10, label: '🌟 अत्यंत उत्कृष्ट / Flawless', color: 'bg-emerald-600 text-white border-emerald-600', remark: 'अत्यंत उत्कृष्ट तंत्र व अचूक हालचाल.' },
  { marks: 8, label: '⭐ उत्कृष्ट / Excellent', color: 'bg-teal-600 text-white border-teal-600', remark: 'उत्कृष्ट प्रयत्न, मजबूत पकड व गती.' },
  { marks: 6, label: '👍 चांगला / Good', color: 'bg-blue-600 text-white border-blue-600', remark: 'चांगला सराव, थोडी तांत्रिक सुधारणा हवी.' },
  { marks: 4, label: '⚡ मध्यम / Average', color: 'bg-amber-600 text-white border-amber-600', remark: 'तोलावर व वेळेवर अधिक सराव हवा.' },
  { marks: 2, label: '⚠️ सुधारणा हवी / Needs Work', color: 'bg-rose-600 text-white border-rose-600', remark: 'पायाभूत हालचालींचा पुन्हा सराव करावा.' },
];

const COACH_QUICK_REMARKS = [
  'उत्कृष्ट तोल व वेग',
  'योग्य पवित्रा व आत्मविश्वास',
  'हात-पायांची अचूक हालचाल',
  'दम आणि चपळता उत्तम',
  'वेळेचा अचूक अंदाज',
  'थोडा संयम ठेवावा',
  'अधिक सरावाची आवश्यकता',
  'पाय व खांद्याचा जोर वाढवा'
];

export function GoalTracker({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [practicalMarks, setPracticalMarks] = useState<number>(8);
  const [targetMarks, setTargetMarks] = useState<number>(10);
  const [targetMetricCustom, setTargetMetricCustom] = useState("");
  const [currentPBCustom, setCurrentPBCustom] = useState("");
  const [coachRemark, setCoachRemark] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isSaving, setIsSaving] = useState(false);
  
  // View mode: 'trial' (Live Practical Deck) vs 'history' (Registry & Goals) vs 'batch' (Live Ground Roster Assessment)
  const [viewMode, setViewMode] = useState<'trial' | 'history' | 'batch'>('trial');
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (preselectedSport) setActiveSport(preselectedSport);
  }, [preselectedSport]);

  const availableSkills = useMemo(() => {
    return PRACTICAL_GAME_SKILLS[activeSport] || PRACTICAL_GAME_SKILLS['General'] || [];
  }, [activeSport]);

  useEffect(() => {
    if (availableSkills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(availableSkills[0].id);
    }
  }, [availableSkills, selectedSkillId]);

  const selectedSkill = useMemo(() => {
    return availableSkills.find(s => s.id === selectedSkillId) || availableSkills[0];
  }, [availableSkills, selectedSkillId]);

  const players = useMemo(() => 
    (store.data.players || [])
      .filter((p: any) => p.category === 'athlete' && (!activeSport || !p.sports?.length || p.sports.includes(activeSport)))
      .sort((a: any, b: any) => {
        const rollA = parseInt(a.serialNumber) || 0;
        const rollB = parseInt(b.serialNumber) || 0;
        if (rollA && rollB) return rollA - rollB;
        return (a.name || "").localeCompare(b.name || "");
      }),
    [store.data.players, activeSport]
  );

  useEffect(() => {
    if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  const selectedPlayer = useMemo(() => {
    return players.find((p: any) => p.id === selectedPlayerId);
  }, [players, selectedPlayerId]);

  const handleSavePracticalTrial = async (customPlayerId?: string, customMarks?: number) => {
    const pId = customPlayerId || selectedPlayerId;
    const pMarks = customMarks !== undefined ? customMarks : practicalMarks;
    const player = players.find((p: any) => p.id === pId);

    if (!player || !selectedSkill) {
      toast({ title: "माहिती अपूर्ण आहे", description: "कृपया खेळाडू आणि कौशल्य निवडा.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const skillName = `${selectedSkill.name}`;
      const targetStr = targetMetricCustom.trim() || `${targetMarks}/10 गुण (Target)`;
      const currentScoreStr = currentPBCustom.trim() || `${pMarks}/10 गुण (Marks)`;

      // 1. Save Goal record to registry
      await store.setGoal({
        playerId: pId,
        playerName: player.name || "Unknown",
        playerNameMarathi: player.nameMarathi || transliterateEnglishToMarathi(player.name),
        std: player.std || "---",
        rollNo: player.serialNumber || "---",
        sport: activeSport,
        metric: skillName,
        skillId: selectedSkill.id,
        currentPB: currentScoreStr,
        target: targetStr,
        practicalMarks: pMarks,
        targetMarks: targetMarks,
        remark: coachRemark || "प्रात्यक्षिक चाचणी पूर्ण.",
        month: selectedMonth,
        evaluatedAt: new Date().toISOString()
      });

      // 2. Also update student technical skill profile in store
      if (store.setSportSkill) {
        store.setSportSkill(pId, activeSport, {
          score: (pMarks * 10).toString(),
          detailedSkills: {
            [selectedSkill.name]: (pMarks * 10).toString()
          },
          playerId: pId,
          sportName: activeSport
        });
      }

      toast({ 
        title: "🎯 प्रात्यक्षिक गुण नोंदवले!", 
        description: `${player.nameMarathi || player.name} चे "${selectedSkill.nameMr || selectedSkill.name}" कौशल्याचे ${pMarks}/10 गुण जतन झाले.`,
        className: "bg-emerald-600 text-white font-bold"
      });

    } catch (error) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const goalsList = useMemo(() => {
    return (store.data.goals || [])
      .filter((g: any) => {
        const matchesSport = activeSport === 'Athletics' || g.sport === activeSport;
        const matchesPlayer = !selectedPlayerId || selectedPlayerId === 'all' || g.playerId === selectedPlayerId;
        const matchesSearch = !searchFilter || 
          (g.playerName || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
          (g.metric || "").toLowerCase().includes(searchFilter.toLowerCase());
        return matchesSport && matchesPlayer && matchesSearch;
      })
      .sort((a: any, b: any) => (b.month || "").localeCompare(a.month || ""));
  }, [store.data.goals, selectedPlayerId, activeSport, searchFilter]);

  const handlePrintScorecard = () => {
    const schoolName = getOfficialSchoolName(store);
    const signatureBlockHtml = getPrintSignatureBlockHtml(store);
    
    const printContent = `
      <html>
        <head>
          <title>Institutional Practical Skill & Target Scorecard - ${activeSport}</title>
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
            .report-type { font-weight: 900; text-transform: uppercase; text-align: center; margin-top: 10px; font-size: 13px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #444; padding: 8px 6px; text-align: center; }
            th { background-color: #f1f5f9; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #1e3a8a; }
            .name-cell { text-align: left; font-weight: 800; }
            .badge-pass { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .badge-warn { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
            .btn { cursor: pointer; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 60px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; मागे जा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट काढा (Print Roster)</button>
          </div>
          <div class="header">
            <h1>${schoolName}</h1>
            <h2>${activeSport} - ऑन-ग्राउंड प्रात्यक्षिक कौशल्य व ध्येय मूल्यमापन तक्ता</h2>
            <div class="report-type">PRACTICAL SKILL EVALUATION & TARGET SCORECARD (महिना: ${selectedMonth})</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">हजेरी</th>
                <th>खेळाडूचे नाव (Student Athlete)</th>
                <th>इयत्ता</th>
                <th>कौशल्याचे नाव (Practical Skill Tested)</th>
                <th>प्रात्यक्षिक गुण (Marks)</th>
                <th>पुढील ध्येय (Target)</th>
                <th>शेरा (Coach Note)</th>
              </tr>
            </thead>
            <tbody>
              ${goalsList.length === 0 ? `<tr><td colspan="7">कोणतीही नोंद उपलब्ध नाही.</td></tr>` : goalsList.map((g: any, idx: number) => {
                const marks = g.practicalMarks || parseFloat(g.currentPB) || 0;
                const isHigh = marks >= 8;
                return `
                  <tr>
                    <td>${g.rollNo || (idx + 1)}</td>
                    <td class="name-cell">${(g.playerNameMarathi || g.playerName || "").toUpperCase()}</td>
                    <td>Std ${g.std || '-'}</td>
                    <td style="text-align: left; font-weight: 700;">${g.metric}</td>
                    <td>
                      <span class="${isHigh ? 'badge-pass' : 'badge-warn'}">
                        <strong>${marks}/10 गुण</strong>
                      </span>
                    </td>
                    <td><strong>${g.target || '-'}</strong></td>
                    <td style="font-size: 10px; text-align: left;">${g.remark || 'उत्कृष्ट सराव'}</td>
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header with Mode Switcher */}
      <div className="bg-gradient-to-r from-blue-900 via-primary to-blue-800 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                {activeSport} - प्रात्यक्षिक चाचणी व ध्येय ट्रॅकर
              </h2>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Practical On-Ground Skills Assessment & Live Marks Deck
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/10">
          <Button
            variant={viewMode === 'trial' ? 'default' : 'ghost'}
            onClick={() => setViewMode('trial')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              viewMode === 'trial' ? "bg-amber-500 hover:bg-amber-600 text-blue-950 shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <Zap className="w-4 h-4 mr-2" /> थेट चाचणी (Live Trial)
          </Button>
          <Button
            variant={viewMode === 'batch' ? 'default' : 'ghost'}
            onClick={() => setViewMode('batch')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              viewMode === 'batch' ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <Users className="w-4 h-4 mr-2" /> सर्व खेळाडू गुण भरणा (Ground Deck)
          </Button>
          <Button
            variant={viewMode === 'history' ? 'default' : 'ghost'}
            onClick={() => setViewMode('history')}
            className={cn(
              "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              viewMode === 'history' ? "bg-white text-primary shadow-lg" : "text-white hover:bg-white/10"
            )}
          >
            <History className="w-4 h-4 mr-2" /> गुणतक्ता इतिहास (Scorecard)
          </Button>
        </div>
      </div>

      {/* 2. MODE 1: LIVE PRACTICAL TRIAL DECK */}
      {viewMode === 'trial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Skill Selection & Action Command */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 rounded-[2.5rem] p-6 shadow-xl bg-white space-y-6">
              
              {/* Step 1: Select Athlete */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> १. खेळाडू निवडा (Select Athlete)
                </label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 font-black text-primary bg-primary/5 text-base">
                    <SelectValue placeholder="खेळाडू निवडा..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {players.map((p: any) => (
                      <SelectItem key={p.id} value={p.id} className="font-bold">
                        <span className="font-black text-primary">{p.serialNumber ? `#${p.serialNumber} ` : ''}{p.nameMarathi || p.name}</span> (Std {p.std} | {p.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Select Practical Skill */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Flame className="w-4 h-4 text-amber-500" /> २. प्रात्यक्षिक कौशल्य निवडा (Select Practical Skill)
                </label>
                <div className="space-y-2">
                  <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 font-black text-base bg-amber-500/10 border-amber-500/30">
                      <SelectValue placeholder="कौशल्य निवडा..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {availableSkills.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="font-bold">
                          <span className="text-primary font-black">{s.nameMr || s.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 uppercase">({s.category})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LIVE COACH COMMAND BANNER ("डू / DO IT!") */}
              {selectedSkill && (
                <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl space-y-3 shadow-inner animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> प्रशिक्षक आज्ञा (Field Command)
                    </span>
                    <Badge variant="outline" className="font-black text-[9px] uppercase border-amber-400 text-amber-800 bg-white">
                      कमाल गुण: {selectedSkill.maxMarks}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-black text-amber-950 uppercase tracking-tight">
                    &ldquo;डू (Do it!) &mdash; {selectedSkill.nameMr || selectedSkill.name}&rdquo;
                  </h4>
                  <p className="text-xs font-bold text-amber-900 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-amber-200">
                    📢 {selectedSkill.commandCue}
                  </p>
                </div>
              )}

              {/* Month Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                  मूल्यमापन महिना (Evaluation Month)
                </label>
                <Input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)} 
                  className="h-12 border-2 rounded-xl font-black text-primary" 
                />
              </div>

            </Card>
          </div>

          {/* Right Column: Live Practical Marks (1-10) Scoring System */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-8">
              
              {/* Active Student Head Profile */}
              {selectedPlayer && (
                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border-2 border-primary/10">
                  <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={selectedPlayer.photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white font-black">
                      {(selectedPlayer.name || "?")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-primary uppercase leading-tight">
                        {selectedPlayer.nameMarathi || selectedPlayer.name}
                      </h3>
                      {selectedPlayer.serialNumber && (
                        <Badge className="bg-primary text-white font-black text-[10px]">
                          हजेरी #{selectedPlayer.serialNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Std {selectedPlayer.std} &bull; GR: {selectedPlayer.generalRegisterNumber || '---'} &bull; {selectedPlayer.gender}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      Live Trial Ready
                    </span>
                  </div>
                </div>
              )}

              {/* 1 to 10 MARKS SELECTION BAR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-primary uppercase tracking-tight flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> 
                    प्रात्यक्षिक गुण द्या (Select Practical Score out of 10):
                  </label>
                  <span className="text-2xl font-black text-primary bg-primary/10 px-4 py-1 rounded-2xl border-2 border-primary/20">
                    {practicalMarks} / 10 <span className="text-xs font-bold text-muted-foreground">गुण</span>
                  </span>
                </div>

                {/* 10-point Interactive Number Pad */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = practicalMarks === num;
                    const isHigh = num >= 8;
                    const isMid = num >= 5 && num < 8;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPracticalMarks(num);
                          const preset = RATING_PRESETS.find(r => r.marks === num) || (num >= 8 ? RATING_PRESETS[0] : num >= 6 ? RATING_PRESETS[2] : RATING_PRESETS[3]);
                          if (preset && !coachRemark) setCoachRemark(preset.remark);
                        }}
                        className={cn(
                          "h-14 rounded-2xl font-black text-lg transition-all active:scale-90 flex flex-col items-center justify-center border-2 shadow-sm",
                          isSelected
                            ? isHigh 
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-xl scale-105 ring-4 ring-emerald-200"
                              : isMid
                                ? "bg-blue-600 text-white border-blue-700 shadow-xl scale-105 ring-4 ring-blue-200"
                                : "bg-amber-600 text-white border-amber-700 shadow-xl scale-105 ring-4 ring-amber-200"
                            : "bg-white hover:bg-muted text-primary border-primary/20"
                        )}
                      >
                        <span>{num}</span>
                        <span className="text-[8px] font-bold uppercase opacity-80">{num === 10 ? 'उत्कृष्ट' : num === 8 ? 'छान' : num === 5 ? 'मध्यम' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Evaluation Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  झटपट श्रेणी पर्याय (Quick Performance Grade)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {RATING_PRESETS.map((p) => (
                    <button
                      key={p.marks}
                      type="button"
                      onClick={() => {
                        setPracticalMarks(p.marks);
                        setCoachRemark(p.remark);
                      }}
                      className={cn(
                        "p-3 rounded-2xl border-2 text-left transition-all active:scale-95 text-xs font-black uppercase flex items-center justify-between",
                        practicalMarks === p.marks
                          ? p.color + " shadow-md"
                          : "bg-muted/20 hover:bg-muted/40 text-primary border-primary/10"
                      )}
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] opacity-80">{p.marks} गुण</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Setting vs Achieved Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-5 rounded-3xl border-2 border-dashed border-primary/20">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                    सध्याचे मिळालेले गुण (Current Achieved Score)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={currentPBCustom || `${practicalMarks}/10 गुण`}
                      onChange={(e) => setCurrentPBCustom(e.target.value)}
                      placeholder="उदा. ८/१० गुण किंवा १२.५ से."
                      className="h-12 border-2 rounded-xl font-black text-primary bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">
                    पुढील ध्येय / टार्गेट (Target Goal to Achieve)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={targetMetricCustom || `${targetMarks}/10 गुण (अचूकता)`}
                      onChange={(e) => setTargetMetricCustom(e.target.value)}
                      placeholder="उदा. १०/१० गुण किंवा ११.८ से."
                      className="h-12 border-2 rounded-xl font-black text-accent bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Coach Observations / Quick Remarks */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" /> प्रशिक्षकाचा शेरा व सूचना (Coach Remark)
                </label>
                <Input
                  value={coachRemark}
                  onChange={(e) => setCoachRemark(e.target.value)}
                  placeholder="उदा. उत्कृष्ट हालचाल, अजून वेगाची गरज, संतुलन उत्तम..."
                  className="h-12 border-2 rounded-xl font-bold bg-white text-sm"
                />
                
                {/* Fast Click Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COACH_QUICK_REMARKS.map((rem) => (
                    <button
                      key={rem}
                      type="button"
                      onClick={() => setCoachRemark(rem)}
                      className="text-[10px] font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 px-3 py-1.5 rounded-full transition-all active:scale-95"
                    >
                      + {rem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={() => handleSavePracticalTrial()}
                disabled={isSaving || !selectedPlayerId}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl active-scale text-base flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    प्रात्यक्षिक गुण आणि ध्येय नोंदवा (Save Practical Score)
                  </>
                )}
              </Button>

            </Card>
          </div>

        </div>
      )}

      {/* 3. MODE 2: BATCH ON-GROUND ROSTER ASSESSMENT */}
      {viewMode === 'batch' && (
        <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                {activeSport} - खेळाडू थेट प्रात्यक्षिक गुण भरणा
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                मैदानावर एकाच वेळी सर्व {players.length} खेळाडूंची कौशल्य चाचणी घ्या व गुण नोंदवा.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-64">
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-black bg-amber-50 text-xs">
                    <SelectValue placeholder="कौशल्य निवडा..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="font-bold text-xs">
                        {s.nameMr || s.name} ({s.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrintScorecard} className="bg-primary text-white h-12 px-4 rounded-xl font-black uppercase text-xs">
                <Printer className="w-4 h-4 mr-2" /> प्रिंट
              </Button>
            </div>
          </div>

          {selectedSkill && (
            <div className="bg-primary/5 p-4 rounded-2xl border flex items-center justify-between">
              <span className="text-xs font-black text-primary uppercase">
                🎯 सध्या तपासले जाणारे कौशल्य: <strong className="text-amber-600">{selectedSkill.nameMr || selectedSkill.name}</strong>
              </span>
              <span className="text-[11px] font-bold text-muted-foreground italic">
                &ldquo;{selectedSkill.commandCue}&rdquo;
              </span>
            </div>
          )}

          <div className="space-y-4">
            {players.length === 0 ? (
              <div className="text-center py-20 opacity-30 font-black uppercase">
                या क्रीडा प्रकारात कोणतेही खेळाडू नोंदणीकृत नाहीत.
              </div>
            ) : (
              players.map((player: any) => {
                const existingGoal = (store.data.goals || []).find((g: any) => g.playerId === player.id && (g.skillId === selectedSkill?.id || g.metric?.includes(selectedSkill?.name || '')));
                const currentScore = existingGoal?.practicalMarks || 8;
                
                return (
                  <div key={player.id} className="p-4 rounded-2xl border-2 hover:border-primary transition-all bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-sm shrink-0">
                        {player.serialNumber || '#'}
                      </div>
                      <Avatar className="w-12 h-12 border shadow-sm">
                        <AvatarImage src={player.photoUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary text-white font-black text-xs">
                          {(player.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-black text-primary uppercase text-sm leading-tight">
                          {player.nameMarathi || player.name}
                        </h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          Std {player.std} &bull; GR: {player.generalRegisterNumber || '---'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border">
                        {[4, 6, 8, 9, 10].map((mk) => (
                          <button
                            key={mk}
                            type="button"
                            onClick={() => handleSavePracticalTrial(player.id, mk)}
                            className={cn(
                              "px-3 py-2 rounded-lg font-black text-xs uppercase transition-all active:scale-90",
                              currentScore === mk 
                                ? "bg-emerald-600 text-white shadow-md" 
                                : "bg-white hover:bg-muted text-primary border"
                            )}
                          >
                            {mk} गुण
                          </button>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPlayerId(player.id);
                          setViewMode('trial');
                        }}
                        variant="outline"
                        className="font-black text-[10px] uppercase h-10 rounded-xl px-3 border-primary/20"
                      >
                        तपशील <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* 4. MODE 3: HISTORY SCORECARD & TARGET LOGS */}
      {viewMode === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border-2 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary uppercase">प्रात्यक्षिक गुण व ध्येय इतिहास</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{goalsList.length} नोंदी उपलब्ध</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="खेळाडू किंवा कौशल्य शोधा..."
                  className="pl-9 h-11 rounded-xl text-xs"
                />
              </div>
              <Button onClick={handlePrintScorecard} className="bg-primary text-white h-11 px-4 rounded-xl font-black uppercase text-xs shadow-md">
                <Printer className="w-4 h-4 mr-2" /> प्रिंट
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalsList.length === 0 ? (
              <div className="col-span-2 py-24 text-center opacity-30 border-4 border-dashed rounded-[2.5rem] bg-white">
                <Target className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">कोणतेही प्रात्यक्षिक ध्येय नोंदवलेले नाही.</p>
              </div>
            ) : (
              goalsList.map((g: any) => {
                const marks = g.practicalMarks || parseFloat(g.currentPB) || 0;
                const percent = Math.min(100, Math.round((marks / (g.targetMarks || 10)) * 100));
                return (
                  <Card key={g.id} className="border-2 rounded-[2rem] p-6 shadow-md bg-white hover:border-primary/40 transition-all space-y-4 relative overflow-hidden group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-amber-700 text-base">
                          {g.rollNo ? `#${g.rollNo}` : '🏅'}
                        </div>
                        <div>
                          <h4 className="font-black text-primary uppercase text-base leading-tight">
                            {g.playerNameMarathi || g.playerName}
                          </h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            Std {g.std || '-'} &bull; {g.sport}
                          </p>
                        </div>
                      </div>

                      <Badge className={cn(
                        "font-black text-[10px] uppercase px-3 py-1",
                        marks >= 8 ? "bg-emerald-600 text-white" : marks >= 5 ? "bg-blue-600 text-white" : "bg-amber-600 text-white"
                      )}>
                        {marks} / 10 गुण
                      </Badge>
                    </div>

                    <div className="bg-muted/20 p-3.5 rounded-2xl border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-primary">{g.metric}</span>
                        <span className="font-bold text-muted-foreground text-[10px]">{g.month}</span>
                      </div>
                      <Progress value={percent} className="h-2 bg-muted rounded-full" />
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                        <span>मिळालेले गुण: <strong className="text-primary">{g.currentPB}</strong></span>
                        <span>ध्येय: <strong className="text-accent">{g.target}</strong></span>
                      </div>
                    </div>

                    {g.remark && (
                      <p className="text-[11px] font-bold text-muted-foreground italic bg-primary/5 p-2.5 rounded-xl border border-primary/5">
                        💬 &ldquo;{g.remark}&rdquo;
                      </p>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => store.deleteGoal(g.id)}
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 rounded-full hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
