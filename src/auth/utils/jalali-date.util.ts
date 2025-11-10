import { toGregorian, toJalali } from 'jalaali-js';

/**
 * Converts Jalali date string (YYYY/MM/DD) to Gregorian Date object
 * @param jalaliDateString - Date string in format YYYY/MM/DD
 * @returns Date object or null if invalid
 */
export function jalaliToGregorian(jalaliDateString: string): Date | null {
  try {
    const parts = jalaliDateString.split('/');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return null;
    }

    // Validate Jalali date ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const gregorian = toGregorian(year, month, day);
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  } catch {
    return null;
  }
}

/**
 * Converts Gregorian Date object to Jalali date string (YYYY/MM/DD)
 * @param date - Date object
 * @returns Jalali date string in format YYYY/MM/DD or null if invalid
 */
export function gregorianToJalali(date: Date | string | null | undefined): string | null {
  if (!date) return null;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;

    const jalali = toJalali(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      dateObj.getDate(),
    );

    return `${jalali.jy}/${String(jalali.jm).padStart(2, '0')}/${String(jalali.jd).padStart(2, '0')}`;
  } catch {
    return null;
  }
}

/**
 * Validates Jalali date string format (YYYY/MM/DD)
 * @param jalaliDateString - Date string to validate
 * @returns true if valid format
 */
export function isValidJalaliDate(jalaliDateString: string): boolean {
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!regex.test(jalaliDateString)) return false;

  const date = jalaliToGregorian(jalaliDateString);
  return date !== null;
}

