const fs = require('fs');
const z = require('zlib');
const path = require('path');

const html = fs.readFileSync('dist/phase-1-test/index.html', 'utf8');
const sm = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!sm) {
  console.error('NO_SCRIPT');
  process.exit(1);
}
fs.mkdirSync('scripts/.measure', { recursive: true });
const jsPath = 'scripts/.measure/tool.js';
fs.writeFileSync(jsPath, sm[1]);
console.log('JS_PATH', path.resolve(jsPath));
console.log('JS_GZIP', z.gzipSync(fs.readFileSync(jsPath)).length);

const cm = html.match(/<style>([\s\S]*?)<\/style>/);
if (!cm) {
  console.error('NO_STYLE');
  process.exit(1);
}
const cssPath = 'scripts/.measure/global.css';
fs.writeFileSync(cssPath, cm[1]);
console.log('CSS_PATH', path.resolve(cssPath));
console.log('CSS_GZIP', z.gzipSync(fs.readFileSync(cssPath)).length);
