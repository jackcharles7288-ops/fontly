// Development-only verification tool. Run from the terminal:
//   npx tsx scripts/verify-generator.ts
// Never imported by any page or shipped to the browser.

import { styles, type Style } from '../src/data/styles.ts';
import { decorations, applyDecoration } from '../src/data/decorations.ts';
import { effects, applyEffect } from '../src/data/effects.ts';
import { combinations } from '../src/data/combinations.ts';
import { separators } from '../src/data/separators.ts';
import {
  glitchSettings,
  applyGlitch,
  stripCombiningMarks,
  ABOVE_MARKS,
  BELOW_MARKS,
  THROUGH_MARKS,
  MAX_MARKS_PER_LETTER,
} from '../src/data/glitch.ts';
import { applyStyle, applyCombination, countCharacters } from '../src/scripts/generator.js';

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
  console.log(`Categories    : ${style.categories.join(', ')}`);
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

  const styledFonti = applyStyle('Fonti', style);
  const count = countCharacters(styledFonti);
  console.log(
    `"Fonti" -> "${styledFonti}": ${count.codePoints} characters, ${count.utf16Length} UTF-16 units`,
  );

  console.log('');
}

// Flipped and Upside Down share one map. Flipped does not reverse.
// Upside Down reverses after substitution. Expected strings are code points
// so this file stays ASCII. U+218C and U+218D must never appear.
const flippedStyle = styles.find((s) => s.id === 'flipped');
const upsideDown = styles.find((s) => s.id === 'upside-down');
if (!flippedStyle || !upsideDown) {
  failures.push({
    subject: 'upside-down',
    cause: `missing card: flipped=${Boolean(flippedStyle)} upside-down=${Boolean(upsideDown)}`,
  });
} else {
  if (flippedStyle.substitutions !== upsideDown.substitutions || flippedStyle.digits !== upsideDown.digits) {
    failures.push({
      subject: 'upside-down',
      cause: 'Flipped and Upside Down do not share the same substitutions and digits objects',
    });
  }
  if (flippedStyle.reverse) {
    failures.push({ subject: 'flipped', cause: 'Flipped must not reverse' });
  }
  if (!upsideDown.reverse) {
    failures.push({ subject: 'upside-down', cause: 'Upside Down must reverse after substitution' });
  }
  const banned = new Set([0x10412, 0x218a, 0x218b, 0x218c, 0x218d]);
  const sharedValues = [
    ...Object.values(flippedStyle.substitutions),
    ...(flippedStyle.digits ?? []).map((digit) => digit.codePointAt(0)),
  ];
  for (const value of sharedValues) {
    if (value !== undefined && banned.has(value)) {
      failures.push({
        subject: 'flipped',
        cause: `retired or banned code point U+${value.toString(16).toUpperCase()} is in the shared map`,
      });
    }
  }
  const flippedCases: [string, number[]][] = [
    ['Jam Doughnut', [0x017f, 0x0250, 0x026f, 0x0020, 0x25d6, 0x006f, 0x006e, 0x0183, 0x0265, 0x0075, 0x006e, 0x0287]],
    [
      'Jam Doughnut 45',
      [0x017f, 0x0250, 0x026f, 0x0020, 0x25d6, 0x006f, 0x006e, 0x0183, 0x0265, 0x0075, 0x006e, 0x0287, 0x0020, 0x152d, 0x0035],
    ],
    [
      'ABDKTUR 2347',
      [0x2200, 0x15fa, 0x25d6, 0x22ca, 0x22a5, 0x2229, 0x1d1a, 0x0020, 0x1614, 0x0190, 0x152d, 0x2c62],
    ],
    [
      UPPERCASE,
      [
        0x2200, 0x15fa, 0x2183, 0x25d6, 0x018e, 0x2132, 0x2141, 0x0048, 0x0049, 0x017f, 0x22ca,
        0x2142, 0x0057, 0x1d0e, 0x004f, 0x0500, 0x038c, 0x1d1a, 0x0053, 0x22a5, 0x2229, 0x1d27,
        0x004d, 0x0058, 0x2144, 0x005a,
      ],
    ],
    [
      LOWERCASE,
      [
        0x0250, 0x0071, 0x0254, 0x0070, 0x01dd, 0x025f, 0x0183, 0x0265, 0x0131, 0x027e, 0x029e,
        0x0283, 0x026f, 0x0075, 0x006f, 0x0064, 0x0062, 0x0279, 0x0073, 0x0287, 0x006e, 0x028c,
        0x028d, 0x0078, 0x028e, 0x007a,
      ],
    ],
    ['0123456789', [0x0030, 0x0031, 0x1614, 0x0190, 0x152d, 0x0035, 0x0039, 0x2c62, 0x0038, 0x0036]],
    [
      '! ? . , " & ; _ ( ) [ ] { } < >',
      [
        0x00a1, 0x0020, 0x00bf, 0x0020, 0x002e, 0x0020, 0x002c, 0x0020, 0x0022, 0x0020, 0x0026,
        0x0020, 0x003b, 0x0020, 0x005f, 0x0020, 0x0028, 0x0020, 0x0029, 0x0020, 0x005b, 0x0020,
        0x005d, 0x0020, 0x007b, 0x0020, 0x007d, 0x0020, 0x003c, 0x0020, 0x003e,
      ],
    ],
  ];
  for (const [input, expectedCps] of flippedCases) {
    const expected = String.fromCodePoint(...expectedCps);
    const actual = applyStyle(input, flippedStyle);
    if (actual !== expected) {
      failures.push({
        subject: 'flipped',
        cause: `applyStyle("${input.slice(0, 16)}") produced "${actual}", expected "${expected}"`,
      });
    }
    const reversed = applyStyle(input, upsideDown);
    const reversedExpected = [...expected].reverse().join('');
    if (reversed !== reversedExpected) {
      failures.push({
        subject: 'upside-down',
        cause: `reversed "${input.slice(0, 16)}" produced "${reversed}", expected "${reversedExpected}"`,
      });
    }
  }
  const upperFlipped = applyStyle(UPPERCASE, flippedStyle);
  const upperDown = applyStyle(UPPERCASE, upsideDown);
  const digitFlipped = applyStyle(DIGITS, flippedStyle);
  const digitDown = applyStyle(DIGITS, upsideDown);
  if ([...upperFlipped].length !== 26 || upperFlipped.length !== 26) {
    failures.push({
      subject: 'flipped',
      cause: `A-Z must be 26 code points and 26 UTF-16 units, got ${[...upperFlipped].length} and ${upperFlipped.length}`,
    });
  }
  if ([...upperDown].length !== 26 || upperDown.length !== 26) {
    failures.push({
      subject: 'upside-down',
      cause: `reversed A-Z must be 26 code points and 26 UTF-16 units, got ${[...upperDown].length} and ${upperDown.length}`,
    });
  }
  for (const ch of upperFlipped + upperDown + digitFlipped + digitDown) {
    const cp = ch.codePointAt(0);
    if (cp === 0xfffd || (cp !== undefined && banned.has(cp))) {
      failures.push({
        subject: 'flipped',
        cause: `generated output contains U+${(cp ?? 0).toString(16).toUpperCase()}`,
      });
    }
  }
}

for (const style of styles as Style[]) {
  if (!style.reverse) continue;
  for (const sample of [UPPERCASE + LOWERCASE + DIGITS, PASS_THROUGH_SAMPLE]) {
    const out = applyStyle(sample, style);
    const inCount = countCharacters(sample).codePoints;
    const outCount = countCharacters(out).codePoints;
    if (inCount !== outCount) {
      failures.push({
        subject: style.id,
        cause: `reversal changed the code point count: ${inCount} in, ${outCount} out`,
      });
    }
  }
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

  const wrapped = applyDecoration('Fonti', decoration);
  const wrappedCount = countCharacters(wrapped);
  console.log(
    `"Fonti" -> "${wrapped}": ${wrappedCount.codePoints} characters, ${wrappedCount.utf16Length} UTF-16 units`,
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

  const applied = applyEffect('Fonti Test', effect);
  const appliedCount = countCharacters(applied);
  console.log(
    `"Fonti Test" -> "${applied}": ${appliedCount.codePoints} characters, ${appliedCount.utf16Length} UTF-16 units`,
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

// Separators are single code points inserted between letters in the Combo builder.
console.log('='.repeat(70));
console.log('SEPARATORS');
console.log('='.repeat(70));
for (const separator of separators) {
  const cps = [...separator.char];
  if (cps.length !== 1) {
    failures.push({
      subject: separator.id,
      cause: `separator char must be exactly one code point, found ${cps.length}`,
    });
  }
  for (const ch of cps) {
    reportEmojiProperty(ch, separator.id);
    if (EMOJI_PRESENTATION.test(ch) || EMOJI.test(ch)) {
      failures.push({
        subject: separator.id,
        cause: `separator char ${codePointHex(ch)} carries emoji or emoji presentation`,
      });
    }
    console.log(`  ${separator.id}  ${separator.name}  ${codePointHex(ch)}`);
  }
}
console.log(`SEPARATORS: ${separators.length}`);
console.log('='.repeat(70));

// Combinations are alphabet + decoration pairs built as a cross product of two
// id lists. Structural checks only: count, id uniqueness across the whole
// catalogue, reference resolution, and pairwise output distinctness. Zero new
// code points by construction — no mapping is checked here.
console.log('='.repeat(70));
console.log('COMBINATIONS');
console.log('='.repeat(70));

// combinations.ts builds every pair of its 13 style ids and 15 decoration ids.
// Nothing filters that cross product, so the total is 13 × 15 = 195.
if (combinations.length !== 195) {
  failures.push({
    subject: 'combinations',
    cause: `expected exactly 195 combinations, found ${combinations.length}`,
  });
}

const styleIds = new Set(styles.map((s) => s.id));
const decorationIds = new Set(decorations.map((d) => d.id));
const effectIds = new Set(effects.map((e) => e.id));
const catalogueIds = new Set<string>([...styleIds, ...decorationIds, ...effectIds]);
for (const combination of combinations) {
  if (catalogueIds.has(combination.id)) {
    failures.push({
      subject: combination.id,
      cause: `combination id collides with an existing catalogue id "${combination.id}"`,
    });
  }
  catalogueIds.add(combination.id);
  if (!styleIds.has(combination.style)) {
    failures.push({
      subject: combination.id,
      cause: `referenced style id "${combination.style}" does not exist in src/data/styles.ts`,
    });
  }
  if (!decorationIds.has(combination.decoration)) {
    failures.push({
      subject: combination.id,
      cause: `referenced decoration id "${combination.decoration}" does not exist in src/data/decorations.ts`,
    });
  }
}

const styleById = new Map(styles.map((s) => [s.id, s]));
const decorationById = new Map(decorations.map((d) => [d.id, d]));
const outputByValue = new Map<string, string>();
for (const combination of combinations) {
  const style = styleById.get(combination.style);
  const decoration = decorationById.get(combination.decoration);
  if (!style || !decoration) continue;
  const output = applyCombination('Fonti 1', style, decoration);
  const existing = outputByValue.get(output);
  if (existing !== undefined) {
    failures.push({
      subject: combination.id,
      cause: `produces the same output as "${existing}" for the same input`,
    });
  } else {
    outputByValue.set(output, combination.id);
  }
}
console.log(`Checked ${combinations.length} combinations: count, unique ids across the catalogue, resolved references, distinct outputs.`);

// Glitch settings stack many marks on one letter, drawn from three pools of
// existing effect marks. Checked here: every pooled mark is a real combining
// mark, every setting respects its own maxMarks and the 30-mark Stream-Safe
// ceiling, every deterministic setting survives a strip round trip, and the
// randomised setting can never emit a code point from outside the pools.
const GLITCH_SAMPLE = 'Glitchy';
const MIXED_SEED_RUNS = 200;

/** Marks carried by each base character, in order. */
function marksPerBase(text: string): number[] {
  const counts: number[] = [];
  for (const ch of text) {
    if (COMBINING_MARK.test(ch) && counts.length > 0) {
      counts[counts.length - 1] += 1;
    } else {
      counts.push(0);
    }
  }
  return counts;
}

console.log('='.repeat(70));
console.log('GLITCH MARK POOLS');
console.log('='.repeat(70));

const glitchPoolCodePoints = new Set<number>();
for (const [poolName, pool] of [
  ['above', ABOVE_MARKS],
  ['below', BELOW_MARKS],
  ['through', THROUGH_MARKS],
] as [string, string[]][]) {
  const hexes: string[] = [];
  for (const mark of pool) {
    for (const ch of mark) {
      const cp = ch.codePointAt(0);
      if (cp !== undefined) glitchPoolCodePoints.add(cp);
      hexes.push(codePointHex(ch));
      if (cp === REPLACEMENT_CHARACTER_CODE_POINT) {
        failures.push({ subject: `glitch:${poolName}`, cause: 'pool mark is U+FFFD (replacement character)' });
      }
      if (!COMBINING_MARK.test(ch)) {
        failures.push({
          subject: `glitch:${poolName}`,
          cause: `pool mark ${codePointHex(ch)} is not a combining mark (Unicode general category Mn or Me)`,
        });
      }
    }
  }
  console.log(`  ${poolName} (${pool.length}): ${hexes.join(' ')}`);
}
console.log(`  pooled marks total: ${ABOVE_MARKS.length + BELOW_MARKS.length + THROUGH_MARKS.length}`);

console.log('='.repeat(70));
console.log('GLITCH SETTINGS');
console.log('='.repeat(70));

for (const setting of glitchSettings) {
  const output = applyGlitch(GLITCH_SAMPLE, setting, setting.randomised ? 1 : undefined);
  const count = countCharacters(output);
  console.log(`Setting: ${setting.id}  (${setting.name})`);
  console.log(`  direction=${setting.direction} min=${setting.minMarks} max=${setting.maxMarks} randomised=${setting.randomised}`);
  console.log(`  "${GLITCH_SAMPLE}" -> "${output}"`);
  console.log(`  ${count.codePoints} characters, ${count.utf16Length} UTF-16 units`);

  const perBase = marksPerBase(output);
  const worst = perBase.length === 0 ? 0 : Math.max(...perBase);
  console.log(`  marks per character: ${perBase.join(', ')}  (max ${worst})`);
  if (worst > MAX_MARKS_PER_LETTER) {
    failures.push({
      subject: `glitch:${setting.id}`,
      cause: `a character carries ${worst} marks, above the ${MAX_MARKS_PER_LETTER} ceiling`,
    });
  }
  if (worst > setting.maxMarks) {
    failures.push({
      subject: `glitch:${setting.id}`,
      cause: `a character carries ${worst} marks, above the setting's own maxMarks of ${setting.maxMarks}`,
    });
  }

  if (!setting.randomised) {
    const stripped = stripCombiningMarks(output);
    const roundTripped = stripped === GLITCH_SAMPLE;
    console.log(`  round trip through stripCombiningMarks: "${stripped}" ${roundTripped ? 'OK' : 'MISMATCH'}`);
    if (!roundTripped) {
      failures.push({
        subject: `glitch:${setting.id}`,
        cause: `stripCombiningMarks returned "${stripped}", expected "${GLITCH_SAMPLE}"`,
      });
    }
    if (applyGlitch(GLITCH_SAMPLE, setting) !== output) {
      failures.push({
        subject: `glitch:${setting.id}`,
        cause: 'a non-randomised setting produced a different output on a second call',
      });
    }
  }
  console.log('');
}

// A randomised setting has no golden string, so it is checked by property:
// across many seeds every mark it emits must come from the three pools, the
// base letters must be untouched, and the ceiling must still hold.
const mixedSetting = glitchSettings.find((setting) => setting.randomised);
if (!mixedSetting) {
  failures.push({ subject: 'glitch:mixed', cause: 'no randomised setting found in glitchSettings' });
} else {
  let widestSeen = 0;
  for (let seed = 0; seed < MIXED_SEED_RUNS; seed += 1) {
    const output = applyGlitch(GLITCH_SAMPLE, mixedSetting, seed);
    for (const ch of output) {
      const cp = ch.codePointAt(0);
      if (cp === undefined) continue;
      if (COMBINING_MARK.test(ch)) {
        if (!glitchPoolCodePoints.has(cp)) {
          failures.push({
            subject: 'glitch:mixed',
            cause: `seed ${seed} emitted ${codePointHex(ch)}, which is in none of the three pools`,
          });
        }
      } else if (!GLITCH_SAMPLE.includes(ch)) {
        failures.push({
          subject: 'glitch:mixed',
          cause: `seed ${seed} emitted base character ${codePointHex(ch)}, which is not in "${GLITCH_SAMPLE}"`,
        });
      }
    }
    const worst = Math.max(...marksPerBase(output));
    widestSeen = Math.max(widestSeen, worst);
    if (worst > MAX_MARKS_PER_LETTER || worst > mixedSetting.maxMarks) {
      failures.push({
        subject: 'glitch:mixed',
        cause: `seed ${seed} produced a character carrying ${worst} marks`,
      });
    }
    if (applyGlitch(GLITCH_SAMPLE, mixedSetting, seed) !== output) {
      failures.push({ subject: 'glitch:mixed', cause: `seed ${seed} was not repeatable` });
    }
  }
  console.log(
    `Mixed: ${MIXED_SEED_RUNS} seeds, every emitted mark inside the three pools, widest stack ${widestSeen} of ${mixedSetting.maxMarks} allowed, each seed repeatable.`,
  );
}

console.log('='.repeat(70));
if (failures.length === 0) {
  console.log(
    `RESULT: PASS. ${styles.length} styles, all uppercase/lowercase/digit characters verified. ${decorations.length} decorations, every prefix and suffix character verified. ${effects.length} effects, every mark a combining mark. ${combinations.length} combinations, structure verified. ${glitchSettings.length} glitch settings, every pooled mark a combining mark, every stack inside the ${MAX_MARKS_PER_LETTER}-mark ceiling.`,
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
