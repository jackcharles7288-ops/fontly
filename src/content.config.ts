import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

// Astro 7 reserves `slug` for entry id generation, so it cannot appear in
// the Zod schema. The URL comes from the filename instead.
const pageFields = {
  title: z.string().max(60),
  h1: z.string(),
  description: z.string().max(155),
  primaryKeyword: z.string(),
  faq: z.array(faqItem).default([]),
  relatedTools: z.array(z.string()).default([]),
  publishedDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
};

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    ...pageFields,
    toolCategories: z.array(z.string()),
    testPhrase: z.string().optional(),
    heroIntro: z.string().optional(),
    heroIntroBelow: z.string().optional(),
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
