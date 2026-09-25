// Admin dashboard counters. "Total views" = sum of blog post view counters.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const byPk = (pk: string) => ({ KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': pk } })
  const [posts, totalPortfolio, totalTestimonials] = await Promise.all([
    dbQuery({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': 'BLOG', ':sk': 'POST#' },
      ProjectionExpression: 'views',
    }),
    dbCount(byPk('PORTFOLIO')),
    dbCount(byPk('TESTIMONIAL')),
  ])
  return {
    totalPosts: posts.length,
    totalPortfolio,
    totalTestimonials,
    totalViews: posts.reduce((sum, p) => sum + (Number(p.views) || 0), 0),
  }
})
