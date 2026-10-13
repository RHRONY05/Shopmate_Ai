export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Parse hex or rgba string into RGBA object
 */
export function parseColor(color: string): RGBA {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const cleaned = trimmed.replace('#', '');
    const full =
      cleaned.length === 3
        ? cleaned
            .split('')
            .map((c) => c + c)
            .join('')
        : cleaned;
    return {
      r: parseInt(full.substring(0, 2), 16) || 0,
      g: parseInt(full.substring(2, 4), 16) || 0,
      b: parseInt(full.substring(4, 6), 16) || 0,
      a: 1,
    };
  }

  if (trimmed.startsWith('rgba') || trimmed.startsWith('rgb')) {
    const match = trimmed.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (match) {
      return {
        r: parseFloat(match[1]) || 0,
        g: parseFloat(match[2]) || 0,
        b: parseFloat(match[3]) || 0,
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
      };
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Convert hex color to RGB array
 * @param hex - Color in '#RRGGBB' or '#RGB' format
 * @returns [number, number, number] RGB values (0-255)
 */
export function hexToRgb(hex: string): [number, number, number] {
  const parsed = parseColor(hex);
  return [parsed.r, parsed.g, parsed.b];
}

/**
 * Composite a semi-transparent foreground color over an opaque background color
 */
export function composite(fg: RGBA, bg: RGBA): { r: number; g: number; b: number } {
  const a = fg.a ?? 1;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors per WCAG 2.1
 * Supports hex and rgba string colors.
 * Returns ratio from 1:1 to 21:1.
 */
export function contrastRatio(color1: string, color2: string): number {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  // If color1 has alpha, composite it over color2
  const solid1 = c1.a < 1 ? composite(c1, c2) : { r: c1.r, g: c1.g, b: c1.b };
  // If color2 has alpha, composite it over white
  const solid2 = c2.a < 1 ? composite(c2, { r: 255, g: 255, b: 255, a: 1 }) : { r: c2.r, g: c2.g, b: c2.b };

  const l1 = relativeLuminance(solid1.r, solid1.g, solid1.b);
  const l2 = relativeLuminance(solid2.r, solid2.g, solid2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color pair meets WCAG AA / AAA thresholds
 */
export function checkContrast(textHex: string, bgHex: string) {
  const ratio = contrastRatio(textHex, bgHex);
  const rounded = Math.round(ratio * 100) / 100;
  return {
    ratio: rounded,
    aa: rounded >= 4.5, // Normal text (< 18pt)
    aaLarge: rounded >= 3.0, // Large text (≥ 18pt or ≥ 14pt bold) and UI components
    aaa: rounded >= 7.0, // Enhanced contrast
  };
}
