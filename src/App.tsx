import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  BookOpen,
  Calendar,
  Compass,
  Feather,
  Home,
  Lock,
  Music2,
  Plus,
  Settings,
  Volume2,
} from 'lucide-react';
import { calculateMoonPhaseForDate, formatInTimeZone } from '../shared/astronomy.ts';
import { t } from '../shared/i18n.ts';
import { RECIPIENT_CATEGORIES } from '../shared/letterPrompts.ts';
import { getSignById } from '../shared/zodiacCatalog.ts';
import type {
  AlmanacCheckIn,
  CreateMode,
  FeelingCardRecord,
  LetterRecord,
  PaperStyleId,
  ReleaseVisual,
  SignId,
  TabId,
  ThemeMode,
  UserPreferences,
} from '../shared/types.ts';
import { AlmanacSection } from './components/AlmanacSection.tsx';
import { AstralCanvas3D } from './components/AstralCanvas3D.tsx';
import { BottomSheet } from './components/BottomSheet.tsx';
import { FeelingCardStudio } from './components/FeelingCardStudio.tsx';
import { LensCalculatorSheet } from './components/LensCalculatorSheet.tsx';
import { LetterEditor } from './components/LetterEditor.tsx';
import {
  MonochromeMoonSvg,
  UnsentSwashArrow,
  UnsentWordmark,
} from './components/MonochromeMarks.tsx';
import { MyBoxSection } from './components/MyBoxSection.tsx';
import { SettingsSection } from './components/SettingsSection.tsx';
import { SupportModal } from './components/SupportModal.tsx';
import { MoodCheckInModal, UnfoldOverlay, WelcomeModal } from './components/UnfoldOpening.tsx';
import { ZodiacSection } from './components/ZodiacSection.tsx';
import { prefersReducedMotion, triggerHaptic } from './lib/motion.ts';
import { getElementForSign } from './three/sculptures.ts';
import {
  deleteEncryptedItem,
  disablePassphraseLock,
  enablePassphraseLock,
  eraseAllLocalVaultData,
  exportEncryptedPortableBackup,
  getVaultStatus,
  importEncryptedPortableBackup,
  initializeOrLoadDeviceVault,
  loadAllCheckIns,
  loadAllEncryptedItems,
  loadPreferences,
  saveEncryptedCheckIn,
  saveEncryptedItem,
  savePreferences,
  unlockVaultWithPassphrase,
  type VaultItem,
} from './lib/vaultDb.ts';

const DEFAULT_PREFS: UserPreferences = {
  language: 'en',
  theme: 'paper',
  textSize: 'normal',
  reducedMotion: false,
  hapticsEnabled: false,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  demoDismissed: false,
  welcomeDismissed: false,
  aiConsent: false,
  cloudOptIn: false,
  zodiacProfile: {},
};

function migrateSavedPrefs(raw: Partial<UserPreferences>): UserPreferences {
  const rawTheme = raw.theme as string | undefined;
  const theme: ThemeMode =
    rawTheme === 'daylight' || rawTheme === 'paper'
      ? 'paper'
      : rawTheme === 'midnight' || rawTheme === 'ink'
        ? 'ink'
        : rawTheme === 'system'
          ? 'system'
          : 'paper';

  return {
    ...DEFAULT_PREFS,
    ...raw,
    theme,
    hapticsEnabled: raw.hapticsEnabled ?? false,
    welcomeDismissed: raw.welcomeDismissed ?? false,
  };
}

function buildWeekDates(centerDateStr: string): string[] {
  const [y, m, d] = centerDateStr.split('-').map(Number);
  const center = new Date(Date.UTC(y, m - 1, d));
  const weekday = center.getUTCDay(); // 0 = Sun
  const start = new Date(center.getTime() - weekday * 86_400_000);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start.getTime() + i * 86_400_000);
    return dt.toISOString().slice(0, 10);
  });
}

export const App: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  const [tab, setTab] = useState<TabId>('today');
  const [showSettings, setShowSettings] = useState(false);

  // Cold-launch Unfold overlay (skipped on warm resume, deep links, reduced motion)
  const [unfoldActive, setUnfoldActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const alreadyRan = sessionStorage.getItem('unsent:unfolded') === '1';
    const hasDeepLink = Boolean(window.location.search || window.location.hash);
    const sysReduced =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !alreadyRan && !hasDeepLink && !sysReduced;
  });
  const [wordmarkPulse, setWordmarkPulse] = useState(false);

  // Vault state
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [vaultLocked, setVaultLocked] = useState(false);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [passphraseEnabled, setPassphraseEnabled] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [checkIns, setCheckIns] = useState<AlmanacCheckIn[]>([]);
  const [cloudUserEmail, setCloudUserEmail] = useState<string | null>(null);

  // Active writing & sheets
  const [quickDraftText, setQuickDraftText] = useState('');
  const [todayFocused, setTodayFocused] = useState(false);
  const [isDesktopCompanion, setIsDesktopCompanion] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false
  );
  const boxScrollYRef = useRef<number>(0);
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);
  const [activeLetter, setActiveLetter] = useState<LetterRecord | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [cardSeed, setCardSeed] = useState<{
    id?: string;
    text?: string;
    signId?: SignId;
    recipient?: string;
    style?: PaperStyleId;
  }>({});
  const [releaseBanner, setReleaseBanner] = useState<string | null>(null);

  // Sheets & Modals
  const [createChooserOpen, setCreateChooserOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [lensSheetOpen, setLensSheetOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [todayDateDetailOpen, setTodayDateDetailOpen] = useState(false);

  // Opt-in ambient soundtrack (1:45 flute cut or full 6:06 track, silent on launch)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTrack, setAudioTrack] = useState<'short' | 'full'>('short');
  const audioSrc =
    audioTrack === 'full'
      ? '/assets/aistudio/Krishna_Eternal_Love_Song__j3x8eJVLv1E__50ba40b4.mp3'
      : '/audio/krishna-eternal-love.mp3';

  const strings = useMemo(() => t(prefs.language), [prefs.language]);
  const todayInfo = useMemo(() => formatInTimeZone(new Date(), prefs.timeZone), [prefs.timeZone]);
  const [almanacDate, setAlmanacDate] = useState<string>(() => todayInfo.dateStr);

  // Keep almanacDate synced to today if timezone changes and date wasn't manually pinned elsewhere
  useEffect(() => {
    setAlmanacDate(todayInfo.dateStr);
  }, [todayInfo.dateStr]);

  const weekDates = useMemo(() => buildWeekDates(todayInfo.dateStr), [todayInfo.dateStr]);
  const selectedDateMoon = useMemo(
    () => calculateMoonPhaseForDate(almanacDate, prefs.timeZone),
    [almanacDate, prefs.timeZone]
  );

  // Track system dark mode & desktop companion breakpoint
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const onDarkChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mqDark.addEventListener?.('change', onDarkChange);

    const mqWide = window.matchMedia('(min-width: 1024px)');
    setIsDesktopCompanion(mqWide.matches);
    const onWideChange = (e: MediaQueryListEvent) => setIsDesktopCompanion(e.matches);
    mqWide.addEventListener?.('change', onWideChange);

    return () => {
      mqDark.removeEventListener?.('change', onDarkChange);
      mqWide.removeEventListener?.('change', onWideChange);
    };
  }, []);

  const isDarkTheme = prefs.theme === 'ink' || (prefs.theme === 'system' && systemPrefersDark);

  // Apply theme, text size, reduced motion, language & browser chrome theme-color
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) root.classList.add('dark');
    else root.classList.remove('dark');

    if (prefs.reducedMotion) root.classList.add('reduced-motion');
    else root.classList.remove('reduced-motion');

    root.style.fontSize = prefs.textSize === 'large' ? '18px' : '16px';
    root.lang = prefs.language === 'bn' ? 'bn' : prefs.language === 'hi' ? 'hi' : 'en';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkTheme ? '#151617' : '#F3F3F5');
    }
  }, [isDarkTheme, prefs.reducedMotion, prefs.textSize, prefs.language]);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    triggerHaptic('selection', prefs.hapticsEnabled);
    if (!audio.paused) {
      audio.pause();
      return;
    }
    audio.volume = 0.42;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => setAudioPlaying(false));
    }
  }, [prefs.hapticsEnabled]);

  const handleSelectAudioTrack = useCallback(
    (nextTrack: 'short' | 'full') => {
      if (nextTrack === audioTrack) return;
      const wasPlaying = Boolean(audioRef.current && !audioRef.current.paused);
      setAudioTrack(nextTrack);
      if (wasPlaying) {
        requestAnimationFrame(() => {
          const audio = audioRef.current;
          if (!audio) return;
          audio.volume = 0.42;
          audio.load();
          audio.play().catch(() => setAudioPlaying(false));
        });
      }
    },
    [audioTrack]
  );

  const isInitialColdUnfoldRef = useRef(unfoldActive);
  const reducedMotionRef = useRef(prefs.reducedMotion);
  reducedMotionRef.current = prefs.reducedMotion;

  const handleUnfoldComplete = useCallback(() => {
    sessionStorage.setItem('unsent:unfolded', '1');
    if (isInitialColdUnfoldRef.current && !prefersReducedMotion(reducedMotionRef.current)) {
      isInitialColdUnfoldRef.current = false;
      setWordmarkPulse(true);
    }
    setUnfoldActive(false);
  }, []);

  const handleUnfoldDismiss = useCallback(() => {
    isInitialColdUnfoldRef.current = false;
    sessionStorage.setItem('unsent:unfolded', '1');
    setUnfoldActive(false);
  }, []);

  // Dismiss Unfold immediately on first interaction so first tap is never swallowed
  useEffect(() => {
    if (!unfoldActive) return;
    window.addEventListener('pointerdown', handleUnfoldDismiss, { once: true });
    window.addEventListener('keydown', handleUnfoldDismiss, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnfoldDismiss);
      window.removeEventListener('keydown', handleUnfoldDismiss);
    };
  }, [unfoldActive, handleUnfoldDismiss]);

  const loadVault = useCallback(async () => {
    setVaultLoading(true);
    setVaultError(null);
    try {
      const savedPrefs = await loadPreferences();
      if (savedPrefs) {
        setPrefs(migrateSavedPrefs(savedPrefs));
      }

      const status = await getVaultStatus('local');
      if (status.locked) {
        setVaultLocked(true);
        setPassphraseEnabled(true);
        return;
      }

      const { key, recoveryCode: code } = await initializeOrLoadDeviceVault('local');
      setVaultKey(key);
      setRecoveryCode(code);
      setVaultLocked(false);
      setPassphraseEnabled(false);

      const [loadedItems, loadedCheckIns] = await Promise.all([
        loadAllEncryptedItems(key, 'local'),
        loadAllCheckIns(key, 'local'),
      ]);
      setItems(loadedItems);
      setCheckIns(loadedCheckIns);

      // Skip cold-launch Unfold if restored drafts exist or in-app reducedMotion is active
      if (
        loadedItems.some((i) => i.kind === 'letter' && !i.sealed) ||
        savedPrefs?.reducedMotion
      ) {
        isInitialColdUnfoldRef.current = false;
        sessionStorage.setItem('unsent:unfolded', '1');
        setUnfoldActive(false);
      }
    } catch {
      setVaultError('Unable to read encrypted local storage.');
    } finally {
      setVaultLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  // Push browser history layer when entering sub-screens or modals so Back unwinds once cleanly
  const activeOverlayDepth = useMemo(() => {
    if (supportOpen || welcomeOpen || checkInDate || lensSheetOpen || createChooserOpen || todayDateDetailOpen) {
      return 3;
    }
    if (createMode !== null || showSettings) return 2;
    return 1;
  }, [
    supportOpen,
    welcomeOpen,
    checkInDate,
    lensSheetOpen,
    createChooserOpen,
    todayDateDetailOpen,
    createMode,
    showSettings,
  ]);

  const prevDepthRef = useRef(1);
  useEffect(() => {
    if (activeOverlayDepth > prevDepthRef.current) {
      window.history.pushState({ unsentDepth: activeOverlayDepth }, '');
    }
    prevDepthRef.current = activeOverlayDepth;
  }, [activeOverlayDepth]);

  useEffect(() => {
    const onPopState = () => {
      if (supportOpen) setSupportOpen(false);
      else if (welcomeOpen) setWelcomeOpen(false);
      else if (checkInDate) setCheckInDate(null);
      else if (lensSheetOpen) setLensSheetOpen(false);
      else if (todayDateDetailOpen) setTodayDateDetailOpen(false);
      else if (createChooserOpen) setCreateChooserOpen(false);
      else if (createMode !== null) setCreateMode(null);
      else if (showSettings) setShowSettings(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [
    supportOpen,
    welcomeOpen,
    checkInDate,
    lensSheetOpen,
    todayDateDetailOpen,
    createChooserOpen,
    createMode,
    showSettings,
  ]);

  const updatePrefs = useCallback((next: UserPreferences) => {
    setPrefs(next);
    void savePreferences(next);
  }, []);

  const createNewLetter = useCallback(
    (initialBody = '', options?: { signLens?: SignId; contextPrompt?: string }) => {
      const now = new Date().toISOString();
      const defaultDef = RECIPIENT_CATEGORIES[7]; // presentSelf
      const newLetter: LetterRecord = {
        id: crypto.randomUUID(),
        kind: 'letter',
        recipientCategory: defaultDef.category,
        recipientLabel: strings.recipients[defaultDef.category],
        salutation: defaultDef.defaultSalutation[prefs.language],
        contextPrompt: options?.contextPrompt,
        body: initialBody,
        paper: isDarkTheme ? 'moonlitInk' : 'oldParchment',
        sealed: false,
        favorite: false,
        linkedAlmanacDate: todayInfo.dateStr,
        signLens: options?.signLens,
        createdAt: now,
        updatedAt: now,
        revision: 1,
        syncStatus: 'local',
      };
      setActiveLetter(newLetter);
      setCreateMode('letter');
      setShowSettings(false);
      setCreateChooserOpen(false);
      setReleaseBanner(null);
      setSaveStatus(initialBody.trim() ? 'saving' : 'idle');

      if (initialBody.trim() && vaultKey) {
        void saveEncryptedItem(vaultKey, 'local', newLetter)
          .then((ok) => {
            setItems((prev) => [newLetter, ...prev]);
            setSaveStatus(ok ? 'saved' : 'error');
          })
          .catch(() => setSaveStatus('error'));
      }
    },
    [isDarkTheme, prefs.language, strings.recipients, todayInfo.dateStr, vaultKey]
  );

  const persistLetter = useCallback(
    (letter: LetterRecord) => {
      if (!vaultKey) {
        setSaveStatus('error');
        return;
      }
      setSaveStatus('saving');
      void saveEncryptedItem(vaultKey, 'local', letter)
        .then((ok) => setSaveStatus(ok ? 'saved' : 'error'))
        .catch(() => setSaveStatus('error'));
    },
    [vaultKey]
  );

  const handleLetterChange = useCallback(
    (updated: LetterRecord) => {
      setActiveLetter(updated);
      setItems((prev) => {
        const exists = prev.some((i) => i.id === updated.id);
        return exists ? prev.map((i) => (i.id === updated.id ? updated : i)) : [updated, ...prev];
      });
      persistLetter(updated);
    },
    [persistLetter]
  );

  const handleReleaseLetter = useCallback(
    async (id: string, visual: ReleaseVisual) => {
      await deleteEncryptedItem('local', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setActiveLetter(null);
      setCreateMode(null);
      const label = strings.editor.releaseVisuals[visual];
      setReleaseBanner(`${strings.editor.releaseDone} (${label})`);
    },
    [strings.editor.releaseDone, strings.editor.releaseVisuals]
  );

  const handleSaveCard = useCallback(
    async (card: FeelingCardRecord) => {
      setItems((prev) => [card, ...prev.filter((i) => i.id !== card.id)]);
      if (vaultKey) {
        await saveEncryptedItem(vaultKey, 'local', card);
      }
    },
    [vaultKey]
  );

  const handleSaveCheckIn = useCallback(
    async (dateStr: string, moodLabel: string, note: string) => {
      const checkIn: AlmanacCheckIn = {
        date: dateStr,
        moodLabel,
        note,
        updatedAt: new Date().toISOString(),
      };
      setCheckIns((prev) => [checkIn, ...prev.filter((c) => c.date !== checkIn.date)]);
      if (vaultKey) {
        await saveEncryptedCheckIn(vaultKey, 'local', checkIn);
      }
      triggerHaptic('success', prefs.hapticsEnabled);
    },
    [prefs.hapticsEnabled, vaultKey]
  );

  const handleUnlockPassphrase = async (passphrase: string) => {
    const { key, recoveryCode: code } = await unlockVaultWithPassphrase('local', passphrase);
    setVaultKey(key);
    setRecoveryCode(code);
    setVaultLocked(false);
    const [loadedItems, loadedCheckIns] = await Promise.all([
      loadAllEncryptedItems(key, 'local'),
      loadAllCheckIns(key, 'local'),
    ]);
    setItems(loadedItems);
    setCheckIns(loadedCheckIns);
  };

  const handleLockVault = () => {
    setVaultKey(null);
    setRecoveryCode(null);
    setItems([]);
    setCheckIns([]);
    setActiveLetter(null);
    setVaultLocked(true);
  };

  const handleEnablePassphrase = async (passphrase: string) => {
    if (!recoveryCode) throw new Error('Unlock vault first.');
    await enablePassphraseLock('local', recoveryCode, passphrase);
    setPassphraseEnabled(true);
  };

  const handleDisablePassphrase = async () => {
    if (!recoveryCode) return;
    await disablePassphraseLock('local', recoveryCode);
    setPassphraseEnabled(false);
  };

  const handleExportBackup = async () => {
    if (!vaultKey) return;
    const json = await exportEncryptedPortableBackup(vaultKey, 'local', items, checkIns);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unsent-encrypted-backup-${todayInfo.dateStr}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportBackup = async (code: string, jsonText: string) => {
    const restored = await importEncryptedPortableBackup(code, jsonText);
    if (vaultKey) {
      for (const item of restored.items) await saveEncryptedItem(vaultKey, 'local', item);
      for (const ci of restored.checkIns) await saveEncryptedCheckIn(vaultKey, 'local', ci);
      setItems(await loadAllEncryptedItems(vaultKey, 'local'));
      setCheckIns(await loadAllCheckIns(vaultKey, 'local'));
    }
  };

  const handleEraseLocal = async () => {
    await eraseAllLocalVaultData();
    const { key, recoveryCode: code } = await initializeOrLoadDeviceVault('local');
    setVaultKey(key);
    setRecoveryCode(code);
    setVaultLocked(false);
    setPassphraseEnabled(false);
    setItems([]);
    setCheckIns([]);
    setActiveLetter(null);
    setCreateMode(null);
    setQuickDraftText('');
    setPrefs(DEFAULT_PREFS);
  };

  const latestDraft = useMemo(
    () => items.find((i): i is LetterRecord => i.kind === 'letter' && !i.sealed),
    [items]
  );

  const navigateTab = (next: TabId) => {
    setShowSettings(false);
    setCreateMode(null);
    setTab(next);
  };

  const openEditorFromToday = () => {
    triggerHaptic('selection', prefs.hapticsEnabled);
    const text = quickDraftText;
    setQuickDraftText('');
    setTodayFocused(false);
    createNewLetter(text);
  };

  const restoreBoxScrollIfReturning = useCallback(() => {
    setCreateMode(null);
    if (tab === 'box') {
      requestAnimationFrame(() => {
        window.scrollTo(0, boxScrollYRef.current);
      });
    }
  }, [tab]);

  const chosenLensSign = useMemo(
    () => (prefs.zodiacProfile.chosenLens ? getSignById(prefs.zodiacProfile.chosenLens) : null),
    [prefs.zodiacProfile.chosenLens]
  );
  const chosenLensElement = chosenLensSign ? getElementForSign(chosenLensSign.id) : undefined;
  const hasPriorityTodayText =
    todayFocused || quickDraftText.length > 36 || /[\u0980-\u09FF\u0900-\u097F]/.test(quickDraftText);

  const localeTag = prefs.language === 'bn' ? 'bn' : prefs.language === 'hi' ? 'hi' : undefined;

  const formatShortWeekday = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(localeTag, { weekday: 'short', timeZone: 'UTC' }).format(
        new Date(`${dateStr}T12:00:00Z`)
      );
    } catch {
      return dateStr.slice(8, 10);
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(localeTag, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${dateStr}T12:00:00Z`));
    } catch {
      return dateStr;
    }
  };

  const selectedDateCheckIn = checkIns.find((c) => c.date === almanacDate);
  const selectedDateItems = items.filter((item) => item.linkedAlmanacDate === almanacDate);

  const navItems: Array<[TabId, string, React.ComponentType<{ className?: string }>]> = [
    ['today', strings.nav.today, Home],
    ['zodiac', strings.nav.zodiac, Compass],
    ['almanac', strings.nav.almanac, Calendar],
    ['box', strings.nav.box, Archive],
  ];

  return (
    <div className="min-h-dvh flex bg-[#F3F3F5] dark:bg-[#151617] text-[#19191B] dark:text-[#F3F1EC]">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="none"
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => setAudioPlaying(false)}
        onError={() => setAudioPlaying(false)}
      />

      {/* Cold-launch Signature Opening ("Unfold") */}
      <UnfoldOverlay
        active={unfoldActive}
        reducedMotion={prefs.reducedMotion}
        onComplete={handleUnfoldComplete}
      />

      {/* Desktop Left Navigation Rail */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between border-r border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] p-5 sticky top-0 h-dvh">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigateTab('today')}
            aria-label={strings.appName}
            className="flex flex-col items-start gap-1 text-left px-1 group"
          >
            <UnsentWordmark
              height={22}
              pulse={wordmarkPulse}
              className="text-[#19191B] dark:text-[#F3F1EC]"
            />
            <UnsentSwashArrow className="w-24 h-3 opacity-85 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection', prefs.hapticsEnabled);
              setCreateChooserOpen(true);
            }}
            className="pressable w-full min-h-[46px] px-4 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-bold inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{strings.nav.create}</span>
          </button>

          <nav className="space-y-1" aria-label="Primary navigation">
            {navItems.map(([id, label, Icon]) => {
              const active = !showSettings && createMode === null && tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigateTab(id)}
                  className={`w-full min-h-[44px] px-3 rounded-[12px] flex items-center gap-3 text-[15px] transition-colors ${
                    active
                      ? 'font-bold bg-[#F3F3F5] dark:bg-[#252729] text-[#19191B] dark:text-[#F3F1EC]'
                      : 'font-semibold text-[#59595F] dark:text-[#B3B4B1] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 stroke-[2.1]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={toggleAudio}
            aria-pressed={audioPlaying}
            aria-label={audioPlaying ? strings.settings.soundtrackPauseBtn : strings.settings.soundtrackPlayBtn}
            className={`w-full min-h-[44px] px-3 rounded-[12px] flex items-center justify-between gap-2 text-[14px] font-medium transition-colors ${
              audioPlaying
                ? 'bg-[#F3F3F5] dark:bg-[#252729] text-[#19191B] dark:text-[#F3F1EC]'
                : 'text-[#59595F] dark:text-[#B3B4B1] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
            }`}
          >
            <span className="inline-flex items-center gap-3 truncate">
              {audioPlaying ? (
                <Volume2 className="w-5 h-5 shrink-0 text-[#A63A32] dark:text-[#E07A73]" />
              ) : (
                <Music2 className="w-5 h-5 shrink-0" />
              )}
              <span className="truncate">
                {audioTrack === 'full' ? 'Krishna Full' : 'Krishna Flute'}
              </span>
            </span>
            {audioPlaying && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A63A32] dark:text-[#E07A73]">
                {strings.settings.soundtrackPlaying}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateMode(null);
              setShowSettings((v) => !v);
            }}
            className={`w-full min-h-[44px] px-3 rounded-[12px] flex items-center gap-3 text-[15px] font-medium transition-colors ${
              showSettings
                ? 'bg-[#F3F3F5] dark:bg-[#252729] text-[#19191B] dark:text-[#F3F1EC]'
                : 'text-[#59595F] dark:text-[#B3B4B1] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>{strings.nav.settings}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Scroll Surface */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 w-full px-5 sm:px-8 pt-safe pt-2 md:pt-8 pb-28 md:pb-12">
          {releaseBanner && (
            <div className="max-w-[740px] mx-auto mb-5 rounded-[14px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] px-4 py-3 text-[13px] flex items-center justify-between gap-4">
              <span>{releaseBanner}</span>
              <button type="button" onClick={() => setReleaseBanner(null)} className="underline">
                Dismiss
              </button>
            </div>
          )}

          {showSettings ? (
            <div className="space-y-4">
              <div className="max-w-[700px] mx-auto md:hidden">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="min-h-[44px] px-2 -ml-2 rounded-xl text-[15px] font-medium inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{strings.editor.back}</span>
                </button>
              </div>
              <SettingsSection
                prefs={prefs}
                strings={strings}
                recoveryCode={recoveryCode}
                passphraseEnabled={passphraseEnabled}
                cloudUserEmail={cloudUserEmail}
                onUpdatePrefs={updatePrefs}
                onEnablePassphrase={handleEnablePassphrase}
                onDisablePassphrase={handleDisablePassphrase}
                onExportEncryptedBackup={handleExportBackup}
                onImportEncryptedBackup={handleImportBackup}
                onEraseLocal={handleEraseLocal}
                onCloudUserChange={setCloudUserEmail}
                onOpenSupport={() => setSupportOpen(true)}
                onOpenWelcome={() => setWelcomeOpen(true)}
                audioPlaying={audioPlaying}
                audioTrack={audioTrack}
                onSelectAudioTrack={handleSelectAudioTrack}
                onToggleAudio={toggleAudio}
              />
            </div>
          ) : createMode === 'letter' && activeLetter ? (
            <LetterEditor
              letter={activeLetter}
              language={prefs.language}
              strings={strings}
              aiConsent={prefs.aiConsent}
              hapticsEnabled={prefs.hapticsEnabled}
              saveStatus={saveStatus}
              onChange={handleLetterChange}
              onRetrySave={() => persistLetter(activeLetter)}
              onBack={restoreBoxScrollIfReturning}
              onKeepInBox={(letter) => {
                persistLetter(letter);
                setCreateMode(null);
                setTab('box');
              }}
              onReleaseConfirm={handleReleaseLetter}
              onTurnIntoCard={(letter) => {
                setCardSeed({
                  id: undefined,
                  text: letter.body,
                  signId: letter.signLens,
                  recipient: letter.recipientLabel,
                  style: letter.paper,
                });
                setCreateMode('card');
              }}
              onOpenSupport={() => setSupportOpen(true)}
            />
          ) : createMode === 'card' ? (
            <div className="max-w-5xl mx-auto space-y-4">
              <button
                type="button"
                onClick={restoreBoxScrollIfReturning}
                className="min-h-[44px] px-2 -ml-2 rounded-xl text-[15px] font-medium inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{strings.editor.back}</span>
              </button>
              <FeelingCardStudio
                key={`${cardSeed.id ?? 'new'}-${cardSeed.style ?? 'default'}`}
                initialText={cardSeed.text}
                initialSignId={cardSeed.signId}
                initialRecipient={cardSeed.recipient}
                initialStyle={cardSeed.style}
                language={prefs.language}
                strings={strings}
                aiConsent={prefs.aiConsent}
                hapticsEnabled={prefs.hapticsEnabled}
                reducedMotion={prefs.reducedMotion}
                timeZone={prefs.timeZone}
                onSaveCard={handleSaveCard}
                onOpenSupport={() => setSupportOpen(true)}
              />
            </div>
          ) : tab === 'today' ? (
            /* TODAY SCREEN — Stoic-inspired minimalist paper & ink composition + single Astral 3D sculpture */
            <section className={isDesktopCompanion ? 'max-w-5xl mx-auto' : 'max-w-[740px] mx-auto'}>
              <div className={isDesktopCompanion ? 'grid lg:grid-cols-12 gap-7 items-start' : ''}>
                <div className={isDesktopCompanion ? 'lg:col-span-7 space-y-5' : 'space-y-5'}>
                  {/* 1. 52px Navigation Header: subtle clickable brand wordmark — bold centered Today — trailing Settings */}
                  <header className="h-[52px] grid grid-cols-[1fr_auto_1fr] items-center md:flex md:items-center md:justify-between">
                    <button
                      type="button"
                      onClick={() => setWelcomeOpen(true)}
                      aria-label={strings.settings.openWelcomeBtn}
                      className="justify-self-start min-h-[44px] min-w-[44px] -ml-1 px-1 flex items-center justify-start rounded-xl text-[#19191B] dark:text-[#F3F1EC] hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
                    >
                      <UnsentWordmark
                        height={13}
                        pulse={wordmarkPulse}
                        className="text-[#19191B] dark:text-[#F3F1EC]"
                      />
                    </button>
                    <h1 className="justify-self-center md:justify-self-start text-[19px] leading-[24px] font-bold tracking-tight md:text-[28px] md:leading-[34px] text-center md:text-left">
                      {strings.nav.today}
                    </h1>
                    <div className="justify-self-end flex items-center -mr-2 gap-0.5 md:hidden">
                      <button
                        type="button"
                        onClick={toggleAudio}
                        aria-pressed={audioPlaying}
                        aria-label={audioPlaying ? strings.settings.soundtrackPauseBtn : strings.settings.soundtrackPlayBtn}
                        className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#19191B] dark:text-[#F3F1EC] hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        {audioPlaying ? (
                          <>
                            <Volume2 className="w-5 h-5 stroke-[2.1] text-[#A63A32] dark:text-[#E07A73]" />
                            <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#A63A32] dark:bg-[#E07A73]" aria-hidden="true" />
                          </>
                        ) : (
                          <Music2 className="w-5 h-5 stroke-[2.1]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSettings(true)}
                        aria-label={strings.nav.settings}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#19191B] dark:text-[#F3F1EC] hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <Settings className="w-5 h-5 stroke-[2.1]" />
                      </button>
                    </div>
                  </header>

                  {/* 2. Seven-Day Calendar Strip */}
                  <div
                    className={`grid grid-cols-7 gap-1.5 ${
                      prefs.textSize === 'large' ? 'overflow-x-auto min-w-0' : ''
                    }`}
                    role="group"
                    aria-label="Current week"
                  >
                    {weekDates.map((dStr) => {
                      const selected = dStr === almanacDate;
                      const isToday = dStr === todayInfo.dateStr;
                      const hasEntry =
                        !vaultLocked &&
                        (checkIns.some((c) => c.date === dStr) ||
                          items.some((i) => i.linkedAlmanacDate === dStr));

                      return (
                        <button
                          key={dStr}
                          type="button"
                          onClick={() => {
                            setAlmanacDate(dStr);
                            setTodayDateDetailOpen(true);
                          }}
                          aria-label={formatFullDate(dStr)}
                          aria-pressed={selected}
                          className={`min-h-[56px] py-1.5 rounded-[14px] flex flex-col items-center justify-center gap-0.5 transition-colors border ${
                            selected
                              ? 'border-[#19191B] dark:border-[#EEEAE2] bg-[#FFFFFF] dark:bg-[#1D1F20]'
                              : 'border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <span className="text-[11px] leading-[14px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">
                            {formatShortWeekday(dStr)}
                          </span>
                          <span
                            className={`text-[15px] leading-[20px] tabular-nums ${
                              isToday || selected ? 'font-bold' : 'font-semibold'
                            }`}
                          >
                            {Number(dStr.slice(8, 10))}
                          </span>
                          <span
                            className={`w-1 h-1 rounded-full ${
                              hasEntry ? 'bg-[#19191B] dark:bg-[#EEEAE2]' : 'bg-transparent'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* 3. Ink Hero Writing Card with live editable field on left & 3D envelope/lens sculpture on right */}
                  <div className="relative rounded-[26px] bg-[#19191B] dark:bg-[#1D1F20] dark:border dark:border-[#363839] text-[#F3F1EC] p-5 sm:p-8 shadow-sm overflow-hidden">
                    <div className="flex items-stretch justify-between gap-3 relative z-10">
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-5">
                        <textarea
                          rows={3}
                          value={quickDraftText}
                          onFocus={() => setTodayFocused(true)}
                          onBlur={() => setTodayFocused(false)}
                          onChange={(e) => setQuickDraftText(e.target.value)}
                          placeholder={strings.today.inlineInvitation}
                          aria-label={strings.today.inlineInvitation}
                          className="w-full bg-transparent text-[#F3F1EC] placeholder:text-[#B3B4B1] text-[20px] sm:text-[23px] leading-[28px] font-bold tracking-tight resize-none focus:outline-none"
                        />

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={openEditorFromToday}
                            className="pressable min-h-[48px] px-5 sm:px-6 rounded-[12px] bg-[#EEEAE2] text-[#1A1B1C] text-[15px] font-bold inline-flex items-center gap-2"
                          >
                            <Feather className="w-4 h-4 stroke-[2.2]" />
                            <span>{strings.today.writeLetterCta}</span>
                          </button>

                          {!vaultLocked && latestDraft ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveLetter(latestDraft);
                                setCreateMode('letter');
                              }}
                              className="min-h-[44px] px-2 text-[14px] font-semibold text-[#B3B4B1] hover:text-[#F3F1EC] underline underline-offset-4"
                            >
                              {strings.today.resumeDraftCta}
                            </button>
                          ) : vaultLocked ? (
                            <button
                              type="button"
                              onClick={() => setTab('box')}
                              className="min-h-[44px] px-2 text-[13px] text-[#B3B4B1] hover:text-[#F3F1EC] inline-flex items-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{strings.today.lockedArchiveNote}</span>
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Single Today 3D artwork (only mounted on compact/mobile viewports; wide desktop renders companion card instead) */}
                      {!isDesktopCompanion && (
                        <div
                          className={`self-center shrink-0 transition-all duration-150 pointer-events-none ${
                            hasPriorityTodayText
                              ? 'w-[76px] h-[76px] opacity-25 scale-90'
                              : 'w-[86px] h-[86px] min-[375px]:w-[104px] min-[375px]:h-[104px] sm:w-[116px] sm:h-[116px] opacity-100 scale-100'
                          }`}
                        >
                          <AstralCanvas3D
                            mode={chosenLensElement ? 'element' : 'envelope'}
                            element={chosenLensElement}
                            paused={todayFocused}
                            reducedMotion={prefs.reducedMotion}
                            contactShadow={true}
                            className="w-full h-full"
                            ariaLabel={
                              chosenLensSign
                                ? `${chosenLensSign.westernName[prefs.language]} (${chosenLensElement}) sculpture`
                                : 'Folded ivory envelope'
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Secondary Prompt Card */}
                  <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD]/80 dark:border-[#363839] p-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[17px] leading-[24px] font-bold tracking-tight">{strings.today.secondaryPrompt}</p>
                    <button
                      type="button"
                      onClick={() => createNewLetter('', { contextPrompt: strings.today.secondaryPrompt })}
                      className="pressable min-h-[44px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[14px] font-semibold whitespace-nowrap"
                    >
                      {strings.today.useThisPrompt}
                    </button>
                  </div>
                </div>

                {/* Wide Desktop Companion Panel — avoids duplicate animated object by taking over Today's 3D instance */}
                {isDesktopCompanion && (
                  <aside className="lg:col-span-5 lg:mt-[68px] rounded-[26px] bg-[#19191B] dark:bg-[#1D1F20] dark:border dark:border-[#363839] text-[#F3F1EC] p-6 space-y-4">
                    <div className="h-[240px] w-full">
                      <AstralCanvas3D
                        mode={chosenLensElement ? 'element' : 'envelope'}
                        element={chosenLensElement}
                        paused={todayFocused}
                        reducedMotion={prefs.reducedMotion}
                        contactShadow={true}
                        className="w-full h-full"
                        ariaLabel={
                          chosenLensSign
                            ? `${chosenLensSign.westernName[prefs.language]} (${chosenLensElement}) sculpture`
                            : 'Folded ivory envelope'
                        }
                      />
                    </div>
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-semibold text-[#B3B4B1]">
                          {chosenLensSign ? strings.zodiac.lensPrefix : strings.appName}
                        </div>
                        <div className="text-[17px] font-bold tracking-tight mt-0.5">
                          {chosenLensSign
                            ? `${chosenLensSign.westernName[prefs.language]} · ${chosenLensSign.element[prefs.language]}`
                            : 'Folded Ivory Envelope'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLensSheetOpen(true)}
                        className="min-h-[38px] px-3 rounded-[10px] border border-white/20 text-[12px] font-semibold hover:bg-white/10"
                      >
                        {strings.zodiac.chooseLensBtn}
                      </button>
                    </div>
                  </aside>
                )}
              </div>
            </section>
          ) : tab === 'zodiac' ? (
            <ZodiacSection
              language={prefs.language}
              strings={strings}
              timeZone={prefs.timeZone}
              zodiacProfile={prefs.zodiacProfile}
              aiConsent={prefs.aiConsent}
              reducedMotion={prefs.reducedMotion}
              onUpdateProfile={(zodiacProfile) => updatePrefs({ ...prefs, zodiacProfile })}
              onStartLetterFromSign={(signId, spark) => {
                createNewLetter('', { signLens: signId, contextPrompt: spark });
              }}
              onMakeCardFromSign={(signId, text) => {
                setCardSeed({ id: undefined, text, signId });
                setCreateMode('card');
              }}
              onOpenSupport={() => setSupportOpen(true)}
              onOpenLensCalculator={() => setLensSheetOpen(true)}
            />
          ) : tab === 'almanac' ? (
            <AlmanacSection
              language={prefs.language}
              strings={strings}
              timeZone={prefs.timeZone}
              selectedDate={almanacDate}
              onSelectDate={setAlmanacDate}
              zodiacProfile={prefs.zodiacProfile}
              checkIns={vaultLocked ? [] : checkIns}
              linkedItems={vaultLocked ? [] : items}
              onOpenCheckIn={(dateStr) => setCheckInDate(dateStr)}
              onOpenLensCalculator={() => setLensSheetOpen(true)}
              onOpenItem={(item) => {
                if (item.kind === 'letter') {
                  setActiveLetter(item);
                  setCreateMode('letter');
                } else {
                  setCardSeed({
                    id: item.id,
                    text: item.text,
                    signId: item.signId,
                    recipient: item.recipientLabel,
                    style: item.style,
                  });
                  setCreateMode('card');
                }
              }}
            />
          ) : (
            <MyBoxSection
              language={prefs.language}
              strings={strings}
              locked={vaultLocked}
              loading={vaultLoading}
              storageError={vaultError}
              items={items}
              checkIns={checkIns}
              demoDismissed={prefs.demoDismissed}
              canLock={passphraseEnabled}
              onUnlockWithPassphrase={handleUnlockPassphrase}
              onLockVault={handleLockVault}
              onRetryLoad={loadVault}
              onStartWriting={() => createNewLetter('')}
              onOpenLetter={(letter) => {
                boxScrollYRef.current = window.scrollY;
                setActiveLetter(letter);
                setCreateMode('letter');
              }}
              onOpenCard={(card) => {
                boxScrollYRef.current = window.scrollY;
                setCardSeed({
                  id: card.id,
                  text: card.text,
                  signId: card.signId,
                  recipient: card.recipientLabel,
                  style: card.style,
                });
                setCreateMode('card');
              }}
              onDuplicateLetter={(letter) => {
                const now = new Date().toISOString();
                const copy: LetterRecord = {
                  ...letter,
                  id: crypto.randomUUID(),
                  sealed: false,
                  sealedAt: undefined,
                  createdAt: now,
                  updatedAt: now,
                  revision: 1,
                  syncStatus: 'local',
                };
                setActiveLetter(copy);
                setCreateMode('letter');
              }}
              onToggleFavorite={async (item) => {
                const next = { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString() };
                setItems((prev) => prev.map((i) => (i.id === item.id ? next : i)));
                if (vaultKey) await saveEncryptedItem(vaultKey, 'local', next);
              }}
              onDeleteItem={async (id) => {
                await deleteEncryptedItem('local', id);
                setItems((prev) => prev.filter((i) => i.id !== id));
              }}
              onDismissDemo={() => updatePrefs({ ...prefs, demoDismissed: true })}
              onRetrySync={async (item) => {
                if (!vaultKey) return;
                const ok = await saveEncryptedItem(vaultKey, 'local', {
                  ...item,
                  syncStatus: 'local',
                  updatedAt: new Date().toISOString(),
                });
                if (ok) {
                  setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, syncStatus: 'local' } : i))
                  );
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar: Today · Zodiac · (+ Create) · Almanac · My Box */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] dark:bg-[#1D1F20] border-t border-[#DADADD] dark:border-[#363839] pb-safe"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 items-center h-16 px-2">
          {navItems.slice(0, 2).map(([id, label, Icon]) => {
            const active = !showSettings && createMode === null && tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigateTab(id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active
                    ? 'font-bold text-[#19191B] dark:text-[#F3F1EC]'
                    : 'font-semibold text-[#59595F] dark:text-[#B3B4B1]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
                <span className="truncate max-w-[68px]">{label}</span>
              </button>
            );
          })}

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', prefs.hapticsEnabled);
                setCreateChooserOpen(true);
              }}
              aria-label={strings.nav.create}
              className="pressable w-12 h-12 rounded-full bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] flex items-center justify-center shadow-sm"
            >
              <Plus className="w-6 h-6 stroke-[2.4]" />
            </button>
          </div>

          {navItems.slice(2, 4).map(([id, label, Icon]) => {
            const active = !showSettings && createMode === null && tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigateTab(id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active
                    ? 'font-bold text-[#19191B] dark:text-[#F3F1EC]'
                    : 'font-semibold text-[#59595F] dark:text-[#B3B4B1]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
                <span className="truncate max-w-[68px]">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Compact Create Chooser Sheet */}
      <BottomSheet
        open={createChooserOpen}
        onClose={() => setCreateChooserOpen(false)}
        title={strings.createSheet.title}
        closeLabel={strings.createSheet.close}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => createNewLetter('')}
            className="pressable w-full rounded-[16px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] p-4 text-left flex items-start gap-3.5"
          >
            <Feather className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-[16px] font-medium">{strings.createSheet.writeLetterTitle}</div>
              <div className="text-[13px] opacity-80 mt-0.5">{strings.createSheet.writeLetterDesc}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCardSeed({});
              setCreateChooserOpen(false);
              setShowSettings(false);
              setCreateMode('card');
            }}
            className="pressable w-full rounded-[16px] border border-[#DADADD] dark:border-[#363839] p-4 text-left flex items-start gap-3.5"
          >
            <BookOpen className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-[16px] font-medium">{strings.createSheet.makeCardTitle}</div>
              <div className="text-[13px] text-[#59595F] dark:text-[#B3B4B1] mt-0.5">
                {strings.createSheet.makeCardDesc}
              </div>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Today Week Date Detail Sheet */}
      <BottomSheet
        open={todayDateDetailOpen}
        onClose={() => setTodayDateDetailOpen(false)}
        title={formatFullDate(almanacDate)}
      >
        <div className="space-y-4">
          <div className="rounded-[16px] bg-[#19191B] text-[#F3F1EC] p-4 flex items-center gap-3.5">
            <MonochromeMoonSvg phaseAngle={selectedDateMoon.phaseAngle} size={42} />
            <div>
              <div className="text-[16px] font-medium">{strings.moonPhases[selectedDateMoon.phaseKey]}</div>
              <div className="text-[12px] text-[#B3B4B1] tabular-nums">
                {selectedDateMoon.illumination}% · {prefs.timeZone}
              </div>
            </div>
          </div>

          {selectedDateCheckIn ? (
            <div className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] p-4 space-y-1">
              <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                {strings.almanac.yourWeatherLabel}
              </div>
              <div className="text-[15px] font-medium">{selectedDateCheckIn.moodLabel}</div>
              {selectedDateCheckIn.note && (
                <p className="text-[14px] text-[#59595F] dark:text-[#B3B4B1]">{selectedDateCheckIn.note}</p>
              )}
            </div>
          ) : selectedDateItems.length === 0 ? (
            <p className="text-[14px] text-[#59595F] dark:text-[#B3B4B1]">{strings.today.emptyDateState}</p>
          ) : null}

          {!vaultLocked && selectedDateItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                {strings.almanac.linkedEntriesLabel}
              </div>
              {selectedDateItems.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setTodayDateDetailOpen(false);
                    if (entry.kind === 'letter') {
                      setActiveLetter(entry);
                      setCreateMode('letter');
                    } else {
                      setCardSeed({
                        id: entry.id,
                        text: entry.text,
                        signId: entry.signId,
                        recipient: entry.recipientLabel,
                        style: entry.style,
                      });
                      setCreateMode('card');
                    }
                  }}
                  className="w-full text-left rounded-[12px] border border-[#DADADD] dark:border-[#363839] p-3 text-[14px] truncate"
                >
                  {entry.kind === 'letter' ? entry.salutation || entry.recipientLabel : strings.cards.title} ·{' '}
                  {(entry.kind === 'letter' ? entry.body : entry.text).slice(0, 48)}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setTodayDateDetailOpen(false);
                setCheckInDate(almanacDate);
              }}
              className="pressable flex-1 min-h-[44px] px-4 rounded-[12px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-medium"
            >
              {strings.today.checkInLink}
            </button>
            <button
              type="button"
              onClick={() => {
                setTodayDateDetailOpen(false);
                setShowSettings(false);
                setCreateMode(null);
                setTab('almanac');
              }}
              className="min-h-[44px] px-4 rounded-[12px] border border-[#DADADD] dark:border-[#363839] text-[14px]"
            >
              {strings.nav.almanac}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Optional Lens & Birth Sign Calculator Sheet */}
      <LensCalculatorSheet
        open={lensSheetOpen}
        onClose={() => setLensSheetOpen(false)}
        language={prefs.language}
        strings={strings}
        defaultTimeZone={prefs.timeZone}
        zodiacProfile={prefs.zodiacProfile}
        onUpdateProfile={(zodiacProfile) => updatePrefs({ ...prefs, zodiacProfile })}
      />

      {/* Optional Guided Mood Check-In Flow */}
      {checkInDate && (
        <MoodCheckInModal
          key={checkInDate}
          open={true}
          dateStr={checkInDate}
          initialMood={checkIns.find((c) => c.date === checkInDate)?.moodLabel}
          initialNote={checkIns.find((c) => c.date === checkInDate)?.note ?? ''}
          strings={strings}
          onSave={(mood, note) => {
            void handleSaveCheckIn(checkInDate, mood, note);
          }}
          onClose={() => setCheckInDate(null)}
        />
      )}

      {/* Optional Dismissible Welcome / Unfold Replay */}
      <WelcomeModal
        open={welcomeOpen}
        strings={strings}
        onStartWriting={() => {
          setWelcomeOpen(false);
          updatePrefs({ ...prefs, welcomeDismissed: true });
          createNewLetter('');
        }}
        onReplayOpening={() => {
          isInitialColdUnfoldRef.current = false;
          setWelcomeOpen(false);
          setWordmarkPulse(false);
          setUnfoldActive(true);
        }}
        onClose={() => setWelcomeOpen(false)}
      />

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} strings={strings} />
    </div>
  );
};

export default App;
