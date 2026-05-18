import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd MMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd/MM', { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'MMMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'yyyy-MM-dd');
  });
}

export function getMonthRange(year, month) {
  const date = new Date(year, month - 1, 1);
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function getYearRange(year) {
  const date = new Date(year, 0, 1);
  return {
    start: format(startOfYear(date), 'yyyy-MM-dd'),
    end: format(endOfYear(date), 'yyyy-MM-dd'),
  };
}

export function currentMonth() {
  return format(new Date(), 'M');
}

export function currentYear() {
  return format(new Date(), 'yyyy');
}

export function getMonthName(monthNum) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[monthNum - 1] || '';
}
