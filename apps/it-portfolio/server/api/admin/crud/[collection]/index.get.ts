// Admin: every item of one collection (drafts included).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const c = collection(event)
  const items = await dbQuery({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': c.PK, ':sk': `${c.prefix}#` },
  })
  return items.sort(bySortOrder).map(toApi)
})
