import React from 'react';
import { FontPairing } from '../fonts';
import { SemanticPalette } from '../palettes';
import { Type, Check, Hash, Sliders } from 'lucide-react';

interface TypographyPanelProps {
  pairings: FontPairing[];
  activePairing: FontPairing;
  onSelectPairing: (pairing: FontPairing) => void;
  palette: SemanticPalette;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({
  pairings,
  activePairing,
  onSelectPairing,
  palette,
}) => {
  const { roles } = palette;

  const typeScaleSteps = [
    { size: 'text-5xl (48px)', label: 'Display Hero', text: 'MATCHDAY DROP 2024/25', font: 'heading' },
    { size: 'text-4xl (36px)', label: 'H1 Page Title', text: 'AUTHENTIC PLAYER SQUAD KITS', font: 'heading' },
    { size: 'text-3xl (30px)', label: 'H2 Section', text: 'European Championship Retro Edition', font: 'heading' },
    { size: 'text-2xl (24px)', label: 'H3 Card Title', text: 'Arsenal FC Home Jacquard Weave', font: 'heading' },
    { size: 'text-xl (20px)', label: 'H4 Subtitle', text: 'Official 3D Heat-Applied Cannon Crest', font: 'body' },
    { size: 'text-base (16px)', label: 'Body Regular', text: 'Engineered with double-knit recycled polyester and breathable micro-mesh side ventilation panels for optimal player aerodynamics.', font: 'body' },
    { size: 'text-sm (14px)', label: 'UI Secondary', text: 'Personalize with authentic Premier League player name, squad number, and sleeve badge.', font: 'body' },
    { size: 'text-xs (12px)', label: 'Meta & Legal', text: 'SKU: ARS-24-HM-AUT • Officially licensed product • 30-day returns accepted', font: 'body' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textPrimary }}
          >
            <Type className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 4: Typography Selection & Full Type Scale
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Harmonious font systems (Superfamilies, Single-Family scales, and Inscriptional Serifs) with real football copy
          </p>
        </div>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: roles.bgSurface,
            color: roles.textSecondary,
            borderColor: roles.borderSubtle,
          }}
        >
          {pairings.length} Curated Systems
        </span>
      </div>

      {/* Font Pairing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pairings.map((pairing) => {
          const isSelected = pairing.id === activePairing.id;
          return (
            <button
              key={pairing.id}
              type="button"
              onClick={() => onSelectPairing(pairing)}
              className="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
              style={{
                backgroundColor: isSelected ? roles.bgCard : roles.bgSurface,
                borderColor: isSelected ? roles.accentPrimary : roles.borderSubtle,
                boxShadow: isSelected ? `0 0 0 2px ${roles.accentPrimary}40` : undefined,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-bold text-xs truncate"
                    style={{ color: roles.textPrimary }}
                  >
                    {pairing.name}
                  </span>
                  {isSelected && (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: roles.accentPrimary }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-2 truncate max-w-full"
                  style={{
                    backgroundColor: roles.bgCanvas,
                    color: roles.textSecondary,
                    borderColor: roles.borderSubtle,
                  }}
                >
                  {pairing.category}
                </span>

                <p
                  className="text-xs line-clamp-2 mb-3.5 leading-relaxed"
                  style={{ color: roles.textMuted }}
                >
                  {pairing.description}
                </p>
              </div>

              {/* Sample Headline in that font */}
              <div
                className="p-2.5 rounded-xl border mt-auto"
                style={{
                  backgroundColor: roles.bgCanvas,
                  borderColor: roles.borderSubtle,
                }}
              >
                <span
                  className="text-xs font-bold block uppercase tracking-tight truncate"
                  style={{
                    fontFamily: pairing.headingFont,
                    color: roles.textPrimary,
                  }}
                >
                  ARSENAL 24/25 HOME KIT
                </span>
                <span
                  className="text-[11px] block mt-0.5 truncate"
                  style={{
                    fontFamily: pairing.bodyFont,
                    color: roles.textSecondary,
                  }}
                >
                  100% Recycled Poly • 85.00 USD
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Full Type Scale & Tabular Numerals Container */}
      <div
        className="p-6 rounded-2xl border space-y-6 shadow-sm"
        style={{
          backgroundColor: roles.bgCard,
          borderColor: roles.borderSubtle,
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: roles.borderSubtle }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: roles.textSecondary }}
          >
            Live Modular Scale: <strong style={{ color: roles.textPrimary }}>{activePairing.name}</strong>
          </span>
          <span className="text-[11px] font-mono" style={{ color: roles.accentPrimary }}>
            Heading: {activePairing.headingFont} • Body: {activePairing.bodyFont}
          </span>
        </div>

        {/* Type Steps */}
        <div className="space-y-4">
          {typeScaleSteps.map((step) => (
            <div
              key={step.size}
              className="border-b pb-3 last:border-b-0"
              style={{ borderColor: roles.borderSubtle }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1" style={{ color: roles.textMuted }}>
                <span>{step.label}</span>
                <span>{step.size}</span>
              </div>
              <div
                style={{
                  fontFamily: step.font === 'heading' ? activePairing.headingFont : activePairing.bodyFont,
                  color: roles.textPrimary,
                }}
                className={
                  step.size.startsWith('text-5xl')
                    ? 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none'
                    : step.size.startsWith('text-4xl')
                    ? 'text-2xl sm:text-3xl font-extrabold tracking-tight uppercase leading-tight'
                    : step.size.startsWith('text-3xl')
                    ? 'text-xl sm:text-2xl font-bold uppercase leading-snug'
                    : step.size.startsWith('text-2xl')
                    ? 'text-lg sm:text-xl font-bold leading-normal'
                    : step.size.startsWith('text-xl')
                    ? 'text-base sm:text-lg font-semibold leading-normal'
                    : step.size.startsWith('text-base')
                    ? 'text-sm sm:text-base leading-relaxed'
                    : step.size.startsWith('text-sm')
                    ? 'text-xs sm:text-sm leading-relaxed'
                    : 'text-xs font-mono opacity-80'
                }
              >
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {/* Tabular Numerals & Weight Spectrum */}
        <div
          className="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{
            backgroundColor: roles.bgSurface,
            borderColor: roles.borderSubtle,
          }}
        >
          {/* Tabular Numerals Demo */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5" style={{ color: roles.accentPrimary }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
                Tabular Numerals (Prices & Squad Numbers)
              </span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: roles.textMuted }}>
              Monospaced digits align perfectly in financial checkout summaries and player printing badges.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between p-1.5 rounded border" style={{ backgroundColor: roles.bgCard, borderColor: roles.borderSubtle }}>
                <span style={{ color: roles.textSecondary }}>Bukayo Saka (Squad #07)</span>
                <span className="font-bold" style={{ color: roles.textPrimary }}>89.99 USD</span>
              </div>
              <div className="flex justify-between p-1.5 rounded border" style={{ backgroundColor: roles.bgCard, borderColor: roles.borderSubtle }}>
                <span style={{ color: roles.textSecondary }}>Martin Ødegaard (Squad #08)</span>
                <span className="font-bold" style={{ color: roles.textPrimary }}>89.99 USD</span>
              </div>
              <div className="flex justify-between p-1.5 rounded border" style={{ backgroundColor: roles.bgCard, borderColor: roles.borderSubtle }}>
                <span style={{ color: roles.textSecondary }}>Official Premier League Badge</span>
                <span className="font-bold" style={{ color: roles.accentPrimary }}>+05.00 USD</span>
              </div>
            </div>
          </div>

          {/* Weight Spectrum Demo */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sliders className="w-3.5 h-3.5" style={{ color: roles.accentPrimary }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
                Active Weight Hierarchy
              </span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: roles.textMuted }}>
              Consistent weight contrast guides the shopper's eye from bold title drops to readable spec copy.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-normal" style={{ color: roles.textSecondary, fontFamily: activePairing.bodyFont }}>
                  Weight 400 (Regular Body Text)
                </span>
                <span className="text-[10px] font-mono opacity-70">400</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: roles.textPrimary, fontFamily: activePairing.bodyFont }}>
                  Weight 600 (Semibold Badges & Labels)
                </span>
                <span className="text-[10px] font-mono opacity-70">600</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase" style={{ color: roles.textPrimary, fontFamily: activePairing.headingFont }}>
                  Weight 800 (ExtraBold Hero Headlines)
                </span>
                <span className="text-[10px] font-mono opacity-70">800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
