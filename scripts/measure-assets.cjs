const fs = require('fs');
const path = require('path');
const z = require('zlib');

const JS_GZIP_LIMIT = 15360;
const htmlPath = process.argv[2] || 'dist/index.html';

if (!fs.existsSync(htmlPath)) {
  console.error(`measure-assets: missing file: ${path.resolve(htmlPath)}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const htmlBytes = fs.readFileSync(htmlPath);

const moduleSrcs = [
  ...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*>/g),
].map((m) => m[1]);

if (moduleSrcs.length === 0) {
  console.error(`measure-assets: no module script src found in ${path.resolve(htmlPath)}`);
  process.exit(1);
}

let jsGzipTotal = 0;
const jsFiles = [];
for (const src of moduleSrcs) {
  const jsRel = src.replace(/^\//, '');
  const jsPath = path.join('dist', jsRel);
  if (!fs.existsSync(jsPath)) {
    console.error(`measure-assets: missing file: ${path.resolve(jsPath)}`);
    process.exit(1);
  }
  const gzip = z.gzipSync(fs.readFileSync(jsPath)).length;
  jsGzipTotal += gzip;
  jsFiles.push({ file: jsRel, gzip });
}

const styleMatches = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)];
if (styleMatches.length === 0) {
  console.error(`measure-assets: no inline <style> found in ${path.resolve(htmlPath)}`);
  process.exit(1);
}
// Prefer the largest block: a noscript helper style must not displace the real sheet.
const styleMatch = styleMatches.reduce((best, cur) =>
  cur[1].length > best[1].length ? cur : best,
);
const cssBytes = Buffer.from(styleMatch[1], 'utf8');

console.log('PAGE', htmlPath);
for (const row of jsFiles) {
  console.log('JS_FILE', row.file, row.gzip);
}
console.log('JS_GZIP_TOTAL', jsGzipTotal);
console.log('JS_GZIP_HEADROOM', JS_GZIP_LIMIT - jsGzipTotal);
console.log('CSS_GZIP', z.gzipSync(cssBytes).length);
console.log('HTML_GZIP', z.gzipSync(htmlBytes).length);
console.log('HTML_RAW', htmlBytes.length);

if (jsGzipTotal > JS_GZIP_LIMIT) {
  console.error(`measure-assets: JS_GZIP_TOTAL ${jsGzipTotal} exceeds ${JS_GZIP_LIMIT}`);
  process.exit(1);
}
