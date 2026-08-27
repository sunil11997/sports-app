import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// COMPREHENSIVE MARATHI NAME DICTIONARY & INTELLIGENT PHONETIC ENGINE
// Covers 500+ First Names, Middle Names, Surnames, Local Tribal / Ashram Shala Names
// (Nashik, Baglan, Satana, Kalwan, Surgana, Dindori, Nandurbar, Dhule, Thane, Palghar)
// ============================================================================
const COMMON_MARATHI_NAMES: Record<string, string> = {
  // First Names (Male) - Standard & Common Misspellings / Typo Variations
  rahul: 'राहुल', rahool: 'राहुल', raahul: 'राहुल', rhaul: 'राहुल',
  ramesh: 'रमेश', rames: 'रमेश', rameshji: 'रमेश', rameshbhai: 'रमेश',
  suresh: 'सुरेश', sures: 'सुरेश', sureshji: 'सुरेश', sureshh: 'सुरेश',
  ganesh: 'गणेश', ganes: 'गणेश', ganeshji: 'गणेश', ganeshh: 'गणेश',
  mahesh: 'महेश', mahes: 'महेश', maheshji: 'महेश',
  dinesh: 'दिनेश', dines: 'दिनेश', dineshji: 'दिनेश',
  vijay: 'विजय', vijey: 'विजय', vjay: 'विजय',
  ajay: 'अजय', ajey: 'अजय', ajji: 'अजय',
  amit: 'अमित', amith: 'अमित', ameet: 'अमित',
  amol: 'अमोल', amolji: 'अमोल',
  aniket: 'अनिकेत', aneeket: 'अनिकेत', ankush: 'अंकुश', anku: 'अंकू',
  akshay: 'अक्षय', axay: 'अक्षय', akshaye: 'अक्षय', akshya: 'अक्षय',
  aditya: 'आदित्य', aaditya: 'आदित्य', adity: 'आदित्य',
  abhishek: 'अभिषेक', abhishekh: 'अभिषेक', abhi: 'अभि',
  rohan: 'रोहन', rohon: 'रोहन', rodhan: 'रोधन',
  sachin: 'सचिन', sacheen: 'सचिन', sachinji: 'सचिन',
  sunil: 'सुनील', suneel: 'सुनील', sonil: 'सुनील',
  anil: 'अनिल', aneel: 'अनिल', aneell: 'अनिल',
  santosh: 'संतोष', santos: 'संतोष', santoshji: 'संतोष',
  samir: 'समीर', sameer: 'समीर', sammer: 'समीर',
  nitin: 'नितीन', niteen: 'नितीन', neetin: 'नितीन',
  pravin: 'प्रवीण', praveen: 'प्रवीण', pravind: 'प्रवीण',
  pradeep: 'प्रदीप', pradip: 'प्रदीप', pradeeep: 'प्रदीप',
  prashant: 'प्रशांत', prashanth: 'प्रशांत', prasant: 'प्रशांत',
  pranam: 'प्रणाम', prasad: 'प्रसाद', prasanna: 'प्रसन्न',
  om: 'ओम', aum: 'ओम', ohm: 'ओम',
  omkar: 'ओंकार', onkar: 'ओंकार', omkaar: 'ओंकार',
  aarav: 'आरव', arav: 'आरव', aryan: 'आर्यन', ariyan: 'आर्यन',
  shivam: 'शिवम', sivam: 'शिवम', shiv: 'शिव',
  krishna: 'कृष्णा', krushna: 'कृष्णा', kishna: 'किष्णा', krishnaji: 'कृष्णा',
  ram: 'राम', rama: 'रामा', ramji: 'राम', ramdas: 'रामदास',
  tanmay: 'तन्मय', tanmey: 'तन्मय', tanmayi: 'तन्मयी',
  rushikesh: 'ऋषिकेश', hrishikesh: 'ऋषिकेश', rishikesh: 'ऋषिकेश', rusi: 'ऋषी',
  sanket: 'संकेत', sanketh: 'संकेत', sonket: 'संकेत',
  prathamesh: 'प्रथमेश', prathmesh: 'प्रथमेश', prathameshji: 'प्रथमेश',
  swapnil: 'स्वप्निल', swaphnil: 'स्वप्निल', swpanil: 'स्वप्निल', swapneel: 'स्वप्निल',
  sourabh: 'सौरभ', saurabh: 'सौरभ', shourabh: 'सौरभ',
  shubham: 'शुभम', subham: 'शुभम', shubh: 'शुभ',
  utkarsh: 'उत्कर्ष', utkars: 'उत्कर्ष',
  chinmay: 'चिन्मय', chinmey: 'चिन्मय',
  tushar: 'तुषार', tusar: 'तुषार',
  kiran: 'किरण', keeran: 'किरण', kiranji: 'किरण',
  chetan: 'चेतन', chaitan: 'चेतन',
  shrikant: 'श्रीकांत', srikant: 'श्रीकांत', shreekanth: 'श्रीकांत',
  shripad: 'श्रीपाद', sripad: 'श्रीपाद', shreepad: 'श्रीपाद',
  harish: 'हरीश', haresh: 'हरेश', haris: 'हरीश',
  rajesh: 'राजेश', rajes: 'राजेश', rajeshji: 'राजेश',
  yogesh: 'योगेश', yoges: 'योगेश', yogeshji: 'योगेश',
  rohit: 'रोहित', rohith: 'रोहित',
  vikas: 'विकास', vikash: 'विकास', veekas: 'विकास',
  vishal: 'विशाल', veeshal: 'विशाल', visal: 'विशाल',
  vivek: 'विवेक', veevek: 'विवेक',
  sandeep: 'संदीप', sandip: 'संदीप', sandeepji: 'संदीप',
  deepak: 'दीपक', dipak: 'दीपक', deepakji: 'दीपक',
  manoj: 'मनोज', manojji: 'मनोज',
  gautam: 'गौतम', goutham: 'गौतम',
  ashok: 'अशोक', ashokji: 'अशोक', asok: 'अशोक',
  vinod: 'विनोद', vinodji: 'विनोद',
  kailas: 'कैलास', kailash: 'कैलास', kailashji: 'कैलास',
  balu: 'बाळू', baloo: 'बाळू', bhagwan: 'भगवान', bhagwaan: 'भगवान',
  pandurang: 'पांडुरंग', pandurangji: 'पांडुरंग', pandu: 'पांडू',
  gopal: 'गोपाळ', gopalji: 'गोपाळ',
  shankar: 'शंकर', shanker: 'शंकर', sankar: 'शंकर', shankarji: 'शंकर',
  shivaji: 'शिवाजी', sambhaji: 'संभाजी', tanaji: 'तानाजी',
  anand: 'आनंद', aakash: 'आकाश', akash: 'आकाश', aakashji: 'आकाश',
  tejas: 'तेजस', tejes: 'तेजस',
  vaibhav: 'वैभव', vaibhev: 'वैभव',
  dnyaneshwar: 'ज्ञानेश्वर', dnyneshwar: 'ज्ञानेश्वर', dhyaneshwar: 'ज्ञानेश्वर',
  dnyaneshwer: 'ज्ञानेश्वर', dhyaneshwer: 'ज्ञानेश्वर', jnyaneshwar: 'ज्ञानेश्वर',
  dnyandev: 'ज्ञानदेव', dnyanesh: 'ज्ञानेश',
  siddharth: 'सिद्धार्थ', sidharth: 'सिद्धार्थ',
  samadhan: 'समाधान', samadhanji: 'समाधान',
  motiram: 'मोतीराम', devidas: 'देवीदास', devidasji: 'देवीदास',
  hiraman: 'हिरामन', barku: 'बारकू', damu: 'दामू', kisan: 'किसन',
  tulshiram: 'तुळशीराम', tulshiramji: 'तुळशीराम', tulsiram: 'तुळशीराम',
  chaitanya: 'चैतन्य', harshad: 'हर्षद', harsh: 'हर्ष', harshal: 'हर्षल',
  yash: 'यश', atharva: 'अथर्व', atharv: 'अथर्व',
  vedant: 'वेदांत', virat: 'विराट', kapil: 'कपिल',
  mayur: 'मयूर', mayoor: 'मयूर',
  siddhesh: 'सिद्धेश', siddhes: 'सिद्धेश',
  avinash: 'अविनाश', avinas: 'अविनाश',
  bhushan: 'भूषण', bhusan: 'भूषण', bhooshan: 'भूषण',
  nilesh: 'निलेश', niles: 'निलेश',
  pankaj: 'पंकज', pankej: 'पंकज',
  digambar: 'दिगंबर', bhavesh: 'भावेश', kalpesh: 'कल्पेश',
  chandrakant: 'चंद्रकांत', laxman: 'लक्ष्मण', lakshman: 'लक्ष्मण', laximan: 'लक्ष्मण', luxman: 'लक्ष्मण',
  bharat: 'भरत', bharath: 'भरत',
  dattatray: 'दत्तात्रय', dattatraya: 'दत्तात्रय', datta: 'दत्ता', dattaji: 'दत्ता',
  kashinath: 'काशिनाथ', kasinath: 'काशिनाथ', somnath: 'सोमनाथ', somnathji: 'सोमनाथ',
  jagdish: 'जगदीश', jagadish: 'जगदीश', mukesh: 'मुकेश', naresh: 'नरेश',
  umesh: 'उमेश', hitesh: 'हितेश', kamlesh: 'कमलेश', mangesh: 'मंगेश',
  jayesh: 'जयेश', gajendra: 'गजेन्द्र', rajendra: 'राजेन्द्र', mahendra: 'महेंद्र',
  devendra: 'देवेंद्र', jitendra: 'जितेंद्र', dharmendra: 'धर्मेंद्र', virendra: 'वीरेंद्र',
  ravindra: 'रवींद्र', raveendra: 'रवींद्र', ravindr: 'रवींद्र',
  dadaji: 'दादाजी', arjun: 'अर्जुन', arzoon: 'अर्जुन',
  shravan: 'श्रावण', sravan: 'श्रावण', sravankumar: 'श्रावण',
  bhavdas: 'भावदास', bhawdas: 'भावदास',
  haresh: 'हरेश', hareshji: 'हरेश', roshan: 'रोशन', roshon: 'रोशन',
  ashwin: 'अश्विन', aswin: 'अश्विन', ashvini: 'अश्विन',
  uniram: 'उणीराम', uniramji: 'उणीराम', parshuram: 'परशुराम', parsaram: 'परशुराम',
  vishwsh: 'विश्वास', vishwas: 'विश्वास', gangram: 'गंगाराम', gangaram: 'गंगाराम',
  manohar: 'मनोहर', sanjay: 'संजय', sonjay: 'संजय',
  bebilal: 'बेबीलाल', raju: 'राजू', rajoo: 'राजू',
  devram: 'देवराम', dattu: 'दत्तू', kalu: 'काळू',
  popat: 'पोपट', sitaram: 'सीताराम', shantaram: 'शांताराम',
  soma: 'सोमा', dhalu: 'ढाळू', valu: 'वाळू', gotu: 'गोटू',
  madhu: 'मधू', prabhu: 'प्रभू', ragunath: 'रघुनाथ', raghunath: 'रघुनाथ',
  sajan: 'साजन', bajan: 'भाजन', chotiram: 'छोतीराम', chotiramji: 'छोतीराम',
  karan: 'करण', ravi: 'रवी', rave: 'रवी', hareshbhai: 'हरेश',
  sandipkumar: 'संदीप', sunilkumar: 'सुनील', anilkumar: 'अनिल',

  // First Names (Female) - Standard & Common Misspellings / Typo Variations
  priya: 'प्रिया', preeya: 'प्रिया',
  pooja: 'पूजा', puja: 'पूजा', pujha: 'पूजा', puza: 'पूजा', poojah: 'पूजा',
  sneha: 'स्नेहा', snehaji: 'स्नेहा',
  swati: 'स्वाती', swatee: 'स्वाती', svati: 'स्वाती',
  neha: 'नेहा', nayha: 'नेहा', nisha: 'निशा', neesha: 'निशा',
  kavita: 'कविता', kaveeta: 'कविता',
  sunita: 'सुनिता', suneeta: 'सुनिता', sonita: 'सुनिता',
  anita: 'अनिता', aneeta: 'अनिता',
  sangita: 'संगीता', sangeeta: 'संगीता', sangeta: 'संगीता',
  aarti: 'आरती', arti: 'आरती', aartii: 'आरती',
  shreya: 'श्रेया', sreya: 'श्रेया',
  sakshi: 'साक्षी', saakshi: 'साक्षी', sakshii: 'साक्षी',
  vaishnavi: 'वैष्णवी', vaishnvi: 'वैष्णवी', vaishanavi: 'वैष्णवी',
  tanvi: 'तन्वी', tanvee: 'तन्वी', isha: 'ईशा', eesha: 'ईशा',
  radha: 'राधा', radhika: 'राधिका',
  gauri: 'गौरी', gowri: 'गौरी', gaury: 'गौरी',
  ananya: 'अनन्या', komal: 'कोमल',
  shital: 'शीतल', sheetal: 'शीतल', sital: 'शीतल',
  shubhangi: 'शुभांगी', subhangi: 'शुभांगी', shubhangii: 'शुभांगी',
  rohini: 'रोहिणी', roheeni: 'रोहिणी',
  yogita: 'योगिता', yogeeta: 'योगिता',
  ashwini: 'अश्विनी', aswini: 'अश्विनी', ashvini: 'अश्विनी',
  priyanka: 'प्रियंका', priyaka: 'प्रियंका',
  pratiksha: 'प्रतीक्षा', prateeksha: 'प्रतीक्षा', prathiksha: 'प्रतीक्षा',
  harshada: 'हर्षदा', harshali: 'हर्षाली', harshai: 'हर्षाली',
  rutuja: 'ऋतुजा', rutu: 'ऋतू', ritu: 'ऋतू', reetu: 'ऋतू',
  payal: 'पायल', paayal: 'पायल',
  pallavi: 'पल्लवी', palavi: 'पल्लवी',
  punam: 'पूनम', poonam: 'पूनम',
  rekha: 'रेखा', rekhaji: 'रेखा',
  meena: 'मीना', mina: 'मीना', seema: 'सीमा', sima: 'सीमा',
  rani: 'राणी', ranee: 'राणी',
  savita: 'सविता', saveeta: 'सविता', sarita: 'सरिता', sareeta: 'सरिता',
  manjusha: 'मंजूषा', manisha: 'मनीषा', maneesha: 'मनीषा',
  kalpana: 'कल्पना', durga: 'दुर्गा', sita: 'सीता', seeta: 'सीता',
  geeta: 'गीता', gita: 'गीता', lata: 'लता', mamta: 'ममता',
  urmila: 'उर्मिला', anjali: 'अंजली', anjalee: 'अंजली',
  dipali: 'दीपाली', deepali: 'दीपाली', depali: 'दीपाली',
  pranali: 'प्रणाली', sonali: 'सोनाली', monali: 'मोनाली',
  rupali: 'रूपाली', roopali: 'रूपाली',
  shweta: 'श्वेता', sweta: 'श्वेता', sveta: 'श्वेता',
  monika: 'मोनिका', snehal: 'स्नेहल', tejaswini: 'तेजस्विनी',
  divya: 'दिव्या', diya: 'दिया', vaishali: 'वैशाली',
  kajal: 'काजल', karishma: 'करिश्मा', kareeshma: 'करिश्मा',
  jyoti: 'ज्योती', jyotee: 'ज्योती',
  bhagyashree: 'भाग्यश्री', bhagyashri: 'भाग्यश्री', bhaghsree: 'भाग्यश्री',
  namrata: 'नम्रता', madhuri: 'माधुरी', madhari: 'माधुरी',
  archana: 'अर्चना', bhavana: 'भावना', bhavna: 'भावना',
  chaitali: 'चैताली', chhaya: 'छाया', chaya: 'छाया',
  deepti: 'दीप्ती', dipti: 'दीप्ती', gayatri: 'गायत्री', gaytri: 'गायत्री',
  kirti: 'कीर्ती', keerti: 'कीर्ती', krutika: 'कृतिका', kritika: 'कृतिका',
  madhavi: 'माधवी', mohini: 'मोहिनी', moheeni: 'मोहिनी',
  neeta: 'नीता', nita: 'नीता', nikita: 'निकिता',
  nilam: 'नीलम', neelam: 'नीलम', pranjal: 'प्रांजल',
  pratibha: 'प्रतिभा', preeti: 'प्रीती', priti: 'प्रीती',
  rajashree: 'राजश्री', rajashri: 'राजश्री', rakhi: 'राखी',
  rashmi: 'रश्मी', renuka: 'रेणुका', riddhi: 'रिद्धी',
  sandhya: 'संध्या', sanika: 'सानिका', sayali: 'सायली',
  sharda: 'शारदा', shilpa: 'शिल्पा', shivani: 'शिवानी',
  shravani: 'श्रावणी', shrutika: 'श्रुतिका', shruti: 'श्रुती',
  simran: 'सिमरन', sonal: 'सोनल', soniya: 'सोनिया', sonia: 'सोनिया',
  sudha: 'सुधा', sujata: 'सुजाता', sukanya: 'सुकन्या',
  suman: 'सुमन', supriya: 'सुप्रिया', surabhi: 'सुरभी', surbhi: 'सुरभी',
  surekha: 'सुरेखा', sushma: 'सुष्मा', sushila: 'सुशीला',
  suvarna: 'सुवर्णा', swara: 'स्वरा', tanuja: 'तनुजा',
  trupti: 'तृप्ती', urvashi: 'उर्वशी', vandana: 'वंदना',
  varsha: 'वर्षा', vidya: 'विद्या', vijaya: 'विजया',
  vrushali: 'वृषाली', laxmi: 'लक्ष्मी', lakshmi: 'लक्ष्मी',
  anusaya: 'अनुसया', anusuya: 'अनुसया', asha: 'आशा',
  pinti: 'पिंटी', dhanshree: 'धनश्री', dhanashri: 'धनश्री', dhanashree: 'धनश्री',
  dhavali: 'ढवळी', kalyani: 'कल्याणी', roshni: 'रोशनी',
  gagruti: 'जागृती', jagruti: 'जागृती', jagruthi: 'जागृती',
  ravina: 'रवीना', tulshi: 'तुळशी', tulsi: 'तुळशी',
  manju: 'मंजू', anju: 'अंजू', sanjana: 'संजना',
  pragati: 'प्रगती',

  // Surnames / Family Names (Standard & Local Ashram Shala Surnames)
  patil: 'पाटील', pateel: 'पाटील', paatil: 'पाटील', patille: 'पाटील',
  pawar: 'पवार', pawaar: 'पवार', pawara: 'पवारा', pavar: 'पवार', pavarr: 'पवार',
  shinde: 'शिंदे', sheende: 'शिंदे', sinde: 'शिंदे', shindey: 'शिंदे',
  deshmukh: 'देशमुख', deshmuk: 'देशमुख', desmukh: 'देशमुख',
  kulkarni: 'कुलकर्णी', koolkarni: 'कुलकर्णी',
  jadhav: 'जाधव', jadav: 'जाधव', jaadhav: 'जाधव',
  gaikwad: 'गायकवाड', gayakwad: 'गायकवाड', gaykwad: 'गायकवाड', gaikawad: 'गायकवाड',
  chavan: 'चव्हाण', chavhan: 'चव्हाण', chawan: 'चव्हाण',
  joshi: 'जोशी', joshee: 'जोशी',
  kadam: 'कदम', more: 'मोरे', morey: 'मोरे',
  kale: 'काळे', kaley: 'काळे', thorat: 'थोरात',
  sawant: 'सावंत', saavant: 'सावंत',
  bhosale: 'भोसले', bhosle: 'भोसले',
  salunkhe: 'साळुंखे', salunke: 'साळुंखे',
  jagtap: 'जगताप', ghurde: 'घुरडे', ghurdey: 'घुरडे',
  wagh: 'वाघ', kamble: 'कांबळे', kambley: 'कांबळे',
  mane: 'माने', maney: 'माने',
  nikam: 'निकम', neekam: 'निकम',
  ingale: 'इंगळे', ingole: 'इंगोळे',
  mankar: 'मानकर', kharat: 'खरात', zope: 'झोपे', gore: 'गोरे',
  auti: 'औटी', shelke: 'शेळके', sutar: 'सुतार',
  sonawane: 'सोनवणे', sonwane: 'सोनवणे', sonawne: 'सोनवणे', sonavane: 'सोनवणे', sonavne: 'सोनवणे',
  landge: 'लांडगे', ghode: 'घोडे',
  bagul: 'बागुल', baagul: 'बागुल', bagool: 'बागुल',
  mahale: 'महाले', mahaale: 'महाले', mahaley: 'महाले',
  chaudhari: 'चौधरी', chaudhary: 'चौधरी', choudhari: 'चौधरी', choudhary: 'चौधरी', chodhari: 'चौधरी',
  borse: 'बोरसे', borase: 'बोरसे', borsey: 'बोरसे',
  ahire: 'अहिरे', aahire: 'अहिरे', aheere: 'अहिरे', ahirey: 'अहिरे',
  gangurde: 'गांगुर्डे', gaangurde: 'गांगुर्डे', gangurdey: 'गांगुर्डे',
  bhamare: 'भामरे', bhamre: 'भामरे', bhaamre: 'भामरे', bhamarey: 'भामरे',
  hire: 'हिरे', hirey: 'हिरे',
  pingle: 'पिंगळे', pingale: 'पिंगळे', pingley: 'पिंगळे',
  deore: 'देवरे', devre: 'देवरे', devare: 'देवरे', deorey: 'देवरे',
  kapadnis: 'कापडणीस', khairnar: 'खैरनार', kheirnar: 'खैरनार', khairnaar: 'खैरनार',
  kuwar: 'कुंवर', kunwar: 'कुंवर',
  gavit: 'गावीत', gaavit: 'गावीत', gawit: 'गावीत', gavith: 'गावीत',
  valvi: 'वळवी', walvi: 'वळवी', valvee: 'वळवी',
  padvi: 'पाडवी', padavi: 'पाडवी', paadvi: 'पाडवी',
  vasave: 'वसावे', vasawe: 'वसावे', wasave: 'वसावे', wasawe: 'वसावे', vasawa: 'वसावे',
  thakre: 'ठाकरे', thakare: 'ठाकरे', thaakre: 'ठाकरे',
  malche: 'माळचे', dhangar: 'धनगर',
  kokani: 'कोकणी', kokane: 'कोकणे', konkani: 'कोकणी', konkane: 'कोकणे',
  barde: 'बर्डे', bendre: 'बेंद्रे', bendke: 'बेंदके',
  gavali: 'गवळी', gavali: 'गवळी', gavli: 'गवळी',
  shewale: 'शेवाळे', shevale: 'शेवाळे',
  suryavanshi: 'सूर्यवंशी', suryawanshi: 'सूर्यवंशी', suryavansi: 'सूर्यवंशी',
  rathod: 'राठोड', rathode: 'राठोड',
  chothe: 'चोथे', bhavsar: 'भावसार',
  bhoye: 'भोये', bhoy: 'भोये', bhoyeji: 'भोये',
  dhum: 'धूम', dhumal: 'धुमाळ',
  waghmare: 'वाघमारे', waghmaare: 'वाघमारे', waghmarey: 'वाघमारे',
  gangode: 'गांगोडे', chaure: 'चौरे', chure: 'चौरे',
  tadvi: 'तडवी', raut: 'राऊत', rawat: 'रावत',
  bhadane: 'भदाणे', birari: 'बिरारी', bachhav: 'बच्छाव',
  chitte: 'चित्ते', derle: 'डेर्ले', dhikale: 'ढिकले', dhongade: 'धोंगडे',
  gaidhani: 'गायधनी', godse: 'गोडसे', govardhane: 'गोवर्धन', gunjal: 'गुंजाळ',
  kandekar: 'कांदेकर', katkade: 'काटकडे', kokate: 'कोकाटे', kotwal: 'कोतवाल',
  lonari: 'लोणारी', mandlik: 'मांडलिक', mogal: 'मोगल', nandre: 'नांद्रे',
  pachorkar: 'पाचोरकर', pagar: 'पगार', palde: 'पाळदे', panpatil: 'पानपाटील',
  pardeshi: 'परदेशी', pekhale: 'पेखळे', rasal: 'रसाळ',
  sanap: 'सानप', sangle: 'सांगळे', satpute: 'सातपुते', shirke: 'शिर्के',
  shirath: 'शिराठ', somvanshi: 'सोमवंशी', somwanshi: 'सोमवंशी',
  tadge: 'तडगे', tambat: 'तांबट', tamboli: 'तांबोळी', tarle: 'तरळे',
  thete: 'ठेठे', toche: 'तोचे', ugale: 'उगले', vaidya: 'वैद्य',
  varpe: 'वारपे', vijapure: 'विजापूरे', waje: 'वाजे', wakchaure: 'वाकचौरे',
  walunj: 'वाळुंज', wani: 'वाणी', yadav: 'यादव', yeole: 'येवले',
  zhalte: 'झालटे', gite: 'गिते', bhalerao: 'भालेराव', misal: 'मिसाळ',
  khade: 'खाडे', lokhande: 'लोखंडे', koli: 'कोळी', bhil: 'भिल्ल',
  mali: 'माळी', jople: 'जोपळे', khandavi: 'खंडावी', khair: 'खैर',
  kamdi: 'कामडी', bahiram: 'बहिराम',

  // Local Places & Academic / Sports Words
  waghamba: 'वाघंबा', baglan: 'बागलाण', satana: 'सटाणा', nashik: 'नाशिक',
  kalwan: 'कळवण', surgana: 'सुरगाणा', dindori: 'दिंडोरी',
  ashram: 'आश्रम', shala: 'शाळा', madhyamik: 'माध्यमिक', shaskiya: 'शासकीय',
  kabaddi: 'कबड्डी', volleyball: 'व्हॉलीबॉल', handball: 'हँडबॉल', khokho: 'खो-खो',
  running: 'धावणे', athletics: 'ॲथलेटिक्स', yoga: 'योग', pt: 'पीटी',
  general: 'सर्वसाधारण', athlete: 'खेळाडू', student: 'विद्यार्थी',
  primary: 'प्राथमिक', secondary: 'माध्यमिक', teacher: 'शिक्षक'
};

/**
 * Fast Levenshtein Distance for fuzzy typo matching
 */
function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const len1 = s1.length;
  const len2 = s2.length;
  const prevRow = new Array(len2 + 1);
  const currRow = new Array(len2 + 1);

  for (let j = 0; j <= len2; j++) {
    prevRow[j] = j;
  }

  for (let i = 0; i < len1; i++) {
    currRow[0] = i + 1;
    const c1 = s1.charCodeAt(i);

    for (let j = 0; j < len2; j++) {
      const c2 = s2.charCodeAt(j);
      const cost = c1 === c2 ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1,       // Insertion
        prevRow[j + 1] + 1,   // Deletion
        prevRow[j] + cost     // Substitution
      );
    }

    for (let j = 0; j <= len2; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return prevRow[len2];
}

/**
 * Fuzzy dictionary matcher: searches dictionary with typo tolerance
 */
function findClosestMarathiName(word: string): string | null {
  const clean = word.toLowerCase().trim();
  if (COMMON_MARATHI_NAMES[clean]) {
    return COMMON_MARATHI_NAMES[clean];
  }

  // Pre-normalize common phonetic digraphs
  const normalized = clean
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ph/g, 'f')
    .replace(/shh/g, 'sh')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j');

  if (COMMON_MARATHI_NAMES[normalized]) {
    return COMMON_MARATHI_NAMES[normalized];
  }

  let bestMatch: string | null = null;
  let minDistance = 999;
  const maxAllowedDist = clean.length <= 4 ? 1 : clean.length <= 8 ? 2 : 3;

  for (const [key, devanagari] of Object.entries(COMMON_MARATHI_NAMES)) {
    if (Math.abs(key.length - clean.length) > maxAllowedDist) continue;
    
    // First letter should ideally match
    if (key[0] !== clean[0] && !(clean[0] === 'w' && key[0] === 'v') && !(clean[0] === 'v' && key[0] === 'w') && !(clean[0] === 'f' && key[0] === 'p')) {
      continue;
    }

    const dist = levenshteinDistance(clean, key);
    if (dist < minDistance && dist <= maxAllowedDist) {
      minDistance = dist;
      bestMatch = devanagari;
      if (dist === 1) break; // Good enough match found
    }
  }

  return bestMatch;
}

/**
 * Syllabic & Conjunct Phonetic Transliteration Engine
 */
function transliterateWord(word: string): string {
  const clean = word.trim();
  if (!clean) return '';
  
  // If already contains Devanagari characters, preserve as-is
  if (/[\u0900-\u097F]/.test(clean)) {
    return clean;
  }

  const lower = clean.toLowerCase();

  // 1. Direct Dictionary or Fuzzy Typo Match
  const fuzzyMatch = findClosestMarathiName(lower);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  // 2. Suffix Decomposition (e.g. -rao, -bhau, -bai, -tai, -das, -nath, -ram, -dev, -kant, -prasad)
  const commonSuffixes: Array<[string, string]> = [
    ['raoji', 'रावजी'], ['rao', 'राव'], ['bhai', 'भाई'], ['bhau', 'भाऊ'],
    ['kumar', 'कुमार'], ['kumari', 'कुमारी'], ['devi', 'देवी'], ['bai', 'बाई'],
    ['tai', 'ताई'], ['nath', 'नाथ'], ['das', 'दास'], ['ramji', 'रामजी'],
    ['ram', 'राम'], ['dev', 'देव'], ['deo', 'देव'], ['prasad', 'प्रसाद'],
    ['kant', 'कांत'], ['lal', 'लाल'], ['singh', 'सिंग'], ['wanshi', 'वंशी'],
    ['vanshi', 'वंशी'], ['kar', 'कर'], ['wale', 'वाले'], ['vale', 'वाले']
  ];

  for (const [sfx, sfxDev] of commonSuffixes) {
    if (lower.length > sfx.length + 2 && lower.endsWith(sfx)) {
      const base = lower.slice(0, -sfx.length);
      const baseMatch = findClosestMarathiName(base);
      if (baseMatch) {
        return baseMatch + sfxDev;
      }
    }
  }

  // 3. Multi-Consonants / Conjuncts (जोडाक्षरे) & Digraphs
  const multiConsonants: Array<[string, string]> = [
    ['dnyan', 'ज्ञान'], ['dny', 'ज्ञ'], ['jny', 'ज्ञ'], ['gyan', 'ज्ञान'], ['gy', 'ज्ञ'], ['dhyan', 'ज्ञान'],
    ['shw', 'श्व'], ['shr', 'श्र'], ['shh', 'ष'], ['sh', 'श'],
    ['ksh', 'क्ष'], ['x', 'क्ष'],
    ['chhh', 'छ'], ['chh', 'छ'], ['ch', 'च'],
    ['kh', 'ख'], ['gh', 'घ'], ['th', 'थ'], ['dh', 'ध'],
    ['ph', 'फ'], ['bh', 'भ'], ['jh', 'झ'], ['rh', 'ऱ्ह'], ['wh', 'व्ह'],
    ['tt', 'ट'], ['dd', 'ड'], ['nn', 'ण'], ['ll', 'ळ'], ['rr', 'ऱ'],
    ['sw', 'स्व'], ['pr', 'प्र'], ['tr', 'त्र'], ['kr', 'क्र'], ['gr', 'ग्र'],
    ['dr', 'द्र'], ['br', 'ब्र'], ['mr', 'म्र'], ['vr', 'व्र'], ['st', 'स्त'],
    ['sp', 'स्प'], ['sk', 'स्क'], ['sn', 'स्न'], ['sm', 'स्म'], ['sy', 'स्य'],
    ['kt', 'क्त'], ['pt', 'प्त'], ['nt', 'ंत'], ['nd', 'ंद'], ['mb', 'ंब'],
    ['mp', 'ंप'], ['nk', 'ंक'], ['ng', 'ंग'], ['nj', 'ंज'], ['ndr', 'ंद्र'],
    ['shn', 'ष्ण'], ['shm', 'श्म'], ['hm', 'ह्म'], ['hy', 'ह्य'], ['ry', 'र्य']
  ];

  const singleConsonants: Record<string, string> = {
    k: 'क', g: 'ग', c: 'क', j: 'ज', z: 'झ',
    t: 'त', d: 'द', n: 'न', p: 'प', f: 'फ',
    b: 'ब', m: 'म', y: 'य', r: 'र', l: 'ल',
    v: 'व', w: 'व', s: 'स', h: 'ह', q: 'क'
  };

  const initialVowels: Array<[string, string]> = [
    ['aai', 'आई'], ['aau', 'आऊ'], ['aa', 'आ'], ['ee', 'ई'], ['ii', 'ई'],
    ['oo', 'ऊ'], ['uu', 'ऊ'], ['ai', 'ऐ'], ['au', 'औ'], ['ou', 'औ'],
    ['om', 'ॐ'], ['ru', 'ऋ'], ['ri', 'ऋ'],
    ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ']
  ];

  const matras: Array<[string, string]> = [
    ['aai', 'ाई'], ['aau', 'ाऊ'], ['aa', 'ा'], ['ee', 'ी'], ['ii', 'ी'],
    ['oo', 'ू'], ['uu', 'ू'], ['ai', 'ै'], ['au', 'ौ'], ['ou', 'ौ'],
    ['a', ''], ['i', 'ि'], ['u', 'ु'], ['e', 'े'], ['o', 'ो']
  ];

  let result = '';
  let i = 0;
  let isStart = true;

  while (i < lower.length) {
    if (isStart) {
      // Check initial vowels
      let matchedVowel = false;
      for (const [v, dev] of initialVowels) {
        if (lower.startsWith(v, i)) {
          result += dev;
          i += v.length;
          matchedVowel = true;
          isStart = false;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    // Check Multi-letter Consonants
    let matchedConsonant = false;
    for (const [cSeq, dev] of multiConsonants) {
      if (lower.startsWith(cSeq, i)) {
        result += dev;
        i += cSeq.length;
        matchedConsonant = true;
        isStart = false;
        break;
      }
    }
    if (matchedConsonant) {
      // Check if followed by vowel
      if (i < lower.length) {
        let matchedMatra = false;
        for (const [vSeq, matra] of matras) {
          if (lower.startsWith(vSeq, i)) {
            if (vSeq === 'a' && i === lower.length - 1) {
              result += 'ा';
            } else {
              result += matra;
            }
            i += vSeq.length;
            matchedMatra = true;
            break;
          }
        }
      }
      continue;
    }

    // Check Single Consonant
    const ch = lower[i];
    if (ch in singleConsonants) {
      result += singleConsonants[ch];
      i += 1;
      isStart = false;

      // Check if followed by vowel / matra
      if (i < lower.length) {
        let matchedMatra = false;
        for (const [vSeq, matra] of matras) {
          if (lower.startsWith(vSeq, i)) {
            if (vSeq === 'a' && i === lower.length - 1) {
              result += 'ा';
            } else {
              result += matra;
            }
            i += vSeq.length;
            matchedMatra = true;
            break;
          }
        }
      }
      continue;
    }

    // Standalone vowel inside word (e.g. after another vowel)
    let matchedInnerVowel = false;
    for (const [v, dev] of initialVowels) {
      if (lower.startsWith(v, i)) {
        result += dev;
        i += v.length;
        matchedInnerVowel = true;
        isStart = false;
        break;
      }
    }
    if (matchedInnerVowel) continue;

    // Default fallback
    result += lower[i];
    i += 1;
    isStart = false;
  }

  return result;
}

/**
 * guessMarathiName - Main entry point for intelligent English to Marathi transliteration.
 * Handles single names or multi-word full names (e.g. "Pawar Yogesh Ashok", "Sures Bagul").
 */
export function guessMarathiName(name: string | undefined | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  // Preserve already Devanagari text
  if (/^[\u0900-\u097F\s.,'-]+$/.test(trimmed)) {
    return trimmed;
  }

  const words = trimmed.split(/\s+/);
  return words.map(w => transliterateWord(w)).filter(Boolean).join(' ').trim();
}

export function transliterateEnglishToMarathi(name: string | undefined | null): string {
  return guessMarathiName(name);
}

export function getDisplayNameForLocale(name: string | undefined | null, nameMarathi: string | undefined | null, locale: 'en' | 'mr' = 'mr') {
  if (locale === 'mr') {
    return (nameMarathi && nameMarathi.trim()) ? nameMarathi.trim() : (guessMarathiName(name || '') || name || '').trim();
  }
  return (name || '').trim();
}

/**
 * shareToWhatsApp - Institutional Reporting Engine
 * Constructs a formatted Marathi message for parents and students.
 * Fixed: Uses high-resilience link triggering to prevent "wa.me refused to connect" errors.
 */
export function shareToWhatsApp(options: {
  phone?: string;
  schoolName: string;
  teacherName: string;
  studentName: string;
  std: string;
  age: string | number;
  dob: string;
  bmi: string;
  height: string;
  weight: string;
  reportType: string;
  reportData: string;
}) {
  const { phone, schoolName, teacherName, studentName, std, age, dob, bmi, height, weight, reportType, reportData } = options;

  const message = `*${schoolName}*\n*प्रगती अहवाल (Progress Report)*\n\n*शिक्षक:* ${teacherName}\n------------------------------\n*विद्यार्थ्याची माहिती:*\n*नाव:* ${studentName}\n*इयत्ता:* ${std} वी\n*वय:* ${age} वर्षे | *जन्म तारीख:* ${dob}\n*उंची:* ${height} cm | *वजन:* ${weight} kg\n*BMI:* ${bmi}\n\n*नवीन अपडेट - ${reportType}:*\n${reportData}\n------------------------------\nहा अहवाल 'वाघंबा स्पोर्ट्स हब' मधून आपोआप पाठवण्यात आला आहे.`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;
  
  if (typeof window !== 'undefined') {
    // High-resilience navigation: Create a hidden link and click it to bypass CSP/iframe restrictions
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export interface AgeValidation {
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  ageString: string;
  category: string;
  eligible: boolean;
  statusText: string;
  referenceYear: number;
  cutoffDateFormatted: string;
  eligibilityType: 'U14' | 'U17' | 'U19' | 'Overage' | 'Underage' | 'Pending';
}

export function getAgeValidation(dobString: string | undefined | null, customRefYear?: number): AgeValidation | null {
  if (!dobString) return null;
  
  let birthYear: number;
  let birthMonth: number;
  let birthDay: number;

  const match = dobString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    birthYear = parseInt(match[1], 10);
    birthMonth = parseInt(match[2], 10) - 1; // 0-indexed
    birthDay = parseInt(match[3], 10);
  } else {
    const dobDate = new Date(dobString);
    if (isNaN(dobDate.getTime())) return null;
    birthYear = dobDate.getFullYear();
    birthMonth = dobDate.getMonth();
    birthDay = dobDate.getDate();
  }

  // Reference Date: 31 December of specified or current academic reference year
  const refYear = customRefYear || 2026;
  const refMonth = 11; // 0-indexed December
  const refDay = 31;

  let years = refYear - birthYear;
  let months = refMonth - birthMonth;
  let days = refDay - birthDay;

  if (days < 0) {
    const prevMonthDays = new Date(refYear, refMonth, 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const ageString = `${years} Years, ${months} Months, ${days} Days`;
  const cutoffDateFormatted = `31/12/${refYear}`;

  // Age Categories based on reference year:
  // - Under 14 (U14): Born from 01-01-(refYear - 13) to 31-12-(refYear - 11) (Age 11 to <14 on 31 Dec)
  // - Under 17 (U17): Born from 01-01-(refYear - 16) to 31-12-(refYear - 14) (Age 14 to <17 on 31 Dec)
  // - Under 19 (U19): Born from 01-01-(refYear - 18) to 31-12-(refYear - 17) (Age 17 to <19 on 31 Dec)
  
  const dobNum = birthYear * 10000 + (birthMonth + 1) * 100 + birthDay;
  
  const u14Start = (refYear - 13) * 10000 + 101;
  const u14End = (refYear - 11) * 10000 + 1231;

  const u17Start = (refYear - 16) * 10000 + 101;
  const u17End = (refYear - 14) * 10000 + 1231;

  const u19Start = (refYear - 18) * 10000 + 101;
  const u19End = (refYear - 17) * 10000 + 1231;

  let category = "";
  let eligible = false;
  let statusText = "";
  let eligibilityType: 'U14' | 'U17' | 'U19' | 'Overage' | 'Underage' | 'Pending' = 'Pending';

  if (dobNum >= u14Start && dobNum <= u14End) {
    category = "Under 14 (U14)";
    eligible = true;
    statusText = `Eligible for U-14 (Age ${years}y on 31/12/${refYear})`;
    eligibilityType = 'U14';
  } else if (dobNum >= u17Start && dobNum <= u17End) {
    category = "Under 17 (U17)";
    eligible = true;
    statusText = `Eligible for U-17 (Age ${years}y on 31/12/${refYear})`;
    eligibilityType = 'U17';
  } else if (dobNum >= u19Start && dobNum <= u19End) {
    category = "Under 19 (U19)";
    eligible = true;
    statusText = `Eligible for U-19 (Age ${years}y on 31/12/${refYear})`;
    eligibilityType = 'U19';
  } else if (dobNum < u19Start) {
    // Born before U19 start date => Exceeds 19 years on Dec 31st
    category = "Overage (वयाधिक)";
    eligible = false;
    statusText = `Overage: Exceeds 19 yrs on 31/12/${refYear} (${years}y ${months}m)`;
    eligibilityType = 'Overage';
  } else if (dobNum > u14End) {
    // Younger than 11 years
    category = "Underage (कमी वयाचा)";
    eligible = false;
    statusText = `Underage for competitive U-14 (<11 yrs on 31/12/${refYear})`;
    eligibilityType = 'Underage';
  } else {
    category = "None";
    eligible = false;
    statusText = "Not eligible for available age categories.";
    eligibilityType = 'Pending';
  }

  return {
    ageYears: years,
    ageMonths: months,
    ageDays: days,
    ageString,
    category,
    eligible,
    statusText,
    referenceYear: refYear,
    cutoffDateFormatted,
    eligibilityType
  };
}

export function getLocalizedAgeCategory(category: string, isMarathi: boolean): string {
  if (!category) return "";
  if (isMarathi) {
    if (category.includes("Under 14") || category.includes("U14")) return "१४ वर्षांखालील (U14)";
    if (category.includes("Under 17") || category.includes("U17")) return "१७ वर्षांखालील (U17)";
    if (category.includes("Under 19") || category.includes("U19")) return "१९ वर्षांखालील (U19)";
    if (category.includes("Overage") || category.includes("वयाधिक")) return "वयाधिक (Overage)";
    if (category.includes("Underage") || category.includes("कमी वयाचा")) return "कमी वयाचा (Underage)";
    if (category === "None") return "पात्र नाही";
  }
  return category;
}

export interface SportPositionDef {
  id: string;
  nameEn: string;
  nameMr: string;
  shortCode: string;
  category?: 'Attack' | 'Defense' | 'Setter' | 'Field' | 'Track' | 'Specialist';
}

export const SPORT_POSITIONS_MAP: Record<string, SportPositionDef[]> = {
  'Kabaddi': [
    { id: 'right_raider', nameEn: 'Right Raider', nameMr: 'उजवा चढाईपटू (Right Raider)', shortCode: 'RR', category: 'Attack' },
    { id: 'left_raider', nameEn: 'Left Raider', nameMr: 'डावा चढाईपटू (Left Raider)', shortCode: 'LR', category: 'Attack' },
    { id: 'right_corner', nameEn: 'Right Corner', nameMr: 'उजवा कोपरा (Right Corner)', shortCode: 'RC', category: 'Defense' },
    { id: 'left_corner', nameEn: 'Left Corner', nameMr: 'डावा कोपरा (Left Corner)', shortCode: 'LC', category: 'Defense' },
    { id: 'right_cover', nameEn: 'Right Cover', nameMr: 'उजवा कव्हर / मध्यरक्षक', shortCode: 'RCv', category: 'Defense' },
    { id: 'left_cover', nameEn: 'Left Cover', nameMr: 'डावा कव्हर / मध्यरक्षक', shortCode: 'LCv', category: 'Defense' },
    { id: 'all_rounder', nameEn: 'All-Rounder', nameMr: 'सर्वसमावेशक (All-Rounder)', shortCode: 'AR', category: 'Specialist' },
  ],
  'Kho Kho': [
    { id: 'runner_batch1', nameEn: 'Runner (Batch 1)', nameMr: 'धावपटू तुकडी १ (Batch 1)', shortCode: 'R1', category: 'Defense' },
    { id: 'runner_batch2', nameEn: 'Runner (Batch 2)', nameMr: 'धावपटू तुकडी २ (Batch 2)', shortCode: 'R2', category: 'Defense' },
    { id: 'runner_batch3', nameEn: 'Runner (Batch 3)', nameMr: 'धावपटू तुकडी ३ (Batch 3)', shortCode: 'R3', category: 'Defense' },
    { id: 'chaser', nameEn: 'Active Chaser', nameMr: 'पाठलागपटू / आक्रमक (Chaser)', shortCode: 'CH', category: 'Attack' },
    { id: 'pole_diver', nameEn: 'Pole Diver', nameMr: 'पोल डायव्हर (Pole Diver)', shortCode: 'PD', category: 'Specialist' },
    { id: 'all_rounder', nameEn: 'All-Rounder', nameMr: 'ऑल-राउंडर (All-Rounder)', shortCode: 'AR', category: 'Specialist' },
  ],
  'Volleyball': [
    { id: 'setter', nameEn: 'Setter (Playmaker)', nameMr: 'सेटर (Setter / पासर)', shortCode: 'SET', category: 'Setter' },
    { id: 'outside_hitter', nameEn: 'Outside Hitter / Spiker', nameMr: 'आक्रमक / स्मॅशर (Spiker)', shortCode: 'OH', category: 'Attack' },
    { id: 'opposite_hitter', nameEn: 'Opposite Hitter', nameMr: 'विरुद्ध आक्रमक (Opposite)', shortCode: 'OPP', category: 'Attack' },
    { id: 'middle_blocker', nameEn: 'Middle Blocker', nameMr: 'मध्यरक्षक / ब्लॉकर', shortCode: 'MB', category: 'Defense' },
    { id: 'libero', nameEn: 'Libero (Defensive)', nameMr: 'लिबेरो / मुख्य बचावपटू', shortCode: 'LIB', category: 'Defense' },
    { id: 'universal', nameEn: 'Universal Player', nameMr: 'युनिव्हर्सल खेळाडू', shortCode: 'UNI', category: 'Specialist' },
  ],
  'Athletics': [
    { id: '100m', nameEn: '100m Sprint', nameMr: '१०० मी. धावणे (100m Sprint)', shortCode: '100M', category: 'Track' },
    { id: '200m', nameEn: '200m Sprint', nameMr: '२०० मी. धावणे (200m Sprint)', shortCode: '200M', category: 'Track' },
    { id: '400m', nameEn: '400m Run', nameMr: '४०० मी. धावणे (400m Run)', shortCode: '400M', category: 'Track' },
    { id: 'relay_leg1', nameEn: '4x100m Relay (Leg 1 - Start)', nameMr: '४x१०० रिले (१ली लेग - स्टार्ट)', shortCode: 'R-L1', category: 'Track' },
    { id: 'relay_leg2', nameEn: '4x100m Relay (Leg 2 - Back)', nameMr: '४x१०० रिले (२री लेग - बॅक)', shortCode: 'R-L2', category: 'Track' },
    { id: 'relay_leg3', nameEn: '4x100m Relay (Leg 3 - Curve)', nameMr: '४x१०० रिले (३री लेग - वळण)', shortCode: 'R-L3', category: 'Track' },
    { id: 'relay_leg4', nameEn: '4x100m Relay (Leg 4 - Anchor)', nameMr: '४x१०० रिले (४थी लेग - अँकर)', shortCode: 'R-L4', category: 'Track' },
    { id: 'long_jump', nameEn: 'Long Jump', nameMr: 'लांब उडी (Long Jump)', shortCode: 'LJ', category: 'Field' },
    { id: 'high_jump', nameEn: 'High Jump', nameMr: 'उंच उडी (High Jump)', shortCode: 'HJ', category: 'Field' },
    { id: 'shot_put', nameEn: 'Shot Put', nameMr: 'गोळाफेक (Shot Put)', shortCode: 'SP', category: 'Field' },
    { id: 'javelin', nameEn: 'Javelin Throw', nameMr: 'भालाफेक (Javelin Throw)', shortCode: 'JT', category: 'Field' },
    { id: 'disc_throw', nameEn: 'Discus Throw', nameMr: 'थाळीफेक (Discus Throw)', shortCode: 'DT', category: 'Field' },
  ],
  'Handball': [
    { id: 'goalkeeper', nameEn: 'Goalkeeper', nameMr: 'गोलरक्षक (Goalkeeper)', shortCode: 'GK', category: 'Defense' },
    { id: 'left_wing', nameEn: 'Left Wing', nameMr: 'डावा विंग (Left Wing)', shortCode: 'LW', category: 'Attack' },
    { id: 'right_wing', nameEn: 'Right Wing', nameMr: 'उजवा विंग (Right Wing)', shortCode: 'RW', category: 'Attack' },
    { id: 'center_back', nameEn: 'Center Back / Playmaker', nameMr: 'मध्य फळी (Center Back)', shortCode: 'CB', category: 'Setter' },
    { id: 'pivot', nameEn: 'Pivot / Line Player', nameMr: 'पिव्हट / लाईन खेळाडू', shortCode: 'PV', category: 'Attack' },
    { id: 'left_back', nameEn: 'Left Back', nameMr: 'डावा बॅक (Left Back)', shortCode: 'LB', category: 'Attack' },
    { id: 'right_back', nameEn: 'Right Back', nameMr: 'उजवा बॅक (Right Back)', shortCode: 'RB', category: 'Attack' },
  ]
};

export function getSportPositions(sportName: string): SportPositionDef[] {
  return SPORT_POSITIONS_MAP[sportName] || [
    { id: 'player', nameEn: 'Standard Player', nameMr: 'खेळाडू', shortCode: 'PL', category: 'Specialist' },
    { id: 'captain', nameEn: 'Captain', nameMr: 'कर्णधार (Captain)', shortCode: 'CPT', category: 'Specialist' },
    { id: 'vice_captain', nameEn: 'Vice Captain', nameMr: 'उपकर्णधार (Vice Captain)', shortCode: 'VC', category: 'Specialist' },
    { id: 'substitute', nameEn: 'Substitute', nameMr: 'राखीव खेळाडू (Sub)', shortCode: 'SUB', category: 'Specialist' },
  ];
}

export interface ParsedMedicalLog {
  location: string;
  diagnosis: string;
  severity: string;
  daysOff: string;
  expectedReturn: string;
  protocol: string;
  medicine: string;
  remarks: string;
}

export function parseMedicalLog(fullLog: string): ParsedMedicalLog {
  if (!fullLog) {
    return {
      location: 'General',
      diagnosis: 'Medical Audit Log',
      severity: 'Minor',
      daysOff: '5 Days',
      expectedReturn: '-',
      protocol: 'Standard physical rest',
      medicine: 'First Aid / Rest',
      remarks: 'None recorded'
    };
  }

  const getField = (key: string) => {
    const match = fullLog.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const location = getField('Location') || 'Body Region';
  const diagnosis = getField('Diagnosis') || 'Injury Record';
  const severity = getField('Severity') || (fullLog.toLowerCase().includes('critical') || fullLog.toLowerCase().includes('severe') ? 'Critical' : 'Minor');
  const daysOff = getField('Recovery') || '7 Days';
  const expectedReturn = getField('Est. Return') || '-';
  const protocol = getField('PROTOCOL') || '';
  const medicine = getField('MEDICINE/FIRST-AID') || getField('MEDICINE') || '';
  
  let remarks = getField('COACH REMARKS') || getField('REMARKS') || '';
  if (!remarks && !fullLog.includes('[INSTITUTIONAL MEDICAL AUDIT]')) {
    remarks = fullLog;
  }

  return {
    location,
    diagnosis,
    severity,
    daysOff,
    expectedReturn,
    protocol: protocol || 'Standard recovery protocol',
    medicine: medicine || 'First aid applied',
    remarks: remarks || 'No additional remarks'
  };
}

export function parseNumericValue(val: any): number {
  if (val === null || val === undefined) return 0;
  let str = String(val).trim();
  if (!str) return 0;

  // Convert Devanagari numerals (०१२३४५६७८९) to ASCII (0123456789)
  const devanagariMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  str = str.replace(/[०-९]/g, d => devanagariMap[d] || d);

  // Extract numeric match (optional sign, digits, optional decimal)
  const match = str.match(/[-+]?\d*\.?\d+/);
  if (!match) return 0;
  
  const num = parseFloat(match[0]);
  return isNaN(num) ? 0 : num;
}

export function calculateBMI(height?: string | number | null, weight?: string | number | null, existingBmi?: string | number | null): string {
  const hNum = parseNumericValue(height);
  const wNum = parseNumericValue(weight);

  if (hNum > 0 && wNum > 0) {
    let hMeters = hNum;
    if (hNum > 3.0) {
      // Height is given in centimeters
      hMeters = hNum / 100;
    }
    if (hMeters > 0.4 && hMeters < 3.0 && wNum > 2 && wNum < 300) {
      const calculated = wNum / (hMeters * hMeters);
      if (calculated >= 5 && calculated <= 100) {
        return calculated.toFixed(1);
      }
    }
  }

  const existingNum = parseNumericValue(existingBmi);
  if (existingNum >= 5 && existingNum <= 100) {
    return existingNum.toFixed(1);
  }

  return '---';
}

export function getBmiCategory(bmiVal: string | number | null): { en: string; mr: string; color: string } {
  const num = parseNumericValue(bmiVal);
  if (num === 0 || isNaN(num)) return { en: 'Unknown', mr: 'अज्ञात', color: 'text-slate-500' };
  if (num < 18.5) return { en: 'Underweight', mr: 'कमी वजन', color: 'text-amber-600' };
  if (num < 25) return { en: 'Normal Weight', mr: 'योग्य वजन', color: 'text-emerald-600' };
  if (num < 30) return { en: 'Overweight', mr: 'जास्त वजन', color: 'text-amber-700' };
  return { en: 'Obese', mr: 'स्थूल / अतिवजन', color: 'text-rose-600' };
}

import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';

export function getOfficialSchoolName(schoolProfile?: any, isMarathi: boolean = true): string {
  if (schoolProfile?.schoolName && schoolProfile.schoolName.trim()) {
    return schoolProfile.schoolName.trim();
  }
  return isMarathi 
    ? 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक' 
    : 'Govt. Secondary Ashram School Waghamba, Tal. Baglan, Dist. Nashik';
}

export function getTeacherName(schoolProfile?: any): string {
  if (schoolProfile?.teacherName && schoolProfile.teacherName.trim()) {
    return schoolProfile.teacherName.trim();
  }
  return 'सुनील देशमुख (B.P.Ed)';
}

export function getPrintSignatureBlockHtml(schoolProfile?: any, isMarathi: boolean = true): string {
  const teacherName = getTeacherName(schoolProfile);
  const schoolName = getOfficialSchoolName(schoolProfile, isMarathi);
  const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;
  
  return `
    <div class="no-break-sign" style="margin-top: 35px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif; font-size: 11px; padding: 10px 20px; border-top: 1px dashed #cbd5e1;">
      <div style="text-align: center;">
        <img src="${signatureSrc}" alt="Teacher Signature" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 4px; display: block; margin-left: auto; margin-right: auto;" />
        <div style="font-weight: 900; text-transform: uppercase; color: #0f172a;">${isMarathi ? 'क्रीडा शिक्षक स्वाक्षरी' : 'Sports Teacher Signature'}</div>
        <div style="font-size: 10px; color: #475569; font-weight: 700; margin-top: 2px;">(${teacherName})</div>
      </div>
      <div style="text-align: center;">
        <div style="border: 2px dashed #94a3b8; border-radius: 8px; width: 80px; height: 42px; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px auto; font-size: 10px; color: #94a3b8; font-weight: 800;">${isMarathi ? 'शिक्का' : 'STAMP'}</div>
        <div style="font-weight: 900; text-transform: uppercase; color: #0f172a;">${isMarathi ? 'मुख्याध्यापक स्वाक्षरी' : 'Principal Signature'}</div>
        <div style="font-size: 10px; color: #475569; font-weight: 700; margin-top: 2px;">(${schoolName})</div>
      </div>
  `;
}

export function isBirthdayToday(dobStr?: string): boolean {
  if (!dobStr || typeof dobStr !== 'string') return false;
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1 to 12
  const currentDay = today.getDate(); // 1 to 31

  const clean = dobStr.split('T')[0].trim();
  
  // Case 1: YYYY-MM-DD or YYYY-M-D or DD-MM-YYYY
  const partsDash = clean.split('-');
  if (partsDash.length === 3) {
    let m = 0, d = 0;
    if (partsDash[0].length === 4) {
      m = parseInt(partsDash[1], 10);
      d = parseInt(partsDash[2], 10);
    } else if (partsDash[2].length === 4) {
      d = parseInt(partsDash[0], 10);
      m = parseInt(partsDash[1], 10);
    }
    if (m === currentMonth && d === currentDay) return true;
  }

  // Case 2: YYYY/MM/DD or DD/MM/YYYY
  const partsSlash = clean.split('/');
  if (partsSlash.length === 3) {
    let m = 0, d = 0;
    if (partsSlash[0].length === 4) {
      m = parseInt(partsSlash[1], 10);
      d = parseInt(partsSlash[2], 10);
    } else if (partsSlash[2].length === 4) {
      d = parseInt(partsSlash[0], 10);
      m = parseInt(partsSlash[1], 10);
    }
    if (m === currentMonth && d === currentDay) return true;
  }

  // Case 3: Standard JS Date fallback
  try {
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      if (parsed.getMonth() + 1 === currentMonth && parsed.getDate() === currentDay) {
        return true;
      }
    }
  } catch (e) {
    // Ignore
  }

  return false;
}



