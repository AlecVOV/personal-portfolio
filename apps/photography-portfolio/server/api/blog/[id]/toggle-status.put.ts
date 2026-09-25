// Publish / hide / restore from trash. Clears the trash TTL on the post and its slug pointer.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const status = oneOf((await readObject(event)).status, 'status', STATUSES)
  const current = await dbGet(keys.post(id).PK, keys.post(id).SK)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })

  const now = nowIso()
  const { deleted_at: _d, ttl: _t, ...rest } = current
  const post = withPublished({ ...rest, status, updatedAt: now } as DbItem, PUBLISHED.blog, status === 'published')
  await dbTransact([
    { put: post },
    { put: { ...keys.slug(post.slug), type: 'slug', id, createdAt: current.createdAt, updatedAt: now } },
  ])
  return toApi(post)
})
