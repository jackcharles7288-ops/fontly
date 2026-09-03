export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All' },
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
  // converts the digits 0 to 9
  { id: 'number', name: 'Number' },
  // turned letters with reversed order
  { id: 'upside-down', name: 'Upside Down' },
  // a combining mark added over unchanged letters
  { id: 'effects', name: 'Effects' },
  // characters wrapped around unchanged letters
  { id: 'decorated', name: 'Decorated' },
  { id: 'favourites', name: 'Favourites' },
  { id: 'recent', name: 'Recent' },
];
