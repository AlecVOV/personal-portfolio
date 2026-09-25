// Admin: contact messages, newest first (GSI1 partition MESSAGE).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return (await dbPublished('MESSAGE')).map(toApi)
})
