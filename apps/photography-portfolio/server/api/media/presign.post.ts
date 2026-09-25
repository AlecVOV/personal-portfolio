// Admin: presigned PUT URLs for one resized image (+ optional 800px thumbnail of the same type).
// Body: { contentType, size, thumbSize? } — the browser resizes before calling this.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readObject(event)
  const contentType = oneOf(body.contentType, 'contentType', Object.keys(IMAGE_TYPES))
  const size = intRange(body.size, 'size', 1, MAX_UPLOAD_BYTES, 0)
  if (!size) throw bad('size is required')
  const thumbSize = intRange(body.thumbSize, 'thumbSize', 1, MAX_UPLOAD_BYTES, 0)

  const key = `${UPLOAD_PREFIX}${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${IMAGE_TYPES[contentType]}`
  return {
    full: await presignPut(key, contentType, size),
    thumb: thumbSize ? await presignPut(thumbKeyFor(key), contentType, thumbSize) : undefined,
  }
})
