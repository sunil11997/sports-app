/**
 * Clinical 6-Stage Return-to-Play (RTP) Protocol & Athlete Safety Lock
 * Conforms to youth sports safety guidelines (SGFI & International Consensus on Sports Injury Management).
 * 
 * Protocol Stages:
 * Stage 1: Symptom-Limited Rest (लक्षण-मर्यादित विश्रांती)
 * Stage 2: Light Aerobic Exercise (हलका एरोबिक व्यायाम - चालणे, सायकलिंग)
 * Stage 3: Sport-Specific Drills (खेळ-विशिष्ट सराव - संपर्कविरहित)
 * Stage 4: Non-Contact Team Drills (संपर्कविरहित सांघिक सराव व कौशल्ये)
 * Stage 5: Full-Contact Practice (पूर्ण संपर्क सराव - क्रीडा शिक्षक संमती)
 * Stage 6: Return to Competition Clearance (सामन्यात खेळण्यास अधिकृत मुभा)
 */

export interface RTPStageDefinition {
  stage: number;
  nameMr: string;
  nameEn: string;
  objectiveMr: string;
  objectiveEn: string;
  allowedActivitiesMr: string[];
  allowedActivitiesEn: string[];
  prohibitedActivitiesMr: string[];
  prohibitedActivitiesEn: string[];
  competitionEligible: boolean;
  colorClass: string;
  badgeClass: string;
}

export const RTP_STAGES: Record<number, RTPStageDefinition> = {
  1: {
    stage: 1,
    nameMr: 'टप्पा १: लक्षण-मर्यादित विश्रांती',
    nameEn: 'Stage 1: Symptom-Limited Rest',
    objectiveMr: 'दुखापतीची सूज व वेदना कमी होईपर्यंत संपूर्ण शारीरिक विश्रांती.',
    objectiveEn: 'Relative physical and cognitive rest until acute pain/swelling subsides.',
    allowedActivitiesMr: ['दैनिक दैनंदिन कामे (वेदना न जाणवल्यास)', 'हलके स्ट्रेचिंग'],
    allowedActivitiesEn: ['Activities of daily living if pain-free', 'Passive gentle stretching'],
    prohibitedActivitiesMr: ['कोणताही धावण्याचा किंवा उड्या मारण्याचा सराव', 'वजन उचलणे', 'मैदानावर प्रत्यक्ष खेळ'],
    prohibitedActivitiesEn: ['Any running, jumping, or agility work', 'Resistance training', 'Match play'],
    competitionEligible: false,
    colorClass: 'text-red-500 bg-red-500/10 border-red-500/30',
    badgeClass: 'bg-red-600 text-white'
  },
  2: {
    stage: 2,
    nameMr: 'टप्पा २: हलका एरोबिक व्यायाम',
    nameEn: 'Stage 2: Light Aerobic Exercise',
    objectiveMr: 'हृदयाची गती हळूहळू वाढवणे; दुखापतीच्या भागावर ताण न देता रक्तप्रवाह सुधारणे.',
    objectiveEn: 'Increase heart rate safely without overloading the injured site.',
    allowedActivitiesMr: ['१०-१५ मिनिटे संथ चालणे', 'हलके स्टॅटिक सायकलिंग', 'श्वसनाचे व्यायाम'],
    allowedActivitiesEn: ['10-15 min slow walking', 'Light stationary cycling', 'Breathing exercises'],
    prohibitedActivitiesMr: ['धावणे / स्प्रिंट्स', 'शारीरिक संपर्क (Contact)', 'उड्या मारणे'],
    prohibitedActivitiesEn: ['Running or sprinting', 'Any contact', 'Jumping or change-of-direction'],
    competitionEligible: false,
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    badgeClass: 'bg-orange-600 text-white'
  },
  3: {
    stage: 3,
    nameMr: 'टप्पा ३: खेळ-विशिष्ट सराव (नो कॉन्टॅक्ट)',
    nameEn: 'Stage 3: Sport-Specific Drills',
    objectiveMr: 'खेळाच्या मूलभूत हालचाली व फूटवर्क सुरू करणे; शारीरिक संपर्क पूर्णपणे वर्ज्य.',
    objectiveEn: 'Add sport-specific movement patterns and footwork with strictly zero contact.',
    allowedActivitiesMr: ['कबड्डी फूटवर्क (बोनस रेषा हालचाल - एकट्याने)', 'खो-खो पोल रन', 'चेंडू थ्रो/कॅच सराव'],
    allowedActivitiesEn: ['Individual footwork drills', 'Agility cones and directional running', 'Catching/passing solo'],
    prohibitedActivitiesMr: ['टॅकल किंवा पकड (Tackling)', 'डाइव्ह मारणे', 'इतर खेळाडूंशी धडक'],
    prohibitedActivitiesEn: ['Tackling or collision', 'Diving or hard impact', 'Any direct opposition contact'],
    competitionEligible: false,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    badgeClass: 'bg-amber-600 text-slate-950 font-bold'
  },
  4: {
    stage: 4,
    nameMr: 'टप्पा ४: संपर्कविरहित सांघिक सराव',
    nameEn: 'Stage 4: Non-Contact Team Drills',
    objectiveMr: 'सहकाऱ्यांसोबत रणनीती व तंत्रशुद्ध कौशल्य सराव करणे.',
    objectiveEn: 'Progress to complex technical drills and coordinated team strategy.',
    allowedActivitiesMr: ['सांघिक रणनीती सराव', 'पासिंग व पोझिशनिंग', 'हलके स्ट्रेंथ व्यायाम'],
    allowedActivitiesEn: ['Team passing and tactical walk-throughs', 'Coordination drills', 'Light strength training'],
    prohibitedActivitiesMr: ['प्रत्यक्ष सामना किंवा स्क्रिमेज (Match Scrimmage)', 'कठीण शारीरिक टॅकल'],
    prohibitedActivitiesEn: ['Live scrimmage or match situations', 'Full contact tackles'],
    competitionEligible: false,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    badgeClass: 'bg-blue-600 text-white'
  },
  5: {
    stage: 5,
    nameMr: 'टप्पा ५: पूर्ण संपर्क सराव (प्रशिक्षक संमती)',
    nameEn: 'Stage 5: Full-Contact Practice',
    objectiveMr: 'सर्व हालचालींमध्ये आत्मविश्वास व कार्यक्षमता तपासणे; क्रीडा शिक्षकांची देखरेख आवश्यक.',
    objectiveEn: 'Restore athletic confidence and functional readiness in normal training under coach supervision.',
    allowedActivitiesMr: ['संपूर्ण नियमित सराव', 'सराव सामने (Practice Scrimmage)', 'टॅकल व डिफेन्स सराव'],
    allowedActivitiesEn: ['Full training sessions', 'Controlled scrimmage', 'Defensive holding and game drills'],
    prohibitedActivitiesMr: ['अधिकृत स्पर्धात्मक सामना (जोपर्यंत २४ तास लक्षणमुक्त राहत नाही)'],
    prohibitedActivitiesEn: ['Official competition play until symptom-free for at least 24 hours post-practice'],
    competitionEligible: false,
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    badgeClass: 'bg-indigo-600 text-white'
  },
  6: {
    stage: 6,
    nameMr: 'टप्पा ६: सामन्यात खेळण्यास अधिकृत मुभा (Clearance)',
    nameEn: 'Stage 6: Competition Clearance',
    objectiveMr: 'खेळाडू पूर्णपणे तंदुरुस्त असून जिल्हा, विभाग व राज्यस्तरीय सामन्यात खेळण्यासाठी पात्र.',
    objectiveEn: 'Full medical & coaching clearance to participate in competitive tournament matches.',
    allowedActivitiesMr: ['सर्व अधिकृत सामने', 'पूर्ण कालावधी खेळणे'],
    allowedActivitiesEn: ['All official tournament matches', 'Full game duration'],
    prohibitedActivitiesMr: ['काहीही नाही - तंदुरुस्त'],
    prohibitedActivitiesEn: ['None - fully cleared'],
    competitionEligible: true,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    badgeClass: 'bg-emerald-600 text-white font-bold'
  }
};

export interface AthleteRTPStatus {
  isEligibleForMatch: boolean;
  activeIncidentId?: string;
  injuryName?: string;
  injuryDate?: string;
  currentStage: number;
  stageInfo: RTPStageDefinition;
  statusBadgeMr: string;
  statusBadgeEn: string;
  warningNoticeMr?: string;
  warningNoticeEn?: string;
}

/**
 * Evaluates whether an athlete is clinically cleared to play in competition or currently in RTP protocol
 */
export function getAthleteRTPStatus(
  athleteId: string,
  healthIncidents: any[] = []
): AthleteRTPStatus {
  if (!athleteId || !Array.isArray(healthIncidents) || healthIncidents.length === 0) {
    return {
      isEligibleForMatch: true,
      currentStage: 6,
      stageInfo: RTP_STAGES[6],
      statusBadgeMr: 'तंदुरुस्त (Fit to Play)',
      statusBadgeEn: 'Fit to Play'
    };
  }

  // Find active, unresolved incidents for this athlete
  const activeIncidents = healthIncidents.filter((h: any) => {
    if (!h || h.playerId !== athleteId) return false;
    const isResolved = h.resolved === true || h.status === 'Resolved' || String(h.description || '').includes('[STATUS: RESOLVED]');
    return !isResolved;
  });

  if (activeIncidents.length === 0) {
    return {
      isEligibleForMatch: true,
      currentStage: 6,
      stageInfo: RTP_STAGES[6],
      statusBadgeMr: 'तंदुरुस्त (Fit to Play)',
      statusBadgeEn: 'Fit to Play'
    };
  }

  // Sort to get the most recent or lowest stage incident
  const primaryIncident = activeIncidents[0];
  const rtpStage = typeof primaryIncident.rtpStage === 'number' 
    ? Math.max(1, Math.min(6, primaryIncident.rtpStage))
    : (primaryIncident.severity === 'Critical' ? 1 : 2);

  const stageInfo = RTP_STAGES[rtpStage] || RTP_STAGES[1];
  const isEligible = stageInfo.competitionEligible;

  return {
    isEligibleForMatch: isEligible,
    activeIncidentId: primaryIncident.id,
    injuryName: primaryIncident.description || primaryIncident.type || 'Sports Injury',
    injuryDate: primaryIncident.date,
    currentStage: rtpStage,
    stageInfo,
    statusBadgeMr: isEligible 
      ? 'तंदुरुस्त (Fit)' 
      : `🚫 दुखापत पुनर्वसन (${stageInfo.nameMr.split(':')[0]})`,
    statusBadgeEn: isEligible
      ? 'Fit'
      : `In Rehab (${stageInfo.nameEn.split(':')[0]})`,
    warningNoticeMr: isEligible
      ? undefined
      : `हा खेळाडू सध्या ${stageInfo.nameMr} मध्ये असून प्रत्यक्ष सामना खेळण्यासाठी वैद्यकीयदृष्ट्या अपात्र आहे.`,
    warningNoticeEn: isEligible
      ? undefined
      : `This athlete is currently in ${stageInfo.nameEn} and clinically ineligible for match competition.`
  };
}
