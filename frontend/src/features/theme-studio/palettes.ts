export interface SemanticPaletteRoles {
  // Backgrounds
  bgCanvas: string;
  bgSurface: string;
  bgCard: string;
  bgCardHover: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accentPrimary: string;
  accentSecondary: string;

  // Buttons & Interactive
  btnPrimary: string;
  btnHover: string;
  btnText: string;

  // Borders & Focus
  borderSubtle: string;
  borderFocus: string;

  // Semantic States
  stateSuccess: string;
  stateWarning: string;
  stateError: string;
  stateInfo: string;

  // Overlays & Depth
  scrim: string;
  shadowColor: string;
}

export interface SemanticPalette {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  darkVariant?: string;
  tagline: string;
  roles: SemanticPaletteRoles;
}

export const curatedPalettes: SemanticPalette[] = [
  // -------------------------------------------------------------
  // 1. LIGHT: Stadium Matchday & Pitch Emerald
  // -------------------------------------------------------------
  {
    id: 'stadium-floodlight-emerald',
    name: '1. Stadium Matchday & Pitch Emerald',
    mode: 'light',
    darkVariant: 'midnight-floodlight-emerald',
    tagline: 'Vibrant Saturday noon kickoff: fresh pitch-cut lawn tint, jet-black typography, and energetic grass emerald',
    roles: {
      bgCanvas: '#F3F6F4',
      bgSurface: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardHover: '#E8EFEA',
      textPrimary: '#08140B',
      textSecondary: '#2B3B2E',
      textMuted: '#526656',
      accentPrimary: '#008744',
      accentSecondary: '#059669',
      btnPrimary: '#008744',
      btnHover: '#006E37',
      btnText: '#FFFFFF',
      borderSubtle: '#DDE7DF',
      borderFocus: '#008744',
      stateSuccess: '#15803D',
      stateWarning: '#B45309',
      stateError: '#DC2626',
      stateInfo: '#1D4ED8',
      scrim: 'rgba(8, 20, 11, 0.60)',
      shadowColor: '8 20 11',
    },
  },

  // -------------------------------------------------------------
  // 2. DARK: Midnight Floodlight Emerald (Dark Counterpart to 1)
  // -------------------------------------------------------------
  {
    id: 'midnight-floodlight-emerald',
    name: '2. Midnight Floodlight Emerald (Night Match)',
    mode: 'dark',
    tagline: 'Evening European floodlight: deep pitch shadow canvas with brilliant luminous emerald turf accents',
    roles: {
      bgCanvas: '#0A120D',
      bgSurface: '#121F17',
      bgCard: '#18291F',
      bgCardHover: '#22382B',
      textPrimary: '#F1F7F3',
      textSecondary: '#C1D4C6',
      textMuted: '#8BA392',
      accentPrimary: '#10B981',
      accentSecondary: '#34D399',
      btnPrimary: '#10B981',
      btnHover: '#059669',
      btnText: '#041409',
      borderSubtle: 'rgba(241, 247, 243, 0.12)',
      borderFocus: '#10B981',
      stateSuccess: '#34D399',
      stateWarning: '#FBBF24',
      stateError: '#F87171',
      stateInfo: '#60A5FA',
      scrim: 'rgba(0, 0, 0, 0.75)',
      shadowColor: '0 0 0',
    },
  },

  // -------------------------------------------------------------
  // 3. LIGHT: Atelier Kitroom & Championship Gold
  // -------------------------------------------------------------
  {
    id: 'atelier-kitroom-gold',
    name: '3. Atelier Kitroom & Championship Gold',
    mode: 'light',
    darkVariant: 'vault-nocturne-gold',
    tagline: 'Luxury Parisian tailor showroom: French linen ivory, warm espresso contrast, and Ballon d’Or trophy gold',
    roles: {
      bgCanvas: '#FAF7F2',
      bgSurface: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardHover: '#F4EEE4',
      textPrimary: '#1F1A15',
      textSecondary: '#4A4036',
      textMuted: '#6E6254',
      accentPrimary: '#996515',
      accentSecondary: '#B45309',
      btnPrimary: '#996515',
      btnHover: '#7D510E',
      btnText: '#FFFFFF',
      borderSubtle: '#ECE4D6',
      borderFocus: '#996515',
      stateSuccess: '#15803D',
      stateWarning: '#B45309',
      stateError: '#B91C1C',
      stateInfo: '#1D4ED8',
      scrim: 'rgba(31, 26, 21, 0.60)',
      shadowColor: '31 26 21',
    },
  },

  // -------------------------------------------------------------
  // 4. DARK: Vault Nocturne Gold (Dark Counterpart to 3)
  // -------------------------------------------------------------
  {
    id: 'vault-nocturne-gold',
    name: '4. Trophy Vault Nocturne & Polished Brass',
    mode: 'dark',
    tagline: 'Centenary trophy cabinet: obsidian museum cases, warm velvet charcoal, and luminous gold crests',
    roles: {
      bgCanvas: '#141210',
      bgSurface: '#1F1C18',
      bgCard: '#2B2722',
      bgCardHover: '#38332C',
      textPrimary: '#FBF8F4',
      textSecondary: '#D6CBC0',
      textMuted: '#A39688',
      accentPrimary: '#EAB308',
      accentSecondary: '#FACC15',
      btnPrimary: '#EAB308',
      btnHover: '#CA8A04',
      btnText: '#181408',
      borderSubtle: 'rgba(251, 248, 244, 0.12)',
      borderFocus: '#EAB308',
      stateSuccess: '#4ADE80',
      stateWarning: '#FACC15',
      stateError: '#F87171',
      stateInfo: '#60A5FA',
      scrim: 'rgba(0, 0, 0, 0.80)',
      shadowColor: '0 0 0',
    },
  },

  // -------------------------------------------------------------
  // 5. LIGHT: European Knockout & Royal Blue
  // -------------------------------------------------------------
  {
    id: 'european-knockout-blue',
    name: '5. European Knockout & Royal Blue',
    mode: 'light',
    darkVariant: 'champions-night-blue',
    tagline: 'Crisp ice-fog canvas with UEFA electric royal blue and deep midnight navy contrast',
    roles: {
      bgCanvas: '#F0F4FA',
      bgSurface: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardHover: '#E4ECF7',
      textPrimary: '#0A1224',
      textSecondary: '#253552',
      textMuted: '#516585',
      accentPrimary: '#1D4ED8',
      accentSecondary: '#0284C7',
      btnPrimary: '#1D4ED8',
      btnHover: '#1E40AF',
      btnText: '#FFFFFF',
      borderSubtle: '#D6E2F0',
      borderFocus: '#1D4ED8',
      stateSuccess: '#15803D',
      stateWarning: '#B45309',
      stateError: '#DC2626',
      stateInfo: '#1D4ED8',
      scrim: 'rgba(10, 18, 36, 0.60)',
      shadowColor: '10 18 36',
    },
  },

  // -------------------------------------------------------------
  // 6. DARK: Champions League Starball Night (Dark Counterpart to 5)
  // -------------------------------------------------------------
  {
    id: 'champions-night-blue',
    name: '6. Champions Starball Midnight Blue',
    mode: 'dark',
    tagline: 'Iconic Champions League midnight arena: deep navy cosmos with vibrant cyan starball energy',
    roles: {
      bgCanvas: '#080E1C',
      bgSurface: '#101B33',
      bgCard: '#182747',
      bgCardHover: '#233761',
      textPrimary: '#F0F6FF',
      textSecondary: '#BACEE8',
      textMuted: '#849EBF',
      accentPrimary: '#38BDF8',
      accentSecondary: '#60A5FA',
      btnPrimary: '#38BDF8',
      btnHover: '#0EA5E9',
      btnText: '#041624',
      borderSubtle: 'rgba(240, 246, 255, 0.12)',
      borderFocus: '#38BDF8',
      stateSuccess: '#34D399',
      stateWarning: '#FBBF24',
      stateError: '#F87171',
      stateInfo: '#38BDF8',
      scrim: 'rgba(0, 0, 0, 0.80)',
      shadowColor: '0 0 0',
    },
  },

  // -------------------------------------------------------------
  // 7. LIGHT: Terrace Heritage & Arsenal Carmine
  // -------------------------------------------------------------
  {
    id: 'terrace-heritage-carmine',
    name: '7. Highbury Terraces & Heritage Redcurrant',
    mode: 'light',
    darkVariant: 'ultra-curva-noir',
    tagline: 'Historic stadium architecture: warm aged paper tone with classic Highbury redcurrant and deep charcoal rose',
    roles: {
      bgCanvas: '#FAF5F3',
      bgSurface: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardHover: '#F4ECE8',
      textPrimary: '#1C1113',
      textSecondary: '#473336',
      textMuted: '#6E565A',
      accentPrimary: '#BE123C',
      accentSecondary: '#9F1239',
      btnPrimary: '#BE123C',
      btnHover: '#9F1239',
      btnText: '#FFFFFF',
      borderSubtle: '#EBDCD7',
      borderFocus: '#BE123C',
      stateSuccess: '#15803D',
      stateWarning: '#B45309',
      stateError: '#BE123C',
      stateInfo: '#1D4ED8',
      scrim: 'rgba(28, 17, 19, 0.60)',
      shadowColor: '28 17 19',
    },
  },

  // -------------------------------------------------------------
  // 8. DARK: Ultra Curva Noir & Crimson Flare (Dark Counterpart to 7)
  // -------------------------------------------------------------
  {
    id: 'ultra-curva-noir',
    name: '8. Ultra Curva Noir & Crimson Flare',
    mode: 'dark',
    tagline: 'Night in the stadium ultras stand: smoky carbon noir with searing red flare illumination',
    roles: {
      bgCanvas: '#140D0E',
      bgSurface: '#211618',
      bgCard: '#2E1E21',
      bgCardHover: '#3D282C',
      textPrimary: '#FFF1F2',
      textSecondary: '#ECC5C8',
      textMuted: '#B39195',
      accentPrimary: '#FB7185',
      accentSecondary: '#FDA4AF',
      btnPrimary: '#FB7185',
      btnHover: '#F43F5E',
      btnText: '#1F0609',
      borderSubtle: 'rgba(255, 241, 242, 0.12)',
      borderFocus: '#FB7185',
      stateSuccess: '#34D399',
      stateWarning: '#FBBF24',
      stateError: '#FB7185',
      stateInfo: '#60A5FA',
      scrim: 'rgba(0, 0, 0, 0.85)',
      shadowColor: '0 0 0',
    },
  },
];
