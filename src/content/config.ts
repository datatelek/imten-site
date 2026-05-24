// Схемы Astro Content Collections для imten.ru.
// Жёстко фиксируют форму frontmatter — компоненты опираются на эти типы.

import { defineCollection, z } from "astro:content";

// Переиспользуемые подсхемы
const cta = z.object({
  label: z.string(),
  href: z.string(),
  primary: z.boolean().optional(),
  icon: z.string().optional(),
});

const metric = z.object({
  value: z.string(),
  label: z.string(),
  growth: z.string().optional(),
});

const hero = z.object({
  h1: z.string(),
  subtitle: z.string().optional(),
  ctas: z.array(cta).optional().default([]),
  metrics: z.array(metric).optional().default([]),
});

const seo = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  noindex: z.boolean().optional().default(false),
});

const includedItem = z.object({
  title: z.string(),
  desc: z.string(),
  icon: z.string().optional(),
});

const processStep = z.object({
  num: z.number(),
  title: z.string(),
  desc: z.string(),
  days: z.string().optional(),
});

const pricingPlan = z.object({
  name: z.string(),
  price: z.string(),
  target: z.string().optional(),
  features: z.array(z.string()),
  highlighted: z.boolean().optional().default(false),
});

const pricing = z.object({
  intro: z.string().optional(),
  plans: z.array(pricingPlan),
});

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

// Коллекция страниц (услуги, индустрии, статичные)
const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    url: z.string().optional(),
    layout: z.enum(["BaseLayout", "ServicePage", "IndustryPage"]).optional(),
    parent: z.string().optional(),
    sortOrder: z.number().optional(),
    draft: z.boolean().optional().default(false),

    seo: seo,
    hero: hero.optional(),

    // Блоки для услуги/индустрии
    pains: z.array(z.string()).optional(),
    included: z.array(includedItem).optional(),
    process: z.array(processStep).optional(),
    pricing: pricing.optional(),
    faq: z.array(faqItem).optional(),
    reviews: z.array(z.string()).optional(),
    relatedCases: z.array(z.string()).optional(),

    // Для главной — карточки услуг
    serviceCards: z
      .array(
        z.object({
          title: z.string(),
          desc: z.string(),
          href: z.string(),
          icon: z.string().optional(),
        })
      )
      .optional(),

    // Для главной — топ-кейсы
    featuredCases: z.array(z.string()).optional(),
  }),
});

// Коллекция кейсов
const cases = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    industry: z.enum(["medical", "realty", "ecommerce", "education", "b2b", "logistics", "other"]),
    services: z.array(z.string()),
    period: z.string().optional(),
    budget: z.string().optional(),
    hero: hero,
    seo: seo,
    draft: z.boolean().optional().default(false),
    sortOrder: z.number().optional().default(100),
    summary: z.string().optional(),
  }),
});

// Коллекция блога
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
    seo: seo.optional(),
  }),
});

export const collections = { pages, cases, blog };
