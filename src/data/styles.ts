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
   * Sentence-length caveat under the card output. null = no note.
   * Short badge text lives in `caveat`; full Unicode facts live here.
   */
  caveatNote?: string | null;
  /**
   * Quiet case-fold disclosure when one case is mapped onto the other.
   * null = full alphabet, no note.
   */
  caseNote: string | null;
  /**
   * When true, applyStyle reverses the mapped output by code-point cluster
   * (base character plus its combining marks). Unset means no reversal.
   * Used by styles like upside-down that only read correctly backwards.
   */
  reverse?: boolean;
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
    caveat: 'Emoji',
    caveatNote:
      'Unicode records the circled capital M at U+24C2 as an emoji character, so some apps draw it as a coloured symbol instead of a letter.',
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
    caveat: 'Lowercase only',
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
    caveat: 'Caps only',
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

  // --- small ---
  // Phonetic Extensions (U+1D00-U+1D7F), Latin Extended-B, IPA Extensions and
  // Latin Extended Additional. Small capital letters, all Basic Multilingual
  // Plane. Both input cases map to these small-capital forms. Code points
  // verified assigned against the Unicode charts. x has NO small-capital form,
  // so x and X stay plain. Digits have no small-capital form, stay plain.
  {
    id: 'small-caps',
    name: 'Small Caps',
    category: 'small',
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x1d00, a: 0x1d00,
      B: 0x0299, b: 0x0299,
      C: 0x1d04, c: 0x1d04,
      D: 0x1d05, d: 0x1d05,
      E: 0x1d07, e: 0x1d07,
      F: 0xa730, f: 0xa730,
      G: 0x0262, g: 0x0262,
      H: 0x029c, h: 0x029c,
      I: 0x026a, i: 0x026a,
      J: 0x1d0a, j: 0x1d0a,
      K: 0x1d0b, k: 0x1d0b,
      L: 0x029f, l: 0x029f,
      M: 0x1d0d, m: 0x1d0d,
      N: 0x0274, n: 0x0274,
      O: 0x1d0f, o: 0x1d0f,
      P: 0x1d18, p: 0x1d18,
      Q: 0xa7af, q: 0xa7af,
      R: 0x0280, r: 0x0280,
      S: 0xa731, s: 0xa731,
      T: 0x1d1b, t: 0x1d1b,
      U: 0x1d1c, u: 0x1d1c,
      V: 0x1d20, v: 0x1d20,
      W: 0x1d21, w: 0x1d21,
      Y: 0x028f, y: 0x028f,
      Z: 0x1d22, z: 0x1d22,
    },
    digits: null,
    risk: null,
    caveat: 'Partial',
    caveatNote:
      'Unicode has no small-capital X, so x stays plain. Capitals and lowercase both appear as small capitals.',
    caseNote: null,
  },
  // Phonetic Extensions, Superscripts and Subscripts (U+2070-U+209C), and
  // Spacing Modifier Letters. Superscript modifier letters, all BMP. Both input
  // cases map to these. Code points verified assigned against the Unicode
  // charts. q has no superscript form, stays plain.
  {
    id: 'superscript',
    name: 'Superscript',
    category: 'small',
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x1d43, a: 0x1d43,
      B: 0x1d47, b: 0x1d47,
      C: 0x1d9c, c: 0x1d9c,
      D: 0x1d48, d: 0x1d48,
      E: 0x1d49, e: 0x1d49,
      F: 0x1da0, f: 0x1da0,
      G: 0x1d4d, g: 0x1d4d,
      H: 0x02b0, h: 0x02b0,
      I: 0x2071, i: 0x2071,
      J: 0x02b2, j: 0x02b2,
      K: 0x1d4f, k: 0x1d4f,
      L: 0x02e1, l: 0x02e1,
      M: 0x1d50, m: 0x1d50,
      N: 0x207f, n: 0x207f,
      O: 0x1d52, o: 0x1d52,
      P: 0x1d56, p: 0x1d56,
      R: 0x02b3, r: 0x02b3,
      S: 0x02e2, s: 0x02e2,
      T: 0x1d57, t: 0x1d57,
      U: 0x1d58, u: 0x1d58,
      V: 0x1d5b, v: 0x1d5b,
      W: 0x02b7, w: 0x02b7,
      X: 0x02e3, x: 0x02e3,
      Y: 0x02b8, y: 0x02b8,
      Z: 0x1dbb, z: 0x1dbb,
    },
    digits: [
      String.fromCodePoint(0x2070),
      String.fromCodePoint(0x00b9),
      String.fromCodePoint(0x00b2),
      String.fromCodePoint(0x00b3),
      ...Array.from({ length: 6 }, (_, i) => String.fromCodePoint(0x2074 + i)),
    ],
    risk: null,
    caveat: 'Partial',
    caveatNote:
      'Unicode has no superscript q, so q stays plain. Raised letters are lowercase forms, so capitals are not preserved.',
    caseNote: null,
  },
  // Superscripts and Subscripts (U+2070-U+209C), Phonetic Extensions and Latin
  // Extended-C. Subscript modifier letters, all BMP. Both input cases map to
  // these. Code points verified assigned against the Unicode charts. Only the
  // seventeen letters listed exist; b, c, d, f, g, q, w, y and z stay plain.
  {
    id: 'subscript',
    name: 'Subscript',
    category: 'small',
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x2090, a: 0x2090,
      E: 0x2091, e: 0x2091,
      H: 0x2095, h: 0x2095,
      I: 0x1d62, i: 0x1d62,
      J: 0x2c7c, j: 0x2c7c,
      K: 0x2096, k: 0x2096,
      L: 0x2097, l: 0x2097,
      M: 0x2098, m: 0x2098,
      N: 0x2099, n: 0x2099,
      O: 0x2092, o: 0x2092,
      P: 0x209a, p: 0x209a,
      R: 0x1d63, r: 0x1d63,
      S: 0x209b, s: 0x209b,
      T: 0x209c, t: 0x209c,
      U: 0x1d64, u: 0x1d64,
      V: 0x1d65, v: 0x1d65,
      X: 0x2093, x: 0x2093,
    },
    digits: digitRange(0x2080),
    risk: null,
    caveat: 'Partial',
    caveatNote:
      'Nine letters have no subscript form in Unicode, so b, c, d, f, g, q, w, y and z stay plain. Lowered letters are lowercase forms, so capitals are not preserved.',
    caseNote: null,
  },

  // --- bubble ---
  // Enclosed Alphanumeric Supplement (U+1F100-U+1F1FF), squared Latin capital
  // letters A-Z at U+1F130-U+1F149. Squared capitals only; both input cases map
  // to these. Code points verified assigned and free of emoji presentation
  // against the Unicode charts (not the negative squared range U+1F170-).
  {
    id: 'squared',
    name: 'Squared',
    category: 'bubble',
    uppercaseBase: 0x1f130,
    lowercaseBase: null,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: 'Caps only',
    caveatNote:
      "Unicode's squared letters are capitals only, so lowercase letters appear as squared capitals.",
    caseNote: null,
  },

  // --- other ---
  // Upside-down: turned Latin letters (IPA/Phonetic Extensions), turned
  // capitals from Letterlike Symbols (U+2132, U+2141, U+2142), FOR ALL U+2200
  // (a turned A by design), UP TACK U+22A5 and INTERSECTION U+2229 (the
  // standard flipped T and U), reversed E U+018E, open letters U+0186/U+0254,
  // open E U+0190 as flipped 3, turned capital V U+0245, turned sans-serif
  // capital Y U+2144, and the 6/9 swap. Every target is a real code point
  // used for exactly this shape; nothing is borrowed from an unrelated
  // script (no Deseret, no Greek, no Canadian syllabics).
  // This site ships no flipped form for capitals B, D, J, K, Q, R or digits
  // 2, 4, 5, 7 — those pass through unchanged and the card says so. (Turned
  // capital K U+A7B0 and turned capital T U+A7B1 exist since Unicode 7.0 but
  // are held back on font coverage; T currently uses UP TACK.)
  // H, I, N, O, S, X, Z, l, o, s, x, z, 0, 1, 8 are rotationally symmetric.
  // Punctuation: only ? -> U+00BF and ! -> U+00A1 are mapped, the genuine
  // inverted marks encoded in Latin-1 for this purpose. The period, quote
  // and comma are left unchanged: U+02D9 is a spacing accent, not a period,
  // and swapping comma/apostrophe corrupts real words such as "don't".
  {
    id: 'upside-down',
    name: 'Upside Down',
    category: 'other',
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x2200,
      C: 0x0186,
      E: 0x018e,
      F: 0x2132,
      G: 0x2141,
      L: 0x2142,
      M: 0x0057,
      P: 0x0064,
      T: 0x22a5,
      U: 0x2229,
      V: 0x0245,
      W: 0x004d,
      Y: 0x2144,
      a: 0x0250,
      b: 0x0071,
      c: 0x0254,
      d: 0x0070,
      e: 0x01dd,
      f: 0x025f,
      g: 0x0183,
      h: 0x0265,
      i: 0x1d09,
      j: 0x027e,
      k: 0x029e,
      m: 0x026f,
      n: 0x0075,
      p: 0x0064,
      q: 0x0062,
      r: 0x0279,
      t: 0x0287,
      u: 0x006e,
      v: 0x028c,
      w: 0x028d,
      y: 0x028e,
      '?': 0x00bf,
      '!': 0x00a1,
    },
    digits: ['0', '1', '2', 'Ɛ', '4', '5', '9', '7', '8', '6'],
    risk: null,
    caveat: 'Partial',
      caveatNote:
        'This site ships no flipped form for capitals B, D, J, K, Q and R or for digits 2, 4, 5 and 7, so those stay plain. The text is reversed so it reads when the page is turned upside down.',
    caseNote: null,
    reverse: true,
  },
];
