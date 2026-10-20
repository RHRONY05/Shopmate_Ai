import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  Search,
  ShoppingBag,
  X,
  SlidersHorizontal,
  RotateCcw,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCartThunk } from '../store/slices/cartSlice';
import { openCopilot, clearAiCatalogJerseys } from '../store/slices/copilotSlice';
import { fetchJerseys } from '../services/api';
import { LeagueBadge } from '../components/common/LeagueBadge';
import type { Jersey, Size } from '../types';

export const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { aiCatalogJerseys, aiCatalogQuery, isWorking, workingStage } = useAppSelector(
    (state) => state.copilot
  );

  const [jerseys, setJerseys] = useState<Jersey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active filter state extracted from searchParams
  const selectedLeague = searchParams.get('league') || '';
  const selectedClub = searchParams.get('clubSlug') || '';
  const selectedKitType = searchParams.get('kitType') || '';
  const selectedEra = searchParams.get('era') || '';
  const selectedSize = searchParams.get('size') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sortBy') as any) || 'newest';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 120;

  // Has AI curated results actively populated
  const hasAiResults = Boolean(aiCatalogJerseys && aiCatalogJerseys.length > 0);
  const displayedJerseys = hasAiResults ? (aiCatalogJerseys as Jersey[]) : jerseys;

  // Fetch jerseys whenever query parameters change
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    async function loadKits() {
      try {
        const res = await fetchJerseys({
          league: selectedLeague || undefined,
          clubSlug: selectedClub || undefined,
          kitType: selectedKitType || undefined,
          era: selectedEra || undefined,
          size: selectedSize || undefined,
          maxPrice: maxPrice < 120 ? maxPrice : undefined,
          search: searchQuery || undefined,
          sortBy,
          limit: 30,
        });

        if (isCurrent) {
          setJerseys(res.jerseys || []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Failed to fetch catalog kits');
          setIsLoading(false);
        }
      }
    }

    loadKits();
    return () => {
      isCurrent = false;
    };
  }, [selectedLeague, selectedClub, selectedKitType, selectedEra, selectedSize, searchQuery, sortBy, maxPrice]);

  const updateFilter = (key: string, value: string | number | undefined) => {
    // Clear AI search override when user manually adjusts faceted filters
    if (hasAiResults) {
      dispatch(clearAiCatalogJerseys());
    }
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === null) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    dispatch(clearAiCatalogJerseys());
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = async (e: React.MouseEvent, jersey: any) => {
    e.preventDefault();
    e.stopPropagation();

    let variantId = jersey.variants?.[0]?.id;
    if (!variantId && Array.isArray(jersey.availableSizes) && jersey.availableSizes.length > 0) {
      variantId = jersey.availableSizes[0]?.id;
    }

    if (!variantId) return;

    await dispatch(
      addToCartThunk({
        payload: {
          jerseyVariantId: variantId,
          quantity: 1,
        },
      })
    );
  };

  const leaguesList = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga'];
  const kitTypesList = ['HOME', 'AWAY', 'THIRD', 'RETRO'];
  const sizesList: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-1">
              <Link to="/" className="hover:text-[var(--text-primary)]">
                Home
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-bold">Catalog</span>
              {hasAiResults ? (
                <>
                  <span>/</span>
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>KitBot AI Curated</span>
                  </span>
                </>
              ) : selectedLeague ? (
                <>
                  <span>/</span>
                  <span className="text-[var(--accent-primary)] font-bold inline-flex items-center gap-1.5">
                    <LeagueBadge league={selectedLeague} className="w-4 h-4 shrink-0" />
                    <span>{selectedLeague}</span>
                  </span>
                </>
              ) : null}
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
              {hasAiResults ? 'KitBot AI Curated Matchday Collection' : 'Matchday Kits & Heritage Collection'}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Showing {displayedJerseys.length} {hasAiResults ? `AI matching jerseys for "${aiCatalogQuery}"` : 'authentic football jerseys'}
            </p>
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 rounded-xl bg-white border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[var(--border-subtle)] shadow-xs">
              <span className="text-xs text-[var(--text-muted)] font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="text-xs font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Season</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Filter Rail + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Rail (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xs sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="font-serif font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)]" />
                Faceted Filters
              </span>
              {(selectedLeague || selectedClub || selectedKitType || selectedEra || selectedSize || searchQuery || hasAiResults) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[var(--text-muted)] hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Keyword Search Filter */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Search Kits
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Team, player, color..."
                  value={searchQuery}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* League Selection */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Championship League
              </label>
              <div className="space-y-1">
                {leaguesList.map((lg) => {
                  const isActive = selectedLeague === lg;
                  return (
                    <button
                      key={lg}
                      onClick={() => updateFilter('league', isActive ? '' : lg)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-[var(--accent-primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LeagueBadge league={lg} className="w-4 h-4 shrink-0" />
                        <span>{lg}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kit Type */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Kit Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {kitTypesList.map((type) => {
                  const isActive = selectedKitType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => updateFilter('kitType', isActive ? '' : type)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-[var(--accent-primary)] bg-emerald-50 text-[var(--accent-primary)] font-bold shadow-xs'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-neutral-50'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Available Size
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {sizesList.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => updateFilter('size', isActive ? '' : size)}
                      className={`w-9 h-9 rounded-lg text-xs font-mono font-bold border flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-xs'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-neutral-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">
                  Max Price
                </label>
                <span className="font-mono font-bold text-xs text-[var(--accent-primary)]">
                  {maxPrice} USD
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>

            {/* AI KitBot Callout Banner in Sidebar */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 font-serif">
                <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Need Personalized Advice?</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-sans">
                Our Matchday AI stylist searches retro eras, club legends, and size fit in natural language.
              </p>
              <button
                onClick={() => dispatch(openCopilot())}
                data-copilot-trigger="true"
                className="w-full py-1.5 px-3 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ask KitBot</span>
              </button>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Live AI Working Status Animation Banner */}
            {isWorking && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm">
                        {workingStage || 'KitBot is searching our matchday vault...'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-200 text-emerald-800 font-bold">
                        Vault Search Active
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-sans mt-0.5">
                      Searching authentic kits, retro eras, club colors, and live stock...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active AI Curated Collection Banner */}
            {hasAiResults && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-sm border border-emerald-400/40">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-sm sm:text-base tracking-wide text-white">
                        KitBot Curated Collection
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        {displayedJerseys.length} Matches Found
                      </span>
                    </div>
                    {aiCatalogQuery && (
                      <p className="text-xs text-neutral-300 font-sans mt-0.5">
                        Semantic query: <span className="font-bold text-emerald-300">"{aiCatalogQuery}"</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => dispatch(clearAiCatalogJerseys())}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Show All Catalog Kits</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && !hasAiResults ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[var(--border-subtle)] p-4 animate-pulse"
                  >
                    <div className="bg-[var(--bg-canvas)] rounded-xl h-56 mb-4" />
                    <div className="h-4 bg-[var(--bg-canvas)] rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[var(--bg-canvas)] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error && !hasAiResults ? (
              <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-red-900">Failed to load kits</h3>
                <p className="text-xs text-red-700 max-w-sm mx-auto">{error}</p>
                <button
                  onClick={() => updateFilter('search', searchQuery)}
                  className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Retry Query
                </button>
              </div>
            ) : displayedJerseys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--text-muted)] mx-auto border border-[var(--border-subtle)]">
                  <Search className="w-8 h-8 opacity-40" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                    No matching jerseys found
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                    We could not find any football kits matching your current filter criteria. Try broadening your
                    search or consult our AI KitBot Stylist.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => dispatch(openCopilot())}
                    data-copilot-trigger="true"
                    className="px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask KitBot to Find Kits</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedJerseys.map((kit: any) => {
                  const clubName = typeof kit.club === 'object' ? kit.club?.name : kit.clubName || kit.club || 'European Club';
                  const clubLogo = typeof kit.club === 'object' ? kit.club?.logoUrl : undefined;
                  const clubLeague = typeof kit.club === 'object' ? kit.club?.league : kit.league;
                  const priceFormatted =
                    typeof kit.basePrice === 'number'
                      ? kit.basePrice.toFixed(2)
                      : typeof kit.priceUsd === 'number'
                      ? kit.priceUsd.toFixed(2)
                      : kit.basePrice || kit.priceUsd || '79.99';

                  const similarity = kit.similarityScore || kit.similarity;

                  return (
                    <div
                      key={kit.id}
                      className="bg-white rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Jersey Image */}
                      <Link
                        to={`/jerseys/${kit.slug || kit.id}`}
                        className="block relative bg-[var(--bg-canvas)] p-6 overflow-hidden"
                      >
                        <img
                          src={kit.images?.[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                          alt={kit.title}
                          className="w-full h-60 object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        {clubLogo && (
                          <img
                            src={clubLogo}
                            alt={clubName}
                            className="w-7 h-7 object-contain absolute top-3.5 left-3.5 bg-white/90 p-0.5 rounded-full shadow-xs"
                          />
                        )}
                        <div className="absolute top-3.5 right-3.5 flex flex-col gap-1 items-end">
                          {similarity && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold shadow-xs">
                              {(similarity * 100).toFixed(0)}% AI Match
                            </span>
                          )}
                          {kit.season && (
                            <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-mono font-bold text-[var(--text-secondary)] shadow-xs border border-[var(--border-subtle)]">
                              {kit.season}
                            </span>
                          )}
                          {kit.kitType && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-mono font-bold shadow-xs">
                              {kit.kitType}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Details & Actions */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                            {clubLeague && <LeagueBadge league={clubLeague} className="w-3.5 h-3.5 shrink-0" />}
                            <span>{clubName}</span>
                          </div>

                          <Link to={`/jerseys/${kit.slug || kit.id}`}>
                            <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors mt-1 line-clamp-2">
                              {kit.title}
                            </h3>
                          </Link>

                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="font-mono font-black text-base text-[var(--text-primary)]">
                              {priceFormatted} USD
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              Authentic Kit
                            </span>
                          </div>
                        </div>

                        {/* Card CTA Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                          <Link
                            to={`/jerseys/${kit.slug || kit.id}`}
                            className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
                          >
                            Customize
                          </Link>
                          <button
                            onClick={(e) => handleQuickAdd(e, kit)}
                            className="p-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--btn-hover)] text-white transition-colors shadow-xs flex items-center justify-center cursor-pointer"
                            title="Quick Add to Bag"
                            aria-label={`Add ${kit.title} to Bag`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
