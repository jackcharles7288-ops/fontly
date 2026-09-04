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
    if (style.uppercaseBase !== null) {
      return String.fromCodePoint(style.uppercaseBase + (code - UPPER_A));
    }
    // Half-covered style: fold capitals onto the lowercase alphabet that exists.
    if (style.lowercaseBase !== null) {
      const lower = String.fromCodePoint(code + 0x20);
      if (Object.prototype.hasOwnProperty.call(style.substitutions, lower)) {
        return String.fromCodePoint(style.substitutions[lower]);
      }
      return String.fromCodePoint(style.lowercaseBase + (code - UPPER_A));
    }
    return ch;
  }

  if (code >= LOWER_A && code <= LOWER_Z) {
    if (Object.prototype.hasOwnProperty.call(style.substitutions, ch)) {
      return String.fromCodePoint(style.substitutions[ch]);
    }
    if (style.lowercaseBase !== null) {
      return String.fromCodePoint(style.lowercaseBase + (code - LOWER_A));
    }
    // Half-covered style: fold lowercase onto the capital alphabet that exists.
    if (style.uppercaseBase !== null) {
      const upper = String.fromCodePoint(code - 0x20);
      if (Object.prototype.hasOwnProperty.call(style.substitutions, upper)) {
        return String.fromCodePoint(style.substitutions[upper]);
      }
      return String.fromCodePoint(style.uppercaseBase + (code - LOWER_A));
    }
    return ch;
  }

  if (code >= DIGIT_0 && code <= DIGIT_9) {
    if (style.digits === null) return ch;
    return style.digits[code - DIGIT_0];
  }

  // Style-specific punctuation overrides (upside-down maps ? to ¿, ! to ¡).
  // Existing styles declare no punctuation keys, so this branch never fires
  // for them and their output is unchanged.
  if (Object.prototype.hasOwnProperty.call(style.substitutions, ch)) {
    return String.fromCodePoint(style.substitutions[ch]);
  }

  // Accented letters, non-Latin scripts, punctuation, spaces: unconvertible,
  // so they pass through unchanged. Never guess a lookalike.
  return ch;
}

/**
 * Reverses a string by code point, keeping each combining mark fused to the
 * base character it followed. A cluster is one non-mark code point plus any
 * marks (Mn, Mc, Me) after it; only whole clusters are reordered, so a mark
 * can never land on a different letter. A mark typed at the very start of
 * the input has no base and stays a standalone cluster.
 * Never touches UTF-16 units: no str.length, no charCodeAt, no split('').
 * @param {string} text
 * @returns {string}
 */
const COMBINING_MARK = /\p{M}/u;

function reverseByCluster(text) {
  const clusters = [];
  for (const ch of text) {
    if (COMBINING_MARK.test(ch) && clusters.length > 0) {
      clusters[clusters.length - 1] += ch;
    } else {
      clusters.push(ch);
    }
  }
  clusters.reverse();
  return clusters.join('');
}

/**
 * Converts a whole string into the given style. Characters are mapped first;
 * a style with reverse: true then has its mapped output reversed by cluster.
 * @param {string} text
 * @param {import('../data/styles.js').Style} style
 * @returns {string}
 */
export function applyStyle(text, style) {
  let result = '';
  for (const ch of text) {
    result += convertChar(ch, style);
  }
  if (style.reverse) {
    return reverseByCluster(result);
  }
  return result;
}

/**
 * Cross-kind combination: one alphabet plus one decoration.
 * Style first, wrap second. Neither applier inspects the wrapped text.
 * @param {string} text
 * @param {import('../data/styles.js').Style} style
 * @param {import('../data/decorations.ts').Decoration} decoration
 * @returns {string}
 */
export function applyCombination(text, style, decoration) {
  return decoration.prefix + applyStyle(text, style) + decoration.suffix;
}

/**
 * Returns both character counts for a string: the code point count (what a
 * person counts as "characters") and the UTF-16 length (Plane 1 letters are
 * two code units each). Never collapse this into a single str.length answer.
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
