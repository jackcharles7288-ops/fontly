import { BUILDER_LABEL } from './styles';

export interface Category {
  id: string;
  name: string;
  /**
   * Chip label and section heading do different jobs. The chip label stays
   * short because the whole chip row must fit on one line. The heading
   * carries the full search phrase because the section H2 is the ranking
   * surface. When heading is absent, the H2 falls back to name.
   */
  heading?: string;
  /** false = this category is a section but does not appear in the chip row. */
  chip?: boolean;
  /** true = decoration shape group (stars, hearts, brackets, shapes, lines, symbols). */
  decoration?: boolean;
}

export const categories: Category[] = [
  { id: 'all', name: 'All' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // every alphabet style
  { id: 'cool-fonts', name: 'Cool Fonts' },
  // script letterforms
  { id: 'cursive', name: 'Cursive', heading: 'Cursive Fonts' },
  // bold weight
  { id: 'bold', name: 'Bold', heading: 'Bold Fonts' },
  // slanted letterforms
  { id: 'italic', name: 'Italic', heading: 'Italic Fonts' },
  // letter inside an enclosure
  { id: 'bubble', name: 'Bubble', heading: 'Bubble Text' },
  // Fraktur letterforms
  { id: 'gothic', name: 'Gothic', heading: 'Gothic Fonts' },
  // small or raised or lowered letterforms
  { id: 'small', name: 'Small', heading: 'Small Text' },
  // ornamental letterforms, not a weight or slant change
  { id: 'fancy', name: 'Fancy', heading: 'Fancy Text' },
  // spacing is the style, not the letterform
  { id: 'aesthetic', name: 'Aesthetic', heading: 'Aesthetic Fonts' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // hearts, flowers, snowflakes, stars and sparkles
  { id: 'cute', name: 'Cute' },
  // bold and italic alphabets shared by the bold text generator page
  { id: 'bold-italic', name: 'Bold & Italic', chip: false },
  // converts the digits 0 to 9
  { id: 'number', name: 'Number', heading: 'Number Fonts' },
  // turned letters with reversed order
  { id: 'upside-down', name: 'Upside Down', heading: 'Upside Down Text' },
  // a combining mark added over unchanged letters
  { id: 'effects', name: 'Effects', heading: 'Text Effects' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // characters wrapped around unchanged letters
  { id: 'decorated', name: 'Decorated' },
  // an alphabet wrapped in a decoration
  { id: 'combined', name: 'Combined', heading: 'Combined Fonts' },
  // interactive alphabet + separator + decoration builder (entrance is not a chip)
  { id: 'combo', name: BUILDER_LABEL, heading: BUILDER_LABEL },
  { id: 'favourites', name: 'Favourites' },
  { id: 'recent', name: 'Recent' },
  // star and sparkle characters
  { id: 'stars', name: 'Stars & Sparkles', chip: false, decoration: true },
  // heart, flower and snowflake characters
  { id: 'hearts', name: 'Hearts & Flowers', chip: false, decoration: true },
  // paired bracket characters
  { id: 'brackets', name: 'Brackets', chip: false, decoration: true },
  // geometric shape characters
  { id: 'shapes', name: 'Shapes', chip: false, decoration: true },
  // line, wave and dot-run characters
  { id: 'lines', name: 'Lines & Waves', chip: false, decoration: true },
  // everything else, by character
  { id: 'symbols', name: 'Marks & Symbols', chip: false, decoration: true },
];
