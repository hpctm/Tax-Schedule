// Utility to check weekends and Korean public holidays and calculate next business day
import { TaxSchedule } from '../types';

export type HolidayType = 'legal' | 'substitute' | 'company' | 'custom';

export interface HolidayRecord {
  date: string; // YYYY-MM-DD
  name: string; // 휴일 명칭
  type?: HolidayType; // 휴일 종류: legal(법정공휴일), substitute(대체공휴일/대체휴일), company(회사/임시휴일), custom(기타)
}

export const DEFAULT_HOLIDAYS: HolidayRecord[] = [
  // 2026년 공휴일 및 대체공휴일
  { date: '2026-01-01', name: '신정', type: 'legal' },
  { date: '2026-02-16', name: '설날 연휴', type: 'legal' },
  { date: '2026-02-17', name: '설날', type: 'legal' },
  { date: '2026-02-18', name: '설날 연휴', type: 'legal' },
  { date: '2026-03-01', name: '삼일절', type: 'legal' },
  { date: '2026-03-02', name: '삼일절 대체공휴일', type: 'substitute' },
  { date: '2026-05-05', name: '어린이날', type: 'legal' },
  { date: '2026-05-24', name: '부처님오신날', type: 'legal' },
  { date: '2026-05-25', name: '부처님오신날 대체공휴일', type: 'substitute' },
  { date: '2026-06-06', name: '현충일', type: 'legal' },
  { date: '2026-08-15', name: '광복절', type: 'legal' },
  { date: '2026-08-17', name: '광복절 대체공휴일', type: 'substitute' },
  { date: '2026-09-24', name: '추석 연휴', type: 'legal' },
  { date: '2026-09-25', name: '추석', type: 'legal' },
  { date: '2026-09-26', name: '추석 연휴', type: 'legal' },
  { date: '2026-10-03', name: '개천절', type: 'legal' },
  { date: '2026-10-05', name: '개천절 대체공휴일', type: 'substitute' },
  { date: '2026-10-09', name: '한글날', type: 'legal' },
  { date: '2026-12-25', name: '성탄절', type: 'legal' },

  // 2027년 공휴일 및 대체공휴일
  { date: '2027-01-01', name: '신정', type: 'legal' },
  { date: '2027-02-06', name: '설날 연휴', type: 'legal' },
  { date: '2027-02-07', name: '설날', type: 'legal' },
  { date: '2027-02-08', name: '설날 연휴', type: 'legal' },
  { date: '2027-02-09', name: '설날 대체공휴일', type: 'substitute' },
  { date: '2027-03-01', name: '삼일절', type: 'legal' },
  { date: '2027-05-05', name: '어린이날', type: 'legal' },
  { date: '2027-05-13', name: '부처님오신날', type: 'legal' },
  { date: '2027-06-06', name: '현충일', type: 'legal' },
  { date: '2027-06-07', name: '현충일 대체공휴일', type: 'substitute' },
  { date: '2027-08-15', name: '광복절', type: 'legal' },
  { date: '2027-08-16', name: '광복절 대체공휴일', type: 'substitute' },
  { date: '2027-09-14', name: '추석 연휴', type: 'legal' },
  { date: '2027-09-15', name: '추석', type: 'legal' },
  { date: '2027-09-16', name: '추석 연휴', type: 'legal' },
  { date: '2027-10-03', name: '개천절', type: 'legal' },
  { date: '2027-10-04', name: '개천절 대체공휴일', type: 'substitute' },
  { date: '2027-10-09', name: '한글날', type: 'legal' },
  { date: '2027-10-11', name: '한글날 대체공휴일', type: 'substitute' },
  { date: '2027-12-25', name: '성탄절', type: 'legal' }
];

const STORAGE_KEY = 'lx_mma_holidays_v3';

export function getCustomHolidays(): HolidayRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: HolidayRecord[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_HOLIDAYS;
}

export function saveCustomHolidays(holidays: HolidayRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  } catch (e) {
    // ignore
  }
}

export function isWeekendOrHolidayDate(dateStr: string, customHolidays?: HolidayRecord[]): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;

  const holidays = customHolidays || getCustomHolidays();
  return holidays.some((h) => h.date === dateStr);
}

export function getNextBusinessDay(
  dateStr: string,
  customHolidays?: HolidayRecord[]
): { adjustedDate: string; wasShifted: boolean; originalDate: string } {
  if (!dateStr) return { adjustedDate: dateStr, wasShifted: false, originalDate: dateStr };

  const originalDate = dateStr;
  let [y, m, d] = dateStr.split('-').map(Number);
  let dateObj = new Date(y, m - 1, d);
  let shifted = false;

  while (
    isWeekendOrHolidayDate(
      `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
      customHolidays
    )
  ) {
    dateObj.setDate(dateObj.getDate() + 1);
    shifted = true;
  }

  const ny = dateObj.getFullYear();
  const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const nd = String(dateObj.getDate()).padStart(2, '0');
  const adjustedDate = `${ny}-${nm}-${nd}`;

  return { adjustedDate, wasShifted: shifted, originalDate };
}

export function recalculateScheduleDueDate(
  schedule: TaxSchedule,
  customHolidays?: HolidayRecord[]
): TaxSchedule {
  let original = schedule.originalDueDate;
  if (!original) {
    const match = schedule.description?.match(/원래 마감일인 (\d{4}-\d{2}-\d{2})이/);
    if (match && match[1]) {
      original = match[1];
    } else {
      original = schedule.dueDate;
    }
  }

  const { adjustedDate, wasShifted, originalDate } = getNextBusinessDay(original, customHolidays);
  const baseDesc = (schedule.description || '').replace(/\s*\(원래 마감일인 [^)]+로 이월\)/g, '').trim();
  const newDesc = wasShifted
    ? `${baseDesc} (원래 마감일인 ${originalDate}이 주말/공휴일이므로 익영업일인 ${adjustedDate}로 이월)`
    : baseDesc;

  return {
    ...schedule,
    originalDueDate: original,
    dueDate: adjustedDate,
    description: newDesc,
  };
}
