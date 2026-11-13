export const PILLOW_SIZES = [
  { id: '14x14', widthIn: 14, heightIn: 14, label: '14" × 14" (Compact Accent)', price: 24.99, sku: 'OCP-PIL-1414' },
  { id: '16x16', widthIn: 16, heightIn: 16, label: '16" × 16" (Standard As Shown)', price: 28.99, sku: 'OCP-PIL-1616' },
  { id: '18x18', widthIn: 18, heightIn: 18, label: '18" × 18" (Classic Sofa)', price: 32.99, sku: 'OCP-PIL-1818' },
  { id: '20x12', widthIn: 20, heightIn: 12, label: '20" × 12" (Accent Lumbar)', price: 31.99, sku: 'OCP-PIL-2012' },
  { id: '22x22', widthIn: 22, heightIn: 22, label: '22" × 22" (Oversized Lounge)', price: 39.99, sku: 'OCP-PIL-2222' },
  { id: '26x26', widthIn: 26, heightIn: 26, label: '26" × 26" (Giant Euro Floor)', price: 47.99, sku: 'OCP-PIL-2626' },
];

export const CUSTOM_SHAPE_SIZES = [
  { id: 'shape-14', widthIn: 14, heightIn: 14, label: '14" Longest Side (Mini Cutout)', price: 32.99, sku: 'OCP-SHP-14' },
  { id: 'shape-18', widthIn: 18, heightIn: 18, label: '18" Longest Side (Classic Cutout)', price: 38.99, sku: 'OCP-SHP-18' },
  { id: 'shape-24', widthIn: 24, heightIn: 24, label: '24" Longest Side (Large Hugger)', price: 49.99, sku: 'OCP-SHP-24' },
  { id: 'shape-30', widthIn: 30, heightIn: 30, label: '30" Longest Side (Giant Statement)', price: 64.99, sku: 'OCP-SHP-30' },
];

export const BLANKET_SIZES = [
  { id: '30x40', widthIn: 30, heightIn: 40, label: '30" × 40" (Lap & Pet Throw)', price: 34.99, sku: 'OCP-BLK-3040' },
  { id: '50x60', widthIn: 50, heightIn: 60, label: '50" × 60" (Standard Couch Throw)', price: 49.99, sku: 'OCP-BLK-5060' },
  { id: '60x80', widthIn: 60, heightIn: 80, label: '60" × 80" (Oversized Twin/Queen)', price: 64.99, sku: 'OCP-BLK-6080' },
];

export const DISPLAY_MODES = [
  { id: 'centered', name: 'Centered', badge: 'As Shown' },
  { id: 'stretched', name: 'Stretched', badge: 'Full Bleed' },
  { id: 'checkered', name: 'Checkered', badge: 'Fan Favorite' },
  { id: 'chaotic', name: 'Chaotic', badge: 'Party Mode' },
  { id: 'custom', name: 'Custom', badge: 'Interactive' },
];

export const FABRIC_BG_COLORS = [
  { name: 'Cozy White', hex: '#FFFFFF' },
  { name: 'Warm Cream', hex: '#FFF8E7' },
  { name: 'Soft Blush', hex: '#FFE4E9' },
  { name: 'Buttercup', hex: '#FFF3B0' },
  { name: 'Mint Foam', hex: '#E2FCEF' },
  { name: 'Sky Mist', hex: '#E0F2FE' },
  { name: 'Lavender', hex: '#F3E8FF' },
  { name: 'Charcoal', hex: '#22222B' },
];

export const AVAILABLE_PRINTS = [
  {
    id: 'french-fries',
    name: 'Golden French Fries',
    pngPath: '/prints/french-fries.png',
    fallbackPath: '/icons/french-fries.svg',
  },
  {
    id: 'diet-cola',
    name: 'Fizzy Diet Cola',
    pngPath: '/prints/diet-cola.png',
    fallbackPath: '/icons/printed-pillow.svg',
  },
  {
    id: 'choco-cookie',
    name: 'Chocolate Chip Cookie',
    pngPath: '/prints/choco-cookie.png',
    fallbackPath: '/icons/bear-rugs.svg',
  },
  {
    id: 'gummy-bears',
    name: 'Rainbow Gummy Bears',
    pngPath: '/prints/gummy-bears.png',
    fallbackPath: '/icons/squishies.svg',
  },
  {
    id: 'sushi-roll',
    name: 'Kawaii Sushi Roll',
    pngPath: '/prints/sushi-roll.png',
    fallbackPath: '/icons/sushi-pillow.svg',
  },
  {
    id: 'fried-egg',
    name: 'Sunny Fried Egg',
    pngPath: '/prints/fried-egg.png',
    fallbackPath: '/icons/fried-egg-unique-blanket.svg',
  },
];
