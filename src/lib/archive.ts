/** Haber arşivi: takvim yılı/ayı (Europe/Istanbul, UTC+3). Günlük sayfa yok. */

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function parseArchiveYear(raw: string): number | null {
  if (!/^\d{4}$/.test(raw)) return null;
  const year = Number(raw);
  if (year < 2010 || year > 2100) return null;
  return year;
}

export function parseArchiveMonth(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const month = Number(raw);
  if (month < 1 || month > 12) return null;
  return month;
}

export function monthRangeIso(year: number, month: number) {
  const start = `${year}-${pad2(month)}-01T00:00:00+03:00`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const end = `${nextYear}-${pad2(nextMonth)}-01T00:00:00+03:00`;
  return { start, end };
}

export function istanbulParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: num("year"), month: num("month"), day: num("day") };
}

export function archiveYearPath(year: number) {
  return `/arsiv/${year}`;
}

export function archiveMonthPath(year: number, month: number) {
  return `/arsiv/${year}/${pad2(month)}`;
}

export function archivePathFromPublishedAt(iso: string) {
  const { year, month } = istanbulParts(iso);
  return archiveMonthPath(year, month);
}

export function monthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${year}-${pad2(month)}-15T12:00:00+03:00`));
}

export type ArchiveMonth = { year: number; month: number; count: number };
export type ArchiveYear = { year: number; months: ArchiveMonth[]; count: number };

export function groupArchiveMonths(publishedAt: string[]): ArchiveYear[] {
  const map = new Map<string, ArchiveMonth>();
  for (const iso of publishedAt) {
    if (!iso) continue;
    const { year, month } = istanbulParts(iso);
    if (!year || !month) continue;
    const key = `${year}-${month}`;
    const hit = map.get(key);
    if (hit) hit.count += 1;
    else map.set(key, { year, month, count: 1 });
  }
  const byYear = new Map<number, ArchiveMonth[]>();
  for (const row of map.values()) {
    const list = byYear.get(row.year) ?? [];
    list.push(row);
    byYear.set(row.year, list);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: months.sort((a, b) => b.month - a.month),
      count: months.reduce((n, m) => n + m.count, 0),
    }));
}
