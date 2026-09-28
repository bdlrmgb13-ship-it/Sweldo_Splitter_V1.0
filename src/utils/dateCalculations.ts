/**
 * Precise date calculations mirroring java.time.LocalDate and java.time.temporal.ChronoUnit.DAYS
 * Safely handles multi-month, cross-month (e.g., Sept 20 to Oct 5 = 16 days), and leap-year cycles.
 */

export function parseDate(isoDateStr: string): Date {
  const [year, month, day] = isoDateStr.split('-').map(Number);
  // Construct using local components to avoid UTC timezone shifts
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates inclusive days between start and end date.
 * Equivalent to ChronoUnit.DAYS.between(start, end) + 1.
 * e.g., Sept 20 to Oct 5:
 * Sept 20 to Sept 30 = 11 days
 * Oct 1 to Oct 5 = 5 days
 * Total = 16 days.
 */
export function getInclusiveDaysCount(startDateStr: string, endDateStr: string): number {
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Generates an array of ISO date strings for every day in the inclusive range.
 */
export function generateDateSequence(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const current = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  while (current <= end) {
    dates.push(toIsoDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatShortMonthDay(isoDateStr: string): string {
  const d = parseDate(isoDateStr);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[d.getMonth()]} ${d.getDate()}`;
}

export function formatDayOfWeek(isoDateStr: string): string {
  const d = parseDate(isoDateStr);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[d.getDay()];
}

export function formatFullDate(isoDateStr: string): string {
  const d = parseDate(isoDateStr);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Calculates last day of a given month
 */
export function getLastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/**
 * Helper to compute Quincena ranges (1st–15th or 16th–End of Month)
 */
export function computeQuincenaRange(date: Date, half: 'first_half' | 'second_half'): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (half === 'first_half') {
    const start = new Date(year, month, 1);
    const end = new Date(year, month, 15);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  } else {
    const start = new Date(year, month, 16);
    const lastDay = getLastDayOfMonth(year, month);
    const end = new Date(year, month, lastDay);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }
}

/**
 * Helper to compute Monthly range (1st to 30th/31st/28th/29th)
 */
export function computeMonthlyRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const lastDay = getLastDayOfMonth(year, month);
  const end = new Date(year, month, lastDay);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}
