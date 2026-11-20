export type AppLanguage = 'en' | 'bn' | 'hi' | 'hinglish';
export type ThemeMode = 'paper' | 'ink' | 'system';
export type TextSize = 'normal' | 'large';
export type TabId = 'today' | 'zodiac' | 'almanac' | 'box';
export type CreateMode = 'letter' | 'card';

export type SignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type RecipientCategory =
  | 'ex'
  | 'mother'
  | 'father'
  | 'friend'
  | 'lost'
  | 'pastSelf'
  | 'futureSelf'
  | 'presentSelf'
  | 'custom';

export type PaperStyleId =
  | 'oldParchment'
  | 'midnightBlue'
  | 'rosePetal'
  | 'rainGlass'
  | 'tornNotebook'
  | 'moonlitInk';

export type ReleaseVisual = 'ash' | 'embers' | 'paperBirds';

export type CalculationStatus = 'calculated' | 'ambiguous' | 'unavailable' | 'manually_selected';

export interface FactPacket {
  schemaVersion: 1;
  calculationKind: 'tropical_sun' | 'vedic_moon' | 'manual_lens' | 'lunar_phase';
  status: CalculationStatus;
  source: string;
  sourceVersion: string;
  body: 'Sun' | 'Moon';
  zodiacSystem: 'tropical' | 'sidereal_lahiri' | 'editorial';
  ayanamsa?: 'Lahiri' | 'none';
  precision: 'exact_instant' | 'date_only_verified' | 'approximate_window' | 'manual' | 'local_noon';
  utcInstant?: string;
  utcInterval?: { start: string; end: string };
  signId?: SignId;
  candidateSignIds?: SignId[];
  degrees?: number;
  note?: string;
}

export interface CityEntry {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timeZone: string;
}

export interface BirthInput {
  date: string; // YYYY-MM-DD
  timeKnown: 'exact' | 'approximate' | 'unknown';
  time?: string; // HH:mm
  approximateWindow?: 'morning' | 'afternoon' | 'evening' | 'night';
  cityId?: string;
  customLat?: number;
  customLon?: number;
  timeZone: string;
  overlapResolution?: 'earlier' | 'later';
}

export interface LetterRecord {
  id: string;
  kind: 'letter';
  recipientCategory: RecipientCategory;
  recipientLabel: string;
  salutation: string;
  contextPrompt?: string;
  body: string;
  paper: PaperStyleId;
  sealed: boolean;
  sealedAt?: string;
  favorite: boolean;
  linkedAlmanacDate?: string;
  signLens?: SignId;
  createdAt: string;
  updatedAt: string;
  revision: number;
  syncStatus: 'local' | 'pending_sync' | 'backed_up' | 'pending_delete' | 'conflicted';
}

export interface FeelingCardRecord {
  id: string;
  kind: 'card';
  text: string;
  moodLabel?: string;
  style: PaperStyleId;
  signId?: SignId;
  showWatermark: boolean;
  showRecipient: boolean;
  recipientLabel?: string;
  favorite: boolean;
  linkedAlmanacDate?: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  syncStatus: 'local' | 'pending_sync' | 'backed_up' | 'pending_delete' | 'conflicted';
}

export interface AlmanacCheckIn {
  date: string; // YYYY-MM-DD
  moodLabel: string;
  note: string;
  updatedAt: string;
}

export interface ZodiacProfile {
  chosenLens?: SignId;
  tropicalSunPacket?: FactPacket;
  vedicMoonPacket?: FactPacket;
}

export interface UserPreferences {
  language: AppLanguage;
  theme: ThemeMode;
  textSize: TextSize;
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  timeZone: string;
  demoDismissed: boolean;
  welcomeDismissed: boolean;
  aiConsent: boolean;
  cloudOptIn: boolean;
  zodiacProfile: ZodiacProfile;
}

export interface MoonPhaseInfo {
  date: string;
  timeZone: string;
  phaseAngle: number;
  illumination: number;
  phaseKey:
    | 'new_moon'
    | 'waxing_crescent'
    | 'first_quarter'
    | 'waxing_gibbous'
    | 'full_moon'
    | 'waning_gibbous'
    | 'last_quarter'
    | 'waning_crescent';
  nextNewMoonUtc: string;
  nextFullMoonUtc: string;
  sameDayEvent?: 'new_moon' | 'full_moon';
}
