// Public contact form: store the message, then email the owner. Honeypot-filled posts are
// accepted silently and dropped.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const body = await readObject(event)
  if (body.botcheck) return { success: true }

  const name = str(body.name, 'name', { required: true, max: 120 })!
  const email = str(body.email, 'email', { required: true, max: 254, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ })!
  const message = str(body.message, 'message', { required: true, max: 5000 })!

  const id = crypto.randomUUID()
  const now = nowIso()
  await dbPut({
    PK: 'MESSAGE', SK: `MSG#${id}`, GSI1PK: 'MESSAGE', GSI1SK: now,
    type: 'message', id, name, email, message, createdAt: now, updatedAt: now,
  }, 'create')

  try {
    await notifyOwner({
      subject: `New inquiry from ${name} (LensCraft)`,
      replyTo: email,
      fields: [['Name', name], ['Email', email], ['Message', message]],
    })
  } catch (e: any) {
    // The message is already saved; log only the error type, never the visitor's data.
    console.error('Contact notification failed:', e?.name ?? 'unknown')
  }
  return { success: true }
})
