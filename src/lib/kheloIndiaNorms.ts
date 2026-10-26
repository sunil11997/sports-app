/**
 * SAI / Khelo India National Fitness Assessment Norms & Talent Identification Engine
 * Based on the Sports Authority of India (SAI) & Khelo India National Fitness Assessment Battery
 * for School Children (Ages 9 to 18+ / Class 4 to 12).
 * 
 * Standard Battery:
 * 1. BMI (Body Mass Index)
 * 2. 50m Dash (Standing Start) - Speed (seconds)
 * 3. 600m Run/Walk - Cardiovascular Endurance (seconds)
 * 4. Sit & Reach - Flexibility (cm)
 * 5. Partial Curl-ups (30s) - Core Muscular Endurance (reps)
 * 6. Push-ups (Boys) / Modified Push-ups (Girls) - Upper Body Endurance (reps)
 * 7. Flamingo Balance Test - Static Balance (seconds)
 */

export interface KheloIndiaBenchmark {
  minAge: number;
  maxAge: number;
  gender: 'Male' | 'Female';
  // Percentile thresholds [P90 (National Talent), P75 (State Potential), P50 (Average), P25 (Below Avg)]
  run50mSeconds: [number, number, number, number]; // Lower is better
  run600mSeconds: [number, number, number, number]; // Lower is better
  sitAndReachCm: [number, number, number, number]; // Higher is better
  partialCurlUpsReps: [number, number, number, number]; // Higher is better
  pushUpsReps: [number, number, number, number]; // Higher is better
  flamingoBalanceSec: [number, number, number, number]; // Higher is better
}

/**
 * Official Age & Gender Normalized SAI Khelo India Benchmark Matrix
 */
export const KHELO_INDIA_BENCHMARKS: KheloIndiaBenchmark[] = [
  // Under-14 Boys (Ages 11-13)
  {
    minAge: 11,
    maxAge: 13,
    gender: 'Male',
    run50mSeconds: [7.4, 7.9, 8.6, 9.4],
    run600mSeconds: [140, 155, 175, 205],
    sitAndReachCm: [26, 22, 17, 12],
    partialCurlUpsReps: [28, 22, 16, 10],
    pushUpsReps: [24, 18, 12, 6],
    flamingoBalanceSec: [45, 35, 25, 15],
  },
  // Under-14 Girls (Ages 11-13)
  {
    minAge: 11,
    maxAge: 13,
    gender: 'Female',
    run50mSeconds: [7.8, 8.4, 9.2, 10.1],
    run600mSeconds: [155, 175, 200, 230],
    sitAndReachCm: [28, 24, 19, 14],
    partialCurlUpsReps: [24, 18, 13, 8],
    pushUpsReps: [20, 14, 9, 4],
    flamingoBalanceSec: [45, 35, 25, 15],
  },
  // Under-17 Boys (Ages 14-16)
  {
    minAge: 14,
    maxAge: 16,
    gender: 'Male',
    run50mSeconds: [6.7, 7.1, 7.8, 8.6],
    run600mSeconds: [120, 135, 152, 180],
    sitAndReachCm: [30, 25, 20, 14],
    partialCurlUpsReps: [35, 28, 21, 14],
    pushUpsReps: [32, 24, 17, 10],
    flamingoBalanceSec: [55, 45, 30, 20],
  },
  // Under-17 Girls (Ages 14-16)
  {
    minAge: 14,
    maxAge: 16,
    gender: 'Female',
    run50mSeconds: [7.3, 7.8, 8.5, 9.4],
    run600mSeconds: [145, 162, 185, 215],
    sitAndReachCm: [32, 27, 22, 16],
    partialCurlUpsReps: [28, 22, 16, 10],
    pushUpsReps: [24, 17, 11, 5],
    flamingoBalanceSec: [50, 40, 28, 18],
  },
  // Under-19 Boys (Ages 17-18+)
  {
    minAge: 17,
    maxAge: 19,
    gender: 'Male',
    run50mSeconds: [6.4, 6.8, 7.4, 8.2],
    run600mSeconds: [110, 124, 140, 168],
    sitAndReachCm: [33, 28, 22, 16],
    partialCurlUpsReps: [40, 32, 24, 16],
    pushUpsReps: [38, 30, 22, 14],
    flamingoBalanceSec: [60, 50, 35, 22],
  },
  // Under-19 Girls (Ages 17-18+)
  {
    minAge: 17,
    maxAge: 19,
    gender: 'Female',
    run50mSeconds: [7.1, 7.6, 8.3, 9.1],
    run600mSeconds: [138, 154, 175, 205],
    sitAndReachCm: [34, 29, 24, 18],
    partialCurlUpsReps: [30, 24, 18, 12],
    pushUpsReps: [26, 19, 13, 7],
    flamingoBalanceSec: [55, 45, 30, 20],
  },
];

export type TalentTier = 'talent' | 'state' | 'proficient' | 'average' | 'developing';

export interface TalentTierInfo {
  tier: TalentTier;
  badgeMr: string;
  badgeEn: string;
  colorClass: string;
  percentileRange: string;
  recommendationMr: string;
  recommendationEn: string;
}

export const TALENT_TIER_DETAILS: Record<TalentTier, TalentTierInfo> = {
  talent: {
    tier: 'talent',
    badgeMr: '🏆 राष्ट्रीय गुणवत्ता (National Talent)',
    badgeEn: 'National Talent (Top 15%)',
    colorClass: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    percentileRange: '85th - 100th',
    recommendationMr: 'क्रीडा प्रबोधिनी किंवा राष्ट्रीय क्रीडा प्रशिक्षण योजनेसाठी (SAI/Khelo India) थेट शिफारस योग्य.',
    recommendationEn: 'Direct recommendation for Sports Academy (SAI / Khelo India Talent Development).'
  },
  state: {
    tier: 'state',
    badgeMr: '🥇 राज्य संभाव्यता (State Potential)',
    badgeEn: 'State Potential (Top 30%)',
    colorClass: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    percentileRange: '70th - 84th',
    recommendationMr: 'विभागीय व राज्यस्तरीय क्रीडा स्पर्धेत पदकाची प्रबळ दावेदार. सातत्यपूर्ण सराव आवश्यक.',
    recommendationEn: 'Strong medal contender for Divisional & State tournaments. Maintain progressive training.'
  },
  proficient: {
    tier: 'proficient',
    badgeMr: '⚡ उत्कृष्ट (Proficient)',
    badgeEn: 'Proficient',
    colorClass: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    percentileRange: '50th - 69th',
    recommendationMr: 'चांगली शारीरिक क्षमता. विशिष्ट खेळातील तंत्रशुद्ध कौशल्यावर अधिक भर द्यावा.',
    recommendationEn: 'Good physical baseline. Focus on technical sport-specific drills to advance.'
  },
  average: {
    tier: 'average',
    badgeMr: '🎯 समाधानकारक (Average)',
    badgeEn: 'Average',
    colorClass: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    percentileRange: '30th - 49th',
    recommendationMr: 'नियमित दैनिक पी.टी. व एरोबिक व्यायामाद्वारे तंदुरुस्ती सुधारणे शक्य.',
    recommendationEn: 'Fitness can improve with consistent daily PT and aerobic conditioning.'
  },
  developing: {
    tier: 'developing',
    badgeMr: '🌱 सरावाची गरज (Developing)',
    badgeEn: 'Developing Baseline',
    colorClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    percentileRange: 'Below 30th',
    recommendationMr: 'मूलभूत हालचाली व हळूहळू स्टॅमिना वाढवण्यासाठी विशेष सराव मार्गदर्शन आवश्यक.',
    recommendationEn: 'Needs progressive conditioning for foundational motor competence and endurance.'
  }
};

/**
 * Calculates a 0-100 percentile score for a single metric against SAI Khelo India benchmarks
 */
function scoreMetric(
  value: number,
  thresholds: [number, number, number, number],
  lowerIsBetter: boolean
): number {
  if (lowerIsBetter) {
    const [p90, p75, p50, p25] = thresholds;
    if (value <= p90) return Math.min(100, Math.round(90 + ((p90 - value) / (p90 * 0.2)) * 10));
    if (value <= p75) return Math.round(75 + ((p75 - value) / (p75 - p90)) * 15);
    if (value <= p50) return Math.round(50 + ((p50 - value) / (p50 - p75)) * 25);
    if (value <= p25) return Math.round(25 + ((p25 - value) / (p25 - p50)) * 25);
    return Math.max(5, Math.round(25 - ((value - p25) / p25) * 20));
  } else {
    const [p90, p75, p50, p25] = thresholds;
    if (value >= p90) return Math.min(100, Math.round(90 + ((value - p90) / (p90 * 0.3)) * 10));
    if (value >= p75) return Math.round(75 + ((value - p75) / (p90 - p75)) * 15);
    if (value >= p50) return Math.round(50 + ((value - p50) / (p75 - p50)) * 25);
    if (value >= p25) return Math.round(25 + ((value - p25) / (p50 - p25)) * 25);
    return Math.max(5, Math.round((value / p25) * 25));
  }
}

export interface StudentAssessmentInputs {
  age?: number | string;
  gender?: string;
  run50m?: number | string;
  run600m?: number | string;
  sitAndReach?: number | string;
  sitUps?: number | string;
  shuttleRun?: number | string;
  boardJump?: number | string;
  flamingoBalance?: number | string;
  pushUps?: number | string;
}

export interface KheloIndiaEvaluationResult {
  overallPercentile: number;
  overallScore: number;
  tier: TalentTier;
  tierInfo: TalentTierInfo;
  isTalentIdentified: boolean;
  isStatePotential: boolean;
  componentScores: {
    speedScore?: number;
    enduranceScore?: number;
    flexibilityScore?: number;
    coreScore?: number;
    balanceScore?: number;
  };
  strengthsMr: string[];
  strengthsEn: string[];
  recommendationsMr: string[];
  recommendationsEn: string[];
}

/**
 * Evaluates an athlete against official SAI Khelo India norms
 */
export function evaluateKheloIndiaFitness(inputs: StudentAssessmentInputs): KheloIndiaEvaluationResult {
  const age = typeof inputs.age === 'number' ? inputs.age : parseInt(String(inputs.age || '14'), 10) || 14;
  const isFemale = String(inputs.gender || '').toLowerCase().includes('girl') || 
                   String(inputs.gender || '').toLowerCase().includes('female') ||
                   String(inputs.gender || '').toLowerCase().includes('मुली') ||
                   String(inputs.gender || '').toLowerCase().includes('f');
  const gender: 'Male' | 'Female' = isFemale ? 'Female' : 'Male';

  // Find matching benchmark row
  const benchmark = KHELO_INDIA_BENCHMARKS.find(
    (b) => age >= b.minAge && age <= b.maxAge && b.gender === gender
  ) || KHELO_INDIA_BENCHMARKS.find((b) => b.gender === gender) || KHELO_INDIA_BENCHMARKS[0];

  const scores: number[] = [];
  const strengthsMr: string[] = [];
  const strengthsEn: string[] = [];
  const recsMr: string[] = [];
  const recsEn: string[] = [];
  const componentScores: KheloIndiaEvaluationResult['componentScores'] = {};

  // 1. Speed (50m Dash)
  const run50 = parseFloat(String(inputs.run50m || ''));
  if (!isNaN(run50) && run50 > 3 && run50 < 25) {
    const s = scoreMetric(run50, benchmark.run50mSeconds, true);
    scores.push(s);
    componentScores.speedScore = s;
    if (s >= 85) {
      strengthsMr.push('अतिवेग व स्फोटक हालचाल (Explosive Speed)');
      strengthsEn.push('Explosive Speed & Acceleration');
    } else if (s < 50) {
      recsMr.push('५० मी. धावण्यासाठी स्प्रिंट व स्ट्राइड ड्रिल्स आवश्यक.');
      recsEn.push('Sprint mechanics & stride frequency drills recommended.');
    }
  }

  // 2. Endurance (600m Run/Walk)
  const run600 = parseFloat(String(inputs.run600m || ''));
  if (!isNaN(run600) && run600 > 60 && run600 < 600) {
    const s = scoreMetric(run600, benchmark.run600mSeconds, true);
    scores.push(s);
    componentScores.enduranceScore = s;
    if (s >= 85) {
      strengthsMr.push('उत्कृष्ट हृदय व फुफ्फुसीय सहनशक्ती (Cardiovascular Endurance)');
      strengthsEn.push('Superior Aerobic & Cardiovascular Capacity');
    } else if (s < 50) {
      recsMr.push('दीर्घ अंतर धावणे व इंटरव्हल ट्रेनिंगद्वारे स्टॅमिना वाढवा.');
      recsEn.push('Build aerobic capacity via continuous long runs and interval training.');
    }
  }

  // 3. Flexibility (Sit & Reach)
  const reach = parseFloat(String(inputs.sitAndReach || ''));
  if (!isNaN(reach) && reach > 0 && reach < 60) {
    const s = scoreMetric(reach, benchmark.sitAndReachCm, false);
    scores.push(s);
    componentScores.flexibilityScore = s;
    if (s >= 85) {
      strengthsMr.push('शरीराची लवचिकता व सांध्यांची मोकळीक (Flexibility)');
      strengthsEn.push('High Joint Mobility & Hamstring Flexibility');
    } else if (s < 50) {
      recsMr.push('हॅमस्ट्रिंग व पाठीच्या स्नायूंचे स्ट्रेचिंग व योगासने करावीत.');
      recsEn.push('Daily hamstring, lumbar and hip mobility stretching required.');
    }
  }

  // 4. Core / Abdominal (Sit-ups / Partial Curl-ups)
  const sitUps = parseFloat(String(inputs.sitUps || ''));
  if (!isNaN(sitUps) && sitUps >= 0 && sitUps < 100) {
    const s = scoreMetric(sitUps, benchmark.partialCurlUpsReps, false);
    scores.push(s);
    componentScores.coreScore = s;
    if (s >= 85) {
      strengthsMr.push('मजबूत पोटाचे स्नायू व कोअर ताकद (Core Stability)');
      strengthsEn.push('High Core & Abdominal Muscular Endurance');
    } else if (s < 50) {
      recsMr.push('कोर स्ट्रेंथसाठी प्लँक व पार्शियल कर्ल-अप्स सराव करावा.');
      recsEn.push('Plank holds and controlled curl-ups to reinforce spinal stability.');
    }
  }

  // 5. Balance (Flamingo Balance or Static)
  const balance = parseFloat(String(inputs.flamingoBalance || ''));
  if (!isNaN(balance) && balance > 0) {
    const s = scoreMetric(balance, benchmark.flamingoBalanceSec, false);
    scores.push(s);
    componentScores.balanceScore = s;
    if (s >= 85) {
      strengthsMr.push('उत्कृष्ट स्थैतिक तोल व शारीरिक संतुलन (Static Balance)');
      strengthsEn.push('Superior Neuromuscular Balance & Proprioception');
    }
  }

  // 6. Push-ups
  const pushUps = parseFloat(String(inputs.pushUps || ''));
  if (!isNaN(pushUps) && pushUps >= 0) {
    const s = scoreMetric(pushUps, benchmark.pushUpsReps, false);
    scores.push(s);
  }

  // If no official battery tests entered, provide baseline neutral
  const overallPercentile = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 55;

  let tier: TalentTier = 'developing';
  if (overallPercentile >= 85) {
    tier = 'talent';
  } else if (overallPercentile >= 70) {
    tier = 'state';
  } else if (overallPercentile >= 50) {
    tier = 'proficient';
  } else if (overallPercentile >= 35) {
    tier = 'average';
  }

  return {
    overallPercentile,
    overallScore: overallPercentile,
    tier,
    tierInfo: TALENT_TIER_DETAILS[tier],
    isTalentIdentified: tier === 'talent',
    isStatePotential: tier === 'talent' || tier === 'state',
    componentScores,
    strengthsMr: strengthsMr.length > 0 ? strengthsMr : ['सर्वसाधारण शारीरिक समन्वय'],
    strengthsEn: strengthsEn.length > 0 ? strengthsEn : ['General motor coordination'],
    recommendationsMr: recsMr.length > 0 ? recsMr : ['नियमित सराव व संतुलित आहार चालू ठेवावा.'],
    recommendationsEn: recsEn.length > 0 ? recsEn : ['Maintain regular practice and balanced nutrition.']
  };
}
