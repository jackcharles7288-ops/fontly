// Separator characters for the Combo builder. One glyph each. No wrapping,
// no mapping — the builder inserts these between letters of each word.

export interface Separator {
  id: string;
  name: string;
  char: string;
}

export const separators: Separator[] = [
  { id: 'middle-dot', name: 'Middle Dot', char: '\u00B7' },
  { id: 'four-pointed-star', name: 'Four Pointed Star', char: '\u2726' },
  { id: 'white-heart', name: 'White Heart', char: '\u2661' },
  { id: 'open-diamond', name: 'Open Diamond', char: '\u25C8' },
  { id: 'space', name: 'Space', char: '\u0020' },
];

if (separators.length === 0) {
  throw new Error('[fonti] separators.ts: separators array is empty');
}
