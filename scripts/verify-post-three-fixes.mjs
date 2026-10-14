/**
 * Post-build checks for the three small corrections.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let failures = 0;

function assert(cond, msg) {
  if (!cond) {
    failures += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('PASS:', msg);
  }
}

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function load(rel) {
  return fs.readFileSync(path.join(dist, rel), 'utf8');
}

// --- Cute SSR ---
{
  const html = load('cute-font-generator/index.html');
  const toolMatch = html.match(/<section[^>]*class="tool"[^>]*>[\s\S]*?<\/section>\s*<script/i) || [
    null,
    html,
  ];
  const tool = html.includes('data-tool') ? html : toolMatch[0];
  assert(html.includes('data-default-filter="cute"'), 'cute default-filter');
  assert(/tool__style-count[^>]*>15 styles</.test(html), 'cute count 15 styles');

  const cuteSec = html.match(
    /<section[^>]*class="tool__category"[^>]*data-category="cute"[^>]*>[\s\S]*?<\/section>/,
  );
  assert(!!cuteSec, 'cute section present');
  if (cuteSec) {
    assert(/data-mounted="true"/.test(cuteSec[0]), 'cute section data-mounted=true');
    assert(!/\bhidden\b/.test(cuteSec[0].match(/^<section[^>]*>/)[0]), 'cute section not hidden');
    const cards = cuteSec[0].match(/class="tool-card"/g) || [];
    assert(cards.length === 15, `cute section has 15 SSR cards (got ${cards.length})`);
  }

  const cursiveSec = html.match(
    /<section[^>]*class="tool__category"[^>]*data-category="cursive"[^>]*>[\s\S]*?<\/section>/,
  );
  assert(!!cursiveSec, 'cursive shell present on cute page');
  if (cursiveSec) {
    const open = cursiveSec[0].match(/^<section[^>]*>/)[0];
    assert(/data-mounted="false"/.test(open), 'cursive shell data-mounted=false');
    assert(/\bhidden\b/.test(open), 'cursive shell hidden');
    const cards = cursiveSec[0].match(/class="tool-card"/g) || [];
    assert(cards.length === 0, `cursive shell has 0 SSR cards (got ${cards.length})`);
  }
}

// --- Specialist counts from SSR ---
const checks = [
  ['cursive-font-generator/index.html', 'cursive', 6],
  ['gothic-font-generator/index.html', 'gothic', 2],
  ['bold-text-generator/index.html', 'bold-italic', 6],
  ['tiktok-fonts/index.html', 'recommended', 34],
  ['pubg-fonts/index.html', 'recommended', 88],
  ['index.html', 'all', 358],
];
for (const [file, filter, n] of checks) {
  const html = load(file);
  assert(html.includes(`data-default-filter="${filter}"`), `${file} default-filter=${filter}`);
  assert(
    new RegExp(`tool__style-count[^>]*>${n} styles<`).test(html),
    `${file} count ${n} styles`,
  );
}

// --- Measure all HTML ---
const pages = walkHtml(dist).sort();
assert(pages.length === 23, `23 HTML pages (got ${pages.length})`);
let jsTool = null;
let css = null;
for (const page of pages) {
  const out = execFileSync('node', [path.join(root, 'scripts/measure-assets.cjs'), page], {
    encoding: 'utf8',
  });
  const jsm = out.match(/JS_GZIP_TOTAL (\d+)/);
  const cssm = out.match(/CSS_GZIP (\d+)/);
  const htmlm = out.match(/HTML_GZIP (\d+)/);
  const rawm = out.match(/HTML_RAW (\d+)/);
  const js = Number(jsm[1]);
  const c = Number(cssm[1]);
  const hg = Number(htmlm[1]);
  const hr = Number(rawm[1]);
  assert(js <= 16384, `${path.relative(dist, page)} JS ${js} <= 16384`);
  assert(c <= 4500, `${path.relative(dist, page)} CSS ${c} <= 4500`);
  assert(hg <= 32000, `${path.relative(dist, page)} HTML_GZIP ${hg} <= 32000`);
  assert(hr <= 200000, `${path.relative(dist, page)} HTML_RAW ${hr} <= 200000`);
  if (out.includes('Tool.astro')) {
    jsTool = js;
    css = c;
  }
}
console.log(`MEASURED_JS_TOOL_PAGES=${jsTool}`);
console.log(`MEASURED_CSS=${css}`);

// --- JSON-LD parse + picture captions ---
function extractJsonLd(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}

function collectPrincipalArticleUrls(html) {
  // Rough: article imgs under /images/ excluding chrome
  const urls = new Set();
  const re = /<img\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    if (/site-(header|footer)__logo|mockup__|tool-card__|tool__/.test(tag)) continue;
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src || !src.startsWith('/images/') || src.includes('og-card') || src.includes('favicon'))
      continue;
    urls.add(new URL(src, 'https://fonti.cool').href);
  }
  return urls;
}

function imageObjectCaptions(graph) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node['@type'] === 'ImageObject' || (Array.isArray(node['@type']) && node['@type'].includes('ImageObject'))) {
      out.push({
        url: node.contentUrl || node.url,
        caption: node.caption,
        name: node.name,
      });
    }
    for (const v of Object.values(node)) walk(v);
  };
  walk(graph);
  return out;
}

{
  const home = load('index.html');
  const cursive = load('cursive-font-generator/index.html');
  for (const [label, html] of [
    ['home', home],
    ['cursive', cursive],
  ]) {
    const blocks = extractJsonLd(html);
    assert(blocks.length >= 1, `${label} has JSON-LD`);
    for (const block of blocks) {
      assert(!block.includes('</script>'), `${label} JSON-LD has no literal </script>`);
      const parsed = JSON.parse(block);
      assert(!!parsed, `${label} JSON-LD parses`);
    }
  }

  const homeLd = JSON.parse(extractJsonLd(home)[0]);
  const cursiveLd = JSON.parse(extractJsonLd(cursive)[0]);
  const homeImgs = imageObjectCaptions(homeLd);
  const cursiveImgs = imageObjectCaptions(cursiveLd);

  const workflow = homeImgs.find((i) => String(i.url).includes('workflow-steps'));
  const cursiveStyles = cursiveImgs.find((i) => String(i.url).includes('cursive-styles-desktop'));
  assert(!!workflow?.caption, `homepage workflow ImageObject has caption: ${JSON.stringify(workflow?.caption)}`);
  assert(
    !!cursiveStyles?.caption,
    `cursive desktop ImageObject has caption: ${JSON.stringify(cursiveStyles?.caption)}`,
  );

  // Visible captions from HTML
  const homeVis = home.match(
    /workflow-steps[\s\S]{0,400}?<p>\s*<em>([\s\S]*?)<\/em>\s*<\/p>/i,
  );
  const cursiveVis = cursive.match(
    /cursive-styles-desktop[\s\S]{0,400}?<p>\s*<em>([\s\S]*?)<\/em>\s*<\/p>/i,
  );
  const strip = (s) =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
  if (homeVis && workflow) {
    assert(
      strip(homeVis[1]) === String(workflow.caption).trim(),
      `home workflow caption match visible`,
    );
  }
  if (cursiveVis && cursiveStyles) {
    assert(
      strip(cursiveVis[1]) === String(cursiveStyles.caption).trim(),
      `cursive styles caption match visible`,
    );
  }

  // contentURL sets vs article principals
  for (const [label, html, ld] of [
    ['home', home, homeLd],
    ['cursive', cursive, cursiveLd],
  ]) {
    const principals = collectPrincipalArticleUrls(html);
    const ldUrls = new Set(imageObjectCaptions(ld).map((i) => i.url));
    for (const u of ldUrls) {
      assert(principals.has(u), `${label} ImageObject URL in article: ${u}`);
    }
  }
}

// Image sitemap vs homepage principals (spot)
{
  const sm = fs.readFileSync(path.join(dist, 'image-sitemap.xml'), 'utf8');
  assert(sm.includes('workflow-steps.webp'), 'sitemap lists workflow-steps');
  assert(sm.includes('cursive-styles-desktop.webp'), 'sitemap lists cursive-styles-desktop');
}

if (failures > 0) {
  console.error(`RESULT: FAIL (${failures})`);
  process.exit(1);
}
console.log('RESULT: PASS');
