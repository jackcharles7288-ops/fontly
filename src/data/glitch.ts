// Glitch (zalgo) stacks many combining marks on one letter. That is the only
// difference from an effect: an effect in effects.ts adds exactly one mark per
// character, this adds between minMarks and maxMarks of them.
//
// No new code points live here. The three pools below are lists of effect ids,
// resolved against the records in effects.ts, so those 34 marks stay the single
// source of truth. Adding a 35th effect without classifying it throws at load.

import { effects } from './effects';

/** Which pools a setting may draw from. */
export type GlitchDirection = 'above' | 'below' | 'through' | 'below-through' | 'mixed';

export interface GlitchSetting {
  id: string;
  /** The article's own display name. */
  name: string;
  direction: GlitchDirection;
  /** Fewest marks on one character. Never below 1. */
  minMarks: number;
  /** Most marks on one character. Never above MAX_MARKS_PER_LETTER. */
  maxMarks: number;
  /** true = output differs per call unless a seed is passed. */
  randomised: boolean;
}

/**
 * Unicode's Stream-Safe Text Format caps a combining sequence at 30 non-starter
 * code points (UAX #15). No character this module emits may ever exceed it.
 */
export const MAX_MARKS_PER_LETTER = 30;

// Marks that render above the letter.
const ABOVE_IDS = [
  'grave', 'acute', 'circumflex', 'tilde', 'overline', 'breve', 'dot-above',
  'diaeresis', 'hook-above', 'ring-above', 'double-acute', 'caron',
  'line-above', 'double-grave', 'inverted-breve', 'x-above', 'double-overline',
  'zigzag-above',
] as const;

// Marks that render below the letter. 'underline' and 'double-underline' sit
// here, not in `through`: effects.ts files them beside the overlays because
// they share applyToSpaces: true, but a low line is drawn under the baseline
// rather than across the glyph.
const BELOW_IDS = [
  'dot-below', 'diaeresis-below', 'ring-below', 'caron-below',
  'circumflex-below', 'breve-below', 'tilde-below', 'underline',
  'double-underline', 'x-below', 'asterisk-below',
] as const;

// Overlay marks, drawn across the glyph.
const THROUGH_IDS = [
  'tilde-overlay', 'short-strike', 'strikethrough', 'short-slash', 'slash',
] as const;

const markByEffectId = new Map(effects.map((effect) => [effect.id, effect.mark]));

function resolvePool(ids: readonly string[], poolName: string): string[] {
  return ids.map((id) => {
    const mark = markByEffectId.get(id);
    if (mark === undefined) {
      throw new Error(`[fonti] glitch.ts: ${poolName} pool references unknown effect id "${id}"`);
    }
    return mark;
  });
}

export const ABOVE_MARKS: string[] = resolvePool(ABOVE_IDS, 'above');
export const BELOW_MARKS: string[] = resolvePool(BELOW_IDS, 'below');
export const THROUGH_MARKS: string[] = resolvePool(THROUGH_IDS, 'through');

// Every effect must be classified exactly once, or a future mark would be
// silently unreachable from the glitch settings.
const classifiedIds = [...ABOVE_IDS, ...BELOW_IDS, ...THROUGH_IDS];
if (new Set(classifiedIds).size !== classifiedIds.length) {
  throw new Error('[fonti] glitch.ts: an effect id appears in more than one pool');
}
for (const effect of effects) {
  if (!classifiedIds.includes(effect.id)) {
    throw new Error(
      `[fonti] glitch.ts: effect id "${effect.id}" is in no pool — classify it as above, below or through`,
    );
  }
}

export const glitchSettings: GlitchSetting[] = [
  { id: 'light', name: 'Light glitch', direction: 'mixed', minMarks: 1, maxMarks: 2, randomised: false },
  { id: 'medium', name: 'Medium glitch, the classic zalgo look', direction: 'mixed', minMarks: 5, maxMarks: 8, randomised: false },
  { id: 'heavy', name: 'Heavy glitch', direction: 'mixed', minMarks: 12, maxMarks: 16, randomised: false },
  { id: 'maximum', name: 'Maximum, cursed text territory', direction: 'mixed', minMarks: 24, maxMarks: 30, randomised: false },
  { id: 'creepy', name: 'Creepy text', direction: 'above', minMarks: 3, maxMarks: 5, randomised: false },
  { id: 'corrupted', name: 'Corrupted text', direction: 'below-through', minMarks: 8, maxMarks: 12, randomised: false },
  { id: 'rising', name: 'Rising, above only', direction: 'above', minMarks: 8, maxMarks: 12, randomised: false },
  { id: 'dripping', name: 'Dripping, below only', direction: 'below', minMarks: 8, maxMarks: 12, randomised: false },
  { id: 'struck-through', name: 'Struck through, middle only', direction: 'through', minMarks: 2, maxMarks: 4, randomised: false },
  { id: 'mixed', name: 'Mixed, randomised each time', direction: 'mixed', minMarks: 1, maxMarks: 30, randomised: true },
];

for (const setting of glitchSettings) {
  if (setting.minMarks < 1 || setting.minMarks > setting.maxMarks) {
    throw new Error(`[fonti] glitch.ts: setting "${setting.id}" has an impossible mark range`);
  }
  if (setting.maxMarks > MAX_MARKS_PER_LETTER) {
    throw new Error(
      `[fonti] glitch.ts: setting "${setting.id}" allows ${setting.maxMarks} marks, above the ${MAX_MARKS_PER_LETTER} ceiling`,
    );
  }
}

/**
 * Pools a direction may draw from, always in stack order: above, below, through.
 */
function poolsFor(direction: GlitchDirection): string[][] {
  if (direction === 'above') return [ABOVE_MARKS];
  if (direction === 'below') return [BELOW_MARKS];
  if (direction === 'through') return [THROUGH_MARKS];
  if (direction === 'below-through') return [BELOW_MARKS, THROUGH_MARKS];
  return [ABOVE_MARKS, BELOW_MARKS, THROUGH_MARKS];
}

/** mulberry32. Small, fast, and repeatable from one 32-bit seed. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stacks combining marks on each character of the text.
 *
 * Pure, DOM-free, and iterated with for...of so an astral-plane character is
 * never split. Never uses charCodeAt or string indexing with [i].
 *
 * Spaces: U+0020 receives marks only when the direction is `through`, matching
 * the five overlay effects in effects.ts, which are the ones that set
 * applyToSpaces: true for a continuous line. Every other direction leaves a
 * space bare.
 *
 * Stack order: all above marks, then all below, then all through.
 *
 * A non-randomised setting is fully deterministic — the same text always gives
 * the same output, with no seed needed. A randomised setting is deterministic
 * for a given seed; called without one it takes its seed from Math.random().
 *
 * @param text
 * @param setting
 * @param seed optional 32-bit seed, used only by a randomised setting
 */
export function applyGlitch(text: string, setting: GlitchSetting, seed?: number): string {
  const pools = poolsFor(setting.direction);
  const span = setting.maxMarks - setting.minMarks + 1;
  const random = setting.randomised
    ? makeRandom(seed === undefined ? Math.floor(Math.random() * 0xffffffff) : seed)
    : null;

  let result = '';
  let index = 0;

  for (const ch of text) {
    result += ch;
    const isSpace = ch === '\u0020';
    index += 1;
    if (isSpace && setting.direction !== 'through') continue;

    const wanted = random === null
      ? setting.minMarks + ((index - 1) % span)
      : setting.minMarks + Math.floor(random() * span);
    const count = Math.min(wanted, MAX_MARKS_PER_LETTER);

    // One bucket per pool so the marks can be emitted in stack order even when
    // the slots were handed out across pools in turn.
    const buckets: string[][] = pools.map(() => []);
    for (let slot = 0; slot < count; slot += 1) {
      const poolIndex = random === null ? slot % pools.length : Math.floor(random() * pools.length);
      const pool = pools[poolIndex];
      const markIndex = random === null
        ? (index + slot) % pool.length
        : Math.floor(random() * pool.length);
      buckets[poolIndex].push(pool[markIndex]);
    }
    for (const bucket of buckets) {
      result += bucket.join('');
    }
  }

  return result;
}

/**
 * Removes every combining mark, returning the plain text underneath. Covers the
 * five Unicode combining-mark blocks: Combining Diacritical Marks, Extended,
 * Supplement, Symbols, and Half Marks. Iterates by code point.
 *
 * @param text
 */
export function stripCombiningMarks(text: string): string {
  let result = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (
      cp !== undefined &&
      ((cp >= 0x0300 && cp <= 0x036f) ||
        (cp >= 0x1ab0 && cp <= 0x1aff) ||
        (cp >= 0x1dc0 && cp <= 0x1dff) ||
        (cp >= 0x20d0 && cp <= 0x20ff) ||
        (cp >= 0xfe20 && cp <= 0xfe2f))
    ) {
      continue;
    }
    result += ch;
  }
  return result;
}
