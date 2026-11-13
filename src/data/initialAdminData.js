export const DEFAULT_MASCOT_PITCHES = {
  'category-bubbles-menu': '🧭 Navigate with these buttons, or check out our featured items below!',
  'winter-collection': '🎄 Our Winter Collection is flying off the shelves! Click any photo to see it full-screen, or use code COZY15 for 15% off!',
  'most-popular': '🔥 These are our #1 customer favorites! The French Fries & Cookiemon pillows make unforgettable gifts!',
  'customizer-section': '✨ Try Checkered or Chaotic mode below! You can even upload your own pet photo or artwork!',
  'printed-pillows': '🍟 Every Printed Pillow can be bought in 1 click OR customized in 6 sizes & 5 fun layouts!',
  'oddly-cozy-pillows': '🥐 Our Giant 3D Plushies are overstuffed for maximum couch naps! Stack 2 or 3 for the ultimate setup!',
  'printed-blankets': '🥤 Our Printed Blankets come in 3 snuggle-ready sizes—try customizing one in Checkered mode!',
  'oddly-cozy-blankets': '🍳 Wrap yourself inside a giant Sunny-Side Up Egg or Chunky Cloud Knit blanket!',
  'matching-sets': '🎁 Best Value Alert! Matching Sets give you 2 Printed Pillows + 1 Cozy Blanket and save you $18!',
  rugs: '🍕 Step out of bed onto a giant Pepperoni Pizza, Donut, or Chocolate Chip Cookie rug!',
  toys: '🥟 Need desk stress relief? Our slow-rising squishies are super satisfying to squeeze!',
};

export const INITIAL_CMS_SETTINGS = {
  adminPin: '2026',
  announcementEnabled: true,
  announcementText: '🎄 Holiday Gift Guide Is Live! Free Tracked Shipping + Use Code COZY15 for 15% Off!',
  announcementBg: '#1E1E24',
  winterTitle: 'Winter & Holiday Collection',
  winterSubtitle: 'Limited-edition cozy bundles, chunky throws, and gift-ready pillows for everyone on your list.',
  popularTitle: 'Most Popular Favorites',
  popularSubtitle: 'Our 8 highest-rated pillows, plushies, and cozy room essentials.',
  defaultWeather: 'none',
  etransferEmail: 'pay@oddlycozypillows.com',
  // Puff Mascot Settings
  mascotEnabled: true,
  mascotPromoCode: 'COZY15',
  mascotPitches: DEFAULT_MASCOT_PITCHES,
  // Puff's Cloud Dash Arcade Settings
  gameIntroVideo: '/game_intro.mp4',
  gameRewardScore: 500,
  gameRewardSeconds: 45,
  gameRewardCode: 'SKYDASH20',
};

export const INITIAL_PROMO_CODES = [
  { id: 'promo-1', code: 'COZY15', discountType: 'percent', value: 15, active: true },
  { id: 'promo-2', code: 'FRIES5', discountType: 'fixed', value: 5, active: true },
  { id: 'promo-3', code: 'SKYDASH20', discountType: 'percent', value: 20, active: true },
];

export const INITIAL_HIGH_SCORES = [
  { id: 'hs-1', name: 'PUFF_PRO', score: 1240, survivalSec: 82, date: '2026-11-13' },
  { id: 'hs-2', name: 'COZY_KING', score: 890, survivalSec: 61, date: '2026-11-13' },
  { id: 'hs-3', name: 'FRIES_FAN', score: 640, survivalSec: 45, date: '2026-11-13' },
  { id: 'hs-4', name: 'NAP_CHAMP', score: 420, survivalSec: 31, date: '2026-11-13' },
  { id: 'hs-5', name: 'CLOUD_9', score: 260, survivalSec: 19, date: '2026-11-13' },
];

export const INITIAL_ORDERS = [
  {
    id: 'OCP-849201',
    createdAt: '2026-11-11 11:15 AM',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    shippingAddress: '142 Lakeshore Rd, St. Catharines, ON L2N 2T6',
    paymentMethod: 'etransfer',
    paymentStatus: 'Awaiting e-Transfer',
    orderStatus: 'Processing',
    trackingNumber: '',
    subtotal: 78.98,
    discount: 0,
    total: 78.98,
    items: [
      {
        id: 'item-1',
        name: 'Custom Pillow — Golden French Fries',
        sizeLabel: '18" × 18" (Classic Sofa)',
        modeLabel: 'Checkered Layout (Double-Sided)',
        price: 32.99,
        unitCost: 13.5,
        quantity: 1,
        fulfillmentRoute: 'Printify POD',
        image: '/icons/french-fries.svg',
      },
      {
        id: 'item-2',
        name: 'Deluxe Sesame Cheeseburger Plush Pillow',
        sizeLabel: 'Oversized 3D Stuffed Plush Pillow',
        modeLabel: 'Standard Edition',
        price: 45.99,
        unitCost: 18.0,
        quantity: 1,
        fulfillmentRoute: 'Plush Supplier',
        image: '/icons/sushi-pillow.svg',
      },
    ],
  },
  {
    id: 'OCP-849188',
    createdAt: '2026-11-11 09:40 AM',
    customerName: 'Marcus Vance',
    customerEmail: 'mvance@example.com',
    shippingAddress: '88 Queen St W, Toronto, ON M5H 2M9',
    paymentMethod: 'card',
    paymentStatus: 'Paid',
    orderStatus: 'In Production',
    trackingNumber: '',
    subtotal: 89.99,
    discount: 0,
    total: 89.99,
    items: [
      {
        id: 'item-3',
        name: 'Pink Frosted Donut Matching Set',
        sizeLabel: 'Includes 2 Printed Pillows (16"×16") + 1 Printed Blanket (50"×60")',
        modeLabel: 'Standard Edition',
        price: 89.99,
        unitCost: 38.0,
        quantity: 1,
        fulfillmentRoute: 'Printify Bundle',
        image: '/images/matching sets/donut-set.jpg',
      },
    ],
  },
];

export const INITIAL_CUSTOM_PROOFS = [
  {
    id: 'PRF-301',
    createdAt: '2026-11-11 10:05 AM',
    customerEmail: 'dogmom99@example.com',
    itemType: 'pillow',
    sizeLabel: '22" × 22" (Oversized Lounge)',
    price: 49.99,
    description:
      'Please cut out my French Bulldog Barnaby and repeat him in a checkered pattern with little croissants on a pastel pink background!',
    referenceImage: '/icons/printed-pillow.svg',
    mockupProofImage: '',
    status: 'Needs Mockup',
    operatorNotes: 'Customer uploaded clear photo. Ready for background removal.',
  },
];
