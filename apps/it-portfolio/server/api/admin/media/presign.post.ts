// Admin: presigned PUT for one file. Body: { bucket, contentType, size }. Images are resized
// in the browser first; PDFs (resume/CV) are uploaded as-is.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readObject(event)
  const bucket = bucketParam(body.bucket)
  const contentType = oneOf(body.contentType, 'contentType', Object.keys(FILE_TYPES))
  const size = intRange(body.size, 'size', 1, MAX_UPLOAD_BYTES, 0)
  if (!size) throw bad('size is required')

  const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${FILE_TYPES[contentType]}`
  return { ...await presignPut(`${MEDIA_PREFIX}${bucket}/${path}`, contentType, size), path }
})
