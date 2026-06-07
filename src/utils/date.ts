import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('zh-cn');

export { dayjs };

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isPast(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

export function isFuture(date: string | Date): boolean {
  return dayjs(date).isAfter(dayjs(), 'day');
}

export function addDays(date: string | Date, days: number): string {
  return dayjs(date).add(days, 'day').toISOString();
}

export function startOfMonth(date: string | Date = new Date()): string {
  return dayjs(date).startOf('month').toISOString();
}

export function endOfMonth(date: string | Date = new Date()): string {
  return dayjs(date).endOf('month').toISOString();
}

export function getDaysInMonth(date: string | Date = new Date()): number {
  return dayjs(date).daysInMonth();
}

export function getFirstDayOfMonth(date: string | Date = new Date()): number {
  return dayjs(date).startOf('month').day();
}

export function getDateRange(range: 'day' | 'week' | 'month' | 'year'): { start: string; end: string } {
  const now = dayjs();
  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  switch (range) {
    case 'day':
      start = now.startOf('day');
      end = now.endOf('day');
      break;
    case 'week':
      start = now.startOf('week');
      end = now.endOf('week');
      break;
    case 'month':
      start = now.startOf('month');
      end = now.endOf('month');
      break;
    case 'year':
      start = now.startOf('year');
      end = now.endOf('year');
      break;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates.map(d => formatDate(d)))];
  const sortedDates = uniqueDates.sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());

  let streak = 0;
  let currentDate = dayjs().startOf('day');

  for (const dateStr of sortedDates) {
    const date = dayjs(dateStr).startOf('day');
    const diffDays = currentDate.diff(date, 'day');

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  return streak;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}
