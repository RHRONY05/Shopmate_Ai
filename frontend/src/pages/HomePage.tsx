import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Award,
  ChevronRight,
  Mic,
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addToCartThunk } from '../store/slices/cartSlice';
import { openCopilot, openCopilotWithPrompt } from '../store/slices/copilotSlice';
import { fetchJerseys } from '../services/api';
import { LeagueBadge } from '../components/common/LeagueBadge';
import type { Jersey } from '../types';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [featuredKits, setFeaturedKits] = useState<Jersey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Center Focal Kit: Juventus 2019/20 Half-and-Half Split Home Shirt
  const heroKit = featuredKits.find((k) => k.slug === 'juventus-home-2019-20') || {
    slug: 'juventus-home-2019-20',
    title: 'Juventus 19/20 Home',
    images: ['https://r2.thesportsdb.com/images/media/team/equipment/2019-133676-Jersey.png'],
  };
  const heroImage = heroKit.images?.[0] || 'https://r2.thesportsdb.com/images/media/team/equipment/2019-133676-Jersey.png';
  const heroTitle = 'Juventus 19/20 Home';
  const heroSlug = 'juventus-home-2019-20';

  // 2. Left Flanking Kit: Manchester City 2019/20 125th Anniversary Home Shirt
  const leftKit = featuredKits.find((k) => k.slug === 'man-city-home-2019-20') || {
    slug: 'man-city-home-2019-20',
    title: 'Man City 19/20 Home',
    images: ['https://r2.thesportsdb.com/images/media/team/equipment/2019-133613-Jersey.png'],
  };
  const leftImage = leftKit.images?.[0] || 'https://r2.thesportsdb.com/images/media/team/equipment/2019-133613-Jersey.png';
  const leftTitle = 'Man City 19/20 Home';
  const leftSlug = 'man-city-home-2019-20';

  // 3. Right Flanking Kit: Arsenal 2019/20 Home Authentic Shirt
  const rightKit = featuredKits.find((k) => k.slug === 'arsenal-home-2019-20') || {
    slug: 'arsenal-home-2019-20',
    title: 'Arsenal 19/20 Home',
    images: ['https://r2.thesportsdb.com/images/media/team/equipment/2019-133604-Jersey.png'],
  };
  const rightImage = rightKit.images?.[0] || 'https://r2.thesportsdb.com/images/media/team/equipment/2019-133604-Jersey.png';
  const rightTitle = 'Arsenal 19/20 Home';
  const rightSlug = 'arsenal-home-2019-20';

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        const jerseysRes = await fetchJerseys({ limit: 12 });
        if (isMounted) {
          const allKits = jerseysRes.jerseys || [];
          setFeaturedKits(allKits.slice(0, 6));
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAdd = async (e: React.MouseEvent, jersey: Jersey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!jersey.variants || jersey.variants.length === 0) {
      navigate(`/jerseys/${jersey.slug}`);
      return;
    }
    const variant = jersey.variants.find((v) => v.size === 'M') || jersey.variants[0];
    await dispatch(
      addToCartThunk({
        payload: {
          jerseyVariantId: variant.id,
          quantity: 1,
        },
      })
    );
  };

  const voicePrompts = [
    'Find 2019/20 Barcelona checkerboard shirt',
    'Show iconic black and white zebra stripes from Turin',
    'Liverpool 19/20 Premier League champions kit',
    'Mint green away kits with polo collar',
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Hero Matchday Spotlight — Open-Canvas Visual Hierarchy & Viewport-Fitted 3-Jersey Stage */}
      <section className="relative w-full pt-1 sm:pt-3 pb-8 sm:pb-12 overflow-hidden">
        {/* Stadium Floodlight Arc & Ambient Field Glow (Kept at the Top) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1300px] lg:w-[1600px] h-[320px] sm:h-[420px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/3 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] lg:w-[1500px] h-[300px] sm:h-[380px] border-t-2 border-emerald-500/15 rounded-[50%] pointer-events-none" />

        {/* Content Wrapper (Reduced Side Margins & Compact Spacing) */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Line 1: Primary Spanning Header (Commercial & Authentic Clarity) */}
          <div className="text-center mb-2 sm:mb-3">
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-[var(--text-primary)] uppercase leading-none">
              Authentic Football Kits
            </h1>
          </div>

          {/* 3-Column Integrated Stage: Left Wing + Center Dominant Jersey + Right Wing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left Column (lg:col-span-4): SHOP + Wide Copy + CTA + Left Jersey */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 order-2 lg:order-1">
              <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
                Shop
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md lg:max-w-none">
                Curating authentic player-edition jerseys with official heat-sealed crests, jacquard breathable knits,
                and in-house squad custom name &amp; number printing.
              </p>
              <div className="pt-0.5">
                <Link
                  to="/jerseys"
                  className="px-5 py-2.5 rounded-full bg-[var(--accent-primary)] text-white font-serif font-bold text-xs sm:text-sm hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center gap-2 group cursor-pointer inline-flex"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Left Flanking Jersey (Manchester City 19/20 - Straight, Closer to Center) */}
              <div className="pt-3 sm:pt-4 w-full flex justify-center lg:justify-end lg:translate-x-6 xl:translate-x-10">
                <Link
                  to={`/jerseys/${leftSlug}`}
                  className="group/left block transition-all duration-300 hover:scale-105"
                  title={leftTitle}
                >
                  <div className="relative">
                    <img
                      src={leftImage}
                      alt={leftTitle}
                      className="w-44 sm:w-56 lg:w-64 xl:w-72 max-h-[300px] sm:max-h-[340px] h-auto object-contain drop-shadow-xl transition-transform duration-300"
                    />
                    {/* Transparent Tag Overlay on Bottom of Jersey Fabric */}
                    <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-mono font-medium text-white shadow-md whitespace-nowrap">
                        {leftTitle}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Center Column (lg:col-span-4): Towering Centerpiece Jersey (Juventus Split - Pushed Down Comfortably) */}
            <div className="lg:col-span-4 flex flex-col items-center relative z-20 order-1 lg:order-2 my-2 lg:my-0 lg:mt-3 xl:mt-5">
              <Link
                to={`/jerseys/${heroSlug}`}
                className="block transition-transform duration-500 group-hover/center:scale-105 group/center"
                title={`Spotlight: ${heroTitle}`}
              >
                <div className="relative flex flex-col items-center">
                  {/* Center Jersey Image (Dominant Scale & Fits Viewport) */}
                  <img
                    src={heroImage}
                    alt={heroTitle}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://r2.thesportsdb.com/images/media/team/equipment/2019-133676-Jersey.png';
                    }}
                    className="w-52 sm:w-72 md:w-80 lg:w-[360px] xl:w-[410px] max-h-[360px] sm:max-h-[410px] h-auto object-contain drop-shadow-2xl"
                  />

                  {/* Transparent Tag Overlay on Bottom of Center Jersey Fabric */}
                  <div className="absolute bottom-10 sm:bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-[11px] sm:text-xs font-mono font-medium text-white shadow-xl whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{heroTitle}</span>
                    </span>
                  </div>

                  {/* Grounding Radial Shadow */}
                  <div className="w-44 sm:w-60 h-5 bg-black/15 blur-lg rounded-full mt-1" />
                </div>
              </Link>
            </div>

            {/* Right Column (lg:col-span-4): COLLECT + Wide Copy + CTA + Right Jersey */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end text-center lg:text-right space-y-2.5 order-3">
              <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
                Collect
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md lg:max-w-none">
                Ask our AI KitBot matchday stylist for historical match stats, squad number lookups, and real-time custom
                sleeve patch rendering.
              </p>
              <div className="pt-0.5">
                <button
                  onClick={() => dispatch(openCopilot())}
                  data-copilot-trigger="true"
                  className="px-5 py-2.5 rounded-full bg-white text-[var(--text-primary)] font-serif font-bold text-xs sm:text-sm hover:bg-[var(--bg-card-hover)] transition-all border border-[var(--border-subtle)] flex items-center gap-2 cursor-pointer inline-flex shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Ask AI KitBot</span>
                </button>
              </div>

              {/* Right Flanking Jersey (Arsenal 19/20 - Straight, Closer to Center) */}
              <div className="pt-3 sm:pt-4 w-full flex justify-center lg:justify-start lg:-translate-x-6 xl:-translate-x-10">
                <Link
                  to={`/jerseys/${rightSlug}`}
                  className="group/right block transition-all duration-300 hover:scale-105"
                  title={rightTitle}
                >
                  <div className="relative">
                    <img
                      src={rightImage}
                      alt={rightTitle}
                      className="w-44 sm:w-56 lg:w-64 xl:w-72 max-h-[300px] sm:max-h-[340px] h-auto object-contain drop-shadow-xl transition-transform duration-300"
                    />
                    {/* Transparent Tag Overlay on Bottom of Jersey Fabric */}
                    <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-mono font-medium text-white shadow-md whitespace-nowrap">
                        {rightTitle}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Stock Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-5 mt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono relative z-10 max-w-5xl mx-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>24 Authentic Kits in Stock</span>
            </div>
            <div className="hidden sm:inline text-neutral-300">•</div>
            <div>120 Size Variants (S–XXL)</div>
            <div className="hidden sm:inline text-neutral-300">•</div>
            <div>100% Serial Verified Matchday Authenticity</div>
          </div>
        </div>
      </section>

      {/* 2. AI Voice & Semantic Query Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-emerald-50 text-[var(--accent-primary)]">
              <Mic className="w-5 h-5 animate-pulse text-[var(--accent-primary)]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                Ask KitBot in Your Own Words
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Describe any club, iconic matchday memory, or color scheme to find kits instantly
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {voicePrompts.map((prompt, idx) => (
              <button
                key={idx}
                data-copilot-trigger="true"
                onClick={() => {
                  dispatch(openCopilotWithPrompt(prompt));
                }}
                className="px-3 py-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-white transition-all cursor-pointer font-medium"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. League Showcase Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-black text-2xl text-[var(--text-primary)]">
              Elite European Leagues
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Select your championship to view official home, away, and third kits
            </p>
          </div>
          <Link
            to="/jerseys"
            className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>View All Leagues</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              name: 'Premier League',
              nation: 'England',
              count: '10 Kits Available',
              accent: 'hover:border-purple-500/50 hover:bg-purple-50/30',
            },
            {
              name: 'La Liga',
              nation: 'Spain',
              count: '6 Kits Available',
              accent: 'hover:border-rose-500/50 hover:bg-rose-50/30',
            },
            {
              name: 'Serie A',
              nation: 'Italy',
              count: '6 Kits Available',
              accent: 'hover:border-cyan-500/50 hover:bg-cyan-50/30',
            },
            {
              name: 'Bundesliga',
              nation: 'Germany',
              count: '2 Kits Available',
              accent: 'hover:border-red-500/50 hover:bg-red-50/30',
            },
          ].map((league) => (
            <Link
              key={league.name}
              to={`/jerseys?league=${encodeURIComponent(league.name)}`}
              className={`group p-4 sm:p-5 rounded-2xl bg-white border border-[var(--border-subtle)] ${league.accent} transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px]`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    {league.nation}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mt-0.5">
                    {league.name}
                  </h3>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 p-1.5 rounded-xl bg-neutral-50 border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <LeagueBadge league={league.name} className="w-full h-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)] mt-2">
                <span className="font-medium text-[var(--text-secondary)]">{league.count}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trending Drops Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[var(--accent-primary)] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
              Trending Matchday Drops
            </h2>
          </div>
          <Link
            to="/jerseys"
            className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
          >
            Browse All ({featuredKits.length > 0 ? '24' : '...'})
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[var(--border-subtle)] p-4 h-96 animate-pulse"
              >
                <div className="bg-[var(--bg-canvas)] rounded-xl h-56 mb-4" />
                <div className="h-4 bg-[var(--bg-canvas)] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[var(--bg-canvas)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredKits.map((kit) => (
              <div
                key={kit.id}
                className="bg-white rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Showcase */}
                <Link to={`/jerseys/${kit.slug}`} className="block relative bg-[var(--bg-canvas)] p-6 overflow-hidden">
                  <img
                    src={kit.images[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                    alt={kit.title}
                    className="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {kit.club?.logoUrl && (
                    <img
                      src={kit.club.logoUrl}
                      alt={kit.club.name}
                      className="w-8 h-8 object-contain absolute top-4 left-4 bg-white/90 p-1 rounded-full shadow-xs"
                    />
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-mono font-bold text-[var(--text-secondary)] shadow-xs border border-[var(--border-subtle)]">
                      {kit.season}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-mono font-bold shadow-xs">
                      {kit.kitType}
                    </span>
                  </div>
                </Link>

                {/* Kit Info & Quick CTA */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      {kit.club?.league && <LeagueBadge league={kit.club.league} className="w-3.5 h-3.5 shrink-0" />}
                      <span>{kit.club?.name || 'European Club'}</span>
                    </div>
                    <Link
                      to={`/jerseys/${kit.slug}`}
                      className="font-serif font-bold text-base text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors line-clamp-1 mt-0.5"
                    >
                      {kit.title}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                      {kit.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
                        Base Price
                      </span>
                      <span className="font-serif font-black text-lg text-[var(--accent-primary)]">
                        {Number(kit.basePrice).toFixed(2)} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jerseys/${kit.slug}`}
                        className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] transition-colors"
                      >
                        Customize
                      </Link>
                      <button
                        onClick={(e) => handleQuickAdd(e, kit)}
                        className="p-2 rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--btn-hover)] transition-all shadow-xs"
                        title="Quick Add Size M"
                        aria-label={`Add ${kit.title} to bag`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. The Signature Matchday Ticket Stub Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-[var(--text-primary)] text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>Custom Name & Squad Number Printing</span>
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
                Personalize Your Matchday Shirt In Real-Time
              </h3>
              <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                Add your surname and lucky number in official club tournament typography (+15 USD) with authentic
                championship sleeve badges (+5 USD). Preview the back of your shirt live on our interactive canvas.
              </p>
              <div className="pt-2">
                <Link
                  to="/jerseys"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-neutral-950 font-serif font-bold text-sm hover:bg-emerald-400 transition-all shadow-md"
                >
                  <span>Select a Jersey to Print</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Ticket Stub Graphic */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-xs bg-white text-[var(--text-primary)] rounded-2xl p-5 shadow-2xl border-2 border-emerald-400 relative rotate-1">
                <div className="border-b-2 border-dashed border-neutral-300 pb-3 flex justify-between items-center">
                  <span className="font-serif font-black text-sm tracking-wider">OFFICIAL PRINTING</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    MATCHDAY AUTH
                  </span>
                </div>
                <div className="py-4 text-center space-y-1">
                  <span className="text-xs uppercase font-mono text-neutral-500">Player Squad Spec</span>
                  <div className="font-serif font-black text-2xl tracking-widest text-neutral-900">#07 SAKA</div>
                  <div className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                    <LeagueBadge league="Premier League" className="w-3.5 h-3.5" />
                    <span>Premier League Patch Included</span>
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-neutral-300 pt-2 flex justify-between text-[11px] font-mono text-neutral-500">
                  <span>Fee: +20.00 USD</span>
                  <span>Heat-Pressed In-House</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
