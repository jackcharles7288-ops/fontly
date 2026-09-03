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
  // Miscellaneous Mathematical Symbols-A block (U+27C0-U+27EF).
  // Prefix U+27E6 MATHEMATICAL LEFT WHITE SQUARE BRACKET, suffix U+27E7
  // MATHEMATICAL RIGHT WHITE SQUARE BRACKET.
  {
    id: 'white-square-brackets',
    name: 'White Square Brackets',
    prefix: '⟦',
    suffix: '⟧',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-B block (U+2980-U+29FF).
  // Prefix U+2985 LEFT WHITE PARENTHESIS, suffix U+2986 RIGHT WHITE PARENTHESIS.
  {
    id: 'double-parens',
    name: 'Double Parentheses',
    prefix: '⦅',
    suffix: '⦆',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2042 ASTERISM, suffix U+2042.
  {
    id: 'asterism',
    name: 'Asterism',
    prefix: '⁂',
    suffix: '⁂',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2756 BLACK DIAMOND MINUS WHITE X, suffix U+2756.
  {
    id: 'diamond-x',
    name: 'Diamond',
    prefix: '❖',
    suffix: '❖',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2724 HEAVY FOUR BALLOON-SPOKED ASTERISK, suffix U+2724.
  {
    id: 'balloon-asterisk',
    name: 'Balloon Asterisk',
    prefix: '✤',
    suffix: '✤',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2725 FOUR CLUB-SPOKED ASTERISK, suffix U+2725.
  {
    id: 'club-asterisk',
    name: 'Club Asterisk',
    prefix: '✥',
    suffix: '✥',
    caveat: null,
  },
  // Thai block (U+0E00-U+0E7F).
  // Prefix U+0E5B THAI CHARACTER KHOMUT, suffix U+0E5B.
  {
    id: 'khomut',
    name: 'Khomut',
    prefix: '๛',
    suffix: '๛',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+269D OUTLINED WHITE STAR, suffix U+269D.
  {
    id: 'outlined-star',
    name: 'Outlined Star',
    prefix: '⚝',
    suffix: '⚝',
    caveat: null,
  },
  // CJK Unified Ideographs block (U+4E00-U+9FFF).
  // Prefix U+4E42, suffix U+4E42. A Han ideograph used decoratively as a cross.
  {
    id: 'cjk-cross',
    name: 'Cross',
    prefix: '乂',
    suffix: '乂',
    caveat: null,
  },
  // Box Drawing block (U+2500-U+257F).
  // Prefix U+2500 BOX DRAWINGS LIGHT HORIZONTAL, suffix U+2500.
  {
    id: 'light-line',
    name: 'Light Line',
    prefix: '─',
    suffix: '─',
    caveat: null,
  },
  // Block Elements block (U+2580-U+259F).
  // Prefix U+2581 LOWER ONE EIGHTH BLOCK, suffix U+2581.
  {
    id: 'low-block',
    name: 'Low Block',
    prefix: '▁',
    suffix: '▁',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+3008 LEFT ANGLE BRACKET, suffix U+3009 RIGHT ANGLE BRACKET.
  // Fullwidth forms — visibly wider than the narrow mathematical pair
  // U+27E8/U+27E9 in 'angle-brackets'.
  {
    id: 'wide-angle-brackets',
    name: 'Wide Angle Brackets',
    prefix: '〈',
    suffix: '〉',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+300A LEFT DOUBLE ANGLE BRACKET, suffix U+300B RIGHT DOUBLE ANGLE BRACKET.
  // Fullwidth forms — visibly wider than the narrow mathematical pair
  // U+27EA/U+27EB in 'double-angle'.
  {
    id: 'wide-double-angle-brackets',
    name: 'Wide Double Angle Brackets',
    prefix: '《',
    suffix: '》',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+3014 LEFT TORTOISE SHELL BRACKET, suffix U+3015 RIGHT TORTOISE SHELL BRACKET.
  // Single-line strokes — 'tortoise-shell' (U+3018/U+3019) is the
  // double-lined white form.
  {
    id: 'plain-tortoise-shell',
    name: 'Plain Tortoise Shell',
    prefix: '〔',
    suffix: '〕',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+301A LEFT WHITE SQUARE BRACKET, suffix U+301B RIGHT WHITE SQUARE BRACKET.
  // Fullwidth forms — visibly wider than the narrow mathematical pair
  // U+27E6/U+27E7 in 'white-square-brackets'.
  {
    id: 'wide-white-square-brackets',
    name: 'Wide White Square Brackets',
    prefix: '〚',
    suffix: '〛',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+301C WAVE DASH, suffix U+301C.
  {
    id: 'wave-dash',
    name: 'Wave Dash',
    prefix: '〜',
    suffix: '〜',
    caveat: null,
  },
  // CJK Symbols and Punctuation block (U+3000-U+303F).
  // Prefix U+301D REVERSED DOUBLE PRIME QUOTATION MARK, suffix U+301E DOUBLE PRIME QUOTATION MARK.
  {
    id: 'double-prime-quotes',
    name: 'Double Prime Quotes',
    prefix: '〝',
    suffix: '〞',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2035 REVERSED PRIME, suffix U+2032 PRIME.
  {
    id: 'primes',
    name: 'Primes',
    prefix: '‵',
    suffix: '′',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2036 REVERSED DOUBLE PRIME, suffix U+2033 DOUBLE PRIME.
  {
    id: 'double-primes',
    name: 'Double Primes',
    prefix: '‶',
    suffix: '″',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2020 DAGGER, suffix U+2020.
  {
    id: 'dagger',
    name: 'Dagger',
    prefix: '†',
    suffix: '†',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2021 DOUBLE DAGGER, suffix U+2021.
  {
    id: 'double-dagger',
    name: 'Double Dagger',
    prefix: '‡',
    suffix: '‡',
    caveat: null,
  },
  // Latin-1 Supplement block (U+0080-U+00FF).
  // Prefix U+00A7 SECTION SIGN, suffix U+00A7.
  {
    id: 'section-sign',
    name: 'Section Sign',
    prefix: '§',
    suffix: '§',
    caveat: null,
  },
  // Latin-1 Supplement block (U+0080-U+00FF).
  // Prefix U+00B6 PILCROW SIGN, suffix U+00B6.
  {
    id: 'pilcrow',
    name: 'Pilcrow',
    prefix: '¶',
    suffix: '¶',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2045 LEFT SQUARE BRACKET WITH QUILL, suffix U+2046 RIGHT SQUARE BRACKET WITH QUILL.
  {
    id: 'square-brackets-quill',
    name: 'Square Brackets with Quill',
    prefix: '⁅',
    suffix: '⁆',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+204A TIRONIAN SIGN ET, suffix U+204A.
  {
    id: 'tironian-et',
    name: 'Tironian Et',
    prefix: '⁊',
    suffix: '⁊',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2766 FLORAL HEART, suffix U+2766.
  {
    id: 'floral-heart',
    name: 'Floral Heart',
    prefix: '❦',
    suffix: '❦',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2690 WHITE FLAG, suffix U+2691 BLACK FLAG.
  {
    id: 'flags',
    name: 'Flags',
    prefix: '⚐',
    suffix: '⚑',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+203B REFERENCE MARK, suffix U+203B.
  {
    id: 'reference-mark',
    name: 'Reference Mark',
    prefix: '※',
    suffix: '※',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25C6 BLACK DIAMOND, suffix U+25C6.
  {
    id: 'black-diamond',
    name: 'Black Diamond',
    prefix: '◆',
    suffix: '◆',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25C7 WHITE DIAMOND, suffix U+25C7.
  {
    id: 'white-diamond',
    name: 'White Diamond',
    prefix: '◇',
    suffix: '◇',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25C8 WHITE DIAMOND CONTAINING BLACK SMALL DIAMOND, suffix U+25C8.
  {
    id: 'diamond-in-diamond',
    name: 'Diamond in Diamond',
    prefix: '◈',
    suffix: '◈',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25A0 BLACK SQUARE, suffix U+25A0.
  {
    id: 'black-square',
    name: 'Black Square',
    prefix: '■',
    suffix: '■',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25A1 WHITE SQUARE, suffix U+25A1.
  {
    id: 'white-square',
    name: 'White Square',
    prefix: '□',
    suffix: '□',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25B2 BLACK UP-POINTING TRIANGLE, suffix U+25B2.
  {
    id: 'up-triangle',
    name: 'Up Triangle',
    prefix: '▲',
    suffix: '▲',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25B3 WHITE UP-POINTING TRIANGLE, suffix U+25B3.
  {
    id: 'white-up-triangle',
    name: 'White Up Triangle',
    prefix: '△',
    suffix: '△',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25BC BLACK DOWN-POINTING TRIANGLE, suffix U+25BC.
  {
    id: 'down-triangle',
    name: 'Down Triangle',
    prefix: '▼',
    suffix: '▼',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25BD WHITE DOWN-POINTING TRIANGLE, suffix U+25BD.
  {
    id: 'white-down-triangle',
    name: 'White Down Triangle',
    prefix: '▽',
    suffix: '▽',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25CB WHITE CIRCLE, suffix U+25CB.
  {
    id: 'white-circle',
    name: 'White Circle',
    prefix: '○',
    suffix: '○',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25CF BLACK CIRCLE, suffix U+25CF.
  {
    id: 'black-circle',
    name: 'Black Circle',
    prefix: '●',
    suffix: '●',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2732 OPEN CENTRE ASTERISK, suffix U+2732.
  {
    id: 'open-asterisk',
    name: 'Open Asterisk',
    prefix: '✲',
    suffix: '✲',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2735 EIGHT POINTED PINWHEEL STAR, suffix U+2735.
  {
    id: 'pinwheel-star-eight',
    name: 'Eight Pointed Pinwheel Star',
    prefix: '✵',
    suffix: '✵',
    caveat: null,
  },
  // Supplemental Punctuation block (U+2E00-U+2E7F).
  // Prefix U+2E28 LEFT DOUBLE PARENTHESIS, suffix U+2E29 RIGHT DOUBLE
  // PARENTHESIS. Two nested curved strokes, unlike the single thick outline
  // of 'double-parens' (U+2985/U+2986).
  {
    id: 'nested-parentheses',
    name: 'Nested Parentheses',
    prefix: '⸨',
    suffix: '⸩',
    caveat: null,
  },
  // Supplemental Punctuation block (U+2E00-U+2E7F).
  // Prefix U+2E22 TOP LEFT HALF BRACKET, suffix U+2E23 TOP RIGHT HALF
  // BRACKET. Brackets that cap only the top of the text.
  {
    id: 'top-half-brackets',
    name: 'Top Half Brackets',
    prefix: '⸢',
    suffix: '⸣',
    caveat: null,
  },
  // Supplemental Punctuation block (U+2E00-U+2E7F).
  // Prefix U+2E24 BOTTOM LEFT HALF BRACKET, suffix U+2E25 BOTTOM RIGHT HALF
  // BRACKET. Brackets that sit under only the bottom of the text.
  {
    id: 'bottom-half-brackets',
    name: 'Bottom Half Brackets',
    prefix: '⸤',
    suffix: '⸥',
    caveat: null,
  },
  // Supplemental Punctuation block (U+2E00-U+2E7F).
  // Prefix U+2E26 LEFT SIDEWAYS U BRACKET, suffix U+2E27 RIGHT SIDEWAYS U
  // BRACKET. U-shaped strokes lying on their sides.
  {
    id: 'sideways-u-brackets',
    name: 'Sideways U Brackets',
    prefix: '⸦',
    suffix: '⸧',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-B block (U+2980-U+29FF).
  // Prefix U+2983 LEFT WHITE CURLY BRACKET, suffix U+2984 RIGHT WHITE CURLY
  // BRACKET. The only curly braces in the catalogue.
  {
    id: 'white-curly-brackets',
    name: 'White Curly Brackets',
    prefix: '⦃',
    suffix: '⦄',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-B block (U+2980-U+29FF).
  // Prefix U+2997 LEFT BLACK TORTOISE SHELL BRACKET, suffix U+2998 RIGHT
  // BLACK TORTOISE SHELL BRACKET. Solid filled shells, unlike the outline
  // forms in 'tortoise-shell' and 'plain-tortoise-shell'.
  {
    id: 'black-tortoise-shell',
    name: 'Black Tortoise Shell',
    prefix: '⦗',
    suffix: '⦘',
    caveat: null,
  },
  // Miscellaneous Mathematical Symbols-B block (U+2980-U+29FF).
  // Prefix U+298B LEFT SQUARE BRACKET WITH UNDERBAR, suffix U+298C RIGHT
  // SQUARE BRACKET WITH UNDERBAR.
  {
    id: 'square-brackets-underbar',
    name: 'Square Brackets with Underbar',
    prefix: '⦋',
    suffix: '⦌',
    caveat: null,
  },
  // Miscellaneous Symbols and Dingbats blocks.
  // Prefix U+2619 REVERSED ROTATED FLORAL HEART BULLET, suffix U+2767
  // ROTATED FLORAL HEART BULLET. The traditional facing pair of vine-leaf
  // ornaments used in letterpress printing.
  {
    id: 'vine-leaves',
    name: 'Facing Vine Leaves',
    prefix: '☙',
    suffix: '❧',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+261A BLACK LEFT POINTING INDEX, suffix U+261B BLACK RIGHT
  // POINTING INDEX. A pointing hand on each side.
  {
    id: 'pointing-hands',
    name: 'Pointing Hands',
    prefix: '☚',
    suffix: '☛',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25B8 BLACK RIGHT-POINTING SMALL TRIANGLE, suffix U+25C2 BLACK
  // LEFT-POINTING SMALL TRIANGLE. The two triangles point inward at the text.
  {
    id: 'inward-triangles',
    name: 'Inward Triangles',
    prefix: '▸',
    suffix: '◂',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+273D HEAVY TEARDROP-SPOKED ASTERISK, suffix U+273D.
  {
    id: 'teardrop-asterisk',
    name: 'Teardrop Asterisk',
    prefix: '✽',
    suffix: '✽',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+273F BLACK FLORETTE, suffix U+273F. A solid flower head.
  {
    id: 'black-florette',
    name: 'Black Florette',
    prefix: '✿',
    suffix: '✿',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2742 CIRCLED OPEN CENTRE EIGHT POINTED STAR, suffix U+2742.
  {
    id: 'circled-star',
    name: 'Circled Star',
    prefix: '❂',
    suffix: '❂',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2745 TIGHT TRIFOLIATE SNOWFLAKE, suffix U+2745. Three-bladed
  // snowflake, unlike the six-pointed U+2746.
  {
    id: 'trifoliate-snowflake',
    name: 'Trifoliate Snowflake',
    prefix: '❅',
    suffix: '❅',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2746 HEAVY CHEVRON SNOWFLAKE, suffix U+2746. Six-pointed
  // chevron snowflake, unlike the three-bladed U+2745.
  {
    id: 'chevron-snowflake',
    name: 'Chevron Snowflake',
    prefix: '❆',
    suffix: '❆',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+274A EIGHT TEARDROP-SPOKED PROPELLER ASTERISK, suffix U+274A.
  {
    id: 'propeller-asterisk',
    name: 'Propeller Asterisk',
    prefix: '❊',
    suffix: '❊',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+274D SHADOWED WHITE CIRCLE, suffix U+274D. A circle with a
  // drop shadow, unlike the plain rings U+25CB and U+25CF.
  {
    id: 'shadowed-circle',
    name: 'Shadowed Circle',
    prefix: '❍',
    suffix: '❍',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+2751 LOWER RIGHT SHADOWED WHITE SQUARE, suffix U+2751. A square
  // with a drop shadow, unlike the plain squares U+25A0 and U+25A1.
  {
    id: 'shadowed-square',
    name: 'Shadowed Square',
    prefix: '❑',
    suffix: '❑',
    caveat: null,
  },
  // Dingbats block (U+2700-U+27BF).
  // Prefix U+275A HEAVY VERTICAL BAR, suffix U+275A. A solid upright slab,
  // unlike the horizontal rules U+2500 and U+2501.
  {
    id: 'heavy-vertical-bar',
    name: 'Heavy Vertical Bar',
    prefix: '❚',
    suffix: '❚',
    caveat: null,
  },
  // Geometric Shapes block (U+25A0-U+25FF).
  // Prefix U+25C9 FISHEYE, suffix U+25C9. A ring with a solid dot inside.
  {
    id: 'fisheye',
    name: 'Fisheye',
    prefix: '◉',
    suffix: '◉',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2664 WHITE SPADE SUIT, suffix U+2664. The outline spade; the
  // solid U+2660 is rejected for carrying the Emoji property.
  {
    id: 'white-spade',
    name: 'White Spade',
    prefix: '♤',
    suffix: '♤',
    caveat: null,
  },
  // Miscellaneous Symbols block (U+2600-U+26FF).
  // Prefix U+2667 WHITE CLUB SUIT, suffix U+2667. The outline club; the
  // solid U+2663 is rejected for carrying the Emoji property.
  {
    id: 'white-club',
    name: 'White Club',
    prefix: '♧',
    suffix: '♧',
    caveat: null,
  },
  // General Punctuation block (U+2000-U+206F).
  // Prefix U+2058 FOUR DOT PUNCTUATION, suffix U+2058. Four dots in a
  // horizontal row.
  {
    id: 'four-dots',
    name: 'Four Dots',
    prefix: '⁘',
    suffix: '⁘',
    caveat: null,
  },
  // Mathematical Operators block (U+2200-U+22FF).
  // Prefix U+22C8 BOWTIE, suffix U+22C8. Two triangles joined tip to tip.
  {
    id: 'bowtie',
    name: 'Bowtie',
    prefix: '⋈',
    suffix: '⋈',
    caveat: null,
  },
  // Mathematical Operators block (U+2200-U+22FF).
  // Prefix U+221E INFINITY, suffix U+221E.
  {
    id: 'infinity',
    name: 'Infinity',
    prefix: '∞',
    suffix: '∞',
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
