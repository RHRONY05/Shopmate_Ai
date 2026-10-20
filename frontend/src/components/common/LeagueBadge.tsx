import React from 'react';

interface LeagueBadgeProps {
  league: string;
  className?: string;
}

/**
 * Official Authentic League Crest Badges from TheSportsDB (Canonical Global Sports Registry).
 * Bundled locally in /leagues/ with automatic CDN failover.
 */
const LEAGUE_ASSETS: Record<string, { src: string; fallbackCdn: string; alt: string }> = {
  premier: {
    src: '/leagues/premier-league.png',
    fallbackCdn: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
    alt: 'Premier League Official Crest',
  },
  liga: {
    src: '/leagues/la-liga.png',
    fallbackCdn: 'https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png',
    alt: 'La Liga EA Sports Official Crest',
  },
  serie: {
    src: '/leagues/serie-a.png',
    fallbackCdn: 'https://r2.thesportsdb.com/images/media/league/badge/67q3q21679951383.png',
    alt: 'Serie A Official Crest',
  },
  bundesliga: {
    src: '/leagues/bundesliga.png',
    fallbackCdn: 'https://r2.thesportsdb.com/images/media/league/badge/teqh1b1679952008.png',
    alt: 'Bundesliga Official Crest',
  },
};

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({ league, className = 'w-10 h-10' }) => {
  const normalized = league.toLowerCase();
  const key = Object.keys(LEAGUE_ASSETS).find((k) => normalized.includes(k));
  const asset = key ? LEAGUE_ASSETS[key] : null;

  if (!asset) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 font-bold text-xs ${className}`}>
        {league.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={asset.src}
        alt={asset.alt}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = asset.fallbackCdn;
        }}
        className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300"
      />
    </div>
  );
};
