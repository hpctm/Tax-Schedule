// Utility to check weekends and Korean public holidays and calculate next business day

export interface HolidayRecord {
  date: string; // YYYY-MM-DD
  name: string; // 휴일 명칭
}

const DEFAULT_HOLIDAYS: HolidayRecord[] = [
  // 2026년 공휴일
  { date: '2026-01-01', name: '신정' },
  { date: '2026-02-16', name: '설날 연휴' },
  { date: '2026-02-17', name: '설날' },
  { date: '2026-02-18', name: '설날 연휴' },
  { date: '2026-03-01', name: '삼일절' },
  { date: '2026-03-02', name: '삼일절 대체공휴일' },
  { date: '2026-05-05', name: '어린이날' },
  { date: '2026-05-24', name: '부처님오신날' },
  { date: '2026-05-25', name: '부처님오신날 대체공휴일' },
  { date: '2026-06-06', name: '현충일' },
  { date: '2026-08-15', name: '광복절' },
  { date: '2026-08-17', name: '광복절 대체공휴일' },
  { date: '2026-09-24', name: '추석 연휴' },
  { date: '2026-09-25', name: '추석' },
  { date: '2026-09-26', name: '추석 연휴' },
  { date: '2026-10-03', name: '개천절' },
  { date: '2026-10-05', name: '개천절 대체공휴일' },
  { date: '2026-10-09', name: '한글날' },
  { date: '2026-12-25', name: '성탄절' },

  // 2027년 공휴일
  { date: '2027-01-01', name: '신정' },
  { date: '2027-02-06', name: '설날 연휴' },
  { date: '2027-02-07', name: '설날' },
  { date: '2027-02-08', name: '설날 연휴' },
  { date: '2027-03-01', name: '삼일절' },
  { date: '2027-05-05', name: '어린이날' },
  { date: '2027-05-13', name: '부처님오신날' },
  { date: '2027-06-06', name: '현충일' },
  { date: '2027-06-07', name: '현충일 대체공휴일' },
  { date: '2027-08-15', name: '광복절' },
  { date: '2027-08-16', name: '광복절 대체공휴일' },
  { date: '2027-09-14', name: '추석 연휴' },
  { date: '2027-09-15', name: '추석' },
  { date: '2027-09-16', name: '추석 연휴' },
  { date: '2027-10-03', name: '개천절' },
  { date: '2027-10-04', name: '개천절 대체공휴일' },
  { date: '2027-10-09', name: '한글날' },
  { date: '2027-10-11', name: '한글날 대체공휴일' },
  { date: '2027-12-25', name: '성탄절' }
];

export function getCustomHolidays(): HolidayRecord[] {
  try {
    const saved = localStorage.getItem('lx_mma_custom_holidays_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    // Backward compatibility with old string array format
    const oldSaved = localStorage.getItem('lx_mma_custom_holidays');
    if (oldSaved) {
      const dates: string[] = JSON.parse(oldSaved);
      return dates.map(d => {
        const found = DEFAULT_HOLIDAYS.find(dh => dh.date === d);
        return found || { date: d, name: '사용자 지정 휴일' };
      });
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_HOLIDAYS;
}

export function saveCustomHolidays(holidays: HolidayRecord[]) {
  try {
    localStorage.setItem('lx_mma_custom_holidays_v2', JSON.stringify(holidays));
  } catch (e) {
    // ignore
  }
}

export function isWeekendOrHolidayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;

  const holidays = getCustomHolidays();
  return holidays.some(h => h.date === dateStr);
}

export function getNextBusinessDay(dateStr: string): { adjustedDate: string; wasShifted: boolean; originalDate: string } {
  if (!dateStr) return { adjustedDate: dateStr, wasShifted: false, originalDate: dateStr };
  
  const originalDate = dateStr;
  let [y, m, d] = dateStr.split('-').map(Number);
  let dateObj = new Date(y, m - 1, d);
  let shifted = false;

  while (isWeekendOrHolidayDate(`${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`)) {
    dateObj.setDate(dateObj.getDate() + 1);
    shifted = true;
  }

  const ny = dateObj.getFullYear();
  const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const nd = String(dateObj.getDate()).padStart(2, '0');
  const adjustedDate = `${ny}-${nm}-${nd}`;

  return { adjustedDate, wasShifted: shifted, originalDate };
}
