// Combinations are a grid: thirteen alphabet ids cross twelve decoration ids,
// expressed as two id lists rather than 156 hand-written records. Every cell
// ships. No character data lives here — only ids; glyphs come from the parent
// style and decoration records.

import { styles } from './styles';
import { decorations } from './decorations';

export interface Combination {
  id: string;
  name: string;
  style: string;
  decoration: string;
  categories: string[];
}

const STYLE_IDS = [
  'bold-script',
  'bold-italic',
  'italic',
  'sans-italic',
  'sans-bold-italic',
  'bold-serif',
  'bold-sans',
  'fraktur',
  'bold-fraktur',
  'monospace',
  'double-struck',
  'sans-serif',
  'fullwidth',
] as const;

const DECORATION_IDS = [
  'sparkles',
  'pinwheel-star',
  'hollow-heart',
  'chevron-snowflake',
  'brackets',
  'double-parens',
  'black-diamond',
  'bowtie',
  'heavy-line',
  'wave-dash',
  'dagger',
  'gaming-wings',
] as const;

const styleById = new Map(styles.map((s) => [s.id, s]));
const decorationById = new Map(decorations.map((d) => [d.id, d]));

for (const id of STYLE_IDS) {
  if (!styleById.has(id)) {
    throw new Error(`[fontly] combinations.ts: unknown style id "${id}"`);
  }
}
for (const id of DECORATION_IDS) {
  if (!decorationById.has(id)) {
    throw new Error(`[fontly] combinations.ts: unknown decoration id "${id}"`);
  }
}

export const combinations: Combination[] = [];
for (const styleId of STYLE_IDS) {
  const style = styleById.get(styleId)!;
  for (const decorationId of DECORATION_IDS) {
    const decoration = decorationById.get(decorationId)!;
    const categories = [
      ...style.categories.filter((c) => c !== 'cool-fonts'),
      'combined',
      'decorated',
    ];
    if (decoration.group === 'stars' || decoration.group === 'hearts') {
      categories.push('cute');
    }
    combinations.push({
      id: `${styleId}--${decorationId}`,
      name: `${style.name} + ${decoration.name}`,
      style: styleId,
      decoration: decorationId,
      categories,
    });
  }
}
