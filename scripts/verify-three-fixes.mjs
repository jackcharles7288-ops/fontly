/**
 * Focused checks for picture captions, figure boundaries, and JSON-LD < escape.
 * Build-only; not part of the browser bundle.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectArticleImages } from '../src/lib/article-images.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const site = 'https://fonti.cool';
let failures = 0;

function assert(cond, msg) {
  if (!cond) {
    failures += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('PASS:', msg);
  }
}

function findCaption(images, localPath) {
  return images.find((img) => img.localPath === localPath)?.caption;
}

// Use real on-disk assets so sharp resolveDims succeeds.
const workflow = '/images/workflow-steps.webp';
const cursiveDesktop = '/images/cursive-styles-desktop.webp';
const featured = '/images/featured/cursive-featured-400.webp';

assert(fs.existsSync(path.join(root, 'public', workflow.slice(1))), 'workflow asset exists');
assert(
  fs.existsSync(path.join(root, 'public', cursiveDesktop.slice(1))),
  'cursive desktop asset exists',
);
assert(fs.existsSync(path.join(root, 'public', featured.slice(1))), 'featured asset exists');

const fixtures = [
  {
    name: 'picture > source + img, then p > em',
    html: `<picture><source type="image/webp" srcset="${workflow}"><img src="${workflow}" alt="Workflow steps" width="800" height="400"></picture>\n<p><em>Type once. Pick a style. Copy and paste.</em></p>`,
    path: workflow,
    expect: 'Type once. Pick a style. Copy and paste.',
  },
  {
    name: 'plain img then p > em',
    html: `<img src="${cursiveDesktop}" alt="Cursive styles" width="800" height="400">\n<p><em>Desktop list of cursive styles.</em></p>`,
    path: cursiveDesktop,
    expect: 'Desktop list of cursive styles.',
  },
  {
    name: 'figure > img + figcaption',
    html: `<figure><img src="${featured}" alt="Featured cursive" width="400" height="210"><figcaption>Featured <code>cursive</code> sample.</figcaption></figure>`,
    path: featured,
    expect: 'Featured cursive sample.',
  },
  {
    name: 'picture without caption, then heading',
    html: `<picture><img src="${workflow}" alt="Workflow steps" width="800" height="400"></picture>\n<h2>Next section</h2><p>Unrelated prose.</p>`,
    path: workflow,
    expect: undefined,
  },
  {
    name: 'closed earlier figure must not leak caption to following plain img',
    html: `<figure><img src="${featured}" alt="Featured cursive" width="400" height="210"><figcaption>Earlier figure caption.</figcaption></figure>\n<img src="${cursiveDesktop}" alt="Cursive styles" width="800" height="400">\n<p><em>Own plain caption.</em></p>`,
    path: cursiveDesktop,
    expect: 'Own plain caption.',
  },
];

for (const fix of fixtures) {
  const images = await collectArticleImages(fix.html, site);
  const caption = findCaption(images, fix.path);
  assert(
    caption === fix.expect,
    `${fix.name} → ${JSON.stringify(caption)} (expected ${JSON.stringify(fix.expect)})`,
  );
}

// Dual-image: second figure caption must not attach to first plain img after closed figure.
{
  const html = `<figure><img src="${featured}" alt="Featured cursive" width="400" height="210"><figcaption>First figure.</figcaption></figure>
<img src="${workflow}" alt="Workflow steps" width="800" height="400">
<figure><img src="${cursiveDesktop}" alt="Cursive styles" width="800" height="400"><figcaption>Second figure only.</figcaption></figure>`;
  const images = await collectArticleImages(html, site);
  assert(
    findCaption(images, workflow) === undefined,
    'plain img between figures gets no figure caption',
  );
  assert(
    findCaption(images, cursiveDesktop) === 'Second figure only.',
    'second figure keeps its own figcaption',
  );
  assert(
    findCaption(images, featured) === 'First figure.',
    'first figure keeps its own figcaption',
  );
}

// JSON-LD less-than escape (mirrors Schema.astro)
{
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        description: 'Safe </script><script>alert(1)</script> text',
      },
    ],
  };
  const raw = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  assert(!raw.includes('</script>'), 'escaped JSON has no literal </script>');
  assert(raw.includes('\\u003c'), 'escaped JSON contains \\u003c');
  const parsed = JSON.parse(raw);
  assert(
    parsed['@graph'][0].description === 'Safe </script><script>alert(1)</script> text',
    'parsed JSON recovers original description',
  );
  const block = `<script type="application/ld+json">${raw}</script>`;
  const matches = block.match(/<script\b/gi) || [];
  assert(matches.length === 1, `single script open tag (got ${matches.length})`);
}

if (failures > 0) {
  console.error(`RESULT: FAIL (${failures})`);
  process.exit(1);
}
console.log('RESULT: PASS');
