import React, { useMemo } from 'react';
import { Compass, HeartHandshake } from 'lucide-react';
import {
  calculateMoonPhaseForDate,
  getMonthMoonEvents,
} from '../../shared/astronomy.ts';
import type { TranslationStrings } from '../../shared/i18n.ts';
import type { AlmanacCheckIn, AppLanguage, ZodiacProfile } from '../../shared/types.ts';
import { getDailyPromptIndex, getSignById } from '../../shared/zodiacCatalog.ts';
import type { VaultItem } from '../lib/vaultDb.ts';
import { MonochromeMoonSvg, SmallMoonEventDot } from './MonochromeMarks.tsx';

interface AlmanacSectionProps {
  language: AppLanguage;
  strings: TranslationStrings;
  timeZone: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  zodiacProfile: ZodiacProfile;
  checkIns: AlmanacCheckIn[];
  linkedItems: VaultItem[];
  onOpenCheckIn: (date: string) => void;
  onOpenLensCalculator: () => void;
  onOpenItem: (item: VaultItem) => void;
}

export const AlmanacSection: React.FC<AlmanacSectionProps> = ({
  language,
  strings,
  timeZone,
  selectedDate,
  onSelectDate,
  zodiacProfile,
  checkIns,
  linkedItems,
  onOpenCheckIn,
  onOpenLensCalculator,
  onOpenItem,
}) => {
  const activeMoon = useMemo(() => calculateMoonPhaseForDate(selectedDate, timeZone), [selectedDate, timeZone]);
  const calYear = Number(selectedDate.slice(0, 4));
  const calMonth0 = Number(selectedDate.slice(5, 7)) - 1;
  const monthEvents = useMemo(() => getMonthMoonEvents(calYear, calMonth0, timeZone), [calYear, calMonth0, timeZone]);
  const daysInMonth = new Date(Date.UTC(calYear, calMonth0 + 1, 0)).getUTCDate();

  const existingCheckIn = checkIns.find((c) => c.date === selectedDate);
  const entriesOnDate = linkedItems.filter((item) => item.linkedAlmanacDate === selectedDate);

  const lensSign = getSignById(
    zodiacProfile.chosenLens ?? zodiacProfile.tropicalSunPacket?.signId ?? 'pisces'
  );
  const promptIdx = getDailyPromptIndex(lensSign.id, selectedDate, lensSign.prompts.length);
  const invitation = lensSign.prompts[promptIdx].spark[language];

  const formatUtcToViewer = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-tight">{strings.almanac.title}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLensCalculator}
            className="pressable min-h-[44px] px-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>{strings.almanac.calculateBirthBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCheckIn(selectedDate)}
            className="pressable min-h-[44px] px-3.5 rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[13px] font-bold inline-flex items-center gap-1.5"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{strings.almanac.recordFeelingBtn}</span>
          </button>
        </div>
      </div>

      {/* Distinct Lens / Western Sun / Vedic Moon Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[13px]">
        <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-3.5">
          <div className="text-[#59595F] dark:text-[#B3B4B1]">{strings.zodiac.lensPrefix}</div>
          <div className="font-medium mt-0.5">
            {zodiacProfile.chosenLens ? getSignById(zodiacProfile.chosenLens).westernName[language] : '—'}
          </div>
        </div>
        <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-3.5">
          <div className="text-[#59595F] dark:text-[#B3B4B1]">{strings.lens.sunResultLabel}</div>
          <div className="font-medium mt-0.5">
            {zodiacProfile.tropicalSunPacket?.signId
              ? getSignById(zodiacProfile.tropicalSunPacket.signId).westernName[language]
              : zodiacProfile.tropicalSunPacket?.status === 'ambiguous'
                ? 'Ambiguous'
                : '—'}
          </div>
        </div>
        <div className="rounded-[16px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-3.5">
          <div className="text-[#59595F] dark:text-[#B3B4B1]">{strings.lens.moonResultLabel}</div>
          <div className="font-medium mt-0.5">
            {zodiacProfile.vedicMoonPacket?.signId
              ? getSignById(zodiacProfile.vedicMoonPacket.signId).rashiName[language]
              : zodiacProfile.vedicMoonPacket
                ? strings.lens.awaitingTime
                : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Lunar Month Grid */}
        <div className="lg:col-span-7 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[16px] font-medium tabular-nums">
              {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone }).format(
                new Date(`${selectedDate}T12:00:00Z`)
              )}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              aria-label="Select almanac date"
              className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[13px] tabular-nums"
            />
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const dStr = `${calYear}-${String(calMonth0 + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const evt = monthEvents.find((e) => e.dateStr === dStr);
              const isSel = dStr === selectedDate;
              const hasCheckIn = checkIns.some((c) => c.date === dStr);
              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => onSelectDate(dStr)}
                  aria-label={dStr}
                  className={`min-h-[44px] rounded-[12px] p-1 flex flex-col items-center justify-center text-[13px] tabular-nums border transition-colors ${
                    isSel
                      ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent font-semibold'
                      : 'border-[#DADADD]/60 dark:border-[#363839]/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{dayNum}</span>
                  <span className="h-3 flex items-center justify-center mt-0.5">
                    {evt ? (
                      <SmallMoonEventDot event={evt.event} />
                    ) : hasCheckIn ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#DADADD] dark:border-[#363839] text-[13px]">
            <div>
              <div className="text-[#59595F] dark:text-[#B3B4B1]">{strings.almanac.nextNewMoon}</div>
              <div className="font-medium mt-0.5 tabular-nums">{formatUtcToViewer(activeMoon.nextNewMoonUtc)}</div>
            </div>
            <div>
              <div className="text-[#59595F] dark:text-[#B3B4B1]">{strings.almanac.nextFullMoon}</div>
              <div className="font-medium mt-0.5 tabular-nums">{formatUtcToViewer(activeMoon.nextFullMoonUtc)}</div>
            </div>
          </div>
        </div>

        {/* Date Detail */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[18px] bg-[#19191B] text-[#F3F1EC] p-5 space-y-4">
            <div className="flex items-center gap-4">
              <MonochromeMoonSvg phaseAngle={activeMoon.phaseAngle} size={52} />
              <div>
                <div className="text-[12px] text-[#B3B4B1] tabular-nums">
                  {strings.almanac.skyFactLabel} · {selectedDate}
                </div>
                <div className="text-[21px] font-bold tracking-tight mt-0.5">
                  {strings.moonPhases[activeMoon.phaseKey]}
                </div>
                <div className="text-[12px] text-[#B3B4B1] tabular-nums">
                  {activeMoon.illumination}% · {activeMoon.phaseAngle}° ({timeZone})
                </div>
              </div>
            </div>
            <div className="border-t border-[#363839] pt-3 space-y-1">
              <div className="text-[12px] text-[#B3B4B1]">{strings.almanac.writingInvitationLabel}</div>
              <p className="text-[15px] leading-[22px]">{invitation}</p>
            </div>
          </div>

          <div className="rounded-[18px] bg-[#FFFFFF] dark:bg-[#1D1F20] border border-[#DADADD] dark:border-[#363839] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#59595F] dark:text-[#B3B4B1]">{strings.almanac.yourWeatherLabel}</span>
              <button
                type="button"
                onClick={() => onOpenCheckIn(selectedDate)}
                className="text-[13px] font-medium underline"
              >
                {existingCheckIn ? 'Edit' : 'Add'}
              </button>
            </div>
            {existingCheckIn ? (
              <div className="space-y-1">
                <div className="text-[15px] font-medium">{existingCheckIn.moodLabel}</div>
                {existingCheckIn.note && (
                  <p className="text-[14px] text-[#59595F] dark:text-[#B3B4B1]">{existingCheckIn.note}</p>
                )}
              </div>
            ) : (
              <p className="text-[14px] text-[#59595F] dark:text-[#B3B4B1]">{strings.today.emptyDateState}</p>
            )}

            {entriesOnDate.length > 0 && (
              <div className="pt-3 border-t border-[#DADADD] dark:border-[#363839] space-y-1.5">
                <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                  {strings.almanac.linkedEntriesLabel}
                </div>
                {entriesOnDate.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenItem(entry)}
                    className="w-full text-left py-1.5 text-[14px] truncate hover:underline"
                  >
                    {entry.kind === 'letter' ? entry.recipientLabel : 'Feeling card'} ·{' '}
                    {(entry.kind === 'letter' ? entry.body : entry.text).slice(0, 48)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
