import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bird,
  Check,
  Copy,
  Flame,
  Mic,
  MicOff,
  Palette,
  Sparkles,
  Stamp,
  Trash2,
  Wind,
} from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import { RECIPIENT_CATEGORIES } from '../../shared/letterPrompts.ts';
import { needsSupport } from '../../shared/policy.ts';
import type {
  AppLanguage,
  LetterRecord,
  PaperStyleId,
  RecipientCategory,
  ReleaseVisual,
} from '../../shared/types.ts';
import { triggerHaptic } from '../lib/motion.ts';
import { PAPER_SPECS } from '../lib/pngExport.ts';
import { BottomSheet } from './BottomSheet.tsx';

interface LetterEditorProps {
  letter: LetterRecord;
  language: AppLanguage;
  strings: TranslationStrings;
  aiConsent: boolean;
  hapticsEnabled: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onChange: (updated: LetterRecord) => void;
  onRetrySave: () => void;
  onBack: () => void;
  onKeepInBox: (letter: LetterRecord) => void;
  onReleaseConfirm: (id: string, visual: ReleaseVisual) => Promise<void>;
  onTurnIntoCard: (letter: LetterRecord) => void;
  onOpenSupport: () => void;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const PAPER_ORDER: PaperStyleId[] = [
  'oldParchment',
  'midnightBlue',
  'rosePetal',
  'rainGlass',
  'tornNotebook',
  'moonlitInk',
];

export const LetterEditor: React.FC<LetterEditorProps> = ({
  letter,
  language,
  strings,
  aiConsent,
  hapticsEnabled,
  saveStatus,
  onChange,
  onRetrySave,
  onBack,
  onKeepInBox,
  onReleaseConfirm,
  onTurnIntoCard,
  onOpenSupport,
}) => {
  const [showRecipientSheet, setShowRecipientSheet] = useState(false);
  const [showPaperSheet, setShowPaperSheet] = useState(false);
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const [showDictateDisclosure, setShowDictateDisclosure] = useState(false);
  const [listening, setListening] = useState(false);
  const [dictateError, setDictateError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const [pendingAiMode, setPendingAiMode] = useState<'reflection' | 'poem' | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseVisual, setReleaseVisual] = useState<ReleaseVisual>('paperBirds');
  const [releasing, setReleasing] = useState(false);
  const [releaseAnimating, setReleaseAnimating] = useState<'paperBirds' | 'ash' | 'embers' | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [copiedBanner, setCopiedBanner] = useState(false);
  const sealLockRef = useRef(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const recipientDef =
    RECIPIENT_CATEGORIES.find((r) => r.category === letter.recipientCategory) ?? RECIPIENT_CATEGORIES[0];
  const prompts = recipientDef.prompts[language];
  const currentPrompt = prompts[promptIndex % prompts.length];
  const paperSpec = PAPER_SPECS[letter.paper];
  const hasBody = letter.body.trim().length > 0;
  const wordCount = hasBody ? letter.body.trim().split(/\s+/).length : 0;
  const excerptSample =
    letter.body.trim().slice(0, 72) || (language === 'bn' ? 'একটি না পাঠানো কথা…' : 'What you meant to say…');

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSelectRecipient = (category: RecipientCategory) => {
    const def = RECIPIENT_CATEGORIES.find((r) => r.category === category) ?? RECIPIENT_CATEGORIES[0];
    onChange({
      ...letter,
      recipientCategory: category,
      recipientLabel: category === 'custom' ? letter.recipientLabel : strings.recipients[category],
      salutation: def.defaultSalutation[language],
      updatedAt: new Date().toISOString(),
    });
    setPromptIndex(0);
    if (category !== 'custom') setShowRecipientSheet(false);
  };

  const startVoiceDictation = () => {
    setDictateError(null);
    const win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) {
      setDictateError(strings.editor.dictateUnsupported);
      setShowDictateDisclosure(false);
      return;
    }

    try {
      const rec = new Rec();
      rec.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const transcript = last?.[0]?.transcript?.trim();
        if (transcript) {
          onChange({
            ...letter,
            body: letter.body ? `${letter.body.trimEnd()} ${transcript}` : transcript,
            updatedAt: new Date().toISOString(),
          });
        }
      };
      rec.onerror = () => {
        setListening(false);
        setDictateError(strings.editor.dictateUnsupported);
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      rec.start();
      setListening(true);
      setShowDictateDisclosure(false);
    } catch {
      setListening(false);
      setDictateError(strings.editor.dictateUnsupported);
      setShowDictateDisclosure(false);
    }
  };

  const executeAiAction = async (mode: 'reflection' | 'poem') => {
    setAiError(null);
    const passage = letter.body.trim().slice(0, 5500);
    if (!passage) return;
    if (needsSupport(passage)) {
      setPendingAiMode(null);
      onOpenSupport();
      return;
    }

    setAiLoading(true);
    try {
      const resp = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: passage,
          mode,
          language,
          consent: true,
        }),
      });
      const data = (await resp.json()) as { kind?: string; text?: string; error?: string };
      if (!resp.ok) {
        setAiError(data.error || 'Reflection unavailable right now.');
      } else if (data.kind === 'support') {
        onOpenSupport();
      } else if (data.text) {
        setAiResult(data.text);
      }
    } catch {
      setAiError('Unable to reach server right now. Your letter stays saved on this device.');
    } finally {
      setAiLoading(false);
      setPendingAiMode(null);
    }
  };

  useEffect(() => {
    sealLockRef.current = letter.sealed;
  }, [letter.sealed, letter.id]);

  const handleSeal = () => {
    if (!hasBody || letter.sealed || sealLockRef.current) return;
    sealLockRef.current = true;
    triggerHaptic('success', hapticsEnabled);
    setLiveAnnouncement(strings.editor.sealedAnnounce);
    onChange({
      ...letter,
      sealed: true,
      sealedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUnseal = () => {
    sealLockRef.current = false;
    onChange({
      ...letter,
      sealed: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleConfirmRelease = async () => {
    setReleasing(true);
    setReleaseAnimating(releaseVisual);
    await new Promise((r) => setTimeout(r, releaseVisual === 'paperBirds' ? 460 : 380));
    try {
      await onReleaseConfirm(letter.id, releaseVisual);
    } finally {
      setReleasing(false);
      setReleaseAnimating(null);
      setShowReleaseModal(false);
    }
  };

  const handleCopyFallback = async () => {
    try {
      await navigator.clipboard.writeText(`${letter.salutation}\n\n${letter.body}`);
      setCopiedBanner(true);
      setTimeout(() => setCopiedBanner(false), 2000);
    } catch {
      // Ignore clipboard denials
    }
  };

  return (
    <section className="max-w-[720px] mx-auto space-y-4">
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>

      {/* Compact Top Writer Row */}
      <div className="flex items-center justify-between gap-3 h-12 border-b border-[#DADADD] dark:border-[#363839] pb-2">
        <button
          type="button"
          onClick={onBack}
          className="pressable min-h-[44px] px-2 -ml-2 rounded-xl text-[15px] font-medium inline-flex items-center gap-1.5 text-[#19191B] dark:text-[#F3F1EC] hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{strings.editor.back}</span>
        </button>

        <div className="text-center">
          <div className="text-[15px] font-bold">{strings.editor.title}</div>
          <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1] tabular-nums">
            {saveStatus === 'saving'
              ? strings.editor.saving
              : saveStatus === 'error'
                ? strings.editor.saveErrorMessage
                : `${strings.editor.savedLocally} · ${wordCount} ${strings.editor.wordCount}`}
          </div>
        </div>

        {!letter.sealed ? (
          <button
            type="button"
            disabled={!hasBody}
            onClick={handleSeal}
            className="pressable min-h-[44px] px-3.5 rounded-[10px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-bold disabled:opacity-35 whitespace-nowrap"
          >
            {strings.editor.sealAction}
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Local Save Error Recovery */}
      {saveStatus === 'error' && (
        <div className="rounded-[16px] border border-[#A63A32]/40 bg-[#FFFFFF] dark:bg-[#1D1F20] p-3.5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
          <span>{strings.editor.saveErrorMessage}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetrySave}
              className="min-h-[38px] px-3 rounded-lg bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-xs font-medium"
            >
              {strings.editor.tryAgain}
            </button>
            <button
              type="button"
              onClick={handleCopyFallback}
              className="min-h-[38px] px-3 rounded-lg border border-[#DADADD] dark:border-[#363839] text-xs inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedBanner ? 'Copied' : strings.editor.copyText}
            </button>
          </div>
        </div>
      )}

      {/* Editable To Row + Paper Selector Row */}
      {!letter.sealed && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowRecipientSheet(true)}
            className="pressable min-h-[44px] px-3.5 py-2 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[14px] inline-flex items-center gap-2"
          >
            <span className="text-[#59595F] dark:text-[#B3B4B1]">{strings.editor.toLabel}:</span>
            <span className="font-medium">{letter.recipientLabel || strings.recipients.custom}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPaperSheet(true)}
              className="pressable min-h-[44px] px-3.5 py-2 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[14px] inline-flex items-center gap-1.5"
            >
              <Palette className="w-4 h-4" />
              <span>{strings.papers[letter.paper]}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPromptBox((v) => !v)}
              className="min-h-[44px] px-3 rounded-[12px] text-[13px] text-[#59595F] dark:text-[#B3B4B1] hover:underline"
            >
              {strings.editor.needStartingLine}
            </button>
          </div>
        </div>
      )}

      {/* Optional Starting Line Box or External Context Prompt */}
      {letter.contextPrompt && !letter.sealed && (
        <div className="rounded-[14px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] px-4 py-3 text-[14px] text-[#59595F] dark:text-[#B3B4B1]">
          {letter.contextPrompt}
        </div>
      )}

      {showPromptBox && !letter.sealed && (
        <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-4 flex items-center justify-between gap-4">
          <p className="text-[15px] leading-[22px]">{currentPrompt}</p>
          <button
            type="button"
            onClick={() => setPromptIndex((i) => (i + 1) % prompts.length)}
            className="min-h-[40px] px-3 rounded-lg border border-[#DADADD] dark:border-[#363839] text-xs font-medium shrink-0"
          >
            Next
          </button>
        </div>
      )}

      {/* Tactile Paper Writing / Sealed Surface */}
      <div
        style={{
          backgroundColor: paperSpec.bg,
          color: paperSpec.ink,
          borderColor: paperSpec.border,
        }}
        className={`relative rounded-[22px] border p-6 sm:p-9 min-h-[380px] flex flex-col justify-between transition-all duration-150 ${
          releaseAnimating === 'paperBirds'
            ? 'animate-release-bird'
            : releaseAnimating
              ? 'opacity-40 scale-[0.98]'
              : ''
        }`}
      >
        {/* Subtle folded corner lift during paper-bird release */}
        {releaseAnimating === 'paperBirds' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 w-10 h-10 bg-black/10 rounded-bl-[12px] transition-transform duration-300 -translate-y-1 translate-x-1"
          />
        )}
        {letter.sealed && (
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
            <div
              style={{ color: '#A63A32', borderColor: '#A63A32' }}
              className="animate-stamp inline-flex items-center gap-2 border-2 px-3 py-1 rounded-[8px] text-[12px] font-extrabold tracking-wider"
            >
              <Stamp className="w-4 h-4" />
              <span>{strings.editor.sealedBadge}</span>
              {letter.sealedAt && (
                <span className="tabular-nums opacity-85">
                  · {new Date(letter.sealedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleUnseal}
              className="text-[13px] underline opacity-80 hover:opacity-100"
            >
              {strings.editor.unsealToEdit}
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col space-y-4">
          <input
            type="text"
            disabled={letter.sealed}
            value={letter.salutation}
            onChange={(e) =>
              onChange({
                ...letter,
                salutation: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            aria-label={strings.editor.salutationLabel}
            className="font-letter text-[24px] sm:text-[28px] leading-snug bg-transparent border-b border-current/15 pb-2 focus:outline-none focus:border-current/45"
          />

          <textarea
            ref={bodyTextareaRef}
            rows={12}
            disabled={letter.sealed}
            value={letter.body}
            onFocus={() => {
              setTimeout(() => {
                bodyTextareaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }, 80);
            }}
            onChange={(e) =>
              onChange({
                ...letter,
                body: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            placeholder={strings.editor.bodyPlaceholder}
            className="font-letter w-full flex-1 bg-transparent resize-y text-[19px] sm:text-[21px] leading-[1.65] focus:outline-none placeholder:opacity-45 scroll-mb-24"
          />
        </div>
      </div>

      {/* Sealed Actions vs Open Editor Secondary Actions */}
      {letter.sealed ? (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onKeepInBox(letter)}
              className="pressable min-h-[48px] px-5 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-bold"
            >
              {strings.editor.keepInBox}
            </button>

            <button
              type="button"
              onClick={() => onTurnIntoCard(letter)}
              className="pressable min-h-[48px] px-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[15px] font-medium"
            >
              {strings.editor.shareEllipsis}
            </button>

            <button
              type="button"
              onClick={() => setShowReleaseModal(true)}
              className="min-h-[48px] px-4 rounded-[12px] text-[#A63A32] dark:text-[#E07A73] text-[15px] font-medium ml-auto inline-flex items-center gap-1.5 hover:bg-[#A63A32]/10"
            >
              <Trash2 className="w-4 h-4" />
              {strings.editor.letItGo}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {!listening ? (
              <button
                type="button"
                onClick={() => setShowDictateDisclosure(true)}
                className="min-h-[44px] px-3.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] text-[13px] font-medium inline-flex items-center gap-1.5"
              >
                <Mic className="w-4 h-4" />
                {strings.editor.dictateAction}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  recognitionRef.current?.stop();
                  setListening(false);
                }}
                className="min-h-[44px] px-3.5 rounded-[10px] bg-[#A63A32] text-white text-[13px] font-medium inline-flex items-center gap-1.5"
              >
                <MicOff className="w-4 h-4" />
                {strings.editor.dictateStop}
              </button>
            )}

            {aiConsent && (
              <>
                <button
                  type="button"
                  disabled={!hasBody || aiLoading}
                  onClick={() => setPendingAiMode('reflection')}
                  className="min-h-[44px] px-3.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  {strings.editor.hearReflection}
                </button>
                <button
                  type="button"
                  disabled={!hasBody || aiLoading}
                  onClick={() => setPendingAiMode('poem')}
                  className="min-h-[44px] px-3.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] text-[13px] font-medium disabled:opacity-40"
                >
                  {strings.editor.turnToPoem}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowReleaseModal(true)}
            className="min-h-[44px] px-3 rounded-[10px] text-[13px] text-[#59595F] dark:text-[#B3B4B1] hover:text-[#A63A32]"
          >
            {strings.editor.letItGo}
          </button>
        </div>
      )}

      {dictateError && <p className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{dictateError}</p>}
      {aiError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{aiError}</p>}
      {aiResult && (
        <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-4 text-[15px] leading-[24px] whitespace-pre-line">
          {aiResult}
        </div>
      )}

      {/* Recipient Bottom Sheet */}
      <BottomSheet
        open={showRecipientSheet}
        onClose={() => setShowRecipientSheet(false)}
        title={strings.editor.toLabel}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {RECIPIENT_CATEGORIES.map((r) => {
              const selected = letter.recipientCategory === r.category;
              return (
                <button
                  key={r.category}
                  type="button"
                  onClick={() => handleSelectRecipient(r.category)}
                  className={`min-h-[44px] px-3.5 py-2.5 rounded-[12px] border text-left text-[14px] font-medium flex items-center justify-between ${
                    selected
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  <span>{strings.recipients[r.category]}</span>
                  {selected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {letter.recipientCategory === 'custom' && (
            <div className="space-y-2 pt-2 border-t border-[#DADADD] dark:border-[#363839]">
              <input
                type="text"
                value={letter.recipientLabel}
                onChange={(e) =>
                  onChange({
                    ...letter,
                    recipientLabel: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder={strings.editor.customRecipientPlaceholder}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowRecipientSheet(false)}
                className="w-full min-h-[44px] rounded-[12px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Tactile Paper Bottom Sheet with Actual Excerpt Comparison */}
      <BottomSheet
        open={showPaperSheet}
        onClose={() => setShowPaperSheet(false)}
        title={strings.editor.paperLabel}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={strings.editor.paperLabel}>
          {PAPER_ORDER.map((paperId) => {
            const spec = PAPER_SPECS[paperId];
            const selected = letter.paper === paperId;
            return (
              <button
                key={paperId}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  triggerHaptic('selection', hapticsEnabled);
                  onChange({
                    ...letter,
                    paper: paperId,
                    updatedAt: new Date().toISOString(),
                  });
                }}
                style={{ backgroundColor: spec.bg, color: spec.ink, borderColor: spec.border }}
                className={`rounded-[16px] border p-4 text-left space-y-2 transition-opacity ${
                  selected ? 'ring-2 ring-[#19191B] dark:ring-[#EEEAE2]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[13px] font-semibold">
                  <span>{strings.papers[paperId]}</span>
                  {selected && <Check className="w-4 h-4 shrink-0" />}
                </div>
                <p className="font-letter text-[16px] leading-snug opacity-90 line-clamp-2">
                  {excerptSample}
                </p>
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Gemini Explicit Passage Confirmation Sheet */}
      <BottomSheet
        open={pendingAiMode !== null}
        onClose={() => setPendingAiMode(null)}
        title={strings.editor.aiSendConfirmTitle}
      >
        <div className="space-y-4">
          <div className="rounded-[14px] bg-[#F3F3F5] dark:bg-[#151617] p-4 text-[14px] leading-[22px] max-h-48 overflow-y-auto whitespace-pre-line">
            {letter.body.trim()}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingAiMode(null)}
              className="min-h-[44px] px-4 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[14px] font-medium"
            >
              {strings.editor.aiCancel}
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => pendingAiMode && executeAiAction(pendingAiMode)}
              className="min-h-[44px] px-4 rounded-[10px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-medium"
            >
              {aiLoading ? '…' : strings.editor.aiSendConfirmCta}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Microphone Disclosure Sheet */}
      <BottomSheet
        open={showDictateDisclosure}
        onClose={() => setShowDictateDisclosure(false)}
        title={strings.editor.dictateDisclosureTitle}
      >
        <div className="space-y-4">
          <p className="text-[15px] leading-[22px] text-[#59595F] dark:text-[#B3B4B1]">
            {strings.editor.dictateDisclosureBody}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDictateDisclosure(false)}
              className="min-h-[44px] px-4 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[14px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={startVoiceDictation}
              className="min-h-[44px] px-4 rounded-[10px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-medium"
            >
              {strings.editor.dictateAccept}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Release Confirmation Sheet */}
      <BottomSheet
        open={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
        title={strings.editor.releaseModalTitle}
      >
        <div className="space-y-4">
          <p className="text-[14px] leading-[20px] text-[#59595F] dark:text-[#B3B4B1]">
            {strings.editor.releaseLocalScope}
          </p>

          <div className="space-y-2">
            <div className="text-[13px] font-medium">{strings.editor.releaseChooseVisual}</div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['ash', strings.editor.releaseVisuals.ash, Wind],
                  ['embers', strings.editor.releaseVisuals.embers, Flame],
                  ['paperBirds', strings.editor.releaseVisuals.paperBirds, Bird],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReleaseVisual(key)}
                  className={`min-h-[56px] p-2 rounded-[12px] border text-[12px] flex flex-col items-center justify-center gap-1 ${
                    releaseVisual === key
                      ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent font-medium'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReleaseModal(false)}
              className="min-h-[44px] px-4 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[14px] font-medium"
            >
              {strings.editor.releaseKeepLetter}
            </button>
            <button
              type="button"
              disabled={releasing}
              onClick={handleConfirmRelease}
              className="min-h-[44px] px-4 rounded-[10px] bg-[#A63A32] text-white text-[14px] font-medium"
            >
              {releasing ? '…' : strings.editor.releaseRemoveLetter}
            </button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
};
