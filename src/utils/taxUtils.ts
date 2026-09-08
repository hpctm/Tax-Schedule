// Utility to check weekends and Korean public holidays and calculate next business day

export function isWeekendOrHolidayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;

  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  const mmmdd = `${mm}-${dd}`;

  // 2026 & 2027 major Korean public holidays
  const holidays: Record<number, string[]> = {
    2026: [
      '01-01', // 신정
      '02-16', '02-17', '02-18', // 설날 연휴
      '03-01', '03-02', // 삼일절 대체공휴일
      '05-05', // 어린이날
      '05-24', '05-25', // 부처님오신날 대체공휴일
      '06-06', // 현충일
      '08-15', // 광복절
      '09-24', '09-25', '09-26', '09-28', // 추석 연휴 및 대체공휴일
      '10-03', // 개천절
      '10-09', // 한글날
      '12-25'  // 성탄절
    ],
    2027: [
      '01-01'  // 신정
    ]
  };

  return holidays[y]?.includes(mmmdd) || false;
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
