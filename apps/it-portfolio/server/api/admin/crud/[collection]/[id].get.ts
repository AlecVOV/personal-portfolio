export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const c = collection(event)
  const item = await dbGet(c.PK, `${c.prefix}#${routeId(event)}`)
  if (!item) throw createError({ statusCode: 404, message: 'Not found' })
  return toApi(item)
})
