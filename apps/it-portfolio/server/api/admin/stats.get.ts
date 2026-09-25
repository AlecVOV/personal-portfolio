// Admin dashboard counters: one Query for all SITE sections + two COUNT queries.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [site, blog, messages] = await Promise.all([
    dbQuery({
      KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': 'SITE' },
      ProjectionExpression: '#t', ExpressionAttributeNames: { '#t': 'type' },
    }),
    dbCount({ KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)', ExpressionAttributeValues: { ':pk': 'BLOG', ':sk': 'POST#' } }),
    dbCount({ KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': 'MESSAGE' } }),
  ])
  const n = (type: string) => site.filter(i => i.type === type).length
  return {
    projects: n('project'), blog, certifications: n('certification'), skills: n('skill'),
    experience: n('experience'), education: n('education'), fields: n('field'), socialLinks: n('socialLink'), messages,
  }
})
