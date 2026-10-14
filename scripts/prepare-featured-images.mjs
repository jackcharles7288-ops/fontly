/**
 * Build-time only: convert owner featured PNGs to WebP variants.
 * Do not import this into browser code.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = path.join(
  process.env.TEMP || process.env.TMPDIR || '.',
  'fonti-featured-raw',
  'feauted iamges',
);
const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'featured');

const MAP = [
  ['Glossy Cursive Fonts Logo with Favicon.png', 'cursive-featured'],
  ['Glossy Purple Aesthetic Fonts Logo.png', 'aesthetic-featured'],
  ['Glossy Purple Bold & Italic Fonts.png', 'bold-italic-featured'],
  ['Glossy Purple Bubble Fonts Logo.png', 'bubble-featured'],
  ['Glossy Purple Cute Fonts Logo.png', 'cute-featured'],
  ['Glossy Purple Freaky Fonts Poster.png', 'freaky-featured'],
  ['Glossy Small Text Typography.png', 'small-text-featured'],
  ['Glossy Upside Down Fonts Logo.png', 'upside-down-featured'],
  ['Gothic Purple 3D Font Showcase.png', 'gothic-featured'],
  ['Neon Glitch Fonts Poster.png', 'glitch-featured'],
  ['Number Fonts Purple Typography Poster.png', 'number-featured'],
];

const WIDTHS = [400, 800, 1200];
const QUALITY = 80;

fs.mkdirSync(OUT_DIR, { recursive: true });

const report = [];

for (const [srcName, stem] of MAP) {
  const srcPath = path.join(RAW_DIR, srcName);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source PNG: ${srcPath}`);
  }
  const meta = await sharp(srcPath).metadata();
  console.log(`${stem}: ${meta.width}x${meta.height} ${meta.format}`);

  for (const w of WIDTHS) {
    const out = path.join(OUT_DIR, `${stem}-${w}.webp`);
    const info = await sharp(srcPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);
    const sizeKb = Math.round(info.size / 1024);
    report.push({
      file: path.basename(out),
      width: info.width,
      height: info.height,
      bytes: info.size,
      kb: sizeKb,
    });
    console.log(`  ${path.basename(out)} ${info.width}x${info.height} ${sizeKb}KB`);
  }
}

fs.writeFileSync(
  path.join(process.env.TEMP || '.', 'fonti-featured-sizes.json'),
  JSON.stringify(report, null, 2),
);
console.log('done', report.length, 'files');
