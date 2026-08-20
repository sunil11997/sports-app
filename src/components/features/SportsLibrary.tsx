
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  ShieldCheck, 
  BookOpen, 
  Upload, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Loader2,
  Eye,
  Download,
  Printer,
  Share2,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Trophy,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, transliterateEnglishToMarathi, shareToWhatsApp, getOfficialSchoolName, getPrintSignatureBlockHtml } from '@/lib/utils';
import { format } from 'date-fns';

// ==========================================
// 1. AUTHENTIC OFFICIAL RULES TAXONOMY
// ==========================================
export interface OfficialSportRule {
  sport: string;
  sportMr: string;
  category: 'Team Sports' | 'Track & Field' | 'Throws & Jumps' | 'Fitness & Yoga';
  courtDimensions: string;
  playerCount: string;
  duration: string;
  rules: { title: string; desc: string; descMr: string }[];
}

export const OFFICIAL_RULES_DATA: OfficialSportRule[] = [
  {
    sport: "Kabaddi",
    sportMr: "कबड्डी (Kabaddi)",
    category: "Team Sports",
    courtDimensions: "१३ x १० मीटर (मुले) / १२ x ८ मीटर (मुली)",
    playerCount: "७ मुख्य + ५ राखीव (एकूण १२ खेळाडू)",
    duration: "२०-२० मिनिटांचे २ अर्धवेळ (५ मि. मध्यांतर)",
    rules: [
      {
        title: "Raid Limit (चढाई मर्यादा)",
        desc: "Each raid has a strict 30-second time limit with continuous 'Kabaddi' chant.",
        descMr: "प्रत्येक चढाईसाठी ३० सेकंदांची वेळ असते. चढाईदरम्यान अखंड 'कबड्डी' उच्चार (Cant) आवश्यक आहे."
      },
      {
        title: "Bonus Line (बोनस रेषा)",
        desc: "Bonus point is active only when 6 or 7 defenders are on court.",
        descMr: "मैदानावर ६ किंवा ७ डिफेंडर्स हजर असतानाच बोनस रेषा ओलांडल्यास १ अतिरिक्त गुण मिळतो."
      },
      {
        title: "Super Tackle (सुपर टॅकल)",
        desc: "3 or fewer defenders tackling the raider earn 2 points instead of 1.",
        descMr: "मैदानावर ३ किंवा त्यापेक्षा कमी डिफेंडर्स असताना रेडरला पकडल्यास २ गुण (सुपर टॅकल) मिळतात."
      },
      {
        title: "Do-or-Die Raid (करा किंवा मरा)",
        desc: "Third consecutive empty raid results in out if point is not scored.",
        descMr: "सलग दोन रिक्त चढायांनंतर तिसरी चढाई 'Do or Die' असते; गुण न मिळवल्यास रेडर बाद होतो."
      },
      {
        title: "Lobby Entry (लॉबी नियम)",
        desc: "Lobby becomes active only after a struggle (body touch) occurs.",
        descMr: "रेडर व डिफेंडर यांच्यात स्पर्श झाल्यानंतरच लॉबीचा भाग मैदानाचा भाग मानला जातो."
      },
      {
        title: "All Out (लोण)",
        desc: "All out yields 2 bonus points to the opposing team.",
        descMr: "प्रतिस्पर्धी संघ सर्व बाद (All Out) झाल्यास २ अतिरिक्त लोणचे गुण मिळतात."
      }
    ]
  },
  {
    sport: "Volleyball",
    sportMr: "व्हॉलीबॉल (Volleyball)",
    category: "Team Sports",
    courtDimensions: "१८ x ९ मीटर (नेट उंची: २.४३ मी मुले / २.२४ मी मुली)",
    playerCount: "६ मुख्य + ६ राखीव (एकूण १२ खेळाडू)",
    duration: "सर्वोत्तम ५ सेट्स (Best of 5)",
    rules: [
      {
        title: "Scoring System (गुण पद्धत)",
        desc: "First 4 sets played to 25 points; 5th deciding set played to 15 points (2-point lead).",
        descMr: "पहिले ४ सेट्स २५ गुणांचे असतात; ५ वा निर्णायक सेट १५ गुणांचा असतो (२ गुणांची आघाडी आवश्यक)."
      },
      {
        title: "Touch Limit (३ टचेस मर्यादा)",
        desc: "Maximum 3 touches per side before crossing the net. One player cannot touch twice consecutively.",
        descMr: "चेंडू दुसऱ्या बाजूला पाठवण्यापूर्वी जास्तीत जास्त ३ टचेसची मुभा असते. एक खेळाडू सलग दोनदा स्पर्श करू शकत नाही."
      },
      {
        title: "Rotation (घड्याळाच्या दिशेने रोटेशन)",
        desc: "Players rotate clockwise after winning a point on the opponent serve.",
        descMr: "प्रतिस्पर्ध्याच्या सर्व्हिसवर गुण मिळवल्यानंतर संघ घड्याळाच्या काट्याच्या दिशेने (Clockwise) फिरतो."
      },
      {
        title: "Libero Role (लिबेरो नियम)",
        desc: "Specialized defensive player wearing contrasting jersey; cannot serve or spike above net.",
        descMr: "वेगळ्या रंगाची जर्सी घातलेला डिफेन्स स्पेशालिस्ट खेळाडू; लिबेरोला सर्व्हिस किंवा स्पाईक करता येत नाही."
      },
      {
        title: "Net Foul (नेट फाऊल)",
        desc: "Touching the net during active play is a foul resulting in point to opponent.",
        descMr: "खेळ चालू असताना शरीराचा कोणताही भाग नेटला लागल्यास फाऊल होऊन प्रतिस्पर्ध्याला गुण मिळतो."
      }
    ]
  },
  {
    sport: "Kho Kho",
    sportMr: "खो-खो (Kho Kho)",
    category: "Team Sports",
    courtDimensions: "२७ x १६ मीटर (सिनिअर) / १४ x १६ मीटर (ज्युनिअर)",
    playerCount: "९ मुख्य + ३ राखीव (एकूण १२ खेळाडू)",
    duration: "२ डाव प्रत्येकी ९ मिनिटांचे (९-३-९ मि. स्वरूप)",
    rules: [
      {
        title: "Chaser Sitting (चेसर्स बैठक)",
        desc: "8 chasers sit in middle squares facing alternate directions, 1 active chaser starts.",
        descMr: "८ चेसर्स मध्यभागी विरुद्ध दिशांना तोंड करून बसतात आणि १ चेसर पोलजवळून पाठलाग सुरू करतो."
      },
      {
        title: "Giving Kho (खो देण्याची पद्धत)",
        desc: "Active chaser must touch the sitting player's back with hands and utter 'Kho' loudly.",
        descMr: "बसलेल्या खेळाडूच्या पाठीवर हात टेकवून मोठ्याने 'खो' उच्चार करूनच खो देता येतो."
      },
      {
        title: "Direction Rule (दिशेचा नियम)",
        desc: "Once a chaser takes a direction, they cannot turn back until reaching the pole/cross-lane.",
        descMr: "चेसरने एकदा खांद्याची दिशा निश्चित केल्यावर पोल गाठल्याशिवाय उलट दिशेने मागे वळता येत नाही."
      },
      {
        title: "Pole Turning & Diving (पोल टर्निंग)",
        desc: "Using the pole to change direction or diving across the center line is valid.",
        descMr: "पोलचा आधार घेऊन दिशा बदलणे आणि पोल डायव्ह मारणे वैध मानले जाते."
      }
    ]
  },
  {
    sport: "Handball",
    sportMr: "हँडबॉल (Handball)",
    category: "Team Sports",
    courtDimensions: "४० x २० मीटर (गोल पोस्ट: ३ x २ मीटर)",
    playerCount: "७ मुख्य (६ कोर्ट + १ गोलकीपर) + ७ राखीव",
    duration: "३०-३० मिनिटांचे २ अर्धवेळ (१० मि. मध्यांतर)",
    rules: [
      {
        title: "3-Step / 3-Second Rule (३ स्टेप्स / ३ सेकंद नियम)",
        desc: "Players may take a maximum of 3 steps and hold ball for maximum 3 seconds without dribbling.",
        descMr: "ड्रिबलिंग न करता चेंडू हातात घेऊन जास्तीत जास्त ३ पावले चालता येते आणि ३ सेकंद चेंडू धरता येतो."
      },
      {
        title: "Goal Area D-Zone (६ मीटर डी-झोन)",
        desc: "Only the goalkeeper is allowed inside the 6m line. Jump shots must be released in air before landing.",
        descMr: "६-मीटर गोल क्षेत्रात केवळ गोलकीपरला प्रवेश असतो. जंप शॉट मारताना जमिनीवर पाय टेकण्याआधी चेंडू सोडावा लागतो."
      },
      {
        title: "Passive Play (निष्क्रिय खेळ)",
        desc: "Holding the ball without an active attempt to attack results in loss of possession.",
        descMr: "गोल करण्याचा प्रयत्न न करता वेळकाढूपणा केल्यास रेफ्री तांत्रिक फाऊल देऊन चेंडू प्रतिस्पर्ध्याला देतात."
      }
    ]
  },
  {
    sport: "Running",
    sportMr: "धावणे व रिले (Athletics Running)",
    category: "Track & Field",
    courtDimensions: "४०० मीटर स्टँडर्ड ट्रॅक (८/६ लेन्स)",
    playerCount: "वैयक्तिक / ४ खेळाडू (रिले संघ)",
    duration: "इव्हेंटनुसार (१००मी, २००मी, ४००मी, रिले)",
    rules: [
      {
        title: "False Start (चुकीची सुरुवात)",
        desc: "Any movement before the start gun fires results in immediate disqualification.",
        descMr: "स्टार्टरची बंदूक वाजण्यापूर्वी हालचाल केल्यास (False Start) खेळाडू थेट अपात्र ठरतो."
      },
      {
        title: "Lane Discipline (लेन शिस्त)",
        desc: "Runners must strictly remain within their allocated lane for 100m, 200m, and 400m races.",
        descMr: "१००मी, २००मी आणि ४००मी शर्यतीत धावपटूने आपल्या स्वतःच्या लेनमध्येच धावणे बंधनकारक आहे."
      },
      {
        title: "Relay Baton Exchange (बॅटन देवाणघेवाण)",
        desc: "Baton must be passed strictly within the 20-meter exchange zone box.",
        descMr: "४x१०० रिलेमध्ये २०-मीटर बॅटन एक्सचेंज झोनमध्येच बॅटन पुढच्या धावपटूकडे सोपवणे आवश्यक आहे."
      },
      {
        title: "Finish Line Torso (फिनिशिंग नियम)",
        desc: "Timing stops when the runner's torso (chest) crosses the vertical plane of the finish line.",
        descMr: "धावपटूची छाती (Torso) फिनिशिंग लाईन ओलांडताच वेळ नोंदवली जाते."
      }
    ]
  },
  {
    sport: "Shot Put",
    sportMr: "गोळाफेक (Shot Put)",
    category: "Throws & Jumps",
    courtDimensions: "२.१३५ मीटर वर्तुळ (३४.९२° लँडिंग सेक्टर)",
    playerCount: "वैयक्तिक सहभाग (३ ते ६ प्रयत्ने)",
    duration: "प्रत्येक थ्रोसाठी ६० सेकंदांची वेळ",
    rules: [
      {
        title: "Chin Placement & Grip (मानेजवळ पकड)",
        desc: "The shot must be held at the base of the neck with one hand until release.",
        descMr: "फेकण्यापूर्वी गोळा एका हाताने मानेजवळ / हनुवटीखाली चिकटवून ठेवणे अनिवार्य आहे."
      },
      {
        title: "Circle Boundary (वर्तुळ शिस्त)",
        desc: "Thrower cannot touch top of iron ring or step outside circle during the throw.",
        descMr: "गोळा फेकताना लोखंडी रिंगच्या वर पाय टेकवणे किंवा वर्तुळाबाहेर पाऊल टाकणे फाऊल मानले जाते."
      },
      {
        title: "Rear Exit (मागून बाहेर पडणे)",
        desc: "Athlete must exit from the rear half of the circle only after shot lands.",
        descMr: "गोळा जमिनीवर पडल्यानंतरच खेळाडूने वर्तुळाच्या मागील पांढऱ्या रेषेमागून बाहेर पडावे."
      }
    ]
  },
  {
    sport: "Javelin Throw",
    sportMr: "भालाफेक (Javelin Throw)",
    category: "Throws & Jumps",
    courtDimensions: "३०-३६ मीटर रनवे (२९° लँडिंग सेक्टर)",
    playerCount: "वैयक्तिक सहभाग (३ ते ६ प्रयत्ने)",
    duration: "प्रत्येक थ्रोसाठी ६० सेकंद",
    rules: [
      {
        title: "Grip & Delivery (भाला फेकण्याची दिशा)",
        desc: "Javelin must be held at the grip cord and thrown over the shoulder or upper arm.",
        descMr: "भाला ग्रिप दोरीवरच धरून खांद्यावरून किंवा हाताच्या वरून सरळ पुढे फेकला पाहिजे."
      },
      {
        title: "Tip Landing (टिपचा पहिला स्पर्श)",
        desc: "The metal tip must strike the ground first inside the sector lines to be valid.",
        descMr: "भाला वैध ठरण्यासाठी भाल्याचे धातूचे टोक (Metal Tip) सेक्टरमध्ये जमिनीवर प्रथम टेकणे आवश्यक आहे."
      },
      {
        title: "No 360 Spin (गोल फिरणे निषिद्ध)",
        desc: "Athletes cannot turn their back completely to the throwing sector during run-up.",
        descMr: "भाला फेकताना शरीराचा पूर्ण ३६०° फिरणारा राऊंड (Spin) मारणे कडक निषिद्ध आहे."
      }
    ]
  },
  {
    sport: "Long Jump",
    sportMr: "लांब उडी (Long Jump)",
    category: "Throws & Jumps",
    courtDimensions: "४० मीटर रनवे &bull; १.२२ मी टेक-ऑफ बोर्ड &bull; ९ x २.७५ मी सँड पिट",
    playerCount: "वैयक्तिक सहभाग",
    duration: "प्रत्येक उडीसाठी ६० सेकंद",
    rules: [
      {
        title: "Take-off Line (टेक-ऑफ बोर्ड रेषा)",
        desc: "Jumping foot must not exceed the plasticine indicator edge of the board.",
        descMr: "उडी मारताना खेळाडूचा पाय टेक-ऑफ बोर्डच्या पुढील प्लास्टिकिन रेषेच्या पुढे गेल्यास फाऊल होतो."
      },
      {
        title: "Sand Measurement (अंतर मोजणे)",
        desc: "Distance measured from board edge to the nearest impression made in sand by any body part.",
        descMr: "शरीराचा कोणताही भाग (हात किंवा कंबर) वाळूत जेथे सर्वात मागे टेकला तेथून टेक-ऑफ बोर्डपर्यंत अंतर मोजले जाते."
      }
    ]
  },
  {
    sport: "Yoga",
    sportMr: "योगासने व प्राणायाम (Yoga & Asanas)",
    category: "Fitness & Yoga",
    courtDimensions: "योग मॅट (६ x २ फूट जागा)",
    playerCount: "वैयक्तिक / सांघिक प्रात्यक्षिक",
    duration: "आसन स्थिती: ३० ते ६० सेकंद स्थिर",
    rules: [
      {
        title: "Sthiram Sukham Asanam (स्थिरता व संतुलन)",
        desc: "Asana must be held steadily without body shaking or straining breath.",
        descMr: "आसन स्थितीत शरीर न डगमगता स्थिर व शांत ठेवणे आणि श्वास संथ चालू ठेवणे आवश्यक आहे."
      },
      {
        title: "Alignment & Grace (अचूक अंगस्थिती)",
        desc: "Spine straightness, leg extension, and eye focus (Drishti) are graded out of 10.",
        descMr: "पाठीचा कणा ताठ, हातापायांची अचूक ताणलेली स्थिती आणि दृष्टी एकाग्रतेवर गुण दिले जातात."
      }
    ]
  }
];

// ==========================================
// 2. MAIN SPORTS LIBRARY COMPONENT
// ==========================================
export function SportsLibrary({ 
  store, 
  type = 'rules',
  preselectedSport 
}: { 
  store: any, 
  type?: 'rules' | 'drills' | 'videos',
  preselectedSport?: string 
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedSport, setSelectedSport] = useState<string>(preselectedSport || "All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSportForUpload, setSelectedSportForUpload] = useState<string>("Kabaddi");

  // In-App PDF Viewer Dialog State
  const [activePdfData, setActivePdfData] = useState<{ url: string; title: string; sport: string } | null>(null);

  // Upload Form Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocTitle, setUploadDocTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("अधिकृत नियम पुस्तिका (Official Rulebook)");

  useEffect(() => {
    if (preselectedSport) setSelectedSport(preselectedSport);
  }, [preselectedSport]);

  const sportsFilterList = ['All', 'Kabaddi', 'Volleyball', 'Kho Kho', 'Handball', 'Running', 'Shot Put', 'Javelin Throw', 'Long Jump', 'Yoga'];

  // Filtered Rules List
  const filteredRules = useMemo(() => {
    return OFFICIAL_RULES_DATA.filter((r) => {
      if (selectedSport !== 'All' && r.sport !== selectedSport) return false;
      if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSport = r.sport.toLowerCase().includes(q) || r.sportMr.toLowerCase().includes(q);
        const matchRule = r.rules.some(ru => ru.title.toLowerCase().includes(q) || ru.descMr.toLowerCase().includes(q));
        if (!matchSport && !matchRule) return false;
      }
      return true;
    });
  }, [selectedSport, selectedCategory, searchQuery]);

  // Handle PDF File Select & Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ 
        title: "चुकीची फाईल निवडली", 
        description: "कृपया केवळ अधिकृत PDF (.pdf) फाईल निवडा.", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB Limit
      toast({ 
        title: "फाईल खूप मोठी आहे", 
        description: "कृपया १० MB पेक्षा लहान आकाराची PDF निवडा.", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const docTitle = uploadDocTitle || `${selectedSportForUpload} अधिकृत नियम पुस्तिका`;
      
      // Save in Firestore / Store
      store.setGameRule(selectedSportForUpload, base64String);

      toast({ 
        title: "📄 PDF यशस्वीरित्या अपलोड झाली!", 
        description: `${selectedSportForUpload} ची '${docTitle}' डिजिटल लायब्ररीमध्ये जोडली गेली.`,
        className: "bg-emerald-600 text-white font-bold"
      });

      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadDocTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // WhatsApp Share Rules
  const handleWhatsAppShareRule = (ruleItem: OfficialSportRule) => {
    const profile = store.data.schoolProfile;
    const rulesText = ruleItem.rules.map((r, i) => `${i + 1}. *${r.title}*:\n${r.descMr}`).join('\n\n');
    const schoolName = profile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा';
    const teacherName = profile?.teacherName || 'क्रीडा शिक्षक';

    const message = `*${schoolName}*\n*क्रीडा अधिकृत नियम पुस्तिका (Official Sports Rulebook)*\n\n*खेळ:* ${ruleItem.sportMr}\n*क्रीडा शिक्षक:* ${teacherName}\n------------------------------\n*📍 मैदान मोजमाप:* ${ruleItem.courtDimensions}\n*👥 खेळाडू संख्या:* ${ruleItem.playerCount}\n*⏱️ वेळ / कालावधी:* ${ruleItem.duration}\n------------------------------\n*अधिकृत नियम:*\n${rulesText}\n------------------------------\nवाघंबा स्पोर्ट्स हब डिजिटल लायब्ररी`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download PDF Locally
  const handleDownloadPdf = (pdfData: string, sport: string) => {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = `Waghamba_Sports_${sport}_Official_Rulebook.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "PDF डाऊनलोड सुरू झाली!",
      description: `${sport} ची नियम पुस्तिका तुमच्या डिव्हाइसवर सेव्ह होत आहे.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <BookOpen className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
                  क्रीडा नियम व परिपत्रके डिजिटल ग्रंथालय (Sports Library & PDFs)
                </h2>
                <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5">
                  Official SGFI & DSO
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Upload & Read PDF Circulars &bull; Ground Dimensions &bull; Rulebook Repository
              </p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="relative z-10 flex items-center gap-3">
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-12 px-6 rounded-2xl uppercase text-xs tracking-wider shadow-xl active-scale flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> PDF परिपत्रक / नियम अपलोड करा
          </Button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Sport Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border shadow-inner overflow-x-auto scrollbar-hide">
          {sportsFilterList.map(sport => (
            <button
              key={sport}
              type="button"
              onClick={() => setSelectedSport(sport)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all",
                selectedSport === sport
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-200"
              )}
            >
              {sport === 'All' ? 'सर्व खेळ' : sport}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खेळाचे नाव किंवा नियम शोधा..."
            className="pl-9 h-11 rounded-2xl text-xs font-bold border-2 bg-white"
          />
        </div>
      </div>

      {/* 3. Main Rulebooks & Uploaded PDF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((item) => {
          const hasPdf = !!store.data.gameRules?.[item.sport];
          const pdfData = store.data.gameRules?.[item.sport]?.pdfData;

          return (
            <Card key={item.sport} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/40 transition-all flex flex-col group">
              
              {/* Card Header */}
              <CardHeader className="bg-slate-50 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <Badge className="bg-blue-100 text-blue-900 font-black text-[8px] uppercase px-2 mb-1">
                    {item.category}
                  </Badge>
                  <CardTitle className="text-lg font-black text-slate-900 uppercase">
                    {item.sportMr}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedSportForUpload(item.sport);
                      setIsUploadModalOpen(true);
                    }}
                    className="h-9 px-3 rounded-xl border-2 font-black text-[10px] uppercase text-primary hover:bg-primary hover:text-white"
                    title="PDF अपलोड करा"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleWhatsAppShareRule(item)}
                    className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                    title="WhatsApp वर शेअर करा"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Card Body */}
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Court & Players Dimensions ribbon */}
                <div className="bg-slate-50 p-3 rounded-2xl border text-[11px] font-bold text-slate-800 space-y-1">
                  <p><strong className="text-primary uppercase text-[9px] block">📍 मैदान मोजमाप:</strong> {item.courtDimensions}</p>
                  <p><strong className="text-primary uppercase text-[9px] block">👥 खेळाडू संख्या:</strong> {item.playerCount}</p>
                  <p><strong className="text-primary uppercase text-[9px] block">⏱️ वेळ / कालावधी:</strong> {item.duration}</p>
                </div>

                {/* Uploaded PDF Highlight Ribbon */}
                {hasPdf && (
                  <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-300 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">अधिकृत PDF संलग्न</p>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Verified Document</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => setActivePdfData({ url: pdfData, title: `${item.sport} अधिकृत नियम पुस्तिका`, sport: item.sport })}
                        className="h-8 bg-primary hover:bg-primary/90 text-white font-black text-[9px] uppercase rounded-lg px-2.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> वाचा
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPdf(pdfData, item.sport)}
                        className="h-8 border-2 font-black text-[9px] uppercase rounded-lg px-2"
                        title="डाऊनलोड करा"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => store.setGameRule(item.sport, null)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                        title="PDF हटवा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Key Rules List */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block ml-1">
                    महत्त्वाचे अधिकृत नियम (Official Key Rules):
                  </span>
                  <div className="space-y-2">
                    {item.rules.slice(0, 3).map((r, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50/70 rounded-xl border text-xs">
                        <span className="font-black text-slate-900 block mb-0.5">{r.title}</span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">{r.descMr}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>

            </Card>
          );
        })}
      </div>

      {/* 4. Upload PDF Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-primary flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" /> क्रीडा PDF / परिपत्रक अपलोड
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                १. खेळाचा प्रकार निवडा (Select Sport):
              </label>
              <Select value={selectedSportForUpload} onValueChange={setSelectedSportForUpload}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-xs bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OFFICIAL_RULES_DATA.map(r => (
                    <SelectItem key={r.sport} value={r.sport}>{r.sportMr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                २. दस्तऐवजाचे नाव / शीर्षक (Title):
              </label>
              <Input 
                value={uploadDocTitle}
                onChange={(e) => setUploadDocTitle(e.target.value)}
                placeholder="उदा. DSO क्रीडा स्पर्धा नियम पुस्तिका २०२६..."
                className="h-11 border-2 rounded-xl text-xs font-bold"
              />
            </div>

            {/* Hidden File Input & Trigger Box */}
            <input 
              type="file" 
              accept="application/pdf" 
              ref={fileInputRef} 
              onChange={handlePdfUpload} 
              className="hidden" 
              id="sports-pdf-file-picker"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-primary/40 rounded-2xl text-center bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer space-y-2"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm text-primary">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <FileText className="w-6 h-6" />}
              </div>
              <p className="text-xs font-black uppercase text-primary">
                {isUploading ? "PDF अपलोड होत आहे..." : "PDF निवडा किंवा ड्रॅग करा"}
              </p>
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                जास्तीत जास्त आकार: १० MB (.pdf)
              </span>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsUploadModalOpen(false)} 
              className="w-full rounded-xl font-black uppercase text-xs"
            >
              रद्द करा (Cancel)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. In-App Built-In Full-Screen PDF Viewer & Reader Modal */}
      <Dialog open={!!activePdfData} onOpenChange={() => setActivePdfData(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] rounded-3xl p-0 overflow-hidden border-none shadow-3xl flex flex-col bg-slate-900">
          
          {/* Reader Top Bar */}
          <DialogHeader className="p-4 bg-slate-950 text-white flex flex-row items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-400" />
              <div>
                <DialogTitle className="text-sm font-black uppercase tracking-tight text-white leading-none">
                  {activePdfData?.title || 'क्रीडा अधिकृत नियम PDF'}
                </DialogTitle>
                <span className="text-[9px] font-bold text-white/60 uppercase">{activePdfData?.sport}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activePdfData && (
                <Button 
                  size="sm"
                  onClick={() => handleDownloadPdf(activePdfData.url, activePdfData.sport)}
                  className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9px] uppercase rounded-lg px-3"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> डाऊनलोड
                </Button>
              )}
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => setActivePdfData(null)}
                className="h-8 text-white hover:bg-white/10 rounded-lg text-xs font-black uppercase"
              >
                बंद करा ✕
              </Button>
            </div>
          </DialogHeader>

          {/* Iframe Embedded PDF Viewer */}
          <div className="flex-1 w-full h-full bg-slate-800 relative">
            {activePdfData && (
              <iframe
                src={activePdfData.url}
                title={activePdfData.title}
                className="w-full h-full border-0"
              />
            )}
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}
