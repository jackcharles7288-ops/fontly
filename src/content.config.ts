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
  h1Html: z.string().optional(),
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
    // Renders the Decorated wrapper section at the end of the tool. Optional
    // with a false default, so pages that omit it still validate.
    showDecorations: z.boolean().default(false),
    // Renders the Effects combining-mark section. Optional with a false
    // default, so pages that omit it still validate.
    showEffects: z.boolean().default(false),
    // Renders the Combined alphabet+decoration section. Optional with a false
    // default, so pages that omit it still validate.
    showCombined: z.boolean().default(false),
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
