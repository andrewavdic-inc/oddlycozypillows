/* global __PUBLIC_FILES__ */
const ALL_FILES = typeof __PUBLIC_FILES__ !== 'undefined' ? __PUBLIC_FILES__ : [];

/**
 * Returns all image URLs inside a specific public subfolder
 */
export function getFolderImages(folderName) {
  const target = folderName.toLowerCase().trim();
  return ALL_FILES.filter((fileUrl) => {
    const lower = fileUrl.toLowerCase();
    return (
      lower.includes(`/images/${target}/`) ||
      lower.includes(`/image/${target}/`) ||
      lower.startsWith(`/${target}/`)
    );
  }).sort();
}

/**
 * Finds the best matching image inside a category folder by keyword(s), or falls back by index
 */
export function resolveCategoryImage(folderName, keywords = [], fallbackIndex = 0, explicitFallback = '') {
  const folderFiles = getFolderImages(folderName);
  if (folderFiles.length > 0) {
    for (const kw of keywords) {
      const match = folderFiles.find((f) => f.toLowerCase().includes(kw.toLowerCase()));
      if (match) return match;
    }
    return folderFiles[fallbackIndex % folderFiles.length];
  }
  return explicitFallback;
}

/**
 * Resolves the transparent PNG category button images (with automatic .png / .jpg fallback)
 */
export function resolveButtonImage(baseName, fallbackUrl = '') {
  const cleanBase = baseName.toLowerCase().replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const found = ALL_FILES.find((f) => {
    const lower = f.toLowerCase();
    return (
      lower.includes(`${cleanBase}.png`) ||
      lower.includes(`${cleanBase}.webp`) ||
      lower.includes(`${cleanBase}.jpg`) ||
      lower.includes(`${cleanBase}.jpeg`)
    );
  });
  return found || `/${cleanBase}.png` || fallbackUrl;
}

/**
 * Discovers and numerically sorts all Wakeup01.png - Wakeup49.png frames in public/
 */
export function getWakeupFrames() {
  const discovered = ALL_FILES.filter((f) => /wakeup\s*\d+\.(png|webp|jpg)$/i.test(f));

  if (discovered.length > 0) {
    return [...discovered].sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)\.(png|webp|jpg)$/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/(\d+)\.(png|webp|jpg)$/i)?.[1] || '0', 10);
      return numA - numB;
    });
  }

  // Fallback array for Wakeup01.png - Wakeup46.png inside public/wake up PNGs/
  return Array.from({ length: 46 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `/wake up PNGs/Wakeup${num}.png`;
  });
}

/**
 * Finds the hero room banner image in public/ or public/images/
 */
export function resolveBannerImage() {
  const bannerKeywords = ['banner', 'hero', 'room', 'header', 'couch'];
  const nonCategoryFiles = ALL_FILES.filter(
    (f) =>
      !f.toLowerCase().startsWith('/icons/') &&
      !f.toLowerCase().includes('/logo') &&
      !f.toLowerCase().includes('_button') &&
      !f.toLowerCase().includes('wakeup') &&
      /\.(jpg|jpeg|png|webp|avif)$/i.test(f)
  );

  for (const kw of bannerKeywords) {
    const found = nonCategoryFiles.find((f) => f.toLowerCase().includes(kw));
    if (found) return found;
  }
  return '/website-banner.jpg';
}

/**
 * Resolves your 12 Logo Variants
 */
export function resolveLogoVariant({
  theme = 'color',
  blink = false,
  withUrl = false,
} = {}) {
  const logoFiles = ALL_FILES.filter((f) => {
    const l = f.toLowerCase();
    return (
      (l.includes('logo') || l.includes('mascot')) &&
      !l.startsWith('/icons/') &&
      !l.includes('/images/')
    );
  });

  if (logoFiles.length > 0) {
    const scored = logoFiles.map((file) => {
      const name = file.toLowerCase();
      let score = 0;

      if (theme === 'color' && (name.includes('color') || name.includes('full'))) score += 5;
      if (theme === 'black' && (name.includes('black') || name.includes('blk') || name.includes('dark') || name.includes('bw'))) score += 5;
      if (theme === 'white' && (name.includes('white') || name.includes('wht') || name.includes('light'))) score += 5;

      const isBlinkFile = name.includes('blink') || name.includes('closed') || name.includes('sleep') || name.includes('wink');
      if (blink === isBlinkFile) score += 4;

      const isUrlFile = name.includes('url') || name.includes('web') || name.includes('.com') || name.includes('site');
      if (withUrl === isUrlFile) score += 3;

      return { file, score };
    });

    scored.sort((a, b) => b.score - a.score);
    if (scored[0] && scored[0].score > 0) {
      return scored[0].file;
    }
  }

  const prefix =
    theme === 'black'
      ? '/logo-black'
      : theme === 'white'
      ? '/logo-white'
      : '/logo-full-color';
  const blinkSuffix = blink ? '-blink' : '';
  const urlSuffix = withUrl ? '-url' : '';
  return `${prefix}${blinkSuffix}${urlSuffix}.svg`;
}

/**
 * Returns all transparent PNG prints in public/prints/
 */
export function getPublicPrintFiles() {
  return ALL_FILES.filter((f) => f.toLowerCase().includes('/prints/'));
}
