import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { LeagueBadge } from '../common/LeagueBadge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--text-primary)] text-white pt-16 pb-12 border-t border-[var(--border-subtle)] mt-24">
      {/* 4 Matchday Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)]">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">100% Authentic Kits</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Direct from official European kit suppliers with verified authenticity serial codes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)]">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">Matchday Custom Printing</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Official squad typography and heat-pressed tournament sleeve badges applied in-house.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)]">
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">Fast Worldwide Dispatch</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Tracked courier shipping directly to your doorstep with guaranteed delivery windows.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)]">
              <RefreshCw className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">Hassle-Free Returns</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                30-day return policy on unworn kits with tags attached for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-emerald-400 mb-4">
            Leagues
          </h4>
          <ul className="space-y-2.5 text-sm text-neutral-400">
            {[
              { name: 'Premier League', slug: 'Premier League' },
              { name: 'La Liga', slug: 'La Liga' },
              { name: 'Serie A', slug: 'Serie A' },
              { name: 'Bundesliga', slug: 'Bundesliga' },
            ].map((league) => (
              <li key={league.name}>
                <Link
                  to={`/jerseys?league=${encodeURIComponent(league.slug)}`}
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <div className="w-5 h-5 rounded-md bg-white/10 p-0.5 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                    <LeagueBadge league={league.name} className="w-full h-full" />
                  </div>
                  <span>{league.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-emerald-400 mb-4">
            Collections
          </h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>
              <Link to="/jerseys?kitType=HOME" className="hover:text-white transition-colors">
                Home Player Editions
              </Link>
            </li>
            <li>
              <Link to="/jerseys?kitType=AWAY" className="hover:text-white transition-colors">
                Away & Third Shirts
              </Link>
            </li>
            <li>
              <Link to="/jerseys?era=RETRO" className="hover:text-white transition-colors">
                Vintage European Heritage
              </Link>
            </li>
            <li>
              <Link to="/jerseys" className="hover:text-white transition-colors">
                Full 2019/20 - 2024/25 Catalog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-emerald-400 mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>
              <Link to="/account" className="hover:text-white transition-colors">
                Track My Order
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition-colors">
                View Shopping Bag
              </Link>
            </li>
            <li>
              <span className="text-neutral-500">Size Chart Guide (Ask KitBot)</span>
            </li>
            <li>
              <span className="text-neutral-500">Authenticity Verification</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-emerald-400 mb-4">
            About The KitRoom
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The KitRoom is the premier curated football kit destination, connecting fans with authentic club matchday shirts, custom player printing, and an intelligent AI stylist.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>Official European Club Kits</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
        <div>&copy; 2026 ShopMate AI — The KitRoom Edition. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <span>Official Matchday Retailer</span>
          <span>Stripe Encrypted Checkout</span>
        </div>
      </div>
    </footer>
  );
};
