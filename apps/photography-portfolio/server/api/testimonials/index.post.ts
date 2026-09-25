export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const fields = testimonialFields(await readObject(event))
  const id = crypto.randomUUID()
  const now = nowIso()
  const item = withPublished({
    ...keys.testimonial(id), type: 'testimonial', id, ...fields, createdAt: now, updatedAt: now,
  }, PUBLISHED.testimonial, fields.status === 'published')
  await dbPut(item, 'create')
  return toApi(item)
})
