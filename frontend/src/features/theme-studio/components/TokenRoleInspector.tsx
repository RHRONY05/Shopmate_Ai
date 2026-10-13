import React from 'react';
import { SemanticPalette } from '../palettes';
import { Dices, RotateCcw, Sliders } from 'lucide-react';

interface TokenRoleInspectorProps {
  palette: SemanticPalette;
  onShuffleRoles: () => void;
  onResetRoles: () => void;
  isShuffled: boolean;
}

export const TokenRoleInspector: React.FC<TokenRoleInspectorProps> = ({
  palette,
  onShuffleRoles,
  onResetRoles,
  isShuffled,
}) => {
  const { roles } = palette;

  const roleDefinitions: Array<{ role: keyof typeof roles; label: string; desc: string }> = [
    { role: 'bgCanvas', label: 'Canvas Background', desc: 'Page-level background base (60%)' },
    { role: 'bgSurface', label: 'Surface Container', desc: 'Navigation bars, filters, and section wraps' },
    { role: 'bgCard', label: 'Card & Elevate', desc: 'Product cards, modal sheets, elevated panels' },
    { role: 'accentPrimary', label: 'Primary Accent', desc: 'Core focal point, brand cues, active pills (10%)' },
    { role: 'btnPrimary', label: 'Primary CTA Button', desc: 'Add to Cart, Checkout, primary interactive' },
    { role: 'textPrimary', label: 'Primary Text', desc: 'Headings, hero titles, high-contrast labels' },
    { role: 'borderSubtle', label: 'Subtle Borders', desc: 'Card dividers, subtle outline lines' },
    { role: 'borderFocus', label: 'Focus Ring & Active', desc: 'Input focus state and selected borders' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            className="text-sm font-semibold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textSecondary }}
          >
            <Sliders className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 3: Semantic Token Role Inspector & Color Shuffle
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Inspect UI role assignments or shuffle color positions within the selected palette
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShuffleRoles}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md border hover:opacity-95 active:scale-95"
            style={{
              backgroundColor: roles.btnPrimary,
              color: roles.btnText,
              borderColor: roles.borderFocus,
            }}
          >
            <Dices className="w-4 h-4 stroke-[2.5]" />
            <span>Shuffle Roles</span>
          </button>

          {isShuffled && (
            <button
              type="button"
              onClick={onResetRoles}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border text-neutral-300 hover:text-white"
              style={{
                backgroundColor: roles.bgSurface,
                borderColor: roles.borderSubtle,
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {roleDefinitions.map(({ role, label, desc }) => {
          const color = roles[role];
          return (
            <div
              key={role}
              className="p-3 rounded-xl border flex flex-col justify-between"
              style={{
                backgroundColor: roles.bgSurface,
                borderColor: roles.borderSubtle,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: roles.textPrimary }}
                  >
                    {label}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 line-clamp-1 mb-2">
                  {desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 font-mono text-[11px]">
                <span className="text-neutral-500 text-[10px]">{role}</span>
                <span className="font-semibold" style={{ color: roles.textSecondary }}>
                  {color}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
