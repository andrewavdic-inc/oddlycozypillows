import { getPublicPrintFiles } from '../utils/publicManifest';

export const PILLOW_SIZES = [
  { id: '14x14', label: '14" × 14" (Compact Square)', widthRatio: 1, heightRatio: 1, price: 24.99, sku: 'OCP-PIL-1414' },
  { id: '16x16', label: '16" × 16" (Standard As Shown)', widthRatio: 1, heightRatio: 1, price: 28.99, sku: 'OCP-PIL-1616', isDefault: true },
  { id: '18x18', label: '18" × 18" (Classic Sofa)', widthRatio: 1, heightRatio: 1, price: 32.99, sku: 'OCP-PIL-1818' },
  { id: '20x12', label: '20" × 12" (Accent Lumbar)', widthRatio: 1.45, heightRatio: 0.9, price: 31.99, sku: 'OCP-PIL-2012' },
  { id: '22x22', label: '22" × 22" (Oversized Lounge)', widthRatio: 1.08, heightRatio: 1.08, price: 39.99, sku: 'OCP-PIL-2222' },
  { id: '26x26', label: '26" × 26" (Giant Euro Floor)', widthRatio: 1.15, heightRatio: 1.15, price: 47.99, sku: 'OCP-PIL-2626' },
];

export const BLANKET_SIZES = [
  { id: '30x40', label: '30" × 40" (Lap / Pet / Crib)', widthRatio: 0.9, heightRatio: 1.15, price: 36.99, sku: 'OCP-BLK-3040' },
  { id: '50x60', label: '50" × 60" (Standard Cozy Throw)', widthRatio: 1, heightRatio: 1.2, price: 49.99, sku: 'OCP-BLK-5060', isDefault: true },
  { id: '60x80', label: '60" × 80" (Oversized Queen Bed)', widthRatio: 1.05, heightRatio: 1.35, price: 68.99, sku: 'OCP-BLK-6080' },
];

export const DISPLAY_MODES = [
  {
    id: 'centered',
    name: 'Centered',
    badge: 'As Shown',
    description: 'Single crisp graphic centered cleanly on the fabric.',
  },
  {
    id: 'stretched',
    name: 'Stretched',
    badge: 'Full Bleed',
    description: 'Edge-to-edge oversized print filling the entire surface.',
  },
  {
    id: 'checkered',
    name: 'Checkered',
    badge: 'Fan Favorite',
    description: 'Alternating all-over grid pattern across the entire piece.',
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    badge: 'Party Mode',
    description: 'Randomly rotated, multi-scale scattered collage all over!',
  },
  {
    id: 'custom',
    name: 'Custom',
    badge: 'Interactive',
    description: 'Drag on the preview canvas & dial in your exact scale and grid count.',
  },
];

export const FABRIC_BG_COLORS = [
  { name: 'Pure Cloud White', hex: '#FFFFFF' },
  { name: 'Warm Buttercream', hex: '#FFF8E7' },
  { name: 'Cozy Red', hex: '#FF595E' },
  { name: 'Sunny Yolk', hex: '#FFCA3A' },
  { name: 'Sky Blue', hex: '#BCE7FD' },
  { name: 'Mint Pistachio', hex: '#C7F9CC' },
  { name: 'Lavender Mist', hex: '#E0C3FC' },
  { name: 'Midnight Soot', hex: '#22222B' },
];

const DEFAULT_PRINTS = [
  {
    id: 'french-fries',
    name: 'Golden French Fries',
    pngPath: '/prints/french-fries.png',
    fallbackPath: '/icons/french-fries.svg',
    emoji: '🍟',
  },
  {
    id: 'donut',
    name: 'Pink Sprinkled Donut',
    pngPath: '/prints/donut.png',
    fallbackPath: '/icons/pillows-sparkle.svg',
    emoji: '🍩',
  },
  {
    id: 'pizza',
    name: 'Pepperoni Pizza Slice',
    pngPath: '/prints/pizza.png',
    fallbackPath: '/icons/printed-pillow.svg',
    emoji: '🍕',
  },
  {
    id: 'cookies',
    name: 'Chocolate Chip Cookies',
    pngPath: '/prints/cookies.png',
    fallbackPath: '/icons/rug.svg',
    emoji: '🍪',
  },
  {
    id: 'gummy-bears',
    name: 'Rainbow Gummy Bears',
    pngPath: '/prints/gummy-bears.png',
    fallbackPath: '/icons/squishies.svg',
    emoji: '🧸',
  },
  {
    id: 'diet-cola',
    name: 'Fizzy Diet Pop Can',
    pngPath: '/prints/diet-coke.png',
    fallbackPath: '/icons/printed blanket.svg',
    emoji: '🥤',
  },
  {
    id: 'hot-crunch',
    name: 'Flamin’ Hot Crunch',
    pngPath: '/prints/flamin-hot.png',
    fallbackPath: '/icons/french-fries.svg',
    emoji: '🌶️',
  },
  {
    id: 'sushi',
    name: 'Kawaii Nigiri Sushi',
    pngPath: '/prints/sushi.png',
    fallbackPath: '/icons/sushi-pillow.svg',
    emoji: '🍣',
  },
];

// Automatically merge any PNGs found in public/prints/ with defaults
const discoveredPrints = getPublicPrintFiles();
export const AVAILABLE_PRINTS =
  discoveredPrints.length > 0
    ? discoveredPrints.map((fileUrl, idx) => {
        const rawName = fileUrl.split('/').pop().replace(/\.(png|webp|jpg|svg)$/i, '');
        const prettyName = rawName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          id: rawName.toLowerCase(),
          name: prettyName,
          pngPath: fileUrl,
          fallbackPath: DEFAULT_PRINTS[idx % DEFAULT_PRINTS.length].fallbackPath,
          emoji: DEFAULT_PRINTS[idx % DEFAULT_PRINTS.length].emoji,
        };
      })
    : DEFAULT_PRINTS;
    