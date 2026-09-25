// Public: published posts, newest first. One Query on the sparse GSI1.
export default defineEventHandler(async () => (await dbPublished(PUBLISHED_BLOG)).map(toApi))
