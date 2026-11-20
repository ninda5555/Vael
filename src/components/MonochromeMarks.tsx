import React from 'react';
import type { MoonPhaseInfo, SignId } from '../../shared/types.ts';

/**
 * Original UNSENT folded-envelope mark with a lifted flap & dark crease.
 * Used in the Unfold opening, Welcome silhouette, Empty My Box, and desktop brand mark.
 */
export const UnsentEnvelopeMark: React.FC<{
  size?: number;
  flapOpen?: boolean;
  className?: string;
}> = ({ size = 48, flapOpen = false, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect
      x="8"
      y="18"
      width="48"
      height="32"
      rx="5"
      fill="currentColor"
      fillOpacity="0.06"
      stroke="currentColor"
      strokeWidth="2.2"
    />
    {flapOpen ? (
      <path
        d="M10 19L32 6L54 19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M10 20L32 36L54 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    <path d="M10 48L24 34M54 48L40 34" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Cropped black silhouette envelope for Welcome & Empty My Box (inspired by Stoic silhouette).
 */
export const CroppedEnvelopeSilhouette: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 280 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M24 68C24 60.268 30.268 54 38 54H242C249.732 54 256 60.268 256 68V178H24V68Z"
      fill="currentColor"
    />
    <path d="M36 54L140 12L244 54" fill="currentColor" fillOpacity="0.88" />
    <path d="M26 62L140 122L254 62" stroke="#F3F3F5" strokeOpacity="0.28" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * Bold geometric negative-space cutout wordmark ("UNSENT"),
 * inspired by high-contrast architectural block stencil lettering.
 */
export const UnsentWordmark: React.FC<{
  height?: number;
  pulse?: boolean;
  className?: string;
}> = ({ height = 34, pulse = false, className = '' }) => {
  const maskId = React.useId();
  const width = Math.round((height / 44) * 268);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 268 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${pulse ? 'animate-wordmark-pulse ' : ''}${className}`.trim()}
      aria-label="UNSENT"
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="268" height="44" fill="white" />
          {/* U cutout */}
          <path d="M8 1V26C8 32.5 12.6 36 19 36C25.4 36 30 32.5 30 26V1H23V25.5C23 27.8 21.3 29.2 19 29.2C16.7 29.2 15 27.8 15 25.5V1H8Z" fill="black" />
          {/* N cutout */}
          <g transform="translate(46 0)">
            <polygon points="8,43 8,1 14,1 25,25 25,1 31,1 31,43 25,43 14,19 14,43" fill="black" />
          </g>
          {/* S cutout */}
          <g transform="translate(92 0)">
            <path d="M29 12H15C13.5 12 12.5 13 12.5 14.3C12.5 15.6 13.5 16.5 15 16.5H24C29.5 16.5 33 19.8 33 25C33 30.6 29 34 23.5 34H8V27.5H22.5C24.2 27.5 25.2 26.5 25.2 25.1C25.2 23.7 24.2 22.8 22.5 22.8H14C8.8 22.8 5.5 19.6 5.5 14.5C5.5 9.2 9.4 6 15 6H29V12Z" fill="black" />
          </g>
          {/* E cutout */}
          <g transform="translate(138 0)">
            <path d="M9 7H31V13.5H16.5V18.5H28V24.5H16.5V30.5H31V37H9V7Z" fill="black" />
          </g>
          {/* N cutout */}
          <g transform="translate(184 0)">
            <polygon points="8,43 8,1 14,1 25,25 25,1 31,1 31,43 25,43 14,19 14,43" fill="black" />
          </g>
          {/* T cutout */}
          <g transform="translate(230 0)">
            <path d="M5 7H33V14H22.5V41H15.5V14H5V7Z" fill="black" />
          </g>
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect x="0" y="2" width="38" height="40" rx="2" fill="currentColor" />
        <rect x="46" y="2" width="38" height="40" rx="2" fill="currentColor" />
        <rect x="92" y="2" width="38" height="40" rx="2" fill="currentColor" />
        <rect x="138" y="2" width="38" height="40" rx="2" fill="currentColor" />
        <rect x="184" y="2" width="38" height="40" rx="2" fill="currentColor" />
        <rect x="230" y="2" width="38" height="40" rx="2" fill="currentColor" />
      </g>
    </svg>
  );
};

/**
 * Calligraphic clay-red swash & arrow nib flourish inspired by classic editorial seal marks.
 */
export const UnsentSwashArrow: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({ animated = false, className = '' }) => (
  <svg
    viewBox="0 0 280 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M14 20C68 30 132 10 202 18C226 20.5 245 19 262 17"
      stroke="#A63A32"
      strokeWidth="3.2"
      strokeLinecap="round"
      className={animated ? 'animate-swash' : undefined}
    />
    <path
      d="M251 11L266 17L252 24.5L255.5 17.2L251 11Z"
      fill="#A63A32"
    />
  </svg>
);

/**
 * Compact Brand Scene combining the negative-space UNSENT block wordmark,
 * crisp tracked framing rules, and the clay-red calligraphic arrow flourish.
 */
export const UnsentBrandScene: React.FC<{
  flapOpen?: boolean;
  animated?: boolean;
  showMark?: boolean;
  subtitle?: string;
  className?: string;
}> = ({ flapOpen = false, animated = false, showMark = true, subtitle = 'PRIVATE LETTERS', className = '' }) => (
  <div className={`flex flex-col items-center text-center select-none ${className}`}>
    {showMark && (
      <div className={animated ? 'animate-brand-in' : undefined}>
        <UnsentEnvelopeMark size={48} flapOpen={flapOpen} className="mx-auto mb-3 text-[#19191B] dark:text-[#EEEAE2]" />
      </div>
    )}

    <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.26em] text-[#59595F] dark:text-[#B3B4B1] uppercase mb-2.5">
      <span className="w-7 h-[1.5px] bg-current opacity-70" aria-hidden="true" />
      <span>{subtitle}</span>
      <span className="w-7 h-[1.5px] bg-current opacity-70" aria-hidden="true" />
    </div>

    <div className={animated ? 'animate-brand-in' : undefined}>
      <UnsentWordmark height={40} className="text-[#19191B] dark:text-[#F3F1EC] mx-auto max-w-full" />
    </div>

    <UnsentSwashArrow animated={animated} className="w-56 sm:w-64 h-8 mt-1.5" />

    <div className="mt-1 flex items-center gap-2.5 text-[10px] font-bold tracking-[0.24em] text-[#A63A32] dark:text-[#E07A73] uppercase">
      <span className="w-5 h-[1.5px] bg-current opacity-65" aria-hidden="true" />
      <span>NEVER SENT</span>
      <span className="w-5 h-[1.5px] bg-current opacity-65" aria-hidden="true" />
    </div>
  </div>
);

/**
 * Monochrome folded-paper illustration for the optional check-in flow.
 */
export const FoldedPaperCheckInMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="76"
    height="76"
    viewBox="0 0 76 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 20C16 17.7909 17.7909 16 20 16H46L60 30V56C60 58.2091 58.2091 60 56 60H20C17.7909 60 16 58.2091 16 56V20Z"
      stroke="currentColor"
      strokeWidth="2.2"
    />
    <path d="M46 16V30H60" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M26 36H48M26 44H42" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Monochrome lunar phase plate SVG (no OS emoji).
 */
export const MonochromeMoonSvg: React.FC<{
  phaseAngle: number;
  size?: number;
  className?: string;
}> = ({ phaseAngle, size = 40, className = '' }) => {
  const norm = ((phaseAngle % 360) + 360) % 360;
  const rad = (norm * Math.PI) / 180;
  const rx = Math.abs(Math.cos(rad)) * 16;
  const waxing = norm < 180;
  const gibbous = norm > 90 && norm < 270;

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="1.8" />
      {norm >= 8 && norm <= 352 && (
        <path
          d={
            waxing
              ? `M 22 6 A 16 16 0 0 1 22 38 A ${rx} 16 0 0 ${gibbous ? 1 : 0} 22 6 Z`
              : `M 22 6 A 16 16 0 0 0 22 38 A ${rx} 16 0 0 ${gibbous ? 0 : 1} 22 6 Z`
          }
          fill="currentColor"
          fillOpacity="0.88"
        />
      )}
    </svg>
  );
};

export const SmallMoonEventDot: React.FC<{ event: 'new_moon' | 'full_moon' }> = ({ event }) => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle
      cx="6"
      cy="6"
      r="4.2"
      stroke="currentColor"
      strokeWidth="1.4"
      fill={event === 'full_moon' ? 'currentColor' : 'none'}
    />
  </svg>
);

/**
 * 12 Monochrome Line Marks for Zodiac signs in matching 48x48 viewboxes (NO OS emoji tiles).
 */
export const ZodiacLineMark: React.FC<{
  signId: SignId;
  size?: number;
  className?: string;
}> = ({ signId, size = 36, className = '' }) => {
  const common = {
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {signId === 'aries' && (
        <path d="M24 38V20M24 20C24 13 18 10 14 12C11 13.5 11 18 15 19M24 20C24 13 30 10 34 12C37 13.5 37 18 33 19" {...common} />
      )}
      {signId === 'taurus' && (
        <>
          <circle cx="24" cy="28" r="9" {...common} />
          <path d="M14 12C15 18 19 19 24 19C29 19 33 18 34 12" {...common} />
        </>
      )}
      {signId === 'gemini' && (
        <>
          <path d="M14 13C19 15 29 15 34 13M14 35C19 33 29 33 34 35" {...common} />
          <path d="M19 14.5V33.5M29 14.5V33.5" {...common} />
        </>
      )}
      {signId === 'cancer' && (
        <>
          <circle cx="17" cy="19" r="5" {...common} />
          <path d="M17 14C24 14 31 15 35 19" {...common} />
          <circle cx="31" cy="29" r="5" {...common} />
          <path d="M31 34C24 34 17 33 13 29" {...common} />
        </>
      )}
      {signId === 'leo' && (
        <>
          <circle cx="17" cy="27" r="5" {...common} />
          <path d="M21.5 24.5C22.5 15 29 12 33 16C36 19 34 26 30 30C27 33 28 36 33 36" {...common} />
        </>
      )}
      {signId === 'virgo' && (
        <path d="M13 14V32M13 18C16 14 20 14 20 19V32M20 18C23 14 27 14 27 19V32M27 21C32 17 36 20 34 26C32 31 28 34 24 37M27 25L35 35" {...common} />
      )}
      {signId === 'libra' && (
        <>
          <path d="M11 33H37" {...common} />
          <path d="M11 27H17.5C17 21 20.5 17 24 17C27.5 17 31 21 30.5 27H37" {...common} />
        </>
      )}
      {signId === 'scorpio' && (
        <path d="M12 15V31M12 19C15 15 19 15 19 20V31M19 19C22 15 26 15 26 20V30C26 34 29 36 33 33L36 30M32 30H36V34" {...common} />
      )}
      {signId === 'sagittarius' && (
        <path d="M14 34L34 14M24 14H34V24M16 24L24 32" {...common} />
      )}
      {signId === 'capricorn' && (
        <path d="M12 15L19 31L26 17C29 14 33 17 31 22C29 27 25 32 29 35C32 37 36 35 36 31C36 28 32 27 30 29" {...common} />
      )}
      {signId === 'aquarius' && (
        <>
          <path d="M11 20L16 16L21 20L26 16L31 20L36 16" {...common} />
          <path d="M11 30L16 26L21 30L26 26L31 30L36 26" {...common} />
        </>
      )}
      {signId === 'pisces' && (
        <>
          <path d="M15 13C20 19 20 29 15 35" {...common} />
          <path d="M33 13C28 19 28 29 33 35" {...common} />
          <path d="M13 24H35" {...common} />
        </>
      )}
    </svg>
  );
};

export const MOON_PHASE_KEY_TEST_Helper = (k: MoonPhaseInfo['phaseKey']) => k;
