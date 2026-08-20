import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

// Astro 7 reserves `slug` for entry id generation, so it cannot appear in
// the Zod schema. Frontmatter may still include `slug`; it becomes entry.id.
// See Phase 1 report for the difference from content.mdc.
const pageFields = {
  title: z.string().max(60),
  h1: z.string(),
  description: z.string().max(155),
  primaryKeyword: z.string(),
  faq: z.array(faqItem),
  relatedTools: z.array(z.string()),
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date(),
};

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    ...pageFields,
    toolCategories: z.array(z.string()),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    ...pageFields,
    date: z.coerce.date(),
  }),
});

export const collections = { pages, blog };
