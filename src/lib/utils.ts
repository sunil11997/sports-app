import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * shareToWhatsApp - Institutional Reporting Engine
 * Constructs a formatted Marathi message for parents and students.
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

  const message = `*${schoolName}*
*प्रगती अहवाल (Progress Report)*

*शिक्षक:* ${teacherName}
------------------------------
*विद्यार्थ्याची माहिती:*
*नाव:* ${studentName}
*इयत्ता:* ${std} वी
*वय:* ${age} वर्षे | *जन्म तारीख:* ${dob}
*उंची:* ${height} cm | *वजन:* ${weight} kg
*BMI:* ${bmi}

*नवीन अपडेट - ${reportType}:*
${reportData}
------------------------------
हा अहवाल 'वाघंबा स्पोर्ट्स हब' मधून आपोआप पाठवण्यात आला आहे.`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}
