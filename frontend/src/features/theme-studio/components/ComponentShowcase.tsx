import React, { useState } from 'react';
import { SemanticPalette } from '../palettes';
import { FontPairing } from '../fonts';
import { ShapeConfig, radiusPresets } from '../shape-presets';
import {
  ShoppingBag,
  Search,
  Shirt,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
} from 'lucide-react';

interface ComponentShowcaseProps {
  palette: SemanticPalette;
  fontPairing: FontPairing;
  shapeConfig: ShapeConfig;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  palette,
  fontPairing,
  shapeConfig,
}) => {
  const { roles } = palette;
  const radius = radiusPresets[shapeConfig.radius].tokens;

  // Interactive states for showcase controls
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [hasBadge, setHasBadge] = useState<boolean>(true);
  const [hasNamePrinting, setHasNamePrinting] = useState<boolean>(true);
  const [activeCardSelected, setActiveCardSelected] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('Arsenal retro home');
  const [activeTab, setActiveTab] = useState<'kit' | 'buttons' | 'inputs' | 'states'>('kit');

  const basePrice = 85.0;
  const customizationFee = (hasNamePrinting ? 15.0 : 0) + (hasBadge ? 5.0 : 0);
  const totalPrice = (basePrice + customizationFee).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textPrimary }}
          >
            <Shirt className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 5: Interactive Component Showcase (All Production States)
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Real components reacting live to active palette, font DNA, radius ({shapeConfig.radius}), and elevation ({shapeConfig.shadow})
          </p>
        </div>

        {/* Tab Filters */}
        <div
          className="flex items-center p-1 rounded-xl border text-xs font-semibold"
          style={{
            backgroundColor: roles.bgSurface,
            borderColor: roles.borderSubtle,
          }}
        >
          {(
            [
              ['kit', 'Domain Kit Card'],
              ['buttons', 'All Buttons'],
              ['inputs', 'Inputs & Forms'],
              ['states', 'Badges & Alerts'],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: activeTab === tabKey ? roles.btnPrimary : 'transparent',
                color: activeTab === tabKey ? roles.btnText : roles.textSecondary,
                borderRadius: radius.radiusSm,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECTION 1: DOMAIN COMPONENT - Authentic Kit Card */}
        {(activeTab === 'kit' || activeTab === 'buttons') && (
          <div
            className="p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: activeCardSelected ? roles.accentPrimary : roles.borderSubtle,
              borderRadius: radius.radiusLg,
              boxShadow: activeCardSelected ? `0 0 0 2px ${roles.accentPrimary}40` : undefined,
            }}
          >
            <div>
              {/* Badge & League Row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border"
                      style={{
                        backgroundColor: `${roles.accentPrimary}15`,
                        color: roles.accentPrimary,
                        borderColor: `${roles.accentPrimary}40`,
                        borderRadius: radius.radiusPill,
                      }}
                    >
                      Premier League
                    </span>
                    <span
                      className="text-[10px] uppercase font-bold px-2.5 py-0.5 border"
                      style={{
                        backgroundColor: `${roles.stateSuccess}15`,
                        color: roles.stateSuccess,
                        borderColor: `${roles.stateSuccess}40`,
                        borderRadius: radius.radiusPill,
                      }}
                    >
                      In Stock (8 left)
                    </span>
                  </div>
                  <h4
                    className="text-xl font-bold tracking-tight uppercase"
                    style={{
                      fontFamily: fontPairing.headingFont,
                      color: roles.textPrimary,
                    }}
                  >
                    Arsenal 2024/25 Authentic Home Kit
                  </h4>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: fontPairing.bodyFont,
                      color: roles.textMuted,
                    }}
                  >
                    Official Matchday Player Edition with 3D heat-sealed crest
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span
                    className="text-2xl font-black font-mono"
                    style={{ color: roles.textPrimary }}
                  >
                    {totalPrice} USD
                  </span>
                  <p className="text-[10px] font-mono" style={{ color: roles.accentPrimary }}>
                    Server-calculated
                  </p>
                </div>
              </div>

              {/* Size Selectors */}
              <div className="mb-4">
                <span className="text-xs font-semibold block mb-2" style={{ color: roles.textSecondary }}>
                  Select Size (European Fit):
                </span>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className="w-10 h-10 border text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center shadow-xs"
                        style={{
                          backgroundColor: isSelected ? roles.btnPrimary : roles.bgSurface,
                          color: isSelected ? roles.btnText : roles.textPrimary,
                          borderColor: isSelected ? roles.borderFocus : roles.borderSubtle,
                          borderRadius: radius.radiusMd,
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Addons Checklist */}
              <div className="mb-4 space-y-2">
                <span className="text-xs font-semibold block" style={{ color: roles.textSecondary }}>
                  Custom Kit Customizations:
                </span>
                <label
                  className="flex items-center justify-between p-2.5 border cursor-pointer text-xs"
                  style={{
                    backgroundColor: roles.bgSurface,
                    borderColor: roles.borderSubtle,
                    borderRadius: radius.radiusSm,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasNamePrinting}
                      onChange={(e) => setHasNamePrinting(e.target.checked)}
                      className="cursor-pointer accent-emerald-500"
                    />
                    <span style={{ color: roles.textPrimary }}>Player Printing: Saka #7</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: roles.accentPrimary }}>
                    +15.00 USD
                  </span>
                </label>

                <label
                  className="flex items-center justify-between p-2.5 border cursor-pointer text-xs"
                  style={{
                    backgroundColor: roles.bgSurface,
                    borderColor: roles.borderSubtle,
                    borderRadius: radius.radiusSm,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasBadge}
                      onChange={(e) => setHasBadge(e.target.checked)}
                      className="cursor-pointer accent-emerald-500"
                    />
                    <span style={{ color: roles.textPrimary }}>Official League Sleeve Patch</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: roles.accentPrimary }}>
                    +05.00 USD
                  </span>
                </label>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: roles.borderSubtle }}>
              <button
                type="button"
                onClick={() => setActiveCardSelected(!activeCardSelected)}
                className="flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 active:scale-95 transition-all"
                style={{
                  backgroundColor: roles.btnPrimary,
                  color: roles.btnText,
                  borderRadius: radius.radiusMd,
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Kit to Bag ({totalPrice} USD)</span>
              </button>

              <button
                type="button"
                className="p-3 border flex items-center justify-center cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: roles.bgSurface,
                  color: roles.textPrimary,
                  borderColor: roles.borderSubtle,
                  borderRadius: radius.radiusMd,
                }}
                title="Save kit to wishlist"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: BUTTON STATES SPECTRUM */}
        {(activeTab === 'kit' || activeTab === 'buttons') && (
          <div
            className="p-5 border space-y-4 shadow-sm"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: roles.borderSubtle,
              borderRadius: radius.radiusLg,
            }}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
                Button Primary & Secondary All States
              </h4>
              <p className="text-[11px]" style={{ color: roles.textMuted }}>
                Tested in Idle, Hover, Active, Focus, Disabled, and Loading states
              </p>
            </div>

            <div className="space-y-3">
              {/* Primary Buttons State Matrix */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase block" style={{ color: roles.textMuted }}>
                  Primary Button States
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold shadow-sm"
                    style={{
                      backgroundColor: roles.btnPrimary,
                      color: roles.btnText,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Idle
                  </button>

                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold shadow-md"
                    style={{
                      backgroundColor: roles.btnHover,
                      color: roles.btnText,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Hover State
                  </button>

                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold ring-2"
                    style={{
                      backgroundColor: roles.btnPrimary,
                      color: roles.btnText,
                      boxShadow: `0 0 0 3px ${roles.bgCanvas}, 0 0 0 5px ${roles.borderFocus}`,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Focus Visible
                  </button>

                  <button
                    type="button"
                    disabled
                    className="p-2.5 text-xs font-bold opacity-40 cursor-not-allowed"
                    style={{
                      backgroundColor: roles.btnPrimary,
                      color: roles.btnText,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Disabled
                  </button>

                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: roles.btnPrimary,
                      color: roles.btnText,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading...</span>
                  </button>

                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: roles.accentSecondary,
                      color: '#FFFFFF',
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Secondary CTA
                  </button>
                </div>
              </div>

              {/* Secondary & Ghost Buttons */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono uppercase block" style={{ color: roles.textMuted }}>
                  Secondary & Ghost Buttons
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold border"
                    style={{
                      backgroundColor: roles.bgSurface,
                      borderColor: roles.borderSubtle,
                      color: roles.textPrimary,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Ghost Idle
                  </button>

                  <button
                    type="button"
                    className="p-2.5 text-xs font-bold border"
                    style={{
                      backgroundColor: roles.bgCardHover,
                      borderColor: roles.borderFocus,
                      color: roles.textPrimary,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Ghost Hover
                  </button>

                  <button
                    type="button"
                    disabled
                    className="p-2.5 text-xs font-bold border opacity-40 cursor-not-allowed"
                    style={{
                      backgroundColor: roles.bgSurface,
                      borderColor: roles.borderSubtle,
                      color: roles.textMuted,
                      borderRadius: radius.radiusMd,
                    }}
                  >
                    Ghost Disabled
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: INPUT FIELDS */}
        {(activeTab === 'kit' || activeTab === 'inputs') && (
          <div
            className="p-5 border space-y-4 shadow-sm"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: roles.borderSubtle,
              borderRadius: radius.radiusLg,
            }}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
                Input Fields & Search States
              </h4>
              <p className="text-[11px]" style={{ color: roles.textMuted }}>
                Empty, focused, filled, error, and disabled input fields
              </p>
            </div>

            <div className="space-y-3">
              {/* Focused Search Input */}
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: roles.textSecondary }}>
                  Interactive Live Input (Focus & Edit):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: roles.textMuted }} />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search kits, players, leagues..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs border outline-none font-medium transition-all"
                    style={{
                      backgroundColor: roles.bgSurface,
                      borderColor: roles.borderFocus,
                      color: roles.textPrimary,
                      borderRadius: radius.radiusMd,
                      boxShadow: `0 0 0 2px ${roles.borderFocus}25`,
                    }}
                  />
                </div>
              </div>

              {/* Error Input */}
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: roles.stateError }}>
                  Validation Error State:
                </label>
                <input
                  type="text"
                  readOnly
                  value="1234-INVALID-KIT-CODE"
                  className="w-full px-3 py-2.5 text-xs border font-mono outline-none"
                  style={{
                    backgroundColor: `${roles.stateError}10`,
                    borderColor: roles.stateError,
                    color: roles.stateError,
                    borderRadius: radius.radiusMd,
                  }}
                />
                <span className="text-[10px] block mt-1" style={{ color: roles.stateError }}>
                  Promo voucher code expired or not recognized.
                </span>
              </div>

              {/* Disabled Input */}
              <div>
                <label className="text-[11px] font-semibold block mb-1 opacity-60" style={{ color: roles.textMuted }}>
                  Disabled Input State:
                </label>
                <input
                  type="text"
                  disabled
                  value="European Delivery (Unavailable for this item)"
                  className="w-full px-3 py-2.5 text-xs border opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: roles.bgSurface,
                    borderColor: roles.borderSubtle,
                    color: roles.textMuted,
                    borderRadius: radius.radiusMd,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: BADGES, ALERTS & SKELETON */}
        {(activeTab === 'kit' || activeTab === 'states') && (
          <div
            className="p-5 border space-y-4 shadow-sm"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: roles.borderSubtle,
              borderRadius: radius.radiusLg,
            }}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
                Semantic Badges, Alerts & Skeletons
              </h4>
              <p className="text-[11px]" style={{ color: roles.textMuted }}>
                Live state badges and loading shimmer components
              </p>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-1 text-[11px] font-bold border flex items-center gap-1"
                style={{
                  backgroundColor: `${roles.stateSuccess}15`,
                  color: roles.stateSuccess,
                  borderColor: `${roles.stateSuccess}40`,
                  borderRadius: radius.radiusPill,
                }}
              >
                <CheckCircle className="w-3 h-3" /> In Stock
              </span>

              <span
                className="px-2.5 py-1 text-[11px] font-bold border flex items-center gap-1"
                style={{
                  backgroundColor: `${roles.stateWarning}15`,
                  color: roles.stateWarning,
                  borderColor: `${roles.stateWarning}40`,
                  borderRadius: radius.radiusPill,
                }}
              >
                <AlertTriangle className="w-3 h-3" /> Low Stock
              </span>

              <span
                className="px-2.5 py-1 text-[11px] font-bold border flex items-center gap-1"
                style={{
                  backgroundColor: `${roles.stateError}15`,
                  color: roles.stateError,
                  borderColor: `${roles.stateError}40`,
                  borderRadius: radius.radiusPill,
                }}
              >
                <AlertOctagon className="w-3 h-3" /> Sold Out
              </span>

              <span
                className="px-2.5 py-1 text-[11px] font-bold border flex items-center gap-1"
                style={{
                  backgroundColor: `${roles.stateInfo}15`,
                  color: roles.stateInfo,
                  borderColor: `${roles.stateInfo}40`,
                  borderRadius: radius.radiusPill,
                }}
              >
                <Info className="w-3 h-3" /> AI Stylist
              </span>
            </div>

            {/* Toast/Alert Box */}
            <div
              className="p-3.5 border flex items-start gap-3 shadow-xs"
              style={{
                backgroundColor: `${roles.stateSuccess}10`,
                borderColor: `${roles.stateSuccess}40`,
                borderRadius: radius.radiusMd,
              }}
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: roles.stateSuccess }} />
              <div>
                <span className="text-xs font-bold block" style={{ color: roles.textPrimary }}>
                  Added to Cart: Saka #7 Jersey
                </span>
                <p className="text-[11px] mt-0.5" style={{ color: roles.textSecondary }}>
                  Authentic Premier League heat-sealed patch included. Free shipping unlocked.
                </p>
              </div>
            </div>

            {/* Loading Skeleton */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase block" style={{ color: roles.textMuted }}>
                Loading Skeleton Shimmer
              </span>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 animate-pulse shrink-0"
                  style={{
                    backgroundColor: roles.bgSurface,
                    borderRadius: radius.radiusMd,
                  }}
                />
                <div className="space-y-1.5 flex-1">
                  <div
                    className="h-3.5 w-3/4 animate-pulse"
                    style={{
                      backgroundColor: roles.bgSurface,
                      borderRadius: radius.radiusSm,
                    }}
                  />
                  <div
                    className="h-2.5 w-1/2 animate-pulse"
                    style={{
                      backgroundColor: roles.bgSurface,
                      borderRadius: radius.radiusSm,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
