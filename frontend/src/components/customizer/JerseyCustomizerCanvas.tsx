import React, { useRef, useEffect } from 'react';

interface JerseyCustomizerCanvasProps {
  jerseyTitle: string;
  kitColor?: string;
  playerName: string;
  playerNumber: string;
  hasSleeveBadge: boolean;
  sleeveBadgeName: string;
}

export const JerseyCustomizerCanvas: React.FC<JerseyCustomizerCanvasProps> = ({
  jerseyTitle,
  kitColor = '#B91C1C', // Default regal matchday red
  playerName,
  playerNumber,
  hasSleeveBadge,
  sleeveBadgeName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Jersey Back Silhouette
    ctx.save();

    // Create subtle pitch shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Draw stylized kit back body
    ctx.beginPath();
    ctx.moveTo(120, 70); // Collar left
    ctx.quadraticCurveTo(200, 95, 280, 70); // Collar curve
    ctx.lineTo(370, 130); // Right sleeve top
    ctx.lineTo(330, 200); // Right sleeve bottom
    ctx.lineTo(290, 180); // Right armpit
    ctx.lineTo(285, 430); // Right bottom hem
    ctx.quadraticCurveTo(200, 440, 115, 430); // Bottom hem curve
    ctx.lineTo(110, 180); // Left armpit
    ctx.lineTo(70, 200); // Left sleeve bottom
    ctx.lineTo(30, 130); // Left sleeve top
    ctx.closePath();

    // Fill jersey body with matchday club shade
    const grad = ctx.createLinearGradient(0, 50, 0, 440);
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fill();

    // Border stroke
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#334155';
    ctx.stroke();
    ctx.restore();

    // 3. Collar trim
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(130, 72);
    ctx.quadraticCurveTo(200, 96, 270, 72);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F1F5F9';
    ctx.stroke();
    ctx.restore();

    // 4. Draw Player Name (Official Matchday Arc Typography)
    const displayName = (playerName || 'YOUR NAME').toUpperCase().slice(0, 15);

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillText(displayName, 200, 160);
    ctx.restore();

    // 5. Draw Squad Number
    const displayNumber = playerNumber.trim() ? playerNumber.slice(0, 2) : '10';

    ctx.save();
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 110px Cinzel, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    ctx.fillText(displayNumber, 200, 260);

    // Subtle inner stroke for official matchday badge effect
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeText(displayNumber, 200, 260);
    ctx.restore();

    // 6. Draw Sleeve Badge if toggled
    if (hasSleeveBadge) {
      ctx.save();
      // Right sleeve patch circle
      ctx.beginPath();
      ctx.arc(335, 165, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PATCH', 335, 165);
      ctx.restore();
    }

    // 7. Official Authentication Stamp at bottom hem
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL KITROOM MATCHDAY PRINTING', 200, 415);
    ctx.restore();
  }, [jerseyTitle, kitColor, playerName, playerNumber, hasSleeveBadge, sleeveBadgeName]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={480}
          className="w-full max-w-[320px] sm:max-w-[360px] h-auto drop-shadow-md"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          Back Printing Preview
        </div>
      </div>
      <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2">
        Rendered live in official matchday squad font
      </span>
    </div>
  );
};
