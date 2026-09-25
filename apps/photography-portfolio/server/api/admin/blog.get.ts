// Admin: every post (published, hidden, trashed), newest first.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await dbQuery({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': 'BLOG', ':sk': 'POST#' },
  })
  return items.sort(newestFirst).map(toApi)
})
