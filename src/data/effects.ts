// Effects are combining marks, not alphabets or wrappers. An effect adds a
// combining mark after each character of the visitor's text; the letters
// themselves are never converted. Nothing here belongs in styles.ts or
// decorations.ts and nothing here counts in styles.length.

export interface Effect {
  id: string;
  name: string;
  /** The combining mark appended after each character. */
  mark: string;
  /** When true, spaces also receive the mark so lines look continuous. */
  applyToSpaces: boolean;
  /**
   * Quiet public caveat badge, same mechanism and wording style as a style's
   * caveat. null = no badge.
   */
  caveat: string | null;
  /**
   * Sentence-length caveat under the card output. null = no note.
   */
  caveatNote: string | null;
}

export const effects: Effect[] = [
  // Combining Diacritical Marks block (U+0300-U+036F).
  // Overlay and line marks applied to spaces so they look continuous.
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    mark: '̶',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'short-strike',
    name: 'Short Strike',
    mark: '̵',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'slash',
    name: 'Slash',
    mark: '̸',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'short-slash',
    name: 'Short Slash',
    mark: '̷',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'tilde-overlay',
    name: 'Tilde Overlay',
    mark: '̴',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'underline',
    name: 'Underline',
    mark: '̲',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'double-underline',
    name: 'Double Underline',
    mark: '̳',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'overline',
    name: 'Overline',
    mark: '̅',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'double-overline',
    name: 'Double Overline',
    mark: '̿',
    applyToSpaces: true,
    caveat: null,
    caveatNote: null,
  },
  // Combining Diacritical Marks block (U+0300-U+036F).
  // Diacritics left bare on spaces.
  {
    id: 'dot-above',
    name: 'Dot Above',
    mark: '̇',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'dot-below',
    name: 'Dot Below',
    mark: '̣',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'diaeresis',
    name: 'Diaeresis',
    mark: '̈',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'ring-above',
    name: 'Ring Above',
    mark: '̊',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'caron',
    name: 'Caron',
    mark: '̌',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'acute',
    name: 'Acute',
    mark: '́',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'grave',
    name: 'Grave',
    mark: '̀',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'x-above',
    name: 'X Above',
    mark: '̽',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'line-above',
    name: 'Line Above',
    mark: '̍',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  // Combining Diacritical Marks for Symbols block (U+20D0-U+20FF).
  // Enclosing marks are designed for a single character.
  {
    id: 'enclosing-circle',
    name: 'Enclosing Circle',
    mark: '⃝',
    applyToSpaces: false,
    caveat: 'Uneven',
    caveatNote:
      'Unicode designs enclosing marks for one character at a time, so a whole word may look uneven in some fonts.',
  },
  {
    id: 'enclosing-square',
    name: 'Enclosing Square',
    mark: '⃞',
    applyToSpaces: false,
    caveat: 'Uneven',
    caveatNote:
      'Unicode designs enclosing marks for one character at a time, so a whole word may look uneven in some fonts.',
  },
  {
    id: 'enclosing-diamond',
    name: 'Enclosing Diamond',
    mark: '⃟',
    applyToSpaces: false,
    caveat: 'Uneven',
    caveatNote:
      'Unicode designs enclosing marks for one character at a time, so a whole word may look uneven in some fonts.',
  },
  // Combining Diacritical Marks block (U+0300-U+036F).
  // Accents above the letter, one mark per character, spaces left bare.
  {
    id: 'circumflex',
    name: 'Circumflex',
    mark: '̂',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'tilde',
    name: 'Tilde',
    mark: '̃',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'breve',
    name: 'Breve',
    mark: '̆',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'hook-above',
    name: 'Hook Above',
    mark: '̉',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'double-acute',
    name: 'Double Acute',
    mark: '̋',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'double-grave',
    name: 'Double Grave',
    mark: '̏',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'inverted-breve',
    name: 'Inverted Breve',
    mark: '̑',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  // Combining Diacritical Marks block (U+0300-U+036F).
  // Marks below the letter, one mark per character, spaces left bare.
  {
    id: 'diaeresis-below',
    name: 'Diaeresis Below',
    mark: '̤',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'ring-below',
    name: 'Ring Below',
    mark: '̥',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'caron-below',
    name: 'Caron Below',
    mark: '̬',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'circumflex-below',
    name: 'Circumflex Below',
    mark: '̭',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'breve-below',
    name: 'Breve Below',
    mark: '̮',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'tilde-below',
    name: 'Tilde Below',
    mark: '̰',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'x-below',
    name: 'X Below',
    mark: '͓',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'asterisk-below',
    name: 'Asterisk Below',
    mark: '͙',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  {
    id: 'zigzag-above',
    name: 'Zigzag Above',
    mark: '͛',
    applyToSpaces: false,
    caveat: null,
    caveatNote: null,
  },
  // Combining Diacritical Marks for Symbols block (U+20D0-U+20FF).
  // An enclosing mark, category Me — same caveat as the other enclosing
  // effects, word for word.
  {
    id: 'enclosing-circle-backslash',
    name: 'Enclosing Circle Backslash',
    mark: '⃠',
    applyToSpaces: false,
    caveat: 'Uneven',
    caveatNote:
      'Unicode designs enclosing marks for one character at a time, so a whole word may look uneven in some fonts.',
  },
];

/**
 * Appends the effect mark after each character. Letters are never converted.
 * Uses for...of so characters outside the BMP are never split.
 * @param text
 * @param effect
 */
export function applyEffect(text: string, effect: Effect): string {
  let result = '';
  for (const ch of text) {
    if (!effect.applyToSpaces && ch === ' ') {
      result += ch;
    } else {
      result += ch + effect.mark;
    }
  }
  return result;
}
