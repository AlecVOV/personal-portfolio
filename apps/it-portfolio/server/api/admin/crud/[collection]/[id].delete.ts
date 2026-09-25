export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const c = collection(event)
  const key = { PK: c.PK, SK: `${c.prefix}#${routeId(event)}` }

  if (c.type !== 'blogPost') {
    await dbDelete(key.PK, key.SK)
    return { success: true }
  }

  const post = await dbGet(key.PK, key.SK)
  if (!post) throw createError({ statusCode: 404, message: 'Not found' })
  await dbTransact([{ delete: key }, { delete: slugKey(post.slug) }])
  return { success: true }
})
