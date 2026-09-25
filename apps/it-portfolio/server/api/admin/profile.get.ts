export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const item = await dbGet('SITE', 'PROFILE')
  return item ? toApi(item) : null
})
