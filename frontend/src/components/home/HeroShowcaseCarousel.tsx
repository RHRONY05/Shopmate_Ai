import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { openCopilot } from '../../store/slices/copilotSlice';
import { addToCartThunk } from '../../store/slices/cartSlice';
import type { Jersey } from '../../types';

export interface ShowcaseSlide {
  id: string;
  club: string;
  clubSlug: string;
  season: string;
  kitType: string;
  badgeName: string;
  title: string;
  jerseySlug: string;
  priceFormatted: string;
  backdropWord: string;
  glowColor: string;
  themeColor: string;
  heroGradient: string;
  playerCutoutSrc: string;
  jerseyFlatlaySrc: string;
  editionBadge: string;
  tagline: string;
  rating: number;
  reviewCount: number;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'barcelona-away-2025-26',
    club: 'FC Barcelona',
    clubSlug: 'barcelona',
    season: '2025/26',
    kitType: 'Away Authentic',
    badgeName: 'Kobe Mamba Edition',
    title: 'FC Barcelona 25/26 Away Authentic',
    jerseySlug: 'barcelona-away-2025-26',
    priceFormatted: '149.99',
    backdropWord: 'BLAUGRANA',
    glowColor: 'rgba(147, 51, 234, 0.12)',
    themeColor: '#ECE4F9',
    heroGradient: 'linear-gradient(180deg, #ECE4F9 0%, #ECE4F9 35%, rgba(243, 246, 244, 0.4) 80%, var(--bg-canvas) 100%)',
    playerCutoutSrc: '/hero_showcase/barca-player-cutout.png',
    jerseyFlatlaySrc: '/hero_showcase/barca-away-2025-26.png',
    editionBadge: 'Vapor Match / Dri-FIT ADV',
    tagline: 'Mamba Mentality meets Catalan heritage. Iridescent purple crest & gold Kobe emblem.',
    rating: 4.9,
    reviewCount: 512,
  },
  {
    id: 'bayern-away-2025-26',
    club: 'Bayern Munich',
    clubSlug: 'bayern-munich',
    season: '2025/26',
    kitType: 'Away Authentic',
    badgeName: 'Heritage Trefoil',
    title: 'FC Bayern 25/26 Away Authentic',
    jerseySlug: 'bayern-away-2025-26',
    priceFormatted: '139.99',
    backdropWord: 'MIA SAN MIA',
    glowColor: 'rgba(239, 68, 68, 0.12)',
    themeColor: '#FDE2E2',
    heroGradient: 'linear-gradient(180deg, #FDE2E2 0%, #FDE2E2 35%, rgba(243, 246, 244, 0.4) 80%, var(--bg-canvas) 100%)',
    playerCutoutSrc: '/hero_showcase/bayern-player-cutout.png',
    jerseyFlatlaySrc: '/hero_showcase/bayern-away-2025-26.png',
    editionBadge: 'Retro Trefoil / HEAT.RDY',
    tagline: 'Archival Bavarian excellence. Vintage polo collar with navy & crimson racing trim.',
    rating: 4.8,
    reviewCount: 384,
  },
  {
    id: 'man-city-home-2025-26',
    club: 'Manchester City',
    clubSlug: 'manchester-city',
    season: '2025/26',
    kitType: 'Home Authentic',
    badgeName: 'Speed Sash',
    title: 'Man City 25/26 Speed Sash Home',
    jerseySlug: 'man-city-home-2025-26',
    priceFormatted: '139.99',
    backdropWord: 'CITYZENS',
    glowColor: 'rgba(56, 189, 248, 0.14)',
    themeColor: '#E0F2FE',
    heroGradient: 'linear-gradient(180deg, #E0F2FE 0%, #E0F2FE 35%, rgba(243, 246, 244, 0.4) 80%, var(--bg-canvas) 100%)',
    playerCutoutSrc: '/hero_showcase/mancity-player-cutout.png',
    jerseyFlatlaySrc: '/hero_showcase/mancity-home-2025-26.png',
    editionBadge: 'ULTRAWEAVE Match Pro',
    tagline: 'Velocity in pure motion. Signature sky-blue chassis sliced by a dynamic speed sash.',
    rating: 4.9,
    reviewCount: 420,
  },
  {
    id: 'real-madrid-away-2025-26',
    club: 'Real Madrid',
    clubSlug: 'real-madrid',
    season: '2025/26',
    kitType: 'Away Authentic',
    badgeName: 'Emerald Houndstooth',
    title: 'Real Madrid 25/26 Emerald Away',
    jerseySlug: 'real-madrid-away-2025-26',
    priceFormatted: '144.99',
    backdropWord: 'HALA MADRID',
    glowColor: 'rgba(16, 185, 129, 0.14)',
    themeColor: '#D1FAE5',
    heroGradient: 'linear-gradient(180deg, #D1FAE5 0%, #D1FAE5 35%, rgba(243, 246, 244, 0.4) 80%, var(--bg-canvas) 100%)',
    playerCutoutSrc: '/hero_showcase/realmadrid-player-cutout.png',
    jerseyFlatlaySrc: '/hero_showcase/realmadrid-away-2025-26.png',
    editionBadge: 'Elite Match Issue',
    tagline: 'Royalty in deep forest emerald. Intricate houndstooth weave with clean white Trefoil.',
    rating: 5.0,
    reviewCount: 645,
  },
];

// Faster auto-slide transition: 3.5 seconds
const AUTOPLAY_DURATION_MS = 3500;

interface HeroShowcaseCarouselProps {
  onQuickAdd?: (jerseySlug: string) => void;
  catalogJerseys?: Jersey[];
}

export const HeroShowcaseCarousel: React.FC<HeroShowcaseCarouselProps> = ({ catalogJerseys = [] }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / Drag States
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

  const activeSlide = SHOWCASE_SLIDES[currentIndex];
  const matchedJersey = catalogJerseys.find((k) => k.slug === activeSlide.jerseySlug);

  // Sync active slide color to navbar CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--hero-navbar-bg', activeSlide.themeColor);
  }, [activeSlide.themeColor]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  }, []);

  // Sequential continuous auto-rotation (1 -> 2 -> 3 -> 4 -> 1)
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, AUTOPLAY_DURATION_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, currentIndex]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  // Mouse Drag / Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setIsPaused(true);
    setMouseStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMouseDown && mouseStartX !== null) {
      const diff = mouseStartX - e.clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }
    setIsMouseDown(false);
    setIsPaused(false);
    setMouseStartX(null);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (matchedJersey && matchedJersey.variants && matchedJersey.variants.length > 0) {
      const variant = matchedJersey.variants.find((v) => v.size === 'M') || matchedJersey.variants[0];
      await dispatch(
        addToCartThunk({
          payload: {
            jerseyVariantId: variant.id,
            quantity: 1,
          },
        })
      );
    } else {
      navigate(`/jerseys/${activeSlide.jerseySlug}`);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none transition-all duration-700 pt-1 pb-4 sm:pb-6 cursor-grab active:cursor-grabbing"
      style={{
        background: activeSlide.heroGradient,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isMouseDown) {
          setIsPaused(false);
          setIsMouseDown(false);
          setMouseStartX(null);
        }
      }}
    >
      {/* 1. Dynamic Ambient Stadium Lighting Glow */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1300px] lg:w-[1600px] h-[340px] sm:h-[460px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{ backgroundColor: activeSlide.glowColor }}
      />

      {/* 2. Massive Typographic Backdrop Layer */}
      <div className="absolute top-14 sm:top-18 lg:top-20 inset-x-0 flex justify-center items-center pointer-events-none z-0 overflow-hidden">
        <span
          key={activeSlide.backdropWord}
          className="font-serif font-black text-5xl sm:text-7xl md:text-8xl lg:text-[11vw] xl:text-[12vw] tracking-tighter uppercase whitespace-nowrap text-[var(--text-primary)] opacity-5 transition-all duration-700 ease-out transform scale-100 animate-in fade-in select-none"
        >
          {activeSlide.backdropWord}
        </span>
      </div>

      {/* 3. Main Hero Interactive Layout Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">

          {/* Left Column (lg:col-span-4): Headline, Pitch Copy, Verification Pills & CTAs */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5 order-2 lg:order-1 pt-1 lg:pt-0">
            {/* Season & Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-[var(--text-primary)] tracking-wide">
                {activeSlide.season} • {activeSlide.badgeName}
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-5xl xl:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-[1.05]">
              Wear The <span className="text-[var(--accent-primary)]">Passion.</span>
              <br />
              Own The Pitch.
            </h1>

            {/* Dynamic Kit Tagline */}
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md lg:max-w-none transition-all duration-500 min-h-[38px]">
              {activeSlide.tagline}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-1.5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                to={`/jerseys/${activeSlide.jerseySlug}`}
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[var(--accent-primary)] text-white font-serif font-bold text-xs sm:text-sm hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center gap-2 group cursor-pointer inline-flex"
              >
                <span>Customize Jersey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={() => dispatch(openCopilot())}
                data-copilot-trigger="true"
                className="px-5 py-2.5 sm:py-3 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] font-serif font-bold text-xs sm:text-sm hover:bg-[var(--bg-card-hover)] transition-all border border-[var(--border-subtle)] flex items-center gap-2 cursor-pointer inline-flex shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Ask AI Stylist</span>
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="pt-1 flex items-center justify-center lg:justify-start gap-4 text-[11px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>100% Match Authentic</span>
              </div>
              <span>•</span>
              <div>Swipe or drag to explore</div>
            </div>
          </div>

          {/* Center Column (lg:col-span-5): Unboxed Player Cutout Layer (Directly on canvas) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 order-1 lg:order-2 pt-2 sm:pt-4">
            <Link
              to={`/jerseys/${activeSlide.jerseySlug}`}
              className="block relative transition-transform duration-500 hover:scale-[1.02] cursor-pointer group pointer-events-auto"
              title={`View ${activeSlide.title}`}
            >
              {/* Seamless Player Cutout (Clean cutout with zero labeling) */}
              <div className="relative flex items-center justify-center">
                <img
                  key={activeSlide.playerCutoutSrc}
                  src={activeSlide.playerCutoutSrc}
                  alt={`${activeSlide.club} player wearing ${activeSlide.title}`}
                  className="w-auto h-auto max-h-[420px] sm:max-h-[480px] lg:max-h-[520px] max-w-[90vw] object-contain drop-shadow-2xl transition-all duration-700 ease-out animate-in fade-in zoom-in-95 pointer-events-none"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 72%, transparent 98%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 98%)',
                  }}
                />
              </div>

              {/* Grounding Radial Shadow under player */}
              <div className="w-44 sm:w-60 h-5 bg-black/15 blur-xl rounded-full mx-auto mt-1 pointer-events-none" />
            </Link>
          </div>

          {/* Right Column (lg:col-span-3): Corner Floating Jersey Product Card (Transparent Jersey) */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end order-3">
            <div className="w-full max-w-[290px] sm:max-w-[310px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all shadow-md hover:shadow-xl flex flex-col justify-between overflow-hidden group">

              {/* Header Badges Strip */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[var(--border-subtle)]/60 bg-[var(--bg-canvas)]/50">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[var(--accent-primary)] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {activeSlide.editionBadge}
                </span>
                <div className="flex items-center gap-1 text-xs font-mono text-[var(--text-muted)]">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-[var(--text-primary)]">{activeSlide.rating}</span>
                  <span className="text-[10px]">({activeSlide.reviewCount})</span>
                </div>
              </div>

              {/* Jersey Flat-lay Preview Link (100% Transparent PNG) */}
              <Link
                to={`/jerseys/${activeSlide.jerseySlug}`}
                className="block relative bg-[var(--bg-canvas)] p-4 overflow-hidden text-center cursor-pointer"
                title={`Inspect ${activeSlide.title}`}
              >
                <img
                  key={activeSlide.jerseyFlatlaySrc}
                  src={activeSlide.jerseyFlatlaySrc}
                  alt={activeSlide.title}
                  className="w-full h-40 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md mx-auto pointer-events-none"
                />
              </Link>

              {/* Card Meta & Details */}
              <div className="p-4 space-y-2.5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    {activeSlide.club} • {activeSlide.kitType}
                  </div>
                  <Link
                    to={`/jerseys/${activeSlide.jerseySlug}`}
                    className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors line-clamp-1 block mt-0.5"
                  >
                    {activeSlide.title}
                  </Link>
                </div>

                {/* Price and Add to Bag */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">Price</span>
                    <span className="font-serif font-black text-base sm:text-lg text-[var(--text-primary)]">
                      {activeSlide.priceFormatted} USD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--btn-hover)] text-white text-xs font-serif font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    title="Add to Bag"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Minimal Swipe / Progress Indicator (Sleek, unobtrusive 4-bar indicator) */}
        <div className="pt-3 flex items-center justify-center gap-2">
          {SHOWCASE_SLIDES.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className="py-1 px-0.5 cursor-pointer focus:outline-none"
                title={`Go to slide ${idx + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'w-10 bg-black/10 relative'
                      : 'w-3 bg-[var(--border-subtle)] hover:bg-[var(--text-muted)]'
                  }`}
                >
                  {isActive && (
                    <div
                      key={`progress-${currentIndex}`}
                      className="h-full bg-[var(--accent-primary)] rounded-full"
                      style={{
                        animation: isPaused
                          ? 'none'
                          : `slideProgress ${AUTOPLAY_DURATION_MS}ms linear forwards`,
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
