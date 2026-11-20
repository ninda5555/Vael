import type { AppLanguage } from './types.ts';

export const supportResult = Object.freeze({ kind: 'support' as const });

// Language-aware patterns mirrored from backend-draft/functions/policy.mjs
const distressPatterns: RegExp[] = [
  /kill myself|end my life|want to die|suicid|self[- ]?harm|no (?:reason|point) to live|hurt myself/i,
  /আত্মহত্যা|বাঁচতে চাই না|বাঁচতে ইচ্ছে করে না|মরে যেতে চাই|নিজেকে শেষ/,
  /आत्महत्या|जीना नहीं|जीने का मन नहीं|मरना चाह|खुदकुशी|ख़ुदकुशी/,
  /jeena nahi|marna (?:chahta|chahti)|khudkushi|more jete chai|bachte chai na/i,
];

// Benign figurative expressions that should not trigger false crisis suppression
const benignIdioms: RegExp[] = [
  /dying of laughter|dying to see|dead tired|killing time|heart is breaking/i,
  /হেসে মরে যাচ্ছি|মজা করে বলছি/,
];

export function needsSupport(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  if (benignIdioms.some((p) => p.test(normalized)) && !distressPatterns.some((p) => p.test(normalized))) {
    return false;
  }
  return distressPatterns.some((pattern) => pattern.test(normalized));
}

export interface ReflectRequestPayload {
  text: string;
  mode: 'reflection' | 'poem' | 'sign_question';
  language: AppLanguage;
  consent: boolean;
  requestId?: string;
}

export function validReflectRequest(data: unknown): data is ReflectRequestPayload {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  const allowedKeys = ['text', 'mode', 'language', 'consent', 'requestId'];
  if (!Object.keys(record).every((k) => allowedKeys.includes(k))) return false;
  if (record.consent !== true) return false;
  if (!['reflection', 'poem', 'sign_question'].includes(String(record.mode))) return false;
  if (!['en', 'bn', 'hi', 'hinglish'].includes(String(record.language))) return false;
  if (typeof record.text !== 'string') return false;
  const trimmed = record.text.trim();
  return trimmed.length > 0 && record.text.length <= 6000;
}

export function validateCreativeResponse(parsed: unknown): { kind: 'support' } | { kind: 'creative'; text: string } {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid generation payload');
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.kind === 'support') return supportResult;
  if (obj.kind !== 'creative' || typeof obj.text !== 'string') {
    throw new Error('Invalid generation schema');
  }
  const trimmed = obj.text.trim();
  if (!trimmed || trimmed.length > 1500) {
    throw new Error('Generation length out of bounds');
  }
  if (needsSupport(trimmed)) return supportResult;
  return { kind: 'creative', text: trimmed };
}

export interface SupportResource {
  id: string;
  region: string;
  name: string;
  contact: string;
  hours: string;
  source: string;
  verifiedDate: string;
}

export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    id: 'tele-manas',
    region: 'India (National · 20+ languages including Bengali & Hindi)',
    name: 'Tele-MANAS (Ministry of Health & Family Welfare)',
    contact: '14416 or 1800-891-4416',
    hours: '24×7 Toll-Free',
    source: 'https://telemanas.mohfw.gov.in/',
    verifiedDate: '2026-03-01',
  },
  {
    id: 'kiran',
    region: 'India (National)',
    name: 'Kiran Mental Health Helpline (DEPwD)',
    contact: '1800-599-0019',
    hours: '24×7 Toll-Free',
    source: 'https://depwd.gov.in/',
    verifiedDate: '2026-03-01',
  },
  {
    id: 'icall',
    region: 'India (TISS Psychosocial Helpline)',
    name: 'iCall (Tata Institute of Social Sciences)',
    contact: '9152987821',
    hours: 'Mon–Sat, 10:00–20:00 IST',
    source: 'https://icallhelpline.org/',
    verifiedDate: '2026-03-01',
  },
];
