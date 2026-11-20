import React, { useState } from 'react';
import { Check, Compass, HelpCircle } from 'lucide-react';
import {
  BUNDLED_CITIES,
  calculateTropicalSun,
  MAX_SUPPORTED_YEAR,
  MIN_SUPPORTED_YEAR,
} from '../../shared/astronomy.ts';
import type { TranslationStrings } from '../../shared/i18n.ts';
import type { AppLanguage, BirthInput, FactPacket, SignId, ZodiacProfile } from '../../shared/types.ts';
import { getSignById, ZODIAC_SIGNS } from '../../shared/zodiacCatalog.ts';
import { BottomSheet } from './BottomSheet.tsx';
import { ZodiacLineMark } from './MonochromeMarks.tsx';

interface LensCalculatorSheetProps {
  open: boolean;
  onClose: () => void;
  language: AppLanguage;
  strings: TranslationStrings;
  defaultTimeZone: string;
  zodiacProfile: ZodiacProfile;
  onUpdateProfile: (next: ZodiacProfile) => void;
}

export const LensCalculatorSheet: React.FC<LensCalculatorSheetProps> = ({
  open,
  onClose,
  language,
  strings,
  defaultTimeZone,
  zodiacProfile,
  onUpdateProfile,
}) => {
  const [mode, setMode] = useState<'manual' | 'birth'>('manual');
  const [birthDate, setBirthDate] = useState('1996-03-04');
  const [timeKnown, setTimeKnown] = useState<'exact' | 'approximate' | 'unknown'>('unknown');
  const [birthTime, setBirthTime] = useState('12:00');
  const [approxWindow, setApproxWindow] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [cityId, setCityId] = useState(BUNDLED_CITIES[2].id); // Kolkata default
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState('22.5726');
  const [manualLon, setManualLon] = useState('88.3639');
  const [manualTz, setManualTz] = useState(defaultTimeZone || 'Asia/Kolkata');
  const [includeVedicServer, setIncludeVedicServer] = useState(false);

  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [pendingOverlapInput, setPendingOverlapInput] = useState<{
    input: BirthInput;
    lat: number;
    lon: number;
  } | null>(null);

  const runCalculation = async (overlapResolution?: 'earlier' | 'later') => {
    setCalcError(null);
    const selectedCity = BUNDLED_CITIES.find((c) => c.id === cityId) ?? BUNDLED_CITIES[2];
    const lat = useManualCoords ? Number(manualLat) : selectedCity.lat;
    const lon = useManualCoords ? Number(manualLon) : selectedCity.lon;
    const timeZone = useManualCoords ? manualTz.trim() || defaultTimeZone : selectedCity.timeZone;

    const input: BirthInput = {
      date: birthDate,
      timeKnown,
      time: timeKnown === 'exact' ? birthTime : undefined,
      approximateWindow: timeKnown === 'approximate' ? approxWindow : undefined,
      cityId: useManualCoords ? undefined : selectedCity.id,
      customLat: useManualCoords ? lat : undefined,
      customLon: useManualCoords ? lon : undefined,
      timeZone,
      overlapResolution,
    };

    if (!includeVedicServer || timeKnown !== 'exact') {
      const tropicalSun = calculateTropicalSun(input);
      let vedicMoon: FactPacket | undefined = zodiacProfile.vedicMoonPacket;
      if (timeKnown !== 'exact') {
        vedicMoon = {
          schemaVersion: 1,
          calculationKind: 'vedic_moon',
          status: 'ambiguous',
          source: 'Astronomy Engine / Lahiri guard',
          sourceVersion: '1.0',
          body: 'Moon',
          zodiacSystem: 'sidereal_lahiri',
          ayanamsa: 'Lahiri',
          precision: 'date_only_verified',
          note: strings.lens.undetermined,
        };
      }

      if (
        tropicalSun.status === 'ambiguous' &&
        tropicalSun.note?.includes('Clock change overlap') &&
        !overlapResolution
      ) {
        setPendingOverlapInput({ input, lat, lon });
      } else {
        setPendingOverlapInput(null);
      }

      onUpdateProfile({
        ...zodiacProfile,
        tropicalSunPacket: tropicalSun,
        vedicMoonPacket: vedicMoon,
      });
      return;
    }

    setCalculating(true);
    try {
      const resp = await fetch('/api/zodiac/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, lat, lon, includeVedic: true }),
      });
      const data = (await resp.json()) as {
        tropicalSun?: FactPacket;
        vedicMoon?: FactPacket;
        error?: string;
      };
      if (!resp.ok || !data.tropicalSun) {
        const localSun = calculateTropicalSun(input);
        onUpdateProfile({ ...zodiacProfile, tropicalSunPacket: localSun });
        setCalcError(data.error || 'Server Vedic calculation unavailable; computed Tropical Sun locally.');
      } else {
        if (
          data.tropicalSun.status === 'ambiguous' &&
          data.tropicalSun.note?.includes('Clock change overlap') &&
          !overlapResolution
        ) {
          setPendingOverlapInput({ input, lat, lon });
        } else {
          setPendingOverlapInput(null);
        }
        onUpdateProfile({
          ...zodiacProfile,
          tropicalSunPacket: data.tropicalSun,
          vedicMoonPacket: data.vedicMoon,
        });
      }
    } catch {
      const localSun = calculateTropicalSun(input);
      onUpdateProfile({ ...zodiacProfile, tropicalSunPacket: localSun });
      setCalcError('Server unreachable; computed Tropical Sun locally.');
    } finally {
      setCalculating(false);
    }
  };

  const sunPacket = zodiacProfile.tropicalSunPacket;
  const moonPacket = zodiacProfile.vedicMoonPacket;

  return (
    <BottomSheet open={open} onClose={onClose} title={strings.lens.title}>
      <div className="space-y-4">
        <p className="text-[13px] leading-[18px] text-[#59595F] dark:text-[#B3B4B1]">{strings.lens.subtitle}</p>

        {/* Mode Switch */}
        <div className="grid grid-cols-2 gap-1.5 rounded-[12px] bg-[#F3F3F5] dark:bg-[#151617] p-1">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`min-h-[40px] rounded-[10px] text-[13px] font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-[#FFFFFF] dark:bg-[#252729] text-[#19191B] dark:text-[#F3F1EC] shadow-xs'
                : 'text-[#59595F] dark:text-[#B3B4B1]'
            }`}
          >
            {strings.lens.manualTab}
          </button>
          <button
            type="button"
            onClick={() => setMode('birth')}
            className={`min-h-[40px] rounded-[10px] text-[13px] font-medium transition-colors ${
              mode === 'birth'
                ? 'bg-[#FFFFFF] dark:bg-[#252729] text-[#19191B] dark:text-[#F3F1EC] shadow-xs'
                : 'text-[#59595F] dark:text-[#B3B4B1]'
            }`}
          >
            {strings.lens.birthTab}
          </button>
        </div>

        {mode === 'manual' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {ZODIAC_SIGNS.map((sign) => {
                const selected = zodiacProfile.chosenLens === sign.id;
                return (
                  <button
                    key={sign.id}
                    type="button"
                    onClick={() => {
                      onUpdateProfile({
                        ...zodiacProfile,
                        chosenLens: selected ? undefined : sign.id,
                      });
                    }}
                    className={`min-h-[52px] px-3 py-2 rounded-[12px] border text-left flex items-center gap-2.5 ${
                      selected
                        ? 'bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                        : 'border-[#DADADD] dark:border-[#363839]'
                    }`}
                  >
                    <ZodiacLineMark signId={sign.id} size={22} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium truncate">{sign.westernName[language]}</div>
                      <div className="text-[11px] opacity-75 truncate">{sign.rashiName[language]}</div>
                    </div>
                    {selected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateProfile({ ...zodiacProfile, chosenLens: undefined });
                  onClose();
                }}
                className="min-h-[44px] px-3 rounded-[10px] text-[13px] text-[#59595F] dark:text-[#B3B4B1] hover:underline"
              >
                {strings.lens.skipLens}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 rounded-[10px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[14px] font-medium"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium">{strings.lens.birthDate}</span>
              <input
                type="date"
                min={`${MIN_SUPPORTED_YEAR}-01-01`}
                max={`${MAX_SUPPORTED_YEAR}-12-31`}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[15px] tabular-nums"
              />
            </label>

            <div className="space-y-2">
              <div className="text-[13px] font-medium">{strings.lens.birthTimeKnown}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    ['exact', strings.lens.exactTime],
                    ['approximate', strings.lens.approxTime],
                    ['unknown', strings.lens.unknownTime],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTimeKnown(key)}
                    className={`min-h-[44px] px-3 py-2 rounded-[10px] border text-[12px] font-medium ${
                      timeKnown === key
                        ? 'bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] border-transparent'
                        : 'border-[#DADADD] dark:border-[#363839]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {timeKnown === 'exact' && (
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                aria-label={strings.lens.exactTime}
                className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[15px] tabular-nums"
              />
            )}

            {timeKnown === 'approximate' && (
              <select
                value={approxWindow}
                onChange={(e) => setApproxWindow(e.target.value as typeof approxWindow)}
                className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px]"
              >
                <option value="morning" className="text-black">
                  Morning (05:00–11:59)
                </option>
                <option value="afternoon" className="text-black">
                  Afternoon (12:00–16:59)
                </option>
                <option value="evening" className="text-black">
                  Evening (17:00–20:59)
                </option>
                <option value="night" className="text-black">
                  Night (21:00–23:59)
                </option>
              </select>
            )}

            <div className="space-y-2">
              <label className="block space-y-1">
                <span className="text-[13px] font-medium">{strings.lens.cityLabel}</span>
                <select
                  disabled={useManualCoords}
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[14px] disabled:opacity-50"
                >
                  {BUNDLED_CITIES.map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.name}, {c.region}, {c.country} ({c.timeZone})
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 min-h-[40px] text-[13px]">
                <input
                  type="checkbox"
                  checked={useManualCoords}
                  onChange={(e) => setUseManualCoords(e.target.checked)}
                />
                <span>{strings.lens.manualCoordsOption}</span>
              </label>

              {useManualCoords && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="Lat"
                    aria-label="Latitude"
                    className="min-h-[42px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[13px] tabular-nums"
                  />
                  <input
                    type="text"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="Lon"
                    aria-label="Longitude"
                    className="min-h-[42px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[13px] tabular-nums"
                  />
                  <input
                    type="text"
                    value={manualTz}
                    onChange={(e) => setManualTz(e.target.value)}
                    placeholder="Asia/Kolkata"
                    aria-label={strings.lens.timeZoneLabel}
                    className="min-h-[42px] px-2.5 rounded-[10px] border border-[#DADADD] dark:border-[#363839] bg-transparent text-[13px]"
                  />
                </div>
              )}
            </div>

            {/* Consent & Privacy Disclosure right beside the server-sending option */}
            <div className="rounded-[14px] bg-[#F3F3F5] dark:bg-[#151617] p-3.5 space-y-2">
              <div className="text-[12px] font-medium flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{strings.lens.disclosureTitle}</span>
              </div>
              <p className="text-[12px] leading-[17px] text-[#59595F] dark:text-[#B3B4B1]">
                {strings.lens.disclosureBody}
              </p>
              {timeKnown === 'exact' && (
                <label className="flex items-center gap-2 pt-1 text-[13px]">
                  <input
                    type="checkbox"
                    checked={includeVedicServer}
                    onChange={(e) => setIncludeVedicServer(e.target.checked)}
                  />
                  <span>Request Vedic Moon (Lahiri) from server adapter</span>
                </label>
              )}
            </div>

            <button
              type="button"
              disabled={calculating}
              onClick={() => runCalculation()}
              className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-white dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-medium inline-flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{calculating ? '…' : strings.lens.calculateBtn}</span>
            </button>

            {pendingOverlapInput && (
              <div className="rounded-[14px] border border-[#A63A32]/40 p-3.5 space-y-2 text-[13px]">
                <p>{strings.lens.ambiguousOverlapPrompt}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => runCalculation('earlier')}
                    className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[12px] font-medium"
                  >
                    {strings.lens.earlierOffset}
                  </button>
                  <button
                    type="button"
                    onClick={() => runCalculation('later')}
                    className="min-h-[40px] px-3 rounded-[10px] border border-[#DADADD] dark:border-[#363839] text-[12px] font-medium"
                  >
                    {strings.lens.laterOffset}
                  </button>
                </div>
              </div>
            )}

            {calcError && <p className="text-[13px] text-[#A63A32] dark:text-[#E07A73]">{calcError}</p>}

            {/* Results */}
            {(sunPacket || moonPacket) && (
              <div className="space-y-2.5 pt-2 border-t border-[#DADADD] dark:border-[#363839]">
                {sunPacket && (
                  <div className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                        {strings.lens.sunResultLabel}
                      </span>
                      {sunPacket.signId && (
                        <button
                          type="button"
                          onClick={() => onUpdateProfile({ ...zodiacProfile, chosenLens: sunPacket.signId })}
                          className="text-[12px] font-medium underline"
                        >
                          {strings.lens.saveLens}
                        </button>
                      )}
                    </div>
                    <div className="text-[15px] font-medium">
                      {sunPacket.signId
                        ? `${getSignById(sunPacket.signId).westernName[language]} (${sunPacket.degrees ?? '—'}°)`
                        : sunPacket.candidateSignIds?.map((id) => getSignById(id).westernName[language]).join(' / ') ||
                          'Ambiguous'}
                    </div>
                    <div className="text-[11px] text-[#59595F] dark:text-[#B3B4B1]">
                      {sunPacket.source} · {sunPacket.precision}
                    </div>
                  </div>
                )}

                {moonPacket && (
                  <div className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                        {strings.lens.moonResultLabel}
                      </span>
                      {moonPacket.signId && (
                        <button
                          type="button"
                          onClick={() => onUpdateProfile({ ...zodiacProfile, chosenLens: moonPacket.signId })}
                          className="text-[12px] font-medium underline"
                        >
                          {strings.lens.saveLens}
                        </button>
                      )}
                    </div>
                    {moonPacket.signId ? (
                      <div className="text-[15px] font-medium">
                        {getSignById(moonPacket.signId).rashiName[language]}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[13px]">{strings.lens.undetermined}</p>
                        <button
                          type="button"
                          onClick={() => setMode('manual')}
                          className="text-[13px] font-medium underline"
                        >
                          {strings.lens.manualTab}
                        </button>
                      </div>
                    )}
                    {moonPacket.note && (
                      <div className="text-[11px] text-[#59595F] dark:text-[#B3B4B1]">{moonPacket.note}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
