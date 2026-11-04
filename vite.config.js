import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function scanPublicDirectory(dirPath, baseUrl = '') {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relUrl = `${baseUrl}/${entry.name}`;
    if (entry.isDirectory()) {
      results.push(...scanPublicDirectory(fullPath, relUrl));
    } else if (/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(entry.name)) {
      results.push(relUrl);
    }
  }
  return results;
}

export default defineConfig(() => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const publicFiles = scanPublicDirectory(publicDir);

  return {
    plugins: [react()],
    define: {
      __PUBLIC_FILES__: JSON.stringify(publicFiles),
    },
  };
});
