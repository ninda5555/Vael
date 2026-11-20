import React, { useState } from 'react';
import { ChevronRight, Download, HeartHandshake, KeyRound, Music2, ShieldAlert, Trash2, Upload, Volume2 } from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import type { AppLanguage, TextSize, ThemeMode, UserPreferences } from '../../shared/types.ts';
import { getCloudConnection, signInWithGoogle, signOutCloud } from '../lib/firebaseSync.ts';
import { triggerHaptic } from '../lib/motion.ts';

interface SettingsSectionProps {
  prefs: UserPreferences;
  strings: TranslationStrings;
  recoveryCode: string | null;
  passphraseEnabled: boolean;
  cloudUserEmail: string | null;
  onUpdatePrefs: (next: UserPreferences) => void;
  onEnablePassphrase: (passphrase: string) => Promise<void>;
  onDisablePassphrase: () => Promise<void>;
  onExportEncryptedBackup: () => Promise<void>;
  onImportEncryptedBackup: (code: string, jsonText: string) => Promise<void>;
  onEraseLocal: () => Promise<void>;
  onCloudUserChange: (email: string | null) => void;
  onOpenSupport: () => void;
  onOpenWelcome: () => void;
  audioPlaying: boolean;
  audioTrack: 'short' | 'full';
  onSelectAudioTrack: (track: 'short' | 'full') => void;
  onToggleAudio: () => void;
}

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dhaka',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
];

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  prefs,
  strings,
  recoveryCode,
  passphraseEnabled,
  cloudUserEmail,
  onUpdatePrefs,
  onEnablePassphrase,
  onDisablePassphrase,
  onExportEncryptedBackup,
  onImportEncryptedBackup,
  onEraseLocal,
  onCloudUserChange,
  onOpenSupport,
  onOpenWelcome,
  audioPlaying,
  audioTrack,
  onSelectAudioTrack,
  onToggleAudio,
}) => {
  const [newPassphrase, setNewPassphrase] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);

  const cloud = getCloudConnection();

  const handleSetPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    try {
      await onEnablePassphrase(newPassphrase);
      setNewPassphrase('');
      setStatusMessage('Passphrase lock enabled for My Box.');
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'Unable to enable lock.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await onImportEncryptedBackup(restoreCode.trim() || recoveryCode || '', text);
      setStatusMessage('Encrypted backup restored into My Box.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Restore failed—check your recovery key.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      onCloudUserChange(user.email ?? user.uid);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Cloud sign-in unavailable.');
    }
  };

  return (
    <section className="max-w-[700px] mx-auto space-y-6">
      <h1 className="text-[28px] leading-[34px] font-bold tracking-tight">{strings.settings.title}</h1>

      {statusMessage && (
        <div
          role="status"
          className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] bg-[#FFFFFF] dark:bg-[#1D1F20] px-4 py-3 text-[13px]"
        >
          {statusMessage}
        </div>
      )}

      {/* Group 1: Appearance & language */}
      <div className="space-y-2">
        <div className="px-1 text-[13px] font-semibold text-[#59595F] dark:text-[#B3B4B1]">
          {strings.settings.appearanceGroup}
        </div>
        <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] divide-y divide-[#DADADD] dark:divide-[#363839]">
          {/* Theme */}
          <div className="p-4 space-y-2.5">
            <div className="text-[15px] font-medium">{strings.settings.themeLabel}</div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['paper', strings.settings.paperTheme],
                  ['ink', strings.settings.inkTheme],
                  ['system', strings.settings.systemTheme],
                ] as Array<[ThemeMode, string]>
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, theme: mode })}
                  className={`min-h-[42px] px-3 rounded-[10px] border text-[13px] font-medium transition-colors ${
                    prefs.theme === mode
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="p-4 space-y-2.5">
            <div className="text-[15px] font-medium">{strings.settings.languageLabel}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ['en', 'English'],
                  ['bn', 'বাংলা'],
                  ['hi', 'हिन्दी'],
                  ['hinglish', 'Hinglish'],
                ] as Array<[AppLanguage, string]>
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, language: code })}
                  className={`min-h-[42px] px-3 rounded-[10px] border text-[13px] font-medium ${
                    prefs.language === code
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Text size */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-medium">{strings.settings.textSizeLabel}</span>
            <div className="flex gap-2">
              {(
                [
                  ['normal', strings.settings.normalSize],
                  ['large', strings.settings.largeSize],
                ] as Array<[TextSize, string]>
              ).map(([sz, label]) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, textSize: sz })}
                  className={`min-h-[40px] px-3.5 rounded-[10px] border text-[13px] font-medium ${
                    prefs.textSize === sz
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce motion */}
          <label className="p-4 flex items-center justify-between gap-4 min-h-[52px] cursor-pointer">
            <span className="text-[15px]">{strings.settings.reducedMotionLabel}</span>
            <input
              type="checkbox"
              checked={prefs.reducedMotion}
              onChange={(e) => onUpdatePrefs({ ...prefs, reducedMotion: e.target.checked })}
              className="w-5 h-5 accent-[#19191B] dark:accent-[#EEEAE2]"
            />
          </label>

          {/* Subtle haptics */}
          <label className="p-4 flex items-center justify-between gap-4 min-h-[52px] cursor-pointer">
            <span className="text-[15px]">{strings.settings.hapticsLabel}</span>
            <input
              type="checkbox"
              checked={prefs.hapticsEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                onUpdatePrefs({ ...prefs, hapticsEnabled: enabled });
                if (enabled) triggerHaptic('selection', true);
              }}
              className="w-5 h-5 accent-[#19191B] dark:accent-[#EEEAE2]"
            />
          </label>

          {/* Timezone */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px]">{strings.settings.timeZoneLabel}</span>
            <select
              value={prefs.timeZone}
              onChange={(e) => onUpdatePrefs({ ...prefs, timeZone: e.target.value })}
              aria-label={strings.settings.timeZoneLabel}
              className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} className="text-black">
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Ambient soundtrack (Flute Cut 1:45 or Full Song 6:06) */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {audioPlaying ? (
                  <Volume2 className="w-4 h-4 shrink-0 text-[#A63A32] dark:text-[#E07A73]" />
                ) : (
                  <Music2 className="w-4 h-4 shrink-0 text-[#59595F] dark:text-[#B3B4B1]" />
                )}
                <span className="text-[15px] font-medium truncate">{strings.settings.soundtrackLabel}</span>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                aria-pressed={audioPlaying}
                className={`min-h-[40px] px-3.5 rounded-[10px] border text-[13px] font-semibold transition-colors shrink-0 ${
                  audioPlaying
                    ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                    : 'border-[#DADADD] dark:border-[#363839]'
                }`}
              >
                {audioPlaying ? strings.settings.soundtrackPlaying : strings.settings.soundtrackPlayBtn}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['short', strings.settings.soundtrackShort],
                  ['full', strings.settings.soundtrackFull],
                ] as Array<['short' | 'full', string]>
              ).map(([trackId, label]) => (
                <button
                  key={trackId}
                  type="button"
                  onClick={() => onSelectAudioTrack(trackId)}
                  className={`min-h-[40px] px-3 rounded-[10px] border text-[13px] font-medium transition-colors ${
                    audioTrack === trackId
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                      : 'border-[#DADADD] dark:border-[#363839]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Replay welcome / opening */}
          <button
            type="button"
            onClick={onOpenWelcome}
            className="w-full p-4 min-h-[52px] flex items-center justify-between text-[15px] text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            <span>{strings.settings.openWelcomeBtn}</span>
            <ChevronRight className="w-4 h-4 text-[#59595F] dark:text-[#B3B4B1]" />
          </button>
        </div>
      </div>

      {/* Group 2: Privacy & lock */}
      <div className="space-y-2">
        <div className="px-1 text-[13px] font-medium text-[#59595F] dark:text-[#B3B4B1]">
          {strings.settings.privacyGroup}
        </div>
        <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] divide-y divide-[#DADADD] dark:divide-[#363839]">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-[15px] font-medium">
              <KeyRound className="w-4 h-4" />
              <span>{strings.settings.vaultLockToggle}</span>
            </div>
            {!passphraseEnabled ? (
              <form onSubmit={handleSetPassphrase} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  placeholder={strings.settings.passphrasePlaceholder}
                  className="flex-1 min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-[10px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[13px] font-medium"
                >
                  Enable lock
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">
                  Passphrase lock active (PBKDF2-SHA-256 + AES-256-GCM).
                </span>
                <button
                  type="button"
                  onClick={onDisablePassphrase}
                  className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[13px]"
                >
                  Remove lock
                </button>
              </div>
            )}
            {passError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{passError}</p>}
          </div>

          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[15px]">{strings.settings.recoveryKeyTitle}</span>
              <button
                type="button"
                onClick={() => setShowRecovery((v) => !v)}
                className="text-[13px] font-medium underline"
              >
                {showRecovery ? 'Hide key' : 'Reveal key'}
              </button>
            </div>
            {showRecovery && recoveryCode && (
              <div className="rounded-[12px] bg-[#F3F3F5] dark:bg-[#151617] p-3 font-mono text-[12px] break-all select-all">
                {recoveryCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group 3: Backup & recovery */}
      <div className="space-y-2">
        <div className="px-1 text-[13px] font-medium text-[#59595F] dark:text-[#B3B4B1]">
          {strings.settings.backupGroup}
        </div>
        <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] divide-y divide-[#DADADD] dark:divide-[#363839]">
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportEncryptedBackup}
                className="min-h-[44px] px-4 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[13px] font-medium inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {strings.settings.exportBackupBtn}
              </button>

              <label className="min-h-[44px] px-4 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{strings.settings.restoreFromKey}</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="sr-only" />
              </label>
            </div>

            <input
              type="text"
              value={restoreCode}
              onChange={(e) => setRestoreCode(e.target.value)}
              placeholder="Optional: paste 43-char recovery key before restoring from another device"
              className="w-full min-h-[42px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[13px]"
            />
          </div>

          {/* Destructive action separated cleanly */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] text-[#59595F] dark:text-[#B3B4B1]">
              <ShieldAlert className="w-4 h-4 text-[#A63A32] dark:text-[#E07A73] shrink-0" />
              <span>Clears encrypted browser storage on this device.</span>
            </div>
            {!confirmErase ? (
              <button
                type="button"
                onClick={() => setConfirmErase(true)}
                className="min-h-[42px] px-3.5 rounded-[10px] border border-[#A63A32]/50 text-[#A63A32] dark:text-[#E07A73] text-[13px] font-medium inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {strings.settings.eraseLocalBtn}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmErase(false)}
                  className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onEraseLocal();
                    setConfirmErase(false);
                    setStatusMessage('All local vault data erased.');
                  }}
                  className="min-h-[40px] px-3.5 rounded-[10px] bg-[#A63A32] text-white text-[13px] font-medium"
                >
                  Confirm erase
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group 4: Account & support */}
      <div className="space-y-2">
        <div className="px-1 text-[13px] font-medium text-[#59595F] dark:text-[#B3B4B1]">
          {strings.settings.accountGroup}
        </div>
        <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] divide-y divide-[#DADADD] dark:divide-[#363839]">
          <label className="p-4 flex items-start justify-between gap-4 cursor-pointer">
            <div className="space-y-0.5">
              <div className="text-[15px] font-medium">{strings.settings.aiConsentLabel}</div>
              <div className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{strings.settings.aiConsentDesc}</div>
            </div>
            <input
              type="checkbox"
              checked={prefs.aiConsent}
              onChange={(e) => onUpdatePrefs({ ...prefs, aiConsent: e.target.checked })}
              className="w-5 h-5 mt-0.5 accent-[#19191B] dark:accent-[#EEEAE2]"
            />
          </label>

          <div className="p-4 space-y-2.5">
            <p className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{strings.settings.cloudSyncNote}</p>
            {cloud.configured ? (
              cloudUserEmail ? (
                <div className="flex items-center justify-between text-[14px]">
                  <span>Signed in: {cloudUserEmail}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOutCloud();
                      onCloudUserChange(null);
                    }}
                    className="underline text-[13px]"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="min-h-[44px] px-4 rounded-[10px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[13px] font-medium"
                >
                  Sign in with Google for encrypted cloud backup
                </button>
              )
            ) : (
              <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                Cloud backup activates when Firebase Web configuration is present.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenSupport}
            className="w-full p-4 min-h-[52px] flex items-center justify-between text-[15px] text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            <span className="inline-flex items-center gap-2 text-[#A63A32] dark:text-[#E07A73] font-medium">
              <HeartHandshake className="w-4 h-4" />
              {strings.settings.findSupportBtn}
            </span>
            <ChevronRight className="w-4 h-4 text-[#59595F] dark:text-[#B3B4B1]" />
          </button>
        </div>
      </div>
    </section>
  );
};
