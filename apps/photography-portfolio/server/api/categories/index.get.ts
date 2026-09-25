// Public: all categories, sorted by name. One Query.
export default defineEventHandler(async () => {
  const items = await dbQuery({ KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': 'CATEGORY' } })
  return items.map(toApi).sort((a, b) => String(a.name).localeCompare(String(b.name)))
})
