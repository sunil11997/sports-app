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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
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
  Gamepad2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STANDARD_STRATEGIES: Record<string, any[]> = {
  'Kabaddi': [
    { title: '५-१-१ डिफेन्स सेटअप', type: 'Defense', intensity: 'High', desc: 'डिफेंडरची साखळी आणि कोपरं सांभाळण्याची रणनीती. जेव्हा बोनस ऑन असतो तेव्हा ही वापरतात.', howTo: '१. दोन्ही कोपरे (Corners) लाइनच्या आत खोलवर राहातात.\n२. मधले कव्हर्स रेडरच्या हालचालीवर लक्ष ठेवतात आणि त्याला बोनस घेण्यास प्रवृत्त करतात.\n३. जसा रेडर बोनससाठी पाय टाकतो, तसे कोपरे आणि कव्हर्स मिळून त्याला घेतात.', img: 'https://picsum.photos/seed/kdef1/600/400' },
    { title: '३-२-२ कव्वर पॅटर्न', type: 'Defense', intensity: 'Extreme', desc: 'मधल्या डिफेंडर्सनी रेडरला घेरण्याची रणनीती. अत्यंत वेगवान हालचाल आवश्यक.', howTo: '१. ही रणनीती प्रामुख्याने ७ खेळाडू मैदानात असताना वापरली जाते.\n२. मधले दोन खेळाडू (In-Covers) रेडरला कोपऱ्याकडे ढकलतात.\n३. रेडर कोपऱ्यात अडकला की संपूर्ण टीम साखळीने त्याला डॅश करते.', img: 'https://picsum.photos/seed/kdef2/600/400' },
    { title: 'बोनस एस्केप अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'रेडरने बोनस घेताना कोपऱ्यातून पळून जाण्याचे तंत्र.', howTo: '१. रेडर कोपऱ्यातील डिफेंडरला फसवून पाय बोनस लाईनच्या पलीकडे टाकतो.\n२. पाय पडताच कंबर फिरवून मध्यरेषेकडे झेप घेतो.\n३. हे करताना डिफेंडरचा डॅश चुकवणे महत्त्वाचे असते.', img: 'https://picsum.photos/seed/koff1/600/400' },
    { title: 'साखळी पकड (Chain Tackle)', type: 'Defense', intensity: 'High', desc: 'दोन खेळाडूंनी हात धरून रेडरला घेरण्याची आणि डॅश करण्याची पद्धत.', howTo: '१. दोन डिफेंडर्स एकमेकांचे हात घट्ट धरतात.\n२. रेडर जेव्हा कोपऱ्यात जातो, तेव्हा हे दोघे वर्तुळाकार फिरून त्याचा रस्ता रोखतात.\n३. साखळीचा वापर करून रेडरला उचलून बाहेर ढकलले जाते.', img: 'https://picsum.photos/seed/k4/600/400' },
    { title: 'थाई होल्ड ट्रॅप', type: 'Defense', intensity: 'Moderate', desc: 'रेडरच्या मांडीला पकडून त्याला जागेवर रोखण्याचे तंत्र.', howTo: '१. डिफेंडर रेडरच्या पायांच्या हालचालीवर लक्ष ठेवतो.\n२. जेव्हा रेडर पुढचा पाय टाकतो, तेव्हा डिफेंडर खाली वाकून त्याच्या मांड्या घट्ट पकडतो.\n३. स्वतःचे वजन रेडरवर टाकून त्याला खाली पाडतो.', img: 'https://picsum.photos/seed/k5/600/400' },
    { title: 'अँकल होल्ड टाइमिंग', type: 'Defense', intensity: 'High', desc: 'रेडर जेव्हा पाय टाकतो तेव्हा नेमका घोटा पकडण्याची कला.', howTo: '१. हा प्रामुख्याने कोपऱ्यातील खेळाडूचा (Corner) मुख्य वार असतो.\n२. रेडर जेव्हा किक मारतो किंवा पाय मागे खेचतो, तेव्हा त्याचा घोटा पकडला जातो.\n३. पकड मजबूत ठेवण्यासाठी मनगटाचा वापर महत्त्वाचा आहे.', img: 'https://picsum.photos/seed/k6/600/400' },
    { title: 'दुबकी मास्टरक्लास', type: 'Offense', intensity: 'Extreme', desc: 'डिफेंडरच्या साखळीखालून सरपटत निसटण्याचे रेडरचे सर्वात कठीण तंत्र.', howTo: '१. जेव्हा डिफेंडर्स साखळीने रेडरला घेतात, तेव्हा रेडर आपले शरीर पूर्णपणे खाली झुकवतो.\n२. डिफेंडर्सच्या हातांच्या खालून सरपटत मध्यरेषेकडे जातो.\n३. यासाठी लवचिकता आणि वेगाची गरज असते.', img: 'https://picsum.photos/seed/k7/600/400' },
    { title: 'फ्रॉग जंप (Frog Jump)', type: 'Offense', intensity: 'Extreme', desc: 'डिफेंडरच्या वरून उडी मारून मध्यरेषेकडे जाण्याची रणनीती.', howTo: '१. जेव्हा डिफेंडर पायाला पकडण्यासाठी खाली वाकतो, तेव्हा रेडर त्याच्या पाठीवरून उडी मारतो.\n२. हवेत असताना शरीराचा समतोल राखणे गरजेचे आहे.\n३. हे तंत्र अत्यंत आकर्षक आणि प्रेक्षणीय असते.', img: 'https://picsum.photos/seed/k8/600/400' },
    { title: 'रनिंग हॅन्ड टच', type: 'Offense', intensity: 'High', desc: 'वेगात धावत असताना हाताने डिफेंडरला स्पर्श करून पळणे.', howTo: '१. रेडर वेगात एका बाजूकडून दुसऱ्या बाजूला धावतो.\n२. डिफेंडर सावध होण्यापूर्वीच हात लांब करून त्याला स्पर्श करतो.\n३. स्पर्श करताच वेग कमी न करता मध्यरेषेकडे वळतो.', img: 'https://picsum.photos/seed/k9/600/400' },
    { title: 'कॉर्नर अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'कोपऱ्यातील डिफेंडरवर दबाव टाकून त्याला बाद करण्याचा प्रयत्न.', howTo: '१. रेडर वारंवार कोपऱ्यात जाऊन डिफेंडरला चॅलेंज करतो.\n२. जेव्हा डिफेंडर घाई करतो, तेव्हा रेडर त्याला पाय लावून किंवा हाताने स्पर्श करून निसटतो.', img: 'https://picsum.photos/seed/k10/600/400' },
    { title: 'डू ऑर डाय रेड (Do or Die)', type: 'Strategy', intensity: 'High', desc: 'जेव्हा गुण मिळवणे अनिवार्य असते तेव्हा संयम आणि वेग यांचा ताळमेळ.', howTo: '१. तिसऱ्या रेडमध्ये गुण न मिळाल्यास रेडर बाद होतो.\n२. यात रेडरने शेवटच्या १० सेकंदात आक्रमक पवित्रा घ्यावा.\n३. बोनस किंवा टच पॉईंट पैकी एक निश्चित मिळवण्याचा प्रयत्न करावा.', img: 'https://picsum.photos/seed/k11/600/400' },
    { title: 'एम्प्टी रेड मॅनेजमेंट', type: 'Strategy', intensity: 'Low', desc: 'वेळ घालवण्यासाठी आणि विरोधी टीमला थकावण्यासाठी केलेली सुरक्षित रेड.', howTo: '१. रेडर ३० सेकंद पूर्णपणे वापरतो पण धोका पत्करत नाही.\n२. यामुळे स्वतःच्या टीमच्या बचावफळीला विश्रांती मिळते.\n३. ही रणनीती सामन्यात आघाडी असताना वापरली जाते.', img: 'https://picsum.photos/seed/k12/600/400' },
    { title: 'सुपर टॅकल सेटअप', type: 'Defense', intensity: 'High', desc: 'जेव्हा ३ खेळाडू असतात तेव्हा रेडरला फसवून पकडण्याची पद्धत.', howTo: '१. तीनही खेळाडू रेडरला बोनस घेण्यास प्रवृत्त करतात.\n२. रेडर आत येताच तिघेही वेगवेगळ्या दिशांनी त्याच्यावर तुटून पडतात.\n३. सुपर टॅकलसाठी २ गुण मिळतात.', img: 'https://picsum.photos/seed/k13/600/400' },
    { title: 'ऑल आऊट पुश', type: 'Strategy', intensity: 'High', desc: 'विरोधी टीमच्या शेवटच्या खेळाडूला बाद करून जास्तीचे २ गुण मिळवणे.', howTo: '१. जेव्हा समोरच्या टीममध्ये १-२ खेळाडू उरतात, तेव्हा आक्रमक रेड केली जाते.\n२. रेडरने जास्तीत जास्त रिस्क घेऊन त्यांना बाद करावे.', img: 'https://picsum.photos/seed/k14/600/400' },
    { title: 'लॉबी एस्केप', type: 'Offense', intensity: 'Moderate', desc: 'टच केल्यानंतर लॉबीचा वापर करून सुरक्षितरीत्या मध्यरेषेकडे जाणे.', howTo: '१. डिफेंडरला टच केल्यानंतरच लॉबी ॲक्टिव्ह होते.\n२. रेडरने मैदानाच्या कडेचा (Lobby) वापर करून शॉर्टकटने स्वतःच्या भागात जावे.', img: 'https://picsum.photos/seed/k15/600/400' }
  ],
  'Volleyball': [
    { title: '६-२ रोटेशन पॅटर्न', type: 'Rotation', intensity: 'Moderate', desc: 'दोन सेटर वापरून आक्रमणाची धार वाढवण्याची पद्धत.', howTo: '१. दोन सेटर विरुद्ध दिशेला उभे राहतात.\n२. मागच्या रांगेतील सेटर सेट करण्यासाठी पुढे येतो.\n३. यामुळे समोरच्या रांगेत नेहमी ३ अटॅकर्स उपलब्ध असतात.', img: 'https://picsum.photos/seed/v1/600/400' },
    { title: 'ट्रिपल ब्लॉक कव्हरेज', type: 'Defense', intensity: 'High', desc: 'प्रतिस्पर्धी स्पायकरला रोखण्यासाठी तीन खेळाडूंनी एकत्र उडी मारणे.', howTo: '१. समोरच्या रांगेतील तिन्ही खेळाडू स्पायकरच्या समोर एकत्र येतात.\n२. एकाच वेळी उडी मारून हातांची भिंत उभी करतात.\n३. यामुळे बॉल परत जाण्याची शक्यता ९०% वाढते.', img: 'https://picsum.photos/seed/v2/600/400' },
    { title: 'जंप सर्व्ह पीक', type: 'Offense', intensity: 'High', desc: 'उडी मारून सर्व्हिस करून बॉलची गती आणि दिशा बदलण्याचे तंत्र.', howTo: '१. बॉल हवेत उंच फेकला जातो.\n२. धावत येऊन जोरात उडी मारली जाते.\n३. हवेतच बॉलला पूर्ण ताकदीनिशी मारून विरुद्ध बाजूला पाठवले जाते.', img: 'https://picsum.photos/seed/v3/600/400' },
    { title: 'लिबेरो कव्हरेज', type: 'Defense', intensity: 'Moderate', desc: 'मैदानाच्या मागील भागात बॉल सुरक्षितरीत्या उचलण्याची लिबेरोची जबाबदारी.', howTo: '१. लिबेरो मागील भागात मध्यभागी उभा राहतो.\n२. स्पाइकचा बॉल आल्यास तो खाली वाकून तो व्यवस्थित सेटरकडे पास करतो.', img: 'https://picsum.photos/seed/v4/600/400' },
    { title: 'क्विक सेट अटॅक', type: 'Offense', intensity: 'High', desc: 'सेटरने वेगात दिलेल्या बॉलवर लगेच स्पाईक करण्याची पद्धत.', howTo: '१. सेटर आणि अटॅकरमध्ये ताळमेळ महत्त्वाचा आहे.\n२. सेटर बॉलला फक्त १-२ फूट वर उचलतो आणि अटॅकर वेगात त्याला मारतो.', img: 'https://picsum.photos/seed/v5/600/400' },
    { title: 'बॅक रो अटॅक', type: 'Offense', intensity: 'Moderate', desc: 'अटॅक लाईनच्या मागून उडी मारून स्पाईक करण्याची रणनीती.', howTo: '१. मागच्या रांगेतील खेळाडू अटॅक लाईनच्या आधी उडी घेतो.\n२. बॉल हवेत असताना त्याला मारतो.\n३. ही रणनीती समोरची टीम तयार नसताना प्रभावी ठरते.', img: 'https://picsum.photos/seed/v6/600/400' },
    { title: 'क्रॉस कोर्ट स्पाईक', type: 'Offense', intensity: 'High', desc: 'बॉल मैदानाच्या कोपऱ्यात तिरका मारून गुण मिळवण्याचे तंत्र.', howTo: '१. अटॅकर सरळ न बघता तिरक्या दिशेने स्पाईक करतो.\n२. बॉल कोपऱ्यात पडल्यामुळे डिफेंडरला तो उचलणे कठीण जाते.', img: 'https://picsum.photos/seed/v7/600/400' },
    { title: 'लाईन शॉट प्रिसीजन', type: 'Offense', intensity: 'High', desc: 'ब्लॉकला फसवून बॉल थेट साईड लाईनवर मारण्याची कला.', howTo: '१. अटॅकर ब्लॉकच्या कडेने बॉल थेट रेषेवर मारतो.\n२. यासाठी रिस्ट कंट्रोल (Wrist Control) खूप महत्त्वाचे आहे.', img: 'https://picsum.photos/seed/v8/600/400' },
    { title: 'डंप ओव्हर नेट', type: 'Offense', intensity: 'Low', desc: 'सेटरने अचानक बॉल स्पाईक न करता हळूच दुसऱ्या बाजूला टाकणे.', howTo: '१. सेटरने सेट करण्याचा बहाणा करावा.\n२. बॉल उंचावण्याऐवजी हाताच्या बोटांनी तो रिकाम्या जागी ढकलून द्यावा.', img: 'https://picsum.photos/seed/v9/600/400' },
    { title: 'डिगिंग डिफेन्स', type: 'Defense', intensity: 'Moderate', desc: 'वेगात येणारा बॉल हातांच्या साहाय्याने सुरक्षित उचलणे.', howTo: '१. दोन्ही हात एकत्र जोडून सपाट प्लॅटफॉर्म तयार करा.\n२. बॉल हातांच्या मध्यभागी लागेल याची काळजी घ्या.', img: 'https://picsum.photos/seed/v10/600/400' },
    { title: 'पॅनकेक सेव्ह', type: 'Defense', intensity: 'Extreme', desc: 'जमिनीला स्पर्श होणाऱ्या बॉलखाली तळहात ठेवून बॉल उचलण्याचे कठीण तंत्र.', howTo: '१. जेव्हा बॉल जमिनीला लागणार असतो, तेव्हा झेप घेऊन तळहात जमिनीवर सपाट ठेवा.\n२. बॉल हातावर पडून पुन्हा वर उडतो.', img: 'https://picsum.photos/seed/v11/600/400' },
    { title: 'फ्लोट सर्व्ह व्हेरिएशन', type: 'Offense', intensity: 'Low', desc: 'हवेत हेलकावे खाणारा सर्व्हिस करून डिफेंडरला गोंधळात टाकणे.', howTo: '१. बॉलला स्पायन न देता फक्त हाताने धक्का द्या.\n२. वाऱ्याच्या दाबामुळे बॉल हवेत दिशा बदलतो.', img: 'https://picsum.photos/seed/v12/600/400' },
    { title: 'डबल ब्लॉक वॉल', type: 'Defense', intensity: 'Moderate', desc: 'दोन खेळाडूंनी एकत्र ब्लॉक करून भिंत उभी करणे.', howTo: '१. मधला आणि कोपऱ्याचा खेळाडू एकत्र उडी मारतात.\n२. हात नेटच्या वरून दुसऱ्या बाजूला कललेले ठेवावेत.', img: 'https://picsum.photos/seed/v13/600/400' },
    { title: 'टॅक्टिकल टाईमआउट', type: 'Strategy', intensity: 'Low', desc: 'खेळाचा वेग कमी करण्यासाठी आणि रणनीती बदलण्यासाठी घेतलेला ब्रेक.', howTo: '१. जेव्हा समोरची टीम सलग गुण मिळवते, तेव्हा ब्रेक घ्यावा.\n२. खेळाडूंना नवीन सूचना द्याव्यात.', img: 'https://picsum.photos/seed/v14/600/400' },
    { title: 'सर्व्ह रिसीव्ह फॉर्मेशन', type: 'Defense', intensity: 'Moderate', desc: 'सर्व्हिस येताना प्रत्येक खेळाडूने आपली जागा निश्चित करणे.', howTo: '१. खेळाडू डब्लू (W) आकारात उभे राहतात.\n२. यामुळे कोर्टचा कोणताही भाग रिकामा राहत नाही.', img: 'https://picsum.photos/seed/v15/600/400' }
  ],
  'Kho Kho': [
    { title: 'पोल डायव्ह ट्रॅप', type: 'Attack', intensity: 'Extreme', desc: 'पोल जवळ असताना डिफेंडरला बाद करण्याची वेगवान पद्धत.', howTo: '१. चेझर पोलला पकडून स्वतःला पुढे झोकून देतो.\n२. हवेत असताना हात पूर्ण लांब करून डिफेंडरला स्पर्श करतो.\n३. याला पोझिशनिंग आणि टायमिंगची गरज असते.', img: 'https://picsum.photos/seed/kh1/600/400' },
    { title: 'झिग-झॅग डॉजिंग', type: 'Defense', intensity: 'High', desc: 'डिफेंडरने चेझरला थकवण्यासाठी नागमोडी धावण्याची रणनीती.', howTo: '१. डिफेंडर सरळ न धावता अचानक दिशा बदलतो.\n२. यामुळे चेझरला सारखा खो बदलावा लागतो आणि तो थकतो.', img: 'https://picsum.photos/seed/kh2/600/400' },
    { title: 'सडन खो अटॅक', type: 'Attack', intensity: 'High', desc: 'एकाएकी खो देऊन डिफेंडरला चक्रावून सोडण्याचे तंत्र.', howTo: '१. चेझरने खो देताना आवाजाचा आणि स्पर्शाचा योग्य वापर करावा.\n२. डिफेंडर तयार नसताना दिलेला खो जास्त प्रभावी ठरतो.', img: 'https://picsum.photos/seed/kh3/600/400' },
    { title: 'रिंग गेम मास्टरी', type: 'Defense', intensity: 'Moderate', desc: 'मधल्या चौकोनातून गोल फिरून वेळ काढण्याची रणनीती.', howTo: '१. डिफेंडर दोन खांबांच्या मधल्या भागात वर्तुळाकार धावतो.\n२. चेझर जेव्हा जवळ येतो, तेव्हा तो पोलकडे सरकतो.', img: 'https://picsum.photos/seed/kh4/600/400' },
    { title: 'डायरेक्शन फेक (Fake)', type: 'Attack', intensity: 'Moderate', desc: 'एका बाजूला जाण्याचा बहाणा करून दुसऱ्या बाजूला वेगात वळणे.', howTo: '१. चेझरने आपली नजर आणि शरीराचा वरचा भाग एका बाजूला झुकवावा.\n२. डिफेंडरने तिकडे धावताच चेझरने विरुद्ध दिशेला खो द्यावा.', img: 'https://picsum.photos/seed/kh5/600/400' },
    { title: 'लेट एंट्री रनिंग', type: 'Defense', intensity: 'High', desc: 'मैदानात उशिरा प्रवेश करून चेझरवर मानसिक दबाव टाकणे.', howTo: '१. नवीन डिफेंडर मैदानात येताना पूर्ण वेगात येतो.\n२. तो मैदानाच्या अशा भागात जातो जिथे चेझरला पोहोचणे कठीण आहे.', img: 'https://picsum.photos/seed/kh6/600/400' },
    { title: 'पोल टर्निंग स्पीड', type: 'Attack', intensity: 'High', desc: 'पोलला पकडून वेगात वळण्याची आणि दिशा बदलण्याची कला.', howTo: '१. पोलला एक हात लावून शरीर वेगाने फिरवा.\n२. पायांची हालचाल अशी असावी की वेग कमी होणार नाही.', img: 'https://picsum.photos/seed/kh7/600/400' },
    { title: 'डबल डायव्ह अटेम्प्ट', type: 'Attack', intensity: 'Extreme', desc: 'एकापाठोपाठ दोनदा डायव्ह मारून डिफेंडरला बाद करण्याचा प्रयत्न.', howTo: '१. पहिली डायव्ह चुकल्यावर चेझर लगेच सावरतो.\n२. पुन्हा खो देऊन किंवा स्वतःच दुसरी डायव्ह मारतो.', img: 'https://picsum.photos/seed/kh8/600/400' },
    { title: 'फ्रंट एन्ट्री डॉज', type: 'Defense', intensity: 'Moderate', desc: 'चेझरच्या समोरून निसटून जाण्याचे कौशल्य.', howTo: '१. चेझर जेव्हा समोर येतो, तेव्हा डिफेंडर आपली उंची कमी करून किंवा चकवा देऊन निघून जातो.', img: 'https://picsum.photos/seed/kh9/600/400' },
    { title: 'बॅक एन्ट्री सेव्ह', type: 'Defense', intensity: 'Moderate', desc: 'मागून येणाऱ्या चेझरपासून सुरक्षित अंतर राखणे.', howTo: '१. नेहमी चेझरच्या विरुद्ध दिशेला बघून धावा.\n२. खो देण्याचा आवाज ऐकताच वेग वाढवा.', img: 'https://picsum.photos/seed/kh10/600/400' },
    { title: 'खो टाइमिंग प्रिसीजन', type: 'Attack', intensity: 'Low', desc: 'योग्य वेळी आणि योग्य अंतरावर असतानाच खो देणे.', howTo: '१. बसलेल्या खेळाडूच्या खूप जवळ गेल्यावरच खो द्यावा.\n२. यामुळे डिफेंडरला सावरण्यासाठी वेळ मिळत नाही.', img: 'https://picsum.photos/seed/kh11/600/400' },
    { title: 'कवरिंग द पोल', type: 'Defense', intensity: 'High', desc: 'पोलच्या मागे राहून स्वतःचे संरक्षण करणे.', howTo: '१. पोलचा वापर ढाल म्हणून करा.\n२. चेझर ज्या बाजूने येईल, त्याच्या विरुद्ध बाजूला पोलला धरून उभे राहा.', img: 'https://picsum.photos/seed/kh12/600/400' },
    { title: 'स्कुअटिंग पोझिशन', type: 'Attack', intensity: 'Low', desc: 'बसलेल्या स्थितीत सतर्क राहून लगेच उठण्याची तयारी.', howTo: '१. पाय जमिनीवर घट्ट रोवून बसा.\n२. खो मिळताच स्प्रिंगसारखे वर उठा.', img: 'https://picsum.photos/seed/kh13/600/400' },
    { title: 'लॉन्ग रन डॉजिंग', type: 'Defense', intensity: 'High', desc: 'मैदानाच्या लांबीचा वापर करून धावत राहणे.', howTo: '१. मैदानाचे दोन्ही कोपरे व्यवस्थित वापरा.\n२. चेझर लांब असताना आपला वेग कमी करून ताकद वाचवा.', img: 'https://picsum.photos/seed/kh14/600/400' },
    { title: 'चेझर ट्रॅप', type: 'Attack', intensity: 'Moderate', desc: 'दोन चेझरनी मिळून धावणाऱ्या खेळाडूला कोत्यात पकडणे.', howTo: '१. एकाने डिफेंडरला कोपऱ्यात ढकलावे.\n२. दुसऱ्याने पोलकडून येऊन त्याला बाद करावे.', img: 'https://picsum.photos/seed/kh15/600/400' }
  ],
  'Handball': [
    { title: 'पिसटन मुव्हमेंट', type: 'Defense', intensity: 'Moderate', desc: 'डिफेंडरने पुढे-मागे हालचाल करून अटॅकरला रोखण्याची पद्धत.', howTo: '१. अटॅकर बॉल घेऊन जवळ येताच डिफेंडर पुढे जातो.\n२. अटॅकरने बॉल पास करताच डिफेंडर पुन्हा आपल्या जागेवर (६ मीटर लाईन) येतो.', img: 'https://picsum.photos/seed/h1/600/400' },
    { title: 'जंप शॉट पॉवर', type: 'Offense', intensity: 'High', desc: 'हवेत उडी मारून जास्तीत जास्त वेगाने बॉल गोलमध्ये टाकणे.', howTo: '१. ६ मीटर लाईनच्या आधी उडी घ्या.\n२. हवेत असताना शरीराचा पूर्ण ताण देऊन बॉल जोरात सोडा.\n३. जमिनीवर पडताना सुरक्षित लँडिंग करा.', img: 'https://picsum.photos/seed/h2/600/400' },
    { title: 'फास्ट ब्रेक अटॅक', type: 'Offense', intensity: 'Extreme', desc: 'डिफेन्सकडून बॉल मिळताच वेगाने काउंटर अटॅक करणे.', howTo: '१. बॉल हातात येताच समोरच्या विंगर्सनी वेगात धाव घ्यावी.\n२. २-३ पासेस मध्येच गोल करण्याचा प्रयत्न करावा.', img: 'https://picsum.photos/seed/h3/600/400' },
    { title: '६-० डिफेन्स वॉल', type: 'Defense', intensity: 'High', desc: 'सहा खेळाडूंनी अटॅक लाईनवर उभे राहून भिंत उभी करणे.', howTo: '१. सर्व खेळाडू एकमेकांना लागून उभे राहतात.\n२. अटॅकरला ६ मीटर लाईनच्या आत येण्यास मज्जाव करतात.', img: 'https://picsum.photos/seed/h4/600/400' },
    { title: 'बाऊन्स शॉट स्किल', type: 'Offense', intensity: 'Moderate', desc: 'बॉल जमिनीवर आपटून गोलकीपरच्या हाताखालून गोल करणे.', howTo: '१. गोलकीपरच्या समोरच्या जमिनीवर बॉल जोरात आपटा.\n२. बॉल जमिनीवरून उसळून गोलमध्ये जातो.', img: 'https://picsum.photos/seed/h5/600/400' },
    { title: 'विंग अटॅक (Wing)', type: 'Offense', intensity: 'High', desc: 'मैदानाच्या कोपऱ्यातून (विंग) वेगात गोलवर हल्ला करणे.', howTo: '१. विंग खेळाडूने कोपऱ्यातून धावत यावे.\n२. कमी अंशातून (Angle) अचूक शॉट मारण्याची तयारी ठेवावी.', img: 'https://picsum.photos/seed/h6/600/400' },
    { title: 'पिivot टर्न', type: 'Offense', intensity: 'Moderate', desc: 'मधल्या भागात खेळाडूने फिरून गोलवर शॉट मारण्याची कला.', howTo: '१. पिव्होट खेळाडू डिफेंडरला पाठीशी धरतो.\n२. बॉल मिळताच एका क्षणात वळून गोलवर हल्ला करतो.', img: 'https://picsum.photos/seed/h7/600/400' },
    { title: 'डबल क्रॉस पासिंग', type: 'Offense', intensity: 'Moderate', desc: 'दोन खेळाडूंनी जागा बदलून फसव्या पासेस देणे.', howTo: '१. दोन अटॅकर्स एकमेकांच्या समोरून धावतात.\n२. डिफेंडरला कळण्यापूर्वीच बॉल तिसऱ्या खेळाडूला पास केला जातो.', img: 'https://picsum.photos/seed/h8/600/400' },
    { title: '७-मीटर पेनल्टी', type: 'Strategy', intensity: 'High', desc: 'पेनल्टी मारताना गोलकीपरच्या हालचालीवर लक्ष ठेवून शॉट मारणे.', howTo: '१. ७ मीटर रेषेवर शांतपणे उभे राहा.\n२. गोलकीपरच्या उघड्या असलेल्या कोपऱ्यात बॉल टाका.', img: 'https://picsum.photos/seed/h9/600/400' },
    { title: 'गोलकीपर रिफ्लेक्स', type: 'Defense', intensity: 'Extreme', desc: 'अतिशय जवळून येणारा बॉल हात किंवा पायाने रोखण्याची कला.', howTo: '१. गोलकीपरने नेहमी पायांची हालचाल सुरू ठेवावी.\n२. बॉलच्या दिशेने हात किंवा पाय वेगाने न्यावा.', img: 'https://picsum.photos/seed/h10/600/400' },
    { title: 'मॅन-टू-मॅन मार्किंग', type: 'Defense', intensity: 'High', desc: 'प्रत्येक डिफेंडरने एका विशिष्ट अटॅकरवर लक्ष ठेवणे.', howTo: '१. अटॅकर कुठेही गेला तरी त्याच्यासोबत राहा.\n२. त्याला बॉल मिळू न देणे हे तुमचे मुख्य काम आहे.', img: 'https://picsum.photos/seed/h11/600/400' },
    { title: 'स्क्रिनिंग (Screening)', type: 'Offense', intensity: 'Low', desc: 'आपल्या खेळाडूला वाट मिळवून देण्यासाठी डिफेंडरचा रस्ता रोखणे.', howTo: '१. पिव्होट खेळाडू डिफेंडरच्या मार्गात उभा राहतो.\n२. बॉल-कॅरियरला शूट करण्यासाठी जागा मोकळी करून देतो.', img: 'https://picsum.photos/seed/h12/600/400' },
    { title: 'लॉन्ग रेन्ज शॉट', type: 'Offense', intensity: 'High', desc: '९ मीटर लाईनच्या बाहेरून गोलवर जोरात शॉट मारणे.', howTo: '१. डिफेंडरची भिंत तयार होण्यापूर्वीच शॉट मारा.\n२. बॉलची उंची आणि वेग यावर लक्ष द्या.', img: 'https://picsum.photos/seed/h13/600/400' },
    { title: 'पॅसिव्ह प्ले (Passive)', type: 'Strategy', intensity: 'Low', desc: 'वेळ काढण्यासाठी बॉल आपल्या ताब्यात ठेवण्याचे तंत्र.', howTo: '१. रिस्क न घेता एकमेकांना लांबचे पासेस द्या.\n२. गोलचा प्रयत्न न करता फक्त वेळ घालवा.', img: 'https://picsum.photos/seed/h14/600/400' },
    { title: 'फॉल्स विंग मुव्ह', type: 'Offense', intensity: 'Moderate', desc: 'विंगला जाण्याचा बहाणा करून मध्ये कट मारणे.', howTo: '१. विंग खेळाडूने बाहेरून धाव घ्यावी.\n२. डिफेंडर बाहेर येताच वेगाने मध्यभागी कट मारून शॉट घ्यावा.', img: 'https://picsum.photos/seed/h15/600/400' }
  ],
  'Running': [
    { title: 'स्प्रिंट स्टार्ट (Block)', type: 'Technique', intensity: 'High', desc: 'स्टार्टिंग ब्लॉक मधून बाहेर पडताना शरीराचा योग्य कोन राखणे.', howTo: '१. ब्लॉकवर पाय घट्ट रोवून बसा.\n२. "Set" म्हणताच शरीर थोडे पुढे झुकवा.\n३. शिट्टी वाजताच दोन्ही हातांनी जमिनीला धक्का देऊन स्फोटक वेगाने बाहेर पडा.', img: 'https://picsum.photos/seed/r1/600/400' },
    { title: 'एक्सेलरेशन फेज', type: 'Technique', intensity: 'Extreme', desc: 'पहिल्या १० ते २० मीटर मध्ये जास्तीत जास्त वेग मिळवण्याची कला.', howTo: '१. सुरुवातीचे १०-१५ मीटर डोकं खाली ठेवून धावा.\n२. पाय जमिनीवर जोरात आपटून जास्तीत जास्त पुश मिळवा.\n३. हळूहळू शरीर सरळ करा.', img: 'https://picsum.photos/seed/r2/600/400' },
    { title: 'मैक्सिमम व्हेलोसिटी', type: 'Technique', intensity: 'High', desc: 'धावताना हातांची आणि पायांची लयबद्ध हालचाल करून वेग टिकवणे.', howTo: '१. गुडघे वर उचलून पावलं लांब टाका.\n२. हातांची ९० अंशात हालचाल करा.\n३. शरीराला पूर्णपणे रिलॅक्स ठेवून धावण्यावर लक्ष द्या.', img: 'https://picsum.photos/seed/r3/600/400' },
    { title: 'बॅटन एक्सचेंज (Relay)', type: 'Teamwork', intensity: 'High', desc: 'रिले रेस मध्ये बॅटन देताना आणि घेताना वेग कमी न करण्याची रणनीती.', howTo: '१. बॅटन देणाऱ्याने "Hand" असा आवाज द्यावा.\n२. घेणाऱ्याने मागे न बघता हात पाठीमागे करावा.\n३. बॅटन हातात येताच वेगाने धाव सुरू करावी.', img: 'https://picsum.photos/seed/r4/600/400' },
    { title: 'फिनिशिंग लीन', type: 'Technique', intensity: 'Moderate', desc: 'फिनिश लाईनवर पोहोचताना छाती पुढे झुकवण्याची पद्धत.', howTo: '१. फिनिश लाईनच्या १ मीटर आधी छाती पुढे झुकवा.\n२. यामुळे तुमचा वेळ मायक्रो-सेकंदाने कमी होऊ शकतो.', img: 'https://picsum.photos/seed/r5/600/400' },
    { title: 'इंटरव्हल ट्रेनिंग', type: 'Training', intensity: 'High', desc: 'ठराविक अंतराने वेगाने धावणे and पुन्हा विश्रांती घेणे.', howTo: '१. ४०० मीटर वेगाने धावा.\n२. १ मिनिट विश्रांती घ्या.\n३. हे चक्र ५-६ वेळा करा.', img: 'https://picsum.photos/seed/r6/600/400' },
    { title: 'पेसिंग स्ट्रॅटेजी', type: 'Strategy', intensity: 'Moderate', desc: 'लांब अंतराच्या रेस मध्ये सुरुवातीला वेग नियंत्रित ठेवणे.', howTo: '१. रेसच्या सुरुवातीला सर्वांच्या मागे राहून ऊर्जा वाचवा.\n२. शेवटच्या ४०० मीटरमध्ये पूर्ण ताकद लावा.', img: 'https://picsum.photos/seed/r7/600/400' },
    { title: 'हाय नी ड्राइव्ह', type: 'Technique', intensity: 'Moderate', desc: 'धावताना गुडघे वर उचलून पावलाची लांबी वाढवणे.', howTo: '१. धावताना गुडघे कंबरेच्या उंचीपर्यंत वर उचला.\n२. जमिनीला टाच न लावता फक्त पुढच्या पायावर धावा.', img: 'https://picsum.photos/seed/r8/600/400' },
    { title: 'आर्म स्विंग कंट्रोल', type: 'Technique', intensity: 'Low', desc: 'हातांच्या हालचालीचा वापर वेगाला दिशा देण्यासाठी करणे.', howTo: '१. हात कंबरेपासून खांद्यापर्यंत वेगाने हलवा.\n२. हातांची हालचाल जेवढी वेगवान, तेवढे पाय वेगाने चालतील.', img: 'https://picsum.photos/seed/r9/600/400' },
    { title: 'ब्रिदिंग रिदम', type: 'Technique', intensity: 'Low', desc: 'श्वास घेण्याची आणि सोडण्याची लय धावण्याशी जुळवणे.', howTo: '१. २ पावलं श्वास घ्या, २ पावलं श्वास सोडा.\n२. यामुळे फुफ्फुसांना ऑक्सिजनचा पुरवठा सतत होतो.', img: 'https://picsum.photos/seed/r10/600/400' },
    { title: 'रिॲक्शन स्पीड ड्रील', type: 'Training', intensity: 'High', desc: 'बंदुकीच्या आवाजावर किंवा शिटीवर त्वरित प्रतिसाद देण्याची तालीम.', howTo: '१. आवाजाचा अंदाज न घेता त्वरित हालचाल करा.\n२. एकाग्रता वाढवणे हे याचे मुख्य ध्येय आहे.', img: 'https://picsum.photos/seed/r11/600/400' },
    { title: 'लॅक्टिक ॲसिड टॉलरन्स', type: 'Training', intensity: 'Extreme', desc: 'थकवा आल्यानंतरही वेग टिकवून ठेवण्याची शारीरिक क्षमता.', howTo: '१. शरीराला थकव्याच्या स्थितीत नेऊन सराव करा.\n२. यामुळे प्रत्यक्ष स्पर्धेत शेवटच्या क्षणी फायदा होतो.', img: 'https://picsum.photos/seed/r12/600/400' },
    { title: 'स्ट्राईड लांबी', type: 'Technique', intensity: 'Moderate', desc: 'धावताना टाचा न आपटता पावले जास्तीत जास्त लांब टाकणे.', howTo: '१. प्रत्येक पाऊल टाकताना जमिनीला जोरात धक्का द्या.\n२. हवेत जास्तीत जास्त वेळ राहण्याचा प्रयत्न करा.', img: 'https://picsum.photos/seed/r13/600/400' },
    { title: 'अपहिल स्प्रिंट्स', type: 'Training', intensity: 'High', desc: 'चढणीवर वेगाने धावून पायांची ताकद वाढवणे.', howTo: '१. २०-३० मीटरच्या चढावर वेगाने धावा.\n२. पुन्हा चालत खाली या.\n३. यामुळे मांडीचे स्नायू मजबूत होतात.', img: 'https://picsum.photos/seed/r14/600/400' },
    { title: 'डाऊनहिल कंट्रोल', type: 'Technique', intensity: 'Moderate', desc: 'उतारावर धावताना शरीराचा समतोल राखणे.', howTo: '१. उतारावर धावताना वेग नियंत्रित ठेवा.\n२. डोकं सरळ ठेवा आणि पडण्याची भीती टाळा.', img: 'https://picsum.photos/seed/r15/600/400' }
  ]
};

export function TacticalPlaybook({ store, preselectedSport }: { store: any, preselectedSport?: string }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(preselectedSport || "Kabaddi");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedStrat, setSelectedStrat] = useState<any | null>(null);
  
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
               <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em]">Elite Tactical Playbook v4.3.12</p>
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
              <Sword className="w-7 h-7 text-accent" /> {activeSport} Formations
            </h3>
            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-full bg-white shadow-sm">Official Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strat, idx) => (
              <Card key={idx} onClick={() => setSelectedStrat(strat)} className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-accent transition-all group shadow-xl cursor-pointer active:scale-95">
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
                 <CardContent className="p-8 space-y-4">
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed line-clamp-2 italic border-l-4 border-accent/20 pl-4">
                      &quot;{strat.desc}&quot;
                    </p>
                    <div className="flex items-center text-[10px] font-black text-accent uppercase tracking-widest gap-2">
                       Learn How To Play <ChevronRight className="w-3 h-3" />
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

      <Dialog open={!!selectedStrat} onOpenChange={() => setSelectedStrat(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-3xl bg-white flex flex-col max-h-[90vh]">
          {selectedStrat && (
            <>
              <DialogHeader className="bg-primary p-10 text-white relative shrink-0">
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                    <CirclePlay className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">{selectedStrat.title}</DialogTitle>
                    <div className="flex items-center gap-2">
                       <Badge className="bg-accent text-white font-black text-[8px] uppercase px-3 border-0">{selectedStrat.type}</Badge>
                       <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{selectedStrat.intensity} Intensity</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="p-10 space-y-8">
                  <div className="aspect-video relative rounded-[2rem] overflow-hidden border-4 border-primary/5 shadow-inner bg-muted">
                    <Image src={selectedStrat.img} alt={selectedStrat.title} fill className="object-cover" unoptimized />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Info className="w-4 h-4" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Execution Blueprint (कसे खेळावे)</h4>
                    </div>
                    <div className="bg-muted/30 p-8 rounded-3xl border-2 border-dashed border-muted">
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic whitespace-pre-wrap">
                        &quot;{selectedStrat.howTo}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/5 flex items-start gap-4">
                     <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                     <p className="text-[11px] font-bold text-primary/70 leading-relaxed uppercase tracking-tight">
                       This tactic is part of the Waghamba Institutional Registry and follows official national federation standards.
                     </p>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-10 bg-slate-50 border-t shrink-0">
                <Button 
                  onClick={() => setSelectedStrat(null)}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active-scale"
                >
                  Close Technical Guide
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
