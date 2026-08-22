export type Risk = 'safe' | 'uneven' | 'check-old-devices';

export interface Style {
  id: string;
  name: string;
  category: string;
  /** First code point of uppercase A, or null if capitals fold onto lowercase. */
  uppercaseBase: number | null;
  /** First code point of lowercase a, or null if lowercase folds onto capitals. */
  lowercaseBase: number | null;
  /** Code point overrides, keyed by the plain letter they replace. */
  substitutions: Record<string, number>;
  /** null means digits pass through unchanged. */
  digits: string[] | null;
  /**
   * Editorial risk from the blueprint. Never shown in the UI.
   * Public badge text lives in `caveat` only — see generator.mdc badge rule.
   */
  risk: Risk | null;
  /**
   * Quiet public caveat badge. null = no badge.
   * Only Unicode-verifiable facts (multi-block, emoji presentation). Never
   * device or platform predictions. Silence is the honest default.
   */
  caveat: string | null;
  /**
   * Quiet case-fold disclosure when one case is mapped onto the other.
   * null = full alphabet, no note.
   */
  caseNote: string | null;
}

/** Ten digit characters from a contiguous Mathematical Alphanumeric block. */
function digitRange(zeroCode: number): string[] {
  return Array.from({ length: 10 }, (_, i) => String.fromCodePoint(zeroCode + i));
}

/** Circled digits: 1–9 at U+2460…U+2468, zero at U+24EA. */
const CIRCLED_DIGITS: string[] = [
  String.fromCodePoint(0x24ea),
  ...Array.from({ length: 9 }, (_, i) => String.fromCodePoint(0x2460 + i)),
];

export const styles: Style[] = [
  // --- cursive ---
  {
    id: 'bold-script',
    name: 'Bold Script',
    category: 'cursive',
    uppercaseBase: 0x1d4d0,
    lowercaseBase: 0x1d4ea,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'script',
    name: 'Classic Script',
    category: 'cursive',
    uppercaseBase: 0x1d49c,
    lowercaseBase: 0x1d4b6,
    substitutions: {
      B: 0x212c,
      E: 0x2130,
      F: 0x2131,
      H: 0x210b,
      I: 0x2110,
      L: 0x2112,
      M: 0x2133,
      R: 0x211b,
      e: 0x212f,
      g: 0x210a,
      o: 0x2134,
    },
    digits: null,
    risk: 'uneven',
    caveat: 'Uneven',
    caseNote: null,
  },
  {
    id: 'bold-italic',
    name: 'Bold Italic',
    category: 'cursive',
    uppercaseBase: 0x1d468,
    lowercaseBase: 0x1d482,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'italic',
    name: 'Italic Script',
    category: 'cursive',
    uppercaseBase: 0x1d434,
    lowercaseBase: 0x1d44e,
    substitutions: {
      h: 0x210e,
    },
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'sans-italic',
    name: 'Handwriting',
    category: 'cursive',
    uppercaseBase: 0x1d608,
    lowercaseBase: 0x1d622,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'sans-bold-italic',
    name: 'Slanted',
    category: 'cursive',
    uppercaseBase: 0x1d63c,
    lowercaseBase: 0x1d656,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },

  // --- bold ---
  {
    id: 'bold-serif',
    name: 'Bold',
    category: 'bold',
    uppercaseBase: 0x1d400,
    lowercaseBase: 0x1d41a,
    substitutions: {},
    digits: digitRange(0x1d7ce),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans',
    category: 'bold',
    uppercaseBase: 0x1d5d4,
    lowercaseBase: 0x1d5ee,
    substitutions: {},
    digits: digitRange(0x1d7ec),
    risk: null,
    caveat: null,
    caseNote: null,
  },

  // --- bubble ---
  {
    id: 'circled',
    name: 'Circled',
    category: 'bubble',
    uppercaseBase: 0x24b6,
    lowercaseBase: 0x24d0,
    substitutions: {},
    digits: CIRCLED_DIGITS,
    risk: 'uneven',
    // U+24C2 capital M has emoji presentation (metro sign).
    caveat: 'Capital M may show as emoji',
    caseNote: null,
  },
  {
    id: 'parenthesized',
    name: 'Parenthesized',
    category: 'bubble',
    uppercaseBase: null,
    lowercaseBase: 0x249c,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: 'Capitals fold to lowercase',
  },
  {
    id: 'negative-circled',
    name: 'Filled Circled',
    category: 'bubble',
    uppercaseBase: 0x1f150,
    lowercaseBase: null,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: 'Lowercase folds to capitals',
  },

  // --- gothic ---
  {
    id: 'fraktur',
    name: 'Fraktur',
    category: 'gothic',
    uppercaseBase: 0x1d504,
    lowercaseBase: 0x1d51e,
    substitutions: {
      C: 0x212d,
      H: 0x210c,
      I: 0x2111,
      R: 0x211c,
      Z: 0x2128,
    },
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },
  {
    id: 'bold-fraktur',
    name: 'Bold Fraktur',
    category: 'gothic',
    uppercaseBase: 0x1d56c,
    lowercaseBase: 0x1d586,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caseNote: null,
  },

  // --- other ---
  // Mathematical Alphanumeric Symbols block (U+1D400-U+1D7FF), monospace set.
  // Uppercase base U+1D670, lowercase base U+1D68A, digit base U+1D7F6.
  // Verified against the block's own letter table: all 26 uppercase, all 26
  // lowercase and all 10 digits are assigned in this set with no gaps.
  {
    id: 'monospace',
    name: 'Monospace',
    category: 'other',
    uppercaseBase: 0x1d670,
    lowercaseBase: 0x1d68a,
    substitutions: {},
    digits: digitRange(0x1d7f6),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // Mathematical Alphanumeric Symbols block (U+1D400-U+1D7FF), double-struck
  // set. Uppercase base U+1D538, lowercase base U+1D552, digit base U+1D7D8.
  // Seven capitals are reserved (unassigned) in this block because Unicode
  // already had double-struck ("blackboard bold") letters for them in the
  // Letterlike Symbols block (U+2100-U+214F): C, H, N, P, Q, R, Z. All 26
  // lowercase and all 10 digits are assigned in the Mathematical block with
  // no gaps.
  {
    id: 'double-struck',
    name: 'Double-struck',
    category: 'other',
    uppercaseBase: 0x1d538,
    lowercaseBase: 0x1d552,
    substitutions: {
      C: 0x2102,
      H: 0x210d,
      N: 0x2115,
      P: 0x2119,
      Q: 0x211a,
      R: 0x211d,
      Z: 0x2124,
    },
    digits: digitRange(0x1d7d8),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // Mathematical Alphanumeric Symbols block (U+1D400-U+1D7FF), sans-serif
  // (plain, non-bold, non-italic) set. Uppercase base U+1D5A0, lowercase
  // base U+1D5BA, digit base U+1D7E2. All 26 uppercase, all 26 lowercase and
  // all 10 digits are assigned in this set with no gaps.
  {
    id: 'sans-serif',
    name: 'Sans-serif',
    category: 'other',
    uppercaseBase: 0x1d5a0,
    lowercaseBase: 0x1d5ba,
    substitutions: {},
    digits: digitRange(0x1d7e2),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // Halfwidth and Fullwidth Forms block (U+FF00-U+FFEF).
  // Uppercase base U+FF21, lowercase base U+FF41, digit base U+FF10. All 26
  // uppercase, all 26 lowercase and all 10 digits are assigned with no gaps;
  // this block exists for lossless round-trip with CJK legacy encodings.
  {
    id: 'fullwidth',
    name: 'Fullwidth',
    category: 'other',
    uppercaseBase: 0xff21,
    lowercaseBase: 0xff41,
    substitutions: {},
    digits: digitRange(0xff10),
    risk: null,
    caveat: null,
    caseNote: null,
  },
];
