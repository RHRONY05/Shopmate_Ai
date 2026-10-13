export interface FontPairing {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  category: string;
  googleFontsUrl: string;
  description: string;
}

export const curatedFontPairings: FontPairing[] = [
  {
    id: 'barlow-superfamily',
    name: '1. Athletic Matchday (Barlow Superfamily)',
    headingFont: "'Barlow Condensed', sans-serif",
    bodyFont: "'Barlow', sans-serif",
    category: 'Harmonious Superfamily (Condensed + Standard)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap',
    description:
      'Authentic player squad names for headlines, with standard Barlow body text sharing 100% of the exact same curve and line DNA.',
  },
  {
    id: 'outfit-family',
    name: '2. Modern Streetwear (Outfit Family)',
    headingFont: "'Outfit', sans-serif",
    bodyFont: "'Outfit', sans-serif",
    category: 'Pure Single Family (Bold 800 + Regular 400)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
    description:
      'High-end fashion streetwear drop aesthetic: geometric headline weight paired seamlessly with its own readable regular body weight.',
  },
  {
    id: 'inter-tight-family',
    name: '3. Ultra-Crisp Precision (Inter Superfamily)',
    headingFont: "'Inter Tight', sans-serif",
    bodyFont: "'Inter', sans-serif",
    category: 'Harmonious Superfamily (Tight Sans + Standard Sans)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap',
    description:
      'Punchy compact headline letters with legendary digital reading clarity for specs, prices, and AI shopping conversations.',
  },
  {
    id: 'plus-jakarta-family',
    name: '4. Contemporary Athletic (Plus Jakarta Sans)',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    category: 'Pure Single Family (ExtraBold 800 + Regular 400)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    description:
      'Clean modern European tech and luxury sportswear storefront: energetic heavy title weight and perfectly balanced body letters.',
  },
  {
    id: 'rubik-family',
    name: '5. Dynamic Sportswear (Rubik Family)',
    headingFont: "'Rubik', sans-serif",
    bodyFont: "'Rubik', sans-serif",
    category: 'Pure Single Family (Bold 700 + Regular 400)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap',
    description:
      'Subtly rounded athletic corners inspired by sports equipment and apparel tags, giving a friendly, cohesive visual experience.',
  },
  {
    id: 'cinzel-lusitana',
    name: '6. Royal Trophy & Crest (Cinzel + Lusitana Serif)',
    headingFont: "'Cinzel', serif",
    bodyFont: "'Lusitana', serif",
    category: 'Classical Heritage Serif (Inscriptional + Book)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Lusitana:wght@400;700&display=swap',
    description:
      'Regal European club heritage: classical Roman inscriptional serif titles with warm, readable Lusitana body text.',
  },
  {
    id: 'cinzel-inter',
    name: '7. Heritage Luxury & Precision (Cinzel + Inter)',
    headingFont: "'Cinzel', serif",
    bodyFont: "'Inter', sans-serif",
    category: 'Editorial Hybrid (Inscriptional Serif + Modern UI Sans)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap',
    description:
      'Majestic crest & trophy headlines paired with ultra-clean, high-legibility digital UI text for e-commerce specs and filters.',
  },
  {
    id: 'cinzel-baskerville',
    name: '8. Club Centenary Archive (Cinzel + Libre Baskerville)',
    headingFont: "'Cinzel', serif",
    bodyFont: "'Libre Baskerville', serif",
    category: 'Literary Archive Serif (Roman Crest + Classic Book)',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Libre+Baskerville:wght@400;700&display=swap',
    description:
      'Historic football museum & archive aesthetic: monumental Roman capitals paired with literary English serif typography.',
  },
];

