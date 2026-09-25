// Admin: files in one bucket (it/<bucket>/). `name` is the bucket-relative path.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const bucket = bucketParam(getQuery(event).bucket)
  const prefix = `${MEDIA_PREFIX}${bucket}/`
  return (await listMedia(prefix))
    .map(o => ({ name: o.key.slice(prefix.length), key: o.key, url: mediaUrl(o.key), bytes: o.bytes, lastModified: o.lastModified }))
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
})
