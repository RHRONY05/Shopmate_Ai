import React, { useState } from 'react';
import { SemanticPalette, SemanticPaletteRoles } from '../palettes';
import { Check, Sparkles, Sun, Moon, SlidersHorizontal } from 'lucide-react';

interface PalettePickerProps {
  palettes: SemanticPalette[];
  activePalette: SemanticPalette;
  onSelectPalette: (palette: SemanticPalette) => void;
  onUpdateRoleColor: (roleKey: keyof SemanticPaletteRoles, newColor: string) => void;
  isCustomized: boolean;
}

export const PalettePicker: React.FC<PalettePickerProps> = ({
  palettes,
  activePalette,
  onSelectPalette,
  onUpdateRoleColor,
  isCustomized,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'light' | 'dark'>('all');
  const [editingRole, setEditingRole] = useState<keyof SemanticPaletteRoles | null>(null);

  const filteredPalettes = palettes.filter((p) => {
    if (filterMode === 'all') return true;
    return p.mode === filterMode;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: activePalette.roles.textPrimary }}
          >
            <Sparkles className="w-4 h-4" style={{ color: activePalette.roles.accentPrimary }} />
            Panel 1: Palette Selection & Customization
          </h3>
          <p className="text-xs" style={{ color: activePalette.roles.textMuted }}>
            8 curated football-kitroom palettes (4 light, 4 dark counterparts) • Click swatches to edit hex values live
          </p>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center p-1 rounded-xl border text-xs font-semibold"
            style={{
              backgroundColor: activePalette.roles.bgSurface,
              borderColor: activePalette.roles.borderSubtle,
            }}
          >
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'all' ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? activePalette.roles.btnPrimary : 'transparent',
                color: filterMode === 'all' ? activePalette.roles.btnText : activePalette.roles.textSecondary,
              }}
            >
              All ({palettes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('light')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'light' ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterMode === 'light' ? activePalette.roles.btnPrimary : 'transparent',
                color: filterMode === 'light' ? activePalette.roles.btnText : activePalette.roles.textSecondary,
              }}
            >
              <Sun className="w-3 h-3" />
              Light (4)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('dark')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'dark' ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterMode === 'dark' ? activePalette.roles.btnPrimary : 'transparent',
                color: filterMode === 'dark' ? activePalette.roles.btnText : activePalette.roles.textSecondary,
              }}
            >
              <Moon className="w-3 h-3" />
              Dark (4)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Palette Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredPalettes.map((palette) => {
          const isSelected = palette.id === activePalette.id;
          return (
            <div
              key={palette.id}
              onClick={() => onSelectPalette(palette)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                isSelected ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: activePalette.roles.bgCard,
                borderColor: isSelected ? activePalette.roles.accentPrimary : activePalette.roles.borderSubtle,
                boxShadow: isSelected ? `0 0 0 2px ${activePalette.roles.accentPrimary}40` : undefined,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                      style={{
                        backgroundColor: palette.mode === 'light' ? '#FEF3C7' : '#1E293B',
                        color: palette.mode === 'light' ? '#92400E' : '#94A3B8',
                        borderColor: palette.mode === 'light' ? '#FDE68A' : '#334155',
                      }}
                    >
                      {palette.mode === 'light' ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                      {palette.mode.toUpperCase()}
                    </span>
                    {isSelected && isCustomized && (
                      <span
                        className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${activePalette.roles.stateWarning}20`,
                          color: activePalette.roles.stateWarning,
                          borderColor: `${activePalette.roles.stateWarning}40`,
                        }}
                      >
                        Customized
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: activePalette.roles.accentPrimary }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h4
                  className="font-bold text-xs line-clamp-1 mb-1"
                  style={{ color: activePalette.roles.textPrimary }}
                >
                  {palette.name}
                </h4>

                <p
                  className="text-[11px] mb-3.5 line-clamp-2 leading-relaxed"
                  style={{ color: activePalette.roles.textSecondary }}
                >
                  {palette.tagline}
                </p>
              </div>

              {/* Palette Color Strip */}
              <div
                className="grid grid-cols-6 h-6 rounded-lg overflow-hidden border shadow-inner"
                style={{ borderColor: activePalette.roles.borderSubtle }}
              >
                <div
                  style={{ backgroundColor: palette.roles.bgCanvas }}
                  title={`Canvas: ${palette.roles.bgCanvas}`}
                />
                <div
                  style={{ backgroundColor: palette.roles.bgSurface }}
                  title={`Surface: ${palette.roles.bgSurface}`}
                />
                <div
                  style={{ backgroundColor: palette.roles.bgCard }}
                  title={`Card: ${palette.roles.bgCard}`}
                />
                <div
                  style={{ backgroundColor: palette.roles.accentPrimary }}
                  title={`Accent: ${palette.roles.accentPrimary}`}
                />
                <div
                  style={{ backgroundColor: palette.roles.textPrimary }}
                  title={`Text: ${palette.roles.textPrimary}`}
                />
                <div
                  style={{ backgroundColor: palette.roles.borderFocus }}
                  title={`Focus: ${palette.roles.borderFocus}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Swatch Quick Color Tweaker */}
      <div
        className="p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
        style={{
          backgroundColor: activePalette.roles.bgSurface,
          borderColor: activePalette.roles.borderSubtle,
        }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: activePalette.roles.accentPrimary }} />
          <span className="font-semibold" style={{ color: activePalette.roles.textPrimary }}>
            Active Palette Swatch Tuner:
          </span>
          <span style={{ color: activePalette.roles.textMuted }}>
            Click any swatch to tweak hex values directly in the studio
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['accentPrimary', 'Accent'],
              ['btnPrimary', 'Button'],
              ['bgCanvas', 'Canvas'],
              ['bgSurface', 'Surface'],
              ['bgCard', 'Card'],
              ['textPrimary', 'Text'],
            ] as const
          ).map(([roleKey, label]) => {
            const currentColor = activePalette.roles[roleKey];
            const isEditing = editingRole === roleKey;
            return (
              <div
                key={roleKey}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: activePalette.roles.bgCard,
                  borderColor: isEditing ? activePalette.roles.accentPrimary : activePalette.roles.borderSubtle,
                }}
              >
                <input
                  type="color"
                  value={currentColor.startsWith('#') ? currentColor : '#000000'}
                  onChange={(e) => onUpdateRoleColor(roleKey, e.target.value)}
                  onFocus={() => setEditingRole(roleKey)}
                  onBlur={() => setEditingRole(null)}
                  className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title={`Tweak ${label} (${roleKey})`}
                />
                <span className="font-medium" style={{ color: activePalette.roles.textSecondary }}>
                  {label}
                </span>
                <span className="font-mono text-[10px]" style={{ color: activePalette.roles.textMuted }}>
                  {currentColor}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
