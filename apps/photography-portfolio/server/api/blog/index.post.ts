export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const fields = blogFields(await readObject(event))
  const slug = (fields.slug as string | undefined) || slugify(fields.title as string)
  if (!slug) throw bad('Could not build a slug from the title')

  const id = crypto.randomUUID()
  const now = nowIso()
  const post = withPublished({
    ...keys.post(id), type: 'blogPost', id, views: 0,
    ...fields, slug, ...await categoryAttrs(fields.category_id as string | undefined),
    createdAt: now, updatedAt: now,
  }, PUBLISHED.blog, blogIsPublic(fields))

  await dbTransact([
    { put: post, create: true },
    { put: { ...keys.slug(slug), type: 'slug', id, createdAt: now, updatedAt: now }, create: true },
  ], 'That slug is already used by another post.')
  return toApi(post)
})
