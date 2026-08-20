export type Risk = 'safe' | 'uneven' | 'check-old-devices';

export interface Style {
  id: string;
  name: string;
  category: string;
  /** First code point of the block's uppercase A. */
  uppercaseBase: number;
  /** First code point of the block's lowercase a. */
  lowercaseBase: number;
  /** Code point overrides, keyed by the plain letter they replace. */
  substitutions: Record<string, number>;
  /** null means digits pass through unchanged; no cursive digits exist. */
  digits: string[] | null;
  /** null means no risk badge; unset is correct until verified. */
  risk: Risk | null;
}

// The six cursive styles from generator.mdc. Bases and overrides are taken
// verbatim from that file. Do not add more styles here in Phase 2.
export const styles: Style[] = [
  {
    id: 'bold-script',
    name: 'Bold Script',
    category: 'cursive',
    uppercaseBase: 0x1d4d0,
    lowercaseBase: 0x1d4ea,
    substitutions: {},
    digits: null,
    risk: null,
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
  },
];
