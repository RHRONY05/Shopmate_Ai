import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Package,
  Search,
  ExternalLink,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useUser, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { fetchUserOrdersApi } from '../services/api';
import type { OrderModel } from '../types';

export const AccountPage: React.FC = () => {
  const { user } = useUser();
  const [guestEmail, setGuestEmail] = useState('');
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteClub, setFavoriteClub] = useState(
    localStorage.getItem('shopmate_fav_club') || 'Arsenal FC'
  );

  useEffect(() => {
    let isCurrent = true;
    if (user?.primaryEmailAddress?.emailAddress) {
      setIsLoading(true);
      fetchUserOrdersApi(user.primaryEmailAddress.emailAddress)
        .then((data) => {
          if (isCurrent) {
            setOrders(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isCurrent) setIsLoading(false);
        });
    }
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleLookupGuestOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setIsLoading(true);
    try {
      const data = await fetchUserOrdersApi(guestEmail.trim());
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClub = (club: string) => {
    setFavoriteClub(club);
    localStorage.setItem('shopmate_fav_club', club);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-1">
            <Link to="/" className="hover:text-[var(--text-primary)]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-bold">My Account</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
            Member Matchday Hub
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Track your authentic kit dispatches and manage your matchday preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: User Profile Card & Preferences */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 shadow-xs space-y-4">
              <SignedIn>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)] text-white font-serif font-black text-xl flex items-center justify-center overflow-hidden shadow-sm">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                      {user?.fullName || 'Kit Collector'}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] font-mono block">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-mono text-emerald-800 font-bold border border-emerald-200">
                      Matchday VIP Member
                    </span>
                  </div>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                        Guest Collector
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Sign in with Clerk to automatically sync your order history
                      </p>
                    </div>
                  </div>

                  <SignInButton mode="modal">
                    <button className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-serif font-bold text-xs hover:bg-[var(--btn-hover)] transition-all shadow-xs cursor-pointer">
                      Sign In to Account
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>

              {/* Favorite Club Selector */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>Favorite Club Loyalty</span>
                </label>
                <select
                  value={favoriteClub}
                  onChange={(e) => handleSaveClub(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  <option value="Arsenal FC">Arsenal FC</option>
                  <option value="Manchester City">Manchester City</option>
                  <option value="Liverpool FC">Liverpool FC</option>
                  <option value="Chelsea FC">Chelsea FC</option>
                  <option value="Manchester United">Manchester United</option>
                  <option value="Real Madrid">Real Madrid</option>
                  <option value="FC Barcelona">FC Barcelona</option>
                  <option value="Atlético Madrid">Atlético Madrid</option>
                  <option value="Inter Milan">Inter Milan</option>
                  <option value="Juventus">Juventus</option>
                  <option value="AC Milan">AC Milan</option>
                  <option value="Bayern Munich">Bayern Munich</option>
                </select>
              </div>
            </div>

            {/* Guest Order Lookup */}
            <SignedOut>
              <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Lookup Guest Order</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Enter the email address you provided during checkout to view your receipt:
                </p>
                <form onSubmit={handleLookupGuestOrders} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                  >
                    Find Orders
                  </button>
                </form>
              </div>
            </SignedOut>
          </div>

          {/* Right Column: Order History List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                    Dispatched & Historic Orders
                  </h3>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} on record
                  </span>
                </div>
                <Link
                  to="/jerseys"
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                  <span>Browse More Kits</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-mono text-[var(--text-muted)]">Loading order dispatches...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
                    <Package className="w-7 h-7 opacity-40" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                      No Orders Found
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                      There are no matchday orders recorded for this profile yet. Once you complete a purchase, your
                      authenticity ticket will appear here.
                    </p>
                  </div>
                  <Link
                    to="/jerseys"
                    className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--btn-hover)] transition-all shadow-xs"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/40 hover:border-[var(--accent-primary)]/40 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)]">{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[var(--text-muted)]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-white border border-[var(--border-subtle)] text-[10px] font-mono font-bold flex items-center justify-center text-[var(--text-secondary)]">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-[var(--text-primary)]">
                                {item.jerseyVariant?.jersey?.title || 'Authentic Football Kit'} ({item.jerseyVariant?.size})
                              </span>
                              {item.customName && (
                                <span className="text-[10px] text-emerald-800 font-mono font-bold">
                                  (#{item.customNumber} {item.customName})
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-[var(--text-primary)]">
                              {(Number(item.priceAtPurchase) * item.quantity).toFixed(2)} USD
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="font-serif font-black text-sm text-[var(--accent-primary)]">
                          Total: {Number(order.totalAmount).toFixed(2)} USD
                        </span>
                        <Link
                          to={`/orders/${order.orderNumber || order.id}/success`}
                          className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                        >
                          <span>View Matchday Ticket</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
