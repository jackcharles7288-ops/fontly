export const prerender = true;

import { getCollection } from 'astro:content';
import * as markdownSatteri from '@astrojs/markdown-satteri';
import { collectArticleImages, xmlEscape } from '../lib/article-images';

const SATTERI_PINNED_VERSION = '0.3.7';
const createSatteriMarkdownProcessor = markdownSatteri.createSatteriMarkdownProcessor;

if (typeof createSatteriMarkdownProcessor !== 'function') {
  throw new Error(
    `[fonti] @astrojs/markdown-satteri@${SATTERI_PINNED_VERSION}: createSatteriMarkdownProcessor missing for image sitemap.`,
  );
}

export async function GET({ site }: { site: URL | undefined }) {
  if (!site) {
    throw new Error('[fonti] Astro.site is required to build image-sitemap.xml');
  }

  const pages = await getCollection('pages');
  const processor = await createSatteriMarkdownProcessor();
  const PLACEHOLDER_HTML = '<p>TOOL PLACEHOLDER</p>';

  const urlBlocks: string[] = [];

  for (const page of pages) {
    // 404 is not in the pages collection on this site; still skip noindex-style ids.
    if (page.id === '404') continue;

    const { code: articleHtml } = await processor.render(page.body ?? '');
    const parts = articleHtml.split(PLACEHOLDER_HTML);
    const combined = parts.filter(Boolean).join('\n');
    if (!combined.trim()) continue;

    const images = await collectArticleImages(combined, site);
    if (images.length === 0) continue;

    const pagePath = page.id === 'index' ? '/' : `/${page.id}/`;
    const pageUrl = new URL(pagePath, site).href;

    const imageXml = images
      .map(
        (img) => `    <image:image>
      <image:loc>${xmlEscape(img.contentUrl)}</image:loc>
    </image:image>`,
      )
      .join('\n');

    urlBlocks.push(`  <url>
    <loc>${xmlEscape(pageUrl)}</loc>
${imageXml}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlBlocks.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
