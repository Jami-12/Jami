const unsplash = (id: string, width = 1400): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const VISUALS = {
  hero: unsplash("photo-1505740420928-5e560c06d30e", 1800),
  heroDetail: unsplash("photo-1546435770-a3e426bf472b", 1200),
  audio: unsplash("photo-1484704849700-f032a568e944", 1200),
  speaker: unsplash("photo-1608043152269-423dbba4e7e1", 1200),
  watch: unsplash("photo-1523275335684-37898b6baf30", 1200),
  lighting: unsplash("photo-1507473885765-e6ed057f782c", 1200),
  lamp: unsplash("photo-1540932239986-30128078f3c5", 1200),
  workspace: unsplash("photo-1497366216548-37526070297c", 1200),
  desk: unsplash("photo-1517336714731-489689fd1ca8", 1200),
  home: unsplash("photo-1616486338812-3dadae4b4ace", 1200),
  vase: unsplash("photo-1567016432779-094069958ea5", 1200),
  accessories: unsplash("photo-1547949003-9792a18a2601", 1200),
  bag: unsplash("photo-1553062407-98eeb64c6a62", 1200),
  craft: unsplash("photo-1523381210434-271e8be1f52b", 1600),
  studio: unsplash("photo-1526170375885-4d8ecf77b99f", 1600),
  journal: unsplash("photo-1497366754035-f200968a6e72", 1600),
  journalTwo: unsplash("photo-1618221195710-dd6b41faaea6", 1200),
  journalThree: unsplash("photo-1513694203232-719a280e022f", 1200),
  texture: unsplash("photo-1598300042247-d088f8ab3a91", 1200),
} as const;

export const CATEGORY_VISUALS: Record<string, { image: string; blurb: string }> = {
  audio: {
    image: VISUALS.audio,
    blurb: "Spatial sound, sculpted in aluminium and wool.",
  },
  wearables: {
    image: VISUALS.watch,
    blurb: "Quiet technology that keeps time with you.",
  },
  lighting: {
    image: VISUALS.lighting,
    blurb: "Warm, dimmable light for deep work and slow evenings.",
  },
  workspace: {
    image: VISUALS.workspace,
    blurb: "Desks, tools and objects that disappear into flow.",
  },
  home: {
    image: VISUALS.home,
    blurb: "Small rituals, thoughtfully made.",
  },
  accessories: {
    image: VISUALS.accessories,
    blurb: "Carry, charge and travel with intention.",
  },
};

export const TESTIMONIALS = [
  {
    quote:
      "The alternate photo on every card is such a small thing, but it is the reason I finally bought the overshirt. I knew exactly how it hung.",
    name: "Nadia Rahman",
    role: "Product designer, Dhaka",
  },
  {
    quote:
      "The knit arrived softer than it looked online, and the colour was true. This store has become my default for pieces I keep for years.",
    name: "Imran Chowdhury",
    role: "Architect, Chattogram",
  },
  {
    quote:
      "Ordered on Thursday, wearing it on Sunday. The packaging was beautiful and the fit notes were honest. Rare combination.",
    name: "Sara Ahmed",
    role: "Founder, Studio North",
  },
] as const;

export const JOURNAL_POSTS = [
  {
    title: "The quiet geometry of a good desk",
    excerpt:
      "Why the objects you touch every day deserve the same care as the ones you display.",
    image: VISUALS.journal,
    category: "Workspace",
    readTime: "6 min read",
  },
  {
    title: "Light, measured in evenings",
    excerpt:
      "A study of warm colour temperature and the rituals that help a room slow down.",
    image: VISUALS.journalThree,
    category: "Lighting",
    readTime: "4 min read",
  },
  {
    title: "Materials that age well",
    excerpt:
      "Anodised aluminium, vegetable-tanned leather and the beauty of visible wear.",
    image: VISUALS.journalTwo,
    category: "Craft",
    readTime: "7 min read",
  },
] as const;

export const TRUST_POINTS = [
  {
    title: "Two views per piece",
    description: "See it on the hanger and close up before it ships.",
    icon: "rotate",
  },
  {
    title: "Tracked delivery",
    description: "Every order is tracked from our atelier to your door.",
    icon: "truck",
  },
  {
    title: "30-day returns",
    description: "Changed your mind? Return unworn pieces within 30 days.",
    icon: "refresh",
  },
  {
    title: "Secure checkout",
    description: "bKash, Nagad, card and cash on delivery — protected end to end.",
    icon: "shield",
  },
] as const;
