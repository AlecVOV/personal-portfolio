// Admin: delete one media object under photo/ and its thumbnail if any. Body: { key }.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const key = str((await readObject(event)).key, 'key', { required: true, max: 1024 })!
  await deleteMedia(key)
  await deleteMedia(thumbKeyFor(key))
  return { success: true }
})
