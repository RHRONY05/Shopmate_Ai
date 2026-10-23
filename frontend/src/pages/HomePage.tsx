import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Award,
  ChevronRight,
  Mic,
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addToCartThunk } from '../store/slices/cartSlice';
import { openCopilotWithPrompt } from '../store/slices/copilotSlice';
import { fetchJerseys } from '../services/api';
import { LeagueBadge } from '../components/common/LeagueBadge';
import { HeroShowcaseCarousel } from '../components/home/HeroShowcaseCarousel';
import type { Jersey } from '../types';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [featuredKits, setFeaturedKits] = useState<Jersey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* 1. Hero Matchday Spotlight — Continuous 4-Slide Kit Showcase with 3D Depth */}
      <section className="relative w-full overflow-hidden">
        <HeroShowcaseCarousel catalogJerseys={featuredKits} />
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
