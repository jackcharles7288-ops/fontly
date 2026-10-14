/**
 * Shared tool section set and default chip selection.
 * Homepage toolCategories is the authoritative shared catalog.
 * Page frontmatter toolCategories still describe curated topic content.
 */

/** Mirrors src/content/pages/index.md toolCategories. */
export const SHARED_TOOL_CATEGORIES: readonly string[] = [
  'cursive',
  'bold',
  'italic',
  'bubble',
  'gothic',
  'small',
  'fancy',
  'aesthetic',
  'number',
  'upside-down',
  'effects',
  'combined',
  'combo',
  'stars',
  'hearts',
  'brackets',
  'shapes',
  'lines',
  'symbols',
];

const PLATFORM_PAGES = new Set([
  'instagram-fonts',
  'facebook-fonts',
  'tiktok-fonts',
  'discord-fonts',
  'pubg-fonts',
]);

/** Specialist pages that start on a named alphabet selection. */
const DEFAULT_BY_PAGE: Record<string, string> = {
  index: 'all',
  'cursive-font-generator': 'cursive',
  'bold-text-generator': 'bold-italic',
  'bubble-text-generator': 'bubble',
  'gothic-font-generator': 'gothic',
  'aesthetic-font-generator': 'aesthetic',
  'cute-font-generator': 'cute',
  'small-text-generator': 'small',
  'number-font-generator': 'number',
  'upside-down-text-generator': 'upside-down',
  'freaky-font-generator': 'freaky',
  'glitch-text-generator': 'glitch',
};

export function isPlatformToolPage(pageId: string): boolean {
  return PLATFORM_PAGES.has(pageId);
}

/**
 * Initial chip id. Platform pages use the UI-only "recommended" selection.
 */
export function defaultFilterFor(pageId: string): string {
  if (PLATFORM_PAGES.has(pageId)) return 'recommended';
  return DEFAULT_BY_PAGE[pageId] ?? 'all';
}

/** Merge shared homepage sections with page-local extras; preserve order. */
export function mergedToolCategories(pageCategories: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of [...SHARED_TOOL_CATEGORIES, ...pageCategories]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
