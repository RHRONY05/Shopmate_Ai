import React, { useState, useEffect } from 'react';
import { curatedPalettes, SemanticPalette, SemanticPaletteRoles } from './palettes';
import { curatedFontPairings, FontPairing } from './fonts';
import {
  ShapeConfig,
  radiusPresets,
  motionPresets,
} from './shape-presets';
import { RoleSwapRecord } from './utils/roles';

import { PalettePicker } from './components/PalettePicker';
import { AccessibilityDashboard } from './components/AccessibilityDashboard';
import { RoleInspector } from './components/RoleInspector';
import { TypographyPanel } from './components/TypographyPanel';
import { ComponentShowcase } from './components/ComponentShowcase';
import { NeutralScale } from './components/NeutralScale';
import { ShapeMotionPanel } from './components/ShapeMotionPanel';

import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  FileCode,
  X,
  Code2,
} from 'lucide-react';

interface ThemeStudioPageProps {
  onBackToApp?: () => void;
}

export const ThemeStudioPage: React.FC<ThemeStudioPageProps> = ({ onBackToApp }) => {
  // 1. Decoupled State: Palette, Font, Shape are separate states
  const [basePalette, setBasePalette] = useState<SemanticPalette>(curatedPalettes[0]);
  const [activePalette, setActivePalette] = useState<SemanticPalette>(curatedPalettes[0]);
  const [activeFontPairing, setActiveFontPairing] = useState<FontPairing>(curatedFontPairings[0]);
  const [shapeConfig, setShapeConfig] = useState<ShapeConfig>({
    radius: 'soft',
    shadow: 'soft',
    density: 'comfortable',
    motion: 'snappy',
  });

  const [swapHistory, setSwapHistory] = useState<RoleSwapRecord[]>([]);
  const [isCustomized, setIsCustomized] = useState<boolean>(false);
  const [copiedTokens, setCopiedTokens] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // When base palette changes, update activePalette and reset swap history
  const handleSelectPalette = (palette: SemanticPalette) => {
    setBasePalette(palette);
    setActivePalette(palette);
    setSwapHistory([]);
    setIsCustomized(false);
  };

  // Swatch hex color tweak handler
  const handleUpdateRoleColor = (roleKey: keyof SemanticPaletteRoles, newColor: string) => {
    setActivePalette((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleKey]: newColor,
        // If updating accent, also update dependent buttons/focus if matching
        ...(roleKey === 'accentPrimary' ? { btnPrimary: newColor, borderFocus: newColor } : {}),
      },
    }));
    setIsCustomized(true);
  };

  // Apply swapped or shuffled roles
  const handleApplyRoles = (newRoles: SemanticPaletteRoles, historyItem?: RoleSwapRecord) => {
    setActivePalette((prev) => ({
      ...prev,
      roles: newRoles,
    }));
    if (historyItem) {
      setSwapHistory((prev) => [historyItem, ...prev]);
    }
    setIsCustomized(true);
  };

  // Revert a specific swap item
  const handleRemoveHistoryItem = (recordId: string) => {
    const remaining = swapHistory.filter((item) => item.id !== recordId);
    setSwapHistory(remaining);
    if (remaining.length === 0) {
      setActivePalette(basePalette);
      setIsCustomized(false);
    }
  };

  // Reset to original base palette
  const handleResetRoles = () => {
    setActivePalette(basePalette);
    setSwapHistory([]);
    setIsCustomized(false);
  };

  // Dynamically inject Google Fonts link whenever font pairing changes
  useEffect(() => {
    const existing = document.getElementById('theme-studio-font-link');
    if (existing) {
      existing.remove();
    }
    const link = document.createElement('link');
    link.id = 'theme-studio-font-link';
    link.rel = 'stylesheet';
    link.href = activeFontPairing.googleFontsUrl;
    document.head.appendChild(link);
  }, [activeFontPairing]);

  // Generate full single-source-of-truth token file matching tokens.template.css
  const generateCompleteTokensCSS = (): string => {
    const r = activePalette.roles;
    const rad = radiusPresets[shapeConfig.radius].tokens;
    const mot = motionPresets[shapeConfig.motion].tokens;

    // Find dark counterpart if available
    const darkPal = curatedPalettes.find(
      (p) => p.id === activePalette.darkVariant || (activePalette.mode === 'dark' && p.id === activePalette.id)
    ) || curatedPalettes.find((p) => p.mode === 'dark')!;
    const dr = darkPal.roles;

    return `/* ==========================================================================
   Design tokens — the single source of truth for ShopMate AI.
   Theme: ${activePalette.name}
   Typography Pairing: ${activeFontPairing.name}
   Radius: ${shapeConfig.radius} | Shadow: ${shapeConfig.shadow} | Motion: ${shapeConfig.motion}
   ========================================================================== */

@import url("${activeFontPairing.googleFontsUrl}");

:root {
  color-scheme: ${activePalette.mode};

  /* ---- Color roles ------------------------------------------------------- */
  --bg-canvas:        ${r.bgCanvas};
  --bg-surface:       ${r.bgSurface};
  --bg-card:          ${r.bgCard};
  --bg-card-hover:    ${r.bgCardHover};
  --text-primary:     ${r.textPrimary};
  --text-secondary:   ${r.textSecondary};
  --text-muted:       ${r.textMuted};
  --accent-primary:   ${r.accentPrimary};
  --accent-secondary: ${r.accentSecondary};
  --btn-primary:      ${r.btnPrimary};
  --btn-hover:        ${r.btnHover};
  --btn-text:         ${r.btnText};
  --border-subtle:    ${r.borderSubtle};
  --border-focus:     ${r.borderFocus};
  --state-success:    ${r.stateSuccess};
  --state-warning:    ${r.stateWarning};
  --state-error:      ${r.stateError};
  --state-info:       ${r.stateInfo};
  --scrim:            ${r.scrim};
  --shadow-color:     ${r.shadowColor};

  /* ---- Typography -------------------------------------------------------- */
  --font-display: ${activeFontPairing.headingFont};
  --font-body:    ${activeFontPairing.bodyFont};
  --font-mono:    ui-monospace, "SFMono-Regular", Consolas, monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;

  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     800;

  --leading-tight:   1.15;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.65;

  --tracking-tight:  -0.02em;
  --tracking-normal: 0;
  --tracking-wide:   0.06em;

  /* ---- Spacing (4px base) ------------------------------------------------ */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* ---- Shape (Radius: ${shapeConfig.radius}) ----------------------------- */
  --radius-sm:   ${rad.radiusSm};
  --radius-md:   ${rad.radiusMd};
  --radius-lg:   ${rad.radiusLg};
  --radius-xl:   ${rad.radiusXl};
  --radius-pill: ${rad.radiusPill};

  /* ---- Depth & Elevation (Shadow: ${shapeConfig.shadow}) ----------------- */
  --shadow-1: 0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 3px rgb(var(--shadow-color) / 0.08);
  --shadow-2: 0 4px 12px rgb(var(--shadow-color) / 0.08), 0 2px 4px rgb(var(--shadow-color) / 0.06);
  --shadow-3: 0 16px 40px rgb(var(--shadow-color) / 0.14), 0 4px 12px rgb(var(--shadow-color) / 0.08);

  /* ---- Motion (${shapeConfig.motion}) ----------------------------------- */
  --dur-instant: ${mot.durInstant};
  --dur-fast:    ${mot.durFast};
  --dur-base:    ${mot.durBase};
  --dur-slow:    ${mot.durSlow};
  --dur-slower:  ${mot.durSlower};
  --ease-out:    ${mot.easeOut};
  --ease-in:     ${mot.easeIn};
  --ease-in-out: ${mot.easeInOut};
  --ease-spring: ${mot.easeSpring};

  /* ---- Layout & Interaction ---------------------------------------------- */
  --touch-min:     44px;
  --container-max: 1240px;
  --gutter:        var(--space-4);
  --focus-ring:    0 0 0 3px var(--bg-canvas), 0 0 0 5px var(--border-focus);

  /* ---- Layers ------------------------------------------------------------ */
  --z-base: 0;
  --z-sticky: 10;
  --z-dropdown: 20;
  --z-sheet: 30;
  --z-toast: 40;
  --z-modal: 50;
}

/* Dark mode counterpart */
[data-theme="dark"] {
  color-scheme: dark;
  --bg-canvas:        ${dr.bgCanvas};
  --bg-surface:       ${dr.bgSurface};
  --bg-card:          ${dr.bgCard};
  --bg-card-hover:    ${dr.bgCardHover};
  --text-primary:     ${dr.textPrimary};
  --text-secondary:   ${dr.textSecondary};
  --text-muted:       ${dr.textMuted};
  --accent-primary:   ${dr.accentPrimary};
  --accent-secondary: ${dr.accentSecondary};
  --btn-primary:      ${dr.btnPrimary};
  --btn-hover:        ${dr.btnHover};
  --btn-text:         ${dr.btnText};
  --border-subtle:    ${dr.borderSubtle};
  --border-focus:     ${dr.borderFocus};
  --state-success:    ${dr.stateSuccess};
  --state-warning:    ${dr.stateWarning};
  --state-error:      ${dr.stateError};
  --state-info:       ${dr.stateInfo};
  --scrim:            ${dr.scrim};
  --shadow-color:     ${dr.shadowColor};
}
`;
  };

  const handleCopyTokens = () => {
    navigator.clipboard.writeText(generateCompleteTokensCSS());
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2500);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: activePalette.roles.bgCanvas,
        color: activePalette.roles.textPrimary,
        fontFamily: activeFontPairing.bodyFont,
      }}
    >
      {/* Studio Sticky Header Bar */}
      <header
        className="sticky top-0 z-50 px-6 py-4 border-b backdrop-blur-md"
        style={{
          backgroundColor: `${activePalette.roles.bgSurface}EE`,
          borderColor: activePalette.roles.borderSubtle,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl flex items-center justify-center shadow-md"
              style={{
                backgroundColor: `${activePalette.roles.accentPrimary}20`,
                color: activePalette.roles.accentPrimary,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-lg font-black uppercase tracking-tight"
                  style={{ fontFamily: activeFontPairing.headingFont }}
                >
                  ShopMate AI <span style={{ color: activePalette.roles.accentPrimary }}>Theme Studio</span>
                </h1>
                <span
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border font-bold"
                  style={{
                    backgroundColor: `${activePalette.roles.accentPrimary}15`,
                    borderColor: `${activePalette.roles.accentPrimary}40`,
                    color: activePalette.roles.accentPrimary,
                  }}
                >
                  Frontend-Design v2.0
                </span>
              </div>
              <p className="text-xs" style={{ color: activePalette.roles.textMuted }}>
                Decoupled Palettes & Fonts • WCAG AA Live Engine • Constrained Role Shuffles • Shape & Motion Dynamics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
              style={{
                backgroundColor: activePalette.roles.bgCard,
                color: activePalette.roles.textPrimary,
                borderColor: activePalette.roles.borderSubtle,
              }}
            >
              <FileCode className="w-3.5 h-3.5" style={{ color: activePalette.roles.accentPrimary }} />
              <span>View Token Spec</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTokens}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-95"
              style={{
                backgroundColor: activePalette.roles.btnPrimary,
                color: activePalette.roles.btnText,
                borderColor: activePalette.roles.borderFocus,
              }}
            >
              {copiedTokens ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tokens Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy tokens.css</span>
                </>
              )}
            </button>

            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: activePalette.roles.bgSurface,
                  color: activePalette.roles.textSecondary,
                  borderColor: activePalette.roles.borderSubtle,
                }}
              >
                <span>Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Active Selection Hero Banner */}
        <div
          className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
          style={{
            backgroundColor: activePalette.roles.bgCard,
            borderColor: activePalette.roles.borderSubtle,
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[11px] font-mono uppercase tracking-widest font-bold"
                style={{ color: activePalette.roles.accentPrimary }}
              >
                Active Design System Configuration
              </span>
              {isCustomized && (
                <span
                  className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${activePalette.roles.stateWarning}20`,
                    color: activePalette.roles.stateWarning,
                    borderColor: `${activePalette.roles.stateWarning}40`,
                  }}
                >
                  Custom Swatch / Swapped
                </span>
              )}
            </div>

            <h2
              className="text-2xl md:text-3xl font-black uppercase tracking-tight"
              style={{ fontFamily: activeFontPairing.headingFont }}
            >
              {activePalette.name}
            </h2>
            <p className="text-xs mt-1" style={{ color: activePalette.roles.textSecondary }}>
              Typography: <strong style={{ color: activePalette.roles.textPrimary }}>{activeFontPairing.name}</strong> •{' '}
              Shape: <strong style={{ color: activePalette.roles.textPrimary }}>{shapeConfig.radius}</strong> •{' '}
              Shadow: <strong style={{ color: activePalette.roles.textPrimary }}>{shapeConfig.shadow}</strong> •{' '}
              Motion: <strong style={{ color: activePalette.roles.textPrimary }}>{shapeConfig.motion}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border"
              style={{
                backgroundColor: activePalette.roles.bgSurface,
                color: activePalette.roles.accentPrimary,
                borderColor: activePalette.roles.borderSubtle,
              }}
            >
              Accent: {activePalette.roles.accentPrimary}
            </span>
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border uppercase"
              style={{
                backgroundColor: activePalette.roles.bgSurface,
                color: activePalette.roles.textSecondary,
                borderColor: activePalette.roles.borderSubtle,
              }}
            >
              Mode: {activePalette.mode}
            </span>
          </div>
        </div>

        {/* Panel 1: Palette Selection & Customization */}
        <section>
          <PalettePicker
            palettes={curatedPalettes}
            activePalette={activePalette}
            onSelectPalette={handleSelectPalette}
            onUpdateRoleColor={handleUpdateRoleColor}
            isCustomized={isCustomized}
          />
        </section>

        {/* Panel 2: Accessibility & WCAG 2.1 Contrast Dashboard (Non-Negotiable) */}
        <section>
          <AccessibilityDashboard palette={activePalette} />
        </section>

        {/* Panel 3: Semantic Role Inspector, Role Swap & Constrained Shuffle */}
        <section>
          <RoleInspector
            palette={activePalette}
            basePalette={basePalette}
            swapHistory={swapHistory}
            onApplyRoles={handleApplyRoles}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onResetRoles={handleResetRoles}
          />
        </section>

        {/* Panel 4: Typography Selection & Full Type Scale */}
        <section>
          <TypographyPanel
            pairings={curatedFontPairings}
            activePairing={activeFontPairing}
            onSelectPairing={setActiveFontPairing}
            palette={activePalette}
          />
        </section>

        {/* Panel 5: Live Component Showcase (All Interactive States) */}
        <section>
          <ComponentShowcase
            palette={activePalette}
            fontPairing={activeFontPairing}
            shapeConfig={shapeConfig}
          />
        </section>

        {/* Panel 6: Neutral / Gray Scale Ramp */}
        <section>
          <NeutralScale palette={activePalette} />
        </section>

        {/* Panel 7: Shape, Depth & Motion */}
        <section>
          <ShapeMotionPanel
            palette={activePalette}
            shapeConfig={shapeConfig}
            onUpdateShapeConfig={setShapeConfig}
          />
        </section>
      </main>

      {/* Export Token Spec Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: activePalette.roles.scrim }}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border p-6 max-h-[85vh] flex flex-col shadow-2xl"
            style={{
              backgroundColor: activePalette.roles.bgCard,
              borderColor: activePalette.roles.borderSubtle,
              color: activePalette.roles.textPrimary,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: activePalette.roles.borderSubtle }}>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5" style={{ color: activePalette.roles.accentPrimary }} />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Exported tokens.css Spec (Single Source of Truth)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs mb-3" style={{ color: activePalette.roles.textMuted }}>
              This generated file is ready to drop into <code>frontend/src/styles/tokens.css</code> or directly into <code>index.css</code>.
            </p>

            <pre
              className="p-4 rounded-xl border flex-1 overflow-auto font-mono text-[11px] leading-relaxed select-all"
              style={{
                backgroundColor: activePalette.roles.bgCanvas,
                borderColor: activePalette.roles.borderSubtle,
                color: activePalette.roles.textSecondary,
              }}
            >
              {generateCompleteTokensCSS()}
            </pre>

            <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4" style={{ borderColor: activePalette.roles.borderSubtle }}>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer"
                style={{
                  backgroundColor: activePalette.roles.bgSurface,
                  borderColor: activePalette.roles.borderSubtle,
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopyTokens}
                className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                style={{
                  backgroundColor: activePalette.roles.btnPrimary,
                  color: activePalette.roles.btnText,
                }}
              >
                {copiedTokens ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTokens ? 'Copied to Clipboard' : 'Copy Full Token File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
