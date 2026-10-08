export type Risk = 'safe' | 'uneven' | 'check-old-devices';

export interface Style {
  id: string;
  name: string;
  categories: string[];
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
  /**
   * When true, applyStyle inserts U+0020 between adjacent mapped clusters
   * (base character plus its combining marks). Unset means no extra spaces.
   * Used by styles like spaced-out where the spacing is the style.
   */
  spaced?: boolean;
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

/** Negative circled digits: 1–9 at U+2776…U+277E, zero at U+24FF. */
const NEGATIVE_CIRCLED_DIGITS: string[] = [
  String.fromCodePoint(0x24ff),
  ...Array.from({ length: 9 }, (_, i) => String.fromCodePoint(0x2776 + i)),
];

/** Visitor-facing note shown when a style leaves digits unchanged. */
export const DIGITS_NOTE = 'Numbers stay plain.';

/** Label for the interactive builder entrance and its section heading. */
export const BUILDER_LABEL = 'Make your own';

// Shared by Flipped and Upside Down. Unchanged letters are listed so the two
// cards cannot drift apart. Digits 1 and 5 have no approved substitute.
// U+218C and U+218D are unassigned and are not used.
const turnedSubstitutions: Record<string, number> = {
  A: 0x2200, B: 0x15fa, C: 0x2183, D: 0x25d6, E: 0x018e, F: 0x2132, G: 0x2141, // B is ᗺ
  H: 0x0048, I: 0x0049, J: 0x017f, K: 0x22ca, L: 0x2142, M: 0x0057, N: 0x1d0e,
  O: 0x004f, P: 0x0500, Q: 0x038c, R: 0x1d1a, S: 0x0053, T: 0x22a5, U: 0x2229,
  V: 0x1d27, W: 0x004d, X: 0x0058, Y: 0x2144, Z: 0x005a,
  a: 0x0250, b: 0x0071, c: 0x0254, d: 0x0070, e: 0x01dd, f: 0x025f, g: 0x0183,
  h: 0x0265, i: 0x0131, j: 0x027e, k: 0x029e, l: 0x0283, m: 0x026f, n: 0x0075,
  o: 0x006f, p: 0x0064, q: 0x0062, r: 0x0279, s: 0x0073, t: 0x0287, u: 0x006e,
  v: 0x028c, w: 0x028d, x: 0x0078, y: 0x028e, z: 0x007a,
  '?': 0x00bf,
  '!': 0x00a1,
};
const turnedDigits: string[] = [
  '0',
  '1',
  'ᘔ',
  'Ɛ',
  String.fromCodePoint(0x152d),
  '5',
  '9',
  String.fromCodePoint(0x2c62),
  '8',
  '6',
];
const turnedCaveatNote =
  'Some capitals and digits 2, 3, 4 and 7 use borrowed characters, so their appearance can vary by device. Digits 1 and 5 stay plain.';

export const styles: Style[] = [
  // --- cursive ---
  {
    id: 'bold-script',
    name: 'Bold Script',
    categories: ['cool-fonts', 'cursive', 'bold', 'fancy', 'cute', 'freaky'],
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
    categories: ['cool-fonts', 'cursive', 'fancy', 'cute'],
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
    categories: ['cool-fonts', 'cursive', 'italic', 'bold', 'fancy', 'bold-italic'],
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
    categories: ['cool-fonts', 'cursive', 'italic', 'fancy', 'bold-italic'],
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
    categories: ['cool-fonts', 'italic', 'cursive', 'bold-italic'],
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
    categories: ['cool-fonts', 'italic', 'bold', 'cursive', 'bold-italic'],
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
    categories: ['cool-fonts', 'bold', 'number', 'bold-italic'],
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
    categories: ['cool-fonts', 'bold', 'number', 'bold-italic'],
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
    categories: ['cool-fonts', 'bubble', 'number', 'aesthetic', 'cute'],
    uppercaseBase: 0x24b6,
    lowercaseBase: 0x24d0,
    substitutions: {},
    digits: CIRCLED_DIGITS,
    risk: 'uneven',
    // U+24C2 capital M has emoji presentation (metro sign).
    caveat: 'Emoji',
    caveatNote:
      'Unicode records the circled capital M at U+24C2 as an emoji character.',
    caseNote: null,
  },
  {
    id: 'parenthesized',
    name: 'Parenthesized',
    categories: ['cool-fonts', 'bubble'],
    uppercaseBase: null,
    lowercaseBase: 0x249c,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: 'Lowercase only',
    caseNote: 'Capitals fold to lowercase',
  },
  // Enclosed Alphanumeric Supplement (U+1F100-U+1F1FF), parenthesized Latin
  // capital letters A-Z at U+1F110-U+1F129. Capitals only; lowercase folds onto
  // these. Distinct from parenthesized small letters at U+249C. Code points
  // verified assigned, sequential, no gaps.
  {
    id: 'parenthesized-caps',
    name: 'Parenthesized Caps',
    categories: ['cool-fonts', 'bubble', 'cute'],
    uppercaseBase: 0x1f110,
    lowercaseBase: null,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: 'Caps only',
    caseNote: 'Lowercase folds to capitals',
  },
  {
    id: 'negative-circled',
    name: 'Filled Circled',
    categories: ['cool-fonts', 'bubble', 'cute'],
    uppercaseBase: 0x1f150,
    lowercaseBase: null,
    substitutions: {},
    digits: NEGATIVE_CIRCLED_DIGITS,
    risk: null,
    caveat: 'Caps only',
    caseNote: 'Lowercase folds to capitals',
  },

  // --- gothic ---
  {
    id: 'fraktur',
    name: 'Fraktur',
    categories: ['cool-fonts', 'gothic', 'fancy'],
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
    categories: ['cool-fonts', 'gothic', 'bold', 'fancy'],
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
    categories: ['cool-fonts', 'aesthetic', 'number'],
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
    categories: ['cool-fonts', 'fancy', 'number', 'aesthetic', 'cute'],
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
    categories: ['cool-fonts', 'number'],
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
    categories: ['cool-fonts', 'aesthetic', 'number', 'cute'],
    uppercaseBase: 0xff21,
    lowercaseBase: 0xff41,
    substitutions: {},
    digits: digitRange(0xff10),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // Halfwidth and Fullwidth Forms block (U+FF00–U+FFEF), same bases as
  // fullwidth: uppercase U+FF21, lowercase U+FF41, digit U+FF10. Two
  // uppercase substitutions from Greek and Coptic (U+0370–U+03FF), sourced
  // from the Unicode 17.0 Greek and Coptic chart
  // (https://www.unicode.org/charts/PDF/U0370.pdf): A → U+039B GREEK CAPITAL
  // LETTER LAMDA, E → U+039E GREEK CAPITAL LETTER XI. Lowercase a/e stay
  // fullwidth; they have no substitution keys.
  {
    id: 'vaporwave-greek',
    name: 'Vaporwave Greek',
    categories: ['cool-fonts', 'aesthetic'],
    uppercaseBase: 0xff21,
    lowercaseBase: 0xff41,
    substitutions: {
      A: 0x039b,
      E: 0x039e,
    },
    digits: digitRange(0xff10),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // Halfwidth and Fullwidth Forms block (U+FF00–U+FFEF), same bases as
  // fullwidth. Two uppercase substitutions from Geometric Shapes
  // (U+25A0–U+25FF), sourced from the Unicode Geometric Shapes names list
  // (https://www.unicode.org/charts/nameslist/n_25A0.html): A → U+25B2 BLACK
  // UP-POINTING TRIANGLE, E → U+25BC BLACK DOWN-POINTING TRIANGLE. These are
  // the filled variants, not WHITE UP/DOWN-POINTING TRIANGLE (U+25B3/U+25BD).
  // A and E exist in the fullwidth block; the triangles are the style, not a
  // reserved-slot fill, so there is no gap to declare. Silence is the honest
  // default (generator.mdc badge rule).
  {
    id: 'vaporwave-triangle',
    name: 'Vaporwave Triangle',
    categories: ['cool-fonts', 'aesthetic'],
    uppercaseBase: 0xff21,
    lowercaseBase: 0xff41,
    substitutions: {
      A: 0x25b2,
      E: 0x25bc,
    },
    digits: digitRange(0xff10),
    risk: null,
    caveat: null,
    caseNote: null,
  },
  // No alphabet mapping. Letters, digits and punctuation pass through
  // unchanged (uppercaseBase, lowercaseBase and substitutions empty, digits
  // null). applyStyle inserts U+0020 SPACE between adjacent clusters when
  // spaced is true. caveatNote declares the passthrough so it is not silent
  // (generator.mdc: a letter that stays plain must be recorded).
  {
    id: 'spaced-out',
    name: 'Spaced Out',
    categories: ['cool-fonts', 'aesthetic'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: null,
    caveatNote: 'Letters stay plain. The style is a space between each character.',
    caseNote: null,
    spaced: true,
  },

  // --- small ---
  // Phonetic Extensions (U+1D00-U+1D7F), Latin Extended-B, IPA Extensions and
  // Latin Extended Additional. Small capital letters, all Basic Multilingual
  // Plane. Both input cases map to these small-capital forms. Code points
  // verified assigned against the Unicode charts. x has NO small-capital form,
  // so x and X stay plain. This site ships no small-capital Q (U+A7AF is
  // Unicode 11.0 and renders as tofu), so q and Q stay plain. Digits have no
  // small-capital form, stay plain.
  {
    id: 'small-caps',
    name: 'Small Caps',
    categories: ['cool-fonts', 'small', 'cute'],
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
      'Unicode has no small-capital X, so x stays plain. This site ships no small-capital Q, so q stays plain. Capitals and lowercase both appear as small capitals.',
    caseNote: null,
  },
  // Phonetic Extensions, Superscripts and Subscripts (U+2070-U+209C), and
  // Spacing Modifier Letters. Superscript modifier letters, all BMP. Both input
  // cases map to these. Code points verified assigned against the Unicode
  // charts. q has no superscript form, stays plain.
  {
    id: 'superscript',
    name: 'Superscript',
    categories: ['cool-fonts', 'small', 'number'],
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
    categories: ['cool-fonts', 'small', 'number'],
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
    categories: ['cool-fonts', 'bubble', 'aesthetic', 'cute'],
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
  // Enclosed Alphanumeric Supplement (U+1F100-U+1F1FF), negative squared Latin
  // capital letters A-Z at U+1F170-U+1F189. Capitals only; lowercase folds onto
  // these. U+1F170, U+1F171, U+1F17E and U+1F17F are listed as emoji characters.
  // Code points verified assigned, sequential, no gaps.
  {
    id: 'negative-squared',
    name: 'Filled Squared',
    categories: ['cool-fonts', 'bubble'],
    uppercaseBase: 0x1f170,
    lowercaseBase: null,
    substitutions: {},
    digits: null,
    risk: null,
    caveat: 'Caps only',
    caveatNote:
      'Unicode lists U+1F170, U+1F171, U+1F17E and U+1F17F as emoji characters.',
    caseNote: 'Lowercase folds to capitals',
  },

  // --- other ---
  // Flipped and Upside Down share turnedSubstitutions and turnedDigits.
  // Letters come from IPA, letterlike symbols, maths operators, Greek,
  // Cyrillic and Canadian Aboriginal Syllabics. Punctuation other than
  // ? and ! passes through. Upside Down then reverses the line.
  {
    id: 'flipped',
    name: 'Flipped',
    categories: ['cool-fonts', 'upside-down', 'number'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: turnedSubstitutions,
    digits: turnedDigits,
    risk: 'check-old-devices',
    caveat: 'Partial',
    caveatNote: turnedCaveatNote + ' This card does not reverse the line.',
    caseNote: null,
  },
  {
    id: 'upside-down',
    name: 'Upside Down',
    categories: ['cool-fonts', 'upside-down', 'number'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: turnedSubstitutions,
    digits: turnedDigits,
    risk: 'check-old-devices',
    caveat: 'Partial',
    caveatNote:
      turnedCaveatNote +
      ' The text is reversed so it reads when the page is turned upside down.',
    caseNote: null,
    reverse: true,
  },
  {
    id: 'coptic',
    name: 'Coptic',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x2c80, a: 0x2c81,
      B: 0x2c82, b: 0x2c83,
      D: 0x2c86, d: 0x2c87,
      E: 0x2c88, e: 0x2c89,
      F: 0x2caa, f: 0x2cab,
      G: 0x2c84, g: 0x2c85,
      H: 0x2c8e, h: 0x2c8f,
      I: 0x2c92, i: 0x2c93,
      K: 0x2c94, k: 0x2c95,
      L: 0x2c96, l: 0x2c97,
      M: 0x2c98, m: 0x2c99,
      N: 0x2c9a, n: 0x2c9b,
      O: 0x2c9e, o: 0x2c9f,
      P: 0x2ca0, p: 0x2ca1,
      R: 0x2ca2, r: 0x2ca3,
      S: 0x2ca4, s: 0x2ca5,
      T: 0x2ca6, t: 0x2ca7,
      W: 0x2cb0, w: 0x2cb1,
      X: 0x2cac, x: 0x2cad,
      Y: 0x2ca8, y: 0x2ca9,
      Z: 0x2c8c, z: 0x2c8d,
    },
    digits: null,
    risk: 'safe',
    caveat: null,
    caveatNote: null,
    caseNote: 'Letters c, j, q, u and v have no Coptic shape and stay plain.',
  },
  {
    id: 'syllabics',
    name: 'Syllabics',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x15e9, a: 0x15e9,
      B: 0x15f7, b: 0x15f7,
      C: 0x1455, c: 0x1455,
      D: 0x15ea, d: 0x15ea,
      E: 0x15f4, e: 0x15f4,
      F: 0x15b4, f: 0x15b4,
      G: 0x161c, g: 0x161c,
      H: 0x157c, h: 0x157c,
      J: 0x148d, j: 0x148d,
      L: 0x14aa, l: 0x14aa,
      M: 0x15f0, m: 0x15f0,
      N: 0x144e, n: 0x144e,
      O: 0x15dd, o: 0x15dd,
      P: 0x146d, p: 0x146d,
      R: 0x1587, r: 0x1587,
      S: 0x1515, s: 0x1515,
      U: 0x144c, u: 0x144c,
      V: 0x142f, v: 0x142f,
      W: 0x15ef, w: 0x15ef,
      X: 0x166d, x: 0x166d,
    },
    digits: null,
    risk: 'safe',
    caveat: null,
    caveatNote: null,
    caseNote: 'A single set of shapes. Capitals and lowercase look the same. Letters i, k, q, t, y and z stay plain.',
  },
  {
    id: 'cherokee',
    name: 'Cherokee',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x13aa, a: 0x13aa,
      B: 0x13f4, b: 0x13f4,
      C: 0x13df, c: 0x13df,
      D: 0x13a0, d: 0x13a0,
      E: 0x13ac, e: 0x13ac,
      G: 0x13c0, g: 0x13c0,
      H: 0x13bb, h: 0x13bb,
      J: 0x13ab, j: 0x13ab,
      K: 0x13e6, k: 0x13e6,
      L: 0x13de, l: 0x13de,
      M: 0x13b7, m: 0x13b7,
      O: 0x13a3, o: 0x13a3,
      P: 0x13e2, p: 0x13e2,
      R: 0x13d2, r: 0x13d2,
      S: 0x13d5, s: 0x13d5,
      T: 0x13a2, t: 0x13a2,
      U: 0x13cc, u: 0x13cc,
      V: 0x13c9, v: 0x13c9,
      W: 0x13d4, w: 0x13d4,
      Y: 0x13bd, y: 0x13bd,
      Z: 0x13c3, z: 0x13c3,
    },
    digits: null,
    risk: 'safe',
    caveat: null,
    caveatNote: null,
    caseNote: 'A single set of shapes. Capitals and lowercase look the same. Letters f, i, n, q and x stay plain.',
  },
  {
    id: 'yi',
    name: 'Yi',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0xa34f, a: 0xa34f,
      B: 0xa0f3, b: 0xa0f3,
      E: 0xa35f, e: 0xa35f,
      I: 0xa024, i: 0xa024,
      K: 0xa018, k: 0xa018,
      L: 0xa492, l: 0xa492,
      M: 0xa0b5, m: 0xa0b5,
      R: 0xa2ea, r: 0xa2ea,
      S: 0xa317, s: 0xa317,
      T: 0xa4c4, t: 0xa4c4,
      W: 0xa150, w: 0xa150,
      Y: 0xa329, y: 0xa329,
    },
    digits: null,
    risk: 'check-old-devices',
    caveat: 'Some older phones show empty boxes',
    caveatNote: 'The Yi block is not in every system font.',
    caseNote: 'A single set of shapes. Only twelve letters have a Yi form, the rest stay plain.',
  },
  {
    id: 'zhuyin-mix',
    name: 'Zhuyin Mix',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x5342, a: 0x5342,
      B: 0x4e43, b: 0x4e43,
      E: 0x4e47, e: 0x4e47,
      I: 0xff89, i: 0xff89,
      K: 0x310e, k: 0x310e,
      L: 0x3125, l: 0x3125,
      M: 0x2f56, m: 0x2f56,
      R: 0x5c3a, r: 0x5c3a,
      S: 0x4e02, s: 0x4e02,
      T: 0x3112, t: 0x3112,
      W: 0x2f2d, w: 0x2f2d,
      Y: 0x311a, y: 0x311a,
    },
    digits: null,
    risk: 'uneven',
    caveat: 'Characters sit at different widths',
    caveatNote:
      'These shapes come from four blocks: CJK Unified Ideographs, Bopomofo, Kangxi Radicals and Halfwidth Katakana. Line height varies.',
    caseNote: 'A single set of shapes. Only twelve letters have a form here, the rest stay plain.',
  },
  {
    id: 'old-italic',
    name: 'Old Italic',
    categories: ['cool-fonts', 'cute', 'fancy'],
    uppercaseBase: null,
    lowercaseBase: null,
    substitutions: {
      A: 0x10300, a: 0x10300,
      B: 0x10301, b: 0x10301,
      C: 0x10302, c: 0x10302,
      D: 0x10303, d: 0x10303,
      E: 0x10304, e: 0x10304,
      H: 0x10307, h: 0x10307,
      I: 0x10309, i: 0x10309,
      K: 0x1030a, k: 0x1030a,
      L: 0x1030b, l: 0x1030b,
      M: 0x1030c, m: 0x1030c,
      N: 0x1030d, n: 0x1030d,
      O: 0x1030f, o: 0x1030f,
      R: 0x10310, r: 0x10310,
      S: 0x10314, s: 0x10314,
      T: 0x10315, t: 0x10315,
      U: 0x10316, u: 0x10316,
      X: 0x10317, x: 0x10317,
      Z: 0x10306, z: 0x10306,
    },
    digits: null,
    risk: 'check-old-devices',
    caveat: 'Each letter counts as two characters',
    caveatNote:
      'Old Italic sits above the basic plane, so bio counters on Instagram and X count every letter twice.',
    caseNote: 'A single set of shapes. Letters f, g, j, p, q, v, w and y stay plain.',
  },
];
