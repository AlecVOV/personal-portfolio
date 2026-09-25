// Partial update (the admin list also uses this to toggle status).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const fields = portfolioFields(await readObject(event), true)
  const { PK, SK } = keys.portfolio(id)
  const current = await dbGet(PK, SK)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })

  const merged: DbItem = { ...current, ...fields, updatedAt: nowIso() }
  if ('category_id' in fields) Object.assign(merged, await categoryAttrs(fields.category_id as string))
  const item = withPublished(merged, PUBLISHED.portfolio, merged.status === 'published')
  await dbPut(item, 'replace')
  return toApi(item)
})
