// it-portfolio entities (keys per docs/data-model.md). Resume sections live in partition SITE so the
// home page is one Query; blog posts and messages have their own partitions.

type Body = Record<string, unknown>
const pick = (body: Body, partial: boolean, k: string) => !partial || has(body, k)
const sortOrder = (v: unknown) => intRange(v, 'sort_order', -100000, 100000, 0)
const LINK = /^(https?:\/\/|mailto:|tel:)[^\s<>"']+$/

export interface Collection {
  type: string
  PK: string
  prefix: string
  fields: (body: Body, partial?: boolean) => Body
}

export const COLLECTIONS: Record<string, Collection> = {
  social_links: {
    type: 'socialLink', PK: 'SITE', prefix: 'SOCIAL',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'platform')) o.platform = str(b.platform, 'platform', { required: true, max: 50 })
      if (pick(b, p, 'url')) o.url = str(b.url, 'url', { required: true, max: 2048, pattern: LINK })
      if (pick(b, p, 'icon_name')) o.icon_name = str(b.icon_name, 'icon_name', { max: 50 })
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  fields: {
    type: 'field', PK: 'SITE', prefix: 'FIELD',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'title')) o.title = str(b.title, 'title', { required: true, max: 200 })
      if (pick(b, p, 'description')) o.description = str(b.description, 'description', { required: true, max: 2000 })
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  education: {
    type: 'education', PK: 'SITE', prefix: 'EDU',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'degree')) o.degree = str(b.degree, 'degree', { required: true, max: 200 })
      if (pick(b, p, 'school')) o.school = str(b.school, 'school', { required: true, max: 200 })
      if (pick(b, p, 'year')) o.year = str(b.year, 'year', { required: true, max: 50 })
      if (pick(b, p, 'description')) o.description = str(b.description, 'description', { max: 2000 })
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  experience: {
    type: 'experience', PK: 'SITE', prefix: 'EXP',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'title')) o.title = str(b.title, 'title', { required: true, max: 200 })
      if (pick(b, p, 'company')) o.company = str(b.company, 'company', { required: true, max: 200 })
      if (pick(b, p, 'period')) o.period = str(b.period, 'period', { required: true, max: 100 })
      if (pick(b, p, 'description')) o.description = str(b.description, 'description', { max: 5000 })
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  skills: {
    type: 'skill', PK: 'SITE', prefix: 'SKILL',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'name')) o.name = str(b.name, 'name', { required: true, max: 100 })
      if (pick(b, p, 'icon_url')) o.icon_url = mediaField(b.icon_url, 'icon_url', 'skills', true)
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  certifications: {
    type: 'certification', PK: 'SITE', prefix: 'CERT',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'name')) o.name = str(b.name, 'name', { required: true, max: 200 })
      if (pick(b, p, 'issuer')) o.issuer = str(b.issuer, 'issuer', { required: true, max: 200 })
      if (pick(b, p, 'date')) o.date = str(b.date, 'date', { required: true, max: 50 })
      if (pick(b, p, 'link')) o.link = str(b.link, 'link', { max: 2048, pattern: LINK })
      if (pick(b, p, 'badge_url')) o.badge_url = mediaField(b.badge_url, 'badge_url', 'certificates')
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      return o
    },
  },
  projects: {
    type: 'project', PK: 'SITE', prefix: 'PROJECT',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'title')) o.title = str(b.title, 'title', { required: true, max: 200 })
      if (pick(b, p, 'description')) o.description = str(b.description, 'description', { required: true, max: 5000 })
      if (pick(b, p, 'image_url')) o.image_url = mediaField(b.image_url, 'image_url', 'projects')
      if (pick(b, p, 'demo_url')) o.demo_url = str(b.demo_url, 'demo_url', { max: 2048, pattern: LINK })
      if (pick(b, p, 'github_url')) o.github_url = str(b.github_url, 'github_url', { required: true, max: 2048, pattern: LINK })
      if (pick(b, p, 'sort_order')) o.sort_order = sortOrder(b.sort_order)
      if (pick(b, p, 'categories')) o.categories = categoryList(b.categories)
      return o
    },
  },
  blog_posts: {
    type: 'blogPost', PK: 'BLOG', prefix: 'POST',
    fields: (b, p = false) => {
      const o: Body = {}
      if (pick(b, p, 'title')) o.title = str(b.title, 'title', { required: true, max: 200 })
      if (pick(b, p, 'slug')) o.slug = str(b.slug, 'slug', { max: 120, pattern: SLUG_RE })
      if (pick(b, p, 'excerpt')) o.excerpt = str(b.excerpt, 'excerpt', { max: 1000 })
      if (pick(b, p, 'content')) o.content = str(b.content, 'content', { required: true, max: 200_000 })
      if (pick(b, p, 'image_url')) o.image_url = mediaField(b.image_url, 'image_url', 'blog-images')
      if (pick(b, p, 'category')) o.category = str(b.category, 'category', { max: 100 })
      if (pick(b, p, 'published')) o.published = b.published === true
      if (pick(b, p, 'published_at')) o.published_at = isoOrUndefined(b.published_at)
      return o
    },
  },
}

export function collection(event: Parameters<typeof getRouterParam>[0]): Collection {
  const name = getRouterParam(event, 'collection') ?? ''
  const c = COLLECTIONS[name]
  if (!c) throw createError({ statusCode: 404, message: 'Unknown collection' })
  return c
}

function categoryList(v: unknown): string[] {
  if (v === undefined || v === null) return []
  if (!Array.isArray(v) || v.length > 20) throw bad('categories must be a list (max 20)')
  return [...new Set(v.map(c => str(c, 'category', { required: true, max: 50 })!))]
}

function isoOrUndefined(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) throw bad('published_at is invalid')
  return d.toISOString()
}

export const PUBLISHED_BLOG = 'BLOG#PUBLISHED'

/** Blog items carry the sparse public index only while published. */
export function withBlogIndex(post: DbItem): DbItem {
  const { GSI1PK: _pk, GSI1SK: _sk, ...rest } = post
  return post.published ? { ...rest, GSI1PK: PUBLISHED_BLOG, GSI1SK: post.published_at || post.createdAt } as DbItem : rest as DbItem
}

export const slugKey = (slug: string) => ({ PK: 'BLOG', SK: `SLUG#${slug}` })

export const bySortOrder = (a: DbItem, b: DbItem) =>
  (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || String(a.createdAt).localeCompare(String(b.createdAt))
