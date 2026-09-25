export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { PK, SK } = keys.portfolio(routeId(event))
  await dbDelete(PK, SK)
  return { success: true }
})
