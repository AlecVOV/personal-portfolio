// Partial update (the admin list also uses this to toggle status).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const fields = testimonialFields(await readObject(event), true)
  const { PK, SK } = keys.testimonial(id)
  const current = await dbGet(PK, SK)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })

  const merged: DbItem = { ...current, ...fields, updatedAt: nowIso() }
  const item = withPublished(merged, PUBLISHED.testimonial, merged.status === 'published')
  await dbPut(item, 'replace')
  return toApi(item)
})
