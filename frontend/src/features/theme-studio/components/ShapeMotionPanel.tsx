import React, { useState } from 'react';
import { SemanticPalette } from '../palettes';
import {
  ShapeConfig,
  RadiusPersonality,
  ShadowStyle,
  DensityMode,
  MotionPersonality,
  radiusPresets,
  shadowPresets,
  densityPresets,
  motionPresets,
} from '../shape-presets';
import {
  Shapes,
  Play,
  Zap,
  Check,
  Bell,
  PanelRight,
} from 'lucide-react';

interface ShapeMotionPanelProps {
  palette: SemanticPalette;
  shapeConfig: ShapeConfig;
  onUpdateShapeConfig: (newConfig: ShapeConfig) => void;
}

export const ShapeMotionPanel: React.FC<ShapeMotionPanelProps> = ({
  palette,
  shapeConfig,
  onUpdateShapeConfig,
}) => {
  const { roles } = palette;
  const [isPlayingMotion, setIsPlayingMotion] = useState<boolean>(false);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState<boolean>(false);
  const [demoToastVisible, setDemoToastVisible] = useState<boolean>(false);

  const activeRadius = radiusPresets[shapeConfig.radius];
  const activeShadow = shadowPresets[shapeConfig.shadow];
  const activeDensity = densityPresets[shapeConfig.density];
  const activeMotion = motionPresets[shapeConfig.motion];

  const handlePlayMotionDemo = () => {
    setIsPlayingMotion(true);
    setDemoToastVisible(true);
    setIsDemoSheetOpen(true);

    setTimeout(() => {
      setDemoToastVisible(false);
      setIsDemoSheetOpen(false);
      setIsPlayingMotion(false);
    }, 2800);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase flex items-center gap-2"
            style={{ color: roles.textPrimary }}
          >
            <Shapes className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            Panel 7: Shape, Depth, Density & Motion Personality
          </h3>
          <p className="text-xs" style={{ color: roles.textMuted }}>
            Fine-tune the physical tactile traits of the UI • Independent from color and font choices
          </p>
        </div>

        {/* Motion Demo Trigger */}
        <button
          type="button"
          onClick={handlePlayMotionDemo}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: roles.btnPrimary,
            color: roles.btnText,
          }}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play Motion Demo</span>
        </button>
      </div>

      {/* 4 Control Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Radius Personality */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm"
          style={{
            backgroundColor: roles.bgCard,
            borderColor: roles.borderSubtle,
          }}
        >
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-wider block mb-1"
              style={{ color: roles.accentPrimary }}
            >
              Corner Radii
            </span>
            <h4 className="text-xs font-bold uppercase mb-2" style={{ color: roles.textPrimary }}>
              Radius Personality
            </h4>
            <div className="space-y-2">
              {(Object.keys(radiusPresets) as RadiusPersonality[]).map((rKey) => {
                const preset = radiusPresets[rKey];
                const isSelected = shapeConfig.radius === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => onUpdateShapeConfig({ ...shapeConfig, radius: rKey })}
                    className={`w-full p-2.5 text-left border rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'ring-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? roles.bgSurface : roles.bgCanvas,
                      borderColor: isSelected ? roles.accentPrimary : roles.borderSubtle,
                      color: roles.textPrimary,
                    }}
                  >
                    <div>
                      <span className="font-bold block">{preset.name}</span>
                      <span className="text-[10px] block opacity-70 leading-snug mt-0.5">
                        {preset.tagline}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: roles.accentPrimary }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Shadow Elevation Style */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm"
          style={{
            backgroundColor: roles.bgCard,
            borderColor: roles.borderSubtle,
          }}
        >
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-wider block mb-1"
              style={{ color: roles.accentPrimary }}
            >
              Spatial Elevation
            </span>
            <h4 className="text-xs font-bold uppercase mb-2" style={{ color: roles.textPrimary }}>
              Shadow Style
            </h4>
            <div className="space-y-2">
              {(Object.keys(shadowPresets) as ShadowStyle[]).map((sKey) => {
                const preset = shadowPresets[sKey];
                const isSelected = shapeConfig.shadow === sKey;
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => onUpdateShapeConfig({ ...shapeConfig, shadow: sKey })}
                    className={`w-full p-2.5 text-left border rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'ring-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? roles.bgSurface : roles.bgCanvas,
                      borderColor: isSelected ? roles.accentPrimary : roles.borderSubtle,
                      color: roles.textPrimary,
                    }}
                  >
                    <div>
                      <span className="font-bold block">{preset.name}</span>
                      <span className="text-[10px] block opacity-70 leading-snug mt-0.5">
                        {preset.tagline}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: roles.accentPrimary }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Density Mode */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm"
          style={{
            backgroundColor: roles.bgCard,
            borderColor: roles.borderSubtle,
          }}
        >
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-wider block mb-1"
              style={{ color: roles.accentPrimary }}
            >
              Control Target Sizing
            </span>
            <h4 className="text-xs font-bold uppercase mb-2" style={{ color: roles.textPrimary }}>
              Layout Density
            </h4>
            <div className="space-y-2">
              {(Object.keys(densityPresets) as DensityMode[]).map((dKey) => {
                const preset = densityPresets[dKey];
                const isSelected = shapeConfig.density === dKey;
                return (
                  <button
                    key={dKey}
                    type="button"
                    onClick={() => onUpdateShapeConfig({ ...shapeConfig, density: dKey })}
                    className={`w-full p-2.5 text-left border rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'ring-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? roles.bgSurface : roles.bgCanvas,
                      borderColor: isSelected ? roles.accentPrimary : roles.borderSubtle,
                      color: roles.textPrimary,
                    }}
                  >
                    <div>
                      <span className="font-bold block">{preset.name}</span>
                      <span className="text-[10px] block opacity-70 leading-snug mt-0.5">
                        {preset.tagline}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: roles.accentPrimary }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Motion Dynamics */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm"
          style={{
            backgroundColor: roles.bgCard,
            borderColor: roles.borderSubtle,
          }}
        >
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-wider block mb-1"
              style={{ color: roles.accentPrimary }}
            >
              Kinetic Feedback
            </span>
            <h4 className="text-xs font-bold uppercase mb-2" style={{ color: roles.textPrimary }}>
              Motion Personality
            </h4>
            <div className="space-y-2">
              {(Object.keys(motionPresets) as MotionPersonality[]).map((mKey) => {
                const preset = motionPresets[mKey];
                const isSelected = shapeConfig.motion === mKey;
                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => onUpdateShapeConfig({ ...shapeConfig, motion: mKey })}
                    className={`w-full p-2.5 text-left border rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'ring-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? roles.bgSurface : roles.bgCanvas,
                      borderColor: isSelected ? roles.accentPrimary : roles.borderSubtle,
                      color: roles.textPrimary,
                    }}
                  >
                    <div>
                      <span className="font-bold block">{preset.name}</span>
                      <span className="text-[10px] block opacity-70 leading-snug mt-0.5">
                        {preset.tagline}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: roles.accentPrimary }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Motion Demo Showcase Area */}
      <div
        className="p-4 rounded-2xl border relative overflow-hidden"
        style={{
          backgroundColor: roles.bgSurface,
          borderColor: roles.borderSubtle,
          boxShadow: activeShadow.tokens.shadow1(roles.shadowColor),
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: roles.accentPrimary }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: roles.textPrimary }}>
              Kinetic Stage: {activeMotion.name} (Easing: {activeMotion.tokens.easeOut}, Duration: {activeMotion.tokens.durBase}, Control Height: {activeDensity.tokens.controlHeight})
            </span>
          </div>

          <span className="text-[10px] font-mono" style={{ color: roles.textMuted }}>
            Respects prefers-reduced-motion
          </span>
        </div>

        {/* Demo Stagger List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['1. Arsenal 24/25 Home', '2. Real Madrid European Drop', '3. Juventus Turin Stripes'].map(
            (item, index) => (
              <div
                key={item}
                className="p-3 border text-xs font-semibold flex items-center justify-between transition-all"
                style={{
                  backgroundColor: roles.bgCard,
                  borderColor: roles.borderSubtle,
                  color: roles.textPrimary,
                  borderRadius: activeRadius.tokens.radiusMd,
                  boxShadow: activeShadow.tokens.shadow2(roles.shadowColor),
                  transitionDuration: activeMotion.tokens.durBase,
                  transitionTimingFunction: activeMotion.tokens.easeOut,
                  transform: isPlayingMotion ? `translateY(-4px)` : 'translateY(0)',
                  transitionDelay: `${index * 80}ms`,
                }}
              >
                <span>{item}</span>
                <span className="text-[10px] font-mono" style={{ color: roles.accentPrimary }}>
                  Stagger +{index * 80}ms
                </span>
              </div>
            )
          )}
        </div>

        {/* Slide-in Demo Toast & Drawer Sheet */}
        {demoToastVisible && (
          <div
            className="mt-3 p-3 border text-xs font-medium flex items-center justify-between shadow-lg"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: roles.borderFocus,
              color: roles.textPrimary,
              borderRadius: activeRadius.tokens.radiusMd,
              boxShadow: activeShadow.tokens.shadow3(roles.shadowColor),
              transitionDuration: activeMotion.tokens.durFast,
              transitionTimingFunction: activeMotion.tokens.easeOut,
            }}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: roles.accentPrimary }} />
              <span>Simulated Kinetic Toast Alert (Duration: {activeMotion.tokens.durFast})</span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{
                backgroundColor: `${roles.accentPrimary}20`,
                borderColor: `${roles.accentPrimary}40`,
                color: roles.accentPrimary,
              }}
            >
              Active
            </span>
          </div>
        )}

        {/* Slide-over mini sheet simulation */}
        {isDemoSheetOpen && (
          <div
            className="mt-3 p-3 border text-xs flex items-center justify-between"
            style={{
              backgroundColor: roles.bgCard,
              borderColor: roles.borderSubtle,
              color: roles.textSecondary,
              borderRadius: activeRadius.tokens.radiusMd,
            }}
          >
            <div className="flex items-center gap-2">
              <PanelRight className="w-4 h-4" style={{ color: roles.accentPrimary }} />
              <span>Mini Drawer Sheet Open State (Simulated {shapeConfig.density} Padding)</span>
            </div>
            <span className="font-mono text-[10px] font-bold" style={{ color: roles.accentPrimary }}>
              Density: {shapeConfig.density}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
