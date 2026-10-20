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
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addToCartThunk } from '../store/slices/cartSlice';
import { openCopilot } from '../store/slices/copilotSlice';
import { fetchJerseys } from '../services/api';
import { LeagueBadge } from '../components/common/LeagueBadge';
import type { Jersey, Size } from '../types';

export const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

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
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === null) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = async (e: React.MouseEvent, jersey: Jersey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!jersey.variants || jersey.variants.length === 0) return;
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
              {selectedLeague && (
                <>
                  <span>/</span>
                  <span className="text-[var(--accent-primary)] font-bold inline-flex items-center gap-1.5">
                    <LeagueBadge league={selectedLeague} className="w-4 h-4 shrink-0" />
                    <span>{selectedLeague}</span>
                  </span>
                </>
              )}
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
              Matchday Kits & Heritage Collection
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Showing {jerseys.length} authentic football jerseys
            </p>
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 rounded-xl bg-white border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 shadow-xs"
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
              {(selectedLeague || selectedClub || selectedKitType || selectedEra || selectedSize || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[var(--text-muted)] hover:text-red-600 flex items-center gap-1 transition-colors"
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

            {/* Leagues */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                League
              </label>
              <div className="space-y-1">
                {leaguesList.map((league) => (
                  <button
                    key={league}
                    onClick={() => updateFilter('league', selectedLeague === league ? '' : league)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedLeague === league
                        ? 'bg-[var(--accent-primary)] text-white font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LeagueBadge league={league} className="w-4 h-4 shrink-0" />
                      <span>{league}</span>
                    </div>
                    {selectedLeague === league && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Kit Type */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Kit Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {kitTypesList.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFilter('kitType', selectedKitType === type ? '' : type)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono text-center border transition-all ${
                      selectedKitType === type
                        ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Era Filter */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Era
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['MODERN', 'RETRO'].map((era) => (
                  <button
                    key={era}
                    onClick={() => updateFilter('era', selectedEra === era ? '' : era)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono text-center border transition-all ${
                      selectedEra === era
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sizesList.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => updateFilter('size', selectedSize === sz ? '' : sz)}
                    className={`w-9 h-9 rounded-lg text-xs font-mono font-bold border transition-all flex items-center justify-center ${
                      selectedSize === sz
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold uppercase text-[var(--text-muted)]">Max Price</span>
                <span className="font-mono font-bold text-[var(--accent-primary)]">{maxPrice} USD</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>
          </aside>

          {/* Main Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Active Filter Chips */}
            {(selectedLeague || selectedClub || selectedKitType || selectedEra || selectedSize || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-muted)] font-mono text-[11px]">Active Filters:</span>
                {selectedLeague && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <LeagueBadge league={selectedLeague} className="w-3.5 h-3.5 shrink-0" />
                    <span>League: {selectedLeague}</span>
                    <button onClick={() => updateFilter('league', '')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedKitType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    Type: {selectedKitType}
                    <button onClick={() => updateFilter('kitType', '')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedEra && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    Era: {selectedEra}
                    <button onClick={() => updateFilter('era', '')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    Size: {selectedSize}
                    <button onClick={() => updateFilter('size', '')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    "{searchQuery}"
                    <button onClick={() => updateFilter('search', '')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Async State Handling */}
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
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-red-900">Failed to load kits</h3>
                <p className="text-xs text-red-700 max-w-sm mx-auto">{error}</p>
                <button
                  onClick={() => updateFilter('search', searchQuery)}
                  className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Retry Query
                </button>
              </div>
            ) : jerseys.length === 0 ? (
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
                    className="px-4 py-2 rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => dispatch(openCopilot())}
                    className="px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask KitBot to Find Kits</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jerseys.map((kit) => (
                  <div
                    key={kit.id}
                    className="bg-white rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Jersey Image */}
                    <Link
                      to={`/jerseys/${kit.slug}`}
                      className="block relative bg-[var(--bg-canvas)] p-6 overflow-hidden"
                    >
                      <img
                        src={kit.images[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                        alt={kit.title}
                        className="w-full h-60 object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {kit.club?.logoUrl && (
                        <img
                          src={kit.club.logoUrl}
                          alt={kit.club.name}
                          className="w-7 h-7 object-contain absolute top-3.5 left-3.5 bg-white/90 p-0.5 rounded-full shadow-xs"
                        />
                      )}
                      <div className="absolute top-3.5 right-3.5 flex flex-col gap-1 items-end">
                        <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-mono font-bold text-[var(--text-secondary)] shadow-xs border border-[var(--border-subtle)]">
                          {kit.season}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-mono font-bold shadow-xs">
                          {kit.kitType}
                        </span>
                      </div>
                    </Link>

                    {/* Details & Actions */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                          {kit.club?.league && <LeagueBadge league={kit.club.league} className="w-3.5 h-3.5 shrink-0" />}
                          <span>{kit.club?.name || 'European Club'}</span>
                        </div>
                        <Link
                          to={`/jerseys/${kit.slug}`}
                          className="font-serif font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors line-clamp-1 mt-0.5"
                        >
                          {kit.title}
                        </Link>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                          {kit.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
                            Base Price
                          </span>
                          <span className="font-serif font-black text-base text-[var(--accent-primary)]">
                            {Number(kit.basePrice).toFixed(2)} USD
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jerseys/${kit.slug}`}
                            className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] transition-colors"
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
          </div>
        </div>
      </div>
    </main>
  );
};
