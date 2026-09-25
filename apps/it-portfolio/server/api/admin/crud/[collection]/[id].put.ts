// Partial update. Blog slug changes move the slug pointer in the same transaction.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const c = collection(event)
  const id = routeId(event)
  const fields = c.fields(await readObject(event), true)
  const current = await dbGet(c.PK, `${c.prefix}#${id}`)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })

  const now = nowIso()
  const merged: DbItem = { ...current, ...fields, updatedAt: now }

  if (c.type !== 'blogPost') {
    await dbPut(merged, 'replace')
    return toApi(merged)
  }

  merged.slug ||= slugify(merged.title)
  if (!merged.slug) throw bad('Could not build a slug from the title')
  const post = withBlogIndex(merged)
  if (post.slug === current.slug) {
    await dbPut(post, 'replace')
  } else {
    await dbTransact([
      { put: post },
      { delete: slugKey(current.slug) },
      { put: { ...slugKey(post.slug), type: 'slug', id, createdAt: now, updatedAt: now }, create: true },
    ], 'That slug is already used by another post.')
  }
  return toApi(post)
})
