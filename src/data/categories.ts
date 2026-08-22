export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: 'cursive', name: 'Cursive & Script' },
  { id: 'bold', name: 'Bold' },
  { id: 'bubble', name: 'Bubble' },
  { id: 'gothic', name: 'Gothic' },
  { id: 'other', name: 'Other' },
];
