import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateCartItemThunk, removeCartItemThunk } from '../store/slices/cartSlice';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useAppSelector((state) => state.cart);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const customizationTotal = cart?.customizationTotal || 0;
  const grandTotal = cart?.grandTotal || 0;

  const handleUpdateQuantity = (itemId: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      dispatch(removeCartItemThunk({ itemId }));
    } else {
      dispatch(updateCartItemThunk({ itemId, quantity: nextQty }));
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'MATCHDAY10' || promoCode.trim().toUpperCase() === 'KITROOM') {
      setPromoApplied(true);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--bg-canvas)] py-16">
        <div className="max-w-xl mx-auto px-4 text-center bg-white rounded-3xl border border-[var(--border-subtle)] p-12 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--text-muted)] mx-auto border border-[var(--border-subtle)]">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h1 className="font-serif font-black text-2xl text-[var(--text-primary)]">
            Your Matchday Bag is Empty
          </h1>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
            You have not added any authentic football kits to your bag yet. Browse our verified European catalog or
            consult our AI KitBot stylist.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link
              to="/jerseys"
              className="px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all shadow-xs"
            >
              Explore All Jerseys
            </Link>
            <Link
              to="/jerseys?era=RETRO"
              className="px-6 py-3 rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all border border-[var(--border-subtle)]"
            >
              View Retro Classics
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-1">
              <Link to="/" className="hover:text-[var(--text-primary)]">
                Home
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-bold">Shopping Bag</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
              Your Matchday Shopping Bag
            </h1>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {itemCount} {itemCount === 1 ? 'kit' : 'kits'} verified in your bag
            </span>
          </div>

          <Link
            to="/jerseys"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* 2-Column Bag Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Itemized Cart Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between text-xs font-mono font-bold uppercase text-[var(--text-muted)]">
              <span>Item & Printing Spec</span>
              <span>Subtotal</span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {items.map((item) => {
                const jersey = item.jerseyVariant.jersey;
                const variant = item.jerseyVariant;
                const hasCustom = Boolean(item.customName || item.customNumber !== null || item.sleeveBadge);

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start justify-between">
                    <div className="flex gap-4">
                      {/* Kit Thumbnail */}
                      <div className="w-24 h-28 bg-[var(--bg-canvas)] rounded-xl overflow-hidden shrink-0 border border-[var(--border-subtle)] relative p-2 flex items-center justify-center">
                        <img
                          src={jersey.images[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                          alt={jersey.title}
                          className="w-full h-full object-contain"
                        />
                        {jersey.club?.logoUrl && (
                          <img
                            src={jersey.club.logoUrl}
                            alt={jersey.club.name}
                            className="w-6 h-6 object-contain absolute bottom-1 right-1 bg-white/90 rounded-full p-0.5 shadow-xs"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                          {jersey.club?.name}
                        </span>
                        <Link
                          to={`/jerseys/${jersey.slug}`}
                          className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors block"
                        >
                          {jersey.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-canvas)] text-[var(--text-secondary)] font-bold border border-[var(--border-subtle)]">
                            Size: {variant.size}
                          </span>
                          <span className="text-[var(--accent-primary)] font-bold">
                            {item.unitPrice.toFixed(2)} USD each
                          </span>
                        </div>

                        {/* Matchday Customization Ticket */}
                        {hasCustom && (
                          <div className="mt-2 p-2 bg-emerald-50/60 rounded-lg border border-dashed border-emerald-300 text-xs text-emerald-950 space-y-0.5 font-mono">
                            {item.customName && (
                              <div className="font-bold flex items-center gap-1.5">
                                <Ticket className="w-3.5 h-3.5 text-emerald-700" />
                                <span>#{item.customNumber ?? '00'} {item.customName} (+15 USD)</span>
                              </div>
                            )}
                            {item.sleeveBadge && (
                              <div className="text-[11px] text-emerald-800 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-emerald-600" />
                                <span>{item.sleeveBadge} (+5 USD)</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Line Total */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-[var(--border-subtle)]">
                      <span className="font-serif font-black text-lg text-[var(--text-primary)]">
                        {(item.unitPrice * item.quantity).toFixed(2)} USD
                      </span>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[var(--border-subtle)] rounded-lg bg-white">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeCartItemThunk({ itemId: item.id }))}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & Voucher */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 shadow-xs space-y-6">
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)]">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>Kit Subtotal ({itemCount} items)</span>
                  <span className="font-mono">{subtotal.toFixed(2)} USD</span>
                </div>

                {customizationTotal > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Squad Printing & Tournament Badges</span>
                    <span className="font-mono">+{customizationTotal.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tracked Express Courier</span>
                  <span className="font-mono text-emerald-600 font-semibold">FREE</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Matchday Turnstile Discount (10%)</span>
                    <span className="font-mono">-{(grandTotal * 0.1).toFixed(2)} USD</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base text-[var(--text-primary)]">
                    Verified Total
                  </span>
                  <span className="font-serif font-black text-2xl text-[var(--accent-primary)]">
                    {promoApplied ? (grandTotal * 0.9).toFixed(2) : grandTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Turnstile Voucher Form */}
              <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[var(--border-subtle)]">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] block mb-1.5">
                  Turnstile Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. MATCHDAY10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Voucher MATCHDAY10 successfully applied!</span>
                  </div>
                )}
              </form>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--accent-primary)] text-white font-serif font-black text-sm hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--text-muted)] font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Stripe 256-bit SSL Encrypted Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
