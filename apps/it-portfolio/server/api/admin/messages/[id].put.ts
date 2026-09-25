// Admin: mark a message replied / not replied. Body: { replied: boolean }.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { replied } = await readObject(event)
  if (typeof replied !== 'boolean') throw bad('replied must be true or false')
  const current = await dbGet('MESSAGE', `MSG#${id}`)
  if (!current) throw createError({ statusCode: 404, message: 'Not found' })
  const item = { ...current, replied, updatedAt: nowIso() }
  await dbPut(item, 'replace')
  return toApi(item)
})
