/**
 * Ashram Shala Sports Nutrition & Mess Fueling Guide
 * Designed specifically for Government Ashram Secondary Schools under the
 * Tribal Development Department, Government of Maharashtra (आदिवासी विकास विभाग, महाराष्ट्र शासन).
 * 
 * Anchored to authentic government hostel daily rations:
 * - ज्वारी / बाजरी भाकरी (Millets - complex carbs, iron, calcium)
 * - मोड आलेली कडधान्ये / उसळ (मूग, मटकी, चवळी, हरभरा - plant protein & fiber)
 * - उकडलेली अंडी / केळी (Eggs & Bananas - rapid recovery protein & potassium)
 * - डाळ, भात व शेंगदाणा कूट (Lentils, rice & groundnuts - complete amino acid profile)
 * - गूळ, फुटाणे व राजगिरा लाडू (Jaggery, roasted grams & amaranth - iron & instant energy)
 * - ताक व लिंबू पाणी (Buttermilk & lemon water - natural electrolytes & gut health)
 */

export interface MessMeal {
  mealTimeMr: string;
  mealTimeEn: string;
  timeWindow: string;
  itemsMr: string[];
  itemsEn: string[];
  nutritionalValueMr: string;
  nutritionalValueEn: string;
  targetAthletesMr: string;
}

export interface DayNutritionSchedule {
  dayNameMr: string;
  dayNameEn: string;
  breakfast: MessMeal;
  lunch: MessMeal;
  eveningSnack: MessMeal;
  dinner: MessMeal;
}

export const ASHRAM_MESS_WEEKLY_MENU: DayNutritionSchedule[] = [
  {
    dayNameMr: 'सोमवार (Monday)',
    dayNameEn: 'Monday',
    breakfast: {
      mealTimeMr: 'सकाळचा नाश्ता (सराव पश्चात)',
      mealTimeEn: 'Morning Post-Practice Breakfast',
      timeWindow: '७:३० - ८:३० AM',
      itemsMr: ['उकडलेले मूग उसळ (१ वाटी)', 'गूळ व शेंगदाणे', '१ उकडलेले अंडे (किंवा केळे)'],
      itemsEn: ['Boiled Sprouted Moong (1 bowl)', 'Jaggery & Groundnuts', '1 Boiled Egg (or Banana)'],
      nutritionalValueMr: '१६ ग्रॅम प्रथिने, उच्च लोह व संथ ऊर्जा',
      nutritionalValueEn: '16g Protein, High Iron & Sustained Glycogen',
      targetAthletesMr: 'सर्व धावपटू व कबड्डी खेळाडूंसाठी स्नायू मजबुती'
    },
    lunch: {
      mealTimeMr: 'दुपारचे जेवण',
      mealTimeEn: 'Lunch',
      timeWindow: '१२:०० - १:०० PM',
      itemsMr: ['बाजरी भाकरी (२)', 'तूर डाळ वरण-भात', 'मेथी/पालक भाजी', 'ताक (१ पेला)'],
      itemsEn: ['Bajra Bhakri (2)', 'Toor Dal & Steamed Rice', 'Green Leafy Veg (Fenugreek/Spinach)', 'Buttermilk (1 glass)'],
      nutritionalValueMr: 'कॅल्शियम, पोटॅशियम, बी-कॉम्प्लेक्स जीवनसत्त्वे',
      nutritionalValueEn: 'Calcium, Potassium, B-Complex Vitamins',
      targetAthletesMr: 'हाडे बळकट करण्यासाठी व हायड्रेशन'
    },
    eveningSnack: {
      mealTimeMr: 'संध्याकाळचा सराव पूर्व नाश्ता',
      mealTimeEn: 'Evening Pre-Training Snack',
      timeWindow: '४:१५ - ४:४५ PM',
      itemsMr: ['राजगिरा लाडू (१)', 'गूळ-फुटाणे (१ मूठ)', 'स्वच्छ पिण्याचे पाणी'],
      itemsEn: ['Rajgira (Amaranth) Ladoo (1)', 'Jaggery & Roasted Chana (1 handful)', 'Fresh Water'],
      nutritionalValueMr: 'त्वरित ऊर्जा, ग्लायकोजेन वाढवणे',
      nutritionalValueEn: 'Rapid Energy, Pre-Workout Glycogen Top-Up',
      targetAthletesMr: 'संध्याकाळच्या दमछाक करणाऱ्या खेळापूर्वी ऊर्जा'
    },
    dinner: {
      mealTimeMr: 'रात्रीचे जेवण',
      mealTimeEn: 'Dinner',
      timeWindow: '७:३० - ८:३० PM',
      itemsMr: ['ज्वारी भाकरी (२)', 'मटकी रस्सा उसळ', 'भात व डाळ', 'हळदयुक्त कोमट पाणी/दूध'],
      itemsEn: ['Jowar Bhakri (2)', 'Matki Curry', 'Rice & Dal', 'Warm Turmeric Water/Milk'],
      nutritionalValueMr: 'स्नायूंची दुरुस्ती (Muscle Recovery) व शांत झोप',
      nutritionalValueEn: 'Overnight Muscle Recovery & Anti-inflammatory Support',
      targetAthletesMr: 'थकवा दूर करण्यासाठी व दुसऱ्या दिवसाच्या सरावासाठी सज्जता'
    }
  },
  {
    dayNameMr: 'बुधवार (Wednesday - हाय इंटेंसिटी डे)',
    dayNameEn: 'Wednesday (High Intensity Conditioning)',
    breakfast: {
      mealTimeMr: 'सकाळचा नाश्ता',
      mealTimeEn: 'Morning Breakfast',
      timeWindow: '७:३० - ८:३० AM',
      itemsMr: ['कांदे पोहे (शेंगदाणेयुक्त)', '२ उकडलेली अंडी (किंवा २ केळी)', 'दूध/चहा'],
      itemsEn: ['Poha with Peanuts', '2 Boiled Eggs (or 2 Bananas)', 'Milk/Tea'],
      nutritionalValueMr: '१८ ग्रॅम प्रथिने, कार्बोहायड्रेट्स',
      nutritionalValueEn: '18g Protein, Complex Carbs',
      targetAthletesMr: 'खो-खो व व्हॉलीबॉल जलद चपळतेसाठी ऊर्जा'
    },
    lunch: {
      mealTimeMr: 'दुपारचे जेवण',
      mealTimeEn: 'Lunch',
      timeWindow: '१२:०० - १:०० PM',
      itemsMr: ['ज्वारी भाकरी', 'हरभरा (चना) उसळ', 'वरण-भात', 'काकडी/टोमॅटो सॅलड'],
      itemsEn: ['Jowar Bhakri', 'Black Chana Curry', 'Dal-Rice', 'Cucumber/Tomato Salad'],
      nutritionalValueMr: 'फायबर, वनस्पती प्रथिने, सूक्ष्म जीवनसत्त्वे',
      nutritionalValueEn: 'High Dietary Fiber, Plant Protein, Zinc & Iron',
      targetAthletesMr: 'स्टॅमिना वाढवण्यासाठी'
    },
    eveningSnack: {
      mealTimeMr: 'सराव पूर्व नाश्ता',
      mealTimeEn: 'Pre-Training Snack',
      timeWindow: '४:१५ - ४:४५ PM',
      itemsMr: ['शेंगदाणा चिक्की (१ तुकडा)', 'केळे (१)', 'पाणी'],
      itemsEn: ['Peanut Chikki (1 bar)', '1 Banana', 'Water'],
      nutritionalValueMr: 'पोटॅशियम (क्रॅम्प्स रोखण्यासाठी), ग्लुकोज',
      nutritionalValueEn: 'Potassium (Anti-Cramp Protection), Natural Sugar',
      targetAthletesMr: 'पायांच्या स्नायूंना गोळे (Cramps) येण्यापासून संरक्षण'
    },
    dinner: {
      mealTimeMr: 'रात्रीचे जेवण',
      mealTimeEn: 'Dinner',
      timeWindow: '७:३० - ८:३० PM',
      itemsMr: ['गहू पोळी/चपाती (३)', 'मूग डाळ खिचडी', 'शेवगा भाजी/कढी'],
      itemsEn: ['Wheat Chapati (3)', 'Moong Dal Khichdi', 'Drumstick Curry/Kadhi'],
      nutritionalValueMr: 'पचनास हलका व स्नायूंना आराम देणारा आहार',
      nutritionalValueEn: 'Light Digestion, Mineral-rich Drumstick leaves/pods',
      targetAthletesMr: 'पचनसंस्थेला आराम व संपूर्ण पुनर्प्राप्ती'
    }
  },
  {
    dayNameMr: 'शुक्रवार (Friday - सामना पूर्व पोषण)',
    dayNameEn: 'Friday (Pre-Match Loading)',
    breakfast: {
      mealTimeMr: 'सकाळचा नाश्ता',
      mealTimeEn: 'Morning Breakfast',
      timeWindow: '७:३० - ८:३० AM',
      itemsMr: ['उपमा (भाज्या व शेंगदाणेयुक्त)', 'मोड आलेले कडधान्य', '१ उकडलेले अंडे'],
      itemsEn: ['Vegetable Upma with Peanuts', 'Sprouted Pulses', '1 Boiled Egg'],
      nutritionalValueMr: '१५ ग्रॅम प्रथिने, संथ पचणारे कर्बोदके',
      nutritionalValueEn: '15g Protein, Slow-release Carbohydrates',
      targetAthletesMr: 'दीर्घकालीन ऊर्जा साठा (Carb Loading)'
    },
    lunch: {
      mealTimeMr: 'दुपारचे जेवण',
      mealTimeEn: 'Lunch',
      timeWindow: '१२:०० - १:०० PM',
      itemsMr: ['बाजरी भाकरी', 'सोयाबीन/डाळ भाजी', 'भात', 'ताक'],
      itemsEn: ['Bajra Bhakri', 'Soybean/Dal Curry', 'Rice', 'Buttermilk'],
      nutritionalValueMr: 'उच्च प्रथिने व पाण्याचे योग्य संतुलन',
      nutritionalValueEn: 'High Plant Protein, Electrolyte Hydration',
      targetAthletesMr: 'सामन्यापूर्वी शरीरातील पाण्याचे संतुलन'
    },
    eveningSnack: {
      mealTimeMr: 'सराव पूर्व नाश्ता',
      mealTimeEn: 'Pre-Training Snack',
      timeWindow: '४:१५ - ४:४५ PM',
      itemsMr: ['गूळ-फुटाणे', 'राजगिरा लाडू', 'लिंबू पाणी (मीठ-साखर)'],
      itemsEn: ['Jaggery-Roasted Gram', 'Rajgira Ladoo', 'Fresh Lemon Water with Salt-Sugar'],
      nutritionalValueMr: 'इलेक्ट्रोलाइट्स व त्वरित ऊर्जा',
      nutritionalValueEn: 'Natural Electrolytes (Sodium, Potassium, Glucose)',
      targetAthletesMr: 'घामावाटे वाहून जाणाऱ्या क्षारांची भरपाई'
    },
    dinner: {
      mealTimeMr: 'रात्रीचे जेवण',
      mealTimeEn: 'Dinner',
      timeWindow: '७:३० - ८:३० PM',
      itemsMr: ['ज्वारी भाकरी', 'पालक/मेथी उसळ', 'डाळ-भात', 'कोमट हळद दूध'],
      itemsEn: ['Jowar Bhakri', 'Green Veggies with Pulses', 'Dal-Rice', 'Warm Turmeric Milk'],
      nutritionalValueMr: 'स्नायू दाहकता कमी करणे (Anti-inflammatory)',
      nutritionalValueEn: 'Anti-inflammatory Curcumin, Complete Rest Support',
      targetAthletesMr: 'सामन्याच्या आदल्या रात्री गाढ व शांत झोप'
    }
  }
];

export interface TournamentDayFuelingGuide {
  timeBeforeMatch: string;
  recommendedIntakeMr: string;
  recommendedIntakeEn: string;
  itemsAvailableInAshramMr: string[];
  itemsAvailableInAshramEn: string[];
  strictAvoidMr: string;
  strictAvoidEn: string;
}

export const TOURNAMENT_DAY_FUELING_TIMELINE: TournamentDayFuelingGuide[] = [
  {
    timeBeforeMatch: 'सामन्यापूर्वी ३ ते ४ तास (3-4 Hours Pre-Match)',
    recommendedIntakeMr: 'भरपूर कर्बोदके (Carbs) व मध्यम प्रथिने; पोट गच्च होणार नाही असा हलका आहार.',
    recommendedIntakeEn: 'High-carbohydrate, moderate protein meal that is easily digested.',
    itemsAvailableInAshramMr: ['२ ज्वारी भाकरी + मूग डाळ', 'किंवा १ वाटी भात + हलकी उसळ + १ केळे'],
    itemsAvailableInAshramEn: ['2 Jowar Bhakri + Moong Dal', 'Or 1 bowl Rice + light pulse curry + 1 banana'],
    strictAvoidMr: 'अति तिखट, तेलकट किंवा तळलेले पदार्थ पूर्णपणे टाळा.',
    strictAvoidEn: 'Avoid oily, spicy, or fried items that cause gastrointestinal distress.'
  },
  {
    timeBeforeMatch: 'सामन्यापूर्वी ६० ते ९० मिनिटे (60-90 Mins Pre-Match)',
    recommendedIntakeMr: 'त्वरित पचणारी ऊर्जा (ग्लुकोज) व हायड्रेशन.',
    recommendedIntakeEn: 'Quick-release glycogen top-up and cellular hydration.',
    itemsAvailableInAshramMr: ['१ राजगिरा लाडू किंवा १ पिकलेले केळे', '२५० मिली साधे पाणी किंवा हलके लिंबू पाणी'],
    itemsAvailableInAshramEn: ['1 Rajgira Ladoo or 1 Ripe Banana', '250ml Water or light lemon water'],
    strictAvoidMr: 'मोठ्या प्रमाणात पाणी एकदम पिणे किंवा जड अन्न खाणे टाळा.',
    strictAvoidEn: 'Do not chug massive quantities of water immediately before stepping on court.'
  },
  {
    timeBeforeMatch: 'सामन्यादरम्यान / मध्यंतर (During Match / Half-Time)',
    recommendedIntakeMr: 'घाम आल्यामुळे कमी झालेले पाणी व क्षार भरून काढणे.',
    recommendedIntakeEn: 'Replenish fluid loss and maintain blood glucose levels.',
    itemsAvailableInAshramMr: ['पाण्याचे लहान घोट (Sips of water)', 'जलसंजीवनी (ORS) किंवा गूळ-पाणी'],
    itemsAvailableInAshramEn: ['Small frequent water sips', 'ORS solution or Jaggery water'],
    strictAvoidMr: 'थंडगार पाणी किंवा जास्त साखर असलेले पेय टाळा.',
    strictAvoidEn: 'Avoid ice-cold water (causes stomach spasms) or carbonated drinks.'
  },
  {
    timeBeforeMatch: 'सामन्यानंतर ३० मिनिटांत (Within 30 Mins Post-Match Recovery)',
    recommendedIntakeMr: 'स्नायूंची दुरुस्ती (Recovery Window) करण्यासाठी तातडीने प्रथिने व ग्लुकोज.',
    recommendedIntakeEn: 'Anabolic recovery window: rapid replenishment of glycogen and protein synthesis.',
    itemsAvailableInAshramMr: ['१ ते २ उकडलेली अंडी (किंवा १ वाटी उकडलेले हरभरे)', '१ तुकडा शेंगदाणा चिक्की', '१ पेला ताक'],
    itemsAvailableInAshramEn: ['1-2 Boiled Eggs (or 1 bowl boiled chana)', '1 piece Peanut Chikki', '1 glass Buttermilk'],
    strictAvoidMr: 'जेवण लांबवणे किंवा रिकाम्या पोटी राहणे टाळा.',
    strictAvoidEn: 'Do not delay eating; prolonged fasting post-match leads to muscle breakdown.'
  }
];
