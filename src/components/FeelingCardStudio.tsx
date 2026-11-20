import React, { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Download,
  Lock,
  Maximize2,
  Minimize2,
  Palette,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Type as TypeIcon,
  Unlock,
} from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import { needsSupport } from '../../shared/policy.ts';
import type { AppLanguage, FeelingCardRecord, PaperStyleId, SignId } from '../../shared/types.ts';
import { getSignById, ZODIAC_SIGNS } from '../../shared/zodiacCatalog.ts';
import { triggerHaptic } from '../lib/motion.ts';
import { paginateCardText, PAPER_SPECS, renderFeelingCardPngBlob } from '../lib/pngExport.ts';
import { getElementForSign } from '../three/sculptures.ts';
import { AstralCanvas3D } from './AstralCanvas3D.tsx';
import { BottomSheet } from './BottomSheet.tsx';
import { ZodiacLineMark } from './MonochromeMarks.tsx';

interface FeelingCardStudioProps {
  initialText?: string;
  initialSignId?: SignId;
  initialRecipient?: string;
  initialStyle?: PaperStyleId;
  language: AppLanguage;
  strings: TranslationStrings;
  aiConsent: boolean;
  hapticsEnabled: boolean;
  reducedMotion?: boolean;
  timeZone: string;
  onSaveCard: (card: FeelingCardRecord) => Promise<void>;
  onOpenSupport: () => void;
}

type ToolSheet = 'paper' | 'type' | 'motif' | 'details' | null;

const STYLE_LIST: PaperStyleId[] = [
  'oldParchment',
  'midnightBlue',
  'rosePetal',
  'rainGlass',
  'tornNotebook',
  'moonlitInk',
];

export const FeelingCardStudio: React.FC<FeelingCardStudioProps> = ({
  initialText = '',
  initialSignId,
  initialRecipient = '',
  initialStyle = 'oldParchment',
  language,
  strings,
  aiConsent,
  hapticsEnabled,
  reducedMotion = false,
  timeZone,
  onSaveCard,
  onOpenSupport,
}) => {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState<PaperStyleId>(initialStyle);
  const [signId, setSignId] = useState<SignId | ''>(initialSignId ?? '');
  const [use3DMotif, setUse3DMotif] = useState<boolean>(Boolean(initialSignId));
  const [poseFrozen, setPoseFrozen] = useState<boolean>(false);
  const [motifRotOffsetY, setMotifRotOffsetY] = useState<number>(0);
  const sculptureSnapshotRef = useRef<(() => HTMLCanvasElement | null) | null>(null);
  const sculptureWrapRef = useRef<HTMLDivElement | null>(null);
  const [fontSizeScale, setFontSizeScale] = useState<'small' | 'medium' | 'large'>('medium');
  const [showWatermark, setShowWatermark] = useState(true);
  const [showRecipient, setShowRecipient] = useState(false);
  const [recipientLabel, setRecipientLabel] = useState(initialRecipient);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeSheet, setActiveSheet] = useState<ToolSheet>(null);
  const [fullSizePreview, setFullSizePreview] = useState(false);

  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const pages = useMemo(() => paginateCardText(text, 340), [text]);
  const safePageIndex = Math.min(activePageIndex, pages.length - 1);
  const currentPassage = pages[safePageIndex] ?? '';

  const spec = PAPER_SPECS[style];
  const signDef = signId ? getSignById(signId) : null;
  const sculptureElement = signDef ? getElementForSign(signDef.id) : undefined;

  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { timeZone, dateStyle: 'medium' }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }, [timeZone]);

  const generateBlob = async () => {
    // Freeze the exact visible pose at export time
    setPoseFrozen(true);
    const snapshotCanvas = use3DMotif ? sculptureSnapshotRef.current?.() ?? null : null;
    let fallbackSrc: string | undefined;
    if (use3DMotif && !snapshotCanvas && sculptureWrapRef.current) {
      const svgEl = sculptureWrapRef.current.querySelector('svg');
      if (svgEl) {
        const serialized = new XMLSerializer().serializeToString(svgEl);
        fallbackSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
      }
    }

    return renderFeelingCardPngBlob({
      text: currentPassage,
      style,
      fontSizeScale,
      recipientLabel,
      showRecipient,
      showWatermark,
      signId: signId || undefined,
      dateLabel,
      pageLabel: pages.length > 1 ? `${safePageIndex + 1} / ${pages.length}` : undefined,
      sculptureCanvas: snapshotCanvas,
      sculptureFallbackSrc: fallbackSrc,
    });
  };

  const handleDownloadPng = async () => {
    setExportStatus(null);
    const blob = await generateBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unsent-card-${Date.now()}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    triggerHaptic('success', hapticsEnabled);
    setExportStatus(strings.cards.downloadStarted);
  };

  const handleShare = async () => {
    setExportStatus(null);
    const blob = await generateBlob();
    const file = new File([blob], `unsent-card-${Date.now()}.png`, { type: 'image/png' });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Unsent' });
        triggerHaptic('success', hapticsEnabled);
        return;
      } catch {
        // Cancelled share returns quietly without a false success message
        return;
      }
    }
    await handleDownloadPng();
  };

  const handleSaveToBox = async () => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    await onSaveCard({
      id: crypto.randomUUID(),
      kind: 'card',
      text: text.trim(),
      style,
      signId: signId || undefined,
      showWatermark,
      showRecipient,
      recipientLabel: showRecipient ? recipientLabel : undefined,
      favorite: false,
      linkedAlmanacDate: new Date().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      revision: 1,
      syncStatus: 'local',
    });
    triggerHaptic('success', hapticsEnabled);
    setExportStatus(strings.cards.savedToBoxStatus);
  };

  const handleGeneratePoem = async () => {
    setAiError(null);
    if (!text.trim()) return;
    if (needsSupport(text)) {
      onOpenSupport();
      return;
    }
    setAiLoading(true);
    try {
      const resp = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim().slice(0, 4000),
          mode: 'poem',
          language,
          consent: true,
        }),
      });
      const data = (await resp.json()) as { kind?: string; text?: string; error?: string };
      if (!resp.ok) {
        setAiError(data.error || 'Poem generation unavailable right now.');
      } else if (data.kind === 'support') {
        onOpenSupport();
      } else if (data.text) {
        setText(data.text);
      }
    } catch {
      setAiError('Unable to reach server right now.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-tight">{strings.cards.title}</h1>
        <button
          type="button"
          onClick={() => setFullSizePreview((v) => !v)}
          className="min-h-[44px] px-3 rounded-[10px] text-[13px] text-[#59595F] dark:text-[#B3B4B1] inline-flex items-center gap-1.5 lg:hidden"
        >
          {fullSizePreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{fullSizePreview ? strings.cards.exitFullSize : strings.cards.viewFullSize}</span>
        </button>
      </div>

      {/* Reversed Hierarchy: 9:16 Artifact Preview Leads on Mobile & Sits Beside Compact Editor on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Artifact Preview */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          <div
            style={{ backgroundColor: spec.bg, color: spec.ink, borderColor: spec.border }}
            className={`w-full aspect-[9/16] rounded-[22px] p-6 border shadow-sm flex flex-col justify-between relative transition-colors duration-150 ${
              fullSizePreview ? 'max-w-[340px]' : 'max-w-[260px] sm:max-w-[300px] lg:max-w-[330px]'
            }`}
          >
            <div
              style={{ borderColor: spec.accent }}
              className="absolute inset-4 border opacity-20 pointer-events-none rounded-[14px]"
            />

            <div className="relative z-10 space-y-1">
              {signDef && (
                <div style={{ color: spec.accent }} className="flex items-center gap-1.5 text-[12px] font-medium">
                  <ZodiacLineMark signId={signDef.id} size={18} />
                  <span>
                    {signDef.westernName[language]} · {signDef.rashiName[language]}
                  </span>
                </div>
              )}
              {showRecipient && recipientLabel.trim() && (
                <div className="font-letter text-[16px] opacity-75">To {recipientLabel.trim()}</div>
              )}
            </div>

            {use3DMotif && (
              <div
                ref={sculptureWrapRef}
                className="relative z-10 mx-auto my-2 w-[112px] h-[112px] rounded-full bg-[#19191B]/95 flex items-center justify-center overflow-hidden shadow-sm"
              >
                <AstralCanvas3D
                  mode={sculptureElement ? 'element' : 'envelope'}
                  element={sculptureElement}
                  enableDragRotate={true}
                  rotationOffsetY={motifRotOffsetY}
                  paused={poseFrozen}
                  reducedMotion={reducedMotion}
                  preserveDrawingBuffer={true}
                  contactShadow={true}
                  snapshotApiRef={sculptureSnapshotRef}
                  className="w-full h-full"
                  ariaLabel={sculptureElement ? `${sculptureElement} 3D motif` : 'Folded envelope 3D motif'}
                />
              </div>
            )}

            <div
              className={`relative z-10 font-letter leading-relaxed whitespace-pre-line ${
                fontSizeScale === 'large'
                  ? 'text-[22px]'
                  : fontSizeScale === 'small'
                    ? 'text-[16px]'
                    : 'text-[19px]'
              }`}
            >
              {currentPassage || strings.cards.feelingPlaceholder}
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] opacity-75">
              <span className="tabular-nums">
                {dateLabel}
                {pages.length > 1 ? ` · ${safePageIndex + 1}/${pages.length}` : ''}
              </span>
              {showWatermark && <span className="font-extrabold tracking-wide uppercase text-[11px]">UNSENT</span>}
            </div>
          </div>

          {use3DMotif && (
            <div className="flex items-center gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => setPoseFrozen((v) => !v)}
                className="min-h-[36px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] inline-flex items-center gap-1.5 font-medium"
              >
                {poseFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{poseFrozen ? 'Pose locked' : 'Freeze pose'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMotifRotOffsetY((r) => r - 0.5)}
                aria-label="Rotate motif left"
                className="min-h-[36px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20]"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => setMotifRotOffsetY((r) => r + 0.5)}
                aria-label="Rotate motif right"
                className="min-h-[36px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20]"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={() => {
                  setMotifRotOffsetY(0);
                  setPoseFrozen(false);
                }}
                aria-label="Reset motif pose"
                className="min-h-[36px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pages.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                {strings.cards.passageSplitLabel}:
              </span>
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePageIndex(idx)}
                  className={`min-h-[36px] min-w-[36px] rounded-[10px] text-[12px] font-medium border ${
                    safePageIndex === idx
                      ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable Text + Primary Share Action + Compact Tool Strip */}
        <div className="lg:col-span-6 space-y-4">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setActivePageIndex(0);
            }}
            aria-label={strings.cards.feelingLabel}
            placeholder={strings.cards.feelingPlaceholder}
            className="w-full rounded-[16px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] p-4 text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-[#19191B] dark:focus:ring-[#EEEAE2]"
          />

          {/* Compact 4-Tool Strip: Paper · Type · Motif · Details */}
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ['paper', strings.cards.tools.paper, Palette],
                ['type', strings.cards.tools.type, TypeIcon],
                ['motif', strings.cards.tools.motif, Sparkles],
                ['details', strings.cards.tools.details, SlidersHorizontal],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSheet(key)}
                className="pressable min-h-[48px] px-2 py-2 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] flex flex-col items-center justify-center gap-1 text-[12px] font-medium"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {aiConsent && (
            <button
              type="button"
              disabled={!text.trim() || aiLoading}
              onClick={handleGeneratePoem}
              className="min-h-[44px] px-3.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? '…' : strings.cards.poemAction}
            </button>
          )}
          {aiError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{aiError}</p>}

          {/* Dominant Primary Action + Secondary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleShare}
              className="pressable min-h-[48px] px-5 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-bold inline-flex items-center gap-2 disabled:opacity-40"
            >
              <Share2 className="w-4 h-4" />
              {strings.cards.shareEllipsis}
            </button>

            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleDownloadPng}
              className="pressable min-h-[48px] px-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[14px] font-medium inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              {strings.cards.saveImage}
            </button>

            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleSaveToBox}
              className="min-h-[48px] px-4 rounded-[12px] text-[14px] font-medium text-[#59595F] dark:text-[#B3B4B1] inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Bookmark className="w-4 h-4" />
              {strings.cards.saveToBox}
            </button>
          </div>

          {exportStatus && (
            <p className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]" role="status">
              {exportStatus}
            </p>
          )}
        </div>
      </div>

      {/* Tool Sheet: Paper */}
      <BottomSheet
        open={activeSheet === 'paper'}
        onClose={() => setActiveSheet(null)}
        title={strings.cards.tools.paper}
      >
        <div className="grid grid-cols-2 gap-2.5">
          {STYLE_LIST.map((sId) => {
            const p = PAPER_SPECS[sId];
            const selected = style === sId;
            return (
              <button
                key={sId}
                type="button"
                onClick={() => {
                  triggerHaptic('selection', hapticsEnabled);
                  setStyle(sId);
                }}
                style={{ backgroundColor: p.bg, color: p.ink, borderColor: p.border }}
                className={`min-h-[56px] px-3.5 py-2.5 rounded-[14px] border text-left text-[14px] font-medium flex items-center justify-between ${
                  selected ? 'ring-2 ring-[#19191B] dark:ring-[#EEEAE2]' : ''
                }`}
              >
                <span>{strings.papers[sId]}</span>
                {selected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Tool Sheet: Type */}
      <BottomSheet
        open={activeSheet === 'type'}
        onClose={() => setActiveSheet(null)}
        title={strings.cards.tools.type}
      >
        <div className="grid grid-cols-3 gap-2">
          {(['small', 'medium', 'large'] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setFontSizeScale(sz)}
              className={`min-h-[48px] rounded-[12px] border text-[14px] font-medium capitalize ${
                fontSizeScale === sz
                  ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                  : 'border-[#DADADD] dark:border-[#363839]'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Tool Sheet: Motif */}
      <BottomSheet
        open={activeSheet === 'motif'}
        onClose={() => setActiveSheet(null)}
        title={strings.cards.tools.motif}
      >
        <div className="space-y-4">
          <label className="flex items-center justify-between min-h-[44px] px-3.5 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[14px] font-medium">
            <span>Include 3D sculpture motif</span>
            <input
              type="checkbox"
              checked={use3DMotif}
              onChange={(e) => {
                triggerHaptic('selection', hapticsEnabled);
                setUse3DMotif(e.target.checked);
              }}
              className="w-5 h-5"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', hapticsEnabled);
                setSignId('');
              }}
              className={`min-h-[52px] rounded-[12px] border text-[13px] font-medium ${
                signId === ''
                  ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                  : 'border-[#DADADD] dark:border-[#363839]'
              }`}
            >
              {strings.cards.noneMotif}
            </button>
            {ZODIAC_SIGNS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection', hapticsEnabled);
                  setSignId(s.id);
                  setUse3DMotif(true);
                }}
                className={`min-h-[52px] px-2 py-2 rounded-[12px] border text-[12px] flex flex-col items-center justify-center gap-1 ${
                  signId === s.id
                    ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent font-medium'
                    : 'border-[#DADADD] dark:border-[#363839]'
                }`}
              >
                <ZodiacLineMark signId={s.id} size={22} />
                <span className="truncate max-w-full">{s.westernName[language]}</span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Tool Sheet: Details */}
      <BottomSheet
        open={activeSheet === 'details'}
        onClose={() => setActiveSheet(null)}
        title={strings.cards.tools.details}
      >
        <div className="space-y-4">
          <label className="flex items-center justify-between min-h-[44px] text-[15px]">
            <span>{strings.cards.showWatermark}</span>
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={(e) => setShowWatermark(e.target.checked)}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between min-h-[44px] text-[15px]">
            <span>{strings.cards.showRecipient}</span>
            <input
              type="checkbox"
              checked={showRecipient}
              onChange={(e) => setShowRecipient(e.target.checked)}
              className="w-5 h-5"
            />
          </label>
          {showRecipient && (
            <input
              type="text"
              value={recipientLabel}
              onChange={(e) => setRecipientLabel(e.target.value)}
              placeholder="Recipient name"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[15px]"
            />
          )}
        </div>
      </BottomSheet>
    </section>
  );
};
