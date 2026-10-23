import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, KitType, Era, Size } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⚽ Inserting/Updating 4 Hero Showcase Jerseys for 2025/26 season...');

  const showcaseKits = [
    {
      clubSlug: 'barcelona',
      title: 'FC Barcelona 2025/26 Away Authentic Shirt',
      slug: 'barcelona-away-2025-26',
      description: 'The exclusive 2025/26 FC Barcelona Away shirt celebrating the Kobe Bryant Black Mamba aesthetic. Jet-black chassis featuring iridescent purple and gold FC Barcelona crest, gold Kobe sheath emblem, Spotify gold chest sponsor, and deep royal purple gradient at the hem.',
      kitType: KitType.AWAY,
      season: '2025/26',
      era: Era.MODERN,
      basePrice: 149.99,
      isFeatured: true,
      rating: 4.9,
      imageUrl: '/hero_showcase/barca-away-2025-26.png',
      skuPrefix: 'FCB-2526-A',
    },
    {
      clubSlug: 'bayern-munich',
      title: 'FC Bayern Munich 2025/26 Away Authentic Shirt',
      slug: 'bayern-away-2025-26',
      description: 'Retro-inspired 2025/26 FC Bayern Munich Away shirt. Crisp off-white chassis with traditional navy polo collar and thin red piping, vintage Adidas Trefoil branding, round Bayern crest, and navy chest T sponsor.',
      kitType: KitType.AWAY,
      season: '2025/26',
      era: Era.MODERN,
      basePrice: 139.99,
      isFeatured: true,
      rating: 4.8,
      imageUrl: '/hero_showcase/bayern-away-2025-26.png',
      skuPrefix: 'BAY-2526-A',
    },
    {
      clubSlug: 'manchester-city',
      title: 'Manchester City 2025/26 Speed Sash Home Shirt',
      slug: 'man-city-home-2025-26',
      description: 'The futuristic 2025/26 Manchester City Home shirt featuring a dynamic white speed-sash cutting across the signature sky-blue body, crisp navy Puma cat, and Etihad Airways sponsor.',
      kitType: KitType.HOME,
      season: '2025/26',
      era: Era.MODERN,
      basePrice: 139.99,
      isFeatured: true,
      rating: 4.9,
      imageUrl: '/hero_showcase/mancity-home-2025-26.png',
      skuPrefix: 'MCI-2526-H',
    },
    {
      clubSlug: 'real-madrid',
      title: 'Real Madrid 2025/26 Emerald Houndstooth Away Shirt',
      slug: 'real-madrid-away-2025-26',
      description: 'The luxury 2025/26 Real Madrid Away shirt tailored in deep emerald green with an intricate houndstooth monogram weave, retro Adidas Trefoil, monochrome white Real Madrid crest, and Emirates Fly Better printing.',
      kitType: KitType.AWAY,
      season: '2025/26',
      era: Era.MODERN,
      basePrice: 144.99,
      isFeatured: true,
      rating: 5.0,
      imageUrl: '/hero_showcase/realmadrid-away-2025-26.png',
      skuPrefix: 'RMA-2526-A',
    },
  ];

  const clubs = await prisma.club.findMany();
  const clubsMap = new Map(clubs.map((c) => [c.slug, c.id]));
  const sizes = [Size.S, Size.M, Size.L, Size.XL, Size.XXL];

  for (const kit of showcaseKits) {
    const clubId = clubsMap.get(kit.clubSlug);
    if (!clubId) {
      console.warn(`Club not found for slug: ${kit.clubSlug}`);
      continue;
    }

    let jersey = await prisma.jersey.findUnique({
      where: { slug: kit.slug },
    });

    if (!jersey) {
      jersey = await prisma.jersey.create({
        data: {
          clubId,
          title: kit.title,
          slug: kit.slug,
          description: kit.description,
          kitType: kit.kitType,
          season: kit.season,
          era: kit.era,
          basePrice: kit.basePrice,
          isFeatured: kit.isFeatured,
          rating: kit.rating,
          images: [kit.imageUrl],
        },
      });
      console.log(`Created jersey: ${jersey.title} (${jersey.slug})`);

      for (const size of sizes) {
        const stock = size === Size.XXL ? 5 : 25;
        await prisma.jerseyVariant.create({
          data: {
            jerseyId: jersey.id,
            size,
            stockQuantity: stock,
            sku: `${kit.skuPrefix}-${size}`,
          },
        });
      }
    } else {
      jersey = await prisma.jersey.update({
        where: { id: jersey.id },
        data: {
          images: [kit.imageUrl],
          basePrice: kit.basePrice,
          isFeatured: true,
        },
      });
      console.log(`Updated jersey: ${jersey.title} (${jersey.slug})`);
    }
  }

  console.log('✅ All 4 showcase kits are active and available in database!');
}

main()
  .catch((err) => {
    console.error('Error inserting showcase jerseys:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
