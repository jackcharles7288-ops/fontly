// Development-only dump of every decoration character's Unicode properties.
// Prints: code point, character, name, General_Category, Emoji, Emoji_Presentation.
// Run: npx tsx scripts/dump-codepoints.ts

import { decorations } from '../src/data/decorations.ts';

const NAMES: Record<number, string> = {
  0x2727: 'WHITE FOUR POINTED STAR',
  0x2605: 'BLACK STAR',
  0x2726: 'BLACK FOUR POINTED STAR',
  0xa9c1: 'JAVANESE LEFT RERENGGAN',
  0xa9c2: 'JAVANESE RIGHT RERENGGAN',
  0x3010: 'LEFT BLACK LENTICULAR BRACKET',
  0x3011: 'RIGHT BLACK LENTICULAR BRACKET',
  0x300e: 'LEFT WHITE CORNER BRACKET',
  0x300f: 'RIGHT WHITE CORNER BRACKET',
  0x266a: 'EIGHTH NOTE',
  0x266b: 'BEAMED EIGHTH NOTES',
  0x2501: 'BOX DRAWINGS HEAVY HORIZONTAL',
  0x300c: 'LEFT CORNER BRACKET',
  0x300d: 'RIGHT CORNER BRACKET',
  0x3016: 'LEFT WHITE LENTICULAR BRACKET',
  0x3017: 'RIGHT WHITE LENTICULAR BRACKET',
  0x3018: 'LEFT WHITE TORTOISE SHELL BRACKET',
  0x3019: 'RIGHT WHITE TORTOISE SHELL BRACKET',
  0x27e8: 'MATHEMATICAL LEFT ANGLE BRACKET',
  0x27e9: 'MATHEMATICAL RIGHT ANGLE BRACKET',
  0x27ea: 'MATHEMATICAL LEFT DOUBLE ANGLE BRACKET',
  0x27eb: 'MATHEMATICAL RIGHT DOUBLE ANGLE BRACKET',
  0x2308: 'LEFT CEILING',
  0x2309: 'RIGHT CEILING',
  0x230a: 'LEFT FLOOR',
  0x230b: 'RIGHT FLOOR',
  0x2606: 'WHITE STAR',
  0x2729: 'STRESS OUTLINED WHITE STAR',
  0x2730: 'SHADOWED WHITE STAR',
  0x272f: 'PINWHEEL STAR',
  0x2661: 'WHITE HEART SUIT',
  0x1a12: 'BUGINESE LETTER LEBA',
  0x224b: 'TRIPLE TILDE',
  0x22c6: 'STAR OPERATOR',
  0x5f61: 'CJK UNIFIED IDEOGRAPH-5F61',
  0x27e6: 'MATHEMATICAL LEFT WHITE SQUARE BRACKET',
  0x27e7: 'MATHEMATICAL RIGHT WHITE SQUARE BRACKET',
  0x2985: 'LEFT WHITE PARENTHESIS',
  0x2986: 'RIGHT WHITE PARENTHESIS',
  0x2042: 'ASTERISM',
  0x2756: 'BLACK DIAMOND MINUS WHITE X',
  0x2724: 'HEAVY FOUR BALLOON-SPOKED ASTERISK',
  0x2725: 'FOUR CLUB-SPOKED ASTERISK',
  0x0e5b: 'THAI CHARACTER KHOMUT',
  0x269d: 'OUTLINED WHITE STAR',
  0x4e42: 'CJK UNIFIED IDEOGRAPH-4E42',
  0x2500: 'BOX DRAWINGS LIGHT HORIZONTAL',
  0x2581: 'LOWER ONE EIGHTH BLOCK',
  0x2766: 'FLORAL HEART',
  0x2690: 'WHITE FLAG',
  0x2691: 'BLACK FLAG',
  0x3008: 'LEFT ANGLE BRACKET',
  0x3009: 'RIGHT ANGLE BRACKET',
  0x300a: 'LEFT DOUBLE ANGLE BRACKET',
  0x300b: 'RIGHT DOUBLE ANGLE BRACKET',
  0x3014: 'LEFT TORTOISE SHELL BRACKET',
  0x3015: 'RIGHT TORTOISE SHELL BRACKET',
  0x301a: 'LEFT WHITE SQUARE BRACKET',
  0x301b: 'RIGHT WHITE SQUARE BRACKET',
  0x301c: 'WAVE DASH',
  0x301d: 'REVERSED DOUBLE PRIME QUOTATION MARK',
  0x301e: 'DOUBLE PRIME QUOTATION MARK',
  0x2035: 'REVERSED PRIME',
  0x2032: 'PRIME',
  0x2036: 'REVERSED DOUBLE PRIME',
  0x2033: 'DOUBLE PRIME',
  0x2020: 'DAGGER',
  0x2021: 'DOUBLE DAGGER',
  0x00a7: 'SECTION SIGN',
  0x00b6: 'PILCROW SIGN',
  0x2045: 'LEFT SQUARE BRACKET WITH QUILL',
  0x2046: 'RIGHT SQUARE BRACKET WITH QUILL',
  0x204a: 'TIRONIAN SIGN ET',
  0x203b: 'REFERENCE MARK',
  0x25c6: 'BLACK DIAMOND',
  0x25c7: 'WHITE DIAMOND',
  0x25c8: 'WHITE DIAMOND CONTAINING BLACK SMALL DIAMOND',
  0x25a0: 'BLACK SQUARE',
  0x25a1: 'WHITE SQUARE',
  0x25b2: 'BLACK UP-POINTING TRIANGLE',
  0x25b3: 'WHITE UP-POINTING TRIANGLE',
  0x25bc: 'BLACK DOWN-POINTING TRIANGLE',
  0x25bd: 'WHITE DOWN-POINTING TRIANGLE',
  0x25cb: 'WHITE CIRCLE',
  0x25cf: 'BLACK CIRCLE',
  0x2732: 'OPEN CENTRE ASTERISK',
  0x2735: 'EIGHT POINTED PINWHEEL STAR',
  0x2736: 'SIX POINTED BLACK STAR',
  0x2737: 'EIGHT POINTED RECTILINEAR BLACK STAR',
  0x2738: 'HEAVY EIGHT POINTED RECTILINEAR BLACK STAR',
  0x2739: 'TWELVE POINTED BLACK STAR',
  0x273a: 'SIXTEEN POINTED ASTERISK',
  0x273b: 'TEARDROP-SPOKED ASTERISK',
  0x273c: 'OPEN CENTRE TEARDROP-SPOKED ASTERISK',
  0x273d: 'HEAVY TEARDROP-SPOKED ASTERISK',
  0x273e: 'SIX PETALLED BLACK AND WHITE FLORETTE',
  0x273f: 'BLACK FLORETTE',
  0x2740: 'WHITE FLORETTE',
  0x2741: 'EIGHT PETALLED OUTLINED BLACK FLORETTE',
  0x2742: 'CIRCLED OPEN CENTRE EIGHT POINTED STAR',
  0x2743: 'HEAVY TEARDROP-SPOKED PINWHEEL ASTERISK',
  0x2745: 'TIGHT TRIFOLIATE SNOWFLAKE',
  0x2746: 'HEAVY CHEVRON SNOWFLAKE',
  0x2748: 'HEAVY SPARKLE',
  0x2749: 'BALLOON-SPOKED ASTERISK',
  0x274a: 'EIGHT TEARDROP-SPOKED PROPELLER ASTERISK',
  0x274b: 'HEAVY EIGHT TEARDROP-SPOKED PROPELLER ASTERISK',
  0x274d: 'SHADOWED WHITE CIRCLE',
  0x274f: 'LOWER RIGHT DROP-SHADOWED WHITE SQUARE',
  0x2750: 'UPPER RIGHT DROP-SHADOWED WHITE SQUARE',
  0x2751: 'LOWER RIGHT SHADOWED WHITE SQUARE',
  0x2752: 'UPPER RIGHT SHADOWED WHITE SQUARE',
  0x2758: 'LIGHT VERTICAL BAR',
  0x2759: 'MEDIUM VERTICAL BAR',
  0x275a: 'HEAVY VERTICAL BAR',
  0x275b: 'HEAVY SINGLE TURNED COMMA QUOTATION MARK ORNAMENT',
  0x275c: 'HEAVY SINGLE COMMA QUOTATION MARK ORNAMENT',
  0x275d: 'HEAVY DOUBLE TURNED COMMA QUOTATION MARK ORNAMENT',
  0x275e: 'HEAVY DOUBLE COMMA QUOTATION MARK ORNAMENT',
  0x2760: 'HEAVY LOW SINGLE COMMA QUOTATION MARK ORNAMENT',
  0x2761: 'HEAVY LOW DOUBLE COMMA QUOTATION MARK ORNAMENT',
};

function gc(ch: string): string {
  if (/\p{Lu}/u.test(ch)) return 'Lu';
  if (/\p{Ll}/u.test(ch)) return 'Ll';
  if (/\p{Lt}/u.test(ch)) return 'Lt';
  if (/\p{Lm}/u.test(ch)) return 'Lm';
  if (/\p{Lo}/u.test(ch)) return 'Lo';
  if (/\p{Mn}/u.test(ch)) return 'Mn';
  if (/\p{Me}/u.test(ch)) return 'Me';
  if (/\p{Mc}/u.test(ch)) return 'Mc';
  if (/\p{Nd}/u.test(ch)) return 'Nd';
  if (/\p{Nl}/u.test(ch)) return 'Nl';
  if (/\p{No}/u.test(ch)) return 'No';
  if (/\p{Pc}/u.test(ch)) return 'Pc';
  if (/\p{Pd}/u.test(ch)) return 'Pd';
  if (/\p{Ps}/u.test(ch)) return 'Ps';
  if (/\p{Pe}/u.test(ch)) return 'Pe';
  if (/\p{Pi}/u.test(ch)) return 'Pi';
  if (/\p{Pf}/u.test(ch)) return 'Pf';
  if (/\p{Po}/u.test(ch)) return 'Po';
  if (/\p{Sm}/u.test(ch)) return 'Sm';
  if (/\p{Sc}/u.test(ch)) return 'Sc';
  if (/\p{Sk}/u.test(ch)) return 'Sk';
  if (/\p{So}/u.test(ch)) return 'So';
  if (/\p{Zs}/u.test(ch)) return 'Zs';
  if (/\p{Zl}/u.test(ch)) return 'Zl';
  if (/\p{Zp}/u.test(ch)) return 'Zp';
  if (/\p{Cc}/u.test(ch)) return 'Cc';
  if (/\p{Cf}/u.test(ch)) return 'Cf';
  if (/\p{Cs}/u.test(ch)) return 'Cs';
  if (/\p{Co}/u.test(ch)) return 'Co';
  if (/\p{Cn}/u.test(ch)) return 'Cn';
  return '??';
}

const rows: string[] = [];
rows.push('| Code point | Char | Name | GC | Emoji | Emoji_Presentation |');
rows.push('|------------|------|------|----|-------|--------------------|');

for (const d of decorations) {
  for (const ch of d.prefix) {
    const cp = ch.codePointAt(0)!;
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
    const name = NAMES[cp] ?? '(name not in table)';
    const category = gc(ch);
    const emoji = /\p{Emoji}/u.test(ch) ? 'yes' : 'no';
    const emojiPres = /\p{Emoji_Presentation}/u.test(ch) ? 'yes' : 'no';
    rows.push(`| ${hex} | ${ch} | ${name} | ${category} | ${emoji} | ${emojiPres} |`);
  }
  for (const ch of d.suffix) {
    const cp = ch.codePointAt(0)!;
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
    const name = NAMES[cp] ?? '(name not in table)';
    const category = gc(ch);
    const emoji = /\p{Emoji}/u.test(ch) ? 'yes' : 'no';
    const emojiPres = /\p{Emoji_Presentation}/u.test(ch) ? 'yes' : 'no';
    rows.push(`| ${hex} | ${ch} | ${name} | ${category} | ${emoji} | ${emojiPres} |`);
  }
}

console.log(rows.join('\n'));
