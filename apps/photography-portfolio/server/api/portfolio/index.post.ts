export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const fields = portfolioFields(await readObject(event))
  const id = crypto.randomUUID()
  const now = nowIso()
  const item = withPublished({
    ...keys.portfolio(id), type: 'portfolioItem', id,
    ...fields, ...await categoryAttrs(fields.category_id as string),
    createdAt: now, updatedAt: now,
  }, PUBLISHED.portfolio, fields.status === 'published')
  await dbPut(item, 'create')
  return toApi(item)
})
