import React, { useState } from 'react';
import { SemanticPalette, SemanticPaletteRoles } from '../palettes';
import {
  roleDefinitions,
  RoleSwapRecord,
  swapRoles,
  shuffleWithinGroups,
} from '../utils/roles';
import {
  Sliders,
  Dices,
  RotateCcw,
  ArrowLeftRight,
  History,
  X,
  AlertTriangle,
} from 'lucide-react';

interface RoleInspectorProps {
  palette: SemanticPalette;
  basePalette: SemanticPalette;
  swapHistory: RoleSwapRecord[];
  onApplyRoles: (newRoles: SemanticPaletteRoles, historyItem?: RoleSwapRecord) => void;
  onRemoveHistoryItem: (recordId: string) => void;
  onResetRoles: () => void;
}

export const RoleInspector: React.FC<RoleInspectorProps> = ({
  palette,
  basePalette,
  swapHistory,
  onApplyRoles,
  onRemoveHistoryItem,
  onResetRoles,
}) => {
  const { roles } = palette;
  const [selectedRoleA, setSelectedRoleA] = useState<keyof SemanticPaletteRoles>('accentPrimary');
  const [selectedRoleB, setSelectedRoleB] = useState<keyof SemanticPaletteRoles>('accentSecondary');
  const [shuffleError, setShuffleError] = useState<string | null>(null);

  // Quick swap presets
  const quickSwapPresets: Array<{
    label: string;
    roleA: keyof SemanticPaletteRoles;
    roleB: keyof SemanticPaletteRoles;
  }> = [
    { label: 'Accent Primary ⇄ Secondary', roleA: 'accentPrimary', roleB: 'accentSecondary' },
    { label: 'Canvas ⇄ Surface', roleA: 'bgCanvas', roleB: 'bgSurface' },
    { label: 'Surface ⇄ Card', roleA: 'bgSurface', roleB: 'bgCard' },
    { label: 'Text Primary ⇄ Secondary', roleA: 'textPrimary', roleB: 'textSecondary' },
  ];

  const handleExecuteSwap = (
    roleA: keyof SemanticPaletteRoles,
    roleB: keyof SemanticPaletteRoles,
    label?: string
  ) => {
    if (roleA === roleB) return;
    const updated = swapRoles(roles, roleA, roleB);
    const record: RoleSwapRecord = {
      id: `swap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: label || `${roleA} ⇄ ${roleB}`,
      roleA,
      roleB,
      timestamp: Date.now(),
    };
    onApplyRoles(updated, record);
    setShuffleError(null);
  };

  const handleShuffleClick = () => {
    const result = shuffleWithinGroups(roles);
    if (result.success) {
      const record: RoleSwapRecord = {
        id: `shuffle-${Date.now()}`,
        label: 'Constrained Group Shuffle',
        roleA: 'bgCanvas',
        roleB: 'bgCard',
        timestamp: Date.now(),
      };
      onApplyRoles(result.roles, record);
      setShuffleError(null);
    } else {
      setShuffleError('No accessible shuffle could be found that satisfies WCAG 2.1 AA critical contrast.');
      setTimeout(() => setShuffleError(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textPrimary }}
          >
            <Sliders className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 3: Semantic Role Inspector, Role Swap & Constrained Shuffle
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Deliberately swap meaningful pairs or explore safe permutations constrained within compatible groups
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffleClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: roles.btnPrimary,
              color: roles.btnText,
            }}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Shuffle Groups</span>
          </button>

          {swapHistory.length > 0 && (
            <button
              type="button"
              onClick={onResetRoles}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: roles.bgSurface,
                borderColor: roles.borderSubtle,
                color: roles.textSecondary,
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Base</span>
            </button>
          )}
        </div>
      </div>

      {/* Shuffle Error Notification */}
      {shuffleError && (
        <div
          className="p-3 rounded-xl border flex items-center gap-2 text-xs font-medium"
          style={{
            backgroundColor: `${roles.stateWarning}15`,
            borderColor: roles.stateWarning,
            color: roles.textPrimary,
          }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{shuffleError}</span>
        </div>
      )}

      {/* Deliberate Swap Controls Container */}
      <div
        className="p-4 rounded-2xl border space-y-3.5"
        style={{
          backgroundColor: roles.bgSurface,
          borderColor: roles.borderSubtle,
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Quick Preset Swaps */}
          <div>
            <span
              className="text-[11px] font-bold uppercase tracking-wider block mb-2"
              style={{ color: roles.textSecondary }}
            >
              Meaningful Pair Swaps (1-Click)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickSwapPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleExecuteSwap(preset.roleA, preset.roleB, preset.label)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 shadow-sm"
                  style={{
                    backgroundColor: roles.bgCard,
                    borderColor: roles.borderSubtle,
                    color: roles.textPrimary,
                  }}
                >
                  <ArrowLeftRight className="w-3 h-3" style={{ color: roles.accentPrimary }} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dropdown Role Swap */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 lg:pt-0">
            <span
              className="text-[11px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: roles.textSecondary }}
            >
              Custom Pair:
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedRoleA}
                onChange={(e) => setSelectedRoleA(e.target.value as keyof SemanticPaletteRoles)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer"
                style={{
                  backgroundColor: roles.bgCard,
                  borderColor: roles.borderSubtle,
                  color: roles.textPrimary,
                }}
              >
                {roleDefinitions.map((d) => (
                  <option key={d.role} value={d.role}>
                    {d.label} ({d.role})
                  </option>
                ))}
              </select>

              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" style={{ color: roles.textMuted }} />

              <select
                value={selectedRoleB}
                onChange={(e) => setSelectedRoleB(e.target.value as keyof SemanticPaletteRoles)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer"
                style={{
                  backgroundColor: roles.bgCard,
                  borderColor: roles.borderSubtle,
                  color: roles.textPrimary,
                }}
              >
                {roleDefinitions.map((d) => (
                  <option key={d.role} value={d.role}>
                    {d.label} ({d.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  handleExecuteSwap(
                    selectedRoleA,
                    selectedRoleB,
                    `${selectedRoleA} ⇄ ${selectedRoleB}`
                  )
                }
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-sm hover:opacity-90"
                style={{
                  backgroundColor: roles.accentPrimary,
                  color: '#FFFFFF',
                  borderColor: roles.accentPrimary,
                }}
              >
                Swap
              </button>
            </div>
          </div>
        </div>

        {/* Swap History Chips */}
        {swapHistory.length > 0 && (
          <div
            className="pt-3 border-t flex flex-wrap items-center gap-2"
            style={{ borderColor: roles.borderSubtle }}
          >
            <div className="flex items-center gap-1.5 text-xs" style={{ color: roles.textSecondary }}>
              <History className="w-3.5 h-3.5" />
              <span className="font-semibold">Applied Swaps:</span>
            </div>
            {swapHistory.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs"
                style={{
                  backgroundColor: roles.bgCard,
                  borderColor: roles.borderSubtle,
                  color: roles.textPrimary,
                }}
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={() => onRemoveHistoryItem(item.id)}
                  className="hover:opacity-100 opacity-60 transition-opacity ml-1 cursor-pointer"
                  title="Remove this swap"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Semantic Role Inspector Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: roles.bgCard,
          borderColor: roles.borderSubtle,
        }}
      >
        <div
          className="p-3.5 border-b flex items-center justify-between"
          style={{ borderColor: roles.borderSubtle }}
        >
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
            Active Semantic Role Map ({roleDefinitions.length} Tokens)
          </span>
          <span className="text-[11px] font-mono" style={{ color: roles.textMuted }}>
            Base Source: {basePalette.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {roleDefinitions.map((def) => {
            const hex = roles[def.role];
            return (
              <div
                key={def.role}
                className="p-3 rounded-xl border flex flex-col justify-between"
                style={{
                  backgroundColor: roles.bgSurface,
                  borderColor: roles.borderSubtle,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: roles.textPrimary }}>
                      {def.label}
                    </span>
                    <span
                      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: roles.bgCard,
                        borderColor: roles.borderSubtle,
                        color: roles.textSecondary,
                      }}
                    >
                      {def.group}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed mb-2" style={{ color: roles.textSecondary }}>
                    {def.description}
                  </p>
                </div>

                <div
                  className="flex items-center justify-between pt-2 border-t"
                  style={{ borderColor: roles.borderSubtle }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-md border shadow-xs"
                      style={{
                        backgroundColor: hex,
                        borderColor: roles.borderSubtle,
                      }}
                    />
                    <span className="font-mono text-[11px] font-bold" style={{ color: roles.textPrimary }}>
                      {hex}
                    </span>
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: roles.textMuted }}>
                    {def.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
