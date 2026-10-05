export function formatDate(value: string): string {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return dateParts ? `${dateParts[3]}/${dateParts[2]}/${dateParts[1].slice(-2)}` : value;
}

export function formatCompanyDate(value: string): string {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateParts) {
    return value;
  }

  const [, year, month, day] = dateParts;
  const monthName = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(Number(year), Number(month) - 1, 1)),
  );

  return `${day} ${monthName} ${year}`;
}

export function formatWorkDuration(startDate: string, endDate: string): string {
  const months = approximateDurationMonths(startDate, endDate);
  if (months === null) {
    return '';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const duration = [
    years > 0 ? `${years} ${years === 1 ? 'Year' : 'Years'}` : '',
    remainingMonths > 0 ? `${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `~${duration}`;
}

export function approximateDurationMonths(startDate: string, endDate: string): number | null {
  const start = parseDate(startDate);
  const end = endDate === 'Now' ? new Date() : parseDate(endDate);
  if (!start || !end || end < start) {
    return null;
  }

  const averageDaysPerMonth = 365.2425 / 12;
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (averageDaysPerMonth * 86_400_000)),
  );
}

export function approximateDurationMonthsFromDays(days: number): number {
  const averageDaysPerMonth = 365.2425 / 12;
  return Math.max(1, Math.ceil(days / averageDaysPerMonth));
}

export function calendarDurationMonths(startDate: string, endDate: string): number | null {
  const range = parseDateRange(startDate, endDate);
  if (!range) {
    return null;
  }

  const start = range.start;
  const end = range.end;
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();

  return Math.max(0, months - Number(end.getUTCDate() < start.getUTCDate()));
}

export function dateRangeInDays(
  startDate: string,
  endDate: string,
): { start: number; end: number } | null {
  const range = parseDateRange(startDate, endDate);
  if (!range) {
    return null;
  }

  const dayMilliseconds = 86_400_000;
  return {
    start: range.start.getTime() / dayMilliseconds,
    end: range.end.getTime() / dayMilliseconds,
  };
}

function parseDateRange(startDate: string, endDate: string): { start: Date; end: Date } | null {
  const start = parseDate(startDate);
  const end =
    endDate === 'Now' ? parseDate(new Date().toISOString().slice(0, 10)) : parseDate(endDate);

  if (!start || !end || end < start) {
    return null;
  }

  return { start, end };
}

function parseDate(value: string): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateParts) {
    return null;
  }

  const year = Number(dateParts[1]);
  const month = Number(dateParts[2]);
  const day = Number(dateParts[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}
