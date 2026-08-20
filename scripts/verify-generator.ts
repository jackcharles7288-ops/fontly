// Development-only verification tool. Run from the terminal:
//   node scripts/verify-generator.ts
// Never imported by any page or shipped to the browser.

import { styles, type Style } from '../src/data/styles.ts';
import { applyStyle, countCharacters } from '../src/scripts/generator.js';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const PASS_THROUGH_SAMPLE = 'H\u00e9llo \u00f1 \u65e5\u672c 42 !?';
const LETTER_TEST = /\p{L}/u;

function codePointHex(ch: string): string {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return 'U+????';
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

function codePointsOf(text: string): string[] {
  const result: string[] = [];
  for (const ch of text) {
    result.push(ch);
  }
  return result;
}

let anyFail = false;

for (const style of styles as Style[]) {
  console.log('='.repeat(70));
  console.log(`Style: ${style.id}  (${style.name})`);
  console.log(`Risk          : ${style.risk ?? 'unset'}`);
  console.log('='.repeat(70));

  const styledUpper = applyStyle(UPPERCASE, style);
  const styledLower = applyStyle(LOWERCASE, style);

  console.log(`Uppercase A-Z : ${styledUpper}`);
  console.log(`Lowercase a-z : ${styledLower}`);

  const overrideLetters = Object.keys(style.substitutions);
  if (overrideLetters.length === 0) {
    console.log('Overrides     : none');
  } else {
    console.log('Overrides:');
    for (const letter of overrideLetters) {
      const produced = applyStyle(letter, style);
      console.log(`  ${letter} -> ${produced}  (${codePointHex(produced)})`);
    }
  }

  const styledDigits = applyStyle(DIGITS, style);
  const digitNote = style.digits === null ? ' (digits: null, pass through unchanged)' : '';
  console.log(`Digits "${DIGITS}" -> "${styledDigits}"${digitNote}`);

  const passThroughResult = applyStyle(PASS_THROUGH_SAMPLE, style);
  console.log(`Pass-through "${PASS_THROUGH_SAMPLE}" -> "${passThroughResult}"`);

  const styledHello = applyStyle('Hello', style);
  const count = countCharacters(styledHello);
  console.log(
    `Dual counter for "Hello" -> "${styledHello}": ${count.codePoints} characters, ${count.utf16Length} UTF-16 units`,
  );

  console.log('');
  console.log(`\\p{L} check (independent of the override list above):`);
  const plainLetters = [...UPPERCASE, ...LOWERCASE];
  const generatedChars = [...codePointsOf(styledUpper), ...codePointsOf(styledLower)];

  let styleFailed = false;
  for (let i = 0; i < plainLetters.length; i++) {
    const plain = plainLetters[i];
    const generated = generatedChars[i];
    if (generated === undefined || !LETTER_TEST.test(generated)) {
      styleFailed = true;
      anyFail = true;
      console.log(
        `  FAIL: style "${style.id}" letter "${plain}" produced "${generated}" (${
          generated ? codePointHex(generated) : 'missing'
        }) which does NOT match /\\p{L}/u`,
      );
    }
  }
  if (!styleFailed) {
    console.log('  PASS: all 52 generated characters match /\\p{L}/u');
  }
  console.log('');
}

console.log('='.repeat(70));
console.log(anyFail ? 'RESULT: at least one FAIL above.' : 'RESULT: all six styles passed the \\p{L} check.');
console.log('='.repeat(70));
