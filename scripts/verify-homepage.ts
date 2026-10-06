// Development-only verification tool. Run from the terminal:
//   npx tsx scripts/verify-homepage.ts
// Never imported by any page or shipped to the browser.
// Reads dist/index.html, so run after `npx astro build` (or against the last build).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { styles, type Style } from '../src/data/styles.ts';
import { decorations } from '../src/data/decorations.ts';
import { effects } from '../src/data/effects.ts';
import { combinations } from '../src/data/combinations.ts';
import { applyStyle } from '../src/scripts/generator.js';

const DIST_HTML = path.join('dist', 'index.html');
const INDEX_MD = path.join('src', 'content', 'pages', 'index.md');
const UNIQUE =
  styles.length + decorations.length + effects.length + combinations.length;

const DEFERRED = [
  '/fancy-font-generator/',
  '/cool-font-generator/',
  '/whatsapp-fonts/',
  '/bubble-text-generator/',
];

interface Failure {
  check: string;
  cause: string;
}

const failures: Failure[] = [];
const lines: string[] = [];

function pass(n: number, label: string, detail: string): void {
  lines.push(`${n}. ${label}: PASS. ${detail}`);
}

function fail(n: number, label: string, cause: string): void {
  lines.push(`${n}. ${label}: FAIL. ${cause}`);
  failures.push({ check: `${n}. ${label}`, cause });
}

function gzipSize(filePath: string): number {
  return zlib.gzipSync(fs.readFileSync(filePath)).length;
}

function walkHtml(dir: string, acc: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(p, acc);
    else if (entry.name === 'index.html' || entry.name.endsWith('.html')) acc.push(p);
  }
}

function resolveInternal(href: string): string | null {
  const raw = href.split('#')[0].split('?')[0];
  if (raw === '' || raw === '/') return path.join('dist', 'index.html');
  const rel = raw.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    path.join('dist', rel),
    path.join('dist', rel, 'index.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function extractAnchors(html: string): string[] {
  const hrefs: string[] = [];
  const re = /<a\b[^>]*\bhref=(["'])([^"']+)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    hrefs.push(m[2]);
  }
  return hrefs;
}

function extractImgs(html: string): string[] {
  const tags: string[] = [];
  const re = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    tags.push(m[0]);
  }
  return tags;
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i');
  const m = tag.match(re);
  return m ? m[2] : null;
}

function frontmatterFaqQuestions(md: string): string[] {
  const parts = md.split(/^---\s*$/m);
  if (parts.length < 3) return [];
  const fm = parts[1];
  const qs: string[] = [];
  const re = /^[ \t]*- q:[ \t]*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fm))) {
    qs.push(m[1].trim());
  }
  return qs;
}

function jsonLdFaqQuestions(html: string): string[] {
  const m = html.match(
    /<script type="application\/ld\+json">([^<]+)<\/script>/,
  );
  if (!m) return [];
  const data = JSON.parse(m[1]) as {
    '@graph'?: Array<{ '@type'?: string; mainEntity?: Array<{ name?: string }> }>;
  };
  const faq = data['@graph']?.find((g) => g['@type'] === 'FAQPage');
  if (!faq?.mainEntity) return [];
  return faq.mainEntity.map((item) => (item.name ?? '').trim());
}

function isDeferred(href: string): string | null {
  const pathOnly = href.split('#')[0].split('?')[0];
  for (const slug of DEFERRED) {
    const bare = slug.replace(/\/$/, '');
    if (pathOnly === slug || pathOnly === bare || pathOnly.startsWith(slug)) {
      return slug;
    }
  }
  return null;
}

function styleCountPhrases(text: string): Array<{ phrase: string; n: number }> {
  const found: Array<{ phrase: string; n: number }> = [];
  const plus = text.matchAll(/(\d+)\+/g);
  for (const m of plus) {
    found.push({ phrase: m[0], n: Number(m[1]) });
  }
  if (/\bthree hundred\b/i.test(text)) {
    found.push({ phrase: 'three hundred', n: 300 });
  }
  return found;
}

function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

if (!fs.existsSync(DIST_HTML)) {
  console.error(`FAIL: ${DIST_HTML} is missing. Run npx astro build first.`);
  process.exitCode = 1;
  process.exit(1);
}

const html = fs.readFileSync(DIST_HTML, 'utf8');
const md = fs.readFileSync(INDEX_MD, 'utf8');

const circled = styles.find((s) => s.id === 'circled') as Style | undefined;
const filled = styles.find((s) => s.id === 'negative-circled') as Style | undefined;
const script = styles.find((s) => s.id === 'script') as Style | undefined;
const arrowDecos = decorations.filter(
  (d) => /arrow/i.test(d.id) || /arrow/i.test(d.name),
);
const arrowEffects = effects.filter(
  (e) => /arrow/i.test(e.id) || /arrow/i.test(e.name),
);

console.log('HOMEPAGE AUDIT DATA');
console.log(`unique total = styles ${styles.length} + decorations ${decorations.length} + effects ${effects.length} + combinations ${combinations.length} = ${UNIQUE}`);
if (circled) {
  console.log(`circled id=${circled.id} name=${circled.name} applyStyle("123")=${applyStyle('123', circled)}`);
}
if (filled) {
  console.log(`filled id=${filled.id} name=${filled.name} applyStyle("123")=${applyStyle('123', filled)}`);
}
if (script) {
  const keys = Object.keys(script.substitutions);
  console.log(`script id=${script.id} substitutions (${keys.length}): ${keys.join(', ')}`);
}
console.log(`arrow decorations (${arrowDecos.length}): ${arrowDecos.map((d) => `${d.id} group=${d.group} prefix=${JSON.stringify(d.prefix)} suffix=${JSON.stringify(d.suffix)}`).join('; ')}`);
console.log(`arrow effects (${arrowEffects.length}): ${arrowEffects.map((e) => e.id).join(', ') || '(none)'}`);

const h2s: string[] = [];
const h2re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
let h2m: RegExpExecArray | null;
while ((h2m = h2re.exec(html))) {
  h2s.push(h2m[1].replace(/<[^>]+>/g, '').trim());
}
console.log(`H2s (${h2s.length}): ${h2s.join(' | ')}`);

const titleM = html.match(/<title>([^<]*)<\/title>/);
const title = titleM ? titleM[1] : '';
const descM = html.match(/<meta name="description" content="([^"]*)"/);
const description = descM ? descM[1] : '';
console.log(`title (${title.length} chars): ${title}`);
console.log(`description (${description.length} chars): ${description}`);

const mdParts = md.split(/^---\s*$/m);
const bodyMd = mdParts.slice(2).join('---').replace(/^[\s\S]*?TOOL PLACEHOLDER\s*/, '');
const fm = mdParts[1] ?? '';
const heroIntroM = fm.match(/heroIntro: >-\s*\n([\s\S]*?)(?=\nheroIntroBelow:)/);
const heroBelowM = fm.match(/heroIntroBelow: >-\s*\n([\s\S]*?)(?=\nfaq:)/);
const heroIntro = (heroIntroM?.[1] ?? '').replace(/^\s{2}/gm, '').trim();
const heroBelow = (heroBelowM?.[1] ?? '').replace(/^\s{2}/gm, '').trim();
const prose = `${heroIntro}\n${heroBelow}\n${bodyMd}`;
const emDashes = (prose.match(/\u2014/g) ?? []).length;
const strippedMd = prose
  .replace(/<[^>]+>/g, ' ')
  .replace(/[#>*`]/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const words = wordCount(strippedMd);
console.log(`body word count (heroes + article markdown): ${words}`);
console.log(`em dashes U+2014 in that prose: ${emDashes}`);
if (words > 0) {
  console.log(`em dashes per 400 words: ${((emDashes / words) * 400).toFixed(2)}`);
}
const mdLines = md.split(/\r?\n/);
console.log('style-count phrases in index.md:');
mdLines.forEach((line, i) => {
  if (/\d+\+/.test(line) || /\bthree hundred\b/i.test(line)) {
    console.log(`  L${i + 1}: ${line.trim()}`);
  }
});
const toolCountM = html.match(/class="tool__style-count"[^>]*>(\d+) styles</);
console.log(`tool style-count span: ${toolCountM ? toolCountM[1] + ' styles' : '(missing)'}`);

const htmlFiles: string[] = [];
walkHtml('dist', htmlFiles);
const gzPages = htmlFiles
  .map((p) => ({ p, gz: gzipSize(p), raw: fs.statSync(p).size }))
  .sort((a, b) => b.gz - a.gz);
console.log('HTML_GZIP pages:');
for (const row of gzPages.slice(0, 5)) {
  console.log(`  ${row.gz} ${row.raw} ${row.p}`);
}

console.log('='.repeat(70));

// 1. Internal hrefs
const hrefs = extractAnchors(html);
const internal = [...new Set(hrefs.filter((h) => h.startsWith('/') && !h.startsWith('//')))].sort();
console.log(`internal hrefs (${internal.length}): ${internal.join(' ')}`);
const missing: string[] = [];
for (const href of internal) {
  if (!resolveInternal(href)) missing.push(href);
}
if (missing.length === 0) {
  pass(1, 'Internal hrefs', `${internal.length} unique internal hrefs resolve in dist/`);
} else {
  fail(1, 'Internal hrefs', `missing: ${missing.join(', ')}`);
}

// 2. Deferred slugs
const deferredHits = hrefs
  .map((h) => ({ h, slug: isDeferred(h) }))
  .filter((x) => x.slug);
if (deferredHits.length === 0) {
  pass(2, 'Deferred slugs', `none of ${DEFERRED.join(' ')} linked`);
} else {
  const listed = [...new Set(deferredHits.map((x) => x.h))].join(', ');
  fail(2, 'Deferred slugs', `linked: ${listed}`);
}

// 3. FAQ count
const mdQs = frontmatterFaqQuestions(md);
const ldQs = jsonLdFaqQuestions(html);
if (mdQs.length === ldQs.length && mdQs.every((q, i) => q === ldQs[i])) {
  pass(3, 'FAQ sync', `${mdQs.length} questions, text matches JSON-LD`);
} else {
  fail(
    3,
    'FAQ sync',
    `frontmatter ${mdQs.length} vs JSON-LD ${ldQs.length}; md=[${mdQs.join(' | ')}] ld=[${ldQs.join(' | ')}]`,
  );
}

// 4. Style-count phrases
const visibleHtml = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
const phrases = [
  ...styleCountPhrases(`${title}\n${description}\n${visibleHtml}`),
];
if (toolCountM) {
  phrases.push({ phrase: `${toolCountM[1]} styles`, n: Number(toolCountM[1]) });
}
const badCounts = phrases.filter((p) => p.n !== UNIQUE);
if (phrases.length === 0) {
  fail(4, 'Style counts', `no numeric style-count phrase found; computed unique total is ${UNIQUE}`);
} else if (badCounts.length === 0) {
  pass(4, 'Style counts', `every phrase matches unique total ${UNIQUE}`);
} else {
  fail(
    4,
    'Style counts',
    `unique total is ${UNIQUE}; mismatched phrases: ${[...new Set(badCounts.map((p) => `${p.phrase}(${p.n})`))].join(', ')}`,
  );
}

// 5. Title and description lengths
const titleOk = title.length > 0 && title.length <= 60;
const descOk = description.length > 0 && description.length <= 155;
if (titleOk && descOk) {
  pass(5, 'Title and description length', `title ${title.length}/60, description ${description.length}/155`);
} else {
  const bits: string[] = [];
  if (!titleOk) bits.push(`title ${title.length} (cap 60)`);
  if (!descOk) bits.push(`description ${description.length} (cap 155)`);
  fail(5, 'Title and description length', bits.join('; '));
}

// 6–7. Images
const imgs = extractImgs(html);
const emptyAlt = imgs.filter((tag) => {
  const a = attr(tag, 'alt');
  return a === null || a.trim() === '';
});
const missingBox = imgs.filter((tag) => attr(tag, 'width') === null || attr(tag, 'height') === null);
if (imgs.length === 0) {
  fail(6, 'Image alt', 'no <img> on the homepage');
  fail(7, 'Image width/height', 'no <img> on the homepage');
} else {
  if (emptyAlt.length === 0) {
    pass(6, 'Image alt', `${imgs.length} img(s), all have non-empty alt`);
  } else {
    fail(6, 'Image alt', `${emptyAlt.length} img(s) missing or empty alt: ${emptyAlt.join(' ')}`);
  }
  if (missingBox.length === 0) {
    pass(7, 'Image width/height', `${imgs.length} img(s), all have width and height`);
  } else {
    fail(7, 'Image width/height', `${missingBox.length} img(s) missing width or height: ${missingBox.join(' ')}`);
  }
}

for (const line of lines) {
  console.log(line);
}

console.log('='.repeat(70));
if (failures.length === 0) {
  console.log(`RESULT: PASS. Homepage self-test: 7 checks, unique total ${UNIQUE}.`);
} else {
  console.log(`RESULT: FAIL. ${failures.length} failure(s):`);
  for (const failure of failures) {
    console.log(`  [${failure.check}] ${failure.cause}`);
  }
}
console.log('='.repeat(70));

if (failures.length > 0) {
  process.exitCode = 1;
}
