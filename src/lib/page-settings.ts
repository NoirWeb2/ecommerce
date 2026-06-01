import { prisma } from "@/lib/prisma";

export interface BannerData {
image: string;
headline: string;
subtext: string;
cta: string;
ctaLink: string;
textColor: "black" | "white";
visible: boolean;
}

export interface HomePageData {
heroBanner: BannerData;
collection1Banner: BannerData;
collection2Banner: BannerData;
announcementText: string;
heroSub: string;
featuredProducts: any[]; 
newProducts: any[];
}

// 👇 DEFAULTS LIMPIOS
const DEFAULTS: HomePageData = {
heroBanner: { image: "", headline: "", subtext: "", cta: "", ctaLink: "", textColor: "white", visible: false },
collection1Banner: { image: "", headline: "", subtext: "", cta: "", ctaLink: "", textColor: "black", visible: false },
collection2Banner: { image: "", headline: "", subtext: "", cta: "", ctaLink: "", textColor: "black", visible: false },
announcementText: "",
heroSub: "",
featuredProducts: [],
newProducts: [],
};

function parseBanner(raw: string | undefined, fallback: BannerData): BannerData {
if (!raw) return fallback;
try {
  return { ...fallback, ...JSON.parse(raw) };
} catch {
  return fallback;
}
}

export async function getHomePageData(): Promise<HomePageData> {
try {
  // 1. Traemos configuraciones de Banners
  const settings = await prisma.siteSetting.findMany({
    where: { section: "banners" },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  // 2. Traemos configuraciones de Textos
  const textSettings = await prisma.siteSetting.findMany({
    where: { section: "texts" },
  });
  const textMap: Record<string, string> = {};
  for (const s of textSettings) textMap[s.key] = s.value;

  // 3. 🛡️ PRODUCTOS DESTACADOS: Activos, Destacados y que NO sean Gel eGo (isAddon: false)
  const featuredProducts = await prisma.product.findMany({
    where: { 
      isFeatured: true,
      status: "ACTIVE",
      isAddon: false
    },
    take: 5, 
    include: { 
      images: { orderBy: { order: "asc" } }, 
      variants: true 
    } 
  });

  // 4. 🛡️ PRODUCTOS NUEVOS: Activos, Nuevos y que NO sean Gel eGo (isAddon: false)
  const newProducts = await prisma.product.findMany({
    where: { 
      isNew: true,
      status: "ACTIVE",
      isAddon: false
    },
    take: 5,
    include: { 
      images: { orderBy: { order: "asc" } }, 
      variants: true 
    }
  });

  return {
    heroBanner: parseBanner(map["hero"], DEFAULTS.heroBanner),
    collection1Banner: parseBanner(map["collection1"], DEFAULTS.collection1Banner),
    collection2Banner: parseBanner(map["collection2"], DEFAULTS.collection2Banner),
    announcementText: textMap["announcement"] ?? DEFAULTS.announcementText,
    heroSub: textMap["hero_sub"] ?? DEFAULTS.heroSub,
    featuredProducts,
    newProducts,
  };
} catch (error: any) {
  console.error("🔥 ERROR FATAL CARGANDO LA DATA DEL HOME:", error);
  throw new Error(`ERROR AL CARGAR LA BASE DE DATOS: ${error?.message || error}`);
}
}