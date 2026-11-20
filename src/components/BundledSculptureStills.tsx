import React from 'react';
import type { ElementKind } from '../three/sculptures.ts';

export type StillKind = 'envelope' | ElementKind | 'wheel';

interface BundledSculptureStillProps {
  kind: StillKind;
  className?: string;
}

export const BundledSculptureStill: React.FC<BundledSculptureStillProps> = ({ kind, className = '' }) => {
  if (kind === 'envelope') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="60" cy="96" rx="34" ry="7" fill="rgba(0,0,0,0.42)" />
        <g transform="rotate(-7 60 60)">
          <rect x="20" y="34" width="80" height="52" rx="4" fill="#F1EDE4" />
          <path d="M22 36L60 62L98 36V84H22V36Z" fill="#E3DDD1" />
          <path d="M21 35L60 66L99 35" stroke="#D1C9B9" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M21 84L44 58M99 84L76 58" stroke="#D1C9B9" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="60" cy="59" r="6" fill="#A63A32" />
        </g>
      </svg>
    );
  }

  if (kind === 'Fire') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="60" cy="96" rx="32" ry="7" fill="rgba(0,0,0,0.42)" />
        <ellipse cx="60" cy="92" rx="28" ry="6" stroke="#D9B26F" strokeWidth="2.5" />
        <path
          d="M60 18C74 42 84 62 80 82C77 92 43 92 40 82C36 62 46 42 60 18Z"
          fill="#E85334"
          fillOpacity="0.82"
        />
        <path
          d="M60 32C70 50 76 66 72 82C69 88 51 88 48 82C44 66 50 50 60 32Z"
          fill="#F59D42"
          fillOpacity="0.9"
        />
        <path
          d="M60 48C66 60 69 70 66 80C64 84 56 84 54 80C51 70 54 60 60 48Z"
          fill="#FFF2B2"
        />
        <circle cx="42" cy="36" r="1.8" fill="#FFC56D" />
        <circle cx="77" cy="44" r="1.6" fill="#FFC56D" />
        <circle cx="67" cy="24" r="1.4" fill="#FFC56D" />
      </svg>
    );
  }

  if (kind === 'Earth') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="60" cy="96" rx="34" ry="7" fill="rgba(0,0,0,0.42)" />
        <circle cx="60" cy="36" r="14" fill="#F5EAD6" />
        <polygon points="36,88 18,88 30,52" fill="#39634B" />
        <polygon points="36,88 30,52 48,88" fill="#46775A" />
        <polygon points="84,88 68,88 86,54" fill="#6AA37A" />
        <polygon points="86,54 102,88 84,88" fill="#4C805E" />
        <polygon points="60,28 38,88 60,88" fill="#528865" />
        <polygon points="60,28 60,88 82,88" fill="#3F6E51" />
        <ellipse cx="60" cy="90" rx="32" ry="6" stroke="#D9B26F" strokeWidth="2.2" />
        <polygon points="24,62 28,58 30,63 26,66" fill="#8FD19E" />
        <polygon points="94,64 98,60 100,65 96,68" fill="#8FD19E" />
      </svg>
    );
  }

  if (kind === 'Air') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="60" cy="96" rx="28" ry="6" fill="rgba(0,0,0,0.34)" />
        <path
          d="M40 84C26 70 86 64 78 48C70 34 38 38 48 22"
          stroke="#9BD2F5"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M78 82C92 66 34 58 44 42C52 30 82 32 70 20"
          stroke="#D8EEFC"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M52 88C68 74 34 62 60 44C76 34 64 26 56 18"
          stroke="#6EAEE0"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="42" cy="48" rx="10" ry="5" fill="#EBF5FD" fillOpacity="0.72" />
        <ellipse cx="78" cy="68" rx="9" ry="4.5" fill="#EBF5FD" fillOpacity="0.7" />
        <circle cx="34" cy="30" r="1.4" fill="#C6E6FB" />
        <circle cx="84" cy="36" r="1.4" fill="#C6E6FB" />
      </svg>
    );
  }

  if (kind === 'Water') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="60" cy="94" rx="34" ry="7" fill="rgba(0,0,0,0.42)" />
        <ellipse cx="60" cy="76" rx="32" ry="12" fill="#2456A8" />
        <ellipse cx="60" cy="76" rx="22" ry="7" stroke="#5E95E6" strokeOpacity="0.65" strokeWidth="1.6" />
        <ellipse cx="60" cy="76" rx="32" ry="12" stroke="#D9B26F" strokeWidth="2.2" />
        <path
          d="M66 24C57 25 51 32 52 41C53 49 61 55 70 53C62 52 58 46 58 38C58 31 61 26 66 24Z"
          fill="#F5EAD6"
        />
        <circle cx="42" cy="52" r="1.6" fill="#9BC3F7" />
        <circle cx="80" cy="48" r="1.6" fill="#9BC3F7" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="10" fill="#FFE6A3" />
      <circle cx="60" cy="60" r="24" stroke="#D9B26F" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="38" stroke="#D9B26F" strokeWidth="2" />
      <circle cx="60" cy="60" r="46" stroke="#D9B26F" strokeWidth="1" strokeOpacity="0.6" />
      {Array.from({ length: 12 }, (_, idx) => {
        const a = (idx / 12) * Math.PI * 2;
        return (
          <circle
            key={idx}
            cx={60 + Math.sin(a) * 38}
            cy={60 - Math.cos(a) * 38}
            r={idx === 0 ? 4 : 2.5}
            fill={idx === 0 ? '#F5EAD6' : '#D9B26F'}
          />
        );
      })}
    </svg>
  );
};
