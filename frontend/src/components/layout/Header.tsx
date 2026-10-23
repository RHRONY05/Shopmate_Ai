import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Bot,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleCart } from '../../store/slices/cartSlice';
import { toggleCopilot } from '../../store/slices/copilotSlice';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { LeagueBadge } from '../common/LeagueBadge';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useAppSelector((state) => state.cart.cart);
  const isCopilotOpen = useAppSelector((state) => state.copilot.isOpen);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaguesOpen, setLeaguesOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const isHomePage = location.pathname === '/';

  // Track scroll position to blend with hero slide when at top of homepage,
  // and switch to transparent white when scrolled into other sections or on other pages
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolledPastHero(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolledPastHero(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const isHeroActive = isHomePage && !isScrolledPastHero;
  const totalItemsCount = cart?.itemCount || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/jerseys?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setMobileMenuOpen(false);
    }
  };

  const leagues = [
    {
      name: 'Premier League',
      slug: 'Premier League',
      clubs: ['Arsenal FC', 'Manchester City', 'Liverpool FC', 'Chelsea FC', 'Manchester United'],
    },
    {
      name: 'La Liga',
      slug: 'La Liga',
      clubs: ['Real Madrid', 'FC Barcelona', 'Atlético Madrid'],
    },
    {
      name: 'Serie A',
      slug: 'Serie A',
      clubs: ['Inter Milan', 'Juventus', 'AC Milan'],
    },
    {
      name: 'Bundesliga',
      slug: 'Bundesliga',
      clubs: ['Bayern Munich'],
    },
  ];

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        isHeroActive
          ? 'border-transparent shadow-none'
          : 'border-black/5 shadow-xs'
      }`}
      style={{
        backgroundColor: isHeroActive
          ? 'var(--hero-navbar-bg)'
          : 'rgba(255, 255, 255, 0.75)',
      }}
    >
      {/* 1. Top Banner: Matchday Heritage Assurance (Single line, no wrap) */}
      <div className="bg-[var(--text-primary)] text-[var(--bg-surface)] text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
        <span className="truncate">Official Matchday Heritage — 100% Authentic Kits with Verified Season Tags</span>
      </div>

      {/* 2. Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img
                src="/logo.jpg"
                alt="ShopMate AI The KitRoom Crest"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-xs border border-[var(--border-subtle)] group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-serif font-black text-base sm:text-xl tracking-wider text-[var(--text-primary)] leading-none whitespace-nowrap">
                  THE KITROOM
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] mt-1 whitespace-nowrap truncate">
                  ShopMate AI Football Curator
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/jerseys"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              All Jerseys
            </Link>

            {/* Leagues Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setLeaguesOpen(true)}
              onMouseLeave={() => setLeaguesOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 whitespace-nowrap"
                onClick={() => setLeaguesOpen(!leaguesOpen)}
              >
                <span>Leagues</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${leaguesOpen ? 'rotate-180' : ''}`} />
              </button>

              {leaguesOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-[var(--border-subtle)] p-4 grid gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {leagues.map((league) => (
                    <div key={league.name} className="border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <LeagueBadge league={league.name} className="w-5 h-5 shrink-0" />
                        <Link
                          to={`/jerseys?league=${encodeURIComponent(league.slug)}`}
                          onClick={() => setLeaguesOpen(false)}
                          className="font-serif font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] whitespace-nowrap"
                        >
                          {league.name}
                        </Link>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {league.clubs.map((club) => (
                          <Link
                            key={club}
                            to={`/jerseys?search=${encodeURIComponent(club)}`}
                            onClick={() => setLeaguesOpen(false)}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:underline whitespace-nowrap"
                          >
                            {club}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/jerseys?era=RETRO"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              Retro Classics
            </Link>

            <Link
              to="/account"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              My Orders
            </Link>
          </nav>

          {/* Quick Search & Actions (Uncrowded, single-line alignment) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Input (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search club, player, year..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-xs rounded-full bg-white/60 hover:bg-white/80 border border-black/10 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
            </form>

            {/* AI KitBot Copilot Drawer Trigger */}
            <button
              onClick={() => dispatch(toggleCopilot())}
              data-copilot-trigger="true"
              className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                isCopilotOpen
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                  : 'bg-white/60 text-[var(--text-primary)] border-black/10 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-white shadow-2xs'
              }`}
              title="Open AI KitBot Matchday Stylist"
              aria-label="Ask KitBot"
            >
              <div className="relative shrink-0">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="hidden sm:inline whitespace-nowrap">Ask KitBot</span>
            </button>

            {/* Mini-Cart Slide-Over Button */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 sm:p-2.5 rounded-full bg-white/60 text-[var(--text-primary)] hover:bg-white transition-all border border-black/10 shrink-0 shadow-2xs"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 rounded-full bg-[var(--accent-primary)] text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-150">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Clerk User Button / Sign In */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-[var(--border-subtle)] shrink-0">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-[var(--bg-canvas)] transition-colors">
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline whitespace-nowrap">Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Category Quick-Scroll Bar (Zero wrap, single-line horizontal swipe) */}
      <nav
        aria-label="Mobile Quick Categories"
        className="lg:hidden bg-[var(--bg-canvas)]/60 border-t border-[var(--border-subtle)] px-3 py-2 overflow-x-auto flex items-center gap-2 text-xs font-semibold whitespace-nowrap scrollbar-none"
      >
        <Link
          to="/jerseys"
          className="px-3 py-1 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors shrink-0 shadow-2xs"
        >
          All Kits
        </Link>
        {leagues.map((l) => (
          <Link
            key={l.name}
            to={`/jerseys?league=${encodeURIComponent(l.slug)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors shrink-0 shadow-2xs"
          >
            <LeagueBadge league={l.name} className="w-3.5 h-3.5 shrink-0" />
            <span>{l.name}</span>
          </Link>
        ))}
        <Link
          to="/jerseys?era=RETRO"
          className="px-3 py-1 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors shrink-0 shadow-2xs"
        >
          Retro Classics
        </Link>
      </nav>

      {/* 4. Mobile Drawer Menu (Simplified single-line list rows) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[var(--border-subtle)] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search club, player, year..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
          </form>

          <div className="flex flex-col divide-y divide-[var(--border-subtle)] pt-1">
            <Link
              to="/jerseys"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              <span>All Jerseys</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
            <Link
              to="/jerseys?era=RETRO"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              <span>Retro Classics</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              <span>My Orders</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <span>Shopping Bag</span>
                {totalItemsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[11px] font-bold">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-2 font-bold">
              Shop By League
            </span>
            <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {leagues.map((l) => (
                <Link
                  key={l.name}
                  to={`/jerseys?league=${encodeURIComponent(l.slug)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2.5">
                    <LeagueBadge league={l.name} className="w-5 h-5 shrink-0" />
                    <span>{l.name}</span>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{l.clubs.length} Clubs</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
