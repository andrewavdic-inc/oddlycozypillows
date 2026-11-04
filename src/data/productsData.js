import { getFolderImages, resolveCategoryImage } from '../utils/publicManifest';

function formatTitleFromFilename(fileUrl, defaultTitle) {
  if (!fileUrl) return defaultTitle;
  const base = fileUrl.split('/').pop().replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
  if (!base || base.length < 2) return defaultTitle;
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Fetch exact files from each folder in public/images/
const printedPillowFiles = getFolderImages('printed pillows');
const oddlyCozyPillowFiles = getFolderImages('oddly cozy pillows');
const printedBlanketFiles = getFolderImages('printed blankets');
const oddlyCozyBlanketFiles = getFolderImages('oddly cozy blankets');
const matchingSetFiles = getFolderImages('matching sets');
const rugFiles = getFolderImages('rugs');
const toyFiles = getFolderImages('toys');

export const PRODUCTS_DATA = [
  // ================= 1. PRINTED PILLOWS (public/images/printed pillows) =================
  {
    id: 'pp-french-fries',
    categoryId: 'printed-pillows',
    name: 'Classic French Fries Printed Pillow',
    subtitle: '16" × 16" Spun Polyester Square Throw Pillow',
    price: 28.99,
    defaultSizeId: '16x16',
    defaultMode: 'centered',
    printId: 'french-fries',
    image: resolveCategoryImage('printed pillows', ['fries', 'french', 'fry'], 0, '/images/printed pillows/french-fries-pillow.jpg'),
    fallbackImage: printedPillowFiles[0] || '/icons/french-fries.svg',
    badge: 'Bestseller • Featured',
    description:
      'Our signature crispy golden French Fries box printed on an ultra-soft 16"×16" pillow! Buy as shown with one click, or open our studio to customize sizes & patterns.',
    customizable: true,
    productType: 'pillow',
  },
  {
    id: 'pp-2',
    categoryId: 'printed-pillows',
    name: printedPillowFiles[1]
      ? `${formatTitleFromFilename(printedPillowFiles[1], 'Sprinkled Donut')} Pillow`
      : 'Sprinkled Donut Printed Pillow',
    subtitle: '16" × 16" Soft Microfiber Throw Pillow',
    price: 28.99,
    defaultSizeId: '16x16',
    defaultMode: 'centered',
    printId: 'donut',
    image: resolveCategoryImage('printed pillows', ['donut', 'doughnut'], 1, '/images/printed pillows/donut-pillow.jpg'),
    fallbackImage: printedPillowFiles[1] || printedPillowFiles[0] || '/icons/printed-pillow.svg',
    badge: 'Sweet Pick',
    description:
      'Vibrant, high-definition print on a plush 16"×16" throw pillow. Buy as shown or customize the layout and size in our interactive preview studio.',
    customizable: true,
    productType: 'pillow',
  },
  {
    id: 'pp-3',
    categoryId: 'printed-pillows',
    name: printedPillowFiles[2]
      ? `${formatTitleFromFilename(printedPillowFiles[2], 'Hot Pepperoni Pizza')} Pillow`
      : 'Hot Pepperoni Slice Printed Pillow',
    subtitle: '16" × 16" Custom Graphic Pillow',
    price: 28.99,
    defaultSizeId: '16x16',
    defaultMode: 'checkered',
    printId: 'pizza',
    image: resolveCategoryImage('printed pillows', ['pizza', 'slice', 'burger'], 2, '/images/printed pillows/pizza-pillow.jpg'),
    fallbackImage: printedPillowFiles[2] || printedPillowFiles[0] || '/icons/printed-pillow.svg',
    badge: 'Checkered Favorite',
    description:
      'Bold food-themed graphic printed on a cloud-soft pillow. Buy as shown with 1 click or test it in Stretched, Checkered, or Chaotic mode!',
    customizable: true,
    productType: 'pillow',
  },
  {
    id: 'pp-4',
    categoryId: 'printed-pillows',
    name: printedPillowFiles[3]
      ? `${formatTitleFromFilename(printedPillowFiles[3], 'Warm Chocolate Chip Cookie')} Pillow`
      : 'Warm Chocolate Chip Cookie Pillow',
    subtitle: '16" × 16" Signature Throw Pillow',
    price: 28.99,
    defaultSizeId: '16x16',
    defaultMode: 'chaotic',
    printId: 'cookies',
    image: resolveCategoryImage('printed pillows', ['cookie', 'strawberry', 'coke', 'gummy'], 3, '/images/printed pillows/cookies-pillow.jpg'),
    fallbackImage: printedPillowFiles[3] || printedPillowFiles[0] || '/icons/printed-pillow.svg',
    badge: 'Fan Favorite',
    description:
      'Fresh, vibrant graphic on a 16"×16" throw pillow. One-click buy as shown, or open the customizer to pick lumbar or giant floor sizes.',
    customizable: true,
    productType: 'pillow',
  },

  // ================= 2. ODDLY COZY PILLOWS (public/images/oddly cozy pillows) =================
  {
    id: 'ocp-1',
    categoryId: 'oddly-cozy-pillows',
    name: oddlyCozyPillowFiles[0]
      ? formatTitleFromFilename(oddlyCozyPillowFiles[0], 'Deluxe Sesame Cheeseburger Plush Pillow')
      : 'Deluxe Sesame Cheeseburger Plush Pillow',
    subtitle: 'Oversized 3D Stuffed Plush Pillow',
    price: 44.99,
    image: resolveCategoryImage('oddly cozy pillows', ['burger', 'cheese'], 0, '/images/oddly cozy pillows/cheeseburger-plush.jpg'),
    fallbackImage: oddlyCozyPillowFiles[0] || '/icons/sushi-pillow.svg',
    badge: 'Couch Icon',
    description:
      'Ultra-chubby 3D sculpted plush pillow built for stacking on your sofa, bed, or reading nook.',
    customizable: false,
  },
  {
    id: 'ocp-2',
    categoryId: 'oddly-cozy-pillows',
    name: oddlyCozyPillowFiles[1]
      ? formatTitleFromFilename(oddlyCozyPillowFiles[1], 'Jumbo Salmon Nigiri Sushi Plushie')
      : 'Jumbo Salmon Nigiri Sushi Plushie',
    subtitle: 'Giant Huggable 3D Plush Pillow',
    price: 48.99,
    image: resolveCategoryImage('oddly cozy pillows', ['sushi', 'nigiri', 'shrimp'], 1, '/images/oddly cozy pillows/sushi-plush.jpg'),
    fallbackImage: oddlyCozyPillowFiles[1] || oddlyCozyPillowFiles[0] || '/icons/sushi-pillow.svg',
    badge: 'Giant Plush',
    description:
      'Marshmallow-soft oversized 3D plushie crafted with ultra-squishy stuffing for full-body hugs.',
    customizable: false,
  },
  {
    id: 'ocp-3',
    categoryId: 'oddly-cozy-pillows',
    name: oddlyCozyPillowFiles[2]
      ? formatTitleFromFilename(oddlyCozyPillowFiles[2], 'Giant Buttery Croissant Body Pillow')
      : 'Giant Buttery Croissant Body Pillow',
    subtitle: 'Ergonomic 3D Pastry Lounger',
    price: 52.99,
    image: resolveCategoryImage('oddly cozy pillows', ['croissant', 'bread', 'pastry', 'fries'], 2, '/images/oddly cozy pillows/croissant-plush.jpg'),
    fallbackImage: oddlyCozyPillowFiles[2] || oddlyCozyPillowFiles[0] || '/icons/pillow-squished.svg',
    badge: 'Nap Champion',
    description:
      'Sculpted to cradle your neck, back, or knees while gaming, watching movies, or lounging.',
    customizable: false,
  },
  {
    id: 'ocp-4',
    categoryId: 'oddly-cozy-pillows',
    name: oddlyCozyPillowFiles[3]
      ? formatTitleFromFilename(oddlyCozyPillowFiles[3], 'Oversized Boba Tea Plush Pillow')
      : 'Oversized Boba Tea Plush Pillow',
    subtitle: 'Squishy 3D Novelty Cushion',
    price: 42.99,
    image: resolveCategoryImage('oddly cozy pillows', ['boba', 'tea', 'donut', 'cookie', 'pizza'], 3, '/images/oddly cozy pillows/boba-plush.jpg'),
    fallbackImage: oddlyCozyPillowFiles[3] || oddlyCozyPillowFiles[0] || '/icons/pillows-sparkle.svg',
    badge: 'Trending',
    description:
      'Uniquely shaped 3D plush cushion with embroidered details and cloud-like stuffing.',
    customizable: false,
  },

  // ================= 3. PRINTED BLANKETS (public/images/printed blankets) =================
  {
    id: 'pb-diet-cola',
    categoryId: 'printed-blankets',
    name: 'Fizzy Diet Cola & Zero Pop Printed Blanket',
    subtitle: '50" × 60" Velveteen Plush Throw Blanket',
    price: 49.99,
    defaultSizeId: '50x60',
    defaultMode: 'checkered',
    printId: 'diet-cola',
    image: resolveCategoryImage('printed blankets', ['diet', 'coke', 'cola', 'zero'], 0, '/images/printed blankets/diet-coke-blanket.jpg'),
    fallbackImage: printedBlanketFiles[0] || '/icons/printed blanket.svg',
    badge: 'Viral Throw',
    description:
      'Crisp silver-and-red soda cans arranged on an ultra-plush throw blanket. Buy as shown or customize the size and pattern layout!',
    customizable: true,
    productType: 'blanket',
  },
  {
    id: 'pb-gummy-bears',
    categoryId: 'printed-blankets',
    name: 'Checkered Gummy Bears Printed Blanket',
    subtitle: '50" × 60" Cozy Fleece Blanket',
    price: 49.99,
    defaultSizeId: '50x60',
    defaultMode: 'checkered',
    printId: 'gummy-bears',
    image: resolveCategoryImage('printed blankets', ['gummy', 'bear'], 1, '/images/printed blankets/gummy-bears-blanket.jpg'),
    fallbackImage: printedBlanketFiles[1] || '/icons/printed blanket.svg',
    badge: 'Color Pop',
    description:
      'Vibrant fruity gummy bears in a playful grid pattern. One-click buy or open the customizer to switch to Chaotic or Stretched mode!',
    customizable: true,
    productType: 'blanket',
  },
  {
    id: 'pb-flamin-hot',
    categoryId: 'printed-blankets',
    name: 'Flamin’ Hot Spicy Crunch Printed Blanket',
    subtitle: '50" × 60" Sherpa & Micro-Fleece Throw',
    price: 52.99,
    defaultSizeId: '50x60',
    defaultMode: 'chaotic',
    printId: 'hot-crunch',
    image: resolveCategoryImage('printed blankets', ['flamin', 'cheeto', 'hot'], 2, '/images/printed blankets/flamin-hot-blanket.jpg'),
    fallbackImage: printedBlanketFiles[2] || '/icons/printed blanket.svg',
    badge: 'Extra Spicy',
    description:
      'Turn up the heat on movie night! Buy this fiery snack blanket as shown or customize it across 30"×40", 50"×60", or 60"×80" Queen.',
    customizable: true,
    productType: 'blanket',
  },
  {
    id: 'pb-4',
    categoryId: 'printed-blankets',
    name: printedBlanketFiles[3]
      ? formatTitleFromFilename(printedBlanketFiles[3], 'Reese’s Puffs & Sweet Crunch Printed Blanket')
      : 'Reese’s Puffs & Sweet Crunch Printed Blanket',
    subtitle: '50" × 60" Custom Plush Throw',
    price: 49.99,
    defaultSizeId: '50x60',
    defaultMode: 'centered',
    printId: 'cookies',
    image: resolveCategoryImage('printed blankets', ['reese', 'puff', 'cookie', 'cereal'], 3, '/images/printed blankets/reeses-puffs-blanket.jpg'),
    fallbackImage: printedBlanketFiles[3] || printedBlanketFiles[0] || '/icons/printed blanket.svg',
    badge: 'Sweet & Cozy',
    description:
      'Iconic sweet snack graphics printed edge-to-edge on feather-soft fleece. Buy in 1 click or customize!',
    customizable: true,
    productType: 'blanket',
  },

  // ================= 4. ODDLY COZY BLANKETS (4 Products from public/images/oddly cozy blankets) =================
  {
    id: 'ocb-1',
    categoryId: 'oddly-cozy-blankets',
    name: 'Sunny-Side Up Fried Egg Blanket',
    subtitle: 'Wavy Organic Egg-White Cutout with 3D Yolk Center',
    price: 54.99,
    image: resolveCategoryImage('oddly cozy blankets', ['egg'], 0, '/images/oddly cozy blankets/egg-blanket.jpg'),
    fallbackImage: '/images/oddly cozy blankets/egg-blanket.jpg',
    badge: 'Signature Odd Blanket',
    description:
      'Contoured like a real skillet fried egg with a plush golden yolk right in the center. Breakfast in bed has never looked this good.',
    customizable: false,
  },
  {
    id: 'ocb-2',
    categoryId: 'oddly-cozy-blankets',
    name: 'Giant Arm-Spun Fat Knit Cloud Blanket',
    subtitle: 'Ultra-Thick Chenille Chunky Knit Throw',
    price: 64.99,
    image: resolveCategoryImage('oddly cozy blankets', ['fat', 'knit', 'chunky'], 1, '/images/oddly cozy blankets/fat-knit-blanket.jpg'),
    fallbackImage: '/images/oddly cozy blankets/fat-knit-blanket.jpg',
    badge: 'Luxury Heavyweight',
    description:
      'Thick, cloud-like chenille yarn braided into an oversized sensory blanket that feels like a warm hug.',
    customizable: false,
  },
  {
    id: 'ocb-3',
    categoryId: 'oddly-cozy-blankets',
    name: oddlyCozyBlanketFiles[2]
      ? formatTitleFromFilename(oddlyCozyBlanketFiles[2], 'Toasted Tortilla Burrito Novelty Blanket')
      : 'Toasted Tortilla Burrito Novelty Blanket',
    subtitle: 'Uniquely Shaped Sculpted Cozy Throw',
    price: 48.99,
    image: oddlyCozyBlanketFiles[2] || resolveCategoryImage('oddly cozy blankets', ['tortilla', 'burrito', 'pizza', 'waffle', 'leaf'], 2, '/images/oddly cozy blankets/egg-blanket.jpg'),
    fallbackImage: oddlyCozyBlanketFiles[0] || '/images/oddly cozy blankets/egg-blanket.jpg',
    badge: 'Novelty Favorite',
    description:
      'Wrap yourself up in a uniquely contoured novelty throw blanket crafted from double-sided plush flannel.',
    customizable: false,
  },
  {
    id: 'ocb-4',
    categoryId: 'oddly-cozy-blankets',
    name: oddlyCozyBlanketFiles[3]
      ? formatTitleFromFilename(oddlyCozyBlanketFiles[3], 'Golden Belgian Waffle Sculpted Blanket')
      : 'Golden Belgian Waffle Sculpted Blanket',
    subtitle: 'Oversized Textured Novelty Blanket',
    price: 52.99,
    image: oddlyCozyBlanketFiles[3] || resolveCategoryImage('oddly cozy blankets', ['waffle', 'pancake', 'cookie', 'bread', 'toast'], 3, '/images/oddly cozy blankets/fat-knit-blanket.jpg'),
    fallbackImage: oddlyCozyBlanketFiles[1] || '/images/oddly cozy blankets/fat-knit-blanket.jpg',
    badge: 'Cozy Collector',
    description:
      'Oddly shaped, ridiculously soft, and guaranteed to be the conversation starter of your living room.',
    customizable: false,
  },

  // ================= 5. MATCHING SETS (public/images/matching sets) =================
  {
    id: 'ms-cookies',
    categoryId: 'matching-sets',
    name: 'Cookies & Cream Lovers Matching Set',
    subtitle: 'Includes 2 Printed Pillows (16"×16") + 1 Printed Blanket (50"×60")',
    price: 89.99,
    image: resolveCategoryImage('matching sets', ['cookie'], 0, '/images/matching sets/cookies-set.jpg'),
    fallbackImage: '/images/matching sets/cookies-set.jpg',
    badge: 'Save $18 Bundle',
    description:
      'Complete chocolate chip & cream cookie lounge bundle! Comes with two 16"×16" throw pillows and a matching 50"×60" plush blanket.',
    customizable: false,
  },
  {
    id: 'ms-donut',
    categoryId: 'matching-sets',
    name: 'Pink Frosted Donut Matching Set',
    subtitle: 'Includes 2 Printed Pillows (16"×16") + 1 Printed Blanket (50"×60")',
    price: 89.99,
    image: resolveCategoryImage('matching sets', ['donut'], 1, '/images/matching sets/donut-set.jpg'),
    fallbackImage: '/images/matching sets/donut-set.jpg',
    badge: 'Bestseller Set',
    description:
      'Brighten any bedroom or dorm with 2 sprinkled donut pillows paired with a matching full-size donut throw blanket.',
    customizable: false,
  },
  {
    id: 'ms-pizza',
    categoryId: 'matching-sets',
    name: 'Supreme Pizza Party Matching Set',
    subtitle: 'Includes 2 Printed Pillows (16"×16") + 1 Printed Blanket (50"×60")',
    price: 89.99,
    image: resolveCategoryImage('matching sets', ['pizza'], 2, '/images/matching sets/pizza-set.jpg'),
    fallbackImage: '/images/matching sets/pizza-set.jpg',
    badge: 'Movie Night Bundle',
    description:
      'The ultimate Friday night couch combo: two pepperoni slice pillows and a matching pizza party fleece blanket.',
    customizable: false,
  },
  {
    id: 'ms-strawberry',
    categoryId: 'matching-sets',
    name: 'Sweet Strawberry Patch Matching Set',
    subtitle: 'Includes 2 Printed Pillows (16"×16") + 1 Printed Blanket (50"×60")',
    price: 89.99,
    image: resolveCategoryImage('matching sets', ['strawberry'], 3, '/images/matching sets/strawberry-set.jpg'),
    fallbackImage: matchingSetFiles[3] || '/images/matching sets/strawberry-set.jpg',
    badge: 'Cottagecore Cozy',
    description:
      'Juicy red strawberries across two plush throw pillows and a matching cozy blanket.',
    customizable: false,
  },

  // ================= 6. COZY RUGS (4 Products from public/images/rugs) =================
  {
    id: 'rug-pizza',
    categoryId: 'rugs',
    name: 'Deep-Dish Pepperoni Pizza Round Rug',
    subtitle: '36" Round Chenille Non-Slip Floor Mat',
    price: 58.99,
    image: resolveCategoryImage('rugs', ['pizza'], 0, '/images/rugs/pizza-rug.jpg'),
    fallbackImage: rugFiles[0] || '/images/rugs/pizza-rug.jpg',
    badge: 'Bestseller Rug',
    description:
      'Hot and fresh for your bedroom or game room floor! Durable woven face with non-slip backing.',
    customizable: false,
  },
  {
    id: 'rug-donut',
    categoryId: 'rugs',
    name: 'Pink Sprinkles Frosted Donut Round Rug',
    subtitle: '36" Round Soft Plush Accent Rug',
    price: 58.99,
    image: resolveCategoryImage('rugs', ['donut', 'doughnut'], 1, '/images/rugs/donut-rug.jpg'),
    fallbackImage: rugFiles[1] || '/images/rugs/donut-rug.jpg',
    badge: 'Sweet Step',
    description:
      'Step out of bed onto a soft frosted donut! Vibrant edge-to-edge dye-sublimation floor mat.',
    customizable: false,
  },
  {
    id: 'rug-choco-cookie',
    categoryId: 'rugs',
    name: 'Giant Chocolate Chip Cookie Round Rug',
    subtitle: '36" Round Cozy Room Rug',
    price: 58.99,
    image: resolveCategoryImage('rugs', ['choco', 'chip', 'cookies-rug', 'cookie-rug'], 2, rugFiles[2] || '/images/rugs/cookies-rug.jpg'),
    fallbackImage: rugFiles[2] || rugFiles[0] || '/images/rugs/pizza-rug.jpg',
    badge: 'Warm & Toasty',
    description:
      'Looks good enough to eat! Golden-brown chocolate chip cookie rug with hemmed edges and non-slip backing.',
    customizable: false,
  },
  {
    id: 'rug-oreo-cookie',
    categoryId: 'rugs',
    name: 'Double-Stuff Sandwich Cookie Round Rug',
    subtitle: '36" Round Monochrome Statement Rug',
    price: 58.99,
    image: resolveCategoryImage('rugs', ['oreo', 'sandwich', 'cream', 'black'], 3, rugFiles[3] || '/images/rugs/oreo-cookie-rug.jpg'),
    fallbackImage: rugFiles[3] || rugFiles[1] || '/images/rugs/donut-rug.jpg',
    badge: 'Modern Chic',
    description:
      'Bold dark cocoa wafer pattern that ties together modern, gaming, or monochrome rooms effortlessly.',
    customizable: false,
  },

  // ================= 7. TOYS & SQUISHIES (public/images/toys) =================
  ...(toyFiles.length > 0
    ? toyFiles.map((fileUrl, index) => ({
        id: `toy-${index + 1}`,
        categoryId: 'toys',
        name: formatTitleFromFilename(fileUrl, `Slow-Rise Cozy Squishy #${index + 1}`),
        subtitle: 'Super-Soft Slow-Rising Sensory Squishy Toy',
        price: 16.99,
        image: fileUrl,
        fallbackImage: fileUrl,
        badge: index === 0 ? 'Ultra Squish' : 'Fan Favorite',
        description:
          'Squeeze it flat and watch it slowly rise right back! Ultra-satisfying tactile stress relief for your desk or couch.',
        customizable: false,
      }))
    : [
        {
          id: 'toy-1',
          categoryId: 'toys',
          name: 'Slow-Rise Jumbo French Fries Squishy',
          subtitle: 'Scented PU Foam Stress-Relief Desk Toy',
          price: 16.99,
          image: resolveCategoryImage('toys', ['fries', 'fry'], 0, '/images/toys/fries-squishy.jpg'),
          fallbackImage: '/icons/squishies.svg',
          badge: 'Ultra Squish',
          description: 'Squeeze it flat and watch it slowly rise back into a full carton of golden fries!',
          customizable: false,
        },
        {
          id: 'toy-2',
          categoryId: 'toys',
          name: 'Kawaii Cheeseburger Mochi Squeeze Toy',
          subtitle: 'Super-Soft Sensory Fidget Burger',
          price: 14.99,
          image: resolveCategoryImage('toys', ['burger', 'donut', 'squish'], 1, '/images/toys/burger-squishy.jpg'),
          fallbackImage: '/icons/squishies.svg',
          badge: 'Desk Buddy',
          description: 'Pocket-sized squishy toy for satisfying tactile stress relief during work or study sessions.',
          customizable: false,
        },
      ]),
];
