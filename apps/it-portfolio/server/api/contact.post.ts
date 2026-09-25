// Public contact form: store the message, then email the owner (Reply-To = visitor).
// A filled honeypot field is accepted silently and dropped.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const body = await readObject(event)
  if (body.botcheck) return { success: true }

  const guest_name = str(body.name, 'name', { required: true, max: 120 })!
  const guest_email = str(body.email, 'email', { required: true, max: 254, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ })!
  const message = str(body.message, 'message', { required: true, max: 5000 })!

  const id = crypto.randomUUID()
  const now = nowIso()
  await dbPut({
    PK: 'MESSAGE', SK: `MSG#${id}`, GSI1PK: 'MESSAGE', GSI1SK: now,
    type: 'message', id, guest_name, guest_email, message, replied: false, createdAt: now, updatedAt: now,
  }, 'create')

  try {
    await notifyOwner({
      subject: `New Portfolio Message from ${guest_name}`,
      replyTo: guest_email,
      fields: [['Name', guest_name], ['Email', guest_email], ['Message', message]],
    })
  } catch (e: any) {
    // Saved already (visible in /admin/messages); log only the error type, never visitor data.
    console.error('Contact notification failed:', e?.name ?? 'unknown')
  }
  return { success: true }
})
