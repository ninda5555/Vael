import React, { useMemo, useState } from 'react';
import { Copy, Download, Lock, MoreHorizontal, RefreshCw, Search, Star, Trash2, Unlock } from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import type { AlmanacCheckIn, AppLanguage, FeelingCardRecord, LetterRecord } from '../../shared/types.ts';
import { PAPER_SPECS } from '../lib/pngExport.ts';
import type { VaultItem } from '../lib/vaultDb.ts';
import { BottomSheet } from './BottomSheet.tsx';
import { CroppedEnvelopeSilhouette } from './MonochromeMarks.tsx';

interface MyBoxSectionProps {
  language: AppLanguage;
  strings: TranslationStrings;
  locked: boolean;
  loading?: boolean;
  storageError?: string | null;
  items: VaultItem[];
  checkIns: AlmanacCheckIn[];
  demoDismissed: boolean;
  canLock: boolean;
  onUnlockWithPassphrase: (passphrase: string) => Promise<void>;
  onLockVault: () => void;
  onRetryLoad?: () => void;
  onStartWriting: () => void;
  onOpenLetter: (letter: LetterRecord) => void;
  onOpenCard: (card: FeelingCardRecord) => void;
  onDuplicateLetter: (letter: LetterRecord) => void;
  onToggleFavorite: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
  onDismissDemo: () => void;
  onRetrySync?: (item: VaultItem) => void;
}

const DEMO_SAMPLES = [
  {
    id: 'demo-1',
    title: 'Sample · To: My younger self',
    excerpt: 'You did not have to understand the whole monsoon before taking the first step across the street.',
    paper: 'Old Parchment',
  },
  {
    id: 'demo-2',
    title: 'Sample · Feeling Card (Pisces motif)',
    excerpt: 'Today sounds like distant tram bells after rain.',
    paper: 'Moonlit Ink',
  },
];

export const MyBoxSection: React.FC<MyBoxSectionProps> = ({
  language,
  strings,
  locked,
  loading = false,
  storageError = null,
  items,
  checkIns,
  demoDismissed,
  canLock,
  onUnlockWithPassphrase,
  onLockVault,
  onRetryLoad,
  onStartWriting,
  onOpenLetter,
  onOpenCard,
  onDuplicateLetter,
  onToggleFavorite,
  onDeleteItem,
  onDismissDemo,
  onRetrySync,
}) => {
  const [tab, setTab] = useState<'all' | 'letters' | 'cards' | 'favorites'>('all');
  const [query, setQuery] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [menuItem, setMenuItem] = useState<VaultItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (tab === 'letters' && item.kind !== 'letter') return false;
      if (tab === 'cards' && item.kind !== 'card') return false;
      if (tab === 'favorites' && !item.favorite) return false;
      if (!q) return true;
      const haystack =
        item.kind === 'letter'
          ? `${item.recipientLabel} ${item.salutation} ${item.body}`
          : `${item.moodLabel ?? ''} ${item.text}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [items, tab, query]);

  const recentShelfItems = useMemo(() => items.slice(0, 3), [items]);
  const lettersCount = items.filter((i) => i.kind === 'letter').length;
  const cardsCount = items.filter((i) => i.kind === 'card').length;

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    try {
      await onUnlockWithPassphrase(passphrase);
      setPassphrase('');
    } catch {
      setUnlockError('Passphrase did not unlock this box.');
    }
  };

  const handleExportSingleJson = (item: VaultItem) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unsent-${item.kind}-${item.id.slice(0, 8)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Locked state: zero excerpt leakage
  if (locked) {
    return (
      <section className="max-w-md mx-auto rounded-[22px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F3F3F5] dark:bg-[#252729] flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-[26px] leading-[32px] font-medium tracking-tight">{strings.box.lockedTitle}</h1>
        <p className="text-[14px] leading-[20px] text-[#59595F] dark:text-[#B3B4B1]">{strings.box.lockedBody}</p>
        <form onSubmit={handleUnlockSubmit} className="space-y-3 pt-1">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={strings.settings.passphrasePlaceholder}
            className="w-full min-h-[44px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[15px]"
          />
          {unlockError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{unlockError}</p>}
          <button
            type="submit"
            className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-medium inline-flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            {strings.box.unlockBtn}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-tight">{strings.box.title}</h1>
        {canLock && (
          <button
            type="button"
            onClick={onLockVault}
            className="pressable min-h-[44px] px-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[13px] font-medium inline-flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            {strings.box.lockNow}
          </button>
        )}
      </div>

      {storageError && (
        <div className="rounded-[16px] border border-[#A63A32]/40 bg-[#FFFFFF] dark:bg-[#1D1F20] p-4 flex items-center justify-between gap-3 text-[13px]">
          <span>{storageError}</span>
          {onRetryLoad && (
            <button
              type="button"
              onClick={onRetryLoad}
              className="min-h-[40px] px-3 rounded-[10px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[12px] font-medium inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {strings.editor.tryAgain}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-24 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] animate-pulse" />
          <div className="h-20 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        /* Empty Box State */
        <div className="rounded-[24px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-8 sm:p-12 text-center flex flex-col items-center space-y-5">
          <CroppedEnvelopeSilhouette className="w-44 text-[#19191B] dark:text-[#EEEAE2]" />
          <div className="space-y-1.5 max-w-sm">
            <h2 className="text-[22px] leading-[28px] font-bold tracking-tight">{strings.box.emptyTitle}</h2>
            <p className="text-[14px] leading-[20px] text-[#59595F] dark:text-[#B3B4B1]">{strings.box.emptyBody}</p>
          </div>
          <button
            type="button"
            onClick={onStartWriting}
            className="pressable min-h-[48px] px-6 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-bold"
          >
            {strings.today.writeLetterCta}
          </button>
        </div>
      ) : (
        <>
          {/* Bond-inspired Recent Paper Shelf (up to 3 unlocked covers, subtle backing sheet, zero social clutter) */}
          {recentShelfItems.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[13px] font-medium text-[#59595F] dark:text-[#B3B4B1]">
                {strings.box.recentShelf}
              </div>
              <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 pr-2 snap-x">
                {recentShelfItems.map((item) => {
                  const paperId = item.kind === 'letter' ? item.paper : item.style;
                  const spec = PAPER_SPECS[paperId];
                  const title =
                    item.kind === 'letter'
                      ? item.salutation || item.recipientLabel || strings.editor.title
                      : item.moodLabel || strings.cards.title;
                  const excerpt = item.kind === 'letter' ? item.body : item.text;

                  return (
                    <div key={item.id} className="relative w-[260px] md:w-auto shrink-0 snap-start">
                      {/* Subtle backing sheet under cover */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#252729] border border-[#DADADD] dark:border-[#363839]"
                      />
                      <button
                        type="button"
                        onClick={() => (item.kind === 'letter' ? onOpenLetter(item) : onOpenCard(item))}
                        style={{ backgroundColor: spec.bg, color: spec.ink, borderColor: spec.border }}
                        className="pressable relative w-full text-left rounded-[16px] border p-4 shadow-sm space-y-2 min-h-[126px] flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[11px] opacity-75">
                            <span className="truncate">
                              {item.kind === 'letter' ? item.recipientLabel : strings.cards.title}
                            </span>
                            {item.kind === 'letter' && item.sealed && (
                              <span style={{ color: '#A63A32' }} className="font-semibold tracking-wider shrink-0">
                                {strings.editor.sealedBadge}
                              </span>
                            )}
                          </div>
                          <div className="font-letter text-[17px] leading-snug font-medium line-clamp-1">{title}</div>
                          <p className="text-[12px] leading-[17px] opacity-75 line-clamp-2">
                            {excerpt || '…'}
                          </p>
                        </div>
                        <div className="text-[11px] opacity-65 tabular-nums">{formatDate(item.updatedAt)}</div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recap Strip */}
          <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-4">
            <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">{strings.box.recapTitle}</div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <div className="text-[23px] font-bold tabular-nums">{lettersCount}</div>
                <div className="text-[12px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">{strings.box.recapLettersCount}</div>
              </div>
              <div>
                <div className="text-[23px] font-bold tabular-nums">{cardsCount}</div>
                <div className="text-[12px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">{strings.box.recapCardsCount}</div>
              </div>
              <div>
                <div className="text-[23px] font-bold tabular-nums">{checkIns.length}</div>
                <div className="text-[12px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">{strings.box.recapCheckInsCount}</div>
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="inline-flex rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-1 self-start">
              {(
                [
                  ['all', strings.box.tabs.all],
                  ['letters', strings.box.tabs.letters],
                  ['cards', strings.box.tabs.cards],
                  ['favorites', strings.box.tabs.favorites],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`min-h-[36px] px-3 rounded-[8px] text-[13px] font-medium transition-colors ${
                    tab === id
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C]'
                      : 'text-[#59595F] dark:text-[#B3B4B1]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#59595F] dark:text-[#B3B4B1]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={strings.box.searchPlaceholder}
                aria-label={strings.box.searchPlaceholder}
                className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[14px]"
              />
            </div>
          </div>

          {/* Calm Library List */}
          <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] divide-y divide-[#DADADD] dark:divide-[#363839]">
            {filteredItems.map((item) => {
              const paperId = item.kind === 'letter' ? item.paper : item.style;
              const spec = PAPER_SPECS[paperId];
              const title =
                item.kind === 'letter'
                  ? item.salutation || item.recipientLabel || strings.editor.title
                  : item.text.slice(0, 48) || strings.cards.title;
              const subtitle =
                item.kind === 'letter'
                  ? `${item.recipientLabel}${item.sealed ? ` · ${strings.editor.sealedBadge}` : ''}`
                  : strings.cards.title;

              return (
                <div key={item.id} className="flex items-center gap-3 p-3.5 sm:px-4">
                  {/* Stacked folded-paper thumbnail */}
                  <button
                    type="button"
                    onClick={() => (item.kind === 'letter' ? onOpenLetter(item) : onOpenCard(item))}
                    className="flex-1 min-w-0 flex items-center gap-3.5 text-left min-h-[44px]"
                  >
                    <div className="relative w-10 h-12 shrink-0" aria-hidden="true">
                      <div
                        style={{ borderColor: spec.border }}
                        className="absolute inset-0 translate-x-1 translate-y-1 rounded-[8px] border bg-[#F3F3F5] dark:bg-[#252729]"
                      />
                      <div
                        style={{ backgroundColor: spec.bg, borderColor: spec.border }}
                        className="relative w-10 h-12 rounded-[8px] border overflow-hidden"
                      >
                        <div
                          style={{ borderColor: spec.border }}
                          className="absolute top-0 right-0 w-3 h-3 border-l border-b bg-black/5"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] leading-[21px] font-bold truncate">{title}</div>
                      <div className="text-[13px] leading-[18px] text-[#59595F] dark:text-[#B3B4B1] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{subtitle}</span>
                        <span>·</span>
                        <span className="tabular-nums">{formatDate(item.updatedAt)}</span>
                      </div>
                      {(item.syncStatus === 'pending_sync' || item.syncStatus === 'conflicted') && (
                        <div className="text-[11px] text-[#A63A32] dark:text-[#E07A73] mt-0.5">
                          {item.syncStatus === 'conflicted' ? 'Version conflict' : strings.editor.savedOfflineQueued}
                        </div>
                      )}
                    </div>
                  </button>

                  {onRetrySync && (item.syncStatus === 'pending_sync' || item.syncStatus === 'conflicted') && (
                    <button
                      type="button"
                      onClick={() => onRetrySync(item)}
                      className="min-h-[38px] px-2.5 rounded-[8px] border border-[#DADADD] dark:border-[#363839] text-[12px]"
                    >
                      {strings.editor.tryAgain}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item)}
                    aria-label="Favorite"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Star className={`w-4 h-4 ${item.favorite ? 'fill-current' : 'opacity-45'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenuItem(item)}
                    aria-label="Entry options"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Separate Removable Sample Preview */}
      {!demoDismissed && (
        <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
              {strings.box.demoBadge} · {strings.box.demoTitle}
            </div>
            <button type="button" onClick={onDismissDemo} className="text-[12px] underline">
              {strings.box.hideDemo}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_SAMPLES.map((s) => (
              <div key={s.id} className="rounded-[12px] bg-[#F3F3F5] dark:bg-[#252729] p-3.5 text-[12px] space-y-1">
                <div className="text-[#59595F] dark:text-[#B3B4B1]">
                  {s.title} · {s.paper}
                </div>
                <p className="font-letter text-[15px] leading-snug">{s.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overflow Menu Sheet */}
      <BottomSheet
        open={menuItem !== null}
        onClose={() => {
          setMenuItem(null);
          setConfirmDeleteId(null);
        }}
        title={
          menuItem
            ? menuItem.kind === 'letter'
              ? menuItem.salutation || strings.editor.title
              : strings.cards.title
            : ''
        }
      >
        {menuItem && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                const target = menuItem;
                setMenuItem(null);
                if (target.kind === 'letter') onOpenLetter(target);
                else onOpenCard(target);
              }}
              className="w-full min-h-[48px] px-4 rounded-[12px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-medium text-left"
            >
              {strings.box.reread}
            </button>

            {menuItem.kind === 'letter' && (
              <button
                type="button"
                onClick={() => {
                  const target = menuItem;
                  setMenuItem(null);
                  onDuplicateLetter(target);
                }}
                className="w-full min-h-[48px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[15px] flex items-center gap-2.5"
              >
                <Copy className="w-4 h-4" />
                <span>{strings.box.duplicateDraft}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleExportSingleJson(menuItem);
                setMenuItem(null);
              }}
              className="w-full min-h-[48px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[15px] flex items-center gap-2.5"
            >
              <Download className="w-4 h-4" />
              <span>{strings.box.exportItem}</span>
            </button>

            <div className="pt-2 border-t border-[#DADADD] dark:border-[#363839]">
              {confirmDeleteId !== menuItem.id ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(menuItem.id)}
                  className="w-full min-h-[48px] px-4 rounded-[12px] text-[#A63A32] dark:text-[#E07A73] text-[15px] flex items-center gap-2.5 hover:bg-[#A63A32]/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{strings.box.deleteItem}</span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 min-h-[44px] rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[14px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteItem(menuItem.id);
                      setConfirmDeleteId(null);
                      setMenuItem(null);
                    }}
                    className="flex-1 min-h-[44px] rounded-[10px] bg-[#A63A32] text-white text-[14px] font-medium"
                  >
                    {strings.box.deleteItem}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </section>
  );
};
