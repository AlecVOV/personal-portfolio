// Public: published portfolio items, newest first. One Query on the sparse GSI1.
export default defineEventHandler(async () => (await dbPublished(PUBLISHED.portfolio)).map(toApi))
