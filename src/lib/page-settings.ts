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
}

const DEFAULTS: HomePageData = {
  heroBanner: {
    image: "/hero-main.jpg",
    headline: "VISTE LA OSCURIDAD.",
    subtext: "Nueva colección disponible",
    cta: "VER COLECCIÓN",
    ctaLink: "/tienda",
    textColor: "white",
    visible: true,
  },
  collection1Banner: {
    image: "/banner-collection-1.webp",
    headline: "UNIQUE VIBE",
    subtext: "Colección completa",
    cta: "EXPLORAR",
    ctaLink: "/tienda",
    textColor: "black",
    visible: true,
  },
  collection2Banner: {
    image: "/banner-collection-2.webp",
    headline: "UNIQUE VIBE II",
    subtext: "Nueva temporada",
    cta: "VER MÁS",
    ctaLink: "/tienda",
    textColor: "black",
    visible: true,
  },
  announcementText: "🖤 ENVÍO GRATIS EN PEDIDOS +$250.000 — CÓDIGO: NOIR10 — 10% OFF EN TU PRIMERA COMPRA",
  heroSub: "Nueva colección disponible",
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
    const settings = await prisma.siteSetting.findMany({
      where: { section: "banners" },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    const textSettings = await prisma.siteSetting.findMany({
      where: { section: "texts" },
    });
    const textMap: Record<string, string> = {};
    for (const s of textSettings) textMap[s.key] = s.value;

    return {
      heroBanner: parseBanner(map["hero"], DEFAULTS.heroBanner),
      collection1Banner: parseBanner(map["collection1"], DEFAULTS.collection1Banner),
      collection2Banner: parseBanner(map["collection2"], DEFAULTS.collection2Banner),
      announcementText: textMap["announcement"] ?? DEFAULTS.announcementText,
      heroSub: textMap["hero_sub"] ?? DEFAULTS.heroSub,
    };
  } catch {
    return DEFAULTS;
  }
}
