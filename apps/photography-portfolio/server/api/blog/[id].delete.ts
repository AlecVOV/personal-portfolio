// Soft delete: moves the post to the trash; DynamoDB TTL removes it (and its slug pointer)
// after BLOG_TRASH_DAYS unless it is restored with toggle-status.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const current = await dbGet(keys.post(id).PK, keys.post(id).SK)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })

  const now = nowIso()
  const ttl = Math.floor(Date.now() / 1000) + BLOG_TRASH_DAYS * 24 * 60 * 60
  const post = withPublished<DbItem>({ ...current, status: 'deleted', deleted_at: now, ttl, updatedAt: now }, PUBLISHED.blog, false)
  await dbTransact([
    { put: post },
    { put: { ...keys.slug(post.slug), type: 'slug', id, createdAt: current.createdAt, updatedAt: now, ttl } },
  ])
  return toApi(post)
})
