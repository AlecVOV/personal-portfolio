// Entity rules for photography-portfolio (keys per docs/data-model.md).

export const STATUSES = ['published', 'hidden'] as const
export const BLOG_TRASH_DAYS = 30

export const keys = {
  category: (id: string) => ({ PK: 'CATEGORY', SK: `CAT#${id}` }),
  portfolio: (id: string) => ({ PK: 'PORTFOLIO', SK: `ITEM#${id}` }),
  testimonial: (id: string) => ({ PK: 'TESTIMONIAL', SK: `T#${id}` }),
  post: (id: string) => ({ PK: 'BLOG', SK: `POST#${id}` }),
  slug: (slug: string) => ({ PK: 'BLOG', SK: `SLUG#${slug}` }),
}

export const PUBLISHED = {
  portfolio: 'PORTFOLIO#PUBLISHED',
  testimonial: 'TESTIMONIAL#PUBLISHED',
  blog: 'BLOG#PUBLISHED',
} as const

/** Denormalized category fields; 400 if the category does not exist. */
export async function categoryAttrs(categoryId: string | undefined) {
  if (!categoryId) return { category_id: undefined, category_name: undefined, category_slug: undefined }
  const c = await dbGet(keys.category(categoryId).PK, keys.category(categoryId).SK)
  if (!c) throw bad('Unknown category')
  return { category_id: categoryId, category_name: c.name, category_slug: c.slug }
}

const pick = (body: Record<string, unknown>, partial: boolean, k: string) => !partial || has(body, k)

export function portfolioFields(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {}
  if (pick(body, partial, 'title')) out.title = str(body.title, 'title', { required: true, max: 200 })
  if (pick(body, partial, 'category_id')) out.category_id = str(body.category_id, 'category', { required: true, pattern: ID_RE })
  if (pick(body, partial, 'image')) out.image = httpsUrl(body.image, 'image', true)
  if (pick(body, partial, 'description')) out.description = str(body.description, 'description', { max: 2000 })
  if (pick(body, partial, 'status')) out.status = oneOf(body.status, 'status', STATUSES, 'published')
  return out
}

export function testimonialFields(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {}
  if (pick(body, partial, 'name')) out.name = str(body.name, 'name', { required: true, max: 120 })
  if (pick(body, partial, 'role')) out.role = str(body.role, 'role', { max: 120 })
  if (pick(body, partial, 'avatar')) out.avatar = httpsUrl(body.avatar, 'avatar')
  if (pick(body, partial, 'rating')) out.rating = intRange(body.rating, 'rating', 1, 5, 5)
  if (pick(body, partial, 'quote')) out.quote = str(body.quote, 'quote', { required: true, max: 2000 })
  if (pick(body, partial, 'status')) out.status = oneOf(body.status, 'status', STATUSES, 'published')
  return out
}

export function blogFields(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {}
  if (pick(body, partial, 'title')) out.title = str(body.title, 'title', { required: true, max: 200 })
  if (pick(body, partial, 'slug')) out.slug = str(body.slug, 'slug', { max: 120, pattern: SLUG_RE })
  if (pick(body, partial, 'content')) out.content = str(body.content, 'content', { required: true, max: 200_000 })
  if (pick(body, partial, 'excerpt')) out.excerpt = str(body.excerpt, 'excerpt', { max: 1000 })
  if (pick(body, partial, 'featured_image')) out.featured_image = httpsUrl(body.featured_image, 'featured image')
  if (pick(body, partial, 'category_id')) out.category_id = str(body.category_id, 'category', { pattern: ID_RE })
  if (pick(body, partial, 'status')) out.status = oneOf(body.status, 'status', STATUSES, 'published')
  return out
}

/** Published and not in the trash. */
export const blogIsPublic = (p: Record<string, any>) => p.status === 'published' && !p.deleted_at
