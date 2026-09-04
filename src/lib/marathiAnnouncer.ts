/**
 * Marathi Sports Arena Voice Announcer (मराठी समालोचक / उद्घोषक)
 * Uses browser Web Speech Synthesis API with zero external dependencies.
 * Capable of announcing Do-or-Die 3rd raids, 3-minute periodic score updates, and last-minute time warnings.
 */

const MARATHI_NUMBERS: Record<number, string> = {
  0: "शून्य", 1: "एक", 2: "दोन", 3: "तीन", 4: "चार", 5: "पाच",
  6: "सहा", 7: "सात", 8: "आठ", 9: "नऊ", 10: "दहा",
  11: "अकरा", 12: "बारा", 13: "तेरा", 14: "चौदा", 15: "पंधरा",
  16: "सोळा", 17: "सतरा", 18: "अठरा", 19: "एकोणीस", 20: "वीस",
  21: "एकवीस", 22: "बावीस", 23: "तेवीस", 24: "चोवीस", 25: "पंचवीस",
  26: "सव्वीस", 27: "सत्तावीस", 28: "अठ्ठावीस", 29: "एकोणतीस", 30: "तीस",
  31: "एकतीस", 32: "बत्तीस", 33: "तेहतीस", 34: "चौतीस", 35: "पस्तीस",
  36: "छत्तीस", 37: "सदतीस", 38: "अडतीस", 39: "एकेचाळीस", 40: "चाळीस",
  41: "एक्केचाळीस", 42: "बेचाळीस", 43: "त्रेचाळीस", 44: "चव्वेचाळीस", 45: "पंचेचाळीस",
  46: "शेहेचाळीस", 47: "सत्तेचाळीस", 48: "अठ्ठेचाळीस", 49: "एकोणपन्नास", 50: "पन्नास",
  51: "एक्कावन्न", 52: "बावन्न", 53: "त्रेपन्न", 54: "चौपन्न", 55: "पंचावन्न",
  56: "छप्पन्न", 57: "सत्तावन्न", 58: "अठ्ठावन्न", 59: "एकोणसाठ", 60: "साठ",
  61: "एकसष्ठ", 62: "बासष्ठ", 63: "त्रेसष्ठ", 64: "चौसष्ठ", 65: "पासष्ठ",
  66: "सहासष्ठ", 67: "सदुसष्ठ", 68: "अडुसष्ठ", 69: "एकोणसत्तर", 70: "सत्तर",
  71: "एकाहत्तर", 72: "बाहत्तर", 73: "त्र्याहत्तर", 74: "चौऱ्याहत्तर", 75: "पंच्याहत्तर",
  76: "शहात्तर", 77: "सत्त्याहत्तर", 78: "अठ्ठ्याहत्तर", 79: "एकोणऐंशी", 80: "ऐंशी",
  81: "एक्याऐंशी", 82: "ब्याऐंशी", 83: "त्र्याऐंशी", 84: "चौऱ्याऐंशी", 85: "पंच्याऐंशी",
  86: "शहाऐंशी", 87: "सत्त्याऐंशी", 88: "अठ्ठ्याऐंशी", 89: "एकोणनव्वद", 90: "नव्वद",
  91: "एक्याण्णव", 92: "ब्याण्णव", 93: "त्र्याण्णव", 94: "चौऱ्याण्णव", 95: "पंच्याण्णव",
  96: "शहाण्णव", 97: "सत्त्याण्णव", 98: "अठ्ठ्याण्णव", 99: "नव्याण्णव", 100: "शंभर"
};

export function getMarathiNumberWord(num: number): string {
  if (num in MARATHI_NUMBERS) return MARATHI_NUMBERS[num];
  return num.toString();
}

class MarathiVoiceAnnouncer {
  public enabled: boolean = true;

  public speak(text: string, priority = false) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (priority) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // clear stadium announcer cadence
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith('mr')) 
        || voices.find(v => v.lang.startsWith('hi')) 
        || voices.find(v => v.lang.includes('IN'));

      if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang;
      } else {
        utterance.lang = 'mr-IN';
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Marathi Speech Synthesis warning:", err);
    }
  }

  /**
   * ⚡ Announce 3rd Raid (Do-or-Die Raid) in Marathi
   */
  announceDoOrDieRaid(teamName: string) {
    const text = `सावधान! ${teamName} ची ही तिसरी रेड आहे! डू ऑर डाय रेड! गुण मिळवणे अनिवार्य!`;
    this.speak(text, true);
  }

  /**
   * 📢 Announce Periodic 3-Minute Score Update in Marathi
   * e.g. "शिवाजी संघ तीन गुण, रमण संघ आठ गुण!"
   */
  announcePeriodicScore(teamAName: string, scoreA: number, teamBName: string, scoreB: number) {
    const wordA = getMarathiNumberWord(scoreA);
    const wordB = getMarathiNumberWord(scoreB);

    let status = "";
    if (scoreA > scoreB) {
      status = `${teamAName} आघाडीवर!`;
    } else if (scoreB > scoreA) {
      status = `${teamBName} आघाडीवर!`;
    } else {
      status = `दोन्ही संघ बरोबरीत!`;
    }

    const text = `गुणफलक समालोचन! ${teamAName} ${wordA} गुण, ${teamBName} ${wordB} गुण! ${status}`;
    this.speak(text, false);
  }

  /**
   * ⏱️ Announce Last Minute / Time Warnings in Marathi
   */
  announceLastMinute(remainingSeconds: number) {
    if (remainingSeconds === 60) {
      this.speak("लक्ष द्या! सामन्याचा शेवटचा एक मिनिट बाकी! शेवटचा एक मिनिट!", true);
    } else if (remainingSeconds === 30) {
      this.speak("शेवटचे तीस सेकंद बाकी!", true);
    } else if (remainingSeconds === 10) {
      this.speak("शेवटचे दहा सेकंद!", true);
    }
  }
}

export const marathiAnnouncer = new MarathiVoiceAnnouncer();
