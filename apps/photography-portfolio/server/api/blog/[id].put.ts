// Edit a post. A slug change moves the slug pointer in the same transaction.
// Trashed posts keep status "deleted" here; restoring goes through toggle-status.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const fields = blogFields(await readObject(event), true)
  const current = await dbGet(keys.post(id).PK, keys.post(id).SK)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })
  if (current.status === 'deleted') delete fields.status

  const now = nowIso()
  const merged: DbItem = { ...current, ...fields, updatedAt: now }
  if ('category_id' in fields) Object.assign(merged, await categoryAttrs(fields.category_id as string | undefined))
  merged.slug ||= slugify(merged.title)
  if (!merged.slug) throw bad('Could not build a slug from the title')
  const post = withPublished(merged, PUBLISHED.blog, blogIsPublic(merged))

  if (post.slug === current.slug) {
    await dbPut(post, 'replace')
  } else {
    await dbTransact([
      { put: post },
      { delete: keys.slug(current.slug) },
      { put: { ...keys.slug(post.slug), type: 'slug', id, createdAt: now, updatedAt: now, ttl: post.ttl }, create: true },
    ], 'That slug is already used by another post.')
  }
  return toApi(post)
})
