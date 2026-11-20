import type { PaperStyleId, SignId } from '../../shared/types.ts';
import { getSignById } from '../../shared/zodiacCatalog.ts';

export interface PaperVisualSpec {
  id: PaperStyleId;
  bg: string;
  bgSecondary: string;
  ink: string;
  mutedInk: string;
  accent: string;
  border: string;
}

export const PAPER_SPECS: Record<PaperStyleId, PaperVisualSpec> = {
  oldParchment: {
    id: 'oldParchment',
    bg: '#F3EEE3',
    bgSecondary: '#E7DFCE',
    ink: '#19191B',
    mutedInk: '#59595F',
    accent: '#A63A32',
    border: 'rgba(25, 25, 27, 0.14)',
  },
  midnightBlue: {
    id: 'midnightBlue',
    bg: '#161D2B',
    bgSecondary: '#101520',
    ink: '#EEF2FA',
    mutedInk: '#A8B3C7',
    accent: '#C7D3EA',
    border: 'rgba(220, 230, 248, 0.18)',
  },
  rosePetal: {
    id: 'rosePetal',
    bg: '#F4E8E9',
    bgSecondary: '#EAD9DB',
    ink: '#25181A',
    mutedInk: '#6A4E52',
    accent: '#A63A32',
    border: 'rgba(110, 50, 58, 0.16)',
  },
  rainGlass: {
    id: 'rainGlass',
    bg: '#E4E9EE',
    bgSecondary: '#D6DEE6',
    ink: '#1A222B',
    mutedInk: '#4F5C6A',
    accent: '#2B3A4A',
    border: 'rgba(26, 34, 43, 0.16)',
  },
  tornNotebook: {
    id: 'tornNotebook',
    bg: '#FFFFFF',
    bgSecondary: '#F3F3F5',
    ink: '#19191B',
    mutedInk: '#59595F',
    accent: '#19191B',
    border: '#DADADD',
  },
  moonlitInk: {
    id: 'moonlitInk',
    bg: '#1D1F20',
    bgSecondary: '#151617',
    ink: '#F3F1EC',
    mutedInk: '#B3B4B1',
    accent: '#A63A32',
    border: '#363839',
  },
};

export interface CardRenderInput {
  text: string;
  style: PaperStyleId;
  fontSizeScale: 'small' | 'medium' | 'large';
  moodLabel?: string;
  recipientLabel?: string;
  showRecipient?: boolean;
  showWatermark?: boolean;
  signId?: SignId;
  dateLabel?: string;
  pageLabel?: string;
  /** Live or frozen WebGL canvas snapshot (exact pose shown in preview) */
  sculptureCanvas?: HTMLCanvasElement | null;
  /** Optional fallback SVG/image data URL when WebGL canvas isn't present */
  sculptureFallbackSrc?: string;
}

export function paginateCardText(text: string, maxCharsPerCard = 360): string[] {
  const clean = text.trim();
  if (!clean) return [''];
  if (clean.length <= maxCharsPerCard) return [clean];

  const paragraphs = clean.split(/\n+/);
  const pages: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxCharsPerCard && current) {
        pages.push(current.trim());
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current && current.length < maxCharsPerCard - 20) {
      current += '\n';
    }
  }
  if (current.trim()) pages.push(current.trim());
  return pages.length ? pages : [clean];
}

function wrapCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load error'));
    img.src = src;
  });
}

export async function renderFeelingCardPngBlob(input: CardRenderInput): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const spec = PAPER_SPECS[input.style];
  const sign = input.signId ? getSignById(input.signId) : null;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, spec.bg);
  grad.addColorStop(1, spec.bgSecondary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle hairline frame matching card inset
  ctx.strokeStyle = spec.accent;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 2;
  ctx.strokeRect(84, 110, width - 168, height - 220);
  ctx.globalAlpha = 1;

  // Header metadata (monochrome text—no OS emoji)
  let topY = 230;
  if (sign) {
    ctx.fillStyle = spec.accent;
    ctx.font = '700 30px "Plus Jakarta Sans", system-ui, -apple-system, "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(`${sign.westernName.en} · ${sign.rashiName.en}`, 132, topY);
    topY += 54;
  }
  if (input.moodLabel) {
    ctx.fillStyle = spec.mutedInk;
    ctx.font = '600 28px "Plus Jakarta Sans", system-ui, -apple-system, "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(input.moodLabel, 132, topY);
    topY += 48;
  }

  if (input.showRecipient && input.recipientLabel?.trim()) {
    ctx.fillStyle = spec.mutedInk;
    ctx.font = '600 38px "Cormorant Garamond", "Noto Sans Bengali", "Noto Sans Devanagari", Georgia, serif';
    ctx.fillText(`To ${input.recipientLabel.trim()}`, 132, topY + 24);
    topY += 80;
  }

  // Optional 3D sculpture motif placed in upper-center zone (exact frozen pose)
  const hasSculpture = Boolean(input.sculptureCanvas || input.sculptureFallbackSrc);
  if (hasSculpture) {
    const motifBoxSize = 420;
    const motifX = Math.round((width - motifBoxSize) / 2);
    const motifY = Math.max(topY + 24, 340);

    // Subtle dark pedestal medallion behind light-sensitive elements on pale paper
    ctx.save();
    ctx.fillStyle = 'rgba(25, 25, 27, 0.92)';
    ctx.beginPath();
    ctx.arc(width / 2, motifY + motifBoxSize / 2, motifBoxSize * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (input.sculptureCanvas) {
      const srcW = input.sculptureCanvas.width || motifBoxSize;
      const srcH = input.sculptureCanvas.height || motifBoxSize;
      const scale = Math.min(motifBoxSize / srcW, motifBoxSize / srcH);
      const drawW = Math.round(srcW * scale);
      const drawH = Math.round(srcH * scale);
      const dx = Math.round((width - drawW) / 2);
      const dy = Math.round(motifY + (motifBoxSize - drawH) / 2);
      ctx.drawImage(input.sculptureCanvas, dx, dy, drawW, drawH);
    } else if (input.sculptureFallbackSrc) {
      try {
        const img = await loadImage(input.sculptureFallbackSrc);
        ctx.drawImage(img, motifX, motifY, motifBoxSize, motifBoxSize);
      } catch {
        // Ignore image fallback failures quietly
      }
    }

    topY = motifY + motifBoxSize + 36;
  }

  const baseFontPx = input.fontSizeScale === 'large' ? 60 : input.fontSizeScale === 'small' ? 42 : 50;
  const lineHeight = Math.round(baseFontPx * 1.48);
  ctx.fillStyle = spec.ink;
  ctx.font = `600 ${baseFontPx}px "Cormorant Garamond", "Noto Sans Bengali", "Noto Sans Devanagari", Georgia, serif`;

  const maxTextWidth = width - 264;
  const lines = wrapCanvasLines(ctx, input.text.trim() || ' ', maxTextWidth);
  const totalTextHeight = lines.length * lineHeight;
  let textY = hasSculpture
    ? Math.max(topY + 60, Math.round(height * 0.56))
    : Math.max(topY + 120, Math.round((height - totalTextHeight) / 2));
  if (textY + totalTextHeight > height - 240) {
    textY = Math.max(topY + 48, height - 240 - totalTextHeight);
  }

  for (const line of lines) {
    if (textY > height - 200) break;
    ctx.fillText(line, 132, textY);
    textY += lineHeight;
  }

  const bottomY = height - 165;
  ctx.fillStyle = spec.mutedInk;
  ctx.font = '600 26px "Plus Jakarta Sans", system-ui, -apple-system, "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
  const footerParts = [input.dateLabel, input.pageLabel].filter(Boolean).join(' · ');
  if (footerParts) {
    ctx.fillText(footerParts, 132, bottomY);
  }

  if (input.showWatermark) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = spec.mutedInk;
    ctx.globalAlpha = 0.85;
    ctx.font = '800 26px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillText('UNSENT', width - 132, bottomY);
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG'));
    }, 'image/png');
  });
}
