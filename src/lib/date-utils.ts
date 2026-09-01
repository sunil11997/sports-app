/**
 * Central India (Asia/Kolkata) Date, Time, and Academic Year Utilities
 * Waghamba Sports Health Hub
 */

import { format, parseISO, isValid } from "date-fns";

export const TIMEZONE_INDIA = "Asia/Kolkata";

/**
 * Returns the current academic year string based on Indian school calendar (June 1 to May 31).
 * Example:
 * - June 2026 to May 2027 = "2026-27"
 * - June 2027 to May 2028 = "2027-28"
 */
export function getCurrentAcademicYear(dateInput: Date = new Date()): string {
  // Convert to IST
  const istDate = new Date(
    dateInput.toLocaleString("en-US", { timeZone: TIMEZONE_INDIA })
  );
  const year = istDate.getFullYear();
  const month = istDate.getMonth(); // 0-indexed: 0 = Jan, 4 = May, 5 = June

  if (month >= 5) {
    // June to December -> current year to next year
    const nextYearShort = String((year + 1) % 100).padStart(2, "0");
    return `${year}-${nextYearShort}`;
  } else {
    // January to May -> previous year to current year
    const currYearShort = String(year % 100).padStart(2, "0");
    return `${year - 1}-${currYearShort}`;
  }
}

/**
 * Returns a list of academic years for dropdowns and historical filtering.
 */
export function getAvailableAcademicYears(
  startYear: number = 2023,
  count: number = 7
): string[] {
  const years: string[] = [];
  for (let y = startYear; y < startYear + count; y++) {
    const nextShort = String((y + 1) % 100).padStart(2, "0");
    years.push(`${y}-${nextShort}`);
  }
  return years;
}

/**
 * Returns the current date formatted as 'yyyy-MM-dd' strictly in Asia/Kolkata timezone.
 * Replaces unreliable `new Date().toISOString().split('T')[0]` which uses UTC.
 */
export function getIndiaLocalDateString(
  dateInput: Date | string | number = new Date()
): string {
  try {
    const date =
      typeof dateInput === "string"
        ? parseISO(dateInput)
        : new Date(dateInput);

    if (!isValid(date)) {
      return format(new Date(), "yyyy-MM-dd");
    }

    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE_INDIA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // Output format: 'yyyy-MM-dd'
  } catch (e) {
    return format(new Date(), "yyyy-MM-dd");
  }
}

/**
 * Formats time in Indian local 12-hour format (e.g. "07:30 AM").
 */
export function getIndiaLocalTimeString(
  dateInput: Date | string | number = new Date()
): string {
  try {
    const date =
      typeof dateInput === "string"
        ? parseISO(dateInput)
        : new Date(dateInput);

    if (!isValid(date)) return "";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE_INDIA,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (e) {
    return "";
  }
}

/**
 * Formats date and time in Indian format (e.g. "01 Sep 2026, 11:30 AM").
 */
export function getIndiaLocalDateTimeString(
  dateInput: Date | string | number = new Date()
): string {
  try {
    const date =
      typeof dateInput === "string"
        ? parseISO(dateInput)
        : new Date(dateInput);

    if (!isValid(date)) return "";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE_INDIA,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (e) {
    return "";
  }
}

/**
 * Accurately calculates age from Date of Birth (DOB) string in 'yyyy-MM-dd' format.
 */
export function calculateAgeFromDob(dob: string): number {
  if (!dob || typeof dob !== "string") return 0;
  try {
    const birthDate = parseISO(dob.trim());
    if (!isValid(birthDate)) return 0;

    const todayStr = getIndiaLocalDateString();
    const today = parseISO(todayStr);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return Math.max(0, Math.min(100, age));
  } catch (e) {
    return 0;
  }
}

/**
 * Calculates BMI from height (in cm) and weight (in kg).
 * Returns rounded to 1 decimal place or null if invalid.
 */
export function calculateBmi(
  heightCm?: number | null,
  weightKg?: number | null
): number | null {
  if (!heightCm || !weightKg || heightCm <= 30 || weightKg <= 5) return null;
  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  return Number.isFinite(bmi) ? parseFloat(bmi.toFixed(1)) : null;
}

/**
 * Calculates official tournament age as of 31st December of a given academic year.
 * In India school games (DSO/SGFI), eligibility is evaluated as of 31st December of the tournament academic year.
 */
export function calculateAgeOn31DecOfAcademicYear(
  dobStr?: string,
  academicYearStr: string = getCurrentAcademicYear()
): string {
  if (!dobStr || typeof dobStr !== "string") return "---";
  try {
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return "---";

    // Extract start year from "2026-27" -> 2026
    const startYear = parseInt(academicYearStr.split("-")[0], 10) || new Date().getFullYear();
    const targetDate = new Date(`${startYear}-12-31T23:59:59`);

    let years = targetDate.getFullYear() - dob.getFullYear();
    let months = targetDate.getMonth() - dob.getMonth();

    if (months < 0 || (months === 0 && targetDate.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }

    if (years < 0) return "---";
    return `${years} वर्षे ${months} महिने`;
  } catch (e) {
    return "---";
  }
}
