/**
 * Path helpers only. Link titles come from each page's frontmatter via the
 * content collection — never hand-copy titles here.
 */
export function hrefForPageId(id: string): string {
  return id === 'index' ? '/' : `/${id}/`;
}
