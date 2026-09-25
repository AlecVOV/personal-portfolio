// Admin: every portfolio item (any status), newest first.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await dbQuery({ KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': 'PORTFOLIO' } })
  return items.sort(newestFirst).map(toApi)
})
