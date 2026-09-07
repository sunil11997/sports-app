/**
 * AI Safety and Clinical Red-Flag Screening Utility
 * Detects severe injuries, fractures, head trauma, and cardiorespiratory distress
 * to immediately trigger medical triage protocols instead of synthetic coaching advice.
 */

export interface EmergencyCheckResult {
  isEmergency: boolean;
  redFlag: string;
}

export function detectEmergencyRedFlags(text: string): EmergencyCheckResult {
  const lower = text.toLowerCase();
  const redFlags = [
    { pattern: /fracture|तुटले|हाड मोडले|bone break|dislocat/i, desc: 'Suspected Fracture / संशयित अस्थिभंग' },
    { pattern: /head (injury|trauma|hit|impact|blow)|concussion|डोक्याला मार|चक्कर|los[st] (of )?consciousness|unconscious|faint|blackout|dizzy/i, desc: 'Head Trauma & Concussion / डोक्याला गंभीर दुखापत' },
    { pattern: /chest pain|छातीत दुखणे|heart pain|श्वास घेण्यास त्रास|breathing difficulty|shortness of breath/i, desc: 'Cardiorespiratory Distress / छातीत वेदना किंवा श्वसनाचा त्रास' },
    { pattern: /severe pain|असह्य वेदना|extreme swelling|जास्त सूज|deformity|वाकडे झाले|bleeding profusely/i, desc: 'Severe Acute Trauma / तीव्र दुखापत किंवा रक्तस्राव' },
    { pattern: /numbness|मुंग्या येणे|paralysis|हालचाल बंद|tingling|cannot move/i, desc: 'Neurological / Structural Impairment / अवयवाची हालचाल बंद' },
  ];

  for (const rf of redFlags) {
    if (rf.pattern.test(lower)) {
      return { isEmergency: true, redFlag: rf.desc };
    }
  }
  return { isEmergency: false, redFlag: '' };
}
