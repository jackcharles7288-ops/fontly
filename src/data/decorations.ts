// Decorations are wrappers, not alphabets. A decoration puts real Unicode
// characters before and after the visitor's text; the text itself is copied
// through exactly as typed, letters unconverted. Nothing here belongs in
// styles.ts and nothing here counts in styles.length.

export interface Decoration {
  id: string;
  name: string;
  /** Characters placed before the visitor's text. */
  prefix: string;
  /** Characters placed after the visitor's text. */
  suffix: string;
  /**
   * Quiet public caveat badge, same mechanism and wording style as a style's
   * caveat. null = no badge. A character with emoji presentation must be
   * declared here, never left unsaid.
   */
  caveat: string | null;
}

export const decorations: Decoration[] = [
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2727 WHITE FOUR POINTED STAR, suffix U+2727.
  // Not U+2728 SPARKLES, which carries emoji presentation.
  {
    id: 'sparkles',
    name: 'Hollow Sparkle',
    prefix: '\u2727',
    suffix: '\u2727',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2605 BLACK STAR, suffix U+2605.
  // Not U+2B50 WHITE MEDIUM STAR, which carries emoji presentation.
  {
    id: 'stars',
    name: 'Stars',
    prefix: '\u2605',
    suffix: '\u2605',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2726 BLACK FOUR POINTED STAR, suffix U+2726.
  {
    id: 'four-point',
    name: 'Solid Sparkle',
    prefix: '\u2726',
    suffix: '\u2726',
    caveat: null,
  },
  // Javanese block (U+A980-U+A9DF).
  // Prefix U+A9C1 JAVANESE LEFT RERENGGAN, suffix U+A9C2 JAVANESE RIGHT
  // RERENGGAN. These are paired ornaments, so the two code points differ.
  {
    id: 'ornaments',
    name: 'Ornaments',
    prefix: '\ua9c1',
    suffix: '\ua9c2',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+3010 LEFT BLACK LENTICULAR BRACKET, suffix U+3011 RIGHT BLACK
  // LENTICULAR BRACKET.
  {
    id: 'brackets',
    name: 'Brackets',
    prefix: '\u3010',
    suffix: '\u3011',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+300E LEFT WHITE CORNER BRACKET, suffix U+300F RIGHT WHITE
  // CORNER BRACKET.
  {
    id: 'corner-quotes',
    name: 'Corner Quotes',
    prefix: '\u300e',
    suffix: '\u300f',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+266A EIGHTH NOTE, suffix U+266B BEAMED EIGHTH NOTES.
  // Not U+1F3B5 / U+1F3B6, which carry emoji presentation.
  {
    id: 'music',
    name: 'Music',
    prefix: '\u266a',
    suffix: '\u266b',
    caveat: null,
  },
  // Box Drawing block (U+2500-U+257F).
  // Prefix U+2501 BOX DRAWINGS HEAVY HORIZONTAL twice, suffix U+2501 twice.
  {
    id: 'heavy-line',
    name: 'Heavy Line',
    prefix: '\u2501\u2501',
    suffix: '\u2501\u2501',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+300C LEFT CORNER BRACKET, suffix U+300D RIGHT CORNER BRACKET.
  {
    id: 'corner-brackets',
    name: 'Corner Brackets',
    prefix: '「',
    suffix: '」',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+3016 LEFT WHITE LENTICULAR BRACKET, suffix U+3017 RIGHT WHITE
  // LENTICULAR BRACKET.
  {
    id: 'white-lenticular',
    name: 'White Lenticular',
    prefix: '〖',
    suffix: '〗',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+3018 LEFT WHITE TORTOISE SHELL BRACKET, suffix U+3019 RIGHT WHITE
  // TORTOISE SHELL BRACKET.
  {
    id: 'tortoise-shell',
    name: 'Tortoise Shell',
    prefix: '〘',
    suffix: '〙',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-A block (U+27C0-U+27EF).
  // Prefix U+27E8 MATHEMATICAL LEFT ANGLE BRACKET, suffix U+27E9 MATHEMATICAL
  // RIGHT ANGLE BRACKET.
  {
    id: 'angle-brackets',
    name: 'Angle Brackets',
    prefix: '⟨',
    suffix: '⟩',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-A block (U+27C0-U+27EF).
  // Prefix U+27EA MATHEMATICAL LEFT DOUBLE ANGLE BRACKET, suffix U+27EB
  // MATHEMATICAL RIGHT DOUBLE ANGLE BRACKET.
  {
    id: 'double-angle',
    name: 'Double Angle',
    prefix: '⟪',
    suffix: '⟫',
    caveat: null,
  },
  // Miscellaneous Technical block (U+2300-U+23FF).
  // Prefix U+2308 LEFT CEILING, suffix U+2309 RIGHT CEILING.
  {
    id: 'ceiling',
    name: 'Ceiling',
    prefix: '⌈',
    suffix: '⌉',
    caveat: null,
  },
  // Miscellaneous Technical block (U+2300-U+23FF).
  // Prefix U+230A LEFT FLOOR, suffix U+230B RIGHT FLOOR.
  {
    id: 'floor',
    name: 'Floor',
    prefix: '⌊',
    suffix: '⌋',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2606 WHITE STAR, suffix U+2606.
  {
    id: 'hollow-star',
    name: 'Hollow Star',
    prefix: '☆',
    suffix: '☆',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2729 STRESS OUTLINED WHITE STAR, suffix U+2729.
  {
    id: 'open-sparkle',
    name: 'Open Sparkle',
    prefix: '✩',
    suffix: '✩',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2730 SHADOWED WHITE STAR, suffix U+2730.
  {
    id: 'bold-sparkle',
    name: 'Bold Sparkle',
    prefix: '✰',
    suffix: '✰',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+272F PINWHEEL STAR, suffix U+272F.
  {
    id: 'pinwheel-star',
    name: 'Pinwheel Star',
    prefix: '✯',
    suffix: '✯',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2661 WHITE HEART SUIT, suffix U+2661. The outline heart suit, not
  // the emoji red heart U+2764.
  {
    id: 'hollow-heart',
    name: 'Hollow Heart',
    prefix: '♡',
    suffix: '♡',
    caveat: null,
  },
  // Buginese block (U+1A00-U+1A1F).
  // Prefix U+1A12 BUGINESE LETTER LEBA, suffix U+1A12.
  {
    id: 'wave',
    name: 'Wave',
    prefix: 'ᨒ',
    suffix: 'ᨒ',
    caveat: null,
  },
  // Mathematical Operators block (U+2200-U+22FF).
  // Prefix U+224B TRIPLE TILDE, suffix U+224B.
  {
    id: 'triple-tilde',
    name: 'Triple Tilde',
    prefix: '≋',
    suffix: '≋',
    caveat: null,
  },
  // Mathematical Operators block (U+2200-U+22FF).
  // Prefix U+22C6 STAR OPERATOR, suffix U+22C6.
  {
    id: 'star-operator',
    name: 'Star Operator',
    prefix: '⋆',
    suffix: '⋆',
    caveat: null,
  },
  // CJK Unified Ideographs block (U+4E00-U+9FFF).
  // Prefix U+5F61, suffix U+5F61. A Han ideograph used decoratively as wings.
  {
    id: 'gaming-wings',
    name: 'Gaming Wings',
    prefix: '彡',
    suffix: '彡',
    caveat: null,
  },
];

/**
 * Wraps text in a decoration. The text is never converted — that is the whole
 * difference between a decoration and a style.
 * @param text
 * @param decoration
 */
export function applyDecoration(text: string, decoration: Decoration): string {
  return decoration.prefix + text + decoration.suffix;
}
