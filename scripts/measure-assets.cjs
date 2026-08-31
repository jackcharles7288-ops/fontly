const fs = require('fs');
const path = require('path');
const z = require('zlib');

const htmlPath = 'dist/index.html';

if (!fs.existsSync(htmlPath)) {
  console.error(`measure-assets: missing file: ${path.resolve(htmlPath)}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

const moduleMatch = html.match(
  /<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*>/,
);
if (!moduleMatch) {
  console.error(`measure-assets: no module script src found in ${path.resolve(htmlPath)}`);
  process.exit(1);
}

const jsRel = moduleMatch[1].replace(/^\//, '');
const jsPath = path.join('dist', jsRel);
if (!fs.existsSync(jsPath)) {
  console.error(`measure-assets: missing file: ${path.resolve(jsPath)}`);
  process.exit(1);
}

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) {
  console.error(`measure-assets: no inline <style> found in ${path.resolve(htmlPath)}`);
  process.exit(1);
}

const jsBytes = fs.readFileSync(jsPath);
const cssBytes = Buffer.from(styleMatch[1], 'utf8');
const htmlBytes = fs.readFileSync(htmlPath);

console.log('JS_GZIP', z.gzipSync(jsBytes).length);
console.log('CSS_GZIP', z.gzipSync(cssBytes).length);
console.log('HTML_GZIP', z.gzipSync(htmlBytes).length);
console.log('HTML_RAW', htmlBytes.length);
