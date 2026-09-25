export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const c = collection(event)
  const fields = c.fields(await readObject(event))
  const id = crypto.randomUUID()
  const now = nowIso()
  const item: DbItem = { PK: c.PK, SK: `${c.prefix}#${id}`, type: c.type, id, ...fields, createdAt: now, updatedAt: now }

  if (c.type !== 'blogPost') {
    await dbPut(item, 'create')
    return toApi(item)
  }

  item.slug ||= slugify(item.title)
  if (!item.slug) throw bad('Could not build a slug from the title')
  const post = withBlogIndex(item)
  await dbTransact([
    { put: post, create: true },
    { put: { ...slugKey(post.slug), type: 'slug', id, createdAt: now, updatedAt: now }, create: true },
  ], 'That slug is already used by another post.')
  return toApi(post)
})
