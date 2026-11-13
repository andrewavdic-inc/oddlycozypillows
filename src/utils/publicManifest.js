/* global __PUBLIC_FILES__ */
const ALL_FILES = typeof __PUBLIC_FILES__ !== 'undefined' ? __PUBLIC_FILES__ : [];

/**
 * Converts any local public image URL into its lightweight /thumbs/*.webp version if available
 */
export function getThumbnailUrl(originalUrl) {
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;
  if (
    originalUrl.startsWith('data:') ||
    originalUrl.startsWith('http') ||
    originalUrl.endsWith('.svg') ||
    originalUrl.startsWith('/thumbs/')
  ) {
    return originalUrl;
  }

  const withoutExt = originalUrl.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
  const expectedThumb = `/thumbs${withoutExt}.webp`.toLowerCase();

  const match = ALL_FILES.find((f) => f.toLowerCase() === expectedThumb);
  return match || originalUrl;
}

/**
 * Returns all audio files (.mp3, .wav, .ogg, .m4a) discovered in public/ and public/sounds/
 */
export function getPublicSoundFiles() {
  const discovered = ALL_FILES.filter((f) => /\.(mp3|wav|ogg|m4a)$/i.test(f));
  const defaults = [
    '/sounds/bm.mp3',
    '/sounds/powerup.mp3',
    '/sounds/bonk.mp3',
    '/sounds/moonbeam.mp3',
    '/sounds/pop.mp3',
  ];
  const merged = new Set([...discovered, ...defaults]);
  return Array.from(merged);
}

/**
 * Resolves the game intro MP4 video from public/ automatically
 */
export function resolveIntroVideo() {
  const videoFiles = ALL_FILES.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  if (videoFiles.length > 0) {
    const preferred = videoFiles.find((f) =>
      /(game_intro|intro|video_1|puff|game|gemini)/i.test(f)
    );
    return preferred || videoFiles[0];
  }
  return '/game_intro.mp4';
}

/**
 * Resolves Star1.png - Star6.png for Puff's Cloud Dash health meter
 * Star1 = 5/5 Full Health ... Star6 = 0/5 Empty Star
 */
export function getStarHealthImages() {
  return [1, 2, 3, 4, 5, 6].map((num) => {
    const target = `star${num}.png`;
    const found = ALL_FILES.find(
      (f) =>
        !f.toLowerCase().startsWith('/thumbs/') &&
        f.toLowerCase().endsWith(target)
    );
    return found || `/Star${num}.png`;
  });
}

/**
 * Returns all full-res image URLs inside a specific public subfolder (excluding /thumbs/)
 */
export function getFolderImages(folderName) {
  const target = folderName.toLowerCase().trim();
  return ALL_FILES.filter((fileUrl) => {
    const lower = fileUrl.toLowerCase();
    if (lower.startsWith('/thumbs/')) return false;
    return (
      lower.includes(`/images/${target}/`) ||
      lower.includes(`/image/${target}/`) ||
      lower.startsWith(`/${target}/`)
    );
  }).sort();
}

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
 * Resolves the category button image and automatically prefers its lightweight thumbnail
 */
export function resolveButtonImage(baseName, fallbackUrl = '') {
  const cleanBase = baseName.toLowerCase().replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const found = ALL_FILES.find((f) => {
    const lower = f.toLowerCase();
    if (lower.startsWith('/thumbs/')) return false;
    return (
      lower.includes(`${cleanBase}.png`) ||
      lower.includes(`${cleanBase}.webp`) ||
      lower.includes(`${cleanBase}.jpg`) ||
      lower.includes(`${cleanBase}.jpeg`)
    );
  });
  const primary = found || `/${cleanBase}.png` || fallbackUrl;
  return getThumbnailUrl(primary);
}

/**
 * Discovers and sorts all Wakeup frames (automatically using lightweight /thumbs/ WebP versions)
 */
export function getWakeupFrames() {
  const discovered = ALL_FILES.filter(
    (f) => !f.toLowerCase().startsWith('/thumbs/') && /wakeup\s*\d+\.(png|webp|jpg)$/i.test(f)
  );

  if (discovered.length > 0) {
    return [...discovered]
      .sort((a, b) => {
        const numA = parseInt(a.match(/(\d+)\.(png|webp|jpg)$/i)?.[1] || '0', 10);
        const numB = parseInt(b.match(/(\d+)\.(png|webp|jpg)$/i)?.[1] || '0', 10);
        return numA - numB;
      })
      .map((frameUrl) => getThumbnailUrl(frameUrl));
  }

  return Array.from({ length: 46 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return getThumbnailUrl(`/wake up PNGs/Wakeup${num}.png`);
  });
}

export function resolveBannerImage() {
  const bannerKeywords = ['banner', 'hero', 'room', 'header', 'couch'];
  const nonCategoryFiles = ALL_FILES.filter(
    (f) =>
      !f.toLowerCase().startsWith('/thumbs/') &&
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

export function resolveLogoVariant({
  theme = 'color',
  blink = false,
  withUrl = false,
} = {}) {
  const logoFiles = ALL_FILES.filter((f) => {
    const l = f.toLowerCase();
    return (
      !l.startsWith('/thumbs/') &&
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

export function getPublicPrintFiles() {
  return ALL_FILES.filter(
    (f) => !f.toLowerCase().startsWith('/thumbs/') && f.toLowerCase().includes('/prints/')
  );
}
