"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layout, 
  PenTool, 
  Plus, 
  Save, 
  ChevronRight, 
  CirclePlay,
  ShieldCheck,
  Zap,
  Trash2,
  Maximize2,
  Sword,
  ShieldHalf,
  Gamepad2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STANDARD_STRATEGIES: Record<string, any[]> = {
  'Kabaddi': [
    { title: '५-१-१ डिफेन्स सेटअप', type: 'Defense', intensity: 'High', desc: 'डिफेंडरची साखळी आणि कोपरं सांभाळण्याची रणनीती. जेव्हा बोनस ऑन असतो तेव्हा ही वापरतात.', img: 'https://picsum.photos/seed/kdef1/600/400' },
    { title: '३-२-२ कव्वर पॅटर्न', type: 'Defense', intensity: 'Extreme', desc: 'मधल्या डिफेंडर्सनी रेडरला घेरण्याची रणनीती. अत्यंत वेगवान हालचाल आवश्यक.', img: 'https://picsum.photos/seed/kdef2/600/400' },
    { title: 'बोनस एस्केप अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'रेडरने बोनस घेताना कोपऱ्यातून पळून जाण्याचे तंत्र.', img: 'https://picsum.photos/seed/koff1/600/400' },
    { title: 'साखळी पकड (Chain Tackle)', type: 'Defense', intensity: 'High', desc: 'दोन खेळाडूंनी हात धरून रेडरला घेरण्याची आणि डॅश करण्याची पद्धत.', img: 'https://picsum.photos/seed/k4/600/400' },
    { title: 'थाई होल्ड ट्रॅप', type: 'Defense', intensity: 'Moderate', desc: 'रेडरच्या मांडीला पकडून त्याला जागेवर रोखण्याचे तंत्र.', img: 'https://picsum.photos/seed/k5/600/400' },
    { title: 'अँकल होल्ड टाइमिंग', type: 'Defense', intensity: 'High', desc: 'रेडर जेव्हा पाय टाकतो तेव्हा नेमका घोटा पकडण्याची कला.', img: 'https://picsum.photos/seed/k6/600/400' },
    { title: 'दुबकी मास्टरक्लास', type: 'Offense', intensity: 'Extreme', desc: 'डिफेंडरच्या साखळीखालून सरपटत निसटण्याचे रेडरचे सर्वात कठीण तंत्र.', img: 'https://picsum.photos/seed/k7/600/400' },
    { title: 'फ्रॉग जंप (Frog Jump)', type: 'Offense', intensity: 'Extreme', desc: 'डिफेंडरच्या वरून उडी मारून मध्यरेषेकडे जाण्याची रणनीती.', img: 'https://picsum.photos/seed/k8/600/400' },
    { title: 'रनिंग हॅन्ड टच', type: 'Offense', intensity: 'High', desc: 'वेगात धावत असताना हाताने डिफेंडरला स्पर्श करून पळणे.', img: 'https://picsum.photos/seed/k9/600/400' },
    { title: 'कॉर्नर अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'कोपऱ्यातील डिफेंडरवर दबाव टाकून त्याला बाद करण्याचा प्रयत्न.', img: 'https://picsum.photos/seed/k10/600/400' },
    { title: 'डू ऑर डाय रेड (Do or Die)', type: 'Strategy', intensity: 'High', desc: 'जेव्हा गुण मिळवणे अनिवार्य असते तेव्हा संयम आणि वेग यांचा ताळमेळ.', img: 'https://picsum.photos/seed/k11/600/400' },
    { title: 'एम्प्टी रेड मॅनेजमेंट', type: 'Strategy', intensity: 'Low', desc: 'वेळ घालवण्यासाठी आणि विरोधी टीमला थकावण्यासाठी केलेली सुरक्षित रेड.', img: 'https://picsum.photos/seed/k12/600/400' },
    { title: 'सुपर टॅकल सेटअप', type: 'Defense', intensity: 'High', desc: 'जेव्हा ३ खेळाडू असतात तेव्हा रेडरला फसवून पकडण्याची पद्धत.', img: 'https://picsum.photos/seed/k13/600/400' },
    { title: 'ऑल आऊट पुश', type: 'Strategy', intensity: 'High', desc: 'विरोधी टीमच्या शेवटच्या खेळाडूला बाद करून जास्तीचे २ गुण मिळवणे.', img: 'https://picsum.photos/seed/k14/600/400' },
    { title: 'लॉबी एस्केप', type: 'Offense', intensity: 'Moderate', desc: 'टच केल्यानंतर लॉबीचा वापर करून सुरक्षितरीत्या मध्यरेषेकडे जाणे.', img: 'https://picsum.photos/seed/k15/600/400' }
  ],
  'Volleyball': [
    { title: '६-२ रोटेशन पॅटर्न', type: 'Rotation', intensity: 'Moderate', desc: 'दोन सेटर वापरून आक्रमणाची धार वाढवण्याची पद्धत.', img: 'https://picsum.photos/seed/v1/600/400' },
    { title: 'ट्रिपल ब्लॉक कव्हरेज', type: 'Defense', intensity: 'High', desc: 'प्रतिस्पर्धी स्पायकरला रोखण्यासाठी तीन खेळाडूंनी एकत्र उडी मारणे.', img: 'https://picsum.photos/seed/v2/600/400' },
    { title: 'जंप सर्व्ह पीक', type: 'Offense', intensity: 'High', desc: 'उडी मारून सर्व्हिस करून बॉलची गती आणि दिशा बदलण्याचे तंत्र.', img: 'https://picsum.photos/seed/v3/600/400' },
    { title: 'लिबेरो कव्हरेज', type: 'Defense', intensity: 'Moderate', desc: 'मैदानाच्या मागील भागात बॉल सुरक्षितरीत्या उचलण्याची लिबेरोची जबाबदारी.', img: 'https://picsum.photos/seed/v4/600/400' },
    { title: 'क्विक सेट अटॅक', type: 'Offense', intensity: 'High', desc: 'सेटरने वेगात दिलेल्या बॉलवर लगेच स्पाईक करण्याची पद्धत.', img: 'https://picsum.photos/seed/v5/600/400' },
    { title: 'बॅक रो अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'अटॅक लाईनच्या मागून उडी मारून स्पाईक करण्याची रणनीती.', img: 'https://picsum.photos/seed/v6/600/400' },
    { title: 'क्रॉस कोर्ट स्पाईक', type: 'Offense', intensity: 'High', desc: 'बॉल मैदानाच्या कोपऱ्यात तिरका मारून गुण मिळवण्याचे तंत्र.', img: 'https://picsum.photos/seed/v7/600/400' },
    { title: 'लाईन शॉट प्रिसीजन', type: 'Offense', intensity: 'High', desc: 'ब्लॉकला फसवून बॉल थेट साईड लाईनवर मारण्याची कला.', img: 'https://picsum.photos/seed/v8/600/400' },
    { title: 'डंप ओव्हर नेट', type: 'Offense', intensity: 'Low', desc: 'सेटरने अचानक बॉल स्पाईक न करता हळूच दुसऱ्या बाजूला टाकणे.', img: 'https://picsum.photos/seed/v9/600/400' },
    { title: 'डिगिंग डिफेन्स', type: 'Defense', intensity: 'Moderate', desc: 'वेगात येणारा बॉल हातांच्या साहाय्याने सुरक्षित उचलणे.', img: 'https://picsum.photos/seed/v10/600/400' },
    { title: 'पॅनकेक सेव्ह', type: 'Defense', intensity: 'Extreme', desc: 'जमिनीला स्पर्श होणाऱ्या बॉलखाली तळहात ठेवून बॉल उचलण्याचे कठीण तंत्र.', img: 'https://picsum.photos/seed/v11/600/400' },
    { title: 'फ्लोट सर्व्ह व्हेरिएशन', type: 'Offense', intensity: 'Low', desc: 'हवेत हेलकावे खाणारा सर्व्हिस करून डिफेंडरला गोंधळात टाकणे.', img: 'https://picsum.photos/seed/v12/600/400' },
    { title: 'डबल ब्लॉक वॉल', type: 'Defense', intensity: 'Moderate', desc: 'दोन खेळाडूंनी एकत्र ब्लॉक करून भिंत उभी करणे.', img: 'https://picsum.photos/seed/v13/600/400' },
    { title: 'टॅक्टिकल टाईमआउट', type: 'Strategy', intensity: 'Low', desc: 'खेळाचा वेग कमी करण्यासाठी आणि रणनीती बदलण्यासाठी घेतलेला ब्रेक.', img: 'https://picsum.photos/seed/v14/600/400' },
    { title: 'सर्व्ह रिसीव्ह फॉर्मेशन', type: 'Defense', intensity: 'Moderate', desc: 'सर्व्हिस येताना प्रत्येक खेळाडूने आपली जागा निश्चित करणे.', img: 'https://picsum.photos/seed/v15/600/400' }
  ],
  'Kho Kho': [
    { title: 'पोल डायव्ह ट्रॅप', type: 'Attack', intensity: 'Extreme', desc: 'पोल जवळ असताना डिफेंडरला बाद करण्याची वेगवान पद्धत.', img: 'https://picsum.photos/seed/kh1/600/400' },
    { title: 'झिग-झॅग डॉजिंग', type: 'Defense', intensity: 'High', desc: 'डिफेंडरने चेझरला थकवण्यासाठी नागमोडी धावण्याची रणनीती.', img: 'https://picsum.photos/seed/kh2/600/400' },
    { title: 'सडन खो अटॅक', type: 'Attack', intensity: 'High', desc: 'एकाएकी खो देऊन डिफेंडरला चक्रावून सोडण्याचे तंत्र.', img: 'https://picsum.photos/seed/kh3/600/400' },
    { title: 'रिंग गेम मास्टरी', type: 'Defense', intensity: 'Moderate', desc: 'मधल्या चौकोनातून गोल फिरून वेळ काढण्याची रणनीती.', img: 'https://picsum.photos/seed/kh4/600/400' },
    { title: 'डायरेक्शन फेक (Fake)', type: 'Attack', intensity: 'Moderate', desc: 'एका बाजूला जाण्याचा बहाणा करून दुसऱ्या बाजूला वेगात वळणे.', img: 'https://picsum.photos/seed/kh5/600/400' },
    { title: 'लेट एंट्री रनिंग', type: 'Defense', intensity: 'High', desc: 'मैदानात उशिरा प्रवेश करून चेझरवर मानसिक दबाव टाकणे.', img: 'https://picsum.photos/seed/kh6/600/400' },
    { title: 'पोल टर्निंग स्पीड', type: 'Attack', intensity: 'High', desc: 'पोलला पकडून वेगात वळण्याची आणि दिशा बदलण्याची कला.', img: 'https://picsum.photos/seed/kh7/600/400' },
    { title: 'डबल डायव्ह अटेम्प्ट', type: 'Attack', intensity: 'Extreme', desc: 'एकापाठोपाठ दोनदा डायव्ह मारून डिफेंडरला बाद करण्याचा प्रयत्न.', img: 'https://picsum.photos/seed/kh8/600/400' },
    { title: 'फ्रंट एन्ट्री डॉज', type: 'Defense', intensity: 'Moderate', desc: 'चेझरच्या समोरून निसटून जाण्याचे कौशल्य.', img: 'https://picsum.photos/seed/kh9/600/400' },
    { title: 'बॅक एन्ट्री सेव्ह', type: 'Defense', intensity: 'Moderate', desc: 'मागून येणाऱ्या चेझरपासून सुरक्षित अंतर राखणे.', img: 'https://picsum.photos/seed/kh10/600/400' },
    { title: 'खो टाइमिंग प्रिसीजन', type: 'Attack', intensity: 'Low', desc: 'योग्य वेळी आणि योग्य अंतरावर असतानाच खो देणे.', img: 'https://picsum.photos/seed/kh11/600/400' },
    { title: 'कवरिंग द पोल', type: 'Defense', intensity: 'High', desc: 'पोलच्या मागे राहून स्वतःचे संरक्षण करणे.', img: 'https://picsum.photos/seed/kh12/600/400' },
    { title: 'स्कुअटिंग पोझिशन', type: 'Attack', intensity: 'Low', desc: 'बसलेल्या स्थितीत सतर्क राहून लगेच उठण्याची तयारी.', img: 'https://picsum.photos/seed/kh13/600/400' },
    { title: 'लॉन्ग रन डॉजिंग', type: 'Defense', intensity: 'High', desc: 'मैदानाच्या लांबीचा वापर करून धावत राहणे.', img: 'https://picsum.photos/seed/kh14/600/400' },
    { title: 'चेझर ट्रॅप', type: 'Attack', intensity: 'Moderate', desc: 'दोन चेझरनी मिळून धावणाऱ्या खेळाडूला कोत्यात पकडणे.', img: 'https://picsum.photos/seed/kh15/600/400' }
  ],
  'Handball': [
    { title: 'पिसटन मुव्हमेंट', type: 'Defense', intensity: 'Moderate', desc: 'डिफेंडरने पुढे-मागे हालचाल करून अटॅकरला रोखण्याची पद्धत.', img: 'https://picsum.photos/seed/h1/600/400' },
    { title: 'जंप शॉट पॉवर', type: 'Offense', intensity: 'High', desc: 'हवेत उडी मारून जास्तीत जास्त वेगाने बॉल गोलमध्ये टाकणे.', img: 'https://picsum.photos/seed/h2/600/400' },
    { title: 'फास्ट ब्रेक अटॅक', type: 'Offense', intensity: 'Extreme', desc: 'डिफेन्सकडून बॉल मिळताच वेगाने काउंटर अटॅक करणे.', img: 'https://picsum.photos/seed/h3/600/400' },
    { title: '६-० डिफेन्स वॉल', type: 'Defense', intensity: 'High', desc: 'सहा खेळाडूंनी अटॅक लाईनवर उभे राहून भिंत उभी करणे.', img: 'https://picsum.photos/seed/h4/600/400' },
    { title: 'बाऊन्स शॉट स्किल', type: 'Offense', intensity: 'Moderate', desc: 'बॉल जमिनीवर आपटून गोलकीपरच्या हाताखालून गोल करणे.', img: 'https://picsum.photos/seed/h5/600/400' },
    { title: 'विंग अटॅक (Wing)', type: 'Offense', intensity: 'High', desc: 'मैदानाच्या कोपऱ्यातून (विंग) वेगात गोलवर हल्ला करणे.', img: 'https://picsum.photos/seed/h6/600/400' },
    { title: 'पिivot टर्न', type: 'Offense', intensity: 'Moderate', desc: 'मधल्या भागात खेळाडूने फिरून गोलवर शॉट मारण्याची कला.', img: 'https://picsum.photos/seed/h7/600/400' },
    { title: 'डबल क्रॉस पासिंग', type: 'Offense', intensity: 'Moderate', desc: 'दोन खेळाडूंनी जागा बदलून फसव्या पासेस देणे.', img: 'https://picsum.photos/seed/h8/600/400' },
    { title: '७-मीटर पेनल्टी', type: 'Strategy', intensity: 'High', desc: 'पेनल्टी मारताना गोलकीपरच्या हालचालीवर लक्ष ठेवून शॉट मारणे.', img: 'https://picsum.photos/seed/h9/600/400' },
    { title: 'गोलकीपर रिफ्लेक्स', type: 'Defense', intensity: 'Extreme', desc: 'अतिशय जवळून येणारा बॉल हात किंवा पायाने रोखण्याची कला.', img: 'https://picsum.photos/seed/h10/600/400' },
    { title: 'मॅन-टू-मॅन मार्किंग', type: 'Defense', intensity: 'High', desc: 'प्रत्येक डिफेंडरने एका विशिष्ट अटॅकरवर लक्ष ठेवणे.', img: 'https://picsum.photos/seed/h11/600/400' },
    { title: 'स्क्रिनिंग (Screening)', type: 'Offense', intensity: 'Low', desc: 'आपल्या खेळाडूला वाट मिळवून देण्यासाठी डिफेंडरचा रस्ता रोखणे.', img: 'https://picsum.photos/seed/h12/600/400' },
    { title: 'लॉन्ग रेन्ज शॉट', type: 'Offense', intensity: 'High', desc: '९ मीटर लाईनच्या बाहेरून गोलवर जोरात शॉट मारणे.', img: 'https://picsum.photos/seed/h13/600/400' },
    { title: 'पॅसिव्ह प्ले (Passive)', type: 'Strategy', intensity: 'Low', desc: 'वेळ काढण्यासाठी बॉल आपल्या ताब्यात ठेवण्याचे तंत्र.', img: 'https://picsum.photos/seed/h14/600/400' },
    { title: 'फॉल्स विंग मुव्ह', type: 'Offense', intensity: 'Moderate', desc: 'विंगला जाण्याचा बहाणा करून मध्ये कट मारणे.', img: 'https://picsum.photos/seed/h15/600/400' }
  ],
  'Running': [
    { title: 'स्प्रिंट स्टार्ट (Block)', type: 'Technique', intensity: 'High', desc: 'स्टार्टिंग ब्लॉक मधून बाहेर पडताना शरीराचा योग्य कोन राखणे.', img: 'https://picsum.photos/seed/r1/600/400' },
    { title: 'एक्सेलरेशन फेज', type: 'Technique', intensity: 'Extreme', desc: 'पहिल्या १० ते २० मीटर मध्ये जास्तीत जास्त वेग मिळवण्याची कला.', img: 'https://picsum.photos/seed/r2/600/400' },
    { title: 'मैक्सिमम व्हेलोसिटी', type: 'Technique', intensity: 'High', desc: 'धावताना हातांची आणि पायांची लयबद्ध हालचाल करून वेग टिकवणे.', img: 'https://picsum.photos/seed/r3/600/400' },
    { title: 'बॅटन एक्सचेंज (Relay)', type: 'Teamwork', intensity: 'High', desc: 'रिले रेस मध्ये बॅटन देताना आणि घेताना वेग कमी न करण्याची रणनीती.', img: 'https://picsum.photos/seed/r4/600/400' },
    { title: 'फिनिशिंग लीन', type: 'Technique', intensity: 'Moderate', desc: 'फिनिश लाईनवर पोहोचताना छाती पुढे झुकवण्याची पद्धत.', img: 'https://picsum.photos/seed/r5/600/400' },
    { title: 'इंटरव्हल ट्रेनिंग', type: 'Training', intensity: 'High', desc: 'ठराविक अंतराने वेगाने धावणे आणि पुन्हा विश्रांती घेणे.', img: 'https://picsum.photos/seed/r6/600/400' },
    { title: 'पेसिंग स्ट्रॅटेजी', type: 'Strategy', intensity: 'Moderate', desc: 'लांब अंतराच्या रेस मध्ये सुरुवातीला वेग नियंत्रित ठेवणे.', img: 'https://picsum.photos/seed/r7/600/400' },
    { title: 'हाय नी ड्राइव्ह', type: 'Technique', intensity: 'Moderate', desc: 'धावताना गुडघे वर उचलून पावलाची लांबी वाढवणे.', img: 'https://picsum.photos/seed/r8/600/400' },
    { title: 'आर्म स्विंग कंट्रोल', type: 'Technique', intensity: 'Low', desc: 'हातांच्या हालचालीचा वापर वेगाला दिशा देण्यासाठी करणे.', img: 'https://picsum.photos/seed/r9/600/400' },
    { title: 'ब्रिदिंग रिदम', type: 'Technique', intensity: 'Low', desc: 'श्वास घेण्याची आणि सोडण्याची लय धावण्याशी जुळवणे.', img: 'https://picsum.photos/seed/r10/600/400' },
    { title: 'रिॲक्शन स्पीड ड्रील', type: 'Training', intensity: 'High', desc: 'बंदुकीच्या आवाजावर किंवा शिटीवर त्वरित प्रतिसाद देण्याची तालीम.', img: 'https://picsum.photos/seed/r11/600/400' },
    { title: 'लॅक्टिक ॲसिड टॉलरन्स', type: 'Training', intensity: 'Extreme', desc: 'थकवा आल्यानंतरही वेग टिकवून ठेवण्याची शारीरिक क्षमता.', img: 'https://picsum.photos/seed/r12/600/400' },
    { title: 'स्ट्राईड लांबी', type: 'Technique', intensity: 'Moderate', desc: 'धावताना टाचा न आपटता पावले जास्तीत जास्त लांब टाकणे.', img: 'https://picsum.photos/seed/r13/600/400' },
    { title: 'अपहिल स्प्रिंट्स', type: 'Training', intensity: 'High', desc: 'चढणीवर वेगाने धावून पायांची ताकद वाढवणे.', img: 'https://picsum.photos/seed/r14/600/400' },
    { title: 'डाऊनहिल कंट्रोल', type: 'Technique', intensity: 'Moderate', desc: 'उतारावर धावताना शरीराचा समतोल राखणे.', img: 'https://picsum.photos/seed/r15/600/400' }
  ],
  'Javelin Throw': [
    { title: 'ग्रिप आणि कॅरी', type: 'Technique', intensity: 'Low', desc: 'भाला पकडण्याची योग्य पद्धत (V-ग्रिप किंवा फिनिश ग्रिप).', img: 'https://picsum.photos/seed/j1/600/400' },
    { title: 'अपप्रोच रन-अप', type: 'Technique', intensity: 'Moderate', desc: 'फेकण्यापूर्वी वेगाने धावून ऊर्जा निर्माण करण्याची कला.', img: 'https://picsum.photos/seed/j2/600/400' },
    { title: 'क्रॉस-ओव्हर स्टेप्स', type: 'Technique', intensity: 'High', desc: 'धावताना पाय एकमेकांवर ओलांडून शरीराला फेकण्यासाठी सज्ज करणे.', img: 'https://picsum.photos/seed/j3/600/400' },
    { title: 'विथड्रॉवल फेज', type: 'Technique', intensity: 'Moderate', desc: 'भाला मागे नेऊन पूर्ण ताण देण्याची स्थिती.', img: 'https://picsum.photos/seed/j4/600/400' },
    { title: 'पॉवर पोझिशन', type: 'Technique', intensity: 'High', desc: 'फेकण्यापूर्वी पायांचा आणि कमरेचा समतोल साधणारी मुख्य स्थिती.', img: 'https://picsum.photos/seed/j5/600/400' },
    { title: 'डिलीव्हरी स्ट्राईक', type: 'Technique', intensity: 'Extreme', desc: 'पूर्ण ताकदीनिशी भाला हवेत सोडण्याची हालचाल.', img: 'https://picsum.photos/seed/j6/600/400' },
    { title: 'अँगल ऑफ रिलीज', type: 'Technique', intensity: 'Moderate', desc: 'भाला ३० ते ३५ अंशात फेकणे जेणेकरून तो लांब जाईल.', img: 'https://picsum.photos/seed/j7/600/400' },
    { title: 'रिकव्हरी स्टेप', type: 'Technique', intensity: 'Low', desc: 'फेकल्यानंतर रेषेच्या आत स्वतःला सावरण्याचे तंत्र.', img: 'https://picsum.photos/seed/j8/600/400' },
    { title: 'टीप कंट्रोल', type: 'Technique', intensity: 'Moderate', desc: 'भाला हवेत जाताना त्याचे टोक जमिनीकडे कललेले ठेवणे.', img: 'https://picsum.photos/seed/j9/600/400' },
    { title: 'एल्बो एलायन्मेंट', type: 'Technique', intensity: 'High', desc: 'कोपर खांद्याच्या रेषेत ठेवून इजा टाळणे आणि ताकद मिळवणे.', img: 'https://picsum.photos/seed/j10/600/400' },
    { title: 'कोअर टॉर्शन', type: 'Training', intensity: 'Moderate', desc: 'कमरेच्या स्नायूंचा वापर करून फिरवण्याची ताकद मिळवणे.', img: 'https://picsum.photos/seed/j11/600/400' },
    { title: 'ब्लॉकिंग लेग', type: 'Technique', intensity: 'High', desc: 'फेकताना पुढचा पाय घट्ट रोवून गतीला उर्जेत बदलणे.', img: 'https://picsum.photos/seed/j12/600/400' },
    { title: 'फ्लाईट स्टेबिलिटी', type: 'Technique', intensity: 'Low', desc: 'भाला हवेत स्थिर ठेवण्याची तांत्रिक समज.', img: 'https://picsum.photos/seed/j13/600/400' },
    { title: 'रिस्ट फ्लिक', type: 'Technique', intensity: 'Moderate', desc: 'भाला सोडताना मनगटाने दिलेला शेवटचा धक्का.', img: 'https://picsum.photos/seed/j14/600/400' },
    { title: 'टॅक्टिकल विंड ॲडजस्ट', type: 'Strategy', intensity: 'Low', desc: 'वाऱ्याच्या दिशेनुसार फेकण्याची दिशा थोडी बदलणे.', img: 'https://picsum.photos/seed/j15/600/400' }
  ],
  'Shot Put': [
    { title: 'ग्रिप आणि प्लेसमेंट', type: 'Technique', intensity: 'Low', desc: 'गोळा बोटांच्या मुळाशी पकडून मानेजवळ स्थिर ठेवणे.', img: 'https://picsum.photos/seed/s1/600/400' },
    { title: 'ग्लाईड टेक्निक', type: 'Technique', intensity: 'High', desc: 'वर्तुळाच्या एका टोकापासून दुसऱ्या टोकापर्यंत सरकण्याची पद्धत.', img: 'https://picsum.photos/seed/s2/600/400' },
    { title: 'रोटेशनल टेक्निक', type: 'Technique', intensity: 'Extreme', desc: 'गोल फिरून जास्तीत जास्त गती मिळवून गोळा फेकण्याची कला.', img: 'https://picsum.photos/seed/s3/600/400' },
    { title: 'इनिशियल स्टान्स', type: 'Technique', intensity: 'Low', desc: 'फेकण्यापूर्वी वर्तुळात उभे राहण्याची संतुलित स्थिती.', img: 'https://picsum.photos/seed/s4/600/400' },
    { title: 'पॉवर पोझिशन', type: 'Technique', intensity: 'High', desc: 'ग्लाईड किंवा रोटेशननंतर फेकण्यासाठी तयार झालेली ऊर्जा.', img: 'https://picsum.photos/seed/s5/600/400' },
    { title: 'एक्सटेन्शन आणि पुश', type: 'Technique', intensity: 'High', desc: 'हात पूर्णपणे सरळ करून गोळ्याला जोरात धक्का देणे.', img: 'https://picsum.photos/seed/s6/600/400' },
    { title: 'रिस्ट स्नॅप', type: 'Technique', intensity: 'Moderate', desc: 'सोडताना मनगटाचा वापर करून गोळ्याला जास्तीची गती देणे.', img: 'https://picsum.photos/seed/s7/600/400' },
    { title: 'रिव्हर्स रिकव्हरी', type: 'Technique', intensity: 'Moderate', desc: 'फेकल्यानंतर समतोल राखण्यासाठी पाय बदलण्याची हालचाल.', img: 'https://picsum.photos/seed/s8/600/400' },
    { title: 'अँगल ऑफ रिलीज', type: 'Technique', intensity: 'Moderate', desc: 'गोळा ३७ ते ४० अंशात फेकणे हे सर्वात प्रभावी ठरते.', img: 'https://picsum.photos/seed/s9/600/400' },
    { title: 'बॅलन्स मेंटेनन्स', type: 'Technique', intensity: 'Low', desc: 'वर्तुळाच्या कडेला पाय न लागता स्वतःला थांबवणे.', img: 'https://picsum.photos/seed/s10/600/400' },
    { title: 'लेग ड्राइव्ह', type: 'Training', intensity: 'High', desc: 'पायांच्या ताकदीचा वापर करून गोळ्याला वर उचलणे.', img: 'https://picsum.photos/seed/s11/600/400' },
    { title: 'शोल्डर एलायन्मेंट', type: 'Technique', intensity: 'Moderate', desc: 'खांदे योग्य दिशेत ठेवून अचूक फेक करणे.', img: 'https://picsum.photos/seed/s12/600/400' },
    { title: 'एक्सप्लोझिव्ह पॉवर ड्रील', type: 'Training', intensity: 'High', desc: 'कमी वेळात जास्तीत जास्त ताकद लावण्याची तालीम.', img: 'https://picsum.photos/seed/s13/600/400' },
    { title: 'फोलो-थ्रू', type: 'Technique', intensity: 'Low', desc: 'फेकल्यानंतर हाताची हालचाल सुरू ठेवणे.', img: 'https://picsum.photos/seed/s14/600/400' },
    { title: 'मेंटल विजुअलायझेशन', type: 'Strategy', intensity: 'Low', desc: 'फेकण्यापूर्वी मनात पूर्ण हालचाल पाहून आत्मविश्वास वाढवणे.', img: 'https://picsum.photos/seed/s15/600/400' }
  ],
  'Disc Throw': [
    { title: 'डिस्क ग्रिप', type: 'Technique', intensity: 'Low', desc: 'बोटांच्या टोकांनी थाळीच्या कडेला पकडण्याची पद्धत.', img: 'https://picsum.photos/seed/d1/600/400' },
    { title: 'इनिशियल स्विंग', type: 'Technique', intensity: 'Low', desc: 'समतोल साधण्यासाठी आणि लय मिळवण्यासाठी थाळी हलवणे.', img: 'https://picsum.photos/seed/d2/600/400' },
    { title: 'टर्न/पिव्होट', type: 'Technique', intensity: 'High', desc: 'वर्तुळात दीड फेरा पूर्ण फिरून गती मिळवणे.', img: 'https://picsum.photos/seed/d3/600/400' },
    { title: 'पॉवर पोझिशन', type: 'Technique', intensity: 'High', desc: 'फेकण्यापूर्वी पाय आणि शरीर पूर्णपणे ताणलेले असणे.', img: 'https://picsum.photos/seed/d4/600/400' },
    { title: 'रिलीज फेज', type: 'Technique', intensity: 'Extreme', desc: 'थाळीला खांद्याच्या रेषेतून बाहेर सोडणे.', img: 'https://picsum.photos/seed/d5/600/400' },
    { title: 'स्पिन कंट्रोल', type: 'Technique', intensity: 'Moderate', desc: 'थाळी हवेत फिरत जावी (Spin) यासाठी दिलेला पीळ.', img: 'https://picsum.photos/seed/d6/600/400' },
    { title: 'रिव्हर्स रिकव्हरी', type: 'Technique', intensity: 'Moderate', desc: 'फेकल्यानंतर वर्तुळात राहण्यासाठी पायांची हालचाल.', img: 'https://picsum.photos/seed/d7/600/400' },
    { title: 'सेंट्रीफ्यूगल फोर्स', type: 'Technique', intensity: 'High', desc: 'फिरताना थाळी बाहेर फेकली जाण्यासाठी मिळवलेली ऊर्जा.', img: 'https://picsum.photos/seed/d8/600/400' },
    { title: 'अँगल ऑफ अटॅक', type: 'Technique', intensity: 'Moderate', desc: 'वाऱ्याचा वापर करून थाळी लांब जाण्यासाठी योग्य कोन.', img: 'https://picsum.photos/seed/d9/600/400' },
    { title: 'कोअर स्टॅबिलिटी', type: 'Training', intensity: 'Moderate', desc: 'फिरताना शरीराचा मध्य भाग स्थिर ठेवण्याची क्षमता.', img: 'https://picsum.photos/seed/d10/600/400' },
    { title: 'फूटवर्क प्रिसीजन', type: 'Technique', intensity: 'High', desc: 'वर्तुळात पाय कुठे पडतील याचे अचूक नियोजन.', img: 'https://picsum.photos/seed/d11/600/400' },
    { title: 'आम्र स्ट्रेच', type: 'Technique', intensity: 'Moderate', desc: 'हात पूर्ण लांब ठेवून थाळीचे अंतर वाढवणे.', img: 'https://picsum.photos/seed/d12/600/400' },
    { title: 'हेड पोझिशन', type: 'Technique', intensity: 'Low', desc: 'फिरताना डोकं स्थिर ठेवून अचूक लक्ष्य साधणे.', img: 'https://picsum.photos/seed/d13/600/400' },
    { title: 'बॅलन्स ड्रील्स', type: 'Training', intensity: 'Low', desc: 'एका पायावर उभे राहून फिरण्याची तालीम.', img: 'https://picsum.photos/seed/d14/600/400' },
    { title: 'रिलीज हाईट', type: 'Technique', intensity: 'Moderate', desc: 'थाळी खांद्याच्या वरच्या रेषेतून सोडण्याची गरज.', img: 'https://picsum.photos/seed/d15/600/400' }
  ],
  'Long Jump': [
    { title: 'अपप्रोच रन-अप', type: 'Technique', intensity: 'High', desc: 'जास्तीत जास्त वेगाने धावून टेक-ऑफ बोर्डकडे येणे.', img: 'https://picsum.photos/seed/l1/600/400' },
    { title: 'टेक-ऑफ बोर्ड हिट', type: 'Technique', intensity: 'Extreme', desc: 'बोर्डवर पाय न ओलांडता अचूकपणे पाय आपटून उडी मारणे.', img: 'https://picsum.photos/seed/l2/600/400' },
    { title: 'व्हर्टिकल लिफ्ट', type: 'Technique', intensity: 'High', desc: 'उडी मारताना शरीराला जास्तीत जास्त वर ढकलणे.', img: 'https://picsum.photos/seed/l3/600/400' },
    { title: 'फ्लाईट फेज (Hang)', type: 'Technique', intensity: 'Moderate', desc: 'हवेत असताना शरीराचा आकार धनुष्यासारखा करून स्थिर राहणे.', img: 'https://picsum.photos/seed/l4/600/400' },
    { title: 'हिच-किक मूव्ह', type: 'Technique', intensity: 'High', desc: 'हवेत पाय सायकल चालवल्यासारखे हलवून अंतर वाढवणे.', img: 'https://picsum.photos/seed/l5/600/400' },
    { title: 'लँडिंग प्रिसीजन', type: 'Technique', intensity: 'Moderate', desc: 'वाळूत पडताना पाय जास्तीत जास्त पुढे टाकून स्वतःला पुढे झुकवणे.', img: 'https://picsum.photos/seed/l6/600/400' },
    { title: 'चेकपॉइंट रनिंग', type: 'Strategy', intensity: 'Low', desc: 'धावताना पावलांचे नियोजन करण्यासाठी लावलेले खुणेचे बिंदू.', img: 'https://picsum.photos/seed/l7/600/400' },
    { title: 'आम्र स्विप हवेत', type: 'Technique', intensity: 'Low', desc: 'समतोल राखण्यासाठी हवेत हातांच्या हालचाली.', img: 'https://picsum.photos/seed/l8/600/400' },
    { title: 'नी ड्राइव्ह बोर्डवर', type: 'Technique', intensity: 'High', desc: 'टेक-ऑफ घेताना गुडघा जोरात वर खेचणे.', img: 'https://picsum.photos/seed/l9/600/400' },
    { title: 'स्पीड मेंटेनन्स', type: 'Technique', intensity: 'High', desc: 'शेवटच्या पावलापर्यंत वेग कमी न होऊ देणे.', img: 'https://picsum.photos/seed/l10/600/400' },
    { title: 'सँड पिट प्रिप', type: 'Strategy', intensity: 'Low', desc: 'वाळू व्यवस्थित करून इजा टाळणे आणि मोजणी सुलभ करणे.', img: 'https://picsum.photos/seed/l11/600/400' },
    { title: 'बोर्ड सायकोलॉजी', type: 'Strategy', intensity: 'Low', desc: 'बोर्डवर पाय पडताना येणारी भीती घालवण्याची मानसिक तालीम.', img: 'https://picsum.photos/seed/l12/600/400' },
    { title: 'एक्स्प्लोझिव्ह बोर्ड जंप', type: 'Training', intensity: 'High', desc: 'एका पायावर उडी मारून जास्तीत जास्त ताकद लावणे.', img: 'https://picsum.photos/seed/l13/600/400' },
    { title: 'लँडिंग फॉल-फॉरवर्ड', type: 'Technique', intensity: 'Moderate', desc: 'वाळूत पडल्यानंतर मागे न बसता पुढे पडण्याचे तंत्र.', img: 'https://picsum.photos/seed/l14/600/400' },
    { title: 'शॉर्ट रन-अप ड्रील्स', type: 'Training', intensity: 'Moderate', desc: 'कमी अंतरावरून धावून उडीची अचूकता सुधारणे.', img: 'https://picsum.photos/seed/l15/600/400' }
  ],
  'High Jump': [
    { title: 'फोसबरी फ्लॉप (Approach)', type: 'Technique', intensity: 'High', desc: 'J-आकाराच्या मार्गाने धावून बारकडे येणे.', img: 'https://picsum.photos/seed/hj1/600/400' },
    { title: 'टेक-ऑफ पॉइंट', type: 'Technique', intensity: 'Extreme', desc: 'बारच्या नेमक्या ठिकाणी पाय रोवून वरच्या दिशेला उडी मारणे.', img: 'https://picsum.photos/seed/hj2/600/400' },
    { title: 'बॉडी आर्किंग', type: 'Technique', intensity: 'High', desc: 'बारवरून जाताना शरीराचा कमानदार आकार तयार करणे.', img: 'https://picsum.photos/seed/hj3/600/400' },
    { title: 'लेग क्लिअरन्स', type: 'Technique', intensity: 'Moderate', desc: 'बारला पाय लागू नये म्हणून शेवटच्या क्षणी पाय वर ओढणे.', img: 'https://picsum.photos/seed/hj4/600/400' },
    { title: 'हेड बँक मूव्ह', type: 'Technique', intensity: 'Moderate', desc: 'बारच्या पलीकडे बघून शरीराला फिरवण्यास मदत करणे.', img: 'https://picsum.photos/seed/hj5/600/400' },
    { title: 'लँडिंग ऑन मॅट', type: 'Technique', intensity: 'Low', desc: 'खांद्यावर किंवा पाठीवर सुरक्षित लँडिंग करण्याचे तंत्र.', img: 'https://picsum.photos/seed/hj6/600/400' },
    { title: 'कर्व्ह रनिंग स्पीड', type: 'Technique', intensity: 'High', desc: 'वळणावर वेगाने धावताना सेंट्रीफ्यूगल फोर्सचा वापर करणे.', img: 'https://picsum.photos/seed/hj7/600/400' },
    { title: 'व्हर्टिकल स्प्रिंग ड्रील', type: 'Training', intensity: 'High', desc: 'जागेवर उंच उड्या मारून पायांची ताकद वाढवणे.', img: 'https://picsum.photos/seed/hj8/600/400' },
    { title: 'बार विजुअलायझेशन', type: 'Strategy', intensity: 'Low', desc: 'बार ओलांडल्याचे मनात चित्र उभे करणे.', img: 'https://picsum.photos/seed/hj9/600/400' },
    { title: 'सिझर जंप (Basics)', type: 'Technique', intensity: 'Low', desc: 'नवख्या खेळाडूंसाठी पायांची कात्री करून बार ओलांडणे.', img: 'https://picsum.photos/seed/hj10/600/400' },
    { title: 'आम्र ड्राइव्ह अप', type: 'Technique', intensity: 'Moderate', desc: 'उडी मारताना दोन्ही हात जोरात वर फेकून उंची मिळवणे.', img: 'https://picsum.photos/seed/hj11/600/400' },
    { title: 'सेंटर ऑफ ग्रॅव्हिटी', type: 'Technique', intensity: 'High', desc: 'बारच्या खाली असतानाही शरीराला बारच्या वरून नेण्याचे भौतिकशास्त्र.', img: 'https://picsum.photos/seed/hj12/600/400' },
    { title: 'ऍप्रोच स्टेबिलिटी', type: 'Technique', intensity: 'Moderate', desc: 'धावताना डळमळीत न होता सरळ आणि लयबद्ध राहणे.', img: 'https://picsum.photos/seed/hj13/600/400' },
    { title: 'बार हाईट प्रोग्रेशन', type: 'Training', intensity: 'Moderate', desc: 'हळूहळू बारची उंची वाढवून सराव करण्याची पद्धत.', img: 'https://picsum.photos/seed/hj14/600/400' },
    { title: 'फ्लॉप रिकव्हरी', type: 'Technique', intensity: 'Low', desc: 'बारवरून पडल्यानंतर मॅटवरून उठण्याची सुरक्षित पद्धत.', img: 'https://picsum.photos/seed/hj15/600/400' }
  ],
  'Athletics': [
    { title: 'रिले बॅटन हँडओव्हर', type: 'Teamwork', intensity: 'High', desc: 'धावताना मागे न बघता बॅटन देण्याचे आणि घेण्याचे तंत्र.', img: 'https://picsum.photos/seed/a1/600/400' },
    { title: 'हर्डल रिदम (Hurdles)', type: 'Technique', intensity: 'Extreme', desc: 'अडथळे ओलांडताना तीन पावलांची लय कायम ठेवणे.', img: 'https://picsum.photos/seed/a2/600/400' },
    { title: 'स्टिपलचेझ जंप', type: 'Technique', intensity: 'High', desc: 'पाणी असलेल्या अडथळ्यावरून वेगाने उडी मारण्याची कला.', img: 'https://picsum.photos/seed/a3/600/400' },
    { title: 'कर्व्ह लेन रनिंग', type: 'Technique', intensity: 'Moderate', desc: '२०० आणि ४०० मीटर मध्ये वळणावर वेग टिकवण्याची पद्धत.', img: 'https://picsum.photos/seed/a4/600/400' },
    { title: 'स्टार्टिंग गन रिअॅक्शन', type: 'Technique', intensity: 'High', desc: 'शून्यापेक्षा कमी सेकंदात प्रतिसादाची तालीम.', img: 'https://picsum.photos/seed/a5/600/400' },
    { title: 'मिडल डिस्टन्स पेसिंग', type: 'Strategy', intensity: 'Moderate', desc: '८०० आणि १५०० मीटर मध्ये शेवटच्या लॅपसाठी ऊर्जा वाचवणे.', img: 'https://picsum.photos/seed/a6/600/400' },
    { title: 'वॉर्म-अप रुटीन', type: 'Preparation', intensity: 'Low', desc: 'स्नायूंना इजेपासून वाचवण्यासाठी केलेली धावण्यापूर्वीची तालीम.', img: 'https://picsum.photos/seed/a7/600/400' },
    { title: 'कुल-डाऊन स्ट्रेचिंग', type: 'Preparation', intensity: 'Low', desc: 'सरावानंतर शरीराला शांत करण्याची आणि लवचिकता वाढवण्याची पद्धत.', img: 'https://picsum.photos/seed/a8/600/400' },
    { title: 'मानसिक एकाग्रता ड्रील', type: 'Strategy', intensity: 'Low', desc: 'गोंधळातही स्वतःच्या धावण्यावर लक्ष केंद्रित करणे.', img: 'https://picsum.photos/seed/a9/600/400' },
    { title: 'पाय आणि शूज ग्रिप', type: 'Technique', intensity: 'Low', desc: 'ट्रॅकनुसार स्पाइक्स किंवा रनिंग शूजची निवड करणे.', img: 'https://picsum.photos/seed/a10/600/400' },
    { title: 'बॉडी वेट बॅलन्स', type: 'Technique', intensity: 'Moderate', desc: 'धावताना शरीर थोडे पुढे झुकवून हवेचा रोध कमी करणे.', img: 'https://picsum.photos/seed/a11/600/400' },
    { title: 'कोर स्ट्रेंथ ड्रील', type: 'Training', intensity: 'Moderate', desc: 'पोटाच्या स्नायूंची ताकद वाढवून धावण्याला स्थिरता देणे.', img: 'https://picsum.photos/seed/a12/600/400' },
    { title: 'हायड्रेशन प्लॅन', type: 'Preparation', intensity: 'Low', desc: 'स्पर्धेदरम्यान पाणी आणि इलेक्ट्रोलाईट्सचे नियोजन.', img: 'https://picsum.photos/seed/a13/600/400' },
    { title: 'फिनिश लाईन स्ट्रॅटेजी', type: 'Strategy', intensity: 'High', desc: 'शेवटच्या १० मीटरमध्ये पूर्ण ताकद एकवटून वेगाने जाणे.', img: 'https://picsum.photos/seed/a14/600/400' },
    { title: 'इजा टाळण्याचे तंत्र', type: 'Strategy', intensity: 'Low', desc: 'शरीराच्या मर्यादा ओळखून सरावाचा वेग ठरवणे.', img: 'https://picsum.photos/seed/a15/600/400' }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [planTitle, setPlanTitle] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [customPlans, setCustomPlans] = useState<any[]>([]);

  const strategies = useMemo(() => STANDARD_STRATEGIES[activeSport] || [], [activeSport]);

  const handleSavePlan = () => {
    if (!planTitle || !planDesc) return;
    const newPlan = {
      id: Math.random().toString(36).substr(2, 9),
      title: planTitle,
      desc: planDesc,
      date: format(new Date(), 'dd MMM yyyy'),
      sport: activeSport
    };
    setCustomPlans([newPlan, ...customPlans]);
    setPlanTitle("");
    setPlanDesc("");
    setIsBuilderOpen(false);
    toast({ title: "Strategy Saved", description: "Match plan archived to institutional registry." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-accent p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30">
               <Layout className="w-10 h-10 text-white" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">रणनीती मास्टरक्लास</h2>
               <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em]">Elite Tactical Playbook v4.3.11</p>
             </div>
           </div>
           <div className="flex gap-3">
             <Button onClick={() => setIsBuilderOpen(true)} className="bg-white text-accent h-14 rounded-2xl font-black uppercase text-[10px] px-8 shadow-xl active-scale">
               <Gamepad2 className="w-4 h-4 mr-2" /> Simulate Match
             </Button>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <Sword className="w-7 h-7 text-accent" /> {activeSport} Formations (15 Items)
            </h3>
            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Official Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strat, idx) => (
              <Card key={idx} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-accent transition-all group shadow-xl">
                 <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image src={strat.img} alt={strat.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className={cn(
                      "absolute top-6 left-6 font-black uppercase text-[9px] border-0",
                      strat.type === 'Defense' ? "bg-blue-600 text-white" : strat.type === 'Offense' ? "bg-orange-600 text-white" : "bg-emerald-600 text-white"
                    )}>{strat.type}</Badge>
                    <Badge variant="outline" className="absolute top-6 right-6 border-white/40 text-white font-black uppercase text-[8px] px-3 bg-white/10 backdrop-blur-sm">
                      {strat.intensity} Intensity
                    </Badge>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">{strat.title}</h4>
                       <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                         <CirclePlay className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
                 <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed italic border-l-4 border-accent/20 pl-6">
                      &quot;{strat.desc}&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-primary/5 rounded-2xl border border-primary/5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">How to play</p>
                          <p className="text-[10px] font-bold text-primary uppercase">Elite Standards</p>
                       </div>
                       <div className="p-4 bg-accent/5 rounded-2xl border border-accent/5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Execution</p>
                          <p className="text-[10px] font-bold text-accent uppercase">Pro Level</p>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-2 rounded-[3rem] bg-primary p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                     <ShieldHalf className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Coaching Advice</h3>
                 </div>
                 <p className="text-sm font-bold opacity-70 leading-relaxed italic">
                   &quot;मैदानावरील रणनीती ही केवळ शक्तीवर नाही तर बुद्धीवर अवलंबून असते. प्रत्येक प्रसंगात स्वतःला शांत ठेवून योग्य तंत्र वापरणे हेच यशाचे गमक आहे.&quot;
                 </p>
                 <div className="space-y-4 pt-4">
                    {['Team Synergies', 'Tactical Precision', 'Winning Mindset'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                        <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                 </div>
              </div>
           </Card>

           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h4 className="text-xs font-black text-primary uppercase tracking-widest">Saved Simulations</h4>
                 <Badge variant="secondary" className="text-[8px] font-black uppercase">{customPlans.length} Archived</Badge>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {customPlans.length === 0 ? (
                    <div className="py-20 text-center opacity-20 border-4 border-dashed rounded-[2.5rem]">
                      <PenTool className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No plans archived</p>
                    </div>
                  ) : (
                    customPlans.map((plan) => (
                      <Card key={plan.id} className="border-2 rounded-[2rem] p-6 hover:border-primary/30 transition-all group bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h5 className="font-black text-primary uppercase text-sm">{plan.title}</h5>
                           <Button variant="ghost" size="icon" onClick={() => setCustomPlans(customPlans.filter(p => p.id !== plan.id))} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                        <p className="text-xs font-medium text-foreground/60 line-clamp-2 italic">&quot;{plan.desc}&quot;</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">{plan.date}</span>
                          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary uppercase">{plan.sport}</Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
           </div>
        </div>
      </div>

      {isBuilderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="w-full max-w-lg rounded-[3rem] border-none shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-primary p-8 text-white text-center">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                    <PenTool className="w-8 h-8 text-white" />
                 </div>
                 <h4 className="text-2xl font-black uppercase tracking-tight">Strategy Builder</h4>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Archive Specialized Tactics</p>
              </div>
              <div className="p-8 space-y-6 bg-white">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Title</label>
                    <Input 
                      value={planTitle} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanTitle(e.target.value)} 
                      placeholder="e.g. District Level Attack" 
                      className="h-14 rounded-2xl border-2 font-bold px-6 shadow-inner" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Breakdown</label>
                    <Textarea 
                      value={planDesc} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPlanDesc(e.target.value)} 
                      placeholder="Explain how to play this tactical move..." 
                      className="min-h-[150px] rounded-2xl border-2 font-medium p-6 shadow-inner" 
                    />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button onClick={() => setIsBuilderOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</Button>
                    <Button onClick={handleSavePlan} className="flex-1 h-14 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale">
                      <Save className="w-4 h-4 mr-2" /> Save Tactic
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
