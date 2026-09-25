// Admin: media library = objects under photo/ (thumbnails are attached to their original).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const objects = await listMedia()
  const keys = new Set(objects.map(o => o.key))
  return objects
    .filter(o => !/\.thumb\.[a-z0-9]+$/i.test(o.key))
    .map(o => ({
      ...o,
      name: o.key.split('/').pop(),
      url: mediaUrl(o.key),
      thumbUrl: keys.has(thumbKeyFor(o.key)) ? mediaUrl(thumbKeyFor(o.key)) : mediaUrl(o.key),
    }))
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
})
