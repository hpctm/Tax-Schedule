// Utility to check weekends and Korean public holidays and calculate next business day

const DEFAULT_HOLIDAYS: Record<string, string[]> = {
  '2026': [
    '2026-01-01', // 신정
    '2026-02-16', '2026-02-17', '2026-02-18', // 설날 연휴
    '2026-03-01', '2026-03-02', // 삼일절 대체공휴일
    '2026-05-05', // 어린이날
    '2026-05-24', '2026-05-25', // 부처님오신날 대체공휴일
    '2026-06-06', // 현충일
    '2026-08-15', // 광복절
    '2026-09-24', '2026-09-25', '2026-09-26', // 추석 연휴 (9월 28일 제외됨)
    '2026-10-03', // 개천절
    '2026-10-09', // 한글날
    '2026-12-25'  // 성탄절
  ],
  '2027': [
    '2027-01-01'  // 신정
  ]
};

export function getCustomHolidays(): string[] {
  try {
    const saved = localStorage.getItem('lx_mma_custom_holidays');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // ignore
  }
  const all: string[] = [];
  Object.values(DEFAULT_HOLIDAYS).forEach((arr) => all.push(...arr));
  return all;
}

export function saveCustomHolidays(holidays: string[]) {
  try {
    localStorage.setItem('lx_mma_custom_holidays', JSON.stringify(holidays));
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
  return holidays.includes(dateStr);
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
