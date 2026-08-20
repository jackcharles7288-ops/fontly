export interface Category {
  id: string;
  name: string;
}

// Only the category the six cursive styles built in Phase 2 need.
// New categories get added here only when a style that needs them exists.
export const categories: Category[] = [
  { id: 'cursive', name: 'Cursive & Script' },
];
