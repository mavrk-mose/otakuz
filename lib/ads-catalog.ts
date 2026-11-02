export type AdContextCategory =
  | "home"
  | "shop"
  | "events"
  | "news";

export type AdInterestTag =
  | "Energy Drinks"
  | "Gaming PCs"
  | "Geek Gear"
  | "Anime & Merch"
  | "Events & Cons"
  | "Creator Tech";

export interface DynamicAdCampaign {
  id: string;
  contexts: AdContextCategory[];
  interestTag: AdInterestTag;
  brand: string;
  headline: string;
  description: string;
  ctaLabel: string;
  href: string;
  promoCode?: string;
  discountBadge: string;
  accentClass: string;
  imageUrl: string;
}

export const DYNAMIC_AD_CAMPAIGNS: DynamicAdCampaign[] = [
  {
    id: "kitsune-energy-yuzu",
    contexts: ["home", "shop", "events", "news"],
    interestTag: "Energy Drinks",
    brand: "KITSUNE SPARK // GAMER FUEL",
    headline: "Zero-Sugar Electric Yuzu & White Peach Energy Tubs",
    description:
      "Formulated for late-night ranked queues and seasonal anime marathons. Clean nootropics, 150mg natural caffeine, zero crash, plus limited Mecha Shaker bundles.",
    ctaLabel: "Claim Starter Pack",
    href: "https://gfuel.com",
    promoCode: "OTAKUZ20",
    discountBadge: "20% OFF + FREE SHAKER",
    accentClass: "from-amber-500/20 via-rose-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "nebulaforge-gaming-pc",
    contexts: ["home", "shop", "news"],
    interestTag: "Gaming PCs",
    brand: "NEBULAFORGE CUSTOM RIGS",
    headline: "Liquid-Cooled Anime Chassis RTX Gaming Desktops",
    description:
      "UV-printed tempered glass panels, panoramic ARGB airflow, and 240+ FPS 4K performance built for Genshin, Cyberpunk, Tekken 8, and Unreal 5.",
    ctaLabel: "Configure Your Rig",
    href: "https://starforgesystems.com",
    promoCode: "OTAKURIG",
    discountBadge: "$150 OFF CUSTOM BUILDS",
    accentClass: "from-indigo-500/20 via-rose-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "akibatype-hall-keyboards",
    contexts: ["home", "shop", "news"],
    interestTag: "Geek Gear",
    brand: "AKIBATYPE LABS",
    headline: "Rapid-Trigger Magnetic Keyboards & Japanese Sublegend PBT Sets",
    description:
      " CNC aluminum 75% gasket boards paired with dye-sub Hiragana keycaps and ultra-low 0.1mm actuation switches for osu!, Valorant, and coding.",
    ctaLabel: "Shop Keyboards",
    href: "https://mechanicalkeyboards.com",
    promoCode: "THOCK15",
    discountBadge: "LIMITED DROP LIVE",
    accentClass: "from-rose-500/20 via-purple-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "ramune-surge-cans",
    contexts: ["shop", "events", "home"],
    interestTag: "Energy Drinks",
    brand: "RAMUNE SURGE",
    headline: "Chilled Blue Ramune & Lychee Sparkling Gaming Cans (12-Pack)",
    description:
      "Crisp Japanese marble-soda flavor supercharged with electrolytes, B-vitamins, and L-theanine focus support for convention weekends and LAN nights.",
    ctaLabel: "Build 12-Pack Box",
    href: "https://gamersupps.gg",
    promoCode: "RAMUNE10",
    discountBadge: "BUY 2 GET 1 FREE",
    accentClass: "from-cyan-500/20 via-blue-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "kuroview-oled-monitor",
    contexts: ["shop", "news", "home"],
    interestTag: "Creator Tech",
    brand: "KUROVIEW DISPLAYS",
    headline: "32\" 4K 240Hz QD-OLED HDR1000 Anime & Esports Monitor",
    description:
      "True 0.03ms response time and 99% DCI-P3 studio color accuracy so MAPPA & Ufotable sakuga sequences pop with infinite contrast.",
    ctaLabel: "Explore Specs",
    href: "https://rog.asus.com/monitors",
    discountBadge: "SAVE $200 THIS WEEK",
    accentClass: "from-emerald-500/20 via-teal-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "tokyo-con-travel-pass",
    contexts: ["events", "home", "news"],
    interestTag: "Events & Cons",
    brand: "AKIBA EXPEDITIONS",
    headline: "Anime Expo, Comiket & Akihabara Hotel + Rail Pass Bundles",
    description:
      "Book verified convention-block hotels, 14-day Japan Rail Passes, and VIP early-hall badges with zero booking fees for Otakuz members.",
    ctaLabel: "View Con Packages",
    href: "https://www.japan-guide.com",
    promoCode: "CONPASS50",
    discountBadge: "EARLY BIRD PASSES",
    accentClass: "from-rose-500/20 via-amber-500/15 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "cosforge-armor-workshop",
    contexts: ["events", "shop"],
    interestTag: "Events & Cons",
    brand: "COSFORGE STUDIO SUPPLY",
    headline: "High-Density EVA Foam, Programmable RGB Blades & Heat-Safe Wigs",
    description:
      "Everything cosplayers need before con crunch: pre-primed foam rolls, neo-pixel prop kits, breathable stylized wigs, and express rush shipping.",
    ctaLabel: "Gear Up for Con",
    href: "https://arda-wigs.com",
    promoCode: "COSPLAY15",
    discountBadge: "CON CRUNCH EXPRESS",
    accentClass: "from-fuchsia-500/20 via-rose-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "cyberarena-lan-tourney",
    contexts: ["events", "home"],
    interestTag: "Events & Cons",
    brand: "CYBERARENA CHAMPIONSHIP SERIES",
    headline: "Guilty Gear, Street Fighter 6 & Tekken Regional LAN Open",
    description:
      "Register for open-bracket anime fighter tournaments, artist alley booths, arcade rhythm zones, and $25,000 prize pool finals.",
    ctaLabel: "Get Competitor Pass",
    href: "https://www.start.gg",
    discountBadge: "REGISTRATION OPEN",
    accentClass: "from-amber-500/20 via-orange-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "penstudio-creator-tablet",
    contexts: ["news", "shop"],
    interestTag: "Creator Tech",
    brand: "PENSTUDIO PRO",
    headline: "16K Pressure Laminated Pen Display for Manga & Key Animation",
    description:
      "Etched anti-glare paper-feel glass, tilt recognition, and 6-month Clip Studio Paint EX bundle trusted by indie mangaka and illustrators.",
    ctaLabel: "See Artist Bundle",
    href: "https://www.wacom.com",
    promoCode: "MANGA15",
    discountBadge: "INCLUDES CSP EX",
    accentClass: "from-sky-500/20 via-indigo-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "kotovault-scale-figures",
    contexts: ["shop", "home"],
    interestTag: "Anime & Merch",
    brand: "OTAKU COLLECTOR VAULT",
    headline: "Authentic 1/7 Scale Statues, Nendoroids & Ichiban Kuji Imports",
    description:
      "Direct-from-Japan pre-orders with crush-proof collector packaging, holographic authenticity seals, and split monthly pre-order plans.",
    ctaLabel: "Browse Pre-Orders",
    href: "https://www.goodsmileus.com",
    promoCode: "FIGURE10",
    discountBadge: "AUTHENTIC JP IMPORT",
    accentClass: "from-rose-500/20 via-pink-500/10 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80",
  },
];

export function getCampaignsForContext(
  context: AdContextCategory,
  interestFilter?: AdInterestTag | "All"
): DynamicAdCampaign[] {
  const contextual = DYNAMIC_AD_CAMPAIGNS.filter((c) =>
    c.contexts.includes(context)
  );
  const pool = contextual.length > 0 ? contextual : DYNAMIC_AD_CAMPAIGNS;
  if (!interestFilter || interestFilter === "All") {
    return pool;
  }
  const filtered = pool.filter((c) => c.interestTag === interestFilter);
  return filtered.length > 0 ? filtered : pool;
}
