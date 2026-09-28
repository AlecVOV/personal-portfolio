// Admin: reply to a contact message. The recipient is ALWAYS the stored guest address of that
// message (never taken from the request), so SES only ever mails people who contacted the owner first.
// Body: { id, subject, message }. Marks the message replied on success.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readObject(event)
  const id = str(b.id, 'id', { required: true, pattern: ID_RE })!
  const subject = str(b.subject, 'subject', { required: true, max: 200 })!
  const message = str(b.message, 'message', { required: true, max: 10000 })!

  const msg = await dbGet('MESSAGE', `MSG#${id}`)
  if (!msg) throw createError({ statusCode: 404, message: 'Message not found' })

  try {
    await sendReply({ to: msg.guest_email, subject, message })
  } catch (e: any) {
    console.error('Reply failed:', e?.name ?? 'unknown')
    throw createError({ statusCode: 502, message: 'Could not send the email. Try again later.' })
  }

  const item = { ...msg, replied: true, repliedAt: nowIso(), updatedAt: nowIso() }
  await dbPut(item, 'replace')
  return { success: true }
})
