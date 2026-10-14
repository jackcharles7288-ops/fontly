/**
 * Build-only article image inventory. Not for browser bundles.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface ArticleImage {
  /** Absolute content URL for the principal file. */
  contentUrl: string;
  /** Local path under public/, e.g. /images/foo.webp */
  localPath: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

/** Resolve public/ from process.cwd() so prerender chunks still find assets. */
function publicDir(): string {
  return path.join(process.cwd(), 'public');
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseAttrs(tagInner: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tagInner)) !== null) {
    const name = m[1].toLowerCase();
    if (name === '/' || name === 'img') continue;
    const raw = m[2] ?? m[3] ?? m[4] ?? '';
    attrs[name] = decodeEntities(raw);
  }
  return attrs;
}

function principalFromSrcset(srcset: string | undefined, fallback: string): string {
  if (!srcset) return fallback;
  // Prefer the widest candidate when available; else first.
  let best = fallback;
  let bestW = -1;
  for (const part of srcset.split(',')) {
    const bits = part.trim().split(/\s+/);
    if (!bits[0]) continue;
    const wMatch = bits[1]?.match(/^(\d+)w$/);
    const w = wMatch ? Number(wMatch[1]) : 0;
    if (w >= bestW) {
      bestW = w;
      best = bits[0];
    }
  }
  return best;
}

function stripTags(html: string): string {
  // Replace tags with a space so words around inline code stay separated.
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function captionAfter(html: string, endIndex: number): string | undefined {
  const tail = html.slice(endIndex);
  // Skip whitespace
  const trimmedStart = tail.match(/^\s*/)?.[0].length ?? 0;
  const rest = tail.slice(trimmedStart);

  // Closing of split__media wrappers ignored; look for immediate caption patterns.
  // figcaption inside same figure: handled by looking backwards/forwards within figure below.
  const emOnly = rest.match(/^<p>\s*<em>([\s\S]*?)<\/em>\s*<\/p>/i);
  if (emOnly) return stripTags(emOnly[1]) || undefined;

  const figCap = rest.match(/^<figcaption>([\s\S]*?)<\/figcaption>/i);
  if (figCap) return stripTags(figCap[1]) || undefined;

  return undefined;
}

/**
 * When img sits inside <picture>, captions follow the picture close, not the img tag.
 * Returns the index immediately after </picture>, or undefined if img is not in a picture.
 */
function endAfterContainingPicture(
  html: string,
  imgStart: number,
  imgEnd: number,
): number | undefined {
  const open = html.lastIndexOf('<picture', imgStart);
  if (open < 0) return undefined;
  const prematureClose = html.indexOf('</picture>', open);
  if (prematureClose >= 0 && prematureClose < imgStart) return undefined;
  const close = html.indexOf('</picture>', imgEnd);
  if (close < 0) return undefined;
  return close + '</picture>'.length;
}

function captionInFigure(html: string, imgStart: number): string | undefined {
  const before = html.lastIndexOf('<figure', imgStart);
  if (before < 0) return undefined;
  // Only associate a figure that still contains this img (not a closed earlier one).
  const prematureClose = html.indexOf('</figure>', before);
  if (prematureClose >= 0 && prematureClose < imgStart) return undefined;
  const afterOpen = html.indexOf('>', before);
  if (afterOpen < 0 || afterOpen > imgStart) return undefined;
  const close = html.indexOf('</figure>', imgStart);
  if (close < 0) return undefined;
  const block = html.slice(afterOpen + 1, close);
  const m = block.match(/<figcaption>([\s\S]*?)<\/figcaption>/i);
  return m ? stripTags(m[1]) || undefined : undefined;
}

async function resolveDims(
  localPath: string,
  attrW?: string,
  attrH?: string,
): Promise<{ width: number; height: number }> {
  const filePath = path.join(publicDir(), localPath.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    throw new Error(`[fonti] Article image missing on disk: ${localPath}`);
  }
  try {
    const meta = await sharp(filePath).metadata();
    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height };
    }
  } catch {
    // fall through to attributes
  }
  const width = Number(attrW);
  const height = Number(attrH);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`[fonti] Could not resolve dimensions for ${localPath}`);
  }
  return { width, height };
}

/**
 * Extract distinct principal article images from rendered article HTML.
 * Excludes decorative chrome (handled by callers not passing tool HTML).
 */
export async function collectArticleImages(
  articleHtml: string,
  site: URL | string,
): Promise<ArticleImage[]> {
  const siteUrl = typeof site === 'string' ? site : site.href;
  const results: ArticleImage[] = [];
  const seen = new Set<string>();

  const imgRe = /<img\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRe.exec(articleHtml)) !== null) {
    const attrs = parseAttrs(match[1]);
    const className = attrs.class || '';
    if (
      className.includes('site-header__logo') ||
      className.includes('site-footer__logo') ||
      className.includes('mockup__') ||
      className.includes('tool-card__') ||
      className.includes('tool__')
    ) {
      continue;
    }

    const srcAttr = attrs.src || '';
    if (!srcAttr || srcAttr.startsWith('data:')) continue;
    if (srcAttr.includes('favicon') || srcAttr.includes('apple-touch')) continue;
    if (srcAttr.includes('/images/og-card')) continue;

    // One principal URL per visual image: the img src (not every srcset candidate).
    const principal = srcAttr.startsWith('/')
      ? srcAttr
      : principalFromSrcset(attrs.srcset, srcAttr);
    if (!principal.startsWith('/')) {
      continue;
    }

    const abs = new URL(principal, siteUrl).href;
    if (seen.has(abs)) continue;
    seen.add(abs);

    const alt = attrs.alt ?? '';
    if (!alt.trim()) {
      throw new Error(`[fonti] Article image missing nonempty alt: ${principal}`);
    }

    const dims = await resolveDims(principal, attrs.width, attrs.height);
    const imgEnd = match.index + match[0].length;
    const afterPicture = endAfterContainingPicture(articleHtml, match.index, imgEnd);
    const caption =
      captionInFigure(articleHtml, match.index) ??
      captionAfter(articleHtml, afterPicture ?? imgEnd);

    results.push({
      contentUrl: abs,
      localPath: principal,
      width: dims.width,
      height: dims.height,
      alt,
      caption,
    });
  }

  return results;
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
