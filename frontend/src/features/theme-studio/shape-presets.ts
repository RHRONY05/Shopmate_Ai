export type RadiusPersonality = 'sharp' | 'soft' | 'round';
export type ShadowStyle = 'flat' | 'soft' | 'lifted';
export type DensityMode = 'compact' | 'comfortable';
export type MotionPersonality = 'calm' | 'snappy' | 'playful';

export interface ShapeConfig {
  radius: RadiusPersonality;
  shadow: ShadowStyle;
  density: DensityMode;
  motion: MotionPersonality;
}

export interface RadiusPreset {
  id: RadiusPersonality;
  name: string;
  tagline: string;
  tokens: {
    radiusSm: string;
    radiusMd: string;
    radiusLg: string;
    radiusXl: string;
    radiusPill: string;
  };
}

export interface ShadowPreset {
  id: ShadowStyle;
  name: string;
  tagline: string;
  tokens: {
    shadow1: (shadowColor: string) => string;
    shadow2: (shadowColor: string) => string;
    shadow3: (shadowColor: string) => string;
  };
}

export interface DensityPreset {
  id: DensityMode;
  name: string;
  tagline: string;
  tokens: {
    touchMin: string;
    controlHeight: string;
    paddingSm: string;
    paddingMd: string;
    paddingLg: string;
  };
}

export interface MotionPreset {
  id: MotionPersonality;
  name: string;
  tagline: string;
  tokens: {
    durInstant: string;
    durFast: string;
    durBase: string;
    durSlow: string;
    durSlower: string;
    easeOut: string;
    easeIn: string;
    easeInOut: string;
    easeSpring: string;
  };
}

export const radiusPresets: Record<RadiusPersonality, RadiusPreset> = {
  sharp: {
    id: 'sharp',
    name: 'Sharp & Technical',
    tagline: '2px–6px tight geometric corners for tactical, structured grid layouts',
    tokens: {
      radiusSm: '2px',
      radiusMd: '4px',
      radiusLg: '6px',
      radiusXl: '8px',
      radiusPill: '999px',
    },
  },
  soft: {
    id: 'soft',
    name: 'Soft & Modern (Recommended)',
    tagline: '6px–16px organic curved corners for contemporary e-commerce cards and dialogs',
    tokens: {
      radiusSm: '6px',
      radiusMd: '12px',
      radiusLg: '18px',
      radiusXl: '24px',
      radiusPill: '999px',
    },
  },
  round: {
    id: 'round',
    name: 'Round & Energetic',
    tagline: '10px–28px expressive rounded curves with prominent pill action buttons',
    tokens: {
      radiusSm: '10px',
      radiusMd: '18px',
      radiusLg: '26px',
      radiusXl: '32px',
      radiusPill: '999px',
    },
  },
};

export const shadowPresets: Record<ShadowStyle, ShadowPreset> = {
  flat: {
    id: 'flat',
    name: 'Flat (Borders Only)',
    tagline: 'Pure zero-elevation outline aesthetic, high clarity and zero visual blur',
    tokens: {
      shadow1: () => 'none',
      shadow2: () => 'none',
      shadow3: () => 'none',
    },
  },
  soft: {
    id: 'soft',
    name: 'Soft (Subtle Palette-Tinted)',
    tagline: 'Gentle low-opacity tinted drop-shadows tailored to background temperature',
    tokens: {
      shadow1: (c) => `0 1px 2px rgb(${c} / 0.05), 0 1px 3px rgb(${c} / 0.08)`,
      shadow2: (c) => `0 4px 12px rgb(${c} / 0.08), 0 2px 4px rgb(${c} / 0.05)`,
      shadow3: (c) => `0 16px 36px rgb(${c} / 0.12), 0 4px 12px rgb(${c} / 0.06)`,
    },
  },
  lifted: {
    id: 'lifted',
    name: 'Lifted (Pronounced Elevation)',
    tagline: 'Dramatic multi-layer depth for floating drawers, modals, and sticky action bars',
    tokens: {
      shadow1: (c) => `0 2px 6px rgb(${c} / 0.10), 0 1px 3px rgb(${c} / 0.12)`,
      shadow2: (c) => `0 8px 24px rgb(${c} / 0.14), 0 3px 8px rgb(${c} / 0.10)`,
      shadow3: (c) => `0 24px 56px rgb(${c} / 0.22), 0 6px 16px rgb(${c} / 0.14)`,
    },
  },
};

export const densityPresets: Record<DensityMode, DensityPreset> = {
  compact: {
    id: 'compact',
    name: 'Compact (High Information Density)',
    tagline: '38px–40px controls, tighter padding for power-shopper inventory tables and specs',
    tokens: {
      touchMin: '40px',
      controlHeight: '38px',
      paddingSm: '6px 10px',
      paddingMd: '8px 14px',
      paddingLg: '10px 18px',
    },
  },
  comfortable: {
    id: 'comfortable',
    name: 'Comfortable (Standard E-Commerce)',
    tagline: '44px+ touch-friendly target controls with relaxed spatial breathing room',
    tokens: {
      touchMin: '44px',
      controlHeight: '46px',
      paddingSm: '8px 14px',
      paddingMd: '12px 20px',
      paddingLg: '16px 28px',
    },
  },
};

export const motionPresets: Record<MotionPersonality, MotionPreset> = {
  calm: {
    id: 'calm',
    name: 'Calm & Deliberate',
    tagline: 'Smooth, extended ease transitions without abrupt jerks or bounce',
    tokens: {
      durInstant: '100ms',
      durFast: '200ms',
      durBase: '320ms',
      durSlow: '450ms',
      durSlower: '600ms',
      easeOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
      easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      easeSpring: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  },
  snappy: {
    id: 'snappy',
    name: 'Snappy & Direct (Default)',
    tagline: '140ms–220ms crisp feedback with immediate response to shopper actions',
    tokens: {
      durInstant: '80ms',
      durFast: '140ms',
      durBase: '220ms',
      durSlow: '320ms',
      durSlower: '480ms',
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      easeSpring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
  playful: {
    id: 'playful',
    name: 'Playful & Springy',
    tagline: 'Expressive slight overshoot spring curve for celebratory additions to cart',
    tokens: {
      durInstant: '70ms',
      durFast: '160ms',
      durBase: '260ms',
      durSlow: '380ms',
      durSlower: '520ms',
      easeOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
};
