import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Tag,
  Sparkles,
  Bot,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addToCartThunk } from '../store/slices/cartSlice';
import { openCopilot } from '../store/slices/copilotSlice';
import { fetchJerseyBySlug } from '../services/api';
import { JerseyCustomizerCanvas } from '../components/customizer/JerseyCustomizerCanvas';
import { LeagueBadge } from '../components/common/LeagueBadge';
import type { Jersey, Size } from '../types';

export const JerseyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();

  const [jersey, setJersey] = useState<Jersey | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customization State
  const [enablePrinting, setEnablePrinting] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [hasSleeveBadge, setHasSleeveBadge] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    fetchJerseyBySlug(slug)
      .then((data) => {
        if (isCurrent) {
          setJersey(data);
          setSelectedImage(data.images[0] || '');
          // Default to first available size variant
          if (data.variants && data.variants.length > 0) {
            const defaultVar = data.variants.find((v) => v.stockQuantity > 0) || data.variants[0];
            setSelectedSize(defaultVar.size);
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Could not load jersey');
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--bg-canvas)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-7 bg-[var(--bg-canvas)] rounded-2xl h-[450px]" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 bg-[var(--bg-canvas)] rounded w-1/3" />
              <div className="h-10 bg-[var(--bg-canvas)] rounded w-3/4" />
              <div className="h-24 bg-[var(--bg-canvas)] rounded" />
              <div className="h-12 bg-[var(--bg-canvas)] rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !jersey) {
    return (
      <main className="min-h-screen bg-[var(--bg-canvas)] py-16">
        <div className="max-w-xl mx-auto px-4 text-center bg-white rounded-2xl border border-[var(--border-subtle)] p-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-serif font-black text-2xl text-[var(--text-primary)]">Jersey Not Found</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {error || `The football kit '${slug}' does not exist or has been retired from the matchday catalog.`}
          </p>
          <div className="pt-2">
            <Link
              to="/jerseys"
              className="px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all shadow-xs"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Selected Variant & Stock
  const activeVariant = jersey.variants?.find((v) => v.size === selectedSize);
  const stockAvailable = activeVariant ? activeVariant.stockQuantity : 0;
  const isOutOfStock = stockAvailable <= 0;

  // Server-Authoritative Price Breakdown
  const basePrice = Number(jersey.basePrice);
  const printingCost = enablePrinting && (playerName.trim() || playerNumber.trim()) ? 15.0 : 0.0;
  const badgeCost = enablePrinting && hasSleeveBadge ? 5.0 : 0.0;
  const calculatedTotal = basePrice + printingCost + badgeCost;

  const handleAddToBag = async () => {
    if (!activeVariant || isOutOfStock) return;

    setIsAdding(true);
    await dispatch(
      addToCartThunk({
        payload: {
          jerseyVariantId: activeVariant.id,
          quantity: 1,
          customName: enablePrinting && playerName.trim() ? playerName.trim().toUpperCase() : null,
          customNumber: enablePrinting && playerNumber.trim() ? parseInt(playerNumber.trim(), 10) : null,
          sleeveBadge: enablePrinting && hasSleeveBadge ? 'Official League Badge' : null,
        },
      })
    );
    setIsAdding(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6">
          <Link to="/" className="hover:text-[var(--text-primary)]">
            Home
          </Link>
          <span>/</span>
          <Link to="/jerseys" className="hover:text-[var(--text-primary)]">
            Catalog
          </Link>
          <span>/</span>
          {jersey.club && (
            <>
              <Link
                to={`/jerseys?league=${encodeURIComponent(jersey.club.league)}`}
                className="hover:text-[var(--text-primary)] inline-flex items-center gap-1.5"
              >
                <LeagueBadge league={jersey.club.league} className="w-3.5 h-3.5 shrink-0" />
                <span>{jersey.club.league}</span>
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">{jersey.title}</span>
        </div>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 mb-12">
          {/* Left Column: Photo Gallery */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-[var(--bg-canvas)]/50 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="relative rounded-2xl bg-white p-8 border border-[var(--border-subtle)] shadow-sm flex items-center justify-center min-h-[420px]">
              <img
                src={selectedImage || jersey.images[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                alt={jersey.title}
                className="w-full max-h-[380px] object-contain drop-shadow-xl"
              />
              {jersey.club?.logoUrl && (
                <img
                  src={jersey.club.logoUrl}
                  alt={jersey.club.name}
                  className="w-12 h-12 object-contain absolute top-4 left-4 bg-white/95 p-1.5 rounded-full shadow-sm border border-[var(--border-subtle)]"
                />
              )}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                <span>{jersey.season}</span>
                <span>•</span>
                <span className="text-[var(--accent-primary)]">{jersey.kitType}</span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {jersey.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                {jersey.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 rounded-xl bg-white p-1.5 border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-[var(--accent-primary)] shadow-sm scale-105'
                        : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Matchday Verification Banner */}
            <div className="mt-6 p-4 rounded-xl bg-white border border-[var(--border-subtle)] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[var(--text-primary)]">Guaranteed 100% Authentic Matchday Edition</span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Includes verified club serial label, heat-sealed crest, and official tournament packaging.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Kit Specs, Size Selector & Purchase */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] text-xs font-mono font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {jersey.club?.name || 'European Club'}
                </span>
                {jersey.club?.league && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-xs font-mono font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-2xs">
                    <LeagueBadge league={jersey.club.league} className="w-3.5 h-3.5 shrink-0" />
                    <span>{jersey.club.league}</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-xs font-mono font-bold text-emerald-800 border border-emerald-200">
                  {jersey.era} HERITAGE
                </span>
              </div>

              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] leading-snug">
                {jersey.title}
              </h1>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold text-[var(--text-primary)]">{jersey.rating.toFixed(1)}</span>
                  <span className="text-[var(--text-muted)]">(Verified Reviews)</span>
                </div>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">SKU: {activeVariant?.sku || 'MK-KR-001'}</span>
              </div>

              {/* Price display */}
              <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono text-[var(--text-muted)] block">
                    Calculated Total Price
                  </span>
                  <span className="font-serif font-black text-2xl text-[var(--accent-primary)]">
                    {calculatedTotal.toFixed(2)} USD
                  </span>
                </div>
                {printingCost > 0 && (
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Includes Custom Printing
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{jersey.description}</p>

              {/* Size Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
                    Select Size (European Spec)
                  </span>
                  <button
                    onClick={() => dispatch(openCopilot())}
                    className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask KitBot Size Advisor</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as Size[]).map((sz) => {
                    const variantForSize = jersey.variants?.find((v) => v.size === sz);
                    const qty = variantForSize ? variantForSize.stockQuantity : 0;
                    const isSoldOut = qty <= 0;

                    return (
                      <button
                        key={sz}
                        disabled={isSoldOut}
                        onClick={() => setSelectedSize(sz)}
                        className={`h-11 rounded-xl text-xs font-mono font-bold border flex flex-col items-center justify-center transition-all ${
                          selectedSize === sz
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                            : isSoldOut
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through'
                            : 'bg-white border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                        }`}
                      >
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stock Feedback Badge */}
                <div className="mt-2 text-xs font-mono">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-bold">Sold Out in Size {selectedSize}</span>
                  ) : stockAvailable < 5 ? (
                    <span className="text-amber-700 font-semibold">
                      ⚠️ Low Stock: Only {stockAvailable} item(s) available in Size {selectedSize}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">
                      ✓ In Stock ({stockAvailable} units ready for dispatch)
                    </span>
                  )}
                </div>
              </div>

              {/* Matchday Custom Printing Toggle */}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setEnablePrinting(!enablePrinting)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    enablePrinting
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-[var(--accent-primary)]" />
                    <div>
                      <span className="font-serif font-bold text-xs block">
                        Add Matchday Squad Name & Number Printing
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        Official heat-pressed typography (+15 USD)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                    {enablePrinting ? 'Enabled' : '+ Add'}
                  </span>
                </button>

                {/* Printing Inputs */}
                {enablePrinting && (
                  <div className="mt-3 p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] block mb-1">
                        Player / Squad Name (Max 15 Characters)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. SAKA, MESSI, YOUR SURNAME"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] block mb-1">
                        Squad Number (0–99)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="7"
                        value={playerNumber}
                        onChange={(e) => setPlayerNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                      />
                    </div>

                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSleeveBadge}
                        onChange={(e) => setHasSleeveBadge(e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent-primary)] rounded"
                      />
                      <span className="text-xs text-[var(--text-secondary)] font-medium">
                        Attach Official Tournament Sleeve Badge (+5.00 USD)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Bag CTA */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <button
                onClick={handleAddToBag}
                disabled={isOutOfStock || isAdding}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--accent-primary)] text-white font-serif font-black text-sm hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {isOutOfStock
                    ? 'Sold Out in Selected Size'
                    : isAdding
                    ? 'Adding to Bag...'
                    : `Add to Matchday Bag • ${calculatedTotal.toFixed(2)} USD`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Free Tracked Shipping
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Canvas Customization Preview Section */}
        {enablePrinting && (
          <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-12 shadow-md mb-12 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matchday Custom Printing Preview</span>
              </div>
              <h2 className="font-serif font-black text-2xl text-[var(--text-primary)]">
                Live Squad Typography Canvas
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Rendered with official European tournament font weights, squad numbers, and metallic patch positioning.
              </p>
            </div>

            <JerseyCustomizerCanvas
              jerseyTitle={jersey.title}
              playerName={playerName}
              playerNumber={playerNumber}
              hasSleeveBadge={hasSleeveBadge}
              sleeveBadgeName="Premier League Patch"
            />
          </div>
        )}
      </div>
    </main>
  );
};
