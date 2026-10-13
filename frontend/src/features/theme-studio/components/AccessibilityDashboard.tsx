import React, { useState } from 'react';
import { SemanticPalette } from '../palettes';
import { checkContrast } from '../utils/contrast';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AccessibilityDashboardProps {
  palette: SemanticPalette;
}

interface ContrastCheckItem {
  id: string;
  label: string;
  textToken: string;
  bgToken: string;
  textHex: string;
  bgHex: string;
  usage: string;
  threshold: 'aa' | 'aaLarge' | 'ui';
  requiredRatio: number;
  critical?: boolean;
}

export const AccessibilityDashboard: React.FC<AccessibilityDashboardProps> = ({ palette }) => {
  const { roles } = palette;
  const [filter, setFilter] = useState<'all' | 'critical' | 'failed'>('all');

  const checkList: ContrastCheckItem[] = [
    // 1. Critical Base Body Checks
    {
      id: 'body-canvas',
      label: 'Body Text on Canvas Base',
      textToken: 'textPrimary',
      bgToken: 'bgCanvas',
      textHex: roles.textPrimary,
      bgHex: roles.bgCanvas,
      usage: 'Headings, main page titles, global viewport canvas',
      threshold: 'aa',
      requiredRatio: 4.5,
      critical: true,
    },
    {
      id: 'body-card',
      label: 'Body Text on Card Surface',
      textToken: 'textPrimary',
      bgToken: 'bgCard',
      textHex: roles.textPrimary,
      bgHex: roles.bgCard,
      usage: 'Product cards, modal sheet titles, drawer headings',
      threshold: 'aa',
      requiredRatio: 4.5,
      critical: true,
    },
    {
      id: 'body-surface',
      label: 'Body Text on Surface Container',
      textToken: 'textPrimary',
      bgToken: 'bgSurface',
      textHex: roles.textPrimary,
      bgHex: roles.bgSurface,
      usage: 'Navigation bar, filter drawer header, section headings',
      threshold: 'aa',
      requiredRatio: 4.5,
    },

    // 2. Secondary Text Checks
    {
      id: 'secondary-canvas',
      label: 'Secondary Text on Canvas',
      textToken: 'textSecondary',
      bgToken: 'bgCanvas',
      textHex: roles.textSecondary,
      bgHex: roles.bgCanvas,
      usage: 'Page subtitles, category descriptions',
      threshold: 'aa',
      requiredRatio: 4.5,
    },
    {
      id: 'secondary-card',
      label: 'Secondary Text on Card',
      textToken: 'textSecondary',
      bgToken: 'bgCard',
      textHex: roles.textSecondary,
      bgHex: roles.bgCard,
      usage: 'Jersey fabric specs, season dates, card descriptions',
      threshold: 'aa',
      requiredRatio: 4.5,
    },

    // 3. Button Checks
    {
      id: 'btn-text-primary',
      label: 'Button Label on Primary CTA',
      textToken: 'btnText',
      bgToken: 'btnPrimary',
      textHex: roles.btnText,
      bgHex: roles.btnPrimary,
      usage: 'Add to Cart, Checkout, Primary action buttons',
      threshold: 'aa',
      requiredRatio: 4.5,
      critical: true,
    },
    {
      id: 'btn-text-hover',
      label: 'Button Label on Hover CTA',
      textToken: 'btnText',
      bgToken: 'btnHover',
      textHex: roles.btnText,
      bgHex: roles.btnHover,
      usage: 'Primary button state when hovered by cursor',
      threshold: 'aa',
      requiredRatio: 4.5,
    },

    // 4. Accent Large Text Checks
    {
      id: 'accent-canvas',
      label: 'Accent on Canvas (Large/UI)',
      textToken: 'accentPrimary',
      bgToken: 'bgCanvas',
      textHex: roles.accentPrimary,
      bgHex: roles.bgCanvas,
      usage: 'Brand crest badges, active category tabs',
      threshold: 'aaLarge',
      requiredRatio: 3.0,
    },
    {
      id: 'accent-card',
      label: 'Accent on Card (Large/UI)',
      textToken: 'accentPrimary',
      bgToken: 'bgCard',
      textHex: roles.accentPrimary,
      bgHex: roles.bgCard,
      usage: 'Selected size highlight border, card accents',
      threshold: 'aaLarge',
      requiredRatio: 3.0,
    },

    // 5. Muted Text Checks
    {
      id: 'muted-canvas',
      label: 'Muted Text on Canvas',
      textToken: 'textMuted',
      bgToken: 'bgCanvas',
      textHex: roles.textMuted,
      bgHex: roles.bgCanvas,
      usage: 'Footnotes, copyright, legal disclaimer on canvas',
      threshold: 'aa',
      requiredRatio: 4.5,
    },
    {
      id: 'muted-surface',
      label: 'Muted Text on Surface (Watchlist)',
      textToken: 'textMuted',
      bgToken: 'bgSurface',
      textHex: roles.textMuted,
      bgHex: roles.bgSurface,
      usage: 'Header breadcrumbs, menu subtext (often fails AA)',
      threshold: 'aa',
      requiredRatio: 4.5,
    },

    // 6. UI Focus Ring Check
    {
      id: 'focus-ring-canvas',
      label: 'Focus Ring on Canvas',
      textToken: 'borderFocus',
      bgToken: 'bgCanvas',
      textHex: roles.borderFocus,
      bgHex: roles.bgCanvas,
      usage: 'Keyboard navigation visible focus ring state',
      threshold: 'ui',
      requiredRatio: 3.0,
    },

    // 7. Semantic States on Card
    {
      id: 'state-success-card',
      label: 'Success State on Card',
      textToken: 'stateSuccess',
      bgToken: 'bgCard',
      textHex: roles.stateSuccess,
      bgHex: roles.bgCard,
      usage: 'In-stock badge, verified authentic jersey badge',
      threshold: 'ui',
      requiredRatio: 3.0,
    },
    {
      id: 'state-warning-card',
      label: 'Warning State on Card',
      textToken: 'stateWarning',
      bgToken: 'bgCard',
      textHex: roles.stateWarning,
      bgHex: roles.bgCard,
      usage: 'Low inventory alert (only 2 left in size M)',
      threshold: 'ui',
      requiredRatio: 3.0,
    },
    {
      id: 'state-error-card',
      label: 'Error State on Card',
      textToken: 'stateError',
      bgToken: 'bgCard',
      textHex: roles.stateError,
      bgHex: roles.bgCard,
      usage: 'Sold out notification, invalid payment warning',
      threshold: 'ui',
      requiredRatio: 3.0,
    },
    {
      id: 'state-info-card',
      label: 'Info State on Card',
      textToken: 'stateInfo',
      bgToken: 'bgCard',
      textHex: roles.stateInfo,
      bgHex: roles.bgCard,
      usage: 'AI stylist recommendation tip, shipping ETA',
      threshold: 'ui',
      requiredRatio: 3.0,
    },
  ];

  // Evaluate results
  const evaluated = checkList.map((check) => {
    const res = checkContrast(check.textHex, check.bgHex);
    let passes = false;
    if (check.threshold === 'aa') {
      passes = res.aa;
    } else {
      passes = res.aaLarge; // For large text and UI components (3:1)
    }
    return { ...check, res, passes };
  });

  const criticalFailures = evaluated.filter((c) => c.critical && !c.passes);
  const totalPassCount = evaluated.filter((c) => c.passes).length;
  const totalCount = evaluated.length;

  const filteredItems = evaluated.filter((item) => {
    if (filter === 'critical') return item.critical;
    if (filter === 'failed') return !item.passes;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with pass counts & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textPrimary }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 2: Accessibility & WCAG 2.1 Contrast Dashboard
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Non-negotiable automated testing of 16 essential text and component UI combinations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono font-bold border flex items-center gap-1.5 shadow-sm"
            style={{
              backgroundColor:
                criticalFailures.length > 0 ? `${roles.stateError}20` : `${roles.stateSuccess}20`,
              color: criticalFailures.length > 0 ? roles.stateError : roles.stateSuccess,
              borderColor:
                criticalFailures.length > 0 ? `${roles.stateError}40` : `${roles.stateSuccess}40`,
            }}
          >
            {criticalFailures.length > 0 ? (
              <>
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{criticalFailures.length} Critical Violations</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {totalPassCount}/{totalCount} Checks Passing
                </span>
              </>
            )}
          </span>

          {/* Quick Filter Buttons */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-xs"
            style={{
              backgroundColor: roles.bgSurface,
              borderColor: roles.borderSubtle,
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'all' ? 'font-bold' : 'opacity-70'
              }`}
              style={{
                backgroundColor: filter === 'all' ? roles.bgCard : 'transparent',
                color: roles.textPrimary,
              }}
            >
              All (16)
            </button>
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'critical' ? 'font-bold' : 'opacity-70'
              }`}
              style={{
                backgroundColor: filter === 'critical' ? roles.bgCard : 'transparent',
                color: roles.textPrimary,
              }}
            >
              Critical
            </button>
            <button
              type="button"
              onClick={() => setFilter('failed')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filter === 'failed' ? 'font-bold text-red-500' : 'opacity-70'
              }`}
              style={{
                backgroundColor: filter === 'failed' ? roles.bgCard : 'transparent',
                color: filter === 'failed' ? roles.stateError : roles.textSecondary,
              }}
            >
              Failed ({evaluated.filter((c) => !c.passes).length})
            </button>
          </div>
        </div>
      </div>

      {/* Critical Failure Banner */}
      {criticalFailures.length > 0 && (
        <div
          className="p-4 rounded-xl border flex items-start gap-3 shadow-md animate-pulse"
          style={{
            backgroundColor: `${roles.stateError}15`,
            borderColor: roles.stateError,
            color: roles.textPrimary,
          }}
        >
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: roles.stateError }} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide" style={{ color: roles.stateError }}>
              Critical Accessibility Violation Detected
            </h4>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: roles.textSecondary }}>
              One or more essential reading pairs (such as primary text or button CTA labels) fail the mandatory
              WCAG 2.1 AA 4.5:1 ratio. This theme will produce severe legibility issues for real customers. Use Panel 3 to swap roles or select an accessible palette.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Contrast Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border flex flex-col justify-between shadow-sm transition-all"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: item.passes ? roles.borderSubtle : `${roles.stateError}60`,
            }}
          >
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold truncate" style={{ color: roles.textPrimary }}>
                  {item.label}
                </span>

                {item.res.aaa ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
                    AAA PASS
                  </span>
                ) : item.passes ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 font-mono">
                    AA PASS
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono flex items-center gap-1"
                    style={{
                      backgroundColor: `${roles.stateError}15`,
                      color: roles.stateError,
                      borderColor: `${roles.stateError}40`,
                    }}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" /> FAIL
                  </span>
                )}
              </div>

              <p className="text-[10px] leading-relaxed line-clamp-1" style={{ color: roles.textMuted }}>
                {item.usage}
              </p>
            </div>

            {/* Live Visual Sample Swatch */}
            <div
              className="p-2.5 rounded-lg border text-center font-medium text-xs flex items-center justify-between shadow-inner"
              style={{
                backgroundColor: item.bgHex,
                color: item.textHex,
                borderColor: roles.borderSubtle,
              }}
            >
              <span className="text-[11px] truncate font-medium">Sample Preview</span>
              <span className="font-mono text-[11px] font-bold shrink-0 ml-2">
                {item.res.ratio}:1{' '}
                <span className="opacity-75 text-[10px]">(&ge;{item.requiredRatio}:1)</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
