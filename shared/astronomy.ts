import * as Astronomy from 'astronomy-engine';
import type { BirthInput, CityEntry, FactPacket, MoonPhaseInfo, SignId } from './types.ts';

export const SIGN_ORDER: SignId[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export const BUNDLED_CITIES: CityEntry[] = [
  { id: 'chakdaha-in', name: 'Chakdaha', region: 'West Bengal', country: 'India', lat: 23.08, lon: 88.52, timeZone: 'Asia/Kolkata' },
  { id: 'kalyani-in', name: 'Kalyani', region: 'West Bengal', country: 'India', lat: 22.975, lon: 88.434, timeZone: 'Asia/Kolkata' },
  { id: 'kolkata-in', name: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, timeZone: 'Asia/Kolkata' },
  { id: 'siliguri-in', name: 'Siliguri', region: 'West Bengal', country: 'India', lat: 26.7271, lon: 88.3953, timeZone: 'Asia/Kolkata' },
  { id: 'darjeeling-in', name: 'Darjeeling', region: 'West Bengal', country: 'India', lat: 27.041, lon: 88.2663, timeZone: 'Asia/Kolkata' },
  { id: 'dhaka-bd', name: 'Dhaka', region: 'Dhaka Division', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, timeZone: 'Asia/Dhaka' },
  { id: 'mumbai-in', name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777, timeZone: 'Asia/Kolkata' },
  { id: 'delhi-in', name: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209, timeZone: 'Asia/Kolkata' },
  { id: 'bengaluru-in', name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, timeZone: 'Asia/Kolkata' },
  { id: 'hyderabad-in', name: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.385, lon: 78.4867, timeZone: 'Asia/Kolkata' },
  { id: 'london-uk', name: 'London', region: 'England', country: 'United Kingdom', lat: 51.5072, lon: -0.1276, timeZone: 'Europe/London' },
  { id: 'springfield-us-il', name: 'Springfield', region: 'Illinois', country: 'United States', lat: 39.7817, lon: -89.6501, timeZone: 'America/Chicago' },
  { id: 'springfield-us-ma', name: 'Springfield', region: 'Massachusetts', country: 'United States', lat: 42.1015, lon: -72.5898, timeZone: 'America/New_York' },
  { id: 'tokyo-jp', name: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503, timeZone: 'Asia/Tokyo' },
];

export const MIN_SUPPORTED_YEAR = 1900;
export const MAX_SUPPORTED_YEAR = 2100;

export function normalizeDegrees(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

export function longitudeToSign(elonDegrees: number): { signId: SignId; degreeInSign: number } {
  const norm = normalizeDegrees(elonDegrees);
  const index = Math.floor(norm / 30) % 12;
  return {
    signId: SIGN_ORDER[index],
    degreeInSign: Number((norm - index * 30).toFixed(2)),
  };
}

/**
 * Format a UTC Date into YYYY-MM-DD and HH:mm in a target IANA timezone.
 */
export function formatInTimeZone(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number; hour: number; minute: number; dateStr: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  return {
    year,
    month,
    day,
    hour,
    minute,
    dateStr: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

/**
 * Resolve a local civil date & time in an IANA timezone to candidate UTC instants,
 * accurately handling nonexistent DST gaps and ambiguous DST overlaps.
 */
export function resolveLocalCivilTime(
  dateStr: string,
  timeStr: string,
  timeZone: string
): { status: 'exact'; utc: Date } | { status: 'nonexistent' } | { status: 'ambiguous'; options: Date[] } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const targetUtcApprox = Date.UTC(y, m - 1, d, hh, mm, 0);

  // Search offsets around +-14 hours in 15-minute steps to catch half-hour & quarter-hour zones (e.g., IST +05:30)
  const matches: Date[] = [];
  for (let offsetMin = -14 * 60; offsetMin <= 14 * 60; offsetMin += 15) {
    const candidate = new Date(targetUtcApprox - offsetMin * 60_000);
    const formatted = formatInTimeZone(candidate, timeZone);
    if (
      formatted.year === y &&
      formatted.month === m &&
      formatted.day === d &&
      formatted.hour === hh &&
      formatted.minute === mm
    ) {
      if (!matches.some((existing) => existing.getTime() === candidate.getTime())) {
        matches.push(candidate);
      }
    }
  }

  matches.sort((a, b) => a.getTime() - b.getTime());
  if (matches.length === 0) return { status: 'nonexistent' };
  if (matches.length === 1) return { status: 'exact', utc: matches[0] };
  return { status: 'ambiguous', options: matches };
}

export function getDayUtcInterval(dateStr: string, timeZone: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const approxStart = Date.UTC(y, m - 1, d, 0, 0, 0);
  // Scan +-15 hours to find exact start and end of local civil day
  let start: Date | null = null;
  let end: Date | null = null;
  for (let min = -15 * 60; min <= 39 * 60; min += 15) {
    const instant = new Date(approxStart + min * 60_000);
    const f = formatInTimeZone(instant, timeZone);
    if (f.dateStr === dateStr) {
      if (!start) start = instant;
      end = new Date(instant.getTime() + 14 * 60_000 + 59_000);
    }
  }
  if (!start || !end) {
    return {
      start: new Date(approxStart),
      end: new Date(approxStart + 86_399_000),
    };
  }
  return { start, end };
}

export function getPhaseKey(angle: number): MoonPhaseInfo['phaseKey'] {
  const norm = normalizeDegrees(angle);
  if (norm < 22.5 || norm >= 337.5) return 'new_moon';
  if (norm < 67.5) return 'waxing_crescent';
  if (norm < 112.5) return 'first_quarter';
  if (norm < 157.5) return 'waxing_gibbous';
  if (norm < 202.5) return 'full_moon';
  if (norm < 247.5) return 'waning_gibbous';
  if (norm < 292.5) return 'last_quarter';
  return 'waning_crescent';
}

const moonPhaseCache = new Map<string, MoonPhaseInfo>();

export function calculateMoonPhaseForDate(localDateStr: string, timeZone: string): MoonPhaseInfo {
  const cacheKey = `v1:${localDateStr}:${timeZone}`;
  const cached = moonPhaseCache.get(cacheKey);
  if (cached) return cached;

  // Documented instant: local noon in the chosen timezone (falls back to 12:00 UTC if nonexistent)
  const resolved = resolveLocalCivilTime(localDateStr, '12:00', timeZone);
  const noonUtc =
    resolved.status === 'exact'
      ? resolved.utc
      : resolved.status === 'ambiguous'
        ? resolved.options[0]
        : new Date(`${localDateStr}T12:00:00Z`);

  const dayInterval = getDayUtcInterval(localDateStr, timeZone);
  const phaseAngle = Astronomy.MoonPhase(noonUtc);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, noonUtc);

  const nextNew = Astronomy.SearchMoonPhase(0, dayInterval.start, 40);
  const nextFull = Astronomy.SearchMoonPhase(180, dayInterval.start, 40);

  let sameDayEvent: 'new_moon' | 'full_moon' | undefined;
  if (nextNew && formatInTimeZone(nextNew.date, timeZone).dateStr === localDateStr) {
    sameDayEvent = 'new_moon';
  } else if (nextFull && formatInTimeZone(nextFull.date, timeZone).dateStr === localDateStr) {
    sameDayEvent = 'full_moon';
  }

  const info: MoonPhaseInfo = {
    date: localDateStr,
    timeZone,
    phaseAngle: Number(phaseAngle.toFixed(2)),
    illumination: Math.round(illum.phase_fraction * 100),
    phaseKey: getPhaseKey(phaseAngle),
    nextNewMoonUtc: nextNew ? nextNew.date.toISOString() : noonUtc.toISOString(),
    nextFullMoonUtc: nextFull ? nextFull.date.toISOString() : noonUtc.toISOString(),
    sameDayEvent,
  };

  moonPhaseCache.set(cacheKey, info);
  return info;
}

export function getMonthMoonEvents(
  year: number,
  monthIndex0: number,
  timeZone: string
): Array<{ dateStr: string; event: 'new_moon' | 'full_moon'; utcIso: string }> {
  const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const events: Array<{ dateStr: string; event: 'new_moon' | 'full_moon'; utcIso: string }> = [];
  const startSearch = new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0) - 24 * 3600_000);

  let cursor = startSearch;
  for (let i = 0; i < 3; i++) {
    const nm = Astronomy.SearchMoonPhase(0, cursor, 35);
    if (nm) {
      const f = formatInTimeZone(nm.date, timeZone);
      if (f.year === year && f.month === monthIndex0 + 1) {
        events.push({ dateStr: f.dateStr, event: 'new_moon', utcIso: nm.date.toISOString() });
      }
      cursor = new Date(nm.date.getTime() + 10 * 86400_000);
    }
  }

  cursor = startSearch;
  for (let i = 0; i < 3; i++) {
    const fm = Astronomy.SearchMoonPhase(180, cursor, 35);
    if (fm) {
      const f = formatInTimeZone(fm.date, timeZone);
      if (f.year === year && f.month === monthIndex0 + 1) {
        events.push({ dateStr: f.dateStr, event: 'full_moon', utcIso: fm.date.toISOString() });
      }
      cursor = new Date(fm.date.getTime() + 10 * 86400_000);
    }
  }

  // Filter strictly inside valid days
  return events.filter((e) => Number(e.dateStr.slice(8, 10)) <= daysInMonth);
}

/**
 * Calculate apparent geocentric ecliptic longitude of the Sun in the tropical zodiac,
 * preserving uncertainty across date-only or approximate time intervals.
 */
export function calculateTropicalSun(input: BirthInput): FactPacket {
  const year = Number(input.date.slice(0, 4));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) {
    return {
      schemaVersion: 1,
      calculationKind: 'tropical_sun',
      status: 'unavailable',
      source: 'Astronomy Engine (apparent geocentric ecliptic longitude)',
      sourceVersion: '2.1.19',
      body: 'Sun',
      zodiacSystem: 'tropical',
      ayanamsa: 'none',
      precision: 'exact_instant',
      note: `Supported years are ${MIN_SUPPORTED_YEAR}–${MAX_SUPPORTED_YEAR}.`,
    };
  }

  if (input.timeKnown === 'exact' && input.time) {
    const resolved = resolveLocalCivilTime(input.date, input.time, input.timeZone);
    if (resolved.status === 'nonexistent') {
      return {
        schemaVersion: 1,
        calculationKind: 'tropical_sun',
        status: 'ambiguous',
        source: 'Astronomy Engine',
        sourceVersion: '2.1.19',
        body: 'Sun',
        zodiacSystem: 'tropical',
        ayanamsa: 'none',
        precision: 'exact_instant',
        note: 'Nonexistent local clock time (DST spring-forward gap). Please check the clock time or switch to approximate.',
      };
    }

    if (resolved.status === 'ambiguous' && !input.overlapResolution) {
      const candidates = Array.from(
        new Set(resolved.options.map((utc) => longitudeToSign(Astronomy.SunPosition(utc).elon).signId))
      );
      return {
        schemaVersion: 1,
        calculationKind: 'tropical_sun',
        status: 'ambiguous',
        source: 'Astronomy Engine',
        sourceVersion: '2.1.19',
        body: 'Sun',
        zodiacSystem: 'tropical',
        ayanamsa: 'none',
        precision: 'exact_instant',
        utcInterval: {
          start: resolved.options[0].toISOString(),
          end: resolved.options[resolved.options.length - 1].toISOString(),
        },
        candidateSignIds: candidates,
        note: 'Clock change overlap: this local time occurred twice. Choose earlier or later UTC offset.',
      };
    }

    const utc =
      resolved.status === 'exact'
        ? resolved.utc
        : input.overlapResolution === 'later'
          ? resolved.options[resolved.options.length - 1]
          : resolved.options[0];

    const pos = Astronomy.SunPosition(utc);
    const { signId, degreeInSign } = longitudeToSign(pos.elon);
    return {
      schemaVersion: 1,
      calculationKind: 'tropical_sun',
      status: 'calculated',
      source: 'Astronomy Engine (apparent geocentric ecliptic longitude)',
      sourceVersion: '2.1.19',
      body: 'Sun',
      zodiacSystem: 'tropical',
      ayanamsa: 'none',
      precision: 'exact_instant',
      utcInstant: utc.toISOString(),
      signId,
      degrees: degreeInSign,
    };
  }

  // Date-only or approximate window interval
  const dayInterval = getDayUtcInterval(input.date, input.timeZone);
  let start = dayInterval.start;
  let end = dayInterval.end;

  if (input.timeKnown === 'approximate' && input.approximateWindow) {
    const windowHours: Record<string, [string, string]> = {
      morning: ['05:00', '11:59'],
      afternoon: ['12:00', '16:59'],
      evening: ['17:00', '20:59'],
      night: ['21:00', '23:59'],
    };
    const [sTime, eTime] = windowHours[input.approximateWindow] || ['00:00', '23:59'];
    const rStart = resolveLocalCivilTime(input.date, sTime, input.timeZone);
    const rEnd = resolveLocalCivilTime(input.date, eTime, input.timeZone);
    if (rStart.status === 'exact') start = rStart.utc;
    if (rEnd.status === 'exact') end = rEnd.utc;
  }

  const startPos = longitudeToSign(Astronomy.SunPosition(start).elon);
  const endPos = longitudeToSign(Astronomy.SunPosition(end).elon);

  if (startPos.signId === endPos.signId) {
    return {
      schemaVersion: 1,
      calculationKind: 'tropical_sun',
      status: 'calculated',
      source: 'Astronomy Engine (interval boundary verification)',
      sourceVersion: '2.1.19',
      body: 'Sun',
      zodiacSystem: 'tropical',
      ayanamsa: 'none',
      precision: input.timeKnown === 'approximate' ? 'approximate_window' : 'date_only_verified',
      utcInterval: { start: start.toISOString(), end: end.toISOString() },
      signId: startPos.signId,
      note: 'Sun remained in the same tropical sign across the entire interval.',
    };
  }

  return {
    schemaVersion: 1,
    calculationKind: 'tropical_sun',
    status: 'ambiguous',
    source: 'Astronomy Engine (interval boundary verification)',
    sourceVersion: '2.1.19',
    body: 'Sun',
    zodiacSystem: 'tropical',
    ayanamsa: 'none',
    precision: input.timeKnown === 'approximate' ? 'approximate_window' : 'date_only_verified',
    utcInterval: { start: start.toISOString(), end: end.toISOString() },
    candidateSignIds: [startPos.signId, endPos.signId],
    note: 'A solar ingress occurred during this interval; exact birth time matters.',
  };
}
