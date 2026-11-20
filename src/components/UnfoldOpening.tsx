import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import { prefersReducedMotion } from '../lib/motion.ts';
import {
  CroppedEnvelopeSilhouette,
  FoldedPaperCheckInMark,
  UnsentBrandScene,
} from './MonochromeMarks.tsx';

interface UnfoldOverlayProps {
  active: boolean;
  reducedMotion: boolean;
  onComplete: () => void;
}

/**
 * Signature opening "Unfold":
 * Renders over the already-mounted interactive Today screen with pointer-events-none,
 * aria-hidden="true", and finishes within 720ms (or skips completely on reduced motion/warm resume).
 */
export const UnfoldOverlay: React.FC<UnfoldOverlayProps> = ({ active, reducedMotion, onComplete }) => {
  const [phase, setPhase] = useState<'fold' | 'flap' | 'expand' | 'done'>('fold');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active || prefersReducedMotion(reducedMotion)) {
      if (active) onCompleteRef.current();
      return;
    }
    setPhase('fold');
    const t1 = setTimeout(() => setPhase('flap'), 160);
    const t2 = setTimeout(() => setPhase('expand'), 420);
    const t3 = setTimeout(() => {
      setPhase('done');
      onCompleteRef.current();
    }, 720);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, reducedMotion]);

  if (!active || phase === 'done' || prefersReducedMotion(reducedMotion)) return null;

  return (
    <div
      data-unfold-overlay="true"
      aria-hidden="true"
      className={`fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center px-6 bg-[#F3F3F5] dark:bg-[#151617] text-[#19191B] dark:text-[#F3F1EC] transition-all duration-300 ${
        phase === 'expand' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <UnsentBrandScene
        flapOpen={phase !== 'fold'}
        animated={true}
        className={`transition-transform duration-300 ${
          phase === 'fold' ? 'scale-95' : 'scale-100'
        }`}
      />
    </div>
  );
};

interface WelcomeViewProps {
  open: boolean;
  strings: TranslationStrings;
  onStartWriting: () => void;
  onReplayOpening: () => void;
  onClose: () => void;
}

/**
 * Dismissible Welcome view modeled on the Stoic silhouette composition,
 * accessible from Settings without ever gating daily writing.
 */
export const WelcomeModal: React.FC<WelcomeViewProps> = ({
  open,
  strings,
  onStartWriting,
  onReplayOpening,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F3F3F5] dark:bg-[#151617] text-[#19191B] dark:text-[#F3F1EC] flex flex-col justify-between p-6 pt-safe pb-safe"
      role="dialog"
      aria-modal="true"
      aria-label={strings.welcome.headline}
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full flex flex-col items-center text-center space-y-6">
        <div className="rounded-[24px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] px-6 py-7 w-full flex flex-col items-center space-y-5 shadow-sm">
          <UnsentBrandScene showMark={false} flapOpen={true} animated={!prefersReducedMotion(false)} />
          <CroppedEnvelopeSilhouette className="w-36 text-[#19191B] dark:text-[#EEEAE2] opacity-90" />
        </div>
        <h1 className="text-[28px] leading-[34px] font-bold tracking-tight [text-wrap:balance]">
          {strings.welcome.headline}
        </h1>
      </div>

      <div className="max-w-md mx-auto w-full space-y-3 pb-4">
        <button
          type="button"
          onClick={onStartWriting}
          className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[16px] font-bold"
        >
          {strings.welcome.startWriting}
        </button>
        <button
          type="button"
          onClick={onReplayOpening}
          className="w-full min-h-[44px] rounded-[12px] text-[14px] font-semibold text-[#59595F] dark:text-[#B3B4B1] hover:underline"
        >
          {strings.welcome.replayOpening}
        </button>
      </div>
    </div>
  );
};

interface MoodCheckInModalProps {
  open: boolean;
  dateStr: string;
  initialMood?: string;
  initialNote?: string;
  strings: TranslationStrings;
  onSave: (mood: string, note: string) => void;
  onClose: () => void;
}

/**
 * Stoic-inspired single-task check-in flow:
 * Monochrome illustration above "How are you feeling?", 5-position control near thumb,
 * explicit Save, Back preserves selection between steps, Close exits without submitting.
 */
export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  open,
  dateStr,
  initialMood,
  initialNote = '',
  strings,
  onSave,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const idx = initialMood ? strings.checkIn.choices.indexOf(initialMood) : 2;
    return idx >= 0 ? idx : 2;
  });
  const [note, setNote] = useState(initialNote);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F3F3F5] dark:bg-[#151617] text-[#19191B] dark:text-[#F3F1EC] flex flex-col justify-between p-5 pt-safe pb-safe"
      role="dialog"
      aria-modal="true"
      aria-label={strings.checkIn.question}
    >
      {/* Top Bar with Back, real step progress, Close */}
      <div className="max-w-lg mx-auto w-full flex items-center justify-between h-14">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            aria-label={strings.checkIn.back}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11" />
        )}

        <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 2`}>
          <span className="w-6 h-1 rounded-full bg-[#19191B] dark:bg-[#EEEAE2]" />
          <span
            className={`w-6 h-1 rounded-full ${
              step === 2 ? 'bg-[#19191B] dark:bg-[#EEEAE2]' : 'bg-[#DADADD] dark:bg-[#363839]'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={strings.checkIn.close}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Single Question */}
      <div className="max-w-md mx-auto w-full flex flex-col items-center text-center space-y-6">
        <FoldedPaperCheckInMark className="text-[#19191B] dark:text-[#EEEAE2]" />
        <div className="space-y-1">
          <div className="text-[13px] text-[#59595F] dark:text-[#B3B4B1] tabular-nums">{dateStr}</div>
          <h2 className="text-[26px] leading-[32px] font-bold tracking-tight">
            {strings.checkIn.question}
          </h2>
        </div>

        {step === 1 ? (
          <div className="w-full space-y-5 pt-2">
            <div className="text-[20px] font-medium">
              {strings.checkIn.choices[selectedIndex]}
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              aria-label={strings.checkIn.question}
              className="w-full accent-[#19191B] dark:accent-[#EEEAE2] h-2 cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1">
              {strings.checkIn.choices.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`min-h-[44px] px-1 rounded-[10px] text-[12px] font-medium transition-colors ${
                    selectedIndex === idx
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C]'
                      : 'text-[#59595F] dark:text-[#B3B4B1] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3 text-left">
            <div className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">
              {strings.checkIn.choices[selectedIndex]}
            </div>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={strings.checkIn.notePlaceholder}
              className="w-full rounded-[16px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] p-4 text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-[#19191B] dark:focus:ring-[#EEEAE2]"
            />
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="max-w-md mx-auto w-full pb-4">
        {step === 1 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[16px] font-bold"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onSave(strings.checkIn.choices[selectedIndex], note.trim());
              onClose();
            }}
            className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[16px] font-bold"
          >
            {strings.checkIn.save}
          </button>
        )}
      </div>
    </div>
  );
};
