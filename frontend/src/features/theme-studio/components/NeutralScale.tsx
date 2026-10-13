import React from 'react';
import { SemanticPalette } from '../palettes';
import { Layers } from 'lucide-react';
import { checkContrast } from '../utils/contrast';

interface NeutralScaleProps {
  palette: SemanticPalette;
}

interface NeutralStep {
  step: number;
  label: string;
  uiJob: string;
  hex: string;
}

export const NeutralScale: React.FC<NeutralScaleProps> = ({ palette }) => {
  const { roles, mode } = palette;

  // 7-step neutral scale tinted to palette's temperature
  const steps: NeutralStep[] =
    mode === 'light'
      ? [
          { step: 1, label: 'Tint 50', uiJob: 'Canvas Base & Page Foundation', hex: roles.bgCanvas },
          { step: 2, label: 'Tint 100', uiJob: 'Surface Containers & Navigation', hex: roles.bgSurface },
          { step: 3, label: 'Tint 200', uiJob: 'Card Hover & Recessed Panels', hex: roles.bgCardHover },
          { step: 4, label: 'Tint 300', uiJob: 'Subtle Dividers & Card Outlines', hex: roles.borderSubtle.startsWith('#') ? roles.borderSubtle : '#CBD5E1' },
          { step: 5, label: 'Tint 500', uiJob: 'Muted Meta Text & Timestamps', hex: roles.textMuted },
          { step: 6, label: 'Tint 700', uiJob: 'Secondary Descriptions & Specs', hex: roles.textSecondary },
          { step: 7, label: 'Tint 950', uiJob: 'High-Impact Headlines & Hero Text', hex: roles.textPrimary },
        ]
      : [
          { step: 1, label: 'Tint 950', uiJob: 'Deep Cosmos Canvas Base', hex: roles.bgCanvas },
          { step: 2, label: 'Tint 900', uiJob: 'Surface Shell & Top Header', hex: roles.bgSurface },
          { step: 3, label: 'Tint 800', uiJob: 'Elevated Cards & Sheets', hex: roles.bgCard },
          { step: 4, label: 'Tint 700', uiJob: 'Card Hover & Border Rings', hex: roles.bgCardHover },
          { step: 5, label: 'Tint 500', uiJob: 'Muted Meta Text & Disclaimers', hex: roles.textMuted },
          { step: 6, label: 'Tint 300', uiJob: 'Secondary Body Reading Text', hex: roles.textSecondary },
          { step: 7, label: 'Tint 50', uiJob: 'High-Luminance Titles & Crests', hex: roles.textPrimary },
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
            <Layers className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 6: Tinted Neutral & Gray Scale Ramp
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            7-step neutral scale tinted directly to the palette's undertone hue ({mode.toUpperCase()} temperature)
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
          7-Step Tint Architecture
        </span>
      </div>

      {/* 7-Step Neutral Ramp Bar */}
      <div
        className="rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: roles.bgCard,
          borderColor: roles.borderSubtle,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {steps.map((item) => {
            // Check text legibility over this step's color
            const contrastOnStep = checkContrast('#FFFFFF', item.hex).ratio >= 4.5 ? '#FFFFFF' : '#000000';

            return (
              <div
                key={item.step}
                className="rounded-xl border p-3 flex flex-col justify-between shadow-xs transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: item.hex,
                  color: contrastOnStep,
                  borderColor: roles.borderSubtle,
                  minHeight: '130px',
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono opacity-90 mb-1">
                    <span>Step {item.step}</span>
                    <span className="text-[10px]">{item.label}</span>
                  </div>

                  <p className="text-[10px] font-medium leading-snug opacity-80 mt-1">
                    {item.uiJob}
                  </p>
                </div>

                <div className="pt-2 border-t border-current/20 flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold">{item.hex}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
