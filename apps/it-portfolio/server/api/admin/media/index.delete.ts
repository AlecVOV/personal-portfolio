// Admin: delete one object under it/. Body: { key }.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const key = str((await readObject(event)).key, 'key', { required: true, max: 1024 })!
  await deleteMedia(key)
  return { success: true }
})
