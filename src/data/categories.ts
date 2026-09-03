export interface Category {
  id: string;
  name: string;
  /** false = this category is a section but does not appear in the chip row. */
  chip?: boolean;
}

export const categories: Category[] = [
  { id: 'all', name: 'All' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // every alphabet style
  { id: 'cool-fonts', name: 'Cool Fonts' },
  // script letterforms
  { id: 'cursive', name: 'Cursive' },
  // bold weight
  { id: 'bold', name: 'Bold' },
  // slanted letterforms
  { id: 'italic', name: 'Italic' },
  // letter inside an enclosure
  { id: 'bubble', name: 'Bubble' },
  // Fraktur letterforms
  { id: 'gothic', name: 'Gothic' },
  // small or raised or lowered letterforms
  { id: 'small', name: 'Small' },
  // ornamental letterforms, not a weight or slant change
  { id: 'fancy', name: 'Fancy' },
  // spacing is the style, not the letterform
  { id: 'aesthetic', name: 'Aesthetic' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // hearts, flowers, snowflakes, stars and sparkles
  { id: 'cute', name: 'Cute' },
  // converts the digits 0 to 9
  { id: 'number', name: 'Number' },
  // turned letters with reversed order
  { id: 'upside-down', name: 'Upside Down' },
  // a combining mark added over unchanged letters
  { id: 'effects', name: 'Effects' },
  // Chip with no section of its own. Do not add it back to toolCategories.
  // characters wrapped around unchanged letters
  { id: 'decorated', name: 'Decorated' },
  { id: 'favourites', name: 'Favourites' },
  { id: 'recent', name: 'Recent' },
  // star and sparkle characters
  { id: 'stars', name: 'Stars & Sparkles', chip: false },
  // heart, flower and snowflake characters
  { id: 'hearts', name: 'Hearts & Flowers', chip: false },
  // paired bracket characters
  { id: 'brackets', name: 'Brackets', chip: false },
  // geometric shape characters
  { id: 'shapes', name: 'Shapes', chip: false },
  // line, wave and dot-run characters
  { id: 'lines', name: 'Lines & Waves', chip: false },
  // everything else, by character
  { id: 'symbols', name: 'Marks & Symbols', chip: false },
];
