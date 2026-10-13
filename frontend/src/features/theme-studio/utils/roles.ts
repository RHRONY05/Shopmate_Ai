import { SemanticPaletteRoles } from '../palettes';
import { checkContrast } from './contrast';

export interface RoleSwapRecord {
  id: string;
  label: string;
  roleA: keyof SemanticPaletteRoles;
  roleB: keyof SemanticPaletteRoles;
  timestamp: number;
}

export interface RoleDefinition {
  role: keyof SemanticPaletteRoles;
  label: string;
  group: 'Background' | 'Text' | 'Accent' | 'Interactive' | 'Border' | 'State' | 'Overlay';
  description: string;
  usage: string;
}

export const roleDefinitions: RoleDefinition[] = [
  // Backgrounds
  {
    role: 'bgCanvas',
    label: 'Canvas Background',
    group: 'Background',
    description: 'Deepest page foundation base (60% dominant canvas)',
    usage: 'Body, main viewport wrap, page container',
  },
  {
    role: 'bgSurface',
    label: 'Surface Container',
    group: 'Background',
    description: 'Header bars, mega-menus, sidebars, section trays',
    usage: 'Navigation header, category filter rail',
  },
  {
    role: 'bgCard',
    label: 'Card Background',
    group: 'Background',
    description: 'Elevated interactive product and content containers',
    usage: 'Jersey item card, modal panels, bottom sheets',
  },
  {
    role: 'bgCardHover',
    label: 'Card Hover State',
    group: 'Background',
    description: 'Slightly raised or lightened background on cursor hover',
    usage: 'Interactive jersey cards on mouse hover',
  },

  // Text
  {
    role: 'textPrimary',
    label: 'Primary Text',
    group: 'Text',
    description: 'High-contrast headlines, titles, crucial pricing info',
    usage: 'Jersey titles, club name, modal headers',
  },
  {
    role: 'textSecondary',
    label: 'Secondary Text',
    group: 'Text',
    description: 'Body copy, descriptions, specifications, subtotals',
    usage: 'Kit material specs, jersey descriptions',
  },
  {
    role: 'textMuted',
    label: 'Muted Meta Text',
    group: 'Text',
    description: 'Timestamps, SKU codes, footnotes, disabled hints',
    usage: 'Match dates, size advice notes, secondary labels',
  },

  // Accents
  {
    role: 'accentPrimary',
    label: 'Primary Accent',
    group: 'Accent',
    description: 'Primary focal point, links, active tabs, brand signal',
    usage: 'Brand crest ring, active nav links, filter pills',
  },
  {
    role: 'accentSecondary',
    label: 'Secondary Accent',
    group: 'Accent',
    description: 'Supplementary badges, secondary tags, subtle highlights',
    usage: 'Official league patches, season tags, star ratings',
  },

  // Interactive
  {
    role: 'btnPrimary',
    label: 'Primary CTA Button',
    group: 'Interactive',
    description: 'Main conversion button background',
    usage: 'Add to Cart, Complete Order, Checkout CTA',
  },
  {
    role: 'btnHover',
    label: 'Button Hover Background',
    group: 'Interactive',
    description: 'Darkened/lightened button state on cursor hover',
    usage: 'Primary button hover state',
  },
  {
    role: 'btnText',
    label: 'Button Label Text',
    group: 'Interactive',
    description: 'High-contrast text placed on primary button background',
    usage: 'Button typography, icon tint on primary buttons',
  },

  // Borders & Focus
  {
    role: 'borderSubtle',
    label: 'Subtle Border',
    group: 'Border',
    description: 'Card outline, dividers, table row separations',
    usage: 'Card borders, header divider line',
  },
  {
    role: 'borderFocus',
    label: 'Focus Ring & Active Border',
    group: 'Border',
    description: 'Keyboard navigation focus rings and active selections',
    usage: 'Input focus ring, selected jersey size outline',
  },

  // States
  {
    role: 'stateSuccess',
    label: 'Success State',
    group: 'State',
    description: 'Confirmation alerts, stock availability, green checks',
    usage: 'In-stock badge, promo code verified, paid banner',
  },
  {
    role: 'stateWarning',
    label: 'Warning State',
    group: 'State',
    description: 'Low-stock warnings, pending verification, alerts',
    usage: 'Low stock count (2 left), delivery delay notice',
  },
  {
    role: 'stateError',
    label: 'Error State',
    group: 'State',
    description: 'Out-of-stock badges, form errors, card declines',
    usage: 'Sold out badge, invalid input border, payment fail',
  },
  {
    role: 'stateInfo',
    label: 'Info State',
    group: 'State',
    description: 'Informational tips, delivery estimates, AI badges',
    usage: 'AI recommendation badge, shipping tip bubble',
  },

  // Overlays
  {
    role: 'scrim',
    label: 'Overlay Scrim',
    group: 'Overlay',
    description: 'Modal backdrop dimming, text readability over jersey photos',
    usage: 'Slide-out drawer backdrop, hero image gradient scrim',
  },
  {
    role: 'shadowColor',
    label: 'Shadow Tint RGB',
    group: 'Overlay',
    description: 'Raw RGB triplet (e.g. 0 0 0) used to tint box-shadows',
    usage: 'Elevation tokens (--shadow-1, --shadow-2, --shadow-3)',
  },
];

/**
 * Checks critical contrast requirements:
 * 1. textPrimary on bgCanvas >= 4.5:1
 * 2. textPrimary on bgCard >= 4.5:1
 * 3. btnText on btnPrimary >= 4.5:1
 */
export function validateCriticalContrast(roles: SemanticPaletteRoles): boolean {
  const textCanvas = checkContrast(roles.textPrimary, roles.bgCanvas);
  const textCard = checkContrast(roles.textPrimary, roles.bgCard);
  const btnContrast = checkContrast(roles.btnText, roles.btnPrimary);
  return textCanvas.aa && textCard.aa && btnContrast.aa;
}

/**
 * Deliberately swap a pair of semantic roles.
 * If swapping accents, keep btnPrimary & borderFocus aligned with accentPrimary.
 */
export function swapRoles(
  currentRoles: SemanticPaletteRoles,
  roleA: keyof SemanticPaletteRoles,
  roleB: keyof SemanticPaletteRoles
): SemanticPaletteRoles {
  const updated = { ...currentRoles };
  const valA = currentRoles[roleA];
  const valB = currentRoles[roleB];

  updated[roleA] = valB;
  updated[roleB] = valA;

  // If primary and secondary accents are swapped, keep button and focus in sync
  if (
    (roleA === 'accentPrimary' && roleB === 'accentSecondary') ||
    (roleA === 'accentSecondary' && roleB === 'accentPrimary')
  ) {
    updated.btnPrimary = updated.accentPrimary;
    updated.borderFocus = updated.accentPrimary;
  }

  return updated;
}

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Exploratory shuffle strictly CONSTRAINED within compatible role groups:
 * - Backgrounds among backgrounds only
 * - Accents among accents only
 * - Text among secondary & muted text only (preserving high-contrast textPrimary)
 *
 * Retries up to 20 times until critical WCAG checks pass.
 */
export function shuffleWithinGroups(baseRoles: SemanticPaletteRoles): {
  roles: SemanticPaletteRoles;
  success: boolean;
} {
  const bgKeys: Array<keyof SemanticPaletteRoles> = ['bgCanvas', 'bgSurface', 'bgCard', 'bgCardHover'];
  const accentKeys: Array<keyof SemanticPaletteRoles> = ['accentPrimary', 'accentSecondary'];

  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate: SemanticPaletteRoles = { ...baseRoles };

    // 1. Shuffle backgrounds among backgrounds
    const bgValues = shuffleArray(bgKeys.map((k) => baseRoles[k]));
    bgKeys.forEach((key, idx) => {
      candidate[key] = bgValues[idx];
    });

    // 2. Shuffle accents among accents
    const accentValues = shuffleArray(accentKeys.map((k) => baseRoles[k]));
    accentKeys.forEach((key, idx) => {
      candidate[key] = accentValues[idx];
    });
    candidate.btnPrimary = candidate.accentPrimary;
    candidate.borderFocus = candidate.accentPrimary;

    // 3. Verify critical contrast pass
    if (validateCriticalContrast(candidate)) {
      return { roles: candidate, success: true };
    }
  }

  return { roles: baseRoles, success: false };
}
