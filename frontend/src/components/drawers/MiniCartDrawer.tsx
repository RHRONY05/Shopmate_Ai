import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeCart, updateCartItemThunk, removeCartItemThunk } from '../../store/slices/cartSlice';

export const MiniCartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, isOpen, isLoading } = useAppSelector((state) => state.cart);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const grandTotal = cart?.grandTotal || 0;
  const subtotal = cart?.subtotal || 0;
  const customizationTotal = cart?.customizationTotal || 0;

  const handleUpdateQuantity = (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      dispatch(removeCartItemThunk({ itemId }));
    } else {
      dispatch(updateCartItemThunk({ itemId, quantity: newQty }));
    }
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeCartItemThunk({ itemId }));
  };

  const handleCheckoutClick = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(closeCart())}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[var(--border-subtle)] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-canvas)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-[var(--text-primary)]">
                  Matchday Bag
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} verified
                </span>
              </div>
            </div>

            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-neutral-200/50 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                    Your matchday bag is empty
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                    Explore authentic 2019/20 - 2024/25 European kits or ask our AI KitBot for personalized recommendations.
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(closeCart());
                    navigate('/jerseys');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all shadow-xs"
                >
                  Browse Kit Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const jersey = item.jerseyVariant.jersey;
                const variant = item.jerseyVariant;
                const hasCustom = Boolean(item.customName || item.customNumber !== null || item.sleeveBadge);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-white hover:border-[var(--accent-primary)]/40 transition-all flex gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 bg-[var(--bg-canvas)] rounded-lg overflow-hidden shrink-0 border border-[var(--border-subtle)] relative">
                      <img
                        src={jersey.images[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d'}
                        alt={jersey.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {jersey.club?.logoUrl && (
                        <img
                          src={jersey.club.logoUrl}
                          alt={jersey.club.name}
                          className="w-5 h-5 object-contain absolute bottom-1 right-1 bg-white/90 rounded-full p-0.5 shadow-xs"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-xs text-[var(--text-primary)] leading-snug line-clamp-2">
                            {jersey.title}
                          </h4>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-[var(--text-muted)] hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-[var(--bg-canvas)] text-[10px] font-mono font-bold rounded text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            Size: {variant.size}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                            {item.unitPrice.toFixed(2)} USD
                          </span>
                        </div>

                        {/* Matchday Ticket Customization Stub */}
                        {hasCustom && (
                          <div className="mt-2 p-1.5 bg-[var(--bg-canvas)] rounded-md border border-dashed border-[var(--border-subtle)] text-[10px] space-y-0.5">
                            {item.customName && (
                              <div className="font-mono font-bold text-[var(--text-primary)] tracking-wider">
                                #{item.customNumber ?? '00'} {item.customName} (+15 USD)
                              </div>
                            )}
                            {item.sleeveBadge && (
                              <div className="text-[var(--text-muted)] flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{item.sleeveBadge} (+5 USD)</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center border border-[var(--border-subtle)] rounded-md bg-white">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif font-black text-xs text-[var(--text-primary)]">
                          {(item.unitPrice * item.quantity).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
              <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>Base Kit Subtotal</span>
                  <span className="font-mono">{subtotal.toFixed(2)} USD</span>
                </div>
                {customizationTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Squad Customization & Badges</span>
                    <span className="font-mono">+{customizationTotal.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tracked Express Shipping</span>
                  <span className="font-mono text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-base text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
                  <span>Verified Total</span>
                  <span className="font-mono font-black text-[var(--accent-primary)]">
                    {grandTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckoutClick}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent-primary)] text-white font-serif font-bold text-sm hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Proceed to Matchday Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    dispatch(closeCart());
                    navigate('/cart');
                  }}
                  className="w-full py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-center block"
                >
                  View Full Cart & Turnstile Vouchers
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit Stripe Payment Intent</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
