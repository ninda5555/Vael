import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Compass,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { formatInTimeZone } from '../../shared/astronomy.ts';
import type { TranslationStrings } from '../../shared/i18n.ts';
import type { AppLanguage, SignId, ZodiacProfile } from '../../shared/types.ts';
import {
  buildTwoSignCard,
  getDailyPromptIndex,
  getSignById,
  ZODIAC_SIGNS,
  type PairContext,
} from '../../shared/zodiacCatalog.ts';
import { getElementForSign } from '../three/sculptures.ts';
import { AstralCanvas3D } from './AstralCanvas3D.tsx';
import { ZodiacLineMark } from './MonochromeMarks.tsx';

interface ZodiacSectionProps {
  language: AppLanguage;
  strings: TranslationStrings;
  timeZone: string;
  zodiacProfile: ZodiacProfile;
  aiConsent: boolean;
  reducedMotion?: boolean;
  onUpdateProfile: (profile: ZodiacProfile) => void;
  onStartLetterFromSign: (signId: SignId, promptContext: string) => void;
  onMakeCardFromSign: (signId: SignId, text: string) => void;
  onOpenSupport: () => void;
  onOpenLensCalculator: () => void;
}

export const ZodiacSection: React.FC<ZodiacSectionProps> = ({
  language,
  strings,
  timeZone,
  zodiacProfile,
  aiConsent,
  reducedMotion = false,
  onUpdateProfile,
  onStartLetterFromSign,
  onMakeCardFromSign,
  onOpenSupport,
  onOpenLensCalculator,
}) => {
  const todayStr = useMemo(() => formatInTimeZone(new Date(), timeZone).dateStr, [timeZone]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zodiacMode, setZodiacMode] = useState<'wheel' | 'alchemy'>('wheel');
  const [wheelFocusSignId, setWheelFocusSignId] = useState<SignId>(zodiacProfile.chosenLens ?? 'pisces');
  const [detailSignId, setDetailSignId] = useState<SignId | null>(null);
  const [detailRotY, setDetailRotY] = useState(0);

  const openSignDetail = (signId: SignId) => {
    setDetailSignId(signId);
    setDetailRotY(0);
    window.scrollTo({ top: 0 });
  };

  const [sparkOffset, setSparkOffset] = useState<Record<string, number>>({});
  const [showHowFound, setShowHowFound] = useState(false);

  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [pairA, setPairA] = useState<SignId>('gemini');
  const [pairB, setPairB] = useState<SignId>('pisces');
  const [pairContext, setPairContext] = useState<PairContext>('friendship');

  const filteredSigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ZODIAC_SIGNS;
    return ZODIAC_SIGNS.filter((s) =>
      [s.westernName.en, s.westernName[language], s.rashiName.en, s.rashiName[language]]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery, language]);

  const focusedSign = useMemo(() => getSignById(wheelFocusSignId), [wheelFocusSignId]);
  const focusedPrompt = useMemo(() => {
    const idx = getDailyPromptIndex(focusedSign.id, todayStr, focusedSign.prompts.length);
    return focusedSign.prompts[idx];
  }, [focusedSign, todayStr]);

  const activeSign = detailSignId ? getSignById(detailSignId) : null;
  const activePrompt = useMemo(() => {
    if (!activeSign) return null;
    const baseIdx = getDailyPromptIndex(activeSign.id, todayStr, activeSign.prompts.length);
    const offset = sparkOffset[activeSign.id] ?? 0;
    return activeSign.prompts[(baseIdx + offset) % activeSign.prompts.length];
  }, [activeSign, todayStr, sparkOffset]);

  const pairCard = useMemo(() => buildTwoSignCard(pairA, pairB, pairContext), [pairA, pairB, pairContext]);
  const pairSignA = useMemo(() => getSignById(pairA), [pairA]);
  const pairSignB = useMemo(() => getSignById(pairB), [pairB]);

  const handleAskAiQuestion = async () => {
    if (!activeSign || !activePrompt) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const resp = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: JSON.stringify({
            signId: activeSign.id,
            western: activeSign.westernName.en,
            rashi: activeSign.rashiName.en,
            theme: activePrompt.theme,
          }),
          mode: 'sign_question',
          language,
          consent: true,
        }),
      });
      const data = (await resp.json()) as { kind?: string; text?: string; error?: string };
      if (!resp.ok) setAiError(data.error || 'Unavailable right now.');
      else if (data.kind === 'support') onOpenSupport();
      else if (data.text) setAiQuestion(data.text);
    } catch {
      setAiError('Network unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  // Sign Detail Screen with large horizontally rotatable 3D element sculpture
  if (activeSign && activePrompt) {
    const isChosenLens = zodiacProfile.chosenLens === activeSign.id;
    const offset = sparkOffset[activeSign.id] ?? 0;
    const elemKind = getElementForSign(activeSign.id);

    return (
      <section className="max-w-[720px] mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#DADADD] dark:border-[#363839] pb-3">
          <button
            type="button"
            onClick={() => {
              setDetailSignId(null);
              setDetailRotY(0);
              setAiQuestion(null);
              window.scrollTo({ top: 0 });
            }}
            className="min-h-[44px] px-2 -ml-2 rounded-xl text-[15px] font-medium inline-flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{strings.zodiac.title}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateProfile({
                ...zodiacProfile,
                chosenLens: isChosenLens ? undefined : activeSign.id,
              })
            }
            className={`min-h-[40px] px-3.5 rounded-[10px] border text-[13px] font-medium inline-flex items-center gap-1.5 ${
              isChosenLens
                ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                : 'border-[#DADADD] dark:border-[#363839]'
            }`}
          >
            {isChosenLens && <Check className="w-3.5 h-3.5" />}
            <span>{isChosenLens ? strings.zodiac.lensPrefix : strings.lens.saveLens}</span>
          </button>
        </div>

        {/* Interactive 3D Element Sculpture Showcase (horizontal drag + accessible buttons/keys, never traps vertical page scroll) */}
        <div
          className="rounded-[24px] bg-[#19191B] dark:bg-[#1D1F20] dark:border dark:border-[#363839] text-[#F3F1EC] overflow-hidden"
          tabIndex={0}
          aria-label={`${elemKind} element 3D sculpture for ${activeSign.westernName[language]}. Use Left and Right arrow keys to rotate.`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setDetailRotY((r) => r - 0.35);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              setDetailRotY((r) => r + 0.35);
            }
          }}
        >
          <div className="h-[220px] sm:h-[250px] w-full relative">
            <AstralCanvas3D
              mode="element"
              element={elemKind}
              enableDragRotate={true}
              rotationOffsetY={detailRotY}
              reducedMotion={reducedMotion}
              className="w-full h-full"
              ariaLabel={`${elemKind} 3D sculpture`}
            />
          </div>
          <div className="px-5 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#B3B4B1]">
            <span>
              {activeSign.element[language]} · {elemKind} sculpture (drag sideways or use controls)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDetailRotY((r) => r - 0.55)}
                aria-label="Rotate sculpture left"
                className="min-h-[36px] min-w-[36px] px-2.5 rounded-[10px] border border-white/15 text-[#F3F1EC] inline-flex items-center justify-center hover:bg-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDetailRotY(0)}
                aria-label="Reset rotation"
                className="min-h-[36px] px-2.5 rounded-[10px] border border-white/15 text-[#F3F1EC] text-[12px] hover:bg-white/10"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setDetailRotY((r) => r + 0.55)}
                aria-label="Rotate sculpture right"
                className="min-h-[36px] min-w-[36px] px-2.5 rounded-[10px] border border-white/15 text-[#F3F1EC] inline-flex items-center justify-center hover:bg-white/10"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sign Copy & Prompt Surface */}
        <div className="rounded-[24px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">
                {activeSign.element[language]} · {activeSign.modality[language]} · {strings.zodiac.rulerLabel}:{' '}
                {activeSign.vedicRuler[language]}
              </div>
              <h1 className="text-[28px] leading-[34px] font-bold tracking-tight mt-1">
                {activeSign.westernName[language]} · {activeSign.rashiName[language]}
              </h1>
            </div>
            <div className="w-16 h-16 rounded-[16px] bg-[#F3F3F5] dark:bg-[#252729] flex items-center justify-center shrink-0">
              <ZodiacLineMark signId={activeSign.id} size={42} />
            </div>
          </div>

          <div className="border-t border-[#DADADD] dark:border-[#363839] pt-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{strings.zodiac.sparkTitle}</span>
              <button
                type="button"
                onClick={() => {
                  setAiQuestion(null);
                  setSparkOffset((prev) => ({
                    ...prev,
                    [activeSign.id]: ((prev[activeSign.id] ?? 0) + 1) % activeSign.prompts.length,
                  }));
                }}
                className="min-h-[38px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[13px] inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {strings.zodiac.anotherSpark}
              </button>
            </div>
            <p className="text-[22px] leading-[30px] font-bold tracking-tight">{activePrompt.spark[language]}</p>
            {offset >= activeSign.prompts.length - 1 && (
              <p className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">{strings.zodiac.allSparksSeen}</p>
            )}
          </div>

          <div className="rounded-[16px] bg-[#F3F3F5] dark:bg-[#252729] p-4 space-y-1">
            <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">{strings.zodiac.twoMinActionTitle}</div>
            <p className="text-[15px] leading-[22px]">{activePrompt.action[language]}</p>
          </div>

          {aiQuestion && (
            <div className="rounded-[16px] border border-[#DADADD] dark:border-[#363839] p-4 text-[15px] leading-[22px]">
              {aiQuestion}
            </div>
          )}
          {aiError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{aiError}</p>}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onStartLetterFromSign(activeSign.id, activePrompt.spark[language])}
              className="pressable min-h-[48px] px-5 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-bold"
            >
              {strings.zodiac.writeFromPrompt}
            </button>
            <button
              type="button"
              onClick={() => onMakeCardFromSign(activeSign.id, activePrompt.spark[language])}
              className="pressable min-h-[48px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[14px] font-medium"
            >
              {strings.zodiac.makeSignCard}
            </button>
            {aiConsent && (
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAskAiQuestion}
                className="min-h-[48px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[14px] inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? '…' : strings.zodiac.anotherSignQuestion}
              </button>
            )}
          </div>
        </div>

        {(zodiacProfile.tropicalSunPacket || zodiacProfile.vedicMoonPacket) && (
          <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-4 text-[13px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#59595F] dark:text-[#B3B4B1]">
                {zodiacProfile.tropicalSunPacket?.signId
                  ? `${strings.lens.sunResultLabel}: ${getSignById(zodiacProfile.tropicalSunPacket.signId).westernName[language]}`
                  : strings.lens.sunResultLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowHowFound((v) => !v)}
                className="underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {strings.zodiac.howFoundBtn}
              </button>
            </div>
            {showHowFound && (
              <div className="pt-2 border-t border-[#DADADD] dark:border-[#363839] text-[12px] text-[#59595F] dark:text-[#B3B4B1] space-y-1">
                <div>
                  Tropical Sun: {zodiacProfile.tropicalSunPacket?.source ?? 'Astronomy Engine'} (
                  {zodiacProfile.tropicalSunPacket?.precision ?? 'local'})
                </div>
                {zodiacProfile.vedicMoonPacket && (
                  <div>
                    Vedic Moon: {zodiacProfile.vedicMoonPacket.source} ({zodiacProfile.vedicMoonPacket.status})
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold tracking-tight">{strings.zodiac.title}</h1>
          {zodiacProfile.chosenLens && (
            <p className="text-[13px] text-[#59595F] dark:text-[#B3B4B1] mt-0.5">
              {strings.zodiac.lensPrefix} · {getSignById(zodiacProfile.chosenLens).westernName[language]}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-1">
            <button
              type="button"
              onClick={() => setZodiacMode('wheel')}
              className={`min-h-[36px] px-3 rounded-[8px] text-[13px] font-medium transition-colors ${
                zodiacMode === 'wheel'
                  ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C]'
                  : 'text-[#59595F] dark:text-[#B3B4B1]'
              }`}
            >
              Wheel
            </button>
            <button
              type="button"
              onClick={() => setZodiacMode('alchemy')}
              className={`min-h-[36px] px-3 rounded-[8px] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                zodiacMode === 'alchemy'
                  ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C]'
                  : 'text-[#59595F] dark:text-[#B3B4B1]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{strings.zodiac.twoSignBtn}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenLensCalculator}
            className="pressable min-h-[44px] px-3.5 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[13px] font-medium inline-flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>{strings.zodiac.chooseLensBtn}</span>
          </button>
        </div>
      </div>

      {zodiacMode === 'alchemy' ? (
        /* Side-by-side 3D Alchemy View (supports any pair including two signs of the same element; zero scores) */
        <div className="space-y-5">
          <div className="rounded-[24px] bg-[#19191B] dark:bg-[#1D1F20] dark:border dark:border-[#363839] text-[#F3F1EC] overflow-hidden">
            <div className="h-[220px] sm:h-[250px] w-full">
              <AstralCanvas3D
                mode="alchemy"
                pairElements={[getElementForSign(pairA), getElementForSign(pairB)]}
                reducedMotion={reducedMotion}
                className="w-full h-full"
                ariaLabel={`${pairSignA.westernName[language]} (${getElementForSign(pairA)}) and ${pairSignB.westernName[language]} (${getElementForSign(pairB)}) sculptures side by side`}
              />
            </div>
            <div className="px-5 py-3 border-t border-white/10 grid grid-cols-2 text-center text-[13px]">
              <div>
                <span className="font-medium">{pairSignA.westernName[language]}</span>
                <span className="text-[#B3B4B1] ml-1.5">· {pairSignA.element[language]}</span>
              </div>
              <div>
                <span className="font-medium">{pairSignB.westernName[language]}</span>
                <span className="text-[#B3B4B1] ml-1.5">· {pairSignB.element[language]}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-5 space-y-4">
            <p className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{strings.pair.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={pairA}
                onChange={(e) => setPairA(e.target.value as SignId)}
                aria-label={strings.pair.signALabel}
                className="min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
              >
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s.id} value={s.id} className="text-black">
                    {s.westernName[language]} / {s.rashiName[language]}
                  </option>
                ))}
              </select>
              <select
                value={pairB}
                onChange={(e) => setPairB(e.target.value as SignId)}
                aria-label={strings.pair.signBLabel}
                className="min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
              >
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s.id} value={s.id} className="text-black">
                    {s.westernName[language]} / {s.rashiName[language]}
                  </option>
                ))}
              </select>
              <select
                value={pairContext}
                onChange={(e) => setPairContext(e.target.value as PairContext)}
                aria-label={strings.pair.contextLabel}
                className="min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
              >
                <option value="friendship" className="text-black">
                  {strings.pair.contexts.friendship}
                </option>
                <option value="family" className="text-black">
                  {strings.pair.contexts.family}
                </option>
                <option value="creative" className="text-black">
                  {strings.pair.contexts.creative}
                </option>
              </select>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-[14px] bg-[#F3F3F5] dark:bg-[#252729] p-3.5">
                <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                  {pairSignA.westernName[language]} · {pairSignA.rashiName[language]}
                </div>
                <p className="text-[15px] mt-0.5">{pairCard.questionForA[language]}</p>
              </div>
              <div className="rounded-[14px] bg-[#F3F3F5] dark:bg-[#252729] p-3.5">
                <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                  {pairSignB.westernName[language]} · {pairSignB.rashiName[language]}
                </div>
                <p className="text-[15px] mt-0.5">{pairCard.questionForB[language]}</p>
              </div>
              <div className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] p-3.5">
                <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                  {strings.pair.sharedActivityLabel}
                </div>
                <p className="text-[14px] font-medium mt-0.5">{pairCard.sharedActivity[language]}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Wheel Showcase + Synchronized 12-Sign Grid */
        <div className="space-y-5">
          {/* Interactive 3D Zodiac Wheel Card */}
          <div className="rounded-[24px] bg-[#19191B] dark:bg-[#1D1F20] dark:border dark:border-[#363839] text-[#F3F1EC] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 h-[220px] sm:h-[245px]">
              <AstralCanvas3D
                mode="wheel"
                selectedSignId={wheelFocusSignId}
                onSelectSign={(id) => setWheelFocusSignId(id)}
                reducedMotion={reducedMotion}
                className="w-full h-full"
                ariaLabel={`Interactive 3D zodiac wheel focused on ${focusedSign.westernName[language]}`}
              />
            </div>

            <div className="md:col-span-6 space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] text-[#B3B4B1]">
                    {focusedSign.element[language]} · {focusedSign.modality[language]}
                  </div>
                  <h2 className="text-[23px] leading-[29px] font-bold tracking-tight mt-0.5">
                    {focusedSign.westernName[language]} · {focusedSign.rashiName[language]}
                  </h2>
                </div>
                <ZodiacLineMark signId={focusedSign.id} size={32} className="text-[#F3F1EC] shrink-0" />
              </div>

              <p className="text-[15px] leading-[22px] font-semibold text-[#F3F1EC]/95">{focusedPrompt.spark[language]}</p>

              {/* Synchronized accessible quick-focus strip */}
              <div className="flex flex-wrap gap-1.5 pt-1" role="radiogroup" aria-label="Zodiac wheel signs">
                {ZODIAC_SIGNS.map((s) => {
                  const active = s.id === wheelFocusSignId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setWheelFocusSignId(s.id)}
                      className={`min-h-[32px] px-2.5 rounded-[8px] text-[12px] font-medium transition-colors ${
                        active
                          ? 'bg-[#EEEAE2] text-[#1A1B1C]'
                          : 'bg-white/10 text-[#F3F1EC]/85 hover:bg-white/15'
                      }`}
                    >
                      {s.westernName[language]}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openSignDetail(focusedSign.id)}
                  className="pressable min-h-[42px] px-4 rounded-[10px] bg-[#EEEAE2] text-[#1A1B1C] text-[13px] font-medium"
                >
                  Open {focusedSign.westernName[language]}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onStartLetterFromSign(focusedSign.id, focusedPrompt.spark[language])
                  }
                  className="pressable min-h-[42px] px-4 rounded-[10px] border border-white/20 text-[#F3F1EC] text-[13px] font-medium"
                >
                  {strings.zodiac.writeFromPrompt}
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#59595F] dark:text-[#B3B4B1]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={strings.zodiac.searchPlaceholder}
              aria-label={strings.zodiac.searchPlaceholder}
              className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#19191B] dark:focus:ring-[#EEEAE2]"
            />
          </div>

          {/* 3x4 accessible 12-Sign Grid synced with wheel selection */}
          <div className="grid grid-cols-2 min-[380px]:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredSigns.map((sign) => {
              const isLens = zodiacProfile.chosenLens === sign.id;
              const isWheelFocused = wheelFocusSignId === sign.id;
              return (
                <button
                  key={sign.id}
                  type="button"
                  aria-current={isWheelFocused ? 'true' : undefined}
                  onClick={() => {
                    setWheelFocusSignId(sign.id);
                    openSignDetail(sign.id);
                  }}
                  className={`pressable relative rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] p-4 text-left border transition-colors ${
                    isLens || isWheelFocused
                      ? 'border-[#19191B] dark:border-[#EEEAE2] ring-1 ring-[#19191B] dark:ring-[#EEEAE2]'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <ZodiacLineMark signId={sign.id} size={32} />
                    {isLens && (
                      <span
                        aria-label="Selected lens"
                        className="w-5 h-5 rounded-full bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-[16px] leading-[22px] font-bold text-[#19191B] dark:text-[#F3F1EC]">
                    {sign.westernName[language]}
                  </div>
                  <div className="text-[13px] leading-[18px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">
                    {sign.rashiName[language]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
