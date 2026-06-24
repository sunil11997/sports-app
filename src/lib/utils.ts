import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
