import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const THUMBS_DIR = path.resolve(PUBLIC_DIR, 'thumbs');

async function processDirectory(currentDir, relativePath = '') {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip the thumbs folder itself and icons/logos
    if (entry.name === 'thumbs' || entry.name === 'icons' || entry.name === 'sounds') {
      continue;
    }

    const fullInputPath = path.join(currentDir, entry.name);
    const relFilePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullInputPath, relFilePath);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      const parsed = path.parse(relFilePath);
      const outputRelPath = path.join(parsed.dir, `${parsed.name}.webp`);
      const fullOutputPath = path.join(THUMBS_DIR, outputRelPath);

      fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });

      const lowerName = relFilePath.toLowerCase();
      // Size targets: 260px for buttons/wakeup frames, 460px for product card thumbnails
      const targetWidth =
        lowerName.includes('wakeup') || lowerName.includes('_button') ? 260 : 460;

      try {
        await sharp(fullInputPath)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: 78, alphaQuality: 85 })
          .toFile(fullOutputPath);

        console.log(`✔ Thumbnail created: /thumbs/${outputRelPath.replace(/\\/g, '/')}`);
      } catch (err) {
        console.warn(`⚠ Skipped ${relFilePath}:`, err.message);
      }
    }
  }
}

console.log('Generating lightweight WebP thumbnails...');
processDirectory(PUBLIC_DIR).then(() => {
  console.log('Done! All thumbnails saved to public/thumbs/');
});
