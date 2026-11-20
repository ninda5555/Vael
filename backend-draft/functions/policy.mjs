export const support = Object.freeze({kind: 'support'});
const expressions = [
  /kill myself|end my life|want to die|suicid|self[- ]?harm|no (?:reason|point) to live|hurt myself/i,
  /আত্মহত্যা|বাঁচতে চাই না|বাঁচতে ইচ্ছে করে না|মরে যেতে চাই|নিজেকে শেষ/,
  /आत्महत्या|जीना नहीं|जीने का मन नहीं|मरना चाह|खुदकुशी|ख़ुदकुशी/,
  /jeena nahi|marna (?:chahta|chahti)|khudkushi|more jete chai|bachte chai na/i
];
export function needsSupport(text) { return expressions.some(pattern => pattern.test(text)); }

export function validRequest(data) {
  return data && Object.keys(data).every(k => ['text', 'mode', 'language', 'consent'].includes(k))
    && data.consent === true && ['reflection', 'poem'].includes(data.mode)
    && ['en', 'bn', 'hi', 'hinglish'].includes(data.language)
    && typeof data.text === 'string' && data.text.trim().length > 0 && data.text.length <= 6000;
}

export function interpretResponse(result) {
  const candidate = result?.candidates?.[0];
  if (result?.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') return support;
  if (candidate?.finishReason !== 'STOP') throw new Error('Incomplete generation');
  const parts = candidate.content?.parts || [];
  const parsed = JSON.parse(parts.filter(p => !p.thought).map(p => p.text || '').join(''));
  if (parsed.kind === 'support') return support;
  if (parsed.kind !== 'creative' || typeof parsed.text !== 'string' || !parsed.text.trim()
      || parsed.text.length > 1500) throw new Error('Invalid generation');
  return needsSupport(parsed.text) ? support : {kind: 'creative', text: parsed.text.trim()};
}
