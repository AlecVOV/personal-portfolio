// Partial update of the singleton profile (created on first save).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readObject(event)
  const p = (k: string) => has(b, k)
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  const fields: Record<string, unknown> = {}
  if (p('full_name')) fields.full_name = str(b.full_name, 'full_name', { required: true, max: 200 })
  if (p('title')) fields.title = str(b.title, 'title', { required: true, max: 200 })
  if (p('bio')) fields.bio = str(b.bio, 'bio', { max: 5000 })
  if (p('email_1')) fields.email_1 = str(b.email_1, 'email_1', { max: 254, pattern: EMAIL })
  if (p('email_2')) fields.email_2 = str(b.email_2, 'email_2', { max: 254, pattern: EMAIL })
  if (p('phone')) fields.phone = str(b.phone, 'phone', { max: 50 })
  if (p('location')) fields.location = str(b.location, 'location', { max: 200 })
  if (p('map_embed')) fields.map_embed = httpsUrl(b.map_embed, 'map_embed')
  if (p('avatar_url')) fields.avatar_url = mediaField(b.avatar_url, 'avatar_url', 'avatars')
  if (p('resume_url')) fields.resume_url = mediaField(b.resume_url, 'resume_url', 'resumes')
  if (p('cv_url')) fields.cv_url = mediaField(b.cv_url, 'cv_url', 'cv')

  const now = nowIso()
  const current = await dbGet('SITE', 'PROFILE')
  const item: DbItem = current
    ? { ...current, ...fields, updatedAt: now }
    : { PK: 'SITE', SK: 'PROFILE', type: 'profile', id: crypto.randomUUID(), ...fields, createdAt: now, updatedAt: now }
  if (!item.full_name || !item.title) throw bad('full_name and title are required')
  await dbPut(item)
  return toApi(item)
})
