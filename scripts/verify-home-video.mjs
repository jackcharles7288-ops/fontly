/**
 * Focused structural and budget checks for the homepage click-to-play video.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { HOME_VIDEO as V } from '../src/data/home-video.ts';

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

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function extractStyleBodies(html) {
  const styles = [];
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    styles.push(m[1]);
  }
  return styles;
}

function extractSrcdoc(html) {
  const m = html.match(/\ssrcdoc="([^"]*)"/i);
  return m ? decodeEntities(m[1]) : '';
}

function comprehensiveCssGzip(html) {
  // Strip srcdoc attributes first so embedded <style> text is not double-counted
  // as page CSS, then add decoded srcdoc styles once.
  const withoutSrcdoc = html.replace(/\ssrcdoc="[^"]*"/gi, '');
  const styles = extractStyleBodies(withoutSrcdoc);
  const srcdoc = extractSrcdoc(html);
  if (srcdoc) styles.push(...extractStyleBodies(srcdoc));
  const joined = styles.join('\n');
  return {
    blocks: styles.length,
    raw: joined.length,
    gzip: zlib.gzipSync(joined, { level: 9 }).length,
  };
}

function executableScriptAudit(html) {
  const modules = [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1] || '');
  const executable = [];
  for (const attrs of modules) {
    const type = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || 'text/javascript';
    if (type === 'application/ld+json' || type === 'application/json') continue;
    executable.push(attrs.slice(0, 120));
  }
  const handlers = [...html.matchAll(/\son[a-z]+\s*=/gi)].length;
  const srcdoc = extractSrcdoc(html);
  const srcdocScript = /<script\b/i.test(srcdoc);
  const srcdocHandler = /\son[a-z]+\s*=/i.test(srcdoc);
  const srcdocJsUrl = /javascript:/i.test(srcdoc);
  return { executable, handlers, srcdocScript, srcdocHandler, srcdocJsUrl, srcdoc };
}

const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const pages = walkHtml(dist).sort();

assert(pages.length === 23, `23 HTML pages (got ${pages.length})`);
assert(!home.includes('HOME VIDEO PLACEHOLDER'), 'homepage marker removed');
assert((home.match(/class="home-video(?: hv)?"/g) || []).length === 1, 'exactly one home-video section');
assert((home.match(/\ssrcdoc="/g) || []).length === 1, 'exactly one srcdoc iframe');
assert(!/src=["']https:\/\/www\.youtube/.test(home), 'no eager youtube.com iframe src');
assert(!/src=["']https:\/\/www\.youtube-nocookie/.test(home), 'no eager nocookie iframe src');

const srcdoc = extractSrcdoc(home);
assert(
  srcdoc.includes(`youtube-nocookie.com/embed/${V.youtubeId}`) &&
    (srcdoc.includes('autoplay=1') || srcdoc.includes('autoplay=1&amp;playsinline=1')),
  'srcdoc links to nocookie playback with autoplay',
);
assert(srcdoc.includes(V.youtubeId), 'srcdoc contains correct YouTube id');
assert(!/<script\b/i.test(srcdoc), 'srcdoc has no script');
assert(!/\son[a-z]+\s*=/i.test(srcdoc), 'srcdoc has no inline handlers');
assert(!/javascript:/i.test(srcdoc), 'srcdoc has no javascript: URL');
assert(
  /aria-label=(["'])Play Fonti overview video on YouTube\1/.test(srcdoc),
  'srcdoc play label',
);
assert(
  /src=(['"])\/images\/video\/fonti-overview-1200\.webp\1/.test(srcdoc),
  'srcdoc poster src is root-relative /images/video/fonti-overview-1200.webp',
);
assert(
  srcdoc.includes('/images/video/fonti-overview-480.webp 480w') &&
    srcdoc.includes('/images/video/fonti-overview-800.webp 800w') &&
    srcdoc.includes('/images/video/fonti-overview-1200.webp 1200w'),
  'srcdoc srcset uses root-relative 480/800/1200 candidates',
);
assert(
  !/src=(['"])https:\/\/fonti\.cool\//.test(srcdoc) &&
    !/srcset=(['"])[^'"]*https:\/\/fonti\.cool\//.test(srcdoc),
  'srcdoc display posters are not absolute fonti.cool URLs',
);
assert(!/<base\b/i.test(srcdoc), 'srcdoc has no base element');
assert(/alt=(["'])Fonti overview video thumbnail\1/i.test(srcdoc), 'srcdoc poster has nonempty alt');
assert(/srcset=/.test(srcdoc), 'srcdoc poster uses srcset');

assert(home.includes('Playing this video connects to YouTube'), 'privacy notice present');
assert(home.includes('href="/privacy-policy/"'), 'privacy notice links policy');
assert(
  /See our <a href="\/privacy-policy\/">Privacy Policy<\/a>\./.test(home),
  'privacy notice has visible space before Privacy Policy link',
);
assert(home.includes('>Watch on YouTube</a>'), 'Watch on YouTube fallback');
assert(home.includes(V.watchUrl), 'watch URL present');

// Polish: centered block, muted privacy, outlined YouTube action, scrollbar fix
const homeStyles = extractStyleBodies(home.replace(/\ssrcdoc="[^"]*"/gi, '')).join('\n');
assert(/\.hv\{[^}]*text-align:center/.test(homeStyles), 'video block text-align:center');
assert(/\.hv-p\{[^}]*color:#555/.test(homeStyles), 'privacy muted color #555');
assert(
  /\.hv-y a\{[^}]*min-height:44px/.test(homeStyles) &&
    /\.hv-y a\{[^}]*border:1px solid var\(--accent\)/.test(homeStyles) &&
    /\.hv-y a\{[^}]*text-decoration:none/.test(homeStyles),
  'Watch on YouTube is outlined accent action >=44px without underline',
);
assert(
  /img\{[^}]*display:block/.test(srcdoc) && /outline-offset:-3px/.test(srcdoc),
  'srcdoc img is block-level and focus ring is inset via outline-offset',
);
assert(!/overflow\s*:\s*hidden/.test(srcdoc), 'srcdoc does not hide overflow to mask sizing');
assert(!/box-shadow:0 0 0 100vmax/.test(srcdoc), 'srcdoc no longer uses full-bleed dim overlay CSS');

// Placement: caption then video then Popular Font Styles
const captionIdx = home.indexOf(
  'Type or paste your text, choose a style, copy it, then paste it into the field you want to use.',
);
const videoIdx = home.search(/class="home-video(?: hv)?"/);
const popularIdx = home.indexOf('Popular Font Styles You Can Create');
assert(captionIdx > 0 && videoIdx > captionIdx, 'video after workflow caption');
assert(popularIdx > videoIdx, 'video before Popular Font Styles');

// VideoObject
const ldBlocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
  (m) => m[1],
);
assert(ldBlocks.length >= 1, 'homepage has JSON-LD');
const ld = JSON.parse(ldBlocks[0]);
const videos = (ld['@graph'] || []).filter((n) => n['@type'] === 'VideoObject');
assert(videos.length === 1, `exactly one VideoObject (got ${videos.length})`);
const vo = videos[0];
assert(vo.name === V.title, 'VideoObject name');
assert(vo.description === V.description, 'VideoObject description');
assert(vo.uploadDate === '2026-10-15', 'VideoObject date-only uploadDate');
assert(vo.duration === 'PT1M9.5S', 'VideoObject duration');
assert(vo.embedUrl === V.embedUrl, 'VideoObject embedUrl without autoplay');
assert(vo.url === V.watchUrl, 'VideoObject watch url');
assert(
  vo.thumbnailUrl === 'https://fonti.cool/images/video/fonti-overview-1200.webp',
  'VideoObject thumbnailUrl stays absolute canonical fonti.cool URL',
);
assert(String(vo['@id']).endsWith('/#fonti-overview-video'), 'VideoObject @id');
assert(ldBlocks[0].includes('\\u003c') || !ldBlocks[0].includes('<'), 'JSON-LD less-than escaped or absent');
assert(!ldBlocks[0].includes('</script>'), 'JSON-LD has no literal closing script');

// Assets on disk
for (const [file, w, h, bytes] of [
  ['fonti-overview-480.webp', 480, 270, 15688],
  ['fonti-overview-800.webp', 800, 450, 29862],
  ['fonti-overview-1200.webp', 1200, 675, 50344],
]) {
  const p = path.join(root, 'public/images/video', file);
  assert(fs.existsSync(p), `${file} exists`);
  assert(fs.statSync(p).size === bytes, `${file} size ${bytes}`);
}

// Other pages: no VideoObject, no srcdoc facade, no playback URL
for (const page of pages) {
  const rel = path.relative(dist, page);
  if (rel === 'index.html') continue;
  const html = fs.readFileSync(page, 'utf8');
  assert(!html.includes('HOME VIDEO PLACEHOLDER'), `${rel} no video marker`);
  assert(!/class="home-video/.test(html), `${rel} no home-video section`);
  assert(!/\ssrcdoc="/i.test(html), `${rel} no srcdoc`);
  assert(!html.includes(V.playbackUrl), `${rel} no playback URL`);
  if (html.includes('application/ld+json')) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    for (const b of blocks) {
      const parsed = JSON.parse(b[1]);
      const vos = (parsed['@graph'] || []).filter((n) => n['@type'] === 'VideoObject');
      assert(vos.length === 0, `${rel} no VideoObject`);
    }
  }
}

// Privacy policy
const privacy = fs.readFileSync(path.join(dist, 'privacy-policy/index.html'), 'utf8');
assert(privacy.includes('Optional YouTube video'), 'privacy Optional YouTube heading');
assert(privacy.includes('15 October 2026'), 'privacy updated date visible');
assert(!privacy.includes('no embedded third-party content'), 'old third-party claim removed');
assert(privacy.includes('policies.google.com/privacy'), 'Google privacy terms link');
assert(
  privacy.includes('Playing the optional video connects to YouTube') ||
    privacy.includes('optional YouTube playback connects to YouTube'),
  'privacy page reflects optional YouTube wording',
);
const privacyMd = fs.readFileSync(path.join(root, 'src/content/pages/privacy-policy.md'), 'utf8');
const desc = privacyMd.match(/^description:\s*"(.*)"\s*$/m)?.[1] ?? '';
assert(desc.length > 0 && desc.length <= 155, `privacy description length ${desc.length} <= 155`);
assert(
  desc.includes('optional YouTube playback connects to YouTube'),
  'privacy description mentions optional YouTube',
);
assert(
  privacyMd.includes(
    'Your text stays in your browser. Fonti itself sets no cookies and runs no analytics or ads. Playing the optional video connects to YouTube.',
  ),
  'privacy heroIntro updated',
);

// Budgets via existing measure + comprehensive CSS
let toolJs = null;
let toolCss = null;
let worstHtmlGzip = { page: '', n: 0 };
let worstHtmlRaw = { page: '', n: 0 };
for (const page of pages) {
  const out = execFileSync('node', [path.join(root, 'scripts/measure-assets.cjs'), page], {
    encoding: 'utf8',
  });
  const js = Number(out.match(/JS_GZIP_TOTAL (\d+)/)[1]);
  const css = Number(out.match(/CSS_GZIP (\d+)/)[1]);
  const hg = Number(out.match(/HTML_GZIP (\d+)/)[1]);
  const hr = Number(out.match(/HTML_RAW (\d+)/)[1]);
  assert(js <= 16384, `${path.relative(dist, page)} JS ${js}`);
  assert(css <= 4500, `${path.relative(dist, page)} CSS ${css}`);
  assert(hg <= 32000, `${path.relative(dist, page)} HTML_GZIP ${hg}`);
  assert(hr <= 200000, `${path.relative(dist, page)} HTML_RAW ${hr}`);
  if (out.includes('Tool.astro')) {
    toolJs = js;
    toolCss = css;
  }
  if (hg > worstHtmlGzip.n) worstHtmlGzip = { page: path.relative(dist, page), n: hg };
  if (hr > worstHtmlRaw.n) worstHtmlRaw = { page: path.relative(dist, page), n: hr };

  const html = fs.readFileSync(page, 'utf8');
  const audit = executableScriptAudit(html);
  // Tool pages have module scripts; homepage too. New executable JS beyond baseline modules is not added by HomeVideo.
  assert(audit.handlers === 0, `${path.relative(dist, page)} no inline handlers`);
  assert(!audit.srcdocScript, `${path.relative(dist, page)} srcdoc no script`);
  assert(!audit.srcdocHandler, `${path.relative(dist, page)} srcdoc no handlers`);
  assert(!audit.srcdocJsUrl, `${path.relative(dist, page)} srcdoc no javascript:`);

  const comp = comprehensiveCssGzip(html);
  assert(comp.gzip <= 4500, `${path.relative(dist, page)} comprehensive CSS gzip ${comp.gzip}`);
}

assert(toolJs === 16313, `tool JS remains 16313 (got ${toolJs})`);
console.log(`MEASURED_JS_TOOL_PAGES=${toolJs}`);
console.log(`MEASURED_CSS_TOOL_PAGES=${toolCss}`);
const homeComp = comprehensiveCssGzip(home);
console.log(`HOME_CSS_COMPREHENSIVE_GZIP=${homeComp.gzip}`);
console.log(`HOME_HTML_GZIP=${Number(/HTML_GZIP (\d+)/.exec(execFileSync('node',[path.join(root,'scripts/measure-assets.cjs'), path.join(dist,'index.html')],{encoding:'utf8'}))[1])}`);
console.log(`WORST_HTML_GZIP=${worstHtmlGzip.page} ${worstHtmlGzip.n}`);
console.log(`WORST_HTML_RAW=${worstHtmlRaw.page} ${worstHtmlRaw.n}`);

// Escape fixture
{
  const jsonLd = { description: 'Safe </script><script>alert(1)</script> text' };
  const raw = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  assert(!raw.includes('</script>'), 'escape fixture has no literal </script>');
  assert(JSON.parse(raw).description.includes('</script>'), 'escape fixture recovers text');
}

if (failures > 0) {
  console.error(`RESULT: FAIL (${failures})`);
  process.exit(1);
}
console.log('RESULT: PASS');
