// Pure Unicode conversion. No DOM, no document, no window, no listeners.
// Iterates by code point (for...of) so astral-plane characters are never
// split. Never uses charCodeAt or string indexing with [i].

const UPPER_A = 0x41;
const UPPER_Z = 0x5a;
const LOWER_A = 0x61;
const LOWER_Z = 0x7a;
const DIGIT_0 = 0x30;
const DIGIT_9 = 0x39;

/**
 * @param {string} ch a single code point
 * @param {import('../data/styles.js').Style} style
 * @returns {string}
 */
function convertChar(ch, style) {
  const code = ch.codePointAt(0);
  if (code === undefined) return ch;

  if (code >= UPPER_A && code <= UPPER_Z) {
    if (Object.prototype.hasOwnProperty.call(style.substitutions, ch)) {
      return String.fromCodePoint(style.substitutions[ch]);
    }
    return String.fromCodePoint(style.uppercaseBase + (code - UPPER_A));
  }

  if (code >= LOWER_A && code <= LOWER_Z) {
    if (Object.prototype.hasOwnProperty.call(style.substitutions, ch)) {
      return String.fromCodePoint(style.substitutions[ch]);
    }
    return String.fromCodePoint(style.lowercaseBase + (code - LOWER_A));
  }

  if (code >= DIGIT_0 && code <= DIGIT_9) {
    if (style.digits === null) return ch;
    return style.digits[code - DIGIT_0];
  }

  // Accented letters, non-Latin scripts, punctuation, spaces: unconvertible,
  // so they pass through unchanged. Never guess a lookalike.
  return ch;
}

/**
 * Converts a whole string into the given style.
 * @param {string} text
 * @param {import('../data/styles.js').Style} style
 * @returns {string}
 */
export function applyStyle(text, style) {
  let result = '';
  for (const ch of text) {
    result += convertChar(ch, style);
  }
  return result;
}

/**
 * Returns both character counts for a string: the code point count (what a
 * person counts as "characters") and the UTF-16 length (what platforms like
 * X/Twitter count, since styled letters are two code units). Never collapse
 * this into a single str.length answer.
 * @param {string} text
 * @returns {{ codePoints: number, utf16Length: number }}
 */
export function countCharacters(text) {
  let codePoints = 0;
  for (const _ch of text) {
    codePoints += 1;
  }
  return { codePoints, utf16Length: text.length };
}
