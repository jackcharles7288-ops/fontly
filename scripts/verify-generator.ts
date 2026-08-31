// Development-only verification tool. Run from the terminal:
//   npx tsx scripts/verify-generator.ts
// Never imported by any page or shipped to the browser.

import { styles, type Style } from '../src/data/styles.ts';
import { decorations, applyDecoration } from '../src/data/decorations.ts';
import { effects, applyEffect } from '../src/data/effects.ts';
import { applyStyle, countCharacters } from '../src/scripts/generator.js';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const PASS_THROUGH_SAMPLE = 'H\u00e9llo \u00f1 \u65e5\u672c 42 !?';
const REPLACEMENT_CHARACTER_CODE_POINT = 0xfffd;

type CharKind = 'uppercase' | 'lowercase' | 'digit';

interface Failure {
  subject: string;
  cause: string;
}

function codePointHex(ch: string): string {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return 'U+????';
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

const failures: Failure[] = [];

/**
 * Checks one generated character against the two required failure causes:
 * it must never be U+FFFD, and it must never pass through unchanged unless
 * that is a declared, intentional behaviour of this style.
 *
 * "Declared" is read broadly, matching what the rest of this codebase
 * already treats as an honest disclosure of a gap:
 *   - the plain letter has an entry in `substitutions`
 *   - the style carries a public `caveat` badge
 *   - the style carries a `caseNote` (whole-case folding disclosure)
 *   - for digits only, `digits === null` is itself the declaration that
 *     this style has no digits and digits pass through unchanged
 *     (see generator.mdc, "Digits and unconvertible input")
 * Letters (uppercase/lowercase) have no such passthrough field, so an
 * unchanged letter with none of the above is always a real bug.
 */
function checkOne(style: Style, plain: string, generated: string, kind: CharKind): void {
  const generatedCodePoint = generated.codePointAt(0);

  if (generatedCodePoint === REPLACEMENT_CHARACTER_CODE_POINT) {
    failures.push({
      subject: style.id,
      cause: `${kind} "${plain}" produced U+FFFD (replacement character)`,
    });
  }

  if (generated === plain) {
    const declaredBySubstitution = Object.prototype.hasOwnProperty.call(
      style.substitutions,
      plain,
    );
    const declaredByCaveat = style.caveat !== null;
    const declaredByCaveatNote = style.caveatNote != null && style.caveatNote !== '';
    const declaredByCaseNote = style.caseNote !== null;
    const declaredDigitPassthrough = kind === 'digit' && style.digits === null;

    if (
      !declaredBySubstitution &&
      !declaredByCaveat &&
      !declaredByCaveatNote &&
      !declaredByCaseNote &&
      !declaredDigitPassthrough
    ) {
      failures.push({
        subject: style.id,
        cause: `${kind} "${plain}" passed through unchanged and is not declared in substitutions, caveat, caveatNote, caseNote, or digits:null`,
      });
    }
  }
}

const EMOJI_PRESENTATION = /\p{Emoji_Presentation}/u;
const EMOJI = /\p{Emoji}/u;

interface EmojiPropertyFinding {
  codePointHex: string;
  ch: string;
  subject: string;
}

const emojiPropertyFindings: EmojiPropertyFinding[] = [];

/** Report-only: Emoji property without Emoji_Presentation, excluding ASCII. */
function reportEmojiProperty(ch: string, subject: string): void {
  const cp = ch.codePointAt(0);
  if (cp === undefined || cp < 0x80) return;
  if (EMOJI.test(ch) && !EMOJI_PRESENTATION.test(ch)) {
    emojiPropertyFindings.push({ codePointHex: codePointHex(ch), ch, subject });
  }
}

function scanText(text: string, subject: string): void {
  for (const ch of text) {
    reportEmojiProperty(ch, subject);
  }
}

for (const style of styles as Style[]) {
  console.log('='.repeat(70));
  console.log(`Style: ${style.id}  (${style.name})`);
  console.log(`Category      : ${style.category}`);
  console.log(`Risk          : ${style.risk ?? 'unset'}`);
  console.log(`Caveat        : ${style.caveat ?? 'none'}`);
  console.log(`Caveat note   : ${style.caveatNote ?? 'none'}`);
  console.log(`Case note     : ${style.caseNote ?? 'none'}`);
  console.log('='.repeat(70));

  console.log('Uppercase A-Z:');
  for (const plain of UPPERCASE) {
    const generated = applyStyle(plain, style);
    console.log(`  ${plain} -> ${generated}  (${codePointHex(generated)})`);
    checkOne(style, plain, generated, 'uppercase');
    scanText(generated, style.id);
  }

  console.log('Lowercase a-z:');
  for (const plain of LOWERCASE) {
    const generated = applyStyle(plain, style);
    console.log(`  ${plain} -> ${generated}  (${codePointHex(generated)})`);
    checkOne(style, plain, generated, 'lowercase');
    scanText(generated, style.id);
  }

  console.log('Digits 0-9:');
  for (const plain of DIGITS) {
    const generated = applyStyle(plain, style);
    console.log(`  ${plain} -> ${generated}  (${codePointHex(generated)})`);
    checkOne(style, plain, generated, 'digit');
    scanText(generated, style.id);
  }

  const overrideLetters = Object.keys(style.substitutions);
  console.log(
    overrideLetters.length === 0
      ? 'Substitutions : none'
      : `Substitutions : ${overrideLetters
          .map((letter) => `${letter} -> ${codePointHex(String.fromCodePoint(style.substitutions[letter]))}`)
          .join(', ')}`,
  );

  const digitNote = style.digits === null ? ' (digits: null, pass through unchanged by design)' : '';
  console.log(`Digits field  : ${style.digits === null ? 'null' : 'array of 10'}${digitNote}`);

  const passThroughResult = applyStyle(PASS_THROUGH_SAMPLE, style);
  console.log(`Pass-through sample "${PASS_THROUGH_SAMPLE}" -> "${passThroughResult}"`);

  const styledFontly = applyStyle('Fontly', style);
  const count = countCharacters(styledFontly);
  console.log(
    `"Fontly" -> "${styledFontly}": ${count.codePoints} characters, ${count.utf16Length} UTF-16 units`,
  );

  console.log('');
}

// Decorations are wrappers, not styles. Every prefix and suffix character is
// printed with its code point; a character carrying emoji presentation must be
// declared in the decoration's caveat (see generator.mdc).

for (const decoration of decorations) {
  console.log('='.repeat(70));
  console.log(`Decoration: ${decoration.id}  (${decoration.name})`);
  console.log(`Caveat        : ${decoration.caveat ?? 'none'}`);
  console.log('='.repeat(70));

  for (const [part, text] of [
    ['Prefix', decoration.prefix],
    ['Suffix', decoration.suffix],
  ] as const) {
    for (const ch of text) {
      const emojiNote = EMOJI_PRESENTATION.test(ch) ? '  [emoji presentation]' : '';
      console.log(`  ${part}: ${ch}  (${codePointHex(ch)})${emojiNote}`);
      reportEmojiProperty(ch, decoration.id);

      if (ch.codePointAt(0) === REPLACEMENT_CHARACTER_CODE_POINT) {
        failures.push({
          subject: decoration.id,
          cause: `${part.toLowerCase()} character is U+FFFD (replacement character)`,
        });
      }
      if (EMOJI_PRESENTATION.test(ch) && decoration.caveat === null) {
        failures.push({
          subject: decoration.id,
          cause: `${part.toLowerCase()} character ${codePointHex(ch)} carries emoji presentation and is not declared in caveat`,
        });
      }
    }
  }

  const wrapped = applyDecoration('Fontly', decoration);
  const wrappedCount = countCharacters(wrapped);
  console.log(
    `"Fontly" -> "${wrapped}": ${wrappedCount.codePoints} characters, ${wrappedCount.utf16Length} UTF-16 units`,
  );
  console.log('');
}

// Effects are combining marks, not styles or wrappers. Every mark must be
// Unicode general category Mn or Me — a wrong code point that is not a
// combining mark must never ship.
const COMBINING_MARK = /[\p{Mn}\p{Me}]/u;

for (const effect of effects) {
  console.log('='.repeat(70));
  console.log(`Effect: ${effect.id}  (${effect.name})`);
  console.log(`Caveat        : ${effect.caveat ?? 'none'}`);
  console.log('='.repeat(70));

  for (const ch of effect.mark) {
    console.log(`  Mark: ${ch}  (${codePointHex(ch)})`);
    reportEmojiProperty(ch, effect.id);

    if (ch.codePointAt(0) === REPLACEMENT_CHARACTER_CODE_POINT) {
      failures.push({
        subject: effect.id,
        cause: 'effect mark is U+FFFD (replacement character)',
      });
    }
    if (!COMBINING_MARK.test(ch)) {
      failures.push({
        subject: effect.id,
        cause: `effect mark ${codePointHex(ch)} is not a combining mark (Unicode general category Mn or Me)`,
      });
    }
  }

  const applied = applyEffect('Fontly Test', effect);
  const appliedCount = countCharacters(applied);
  console.log(
    `"Fontly Test" -> "${applied}": ${appliedCount.codePoints} characters, ${appliedCount.utf16Length} UTF-16 units`,
  );
  console.log('');
}

console.log('='.repeat(70));
console.log('EMOJI PROPERTY REPORT');
console.log('Characters with Emoji property but not Emoji_Presentation (non-ASCII only):');
for (const finding of emojiPropertyFindings) {
  console.log(`  ${finding.codePointHex}  ${finding.ch}  ${finding.subject}`);
}
console.log(`Total: ${emojiPropertyFindings.length}`);
console.log('='.repeat(70));

console.log('='.repeat(70));
if (failures.length === 0) {
  console.log(
    `RESULT: PASS. ${styles.length} styles, all uppercase/lowercase/digit characters verified. ${decorations.length} decorations, every prefix and suffix character verified. ${effects.length} effects, every mark a combining mark.`,
  );
} else {
  console.log(`RESULT: FAIL. ${failures.length} failure(s):`);
  for (const failure of failures) {
    console.log(`  [${failure.subject}] ${failure.cause}`);
  }
}
console.log('='.repeat(70));

if (failures.length > 0) {
  process.exitCode = 1;
}
